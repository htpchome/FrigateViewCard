export function findFirstReviewCandidateForEntity({
  reviews,
  entity,
  isReviewFresh,
  normalizeSeverity,
  shouldHandleSeverity,
  isHandledReviewId,
  reviewStartTime,
}) {
  const list = Array.isArray(reviews) ? reviews : [];
  for (const review of list) {
    if (!isReviewFresh(review)) continue;
    const severity = normalizeSeverity(review);
    if (!shouldHandleSeverity(entity, severity)) continue;
    const reviewId = String(review?.id || "").trim();
    if (reviewId && isHandledReviewId(reviewId)) continue;
    return {
      entity,
      severity,
      reviewId,
      startTime: Number(reviewStartTime(review)) || 0,
    };
  }
  return null;
}

export function selectNewestReviewCandidate(candidates) {
  if (!Array.isArray(candidates) || !candidates.length) return null;
  let newest = null;
  for (const candidate of candidates) {
    if (!candidate?.entity) continue;
    if (
      !newest ||
      Number(candidate.startTime || 0) > Number(newest.startTime || 0)
    ) {
      newest = candidate;
    }
  }
  return newest;
}
