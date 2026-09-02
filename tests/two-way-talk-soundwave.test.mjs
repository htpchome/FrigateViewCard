import { test } from "node:test";
import assert from "node:assert/strict";

import {
  buildTwoWayTalkSoundwaveMarkup,
  calculateTalkSoundwaveEnergy,
  TwoWayTalkSoundwaveController,
} from "../src/features/two-way-talk/soundwave.ctrl.js";
import { TWO_WAY_TALK_SOUNDWAVE_STYLES } from "../src/features/two-way-talk/soundwave.styles.js";
import { STYLES } from "../src/styles.js";

function createStream(name) {
  return {
    name,
    getAudioTracks: () => [{ kind: "audio" }],
  };
}

test("talk soundwave markup stays hidden until the talk session is active", () => {
  assert.match(
    buildTwoWayTalkSoundwaveMarkup(),
    /data-two-way-talk-soundwave hidden/,
  );
  assert.doesNotMatch(
    buildTwoWayTalkSoundwaveMarkup({ active: true }),
    /data-two-way-talk-soundwave hidden/,
  );
});

test("active desktop talk controls share the soundwave surface", () => {
  assert.match(
    TWO_WAY_TALK_SOUNDWAVE_STYLES,
    /has-inline-mute\.has-soundwave\s*\{[\s\S]*?grid-template-columns:\s*112px;[\s\S]*?grid-template-rows:\s*44px;/,
  );
  assert.match(
    TWO_WAY_TALK_SOUNDWAVE_STYLES,
    /\.two-way-talk-soundwave\s*\{[\s\S]*?grid-column:\s*1;/,
  );
  assert.match(
    TWO_WAY_TALK_SOUNDWAVE_STYLES,
    /two-way-talk-microphone-mute-btn\s*\{[\s\S]*?align-self:\s*end;[\s\S]*?justify-self:\s*start;[\s\S]*?width:\s*28px;/,
  );
  assert.match(
    TWO_WAY_TALK_SOUNDWAVE_STYLES,
    /two-way-talk-inline-mute-btn\s*\{[\s\S]*?align-self:\s*end;[\s\S]*?justify-self:\s*end;[\s\S]*?width:\s*28px;/,
  );
  assert.match(
    TWO_WAY_TALK_SOUNDWAVE_STYLES,
    /:is\(\.two-way-talk-microphone-mute-btn,\.two-way-talk-inline-mute-btn\)\.talk-audio-active svg\s*\{[\s\S]*?color:\s*var\(--c-text\);/,
  );
  assert.match(
    STYLES,
    /:is\(\.mobile-view-inline-mute-btn,\.mobile-view-microphone-mute-btn\)\.active svg,[\s\S]*?color:\s*var\(--c-text2\);/,
  );
  assert.match(
    STYLES,
    /:is\(\.mobile-view-inline-mute-btn,\.mobile-view-microphone-mute-btn\)\.talk-audio-active svg\s*\{[\s\S]*?color:\s*var\(--c-text\);/,
  );
});

test("card buttons use the shared subtle keyboard focus ring", () => {
  assert.match(
    STYLES,
    /\.card button:focus-visible\s*\{[\s\S]*?outline:\s*1px solid color-mix\([\s\S]*?outline-offset:\s*2px !important;/,
  );
});

test("talk soundwave energy derives a bounded level from time-domain samples", () => {
  const quietSamples = new Uint8Array(8);
  const speechSamples = new Uint8Array(8);
  const loudSamples = new Uint8Array(8);
  const quietAnalyser = {
    getByteTimeDomainData(samples) {
      samples.fill(128);
    },
  };
  const loudAnalyser = {
    getByteTimeDomainData(samples) {
      samples.set([0, 255, 0, 255, 0, 255, 0, 255]);
    },
  };
  const speechAnalyser = {
    getByteTimeDomainData(samples) {
      samples.set([124, 132, 123, 133, 125, 131, 124, 132]);
    },
  };

  assert.equal(calculateTalkSoundwaveEnergy(quietAnalyser, quietSamples), 0);
  const speechEnergy = calculateTalkSoundwaveEnergy(
    speechAnalyser,
    speechSamples,
  );
  assert.ok(speechEnergy > 0.25);
  assert.ok(speechEnergy < 0.65);
  assert.equal(calculateTalkSoundwaveEnergy(loudAnalyser, loudSamples), 1);
});

test("talk soundwave paints three microphone curves plus incoming audio", () => {
  const localStream = createStream("local");
  const strokes = [];
  const canvasContext = {
    globalAlpha: 1,
    globalCompositeOperation: "source-over",
    strokeStyle: "",
    lineWidth: 0,
    shadowColor: "",
    shadowBlur: 0,
    setTransform() {},
    clearRect() {},
    beginPath() {},
    moveTo() {},
    lineTo() {},
    stroke() {
      strokes.push(this.strokeStyle);
    },
  };
  const canvas = {
    width: 0,
    height: 0,
    getContext: () => canvasContext,
    getBoundingClientRect: () => ({ width: 112, height: 44 }),
  };
  const audioContext = {
    createMediaStreamSource: () => ({ connect() {}, disconnect() {} }),
    createAnalyser: () => ({
      fftSize: 0,
      smoothingTimeConstant: 0,
      disconnect() {},
      getByteTimeDomainData(samples) {
        samples.set(
          Array.from({ length: samples.length }, (_, index) =>
            index % 2 === 0 ? 116 : 140,
          ),
        );
      },
    }),
    resume: () => Promise.resolve(),
    close: () => Promise.resolve(),
  };
  const colors = {
    "--fvc-talk-wave-hot": "#ff3cac",
    "--fvc-talk-wave-violet": "#9b5cff",
    "--fvc-talk-wave-cyan": "#22d3ee",
    "--fvc-talk-wave-incoming": "#5eead4",
    "--fvc-talk-wave-baseline": "#dbeafe",
  };
  const controller = new TwoWayTalkSoundwaveController({
    resolveCanvas: () => canvas,
    createAudioContext: () => audioContext,
    setTimer: () => 7,
    clearTimer() {},
    getDocument: () => ({
      visibilityState: "visible",
      addEventListener() {},
      removeEventListener() {},
    }),
    getStyle: () => ({
      getPropertyValue: (name) => colors[name] || "",
    }),
  });

  assert.equal(controller.start({ localStream }), true);
  controller._draw(100);

  assert.deepEqual(strokes, [
    "#dbeafe",
    "#5eead4",
    "#ff3cac",
    "#9b5cff",
    "#22d3ee",
  ]);
  controller.stop();
});

test("talk soundwave becomes a flat support line while the microphone is muted", () => {
  const localStream = createStream("local");
  const strokes = [];
  const canvasContext = {
    globalAlpha: 1,
    globalCompositeOperation: "source-over",
    strokeStyle: "",
    lineWidth: 0,
    setTransform() {},
    clearRect() {},
    beginPath() {},
    moveTo() {},
    lineTo() {},
    stroke() {
      strokes.push(this.strokeStyle);
    },
  };
  const canvas = {
    width: 0,
    height: 0,
    getContext: () => canvasContext,
    getBoundingClientRect: () => ({ width: 112, height: 44 }),
  };
  const audioContext = {
    createMediaStreamSource: () => ({ connect() {}, disconnect() {} }),
    createAnalyser: () => ({
      fftSize: 0,
      smoothingTimeConstant: 0,
      disconnect() {},
      getByteTimeDomainData(samples) {
        samples.fill(128);
      },
    }),
    resume: () => Promise.resolve(),
    close: () => Promise.resolve(),
  };
  const controller = new TwoWayTalkSoundwaveController({
    resolveCanvas: () => canvas,
    createAudioContext: () => audioContext,
    setTimer: () => 7,
    clearTimer() {},
    getDocument: () => ({
      visibilityState: "visible",
      addEventListener() {},
      removeEventListener() {},
    }),
    getStyle: () => ({
      getPropertyValue: (name) =>
        name === "--fvc-talk-wave-baseline" ? "#dbeafe" : "",
    }),
  });

  assert.equal(
    controller.start({ localStream, microphoneMuted: true }),
    true,
  );
  controller._draw(100);

  assert.deepEqual(strokes, ["#9b5cff"]);
  controller.stop();
});

test("talk soundwave observes existing local and remote streams without capturing media", () => {
  const localStream = createStream("local");
  const remoteStream = createStream("remote");
  const connectedStreams = [];
  let resumeCalls = 0;
  let closeCalls = 0;
  let disconnectCalls = 0;
  let clearTimerCalls = 0;
  const context = {
    createMediaStreamSource(stream) {
      connectedStreams.push(stream);
      return {
        connect() {},
        disconnect() {
          disconnectCalls += 1;
        },
      };
    },
    createAnalyser() {
      return {
        fftSize: 0,
        smoothingTimeConstant: 0,
        connect() {},
        disconnect() {
          disconnectCalls += 1;
        },
        getByteTimeDomainData(samples) {
          samples.fill(128);
        },
      };
    },
    resume() {
      resumeCalls += 1;
      return Promise.resolve();
    },
    close() {
      closeCalls += 1;
      return Promise.resolve();
    },
  };
  const documentStub = {
    visibilityState: "visible",
    addEventListener() {},
    removeEventListener() {},
  };
  const controller = new TwoWayTalkSoundwaveController({
    resolveCanvas: () => null,
    createAudioContext: () => context,
    setTimer: () => 7,
    clearTimer: (timer) => {
      assert.equal(timer, 7);
      clearTimerCalls += 1;
    },
    getDocument: () => documentStub,
  });

  assert.equal(
    controller.start({
      localStream,
      engine: { remoteStream },
    }),
    true,
  );
  assert.deepEqual(connectedStreams, [localStream, remoteStream]);
  assert.equal(resumeCalls, 1);

  controller.stop();
  assert.equal(clearTimerCalls, 1);
  assert.equal(disconnectCalls, 4);
  assert.equal(closeCalls, 1);
});

test("talk soundwave does not create audio resources when disabled", () => {
  let contextCalls = 0;
  const controller = new TwoWayTalkSoundwaveController({
    isEnabled: () => false,
    createAudioContext: () => {
      contextCalls += 1;
      return {};
    },
  });

  assert.equal(controller.start({ localStream: createStream("local") }), false);
  assert.equal(contextCalls, 0);
});

test("talk soundwave defers audio analysis until after the active state can paint", () => {
  const localStream = createStream("local");
  let contextCalls = 0;
  let frameCallback = null;
  let timerCallback = null;
  const context = {
    createMediaStreamSource: () => ({ connect() {}, disconnect() {} }),
    createAnalyser: () => ({
      fftSize: 0,
      smoothingTimeConstant: 0,
      disconnect() {},
      getByteTimeDomainData(samples) {
        samples.fill(128);
      },
    }),
    resume: () => Promise.resolve(),
    close: () => Promise.resolve(),
  };
  const controller = new TwoWayTalkSoundwaveController({
    resolveCanvas: () => null,
    createAudioContext: () => {
      contextCalls += 1;
      return context;
    },
    requestFrame: (callback) => {
      frameCallback = callback;
      return 11;
    },
    cancelFrame() {},
    setTimer: (callback) => {
      timerCallback = callback;
      return 12;
    },
    clearTimer() {},
    getDocument: () => ({
      visibilityState: "hidden",
      addEventListener() {},
      removeEventListener() {},
    }),
  });

  assert.equal(controller.startAfterPaint({ localStream }), true);
  assert.equal(contextCalls, 0);

  frameCallback?.();
  assert.equal(contextCalls, 0);

  timerCallback?.();
  assert.equal(contextCalls, 1);

  controller.stop();
});
