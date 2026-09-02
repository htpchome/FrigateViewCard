import assert from "node:assert/strict";
import test from "node:test";

globalThis.window = globalThis.window || { customCards: [] };
globalThis.window.customCards = globalThis.window.customCards || [];
globalThis.document = globalThis.document || {
  createElement: () => ({
    style: {},
    setAttribute() {},
    removeAttribute() {},
    appendChild() {},
    addEventListener() {},
    removeEventListener() {},
    querySelector() {
      return null;
    },
    querySelectorAll() {
      return [];
    },
  }),
  head: { appendChild() {} },
};
globalThis.customElements = globalThis.customElements || {
  define() {},
  get() {
    return undefined;
  },
};
globalThis.HTMLElement =
  globalThis.HTMLElement ||
  class {
    attachShadow() {
      return {
        addEventListener() {},
        removeEventListener() {},
        querySelector() {
          return null;
        },
        querySelectorAll() {
          return [];
        },
      };
    }
  };
globalThis.HTMLImageElement = globalThis.HTMLImageElement || class {};

const { FrigateViewCard } = await import("../src/card/FrigateViewCard.js");

test("HA-direct PTZ motion resolves Frigate capability information", async () => {
  const ptzInfo = { features: ["pt"] };
  let capabilityLookups = 0;
  const context = {
    _activeCam: {
      entity: "camera.driveway",
      connection_type: "ha_direct",
      ptz: { enabled: true },
    },
    _activeCameraPtzInfo: () => null,
    _ensureActiveCameraPtzInfo: async () => {
      capabilityLookups += 1;
      return ptzInfo;
    },
  };

  const result =
    await FrigateViewCard.prototype._resolvePtzMotionContext.call(context);

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
  const context = {
    _resolvePtzMotionContext: async () => ({
      camera: {
        entity: "camera.driveway",
        connection_type: "ha_direct",
        ptz: { enabled: true },
      },
      ptzInfo: { features: ["pt"], presets: ["preset1"] },
    }),
    _executePtzCameraAction: async (request) => calls.push(request),
  };

  await FrigateViewCard.prototype._handlePtzPreset.call(
    context,
    "preset1",
    button,
  );

  assert.equal(calls.length, 1);
  assert.equal(calls[0].action, "preset");
  assert.equal(calls[0].argument, "preset1");
  assert.equal(calls[0].eventType, "press");
  assert.equal(button.disabled, false);
  assert.equal(classes.has("is-activating"), false);
  assert.equal(attributes.has("aria-busy"), false);
});
