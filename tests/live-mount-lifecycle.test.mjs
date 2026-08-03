import { test } from "node:test";
import assert from "node:assert/strict";

import {
  applyMountWatchdogTimeout,
  beginMountTracking,
  clearMountTrackingIfCurrent,
  invalidateMountTrackingIfActive,
  isLiveVideoStale,
  resolveLiveKickProbeState,
  resolveLiveKickIfStaleAction,
  resolveLiveMountEntryAction,
  resolveLiveMountTransportPlan,
  resolveLiveMountUiState,
  resolveLiveResumeAction,
  shouldRunMountWatchdog,
} from "../src/live/live-mount-lifecycle.js";

test("beginMountTracking increments token and sets active state", () => {
  const result = beginMountTracking({ mountSeq: 4, entity: "camera.front" });

  assert.equal(result.mountToken, 5);
  assert.deepEqual(result.nextState, {
    mountSeq: 5,
    mountInProgress: true,
    mountStartedAt: result.nextState.mountStartedAt,
    mountTargetEntity: "camera.front",
  });
  assert.equal(typeof result.nextState.mountStartedAt, "number");
});

test("clearMountTrackingIfCurrent clears only for current token", () => {
  const unchanged = clearMountTrackingIfCurrent({
    mountSeq: 7,
    mountToken: 6,
    mountInProgress: true,
    mountStartedAt: 123,
    mountTargetEntity: "camera.a",
  });
  assert.deepEqual(unchanged, {
    mountSeq: 7,
    mountInProgress: true,
    mountStartedAt: 123,
    mountTargetEntity: "camera.a",
  });

  const cleared = clearMountTrackingIfCurrent({
    mountSeq: 7,
    mountToken: 7,
    mountInProgress: true,
    mountStartedAt: 123,
    mountTargetEntity: "camera.a",
  });
  assert.deepEqual(cleared, {
    mountSeq: 7,
    mountInProgress: false,
    mountStartedAt: 0,
    mountTargetEntity: "",
  });
});

test("invalidateMountTrackingIfActive bumps sequence and clears", () => {
  const unchanged = invalidateMountTrackingIfActive({
    mountSeq: 2,
    mountInProgress: false,
    mountStartedAt: 0,
    mountTargetEntity: "",
  });
  assert.deepEqual(unchanged, {
    mountSeq: 2,
    mountInProgress: false,
    mountStartedAt: 0,
    mountTargetEntity: "",
  });

  const invalidated = invalidateMountTrackingIfActive({
    mountSeq: 2,
    mountInProgress: true,
    mountStartedAt: 9,
    mountTargetEntity: "camera.x",
  });
  assert.deepEqual(invalidated, {
    mountSeq: 3,
    mountInProgress: false,
    mountStartedAt: 0,
    mountTargetEntity: "",
  });
});

test("watchdog helpers respect active token and timeout transition", () => {
  assert.equal(
    shouldRunMountWatchdog({
      mountInProgress: true,
      mountSeq: 4,
      mountToken: 4,
    }),
    true,
  );
  assert.equal(
    shouldRunMountWatchdog({
      mountInProgress: false,
      mountSeq: 4,
      mountToken: 4,
    }),
    false,
  );
  assert.equal(
    shouldRunMountWatchdog({
      mountInProgress: true,
      mountSeq: 4,
      mountToken: 3,
    }),
    false,
  );

  const timedOut = applyMountWatchdogTimeout({ mountSeq: 4 });
  assert.deepEqual(timedOut, {
    mountSeq: 5,
    mountInProgress: false,
    mountStartedAt: 0,
    mountTargetEntity: "",
  });
});

test("resolveLiveResumeAction invalidates stuck mounts and kicks when visible", () => {
  const action = resolveLiveResumeAction({
    started: true,
    hass: {},
    config: {},
    previewPageActive: false,
    visible: true,
    popupOpen: false,
    mountSeq: 8,
    mountInProgress: true,
    mountStartedAt: 1000,
    mountTargetEntity: "camera.front",
    nowMs: 14050,
  });

  assert.deepEqual(action, {
    shouldRetry: false,
    shouldKickNow: true,
    shouldRevealEngineWrap: true,
    retryDelayMs: 0,
    safetyKickDelayMs: 900,
    nextMountState: {
      mountSeq: 9,
      mountInProgress: false,
      mountStartedAt: 0,
      mountTargetEntity: "",
    },
  });
});

test("resolveLiveResumeAction retries while hidden or blocked", () => {
  const action = resolveLiveResumeAction({
    started: true,
    hass: {},
    config: {},
    previewPageActive: false,
    visible: false,
    popupOpen: false,
    mountSeq: 4,
    mountInProgress: false,
    mountStartedAt: 0,
    mountTargetEntity: "",
  });

  assert.deepEqual(action, {
    shouldRetry: true,
    shouldKickNow: false,
    shouldRevealEngineWrap: false,
    retryDelayMs: 450,
    safetyKickDelayMs: 0,
    nextMountState: null,
  });
});

test("resolveLiveResumeAction suppresses timing outputs when resume cannot run", () => {
  const action = resolveLiveResumeAction({
    started: false,
    hass: {},
    config: {},
    previewPageActive: false,
    visible: true,
    popupOpen: false,
    mountSeq: 1,
    mountInProgress: false,
    mountStartedAt: 0,
    mountTargetEntity: "",
  });

  assert.deepEqual(action, {
    shouldRetry: false,
    shouldKickNow: false,
    shouldRevealEngineWrap: false,
    retryDelayMs: 0,
    safetyKickDelayMs: 0,
    nextMountState: null,
  });
});

test("isLiveVideoStale treats missing readiness and paused decoded frames as stale", () => {
  assert.equal(
    isLiveVideoStale({ readyState: 1, ended: false, paused: false }),
    true,
  );
  assert.equal(
    isLiveVideoStale({
      readyState: 3,
      ended: false,
      paused: true,
      currentTime: 0.5,
      decodedFrames: 3,
    }),
    true,
  );
  assert.equal(
    isLiveVideoStale({
      readyState: 3,
      ended: false,
      paused: false,
      currentTime: 0.5,
      decodedFrames: 3,
    }),
    false,
  );
});

test("resolveLiveKickProbeState maps live video fields for stale checks", () => {
  assert.deepEqual(
    resolveLiveKickProbeState({
      video: {
        readyState: 3,
        ended: false,
        paused: true,
        currentTime: 1.25,
        webkitDecodedFrameCount: 9,
      },
    }),
    {
      hasVideo: true,
      videoState: {
        readyState: 3,
        ended: false,
        paused: true,
        currentTime: 1.25,
        decodedFrames: 9,
      },
    },
  );

  assert.deepEqual(resolveLiveKickProbeState({ video: null }), {
    hasVideo: false,
    videoState: null,
  });
});

test("resolveLiveKickIfStaleAction gates on cooldown and MSE traffic", () => {
  const coolingDown = resolveLiveKickIfStaleAction({
    started: true,
    hass: {},
    config: {},
    previewPageActive: false,
    viewMode: "single",
    visible: true,
    popupOpen: false,
    mountInProgress: false,
    force: false,
    streamLoadingVisible: false,
    lastLiveKick: 9000,
    nowMs: 12000,
    hasVideo: false,
  });
  assert.deepEqual(coolingDown, {
    shouldKick: false,
    nextLastLiveKick: 9000,
  });

  const recentMse = resolveLiveKickIfStaleAction({
    started: true,
    hass: {},
    config: {},
    previewPageActive: false,
    viewMode: "single",
    visible: true,
    popupOpen: false,
    mountInProgress: false,
    force: false,
    streamLoadingVisible: false,
    lastLiveKick: 0,
    nowMs: 12000,
    isFirefox: true,
    mseConnectAt: 1000,
    mseLastChunkAt: 11000,
    hasVideo: false,
  });
  assert.deepEqual(recentMse, {
    shouldKick: false,
    nextLastLiveKick: 0,
  });
});

test("resolveLiveKickIfStaleAction kicks stale video and updates kick timestamp", () => {
  const action = resolveLiveKickIfStaleAction({
    started: true,
    hass: {},
    config: {},
    previewPageActive: false,
    viewMode: "single",
    visible: true,
    popupOpen: false,
    mountInProgress: false,
    force: false,
    streamLoadingVisible: false,
    lastLiveKick: 1000,
    nowMs: 7000,
    hasVideo: true,
    videoState: {
      readyState: 1,
      ended: false,
      paused: false,
      currentTime: 0,
      decodedFrames: 0,
    },
  });

  assert.deepEqual(action, {
    shouldKick: true,
    nextLastLiveKick: 7000,
  });
});

test("resolveLiveMountEntryAction classifies pre-mount early returns", () => {
  assert.deepEqual(
    resolveLiveMountEntryAction({
      hasSlot: false,
      previewPageActive: false,
      viewMode: "single",
      gridModeAvailable: false,
      entity: "camera.front",
      mountInProgress: false,
      mountTargetEntity: "",
    }),
    { type: "missing-slot" },
  );
  assert.deepEqual(
    resolveLiveMountEntryAction({
      hasSlot: true,
      previewPageActive: true,
      viewMode: "single",
      gridModeAvailable: false,
      entity: "camera.front",
      mountInProgress: false,
      mountTargetEntity: "",
    }),
    { type: "preview" },
  );
  assert.deepEqual(
    resolveLiveMountEntryAction({
      hasSlot: true,
      previewPageActive: false,
      viewMode: "grid",
      gridModeAvailable: true,
      entity: "camera.front",
      mountInProgress: false,
      mountTargetEntity: "",
    }),
    { type: "grid" },
  );
  assert.deepEqual(
    resolveLiveMountEntryAction({
      hasSlot: true,
      previewPageActive: false,
      viewMode: "single",
      gridModeAvailable: false,
      entity: "",
      mountInProgress: false,
      mountTargetEntity: "",
    }),
    { type: "missing-entity" },
  );
  assert.deepEqual(
    resolveLiveMountEntryAction({
      hasSlot: true,
      previewPageActive: false,
      viewMode: "single",
      gridModeAvailable: false,
      entity: "camera.front",
      mountInProgress: true,
      mountTargetEntity: "camera.front",
    }),
    { type: "duplicate" },
  );
});

test("resolveLiveMountEntryAction proceeds with entity when mount can continue", () => {
  assert.deepEqual(
    resolveLiveMountEntryAction({
      hasSlot: true,
      previewPageActive: false,
      viewMode: "single",
      gridModeAvailable: false,
      entity: "camera.front",
      mountInProgress: true,
      mountTargetEntity: "camera.side",
    }),
    {
      type: "proceed",
      entity: "camera.front",
    },
  );
});

test("resolveLiveMountUiState shapes loading and fallback state for quiet and normal mounts", () => {
  assert.deepEqual(resolveLiveMountUiState(), {
    activeStreamType: "--",
    fallbackVisible: true,
    refreshFallbackImage: true,
    loading: true,
  });
  assert.deepEqual(resolveLiveMountUiState({ quiet: true }), {
    activeStreamType: null,
    fallbackVisible: false,
    refreshFallbackImage: false,
    loading: false,
  });
});

test("resolveLiveMountTransportPlan selects ha-direct stream type or go2rtc mode", () => {
  assert.deepEqual(
    resolveLiveMountTransportPlan({
      useGo2Rtc: false,
      forcedType: "hls",
      preferredStreamType: "webrtc",
    }),
    {
      mode: "ha-direct",
      streamType: "hls",
    },
  );
  assert.deepEqual(
    resolveLiveMountTransportPlan({
      useGo2Rtc: false,
      forcedType: null,
      preferredStreamType: "webrtc",
    }),
    {
      mode: "ha-direct",
      streamType: "webrtc",
    },
  );
  assert.deepEqual(
    resolveLiveMountTransportPlan({
      useGo2Rtc: true,
      forcedType: "mse",
      preferredStreamType: "webrtc",
    }),
    {
      mode: "go2rtc",
      streamType: null,
    },
  );
});
