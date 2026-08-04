import { test } from "node:test";
import assert from "node:assert/strict";

import {
  canCameraUsePtz,
  hasCameraPtz,
  normalizeCameraPtzConfig,
  resolvePtzServicePlan,
} from "../src/shared/ptz.js";

test("normalizeCameraPtzConfig enables boolean PTZ config with continuous move defaults", () => {
  assert.deepEqual(normalizeCameraPtzConfig(true), {
    enabled: true,
    move_mode: "ContinuousMove",
    speed: 0.5,
    distance: null,
    continuous_duration: null,
  });
});

test("normalizeCameraPtzConfig applies the default PTZ speed for enabled objects", () => {
  assert.deepEqual(normalizeCameraPtzConfig({ enabled: true }), {
    enabled: true,
    move_mode: "ContinuousMove",
    speed: 0.5,
    distance: null,
    continuous_duration: null,
  });
});

test("resolvePtzServicePlan maps press to the Frigate PTZ move service", () => {
  const request = resolvePtzServicePlan({
    camera: {
      entity: "camera.driveway",
      ptz: {
        enabled: true,
        move_mode: "ContinuousMove",
        speed: 0.5,
      },
    },
    ptzInfo: { features: ["pt"] },
    action: "up",
    eventType: "press",
  });

  assert.deepEqual(request, {
    requests: [
      {
        domain: "frigate",
        service: "ptz",
        serviceData: {
          action: "move",
          argument: "up",
        },
        target: { entity_id: "camera.driveway" },
      },
    ],
    readout: "[ptz:up]",
  });
});

test("resolvePtzServicePlan fans out diagonal moves into two Frigate move calls", () => {
  const request = resolvePtzServicePlan({
    camera: {
      entity: "camera.driveway",
      ptz: true,
    },
    ptzInfo: { features: ["pt"] },
    action: "up-right",
    eventType: "press",
  });

  assert.deepEqual(request, {
    requests: [
      {
        domain: "frigate",
        service: "ptz",
        serviceData: { action: "move", argument: "up" },
        target: { entity_id: "camera.driveway" },
      },
      {
        domain: "frigate",
        service: "ptz",
        serviceData: { action: "move", argument: "right" },
        target: { entity_id: "camera.driveway" },
      },
    ],
    readout: "[ptz:up-right]",
  });
});

test("resolvePtzServicePlan stops continuous moves on release", () => {
  const request = resolvePtzServicePlan({
    camera: {
      entity: "camera.driveway",
      ptz: true,
    },
    ptzInfo: { features: ["pt"] },
    action: "right",
    eventType: "release",
  });

  assert.deepEqual(request, {
    requests: [
      {
        domain: "frigate",
        service: "ptz",
        serviceData: { action: "stop" },
        target: { entity_id: "camera.driveway" },
      },
    ],
    readout: "[ptz:stop]",
  });
});

test("resolvePtzServicePlan ignores PTZ when Frigate has no pan tilt capability", () => {
  const request = resolvePtzServicePlan({
    camera: {
      entity: "camera.driveway",
      ptz: true,
    },
    ptzInfo: { features: ["zoom"] },
    action: "up-right",
    eventType: "press",
  });

  assert.equal(request, null);
});

test("resolvePtzServicePlan ignores release for relative moves", () => {
  const request = resolvePtzServicePlan({
    camera: {
      entity: "camera.driveway",
      ptz: {
        enabled: true,
        move_mode: "RelativeMove",
        distance: 0.25,
      },
    },
    ptzInfo: { features: ["pt"] },
    action: "left",
    eventType: "release",
  });

  assert.equal(request, null);
});

test("hasCameraPtz requires an enabled PTZ camera config", () => {
  assert.equal(hasCameraPtz({ ptz: { enabled: false } }), false);
  assert.equal(hasCameraPtz({ ptz: { enabled: true } }), true);
});

test("canCameraUsePtz requires Frigate pan tilt capability", () => {
  assert.equal(canCameraUsePtz({ ptz: true }, { features: ["pt"] }), true);
  assert.equal(canCameraUsePtz({ ptz: true }, { features: ["pt-r"] }), false);
});
