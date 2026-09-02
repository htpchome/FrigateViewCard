import { test } from "node:test";
import assert from "node:assert/strict";

import {
  adoptMountedAttemptResult,
  adoptMountedAttemptSlot,
  cleanupStaleWinnerResult,
  destroyLoserAttemptResults,
  isMountTokenCurrent,
  resolveGraceMseMountResult,
} from "../src/features/live/mount-result.js";

test("isMountTokenCurrent matches tokens", () => {
  assert.equal(isMountTokenCurrent({ mountToken: 2, mountSeq: 2 }), true);
  assert.equal(isMountTokenCurrent({ mountToken: 2, mountSeq: 3 }), false);
});

test("resolveGraceMseMountResult normalizes missing and valid grace engines", () => {
  const engine = { destroy() {} };
  assert.equal(resolveGraceMseMountResult({ engine: null }), false);
  assert.deepEqual(resolveGraceMseMountResult({ engine }), {
    ok: true,
    type: "mse",
    engine,
  });
});

test("cleanupStaleWinnerResult destroys and removes winner", () => {
  let destroyed = false;
  let removed = false;
  cleanupStaleWinnerResult({
    engine: { destroy: () => (destroyed = true) },
    slot: { remove: () => (removed = true) },
  });

  assert.equal(destroyed, true);
  assert.equal(removed, true);
});

test("adoptMountedAttemptSlot keeps winner slot and styles it", () => {
  let removedA = false;
  let removedB = false;
  const winner = { style: {} };
  const target = {
    children: [
      { remove: () => (removedA = true) },
      winner,
      { remove: () => (removedB = true) },
    ],
  };

  adoptMountedAttemptSlot({ targetSlot: target, resultSlot: winner });

  assert.equal(removedA, true);
  assert.equal(removedB, true);
  assert.equal(winner.style.opacity, "1");
  assert.equal(winner.style.pointerEvents, "auto");
  assert.equal(winner.style.overflow, "hidden");
});

test("adoptMountedAttemptSlot preserves a deferred attempt and restores a detached winner", () => {
  const deferred = { style: {} };
  const fallback = { style: {} };
  const target = {
    children: [deferred, fallback],
    appendChild(child) {
      if (!this.children.includes(child)) this.children.push(child);
      child.parentNode = this;
    },
  };
  deferred.parentNode = target;
  fallback.parentNode = target;

  adoptMountedAttemptSlot({
    targetSlot: target,
    resultSlot: fallback,
    preservePendingSlots: true,
  });

  assert.deepEqual(target.children, [deferred, fallback]);

  target.children = [fallback];
  deferred.parentNode = null;
  adoptMountedAttemptSlot({ targetSlot: target, resultSlot: deferred });

  assert.equal(deferred.parentNode, target);
  assert.equal(target.children.includes(deferred), true);
  assert.equal(deferred.style.opacity, "1");
});

test("adoptMountedAttemptResult commits engine and stream ui state", () => {
  const winner = { style: {} };
  let recoveryActivated = false;
  const engine = {
    id: "engine-1",
    activateRecovery: () => {
      recoveryActivated = true;
    },
  };
  const target = {
    children: [winner],
  };
  const calls = [];

  const adopted = adoptMountedAttemptResult({
    targetSlot: target,
    result: {
      ok: true,
      type: "mse",
      slot: winner,
      engine,
    },
    streamMuted: true,
    rotateOverlayActive: true,
    assignEngine: (value) => calls.push(["assignEngine", value]),
    setEngineMountedMuted: (value) =>
      calls.push(["setEngineMountedMuted", value]),
    setActiveStreamType: (value) => calls.push(["setActiveStreamType", value]),
    setStreamLoading: (value) => calls.push(["setStreamLoading", value]),
    setStreamFallbackVisible: (value) =>
      calls.push(["setStreamFallbackVisible", value]),
    setLiveNativeControls: (value) =>
      calls.push(["setLiveNativeControls", value]),
  });

  assert.equal(adopted, true);
  assert.equal(recoveryActivated, true);
  assert.deepEqual(calls, [
    ["assignEngine", engine],
    ["setEngineMountedMuted", true],
    ["setActiveStreamType", "mse"],
    ["setStreamLoading", false],
    ["setStreamFallbackVisible", false],
    ["setLiveNativeControls", true],
  ]);
  assert.equal(winner.style.opacity, "1");
});

test("destroyLoserAttemptResults destroys only non-winner successful attempts", async () => {
  let webrtcDestroyed = false;
  let hlsDestroyed = false;
  let hlsRemoved = false;

  const activeAttempts = [
    {
      promise: Promise.resolve({
        ok: true,
        type: "webrtc",
        engine: { destroy: () => (webrtcDestroyed = true) },
        slot: { remove: () => {} },
      }),
    },
    {
      promise: Promise.resolve({
        ok: true,
        type: "hls",
        engine: { destroy: () => (hlsDestroyed = true) },
        slot: { remove: () => (hlsRemoved = true) },
      }),
    },
    {
      promise: Promise.resolve({ ok: false, type: "mse" }),
    },
  ];

  await destroyLoserAttemptResults({
    activeAttempts,
    winnerType: "webrtc",
  });

  assert.equal(webrtcDestroyed, false);
  assert.equal(hlsDestroyed, true);
  assert.equal(hlsRemoved, true);
});
