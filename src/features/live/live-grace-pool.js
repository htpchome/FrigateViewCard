const OFFSCREEN_VIDEO_STYLE =
  "width:1px;height:1px;display:block;opacity:0;pointer-events:none;position:absolute;left:-9999px;top:-9999px;background:var(--c-bg-deep)";

export const normalizeGraceEntityKey = (entity) => String(entity || "").trim();

export const createGraceEngineEntry = ({ engine, onExpire, graceMs }) => {
  const entry = {
    engine,
    cancelled: false,
    timer: null,
  };

  entry.timer = setTimeout(() => {
    onExpire?.(entry);
  }, graceMs);

  return entry;
};

export const createGracePendingEntry = ({ onExpire, graceMs }) => {
  const entry = {
    engine: null,
    cancelled: false,
    timer: null,
    promise: null,
  };

  entry.timer = setTimeout(() => {
    onExpire?.(entry);
  }, graceMs);

  return entry;
};

export const prepareEngineVideoForGraceHost = (video) => {
  if (!video) return;
  video.muted = true;
  video.controls = false;
  video.style.cssText = OFFSCREEN_VIDEO_STYLE;
  void video.play?.().catch?.(() => {});
};
