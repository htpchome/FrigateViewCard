import { test } from "node:test";
import assert from "node:assert/strict";

import { LiveOverlayControlsController } from "../src/card/live-overlay-controls-controller.js";

function createTarget() {
  const listeners = new Map();

  return {
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
    dispatch(type, event = {}) {
      for (const listener of [...(listeners.get(type) || [])]) {
        listener(event);
      }
    },
  };
}

test("LiveOverlayControlsController shows on mouse hover and hides on leave", () => {
  const wrap = createTarget();
  const calls = [];
  const controller = new LiveOverlayControlsController({
    wrap,
    show: () => calls.push("show"),
    hideNow: () => calls.push("hideNow"),
    hideSoon: (ms) => calls.push(["hideSoon", ms]),
  });

  controller.bind();
  wrap.dispatch("pointerenter", { pointerType: "mouse" });
  wrap.dispatch("pointerleave", { pointerType: "mouse" });

  assert.deepEqual(calls, ["show", "hideNow"]);
});

test("LiveOverlayControlsController schedules hide for non-mouse interaction", () => {
  const wrap = createTarget();
  const calls = [];
  const controller = new LiveOverlayControlsController({
    wrap,
    show: () => calls.push("show"),
    hideNow: () => calls.push("hideNow"),
    hideSoon: (ms) => calls.push(["hideSoon", ms]),
  });

  controller.bind();
  wrap.dispatch("pointerdown", { pointerType: "touch" });
  wrap.dispatch("touchstart");

  assert.deepEqual(calls, [
    "show",
    ["hideSoon", 1300],
    "show",
    ["hideSoon", 1300],
  ]);
});

test("LiveOverlayControlsController removes listeners and hides on dispose", () => {
  const wrap = createTarget();
  const calls = [];
  const controller = new LiveOverlayControlsController({
    wrap,
    show: () => calls.push("show"),
    hideNow: () => calls.push("hideNow"),
    hideSoon: (ms) => calls.push(["hideSoon", ms]),
  });

  controller.bind();
  controller.dispose();
  wrap.dispatch("pointerenter", { pointerType: "mouse" });

  assert.deepEqual(calls, ["hideNow"]);
});
