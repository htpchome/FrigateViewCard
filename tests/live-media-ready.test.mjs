import { test } from "node:test";
import assert from "node:assert/strict";
import { findVideoDeep } from "../src/shared/media/fullscreen.js";
import { waitForMediaStart } from "../src/shared/media/first-frame.js";

globalThis.window = globalThis.window || { customCards: [] };
globalThis.window.customCards = globalThis.window.customCards || [];
globalThis.document = globalThis.document || {
  createElement: () => ({
    style: {},
    setAttribute() {},
    removeAttribute() {},
    appendChild() {},
    addEventListener() {},
    removeEventListener() {},
    querySelector() {
      return null;
    },
    querySelectorAll() {
      return [];
    },
  }),
  head: { appendChild() {} },
};
globalThis.customElements = globalThis.customElements || {
  define() {},
  get() {
    return undefined;
  },
};
globalThis.HTMLElement =
  globalThis.HTMLElement ||
  class {
    attachShadow() {
      return {
        addEventListener() {},
        removeEventListener() {},
        querySelector() {
          return null;
        },
        querySelectorAll() {
          return [];
        },
      };
    }
  };
globalThis.HTMLImageElement = globalThis.HTMLImageElement || class {};

const { FrigateViewCard } = await import("../src/card/FrigateViewCard.js");

test("stream readiness reports a video inside nested shadow roots", async () => {
  const video = {
    addEventListener() {},
    currentTime: 0.25,
    readyState: 2,
    webkitDecodedFrameCount: 1,
  };
  const playerShadowRoot = {
    children: [],
    querySelector: (selector) => (selector === "video" ? video : null),
  };
  const player = {
    children: [],
    querySelector: () => null,
    shadowRoot: playerShadowRoot,
  };
  const streamShadowRoot = {
    children: [player],
    querySelector: () => null,
  };
  const streamEl = {
    children: [],
    querySelector: () => null,
    shadowRoot: streamShadowRoot,
  };
  let readyVideo = null;

  const started = await waitForMediaStart(
    streamEl,
    500,
    {
      minCurrentTime: 0.05,
      minDecodedFrames: 1,
      requireReadyState: 2,
      onVideoReady: (discoveredVideo) => {
        readyVideo = discoveredVideo;
      },
      resolveVideo: findVideoDeep,
    },
  );

  assert.equal(started, true);
  assert.equal(readyVideo, video);
});

test("known ready media uses the shared live attachment path without querying", () => {
  const engine = {};
  const host = {};
  const video = { parentElement: host, style: {} };
  const calls = [];
  const context = {
    _engine: engine,
    _liveViewResizeController: {
      attachMedia: (media) => calls.push(["resize", media]),
    },
    _liveVideoZoomController: {
      video,
      host,
      interactionTarget: video,
      refresh: () => calls.push(["refresh"]),
    },
    _findFullscreenVideo: () => {
      throw new Error("ready media should not be queried again");
    },
    _findVideoDeep: () => {
      throw new Error("ready media should not be queried again");
    },
    _syncPictureInPictureButtons: () => calls.push(["pip"]),
  };

  FrigateViewCard.prototype._attachMainLiveVideoZoom.call(
    context,
    engine,
    video,
  );

  assert.deepEqual(calls, [
    ["resize", video],
    ["refresh"],
    ["pip"],
  ]);
  assert.equal(video.style.objectFit, "contain");
});

test("HA direct stale checks probe only the visible HA player", () => {
  const inactiveVideo = {
    readyState: 0,
    ended: false,
    paused: true,
    currentTime: 0,
    webkitDecodedFrameCount: 0,
  };
  const activeVideo = {
    readyState: 4,
    ended: false,
    paused: false,
    currentTime: 10,
    webkitDecodedFrameCount: 20,
  };
  const player = (video, hidden) => ({
    hidden,
    classList: { contains: (name) => name === "hidden" && hidden },
    shadowRoot: {
      querySelector: (selector) => (selector === "video" ? video : null),
    },
    querySelector: () => null,
  });
  const engine = {
    tagName: "HA-CAMERA-STREAM",
    shadowRoot: {
      querySelectorAll: () => [
        player(inactiveVideo, true),
        player(activeVideo, false),
      ],
    },
  };
  const mountCalls = [];
  const context = {
    _engine: engine,
    _started: true,
    _hass: {},
    _config: {},
    _viewMode: "single",
    _mountInProgress: false,
    _lastLiveKick: 0,
    _mseConnectAt: 0,
    _mseLastChunkAt: 0,
    _$: () => null,
    _findVideoDeep: () => {
      throw new Error("HA direct must not use the generic nested-video probe");
    },
    _isPreviewPageActive: () => false,
    _isCardVisible: () => true,
    _isFirefox: () => false,
    _mountEngine: (...args) => mountCalls.push(args),
  };

  FrigateViewCard.prototype._kickLiveIfStale.call(context);

  assert.deepEqual(mountCalls, []);
});

test("HA direct HLS stale checks ignore a hidden pending WebRTC video", () => {
  const pendingWebRtcVideo = {
    readyState: 0,
    ended: false,
    paused: true,
    currentTime: 0,
    webkitDecodedFrameCount: 0,
  };
  const activeHlsVideo = {
    readyState: 4,
    ended: false,
    paused: false,
    currentTime: 10,
    webkitDecodedFrameCount: 20,
  };
  const engine = {
    tagName: "HA-HLS-PLAYER",
    type: "ha_direct",
    streamType: "hls",
    hidden: false,
    classList: { contains: () => false },
    shadowRoot: {
      querySelector: (selector) =>
        selector === "video" ? activeHlsVideo : null,
    },
    querySelector: () => null,
  };
  const mountCalls = [];
  const context = {
    _engine: engine,
    _started: true,
    _hass: {},
    _config: {},
    _viewMode: "single",
    _mountInProgress: false,
    _lastLiveKick: 0,
    _mseConnectAt: 0,
    _mseLastChunkAt: 0,
    _$: (selector) =>
      selector === "#engine"
        ? { children: [pendingWebRtcVideo, engine] }
        : null,
    _findVideoDeep: () => {
      throw new Error("HA direct must not probe hidden sibling media");
    },
    _isPreviewPageActive: () => false,
    _isCardVisible: () => true,
    _isFirefox: () => false,
    _mountEngine: (...args) => mountCalls.push(args),
  };

  FrigateViewCard.prototype._kickLiveIfStale.call(context);

  assert.deepEqual(mountCalls, []);
});

test("HA direct WebRTC stale checks probe the committed engine video", () => {
  const activeWebRtcVideo = {
    readyState: 4,
    ended: false,
    paused: false,
    currentTime: 10,
    webkitDecodedFrameCount: 20,
  };
  const engine = {
    type: "ha_direct",
    streamType: "webrtc",
    video: activeWebRtcVideo,
  };
  const mountCalls = [];
  const context = {
    _engine: engine,
    _started: true,
    _hass: {},
    _config: {},
    _viewMode: "single",
    _mountInProgress: false,
    _lastLiveKick: 0,
    _mseConnectAt: 0,
    _mseLastChunkAt: 0,
    _$: (selector) => (selector === "#engine" ? {} : null),
    _findVideoDeep: () => {
      throw new Error("HA direct must not probe unrelated slot media");
    },
    _isPreviewPageActive: () => false,
    _isCardVisible: () => true,
    _isFirefox: () => false,
    _mountEngine: (...args) => mountCalls.push(args),
  };

  FrigateViewCard.prototype._kickLiveIfStale.call(context);

  assert.deepEqual(mountCalls, []);
});

test("stream readiness releases pending video callbacks and listeners on abort", async () => {
  const listeners = new Map();
  const cancelledFrames = [];
  const video = {
    readyState: 0,
    ended: false,
    paused: true,
    currentTime: 0,
    webkitDecodedFrameCount: 0,
    addEventListener(type, handler) {
      const handlers = listeners.get(type) || new Set();
      handlers.add(handler);
      listeners.set(type, handlers);
    },
    removeEventListener(type, handler) {
      listeners.get(type)?.delete(handler);
    },
    requestVideoFrameCallback() {
      return 17;
    },
    cancelVideoFrameCallback(id) {
      cancelledFrames.push(id);
    },
  };
  const abortController = new AbortController();
  const pending = waitForMediaStart(
    {},
    1000,
    {
      strict: true,
      abortSignal: abortController.signal,
      resolveVideo: () => video,
    },
  );

  await new Promise((resolve) => setTimeout(resolve, 220));
  abortController.abort();

  assert.equal(await pending, false);
  assert.deepEqual(cancelledFrames, [17]);
  assert.equal(
    [...listeners.values()].reduce((count, handlers) => count + handlers.size, 0),
    0,
  );
});
