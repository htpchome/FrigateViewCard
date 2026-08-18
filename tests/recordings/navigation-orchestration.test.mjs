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
const { RecordingsBrowseNavController } =
  await import("../../src/features/recordings/index.js");

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
      _pageShellRegionElement(_regionKey, selector) {
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

function createCommitContext({
  clientId = "client-a",
  camera = "front",
  recordings = [{ id: 1 }],
  swipeActive = false,
} = {}) {
  const dataCache = new Map();
  const availabilityCache = new Map();
  const calls = [];
  const removedClasses = [];
  const list = {
    classList: {
      remove: (...tokens) => {
        removedClasses.push(...tokens);
      },
      contains: (token) => swipeActive && token === "recordings-swipe-active",
    },
  };

  return {
    dataCache,
    availabilityCache,
    calls,
    list,
    removedClasses,
    ctx: {
      _followNowWindow: true,
      _winStart: 0,
      _winEnd: 0,
      _exhausted: true,
      _recordings: [],
      _recordingsDayDataCache: dataCache,
      _recordingsDayAvailabilityCache: availabilityCache,
      _recordingsSwipeController: {
        clearListState(targetList = null) {
          (targetList || list)?.classList?.remove?.("recordings-swipe-active");
        },
      },
      _cc() {
        return { clientId, cam: camera };
      },
      _$(selector) {
        return selector === "#list" ? list : null;
      },
      _clearRecordingsSwipeListState:
        FrigateViewCard.prototype._clearRecordingsSwipeListState,
      _pruneNonActiveCamWindowCaches() {
        calls.push(["prune"]);
      },
      _cacheActiveCamSlice(tab, recs) {
        calls.push(["cacheActiveCamSlice", tab, recs]);
      },
      _renderListLabel(ts) {
        calls.push(["renderListLabel", ts]);
      },
      _renderList() {
        calls.push(["renderList"]);
      },
    },
    recordings,
  };
}

function createNavigateContext({
  tab = "recordings",
  direction = 1,
  prep = { hasData: true, bounds: { start: 100, end: 200 }, recs: [{ id: 1 }] },
  stage = null,
} = {}) {
  const calls = [];

  const swipeController = {
    bounceArea(dir) {
      calls.push(["bounce", dir]);
    },
    createStage(dir, incomingHtml) {
      calls.push(["createStage", dir, incomingHtml]);
      return stage;
    },
    async animateStageTo(...args) {
      calls.push(["animate", ...args]);
    },
    clearListState() {
      calls.push(["clearListState"]);
    },
  };

  return {
    calls,
    direction,
    ctx: {
      _tab: tab,
      _recordingsDayNavAnimating: false,
      _recordingsSwipeController: swipeController,
      async _prepareRecordingsDayTransition(dir) {
        calls.push(["prepare", dir]);
        return prep;
      },
      _recordingsViewRows(recordings) {
        calls.push(["viewRows", recordings]);
        return recordings;
      },
      _recordingsListMarkup(recordings) {
        calls.push(["listMarkup", recordings]);
        return `rows:${recordings.length}`;
      },
      async _updateRecordingsBrowseNav() {
        calls.push(["updateBrowseNav"]);
      },
      async _commitRecordingsDayTransition(bounds, recs) {
        calls.push(["commit", bounds, recs]);
      },
    },
  };
}

test("_updateRecordingsBrowseNav disables both buttons without camera context", async () => {
  const { ctx, prev, next, probes } = createBrowseNavContext({
    clientId: "",
  });
  const controller = new RecordingsBrowseNavController(ctx);
  controller.hasRecordingsInBounds = async (bounds) => {
    probes.push(bounds);
    return false;
  };

  await controller.updateBrowseNav();

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
  const controller = new RecordingsBrowseNavController(ctx);
  controller.hasRecordingsInBounds = async (bounds) => {
    probes.push(bounds);
    if (bounds === prevBounds) return true;
    if (bounds === nextBounds) return false;
    return false;
  };

  await controller.updateBrowseNav();

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
  const controller = new RecordingsBrowseNavController(ctx);
  controller.hasRecordingsInBounds = async (bounds) => {
    probes.push(bounds);
    if (bounds === prevBounds) return false;
    if (bounds === nextBounds) return true;
    return false;
  };

  await controller.updateBrowseNav();

  assert.deepEqual(probes, [prevBounds]);
  assert.equal(prev.disabled, true);
  assert.equal(next.disabled, true);
});

test("hasRecordingsInBounds syncs cache hits and fetches uncached availability", async () => {
  const dataCache = new Map([["client-a|front|0|99", [{ id: 1 }]]]);
  const availabilityCache = new Map();
  const host = {
    _recordingsDayDataCache: dataCache,
    _recordingsDayAvailabilityCache: availabilityCache,
    _ws: async ({ before }) => {
      if (before === 199) return [{ id: 2 }];
      return [];
    },
  };
  const controller = new RecordingsBrowseNavController(host);

  assert.equal(
    await controller.hasRecordingsInBounds(
      { start: 0, end: 99 },
      "client-a",
      "front",
    ),
    true,
  );
  assert.equal(availabilityCache.get("client-a|front|0|99"), true);
  assert.equal(
    await controller.hasRecordingsInBounds(
      { start: 100, end: 199 },
      "client-a",
      "front",
    ),
    true,
  );
  assert.deepEqual(dataCache.get("client-a|front|100|199"), [{ id: 2 }]);
  assert.equal(availabilityCache.get("client-a|front|100|199"), true);
});

test("prepareDayTransition reuses cached transitions and fetches uncached day data", async () => {
  const cachedBounds = { start: 0, end: 99 };
  const fetchedBounds = { start: 100, end: 199 };
  const dataCache = new Map([["client-a|front|0|99", [{ id: "cached" }]]]);
  const availabilityCache = new Map();
  const calls = [];
  const host = {
    _recordingsDayDataCache: dataCache,
    _recordingsDayAvailabilityCache: availabilityCache,
    _recordingsOffsetDayBounds: (direction) =>
      direction < 0 ? cachedBounds : fetchedBounds,
    _recordingsDayBounds: () => ({ start: 200, end: 299 }),
    _cc: () => ({ clientId: "client-a", cam: "front" }),
    _ws: async ({ before }) => {
      calls.push(["ws", before]);
      return before === 199 ? [{ id: "fetched" }] : [];
    },
  };
  const controller = new RecordingsBrowseNavController(host);
  controller.hasRecordingsInBounds = async (bounds) => {
    calls.push(["hasRecordingsInBounds", bounds]);
    return bounds === fetchedBounds;
  };

  assert.deepEqual(await controller.prepareDayTransition(-1), {
    hasData: true,
    bounds: cachedBounds,
    recs: [{ id: "cached" }],
  });
  assert.deepEqual(calls, []);

  assert.deepEqual(await controller.prepareDayTransition(1), {
    hasData: true,
    bounds: fetchedBounds,
    recs: [{ id: "fetched" }],
  });
  assert.deepEqual(calls, [
    ["hasRecordingsInBounds", fetchedBounds],
    ["ws", 199],
  ]);
  assert.deepEqual(dataCache.get("client-a|front|100|199"), [
    { id: "fetched" },
  ]);
  assert.equal(availabilityCache.get("client-a|front|100|199"), true);
});

test("_commitRecordingsDayTransition updates caches and render state with camera context", async () => {
  const bounds = { start: 100, end: 200 };
  const {
    ctx,
    calls,
    dataCache,
    availabilityCache,
    recordings,
    removedClasses,
  } = createCommitContext({
    clientId: "client-a",
    camera: "front",
    recordings: [{ id: 1 }],
    swipeActive: true,
  });
  const controller = new RecordingsBrowseNavController(ctx);

  await controller.commitDayTransition(bounds, recordings);

  assert.equal(ctx._followNowWindow, false);
  assert.equal(ctx._winStart, 100);
  assert.equal(ctx._winEnd, 200);
  assert.equal(ctx._exhausted, false);
  assert.equal(ctx._lastRenderedListHtml, "");
  assert.deepEqual(ctx._recordings, recordings);
  assert.deepEqual(dataCache.get("client-a|front|100|200"), recordings);
  assert.equal(availabilityCache.get("client-a|front|100|200"), true);
  assert.deepEqual(removedClasses, ["recordings-swipe-active"]);
  assert.deepEqual(calls, [
    ["prune"],
    ["cacheActiveCamSlice", "recordings", recordings],
    ["renderListLabel", 200],
    ["renderList"],
  ]);
});

test("_commitRecordingsDayTransition skips cache writes without camera context", async () => {
  const bounds = { start: 300, end: 400 };
  const { ctx, calls, dataCache, availabilityCache, removedClasses } =
    createCommitContext({
      clientId: "",
      camera: "front",
      recordings: null,
      swipeActive: true,
    });
  const controller = new RecordingsBrowseNavController(ctx);

  await controller.commitDayTransition(bounds, null);

  assert.equal(ctx._followNowWindow, false);
  assert.equal(ctx._winStart, 300);
  assert.equal(ctx._winEnd, 400);
  assert.equal(ctx._exhausted, false);
  assert.deepEqual(ctx._recordings, []);
  assert.equal(dataCache.size, 0);
  assert.equal(availabilityCache.size, 0);
  assert.deepEqual(removedClasses, ["recordings-swipe-active"]);
  assert.deepEqual(calls, [
    ["prune"],
    ["cacheActiveCamSlice", "recordings", []],
    ["renderListLabel", 400],
    ["renderList"],
  ]);
});

test("_commitRecordingsDayTransition clears swipe-active state across repeated day transitions", async () => {
  const firstBounds = { start: 100, end: 200 };
  const secondBounds = { start: 200, end: 300 };
  const { ctx, removedClasses } = createCommitContext({
    clientId: "client-a",
    camera: "front",
    recordings: [{ id: 1 }],
    swipeActive: true,
  });
  const controller = new RecordingsBrowseNavController(ctx);

  await controller.commitDayTransition(firstBounds, [{ id: 1 }]);
  await controller.commitDayTransition(secondBounds, [{ id: 2 }]);

  assert.deepEqual(removedClasses, [
    "recordings-swipe-active",
    "recordings-swipe-active",
  ]);
});

test("mixed swipe and button recordings transitions both clear swipe-active state", async () => {
  const firstBounds = { start: 100, end: 200 };
  const secondBounds = { start: 200, end: 300 };
  const calls = [];
  const { ctx, removedClasses } = createCommitContext({
    clientId: "client-a",
    camera: "front",
    recordings: [{ id: 1 }],
    swipeActive: true,
  });

  ctx._tab = "recordings";
  ctx._recordingsDayNavAnimating = false;
  ctx._prepareRecordingsDayTransition = async (dir) => {
    calls.push(["prepare", dir]);
    return { hasData: true, bounds: secondBounds, recs: [{ id: 2 }] };
  };
  ctx._recordingsViewRows = (recordings) => recordings;
  ctx._recordingsListMarkup = (recordings) => `rows:${recordings.length}`;
  ctx._recordingsSwipeController = {
    bounceArea: (dir) => {
      calls.push(["bounce", dir]);
    },
    createStage: (dir, incomingHtml) => {
      calls.push(["createStage", dir, incomingHtml]);
      return null;
    },
    animateStageTo: async (...args) => {
      calls.push(["animate", ...args]);
    },
    clearListState: () => {
      removedClasses.push("recordings-swipe-active");
    },
  };
  const recordingsBrowseNavController = new RecordingsBrowseNavController(ctx);
  recordingsBrowseNavController.prepareDayTransition = async (dir) => {
    calls.push(["prepare", dir]);
    return { hasData: true, bounds: secondBounds, recs: [{ id: 2 }] };
  };
  recordingsBrowseNavController.updateBrowseNav = async () => {
    calls.push(["updateBrowseNav"]);
  };
  ctx._commitRecordingsDayTransition = async (bounds, recs) =>
    recordingsBrowseNavController.commitDayTransition(bounds, recs);
  ctx._recordingsBrowseNavController = recordingsBrowseNavController;

  const gesture = {
    prepPromise: Promise.resolve(),
    ready: true,
    hasData: true,
    direction: -1,
    bounds: firstBounds,
    recs: [{ id: 1 }],
    stage: { width: 240 },
  };

  const originalRequestAnimationFrame = globalThis.requestAnimationFrame;
  globalThis.requestAnimationFrame = (cb) => {
    cb();
    return 1;
  };

  try {
    const swipeResult =
      await recordingsBrowseNavController.completeSwipeGesture(gesture);
    const buttonResult = await recordingsBrowseNavController.stepDay(1);

    assert.equal(swipeResult, true);
    assert.equal(buttonResult, true);
    assert.deepEqual(removedClasses, [
      "recordings-swipe-active",
      "recordings-swipe-active",
    ]);
    assert.deepEqual(calls, [
      ["animate", gesture.stage, 240, 300, "cubic-bezier(0.28, 0.02, 0.18, 1)"],
      ["prepare", 1],
      ["createStage", 1, "rows:1"],
    ]);
  } finally {
    globalThis.requestAnimationFrame = originalRequestAnimationFrame;
  }
});

test("_navigateRecordingsDayAnimated bounces and refreshes browse nav when no data is prepared", async () => {
  const bounds = { start: 100, end: 200 };
  const { ctx, calls, direction } = createNavigateContext({
    direction: -1,
    prep: { hasData: false, bounds, recs: [] },
  });
  const controller = new RecordingsBrowseNavController(ctx);
  controller.prepareDayTransition = async (dir) => {
    calls.push(["prepare", dir]);
    return { hasData: false, bounds, recs: [] };
  };
  controller.updateBrowseNav = async () => {
    calls.push(["updateBrowseNav"]);
  };

  const result = await controller.navigateDayAnimated(direction);

  assert.equal(result, false);
  assert.equal(ctx._recordingsDayNavAnimating, false);
  assert.deepEqual(calls, [
    ["prepare", -1],
    ["bounce", -1],
    ["updateBrowseNav"],
  ]);
});

test("_navigateRecordingsDayAnimated commits immediately when no swipe stage is created", async () => {
  const bounds = { start: 100, end: 200 };
  const recs = [{ id: 1 }];
  const { ctx, calls, direction } = createNavigateContext({
    direction: 1,
    prep: { hasData: true, bounds, recs },
    stage: null,
  });
  const controller = new RecordingsBrowseNavController(ctx);
  controller.prepareDayTransition = async (dir) => {
    calls.push(["prepare", dir]);
    return { hasData: true, bounds, recs };
  };

  const result = await controller.navigateDayAnimated(direction);

  assert.equal(result, true);
  assert.equal(ctx._recordingsDayNavAnimating, false);
  assert.deepEqual(calls, [
    ["prepare", 1],
    ["viewRows", recs],
    ["listMarkup", recs],
    ["createStage", 1, "rows:1"],
    ["commit", bounds, recs],
  ]);
});

test("_navigateRecordingsDayAnimated animates and commits when a swipe stage is created", async () => {
  const bounds = { start: 100, end: 200 };
  const recs = [{ id: 1 }];
  const stage = { width: 240 };
  const { ctx, calls, direction } = createNavigateContext({
    direction: 1,
    prep: { hasData: true, bounds, recs },
    stage,
  });
  const controller = new RecordingsBrowseNavController(ctx);
  controller.prepareDayTransition = async (dir) => {
    calls.push(["prepare", dir]);
    return { hasData: true, bounds, recs };
  };
  const originalRequestAnimationFrame = globalThis.requestAnimationFrame;
  globalThis.requestAnimationFrame = (cb) => {
    cb();
    return 1;
  };

  try {
    const result = await controller.navigateDayAnimated(direction);

    assert.equal(result, true);
    assert.equal(ctx._recordingsDayNavAnimating, false);
    assert.deepEqual(calls, [
      ["prepare", 1],
      ["viewRows", recs],
      ["listMarkup", recs],
      ["createStage", 1, "rows:1"],
      ["animate", stage, -240, 320, "cubic-bezier(0.28, 0.02, 0.18, 1)"],
      ["commit", bounds, recs],
    ]);
  } finally {
    globalThis.requestAnimationFrame = originalRequestAnimationFrame;
  }
});
