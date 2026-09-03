import { test } from "node:test";
import assert from "node:assert/strict";

import {
  EDITOR_PREVIEW_ROUTE_INTENTS,
  EditorPreviewContextController,
} from "../src/features/editor-preview/context.ctrl.js";

const withGlobals = (overrides, fn) => {
  const originalWindow = global.window;
  const originalDocument = global.document;
  const originalMutationObserver = global.MutationObserver;
  global.window = overrides.window;
  global.document = overrides.document;
  global.MutationObserver = overrides.MutationObserver;
  try {
    fn();
  } finally {
    global.window = originalWindow;
    global.document = originalDocument;
    global.MutationObserver = originalMutationObserver;
  }
};

const makeNode = (tagName, options = {}) => ({
  tagName,
  parentNode: options.parentNode || null,
  host: options.host || null,
  getRootNode: options.getRootNode || (() => ({ host: null })),
});

test("isEditorPreviewContext walks through shadow hosts", () => {
  const preview = makeNode("HUI-CARD-PREVIEW");
  const wrapper = makeNode("DIV", { parentNode: preview });
  const host = makeNode("FRIGATE-VIEW-CARD", {
    getRootNode: () => ({ host: wrapper }),
  });
  const controller = new EditorPreviewContextController(host);

  assert.equal(controller.isEditorPreviewContext(), true);
  assert.equal(controller.isPreviewContext(), true);
});

test("isCardPickerPreviewContext detects card picker hosts", () => {
  const picker = makeNode("HUI-CARD-PICKER");
  const host = makeNode("FRIGATE-VIEW-CARD", { parentNode: picker });
  const controller = new EditorPreviewContextController(host);

  assert.equal(controller.isCardPickerPreviewContext(), true);
  assert.equal(controller.isPreviewContext(), true);
});

test("renderCardPickerDemo paints an isolated presentation surface", () => {
  const picker = makeNode("HUI-CARD-PICKER");
  const hostClasses = [];
  const cardClasses = [];
  const nodes = {
    "#card": {
      classList: { add: (className) => cardClasses.push(className) },
    },
    "#engine": { innerHTML: "Connecting…" },
    "#stream-fallback": {
      hidden: true,
      innerHTML: "",
      removeAttribute: () => {},
    },
    "#browse": { style: { display: "none" } },
    "#browse-head": { style: { display: "none" } },
    "#browse-head-label": { textContent: "" },
    "#list": { innerHTML: "Loading…" },
    "#info-title": { textContent: "" },
    "#tl-range": { textContent: "" },
    "#stream-type": { textContent: "" },
    "#alert-count": { textContent: "" },
    "#on-lbl": { textContent: "" },
    "#on-dot": { style: { color: "" } },
  };
  const host = makeNode("FRIGATE-VIEW-CARD", { parentNode: picker });
  host.classList = {
    toggle: (className, enabled) => hostClasses.push([className, enabled]),
  };
  host.shadowRoot = {
    querySelector: (selector) => nodes[selector] || null,
  };
  const controller = new EditorPreviewContextController(host);

  assert.equal(controller.renderCardPickerDemo(), true);
  assert.deepEqual(hostClasses, [["card-picker-demo-host", true]]);
  assert.deepEqual(cardClasses, ["card-picker-demo"]);
  assert.match(
    nodes["#stream-fallback"].innerHTML,
    /FrigateView preview branding/,
  );
  assert.equal(nodes["#stream-fallback"].hidden, false);
  assert.equal(nodes["#browse"].style.display, "flex");
  assert.equal(nodes["#browse-head"].style.display, "flex");
  assert.equal(nodes["#browse-head-label"].textContent, "Recent Alerts");
  assert.equal(
    nodes["#list"].innerHTML.match(/card-picker-demo-alert"/g)?.length,
    2,
  );
  assert.equal(nodes["#info-title"].textContent, "FrigateView");
  assert.equal(nodes["#tl-range"].textContent, "Demo Camera");
  assert.equal(nodes["#stream-type"].textContent, "Demo");
  assert.equal(nodes["#alert-count"].textContent, "2");
  assert.equal(nodes["#on-lbl"].textContent, "Online");
  assert.equal(nodes["#on-dot"].style.color, "var(--c-on)");
});

test("renderCardPickerDemo suppresses normal startup before the shell exists", () => {
  const picker = makeNode("HUI-CARD-PICKER");
  const host = makeNode("FRIGATE-VIEW-CARD", { parentNode: picker });
  host.classList = { toggle: () => {} };
  host.shadowRoot = { querySelector: () => null };
  const controller = new EditorPreviewContextController(host);

  assert.equal(controller.renderCardPickerDemo(), true);
});

test("isDashboardEditMode reads lovelace edit query flags", () => {
  const controller = new EditorPreviewContextController({});

  withGlobals(
    {
      window: {
        location: {
          href: "https://example.test/lovelace/test?dashboard_edit=true",
          origin: "https://example.test",
        },
      },
      document: { querySelector: () => null, body: null },
      MutationObserver: class {},
    },
    () => {
      assert.equal(controller.isDashboardEditMode(), true);
    },
  );
});

test("syncHassPreviewContext resumes live on preview exit", () => {
  const calls = [];
  const controller = new EditorPreviewContextController({
    _scheduleResumeLive: (reason) => calls.push(reason),
  });
  const states = [true, false];
  controller.isEditorPreviewContext = () => states.shift();

  assert.equal(controller.syncHassPreviewContext(), true);
  assert.equal(controller.syncHassPreviewContext(), false);
  assert.deepEqual(calls, ["hass-edit-exit"]);
});

test("editor config echoes update state without rebuilding preview content", () => {
  const preview = makeNode("HUI-CARD-PREVIEW");
  const calls = [];
  const host = makeNode("FRIGATE-VIEW-CARD", { parentNode: preview });
  host._cloneCardConfig = (config) => ({ ...config });
  host._syncVisualStyleToggles = () => calls.push("style-toggles");
  host._applyCardStyle = () => calls.push("card-style");
  host._wideViewPageController = {
    applyLayoutAndWideSyncForCard: () => calls.push("wide-layout"),
  };
  const controller = new EditorPreviewContextController(host);

  assert.equal(
    controller.applyConfigUpdate({
      previousConfig: { title: "Before", theme: "default" },
      nextConfig: { title: "After", theme: "default" },
    }),
    true,
  );
  assert.equal(host._config.title, "After");
  assert.equal(host._committedConfig.title, "After");
  assert.deepEqual(calls, []);
});

test("editor config echoes apply visual changes without rebuilding media", () => {
  const preview = makeNode("HUI-CARD-PREVIEW");
  const calls = [];
  const host = makeNode("FRIGATE-VIEW-CARD", { parentNode: preview });
  host._cloneCardConfig = (config) => ({ ...config });
  host._syncVisualStyleToggles = () => calls.push("style-toggles");
  host._applyCardStyle = () => calls.push("card-style");
  host._wideViewPageController = {
    applyLayoutAndWideSyncForCard: () => calls.push("wide-layout"),
  };
  const controller = new EditorPreviewContextController(host);

  assert.equal(
    controller.applyConfigUpdate({
      previousConfig: { theme: "default", rounded_corners: true },
      nextConfig: { theme: "custom", rounded_corners: false },
    }),
    true,
  );
  assert.deepEqual(calls, ["style-toggles", "card-style"]);
});

test("editor preview applies wide layout only when its width changes", () => {
  const preview = makeNode("HUI-CARD-PREVIEW");
  const calls = [];
  const host = makeNode("FRIGATE-VIEW-CARD", { parentNode: preview });
  host._cloneCardConfig = (config) => ({ ...config });
  host._syncVisualStyleToggles = () => calls.push("style-toggles");
  host._applyCardStyle = () => calls.push("card-style");
  host._wideViewPageController = {
    applyLayoutAndWideSyncForCard: () => calls.push("wide-layout"),
  };
  const controller = new EditorPreviewContextController(host);

  controller.applyConfigUpdate({
    previousConfig: { col_left_width_pct: 50 },
    nextConfig: { col_left_width_pct: 60 },
  });

  assert.deepEqual(calls, [
    "style-toggles",
    "card-style",
    "wide-layout",
  ]);
});

test("startEditModeWatchdog resumes and kicks when state changes", () => {
  const calls = [];
  const timers = [];
  const originalSetInterval = global.setInterval;
  const originalClearInterval = global.clearInterval;
  global.setInterval = (fn) => {
    timers.push(fn);
    return fn;
  };
  global.clearInterval = () => {};
  try {
    const controller = new EditorPreviewContextController({
      isConnected: true,
      _scheduleResumeLive: (reason) => calls.push(["resume", reason]),
      _kickLiveIfStale: (force) => calls.push(["kick", force]),
    });
    const previewStates = [true, false];
    const dialogStates = [true, false];
    const dashboardStates = [false, true];
    controller.isEditorPreviewContext = () => previewStates.shift();
    controller.isCardEditorDialogOpen = () => dialogStates.shift();
    controller.isDashboardEditMode = () => dashboardStates.shift();

    controller.startEditModeWatchdog();
    timers[0]();

    assert.deepEqual(calls, [
      ["resume", "watchdog-dialog-close"],
      ["resume", "watchdog-edit-exit"],
      ["resume", "watchdog-dashboard-edit-on"],
      ["kick", true],
    ]);
  } finally {
    global.setInterval = originalSetInterval;
    global.clearInterval = originalClearInterval;
  }
});

test("startEditorDialogCloseObserver resumes when the dialog closes", () => {
  const calls = [];
  let observerCallback = null;
  class FakeMutationObserver {
    constructor(callback) {
      observerCallback = callback;
    }

    observe() {}

    disconnect() {}
  }

  const controller = new EditorPreviewContextController({
    _scheduleResumeLive: (reason) => calls.push(reason),
  });
  const dialogStates = [true, false];
  controller.isCardEditorDialogOpen = () => dialogStates.shift();

  withGlobals(
    {
      window: {
        MutationObserver: FakeMutationObserver,
        getComputedStyle: () => ({ display: "block", visibility: "visible" }),
      },
      document: {
        body: {},
        querySelector: () => null,
      },
      MutationObserver: FakeMutationObserver,
    },
    () => {
      controller.startEditorDialogCloseObserver();
      observerCallback();
    },
  );

  assert.deepEqual(calls, ["card-editor-close"]);
});

test("standalone preview routing returns to the page active before the draft", () => {
  const calls = [];
  const host = {
    _pageId: "wide-view",
    _pageNavigationController: {
      navigateToPageRoute: (pageId, context) => {
        calls.push([pageId, context]);
        host._pageId = pageId;
        return pageId;
      },
    },
  };
  const controller = new EditorPreviewContextController(host);

  assert.equal(
    controller.applyRouteIntent({
      type: EDITOR_PREVIEW_ROUTE_INTENTS.enterStandalone,
    }),
    "card-view",
  );
  assert.equal(
    controller.applyRouteIntent({
      type: EDITOR_PREVIEW_ROUTE_INTENTS.revertStandaloneDraft,
    }),
    "wide-view",
  );
  assert.deepEqual(calls, [
    ["card-view", { source: "editor-preview-route-intent" }],
    ["wide-view", { source: "editor-preview-route-intent" }],
  ]);
});

test("committing a standalone preview keeps Card View and clears its return route", () => {
  const calls = [];
  const host = {
    _pageId: "single-view",
    _pageNavigationController: {
      navigateToPageRoute: (pageId) => {
        calls.push(pageId);
        host._pageId = pageId;
        return pageId;
      },
    },
  };
  const controller = new EditorPreviewContextController(host);

  controller.applyRouteIntent({
    type: EDITOR_PREVIEW_ROUTE_INTENTS.enterStandalone,
  });
  controller.applyRouteIntent({
    type: EDITOR_PREVIEW_ROUTE_INTENTS.commit,
  });
  controller.applyRouteIntent({
    type: EDITOR_PREVIEW_ROUTE_INTENTS.reset,
  });

  assert.deepEqual(calls, ["card-view"]);
  assert.equal(host._pageId, "card-view");
});

test("discarding a modal landing-page draft restores its prior preview page", () => {
  const calls = [];
  const host = {
    _pageId: "card-view",
    _pageNavigationController: {
      navigateToPageRoute: (pageId) => {
        calls.push(pageId);
        host._pageId = pageId;
        return pageId;
      },
    },
  };
  const controller = new EditorPreviewContextController(host);

  controller.applyRouteIntent({
    type: EDITOR_PREVIEW_ROUTE_INTENTS.navigate,
    pageId: "wide-view",
  });
  controller.applyRouteIntent({
    type: EDITOR_PREVIEW_ROUTE_INTENTS.reset,
  });

  assert.deepEqual(calls, ["wide-view", "card-view"]);
});
