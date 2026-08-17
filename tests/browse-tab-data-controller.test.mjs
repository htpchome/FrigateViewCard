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
