import {
  gridAlertWatchIntervalMs,
  isGridReviewFresh,
  normalizeGridAlertSeverity,
  normalizeGridCellSeverity,
} from "./grid-utils.js";

export class GridAlertController {
  constructor(host, constants) {
    this._host = host;
    this._constants = constants;
    this._alertWatchT = null;
    this._alertCleanupT = null;
    this._startedAtSec = 0;
    this._handledReviewIds = new Set();
    this._lastAlertAt = 0;
    this._lastAlertCam = "";
    this._alertExpiresByEntity = new Map();
    this._alertSeverityByEntity = new Map();
  }

  clearTimers() {
    this.clearWatchTimer();
    if (this._alertCleanupT) clearTimeout(this._alertCleanupT);
    this._alertCleanupT = null;
  }

  clearWatchTimer() {
    if (this._alertWatchT) clearTimeout(this._alertWatchT);
    this._alertWatchT = null;
  }

  clearAlertTracking() {
    this._alertExpiresByEntity.clear();
    this._alertSeverityByEntity.clear();
    if (this._alertCleanupT) clearTimeout(this._alertCleanupT);
    this._alertCleanupT = null;
  }

  startSession() {
    this._startedAtSec = Math.floor(Date.now() / 1000);
    this._handledReviewIds.clear();
    this._lastAlertAt = 0;
    this._lastAlertCam = "";
    this.clearAlertTracking();
  }

  stopSession() {
    this._startedAtSec = 0;
    this._handledReviewIds.clear();
    this._lastAlertAt = 0;
    this._lastAlertCam = "";
    this.clearAlertTracking();
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
    return isGridReviewFresh({
      gridStartedAtSec: this._startedAtSec,
      reviewStartSec: this._host._reviewStartTimeSec(review),
      graceSec: this._constants.SLIDESHOW_REVIEW_FRESHNESS_GRACE_SEC,
    });
  }

  alertWatchIntervalMs() {
    return gridAlertWatchIntervalMs(this._host._effectiveRealtimePollSeconds());
  }

  scheduleAlertWatch(delayMs = null) {
    if (!this._host._isGridModeAvailable()) return;
    if (this._host._viewMode !== "grid") return;
    this.clearWatchTimer();
    const wait =
      delayMs == null
        ? this.alertWatchIntervalMs()
        : Math.max(0, Number(delayMs) || 0);
    this._alertWatchT = setTimeout(() => {
      this._alertWatchT = null;
      void this.probeLatestAlert().finally(() => {
        this.scheduleAlertWatch();
      });
    }, wait);
  }

  isCameraAlertLive(entity) {
    const until = Number(this._alertExpiresByEntity.get(entity) || 0);
    return until > Date.now();
  }

  cellSeverity(entity) {
    if (!this.isCameraAlertLive(entity)) {
      this._alertSeverityByEntity.delete(entity);
      return "";
    }
    return normalizeGridCellSeverity(this._alertSeverityByEntity.get(entity));
  }

  scheduleAlertCleanup() {
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
    const wait = Math.max(80, nextExpiry - Date.now() + 20);
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
      if (changed && this._host._viewMode === "grid") {
        this._host._scheduleGridRefresh();
      }
      this.scheduleAlertCleanup();
    }, wait);
  }

  markAlertCamera(entity, severity = "alert") {
    if (!entity) return false;
    const wasLive = this.isCameraAlertLive(entity);
    const prevSeverity = String(this._alertSeverityByEntity.get(entity) || "")
      .trim()
      .toLowerCase();
    const normalizedSeverity = normalizeGridAlertSeverity(severity);
    this._alertSeverityByEntity.set(entity, normalizedSeverity);
    this._alertExpiresByEntity.set(
      entity,
      Date.now() + this._host._gridRotationMs(),
    );
    this.scheduleAlertCleanup();
    return !wasLive || prevSeverity !== normalizedSeverity;
  }

  async probeLatestAlert() {
    if (!this._host._isGridModeAvailable()) return;
    if (this._host._viewMode !== "grid") return;
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
      for (const review of reviews) {
        if (!this.isReviewFresh(review)) continue;
        const severity = this._host._normalizeReviewSeverity(review);
        if (!this._host._shouldHandleSlideshowReview(entity, severity)) {
          continue;
        }
        const reviewId = String(review?.id || "").trim();
        if (reviewId && this._handledReviewIds.has(reviewId)) continue;
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
    this.handleAlertCandidate(next.entity, next.severity);
  }

  handleAlertCandidate(entity, severity = "alert") {
    if (!this._host._isGridModeAvailable()) return;
    if (this._host._viewMode !== "grid") return;
    const idx = this._host._cameraIndexByEntity(entity);
    if (idx < 0) return;
    const now = Date.now();
    if (
      this._lastAlertCam === entity &&
      now - Number(this._lastAlertAt || 0) < 1200
    ) {
      return;
    }
    this._lastAlertAt = now;
    this._lastAlertCam = entity;
    const changed = this.markAlertCamera(entity, severity || "alert");
    this._host._ffDebug("Grid alert candidate", {
      entity,
      severity,
      changed,
    });
    if (changed) this._host._scheduleGridRefresh();
  }

  handleRealtimeMessage(msg) {
    if (!this._host._isGridModeAvailable()) return;
    if (this._host._viewMode !== "grid") return;
    const incomingCam = this._host._extractRealtimeMessageCamera(msg);
    if (!incomingCam) return;
    const severity = this._host._extractRealtimeMessageSeverity(msg);
    const cam = this._host._cameraEntityForIncomingCamera(incomingCam);
    if (!cam) return;
    if (!this._host._shouldHandleSlideshowReview(cam, severity)) return;
    this.handleAlertCandidate(cam, severity || "alert");
  }
}
