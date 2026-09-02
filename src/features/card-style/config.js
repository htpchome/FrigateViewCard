import { THEME_CUSTOM_KEYS, THEME_MODES } from "../../constants.js";

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

export const THEME_CUSTOM_SCOPES = Object.freeze(["light", "dark", "both"]);

const normalizeThemeMode = (value) =>
  String(value || "").trim().toLowerCase() === "dark" ? "dark" : "light";

export const normalizeThemeCustomScope = (value, fallbackMode = "light") => {
  const scope = String(value || "").trim().toLowerCase();
  return THEME_CUSTOM_SCOPES.includes(scope)
    ? scope
    : normalizeThemeMode(fallbackMode);
};

export const resolveThemeCustomScopeModes = (scope, fallbackMode = "light") => {
  const normalized = normalizeThemeCustomScope(scope, fallbackMode);
  return normalized === "both" ? [...THEME_MODES] : [normalized];
};

const normalizeThemeCustomModes = (value) => {
  const source = Array.isArray(value) ? value : [value];
  const modes = new Set();
  source.forEach((mode) => {
    const normalized = String(mode || "").trim().toLowerCase();
    if (normalized === "both") {
      THEME_MODES.forEach((themeMode) => modes.add(themeMode));
    } else if (THEME_MODES.includes(normalized)) {
      modes.add(normalized);
    }
  });
  return THEME_MODES.filter((mode) => modes.has(mode));
};

const normalizeThemeCustomOverrides = (value) => {
  const source = value && typeof value === "object" ? value : {};
  return Object.fromEntries(
    Object.entries(source)
      .filter(([key]) => THEME_CUSTOM_KEYS.has(key))
      .map(([key, color]) => {
        const normalized = String(color || "").trim().toLowerCase();
        if (/^#[0-9a-f]{6}$/.test(normalized)) return [key, normalized];
        if (/^#[0-9a-f]{3}$/.test(normalized)) {
          return [
            key,
            `#${normalized[1]}${normalized[1]}${normalized[2]}${normalized[2]}${normalized[3]}${normalized[3]}`,
          ];
        }
        return [key, ""];
      })
      .filter(([, color]) => !!color),
  );
};

export const normalizeThemeCustomConfig = (value) => {
  if (!Array.isArray(value)) return [];
  const [entry] = value
    .map((entry) => {
      if (!entry || typeof entry !== "object") return null;
      const modes = normalizeThemeCustomModes(entry.modes);
      if (!modes.length) return null;
      return {
        modes,
        overrides: normalizeThemeCustomOverrides(entry.overrides),
      };
    })
    .filter(Boolean);
  return entry ? [entry] : [];
};

export const createThemeCustomConfig = ({
  scope,
  overrides,
  fallbackMode = "light",
} = {}) => [
  {
    modes: resolveThemeCustomScopeModes(scope, fallbackMode),
    overrides: normalizeThemeCustomOverrides(overrides),
  },
];

export const resolveThemeCustomOverrides = (value, mode) => {
  const activeMode = normalizeThemeMode(mode);
  return normalizeThemeCustomConfig(value).reduce((overrides, entry) => {
    if (entry.modes.includes(activeMode)) {
      Object.assign(overrides, entry.overrides);
    }
    return overrides;
  }, {});
};

export const resolveThemeCustomEditorConfig = (
  value,
  preferredMode = "light",
) => {
  const activeMode = normalizeThemeMode(preferredMode);
  const entries = normalizeThemeCustomConfig(value);
  if (!entries.length) {
    return { scope: activeMode, overrides: {} };
  }
  const [{ modes, overrides }] = entries;
  return {
    scope: modes.length === 2 ? "both" : modes[0],
    overrides: { ...overrides },
  };
};
