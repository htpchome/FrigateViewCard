export function resolveRecordingsBrowseNavContextState({
  clientId = "",
  camera = "",
  currentBounds = null,
  todayBounds = null,
  hasPrev = false,
  hasNext = false,
}) {
  const hasContext = !!clientId && !!camera;
  if (!hasContext) {
    return {
      hasContext: false,
      isTodayOrFuture: false,
      shouldProbeNext: false,
      prevDisabled: true,
      nextDisabled: true,
    };
  }

  return {
    hasContext: true,
    ...resolveRecordingsBrowseNavState({
      currentBounds,
      todayBounds,
      hasPrev,
      hasNext,
    }),
  };
}

export function resolveRecordingsBrowseNavState({
  currentBounds = null,
  todayBounds = null,
  hasPrev = false,
  hasNext = false,
}) {
  const currentEnd = Number(currentBounds?.end || 0);
  const todayEnd = Number(todayBounds?.end || 0);
  const isTodayOrFuture = currentEnd >= todayEnd;

  return {
    isTodayOrFuture,
    shouldProbeNext: !isTodayOrFuture,
    prevDisabled: !hasPrev,
    nextDisabled: isTodayOrFuture || !hasNext,
  };
}
