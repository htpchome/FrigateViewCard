import { test } from "node:test";
import assert from "node:assert/strict";

import { createHaDirectMounter } from "../src/features/live/ha-direct-mounter.js";
import { createMseGraceController } from "../src/features/live/mse-grace-controller.js";

function createFakeVideo(id = "first-video") {
  const listeners = new Map();
  const callbacks = new Map();
  let nextCallback = 0;
  return {
    tagName: "VIDEO", id, paused: true, readyState: 0, currentTime: 0, videoWidth: 0,
    style: { cssText: "" },
    dataset: {},
    classList: { add() {} },
    setAttribute() {},
    removeAttribute() {},
    play() {
      this.paused = false;
      return Promise.resolve();
    },
    addEventListener(type, handler) {
      const handlers = listeners.get(type) || new Set();
      handlers.add(handler);
      listeners.set(type, handlers);
    },
    removeEventListener(type, handler) { listeners.get(type)?.delete(handler); },
    dispatch(type) {
      for (const handler of [...(listeners.get(type) || [])]) handler({ type, target: this });
    },
    requestVideoFrameCallback(handler) {
      callbacks.set(++nextCallback, handler);
      return nextCallback;
    },
    cancelVideoFrameCallback(id) { callbacks.delete(id); },
    pendingFrames() { return [...callbacks.values()]; },
    presentFrame() {
      this.paused = false;
      this.readyState = 4;
      this.videoWidth = 2560;
      this.currentTime += 0.04;
      const pending = [...callbacks.values()];
      callbacks.clear();
      for (const handler of pending) handler(0, { presentedFrames: 1 });
      this.dispatch("timeupdate");
    },
    listenerCount(type) { return listeners.get(type)?.size || 0; },
  };
}

function createFakeStreamElement() {
  const listeners = new Map();
  const firstVideo = createFakeVideo();
  let video = firstVideo;
  return {
    tagName: "HA-HLS-PLAYER",
    style: { cssText: "" },
    updateComplete: Promise.resolve(),
    get video() {
      return video;
    },
    set video(nextVideo) {
      video = nextVideo;
    },
    firstVideo,
    hidden: false,
    classList: { contains: () => false },
    shadowRoot: {
      querySelector: (selector) => (selector === "video" ? video : null),
    },
    querySelector: () => null,
    addEventListener(type, handler) {
      const handlers = listeners.get(type) || new Set();
      handlers.add(handler);
      listeners.set(type, handlers);
    },
    removeEventListener(type, handler) {
      listeners.get(type)?.delete(handler);
    },
    dispatch(type, detail) {
      for (const handler of listeners.get(type) || []) {
        handler({ type, target: this, detail });
      }
    },
    listenerCount(type) {
      return listeners.get(type)?.size || 0;
    },
    removeCalled: false,
    remove() {
      this.removeCalled = true;
    },
  };
}

const flushAsyncWork = () => new Promise((resolve) => setImmediate(resolve));

function withFakeDocument(run) {
  const previousDocument = globalThis.document;
  const hlsPlayers = [];
  globalThis.document = {
    createElement: (tag) => {
      const normalizedTag = String(tag).toLowerCase();
      if (normalizedTag === "ha-hls-player") {
        const player = createFakeStreamElement();
        hlsPlayers.push(player);
        return player;
      }
      if (normalizedTag === "div") {
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
      }
      throw new Error(`Unexpected tag: ${tag}`);
    },
  };
  return Promise.resolve()
    .then(() => run({ hlsPlayers }))
    .finally(() => {
      globalThis.document = previousDocument;
    });
}

function withImmediateTimeout(run) {
  const previousSetTimeout = globalThis.setTimeout;
  globalThis.setTimeout = (fn) => {
    fn();
    return 0;
  };
  return Promise.resolve()
    .then(() => run())
    .finally(() => {
      globalThis.setTimeout = previousSetTimeout;
    });
}

test("ha direct mounter mounts and schedules follow-up without blocking", async () => {
  await withFakeDocument(async () => {
    await withImmediateTimeout(async () => {
      const slot = {
        innerHTML: "occupied",
        appended: [],
        appendChild(node) {
          this.appended.push(node);
          this.lastChild = node;
        },
      };
      const hass = {
        states: {
          "camera.front": {
            entity_id: "camera.front",
            attributes: {},
          },
        },
      };
      let assignedEngine = null;
      let committedMedia = null;
      const appliedStates = [];
      let waitCalls = 0;
      const mounter = createHaDirectMounter({
        getHass: () => hass,
        getPreferredStreamType: () => "webrtc",
        getStreamMuted: () => true,
        getRotateOverlayActive: () => true,
        isCurrentEngine: (streamEl) => assignedEngine === streamEl,
        waitForStreamStart: async (_streamEl, _waitMs, options) => {
          waitCalls += 1;
          assert.equal(options.onVideoReady, undefined);
          return true;
        },
        assignCommittedEngine: (engine) => {
          assignedEngine = engine;
        },
        onCommittedMediaReady: (engine, video) => {
          committedMedia = { engine, video };
        },
        applyResolvedStreamUiState: (streamState) => {
          appliedStates.push(streamState);
        },
        setLiveNativeControls: () => {},
      });

      const result = await mounter.tryMount(
        slot,
        { streamType: "hls" },
        { entity: "camera.front", commit: true },
      );
      await flushAsyncWork();

      assert.equal(result?.ok, true);
      assert.equal(result?.type, "hls");
      assert.equal(slot.innerHTML, "");
      assert.equal(slot.lastChild, assignedEngine);
      assert.equal(assignedEngine.fitMode, "contain");
      assert.equal(waitCalls, 1);
      assert.deepEqual(committedMedia, {
        engine: assignedEngine,
        video: assignedEngine.firstVideo,
      });
      assert.equal(appliedStates.length >= 1, true);
    });
  });
});

test("ha direct mounter follows the active HLS video and releases its listeners", async () => {
  await withFakeDocument(async () => {
    await withImmediateTimeout(async () => {
      const slot = {
        innerHTML: "",
        appendChild(node) {
          this.lastChild = node;
        },
      };
      const hass = {
        states: {
          "camera.front": {
            entity_id: "camera.front",
            attributes: {},
          },
        },
      };
      let assignedEngine = null;
      const committedVideos = [];
      const mounter = createHaDirectMounter({
        getHass: () => hass,
        getPreferredStreamType: () => "hls",
        getStreamMuted: () => true,
        getRotateOverlayActive: () => false,
        isCurrentEngine: (streamEl) => assignedEngine === streamEl,
        waitForStreamStart: async () => true,
        assignCommittedEngine: (engine) => {
          assignedEngine = engine;
        },
        onCommittedMediaReady: (_engine, video) => {
          committedVideos.push(video);
        },
        applyResolvedStreamUiState: () => {},
        setLiveNativeControls: () => {},
      });

      await mounter.tryMount(slot, null, {
        entity: "camera.front",
        commit: true,
      });
      await flushAsyncWork();

      const stream = assignedEngine;
      const secondVideo = { tagName: "VIDEO", id: "second-video" };
      stream.video = secondVideo;
      stream.dispatch("streams");
      await flushAsyncWork();

      stream.video = stream.firstVideo;
      stream.dispatch("load");
      await flushAsyncWork();

      assert.deepEqual(committedVideos, [
        stream.firstVideo,
        secondVideo,
        stream.firstVideo,
      ]);
      assert.equal(stream.listenerCount("load"), 1);
      assert.equal(stream.listenerCount("streams"), 1);

      mounter.release(stream);
      stream.dispatch("streams");
      await flushAsyncWork();

      assert.equal(stream.listenerCount("load"), 0);
      assert.equal(stream.listenerCount("streams"), 0);
      assert.equal(committedVideos.length, 3);
    });
  });
});

test("ha direct mounter aborts readiness work when its engine is released", async () => {
  await withFakeDocument(async () => {
    const slot = {
      innerHTML: "",
      appendChild(node) {
        this.lastChild = node;
      },
    };
    const hass = {
      states: {
        "camera.front": {
          entity_id: "camera.front",
          attributes: {},
        },
      },
    };
    let assignedEngine = null;
    let waitOptions = null;
    const mounter = createHaDirectMounter({
      getHass: () => hass,
        getPreferredStreamType: () => "hls",
      getStreamMuted: () => true,
      getRotateOverlayActive: () => false,
      isCurrentEngine: (streamEl) => assignedEngine === streamEl,
      waitForStreamStart: async (_streamEl, _waitMs, options) => {
        waitOptions = options;
        await new Promise((resolve) =>
          options.abortSignal.addEventListener("abort", resolve, { once: true }),
        );
        return false;
      },
      assignCommittedEngine: (engine) => {
        assignedEngine = engine;
      },
      onCommittedMediaReady: () => {},
      applyResolvedStreamUiState: () => {},
      setLiveNativeControls: () => {},
    });

    await mounter.tryMount(slot, null, {
      entity: "camera.front",
      commit: true,
    });
    await flushAsyncWork();

    const stream = assignedEngine;
    assert.equal(waitOptions.abortSignal.aborted, false);
    assert.equal(waitOptions.resolveVideo(), stream.firstVideo);

    mounter.release(stream);
    await flushAsyncWork();

    assert.equal(waitOptions.abortSignal.aborted, true);
    assert.equal(stream.listenerCount("load"), 0);
    assert.equal(stream.listenerCount("streams"), 0);
  });
});

test("ha direct mounter applies unavailable state when no camera state exists", async () => {
  const appliedStates = [];
  const mounter = createHaDirectMounter({
    getHass: () => ({ states: {} }),
    getPreferredStreamType: () => "webrtc",
    getStreamMuted: () => false,
    getRotateOverlayActive: () => false,
    isCurrentEngine: () => false,
    waitForStreamStart: async () => true,
    assignCommittedEngine: () => {},
    onCommittedMediaReady: () => {},
    applyResolvedStreamUiState: (streamState) => {
      appliedStates.push(streamState);
    },
    setLiveNativeControls: () => {},
  });

  const result = await mounter.tryMount(
    { innerHTML: "", appendChild() {} },
    null,
    { entity: "camera.front", commit: true },
  );

  assert.equal(result, false);
  assert.deepEqual(appliedStates, [
    {
      loading: false,
      fallbackVisible: false,
      refreshFallbackImage: false,
    },
  ]);
});

test("ha direct mounter replaces WebRTC with HLS when no video frame starts", async () => {
  const previousDocument = globalThis.document;
  const previousMediaStream = globalThis.MediaStream;
  const previousPeerConnection = globalThis.RTCPeerConnection;
  let assignedEngine = null;
  let unsubscribeCalls = 0;
  let subscriptionCalls = 0;
  const committedTypes = [];
  const readinessTargets = [];

  class FakePeerConnection {
    constructor() {
      this.connectionState = "new";
      this.iceConnectionState = "new";
    }

    addTransceiver() {
      return { stop() {} };
    }

    getTransceivers() {
      return [];
    }

    async createOffer() {
      return { type: "offer", sdp: "ha-direct-offer" };
    }

    async setLocalDescription() {
      this.ontrack?.({
        track: { kind: "video", stop() {} },
        streams: [],
      });
    }

    close() {}
  }

  globalThis.document = {
    createElement(tag) {
      if (tag === "video") {
        return {
          tagName: "VIDEO",
          style: {},
          dataset: {},
          classList: { add() {} },
          setAttribute() {},
          removeAttribute() {},
          play: () => Promise.resolve(),
          pause() {},
        };
      }
      if (tag === "ha-hls-player") return createFakeStreamElement();
      throw new Error(`Unexpected tag: ${tag}`);
    },
  };
  globalThis.MediaStream = class {
    addTrack() {}
    getTracks() {
      return [];
    }
  };
  globalThis.RTCPeerConnection = FakePeerConnection;

  const hass = {
    states: {
      "camera.front": { entity_id: "camera.front", attributes: {} },
    },
    callWS: async () => ({ configuration: { iceServers: [] } }),
    connection: {
      subscribeMessage(callback, _message, options) {
        subscriptionCalls += 1;
        assert.deepEqual(options, { resubscribe: false });
        queueMicrotask(() =>
          callback({ type: "answer", answer: "ha-direct-answer" }),
        );
        return Promise.resolve(() => {
          unsubscribeCalls += 1;
        });
      },
    },
  };
  const slot = {
    innerHTML: "",
    appendChild(node) {
      this.lastChild = node;
    },
  };
  const mounter = createHaDirectMounter({
    getHass: () => hass,
    getPreferredStreamType: () => "webrtc",
    getStreamMuted: () => true,
    getRotateOverlayActive: () => false,
    isCurrentEngine: (engine) => assignedEngine === engine,
    waitForStreamStart: async (engine) => {
      readinessTargets.push(engine?.tagName || engine?.streamType || "");
      return engine?.tagName === "HA-HLS-PLAYER";
    },
    assignCommittedEngine: (engine) => {
      assignedEngine = engine;
    },
    onCommittedMediaReady: () => {},
    onCommittedStream: (type) => committedTypes.push(type),
    applyResolvedStreamUiState: () => {},
    setLiveNativeControls: () => {},
    scheduleResumeLive: () => {},
  });

  try {
    const result = await mounter.tryMount(slot, null, {
      entity: "camera.front",
      commit: true,
    });
    await flushAsyncWork();
    await flushAsyncWork();

    assert.equal(result.type, "webrtc");
    assert.equal(subscriptionCalls, 1);
    assert.equal(unsubscribeCalls, 1);
    assert.equal(assignedEngine.tagName, "HA-HLS-PLAYER");
    assert.equal(assignedEngine.removeCalled, false);
    assert.deepEqual(committedTypes, ["hls"]);
    assert.equal(readinessTargets.includes("webrtc"), true);
    assert.equal(readinessTargets.includes("HA-HLS-PLAYER"), true);

    assignedEngine.dispatch("streams", { hasVideo: false });
    await flushAsyncWork();
    assert.equal(committedTypes.at(-1), "snapshot");
    assignedEngine.video.presentFrame();
    await flushAsyncWork();
    assert.equal(committedTypes.at(-1), "hls");
  } finally {
    mounter.release(assignedEngine);
    globalThis.document = previousDocument;
    globalThis.MediaStream = previousMediaStream;
    globalThis.RTCPeerConnection = previousPeerConnection;
  }
});

test("ha direct mounter shows ready HLS while WebRTC continues and takes over", async () => {
  const previousDocument = globalThis.document;
  const previousMediaStream = globalThis.MediaStream;
  const previousPeerConnection = globalThis.RTCPeerConnection;
  let assignedEngine = null;
  let resolveWebRtcReady = null;
  let unsubscribeCalls = 0;
  const committedTypes = [];
  const hlsPlayers = [];
  const assignments = [];
  let mounter = null;
  let receivingMounter = null;

  class FakePeerConnection {
    constructor() {
      this.connectionState = "new";
      this.iceConnectionState = "new";
    }

    addTransceiver() {
      return { stop() {} };
    }

    getTransceivers() {
      return [];
    }

    async createOffer() {
      return { type: "offer", sdp: "ha-direct-offer" };
    }

    async setLocalDescription() {
      this.ontrack?.({
        track: { kind: "video", stop() {} },
        streams: [],
      });
    }

    async setRemoteDescription() {}

    close() {}
  }

  globalThis.document = {
    createElement(tag) {
      if (tag === "video") {
        return {
          tagName: "VIDEO",
          style: { cssText: "" },
          dataset: {},
          classList: { add() {} },
          setAttribute() {},
          removeAttribute() {},
          play: () => Promise.resolve(),
          pause() {},
        };
      }
      if (tag === "ha-hls-player") {
        const player = createFakeStreamElement();
        hlsPlayers.push(player);
        return player;
      }
      throw new Error(`Unexpected tag: ${tag}`);
    },
  };
  globalThis.MediaStream = class {
    addTrack() {}
    getTracks() {
      return [];
    }
  };
  globalThis.RTCPeerConnection = FakePeerConnection;

  const hass = {
    states: {
      "camera.front": { entity_id: "camera.front", attributes: {} },
    },
    callWS: async () => ({ configuration: { iceServers: [] } }),
    connection: {
      subscribeMessage(callback) {
        queueMicrotask(() =>
          callback({ type: "answer", answer: "ha-direct-answer" }),
        );
        return Promise.resolve(() => {
          unsubscribeCalls += 1;
        });
      },
    },
  };
  const slot = {
    innerHTML: "",
    appendChild(node) {
      this.lastChild = node;
    },
  };
  mounter = createHaDirectMounter({
    getHass: () => hass,
    getPreferredStreamType: () => "webrtc",
    getStreamMuted: () => true,
    getRotateOverlayActive: () => false,
    isCurrentEngine: (engine) => assignedEngine === engine,
    waitForStreamStart: async (engine) => {
      if (engine?.tagName === "HA-HLS-PLAYER") return true;
      return await new Promise((resolve) => {
        resolveWebRtcReady = resolve;
      });
    },
    assignCommittedEngine: (engine, options = {}) => {
      const previousEngine = assignedEngine;
      assignedEngine = engine;
      assignments.push({ engine, retainPrevious: options.retainPrevious });
      if (
        previousEngine &&
        previousEngine !== engine &&
        options.retainPrevious !== true
      ) {
        mounter.release(previousEngine);
      }
    },
    onCommittedMediaReady: () => {},
    onCommittedStream: (type) => committedTypes.push(type),
    applyResolvedStreamUiState: () => {},
    setLiveNativeControls: () => {},
    scheduleResumeLive: () => {},
  });

  try {
    const result = await mounter.tryMount(slot, null, {
      entity: "camera.front",
      commit: true,
    });
    const webRtcEngine = result.engine;
    await flushAsyncWork();
    await flushAsyncWork();

    assert.equal(result.type, "webrtc");
    assert.equal(assignedEngine, hlsPlayers[0]);
    assert.deepEqual(assignments, [
      { engine: webRtcEngine, retainPrevious: undefined },
      { engine: hlsPlayers[0], retainPrevious: true },
    ]);
    assert.deepEqual(committedTypes, ["hls"]);
    assert.equal(hlsPlayers[0].removeCalled, false);
    assert.equal(typeof hlsPlayers[0].cancelPendingTakeover, "function");
    assert.match(webRtcEngine.video.style.cssText, /left:-9999px/);
    assert.equal(unsubscribeCalls, 0);

    resolveWebRtcReady(true);
    await flushAsyncWork();
    await flushAsyncWork();

    assert.equal(assignedEngine, webRtcEngine);
    assert.deepEqual(assignments, [
      { engine: webRtcEngine, retainPrevious: undefined },
      { engine: hlsPlayers[0], retainPrevious: true },
      { engine: webRtcEngine, retainPrevious: undefined },
    ]);
    assert.deepEqual(committedTypes, ["hls", "webrtc"]);
    assert.equal(hlsPlayers[0].removeCalled, true);
    assert.equal(hlsPlayers[0].cancelPendingTakeover, null);
    assert.equal(webRtcEngine.video.style.cssText.includes("left:-9999px"), false);
    assert.equal(unsubscribeCalls, 0);

    const recoveryReasons = [];
    receivingMounter = createHaDirectMounter({
      getHass: () => hass,
      getPreferredStreamType: () => "webrtc",
      getStreamMuted: () => true,
      getRotateOverlayActive: () => false,
      isCurrentEngine: (engine) => assignedEngine === engine,
      waitForStreamStart: async () => true,
      assignCommittedEngine: () => {},
      onCommittedMediaReady: () => {},
      onCommittedStream: () => {},
      applyResolvedStreamUiState: () => {},
      setLiveNativeControls: () => {},
      scheduleResumeLive: (reason) => recoveryReasons.push(reason),
    });
    assert.equal(mounter.detachWebRtcForHandoff(webRtcEngine), true);
    assert.equal(
      receivingMounter.adoptRetainedWebRtcEngine(webRtcEngine),
      true,
    );
    webRtcEngine.pc.connectionState = "failed";
    webRtcEngine.pc.onconnectionstatechange();
    assert.deepEqual(recoveryReasons, ["webrtc-connection-lost"]);
  } finally {
    (receivingMounter || mounter).release(assignedEngine);
    await flushAsyncWork();
    assert.equal(unsubscribeCalls, 1);
    globalThis.document = previousDocument;
    globalThis.MediaStream = previousMediaStream;
    globalThis.RTCPeerConnection = previousPeerConnection;
  }
});

function createHlsHarness(waitForStreamStart = async () => true) {
  let current = null;
  const types = [];
  const states = [];
  const mounter = createHaDirectMounter({
    getHass: () => ({ states: { "camera.front": { attributes: {} } } }),
    getPreferredStreamType: () => "hls",
    getStreamMuted: () => true,
    getRotateOverlayActive: () => false,
    isCurrentEngine: engine => current === engine,
    waitForStreamStart,
    assignCommittedEngine: engine => { current = engine; },
    onCommittedMediaReady: () => {},
    onCommittedStream: type => types.push(type),
    applyResolvedStreamUiState: state => states.push(state),
    setLiveNativeControls: () => {},
  });
  return {
    mounter, types, states,
    get engine() { return current; },
    setCurrent(engine) { current = engine; },
    mount: () => mounter.tryMount({ innerHTML: "", appendChild() {} }, null, {
      entity: "camera.front", commit: true,
    }),
  };
}

test("HLS clears a timed-out snapshot only after a fresh video frame", async () => {
  await withFakeDocument(async () => {
    const h = createHlsHarness(async () => false);
    await h.mount();
    await flushAsyncWork();
    assert.deepEqual(h.types, ["snapshot"]);
    const video = h.engine.video;
    video.currentTime = 100;
    video.readyState = 4;
    video.paused = false;
    h.engine.dispatch("load");
    h.engine.dispatch("streams", { hasVideo: true });
    await flushAsyncWork();
    assert.deepEqual(h.types, ["snapshot"], "old buffered data is not recovery");
    video.presentFrame();
    await flushAsyncWork();
    assert.deepEqual(h.types, ["snapshot", "hls"]);
    assert.equal(h.states.at(-1).fallbackVisible, false);
    assert.equal(video.pendingFrames().length, 0);
    h.mounter.release(h.engine);
  });
});

test("HLS recovers from repeated stream errors without hiding genuine failures", async () => {
  await withFakeDocument(async () => {
    const h = createHlsHarness();
    await h.mount();
    await flushAsyncWork();
    for (let i = 0; i < 2; i++) {
      h.engine.dispatch("streams", { hasVideo: false });
      await flushAsyncWork();
      assert.equal(h.types.at(-1), "snapshot");
      h.engine.video.dispatch("playing");
      assert.equal(h.types.at(-1), "snapshot", "playing event alone is insufficient");
      h.engine.video.presentFrame();
      await flushAsyncWork();
      assert.equal(h.types.at(-1), "hls");
    }
    assert.deepEqual(h.types, ["hls", "snapshot", "hls", "snapshot", "hls"]);
    h.mounter.release(h.engine);
  });
});

test("a stale startup timeout cannot overwrite recovered HLS", async () => {
  await withFakeDocument(async () => {
    let finishStartup;
    const h = createHlsHarness(() => new Promise(resolve => { finishStartup = resolve; }));
    await h.mount();
    h.engine.dispatch("streams", { hasVideo: false });
    await flushAsyncWork();
    h.engine.video.presentFrame();
    await flushAsyncWork();
    finishStartup(false);
    await flushAsyncWork();
    assert.deepEqual(h.types, ["snapshot", "hls"]);
    h.mounter.release(h.engine);
  });
});

test("a stale startup success cannot clear a newer HLS failure", async () => {
  await withFakeDocument(async () => {
    let finishStartup;
    const h = createHlsHarness(() => new Promise(resolve => { finishStartup = resolve; }));
    await h.mount();
    h.engine.dispatch("streams", { hasVideo: false });
    await flushAsyncWork();
    finishStartup(true);
    await flushAsyncWork();
    assert.deepEqual(h.types, ["snapshot"]);
    h.engine.video.presentFrame();
    await flushAsyncWork();
    assert.deepEqual(h.types, ["snapshot", "hls"]);
    h.mounter.release(h.engine);
  });
});

test("HLS recovers through timeupdate when frame callbacks exist but stay silent", async () => {
  await withFakeDocument(async () => {
    const h = createHlsHarness(async () => false);
    await h.mount();
    await flushAsyncWork();
    const video = h.engine.video;
    assert.equal(video.pendingFrames().length, 1);
    video.readyState = 4;
    video.videoWidth = 2560;
    video.paused = false;
    video.currentTime = 1;
    video.dispatch("timeupdate");
    await flushAsyncWork();
    assert.deepEqual(h.types, ["snapshot", "hls"]);
    assert.equal(video.pendingFrames().length, 0);
    h.mounter.release(h.engine);
  });
});

test("audio-only HLS time advancement does not clear the snapshot", async () => {
  await withFakeDocument(async () => {
    const h = createHlsHarness();
    await h.mount();
    await flushAsyncWork();
    const video = h.engine.video;
    video.requestVideoFrameCallback = undefined;
    h.engine.dispatch("streams", { hasVideo: false });
    await flushAsyncWork();
    video.readyState = 4;
    video.paused = false;
    video.currentTime = 1;
    video.dispatch("timeupdate");
    assert.equal(video.videoWidth, 0);
    assert.equal(h.types.at(-1), "snapshot");
    h.mounter.release(h.engine);
  });
});

test("a paused HLS frame does not clear fallback and recovery remains armed", async () => {
  await withFakeDocument(async () => {
    const h = createHlsHarness(async () => false);
    await h.mount();
    await flushAsyncWork();
    const video = h.engine.video;
    const callback = video.pendingFrames()[0];
    assert.equal(typeof callback, "function");
    video.readyState = 4;
    callback();
    assert.deepEqual(h.types, ["snapshot"]);
    video.presentFrame();
    await flushAsyncWork();
    assert.deepEqual(h.types, ["snapshot", "hls"]);
    h.mounter.release(h.engine);
  });
});

test("HLS release cancels recovery and rejects already-queued frame callbacks", async () => {
  await withFakeDocument(async () => {
    const h = createHlsHarness(async () => false);
    await h.mount();
    await flushAsyncWork();
    const video = h.engine.video;
    const queued = video.pendingFrames();
    assert.equal(queued.length, 1);
    h.mounter.release(h.engine);
    assert.equal(video.pendingFrames().length, 0);
    assert.equal(video.listenerCount("timeupdate"), 0);
    video.paused = false;
    video.readyState = 4;
    queued[0]();
    assert.deepEqual(h.types, ["snapshot"]);
  });
});

test("HLS recovery follows replacement video and ignores an obsolete engine", async () => {
  await withFakeDocument(async () => {
    const h = createHlsHarness(async () => false);
    await h.mount();
    await flushAsyncWork();
    const engine = h.engine;
    const oldVideo = engine.video;
    const queued = oldVideo.pendingFrames();
    assert.equal(queued.length, 1);
    engine.video = createFakeVideo("replacement");
    engine.dispatch("load");
    await flushAsyncWork();
    assert.equal(oldVideo.pendingFrames().length, 0);
    oldVideo.paused = false;
    oldVideo.readyState = 4;
    queued[0]();
    assert.deepEqual(h.types, ["snapshot"]);
    engine.video.presentFrame();
    await flushAsyncWork();
    assert.deepEqual(h.types, ["snapshot", "hls"]);
    engine.dispatch("streams", { hasVideo: false });
    await flushAsyncWork();
    h.setCurrent({});
    engine.video.presentFrame();
    await flushAsyncWork();
    assert.deepEqual(h.types, ["snapshot", "hls", "snapshot"]);
    h.mounter.release(engine);
  });
});

test("HLS recovery without frame callbacks requires unpaused time advancement", async () => {
  await withFakeDocument(async () => {
    const h = createHlsHarness();
    await h.mount();
    await flushAsyncWork();
    const video = h.engine.video;
    video.requestVideoFrameCallback = undefined;
    video.currentTime = 10;
    video.readyState = 4;
    video.videoWidth = 2560;
    h.engine.dispatch("streams", { hasVideo: false });
    await flushAsyncWork();
    video.dispatch("timeupdate");
    assert.equal(h.types.at(-1), "snapshot");
    video.currentTime = 11;
    video.dispatch("timeupdate");
    assert.equal(h.types.at(-1), "snapshot", "paused seeking is not playback");
    video.paused = false;
    video.dispatch("playing");
    assert.equal(h.types.at(-1), "snapshot");
    video.currentTime = 12;
    video.dispatch("timeupdate");
    await flushAsyncWork();
    assert.equal(h.types.at(-1), "hls");
    h.mounter.release(h.engine);
  });
});

test("HA Direct HLS grace-cache reuse preserves recovery without a duplicate connection", async () => {
  await withFakeDocument(async ({ hlsPlayers }) => {
    const hass = {
      states: {
        "camera.front": {
          entity_id: "camera.front",
          attributes: {},
        },
      },
    };
    let engine = null;
    let activeStreamType = "snapshot";
    let fallbackVisible = true;
    let mounter = null;
    const assignEngine = (nextEngine, options = {}) => {
      if (engine === nextEngine) return;
      if (options.retainPrevious !== true) mounter?.release?.(engine);
      engine = nextEngine;
    };
    const applyFallbackState = (visible) => {
      fallbackVisible = visible === true;
    };
    mounter = createHaDirectMounter({
      getHass: () => hass,
      getPreferredStreamType: () => "hls",
      getStreamMuted: () => true,
      getRotateOverlayActive: () => false,
      isCurrentEngine: (candidate) => engine === candidate,
      waitForStreamStart: async () => true,
      assignCommittedEngine: assignEngine,
      onCommittedMediaReady: () => {},
      onCommittedStream: (type) => {
        activeStreamType = type;
        applyFallbackState(false);
      },
      applyResolvedStreamUiState: (state) => {
        applyFallbackState(state?.fallbackVisible);
      },
      setLiveNativeControls: () => {},
    });
    const shadowRoot = {
      appendChild(node) {
        node.isConnected = true;
        return node;
      },
    };
    const graceController = createMseGraceController({
      graceMs: 20_000,
      graceMax: 3,
      getShadowRoot: () => shadowRoot,
      getScopeKey: () => ({ id: "ha-direct-hls-integration" }),
      getPendingMountDestroyers: () => [],
      setPendingMountDestroyers: () => {},
      getPendingWebRtcTakeoverTimer: () => null,
      setPendingWebRtcTakeoverTimer: () => {},
      clearRotateOverlayAudioSync: () => {},
      clearRotateVideoFullscreenStyle: () => {},
      getEngine: () => engine,
      setEngine: assignEngine,
      getActiveStreamType: () => activeStreamType,
      getStreamMuted: () => true,
      setEngineMountedMuted: () => {},
      getRotateOverlayActive: () => false,
      attachVideoFit: () => {},
      setActiveStreamType: (type) => {
        activeStreamType = type;
      },
      setStreamLoading: () => {},
      setStreamFallbackVisible: applyFallbackState,
      setLiveNativeControls: () => {},
      releaseHaDirectEngine: (releasedEngine) =>
        mounter.release(releasedEngine),
      adoptHaDirectWebRtcEngine: () => {
        throw new Error("HLS must not enter WebRTC ownership adoption");
      },
    });
    const initialSlot = {
      innerHTML: "",
      appendChild(node) {
        this.child = node;
        node.parentElement = this;
      },
    };

    await mounter.tryMount(
      initialSlot,
      { streamType: "hls" },
      { entity: "camera.front", commit: true },
    );
    await flushAsyncWork();

    const mountedEngine = engine;
    assert.equal(hlsPlayers.length, 1);
    assert.equal(activeStreamType, "hls");
    assert.equal(fallbackVisible, false);
    assert.equal(mountedEngine.listenerCount("streams"), 1);

    graceController.cleanupEngine({ preserveLiveEntity: "camera.front" });
    const cachedEntry = graceController.takeGraceHaDirectEntry(
      "camera.front",
      "hls",
    );

    assert.equal(engine, null);
    assert.equal(cachedEntry?.engine, mountedEngine);
    assert.equal(hlsPlayers.length, 1);
    assert.equal(mountedEngine.listenerCount("streams"), 1);

    const returnSlot = {
      innerHTML: "occupied",
      appendChild(node) {
        this.child = node;
        node.parentElement = this;
      },
    };
    assert.equal(
      graceController.adoptGraceHaDirectEngine(
        returnSlot,
        cachedEntry.engine,
      ),
      true,
    );
    assert.equal(engine, mountedEngine);
    assert.equal(returnSlot.child, mountedEngine);
    assert.equal(hlsPlayers.length, 1);
    assert.equal(activeStreamType, "hls");

    mountedEngine.dispatch("streams", { hasVideo: false });
    await flushAsyncWork();
    assert.equal(activeStreamType, "snapshot");
    assert.equal(fallbackVisible, true);
    assert.equal(mountedEngine.video.pendingFrames().length, 1);

    mountedEngine.video.presentFrame();
    await flushAsyncWork();
    assert.equal(activeStreamType, "hls");
    assert.equal(fallbackVisible, false);
    assert.equal(hlsPlayers.length, 1);

    graceController.cleanupEngine();
    assert.equal(engine, null);
    assert.equal(mountedEngine.listenerCount("load"), 0);
    assert.equal(mountedEngine.listenerCount("streams"), 0);
    assert.equal(mountedEngine.video.listenerCount("timeupdate"), 0);
    assert.equal(mountedEngine.video.pendingFrames().length, 0);
    graceController.clearGracePool();
  });
});

test("ha direct mounter serializes WebRTC teardown before the next offer", async () => {
  const previousDocument = globalThis.document;
  const previousMediaStream = globalThis.MediaStream;
  const previousPeerConnection = globalThis.RTCPeerConnection;
  let assignedEngine = null;
  let resolveFirstUnsubscribe = null;
  const subscriptionCalls = [];
  const hlsPlayers = [];

  class FakePeerConnection {
    constructor() {
      this.connectionState = "new";
      this.iceConnectionState = "new";
    }

    addTransceiver() {
      return { stop() {} };
    }

    getTransceivers() {
      return [];
    }

    async createOffer() {
      return { type: "offer", sdp: "ha-direct-offer" };
    }

    async setLocalDescription() {
      this.ontrack?.({
        track: { kind: "video", stop() {} },
        streams: [],
      });
    }

    async setRemoteDescription() {}

    close() {}
  }

  globalThis.document = {
    createElement(tag) {
      if (tag === "video") {
        return {
          tagName: "VIDEO",
          style: {},
          dataset: {},
          classList: { add() {} },
          setAttribute() {},
          removeAttribute() {},
          play: () => Promise.resolve(),
          pause() {},
        };
      }
      if (tag === "ha-hls-player") {
        const player = createFakeStreamElement();
        hlsPlayers.push(player);
        return player;
      }
      throw new Error(`Unexpected tag: ${tag}`);
    },
  };
  globalThis.MediaStream = class {
    addTrack() {}
    getTracks() {
      return [];
    }
  };
  globalThis.RTCPeerConnection = FakePeerConnection;

  const hass = {
    states: {
      "camera.front": { entity_id: "camera.front", attributes: {} },
      "camera.back": { entity_id: "camera.back", attributes: {} },
    },
    callWS: async () => ({ configuration: { iceServers: [] } }),
    connection: {
      subscribeMessage(callback, message, options) {
        const callIndex = subscriptionCalls.length;
        subscriptionCalls.push({ callback, message, options });
        queueMicrotask(() =>
          callback({ type: "answer", answer: `answer-${callIndex}` }),
        );
        return Promise.resolve(() => {
          if (callIndex !== 0) return Promise.resolve();
          return new Promise((resolve) => {
            resolveFirstUnsubscribe = resolve;
          });
        });
      },
    },
  };
  const slot = {
    innerHTML: "",
    appendChild(node) {
      this.lastChild = node;
    },
  };
  const mounter = createHaDirectMounter({
    getHass: () => hass,
    getPreferredStreamType: () => "webrtc",
    getStreamMuted: () => true,
    getRotateOverlayActive: () => false,
    isCurrentEngine: (engine) => assignedEngine === engine,
    waitForStreamStart: async (engine) =>
      engine?.tagName !== "HA-HLS-PLAYER",
    assignCommittedEngine: (engine) => {
      assignedEngine = engine;
    },
    onCommittedMediaReady: () => {},
    onCommittedStream: () => {},
    applyResolvedStreamUiState: () => {},
    setLiveNativeControls: () => {},
    scheduleResumeLive: () => {},
  });

  try {
    await mounter.tryMount(slot, null, {
      entity: "camera.front",
      commit: true,
    });
    await flushAsyncWork();
    await flushAsyncWork();
    assert.equal(subscriptionCalls.length, 1);
    assert.equal(hlsPlayers[0].removeCalled, true);

    mounter.release(assignedEngine);
    await mounter.tryMount(slot, null, {
      entity: "camera.back",
      commit: true,
    });
    await flushAsyncWork();
    assert.equal(subscriptionCalls.length, 1);

    resolveFirstUnsubscribe();
    await flushAsyncWork();
    await flushAsyncWork();

    assert.equal(subscriptionCalls.length, 2);
    assert.equal(subscriptionCalls[1].message.entity_id, "camera.back");
  } finally {
    mounter.release(assignedEngine);
    globalThis.document = previousDocument;
    globalThis.MediaStream = previousMediaStream;
    globalThis.RTCPeerConnection = previousPeerConnection;
  }
});
