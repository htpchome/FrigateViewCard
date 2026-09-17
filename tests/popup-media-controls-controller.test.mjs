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
      toggle: (token, force) => {
        const enabled =
          force === undefined ? !hiddenClasses.has(token) : force === true;
        if (enabled) hiddenClasses.add(token);
        else hiddenClasses.delete(token);
        return enabled;
      },
    },
    style: {
      values: new Map(),
      setProperty(name, value) {
        this.values.set(name, value);
      },
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
  const volume = createTarget();
  const playButton = { innerHTML: "" };
  const muteButton = { innerHTML: "" };
  const time = { textContent: "" };
  const attributeCalls = [];
  const video = createTarget();
  video.duration = 100;
  video.currentTime = 25;
  video.paused = true;
  video.muted = false;
  video.volume = 0.65;
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
    ["#popup-media-volume", volume],
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
    isMobileTabletViewport: () => true,
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
  assert.equal(controls.classList.contains("mobile-tablet-layout"), true);
  assert.equal(progress.value, "250");
  assert.equal(volume.value, "65");
  assert.equal(playButton.innerHTML, "play-icon");
  assert.equal(muteButton.innerHTML, "volume-icon");
  assert.equal(time.textContent, "25s/100s");

  volume.value = "35";
  volume.dispatch("input");
  assert.equal(video.volume, 0.35);
  assert.equal(video.muted, false);
  assert.equal(volume.style.values.get("--popup-media-volume-pct"), "35%");

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

test("Card View popup auto-hide covers its mobile control bar and media actions", () => {
  const controls = createTarget();
  controls.hidden = false;
  const popup = createTarget();
  popup.classList.remove("is-hidden");
  popup.classList.add("popup-content--card-view-drawer");
  const elements = new Map([
    ["#popup-media-controls", controls],
    ["#myPopup", popup],
  ]);
  const timers = [];
  const controller = new PopupMediaControlsSurfaceController({
    query: (selector) => elements.get(selector) || null,
    isAutoHideActive: () => true,
    setTimer: (callback, delay) => {
      timers.push([callback, delay]);
      return timers.length;
    },
    clearTimer() {},
  });

  controller.showTemporarily();
  assert.equal(controls.classList.contains("is-hidden"), false);
  assert.equal(
    popup.classList.contains("popup-card-view-controls-hidden"),
    false,
  );
  assert.equal(timers.at(-1)[1], 2200);

  timers.at(-1)[0]();
  assert.equal(controls.classList.contains("is-hidden"), true);
  assert.equal(
    popup.classList.contains("popup-card-view-controls-hidden"),
    true,
  );

  controls.hidden = true;
  controller.showNow();
  assert.equal(
    popup.classList.contains("popup-card-view-controls-hidden"),
    false,
  );
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

test("desktop popup controls hide immediately when clicking outside the video", () => {
  const controls = createTarget();
  controls.hidden = true;
  const video = createTarget();
  const attributeCalls = [];
  const timers = [];
  const clearedTimers = [];
  video.removeAttribute = (name) => attributeCalls.push(["remove", name]);
  video.setAttribute = (name, value) =>
    attributeCalls.push(["set", name, value]);
  const elements = new Map([
    ["#popup-media-controls", controls],
    ["#viewer", { querySelector: () => video }],
  ]);
  const controller = new PopupMediaControlsSurfaceController({
    query: (selector) => elements.get(selector) || null,
    shouldUseCustomControls: () => true,
    isAutoHideActive: () => true,
    isMobileTabletViewport: () => false,
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
  assert.equal(controls.classList.contains("desktop-overlay-layout"), true);
  assert.equal(controls.classList.contains("mobile-tablet-layout"), false);

  controller.showTemporarily();
  assert.equal(timers.at(-1)[1], 2200);
  assert.equal(
    controller.hideForOutsideVideoClick({ closest: () => null }),
    true,
  );
  assert.equal(controls.classList.contains("is-hidden"), true);
  assert.deepEqual(clearedTimers, [1]);

  controller.showNow();
  assert.equal(
    controller.hideForOutsideVideoClick({
      closest: (selector) => (selector === "#viewer" ? video : null),
    }),
    false,
  );
  assert.equal(controls.classList.contains("is-hidden"), false);

  assert.equal(
    controller.hideForOutsideVideoClick({
      closest: (selector) =>
        selector === "#popup-media-controls" ? controls : null,
    }),
    false,
  );
  assert.equal(controls.classList.contains("is-hidden"), false);

  controls.classList.remove("desktop-overlay-layout");
  controls.classList.add("mobile-tablet-layout");
  assert.equal(
    controller.hideForOutsideVideoClick({ closest: () => null }),
    false,
  );
  assert.equal(controls.classList.contains("is-hidden"), false);
});

test("popup Space key always controls playback while popup video is open", async () => {
  const controls = createTarget();
  controls.hidden = true;
  const documentTarget = createTarget();
  const popup = createTarget();
  popup.classList.add("is-open");
  const playButton = { innerHTML: "" };
  const video = createTarget();
  video.paused = true;
  video.volume = 1;
  video.removeAttribute = () => {};
  video.setAttribute = () => {};
  video.play = async () => {
    video.paused = false;
  };
  video.pause = () => {
    video.paused = true;
  };
  const viewer = { querySelector: () => video };
  const elements = new Map([
    ["#myPopup", popup],
    ["#viewer", viewer],
    ["#popup-media-controls", controls],
    ["#popup-media-play", playButton],
  ]);
  const controller = new PopupMediaControlsSurfaceController({
    query: (selector) => elements.get(selector) || null,
    shouldUseCustomControls: () => true,
    documentObj: documentTarget,
  });
  const makeSpaceEvent = ({ repeat = false } = {}) => {
    let prevented = false;
    return {
      code: "Space",
      repeat,
      preventDefault: () => {
        prevented = true;
      },
      wasPrevented: () => prevented,
    };
  };

  controller.initialize(video, "clip");

  const playEvent = makeSpaceEvent();
  documentTarget.dispatch("keydown", playEvent);
  await Promise.resolve();
  assert.equal(playEvent.wasPrevented(), true);
  assert.equal(video.paused, false);

  const pauseEvent = makeSpaceEvent();
  documentTarget.dispatch("keydown", pauseEvent);
  assert.equal(pauseEvent.wasPrevented(), true);
  assert.equal(video.paused, true);

  const repeatEvent = makeSpaceEvent({ repeat: true });
  documentTarget.dispatch("keydown", repeatEvent);
  assert.equal(repeatEvent.wasPrevented(), true);
  assert.equal(video.paused, true);

  popup.classList.remove("is-open");
  const closedEvent = makeSpaceEvent();
  documentTarget.dispatch("keydown", closedEvent);
  assert.equal(closedEvent.wasPrevented(), false);
  assert.equal(video.paused, true);

  popup.classList.add("is-open");
  controller.dispose();
  const disposedEvent = makeSpaceEvent();
  documentTarget.dispatch("keydown", disposedEvent);
  assert.equal(disposedEvent.wasPrevented(), false);
  assert.equal(video.paused, true);
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
    t: (key) => ({
      "runtime.popup.airplayVideo": "Diffuser la vidéo",
      "runtime.popup.pictureInPicture": "Image dans l’image",
      "runtime.popup.takeSnapshot": "Capturer une image",
    }[key] || key),
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
  assert.equal(playbackControls.children[1].title, "Image dans l’image");
  assert.equal(
    playbackControls.children[2]["data-fvc-i18n-aria-label"],
    "runtime.popup.takeSnapshot",
  );
  assert.deepEqual(calls, [["syncPlayback"], ["syncPictureInPicture"]]);
});

test("desktop custom controls keep AirPlay in the media bar instead of duplicating it", () => {
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
    shouldUseCustomControls: () => true,
    isMobileTabletViewport: () => false,
    isVideoMediaType: () => true,
    icons: {
      takeSnapshot: "snapshot-icon",
      pipPopOut: "pip-icon",
      airplayVideo: "airplay-icon",
    },
    documentObj: { createElement },
  });

  controller.ensurePlaybackButtons("clip");

  assert.deepEqual(
    playbackControls.children.map((button) => button.id),
    ["popup-pip-btn", "popup-take-snapshot-btn"],
  );
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
  const viewer = { ...createElement("div"), classList: createTarget().classList };
  const popup = createTarget();
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
  let overlayOptions = null;
  let overlayBound = false;
  const controller = new PopupMediaControlsSurfaceController({
    query: (selector) => {
      if (selector === "#viewer") return viewer;
      if (selector === "#myPopup") return popup;
      return null;
    },
    isMobileTabletViewport: () => true,
    isVideoMediaType: () => true,
    createOverlayControls: (options) => {
      overlayOptions = options;
      return {
        bind: () => {
          overlayBound = true;
        },
        dispose: () => {},
      };
    },
    icons: {
      takeSnapshot: "snapshot-icon",
      pipPopOut: "pip-icon",
      expand: "fullscreen-icon",
      airplayVideo: "airplay-icon",
    },
    documentObj: { createElement },
  });

  controller.ensurePlaybackButtons("clip");

  assert.deepEqual(
    playbackControls.children.map((button) => button.id),
    [
      "popup-mobile-fs-btn",
      "popup-mobile-airplay-btn",
      "popup-take-snapshot-btn",
    ],
  );
  assert.equal(
    playbackControls.children[0].className,
    "square-btn popup-playback-btn popup-mobile-fs-btn",
  );
  assert.equal(playbackControls.children[0].innerHTML, "fullscreen-icon");
  assert.equal(playbackControls.children[1].innerHTML, "airplay-icon");
  assert.equal(playbackControls.children[1].hidden, true);
  assert.equal(overlayOptions.surface, viewer);
  assert.equal(overlayOptions.revealDurationMs, 1800);
  assert.equal(overlayBound, true);
  overlayOptions.show();
  assert.equal(viewer.classList.contains("popup-controls-visible"), true);
  assert.equal(
    popup.classList.contains("popup-overlay-controls-visible"),
    true,
  );
  overlayOptions.hideNow();
  assert.equal(viewer.classList.contains("popup-controls-visible"), false);
  assert.equal(
    popup.classList.contains("popup-overlay-controls-visible"),
    false,
  );
});
