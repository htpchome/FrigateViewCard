import { test } from "node:test";
import assert from "node:assert/strict";

import { createHaDirectMounter } from "../src/features/live/ha-direct-mounter.js";

function createFakeStreamElement() {
  return {
    style: { cssText: "" },
    removeCalled: false,
    remove() {
      this.removeCalled = true;
    },
  };
}

function withFakeDocument(run) {
  const previousDocument = globalThis.document;
  globalThis.document = {
    createElement: (tag) => {
      if (String(tag).toLowerCase() !== "ha-camera-stream") {
        throw new Error(`Unexpected tag: ${tag}`);
      }
      return createFakeStreamElement();
    },
  };
  return Promise.resolve()
    .then(() => run())
    .finally(() => {
      globalThis.document = previousDocument;
    });
}

function withImmediateTimeout(run) {
  const previousSetTimeout = globalThis.setTimeout;
  globalThis.setTimeout = (fn) => {
    fn();
    return 0;
  };
  return Promise.resolve()
    .then(() => run())
    .finally(() => {
      globalThis.setTimeout = previousSetTimeout;
    });
}

test("ha direct mounter mounts and schedules follow-up without blocking", async () => {
  await withFakeDocument(async () => {
    await withImmediateTimeout(async () => {
      const slot = {
        innerHTML: "occupied",
        appended: [],
        appendChild(node) {
          this.appended.push(node);
          this.lastChild = node;
        },
      };
      const hass = {
        states: {
          "camera.front": {
            entity_id: "camera.front",
            attributes: {},
          },
        },
      };
      let assignedEngine = null;
      let attached = 0;
      const appliedStates = [];
      let waitCalls = 0;
      const mounter = createHaDirectMounter({
        getHass: () => hass,
        getPreferredStreamType: () => "webrtc",
        getStreamMuted: () => true,
        getRotateOverlayActive: () => true,
        isCurrentEngine: (streamEl) => assignedEngine === streamEl,
        waitForStreamStart: async () => {
          waitCalls += 1;
          return true;
        },
        attachVideoFit: () => {
          attached += 1;
        },
        assignCommittedEngine: (engine) => {
          assignedEngine = engine;
        },
        applyResolvedStreamUiState: (streamState) => {
          appliedStates.push(streamState);
        },
        setLiveNativeControls: () => {},
      });

      const result = await mounter.tryMount(
        slot,
        { streamType: "hls" },
        { entity: "camera.front", commit: true },
      );

      assert.equal(result?.ok, true);
      assert.equal(result?.type, "hls");
      assert.equal(slot.innerHTML, "");
      assert.equal(slot.lastChild, assignedEngine);
      assert.equal(attached, 1);
      assert.equal(waitCalls, 1);
      assert.equal(appliedStates.length >= 1, true);
    });
  });
});

test("ha direct mounter applies unavailable state when no camera state exists", async () => {
  const appliedStates = [];
  const mounter = createHaDirectMounter({
    getHass: () => ({ states: {} }),
    getPreferredStreamType: () => "webrtc",
    getStreamMuted: () => false,
    getRotateOverlayActive: () => false,
    isCurrentEngine: () => false,
    waitForStreamStart: async () => true,
    attachVideoFit: () => {},
    assignCommittedEngine: () => {},
    applyResolvedStreamUiState: (streamState) => {
      appliedStates.push(streamState);
    },
    setLiveNativeControls: () => {},
  });

  const result = await mounter.tryMount(
    { innerHTML: "", appendChild() {} },
    null,
    { entity: "camera.front", commit: true },
  );

  assert.equal(result, false);
  assert.deepEqual(appliedStates, [
    {
      loading: false,
      fallbackVisible: false,
      refreshFallbackImage: false,
    },
  ]);
});
