import { test } from "node:test";
import assert from "node:assert/strict";

import { LiveRecoveryController } from "../src/features/live/recovery.ctrl.js";

const createHost = () => ({
  _activeCam: { entity: "camera.front" },
  _activeGroupMemberOverride: "",
  _config: {},
  _editorLiveHandoffController: {
    isSuspended: () => false,
  },
  _engine: null,
  _hass: {},
  _isCardVisible: () => true,
  _isFirefox: () => false,
  _isPreviewPageActive: () => false,
  _lastLiveKick: 0,
  _mountInProgress: false,
  _mountSeq: 2,
  _mountStartedAt: 0,
  _mountTargetEntity: "",
  _mseConnectAt: 0,
  _mseLastChunkAt: 0,
  _resumeLiveT: null,
  _started: true,
  _viewMode: "single",
  _$: () => null,
});

test("live recovery keeps editor and Firefox resume timing stable", () => {
  const host = createHost();
  const calls = [];
  const scheduled = [];
  const cleared = [];
  host._isFirefox = () => true;
  host._resumeLiveT = 19;
  host._resumeLiveIfNeeded = (reason) => calls.push(["resume", reason]);
  host._kickLiveIfStale = (force) => calls.push(["kick", force]);
  const controller = new LiveRecoveryController(host, {
    setTimer: (callback, delay) => {
      scheduled.push({ callback, delay });
      return scheduled.length;
    },
    clearTimer: (timer) => cleared.push(timer),
  });

  controller.scheduleResume("card-editor-close");

  assert.deepEqual(cleared, [19]);
  assert.deepEqual(
    scheduled.map(({ delay }) => delay),
    [40, 900, 900],
  );
  scheduled.forEach(({ callback }) => callback());
  assert.deepEqual(calls, [
    ["resume", "card-editor-close"],
    ["kick", true],
    ["kick", true],
  ]);
  assert.equal(host._resumeLiveT, null);
});

test("live recovery routes Preview and Grid resumes to their page owners", () => {
  const host = createHost();
  const calls = [];
  const controller = new LiveRecoveryController(host, {
    setTimer: () => {
      throw new Error("page-owned resumes must not schedule live recovery");
    },
  });
  host._isPreviewPageActive = () => true;
  host._renderPreviewPage = () => calls.push(["preview"]);

  controller.scheduleResume("preview");

  host._isPreviewPageActive = () => false;
  host._viewMode = "grid";
  host._scheduleGridRefresh = (delay) => calls.push(["grid", delay]);

  controller.scheduleResume("grid");

  assert.deepEqual(calls, [["preview"], ["grid", 120]]);
});

test("live recovery probes stale media and remounts the requested transport", () => {
  const host = createHost();
  const video = {
    readyState: 0,
    ended: false,
    paused: true,
    currentTime: 0,
    webkitDecodedFrameCount: 0,
  };
  const engine = { video };
  const mounts = [];
  host._engine = engine;
  host._findVideoDeep = (root) => (root === engine ? video : null);
  host._mountEngine = (forcedType) => mounts.push(forcedType);
  const controller = new LiveRecoveryController(host, {
    now: () => 20000,
  });

  controller.kickIfStale(false, false, "webrtc");

  assert.deepEqual(mounts, ["webrtc"]);
  assert.equal(host._lastLiveKick, 20000);
});

test("live recovery resumes card-owned MSE with its forced transport", () => {
  const host = createHost();
  const calls = [];
  const scheduled = [];
  const engineWrap = { style: { display: "none" } };
  host._currentLiveStreamHint = () => "mse";
  host._shouldUseGo2RtcForEntity = () => true;
  host._kickLiveIfStale = (...args) => calls.push(args);
  host._applyMountTrackingState = () => {};
  host._cleanupEngine = () => {};
  host._$ = (selector) => (selector === "#eng-wrap" ? engineWrap : null);
  const controller = new LiveRecoveryController(host, {
    now: () => 20000,
    setTimer: (callback, delay) => {
      scheduled.push({ callback, delay });
      return scheduled.length;
    },
  });

  controller.resumeIfNeeded("connected");

  assert.equal(engineWrap.style.display, "");
  assert.deepEqual(calls, [[true, true, "mse"]]);
  assert.deepEqual(scheduled.map(({ delay }) => delay), [900]);
  scheduled[0].callback();
  assert.deepEqual(calls, [[true, true, "mse"], [true]]);
});

test("live recovery preserves forced-remount reasons while visibility settles", () => {
  const host = createHost();
  const scheduled = [];
  const calls = [];
  host._isCardVisible = () => false;
  host._currentLiveStreamHint = () => "webrtc";
  host._shouldUseGo2RtcForEntity = () => true;
  host._resumeLiveIfNeeded = (reason) => calls.push(reason);
  host._applyMountTrackingState = () => {};
  host._cleanupEngine = () => {};
  const controller = new LiveRecoveryController(host, {
    now: () => 20000,
    setTimer: (callback, delay) => {
      scheduled.push({ callback, delay });
      return scheduled.length;
    },
  });

  controller.resumeIfNeeded("webrtc-connection-lost");

  assert.deepEqual(scheduled.map(({ delay }) => delay), [450]);
  scheduled[0].callback();
  assert.deepEqual(calls, ["webrtc-connection-lost"]);
});
