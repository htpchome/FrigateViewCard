import { test } from "node:test";
import assert from "node:assert/strict";

import { LocalizedDateController } from "../src/features/localization/date.ctrl.js";

const makeHost = ({ language = "en", timeFormat = "24" } = {}) => ({
  _hass: {
    config: { time_zone: "America/Los_Angeles" },
    locale: { time_format: timeFormat },
  },
  _localization: {
    resolvedLanguage: language,
    t: (key, values) => `${key}:${Object.values(values).join("|")}`,
  },
  shadowRoot: null,
});

test("localized date controller owns HA timezone conversion and formatting", () => {
  const controller = new LocalizedDateController(makeHost());
  const timestamp = Date.UTC(2026, 8, 18, 2, 18) / 1000;

  assert.equal(controller.timezone(), "America/Los_Angeles");
  assert.deepEqual(controller.timezoneParts(timestamp), {
    year: 2026,
    month: 9,
    day: 17,
    hour: 19,
    minute: 18,
    second: 0,
  });
  assert.equal(
    controller.timezoneDateTimeToEpochSeconds(2026, 9, 17, 19, 18),
    timestamp,
  );
  assert.equal(controller.time(timestamp), "19:18");
  assert.equal(controller.weekday(timestamp), "Thu");
  assert.equal(
    controller.monthDay(timestamp, { ordinal: true }),
    "Sep 17th",
  );
  assert.equal(controller.dayKey(timestamp), "2026-09-17");
  assert.equal(controller.fullDate(timestamp), "Thu, Sep 17, 2026");
});

test("localized date controller caches equivalent formatters", () => {
  const controller = new LocalizedDateController(makeHost());
  const options = { month: "long", year: "numeric" };
  const first = controller.formatter("calendar", "en", options);
  const second = controller.formatter("calendar", "en", options);

  assert.equal(second, first);
});

test("localized date controller applies marked dates without replacing nodes", () => {
  const attributes = new Map([
    ["data-fvc-date-ts", String(Date.UTC(2026, 8, 18, 2, 18) / 1000)],
    ["data-fvc-date-format", "time"],
  ]);
  const element = {
    textContent: "old",
    getAttribute: (name) => attributes.get(name) ?? null,
    setAttribute: (name, value) => attributes.set(name, value),
  };
  const host = makeHost();
  host.shadowRoot = { querySelectorAll: () => [element] };
  const controller = new LocalizedDateController(host);

  controller.applyLocalizedDates();

  assert.equal(element.textContent, "19:18");
});
