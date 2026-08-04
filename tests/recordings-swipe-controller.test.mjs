import { test } from "node:test";
import assert from "node:assert/strict";

import { RecordingsSwipeController } from "../src/features/recordings/swipe.ctrl.js";

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
  let gesture = null;
  let tapBlocked = false;
  let destroyed = 0;
  let completed = 0;

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
    destroyGestureStage: () => {
      destroyed += 1;
    },
    startGestureStage: (direction) => ({
      direction,
      stage: { width: 120 },
    }),
    setStageOffset: () => {},
    animateStageTo: async () => {},
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
