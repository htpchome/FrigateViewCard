import { test } from "node:test";
import assert from "node:assert/strict";

import { BrowseCollectionController } from "../src/features/browse/collection.ctrl.js";

test("findReviewForEvent resolves the matching camera review detection", () => {
  const event = { id: "event-2", camera: "back" };
  const host = {
    _reviews: [
      {
        id: "review-wrong-camera",
        camera: "front",
        data: { detections: [event.id] },
      },
      {
        id: "review-match",
        camera: "back",
        data: { detections: ["event-1", event.id] },
      },
    ],
    _config: { cameras: [] },
    _camCache: {},
  };

  const controller = new BrowseCollectionController(host);

  assert.equal(controller.findReviewForEvent(event)?.id, "review-match");
  assert.equal(controller.findReviewForEvent("missing"), null);
});

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

test("findEventById reuses its index until an event source changes", () => {
  let idReads = 0;
  const first = { label: "person" };
  Object.defineProperty(first, "id", {
    configurable: true,
    enumerable: true,
    get: () => {
      idReads += 1;
      return "event-1";
    },
  });
  const host = {
    _eventsMode: "camera",
    _events: [first],
    _kept: [],
    _config: { cameras: [] },
    _camCache: {},
  };
  const controller = new BrowseCollectionController(host);

  assert.equal(controller.findEventById("event-1"), first);
  const readsAfterFirstLookup = idReads;
  assert.equal(controller.findEventById("event-1"), first);
  assert.equal(idReads, readsAfterFirstLookup);

  const replacement = { id: "event-1", label: "car" };
  host._events = [replacement];
  assert.equal(controller.findEventById("event-1"), replacement);
});

test("findEventById rebuilds its index after an in-place source append", () => {
  const host = {
    _eventsMode: "camera",
    _events: [{ id: "event-1" }],
    _kept: [],
    _config: { cameras: [] },
    _camCache: {},
  };
  const controller = new BrowseCollectionController(host);

  assert.equal(controller.findEventById("event-2"), null);
  const appended = { id: "event-2" };
  host._events.push(appended);
  assert.equal(controller.findEventById("event-2"), appended);
});

test("findEventById preserves active, all-camera, and kept precedence", () => {
  const active = { id: "shared", source: "active" };
  const cached = { id: "shared", source: "camera-cache" };
  const kept = { id: "shared", source: "kept" };
  const host = {
    _eventsMode: "camera",
    _events: [active],
    _kept: [kept],
    _config: { cameras: [{ entity: "camera.front" }] },
    _camCache: {
      "camera.front": { events: [cached] },
    },
  };
  const controller = new BrowseCollectionController(host);

  assert.equal(controller.findEventById("shared"), active);
  host._eventsMode = "all";
  assert.equal(controller.findEventById("shared"), cached);
  host._camCache["camera.front"].events = [];
  assert.equal(controller.findEventById("shared"), kept);
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
      fetchRecentActiveDayReviews: async (
        _clientId,
        cam,
        before,
        dayCount,
        options,
      ) => {
        calls.push([
          "active-days",
          cam,
          before,
          dayCount,
          options.severity,
        ]);
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
        entry[3] === 3 &&
        entry[4] === "alert",
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

test("loadGridMixedTabData alerts uses the exact selected calendar day", async () => {
  const calls = [];
  const host = {
    _calSelectedDay: "2026-08-05",
    _winStart: 100,
    _winEnd: 200,
    _config: {
      alerts_reviews_days: 3,
      cameras: [{ entity: "camera.front" }],
    },
    _camCache: {
      "camera.front": {
        discovered: true,
        clientId: "frigate",
        cam: "front",
        reviews: [],
      },
    },
    _browseWindowLoaderController: {
      fetchWindowedReviews: async (
        clientId,
        cam,
        after,
        before,
        options,
      ) => {
        calls.push([
          "exact",
          clientId,
          cam,
          after,
          before,
          options.severity,
        ]);
        return [
          { id: "alert-1", start_time: 180, severity: "alert" },
          { id: "detection-1", start_time: 170, severity: "detection" },
        ];
      },
      fetchRecentActiveDayReviews: async () => {
        calls.push(["active-days"]);
        return { items: [] };
      },
      cacheCameraWindowReviews: (
        entity,
        _clientId,
        _cam,
        _before,
        reviews,
      ) => {
        host._camCache[entity].reviews = reviews;
      },
    },
    _isCardViewPageActive: () => false,
    _discoverOne: async () => {},
  };
  const controller = new BrowseCollectionController(host);

  await controller.loadGridMixedTabData("alerts");

  assert.deepEqual(calls, [
    ["exact", "frigate", "front", 100, 200, "alert"],
  ]);
  assert.deepEqual(host._camCache["camera.front"].reviews, [
    { id: "alert-1", start_time: 180, severity: "alert" },
  ]);
});

test("allGridReviews keeps same review id across different cameras", () => {
  const host = {
    _config: {
      cameras: [{ entity: "camera.front" }, { entity: "camera.back" }],
    },
    _camCache: {
      "camera.front": {
        cam: "front",
        reviews: [{ id: "same-id", camera: "front" }],
      },
      "camera.back": {
        cam: "back",
        reviews: [{ id: "same-id", camera: "back" }],
      },
    },
  };

  const controller = new BrowseCollectionController(host);

  assert.deepEqual(controller.allGridReviews(), [
    { id: "same-id", camera: "front" },
    { id: "same-id", camera: "back" },
  ]);
});

test("allGridEvents supplies mixed camera content for the Wide Timeline", () => {
  const front = { id: "front-event", camera: "front" };
  const back = { id: "back-event", camera: "back" };
  const host = {
    _config: {
      cameras: [{ entity: "camera.front" }, { entity: "camera.back" }],
    },
    _camCache: {
      "camera.front": { events: [front] },
      "camera.back": { events: [back, front] },
    },
  };

  const controller = new BrowseCollectionController(host);

  assert.deepEqual(controller.allGridEvents(), [front, back]);
});
