import assert from "node:assert/strict";
import { test } from "node:test";

import { createPtzActionController } from "../src/features/ptz/action.ctrl.js";

test("PTZ action controller ignores actions without a service plan", async () => {
  let calls = 0;
  const controller = createPtzActionController({
    _hass: {
      callService: async () => {
        calls += 1;
      },
    },
  });

  await controller.execute({
    camera: { entity: "camera.driveway", ptz: false },
    ptzInfo: { features: ["pt"] },
    action: "up",
    eventType: "press",
  });

  assert.equal(calls, 0);
});

test("PTZ action controller plans and executes Frigate integration services", async () => {
  const calls = [];
  const controller = createPtzActionController({
    _hass: {
      callService: async (...args) => calls.push(args),
    },
  });

  await controller.execute({
    camera: { entity: "camera.driveway", ptz: true },
    ptzInfo: { features: ["pt"] },
    action: "up",
    eventType: "press",
  });

  assert.deepEqual(calls, [
    [
      "frigate",
      "ptz",
      { action: "move", argument: "up" },
      { entity_id: "camera.driveway" },
    ],
  ]);
});

test("HA-direct playback retains Frigate integration PTZ execution", async () => {
  const calls = [];
  const controller = createPtzActionController({
    _hass: {
      callService: async (...args) => calls.push(args),
    },
  });

  await controller.execute({
    camera: {
      entity: "camera.driveway",
      connection_type: "ha_direct",
      ptz: true,
    },
    ptzInfo: { features: ["pt"], presets: ["Home"] },
    action: "preset",
    argument: "Home",
    eventType: "press",
  });

  assert.deepEqual(calls, [
    [
      "frigate",
      "ptz",
      { action: "preset", argument: "Home" },
      { entity_id: "camera.driveway" },
    ],
  ]);
});

test("PTZ action controller propagates Home Assistant execution errors", async () => {
  const controller = createPtzActionController({ _hass: {} });

  await assert.rejects(
    controller.execute({
      camera: { entity: "camera.driveway", ptz: true },
      ptzInfo: { features: ["focus"] },
      action: "focus-in",
      eventType: "press",
    }),
    /Home Assistant PTZ service is unavailable/,
  );
});
