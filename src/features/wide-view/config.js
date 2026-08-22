export const WIDE_LEFT_WIDTH_MIN = 25;
export const WIDE_LEFT_WIDTH_MAX = 75;
export const WIDE_LEFT_WIDTH_DEFAULT = 60;

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
