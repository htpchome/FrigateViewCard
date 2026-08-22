import { test } from "node:test";
import assert from "node:assert/strict";

import {
  PopupMediaLoaderController,
  bindPopupMediaSizing,
  resolvePopupMediaSizing,
} from "../src/features/popup/media-loader.ctrl.js";

test("popup media sizing follows arbitrary intrinsic aspect ratios", () => {
  assert.deepEqual(
    resolvePopupMediaSizing({ videoWidth: 1920, videoHeight: 1080 }),
    {
      aspectRatio: "1920 / 1080",
      maxWidth: "124.444dvh",
    },
  );
  assert.deepEqual(
    resolvePopupMediaSizing({ naturalWidth: 1080, naturalHeight: 1920 }),
    {
      aspectRatio: "1080 / 1920",
      maxWidth: "39.375dvh",
    },
  );
  assert.equal(resolvePopupMediaSizing({ videoWidth: 0, videoHeight: 0 }), null);
});

test("popup media sizing updates from metadata and cleans up viewer variables", () => {
  const values = new Map();
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
  const media = {
    videoWidth: 0,
    videoHeight: 0,
    addEventListener: (name, listener) => listeners.set(name, listener),
    removeEventListener: (name, listener) => {
      if (listeners.get(name) === listener) listeners.delete(name);
    },
  };

  const cleanup = bindPopupMediaSizing({ viewer, media });
  assert.equal(values.has("--popup-media-aspect-ratio"), false);
  assert.equal(classes.has("popup-media-ratio-ready"), false);

  media.videoWidth = 4;
  media.videoHeight = 3;
  listeners.get("loadedmetadata")();
  assert.equal(values.get("--popup-media-aspect-ratio"), "4 / 3");
  assert.equal(values.get("--popup-media-max-width"), "93.333dvh");
  assert.equal(classes.has("popup-media-ratio-ready"), true);

  cleanup();
  assert.equal(values.size, 0);
  assert.equal(listeners.size, 0);
  assert.equal(classes.size, 0);
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
});

test("showRecording signs candidates and initializes popup recording playback on success", async () => {
  const calls = [];
  const viewer = { innerHTML: "", appended: null };
  const video = {
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
    _signed: async (path) => `signed:${path}`,
    _scheduleRotateOverlayUpdate: () => calls.push(["scheduleRotate"]),
  };
  const controller = new PopupMediaLoaderController(host, {
    buildVideoOptionsForView: (_view, options) => options,
    createVideoElement: () => video,
    mountNodeIntoSlot: (slot, node) => {
      slot.appended = node;
    },
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
      ([kind, sourceUrl]) =>
        kind === "initScrub" && String(sourceUrl).startsWith("signed:"),
    ),
    true,
  );
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
