/**
 * Determines whether a slideshow review belongs to the active session window.
 * @param {object} args
 * @param {number} args.slideshowStartedAtSec
 * @param {number} args.reviewStartSec
 * @param {number} args.graceSec
 * @returns {boolean}
 */
export function isSlideshowReviewFresh({
  slideshowStartedAtSec,
  reviewStartSec,
  graceSec,
}) {
  const startedAt = Number(slideshowStartedAtSec || 0);
  if (startedAt <= 0) return true;

  const reviewStart = Number(reviewStartSec || 0);
  if (reviewStart <= 0) return false;

  return reviewStart >= startedAt - Number(graceSec || 0);
}

/**
 * Tracks a handled slideshow review id and bounds set growth.
 * @param {Set<string>} handledSet
 * @param {string} reviewId
 * @param {number} maxSize
 */
export function rememberHandledSlideshowReview(
  handledSet,
  reviewId,
  maxSize = 200,
) {
  const id = String(reviewId || "").trim();
  if (!id || !(handledSet instanceof Set)) return;
  handledSet.add(id);
  if (handledSet.size <= Math.max(1, Number(maxSize) || 200)) return;
  const oldest = handledSet.values().next().value;
  if (oldest) handledSet.delete(oldest);
}

/**
 * Resolves slideshow review watch polling interval in milliseconds.
 * @param {object} args
 * @param {number} args.realtimePollSeconds
 * @param {number} args.minMs
 * @param {number} args.maxMs
 * @returns {number}
 */
export function slideshowReviewWatchIntervalMs({
  realtimePollSeconds,
  minMs,
  maxMs,
}) {
  const realtimePollMs = Math.floor(Number(realtimePollSeconds || 0) * 1000);
  const min = Math.max(0, Number(minMs) || 0);
  const max = Math.max(min, Number(maxMs) || min);
  return Math.max(min, Math.min(max, realtimePollMs));
}
