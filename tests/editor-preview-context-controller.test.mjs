import { test } from "node:test";
import assert from "node:assert/strict";

import {
  buildEditorLiveHandoffKey,
  EDITOR_PREVIEW_ROUTE_INTENTS,
  EditorPreviewContextController,
} from "../src/features/editor-preview/context.ctrl.js";
import { CARD_NAME } from "../src/constants.js";
import { createLocalizationController } from "../src/features/localization/localization.ctrl.js";

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

const createListenerTarget = (properties = {}) => {
  const listeners = new Map();
  return {
    ...properties,
    addEventListener(type, listener) {
      if (!listeners.has(type)) listeners.set(type, new Set());
      listeners.get(type).add(listener);
    },
    removeEventListener(type, listener) {
      listeners.get(type)?.delete(listener);
    },
    emit(type, event = { type }) {
      for (const listener of [...(listeners.get(type) || [])]) listener(event);
    },
    dispatchEvent(event) {
      this.emit(event?.type, event);
      return true;
    },
    listenerCount(type) {
      return listeners.get(type)?.size || 0;
    },
  };
};

class FakeCustomEvent {
  constructor(type, options = {}) {
    this.type = type;
    this.detail = options.detail;
  }
}

test("editor live handoff keys follow connection identity, not unrelated config", () => {
  const first = buildEditorLiveHandoffKey({
    connectionType: "frigate_go2rtc",
    entity: "camera.front",
    pathname: "/lovelace/cameras",
  });
  const unchangedConnection = buildEditorLiveHandoffKey({
    connectionType: "frigate_go2rtc",
    entity: "camera.front",
    pathname: "/lovelace/cameras",
  });

  assert.equal(first, unchangedConnection);
  assert.notEqual(
    first,
    buildEditorLiveHandoffKey({
      connectionType: "frigate_go2rtc",
      entity: "camera.back",
      pathname: "/lovelace/cameras",
    }),
  );
  assert.notEqual(
    first,
    buildEditorLiveHandoffKey({
      connectionType: "ha_direct",
      entity: "camera.front",
      pathname: "/lovelace/cameras",
    }),
  );
});

test("editor live handoff broker returns one provider and removes its listener", () => {
  const windowRef = createListenerTarget({
    CustomEvent: FakeCustomEvent,
    location: { pathname: "/lovelace/cameras" },
  });
  const requester = new EditorPreviewContextController({}, { windowRef });
  const provider = new EditorPreviewContextController({}, { windowRef });
  const candidate = { provider, id: "established-webrtc" };
  provider.startLiveHandoffProvider(() => candidate);

  assert.equal(
    requester.requestLiveHandoff({ entity: "camera.front" }),
    candidate,
  );
  assert.equal(
    windowRef.listenerCount("frigate-view-card-editor-live-handoff-request"),
    1,
  );
  provider.dispose();
  assert.equal(
    windowRef.listenerCount("frigate-view-card-editor-live-handoff-request"),
    0,
  );
  requester.dispose();
});

test("editor live handoff refuses ambiguous matching providers", () => {
  const windowRef = createListenerTarget({
    CustomEvent: FakeCustomEvent,
    location: { pathname: "/lovelace/cameras" },
  });
  const requester = new EditorPreviewContextController(
    {},
    { windowRef },
  );
  const providerA = new EditorPreviewContextController({}, { windowRef });
  const providerB = new EditorPreviewContextController({}, { windowRef });
  providerA.startLiveHandoffProvider(() => ({ provider: providerA }));
  providerB.startLiveHandoffProvider(() => ({ provider: providerB }));

  assert.equal(requester.requestLiveHandoff({ entity: "camera.front" }), null);

  providerA.dispose();
  providerB.dispose();
  requester.dispose();
});

const createMutationObserverHarness = () => {
  const observers = [];
  class FakeMutationObserver {
    constructor(callback) {
      this.callback = callback;
      this.observations = [];
      this.disconnectCount = 0;
      observers.push(this);
    }

    observe(target, options) {
      this.observations.push({ target, options });
    }

    disconnect() {
      this.disconnectCount += 1;
    }
  }
  return { FakeMutationObserver, observers };
};

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

test("editor preview prepares its configured landing page once", () => {
  const calls = [];
  const host = {
    _config: { landing_page: "preview" },
    _pageId: "single-view",
    _started: false,
    _pageNavigationController: {
      resolveConfiguredLandingPage: (context) => {
        calls.push(["resolve", context]);
        return "preview";
      },
      preparePageRouteShell: (pageId) => {
        calls.push(["prepare", pageId]);
        host._pageId = pageId;
      },
    },
  };
  const controller = new EditorPreviewContextController(host);
  controller.isEditorPreviewContext = () => true;

  assert.equal(controller.syncInitialLandingPage(), "prepared");
  assert.equal(host._pageId, "preview");
  assert.equal(controller.syncInitialLandingPage(), null);
  assert.deepEqual(calls, [
    ["resolve", { hasPendingDeepLinkTarget: false }],
    ["prepare", "preview"],
  ]);
});

test("editor preview substitutes Single View for a Wide View landing page", () => {
  const host = {};
  const controller = new EditorPreviewContextController(host);
  controller.isEditorPreviewContext = () => true;

  assert.equal(controller.resolveLandingPage("wide-view"), "single-view");
  assert.equal(controller.resolveLandingPage("preview"), "preview");

  controller.isEditorPreviewContext = () => false;
  assert.equal(controller.resolveLandingPage("wide-view"), "wide-view");
});

test("config drafts update preview chrome without rebuilding media or lists", () => {
  const calls = [];
  const host = {
    _pageId: "single-view",
    _viewMode: "single",
    _activeCamIdx: 0,
    _haNavbarController: { sync: () => calls.push(["ha-navbar"]) },
    _haDashboardSwipeNavigationController: {
      sync: () => calls.push(["dashboard-swipe"]),
    },
    _syncVisualStyleToggles: () => calls.push(["visual-style"]),
    _haPageBackgroundController: {
      sync: () => calls.push(["page-background"]),
    },
    _previewPageController: {
      syncBottomNavbarPreviewChrome: () => calls.push(["preview-chrome"]),
    },
    _pageNavigationController: {
      isPageRouteAvailable: () => true,
    },
    _singleViewPageController: {
      applyEditorPreviewDraftRefresh: (options) =>
        calls.push(["soft-preview", options]),
    },
    _syncToolbarButtons: () => calls.push(["toolbar"]),
    _cleanupEngine: () => calls.push(["cleanup-engine"]),
    _renderList: () => calls.push(["render-list"]),
  };
  const controller = new EditorPreviewContextController(host);

  const result = controller.applyConfigDraft({
    previousConfig: { title: "Original", cameras: [] },
    nextConfig: { title: "Updated", cameras: [] },
  });

  assert.equal(result, "synced");
  assert.deepEqual(calls, [
    ["ha-navbar"],
    ["dashboard-swipe"],
    ["visual-style"],
    ["page-background"],
    ["preview-chrome"],
    ["soft-preview", { renderList: false }],
    ["toolbar"],
  ]);
  assert.equal(calls.some(([name]) => name === "cleanup-engine"), false);
  assert.equal(calls.some(([name]) => name === "render-list"), false);
});

test("standalone Card View draft controls reach its lightweight config updater", () => {
  let cardUpdate = null;
  const host = {
    _pageId: "card-view",
    _pageNavigationController: { isPageRouteAvailable: () => true },
    _cardViewPageController: {
      applyConfigUpdate: (options) => {
        cardUpdate = options;
      },
    },
  };
  const controller = new EditorPreviewContextController(host);

  controller.applyConfigDraft({
    previousConfig: {
      card_view_standalone: false,
      card_view_media_drawer_enabled: false,
      card_view_start_mode: "live",
      card_view_view_mode: "bottom-panel-open",
      card_view_hide_camera_name: false,
    },
    nextConfig: {
      card_view_standalone: true,
      card_view_media_drawer_enabled: true,
      card_view_start_mode: "grid",
      card_view_view_mode: "video-only",
      card_view_hide_camera_name: true,
    },
  });

  assert.deepEqual(cardUpdate, {
    takeoverDefaultChanged: false,
    viewModeChanged: true,
    standaloneChanged: true,
    mediaDrawerEnabledChanged: true,
    startModeChanged: true,
    hideCameraNameChanged: true,
  });
});

test("Single and Wide page drafts reach their lightweight mode updaters", () => {
  const calls = [];
  const host = {
    _pageId: "single-view",
    _pageNavigationController: { isPageRouteAvailable: () => true },
    _singleViewPageController: {
      applyPageConfigUpdate: (options) =>
        calls.push(["single-page", options]),
      applyEditorPreviewDraftRefresh: () => calls.push(["soft-preview"]),
    },
    _wideViewPageController: {
      applyPageConfigUpdate: (options) =>
        calls.push(["wide-page", options]),
    },
    _syncToolbarButtons: () => calls.push(["toolbar"]),
  };
  const controller = new EditorPreviewContextController(host);

  controller.applyConfigDraft({
    previousConfig: {
      single_view_alert_takeover: false,
      single_view_start_mode: "live",
      wide_view_start_mode: "live",
    },
    nextConfig: {
      single_view_alert_takeover: true,
      single_view_start_mode: "slideshow",
      wide_view_start_mode: "grid",
    },
  });

  assert.deepEqual(calls, [
    [
      "single-page",
      { takeoverDefaultChanged: true, startModeChanged: true },
    ],
    ["wide-page", { startModeChanged: true }],
    ["soft-preview"],
    ["toolbar"],
  ]);
});

test("camera drafts resync linked lights and two-way talk without rebuilding media", () => {
  const calls = [];
  const host = {
    _pageId: "single-view",
    _viewMode: "single",
    _activeCamIdx: 0,
    _haNavbarController: { sync: () => {} },
    _haDashboardSwipeNavigationController: { sync: () => {} },
    _syncVisualStyleToggles: () => {},
    _haPageBackgroundController: { sync: () => {} },
    _previewPageController: { syncBottomNavbarPreviewChrome: () => {} },
    _pageNavigationController: { isPageRouteAvailable: () => true },
    _singleViewPageController: {
      applyEditorPreviewDraftRefresh: (options) =>
        calls.push(["soft-preview", options]),
    },
    _syncTwoWayTalkRuntimeState: () => calls.push(["two-way-runtime"]),
    _syncTwoWayTalkButton: () => calls.push(["two-way-button"]),
    _linkedLightController: {
      sync: () => calls.push(["linked-lights"]),
    },
    _syncToolbarButtons: () => calls.push(["toolbar"]),
    _cleanupEngine: () => calls.push(["cleanup-engine"]),
  };
  const controller = new EditorPreviewContextController(host);

  controller.applyConfigDraft({
    previousConfig: {
      cameras: [{ entity: "camera.front_door" }],
    },
    nextConfig: {
      cameras: [
        {
          entity: "camera.front_door",
          two_way_talk: true,
          linked_entities: [
            { entity: "light.porch", position: "left" },
          ],
        },
      ],
    },
  });

  assert.deepEqual(calls, [
    ["soft-preview", { renderList: false }],
    ["two-way-runtime"],
    ["two-way-button"],
    ["linked-lights"],
    ["toolbar"],
  ]);
  assert.equal(calls.some(([name]) => name === "cleanup-engine"), false);
});

test("Favorites scope drafts reload only the visible Favorites tab", () => {
  const calls = [];
  const host = {
    _pageId: "single-view",
    _viewMode: "single",
    _activeCamIdx: 0,
    _tab: "kept",
    _haNavbarController: { sync: () => {} },
    _haDashboardSwipeNavigationController: { sync: () => {} },
    _syncVisualStyleToggles: () => {},
    _haPageBackgroundController: { sync: () => {} },
    _previewPageController: { syncBottomNavbarPreviewChrome: () => {} },
    _pageNavigationController: { isPageRouteAvailable: () => true },
    _singleViewPageController: {
      applyEditorPreviewDraftRefresh: (options) =>
        calls.push(["soft-preview", options]),
    },
    _syncToolbarButtons: () => calls.push(["toolbar"]),
    _isPreviewPageActive: () => false,
    _loadTabData: (tab) => calls.push(["load-tab", tab]),
  };
  const controller = new EditorPreviewContextController(host);

  controller.applyConfigDraft({
    previousConfig: {
      cameras: [{ entity: "camera.front_door" }],
      favorites_mixed_cameras: true,
    },
    nextConfig: {
      cameras: [{ entity: "camera.front_door" }],
      favorites_mixed_cameras: false,
    },
  });

  assert.deepEqual(calls, [
    ["soft-preview", { renderList: false }],
    ["toolbar"],
    ["load-tab", "kept"],
  ]);

  calls.length = 0;
  host._tab = "alerts";
  controller.applyConfigDraft({
    previousConfig: {
      cameras: [{ entity: "camera.front_door" }],
      favorites_mixed_cameras: false,
    },
    nextConfig: {
      cameras: [{ entity: "camera.front_door" }],
      favorites_mixed_cameras: true,
    },
  });

  assert.equal(calls.some(([name]) => name === "load-tab"), false);
});

test("disabling the active page moves the editor preview to Single View", () => {
  const calls = [];
  const host = {
    _pageId: "preview",
    _haNavbarController: { sync: () => {} },
    _haDashboardSwipeNavigationController: { sync: () => {} },
    _syncVisualStyleToggles: () => {},
    _haPageBackgroundController: { sync: () => {} },
    _previewPageController: { syncBottomNavbarPreviewChrome: () => {} },
    _pageNavigationController: {
      isPageRouteAvailable: () => false,
      navigateToPageRoute: (pageId, context) =>
        calls.push([pageId, context]),
    },
    _singleViewPageController: {
      applyEditorPreviewDraftRefresh: () => calls.push(["soft-preview"]),
    },
  };
  const controller = new EditorPreviewContextController(host);

  assert.equal(controller.applyConfigDraft(), "navigated");
  assert.deepEqual(calls, [
    ["single-view", { source: "editor-preview-page-disabled" }],
  ]);
});

test("changing a Wide View landing page moves editor preview to Single View", () => {
  const calls = [];
  const host = {
    _pageId: "preview",
    _viewMode: "single",
    _haNavbarController: { sync: () => {} },
    _haDashboardSwipeNavigationController: { sync: () => {} },
    _syncVisualStyleToggles: () => {},
    _haPageBackgroundController: { sync: () => {} },
    _previewPageController: { syncBottomNavbarPreviewChrome: () => {} },
    _pageNavigationController: {
      isPageRouteAvailable: () => true,
      resolveConfiguredLandingPage: (context) => {
        calls.push(["resolve", context]);
        return "wide-view";
      },
      navigateToPageRoute: (pageId, context) =>
        calls.push(["navigate", pageId, context]),
    },
    _singleViewPageController: {
      applyEditorPreviewDraftRefresh: () => calls.push(["soft-preview"]),
    },
  };
  const controller = new EditorPreviewContextController(host);
  controller.isEditorPreviewContext = () => true;

  assert.equal(
    controller.applyConfigDraft({
      previousConfig: { landing_page: "single-view" },
      nextConfig: { landing_page: "wide-view" },
    }),
    "navigated",
  );
  assert.deepEqual(calls, [
    ["resolve", { hasPendingDeepLinkTarget: false }],
    [
      "navigate",
      "single-view",
      { source: "editor-preview-landing-change" },
    ],
  ]);
});

test("renderCardPickerDemo paints an isolated presentation surface", () => {
  const picker = makeNode("HUI-CARD-PICKER");
  const hostClasses = [];
  const cardClasses = [];
  let listMarkup = "Loading…";
  let listWrites = 0;
  const demoTextAttributes = new Map([
    ["data-fvc-i18n", "runtime.cardPickerDemo.personTitle"],
  ]);
  const demoText = {
    textContent: "Person",
    getAttribute: (name) => demoTextAttributes.get(name) ?? null,
    setAttribute: (name, value) => demoTextAttributes.set(name, value),
  };
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
    "#list": {
      get innerHTML() { return listMarkup; },
      set innerHTML(value) { listMarkup = value; listWrites++; },
      querySelectorAll: () => [demoText],
    },
    "#info-title": { textContent: "" },
    "#tl-range": { textContent: "" },
    "#stream-type": { textContent: "" },
    "#alert-count": { textContent: "" },
    "#on-lbl": { textContent: "" },
    "#on-dot": { style: { color: "" } },
  };
  const host = makeNode("FRIGATE-VIEW-CARD", { parentNode: picker });
  const englishT = createLocalizationController().t;
  let language = "en";
  host._localization = {
    t: (key) => language === "fr"
      ? {
          "runtime.browse.recentAlerts": "Alertes récentes",
          "runtime.cardPickerDemo.demoCamera": "Caméra de démonstration",
          "runtime.cardPickerDemo.demo": "Démo",
          "runtime.cardPickerDemo.personTitle": "Personne",
          "runtime.preview.online": "En ligne",
        }[key] ?? englishT(key)
      : englishT(key),
  };
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
  assert.ok(
    nodes["#stream-fallback"].innerHTML.includes(
      `${CARD_NAME} preview branding`,
    ),
  );
  assert.equal(nodes["#stream-fallback"].hidden, false);
  assert.equal(nodes["#browse"].style.display, "flex");
  assert.equal(nodes["#browse-head"].style.display, "flex");
  assert.equal(nodes["#browse-head-label"].textContent, "Recent Alerts");
  assert.equal(
    nodes["#list"].innerHTML.match(/card-picker-demo-alert"/g)?.length,
    2,
  );
  assert.equal(nodes["#info-title"].textContent, CARD_NAME);
  assert.equal(nodes["#tl-range"].textContent, "Demo Camera");
  assert.equal(nodes["#stream-type"].textContent, "Demo");
  assert.equal(nodes["#alert-count"].textContent, "2");
  assert.equal(nodes["#on-lbl"].textContent, "Online");
  assert.equal(nodes["#on-dot"].style.color, "var(--c-on)");

  language = "fr";
  assert.equal(controller.renderCardPickerDemo(), true);
  assert.equal(listWrites, 1);
  assert.equal(demoText.textContent, "Personne");
  assert.equal(nodes["#browse-head-label"].textContent, "Alertes récentes");
  assert.equal(nodes["#tl-range"].textContent, "Caméra de démonstration");
  assert.equal(nodes["#stream-type"].textContent, "Démo");
  assert.equal(nodes["#on-lbl"].textContent, "En ligne");
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

test("editor lifecycle remains active across Home Assistant reparent boundaries", () => {
  let now = 1000;
  const controller = new EditorPreviewContextController(
    {},
    { nowFn: () => now },
  );
  controller.isEditorPreviewContext = () => false;
  controller.isDashboardEditMode = () => false;
  controller.isCardEditorDialogOpen = () => false;

  assert.equal(controller.isEditorLifecycleActive(), false);

  controller._dashboardEditLast = true;
  assert.equal(controller.isEditorLifecycleActive(), true);

  controller._dashboardEditLast = false;
  controller._dialogOpenLast = true;
  assert.equal(controller.isEditorLifecycleActive(), true);

  controller._dialogOpenLast = false;
  controller._lastEditorPreviewContext = true;
  assert.equal(controller.isEditorLifecycleActive(), true);

  controller._lastEditorPreviewContext = false;
  controller._markEditorLifecycleTransition();
  now = 2999;
  assert.equal(controller.isEditorLifecycleActive(), true);
  now = 3000;
  assert.equal(controller.isEditorLifecycleActive(), false);
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

test("edit-mode watchdog stays stopped outside an editor context", () => {
  let intervalCount = 0;
  const controller = new EditorPreviewContextController(
    { isConnected: true },
    {
      setInterval: () => {
        intervalCount += 1;
        return intervalCount;
      },
    },
  );
  controller.isEditorPreviewContext = () => false;
  controller.isCardEditorDialogOpen = () => false;
  controller.isDashboardEditMode = () => false;

  controller.startEditModeWatchdog();

  assert.equal(intervalCount, 0);
});

test("startEditModeWatchdog resumes and uses guarded stale probes while editing", () => {
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
      _scheduleEditorLayoutSync: () => calls.push(["layout"]),
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
      ["layout"],
      ["resume", "watchdog-dialog-close"],
      ["resume", "watchdog-edit-exit"],
      ["resume", "watchdog-dashboard-edit-on"],
      ["kick", false],
    ]);
  } finally {
    global.setInterval = originalSetInterval;
    global.clearInterval = originalClearInterval;
  }
});

test("editor monitoring stages document and dialog observers", () => {
  const calls = [];
  const clearedTimers = [];
  let watchdogCallback = null;
  const { FakeMutationObserver, observers } =
    createMutationObserverHarness();
  const body = {};
  const haDialog = {
    opened: true,
    hidden: false,
    hasAttribute: () => false,
    getAttribute: () => null,
  };
  const dialogRoot = {
    querySelector: (selector) => (selector === "ha-dialog" ? haDialog : null),
  };
  const dialogHost = {
    isConnected: true,
    hidden: false,
    shadowRoot: dialogRoot,
    querySelector: () => null,
    getAttribute: () => null,
  };
  const documentRef = {
    body,
    querySelector: (selector) =>
      selector === "hui-dialog-edit-card" ? dialogHost : null,
  };
  const windowRef = createListenerTarget({
    location: {
      href: "https://example.test/lovelace/test",
      origin: "https://example.test",
    },
    getComputedStyle: () => ({ display: "block", visibility: "visible" }),
  });
  const controller = new EditorPreviewContextController(
    {
      isConnected: true,
      _scheduleResumeLive: (reason) => calls.push(reason),
      _kickLiveIfStale() {},
    },
    {
      documentRef,
      windowRef,
      createMutationObserver: (callback) =>
        new FakeMutationObserver(callback),
      setInterval: (callback) => {
        watchdogCallback = callback;
        return 17;
      },
      clearInterval: (timer) => clearedTimers.push(timer),
    },
  );

  controller.startEditorDialogCloseObserver();

  assert.equal(observers.length, 1);
  const dialogObserver = observers[0];
  assert.ok(dialogObserver);
  assert.deepEqual(
    dialogObserver.observations.map(({ target }) => target),
    [dialogHost, dialogRoot],
  );
  assert.equal(typeof watchdogCallback, "function");

  haDialog.opened = false;
  haDialog.hidden = true;
  dialogObserver.callback([{ type: "attributes", target: haDialog }]);

  assert.deepEqual(calls, ["card-editor-close"]);
  assert.equal(dialogObserver.disconnectCount, 1);
  assert.deepEqual(clearedTimers, [17]);
  assert.equal(observers.length, 2);
  const documentObserver = observers[1];
  assert.deepEqual(documentObserver.observations, [
    {
      target: body,
      options: { childList: true, subtree: true },
    },
  ]);

  controller.dispose();
  assert.equal(documentObserver.disconnectCount, 1);
  assert.equal(windowRef.listenerCount("location-changed"), 0);
  assert.equal(windowRef.listenerCount("popstate"), 0);
});

test("document monitor detects dialog insertion and removal", () => {
  const calls = [];
  let watchdogCallback = null;
  const { FakeMutationObserver, observers } =
    createMutationObserverHarness();
  const body = {};
  const haDialog = {
    opened: true,
    hidden: false,
    hasAttribute: () => false,
    getAttribute: () => null,
  };
  const dialogRoot = {
    querySelector: (selector) => (selector === "ha-dialog" ? haDialog : null),
  };
  const dialogHost = {
    isConnected: true,
    shadowRoot: dialogRoot,
    querySelector: () => null,
    matches: (selector) => selector === "hui-dialog-edit-card",
  };
  let currentDialogHost = null;
  let documentQueryCount = 0;
  const documentRef = {
    body,
    querySelector: () => {
      documentQueryCount += 1;
      return currentDialogHost;
    },
  };
  const windowRef = createListenerTarget({
    location: {
      href: "https://example.test/lovelace/test",
      origin: "https://example.test",
    },
    getComputedStyle: () => ({ display: "block", visibility: "visible" }),
  });
  const controller = new EditorPreviewContextController(
    {
      isConnected: true,
      _scheduleResumeLive: (reason) => calls.push(reason),
      _kickLiveIfStale() {},
    },
    {
      documentRef,
      windowRef,
      createMutationObserver: (callback) =>
        new FakeMutationObserver(callback),
      setInterval: (callback) => {
        watchdogCallback = callback;
        return 22;
      },
      clearInterval() {},
    },
  );

  controller.startEditorDialogCloseObserver();
  const documentObserver = observers[0];
  assert.deepEqual(documentObserver.observations[0], {
    target: body,
    options: { childList: true, subtree: true },
  });
  const initialDocumentQueryCount = documentQueryCount;
  documentObserver.callback([
    {
      addedNodes: [
        { matches: () => false, querySelector: () => null },
      ],
      removedNodes: [],
    },
  ]);
  assert.equal(documentQueryCount, initialDocumentQueryCount);

  currentDialogHost = dialogHost;
  documentObserver.callback([
    { addedNodes: [dialogHost], removedNodes: [] },
  ]);
  assert.equal(observers.length, 2);
  assert.equal(documentObserver.disconnectCount, 1);
  assert.equal(typeof watchdogCallback, "function");

  dialogHost.isConnected = false;
  currentDialogHost = null;
  watchdogCallback();
  assert.deepEqual(calls, ["watchdog-dialog-close"]);
  assert.equal(observers.length, 3);
  assert.deepEqual(observers[2].observations, [
    {
      target: body,
      options: { childList: true, subtree: true },
    },
  ]);
});

test("dashboard edit monitoring is event-driven outside editing", () => {
  const calls = [];
  const timers = [];
  const clearedTimers = [];
  const { FakeMutationObserver } = createMutationObserverHarness();
  const documentRef = { body: {}, querySelector: () => null };
  const location = {
    href: "https://example.test/lovelace/test",
    origin: "https://example.test",
  };
  const windowRef = createListenerTarget({ location });
  const controller = new EditorPreviewContextController(
    {
      isConnected: true,
      _scheduleEditorLayoutSync: () => calls.push(["layout"]),
      _scheduleResumeLive: (reason) => calls.push(["resume", reason]),
      _kickLiveIfStale: (force) => calls.push(["kick", force]),
    },
    {
      documentRef,
      windowRef,
      createMutationObserver: (callback) =>
        new FakeMutationObserver(callback),
      setInterval: (callback) => {
        timers.push(callback);
        return timers.length;
      },
      clearInterval: (timer) => clearedTimers.push(timer),
    },
  );

  controller.startEditorDialogCloseObserver();
  assert.equal(timers.length, 0);

  location.href = "https://example.test/lovelace/test?edit=true";
  windowRef.emit("location-changed");
  assert.deepEqual(calls, [
    ["layout"],
    ["resume", "watchdog-dashboard-edit-on"],
    ["kick", false],
  ]);
  assert.equal(timers.length, 1);

  location.href = "https://example.test/lovelace/test";
  windowRef.emit("popstate");
  assert.deepEqual(calls.slice(-2), [
    ["layout"],
    ["resume", "watchdog-dashboard-edit-off"],
  ]);
  assert.deepEqual(clearedTimers, [1]);
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
