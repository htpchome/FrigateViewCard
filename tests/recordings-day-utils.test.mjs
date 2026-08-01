import { test } from "node:test";
import assert from "node:assert/strict";

import {
  resolveOffsetRecordingsDayBounds,
  resolveRecordingsDayBounds,
} from "../src/card/recordings-day-utils.js";

function makeEpochStub() {
  return (year, month, day, hour, minute, second) =>
    Number(
      `${year}${String(month).padStart(2, "0")}${String(day).padStart(2, "0")}${String(hour).padStart(2, "0")}${String(minute).padStart(2, "0")}${String(second).padStart(2, "0")}`,
    );
}

test("resolveRecordingsDayBounds uses explicit timestamp parts for start and end of day", () => {
  const calls = [];
  const bounds = resolveRecordingsDayBounds({
    tsSec: 12345,
    getTzParts: (target) => {
      calls.push(target);
      return { year: 2026, month: 8, day: 1 };
    },
    toEpochSeconds: makeEpochStub(),
  });

  assert.deepEqual(calls, [12345]);
  assert.deepEqual(bounds, {
    start: 20260801000000,
    end: 20260801235959,
  });
});

test("resolveRecordingsDayBounds falls back to window end when timestamp is absent", () => {
  const calls = [];
  const bounds = resolveRecordingsDayBounds({
    fallbackSec: 67890,
    getTzParts: (target) => {
      calls.push(target);
      return { year: 2026, month: 7, day: 31 };
    },
    toEpochSeconds: makeEpochStub(),
    nowSec: 99999,
  });

  assert.deepEqual(calls, [67890]);
  assert.deepEqual(bounds, {
    start: 20260731000000,
    end: 20260731235959,
  });
});

test("resolveOffsetRecordingsDayBounds shifts from the fallback day using UTC noon anchoring", () => {
  const calls = [];
  const bounds = resolveOffsetRecordingsDayBounds({
    offsetDays: 1,
    fallbackSec: 5000,
    getTzParts: (target) => {
      calls.push(target);
      return { year: 2026, month: 1, day: 31 };
    },
    toEpochSeconds: makeEpochStub(),
  });

  assert.deepEqual(calls, [5000]);
  assert.deepEqual(bounds, {
    start: 20260201000000,
    end: 20260201235959,
  });
});

test("resolveOffsetRecordingsDayBounds falls back to now when no window end is available", () => {
  const calls = [];
  const bounds = resolveOffsetRecordingsDayBounds({
    offsetDays: -1,
    getTzParts: (target) => {
      calls.push(target);
      return { year: 2026, month: 3, day: 1 };
    },
    toEpochSeconds: makeEpochStub(),
    nowSec: 24680,
  });

  assert.deepEqual(calls, [24680]);
  assert.deepEqual(bounds, {
    start: 20260228000000,
    end: 20260228235959,
  });
});
