import {
  GRID_ROTATION_OPTIONS_SECONDS,
  REALTIME_POLL_OPTIONS_SECONDS,
  SLIDESHOW_ROTATION_OPTIONS_SECONDS,
} from "../constants.js";
import { normalizePageRoute } from "../router.js";

const normalizePositiveInteger = (value, fallback) => {
  const parsed = parseInt(String(value ?? "").trim(), 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

export const createEditorPreviewDraft = (config) => ({
  title: config.title,
  subtitle: config.subtitle,
  cameras: Array.isArray(config.cameras)
    ? config.cameras.map((camera) => ({ ...camera }))
    : [],
  window_days: config.window_days,
  alerts_reviews_days: config.alerts_reviews_days,
  window_hours: config.window_hours,
  realtime_poll_seconds: config.realtime_poll_seconds,
  mobile_poll_battery_saver: config.mobile_poll_battery_saver,
  slideshow_rotation_enabled: config.slideshow_rotation_enabled,
  slideshow_rotation_seconds: config.slideshow_rotation_seconds,
  grid_mode_enabled: config.grid_mode_enabled,
  grid_start_in_grid_enabled: config.grid_start_in_grid_enabled,
  grid_live_view_enabled: config.grid_live_view_enabled,
  preview_page_enabled: config.preview_page_enabled,
  preview_page_live_cameras: config.preview_page_live_cameras,
  preview_page_show_title_bars: config.preview_page_show_title_bars,
  wide_view_page_enabled: config.wide_view_page_enabled,
  landing_page: config.landing_page,
  mobile_page: config.mobile_page,
  grid_rotation_seconds: config.grid_rotation_seconds,
  hidden_tabs: config.hidden_tabs,
  theme: config.theme,
  theme_custom: config.theme_custom,
  theme_custom_defaults: config.theme_custom_defaults,
  stream_height: config.stream_height,
  stream_height_unit: config.stream_height_unit,
  tight_margins: config.tight_margins,
  shadows: config.shadows,
  borders: config.borders,
  rounded_corners: config.rounded_corners,
  outer_shadows: config.outer_shadows,
  col_left_width_pct: config.col_left_width_pct,
});

export const applyEditorPreviewDraftToCardConfig = ({
  baseConfig,
  previewConfig,
}) => {
  if (!previewConfig) return baseConfig;
  const base = baseConfig && typeof baseConfig === "object" ? baseConfig : {};

  return {
    ...base,
    title: previewConfig.title || null,
    subtitle: previewConfig.subtitle || null,
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
    mobile_poll_battery_saver: previewConfig.mobile_poll_battery_saver === true,
    slideshow_rotation_enabled:
      previewConfig.slideshow_rotation_enabled === true,
    slideshow_rotation_seconds: SLIDESHOW_ROTATION_OPTIONS_SECONDS.includes(
      Number(previewConfig.slideshow_rotation_seconds),
    )
      ? Number(previewConfig.slideshow_rotation_seconds)
      : 30,
    grid_mode_enabled: previewConfig.grid_mode_enabled === true,
    grid_start_in_grid_enabled:
      previewConfig.grid_start_in_grid_enabled === true,
    grid_live_view_enabled: previewConfig.grid_live_view_enabled !== false,
    grid_rotation_seconds: GRID_ROTATION_OPTIONS_SECONDS.includes(
      Number(previewConfig.grid_rotation_seconds),
    )
      ? Number(previewConfig.grid_rotation_seconds)
      : 30,
    preview_page_enabled: previewConfig.preview_page_enabled === true,
    preview_page_live_cameras: previewConfig.preview_page_live_cameras === true,
    preview_page_show_title_bars:
      previewConfig.preview_page_show_title_bars !== false,
    hidden_tabs: Array.isArray(previewConfig.hidden_tabs)
      ? previewConfig.hidden_tabs
      : [],
    theme: previewConfig.theme === "custom" ? "custom" : "default",
    theme_custom:
      previewConfig.theme_custom &&
      typeof previewConfig.theme_custom === "object"
        ? previewConfig.theme_custom
        : {},
    theme_custom_defaults:
      previewConfig.theme_custom_defaults &&
      typeof previewConfig.theme_custom_defaults === "object"
        ? previewConfig.theme_custom_defaults
        : {},
    stream_height: previewConfig.stream_height
      ? Number(previewConfig.stream_height)
      : null,
    stream_height_unit: previewConfig.stream_height_unit || "vh",
    tight_margins: previewConfig.tight_margins === true,
    shadows: previewConfig.shadows !== false,
    borders: previewConfig.borders !== false,
    rounded_corners: previewConfig.rounded_corners !== false,
    outer_shadows: previewConfig.outer_shadows !== false,
    wide_view_page_enabled: previewConfig.wide_view_page_enabled === true,
    landing_page: normalizePageRoute(previewConfig.landing_page),
    mobile_page: normalizePageRoute(previewConfig.mobile_page),
    col_left_width_pct: Number(previewConfig.col_left_width_pct) || 50,
  };
};
