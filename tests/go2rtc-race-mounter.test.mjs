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
    getPendingMountDestroyers: () => [],
    setPendingMountDestroyers: () => {},
    isMountTokenCurrent: () => true,
    adoptMountedAttempt: () => {},
    waitForStreamStart: async () => true,
    isCurrentWinnerEngine: () => true,
    getPendingWebRtcTakeoverTimer: () => null,
    setPendingWebRtcTakeoverTimer: () => {},
  });

  const attempts = raceMounter.buildAttempts("camera.front");
  assert.deepEqual(
    attempts.map((attempt) => attempt.type),
    ["webrtc", "mse"],
  );
});

test("go2rtc race mounter adopts the fallback winner and retains deferred webrtc", async () => {
  const previousDocument = globalThis.document;
  globalThis.document = {
    createElement: () => ({ style: {}, remove() {} }),
  };
  let pendingDestroyers = [];
  let adopted = null;
  let pendingTimer = null;
  let winnerDestroyed = false;
  let currentWinnerEngine = null;
  try {
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
          engine: {
            destroy() {
              winnerDestroyed = true;
            },
          },
        }),
        tryMountHls: async () => false,
      },
      isDesktop: true,
      resolveConnectionType: () => "frigate_go2rtc",
      disableHlsDesktopForEntity: () => true,
      getPendingMountDestroyers: () => pendingDestroyers,
      setPendingMountDestroyers: (next) => {
        pendingDestroyers = next;
      },
      isMountTokenCurrent: () => true,
      adoptMountedAttempt: (slot, winner) => {
        adopted = { slot, winner };
        currentWinnerEngine = winner?.engine || null;
      },
      waitForStreamStart: async () => true,
      isCurrentWinnerEngine: (engine) => currentWinnerEngine === engine,
      getPendingWebRtcTakeoverTimer: () => pendingTimer,
      setPendingWebRtcTakeoverTimer: (timer) => {
        pendingTimer = timer;
      },
    });

    const slot = {
      children: [],
      attachedOrchestrator: null,
      clearedOrchestrator: null,
      appendChild(child) {
        this.children.push(child);
      },
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
    assert.deepEqual(
      pendingDestroyers.map((attempt) => attempt.type),
      ["webrtc"],
    );
    assert.ok(slot.attachedOrchestrator);
    assert.equal(slot.clearedOrchestrator, slot.attachedOrchestrator);

    await delay(80);

    assert.equal(adopted?.winner?.type, "webrtc");
    assert.equal(winnerDestroyed, true);
    assert.equal(pendingTimer, null);
    assert.deepEqual(pendingDestroyers, []);
  } finally {
    globalThis.document = previousDocument;
  }
});
