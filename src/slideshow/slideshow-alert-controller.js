import {
  isSlideshowReviewFresh,
  rememberHandledSlideshowReview,
  slideshowReviewWatchIntervalMs,
} from "./slideshow-utils.js";

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

    let nextReview = null;
    for (const review of reviews) {
      if (!this.isReviewFresh(review)) continue;
      const severity = this._host._normalizeReviewSeverity(review);
      if (!this._host._shouldHandleSlideshowReview(entity, severity)) continue;
      const reviewId = String(review?.id || "").trim();
      if (reviewId && this._host._slideshowHandledReviewIds.has(reviewId)) {
        continue;
      }
      nextReview = { entity, severity, reviewId };
      break;
    }
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
      const candidates = [];

      for (const camera of this._host._config?.cameras || []) {
        const entity = camera?.entity || "";
        const cache = this._host._camCache[entity];
        if (!entity || !cache?.clientId || !cache?.cam) continue;
        let reviews = [];
        try {
          const batch = await this._host._ws({
            type: "frigate/reviews/get",
            instance_id: cache.clientId,
            cameras: [cache.cam],
            after,
            before,
            limit: 5,
          });
          reviews = Array.isArray(batch) ? batch : [];
        } catch (_) {
          reviews = [];
        }
        for (const review of reviews) {
          if (!this.isReviewFresh(review)) continue;
          const severity = this._host._normalizeReviewSeverity(review);
          if (!this._host._shouldHandleSlideshowReview(entity, severity)) {
            continue;
          }
          const reviewId = String(review?.id || "").trim();
          if (reviewId && this._host._slideshowHandledReviewIds.has(reviewId)) {
            continue;
          }
          candidates.push({
            entity,
            severity,
            reviewId,
            startTime: this._host._reviewStartTimeSec(review),
          });
          break;
        }
      }

      if (!candidates.length) return;
      candidates.sort((a, b) => b.startTime - a.startTime);
      const next = candidates[0];
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
    const incomingCam = this._host._extractRealtimeMessageCamera(msg);
    if (!incomingCam) return;
    const cam = this._host._cameraEntityForIncomingCamera(incomingCam);
    if (!cam) return;
    const severity = this._host._extractRealtimeMessageSeverity(msg);
    if (!this._host._shouldHandleSlideshowReview(cam, severity)) return;

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
