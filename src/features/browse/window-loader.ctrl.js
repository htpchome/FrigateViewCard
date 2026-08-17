import {
  DAY,
  EVENT_FETCH_BATCH,
  INACTIVE_WARM_EVENT_LIMIT,
  REVIEW_FETCH_BATCH,
  WINDOW_FETCH_PAGE_LIMIT,
  INITIAL_EVENTS_PAGE_LIMIT,
} from "../../constants.js";
import { fetchWindowedItems } from "../../data/window-fetch.js";
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
    const after = this._host._winStart;
    const before = this._host._winEnd;

    for (const camera of this._host._config.cameras) {
      if (camera.entity === activeEntity) continue;
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
            pageLimit: INITIAL_EVENTS_PAGE_LIMIT,
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

  scheduleWarmOtherCamerasEvents(delayMs = 1000) {
    if (this._host._warmOtherCamsDelayT) {
      clearTimeout(this._host._warmOtherCamsDelayT);
    }
    this._host._warmOtherCamsDelayT = setTimeout(
      () => {
        this._host._warmOtherCamsDelayT = null;
        if (!this._host.isConnected) return;
        void this.warmOtherCamerasEvents();
      },
      Math.max(0, Number(delayMs) || 0),
    );
  }

  pruneNonActiveCamWindowCaches() {
    this._host._warmCamsToken++;
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
  }) {
    const targetDayCount = Math.max(1, Number(dayCount) || 1);
    let spanDays = targetDayCount;
    const maxSpanDays = Math.max(targetDayCount * 16, targetDayCount + 30);
    let bestItems = [];
    let bestDayCount = 0;

    while (true) {
      const after = Math.max(0, Math.floor(before - spanDays * DAY));
      const items = await fetcher(after, before, {
        debugLabel,
      });
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
    // Alerts is the default tab. Start its review request first so its first
    // paint is not blocked behind the broader event collection used by Clips.
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
    const days = this._host._config?.alerts_reviews_days || 3;
    const contentMode =
      this._host._activeCam?.alerts_content === "all_reviews"
        ? "all_reviews"
        : "alerts_only";
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
    const cache = entity ? this._host._camCache[entity] : null;
    if (!cache) return;
    cache.reviews = reviews;
    cache.reviewsWindowKey = this.reviewWindowCacheKey(clientId, cam, before);
  }

  async loadWindowEvents(clientId, cam, after, before) {
    try {
      const resolved = await this.fetchRecentActiveDayEvents(
        clientId,
        cam,
        before,
        this._host._config?.window_days || 1,
        { debugLabel: "events-window" },
      );
      this._host._events = Array.isArray(resolved?.items) ? resolved.items : [];
      if (this._host._events.length) {
        this._host._winStart = Math.min(
          ...this._host._events.map((item) =>
            Math.floor(item?.start_time || before),
          ),
        );
      } else if (Number.isFinite(resolved?.after)) {
        this._host._winStart = resolved.after;
      } else {
        this._host._winStart = after;
      }
      this.cacheActiveCamSlice("events", this._host._events);
      this._host._renderList();
      this._host._renderStats();
    } catch (error) {
      console.error("[Frigate] events", error);
      this._host._events = [];
    }
  }

  async loadWindowRecordings(clientId, cam, before) {
    const bounds = this._host._recordingsDayBounds
      ? this._host._recordingsDayBounds(before)
      : resolveRecordingsDayBounds({
          tsSec: before,
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
    const cacheKey = `${clientId}|${cam}|${bounds.start}|${bounds.end}`;
    try {
      const recordings = await this._host._ws({
        type: "frigate/recordings/get",
        instance_id: clientId,
        camera: cam,
        after: Math.max(0, bounds.start),
        before: bounds.end,
      });
      this._host._recordings = Array.isArray(recordings) ? recordings : [];
      this._host._recordingsDayDataCache.set(cacheKey, this._host._recordings);
      this._host._recordingsDayAvailabilityCache.set(
        cacheKey,
        this._host._recordings.length > 0,
      );
      this.cacheActiveCamSlice("recordings", this._host._recordings);
      this._host._renderList();
    } catch (_) {
      this._host._recordings = [];
    }
  }

  async loadWindowReviewsIfNeeded(clientId, cam, _after, before) {
    if (this._host._tab !== "alerts") return;
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
      this._host._reviews = Array.isArray(resolved?.items)
        ? resolved.items
        : [];
      this.cacheWindowReviews(clientId, cam, before, this._host._reviews);
      this._host._renderList();
      this._host._slideshowAlertController.handleReviewsUpdated(
        this._host._activeCam?.entity || "",
        this._host._reviews,
        "alerts-window",
      );
    } catch (_) {
      this._host._reviews = [];
    }
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
