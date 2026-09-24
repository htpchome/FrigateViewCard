import { readFile } from "node:fs/promises";
import { test } from "node:test";
import assert from "node:assert/strict";

import { createGo2RtcTwoWayTalkBackchannel } from "../src/features/two-way-talk/go2rtc-backchannel.js";

class FakeEventTarget {
  constructor() {
    this.listeners = new Map();
  }

  addEventListener(type, listener) {
    const listeners = this.listeners.get(type) || [];
    listeners.push(listener);
    this.listeners.set(type, listeners);
  }

  removeEventListener(type, listener) {
    const listeners = this.listeners.get(type) || [];
    this.listeners.set(
      type,
      listeners.filter((candidate) => candidate !== listener),
    );
  }

  emit(type, detail = {}) {
    const event = { ...detail, currentTarget: this, target: this };
    for (const listener of this.listeners.get(type) || []) {
      listener(event);
    }
  }
}

class FakePeerConnection extends FakeEventTarget {
  constructor(config) {
    super();
    this.config = config;
    this.connectionState = "new";
    this.transceivers = [];
    this.localDescription = null;
    this.remoteDescription = null;
    this.candidates = [];
    this.closeCalls = 0;
  }

  addTransceiver(track, options) {
    const transceiver = {
      track,
      options,
      currentDirection: null,
      stopCalls: 0,
      stop() {
        this.stopCalls += 1;
      },
    };
    this.transceivers.push(transceiver);
    return transceiver;
  }

  async createOffer() {
    return { type: "offer", sdp: "microphone-offer" };
  }

  async setLocalDescription(description) {
    this.localDescription = description;
  }

  async setRemoteDescription(description) {
    this.remoteDescription = description;
  }

  async addIceCandidate(candidate) {
    this.candidates.push(candidate);
  }

  close() {
    this.closeCalls += 1;
    this.connectionState = "closed";
  }
}

class FakeWebSocket extends FakeEventTarget {
  constructor(url) {
    super();
    this.url = url;
    this.readyState = 0;
    this.sent = [];
    this.closeCalls = 0;
  }

  send(message) {
    this.sent.push(JSON.parse(message));
  }

  close() {
    this.closeCalls += 1;
    this.readyState = 3;
  }
}

const flushPromises = async () => {
  await Promise.resolve();
  await Promise.resolve();
  await Promise.resolve();
};

const createMicrophone = () => {
  let stopCalls = 0;
  const track = new FakeEventTarget();
  track.kind = "audio";
  track.readyState = "live";
  track.stop = () => {
    stopCalls += 1;
    track.readyState = "ended";
  };
  const stream = {
    getAudioTracks: () => [track],
    getTracks: () => [track],
  };
  return { stream, track, getStopCalls: () => stopCalls };
};

const startConnectedBackchannel = async ({ onEnded } = {}) => {
  let peerConnection = null;
  let webSocket = null;
  const microphone = createMicrophone();
  const backchannel = createGo2RtcTwoWayTalkBackchannel({
    resolveWebSocketUrl: async (entity) => {
      assert.equal(entity, "camera.front");
      return "ws://example.test/go2rtc";
    },
    createPeerConnection: (config) => {
      peerConnection = new FakePeerConnection(config);
      return peerConnection;
    },
    createWebSocket: (url) => {
      webSocket = new FakeWebSocket(url);
      return webSocket;
    },
    connectionTimeoutMs: 1000,
  });

  const connection = backchannel.connect({
    entity: "camera.front",
    microphoneStream: microphone.stream,
    onEnded,
  });
  await flushPromises();
  webSocket.readyState = 1;
  webSocket.emit("open");
  await flushPromises();
  peerConnection.transceivers[0].currentDirection = "sendonly";
  peerConnection.connectionState = "connected";
  peerConnection.emit("connectionstatechange");

  return {
    engine: await connection,
    microphone,
    peerConnection,
    webSocket,
  };
};

test("go2rtc two-way talk uses a separate send-only microphone peer", async () => {
  const { engine, microphone, peerConnection, webSocket } =
    await startConnectedBackchannel();

  assert.equal(engine.type, "frigate_go2rtc_backchannel");
  assert.equal(engine.microphoneStream, microphone.stream);
  assert.equal(peerConnection.transceivers.length, 1);
  assert.equal(peerConnection.transceivers[0].track, microphone.track);
  assert.deepEqual(peerConnection.transceivers[0].options, {
    direction: "sendonly",
    streams: [microphone.stream],
  });
  assert.deepEqual(webSocket.sent, [
    { type: "webrtc/offer", value: "microphone-offer" },
  ]);
  assert.equal(webSocket.closeCalls, 1);
  assert.equal(microphone.getStopCalls(), 0);

  engine.destroy();
  engine.destroy();

  assert.equal(peerConnection.closeCalls, 1);
  assert.equal(peerConnection.transceivers[0].stopCalls, 1);
  assert.equal(microphone.getStopCalls(), 0);
});

test("an established go2rtc backchannel reports failure without owning live video", async () => {
  let endedCalls = 0;
  const { microphone, peerConnection } = await startConnectedBackchannel({
    onEnded: () => {
      endedCalls += 1;
    },
  });

  peerConnection.connectionState = "failed";
  peerConnection.emit("connectionstatechange");
  peerConnection.emit("connectionstatechange");

  assert.equal(endedCalls, 1);
  assert.equal(microphone.getStopCalls(), 1);
  assert.equal(peerConnection.closeCalls, 1);
});

test("aborting a pending go2rtc talk connection closes only its signaling peer", async () => {
  const abortController = new AbortController();
  const microphone = createMicrophone();
  let peerConnection = null;
  let webSocket = null;
  const backchannel = createGo2RtcTwoWayTalkBackchannel({
    resolveWebSocketUrl: async () => "ws://example.test/go2rtc",
    createPeerConnection: (config) => {
      peerConnection = new FakePeerConnection(config);
      return peerConnection;
    },
    createWebSocket: (url) => {
      webSocket = new FakeWebSocket(url);
      return webSocket;
    },
    connectionTimeoutMs: 1000,
  });

  const connection = backchannel.connect({
    entity: "camera.front",
    microphoneStream: microphone.stream,
    abortSignal: abortController.signal,
  });
  await flushPromises();
  abortController.abort();

  await assert.rejects(connection, /stopped during startup/);
  assert.equal(webSocket.closeCalls, 1);
  assert.equal(peerConnection.closeCalls, 1);
  assert.equal(peerConnection.transceivers[0].stopCalls, 1);
  assert.equal(microphone.getStopCalls(), 0);
});

test("session controller routes both talk transports around the live engine mounter", async () => {
  const source = await readFile(
    new URL(
      "../src/features/two-way-talk/session.ctrl.js",
      import.meta.url,
    ),
    "utf8",
  );
  const start = source.indexOf("  async startSession() {");
  const stop = source.indexOf("  async stopSession(", start);
  const methodSource = source.slice(start, stop);

  assert.match(
    methodSource,
    /if \(useGo2Rtc\) \{\s+return await host\._go2rtcTwoWayTalkBackchannel\.connect\(/,
  );
  assert.match(
    methodSource,
    /return await host\._haDirectTwoWayTalkBackchannel\.connect\(/,
  );
  assert.doesNotMatch(methodSource, /host\._mountEngine/);
});
