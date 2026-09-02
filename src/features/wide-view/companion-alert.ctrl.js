import {
  findFirstReviewCandidateForEntity,
  findNewestReviewCandidateAcrossCameras,
  rememberHandledReviewId,
} from "../../data/review-candidate.js";
import { parseRealtimeAlertMessage } from "../../data/realtime-alert.js";
import { flattenCameraMembers } from "../camera-groups/model.js";

const normalizeAlertSeverity = (value) =>
  String(value || "")
    .trim()
    .toLowerCase() === "detection"
    ? "detection"
    : "alert";

const normalizeCellSeverity = (value) => {
  const normalized = String(value || "")
    .trim()
    .toLowerCase();
  return normalized === "alert" || normalized === "detection"
    ? normalized
    : "";
};

export class WideViewCompanionAlertController {
  constructor(host, constants, options = {}) {
    this._host = host;
    this._constants = constants;
    this._isActive =
      typeof options.isActive === "function" ? options.isActive : () => false;
    this._onStateChange =
      typeof options.onStateChange === "function"
        ? options.onStateChange
        : () => {};
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
    return Number(this._alertExpiresByEntity.get(entity) || 0) > Date.now();
  }

  cellSeverity(entity) {
    if (!this.isCameraAlertLive(entity)) {
      this._alertSeverityByEntity.delete(entity);
      return "";
    }
    return normalizeCellSeverity(this._alertSeverityByEntity.get(entity));
  }

  markAlertCamera(
    entity,
    severity = "alert",
    holdMs = null,
    { allowTakeover = true } = {},
  ) {
    if (!entity || !this._isActive()) return false;
    const wasLive = this.isCameraAlertLive(entity);
    const previousSeverity = this.cellSeverity(entity);
    const normalizedSeverity = normalizeAlertSeverity(severity);
    const defaultHoldMs =
      this._host._previewAlertHoldMs?.() ||
      this._constants.PREVIEW_ALERT_HOLD_MS;
    this._alertSeverityByEntity.set(entity, normalizedSeverity);
    this._alertExpiresByEntity.set(
      entity,
      Date.now() + Math.max(1000, Number(holdMs) || defaultHoldMs),
    );
    this._scheduleAlertCleanup();
    const changed = !wasLive || previousSeverity !== normalizedSeverity;
    this._onStateChange({
      entity,
      severity: normalizedSeverity,
      changed,
      allowTakeover,
    });
    return changed;
  }

  rememberHandledReview(reviewId) {
    rememberHandledReviewId(this._handledReviewIds, reviewId);
  }

  isReviewFresh(review) {
    const startedAt = Number(this._startedAtSec || 0);
    if (startedAt <= 0) return true;
    const reviewStart = Number(this._host._reviewStartTimeSec(review) || 0);
    if (reviewStart <= 0) return false;
    return (
      reviewStart >=
      startedAt -
        Number(this._constants.SLIDESHOW_REVIEW_FRESHNESS_GRACE_SEC || 0)
    );
  }

  async probeLatestAlert() {
    if (!this._isActive()) return;
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
      cameras: flattenCameraMembers(this._host._config?.cameras),
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
      onReviewsFetched: ({ entity, reviews }) =>
        this._host._browseWindowLoaderController?.mergeLatestCameraReviews?.(
          entity,
          reviews,
        ),
      buildCandidate: ({ entity, reviews }) =>
        findFirstReviewCandidateForEntity({
          reviews,
          entity,
          isReviewFresh: (review) => this.isReviewFresh(review),
          normalizeSeverity: (review) =>
            this._host._normalizeReviewSeverity(review),
          shouldHandleSeverity: (targetEntity, targetSeverity) =>
            this._host._shouldHandleSlideshowReview(
              targetEntity,
              targetSeverity,
            ),
          isHandledReviewId: (reviewId) =>
            this._handledReviewIds.has(reviewId),
          reviewStartTime: (review) =>
            this._host._reviewStartTimeSec(review),
        }),
    });
    if (!next?.entity) return;
    if (next.reviewId) this.rememberHandledReview(next.reviewId);
    this.markAlertCamera(
      next.entity,
      next.severity,
      this._host._previewAlertHoldMs?.(),
    );
  }

  scheduleAlertWatch(delayMs = null) {
    if (this._alertWatchT) clearTimeout(this._alertWatchT);
    if (!this._isActive()) return;
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
    if (!this._isActive()) return;
    const parsed = parseRealtimeAlertMessage({
      host: this._host,
      msg,
      checkSeverity: false,
    });
    if (!parsed) {
      if (this._host._isRealtimeEventMessage?.(msg)) {
        this.scheduleAlertWatch(180);
      }
      return;
    }
    const { cam, severity, type } = parsed;
    const normalizedSeverity = String(severity || "")
      .trim()
      .toLowerCase();

    if (type !== "end" && !normalizedSeverity) {
      this.scheduleAlertWatch(180);
      return;
    }

    if (type === "end") {
      if (this.isCameraAlertLive(cam)) {
        this.markAlertCamera(
          cam,
          this.cellSeverity(cam),
          this._constants.PREVIEW_ALERT_END_GRACE_MS,
          { allowTakeover: false },
        );
      }
      return;
    }
    if (!this._host._shouldHandleSlideshowReview(cam, normalizedSeverity)) {
      return;
    }
    this.markAlertCamera(
      cam,
      normalizedSeverity,
      this._host._previewAlertHoldMs?.(),
    );
  }

  start() {
    if (!this._isActive()) return;
    this._startedAtSec = Math.floor(Date.now() / 1000);
    this.clearTimers();
    this.clearAlertTracking();
    this.scheduleAlertWatch(350);
  }

  stop() {
    this.clearTimers();
    this.clearAlertTracking();
    this._startedAtSec = 0;
  }

  _scheduleAlertCleanup() {
    if (this._alertCleanupT) clearTimeout(this._alertCleanupT);
    let nextExpiry = 0;
    for (const until of this._alertExpiresByEntity.values()) {
      const timestamp = Number(until || 0);
      if (timestamp <= Date.now()) continue;
      if (!nextExpiry || timestamp < nextExpiry) nextExpiry = timestamp;
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
        if (Number(until || 0) > now) continue;
        this._alertExpiresByEntity.delete(entity);
        this._alertSeverityByEntity.delete(entity);
        changed = true;
      }
      if (changed && this._isActive()) {
        this._onStateChange({ expired: true, changed: false });
      }
      this._scheduleAlertCleanup();
    }, wait);
  }
}
