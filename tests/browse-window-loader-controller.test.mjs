import { test } from "node:test";
import assert from "node:assert/strict";

import { BrowseWindowLoaderController } from "../src/features/browse/window-loader.ctrl.js";

test("loadWindow updates active slices and finishes the browse load cycle", async () => {
  const calls = [];
  let eventFetchCount = 0;
  let reviewFetchCount = 0;
  const activeCache = { clientId: "frigate", cam: "front", events: [] };
  const host = {
    _tab: "alerts",
    _loading: false,
    _reloadPending: true,
    _reloadAfterLoad: false,
    _exhausted: true,
    _followNowWindow: false,
    _config: { window_days: 1, alerts_reviews_days: 3 },
    _activeCam: { entity: "camera.front" },
    _camCache: { "camera.front": activeCache },
    _events: [],
    _reviews: [],
    _recordings: [],
    _eventsLoadToken: 0,
    _reviewsLoadToken: 0,
    _winStart: 100,
    _winEnd: 200,
    _eventsMode: "camera",
    _cc: () => activeCache,
    _ws: async () => [],
    _renderList: () => calls.push("renderList"),
    _renderStats: () => calls.push("renderStats"),
    _renderAll: () => calls.push("renderAll"),
    _scheduleReload: () => calls.push("scheduleReload"),
    _consumeDeepLinkReviewOpen: () => calls.push("consumeReview"),
    _consumeDeepLinkEventOpen: () => calls.push("consumeEvent"),
    _loadAllCamsBackground: () => calls.push("loadAllCamsBackground"),
    _isPreviewPageActive: () => false,
    _slideshowAlertController: {
      handleReviewsUpdated: (_entity, reviews, source) =>
        calls.push(["reviewsUpdated", reviews.length, source]),
    },
  };
  const controller = new BrowseWindowLoaderController(host, {
    fetchWindowedItems: async ({ fetchBatch }) =>
      fetchBatch({
        after: 100,
        before: 200,
        limit: 25,
        page: 0,
      }),
  });

  host._ws = async (payload) => {
    if (payload.type === "frigate/events/get") {
      eventFetchCount += 1;
      return eventFetchCount === 1 ? [{ id: "event-1", start_time: 150 }] : [];
    }
    if (payload.type === "frigate/reviews/get") {
      reviewFetchCount += 1;
      return reviewFetchCount === 1
        ? [{ id: "review-1", start_time: 170, severity: "alert" }]
        : [];
    }
    return [];
  };

  await controller.loadWindow(true);

  assert.equal(host._loading, false);
  assert.equal(host._reloadPending, false);
  assert.equal(host._reloadAfterLoad, false);
  assert.equal(host._exhausted, false);
  assert.deepEqual(host._events, [{ id: "event-1", start_time: 150 }]);
  assert.deepEqual(host._reviews, [
    { id: "review-1", start_time: 170, severity: "alert" },
  ]);
  assert.deepEqual(activeCache.events, host._events);
  assert.deepEqual(activeCache.reviews, host._reviews);
  assert.equal(calls.includes("renderAll"), true);
  assert.equal(calls.includes("consumeReview"), true);
  assert.equal(calls.includes("consumeEvent"), true);
  assert.equal(
    calls.some(
      (entry) =>
        Array.isArray(entry) &&
        entry[0] === "reviewsUpdated" &&
        entry[2] === "alerts-window-initial",
    ),
    true,
  );
});

test("warmOtherCamerasEvents fills inactive camera cache through fetchWindowedEvents", async () => {
  const inactiveCache = {
    clientId: "frigate",
    cam: "backyard",
    events: [],
  };
  const host = {
    _warmCamsToken: 0,
    _activeCam: { entity: "camera.front" },
    _winStart: 100,
    _winEnd: 200,
    _config: {
      cameras: [{ entity: "camera.front" }, { entity: "camera.backyard" }],
    },
    _camCache: {
      "camera.front": { clientId: "frigate", cam: "front", events: [] },
      "camera.backyard": inactiveCache,
    },
    _ws: async () => [{ id: "event-2", start_time: 120 }],
  };
  const controller = new BrowseWindowLoaderController(host, {
    fetchWindowedItems: async ({ fetchBatch }) =>
      fetchBatch({ after: 100, before: 200, limit: 25, page: 0 }),
  });

  await controller.warmOtherCamerasEvents();

  assert.deepEqual(inactiveCache.events, [{ id: "event-2", start_time: 120 }]);
});

test("loadOlder appends unique events, updates the window start, and marks exhaustion", async () => {
  const calls = [];
  const host = {
    _events: [
      { id: "event-2", start_time: 180 },
      { id: "event-1", start_time: 150 },
    ],
    _winStart: 140,
    _loading: false,
    _exhausted: false,
    _cc: () => ({ clientId: "frigate", cam: "front" }),
    _ws: async ({ before }) => {
      if (before === 150) {
        return [
          { id: "event-1", start_time: 150 },
          { id: "event-0", start_time: 120 },
        ];
      }
      return [];
    },
    _renderList: () => calls.push("renderList"),
    _renderSubtitle: () => calls.push("renderSubtitle"),
  };
  const controller = new BrowseWindowLoaderController(host);

  await controller.loadOlder();

  assert.equal(host._loading, false);
  assert.equal(host._exhausted, false);
  assert.deepEqual(host._events, [
    { id: "event-2", start_time: 180 },
    { id: "event-1", start_time: 150 },
    { id: "event-0", start_time: 120 },
  ]);
  assert.equal(host._winStart, 120);
  assert.deepEqual(calls, ["renderList", "renderSubtitle"]);

  calls.length = 0;
  await controller.loadOlder();

  assert.equal(host._exhausted, true);
  assert.deepEqual(calls, ["renderList", "renderSubtitle"]);
});

test("loadWindowRecordings resolves day bounds without card-owned recordings wrappers", async () => {
  const calls = [];
  const activeCache = {};
  const host = {
    _winEnd: 200,
    _activeCam: { entity: "camera.front" },
    _camCache: { "camera.front": activeCache },
    _recordings: [],
    _recordingsDayDataCache: new Map(),
    _recordingsDayAvailabilityCache: new Map(),
    _tzParts: (target) =>
      target === 150
        ? { year: 2026, month: 8, day: 5 }
        : { year: 2026, month: 8, day: 6 },
    _tzDateTimeToEpochSeconds: (year, month, day, hour, minute, second) => {
      if (year === 2026 && month === 8 && day === 5 && hour === 0) return 100;
      if (year === 2026 && month === 8 && day === 5 && hour === 23) {
        return 199;
      }
      return second + minute + hour;
    },
    _ws: async (payload) => {
      calls.push(payload);
      return [{ id: "recording-1", start_time: 120, end_time: 180 }];
    },
    _renderList: () => calls.push("renderList"),
  };
  const controller = new BrowseWindowLoaderController(host);

  await controller.loadWindowRecordings("frigate", "front", 150);

  assert.deepEqual(calls, [
    {
      type: "frigate/recordings/get",
      instance_id: "frigate",
      camera: "front",
      after: 100,
      before: 199,
    },
    "renderList",
  ]);
  assert.deepEqual(host._recordings, [
    { id: "recording-1", start_time: 120, end_time: 180 },
  ]);
  assert.deepEqual(activeCache.recordings, host._recordings);
  assert.deepEqual(
    host._recordingsDayDataCache.get("frigate|front|100|199"),
    host._recordings,
  );
  assert.equal(
    host._recordingsDayAvailabilityCache.get("frigate|front|100|199"),
    true,
  );
});
