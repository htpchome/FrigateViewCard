import { test } from "node:test";
import assert from "node:assert/strict";

import {
  buildRecordingsDayCacheKey,
  normalizeFetchedRecordingsAvailability,
  resolveCachedRecordingsAvailability,
} from "../src/card/recordings-availability-utils.js";

test("buildRecordingsDayCacheKey combines client, camera, and bounds", () => {
  assert.equal(
    buildRecordingsDayCacheKey("client-a", "front", {
      start: 100,
      end: 200,
    }),
    "client-a|front|100|200",
  );
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
