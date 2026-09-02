import { test } from "node:test";
import assert from "node:assert/strict";

import { BrowseWindowLoaderController } from "../src/features/browse/window-loader.ctrl.js";

test("fetchWindowedReviews applies severity at the data boundary", async () => {
  const requests = [];
  const host = {
    _ws: async (payload) => {
      requests.push(payload);
      return [];
    },
  };
  const controller = new BrowseWindowLoaderController(host);

  await controller.fetchWindowedReviews("frigate", "front", 100, 200, {
    severity: "alert",
  });
  await controller.fetchWindowedReviews("frigate", "front", 100, 200);

  assert.equal(requests[0].severity, "alert");
  assert.equal("severity" in requests[1], false);
});

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

test("camera groups fetch both members concurrently and publish one mixed window", async () => {
  const requestLimits = new Map();
  const reviewRequestSeverities = new Map();
  const primaryCache = {
    clientId: "frigate",
    cam: "doorbell",
    discovered: true,
    events: [],
    reviews: [],
  };
  const secondaryCache = {
    clientId: "frigate",
    cam: "doorbell_package",
    discovered: true,
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
    _calSelectedDay: "2026-08-27",
    _config: {
      window_days: 1,
      alerts_reviews_days: 1,
      cameras: [
        {
          entity: "camera.doorbell",
          group: {
            secondary_entity: "camera.doorbell_package",
            layout: "stacked",
          },
        },
      ],
    },
    _activeCam: {
      entity: "camera.doorbell",
      alerts_content: "alerts_only",
      group: {
        secondary_entity: "camera.doorbell_package",
        layout: "stacked",
      },
    },
    _camCache: {
      "camera.doorbell": primaryCache,
      "camera.doorbell_package": secondaryCache,
    },
    _events: [],
    _reviews: [],
    _recordings: [],
    _eventsLoadToken: 0,
    _reviewsLoadToken: 0,
    _winStart: 100,
    _winEnd: 200,
    _eventsMode: "camera",
    _cc: () => primaryCache,
    _discoverOne: async () => {},
    _ws: async (payload) => {
      const camera = payload.cameras?.[0] || "";
      const key = `${payload.type}:${camera}`;
      if (!requestLimits.has(key)) requestLimits.set(key, payload.limit);
      if (payload.before < 200) return [];
      if (payload.type === "frigate/events/get") {
        return [
          {
            id: `${camera}-event`,
            camera,
            start_time: camera === "doorbell" ? 180 : 190,
          },
        ];
      }
      if (payload.type === "frigate/reviews/get") {
        reviewRequestSeverities.set(camera, payload.severity || "");
        return [
          {
            id: `${camera}-review`,
            camera,
            start_time: camera === "doorbell" ? 181 : 191,
            severity: "alert",
          },
        ];
      }
      return [];
    },
    _renderList: () => {},
    _renderStats: () => {},
    _renderAll: () => {},
    _scheduleReload: () => {},
    _isPreviewPageActive: () => false,
    _slideshowAlertController: { handleReviewsUpdated: () => {} },
  };
  const controller = new BrowseWindowLoaderController(host);

  await controller.loadWindow(true);

  assert.deepEqual(
    host._events.map((event) => [
      event.id,
      event._fvc_camera_entity,
      event._fvc_group_member,
    ]),
    [
      [
        "doorbell_package-event",
        "camera.doorbell_package",
        "B",
      ],
      ["doorbell-event", "camera.doorbell", "A"],
    ],
  );
  assert.deepEqual(
    host._reviews.map((review) => review.id),
    ["doorbell_package-review", "doorbell-review"],
  );
  assert.equal(primaryCache.events.length, 1);
  assert.equal(secondaryCache.events.length, 1);
  assert.equal(requestLimits.get("frigate/events/get:doorbell"), 6);
  assert.equal(
    requestLimits.get("frigate/events/get:doorbell_package"),
    6,
  );
  assert.equal(reviewRequestSeverities.get("doorbell"), "alert");
  assert.equal(reviewRequestSeverities.get("doorbell_package"), "alert");
  assert.equal(controller.cameraAlertsCount("camera.doorbell"), 1);
  assert.equal(
    controller.cameraAlertsCount("camera.doorbell", { includeGroup: true }),
    2,
  );
  assert.equal(controller.cameraAlertsCount("camera.doorbell_package"), 1);
});

test("camera group merge retains each member's bounded active-day cache", () => {
  const primaryEvent = {
    id: "porch-event",
    camera: "porch",
    start_time: Date.UTC(2026, 7, 20, 12) / 1000,
  };
  const secondaryEvent = {
    id: "driveway-event",
    camera: "driveway",
    start_time: Date.UTC(2026, 7, 21, 12) / 1000,
  };
  const primaryReview = {
    id: "porch-review",
    camera: "porch",
    start_time: primaryEvent.start_time,
    severity: "alert",
  };
  const secondaryReview = {
    id: "driveway-review",
    camera: "driveway",
    start_time: secondaryEvent.start_time,
    severity: "alert",
  };
  const host = {
    _config: { window_days: 1, alerts_reviews_days: 1 },
    _activeCam: {
      entity: "camera.porch",
      group: {
        secondary_entity: "camera.driveway",
        layout: "stacked",
      },
    },
    _camCache: {
      "camera.porch": {
        events: [primaryEvent],
        reviews: [primaryReview],
      },
      "camera.driveway": {
        events: [secondaryEvent],
        reviews: [secondaryReview],
      },
    },
    _events: [],
    _reviews: [],
    _renderStats: () => {},
  };
  const controller = new BrowseWindowLoaderController(host);

  controller.publishActiveGroupCombined("events", { render: false });
  controller.publishActiveGroupCombined("reviews", { render: false });

  assert.deepEqual(
    host._events.map((event) => event.id),
    ["driveway-event", "porch-event"],
  );
  assert.deepEqual(
    host._reviews.map((review) => review.id),
    ["driveway-review", "porch-review"],
  );
});

test("A/B realtime polling compares each camera with its own cached head", async () => {
  const remoteHeads = new Map([
    ["porch", "porch-head"],
    ["driveway", "driveway-head"],
  ]);
  const requests = [];
  const host = {
    _config: { window_days: 1 },
    _activeCam: {
      entity: "camera.porch",
      group: {
        secondary_entity: "camera.driveway",
        layout: "stacked",
      },
    },
    _camCache: {
      "camera.porch": {
        clientId: "frigate",
        cam: "porch",
        events: [{ id: "porch-head", start_time: 180 }],
      },
      "camera.driveway": {
        clientId: "frigate",
        cam: "driveway",
        events: [{ id: "driveway-head", start_time: 190 }],
      },
    },
    _ws: async (payload) => {
      requests.push(payload);
      return [{ id: remoteHeads.get(payload.cameras[0]) }];
    },
  };
  const controller = new BrowseWindowLoaderController(host);

  assert.equal(await controller.activeCameraEventHeadsChanged(200), false);
  assert.deepEqual(
    requests.map((request) => request.cameras[0]).sort(),
    ["driveway", "porch"],
  );

  remoteHeads.set("driveway", "new-driveway-head");
  assert.equal(await controller.activeCameraEventHeadsChanged(201), true);
});

test("cold A/B alerts paint one combined six-item batch before the full mixed list", async () => {
  const deferred = () => {
    let resolve;
    const promise = new Promise((next) => {
      resolve = next;
    });
    return { promise, resolve };
  };
  const primaryEvents = deferred();
  const secondaryEvents = deferred();
  const primaryReviews = deferred();
  const secondaryReviews = deferred();
  let resolveFullReviewPaint;
  const fullReviewPaint = new Promise((resolve) => {
    resolveFullReviewPaint = resolve;
  });
  const reviewsFor = (cam, offset) =>
    Array.from({ length: 8 }, (_, index) => ({
      id: `${cam}-review-${index}`,
      camera: cam,
      start_time: 200 - index * 2 - offset,
      severity: "alert",
    }));
  const primaryCache = {
    clientId: "frigate",
    cam: "porch",
    discovered: true,
    events: [],
    reviews: [],
  };
  const secondaryCache = {
    clientId: "frigate",
    cam: "driveway",
    discovered: true,
    events: [],
    reviews: [],
  };
  const listPaints = [];
  const host = {
    _tab: "alerts",
    _loading: false,
    _reloadPending: false,
    _reloadAfterLoad: false,
    _exhausted: false,
    _followNowWindow: false,
    _config: { window_days: 1, alerts_reviews_days: 1 },
    _activeCam: {
      entity: "camera.porch",
      alerts_content: "alerts_only",
      group: {
        secondary_entity: "camera.driveway",
        layout: "stacked",
      },
    },
    _camCache: {
      "camera.porch": primaryCache,
      "camera.driveway": secondaryCache,
    },
    _events: [],
    _reviews: [],
    _recordings: [],
    _eventsLoadToken: 0,
    _reviewsLoadToken: 0,
    _winStart: 100,
    _winEnd: 200,
    _eventsMode: "camera",
    _cc: () => primaryCache,
    _discoverOne: async () => {},
    _renderList: () => {
      listPaints.push(host._reviews.map((review) => review.id));
      if (host._reviews.length === 16) resolveFullReviewPaint();
    },
    _renderStats: () => {},
    _renderAll: () => {},
    _scheduleReload: () => {},
    _isPreviewPageActive: () => false,
    _slideshowAlertController: { handleReviewsUpdated: () => {} },
  };
  const controller = new BrowseWindowLoaderController(host);
  controller.fetchRecentActiveDayEvents = async (
    _clientId,
    cam,
    _before,
    _dayCount,
    { onProgress },
  ) => {
    assert.equal(onProgress, null);
    await (cam === "porch"
      ? primaryEvents.promise
      : secondaryEvents.promise);
    return {
      items: [{ id: `${cam}-event`, camera: cam, start_time: 150 }],
    };
  };
  controller.fetchRecentActiveDayReviews = async (
    _clientId,
    cam,
    _before,
    _dayCount,
    { onProgress },
  ) => {
    assert.equal(typeof onProgress, "function");
    const reviews = reviewsFor(cam, cam === "porch" ? 0 : 1);
    onProgress(reviews.slice(0, 6));
    await (cam === "porch"
      ? primaryReviews.promise
      : secondaryReviews.promise);
    return { items: reviews };
  };

  const load = controller.loadWindow(true);
  await new Promise((resolve) => setImmediate(resolve));

  assert.equal(host._reviews.length, 6);
  assert.deepEqual(
    [...new Set(host._reviews.map((review) => review.camera))].sort(),
    ["driveway", "porch"],
  );
  assert.deepEqual(listPaints.map((paint) => paint.length), [6]);
  assert.deepEqual(host._events, []);
  assert.equal(host._loading, true);

  primaryReviews.resolve();
  secondaryReviews.resolve();
  await fullReviewPaint;

  assert.equal(host._reviews.length, 16);
  assert.deepEqual(listPaints.map((paint) => paint.length), [6, 16]);
  assert.deepEqual(host._events, []);
  assert.equal(host._loading, true);

  primaryEvents.resolve();
  secondaryEvents.resolve();
  await load;

  assert.equal(host._events.length, 2);
  assert.deepEqual(listPaints.map((paint) => paint.length), [6, 16]);
  assert.equal(host._loading, false);
});

test("cold camera group load keeps the prior host unchanged until both members finish", async () => {
  let releasePrimaryComplete;
  let releaseSecondaryComplete;
  const primaryCompletePending = new Promise((resolve) => {
    releasePrimaryComplete = resolve;
  });
  const secondaryCompletePending = new Promise((resolve) => {
    releaseSecondaryComplete = resolve;
  });
  const primaryCache = {
    clientId: "frigate",
    cam: "porch",
    discovered: true,
    events: [{ id: "old-a-event", start_time: 120 }],
    reviews: [{ id: "old-a-review", start_time: 121, severity: "alert" }],
  };
  const secondaryCache = {
    clientId: "frigate",
    cam: "driveway",
    discovered: true,
    events: [{ id: "old-b-event", start_time: 130 }],
    reviews: [{ id: "old-b-review", start_time: 131, severity: "alert" }],
  };
  const renders = [];
  const host = {
    _tab: "alerts",
    _loading: false,
    _reloadPending: false,
    _reloadAfterLoad: false,
    _exhausted: false,
    _followNowWindow: false,
    _config: {
      window_days: 1,
      alerts_reviews_days: 1,
      cameras: [
        {
          entity: "camera.porch",
          alerts_content: "alerts_only",
          group: {
            secondary_entity: "camera.driveway",
            layout: "stacked",
          },
        },
      ],
    },
    _activeCam: {
      entity: "camera.porch",
      alerts_content: "alerts_only",
      group: {
        secondary_entity: "camera.driveway",
        layout: "stacked",
      },
    },
    _camCache: {
      "camera.porch": primaryCache,
      "camera.driveway": secondaryCache,
    },
    _events: [
      { id: "old-b-event", start_time: 130 },
      { id: "old-a-event", start_time: 120 },
    ],
    _reviews: [
      { id: "old-b-review", start_time: 131, severity: "alert" },
      { id: "old-a-review", start_time: 121, severity: "alert" },
    ],
    _recordings: [],
    _eventsLoadToken: 0,
    _reviewsLoadToken: 0,
    _winStart: 100,
    _winEnd: 200,
    _eventsMode: "camera",
    _cc: () => primaryCache,
    _discoverOne: async () => {},
    _renderList: () => renders.push("list"),
    _renderStats: () => renders.push("stats"),
    _renderAll: () => renders.push("all"),
    _scheduleReload: () => {},
    _isPreviewPageActive: () => false,
    _slideshowAlertController: { handleReviewsUpdated: () => {} },
  };
  const controller = new BrowseWindowLoaderController(host);
  controller.fetchRecentActiveDayEvents = async (
    _clientId,
    cam,
    _before,
    _dayCount,
    { onProgress },
  ) => {
    assert.equal(onProgress, null);
    await (cam === "porch"
      ? primaryCompletePending
      : secondaryCompletePending);
    return {
      items: [
        {
          id: `new-${cam}-event`,
          camera: cam,
          start_time: cam === "driveway" ? 190 : 180,
        },
      ],
    };
  };
  controller.fetchRecentActiveDayReviews = async (
    _clientId,
    cam,
    _before,
    _dayCount,
    { onProgress },
  ) => {
    assert.equal(typeof onProgress, "function");
    await (cam === "porch"
      ? primaryCompletePending
      : secondaryCompletePending);
    return {
      items: [
        {
          id: `new-${cam}-review`,
          camera: cam,
          start_time: cam === "driveway" ? 191 : 181,
          severity: "alert",
        },
      ],
    };
  };

  const load = controller.loadWindow(true);
  await new Promise((resolve) => setImmediate(resolve));

  assert.deepEqual(
    host._events.map((event) => event.id),
    ["old-b-event", "old-a-event"],
  );
  assert.deepEqual(
    host._reviews.map((review) => review.id),
    ["old-b-review", "old-a-review"],
  );
  assert.equal(renders.filter((entry) => entry === "list").length, 0);
  assert.equal(host._loading, true);

  releasePrimaryComplete();
  await new Promise((resolve) => setImmediate(resolve));

  assert.deepEqual(
    host._events.map((event) => event.id),
    ["old-b-event", "old-a-event"],
  );
  assert.deepEqual(
    host._reviews.map((review) => review.id),
    ["old-b-review", "old-a-review"],
  );
  assert.equal(renders.filter((entry) => entry === "list").length, 0);

  releaseSecondaryComplete();
  await load;

  assert.deepEqual(
    host._events.map((event) => event.id),
    ["new-driveway-event", "new-porch-event"],
  );
  assert.deepEqual(
    host._reviews.map((review) => review.id),
    ["new-driveway-review", "new-porch-review"],
  );
  assert.equal(renders.filter((entry) => entry === "list").length, 1);
  assert.equal(renders.filter((entry) => entry === "all").length, 1);
});

test("camera group refresh retains its coherent mixed snapshot until both members finish", async () => {
  let releasePrimaryComplete;
  let releaseSecondaryComplete;
  const primaryCompletePending = new Promise((resolve) => {
    releasePrimaryComplete = resolve;
  });
  const secondaryCompletePending = new Promise((resolve) => {
    releaseSecondaryComplete = resolve;
  });
  const primaryCache = {
    clientId: "frigate",
    cam: "porch",
    discovered: true,
    events: [{ id: "old-a-event", start_time: 120 }],
    reviews: [{ id: "old-a-review", start_time: 121, severity: "alert" }],
  };
  const secondaryCache = {
    clientId: "frigate",
    cam: "driveway",
    discovered: true,
    events: [{ id: "old-b-event", start_time: 130 }],
    reviews: [{ id: "old-b-review", start_time: 131, severity: "alert" }],
  };
  const renders = [];
  const host = {
    _tab: "alerts",
    _loading: false,
    _reloadPending: false,
    _reloadAfterLoad: false,
    _exhausted: false,
    _followNowWindow: false,
    _config: {
      window_days: 1,
      alerts_reviews_days: 1,
      cameras: [
        {
          entity: "camera.porch",
          alerts_content: "alerts_only",
          group: {
            secondary_entity: "camera.driveway",
            layout: "stacked",
          },
        },
      ],
    },
    _activeCam: {
      entity: "camera.porch",
      alerts_content: "alerts_only",
      group: {
        secondary_entity: "camera.driveway",
        layout: "stacked",
      },
    },
    _camCache: {
      "camera.porch": primaryCache,
      "camera.driveway": secondaryCache,
    },
    _events: [
      { id: "old-b-event", start_time: 130 },
      { id: "old-a-event", start_time: 120 },
    ],
    _reviews: [
      { id: "old-b-review", start_time: 131, severity: "alert" },
      { id: "old-a-review", start_time: 121, severity: "alert" },
    ],
    _recordings: [],
    _eventsLoadToken: 0,
    _reviewsLoadToken: 0,
    _winStart: 100,
    _winEnd: 200,
    _eventsMode: "camera",
    _cc: () => primaryCache,
    _discoverOne: async () => {},
    _renderList: () => renders.push("list"),
    _renderStats: () => renders.push("stats"),
    _renderAll: () => renders.push("all"),
    _scheduleReload: () => {},
    _isPreviewPageActive: () => false,
    _slideshowAlertController: { handleReviewsUpdated: () => {} },
  };
  const controller = new BrowseWindowLoaderController(host);
  primaryCache.eventsWindowContextKey = controller.eventWindowContextKey(
    "frigate",
    "porch",
  );
  secondaryCache.eventsWindowContextKey = controller.eventWindowContextKey(
    "frigate",
    "driveway",
  );
  primaryCache.reviewsWindowContextKey =
    controller.reviewWindowContextKeyForContent(
      "frigate",
      "porch",
      "alerts_only",
    );
  secondaryCache.reviewsWindowContextKey =
    controller.reviewWindowContextKeyForContent(
      "frigate",
      "driveway",
      "alerts_only",
    );
  const waitForCamera = async (cam) => {
    await (cam === "porch"
      ? primaryCompletePending
      : secondaryCompletePending);
  };
  controller.fetchRecentActiveDayEvents = async (
    _clientId,
    cam,
    _before,
    _dayCount,
    { onProgress },
  ) => {
    assert.equal(onProgress, null);
    await waitForCamera(cam);
    return {
      items: [
        {
          id: `new-${cam}-event`,
          camera: cam,
          start_time: cam === "driveway" ? 190 : 180,
        },
      ],
    };
  };
  controller.fetchRecentActiveDayReviews = async (
    _clientId,
    cam,
    _before,
    _dayCount,
    { onProgress },
  ) => {
    assert.equal(typeof onProgress, "function");
    await waitForCamera(cam);
    return {
      items: [
        {
          id: `new-${cam}-review`,
          camera: cam,
          start_time: cam === "driveway" ? 191 : 181,
          severity: "alert",
        },
      ],
    };
  };

  const load = controller.loadWindow(true);
  await new Promise((resolve) => setImmediate(resolve));

  assert.deepEqual(
    host._events.map((event) => event.id),
    ["old-b-event", "old-a-event"],
  );
  assert.deepEqual(
    host._reviews.map((review) => review.id),
    ["old-b-review", "old-a-review"],
  );
  assert.equal(renders.filter((entry) => entry === "list").length, 0);

  releasePrimaryComplete();
  await new Promise((resolve) => setImmediate(resolve));

  assert.deepEqual(
    host._events.map((event) => event.id),
    ["old-b-event", "old-a-event"],
  );
  assert.deepEqual(
    host._reviews.map((review) => review.id),
    ["old-b-review", "old-a-review"],
  );
  assert.equal(renders.filter((entry) => entry === "list").length, 0);

  releaseSecondaryComplete();
  await load;

  assert.deepEqual(
    host._events.map((event) => event.id),
    ["new-driveway-event", "new-porch-event"],
  );
  assert.deepEqual(
    host._reviews.map((review) => review.id),
    ["new-driveway-review", "new-porch-review"],
  );
  assert.equal(renders.filter((entry) => entry === "list").length, 1);
  assert.equal(renders.filter((entry) => entry === "all").length, 1);
});

test("identical in-flight browse requests are coalesced", async () => {
  let requestCount = 0;
  let releaseRequest;
  const requestPending = new Promise((resolve) => {
    releaseRequest = resolve;
  });
  const host = {
    _ws: async () => {
      requestCount += 1;
      return await requestPending;
    },
  };
  const controller = new BrowseWindowLoaderController(host);

  const first = controller.fetchWindowedEvents(
    "frigate",
    "front",
    100,
    200,
    { pageLimit: 1, limit: 6 },
  );
  const second = controller.fetchWindowedEvents(
    "frigate",
    "front",
    100,
    200,
    { pageLimit: 1, limit: 6 },
  );
  await new Promise((resolve) => setImmediate(resolve));

  assert.equal(requestCount, 1);
  releaseRequest([]);
  assert.deepEqual(await first, []);
  assert.deepEqual(await second, []);
});

test("camera switches reuse recently completed event and review windows", async () => {
  let requestCount = 0;
  const cachedEvents = [{ id: "event-1", start_time: 190 }];
  const cachedReviews = [
    { id: "review-1", start_time: 191, severity: "alert" },
  ];
  const activeCache = {
    clientId: "frigate",
    cam: "front",
    events: cachedEvents,
    reviews: cachedReviews,
  };
  const host = {
    _tab: "clips",
    _followNowWindow: true,
    _config: {
      window_days: 1,
      alerts_reviews_days: 3,
      refresh_seconds: 45,
    },
    _activeCam: {
      entity: "camera.front",
      alerts_content: "alerts_only",
    },
    _camCache: { "camera.front": activeCache },
    _events: cachedEvents,
    _reviews: cachedReviews,
    _eventsLoadToken: 0,
    _reviewsLoadToken: 0,
    _winEnd: 200,
    _cc: () => activeCache,
    _ws: async () => {
      requestCount += 1;
      return [];
    },
    _renderList: () => {},
    _renderStats: () => {},
    _slideshowAlertController: { handleReviewsUpdated: () => {} },
  };
  const controller = new BrowseWindowLoaderController(host);
  controller.cacheWindowEvents("frigate", "front", 200, cachedEvents);
  controller.cacheWindowReviews("frigate", "front", 200, cachedReviews);

  host._winEnd = 205;
  await controller.loadWindowEvents("frigate", "front", 100, 205, {
    reuseRecentCache: true,
  });
  await controller.loadWindowReviewsIfNeeded(
    "frigate",
    "front",
    100,
    205,
    { reuseRecentCache: true },
  );

  assert.equal(requestCount, 0);
  assert.equal(activeCache.eventsWindowKey, "frigate|front|200|1");
  assert.equal(
    activeCache.reviewsWindowKey,
    "frigate|front|200|3|alerts_only",
  );
});

test("loadWindowEvents paints six newest clips before loading the full window", async () => {
  const firstEvents = Array.from({ length: 6 }, (_, index) => ({
    id: `event-${index}`,
    start_time: 195 - index,
  }));
  const remainingEvents = Array.from({ length: 6 }, (_, index) => ({
    id: `event-${index + 6}`,
    start_time: 189 - index,
  }));
  const requestLimits = [];
  const requestBeforeValues = [];
  const renderedLengths = [];
  const statsLengths = [];
  let releaseRemaining;
  const remainingPending = new Promise((resolve) => {
    releaseRemaining = resolve;
  });
  const activeCache = {
    clientId: "frigate",
    cam: "front",
    events: [],
  };
  const host = {
    _config: { window_days: 1 },
    _activeCam: { entity: "camera.front" },
    _camCache: { "camera.front": activeCache },
    _events: [],
    _eventsLoadToken: 0,
    _winEnd: 200,
    _cc: () => activeCache,
    _ws: async ({ before, limit }) => {
      requestLimits.push(limit);
      requestBeforeValues.push(before);
      if (requestLimits.length === 1) return firstEvents;
      return await remainingPending;
    },
    _renderList: () => renderedLengths.push(host._events.length),
    _renderStats: () => statsLengths.push(host._events.length),
  };
  const controller = new BrowseWindowLoaderController(host);

  const load = controller.loadWindowEvents("frigate", "front", 100, 200);
  await new Promise((resolve) => setImmediate(resolve));

  assert.deepEqual(requestLimits, [6, 100]);
  assert.deepEqual(requestBeforeValues, [200, 200]);
  assert.equal(host._events.length, 6);
  assert.deepEqual(renderedLengths, [6]);
  assert.deepEqual(statsLengths, [6]);

  releaseRemaining([...firstEvents, ...remainingEvents]);
  await load;

  assert.equal(host._events.length, 12);
  assert.deepEqual(renderedLengths, [6, 12]);
  assert.deepEqual(statsLengths, [6, 12]);
  assert.equal(activeCache.events.length, 12);
});

test("alerts-only cold load requests and paints six alerts before the full window", async () => {
  const firstAlerts = Array.from({ length: 6 }, (_, index) => ({
    id: `review-${index}`,
    start_time: 195 - index,
    severity: "alert",
  }));
  const fullAlerts = Array.from({ length: 12 }, (_, index) => ({
    id: `review-${index}`,
    start_time: 195 - index,
    severity: "alert",
  }));
  const requests = [];
  const renderedLengths = [];
  let releaseFullWindow;
  const fullWindowPending = new Promise((resolve) => {
    releaseFullWindow = resolve;
  });
  const activeCache = {
    clientId: "frigate",
    cam: "front",
    reviews: [],
    reviewsWindowKey: "",
  };
  const host = {
    _config: { alerts_reviews_days: 1 },
    _activeCam: {
      entity: "camera.front",
      alerts_content: "alerts_only",
    },
    _camCache: { "camera.front": activeCache },
    _reviews: [],
    _reviewsLoadToken: 0,
    _winEnd: 200,
    _cc: () => activeCache,
    _ws: async (payload) => {
      requests.push(payload);
      if (requests.length === 1) return firstAlerts;
      return await fullWindowPending;
    },
    _renderList: () => renderedLengths.push(host._reviews.length),
    _slideshowAlertController: { handleReviewsUpdated: () => {} },
  };
  const controller = new BrowseWindowLoaderController(host);

  const load = controller.loadWindowReviewsIfNeeded(
    "frigate",
    "front",
    100,
    200,
  );
  await new Promise((resolve) => setImmediate(resolve));

  assert.deepEqual(
    requests.map(({ limit, severity }) => [limit, severity]),
    [
      [6, "alert"],
      [100, "alert"],
    ],
  );
  assert.equal(host._reviews.length, 6);
  assert.deepEqual(renderedLengths, [6]);

  releaseFullWindow(fullAlerts);
  await load;

  assert.equal(host._reviews.length, 12);
  assert.equal(activeCache.reviews.length, 12);
  assert.deepEqual(renderedLengths, [6, 12]);
});

test("a selected calendar day fetches and keeps only its exact event window", async () => {
  const calls = [];
  const activeCache = {
    clientId: "frigate",
    cam: "front",
    events: [],
  };
  const host = {
    _calSelectedDay: "2026-08-05",
    _config: { window_days: 4 },
    _activeCam: { entity: "camera.front" },
    _camCache: { "camera.front": activeCache },
    _events: [],
    _eventsLoadToken: 0,
    _exhausted: false,
    _winStart: 100,
    _winEnd: 200,
    _cc: () => activeCache,
    _renderList: () => calls.push(["render", host._events.length]),
    _renderStats: () => {},
  };
  const controller = new BrowseWindowLoaderController(host);
  controller.fetchRecentActiveDayEvents = async () => {
    throw new Error("selected days must not use the multi-day loader");
  };
  controller.fetchWindowedEvents = async (
    clientId,
    cam,
    after,
    before,
    options,
  ) => {
    calls.push(["fetch", clientId, cam, after, before]);
    options.onPage(
      [{ id: "event-1", start_time: 190 }],
      { done: false },
    );
    return [
      { id: "event-1", start_time: 190 },
      { id: "event-2", start_time: 150 },
    ];
  };

  await controller.loadWindowEvents("frigate", "front", 100, 200);

  assert.deepEqual(calls[0], ["fetch", "frigate", "front", 100, 200]);
  assert.deepEqual(host._events.map((event) => event.id), [
    "event-1",
    "event-2",
  ]);
  assert.equal(host._winStart, 100);
  assert.equal(host._exhausted, true);
  assert.equal(
    activeCache.eventsWindowKey,
    "frigate|front|200|day:2026-08-05",
  );
});

test("loadWindowEvents never replaces a complete cache with a partial refresh", async () => {
  const cachedEvents = Array.from({ length: 12 }, (_, index) => ({
    id: `event-${index}`,
    start_time: 200 - index,
  }));
  const refreshedEvents = [
    { id: "event-new", start_time: 201 },
    ...cachedEvents,
  ];
  const renderedIds = [];
  const activeCache = {
    clientId: "frigate",
    cam: "front",
    events: cachedEvents,
  };
  const host = {
    _config: { window_days: 1 },
    _activeCam: { entity: "camera.front" },
    _camCache: { "camera.front": activeCache },
    _events: cachedEvents,
    _eventsLoadToken: 0,
    _winEnd: 210,
    _cc: () => activeCache,
    _renderList: () => renderedIds.push(host._events.map((event) => event.id)),
    _renderStats: () => {},
  };
  const controller = new BrowseWindowLoaderController(host);
  controller.fetchRecentActiveDayEvents = async (
    _clientId,
    _cam,
    _before,
    _dayCount,
    options,
  ) => {
    options.onProgress(refreshedEvents.slice(0, 6));
    return { items: refreshedEvents, after: 100 };
  };

  await controller.loadWindowEvents("frigate", "front", 100, 210);

  assert.deepEqual(renderedIds, [refreshedEvents.map((event) => event.id)]);
  assert.equal(
    renderedIds.some((ids) => ids.length < cachedEvents.length),
    false,
  );
});

test("loadWindowEvents keeps a complete cache when its refresh fails", async () => {
  const cachedEvents = [{ id: "event-1", start_time: 190, has_clip: true }];
  const activeCache = {
    clientId: "frigate",
    cam: "front",
    events: cachedEvents,
  };
  const host = {
    _config: { window_days: 1 },
    _activeCam: { entity: "camera.front" },
    _camCache: { "camera.front": activeCache },
    _events: cachedEvents,
    _eventsLoadToken: 0,
    _winEnd: 200,
    _cc: () => activeCache,
    _renderList: () => {},
    _renderStats: () => {},
  };
  const controller = new BrowseWindowLoaderController(host);
  controller.fetchRecentActiveDayEvents = async () => {
    throw new Error("temporary fetch failure");
  };
  const originalConsoleError = console.error;
  console.error = () => {};
  try {
    await controller.loadWindowEvents("frigate", "front", 100, 200);
  } finally {
    console.error = originalConsoleError;
  }

  assert.strictEqual(host._events, cachedEvents);
  assert.strictEqual(activeCache.events, cachedEvents);
});

test("event refresh redraws media actions when IDs stay unchanged", () => {
  const renders = [];
  const activeCache = {
    clientId: "frigate",
    cam: "front",
    events: [{ id: "event-1", start_time: 190, has_clip: false }],
  };
  const host = {
    _activeCam: { entity: "camera.front" },
    _camCache: { "camera.front": activeCache },
    _events: activeCache.events,
    _winEnd: 200,
    _cc: () => activeCache,
    _renderList: () => renders.push(host._events[0]?.has_clip),
    _renderStats: () => {},
  };
  const controller = new BrowseWindowLoaderController(host);

  controller._publishWindowEvents("frigate", "front", 200, [
    { id: "event-1", start_time: 190, has_clip: true },
  ]);

  assert.deepEqual(renders, [true]);
  assert.equal(activeCache.events[0].has_clip, true);
});

test("a superseding camera load is not blocked by an in-flight load", async () => {
  const calls = [];
  const releases = new Map();
  let activeEntity = "camera.front";
  const caches = {
    "camera.front": {
      clientId: "frigate",
      cam: "front",
      events: [],
      recordings: [],
    },
    "camera.rear": {
      clientId: "frigate",
      cam: "rear",
      events: [],
      recordings: [],
    },
  };
  const host = {
    _tab: "alerts",
    _loading: false,
    _windowLoadToken: 0,
    _reloadPending: false,
    _reloadAfterLoad: false,
    _exhausted: false,
    _followNowWindow: false,
    _config: { window_days: 1 },
    _events: [],
    _recordings: [],
    _camCache: caches,
    _eventsMode: "camera",
    _winStart: 100,
    _winEnd: 200,
    get _activeCam() {
      return { entity: activeEntity };
    },
    _cc: () => caches[activeEntity],
    _isPreviewPageActive: () => false,
    _renderAll: () => calls.push(["renderAll", activeEntity]),
  };
  const controller = new BrowseWindowLoaderController(host);
  controller.loadWindowReviewsIfNeeded = async () => {};
  controller.loadWindowEvents = async (_clientId, cam) => {
    calls.push(["loadEvents", cam]);
    await new Promise((resolve) => releases.set(cam, resolve));
  };

  const frontLoad = controller.loadWindow(true);
  activeEntity = "camera.rear";
  const rearLoad = controller.loadWindow(true, { supersede: true });

  assert.deepEqual(calls.slice(0, 2), [
    ["loadEvents", "front"],
    ["loadEvents", "rear"],
  ]);

  releases.get("rear")();
  await rearLoad;
  assert.equal(host._loading, false);
  assert.deepEqual(calls.filter(([name]) => name === "renderAll"), [
    ["renderAll", "camera.rear"],
  ]);

  releases.get("front")();
  await frontLoad;
  assert.deepEqual(calls.filter(([name]) => name === "renderAll"), [
    ["renderAll", "camera.rear"],
  ]);
});

test("a superseded event load stops paging the previous camera", async () => {
  let requestCount = 0;
  let releaseFirstRequest;
  const firstRequest = new Promise((resolve) => {
    releaseFirstRequest = resolve;
  });
  const activeCache = {
    clientId: "frigate",
    cam: "front",
    events: [],
  };
  const host = {
    _config: { window_days: 1 },
    _activeCam: { entity: "camera.front" },
    _camCache: { "camera.front": activeCache },
    _events: [],
    _eventsLoadToken: 0,
    _winEnd: 200,
    _cc: () => activeCache,
    _ws: async () => {
      requestCount += 1;
      if (requestCount === 1) return await firstRequest;
      return [];
    },
    _renderList: () => {},
    _renderStats: () => {},
  };
  const controller = new BrowseWindowLoaderController(host);

  const staleLoad = controller.loadWindowEvents(
    "frigate",
    "front",
    100,
    200,
  );
  await new Promise((resolve) => setImmediate(resolve));
  host._eventsLoadToken += 1;
  releaseFirstRequest(
    Array.from({ length: 6 }, (_, index) => ({
      id: `event-${index}`,
      start_time: 190 - index,
    })),
  );
  await staleLoad;

  assert.equal(requestCount, 1);
  assert.deepEqual(host._events, []);
});

test("loadWindowReviews retains cached alerts until the filtered window completes", async () => {
  const firstReviews = Array.from({ length: 6 }, (_, index) => ({
    id: `review-${index}`,
    start_time: 195 - index,
    severity: index === 5 ? "detection" : "alert",
  }));
  const remainingReviews = Array.from({ length: 6 }, (_, index) => ({
    id: `review-${index + 6}`,
    start_time: 189 - index,
    severity: "alert",
  }));
  const requestLimits = [];
  const requestBeforeValues = [];
  const renderedLengths = [];
  const reviewUpdates = [];
  let releaseReviews;
  const reviewsPending = new Promise((resolve) => {
    releaseReviews = resolve;
  });
  const cachedReviews = [
    { id: "cached-review", start_time: 150, severity: "alert" },
  ];
  const activeCache = {
    clientId: "frigate",
    cam: "front",
    reviews: cachedReviews,
    reviewsWindowKey: "",
  };
  const host = {
    _tab: "alerts",
    _config: { alerts_reviews_days: 1 },
    _activeCam: { entity: "camera.front", alerts_content: "alerts_only" },
    _camCache: { "camera.front": activeCache },
    _reviews: cachedReviews,
    _reviewsLoadToken: 0,
    _winEnd: 200,
    _cc: () => activeCache,
    _ws: async ({ before, limit }) => {
      requestLimits.push(limit);
      requestBeforeValues.push(before);
      return await reviewsPending;
    },
    _renderList: () => renderedLengths.push(host._reviews.length),
    _slideshowAlertController: {
      handleReviewsUpdated: (_entity, reviews) =>
        reviewUpdates.push(reviews.length),
    },
  };
  const controller = new BrowseWindowLoaderController(host);

  const load = controller.loadWindowReviewsIfNeeded(
    "frigate",
    "front",
    100,
    200,
  );
  await new Promise((resolve) => setImmediate(resolve));

  assert.deepEqual(requestLimits, [100]);
  assert.deepEqual(requestBeforeValues, [200]);
  assert.equal(host._reviews, cachedReviews);
  assert.equal(activeCache.reviews, cachedReviews);
  assert.equal(activeCache.reviewsWindowKey, "");
  assert.deepEqual(renderedLengths, []);
  assert.deepEqual(reviewUpdates, []);

  releaseReviews([...firstReviews, ...remainingReviews]);
  await load;

  assert.equal(host._reviews.length, 11);
  assert.equal(activeCache.reviews.length, 11);
  assert.equal(activeCache.reviewsWindowKey.includes("frigate|front|200"), true);
  assert.deepEqual(renderedLengths, [11]);
  assert.deepEqual(reviewUpdates, [11]);
});

test("a selected calendar day fetches exact-day reviews and applies alert filtering", async () => {
  const calls = [];
  const activeCache = {
    clientId: "frigate",
    cam: "front",
    reviews: [],
  };
  const host = {
    _tab: "alerts",
    _calSelectedDay: "2026-08-05",
    _config: { alerts_reviews_days: 5 },
    _activeCam: {
      entity: "camera.front",
      alerts_content: "alerts_only",
    },
    _camCache: { "camera.front": activeCache },
    _reviews: [],
    _reviewsLoadToken: 0,
    _winEnd: 200,
    _cc: () => activeCache,
    _renderList: () => {},
    _renderStats: () => {},
    _slideshowAlertController: { handleReviewsUpdated: () => {} },
  };
  const controller = new BrowseWindowLoaderController(host);
  controller.fetchRecentActiveDayReviews = async () => {
    throw new Error("selected days must not use the multi-day loader");
  };
  controller.fetchWindowedReviews = async (
    clientId,
    cam,
    after,
    before,
    options,
  ) => {
    calls.push([
      clientId,
      cam,
      after,
      before,
      options.debugLabel,
      options.severity,
    ]);
    return [
      { id: "alert-1", start_time: 190, severity: "alert" },
      { id: "detection-1", start_time: 180, severity: "detection" },
    ];
  };

  await controller.loadWindowReviewsIfNeeded(
    "frigate",
    "front",
    100,
    200,
  );

  assert.deepEqual(calls, [
    ["frigate", "front", 100, 200, "alerts-selected-day", "alert"],
  ]);
  assert.deepEqual(host._reviews.map((review) => review.id), ["alert-1"]);
  assert.equal(
    activeCache.reviewsWindowKey,
    "frigate|front|200|day:2026-08-05|alerts_only",
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

test("warmVisibleCameraReviews counts configured active review days per camera policy", async () => {
  const day = 86400;
  const before = 10 * day;
  const sourceReviews = {
    front: [
      {
        id: "front-d9-detection",
        start_time: 9 * day + 200,
        severity: "detection",
      },
      {
        id: "front-d8-alert",
        start_time: 8 * day + 200,
        severity: "alert",
      },
      {
        id: "front-d6-alert",
        start_time: 6 * day + 200,
        severity: "alert",
      },
    ],
    driveway: [
      {
        id: "driveway-d9-detection-a",
        start_time: 9 * day + 300,
        severity: "detection",
      },
      {
        id: "driveway-d9-detection-b",
        start_time: 9 * day + 200,
        severity: "detection",
      },
      {
        id: "driveway-d8-alert",
        start_time: 8 * day + 100,
        severity: "alert",
      },
      {
        id: "driveway-d6-alert",
        start_time: 6 * day + 100,
        severity: "alert",
      },
    ],
  };
  const host = {
    _warmReviewsToken: 0,
    _followNowWindow: true,
    _winEnd: before,
    _config: {
      alerts_reviews_days: 2,
      cameras: [
        { entity: "camera.front", alerts_content: "alerts_only" },
        { entity: "camera.driveway", alerts_content: "all_reviews" },
      ],
    },
    _camCache: {
      "camera.front": { clientId: "frigate", cam: "front", reviews: [] },
      "camera.driveway": {
        clientId: "frigate",
        cam: "driveway",
        reviews: [],
      },
    },
    _activeCam: { entity: "camera.front" },
    _isPreviewPageActive: () => true,
    _dayKey: (ts) => String(Math.floor(ts / day)),
    _renderStats: () => {},
  };
  const controller = new BrowseWindowLoaderController(host);
  const requestSeverities = new Map();
  controller.fetchWindowedReviews = async (
    _clientId,
    cam,
    after,
    _before,
    options,
  ) => {
    requestSeverities.set(cam, options.severity || "");
    return sourceReviews[cam].filter((review) => review.start_time >= after);
  };

  await controller.warmVisibleCameraReviews();

  assert.deepEqual(
    host._camCache["camera.front"].reviews.map((review) => review.id),
    ["front-d8-alert", "front-d6-alert"],
  );
  assert.deepEqual(
    host._camCache["camera.driveway"].reviews.map((review) => review.id),
    [
      "driveway-d9-detection-a",
      "driveway-d9-detection-b",
      "driveway-d8-alert",
    ],
  );
  assert.equal(controller.cameraAlertsCount("camera.front"), 2);
  assert.equal(controller.cameraAlertsCount("camera.driveway"), 3);
  assert.equal(requestSeverities.get("front"), "alert");
  assert.equal(requestSeverities.get("driveway"), "");
  assert.match(
    host._camCache["camera.front"].reviewsWindowKey,
    /\|2\|alerts_only$/,
  );
  assert.match(
    host._camCache["camera.driveway"].reviewsWindowKey,
    /\|2\|all_reviews$/,
  );
});

test("review probes merge eligible current reviews without replacing the full count window", () => {
  const day = 86400;
  const host = {
    _followNowWindow: true,
    _config: {
      alerts_reviews_days: 2,
      cameras: [
        { entity: "camera.front", alerts_content: "alerts_only" },
      ],
    },
    _camCache: {
      "camera.front": {
        reviewsWindowKey: "frigate|front|864000|2|alerts_only",
        reviews: [
          { id: "d8-alert", start_time: 8 * day, severity: "alert" },
          { id: "d6-alert", start_time: 6 * day, severity: "alert" },
        ],
      },
    },
    _activeCam: { entity: "camera.front" },
    _dayKey: (ts) => String(Math.floor(ts / day)),
    _renderStats: () => {},
  };
  const controller = new BrowseWindowLoaderController(host);

  assert.equal(
    controller.mergeLatestCameraReviews("camera.front", [
      { id: "d9-detection", start_time: 9 * day, severity: "detection" },
      { id: "d9-alert", start_time: 9 * day, severity: "alert" },
    ]),
    true,
  );
  assert.deepEqual(
    host._camCache["camera.front"].reviews.map((review) => review.id),
    ["d9-alert", "d8-alert"],
  );

  host._followNowWindow = false;
  assert.equal(
    controller.mergeLatestCameraReviews("camera.front", [
      { id: "d10-alert", start_time: 10 * day, severity: "alert" },
    ]),
    false,
  );
  assert.equal(controller.cameraAlertsCount("camera.front"), 2);
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

test("loadOlder does not expand beyond a selected calendar day", async () => {
  let requestCount = 0;
  const calls = [];
  const host = {
    _calSelectedDay: "2026-08-05",
    _events: [{ id: "event-1", start_time: 150 }],
    _loading: false,
    _exhausted: false,
    _ws: async () => {
      requestCount += 1;
      return [];
    },
    _renderList: () => calls.push("renderList"),
    _renderSubtitle: () => calls.push("renderSubtitle"),
  };
  const controller = new BrowseWindowLoaderController(host);

  await controller.loadOlder();

  assert.equal(requestCount, 0);
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

test("camera-group recordings load both physical members in parallel", async () => {
  const bounds = { start: 100, end: 400 };
  const primary = [{ id: "primary", start_time: 300, end_time: 330 }];
  const secondary = [{ id: "secondary", start_time: 320, end_time: 350 }];
  const started = [];
  let releaseBoth;
  const bothStarted = new Promise((resolve) => {
    releaseBoth = resolve;
  });
  const activeCamera = {
    entity: "camera.main",
    group: {
      secondary_entity: "camera.package",
      layout: "side_by_side",
    },
  };
  const host = {
    _winEnd: 400,
    _config: { refresh_seconds: 45, cameras: [activeCamera] },
    _activeCam: activeCamera,
    _camCache: {
      "camera.main": {
        clientId: "frigate",
        cam: "main",
        discovered: true,
        recordings: [],
      },
      "camera.package": {
        clientId: "frigate",
        cam: "package",
        discovered: true,
        recordings: [],
      },
    },
    _recordings: [],
    _recordingsDayDataCache: new Map(),
    _recordingsDayAvailabilityCache: new Map(),
    _recordingsDayFetchedAtCache: new Map(),
    _recordingsDayBounds: () => bounds,
    _cc: () => ({ clientId: "frigate", cam: "main" }),
    _discoverOne: async () => {},
    _recordingsBrowseNavController: {
      async fetchRecordingsInBoundsProgressively(
        _bounds,
        _clientId,
        camera,
        { onProgress },
      ) {
        started.push(camera);
        if (started.length === 2) releaseBoth();
        await bothStarted;
        const recordings = camera === "main" ? primary : secondary;
        onProgress(recordings, { complete: true });
        return recordings;
      },
    },
    _renderList: () => {},
  };
  const controller = new BrowseWindowLoaderController(host);

  await controller.loadWindowRecordings("frigate", "main", 400);

  assert.deepEqual(new Set(started), new Set(["main", "package"]));
  assert.deepEqual(
    host._recordings.map((recording) => [
      recording.id,
      recording._fvc_camera_entity,
      recording._fvc_group_member,
    ]),
    [
      ["secondary", "camera.package", "B"],
      ["primary", "camera.main", "A"],
    ],
  );
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
  const requestedRanges = [];
  controller.fetchWindowedReviews = async (
    _clientId,
    _cam,
    after,
    rangeBefore,
  ) => {
    requestedRanges.push({ after, before: rangeBefore });
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
  assert.deepEqual(requestedRanges, [
    { after: 96 * day, before: 100 * day },
    { after: 92 * day, before: 96 * day + 1 },
    { after: 84 * day, before: 92 * day + 1 },
    { after: 68 * day, before: 84 * day + 1 },
    { after: 36 * day, before: 68 * day + 1 },
  ]);
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

test("active-day loading reports an empty first response before deeper probes finish", async () => {
  let releaseFirstRange;
  const firstRangePending = new Promise((resolve) => {
    releaseFirstRange = resolve;
  });
  const progress = [];
  const host = {
    _dayKey: (ts) => String(Math.floor(ts / 86400)),
    _ws: async () => [],
  };
  const controller = new BrowseWindowLoaderController(host);
  let requestCount = 0;
  controller.fetchWindowedReviews = async (
    _clientId,
    _cam,
    _after,
    _before,
    options,
  ) => {
    requestCount += 1;
    options.onPage([], { page: -1, done: true });
    if (requestCount === 1) await firstRangePending;
    return [];
  };

  const load = controller.fetchRecentActiveDayReviews(
    "frigate",
    "front",
    10 * 86400,
    1,
    { onProgress: (items) => progress.push(items) },
  );
  await new Promise((resolve) => setImmediate(resolve));

  assert.deepEqual(progress, [[]]);
  releaseFirstRange();
  await load;
  assert.equal(requestCount > 1, true);
});
