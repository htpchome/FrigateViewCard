import { test } from "node:test";
import assert from "node:assert/strict";

import { createHaDirectTwoWayTalkMounter } from "../src/integrations/home-assistant/two-way-talk-mounter.js";

function createFakeVideo() {
  const attributes = new Map();
  return {
    style: { cssText: "" },
    dataset: {},
    classList: { add() {} },
    muted: true,
    defaultMuted: true,
    paused: false,
    srcObject: null,
    setAttribute(name, value) {
      attributes.set(name, String(value));
    },
    removeAttribute(name) {
      attributes.delete(name);
    },
    play() {
      this.paused = false;
      return Promise.resolve();
    },
    pause() {
      this.paused = true;
    },
  };
}

test("ha-direct talk mounting uses Home Assistant signaling for one full-duplex peer", async () => {
  const previousDocument = globalThis.document;
  const previousMediaStream = globalThis.MediaStream;
  const previousPeerConnection = globalThis.RTCPeerConnection;
  const transceivers = [];
  const wsCalls = [];
  let assignedEngine = null;
  let committedType = "";
  let endedCalls = 0;
  let recoveryReason = "";
  let microphoneStopCalls = 0;
  let subscriptionPayload = null;
  let unsubscribed = false;
  let remoteTrackStopCalls = 0;

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

  class FakePeerConnection {
    constructor(configuration) {
      this.configuration = configuration;
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

    emit(type, event = {}) {
      this._listeners.get(type)?.(event);
    }

    getTransceivers() {
      return [];
    }

    async createOffer(options) {
      this.offerOptions = options;
      return { type: "offer", sdp: "ha-talk-offer" };
    }

    async setLocalDescription(description) {
      this.localDescription = description;
    }

    async setRemoteDescription() {}

    async addIceCandidate() {}

    close() {
      this.connectionState = "closed";
    }
  }

  globalThis.document = {
    createElement(tag) {
      assert.equal(tag, "video");
      return createFakeVideo();
    },
  };
  globalThis.MediaStream = class FakeMediaStream {
    constructor() {
      this.tracks = [];
    }

    addTrack(track) {
      this.tracks.push(track);
    }

    getTracks() {
      return this.tracks;
    }
  };
  globalThis.RTCPeerConnection = FakePeerConnection;

  const hass = {
    async callWS(payload) {
      wsCalls.push(payload);
      if (payload.type === "camera/webrtc/get_client_config") {
        return { configuration: { iceServers: [{ urls: "stun:ha.test" }] } };
      }
      return null;
    },
    connection: {
      subscribeMessage(_callback, payload) {
        subscriptionPayload = payload;
        return Promise.resolve(() => {
          unsubscribed = true;
        });
      },
    },
  };
  const slot = {
    innerHTML: "occupied",
    appendChild(node) {
      this.video = node;
    },
  };
  const mounter = createHaDirectTwoWayTalkMounter({
    getHass: () => hass,
    getStreamMuted: () => true,
    waitForStreamStart: async (target, waitMs, options) => {
      assert.equal(target, slot);
      assert.equal(waitMs, 7000);
      assert.equal(options.strict, true);
      return true;
    },
    attachVideoFit: () => {},
    assignCommittedEngine: (engine) => {
      assignedEngine = engine;
    },
    onCommittedStream: (type) => {
      committedType = type;
    },
    scheduleResumeLive: (reason) => {
      recoveryReason = reason;
    },
    scopeKey: {},
  });

  try {
    const result = await mounter.tryMount(slot, null, {
      entity: "camera.front",
      commit: true,
      microphoneStream,
      onEnded: () => {
        endedCalls += 1;
      },
    });

    assert.equal(result.ok, true);
    assert.equal(committedType, "webrtc");
    assert.equal(assignedEngine, result.engine);
    assert.equal(assignedEngine.type, "ha_direct");
    assert.equal(assignedEngine.microphoneStream, microphoneStream);
    assert.deepEqual(transceivers, [
      [
        microphoneTrack,
        { direction: "sendonly", streams: [microphoneStream] },
      ],
      ["video", { direction: "recvonly" }],
      ["audio", { direction: "recvonly" }],
    ]);
    assert.deepEqual(wsCalls[0], {
      type: "camera/webrtc/get_client_config",
      entity_id: "camera.front",
    });
    assert.deepEqual(subscriptionPayload, {
      type: "camera/webrtc/offer",
      entity_id: "camera.front",
      offer: "ha-talk-offer",
    });

    const videoTrack = {
      kind: "video",
      stop() {
        remoteTrackStopCalls += 1;
      },
    };
    const audioTrack = {
      kind: "audio",
      stop() {
        remoteTrackStopCalls += 1;
      },
    };
    assignedEngine.pc.emit("track", { track: videoTrack, streams: [] });
    assignedEngine.pc.emit("track", { track: audioTrack, streams: [] });
    assert.equal(assignedEngine.video.srcObject, assignedEngine.remoteStream);
    assert.deepEqual(assignedEngine.remoteStream.getTracks(), [
      videoTrack,
      audioTrack,
    ]);

    assignedEngine.pc.connectionState = "disconnected";
    assignedEngine.pc.emit("connectionstatechange");
    assert.equal(endedCalls, 1);
    assert.equal(recoveryReason, "ha-direct-talk-connection-lost");
    assert.equal(microphoneStopCalls, 1);

    assignedEngine.destroy();
    await new Promise((resolve) => setImmediate(resolve));
    assert.equal(unsubscribed, true);
    assert.equal(remoteTrackStopCalls, 2);
  } finally {
    globalThis.document = previousDocument;
    globalThis.MediaStream = previousMediaStream;
    globalThis.RTCPeerConnection = previousPeerConnection;
  }
});
