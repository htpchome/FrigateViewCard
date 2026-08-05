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
