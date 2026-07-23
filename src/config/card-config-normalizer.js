import {
  ALLOWED_HIDDEN_TABS,
  DEFAULT_CAMERA_CONNECTION_TYPE,
  GRID_ROTATION_OPTIONS_SECONDS,
  MAX_CAMERAS,
  REALTIME_POLL_OPTIONS_SECONDS,
  SLIDESHOW_ROTATION_OPTIONS_SECONDS,
  THEME_CUSTOM_KEYS,
} from "../constants.js";
import {
  normalizeCameraConfig,
  normalizeHexColor,
  normalizePositiveInteger,
} from "../helpers.js";
import {
  DEVICE_ROUTE_BUCKETS,
  getEnabledPageRoutes,
  normalizePageRoute,
  PAGE_IDS,
} from "../router.js";

const normalizeCameras = (config) => {
  let cameras = [];
  if (Array.isArray(config?.cameras)) {
    cameras = config.cameras;
  } else if (config?.camera_entity) {
    cameras = [
      {
        entity: config.camera_entity,
        name: config.title || "",
        connection_type: DEFAULT_CAMERA_CONNECTION_TYPE,
      },
    ];
  }

  return cameras
    .map((camera) => normalizeCameraConfig(camera, { fallbackName: "" }))
    .filter((camera) => camera.entity)
    .slice(0, MAX_CAMERAS);
};

export const normalizeCardConfig = (config) => {
  const src = config && typeof config === "object" ? { ...config } : {};
  const cameras = normalizeCameras(src);

  if (Array.isArray(src.hidden_tabs)) {
    src.hidden_tabs = src.hidden_tabs
      .map((id) => (id === "reviews" ? "alerts" : id))
      .filter((id) => ALLOWED_HIDDEN_TABS.includes(id));
  }

  delete src.camera_entity;

  src.theme = src.theme === "custom" ? "custom" : "default";
  if (src.theme_custom && typeof src.theme_custom === "object") {
    src.theme_custom = Object.fromEntries(
      Object.entries(src.theme_custom)
        .filter(([key]) => THEME_CUSTOM_KEYS.has(key))
        .map(([key, value]) => [key, normalizeHexColor(value)])
        .filter(([, value]) => !!value),
    );
  } else {
    src.theme_custom = {};
  }

  if (
    src.theme_custom_defaults &&
    typeof src.theme_custom_defaults === "object"
  ) {
    src.theme_custom_defaults = Object.fromEntries(
      Object.entries(src.theme_custom_defaults)
        .filter(([key]) => THEME_CUSTOM_KEYS.has(key))
        .map(([key, value]) => [key, value === true])
        .filter(([, value]) => value === true),
    );
  } else {
    src.theme_custom_defaults = {};
  }

  src.shadows = src.shadows !== false;
  src.borders = src.borders !== false;
  src.rounded_corners = src.rounded_corners !== false;
  src.outer_shadows = src.outer_shadows !== false;

  src.realtime_poll_seconds = REALTIME_POLL_OPTIONS_SECONDS.includes(
    Number(src.realtime_poll_seconds),
  )
    ? Number(src.realtime_poll_seconds)
    : 5;
  src.mobile_poll_battery_saver = src.mobile_poll_battery_saver === true;

  src.slideshow_rotation_enabled = src.slideshow_rotation_enabled === true;
  src.slideshow_rotation_seconds = SLIDESHOW_ROTATION_OPTIONS_SECONDS.includes(
    Number(src.slideshow_rotation_seconds),
  )
    ? Number(src.slideshow_rotation_seconds)
    : 30;

  src.grid_mode_enabled = src.grid_mode_enabled === true;
  src.grid_start_in_grid_enabled = src.grid_start_in_grid_enabled === true;
  src.grid_live_view_enabled = src.grid_live_view_enabled !== false;
  src.preview_page_enabled = src.preview_page_enabled === true;
  src.preview_page_live_cameras = src.preview_page_live_cameras === true;
  src.preview_page_show_title_bars = src.preview_page_show_title_bars !== false;

  src.wide_view_page_enabled =
    src.wide_view_page_enabled === true || src.wide_view === true;

  src.landing_page = normalizePageRoute(src.landing_page);
  src.mobile_page = normalizePageRoute(src.mobile_page);
  const landingPageOptions = getEnabledPageRoutes(
    src,
    DEVICE_ROUTE_BUCKETS.desktop,
  );
  const mobilePageOptions = getEnabledPageRoutes(
    src,
    DEVICE_ROUTE_BUCKETS.mobile,
  );
  if (!landingPageOptions.includes(src.landing_page)) {
    src.landing_page = PAGE_IDS.singleView;
  }
  if (!mobilePageOptions.includes(src.mobile_page)) {
    src.mobile_page = PAGE_IDS.singleView;
  }

  src.grid_rotation_seconds = GRID_ROTATION_OPTIONS_SECONDS.includes(
    Number(src.grid_rotation_seconds),
  )
    ? Number(src.grid_rotation_seconds)
    : 30;
  src.alerts_reviews_days = normalizePositiveInteger(
    src.alerts_reviews_days,
    normalizePositiveInteger(src.window_days, 3),
  );

  delete src.wide_view;
  return { ...src, cameras };
};
