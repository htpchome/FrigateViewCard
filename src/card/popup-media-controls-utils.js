const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

export const buildPopupMediaControlState = ({
  duration = 0,
  currentTime = 0,
  paused = true,
  muted = false,
  formatTime,
}) => {
  const safeDuration = Number(duration || 0);
  const safeCurrentTime = Number(currentTime || 0);
  const ratio =
    safeDuration > 0 ? clamp(safeCurrentTime / safeDuration, 0, 1) : 0;
  return {
    progressValue: String(Math.round(ratio * 1000)),
    showPauseIcon: !paused,
    showMutedIcon: Boolean(muted),
    timeText: `${formatTime(safeCurrentTime)}/${formatTime(safeDuration)}`,
  };
};

export const resolvePopupMediaSeekTarget = ({
  progressValue = 0,
  duration = 0,
}) => {
  const safeDuration = Number(duration || 0);
  if (!(safeDuration > 0)) return null;
  const next = (Number(progressValue || 0) / 1000) * safeDuration;
  if (!Number.isFinite(next)) return null;
  return clamp(next, 0, safeDuration);
};
