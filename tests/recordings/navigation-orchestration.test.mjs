import { test } from "node:test";
import assert from "node:assert/strict";

globalThis.window = globalThis.window || { customCards: [] };
globalThis.window.customCards = globalThis.window.customCards || [];
globalThis.document = globalThis.document || {
  createElement: () => ({
    style: {},
    setAttribute() {},
    removeAttribute() {},
    appendChild() {},
    addEventListener() {},
    removeEventListener() {},
    querySelector() {
      return null;
    },
    querySelectorAll() {
      return [];
    },
  }),
  head: { appendChild() {} },
};
globalThis.customElements = globalThis.customElements || {
  define() {},
  get() {
    return undefined;
  },
};
globalThis.HTMLElement =
  globalThis.HTMLElement ||
  class {
    attachShadow() {
      return {
        addEventListener() {},
        removeEventListener() {},
        querySelector() {
          return null;
        },
        querySelectorAll() {
          return [];
        },
      };
    }
  };
globalThis.HTMLImageElement = globalThis.HTMLImageElement || class {};

const { FrigateViewCard } = await import("../../src/card/FrigateViewCard.js");

function createBrowseNavContext({
  clientId = "client-a",
  camera = "front",
  currentBounds = { start: 100, end: 100 },
  todayBounds = { start: 200, end: 200 },
  prevBounds = { start: 0, end: 99 },
  nextBounds = { start: 101, end: 199 },
  hasPrev = true,
  hasNext = false,
} = {}) {
  const prev = { disabled: null };
  const next = { disabled: null };
  const probes = [];

  return {
    prev,
    next,
    probes,
    ctx: {
      _tab: "recordings",
      _recordingsNavUpdateToken: 0,
      _$(selector) {
        if (selector === "#rec-day-prev") return prev;
        if (selector === "#rec-day-next") return next;
        return null;
      },
      _cc() {
        return { clientId, cam: camera };
      },
      _recordingsDayBounds(tsSec = null) {
        return tsSec == null ? currentBounds : todayBounds;
      },
      _recordingsOffsetDayBounds(offsetDays = 0) {
        if (offsetDays < 0) return prevBounds;
        if (offsetDays > 0) return nextBounds;
        return currentBounds;
      },
      async _hasRecordingsInBounds(bounds) {
        probes.push(bounds);
        if (bounds === prevBounds) return hasPrev;
        if (bounds === nextBounds) return hasNext;
        return false;
      },
    },
  };
}

test("_updateRecordingsBrowseNav disables both buttons without camera context", async () => {
  const { ctx, prev, next, probes } = createBrowseNavContext({
    clientId: "",
  });

  await FrigateViewCard.prototype._updateRecordingsBrowseNav.call(ctx);

  assert.equal(prev.disabled, true);
  assert.equal(next.disabled, true);
  assert.deepEqual(probes, []);
});

test("_updateRecordingsBrowseNav probes previous and next days before today", async () => {
  const prevBounds = { start: 0, end: 99 };
  const nextBounds = { start: 101, end: 199 };
  const { ctx, prev, next, probes } = createBrowseNavContext({
    currentBounds: { start: 50, end: 100 },
    todayBounds: { start: 150, end: 200 },
    prevBounds,
    nextBounds,
    hasPrev: true,
    hasNext: false,
  });

  await FrigateViewCard.prototype._updateRecordingsBrowseNav.call(ctx);

  assert.deepEqual(probes, [prevBounds, nextBounds]);
  assert.equal(prev.disabled, false);
  assert.equal(next.disabled, true);
});

test("_updateRecordingsBrowseNav skips next-day probing on today", async () => {
  const prevBounds = { start: 0, end: 199 };
  const nextBounds = { start: 201, end: 299 };
  const { ctx, prev, next, probes } = createBrowseNavContext({
    currentBounds: { start: 100, end: 200 },
    todayBounds: { start: 100, end: 200 },
    prevBounds,
    nextBounds,
    hasPrev: false,
    hasNext: true,
  });

  await FrigateViewCard.prototype._updateRecordingsBrowseNav.call(ctx);

  assert.deepEqual(probes, [prevBounds]);
  assert.equal(prev.disabled, true);
  assert.equal(next.disabled, true);
});
