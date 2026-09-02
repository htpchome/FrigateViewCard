import { test } from "node:test";
import assert from "node:assert/strict";

import {
  PopupLifecycleController,
  resolvePopupShellGeometry,
} from "../src/features/popup/lifecycle.ctrl.js";

const createClassList = () => {
  const values = new Set();
  return {
    add: (value) => values.add(value),
    remove: (value) => values.delete(value),
    toggle: (value, force) => {
      const active = force == null ? !values.has(value) : force === true;
      if (active) values.add(value);
      else values.delete(value);
      return active;
    },
    contains: (value) => values.has(value),
    values,
  };
};

const createLifecycleFixture = ({ firefox = false, mediaType = "clip" } = {}) => {
  const calls = [];
  const body = { scrollTop: 44 };
  const popup = {
    classList: createClassList(),
    style: {},
    querySelector: (selector) => (selector === ".popup-body" ? body : null),
  };
  const source = {
    remove: () => calls.push(["removeSource"]),
  };
  const video = {
    srcObject: {},
    pause: () => calls.push(["pauseVideo"]),
    removeAttribute: (name) => calls.push(["removeAttribute", name]),
    querySelectorAll: (selector) => (selector === "source" ? [source] : []),
  };
  const viewer = {
    style: { display: "none" },
    innerHTML: "video markup",
    querySelectorAll: (selector) => (selector === "video" ? [video] : []),
  };
  const controls = {
    hidden: false,
    classList: {
      remove: (value) => calls.push(["removeControlsClass", value]),
    },
  };
  const elements = new Map([
    ["#myPopup", popup],
    ["#viewer", viewer],
    ["#popup-media-controls", controls],
  ]);
  const timers = new Map();
  let nextTimer = 1;
  const controller = new PopupLifecycleController({
    query: (selector) => elements.get(selector) || null,
    isFirefox: () => firefox,
    onPauseSlideshow: () => calls.push(["pauseSlideshow"]),
    onResumeSlideshow: () => calls.push(["resumeSlideshow"]),
    onSetLiveCovered: (covered) => calls.push(["coverLive", covered]),
    onMuteLive: (muted, options) =>
      calls.push(["muteLive", muted, options.source]),
    onSyncFullscreen: () => calls.push(["syncFullscreen"]),
    onSyncPictureInPicture: () => calls.push(["syncPictureInPicture"]),
    onScheduleOverlay: () => calls.push(["scheduleOverlay"]),
    onReleasePlaybackTarget: (scope) =>
      calls.push(["releasePlaybackTarget", scope]),
    onClearPictureInPicture: (scope) =>
      calls.push(["clearPictureInPicture", scope]),
    onClearVideoZoom: () => calls.push(["clearVideoZoom"]),
    onDisposeCarousel: () => calls.push(["disposeCarousel"]),
    onClearCarousel: () => calls.push(["clearCarousel"]),
    onDisposeMediaControls: () => calls.push(["disposeMediaControls"]),
    onHideInfo: () => calls.push(["hideInfo"]),
    onClearMediaTransport: () => calls.push(["clearMediaTransport"]),
    setTimer: (callback) => {
      const id = nextTimer;
      nextTimer += 1;
      timers.set(id, callback);
      return id;
    },
    clearTimer: (id) => {
      calls.push(["clearTimer", id]);
      timers.delete(id);
    },
  });
  controller.setMediaState({
    mediaType,
    playing: { id: "event-1" },
  });
  controller.setMediaCamera("front");
  return {
    body,
    calls,
    controller,
    controls,
    popup,
    timers,
    video,
    viewer,
  };
};

test("popup lifecycle opens, closes, and resets popup media surfaces", () => {
  const { body, calls, controller, controls, popup, video, viewer } =
    createLifecycleFixture();
  controller.setMediaCleanup(() => calls.push(["mediaCleanup"]));

  assert.equal(controller.enter(), true);
  assert.equal(viewer.style.display, "flex");
  assert.equal(popup.classList.contains("is-open"), true);
  assert.equal(popup.style.transform, "translateY(0)");
  assert.equal(body.scrollTop, 0);

  assert.equal(controller.close(), true);
  assert.equal(popup.classList.contains("is-open"), false);
  assert.equal(popup.style.transform, "translateY(100%)");
  assert.equal(viewer.style.display, "none");
  assert.equal(viewer.innerHTML, "");
  assert.equal(video.srcObject, null);
  assert.equal(controls.hidden, true);
  assert.deepEqual(calls.slice(0, 7), [
    ["pauseSlideshow"],
    ["coverLive", true],
    ["muteLive", true, "popup-open"],
    ["syncFullscreen"],
    ["syncPictureInPicture"],
    ["scheduleOverlay"],
    ["releasePlaybackTarget", "popup"],
  ]);
  assert.equal(calls.some(([kind]) => kind === "mediaCleanup"), true);
  assert.equal(calls.some(([kind]) => kind === "clearMediaTransport"), true);
  assert.equal(controller.mediaType(), "");
  assert.equal(controller.playing(), null);
  assert.equal(controller.mediaCamera(), "");
  assert.equal(calls.at(-1)[0], "resumeSlideshow");
});

test("popup lifecycle resolves its shell against the visible left column before opening", () => {
  const values = new Map();
  const popup = {
    classList: createClassList(),
    style: {
      setProperty: (name, value) => values.set(name, value),
      removeProperty: (name) => values.delete(name),
    },
    querySelector: () => null,
  };
  const card = {
    clientLeft: 1,
    clientWidth: 998,
    getBoundingClientRect: () => ({ left: 100, right: 1100, width: 1000 }),
  };
  const colLeft = {
    getBoundingClientRect: () => ({ left: 101, right: 701, width: 600 }),
  };
  const controller = new PopupLifecycleController({
    query: (selector) =>
      new Map([
        ["#myPopup", popup],
        ["#card", card],
        ["#col-left", colLeft],
      ]).get(selector) || null,
  });

  assert.equal(controller.open(), true);
  assert.equal(values.get("--popup-shell-left"), "0px");
  assert.equal(values.get("--popup-shell-width"), "600px");
  assert.equal(popup.classList.contains("is-open"), true);
});

test("popup shell geometry rejects off-card anchors and clips to the card", () => {
  const card = {
    getBoundingClientRect: () => ({ left: 100, right: 500, width: 400 }),
  };
  assert.deepEqual(
    resolvePopupShellGeometry({
      card,
      anchor: {
        getBoundingClientRect: () => ({ left: 90, right: 360, width: 270 }),
      },
    }),
    { left: 0, width: 260 },
  );
  assert.equal(
    resolvePopupShellGeometry({
      card,
      anchor: {
        getBoundingClientRect: () => ({ left: -100, right: -99, width: 1 }),
      },
    }),
    null,
  );
});

test("popup lifecycle preserves Firefox source-drop delay and can cancel it", () => {
  const { calls, controller, timers, viewer } = createLifecycleFixture({
    firefox: true,
  });

  controller.stopMedia();
  assert.equal(viewer.innerHTML, "video markup");
  assert.equal(timers.size, 1);

  controller.clearMediaCleanup();
  assert.equal(timers.size, 0);
  assert.equal(calls.some(([kind]) => kind === "clearTimer"), true);

  controller.setMediaState({ mediaType: "clip" });
  controller.stopMedia();
  const delayedDrop = [...timers.values()][0];
  delayedDrop();
  assert.equal(viewer.innerHTML, "");
});

test("popup lifecycle owns drag binding and disposal", () => {
  const { calls, controller } = createLifecycleFixture();
  let dragOptions = null;
  let disposeCount = 0;
  controller._createDragController = (options) => {
    dragOptions = options;
    return {
      bind: () => calls.push(["bindDrag"]),
      dispose: () => {
        disposeCount += 1;
      },
    };
  };

  controller.bindInteractions();
  controller.bindInteractions();
  assert.equal(disposeCount, 1);
  assert.equal(dragOptions.closeThreshold, 100);
  assert.equal(dragOptions.isPopupOpen(), false);

  controller.dispose();
  assert.equal(disposeCount, 2);
});

test("popup lifecycle applies and clears compact popup presentation", () => {
  const { controller, popup } = createLifecycleFixture();
  controller.setCompact(true);
  assert.equal(controller.isCompact(), true);
  assert.equal(popup.classList.contains("popup-content--compact"), true);

  controller.enter();
  assert.equal(popup.style.transform, "translate(-50%, 0)");
  controller.close();
  assert.equal(controller.isCompact(), false);
  assert.equal(popup.classList.contains("popup-content--compact"), false);
});
