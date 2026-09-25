import { test } from "node:test";
import assert from "node:assert/strict";

import { LiveRotateOverlayController } from "../src/features/live/rotate-overlay.ctrl.js";

const createClassList = (initial = []) => {
  const classes = new Set(initial);
  return {
    add: (...names) => names.forEach((name) => classes.add(name)),
    remove: (...names) => names.forEach((name) => classes.delete(name)),
    toggle: (name, enabled) => {
      if (enabled) classes.add(name);
      else classes.delete(name);
    },
    contains: (name) => classes.has(name),
  };
};

const createHost = () => {
  const calls = [];
  const liveStage = { classList: createClassList(["live-controls-visible"]) };
  const host = {
    classList: createClassList(),
    style: {
      setProperty: (...args) => calls.push(["style", ...args]),
    },
    _$: (selector) =>
      selector === "#live-stage" ? liveStage : null,
    _cardStyleController: {
      syncBubbleFullscreenEscape: (active) =>
        calls.push(["bubble-sync", active]),
      releaseBubbleFullscreenEscape: () => calls.push(["bubble-release"]),
    },
    _haNavbarController: {
      sync: () => calls.push(["navbar-sync"]),
    },
    _cardViewPageController: {
      handleRotateOverlayState: (state) => calls.push(["card-view", state]),
    },
    _setLiveNativeControls: (...args) => calls.push(["native", ...args]),
    _syncLiveRotateZoomPresentation: (card) => calls.push(["zoom", card]),
    _setStreamLoading: (loading) => calls.push(["loading", loading]),
    _syncFullscreenButtonsVisibility: () => calls.push(["fullscreen-sync"]),
    _showLiveControlsTemporarily: () => calls.push(["live-controls"]),
    _popupMediaControlsController: {
      showTemporarily: () => calls.push(["popup-controls"]),
    },
    _rotateOverlayActive: false,
    _rotateOverlayMode: "none",
    _rotateLiveOverlayDismissed: false,
    _rotateOverlayRaf: 0,
    _rotateOverlayExitT: null,
    _rotateOverlaySyncVideo: null,
    _onRotateOverlayVolumeChange: null,
    _rotateStyledVideo: null,
    _rotateStyledVideoCssText: "",
    _streamMuted: true,
    _resumeLiveT: null,
  };
  return { calls, host, liveStage };
};

test("rotate overlay presentation applies its UI plan outside the card shell", () => {
  const { calls, host, liveStage } = createHost();
  const card = {
    classList: createClassList(["mobile-rotate-popup"]),
  };
  const controller = new LiveRotateOverlayController(host);

  controller.applyUiPlan(card, {
    active: true,
    mode: "live",
    removeClasses: ["mobile-rotate-popup"],
    addClasses: ["mobile-rotate-live"],
    retainViewportCover: true,
    disableNativeControls: true,
    enableNativeControls: false,
    clearLiveControlsVisible: true,
    clearLoading: true,
    syncFullscreenButtons: true,
    showLiveControls: true,
    showPopupControls: true,
  });

  assert.equal(card.classList.contains("mobile-rotate-popup"), false);
  assert.equal(card.classList.contains("mobile-rotate-live"), true);
  assert.equal(host.classList.contains("mobile-view-rotate-cover"), true);
  assert.equal(liveStage.classList.contains("live-controls-visible"), false);
  assert.equal(host._rotateOverlayActive, true);
  assert.equal(host._rotateOverlayMode, "live");
  assert.deepEqual(calls, [
    ["bubble-sync", true],
    ["navbar-sync"],
    ["card-view", { active: true, mode: "live" }],
    ["native", false, { applyFullscreenStyle: true }],
    ["zoom", card],
    ["loading", false],
    ["fullscreen-sync"],
    ["live-controls"],
    ["popup-controls"],
  ]);
});

test("rotate overlay scheduling preserves host compatibility callbacks", () => {
  const { host } = createHost();
  const frames = [];
  const cancelled = [];
  host._rotateOverlayActive = true;
  host._rotateOverlayRaf = 7;
  host._syncRotateOverlayViewportState = () => frames.push("sync");
  const controller = new LiveRotateOverlayController(host, {
    requestFrame: (callback) => {
      frames.push(callback);
      return 8;
    },
    cancelFrame: (frame) => cancelled.push(frame),
  });

  controller.scheduleUpdate();

  assert.deepEqual(cancelled, [7]);
  assert.equal(host._rotateOverlayRaf, 8);
  frames[0]();
  assert.equal(host._rotateOverlayRaf, 0);
  assert.deepEqual(frames.slice(1), ["sync"]);
});

test("rotate overlay native controls retain retry timing and timer receiver", () => {
  const { calls, host } = createHost();
  const scheduled = [];
  const video = {
    controls: false,
    removeAttribute: (name) => calls.push(["remove-attribute", name]),
    setAttribute: (...args) => calls.push(["attribute", ...args]),
  };
  host._rotateOverlayActive = true;
  host._rotateOverlayMode = "popup";
  host._engine = { video };
  host._findVideoDeep = () => video;
  host._applyRotateVideoFullscreenStyle = (target) =>
    calls.push(["fullscreen-style", target]);
  host._clearRotateVideoFullscreenStyle = () =>
    calls.push(["clear-fullscreen-style"]);
  host._clearRotateOverlayAudioSync = () => calls.push(["clear-audio"]);
  host._bindRotateOverlayAudioSync = (target) =>
    calls.push(["bind-audio", target]);
  const controller = new LiveRotateOverlayController(host, {
    setTimer: (callback, delay) => {
      scheduled.push({ callback, delay });
      return scheduled.length;
    },
  });

  controller.setNativeControls(true);

  assert.equal(video.controls, true);
  assert.deepEqual(
    scheduled.map(({ delay }) => delay),
    [120, 420, 900],
  );
  assert.equal(
    calls.some(([name, target]) => name === "bind-audio" && target === video),
    true,
  );
  assert.equal(
    calls.some(
      ([name, target]) => name === "fullscreen-style" && target === video,
    ),
    true,
  );
});

test("rotate overlay fullscreen styling refreshes matching popup presentation zoom", () => {
  const { calls, host } = createHost();
  const styleCalls = [];
  const video = {
    getAttribute: () => "",
    setAttribute: (...args) => calls.push(["attribute", ...args]),
    style: {
      setProperty: (...args) => styleCalls.push(args),
    },
  };
  host._popupMediaPresentationController = {
    refreshVideo: (target) => calls.push(["popup-refresh", target]),
  };
  const controller = new LiveRotateOverlayController(host, {
    windowTarget: { innerWidth: 844, innerHeight: 390 },
  });

  controller.applyVideoFullscreenStyle(video);

  assert.equal(styleCalls.length > 0, true);
  assert.equal(
    calls.some(
      ([name, target]) => name === "popup-refresh" && target === video,
    ),
    true,
  );
});

test("rotate overlay disposal clears presentation resources", () => {
  const { calls, host } = createHost();
  const removed = [];
  const video = {
    removeEventListener: (...args) => removed.push(args),
    setAttribute: (...args) => calls.push(["restore-style", ...args]),
  };
  const onVolumeChange = () => {};
  host.classList.add("mobile-view-rotate-cover");
  host._rotateOverlayRaf = 12;
  host._rotateOverlayExitT = 18;
  host._rotateLiveOverlayDismissed = true;
  host._rotateOverlaySyncVideo = video;
  host._onRotateOverlayVolumeChange = onVolumeChange;
  host._rotateStyledVideo = video;
  host._rotateStyledVideoCssText = "opacity: 0.5;";
  const cancelled = [];
  const cleared = [];
  const controller = new LiveRotateOverlayController(host, {
    cancelFrame: (frame) => cancelled.push(frame),
    clearTimer: (timer) => cleared.push(timer),
  });

  controller.dispose();

  assert.deepEqual(cancelled, [12]);
  assert.deepEqual(cleared, [18]);
  assert.deepEqual(removed, [["volumechange", onVolumeChange]]);
  assert.equal(host.classList.contains("mobile-view-rotate-cover"), false);
  assert.equal(host._rotateOverlayRaf, 0);
  assert.equal(host._rotateOverlayExitT, null);
  assert.equal(host._rotateLiveOverlayDismissed, false);
  assert.equal(host._rotateOverlaySyncVideo, null);
  assert.equal(host._rotateStyledVideo, null);
  assert.deepEqual(calls, [["restore-style", "style", "opacity: 0.5;"]]);
});
