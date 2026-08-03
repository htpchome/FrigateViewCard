import { test } from "node:test";
import assert from "node:assert/strict";

import { RecordingScrubController } from "../src/card/recordings/scrub-controller.js";

function createTarget() {
  const listeners = new Map();
  let pointerCapture = null;

  return {
    innerHTML: "",
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
    getBoundingClientRect() {
      return { left: 10, width: 200 };
    },
    setPointerCapture(pointerId) {
      pointerCapture = pointerId;
    },
    releasePointerCapture(pointerId) {
      if (pointerCapture === pointerId) pointerCapture = null;
    },
    hasPointerCapture(pointerId) {
      return pointerCapture === pointerId;
    },
  };
}

test("RecordingScrubController scrubs and commits on pointer release", () => {
  const track = createTarget();
  const video = createTarget();
  video.paused = false;
  video.currentTime = 5;
  let paused = 0;
  video.pause = () => {
    paused += 1;
    video.paused = true;
  };
  const ticks = { innerHTML: "ticks" };
  const markers = { innerHTML: "markers" };
  const state = { start: 100, isScrubbing: false, resumeAfterScrub: false };
  const ratios = [];
  const cursors = [];

  const controller = new RecordingScrubController({
    track,
    video,
    ticks,
    markers,
    state,
    setCursor: (timeSec) => {
      cursors.push(timeSec);
    },
    seekToRatio: (ratio, options = {}) => {
      ratios.push({ ratio, commit: !!options.commit });
    },
  });

  controller.bind();

  track.dispatch("pointerdown", {
    pointerId: 1,
    clientX: 60,
    preventDefault() {},
    stopPropagation() {},
  });
  track.dispatch("pointermove", {
    pointerId: 1,
    clientX: 110,
    preventDefault() {},
    stopPropagation() {},
  });
  track.dispatch("pointerup", {
    pointerId: 1,
    preventDefault() {},
    stopPropagation() {},
  });
  video.dispatch("timeupdate", {});

  assert.equal(paused, 1);
  assert.equal(state.resumeAfterScrub, true);
  assert.deepEqual(ratios, [
    { ratio: 0.25, commit: false },
    { ratio: 0.5, commit: false },
    { ratio: 0.5, commit: true },
  ]);
  assert.deepEqual(cursors, [105]);
});

test("RecordingScrubController clears marker layers and listeners on dispose", () => {
  const track = createTarget();
  const video = createTarget();
  const ticks = { innerHTML: "ticks" };
  const markers = { innerHTML: "markers" };
  const state = { start: 10, isScrubbing: false, resumeAfterScrub: false };
  let seekCalls = 0;

  const controller = new RecordingScrubController({
    track,
    video,
    ticks,
    markers,
    state,
    setCursor: () => {},
    seekToRatio: () => {
      seekCalls += 1;
    },
  });

  controller.bind();
  controller.dispose();

  track.dispatch("pointerdown", {
    pointerId: 1,
    clientX: 60,
    preventDefault() {},
    stopPropagation() {},
  });

  assert.equal(seekCalls, 0);
  assert.equal(ticks.innerHTML, "");
  assert.equal(markers.innerHTML, "");
  assert.equal(state.isScrubbing, false);
});
