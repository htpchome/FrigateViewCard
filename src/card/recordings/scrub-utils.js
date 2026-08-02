export function resolveClosestRecordingAlertStart(
  targetSec,
  alerts = [],
  thresholdSec = 0,
) {
  let nearest = null;
  let best = Infinity;
  for (const alert of alerts) {
    const inAlert = targetSec >= alert.start && targetSec <= alert.end;
    const duration = Math.max(
      0,
      Number(alert.end || 0) - Number(alert.start || 0),
    );
    if (inAlert) {
      if (duration > 20) return null;
      return alert.start;
    }
    const distance = Math.abs(targetSec - alert.start);
    if (distance < best) {
      best = distance;
      nearest = alert.start;
    }
  }
  return best <= thresholdSec ? nearest : null;
}

export function resolveRecordingScrubTarget({
  ratio = 0,
  start = 0,
  end = 0,
  alerts = [],
}) {
  const safeStart = Number(start) || 0;
  const safeEnd = Number(end) || 0;
  const span = Math.max(1, safeEnd - safeStart);
  const clampedRatio = Math.max(0, Math.min(1, Number(ratio) || 0));
  const rawTarget = safeStart + clampedRatio * span;
  const snapThreshold = Math.min(12, Math.max(3, span * 0.005));
  const snapped = resolveClosestRecordingAlertStart(
    rawTarget,
    alerts,
    snapThreshold,
  );
  const absTarget = Number.isFinite(snapped) ? snapped : rawTarget;
  const relTarget = Math.max(
    0,
    Math.min(safeEnd - safeStart, absTarget - safeStart),
  );

  return { absTarget, relTarget };
}

export function resolveRecordingSeekTimeout({
  isFirefox = false,
  isEdge = false,
}) {
  return isFirefox || isEdge ? 4200 : 2500;
}

export function resolveRecordingSeekOutcome({
  isFirefox = false,
  isEdge = false,
  seekOk = false,
  currentTime = 0,
  relTarget,
  absTarget,
  start = 0,
  end = 0,
  resumeAfterScrub = false,
  isFallbackLoading = false,
  toleranceSec = 2.0,
}) {
  if (isFirefox || isEdge) {
    return {
      shouldResumePlayback: Boolean(resumeAfterScrub),
      shouldFallback: false,
      blockedByFallbackLoading: false,
      fallbackStart: null,
      fallbackEnd: null,
    };
  }

  const diff = Math.abs((Number(currentTime) || 0) - (Number(relTarget) || 0));
  const shouldFallback = !seekOk || diff > toleranceSec;

  if (!shouldFallback) {
    return {
      shouldResumePlayback: Boolean(resumeAfterScrub),
      shouldFallback: false,
      blockedByFallbackLoading: false,
      fallbackStart: null,
      fallbackEnd: null,
    };
  }

  if (isFallbackLoading) {
    return {
      shouldResumePlayback: false,
      shouldFallback: false,
      blockedByFallbackLoading: true,
      fallbackStart: null,
      fallbackEnd: null,
    };
  }

  const safeStart = Number(start) || 0;
  const safeEnd = Number(end) || 0;
  const span = Math.max(1, safeEnd - safeStart);

  return {
    shouldResumePlayback: false,
    shouldFallback: true,
    blockedByFallbackLoading: false,
    fallbackStart: Math.floor(Number(absTarget) || 0),
    fallbackEnd: Math.floor((Number(absTarget) || 0) + span),
  };
}
