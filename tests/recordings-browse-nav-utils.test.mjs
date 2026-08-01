import { test } from "node:test";
import assert from "node:assert/strict";

import { resolveRecordingsBrowseNavState } from "../src/card/recordings/browse-nav-utils.js";

test("resolveRecordingsBrowseNavState disables next and skips probing on today", () => {
  const state = resolveRecordingsBrowseNavState({
    currentBounds: { end: 200 },
    todayBounds: { end: 200 },
    hasPrev: true,
    hasNext: true,
  });

  assert.deepEqual(state, {
    isTodayOrFuture: true,
    shouldProbeNext: false,
    prevDisabled: false,
    nextDisabled: true,
  });
});

test("resolveRecordingsBrowseNavState enables both directions when adjacent days have data", () => {
  const state = resolveRecordingsBrowseNavState({
    currentBounds: { end: 100 },
    todayBounds: { end: 200 },
    hasPrev: true,
    hasNext: true,
  });

  assert.deepEqual(state, {
    isTodayOrFuture: false,
    shouldProbeNext: true,
    prevDisabled: false,
    nextDisabled: false,
  });
});

test("resolveRecordingsBrowseNavState disables directions with missing adjacent data", () => {
  const state = resolveRecordingsBrowseNavState({
    currentBounds: { end: 100 },
    todayBounds: { end: 200 },
    hasPrev: false,
    hasNext: false,
  });

  assert.deepEqual(state, {
    isTodayOrFuture: false,
    shouldProbeNext: true,
    prevDisabled: true,
    nextDisabled: true,
  });
});
