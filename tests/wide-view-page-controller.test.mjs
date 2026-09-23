import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

import { WideViewPageController } from "../src/features/wide-view/page.ctrl.js";

const PAGE_IDS = { preview: "preview", wideView: "wide-view" };
const cardSource = fs.readFileSync(
  new URL("../src/card/FrigateViewCard.js", import.meta.url),
  "utf8",
);
const cardEventBindingsSource = fs.readFileSync(
  new URL("../src/card/event-bindings.js", import.meta.url),
  "utf8",
);

const createEventTarget = () => {
  const listeners = new Map();
  return {
    addEventListener(type, listener, options = {}) {
      if (!listeners.has(type)) listeners.set(type, new Set());
      listeners.get(type).add(listener);
      options.signal?.addEventListener(
        "abort",
        () => listeners.get(type)?.delete(listener),
        { once: true },
      );
    },
    dispatch(type, event = {}) {
      for (const listener of [...(listeners.get(type) || [])]) {
        listener({ type, ...event });
      }
    },
    listenerCount(type) {
      return listeners.get(type)?.size || 0;
    },
  };
};

const createResizeHandle = (ownerDocument) => {
  const target = createEventTarget();
  const classes = new Set();
  return {
    ...target,
    ownerDocument,
    classList: {
      add: (name) => classes.add(name),
      remove: (name) => classes.delete(name),
      contains: (name) => classes.has(name),
    },
  };
};

const createHost = ({ isWide = false, popupOpen = false } = {}) => {
  const calls = [];
  const host = {
    _pageId: isWide ? "wide-view" : "single-view",
    _viewMode: "single",
    _slideshowActive: false,
    _config: {},
    _stopPreviewMode: () => calls.push(["stopPreview"]),
    _$: (selector) => {
      if (selector === "#myPopup" && popupOpen) {
        return {
          classList: {
            contains: (className) => className === "is-open",
          },
        };
      }
      return null;
    },
    _popupLifecycleController: {
      close: () => calls.push(["closePopup"]),
    },
    _cancelPendingMount: (reason) => calls.push(["cancelPendingMount", reason]),
    _applyPreviewShellVisibility: () =>
      calls.push(["applyPreviewShellVisibility"]),
    _applyCardStyle: () => calls.push(["applyCardStyle"]),
    _setViewMode: (mode) => {
      host._viewMode = mode;
      calls.push(["setViewMode", mode]);
    },
    _mountEngine: (...args) => calls.push(["mountEngine", ...args]),
    _renderShellPreserveLive: () => calls.push(["renderShellPreserveLive"]),
    _syncTabsShell: () => calls.push(["syncTabsShell"]),
    _renderAll: () => calls.push(["renderAll"]),
  };
  return { host, calls };
};

test("activateWideViewPageRoute handles startup and mounts engine", () => {
  const { host, calls } = createHost({ isWide: true });
  const controller = new WideViewPageController(host, { PAGE_IDS });
  controller.applyLayoutModeForCard = () => calls.push(["applyLayoutMode"]);
  controller.syncColHeight = () => calls.push(["syncColHeight"]);

  controller.activateWideViewPageRoute({ startup: true });

  assert.deepEqual(calls, [
    ["applyPreviewShellVisibility"],
    ["applyCardStyle"],
    ["applyLayoutMode"],
    ["syncColHeight"],
    ["mountEngine"],
    ["renderAll"],
  ]);
});

test("activateWideViewPageRoute starts the Companion Camera session", () => {
  const { host, calls } = createHost({ isWide: true });
  const companionController = {
    start: () => calls.push(["startCompanions"]),
  };
  const controller = new WideViewPageController(
    host,
    { PAGE_IDS },
    { companionController },
  );
  controller.applyLayoutModeForCard = () => calls.push(["applyLayoutMode"]);
  controller.syncColHeight = () => calls.push(["syncColHeight"]);

  controller.activateWideViewPageRoute({ startup: true });

  assert.deepEqual(calls.slice(-2), [["renderAll"], ["startCompanions"]]);
});

test("Wide View applies its configured Slideshow start mode", () => {
  const { host, calls } = createHost({ isWide: true });
  host._config.wide_view_start_mode = "slideshow";
  host._isGridModeAvailable = () => true;
  host._isSlideshowRotationAvailable = () => true;
  host._startSlideshowRotation = (source) => {
    host._slideshowActive = true;
    calls.push(["startSlideshow", source]);
    return true;
  };
  const companionController = {
    start: () => calls.push(["startCompanions"]),
  };
  const controller = new WideViewPageController(
    host,
    { PAGE_IDS },
    { companionController },
  );
  controller.applyLayoutModeForCard = () => calls.push(["applyLayoutMode"]);
  controller.syncColHeight = () => calls.push(["syncColHeight"]);

  controller.activateWideViewPageRoute({ startup: true });

  assert.deepEqual(calls.slice(-2), [
    ["startSlideshow", "wide-view-start"],
    ["startCompanions"],
  ]);
});

test("Wide View owns Timeline rendering and interaction delegation", () => {
  const { host, calls } = createHost({ isWide: true });
  const timelineController = {
    buildRegionMarkup: () => "<aside>Timeline</aside>",
    bind: () => calls.push(["bindTimeline"]),
    scheduleRender: (options) => calls.push(["scheduleTimeline", options]),
    handleClick: (event, target) => {
      calls.push(["timelineClick", event, target]);
      return true;
    },
    applyConfigUpdate: (options) =>
      calls.push(["timelineConfig", options]),
    teardown: (options) => calls.push(["teardownTimeline", options]),
  };
  const controller = new WideViewPageController(
    host,
    { PAGE_IDS },
    { timelineController },
  );
  const event = { type: "click" };
  const target = { id: "timeline-target" };

  assert.equal(
    controller.buildTimelineRegionMarkup(),
    "<aside>Timeline</aside>",
  );
  controller.bindTimeline();
  controller.renderTimeline({ force: true });
  assert.equal(controller.handleTimelineClick(event, target), true);
  controller.applyTimelineConfigUpdate({ enabledChanged: true });
  controller.teardownTimeline({ preserveScroll: true });

  assert.deepEqual(calls, [
    ["bindTimeline"],
    ["scheduleTimeline", { force: true }],
    ["timelineClick", event, target],
    ["timelineConfig", { enabledChanged: true }],
    ["teardownTimeline", { preserveScroll: true }],
  ]);
});

test("stopping Wide View tears down both companions and Timeline", () => {
  const { host, calls } = createHost({ isWide: true });
  const controller = new WideViewPageController(
    host,
    { PAGE_IDS },
    {
      companionController: { stop: () => calls.push(["stopCompanions"]) },
      timelineController: {
        teardown: (options) => calls.push(["teardownTimeline", options]),
      },
    },
  );

  controller.stopWideViewMode();

  assert.deepEqual(calls, [
    ["stopCompanions"],
    ["teardownTimeline", { preserveScroll: true }],
  ]);
});

test("activateWideViewPageRoute startup grid chooses grid mode", () => {
  const { host, calls } = createHost({ isWide: true });
  const controller = new WideViewPageController(host, { PAGE_IDS });
  controller.applyLayoutModeForCard = () => calls.push(["applyLayoutMode"]);
  controller.syncColHeight = () => calls.push(["syncColHeight"]);

  controller.activateWideViewPageRoute({ startup: true, startInGrid: true });

  assert.deepEqual(calls, [
    ["applyPreviewShellVisibility"],
    ["applyCardStyle"],
    ["applyLayoutMode"],
    ["syncColHeight"],
    ["setViewMode", "grid"],
  ]);
});

test("activateWideViewPageRoute leaves preview and preserves live media", () => {
  const { host, calls } = createHost({ isWide: true, popupOpen: true });
  const controller = new WideViewPageController(host, { PAGE_IDS });
  controller.applyLayoutModeForCard = () => calls.push(["applyLayoutMode"]);
  controller.syncColHeight = () => calls.push(["syncColHeight"]);

  controller.activateWideViewPageRoute({ previousPageId: "preview" });

  assert.deepEqual(calls, [
    ["stopPreview"],
    ["closePopup"],
    ["renderShellPreserveLive"],
    ["syncTabsShell"],
    ["renderAll"],
  ]);
});

test("activateWideViewPageRoute honors deferCameraSwitch", () => {
  const { host, calls } = createHost({ isWide: true });
  const controller = new WideViewPageController(host, { PAGE_IDS });
  controller.applyLayoutModeForCard = () => calls.push(["applyLayoutMode"]);
  controller.syncColHeight = () => calls.push(["syncColHeight"]);

  controller.activateWideViewPageRoute({ deferCameraSwitch: true });

  assert.deepEqual(calls, [
    ["renderShellPreserveLive"],
    ["syncTabsShell"],
    ["renderAll"],
  ]);
});

test("isWideViewPageActive derives state from host page id", () => {
  const { host } = createHost({ isWide: true });
  const controller = new WideViewPageController(host, { PAGE_IDS });

  assert.equal(controller.isWideViewPageActive(), true);

  host._pageId = "single-view";
  assert.equal(controller.isWideViewPageActive(), false);
});

test("syncColHeightIfWideView syncs only for wide route", () => {
  const wide = createHost({ isWide: true });
  const wideController = new WideViewPageController(wide.host, { PAGE_IDS });
  wideController.syncColHeight = () => wide.calls.push(["syncColHeight"]);
  wideController.syncColHeightIfWideView();
  assert.deepEqual(wide.calls, [["syncColHeight"]]);

  const single = createHost({ isWide: false });
  const singleController = new WideViewPageController(single.host, {
    PAGE_IDS,
  });
  singleController.syncColHeight = () => single.calls.push(["syncColHeight"]);
  singleController.syncColHeightIfWideView();
  assert.deepEqual(single.calls, []);
});

test("card resize observation resyncs wide-view column height", () => {
  assert.match(
    cardSource,
    /_setupResizeObserver\(\)[\s\S]*?this\._wideViewPageController\.syncColHeightIfWideView\(\);[\s\S]*?this\._ro\.observe\(this\);/,
  );
});

test("card visibility and reconnect hooks resume Companion Camera media", () => {
  assert.match(
    cardSource,
    /connectedCallback\(\)[\s\S]*?_wideViewPageController\?\.startCompanionMode\?\.\(\)/,
  );
  assert.match(
    cardEventBindingsSource,
    /visibilityState === "visible"[\s\S]*?_wideViewPageController\?\.resumeCompanionMedia\?\.\(\)/,
  );
  assert.match(
    cardSource,
    /e\?\.isIntersecting[\s\S]*?_wideViewPageController\?\.resumeCompanionMedia\?\.\(\)/,
  );
  assert.match(
    cardSource,
    /connectedCallback\(\)[\s\S]*?_wideViewPageController\?\.initResizeHandle\?\.\(\)/,
  );
  assert.match(
    cardSource,
    /disconnectedCallback\(\)[\s\S]*?_wideViewPageController\?\.disconnectResizeHandle\?\.\(\)/,
  );
  assert.match(
    cardSource,
    /_teardownDisconnected\(\)[\s\S]*?_wideViewPageController\?\.dispose\?\.\(\)/,
  );
});

test("wideViewLayoutState resolves wide layout widths with clamping", () => {
  const wide = createHost({ isWide: true });
  const wideController = new WideViewPageController(wide.host, { PAGE_IDS });

  assert.deepEqual(wideController.wideViewLayoutState("120"), {
    isWide: true,
    leftWidth: "75%",
    rightWidth: "25%",
  });
  assert.deepEqual(wideController.wideViewLayoutState("5"), {
    isWide: true,
    leftWidth: "25%",
    rightWidth: "75%",
  });
  assert.deepEqual(wideController.wideViewLayoutState("65"), {
    isWide: true,
    leftWidth: "65%",
    rightWidth: "35%",
  });

  const single = createHost({ isWide: false });
  const singleController = new WideViewPageController(single.host, {
    PAGE_IDS,
  });
  assert.deepEqual(singleController.wideViewLayoutState("65"), {
    isWide: false,
    leftWidth: "",
    rightWidth: "",
  });
});

test("applyWideLayoutMode applies wide class and widths", () => {
  const { host } = createHost({ isWide: true });
  const controller = new WideViewPageController(host, { PAGE_IDS });

  const colL = { style: { width: "" } };
  const colR = { style: { width: "" } };
  const toggles = [];
  const layout = {
    classList: {
      toggle: (className, enabled) => toggles.push([className, enabled]),
    },
    querySelector: (selector) => {
      if (selector === ".col-left") return colL;
      if (selector === ".col-right") return colR;
      return null;
    },
  };

  controller.applyWideLayoutMode(layout, "65");

  assert.deepEqual(toggles, [["wide-view", true]]);
  assert.equal(colL.style.width, "65%");
  assert.equal(colR.style.width, "35%");
});

test("wideViewLayoutState uses hardened width defaults and limits", () => {
  const { host } = createHost({ isWide: true });
  const controller = new WideViewPageController(host, { PAGE_IDS });

  assert.equal(controller.wideViewLayoutState().leftWidth, "60%");
  assert.equal(controller.wideViewLayoutState("10").leftWidth, "25%");
  assert.equal(controller.wideViewLayoutState("90").leftWidth, "75%");
});

test("applyLayoutModeForCard resolves layout and applies widths", () => {
  const { host } = createHost({ isWide: true });
  host._config = { col_left_width_pct: "61" };
  const controller = new WideViewPageController(host, { PAGE_IDS });
  const layout = { marker: "layout" };
  host.shadowRoot = {
    querySelector: (selector) => (selector === "#layout" ? layout : null),
  };

  let capturedLayout = null;
  let capturedPct = null;
  controller.applyWideLayoutMode = (nextLayout, leftWidthPct) => {
    capturedLayout = nextLayout;
    capturedPct = leftWidthPct;
  };

  controller.applyLayoutModeForCard();

  assert.equal(capturedLayout, layout);
  assert.equal(capturedPct, "61");
});

test("applyWideLayoutMode clears widths for non-wide route", () => {
  const { host } = createHost({ isWide: false });
  const controller = new WideViewPageController(host, { PAGE_IDS });

  const colL = { style: { width: "77%" } };
  const colR = { style: { width: "23%" } };
  const toggles = [];
  const layout = {
    classList: {
      toggle: (className, enabled) => toggles.push([className, enabled]),
    },
    querySelector: (selector) => {
      if (selector === ".col-left") return colL;
      if (selector === ".col-right") return colR;
      return null;
    },
  };

  controller.applyWideLayoutMode(layout, "65");

  assert.deepEqual(toggles, [["wide-view", false]]);
  assert.equal(colL.style.width, "");
  assert.equal(colR.style.width, "");
});

test("syncColHeight applies right-column maxHeight from left-column height", () => {
  const { host } = createHost({ isWide: true });
  const controller = new WideViewPageController(host, { PAGE_IDS });
  const left = { offsetHeight: 240 };
  const right = { style: { maxHeight: "" } };
  host.shadowRoot = {
    querySelector: (selector) => {
      if (selector === ".col-left") return left;
      if (selector === ".col-right") return right;
      return null;
    },
  };

  const previousRaf = globalThis.requestAnimationFrame;
  globalThis.requestAnimationFrame = (callback) => {
    callback();
    return 0;
  };
  try {
    controller.syncColHeight();
  } finally {
    globalThis.requestAnimationFrame = previousRaf;
  }

  assert.equal(right.style.maxHeight, "240px");
});

test("syncColHeight uses ResizeObserver measurements without offset reads", () => {
  const { host } = createHost({ isWide: true });
  let resizeCallback = null;
  let observed = null;
  class FakeResizeObserver {
    constructor(callback) {
      resizeCallback = callback;
    }

    observe(target) {
      observed = target;
    }

    disconnect() {}
  }
  const left = {};
  Object.defineProperty(left, "offsetHeight", {
    get: () => {
      throw new Error("read offsetHeight");
    },
  });
  const right = { style: { maxHeight: "" } };
  host.shadowRoot = {
    querySelector: (selector) =>
      selector === ".col-left" ? left : right,
  };
  const controller = new WideViewPageController(
    host,
    { PAGE_IDS },
    { resizeObserverCtor: FakeResizeObserver },
  );

  controller.syncColHeight();
  assert.equal(observed, left);
  resizeCallback([
    { target: left, borderBoxSize: [{ blockSize: 315 }] },
  ]);
  assert.equal(right.style.maxHeight, "315px");
});

test("syncColHeight is a no-op when columns are missing", () => {
  const { host } = createHost({ isWide: true });
  const controller = new WideViewPageController(host, { PAGE_IDS });
  const right = { style: { maxHeight: "88px" } };
  host.shadowRoot = {
    querySelector: (selector) => {
      if (selector === ".col-left") return null;
      if (selector === ".col-right") return right;
      return null;
    },
  };

  const previousRaf = globalThis.requestAnimationFrame;
  globalThis.requestAnimationFrame = (callback) => {
    callback();
    return 0;
  };
  try {
    controller.syncColHeight();
  } finally {
    globalThis.requestAnimationFrame = previousRaf;
  }

  assert.equal(right.style.maxHeight, "88px");
});

test("Wide View resize drag is cancelled by every terminal interaction", () => {
  const documentTarget = createEventTarget();
  const windowTarget = createEventTarget();
  documentTarget.defaultView = windowTarget;
  const handle = createResizeHandle(documentTarget);
  const layout = { getBoundingClientRect: () => ({ width: 1000 }) };
  const colL = {
    style: { width: "" },
    getBoundingClientRect: () => ({ width: 600 }),
  };
  const colR = { style: { width: "" } };
  const { host } = createHost({ isWide: true });
  host._$ = (selector) => {
    if (selector === "#resize-handle") return handle;
    if (selector === "#layout") return layout;
    if (selector === ".col-left") return colL;
    if (selector === ".col-right") return colR;
    return null;
  };
  const controller = new WideViewPageController(
    host,
    { PAGE_IDS },
    {
      documentTarget,
      windowTarget,
      requestFrame: (callback) => {
        callback();
        return 1;
      },
    },
  );
  controller.initResizeHandle();

  const cancellations = [
    [documentTarget, "mouseup"],
    [documentTarget, "mouseleave"],
    [documentTarget, "pointercancel"],
    [windowTarget, "blur"],
  ];
  for (const [target, type] of cancellations) {
    handle.dispatch("mousedown", { clientX: 600, preventDefault() {} });
    assert.equal(handle.classList.contains("active"), true);
    assert.equal(documentTarget.listenerCount("mousemove"), 1);

    documentTarget.dispatch("mousemove", { clientX: 700 });
    assert.equal(colL.style.width, "70%");
    assert.equal(colR.style.width, "30%");

    target.dispatch(type);
    assert.equal(handle.classList.contains("active"), false);
    assert.equal(documentTarget.listenerCount("mousemove"), 0);
  }
});

test("Wide View resize handle rebind and disposal release stale elements", () => {
  const documentTarget = createEventTarget();
  const windowTarget = createEventTarget();
  documentTarget.defaultView = windowTarget;
  const firstHandle = createResizeHandle(documentTarget);
  const secondHandle = createResizeHandle(documentTarget);
  let activeHandle = firstHandle;
  const { host } = createHost({ isWide: true });
  host._$ = (selector) =>
    selector === "#resize-handle" ? activeHandle : null;
  const controller = new WideViewPageController(
    host,
    { PAGE_IDS },
    { documentTarget, windowTarget },
  );

  controller.initResizeHandle();
  assert.equal(firstHandle.listenerCount("mousedown"), 1);

  activeHandle = secondHandle;
  controller.initResizeHandle();
  assert.equal(firstHandle.listenerCount("mousedown"), 0);
  assert.equal(secondHandle.listenerCount("mousedown"), 1);

  controller.disconnectResizeHandle();
  assert.equal(secondHandle.listenerCount("mousedown"), 0);

  controller.initResizeHandle();
  assert.equal(secondHandle.listenerCount("mousedown"), 1);

  controller.dispose();
  assert.equal(secondHandle.listenerCount("mousedown"), 0);
});

test("syncColHeight coalesces work to one pending animation frame", () => {
  const callbacks = new Map();
  const cancelled = [];
  let nextFrameId = 1;
  let updateCount = 0;
  const left = { offsetHeight: 240 };
  const right = { style: { maxHeight: "" } };
  const { host } = createHost({ isWide: true });
  host.shadowRoot = {
    querySelector: (selector) => {
      if (selector === ".col-left") return left;
      if (selector === ".col-right") return right;
      return null;
    },
  };
  const controller = new WideViewPageController(
    host,
    { PAGE_IDS },
    {
      companionController: {
        updateLayout: () => {
          updateCount += 1;
        },
      },
      requestFrame: (callback) => {
        const frameId = nextFrameId;
        nextFrameId += 1;
        callbacks.set(frameId, callback);
        return frameId;
      },
      cancelFrame: (frameId) => {
        cancelled.push(frameId);
        callbacks.delete(frameId);
      },
    },
  );

  controller.syncColHeight();
  controller.syncColHeight();
  controller.syncColHeight();
  assert.deepEqual([...callbacks.keys()], [1]);

  callbacks.get(1)();
  callbacks.delete(1);
  assert.equal(updateCount, 1);
  assert.equal(right.style.maxHeight, "240px");

  controller.syncColHeight();
  assert.deepEqual([...callbacks.keys()], [2]);
  controller.dispose();
  assert.deepEqual(cancelled, [2]);
  assert.equal(callbacks.size, 0);
});
