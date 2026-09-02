import { test } from "node:test";
import assert from "node:assert/strict";

import { createLiveMountController } from "../src/features/live/mount-controller.js";

test("grid mounts do not cancel the existing main live session", async () => {
  let cancelCount = 0;
  let gridMountCount = 0;
  const controller = createLiveMountController({
    getSlot: () => ({}),
    isPreviewPageActive: () => false,
    getViewMode: () => "grid",
    isGridModeAvailable: () => true,
    getMountInProgress: () => false,
    getMountTargetEntity: () => "",
    cancelPendingMount: () => {
      cancelCount += 1;
    },
    mountGridEngine: () => {
      gridMountCount += 1;
    },
  });

  await controller.mount({ entity: "camera.front" });

  assert.equal(gridMountCount, 1);
  assert.equal(cancelCount, 0);
});

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

test("failed pending MSE reuse falls through to a fresh transport race", async () => {
  const calls = [];
  const slot = { innerHTML: "occupied" };
  let mountState = {
    mountSeq: 0,
    mountInProgress: false,
    mountStartedAt: 0,
    mountTargetEntity: "",
  };
  let pendingDestroyers = [];
  let graceEntryAvailable = true;
  const controller = createLiveMountController({
    getSlot: () => slot,
    isPreviewPageActive: () => false,
    getViewMode: () => "single",
    isGridModeAvailable: () => true,
    getMountInProgress: () => mountState.mountInProgress,
    getMountTargetEntity: () => mountState.mountTargetEntity,
    getMountState: () => mountState,
    applyMountTrackingState: (nextState) => {
      mountState = nextState;
    },
    mountGridEngine: () => {},
    cleanupEngine: () => calls.push("cleanup"),
    getStreamMuted: () => true,
    setEngineMountedMuted: () => {},
    mseGraceController: {
      takeGraceWebRtcEntry: () => null,
      adoptGraceWebRtcEngine: () => false,
      takeGraceMseEntry: () => {
        if (!graceEntryAvailable) return null;
        graceEntryAvailable = false;
        return { promise: Promise.resolve(null) };
      },
      adoptGraceMseEngine: () => false,
    },
    getPendingMountDestroyers: () => pendingDestroyers,
    setPendingMountDestroyers: (nextDestroyers) => {
      pendingDestroyers = nextDestroyers;
    },
    haDirectMounter: { tryMount: async () => ({ ok: false }) },
    go2rtcRaceMounter: {
      mountWithRace: async (options) => {
        calls.push(["race", options.entity]);
        return true;
      },
    },
    preferredStreamType: () => "webrtc",
    setActiveStreamType: (type) => calls.push(["type", type]),
    setStreamLoading: (loading) => calls.push(["loading", loading]),
    setStreamFallbackVisible: () => {},
    scheduleResumeLive: () => {},
    resolveUseGo2Rtc: () => true,
  });

  await controller.mount({ entity: "camera.front" });

  assert.equal(calls.filter((call) => call === "cleanup").length, 1);
  assert.deepEqual(
    calls.filter((call) => Array.isArray(call) && call[0] === "race"),
    [["race", "camera.front"]],
  );
  assert.equal(
    calls.filter(
      (call) => Array.isArray(call) && call[0] === "loading" && call[1],
    ).length,
    2,
  );
  assert.equal(mountState.mountSeq, 2);
  assert.equal(mountState.mountInProgress, false);
  assert.deepEqual(pendingDestroyers, []);
});

test("a cancelled camera mount cannot replace the next camera with Snapshot state", async () => {
  const calls = [];
  const slot = { innerHTML: "occupied" };
  let mountState = {
    mountSeq: 0,
    mountInProgress: false,
    mountStartedAt: 0,
    mountTargetEntity: "",
  };
  const controller = createLiveMountController({
    getSlot: () => slot,
    isPreviewPageActive: () => false,
    getViewMode: () => "single",
    isGridModeAvailable: () => true,
    getMountInProgress: () => mountState.mountInProgress,
    getMountTargetEntity: () => mountState.mountTargetEntity,
    getMountState: () => mountState,
    applyMountTrackingState: (nextState) => {
      mountState = nextState;
    },
    mountGridEngine: () => {},
    cleanupEngine: () => {},
    getStreamMuted: () => true,
    setEngineMountedMuted: () => {},
    mseGraceController: {
      takeGraceWebRtcEntry: () => null,
      takeGraceMseEntry: () => null,
    },
    getPendingMountDestroyers: () => [],
    setPendingMountDestroyers: () => {},
    haDirectMounter: { tryMount: async () => ({ ok: false }) },
    go2rtcRaceMounter: {
      mountWithRace: async () => {
        mountState = {
          mountSeq: mountState.mountSeq + 1,
          mountInProgress: true,
          mountStartedAt: Date.now(),
          mountTargetEntity: "camera.group_a",
        };
        return false;
      },
    },
    preferredStreamType: () => "webrtc",
    setActiveStreamType: (type) => calls.push(["type", type]),
    setStreamLoading: (loading) => calls.push(["loading", loading]),
    setStreamFallbackVisible: (visible) =>
      calls.push(["fallback", visible]),
    scheduleResumeLive: () => {},
    resolveUseGo2Rtc: () => true,
  });

  const mounted = await controller.mount({ entity: "camera.transient" });

  assert.equal(mounted, false);
  assert.equal(
    calls.some(([kind, value]) => kind === "type" && value === "snapshot"),
    false,
  );
  assert.equal(mountState.mountTargetEntity, "camera.group_a");
});

test("duplicate live mounts keep non-quiet connection feedback visible", async () => {
  const calls = [];
  const controller = createLiveMountController({
    getSlot: () => ({}),
    isPreviewPageActive: () => false,
    getViewMode: () => "single",
    isGridModeAvailable: () => true,
    getMountInProgress: () => true,
    getMountTargetEntity: () => "camera.front",
    setActiveStreamType: (type) => calls.push(["type", type]),
    setStreamLoading: (loading) => calls.push(["loading", loading]),
    go2rtcRaceMounter: {
      mountWithRace: async () => {
        calls.push("race");
        return true;
      },
    },
  });

  await controller.mount({ entity: "camera.front" });

  assert.deepEqual(calls, [
    ["type", "--"],
    ["loading", true],
  ]);
});

test("go2rtc talk mounts bypass receive-only grace reuse and pass microphone options", async () => {
  const slot = { innerHTML: "occupied" };
  let mountState = {
    mountSeq: 2,
    mountInProgress: false,
    mountStartedAt: 0,
    mountTargetEntity: "",
  };
  let raceOptions = null;
  const microphoneStream = { id: "microphone" };
  const onEnded = () => {};
  const controller = createLiveMountController({
    getSlot: () => slot,
    isPreviewPageActive: () => false,
    getViewMode: () => "single",
    isGridModeAvailable: () => true,
    getMountInProgress: () => mountState.mountInProgress,
    getMountTargetEntity: () => mountState.mountTargetEntity,
    getMountState: () => mountState,
    applyMountTrackingState: (nextState) => {
      mountState = nextState;
    },
    mountGridEngine: () => {},
    cleanupEngine: () => {},
    getStreamMuted: () => true,
    setEngineMountedMuted: () => {},
    mseGraceController: {
      takeGraceWebRtcEntry: () => {
        throw new Error("talk must not reuse a receive-only WebRTC peer");
      },
      takeGraceMseEntry: () => null,
    },
    getPendingMountDestroyers: () => [],
    setPendingMountDestroyers: () => {},
    haDirectMounter: { tryMount: async () => ({ ok: false }) },
    go2rtcRaceMounter: {
      mountWithRace: async (options) => {
        raceOptions = options;
        return true;
      },
    },
    preferredStreamType: () => "webrtc",
    setActiveStreamType: () => {},
    setStreamLoading: () => {},
    setStreamFallbackVisible: () => {},
    scheduleResumeLive: () => {},
    resolveUseGo2Rtc: () => true,
  });

  const mounted = await controller.mount({
    entity: "camera.front",
    forcedType: "webrtc",
    twoWayTalkOptions: { microphoneStream, onEnded },
  });

  assert.equal(mounted, true);
  assert.deepEqual(raceOptions, {
    slot,
    entity: "camera.front",
    forcedType: "webrtc",
    mountToken: 3,
    webRtcOptions: { microphoneStream, onEnded },
  });
});

test("ha-direct talk mounts use only the Home Assistant talk pipeline", async () => {
  const slot = { innerHTML: "occupied" };
  let mountState = {
    mountSeq: 4,
    mountInProgress: false,
    mountStartedAt: 0,
    mountTargetEntity: "",
  };
  let talkMountOptions = null;
  const microphoneStream = { id: "microphone" };
  const controller = createLiveMountController({
    getSlot: () => slot,
    isPreviewPageActive: () => false,
    getViewMode: () => "single",
    isGridModeAvailable: () => true,
    getMountInProgress: () => mountState.mountInProgress,
    getMountTargetEntity: () => mountState.mountTargetEntity,
    getMountState: () => mountState,
    applyMountTrackingState: (nextState) => {
      mountState = nextState;
    },
    mountGridEngine: () => {},
    cleanupEngine: () => {},
    getStreamMuted: () => false,
    setEngineMountedMuted: () => {},
    mseGraceController: {
      takeGraceWebRtcEntry: () => null,
      takeGraceMseEntry: () => null,
    },
    getPendingMountDestroyers: () => [],
    setPendingMountDestroyers: () => {},
    haDirectMounter: {
      tryMount: async () => {
        throw new Error("normal HA player must not mount for talk");
      },
    },
    haDirectTwoWayTalkMounter: {
      tryMount: async (_slot, _startup, options) => {
        talkMountOptions = options;
        return { ok: true };
      },
    },
    go2rtcRaceMounter: {
      mountWithRace: async () => {
        throw new Error("go2rtc path must not mount for ha_direct");
      },
    },
    preferredStreamType: () => "webrtc",
    setActiveStreamType: () => {},
    setStreamLoading: () => {},
    setStreamFallbackVisible: () => {},
    scheduleResumeLive: () => {},
    resolveUseGo2Rtc: () => false,
  });

  const mounted = await controller.mount({
    entity: "camera.front",
    forcedType: "webrtc",
    twoWayTalkOptions: { microphoneStream },
  });

  assert.equal(mounted, true);
  assert.deepEqual(talkMountOptions, {
    entity: "camera.front",
    commit: true,
    microphoneStream,
  });
});
