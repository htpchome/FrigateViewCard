import { test } from "node:test";
import assert from "node:assert/strict";

import {
  buildPreparedRecordingsDayResult,
  buildRecordingsDayCacheKey,
  mergeRecordingDayChunks,
  normalizeFetchedRecordingsAvailability,
  resolveCommittedRecordingsDayState,
  resolvePreparedRecordingsDayTransition,
  resolveCachedRecordingsAvailability,
  resolveFailedRecordingsAvailabilityState,
  resolveFetchedRecordingsAvailabilityState,
} from "../../src/features/recordings/utils/availability.js";

test("mergeRecordingDayChunks deduplicates boundary items and sorts by start", () => {
  assert.deepEqual(
    mergeRecordingDayChunks(
      [
        { id: "newer", start_time: 300, end_time: 400 },
        { id: "boundary", start_time: 200, end_time: 300 },
      ],
      [
        { id: "older", start_time: 100, end_time: 200 },
        { id: "boundary", start_time: 200, end_time: 300 },
      ],
    ),
    [
      { id: "older", start_time: 100, end_time: 200 },
      { id: "boundary", start_time: 200, end_time: 300 },
      { id: "newer", start_time: 300, end_time: 400 },
    ],
  );
});

test("buildRecordingsDayCacheKey combines client, camera, and bounds", () => {
  assert.equal(
    buildRecordingsDayCacheKey("client-a", "front", {
      start: 100,
      end: 200,
    }),
    "client-a|front|100|200",
  );
});

test("resolvePreparedRecordingsDayTransition short-circuits future next-day requests", () => {
  const state = resolvePreparedRecordingsDayTransition({
    direction: 1,
    bounds: { start: 100, end: 300 },
    todayBounds: { start: 0, end: 200 },
    clientId: "client-a",
    camera: "front",
    dataCache: new Map(),
  });

  assert.deepEqual(state, {
    done: true,
    key: "",
    result: {
      hasData: false,
      bounds: { start: 100, end: 300 },
      recs: [],
    },
  });
});

test("resolvePreparedRecordingsDayTransition short-circuits when camera context is missing", () => {
  const state = resolvePreparedRecordingsDayTransition({
    direction: -1,
    bounds: { start: 100, end: 200 },
    todayBounds: { start: 100, end: 200 },
    clientId: "",
    camera: "front",
    dataCache: new Map(),
  });

  assert.deepEqual(state, {
    done: true,
    key: "",
    result: {
      hasData: false,
      bounds: { start: 100, end: 200 },
      recs: [],
    },
  });
});

test("resolvePreparedRecordingsDayTransition uses cached day recordings when available", () => {
  const recordings = [{ id: 1 }];
  const state = resolvePreparedRecordingsDayTransition({
    direction: -1,
    bounds: { start: 100, end: 200 },
    todayBounds: { start: 500, end: 600 },
    clientId: "client-a",
    camera: "front",
    dataCache: new Map([["client-a|front|100|200", recordings]]),
  });

  assert.deepEqual(state, {
    done: true,
    key: "client-a|front|100|200",
    result: {
      hasData: true,
      bounds: { start: 100, end: 200 },
      recs: recordings,
    },
  });
});

test("resolvePreparedRecordingsDayTransition returns cache key when fetch is still needed", () => {
  const state = resolvePreparedRecordingsDayTransition({
    direction: -1,
    bounds: { start: 100, end: 200 },
    todayBounds: { start: 500, end: 600 },
    clientId: "client-a",
    camera: "front",
    dataCache: new Map(),
  });

  assert.deepEqual(state, {
    done: false,
    key: "client-a|front|100|200",
    result: null,
  });
});

test("resolveCachedRecordingsAvailability prefers cached recordings data", () => {
  const state = resolveCachedRecordingsAvailability({
    key: "k",
    dataCache: new Map([["k", [{ id: 1 }]]]),
    availabilityCache: new Map([["k", false]]),
  });

  assert.deepEqual(state, {
    found: true,
    hasRecordings: true,
    shouldSyncAvailability: true,
  });
});

test("resolveCachedRecordingsAvailability falls back to availability cache", () => {
  const state = resolveCachedRecordingsAvailability({
    key: "k",
    dataCache: new Map(),
    availabilityCache: new Map([["k", 1]]),
  });

  assert.deepEqual(state, {
    found: true,
    hasRecordings: true,
    shouldSyncAvailability: false,
  });
});

test("resolveCachedRecordingsAvailability reports misses when caches are empty", () => {
  const state = resolveCachedRecordingsAvailability({
    key: "missing",
    dataCache: new Map(),
    availabilityCache: new Map(),
  });

  assert.deepEqual(state, {
    found: false,
    hasRecordings: false,
    shouldSyncAvailability: false,
  });
});

test("normalizeFetchedRecordingsAvailability normalizes non-array responses", () => {
  assert.deepEqual(normalizeFetchedRecordingsAvailability(null), {
    recordings: [],
    hasRecordings: false,
  });
});

test("normalizeFetchedRecordingsAvailability preserves array responses", () => {
  const recordings = [{ id: 1 }, { id: 2 }];

  assert.deepEqual(normalizeFetchedRecordingsAvailability(recordings), {
    recordings,
    hasRecordings: true,
  });
});

test("resolveFetchedRecordingsAvailabilityState exposes normalized recordings and cache value", () => {
  const recordings = [{ id: 1 }];

  assert.deepEqual(resolveFetchedRecordingsAvailabilityState(recordings), {
    recordings,
    hasRecordings: true,
    availabilityValue: true,
  });
});

test("resolveFailedRecordingsAvailabilityState disables availability without cache data", () => {
  assert.deepEqual(resolveFailedRecordingsAvailabilityState(), {
    recordings: null,
    hasRecordings: false,
    availabilityValue: false,
  });
});

test("resolveCommittedRecordingsDayState normalizes recordings and builds a cache key", () => {
  const recordings = [{ id: 1 }];

  assert.deepEqual(
    resolveCommittedRecordingsDayState({
      bounds: { start: 100, end: 200 },
      recordings,
      clientId: "client-a",
      camera: "front",
    }),
    {
      bounds: { start: 100, end: 200 },
      recordings,
      hasRecordings: true,
      key: "client-a|front|100|200",
    },
  );
});

test("resolveCommittedRecordingsDayState omits the key when camera context is missing", () => {
  assert.deepEqual(
    resolveCommittedRecordingsDayState({
      bounds: { start: 100, end: 200 },
      recordings: null,
      clientId: "",
      camera: "front",
    }),
    {
      bounds: { start: 100, end: 200 },
      recordings: [],
      hasRecordings: false,
      key: "",
    },
  );
});

test("buildPreparedRecordingsDayResult normalizes prepared recordings payloads", () => {
  assert.deepEqual(
    buildPreparedRecordingsDayResult({ start: 100, end: 200 }, null),
    {
      hasData: false,
      bounds: { start: 100, end: 200 },
      recs: [],
    },
  );
});
