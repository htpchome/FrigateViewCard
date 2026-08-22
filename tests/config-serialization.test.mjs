import { test } from "node:test";
import assert from "node:assert/strict";

import {
  buildEditorConfigFromDom,
  resolveSwitchChecked,
} from "../src/helpers.js";
import { createEditorPreviewDraft } from "../src/config/preview-mapper.js";
import {
  compactEditorConfigForYaml,
  withCardTypeForYaml,
} from "../src/config/yaml-mapper.js";
import { normalizeCardConfig } from "../src/config/card-config.js";
import {
  normalizeCardHeight,
  normalizeCardHeightUnit,
} from "../src/features/card-style/config.js";
import { normalizeWideLeftWidth } from "../src/features/wide-view/config.js";

test("editor YAML config omits normalized default values", () => {
  const config = compactEditorConfigForYaml({
    cameras: [
      {
        entity: "camera.front_door",
        name: "Front Door",
        connection_type: "frigate_go2rtc",
        alerts_content: "alerts_only",
        disable_hls_desktop: false,
      },
    ],
    title: "FrigateView",
    subtitle: "{Camera}",
    display_title: true,
    display_subtitle: true,
    theme: "default",
    shadows: true,
    window_days: 3,
    alerts_reviews_days: 3,
    realtime_poll_seconds: 5,
    mobile_poll_battery_saver: false,
    event_pre_post_roll_enabled: false,
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
    hidden_tabs: [],
  });

  assert.deepEqual(config, {
    cameras: [{ entity: "camera.front_door", name: "Front Door" }],
  });
});

test("compact YAML preserves a non-default subtitle", () => {
  const config = compactEditorConfigForYaml({
    cameras: [{ entity: "camera.front_door" }],
    subtitle: "Frigate",
  });

  assert.equal(config.subtitle, "Frigate");
});

test("title and subtitle defaults normalize and hidden states serialize", () => {
  const defaults = normalizeCardConfig({
    cameras: [{ entity: "camera.front_door" }],
  });
  const compact = compactEditorConfigForYaml({
    cameras: [{ entity: "camera.front_door" }],
    title: "FrigateView",
    subtitle: "{Camera}",
    display_title: false,
    display_subtitle: false,
  });

  assert.equal(defaults.title, "FrigateView");
  assert.equal(defaults.subtitle, "{Camera}");
  assert.equal(defaults.display_title, true);
  assert.equal(defaults.display_subtitle, true);
  assert.deepEqual(compact, {
    cameras: [{ entity: "camera.front_door" }],
    display_title: false,
    display_subtitle: false,
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

test("compact YAML only preserves configurable per-camera PTZ values", () => {
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
          speed: 0.4,
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

test("custom theme YAML config only keeps colors different from defaults", () => {
  const config = compactEditorConfigForYaml(
    {
      cameras: [{ entity: "camera.front_door" }],
      theme: "custom",
      theme_custom: {
        "--c-bg-main": "#112233",
        "--c-text": "#445566",
        "--c-accent": "#778899",
      },
      theme_custom_defaults: {
        "--c-bg-main": true,
        "--c-accent": true,
      },
    },
    {
      themeDefaultColors: {
        "--c-bg-main": "#112233",
        "--c-text": "#445566",
        "--c-accent": "#000000",
      },
    },
  );

  assert.deepEqual(config, {
    cameras: [{ entity: "camera.front_door" }],
    theme: "custom",
  });
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

test("buildEditorConfigFromDom reads title and subtitle display checkboxes", () => {
  const root = {
    querySelector: (selector) => {
      if (selector === "#display_title") return { checked: false };
      if (selector === "#display_subtitle") return { checked: true };
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
    hidden_tabs: ["clips", "snapshots"],
    landing_page: "preview",
    mobile_page: "single",
    snapshot_update_seconds: 75,
    event_pre_post_roll_enabled: true,
    preview_page_alert_live_duration_seconds: 12,
    slideshow_alert_hold_seconds: 14,
    grid_alert_hold_seconds: 16,
    wide_view_live_cameras: true,
    wide_view_alert_takeover: true,
    display_title: false,
    display_subtitle: true,
  });

  assert.equal(draft.mobile_view_page_enabled, true);
  assert.deepEqual(draft.hidden_tabs, ["clips", "snapshots"]);
  assert.equal(draft.landing_page, "preview");
  assert.equal(draft.mobile_page, "single");
  assert.equal(draft.snapshot_update_seconds, 75);
  assert.equal(draft.event_pre_post_roll_enabled, true);
  assert.equal(draft.preview_page_alert_live_duration_seconds, 12);
  assert.equal(draft.slideshow_alert_hold_seconds, 14);
  assert.equal(draft.grid_alert_hold_seconds, 16);
  assert.equal(draft.wide_view_live_cameras, true);
  assert.equal(draft.wide_view_alert_takeover, true);
  assert.equal(draft.display_title, false);
  assert.equal(draft.display_subtitle, true);
});

test("compact YAML preserves custom alert duration settings", () => {
  const config = compactEditorConfigForYaml({
    cameras: [{ entity: "camera.front_door" }],
    snapshot_update_seconds: 90,
    preview_page_alert_live_duration_seconds: 18,
    slideshow_alert_hold_seconds: 22,
    grid_alert_hold_seconds: 26,
  });

  assert.deepEqual(config, {
    cameras: [{ entity: "camera.front_door" }],
    snapshot_update_seconds: 90,
    preview_page_alert_live_duration_seconds: 18,
    slideshow_alert_hold_seconds: 22,
    grid_alert_hold_seconds: 26,
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

test("compact YAML includes mobile view page toggle when enabled", () => {
  const config = compactEditorConfigForYaml({
    cameras: [{ entity: "camera.front_door" }],
    mobile_view_page_enabled: true,
  });

  assert.deepEqual(config, {
    cameras: [{ entity: "camera.front_door" }],
    mobile_view_page_enabled: true,
  });
});

test("phone landing flow defaults to Mobile and preserves preview combinations", () => {
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

  assert.equal(defaults.mobile_page, "mobile-view");
  assert.equal(legacyPreview.mobile_page, "preview-single-view");
  assert.equal(compact.mobile_page, "preview-mobile-view");
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
