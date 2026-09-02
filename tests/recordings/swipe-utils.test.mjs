import { test } from "node:test";
import assert from "node:assert/strict";

import {
  RECORDINGS_SWIPE_EMPTY_HTML,
  resolvePreparedRecordingsDayNavigationState,
  resolvePreparedRecordingsIncomingState,
  resolveRecordingsSwipeStageMetrics,
  resolveRecordingsSwipeStageTransforms,
} from "../../src/features/recordings/utils/swipe.js";

test("resolveRecordingsSwipeStageMetrics derives width, current HTML, and minimum height", () => {
  const metrics = resolveRecordingsSwipeStageMetrics({
    list: {
      clientWidth: 212.4,
      innerHTML: "<div>current</div>",
      scrollHeight: 180,
      clientHeight: 150,
    },
    lastRenderedListHtml: "<div>fallback</div>",
  });

  assert.deepEqual(metrics, {
    width: 212,
    currentHtml: "<div>current</div>",
    minHeight: 220,
  });
});

test("resolveRecordingsSwipeStageMetrics falls back to cached HTML and client height", () => {
  const metrics = resolveRecordingsSwipeStageMetrics({
    list: {
      clientWidth: 0,
      innerHTML: "",
      scrollHeight: 0,
      clientHeight: 260,
    },
    lastRenderedListHtml: "<div>fallback</div>",
  });

  assert.deepEqual(metrics, {
    width: 1,
    currentHtml: "<div>fallback</div>",
    minHeight: 260,
  });
});

test("resolveRecordingsSwipeStageTransforms derives current and incoming offsets", () => {
  assert.deepEqual(
    resolveRecordingsSwipeStageTransforms({
      offset: -40,
      direction: 1,
      width: 240,
    }),
    {
      currentTransform: "translateX(-40px)",
      incomingTransform: "translateX(200px)",
    },
  );
});

test("resolvePreparedRecordingsIncomingState renders incoming HTML when data exists", () => {
  const recs = [{ id: 1 }];
  const state = resolvePreparedRecordingsIncomingState({
    prep: {
      hasData: true,
      bounds: { start: 100, end: 200 },
      recs,
    },
    renderRecordings: (recordings) => `rows:${recordings.length}`,
    emptyHtml: "unused",
  });

  assert.deepEqual(state, {
    hasData: true,
    bounds: { start: 100, end: 200 },
    recs,
    incomingHtml: "rows:1",
  });
});

test("resolvePreparedRecordingsIncomingState falls back to the provided empty HTML", () => {
  const state = resolvePreparedRecordingsIncomingState({
    prep: {
      hasData: false,
      bounds: { start: 100, end: 200 },
      recs: null,
    },
    renderRecordings: () => "unused",
    emptyHtml: "",
  });

  assert.deepEqual(state, {
    hasData: false,
    bounds: { start: 100, end: 200 },
    recs: [],
    incomingHtml: "",
  });
});

test("resolvePreparedRecordingsDayNavigationState marks prepared data as committable", () => {
  const recs = [{ id: 1 }];
  const state = resolvePreparedRecordingsDayNavigationState({
    prep: {
      hasData: true,
      bounds: { start: 100, end: 200 },
      recs,
    },
    renderRecordings: (recordings) => `rows:${recordings.length}`,
  });

  assert.deepEqual(state, {
    hasData: true,
    bounds: { start: 100, end: 200 },
    recs,
    incomingHtml: "rows:1",
    shouldBounce: false,
    shouldCommit: true,
  });
});

test("resolvePreparedRecordingsDayNavigationState marks empty prepared data as bounce-only", () => {
  const state = resolvePreparedRecordingsDayNavigationState({
    prep: {
      hasData: false,
      bounds: { start: 100, end: 200 },
      recs: null,
    },
    renderRecordings: () => "unused",
  });

  assert.deepEqual(state, {
    hasData: false,
    bounds: { start: 100, end: 200 },
    recs: [],
    incomingHtml: "",
    shouldBounce: true,
    shouldCommit: false,
  });
});

test("recordings day navigation exposes stable empty markup", () => {
  assert.equal(
    RECORDINGS_SWIPE_EMPTY_HTML,
    '<div class="empty">No recordings in this day</div>',
  );
});
