import {
  ALLOWED_HIDDEN_TABS,
  CARD_TAG,
  DEFAULT_CAMERA_CONNECTION_TYPE,
  DEFAULT_HIDDEN_TABS,
  DEFAULT_TITLE,
  DEFAULT_SUBTITLE,
  GRID_ALERT_HOLD_MS,
  GRID_ALERT_HOLD_OPTIONS_SECONDS,
  GRID_ROTATION_OPTIONS_SECONDS,
  REALTIME_POLL_OPTIONS_SECONDS,
  SLIDESHOW_ALERT_HOLD_MS,
  SLIDESHOW_ALERT_HOLD_OPTIONS_SECONDS,
  SNAPSHOT_UPDATE_SECONDS,
  SNAPSHOT_UPDATE_OPTIONS_SECONDS,
  SLIDESHOW_ROTATION_OPTIONS_SECONDS,
  PREVIEW_ALERT_LIVE_DURATION_OPTIONS_SECONDS,
  THEME_CUSTOM_KEYS,
} from "../constants.js";
import {
  DASHBOARD_SWIPE_NAVIGATION_MODES,
  DEVICE_ROUTE_BUCKETS,
  MOBILE_PAGE_MODES,
  normalizeDashboardSwipeNavigationMode,
  normalizeMobilePageMode,
  normalizePageRoute,
  PAGE_IDS,
  resolveDashboardSwipePageSelection,
  resolveDefaultDashboardSwipePages,
} from "../features/navigation/router.js";
import {
  normalizeNumberChoice,
} from "../helpers.js";
import { normalizeCameraPtzConfig } from "../features/ptz/index.js";
import { isCameraTextToken } from "../shared/page-text.js";
import {
  CARD_HEIGHT_DEFAULT,
  CARD_HEIGHT_DEFAULT_UNIT,
  normalizeCardHeight,
  normalizeCardHeightUnit,
  normalizeThemeCustomConfig,
} from "../features/card-style/config.js";
import {
  WIDE_LEFT_WIDTH_DEFAULT,
  normalizeWideLeftWidth,
  normalizeWideTimelineScale,
  WIDE_TIMELINE_DEFAULT_SCALE_HOURS,
} from "../features/wide-view/config.js";
import { normalizeCameraGroupConfig } from "../features/camera-groups/model.js";
import { normalizeLinkedEntitiesConfig } from "../features/linked-entities/config.js";
import {
  GRID_ORDER_MODES,
  normalizeGridOrderConfig,
} from "../features/grid/config.js";

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

const normalizeCameraConfig = (camera, { fallbackName = null } = {}) => {
  if (typeof camera === "string") {
    return {
      entity: camera,
      name: fallbackName,
      connection_type: DEFAULT_CAMERA_CONNECTION_TYPE,
      alerts_content: "alerts_only",
      ptz: null,
    };
  }
  if (camera && typeof camera === "object") {
    const entity = camera.entity || camera.camera_entity || null;
    const group = normalizeCameraGroupConfig(camera.group, {
      primaryEntity: entity,
    });
    const linkedEntities = normalizeLinkedEntitiesConfig(
      camera.linked_entities,
    );
    return {
      entity,
      name: camera.name || fallbackName,
      connection_type: normalizeCameraConnectionType(camera.connection_type),
      alerts_content: normalizeAlertsAreaContent(camera.alerts_content),
      ptz: normalizeCameraPtzConfig(camera.ptz),
      ...(camera.two_way_talk === true ? { two_way_talk: true } : {}),
      ...(group ? { group } : {}),
      ...(linkedEntities.length ? { linked_entities: linkedEntities } : {}),
    };
  }
  return {
    entity: null,
    name: fallbackName,
    connection_type: DEFAULT_CAMERA_CONNECTION_TYPE,
    alerts_content: "alerts_only",
    ptz: null,
  };
};

const addStringIfPresent = (target, key, value) => {
  const trimmed = String(value || "").trim();
  if (trimmed) target[key] = trimmed;
};

const addIfNotDefault = (target, key, value, defaultValue) => {
  if (value !== defaultValue) target[key] = value;
};

const cloneObjectIfPresent = (value) => {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const keys = Object.keys(value);
  if (!keys.length) return null;

  try {
    return JSON.parse(JSON.stringify(value));
  } catch (_) {
    return { ...value };
  }
};

const compactCameraPtzConfigForYaml = (value) => {
  const normalized = normalizeCameraPtzConfig(value);
  if (!normalized) return null;
  return { ...normalized };
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
  const ptz = compactCameraPtzConfigForYaml(normalized.ptz);
  if (ptz) {
    compact.ptz = ptz;
  }
  if (normalized.two_way_talk === true) {
    compact.two_way_talk = true;
  }
  if (normalized.group) {
    compact.group = { ...normalized.group };
  }
  if (normalized.linked_entities?.length) {
    compact.linked_entities = normalized.linked_entities.map((item) => ({
      ...item,
    }));
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

  const title = String(source.title || "").trim();
  if (title && title !== DEFAULT_TITLE) {
    compact.title = title;
  }
  const subtitle = String(source.subtitle || "").trim();
  if (subtitle && !isCameraTextToken(subtitle)) {
    compact.subtitle = subtitle;
  }
  addIfNotDefault(
    compact,
    "display_title",
    source.display_title !== false,
    true,
  );
  addIfNotDefault(
    compact,
    "display_subtitle",
    source.display_subtitle !== false,
    true,
  );
  addIfNotDefault(
    compact,
    "display_logo",
    source.display_logo !== false,
    true,
  );

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
  const snapshotUpdateSeconds = normalizeNumberChoice(
    source.snapshot_update_seconds,
    SNAPSHOT_UPDATE_OPTIONS_SECONDS,
    SNAPSHOT_UPDATE_SECONDS,
  );
  addIfNotDefault(
    compact,
    "snapshot_update_seconds",
    snapshotUpdateSeconds,
    SNAPSHOT_UPDATE_SECONDS,
  );
  addIfNotDefault(
    compact,
    "mobile_poll_battery_saver",
    source.mobile_poll_battery_saver === true,
    false,
  );
  addIfNotDefault(
    compact,
    "event_pre_post_roll_enabled",
    source.event_pre_post_roll_enabled === true,
    false,
  );
  addIfNotDefault(
    compact,
    "favorites_mixed_cameras",
    source.favorites_mixed_cameras !== false,
    true,
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
  const slideshowAlertHoldSeconds = normalizeNumberChoice(
    source.slideshow_alert_hold_seconds,
    SLIDESHOW_ALERT_HOLD_OPTIONS_SECONDS,
    Math.round(SLIDESHOW_ALERT_HOLD_MS / 1000),
  );
  addIfNotDefault(
    compact,
    "slideshow_alert_hold_seconds",
    slideshowAlertHoldSeconds,
    Math.round(SLIDESHOW_ALERT_HOLD_MS / 1000),
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
  const gridOrder = normalizeGridOrderConfig(
    source.grid_order,
    source.cameras,
  );
  if (gridOrder.mode === GRID_ORDER_MODES.custom) {
    compact.grid_order = {
      mode: GRID_ORDER_MODES.custom,
      included: [...gridOrder.included],
      excluded: [...gridOrder.excluded],
    };
  }
  addIfNotDefault(
    compact,
    "mobile_view_page_enabled",
    source.mobile_view_page_enabled !== false,
    true,
  );
  addIfNotDefault(
    compact,
    "mobile_view_rotate_to_fullscreen",
    source.mobile_view_rotate_to_fullscreen !== false,
    true,
  );
  addIfNotDefault(
    compact,
    "mobile_view_outer_border",
    source.mobile_view_outer_border === true,
    false,
  );
  addIfNotDefault(
    compact,
    "mobile_view_ha_navbar_bottom",
    source.mobile_view_ha_navbar_bottom === true,
    false,
  );
  addIfNotDefault(
    compact,
    "mobile_view_ha_navbar_stack_tabs",
    source.mobile_view_ha_navbar_stack_tabs === true,
    false,
  );
  addIfNotDefault(
    compact,
    "mobile_view_ha_navbar_dashboard",
    source.mobile_view_ha_navbar_dashboard === true,
    false,
  );
  const ownsDashboardSwipeNavigation =
    source.ha_dashboard_swipe_navigation_owner === true;
  addIfNotDefault(
    compact,
    "ha_dashboard_swipe_navigation_owner",
    ownsDashboardSwipeNavigation,
    false,
  );
  if (ownsDashboardSwipeNavigation) {
    const dashboardSwipeMode = normalizeDashboardSwipeNavigationMode(
      source.ha_dashboard_swipe_navigation,
    );
    addIfNotDefault(
      compact,
      "ha_dashboard_swipe_navigation",
      dashboardSwipeMode,
      DASHBOARD_SWIPE_NAVIGATION_MODES.dashboardWide,
    );
    if (dashboardSwipeMode === DASHBOARD_SWIPE_NAVIGATION_MODES.insideCard) {
      addIfNotDefault(
        compact,
        "ha_dashboard_swipe_include_other_cards",
        source.ha_dashboard_swipe_include_other_cards === true,
        false,
      );
    }
    if (
      dashboardSwipeMode ===
        DASHBOARD_SWIPE_NAVIGATION_MODES.dashboardWide ||
      dashboardSwipeMode === DASHBOARD_SWIPE_NAVIGATION_MODES.insideCard
    ) {
      const selectedPages = resolveDashboardSwipePageSelection(
        source,
        DEVICE_ROUTE_BUCKETS.desktop,
      );
      const defaultPages = resolveDefaultDashboardSwipePages(
        source,
        DEVICE_ROUTE_BUCKETS.desktop,
      );
      if (
        selectedPages.length !== defaultPages.length ||
        selectedPages.some((pageId, index) => pageId !== defaultPages[index])
      ) {
        compact.ha_dashboard_swipe_pages = [...selectedPages];
      }
    }
    if (
      dashboardSwipeMode ===
        DASHBOARD_SWIPE_NAVIGATION_MODES.dashboardWide ||
      dashboardSwipeMode ===
        DASHBOARD_SWIPE_NAVIGATION_MODES.landingDashboard
    ) {
      addIfNotDefault(
        compact,
        "ha_dashboard_swipe_include_subviews",
        source.ha_dashboard_swipe_include_subviews === true,
        false,
      );
    }
    addIfNotDefault(
      compact,
      "ha_dashboard_swipe_mouse_enabled",
      source.ha_dashboard_swipe_mouse_enabled === true,
      false,
    );
  }
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
    "preview_page_live_cameras_mobile",
    source.preview_page_live_cameras_mobile === true,
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
    "wide_view_live_cameras",
    source.wide_view_live_cameras === true,
    false,
  );
  addIfNotDefault(
    compact,
    "wide_view_alert_takeover",
    source.wide_view_alert_takeover === true,
    false,
  );
  addIfNotDefault(
    compact,
    "wide_view_timeline_enabled",
    source.wide_view_timeline_enabled === true,
    false,
  );
  addIfNotDefault(
    compact,
    "wide_view_timeline_default_open",
    source.wide_view_timeline_default_open === true,
    false,
  );
  addIfNotDefault(
    compact,
    "wide_view_timeline_default_scale",
    normalizeWideTimelineScale(source.wide_view_timeline_default_scale),
    WIDE_TIMELINE_DEFAULT_SCALE_HOURS,
  );
  addIfNotDefault(
    compact,
    "card_view_page_enabled",
    source.card_view_page_enabled === true,
    false,
  );
  addIfNotDefault(
    compact,
    "card_view_alert_takeover",
    source.card_view_alert_takeover === true,
    false,
  );
  addIfNotDefault(
    compact,
    "card_view_drawer_default_open",
    source.card_view_drawer_default_open !== false,
    true,
  );
  addIfNotDefault(
    compact,
    "card_view_standalone",
    source.card_view_page_enabled === true &&
      source.card_view_standalone === true,
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
    normalizeMobilePageMode(source.mobile_page),
    MOBILE_PAGE_MODES.single,
  );

  const gridRotationSeconds = GRID_ROTATION_OPTIONS_SECONDS.includes(
    Number(source.grid_rotation_seconds),
  )
    ? Number(source.grid_rotation_seconds)
    : 30;
  addIfNotDefault(compact, "grid_rotation_seconds", gridRotationSeconds, 30);
  const gridAlertHoldSeconds = normalizeNumberChoice(
    source.grid_alert_hold_seconds,
    GRID_ALERT_HOLD_OPTIONS_SECONDS,
    Math.round(GRID_ALERT_HOLD_MS / 1000),
  );
  addIfNotDefault(
    compact,
    "grid_alert_hold_seconds",
    gridAlertHoldSeconds,
    Math.round(GRID_ALERT_HOLD_MS / 1000),
  );
  const previewAlertLiveDurationSeconds = normalizeNumberChoice(
    source.preview_page_alert_live_duration_seconds,
    PREVIEW_ALERT_LIVE_DURATION_OPTIONS_SECONDS,
    10,
  );
  addIfNotDefault(
    compact,
    "preview_page_alert_live_duration_seconds",
    previewAlertLiveDurationSeconds,
    10,
  );

  const hiddenTabs = Array.isArray(source.hidden_tabs)
    ? source.hidden_tabs
        .map((id) => (id === "reviews" ? "alerts" : id))
        .filter((id) => ALLOWED_HIDDEN_TABS.includes(id))
    : [...DEFAULT_HIDDEN_TABS];
  const usesDefaultHiddenTabs =
    hiddenTabs.length === DEFAULT_HIDDEN_TABS.length &&
    DEFAULT_HIDDEN_TABS.every((tabId) => hiddenTabs.includes(tabId));
  if (!usesDefaultHiddenTabs) compact.hidden_tabs = hiddenTabs;

  if (source.theme === "custom") {
    compact.theme = "custom";
    const themeCustom = normalizeThemeCustomConfig(source.theme_custom);
    const themeCustomDefaults =
      source.theme_custom_defaults &&
      typeof source.theme_custom_defaults === "object"
        ? source.theme_custom_defaults
        : {};
    const compactThemeCustom = themeCustom.map(({ modes, overrides }) => {
      const compactOverrides = {};
      Object.entries(overrides).forEach(([key, value]) => {
        if (!THEME_CUSTOM_KEYS.has(key)) return;
        const usesDefault = modes.every((mode) => {
          const modeDefaults =
            themeCustomDefaults[mode] &&
            typeof themeCustomDefaults[mode] === "object"
              ? themeCustomDefaults[mode]
              : themeCustomDefaults;
          return modeDefaults[key] === true;
        });
        if (usesDefault) return;
        const color = normalizeHexColor(value);
        if (!color) return;
        const matchesEverySelectedModeDefault = modes.every(
          (mode) => {
            const defaultColor = normalizeHexColor(
              themeDefaultColors?.[mode]?.[key],
            );
            return !!defaultColor && defaultColor === color;
          },
        );
        if (matchesEverySelectedModeDefault) return;
        compactOverrides[key] = color;
      });
      return { modes: [...modes], overrides: compactOverrides };
    });
    if (compactThemeCustom.length) {
      compact.theme_custom = compactThemeCustom;
    }
  }

  const hasStreamHeight =
    source.stream_height != null && String(source.stream_height).trim() !== "";
  const streamHeight = normalizeCardHeight(source.stream_height);
  if (hasStreamHeight && streamHeight !== CARD_HEIGHT_DEFAULT) {
    compact.stream_height = streamHeight;
  }
  const streamHeightUnit = normalizeCardHeightUnit(source.stream_height_unit);
  if (hasStreamHeight && streamHeightUnit !== CARD_HEIGHT_DEFAULT_UNIT) {
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
  const leftWidth = normalizeWideLeftWidth(source.col_left_width_pct);
  addIfNotDefault(
    compact,
    "col_left_width_pct",
    leftWidth,
    WIDE_LEFT_WIDTH_DEFAULT,
  );

  const videoDefaults = cloneObjectIfPresent(source.video_defaults);
  if (videoDefaults) compact.video_defaults = videoDefaults;

  const videoLiveDefaults = cloneObjectIfPresent(source.video_live_defaults);
  if (videoLiveDefaults) compact.video_live_defaults = videoLiveDefaults;

  const videoPopupDefaults = cloneObjectIfPresent(source.video_popup_defaults);
  if (videoPopupDefaults) compact.video_popup_defaults = videoPopupDefaults;

  const videoRecordingDefaults = cloneObjectIfPresent(
    source.video_recording_defaults,
  );
  if (videoRecordingDefaults) {
    compact.video_recording_defaults = videoRecordingDefaults;
  }

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
