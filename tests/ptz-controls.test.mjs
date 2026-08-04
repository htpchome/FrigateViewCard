import { test } from "node:test";
import assert from "node:assert/strict";

import {
  hasCameraPtz,
  normalizeCameraPtzConfig,
  resolvePtzServiceRequest,
} from "../src/shared/ptz.js";

test("normalizeCameraPtzConfig enables boolean PTZ config with continuous move defaults", () => {
  assert.deepEqual(normalizeCameraPtzConfig(true), {
    enabled: true,
    move_mode: "ContinuousMove",
    speed: null,
    distance: null,
    continuous_duration: null,
  });
});

test("resolvePtzServiceRequest maps diagonal press to ONVIF pan and tilt", () => {
  const request = resolvePtzServiceRequest({
    camera: {
      entity: "camera.driveway",
      ptz: {
        enabled: true,
        move_mode: "ContinuousMove",
        speed: 0.5,
      },
    },
    action: "up-right",
    eventType: "press",
  });

  assert.deepEqual(request, {
    domain: "onvif",
    service: "ptz",
    serviceData: {
      move_mode: "ContinuousMove",
      pan: "RIGHT",
      tilt: "UP",
      speed: 0.5,
    },
    target: { entity_id: "camera.driveway" },
    readout: "[ptz:up-right]",
  });
});

test("resolvePtzServiceRequest stops continuous moves on release", () => {
  const request = resolvePtzServiceRequest({
    camera: {
      entity: "camera.driveway",
      ptz: true,
    },
    action: "right",
    eventType: "release",
  });

  assert.deepEqual(request, {
    domain: "onvif",
    service: "ptz",
    serviceData: { move_mode: "Stop" },
    target: { entity_id: "camera.driveway" },
    readout: "[ptz:stop]",
  });
});

test("resolvePtzServiceRequest ignores release for relative moves", () => {
  const request = resolvePtzServiceRequest({
    camera: {
      entity: "camera.driveway",
      ptz: {
        enabled: true,
        move_mode: "RelativeMove",
        distance: 0.25,
      },
    },
    action: "left",
    eventType: "release",
  });

  assert.equal(request, null);
});

test("hasCameraPtz requires an enabled PTZ camera config", () => {
  assert.equal(hasCameraPtz({ ptz: { enabled: false } }), false);
  assert.equal(hasCameraPtz({ ptz: { enabled: true } }), true);
});
