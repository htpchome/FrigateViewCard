import { test } from "node:test";
import assert from "node:assert/strict";

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

test("_subscribe aggregates successful realtime subscriptions into one cleanup", async () => {
  const calls = [];
  const callbacks = [];
  const ctx = {
    _config: {
      cameras: [
        { entity: "camera.front" },
        { entity: "camera.driveway" },
        { entity: "camera.front_duplicate" },
      ],
    },
    _camCache: {
      "camera.front": { clientId: "frigate-a" },
      "camera.driveway": { clientId: "frigate-b" },
      "camera.front_duplicate": { clientId: "frigate-a" },
    },
    _cc: () => ({ clientId: "frigate-a" }),
    _hass: {
      connection: {
        subscribeMessage(callback, payload) {
          callbacks.push(callback);
          calls.push(["subscribe", payload.instance_id]);
          if (payload.instance_id === "frigate-b") {
            return Promise.reject(new Error("subscription unavailable"));
          }
          return Promise.resolve(() => {
            calls.push(["unsubscribe", payload.instance_id]);
          });
        },
      },
    },
    _handleGridRealtimeMessage: () => calls.push(["gridMessage"]),
    _previewAlertController: {
      handleRealtimeMessage: () => calls.push(["previewMessage"]),
    },
    _wideViewPageController: {
      handleCompanionRealtimeMessage: () => calls.push(["companionMessage"]),
    },
    _handleSlideshowRealtimeMessage: () => calls.push(["slideshowMessage"]),
    _isNowWindow: () => false,
  };

  await FrigateViewCard.prototype._subscribe.call(ctx);

  assert.deepEqual(calls, [
    ["subscribe", "frigate-a"],
    ["subscribe", "frigate-b"],
  ]);
  assert.equal(callbacks.length, 2);

  callbacks[0]({ type: "new" });
  assert.deepEqual(calls.slice(-4), [
    ["gridMessage"],
    ["previewMessage"],
    ["companionMessage"],
    ["slideshowMessage"],
  ]);

  const unsubscribe = await ctx._unsub;
  assert.equal(typeof unsubscribe, "function");
  unsubscribe();
  assert.deepEqual(calls.slice(-1), [["unsubscribe", "frigate-a"]]);
});
