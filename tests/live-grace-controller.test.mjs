import { test } from "node:test";
import assert from "node:assert/strict";

import { createLiveGraceController } from "../src/features/live/live-grace-controller.js";

const originalDocument = globalThis.document;

function withFakeDocument(run) {
  const hostChildren = [];
  globalThis.document = {
    createElement() {
      return {
        isConnected: false,
        style: { cssText: "" },
        children: [],
        setAttribute() {},
        appendChild(child) {
          this.children.push(child);
          child.parentElement = this;
          return child;
        },
        remove() {
          this.isConnected = false;
        },
      };
    },
  };

  const shadowRoot = {
    appendChild(node) {
      node.isConnected = true;
      hostChildren.push(node);
      return node;
    },
  };

  return Promise.resolve(run({ shadowRoot, hostChildren })).finally(() => {
    globalThis.document = originalDocument;
  });
}

test("mse grace controller preserves pending mse promise across cleanup", async () => {
  await withFakeDocument(async ({ shadowRoot }) => {
    let pendingDestroyers = [];
    let engine = null;
    const controller = createLiveGraceController({
      graceMs: 20,
      graceMax: 2,
      getShadowRoot: () => shadowRoot,
      getScopeKey: () => ({ id: "scope" }),
      getPendingMountDestroyers: () => pendingDestroyers,
      setPendingMountDestroyers: (next) => {
        pendingDestroyers = next;
      },
      getPendingWebRtcTakeoverTimer: () => null,
      setPendingWebRtcTakeoverTimer: () => {},
      clearRotateOverlayAudioSync: () => {},
      clearRotateVideoFullscreenStyle: () => {},
      getEngine: () => engine,
      setEngine: (next) => {
        engine = next;
      },
      getActiveStreamType: () => "snapshot",
      getStreamMuted: () => true,
      setEngineMountedMuted: () => {},
      getRotateOverlayActive: () => false,
      attachVideoFit: () => {},
      setActiveStreamType: () => {},
      setStreamLoading: () => {},
      setStreamFallbackVisible: () => {},
      setLiveNativeControls: () => {},
    });

    const gracePromise = Promise.resolve({
      ok: true,
      type: "mse",
      engine: {
        video: { style: { cssText: "" }, play: () => Promise.resolve() },
        ws: { readyState: 1 },
      },
    });
    let destroyed = false;
    pendingDestroyers = [
      {
        type: "mse",
        entity: "camera.front",
        promise: gracePromise,
        destroy() {
          destroyed = true;
        },
      },
    ];

    controller.cleanupEngine({ preserveMseEntity: "camera.front" });
    const entry = controller.takeGraceMseEntry("camera.front");

    assert.equal(destroyed, false);
    assert.equal(pendingDestroyers.length, 0);
    assert.equal(typeof entry?.promise?.then, "function");
    const resolvedEngine = await entry.promise;
    assert.ok(resolvedEngine?.video);
  });
});

test("mse grace controller preserves current mse engine across cleanup", async () => {
  await withFakeDocument(async ({ shadowRoot }) => {
    let engine = {
      video: { style: { cssText: "" }, play: () => Promise.resolve() },
      ws: { readyState: 1 },
      destroy() {},
    };
    const controller = createLiveGraceController({
      graceMs: 20,
      graceMax: 2,
      getShadowRoot: () => shadowRoot,
      getScopeKey: () => ({ id: "scope" }),
      getPendingMountDestroyers: () => [],
      setPendingMountDestroyers: () => {},
      getPendingWebRtcTakeoverTimer: () => null,
      setPendingWebRtcTakeoverTimer: () => {},
      clearRotateOverlayAudioSync: () => {},
      clearRotateVideoFullscreenStyle: () => {},
      getEngine: () => engine,
      setEngine: (next) => {
        engine = next;
      },
      getActiveStreamType: () => "mse",
      getStreamMuted: () => true,
      setEngineMountedMuted: () => {},
      getRotateOverlayActive: () => false,
      attachVideoFit: () => {},
      setActiveStreamType: () => {},
      setStreamLoading: () => {},
      setStreamFallbackVisible: () => {},
      setLiveNativeControls: () => {},
    });

    controller.cleanupEngine({ preserveMseEntity: "camera.front" });
    const entry = controller.takeGraceMseEntry("camera.front");

    assert.equal(engine, null);
    assert.equal(entry?.engine?.ws?.readyState, 1);
    controller.clearGracePool();
  });
});

test("MSE adoption rebinds diagnostics and recovery to the receiving owner", async () => {
  await withFakeDocument(async ({ shadowRoot }) => {
    const video = {
      style: { cssText: "" },
      dataset: {},
      classList: { add() {} },
      setAttribute() {},
      removeAttribute() {},
      play: () => Promise.resolve(),
    };
    const cachedEngine = {
      type: "frigate_go2rtc",
      streamType: "mse",
      video,
      ws: { readyState: 1 },
      recoveryHandler: null,
      activityHandler: null,
      activateRecovery() {},
      setRecoveryHandler(handler) {
        this.recoveryHandler = handler;
      },
      setActivityHandler(handler) {
        this.activityHandler = handler;
      },
    };
    let engine = null;
    let diagnosticsResetAt = 0;
    const activityTimes = [];
    const recoveryReasons = [];
    const controller = createLiveGraceController({
      graceMs: 100,
      graceMax: 2,
      getShadowRoot: () => shadowRoot,
      getScopeKey: () => ({ id: "receiver" }),
      getPendingMountDestroyers: () => [],
      setPendingMountDestroyers: () => {},
      getPendingWebRtcTakeoverTimer: () => null,
      setPendingWebRtcTakeoverTimer: () => {},
      clearRotateOverlayAudioSync: () => {},
      clearRotateVideoFullscreenStyle: () => {},
      getEngine: () => engine,
      setEngine: (next) => {
        engine = next;
      },
      getActiveStreamType: () => "mse",
      getStreamMuted: () => true,
      setEngineMountedMuted: () => {},
      getRotateOverlayActive: () => false,
      attachVideoFit: () => {},
      setActiveStreamType: () => {},
      setStreamLoading: () => {},
      setStreamFallbackVisible: () => {},
      setLiveNativeControls: () => {},
      scheduleResumeLive: (reason) => recoveryReasons.push(reason),
      resetMseDiagnostics: (connectedAt) => {
        diagnosticsResetAt = connectedAt;
      },
      markMseChunk: (chunkAt) => activityTimes.push(chunkAt),
    });
    const slot = {
      innerHTML: "occupied",
      appendChild(node) {
        this.child = node;
      },
    };

    assert.equal(controller.isMseEngineReusable(cachedEngine), true);
    assert.equal(controller.adoptGraceMseEngine(slot, cachedEngine), true);
    assert.equal(engine, cachedEngine);
    assert.equal(slot.child, video);
    assert.equal(diagnosticsResetAt > 0, true);

    cachedEngine.activityHandler(1234);
    cachedEngine.recoveryHandler("mse-ws-closed");
    assert.deepEqual(activityTimes, [1234]);
    assert.deepEqual(recoveryReasons, ["mse-ws-closed"]);

    cachedEngine.ws.readyState = 3;
    assert.equal(controller.isMseEngineReusable(cachedEngine), false);
  });
});

test("live grace controller preserves and re-adopts a WebRTC engine", async () => {
  await withFakeDocument(async ({ shadowRoot }) => {
    const video = {
      style: { cssText: "" },
      dataset: {},
      classList: { add() {} },
      setAttribute() {},
      removeAttribute() {},
      play: () => Promise.resolve(),
    };
    const cachedEngine = {
      video,
      pc: {
        connectionState: "connected",
        iceConnectionState: "connected",
      },
      ws: { readyState: 3 },
      signalingComplete: true,
      destroyCalls: 0,
      recoveryActive: true,
      recoveryHandler: null,
      activateRecovery() {
        this.recoveryActive = true;
      },
      deactivateRecovery() {
        this.recoveryActive = false;
      },
      setRecoveryHandler(handler) {
        this.recoveryHandler = handler;
      },
      destroy() {
        this.destroyCalls += 1;
      },
    };
    let engine = cachedEngine;
    let activeStreamType = "webrtc";
    const recoveryReasons = [];
    const controller = createLiveGraceController({
      graceMs: 100,
      graceMax: 2,
      getShadowRoot: () => shadowRoot,
      getScopeKey: () => ({ id: "scope" }),
      getPendingMountDestroyers: () => [],
      setPendingMountDestroyers: () => {},
      getPendingWebRtcTakeoverTimer: () => null,
      setPendingWebRtcTakeoverTimer: () => {},
      clearRotateOverlayAudioSync: () => {},
      clearRotateVideoFullscreenStyle: () => {},
      getEngine: () => engine,
      setEngine: (next) => {
        engine = next;
      },
      getActiveStreamType: () => activeStreamType,
      getStreamMuted: () => false,
      setEngineMountedMuted: () => {},
      getRotateOverlayActive: () => false,
      attachVideoFit: () => {},
      setActiveStreamType: (next) => {
        activeStreamType = next;
      },
      setStreamLoading: () => {},
      setStreamFallbackVisible: () => {},
      setLiveNativeControls: () => {},
      scheduleResumeLive: (reason) => recoveryReasons.push(reason),
    });

    controller.cleanupEngine({ preserveLiveEntity: "camera.front" });
    const entry = controller.takeGraceWebRtcEntry("camera.front");

    assert.equal(engine, null);
    assert.equal(entry?.engine, cachedEngine);
    assert.equal(cachedEngine.destroyCalls, 0);
    assert.equal(cachedEngine.recoveryActive, false);

    const slot = {
      innerHTML: "occupied",
      appendChild(node) {
        this.child = node;
      },
    };
    assert.equal(controller.adoptGraceWebRtcEngine(slot, entry.engine), true);
    assert.equal(engine, cachedEngine);
    assert.equal(activeStreamType, "webrtc");
    assert.equal(slot.child, video);
    assert.equal(cachedEngine.destroyCalls, 0);
    assert.equal(cachedEngine.recoveryActive, true);
    cachedEngine.recoveryHandler("webrtc-connection-lost");
    assert.deepEqual(recoveryReasons, ["webrtc-connection-lost"]);
  });
});

test("live grace controller shares its cache limit across MSE and WebRTC", async () => {
  await withFakeDocument(async ({ shadowRoot }) => {
    let engine = null;
    let activeStreamType = "";
    const destroyed = [];
    const makeVideo = () => ({
      style: { cssText: "" },
      play: () => Promise.resolve(),
    });
    const controller = createLiveGraceController({
      graceMs: 100,
      graceMax: 2,
      getShadowRoot: () => shadowRoot,
      getScopeKey: () => ({ id: "scope" }),
      getPendingMountDestroyers: () => [],
      setPendingMountDestroyers: () => {},
      getPendingWebRtcTakeoverTimer: () => null,
      setPendingWebRtcTakeoverTimer: () => {},
      clearRotateOverlayAudioSync: () => {},
      clearRotateVideoFullscreenStyle: () => {},
      getEngine: () => engine,
      setEngine: (next) => {
        engine = next;
      },
      getActiveStreamType: () => activeStreamType,
      getStreamMuted: () => true,
      setEngineMountedMuted: () => {},
      getRotateOverlayActive: () => false,
      attachVideoFit: () => {},
      setActiveStreamType: () => {},
      setStreamLoading: () => {},
      setStreamFallbackVisible: () => {},
      setLiveNativeControls: () => {},
    });
    const stash = (entity, type) => {
      activeStreamType = type;
      engine = {
        video: makeVideo(),
        ws: { readyState: 1 },
        ...(type === "webrtc"
          ? {
              pc: {
                connectionState: "connected",
                iceConnectionState: "connected",
              },
            }
          : {}),
        destroy() {
          destroyed.push(entity);
        },
      };
      controller.cleanupEngine({ preserveLiveEntity: entity });
    };

    stash("camera.one", "mse");
    stash("camera.two", "webrtc");
    stash("camera.three", "webrtc");

    assert.deepEqual(destroyed, ["camera.one"]);
    assert.equal(controller.takeGraceMseEntry("camera.one"), null);
    assert.ok(controller.takeGraceWebRtcEntry("camera.two")?.engine);
    assert.ok(controller.takeGraceWebRtcEntry("camera.three")?.engine);
  });
});

test("live grace controller retains HA-direct WebRTC without entering the Frigate pool", async () => {
  await withFakeDocument(async ({ shadowRoot }) => {
    const video = {
      style: { cssText: "" },
      dataset: {},
      classList: { add() {} },
      setAttribute() {},
      removeAttribute() {},
      play: () => Promise.resolve(),
    };
    const cachedEngine = {
      type: "ha_direct",
      streamType: "webrtc",
      video,
      pc: {
        connectionState: "connected",
        iceConnectionState: "connected",
      },
      destroyCalls: 0,
      destroy() {
        this.destroyCalls += 1;
      },
    };
    let engine = cachedEngine;
    let activeStreamType = "webrtc";
    let retainedOptions = null;
    let ownershipAdoptions = 0;
    const controller = createLiveGraceController({
      graceMs: 100,
      graceMax: 2,
      getShadowRoot: () => shadowRoot,
      getScopeKey: () => ({ id: "scope" }),
      getPendingMountDestroyers: () => [],
      setPendingMountDestroyers: () => {},
      getPendingWebRtcTakeoverTimer: () => null,
      setPendingWebRtcTakeoverTimer: () => {},
      clearRotateOverlayAudioSync: () => {},
      clearRotateVideoFullscreenStyle: () => {},
      getEngine: () => engine,
      setEngine: (next, options) => {
        engine = next;
        retainedOptions = options;
      },
      getActiveStreamType: () => activeStreamType,
      getStreamMuted: () => true,
      setEngineMountedMuted: () => {},
      getRotateOverlayActive: () => false,
      attachVideoFit: () => {},
      setActiveStreamType: (next) => {
        activeStreamType = next;
      },
      setStreamLoading: () => {},
      setStreamFallbackVisible: () => {},
      setLiveNativeControls: () => {},
      releaseHaDirectEngine: () => {
        throw new Error("retained HA engine must not be released");
      },
      adoptHaDirectWebRtcEngine: (candidate) => {
        assert.equal(engine, candidate);
        ownershipAdoptions += 1;
        return true;
      },
    });

    controller.cleanupEngine({ preserveLiveEntity: "camera.front" });

    assert.equal(engine, null);
    assert.deepEqual(retainedOptions, { retainPrevious: true });
    assert.equal(controller.takeGraceWebRtcEntry("camera.front"), null);
    const entry = controller.takeGraceHaDirectEntry("camera.front");
    assert.equal(entry?.engine, cachedEngine);

    const slot = {
      innerHTML: "occupied",
      appendChild(node) {
        this.child = node;
      },
    };
    assert.equal(
      controller.adoptGraceHaDirectEngine(slot, cachedEngine),
      true,
    );
    assert.equal(engine, cachedEngine);
    assert.equal(activeStreamType, "webrtc");
    assert.equal(slot.child, video);
    assert.equal(cachedEngine.destroyCalls, 0);
    assert.equal(ownershipAdoptions, 1);
  });
});

test("live grace controller retains HA-direct HLS without shrinking its video surface", async () => {
  await withFakeDocument(async ({ shadowRoot, hostChildren }) => {
    const video = {
      style: { cssText: "" },
      dataset: {},
      classList: { add() {} },
      setAttribute() {},
      removeAttribute() {},
      play: () => Promise.resolve(),
    };
    let removeCalls = 0;
    let cancelTakeoverCalls = 0;
    const hlsEngine = {
      type: "ha_direct",
      streamType: "hls",
      tagName: "HA-HLS-PLAYER",
      style: { cssText: "" },
      shadowRoot: { querySelector: () => video },
      querySelector: () => null,
      cancelPendingTakeover() {
        cancelTakeoverCalls += 1;
      },
      remove() {
        removeCalls += 1;
      },
    };
    let engine = hlsEngine;
    let releasedEngine = null;
    const controller = createLiveGraceController({
      graceMs: 100,
      graceMax: 2,
      getShadowRoot: () => shadowRoot,
      getScopeKey: () => ({ id: "scope" }),
      getPendingMountDestroyers: () => [],
      setPendingMountDestroyers: () => {},
      getPendingWebRtcTakeoverTimer: () => null,
      setPendingWebRtcTakeoverTimer: () => {},
      clearRotateOverlayAudioSync: () => {},
      clearRotateVideoFullscreenStyle: () => {},
      getEngine: () => engine,
      setEngine: (next) => {
        engine = next;
      },
      getActiveStreamType: () => "hls",
      getStreamMuted: () => true,
      setEngineMountedMuted: () => {},
      getRotateOverlayActive: () => false,
      attachVideoFit: () => {},
      setActiveStreamType: () => {},
      setStreamLoading: () => {},
      setStreamFallbackVisible: () => {},
      setLiveNativeControls: () => {},
      releaseHaDirectEngine: (released) => {
        releasedEngine = released;
      },
      adoptHaDirectWebRtcEngine: () => {
        throw new Error("HLS must not enter WebRTC handoff ownership");
      },
    });

    controller.cleanupEngine({ preserveLiveEntity: "camera.front" });
    assert.equal(engine, null);
    assert.equal(cancelTakeoverCalls, 1);
    assert.equal(video.style.cssText.includes("left:-9999px"), false);
    assert.match(hlsEngine.style.cssText, /inset:0/);
    assert.match(hostChildren[0]?.style?.cssText || "", /width:100%/);
    assert.equal(controller.takeGraceWebRtcEntry("camera.front"), null);

    controller.clearGracePool();

    assert.equal(releasedEngine, hlsEngine);
    assert.equal(removeCalls, 1);
  });
});

test("delayed retained HA-direct HLS stays connected behind its snapshot", async () => {
  await withFakeDocument(async ({ shadowRoot }) => {
    const video = {
      style: { cssText: "" },
      dataset: {},
      classList: { add() {} },
      setAttribute() {},
      removeAttribute() {},
      play: () => Promise.resolve(),
    };
    const hlsEngine = {
      type: "ha_direct",
      streamType: "hls",
      tagName: "HA-HLS-PLAYER",
      style: { cssText: "" },
      shadowRoot: { querySelector: () => video },
      querySelector: () => null,
      removeCalls: 0,
      remove() {
        this.removeCalls += 1;
      },
    };
    let engine = hlsEngine;
    let loading = false;
    let releasedEngine = null;
    const activeTypes = [];
    const fallbackStates = [];
    const recoveryReasons = [];
    const controller = createLiveGraceController({
      graceMs: 100,
      graceMax: 2,
      getShadowRoot: () => shadowRoot,
      getScopeKey: () => ({ id: "scope" }),
      getPendingMountDestroyers: () => [],
      setPendingMountDestroyers: () => {},
      getPendingWebRtcTakeoverTimer: () => null,
      setPendingWebRtcTakeoverTimer: () => {},
      clearRotateOverlayAudioSync: () => {},
      clearRotateVideoFullscreenStyle: () => {},
      getEngine: () => engine,
      setEngine: (next) => {
        engine = next;
      },
      getActiveStreamType: () => "hls",
      getStreamMuted: () => true,
      setEngineMountedMuted: () => {},
      getRotateOverlayActive: () => false,
      attachVideoFit: () => {},
      setActiveStreamType: (type) => activeTypes.push(type),
      setStreamLoading: (next) => {
        loading = next;
      },
      setStreamFallbackVisible: (visible, refreshImage) =>
        fallbackStates.push({ visible, refreshImage }),
      setLiveNativeControls: () => {},
      releaseHaDirectEngine: (released) => {
        releasedEngine = released;
      },
      resumeHaDirectEngine: async () => false,
      scheduleResumeLive: (reason) => recoveryReasons.push(reason),
    });
    const slot = {
      innerHTML: "",
      appendChild(node) {
        this.child = node;
      },
    };

    assert.equal(controller.adoptGraceHaDirectEngine(slot, hlsEngine), true);
    await Promise.resolve();
    await Promise.resolve();

    assert.equal(engine, hlsEngine);
    assert.equal(releasedEngine, null);
    assert.equal(hlsEngine.removeCalls, 0);
    assert.equal(loading, false);
    assert.deepEqual(activeTypes, ["hls"]);
    assert.deepEqual(fallbackStates, [
      { visible: true, refreshImage: true },
      { visible: true, refreshImage: undefined },
    ]);
    assert.deepEqual(recoveryReasons, []);
  });
});

test("retained HA-direct HLS keeps a snapshot until video resumes", async () => {
  await withFakeDocument(async ({ shadowRoot }) => {
    const video = {
      style: { cssText: "" },
      dataset: {},
      classList: { add() {} },
      setAttribute() {},
      removeAttribute() {},
      play: () => Promise.resolve(),
    };
    const hlsEngine = {
      type: "ha_direct",
      streamType: "hls",
      tagName: "HA-HLS-PLAYER",
      style: { cssText: "" },
      shadowRoot: { querySelector: () => video },
      querySelector: () => null,
    };
    let engine = hlsEngine;
    let resolveResume;
    const resume = new Promise((resolve) => {
      resolveResume = resolve;
    });
    const activeTypes = [];
    const loadingStates = [];
    const fallbackStates = [];
    let presentationRefreshes = 0;
    const controller = createLiveGraceController({
      graceMs: 100,
      graceMax: 2,
      getShadowRoot: () => shadowRoot,
      getScopeKey: () => ({ id: "scope" }),
      getPendingMountDestroyers: () => [],
      setPendingMountDestroyers: () => {},
      getPendingWebRtcTakeoverTimer: () => null,
      setPendingWebRtcTakeoverTimer: () => {},
      clearRotateOverlayAudioSync: () => {},
      clearRotateVideoFullscreenStyle: () => {},
      getEngine: () => engine,
      setEngine: (next) => {
        engine = next;
      },
      getActiveStreamType: () => "hls",
      getStreamMuted: () => true,
      setEngineMountedMuted: () => {},
      getRotateOverlayActive: () => false,
      attachVideoFit: () => {},
      setActiveStreamType: (type) => activeTypes.push(type),
      setStreamLoading: (loading) => loadingStates.push(loading),
      setStreamFallbackVisible: (visible, refreshImage) =>
        fallbackStates.push({ visible, refreshImage }),
      setLiveNativeControls: () => {},
      releaseHaDirectEngine: () => {
        throw new Error("healthy retained HLS must not be released");
      },
      resumeHaDirectEngine: () => resume,
      refreshLivePresentation: () => {
        presentationRefreshes += 1;
      },
      scheduleResumeLive: () => {
        throw new Error("healthy retained HLS must not remount");
      },
    });
    const slot = {
      innerHTML: "",
      appendChild(node) {
        this.child = node;
      },
    };

    assert.equal(controller.adoptGraceHaDirectEngine(slot, hlsEngine), true);
    assert.deepEqual(activeTypes, ["hls"]);
    assert.deepEqual(loadingStates, [true]);
    assert.equal(presentationRefreshes, 1);
    assert.deepEqual(fallbackStates, [
      { visible: true, refreshImage: true },
    ]);

    resolveResume(true);
    await Promise.resolve();
    await Promise.resolve();

    assert.equal(engine, hlsEngine);
    assert.deepEqual(activeTypes, ["hls"]);
    assert.deepEqual(loadingStates, [true, false]);
    assert.deepEqual(fallbackStates, [
      { visible: true, refreshImage: true },
      { visible: false, refreshImage: undefined },
    ]);
  });
});
