import { test } from "node:test";
import assert from "node:assert/strict";

import { PtzInteractionController } from "../src/features/ptz/interaction.ctrl.js";

const createHarness = ({ camera = { entity: "camera.driveway", ptz: true } } = {}) => {
  const calls = [];
  const context = {
    camera,
    ptzInfo: { features: ["pt", "focus"], presets: ["Home"] },
  };
  const motionController = {
    start: async (action) => calls.push(["start", action]),
    stop: async (reason) => calls.push(["stop", reason]),
    dispose: async () => calls.push(["dispose"]),
  };
  const host = {
    _activeCam: camera,
    _ptzMotionController: motionController,
    _ptzCapabilityController: {
      resolveContext: async () => {
        calls.push(["context"]);
        return context;
      },
    },
    _executePtzCameraAction: async (request) =>
      calls.push(["execute", request]),
    _attachMainLiveVideoZoom: () => calls.push(["attach"]),
    _liveVideoZoomController: {
      zoomBy: (delta) => calls.push(["zoom", delta]),
    },
  };
  const controller = new PtzInteractionController(host, {
    isControlButton: (value) => value?.isButton === true,
  });
  return { calls, context, controller };
};

test("PTZ interaction controller owns circle-pad filtering and display zoom", async () => {
  const { calls, controller } = createHarness();

  await controller.handleCirclePadEvent(
    { target: { id: "other" }, detail: { action: "zoom-in" } },
    "press",
  );
  assert.deepEqual(calls, []);

  await controller.handleCirclePadEvent(
    { target: { id: "controls-pad" }, detail: { action: "zoom-in" } },
    "press",
  );
  await controller.handleCirclePadEvent(
    { target: { id: "controls-pad" }, detail: { action: "zoom-in" } },
    "release",
  );

  assert.deepEqual(calls, [["attach"], ["zoom", 0.2]]);
});

test("PTZ direction interactions delegate press and release to motion ownership", async () => {
  const { calls, controller } = createHarness();

  await controller.handleAction("left", "press");
  await controller.handleAction("left", "release");

  assert.deepEqual(calls, [
    ["start", "left"],
    ["stop", "control-release"],
  ]);
});

test("PTZ non-direction interactions resolve context and execute once", async () => {
  const { calls, context, controller } = createHarness();

  await controller.handleAction("focus-in", "press");

  assert.deepEqual(calls, [
    ["context"],
    [
      "execute",
      {
        ...context,
        action: "focus-in",
        eventType: "press",
      },
    ],
  ]);
});

test("PTZ preset interaction restores connected button state", async () => {
  const { calls, context, controller } = createHarness();
  const classes = new Set();
  const attributes = new Map();
  const button = {
    disabled: false,
    isConnected: true,
    classList: {
      add: (name) => classes.add(name),
      remove: (name) => classes.delete(name),
    },
    setAttribute: (name, value) => attributes.set(name, value),
    removeAttribute: (name) => attributes.delete(name),
  };

  await controller.handlePreset(" Home ", button);

  assert.deepEqual(calls, [
    ["context"],
    [
      "execute",
      {
        ...context,
        action: "preset",
        eventType: "press",
        argument: "Home",
      },
    ],
  ]);
  assert.equal(button.disabled, false);
  assert.equal(classes.has("is-activating"), false);
  assert.equal(attributes.has("aria-busy"), false);
});

test("PTZ pointer interaction retains capture until the matching pointer stops", async () => {
  const { calls, controller } = createHarness();
  const button = {
    isButton: true,
    disabled: false,
    dataset: { ptzControl: "right" },
    setPointerCapture: (pointerId) => calls.push(["capture", pointerId]),
  };
  const event = {
    pointerId: 7,
    target: { closest: () => button },
    preventDefault: () => calls.push(["prevent"]),
  };

  await controller.handleControlPointerDown(event);
  await controller.handleControlPointerStop({ pointerId: 8 });
  await controller.handleControlPointerStop({ pointerId: 7 });

  assert.deepEqual(calls, [
    ["prevent"],
    ["capture", 7],
    ["start", "right"],
    ["stop", "control-release"],
  ]);
});

test("PTZ interaction disposal clears pointer ownership and disposes motion", async () => {
  const { calls, controller } = createHarness();
  const button = {
    isButton: true,
    disabled: false,
    dataset: { ptzControl: "up" },
  };
  await controller.handleControlPointerDown({
    pointerId: 2,
    target: { closest: () => button },
  });

  await controller.dispose();
  await controller.handleControlPointerStop({ pointerId: 2 });

  assert.deepEqual(calls, [["start", "up"], ["dispose"]]);
});
