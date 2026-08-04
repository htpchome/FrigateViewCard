export const RECORDINGS_SWIPE_LOADING_HTML =
  '<div class="empty">Loading day…</div>';
export const RECORDINGS_SWIPE_EMPTY_HTML =
  '<div class="empty">No recordings in this day</div>';

export function resolveRecordingsSwipeStageMetrics({
  list = null,
  lastRenderedListHtml = "",
}) {
  return {
    width: Math.max(1, Math.round(Number(list?.clientWidth || 1))),
    currentHtml: String(list?.innerHTML || lastRenderedListHtml || ""),
    minHeight: Math.max(
      220,
      Number(list?.scrollHeight || list?.clientHeight || 220),
    ),
  };
}

export function resolveRecordingsSwipeStageTransforms({
  offset = 0,
  direction = 0,
  width = 0,
}) {
  return {
    currentTransform: `translateX(${offset}px)`,
    incomingTransform: `translateX(${offset + direction * width}px)`,
  };
}

export function createRecordingsSwipeGestureState(direction, stage = null) {
  return {
    direction,
    stage,
    hasData: false,
    ready: false,
    bounds: null,
    recs: [],
    prepPromise: null,
  };
}

export function resolvePreparedRecordingsIncomingState({
  prep = null,
  renderRecordings = () => "",
  emptyHtml = RECORDINGS_SWIPE_EMPTY_HTML,
}) {
  const safePrep = prep || {};
  const recordings = Array.isArray(safePrep.recs) ? safePrep.recs : [];
  const hasData = !!safePrep.hasData;

  return {
    hasData,
    bounds: safePrep.bounds || null,
    recs: recordings,
    incomingHtml: hasData ? renderRecordings(recordings) : emptyHtml,
  };
}

export function resolvePreparedRecordingsDayNavigationState({
  prep = null,
  renderRecordings = () => "",
}) {
  const incoming = resolvePreparedRecordingsIncomingState({
    prep,
    renderRecordings,
    emptyHtml: "",
  });

  return {
    ...incoming,
    shouldBounce: !incoming.hasData,
    shouldCommit: incoming.hasData,
  };
}

export function resolvePreparedRecordingsSwipeState({
  prep = null,
  renderRecordings = () => "",
}) {
  return {
    ready: true,
    ...resolvePreparedRecordingsIncomingState({
      prep,
      renderRecordings,
    }),
  };
}

export function resolveFailedRecordingsSwipeState() {
  return {
    ready: true,
    hasData: false,
    bounds: null,
    recs: [],
    incomingHtml: RECORDINGS_SWIPE_EMPTY_HTML,
  };
}
