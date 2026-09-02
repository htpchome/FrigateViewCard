import { DAY } from "../../constants.js";
import { isCameraGroup } from "../camera-groups/model.js";
import { reviewMatchesAlertsOnlyMode } from "./filter-state.js";

export class BrowseTabDataController {
  constructor(host) {
    this._host = host;
  }

  async loadKept() {
    const { clientId, cam } = this._host._cc();
    try {
      const collection = this._host._browseCollectionController;
      if (
        this._host._config?.favorites_mixed_cameras !== false &&
        typeof collection?.loadGridMixedTabData === "function" &&
        typeof collection?.allGridKeptEvents === "function"
      ) {
        await collection.loadGridMixedTabData("kept");
        this._host._kept = collection
          .allGridKeptEvents()
          .sort(
            (left, right) =>
              Number(right?.start_time || 0) - Number(left?.start_time || 0),
          );
        return;
      }
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
      const after = this._host._winStart;
      const before = this._host._winEnd;
      const days = this._host._config?.alerts_reviews_days || 3;
      const selectedDay = this._host._calSelectedDay || "";
      const windowLoader = this._host._browseWindowLoaderController;
      if (isCameraGroup(this._host._activeCam)) {
        windowLoader?.publishActiveGroupCombined?.("reviews", {
          render: false,
        });
        return;
      }
      if (windowLoader?.hasCachedWindowReviews?.(clientId, cam, before)) {
        const entity = this._host._activeCam?.entity;
        const cachedReviews = this._host._camCache[entity]?.reviews || [];
        this._host._reviews = cachedReviews;
        return;
      }
      const showAllReviews =
        this._host._activeCam?.alerts_content === "all_reviews";
      const reviewSeverity = showAllReviews ? "" : "alert";
      const resolved =
        await (selectedDay
          ? windowLoader?.fetchWindowedReviews?.(
              clientId,
              cam,
              after,
              before,
              {
                debugLabel: "alerts-tab-selected-day",
                severity: reviewSeverity,
              },
            ) ??
            this._host._fetchWindowedReviews?.(
              clientId,
              cam,
              after,
              before,
              {
                debugLabel: "alerts-tab-selected-day",
                severity: reviewSeverity,
              },
            )
          : windowLoader?.fetchRecentActiveDayReviews?.(
              clientId,
              cam,
              before,
              days,
              {
                debugLabel: "alerts-tab",
                severity: reviewSeverity,
                itemFilter: showAllReviews
                  ? null
                  : reviewMatchesAlertsOnlyMode,
              },
            ) ??
            this._host._fetchWindowedReviews?.(
              clientId,
              cam,
              Math.max(0, Math.floor(before - days * DAY)),
              before,
              {
                debugLabel: "alerts-tab",
                severity: reviewSeverity,
              },
            ));
      const activeContext = this._host._cc();
      if (
        activeContext?.clientId !== clientId ||
        activeContext?.cam !== cam ||
        Math.floor(this._host._winEnd) !== Math.floor(before) ||
        (this._host._calSelectedDay || "") !== selectedDay
      ) {
        return;
      }
      const reviews = Array.isArray(resolved?.items)
        ? resolved.items
        : resolved;
      const normalizedReviews = Array.isArray(reviews) ? reviews : [];
      const cameraReviews = showAllReviews
        ? normalizedReviews
        : normalizedReviews.filter((review) =>
            reviewMatchesAlertsOnlyMode(review),
          );
      windowLoader?.cacheWindowReviews?.(
        clientId,
        cam,
        before,
        cameraReviews,
      ) ?? this._host._cacheActiveCamSlice?.("reviews", cameraReviews);
      this._host._reviews = cameraReviews;
      this._host._slideshowAlertController.handleReviewsUpdated(
        this._host._activeCam?.entity || "",
        cameraReviews,
        "alerts-tab",
      );
    } catch (_) {
      if (!isCameraGroup(this._host._activeCam)) this._host._reviews = [];
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
        tab === "alerts"
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
