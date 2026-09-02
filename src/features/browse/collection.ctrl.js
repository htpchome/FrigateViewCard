import { reviewMatchesAlertsOnlyMode } from "./filter-state.js";
import { flattenCameraMembers } from "../camera-groups/model.js";

export class BrowseCollectionController {
  constructor(host) {
    this._host = host;
    this._eventLookupCache = {
      sources: [],
      byId: new Map(),
    };
  }

  allGridReviews() {
    const reviews = [];
    const seen = new Set();
    for (const camera of flattenCameraMembers(
      this._host._config?.cameras || [],
    )) {
      const cameraKey = String(
        this._host._camCache[camera.entity]?.cam || camera.entity || "",
      );
      const cache = this._host._camCache[camera.entity];
      for (const review of cache?.reviews || []) {
        const id = String(review?.id || "");
        if (!id) continue;
        const dedupeKey = `${cameraKey}|${id}`;
        if (seen.has(dedupeKey)) continue;
        seen.add(dedupeKey);
        reviews.push(review);
      }
    }
    return reviews;
  }

  allGridEvents() {
    const events = [];
    const seen = new Set();
    for (const camera of flattenCameraMembers(
      this._host._config?.cameras || [],
    )) {
      const cache = this._host._camCache[camera.entity];
      for (const event of cache?.events || []) {
        const id = String(event?.id || "");
        if (!id || seen.has(id)) continue;
        seen.add(id);
        events.push(event);
      }
    }
    return events;
  }

  allGridKeptEvents() {
    const events = [];
    const seen = new Set();
    for (const camera of flattenCameraMembers(
      this._host._config.cameras || [],
    )) {
      const cache = this._host._camCache[camera.entity];
      for (const event of cache?.kept || []) {
        const id = String(event?.id || "");
        if (!id || seen.has(id)) continue;
        seen.add(id);
        events.push(event);
      }
    }
    return events;
  }

  findReviewById(id) {
    if (!id) return null;
    const target = String(id);
    if (
      this._host._isGridMixedListMode() ||
      this._host._isCardViewPageActive?.() === true
    ) {
      return (
        this.allGridReviews().find(
          (review) => String(review?.id || "") === target,
        ) || null
      );
    }
    return (
      (this._host._reviews || []).find(
        (review) => String(review?.id || "") === target,
      ) || null
    );
  }

  findReviewForEvent(event) {
    const eventId = String(event?.id || event || "").trim();
    if (!eventId) return null;
    const eventCamera = String(event?.camera || "").trim();
    const reviews = [];
    const seen = new Set();
    for (const review of [
      ...(this._host._reviews || []),
      ...this.allGridReviews(),
    ]) {
      const reviewId = String(review?.id || "").trim();
      if (!reviewId || seen.has(reviewId)) continue;
      seen.add(reviewId);
      reviews.push(review);
    }

    let fallback = null;
    for (const review of reviews) {
      const detections = Array.isArray(review?.data?.detections)
        ? review.data.detections
        : [];
      if (!detections.some((id) => String(id) === eventId)) continue;
      if (!fallback) fallback = review;
      if (!eventCamera || String(review?.camera || "") === eventCamera) {
        return review;
      }
    }
    return fallback;
  }

  async loadGridMixedTabData(tab, { onProgress = null } = {}) {
    const before = this._host._winEnd;
    const reviewDays = this._host._config?.alerts_reviews_days || 3;
    const selectedDay =
      this._host._isCardViewPageActive?.() === true
        ? ""
        : this._host._calSelectedDay || "";
    const reviewsAfter = selectedDay
      ? this._host._winStart
      : Math.max(0, Math.floor(before - reviewDays * 86400));
    for (const camera of flattenCameraMembers(
      this._host._config.cameras || [],
    )) {
      const showAllReviews = camera?.alerts_content === "all_reviews";
      const reviewSeverity = showAllReviews ? "" : "alert";
      const entity = camera.entity;
      if (!entity) continue;
      try {
        if (!this._host._camCache[entity]?.discovered) {
          await this._host._discoverOne(entity);
        }
      } catch (_) {
        continue;
      }
      const cache = this._host._camCache[entity];
      const clientId = cache?.clientId;
      const cam = cache?.cam;
      if (!clientId || !cam) continue;

      try {
        if (tab === "alerts") {
          const resolved =
            await (selectedDay
              ? this._host._browseWindowLoaderController?.fetchWindowedReviews?.(
                  clientId,
                  cam,
                  reviewsAfter,
                  before,
                  {
                    debugLabel: "grid-alerts-selected-day",
                    severity: reviewSeverity,
                  },
                ) ??
                this._host._fetchWindowedReviews?.(
                  clientId,
                  cam,
                  reviewsAfter,
                  before,
                  {
                    debugLabel: "grid-alerts-selected-day",
                    severity: reviewSeverity,
                  },
                )
              : this._host._browseWindowLoaderController?.fetchRecentActiveDayReviews?.(
                  clientId,
                  cam,
                  before,
                  reviewDays,
                  {
                    debugLabel: "grid-alerts-tab",
                    severity: reviewSeverity,
                    itemFilter: showAllReviews
                      ? null
                      : reviewMatchesAlertsOnlyMode,
                  },
                ) ??
                this._host._fetchWindowedReviews?.(
                  clientId,
                  cam,
                  reviewsAfter,
                  before,
                  {
                    debugLabel: "grid-alerts-tab",
                    severity: reviewSeverity,
                  },
                ));
          if (
            this._host._winEnd !== before ||
            (this._host._isCardViewPageActive?.() === true
              ? ""
              : this._host._calSelectedDay || "") !== selectedDay
          ) {
            return;
          }
          const reviews = Array.isArray(resolved?.items)
            ? resolved.items
            : resolved;
          const normalizedReviews = Array.isArray(reviews) ? reviews : [];
          const nextReviews = showAllReviews
            ? normalizedReviews
            : normalizedReviews.filter((review) =>
                reviewMatchesAlertsOnlyMode(review),
              );
          const windowLoader = this._host._browseWindowLoaderController;
          if (typeof windowLoader?.cacheCameraWindowReviews === "function") {
            windowLoader.cacheCameraWindowReviews(
              entity,
              clientId,
              cam,
              before,
              nextReviews,
              camera?.alerts_content,
            );
          } else {
            cache.reviews = nextReviews;
            cache.reviewsWindowKey = "";
          }
        }
        if (tab === "kept") {
          const kept = await this._host._ws({
            type: "frigate/events/get",
            instance_id: clientId,
            cameras: [cam],
            favorites: true,
            limit: 50,
          });
          cache.kept = Array.isArray(kept) ? kept : [];
        }
      } catch (_) {}
      if (typeof onProgress === "function") {
        try {
          onProgress({ entity, tab });
        } catch (_) {}
      }
    }
  }

  allDisplayEvents() {
    if (this._host._eventsMode === "all") {
      const seen = new Set();
      const all = [];
      for (const camera of flattenCameraMembers(
        this._host._config.cameras || [],
      )) {
        const cache = this._host._camCache[camera.entity];
        if (!cache) continue;
        for (const event of cache.events || []) {
          if (seen.has(event.id)) continue;
          seen.add(event.id);
          all.push(event);
        }
      }
      return all.sort((a, b) => b.start_time - a.start_time);
    }
    return this._host._events;
  }

  _eventLookupSources() {
    const sources = [];
    const seen = new Set();
    const add = (events) => {
      if (!Array.isArray(events) || seen.has(events)) return;
      seen.add(events);
      sources.push(events);
    };

    if (this._host._eventsMode !== "all") add(this._host._events);
    for (const camera of flattenCameraMembers(
      this._host._config?.cameras || [],
    )) {
      add(this._host._camCache?.[camera.entity]?.events);
    }
    add(this._host._kept);
    return sources;
  }

  _eventLookupIndex() {
    const sources = this._eventLookupSources();
    const cachedSources = this._eventLookupCache.sources;
    const cacheCurrent =
      cachedSources.length === sources.length &&
      sources.every(
        (events, index) =>
          cachedSources[index]?.events === events &&
          cachedSources[index]?.length === events.length,
      );
    if (cacheCurrent) return this._eventLookupCache.byId;

    const byId = new Map();
    for (const events of sources) {
      for (const event of events) {
        const eventId = event?.id;
        if (!eventId || byId.has(eventId)) continue;
        byId.set(eventId, event);
      }
    }
    this._eventLookupCache = {
      sources: sources.map((events) => ({ events, length: events.length })),
      byId,
    };
    return byId;
  }

  findEventById(id) {
    if (!id) return null;
    return this._eventLookupIndex().get(id) || null;
  }
}
