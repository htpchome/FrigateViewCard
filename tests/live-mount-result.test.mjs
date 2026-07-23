import { test } from "node:test";
import assert from "node:assert/strict";

import {
  adoptMountedAttemptSlot,
  cleanupStaleWinnerResult,
  destroyLoserAttemptResults,
  isMountTokenCurrent,
} from "../src/live/live-mount-result.js";

test("isMountTokenCurrent matches tokens", () => {
  assert.equal(isMountTokenCurrent({ mountToken: 2, mountSeq: 2 }), true);
  assert.equal(isMountTokenCurrent({ mountToken: 2, mountSeq: 3 }), false);
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
