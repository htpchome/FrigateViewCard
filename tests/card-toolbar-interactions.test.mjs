import assert from "node:assert/strict";
import test from "node:test";

import { BrowseFavoriteMutationController } from "../src/features/browse/favorite-mutation.ctrl.js";

globalThis.window = globalThis.window || { customCards: [] };
globalThis.window.customCards = globalThis.window.customCards || [];
globalThis.document = globalThis.document || {
  createElement: () => ({
    style: {},
    setAttribute() {},
    removeAttribute() {},
    appendChild() {},
    addEventListener() {},
    removeEventListener() {},
    querySelector() {
      return null;
    },
    querySelectorAll() {
      return [];
    },
  }),
  head: { appendChild() {} },
};
globalThis.customElements = globalThis.customElements || {
  define() {},
  get() {
    return undefined;
  },
};
globalThis.HTMLElement =
  globalThis.HTMLElement ||
  class {
    attachShadow() {
      return {
        addEventListener() {},
        removeEventListener() {},
        querySelector() {
          return null;
        },
        querySelectorAll() {
          return [];
        },
      };
    }
  };
globalThis.HTMLImageElement = globalThis.HTMLImageElement || class {};

const { FrigateViewCard } = await import("../src/card/FrigateViewCard.js");

test("grid sizing keeps desktop width while allowing mobile cards to shrink", () => {
  const mobile = FrigateViewCard.prototype.getGridOptions.call({
    _isLikelyMobileClient: () => true,
  });
  const desktop = FrigateViewCard.prototype.getGridOptions.call({
    _isLikelyMobileClient: () => false,
  });

  assert.deepEqual(mobile, { columns: 12, min_columns: 1 });
  assert.deepEqual(desktop, { columns: 12, min_columns: 6 });
});

const createClassList = (...initial) => {
  const values = new Set(initial);
  return {
    add: (...tokens) => tokens.forEach((token) => values.add(token)),
    remove: (...tokens) => tokens.forEach((token) => values.delete(token)),
    contains: (token) => values.has(token),
  };
};

test("event tab clicks dispatch from the page-shell tabs region", () => {
  const calls = [];
  const tabsRegion = {};
  const tabButton = {
    dataset: { tab: "clips" },
    closest: (selector) =>
      selector === '[data-fvc-region="tabs"]' ? tabsRegion : null,
  };
  const target = {
    closest: (selector) => (selector === "[data-tab]" ? tabButton : null),
  };

  const handled =
    FrigateViewCard.prototype._handleBrowsePanelToolbarClick.call(
      { _setTab: (tab) => calls.push(tab) },
      target,
    );

  assert.equal(handled, true);
  assert.deepEqual(calls, ["clips"]);
});

test("data-tab outside the tabs region is not treated as a toolbar tab", () => {
  const tabButton = {
    dataset: { tab: "clips" },
    closest: () => null,
  };
  const target = {
    closest: (selector) => (selector === "[data-tab]" ? tabButton : null),
  };

  const handled =
    FrigateViewCard.prototype._handleBrowsePanelToolbarClick.call(
      { _setTab: () => assert.fail("unexpected tab change") },
      target,
    );

  assert.equal(handled, false);
});

test("recordings keeps the shared Filter control disabled across page layouts", () => {
  const inactivePage = {
    isActive: () => false,
    alertTakeoverEnabled: () => false,
  };
  const context = {
    _tab: "recordings",
    _slideshowActive: false,
    _twoWayTalkStarting: false,
    _twoWayTalkSession: null,
    _singleViewPageController: inactivePage,
    _wideViewPageController: {
      isWideViewPageActive: () => false,
      companionAlertTakeoverEnabled: () => false,
    },
    _mobileViewPageController: inactivePage,
    _cardViewPageController: {
      isPtzActive: () => false,
      alertTakeoverEnabled: () => false,
    },
    _isCardViewPageActive: () => false,
    _isControlsButtonVisible: () => false,
    _isGridSessionActive: () => false,
  };

  assert.equal(
    FrigateViewCard.prototype._toolbarButtonStates.call(context)
      .filterDisabled,
    true,
  );

  context._tab = "alerts";
  assert.equal(
    FrigateViewCard.prototype._toolbarButtonStates.call(context)
      .filterDisabled,
    false,
  );
});

test("Single View alert takeover toolbar button reaches its controller", () => {
  const calls = [];
  const button = { disabled: false };
  const target = {
    closest: (selector) =>
      selector === "#single-alert-takeover-btn" ? button : null,
  };

  const handled = FrigateViewCard.prototype._handleTopToolbarClick.call(
    {
      _singleViewPageController: {
        toggleAlertTakeover: () => calls.push("toggle"),
      },
    },
    target,
  );

  assert.equal(handled, true);
  assert.deepEqual(calls, ["toggle"]);
});

test("desktop Mobile View alert takeover reaches its page controller", () => {
  const calls = [];
  const button = { disabled: false };
  const target = {
    closest: (selector) =>
      selector === "#mobile-alert-takeover-btn" ? button : null,
  };

  const handled = FrigateViewCard.prototype._handleTopToolbarClick.call(
    {
      _mobileViewPageController: {
        toggleAlertTakeover: () => calls.push("toggle"),
      },
    },
    target,
  );

  assert.equal(handled, true);
  assert.deepEqual(calls, ["toggle"]);
});

test("Mobile View back navigates to the resolved Preview or Single View target", () => {
  const calls = [];
  let destination = "preview";
  const context = {
    _pageNavigationController: {
      resolveBackPageTarget: () => destination,
      navigateToPageRoute: (pageId, options) =>
        calls.push([pageId, options]),
    },
  };
  const target = {
    closest: (selector) => (selector === "[data-page-back]" ? {} : null),
  };

  assert.equal(
    FrigateViewCard.prototype._handlePreviewSidebarClick.call(
      context,
      target,
    ),
    true,
  );
  destination = "single-view";
  assert.equal(
    FrigateViewCard.prototype._handlePreviewSidebarClick.call(
      context,
      target,
    ),
    true,
  );
  assert.deepEqual(calls, [
    ["preview", { source: "mobile-view-back" }],
    ["single-view", { source: "mobile-view-back" }],
  ]);
});

test("mobile-device detection disables takeover before page defaults", () => {
  assert.equal(
    FrigateViewCard.prototype._isAlertCameraTakeoverAvailable.call({
      _isLikelyMobileClient: () => true,
    }),
    false,
  );
  const enabled =
    FrigateViewCard.prototype._alertCameraTakeoverEnabled.call({
      _isAlertCameraTakeoverAvailable: () => false,
      _isCardViewPageActive: () => true,
      _cardViewPageController: {
        alertTakeoverEnabled: () =>
          assert.fail("mobile must not consult configured page defaults"),
      },
    });

  assert.equal(enabled, false);
});

test("rotate-to-fullscreen is limited to opted-in phones outside editor contexts", () => {
  const context = {
    _config: { mobile_view_rotate_to_fullscreen: true },
    _isLikelyPhoneClient: () => true,
    _isPreviewContext: () => false,
    _isDashboardEditMode: () => false,
    _isCardEditorDialogOpen: () => false,
  };
  const enabled = () =>
    FrigateViewCard.prototype._isRotateToFullscreenEnabled.call(context);

  assert.equal(enabled(), true);

  context._config.mobile_view_rotate_to_fullscreen = false;
  assert.equal(enabled(), false);
  delete context._config.mobile_view_rotate_to_fullscreen;
  assert.equal(enabled(), false);

  context._config.mobile_view_rotate_to_fullscreen = true;
  context._isLikelyPhoneClient = () => false;
  assert.equal(enabled(), false);

  context._isLikelyPhoneClient = () => true;
  context._isPreviewContext = () => true;
  assert.equal(enabled(), false);

  context._isPreviewContext = () => false;
  context._isDashboardEditMode = () => true;
  assert.equal(enabled(), false);

  context._isDashboardEditMode = () => false;
  context._isCardEditorDialogOpen = () => true;
  assert.equal(enabled(), false);
});

test("rotated fullscreen dismissal ends only the active overlay session", () => {
  const calls = [];
  const context = {
    _rotateOverlayActive: true,
    _rotateOverlayMode: "live",
    _rotateLiveOverlayDismissed: false,
    _updateRotateOverlayState: () => calls.push("update"),
  };

  assert.equal(
    FrigateViewCard.prototype._dismissRotateOverlay.call(context),
    true,
  );
  assert.equal(context._rotateLiveOverlayDismissed, true);
  assert.deepEqual(calls, ["update"]);

  context._rotateOverlayActive = false;
  assert.equal(
    FrigateViewCard.prototype._dismissRotateOverlay.call(context),
    false,
  );
  assert.deepEqual(calls, ["update"]);

  context._rotateOverlayActive = true;
  context._rotateOverlayMode = "popup";
  assert.equal(
    FrigateViewCard.prototype._dismissRotateOverlay.call(context),
    false,
  );
  assert.deepEqual(calls, ["update"]);
});

test("editor layout changes reevaluate an active rotate overlay", () => {
  const originalRequestAnimationFrame = globalThis.requestAnimationFrame;
  const frames = [];
  const calls = [];
  globalThis.requestAnimationFrame = (callback) => {
    frames.push(callback);
    return frames.length;
  };
  const context = {
    _editorLayoutSyncRaf: 0,
    isConnected: true,
    _haNavbarController: { sync: () => calls.push("navbar") },
    _applyCardStyle: () => calls.push("style"),
    _wideViewPageController: {
      syncColHeightIfWideView: () => calls.push("wide"),
    },
    _scheduleRotateOverlayUpdate: () => calls.push("rotate"),
  };

  try {
    FrigateViewCard.prototype._scheduleEditorLayoutSync.call(context);
    assert.equal(frames.length, 1);
    frames.shift()();
    assert.equal(frames.length, 1);
    frames.shift()();
  } finally {
    if (originalRequestAnimationFrame === undefined) {
      delete globalThis.requestAnimationFrame;
    } else {
      globalThis.requestAnimationFrame = originalRequestAnimationFrame;
    }
  }

  assert.deepEqual(calls, ["navbar", "style", "wide", "rotate"]);
  assert.equal(context._editorLayoutSyncRaf, 0);
});

test("toast reuses the card notification and places favorite feedback over browse", () => {
  const properties = new Map();
  const toast = {
    classList: createClassList("toast"),
    dataset: {},
    hidden: true,
    style: {
      removeProperty: (name) => properties.delete(name),
      setProperty: (name, value) => properties.set(name, value),
    },
    textContent: "",
  };
  const card = {
    getBoundingClientRect: () => ({ left: 100, top: 50, width: 600 }),
  };
  const browse = {
    getBoundingClientRect: () => ({ left: 400, top: 200, width: 280 }),
  };
  const context = {
    _$: (selector) => (selector === "#toast" ? toast : card),
    _pageShellRegion: (region) => (region === "browse" ? browse : null),
    _toastT: null,
  };

  FrigateViewCard.prototype._toast.call(context, "Added to Favorites", {
    duration: 10000,
    placement: "browse",
    tone: "success",
  });

  assert.equal(toast.textContent, "Added to Favorites");
  assert.equal(toast.hidden, false);
  assert.equal(toast.classList.contains("toast--success"), true);
  assert.equal(toast.classList.contains("toast--warning"), false);
  assert.equal(toast.classList.contains("toast--error"), false);
  assert.equal(toast.classList.contains("toast--browse"), true);
  assert.equal(toast.dataset.placement, "browse");
  assert.equal(properties.get("--fvc-toast-browse-left"), "440px");
  assert.equal(properties.get("--fvc-toast-browse-top"), "160px");
  assert.equal(properties.get("--fvc-toast-browse-max-width"), "260px");
  clearTimeout(context._toastT);
});

test("favorite feedback can be placed over a Card View popup", () => {
  const properties = new Map();
  const toast = {
    classList: createClassList("toast"),
    dataset: {},
    hidden: true,
    style: {
      removeProperty: (name) => properties.delete(name),
      setProperty: (name, value) => properties.set(name, value),
    },
    textContent: "",
  };
  const card = {
    getBoundingClientRect: () => ({ left: 100, top: 50, width: 600 }),
  };
  const viewer = {
    getBoundingClientRect: () => ({ left: 120, top: 80, width: 400 }),
  };
  const context = {
    _$: (selector) =>
      selector === "#toast" ? toast : selector === "#viewer" ? viewer : card,
    _pageShellRegion: () => null,
    _toastT: null,
  };

  FrigateViewCard.prototype._toast.call(context, "Added to Favorites", {
    duration: 10000,
    placement: "popup",
    tone: "success",
  });

  assert.equal(toast.classList.contains("toast--popup"), true);
  assert.equal(toast.dataset.placement, "popup");
  assert.equal(properties.get("--fvc-toast-popup-left"), "220px");
  assert.equal(properties.get("--fvc-toast-popup-top"), "74px");
  assert.equal(properties.get("--fvc-toast-popup-max-width"), "380px");
  clearTimeout(context._toastT);
});

const createFavoriteContext = ({ callWS, retained = false }) => {
  const event = {
    id: "event-1",
    camera: "front",
    retain_indefinitely: retained,
  };
  const cameraContext = {
    clientId: "frigate",
    events: [event],
    kept: retained ? [event] : [],
  };
  const notifications = [];
  const context = {
    _activeCam: { entity: "camera.front" },
    _camCache: { "camera.front": cameraContext },
    _config: {
      cameras: [{ entity: "camera.front" }],
      favorites_mixed_cameras: false,
    },
    _events: [event],
    _kept: retained ? [event] : [],
    _findEventById: () => event,
    _frigateContextForCameraName: () => cameraContext,
    _cc: () => cameraContext,
    _hass: { callWS },
    _renderList() {},
    _toast: (...args) => notifications.push(args),
  };
  context._browseFavoriteMutationController =
    new BrowseFavoriteMutationController(context, { warn: () => {} });
  return { context, notifications };
};

test("favorite confirmation uses the browse success toast after Frigate accepts it", async () => {
  const requests = [];
  const { context, notifications } = createFavoriteContext({
    callWS: async (payload) => requests.push(payload),
  });

  await FrigateViewCard.prototype._toggleFav.call(context, "event-1");

  assert.deepEqual(requests, [
    {
      type: "frigate/event/retain",
      instance_id: "frigate",
      event_id: "event-1",
      retain: true,
    },
  ]);
  assert.deepEqual(notifications, [
    [
      "Added to Favorites",
      {
        tone: "success",
        placement: "browse",
        localizationKey: "runtime.notifications.favoritesAdded",
      },
    ],
  ]);
});

test("popup favorite confirmation returns state and uses popup placement", async () => {
  const { context, notifications } = createFavoriteContext({
    callWS: async () => {},
  });

  const retained = await FrigateViewCard.prototype._toggleFav.call(
    context,
    "event-1",
    { toastPlacement: "popup" },
  );

  assert.equal(retained, true);
  assert.deepEqual(notifications, [
    [
      "Added to Favorites",
      {
        tone: "success",
        placement: "popup",
        localizationKey: "runtime.notifications.favoritesAdded",
      },
    ],
  ]);
});

test("favorite removal uses the browse warning toast after Frigate accepts it", async () => {
  const requests = [];
  const { context, notifications } = createFavoriteContext({
    retained: true,
    callWS: async (payload) => requests.push(payload),
  });

  const retained = await FrigateViewCard.prototype._toggleFav.call(
    context,
    "event-1",
  );

  assert.equal(retained, false);
  assert.equal(requests[0].retain, false);
  assert.deepEqual(notifications, [
    [
      "Removed from Favorites",
      {
        tone: "warning",
        placement: "browse",
        localizationKey: "runtime.notifications.favoritesRemoved",
      },
    ],
  ]);
});

test("favorite failure rolls back and uses the browse error toast", async () => {
  const { context, notifications } = createFavoriteContext({
    callWS: async () => {
      throw new Error("retain failed");
    },
  });
  const retained = await FrigateViewCard.prototype._toggleFav.call(
    context,
    "event-1",
  );
  assert.equal(retained, false);

  assert.equal(context._events[0].retain_indefinitely, false);
  assert.deepEqual(notifications, [
    [
      "Could not add to Favorites",
      {
        tone: "error",
        placement: "browse",
        localizationKey: "runtime.notifications.favoritesAddFailed",
      },
    ],
  ]);
});

test("favorite removal failure keeps its localized error key", async () => {
  const { context, notifications } = createFavoriteContext({
    retained: true,
    callWS: async () => {
      throw new Error("retain failed");
    },
  });
  assert.equal(
    await FrigateViewCard.prototype._toggleFav.call(context, "event-1"),
    true,
  );
  assert.deepEqual(notifications, [
    [
      "Could not remove from Favorites",
      {
        tone: "error",
        placement: "browse",
        localizationKey: "runtime.notifications.favoritesRemoveFailed",
      },
    ],
  ]);
});
