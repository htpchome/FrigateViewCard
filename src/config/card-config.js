import {
  ALLOWED_HIDDEN_TABS,
  DEFAULT_TITLE,
  DEFAULT_SUBTITLE,
  DEFAULT_CAMERA_CONNECTION_TYPE,
  DEFAULT_HIDDEN_TABS,
  DEFAULT_EVENT_DAYS,
  DEFAULT_ALERTS_REVIEWS_DAYS,
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
  PREVIEW_ALERT_HOLD_MS,
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
  resolveDashboardSwipeMobilePageSelection,
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
import {
  normalizeCardViewStartMode,
  normalizeCardViewViewMode,
} from "../features/card-view/config.js";
import { normalizePageStartMode } from "../features/navigation/start-mode.js";
import { sanitizeDisplayText } from "../shared/page-text.js";

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

  src.title = sanitizeDisplayText(src.title).trim() || DEFAULT_TITLE;
  src.subtitle = sanitizeDisplayText(src.subtitle).trim() || DEFAULT_SUBTITLE;
  src.display_title = src.display_title !== false;
  src.display_subtitle = src.display_subtitle !== false;
  src.display_logo = src.display_logo !== false;
  src.display_version = src.display_version !== false;
  src.display_filter_control = src.display_filter_control !== false;
  src.display_calendar_control = src.display_calendar_control !== false;
  src.display_source_indicator = src.display_source_indicator !== false;
  src.display_online_indicator = src.display_online_indicator !== false;
  src.display_back_button = src.display_back_button !== false;
  src.display_alert_detection_chip =
    src.display_alert_detection_chip !== false;
  src.display_alert_detection_outline =
    src.display_alert_detection_outline !== false;
  src.display_object_chips = src.display_object_chips !== false;
  src.display_location_area_zone =
    src.display_location_area_zone !== false;
  src.display_alert_count = src.display_alert_count !== false;
  src.display_footer = src.display_footer !== false;

  src.theme = src.theme === "custom" ? "custom" : "default";
  src.theme_custom = normalizeThemeCustomConfig(src.theme_custom);
  src.theme_custom_defaults = normalizeThemeCustomDefaultsConfig(
    src.theme_custom_defaults,
  );

  src.shadows = src.shadows !== false;
  src.borders = src.borders === true;
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
  src.grid_live_view_enabled = src.grid_live_view_enabled !== false;
  src.grid_alert_hold_seconds = normalizeNumberChoice(
    src.grid_alert_hold_seconds,
    GRID_ALERT_HOLD_OPTIONS_SECONDS,
    Math.round(GRID_ALERT_HOLD_MS / 1000),
  );
  src.mobile_view_page_enabled = src.mobile_view_page_enabled !== false;
  src.mobile_view_rotate_to_fullscreen =
    src.mobile_view_rotate_to_fullscreen === true;
  src.mobile_view_dashboard_background =
    src.mobile_view_dashboard_background !== false;
  src.mobile_view_header_overlay = src.mobile_view_header_overlay === true;
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

  src.single_view_start_mode = normalizePageStartMode(
    src.single_view_start_mode,
  );
  src.wide_view_start_mode = normalizePageStartMode(
    src.wide_view_start_mode,
  );
  src.card_view_start_mode = normalizeCardViewStartMode(
    src.card_view_start_mode,
  );
  src.single_view_alert_takeover =
    src.single_view_alert_takeover === true;

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
  src.card_view_standalone =
    src.card_view_page_enabled && src.card_view_standalone === true;
  src.card_view_media_drawer_enabled =
    src.card_view_media_drawer_enabled !== false;
  src.card_view_view_mode = normalizeCardViewViewMode(
    src.card_view_view_mode,
    {
      legacyDrawerDefaultOpen: src.card_view_drawer_default_open,
      legacyVideoPanelOnly: src.card_view_video_panel_only,
    },
  );
  delete src.card_view_drawer_default_open;
  delete src.card_view_media_drawer_type;
  delete src.card_view_video_panel_only;
  src.card_view_hide_camera_name =
    src.card_view_hide_camera_name !== false;

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
  src.ha_dashboard_swipe_mobile_pages =
    resolveDashboardSwipeMobilePageSelection(src);

  src.grid_rotation_seconds = GRID_ROTATION_OPTIONS_SECONDS.includes(
    Number(src.grid_rotation_seconds),
  )
    ? Number(src.grid_rotation_seconds)
    : 30;
  const legacyWindowHours = parseInt(src.window_hours, 10);
  src.event_days = normalizePositiveInteger(
    src.event_days ?? src.window_days,
    Number.isFinite(legacyWindowHours) && legacyWindowHours > 0
      ? Math.max(1, Math.ceil(legacyWindowHours / 24))
      : DEFAULT_EVENT_DAYS,
  );
  src.alerts_reviews_days = normalizePositiveInteger(
    src.alerts_reviews_days,
    DEFAULT_ALERTS_REVIEWS_DAYS,
  );

  delete src.window_days;
  delete src.window_hours;
  delete src.wide_view;
  return { ...src, cameras };
};

const RUNTIME_CARD_CONFIG_KEYS = Object.freeze([
  "cameras",
  "title",
  "subtitle",
  "display_title",
  "display_subtitle",
  "display_logo",
  "display_version",
  "display_filter_control",
  "display_calendar_control",
  "display_source_indicator",
  "display_online_indicator",
  "display_back_button",
  "display_alert_detection_chip",
  "display_alert_detection_outline",
  "display_object_chips",
  "display_location_area_zone",
  "display_alert_count",
  "display_footer",
  "event_days",
  "alerts_reviews_days",
  "refresh_seconds",
  "realtime_poll_seconds",
  "snapshot_update_seconds",
  "mobile_poll_battery_saver",
  "event_pre_post_roll_enabled",
  "favorites_mixed_cameras",
  "slideshow_rotation_enabled",
  "slideshow_rotation_seconds",
  "slideshow_alert_hold_seconds",
  "grid_mode_enabled",
  "grid_order",
  "grid_live_view_enabled",
  "grid_alert_hold_seconds",
  "mobile_view_page_enabled",
  "mobile_view_rotate_to_fullscreen",
  "mobile_view_dashboard_background",
  "mobile_view_header_overlay",
  "mobile_view_outer_border",
  "mobile_view_ha_navbar_bottom",
  "mobile_view_ha_navbar_stack_tabs",
  "mobile_view_ha_navbar_dashboard",
  "ha_dashboard_swipe_navigation_owner",
  "ha_dashboard_swipe_navigation",
  "ha_dashboard_swipe_include_other_cards",
  "ha_dashboard_swipe_include_subviews",
  "ha_dashboard_swipe_mouse_enabled",
  "ha_dashboard_swipe_pages",
  "ha_dashboard_swipe_mobile_pages",
  "preview_page_enabled",
  "preview_page_live_cameras",
  "preview_page_live_cameras_mobile",
  "preview_page_show_title_bars",
  "preview_page_alert_live_duration_seconds",
  "single_view_alert_takeover",
  "single_view_start_mode",
  "wide_view_page_enabled",
  "wide_view_live_cameras",
  "wide_view_alert_takeover",
  "wide_view_start_mode",
  "wide_view_timeline_enabled",
  "wide_view_timeline_default_open",
  "wide_view_timeline_default_scale",
  "card_view_page_enabled",
  "card_view_alert_takeover",
  "card_view_standalone",
  "card_view_media_drawer_enabled",
  "card_view_start_mode",
  "card_view_view_mode",
  "card_view_hide_camera_name",
  "landing_page",
  "mobile_page",
  "deep_link_enabled",
  "grid_rotation_seconds",
  "browse_expanded",
  "hidden_tabs",
  "theme",
  "theme_custom",
  "theme_custom_defaults",
  "stream_height",
  "stream_height_unit",
  "compact_preview",
  "tight_margins",
  "shadows",
  "borders",
  "rounded_corners",
  "outer_shadows",
  "col_left_width_pct",
  "video_defaults",
  "video_live_defaults",
  "video_popup_defaults",
  "video_recording_defaults",
]);

const DISPLAY_CHANGE_KEYS = Object.freeze([
  "display_filter_control",
  "display_calendar_control",
  "display_source_indicator",
  "display_online_indicator",
  "display_back_button",
  "display_alert_detection_chip",
  "display_alert_detection_outline",
  "display_object_chips",
  "display_location_area_zone",
  "display_alert_count",
  "display_footer",
]);

export const normalizeVideoFactoryDefaults = (value) =>
  value && typeof value === "object" ? value : {};

export const mergeVideoFactoryDefaults = (commonDefaults, viewDefaults) => {
  const common = normalizeVideoFactoryDefaults(commonDefaults);
  const view = normalizeVideoFactoryDefaults(viewDefaults);
  const merged = { ...common, ...view };

  for (const key of ["style", "dataset", "attributes"]) {
    if (!common[key] && !view[key]) continue;
    merged[key] = {
      ...normalizeVideoFactoryDefaults(common[key]),
      ...normalizeVideoFactoryDefaults(view[key]),
    };
  }

  if (common.classNames || view.classNames) {
    const tokens = [
      ...(Array.isArray(common.classNames) ? common.classNames : []),
      ...(Array.isArray(view.classNames) ? view.classNames : []),
    ]
      .map((token) => String(token || "").trim())
      .filter(Boolean);
    merged.classNames = [...new Set(tokens)];
  }

  return merged;
};

const normalizeRuntimeCameras = (config, previousConfig) => {
  let cameras;

  if (Array.isArray(config.cameras) && config.cameras.length) {
    cameras = config.cameras
      .map((camera) => normalizeCameraConfig(camera))
      .filter((camera) => camera.entity);
  } else if (typeof config.cameras === "string" && config.cameras) {
    cameras = [normalizeCameraConfig(config.cameras)].filter(
      (camera) => camera.entity,
    );
  } else if (config.cameras && typeof config.cameras === "object") {
    cameras = [normalizeCameraConfig(config.cameras)].filter(
      (camera) => camera.entity,
    );
  } else if (config.camera_entity) {
    cameras = [
      normalizeCameraConfig(
        { camera_entity: config.camera_entity },
        { fallbackName: config.title || null },
      ),
    ];
  } else if (config.camera) {
    cameras = [normalizeCameraConfig(config.camera)].filter(
      (camera) => camera.entity,
    );
  } else if (config.entity && /^camera\./.test(String(config.entity))) {
    cameras = [
      normalizeCameraConfig(String(config.entity), {
        fallbackName: config.title || null,
      }),
    ];
  } else if (Array.isArray(config.entities) && config.entities.length) {
    cameras = config.entities
      .map((entry) => (typeof entry === "string" ? entry : entry?.entity))
      .filter(
        (entity) =>
          typeof entity === "string" && /^camera\./.test(entity),
      )
      .map((entity) => normalizeCameraConfig(entity));
  } else if (previousConfig?.cameras?.length) {
    cameras = previousConfig.cameras
      .map((camera) => normalizeCameraConfig(camera))
      .filter((camera) => camera.entity);
  } else {
    cameras = [];
  }

  if (!cameras.length) {
    cameras = [
      {
        entity: DEFAULT_CAMERA_ENTITY,
        name: "Doorbell",
        alerts_content: "alerts_only",
      },
    ];
  }

  return limitCameraConfigsByPhysicalCount(cameras, MAX_CAMERAS);
};

export const normalizeRuntimeCardConfig = (
  config,
  { previousConfig = null } = {},
) => {
  const source = config && typeof config === "object" ? config : {};
  const cameras = normalizeRuntimeCameras(source, previousConfig);
  const normalized = normalizeCardConfig({ ...source, cameras });
  const runtimeConfig = {
    ...normalized,
    cameras,
    title: String(source.title || "").trim() || DEFAULT_TITLE,
    subtitle: String(source.subtitle || "").trim() || DEFAULT_SUBTITLE,
    refresh_seconds: Math.max(15, source.refresh_seconds || 45),
    preview_page_alert_live_duration_seconds: normalizeNumberChoice(
      source.preview_page_alert_live_duration_seconds,
      PREVIEW_ALERT_LIVE_DURATION_OPTIONS_SECONDS,
      Math.round(PREVIEW_ALERT_HOLD_MS / 1000),
    ),
    deep_link_enabled: source.deep_link_enabled !== false,
    browse_expanded: source.browse_expanded === true,
    compact_preview: source.compact_preview === true,
    tight_margins: source.tight_margins === true,
    video_defaults: normalizeVideoFactoryDefaults(source.video_defaults),
    video_live_defaults: normalizeVideoFactoryDefaults(
      source.video_live_defaults,
    ),
    video_popup_defaults: normalizeVideoFactoryDefaults(
      source.video_popup_defaults,
    ),
    video_recording_defaults: normalizeVideoFactoryDefaults(
      source.video_recording_defaults,
    ),
  };

  return Object.fromEntries(
    RUNTIME_CARD_CONFIG_KEYS.map((key) => [key, runtimeConfig[key]]),
  );
};

const cameraTopologyChanged = (previousConfig, nextConfig) => {
  const previousCameras = previousConfig?.cameras || [];
  const nextCameras = nextConfig?.cameras || [];
  return (
    previousCameras.length !== nextCameras.length ||
    previousCameras.some(
      (camera, index) =>
        camera?.entity !== nextCameras[index]?.entity ||
        camera?.group?.secondary_entity !==
          nextCameras[index]?.group?.secondary_entity ||
        camera?.group?.layout !== nextCameras[index]?.group?.layout,
    )
  );
};

export const resolveRuntimeCardConfigChangePlan = (
  previousConfig,
  nextConfig,
) => {
  const changed = (key) =>
    Boolean(previousConfig) && previousConfig[key] !== nextConfig[key];
  const previewEnabledChanged = changed("preview_page_enabled");
  const previewVisualChanged =
    changed("preview_page_live_cameras") ||
    changed("preview_page_live_cameras_mobile") ||
    changed("preview_page_show_title_bars") ||
    changed("preview_page_alert_live_duration_seconds");
  const mobileViewPageEnabledChanged = changed(
    "mobile_view_page_enabled",
  );
  const wideViewPageEnabledChanged = changed("wide_view_page_enabled");
  const wideViewTimelineEnabledChanged = changed(
    "wide_view_timeline_enabled",
  );
  const cardViewPageEnabledChanged = changed("card_view_page_enabled");
  const cardViewStandaloneChanged = changed("card_view_standalone");
  const displayFvcBrandLogoChanged = changed("display_logo");
  const displayOptionsChanged =
    Boolean(previousConfig) &&
    DISPLAY_CHANGE_KEYS.some(
      (key) => previousConfig[key] !== nextConfig[key],
    );
  const camerasChanged =
    Boolean(previousConfig) &&
    cameraTopologyChanged(previousConfig, nextConfig);
  const hiddenTabsChanged =
    Boolean(previousConfig) &&
    JSON.stringify(previousConfig.hidden_tabs || []) !==
      JSON.stringify(nextConfig.hidden_tabs || []);

  return {
    previewEnabledChanged,
    mobileViewPageEnabledChanged,
    wideViewPageEnabledChanged,
    wideViewTakeoverDefaultChanged: changed("wide_view_alert_takeover"),
    wideViewTimelineEnabledChanged,
    wideViewTimelineDefaultOpenChanged: changed(
      "wide_view_timeline_default_open",
    ),
    wideViewTimelineDefaultScaleChanged: changed(
      "wide_view_timeline_default_scale",
    ),
    cardViewPageEnabledChanged,
    cardViewTakeoverDefaultChanged: changed("card_view_alert_takeover"),
    cardViewStandaloneChanged,
    cardViewMediaDrawerEnabledChanged: changed(
      "card_view_media_drawer_enabled",
    ),
    cardViewStartModeChanged: changed("card_view_start_mode"),
    cardViewViewModeChanged: changed("card_view_view_mode"),
    cardViewHideCameraNameChanged: changed("card_view_hide_camera_name"),
    displayFvcBrandLogoChanged,
    displayOptionsChanged,
    previewVisualChanged,
    previewModeConfigChanged: previewEnabledChanged || previewVisualChanged,
    singleViewTakeoverDefaultChanged: changed(
      "single_view_alert_takeover",
    ),
    singleViewStartModeChanged: changed("single_view_start_mode"),
    wideViewStartModeChanged: changed("wide_view_start_mode"),
    camerasChanged,
    hiddenTabsChanged,
    needsShellRerender:
      hiddenTabsChanged ||
      previewEnabledChanged ||
      mobileViewPageEnabledChanged ||
      wideViewPageEnabledChanged ||
      wideViewTimelineEnabledChanged ||
      cardViewPageEnabledChanged ||
      cardViewStandaloneChanged ||
      displayFvcBrandLogoChanged ||
      displayOptionsChanged,
    needsEngineRemount: camerasChanged,
    snapshotUpdateChanged: changed("snapshot_update_seconds"),
    realtimePollChanged:
      changed("realtime_poll_seconds") ||
      changed("mobile_poll_battery_saver"),
  };
};
