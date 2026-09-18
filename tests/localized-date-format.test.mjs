import { test } from "node:test";
import assert from "node:assert/strict";

import {
  formatLocalizedMonthDay,
  formatLocalizedTime,
  resolveDisplayHour12,
} from "../src/features/localization/date-format.js";
import { applyLocalizedDates } from "../src/features/localization/date-dom.js";

const timestamp = Date.UTC(2026, 8, 17, 19, 18) / 1000;
const formatterFor = (timeZone) => (_name, locale, options) =>
  new Intl.DateTimeFormat(locale, { ...options, timeZone });
const ordinalize = (day) => `${day}th`;

test("English display keeps its current date and 12-hour time", () => {
  const formatter = formatterFor("UTC");
  assert.equal(
    formatLocalizedTime(timestamp, { locale: "en", formatter }),
    "7:18 pm",
  );
  assert.equal(
    formatLocalizedMonthDay(timestamp, {
      locale: "en",
      ordinal: true,
      formatter,
      ordinalize,
    }),
    "Sep 17th",
  );
  assert.equal(
    formatLocalizedMonthDay(timestamp, {
      locale: "en",
      numeric: true,
      formatter,
      ordinalize,
    }),
    "9/17",
  );
});

test("translated locales use natural order and explicit HA time preference", () => {
  const formatter = formatterFor("UTC");
  assert.equal(resolveDisplayHour12("fr", "language"), undefined);
  assert.equal(resolveDisplayHour12("en", "24"), false);
  assert.equal(resolveDisplayHour12("fr", "12"), true);
  assert.equal(
    formatLocalizedMonthDay(timestamp, {
      locale: "fr",
      ordinal: true,
      formatter,
      ordinalize,
    }),
    "17 sept.",
  );
  assert.equal(
    formatLocalizedTime(timestamp, { locale: "fr", formatter }),
    "19:18",
  );
  assert.equal(
    formatLocalizedMonthDay(timestamp, {
      locale: "de",
      ordinal: true,
      formatter,
    }),
    "17. Sept.",
  );
  assert.equal(
    formatLocalizedTime(timestamp, { locale: "de", formatter }),
    "19:18",
  );
  assert.equal(
    formatLocalizedMonthDay(timestamp, {
      locale: "es",
      ordinal: true,
      formatter,
    }),
    "17 sept",
  );
  assert.equal(
    formatLocalizedTime(timestamp, { locale: "es", formatter }),
    "19:18",
  );
  assert.equal(
    formatLocalizedTime(timestamp, {
      locale: "es-419",
      timeFormat: "24",
      formatter,
    }),
    "19:18",
  );
  assert.equal(
    formatLocalizedMonthDay(timestamp, { locale: "pt-PT", formatter }),
    "17/09",
  );
  assert.equal(
    formatLocalizedMonthDay(timestamp, { locale: "pt-BR", formatter }),
    "17 de set.",
  );
  assert.equal(formatLocalizedTime(timestamp, { locale: "pt-PT", formatter }), "19:18");
  assert.equal(formatLocalizedTime(timestamp, { locale: "pt-BR", formatter }), "19:18");
  assert.equal(
    formatLocalizedMonthDay(timestamp, { locale: "it", formatter }),
    "17 set",
  );
  assert.equal(formatLocalizedTime(timestamp, { locale: "it", formatter }), "19:18");
  assert.equal(
    formatLocalizedMonthDay(timestamp, { locale: "pl", formatter }),
    "17 wrz",
  );
  assert.equal(formatLocalizedTime(timestamp, { locale: "pl", formatter }), "19:18");
  assert.equal(
    formatLocalizedMonthDay(timestamp, { locale: "ca", formatter }),
    "17 de set.",
  );
  assert.equal(formatLocalizedTime(timestamp, { locale: "ca", formatter }), "19:18");
  assert.equal(
    formatLocalizedMonthDay(timestamp, { locale: "el", formatter }),
    "17 Σεπ",
  );
  assert.equal(formatLocalizedTime(timestamp, { locale: "el", formatter }), "7:18 μ.μ.");
  assert.equal(formatLocalizedTime(timestamp, {
    locale: "el",
    timeFormat: "24",
    formatter,
  }), "19:18");
  assert.equal(
    formatLocalizedTime(timestamp, {
      locale: "en",
      timeFormat: "24",
      formatter,
    }),
    "19:18",
  );
  assert.equal(
    formatLocalizedTime(Date.UTC(2026, 8, 17, 0, 30) / 1000, {
      locale: "en",
      timeFormat: "24",
      formatter,
    }),
    "00:30",
  );
});

test("localized display dates use the configured time zone at day boundaries", () => {
  const nearMidnight = Date.UTC(2026, 8, 17, 0, 30) / 1000;
  assert.equal(
    formatLocalizedMonthDay(nearMidnight, {
      locale: "en",
      formatter: formatterFor("UTC"),
      ordinalize,
    }),
    "Sep 17",
  );
  assert.equal(
    formatLocalizedMonthDay(nearMidnight, {
      locale: "en",
      formatter: formatterFor("America/Los_Angeles"),
      ordinalize,
    }),
    "Sep 16",
  );
});

test("language changes update only marked date text and interpolation values", () => {
  const makeElement = (attributes, textContent = "") => {
    const attrs = new Map(Object.entries(attributes));
    return {
      textContent,
      getAttribute: (name) => attrs.get(name) ?? null,
      setAttribute: (name, value) => attrs.set(name, value),
    };
  };
  const time = makeElement({
    "data-fvc-date-ts": "42",
    "data-fvc-date-format": "time",
  }, "old");
  const action = makeElement({
    "data-fvc-date-ts": "42",
    "data-fvc-date-format": "time",
    "data-fvc-date-i18n-value": "time",
    "data-fvc-i18n-values": '{"label":"Doorbell","time":"old"}',
  });
  const root = { querySelectorAll: () => [time, action] };
  applyLocalizedDates(root, { time: () => "19:18" });
  assert.equal(time.textContent, "19:18");
  assert.deepEqual(JSON.parse(action.getAttribute("data-fvc-i18n-values")), {
    label: "Doorbell",
    time: "19:18",
  });
});
