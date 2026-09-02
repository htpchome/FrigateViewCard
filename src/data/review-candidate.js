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

export function rememberHandledReviewId(
  handledReviewIds,
  reviewId,
  maxSize = 200,
) {
  const id = String(reviewId || "").trim();
  if (!id || !(handledReviewIds instanceof Set)) return;
  handledReviewIds.add(id);
  if (handledReviewIds.size <= Math.max(1, Number(maxSize) || 200)) return;
  const oldest = handledReviewIds.values().next().value;
  if (oldest) handledReviewIds.delete(oldest);
}

export async function findNewestReviewCandidateAcrossCameras({
  cameras,
  getEntity,
  getCache,
  fetchReviews,
  buildCandidate,
  onReviewsFetched,
}) {
  const list = Array.isArray(cameras) ? cameras : [];
  const candidates = [];
  for (const camera of list) {
    const entity = String(getEntity?.(camera) || "").trim();
    if (!entity) continue;
    const cache = getCache?.(entity);
    if (!cache?.clientId || !cache?.cam) continue;
    let reviews = [];
    try {
      const batch = await fetchReviews?.({ entity, cache, camera });
      reviews = Array.isArray(batch) ? batch : [];
    } catch (_) {
      reviews = [];
    }
    if (typeof onReviewsFetched === "function") {
      onReviewsFetched({ entity, cache, camera, reviews });
    }
    const candidate = buildCandidate?.({ entity, cache, camera, reviews });
    if (candidate) candidates.push(candidate);
  }
  return selectNewestReviewCandidate(candidates);
}
