import { test } from "node:test";
import assert from "node:assert/strict";

import { createGo2RtcMounter } from "../src/features/live/go2rtc-mounter.js";

function createFakeVideoElement() {
  const attrs = new Map();
  const classSet = new Set();
  const style = { cssText: "" };
  const dataset = {};
  let classNameValue = "";

  const syncClassName = () => {
    classNameValue = [...classSet].join(" ");
  };

  return {
    autoplay: false,
    playsInline: false,
    muted: false,
    defaultMuted: false,
    controls: false,
    preload: "",
    src: "",
    style,
    dataset,
    paused: false,
    get className() {
      return classNameValue;
    },
    set className(value) {
      classSet.clear();
      const text = String(value || "").trim();
      if (text) {
        for (const token of text.split(/\s+/)) {
          classSet.add(token);
        }
      }
      syncClassName();
    },
    classList: {
      add(...tokens) {
        for (const token of tokens) {
          const next = String(token || "").trim();
          if (!next) continue;
          classSet.add(next);
        }
        syncClassName();
      },
    },
    setAttribute(name, value) {
      attrs.set(name, String(value));
    },
    removeAttribute(name) {
      attrs.delete(name);
      if (name === "src") this.src = "";
    },
    hasAttribute(name) {
      return attrs.has(name);
    },
    addEventListener() {},
    pause() {
      this.paused = true;
    },
    load() {},
  };
}

function withFakeDocument(run) {
  const previousDocument = globalThis.document;
  globalThis.document = {
    createElement: (tag) => {
      if (String(tag).toLowerCase() !== "video") {
        throw new Error(`Unexpected tag: ${tag}`);
      }
      return createFakeVideoElement();
    },
  };
  return Promise.resolve()
    .then(() => run())
    .finally(() => {
      globalThis.document = previousDocument;
    });
}

function withFakeWindow(fakeWindow, run) {
  const previousWindow = globalThis.window;
  globalThis.window = fakeWindow;
  return Promise.resolve()
    .then(() => run())
    .finally(() => {
      globalThis.window = previousWindow;
    });
}

function createSlot() {
  return {
    innerHTML: "occupied",
    appended: [],
    appendChild(node) {
      this.appended.push(node);
      this.lastChild = node;
    },
  };
}

function createBaseMounter(overrides = {}) {
  const resolver = {
    resolveMountRequest: () => ({ entity: "camera.front" }),
    websocketUrlForEntity: async () => "ws://example.test/api/ws",
    hlsUrlForEntity: async () => ({ url: "https://example.test/live.m3u8" }),
    ...(overrides.resolver || {}),
  };
  return createGo2RtcMounter({
    resolver,
    getStreamMuted: () => false,
    waitForStreamStart: async () => true,
    attachVideoFit: () => {},
    assignCommittedEngine: () => {},
    onCommittedStream: () => {},
    scheduleResumeLive: () => {},
    isFirefox: () => false,
    scopeKey: {},
    resetMseDiagnostics: () => {},
    markMseChunk: () => {},
    ...overrides,
    resolver,
  });
}

test("go2rtc mounter MSE path exits when no mount entity resolves", async () => {
  const slot = createSlot();
  let wsLookups = 0;
  const mounter = createBaseMounter({
    resolver: {
      resolveMountRequest: () => ({ entity: "" }),
      websocketUrlForEntity: async () => {
        wsLookups += 1;
        return "ws://should-not-run";
      },
    },
  });

  const result = await withFakeWindow({}, () => mounter.tryMountMse(slot));
  assert.equal(result, false);
  assert.equal(wsLookups, 0);
});

test("go2rtc mounter WebRTC path exits when browser support is unavailable", async () => {
  const slot = createSlot();
  let wsLookups = 0;
  const mounter = createBaseMounter({
    resolver: {
      websocketUrlForEntity: async () => {
        wsLookups += 1;
        return "ws://should-not-run";
      },
    },
  });

  const result = await withFakeWindow({}, () => mounter.tryMountWebRtc(slot));
  assert.equal(result, false);
  assert.equal(wsLookups, 0);
});

test("go2rtc mounter HLS path commits the mounted engine on success", async () => {
  await withFakeDocument(async () => {
    const slot = createSlot();
    let attached = 0;
    let committedType = "";
    let assignedEngine = null;
    const mounter = createBaseMounter({
      resolver: {
        resolveMountRequest: () => ({ entity: "camera.front", commit: true }),
        hlsUrlForEntity: async () => ({
          url: "https://example.test/live.m3u8",
          destroy: () => {},
        }),
      },
      attachVideoFit: () => {
        attached += 1;
      },
      assignCommittedEngine: (engine) => {
        assignedEngine = engine;
      },
      onCommittedStream: (type) => {
        committedType = type;
      },
      waitForStreamStart: async (video, waitMs, opts) => {
        assert.equal(video.src, "https://example.test/live.m3u8");
        assert.equal(waitMs, 5000);
        assert.equal(opts.requireReadyState, 2);
        return true;
      },
    });

    const result = await withFakeWindow({}, () => mounter.tryMountHls(slot));
    assert.equal(result, true);
    assert.equal(attached, 1);
    assert.equal(committedType, "hls");
    assert.equal(slot.innerHTML, "");
    assert.ok(assignedEngine);
    assert.equal(assignedEngine.video, slot.lastChild);
  });
});

test("go2rtc mounter WebRTC keeps signaling open until engine teardown", async () => {
  await withFakeDocument(async () => {
    const previousWebSocket = globalThis.WebSocket;
    const previousRtcPeerConnection = globalThis.RTCPeerConnection;

    let closeCalls = 0;
    class FakeWebSocket {
      constructor() {
        this.readyState = 1;
        this._listeners = new Map();
      }

      addEventListener(type, handler) {
        this._listeners.set(type, handler);
      }

      send() {}

      close() {
        closeCalls += 1;
        this.readyState = 3;
      }
    }

    class FakePeerConnection {
      constructor() {
        this.connectionState = "new";
        this.iceConnectionState = "new";
        this._listeners = new Map();
      }

      addTransceiver() {}

      addEventListener(type, handler) {
        this._listeners.set(type, handler);
      }

      emit(type) {
        const handler = this._listeners.get(type);
        if (handler) handler({});
      }

      async createOffer() {
        return { sdp: "sdp" };
      }

      async setLocalDescription() {}

      async setRemoteDescription() {}

      async addIceCandidate() {}

      close() {}
    }

    globalThis.WebSocket = FakeWebSocket;
    globalThis.RTCPeerConnection = FakePeerConnection;

    let assignedEngine = null;
    const mounter = createBaseMounter({
      resolver: {
        resolveMountRequest: () => ({ entity: "camera.front", commit: true }),
      },
      assignCommittedEngine: (engine) => {
        assignedEngine = engine;
      },
      waitForStreamStart: async () => true,
    });

    try {
      const slot = createSlot();
      const result = await withFakeWindow(
        {
          WebSocket: FakeWebSocket,
          RTCPeerConnection: FakePeerConnection,
        },
        () => mounter.tryMountWebRtc(slot),
      );

      assert.equal(result, true);
      assert.ok(assignedEngine?.pc);
      assignedEngine.pc.connectionState = "connected";
      assignedEngine.pc.emit("connectionstatechange");
      await new Promise((resolve) => setTimeout(resolve, 0));
      assert.equal(closeCalls, 0);
      assignedEngine.destroy();
      assert.equal(closeCalls, 1);
    } finally {
      globalThis.WebSocket = previousWebSocket;
      globalThis.RTCPeerConnection = previousRtcPeerConnection;
    }
  });
});
