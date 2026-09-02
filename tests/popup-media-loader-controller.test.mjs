import { test } from "node:test";
import assert from "node:assert/strict";

import {
  PopupMediaLoaderController,
  bindPopupMediaSizing,
  bindPopupVideoReadiness,
  resolvePopupMediaSizing,
} from "../src/features/popup/media-loader.ctrl.js";

test("popup media sizing caps ultra-tall initial viewports at 4:3", () => {
  assert.deepEqual(
    resolvePopupMediaSizing({ videoWidth: 1920, videoHeight: 1080 }),
    {
      aspectRatio: "1920 / 1080",
      maxWidth: "124.444dvh",
      initialHeightCapped: false,
    },
  );
  assert.deepEqual(
    resolvePopupMediaSizing({ naturalWidth: 1080, naturalHeight: 1920 }),
    {
      aspectRatio: "4 / 3",
      maxWidth: "93.333dvh",
      initialHeightCapped: true,
    },
  );
  assert.equal(resolvePopupMediaSizing({ videoWidth: 0, videoHeight: 0 }), null);
});

test("popup media sizing keeps the viewer and custom controls at one width", () => {
  const values = new Map();
  const controlValues = new Map();
  const listeners = new Map();
  const classes = new Set();
  const viewer = {
    classList: {
      add: (name) => classes.add(name),
      remove: (name) => classes.delete(name),
    },
    style: {
      setProperty: (name, value) => values.set(name, value),
      removeProperty: (name) => values.delete(name),
    },
  };
  const controls = {
    style: {
      setProperty: (name, value) => controlValues.set(name, value),
      removeProperty: (name) => controlValues.delete(name),
    },
  };
  const media = {
    videoWidth: 0,
    videoHeight: 0,
    addEventListener: (name, listener) => listeners.set(name, listener),
    removeEventListener: (name, listener) => {
      if (listeners.get(name) === listener) listeners.delete(name);
    },
  };
  const cleanup = bindPopupMediaSizing({ viewer, media, controls });
  assert.equal(values.has("--popup-media-aspect-ratio"), false);
  assert.equal(controlValues.has("--popup-media-max-width"), false);
  assert.equal(classes.has("popup-media-ratio-ready"), false);

  media.videoWidth = 4;
  media.videoHeight = 3;
  listeners.get("loadedmetadata")();
  assert.equal(values.get("--popup-media-aspect-ratio"), "4 / 3");
  assert.equal(values.get("--popup-media-max-width"), "93.333dvh");
  assert.equal(controlValues.get("--popup-media-max-width"), "93.333dvh");
  assert.equal(classes.has("popup-media-ratio-ready"), true);
  assert.equal(classes.has("popup-media-height-capped"), false);

  media.videoWidth = 9;
  media.videoHeight = 16;
  listeners.get("resize")();
  assert.equal(values.get("--popup-media-aspect-ratio"), "4 / 3");
  assert.equal(values.get("--popup-media-max-width"), "93.333dvh");
  assert.equal(classes.has("popup-media-height-capped"), true);

  cleanup();
  assert.equal(values.size, 0);
  assert.equal(controlValues.size, 0);
  assert.equal(listeners.size, 0);
  assert.equal(classes.size, 0);
});

test("popup video remains in one loading state until playable", () => {
  const classes = new Set();
  const listeners = new Map();
  const viewer = {
    classList: {
      add: (name) => classes.add(name),
      remove: (name) => classes.delete(name),
    },
  };
  const video = {
    readyState: 0,
    addEventListener: (name, listener) => listeners.set(name, listener),
    removeEventListener: (name, listener) => {
      if (listeners.get(name) === listener) listeners.delete(name);
    },
  };

  const cleanup = bindPopupVideoReadiness({ viewer, video });
  assert.equal(classes.has("popup-media-loading"), true);

  listeners.get("loadeddata")();
  assert.equal(classes.has("popup-media-loading"), false);

  cleanup();
  assert.equal(listeners.size, 0);
});

test("showClipById routes clip loading through popup media rendering", () => {
  const host = {
    _findEventById: (id) => ({ id, has_clip: true, start_time: 10 }),
    _media: (id, file) => `/media/${id}/${file}`,
  };
  const controller = new PopupMediaLoaderController(host, {
    isIOS: true,
    buildVideoOptionsForView: (_view, options) => options,
    createVideoElement: (options) => ({ options }),
  });
  let rendered = null;
  controller.renderPopupMedia = (payload) => {
    rendered = payload;
  };

  controller.showClipById("event-1", { mediaType: "alert" });

  assert.equal(rendered.playingId, "event-1");
  assert.equal(rendered.mediaType, "alert");
  assert.equal(rendered.infoEvent.id, "event-1");
  assert.equal(
    rendered.mediaElement.options.src.includes("/media/event-1/master.m3u8"),
    true,
  );
  assert.equal(rendered.mediaElement.options.controls, false);
  assert.equal(typeof rendered.onMediaError, "function");
});

test("unavailable event clips fall back to snapshots and then clear messaging", () => {
  const event = {
    id: "event-1",
    camera: "front_door",
    start_time: 10,
    has_clip: true,
    has_snapshot: true,
  };
  const host = {
    _media: (id, file) => `/media/${id}/${file}`,
    _mediaForCamera: (id, file, camera) =>
      `/media/${camera}/${id}/${file}`,
  };
  const controller = new PopupMediaLoaderController(host, {
    isIOS: false,
    buildVideoOptionsForView: (_view, options) => options,
    createVideoElement: (options) => ({ options }),
  });
  const renders = [];
  controller.renderPopupMedia = (payload) => renders.push(payload);

  controller.showClip(event, { mediaType: "alert" });
  renders[0].onMediaError();

  assert.equal(renders.length, 2);
  assert.equal(renders[1].mediaType, "alert");
  assert.match(renders[1].html, /class="snap"/);
  assert.match(
    renders[1].html,
    /Frigate reported a clip for this event, but playback could not be loaded/,
  );
  assert.deepEqual(
    {
      displayMediaType: renders[1].infoOpts.displayMediaType,
      hasClip: renders[1].infoOpts.hasClip,
      hasSnapshot: renders[1].infoOpts.hasSnapshot,
    },
    {
      displayMediaType: "snapshot",
      hasClip: false,
      hasSnapshot: true,
    },
  );

  renders[1].onMediaError();

  assert.equal(renders.length, 3);
  assert.match(renders[2].html, /class="popup-media-unavailable"/);
  assert.match(renders[2].html, /neither the clip nor snapshot/);
  assert.match(renders[2].html, /retention policy configured for this camera/);
  assert.equal(renders[2].infoOpts.hasClip, false);
  assert.equal(renders[2].infoOpts.hasSnapshot, false);
});

test("popup event URLs use the event camera media context", () => {
  const calls = [];
  const host = {
    _media: () => "/media/active/clip.mp4",
    _mediaForCamera: (id, file, camera) => {
      calls.push({ id, file, camera });
      return `/media/${camera}/${id}/${file}`;
    },
  };
  const controller = new PopupMediaLoaderController(host);

  const source = controller.buildPopupClipSrc(
    "event-2",
    "clip.mp4",
    "back_yard",
  );

  assert.deepEqual(calls, [
    { id: "event-2", file: "clip.mp4", camera: "back_yard" },
  ]);
  assert.match(source, /^\/media\/back_yard\/event-2\/clip\.mp4\?fvc=/);
});

test("showRecording signs candidates and initializes popup recording playback on success", async () => {
  const calls = [];
  const viewer = {
    innerHTML: "",
    appended: null,
    appendChild: (node) => calls.push(["appendResizeGrip", node]),
  };
  const video = {
    tagName: "VIDEO",
    paused: false,
    seeking: false,
    currentSrc: "",
    src: "",
    addEventListener: (type) => calls.push(["addEventListener", type]),
    removeEventListener: (type) => calls.push(["removeEventListener", type]),
    pause: () => calls.push(["pause"]),
    play: () => Promise.resolve(),
  };
  const host = {
    _playSeq: 0,
    _cc: () => ({ clientId: "frigate", cam: "front_door" }),
    _popupInfoController: {
      render: (_event, opts) => calls.push(["renderInfo", opts.mediaType]),
    },
    _popupCarouselController: {
      clear: () => calls.push(["clearCarousel"]),
      render: (type, id) => calls.push(["renderCarousel", type, id]),
    },
    _popupMediaControlsController: {
      initialize: (_video, type) => calls.push(["initControls", type]),
      resetWithoutVideo: () => calls.push(["resetControls"]),
      showTemporarily: () => calls.push(["showControls"]),
      ensurePlaybackButtons: (kind) =>
        calls.push(["ensurePlayback", kind]),
    },
    _popupRecordingScrubController: {
      teardown: () => calls.push(["teardownScrub"]),
      initialize: (payload) =>
        calls.push(["initScrub", payload.sourceUrl]),
      setSourceUrl: (sourceUrl) => calls.push(["setScrubSource", sourceUrl]),
    },
    _popupLifecycleController: {
      enter: () => calls.push(["enter"]),
      clearMediaCleanup: () => calls.push(["clearCleanup"]),
      setMediaState: (state) => calls.push(["setMediaState", state.mediaType]),
      setMediaCleanup: (cleanup) => {
        calls.push(["setMediaCleanup"]);
        host.registeredMediaCleanup = cleanup;
      },
    },
    shadowRoot: {
      querySelector: () => viewer,
    },
    _attachPopupVideoZoom: (media) => {
      calls.push(["attachZoom", media]);
      return { kind: "zoom" };
    },
    _signed: async (path) => `signed:${path}`,
    _scheduleRotateOverlayUpdate: () => calls.push(["scheduleRotate"]),
  };
  const controller = new PopupMediaLoaderController(host, {
    buildVideoOptionsForView: (_view, options) => options,
    createVideoElement: (options) => {
      calls.push(["createVideo", options]);
      return video;
    },
    mountNodeIntoSlot: (slot, node) => {
      slot.appended = node;
    },
    createPopupViewResizeGrip: () => ({ classList: { toggle: () => {} } }),
    createPopupViewResizeController: (options) => ({
      bind: () => calls.push(["bindResize", options]),
      dispose: () => calls.push(["disposeResize"]),
    }),
  });
  let attempts = 0;
  controller.tryRecordingSource = async (_video, src) => {
    attempts += 1;
    calls.push(["trySource", src]);
    return attempts === 2;
  };

  await controller.showRecording(100, 160);

  assert.equal(viewer.appended, video);
  assert.equal(
    calls.find(([kind]) => kind === "createVideo")?.[1]?.controls,
    false,
  );
  assert.ok(
    calls.findIndex(([kind]) => kind === "initControls") <
      calls.findIndex(([kind]) => kind === "trySource"),
  );
  assert.equal(
    calls.some(([kind]) => kind === "enter"),
    true,
  );
  assert.equal(
    calls.some(([kind]) => kind === "trySource"),
    true,
  );
  assert.equal(
    calls.some(
      ([kind, type]) => kind === "initControls" && type === "recording",
    ),
    true,
  );
  assert.equal(
    calls.some(
      ([kind, options]) =>
        kind === "bindResize" &&
        options.media === video &&
        options.zoomController?.kind === "zoom",
    ),
    true,
  );
  assert.equal(
    calls.find(([kind]) => kind === "initScrub")?.[1],
    "",
  );
  assert.ok(
    calls.findIndex(([kind]) => kind === "initScrub") <
      calls.findIndex(([kind]) => kind === "trySource"),
  );
  assert.equal(
    calls.some(
      ([kind, sourceUrl]) =>
        kind === "setScrubSource" && String(sourceUrl).startsWith("signed:"),
    ),
    true,
  );

  host.registeredMediaCleanup();
  assert.equal(calls.some(([kind]) => kind === "disposeResize"), true);
});

test("cancelled popup recording cannot apply late controls or carousel state", async () => {
  const calls = [];
  let resolveSigned;
  const viewer = { innerHTML: "", appended: null };
  const video = {
    readyState: 0,
    paused: true,
    seeking: false,
    addEventListener: () => {},
    removeEventListener: () => {},
    pause: () => {},
    play: () => Promise.resolve(),
  };
  const host = {
    _playSeq: 0,
    _cc: () => ({ clientId: "frigate", cam: "front_door" }),
    _popupInfoController: { render: () => {} },
    _popupCarouselController: {
      clear: () => calls.push("clear-carousel"),
      render: () => calls.push("render-carousel"),
    },
    _popupMediaControlsController: {
      ensurePlaybackButtons: () => calls.push("ensure-controls"),
      initialize: () => calls.push("initialize-controls"),
      syncPlaybackButtons: () => calls.push("sync-controls"),
      update: () => calls.push("update-controls"),
      showTemporarily: () => {},
    },
    _popupRecordingScrubController: { initialize: () => {} },
    _popupLifecycleController: {
      setCompact: () => {},
      clearMediaCleanup: () => {},
      enter: () => {},
      setMediaState: () => {},
      setMediaCleanup: () => {},
    },
    shadowRoot: { querySelector: () => viewer },
    _signed: () =>
      new Promise((resolve) => {
        resolveSigned = resolve;
      }),
    _scheduleRotateOverlayUpdate: () => {},
    _preparePopupPlaybackTarget: () => calls.push("prepare-target"),
  };
  const controller = new PopupMediaLoaderController(host, {
    preferRecordingHls: () => false,
    buildVideoOptionsForView: (_view, options) => options,
    createVideoElement: () => video,
    mountNodeIntoSlot: (slot, node) => {
      slot.appended = node;
    },
  });
  controller.tryRecordingSource = async () => {
    calls.push("try-source");
    return true;
  };

  const pending = controller.showRecording(100, 160);
  assert.deepEqual(calls.slice(0, 3), [
    "clear-carousel",
    "ensure-controls",
    "initialize-controls",
  ]);
  controller.cancelPendingLoad();
  resolveSigned("signed-source");
  await pending;

  assert.equal(calls.includes("try-source"), false);
  assert.equal(calls.includes("render-carousel"), false);
  assert.equal(calls.includes("sync-controls"), false);
  assert.equal(calls.includes("prepare-target"), false);
});

test("compact popup clears stale carousel DOM without rendering replacement data", () => {
  const carouselCalls = [];
  const viewer = {
    innerHTML: "stale media",
    style: {},
    querySelector: () => null,
  };
  const body = { scrollTop: 10 };
  const host = {
    _playSeq: 0,
    _$: (selector) => {
      if (selector === "#viewer") return viewer;
      if (selector === "#myPopup") {
        return { querySelector: () => body };
      }
      return null;
    },
    _popupInfoController: { render: () => {} },
    _popupCarouselController: {
      clear: () => carouselCalls.push("clear"),
      render: () => carouselCalls.push("render"),
    },
    _popupMediaControlsController: {
      ensurePlaybackButtons: () => {},
      resetWithoutVideo: () => {},
      showTemporarily: () => {},
    },
    _popupLifecycleController: {
      setCompact: () => {},
      clearMediaCleanup: () => {},
      enter: () => {},
      setMediaState: () => {},
      setMediaCleanup: () => {},
    },
    _scheduleRotateOverlayUpdate: () => {},
  };
  const controller = new PopupMediaLoaderController(host);

  controller.renderPopupMedia({
    playingId: "event-1",
    html: '<div class="popup-media-unavailable"></div>',
    mediaType: "alert",
    infoOpts: { compact: true, mediaType: "alert" },
  });

  assert.deepEqual(carouselCalls, ["clear"]);
  assert.equal(body.scrollTop, 0);
});

test("enabled pre-roll and post-roll preserve Alert popup behavior", async () => {
  const calls = [];
  const viewer = { innerHTML: "", appended: null };
  const video = {
    paused: false,
    seeking: false,
    currentSrc: "",
    src: "",
    addEventListener: () => {},
    removeEventListener: () => {},
    pause: () => {},
    play: () => Promise.resolve(),
  };
  const host = {
    _playSeq: 0,
    _cc: () => ({ clientId: "frigate", cam: "front_door" }),
    _popupInfoController: {
      render: (_event, opts) => calls.push(["info", opts]),
    },
    _popupCarouselController: {
      render: (type, id) => calls.push(["carousel", type, id]),
    },
    _popupMediaControlsController: {
      initialize: (_video, type) => calls.push(["controls", type]),
      showTemporarily: () => {},
      ensurePlaybackButtons: (type) => calls.push(["airplay", type]),
    },
    _popupRecordingScrubController: {
      initialize: () => calls.push(["scrub"]),
    },
    _popupLifecycleController: {
      enter: () => {},
      clearMediaCleanup: () => {},
      setMediaState: (state) => calls.push(["state", state]),
      setMediaCleanup: () => {},
    },
    shadowRoot: { querySelector: () => viewer },
    _signed: async (path) => {
      calls.push(["signed", path]);
      return `signed:${path}`;
    },
    _attachPopupVideoZoom: () => {},
    _scheduleRotateOverlayUpdate: () => {},
    _preparePopupPlaybackTarget: () => {},
  };
  const controller = new PopupMediaLoaderController(host, {
    isEventPrePostRollEnabled: () => true,
    preferRecordingHls: () => false,
    buildVideoOptionsForView: (_view, options) => options,
    createVideoElement: () => video,
    mountNodeIntoSlot: (slot, node) => {
      slot.appended = node;
    },
  });
  controller.tryRecordingSource = async () => true;

  await controller.showClip(
    {
      id: "event-1",
      camera: "front_door",
      start_time: 100,
      end_time: 110,
      has_clip: true,
    },
    { mediaType: "alert" },
  );

  assert.equal(
    calls.some(
      ([kind, path]) =>
        kind === "signed" &&
        path.includes("/recording/front_door/start/95/end/115"),
    ),
    true,
  );
  assert.deepEqual(
    calls.find(([kind]) => kind === "state")?.[1],
    {
      mediaType: "alert",
      playing: {
        id: "event-1",
        eventRecordingStart: 95,
        eventRecordingEnd: 115,
      },
    },
  );
  assert.equal(
    calls.some(([kind, type]) => kind === "controls" && type === "alert"),
    true,
  );
  assert.equal(
    calls.some(
      ([kind, type, id]) =>
        kind === "carousel" && type === "alert" && id === "event-1",
    ),
    true,
  );
  assert.equal(calls.some(([kind]) => kind === "scrub"), false);
});

test("padded Alert playback falls back to the Frigate event clip", async () => {
  const viewer = { innerHTML: "", appended: null };
  const createVideoElement = (options) => ({
    options,
    paused: false,
    seeking: false,
    currentSrc: "",
    src: "",
    addEventListener: () => {},
    removeEventListener: () => {},
    pause: () => {},
    play: () => Promise.resolve(),
  });
  const host = {
    _playSeq: 0,
    _cc: () => ({ clientId: "frigate", cam: "front_door" }),
    _media: (id, file) => `/media/${id}/${file}`,
    _popupInfoController: { render: () => {} },
    _popupCarouselController: { render: () => {} },
    _popupMediaControlsController: {},
    _popupRecordingScrubController: { teardown: () => {} },
    _popupLifecycleController: {
      enter: () => {},
      clearMediaCleanup: () => {},
      setMediaState: () => {},
    },
    shadowRoot: { querySelector: () => viewer },
    _signed: async (path) => path,
    _attachPopupVideoZoom: () => {},
    _clearPopupVideoZoom: () => {},
  };
  const controller = new PopupMediaLoaderController(host, {
    isEventPrePostRollEnabled: () => true,
    preferRecordingHls: () => false,
    buildVideoOptionsForView: (_view, options) => options,
    createVideoElement,
    mountNodeIntoSlot: (slot, node) => {
      slot.appended = node;
    },
  });
  controller.tryRecordingSource = async () => false;
  let fallback = null;
  controller.renderPopupMedia = (payload) => {
    fallback = payload;
  };

  await controller.showClip(
    {
      id: "event-1",
      camera: "front_door",
      start_time: 100,
      end_time: 110,
      has_clip: true,
    },
    { mediaType: "alert" },
  );

  assert.equal(fallback.mediaType, "alert");
  assert.equal(fallback.playingId, "event-1");
  assert.equal(
    fallback.mediaElement.options.src.includes("/media/event-1/clip.mp4"),
    true,
  );
});

test("popup media loader owns recording HLS cleanup", () => {
  const host = {};
  const controller = new PopupMediaLoaderController(host);
  let destroyCount = 0;
  controller._recordingHls = {
    destroy() {
      destroyCount += 1;
    },
  };

  controller.clearRecordingTransport();
  controller.clearRecordingTransport();

  assert.equal(destroyCount, 1);
  assert.equal(controller._recordingHls, null);
});

test("Firefox recording playback prefers HLS for full-range seeking", () => {
  const controller = new PopupMediaLoaderController({
    _isFirefox: () => true,
    _isEdge: () => false,
  });

  assert.equal(controller._deps.preferRecordingHls(), true);
});

test("native HLS recording playback never loads the HLS.js companion", async () => {
  const listeners = new Map();
  let hlsJsLoads = 0;
  let mediaLoads = 0;
  const video = {
    src: "",
    canPlayType: (type) =>
      type === "application/vnd.apple.mpegurl" ? "probably" : "",
    addEventListener: (type, listener) => listeners.set(type, listener),
    removeEventListener: (type, listener) => {
      if (listeners.get(type) === listener) listeners.delete(type);
    },
    load: () => {
      mediaLoads += 1;
      listeners.get("loadedmetadata")?.();
    },
  };
  const controller = new PopupMediaLoaderController({});
  controller._getHlsJsCtor = async () => {
    hlsJsLoads += 1;
    return null;
  };

  const loaded = await controller.tryRecordingSource(
    video,
    "/api/recording/master.m3u8",
    { autoplay: false, timeoutMs: 50 },
  );

  assert.equal(loaded, true);
  assert.equal(video.src, "/api/recording/master.m3u8");
  assert.equal(mediaLoads, 1);
  assert.equal(hlsJsLoads, 0);
});

test("carousel selections preserve alert and snapshot popup media types", () => {
  const event = {
    id: "event-1",
    has_clip: true,
    has_snapshot: true,
  };
  const host = {
    _findEventById: () => event,
  };
  const controller = new PopupMediaLoaderController(host);
  const calls = [];
  controller.showClip = (selectedEvent, opts) => {
    calls.push(["clip", selectedEvent.id, opts.mediaType]);
  };
  controller.showSnapshot = (selectedEvent, opts) => {
    calls.push(["snapshot", selectedEvent.id, opts.mediaType]);
  };

  assert.equal(controller.showCarouselEventById("event-1", "alert"), true);
  assert.equal(
    controller.showCarouselEventById("event-1", "snapshot"),
    true,
  );
  assert.deepEqual(calls, [
    ["clip", "event-1", "alert"],
    ["snapshot", "event-1", "snapshot"],
  ]);
});

test("snapshot popup media attaches the shared zoom controller", () => {
  const snapshot = { id: "snapshot-image" };
  const body = { scrollTop: 12 };
  const viewer = {
    innerHTML: "",
    querySelector: (selector) => {
      if (selector === "video") return null;
      if (selector === "img.snap") return snapshot;
      return null;
    },
  };
  let zoomTarget = null;
  const host = {
    _$: (selector) => {
      if (selector === "#viewer") return viewer;
      if (selector === "#myPopup") {
        return { querySelector: () => body };
      }
      return null;
    },
    _media: (id, file) => `/media/${id}/${file}`,
    _attachPopupVideoZoom: (media) => {
      zoomTarget = media;
    },
    _scheduleRotateOverlayUpdate: () => {},
    _preparePopupPlaybackTarget: () => {},
  };
  const controller = new PopupMediaLoaderController(host);

  controller.showSnapshot({ id: "event-1" });

  assert.equal(zoomTarget, snapshot);
  assert.equal(body.scrollTop, 0);
});
