import { test } from "node:test";
import assert from "node:assert/strict";

import { BrowseTabDataController } from "../src/features/browse/tab-data.ctrl.js";

test("loadTabData loads alert data, grid-mixed data, and always renders list", async () => {
  const calls = [];
  const host = {
    _winEnd: 200,
    _config: { alerts_reviews_days: 3 },
    _activeCam: { entity: "camera.front" },
    _camCache: { "camera.front": {} },
    _reviews: [],
    _cc: () => ({ clientId: "frigate", cam: "front" }),
    _fetchWindowedReviews: async () => [
      { id: "review-1", start_time: 180, severity: "alert" },
    ],
    _cacheActiveCamSlice: (key, value) =>
      calls.push(["cache", key, value.length]),
    _slideshowAlertController: {
      handleReviewsUpdated: (_entity, reviews, source) =>
        calls.push(["reviewsUpdated", reviews.length, source]),
    },
    _isGridMixedListMode: () => true,
    _loadGridMixedTabData: async (tab) => calls.push(["gridMixed", tab]),
    _renderList: () => calls.push(["renderList"]),
    _ws: async () => [],
    _loadWindowRecordings: async () => calls.push(["recordings"]),
  };
  const controller = new BrowseTabDataController(host);

  await controller.loadTabData("alerts");

  assert.deepEqual(host._reviews, [
    { id: "review-1", start_time: 180, severity: "alert" },
  ]);
  assert.equal(
    calls.some((entry) => entry[0] === "gridMixed" && entry[1] === "alerts"),
    true,
  );
  assert.equal(
    calls.some(
      (entry) => entry[0] === "reviewsUpdated" && entry[2] === "alerts-tab",
    ),
    true,
  );
  assert.equal(
    calls.some((entry) => entry[0] === "renderList"),
    true,
  );
});

test("loadTabData reuses reviews cached for the current alert window", async () => {
  const calls = [];
  const cachedReviews = [{ id: "cached-review", start_time: 180 }];
  const host = {
    _winEnd: 200,
    _config: { alerts_reviews_days: 3 },
    _activeCam: { entity: "camera.front" },
    _camCache: { "camera.front": { reviews: cachedReviews } },
    _reviews: [],
    _cc: () => ({ clientId: "frigate", cam: "front" }),
    _browseWindowLoaderController: {
      hasCachedWindowReviews: () => true,
      fetchRecentActiveDayReviews: async () => {
        calls.push("fetchReviews");
        return { items: [] };
      },
    },
    _slideshowAlertController: { handleReviewsUpdated: () => {} },
    _isGridMixedListMode: () => false,
    _loadGridMixedTabData: async () => {},
    _renderList: () => calls.push("renderList"),
  };
  const controller = new BrowseTabDataController(host);

  await controller.loadTabData("alerts");

  assert.equal(host._reviews, cachedReviews);
  assert.deepEqual(calls, ["renderList"]);
});

test("A/B alert tab reuses the coordinated group window without a primary-only fetch", async () => {
  const calls = [];
  const mixedReviews = [
    { id: "old-b", camera: "driveway", start_time: 190 },
    { id: "old-a", camera: "porch", start_time: 180 },
  ];
  const host = {
    _winStart: 100,
    _winEnd: 200,
    _config: { alerts_reviews_days: 1 },
    _activeCam: {
      entity: "camera.porch",
      alerts_content: "alerts_only",
      group: {
        secondary_entity: "camera.driveway",
        layout: "stacked",
      },
    },
    _camCache: { "camera.porch": {}, "camera.driveway": {} },
    _reviews: mixedReviews,
    _cc: () => ({ clientId: "frigate", cam: "porch" }),
    _browseWindowLoaderController: {
      hasCachedWindowReviews: () => false,
      fetchRecentActiveDayReviews: async () => {
        calls.push(["fetch"]);
        return {
          items: [
            {
              id: "new-a",
              camera: "porch",
              start_time: 195,
              severity: "alert",
            },
          ],
        };
      },
      cacheWindowReviews: (_clientId, _cam, _before, reviews) =>
        calls.push(["cache", reviews.map((review) => review.id)]),
      publishActiveGroupCombined: (key, options) => {
        calls.push(["publish", key, options]);
        return false;
      },
    },
    _slideshowAlertController: { handleReviewsUpdated: () => {} },
  };
  const controller = new BrowseTabDataController(host);

  await controller.loadReviews();

  assert.strictEqual(host._reviews, mixedReviews);
  assert.deepEqual(calls, [
    ["publish", "reviews", { render: false }],
  ]);
});

test("loadReviews uses the exact selected calendar day instead of active-day expansion", async () => {
  const calls = [];
  const context = { clientId: "frigate", cam: "front" };
  const host = {
    _calSelectedDay: "2026-08-05",
    _winStart: 100,
    _winEnd: 200,
    _config: { alerts_reviews_days: 5 },
    _activeCam: {
      entity: "camera.front",
      alerts_content: "alerts_only",
    },
    _camCache: { "camera.front": {} },
    _reviews: [],
    _cc: () => context,
    _browseWindowLoaderController: {
      hasCachedWindowReviews: () => false,
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
        calls.push(["recent"]);
        return { items: [] };
      },
      cacheWindowReviews: (_clientId, _cam, _before, reviews) =>
        calls.push(["cache", reviews.length]),
    },
    _slideshowAlertController: {
      handleReviewsUpdated: (_entity, reviews, source) =>
        calls.push(["updated", reviews.length, source]),
    },
  };
  const controller = new BrowseTabDataController(host);

  await controller.loadReviews();

  assert.deepEqual(host._reviews.map((review) => review.id), ["alert-1"]);
  assert.deepEqual(calls, [
    ["exact", "frigate", "front", 100, 200, "alert"],
    ["cache", 1],
    ["updated", 1, "alerts-tab"],
  ]);
});

test("loadKept and recordings tab update kept cache and recording loader through host", async () => {
  const calls = [];
  const host = {
    _winEnd: 200,
    _config: { alerts_reviews_days: 3 },
    _activeCam: { entity: "camera.front" },
    _camCache: { "camera.front": {} },
    _kept: [],
    _cc: () => ({ clientId: "frigate", cam: "front" }),
    _ws: async (payload) => {
      calls.push(["ws", payload.type, payload.favorites === true]);
      return [{ id: "kept-1", retain_indefinitely: true }];
    },
    _renderList: () => calls.push(["renderList"]),
    _isGridMixedListMode: () => false,
    _loadGridMixedTabData: async () => calls.push(["gridMixed"]),
    _loadWindowRecordings: async (clientId, cam, before) =>
      calls.push(["recordings", clientId, cam, before]),
    _fetchWindowedReviews: async () => [],
    _cacheActiveCamSlice: () => {},
    _slideshowAlertController: { handleReviewsUpdated: () => {} },
  };
  const controller = new BrowseTabDataController(host);

  await controller.loadKept();
  await controller.loadTabData("recordings");

  assert.deepEqual(host._kept, [{ id: "kept-1", retain_indefinitely: true }]);
  assert.deepEqual(host._camCache["camera.front"].kept, host._kept);
  assert.equal(
    calls.some(
      (entry) =>
        entry[0] === "recordings" &&
        entry[1] === "frigate" &&
        entry[2] === "front" &&
        entry[3] === 200,
    ),
    true,
  );
});

test("loadKept combines and sorts favorites from all configured cameras by default", async () => {
  const mixedKept = [
    { id: "older", camera: "front", start_time: 100 },
    { id: "newer", camera: "back", start_time: 200 },
  ];
  const calls = [];
  const host = {
    _config: {
      cameras: [
        { entity: "camera.front" },
        { entity: "camera.back" },
      ],
    },
    _activeCam: { entity: "camera.front" },
    _camCache: { "camera.front": {}, "camera.back": {} },
    _kept: [],
    _cc: () => ({ clientId: "frigate", cam: "front" }),
    _browseCollectionController: {
      loadGridMixedTabData: async (tab) => calls.push(tab),
      allGridKeptEvents: () => mixedKept,
    },
  };
  const controller = new BrowseTabDataController(host);

  await controller.loadKept();

  assert.deepEqual(calls, ["kept"]);
  assert.deepEqual(
    host._kept.map((event) => event.id),
    ["newer", "older"],
  );
});
