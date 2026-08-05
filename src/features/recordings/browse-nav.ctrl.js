import {
  buildPreparedRecordingsDayResult,
  buildRecordingsDayCacheKey,
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
  resolveOffsetRecordingsDayBounds,
  resolveRecordingsDayBounds,
} from "./utils/day.js";
import { resolvePreparedRecordingsDayNavigationState } from "./utils/swipe.js";

export class RecordingsBrowseNavController {
  constructor(host) {
    this._host = host;
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

  async hasRecordingsInBounds(bounds, clientId, cam) {
    const key = buildRecordingsDayCacheKey(clientId, cam, bounds);
    const cached = resolveCachedRecordingsAvailability({
      key,
      dataCache: this._host._recordingsDayDataCache,
      availabilityCache: this._host._recordingsDayAvailabilityCache,
    });
    if (cached.found) {
      if (cached.shouldSyncAvailability) {
        this._host._recordingsDayAvailabilityCache.set(
          key,
          cached.hasRecordings,
        );
      }
      return cached.hasRecordings;
    }
    try {
      const recordings = await this._host._ws({
        type: "frigate/recordings/get",
        instance_id: clientId,
        camera: cam,
        after: Math.max(0, bounds.start),
        before: bounds.end,
      });
      const fetched = resolveFetchedRecordingsAvailabilityState(recordings);
      this._host._recordingsDayDataCache.set(key, fetched.recordings);
      this._host._recordingsDayAvailabilityCache.set(
        key,
        fetched.availabilityValue,
      );
      return fetched.hasRecordings;
    } catch (_) {
      const failed = resolveFailedRecordingsAvailabilityState();
      this._host._recordingsDayAvailabilityCache.set(
        key,
        failed.availabilityValue,
      );
      return failed.hasRecordings;
    }
  }

  async prepareDayTransition(direction) {
    const bounds = this._recordingsOffsetDayBounds(direction);
    const today = this._recordingsDayBounds(Math.floor(Date.now() / 1000));
    const { clientId, cam } = this._host._cc();
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
    const hasData = await this.hasRecordingsInBounds(bounds, clientId, cam);
    if (!hasData) {
      return { hasData: false, bounds, recs: [] };
    }
    const recordings = await this._host._ws({
      type: "frigate/recordings/get",
      instance_id: clientId,
      camera: cam,
      after: Math.max(0, bounds.start),
      before: bounds.end,
    });
    const result = buildPreparedRecordingsDayResult(bounds, recordings);
    this._host._recordingsDayDataCache.set(key, result.recs);
    this._host._recordingsDayAvailabilityCache.set(key, result.hasData);
    return result;
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

  async completeSwipeGesture(gesture) {
    if (!gesture) return false;
    await gesture.prepPromise;
    if (!gesture.ready || !gesture.hasData || !gesture.stage) return false;

    await new Promise((resolve) => requestAnimationFrame(resolve));
    await new Promise((resolve) => requestAnimationFrame(resolve));

    const target = -gesture.direction * gesture.stage.width;
    const swipeController = this._swipeController();
    if (swipeController) {
      await swipeController.animateStageTo(
        gesture.stage,
        target,
        300,
        "cubic-bezier(0.28, 0.02, 0.18, 1)",
      );
    } else {
      await this._host._animateRecordingsSwipeStageTo(
        gesture.stage,
        target,
        300,
        "cubic-bezier(0.28, 0.02, 0.18, 1)",
      );
    }
    await (this._host._commitRecordingsDayTransition?.(
      gesture.bounds,
      gesture.recs,
    ) ?? this.commitDayTransition(gesture.bounds, gesture.recs));
    return true;
  }

  async commitDayTransition(bounds, recordings) {
    if (!bounds) return;
    const { clientId, cam } = this._host._cc();
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
    this._host._browseWindowLoaderController?.cacheActiveCamSlice?.(
      "recordings",
      this._host._recordings,
    ) ??
      this._host._cacheActiveCamSlice?.("recordings", this._host._recordings);
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
    const prev = this._host._$("#rec-day-prev");
    const next = this._host._$("#rec-day-next");
    if (!prev || !next) return;

    const { clientId, cam } = this._host._cc();
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
    const hasPrev = await this.hasRecordingsInBounds(
      probePlan.prevProbeBounds,
      clientId,
      cam,
    );
    if (token !== this._host._recordingsNavUpdateToken) return;

    let hasNext = false;
    if (probePlan.nextProbeBounds) {
      hasNext = await this.hasRecordingsInBounds(
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
