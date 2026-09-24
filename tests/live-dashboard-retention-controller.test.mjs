import { test } from "node:test";
import assert from "node:assert/strict";

import { LiveDashboardRetentionController } from "../src/features/live/dashboard-retention.ctrl.js";

const createHost = () => {
  const calls = [];
  const video = {};
  const engine = { video };
  const engineHost = {};
  const host = {
    isConnected: true,
    _activeCam: { entity: "camera.front" },
    _activeGroupMemberOverride: "",
    _config: {},
    _dashboardLiveGraceActive: false,
    _disconnectTeardownT: null,
    _engine: engine,
    _hass: {},
    _mountInProgress: false,
    _started: true,
    _twoWayTalkSession: null,
    _twoWayTalkStarting: false,
    _viewMode: "single",
    _$: (selector) => (selector === "#engine" ? engineHost : null),
    _cancelPendingMount: (...args) => calls.push(["cancel", ...args]),
    _clearLiveEngineSlot: () => calls.push(["clear-slot"]),
    _currentLiveStreamHint: () => "webrtc",
    _findVideoDeep: (target) => (target === engine ? video : null),
    _isCardVisible: () => true,
    _isPreviewPageActive: () => false,
    _mountEngine: () => calls.push(["mount"]),
    _scheduleResumeLive: (reason) => calls.push(["resume", reason]),
    _shouldUseGo2RtcForEntity: () => true,
    _teardownDisconnected: () => calls.push(["teardown"]),
  };
  return { calls, engine, host, video };
};

test("dashboard retention preserves eligible card-owned WebRTC and MSE", () => {
  for (const streamType of ["webrtc", "mse"]) {
    const { calls, host } = createHost();
    host._currentLiveStreamHint = () => streamType;
    const controller = new LiveDashboardRetentionController(host);

    assert.equal(controller.preserveForNavigation(), true);
    assert.equal(host._dashboardLiveGraceActive, true);
    assert.deepEqual(calls, [
      [
        "cancel",
        "same-dashboard-navigation",
        { preserveLiveEntity: "camera.front" },
      ],
      ["clear-slot"],
    ]);
  }
});

test("dashboard retention rejects unsupported or busy live sessions", () => {
  const { calls, host } = createHost();
  const controller = new LiveDashboardRetentionController(host);

  host._mountInProgress = true;
  assert.equal(controller.preserveForNavigation(), false);
  host._mountInProgress = false;
  host._shouldUseGo2RtcForEntity = () => false;
  assert.equal(controller.preserveForNavigation(), false);
  host._shouldUseGo2RtcForEntity = () => true;
  host._currentLiveStreamHint = () => "hls";
  assert.equal(controller.preserveForNavigation(), false);

  assert.deepEqual(calls, []);
  assert.equal(host._dashboardLiveGraceActive, false);
});

test("dashboard scope exit tears down only after the card detaches", () => {
  const { calls, host } = createHost();
  const scheduled = [];
  const cleared = [];
  host._dashboardLiveGraceActive = true;
  host._disconnectTeardownT = 27;
  const controller = new LiveDashboardRetentionController(host, {
    requestFrame: null,
    setTimer: (callback, delay) => {
      scheduled.push({ callback, delay });
      return scheduled.length;
    },
    clearTimer: (timer) => cleared.push(timer),
  });

  controller.handleScopeExited();

  assert.equal(host._dashboardLiveGraceActive, false);
  assert.deepEqual(scheduled.map(({ delay }) => delay), [0]);
  assert.deepEqual(calls, []);

  host.isConnected = false;
  scheduled[0].callback();

  assert.deepEqual(cleared, [27]);
  assert.equal(host._disconnectTeardownT, null);
  assert.deepEqual(calls, [["teardown"]]);
});

test("dashboard settle rebinds retained WebRTC after the page transform", () => {
  const { calls, host } = createHost();
  const frames = [];
  const controller = new LiveDashboardRetentionController(host, {
    requestFrame: (callback) => {
      frames.push(callback);
      return frames.length;
    },
  });

  controller.handleNavigationSettled();
  assert.equal(frames.length, 1);
  frames[0]();

  assert.deepEqual(calls, [
    [
      "cancel",
      "dashboard-swipe-webrtc-rebind",
      { preserveLiveEntity: "camera.front" },
    ],
    ["clear-slot"],
    ["mount"],
  ]);
});

test("dashboard settle schedules recovery when retained media is missing", () => {
  const { calls, host } = createHost();
  const scheduled = [];
  host._engine = null;
  host._findVideoDeep = () => null;
  const controller = new LiveDashboardRetentionController(host, {
    requestFrame: null,
    setTimer: (callback, delay) => {
      scheduled.push({ callback, delay });
      return scheduled.length;
    },
  });

  controller.handleNavigationSettled();
  assert.deepEqual(scheduled.map(({ delay }) => delay), [0]);
  scheduled[0].callback();

  assert.deepEqual(calls, [["resume", "dashboard-swipe-settled"]]);
});
