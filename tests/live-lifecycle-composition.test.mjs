import { test } from "node:test";
import assert from "node:assert/strict";

import {
  MSE_SWITCH_GRACE_MAX,
  MSE_SWITCH_GRACE_MS,
} from "../src/constants.js";
import { buildEditorLiveHandoffKey } from "../src/features/editor-preview/context.ctrl.js";
import { createLiveLifecycleControllers } from "../src/features/live/lifecycle-composition.js";

test("live lifecycle composition preserves grace, handoff, and mount wiring", () => {
  const optionsByFactory = {};
  const calls = [];
  const engineSlot = { id: "engine" };
  const gridSlot = { id: "grid-engine" };
  const mseGraceController = {
    isHaDirectEngineReusable: (engine) => engine === "ha-engine",
    isMseEngineReusable: (engine) => engine === "mse-engine",
    isWebRtcEngineReusable: (engine) => engine === "webrtc-engine",
    adoptGraceHaDirectEngine: (slot, engine) => {
      calls.push(["adopt-ha", slot, engine]);
      return true;
    },
    adoptGraceMseEngine: (slot, engine) => {
      calls.push(["adopt-mse", slot, engine]);
      return true;
    },
    adoptGraceWebRtcEngine: (slot, engine) => {
      calls.push(["adopt-webrtc", slot, engine]);
      return true;
    },
  };
  const editorLiveHandoffController = {
    take: (...args) => {
      calls.push(["take-handoff", ...args]);
      return "handoff";
    },
  };
  const liveMountController = { name: "live-mount" };
  const factories = {
    createMseGraceController: (options) => {
      optionsByFactory.mseGrace = options;
      return mseGraceController;
    },
    createEditorLiveHandoffController: (options) => {
      optionsByFactory.editorHandoff = options;
      return editorLiveHandoffController;
    },
    createLiveMountController: (options) => {
      optionsByFactory.liveMount = options;
      return liveMountController;
    },
  };
  const haDirectMounter = {
    release: (engine) => calls.push(["release-ha", engine]),
    adoptRetainedWebRtcEngine: (engine) =>
      calls.push(["adopt-retained-ha", engine]),
    detachWebRtcForHandoff: (engine) => engine !== "blocked-engine",
  };
  const card = {
    shadowRoot: {
      querySelector: (selector) =>
        selector === "#engine" ? engineSlot : null,
    },
    isConnected: true,
    _activeCam: { entity: "camera.front" },
    _activeGroupMemberOverride: "",
    _activeStreamType: "mse",
    _streamMuted: true,
    _rotateOverlayActive: false,
    _mountSeq: 12,
    _mountInProgress: false,
    _mountStartedAt: 100,
    _mountTargetEntity: "camera.front",
    _pendingMountDestroyers: [],
    _pendingWebRTCTakeoverTimer: null,
    _engine: "mse-engine",
    _started: true,
    _viewMode: "single",
    _twoWayTalkStarting: false,
    _twoWayTalkSession: null,
    _dashboardLiveGraceActive: true,
    _mseChunkCount: 0,
    _haDirectMounter: haDirectMounter,
    _haDirectTwoWayTalkMounter: { name: "ha-talk-mounter" },
    _go2rtcRaceMounter: { name: "go2rtc-race" },
    _editorPreviewController: {
      liveHandoffContext: () => ({ owner: "editor" }),
      isEditorLifecycleActive: () => true,
      requestLiveHandoff: (request) => {
        calls.push(["request-handoff", request]);
        return "requested";
      },
    },
    _cameraGroupLiveController: {
      sync: () => calls.push(["sync-live"]),
    },
    _gridMediaController: {
      mountGridEngine: (slot) => calls.push(["mount-grid", slot]),
    },
    _$: (selector) => {
      if (selector === "#engine") return engineSlot;
      if (selector === "#grid-engine") return gridSlot;
      return null;
    },
    _clearRotateOverlayAudioSync: () => calls.push(["clear-audio-sync"]),
    _clearRotateVideoFullscreenStyle: () =>
      calls.push(["clear-fullscreen-style"]),
    _assignLiveEngine: (...args) => calls.push(["assign-engine", ...args]),
    _attachVideoFit: (streamEl) => calls.push(["fit", streamEl]),
    _setActiveStreamType: (type) => calls.push(["stream-type", type]),
    _setStreamLoading: (loading) => calls.push(["loading", loading]),
    _setStreamFallbackVisible: (...args) => calls.push(["fallback", ...args]),
    _setLiveNativeControls: (enabled) =>
      calls.push(["native-controls", enabled]),
    _scheduleResumeLive: (reason) => calls.push(["resume", reason]),
    _currentLiveStreamHint: () => "mse",
    _isPreviewPageActive: () => false,
    _shouldUseGo2RtcForEntity: () => true,
    _cameraConnectionType: (entity) =>
      entity === "camera.ha" ? "ha_direct" : "frigate_go2rtc",
    _isGridModeAvailable: () => true,
    _applyMountTrackingState: (state) =>
      calls.push(["mount-tracking", state]),
    _cleanupEngine: () => calls.push(["cleanup-engine"]),
    _preferredStreamType: () => "webrtc",
  };

  const controllers = createLiveLifecycleControllers(card, {
    factories,
    windowTarget: { location: { pathname: "/lovelace/cameras" } },
  });

  assert.deepEqual(controllers, {
    _mseGraceController: mseGraceController,
    _editorLiveHandoffController: editorLiveHandoffController,
    _liveMountController: liveMountController,
  });
  assert.equal(optionsByFactory.mseGrace.graceMs, MSE_SWITCH_GRACE_MS);
  assert.equal(optionsByFactory.mseGrace.graceMax, MSE_SWITCH_GRACE_MAX);
  assert.strictEqual(optionsByFactory.liveMount.mseGraceController, mseGraceController);
  assert.strictEqual(optionsByFactory.liveMount.haDirectMounter, haDirectMounter);
  assert.strictEqual(
    optionsByFactory.liveMount.haDirectTwoWayTalkMounter,
    card._haDirectTwoWayTalkMounter,
  );
  assert.strictEqual(
    optionsByFactory.liveMount.go2rtcRaceMounter,
    card._go2rtcRaceMounter,
  );

  assert.deepEqual(optionsByFactory.editorHandoff.getState(), {
    activeStreamType: "mse",
    engine: "mse-engine",
    entity: "camera.front",
    hasSlot: true,
    hostConnected: true,
    mountInProgress: false,
    previewPageActive: false,
    started: true,
    twoWayTalkActive: false,
    useGo2Rtc: true,
    viewMode: "single",
  });
  assert.equal(
    optionsByFactory.editorHandoff.getIdentityKey("camera.ha"),
    buildEditorLiveHandoffKey({
      connectionType: "ha_direct",
      entity: "camera.ha",
      pathname: "/lovelace/cameras",
    }),
  );
  assert.equal(
    optionsByFactory.editorHandoff.isEngineReusable(
      "ha-engine",
      "webrtc",
      "ha_direct",
    ),
    true,
  );
  assert.equal(
    optionsByFactory.editorHandoff.isEngineReusable(
      "mse-engine",
      "mse",
      "frigate_go2rtc",
    ),
    true,
  );
  assert.equal(
    optionsByFactory.editorHandoff.isEngineReusable(
      "webrtc-engine",
      "webrtc",
      "frigate_go2rtc",
    ),
    true,
  );
  assert.equal(
    optionsByFactory.editorHandoff.detachEngine(
      "blocked-engine",
      "webrtc",
      "ha_direct",
    ),
    false,
  );
  assert.equal(
    optionsByFactory.editorHandoff.detachEngine(
      "ha-engine",
      "webrtc",
      "ha_direct",
    ),
    true,
  );
  assert.deepEqual(calls.at(-1), [
    "assign-engine",
    null,
    { retainPrevious: true },
  ]);

  assert.equal(
    optionsByFactory.editorHandoff.adoptEngine(
      "ha-engine",
      "webrtc",
      "ha_direct",
    ),
    true,
  );
  assert.equal(card._dashboardLiveGraceActive, false);
  assert.deepEqual(calls.at(-1), ["adopt-ha", engineSlot, "ha-engine"]);

  assert.equal(
    optionsByFactory.liveMount.takeEditorLiveHandoff({
      entity: "camera.front",
      streamType: "mse",
      connectionType: "frigate_go2rtc",
    }),
    "handoff",
  );
  assert.deepEqual(calls.at(-1), [
    "take-handoff",
    "camera.front",
    "mse",
    "frigate_go2rtc",
  ]);

  optionsByFactory.mseGrace.resetMseDiagnostics(200);
  optionsByFactory.mseGrace.markMseChunk(225);
  assert.equal(card._mseConnectAt, 200);
  assert.equal(card._mseLastChunkAt, 225);
  assert.equal(card._mseChunkCount, 1);
  optionsByFactory.mseGrace.releaseHaDirectEngine("ha-engine");
  optionsByFactory.mseGrace.adoptHaDirectWebRtcEngine("ha-engine");
  assert.deepEqual(calls.slice(-2), [
    ["release-ha", "ha-engine"],
    ["adopt-retained-ha", "ha-engine"],
  ]);
});
