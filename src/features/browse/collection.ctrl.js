export class BrowseCollectionController {
  constructor(host) {
    this._host = host;
  }

  allGridReviews() {
    const reviews = [];
    const seen = new Set();
    for (const camera of this._host._config.cameras || []) {
      const cache = this._host._camCache[camera.entity];
      for (const review of cache?.reviews || []) {
        const id = String(review?.id || "");
        if (!id || seen.has(id)) continue;
        seen.add(id);
        reviews.push(review);
      }
    }
    return reviews;
  }

  allGridKeptEvents() {
    const events = [];
    const seen = new Set();
    for (const camera of this._host._config.cameras || []) {
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
    if (this._host._isGridMixedListMode()) {
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

  async loadGridMixedTabData(tab) {
    const before = this._host._winEnd;
    const reviewsAfter = Math.max(
      0,
      Math.floor(
        before - (this._host._config?.alerts_reviews_days || 3) * 86400,
      ),
    );
    for (const camera of this._host._config.cameras || []) {
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
          const reviews =
            await (this._host._browseWindowLoaderController?.fetchWindowedReviews?.(
              clientId,
              cam,
              reviewsAfter,
              before,
              { debugLabel: "grid-alerts-tab" },
            ) ??
              this._host._fetchWindowedReviews?.(
                clientId,
                cam,
                reviewsAfter,
                before,
                {
                  debugLabel: "grid-alerts-tab",
                },
              ));
          cache.reviews = Array.isArray(reviews) ? reviews : [];
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
    }
  }

  allDisplayEvents() {
    if (this._host._eventsMode === "all") {
      const seen = new Set();
      const all = [];
      for (const camera of this._host._config.cameras) {
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

  findEventById(id) {
    if (!id) return null;
    const all = this.allDisplayEvents();
    let event = all.find((candidate) => candidate.id === id);
    if (event) return event;
    for (const camera of this._host._config.cameras) {
      const cache = this._host._camCache[camera.entity];
      event = (cache?.events || []).find((candidate) => candidate.id === id);
      if (event) return event;
    }
    event = (this._host._kept || []).find((candidate) => candidate.id === id);
    return event || null;
  }
}
