const LIVE_STREAM_HINTS = new Set(["webrtc", "mse", "hls"]);

/**
 * Normalizes review/event severity for preview alert tracking.
 * @param {string} value Raw severity value.
 * @returns {"detection"|"alert"}
 */
export function normalizePreviewAlertSeverity(value) {
  return String(value || "")
    .trim()
    .toLowerCase() === "detection"
    ? "detection"
    : "alert";
}

/**
 * Normalizes stored preview cell severity to supported visual states.
 * @param {string} value Stored severity value.
 * @returns {"detection"|"alert"|""}
 */
export function normalizePreviewCellSeverity(value) {
  const normalized = String(value || "")
    .trim()
    .toLowerCase();
  if (normalized === "detection") return "detection";
  if (normalized === "alert") return "alert";
  return "";
}

/**
 * Resolves the best live stream hint for preview labels.
 * @param {object} args Resolver arguments.
 * @param {string} args.activeStreamType Current active stream type.
 * @param {string} args.lastLiveStreamHint Last known live stream hint.
 * @param {boolean} args.isIOS Whether the device profile is iOS.
 * @returns {"webrtc"|"mse"|"hls"}
 */
export function resolvePreviewLiveStreamHint({
  activeStreamType,
  lastLiveStreamHint,
  isIOS,
}) {
  const active = String(activeStreamType || "")
    .trim()
    .toLowerCase();
  if (LIVE_STREAM_HINTS.has(active)) return active;

  const lastHint = String(lastLiveStreamHint || "")
    .trim()
    .toLowerCase();
  if (LIVE_STREAM_HINTS.has(lastHint)) return lastHint;

  return isIOS ? "webrtc" : "mse";
}

/**
 * Produces the stream source label displayed in preview metadata.
 * @param {object} args Label arguments.
 * @param {boolean} args.useLive Whether this cell is using live mode.
 * @param {string} args.connectionType Camera connection mode.
 * @param {string} args.liveStreamHint Preview live stream hint.
 * @returns {string}
 */
export function resolvePreviewStreamSourceLabel({
  useLive,
  connectionType,
  liveStreamHint,
}) {
  if (!useLive) return "Snapshot";
  if (connectionType === "ha_direct") return "HA Live";
  const hint = String(liveStreamHint || "")
    .trim()
    .toUpperCase();
  return hint ? `${hint} Live` : "Live";
}

/**
 * Determines whether a review is fresh for preview startup windows.
 * @param {object} args Freshness arguments.
 * @param {number} args.previewStartedAtSec Preview mode start time in seconds.
 * @param {number} args.reviewStartSec Review start time in seconds.
 * @param {number} args.graceSec Allowed startup grace period in seconds.
 * @returns {boolean}
 */
export function isPreviewReviewFresh({
  previewStartedAtSec,
  reviewStartSec,
  graceSec,
}) {
  const startedAt = Number(previewStartedAtSec || 0);
  if (startedAt <= 0) return true;

  const reviewStart = Number(reviewStartSec || 0);
  if (reviewStart <= 0) return false;

  return reviewStart >= startedAt - Number(graceSec || 0);
}
