import { test } from "node:test";
import assert from "node:assert/strict";

import { createGo2RtcRaceMounter } from "../src/features/live/go2rtc-race-mounter.js";

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

test("go2rtc race mounter excludes HLS from automatic startup", () => {
  const raceMounter = createGo2RtcRaceMounter({
    mounter: {
      tryMountWebRtc: () => ({ ok: true }),
      tryMountMse: () => ({ ok: true }),
      tryMountHls: () => ({ ok: true }),
    },
    resolveConnectionType: () => "frigate_go2rtc",
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
  let webrtcCalls = 0;
  let mseCalls = 0;
  let winnerDestroyed = false;
  let currentWinnerEngine = null;
  const adoptionOptions = [];
  try {
    const raceMounter = createGo2RtcRaceMounter({
      mounter: {
        tryMountWebRtc: async (slot) => {
          webrtcCalls += 1;
          await delay(20);
          return {
            ok: true,
            type: "webrtc",
            slot,
            engine: { destroy() {} },
          };
        },
        tryMountMse: async (slot) => {
          mseCalls += 1;
          return {
            ok: true,
            type: "mse",
            slot,
            engine: {
              destroy() {
                winnerDestroyed = true;
              },
            },
          };
        },
        tryMountHls: async () => false,
      },
      resolveConnectionType: () => "frigate_go2rtc",
      getPendingMountDestroyers: () => pendingDestroyers,
      setPendingMountDestroyers: (next) => {
        pendingDestroyers = next;
      },
      isMountTokenCurrent: () => true,
      adoptMountedAttempt: (slot, winner, options = {}) => {
        adopted = { slot, winner };
        adoptionOptions.push(options);
        currentWinnerEngine = winner?.engine || null;
      },
      waitForStreamStart: async () => true,
      isCurrentWinnerEngine: (engine) => currentWinnerEngine === engine,
      getPendingWebRtcTakeoverTimer: () => pendingTimer,
      setPendingWebRtcTakeoverTimer: (timer) => {
        pendingTimer = timer;
      },
      preferredWebRtcWaitMs: 5,
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
    assert.equal(adoptionOptions[0]?.preservePendingSlots, true);
    await delay(0);
    assert.deepEqual(
      pendingDestroyers.map((attempt) => attempt.type),
      ["webrtc"],
    );
    assert.ok(slot.attachedOrchestrator);
    await delay(80);

    assert.equal(slot.clearedOrchestrator, slot.attachedOrchestrator);

    assert.equal(adopted?.winner?.type, "webrtc");
    assert.equal(adoptionOptions[1]?.preservePendingSlots, undefined);
    assert.equal(winnerDestroyed, true);
    assert.equal(pendingTimer, null);
    assert.deepEqual(pendingDestroyers, []);
    const reusedHintResult = await raceMounter.mountWithRace({
      slot,
      entity: "camera.front",
      mountToken: 8,
    });

    assert.equal(reusedHintResult, true);
    assert.equal(adopted?.winner?.type, "webrtc");
    assert.equal(webrtcCalls, 2);
    assert.equal(mseCalls, 1);
  } finally {
    globalThis.document = previousDocument;
  }
});

test("go2rtc race mounter reuses last known good strategy first", async () => {
  const previousDocument = globalThis.document;
  globalThis.document = {
    createElement: () => ({ style: {}, remove() {} }),
  };
  let webrtcCalls = 0;
  let mseCalls = 0;
  try {
    const raceMounter = createGo2RtcRaceMounter({
      mounter: {
        tryMountWebRtc: async (slot) => {
          webrtcCalls += 1;
          await delay(10);
          return { ok: false, type: "webrtc", slot, engine: { destroy() {} } };
        },
        tryMountMse: async (slot) => {
          mseCalls += 1;
          return { ok: true, type: "mse", slot, engine: { destroy() {} } };
        },
        tryMountHls: async () => false,
      },
      resolveConnectionType: () => "frigate_go2rtc",
      getPendingMountDestroyers: () => [],
      setPendingMountDestroyers: () => {},
      isMountTokenCurrent: () => true,
      adoptMountedAttempt: () => {},
      waitForStreamStart: async () => true,
      isCurrentWinnerEngine: () => true,
      getPendingWebRtcTakeoverTimer: () => null,
      setPendingWebRtcTakeoverTimer: () => {},
    });

    const slot = { appendChild() {} };

    await raceMounter.mountWithRace({
      slot,
      entity: "camera.front",
      forcedType: "mse",
      mountToken: 1,
    });
    await raceMounter.mountWithRace({
      slot,
      entity: "camera.front",
      mountToken: 2,
    });

    assert.equal(mseCalls, 2);
    assert.equal(webrtcCalls, 0);
  } finally {
    globalThis.document = previousDocument;
  }
});

test("go2rtc race mounter falls back when hinted strategy fails", async () => {
  const previousDocument = globalThis.document;
  globalThis.document = {
    createElement: () => ({ style: {}, remove() {} }),
  };
  let webrtcCalls = 0;
  let mseCalls = 0;
  let adoptedType = "";
  try {
    const raceMounter = createGo2RtcRaceMounter({
      mounter: {
        tryMountWebRtc: async (slot) => {
          webrtcCalls += 1;
          return { ok: true, type: "webrtc", slot, engine: { destroy() {} } };
        },
        tryMountMse: async (slot) => {
          mseCalls += 1;
          if (mseCalls <= 1) {
            return { ok: true, type: "mse", slot, engine: { destroy() {} } };
          }
          return false;
        },
        tryMountHls: async () => false,
      },
      resolveConnectionType: () => "frigate_go2rtc",
      getPendingMountDestroyers: () => [],
      setPendingMountDestroyers: () => {},
      isMountTokenCurrent: () => true,
      adoptMountedAttempt: (_slot, winner) => {
        adoptedType = winner?.type || "";
      },
      waitForStreamStart: async () => true,
      isCurrentWinnerEngine: () => true,
      getPendingWebRtcTakeoverTimer: () => null,
      setPendingWebRtcTakeoverTimer: () => {},
    });

    const slot = { appendChild() {} };

    await raceMounter.mountWithRace({
      slot,
      entity: "camera.back",
      forcedType: "mse",
      mountToken: 10,
    });
    const result = await raceMounter.mountWithRace({
      slot,
      entity: "camera.back",
      mountToken: 11,
    });

    assert.equal(result, true);
    assert.equal(adoptedType, "webrtc");
    assert.equal(mseCalls, 2);
    assert.equal(webrtcCalls, 1);
  } finally {
    globalThis.document = previousDocument;
  }
});

test("go2rtc race mounter evicts oldest strategy hints when cache is full", async () => {
  const previousDocument = globalThis.document;
  globalThis.document = {
    createElement: () => ({ style: {}, remove() {} }),
  };
  let webrtcCalls = 0;
  let mseCalls = 0;
  try {
    const raceMounter = createGo2RtcRaceMounter({
      mounter: {
        tryMountWebRtc: async (slot) => {
          webrtcCalls += 1;
          return { ok: true, type: "webrtc", slot, engine: { destroy() {} } };
        },
        tryMountMse: async (slot) => {
          mseCalls += 1;
          return { ok: true, type: "mse", slot, engine: { destroy() {} } };
        },
        tryMountHls: async () => false,
      },
      resolveConnectionType: () => "frigate_go2rtc",
      getPendingMountDestroyers: () => [],
      setPendingMountDestroyers: () => {},
      isMountTokenCurrent: () => true,
      adoptMountedAttempt: () => {},
      waitForStreamStart: async () => true,
      isCurrentWinnerEngine: () => true,
      getPendingWebRtcTakeoverTimer: () => null,
      setPendingWebRtcTakeoverTimer: () => {},
    });

    const slot = { appendChild() {} };

    for (let index = 0; index < 70; index += 1) {
      await raceMounter.mountWithRace({
        slot,
        entity: `camera.seed_${index}`,
        forcedType: "mse",
        mountToken: index + 1,
      });
    }

    await raceMounter.mountWithRace({
      slot,
      entity: "camera.seed_0",
      mountToken: 200,
    });

    assert.equal(webrtcCalls, 1);
    assert.equal(mseCalls, 71);
  } finally {
    globalThis.document = previousDocument;
  }
});

test("go2rtc race mounter clears deferred webrtc after max hold window", async () => {
  const previousDocument = globalThis.document;
  globalThis.document = {
    createElement: () => ({ style: {}, remove() {} }),
  };
  let pendingDestroyers = [];
  let adoptedType = "";
  try {
    const raceMounter = createGo2RtcRaceMounter({
      mounter: {
        tryMountWebRtc: async (slot) => {
          await delay(120);
          return {
            ok: false,
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
      resolveConnectionType: () => "frigate_go2rtc",
      getPendingMountDestroyers: () => pendingDestroyers,
      setPendingMountDestroyers: (next) => {
        pendingDestroyers = next;
      },
      isMountTokenCurrent: () => true,
      adoptMountedAttempt: (_slot, winner) => {
        adoptedType = winner?.type || "";
      },
      waitForStreamStart: async () => true,
      isCurrentWinnerEngine: () => true,
      getPendingWebRtcTakeoverTimer: () => null,
      setPendingWebRtcTakeoverTimer: () => {},
      deferredWebRtcMaxHoldMs: 40,
      preferredWebRtcWaitMs: 5,
    });

    const slot = { appendChild() {} };
    const result = await raceMounter.mountWithRace({
      slot,
      entity: "camera.front",
      mountToken: 7,
    });

    assert.equal(result, true);
    assert.equal(adoptedType, "mse");
    await delay(0);
    assert.deepEqual(
      pendingDestroyers.map((attempt) => attempt.type),
      ["webrtc"],
    );

    await delay(90);
    assert.deepEqual(pendingDestroyers, []);
    assert.equal(adoptedType, "mse");
  } finally {
    globalThis.document = previousDocument;
  }
});

test("settling an old deferred attempt cannot clear a newer camera mount", async () => {
  const previousDocument = globalThis.document;
  globalThis.document = {
    createElement: () => ({ style: {}, remove() {} }),
  };
  let pendingDestroyers = [];
  let pendingTimer = null;
  let currentWinnerEngine = null;
  try {
    const raceMounter = createGo2RtcRaceMounter({
      mounter: {
        tryMountWebRtc: async (_slot, _startup, options) => {
          await delay(options.entity === "camera.first" ? 35 : 100);
          return false;
        },
        tryMountMse: async (slot) => ({
          ok: true,
          type: "mse",
          slot,
          engine: { destroy() {} },
        }),
        tryMountHls: async () => false,
      },
      resolveConnectionType: () => "frigate_go2rtc",
      getPendingMountDestroyers: () => pendingDestroyers,
      setPendingMountDestroyers: (next) => {
        pendingDestroyers = next;
      },
      isMountTokenCurrent: () => true,
      adoptMountedAttempt: (_slot, winner) => {
        currentWinnerEngine = winner?.engine || null;
      },
      waitForStreamStart: async () => true,
      isCurrentWinnerEngine: (engine) => currentWinnerEngine === engine,
      getPendingWebRtcTakeoverTimer: () => pendingTimer,
      setPendingWebRtcTakeoverTimer: (timer) => {
        pendingTimer = timer;
      },
      preferredWebRtcWaitMs: 1,
      deferredWebRtcMaxHoldMs: 500,
    });
    const makeSlot = () => ({
      appendChild() {},
      attachOrchestrator() {},
      clearOrchestrator() {},
    });

    await raceMounter.mountWithRace({
      slot: makeSlot(),
      entity: "camera.first",
      mountToken: 1,
    });
    await raceMounter.mountWithRace({
      slot: makeSlot(),
      entity: "camera.second",
      mountToken: 2,
    });
    await delay(55);

    assert.deepEqual(
      pendingDestroyers.map(({ entity, type }) => ({ entity, type })),
      [{ entity: "camera.second", type: "webrtc" }],
    );
    assert.notEqual(pendingTimer, null);

    await delay(80);
    assert.deepEqual(pendingDestroyers, []);
  } finally {
    if (pendingTimer) clearTimeout(pendingTimer);
    globalThis.document = previousDocument;
  }
});

test("race mounter can abort deferred WebRTC after shared cleanup handles are lost", async () => {
  const previousDocument = globalThis.document;
  globalThis.document = {
    createElement: () => ({ style: {}, remove() {} }),
  };
  let pendingDestroyers = [];
  let pendingTimer = null;
  let abortCalls = 0;
  let currentWinnerEngine = null;
  try {
    const raceMounter = createGo2RtcRaceMounter({
      mounter: {
        tryMountWebRtc: async (_slot, _startup, options) =>
          await new Promise((resolve) => {
            options.abortSignal.addEventListener(
              "abort",
              () => {
                abortCalls += 1;
                resolve(false);
              },
              { once: true },
            );
          }),
        tryMountMse: async (slot) => ({
          ok: true,
          type: "mse",
          slot,
          engine: { destroy() {} },
        }),
        tryMountHls: async () => false,
      },
      resolveConnectionType: () => "frigate_go2rtc",
      getPendingMountDestroyers: () => pendingDestroyers,
      setPendingMountDestroyers: (next) => {
        pendingDestroyers = next;
      },
      isMountTokenCurrent: () => true,
      adoptMountedAttempt: (_slot, winner) => {
        currentWinnerEngine = winner?.engine || null;
      },
      waitForStreamStart: async () => true,
      isCurrentWinnerEngine: (engine) => currentWinnerEngine === engine,
      getPendingWebRtcTakeoverTimer: () => pendingTimer,
      setPendingWebRtcTakeoverTimer: (timer) => {
        pendingTimer = timer;
      },
      preferredWebRtcWaitMs: 1,
      deferredWebRtcMaxHoldMs: 500,
    });

    const mounted = await raceMounter.mountWithRace({
      slot: {
        appendChild() {},
        attachOrchestrator() {},
        clearOrchestrator() {},
      },
      entity: "camera.front",
      mountToken: 1,
    });
    assert.equal(mounted, true);
    assert.equal(pendingDestroyers.some(({ type }) => type === "webrtc"), true);

    pendingDestroyers = [];
    raceMounter.cancelPendingWebRtcAttempts();
    await delay(0);

    assert.equal(abortCalls, 1);
    assert.equal(pendingTimer, null);
  } finally {
    if (pendingTimer) clearTimeout(pendingTimer);
    globalThis.document = previousDocument;
  }
});

test("race mounter delays a replacement WebRTC probe after a cancelled switch", async () => {
  const previousDocument = globalThis.document;
  globalThis.document = {
    createElement: () => ({ style: {}, remove() {} }),
  };
  let pendingDestroyers = [];
  let pendingTimer = null;
  let currentWinnerEngine = null;
  let webrtcCalls = 0;
  try {
    const raceMounter = createGo2RtcRaceMounter({
      mounter: {
        tryMountWebRtc: async (_slot, _startup, options) => {
          webrtcCalls += 1;
          return await new Promise((resolve) => {
            options.abortSignal.addEventListener(
              "abort",
              () => resolve(false),
              { once: true },
            );
          });
        },
        tryMountMse: async (slot) => ({
          ok: true,
          type: "mse",
          slot,
          engine: { destroy() {} },
        }),
        tryMountHls: async () => false,
      },
      resolveConnectionType: () => "frigate_go2rtc",
      getPendingMountDestroyers: () => pendingDestroyers,
      setPendingMountDestroyers: (next) => {
        pendingDestroyers = next;
      },
      isMountTokenCurrent: () => true,
      adoptMountedAttempt: (_slot, winner) => {
        currentWinnerEngine = winner?.engine || null;
      },
      waitForStreamStart: async () => true,
      isCurrentWinnerEngine: (engine) => currentWinnerEngine === engine,
      getPendingWebRtcTakeoverTimer: () => pendingTimer,
      setPendingWebRtcTakeoverTimer: (timer) => {
        pendingTimer = timer;
      },
      preferredWebRtcWaitMs: 1,
      deferredWebRtcMaxHoldMs: 60,
      webRtcRetryBackoffMs: 40,
    });
    const createSlot = () => ({
      appendChild() {},
      attachOrchestrator() {},
      clearOrchestrator() {},
    });

    const firstMounted = await raceMounter.mountWithRace({
      slot: createSlot(),
      entity: "camera.first",
      mountToken: 1,
    });
    assert.equal(firstMounted, true);
    assert.equal(webrtcCalls, 1);

    raceMounter.cancelPendingWebRtcAttempts();
    await delay(0);

    const secondMounted = await raceMounter.mountWithRace({
      slot: createSlot(),
      entity: "camera.second",
      mountToken: 2,
    });
    assert.equal(secondMounted, true);
    assert.equal(webrtcCalls, 1);

    await delay(55);
    assert.equal(webrtcCalls, 2);
    raceMounter.cancelPendingWebRtcAttempts();
    await delay(0);
  } finally {
    if (pendingTimer) clearTimeout(pendingTimer);
    globalThis.document = previousDocument;
  }
});

test("forced WebRTC bypasses retry backoff after a genuine timeout", async () => {
  const previousDocument = globalThis.document;
  globalThis.document = {
    createElement: () => ({ style: {}, remove() {} }),
  };
  let pendingDestroyers = [];
  let pendingTimer = null;
  let currentWinnerEngine = null;
  let webrtcCalls = 0;
  let raceMounter = null;
  try {
    raceMounter = createGo2RtcRaceMounter({
      mounter: {
        tryMountWebRtc: async (slot, _startup, options) => {
          webrtcCalls += 1;
          if (webrtcCalls > 1) {
            return {
              ok: true,
              type: "webrtc",
              slot,
              engine: { destroy() {} },
            };
          }
          return await new Promise((resolve) => {
            options.abortSignal.addEventListener(
              "abort",
              () => resolve(false),
              { once: true },
            );
          });
        },
        tryMountMse: async (slot) => ({
          ok: true,
          type: "mse",
          slot,
          engine: { destroy() {} },
        }),
        tryMountHls: async () => false,
      },
      resolveConnectionType: () => "frigate_go2rtc",
      getPendingMountDestroyers: () => pendingDestroyers,
      setPendingMountDestroyers: (next) => {
        pendingDestroyers = next;
      },
      isMountTokenCurrent: () => true,
      adoptMountedAttempt: (_slot, winner) => {
        currentWinnerEngine = winner?.engine || null;
      },
      waitForStreamStart: async () => true,
      isCurrentWinnerEngine: (engine) => currentWinnerEngine === engine,
      getPendingWebRtcTakeoverTimer: () => pendingTimer,
      setPendingWebRtcTakeoverTimer: (timer) => {
        pendingTimer = timer;
      },
      preferredWebRtcWaitMs: 1,
      deferredWebRtcMaxHoldMs: 10,
      webRtcRetryBackoffMs: 80,
    });
    const createSlot = () => ({
      appendChild() {},
      attachOrchestrator() {},
      clearOrchestrator() {},
    });

    const initialMounted = await raceMounter.mountWithRace({
      slot: createSlot(),
      entity: "camera.front",
      mountToken: 1,
    });
    assert.equal(initialMounted, true);
    assert.equal(webrtcCalls, 1);
    await delay(20);

    const forcedMount = raceMounter.mountWithRace({
      slot: createSlot(),
      entity: "camera.front",
      forcedType: "webrtc",
      mountToken: 2,
    });
    await delay(5);
    assert.equal(webrtcCalls, 2);
    assert.equal(await forcedMount, true);
  } finally {
    raceMounter?.cancelPendingWebRtcAttempts?.();
    if (pendingTimer) clearTimeout(pendingTimer);
    globalThis.document = previousDocument;
  }
});

test("mobile fast path does not start fallbacks when webrtc renders before the hedge", async () => {
  const previousDocument = globalThis.document;
  globalThis.document = {
    createElement: () => ({ style: {}, remove() {} }),
  };
  let webrtcCalls = 0;
  let mseCalls = 0;
  let hlsCalls = 0;
  let adoptedType = "";
  try {
    const raceMounter = createGo2RtcRaceMounter({
      mounter: {
        tryMountWebRtc: async (slot) => {
          webrtcCalls += 1;
          return {
            ok: true,
            type: "webrtc",
            slot,
            engine: { destroy() {} },
          };
        },
        tryMountMse: async () => {
          mseCalls += 1;
          return false;
        },
        tryMountHls: async () => {
          hlsCalls += 1;
          return false;
        },
      },
      isMobile: true,
      supportsNativeHlsPlayback: () => false,
      resolveConnectionType: () => "frigate_go2rtc",
      getPendingMountDestroyers: () => [],
      setPendingMountDestroyers: () => {},
      isMountTokenCurrent: () => true,
      adoptMountedAttempt: (_slot, winner) => {
        adoptedType = winner?.type || "";
      },
      waitForStreamStart: async () => true,
      isCurrentWinnerEngine: () => true,
      getPendingWebRtcTakeoverTimer: () => null,
      setPendingWebRtcTakeoverTimer: () => {},
      mobileFallbackHedgeMs: 20,
    });

    const result = await raceMounter.mountWithRace({
      slot: { appendChild() {} },
      entity: "camera.mobile",
      mountToken: 1,
    });
    await delay(50);

    assert.equal(result, true);
    assert.equal(adoptedType, "webrtc");
    assert.equal(webrtcCalls, 1);
    assert.equal(mseCalls, 0);
    assert.equal(hlsCalls, 0);
  } finally {
    globalThis.document = previousDocument;
  }
});

test("mobile hedges unreachable webrtc to MSE before the webrtc timeout", async () => {
  const previousDocument = globalThis.document;
  globalThis.document = {
    createElement: () => ({ style: {}, remove() {} }),
  };
  let pendingDestroyers = [];
  let mseCalls = 0;
  let hlsCalls = 0;
  let adoptedType = "";
  try {
    const raceMounter = createGo2RtcRaceMounter({
      mounter: {
        tryMountWebRtc: async (slot) => {
          await delay(80);
          return { ok: false, type: "webrtc", slot, engine: { destroy() {} } };
        },
        tryMountMse: async (slot) => {
          mseCalls += 1;
          return { ok: true, type: "mse", slot, engine: { destroy() {} } };
        },
        tryMountHls: async () => {
          hlsCalls += 1;
          return false;
        },
      },
      isMobile: true,
      supportsNativeHlsPlayback: () => false,
      resolveConnectionType: () => "frigate_go2rtc",
      getPendingMountDestroyers: () => pendingDestroyers,
      setPendingMountDestroyers: (next) => {
        pendingDestroyers = next;
      },
      isMountTokenCurrent: () => true,
      adoptMountedAttempt: (_slot, winner) => {
        adoptedType = winner?.type || "";
      },
      waitForStreamStart: async () => true,
      isCurrentWinnerEngine: () => true,
      getPendingWebRtcTakeoverTimer: () => null,
      setPendingWebRtcTakeoverTimer: () => {},
      preferredWebRtcWaitMs: 0,
      mobileFallbackHedgeMs: 20,
      mobileDeferredWebRtcMaxHoldMs: 120,
    });

    const startedAt = Date.now();
    const result = await raceMounter.mountWithRace({
      slot: { appendChild() {} },
      entity: "camera.mobile",
      mountToken: 1,
    });
    const elapsedMs = Date.now() - startedAt;

    assert.equal(result, true);
    assert.equal(adoptedType, "mse");
    assert.equal(mseCalls, 1);
    assert.equal(hlsCalls, 0);
    assert.ok(elapsedMs < 70);
    await delay(90);
  } finally {
    globalThis.document = previousDocument;
  }
});

test("mobile does not start HLS even when native HLS is available", async () => {
  const previousDocument = globalThis.document;
  globalThis.document = {
    createElement: () => ({ style: {}, remove() {} }),
  };
  let pendingDestroyers = [];
  let mseCalls = 0;
  let hlsCalls = 0;
  let adoptedType = "";
  try {
    const raceMounter = createGo2RtcRaceMounter({
      mounter: {
        tryMountWebRtc: async (slot) => {
          await delay(80);
          return { ok: false, type: "webrtc", slot, engine: { destroy() {} } };
        },
        tryMountMse: async (slot) => {
          mseCalls += 1;
          return { ok: true, type: "mse", slot, engine: { destroy() {} } };
        },
        tryMountHls: async (slot) => {
          hlsCalls += 1;
          return { ok: true, type: "hls", slot, engine: { destroy() {} } };
        },
      },
      isMobile: true,
      supportsNativeHlsPlayback: () => true,
      resolveConnectionType: () => "frigate_go2rtc",
      getPendingMountDestroyers: () => pendingDestroyers,
      setPendingMountDestroyers: (next) => {
        pendingDestroyers = next;
      },
      isMountTokenCurrent: () => true,
      adoptMountedAttempt: (_slot, winner) => {
        adoptedType = winner?.type || "";
      },
      waitForStreamStart: async () => true,
      isCurrentWinnerEngine: () => true,
      getPendingWebRtcTakeoverTimer: () => null,
      setPendingWebRtcTakeoverTimer: () => {},
      preferredWebRtcWaitMs: 0,
      mobileFallbackHedgeMs: 20,
      mobileDeferredWebRtcMaxHoldMs: 120,
    });

    const result = await raceMounter.mountWithRace({
      slot: { appendChild() {} },
      entity: "camera.mobile",
      mountToken: 1,
    });

    assert.equal(result, true);
    assert.equal(adoptedType, "mse");
    assert.equal(mseCalls, 1);
    assert.equal(hlsCalls, 0);
    await delay(90);
  } finally {
    globalThis.document = previousDocument;
  }
});

test("mobile starts a remembered fallback immediately and upgrades to healthy webrtc", async () => {
  const previousDocument = globalThis.document;
  globalThis.document = {
    createElement: () => ({ style: {}, remove() {} }),
  };
  let pendingDestroyers = [];
  let pendingTimer = null;
  let currentWinnerEngine = null;
  let mseCalls = 0;
  let webrtcCalls = 0;
  const adoptedTypes = [];
  try {
    const raceMounter = createGo2RtcRaceMounter({
      mounter: {
        tryMountWebRtc: async (slot) => {
          webrtcCalls += 1;
          await delay(10);
          return {
            ok: true,
            type: "webrtc",
            slot,
            engine: { destroy() {} },
          };
        },
        tryMountMse: async (slot) => {
          mseCalls += 1;
          return { ok: true, type: "mse", slot, engine: { destroy() {} } };
        },
        tryMountHls: async () => false,
      },
      isMobile: true,
      supportsNativeHlsPlayback: () => false,
      resolveConnectionType: () => "frigate_go2rtc",
      getPendingMountDestroyers: () => pendingDestroyers,
      setPendingMountDestroyers: (next) => {
        pendingDestroyers = next;
      },
      isMountTokenCurrent: () => true,
      adoptMountedAttempt: (_slot, winner) => {
        adoptedTypes.push(winner?.type || "");
        currentWinnerEngine = winner?.engine || null;
      },
      waitForStreamStart: async () => true,
      isCurrentWinnerEngine: (engine) => currentWinnerEngine === engine,
      getPendingWebRtcTakeoverTimer: () => pendingTimer,
      setPendingWebRtcTakeoverTimer: (timer) => {
        pendingTimer = timer;
      },
      mobileFallbackHedgeMs: 20,
      mobileDeferredWebRtcMaxHoldMs: 100,
    });
    const slot = { appendChild() {} };

    await raceMounter.mountWithRace({
      slot,
      entity: "camera.mobile",
      forcedType: "mse",
      mountToken: 1,
    });
    adoptedTypes.length = 0;

    const result = await raceMounter.mountWithRace({
      slot,
      entity: "camera.mobile",
      mountToken: 2,
    });

    assert.equal(result, true);
    assert.equal(adoptedTypes[0], "mse");
    assert.equal(mseCalls, 2);
    assert.equal(webrtcCalls, 1);
    await delay(70);
    assert.deepEqual(adoptedTypes, ["mse", "webrtc"]);
  } finally {
    globalThis.document = previousDocument;
  }
});
