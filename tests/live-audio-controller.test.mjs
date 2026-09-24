import { test } from "node:test";
import assert from "node:assert/strict";

import { LiveAudioController } from "../src/features/live/audio.ctrl.js";

const createMuteChangeHost = ({ haDirect, talkActive = false }) => {
  const calls = [];
  const host = {
    _streamMuted: true,
    _engineMountedMuted: true,
    _rotateOverlayActive: false,
    _setLiveMuted(muted) {
      this._streamMuted = muted;
      calls.push(["set-muted", muted]);
    },
    _cameraGroupLiveController: {
      syncAudio() {
        calls.push(["sync-group-audio"]);
      },
    },
    _renderMuteButton() {
      calls.push(["render-mute"]);
    },
    _useHaDirectStreamPath: () => haDirect,
    _twoWayTalkActiveForCurrentCamera: () => talkActive,
    _mountEngine(event, options) {
      calls.push(["mount", event, options]);
    },
  };
  return { calls, host };
};

test("live audio remount recovery remains exclusive to HA Direct", () => {
  const haDirect = createMuteChangeHost({ haDirect: true });
  new LiveAudioController(haDirect.host).applyMuteChange(false);

  assert.deepEqual(haDirect.calls, [
    ["set-muted", false],
    ["sync-group-audio"],
    ["render-mute"],
    ["mount", null, { quiet: true }],
  ]);
  assert.equal(haDirect.host._engineMountedMuted, true);

  const frigateGo2rtc = createMuteChangeHost({ haDirect: false });
  new LiveAudioController(frigateGo2rtc.host).applyMuteChange(false);

  assert.deepEqual(frigateGo2rtc.calls, [
    ["set-muted", false],
    ["sync-group-audio"],
    ["render-mute"],
  ]);
  assert.equal(frigateGo2rtc.host._engineMountedMuted, false);
});

test("active HA Direct two-way talk preserves its isolated peer on unmute", () => {
  const haDirectTalk = createMuteChangeHost({
    haDirect: true,
    talkActive: true,
  });

  new LiveAudioController(haDirectTalk.host).applyMuteChange(false, {
    source: "two-way-talk",
  });

  assert.equal(haDirectTalk.calls.some(([name]) => name === "mount"), false);
  assert.equal(haDirectTalk.host._engineMountedMuted, false);
});

test("live audio synchronizes current and delayed replacement video elements", () => {
  const scheduled = [];
  const incomingMuteStates = [];
  const createVideo = () => ({
    muted: true,
    defaultMuted: true,
    volume: 0,
    playCalls: 0,
    play() {
      this.playCalls += 1;
      return Promise.resolve();
    },
  });
  const currentVideo = createVideo();
  const replacementVideo = createVideo();
  const engine = {
    tagName: "DIV",
    muted: true,
    defaultMuted: true,
    querySelector: () => currentVideo,
    shadowRoot: null,
  };
  let deepVideo = currentVideo;
  const host = {
    _streamMuted: true,
    _engine: engine,
    _twoWayTalkSession: {
      engine: {
        setIncomingAudioMuted(muted) {
          incomingMuteStates.push(muted);
        },
      },
    },
    _findVideoDeep: () => deepVideo,
  };
  const controller = new LiveAudioController(host, {
    setTimer(callback, delay) {
      scheduled.push({ callback, delay });
    },
  });

  controller.setMuted(false);

  assert.deepEqual(incomingMuteStates, [false]);
  assert.equal(engine.muted, false);
  assert.equal(engine.defaultMuted, false);
  assert.equal(currentVideo.muted, false);
  assert.equal(currentVideo.defaultMuted, false);
  assert.equal(currentVideo.volume, 1);
  assert.equal(currentVideo.playCalls, 1);
  assert.deepEqual(
    scheduled.map(({ delay }) => delay),
    [120, 400, 900],
  );

  deepVideo = replacementVideo;
  scheduled.forEach(({ callback }) => callback());

  assert.equal(replacementVideo.muted, false);
  assert.equal(replacementVideo.defaultMuted, false);
  assert.equal(replacementVideo.volume, 1);
  assert.equal(replacementVideo.playCalls, 3);
});

test("live audio preserves the shared mute button class contract", () => {
  const controller = new LiveAudioController({ _streamMuted: true });

  assert.match(controller.buildControlMarkup(), /class="square-btn mute-btn"/);
  assert.match(controller.buildControlMarkup(), /id="mute-btn"/);
});
