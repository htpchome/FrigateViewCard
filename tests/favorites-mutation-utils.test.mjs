import { test } from "node:test";
import assert from "node:assert/strict";

import {
  buildFavoriteOptimisticMutation,
  buildFavoriteRollbackMutation,
} from "../src/card/favorites-mutation-utils.js";

test("buildFavoriteOptimisticMutation retains matching events and prepends kept entry", () => {
  const target = { id: "event-1", retain_indefinitely: false, label: "front" };
  const state = buildFavoriteOptimisticMutation({
    id: "event-1",
    event: target,
    events: [target, { id: "event-2", retain_indefinitely: false }],
    camCache: {
      "camera.front": {
        events: [target],
        kept: [],
      },
      "camera.back": {
        events: [{ id: "event-1", retain_indefinitely: false }],
        kept: [],
      },
    },
    kept: [],
    activeEntity: "camera.front",
  });

  assert.equal(state.nextRetained, true);
  assert.equal(state.previousRetained, false);
  assert.equal(state.events[0].retain_indefinitely, true);
  assert.equal(
    state.camCache["camera.front"].events[0].retain_indefinitely,
    true,
  );
  assert.equal(
    state.camCache["camera.back"].events[0].retain_indefinitely,
    true,
  );
  assert.deepEqual(state.kept, [
    { id: "event-1", retain_indefinitely: true, label: "front" },
  ]);
  assert.equal(state.camCache["camera.front"].kept, state.kept);
});

test("buildFavoriteRollbackMutation restores prior retained state and kept cache", () => {
  const target = { id: "event-1", retain_indefinitely: false, label: "front" };
  const optimistic = buildFavoriteOptimisticMutation({
    id: "event-1",
    event: target,
    events: [target],
    camCache: {
      "camera.front": {
        events: [target],
        kept: [],
      },
    },
    kept: [],
    activeEntity: "camera.front",
  });

  const rollback = buildFavoriteRollbackMutation({
    id: "event-1",
    event: target,
    previousRetained: optimistic.previousRetained,
    events: optimistic.events,
    camCache: optimistic.camCache,
    kept: optimistic.kept,
    activeEntity: "camera.front",
  });

  assert.equal(rollback.events[0].retain_indefinitely, false);
  assert.deepEqual(rollback.kept, []);
  assert.equal(
    rollback.camCache["camera.front"].events[0].retain_indefinitely,
    false,
  );
  assert.equal(rollback.camCache["camera.front"].kept, rollback.kept);
});

test("buildFavoriteRollbackMutation restores kept entry when unretain fails", () => {
  const target = { id: "event-1", retain_indefinitely: true, label: "front" };
  const optimistic = buildFavoriteOptimisticMutation({
    id: "event-1",
    event: target,
    events: [target],
    camCache: {
      "camera.front": {
        events: [target],
        kept: [target],
      },
    },
    kept: [target],
    activeEntity: "camera.front",
  });

  assert.equal(optimistic.nextRetained, false);
  assert.deepEqual(optimistic.kept, []);

  const rollback = buildFavoriteRollbackMutation({
    id: "event-1",
    event: target,
    previousRetained: optimistic.previousRetained,
    events: optimistic.events,
    camCache: optimistic.camCache,
    kept: optimistic.kept,
    activeEntity: "camera.front",
  });

  assert.equal(rollback.events[0].retain_indefinitely, true);
  assert.deepEqual(rollback.kept, [
    { id: "event-1", retain_indefinitely: true, label: "front" },
  ]);
});
