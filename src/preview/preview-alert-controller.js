import {
  isPreviewReviewFresh,
  normalizePreviewAlertSeverity,
  normalizePreviewCellSeverity,
} from "./preview-utils.js";
import {
  findFirstReviewCandidateForEntity,
  selectNewestReviewCandidate,
} from "../data/review-candidate-utils.js";

export class PreviewAlertController {
  constructor(host, constants) {
    this._host = host;
    this._constants = constants;
    this._alertWatchT = null;
    this._alertCleanupT = null;
    this._alertExpiresByEntity = new Map();
    this._alertSeverityByEntity = new Map();
    this._handledReviewIds = new Set();
    this._startedAtSec = 0;
  }

  clearTimers() {
    if (this._alertWatchT) clearTimeout(this._alertWatchT);
    if (this._alertCleanupT) clearTimeout(this._alertCleanupT);
    this._alertWatchT = null;
    this._alertCleanupT = null;
  }

  clearAlertTracking() {
    this._alertExpiresByEntity.clear();
    this._alertSeverityByEntity.clear();
    this._handledReviewIds.clear();
  }

  isCameraAlertLive(entity) {
    const until = Number(this._alertExpiresByEntity.get(entity) || 0);
    return until > Date.now();
  }

  previewCellSeverity(entity) {
    if (!this.isCameraAlertLive(entity)) {
      this._alertSeverityByEntity.delete(entity);
      return "";
    }
    return normalizePreviewCellSeverity(
      this._alertSeverityByEntity.get(entity),
    );
  }

  markAlertCamera(entity, severity = "alert", holdMs = null) {
    if (!entity) return;
    const normalizedSeverity = normalizePreviewAlertSeverity(severity);
    const defaultHoldMs = this._constants.PREVIEW_ALERT_HOLD_MS;
    this._alertSeverityByEntity.set(entity, normalizedSeverity);
    this._alertExpiresByEntity.set(
      entity,
      Date.now() + Math.max(1000, Number(holdMs) || defaultHoldMs),
    );
    this._scheduleAlertCleanup();
    if (this._host._isPreviewPageActive()) this._host._renderPreviewPage();
  }

  rememberHandledReview(reviewId) {
    const id = String(reviewId || "").trim();
    if (!id) return;
    this._handledReviewIds.add(id);
    if (this._handledReviewIds.size <= 200) return;
    const oldest = this._handledReviewIds.values().next().value;
    if (oldest) this._handledReviewIds.delete(oldest);
  }

  isReviewFresh(review) {
    return isPreviewReviewFresh({
      previewStartedAtSec: this._startedAtSec,
      reviewStartSec: this._host._reviewStartTimeSec(review),
      graceSec: this._constants.SLIDESHOW_REVIEW_FRESHNESS_GRACE_SEC,
    });
  }

  async probeLatestAlert() {
    if (!this._host._isPreviewPageActive()) return;
    const before = Math.floor(Date.now() / 1000);
    const after = Math.max(
      0,
      Math.floor(
        before -
          (this._host._config?.alerts_reviews_days || 3) * this._constants.DAY,
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
      cache.reviews = reviews;
      const candidate = findFirstReviewCandidateForEntity({
        reviews,
        entity,
        isReviewFresh: (review) => this.isReviewFresh(review),
        normalizeSeverity: (review) =>
          this._host._normalizeReviewSeverity(review),
        shouldHandleSeverity: (targetEntity, severity) =>
          this._host._shouldHandleSlideshowReview(targetEntity, severity),
        isHandledReviewId: (reviewId) => this._handledReviewIds.has(reviewId),
        reviewStartTime: (review) => this._host._reviewStartTimeSec(review),
      });
      if (candidate) candidates.push(candidate);
    }
    if (!candidates.length) return;
    const next = selectNewestReviewCandidate(candidates);
    if (!next?.entity) return;
    if (next.reviewId) this.rememberHandledReview(next.reviewId);
    this.markAlertCamera(
      next.entity,
      next.severity,
      this._constants.PREVIEW_ALERT_HOLD_MS,
    );
  }

  scheduleAlertWatch(delayMs = null) {
    if (this._alertWatchT) clearTimeout(this._alertWatchT);
    if (!this._host._isPreviewPageActive()) return;
    const wait =
      delayMs == null
        ? Math.max(
            1200,
            Math.floor(this._host._effectiveRealtimePollSeconds() * 1000),
          )
        : Math.max(0, Number(delayMs) || 0);
    this._alertWatchT = setTimeout(() => {
      this._alertWatchT = null;
      void this.probeLatestAlert().finally(() => {
        this.scheduleAlertWatch();
      });
    }, wait);
  }

  handleRealtimeMessage(msg) {
    if (!this._host._isPreviewPageActive()) return;
    const incomingCam = this._host._extractRealtimeMessageCamera(msg);
    if (!incomingCam) return;
    const cam = this._host._cameraEntityForIncomingCamera(incomingCam);
    if (!cam) return;
    const type = String(msg?.type || "")
      .trim()
      .toLowerCase();
    const severity = this._host._extractRealtimeMessageSeverity(msg);
    if (type === "end") {
      if (this.isCameraAlertLive(cam)) {
        this.markAlertCamera(
          cam,
          this.previewCellSeverity(cam),
          this._constants.PREVIEW_ALERT_END_GRACE_MS,
        );
      }
      return;
    }
    if (!this._host._shouldHandleSlideshowReview(cam, severity)) return;
    this.markAlertCamera(
      cam,
      severity || "alert",
      this._constants.PREVIEW_ALERT_HOLD_MS,
    );
  }

  start() {
    if (!this._host._isPreviewPageActive()) return;
    this._startedAtSec = Math.floor(Date.now() / 1000);
    this.clearTimers();
    this.clearAlertTracking();
    this._host._renderPreviewPage();
    this.scheduleAlertWatch(350);
  }

  stop() {
    this.clearTimers();
  }

  _scheduleAlertCleanup() {
    if (this._alertCleanupT) clearTimeout(this._alertCleanupT);
    let nextExpiry = 0;
    for (const until of this._alertExpiresByEntity.values()) {
      const ts = Number(until || 0);
      if (ts <= Date.now()) continue;
      if (!nextExpiry || ts < nextExpiry) nextExpiry = ts;
    }
    if (!nextExpiry) {
      this._alertCleanupT = null;
      return;
    }
    const wait = Math.max(100, nextExpiry - Date.now() + 25);
    this._alertCleanupT = setTimeout(() => {
      this._alertCleanupT = null;
      let changed = false;
      const now = Date.now();
      for (const [entity, until] of this._alertExpiresByEntity.entries()) {
        if (Number(until || 0) <= now) {
          this._alertExpiresByEntity.delete(entity);
          this._alertSeverityByEntity.delete(entity);
          changed = true;
        }
      }
      if (changed && this._host._isPreviewPageActive()) {
        this._host._renderPreviewPage();
      }
      this._scheduleAlertCleanup();
    }, wait);
  }
}
