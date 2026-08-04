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
    ptzContext: { clientId: "frigate", cameraName: "driveway" },
    action: "up",
    eventType: "press",
  });

  assert.deepEqual(request, {
    executionMode: "sequential",
    requests: [
      {
        type: "frigate_api",
        method: "GET",
        path: "/api/frigate/frigate/api/driveway/ptz/move_up",
      },
    ],
    readout: "[ptz:up]",
  });
});

test("resolvePtzServicePlan fans out diagonal moves into parallel Frigate API calls", () => {
  const request = resolvePtzServicePlan({
    camera: {
      entity: "camera.driveway",
      ptz: true,
    },
    ptzInfo: { features: ["pt"] },
    ptzContext: { clientId: "frigate", cameraName: "driveway" },
    action: "up-right",
    eventType: "press",
  });

  assert.deepEqual(request, {
    executionMode: "parallel",
    requests: [
      {
        type: "frigate_api",
        method: "GET",
        path: "/api/frigate/frigate/api/driveway/ptz/move_up",
      },
      {
        type: "frigate_api",
        method: "GET",
        path: "/api/frigate/frigate/api/driveway/ptz/move_right",
      },
    ],
    readout: "[ptz:up-right]",
  });
});

test("resolvePtzServicePlan stops direct Frigate API moves on release", () => {
  const request = resolvePtzServicePlan({
    camera: {
      entity: "camera.driveway",
      ptz: true,
    },
    ptzInfo: { features: ["pt"] },
    ptzContext: { clientId: "frigate", cameraName: "driveway" },
    action: "right",
    eventType: "release",
  });

  assert.deepEqual(request, {
    executionMode: "sequential",
    requests: [
      {
        type: "frigate_api",
        method: "GET",
        path: "/api/frigate/frigate/api/driveway/ptz/move_stop",
      },
    ],
    readout: "[ptz:stop]",
  });
});

test("resolvePtzServicePlan uses Home Assistant PTZ service for ha_direct cameras", () => {
  const request = resolvePtzServicePlan({
    camera: {
      entity: "camera.driveway",
      connection_type: "ha_direct",
      ptz: true,
    },
    ptzInfo: { features: ["pt"] },
    action: "left",
    eventType: "press",
  });

  assert.deepEqual(request, {
    executionMode: "sequential",
    requests: [
      {
        type: "home_assistant_service",
        domain: "frigate",
        service: "ptz",
        serviceData: { action: "move", argument: "left" },
        target: { entity_id: "camera.driveway" },
      },
    ],
    readout: "[ptz:left]",
  });
});

test("resolvePtzServicePlan ignores PTZ when Frigate has no pan tilt capability", () => {
  const request = resolvePtzServicePlan({
    camera: {
      entity: "camera.driveway",
      ptz: true,
    },
    ptzInfo: { features: ["zoom"] },
    ptzContext: { clientId: "frigate", cameraName: "driveway" },
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
    ptzContext: { clientId: "frigate", cameraName: "driveway" },
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
  assert.equal(canCameraUsePtz({ ptz: true }, { features: ["pt-r"] }), true);
});
