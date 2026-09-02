import { test } from "node:test";
import assert from "node:assert/strict";

import { RecordingsSwipeController } from "../src/features/recordings/swipe.ctrl.js";
import { STYLES } from "../src/styles.js";

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
    listenerCount(type) {
      return listeners.get(type)?.size || 0;
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

test("recordings transitions do not claim pointer input or touch action", () => {
  const browse = createFakeBrowse();
  const list = {
    classList: {
      add() {},
      remove() {},
    },
  };

  const controller = new RecordingsSwipeController({
    browse,
    getList: () => list,
    getLastRenderedListHtml: () => "",
  });

  assert.equal(controller.bind, undefined);
  assert.equal(browse.listenerCount("pointerdown"), 0);
  assert.equal(browse.listenerCount("pointermove"), 0);
  assert.equal(browse.listenerCount("pointerup"), 0);
  assert.equal(browse.listenerCount("pointercancel"), 0);
  assert.doesNotMatch(
    STYLES,
    /\.card\.recordings-browse-head-tall \.browse\{touch-action:pan-y;\}/,
  );
  assert.doesNotMatch(STYLES, /\.browse\.recordings-swipe\{/);

  controller.dispose();
});

test("RecordingsSwipeController retains day-button transition stage creation", () => {
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
  const controller = new RecordingsSwipeController({
    browse,
    getList: () => list,
    getLastRenderedListHtml: () => "<div>cached</div>",
  });

  const stage = controller.createStage(1, "rows:1");

  assert.equal(listClasses.has("recordings-swipe-active"), true);
  assert.equal(appended.length, 1);
  assert.equal(stage.direction, 1);
  assert.equal(stage.width, 180);
  assert.equal(stage.incoming.innerHTML, "rows:1");

  controller.dispose();
  assert.equal(listClasses.has("recordings-swipe-active"), false);
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
    getList: () => list,
    getLastRenderedListHtml: () => "",
  });

  controller.clearListState();
  controller.bounceArea(1);

  assert.equal(listClasses.has("recordings-swipe-active"), false);
  assert.equal(browse.classList.contains("swipe-bounce-next"), true);
});
