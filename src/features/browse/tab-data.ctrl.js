import { DAY } from "../../constants.js";

export class BrowseTabDataController {
  constructor(host) {
    this._host = host;
  }

  async loadKept() {
    const { clientId, cam } = this._host._cc();
    try {
      const kept = await this._host._ws({
        type: "frigate/events/get",
        instance_id: clientId,
        cameras: [cam],
        favorites: true,
        limit: 50,
      });
      this._host._kept = Array.isArray(kept) ? kept : [];
      const entity = this._host._activeCam?.entity;
      if (entity && this._host._camCache[entity]) {
        this._host._camCache[entity].kept = this._host._kept;
      }
    } catch (_) {
      this._host._kept = [];
    }
  }

  async loadReviews() {
    const { clientId, cam } = this._host._cc();
    try {
      const before = this._host._winEnd;
      const days = this._host._config?.alerts_reviews_days || 3;
      const resolved =
        await (this._host._browseWindowLoaderController?.fetchRecentActiveDayReviews?.(
          clientId,
          cam,
          before,
          days,
          { debugLabel: "alerts-tab" },
        ) ??
          this._host._fetchWindowedReviews?.(
            clientId,
            cam,
            Math.max(0, Math.floor(before - days * DAY)),
            before,
            {
              debugLabel: "alerts-tab",
            },
          ));
      const reviews = Array.isArray(resolved?.items)
        ? resolved.items
        : resolved;
      this._host._reviews = Array.isArray(reviews) ? reviews : [];
      this._host._browseWindowLoaderController?.cacheActiveCamSlice?.(
        "reviews",
        this._host._reviews,
      ) ?? this._host._cacheActiveCamSlice?.("reviews", this._host._reviews);
      this._host._slideshowAlertController.handleReviewsUpdated(
        this._host._activeCam?.entity || "",
        this._host._reviews,
        "alerts-tab",
      );
    } catch (_) {
      this._host._reviews = [];
    }
  }

  async loadTabData(tab) {
    if (
      tab !== "alerts" &&
      tab !== "kept" &&
      tab !== "recordings" &&
      tab !== "controls"
    ) {
      return;
    }
    try {
      if (tab === "alerts") await this.loadReviews();
      if (tab === "kept") await this.loadKept();
      if (
        this._host._isGridMixedListMode() &&
        (tab === "alerts" || tab === "kept")
      ) {
        await this._host._loadGridMixedTabData(tab);
      }
      if (tab === "recordings") {
        const { clientId, cam } = this._host._cc();
        if (clientId && cam) {
          await (this._host._browseWindowLoaderController?.loadWindowRecordings?.(
            clientId,
            cam,
            this._host._winEnd,
          ) ??
            this._host._loadWindowRecordings?.(
              clientId,
              cam,
              this._host._winEnd,
            ));
        }
      }
    } catch (error) {
      console.error("[Frigate] tab data load failed", error);
    } finally {
      this._host._renderList();
    }
  }
}
