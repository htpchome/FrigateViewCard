import { test } from "node:test";
import assert from "node:assert/strict";

import {
  mergeRecordingSegments,
  resolveRecordingSegmentTimelineRange,
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

test("camera-group recordings remain separate even when their times overlap", () => {
  const merged = mergeRecordingSegments([
    {
      start_time: 100,
      end_time: 200,
      events: 1,
      _fvc_camera_entity: "camera.main",
      _fvc_group_member: "A",
    },
    {
      start_time: 120,
      end_time: 220,
      events: 2,
      _fvc_camera_entity: "camera.package",
      _fvc_group_member: "B",
    },
  ]);

  assert.equal(merged.length, 2);
  assert.deepEqual(
    merged.map((recording) => recording._fvc_group_member),
    ["A", "B"],
  );
});

test("recording segment timeline exposes five available minutes on both sides", () => {
  assert.deepEqual(
    resolveRecordingSegmentTimelineRange({
      recordings: [
        { start_time: 3000, end_time: 5000 },
        { start_time: 5060, end_time: 7600 },
      ],
      start: 3600,
      end: 7200,
      nowSec: 10000,
    }),
    { start: 3300, end: 7500 },
  );
});

test("recording segment timeline limits extensions to available footage", () => {
  assert.deepEqual(
    resolveRecordingSegmentTimelineRange({
      recordings: [{ start_time: 3500, end_time: 7350 }],
      start: 3600,
      end: 7200,
      nowSec: 10000,
    }),
    { start: 3500, end: 7350 },
  );
});

test("recording segment timeline does not cross an unavailable recording gap", () => {
  assert.deepEqual(
    resolveRecordingSegmentTimelineRange({
      recordings: [
        { start_time: 3000, end_time: 3500 },
        { start_time: 3601, end_time: 7600 },
      ],
      start: 3600,
      end: 7200,
      nowSec: 10000,
    }),
    { start: 3600, end: 7500 },
  );
});

test("current partial recording timeline has pre-roll but no trailing area", () => {
  assert.deepEqual(
    resolveRecordingSegmentTimelineRange({
      recordings: [{ start_time: 6900, end_time: 9450 }],
      start: 7200,
      end: 9420,
      nowSec: 9450,
    }),
    { start: 6900, end: 9420 },
  );
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
