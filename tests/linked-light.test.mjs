import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

import {
  linkedLightForCamera,
  linkedLightsForCamera,
  normalizeLinkedEntitiesConfig,
} from "../src/features/linked-entities/config.js";
import {
  linkedLightBrightnessPercent,
  linkedLightFriendlyName,
  linkedLightStateSignature,
  linkedLightSupportsBrightness,
  resolveLinkedLightUiState,
} from "../src/features/linked-entities/light.model.js";
import { buildLinkedLightControlMarkup } from "../src/features/linked-entities/light.tmpl.js";
import { LinkedLightController } from "../src/features/linked-entities/light.ctrl.js";
import { LINKED_LIGHT_STYLES } from "../src/features/linked-entities/light.styles.js";
import {
  setHomeAssistantLightBrightness,
  toggleHomeAssistantLight,
} from "../src/integrations/home-assistant/light-control.js";
import { normalizeCardConfig } from "../src/config/card-config.js";
import { compactEditorConfigForYaml } from "../src/config/yaml-mapper.js";
import { createEditorPreviewDraft } from "../src/config/preview-mapper.js";
import { buildInfoRowMarkup } from "../src/card/controls/shell-nav.tmpl.js";
import { buildMobileViewMainLayoutShellMarkup } from "../src/features/mobile-view/page.tmpl.js";
import { buildCardViewToolbarMarkup } from "../src/features/card-view/page.tmpl.js";
import { STYLES } from "../src/styles.js";

const cardSource = fs.readFileSync(
  new URL("../src/card/FrigateViewCard.js", import.meta.url),
  "utf8",
);

test("linked light config accepts two lights and allows reuse across cameras", () => {
  assert.deepEqual(
    normalizeLinkedEntitiesConfig([
      { entity: "sensor.outdoor" },
      { entity: "light.porch", icon: "mdi:coach-lamp" },
      { entity: "light.driveway" },
    ]),
    [
      { entity: "light.porch", icon: "mdi:coach-lamp" },
      { entity: "light.driveway" },
    ],
  );
  assert.deepEqual(
    normalizeLinkedEntitiesConfig([
      { entity: "light.porch", icon: "" },
    ]),
    [{ entity: "light.porch" }],
  );
  assert.deepEqual(
    normalizeLinkedEntitiesConfig([
      { entity: "light.porch", position: "left" },
    ]),
    [{ entity: "light.porch", position: "left" }],
  );
  assert.deepEqual(
    normalizeLinkedEntitiesConfig([
      { entity: "light.porch", position: "right" },
    ]),
    [{ entity: "light.porch" }],
  );
  assert.deepEqual(
    normalizeLinkedEntitiesConfig([
      { entity: "light.porch" },
      { entity: "light.porch", position: "left" },
    ]),
    [{ entity: "light.porch" }],
  );

  const config = normalizeCardConfig({
    cameras: [
      {
        entity: "camera.front",
        linked_entities: [{ entity: "light.porch" }],
      },
      {
        entity: "camera.driveway",
        linked_entities: [{ entity: "light.porch" }],
      },
    ],
  });
  assert.equal(
    linkedLightForCamera(config.cameras[0]).entity,
    "light.porch",
  );
  assert.equal(
    linkedLightForCamera(config.cameras[1]).entity,
    "light.porch",
  );
  assert.deepEqual(
    linkedLightsForCamera({
      linked_entities: [
        { entity: "light.porch", position: "left" },
        { entity: "light.driveway" },
        { entity: "light.third" },
      ],
    }),
    [
      { entity: "light.porch", position: "left" },
      { entity: "light.driveway" },
    ],
  );
});

test("linked light config survives YAML compaction and preview cloning", () => {
  const source = normalizeCardConfig({
    cameras: [
      {
        entity: "camera.front",
        linked_entities: [
          {
            entity: "light.porch",
            icon: "mdi:outdoor-lamp",
            position: "left",
          },
          {
            entity: "light.driveway",
            icon: "mdi:light-flood-down",
          },
        ],
      },
    ],
  });
  const compact = compactEditorConfigForYaml(source);
  assert.deepEqual(compact.cameras[0].linked_entities, [
    {
      entity: "light.porch",
      icon: "mdi:outdoor-lamp",
      position: "left",
    },
    {
      entity: "light.driveway",
      icon: "mdi:light-flood-down",
    },
  ]);

  const preview = createEditorPreviewDraft(source);
  preview.cameras[0].linked_entities[0].icon = "mdi:lightbulb";
  assert.equal(
    source.cameras[0].linked_entities[0].icon,
    "mdi:outdoor-lamp",
  );
});

test("linked light UI derives on, dimmed, and unavailable states", () => {
  const dimmed = {
    state: "on",
    attributes: {
      brightness: 128,
      supported_color_modes: ["brightness"],
    },
  };
  assert.equal(linkedLightSupportsBrightness(dimmed), true);
  assert.equal(linkedLightBrightnessPercent(dimmed), 50);
  assert.deepEqual(resolveLinkedLightUiState(dimmed), {
    available: true,
    on: true,
    dimmed: true,
    supportsBrightness: true,
    brightnessPercent: 50,
    rawState: "on",
  });
  assert.equal(
    linkedLightSupportsBrightness({
      state: "on",
      attributes: { supported_color_modes: ["onoff"] },
    }),
    false,
  );
  assert.equal(resolveLinkedLightUiState({ state: "unknown" }).available, false);
});

test("linked light names prefer HA friendly names and humanize entity ids", () => {
  assert.equal(linkedLightFriendlyName("light.porch_light"), "Porch Light");
  assert.equal(
    linkedLightFriendlyName("light.porch_light", {
      attributes: { friendly_name: "Front Porch" },
    }),
    "Front Porch",
  );
});

test("linked light signature reacts to brightness changes while state stays on", () => {
  const cameras = [
    {
      entity: "camera.front",
      linked_entities: [{ entity: "light.porch" }],
    },
  ];
  const hass = {
    states: {
      "light.porch": {
        state: "on",
        attributes: {
          brightness: 32,
          supported_color_modes: ["brightness"],
        },
      },
    },
  };
  const before = linkedLightStateSignature(hass, cameras);
  hass.states["light.porch"].attributes.brightness = 192;
  const after = linkedLightStateSignature(hass, cameras);
  assert.notEqual(before, after);
});

test("initial Home Assistant state synchronizes linked lights before async card startup", () => {
  const hassSetterStart = cardSource.indexOf("  set hass(hass) {");
  const hassSetterEnd = cardSource.indexOf("  get _activeCam()", hassSetterStart);
  const hassSetter = cardSource.slice(hassSetterStart, hassSetterEnd);
  const syncIndex = hassSetter.indexOf(
    "if (linkedLightStateChanged) this._linkedLightController?.sync?.();",
  );
  const startupIndex = hassSetter.indexOf("if (!this._started)");

  assert.ok(syncIndex >= 0);
  assert.ok(startupIndex > syncIndex);
});

test("Home Assistant light controls toggle and set brightness with native services", async () => {
  const calls = [];
  const hass = {
    states: {
      "light.porch": { state: "off", attributes: {} },
    },
    callService: async (...args) => calls.push(args),
  };
  assert.equal(
    await toggleHomeAssistantLight({ hass, entity: "light.porch" }),
    true,
  );
  assert.deepEqual(calls.pop(), [
    "light",
    "turn_on",
    { entity_id: "light.porch" },
  ]);

  hass.states["light.porch"].state = "on";
  await toggleHomeAssistantLight({ hass, entity: "light.porch" });
  assert.deepEqual(calls.pop(), [
    "light",
    "turn_off",
    { entity_id: "light.porch" },
  ]);

  await setHomeAssistantLightBrightness({
    hass,
    entity: "light.porch",
    brightnessPercent: 42,
  });
  assert.deepEqual(calls.pop(), [
    "light",
    "turn_on",
    { entity_id: "light.porch", brightness_pct: 42 },
  ]);
});

test("linked light markup uses native HA icons and exposes dimming only when supported", () => {
  const markup = buildLinkedLightControlMarkup({
    config: { entity: "light.porch", icon: "mdi:coach-lamp" },
    stateObject: {
      state: "on",
      attributes: {
        friendly_name: "Porch Light",
        brightness: 128,
        supported_color_modes: ["brightness"],
      },
    },
    buttonClass: "icon-btn",
  });
  assert.match(markup, /class="linked-light-button icon-btn is-on is-dimmed"/);
  assert.match(markup, /<ha-icon icon="mdi:coach-lamp"><\/ha-icon>/);
  assert.match(markup, /data-linked-light-brightness/);
  assert.match(markup, /data-linked-light-power/);
  assert.match(markup, /data-linked-light-dimmer-dismiss/);
  assert.match(
    markup,
    /data-linked-light-title>Porch Light<\/div>/,
  );
  assert.match(markup, /--linked-light-level:50/);
  assert.match(LINKED_LIGHT_STYLES, /linked-light-brightness-track/);
  assert.match(
    LINKED_LIGHT_STYLES,
    /\.card\.mobile-view-active \.linked-light-dimmer\{position:fixed/,
  );
  assert.doesNotMatch(
    LINKED_LIGHT_STYLES,
    /\.phone-client\.mobile-view-active \.linked-light-dimmer/,
  );
  assert.match(
    STYLES,
    /@media \(hover:hover\) and \(pointer:fine\)\{\s*\.round-btn:hover/,
  );
  assert.match(
    STYLES,
    /\.round-btn:active:not\(:disabled\)\{transform:scale\(\.95\);/,
  );
});

test("touch linked-light toggles release retained button focus", async () => {
  const calls = [];
  const host = {
    shadowRoot: {
      addEventListener: () => {},
      querySelectorAll: () => [],
    },
    _hass: {
      states: { "light.porch": { state: "off", attributes: {} } },
      callService: async (...args) => calls.push(args),
    },
  };
  const controller = new LinkedLightController(host);
  const classes = new Set();
  const control = { dataset: { linkedLight: "light.porch" } };
  let blurCalls = 0;
  const button = {
    disabled: false,
    blur: () => (blurCalls += 1),
    closest: (selector) =>
      selector === "[data-linked-light]" ? control : null,
    classList: {
      add: (name) => classes.add(name),
      remove: (name) => classes.delete(name),
    },
  };
  const target = {
    closest: (selector) =>
      selector === "[data-linked-light-toggle]" ? button : null,
  };

  assert.equal(
    controller.handleClick(
      {
        pointerType: "touch",
        preventDefault: () => {},
        stopPropagation: () => {},
      },
      target,
    ),
    true,
  );
  await new Promise((resolve) => setTimeout(resolve, 0));

  assert.equal(blurCalls, 1);
  assert.equal(classes.has("is-pending"), false);
  assert.deepEqual(calls, [
    ["light", "turn_on", { entity_id: "light.porch" }],
  ]);
});

test("linked light markup can target an individual Preview camera", () => {
  const cameras = [
    {
      entity: "camera.front",
      linked_entities: [{ entity: "light.porch" }],
    },
    {
      entity: "camera.driveway",
      linked_entities: [{ entity: "light.driveway" }],
    },
  ];
  const controller = new LinkedLightController({
    _activeCam: cameras[0],
    _hass: {
      states: {
        "light.porch": { state: "off", attributes: {} },
        "light.driveway": { state: "on", attributes: {} },
      },
    },
  });

  const markup = controller.buildMarkup({
    buttonClass: "icon-btn",
    camera: cameras[1],
  });
  assert.match(markup, /data-linked-light="light\.driveway"/);
  assert.doesNotMatch(markup, /light\.porch/);
});

test("linked light dimmer uses a translucent token-based panel", () => {
  assert.match(
    LINKED_LIGHT_STYLES,
    /\.linked-light-dimmer-panel\{[^}]*background:color-mix\(in srgb,var\(--c-bg-panel\) 94%,transparent\)/,
  );
  assert.match(LINKED_LIGHT_STYLES, /\.linked-light-dimmer\{[^}]*width:93px/);
  assert.match(
    LINKED_LIGHT_STYLES,
    /\.linked-light-brightness-track\{[^}]*width:50px;height:108px/,
  );
});

test("linked light regions use round controls in info rows and icon controls in compact views", () => {
  const info = buildInfoRowMarkup({
    title: "FrigateView",
    subtitle: "Front",
    version: "1",
    linkedEntitiesMarkup: "LIGHT",
  });
  assert.match(
    info,
    /data-fvc-region="linked-entities" data-linked-light-variant="round-btn">[\s\S]*data-linked-light-position-slot="right"[^>]*>LIGHT/,
  );
  assert.match(
    info,
    /class="info-left">[\s\S]*class="stat info-alert-stat">[\s\S]*id="alert-count"/,
  );
  assert.match(
    LINKED_LIGHT_STYLES,
    /\.info-row-center-controls\{display:grid;[^}]*grid-template-columns:minmax\(40px,1fr\) auto minmax\(40px,1fr\)/,
  );
  assert.match(
    LINKED_LIGHT_STYLES,
    /data-fvc-region="linked-entities"\]\{display:contents;/,
  );
  assert.match(
    LINKED_LIGHT_STYLES,
    /data-linked-light-position-slot="left"\]\{grid-column:1;/,
  );

  const mobile = buildMobileViewMainLayoutShellMarkup({
    regions: { linkedEntities: "LIGHT" },
  });
  assert.match(
    mobile,
    /data-fvc-region="linked-entities" data-linked-light-variant="icon-btn">[\s\S]*data-linked-light-position-slot="right"[^>]*>LIGHT/,
  );

  const card = buildCardViewToolbarMarkup({
    showMicrophone: true,
    microphoneMarkup: "MIC",
    linkedLightMarkup: "LIGHT",
    linkedLightPosition: "left",
  });
  assert.match(
    card,
    /data-fvc-region="linked-entities" data-linked-light-variant="icon-btn">[\s\S]*data-linked-light-position-slot="right"[^>]*>LIGHT/,
  );
  assert.match(card, /data-fvc-region="two-way-talk">MIC/);
});

test("linked light markup filters both controls around the microphone", () => {
  const camera = {
    entity: "camera.front",
    linked_entities: [
      { entity: "light.left", position: "left" },
      { entity: "light.right", position: "right" },
    ],
  };
  const controller = new LinkedLightController({
    _activeCam: camera,
    _hass: {
      states: {
        "light.left": { state: "off", attributes: {} },
        "light.right": { state: "off", attributes: {} },
      },
    },
  });
  const left = controller.buildMarkup({ camera, position: "left" });
  const right = controller.buildMarkup({ camera, position: "right" });
  assert.match(left, /data-linked-light="light\.left"/);
  assert.doesNotMatch(left, /light\.right/);
  assert.match(right, /data-linked-light="light\.right"/);
  assert.doesNotMatch(right, /light\.left/);
});

test("dimmable linked lights open on long press and suppress the toggle click", async () => {
  const shadowRoot = {
    addEventListener: () => {},
    querySelectorAll: () => [],
  };
  const controller = new LinkedLightController({ shadowRoot });
  const dimmer = {};
  const control = {
    querySelector: (selector) =>
      selector === "[data-linked-light-dimmer]" ? dimmer : null,
  };
  const button = {
    disabled: false,
    closest: () => control,
    setPointerCapture: () => {},
  };
  let opened = false;
  controller._openDimmer = (target) => {
    opened = target === control;
  };
  controller.handlePointerDown({
    target: { closest: () => button },
    pointerId: 4,
    clientX: 10,
    clientY: 10,
  });
  await new Promise((resolve) => setTimeout(resolve, 525));
  assert.equal(opened, true);

  let prevented = false;
  assert.equal(
    controller.handleClick(
      {
        preventDefault: () => {
          prevented = true;
        },
        stopPropagation: () => {},
      },
      {
        closest: (selector) =>
          selector === "[data-linked-light-toggle]" ? button : null,
      },
    ),
    true,
  );
  assert.equal(prevented, true);
  assert.equal(controller.suppressClickButton, null);
  controller.cancelInteractions();
});

test("dimmer power control restores the light through Home Assistant without closing", async () => {
  const calls = [];
  const shadowRoot = {
    addEventListener: () => {},
    querySelectorAll: () => [],
  };
  const host = {
    shadowRoot,
    _hass: {
      states: { "light.porch": { state: "off", attributes: {} } },
      callService: async (...args) => calls.push(args),
    },
  };
  const controller = new LinkedLightController(host);
  const classes = new Set();
  const control = { dataset: { linkedLight: "light.porch" } };
  const power = {
    disabled: false,
    closest: (selector) =>
      selector === "[data-linked-light]" ? control : null,
    classList: {
      add: (name) => classes.add(name),
      remove: (name) => classes.delete(name),
    },
  };
  const target = {
    closest: (selector) =>
      selector === "[data-linked-light-power]" ? power : null,
  };

  assert.equal(
    controller.handleClick(
      { preventDefault: () => {}, stopPropagation: () => {} },
      target,
    ),
    true,
  );
  await new Promise((resolve) => setTimeout(resolve, 0));
  assert.deepEqual(calls, [
    ["light", "turn_on", { entity_id: "light.porch" }],
  ]);
  assert.equal(classes.has("is-pending"), false);
});
