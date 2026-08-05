import {
  DAY,
  EVENT_FETCH_BATCH,
  INITIAL_EVENT_FETCH_LIMIT,
  INACTIVE_WARM_EVENT_LIMIT,
  REVIEW_FETCH_BATCH,
  WINDOW_FETCH_PAGE_LIMIT,
  INITIAL_EVENTS_PAGE_LIMIT,
  WINDOW_BACKGROUND_PAGE_LIMIT,
} from "../../constants.js";
import { fetchWindowedItems } from "../../data/window-fetch.js";
import { resolveRecordingsDayBounds } from "../recordings/utils/day.js";

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
    const eventsTask = this.loadWindowEvents(clientId, cam, after, before);

    await Promise.allSettled([
      eventsTask,
      this._host._tab === "recordings"
        ? this.loadWindowRecordings(clientId, cam, before)
        : Promise.resolve(),
      (async () => {
        await eventsTask;
        await this.loadWindowReviewsIfNeeded(clientId, cam, after, before);
      })(),
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
    this._host._consumeDeepLinkReviewOpen();
    this._host._consumeDeepLinkEventOpen();
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

  async loadWindowEvents(clientId, cam, after, before) {
    const loadToken = ++this._host._eventsLoadToken;
    try {
      const initialEvents = await this.fetchWindowedEvents(
        clientId,
        cam,
        after,
        before,
        {
          pageLimit: INITIAL_EVENTS_PAGE_LIMIT,
          limit: INITIAL_EVENT_FETCH_LIMIT,
          debugLabel: "initial",
        },
      );
      this._host._events = Array.isArray(initialEvents) ? initialEvents : [];
      this.cacheActiveCamSlice("events", this._host._events);
      this._host._renderList();
      this._host._renderStats();

      if (
        !this._host._events.length ||
        WINDOW_FETCH_PAGE_LIMIT <= INITIAL_EVENTS_PAGE_LIMIT
      ) {
        return;
      }

      const oldest = Math.min(
        ...this._host._events.map((item) =>
          Math.floor(item?.start_time || before),
        ),
      );
      const cursorBefore = oldest - 1;
      const activeEntity = this._host._activeCam?.entity;
      const winStart = this._host._winStart;
      const winEnd = this._host._winEnd;

      void (async () => {
        try {
          const remainingEvents = await this.fetchWindowedEvents(
            clientId,
            cam,
            after,
            before,
            {
              pageLimit: Math.min(
                WINDOW_BACKGROUND_PAGE_LIMIT,
                Math.max(
                  1,
                  WINDOW_FETCH_PAGE_LIMIT - INITIAL_EVENTS_PAGE_LIMIT,
                ),
              ),
              cursorBefore,
              debugLabel: "background",
            },
          );

          if (loadToken !== this._host._eventsLoadToken) return;
          if (activeEntity !== this._host._activeCam?.entity) return;
          if (
            winStart !== this._host._winStart ||
            winEnd !== this._host._winEnd
          ) {
            return;
          }

          if (Array.isArray(remainingEvents) && remainingEvents.length) {
            this._host._events = this._host._events.concat(remainingEvents);
            this.cacheActiveCamSlice("events", this._host._events);
            this._host._renderList();
            this._host._renderStats();
          }
        } catch (_) {}
      })();
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
    const loadToken = ++this._host._reviewsLoadToken;
    const reviewsAfter = Math.max(
      0,
      Math.floor(before - (this._host._config?.alerts_reviews_days || 3) * DAY),
    );
    try {
      const initialReviews = await this.fetchWindowedReviews(
        clientId,
        cam,
        reviewsAfter,
        before,
        {
          pageLimit: INITIAL_EVENTS_PAGE_LIMIT,
          debugLabel: "alerts-window-initial",
        },
      );
      this._host._reviews = Array.isArray(initialReviews) ? initialReviews : [];
      this.cacheActiveCamSlice("reviews", this._host._reviews);
      this._host._renderList();
      this._host._slideshowAlertController.handleReviewsUpdated(
        this._host._activeCam?.entity || "",
        this._host._reviews,
        "alerts-window-initial",
      );

      if (
        !this._host._reviews.length ||
        WINDOW_FETCH_PAGE_LIMIT <= INITIAL_EVENTS_PAGE_LIMIT
      ) {
        return;
      }

      const oldest = Math.min(
        ...this._host._reviews.map((item) =>
          Math.floor(item?.start_time || before),
        ),
      );
      const cursorBefore = oldest - 1;
      const activeEntity = this._host._activeCam?.entity;
      const winStart = this._host._winStart;
      const winEnd = this._host._winEnd;

      void (async () => {
        try {
          const remainingReviews = await this.fetchWindowedReviews(
            clientId,
            cam,
            reviewsAfter,
            before,
            {
              pageLimit: Math.min(
                WINDOW_BACKGROUND_PAGE_LIMIT,
                Math.max(
                  1,
                  WINDOW_FETCH_PAGE_LIMIT - INITIAL_EVENTS_PAGE_LIMIT,
                ),
              ),
              cursorBefore,
              debugLabel: "alerts-window-background",
            },
          );

          if (loadToken !== this._host._reviewsLoadToken) return;
          if (activeEntity !== this._host._activeCam?.entity) return;
          if (
            winStart !== this._host._winStart ||
            winEnd !== this._host._winEnd
          ) {
            return;
          }

          if (Array.isArray(remainingReviews) && remainingReviews.length) {
            this._host._reviews = this._host._reviews.concat(remainingReviews);
            this.cacheActiveCamSlice("reviews", this._host._reviews);
            this._host._renderList();
            this._host._slideshowAlertController.handleReviewsUpdated(
              this._host._activeCam?.entity || "",
              this._host._reviews,
              "alerts-window-background",
            );
          }
        } catch (_) {}
      })();
    } catch (_) {
      this._host._reviews = [];
    }
  }
}
