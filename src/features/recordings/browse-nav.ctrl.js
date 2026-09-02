import {
  buildPreparedRecordingsDayResult,
  buildRecordingsDayCacheKey,
  mergeRecordingDayChunks,
  resolveCommittedRecordingsDayState,
  resolvePreparedRecordingsDayTransition,
  resolveCachedRecordingsAvailability,
  resolveFailedRecordingsAvailabilityState,
  resolveFetchedRecordingsAvailabilityState,
} from "./utils/availability.js";
import {
  resolveRecordingsBrowseNavProbePlan,
  resolveRecordingsBrowseNavState,
} from "./utils/browse-nav.js";
import {
  buildRecordingsDayFetchChunks,
  resolveOffsetRecordingsDayBounds,
  resolveRecordingsDayBounds,
} from "./utils/day.js";
import { resolvePreparedRecordingsDayNavigationState } from "./utils/swipe.js";
import {
  cameraMemberEntities,
  isCameraGroup,
} from "../camera-groups/model.js";

export class RecordingsBrowseNavController {
  constructor(host) {
    this._host = host;
    this._scheduledBrowseNavKey = "";
    this._activeBrowseNavKey = "";
    this._lastBrowseNavKey = "";
    this._lastBrowseNavPrevious = null;
    this._lastBrowseNavNext = null;
  }

  _swipeController() {
    return this._host._recordingsSwipeController || null;
  }

  _recordingsDayBounds(tsSec = null) {
    if (this._host._recordingsDayBounds) {
      return this._host._recordingsDayBounds(tsSec);
    }
    return resolveRecordingsDayBounds({
      tsSec,
      fallbackSec: this._host._winEnd,
      getTzParts: (target) => this._host._tzParts(target),
      toEpochSeconds: (year, month, day, hour, minute, second) =>
        this._host._tzDateTimeToEpochSeconds(
          year,
          month,
          day,
          hour,
          minute,
          second,
        ),
    });
  }

  _recordingsOffsetDayBounds(offsetDays = 0) {
    if (this._host._recordingsOffsetDayBounds) {
      return this._host._recordingsOffsetDayBounds(offsetDays);
    }
    return resolveOffsetRecordingsDayBounds({
      offsetDays,
      fallbackSec: this._host._winEnd,
      getTzParts: (target) => this._host._tzParts(target),
      toEpochSeconds: (year, month, day, hour, minute, second) =>
        this._host._tzDateTimeToEpochSeconds(
          year,
          month,
          day,
          hour,
          minute,
          second,
        ),
    });
  }

  _recordingsDataCache() {
    if (!this._host._recordingsDayDataCache) {
      this._host._recordingsDayDataCache = new Map();
    }
    return this._host._recordingsDayDataCache;
  }

  _recordingsAvailabilityCache() {
    if (!this._host._recordingsDayAvailabilityCache) {
      this._host._recordingsDayAvailabilityCache = new Map();
    }
    return this._host._recordingsDayAvailabilityCache;
  }

  _recordingsFetchedAtCache() {
    if (!this._host._recordingsDayFetchedAtCache) {
      this._host._recordingsDayFetchedAtCache = new Map();
    }
    return this._host._recordingsDayFetchedAtCache;
  }

  _recordingsRequestCache() {
    if (!this._host._recordingsDayRequestCache) {
      this._host._recordingsDayRequestCache = new Map();
    }
    return this._host._recordingsDayRequestCache;
  }

  _recordingContexts() {
    const camera = this._host._activeCam;
    const entities = cameraMemberEntities(camera);
    return entities
      .map((entity, index) => {
        const cache = this._host._camCache?.[entity];
        if (!cache?.clientId || !cache?.cam) return null;
        return {
          entity,
          member: index === 0 ? "A" : "B",
          clientId: cache.clientId,
          cam: cache.cam,
          cache,
        };
      })
      .filter(Boolean);
  }

  _groupRecordingCacheIdentity() {
    const contexts = this._recordingContexts();
    if (!isCameraGroup(this._host._activeCam) || contexts.length < 2) {
      const { clientId = "", cam = "" } = contexts[0] || this._host._cc();
      return { clientId, cam, contexts };
    }
    return {
      clientId: "camera-group",
      cam: contexts
        .map(({ clientId, cam }) => `${clientId}:${cam}`)
        .join("+"),
      contexts,
    };
  }

  _tagRecordings(recordings, context) {
    return (Array.isArray(recordings) ? recordings : []).map((recording) => ({
      ...recording,
      _fvc_camera_entity: context.entity,
      _fvc_group_member: context.member,
    }));
  }

  async _fetchActiveRecordingContexts(bounds) {
    const { contexts } = this._groupRecordingCacheIdentity();
    const results = await Promise.allSettled(
      contexts.map((context) =>
        this.fetchRecordingsInBounds(
          bounds,
          context.clientId,
          context.cam,
        ),
      ),
    );
    return contexts
      .flatMap((context, index) =>
        results[index]?.status === "fulfilled"
          ? this._tagRecordings(results[index].value, context)
          : [],
      )
      .sort(
        (left, right) =>
          Number(left?.start_time || 0) - Number(right?.start_time || 0),
      );
  }

  async _hasActiveRecordingContexts(bounds) {
    const { contexts } = this._groupRecordingCacheIdentity();
    if (!contexts.length) return false;
    const results = await Promise.allSettled(
      contexts.map((context) =>
        this.hasRecordingsInBounds(
          bounds,
          context.clientId,
          context.cam,
        ),
      ),
    );
    return results.some(
      (result) => result.status === "fulfilled" && result.value === true,
    );
  }

  async fetchRecordingsInBounds(
    bounds,
    clientId,
    cam,
    { forceRefresh = false } = {},
  ) {
    if (!bounds || !clientId || !cam) return [];
    const key = buildRecordingsDayCacheKey(clientId, cam, bounds);
    const dataCache = this._recordingsDataCache();
    if (!forceRefresh && dataCache.has(key)) {
      return dataCache.get(key) || [];
    }

    const requestCache = this._recordingsRequestCache();
    if (requestCache.has(key)) return await requestCache.get(key);

    const request = (async () => {
      const recordings = await this._host._ws({
        type: "frigate/recordings/get",
        instance_id: clientId,
        camera: cam,
        after: Math.max(0, bounds.start),
        before: bounds.end,
      });
      const fetched = resolveFetchedRecordingsAvailabilityState(recordings);
      dataCache.set(key, fetched.recordings);
      this._recordingsAvailabilityCache().set(
        key,
        fetched.availabilityValue,
      );
      this._recordingsFetchedAtCache().set(key, Date.now());
      return fetched.recordings;
    })();
    requestCache.set(key, request);
    try {
      return await request;
    } finally {
      if (requestCache.get(key) === request) requestCache.delete(key);
    }
  }

  async fetchRecordingsInBoundsProgressively(
    bounds,
    clientId,
    cam,
    { before = null, chunkSeconds = 6 * 60 * 60, onProgress = null } = {},
  ) {
    if (!bounds || !clientId || !cam) return [];
    const key = buildRecordingsDayCacheKey(clientId, cam, bounds);
    const dataCache = this._recordingsDataCache();
    if (dataCache.has(key)) return dataCache.get(key) || [];

    const requestCache = this._recordingsRequestCache();
    if (requestCache.has(key)) return await requestCache.get(key);

    const chunks = buildRecordingsDayFetchChunks({
      bounds,
      before,
      chunkSeconds,
    });
    const request = (async () => {
      let accumulated = [];
      let completedChunks = 0;
      try {
        for (const [index, chunk] of chunks.entries()) {
          const response = await this._host._ws({
            type: "frigate/recordings/get",
            instance_id: clientId,
            camera: cam,
            after: Math.max(0, chunk.start),
            before: chunk.end,
          });
          accumulated = mergeRecordingDayChunks(accumulated, response);
          completedChunks += 1;
          const complete = index === chunks.length - 1;
          if (complete) {
            dataCache.set(key, accumulated);
            this._recordingsAvailabilityCache().set(
              key,
              accumulated.length > 0,
            );
            this._recordingsFetchedAtCache().set(key, Date.now());
          }
          if ((accumulated.length || complete) && onProgress) {
            try {
              onProgress(accumulated, {
                chunk,
                completedChunks,
                totalChunks: chunks.length,
                complete,
              });
            } catch (_) {}
          }
        }
      } catch (error) {
        if (!completedChunks) throw error;
      }

      if (!chunks.length) {
        dataCache.set(key, []);
        this._recordingsAvailabilityCache().set(key, false);
        this._recordingsFetchedAtCache().set(key, Date.now());
        if (onProgress) {
          try {
            onProgress([], {
              chunk: null,
              completedChunks: 0,
              totalChunks: 0,
              complete: true,
            });
          } catch (_) {}
        }
      }
      return accumulated;
    })();
    requestCache.set(key, request);
    try {
      return await request;
    } finally {
      if (requestCache.get(key) === request) requestCache.delete(key);
    }
  }

  async hasRecordingsInBounds(bounds, clientId, cam) {
    const key = buildRecordingsDayCacheKey(clientId, cam, bounds);
    const cached = resolveCachedRecordingsAvailability({
      key,
      dataCache: this._recordingsDataCache(),
      availabilityCache: this._recordingsAvailabilityCache(),
    });
    if (cached.found) {
      if (cached.shouldSyncAvailability) {
        this._recordingsAvailabilityCache().set(key, cached.hasRecordings);
      }
      return cached.hasRecordings;
    }
    try {
      const recordings = await this.fetchRecordingsInBounds(
        bounds,
        clientId,
        cam,
      );
      return recordings.length > 0;
    } catch (_) {
      const failed = resolveFailedRecordingsAvailabilityState();
      this._recordingsAvailabilityCache().set(
        key,
        failed.availabilityValue,
      );
      return failed.hasRecordings;
    }
  }

  async prepareDayTransition(direction) {
    const bounds = this._recordingsOffsetDayBounds(direction);
    const today = this._recordingsDayBounds(Math.floor(Date.now() / 1000));
    const { clientId, cam, contexts } = this._groupRecordingCacheIdentity();
    const prepared = resolvePreparedRecordingsDayTransition({
      direction,
      bounds,
      todayBounds: today,
      clientId,
      camera: cam,
      dataCache: this._host._recordingsDayDataCache,
    });
    if (prepared.done) {
      return prepared.result;
    }

    const key = prepared.key;
    let recordings = [];
    try {
      recordings =
        contexts.length > 1
          ? await this._fetchActiveRecordingContexts(bounds)
          : await this.fetchRecordingsInBounds(bounds, clientId, cam);
    } catch (_) {
      return { hasData: false, bounds, recs: [] };
    }
    const result = buildPreparedRecordingsDayResult(bounds, recordings);
    this._recordingsDataCache().set(key, result.recs);
    this._recordingsAvailabilityCache().set(key, result.hasData);
    return result;
  }

  _browseNavContextKey({ requireData = true } = {}) {
    if (this._host._tab !== "recordings") return "";
    const { clientId, cam, contexts } = this._groupRecordingCacheIdentity();
    if (!clientId || !cam) return "";
    const bounds = this._recordingsDayBounds();
    const key = buildRecordingsDayCacheKey(clientId, cam, bounds);
    if (!requireData) return key;
    if (contexts.length <= 1) {
      return this._recordingsDataCache().has(key) ? key : "";
    }
    const allMembersResolved = contexts.every((context) =>
      this._recordingsDataCache().has(
        buildRecordingsDayCacheKey(
          context.clientId,
          context.cam,
          bounds,
        ),
      ),
    );
    return allMembersResolved || this._recordingsDataCache().has(key)
      ? key
      : "";
  }

  _browseNavNodes() {
    return {
      previous: this._host._pageShellRegionElement(
        "browseHeader",
        "#rec-day-prev",
      ),
      next: this._host._pageShellRegionElement(
        "browseHeader",
        "#rec-day-next",
      ),
    };
  }

  prepareBrowseNav() {
    const key = this._browseNavContextKey({ requireData: false });
    const { previous, next } = this._browseNavNodes();
    const alreadyResolved =
      !!key &&
      key === this._lastBrowseNavKey &&
      previous === this._lastBrowseNavPrevious &&
      next === this._lastBrowseNavNext;
    if (alreadyResolved) return;
    if (previous) previous.disabled = true;
    if (next) next.disabled = true;
  }

  scheduleBrowseNavUpdate() {
    const key = this._browseNavContextKey();
    const { previous, next } = this._browseNavNodes();
    const alreadyResolved =
      key === this._lastBrowseNavKey &&
      previous === this._lastBrowseNavPrevious &&
      next === this._lastBrowseNavNext;
    if (
      !key ||
      key === this._scheduledBrowseNavKey ||
      key === this._activeBrowseNavKey ||
      alreadyResolved
    ) {
      return false;
    }

    this._scheduledBrowseNavKey = key;
    void Promise.resolve().then(async () => {
      if (this._scheduledBrowseNavKey !== key) return;
      this._scheduledBrowseNavKey = "";
      if (this._browseNavContextKey() !== key) return;
      this._activeBrowseNavKey = key;
      try {
        await this.updateBrowseNav();
        if (this._browseNavContextKey() === key) {
          this._lastBrowseNavKey = key;
          const resolvedNodes = this._browseNavNodes();
          this._lastBrowseNavPrevious = resolvedNodes.previous;
          this._lastBrowseNavNext = resolvedNodes.next;
        }
      } finally {
        if (this._activeBrowseNavKey === key) this._activeBrowseNavKey = "";
      }
    }).catch(() => {});
    return true;
  }

  async navigateDayAnimated(direction) {
    if (this._host._tab !== "recordings") return false;
    const dir = Number(direction);
    if (dir !== -1 && dir !== 1) return false;
    if (this._host._recordingsDayNavAnimating) return false;

    this._host._recordingsDayNavAnimating = true;
    try {
      const prep = await this.prepareDayTransition(dir);
      const navigation = resolvePreparedRecordingsDayNavigationState({
        prep,
        renderRecordings: (recordings) =>
          this._host._recordingsListMarkup(
            this._host._recordingsViewRows(recordings),
          ),
      });
      if (navigation.shouldBounce) {
        const swipeController = this._swipeController();
        if (swipeController) swipeController.bounceArea(dir);
        else this._host._bounceRecordingsArea(dir);
        void this.updateBrowseNav();
        return false;
      }

      const swipeController = this._swipeController();
      const stage = swipeController
        ? swipeController.createStage(dir, navigation.incomingHtml)
        : this._host._createRecordingsSwipeStage(dir, navigation.incomingHtml);
      if (!stage) {
        await (this._host._commitRecordingsDayTransition?.(
          navigation.bounds,
          navigation.recs,
        ) ?? this.commitDayTransition(navigation.bounds, navigation.recs));
        return true;
      }

      await new Promise((resolve) => requestAnimationFrame(resolve));
      await new Promise((resolve) => requestAnimationFrame(resolve));

      if (swipeController) {
        await swipeController.animateStageTo(
          stage,
          -dir * stage.width,
          320,
          "cubic-bezier(0.28, 0.02, 0.18, 1)",
        );
      } else {
        await this._host._animateRecordingsSwipeStageTo(
          stage,
          -dir * stage.width,
          320,
          "cubic-bezier(0.28, 0.02, 0.18, 1)",
        );
      }
      await (this._host._commitRecordingsDayTransition?.(
        navigation.bounds,
        navigation.recs,
      ) ?? this.commitDayTransition(navigation.bounds, navigation.recs));
      return true;
    } finally {
      this._host._recordingsDayNavAnimating = false;
    }
  }

  async commitDayTransition(bounds, recordings) {
    if (!bounds) return;
    const { clientId, cam, contexts } = this._groupRecordingCacheIdentity();
    const committed = resolveCommittedRecordingsDayState({
      bounds,
      recordings,
      clientId,
      camera: cam,
    });
    this._host._followNowWindow = false;
    this._host._winStart = committed.bounds.start;
    this._host._winEnd = committed.bounds.end;
    this._host._exhausted = false;
    this._host._browseWindowLoaderController?.pruneNonActiveCamWindowCaches?.() ??
      this._host._pruneNonActiveCamWindowCaches?.();
    this._host._recordings = committed.recordings;
    if (committed.key) {
      this._host._recordingsDayDataCache.set(
        committed.key,
        this._host._recordings,
      );
      this._host._recordingsDayAvailabilityCache.set(
        committed.key,
        committed.hasRecordings,
      );
    }
    if (contexts.length > 1) {
      for (const context of contexts) {
        context.cache.recordings = this._host._recordings
          .filter(
            (recording) =>
              recording?._fvc_camera_entity === context.entity,
          )
          .map(
            ({
              _fvc_camera_entity: _entity,
              _fvc_group_member: _member,
              ...recording
            }) => recording,
          );
      }
    } else {
      this._host._browseWindowLoaderController?.cacheActiveCamSlice?.(
        "recordings",
        this._host._recordings,
      ) ??
        this._host._cacheActiveCamSlice?.(
          "recordings",
          this._host._recordings,
        );
    }
    this._host._renderListLabel(this._host._winEnd);
    const swipeController = this._swipeController();
    if (swipeController) swipeController.clearListState();
    else this._host._clearRecordingsSwipeListState();
    this._host._lastRenderedListHtml = "";
    this._host._renderList();
  }

  async stepDay(direction) {
    return this.navigateDayAnimated(direction);
  }

  async updateBrowseNav() {
    if (this._host._tab !== "recordings") return;
    const prev = this._host._pageShellRegionElement(
      "browseHeader",
      "#rec-day-prev",
    );
    const next = this._host._pageShellRegionElement(
      "browseHeader",
      "#rec-day-next",
    );
    if (!prev || !next) return;

    const { clientId, cam, contexts } = this._groupRecordingCacheIdentity();
    const current = this._recordingsDayBounds();
    const today = this._recordingsDayBounds(Math.floor(Date.now() / 1000));
    const probePlan = resolveRecordingsBrowseNavProbePlan({
      clientId,
      camera: cam,
      currentBounds: current,
      todayBounds: today,
      prevBounds: this._recordingsOffsetDayBounds(-1),
      nextBounds: this._recordingsOffsetDayBounds(1),
    });
    if (!probePlan.hasContext) {
      prev.disabled = probePlan.initialState.prevDisabled;
      next.disabled = probePlan.initialState.nextDisabled;
      return;
    }

    const token = ++this._host._recordingsNavUpdateToken;
    prev.disabled = true;
    next.disabled = true;
    const hasPrev =
      contexts.length > 1
        ? await this._hasActiveRecordingContexts(probePlan.prevProbeBounds)
        : await this.hasRecordingsInBounds(
            probePlan.prevProbeBounds,
            clientId,
            cam,
          );
    if (token !== this._host._recordingsNavUpdateToken) return;

    let hasNext = false;
    if (probePlan.nextProbeBounds) {
      hasNext =
        contexts.length > 1
          ? await this._hasActiveRecordingContexts(
              probePlan.nextProbeBounds,
            )
          : await this.hasRecordingsInBounds(
              probePlan.nextProbeBounds,
              clientId,
              cam,
            );
      if (token !== this._host._recordingsNavUpdateToken) return;
    }

    const resolvedNavState = resolveRecordingsBrowseNavState({
      currentBounds: current,
      todayBounds: today,
      hasPrev,
      hasNext,
    });
    prev.disabled = resolvedNavState.prevDisabled;
    next.disabled = resolvedNavState.nextDisabled;
  }
}
