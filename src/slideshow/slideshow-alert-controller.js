import {
  isSlideshowReviewFresh,
  rememberHandledSlideshowReview,
  slideshowReviewWatchIntervalMs,
} from "./slideshow-utils.js";
import {
  findFirstReviewCandidateForEntity,
  findNewestReviewCandidateAcrossCameras,
} from "../data/review-candidate-utils.js";
import { parseRealtimeAlertMessage } from "../data/realtime-alert-message-utils.js";

export class SlideshowAlertController {
  constructor(host, constants) {
    this._host = host;
    this._constants = constants;
  }

  isReviewFresh(review) {
    return isSlideshowReviewFresh({
      slideshowStartedAtSec: this._host._slideshowStartedAtSec,
      reviewStartSec: this._host._reviewStartTimeSec(review),
      graceSec: this._constants.SLIDESHOW_REVIEW_FRESHNESS_GRACE_SEC,
    });
  }

  rememberHandledReview(reviewId) {
    rememberHandledSlideshowReview(
      this._host._slideshowHandledReviewIds,
      reviewId,
    );
  }

  handleReviewsUpdated(entity, reviews, source = "reviews-update") {
    if (
      !this._host._slideshowActive ||
      !this._host._isSlideshowRotationAvailable()
    ) {
      return;
    }
    if (!entity || !Array.isArray(reviews) || !reviews.length) return;

    const nextReview = findFirstReviewCandidateForEntity({
      reviews,
      entity,
      isReviewFresh: (review) => this.isReviewFresh(review),
      normalizeSeverity: (review) =>
        this._host._normalizeReviewSeverity(review),
      shouldHandleSeverity: (targetEntity, severity) =>
        this._host._shouldHandleSlideshowReview(targetEntity, severity),
      isHandledReviewId: (reviewId) =>
        this._host._slideshowHandledReviewIds.has(reviewId),
      reviewStartTime: (review) => this._host._reviewStartTimeSec(review),
    });
    if (!nextReview) return;
    if (nextReview.reviewId) this.rememberHandledReview(nextReview.reviewId);

    if (this._host._slideshowPopupPaused) {
      this._host._slideshowPendingAlertCam = nextReview.entity;
      this._host._slideshowPendingAlertType = nextReview.severity;
      this._host._setSlideshowAlertState(nextReview.severity);
      return;
    }

    const now = Date.now();
    const activeEntity = this._host._activeCam?.entity || "";
    this._host._slideshowLastAlertAt = now;
    this._host._slideshowLastAlertCam = nextReview.entity;
    this._host._slideshowPausedUntil = now + this._host._slideshowRotationMs();
    this._host._setSlideshowAlertState(nextReview.severity);

    if (nextReview.entity === activeEntity) {
      this._host._scheduleSlideshowRotation(`${source}-active`);
      return;
    }

    const idx = this._host._cameraIndexByEntity(nextReview.entity);
    if (idx < 0) return;
    this._host._slideshowPendingAlertCam = "";
    this._host._slideshowPendingAlertType = "";
    void this._host._switchCamera(idx, { source: "alert" });
    this._host._scheduleSlideshowRotation(`${source}-switch`);
  }

  async probeLatestReview() {
    if (
      !this._host._slideshowActive ||
      !this._host._isSlideshowRotationAvailable() ||
      this._host._slideshowReviewProbeInFlight
    ) {
      return;
    }
    this._host._slideshowReviewProbeInFlight = true;
    try {
      const before = Math.floor(Date.now() / 1000);
      const after = Math.max(
        0,
        Math.floor(
          before -
            (this._host._config?.alerts_reviews_days || 3) *
              this._constants.DAY,
        ),
      );
      const next = await findNewestReviewCandidateAcrossCameras({
        cameras: this._host._config?.cameras,
        getEntity: (camera) => camera?.entity,
        getCache: (entity) => this._host._camCache[entity],
        fetchReviews: async ({ cache }) =>
          this._host._ws({
            type: "frigate/reviews/get",
            instance_id: cache.clientId,
            cameras: [cache.cam],
            after,
            before,
            limit: 5,
          }),
        buildCandidate: ({ entity, reviews }) =>
          findFirstReviewCandidateForEntity({
            reviews,
            entity,
            isReviewFresh: (review) => this.isReviewFresh(review),
            normalizeSeverity: (review) =>
              this._host._normalizeReviewSeverity(review),
            shouldHandleSeverity: (targetEntity, severity) =>
              this._host._shouldHandleSlideshowReview(targetEntity, severity),
            isHandledReviewId: (reviewId) =>
              this._host._slideshowHandledReviewIds.has(reviewId),
            reviewStartTime: (review) => this._host._reviewStartTimeSec(review),
          }),
      });
      if (!next?.entity) return;
      if (next.reviewId) this.rememberHandledReview(next.reviewId);

      if (this._host._slideshowPopupPaused) {
        this._host._slideshowPendingAlertCam = next.entity;
        this._host._slideshowPendingAlertType = next.severity;
        this._host._setSlideshowAlertState(next.severity);
        return;
      }

      const activeEntity = this._host._activeCam?.entity || "";
      this._host._slideshowLastAlertAt = Date.now();
      this._host._slideshowLastAlertCam = next.entity;
      this._host._slideshowPausedUntil =
        Date.now() + this._host._slideshowRotationMs();
      this._host._setSlideshowAlertState(next.severity);

      if (next.entity === activeEntity) {
        this._host._scheduleSlideshowRotation("probe-active-review");
        return;
      }

      const idx = this._host._cameraIndexByEntity(next.entity);
      if (idx < 0) return;
      this._host._slideshowPendingAlertCam = "";
      this._host._slideshowPendingAlertType = "";
      void this._host._switchCamera(idx, { source: "alert" });
      this._host._scheduleSlideshowRotation("probe-review-switch");
    } finally {
      this._host._slideshowReviewProbeInFlight = false;
    }
  }

  scheduleReviewProbe(delayMs = 180) {
    if (
      !this._host._slideshowActive ||
      !this._host._isSlideshowRotationAvailable()
    ) {
      return;
    }
    if (this._host._slideshowReviewProbeT) {
      clearTimeout(this._host._slideshowReviewProbeT);
    }
    this._host._slideshowReviewProbeT = setTimeout(
      () => {
        this._host._slideshowReviewProbeT = null;
        void this.probeLatestReview();
      },
      Math.max(0, Number(delayMs) || 0),
    );
  }

  reviewWatchIntervalMs() {
    return slideshowReviewWatchIntervalMs({
      realtimePollSeconds: this._host._effectiveRealtimePollSeconds(),
      minMs: this._constants.SLIDESHOW_REVIEW_WATCH_MIN_MS,
      maxMs: this._constants.SLIDESHOW_REVIEW_WATCH_MAX_MS,
    });
  }

  scheduleReviewWatch(delayMs = null) {
    if (
      !this._host._slideshowActive ||
      !this._host._isSlideshowRotationAvailable()
    ) {
      return;
    }
    if (this._host._slideshowReviewWatchT) {
      clearTimeout(this._host._slideshowReviewWatchT);
    }
    const wait =
      delayMs == null
        ? this.reviewWatchIntervalMs()
        : Math.max(0, Number(delayMs) || 0);
    this._host._slideshowReviewWatchT = setTimeout(() => {
      this._host._slideshowReviewWatchT = null;
      void this.probeLatestReview().finally(() => {
        this.scheduleReviewWatch();
      });
    }, wait);
  }

  handleRealtimeMessage(msg) {
    if (
      !this._host._slideshowActive ||
      !this._host._isSlideshowRotationAvailable()
    ) {
      return;
    }
    this.scheduleReviewProbe();
    const parsed = parseRealtimeAlertMessage({ host: this._host, msg });
    if (!parsed) return;
    const { cam, severity } = parsed;

    if (this._host._slideshowPopupPaused) {
      this._host._slideshowPendingAlertCam = cam;
      this._host._slideshowPendingAlertType = severity;
      this._host._setSlideshowAlertState(severity);
      return;
    }

    const now = Date.now();
    const activeEntity = this._host._activeCam?.entity || "";
    this._host._slideshowLastAlertAt = now;
    this._host._slideshowLastAlertCam = cam;

    if (cam === activeEntity) {
      this._host._slideshowPendingAlertCam = "";
      this._host._slideshowPendingAlertType = "";
      this._host._slideshowPausedUntil =
        now + this._host._slideshowRotationMs();
      this._host._setSlideshowAlertState(severity);
      this._host._scheduleSlideshowRotation("active-alert");
      return;
    }

    const idx = this._host._cameraIndexByEntity(cam);
    if (idx < 0) return;
    this._host._slideshowPausedUntil = now + this._host._slideshowRotationMs();
    this._host._slideshowPendingAlertCam = "";
    this._host._slideshowPendingAlertType = "";
    this._host._setSlideshowAlertState(severity);
    void this._host._switchCamera(idx, { source: "alert" });
    this._host._scheduleSlideshowRotation("alert-switch");
  }
}
