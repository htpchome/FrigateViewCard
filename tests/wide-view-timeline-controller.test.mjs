import { test } from "node:test";
import assert from "node:assert/strict";

import {
  isWideTimelineScrollbarPointer,
  resolveWideTimelineCameraContextKey,
  WideViewTimelineController,
} from "../src/features/wide-view/timeline.ctrl.js";

const classList = () => {
  const values = new Set();
  return {
    toggle: (name, enabled) => {
      if (enabled) values.add(name);
      else values.delete(name);
    },
    add: (name) => values.add(name),
    remove: (name) => values.delete(name),
    contains: (name) => values.has(name),
  };
};

const fakeElement = (overrides = {}) => ({
  classList: classList(),
  style: {
    values: new Map(),
    setProperty(name, value) {
      this.values.set(name, value);
    },
  },
  dataset: {},
  innerHTML: "",
  textContent: "",
  clientWidth: 800,
  clientHeight: 480,
  scrollTop: 0,
  addEventListener: () => {},
  removeEventListener: () => {},
  setAttribute(name, value) {
    this[name] = value;
  },
  focus: () => {},
  getBoundingClientRect: () => ({ width: 800, height: 480 }),
  ...overrides,
});

test("A/B timeline context stays mixed and stable across member focus", () => {
  const cameraMembers = ["camera.porch", "camera.driveway"];
  const groupKey = resolveWideTimelineCameraContextKey({
    cameraEntity: "camera.porch",
    cameraMembers,
  });

  assert.equal(groupKey, "wide-group-mixed:camera.porch|camera.driveway");
  assert.equal(
    resolveWideTimelineCameraContextKey({
      cameraEntity: "camera.driveway",
      cameraMembers,
    }),
    groupKey,
  );
  assert.equal(
    resolveWideTimelineCameraContextKey({
      gridMixed: true,
      cameraEntity: "camera.porch",
      cameraMembers,
    }),
    "wide-grid-mixed",
  );
});

test("loaded timeline content is not rebuilt only because loading completes", () => {
  let loading = true;
  const controller = new WideViewTimelineController(
    {
      _filterLabel: "all",
      _filterZone: "all",
      _favOnly: false,
    },
    { isLoading: () => loading },
  );
  const event = { id: "event-1", start_time: 190, has_clip: true };
  const signatureArgs = {
    allEvents: [event],
    visibleEvents: [event],
    visibleReviews: [],
    viewportWidth: 400,
    viewportHeight: 600,
    contextKey: "wide-group-mixed:camera.porch|camera.driveway",
  };

  const loadingSignature = controller._renderSignature(signatureArgs);
  loading = false;
  assert.equal(controller._renderSignature(signatureArgs), loadingSignature);

  loading = true;
  const emptyLoadingSignature = controller._renderSignature({
    ...signatureArgs,
    allEvents: [],
    visibleEvents: [],
  });
  loading = false;
  assert.notEqual(
    controller._renderSignature({
      ...signatureArgs,
      allEvents: [],
      visibleEvents: [],
    }),
    emptyLoadingSignature,
  );
});

test("Timeline controller opens from its handle and renders loaded data", () => {
  const colRight = fakeElement();
  const panel = fakeElement({ inert: true });
  const toggle = fakeElement();
  const viewport = fakeElement();
  const content = fakeElement();
  const canvas = fakeElement();
  const day = fakeElement();
  const output = fakeElement();
  const zoomIn = fakeElement();
  const zoomOut = fakeElement();
  const elements = new Map([
    ["#col-right", colRight],
    ["#wide-timeline-panel", panel],
    ["#wide-timeline-toggle", toggle],
    ["#wide-timeline-viewport", viewport],
    ["#wide-timeline-content", content],
    [".wide-timeline-canvas", canvas],
    ["#wide-timeline-day", day],
    ["#wide-timeline-scale-output", output],
  ]);
  const host = {
    _config: {
      wide_view_timeline_enabled: true,
      wide_view_timeline_default_open: false,
    },
    _filterLabel: "all",
    _filterZone: "all",
    _favOnly: false,
    _$: (selector) => elements.get(selector) || null,
    shadowRoot: {
      querySelector: (selector) => {
        if (selector === '[data-wide-timeline-scale="in"]') return zoomIn;
        if (selector === '[data-wide-timeline-scale="out"]') return zoomOut;
        return null;
      },
    },
  };
  const opened = [];
  const scheduledDelays = [];
  let now = 10_000;
  const event = {
    id: "event-1",
    camera: "doorbell",
    label: "person",
    start_time: 9_900,
    end_time: 9_910,
    has_clip: true,
    has_snapshot: true,
  };
  const controller = new WideViewTimelineController(host, {
    icons: { left: "L", right: "R" },
    getAllEvents: () => [event],
    getVisibleEvents: () => [event],
    getVisibleReviews: () => [],
    getWindowStart: () => 6_400,
    getWindowEnd: () => 10_000,
    getCameraKey: () => "camera.doorbell",
    now: () => now,
    setTimer: (_callback, delay) => {
      scheduledDelays.push(delay);
      return { unref: () => {} };
    },
    clearTimer: () => {},
    mediaUrl: (id) => `/thumb/${id}`,
    durationForEvent: () => 10,
    formatTime: () => "3:00 pm",
    formatDay: () => "Thu · Aug 27th",
    onOpenEntry: (entry) => opened.push(entry.id),
  });

  controller.bind();
  assert.equal(controller.isOpen(), false);
  assert.equal(colRight.classList.contains("wide-timeline-open"), false);

  const toggleTarget = {
    closest: (selector) =>
      selector === "[data-wide-timeline-toggle]" ? toggle : null,
  };
  assert.equal(controller.handleClick({}, toggleTarget), true);
  assert.equal(controller.isOpen(), true);
  assert.equal(colRight.classList.contains("wide-timeline-open"), true);
  assert.match(content.innerHTML, /data-wide-timeline-entry="event-1"/);
  assert.equal(output.textContent, "12h");
  assert.equal(viewport.scrollTop, 0);
  assert.equal(scheduledDelays.at(-1), 120_000);

  const entryTarget = {
    closest: (selector) =>
      selector === "[data-wide-timeline-entry]"
        ? { dataset: { wideTimelineEntry: "event-1" } }
        : null,
  };
  assert.equal(controller.handleClick({}, entryTarget), true);
  assert.deepEqual(opened, ["event-1"]);

  viewport.scrollTop = 120;
  now = 10_030;
  controller.changeScale("in");
  assert.equal(viewport.scrollTop, 0);
  assert.equal(controller._lastLayout.anchorEnd, 10_030);
  assert.equal(output.textContent, "6h");
  assert.equal(scheduledDelays.at(-1), 60_000);

  const renderedMarkup = content.innerHTML;
  now = 10_090;
  controller._refreshClockPosition();
  assert.equal(content.innerHTML, renderedMarkup);
  assert.equal(
    canvas.style.values.get("--timeline-clock-offset"),
    "1.24px",
  );
});

test("Timeline stack wheel cycles forward and backward without scrolling", () => {
  const controller = new WideViewTimelineController({});
  const group = {
    id: "timeline-stack:a|b|c",
    entries: [{ id: "a" }, { id: "b" }, { id: "c" }],
  };
  controller._lastLayout = { groups: [group] };
  controller._stackIndexes.set(group.id, 0);
  const renders = [];
  controller.render = (options) => renders.push(options);
  const stack = { dataset: { wideTimelineStack: group.id } };
  const target = {
    closest: (selector) =>
      selector === "[data-wide-timeline-stack]" ? stack : null,
  };
  let prevented = 0;
  const wheel = (deltaY, timeStamp) =>
    controller._handleWheel({
      target,
      deltaY,
      deltaX: 0,
      deltaMode: 0,
      timeStamp,
      preventDefault: () => {
        prevented += 1;
      },
      stopPropagation: () => {},
    });

  wheel(100, 1_000);
  assert.equal(controller._stackIndexes.get(group.id), 1);
  wheel(-100, 1_200);
  assert.equal(controller._stackIndexes.get(group.id), 0);
  assert.equal(prevented, 2);
  assert.equal(renders.length, 2);
});

test("Timeline mouse drag leaves the native scrollbar gutter untouched", () => {
  let pointerCaptures = 0;
  const viewport = fakeElement({
    clientWidth: 383,
    clientHeight: 480,
    scrollHeight: 1_600,
    getBoundingClientRect: () => ({
      left: 100,
      right: 500,
      width: 400,
      height: 480,
    }),
    setPointerCapture: () => {
      pointerCaptures += 1;
    },
  });
  const controller = new WideViewTimelineController({});
  controller._boundViewport = viewport;
  const target = { closest: () => null };

  const scrollbarEvent = {
    pointerType: "mouse",
    button: 0,
    pointerId: 3,
    clientX: 490,
    clientY: 100,
    target,
  };
  assert.equal(
    isWideTimelineScrollbarPointer(scrollbarEvent, viewport),
    true,
  );
  controller._handlePointerDown(scrollbarEvent);
  assert.equal(controller._drag, null);
  assert.equal(pointerCaptures, 0);
  assert.equal(viewport.classList.contains("is-dragging"), false);

  controller._handlePointerDown({
    ...scrollbarEvent,
    pointerId: 4,
    clientX: 450,
  });
  assert.equal(controller._drag?.pointerId, 4);
  assert.equal(pointerCaptures, 1);
  assert.equal(viewport.classList.contains("is-dragging"), true);
});

test("Timeline width drag leaves the minimum Alerts width visible", () => {
  const colRight = fakeElement({
    clientWidth: 1_000,
    getBoundingClientRect: () => ({ width: 1_000, height: 480 }),
  });
  const toggle = fakeElement({
    setPointerCapture: () => {},
    releasePointerCapture: () => {},
  });
  const host = {
    _config: {
      wide_view_timeline_enabled: true,
      wide_view_timeline_default_open: true,
    },
    _$: (selector) =>
      selector === "#col-right"
        ? colRight
        : selector === "#wide-timeline-toggle"
          ? toggle
          : null,
  };
  const controller = new WideViewTimelineController(host);
  controller._boundWidthToggle = toggle;
  controller._ensureOpenState();
  controller._updateResponsiveMode();

  controller._handleWidthPointerDown({
    currentTarget: toggle,
    pointerId: 4,
    button: 0,
    clientX: 400,
    preventDefault() {},
    stopPropagation() {},
  });
  controller._handleWidthPointerMove({
    pointerId: 4,
    clientX: 1_000,
    preventDefault() {},
    stopPropagation() {},
  });

  assert.equal(
    colRight.style.values.get("--wide-timeline-panel-width"),
    "700px",
  );
});

test("Timeline close handle resizes on drag without collapsing the panel", () => {
  const colRight = fakeElement({
    clientWidth: 1_000,
    getBoundingClientRect: () => ({ width: 1_000, height: 480 }),
  });
  const toggle = fakeElement({
    setPointerCapture: () => {},
    releasePointerCapture: () => {},
  });
  const host = {
    _config: {
      wide_view_timeline_enabled: true,
      wide_view_timeline_default_open: true,
    },
    _$: (selector) =>
      selector === "#col-right"
        ? colRight
        : selector === "#wide-timeline-toggle"
          ? toggle
          : null,
  };
  const controller = new WideViewTimelineController(host);
  controller._boundWidthToggle = toggle;
  controller._ensureOpenState();
  controller._updateResponsiveMode();
  controller._scheduleRender = () => {};

  controller._handleWidthPointerDown({
    currentTarget: toggle,
    pointerId: 9,
    button: 0,
    clientX: 400,
    preventDefault() {},
    stopPropagation() {},
  });
  controller._handleWidthPointerMove({
    pointerId: 9,
    clientX: 480,
    preventDefault() {},
    stopPropagation() {},
  });
  controller._handleWidthPointerUp({
    pointerId: 9,
    preventDefault() {},
    stopPropagation() {},
  });

  assert.equal(
    colRight.style.values.get("--wide-timeline-panel-width"),
    "488px",
  );
  assert.equal(controller.isOpen(), true);
  assert.equal(
    controller.handleClick(
      { preventDefault() {}, stopPropagation() {} },
      {
        closest: (selector) =>
          selector === "[data-wide-timeline-toggle]" ? toggle : null,
      },
    ),
    true,
  );
  assert.equal(controller.isOpen(), true);
});

test("Timeline stack cycling replaces only the selected stack", () => {
  const group = {
    id: "timeline-stack:a|b",
    cardTop: 40,
    cardCenterY: 85,
    activeIndex: 0,
    entries: [
      {
        id: "a",
        kind: "alert",
        label: "Person",
        startTime: 1_000,
        duration: 5,
        thumbnailUrl: "/a.jpg",
      },
      {
        id: "b",
        kind: "event",
        label: "Car",
        startTime: 900,
        duration: 8,
        thumbnailUrl: "/b.jpg",
      },
    ],
  };
  let replacedMarkup = "";
  const stack = {
    dataset: { wideTimelineStack: group.id },
    get outerHTML() {
      return replacedMarkup;
    },
    set outerHTML(value) {
      replacedMarkup = value;
    },
  };
  const line = {
    dataset: {
      wideTimelineLinkStack: group.id,
      wideTimelineLinkIndex: "0",
    },
    setAttribute: () => {},
  };
  const canvas = {
    querySelectorAll: (selector) =>
      selector === "[data-wide-timeline-stack]" ? [stack] : [line],
  };
  const host = {
    _$: (selector) =>
      selector === ".wide-timeline-canvas" ? canvas : null,
  };
  const controller = new WideViewTimelineController(host, {
    formatTime: (timestamp) => String(timestamp),
  });
  controller._lastLayout = { groups: [group] };
  controller._stackIndexes.set(group.id, 0);
  let fullRenders = 0;
  controller.render = () => {
    fullRenders += 1;
  };

  controller.cycleStack(group.id, 1);
  assert.equal(fullRenders, 0);
  assert.equal(group.activeIndex, 1);
  assert.match(replacedMarkup, /data-wide-timeline-entry="b"/);
  assert.match(replacedMarkup, /is-sliding-next/);

  controller.cycleStack(group.id, -1);
  assert.equal(fullRenders, 0);
  assert.equal(group.activeIndex, 0);
  assert.match(replacedMarkup, /data-wide-timeline-entry="a"/);
  assert.match(replacedMarkup, /is-sliding-previous/);
});

test("Timeline controller follows configured default-open state", () => {
  const host = {
    _config: {
      wide_view_timeline_enabled: true,
      wide_view_timeline_default_open: true,
      wide_view_timeline_default_scale: 6,
    },
  };
  const controller = new WideViewTimelineController(host);

  assert.equal(controller.isOpen(), true);
  assert.match(controller.buildRegionMarkup(), /aria-expanded="true"/);
  assert.match(controller.buildRegionMarkup(), />6h<\/output>/);

  host._config.wide_view_timeline_enabled = false;
  controller.applyConfigUpdate({ enabledChanged: true });
  assert.equal(controller.isOpen(), false);
  assert.equal(controller.buildRegionMarkup(), "");
});
