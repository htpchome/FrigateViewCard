import { test } from "node:test";
import assert from "node:assert/strict";

import {
  resolveRecordingsBrowseNavContextState,
  resolveRecordingsBrowseNavProbePlan,
  resolveRecordingsBrowseNavState,
} from "../../src/card/recordings/browse-nav-utils.js";

test("resolveRecordingsBrowseNavContextState disables both directions without camera context", () => {
  const state = resolveRecordingsBrowseNavContextState({
    clientId: "",
    camera: "front",
    currentBounds: { end: 100 },
    todayBounds: { end: 200 },
  });

  assert.deepEqual(state, {
    hasContext: false,
    isTodayOrFuture: false,
    shouldProbeNext: false,
    prevDisabled: true,
    nextDisabled: true,
  });
});

test("resolveRecordingsBrowseNavContextState delegates to nav-state logic when camera context exists", () => {
  const state = resolveRecordingsBrowseNavContextState({
    clientId: "client-a",
    camera: "front",
    currentBounds: { end: 100 },
    todayBounds: { end: 200 },
    hasPrev: true,
    hasNext: false,
  });

  assert.deepEqual(state, {
    hasContext: true,
    isTodayOrFuture: false,
    shouldProbeNext: true,
    prevDisabled: false,
    nextDisabled: true,
  });
});

test("resolveRecordingsBrowseNavProbePlan skips all probes without camera context", () => {
  const state = resolveRecordingsBrowseNavProbePlan({
    clientId: "",
    camera: "front",
    currentBounds: { end: 100 },
    todayBounds: { end: 200 },
    prevBounds: { start: 0, end: 99 },
    nextBounds: { start: 101, end: 199 },
  });

  assert.deepEqual(state, {
    hasContext: false,
    initialState: {
      hasContext: false,
      isTodayOrFuture: false,
      shouldProbeNext: false,
      prevDisabled: true,
      nextDisabled: true,
    },
    prevProbeBounds: null,
    nextProbeBounds: null,
  });
});

test("resolveRecordingsBrowseNavProbePlan includes next probe only before today", () => {
  const state = resolveRecordingsBrowseNavProbePlan({
    clientId: "client-a",
    camera: "front",
    currentBounds: { end: 100 },
    todayBounds: { end: 200 },
    prevBounds: { start: 0, end: 99 },
    nextBounds: { start: 101, end: 199 },
  });

  assert.deepEqual(state, {
    hasContext: true,
    initialState: {
      hasContext: true,
      isTodayOrFuture: false,
      shouldProbeNext: true,
      prevDisabled: true,
      nextDisabled: true,
    },
    prevProbeBounds: { start: 0, end: 99 },
    nextProbeBounds: { start: 101, end: 199 },
  });
});

test("resolveRecordingsBrowseNavProbePlan omits next probe on today", () => {
  const state = resolveRecordingsBrowseNavProbePlan({
    clientId: "client-a",
    camera: "front",
    currentBounds: { end: 200 },
    todayBounds: { end: 200 },
    prevBounds: { start: 0, end: 199 },
    nextBounds: { start: 201, end: 299 },
  });

  assert.deepEqual(state, {
    hasContext: true,
    initialState: {
      hasContext: true,
      isTodayOrFuture: true,
      shouldProbeNext: false,
      prevDisabled: true,
      nextDisabled: true,
    },
    prevProbeBounds: { start: 0, end: 199 },
    nextProbeBounds: null,
  });
});

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
