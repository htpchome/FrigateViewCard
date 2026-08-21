import { test } from "node:test";
import assert from "node:assert/strict";

import {
  PopupMediaControlsController,
  PopupMediaControlsSurfaceController,
} from "../src/features/popup/media.ctrl.js";
import { resolvePopupMediaControlsListenerPlan } from "../src/shared/media/controls.js";

const signalCleanupMap = new WeakMap();

function createTarget() {
  const listeners = new Map();
  const hiddenClasses = new Set(["is-hidden"]);

  return {
    value: "",
    duration: 0,
    currentTime: 0,
    classList: {
      add: (...tokens) => tokens.forEach((token) => hiddenClasses.add(token)),
      remove: (...tokens) =>
        tokens.forEach((token) => hiddenClasses.delete(token)),
      contains: (token) => hiddenClasses.has(token),
    },
    addEventListener(type, listener, options = {}) {
      if (!listeners.has(type)) listeners.set(type, new Set());
      listeners.get(type).add(listener);
      const signal = options.signal;
      if (!signal) return;
      let signalCleanups = signalCleanupMap.get(signal);
      if (!signalCleanups) {
        signalCleanups = new Set();
        signalCleanupMap.set(signal, signalCleanups);
        signal.addEventListener(
          "abort",
          () => {
            for (const cleanup of signalCleanups) cleanup();
            signalCleanups.clear();
          },
          { once: true },
        );
      }
      signalCleanups.add(() => {
        this.removeEventListener(type, listener);
      });
    },
    removeEventListener(type, listener) {
      listeners.get(type)?.delete(listener);
    },
    dispatch(type, event = {}) {
      for (const listener of [...(listeners.get(type) || [])]) {
        listener(event);
      }
    },
  };
}

test("PopupMediaControlsController previews seeks and syncs without updating buttons during drag", () => {
  const controls = createTarget();
  const progress = createTarget();
  const video = createTarget();
  video.duration = 100;
  progress.value = "250";
  const syncCalls = [];
  let showNowCalls = 0;
  let showTemporaryCalls = 0;

  const controller = new PopupMediaControlsController({
    controls,
    progress,
    video,
    listenerPlan: resolvePopupMediaControlsListenerPlan({
      hasProgressControl: true,
    }),
    onShowNow: () => {
      showNowCalls += 1;
      controls.classList.remove("is-hidden");
    },
    onShowTemporarily: () => {
      showTemporaryCalls += 1;
    },
    onSync: ({ progressDragging }) => {
      syncCalls.push(progressDragging);
    },
  });

  controller.bind();
  progress.dispatch("pointerdown");
  progress.dispatch("input");
  progress.dispatch("change");

  assert.equal(showNowCalls, 1);
  assert.equal(showTemporaryCalls, 2);
  assert.equal(video.currentTime, 25);
  assert.deepEqual(syncCalls, [false, true, false]);
});

test("PopupMediaControlsController removes listeners and clears hidden class on dispose", () => {
  const controls = createTarget();
  const progress = createTarget();
  const video = createTarget();
  let syncCalls = 0;

  const controller = new PopupMediaControlsController({
    controls,
    progress,
    video,
    listenerPlan: resolvePopupMediaControlsListenerPlan({
      hasProgressControl: true,
    }),
    onShowNow: () => {
      controls.classList.remove("is-hidden");
    },
    onShowTemporarily: () => {},
    onSync: () => {
      syncCalls += 1;
    },
  });

  controller.bind();
  controller.dispose();
  progress.dispatch("input");
  video.dispatch("play");

  assert.equal(syncCalls, 1);
  assert.equal(controls.classList.contains("is-hidden"), false);
});

test("popup media controls surface owns custom controls, actions, and auto-hide", async () => {
  const controls = createTarget();
  controls.hidden = true;
  const progress = createTarget();
  const playButton = { innerHTML: "" };
  const muteButton = { innerHTML: "" };
  const time = { textContent: "" };
  const attributeCalls = [];
  const video = createTarget();
  video.duration = 100;
  video.currentTime = 25;
  video.paused = true;
  video.muted = false;
  video.removeAttribute = (name) => attributeCalls.push(["remove", name]);
  video.setAttribute = (name, value) =>
    attributeCalls.push(["set", name, value]);
  video.play = async () => {
    video.paused = false;
  };
  video.pause = () => {
    video.paused = true;
  };
  const viewer = { querySelector: () => video };
  const elements = new Map([
    ["#viewer", viewer],
    ["#popup-media-controls", controls],
    ["#popup-media-progress", progress],
    ["#popup-media-play", playButton],
    ["#popup-media-mute", muteButton],
    ["#popup-media-time", time],
  ]);
  const timers = [];
  const clearedTimers = [];
  const controller = new PopupMediaControlsSurfaceController({
    query: (selector) => elements.get(selector) || null,
    formatTime: (value) => `${value}s`,
    shouldUseCustomControls: () => true,
    isAutoHideActive: () => true,
    icons: {
      pause: "pause-icon",
      play: "play-icon",
      volOff: "muted-icon",
      volOn: "volume-icon",
    },
    setTimer: (callback, delay) => {
      timers.push([callback, delay]);
      return timers.length;
    },
    clearTimer: (timer) => clearedTimers.push(timer),
  });

  const plan = controller.initialize(video, "clip");

  assert.equal(plan.shouldBindCustomControls, true);
  assert.equal(video.controls, false);
  assert.deepEqual(attributeCalls, [["remove", "controls"]]);
  assert.equal(controls.hidden, false);
  assert.equal(progress.value, "250");
  assert.equal(playButton.innerHTML, "play-icon");
  assert.equal(muteButton.innerHTML, "volume-icon");
  assert.equal(time.textContent, "25s/100s");

  assert.equal(
    controller.handleClick({
      closest: (selector) =>
        selector === "#popup-media-play" ? playButton : null,
    }),
    true,
  );
  await Promise.resolve();
  controller.update(video);
  assert.equal(video.paused, false);
  assert.equal(playButton.innerHTML, "pause-icon");
  assert.equal(timers.at(-1)[1], 2200);

  assert.equal(
    controller.handleClick({
      closest: (selector) =>
        selector === "#popup-media-mute" ? muteButton : null,
    }),
    true,
  );
  assert.equal(video.muted, true);
  assert.equal(muteButton.innerHTML, "muted-icon");
  timers.at(-1)[0]();
  assert.equal(controls.classList.contains("is-hidden"), true);

  controller.dispose();
  assert.equal(controls.classList.contains("is-hidden"), false);
  assert.equal(clearedTimers.length > 0, true);
});

test("popup media controls surface enables native controls and resets snapshots", () => {
  const controls = createTarget();
  controls.hidden = false;
  const attributes = [];
  const video = createTarget();
  video.setAttribute = (name, value) => attributes.push([name, value]);
  video.removeAttribute = () => {};
  const elements = new Map([["#popup-media-controls", controls]]);
  const controller = new PopupMediaControlsSurfaceController({
    query: (selector) => elements.get(selector) || null,
    shouldUseCustomControls: () => false,
  });

  const plan = controller.initialize(video, "clip");

  assert.equal(plan.shouldBindCustomControls, false);
  assert.equal(video.controls, true);
  assert.deepEqual(attributes, [["controls", ""]]);
  assert.equal(controls.hidden, true);

  controls.hidden = false;
  controls.classList.add("is-hidden");
  controller.resetWithoutVideo();
  assert.equal(controls.hidden, true);
  assert.equal(controls.classList.contains("is-hidden"), false);
});

test("popup media controls surface renders snapshot, PiP, and AirPlay buttons", () => {
  const calls = [];
  const createElement = (tagName) => ({
    tagName,
    children: [],
    innerHTML: "",
    setAttribute(name, value) {
      this[name] = value;
    },
    appendChild(child) {
      this.children.push(child);
    },
  });
  const video = {};
  const viewer = createElement("div");
  let playbackControls = null;
  viewer.querySelector = (selector) => {
    if (selector === "#popup-playback-controls") return playbackControls;
    if (selector === "video") return video;
    return null;
  };
  viewer.appendChild = (child) => {
    viewer.children.push(child);
    if (child.id === "popup-playback-controls") playbackControls = child;
  };
  const controller = new PopupMediaControlsSurfaceController({
    query: (selector) => (selector === "#viewer" ? viewer : null),
    shouldUseCustomControls: () => false,
    isMobileTabletViewport: () => false,
    isFirefox: () => false,
    isVideoMediaType: () => true,
    onSyncPlaybackTargetButtons: () => calls.push(["syncPlayback"]),
    onSyncPictureInPictureButtons: () => calls.push(["syncPictureInPicture"]),
    icons: {
      takeSnapshot: "snapshot-icon",
      pipPopOut: "pip-icon",
      airplayVideo: "airplay-icon",
      phoneRotateLandscape: "rotate-icon",
      expand: "fullscreen-icon",
    },
    documentObj: { createElement },
  });

  controller.ensurePlaybackButtons("clip");

  assert.deepEqual(
    playbackControls.children.map((button) => button.id),
    ["popup-airplay-btn", "popup-pip-btn", "popup-take-snapshot-btn"],
  );
  assert.equal(playbackControls.children[0].innerHTML, "airplay-icon");
  assert.equal(playbackControls.children[1].innerHTML, "pip-icon");
  assert.equal(playbackControls.children[2].innerHTML, "snapshot-icon");
  assert.deepEqual(calls, [["syncPlayback"], ["syncPictureInPicture"]]);
});

test("popup media controls surface renders tablet video actions in shared order", () => {
  const createElement = (tagName) => ({
    tagName,
    children: [],
    innerHTML: "",
    setAttribute(name, value) {
      this[name] = value;
    },
    appendChild(child) {
      this.children.push(child);
    },
  });
  const video = {};
  const viewer = createElement("div");
  let playbackControls = null;
  viewer.querySelector = (selector) => {
    if (selector === "#popup-playback-controls") return playbackControls;
    if (selector === "video") return video;
    return null;
  };
  viewer.appendChild = (child) => {
    viewer.children.push(child);
    if (child.id === "popup-playback-controls") playbackControls = child;
  };
  const controller = new PopupMediaControlsSurfaceController({
    query: (selector) => (selector === "#viewer" ? viewer : null),
    isMobileTabletViewport: () => true,
    isVideoMediaType: () => true,
    icons: {
      takeSnapshot: "snapshot-icon",
      pipPopOut: "pip-icon",
      phoneRotateLandscape: "rotate-icon",
      expand: "fullscreen-icon",
    },
    documentObj: { createElement },
  });

  controller.ensurePlaybackButtons("clip");

  assert.deepEqual(
    playbackControls.children.map((button) => button.id),
    [
      "popup-rotate-btn",
      "popup-pip-btn",
      "popup-take-snapshot-btn",
      "popup-fs-btn",
    ],
  );
});
