import { test } from "node:test";
import assert from "node:assert/strict";

import {
  BrowseFavoriteMutationController,
  buildFavoriteOptimisticMutation,
  buildFavoriteRollbackMutation,
} from "../src/features/browse/favorite-mutation.ctrl.js";

test("buildFavoriteOptimisticMutation retains matching events and prepends kept entry", () => {
  const target = { id: "event-1", retain_indefinitely: false, label: "front" };
  const state = buildFavoriteOptimisticMutation({
    id: "event-1",
    event: target,
    events: [target, { id: "event-2", retain_indefinitely: false }],
    camCache: {
      "camera.front": {
        events: [target],
        reviewEvents: [target],
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
    state.camCache["camera.front"].reviewEvents[0].retain_indefinitely,
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

const createControllerHarness = ({ reject = false } = {}) => {
  const calls = [];
  const event = {
    id: "event-1",
    camera: "front",
    start_time: 100,
    retain_indefinitely: false,
  };
  const context = { cam: "front", clientId: "frigate-client" };
  const host = {
    _activeCam: { entity: "camera.front" },
    _allGridKeptEvents: () => host._camCache["camera.front"].kept,
    _camCache: {
      "camera.front": {
        ...context,
        events: [event],
        kept: [],
      },
    },
    _cc: () => context,
    _config: {
      cameras: [{ entity: "camera.front" }],
      favorites_mixed_cameras: true,
    },
    _events: [event],
    _findEventById: (id) => (id === event.id ? event : null),
    _frigateContextForCameraName: () => context,
    _hass: {
      callWS: async (message) => {
        calls.push(["call-ws", message]);
        if (reject) throw new Error("retain failed");
        return true;
      },
    },
    _kept: [],
    _renderList: () => calls.push(["render-list"]),
    _toast: (...args) => calls.push(["toast", ...args]),
  };
  const controller = new BrowseFavoriteMutationController(host, {
    warn: (...args) => calls.push(["warn", ...args]),
  });
  return { calls, controller, event, host };
};

test("Browse favorite mutation controller applies and confirms optimistic retention", async () => {
  const { calls, controller, host } = createControllerHarness();

  assert.equal(
    await controller.toggle("event-1", { toastPlacement: "popup" }),
    true,
  );
  assert.equal(host._events[0].retain_indefinitely, true);
  assert.equal(host._kept[0].id, "event-1");
  assert.deepEqual(calls, [
    ["render-list"],
    [
      "call-ws",
      {
        type: "frigate/event/retain",
        instance_id: "frigate-client",
        event_id: "event-1",
        retain: true,
      },
    ],
    [
      "toast",
      "Added to Favorites",
      {
        tone: "success",
        placement: "popup",
        localizationKey: "runtime.notifications.favoritesAdded",
      },
    ],
  ]);
});

test("Browse favorite mutation controller rolls back a failed retention", async () => {
  const { calls, controller, event, host } = createControllerHarness({
    reject: true,
  });

  assert.equal(await controller.toggle("event-1"), false);
  assert.equal(host._events[0].retain_indefinitely, false);
  assert.deepEqual(host._kept, []);
  assert.equal(calls.filter(([type]) => type === "render-list").length, 2);
  assert.deepEqual(calls.at(-2), [
    "warn",
    "[Frigate] retain failed",
    calls.at(-2)[2],
  ]);
  assert.equal(calls.at(-2)[2].message, "retain failed");
  assert.deepEqual(calls.at(-1), [
    "toast",
    "Could not add to Favorites",
    {
      tone: "error",
      placement: "browse",
      localizationKey: "runtime.notifications.favoritesAddFailed",
    },
  ]);
  assert.equal(event.retain_indefinitely, false);
});

test("Browse favorite mutation controller ignores unknown events", () => {
  const { calls, controller } = createControllerHarness();
  assert.equal(controller.toggle("missing"), false);
  assert.deepEqual(calls, []);
});
