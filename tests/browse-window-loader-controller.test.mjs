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
        entry[2] === "alerts-window",
    ),
    true,
  );
});

test("loadWindow renders alerts before the event request finishes", async () => {
  const calls = [];
  let releaseEvents;
  const eventsPending = new Promise((resolve) => {
    releaseEvents = resolve;
  });
  const activeCache = {
    clientId: "frigate",
    cam: "front",
    events: [],
    reviews: [],
  };
  const host = {
    _tab: "alerts",
    _loading: false,
    _reloadPending: false,
    _reloadAfterLoad: false,
    _exhausted: false,
    _followNowWindow: false,
    _config: { window_days: 1, alerts_reviews_days: 1 },
    _activeCam: { entity: "camera.front" },
    _camCache: { "camera.front": activeCache },
    _events: [],
    _reviews: [],
    _recordings: [],
    _winStart: 100,
    _winEnd: 200,
    _eventsMode: "camera",
    _cc: () => activeCache,
    _ws: async (payload) => {
      calls.push(payload.type);
      if (payload.type === "frigate/events/get") return eventsPending;
      return [{ id: "review-1", start_time: 180, severity: "alert" }];
    },
    _renderList: () => calls.push("renderList"),
    _renderStats: () => {},
    _renderAll: () => {},
    _scheduleReload: () => {},
    _consumeDeepLinkReviewOpen: () => {},
    _consumeDeepLinkEventOpen: () => {},
    _isPreviewPageActive: () => false,
    _slideshowAlertController: { handleReviewsUpdated: () => {} },
  };
  const controller = new BrowseWindowLoaderController(host);

  const load = controller.loadWindow(true);
  await new Promise((resolve) => setImmediate(resolve));

  assert.deepEqual(calls.slice(0, 2), [
    "frigate/reviews/get",
    "frigate/events/get",
  ]);
  assert.deepEqual(host._reviews, [
    { id: "review-1", start_time: 180, severity: "alert" },
  ]);
  assert.equal(calls.includes("renderList"), true);
  assert.equal(host._loading, true);

  releaseEvents([]);
  await load;
  assert.equal(host._loading, false);
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

test("warmOtherCamerasEvents also fills the active camera cache on Preview", async () => {
  const activeCache = {
    clientId: "frigate",
    cam: "front",
    events: [],
  };
  const host = {
    _warmCamsToken: 0,
    _activeCam: { entity: "camera.front" },
    _winStart: 100,
    _winEnd: 200,
    _config: {
      cameras: [{ entity: "camera.front" }],
    },
    _camCache: {
      "camera.front": activeCache,
    },
    _isPreviewPageActive: () => true,
    _ws: async () => [{ id: "event-1", start_time: 150 }],
  };
  const controller = new BrowseWindowLoaderController(host, {
    fetchWindowedItems: async ({ fetchBatch }) =>
      fetchBatch({ after: 100, before: 200, limit: 25, page: 0 }),
  });

  await controller.warmOtherCamerasEvents();

  assert.deepEqual(activeCache.events, [{ id: "event-1", start_time: 150 }]);
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

test("loadWindowRecordings paints progressive cold-load results as they arrive", async () => {
  const bounds = { start: 100, end: 400 };
  const newest = [{ id: "newest", start_time: 350, end_time: 390 }];
  const complete = [
    { id: "oldest", start_time: 150, end_time: 190 },
    ...newest,
  ];
  const renders = [];
  const host = {
    _winEnd: 400,
    _config: { refresh_seconds: 45 },
    _activeCam: { entity: "camera.front" },
    _camCache: { "camera.front": {} },
    _recordings: [],
    _recordingsDayDataCache: new Map(),
    _recordingsDayAvailabilityCache: new Map(),
    _recordingsDayFetchedAtCache: new Map(),
    _recordingsDayBounds: () => bounds,
    _cc: () => ({ clientId: "frigate", cam: "front" }),
    _recordingsBrowseNavController: {
      async fetchRecordingsInBoundsProgressively(
        receivedBounds,
        clientId,
        camera,
        { before, onProgress },
      ) {
        assert.deepEqual(receivedBounds, bounds);
        assert.equal(clientId, "frigate");
        assert.equal(camera, "front");
        assert.equal(before, 400);
        onProgress(newest, { complete: false });
        await new Promise((resolve) => setImmediate(resolve));
        onProgress(complete, { complete: true });
        return complete;
      },
    },
    _renderList: () => renders.push(host._recordings),
  };
  const controller = new BrowseWindowLoaderController(host);

  const load = controller.loadWindowRecordings("frigate", "front", 400);

  assert.deepEqual(host._recordings, newest);
  assert.deepEqual(renders, [newest]);

  assert.deepEqual(await load, complete);
  assert.deepEqual(host._recordings, complete);
  assert.deepEqual(renders, [newest, complete]);
  assert.deepEqual(host._camCache["camera.front"].recordings, complete);
});

test("loadWindowRecordings paints stale current-day cache before refreshing it", async () => {
  const bounds = { start: 100, end: 199 };
  const key = "frigate|front|100|199";
  const cached = [{ id: "cached", start_time: 110, end_time: 120 }];
  const refreshed = [{ id: "fresh", start_time: 130, end_time: 140 }];
  let releaseRequest;
  let requestCount = 0;
  const pendingRequest = new Promise((resolve) => {
    releaseRequest = resolve;
  });
  const renders = [];
  const host = {
    _winEnd: 150,
    _config: { refresh_seconds: 15 },
    _activeCam: { entity: "camera.front" },
    _camCache: { "camera.front": {} },
    _recordings: [],
    _recordingsDayDataCache: new Map([[key, cached]]),
    _recordingsDayAvailabilityCache: new Map([[key, true]]),
    _recordingsDayFetchedAtCache: new Map([[key, Date.now() - 60_000]]),
    _recordingsDayRequestCache: new Map(),
    _recordingsDayBounds: () => bounds,
    _cc: () => ({ clientId: "frigate", cam: "front" }),
    _ws: async () => {
      requestCount += 1;
      return await pendingRequest;
    },
    _renderList: () => renders.push(host._recordings),
  };
  const controller = new BrowseWindowLoaderController(host);

  const load = controller.loadWindowRecordings("frigate", "front", 150);

  assert.deepEqual(host._recordings, cached);
  assert.equal(requestCount, 1);
  assert.deepEqual(renders, [cached]);

  releaseRequest(refreshed);
  await load;

  assert.deepEqual(host._recordings, refreshed);
  assert.deepEqual(host._recordingsDayDataCache.get(key), refreshed);
  assert.deepEqual(renders, [cached, refreshed]);
});

test("loadWindowRecordings reuses a fresh current-day cache without fetching", async () => {
  const bounds = { start: 100, end: 199 };
  const key = "frigate|front|100|199";
  const cached = [{ id: "cached", start_time: 110, end_time: 120 }];
  let requestCount = 0;
  const host = {
    _winEnd: 150,
    _config: { refresh_seconds: 45 },
    _activeCam: { entity: "camera.front" },
    _camCache: { "camera.front": {} },
    _recordings: [],
    _recordingsDayDataCache: new Map([[key, cached]]),
    _recordingsDayAvailabilityCache: new Map([[key, true]]),
    _recordingsDayFetchedAtCache: new Map([[key, Date.now()]]),
    _recordingsDayBounds: () => bounds,
    _cc: () => ({ clientId: "frigate", cam: "front" }),
    _ws: async () => {
      requestCount += 1;
      return [];
    },
    _renderList: () => {},
  };
  const controller = new BrowseWindowLoaderController(host);

  const recordings = await controller.loadWindowRecordings(
    "frigate",
    "front",
    150,
  );

  assert.deepEqual(recordings, cached);
  assert.deepEqual(host._recordings, cached);
  assert.equal(requestCount, 0);
});

test("fetchRecentActiveDayEvents returns last N days with events", async () => {
  const host = {
    _dayKey: (ts) => String(Math.floor(ts / 86400)),
    _ws: async () => [],
  };
  const controller = new BrowseWindowLoaderController(host, {
    fetchWindowedItems: async ({ fetchBatch }) =>
      fetchBatch({ after: 0, before: 999999, limit: 250, page: 0 }),
  });

  const day = 86400;
  const before = 6 * day;
  controller.fetchWindowedEvents = async () => [
    { id: "d5-a", start_time: 5 * day + 50 },
    { id: "d5-b", start_time: 5 * day + 20 },
    { id: "d4-a", start_time: 4 * day + 30 },
    { id: "d1-a", start_time: 1 * day + 70 },
    { id: "d1-b", start_time: 1 * day + 40 },
    { id: "d1-c", start_time: 1 * day + 10 },
  ];

  const resolved = await controller.fetchRecentActiveDayEvents(
    "frigate",
    "front",
    before,
    3,
  );

  assert.deepEqual(
    resolved.items.map((item) => item.id),
    ["d5-a", "d5-b", "d4-a", "d1-a", "d1-b", "d1-c"],
  );
});

test("fetchRecentActiveDayReviews keeps best active-day set across expanding probes", async () => {
  const host = {
    _dayKey: (ts) => String(Math.floor(ts / 86400)),
    _ws: async () => [],
  };
  const controller = new BrowseWindowLoaderController(host, {
    fetchWindowedItems: async ({ fetchBatch }) =>
      fetchBatch({ after: 0, before: 999999, limit: 250, page: 0 }),
  });

  const day = 86400;
  const before = 100 * day;
  controller.fetchWindowedReviews = async (_clientId, _cam, after) => {
    if (after >= 96 * day) {
      return [
        { id: "d99-a", start_time: 99 * day + 100 },
        { id: "d97-a", start_time: 97 * day + 100 },
      ];
    }
    if (after >= 92 * day) {
      return [
        { id: "d99-a", start_time: 99 * day + 100 },
        { id: "d97-a", start_time: 97 * day + 100 },
        { id: "d94-a", start_time: 94 * day + 100 },
      ];
    }
    return [
      { id: "d99-a", start_time: 99 * day + 100 },
      { id: "d97-a", start_time: 97 * day + 100 },
    ];
  };

  const resolved = await controller.fetchRecentActiveDayReviews(
    "frigate",
    "front",
    before,
    4,
  );

  assert.deepEqual(
    resolved.items.map((item) => item.id),
    ["d99-a", "d97-a", "d94-a"],
  );
});

test("fetchRecentActiveDayReviews supports alert-only active-day selection", async () => {
  const host = {
    _dayKey: (ts) => String(Math.floor(ts / 86400)),
    _ws: async () => [],
  };
  const controller = new BrowseWindowLoaderController(host, {
    fetchWindowedItems: async ({ fetchBatch }) =>
      fetchBatch({ after: 0, before: 999999, limit: 250, page: 0 }),
  });

  const day = 86400;
  const before = 10 * day;
  controller.fetchWindowedReviews = async () => [
    { id: "d9-detect", start_time: 9 * day + 100, severity: "detection" },
    { id: "d8-detect", start_time: 8 * day + 100, severity: "detection" },
    { id: "d7-alert", start_time: 7 * day + 100, severity: "alert" },
    { id: "d6-alert", start_time: 6 * day + 100, severity: "alert" },
  ];

  const resolved = await controller.fetchRecentActiveDayReviews(
    "frigate",
    "front",
    before,
    2,
    {
      itemFilter: (review) =>
        String(review?.severity || "").toLowerCase() === "alert",
    },
  );

  assert.deepEqual(
    resolved.items.map((item) => item.id),
    ["d7-alert", "d6-alert"],
  );
});
