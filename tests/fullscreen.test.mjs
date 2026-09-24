import { test } from "node:test";
import assert from "node:assert/strict";

import {
  exitDocumentFullscreen,
  findFullscreenVideo,
  findVideoDeep,
  requestMediaFullscreen,
} from "../src/shared/media/fullscreen.js";

test("fullscreen video discovery traverses known and nested media hosts", () => {
  const knownVideo = { tagName: "VIDEO" };
  const knownHost = {
    shadowRoot: {
      querySelector: (selector) => (selector === "video" ? knownVideo : null),
    },
    querySelector: () => null,
  };
  const knownRoot = {
    querySelector: () => null,
    querySelectorAll: () => [knownHost],
    shadowRoot: null,
  };

  assert.equal(findFullscreenVideo(knownRoot), knownVideo);

  const deepVideo = { tagName: "VIDEO" };
  const deepRoot = {
    querySelector: () => null,
    shadowRoot: {
      querySelector: () => null,
      shadowRoot: null,
      children: [{
        querySelector: () => null,
        shadowRoot: { querySelector: () => deepVideo, children: [] },
        children: [],
      }],
    },
    children: [],
  };

  assert.equal(findVideoDeep(deepRoot), deepVideo);
  assert.equal(findVideoDeep(deepRoot, 0), null);
});

test("iOS fullscreen uses the native video API with its video receiver", () => {
  const calls = [];
  const video = {
    webkitEnterFullscreen() {
      calls.push(["request", this]);
    },
  };

  const requested = requestMediaFullscreen({
    element: {},
    video,
    navigatorObj: { userAgent: "iPhone", platform: "iPhone" },
    onBeginNativeVideoFullscreen: (target) => calls.push(["begin", target]),
  });

  assert.equal(requested, true);
  assert.deepEqual(calls, [
    ["begin", video],
    ["request", video],
  ]);
});

test("preferred element fullscreen bypasses the iOS native video API", () => {
  const calls = [];
  const element = {
    requestFullscreen() {
      calls.push(["element-request", this]);
      return Promise.resolve();
    },
  };
  const video = {
    webkitEnterFullscreen() {
      calls.push(["video-request", this]);
    },
  };

  const requested = requestMediaFullscreen({
    element,
    video,
    preferElementFullscreen: true,
    navigatorObj: { userAgent: "iPhone", platform: "iPhone" },
    onBeginNativeVideoFullscreen: () => calls.push(["begin-native"]),
    onBeginDocumentFullscreen: (target) =>
      calls.push(["begin-document", target]),
  });

  assert.equal(requested, true);
  assert.deepEqual(calls, [
    ["begin-document", video],
    ["element-request", element],
  ]);
});

test("fullscreen falls back to the video request and reports rejection", async () => {
  const calls = [];
  const video = {
    requestFullscreen() {
      calls.push(["video-request", this]);
      return Promise.reject(new Error("denied"));
    },
  };

  const requested = requestMediaFullscreen({
    element: {},
    video,
    navigatorObj: { userAgent: "Desktop", platform: "Linux" },
    onBeginDocumentFullscreen: (target) =>
      calls.push(["begin-document", target]),
    onRequestFailure: () => calls.push(["failure"]),
  });
  await Promise.resolve();

  assert.equal(requested, true);
  assert.deepEqual(calls, [
    ["begin-document", video],
    ["video-request", video],
    ["failure"],
  ]);
});

test("fullscreen exit preserves document receiver and failure behavior", () => {
  const documentObj = {
    exitFullscreen() {
      assert.equal(this, documentObj);
      return Promise.resolve();
    },
  };

  assert.equal(exitDocumentFullscreen(documentObj), true);
  assert.equal(
    exitDocumentFullscreen({
      exitFullscreen() {
        throw new Error("denied");
      },
    }),
    false,
  );
  assert.equal(exitDocumentFullscreen({}), false);
});
