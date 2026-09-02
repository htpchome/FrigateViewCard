import { test } from "node:test";
import assert from "node:assert/strict";

import { createGo2RtcMounter } from "../src/features/live/go2rtc-mounter.js";

function createFakeVideoElement() {
  const attrs = new Map();
  const classSet = new Set();
  const style = { cssText: "" };
  const dataset = {};
  let classNameValue = "";
  const listeners = new Map();

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
    playCalls: 0,
    loadCalls: 0,
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
    addEventListener(type, handler) {
      listeners.set(type, handler);
    },
    dispatchEvent(event) {
      listeners.get(event?.type)?.(event);
    },
    pause() {
      this.paused = true;
    },
    play() {
      this.playCalls += 1;
      this.paused = false;
      return Promise.resolve();
    },
    load() {
      this.loadCalls += 1;
    },
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

function withFakeObjectUrl(run) {
  const createDescriptor = Object.getOwnPropertyDescriptor(
    globalThis.URL,
    "createObjectURL",
  );
  const revokeDescriptor = Object.getOwnPropertyDescriptor(
    globalThis.URL,
    "revokeObjectURL",
  );
  const revoked = [];
  Object.defineProperty(globalThis.URL, "createObjectURL", {
    configurable: true,
    value: () => "blob:managed-media-source",
  });
  Object.defineProperty(globalThis.URL, "revokeObjectURL", {
    configurable: true,
    value: (url) => revoked.push(url),
  });
  return Promise.resolve()
    .then(() => run(revoked))
    .finally(() => {
      if (createDescriptor) {
        Object.defineProperty(
          globalThis.URL,
          "createObjectURL",
          createDescriptor,
        );
      } else {
        delete globalThis.URL.createObjectURL;
      }
      if (revokeDescriptor) {
        Object.defineProperty(
          globalThis.URL,
          "revokeObjectURL",
          revokeDescriptor,
        );
      } else {
        delete globalThis.URL.revokeObjectURL;
      }
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

test("go2rtc mounter does not open WebRTC signaling after URL resolution was cancelled", async () => {
  const abortController = new AbortController();
  let releaseUrl;
  let socketConstructions = 0;
  let peerConstructions = 0;
  class FakeWebSocket {
    constructor() {
      socketConstructions += 1;
    }
  }
  class FakePeerConnection {
    constructor() {
      peerConstructions += 1;
    }
  }
  const mounter = createBaseMounter({
    resolver: {
      resolveMountRequest: () => ({
        entity: "camera.front",
        abortSignal: abortController.signal,
      }),
      websocketUrlForEntity: async () =>
        await new Promise((resolve) => {
          releaseUrl = resolve;
        }),
    },
  });

  const result = await withFakeWindow(
    {
      WebSocket: FakeWebSocket,
      RTCPeerConnection: FakePeerConnection,
    },
    async () => {
      const mount = mounter.tryMountWebRtc(createSlot());
      abortController.abort();
      releaseUrl("ws://example.test/api/ws");
      return await mount;
    },
  );

  assert.equal(result, false);
  assert.equal(socketConstructions, 0);
  assert.equal(peerConstructions, 0);
});

test("go2rtc mounter closes an in-flight WebRTC socket when cancelled", async () => {
  await withFakeDocument(async () => {
    const previousWebSocket = globalThis.WebSocket;
    const previousRtcPeerConnection = globalThis.RTCPeerConnection;
    const abortController = new AbortController();
    const sockets = [];
    let socketCloseCalls = 0;
    let peerCloseCalls = 0;
    class FakeWebSocket {
      static OPEN = 1;

      constructor() {
        this.readyState = 0;
        this._listeners = new Map();
        this.sent = [];
        sockets.push(this);
      }

      addEventListener(type, handler) {
        this._listeners.set(type, handler);
      }

      send(value) {
        this.sent.push(value);
      }

      close() {
        socketCloseCalls += 1;
        if (this.readyState === FakeWebSocket.OPEN) this.readyState = 3;
      }

      open() {
        this.readyState = FakeWebSocket.OPEN;
        this._listeners.get("open")?.();
      }
    }
    class FakePeerConnection {
      constructor() {
        this._listeners = new Map();
      }

      addTransceiver() {}

      addEventListener(type, handler) {
        this._listeners.set(type, handler);
      }

      getTransceivers() {
        return [];
      }

      async createOffer() {
        return { type: "offer", sdp: "late-offer" };
      }

      async setLocalDescription() {}

      close() {
        peerCloseCalls += 1;
      }
    }
    globalThis.WebSocket = FakeWebSocket;
    globalThis.RTCPeerConnection = FakePeerConnection;

    const mounter = createBaseMounter({
      resolver: {
        resolveMountRequest: () => ({
          entity: "camera.front",
          abortSignal: abortController.signal,
        }),
      },
      waitForStreamStart: async (_slot, _waitMs, options) =>
        await new Promise((resolve) => {
          options.abortSignal.addEventListener(
            "abort",
            () => resolve(false),
            { once: true },
          );
        }),
    });

    try {
      const result = await withFakeWindow(
        {
          WebSocket: FakeWebSocket,
          RTCPeerConnection: FakePeerConnection,
        },
        async () => {
          const mount = mounter.tryMountWebRtc(createSlot());
          await new Promise((resolve) => setImmediate(resolve));
          abortController.abort();
          return await mount;
        },
      );

      assert.equal(result, false);
      assert.equal(socketCloseCalls, 1);
      assert.equal(peerCloseCalls, 1);

      sockets[0].open();
      await new Promise((resolve) => setImmediate(resolve));

      assert.equal(socketCloseCalls, 2);
      assert.deepEqual(sockets[0].sent, []);
    } finally {
      globalThis.WebSocket = previousWebSocket;
      globalThis.RTCPeerConnection = previousRtcPeerConnection;
    }
  });
});

test("go2rtc mounter force-closes WebRTC signaling that never connects", async () => {
  await withFakeDocument(async () => {
    const previousWebSocket = globalThis.WebSocket;
    const previousRtcPeerConnection = globalThis.RTCPeerConnection;
    let socketCloseCalls = 0;
    let peerCloseCalls = 0;
    const sentMessages = [];

    class FakeWebSocket {
      static OPEN = 1;

      constructor() {
        this.readyState = 0;
        this._listeners = new Map();
        queueMicrotask(() => {
          this.readyState = FakeWebSocket.OPEN;
          this._listeners.get("open")?.();
        });
      }

      addEventListener(type, handler) {
        this._listeners.set(type, handler);
      }

      send(value) {
        sentMessages.push(JSON.parse(value));
      }

      close() {
        socketCloseCalls += 1;
        this.readyState = 3;
      }
    }

    class FakePeerConnection {
      constructor() {
        this.connectionState = "connecting";
        this.iceConnectionState = "checking";
        this._listeners = new Map();
      }

      addTransceiver() {}

      addEventListener(type, handler) {
        this._listeners.set(type, handler);
      }

      getTransceivers() {
        return [];
      }

      async createOffer() {
        return { type: "offer", sdp: "blocked-offer" };
      }

      async setLocalDescription() {}

      close() {
        peerCloseCalls += 1;
        this.connectionState = "closed";
      }
    }

    globalThis.WebSocket = FakeWebSocket;
    globalThis.RTCPeerConnection = FakePeerConnection;

    const mounter = createBaseMounter({
      resolver: {
        resolveMountRequest: (options) => ({
          entity: "camera.front",
          abortSignal: options.abortSignal || null,
          commit: false,
        }),
      },
      waitForStreamStart: async () => await new Promise(() => {}),
    });

    try {
      const result = await withFakeWindow(
        {
          WebSocket: FakeWebSocket,
          RTCPeerConnection: FakePeerConnection,
        },
        () =>
          mounter.tryMountWebRtc(createSlot(), null, {
            commit: false,
            negotiationTimeoutMs: 15,
          }),
      );

      assert.equal(result, false);
      assert.equal(
        sentMessages.some(({ type }) => type === "webrtc/offer"),
        true,
      );
      assert.equal(socketCloseCalls, 1);
      assert.equal(peerCloseCalls, 1);
    } finally {
      globalThis.WebSocket = previousWebSocket;
      globalThis.RTCPeerConnection = previousRtcPeerConnection;
    }
  });
});

test("go2rtc mounter MSE path supports ManagedMediaSource and starts playback", async () => {
  await withFakeDocument(async () => {
    await withFakeObjectUrl(async (revoked) => {
      const mediaSources = [];
      const sockets = [];
      const supportedTypeContexts = [];
      let releaseStartup = null;
      let markedChunks = 0;
      const recoveryReasons = [];

      class FakeSourceBuffer {
        constructor() {
          this.mode = "";
          this.updating = false;
          this.appended = [];
          this._listeners = new Map();
        }

        addEventListener(type, handler) {
          this._listeners.set(type, handler);
        }

        appendBuffer(buffer) {
          this.appended.push(buffer);
        }
      }

      class FakeManagedMediaSource {
        static isTypeSupported(mime) {
          supportedTypeContexts.push(this);
          return /^video\/mp4; codecs=".+"$/.test(mime);
        }

        constructor() {
          this.readyState = "closed";
          this._listeners = new Map();
          this.sourceBuffers = [];
          mediaSources.push(this);
        }

        addEventListener(type, handler) {
          this._listeners.set(type, handler);
        }

        open() {
          this.readyState = "open";
          this._listeners.get("sourceopen")?.({ type: "sourceopen" });
        }

        addSourceBuffer(mime) {
          this.addedMime = mime;
          const sourceBuffer = new FakeSourceBuffer();
          this.sourceBuffers.push(sourceBuffer);
          return sourceBuffer;
        }
      }

      class FakeWebSocket {
        static OPEN = 1;

        constructor(url) {
          this.url = url;
          this.readyState = 0;
          this.sent = [];
          this._listeners = new Map();
          sockets.push(this);
        }

        addEventListener(type, handler) {
          this._listeners.set(type, handler);
        }

        send(value) {
          this.sent.push(value);
        }

        open() {
          this.readyState = FakeWebSocket.OPEN;
          this._listeners.get("open")?.({ type: "open" });
        }

        message(data) {
          this._listeners.get("message")?.({ type: "message", data });
        }

        close() {
          this.readyState = 3;
        }

        closeFromServer() {
          this.readyState = 3;
          this._listeners.get("close")?.({ type: "close" });
        }
      }

      const slot = createSlot();
      const mounter = createBaseMounter({
        waitForStreamStart: async (target, waitMs, opts) => {
          assert.equal(target, slot);
          assert.equal(waitMs, 8000);
          assert.equal(opts.requireReadyState, 3);
          return await new Promise((resolve) => {
            releaseStartup = resolve;
          });
        },
        markMseChunk: () => {
          markedChunks += 1;
        },
        scheduleResumeLive: (reason) => recoveryReasons.push(reason),
      });

      const result = await withFakeWindow(
        {
          ManagedMediaSource: FakeManagedMediaSource,
          WebSocket: FakeWebSocket,
        },
        async () => {
          const mountPromise = mounter.tryMountMse(slot);
          await new Promise((resolve) => setTimeout(resolve, 0));

          assert.equal(mediaSources.length, 1);
          assert.equal(sockets.length, 1);
          mediaSources[0].open();
          sockets[0].open();
          assert.equal(sockets[0].sent.length, 1);
          assert.equal(JSON.parse(sockets[0].sent[0]).type, "mse");

          sockets[0].message(
            JSON.stringify({ type: "mse", value: "avc1.640029" }),
          );
          const chunk = new ArrayBuffer(8);
          sockets[0].message(chunk);
          releaseStartup(true);
          return await mountPromise;
        },
      );

      assert.equal(result.ok, true);
      assert.equal(result.type, "mse");
      assert.equal(slot.lastChild.playCalls >= 2, true);
      assert.equal(mediaSources[0].sourceBuffers.length, 1);
      assert.equal(mediaSources[0].sourceBuffers[0].appended.length, 1);
      assert.equal(markedChunks, 1);
      sockets[0].closeFromServer();
      assert.deepEqual(recoveryReasons, []);
      result.engine.activateRecovery();
      sockets[0].closeFromServer();
      assert.deepEqual(recoveryReasons, ["mse-ws-closed"]);
      assert.equal(
        supportedTypeContexts.every(
          (context) => context === FakeManagedMediaSource,
        ),
        true,
      );
      result.engine.destroy();
      assert.deepEqual(revoked, ["blob:managed-media-source"]);
    });
  });
});

test("go2rtc mounter HLS path commits the mounted engine on success", async () => {
  await withFakeDocument(async () => {
    const slot = createSlot();
    let attached = 0;
    let committedType = "";
    let assignedEngine = null;
    const recoveryReasons = [];
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
      scheduleResumeLive: (reason) => recoveryReasons.push(reason),
      waitForStreamStart: async (target, waitMs, opts) => {
        assert.equal(target, slot);
        assert.equal(
          target.lastChild.src,
          "https://example.test/live.m3u8",
        );
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
    assert.equal(assignedEngine.video.loadCalls, 1);
    assert.equal(assignedEngine.video.playCalls, 1);
    assignedEngine.video.dispatchEvent({ type: "error" });
    assert.deepEqual(recoveryReasons, ["hls-error"]);
    assignedEngine.destroy();
    assignedEngine.video.dispatchEvent({ type: "ended" });
    assert.deepEqual(recoveryReasons, ["hls-error"]);
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
    const recoveryReasons = [];
    const mounter = createBaseMounter({
      resolver: {
        resolveMountRequest: () => ({ entity: "camera.front", commit: true }),
      },
      assignCommittedEngine: (engine) => {
        assignedEngine = engine;
      },
      scheduleResumeLive: (reason) => recoveryReasons.push(reason),
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
      assignedEngine.pc.connectionState = "disconnected";
      assignedEngine.pc.emit("connectionstatechange");
      assert.deepEqual(recoveryReasons, ["webrtc-connection-lost"]);
      assignedEngine.destroy();
      assert.equal(closeCalls, 1);
    } finally {
      globalThis.WebSocket = previousWebSocket;
      globalThis.RTCPeerConnection = previousRtcPeerConnection;
    }
  });
});

test("go2rtc talk mounting uses one peer for microphone, video, and camera audio", async () => {
  await withFakeDocument(async () => {
    const previousWebSocket = globalThis.WebSocket;
    const previousRtcPeerConnection = globalThis.RTCPeerConnection;
    const transceivers = [];
    let assignedEngine = null;
    let microphoneStopCalls = 0;
    let talkEndedCalls = 0;
    const microphoneTrack = {
      addEventListener() {},
      stop() {
        microphoneStopCalls += 1;
      },
    };
    const microphoneStream = {
      getAudioTracks: () => [microphoneTrack],
      getTracks: () => [microphoneTrack],
    };

    class FakeWebSocket {
      static OPEN = 1;

      constructor() {
        this.readyState = FakeWebSocket.OPEN;
        this._listeners = new Map();
      }

      addEventListener(type, handler) {
        this._listeners.set(type, handler);
      }

      send() {}

      close() {
        this.readyState = 3;
      }
    }

    class FakePeerConnection {
      constructor() {
        this.connectionState = "new";
        this.iceConnectionState = "new";
        this._listeners = new Map();
      }

      addTransceiver(trackOrKind, options) {
        transceivers.push([trackOrKind, options]);
        return { stop() {} };
      }

      addEventListener(type, handler) {
        this._listeners.set(type, handler);
      }

      emit(type) {
        this._listeners.get(type)?.({});
      }

      getTransceivers() {
        return [];
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
      const result = await withFakeWindow(
        {
          WebSocket: FakeWebSocket,
          RTCPeerConnection: FakePeerConnection,
        },
        () =>
          mounter.tryMountWebRtc(createSlot(), null, {
            microphoneStream,
            onEnded: () => {
              talkEndedCalls += 1;
            },
          }),
      );

      assert.equal(result, true);
      assert.deepEqual(transceivers, [
        [
          microphoneTrack,
          { direction: "sendonly", streams: [microphoneStream] },
        ],
        ["video", { direction: "recvonly" }],
        ["audio", { direction: "recvonly" }],
      ]);
      assert.equal(assignedEngine.microphoneStream, microphoneStream);

      assignedEngine.pc.connectionState = "disconnected";
      assignedEngine.pc.emit("connectionstatechange");
      assert.equal(talkEndedCalls, 1);
      assert.equal(microphoneStopCalls, 1);
    } finally {
      assignedEngine?.destroy?.();
      globalThis.WebSocket = previousWebSocket;
      globalThis.RTCPeerConnection = previousRtcPeerConnection;
    }
  });
});
