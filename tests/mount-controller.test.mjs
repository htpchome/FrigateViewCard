import { test } from "node:test";
import assert from "node:assert/strict";

import { createLiveMountController } from "../src/features/live/mount-controller.js";

test("live mount controller delegates ha-direct mounts outside the card shell", async () => {
  const calls = [];
  const slot = { innerHTML: "occupied" };
  const controller = createLiveMountController({
    getSlot: () => slot,
    isPreviewPageActive: () => false,
    getViewMode: () => "single",
    isGridModeAvailable: () => true,
    getMountInProgress: () => false,
    getMountTargetEntity: () => "",
    cancelPendingMount: () => {
      calls.push(["cancelPendingMount"]);
    },
    mountGridEngine: () => {
      calls.push(["mountGridEngine"]);
    },
    beginLiveMountSession: () => ({
      mountToken: 7,
      clearMountState: () => {
        calls.push(["clearMountState"]);
      },
    }),
    cleanupEngine: () => {
      calls.push(["cleanupEngine"]);
    },
    applyLiveMountUiState: (quiet) => {
      calls.push(["applyLiveMountUiState", quiet]);
    },
    applySnapshotFallbackState: () => {
      calls.push(["applySnapshotFallbackState"]);
    },
    getStreamMuted: () => true,
    setEngineMountedMuted: (muted) => {
      calls.push(["setEngineMountedMuted", muted]);
    },
    mseGraceController: {
      takeGraceMseEntry: () => null,
      adoptGraceMseEngine: () => false,
    },
    getMountSeq: () => 7,
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
    resolveUseGo2Rtc: () => false,
  });

  await controller.mount({ entity: "camera.front", quiet: true });

  assert.deepEqual(calls, [
    ["setEngineMountedMuted", true],
    ["cleanupEngine"],
    ["applyLiveMountUiState", true],
    ["setActiveStreamType", "webrtc"],
    [
      "haDirectTryMount",
      slot,
      { streamType: "webrtc" },
      { entity: "camera.front", commit: true },
    ],
    ["setEngineMountedMuted", true],
    ["clearMountState"],
  ]);
});

test("live mount controller delegates go2rtc race mounts outside the card shell", async () => {
  const calls = [];
  const slot = { innerHTML: "occupied" };
  const controller = createLiveMountController({
    getSlot: () => slot,
    isPreviewPageActive: () => false,
    getViewMode: () => "single",
    isGridModeAvailable: () => true,
    getMountInProgress: () => false,
    getMountTargetEntity: () => "",
    cancelPendingMount: () => {},
    mountGridEngine: () => {},
    beginLiveMountSession: () => ({
      mountToken: 9,
      clearMountState: () => {
        calls.push(["clearMountState"]);
      },
    }),
    cleanupEngine: () => {
      calls.push(["cleanupEngine"]);
    },
    applyLiveMountUiState: (quiet) => {
      calls.push(["applyLiveMountUiState", quiet]);
    },
    applySnapshotFallbackState: () => {
      calls.push(["applySnapshotFallbackState"]);
    },
    getStreamMuted: () => false,
    setEngineMountedMuted: (muted) => {
      calls.push(["setEngineMountedMuted", muted]);
    },
    mseGraceController: {
      takeGraceMseEntry: () => null,
      adoptGraceMseEngine: () => false,
    },
    getMountSeq: () => 9,
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
    setActiveStreamType: () => {},
    resolveUseGo2Rtc: () => true,
  });

  await controller.mount({ entity: "camera.front", forcedType: "webrtc" });

  assert.deepEqual(calls, [
    ["setEngineMountedMuted", false],
    ["cleanupEngine"],
    ["applyLiveMountUiState", false],
    [
      "go2rtcRaceMount",
      {
        slot,
        entity: "camera.front",
        forcedType: "webrtc",
        mountToken: 9,
      },
    ],
    ["clearMountState"],
  ]);
});
