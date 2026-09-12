import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";
import {
  reorderItemsForDrop,
  resolveCameraRowDropPlacement,
  setupEntitySelector,
  setupIconSelector,
} from "../src/helpers.js";

const originalHTMLElement = globalThis.HTMLElement;
globalThis.HTMLElement = class {};
const { FrigateViewCardEditor, buildEditorChoiceChipsMarkup } = await import(
  "../src/editor/FrigateViewCardEditor.js"
);
if (originalHTMLElement === undefined) {
  delete globalThis.HTMLElement;
} else {
  globalThis.HTMLElement = originalHTMLElement;
}

test("camera deletion waits for confirmation and identifies the camera", () => {
  const editor = new FrigateViewCardEditor();
  const modalClasses = new Set(["hidden"]);
  const nodes = {
    "#camera-delete-modal": {
      classList: {
        add: (name) => modalClasses.add(name),
        remove: (name) => modalClasses.delete(name),
      },
    },
    "#camera-delete-message": { textContent: "" },
    "#camera-delete-confirm": { focus: () => {} },
  };
  editor._getCams = () => [
    { entity: "camera.doorbell", name: "Doorbell" },
  ];
  editor.querySelector = (selector) => nodes[selector] || null;

  editor._openCameraDeleteConfirmation(0);

  assert.equal(editor._pendingCameraRemovalIndex, 0);
  assert.equal(modalClasses.has("hidden"), false);
  assert.match(nodes["#camera-delete-message"].textContent, /Doorbell/);

  let removedIndex = null;
  editor._removeCamera = (index) => {
    removedIndex = index;
  };
  editor._confirmCameraRemoval();

  assert.equal(removedIndex, 0);
  assert.equal(editor._pendingCameraRemovalIndex, null);
  assert.equal(modalClasses.has("hidden"), true);
});

test("camera summaries only show configured capabilities with friendly light names", () => {
  const editor = new FrigateViewCardEditor();
  editor._hass = {
    states: {
      "light.porch_light": {
        attributes: { friendly_name: "Porch Light" },
      },
    },
  };

  assert.equal(
    editor._cameraMetaLabel({
      entity: "camera.doorbell",
      connection_type: "frigate_go2rtc",
      alerts_content: "alerts_only",
      ptz: null,
      two_way_talk: false,
    }),
    "Frigate go2rtc · Alerts only",
  );
  assert.equal(
    editor._cameraMetaLabel({
      entity: "camera.doorbell",
      connection_type: "frigate_go2rtc",
      alerts_content: "alerts_only",
      ptz: { enabled: true },
      two_way_talk: true,
      linked_entities: [{ entity: "light.porch_light" }],
    }),
    "Frigate go2rtc · Alerts only · PTZ on · Two-Way Talk on · Light: Porch Light",
  );
});

test("camera deletion cancellation leaves the camera untouched", () => {
  const editor = new FrigateViewCardEditor();
  let removed = false;
  editor._pendingCameraRemovalIndex = 0;
  editor._removeCamera = () => {
    removed = true;
  };
  editor.querySelector = () => ({
    classList: { add: () => {} },
  });

  editor._closeCameraDeleteConfirmation();

  assert.equal(removed, false);
  assert.equal(editor._pendingCameraRemovalIndex, null);
});

test("adding a second camera assigns the next unused group name", () => {
  const editor = new FrigateViewCardEditor();
  const nameInput = { value: "" };
  const nameLabel = { textContent: "Camera Name" };
  const secondaryInput = { value: "", dataset: {} };
  const addButton = { hidden: false };
  const help = { hidden: false };
  const fields = { hidden: true };
  const helper = { textContent: "" };
  const nodes = {
    "#camera-modal-name": nameInput,
    "#camera-modal-name-label": nameLabel,
    "#camera-modal-secondary-entity": secondaryInput,
    "#camera-modal-add-secondary": addButton,
    "#camera-modal-secondary-help": help,
    "#camera-modal-group-fields": fields,
    "#camera-modal-helper": helper,
  };
  editor._getCams = () => [
    {
      entity: "camera.front",
      name: "Group A/B",
      group: { secondary_entity: "camera.package", layout: "stacked" },
    },
  ];
  editor._editingCamIndex = null;
  editor._cameraModalGroupEnabled = false;
  editor._cameraModalNameBeforeGroup = "";
  editor._cameraModalAssignedGroupName = "";
  editor.querySelector = (selector) => nodes[selector] || null;

  editor._setCameraModalGroupEnabled(true);

  assert.equal(nameInput.value, "Group C/D");
  assert.equal(nameLabel.textContent, "Group Name");
  assert.equal(addButton.hidden, true);
  assert.equal(help.hidden, true);
  assert.equal(fields.hidden, false);

  editor._setCameraModalGroupEnabled(false);

  assert.equal(nameInput.value, "");
  assert.equal(nameLabel.textContent, "Camera Name");
  assert.equal(secondaryInput.value, "");
  assert.equal(addButton.hidden, false);
  assert.equal(help.hidden, false);
  assert.equal(fields.hidden, true);
});

test("Grid order labels grouped members from their configured selectors", () => {
  const editor = new FrigateViewCardEditor();
  editor._hass = {
    states: {
      "camera.doorbell_main": {
        attributes: { friendly_name: "Doorbell Main" },
      },
      "camera.doorbell_package": {
        attributes: { friendly_name: "Package Camera" },
      },
    },
  };

  assert.equal(
    editor._gridOrderCameraLabel({
      entity: "camera.doorbell_main",
      group_member: "A",
      name: "Group A/B",
    }),
    "Camera A [Doorbell Main]",
  );
  assert.equal(
    editor._gridOrderCameraLabel({
      entity: "camera.doorbell_package",
      group_member: "B",
      name: "Group A/B",
    }),
    "Camera B [Package Camera]",
  );
});

test("camera light editor is reusable and uses HA light and icon selectors", () => {
  const source = fs.readFileSync(
    new URL("../src/editor/FrigateViewCardEditor.js", import.meta.url),
    "utf8",
  );
  assert.match(source, /id="camera-modal-add-light"/);
  assert.match(source, /id="camera-modal-light-entity"/);
  assert.match(source, /id="camera-modal-light-icon"/);
  assert.match(source, /id="camera-modal-add-light-2"/);
  assert.match(source, /id="camera-modal-light-entity-2"/);
  assert.match(source, /id="camera-modal-light-icon-2"/);
  assert.match(source, /name: "camera-modal-light-position"/);
  assert.match(source, /name: "camera-modal-light-position-2"/);
  assert.match(source, /value: LINKED_LIGHT_POSITIONS\.left/);
  assert.match(source, /value: LINKED_LIGHT_POSITIONS\.right/);
  assert.match(source, /selectedValue: LINKED_LIGHT_POSITIONS\.right/);
  assert.match(source, /domain: "light"/);
  assert.match(source, /setupIconSelector\(/);
  assert.match(source, /required: false/);
  assert.match(source, /\.cam-inline-add\[hidden\]\{display:none!important;\}/);
  assert.ok(
    source.indexOf('id="camera-modal-name"') <
      source.indexOf('id="camera-modal-connection-type"'),
  );
  assert.ok(
    source.indexOf('id="camera-modal-connection-type"') <
      source.indexOf('id="camera-modal-all-reviews"'),
  );
  assert.ok(
    source.indexOf('id="camera-modal-all-reviews"') <
      source.indexOf('id="camera-modal-add-light"'),
  );
  assert.ok(
    source.indexOf('id="camera-modal-light-fields-2"') <
      source.indexOf('id="camera-modal-ptz-toggle-row"'),
  );
  assert.match(
    source,
    /id="camera-modal-name-label">Camera Name<\/span>\s*<ha-input id="camera-modal-name"[^>]*placeholder="Display name \(optional\)"/,
  );
  assert.match(source, /A light can be linked to multiple cameras/);
  assert.match(
    source,
    /class="field-helper camera-capability-status" id="camera-modal-ptz-state"/,
  );
  assert.match(
    source,
    /class="field-helper camera-capability-status" id="camera-modal-two-way-talk-state"/,
  );
  assert.match(
    source,
    /\.camera-capability-status\{[^}]*border-radius:10px;[^}]*background:var\(--editor-secondary-bg\)/,
  );
  assert.match(
    source,
    /<span class="cam-modal-label">Light<\/span>\s*<ha-selector id="camera-modal-light-entity">/,
  );
  assert.match(
    source,
    /<span class="cam-modal-label">Icon<\/span>\s*<ha-selector id="camera-modal-light-icon">/,
  );

  const secondaryPanelStart = source.indexOf(
    'id="camera-modal-group-fields"',
  );
  const secondaryPanelEnd = source.indexOf(
    'id="camera-modal-add-light"',
    secondaryPanelStart,
  );
  const secondaryPanel = source.slice(secondaryPanelStart, secondaryPanelEnd);
  assert.ok(
    secondaryPanel.indexOf('id="camera-modal-remove-secondary"') >
      secondaryPanel.indexOf("Only the main camera provides PTZ"),
  );

  const lightPanelStart = source.indexOf('id="camera-modal-light-fields"');
  const lightPanelEnd = source.indexOf(
    'id="camera-modal-ptz-toggle-row"',
    lightPanelStart,
  );
  const lightPanel = source.slice(lightPanelStart, lightPanelEnd);
  assert.ok(
    lightPanel.indexOf('id="camera-modal-remove-light"') >
      lightPanel.indexOf("A light can be linked to multiple cameras"),
  );
});

test("choice-chip markup keeps native radio semantics and interaction states", () => {
  const source = fs.readFileSync(
    new URL("../src/editor/FrigateViewCardEditor.js", import.meta.url),
    "utf8",
  );
  const markup = buildEditorChoiceChipsMarkup({
    name: "sample-position",
    options: [
      { value: "left", label: "Left" },
      { value: "right", label: "Right" },
      { value: "disabled", label: "Disabled", disabled: true },
    ],
    selectedValue: "right",
  });

  assert.match(markup, /type="radio" name="sample-position" value="left"/);
  assert.match(markup, /type="radio" name="sample-position" value="right" checked/);
  assert.match(markup, /value="disabled"[^>]*disabled/);
  assert.match(markup, /editor-choice-chip-indicator/);
  assert.match(markup, /editor-choice-chip-body/);
  assert.match(source, /editor-choice-chip-input:not\(:disabled\)[^}]*:hover/);
  assert.match(source, /editor-choice-chip-input:focus-visible/);
  assert.match(source, /editor-choice-chip-input:checked/);
  assert.match(source, /editor-choice-chip-input:disabled/);
});

test("only optional entity and icon selectors expose Home Assistant clear controls", () => {
  const selector = () => ({
    dataset: {},
    listeners: {},
    addEventListener(name, handler) {
      this.listeners[name] = handler;
    },
  });
  const mainCamera = selector();
  const optionalLight = selector();
  const optionalIcon = selector();

  setupEntitySelector({
    element: mainCamera,
    hass: {},
    domain: "camera",
    label: "Camera",
  });
  setupEntitySelector({
    element: optionalLight,
    hass: {},
    domain: "light",
    label: "Light",
    required: false,
  });
  setupIconSelector({
    element: optionalIcon,
    hass: {},
    label: "Icon",
  });

  assert.equal("required" in mainCamera, false);
  assert.equal(optionalLight.required, false);
  assert.equal(optionalIcon.required, false);

  optionalIcon.value = "mdi:coach-lamp";
  optionalIcon.dataset.value = "mdi:coach-lamp";
  optionalIcon.listeners["value-changed"]({ detail: { value: "" } });
  assert.equal(optionalIcon.value, "");
  assert.equal(optionalIcon.dataset.value, "");
});

test("clearing a linked-light icon makes the default icon authoritative", () => {
  const editor = new FrigateViewCardEditor();
  const selector = {
    dataset: { value: "" },
    value: "mdi:coach-lamp",
    __value: "mdi:coach-lamp",
  };
  editor.querySelector = (query) =>
    query === "#camera-modal-light-icon" ? selector : null;

  assert.equal(editor._cameraModalLightIconValue(), "");
});

test("camera modal outside-click handling ignores non-Node event path entries", () => {
  const editor = new FrigateViewCardEditor();
  const modalCard = {
    contains: (node) => node?.nodeType === 1,
  };
  const modal = {
    classList: { contains: () => false },
    querySelector: () => modalCard,
  };
  editor.querySelector = (selector) =>
    selector === "#camera-modal" ? modal : null;
  let closed = false;
  editor._closeCameraModal = () => {
    closed = true;
  };

  assert.doesNotThrow(() =>
    editor._handleCameraModalDocumentClick({
      target: globalThis,
      composedPath: () => [globalThis, { nodeType: 1 }],
    }),
  );
  assert.equal(closed, false);
});

test("editing a camera restores its linked light and icon", () => {
  const editor = new FrigateViewCardEditor();
  const modalClasses = new Set(["hidden"]);
  const node = () => ({
    value: "",
    dataset: {},
    checked: false,
    hidden: false,
    textContent: "",
    style: {},
  });
  const nodes = {
    "#camera-modal-title": node(),
    "#camera-modal-save": node(),
    "#camera-modal": {
      classList: {
        remove: (name) => modalClasses.delete(name),
      },
    },
    "#camera-modal-name": node(),
    "#camera-modal-entity": node(),
    "#camera-modal-secondary-entity": node(),
    "#camera-modal-connection-type": node(),
    "#camera-modal-all-reviews": node(),
    "#camera-modal-ptz-enabled": node(),
    "#camera-modal-two-way-talk-enabled": node(),
    "#camera-modal-light-entity": node(),
    "#camera-modal-light-icon": node(),
    "#camera-modal-light-entity-2": node(),
    "#camera-modal-light-icon-2": node(),
    "#camera-modal-helper": node(),
  };
  editor._getCams = () => [
    {
      entity: "camera.front",
      linked_entities: [
        { entity: "light.porch", icon: "mdi:coach-lamp" },
        {
          entity: "light.driveway",
          icon: "mdi:light-flood-down",
          position: "left",
        },
      ],
    },
  ];
  editor.querySelector = (selector) => nodes[selector] || null;
  editor.querySelectorAll = () => [];
  editor._syncCameraModalGroupFields = () => {};
  editor._syncCameraModalLightFields = () => {};
  editor._syncCameraModalPtzVisibility = () => {};
  editor._syncCameraModalTwoWayTalkVisibility = () => {};
  editor._refreshCameraModalPtzSupport = () => {};
  editor._refreshCameraModalTwoWayTalkSupport = () => {};
  editor._syncCameraModalLightIconContext = () => {};

  editor._openCameraModal(0);

  assert.equal(nodes["#camera-modal-title"].textContent, "Edit Camera");
  assert.equal(nodes["#camera-modal-save"].textContent, "Update");
  assert.equal(nodes["#camera-modal-light-entity"].value, "light.porch");
  assert.equal(nodes["#camera-modal-light-icon"].value, "mdi:coach-lamp");
  assert.equal(nodes["#camera-modal-light-entity-2"].value, "light.driveway");
  assert.equal(
    nodes["#camera-modal-light-icon-2"].value,
    "mdi:light-flood-down",
  );
  assert.equal(editor._cameraModalLightEnabled, true);
  assert.equal(editor._cameraModalSecondLightEnabled, true);
  assert.equal(modalClasses.has("hidden"), false);
});

test("Grid order editor uses isolated draggable tiles and dynamic groups of four", () => {
  const source = fs.readFileSync(
    new URL("../src/editor/FrigateViewCardEditor.js", import.meta.url),
    "utf8",
  );

  assert.match(source, /data-grid-order-mode="default"/);
  assert.match(source, /data-grid-order-mode="custom"/);
  assert.match(source, /class="grid-order-custom camera-group-fields"/);
  assert.match(source, /index % 4 === 0/);
  assert.match(source, /Grid \$\{Math\.floor\(index \/ 4\) \+ 1\}/);
  assert.match(source, /data-grid-order-exclude=/);
  assert.match(source, /data-grid-order-include=/);
  assert.match(source, /ICONS\.gridExclude/);
  assert.match(source, /ICONS\.gridInclude/);
  assert.match(source, /grid-order-action--exclude/);
  assert.match(source, /grid-order-action--include/);
  assert.match(source, /this\._wireGridOrderControls\(\)/);
  assert.match(source, /drop-target-before/);
  assert.match(source, /drop-target-after/);
});

test("draggable config tiles support before, replace, and after drop zones", () => {
  const row = {
    getBoundingClientRect: () => ({ top: 100, height: 100 }),
  };
  assert.equal(resolveCameraRowDropPlacement({ clientY: 110 }, row), "before");
  assert.equal(resolveCameraRowDropPlacement({ clientY: 150 }, row), "replace");
  assert.equal(resolveCameraRowDropPlacement({ clientY: 190 }, row), "after");

  const values = ["A", "B", "C", "D"];
  assert.deepEqual(reorderItemsForDrop(values, 0, 2, "before"), [
    "B",
    "A",
    "C",
    "D",
  ]);
  assert.deepEqual(reorderItemsForDrop(values, 0, 2, "replace"), [
    "B",
    "C",
    "A",
    "D",
  ]);
  assert.deepEqual(reorderItemsForDrop(values, 3, 1, "after"), [
    "A",
    "B",
    "D",
    "C",
  ]);
});

test("Grid order edits mark the editor dirty and publish a preview draft", () => {
  const editor = new FrigateViewCardEditor();
  const calls = [];
  editor._config = {
    cameras: [
      { entity: "camera.front" },
      { entity: "camera.driveway" },
    ],
  };
  editor._render = () => calls.push("render-editor");
  editor._homeAssistantConfig = () => ({ type: "custom:frigate-view-card" });
  editor._markHomeAssistantDirty = () => calls.push("mark-dirty");
  editor._emitPreviewDraft = () => calls.push("preview-draft");

  editor._commitGridOrder({
    mode: "custom",
    included: ["camera.driveway", "camera.front"],
    excluded: [],
  });

  assert.deepEqual(editor._config.grid_order, {
    mode: "custom",
    included: ["camera.driveway", "camera.front"],
    excluded: [],
  });
  assert.deepEqual(calls, [
    "render-editor",
    "preview-draft",
    "mark-dirty",
  ]);
});

test("theme color pickers match the exact active mobile surface defaults", () => {
  const editor = new FrigateViewCardEditor();
  let resolvedMobileBackground = "#e6e6e6";
  editor._resolveColorToHex = (value) =>
    String(value).startsWith("#") ? value : resolvedMobileBackground;

  editor._hass = { themes: { darkMode: false } };
  assert.equal(editor._themeDefaultHex("--c-bg-mobile"), "#e6e6e6");
  assert.equal(editor._themeDefaultHex("--c-bg-mobile-list"), "#f0f0f0");
  assert.equal(editor._themeDefaultHex("--c-bg-list"), "#f0f0f0");
  assert.equal(editor._themeDefaultHex("--c-bg-cam-btn"), "#f0f0f0");

  resolvedMobileBackground = "#202020";
  editor._hass = { themes: { darkMode: true } };
  assert.equal(editor._themeDefaultHex("--c-bg-mobile"), "#202020");
  assert.equal(editor._themeDefaultHex("--c-bg-mobile-list"), "#181818");
  assert.equal(editor._themeDefaultHex("--c-bg-list"), "#181818");
  assert.equal(editor._themeDefaultHex("--c-bg-cam-btn"), "#181818");

  resolvedMobileBackground = "#24384c";
  editor._hass = {
    themes: {
      darkMode: true,
      theme: "Midnight Slate",
    },
  };
  assert.equal(editor._themeDefaultHex("--c-bg-mobile-list"), "#24384c");
  assert.equal(editor._themeDefaultHex("--c-bg-list"), "#24384c");
  assert.equal(editor._themeDefaultHex("--c-bg-cam-btn"), "#24384c");
});

test("Navigation Tabs Background picker matches its adaptive surface", () => {
  const editor = new FrigateViewCardEditor();
  editor._resolveColorToHex = (value, fallback) => {
    if (value === "var(--primary-background-color)") return "#222222";
    if (value === "var(--secondary-background-color)") return "#eeeeee";
    return fallback;
  };

  editor._hass = { themes: { darkMode: false } };
  assert.equal(
    editor._themeDefaultHex("--c-bg-tabs-holder", "light"),
    "#eeeeee",
  );
  assert.equal(
    editor._themeDefaultHex("--c-bg-tabs-holder", "dark"),
    "#222222",
  );

  editor._hass = {
    themes: {
      darkMode: false,
      theme: "Custom Theme",
      themes: { "Custom Theme": {} },
    },
  };
  assert.equal(
    editor._themeDefaultHex("--c-bg-tabs-holder", "light"),
    "#222222",
  );
});

test("Primary Dark picker matches the derived custom HA theme color", () => {
  const editor = new FrigateViewCardEditor();
  editor._resolveColorToHex = (value, fallback) => {
    if (value === "var(--primary-color)") return "#6699cc";
    if (value === "var(--dark-primary-color)") return "#224466";
    return fallback;
  };
  editor._hass = {
    themes: {
      darkMode: false,
      theme: "Incomplete Theme",
      themes: {
        "Incomplete Theme": {
          "primary-color": "#6699cc",
        },
        "Complete Theme": {
          "primary-color": "#6699cc",
          "dark-primary-color": "#224466",
        },
        "Mode Theme": {
          "primary-color": "#6699cc",
          modes: {
            dark: { "dark-primary-color": "#224466" },
          },
        },
      },
    },
  };

  assert.equal(editor._themeDefaultHex("--c-primary-d"), "#4d7399");

  editor._hass.themes.theme = "Complete Theme";
  assert.equal(editor._themeDefaultHex("--c-primary-d"), "#224466");

  editor._hass.themes.theme = "Mode Theme";
  assert.equal(editor._themeDefaultHex("--c-primary-d", "light"), "#4d7399");
  assert.equal(editor._themeDefaultHex("--c-primary-d", "dark"), "#224466");
});

test("camera modal closes for document clicks outside its card", () => {
  const editor = new FrigateViewCardEditor();
  const insideControl = {};
  const outsideControl = {};
  const modalCard = {
    contains: (node) => node === insideControl,
  };
  const modal = {
    classList: { contains: () => false },
    querySelector: (selector) =>
      selector === ".cam-modal-card" ? modalCard : null,
  };
  editor.querySelector = (selector) =>
    selector === "#camera-modal" ? modal : null;
  let closeCount = 0;
  editor._closeCameraModal = () => {
    closeCount += 1;
  };

  editor._handleCameraModalDocumentClick({
    target: insideControl,
    composedPath: () => [insideControl, modalCard, modal],
  });
  assert.equal(closeCount, 0);

  editor._handleCameraModalDocumentClick({
    target: outsideControl,
    composedPath: () => [outsideControl],
  });
  assert.equal(closeCount, 1);

  const source = fs.readFileSync(
    new URL("../src/editor/FrigateViewCardEditor.js", import.meta.url),
    "utf8",
  );
  assert.match(
    source,
    /document\.addEventListener\([\s\S]*?"click",[\s\S]*?this\._onCameraModalDocumentClick,[\s\S]*?true,[\s\S]*?\);/,
  );
  assert.match(
    source,
    /document\.removeEventListener\([\s\S]*?"click",[\s\S]*?this\._onCameraModalDocumentClick,[\s\S]*?true,[\s\S]*?\);/,
  );
});

test("camera selector outside clicks dismiss the dropdown before the modal", () => {
  const editor = new FrigateViewCardEditor();
  const selector = { id: "camera-modal-entity", nodeType: 1 };
  const outside = { nodeType: 1 };
  const modalCard = {
    contains: (node) => node === selector,
  };
  const modal = {
    classList: { contains: () => false },
    querySelector: () => modalCard,
  };
  editor.querySelector = (query) =>
    query === "#camera-modal" ? modal : null;
  let closeCount = 0;
  editor._closeCameraModal = () => {
    closeCount += 1;
  };

  editor._handleCameraModalDocumentClick({
    target: selector,
    composedPath: () => [selector, modalCard, modal],
  });
  assert.equal(editor._cameraModalSelectorDismissPending, true);

  const dropdownDismissClick = {
    target: outside,
    composedPath: () => [outside],
  };
  editor._handleCameraModalDocumentClick(dropdownDismissClick);
  assert.equal(closeCount, 0);
  assert.equal(editor._cameraModalSelectorDismissPending, false);
  assert.equal(editor._cameraModalSuppressedClickEvent, dropdownDismissClick);

  editor._handleCameraModalDocumentClick({
    target: outside,
    composedPath: () => [outside],
  });
  assert.equal(closeCount, 1);
});

test("camera PTZ editor removes speed tuning and uses the simplified copy", () => {
  const source = fs.readFileSync(
    new URL("../src/editor/FrigateViewCardEditor.js", import.meta.url),
    "utf8",
  );

  assert.match(
    source,
    /Adds pan and tilt controls when supported\./,
  );
  assert.doesNotMatch(source, /camera-modal-ptz-speed/);
  assert.doesNotMatch(source, /Move Speed/);
  assert.match(source, /PTZ Control Rotation/);
  assert.match(source, /At 90°, Up sends Left./);
  assert.match(source, /name: "camera-modal-ptz-rotation"/);
});

test("camera PTZ editor reads a supported directional rotation", () => {
  const editor = new FrigateViewCardEditor();
  editor.querySelector = (selector) =>
    selector === '[name="camera-modal-ptz-rotation"]:checked'
      ? { value: "270" }
      : null;

  assert.equal(editor._cameraModalPtzRotationValue(), 270);
});

test("camera modal close control uses the shared button class and close icon", () => {
  const source = fs.readFileSync(
    new URL("../src/editor/FrigateViewCardEditor.js", import.meta.url),
    "utf8",
  );

  assert.match(
    source,
    /id="camera-modal-close" class="round-btn"[^>]*>\$\{ICONS\.close\}<\/button>/,
  );
  assert.doesNotMatch(source, /id="camera-modal-close"[^>]*>x<\/button>/);
  assert.match(
    source,
    /class="cam-modal-card camera-modal-card"[^>]*aria-labelledby="camera-modal-title"/,
  );
  assert.match(source, /id="camera-modal-title">Add Camera<\/div>/);
  assert.doesNotMatch(
    source,
    /<span class="cam-modal-label">Camera<\/span>\s*<ha-selector id="camera-modal-entity">/,
  );
  assert.match(source, />Camera Source<\/span>/);
  assert.match(source, />Camera Settings<\/span>/);
  assert.match(source, />Linked Lights<\/span>/);
  assert.match(source, />Camera Controls<\/span>/);
  assert.match(
    source,
    /Frigate groups activity into reviews that may contain alerts, detections, or both\. Enable this to show every review in the Alerts tab; disable it to show alerts only\./,
  );
  assert.match(
    source,
    /\.cam-modal-section-heading\{[^}]*border:1px solid[^}]*background:var\(--editor-secondary-bg\)/,
  );
  assert.match(
    source,
    /\$\{physicalCameraCount\} of \$\{MAX_CAMERAS\} cameras configured/,
  );
  assert.match(
    source,
    /value: "frigate_go2rtc", label: "Frigate go2rtc \(default\)"/,
  );
  assert.match(
    source,
    /value: "ha_direct", label: "Home Assistant"/,
  );
  assert.match(
    source,
    /Requires the Home Assistant Frigate integration\./,
  );
  assert.match(
    source,
    /<dialog id="standalone-landing-modal" class="cam-modal-card cam-confirm-card standalone-landing-dialog"/,
  );
  assert.match(source, /\.standalone-landing-dialog::backdrop/);
  assert.match(source, /id="standalone-landing-page"/);
  assert.match(source, /id="camera-modal-add-secondary"/);
  assert.match(
    source,
    /<details id="camera-modal-secondary-help" class="camera-group-help">\s*<summary>What is a second camera\?<\/summary>/,
  );
  assert.match(
    source,
    /if \(help\) help\.hidden = enabled;/,
  );
  assert.match(
    source,
    /if \(save\) save\.textContent = index == null \? "Add" : "Update";/,
  );
  assert.match(source, /id="camera-modal-secondary-entity"/);
  assert.match(source, /Side by Side/);
  assert.match(source, /Stacked/);
  assert.match(
    source,
    /Only the main camera provides PTZ and two-way talk/,
  );
});

test("camera modal scrolls inside the available editor overlay", () => {
  const source = fs.readFileSync(
    new URL("../src/editor/FrigateViewCardEditor.js", import.meta.url),
    "utf8",
  );

  assert.match(
    source,
    /\.cam-modal\{[^}]*align-items:flex-start;[^}]*overflow:auto;[^}]*overscroll-behavior:contain;[^}]*z-index:10000;/,
  );
  assert.match(
    source,
    /\.cam-modal-card\{[^}]*width:min\(640px,100%\);[^}]*margin:auto;[^}]*overflow:visible;/,
  );
  assert.doesNotMatch(
    source,
    /\.cam-modal-card\{[^}]*max-height:calc\(100dvh - 24px\)/,
  );
});

test("ordinary editor changes mark dirty and publish an internal preview", () => {
  const source = fs.readFileSync(
    new URL("../src/editor/FrigateViewCardEditor.js", import.meta.url),
    "utf8",
  );

  assert.match(
    source,
    /const update = \(previewRouteIntent = null\) =>\s*this\._u\(\{\s*dispatch: false,\s*preview: true,/,
  );
  assert.match(
    source,
    /const updateVisual = \(\) => update\(\);/,
  );
  assert.match(source, /const EDITOR_TEXT_PREVIEW_DELAY_MS = 200;/);
  assert.match(source, /const textPreviewSelectors = \["#title", "#subtitle"\];/);
  assert.match(
    source,
    /if \(preview && \(configChanged \|\| previewRouteIntent\)\) \{/,
  );
  assert.match(source, /this\._markHomeAssistantDirty\(/);
  assert.doesNotMatch(source, /this\._u\(\{ dispatch: true \}\);/);
  assert.match(
    source,
    /#ha_dashboard_swipe_navigation_owner"\)\s*\?\.addEventListener\("change", \(\) => \{\s*update\(\);\s*this\._render\(\);/,
  );
  assert.doesNotMatch(source, /_haDraftAnnounced/);
});

test("Home Assistant dirty context tracks drafts without config-changed", () => {
  const editor = new FrigateViewCardEditor();
  const updates = [];
  const reminderText = { textContent: "" };
  const reminder = {
    hidden: true,
    dataset: {},
    setAttribute() {},
    querySelector: () => reminderText,
  };
  editor._haDirtyBaselineConfig = { title: "Original" };
  editor._haDirtyBaselineSig = JSON.stringify(editor._haDirtyBaselineConfig);
  editor.querySelector = (selector) =>
    selector === "#config-save-reminder" ? reminder : null;
  editor._haDirtyStateContext = {
    setState: (config, key) => updates.push({ config, key }),
  };

  editor._seedHomeAssistantDirtyState();
  editor._markHomeAssistantDirty({ title: "Changed" });

  assert.equal(editor._hasConfigDraft, true);
  assert.equal(reminder.hidden, false);
  assert.deepEqual(updates, [
    {
      config: { title: "Original" },
      key: "frigate-view-card-editor",
    },
    {
      config: { title: "Changed" },
      key: "frigate-view-card-editor",
    },
  ]);

  editor._markHomeAssistantDirty({ title: "Original" });
  assert.equal(editor._hasConfigDraft, false);
  assert.equal(reminder.hidden, false);
  assert.equal(reminder.dataset.configSaveState, "clean");
  assert.equal(reminderText.textContent, "No pending changes.");
  assert.deepEqual(updates.at(-1), {
    config: { title: "Original" },
    key: "frigate-view-card-editor",
  });
});

test("save-state reminder reserves normal-flow space in clean and dirty states", () => {
  const editor = new FrigateViewCardEditor();
  const reminderText = { textContent: "" };
  const reminder = {
    hidden: true,
    dataset: {},
    setAttribute() {},
    querySelector: () => reminderText,
  };
  editor.querySelector = (selector) =>
    selector === "#config-save-reminder" ? reminder : null;

  editor._hasConfigDraft = true;
  editor._syncConfigSaveReminder();
  assert.equal(reminder.hidden, false);
  assert.equal(reminder.dataset.configSaveState, "dirty");
  assert.match(reminderText.textContent, /Unsaved changes/);

  editor._hasConfigDraft = false;
  editor._syncConfigSaveReminder();
  assert.equal(reminder.hidden, false);
  assert.equal(reminder.dataset.configSaveState, "clean");
  assert.equal(reminderText.textContent, "No pending changes.");

  const source = fs.readFileSync(
    new URL("../src/editor/FrigateViewCardEditor.js", import.meta.url),
    "utf8",
  );
  assert.match(
    source,
    /id="config-save-reminder" class="config-save-reminder" role="status" aria-live="polite"/,
  );
  assert.match(
    source,
    /\.config-save-reminder\{[^}]*width:100%;[^}]*pointer-events:none;/,
  );
  assert.match(
    source,
    /\.config-save-reminder\{position:sticky;top:8px;z-index:20;[^}]*background:color-mix\(in srgb,var\(--success-color,#2e7d32\) 14%,transparent\);[^}]*backdrop-filter:blur\(8px\);/,
  );
  assert.match(
    source,
    /\.config-save-reminder\[data-config-save-state="dirty"\]/,
  );
  assert.doesNotMatch(source, /\.config-save-reminder\[hidden\]/);
  assert.match(
    source,
    /<div class="ed-wrap">\s*\$\{configSaveReminderMarkup\}\s*\$\{settingsPanelsMarkup\}/,
  );
});

test("older Home Assistant editors fall back to config-changed for Save state", () => {
  const editor = new FrigateViewCardEditor();
  const dispatched = [];
  editor._haDirtyBaselineConfig = { title: "Original" };
  editor._haDirtyBaselineSig = JSON.stringify(editor._haDirtyBaselineConfig);
  editor._findHomeAssistantEditCardDialog = () => ({});
  editor._requestHomeAssistantDirtyStateContext = () => {};
  editor._dispatch = (config) => dispatched.push(config);

  editor._markHomeAssistantDirty({ title: "Changed" });

  assert.deepEqual(dispatched, [{ title: "Changed" }]);
});

test("Save commits the final draft directly to the Home Assistant dialog", () => {
  const editor = new FrigateViewCardEditor();
  const finalConfig = {
    type: "custom:frigate-view-card",
    title: "Final title",
  };
  const dirtyUpdates = [];
  const dialog = {
    _cardConfig: { type: "custom:frigate-view-card", title: "Original" },
    _updateDirtyState: (config) => dirtyUpdates.push(config),
  };
  editor._homeAssistantConfig = () => finalConfig;
  editor._findHomeAssistantEditCardDialog = () => dialog;
  editor._dispatch = () => assert.fail("Save should not use config-changed");

  editor._commitDraftToHomeAssistantDialog();

  assert.equal(dialog._cardConfig, finalConfig);
  assert.deepEqual(dirtyUpdates, [finalConfig]);
});

test("editor dispatch announces a draft through config-changed", () => {
  const editor = new FrigateViewCardEditor();
  const events = [];
  const originalCustomEvent = globalThis.CustomEvent;
  globalThis.CustomEvent = class {
    constructor(type, init) {
      this.type = type;
      this.detail = init?.detail;
      this.bubbles = init?.bubbles === true;
      this.composed = init?.composed === true;
    }
  };
  editor._config = { cameras: [], title: "Updated" };
  editor._getCams = () => [];
  editor.querySelector = (selector) =>
    selector === "#title" ? { value: "Updated" } : null;
  editor.querySelectorAll = () => [];
  editor._syncHiddenTabsDraftFromConfig = () => {};
  editor._themeDefaultHexMap = () => ({});
  editor.dispatchEvent = (event) => events.push(event);

  try {
    editor._dispatch();

    assert.equal(events.length, 1);
    assert.equal(events[0].type, "config-changed");
    assert.equal(events[0].bubbles, true);
    assert.equal(events[0].composed, true);
    assert.equal(events[0].detail.config.title, "Updated");
  } finally {
    if (originalCustomEvent === undefined) {
      delete globalThis.CustomEvent;
    } else {
      globalThis.CustomEvent = originalCustomEvent;
    }
  }
});

test("editor version badge follows the HACS update entity", () => {
  const editor = new FrigateViewCardEditor();
  const badge = { dataset: {} };
  const status = { textContent: "" };
  const link = { dataset: {}, hidden: true };
  editor._hass = {
    states: {
      "update.frigateview_card_update": {
        state: "on",
        attributes: {
          title: "FrigateView Card",
          latest_version: "1.2.0",
        },
      },
    },
  };
  editor.querySelector = (selector) =>
    ({
      "#card-version-status": badge,
      "#card-version-update-status": status,
      "#card-version-update-link": link,
    })[selector] || null;

  editor._syncCardVersionStatus();

  assert.equal(badge.dataset.updateStatus, "available");
  assert.equal(status.textContent, "Update available: v1.2.0");
  assert.equal(link.hidden, false);
  assert.equal(link.dataset.entityId, "update.frigateview_card_update");
});

test("editor shows compact environment status items without requesting a manifest", () => {
  const editor = new FrigateViewCardEditor();
  let websocketRequests = 0;
  const homeAssistantText = { textContent: "" };
  const frigateText = { textContent: "" };
  const homeAssistantNotice = {
    hidden: true,
    dataset: {},
    querySelector: () => homeAssistantText,
  };
  const frigateNotice = {
    hidden: true,
    dataset: {},
    querySelector: () => frigateText,
  };
  editor._hass = {
    config: { version: "2026.8.4", components: ["frigate"] },
    callWS: async () => {
      websocketRequests += 1;
    },
  };
  editor.querySelector = (selector) =>
    ({
      "[data-home-assistant-version-notice]": homeAssistantNotice,
      "[data-frigate-integration-status]": frigateNotice,
    })[selector] || null;

  editor._syncEnvironmentSupportNotices();

  assert.equal(homeAssistantNotice.hidden, false);
  assert.equal(
    homeAssistantText.textContent,
    "Home Assistant 2026.8.4 is below the recommended 2026.9.0.",
  );
  assert.equal(frigateNotice.hidden, false);
  assert.equal(frigateNotice.dataset.supportStatus, "current");
  assert.equal(
    frigateText.textContent,
    "Frigate integration is installed.",
  );
  assert.equal(websocketRequests, 0);

  editor._hass.config.version = "2026.9.0";
  editor._syncEnvironmentSupportNotices();
  assert.equal(homeAssistantNotice.hidden, false);
  assert.equal(homeAssistantNotice.dataset.supportStatus, "current");
  assert.equal(
    homeAssistantText.textContent,
    "Home Assistant 2026.9.0",
  );
  assert.equal(frigateNotice.hidden, false);
  assert.equal(frigateNotice.dataset.supportStatus, "current");
  assert.equal(
    frigateText.textContent,
    "Frigate integration is installed.",
  );

  editor._hass.config.components = [];
  editor._syncEnvironmentSupportNotices();
  assert.equal(frigateNotice.hidden, false);
  assert.equal(frigateNotice.dataset.supportStatus, "error");
  assert.equal(
    frigateText.textContent,
    "Frigate integration is not installed in Home Assistant.",
  );
});

test("editor update link opens the Home Assistant update entity dialog", () => {
  const editor = new FrigateViewCardEditor();
  const events = [];
  const originalCustomEvent = globalThis.CustomEvent;
  globalThis.CustomEvent = class {
    constructor(type, init) {
      this.type = type;
      this.detail = init?.detail;
      this.bubbles = init?.bubbles === true;
      this.composed = init?.composed === true;
    }
  };
  editor.dispatchEvent = (event) => events.push(event);

  try {
    editor._openCardUpdateDialog("update.frigateview_card_update");

    assert.equal(events[0].type, "hass-more-info");
    assert.deepEqual(events[0].detail, {
      entityId: "update.frigateview_card_update",
    });
    assert.equal(events[0].bubbles, true);
    assert.equal(events[0].composed, true);
  } finally {
    if (originalCustomEvent === undefined) {
      delete globalThis.CustomEvent;
    } else {
      globalThis.CustomEvent = originalCustomEvent;
    }
  }
});

test("HA-direct camera PTZ detection uses Frigate capability information", async () => {
  const editor = new FrigateViewCardEditor();
  const requests = [];
  const states = [];
  editor._hass = {
    states: {
      "camera.driveway": {
        attributes: { client_id: "frigate-main", camera_name: "driveway" },
      },
    },
    callWS: async (request) => {
      requests.push(request);
      return { features: ["pt"] };
    },
  };
  editor._cameraModalEntityValue = () => "camera.driveway";
  editor._cameraModalConnectionTypeValue = () => "ha_direct";
  editor._syncCameraModalPtzVisibility = (state) => states.push(state);

  await editor._refreshCameraModalPtzSupport();

  assert.deepEqual(requests, [
    {
      type: "frigate/ptz/info",
      instance_id: "frigate-main",
      camera: "driveway",
    },
  ]);
  assert.equal(states.at(-1).supported, true);
  assert.equal(states.at(-1).sourceType, "ha_direct");
});

test("HA-direct two-way talk is offered only when HA reports WebRTC playback", async () => {
  const editor = new FrigateViewCardEditor();
  const requests = [];
  const states = [];
  editor._hass = {
    callWS: async (request) => {
      requests.push(request);
      return { frontend_stream_types: ["hls", "web_rtc"] };
    },
  };
  editor._cameraModalEntityValue = () => "camera.driveway";
  editor._cameraModalConnectionTypeValue = () => "ha_direct";
  editor._syncCameraModalTwoWayTalkVisibility = (state) => states.push(state);

  await editor._refreshCameraModalTwoWayTalkSupport();

  assert.deepEqual(requests, [
    {
      type: "camera/capabilities",
      entity_id: "camera.driveway",
    },
  ]);
  assert.equal(states.at(-1).supported, true);
  assert.equal(states.at(-1).sourceType, "ha_direct");
});

test("editor capability caches retain resolved and in-flight requests across unrelated hass updates", async () => {
  const editor = new FrigateViewCardEditor();
  const requests = [];
  let resolvePtzRequest;
  const callWS = (request) => {
    requests.push(request);
    return new Promise((resolve) => {
      resolvePtzRequest = resolve;
    });
  };
  const cameraState = {
    attributes: { client_id: "frigate-main", camera_name: "driveway" },
  };
  editor.hass = {
    states: {
      "camera.driveway": cameraState,
      "sensor.unrelated": { state: "one", attributes: {} },
    },
    callWS,
  };

  const first = editor._fetchPtzCapabilityForEntity("camera.driveway");
  const second = editor._fetchPtzCapabilityForEntity("camera.driveway");
  assert.equal(requests.length, 1);
  resolvePtzRequest({ features: ["pt"] });
  assert.deepEqual(await Promise.all([first, second]), [
    { features: ["pt"] },
    { features: ["pt"] },
  ]);

  editor.hass = {
    states: {
      "camera.driveway": { attributes: { ...cameraState.attributes } },
      "sensor.unrelated": { state: "two", attributes: {} },
    },
    callWS,
  };

  assert.deepEqual(
    await editor._fetchPtzCapabilityForEntity("camera.driveway"),
    { features: ["pt"] },
  );
  assert.equal(requests.length, 1);
});

test("editor capability caches invalidate only the camera with changed relevant attributes", async () => {
  const editor = new FrigateViewCardEditor();
  const requests = [];
  const callWS = async (request) => {
    requests.push(request);
    if (request.type === "camera/capabilities") {
      return { frontend_stream_types: ["hls", "web_rtc"] };
    }
    return { camera: request.camera, features: ["pt"] };
  };
  editor.hass = {
    states: {
      "camera.driveway": {
        attributes: {
          client_id: "frigate-main",
          camera_name: "driveway",
          supported_features: 1,
        },
      },
      "camera.porch": {
        attributes: {
          client_id: "frigate-main",
          camera_name: "porch",
          supported_features: 1,
        },
      },
    },
    callWS,
  };

  await Promise.all([
    editor._fetchPtzCapabilityForEntity("camera.driveway"),
    editor._fetchPtzCapabilityForEntity("camera.porch"),
    editor._fetchHaCameraCapabilitiesForEntity("camera.driveway"),
    editor._fetchHaCameraCapabilitiesForEntity("camera.porch"),
  ]);
  assert.equal(requests.length, 4);

  editor.hass = {
    states: {
      "camera.driveway": {
        attributes: {
          client_id: "frigate-main",
          camera_name: "driveway_hd",
          supported_features: 3,
        },
      },
      "camera.porch": {
        attributes: {
          client_id: "frigate-main",
          camera_name: "porch",
          supported_features: 1,
        },
      },
    },
    callWS,
  };

  await Promise.all([
    editor._fetchPtzCapabilityForEntity("camera.porch"),
    editor._fetchHaCameraCapabilitiesForEntity("camera.porch"),
  ]);
  assert.equal(requests.length, 4);

  await Promise.all([
    editor._fetchPtzCapabilityForEntity("camera.driveway"),
    editor._fetchHaCameraCapabilitiesForEntity("camera.driveway"),
  ]);
  assert.equal(requests.length, 6);
  assert.equal(requests.at(-2).camera, "driveway_hd");
});

test("editor go2rtc metadata cache survives unrelated hass updates and expires by TTL", async () => {
  const editor = new FrigateViewCardEditor();
  const originalFetch = globalThis.fetch;
  const originalWindow = globalThis.window;
  const requests = [];
  const fetches = [];
  let now = 1_000;
  editor._editorCapabilityCacheNow = () => now;
  const callWS = async (request) => {
    requests.push(request);
    return { path: `${request.path}&authSig=test` };
  };
  globalThis.window = { location: { origin: "https://example.test" } };
  globalThis.fetch = async (url) => {
    fetches.push(url);
    return {
      ok: true,
      json: async () => ({ request: fetches.length }),
    };
  };

  try {
    editor.hass = {
      states: {
        "camera.driveway": {
          attributes: { client_id: "frigate-main", camera_name: "driveway" },
        },
      },
      callWS,
    };
    assert.deepEqual(
      await editor._fetchGo2RtcStreamMetadataForEntity("camera.driveway"),
      { request: 1 },
    );

    now += 29_999;
    editor.hass = {
      states: {
        "camera.driveway": {
          attributes: { client_id: "frigate-main", camera_name: "driveway" },
        },
        "sensor.unrelated": { state: "changed", attributes: {} },
      },
      callWS,
    };
    assert.deepEqual(
      await editor._fetchGo2RtcStreamMetadataForEntity("camera.driveway"),
      { request: 1 },
    );
    assert.equal(requests.length, 1);
    assert.equal(fetches.length, 1);

    now += 2;
    assert.deepEqual(
      await editor._fetchGo2RtcStreamMetadataForEntity("camera.driveway"),
      { request: 2 },
    );
    assert.equal(requests.length, 2);
    assert.equal(fetches.length, 2);
  } finally {
    if (originalFetch === undefined) delete globalThis.fetch;
    else globalThis.fetch = originalFetch;
    if (originalWindow === undefined) delete globalThis.window;
    else globalThis.window = originalWindow;
  }
});

test("editor reuses its sorted Frigate entity list until membership changes", () => {
  const editor = new FrigateViewCardEditor();
  editor.hass = {
    states: {
      "camera.porch": {
        attributes: { client_id: "frigate-main", camera_name: "porch" },
      },
      "camera.driveway": {
        attributes: { client_id: "frigate-main", camera_name: "driveway" },
      },
    },
  };
  const first = editor._frigateEntities();
  assert.deepEqual(first, ["camera.driveway", "camera.porch"]);

  editor.hass = {
    states: {
      "sensor.unrelated": { state: "changed", attributes: {} },
      "camera.driveway": {
        attributes: { client_id: "frigate-main", camera_name: "driveway" },
      },
      "camera.porch": {
        attributes: { client_id: "frigate-main", camera_name: "porch" },
      },
    },
  };
  const unchanged = editor._frigateEntities();
  assert.equal(unchanged, first);

  editor.hass = {
    states: {
      ...editor._hass.states,
      "camera.backyard": {
        attributes: { client_id: "frigate-main", camera_name: "backyard" },
      },
    },
  };
  const changed = editor._frigateEntities();
  assert.notEqual(changed, first);
  assert.deepEqual(changed, [
    "camera.backyard",
    "camera.driveway",
    "camera.porch",
  ]);
});

test("disabling standalone Card View requires a top-layer replacement landing page", () => {
  const editor = new FrigateViewCardEditor();
  const modal = {
    open: false,
    showModal() {
      this.open = true;
    },
    close() {
      this.open = false;
    },
  };
  const nodes = {
    "#standalone-landing-modal": modal,
    "#standalone-landing-page": {
      value: "",
      dataset: {},
      focus: () => {},
    },
    "#standalone-landing-helper": { textContent: "" },
    "#card_view_standalone": { checked: false },
    "#landing_page": { value: "card-view", dataset: { value: "card-view" } },
  };
  editor._config = {
    card_view_page_enabled: true,
    card_view_standalone: true,
    wide_view_page_enabled: true,
  };
  editor.querySelector = (selector) => nodes[selector] || null;

  assert.deepEqual(editor._standaloneLandingPageRoutes(), [
    "single-view",
    "mobile-view",
    "wide-view",
    "card-view",
  ]);
  editor._openStandaloneLandingPageModal();
  assert.equal(modal.open, true);
  assert.equal(nodes["#standalone-landing-page"].value, "single-view");

  nodes["#standalone-landing-page"].value = "wide-view";
  nodes["#standalone-landing-page"].dataset.value = "wide-view";
  let updateOptions = null;
  editor._u = (options) => {
    updateOptions = options;
  };
  editor._confirmStandaloneLandingPage();

  assert.equal(nodes["#landing_page"].value, "wide-view");
  assert.equal(nodes["#landing_page"].dataset.value, "wide-view");
  assert.equal(modal.open, false);
  assert.deepEqual(updateOptions, {
    dispatch: false,
    preview: true,
    previewRouteIntent: {
      type: "navigate",
      pageId: "wide-view",
    },
  });
});

test("cancelling the replacement landing page keeps standalone mode enabled", () => {
  const editor = new FrigateViewCardEditor();
  const toggle = { checked: false, dataset: {} };
  editor._standaloneLandingModalOpen = true;
  const modal = {
    open: true,
    close() {
      this.open = false;
    },
  };
  editor.querySelector = (selector) => {
    if (selector === "#card_view_standalone") return toggle;
    if (selector === "#standalone-landing-modal") return modal;
    return null;
  };

  editor._closeStandaloneLandingPageModal();

  assert.equal(toggle.checked, true);
  assert.equal(modal.open, false);
  assert.equal(editor._standaloneLandingModalOpen, false);
});

test("an unsaved standalone toggle restores its prior landing page without a modal", () => {
  const editor = new FrigateViewCardEditor();
  const listeners = {};
  const toggle = {
    checked: false,
    dataset: {},
    addEventListener: (eventName, handler) => {
      listeners[eventName] = handler;
    },
  };
  const landingPage = {
    value: "wide-view",
    dataset: { value: "wide-view" },
  };
  editor._config = {
    card_view_standalone: false,
    landing_page: "wide-view",
  };
  editor._standaloneDraftPreviousLandingPage = null;
  editor.querySelector = (selector) => {
    if (selector === "#card_view_standalone") return toggle;
    if (selector === "#landing_page") return landingPage;
    return null;
  };
  let modalOpenCount = 0;
  editor._openStandaloneLandingPageModal = () => {
    modalOpenCount += 1;
  };
  const routeIntents = [];
  editor._wireStandaloneLandingPageTransition((routeIntent) => {
    routeIntents.push(routeIntent);
  });

  toggle.checked = true;
  listeners["value-changed"]({ detail: { value: true } });
  listeners.change({ detail: { value: true } });

  assert.equal(editor._standaloneDraftPreviousLandingPage, "wide-view");
  assert.deepEqual(routeIntents, [
    { type: "enter-card-view-standalone" },
  ]);

  editor._config.card_view_standalone = true;
  landingPage.value = "card-view";
  landingPage.dataset.value = "card-view";
  toggle.checked = false;
  listeners["value-changed"]({ detail: { value: false } });

  assert.equal(modalOpenCount, 0);
  assert.equal(landingPage.value, "wide-view");
  assert.equal(landingPage.dataset.value, "wide-view");
  assert.deepEqual(routeIntents, [
    { type: "enter-card-view-standalone" },
    { type: "revert-card-view-standalone-draft" },
  ]);
});

test("disabling saved standalone mode still opens the landing-page modal", () => {
  const editor = new FrigateViewCardEditor();
  const listeners = {};
  const toggle = {
    checked: true,
    dataset: {},
    addEventListener: (eventName, handler) => {
      listeners[eventName] = handler;
    },
  };
  editor._config = { card_view_standalone: true };
  editor._standaloneDraftPreviousLandingPage = null;
  editor.querySelector = (selector) =>
    selector === "#card_view_standalone" ? toggle : null;
  let modalOpenCount = 0;
  editor._openStandaloneLandingPageModal = () => {
    modalOpenCount += 1;
  };
  editor._wireStandaloneLandingPageTransition(() => {});

  toggle.checked = false;
  listeners["value-changed"]({ detail: { value: false } });

  assert.equal(modalOpenCount, 1);
});

test("editor accordion panels share one compact settings container", () => {
  const source = fs.readFileSync(
    new URL("../src/editor/FrigateViewCardEditor.js", import.meta.url),
    "utf8",
  );
  const layoutStart = source.indexOf("const layoutPanelContent = `");
  const layoutEnd = source.indexOf(
    "const slideshowPanelContent = `",
    layoutStart,
  );
  const layoutMarkup = source.slice(layoutStart, layoutEnd);
  const openingDivs = layoutMarkup.match(/<div\b/g) || [];
  const closingDivs = layoutMarkup.match(/<\/div>/g) || [];

  assert.equal(openingDivs.length, closingDivs.length);
  assert.match(
    source,
    /\.settings-container\{display:flex;flex-direction:column;gap:6px;\}/,
  );
  assert.match(
    source,
    /--c-bg-mobile:var\(--ha-color-fill-neutral-normal-resting,var\(--wa-color-neutral-fill-normal,var\(--secondary-background-color\)\)\);/,
  );
  assert.match(
    source,
    /\.setting-title:hover,\.settings-panel\.active \.setting-title\{background:var\(--c-bg-mobile\);border-bottom-color:var\(--c-border2, var\(--editor-border\)\);\}/,
  );
  assert.match(
    source,
    /\.setting-title\{[\s\S]*?font-family:inherit;[\s\S]*?font-size:14px;[\s\S]*?font-weight:700;[\s\S]*?line-height:1\.2;/,
  );
  assert.match(
    source,
    /\.setting-title h3\{margin:0;font:inherit;line-height:inherit;color:inherit;\}/,
  );
  assert.match(
    source,
    /\.setting-content > \.section:first-child\{border-top:none;\}/,
  );
  assert.match(
    source,
    /\.settings-panel\.active \.setting-content\{\s*max-height:none;/,
  );
  assert.match(source, /data-panel-more title="Show more options"/);
  assert.match(source, />More<\/span>\s*\$\{ICONS\.chevron\}/);
  assert.match(source, /const hasHiddenOptions = Number\(contentRect\.bottom\) > viewportBottom \+ 3;/);
  assert.doesNotMatch(source, /nextToggle\?\.scrollIntoView/);
  assert.doesNotMatch(source, /\.settings-panel\.active \.setting-content\{[^}]*overflow-y:auto;/);
  assert.doesNotMatch(source, /max-height:1400px/);
  assert.doesNotMatch(source, /data-theme-mode-option/);
  assert.doesNotMatch(source, /theme-mode-editor/);
  assert.match(source, /data-theme-reset="\$\{key\}"/);
  assert.match(
    source,
    /\.cam-row\{[\s\S]*?border:1px solid var\(--c-border2, var\(--editor-border\)\);[\s\S]*?border-inline-start:4px solid var\(--c-primary, var\(--editor-primary\)\);[\s\S]*?background:var\(--c-bg-mobile, var\(--editor-secondary-bg\)\);/,
  );
  assert.match(
    source,
    /\.cam-row\.drop-target\{background:var\(--c-bg-main, var\(--editor-card-bg\)\);border-color:var\(--c-primary, var\(--editor-primary\)\);box-shadow:0 0 0 2px var\(--c-primary, var\(--editor-primary\)\);\}/,
  );
  assert.match(
    source,
    /\.cam-drag:hover,\.cam-drag:active\{background:var\(--c-primary, var\(--editor-primary\)\);border-color:var\(--c-primary, var\(--editor-primary\)\);color:var\(--c-text-rev, var\(--editor-card-bg\)\);\}/,
  );
  assert.match(
    source,
    /const cameraPanelContent = `[\s\S]*?<div class="section">/,
  );
  assert.doesNotMatch(
    source,
    /class="section" style="border-top:none;padding-top:0"/,
  );
});

test("editor accordion More cue is visible only while options remain below", () => {
  const editor = new FrigateViewCardEditor();
  const more = { hidden: true };
  const slot = { style: {} };
  let contentBottom = 900;
  const content = {
    getBoundingClientRect: () => ({
      top: 100,
      bottom: contentBottom,
      height: contentBottom - 100,
    }),
    querySelector: (selector) =>
      selector === "[data-panel-more]"
        ? more
        : selector === ".settings-more-slot"
          ? slot
          : null,
  };
  const panel = {
    classList: { contains: (name) => name === "active" },
    querySelector: (selector) =>
      selector === ".setting-content" ? content : null,
  };
  const viewport = {
    getBoundingClientRect: () => ({ bottom: 800 }),
  };

  editor._syncSettingsPanelMoreState(panel, viewport);
  assert.equal(more.hidden, false);
  assert.equal(slot.style.top, "662px");

  contentBottom = 790;
  editor._syncSettingsPanelMoreState(panel, viewport);
  assert.equal(more.hidden, true);
});

test("editor accordion finds the config scroller before a panel overflows", () => {
  const editor = new FrigateViewCardEditor();
  const originalGetComputedStyle = globalThis.getComputedStyle;
  const dashboardScroller = {
    clientHeight: 900,
    getBoundingClientRect: () => ({ bottom: 900 }),
  };
  const configScroller = {
    clientHeight: 600,
    scrollHeight: 600,
    getBoundingClientRect: () => ({ bottom: 700 }),
  };
  Object.defineProperty(editor, "ownerDocument", {
    configurable: true,
    value: {
      body: dashboardScroller,
      documentElement: dashboardScroller,
      scrollingElement: dashboardScroller,
    },
  });
  globalThis.getComputedStyle = (node) => ({
    overflowY: node === configScroller ? "auto" : "visible",
  });

  try {
    assert.equal(
      editor._settingsPanelScrollContainer([
        {},
        configScroller,
        dashboardScroller,
      ]),
      configScroller,
    );
  } finally {
    globalThis.getComputedStyle = originalGetComputedStyle;
  }
});

test("editor accordion More scrolls only enough to reveal the next panel", () => {
  const editor = new FrigateViewCardEditor();
  const scrollCalls = [];
  const viewport = {
    getBoundingClientRect: () => ({ bottom: 800 }),
    scrollBy: (options) => scrollCalls.push(options),
  };
  const content = {
    getBoundingClientRect: () => ({ bottom: 1200 }),
  };
  const nextToggle = {
    getBoundingClientRect: () => ({ bottom: 950 }),
  };
  const panel = {
    querySelector: (selector) =>
      selector === ".setting-content" ? content : null,
  };
  const nextPanel = {
    querySelector: (selector) =>
      selector === "[data-panel-toggle]" ? nextToggle : null,
  };

  assert.equal(
    editor._scrollSettingsPanelToRemainingContent(
      panel,
      [panel, nextPanel],
      viewport,
    ),
    true,
  );
  assert.deepEqual(scrollCalls, [{ top: 158, behavior: "smooth" }]);
});
