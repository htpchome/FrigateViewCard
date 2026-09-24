import { test } from "node:test";
import assert from "node:assert/strict";

import {
  getLiveMountStateController,
  LiveMountStateController,
} from "../src/features/live/mount-state.ctrl.js";

const createHost = () => {
  const calls = [];
  const engineSlot = { innerHTML: "mounted" };
  const host = {
    _engineMountedMuted: false,
    _mountInProgress: true,
    _mountSeq: 4,
    _mountStartedAt: 125,
    _mountTargetEntity: "camera.front",
    _rotateOverlayActive: true,
    _streamMuted: true,
    _go2rtcRaceMounter: {
      cancelPendingWebRtcAttempts: () => calls.push(["cancelWebRtc"]),
    },
    _mseGraceController: {
      cleanupEngine: (options) => {
        calls.push(["cleanupEngine", options]);
        return "cleaned";
      },
    },
    _$: (selector) => (selector === "#engine" ? engineSlot : null),
    _assignLiveEngine: (engine) => calls.push(["assignEngine", engine]),
    _setActiveStreamType: (type) =>
      calls.push(["setActiveStreamType", type]),
    _setStreamLoading: (loading) =>
      calls.push(["setStreamLoading", loading]),
    _setStreamFallbackVisible: (visible) =>
      calls.push(["setStreamFallbackVisible", visible]),
    _setLiveNativeControls: (enabled) =>
      calls.push(["setLiveNativeControls", enabled]),
  };
  return { calls, engineSlot, host };
};

test("live mount state controller cleans transports before the mounted engine", () => {
  const { calls, host } = createHost();
  const controller = new LiveMountStateController(host);
  const options = { preserveLiveEntity: "camera.front" };

  assert.equal(controller.cleanupEngine(options), "cleaned");
  assert.deepEqual(calls, [
    ["cancelWebRtc"],
    ["cleanupEngine", options],
  ]);
});

test("live mount state controller clears the live engine slot", () => {
  const { engineSlot, host } = createHost();
  const controller = new LiveMountStateController(host);

  controller.clearEngineSlot();

  assert.equal(engineSlot.innerHTML, "");
});

test("live mount state controller invalidates active tracking before cleanup", () => {
  const { calls, host } = createHost();
  const controller = new LiveMountStateController(host);
  const options = { preservePendingWebRtc: true };

  assert.equal(controller.cancelPendingMount("camera-switch", options), undefined);
  assert.deepEqual(
    {
      mountSeq: host._mountSeq,
      mountInProgress: host._mountInProgress,
      mountStartedAt: host._mountStartedAt,
      mountTargetEntity: host._mountTargetEntity,
    },
    {
      mountSeq: 5,
      mountInProgress: false,
      mountStartedAt: 0,
      mountTargetEntity: "",
    },
  );
  assert.deepEqual(calls, [
    ["cancelWebRtc"],
    ["cleanupEngine", options],
  ]);
});

test("live mount state controller preserves inactive tracking during cleanup", () => {
  const { host } = createHost();
  host._mountInProgress = false;
  const controller = new LiveMountStateController(host);

  controller.cancelPendingMount("inactive");

  assert.deepEqual(
    {
      mountSeq: host._mountSeq,
      mountInProgress: host._mountInProgress,
      mountStartedAt: host._mountStartedAt,
      mountTargetEntity: host._mountTargetEntity,
    },
    {
      mountSeq: 4,
      mountInProgress: false,
      mountStartedAt: 125,
      mountTargetEntity: "camera.front",
    },
  );
});

test("live mount state controller applies tracking state", () => {
  const { host } = createHost();
  const controller = new LiveMountStateController(host);

  controller.applyTrackingState({
    mountSeq: 9,
    mountInProgress: false,
    mountStartedAt: 0,
    mountTargetEntity: "",
  });

  assert.equal(host._mountSeq, 9);
  assert.equal(host._mountInProgress, false);
  assert.equal(host._mountStartedAt, 0);
  assert.equal(host._mountTargetEntity, "");
});

test("live mount state controller adopts a completed live attempt", () => {
  const { calls, host } = createHost();
  const controller = new LiveMountStateController(host);
  let recoveryActivated = false;
  const resultSlot = {
    parentNode: null,
    remove() {},
    style: {},
  };
  const targetSlot = {
    children: [],
    appendChild(child) {
      child.parentNode = this;
      this.children.push(child);
    },
  };
  const engine = {
    activateRecovery: () => {
      recoveryActivated = true;
    },
  };

  assert.equal(
    controller.adoptAttemptResult(
      targetSlot,
      { engine, slot: resultSlot, type: "mse" },
      { preservePendingSlots: true },
    ),
    true,
  );
  assert.equal(recoveryActivated, true);
  assert.equal(host._engineMountedMuted, true);
  assert.equal(resultSlot.parentNode, targetSlot);
  assert.deepEqual(calls, [
    ["assignEngine", engine],
    ["setActiveStreamType", "mse"],
    ["setStreamLoading", false],
    ["setStreamFallbackVisible", false],
    ["setLiveNativeControls", true],
  ]);
});

test("live mount state controller getter preserves an existing controller", () => {
  const { host } = createHost();
  const controller = new LiveMountStateController(host);
  host._liveMountStateController = controller;

  assert.equal(getLiveMountStateController(host), controller);
});
