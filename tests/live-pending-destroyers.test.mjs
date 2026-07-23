import { test } from "node:test";
import assert from "node:assert/strict";

import {
  createPendingMountDestroyers,
  filterPendingDestroyersForWinner,
  shouldClearPendingDestroyersForPromise,
  splitPendingDestroyersByGraceMse,
} from "../src/live/live-pending-destroyers.js";

test("createPendingMountDestroyers maps attempts with entity and destroy handler", async () => {
  const activeAttempts = [
    { type: "webrtc", promise: Promise.resolve({ ok: true }) },
    { type: "mse", promise: Promise.resolve({ ok: false }) },
  ];
  const pending = createPendingMountDestroyers({
    activeAttempts,
    targetEntity: "camera.front",
  });

  assert.equal(pending.length, 2);
  assert.equal(pending[0].type, "webrtc");
  assert.equal(pending[1].entity, "camera.front");
  assert.equal(typeof pending[0].destroy, "function");
  await pending[0].promise;
});

test("filterPendingDestroyersForWinner removes winner type only", () => {
  const filtered = filterPendingDestroyersForWinner({
    winnerType: "mse",
    pendingDestroyers: [{ type: "webrtc" }, { type: "mse" }, { type: "hls" }],
  });

  assert.deepEqual(
    filtered.map((item) => item.type),
    ["webrtc", "hls"],
  );
});

test("splitPendingDestroyersByGraceMse separates preservable MSE attempt", () => {
  const input = [
    { type: "webrtc", entity: "camera.front" },
    { type: "mse", entity: "camera.front" },
    { type: "mse", entity: "camera.side" },
  ];

  const split = splitPendingDestroyersByGraceMse({
    pendingDestroyers: input,
    preserveMseEntity: "camera.front",
  });

  assert.equal(split.toPreserve.length, 1);
  assert.equal(split.toPreserve[0].type, "mse");
  assert.equal(split.toDestroy.length, 2);
});

test("shouldClearPendingDestroyersForPromise checks identity match", () => {
  const a = Promise.resolve(true);
  const b = Promise.resolve(true);
  const pending = [{ promise: a }, { promise: b }];

  assert.equal(
    shouldClearPendingDestroyersForPromise({
      pendingDestroyers: pending,
      promise: a,
    }),
    true,
  );
  assert.equal(
    shouldClearPendingDestroyersForPromise({
      pendingDestroyers: pending,
      promise: Promise.resolve(true),
    }),
    false,
  );
});
