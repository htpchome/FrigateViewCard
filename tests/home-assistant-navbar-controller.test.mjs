import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

import {
  findCurrentHomeAssistantLovelaceRoot,
  findHomeAssistantLovelaceRoot,
  HomeAssistantNavbarController,
  resolveHomeAssistantDashboardKey,
  resolveHomeAssistantNavbarTargets,
  resolveHomeAssistantNavbarStyleText,
} from "../src/integrations/home-assistant/navbar.ctrl.js";

const controllerSource = fs.readFileSync(
  new URL(
    "../src/integrations/home-assistant/navbar.ctrl.js",
    import.meta.url,
  ),
  "utf8",
);

const createStyle = (initial = {}) => {
  const values = new Map();
  const priorities = new Map();
  for (const [property, entry] of Object.entries(initial)) {
    const value = typeof entry === "string" ? entry : entry.value;
    const priority = typeof entry === "string" ? "" : entry.priority || "";
    values.set(property, value);
    if (priority) priorities.set(property, priority);
  }
  return {
    getPropertyValue: (property) => values.get(property) || "",
    getPropertyPriority: (property) => priorities.get(property) || "",
    setProperty: (property, value, priority = "") => {
      values.set(property, String(value));
      if (priority) priorities.set(property, priority);
      else priorities.delete(property);
    },
    removeProperty: (property) => {
      const previous = values.get(property) || "";
      values.delete(property);
      priorities.delete(property);
      return previous;
    },
  };
};

class FakeMutationObserver {
  static instances = [];

  constructor(callback) {
    this.callback = callback;
    this.observed = [];
    this.disconnectCount = 0;
    FakeMutationObserver.instances.push(this);
  }

  observe(target, options) {
    this.observed.push({ target, options });
  }

  disconnect() {
    this.disconnectCount += 1;
    this.observed = [];
  }

  trigger() {
    this.callback([], this);
  }
}

const createStyleElement = () => ({
  attributes: new Map(),
  parentNode: null,
  textContent: "",
  setAttribute(name, value) {
    this.attributes.set(name, value);
  },
});

const createTargets = ({
  documentRef,
  headerInitial = {},
  toolbarInitial = {},
  viewInitial = {},
} = {}) => {
  const toolbar = { style: createStyle(toolbarInitial) };
  const children = [];
  const header = {
    ownerDocument: documentRef,
    style: createStyle(headerInitial),
    querySelector: (selector) => (selector === ".toolbar" ? toolbar : null),
    appendChild: (child) => {
      child.parentNode = header;
      children.push(child);
      return child;
    },
    removeChild: (child) => {
      const index = children.indexOf(child);
      if (index >= 0) children.splice(index, 1);
      child.parentNode = null;
      return child;
    },
  };
  const view = { style: createStyle(viewInitial) };
  return { header, toolbar, view, children };
};

const createWindow = (innerHeight = 844) => {
  const listeners = new Map();
  return {
    innerHeight,
    location: { pathname: "/lovelace/mobile" },
    addEventListener: (type, listener) => {
      const entries = listeners.get(type) || new Set();
      entries.add(listener);
      listeners.set(type, entries);
    },
    removeEventListener: (type, listener) => {
      listeners.get(type)?.delete(listener);
    },
    emit: (type) => {
      for (const listener of listeners.get(type) || []) listener();
    },
    listenerCount: (type) => listeners.get(type)?.size || 0,
  };
};

const createHarness = ({
  dashboardScope = false,
  isIOS = true,
  mobileDevice = true,
  moveBottom = true,
  queueMicrotaskFn = (callback) => callback(),
  rotateFullscreen = true,
  stackTabs = false,
  viewPaddingBottom = "34px",
  viewPaddingTop = "103px",
  viewportHeight = 844,
} = {}) => {
  FakeMutationObserver.instances = [];
  const windowRef = createWindow(viewportHeight);
  const documentRef = {
    createElement: () => createStyleElement(),
    querySelector: () => homeAssistant,
  };
  let currentTargets = createTargets({ documentRef });
  const shadowRoot = {
    querySelector: (selector) => {
      if (selector === ".header") return currentTargets?.header || null;
      if (selector === "#view") return currentTargets?.view || null;
      return null;
    },
  };
  const huiRoot = {
    tagName: "HUI-ROOT",
    route: { prefix: "/lovelace" },
    shadowRoot,
  };
  let currentHuiRoot = huiRoot;
  const panelShadowRoot = {
    querySelector: (selector) =>
      selector === "hui-root" ? currentHuiRoot : null,
  };
  const panel = { shadowRoot: panelShadowRoot };
  const mainRoot = {
    querySelector: (selector) =>
      selector === "ha-panel-lovelace" ? panel : null,
  };
  const main = { shadowRoot: mainRoot };
  const homeAssistant = {
    shadowRoot: {
      querySelector: (selector) =>
        selector === "home-assistant-main" ? main : null,
    },
  };
  const boundary = { host: huiRoot };
  const host = {
    isConnected: true,
    parentNode: boundary,
    _config: {
      mobile_view_ha_navbar_bottom: moveBottom,
      mobile_view_ha_navbar_stack_tabs: stackTabs,
      mobile_view_ha_navbar_dashboard: dashboardScope,
      mobile_view_rotate_to_fullscreen: rotateFullscreen,
    },
    _mobileDevice: mobileDevice,
    _mobileViewActive: true,
    _isLikelyMobileClient: () => host._mobileDevice,
    _isMobileViewPageActive: () => host._mobileViewActive,
  };
  const controller = new HomeAssistantNavbarController(host, {
    MutationObserverCtor: FakeMutationObserver,
    documentRef,
    getComputedStyleFn: (element) => {
      if (element !== currentTargets?.view) return null;
      return {
        paddingBottom: viewPaddingBottom,
        paddingTop: viewPaddingTop,
      };
    },
    windowRef,
    isIOS,
    queueMicrotaskFn,
    findCurrentHuiRoot: () => currentHuiRoot,
  });
  return {
    controller,
    documentRef,
    host,
    huiRoot,
    mainRoot,
    shadowRoot,
    windowRef,
    getCurrentHuiRoot: () => currentHuiRoot,
    setCurrentHuiRoot: (nextRoot) => {
      currentHuiRoot = nextRoot;
    },
    getTargets: () => currentTargets,
    setTargets: (nextTargets) => {
      currentTargets = nextTargets;
    },
  };
};

test("Home Assistant navbar integration uses no polling, URL parameter, browser persistence, or width breakpoints", () => {
  assert.doesNotMatch(controllerSource, /setInterval|setTimeout/);
  assert.doesNotMatch(controllerSource, /localStorage|sessionStorage/);
  assert.doesNotMatch(controllerSource, /location\.(?:search|href)/);
  assert.doesNotMatch(controllerSource, /innerWidth|matchMedia/);
});

test("Firefox-native microtask scheduling keeps the Window receiver", () => {
  let receiver = null;
  const h = createHarness({
    dashboardScope: true,
    queueMicrotaskFn: function (callback) {
      receiver = this;
      callback();
    },
  });
  h.controller.sync();
  h.windowRef.emit("location-changed");

  assert.equal(receiver, h.windowRef);
});

test("finds both the containing and current Lovelace roots", () => {
  const h = createHarness();

  assert.equal(findHomeAssistantLovelaceRoot(h.host), h.huiRoot);
  assert.equal(
    findCurrentHomeAssistantLovelaceRoot(h.documentRef),
    h.huiRoot,
  );
  assert.equal(
    resolveHomeAssistantDashboardKey(h.huiRoot, h.windowRef),
    "route:/lovelace",
  );
  assert.deepEqual(resolveHomeAssistantNavbarTargets(h.huiRoot), {
    root: h.shadowRoot,
    header: h.getTargets().header,
    toolbar: h.getTargets().toolbar,
    view: h.getTargets().view,
  });
});

test("dependent options cannot activate the navbar without the master toggle", () => {
  const h = createHarness({
    moveBottom: false,
    stackTabs: true,
    dashboardScope: true,
  });

  assert.equal(h.controller.sync(), false);
  assert.equal(h.controller.shouldMoveNavbarToBottom(), false);
  assert.equal(h.controller.isNavbarAtBottom(), false);
  assert.equal(h.controller.bottomNavbarExtraHeightPx(), 0);
  assert.equal(h.controller.shouldStackNavbarTabs(), false);
  assert.equal(h.getTargets().header.style.getPropertyValue("bottom"), "");
  assert.equal(
    h.getTargets().toolbar.style.getPropertyValue("border-top"),
    "",
  );
  assert.equal(
    h.getTargets().view.style.getPropertyValue("padding-bottom"),
    "",
  );
  assert.equal(h.getTargets().children.length, 0);
  assert.equal(h.windowRef.listenerCount("location-changed"), 0);
});

test("stacks icon-and-title tabs when the master toggle is enabled", () => {
  const h = createHarness({ moveBottom: true, stackTabs: true });

  assert.equal(h.controller.sync(), true);
  assert.equal(h.controller.shouldMoveNavbarToBottom(), true);
  assert.equal(h.controller.isNavbarAtBottom(), true);
  assert.equal(h.controller.bottomNavbarExtraHeightPx(), 10);
  assert.equal(h.controller.shouldStackNavbarTabs(), true);
  assert.equal(
    h.getTargets().header.style.getPropertyValue("bottom"),
    "0px",
  );
  assert.equal(h.getTargets().children.length, 1);
  const styleText = h.getTargets().children[0].textContent;
  assert.match(styleText, /ha-tab-group-tab\.icon-and-title::part\(base\)/);
  assert.match(styleText, /flex-direction: column !important/);
  assert.match(styleText, /font-size: var\(--ha-font-size-xs, 10px\)/);
  assert.match(styleText, /margin-inline-end: 0 !important/);
  assert.match(styleText, /border-block-start/);
  assert.match(styleText, /@media \(orientation: landscape\)/);

  h.host._config.mobile_view_ha_navbar_bottom = false;
  assert.equal(h.controller.sync(), false);
  assert.equal(h.controller.isNavbarAtBottom(), false);
  assert.equal(h.controller.bottomNavbarExtraHeightPx(), 0);
  assert.equal(h.getTargets().children.length, 0);
});

test("combines stacked labels with the bottom active-tab indicator", () => {
  const styleText = resolveHomeAssistantNavbarStyleText({
    moveBottom: true,
    stackTabs: true,
  });

  assert.match(styleText, /aria-selected="true"/);
  assert.match(styleText, /border-block-start/);
  assert.match(styleText, /icon-and-title/);
});

test("promotes the dashboard view above the relocated header in landscape", () => {
  const styleText = resolveHomeAssistantNavbarStyleText({
    moveBottom: true,
    promoteViewInLandscape: true,
  });

  assert.match(styleText, /@media \(orientation: landscape\)/);
  assert.match(styleText, /#view \{[\s\S]*?z-index: 2 !important;/);
  assert.match(styleText, /\.header \{[\s\S]*?z-index: 1 !important;/);
  assert.doesNotMatch(
    resolveHomeAssistantNavbarStyleText({ moveBottom: true }),
    /@media \(orientation: landscape\)/,
  );

  const disabled = createHarness({ rotateFullscreen: false });
  disabled.controller.sync();
  assert.doesNotMatch(
    disabled.getTargets().children[0].textContent,
    /@media \(orientation: landscape\)/,
  );
});

test("applies the proven bottom-header details and restores exact styles", () => {
  const h = createHarness({ isIOS: true });
  const targets = createTargets({
    documentRef: h.documentRef,
    headerInitial: {
      top: "6px",
      position: "sticky",
      "padding-top": "47px",
    },
    toolbarInitial: {
      "border-bottom": "2px solid red",
      height: "56px",
      "padding-top": "1px",
      "padding-bottom": "2px",
    },
    viewInitial: { "padding-bottom": "11px" },
  });
  h.setTargets(targets);

  assert.equal(h.controller.sync(), true);
  assert.equal(targets.header.style.getPropertyValue("top"), "auto");
  assert.equal(targets.header.style.getPropertyValue("bottom"), "0px");
  assert.equal(targets.header.style.getPropertyValue("position"), "fixed");
  assert.equal(targets.header.style.getPropertyValue("padding-top"), "0px");
  assert.equal(
    targets.header.style.getPropertyValue("padding-bottom"),
    "calc(var(--safe-area-inset-bottom, env(safe-area-inset-bottom, 0px)) * 0.25)",
  );
  assert.equal(
    targets.toolbar.style.getPropertyValue("border-top"),
    "1px solid var(--divider-color)",
  );
  assert.equal(
    targets.toolbar.style.getPropertyValue("border-bottom"),
    "none",
  );
  assert.equal(
    targets.toolbar.style.getPropertyValue("padding-top"),
    "5px",
  );
  assert.equal(
    targets.toolbar.style.getPropertyValue("box-sizing"),
    "border-box",
  );
  assert.equal(
    targets.toolbar.style.getPropertyValue("height"),
    "calc(var(--header-height, 56px) + 10px)",
  );
  assert.equal(
    targets.toolbar.style.getPropertyValue("padding-bottom"),
    "5px",
  );
  assert.equal(
    targets.view.style.getPropertyValue("padding-top"),
    "var(--safe-area-inset-top, env(safe-area-inset-top, 0px))",
  );
  assert.equal(
    targets.view.style.getPropertyValue("padding-bottom"),
    "calc(var(--header-height, 56px) + 10px + (var(--safe-area-inset-bottom, env(safe-area-inset-bottom, 0px)) * 0.25))",
  );
  assert.equal(targets.children.length, 1);
  assert.match(targets.children[0].textContent, /border-block-start/);

  h.host._mobileViewActive = false;
  assert.equal(h.controller.sync(), false);
  assert.equal(targets.header.style.getPropertyValue("top"), "6px");
  assert.equal(targets.header.style.getPropertyValue("bottom"), "");
  assert.equal(targets.header.style.getPropertyValue("position"), "sticky");
  assert.equal(
    targets.header.style.getPropertyValue("padding-top"),
    "47px",
  );
  assert.equal(targets.header.style.getPropertyValue("opacity"), "");
  assert.equal(targets.header.style.getPropertyValue("pointer-events"), "");
  assert.equal(targets.header.style.getPropertyValue("transition"), "");
  assert.equal(
    targets.toolbar.style.getPropertyValue("border-bottom"),
    "2px solid red",
  );
  assert.equal(
    targets.toolbar.style.getPropertyValue("padding-top"),
    "1px",
  );
  assert.equal(
    targets.toolbar.style.getPropertyValue("box-sizing"),
    "",
  );
  assert.equal(
    targets.toolbar.style.getPropertyValue("height"),
    "56px",
  );
  assert.equal(
    targets.toolbar.style.getPropertyValue("padding-bottom"),
    "2px",
  );
  assert.equal(targets.view.style.getPropertyValue("padding-bottom"), "11px");
  assert.equal(targets.children.length, 0);
});

test("measures the mobile Lovelace content area with either navbar position", () => {
  const top = createHarness({ moveBottom: false });
  assert.equal(top.controller.homeAssistantViewContentHeightPx(), 707);

  const bottom = createHarness({
    moveBottom: true,
    viewPaddingBottom: "74.5px",
    viewPaddingTop: "47px",
  });
  bottom.controller.sync();
  assert.equal(bottom.controller.homeAssistantViewContentHeightPx(), 722.5);

  top.host._mobileDevice = false;
  assert.equal(top.controller.homeAssistantViewContentHeightPx(), null);
});

test("is always gated by the card's mobile-device detection", () => {
  const h = createHarness({ mobileDevice: false, dashboardScope: true });

  assert.equal(h.controller.sync(), false);
  assert.equal(h.getTargets().header.style.getPropertyValue("bottom"), "");
  assert.equal(h.windowRef.listenerCount("location-changed"), 0);

  h.host._mobileDevice = true;
  assert.equal(h.controller.sync(), true);
  assert.equal(h.getTargets().header.style.getPropertyValue("bottom"), "0px");
});

test("watches the Lovelace subtree and reapplies to replaced header nodes", () => {
  const h = createHarness();
  h.controller.sync();
  const rootObserver = FakeMutationObserver.instances.find((observer) =>
    observer.observed.some(({ target }) => target === h.shadowRoot),
  );
  assert.ok(rootObserver);
  assert.deepEqual(rootObserver.observed, [
    {
      target: h.shadowRoot,
      options: { childList: true, subtree: true },
    },
  ]);

  const original = h.getTargets();
  const replacement = createTargets({ documentRef: h.documentRef });
  h.setTargets(replacement);
  rootObserver.trigger();

  assert.equal(original.header.style.getPropertyValue("bottom"), "");
  assert.equal(replacement.header.style.getPropertyValue("bottom"), "0px");
});

test("dashboard scope survives card disconnects and stays inside its dashboard", () => {
  const h = createHarness({ dashboardScope: true });
  assert.equal(h.controller.sync(), true);
  assert.equal(h.windowRef.listenerCount("location-changed"), 1);
  assert.ok(
    FakeMutationObserver.instances.some((observer) =>
      observer.observed.some(({ target }) => target === h.mainRoot),
    ),
  );

  h.host.isConnected = false;
  h.controller.disconnect();
  assert.equal(h.getTargets().header.style.getPropertyValue("bottom"), "0px");

  const replacementTargets = createTargets({ documentRef: h.documentRef });
  const replacementRoot = {
    tagName: "HUI-ROOT",
    route: { prefix: "/lovelace" },
    shadowRoot: {
      querySelector: (selector) => {
        if (selector === ".header") return replacementTargets.header;
        if (selector === "#view") return replacementTargets.view;
        return null;
      },
    },
  };
  h.setCurrentHuiRoot(replacementRoot);
  h.windowRef.emit("location-changed");
  assert.equal(h.getTargets().header.style.getPropertyValue("bottom"), "");
  assert.equal(
    replacementTargets.header.style.getPropertyValue("bottom"),
    "0px",
  );

  const otherDashboardTargets = createTargets({ documentRef: h.documentRef });
  h.setCurrentHuiRoot({
    tagName: "HUI-ROOT",
    route: { prefix: "/other-dashboard" },
    shadowRoot: {
      querySelector: (selector) => {
        if (selector === ".header") return otherDashboardTargets.header;
        if (selector === "#view") return otherDashboardTargets.view;
        return null;
      },
    },
  });
  h.windowRef.emit("location-changed");
  assert.equal(
    replacementTargets.header.style.getPropertyValue("bottom"),
    "",
  );
  assert.equal(
    otherDashboardTargets.header.style.getPropertyValue("bottom"),
    "",
  );

  h.controller.disconnect({ force: true });
  assert.equal(h.windowRef.listenerCount("location-changed"), 0);
});

test("fails closed when HA no longer exposes the expected targets", () => {
  const h = createHarness();
  h.setTargets({ header: null, view: null });

  assert.equal(h.controller.sync(), false);
  assert.doesNotThrow(() => h.controller.disconnect());
});

test("multiple enabled cards share ownership until the last card disconnects", () => {
  const h = createHarness();
  const secondHost = {
    ...h.host,
    _isLikelyMobileClient: () => true,
    _isMobileViewPageActive: () => true,
  };
  const second = new HomeAssistantNavbarController(secondHost, {
    MutationObserverCtor: FakeMutationObserver,
    documentRef: h.documentRef,
    windowRef: h.windowRef,
  });

  h.controller.sync();
  second.sync();
  h.controller.disconnect();
  assert.equal(h.getTargets().header.style.getPropertyValue("bottom"), "0px");

  second.disconnect();
  assert.equal(h.getTargets().header.style.getPropertyValue("bottom"), "");
});

test("cleanup does not overwrite a newer inline value from another owner", () => {
  const h = createHarness();
  h.controller.sync();
  h.getTargets().header.style.setProperty("bottom", "12px", "important");

  h.controller.disconnect();

  assert.equal(
    h.getTargets().header.style.getPropertyValue("bottom"),
    "12px",
  );
});
