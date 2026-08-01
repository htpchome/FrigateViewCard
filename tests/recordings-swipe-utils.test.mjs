import { test } from "node:test";
import assert from "node:assert/strict";

import {
  createRecordingsSwipeGestureState,
  RECORDINGS_SWIPE_EMPTY_HTML,
  RECORDINGS_SWIPE_LOADING_HTML,
  resolveFailedRecordingsSwipeState,
  resolvePreparedRecordingsSwipeState,
} from "../src/card/recordings-swipe-utils.js";

test("createRecordingsSwipeGestureState builds the initial gesture shape", () => {
  const stage = { incoming: {} };

  assert.deepEqual(createRecordingsSwipeGestureState(1, stage), {
    direction: 1,
    stage,
    hasData: false,
    ready: false,
    bounds: null,
    recs: [],
    prepPromise: null,
  });
});

test("resolvePreparedRecordingsSwipeState renders recordings markup when data exists", () => {
  const recs = [{ id: 1 }];
  const state = resolvePreparedRecordingsSwipeState({
    prep: {
      hasData: true,
      bounds: { start: 100, end: 200 },
      recs,
    },
    renderRecordings: (recordings) => `rows:${recordings.length}`,
  });

  assert.deepEqual(state, {
    ready: true,
    hasData: true,
    bounds: { start: 100, end: 200 },
    recs,
    incomingHtml: "rows:1",
  });
});

test("resolvePreparedRecordingsSwipeState falls back to empty markup without data", () => {
  const state = resolvePreparedRecordingsSwipeState({
    prep: {
      hasData: false,
      bounds: { start: 100, end: 200 },
      recs: null,
    },
    renderRecordings: () => "unused",
  });

  assert.deepEqual(state, {
    ready: true,
    hasData: false,
    bounds: { start: 100, end: 200 },
    recs: [],
    incomingHtml: RECORDINGS_SWIPE_EMPTY_HTML,
  });
});

test("resolveFailedRecordingsSwipeState returns the empty non-loading state", () => {
  assert.deepEqual(resolveFailedRecordingsSwipeState(), {
    ready: true,
    hasData: false,
    bounds: null,
    recs: [],
    incomingHtml: RECORDINGS_SWIPE_EMPTY_HTML,
  });
});

test("recordings swipe constants expose stable loading and empty markup", () => {
  assert.equal(
    RECORDINGS_SWIPE_LOADING_HTML,
    '<div class="empty">Loading day…</div>',
  );
  assert.equal(
    RECORDINGS_SWIPE_EMPTY_HTML,
    '<div class="empty">No recordings in this day</div>',
  );
});
