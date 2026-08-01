import { test } from "node:test";
import assert from "node:assert/strict";

import {
  buildPreparedRecordingsDayResult,
  buildRecordingsDayCacheKey,
  normalizeFetchedRecordingsAvailability,
  resolvePreparedRecordingsDayTransition,
  resolveCachedRecordingsAvailability,
} from "../../src/card/recordings/availability-utils.js";

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
