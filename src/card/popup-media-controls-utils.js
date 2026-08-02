const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

export const buildPopupMediaUrl = ({ baseUrl = "", cacheKey }) => {
  const normalizedBaseUrl = String(baseUrl || "");
  if (!normalizedBaseUrl) return "";
  if (cacheKey === null || cacheKey === undefined || cacheKey === "") {
    return normalizedBaseUrl;
  }
  const separator = normalizedBaseUrl.includes("?") ? "&" : "?";
  return `${normalizedBaseUrl}${separator}fvc=${encodeURIComponent(String(cacheKey))}`;
};

export const resolvePopupMediaRenderPlan = ({
  infoOpts = null,
  fullscreenKind = "",
  hasMediaElement = false,
  html = "",
  hasVideo = false,
}) => ({
  popupMediaType: String(
    infoOpts?.mediaType || fullscreenKind || "",
  ).toLowerCase(),
  shouldAppendMediaElement: Boolean(hasMediaElement),
  viewerHtml: hasMediaElement ? "" : String(html || ""),
  controlsPlan: hasVideo
    ? null
    : resolvePopupMediaControlsInitPlan({
        hasVideo: false,
      }),
});

export const buildPopupClipRenderPlan = ({
  id = "",
  opts = {},
  infoEvent = null,
  isIos = false,
  includeLookupInfo = false,
}) => {
  const mediaType = opts.mediaType || "clip";
  return {
    playingId: id,
    mediaFile: isIos ? "master.m3u8" : "clip.mp4",
    mediaType,
    fullscreenKind: mediaType,
    infoEvent,
    infoOpts: includeLookupInfo
      ? {
          id,
          mediaType,
          startTime: opts.startTime,
          camera: opts.camera,
        }
      : { mediaType },
  };
};

export const buildPopupSnapshotRenderPlan = ({ event = null, opts = {} }) => {
  const mediaType = opts.mediaType || "snapshot";
  return {
    playingId: event?.id || "",
    mediaType,
    fullscreenKind: mediaType,
    infoEvent: event,
    infoOpts: { mediaType },
  };
};

export const buildPopupRecordingRenderPlan = ({
  start = 0,
  end = 0,
  playbackPlan = {},
}) => ({
  popupMediaType: "recording",
  playing: { rec: start },
  fullscreenKind: "recording",
  infoEvent: null,
  infoOpts: {
    mediaType: "recording",
    startTime: start,
    durationSec: playbackPlan.clipDurationSec,
    camera: playbackPlan.displayCamera,
    objects: "-",
    zone: "-",
    score: "-",
    recStart: start,
    recEnd: end,
  },
  chunkEnd: playbackPlan.chunkEnd,
  sourceCandidates: playbackPlan.sourceCandidates || [],
});

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
  controlsEvents: [
    { type: "pointerdown", action: "showNow" },
    { type: "pointerup", action: "showTemporarily" },
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
