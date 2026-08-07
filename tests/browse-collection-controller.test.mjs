import { test } from "node:test";
import assert from "node:assert/strict";

import { BrowseCollectionController } from "../src/features/browse/collection.ctrl.js";

test("allDisplayEvents merges all-camera events uniquely in descending start order", () => {
  const shared = { id: "shared", start_time: 150 };
  const host = {
    _eventsMode: "all",
    _events: [{ id: "local", start_time: 110 }],
    _kept: [],
    _config: {
      cameras: [{ entity: "camera.front" }, { entity: "camera.back" }],
    },
    _camCache: {
      "camera.front": {
        events: [{ id: "front-1", start_time: 120 }, shared],
      },
      "camera.back": {
        events: [shared, { id: "back-1", start_time: 180 }],
      },
    },
  };

  const controller = new BrowseCollectionController(host);

  assert.deepEqual(controller.allDisplayEvents(), [
    { id: "back-1", start_time: 180 },
    { id: "shared", start_time: 150 },
    { id: "front-1", start_time: 120 },
  ]);
});

test("loadGridMixedTabData discovers cameras and fills cross-camera review and kept caches", async () => {
  const calls = [];
  const host = {
    _winEnd: 200,
    _config: {
      alerts_reviews_days: 3,
      cameras: [{ entity: "camera.front" }, { entity: "camera.back" }],
    },
    _camCache: {
      "camera.front": {
        discovered: true,
        clientId: "frigate",
        cam: "front",
        reviews: [],
        kept: [],
      },
      "camera.back": {
        discovered: false,
        clientId: "frigate",
        cam: "back",
        reviews: [],
        kept: [],
      },
    },
    _discoverOne: async (entity) => {
      calls.push(["discover", entity]);
      host._camCache[entity].discovered = true;
    },
    _fetchWindowedReviews: async (_clientId, cam) => {
      calls.push(["reviews", cam]);
      return [{ id: `${cam}-review`, start_time: 170, severity: "alert" }];
    },
    _ws: async (payload) => {
      calls.push(["ws", payload.cameras[0]]);
      return [{ id: `${payload.cameras[0]}-kept`, retain_indefinitely: true }];
    },
    _reviews: [],
  };

  const controller = new BrowseCollectionController(host);

  await controller.loadGridMixedTabData("alerts");
  await controller.loadGridMixedTabData("kept");

  assert.deepEqual(host._camCache["camera.front"].reviews, [
    { id: "front-review", start_time: 170, severity: "alert" },
  ]);
  assert.deepEqual(host._camCache["camera.back"].reviews, [
    { id: "back-review", start_time: 170, severity: "alert" },
  ]);
  assert.deepEqual(host._camCache["camera.front"].kept, [
    { id: "front-kept", retain_indefinitely: true },
  ]);
  assert.deepEqual(host._camCache["camera.back"].kept, [
    { id: "back-kept", retain_indefinitely: true },
  ]);
  assert.equal(
    calls.some(
      (entry) =>
        Array.isArray(entry) &&
        entry[0] === "discover" &&
        entry[1] === "camera.back",
    ),
    true,
  );
});

test("loadGridMixedTabData alerts uses active-day reviews when available", async () => {
  const calls = [];
  const host = {
    _winEnd: 500,
    _config: {
      alerts_reviews_days: 3,
      cameras: [{ entity: "camera.front" }, { entity: "camera.back" }],
    },
    _camCache: {
      "camera.front": {
        discovered: true,
        clientId: "frigate",
        cam: "front",
        reviews: [],
      },
      "camera.back": {
        discovered: true,
        clientId: "frigate",
        cam: "back",
        reviews: [],
      },
    },
    _browseWindowLoaderController: {
      fetchRecentActiveDayReviews: async (_clientId, cam, before, dayCount) => {
        calls.push(["active-days", cam, before, dayCount]);
        return {
          items: [{ id: `${cam}-active`, start_time: 480, severity: "alert" }],
        };
      },
    },
    _fetchWindowedReviews: async () => {
      calls.push(["legacy-fallback"]);
      return [];
    },
    _discoverOne: async () => {},
    _ws: async () => [],
  };

  const controller = new BrowseCollectionController(host);

  await controller.loadGridMixedTabData("alerts");

  assert.deepEqual(host._camCache["camera.front"].reviews, [
    { id: "front-active", start_time: 480, severity: "alert" },
  ]);
  assert.deepEqual(host._camCache["camera.back"].reviews, [
    { id: "back-active", start_time: 480, severity: "alert" },
  ]);
  assert.equal(
    calls.some(
      (entry) =>
        Array.isArray(entry) &&
        entry[0] === "active-days" &&
        entry[1] === "front" &&
        entry[2] === 500 &&
        entry[3] === 3,
    ),
    true,
  );
  assert.equal(
    calls.some(
      (entry) => Array.isArray(entry) && entry[0] === "legacy-fallback",
    ),
    false,
  );
});
