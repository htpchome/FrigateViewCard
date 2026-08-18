import { test } from "node:test";
import assert from "node:assert/strict";

import { createLiveMountController } from "../src/features/live/mount-controller.js";

test("live mount controller delegates ha-direct mounts outside the card shell", async () => {
  const calls = [];
  const slot = { innerHTML: "occupied" };
  let mountState = {
    mountSeq: 6,
    mountInProgress: false,
    mountStartedAt: 0,
    mountTargetEntity: "",
  };
  const controller = createLiveMountController({
    getSlot: () => slot,
    isPreviewPageActive: () => false,
    getViewMode: () => "single",
    isGridModeAvailable: () => true,
    getMountInProgress: () => false,
    getMountTargetEntity: () => "",
    getMountState: () => mountState,
    applyMountTrackingState: (nextState) => {
      mountState = nextState;
      calls.push(["applyMountTrackingState", nextState]);
    },
    cancelPendingMount: () => {
      calls.push(["cancelPendingMount"]);
    },
    mountGridEngine: () => {
      calls.push(["mountGridEngine"]);
    },
    cleanupEngine: () => {
      calls.push(["cleanupEngine"]);
    },
    getStreamMuted: () => true,
    setEngineMountedMuted: (muted) => {
      calls.push(["setEngineMountedMuted", muted]);
    },
    mseGraceController: {
      takeGraceMseEntry: () => null,
      adoptGraceMseEngine: () => false,
    },
    getPendingMountDestroyers: () => [],
    setPendingMountDestroyers: () => {},
    haDirectMounter: {
      tryMount: async (...args) => {
        calls.push(["haDirectTryMount", ...args]);
        return { ok: true };
      },
    },
    go2rtcRaceMounter: {
      mountWithRace: async (...args) => {
        calls.push(["go2rtcRaceMount", ...args]);
        return false;
      },
    },
    preferredStreamType: () => "webrtc",
    setActiveStreamType: (type) => {
      calls.push(["setActiveStreamType", type]);
    },
    setStreamLoading: (loading) => {
      calls.push(["setStreamLoading", loading]);
    },
    setStreamFallbackVisible: (visible, refreshImage = false) => {
      calls.push(["setStreamFallbackVisible", visible, refreshImage]);
    },
    scheduleResumeLive: (reason) => {
      calls.push(["scheduleResumeLive", reason]);
    },
    resolveUseGo2Rtc: () => false,
  });

  await controller.mount({ entity: "camera.front", quiet: true });

  assert.deepEqual(calls[0], ["setEngineMountedMuted", true]);
  assert.equal(calls[1][0], "applyMountTrackingState");
  assert.equal(calls[1][1].mountSeq, 7);
  assert.equal(calls[1][1].mountInProgress, true);
  assert.equal(calls[1][1].mountTargetEntity, "camera.front");
  assert.equal(calls[1][1].mountStartedAt > 0, true);
  assert.deepEqual(calls[2], ["cleanupEngine"]);
  assert.deepEqual(calls[3], ["setStreamFallbackVisible", false, false]);
  assert.deepEqual(calls[4], ["setStreamLoading", false]);
  assert.deepEqual(calls[5], ["setActiveStreamType", "webrtc"]);
  assert.deepEqual(calls[6], [
    "haDirectTryMount",
    slot,
    { streamType: "webrtc" },
    { entity: "camera.front", commit: true },
  ]);
  assert.deepEqual(calls[7], ["setEngineMountedMuted", true]);
  assert.equal(calls[8][0], "applyMountTrackingState");
  assert.equal(calls[8][1].mountSeq, 7);
  assert.equal(calls[8][1].mountInProgress, false);
  assert.equal(calls[8][1].mountStartedAt, 0);
  assert.equal(calls[8][1].mountTargetEntity, "");
  assert.equal(mountState.mountSeq, 7);
  assert.equal(mountState.mountInProgress, false);
});

test("live mount controller delegates go2rtc race mounts outside the card shell", async () => {
  const calls = [];
  const slot = { innerHTML: "occupied" };
  let mountState = {
    mountSeq: 8,
    mountInProgress: false,
    mountStartedAt: 0,
    mountTargetEntity: "",
  };
  const controller = createLiveMountController({
    getSlot: () => slot,
    isPreviewPageActive: () => false,
    getViewMode: () => "single",
    isGridModeAvailable: () => true,
    getMountInProgress: () => false,
    getMountTargetEntity: () => "",
    getMountState: () => mountState,
    applyMountTrackingState: (nextState) => {
      mountState = nextState;
      calls.push(["applyMountTrackingState", nextState]);
    },
    cancelPendingMount: () => {},
    mountGridEngine: () => {},
    cleanupEngine: () => {
      calls.push(["cleanupEngine"]);
    },
    getStreamMuted: () => false,
    setEngineMountedMuted: (muted) => {
      calls.push(["setEngineMountedMuted", muted]);
    },
    mseGraceController: {
      takeGraceMseEntry: () => null,
      adoptGraceMseEngine: () => false,
    },
    getPendingMountDestroyers: () => [],
    setPendingMountDestroyers: () => {},
    haDirectMounter: {
      tryMount: async () => ({ ok: false }),
    },
    go2rtcRaceMounter: {
      mountWithRace: async (options) => {
        calls.push(["go2rtcRaceMount", options]);
        return true;
      },
    },
    preferredStreamType: () => "webrtc",
    setActiveStreamType: (type) => {
      calls.push(["setActiveStreamType", type]);
    },
    setStreamLoading: (loading) => {
      calls.push(["setStreamLoading", loading]);
    },
    setStreamFallbackVisible: (visible, refreshImage = false) => {
      calls.push(["setStreamFallbackVisible", visible, refreshImage]);
    },
    scheduleResumeLive: (reason) => {
      calls.push(["scheduleResumeLive", reason]);
    },
    resolveUseGo2Rtc: () => true,
  });

  await controller.mount({ entity: "camera.front", forcedType: "webrtc" });

  assert.deepEqual(calls[0], ["setEngineMountedMuted", false]);
  assert.equal(calls[1][0], "applyMountTrackingState");
  assert.equal(calls[1][1].mountSeq, 9);
  assert.equal(calls[1][1].mountInProgress, true);
  assert.equal(calls[1][1].mountTargetEntity, "camera.front");
  assert.equal(calls[1][1].mountStartedAt > 0, true);
  assert.deepEqual(calls[2], ["cleanupEngine"]);
  assert.deepEqual(calls[3], ["setActiveStreamType", "--"]);
  assert.deepEqual(calls[4], ["setStreamFallbackVisible", true, true]);
  assert.deepEqual(calls[5], ["setStreamLoading", true]);
  assert.deepEqual(calls[6], [
    "go2rtcRaceMount",
    {
      slot,
      entity: "camera.front",
      forcedType: "webrtc",
      mountToken: 9,
    },
  ]);
  assert.equal(calls[7][0], "applyMountTrackingState");
  assert.equal(calls[7][1].mountSeq, 9);
  assert.equal(calls[7][1].mountInProgress, false);
  assert.equal(calls[7][1].mountStartedAt, 0);
  assert.equal(calls[7][1].mountTargetEntity, "");
});

test("live mount controller reuses a cached WebRTC engine before starting a race", async () => {
  const calls = [];
  const slot = { innerHTML: "occupied" };
  const cachedEngine = { video: {} };
  const controller = createLiveMountController({
    getSlot: () => slot,
    isPreviewPageActive: () => false,
    getViewMode: () => "single",
    isGridModeAvailable: () => true,
    getMountInProgress: () => false,
    getMountTargetEntity: () => "",
    getMountState: () => ({
      mountSeq: 1,
      mountInProgress: false,
      mountStartedAt: 0,
      mountTargetEntity: "",
    }),
    applyMountTrackingState: () => {},
    cancelPendingMount: () => {},
    mountGridEngine: () => {},
    cleanupEngine: () => calls.push("cleanup"),
    getStreamMuted: () => true,
    setEngineMountedMuted: () => {},
    mseGraceController: {
      takeGraceWebRtcEntry: (entity) => {
        calls.push(["take-webrtc", entity]);
        return { engine: cachedEngine };
      },
      adoptGraceWebRtcEngine: (targetSlot, engine) => {
        calls.push(["adopt-webrtc", targetSlot, engine]);
        return true;
      },
      takeGraceMseEntry: () => {
        throw new Error("MSE cache should not be checked after WebRTC reuse");
      },
      adoptGraceMseEngine: () => false,
    },
    getPendingMountDestroyers: () => [],
    setPendingMountDestroyers: () => {},
    haDirectMounter: {
      tryMount: async () => {
        throw new Error("HA mount should not run after WebRTC reuse");
      },
    },
    go2rtcRaceMounter: {
      mountWithRace: async () => {
        throw new Error("Transport race should not run after WebRTC reuse");
      },
    },
    preferredStreamType: () => "webrtc",
    setActiveStreamType: () => {},
    setStreamLoading: () => {},
    setStreamFallbackVisible: () => {},
    scheduleResumeLive: () => {},
    resolveUseGo2Rtc: () => true,
  });

  await controller.mount({ entity: "camera.front" });

  assert.deepEqual(calls, [
    ["take-webrtc", "camera.front"],
    ["adopt-webrtc", slot, cachedEngine],
  ]);
});
