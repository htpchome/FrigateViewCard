import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

import {
  bindThemeControlEvents,
  buildEditorConfigFromDom,
  resolveSwitchChecked,
} from "../src/helpers.js";
import {
  applyEditorPreviewDraftToCardConfig,
  applyEditorVisualPreviewDraftToCardConfig,
  createEditorPreviewDraft,
} from "../src/config/preview-mapper.js";
import {
  compactEditorConfigForYaml,
  withCardTypeForYaml,
} from "../src/config/yaml-mapper.js";
import {
  DEFAULT_CAMERA_ENTITY,
  PREFERRED_DEFAULT_CAMERA_ENTITIES,
  normalizeCardConfig,
  resolvePreferredDefaultCameraEntity,
} from "../src/config/card-config.js";
import {
  normalizeCardHeight,
  normalizeCardHeightUnit,
} from "../src/features/card-style/config.js";
import { normalizeWideLeftWidth } from "../src/features/wide-view/config.js";
import {
  DASHBOARD_SWIPE_NAVIGATION_MODES,
  PAGE_IDS,
} from "../src/features/navigation/router.js";
import {
  MAX_CAMERAS,
  GRID_ALERT_HOLD_OPTIONS_SECONDS,
  MOBILE_BATTERY_SAVER_POLL_SECONDS,
  REALTIME_POLL_OPTIONS_SECONDS,
  SNAPSHOT_UPDATE_OPTIONS_SECONDS,
  SLIDESHOW_ALERT_HOLD_OPTIONS_SECONDS,
  PREVIEW_ALERT_LIVE_DURATION_OPTIONS_SECONDS,
  THEME_CUSTOM_ROWS,
  THEME_DEFAULTS,
} from "../src/constants.js";

const cardSource = fs.readFileSync(
  new URL("../src/card/FrigateViewCard.js", import.meta.url),
  "utf8",
);
const editorSource = fs.readFileSync(
  new URL("../src/editor/FrigateViewCardEditor.js", import.meta.url),
  "utf8",
);

test("new cards prefer familiar available camera entities in order", () => {
  assert.deepEqual(PREFERRED_DEFAULT_CAMERA_ENTITIES, [
    "camera.doorbell",
    "camera.front_door",
    "camera.driveway",
    "camera.garage",
    "camera.backyard",
  ]);
  assert.equal(
    resolvePreferredDefaultCameraEntity({
      states: {
        "camera.driveway": {},
        "camera.front_door": {},
        "camera.garage": {},
      },
    }),
    "camera.front_door",
  );
  assert.equal(
    resolvePreferredDefaultCameraEntity({
      states: {
        "camera.backyard": {},
        "camera.garage": {},
      },
    }),
    "camera.garage",
  );
});

test("new cards fall back to doorbell when no preferred camera exists", () => {
  assert.equal(
    resolvePreferredDefaultCameraEntity({
      states: { "camera.side_yard": {} },
    }),
    DEFAULT_CAMERA_ENTITY,
  );
  assert.equal(resolvePreferredDefaultCameraEntity(), "camera.doorbell");
});

test("card runtime preserves editor-backed favorite and alert hold settings", () => {
  const setConfigStart = cardSource.indexOf("  setConfig(config) {");
  const setConfigEnd = cardSource.indexOf("  set hass(hass) {", setConfigStart);
  const setConfigSource = cardSource.slice(setConfigStart, setConfigEnd);

  assert.match(
    setConfigSource,
    /favorites_mixed_cameras:\s*config\.favorites_mixed_cameras !== false/,
  );
  assert.match(
    setConfigSource,
    /slideshow_alert_hold_seconds:\s*normalizeNumberChoice\(/,
  );
  assert.match(
    setConfigSource,
    /grid_alert_hold_seconds:\s*normalizeNumberChoice\(/,
  );
  assert.match(
    setConfigSource,
    /display_logo:\s*config\.display_logo !== false/,
  );
  assert.match(
    setConfigSource,
    /mobile_view_ha_navbar_bottom:\s*config\.mobile_view_ha_navbar_bottom === true/,
  );
  assert.match(
    setConfigSource,
    /mobile_view_ha_navbar_stack_tabs:\s*config\.mobile_view_ha_navbar_stack_tabs === true/,
  );
  assert.match(
    setConfigSource,
    /mobile_view_ha_navbar_dashboard:\s*config\.mobile_view_ha_navbar_dashboard === true/,
  );
  assert.match(
    setConfigSource,
    /ha_dashboard_swipe_navigation:\s*normalizeDashboardSwipeNavigationMode\(/,
  );
  assert.match(
    setConfigSource,
    /ha_dashboard_swipe_navigation_owner:\s*config\.ha_dashboard_swipe_navigation_owner === true/,
  );
  assert.match(
    setConfigSource,
    /ha_dashboard_swipe_include_other_cards:\s*config\.ha_dashboard_swipe_include_other_cards === true/,
  );
  assert.match(
    setConfigSource,
    /ha_dashboard_swipe_include_subviews:\s*config\.ha_dashboard_swipe_include_subviews === true/,
  );
});

test("alert hold controls explain their runtime behavior", () => {
  assert.match(
    editorSource,
    /How long Slideshow stays on a camera selected by a qualifying alert/,
  );
  assert.match(
    editorSource,
    /How long an alerted Grid tile remains highlighted/,
  );
});

test("editor range and checkbox controls use the chip primary accent", () => {
  assert.match(
    editorSource,
    /input\[type="range"\],input\[type="checkbox"\]\{accent-color:var\(--c-primary, var\(--editor-primary\)\);\}/,
  );
});

test("editor switches use the same active color pair as choice chips", () => {
  assert.match(
    editorSource,
    /ha-switch\{[\s\S]*?--primary-color:var\(--c-primary, var\(--editor-primary\)\);/,
  );
  assert.match(
    editorSource,
    /--state-on-color:var\(--c-primary, var\(--editor-primary\)\);/,
  );
  assert.match(
    editorSource,
    /--switch-checked-color:var\(--c-primary, var\(--editor-primary\)\);/,
  );
  assert.match(
    editorSource,
    /--switch-checked-button-color:var\(--c-primary, var\(--editor-primary\)\);/,
  );
  assert.match(
    editorSource,
    /--switch-checked-track-color:var\(--c-primary-l, var\(--editor-primary-l\)\);/,
  );
  assert.match(
    editorSource,
    /--ha-color-fill-primary-loud-resting:var\(--c-primary, var\(--editor-primary\)\);/,
  );
  assert.match(
    editorSource,
    /--wa-color-brand-fill-normal:var\(--c-primary-l, var\(--editor-primary-l\)\);/,
  );
});

test("requested editor settings use the shared choice-chip control", () => {
  const fieldNames = [
    "realtime_poll_seconds",
    "snapshot_update_seconds",
    "preview_page_alert_live_duration_seconds",
    "slideshow_rotation_seconds",
    "slideshow_alert_hold_seconds",
    "grid_rotation_seconds",
    "grid_alert_hold_seconds",
    "wide_view_timeline_default_scale",
    "stream_height_unit",
    "camera-modal-group-layout",
    "camera-modal-light-position",
    "camera-modal-ptz-rotation",
  ];

  fieldNames.forEach((name) => {
    assert.match(editorSource, new RegExp(`name: "${name}"`));
  });
  assert.doesNotMatch(
    editorSource,
    /<ha-selector id="(?:realtime_poll_seconds|slideshow_rotation_seconds|grid_rotation_seconds|stream_height_unit)"/,
  );
  assert.doesNotMatch(
    editorSource,
    /<input id="(?:snapshot_update_seconds|preview_page_alert_live_duration_seconds|slideshow_alert_hold_seconds|grid_alert_hold_seconds)" type="range"/,
  );
  assert.match(
    editorSource,
    /editor-choice-field--single-row" id="grid_rotation_seconds"/,
  );
  assert.match(
    editorSource,
    /editor-choice-field--single-row" id="grid_alert_hold_seconds"/,
  );
  assert.match(
    editorSource,
    /How often Grid mode advances to the next set of cameras/,
  );
  assert.match(editorSource, /editor-choice-chips--detailed/);
  assert.match(editorSource, /label: "Dashboard Wide"/);
  assert.match(editorSource, /label: "Inside Card Only"/);
  assert.match(
    editorSource,
    /label: "Landing Page plus Dashboard Pages"/,
  );
  assert.match(editorSource, /label: "None"/);
  assert.match(
    editorSource,
    /name="ha_dashboard_swipe_navigation"/,
  );
  assert.match(
    editorSource,
    /id="ha_dashboard_swipe_navigation_owner"/,
  );
  assert.match(
    editorSource,
    /Include Other FrigateView Pages/,
  );
  assert.match(editorSource, /Swipe to Subviews/);
  assert.match(
    editorSource,
    /data-ha-dashboard-swipe-include-subviews/,
  );
  assert.match(editorSource, /`Page \$\{ownerPageName\}`/);
  assert.match(editorSource, /swipe-owner-warning strong/);
  assert.doesNotMatch(
    editorSource,
    /<ha-switch id="ha_dashboard_swipe_navigation"/,
  );
  assert.match(
    editorSource,
    /editor-choice-field--single-row" id="slideshow_rotation_seconds"/,
  );
});

test("realtime polling offers slower choices and Battery Saver uses one minute", () => {
  assert.deepEqual(REALTIME_POLL_OPTIONS_SECONDS, [2, 5, 10, 15, 30, 60]);
  assert.equal(MOBILE_BATTERY_SAVER_POLL_SECONDS, 60);
  assert.equal(
    normalizeCardConfig({ realtime_poll_seconds: 30 }).realtime_poll_seconds,
    30,
  );
  assert.equal(
    normalizeCardConfig({ realtime_poll_seconds: 60 }).realtime_poll_seconds,
    60,
  );
  assert.match(
    editorSource,
    /checks for new Frigate alerts and reviews when realtime notifications are delayed or missed/,
  );
  assert.match(
    editorSource,
    /check for new alerts and reviews every 60 seconds to reduce battery and data use/,
  );
  assert.match(
    editorSource,
    /#realtime_poll_seconds \.editor-choice-chips\{grid-template-columns:repeat\(3,minmax\(0,1fr\)\);\}/,
  );
});

test("editor choice chips avoid native fieldsets while retaining group semantics", () => {
  assert.doesNotMatch(editorSource, /<fieldset\b|<legend\b/);
  assert.match(
    editorSource,
    /id="realtime_poll_seconds" role="radiogroup" aria-label="Realtime Update Poll"/,
  );
  assert.match(
    editorSource,
    /class="editor-choice-field" role="group" aria-label="FrigateView Pages"/,
  );
});

test("Card View settings panel reuses the page-navigation icon", () => {
  assert.match(
    editorSource,
    /id: "cardview", title: "Card View", icon: ICONS\.cardView/,
  );
  assert.doesNotMatch(editorSource, /title: "Card View", icon: "mdi:card-outline"/);
});

test("custom theme background rows use the requested order and defaults", () => {
  const keys = THEME_CUSTOM_ROWS.map(({ key }) => key);
  const labels = Object.fromEntries(
    THEME_CUSTOM_ROWS.map(({ key, label }) => [key, label]),
  );

  assert.equal(
    keys.indexOf("--c-bg-primary") + 1,
    keys.indexOf("--c-bg-panel"),
  );
  assert.equal(
    keys.indexOf("--c-bg-panel") + 1,
    keys.indexOf("--c-bg-tabs-holder"),
  );
  assert.equal(
    keys.indexOf("--c-bg-mobile") + 1,
    keys.indexOf("--c-bg-mobile-list"),
  );
  assert.equal(
    keys.indexOf("--c-bg-mobile-list") + 1,
    keys.indexOf("--c-bg-list"),
  );
  assert.equal(
    keys.indexOf("--c-bg-list") + 1,
    keys.indexOf("--c-bg-cam-btn"),
  );
  assert.equal(
    keys.indexOf("--c-bg-cam-btn") + 1,
    keys.indexOf("--c-text"),
  );
  assert.equal(
    labels["--c-bg-primary"],
    "Primary Background Color",
  );
  assert.equal(
    labels["--c-bg-tabs-holder"],
    "Navigation Tabs Background",
  );
  assert.equal(labels["--c-bg-mobile"], "Mobile Background Color");
  assert.equal(
    labels["--c-bg-mobile-list"],
    "Mobile List Background Color",
  );
  assert.equal(labels["--c-bg-list"], "List Background Color");
  assert.equal(
    labels["--c-bg-cam-btn"],
    "Camera Button Background Color",
  );
  assert.equal(
    THEME_DEFAULTS["--c-bg-primary"],
    "var(--primary-background-color)",
  );
  assert.equal(
    THEME_DEFAULTS["--c-bg-tabs-holder"],
    "var(--fvc-tabs-holder)",
  );
  assert.match(
    THEME_DEFAULTS["--c-bg-mobile"],
    /--wa-color-neutral-fill-normal/,
  );
  assert.doesNotMatch(
    THEME_DEFAULTS["--c-bg-mobile"],
    /--ha-color-fill-neutral-normal-resting/,
  );
  assert.equal(
    THEME_DEFAULTS["--c-bg-mobile-list"],
    "#f0f0f0",
  );
  assert.equal(THEME_DEFAULTS["--c-bg-list"], "#f0f0f0");
  assert.equal(THEME_DEFAULTS["--c-bg-cam-btn"], "#f0f0f0");
  assert.equal(labels["--c-primary-d"], "Primary Dark Color");
  assert.equal(labels["--c-accent"], "Accent Color");
  assert.equal(labels["--c-bg-scrub"], "Scrub Bar Background");
  assert.equal(labels["--c-bg-detect"], "Detection/Motion");
  assert.equal(THEME_DEFAULTS["--c-bg-detect"], "var(--warning-color)");
});

test("custom theme mode scope uses a touch-safe three-way bubble", () => {
  ["light", "dark", "both"].forEach((scope) => {
    assert.match(editorSource, new RegExp(`value: "${scope}"`));
  });
  assert.match(editorSource, /data-theme-scope="\$\{value\}"/);
  assert.match(editorSource, /class="theme-scope-seg" role="radiogroup"/);
  assert.doesNotMatch(editorSource, /Custom Color Overrides/);
  assert.match(
    editorSource,
    /<ha-icon icon="\$\{icon\}"><\/ha-icon><span>\$\{label\}<\/span>/,
  );
  assert.match(
    editorSource,
    /\.theme-scope-opt\{[^}]*touch-action:manipulation/,
  );
  assert.match(
    editorSource,
    /@media \(hover:hover\)\{\.theme-scope-opt:not\(\.active\):hover/,
  );
});

test("editor documents the camera token for title and subtitle", () => {
  assert.match(
    editorSource,
    /Use <code>\{camera\}<\/code> in either field to show the active camera name\./,
  );
  assert.match(editorSource, /In Grid mode it displays <strong>Grid<\/strong>\./);
});

test("editor YAML config omits normalized default values", () => {
  const config = compactEditorConfigForYaml({
    cameras: [
      {
        entity: "camera.front_door",
        name: "Front Door",
        connection_type: "frigate_go2rtc",
        alerts_content: "alerts_only",
      },
    ],
    title: "FrigateView",
    subtitle: "{Camera}",
    display_title: true,
    display_subtitle: true,
    display_logo: true,
    theme: "default",
    shadows: true,
    window_days: 3,
    alerts_reviews_days: 3,
    realtime_poll_seconds: 5,
    mobile_poll_battery_saver: false,
    event_pre_post_roll_enabled: false,
    favorites_mixed_cameras: true,
    snapshot_update_seconds: 60,
    slideshow_rotation_enabled: false,
    slideshow_rotation_seconds: 30,
    grid_mode_enabled: false,
    grid_start_in_grid_enabled: false,
    grid_live_view_enabled: true,
    grid_alert_hold_seconds: 10,
    landing_page_enabled: false,
    landing_page_live_cameras: false,
    landing_page_show_title_bars: true,
    grid_rotation_seconds: 30,
    slideshow_alert_hold_seconds: 10,
    window_hours: 72,
    stream_height: 100,
    stream_height_unit: "%",
    tight_margins: false,
    rounded_corners: true,
    outer_shadows: true,
    outer_rounded_corners: true,
    wide_view: false,
    col_left_width_pct: 60,
    preview_page_alert_live_duration_seconds: 10,
    wide_view_live_cameras: false,
    wide_view_alert_takeover: false,
    hidden_tabs: ["snapshot"],
  });

  assert.deepEqual(config, {
    cameras: [{ entity: "camera.front_door", name: "Front Door" }],
  });
});

test("a fully normalized default config saves no redundant YAML options", () => {
  const normalized = normalizeCardConfig({
    cameras: [{ entity: "camera.front_door" }],
  });

  assert.deepEqual(compactEditorConfigForYaml(normalized), {
    cameras: [{ entity: "camera.front_door" }],
  });
});

test("Grid order defaults are omitted and custom order is serialized", () => {
  const cameras = [
    { entity: "camera.front" },
    { entity: "camera.back" },
    { entity: "camera.garage" },
  ];
  const defaultConfig = compactEditorConfigForYaml({
    cameras,
    grid_order: {
      mode: "default",
      included: ["camera.garage", "camera.front"],
      excluded: ["camera.back"],
    },
  });
  const customConfig = compactEditorConfigForYaml({
    cameras,
    grid_order: {
      mode: "custom",
      included: ["camera.garage", "camera.front"],
      excluded: ["camera.back"],
    },
  });

  assert.equal(defaultConfig.grid_order, undefined);
  assert.deepEqual(customConfig.grid_order, {
    mode: "custom",
    included: ["camera.garage", "camera.front"],
    excluded: ["camera.back"],
  });
});

test("Grid order participates in normalization and editor preview drafts", () => {
  const normalized = normalizeCardConfig({
    cameras: [
      {
        entity: "camera.main",
        group: { secondary_entity: "camera.secondary", layout: "stacked" },
      },
      { entity: "camera.driveway" },
    ],
    grid_order: {
      mode: "custom",
      included: ["camera.secondary", "camera.driveway"],
      excluded: ["camera.main"],
    },
  });
  const draft = createEditorPreviewDraft(normalized);

  assert.deepEqual(normalized.grid_order, {
    mode: "custom",
    included: ["camera.secondary", "camera.driveway"],
    excluded: ["camera.main"],
  });
  assert.deepEqual(draft.grid_order, normalized.grid_order);
  assert.notEqual(draft.grid_order, normalized.grid_order);
});

test("compact YAML preserves a non-default subtitle", () => {
  const config = compactEditorConfigForYaml({
    cameras: [{ entity: "camera.front_door" }],
    subtitle: "Frigate",
  });

  assert.equal(config.subtitle, "Frigate");
});

test("compact YAML omits the camera token only when it is the subtitle default", () => {
  const config = compactEditorConfigForYaml({
    cameras: [{ entity: "camera.front_door" }],
    title: "{camera}",
    subtitle: "{camera}",
  });

  assert.equal(config.title, "{camera}");
  assert.equal(config.subtitle, undefined);
});

test("title, subtitle, and footer logo defaults normalize and hidden states serialize", () => {
  const defaults = normalizeCardConfig({
    cameras: [{ entity: "camera.front_door" }],
  });
  const compact = compactEditorConfigForYaml({
    cameras: [{ entity: "camera.front_door" }],
    title: "FrigateView",
    subtitle: "{Camera}",
    display_title: false,
    display_subtitle: false,
    display_logo: false,
  });

  assert.equal(defaults.title, "FrigateView");
  assert.equal(defaults.subtitle, "{Camera}");
  assert.equal(defaults.display_title, true);
  assert.equal(defaults.display_subtitle, true);
  assert.equal(defaults.display_logo, true);
  assert.deepEqual(defaults.hidden_tabs, ["snapshot"]);
  assert.deepEqual(compact, {
    cameras: [{ entity: "camera.front_door" }],
    display_title: false,
    display_subtitle: false,
    display_logo: false,
  });
});

test("camera configuration supports up to twelve cameras", () => {
  const cameras = Array.from({ length: MAX_CAMERAS + 2 }, (_, index) => ({
    entity: `camera.camera_${index + 1}`,
  }));
  const normalized = normalizeCardConfig({ cameras });

  assert.equal(MAX_CAMERAS, 12);
  assert.equal(normalized.cameras.length, 12);
  assert.equal(normalized.cameras.at(-1).entity, "camera.camera_12");
});

test("camera groups serialize compactly and count both physical members", () => {
  const grouped = {
    entity: "camera.doorbell_main",
    name: "Doorbell",
    group: {
      secondary_entity: "camera.doorbell_package",
      layout: "stacked",
    },
  };
  const defaults = normalizeCardConfig({ cameras: [grouped] });
  const compact = compactEditorConfigForYaml({ cameras: [grouped] });

  assert.deepEqual(defaults.cameras[0].group, grouped.group);
  assert.deepEqual(compact.cameras[0].group, grouped.group);

  const overLimit = normalizeCardConfig({
    cameras: [
      grouped,
      ...Array.from({ length: 11 }, (_, index) => ({
        entity: `camera.extra_${index}`,
      })),
    ],
  });
  assert.equal(
    overLimit.cameras.reduce(
      (count, camera) => count + (camera.group ? 2 : 1),
      0,
    ),
    MAX_CAMERAS,
  );
});

test("explicitly enabling every browse tab survives YAML compaction", () => {
  const config = compactEditorConfigForYaml({
    cameras: [{ entity: "camera.front_door" }],
    hidden_tabs: [],
  });

  assert.deepEqual(config, {
    cameras: [{ entity: "camera.front_door" }],
    hidden_tabs: [],
  });
});

test("pre-roll and post-roll config defaults off and serializes when enabled", () => {
  const defaults = normalizeCardConfig({
    cameras: [{ entity: "camera.front_door" }],
  });
  const compact = compactEditorConfigForYaml({
    cameras: [{ entity: "camera.front_door" }],
    event_pre_post_roll_enabled: true,
  });

  assert.equal(defaults.event_pre_post_roll_enabled, false);
  assert.equal(compact.event_pre_post_roll_enabled, true);
});

test("Preview live view on mobile devices defaults off and serializes when enabled", () => {
  const defaults = normalizeCardConfig({
    cameras: [{ entity: "camera.front_door" }],
  });
  const compact = compactEditorConfigForYaml({
    cameras: [{ entity: "camera.front_door" }],
    preview_page_live_cameras_mobile: true,
  });

  assert.equal(defaults.preview_page_live_cameras_mobile, false);
  assert.equal(compact.preview_page_live_cameras_mobile, true);
  assert.match(editorSource, /Live View on Mobile Devices/);
  assert.match(editorSource, /id="preview_page_live_cameras_mobile"/);
});

test("favorites default to a mixed-camera tab and serialize only when disabled", () => {
  const defaults = normalizeCardConfig({
    cameras: [{ entity: "camera.front_door" }],
  });
  const defaultYaml = compactEditorConfigForYaml({
    cameras: [{ entity: "camera.front_door" }],
    favorites_mixed_cameras: true,
  });
  const activeCameraOnlyYaml = compactEditorConfigForYaml({
    cameras: [{ entity: "camera.front_door" }],
    favorites_mixed_cameras: false,
  });

  assert.equal(defaults.favorites_mixed_cameras, true);
  assert.equal("favorites_mixed_cameras" in defaultYaml, false);
  assert.equal(activeCameraOnlyYaml.favorites_mixed_cameras, false);
});

test("card layout controls normalize to hardened ranges and defaults", () => {
  assert.equal(normalizeCardHeight(), 100);
  assert.equal(normalizeCardHeight(null), 100);
  assert.equal(normalizeCardHeight(25), 50);
  assert.equal(normalizeCardHeight(125), 100);
  assert.equal(normalizeCardHeightUnit(), "%");
  assert.equal(normalizeCardHeightUnit("em"), "%");
  assert.equal(normalizeCardHeightUnit("px"), "%");
  assert.equal(normalizeCardHeightUnit("vh"), "dvh");
  assert.equal(normalizeCardHeightUnit("dvh"), "dvh");
  assert.equal(normalizeWideLeftWidth(), 60);
  assert.equal(normalizeWideLeftWidth(null), 60);
  assert.equal(normalizeWideLeftWidth(10), 25);
  assert.equal(normalizeWideLeftWidth(90), 75);
});

test("compact YAML omits new layout defaults and preserves non-defaults", () => {
  const defaults = compactEditorConfigForYaml({
    cameras: [{ entity: "camera.front_door" }],
    stream_height: 100,
    stream_height_unit: "%",
    col_left_width_pct: 60,
  });
  const customized = compactEditorConfigForYaml({
    cameras: [{ entity: "camera.front_door" }],
    stream_height: 80,
    stream_height_unit: "dvh",
    col_left_width_pct: 75,
  });

  assert.deepEqual(defaults, {
    cameras: [{ entity: "camera.front_door" }],
  });
  assert.equal(customized.stream_height, 80);
  assert.equal(customized.stream_height_unit, "dvh");
  assert.equal(customized.col_left_width_pct, 75);
});

test("camera connection type defaults to go2rtc and is omitted in compact YAML", () => {
  const config = compactEditorConfigForYaml({
    cameras: [
      {
        entity: "camera.driveway",
        connection_type: "invalid-value",
      },
    ],
  });

  assert.deepEqual(config, {
    cameras: [{ entity: "camera.driveway" }],
  });
});

test("camera connection type normalizes HA aliases to ha_direct", () => {
  const config = compactEditorConfigForYaml({
    cameras: [
      {
        entity: "camera.garage",
        connection_type: "home_assistant",
      },
    ],
  });

  assert.deepEqual(config, {
    cameras: [
      {
        entity: "camera.garage",
        connection_type: "ha_direct",
      },
    ],
  });
});

test("compact YAML discards legacy per-camera PTZ motion tuning", () => {
  const config = compactEditorConfigForYaml({
    cameras: [
      {
        entity: "camera.driveway",
        ptz: {
          enabled: true,
          move_mode: "RelativeMove",
          speed: 0.4,
          distance: 0.2,
          continuous_duration: 0.8,
        },
      },
    ],
  });

  assert.deepEqual(config, {
    cameras: [
      {
        entity: "camera.driveway",
        ptz: {
          enabled: true,
        },
      },
    ],
  });
});

test("compact YAML omits the default PTZ speed and internal values", () => {
  const config = compactEditorConfigForYaml({
    cameras: [
      {
        entity: "camera.front_door",
        ptz: {
          enabled: true,
          move_mode: "RelativeMove",
          speed: 0.5,
          distance: 0.25,
          continuous_duration: 0.75,
        },
      },
    ],
  });

  assert.deepEqual(config, {
    cameras: [
      {
        entity: "camera.front_door",
        ptz: {
          enabled: true,
        },
      },
    ],
  });
});

test("compact YAML preserves boolean PTZ enablement", () => {
  const config = compactEditorConfigForYaml({
    cameras: [{ entity: "camera.front_door", ptz: true }],
  });

  assert.deepEqual(config, {
    cameras: [
      {
        entity: "camera.front_door",
        ptz: { enabled: true },
      },
    ],
  });
});

test("per-camera PTZ control rotation survives normalization and compact YAML", () => {
  const normalized = normalizeCardConfig({
    cameras: [
      {
        entity: "camera.front_door",
        ptz: { enabled: true, rotation: "90" },
      },
      {
        entity: "camera.driveway",
        ptz: { enabled: true, rotation: 45 },
      },
    ],
  });
  const compact = compactEditorConfigForYaml(normalized);

  assert.deepEqual(normalized.cameras[0].ptz, {
    enabled: true,
    rotation: 90,
  });
  assert.deepEqual(compact.cameras[0].ptz, {
    enabled: true,
    rotation: 90,
  });
  assert.deepEqual(compact.cameras[1].ptz, { enabled: true });
});

test("compact YAML preserves per-camera two-way talk when enabled", () => {
  const config = compactEditorConfigForYaml({
    cameras: [
      {
        entity: "camera.front_door",
        two_way_talk: true,
      },
    ],
  });

  assert.deepEqual(config, {
    cameras: [
      {
        entity: "camera.front_door",
        two_way_talk: true,
      },
    ],
  });
});

test("custom theme YAML stores one override array with selected modes", () => {
  const config = compactEditorConfigForYaml({
    cameras: [{ entity: "camera.front_door" }],
    theme: "custom",
    theme_custom: [
      {
        modes: ["light", "dark"],
        overrides: {
          "--c-bg-main": "#112233",
          "--unknown-theme-color": "#abcdef",
        },
      },
    ],
  });

  assert.deepEqual(config, {
    cameras: [{ entity: "camera.front_door" }],
    theme: "custom",
    theme_custom: [
      {
        modes: ["light", "dark"],
        overrides: { "--c-bg-main": "#112233" },
      },
    ],
  });
});

test("custom background theme colors survive config and YAML mapping", () => {
  const source = {
    cameras: [{ entity: "camera.front_door" }],
    theme: "custom",
    theme_custom: [
      {
        modes: ["dark"],
        overrides: {
          "--c-bg-primary": "#123456",
          "--c-bg-tabs-holder": "#234567",
          "--c-bg-mobile": "#654321",
          "--c-bg-mobile-list": "#345678",
          "--c-bg-list": "#456789",
          "--c-bg-cam-btn": "#56789a",
          "--c-bg-detect": "#fedcba",
          "--unknown-theme-color": "#abcdef",
        },
      },
    ],
  };

  const normalized = normalizeCardConfig(source);
  const expectedThemeCustom = [
    {
      modes: ["dark"],
      overrides: {
        "--c-bg-primary": "#123456",
        "--c-bg-tabs-holder": "#234567",
        "--c-bg-mobile": "#654321",
        "--c-bg-mobile-list": "#345678",
        "--c-bg-list": "#456789",
        "--c-bg-cam-btn": "#56789a",
        "--c-bg-detect": "#fedcba",
      },
    },
  ];
  assert.deepEqual(normalized.theme_custom, expectedThemeCustom);
  assert.deepEqual(
    createEditorPreviewDraft(normalized).theme_custom,
    expectedThemeCustom,
  );

  assert.deepEqual(
    compactEditorConfigForYaml(source),
    {
      cameras: [{ entity: "camera.front_door" }],
      theme: "custom",
      theme_custom: [
        {
          modes: ["dark"],
          overrides: {
            "--c-bg-primary": "#123456",
            "--c-bg-tabs-holder": "#234567",
            "--c-bg-mobile": "#654321",
            "--c-bg-mobile-list": "#345678",
            "--c-bg-list": "#456789",
            "--c-bg-cam-btn": "#56789a",
            "--c-bg-detect": "#fedcba",
          },
        },
      ],
    },
  );
});

test("buildEditorConfigFromDom changes theme scope without changing colors", () => {
  const customThemeButton = {
    dataset: { themeOption: "custom" },
  };
  const bothScopeButton = {
    dataset: { themeScope: "both" },
  };
  const accentInput = {
    dataset: { themeColor: "--c-accent" },
    value: "#334455",
  };
  const accentDefault = {
    checked: false,
    getAttribute: () => null,
    shadowRoot: null,
  };
  const root = {
    querySelector: (selector) => {
      if (selector === "[data-theme-option].active") {
        return customThemeButton;
      }
      if (selector === "[data-theme-scope].active") {
        return bothScopeButton;
      }
      if (selector === '[data-theme-default="--c-accent"]') {
        return accentDefault;
      }
      return null;
    },
    querySelectorAll: (selector) => {
      if (selector === "[data-theme-color]") return [accentInput];
      return [];
    },
  };
  const themeDraftCache = {
    light: {},
    dark: { "--c-accent": "#222222" },
  };

  const result = buildEditorConfigFromDom({
    root,
    baseConfig: {
      theme: "custom",
      theme_custom: [
        {
          modes: ["dark"],
          overrides: {
            "--c-text": "#111111",
            "--c-accent": "#222222",
          },
        },
      ],
    },
    cameras: [{ entity: "camera.front_door" }],
    themeDraftCache,
    themeMode: "dark",
  });

  assert.deepEqual(result.theme_custom, [
    {
      modes: ["light", "dark"],
      overrides: {
        "--c-text": "#111111",
        "--c-accent": "#334455",
      },
    },
  ]);
  assert.deepEqual(result.theme_custom_defaults, {
    light: {},
    dark: {},
  });
});

test("a new custom theme defaults its scope to the active HA mode", () => {
  const root = {
    querySelector: (selector) =>
      selector === "[data-theme-option].active"
        ? { dataset: { themeOption: "custom" } }
        : null,
    querySelectorAll: () => [],
  };

  const result = buildEditorConfigFromDom({
    root,
    baseConfig: { theme: "custom" },
    cameras: [],
    themeDraftCache: { light: {}, dark: {} },
    themeMode: "dark",
  });

  assert.deepEqual(result.theme_custom, [
    { modes: ["dark"], overrides: {} },
  ]);
});

test("theme scope buttons preserve picker drafts and release touch focus", () => {
  const listeners = {};
  const makeButton = (scope) => ({
    dataset: { themeScope: scope },
    active: scope === "light",
    blurred: 0,
    classList: {
      toggle: (_name, active) => {
        buttons.find((button) => button.dataset.themeScope === scope).active =
          active;
      },
    },
    setAttribute: () => {},
    addEventListener: (name, handler) => {
      listeners[`${scope}:${name}`] = handler;
    },
    blur() {
      this.blurred += 1;
    },
  });
  const buttons = [makeButton("light"), makeButton("dark"), makeButton("both")];
  const root = {
    querySelectorAll: (selector) =>
      selector === "[data-theme-scope]" ? buttons : [],
  };
  const themeDraftCache = {
    light: { "--c-accent": "#334455" },
    dark: { "--c-accent": "#334455" },
  };
  let updates = 0;

  bindThemeControlEvents({
    root,
    update: () => {
      updates += 1;
    },
    themeDraftCache,
    resolveDefaultHex: () => "#000000",
    themeMode: "light",
  });
  listeners["both:click"]({
    preventDefault: () => {},
    stopPropagation: () => {},
    currentTarget: buttons[2],
  });

  assert.equal(buttons[0].active, false);
  assert.equal(buttons[2].active, true);
  assert.equal(buttons[2].blurred, 1);
  assert.equal(updates, 1);
  assert.deepEqual(themeDraftCache, {
    light: { "--c-accent": "#334455" },
    dark: { "--c-accent": "#334455" },
  });
});

test("theme reset preserves the enabled picker and visible reset control", () => {
  const listeners = {};
  const input = {
    disabled: false,
    value: "#334455",
  };
  const reset = {
    dataset: { themeReset: "--c-accent" },
    hidden: false,
    addEventListener: (name, handler) => {
      listeners[name] = handler;
    },
  };
  const root = {
    querySelector: (selector) =>
      selector === '[data-theme-color="--c-accent"]' ? input : null,
    querySelectorAll: (selector) =>
      selector === "[data-theme-reset]" ? [reset] : [],
  };
  const themeDraftCache = { light: {}, dark: {} };
  let updates = 0;

  bindThemeControlEvents({
    root,
    update: () => {
      updates += 1;
    },
    themeDraftCache,
    resolveDefaultHex: () => "#abcdef",
    themeMode: "light",
  });
  listeners.click({
    preventDefault: () => {},
    stopPropagation: () => {},
    currentTarget: reset,
  });

  assert.equal(input.value, "#abcdef");
  assert.equal(input.disabled, false);
  assert.equal(reset.hidden, false);
  assert.equal(themeDraftCache.light["--c-accent"], "#abcdef");
  assert.equal(updates, 1);
});

test("Use Default temporarily previews the default and restores the draft", () => {
  const listeners = {};
  const input = {
    disabled: false,
    value: "#334455",
  };
  const reset = { hidden: false };
  const toggle = {
    checked: false,
    dataset: { themeDefault: "--c-accent" },
    addEventListener: (name, handler) => {
      listeners[name] = handler;
    },
  };
  const root = {
    querySelector: (selector) => {
      if (selector === '[data-theme-color="--c-accent"]') return input;
      if (selector === '[data-theme-reset="--c-accent"]') return reset;
      return null;
    },
    querySelectorAll: (selector) =>
      selector === "[data-theme-default]" ? [toggle] : [],
  };
  const themeDraftCache = {
    light: { "--c-accent": "#334455" },
    dark: {},
  };

  bindThemeControlEvents({
    root,
    update: () => {},
    themeDraftCache,
    resolveDefaultHex: () => "#abcdef",
    themeMode: "light",
  });

  toggle.checked = true;
  listeners.change({ currentTarget: toggle });
  assert.equal(input.value, "#abcdef");
  assert.equal(input.disabled, true);
  assert.equal(reset.hidden, true);
  assert.equal(themeDraftCache.light["--c-accent"], "#334455");

  toggle.checked = false;
  listeners.change({ currentTarget: toggle });
  assert.equal(input.value, "#334455");
  assert.equal(input.disabled, false);
  assert.equal(reset.hidden, false);
});

test("custom theme defaults are omitted from the shared override array", () => {
  const compact = compactEditorConfigForYaml({
    cameras: [{ entity: "camera.front_door" }],
    theme: "custom",
    theme_custom: [
      {
        modes: ["light", "dark"],
        overrides: { "--c-accent": "#111111" },
      },
    ],
    theme_custom_defaults: {
      light: { "--c-accent": true },
      dark: { "--c-accent": true },
    },
  });

  assert.deepEqual(compact, {
    cameras: [{ entity: "camera.front_door" }],
    theme: "custom",
    theme_custom: [
      { modes: ["light", "dark"], overrides: {} },
    ],
  });
});

test("legacy custom theme maps are not migrated into the array schema", () => {
  const normalized = normalizeCardConfig({
    theme: "custom",
    theme_custom: { light: { "--c-bg-main": "#112233" } },
  });

  assert.deepEqual(normalized.theme_custom, []);
});

test("editor YAML payload always includes custom card type", () => {
  const compact = compactEditorConfigForYaml({
    cameras: [{ entity: "camera.front_door" }],
    title: "Frigate",
  });

  const withType = withCardTypeForYaml(compact);

  assert.deepEqual(withType, {
    type: "custom:frigate-view-card",
    cameras: [{ entity: "camera.front_door" }],
    title: "Frigate",
  });
});

test("editor YAML payload preserves HA grid and visibility metadata", () => {
  const compact = compactEditorConfigForYaml({
    cameras: [{ entity: "camera.front_door" }],
  });

  const withType = withCardTypeForYaml(compact, {
    sourceConfig: {
      grid_options: { rows: "auto", columns: "full" },
      visibility: [{ condition: "user", users: ["user-id"] }],
    },
  });

  assert.deepEqual(withType, {
    type: "custom:frigate-view-card",
    cameras: [{ entity: "camera.front_door" }],
    grid_options: { rows: "auto", columns: "full" },
    visibility: [{ condition: "user", users: ["user-id"] }],
  });
});

test("buildEditorConfigFromDom prefers hiddenTabsOverride for hidden tabs", () => {
  const root = {
    querySelector: () => null,
    querySelectorAll: () => [],
  };

  const result = buildEditorConfigFromDom({
    root,
    baseConfig: {},
    cameras: [{ entity: "camera.front_door" }],
    themeDraftCache: {},
    hiddenTabsOverride: ["clips", "reviews", "invalid-tab"],
  });

  assert.deepEqual(result.hidden_tabs, ["clips", "alerts"]);
});

test("buildEditorConfigFromDom reads the pre-roll and post-roll switch", () => {
  const enabledSwitch = {
    checked: true,
    getAttribute: () => "",
    shadowRoot: null,
  };
  const root = {
    querySelector: (selector) =>
      selector === "#event_pre_post_roll_enabled" ? enabledSwitch : null,
    querySelectorAll: () => [],
  };

  const result = buildEditorConfigFromDom({
    root,
    baseConfig: {},
    cameras: [{ entity: "camera.front_door" }],
    themeDraftCache: {},
  });

  assert.equal(result.event_pre_post_roll_enabled, true);
});

test("buildEditorConfigFromDom reads the mixed favorites switch", () => {
  const mixedFavoritesSwitch = {
    checked: false,
    getAttribute: () => null,
    shadowRoot: null,
  };
  const root = {
    querySelector: (selector) =>
      selector === "#favorites_mixed_cameras"
        ? mixedFavoritesSwitch
        : null,
    querySelectorAll: () => [],
  };

  const result = buildEditorConfigFromDom({
    root,
    baseConfig: { favorites_mixed_cameras: true },
    cameras: [{ entity: "camera.front_door" }],
    themeDraftCache: {},
  });

  assert.equal(result.favorites_mixed_cameras, false);
});

test("buildEditorConfigFromDom reads title and subtitle display checkboxes", () => {
  const root = {
    querySelector: (selector) => {
      if (selector === "#display_title") return { checked: false };
      if (selector === "#display_subtitle") return { checked: true };
      if (selector === "#display_logo") return { checked: false };
      return null;
    },
    querySelectorAll: () => [],
  };

  const result = buildEditorConfigFromDom({
    root,
    baseConfig: {},
    cameras: [{ entity: "camera.front_door" }],
    themeDraftCache: {},
  });

  assert.equal(result.display_title, false);
  assert.equal(result.display_subtitle, true);
  assert.equal(result.display_logo, false);
});

test("compact YAML keeps normalized hidden tabs when non-default", () => {
  const config = compactEditorConfigForYaml({
    cameras: [{ entity: "camera.front_door" }],
    hidden_tabs: ["recordings", "reviews", "invalid-tab"],
  });

  assert.deepEqual(config, {
    cameras: [{ entity: "camera.front_door" }],
    hidden_tabs: ["recordings", "alerts"],
  });
});

test("preview draft carries hidden tabs and page routes", () => {
  const draft = createEditorPreviewDraft({
    cameras: [{ entity: "camera.front_door" }],
    mobile_view_page_enabled: true,
    mobile_view_rotate_to_fullscreen: false,
    mobile_view_outer_border: true,
    mobile_view_ha_navbar_bottom: true,
    mobile_view_ha_navbar_stack_tabs: true,
    mobile_view_ha_navbar_dashboard: true,
    ha_dashboard_swipe_navigation_owner: true,
    ha_dashboard_swipe_navigation:
      DASHBOARD_SWIPE_NAVIGATION_MODES.insideCard,
    ha_dashboard_swipe_include_other_cards: true,
    ha_dashboard_swipe_include_subviews: true,
    ha_dashboard_swipe_mouse_enabled: true,
    ha_dashboard_swipe_pages: [
      PAGE_IDS.preview,
      PAGE_IDS.singleView,
      PAGE_IDS.wideView,
    ],
    preview_page_enabled: true,
    wide_view_page_enabled: true,
    hidden_tabs: ["clips", "snapshots"],
    landing_page: "preview",
    mobile_page: "single",
    snapshot_update_seconds: 75,
    event_pre_post_roll_enabled: true,
    favorites_mixed_cameras: false,
    preview_page_live_cameras_mobile: true,
    preview_page_alert_live_duration_seconds: 12,
    slideshow_alert_hold_seconds: 14,
    grid_alert_hold_seconds: 16,
    wide_view_live_cameras: true,
    wide_view_alert_takeover: true,
    wide_view_timeline_enabled: true,
    wide_view_timeline_default_open: true,
    wide_view_timeline_default_scale: 24,
    display_title: false,
    display_subtitle: true,
    display_logo: false,
  });

  assert.equal(draft.mobile_view_page_enabled, true);
  assert.equal(draft.mobile_view_rotate_to_fullscreen, false);
  assert.equal(draft.mobile_view_outer_border, true);
  assert.equal(draft.mobile_view_ha_navbar_bottom, true);
  assert.equal(draft.mobile_view_ha_navbar_stack_tabs, true);
  assert.equal(draft.mobile_view_ha_navbar_dashboard, true);
  assert.equal(draft.ha_dashboard_swipe_navigation_owner, true);
  assert.equal(
    draft.ha_dashboard_swipe_navigation,
    DASHBOARD_SWIPE_NAVIGATION_MODES.insideCard,
  );
  assert.equal(draft.ha_dashboard_swipe_include_other_cards, true);
  assert.equal(draft.ha_dashboard_swipe_include_subviews, true);
  assert.equal(draft.ha_dashboard_swipe_mouse_enabled, true);
  assert.deepEqual(draft.ha_dashboard_swipe_pages, [
    PAGE_IDS.preview,
    PAGE_IDS.singleView,
    PAGE_IDS.wideView,
  ]);
  assert.deepEqual(draft.hidden_tabs, ["clips", "snapshots"]);
  assert.equal(draft.landing_page, "preview");
  assert.equal(draft.mobile_page, "single");
  assert.equal(draft.snapshot_update_seconds, 75);
  assert.equal(draft.event_pre_post_roll_enabled, true);
  assert.equal(draft.favorites_mixed_cameras, false);
  assert.equal(draft.preview_page_live_cameras_mobile, true);
  assert.equal(draft.preview_page_alert_live_duration_seconds, 12);
  assert.equal(draft.slideshow_alert_hold_seconds, 14);
  assert.equal(draft.grid_alert_hold_seconds, 16);
  assert.equal(draft.wide_view_live_cameras, true);
  assert.equal(draft.wide_view_alert_takeover, true);
  assert.equal(draft.wide_view_timeline_enabled, true);
  assert.equal(draft.wide_view_timeline_default_open, true);
  assert.equal(draft.wide_view_timeline_default_scale, 24);
  assert.equal(draft.display_title, false);
  assert.equal(draft.display_subtitle, true);
  assert.equal(draft.display_logo, false);

  const previewConfig = applyEditorPreviewDraftToCardConfig({
    baseConfig: {},
    previewConfig: draft,
  });
  assert.equal(previewConfig.mobile_view_ha_navbar_bottom, true);
  assert.equal(previewConfig.mobile_view_ha_navbar_stack_tabs, true);
  assert.equal(previewConfig.mobile_view_ha_navbar_dashboard, true);
  assert.equal(previewConfig.ha_dashboard_swipe_navigation_owner, true);
  assert.equal(
    previewConfig.ha_dashboard_swipe_navigation,
    DASHBOARD_SWIPE_NAVIGATION_MODES.insideCard,
  );
  assert.equal(previewConfig.ha_dashboard_swipe_include_other_cards, true);
  assert.equal(previewConfig.ha_dashboard_swipe_include_subviews, true);
  assert.equal(previewConfig.ha_dashboard_swipe_mouse_enabled, true);
  assert.deepEqual(previewConfig.ha_dashboard_swipe_pages, [
    PAGE_IDS.preview,
    PAGE_IDS.singleView,
    PAGE_IDS.wideView,
  ]);
});

test("visual editor previews change styling without applying content drafts", () => {
  const previewConfig = applyEditorVisualPreviewDraftToCardConfig({
    baseConfig: {
      title: "Saved title",
      realtime_poll_seconds: 5,
      theme: "default",
      rounded_corners: true,
    },
    previewConfig: {
      title: "Unsaved title",
      realtime_poll_seconds: 60,
      theme: "custom",
      theme_custom: { light: { "--c-primary": "#112233" } },
      theme_custom_defaults: { light: {} },
      rounded_corners: false,
      stream_height: 80,
      stream_height_unit: "px",
      col_left_width_pct: 62,
    },
  });

  assert.equal(previewConfig.title, "Saved title");
  assert.equal(previewConfig.realtime_poll_seconds, 5);
  assert.equal(previewConfig.theme, "custom");
  assert.equal(previewConfig.rounded_corners, false);
  assert.equal(previewConfig.stream_height, 80);
  assert.equal(previewConfig.col_left_width_pct, 62);
});

test("compact YAML defaults duration values that are not chip choices", () => {
  const source = {
    cameras: [{ entity: "camera.front_door" }],
    snapshot_update_seconds: 90,
    preview_page_alert_live_duration_seconds: 18,
    slideshow_alert_hold_seconds: 22,
    grid_alert_hold_seconds: 26,
  };
  const normalized = normalizeCardConfig(source);
  const config = compactEditorConfigForYaml(source);

  assert.equal(normalized.snapshot_update_seconds, 60);
  assert.equal(normalized.preview_page_alert_live_duration_seconds, 10);
  assert.equal(normalized.slideshow_alert_hold_seconds, 10);
  assert.equal(normalized.grid_alert_hold_seconds, 10);
  assert.deepEqual(config, {
    cameras: [{ entity: "camera.front_door" }],
  });
});

test("compact YAML preserves Wide View Companion Camera settings", () => {
  const config = compactEditorConfigForYaml({
    cameras: [{ entity: "camera.front_door" }],
    wide_view_page_enabled: true,
    wide_view_live_cameras: true,
    wide_view_alert_takeover: true,
  });

  assert.deepEqual(config, {
    cameras: [{ entity: "camera.front_door" }],
    wide_view_page_enabled: true,
    wide_view_live_cameras: true,
    wide_view_alert_takeover: true,
  });
});

test("Wide View Timeline settings default off and serialize when enabled", () => {
  const defaults = normalizeCardConfig({
    cameras: [{ entity: "camera.front_door" }],
  });
  const defaultYaml = compactEditorConfigForYaml({
    cameras: [{ entity: "camera.front_door" }],
    wide_view_timeline_enabled: false,
    wide_view_timeline_default_open: false,
    wide_view_timeline_default_scale: 12,
  });
  const configuredYaml = compactEditorConfigForYaml({
    cameras: [{ entity: "camera.front_door" }],
    wide_view_timeline_enabled: true,
    wide_view_timeline_default_open: true,
    wide_view_timeline_default_scale: 6,
  });

  assert.equal(defaults.wide_view_timeline_enabled, false);
  assert.equal(defaults.wide_view_timeline_default_open, false);
  assert.equal(defaults.wide_view_timeline_default_scale, 12);
  assert.deepEqual(defaultYaml, {
    cameras: [{ entity: "camera.front_door" }],
  });
  assert.deepEqual(configuredYaml, {
    cameras: [{ entity: "camera.front_door" }],
    wide_view_timeline_enabled: true,
    wide_view_timeline_default_open: true,
    wide_view_timeline_default_scale: 6,
  });
});

test("Timeline time range editor uses radio inputs", () => {
  assert.match(
    editorSource,
    /name: "wide_view_timeline_default_scale"/,
  );
  assert.doesNotMatch(
    editorSource,
    /<ha-selector id="wide_view_timeline_default_scale"/,
  );

  const selected = { value: "24" };
  const root = {
    querySelector: (selector) =>
      selector ===
      '[name="wide_view_timeline_default_scale"]:checked'
        ? selected
        : null,
    querySelectorAll: () => [],
  };
  const result = buildEditorConfigFromDom({
    root,
    baseConfig: {},
    cameras: [{ entity: "camera.front_door" }],
    themeDraftCache: {},
  });

  assert.equal(result.wide_view_timeline_default_scale, 24);
});

test("choice-chip config fields read their checked native radio values", () => {
  const selectedValues = new Map([
    ['[name="realtime_poll_seconds"]:checked', "15"],
    ['[name="snapshot_update_seconds"]:checked', "300"],
    ['[name="slideshow_rotation_seconds"]:checked', "60"],
    ['[name="slideshow_alert_hold_seconds"]:checked', "120"],
    ['[name="grid_rotation_seconds"]:checked', "60"],
    ['[name="grid_alert_hold_seconds"]:checked', "60"],
    [
      '[name="preview_page_alert_live_duration_seconds"]:checked',
      "120",
    ],
    ['[name="wide_view_timeline_default_scale"]:checked', "24"],
    ['[name="stream_height_unit"]:checked', "dvh"],
  ]);
  const root = {
    querySelector: (selector) => {
      if (selectedValues.has(selector)) {
        return { value: selectedValues.get(selector) };
      }
      if (selector === "#stream_height") return { value: "80" };
      return null;
    },
    querySelectorAll: () => [],
  };

  const result = buildEditorConfigFromDom({
    root,
    baseConfig: {},
    cameras: [{ entity: "camera.front_door" }],
    themeDraftCache: {},
  });

  assert.equal(result.realtime_poll_seconds, 15);
  assert.equal(result.snapshot_update_seconds, 300);
  assert.equal(result.slideshow_rotation_seconds, 60);
  assert.equal(result.slideshow_alert_hold_seconds, 120);
  assert.equal(result.grid_rotation_seconds, 60);
  assert.equal(result.grid_alert_hold_seconds, 60);
  assert.equal(result.preview_page_alert_live_duration_seconds, 120);
  assert.equal(result.wide_view_timeline_default_scale, 24);
  assert.equal(result.stream_height, 80);
  assert.equal(result.stream_height_unit, "dvh");
});

test("new duration chip choices normalize and remain compact YAML values", () => {
  assert.deepEqual(SNAPSHOT_UPDATE_OPTIONS_SECONDS, [10, 20, 30, 60, 120, 300]);
  assert.deepEqual(SLIDESHOW_ALERT_HOLD_OPTIONS_SECONDS, [10, 20, 30, 60, 120]);
  assert.deepEqual(GRID_ALERT_HOLD_OPTIONS_SECONDS, [10, 20, 30, 60]);
  assert.deepEqual(PREVIEW_ALERT_LIVE_DURATION_OPTIONS_SECONDS, [5, 10, 20, 30, 60, 120]);

  const normalized = normalizeCardConfig({
    cameras: [{ entity: "camera.front_door" }],
    snapshot_update_seconds: 300,
    slideshow_alert_hold_seconds: 120,
    grid_alert_hold_seconds: 60,
    preview_page_alert_live_duration_seconds: 120,
  });
  const compact = compactEditorConfigForYaml(normalized);

  assert.equal(normalized.snapshot_update_seconds, 300);
  assert.equal(normalized.slideshow_alert_hold_seconds, 120);
  assert.equal(normalized.grid_alert_hold_seconds, 60);
  assert.equal(normalized.preview_page_alert_live_duration_seconds, 120);
  assert.equal(compact.snapshot_update_seconds, 300);
  assert.equal(compact.slideshow_alert_hold_seconds, 120);
  assert.equal(compact.grid_alert_hold_seconds, 60);
  assert.equal(compact.preview_page_alert_live_duration_seconds, 120);
});

test("Card View settings normalize and serialize only when enabled", () => {
  const defaults = normalizeCardConfig({
    cameras: [{ entity: "camera.front_door" }],
  });
  const config = compactEditorConfigForYaml({
    cameras: [{ entity: "camera.front_door" }],
    card_view_page_enabled: true,
    card_view_alert_takeover: true,
    card_view_drawer_default_open: false,
    landing_page: "card-view",
  });

  assert.equal(defaults.card_view_page_enabled, false);
  assert.equal(defaults.card_view_alert_takeover, false);
  assert.equal(defaults.card_view_drawer_default_open, true);
  assert.equal(defaults.card_view_standalone, false);
  assert.deepEqual(config, {
    cameras: [{ entity: "camera.front_door" }],
    card_view_page_enabled: true,
    card_view_alert_takeover: true,
    card_view_drawer_default_open: false,
    landing_page: "card-view",
  });
  assert.equal(
    createEditorPreviewDraft(defaults).card_view_drawer_default_open,
    true,
  );
});

test("standalone Card View forces the desktop landing page and serializes explicitly", () => {
  const normalized = normalizeCardConfig({
    cameras: [{ entity: "camera.front_door" }],
    card_view_page_enabled: true,
    card_view_standalone: true,
    landing_page: "wide-view",
    mobile_page: "preview-single-view",
    preview_page_enabled: true,
  });
  const compact = compactEditorConfigForYaml(normalized);

  assert.equal(normalized.landing_page, "card-view");
  assert.equal(normalized.mobile_page, "preview-single-view");
  assert.equal(compact.card_view_standalone, true);
  assert.equal(compact.landing_page, "card-view");

  const disabled = normalizeCardConfig({
    cameras: [{ entity: "camera.front_door" }],
    card_view_standalone: true,
  });
  assert.equal(disabled.card_view_standalone, false);
  assert.equal(disabled.landing_page, "single-view");
});

test("Mobile View presentation settings omit defaults and preserve swipe mode", () => {
  const defaults = normalizeCardConfig({
    cameras: [{ entity: "camera.front_door" }],
  });
  const config = compactEditorConfigForYaml({
    cameras: [{ entity: "camera.front_door" }],
    mobile_view_page_enabled: true,
    mobile_view_outer_border: true,
    mobile_view_ha_navbar_bottom: true,
    mobile_view_ha_navbar_stack_tabs: true,
    mobile_view_ha_navbar_dashboard: true,
    ha_dashboard_swipe_navigation_owner: true,
    ha_dashboard_swipe_navigation:
      DASHBOARD_SWIPE_NAVIGATION_MODES.insideCard,
    ha_dashboard_swipe_include_other_cards: true,
    ha_dashboard_swipe_mouse_enabled: true,
  });

  assert.equal(defaults.mobile_view_outer_border, false);
  assert.equal(defaults.mobile_view_page_enabled, true);
  assert.equal(defaults.mobile_view_rotate_to_fullscreen, true);
  assert.equal(defaults.mobile_view_ha_navbar_bottom, false);
  assert.equal(defaults.mobile_view_ha_navbar_stack_tabs, false);
  assert.equal(defaults.mobile_view_ha_navbar_dashboard, false);
  assert.equal(defaults.ha_dashboard_swipe_navigation_owner, false);
  assert.equal(defaults.ha_dashboard_swipe_include_other_cards, false);
  assert.equal(defaults.ha_dashboard_swipe_include_subviews, false);
  assert.equal(defaults.ha_dashboard_swipe_mouse_enabled, false);
  assert.equal(
    defaults.ha_dashboard_swipe_navigation,
    DASHBOARD_SWIPE_NAVIGATION_MODES.dashboardWide,
  );
  assert.equal(
    Object.hasOwn(
      compactEditorConfigForYaml(defaults),
      "mobile_view_page_enabled",
    ),
    false,
  );
  assert.equal(
    Object.hasOwn(compactEditorConfigForYaml(defaults), "mobile_view_outer_border"),
    false,
  );
  assert.equal(
    Object.hasOwn(
      compactEditorConfigForYaml(defaults),
      "mobile_view_rotate_to_fullscreen",
    ),
    false,
  );
  assert.deepEqual(
    compactEditorConfigForYaml({
      cameras: [{ entity: "camera.front_door" }],
      mobile_view_page_enabled: false,
    }),
    {
      cameras: [{ entity: "camera.front_door" }],
      mobile_view_page_enabled: false,
    },
  );
  assert.deepEqual(
    compactEditorConfigForYaml({
      cameras: [{ entity: "camera.front_door" }],
      mobile_view_rotate_to_fullscreen: false,
    }),
    {
      cameras: [{ entity: "camera.front_door" }],
      mobile_view_rotate_to_fullscreen: false,
    },
  );
  assert.equal(
    Object.hasOwn(
      compactEditorConfigForYaml(defaults),
      "mobile_view_ha_navbar_bottom",
    ),
    false,
  );
  assert.equal(
    Object.hasOwn(
      compactEditorConfigForYaml(defaults),
      "mobile_view_ha_navbar_stack_tabs",
    ),
    false,
  );
  assert.equal(
    Object.hasOwn(
      compactEditorConfigForYaml(defaults),
      "mobile_view_ha_navbar_dashboard",
    ),
    false,
  );
  assert.equal(
    Object.hasOwn(
      compactEditorConfigForYaml(defaults),
      "ha_dashboard_swipe_navigation",
    ),
    false,
  );
  assert.deepEqual(config, {
    cameras: [{ entity: "camera.front_door" }],
    mobile_view_outer_border: true,
    mobile_view_ha_navbar_bottom: true,
    mobile_view_ha_navbar_stack_tabs: true,
    mobile_view_ha_navbar_dashboard: true,
    ha_dashboard_swipe_navigation_owner: true,
    ha_dashboard_swipe_navigation:
      DASHBOARD_SWIPE_NAVIGATION_MODES.insideCard,
    ha_dashboard_swipe_include_other_cards: true,
    ha_dashboard_swipe_mouse_enabled: true,
  });

  assert.deepEqual(
    compactEditorConfigForYaml({
      cameras: [{ entity: "camera.front_door" }],
      ha_dashboard_swipe_navigation_owner: true,
      ha_dashboard_swipe_navigation:
        DASHBOARD_SWIPE_NAVIGATION_MODES.none,
    }),
    {
      cameras: [{ entity: "camera.front_door" }],
      ha_dashboard_swipe_navigation_owner: true,
      ha_dashboard_swipe_navigation:
        DASHBOARD_SWIPE_NAVIGATION_MODES.none,
    },
  );

  assert.deepEqual(
    compactEditorConfigForYaml({
      cameras: [{ entity: "camera.front_door" }],
      ha_dashboard_swipe_navigation_owner: false,
      ha_dashboard_swipe_navigation:
        DASHBOARD_SWIPE_NAVIGATION_MODES.insideCard,
      ha_dashboard_swipe_include_other_cards: true,
    }),
    { cameras: [{ entity: "camera.front_door" }] },
  );

  assert.deepEqual(
    compactEditorConfigForYaml({
      cameras: [{ entity: "camera.front_door" }],
      ha_dashboard_swipe_navigation_owner: true,
      ha_dashboard_swipe_navigation:
        DASHBOARD_SWIPE_NAVIGATION_MODES.dashboardWide,
      ha_dashboard_swipe_include_subviews: true,
    }),
    {
      cameras: [{ entity: "camera.front_door" }],
      ha_dashboard_swipe_navigation_owner: true,
      ha_dashboard_swipe_include_subviews: true,
    },
  );

  assert.deepEqual(
    compactEditorConfigForYaml({
      cameras: [{ entity: "camera.front_door" }],
      ha_dashboard_swipe_navigation_owner: true,
      ha_dashboard_swipe_navigation:
        DASHBOARD_SWIPE_NAVIGATION_MODES.insideCard,
      ha_dashboard_swipe_include_subviews: true,
    }),
    {
      cameras: [{ entity: "camera.front_door" }],
      ha_dashboard_swipe_navigation_owner: true,
      ha_dashboard_swipe_navigation:
        DASHBOARD_SWIPE_NAVIGATION_MODES.insideCard,
    },
  );
});

test("desktop swipe pages default to Preview plus landing and save only custom selections", () => {
  const defaults = normalizeCardConfig({
    cameras: [{ entity: "camera.front_door" }],
    ha_dashboard_swipe_navigation_owner: true,
    preview_page_enabled: true,
    wide_view_page_enabled: true,
    landing_page: PAGE_IDS.wideView,
  });
  assert.deepEqual(defaults.ha_dashboard_swipe_pages, [
    PAGE_IDS.preview,
    PAGE_IDS.wideView,
  ]);
  assert.equal(
    Object.hasOwn(
      compactEditorConfigForYaml(defaults),
      "ha_dashboard_swipe_pages",
    ),
    false,
  );

  const custom = normalizeCardConfig({
    cameras: [{ entity: "camera.front_door" }],
    ha_dashboard_swipe_navigation_owner: true,
    ha_dashboard_swipe_navigation:
      DASHBOARD_SWIPE_NAVIGATION_MODES.insideCard,
    preview_page_enabled: true,
    wide_view_page_enabled: true,
    card_view_page_enabled: true,
    landing_page: PAGE_IDS.singleView,
    ha_dashboard_swipe_pages: [
      PAGE_IDS.preview,
      PAGE_IDS.wideView,
      PAGE_IDS.cardView,
      PAGE_IDS.mobileView,
    ],
  });
  assert.deepEqual(custom.ha_dashboard_swipe_pages, [
    PAGE_IDS.preview,
    PAGE_IDS.singleView,
    PAGE_IDS.mobileView,
    PAGE_IDS.wideView,
    PAGE_IDS.cardView,
  ]);
  assert.deepEqual(
    compactEditorConfigForYaml(custom).ha_dashboard_swipe_pages,
    [
      PAGE_IDS.preview,
      PAGE_IDS.singleView,
      PAGE_IDS.mobileView,
      PAGE_IDS.wideView,
      PAGE_IDS.cardView,
    ],
  );

  const previewExcluded = normalizeCardConfig({
    cameras: [{ entity: "camera.front_door" }],
    ha_dashboard_swipe_navigation_owner: true,
    preview_page_enabled: true,
    wide_view_page_enabled: true,
    landing_page: PAGE_IDS.singleView,
    ha_dashboard_swipe_pages: [PAGE_IDS.wideView],
  });
  assert.deepEqual(previewExcluded.ha_dashboard_swipe_pages, [
    PAGE_IDS.singleView,
    PAGE_IDS.wideView,
  ]);
  assert.deepEqual(
    compactEditorConfigForYaml(previewExcluded).ha_dashboard_swipe_pages,
    [PAGE_IDS.singleView, PAGE_IDS.wideView],
  );

  const renamedMode = normalizeCardConfig({
    cameras: [{ entity: "camera.front_door" }],
    ha_dashboard_swipe_navigation_owner: true,
    ha_dashboard_swipe_navigation: "preview-dashboard",
  });
  assert.equal(
    renamedMode.ha_dashboard_swipe_navigation,
    DASHBOARD_SWIPE_NAVIGATION_MODES.landingDashboard,
  );
  assert.equal(
    compactEditorConfigForYaml(renamedMode).ha_dashboard_swipe_navigation,
    DASHBOARD_SWIPE_NAVIGATION_MODES.landingDashboard,
  );
});

test("Mobile View HA navbar options are ordered and nested under their master toggle", () => {
  const masterIndex = editorSource.indexOf(
    'id="mobile_view_ha_navbar_bottom"',
  );
  const stackIndex = editorSource.indexOf(
    'id="mobile_view_ha_navbar_stack_tabs"',
  );
  const dashboardIndex = editorSource.indexOf(
    'id="mobile_view_ha_navbar_dashboard"',
  );

  assert.ok(masterIndex >= 0);
  assert.ok(masterIndex < stackIndex);
  assert.ok(stackIndex < dashboardIndex);
  assert.match(
    editorSource,
    /class="section ha-navbar-dependent-section" id="mobile-view-ha-navbar-stack-row" style="\$\{this\._config\?\.mobile_view_ha_navbar_bottom \? "" : "display:none"\}"/,
  );
  assert.match(
    editorSource,
    /class="section ha-navbar-dependent-section" id="mobile-view-ha-navbar-dashboard-row" style="\$\{this\._config\?\.mobile_view_ha_navbar_bottom \? "" : "display:none"\}"/,
  );
  assert.match(editorSource, /const syncHaNavbarDependentRows = \(\) =>/);
  assert.match(
    editorSource,
    /\.ha-navbar-dependent-section\{margin-inline-start:14px/,
  );
});

test("editor presents general, layout, and Mobile View controls in their requested sections", () => {
  const generalStart = editorSource.indexOf("const generalPanelContent");
  const generalEnd = editorSource.indexOf("const themePanelContent", generalStart);
  const layoutStart = editorSource.indexOf("const layoutPanelContent");
  const layoutEnd = editorSource.indexOf("const slideshowPanelContent", layoutStart);
  const mobileStart = editorSource.indexOf("const mobileViewPanelContent");
  const mobileEnd = editorSource.indexOf(
    "const swipeNavigationPanelContent",
    mobileStart,
  );
  const generalSource = editorSource.slice(generalStart, generalEnd);
  const layoutSource = editorSource.slice(layoutStart, layoutEnd);
  const mobileSource = editorSource.slice(mobileStart, mobileEnd);

  const daysIndex = generalSource.indexOf('id="alerts_reviews_days"');
  const prePostIndex = generalSource.indexOf(
    'id="event_pre_post_roll_enabled"',
  );
  const favoritesIndex = generalSource.indexOf('id="favorites_mixed_cameras"');
  assert.ok(daysIndex >= 0 && daysIndex < prePostIndex);
  assert.ok(prePostIndex < favoritesIndex);
  assert.doesNotMatch(generalSource, /id="display_logo"/);
  assert.doesNotMatch(generalSource, /id="mobile_poll_battery_saver"/);

  assert.match(layoutSource, /id="display_logo"/);
  assert.ok(
    layoutSource.indexOf('id="display_logo"') >
      layoutSource.indexOf('id="rounded_corners"'),
  );
  assert.match(mobileSource, /id="mobile_poll_battery_saver"/);
  const mobilePageIndex = mobileSource.indexOf(
    'id="mobile_view_page_enabled"',
  );
  const rotateFullscreenIndex = mobileSource.indexOf(
    'id="mobile_view_rotate_to_fullscreen"',
  );
  const batterySaverIndex = mobileSource.indexOf(
    'id="mobile_poll_battery_saver"',
  );
  assert.ok(mobilePageIndex >= 0);
  assert.ok(mobilePageIndex < rotateFullscreenIndex);
  assert.ok(rotateFullscreenIndex < batterySaverIndex);
  assert.match(
    mobileSource,
    /mobile_view_page_enabled !== false \? "checked" : ""/,
  );
  assert.match(
    mobileSource,
    /mobile_view_rotate_to_fullscreen !== false \? "checked" : ""/,
  );
  assert.doesNotMatch(mobileSource, /id="ha_dashboard_swipe_navigation"/);
  const swipeStart = editorSource.indexOf("const swipeNavigationPanelContent");
  const swipeEnd = editorSource.indexOf("const cardViewPanelContent", swipeStart);
  const swipeSource = editorSource.slice(swipeStart, swipeEnd);
  assert.match(swipeSource, /id="ha_dashboard_swipe_navigation"/);
  assert.match(swipeSource, /id="ha_dashboard_swipe_mouse_enabled"/);
  assert.match(
    editorSource,
    /type="checkbox" name="ha_dashboard_swipe_pages"/,
  );
  assert.match(swipeSource, /The configured desktop landing page is always included and cannot be removed/);
  assert.match(editorSource, /title: "Swipe Navigation"/);
});

test("editor DOM reads the Mobile View HA navbar toggles and swipe mode", () => {
  const root = {
    querySelector: (selector) => {
      if (
        selector ===
        '[name="ha_dashboard_swipe_navigation"]:checked'
      ) {
        return {
          value: DASHBOARD_SWIPE_NAVIGATION_MODES.landingDashboard,
        };
      }
      return selector === "#mobile_view_ha_navbar_bottom" ||
        selector === "#mobile_view_ha_navbar_stack_tabs" ||
        selector === "#mobile_view_ha_navbar_dashboard" ||
        selector === "#ha_dashboard_swipe_navigation_owner" ||
        selector === "#ha_dashboard_swipe_include_other_cards" ||
        selector === "#ha_dashboard_swipe_mouse_enabled" ||
        selector === "#preview_page_enabled" ||
        selector ===
          '[data-ha-dashboard-swipe-include-subviews="landing-dashboard"]'
        ? { checked: true }
        : null;
    },
    querySelectorAll: (selector) =>
      selector === '[name="ha_dashboard_swipe_pages"]:checked'
        ? [
            { value: PAGE_IDS.preview },
            { value: PAGE_IDS.singleView },
          ]
        : [],
  };

  const config = buildEditorConfigFromDom({
    root,
    baseConfig: {},
    cameras: [{ entity: "camera.front_door" }],
    themeDraftCache: {},
  });

  assert.equal(config.mobile_view_ha_navbar_bottom, true);
  assert.equal(config.mobile_view_ha_navbar_stack_tabs, true);
  assert.equal(config.mobile_view_ha_navbar_dashboard, true);
  assert.equal(config.ha_dashboard_swipe_navigation_owner, true);
  assert.equal(
    config.ha_dashboard_swipe_navigation,
    DASHBOARD_SWIPE_NAVIGATION_MODES.landingDashboard,
  );
  assert.equal(config.ha_dashboard_swipe_include_other_cards, true);
  assert.equal(config.ha_dashboard_swipe_include_subviews, true);
  assert.equal(config.ha_dashboard_swipe_mouse_enabled, true);
  assert.deepEqual(config.ha_dashboard_swipe_pages, [
    PAGE_IDS.preview,
    PAGE_IDS.singleView,
  ]);
});

test("changing the desktop landing page immediately replaces the locked swipe page", () => {
  const root = {
    querySelector: (selector) => {
      if (selector === "#landing_page") {
        return { value: PAGE_IDS.wideView, dataset: { value: PAGE_IDS.wideView } };
      }
      if (
        selector === "#preview_page_enabled" ||
        selector === "#wide_view_page_enabled"
      ) {
        return { checked: true };
      }
      return null;
    },
    querySelectorAll: (selector) =>
      selector === '[name="ha_dashboard_swipe_pages"]:checked'
        ? [
            { value: PAGE_IDS.preview },
            { value: PAGE_IDS.singleView },
          ]
        : [],
  };

  const config = buildEditorConfigFromDom({
    root,
    baseConfig: {
      landing_page: PAGE_IDS.singleView,
      preview_page_enabled: true,
      wide_view_page_enabled: true,
    },
    cameras: [{ entity: "camera.front_door" }],
    themeDraftCache: {},
  });

  assert.equal(config.landing_page, PAGE_IDS.wideView);
  assert.deepEqual(config.ha_dashboard_swipe_pages, [
    PAGE_IDS.preview,
    PAGE_IDS.wideView,
  ]);
});

test("phone landing flow defaults to Single View and preserves enabled preview combinations", () => {
  const defaults = normalizeCardConfig({
    cameras: [{ entity: "camera.front_door" }],
  });
  const legacyPreview = normalizeCardConfig({
    cameras: [{ entity: "camera.front_door" }],
    preview_page_enabled: true,
    mobile_page: "preview",
  });
  const compact = compactEditorConfigForYaml({
    cameras: [{ entity: "camera.front_door" }],
    mobile_page: "preview-mobile-view",
  });

  assert.equal(defaults.mobile_page, "single-view");
  assert.equal(legacyPreview.mobile_page, "preview-single-view");
  assert.equal(compact.mobile_page, "preview-mobile-view");
});

test("disabled landing pages fall back to Single View", () => {
  const normalized = normalizeCardConfig({
    cameras: [{ entity: "camera.front_door" }],
    landing_page: "wide-view",
    mobile_page: "preview-mobile-view",
    mobile_view_page_enabled: false,
    preview_page_enabled: true,
    wide_view_page_enabled: false,
  });

  assert.equal(normalized.landing_page, "single-view");
  assert.equal(normalized.mobile_page, "single-view");
});

test("compact YAML preserves video default config objects", () => {
  const config = compactEditorConfigForYaml({
    cameras: [{ entity: "camera.front_door" }],
    video_defaults: {
      classNames: ["shared-video"],
      style: { borderRadius: "10px" },
    },
    video_live_defaults: {
      controls: false,
      objectFit: "cover",
    },
    video_popup_defaults: {
      controls: true,
      style: { boxShadow: "0 0 10px #000" },
    },
    video_recording_defaults: {
      controls: true,
      filter: "saturate(1.2)",
    },
  });

  assert.deepEqual(config.video_defaults, {
    classNames: ["shared-video"],
    style: { borderRadius: "10px" },
  });
  assert.deepEqual(config.video_live_defaults, {
    controls: false,
    objectFit: "cover",
  });
  assert.deepEqual(config.video_popup_defaults, {
    controls: true,
    style: { boxShadow: "0 0 10px #000" },
  });
  assert.deepEqual(config.video_recording_defaults, {
    controls: true,
    filter: "saturate(1.2)",
  });
});

test("compact YAML omits empty video default config objects", () => {
  const config = compactEditorConfigForYaml({
    cameras: [{ entity: "camera.front_door" }],
    video_defaults: {},
    video_live_defaults: {},
    video_popup_defaults: {},
    video_recording_defaults: {},
  });

  assert.equal("video_defaults" in config, false);
  assert.equal("video_live_defaults" in config, false);
  assert.equal("video_popup_defaults" in config, false);
  assert.equal("video_recording_defaults" in config, false);
});

test("compact YAML omits invalid video default payload types", () => {
  const config = compactEditorConfigForYaml({
    cameras: [{ entity: "camera.front_door" }],
    video_defaults: "invalid",
    video_live_defaults: ["invalid"],
    video_popup_defaults: null,
    video_recording_defaults: 123,
  });

  assert.equal("video_defaults" in config, false);
  assert.equal("video_live_defaults" in config, false);
  assert.equal("video_popup_defaults" in config, false);
  assert.equal("video_recording_defaults" in config, false);
});

test("preview draft preserves video default config objects", () => {
  const draft = createEditorPreviewDraft({
    cameras: [{ entity: "camera.front_door" }],
    video_defaults: { className: "video-default" },
    video_live_defaults: { objectPosition: "center center" },
    video_popup_defaults: { controls: true },
    video_recording_defaults: { aspectRatio: "16 / 9" },
  });

  assert.deepEqual(draft.video_defaults, { className: "video-default" });
  assert.deepEqual(draft.video_live_defaults, {
    objectPosition: "center center",
  });
  assert.deepEqual(draft.video_popup_defaults, { controls: true });
  assert.deepEqual(draft.video_recording_defaults, { aspectRatio: "16 / 9" });
});

test("resolveSwitchChecked prefers live checked property over stale attribute", () => {
  const switchElement = {
    checked: false,
    getAttribute: (key) => (key === "checked" ? "" : null),
    shadowRoot: null,
  };

  assert.equal(resolveSwitchChecked(switchElement), false);
});

test("buildEditorConfigFromDom hides tabs from live switch state when unchecked", () => {
  const tabSwitch = {
    checked: false,
    dataset: { activeTab: "clips" },
    getAttribute: (key) => (key === "checked" ? "" : null),
    shadowRoot: null,
  };
  const root = {
    querySelector: () => null,
    querySelectorAll: (selector) =>
      selector === "[data-active-tab]" ? [tabSwitch] : [],
  };

  const result = buildEditorConfigFromDom({
    root,
    baseConfig: {},
    cameras: [{ entity: "camera.front_door" }],
    themeDraftCache: {},
  });

  assert.deepEqual(result.hidden_tabs, ["clips"]);
});
