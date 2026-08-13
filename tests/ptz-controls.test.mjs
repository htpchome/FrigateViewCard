import { test } from "node:test";
import assert from "node:assert/strict";

import {
  canCameraUsePtz,
  hasCameraPtz,
  hasTwoWayTalkCapability,
  normalizeCameraPtzConfig,
  resolvePtzServicePlan,
} from "../src/features/ptz/index.js";

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

test("normalizeCameraPtzConfig coerces configured move mode to continuous", () => {
  assert.deepEqual(
    normalizeCameraPtzConfig({ enabled: true, move_mode: "RelativeMove" }),
    {
      enabled: true,
      move_mode: "ContinuousMove",
      speed: 0.5,
      distance: null,
      continuous_duration: null,
    },
  );
});

test("resolvePtzServicePlan maps press to the Frigate integration PTZ service", () => {
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
        type: "home_assistant_service",
        domain: "frigate",
        service: "ptz",
        serviceData: { action: "move", argument: "up" },
        target: { entity_id: "camera.driveway" },
      },
    ],
    readout: "[ptz:up]",
  });
});

test("resolvePtzServicePlan fans out diagonal moves into parallel Frigate integration PTZ calls", () => {
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
        type: "home_assistant_service",
        domain: "frigate",
        service: "ptz",
        serviceData: { action: "move", argument: "up" },
        target: { entity_id: "camera.driveway" },
      },
      {
        type: "home_assistant_service",
        domain: "frigate",
        service: "ptz",
        serviceData: { action: "move", argument: "right" },
        target: { entity_id: "camera.driveway" },
      },
    ],
    readout: "[ptz:up-right]",
  });
});

test("resolvePtzServicePlan stops continuous PTZ moves on release", () => {
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
        type: "home_assistant_service",
        domain: "frigate",
        service: "ptz",
        serviceData: { action: "stop" },
        target: { entity_id: "camera.driveway" },
      },
    ],
    readout: "[ptz:stop]",
  });
});

test("resolvePtzServicePlan maps zoom in to the Frigate integration PTZ service", () => {
  const request = resolvePtzServicePlan({
    camera: {
      entity: "camera.driveway",
      ptz: true,
    },
    ptzInfo: { features: ["pt", "zoom"] },
    action: "zoom-in",
    eventType: "press",
  });

  assert.deepEqual(request, {
    executionMode: "sequential",
    requests: [
      {
        type: "home_assistant_service",
        domain: "frigate",
        service: "ptz",
        serviceData: { action: "zoom", argument: "in" },
        target: { entity_id: "camera.driveway" },
      },
    ],
    readout: "[ptz:zoom-in]",
  });
});

test("resolvePtzServicePlan maps focus out to the Frigate integration PTZ service", () => {
  const request = resolvePtzServicePlan({
    camera: {
      entity: "camera.driveway",
      ptz: true,
    },
    ptzInfo: { features: ["pt", "focus"] },
    action: "focus-out",
    eventType: "press",
  });

  assert.deepEqual(request, {
    executionMode: "sequential",
    requests: [
      {
        type: "home_assistant_service",
        domain: "frigate",
        service: "ptz",
        serviceData: { action: "focus", argument: "out" },
        target: { entity_id: "camera.driveway" },
      },
    ],
    readout: "[ptz:focus-out]",
  });
});

test("resolvePtzServicePlan stops zoom and focus actions on release", () => {
  const zoomStop = resolvePtzServicePlan({
    camera: {
      entity: "camera.driveway",
      ptz: true,
    },
    ptzInfo: { features: ["pt", "zoom"] },
    action: "zoom-in",
    eventType: "release",
  });
  const focusStop = resolvePtzServicePlan({
    camera: {
      entity: "camera.driveway",
      ptz: true,
    },
    ptzInfo: { features: ["pt", "focus"] },
    action: "focus-in",
    eventType: "release",
  });

  assert.deepEqual(zoomStop, {
    executionMode: "sequential",
    requests: [
      {
        type: "home_assistant_service",
        domain: "frigate",
        service: "ptz",
        serviceData: { action: "stop" },
        target: { entity_id: "camera.driveway" },
      },
    ],
    readout: "[ptz:stop]",
  });
  assert.deepEqual(focusStop, zoomStop);
});

test("resolvePtzServicePlan uses ONVIF PTZ service for ha_direct cameras", () => {
  const request = resolvePtzServicePlan({
    camera: {
      entity: "camera.driveway",
      connection_type: "ha_direct",
      ptz: true,
    },
    ptzInfo: null,
    action: "left",
    eventType: "press",
  });

  assert.deepEqual(request, {
    executionMode: "sequential",
    requests: [
      {
        type: "home_assistant_service",
        domain: "onvif",
        service: "ptz",
        serviceData: {
          move_mode: "ContinuousMove",
          pan: "LEFT",
          speed: 0.5,
        },
        target: { entity_id: "camera.driveway" },
      },
    ],
    readout: "[ptz:left]",
  });
});

test("resolvePtzServicePlan uses ONVIF stop for ha_direct release", () => {
  const request = resolvePtzServicePlan({
    camera: {
      entity: "camera.driveway",
      connection_type: "ha_direct",
      ptz: true,
    },
    ptzInfo: null,
    action: "left",
    eventType: "release",
  });

  assert.deepEqual(request, {
    executionMode: "sequential",
    requests: [
      {
        type: "home_assistant_service",
        domain: "onvif",
        service: "ptz",
        serviceData: { move_mode: "Stop" },
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

test("resolvePtzServicePlan stops release even when relative move mode is configured", () => {
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

  assert.deepEqual(request, {
    executionMode: "sequential",
    requests: [
      {
        type: "home_assistant_service",
        domain: "frigate",
        service: "ptz",
        serviceData: { action: "stop" },
        target: { entity_id: "camera.driveway" },
      },
    ],
    readout: "[ptz:stop]",
  });
});

test("hasCameraPtz requires an enabled PTZ camera config", () => {
  assert.equal(hasCameraPtz({ ptz: { enabled: false } }), false);
  assert.equal(hasCameraPtz({ ptz: { enabled: true } }), true);
});

test("canCameraUsePtz requires Frigate pan tilt capability", () => {
  assert.equal(canCameraUsePtz({ ptz: true }, { features: ["pt"] }), true);
  assert.equal(canCameraUsePtz({ ptz: true }, { features: ["pt-r"] }), true);
});

test("hasTwoWayTalkCapability detects talk support from PTZ info payload", () => {
  assert.equal(hasTwoWayTalkCapability(null), false);
  assert.equal(hasTwoWayTalkCapability({ two_way_talk: true }), true);
  assert.equal(hasTwoWayTalkCapability({ features: ["pt", "talk"] }), true);
  assert.equal(hasTwoWayTalkCapability({ capabilities: ["microphone"] }), true);
  assert.equal(hasTwoWayTalkCapability({ features: ["pt", "zoom"] }), false);
});
