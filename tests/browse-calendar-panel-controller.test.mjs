import { test } from "node:test";
import assert from "node:assert/strict";

import { BrowseCalendarPanelController } from "../src/features/browse/calendar-panel.ctrl.js";

test("renderCal builds panel markup from active month, day, and activity state", () => {
  const panel = { innerHTML: "" };
  const host = {
    _calSelectedDay: "2026-08-05",
    _calMonth: new Date(Date.UTC(2026, 7, 15, 12, 0, 0)),
    _daysWithActivity: new Set(["2026-08-01"]),
    shadowRoot: {
      querySelector: (selector) => (selector === "#cal-panel" ? panel : null),
    },
    _tz: () => "UTC",
    _tzParts: () => ({ year: 2026, month: 8, day: 5 }),
    _winEnd: 0,
  };
  const controller = new BrowseCalendarPanelController(host, {
    buildCalendarPanelMarkup: ({
      monthDate,
      activeDayDateString,
      daysWithActivity,
      timeZone,
    }) =>
      `${monthDate.toISOString()}|${activeDayDateString}|${[...daysWithActivity].join(",")}|${timeZone}`,
  });

  controller.renderCal();

  assert.equal(
    panel.innerHTML,
    "2026-08-15T12:00:00.000Z|2026-08-05|2026-08-01|UTC",
  );
});

test("pickDay updates browse window, closes panel, and schedules window reload flow", async () => {
  const calls = [];
  const panel = { style: { display: "block" } };
  const host = {
    _followNowWindow: true,
    _calSelectedDay: null,
    _winStart: 0,
    _winEnd: 0,
    shadowRoot: {
      querySelector: (selector) => (selector === "#cal-panel" ? panel : null),
    },
    _syncToolbarButtons: () => calls.push("syncToolbar"),
    _pruneNonActiveCamWindowCaches: () => calls.push("pruneCaches"),
    _loadWindow: async (replace) => calls.push(["loadWindow", replace]),
    _scheduleWarmOtherCamerasEvents: () => calls.push("scheduleWarm"),
    _tzDateTimeToEpochSeconds: (year, month, day, hour, minute, second) =>
      year * 10000000000 +
      month * 100000000 +
      day * 1000000 +
      hour * 10000 +
      minute * 100 +
      second,
    _tzParts: () => ({ year: 2026, month: 8, day: 5 }),
    _winEnd: 0,
  };
  const controller = new BrowseCalendarPanelController(host, {
    buildCalendarPanelMarkup: () => "",
    nowEpochSeconds: () => 99999999999999,
  });

  controller.pickDay("2026-08-05");
  await Promise.resolve();
  await Promise.resolve();

  assert.equal(host._followNowWindow, false);
  assert.equal(host._calSelectedDay, "2026-08-05");
  assert.equal(host._winStart, 20260805000000);
  assert.equal(host._winEnd, 20260805235959);
  assert.equal(panel.style.display, "none");
  assert.deepEqual(calls, [
    "syncToolbar",
    "pruneCaches",
    ["loadWindow", true],
    "scheduleWarm",
  ]);
});

test("handleSidebarCalendarClick routes day, nav, and today interactions", () => {
  const calls = [];
  const host = {
    _tzParts: () => ({ year: 2026, month: 8, day: 5 }),
    _winEnd: 0,
    shadowRoot: { querySelector: () => ({ style: { display: "block" } }) },
    _tzDateTimeToEpochSeconds: () => 0,
    _syncToolbarButtons: () => {},
    _pruneNonActiveCamWindowCaches: () => {},
    _loadWindow: async () => {},
    _scheduleWarmOtherCamerasEvents: () => {},
  };
  const controller = new BrowseCalendarPanelController(host, {
    buildCalendarPanelMarkup: () => "",
    nowEpochSeconds: () => 0,
  });
  controller.pickDay = (value) => calls.push(["pickDay", value]);
  controller.calNav = (value) => calls.push(["calNav", value]);
  controller.goTodayInCalendar = () => calls.push(["today"]);

  assert.equal(
    controller.handleSidebarCalendarClick({
      closest: (selector) =>
        selector === "[data-cal-day]"
          ? { dataset: { calDay: "2026-08-05" } }
          : null,
    }),
    true,
  );
  assert.equal(
    controller.handleSidebarCalendarClick({
      closest: (selector) =>
        selector === "[data-cal-nav]" ? { dataset: { calNav: "-1" } } : null,
    }),
    true,
  );
  assert.equal(
    controller.handleSidebarCalendarClick({
      closest: (selector) =>
        selector === "[data-cal-today]" ? { dataset: {} } : null,
    }),
    true,
  );
  assert.deepEqual(calls, [
    ["pickDay", "2026-08-05"],
    ["calNav", -1],
    ["today"],
  ]);
});

test("toggleCalendar opens the panel, closes filters, initializes month, and starts calendar refresh flow", async () => {
  const calendarPanel = { style: { display: "none" } };
  const filterPanel = { style: { display: "block" } };
  const calls = [];
  const host = {
    _calMonth: null,
    _winEnd: 123,
    _$: (selector) => {
      if (selector === "#cal-panel") return calendarPanel;
      if (selector === "#filter-panel") return filterPanel;
      return null;
    },
    _syncToolbarButtons: () => calls.push("syncToolbar"),
    _tzParts: () => ({ year: 2026, month: 8, day: 5 }),
    _applyCalendarActivityCacheForActiveCamera: () => calls.push("applyCache"),
    _prefetchCalendarActivityForActiveCamera: async () =>
      calls.push("prefetch"),
  };
  const controller = new BrowseCalendarPanelController(host, {
    buildCalendarPanelMarkup: () => "",
  });
  controller.renderCal = () => calls.push("renderCal");

  controller.toggleCalendar();
  await Promise.resolve();

  assert.equal(calendarPanel.style.display, "block");
  assert.equal(filterPanel.style.display, "none");
  assert.equal(host._calMonth?.toISOString(), "2026-08-15T12:00:00.000Z");
  assert.deepEqual(calls, [
    "syncToolbar",
    "applyCache",
    "renderCal",
    "prefetch",
  ]);
});
