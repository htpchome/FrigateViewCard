import { test } from "node:test";
import assert from "node:assert/strict";

import { BrowseCalendarActivityController } from "../src/features/browse/calendar-activity.ctrl.js";

test("prefetchCalendarActivityForActiveCamera caches filtered days and updates active calendar state", async () => {
  const calls = [];
  const host = {
    _daysWithActivity: new Set(),
    _calendarActivityByCam: new Map(),
    _calendarActivityInFlight: new Map(),
    _cc: () => ({ clientId: "frigate", cam: "front" }),
    _tz: () => "UTC",
    _ws: async () => [
      { camera: "front", day: "2026-08-01" },
      { camera: "back", day: "2026-08-02" },
      { camera: "front", day: "2026-08-03" },
      { camera: "front", day: "" },
    ],
    _$: () => ({ style: { display: "block" } }),
    _renderCal: () => calls.push("renderCal"),
  };
  const controller = new BrowseCalendarActivityController(host);

  await controller.prefetchCalendarActivityForActiveCamera();

  assert.deepEqual([...host._daysWithActivity], ["2026-08-01", "2026-08-03"]);
  assert.deepEqual(
    [...host._calendarActivityByCam.get("frigate|front|UTC")],
    ["2026-08-01", "2026-08-03"],
  );
  assert.deepEqual(
    [...host._calendarActivityByCam.get("frigate|back|UTC")],
    ["2026-08-02"],
  );
  assert.equal(calls.includes("renderCal"), true);
  assert.equal(host._calendarActivityInFlight.size, 0);
});

test("applyCalendarActivityCacheForActiveCamera and cached prefetch reuse active cache", async () => {
  const cachedDays = new Set(["2026-08-05"]);
  const host = {
    _daysWithActivity: new Set(),
    _calendarActivityByCam: new Map([["frigate|front|UTC", cachedDays]]),
    _calendarActivityInFlight: new Map(),
    _cc: () => ({ clientId: "frigate", cam: "front" }),
    _tz: () => "UTC",
    _ws: async () => {
      throw new Error("should not fetch");
    },
    _$: () => null,
    _renderCal: () => {},
  };
  const controller = new BrowseCalendarActivityController(host);

  controller.applyCalendarActivityCacheForActiveCamera();
  assert.deepEqual([...host._daysWithActivity], ["2026-08-05"]);

  host._daysWithActivity = new Set();
  await controller.prefetchCalendarActivityForActiveCamera();
  assert.deepEqual([...host._daysWithActivity], ["2026-08-05"]);
});

test("camera groups combine calendar activity from both physical members", async () => {
  const selectors = [];
  let requestCount = 0;
  const activeCamera = {
    entity: "camera.doorbell",
    group: {
      secondary_entity: "camera.package",
      layout: "stacked",
    },
  };
  const host = {
    _hass: { connection: {} },
    _activeCam: activeCamera,
    _camCache: {
      "camera.doorbell": { clientId: "group-frigate", cam: "doorbell" },
      "camera.package": { clientId: "group-frigate", cam: "package" },
    },
    _daysWithActivity: new Set(),
    _calendarActivityByCam: new Map(),
    _calendarActivityInFlight: new Map(),
    _discoverOne: async () => {},
    _tz: () => "UTC",
    _ws: async () => {
      requestCount += 1;
      return [
        { camera: "doorbell", day: "2026-08-10" },
        { camera: "package", day: "2026-08-11" },
        { camera: "doorbell", day: "2026-08-12" },
      ];
    },
    _$: (selector) => {
      selectors.push(selector);
      return { style: { display: "block" } };
    },
    _renderCal: () => {},
  };
  const controller = new BrowseCalendarActivityController(host);

  await controller.prefetchCalendarActivityForActiveCamera();

  assert.equal(requestCount, 1);
  assert.deepEqual(
    [...host._daysWithActivity],
    ["2026-08-10", "2026-08-12", "2026-08-11"],
  );
  assert.deepEqual(selectors, ["#cal-panel"]);
});

test("calendar summary prefetch is shared across card instances and camera changes", async () => {
  const connection = {};
  let requestCount = 0;
  let releaseSummary;
  const summaryPending = new Promise((resolve) => {
    releaseSummary = resolve;
  });
  const createHost = (cam) => ({
    _hass: { connection },
    _daysWithActivity: new Set(),
    _calendarActivityByCam: new Map(),
    _calendarActivityInFlight: new Map(),
    _cc: () => ({ clientId: "shared-frigate", cam }),
    _tz: () => "America/Chicago",
    _ws: async () => {
      requestCount += 1;
      return await summaryPending;
    },
    _$: () => null,
    _renderCal: () => {},
  });
  const frontHost = createHost("front");
  const backHost = createHost("back");
  const frontController = new BrowseCalendarActivityController(frontHost);
  const backController = new BrowseCalendarActivityController(backHost);

  const frontPrefetch = frontController.prefetchCalendarActivityForActiveCamera();
  const frontOpen = frontController.loadCalendar();
  const backPrefetch = backController.prefetchCalendarActivityForActiveCamera();
  await new Promise((resolve) => setImmediate(resolve));

  assert.equal(requestCount, 1);
  releaseSummary([
    { camera: "front", day: "2026-08-20" },
    { camera: "back", day: "2026-08-21" },
  ]);
  await Promise.all([frontPrefetch, frontOpen, backPrefetch]);

  assert.deepEqual([...frontHost._daysWithActivity], ["2026-08-20"]);
  assert.deepEqual([...backHost._daysWithActivity], ["2026-08-21"]);
  assert.equal(frontHost._calendarActivityInFlight.size, 0);
  assert.equal(backHost._calendarActivityInFlight.size, 0);
});
