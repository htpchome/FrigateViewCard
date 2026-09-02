const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

export const resolvePopupMediaControlsInitPlan = ({
  shouldUseCustomControls = false,
  hasVideo = true,
}) => ({
  videoControlsEnabled: Boolean(hasVideo && !shouldUseCustomControls),
  removeVideoControlsAttribute: Boolean(hasVideo && shouldUseCustomControls),
  setVideoControlsAttribute: Boolean(hasVideo && !shouldUseCustomControls),
  controlsHidden: !shouldUseCustomControls,
  resetControlsHiddenClass: true,
  shouldBindCustomControls: Boolean(hasVideo && shouldUseCustomControls),
});

export const resolvePopupMediaControlsListenerPlan = ({
  hasProgressControl = false,
  hasVolumeControl = false,
}) => ({
  progressEvents: hasProgressControl
    ? [
        { type: "input", action: "scrubPreview" },
        { type: "change", action: "scrubCommit" },
        { type: "pointerdown", action: "dragStart" },
        { type: "pointerup", action: "dragEnd" },
        {
          type: "touchstart",
          action: "touchDragStart",
          options: { passive: true },
        },
        {
          type: "touchend",
          action: "touchDragEnd",
          options: { passive: true },
        },
      ]
    : [],
  volumeEvents: hasVolumeControl
    ? [{ type: "input", action: "volumeInput" }]
    : [],
  controlsEvents: [
    { type: "pointerenter", action: "showNow" },
    { type: "pointerleave", action: "showTemporarily" },
    { type: "pointerdown", action: "showNow" },
    { type: "pointerup", action: "showNow" },
    { type: "focusin", action: "showNow" },
    { type: "focusout", action: "showTemporarily" },
    {
      type: "touchstart",
      action: "showNow",
      options: { passive: true },
    },
    {
      type: "touchend",
      action: "showTemporarily",
      options: { passive: true },
    },
  ],
  syncVideoEvents: [
    "play",
    "pause",
    "timeupdate",
    "durationchange",
    "loadedmetadata",
    "volumechange",
    "seeking",
    "seeked",
  ],
  interactionVideoEvents: [
    {
      type: "touchstart",
      action: "showTemporarily",
      options: { passive: true },
    },
    {
      type: "pointerdown",
      action: "showTemporarily",
      options: { passive: true },
    },
    {
      type: "mousemove",
      action: "showTemporarily",
      options: { passive: true },
    },
    {
      type: "click",
      action: "showTemporarily",
      options: { passive: true },
    },
  ],
});

export const buildPopupMediaControlState = ({
  duration = 0,
  currentTime = 0,
  paused = true,
  muted = false,
  volume = 1,
  formatTime,
}) => {
  const safeDuration = Number(duration || 0);
  const safeCurrentTime = Number(currentTime || 0);
  const ratio =
    safeDuration > 0 ? clamp(safeCurrentTime / safeDuration, 0, 1) : 0;
  const safeVolume = Number(volume);
  const volumeRatio = Number.isFinite(safeVolume)
    ? clamp(safeVolume, 0, 1)
    : 1;
  return {
    progressValue: String(Math.round(ratio * 1000)),
    volumeValue: String(Math.round(volumeRatio * 100)),
    showPauseIcon: !paused,
    showMutedIcon: Boolean(muted),
    timeText: `${formatTime(safeCurrentTime)}/${formatTime(safeDuration)}`,
  };
};

export const resolvePopupMediaVolumeTarget = ({ volumeValue = 100 } = {}) => {
  const normalized = Number(volumeValue);
  if (!Number.isFinite(normalized)) return null;
  return clamp(normalized / 100, 0, 1);
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
