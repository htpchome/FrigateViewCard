export const WIDE_LEFT_WIDTH_MIN = 25;
export const WIDE_LEFT_WIDTH_MAX = 75;
export const WIDE_LEFT_WIDTH_DEFAULT = 60;
export const WIDE_TIMELINE_SCALE_OPTIONS_HOURS = Object.freeze([1, 6, 12, 24]);
export const WIDE_TIMELINE_DEFAULT_SCALE_HOURS = 12;

export const normalizeWideLeftWidth = (value) => {
  if (value == null || String(value).trim() === "") {
    return WIDE_LEFT_WIDTH_DEFAULT;
  }
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return WIDE_LEFT_WIDTH_DEFAULT;
  return Math.min(
    WIDE_LEFT_WIDTH_MAX,
    Math.max(WIDE_LEFT_WIDTH_MIN, Math.round(numeric)),
  );
};

export const normalizeWideTimelineScale = (value) => {
  const numeric = Number(value);
  return WIDE_TIMELINE_SCALE_OPTIONS_HOURS.includes(numeric)
    ? numeric
    : WIDE_TIMELINE_DEFAULT_SCALE_HOURS;
};
