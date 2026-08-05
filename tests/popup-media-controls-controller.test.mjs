import { test } from "node:test";
import assert from "node:assert/strict";

import { PopupMediaControlsController } from "../src/card/popup/media.ctrl.js";
import { resolvePopupMediaControlsListenerPlan } from "../src/shared/media/controls.js";

const signalCleanupMap = new WeakMap();

function createTarget() {
  const listeners = new Map();
  const hiddenClasses = new Set(["is-hidden"]);

  return {
    value: "",
    duration: 0,
    currentTime: 0,
    classList: {
      add: (...tokens) => tokens.forEach((token) => hiddenClasses.add(token)),
      remove: (...tokens) =>
        tokens.forEach((token) => hiddenClasses.delete(token)),
      contains: (token) => hiddenClasses.has(token),
    },
    addEventListener(type, listener, options = {}) {
      if (!listeners.has(type)) listeners.set(type, new Set());
      listeners.get(type).add(listener);
      const signal = options.signal;
      if (!signal) return;
      let signalCleanups = signalCleanupMap.get(signal);
      if (!signalCleanups) {
        signalCleanups = new Set();
        signalCleanupMap.set(signal, signalCleanups);
        signal.addEventListener(
          "abort",
          () => {
            for (const cleanup of signalCleanups) cleanup();
            signalCleanups.clear();
          },
          { once: true },
        );
      }
      signalCleanups.add(() => {
        this.removeEventListener(type, listener);
      });
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

test("PopupMediaControlsController previews seeks and syncs without updating buttons during drag", () => {
  const controls = createTarget();
  const progress = createTarget();
  const video = createTarget();
  video.duration = 100;
  progress.value = "250";
  const syncCalls = [];
  let showNowCalls = 0;
  let showTemporaryCalls = 0;

  const controller = new PopupMediaControlsController({
    controls,
    progress,
    video,
    listenerPlan: resolvePopupMediaControlsListenerPlan({
      hasProgressControl: true,
    }),
    onShowNow: () => {
      showNowCalls += 1;
      controls.classList.remove("is-hidden");
    },
    onShowTemporarily: () => {
      showTemporaryCalls += 1;
    },
    onSync: ({ progressDragging }) => {
      syncCalls.push(progressDragging);
    },
  });

  controller.bind();
  progress.dispatch("pointerdown");
  progress.dispatch("input");
  progress.dispatch("change");

  assert.equal(showNowCalls, 1);
  assert.equal(showTemporaryCalls, 2);
  assert.equal(video.currentTime, 25);
  assert.deepEqual(syncCalls, [false, true, false]);
});

test("PopupMediaControlsController removes listeners and clears hidden class on dispose", () => {
  const controls = createTarget();
  const progress = createTarget();
  const video = createTarget();
  let syncCalls = 0;

  const controller = new PopupMediaControlsController({
    controls,
    progress,
    video,
    listenerPlan: resolvePopupMediaControlsListenerPlan({
      hasProgressControl: true,
    }),
    onShowNow: () => {
      controls.classList.remove("is-hidden");
    },
    onShowTemporarily: () => {},
    onSync: () => {
      syncCalls += 1;
    },
  });

  controller.bind();
  controller.dispose();
  progress.dispatch("input");
  video.dispatch("play");

  assert.equal(syncCalls, 1);
  assert.equal(controls.classList.contains("is-hidden"), false);
});
