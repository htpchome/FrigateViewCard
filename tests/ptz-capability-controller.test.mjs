import { test } from "node:test";
import assert from "node:assert/strict";

import { createPtzCapabilityController } from "../src/features/ptz/capability.ctrl.js";

const createHost = () => {
  const calls = [];
  const host = {
    _activeCam: {
      entity: "camera.driveway",
      connection_type: "frigate_go2rtc",
      ptz: { enabled: true, rotation: 90 },
    },
    _camCache: {},
    _tab: "controls",
    _isControlsButtonVisible: () => true,
    _discoverOne: async (entity) => {
      calls.push(["discover", entity]);
      Object.assign(host._camCache[entity], {
        clientId: "frigate-main",
        cam: "driveway",
        discovered: true,
      });
    },
    _ws: async (message) => {
      calls.push(["request", message]);
      return { features: ["pt"], presets: ["Home"] };
    },
    _renderList: () => calls.push(["render"]),
  };
  return { calls, host };
};

test("PTZ capability controller discovers, caches, and refreshes active controls", async () => {
  const { calls, host } = createHost();
  const controller = createPtzCapabilityController(host);

  const info = await controller.ensureActiveInfo();

  assert.deepEqual(info, { features: ["pt"], presets: ["Home"] });
  assert.equal(controller.activeInfo(), info);
  assert.equal(host._camCache["camera.driveway"].ptzInfoFetched, true);
  assert.equal(host._camCache["camera.driveway"].ptzInfoPromise, null);
  assert.deepEqual(calls, [
    ["discover", "camera.driveway"],
    [
      "request",
      {
        type: "frigate/ptz/info",
        instance_id: "frigate-main",
        camera: "driveway",
      },
    ],
    ["render"],
  ]);

  assert.equal(await controller.ensureActiveInfo(), info);
  assert.equal(calls.filter(([type]) => type === "request").length, 1);
});

test("PTZ capability controller gates active discovery by control availability", async () => {
  const { calls, host } = createHost();
  host._isControlsButtonVisible = () => false;
  const controller = createPtzCapabilityController(host);

  assert.equal(await controller.ensureActiveInfo(), null);
  assert.deepEqual(calls, []);
});

test("PTZ capability controller marks unavailable camera discovery complete", async () => {
  const { calls, host } = createHost();
  host._activeCam = { entity: "camera.missing", ptz: true };
  host._discoverOne = async (entity) => calls.push(["discover", entity]);
  const controller = createPtzCapabilityController(host);

  assert.equal(await controller.ensureActiveInfo(), null);
  assert.equal(host._camCache["camera.missing"].ptzInfoFetched, true);
  assert.deepEqual(calls, [["discover", "camera.missing"]]);
});

test("PTZ motion context snapshots camera config and rejects camera switches", async () => {
  const { host } = createHost();
  host._camCache["camera.driveway"] = {
    ptzInfo: { features: ["pt"] },
    ptzInfoFetched: true,
  };
  const controller = createPtzCapabilityController(host);

  const context = await controller.resolveContext();
  assert.deepEqual(context, {
    camera: {
      entity: "camera.driveway",
      connection_type: "frigate_go2rtc",
      ptz: { enabled: true, rotation: 90 },
    },
    ptzInfo: { features: ["pt"] },
  });
  assert.notEqual(context.camera, host._activeCam);
  assert.notEqual(context.camera.ptz, host._activeCam.ptz);

  host._camCache["camera.driveway"].ptzInfo = null;
  host._camCache["camera.driveway"].ptzInfoFetched = false;
  host._ws = async () => {
    host._activeCam = { entity: "camera.garage", ptz: true };
    return { features: ["pt"] };
  };
  assert.equal(await controller.resolveContext(), null);
});
