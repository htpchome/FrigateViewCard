import { test } from "node:test";
import assert from "node:assert/strict";

import {
  PICTURE_IN_PICTURE_METHOD_STANDARD,
  PICTURE_IN_PICTURE_METHOD_WEBKIT,
  PictureInPictureButtonController,
  resolveVideoPictureInPictureSupport,
  toggleVideoPictureInPicture,
} from "../src/shared/media/picture-in-picture.js";

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

test("standard PiP support remains visible when Firefox suppresses its overlay", () => {
  const video = {
    disablePictureInPicture: true,
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

test("standard PiP enters without mutating disablePictureInPicture", async () => {
  const calls = [];
  const documentObj = {
    pictureInPictureEnabled: true,
    pictureInPictureElement: null,
  };
  const video = {
    ownerDocument: documentObj,
    disablePictureInPicture: true,
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
  assert.equal(video.disablePictureInPicture, true);
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
  assert.equal(button.hidden, true);
  assert.equal(button.disabled, true);
});
