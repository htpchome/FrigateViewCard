import { test } from "node:test";
import assert from "node:assert/strict";

import {
  buildRecordingsDayFetchChunks,
  resolveOffsetRecordingsDayBounds,
  resolveRecordingsDayBounds,
} from "../../src/features/recordings/utils/day.js";

test("buildRecordingsDayFetchChunks returns newest six-hour slices first", () => {
  assert.deepEqual(
    buildRecordingsDayFetchChunks({
      bounds: { start: 0, end: 86_400 },
      before: 73_800,
    }),
    [
      { start: 64_800, end: 73_800 },
      { start: 43_200, end: 64_800 },
      { start: 21_600, end: 43_200 },
      { start: 0, end: 21_600 },
    ],
  );
});

test("buildRecordingsDayFetchChunks clamps requests to the selected day", () => {
  assert.deepEqual(
    buildRecordingsDayFetchChunks({
      bounds: { start: 100, end: 500 },
      before: 900,
      chunkSeconds: 180,
    }),
    [
      { start: 460, end: 500 },
      { start: 280, end: 460 },
      { start: 100, end: 280 },
    ],
  );
});

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
