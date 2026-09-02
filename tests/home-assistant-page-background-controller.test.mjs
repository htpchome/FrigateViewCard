import { test } from "node:test";
import assert from "node:assert/strict";

import {
  HomeAssistantPageBackgroundController,
  resolveHomeAssistantPageBackgroundTarget,
  resolveHomeAssistantPageBackgroundTargets,
} from "../src/integrations/home-assistant/page-background.ctrl.js";

const createStyle = (initial = {}) => {
  const values = new Map();
  const priorities = new Map();
  for (const [property, entry] of Object.entries(initial)) {
    const value = typeof entry === "string" ? entry : entry.value;
    const priority = typeof entry === "string" ? "" : entry.priority || "";
    values.set(property, value);
    priorities.set(property, priority);
  }
  return {
    getPropertyValue: (property) => values.get(property) || "",
    getPropertyPriority: (property) => priorities.get(property) || "",
    setProperty: (property, value, priority = "") => {
      values.set(property, value);
      priorities.set(property, priority);
    },
    removeProperty: (property) => {
      values.delete(property);
      priorities.delete(property);
    },
  };
};

const createHarness = ({ mobileDevice = true, mobileView = true } = {}) => {
  const target = {
    style: createStyle({
      "background-color": "rgb(1, 2, 3)",
      "background-image": {
        value: "url(original.png)",
        priority: "important",
      },
    }),
  };
  const surface = {};
  const viewBackground = {
    tagName: "HUI-VIEW-BACKGROUND",
    style: createStyle({
      "background-color": "rgb(4, 5, 6)",
    }),
  };
  const huiRoot = {
    tagName: "HUI-ROOT",
    shadowRoot: {
      querySelector: (selector) =>
        selector === "#view"
          ? target
          : selector === "hui-view-background"
            ? viewBackground
            : null,
    },
  };
  const host = {
    isConnected: true,
    mobileDevice,
    mobileView,
    _isLikelyMobileClient: () => host.mobileDevice,
    _isMobileViewPageActive: () => host.mobileView,
    shadowRoot: {
      querySelector: (selector) =>
        selector === ".card.mobile-view-active .mobile-container"
          ? surface
          : null,
    },
  };
  const controller = new HomeAssistantPageBackgroundController(host, {
    findHuiRoot: () => huiRoot,
    getComputedStyleFn: () => ({
      backgroundColor: "rgb(20, 30, 40)",
    }),
  });
  return { controller, host, huiRoot, target, viewBackground };
};

test("mobile-view applies its resolved background to both HA page layers", () => {
  const { controller, target, viewBackground } = createHarness();

  assert.equal(controller.sync(), true);
  assert.equal(
    target.style.getPropertyValue("background-color"),
    "rgb(20, 30, 40)",
  );
  assert.equal(
    target.style.getPropertyPriority("background-color"),
    "important",
  );
  assert.equal(target.style.getPropertyValue("background-image"), "none");
  assert.equal(
    target.style.getPropertyPriority("background-image"),
    "important",
  );
  assert.equal(
    target.style.getPropertyValue("--lovelace-background"),
    "rgb(20, 30, 40)",
  );
  assert.equal(
    viewBackground.style.getPropertyValue("background-color"),
    "rgb(20, 30, 40)",
  );
  assert.equal(
    viewBackground.style.getPropertyValue("--lovelace-background"),
    "rgb(20, 30, 40)",
  );
});

test("leaving mobile-view restores both HA page layers", () => {
  const { controller, host, target, viewBackground } = createHarness();
  controller.sync();

  host.mobileView = false;
  assert.equal(controller.sync(), false);
  assert.equal(
    target.style.getPropertyValue("background-color"),
    "rgb(1, 2, 3)",
  );
  assert.equal(target.style.getPropertyPriority("background-color"), "");
  assert.equal(
    target.style.getPropertyValue("background-image"),
    "url(original.png)",
  );
  assert.equal(
    target.style.getPropertyPriority("background-image"),
    "important",
  );
  assert.equal(target.style.getPropertyValue("--lovelace-background"), "");
  assert.equal(
    viewBackground.style.getPropertyValue("background-color"),
    "rgb(4, 5, 6)",
  );
  assert.equal(
    viewBackground.style.getPropertyValue("--lovelace-background"),
    "",
  );
});

test("desktop devices do not change the Home Assistant page", () => {
  const { controller, target } = createHarness({ mobileDevice: false });

  assert.equal(controller.sync(), false);
  assert.equal(
    target.style.getPropertyValue("background-color"),
    "rgb(1, 2, 3)",
  );
});

test("default computed-style resolver preserves the browser receiver", () => {
  const previousGetComputedStyle = globalThis.getComputedStyle;
  const target = { style: createStyle() };
  const surface = {};
  const host = {
    isConnected: true,
    _isLikelyMobileClient: () => true,
    _isMobileViewPageActive: () => true,
    shadowRoot: {
      querySelector: () => surface,
    },
  };
  const huiRoot = {
    shadowRoot: {
      querySelector: (selector) => (selector === "#view" ? target : null),
    },
  };

  globalThis.getComputedStyle = function (element) {
    assert.equal(this, globalThis);
    assert.equal(element, surface);
    return { backgroundColor: "rgb(20, 30, 40)" };
  };

  try {
    const controller = new HomeAssistantPageBackgroundController(host, {
      findHuiRoot: () => huiRoot,
    });

    assert.equal(controller.sync(), true);
  } finally {
    if (previousGetComputedStyle) {
      globalThis.getComputedStyle = previousGetComputedStyle;
    } else {
      delete globalThis.getComputedStyle;
    }
  }
});

test("cleanup preserves a newer background written by another owner", () => {
  const { controller, target } = createHarness();
  controller.sync();
  target.style.setProperty(
    "background-color",
    "rgb(90, 80, 70)",
    "important",
  );

  controller.disconnect();

  assert.equal(
    target.style.getPropertyValue("background-color"),
    "rgb(90, 80, 70)",
  );
  assert.equal(
    target.style.getPropertyValue("background-image"),
    "url(original.png)",
  );
});

test("page background target resolution fails safely without HA's view node", () => {
  assert.equal(resolveHomeAssistantPageBackgroundTarget(null), null);
  assert.equal(
    resolveHomeAssistantPageBackgroundTarget({
      shadowRoot: { querySelector: () => ({ style: {} }) },
    }),
    null,
  );
});

test("page background target resolution includes hui-view-background", () => {
  const { huiRoot, target, viewBackground } = createHarness();

  assert.deepEqual(
    resolveHomeAssistantPageBackgroundTargets(huiRoot),
    [target, viewBackground],
  );
});

test("page background target resolution crosses hui-view-container shadow DOM", () => {
  const target = { style: createStyle() };
  const viewBackground = { style: createStyle() };
  const viewContainer = {
    shadowRoot: {
      querySelector: (selector) =>
        selector === "hui-view-background" ? viewBackground : null,
    },
  };
  const huiRoot = {
    shadowRoot: {
      querySelector: (selector) =>
        selector === "#view"
          ? target
          : selector === "hui-view-container"
            ? viewContainer
            : null,
    },
  };

  assert.deepEqual(resolveHomeAssistantPageBackgroundTargets(huiRoot), [
    target,
    viewBackground,
  ]);
});
