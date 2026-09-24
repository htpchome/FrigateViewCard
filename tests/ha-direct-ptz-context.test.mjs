import assert from "node:assert/strict";
import test from "node:test";

import { createPtzCapabilityController } from "../src/features/ptz/capability.ctrl.js";
import { PtzInteractionController } from "../src/features/ptz/interaction.ctrl.js";

test("HA-direct PTZ motion resolves Frigate capability information", async () => {
  const ptzInfo = { features: ["pt"] };
  let capabilityLookups = 0;
  const host = {
    _activeCam: {
      entity: "camera.driveway",
      connection_type: "ha_direct",
      ptz: { enabled: true },
    },
    _camCache: {},
    _isControlsButtonVisible: () => true,
    _discoverOne: async (entity) => {
      Object.assign(host._camCache[entity], {
        clientId: "frigate-main",
        cam: "driveway",
        discovered: true,
      });
    },
    _ws: async () => {
      capabilityLookups += 1;
      return ptzInfo;
    },
    _renderList() {},
  };
  const controller = createPtzCapabilityController(host);

  const result = await controller.resolveContext();

  assert.equal(capabilityLookups, 1);
  assert.deepEqual(result, {
    camera: {
      entity: "camera.driveway",
      connection_type: "ha_direct",
      ptz: { enabled: true },
    },
    ptzInfo,
  });
});

test("imported PTZ preset buttons execute the named preset and restore UI state", async () => {
  const calls = [];
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
  const controller = new PtzInteractionController({
    _activeCam: {
      entity: "camera.driveway",
      connection_type: "ha_direct",
      ptz: { enabled: true },
    },
    _ptzCapabilityController: {
      resolveContext: async () => ({
        camera: {
          entity: "camera.driveway",
          connection_type: "ha_direct",
          ptz: { enabled: true },
        },
        ptzInfo: { features: ["pt"], presets: ["preset1"] },
      }),
    },
    _executePtzCameraAction: async (request) => calls.push(request),
  });

  await controller.handlePreset("preset1", button);

  assert.equal(calls.length, 1);
  assert.equal(calls[0].action, "preset");
  assert.equal(calls[0].argument, "preset1");
  assert.equal(calls[0].eventType, "press");
  assert.equal(button.disabled, false);
  assert.equal(classes.has("is-activating"), false);
  assert.equal(attributes.has("aria-busy"), false);
});
