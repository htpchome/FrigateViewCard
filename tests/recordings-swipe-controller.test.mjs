import { test } from "node:test";
import assert from "node:assert/strict";

import { RecordingsSwipeController } from "../src/features/recordings/swipe.ctrl.js";

globalThis.document = globalThis.document || {
  createElement: () => ({
    className: "",
    innerHTML: "",
    style: {},
    appendChild() {},
    classList: {
      add() {},
      remove() {},
    },
    getBoundingClientRect() {
      return { width: 0, height: 0 };
    },
    offsetWidth: 0,
  }),
};

const createFakeBrowse = () => {
  const listeners = new Map();
  const classes = new Set();
  let capturedPointerId = null;

  return {
    style: { transform: "" },
    classList: {
      add: (...tokens) => {
        tokens.forEach((token) => classes.add(token));
      },
      remove: (...tokens) => {
        tokens.forEach((token) => classes.delete(token));
      },
      contains: (token) => classes.has(token),
    },
    addEventListener(type, listener, options = {}) {
      if (!listeners.has(type)) listeners.set(type, new Set());
      listeners.get(type).add(listener);
      options.signal?.addEventListener(
        "abort",
        () => {
          this.removeEventListener(type, listener);
        },
        { once: true },
      );
    },
    removeEventListener(type, listener) {
      listeners.get(type)?.delete(listener);
    },
    dispatch(type, event) {
      for (const listener of [...(listeners.get(type) || [])]) {
        listener(event);
      }
    },
    hasPointerCapture(pointerId) {
      return capturedPointerId === pointerId;
    },
    setPointerCapture(pointerId) {
      capturedPointerId = pointerId;
    },
    releasePointerCapture(pointerId) {
      if (capturedPointerId === pointerId) capturedPointerId = null;
    },
  };
};

test("RecordingsSwipeController disposes listeners and resets gesture state", async () => {
  const browse = createFakeBrowse();
  const list = {
    clientWidth: 120,
    scrollHeight: 220,
    clientHeight: 220,
    innerHTML: "<div>current</div>",
    classList: {
      add() {},
      remove() {},
    },
    appendChild() {},
  };
  let gesture = null;
  let tapBlocked = false;
  let destroyed = 0;
  let completed = 0;
  let lastRenderedListHtml = "";

  const controller = new RecordingsSwipeController({
    browse,
    getTab: () => "recordings",
    isMobileTabletViewport: () => true,
    isDayNavAnimating: () => false,
    getGesture: () => gesture,
    setGesture: (next) => {
      gesture = next;
    },
    setTapBlocked: (next) => {
      tapBlocked = next;
    },
    getList: () => list,
    getLastRenderedListHtml: () => lastRenderedListHtml,
    setLastRenderedListHtml: (value) => {
      lastRenderedListHtml = value;
    },
    renderList: () => {
      destroyed += 1;
    },
    prepareDayTransition: async () => ({
      hasData: false,
      bounds: null,
      recs: [],
    }),
    renderRecordings: () => "rows:0",
    completeGesture: async () => {
      completed += 1;
      return false;
    },
    bounceArea: () => {},
  });

  controller.bind();

  browse.dispatch("pointerdown", {
    pointerId: 7,
    pointerType: "touch",
    button: 0,
    clientX: 10,
    clientY: 10,
  });
  browse.dispatch("pointermove", {
    pointerId: 7,
    clientX: 70,
    clientY: 12,
    preventDefault() {},
  });

  assert.equal(browse.classList.contains("recordings-swipe"), true);
  assert.equal(gesture?.direction, -1);
  assert.equal(tapBlocked, true);

  controller.dispose();

  assert.equal(destroyed, 1);
  assert.equal(gesture, null);
  assert.equal(tapBlocked, false);
  assert.equal(browse.classList.contains("recordings-swipe"), false);

  browse.dispatch("pointerup", {
    pointerId: 7,
  });
  assert.equal(completed, 0);
});

test("RecordingsSwipeController owns swipe-stage creation and prep loading state", async () => {
  const browse = createFakeBrowse();
  const listClasses = new Set();
  const appended = [];
  const list = {
    clientWidth: 180,
    scrollHeight: 260,
    clientHeight: 220,
    innerHTML: "<div>current</div>",
    classList: {
      add: (token) => listClasses.add(token),
      remove: (token) => listClasses.delete(token),
    },
    appendChild: (node) => appended.push(node),
  };
  let gesture = null;
  let lastRenderedListHtml = "<div>cached</div>";
  const controller = new RecordingsSwipeController({
    browse,
    getTab: () => "recordings",
    isMobileTabletViewport: () => true,
    isDayNavAnimating: () => false,
    getGesture: () => gesture,
    setGesture: (next) => {
      gesture = next;
    },
    setTapBlocked: () => {},
    getList: () => list,
    getLastRenderedListHtml: () => lastRenderedListHtml,
    setLastRenderedListHtml: (value) => {
      lastRenderedListHtml = value;
    },
    renderList: () => {},
    prepareDayTransition: async () => ({
      hasData: true,
      bounds: { start: 1, end: 2 },
      recs: [{ id: 1 }],
    }),
    renderRecordings: (recordings) => `rows:${recordings.length}`,
    completeGesture: async () => true,
    bounceArea: () => {},
  });

  const nextGesture = controller.startGestureStage(1);
  gesture = nextGesture;
  await nextGesture.prepPromise;

  assert.equal(listClasses.has("recordings-swipe-active"), true);
  assert.equal(appended.length, 1);
  assert.equal(nextGesture.ready, true);
  assert.equal(nextGesture.incomingHtml, "rows:1");
  assert.equal(nextGesture.stage.incoming.innerHTML, "rows:1");
  controller.destroyGestureStage();
  assert.equal(lastRenderedListHtml, "");
});

test("RecordingsSwipeController owns list-state cleanup and bounce classes", () => {
  const browse = createFakeBrowse();
  const listClasses = new Set(["recordings-swipe-active"]);
  const list = {
    classList: {
      add: (token) => listClasses.add(token),
      remove: (token) => listClasses.delete(token),
    },
  };
  const controller = new RecordingsSwipeController({
    browse,
    getTab: () => "recordings",
    isMobileTabletViewport: () => true,
    isDayNavAnimating: () => false,
    getGesture: () => null,
    setGesture: () => {},
    setTapBlocked: () => {},
    getList: () => list,
    getLastRenderedListHtml: () => "",
    setLastRenderedListHtml: () => {},
    renderList: () => {},
    prepareDayTransition: async () => null,
    renderRecordings: () => "",
    completeGesture: async () => false,
  });

  controller.clearListState();
  controller.bounceArea(1);

  assert.equal(listClasses.has("recordings-swipe-active"), false);
  assert.equal(browse.classList.contains("swipe-bounce-next"), true);
});
