import {
  ALLOWED_HIDDEN_TABS,
  CARD_TAG,
  DEFAULT_CAMERA_CONNECTION_TYPE,
  GRID_ROTATION_OPTIONS_SECONDS,
  REALTIME_POLL_OPTIONS_SECONDS,
  SLIDESHOW_ROTATION_OPTIONS_SECONDS,
  THEME_CUSTOM_KEYS,
} from "../constants.js";
import { normalizePageRoute, PAGE_IDS } from "../router.js";

const normalizePositiveInteger = (value, fallback) => {
  const parsed = parseInt(String(value ?? "").trim(), 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

const normalizeHexColor = (value) => {
  const s = String(value || "")
    .trim()
    .toLowerCase();
  if (/^#[0-9a-f]{6}$/.test(s)) return s;
  if (/^#[0-9a-f]{3}$/.test(s)) {
    return `#${s[1]}${s[1]}${s[2]}${s[2]}${s[3]}${s[3]}`;
  }
  return "";
};

const normalizeCameraConnectionType = (value) => {
  const type = String(value ?? "")
    .trim()
    .toLowerCase();
  if (type === "ha_direct" || type === "ha" || type === "home_assistant") {
    return "ha_direct";
  }
  return DEFAULT_CAMERA_CONNECTION_TYPE;
};

const normalizeAlertsAreaContent = (value) => {
  const mode = String(value ?? "")
    .trim()
    .toLowerCase();
  return mode === "all_reviews" ? "all_reviews" : "alerts_only";
};

const normalizeDisableHlsDesktop = (value) => value === true;

const normalizeCameraConfig = (camera, { fallbackName = null } = {}) => {
  if (typeof camera === "string") {
    return {
      entity: camera,
      name: fallbackName,
      connection_type: DEFAULT_CAMERA_CONNECTION_TYPE,
      alerts_content: "alerts_only",
      disable_hls_desktop: false,
    };
  }
  if (camera && typeof camera === "object") {
    return {
      entity: camera.entity || camera.camera_entity || null,
      name: camera.name || fallbackName,
      connection_type: normalizeCameraConnectionType(camera.connection_type),
      alerts_content: normalizeAlertsAreaContent(camera.alerts_content),
      disable_hls_desktop: normalizeDisableHlsDesktop(
        camera.disable_hls_desktop,
      ),
    };
  }
  return {
    entity: null,
    name: fallbackName,
    connection_type: DEFAULT_CAMERA_CONNECTION_TYPE,
    alerts_content: "alerts_only",
    disable_hls_desktop: false,
  };
};

const addStringIfPresent = (target, key, value) => {
  const trimmed = String(value || "").trim();
  if (trimmed) target[key] = trimmed;
};

const addIfNotDefault = (target, key, value, defaultValue) => {
  if (value !== defaultValue) target[key] = value;
};

const compactCameraConfigForYaml = (camera) => {
  const normalized = normalizeCameraConfig(camera, { fallbackName: "" });
  if (!normalized.entity) return null;
  const compact = { entity: normalized.entity };
  addStringIfPresent(compact, "name", normalized.name);
  if (normalized.connection_type !== DEFAULT_CAMERA_CONNECTION_TYPE) {
    compact.connection_type = normalized.connection_type;
  }
  if (normalized.alerts_content !== "alerts_only") {
    compact.alerts_content = normalized.alerts_content;
  }
  if (normalized.disable_hls_desktop === true) {
    compact.disable_hls_desktop = true;
  }
  return compact;
};

export const compactEditorConfigForYaml = (
  config,
  { themeDefaultColors = {} } = {},
) => {
  const source = config && typeof config === "object" ? config : {};
  const compact = {};
  const cameras = Array.isArray(source.cameras)
    ? source.cameras.map(compactCameraConfigForYaml).filter(Boolean)
    : [];
  if (cameras.length) compact.cameras = cameras;

  addStringIfPresent(compact, "title", source.title);
  addStringIfPresent(compact, "subtitle", source.subtitle);

  const windowDays = normalizePositiveInteger(source.window_days, 3);
  addIfNotDefault(compact, "window_days", windowDays, 3);
  const alertsReviewsDays = normalizePositiveInteger(
    source.alerts_reviews_days,
    windowDays,
  );
  addIfNotDefault(
    compact,
    "alerts_reviews_days",
    alertsReviewsDays,
    windowDays,
  );

  const realtimePollSeconds = REALTIME_POLL_OPTIONS_SECONDS.includes(
    Number(source.realtime_poll_seconds),
  )
    ? Number(source.realtime_poll_seconds)
    : 5;
  addIfNotDefault(compact, "realtime_poll_seconds", realtimePollSeconds, 5);
  addIfNotDefault(
    compact,
    "mobile_poll_battery_saver",
    source.mobile_poll_battery_saver === true,
    false,
  );
  addIfNotDefault(
    compact,
    "slideshow_rotation_enabled",
    source.slideshow_rotation_enabled === true,
    false,
  );

  const slideshowRotationSeconds = SLIDESHOW_ROTATION_OPTIONS_SECONDS.includes(
    Number(source.slideshow_rotation_seconds),
  )
    ? Number(source.slideshow_rotation_seconds)
    : 30;
  addIfNotDefault(
    compact,
    "slideshow_rotation_seconds",
    slideshowRotationSeconds,
    30,
  );
  addIfNotDefault(
    compact,
    "grid_mode_enabled",
    source.grid_mode_enabled === true,
    false,
  );
  addIfNotDefault(
    compact,
    "grid_start_in_grid_enabled",
    source.grid_start_in_grid_enabled === true,
    false,
  );
  addIfNotDefault(
    compact,
    "grid_live_view_enabled",
    source.grid_live_view_enabled !== false,
    true,
  );
  addIfNotDefault(
    compact,
    "preview_page_enabled",
    source.preview_page_enabled === true,
    false,
  );
  addIfNotDefault(
    compact,
    "preview_page_live_cameras",
    source.preview_page_live_cameras === true,
    false,
  );
  addIfNotDefault(
    compact,
    "preview_page_show_title_bars",
    source.preview_page_show_title_bars !== false,
    true,
  );
  addIfNotDefault(
    compact,
    "wide_view_page_enabled",
    source.wide_view_page_enabled === true,
    false,
  );
  addIfNotDefault(
    compact,
    "landing_page",
    normalizePageRoute(source.landing_page),
    PAGE_IDS.singleView,
  );
  addIfNotDefault(
    compact,
    "mobile_page",
    normalizePageRoute(source.mobile_page),
    PAGE_IDS.singleView,
  );

  const gridRotationSeconds = GRID_ROTATION_OPTIONS_SECONDS.includes(
    Number(source.grid_rotation_seconds),
  )
    ? Number(source.grid_rotation_seconds)
    : 30;
  addIfNotDefault(compact, "grid_rotation_seconds", gridRotationSeconds, 30);

  const hiddenTabs = Array.isArray(source.hidden_tabs)
    ? source.hidden_tabs
        .map((id) => (id === "reviews" ? "alerts" : id))
        .filter((id) => ALLOWED_HIDDEN_TABS.includes(id))
    : [];
  if (hiddenTabs.length) compact.hidden_tabs = hiddenTabs;

  if (source.theme === "custom") {
    compact.theme = "custom";
    const themeCustom =
      source.theme_custom && typeof source.theme_custom === "object"
        ? source.theme_custom
        : {};
    const themeCustomDefaults =
      source.theme_custom_defaults &&
      typeof source.theme_custom_defaults === "object"
        ? source.theme_custom_defaults
        : {};
    const compactThemeCustom = {};
    Object.entries(themeCustom).forEach(([key, value]) => {
      if (!THEME_CUSTOM_KEYS.has(key)) return;
      if (themeCustomDefaults[key] === true) return;
      const color = normalizeHexColor(value);
      if (!color) return;
      const defaultColor = normalizeHexColor(themeDefaultColors[key]);
      if (defaultColor && color === defaultColor) return;
      compactThemeCustom[key] = color;
    });
    if (Object.keys(compactThemeCustom).length) {
      compact.theme_custom = compactThemeCustom;
    }
  }

  const streamHeight = source.stream_height
    ? Number(source.stream_height)
    : null;
  if (streamHeight) compact.stream_height = streamHeight;
  const streamHeightUnit = source.stream_height_unit || "vh";
  if (streamHeight && streamHeightUnit !== "vh") {
    compact.stream_height_unit = streamHeightUnit;
  }
  addIfNotDefault(
    compact,
    "tight_margins",
    source.tight_margins === true,
    false,
  );
  addIfNotDefault(compact, "shadows", source.shadows !== false, true);
  addIfNotDefault(compact, "borders", source.borders !== false, true);
  addIfNotDefault(
    compact,
    "rounded_corners",
    source.rounded_corners !== false,
    true,
  );
  addIfNotDefault(
    compact,
    "outer_shadows",
    source.outer_shadows !== false,
    true,
  );
  const leftWidth = Number(source.col_left_width_pct) || 50;
  addIfNotDefault(compact, "col_left_width_pct", leftWidth, 50);

  return compact;
};

export const withCardTypeForYaml = (config, { sourceConfig = null } = {}) => {
  const payload = {
    type: `custom:${CARD_TAG}`,
    ...(config && typeof config === "object" ? config : {}),
  };

  const source =
    sourceConfig && typeof sourceConfig === "object" ? sourceConfig : null;
  if (
    source &&
    source.grid_options &&
    typeof source.grid_options === "object"
  ) {
    payload.grid_options = { ...source.grid_options };
  }
  if (source && source.visibility != null) {
    payload.visibility = Array.isArray(source.visibility)
      ? source.visibility.map((item) =>
          item && typeof item === "object" ? { ...item } : item,
        )
      : source.visibility;
  }

  return payload;
};
