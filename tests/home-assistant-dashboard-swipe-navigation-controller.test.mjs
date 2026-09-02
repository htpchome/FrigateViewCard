import { test } from "node:test";
import assert from "node:assert/strict";

import { PAGE_IDS } from "../src/features/navigation/router.js";

import {
  HomeAssistantDashboardSwipeNavigationController,
  dashboardConfigEnablesPreMountSwipeNavigation,
  collectDashboardFrigateViewCards,
  installHomeAssistantDashboardSwipeNavigation,
  navigateToHomeAssistantView,
  resolveAdjacentHomeAssistantView,
  resolveDashboardSwipeDragOffset,
  resolveDashboardSwipeDirection,
  resolveDashboardSwipeNavigationOwnership,
  resolveDashboardSwipeNavigationPolicy,
  resolveDashboardSwipeThreshold,
  shouldIgnoreDashboardSwipePath,
  shouldUseLiveDashboardSwipeMotion,
} from "../src/integrations/home-assistant/dashboard-swipe-navigation.ctrl.js";

const createFakeStyle = (initial = {}) => {
  const values = new Map();
  const priorities = new Map();
  const writes = [];
  for (const [property, value] of Object.entries(initial)) {
    values.set(property, String(value));
  }
  return {
    writes,
    getPropertyValue(property) {
      return values.get(property) || "";
    },
    getPropertyPriority(property) {
      return priorities.get(property) || "";
    },
    setProperty(property, value, priority = "") {
      values.set(property, String(value));
      priorities.set(property, String(priority));
      writes.push({ property, value: String(value), priority: String(priority) });
    },
    removeProperty(property) {
      const previous = values.get(property) || "";
      values.delete(property);
      priorities.delete(property);
      writes.push({ property, value: "", priority: "" });
      return previous;
    },
  };
};

const createSwipeSurface = (initialStyle = {}) => {
  const surface = createEventTarget();
  surface.offsetWidth = 400;
  surface.style = createFakeStyle(initialStyle);
  return surface;
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
}

const createEventTarget = () => {
  const listeners = new Map();
  return {
    addEventListener(type, listener, options) {
      const entries = listeners.get(type) || new Set();
      entries.add(listener);
      listeners.set(type, entries);
      this.lastOptions = { ...(this.lastOptions || {}), [type]: options };
    },
    removeEventListener(type, listener) {
      listeners.get(type)?.delete(listener);
    },
    emit(type, event = {}) {
      for (const listener of listeners.get(type) || []) listener(event);
    },
    listenerCount(type) {
      return listeners.get(type)?.size || 0;
    },
  };
};

const createWindow = ({ userAgent = "" } = {}) => {
  const listeners = new Map();
  const location = {
    pathname: "/lovelace/one",
    search: "?kiosk=1",
    hash: "#now",
  };
  const pushes = [];
  let onPush = () => {};
  class FakeCustomEvent {
    constructor(type) {
      this.type = type;
    }
  }
  const windowRef = {
    innerWidth: 400,
    navigator: { userAgent },
    location,
    CustomEvent: FakeCustomEvent,
    history: {
      pushState(_state, _title, url) {
        pushes.push(url);
        const parsed = new URL(url, "https://home-assistant.local");
        location.pathname = parsed.pathname;
        location.search = parsed.search;
        location.hash = parsed.hash;
        onPush(parsed);
      },
    },
    addEventListener(type, listener) {
      const entries = listeners.get(type) || new Set();
      entries.add(listener);
      listeners.set(type, entries);
    },
    removeEventListener(type, listener) {
      listeners.get(type)?.delete(listener);
    },
    dispatchEvent(event) {
      for (const listener of listeners.get(event?.type) || []) listener(event);
      return true;
    },
    emit(type) {
      this.dispatchEvent({ type });
    },
    listenerCount(type) {
      return listeners.get(type)?.size || 0;
    },
    pushes,
    setPushHandler(handler) {
      onPush = handler;
    },
  };
  return windowRef;
};

const createRootAndPanel = ({
  prefix = "/lovelace",
  path = "/one",
  views = [
    { title: "One", path: "one" },
    { title: "Two", path: "two" },
    { title: "Three", path: "three" },
  ],
} = {}) => {
  const rootEventTarget = createEventTarget();
  let swipeSurface = createSwipeSurface();
  rootEventTarget.querySelector = (selector) =>
    selector === "#view" ? swipeSurface : null;
  const panel = {
    tagName: "HA-PANEL-LOVELACE",
    route: { prefix, path },
    lovelace: { config: { views } },
    hass: { user: { id: "user-1" } },
  };
  const panelShadowRoot = { host: panel };
  const huiRoot = {
    tagName: "HUI-ROOT",
    route: { prefix },
    shadowRoot: rootEventTarget,
    style: createFakeStyle(),
    getRootNode: () => panelShadowRoot,
  };
  return {
    rootEventTarget,
    huiRoot,
    panel,
    get eventTarget() {
      return swipeSurface;
    },
    get swipeSurface() {
      return swipeSurface;
    },
    replaceSwipeSurface(nextSurface = createSwipeSurface()) {
      swipeSurface = nextSurface;
      return swipeSurface;
    },
  };
};

const createHarness = ({
  hasTouch = true,
  deferAnimationFrames = false,
  queueMicrotaskFn = (callback) => callback(),
  resolveInternalPageTarget = () => null,
  resolveDashboardBoundaryPage = () => null,
  allowDashboardNavigation = () => true,
  isNavigationEnabled = () => true,
  onDashboardNavigationSettled = null,
  onDashboardScopeExited = null,
  enforceDashboardOwner = false,
  rootOptions = {},
} = {}) => {
  const observerStartIndex = FakeMutationObserver.instances.length;
  const windowRef = createWindow();
  let rootState = createRootAndPanel(rootOptions);
  let currentHuiRoot = rootState.huiRoot;
  let now = 1000;
  const internalNavigations = [];
  const dashboardSettles = [];
  let dashboardScopeExitCount = 0;
  const animationFrames = [];
  const mainRoot = {};
  const homeAssistant = {
    shadowRoot: {
      querySelector: (selector) =>
        selector === "home-assistant-main"
          ? { shadowRoot: mainRoot }
          : null,
    },
  };
  const documentRef = {
    querySelector: (selector) =>
      selector === "home-assistant" ? homeAssistant : null,
  };
  const boundary = { host: rootState.huiRoot };
  const host = {
    isConnected: true,
    parentNode: boundary,
    _config: {},
    _isEditorPreviewContext: () => false,
  };
  windowRef.setPushHandler((url) => {
    rootState.panel.route.path = url.pathname.slice(
      rootState.panel.route.prefix.length,
    );
  });
  const controller = new HomeAssistantDashboardSwipeNavigationController(
    host,
    {
      MutationObserverCtor: FakeMutationObserver,
      documentRef,
      windowRef,
      hasTouch,
      getComputedStyleFn: (element) => element?.computedStyle || {},
      queueMicrotaskFn,
      nowFn: () => now,
      requestAnimationFrameFn: (callback) => {
        if (deferAnimationFrames) {
          animationFrames.push(callback);
          return animationFrames.length;
        }
        callback();
        return 1;
      },
      setTimeoutFn: (callback) => callback(),
      createLocationChangedEvent: () => ({ type: "location-changed" }),
      findCurrentHuiRoot: () => currentHuiRoot,
      findPanel: (huiRoot) =>
        huiRoot === rootState.huiRoot ? rootState.panel : null,
      resolveInternalPageTarget,
      resolveDashboardBoundaryPage,
      allowDashboardNavigation,
      isNavigationEnabled,
      navigateInternalPage: (pageId) => {
        internalNavigations.push(pageId);
        return true;
      },
      onDashboardNavigationSettled: (context) => {
        dashboardSettles.push(context);
        onDashboardNavigationSettled?.(context);
      },
      onDashboardScopeExited: () => {
        dashboardScopeExitCount += 1;
        onDashboardScopeExited?.();
      },
      enforceDashboardOwner,
    },
  );
  return {
    controller,
    documentRef,
    host,
    windowRef,
    internalNavigations,
    dashboardSettles,
    get dashboardScopeExitCount() {
      return dashboardScopeExitCount;
    },
    get rootState() {
      return rootState;
    },
    advance(ms) {
      now += ms;
    },
    setRootAvailable(available) {
      currentHuiRoot = available ? rootState.huiRoot : null;
      boundary.host = available ? rootState.huiRoot : null;
    },
    runNextAnimationFrame() {
      animationFrames.shift()?.();
    },
    pendingAnimationFrames() {
      return animationFrames.length;
    },
    notifyMutations() {
      for (const observer of FakeMutationObserver.instances.slice(
        observerStartIndex,
      )) {
        observer.callback([]);
      }
    },
    replaceRoot(nextRootState) {
      rootState = nextRootState;
      currentHuiRoot = nextRootState.huiRoot;
      boundary.host = nextRootState.huiRoot;
      windowRef.setPushHandler((url) => {
        rootState.panel.route.path = url.pathname.slice(
          rootState.panel.route.prefix.length,
        );
      });
    },
  };
};

const flushSwipeMotion = async () => {
  for (let turn = 0; turn < 16; turn += 1) {
    await Promise.resolve();
  }
};

const plainSurface = {
  tagName: "DIV",
  matches: () => false,
  clientWidth: 300,
  scrollWidth: 300,
  computedStyle: { overflowX: "visible", touchAction: "auto" },
};

const touch = (identifier, clientX, clientY) => ({
  identifier,
  clientX,
  clientY,
});

const swipe = (
  target,
  {
    beforeMove = null,
    startX = 300,
    startY = 200,
    endX = 100,
    endY = 205,
    path = [plainSurface],
  } = {},
) => {
  const startTouch = touch(7, startX, startY);
  const endTouch = touch(7, endX, endY);
  const stopped = { start: 0, move: 0, end: 0, immediate: 0 };
  target.emit("touchstart", {
    touches: [startTouch],
    target: path[0],
    composedPath: () => path,
    stopPropagation: () => {
      stopped.start += 1;
    },
    stopImmediatePropagation: () => {
      stopped.immediate += 1;
    },
  });
  beforeMove?.();
  let prevented = false;
  target.emit("touchmove", {
    touches: [endTouch],
    cancelable: true,
    preventDefault: () => {
      prevented = true;
    },
    stopPropagation: () => {
      stopped.move += 1;
    },
    stopImmediatePropagation: () => {
      stopped.immediate += 1;
    },
  });
  target.emit("touchend", {
    touches: [],
    changedTouches: [endTouch],
    stopPropagation: () => {
      stopped.end += 1;
    },
    stopImmediatePropagation: () => {
      stopped.immediate += 1;
    },
  });
  return { prevented, stopped };
};

const mouseSwipe = (
  target,
  {
    startX = 300,
    startY = 200,
    endX = 100,
    endY = 205,
    path = [plainSurface],
  } = {},
) => {
  const common = {
    pointerType: "mouse",
    pointerId: 17,
    isPrimary: true,
    target: path[0],
    composedPath: () => path,
    stopPropagation: () => {},
  };
  target.emit("pointerdown", {
    ...common,
    button: 0,
    clientX: startX,
    clientY: startY,
  });
  let prevented = false;
  target.emit("pointermove", {
    ...common,
    button: 0,
    clientX: endX,
    clientY: endY,
    cancelable: true,
    preventDefault: () => {
      prevented = true;
    },
  });
  target.emit("pointerup", {
    ...common,
    button: 0,
    clientX: endX,
    clientY: endY,
  });
  return { prevented };
};

const activate = (target, type = "click") => {
  let prevented = 0;
  let stopped = 0;
  let immediate = 0;
  target.emit(type, {
    preventDefault: () => {
      prevented += 1;
    },
    stopPropagation: () => {
      stopped += 1;
    },
    stopImmediatePropagation: () => {
      immediate += 1;
    },
  });
  return { prevented, stopped, immediate };
};

const click = (target) => activate(target, "click");

test("swipe thresholds require a decisive horizontal gesture", () => {
  assert.equal(resolveDashboardSwipeThreshold(320), 64);
  assert.equal(resolveDashboardSwipeThreshold(1000), 140);
  assert.equal(
    resolveDashboardSwipeDirection({
      deltaX: -90,
      deltaY: 8,
      viewportWidth: 400,
    }),
    "next",
  );
  assert.equal(
    resolveDashboardSwipeDirection({
      deltaX: 90,
      deltaY: 8,
      viewportWidth: 400,
    }),
    "previous",
  );
  assert.equal(
    resolveDashboardSwipeDirection({
      deltaX: 50,
      deltaY: 2,
      viewportWidth: 400,
    }),
    null,
  );
  assert.equal(
    resolveDashboardSwipeDirection({
      deltaX: 100,
      deltaY: 90,
      viewportWidth: 400,
    }),
    null,
  );
});

test("page drag follows available navigation and resists unavailable edges", () => {
  assert.equal(
    resolveDashboardSwipeDragOffset({
      deltaX: -120,
      viewportWidth: 400,
      hasTarget: true,
    }),
    -120,
  );
  const resisted = resolveDashboardSwipeDragOffset({
    deltaX: 180,
    viewportWidth: 400,
    hasTarget: false,
  });
  assert.equal(resisted > 0, true);
  assert.equal(resisted < 52, true);
  assert.equal(
    resolveDashboardSwipeDragOffset({
      deltaX: -600,
      viewportWidth: 400,
      hasTarget: true,
    }),
    -400,
  );
});

test("adjacent view resolution skips hidden, unauthorized, and subview pages without wrapping", () => {
  const views = [
    { path: "one" },
    { path: "hidden", visible: false },
    { path: "details", subview: true },
    { path: "private", visible: [{ user: "user-2" }] },
    { path: "two" },
  ];
  const { huiRoot, panel } = createRootAndPanel({ views });
  const windowRef = createWindow();
  const next = resolveAdjacentHomeAssistantView({
    huiRoot,
    panel,
    windowRef,
    direction: "next",
  });
  assert.deepEqual(next, {
    index: 4,
    name: "two",
    url: "/lovelace/two?kiosk=1#now",
  });

  panel.route.path = "/one";
  windowRef.location.pathname = "/lovelace/two";
  assert.equal(
    resolveAdjacentHomeAssistantView({
      huiRoot,
      panel,
      windowRef,
      direction: "next",
    }),
    null,
  );
  assert.equal(
    resolveAdjacentHomeAssistantView({
      huiRoot,
      panel,
      windowRef,
      direction: "previous",
    })?.name,
    "one",
  );
});

test("adjacent view resolution includes subviews in dashboard order when enabled", () => {
  const views = [
    { path: "one" },
    { path: "details", subview: true },
    { path: "two" },
  ];
  const { huiRoot, panel } = createRootAndPanel({ views });
  const windowRef = createWindow();

  assert.equal(
    resolveAdjacentHomeAssistantView({
      huiRoot,
      panel,
      windowRef,
      direction: "next",
      includeSubviews: true,
    })?.name,
    "details",
  );

  windowRef.location.pathname = "/lovelace/details";
  assert.equal(
    resolveAdjacentHomeAssistantView({
      huiRoot,
      panel,
      windowRef,
      direction: "next",
      includeSubviews: true,
    })?.name,
    "two",
  );
});

test("navigation uses Home Assistant history routing and location-changed", () => {
  const windowRef = createWindow();
  let locationChanged = 0;
  windowRef.addEventListener("location-changed", () => {
    locationChanged += 1;
  });

  assert.equal(
    navigateToHomeAssistantView({
      target: { url: "/lovelace/two?kiosk=1#now" },
      windowRef,
      createLocationChangedEvent: () => ({ type: "location-changed" }),
    }),
    true,
  );
  assert.deepEqual(windowRef.pushes, ["/lovelace/two?kiosk=1#now"]);
  assert.equal(locationChanged, 1);
});

test("interactive, direct-touch, and horizontally scrollable paths are excluded", () => {
  const interactive = {
    tagName: "BUTTON",
    matches: () => true,
  };
  const directTouch = {
    tagName: "DIV",
    matches: () => false,
    computedStyle: { touchAction: "none", overflowX: "visible" },
  };
  const horizontalScroller = {
    tagName: "DIV",
    matches: () => false,
    clientWidth: 200,
    scrollWidth: 400,
    computedStyle: { touchAction: "auto", overflowX: "auto" },
  };
  const ariaSlider = {
    tagName: "DIV",
    matches: (selector) => selector.includes("[role='slider']"),
    getAttribute: (name) => (name === "role" ? "slider" : null),
  };
  const customRange = {
    tagName: "THIRD-PARTY-RANGE-CONTROL",
    matches: () => false,
  };
  const popupSurface = {
    tagName: "DIV",
    matches: (selector) => selector.includes("[data-no-swipe]"),
  };
  const options = {
    getComputedStyleFn: (element) => element.computedStyle || {},
  };

  assert.equal(shouldIgnoreDashboardSwipePath([interactive], options), true);
  assert.equal(shouldIgnoreDashboardSwipePath([directTouch], options), true);
  assert.equal(
    shouldIgnoreDashboardSwipePath([horizontalScroller], options),
    true,
  );
  assert.equal(shouldIgnoreDashboardSwipePath([ariaSlider], options), true);
  assert.equal(shouldIgnoreDashboardSwipePath([customRange], options), true);
  assert.equal(shouldIgnoreDashboardSwipePath([popupSurface], options), true);
  assert.equal(shouldIgnoreDashboardSwipePath([plainSurface], options), false);
});

test("pre-mount navigation recognizes configured dashboard-wide cards", () => {
  assert.equal(
    dashboardConfigEnablesPreMountSwipeNavigation({
      views: [
        {
          sections: [
            {
              cards: [
                {
                  type: "custom:frigate-view-card",
                  ha_dashboard_swipe_navigation_owner: true,
                  ha_dashboard_swipe_navigation: "dashboard-wide",
                },
              ],
            },
          ],
        },
      ],
    }),
    true,
  );
  assert.equal(
    dashboardConfigEnablesPreMountSwipeNavigation({
      views: [
        {
          cards: [
            {
              type: "custom:frigate-view-card",
              ha_dashboard_swipe_navigation_owner: true,
              ha_dashboard_swipe_navigation: "inside-card",
            },
          ],
        },
      ],
    }),
    false,
  );
});

test("dashboard swipe ownership is deterministic and ignores later YAML claimants", () => {
  const first = {
    type: "custom:frigate-view-card",
    ha_dashboard_swipe_navigation_owner: true,
    ha_dashboard_swipe_navigation: "inside-card",
  };
  const second = {
    type: "custom:frigate-view-card",
    ha_dashboard_swipe_navigation_owner: true,
    ha_dashboard_swipe_navigation: "dashboard-wide",
  };
  const dashboardConfig = {
    views: [
      { title: "Cameras", path: "cameras", cards: [first] },
      {
        title: "Garage",
        path: "garage",
        sections: [{ cards: [second] }],
      },
    ],
  };

  assert.deepEqual(
    collectDashboardFrigateViewCards(dashboardConfig).map(
      ({ viewName, viewTitle }) => ({ viewName, viewTitle }),
    ),
    [
      { viewName: "cameras", viewTitle: "Cameras" },
      { viewName: "garage", viewTitle: "Garage" },
    ],
  );
  const ownership =
    resolveDashboardSwipeNavigationOwnership(dashboardConfig);
  assert.equal(ownership.owner.config, first);
  assert.equal(ownership.conflicts.length, 1);
  assert.equal(ownership.conflicts[0].config, second);

  const policy = resolveDashboardSwipeNavigationPolicy({
    dashboardConfig,
    currentViewName: "cameras",
  });
  assert.equal(policy.mode, "inside-card");
  assert.equal(policy.allowDashboardNavigation, false);
  assert.equal(policy.includeSubviews, false);
  assert.equal(dashboardConfigEnablesPreMountSwipeNavigation(dashboardConfig), false);
});

test("dashboard-wide swipe policy enables configured subviews", () => {
  const dashboardConfig = {
    views: [
      {
        path: "cameras",
        cards: [
          {
            type: "custom:frigate-view-card",
            ha_dashboard_swipe_navigation_owner: true,
            ha_dashboard_swipe_navigation: "dashboard-wide",
            ha_dashboard_swipe_include_subviews: true,
            ha_dashboard_swipe_mouse_enabled: true,
          },
        ],
      },
      { path: "details", subview: true },
    ],
  };
  const policy = resolveDashboardSwipeNavigationPolicy({
    dashboardConfig,
    currentViewName: "cameras",
  });

  assert.equal(policy.includeSubviews, true);
  assert.equal(policy.allowDashboardNavigation, true);
  assert.equal(policy.mouseNavigationEnabled, true);
});

test("mouse swipe is opt-in and starts before the owner card is visited", async () => {
  const rootState = createRootAndPanel({
    views: [
      { title: "Controls", path: "one", cards: [{ type: "entities" }] },
      {
        title: "Cameras",
        path: "two",
        cards: [
          {
            type: "custom:frigate-view-card",
            ha_dashboard_swipe_navigation_owner: true,
            ha_dashboard_swipe_navigation: "dashboard-wide",
            ha_dashboard_swipe_mouse_enabled: true,
          },
        ],
      },
    ],
  });
  const windowRef = createWindow();
  const bootstrap = installHomeAssistantDashboardSwipeNavigation({
    documentRef: {},
    windowRef,
    MutationObserverCtor: FakeMutationObserver,
    hasTouch: false,
    getComputedStyleFn: (element) => element?.computedStyle || {},
    queueMicrotaskFn: (callback) => callback(),
    nowFn: () => 1000,
    requestAnimationFrameFn: (callback) => {
      callback();
      return 1;
    },
    setTimeoutFn: (callback) => callback(),
    createLocationChangedEvent: () => ({ type: "location-changed" }),
    findCurrentHuiRoot: () => rootState.huiRoot,
    findPanel: () => rootState.panel,
    findSwipeSurface: () => rootState.swipeSurface,
  });

  assert.equal(rootState.eventTarget.listenerCount("pointerdown"), 1);
  assert.equal(mouseSwipe(rootState.eventTarget).prevented, true);
  await flushSwipeMotion();
  assert.deepEqual(windowRef.pushes, ["/lovelace/two?kiosk=1#now"]);

  bootstrap.disconnect();
  assert.equal(rootState.eventTarget.listenerCount("pointerdown"), 0);
});

test("Firefox mouse swipe navigates without compositing the full dashboard view", async () => {
  const rootState = createRootAndPanel({
    views: [
      { title: "Controls", path: "one", cards: [{ type: "entities" }] },
      {
        title: "Cameras",
        path: "two",
        cards: [
          {
            type: "custom:frigate-view-card",
            ha_dashboard_swipe_navigation_owner: true,
            ha_dashboard_swipe_navigation: "dashboard-wide",
            ha_dashboard_swipe_mouse_enabled: true,
          },
        ],
      },
    ],
  });
  const windowRef = createWindow({
    userAgent:
      "Mozilla/5.0 (X11; Linux x86_64; rv:128.0) Gecko/20100101 Firefox/128.0",
  });
  const bootstrap = installHomeAssistantDashboardSwipeNavigation({
    documentRef: {},
    windowRef,
    MutationObserverCtor: FakeMutationObserver,
    hasTouch: false,
    getComputedStyleFn: (element) => element?.computedStyle || {},
    queueMicrotaskFn: (callback) => callback(),
    nowFn: () => 1000,
    requestAnimationFrameFn: (callback) => {
      callback();
      return 1;
    },
    setTimeoutFn: (callback) => callback(),
    createLocationChangedEvent: () => ({ type: "location-changed" }),
    findCurrentHuiRoot: () => rootState.huiRoot,
    findPanel: () => rootState.panel,
    findSwipeSurface: () => rootState.swipeSurface,
  });

  assert.equal(
    shouldUseLiveDashboardSwipeMotion({
      inputType: "mouse",
      userAgent: windowRef.navigator.userAgent,
    }),
    false,
  );
  assert.equal(mouseSwipe(rootState.eventTarget).prevented, true);
  await flushSwipeMotion();
  assert.deepEqual(windowRef.pushes, ["/lovelace/two?kiosk=1#now"]);
  assert.equal(
    rootState.swipeSurface.style.writes.some(
      ({ property }) => property === "transform",
    ),
    false,
  );

  bootstrap.disconnect();
});

test("Inside Card Only can include only dashboard pages containing FrigateView", () => {
  const dashboardConfig = {
    views: [
      {
        title: "Cameras",
        path: "cameras",
        cards: [
          {
            type: "custom:frigate-view-card",
            ha_dashboard_swipe_navigation_owner: true,
            ha_dashboard_swipe_navigation: "inside-card",
            ha_dashboard_swipe_include_other_cards: true,
          },
        ],
      },
      { title: "Controls", path: "controls", cards: [{ type: "entities" }] },
      {
        title: "Garage",
        path: "garage",
        cards: [{ type: "custom:frigate-view-card" }],
      },
    ],
  };
  const policy = resolveDashboardSwipeNavigationPolicy({
    dashboardConfig,
    currentViewName: "cameras",
  });
  assert.equal(policy.gestureEnabled, true);
  assert.equal(policy.allowDashboardNavigation, true);
  assert.equal(policy.restrictDashboardToFrigateViewPages, true);
  assert.equal(policy.includeSubviews, false);
  assert.equal(dashboardConfigEnablesPreMountSwipeNavigation(dashboardConfig), true);

  const rootState = createRootAndPanel({ views: dashboardConfig.views });
  const windowRef = createWindow();
  windowRef.location.pathname = "/lovelace/cameras";
  const target = resolveAdjacentHomeAssistantView({
    huiRoot: rootState.huiRoot,
    panel: rootState.panel,
    windowRef,
    direction: "next",
    includeView: (view) =>
      collectDashboardFrigateViewCards({ views: [view] }).length > 0,
  });
  assert.equal(target.name, "garage");

  const ordinaryPagePolicy = resolveDashboardSwipeNavigationPolicy({
    dashboardConfig,
    currentViewName: "controls",
  });
  assert.equal(ordinaryPagePolicy.controllerEnabled, true);
  assert.equal(ordinaryPagePolicy.gestureEnabled, false);
});

test("an owner selecting None retains ownership but disables swipe runtime", () => {
  const dashboardConfig = {
    views: [
      {
        path: "cameras",
        cards: [
          {
            type: "custom:frigate-view-card",
            ha_dashboard_swipe_navigation_owner: true,
            ha_dashboard_swipe_navigation: "none",
          },
        ],
      },
    ],
  };
  const policy = resolveDashboardSwipeNavigationPolicy({
    dashboardConfig,
    currentViewName: "cameras",
  });
  assert.ok(policy.owner);
  assert.equal(policy.controllerEnabled, false);
  assert.equal(policy.gestureEnabled, false);
  assert.equal(dashboardConfigEnablesPreMountSwipeNavigation(dashboardConfig), false);
});

test("dashboard swipe starts before the FrigateView card page is visited", async () => {
  const rootState = createRootAndPanel({
    views: [
      {
        title: "Controls",
        path: "one",
        sections: [
          {
            cards: [
              { type: "custom:entities" },
            ],
          },
        ],
      },
      {
        title: "Cameras",
        path: "two",
        cards: [
          {
            type: "custom:frigate-view-card",
            ha_dashboard_swipe_navigation_owner: true,
          },
        ],
      },
    ],
  });
  const windowRef = createWindow();
  const documentRef = {};
  const bootstrap = installHomeAssistantDashboardSwipeNavigation({
    documentRef,
    windowRef,
    MutationObserverCtor: FakeMutationObserver,
    hasTouch: true,
    getComputedStyleFn: (element) => element?.computedStyle || {},
    queueMicrotaskFn: (callback) => callback(),
    nowFn: () => 1000,
    requestAnimationFrameFn: (callback) => {
      callback();
      return 1;
    },
    setTimeoutFn: (callback) => callback(),
    createLocationChangedEvent: () => ({ type: "location-changed" }),
    findCurrentHuiRoot: () => rootState.huiRoot,
    findPanel: () => rootState.panel,
    findSwipeSurface: () => rootState.swipeSurface,
  });
  assert.equal(rootState.eventTarget.listenerCount("touchstart"), 1);
  const result = swipe(rootState.eventTarget);
  assert.equal(result.prevented, true);
  await flushSwipeMotion();
  assert.deepEqual(windowRef.pushes, ["/lovelace/two?kiosk=1#now"]);

  bootstrap.disconnect();
  assert.equal(rootState.eventTarget.listenerCount("touchstart"), 0);
});

test("Firefox-native microtask scheduling keeps the Window receiver", () => {
  let receiver = null;
  const h = createHarness({
    queueMicrotaskFn: function (callback) {
      receiver = this;
      callback();
    },
  });
  h.controller.sync();
  h.windowRef.emit("location-changed");

  assert.equal(receiver, h.windowRef);
});

test("controller slides the current and incoming pages while navigating", async () => {
  const h = createHarness();
  assert.equal(h.controller.sync(), true);
  assert.equal(h.rootState.eventTarget.listenerCount("touchstart"), 1);
  assert.equal(h.rootState.rootEventTarget.listenerCount("touchstart"), 0);
  assert.equal(h.rootState.eventTarget.lastOptions.touchstart.passive, true);
  assert.equal(h.rootState.eventTarget.lastOptions.touchmove.passive, false);
  assert.notEqual(h.rootState.eventTarget.lastOptions.touchmove.capture, true);
  assert.equal(h.rootState.eventTarget.lastOptions.click.capture, true);
  assert.equal(h.rootState.eventTarget.lastOptions.action.capture, true);

  const result = swipe(h.rootState.eventTarget);
  assert.equal(result.prevented, true);
  assert.deepEqual(result.stopped, {
    start: 1,
    move: 0,
    end: 0,
    immediate: 0,
  });
  assert.equal(
    h.rootState.huiRoot.style.getPropertyValue("overflow-x"),
    "hidden",
  );
  await flushSwipeMotion();
  assert.deepEqual(h.windowRef.pushes, ["/lovelace/two?kiosk=1#now"]);

  const transforms = h.rootState.swipeSurface.style.writes
    .filter(({ property, value }) => property === "transform" && value)
    .map(({ value }) => value);
  assert.deepEqual(transforms, [
    "translateX(-200px)",
    "translateX(-400px)",
    "translateX(400px)",
    "translateX(0px)",
  ]);
  assert.equal(
    h.rootState.swipeSurface.style.getPropertyValue("transform"),
    "",
  );
  assert.equal(
    h.rootState.swipeSurface.style.getPropertyValue("transition"),
    "",
  );
  assert.equal(h.rootState.huiRoot.style.getPropertyValue("overflow-x"), "");
  assert.equal(h.dashboardSettles.length, 1);
  assert.equal(h.dashboardSettles[0].direction, "next");
  assert.equal(h.dashboardSettles[0].target.name, "two");

  h.advance(500);
  const vertical = swipe(h.rootState.eventTarget, {
    startX: 200,
    startY: 100,
    endX: 210,
    endY: 250,
  });
  assert.equal(vertical.prevented, false);
  assert.equal(vertical.stopped.start, 1);
  assert.equal(vertical.stopped.move, 0);
  assert.equal(vertical.stopped.end, 0);
  assert.equal(h.windowRef.pushes.length, 1);
  h.controller.disconnect({ force: true });
});

test("horizontal swipes suppress trailing HA actions and browser clicks", async () => {
  const h = createHarness();
  h.controller.sync();

  const result = swipe(h.rootState.eventTarget);
  assert.equal(result.prevented, true);
  assert.deepEqual(activate(h.rootState.eventTarget, "action"), {
    prevented: 1,
    stopped: 1,
    immediate: 0,
  });
  assert.deepEqual(click(h.rootState.eventTarget), {
    prevented: 1,
    stopped: 1,
    immediate: 0,
  });
  await flushSwipeMotion();
});

test("taps and vertical scrolling do not suppress entity clicks", () => {
  const tapHarness = createHarness({ isNavigationEnabled: () => false });
  tapHarness.controller.sync();
  swipe(tapHarness.rootState.eventTarget, {
    startX: 180,
    startY: 180,
    endX: 182,
    endY: 181,
  });
  assert.deepEqual(click(tapHarness.rootState.eventTarget), {
    prevented: 0,
    stopped: 0,
    immediate: 0,
  });
  assert.equal(activate(tapHarness.rootState.eventTarget, "action").stopped, 0);

  const verticalHarness = createHarness({ isNavigationEnabled: () => false });
  verticalHarness.controller.sync();
  swipe(verticalHarness.rootState.eventTarget, {
    startX: 180,
    startY: 100,
    endX: 184,
    endY: 240,
  });
  assert.deepEqual(click(verticalHarness.rootState.eventTarget), {
    prevented: 0,
    stopped: 0,
    immediate: 0,
  });
  assert.equal(
    activate(verticalHarness.rootState.eventTarget, "action").stopped,
    0,
  );
});

test("a new touch clears stale swipe click suppression", () => {
  const h = createHarness({ isNavigationEnabled: () => false });
  h.controller.sync();
  swipe(h.rootState.eventTarget);

  const nextTouch = touch(9, 200, 200);
  h.rootState.eventTarget.emit("touchstart", {
    touches: [nextTouch],
    target: plainSurface,
    composedPath: () => [plainSurface, h.host],
    stopPropagation: () => {},
  });

  assert.deepEqual(click(h.rootState.eventTarget), {
    prevented: 0,
    stopped: 0,
    immediate: 0,
  });
});

test("cancelled horizontal gestures suppress only their immediate click", () => {
  const h = createHarness({ isNavigationEnabled: () => false });
  h.controller.sync();
  const startTouch = touch(11, 300, 200);
  const movedTouch = touch(11, 180, 204);
  h.rootState.eventTarget.emit("touchstart", {
    touches: [startTouch],
    target: plainSurface,
    composedPath: () => [plainSurface, h.host],
    stopPropagation: () => {},
  });
  h.rootState.eventTarget.emit("touchmove", {
    touches: [movedTouch],
    cancelable: true,
    preventDefault: () => {},
    stopPropagation: () => {},
  });
  h.rootState.eventTarget.emit("touchcancel", {
    stopPropagation: () => {},
  });

  assert.equal(click(h.rootState.eventTarget).prevented, 1);

  swipe(h.rootState.eventTarget);
  h.advance(701);
  assert.equal(click(h.rootState.eventTarget).prevented, 0);
});

test("Frigate pages consume swipes before Home Assistant dashboard pages", async () => {
  const h = createHarness({
    resolveInternalPageTarget: (direction) =>
      direction === "next" ? "mobile-view" : null,
  });
  h.controller.sync();

  const result = swipe(h.rootState.eventTarget, {
    path: [plainSurface, h.host],
  });
  assert.equal(result.prevented, true);
  await flushSwipeMotion();

  assert.deepEqual(h.internalNavigations, ["mobile-view"]);
  assert.deepEqual(h.windowRef.pushes, []);
  assert.deepEqual(h.dashboardSettles, []);
});

test("dashboard swipe back into the owner card restores its last eligible page", async () => {
  const boundaryContexts = [];
  const h = createHarness({
    enforceDashboardOwner: true,
    rootOptions: {
      path: "/two",
      views: [
        {
          title: "Cameras",
          path: "one",
          cards: [
            {
              type: "custom:frigate-view-card",
              ha_dashboard_swipe_navigation_owner: true,
              ha_dashboard_swipe_navigation: "dashboard-wide",
            },
          ],
        },
        { title: "Controls", path: "two", cards: [{ type: "entities" }] },
      ],
    },
    resolveDashboardBoundaryPage: (context) => {
      boundaryContexts.push(context);
      return PAGE_IDS.cardView;
    },
  });
  h.windowRef.location.pathname = "/lovelace/two";
  h.controller.sync();

  const result = swipe(h.rootState.eventTarget, {
    startX: 100,
    endX: 280,
    path: [plainSurface],
  });
  assert.equal(result.prevented, true);
  await flushSwipeMotion();

  assert.equal(boundaryContexts.length, 1);
  assert.equal(boundaryContexts[0].direction, "previous");
  assert.equal(boundaryContexts[0].transition, "enter");
  assert.deepEqual(h.internalNavigations, [PAGE_IDS.cardView]);
  assert.deepEqual(h.windowRef.pushes, ["/lovelace/one?kiosk=1#now"]);
});

test("inside-card mode blocks dashboard swipes without trapping other pages", async () => {
  const h = createHarness({
    allowDashboardNavigation: () => false,
    resolveInternalPageTarget: (direction) =>
      direction === "next" ? "mobile-view" : null,
  });
  h.controller.sync();

  const internal = swipe(h.rootState.eventTarget, {
    path: [plainSurface, h.host],
  });
  assert.equal(internal.prevented, true);
  await flushSwipeMotion();
  assert.deepEqual(h.internalNavigations, ["mobile-view"]);

  h.advance(500);
  const outside = swipe(h.rootState.eventTarget, {
    path: [plainSurface],
  });
  assert.equal(outside.prevented, false);
  assert.deepEqual(h.windowRef.pushes, []);

  h.advance(500);
  const unavailableInside = swipe(h.rootState.eventTarget, {
    startX: 100,
    endX: 280,
    path: [plainSurface, h.host],
  });
  assert.equal(unavailableInside.prevented, true);
  await flushSwipeMotion();
  assert.deepEqual(h.windowRef.pushes, []);
});

test("drawer edge expands only when no page exists to the left", async () => {
  const noPrevious = createHarness();
  noPrevious.controller.sync();
  const nativeResult = swipe(noPrevious.rootState.eventTarget, {
    startX: 40,
    endX: 180,
  });
  assert.equal(nativeResult.prevented, false);
  assert.equal(noPrevious.windowRef.pushes.length, 0);

  const withPrevious = createHarness();
  withPrevious.windowRef.location.pathname = "/lovelace/two";
  withPrevious.rootState.panel.route.path = "/one";
  withPrevious.controller.sync();
  const navigationResult = swipe(withPrevious.rootState.eventTarget, {
    startX: 40,
    endX: 180,
  });
  assert.equal(navigationResult.prevented, true);
  await flushSwipeMotion();
  assert.deepEqual(withPrevious.windowRef.pushes, [
    "/lovelace/one?kiosk=1#now",
  ]);

  const withInternalPrevious = createHarness({
    resolveInternalPageTarget: (direction) =>
      direction === "previous" ? "preview" : null,
  });
  withInternalPrevious.controller.sync();
  const internalResult = swipe(withInternalPrevious.rootState.eventTarget, {
    startX: 40,
    endX: 180,
    path: [plainSurface, withInternalPrevious.host],
  });
  assert.equal(internalResult.prevented, true);
  await flushSwipeMotion();
  assert.deepEqual(withInternalPrevious.internalNavigations, ["preview"]);
});

test("a stale HA route cannot create a swipe target past the final page", async () => {
  const h = createHarness();
  h.windowRef.location.pathname = "/lovelace/three";
  h.rootState.panel.route.path = "/one";
  h.controller.sync();

  swipe(h.rootState.eventTarget, {
    startX: 280,
    endX: 80,
  });
  const transforms = h.rootState.swipeSurface.style.writes
    .filter(({ property, value }) => property === "transform" && value)
    .map(({ value }) => value);
  const pulledOffset = Number(
    transforms[0]?.match(/translateX\(([-\d.]+)px\)/)?.[1],
  );
  assert.equal(pulledOffset < 0 && pulledOffset > -52, true);
  await flushSwipeMotion();
  assert.equal(h.windowRef.pushes.length, 0);
  const settledTransforms = h.rootState.swipeSurface.style.writes
    .filter(({ property, value }) => property === "transform" && value)
    .map(({ value }) =>
      Number(value.match(/translateX\(([-\d.]+)px\)/)?.[1]),
    );
  assert.equal(
    settledTransforms.some((offset) => offset > 0 && offset <= 7),
    true,
  );
  assert.equal(settledTransforms.includes(0), true);
  assert.equal(
    h.rootState.swipeSurface.style.getPropertyValue("transform"),
    "",
  );
});

test("short and edge swipes spring back without navigating", async () => {
  const h = createHarness();
  h.controller.sync();

  swipe(h.rootState.eventTarget, {
    startX: 250,
    endX: 210,
  });
  await flushSwipeMotion();
  assert.equal(h.windowRef.pushes.length, 0);
  assert.equal(
    h.rootState.swipeSurface.style.writes.some(
      ({ property, value }) =>
        property === "transition" &&
        value.includes("cubic-bezier(0.2, 0.78, 0.2, 1.08)"),
    ),
    true,
  );

  const edgeHarness = createHarness();
  edgeHarness.rootState.panel.route.path = "/one";
  edgeHarness.controller.sync();
  swipe(edgeHarness.rootState.eventTarget, {
    startX: 100,
    endX: 260,
  });
  const edgeTransforms = edgeHarness.rootState.swipeSurface.style.writes
    .filter(({ property, value }) => property === "transform" && value)
    .map(({ value }) => value);
  const edgeOffset = Number(
    edgeTransforms[0]?.match(/translateX\(([-\d.]+)px\)/)?.[1],
  );
  assert.equal(edgeOffset > 0 && edgeOffset < 52, true);
  await flushSwipeMotion();
  assert.equal(edgeHarness.windowRef.pushes.length, 0);
  assert.equal(
    edgeHarness.rootState.swipeSurface.style.getPropertyValue("transform"),
    "",
  );
});

test("page motion restores Home Assistant's existing inline styles", async () => {
  const h = createHarness();
  const { style } = h.rootState.swipeSurface;
  style.setProperty("transform", "scale(0.99)", "");
  style.setProperty("transition", "opacity 120ms linear", "");
  style.setProperty("will-change", "opacity", "");
  style.setProperty("backface-visibility", "visible", "");
  style.writes.length = 0;
  h.controller.sync();

  swipe(h.rootState.eventTarget);
  await flushSwipeMotion();

  assert.equal(style.getPropertyValue("transform"), "scale(0.99)");
  assert.equal(
    style.getPropertyValue("transition"),
    "opacity 120ms linear",
  );
  assert.equal(style.getPropertyValue("will-change"), "opacity");
  assert.equal(style.getPropertyValue("backface-visibility"), "visible");
  h.controller.disconnect({ force: true });
});

test("controller yields deliberate controls, native screen edges, and non-touch devices", () => {
  const h = createHarness();
  h.controller.sync();
  const button = { tagName: "BUTTON", matches: () => true };
  swipe(h.rootState.eventTarget, {
    beforeMove: () => h.advance(250),
    path: [button],
  });
  swipe(h.rootState.eventTarget, { startX: 10, endX: 180 });
  assert.equal(h.windowRef.pushes.length, 0);
  h.controller.disconnect({ force: true });

  const noTouch = createHarness({ hasTouch: false });
  assert.equal(noTouch.controller.sync(), false);
  assert.equal(noTouch.rootState.eventTarget.listenerCount("touchstart"), 0);
  assert.equal(noTouch.controller.isCurrentDashboardScope(), true);
});

test("none mode installs a shield without navigating or moving the page", () => {
  const h = createHarness({ isNavigationEnabled: () => false });

  assert.equal(h.controller.sync(), true);
  assert.equal(h.rootState.eventTarget.listenerCount("touchstart"), 1);
  const result = swipe(h.rootState.eventTarget, {
    path: [plainSurface, h.host],
  });
  assert.equal(result.prevented, false);
  assert.deepEqual(result.stopped, {
    start: 1,
    move: 0,
    end: 0,
    immediate: 0,
  });
  assert.deepEqual(h.windowRef.pushes, []);
  assert.deepEqual(h.internalNavigations, []);
  assert.equal(
    h.rootState.swipeSurface.style.writes.some(
      ({ property }) => property === "transform",
    ),
    false,
  );
  assert.equal(h.controller.isCurrentDashboardScope(), true);
});

test("shield rebinds when Home Assistant replaces the inner view surface", async () => {
  const h = createHarness({ isNavigationEnabled: () => false });
  h.controller.sync();
  const previousSurface = h.rootState.eventTarget;
  const replacementSurface = h.rootState.replaceSwipeSurface();

  h.notifyMutations();

  assert.equal(previousSurface.listenerCount("touchstart"), 0);
  assert.equal(replacementSurface.listenerCount("touchstart"), 1);
  const result = swipe(replacementSurface, {
    path: [plainSurface, h.host],
  });
  assert.equal(result.stopped.start, 1);
  assert.equal(result.prevented, false);
  assert.deepEqual(h.windowRef.pushes, []);
});

test("shield waits for a late first-paint view surface", () => {
  const h = createHarness();
  h.rootState.replaceSwipeSurface(null);

  assert.equal(h.controller.sync(), false);
  const replacementSurface = h.rootState.replaceSwipeSurface();
  h.notifyMutations();

  assert.equal(replacementSurface.listenerCount("touchstart"), 1);
});

test("card controls are shielded while HA controls and native edges stay untouched", () => {
  const h = createHarness();
  h.controller.sync();
  const button = {
    tagName: "BUTTON",
    matches: (selector) =>
      selector
        .split(",")
        .map((entry) => entry.trim())
        .includes("button"),
  };

  const cardControl = swipe(h.rootState.eventTarget, {
    beforeMove: () => h.advance(250),
    path: [button, h.host],
  });
  assert.equal(cardControl.stopped.start, 1);
  assert.equal(cardControl.stopped.move, 0);
  assert.equal(cardControl.stopped.end, 0);

  const haControl = swipe(h.rootState.eventTarget, {
    beforeMove: () => h.advance(250),
    path: [button],
  });
  assert.deepEqual(haControl.stopped, {
    start: 0,
    move: 0,
    end: 0,
    immediate: 0,
  });

  const nativeEdge = swipe(h.rootState.eventTarget, {
    startX: 10,
    endX: 180,
  });
  assert.deepEqual(nativeEdge.stopped, {
    start: 0,
    move: 0,
    end: 0,
    immediate: 0,
  });
});

test("controller retries a missing first-paint HUI root without losing enablement", () => {
  const h = createHarness({ deferAnimationFrames: true });
  h.setRootAvailable(false);

  assert.equal(h.controller.sync(), false);
  assert.equal(h.rootState.eventTarget.listenerCount("touchstart"), 0);
  assert.equal(h.pendingAnimationFrames(), 1);

  h.setRootAvailable(true);
  h.runNextAnimationFrame();
  assert.equal(h.rootState.eventTarget.listenerCount("touchstart"), 1);
  h.controller.disconnect({ force: true });
});

test("temporary same-dashboard root loss keeps swipe alive and rebinds", () => {
  const h = createHarness({ deferAnimationFrames: true });
  h.controller.sync();
  const oldTarget = h.rootState.eventTarget;
  h.setRootAvailable(false);
  h.windowRef.emit("location-changed");

  assert.equal(oldTarget.listenerCount("touchstart"), 1);
  assert.equal(h.pendingAnimationFrames(), 1);

  const replacement = createRootAndPanel({
    prefix: "/lovelace",
    path: "/one",
  });
  h.replaceRoot(replacement);
  h.runNextAnimationFrame();
  assert.equal(oldTarget.listenerCount("touchstart"), 0);
  assert.equal(replacement.eventTarget.listenerCount("touchstart"), 1);
  h.controller.disconnect({ force: true });
});

test("enabled swipe navigation survives card disconnects but stops at another dashboard", async () => {
  const h = createHarness();
  h.controller.sync();
  assert.equal(h.controller.isCurrentDashboardScope(), true);
  h.host.isConnected = false;
  h.controller.disconnect();
  assert.equal(h.rootState.eventTarget.listenerCount("touchstart"), 1);

  swipe(h.rootState.eventTarget);
  await flushSwipeMotion();
  assert.equal(h.windowRef.location.pathname, "/lovelace/two");
  assert.deepEqual(h.dashboardSettles, []);

  const oldTarget = h.rootState.eventTarget;
  const otherDashboard = createRootAndPanel({
    prefix: "/other-dashboard",
    path: "/one",
  });
  h.replaceRoot(otherDashboard);
  h.windowRef.location.pathname = "/other-dashboard/one";
  assert.equal(h.controller.isCurrentDashboardScope(), false);
  h.windowRef.emit("location-changed");
  assert.equal(oldTarget.listenerCount("touchstart"), 0);
  assert.equal(otherDashboard.eventTarget.listenerCount("touchstart"), 0);
  assert.equal(h.dashboardScopeExitCount, 1);
  h.controller.disconnect({ force: true });
});
