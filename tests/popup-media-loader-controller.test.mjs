import { test } from "node:test";
import assert from "node:assert/strict";

import { PopupMediaLoaderController } from "../src/features/popup/media-loader.ctrl.js";

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
  assert.equal(rendered.fullscreenKind, "alert");
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
    _enter: () => calls.push(["enter"]),
    _clearPopupMediaCleanup: () => calls.push(["clearCleanup"]),
    _cc: () => ({ clientId: "frigate", cam: "front_door" }),
    _recordingPreferHls: () => false,
    _renderPopupInfo: (_event, opts) =>
      calls.push(["renderInfo", opts.mediaType]),
    shadowRoot: {
      querySelector: () => viewer,
    },
    _signed: async (path) => `signed:${path}`,
    _teardownRecordingScrub: () => calls.push(["teardownScrub"]),
    _$: (selector) => {
      if (selector === "#recording-scrub") return { hidden: false };
      return null;
    },
    _ensurePopupFullscreenButton: (kind) => calls.push(["ensureFs", kind]),
    _scheduleRotateOverlayUpdate: () => calls.push(["scheduleRotate"]),
    _initPopupMediaControls: (_video, type) =>
      calls.push(["initControls", type]),
    _initRecordingScrub: (payload) =>
      calls.push(["initScrub", payload.sourceUrl]),
    _renderPopupCarousel: (type, id) =>
      calls.push(["renderCarousel", type, id]),
    _showPopupControlsTemporarily: () => calls.push(["showControls"]),
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
