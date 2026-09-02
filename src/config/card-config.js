import {
  ALLOWED_HIDDEN_TABS,
  DEFAULT_TITLE,
  DEFAULT_SUBTITLE,
  DEFAULT_CAMERA_CONNECTION_TYPE,
  DEFAULT_HIDDEN_TABS,
  GRID_ALERT_HOLD_MS,
  GRID_ALERT_HOLD_OPTIONS_SECONDS,
  GRID_ROTATION_OPTIONS_SECONDS,
  MAX_CAMERAS,
  REALTIME_POLL_OPTIONS_SECONDS,
  SNAPSHOT_UPDATE_SECONDS,
  SNAPSHOT_UPDATE_OPTIONS_SECONDS,
  SLIDESHOW_ALERT_HOLD_MS,
  SLIDESHOW_ALERT_HOLD_OPTIONS_SECONDS,
  SLIDESHOW_ROTATION_OPTIONS_SECONDS,
  PREVIEW_ALERT_LIVE_DURATION_OPTIONS_SECONDS,
} from "../constants.js";
import {
  normalizeCameraConfig,
  normalizeNumberChoice,
  normalizePositiveInteger,
  normalizeThemeCustomConfig,
  normalizeThemeCustomDefaultsConfig,
} from "../helpers.js";
import {
  normalizeDashboardSwipeNavigationMode,
  DEVICE_ROUTE_BUCKETS,
  getEnabledPageRoutes,
  resolveEnabledMobilePageMode,
  resolveDashboardSwipePageSelection,
  normalizePageRoute,
  PAGE_IDS,
} from "../features/navigation/router.js";
import {
  normalizeCardHeight,
  normalizeCardHeightUnit,
} from "../features/card-style/config.js";
import {
  normalizeWideLeftWidth,
  normalizeWideTimelineScale,
} from "../features/wide-view/config.js";
import { limitCameraConfigsByPhysicalCount } from "../features/camera-groups/model.js";
import { normalizeGridOrderConfig } from "../features/grid/config.js";

export const DEFAULT_CAMERA_ENTITY = "camera.doorbell";
export const PREFERRED_DEFAULT_CAMERA_ENTITIES = Object.freeze([
  "camera.doorbell",
  "camera.front_door",
  "camera.driveway",
  "camera.garage",
  "camera.backyard",
]);

export const resolvePreferredDefaultCameraEntity = (hass) => {
  const states = hass?.states;
  if (!states || typeof states !== "object") return DEFAULT_CAMERA_ENTITY;

  return (
    PREFERRED_DEFAULT_CAMERA_ENTITIES.find((entityId) =>
      Object.prototype.hasOwnProperty.call(states, entityId),
    ) || DEFAULT_CAMERA_ENTITY
  );
};

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

  return limitCameraConfigsByPhysicalCount(
    cameras
      .map((camera) => normalizeCameraConfig(camera, { fallbackName: "" }))
      .filter((camera) => camera.entity),
    MAX_CAMERAS,
  );
};

export const normalizeCardConfig = (config) => {
  const src = config && typeof config === "object" ? { ...config } : {};
  const cameras = normalizeCameras(src);

  src.hidden_tabs = Array.isArray(src.hidden_tabs)
    ? src.hidden_tabs
        .map((id) => (id === "reviews" ? "alerts" : id))
        .filter((id) => ALLOWED_HIDDEN_TABS.includes(id))
    : [...DEFAULT_HIDDEN_TABS];

  delete src.camera_entity;

  src.title = String(src.title || "").trim() || DEFAULT_TITLE;
  src.subtitle = String(src.subtitle || "").trim() || DEFAULT_SUBTITLE;
  src.display_title = src.display_title !== false;
  src.display_subtitle = src.display_subtitle !== false;
  src.display_logo = src.display_logo !== false;

  src.theme = src.theme === "custom" ? "custom" : "default";
  src.theme_custom = normalizeThemeCustomConfig(src.theme_custom);
  src.theme_custom_defaults = normalizeThemeCustomDefaultsConfig(
    src.theme_custom_defaults,
  );

  src.shadows = src.shadows !== false;
  src.borders = src.borders !== false;
  src.rounded_corners = src.rounded_corners !== false;
  src.outer_shadows = src.outer_shadows !== false;
  src.stream_height = normalizeCardHeight(src.stream_height);
  src.stream_height_unit = normalizeCardHeightUnit(src.stream_height_unit);
  src.col_left_width_pct = normalizeWideLeftWidth(src.col_left_width_pct);

  src.realtime_poll_seconds = REALTIME_POLL_OPTIONS_SECONDS.includes(
    Number(src.realtime_poll_seconds),
  )
    ? Number(src.realtime_poll_seconds)
    : 5;
  src.snapshot_update_seconds = normalizeNumberChoice(
    src.snapshot_update_seconds,
    SNAPSHOT_UPDATE_OPTIONS_SECONDS,
    SNAPSHOT_UPDATE_SECONDS,
  );
  src.mobile_poll_battery_saver = src.mobile_poll_battery_saver === true;
  src.event_pre_post_roll_enabled =
    src.event_pre_post_roll_enabled === true;
  src.favorites_mixed_cameras = src.favorites_mixed_cameras !== false;

  src.slideshow_rotation_enabled = src.slideshow_rotation_enabled === true;
  src.slideshow_rotation_seconds = SLIDESHOW_ROTATION_OPTIONS_SECONDS.includes(
    Number(src.slideshow_rotation_seconds),
  )
    ? Number(src.slideshow_rotation_seconds)
    : 30;
  src.slideshow_alert_hold_seconds = normalizeNumberChoice(
    src.slideshow_alert_hold_seconds,
    SLIDESHOW_ALERT_HOLD_OPTIONS_SECONDS,
    Math.round(SLIDESHOW_ALERT_HOLD_MS / 1000),
  );

  src.grid_mode_enabled = src.grid_mode_enabled === true;
  src.grid_order = normalizeGridOrderConfig(src.grid_order, cameras);
  src.grid_start_in_grid_enabled = src.grid_start_in_grid_enabled === true;
  src.grid_live_view_enabled = src.grid_live_view_enabled !== false;
  src.grid_alert_hold_seconds = normalizeNumberChoice(
    src.grid_alert_hold_seconds,
    GRID_ALERT_HOLD_OPTIONS_SECONDS,
    Math.round(GRID_ALERT_HOLD_MS / 1000),
  );
  src.mobile_view_page_enabled = src.mobile_view_page_enabled !== false;
  src.mobile_view_rotate_to_fullscreen =
    src.mobile_view_rotate_to_fullscreen !== false;
  src.mobile_view_outer_border = src.mobile_view_outer_border === true;
  src.mobile_view_ha_navbar_bottom =
    src.mobile_view_ha_navbar_bottom === true;
  src.mobile_view_ha_navbar_stack_tabs =
    src.mobile_view_ha_navbar_stack_tabs === true;
  src.mobile_view_ha_navbar_dashboard =
    src.mobile_view_ha_navbar_dashboard === true;
  src.ha_dashboard_swipe_navigation_owner =
    src.ha_dashboard_swipe_navigation_owner === true;
  src.ha_dashboard_swipe_navigation =
    normalizeDashboardSwipeNavigationMode(
      src.ha_dashboard_swipe_navigation,
    );
  src.ha_dashboard_swipe_include_other_cards =
    src.ha_dashboard_swipe_include_other_cards === true;
  src.ha_dashboard_swipe_include_subviews =
    src.ha_dashboard_swipe_include_subviews === true;
  src.ha_dashboard_swipe_mouse_enabled =
    src.ha_dashboard_swipe_mouse_enabled === true;
  src.preview_page_enabled = src.preview_page_enabled === true;
  src.preview_page_live_cameras = src.preview_page_live_cameras === true;
  src.preview_page_live_cameras_mobile =
    src.preview_page_live_cameras_mobile === true;
  src.preview_page_show_title_bars = src.preview_page_show_title_bars !== false;
  src.preview_page_alert_live_duration_seconds =
    normalizeNumberChoice(
      src.preview_page_alert_live_duration_seconds,
      PREVIEW_ALERT_LIVE_DURATION_OPTIONS_SECONDS,
      10,
    );

  src.wide_view_page_enabled =
    src.wide_view_page_enabled === true || src.wide_view === true;
  src.wide_view_live_cameras = src.wide_view_live_cameras === true;
  src.wide_view_alert_takeover = src.wide_view_alert_takeover === true;
  src.wide_view_timeline_enabled =
    src.wide_view_timeline_enabled === true;
  src.wide_view_timeline_default_open =
    src.wide_view_timeline_default_open === true;
  src.wide_view_timeline_default_scale = normalizeWideTimelineScale(
    src.wide_view_timeline_default_scale,
  );
  src.card_view_page_enabled = src.card_view_page_enabled === true;
  src.card_view_alert_takeover = src.card_view_alert_takeover === true;
  src.card_view_drawer_default_open =
    src.card_view_drawer_default_open !== false;
  src.card_view_standalone =
    src.card_view_page_enabled && src.card_view_standalone === true;

  src.landing_page = normalizePageRoute(src.landing_page);
  if (src.card_view_standalone) {
    src.landing_page = PAGE_IDS.cardView;
  }
  src.mobile_page = resolveEnabledMobilePageMode(src, src.mobile_page);
  const landingPageOptions = getEnabledPageRoutes(
    src,
    DEVICE_ROUTE_BUCKETS.desktop,
  );
  if (!landingPageOptions.includes(src.landing_page)) {
    src.landing_page = landingPageOptions[0] || PAGE_IDS.singleView;
  }
  src.ha_dashboard_swipe_pages = resolveDashboardSwipePageSelection(
    src,
    DEVICE_ROUTE_BUCKETS.desktop,
  );

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
