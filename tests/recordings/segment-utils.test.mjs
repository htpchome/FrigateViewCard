import { test } from "node:test";
import assert from "node:assert/strict";

import {
  mergeRecordingSegments,
  splitRecordingsHourly,
} from "../../src/features/recordings/utils/segment.js";

test("mergeRecordingSegments merges segments separated by at most one minute", () => {
  const merged = mergeRecordingSegments([
    { start_time: 200, end_time: 260, events: 2 },
    { start_time: 100, end_time: 150, events: 1 },
    { start_time: 210, end_time: 280, events: 3 },
    { start_time: 340, end_time: 360, events: 4 },
  ]);

  assert.deepEqual(merged, [{ start_time: 100, end_time: 360, events: 10 }]);
});

test("mergeRecordingSegments keeps segments apart when the gap exceeds one minute", () => {
  const merged = mergeRecordingSegments([
    { start_time: 100, end_time: 150, events: 1 },
    { start_time: 211, end_time: 240, events: 2 },
  ]);

  assert.deepEqual(merged, [
    { start_time: 100, end_time: 150, events: 1 },
    { start_time: 211, end_time: 240, events: 2 },
  ]);
});

test("splitRecordingsHourly returns only overlapping hourly buckets within the last day", () => {
  const nowSec = 24 * 3600 + 1800;

  const buckets = splitRecordingsHourly(
    [
      { start_time: 2 * 3600 + 120, end_time: 2 * 3600 + 600, events: 2 },
      { start_time: 23 * 3600 + 1200, end_time: 24 * 3600 + 900, events: 3 },
    ],
    nowSec,
  );

  assert.deepEqual(buckets, [
    {
      start_time: 2 * 3600,
      end_time: 3 * 3600,
      events: 2,
    },
    {
      start_time: 23 * 3600,
      end_time: 24 * 3600,
      events: 3,
    },
    {
      start_time: 24 * 3600,
      end_time: nowSec,
      events: 3,
    },
  ]);
});

test("splitRecordingsHourly uses nowSec when a recording has no end time", () => {
  const nowSec = 5 * 3600 + 900;

  const buckets = splitRecordingsHourly(
    [{ start_time: 4 * 3600 + 1800, events: 2 }],
    nowSec,
  );

  assert.deepEqual(buckets, [
    {
      start_time: 4 * 3600,
      end_time: 5 * 3600,
      events: 2,
    },
    {
      start_time: 5 * 3600,
      end_time: nowSec,
      events: 2,
    },
  ]);
});
