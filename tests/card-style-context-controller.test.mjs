import { test } from "node:test";
import assert from "node:assert/strict";

import { CardStyleContextController } from "../src/features/card-style/context.ctrl.js";

const withGlobals = (overrides, fn) => {
  const originalDocument = global.document;
  const originalGetComputedStyle = global.getComputedStyle;
  global.document = overrides.document;
  global.getComputedStyle = overrides.getComputedStyle;
  try {
    fn();
  } finally {
    global.document = originalDocument;
    global.getComputedStyle = originalGetComputedStyle;
  }
};

test("cardStateClassNames reflects disabled toggles and preview state", () => {
  const controller = new CardStyleContextController({
    _config: { shadows: false, borders: true, rounded_corners: false },
    _isPreviewPageActive: () => true,
  });

  assert.equal(
    controller.cardStateClassNames(),
    "shadows-off corners-off preview-active",
  );
});

test("syncVisualStyleToggles updates card classes and host outer styles", () => {
  const toggles = [];
  const card = {
    classList: {
      toggle: (className, value) => toggles.push([className, value]),
    },
  };
  const host = {
    _config: {
      shadows: false,
      borders: true,
      rounded_corners: false,
      outer_shadows: true,
    },
    shadowRoot: {
      querySelector: () => card,
    },
    style: {},
  };
  const controller = new CardStyleContextController(host);
  controller.resolveCardTokenForHost = (target, property) =>
    property === "box-shadow" ? "0 0 2px #000" : "12px";

  controller.syncVisualStyleToggles();

  assert.deepEqual(toggles, [
    ["shadows-off", true],
    ["borders-off", false],
    ["corners-off", true],
  ]);
  assert.equal(host.style.boxShadow, "0 0 2px #000");
  assert.equal(host.style.borderRadius, "12px");
});

test("applyTightMargins updates parent spacing and sections row gap", () => {
  const cardToggles = [];
  const sectionsStyle = {
    setProperty: (name, value) => cardToggles.push(["set", name, value]),
    removeProperty: (name) => cardToggles.push(["remove", name]),
  };
  const sectionsView = {
    tagName: "HUI-SECTIONS-VIEW",
    style: sectionsStyle,
    shadowRoot: { children: [] },
    parentNode: null,
    host: null,
  };
  const parentElement = {
    style: { height: "", margin: "8px", padding: "6px" },
  };
  const host = {
    _config: { tight_margins: true },
    _parentOrigStyle: { margin: "10px", padding: "12px" },
    _isPreviewContext: () => false,
    shadowRoot: {
      querySelector: () => ({
        classList: {
          toggle: (className, value) =>
            cardToggles.push(["toggle", className, value]),
        },
      }),
    },
    parentElement,
    tagName: "FRIGATE-VIEW-CARD",
    parentNode: sectionsView,
    host: null,
  };
  const controller = new CardStyleContextController(host);
  controller.isPanelView = () => false;

  controller.applyTightMargins();

  assert.equal(parentElement.style.height, "100%");
  assert.equal(parentElement.style.margin, "0");
  assert.equal(parentElement.style.padding, "0");
  assert.deepEqual(cardToggles, [
    ["toggle", "tight-margins", true],
    ["set", "--ha-view-sections-row-gap", "0px"],
  ]);
});

test("resolveCardTokenForHost measures resolved token values", () => {
  const probe = {
    style: {
      cssText: "",
      setProperty: () => {},
    },
    remove: () => {},
  };
  const card = {
    appendChild: (node) => {
      assert.equal(node, probe);
    },
  };
  const controller = new CardStyleContextController({});

  withGlobals(
    {
      document: {
        createElement: () => probe,
      },
      getComputedStyle: () => ({
        getPropertyValue: () => " 24px ",
      }),
    },
    () => {
      assert.equal(
        controller.resolveCardTokenForHost(card, "border-radius", "var(--x)"),
        "24px",
      );
    },
  );
});
