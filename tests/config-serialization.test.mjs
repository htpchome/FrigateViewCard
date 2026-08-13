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
    title: "Frigate",
    theme: "default",
    shadows: true,
    window_days: 3,
    alerts_reviews_days: 3,
    realtime_poll_seconds: 5,
    mobile_poll_battery_saver: false,
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
    stream_height_unit: "vh",
    tight_margins: false,
    rounded_corners: true,
    outer_shadows: true,
    outer_rounded_corners: true,
    wide_view: false,
    col_left_width_pct: 50,
    preview_page_alert_live_duration_seconds: 10,
    hidden_tabs: [],
  });

  assert.deepEqual(config, {
    cameras: [{ entity: "camera.front_door", name: "Front Door" }],
    title: "Frigate",
  });
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

test("compact YAML preserves per-camera PTZ config", () => {
  const config = compactEditorConfigForYaml({
    cameras: [
      {
        entity: "camera.driveway",
        ptz: {
          enabled: true,
          move_mode: "RelativeMove",
          speed: 0.4,
          distance: 0.2,
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
          move_mode: "ContinuousMove",
          speed: 0.4,
          distance: 0.2,
          continuous_duration: null,
        },
      },
    ],
  });
});

test("compact YAML preserves boolean PTZ enablement", () => {
  const config = compactEditorConfigForYaml({
    cameras: [
      {
        entity: "camera.front_door",
        ptz: true,
      },
    ],
  });

  assert.deepEqual(config, {
    cameras: [
      {
        entity: "camera.front_door",
        ptz: {
          enabled: true,
          move_mode: "ContinuousMove",
          speed: 0.5,
          distance: null,
          continuous_duration: null,
        },
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
    preview_page_alert_live_duration_seconds: 12,
    slideshow_alert_hold_seconds: 14,
    grid_alert_hold_seconds: 16,
  });

  assert.equal(draft.mobile_view_page_enabled, true);
  assert.deepEqual(draft.hidden_tabs, ["clips", "snapshots"]);
  assert.equal(draft.landing_page, "preview");
  assert.equal(draft.mobile_page, "single");
  assert.equal(draft.snapshot_update_seconds, 75);
  assert.equal(draft.preview_page_alert_live_duration_seconds, 12);
  assert.equal(draft.slideshow_alert_hold_seconds, 14);
  assert.equal(draft.grid_alert_hold_seconds, 16);
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
