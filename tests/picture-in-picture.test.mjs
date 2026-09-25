import { test } from "node:test";
import assert from "node:assert/strict";

import {
  PICTURE_IN_PICTURE_METHOD_STANDARD,
  PICTURE_IN_PICTURE_METHOD_WEBKIT,
  PictureInPictureButtonController,
  PictureInPictureController,
  refreshVideoPictureInPictureSuppressionLayout,
  resolveVideoPictureInPictureSupport,
  toggleVideoPictureInPicture,
} from "../src/shared/media/picture-in-picture.js";
import { hasNativePictureInPictureAllowance } from "../src/shared/media/video-factory.js";

function createEventTarget(overrides = {}) {
  const listeners = new Map();
  return {
    ...overrides,
    addEventListener(type, listener) {
      const entries = listeners.get(type) || new Set();
      entries.add(listener);
      listeners.set(type, entries);
    },
    removeEventListener(type, listener) {
      listeners.get(type)?.delete(listener);
    },
    dispatch(type) {
      for (const listener of listeners.get(type) || []) listener();
    },
    listenerCount(type) {
      return listeners.get(type)?.size || 0;
    },
  };
}

function createButton() {
  const attributes = new Map();
  const classes = new Set();
  return {
    hidden: false,
    disabled: false,
    title: "",
    classList: {
      toggle(name, enabled) {
        if (enabled) classes.add(name);
        else classes.delete(name);
      },
      contains(name) {
        return classes.has(name);
      },
    },
    setAttribute(name, value) {
      attributes.set(name, String(value));
    },
    getAttribute(name) {
      return attributes.get(name);
    },
  };
}

function createStyleDeclaration(initial = {}) {
  const values = new Map(
    Object.entries(initial).map(([name, value]) => [
      name,
      { value: String(value), priority: "" },
    ]),
  );
  return {
    getPropertyValue(name) {
      return values.get(name)?.value || "";
    },
    getPropertyPriority(name) {
      return values.get(name)?.priority || "";
    },
    setProperty(name, value, priority = "") {
      values.set(name, {
        value: String(value),
        priority: String(priority),
      });
    },
    removeProperty(name) {
      const previous = values.get(name)?.value || "";
      values.delete(name);
      return previous;
    },
  };
}

test("Firefox suppression layout refresh nudges and restores video width", () => {
  const style = createStyleDeclaration({ width: "100%" });
  const frames = [];
  let layoutReads = 0;
  const video = {
    style,
    getBoundingClientRect() {
      layoutReads += 1;
      return { width: 640 };
    },
  };

  assert.equal(
    refreshVideoPictureInPictureSuppressionLayout({
      video,
      requestFrame: (callback) => frames.push(callback),
    }),
    true,
  );
  assert.equal(style.getPropertyValue("width"), "639px");
  assert.equal(style.getPropertyPriority("width"), "important");
  assert.equal(frames.length, 1);

  frames[0]();

  assert.equal(style.getPropertyValue("width"), "100%");
  assert.equal(style.getPropertyPriority("width"), "");
  assert.equal(layoutReads, 3);
});

test("standard PiP support is detected from the browser API", () => {
  const video = {
    requestPictureInPicture() {},
  };
  const support = resolveVideoPictureInPictureSupport({
    video,
    documentObj: { pictureInPictureEnabled: true },
  });

  assert.deepEqual(support, {
    supported: true,
    method: PICTURE_IN_PICTURE_METHOD_STANDARD,
  });
});

test("standard PiP enters through the browser API", async () => {
  const calls = [];
  const documentObj = {
    pictureInPictureEnabled: true,
    pictureInPictureElement: null,
  };
  const video = {
    ownerDocument: documentObj,
    async requestPictureInPicture() {
      calls.push("request");
      documentObj.pictureInPictureElement = video;
    },
  };

  const result = await toggleVideoPictureInPicture({ video, documentObj });

  assert.deepEqual(result, {
    active: true,
    method: PICTURE_IN_PICTURE_METHOD_STANDARD,
  });
  assert.deepEqual(calls, ["request"]);
});

test("Firefox PiP exit reasserts suppression and resumes live playback after teardown", async () => {
  const attributes = new Map([["disablepictureinpicture", ""]]);
  const scheduled = [];
  const frames = [];
  const style = createStyleDeclaration({ width: "100%" });
  let playCalls = 0;
  const documentObj = {
    pictureInPictureEnabled: true,
    pictureInPictureElement: null,
  };
  const video = createEventTarget({
    ownerDocument: documentObj,
    disablePictureInPicture: true,
    paused: false,
    style,
    getBoundingClientRect() {
      return { width: 640 };
    },
    setAttribute(name, value) {
      attributes.set(name, String(value));
    },
    removeAttribute(name) {
      attributes.delete(name);
    },
    hasAttribute(name) {
      return attributes.has(name);
    },
    async play() {
      playCalls += 1;
      this.paused = false;
    },
    async requestPictureInPicture() {
      assert.equal(this.disablePictureInPicture, false);
      assert.equal(this.hasAttribute("disablepictureinpicture"), false);
      documentObj.pictureInPictureElement = video;
    },
  });

  const result = await toggleVideoPictureInPicture({
    video,
    documentObj,
    temporarilyAllowDisabled: true,
    resumePlaybackOnExit: true,
    setTimer: (callback, delayMs) => {
      scheduled.push({ callback, delayMs });
    },
    requestFrame: (callback) => frames.push(callback),
  });

  assert.deepEqual(result, {
    active: true,
    method: PICTURE_IN_PICTURE_METHOD_STANDARD,
  });
  assert.equal(video.disablePictureInPicture, false);
  assert.equal(video.hasAttribute("disablepictureinpicture"), false);
  assert.equal(hasNativePictureInPictureAllowance(video), true);

  // Firefox can transiently omit the active PiP element while the session is
  // still open. The explicit session remains authoritative until leave.
  documentObj.pictureInPictureElement = null;
  assert.equal(hasNativePictureInPictureAllowance(video), true);
  video.dispatch("leavepictureinpicture");

  assert.equal(video.disablePictureInPicture, true);
  assert.equal(video.hasAttribute("disablepictureinpicture"), true);
  assert.equal(hasNativePictureInPictureAllowance(video), false);
  assert.equal(video.listenerCount("leavepictureinpicture"), 0);
  assert.deepEqual(
    scheduled.map(({ delayMs }) => delayMs),
    [0, 120, 180],
  );

  // Firefox may finish teardown after the leave event and expose the native
  // control again while also pausing the source video.
  video.disablePictureInPicture = false;
  video.removeAttribute("disablepictureinpicture");
  video.paused = true;
  for (const { callback } of scheduled) callback();

  assert.equal(video.disablePictureInPicture, true);
  assert.equal(video.hasAttribute("disablepictureinpicture"), true);
  assert.equal(video.paused, false);
  assert.equal(playCalls, 1);
  assert.equal(style.getPropertyValue("width"), "639px");
  assert.equal(frames.length, 1);
  frames[0]();
  assert.equal(style.getPropertyValue("width"), "100%");
});

test("Firefox PiP entry restores suppression after a failed request", async () => {
  const attributes = new Map([["disablepictureinpicture", ""]]);
  const video = {
    disablePictureInPicture: true,
    setAttribute(name, value) {
      attributes.set(name, String(value));
    },
    removeAttribute(name) {
      attributes.delete(name);
    },
    hasAttribute(name) {
      return attributes.has(name);
    },
    async requestPictureInPicture() {
      throw new Error("request rejected");
    },
  };

  await assert.rejects(
    toggleVideoPictureInPicture({
      video,
      documentObj: { pictureInPictureEnabled: true },
      temporarilyAllowDisabled: true,
    }),
    /request rejected/,
  );
  assert.equal(video.disablePictureInPicture, true);
  assert.equal(video.hasAttribute("disablepictureinpicture"), true);
  assert.equal(hasNativePictureInPictureAllowance(video), false);
});

test("standard PiP exits when the same video is active", async () => {
  const calls = [];
  const video = { requestPictureInPicture() {} };
  const documentObj = {
    pictureInPictureEnabled: true,
    pictureInPictureElement: video,
    async exitPictureInPicture() {
      calls.push("exit");
      this.pictureInPictureElement = null;
    },
  };

  const result = await toggleVideoPictureInPicture({ video, documentObj });

  assert.equal(result.active, false);
  assert.deepEqual(calls, ["exit"]);
});

test("WebKit presentation mode is used as the native fallback", async () => {
  const calls = [];
  const video = {
    webkitPresentationMode: "inline",
    webkitSupportsPresentationMode: (mode) => mode === "picture-in-picture",
    webkitSetPresentationMode(mode) {
      calls.push(mode);
      this.webkitPresentationMode = mode;
    },
  };

  assert.deepEqual(resolveVideoPictureInPictureSupport({ video }), {
    supported: true,
    method: PICTURE_IN_PICTURE_METHOD_WEBKIT,
  });
  assert.equal((await toggleVideoPictureInPicture({ video })).active, true);
  assert.deepEqual(calls, ["picture-in-picture"]);
});

test("button controller tracks native PiP events and cleans up listeners", () => {
  const documentObj = {
    pictureInPictureEnabled: true,
    pictureInPictureElement: null,
  };
  const video = createEventTarget({
    ownerDocument: documentObj,
    readyState: 0,
    requestPictureInPicture() {},
  });
  const button = createButton();
  const controller = new PictureInPictureButtonController({
    button,
    video,
    documentObj,
  }).bind();

  assert.equal(button.hidden, true);
  assert.equal(button.disabled, true);

  // Live streams can resume without Firefox emitting loadedmetadata again.
  video.readyState = 2;
  video.dispatch("playing");
  assert.equal(button.hidden, false);
  assert.equal(button.disabled, false);

  video.readyState = 0;
  video.dispatch("emptied");
  assert.equal(button.hidden, true);
  assert.equal(button.disabled, true);

  video.readyState = 1;
  video.dispatch("loadedmetadata");
  assert.equal(button.hidden, false);
  assert.equal(button.disabled, false);
  assert.equal(button.getAttribute("aria-pressed"), "false");
  assert.equal(video.listenerCount("enterpictureinpicture"), 1);

  documentObj.pictureInPictureElement = video;
  video.dispatch("enterpictureinpicture");
  assert.equal(button.classList.contains("active"), true);
  assert.equal(button.getAttribute("aria-pressed"), "true");
  assert.equal(button.title, "Exit Picture-in-Picture");

  controller.dispose();
  assert.equal(video.listenerCount("enterpictureinpicture"), 0);
  assert.equal(video.listenerCount("playing"), 0);
  assert.equal(button.hidden, true);
  assert.equal(button.disabled, true);
});

test("PiP controller binds only eligible live and popup surfaces", () => {
  const liveButton = createButton();
  const popupButton = createButton();
  const liveVideo = { ownerDocument: {} };
  const popupVideo = { ownerDocument: {} };
  const created = [];
  const nativeCalls = [];
  let popupOpen = false;
  let mobileTablet = false;
  let firefox = false;
  const controller = new PictureInPictureController({
    resolveButton: (scope) =>
      scope === "popup" ? popupButton : liveButton,
    resolveLiveVideo: () => liveVideo,
    resolvePopupVideo: () => popupVideo,
    isPopupOpen: () => popupOpen,
    isMobileTabletViewport: () => mobileTablet,
    isFirefox: () => firefox,
    createButtonController: (options) => {
      const entry = {
        ...options,
        bound: 0,
        refreshed: 0,
        disposed: 0,
        bind() {
          this.bound += 1;
          return this;
        },
        refresh() {
          this.refreshed += 1;
        },
        dispose() {
          this.disposed += 1;
        },
      };
      created.push(entry);
      return entry;
    },
    enableNative: (video) => nativeCalls.push(["enable", video]),
    disableNative: (video) => nativeCalls.push(["disable", video]),
  });

  controller.sync();
  assert.equal(created.length, 1);
  assert.equal(created[0].button, liveButton);
  assert.equal(created[0].video, liveVideo);
  assert.equal(popupButton.hidden, true);
  assert.deepEqual(nativeCalls, [
    ["enable", liveVideo],
    ["enable", null],
  ]);

  popupOpen = true;
  controller.sync();
  assert.equal(created[0].disposed, 1);
  assert.equal(created.length, 2);
  assert.equal(created[1].button, popupButton);
  assert.equal(created[1].video, popupVideo);

  firefox = true;
  mobileTablet = true;
  controller.sync();
  assert.equal(created[1].disposed, 1);
  assert.equal(liveButton.hidden, true);
  assert.equal(popupButton.hidden, true);
  assert.deepEqual(nativeCalls.slice(-2), [
    ["disable", liveVideo],
    ["disable", popupVideo],
  ]);
});

test("PiP controller preserves Firefox live and popup toggle policies", async () => {
  const video = { ownerDocument: { pictureInPictureEnabled: true } };
  const toggles = [];
  const failures = [];
  let popupControlsShown = 0;
  const controller = new PictureInPictureController({
    isFirefox: () => true,
    resolveSupport: () => ({ supported: true, method: "standard" }),
    togglePictureInPicture: async (options) => toggles.push(options),
    onFailure: (error) => failures.push(error.message),
    onShowPopupControls: () => {
      popupControlsShown += 1;
    },
  });

  await controller.toggle(video);
  await controller.toggle(video, { popup: true });

  assert.deepEqual(
    toggles.map(({ temporarilyAllowDisabled, resumePlaybackOnExit }) => ({
      temporarilyAllowDisabled,
      resumePlaybackOnExit,
    })),
    [
      { temporarilyAllowDisabled: true, resumePlaybackOnExit: true },
      { temporarilyAllowDisabled: true, resumePlaybackOnExit: false },
    ],
  );
  assert.equal(popupControlsShown, 1);
  assert.deepEqual(failures, []);
});

test("PiP controller reports unsupported and failed requests", async () => {
  const unsupported = [];
  const failures = [];
  let supported = false;
  const controller = new PictureInPictureController({
    resolveSupport: () => ({ supported, method: "" }),
    onUnsupported: () => unsupported.push(true),
    onFailure: (error) => failures.push(error.message),
    togglePictureInPicture: async () => {
      throw new Error("blocked");
    },
  });

  await controller.toggle(null);
  supported = true;
  await controller.toggle({ ownerDocument: {} });

  assert.deepEqual(unsupported, [true]);
  assert.deepEqual(failures, ["blocked"]);
});
