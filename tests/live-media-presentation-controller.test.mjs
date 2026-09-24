import { test } from "node:test";
import assert from "node:assert/strict";

import { LiveMediaPresentationController } from "../src/features/live/media-presentation.ctrl.js";

test("live media presentation replaces engines through one cleanup path", () => {
  const previousEngine = { id: "previous" };
  const nextEngine = { id: "next" };
  const calls = [];
  const host = {
    _engine: previousEngine,
    _haDirectMounter: {
      release: (engine) => calls.push(["release", engine]),
    },
    _liveVideoZoomController: {
      dispose: () => calls.push(["dispose-zoom"]),
    },
    _clearPictureInPictureButtonController: (scope) =>
      calls.push(["clear-pip", scope]),
    _liveViewResizeController: {
      attachMedia: (media) => calls.push(["resize", media]),
    },
    _syncPictureInPictureButtons: () => calls.push(["sync-pip"]),
  };
  const controller = new LiveMediaPresentationController(host);
  controller.attachVideoZoom = (engine) => calls.push(["attach", engine]);

  controller.assignEngine(nextEngine);

  assert.equal(host._engine, nextEngine);
  assert.deepEqual(calls, [
    ["release", previousEngine],
    ["dispose-zoom"],
    ["clear-pip", "live"],
    ["resize", null],
    ["attach", nextEngine],
  ]);
});

test("live media presentation refreshes an unchanged video attachment", () => {
  const engine = {};
  const video = {};
  const zoomHost = {};
  const interactionTarget = {};
  const calls = [];
  const host = {
    _engine: engine,
    _applyVideoFit: (media) => calls.push(["fit", media]),
    _liveViewResizeController: {
      attachMedia: (media) => calls.push(["resize", media]),
    },
    _liveVideoZoomController: {
      video,
      host: zoomHost,
      interactionTarget,
      refresh: () => calls.push(["refresh"]),
    },
    _syncPictureInPictureButtons: () => calls.push(["sync-pip"]),
  };

  new LiveMediaPresentationController(host).attachVideoZoom(engine, video);

  assert.deepEqual(calls, [
    ["fit", video],
    ["resize", video],
    ["refresh"],
    ["sync-pip"],
  ]);
});

test("live media presentation suspends zoom during rotate overlays", () => {
  const suspended = [];
  const host = {
    _liveVideoZoomController: {
      setPresentationSuspended: (value) => suspended.push(value),
    },
  };
  const controller = new LiveMediaPresentationController(host);

  controller.syncRotateZoomPresentation({
    classList: {
      contains: (name) => name === "mobile-rotate-live-exit",
    },
  });
  controller.syncRotateZoomPresentation({
    classList: { contains: () => false },
  });

  assert.deepEqual(suspended, [true, false]);
});
