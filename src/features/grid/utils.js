/**
 * Normalizes grid alert severity input for tracked state.
 * @param {string} value
 * @returns {"detection"|"alert"}
 */
export function normalizeGridAlertSeverity(value) {
  return String(value || "")
    .trim()
    .toLowerCase() === "detection"
    ? "detection"
    : "alert";
}

/**
 * Normalizes persisted grid cell severity to supported visual states.
 * @param {string} value
 * @returns {"detection"|"alert"|""}
 */
export function normalizeGridCellSeverity(value) {
  const normalized = String(value || "")
    .trim()
    .toLowerCase();
  if (normalized === "detection") return "detection";
  if (normalized === "alert") return "alert";
  return "";
}

/**
 * Checks whether a review timestamp is fresh for grid startup context.
 * @param {object} args
 * @param {number} args.gridStartedAtSec
 * @param {number} args.reviewStartSec
 * @param {number} args.graceSec
 * @returns {boolean}
 */
export function isGridReviewFresh({
  gridStartedAtSec,
  reviewStartSec,
  graceSec,
}) {
  const startedAt = Number(gridStartedAtSec || 0);
  if (startedAt <= 0) return true;

  const reviewStart = Number(reviewStartSec || 0);
  if (reviewStart <= 0) return false;

  return reviewStart >= startedAt - Number(graceSec || 0);
}

/**
 * Resolves grid alert watch polling interval in milliseconds.
 * @param {number} realtimePollSeconds
 * @returns {number}
 */
export function gridAlertWatchIntervalMs(realtimePollSeconds) {
  return Math.max(1000, Math.floor(Number(realtimePollSeconds || 0) * 1000));
}
