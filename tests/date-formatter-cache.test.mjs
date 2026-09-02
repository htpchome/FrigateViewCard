import test from "node:test";
import assert from "node:assert/strict";

import { createDateFormatterCache } from "../src/shared/date-formatter-cache.js";

test("date formatter cache reuses a formatter for the same runtime key", () => {
  const calls = [];
  const cache = createDateFormatterCache({
    createFormatter: (locales, options) => {
      const formatter = { locales, options, sequence: calls.length + 1 };
      calls.push(formatter);
      return formatter;
    },
  });

  const first = cache.get("time|UTC", [], {
    hour: "numeric",
    timeZone: "UTC",
  });
  const second = cache.get("time|UTC", [], {
    hour: "numeric",
    timeZone: "UTC",
  });
  const differentZone = cache.get("time|America/New_York", [], {
    hour: "numeric",
    timeZone: "America/New_York",
  });

  assert.equal(second, first);
  assert.notEqual(differentZone, first);
  assert.equal(calls.length, 2);
});

test("date formatter cache evicts the least recently used entry", () => {
  let createCalls = 0;
  const cache = createDateFormatterCache({
    createFormatter: (_locales, options) => ({
      options,
      sequence: ++createCalls,
    }),
    maxEntries: 2,
  });
  const first = cache.get("first", "en-US", { year: "numeric" });
  const second = cache.get("second", "en-US", { month: "short" });
  cache.get("first", "en-US", { year: "numeric" });
  cache.get("third", "en-US", { day: "numeric" });
  const recreatedSecond = cache.get("second", "en-US", {
    month: "short",
  });

  assert.equal(first.sequence, 1);
  assert.notEqual(recreatedSecond, second);
  assert.equal(createCalls, 4);
});
