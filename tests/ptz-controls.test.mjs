import { test } from "node:test";
import assert from "node:assert/strict";

import {
  canCameraUsePtz,
  hasCameraPtz,
  isPtzHomePreset,
  isPtzControlsPadEvent,
  normalizeCameraPtzConfig,
  normalizePtzControlRotation,
  normalizePtzPresetNames,
  resolvePtzControlDirection,
  resolvePtzDisplayZoomPlan,
  resolvePtzHoldPlan,
  resolvePtzServicePlan,
} from "../src/features/ptz/index.js";

test("normalizeCameraPtzConfig enables boolean PTZ config", () => {
  assert.deepEqual(normalizeCameraPtzConfig(true), { enabled: true });
});

test("normalizeCameraPtzConfig discards legacy motion tuning values", () => {
  assert.deepEqual(
    normalizeCameraPtzConfig({
      enabled: true,
      move_mode: "RelativeMove",
      speed: 0.4,
      distance: 0.2,
      continuous_duration: 0.8,
    }),
    { enabled: true },
  );
});

test("normalizeCameraPtzConfig preserves only supported PTZ control rotation", () => {
  assert.deepEqual(
    normalizeCameraPtzConfig({ enabled: true, rotation: "90" }),
    { enabled: true, rotation: 90 },
  );
  assert.deepEqual(
    normalizeCameraPtzConfig({ enabled: true, rotation: 45 }),
    { enabled: true },
  );
  assert.equal(normalizePtzControlRotation(270), 270);
  assert.equal(normalizePtzControlRotation("invalid"), 0);
});

test("PTZ control rotation remaps visible directions without changing other actions", () => {
  const camera = { ptz: { enabled: true, rotation: 90 } };
  assert.equal(resolvePtzControlDirection(camera, "up"), "left");
  assert.equal(resolvePtzControlDirection(camera, "right"), "up");
  assert.equal(resolvePtzControlDirection(camera, "down"), "right");
  assert.equal(resolvePtzControlDirection(camera, "left"), "down");
  assert.equal(resolvePtzControlDirection(camera, "zoom-in"), "zoom-in");
});

test("PTZ preset names normalize safely and identify only an explicit Home preset", () => {
  const ptzInfo = {
    presets: [" preset1 ", "Home", "preset1", "", null, 3],
  };
  assert.deepEqual(normalizePtzPresetNames(ptzInfo), ["preset1", "Home"]);
  assert.equal(isPtzHomePreset(" HOME "), true);
  assert.equal(isPtzHomePreset("preset1"), false);
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
  });
});

test("resolvePtzServicePlan applies the configured control rotation", () => {
  const request = resolvePtzServicePlan({
    camera: {
      entity: "camera.driveway",
      ptz: { enabled: true, rotation: 90 },
    },
    ptzInfo: { features: ["pt"] },
    action: "up",
    eventType: "press",
  });

  assert.deepEqual(request?.requests?.[0]?.serviceData, {
    action: "move",
    argument: "left",
  });
});

test("resolvePtzServicePlan recalls only presets reported by the camera", () => {
  const camera = {
    entity: "camera.driveway",
    connection_type: "ha_direct",
    ptz: { enabled: true },
  };
  const ptzInfo = { features: ["pt"], presets: ["preset1", "Home"] };
  const request = resolvePtzServicePlan({
    camera,
    ptzInfo,
    action: "preset",
    argument: "preset1",
    eventType: "press",
  });

  assert.deepEqual(request, {
    executionMode: "sequential",
    requests: [
      {
        type: "home_assistant_service",
        domain: "frigate",
        service: "ptz",
        serviceData: { action: "preset", argument: "preset1" },
        target: { entity_id: "camera.driveway" },
      },
    ],
  });
  assert.equal(
    resolvePtzServicePlan({
      camera,
      ptzInfo,
      action: "preset",
      argument: "not-imported",
      eventType: "press",
    }),
    null,
  );
  assert.equal(
    resolvePtzServicePlan({
      camera,
      ptzInfo,
      action: "preset",
      argument: "preset1",
      eventType: "release",
    }),
    null,
  );
});

test("resolvePtzServicePlan rejects diagonal PTZ actions", () => {
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

  assert.equal(request, null);
});

test("resolvePtzHoldPlan treats Frigate pt-r service moves as continuous", () => {
  assert.deepEqual(
    resolvePtzHoldPlan({
      camera: { entity: "camera.driveway", ptz: true },
      ptzInfo: { features: ["pt", "pt-r"] },
      action: "left",
    }),
    {
      strategy: "frigate_continuous",
      repeatIntervalMs: null,
      requiresStop: true,
    },
  );
});

test("resolvePtzHoldPlan keeps legacy Frigate continuous moves explicit", () => {
  assert.deepEqual(
    resolvePtzHoldPlan({
      camera: { entity: "camera.driveway", ptz: true },
      ptzInfo: { features: ["pt"] },
      action: "left",
    }),
    {
      strategy: "frigate_continuous",
      repeatIntervalMs: null,
      requiresStop: true,
    },
  );
});

test("resolvePtzHoldPlan keeps Frigate control semantics with HA-direct playback", () => {
  assert.deepEqual(
    resolvePtzHoldPlan({
      camera: {
        entity: "camera.driveway",
        connection_type: "ha_direct",
        ptz: true,
      },
      ptzInfo: { features: ["pt"] },
      action: "left",
    }),
    {
      strategy: "frigate_continuous",
      repeatIntervalMs: null,
      requiresStop: true,
    },
  );
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
  });
});

test("PTZ zoom actions resolve to local display zoom without capability detection", () => {
  const zoomIn = resolvePtzDisplayZoomPlan({
    camera: {
      entity: "camera.driveway",
      ptz: true,
    },
    action: "zoom-in",
    eventType: "press",
  });
  const zoomOut = resolvePtzDisplayZoomPlan({
    camera: {
      entity: "camera.driveway",
      connection_type: "ha_direct",
      ptz: true,
    },
    action: "zoom-out",
    eventType: "press",
  });
  const release = resolvePtzDisplayZoomPlan({
    camera: { entity: "camera.driveway", ptz: true },
    action: "zoom-in",
    eventType: "release",
  });

  assert.deepEqual(zoomIn, {
    executionMode: "display_zoom",
    delta: 0.2,
  });
  assert.deepEqual(zoomOut, {
    executionMode: "display_zoom",
    delta: -0.2,
  });
  assert.deepEqual(release, {
    executionMode: "display_zoom",
    delta: 0,
  });
  assert.equal(
    resolvePtzDisplayZoomPlan({
      camera: { entity: "camera.driveway", ptz: { enabled: false } },
      action: "zoom-in",
      eventType: "press",
    }),
    null,
  );
});

test("PTZ zoom actions never resolve to a camera service call", () => {
  for (const connectionType of ["frigate_go2rtc", "ha_direct"]) {
    assert.equal(
      resolvePtzServicePlan({
        camera: {
          entity: "camera.driveway",
          connection_type: connectionType,
          ptz: true,
        },
        ptzInfo: { features: ["pt", "zoom"] },
        action: "zoom-in",
        eventType: "press",
      }),
      null,
    );
  }
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
  });
});

test("resolvePtzServicePlan stops focus actions on release", () => {
  const focusStop = resolvePtzServicePlan({
    camera: {
      entity: "camera.driveway",
      ptz: true,
    },
    ptzInfo: { features: ["pt", "focus"] },
    action: "focus-in",
    eventType: "release",
  });

  assert.deepEqual(focusStop, {
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
  });
});

test("resolvePtzServicePlan keeps Frigate PTZ control with ha_direct playback", () => {
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
  });
});

test("resolvePtzServicePlan keeps Frigate stop with ha_direct playback", () => {
  const request = resolvePtzServicePlan({
    camera: {
      entity: "camera.driveway",
      connection_type: "ha_direct",
      ptz: true,
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
  });
});

test("resolvePtzServicePlan ignores PTZ when Frigate has no pan tilt capability", () => {
  const request = resolvePtzServicePlan({
    camera: {
      entity: "camera.driveway",
      ptz: true,
    },
    ptzInfo: { features: ["zoom"] },
    action: "up",
    eventType: "press",
  });

  assert.equal(request, null);
});

test("resolvePtzServicePlan stops Frigate pt-r service moves on release", () => {
  const request = resolvePtzServicePlan({
    camera: {
      entity: "camera.driveway",
      ptz: {
        enabled: true,
        move_mode: "RelativeMove",
        distance: 0.25,
      },
    },
    ptzInfo: { features: ["pt-r"] },
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
  });
});

test("hasCameraPtz requires an enabled PTZ camera config", () => {
  assert.equal(hasCameraPtz({ ptz: { enabled: false } }), false);
  assert.equal(hasCameraPtz({ ptz: { enabled: true } }), true);
});

test("canCameraUsePtz requires Frigate pan tilt capability", () => {
  assert.equal(canCameraUsePtz({ ptz: true }, { features: ["pt"] }), true);
  assert.equal(canCameraUsePtz({ ptz: true }, { features: ["pt-r"] }), true);
  assert.equal(
    canCameraUsePtz(
      { connection_type: "ha_direct", ptz: true },
      { features: ["zoom"] },
    ),
    false,
  );
});

test("isPtzControlsPadEvent recognizes direct and composed circle-pad events", () => {
  assert.equal(
    isPtzControlsPadEvent({ target: { id: "controls-pad" } }),
    true,
  );
  assert.equal(
    isPtzControlsPadEvent({
      target: { id: "nested-target" },
      composedPath: () => [{ id: "nested-target" }, { id: "controls-pad" }],
    }),
    true,
  );
  assert.equal(
    isPtzControlsPadEvent({
      target: { id: "other" },
      composedPath: () => [{ id: "other" }],
    }),
    false,
  );
});
