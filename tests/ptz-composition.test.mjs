import { test } from "node:test";
import assert from "node:assert/strict";

import { createPtzMotionController } from "../src/features/ptz/composition.js";
import { resolvePtzHoldPlan } from "../src/features/ptz/index.js";
import { PtzMotionController } from "../src/features/ptz/motion.ctrl.js";

test("PTZ composition preserves motion delegates and error reporting", async () => {
  const calls = [];
  const context = {
    camera: { entity: "camera.driveway", ptz: true },
    ptzInfo: { features: ["pt"] },
  };
  const card = {
    _resolvePtzMotionContext: () => {
      calls.push(["resolve-context"]);
      return context;
    },
    _executePtzCameraAction: (value) => {
      calls.push(["execute-action", value]);
      return "executed";
    },
  };
  const controller = createPtzMotionController(card);

  assert.equal(controller instanceof PtzMotionController, true);
  assert.equal(controller._resolveHoldPlan, resolvePtzHoldPlan);
  assert.equal(await controller._resolveContext(), context);
  assert.equal(await controller._executeAction(context), "executed");
  assert.deepEqual(calls, [
    ["resolve-context"],
    ["execute-action", context],
  ]);

  const error = new Error("motion failed");
  const errorContext = { action: "left", phase: "press" };
  const originalWarn = console.warn;
  try {
    console.warn = (...args) => calls.push(["warn", ...args]);
    controller._onError(error, errorContext);
  } finally {
    console.warn = originalWarn;
  }
  assert.deepEqual(calls.at(-1), [
    "warn",
    "[Frigate] PTZ motion failed",
    errorContext,
    error,
  ]);
});
