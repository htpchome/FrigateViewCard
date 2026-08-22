export const CARD_HEIGHT_MIN = 50;
export const CARD_HEIGHT_MAX = 100;
export const CARD_HEIGHT_DEFAULT = 100;
export const CARD_HEIGHT_DEFAULT_UNIT = "%";

export const normalizeCardHeight = (value) => {
  if (value == null || String(value).trim() === "") {
    return CARD_HEIGHT_DEFAULT;
  }
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return CARD_HEIGHT_DEFAULT;
  return Math.min(
    CARD_HEIGHT_MAX,
    Math.max(CARD_HEIGHT_MIN, Math.round(numeric)),
  );
};

export const normalizeCardHeightUnit = (value) => {
  const unit = String(value || "").trim().toLowerCase();
  return unit === "vh" || unit === "dvh" ? "dvh" : CARD_HEIGHT_DEFAULT_UNIT;
};
