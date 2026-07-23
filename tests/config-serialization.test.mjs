import { test } from "node:test";
import assert from "node:assert/strict";

import {
  buildEditorConfigFromDom,
  resolveSwitchChecked,
} from "../src/helpers.js";
import { createEditorPreviewDraft } from "../src/config/editor-preview-mapper.js";
import {
  compactEditorConfigForYaml,
  withCardTypeForYaml,
} from "../src/config/yaml-config-mapper.js";

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
    slideshow_rotation_enabled: false,
    slideshow_rotation_seconds: 30,
    grid_mode_enabled: false,
    grid_start_in_grid_enabled: false,
    grid_live_view_enabled: true,
    landing_page_enabled: false,
    landing_page_live_cameras: false,
    landing_page_show_title_bars: true,
    grid_rotation_seconds: 30,
    window_hours: 72,
    stream_height_unit: "vh",
    tight_margins: false,
    rounded_corners: true,
    outer_shadows: true,
    outer_rounded_corners: true,
    wide_view: false,
    col_left_width_pct: 50,
    hidden_tabs: [],
  });

  assert.deepEqual(config, {
    cameras: [{ entity: "camera.front_door", name: "Front Door" }],
    title: "Frigate",
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
    hidden_tabs: ["clips", "snapshots"],
    landing_page: "preview",
    mobile_page: "single",
  });

  assert.deepEqual(draft.hidden_tabs, ["clips", "snapshots"]);
  assert.equal(draft.landing_page, "preview");
  assert.equal(draft.mobile_page, "single");
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
