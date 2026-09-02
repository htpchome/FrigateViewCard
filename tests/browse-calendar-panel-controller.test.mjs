import { test } from "node:test";
import assert from "node:assert/strict";

import {
  buildCalendarPanelMarkup,
  buildFilterPanelMarkup,
} from "../src/features/browse/calendar-filter.tmpl.js";
import { BrowseCalendarPanelController } from "../src/features/browse/calendar-panel.ctrl.js";

test("renderCal builds panel markup from active month, day, and activity state", () => {
  const panel = { innerHTML: "" };
  const host = {
    _calSelectedDay: "2026-08-05",
    _calMonth: new Date(Date.UTC(2026, 7, 15, 12, 0, 0)),
    _daysWithActivity: new Set(["2026-08-01"]),
    _pageShellRegion: (regionKey) =>
      regionKey === "calendarPanel" ? panel : null,
    _tz: () => "UTC",
    _calendarMonthLabel: () => "August 2026",
    _tzParts: () => ({ year: 2026, month: 8, day: 5 }),
    _winEnd: 0,
  };
  const controller = new BrowseCalendarPanelController(host, {
    buildCalendarPanelMarkup: ({
      monthDate,
      activeDayDateString,
      todayDateString,
      daysWithActivity,
      timeZone,
      monthLabel,
      showReset,
    }) =>
      `${monthDate.toISOString()}|${activeDayDateString}|${todayDateString}|${[...daysWithActivity].join(",")}|${timeZone}|${monthLabel}|${showReset}`,
    nowEpochSeconds: () => 1_000_000,
  });

  controller.renderCal();

  assert.equal(
    panel.innerHTML,
    "2026-08-15T12:00:00.000Z|2026-08-05|2026-08-05|2026-08-01|UTC|August 2026|true",
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
    _pageShellRegion: (regionKey) =>
      regionKey === "calendarPanel" ? panel : null,
    _syncToolbarButtons: () => calls.push("syncToolbar"),
    _pruneNonActiveCamWindowCaches: () => calls.push("pruneCaches"),
    _loadWindow: async (replace, options) =>
      calls.push(["loadWindow", replace, options]),
    _scheduleWarmOtherCamerasEvents: () => calls.push("scheduleWarm"),
    _renderList: () => calls.push("renderList"),
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
  assert.equal(host._exhausted, true);
  assert.deepEqual(host._events, []);
  assert.deepEqual(host._reviews, []);
  assert.deepEqual(host._recordings, []);
  assert.equal(panel.style.display, "none");
  assert.deepEqual(calls, [
    "syncToolbar",
    "pruneCaches",
    ["loadWindow", true, { supersede: true }],
    "renderList",
    "scheduleWarm",
  ]);
});

test("handleSidebarCalendarClick routes day, nav, and reset interactions", () => {
  const calls = [];
  const host = {
    _tzParts: () => ({ year: 2026, month: 8, day: 5 }),
    _winEnd: 0,
    _pageShellRegion: () => ({ style: { display: "block" } }),
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
  controller.resetCalendarSelection = () => calls.push(["reset"]);

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
        selector === "[data-cal-reset]" ? { dataset: {} } : null,
    }),
    true,
  );
  assert.deepEqual(calls, [
    ["pickDay", "2026-08-05"],
    ["calNav", -1],
    ["reset"],
  ]);
});

test("resetCalendarSelection restores the default window and reloads immediately", async () => {
  const calls = [];
  const panel = { style: { display: "block" } };
  const host = {
    _followNowWindow: false,
    _calSelectedDay: "2026-08-05",
    _calMonth: new Date(Date.UTC(2026, 7, 15)),
    _config: { window_days: 4 },
    _events: [{ id: "old-event" }],
    _reviews: [{ id: "old-review" }],
    _recordings: [{ id: "old-recording" }],
    _exhausted: true,
    _pageShellRegion: () => panel,
    _syncToolbarButtons: () => calls.push("syncToolbar"),
    _pruneNonActiveCamWindowCaches: () => calls.push("pruneCaches"),
    _loadWindow: async (replace, options) =>
      calls.push(["loadWindow", replace, options]),
    _scheduleWarmOtherCamerasEvents: () => calls.push("scheduleWarm"),
    _renderList: () => calls.push("renderList"),
    _tzParts: () => ({ year: 2026, month: 8, day: 6 }),
  };
  const controller = new BrowseCalendarPanelController(host, {
    nowEpochSeconds: () => 1_000_000,
  });

  controller.resetCalendarSelection();
  await Promise.resolve();
  await Promise.resolve();

  assert.equal(host._followNowWindow, true);
  assert.equal(host._calSelectedDay, null);
  assert.equal(host._calMonth, null);
  assert.equal(host._winEnd, 1_000_000);
  assert.equal(host._winStart, 1_000_000 - 4 * 86400);
  assert.equal(host._exhausted, false);
  assert.deepEqual(host._events, []);
  assert.deepEqual(host._reviews, []);
  assert.deepEqual(host._recordings, []);
  assert.equal(panel.style.display, "none");
  assert.deepEqual(calls, [
    "syncToolbar",
    "pruneCaches",
    ["loadWindow", true, { supersede: true }],
    "renderList",
    "scheduleWarm",
  ]);
});

test("calendar reset control is only rendered for an explicit day selection", () => {
  const common = {
    monthDate: new Date(Date.UTC(2026, 7, 15, 12, 0, 0)),
    activeDayDateString: "",
    todayDateString: "2026-08-06",
    daysWithActivity: new Set(),
    timeZone: "UTC",
  };

  const defaultMarkup = buildCalendarPanelMarkup(common);
  const cachedLabelMarkup = buildCalendarPanelMarkup({
    ...common,
    monthLabel: "Cached August 2026",
  });
  const selectedMarkup = buildCalendarPanelMarkup({
    ...common,
    activeDayDateString: "2026-08-05",
    showReset: true,
  });
  const selectedTodayMarkup = buildCalendarPanelMarkup({
    ...common,
    activeDayDateString: "2026-08-06",
    showReset: true,
  });

  assert.doesNotMatch(defaultMarkup, /data-cal-reset/);
  assert.doesNotMatch(defaultMarkup, />Today</);
  assert.match(cachedLabelMarkup, />Cached August 2026</);
  assert.match(selectedMarkup, /data-cal-reset>Reset</);
  assert.match(selectedMarkup, /cday active[^>]*data-cal-day="2026-08-05"/);
  assert.match(selectedMarkup, /cday today[^>]*data-cal-day="2026-08-06"/);
  assert.match(
    selectedTodayMarkup,
    /cday today active[^>]*data-cal-day="2026-08-06"/,
  );
});

test("filter panel aligns wrapped chips and marks multiple selections", () => {
  const markup = buildFilterPanelMarkup({
    labels: ["all", "car", "person-verified", "resident"],
    zones: ["all", "front", "driveway"],
    filterLabel: ["person-verified", "resident"],
    filterZone: ["front", "driveway"],
    favOnly: false,
  });

  assert.match(
    markup,
    /<span class="frow-l">Label<\/span><div class="frow-chips">/,
  );
  assert.match(
    markup,
    /class="chip on" type="button" aria-pressed="true" data-flabel="person-verified"/,
  );
  assert.match(
    markup,
    /class="chip on" type="button" aria-pressed="true" data-flabel="resident"/,
  );
  assert.match(
    markup,
    /class="chip on" type="button" aria-pressed="true" data-fzone="front"/,
  );
  assert.match(
    markup,
    /class="chip on" type="button" aria-pressed="true" data-fzone="driveway"/,
  );
  assert.match(
    markup,
    /class="chip " type="button" aria-pressed="false" data-flabel="all"/,
  );
});

test("toggleCalendar opens the panel, closes filters, initializes month, and starts calendar refresh flow", async () => {
  const calendarPanel = { style: { display: "none" } };
  const filterPanel = { style: { display: "block" } };
  const calls = [];
  const host = {
    _calMonth: null,
    _winEnd: 123,
    _pageShellRegion: (regionKey) => {
      if (regionKey === "calendarPanel") return calendarPanel;
      if (regionKey === "filterPanel") return filterPanel;
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

test("calendar controller does not create an omitted panel region", () => {
  const controller = new BrowseCalendarPanelController({
    _pageShellRegion: () => null,
  });

  assert.doesNotThrow(() => controller.toggleCalendar());
  assert.doesNotThrow(() => controller.renderCal());
});
