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

export function formatRecordingScrubTime(sec) {
  const total = Math.max(0, Math.floor(Number(sec) || 0));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  if (h > 0) {
    return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  }
  return `${m}:${String(s).padStart(2, "0")}`;
}

export function buildRecordingScrubDecorations({
  start = 0,
  end = 0,
  recordingStart = start,
  recordingEnd = end,
  alerts = [],
  tickStepSec = 10 * 60,
}) {
  const safeStart = Number(start) || 0;
  const safeEnd = Number(end) || 0;
  const span = Math.max(1, safeEnd - safeStart);
  const safeRecordingStart = Math.max(
    safeStart,
    Math.min(safeEnd, Number(recordingStart) || safeStart),
  );
  const safeRecordingEnd = Math.max(
    safeRecordingStart,
    Math.min(safeEnd, Number(recordingEnd) || safeRecordingStart),
  );
  const recordingSpan = Math.max(0, safeRecordingEnd - safeRecordingStart);
  const leadingExtension = Math.max(0, safeRecordingStart - safeStart);
  const trailingExtension = Math.max(0, safeEnd - safeRecordingEnd);

  let tickMarkup = "";
  if (leadingExtension > 0) {
    const left = (leadingExtension / span) * 100;
    tickMarkup += `<span class="recording-scrub-tick" style="left:${left}%"><span class="recording-scrub-tick-label">0:00</span></span>`;
  }
  for (
    let time = tickStepSec;
    time < recordingSpan;
    time += tickStepSec
  ) {
    const left = ((safeRecordingStart + time - safeStart) / span) * 100;
    tickMarkup += `<span class="recording-scrub-tick" style="left:${left}%"><span class="recording-scrub-tick-label">${formatRecordingScrubTime(time)}</span></span>`;
  }
  if (trailingExtension > 0) {
    const left = ((safeRecordingEnd - safeStart) / span) * 100;
    tickMarkup += `<span class="recording-scrub-tick" style="left:${left}%"><span class="recording-scrub-tick-label">${formatRecordingScrubTime(recordingSpan)}</span></span>`;
  }

  let markerMarkup = "";
  alerts.forEach((alert, index) => {
    const markerStart = Math.max(safeStart, Number(alert.start) || safeStart);
    const markerEnd = Math.min(
      safeEnd,
      Math.max(markerStart, Number(alert.end) || markerStart),
    );
    if (markerStart >= safeEnd || markerEnd <= safeStart) return;
    const left = ((markerStart - safeStart) / span) * 100;
    const width = Math.max(0.75, ((markerEnd - markerStart) / span) * 100);
    const markerClass =
      String(alert.severity || "").toLowerCase() === "alert"
        ? "recording-scrub-alert"
        : "recording-scrub-detection";
    markerMarkup += `<span class="${markerClass}" data-recording-alert-index="${index}" style="left:${Math.max(0, left)}%;width:${Math.min(100, width)}%"></span>`;
  });

  return {
    span,
    labelStart:
      leadingExtension > 0
        ? `-${formatRecordingScrubTime(leadingExtension)}`
        : "0:00",
    labelEnd:
      trailingExtension > 0
        ? `+${formatRecordingScrubTime(trailingExtension)}`
        : formatRecordingScrubTime(recordingSpan),
    labelNow: `${formatRecordingScrubTime(0)} / ${formatRecordingScrubTime(recordingSpan)}`,
    tickMarkup,
    markerMarkup,
  };
}

export function resolveRecordingSeekTimeout({
  isFirefox = false,
  isEdge = false,
}) {
  return isFirefox || isEdge ? 4200 : 2500;
}

export function isRecordingSeekTargetInRange({
  targetSec,
  seekable,
  toleranceSec = 0.35,
}) {
  if (!Number.isFinite(targetSec) || !seekable || !seekable.length)
    return false;
  for (let index = 0; index < seekable.length; index++) {
    const start = Number(seekable.start(index));
    const end = Number(seekable.end(index));
    if (
      Number.isFinite(start) &&
      Number.isFinite(end) &&
      targetSec >= start - toleranceSec &&
      targetSec <= end + toleranceSec
    ) {
      return true;
    }
  }
  return false;
}

export function resolveRecordingSeekExecutionPlan({
  hasFastSeek = false,
  isEdge = false,
  isIOS = false,
}) {
  return {
    shouldUseFastSeek: Boolean(hasFastSeek && !isEdge && !isIOS),
  };
}

export function isRecordingSeekVerified({
  currentTime = 0,
  targetSec,
  toleranceSec = 1.5,
}) {
  if (!Number.isFinite(targetSec)) return false;
  const diff = Math.abs((Number(currentTime) || 0) - targetSec);
  return diff <= toleranceSec;
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
