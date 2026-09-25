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

test("live audio changes do not remount either live transport", () => {
  const haDirect = createMuteChangeHost({ haDirect: true });
  new LiveAudioController(haDirect.host).applyMuteChange(false);

  assert.deepEqual(haDirect.calls, [
    ["set-muted", false],
    ["sync-group-audio"],
    ["render-mute"],
  ]);
  assert.equal(haDirect.host._engineMountedMuted, false);

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

test("live audio invokes injected timers without a controller receiver", () => {
  const receivers = [];
  const host = {
    _streamMuted: false,
    _engine: {
      tagName: "VIDEO",
      muted: false,
      defaultMuted: false,
    },
    _findVideoDeep: () => null,
  };
  const controller = new LiveAudioController(host, {
    setTimer(callback, delay) {
      receivers.push({ receiver: this, callback, delay });
    },
  });

  controller.setMuted(true);

  assert.deepEqual(
    receivers.map(({ receiver, delay }) => ({ receiver, delay })),
    [
      { receiver: undefined, delay: 120 },
      { receiver: undefined, delay: 400 },
      { receiver: undefined, delay: 900 },
    ],
  );
});

test("live audio preserves the shared mute button class contract", () => {
  const controller = new LiveAudioController({ _streamMuted: true });

  assert.match(controller.buildControlMarkup(), /class="square-btn mute-btn"/);
  assert.match(controller.buildControlMarkup(), /id="mute-btn"/);
});

test("mobile talk mute markup exists only on mobile Mobile View and waits for connection", () => {
  let talkActive = false;
  const host = {
    _pageId: "mobile-view",
    _streamMuted: true,
    _isLikelyMobileClient: () => true,
    _twoWayTalkActiveForCurrentCamera: () => talkActive,
  };
  const controller = new LiveAudioController(host, {
    icons: { volOff: "muted", volOn: "audible" },
  });

  const disconnected = controller.buildMobileTalkMuteControlMarkup();
  assert.match(disconnected, /id="mobile-view-mute-btn"/);
  assert.match(disconnected, /mobile-view-talk-mute-btn/);
  assert.match(disconnected, / hidden/);

  talkActive = true;
  const connected = controller.buildMobileTalkMuteControlMarkup();
  assert.doesNotMatch(
    connected.match(/<button[^>]*id="mobile-view-mute-btn"[^>]*>/)?.[0] || "",
    / hidden/,
  );

  host._pageId = "single-view";
  assert.equal(controller.buildMobileTalkMuteControlMarkup(), "");
  host._pageId = "mobile-view";
  host._isLikelyMobileClient = () => false;
  assert.equal(controller.buildMobileTalkMuteControlMarkup(), "");
});

test("mobile talk mute follows the connected two-way-talk state", () => {
  let talkActive = false;
  let muted = true;
  const classes = new Set();
  const button = {
    id: "mobile-view-mute-btn",
    hidden: false,
    style: {},
    classList: {
      toggle(name, enabled) {
        if (enabled) classes.add(name);
        else classes.delete(name);
      },
    },
    attributes: new Map(),
    setAttribute(name, value) {
      this.attributes.set(name, String(value));
    },
  };
  const host = {
    _viewMode: "single",
    _$: (selector) =>
      selector === "#mobile-view-mute-btn" ? button : null,
    _twoWayTalkActiveForCurrentCamera: () => talkActive,
    _resolveLiveMuteControlMuted: () => muted,
  };
  const controller = new LiveAudioController(host, {
    icons: { volOff: "muted", volOn: "audible" },
  });

  controller.syncMuteButtons();
  assert.equal(button.hidden, true);
  assert.equal(button.style.display, "none");

  talkActive = true;
  muted = false;
  controller.syncMuteButtons();
  assert.equal(button.hidden, false);
  assert.equal(button.style.display, "");
  assert.equal(classes.has("active"), true);
  assert.equal(classes.has("talk-audio-active"), true);
  assert.equal(button.attributes.get("aria-pressed"), "true");
  assert.equal(button.innerHTML, "audible");
});
