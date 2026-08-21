import {
  DAY,
  EVENT_FETCH_BATCH,
  INITIAL_BROWSE_PAINT_LIMIT,
  INACTIVE_WARM_EVENT_LIMIT,
  REVIEW_FETCH_BATCH,
  WARM_EVENT_PAGE_LIMIT,
  WINDOW_FETCH_PAGE_LIMIT,
} from "../../constants.js";
import { fetchWindowedItems } from "../../data/window-fetch.js";
import { buildRecordingsDayCacheKey } from "../recordings/utils/availability.js";
import { resolveRecordingsDayBounds } from "../recordings/utils/day.js";
import { reviewMatchesAlertsOnlyMode } from "./filter-state.js";

export class BrowseWindowLoaderController {
  constructor(host, deps = {}) {
    this._host = host;
    this._deps = {
      fetchWindowedItems,
      ...deps,
    };
  }

  async fetchWindowedEvents(clientId, cam, after, before, opts = {}) {
    return this._deps.fetchWindowedItems({
      after,
      before,
      opts,
      defaultPageLimit: WINDOW_FETCH_PAGE_LIMIT,
      defaultBatchLimit: EVENT_FETCH_BATCH,
      useOptionLimit: true,
      fetchBatch: ({ after: afterTs, before: beforeTs, limit }) =>
        this._host._ws({
          type: "frigate/events/get",
          instance_id: clientId,
          cameras: [cam],
          after: afterTs,
          before: beforeTs,
          limit,
        }),
      getItemStartTime: (item, fallbackBefore) =>
        item?.start_time || fallbackBefore,
    });
  }

  async warmOtherCamerasEvents() {
    const token = ++this._host._warmCamsToken;
    const activeEntity = this._host._activeCam?.entity;
    const includeActiveCamera =
      this._host._isPreviewPageActive?.() === true;
    const after = this._host._winStart;
    const before = this._host._winEnd;

    for (const camera of this._host._config.cameras) {
      if (camera.entity === activeEntity && !includeActiveCamera) continue;
      const entity = camera.entity;
      const cache = this._host._camCache[entity];
      if (!cache?.clientId || !cache?.cam) continue;
      if (
        Array.isArray(cache.events) &&
        cache.events.length >= INACTIVE_WARM_EVENT_LIMIT
      ) {
        continue;
      }
      try {
        const events = await this.fetchWindowedEvents(
          cache.clientId,
          cache.cam,
          after,
          before,
          {
            pageLimit: WARM_EVENT_PAGE_LIMIT,
            limit: INACTIVE_WARM_EVENT_LIMIT,
            debugLabel: "warm-cache",
          },
        );
        if (token !== this._host._warmCamsToken) return;
        if (after !== this._host._winStart || before !== this._host._winEnd) {
          return;
        }
        cache.events = Array.isArray(events)
          ? events.slice(0, INACTIVE_WARM_EVENT_LIMIT)
          : [];
      } catch (_) {}
    }
  }

  async warmVisibleCameraReviews() {
    const previewActive = this._host._isPreviewPageActive?.() === true;
    const allCameraCountsVisible =
      previewActive ||
      this._host._wideViewCompanionController?.isActive?.() === true;
    if (!allCameraCountsVisible) return;

    const token = (Number(this._host._warmReviewsToken) || 0) + 1;
    this._host._warmReviewsToken = token;
    const before = this._host._winEnd;
    const dayCount = this._host._config?.alerts_reviews_days || 3;

    for (const camera of this._host._config?.cameras || []) {
      const entity = camera?.entity || "";
      if (entity === this._host._activeCam?.entity && !previewActive) continue;
      const cache = entity ? this._host._camCache[entity] : null;
      if (!cache?.clientId || !cache?.cam) continue;
      const contentMode = this._reviewContentMode(camera?.alerts_content);
      const cacheKey = this.reviewWindowCacheKeyForContent(
        cache.clientId,
        cache.cam,
        before,
        contentMode,
      );
      if (cache.reviewsWindowKey === cacheKey) continue;

      try {
        const resolved = await this.fetchRecentActiveDayReviews(
          cache.clientId,
          cache.cam,
          before,
          dayCount,
          {
            debugLabel: "camera-alert-count",
            itemFilter:
              contentMode === "all_reviews"
                ? null
                : reviewMatchesAlertsOnlyMode,
          },
        );
        if (token !== this._host._warmReviewsToken) return;
        const reviews = Array.isArray(resolved?.items) ? resolved.items : [];
        this.cacheCameraWindowReviews(
          entity,
          cache.clientId,
          cache.cam,
          before,
          reviews,
          contentMode,
        );
        this._notifyCameraAlertsChanged(entity);
      } catch (_) {}
    }
  }

  scheduleWarmOtherCamerasEvents(delayMs = 1000) {
    if (this._host._warmOtherCamsDelayT) {
      clearTimeout(this._host._warmOtherCamsDelayT);
    }
    this._host._warmOtherCamsDelayT = setTimeout(
      () => {
        this._host._warmOtherCamsDelayT = null;
        if (!this._host.isConnected) return;
        void this.warmOtherCamerasEvents();
        void this.warmVisibleCameraReviews();
      },
      Math.max(0, Number(delayMs) || 0),
    );
  }

  pruneNonActiveCamWindowCaches() {
    this._host._warmCamsToken++;
    this._host._warmReviewsToken =
      (Number(this._host._warmReviewsToken) || 0) + 1;
    const activeEntity = this._host._activeCam?.entity;
    for (const camera of this._host._config.cameras) {
      const entity = camera.entity;
      if (entity === activeEntity) continue;
      const cache = this._host._camCache[entity];
      if (!cache) continue;
      cache.events = [];
      cache.recordings = [];
      cache.reviews = [];
      cache.reviewsWindowKey = "";
    }
  }

  async fetchWindowedReviews(clientId, cam, after, before, opts = {}) {
    return this._deps.fetchWindowedItems({
      after,
      before,
      opts,
      defaultPageLimit: WINDOW_FETCH_PAGE_LIMIT,
      defaultBatchLimit: REVIEW_FETCH_BATCH,
      useOptionLimit: false,
      fetchBatch: ({ after: afterTs, before: beforeTs, limit }) =>
        this._host._ws({
          type: "frigate/reviews/get",
          instance_id: clientId,
          cameras: [cam],
          after: afterTs,
          before: beforeTs,
          limit,
        }),
      getItemStartTime: (item, fallbackBefore) =>
        item?.start_time || fallbackBefore,
    });
  }

  _dayKeyForItem(item) {
    const ts = Math.floor(Number(item?.start_time) || 0);
    if (typeof this._host._dayKey === "function") {
      return this._host._dayKey(ts);
    }
    const date = new Date(ts * 1000);
    const year = date.getUTCFullYear();
    const month = String(date.getUTCMonth() + 1).padStart(2, "0");
    const day = String(date.getUTCDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  _filterToRecentDaysWithData(items, dayCount) {
    const targetDayCount = Math.max(1, Number(dayCount) || 1);
    const sorted = Array.isArray(items)
      ? items
          .slice()
          .sort((a, b) => (b?.start_time || 0) - (a?.start_time || 0))
      : [];
    const selectedDays = new Set();
    for (const item of sorted) {
      const key = this._dayKeyForItem(item);
      if (!key) continue;
      selectedDays.add(key);
      if (selectedDays.size >= targetDayCount) break;
    }
    if (!selectedDays.size) return [];
    return sorted.filter((item) => selectedDays.has(this._dayKeyForItem(item)));
  }

  async _fetchRecentActiveDaysItems({
    clientId,
    cam,
    before,
    dayCount,
    fetcher,
    debugLabel,
    itemFilter,
    onProgress,
  }) {
    const targetDayCount = Math.max(1, Number(dayCount) || 1);
    let spanDays = targetDayCount;
    const maxSpanDays = Math.max(targetDayCount * 16, targetDayCount + 30);
    let bestItems = [];
    let bestDayCount = 0;
    let progressStarted = false;
    let lastProgressKey = "";

    while (true) {
      const after = Math.max(0, Math.floor(before - spanDays * DAY));
      const fetchOpts = { debugLabel };
      if (typeof onProgress === "function") {
        fetchOpts.initialBatchLimit = INITIAL_BROWSE_PAINT_LIMIT;
        fetchOpts.onPage = (pageItems, pageState = {}) => {
          if (pageState.done) return;
          const eligibleItems = Array.isArray(pageItems)
            ? typeof itemFilter === "function"
              ? pageItems.filter((item) => itemFilter(item))
              : pageItems
            : [];
          const recentItems = this._filterToRecentDaysWithData(
            eligibleItems,
            targetDayCount,
          );
          if (!recentItems.length) return;
          const progressiveItems = progressStarted
            ? recentItems
            : recentItems.slice(0, INITIAL_BROWSE_PAINT_LIMIT);
          const progressKey = progressiveItems
            .map((item) => item?.id || item?.start_time || "")
            .join("|");
          if (progressKey === lastProgressKey) return;
          progressStarted = true;
          lastProgressKey = progressKey;
          onProgress(progressiveItems.slice(), {
            after,
            spanDays,
            page: pageState.page,
            complete: false,
          });
        };
      }
      const items = await fetcher(after, before, fetchOpts);
      const latestItems = Array.isArray(items)
        ? typeof itemFilter === "function"
          ? items.filter((item) => itemFilter(item))
          : items
        : [];
      const filtered = this._filterToRecentDaysWithData(
        latestItems,
        targetDayCount,
      );
      const dayCountFound = new Set(
        filtered.map((item) => this._dayKeyForItem(item)),
      ).size;
      if (dayCountFound > bestDayCount) {
        bestDayCount = dayCountFound;
        bestItems = filtered;
      }
      if (dayCountFound >= targetDayCount || spanDays >= maxSpanDays) {
        const bestResult = bestDayCount >= dayCountFound ? bestItems : filtered;
        return {
          items: bestResult,
          after,
        };
      }
      spanDays = Math.min(maxSpanDays, spanDays * 2);
    }
  }

  async fetchRecentActiveDayEvents(clientId, cam, before, dayCount, opts = {}) {
    const result = await this._fetchRecentActiveDaysItems({
      clientId,
      cam,
      before,
      dayCount,
      debugLabel: opts.debugLabel || "events-active-days",
      onProgress:
        typeof opts.onProgress === "function" ? opts.onProgress : null,
      fetcher: (after, beforeTs, fetchOpts) =>
        this.fetchWindowedEvents(clientId, cam, after, beforeTs, fetchOpts),
    });
    return result;
  }

  async fetchRecentActiveDayReviews(
    clientId,
    cam,
    before,
    dayCount,
    opts = {},
  ) {
    const result = await this._fetchRecentActiveDaysItems({
      clientId,
      cam,
      before,
      dayCount,
      debugLabel: opts.debugLabel || "reviews-active-days",
      itemFilter:
        typeof opts.itemFilter === "function" ? opts.itemFilter : null,
      onProgress:
        typeof opts.onProgress === "function" ? opts.onProgress : null,
      fetcher: (after, beforeTs, fetchOpts) =>
        this.fetchWindowedReviews(clientId, cam, after, beforeTs, fetchOpts),
    });
    return result;
  }

  async loadWindow(replace) {
    if (this._host._isPreviewPageActive()) return;
    if (this._host._loading) return;
    this._host._loading = true;
    this._host._reloadPending = false;
    this._host._reloadAfterLoad = false;
    if (replace) this._host._exhausted = false;
    if (this._host._followNowWindow) {
      const now = Math.floor(Date.now() / 1000);
      this._host._winEnd = now;
      this._host._winStart = now - this._host._config.window_days * DAY;
    }
    const { clientId, cam } = this._host._cc();
    if (!clientId || !cam) {
      this._host._loading = false;
      return;
    }
    const after = this._host._winStart;
    const before = this._host._winEnd;
    // Reviews feed both the Alerts list and camera count. Start them before the
    // broader event collection used by Clips.
    const reviewsTask = this.loadWindowReviewsIfNeeded(
      clientId,
      cam,
      after,
      before,
    );
    const eventsTask = this.loadWindowEvents(clientId, cam, after, before);

    await Promise.allSettled([
      reviewsTask,
      eventsTask,
      this._host._tab === "recordings"
        ? this.loadWindowRecordings(clientId, cam, before)
        : Promise.resolve(),
    ]);
    const entity = this._host._activeCam?.entity;
    if (entity && this._host._camCache[entity]) {
      this._host._camCache[entity].events = this._host._events;
      this._host._camCache[entity].recordings = this._host._recordings;
    }
    this._host._loading = false;
    if (this._host._reloadAfterLoad) {
      this._host._reloadAfterLoad = false;
      this._host._scheduleReload();
    }
    this._host._deepLinkController?.consumeDeepLinkReviewOpen?.() ??
      this._host._consumeDeepLinkReviewOpen?.();
    this._host._deepLinkController?.consumeDeepLinkEventOpen?.() ??
      this._host._consumeDeepLinkEventOpen?.();
    if (this._host._eventsMode === "all") this._host._loadAllCamsBackground();
    this._host._renderAll();
  }

  async loadOlder() {
    const before = this._host._events.length
      ? Math.floor(
          Math.min(...this._host._events.map((event) => event.start_time)),
        )
      : this._host._winStart;
    this._host._loading = true;
    const { clientId, cam } = this._host._cc();
    try {
      const older = await this._host._ws({
        type: "frigate/events/get",
        instance_id: clientId,
        cameras: [cam],
        before,
        limit: 50,
      });
      const nextEvents = Array.isArray(older)
        ? older.filter(
            (olderEvent) =>
              !this._host._events.some(
                (currentEvent) => currentEvent.id === olderEvent.id,
              ),
          )
        : [];
      if (!nextEvents.length) {
        this._host._exhausted = true;
      } else {
        this._host._events = this._host._events.concat(nextEvents);
        this._host._winStart = Math.min(
          this._host._winStart,
          ...nextEvents.map((event) => event.start_time),
        );
      }
    } catch (_) {}
    this._host._loading = false;
    this._host._renderList();
    this._host._renderSubtitle();
  }

  cacheActiveCamSlice(key, value) {
    const entity = this._host._activeCam?.entity;
    if (entity && this._host._camCache[entity]) {
      this._host._camCache[entity][key] = value;
    }
  }

  reviewWindowCacheKey(clientId, cam, before) {
    return this.reviewWindowCacheKeyForContent(
      clientId,
      cam,
      before,
      this._host._activeCam?.alerts_content,
    );
  }

  _reviewContentMode(value) {
    return value === "all_reviews" ? "all_reviews" : "alerts_only";
  }

  reviewWindowCacheKeyForContent(clientId, cam, before, alertsContent) {
    const days = this._host._config?.alerts_reviews_days || 3;
    const contentMode = this._reviewContentMode(alertsContent);
    return `${clientId}|${cam}|${Math.floor(before)}|${days}|${contentMode}`;
  }

  hasCachedWindowReviews(clientId, cam, before) {
    const entity = this._host._activeCam?.entity;
    const cache = entity ? this._host._camCache[entity] : null;
    return (
      !!cache &&
      cache.reviewsWindowKey ===
        this.reviewWindowCacheKey(clientId, cam, before)
    );
  }

  cacheWindowReviews(clientId, cam, before, reviews) {
    const entity = this._host._activeCam?.entity;
    this.cacheCameraWindowReviews(
      entity,
      clientId,
      cam,
      before,
      reviews,
      this._host._activeCam?.alerts_content,
    );
  }

  cacheCameraWindowReviews(
    entity,
    clientId,
    cam,
    before,
    reviews,
    alertsContent,
  ) {
    const cache = entity ? this._host._camCache[entity] : null;
    if (!cache) return;
    cache.reviews = Array.isArray(reviews) ? reviews : [];
    cache.reviewsWindowKey = this.reviewWindowCacheKeyForContent(
      clientId,
      cam,
      before,
      alertsContent,
    );
  }

  cameraAlertsCount(entity) {
    const reviews = this._host._camCache?.[entity]?.reviews;
    return Array.isArray(reviews) ? reviews.length : 0;
  }

  mergeLatestCameraReviews(entity, reviews) {
    const cache = entity ? this._host._camCache?.[entity] : null;
    if (!cache?.reviewsWindowKey || !Array.isArray(reviews)) return false;
    if (this._host._followNowWindow === false) return false;
    const camera = (this._host._config?.cameras || []).find(
      (candidate) => candidate?.entity === entity,
    );
    const contentMode = this._reviewContentMode(camera?.alerts_content);
    const eligible =
      contentMode === "all_reviews"
        ? reviews
        : reviews.filter((review) => reviewMatchesAlertsOnlyMode(review));
    const byId = new Map();
    for (const review of [...(cache.reviews || []), ...eligible]) {
      const id = String(review?.id || "").trim();
      if (id) byId.set(id, review);
    }
    const merged = this._filterToRecentDaysWithData(
      [...byId.values()],
      this._host._config?.alerts_reviews_days || 3,
    );
    if (this._sameWindowItems(cache.reviews, merged)) return false;
    cache.reviews = merged;
    this._notifyCameraAlertsChanged(entity);
    return true;
  }

  _notifyCameraAlertsChanged(entity) {
    this._host._previewPageController?.updatePreviewMeta?.();
    this._host._wideViewCompanionController?.updateMeta?.();
    if (entity === this._host._activeCam?.entity) {
      this._host._renderStats?.();
    }
  }

  _windowContextMatches(clientId, cam, before) {
    if (typeof this._host._cc === "function") {
      const active = this._host._cc();
      if (active?.clientId !== clientId || active?.cam !== cam) return false;
    }
    if (Number.isFinite(this._host._winEnd) && Number.isFinite(before)) {
      return Math.floor(this._host._winEnd) === Math.floor(before);
    }
    return true;
  }

  _sameWindowItems(currentItems, nextItems) {
    if (!Array.isArray(currentItems) || !Array.isArray(nextItems)) return false;
    if (currentItems.length !== nextItems.length) return false;
    return currentItems.every((item, index) => {
      const nextItem = nextItems[index];
      if (item === nextItem) return true;
      return !!item?.id && item.id === nextItem?.id;
    });
  }

  _publishWindowEvents(clientId, cam, before, events) {
    if (!this._windowContextMatches(clientId, cam, before)) return false;
    const nextEvents = Array.isArray(events) ? events : [];
    const changed = !this._sameWindowItems(this._host._events, nextEvents);
    this._host._events = nextEvents;
    this.cacheActiveCamSlice("events", this._host._events);
    if (changed) {
      this._host._renderList();
      this._host._renderStats();
    }
    return true;
  }

  _publishWindowReviews(clientId, cam, before, reviews) {
    if (!this._windowContextMatches(clientId, cam, before)) return false;
    const nextReviews = Array.isArray(reviews) ? reviews : [];
    const changed = !this._sameWindowItems(this._host._reviews, nextReviews);
    this._host._reviews = nextReviews;
    this.cacheWindowReviews(clientId, cam, before, this._host._reviews);
    this._notifyCameraAlertsChanged(this._host._activeCam?.entity || "");
    if (changed) this._host._renderList();
    if (this._host._tab === "alerts") {
      this._host._slideshowAlertController.handleReviewsUpdated(
        this._host._activeCam?.entity || "",
        this._host._reviews,
        "alerts-window",
      );
    }
    return true;
  }

  async loadWindowEvents(clientId, cam, after, before) {
    const loadToken = (Number(this._host._eventsLoadToken) || 0) + 1;
    this._host._eventsLoadToken = loadToken;
    let publishedProgress = false;
    try {
      const resolved = await this.fetchRecentActiveDayEvents(
        clientId,
        cam,
        before,
        this._host._config?.window_days || 1,
        {
          debugLabel: "events-window",
          onProgress: (partialEvents) => {
            if (this._host._eventsLoadToken !== loadToken) return;
            publishedProgress =
              this._publishWindowEvents(
                clientId,
                cam,
                before,
                partialEvents,
              ) || publishedProgress;
          },
        },
      );
      if (
        this._host._eventsLoadToken !== loadToken ||
        !this._windowContextMatches(clientId, cam, before)
      ) {
        return;
      }
      const events = Array.isArray(resolved?.items) ? resolved.items : [];
      if (events.length) {
        this._host._winStart = Math.min(
          ...events.map((item) =>
            Math.floor(item?.start_time || before),
          ),
        );
      } else if (Number.isFinite(resolved?.after)) {
        this._host._winStart = resolved.after;
      } else {
        this._host._winStart = after;
      }
      this._publishWindowEvents(clientId, cam, before, events);
    } catch (error) {
      console.error("[Frigate] events", error);
      if (
        !publishedProgress &&
        this._host._eventsLoadToken === loadToken &&
        this._windowContextMatches(clientId, cam, before)
      ) {
        this._host._events = [];
      }
    }
  }

  async loadWindowRecordings(clientId, cam, before) {
    const bounds = this._resolveRecordingsDayBounds(before);
    const cacheKey = buildRecordingsDayCacheKey(clientId, cam, bounds);
    if (!this._host._recordingsDayDataCache) {
      this._host._recordingsDayDataCache = new Map();
    }
    if (!this._host._recordingsDayAvailabilityCache) {
      this._host._recordingsDayAvailabilityCache = new Map();
    }
    if (!this._host._recordingsDayFetchedAtCache) {
      this._host._recordingsDayFetchedAtCache = new Map();
    }

    const dataCache = this._host._recordingsDayDataCache;
    const hasCached = dataCache.has(cacheKey);
    const cachedRecordings = hasCached ? dataCache.get(cacheKey) || [] : [];
    if (hasCached) {
      this._publishRecordingsDay(
        clientId,
        cam,
        bounds,
        cachedRecordings,
      );
    }

    const todayBounds = this._resolveRecordingsDayBounds(
      Math.floor(Date.now() / 1000),
    );
    const isToday =
      bounds.start === todayBounds.start && bounds.end === todayBounds.end;
    const fetchedAt = Number(
      this._host._recordingsDayFetchedAtCache.get(cacheKey) || 0,
    );
    const cacheIsFresh =
      fetchedAt > 0 && Date.now() - fetchedAt < this._recordingsFreshnessMs();
    if (hasCached && (!isToday || cacheIsFresh)) return cachedRecordings;

    let lastProgressRecordings = null;
    try {
      const recordings = await this._fetchRecordingsDay(
        clientId,
        cam,
        bounds,
        {
          forceRefresh: hasCached,
          progressive: !hasCached,
          before,
          onProgress: (partialRecordings) => {
            lastProgressRecordings = partialRecordings;
            this._publishRecordingsDay(
              clientId,
              cam,
              bounds,
              partialRecordings,
            );
          },
        },
      );
      if (recordings !== lastProgressRecordings) {
        this._publishRecordingsDay(clientId, cam, bounds, recordings);
      }
      return recordings;
    } catch (_) {
      if (!hasCached && this._recordingsContextMatches(clientId, cam, bounds)) {
        this._host._recordings = [];
        this.cacheActiveCamSlice("recordings", this._host._recordings);
      }
      return cachedRecordings;
    }
  }

  _resolveRecordingsDayBounds(timestamp) {
    if (this._host._recordingsDayBounds) {
      return this._host._recordingsDayBounds(timestamp);
    }
    return resolveRecordingsDayBounds({
      tsSec: timestamp,
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

  _recordingsFreshnessMs() {
    const refreshSeconds = Math.max(
      15,
      Number(this._host._config?.refresh_seconds) || 45,
    );
    return refreshSeconds * 1000;
  }

  _recordingsContextMatches(clientId, cam, bounds) {
    if (typeof this._host._cc !== "function") return true;
    const active = this._host._cc();
    if (active?.clientId !== clientId || active?.cam !== cam) return false;
    const activeBounds = this._resolveRecordingsDayBounds(this._host._winEnd);
    return (
      activeBounds.start === bounds.start && activeBounds.end === bounds.end
    );
  }

  _publishRecordingsDay(clientId, cam, bounds, recordings) {
    if (!this._recordingsContextMatches(clientId, cam, bounds)) return false;
    this._host._recordings = Array.isArray(recordings) ? recordings : [];
    this.cacheActiveCamSlice("recordings", this._host._recordings);
    this._host._renderList();
    return true;
  }

  async _fetchRecordingsDay(
    clientId,
    cam,
    bounds,
    {
      forceRefresh = false,
      progressive = false,
      before = null,
      onProgress = null,
    } = {},
  ) {
    const recordingsController = this._host._recordingsBrowseNavController;
    const progressiveLoader =
      recordingsController?.fetchRecordingsInBoundsProgressively;
    if (progressive && typeof progressiveLoader === "function") {
      return await progressiveLoader.call(
        recordingsController,
        bounds,
        clientId,
        cam,
        { before, onProgress },
      );
    }

    const sharedLoader = recordingsController?.fetchRecordingsInBounds;
    if (typeof sharedLoader === "function") {
      return await sharedLoader.call(
        recordingsController,
        bounds,
        clientId,
        cam,
        { forceRefresh },
      );
    }

    const key = buildRecordingsDayCacheKey(clientId, cam, bounds);
    const dataCache = this._host._recordingsDayDataCache;
    if (!forceRefresh && dataCache.has(key)) return dataCache.get(key) || [];
    if (!this._host._recordingsDayRequestCache) {
      this._host._recordingsDayRequestCache = new Map();
    }
    const requestCache = this._host._recordingsDayRequestCache;
    if (requestCache.has(key)) return await requestCache.get(key);

    const request = (async () => {
      const response = await this._host._ws({
        type: "frigate/recordings/get",
        instance_id: clientId,
        camera: cam,
        after: Math.max(0, bounds.start),
        before: bounds.end,
      });
      const recordings = Array.isArray(response) ? response : [];
      dataCache.set(key, recordings);
      this._host._recordingsDayAvailabilityCache.set(
        key,
        recordings.length > 0,
      );
      this._host._recordingsDayFetchedAtCache.set(key, Date.now());
      return recordings;
    })();
    requestCache.set(key, request);
    try {
      return await request;
    } finally {
      if (requestCache.get(key) === request) requestCache.delete(key);
    }
  }

  async loadWindowReviewsIfNeeded(clientId, cam, _after, before) {
    const loadToken = (Number(this._host._reviewsLoadToken) || 0) + 1;
    this._host._reviewsLoadToken = loadToken;
    try {
      const showAllReviews =
        this._host._activeCam?.alerts_content === "all_reviews";
      const resolved = await this.fetchRecentActiveDayReviews(
        clientId,
        cam,
        before,
        this._host._config?.alerts_reviews_days || 3,
        {
          debugLabel: "alerts-window",
          itemFilter: showAllReviews ? null : reviewMatchesAlertsOnlyMode,
        },
      );
      if (
        this._host._reviewsLoadToken !== loadToken ||
        !this._windowContextMatches(clientId, cam, before)
      ) {
        return;
      }
      const reviews = Array.isArray(resolved?.items) ? resolved.items : [];
      this._publishWindowReviews(clientId, cam, before, reviews);
    } catch (_) {}
  }

  goNow() {
    this._host._followNowWindow = true;
    const now = Math.floor(Date.now() / 1000);
    this._host._winEnd = now;
    this._host._winStart = now - this._host._config.window_days * DAY;
    this._host._calSelectedDay = this._host._formatTzDateString(
      this._host._tzParts(now),
    );
    this._host._exhausted = false;
    this._host._calMonth = null;
    this.pruneNonActiveCamWindowCaches();
    void (async () => {
      await this.loadWindow(true);
      this.scheduleWarmOtherCamerasEvents();
    })();
  }
}
