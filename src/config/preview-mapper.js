import {
  DEFAULT_TITLE,
  DEFAULT_SUBTITLE,
  DEFAULT_HIDDEN_TABS,
  GRID_ROTATION_OPTIONS_SECONDS,
  REALTIME_POLL_OPTIONS_SECONDS,
  GRID_ALERT_HOLD_MS,
  GRID_ALERT_HOLD_OPTIONS_SECONDS,
  SLIDESHOW_ALERT_HOLD_MS,
  SLIDESHOW_ALERT_HOLD_OPTIONS_SECONDS,
  SNAPSHOT_UPDATE_SECONDS,
  SNAPSHOT_UPDATE_OPTIONS_SECONDS,
  SLIDESHOW_ROTATION_OPTIONS_SECONDS,
  PREVIEW_ALERT_LIVE_DURATION_OPTIONS_SECONDS,
} from "../constants.js";
import {
  DEVICE_ROUTE_BUCKETS,
  normalizeDashboardSwipeNavigationMode,
  normalizeMobilePageMode,
  normalizePageRoute,
  resolveDashboardSwipePageSelection,
} from "../features/navigation/router.js";
import {
  normalizeNumberChoice,
  normalizeThemeCustomConfig,
  normalizeThemeCustomDefaultsConfig,
} from "../helpers.js";
import {
  normalizeCardHeight,
  normalizeCardHeightUnit,
} from "../features/card-style/config.js";
import {
  normalizeWideLeftWidth,
  normalizeWideTimelineScale,
} from "../features/wide-view/config.js";
import { normalizeGridOrderConfig } from "../features/grid/config.js";

const normalizePositiveInteger = (value, fallback) => {
  const parsed = parseInt(String(value ?? "").trim(), 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

export const createEditorPreviewDraft = (config) => ({
  title: config.title,
  subtitle: config.subtitle,
  display_title: config.display_title,
  display_subtitle: config.display_subtitle,
  display_logo: config.display_logo,
  cameras: Array.isArray(config.cameras)
    ? config.cameras.map((camera) => ({
        ...camera,
        ...(camera?.group ? { group: { ...camera.group } } : {}),
        ...(Array.isArray(camera?.linked_entities)
          ? {
              linked_entities: camera.linked_entities.map((item) => ({
                ...item,
              })),
            }
          : {}),
      }))
    : [],
  window_days: config.window_days,
  alerts_reviews_days: config.alerts_reviews_days,
  window_hours: config.window_hours,
  realtime_poll_seconds: config.realtime_poll_seconds,
  snapshot_update_seconds: config.snapshot_update_seconds,
  mobile_poll_battery_saver: config.mobile_poll_battery_saver,
  event_pre_post_roll_enabled: config.event_pre_post_roll_enabled,
  favorites_mixed_cameras: config.favorites_mixed_cameras,
  slideshow_rotation_enabled: config.slideshow_rotation_enabled,
  slideshow_rotation_seconds: config.slideshow_rotation_seconds,
  slideshow_alert_hold_seconds: config.slideshow_alert_hold_seconds,
  grid_mode_enabled: config.grid_mode_enabled,
  grid_order: normalizeGridOrderConfig(config.grid_order, config.cameras),
  grid_start_in_grid_enabled: config.grid_start_in_grid_enabled,
  grid_live_view_enabled: config.grid_live_view_enabled,
  grid_alert_hold_seconds: config.grid_alert_hold_seconds,
  mobile_view_page_enabled: config.mobile_view_page_enabled,
  mobile_view_rotate_to_fullscreen:
    config.mobile_view_rotate_to_fullscreen,
  mobile_view_outer_border: config.mobile_view_outer_border,
  mobile_view_ha_navbar_bottom: config.mobile_view_ha_navbar_bottom,
  mobile_view_ha_navbar_stack_tabs:
    config.mobile_view_ha_navbar_stack_tabs,
  mobile_view_ha_navbar_dashboard:
    config.mobile_view_ha_navbar_dashboard,
  ha_dashboard_swipe_navigation_owner:
    config.ha_dashboard_swipe_navigation_owner,
  ha_dashboard_swipe_navigation:
    normalizeDashboardSwipeNavigationMode(
      config.ha_dashboard_swipe_navigation,
    ),
  ha_dashboard_swipe_include_other_cards:
    config.ha_dashboard_swipe_include_other_cards,
  ha_dashboard_swipe_include_subviews:
    config.ha_dashboard_swipe_include_subviews,
  ha_dashboard_swipe_mouse_enabled:
    config.ha_dashboard_swipe_mouse_enabled,
  ha_dashboard_swipe_pages: Array.isArray(
    config.ha_dashboard_swipe_pages,
  )
    ? [...config.ha_dashboard_swipe_pages]
    : undefined,
  preview_page_enabled: config.preview_page_enabled,
  preview_page_live_cameras: config.preview_page_live_cameras,
  preview_page_live_cameras_mobile:
    config.preview_page_live_cameras_mobile,
  preview_page_alert_live_duration_seconds:
    config.preview_page_alert_live_duration_seconds,
  preview_page_show_title_bars: config.preview_page_show_title_bars,
  wide_view_page_enabled: config.wide_view_page_enabled,
  wide_view_live_cameras: config.wide_view_live_cameras,
  wide_view_alert_takeover: config.wide_view_alert_takeover,
  wide_view_timeline_enabled: config.wide_view_timeline_enabled,
  wide_view_timeline_default_open: config.wide_view_timeline_default_open,
  wide_view_timeline_default_scale: config.wide_view_timeline_default_scale,
  card_view_page_enabled: config.card_view_page_enabled,
  card_view_alert_takeover: config.card_view_alert_takeover,
  card_view_drawer_default_open: config.card_view_drawer_default_open,
  card_view_standalone: config.card_view_standalone,
  landing_page: config.landing_page,
  mobile_page: config.mobile_page,
  grid_rotation_seconds: config.grid_rotation_seconds,
  hidden_tabs: config.hidden_tabs,
  theme: config.theme,
  theme_custom: normalizeThemeCustomConfig(config.theme_custom),
  theme_custom_defaults: normalizeThemeCustomDefaultsConfig(
    config.theme_custom_defaults,
  ),
  stream_height: config.stream_height,
  stream_height_unit: config.stream_height_unit,
  tight_margins: config.tight_margins,
  shadows: config.shadows,
  borders: config.borders,
  rounded_corners: config.rounded_corners,
  outer_shadows: config.outer_shadows,
  col_left_width_pct: config.col_left_width_pct,
  video_defaults: config.video_defaults,
  video_live_defaults: config.video_live_defaults,
  video_popup_defaults: config.video_popup_defaults,
  video_recording_defaults: config.video_recording_defaults,
});

export const applyEditorPreviewDraftToCardConfig = ({
  baseConfig,
  previewConfig,
}) => {
  if (!previewConfig) return baseConfig;
  const base = baseConfig && typeof baseConfig === "object" ? baseConfig : {};

  const applied = {
    ...base,
    title: String(previewConfig.title || "").trim() || DEFAULT_TITLE,
    subtitle: String(previewConfig.subtitle || "").trim() || DEFAULT_SUBTITLE,
    display_title: previewConfig.display_title !== false,
    display_subtitle: previewConfig.display_subtitle !== false,
    display_logo: previewConfig.display_logo !== false,
    cameras: Array.isArray(previewConfig.cameras)
      ? previewConfig.cameras
      : base.cameras,
    window_days: normalizePositiveInteger(previewConfig.window_days, 3),
    alerts_reviews_days: normalizePositiveInteger(
      previewConfig.alerts_reviews_days,
      normalizePositiveInteger(previewConfig.window_days, 3),
    ),
    window_hours: Number(previewConfig.window_hours) || null,
    realtime_poll_seconds: REALTIME_POLL_OPTIONS_SECONDS.includes(
      Number(previewConfig.realtime_poll_seconds),
    )
      ? Number(previewConfig.realtime_poll_seconds)
      : 5,
    snapshot_update_seconds: normalizeNumberChoice(
      previewConfig.snapshot_update_seconds,
      SNAPSHOT_UPDATE_OPTIONS_SECONDS,
      SNAPSHOT_UPDATE_SECONDS,
    ),
    mobile_poll_battery_saver: previewConfig.mobile_poll_battery_saver === true,
    event_pre_post_roll_enabled:
      previewConfig.event_pre_post_roll_enabled === true,
    favorites_mixed_cameras:
      previewConfig.favorites_mixed_cameras !== false,
    slideshow_rotation_enabled:
      previewConfig.slideshow_rotation_enabled === true,
    slideshow_rotation_seconds: SLIDESHOW_ROTATION_OPTIONS_SECONDS.includes(
      Number(previewConfig.slideshow_rotation_seconds),
    )
      ? Number(previewConfig.slideshow_rotation_seconds)
      : 30,
    slideshow_alert_hold_seconds: normalizeNumberChoice(
      previewConfig.slideshow_alert_hold_seconds,
      SLIDESHOW_ALERT_HOLD_OPTIONS_SECONDS,
      Math.round(SLIDESHOW_ALERT_HOLD_MS / 1000),
    ),
    grid_mode_enabled: previewConfig.grid_mode_enabled === true,
    grid_order: normalizeGridOrderConfig(
      previewConfig.grid_order,
      Array.isArray(previewConfig.cameras)
        ? previewConfig.cameras
        : base.cameras,
    ),
    grid_start_in_grid_enabled:
      previewConfig.grid_start_in_grid_enabled === true,
    grid_live_view_enabled: previewConfig.grid_live_view_enabled !== false,
    grid_alert_hold_seconds: normalizeNumberChoice(
      previewConfig.grid_alert_hold_seconds,
      GRID_ALERT_HOLD_OPTIONS_SECONDS,
      Math.round(GRID_ALERT_HOLD_MS / 1000),
    ),
    grid_rotation_seconds: GRID_ROTATION_OPTIONS_SECONDS.includes(
      Number(previewConfig.grid_rotation_seconds),
    )
      ? Number(previewConfig.grid_rotation_seconds)
      : 30,
    mobile_view_page_enabled: previewConfig.mobile_view_page_enabled === true,
    mobile_view_rotate_to_fullscreen:
      previewConfig.mobile_view_rotate_to_fullscreen !== false,
    mobile_view_outer_border:
      previewConfig.mobile_view_outer_border === true,
    mobile_view_ha_navbar_bottom:
      previewConfig.mobile_view_ha_navbar_bottom === true,
    mobile_view_ha_navbar_stack_tabs:
      previewConfig.mobile_view_ha_navbar_stack_tabs === true,
    mobile_view_ha_navbar_dashboard:
      previewConfig.mobile_view_ha_navbar_dashboard === true,
    ha_dashboard_swipe_navigation_owner:
      previewConfig.ha_dashboard_swipe_navigation_owner === true,
    ha_dashboard_swipe_navigation:
      normalizeDashboardSwipeNavigationMode(
        previewConfig.ha_dashboard_swipe_navigation,
      ),
    ha_dashboard_swipe_include_other_cards:
      previewConfig.ha_dashboard_swipe_include_other_cards === true,
    ha_dashboard_swipe_include_subviews:
      previewConfig.ha_dashboard_swipe_include_subviews === true,
    ha_dashboard_swipe_mouse_enabled:
      previewConfig.ha_dashboard_swipe_mouse_enabled === true,
    ha_dashboard_swipe_pages: Array.isArray(
      previewConfig.ha_dashboard_swipe_pages,
    )
      ? [...previewConfig.ha_dashboard_swipe_pages]
      : undefined,
    preview_page_enabled: previewConfig.preview_page_enabled === true,
    preview_page_live_cameras: previewConfig.preview_page_live_cameras === true,
    preview_page_live_cameras_mobile:
      previewConfig.preview_page_live_cameras_mobile === true,
    preview_page_alert_live_duration_seconds: normalizeNumberChoice(
      previewConfig.preview_page_alert_live_duration_seconds,
      PREVIEW_ALERT_LIVE_DURATION_OPTIONS_SECONDS,
      10,
    ),
    preview_page_show_title_bars:
      previewConfig.preview_page_show_title_bars !== false,
    hidden_tabs: Array.isArray(previewConfig.hidden_tabs)
      ? previewConfig.hidden_tabs
      : [...DEFAULT_HIDDEN_TABS],
    theme: previewConfig.theme === "custom" ? "custom" : "default",
    theme_custom: normalizeThemeCustomConfig(previewConfig.theme_custom),
    theme_custom_defaults: normalizeThemeCustomDefaultsConfig(
      previewConfig.theme_custom_defaults,
    ),
    stream_height: normalizeCardHeight(previewConfig.stream_height),
    stream_height_unit: normalizeCardHeightUnit(
      previewConfig.stream_height_unit,
    ),
    tight_margins: previewConfig.tight_margins === true,
    shadows: previewConfig.shadows !== false,
    borders: previewConfig.borders !== false,
    rounded_corners: previewConfig.rounded_corners !== false,
    outer_shadows: previewConfig.outer_shadows !== false,
    wide_view_page_enabled: previewConfig.wide_view_page_enabled === true,
    wide_view_live_cameras: previewConfig.wide_view_live_cameras === true,
    wide_view_alert_takeover:
      previewConfig.wide_view_alert_takeover === true,
    wide_view_timeline_enabled:
      previewConfig.wide_view_timeline_enabled === true,
    wide_view_timeline_default_open:
      previewConfig.wide_view_timeline_default_open === true,
    wide_view_timeline_default_scale: normalizeWideTimelineScale(
      previewConfig.wide_view_timeline_default_scale,
    ),
    card_view_page_enabled: previewConfig.card_view_page_enabled === true,
    card_view_alert_takeover:
      previewConfig.card_view_alert_takeover === true,
    card_view_drawer_default_open:
      previewConfig.card_view_drawer_default_open !== false,
    card_view_standalone:
      previewConfig.card_view_page_enabled === true &&
      previewConfig.card_view_standalone === true,
    landing_page: normalizePageRoute(previewConfig.landing_page),
    mobile_page: normalizeMobilePageMode(previewConfig.mobile_page),
    col_left_width_pct: normalizeWideLeftWidth(
      previewConfig.col_left_width_pct,
    ),
    video_defaults:
      previewConfig.video_defaults &&
      typeof previewConfig.video_defaults === "object" &&
      !Array.isArray(previewConfig.video_defaults)
        ? previewConfig.video_defaults
        : base.video_defaults,
    video_live_defaults:
      previewConfig.video_live_defaults &&
      typeof previewConfig.video_live_defaults === "object" &&
      !Array.isArray(previewConfig.video_live_defaults)
        ? previewConfig.video_live_defaults
        : base.video_live_defaults,
    video_popup_defaults:
      previewConfig.video_popup_defaults &&
      typeof previewConfig.video_popup_defaults === "object" &&
      !Array.isArray(previewConfig.video_popup_defaults)
        ? previewConfig.video_popup_defaults
        : base.video_popup_defaults,
    video_recording_defaults:
      previewConfig.video_recording_defaults &&
      typeof previewConfig.video_recording_defaults === "object" &&
      !Array.isArray(previewConfig.video_recording_defaults)
        ? previewConfig.video_recording_defaults
        : base.video_recording_defaults,
  };
  applied.ha_dashboard_swipe_pages =
    resolveDashboardSwipePageSelection(
      applied,
      DEVICE_ROUTE_BUCKETS.desktop,
    );
  return applied;
};
