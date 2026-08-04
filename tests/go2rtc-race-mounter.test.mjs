import { test } from "node:test";
import assert from "node:assert/strict";

import { createGo2RtcRaceMounter } from "../src/features/live/go2rtc-race-mounter.js";

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

test("go2rtc race mounter builds attempts with desktop HLS filtering", () => {
  const raceMounter = createGo2RtcRaceMounter({
    mounter: {
      tryMountWebRtc: () => ({ ok: true }),
      tryMountMse: () => ({ ok: true }),
      tryMountHls: () => ({ ok: true }),
    },
    isDesktop: true,
    resolveConnectionType: () => "frigate_go2rtc",
    disableHlsDesktopForEntity: () => true,
    createAttemptSlot: () => ({}),
    getPendingMountDestroyers: () => [],
    setPendingMountDestroyers: () => {},
    isMountTokenCurrent: () => true,
    adoptMountedAttempt: () => {},
    scheduleDeferredWebRtcTakeover: () => {},
  });

  const attempts = raceMounter.buildAttempts("camera.front");
  assert.deepEqual(
    attempts.map((attempt) => attempt.type),
    ["webrtc", "mse"],
  );
});

test("go2rtc race mounter adopts the fallback winner and retains deferred webrtc", async () => {
  let pendingDestroyers = [];
  let adopted = null;
  let deferred = null;
  const raceMounter = createGo2RtcRaceMounter({
    mounter: {
      tryMountWebRtc: async (slot) => {
        await delay(20);
        return {
          ok: true,
          type: "webrtc",
          slot,
          engine: { destroy() {} },
        };
      },
      tryMountMse: async (slot) => ({
        ok: true,
        type: "mse",
        slot,
        engine: { destroy() {} },
      }),
      tryMountHls: async () => false,
    },
    isDesktop: true,
    resolveConnectionType: () => "frigate_go2rtc",
    disableHlsDesktopForEntity: () => true,
    createAttemptSlot: () => ({
      style: {},
      remove() {},
    }),
    getPendingMountDestroyers: () => pendingDestroyers,
    setPendingMountDestroyers: (next) => {
      pendingDestroyers = next;
    },
    isMountTokenCurrent: () => true,
    adoptMountedAttempt: (slot, winner) => {
      adopted = { slot, winner };
    },
    scheduleDeferredWebRtcTakeover: (options) => {
      deferred = options;
    },
  });

  const slot = {
    attachedOrchestrator: null,
    clearedOrchestrator: null,
    attachOrchestrator(orchestrator) {
      this.attachedOrchestrator = orchestrator;
    },
    clearOrchestrator(orchestrator) {
      this.clearedOrchestrator = orchestrator;
    },
  };

  const result = await raceMounter.mountWithRace({
    slot,
    entity: "camera.front",
    mountToken: 7,
  });

  assert.equal(result, true);
  assert.equal(adopted?.winner?.type, "mse");
  assert.equal(deferred?.deferredAttempt?.type, "webrtc");
  assert.equal(deferred?.winnerType, "mse");
  assert.deepEqual(
    pendingDestroyers.map((attempt) => attempt.type),
    ["webrtc"],
  );
  assert.ok(slot.attachedOrchestrator);
  assert.equal(slot.clearedOrchestrator, slot.attachedOrchestrator);
});
