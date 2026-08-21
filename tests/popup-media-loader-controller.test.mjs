import { test } from "node:test";
import assert from "node:assert/strict";

import {
  PopupMediaLoaderController,
  PopupSnapshotFullscreenController,
} from "../src/features/popup/media-loader.ctrl.js";

class FakeSnapshotTarget {
  constructor() {
    this._listeners = new Map();
  }

  addEventListener(type, listener, options = {}) {
    if (!this._listeners.has(type)) this._listeners.set(type, new Set());
    this._listeners.get(type).add(listener);
    options?.signal?.addEventListener?.(
      "abort",
      () => this._listeners.get(type)?.delete(listener),
      { once: true },
    );
  }

  dispatch(type, init = {}) {
    const event = {
      type,
      pointerId: 0,
      pointerType: "mouse",
      clientX: 100,
      clientY: 80,
      defaultPrevented: false,
      preventDefault() {
        this.defaultPrevented = true;
      },
      ...init,
    };
    for (const listener of this._listeners.get(type) || []) listener(event);
    return event;
  }
}

const touchPoint = (pointerId, clientX = 100, clientY = 80) => ({
  pointerId,
  pointerType: "touch",
  clientX,
  clientY,
});

const dispatchTouchTap = (target, pointerId, clientX = 100, clientY = 80) => {
  const point = touchPoint(pointerId, clientX, clientY);
  target.dispatch("pointerdown", point);
  return target.dispatch("pointerup", point);
};

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
    _enter: () => calls.push(["enter"]),
    _clearPopupMediaCleanup: () => calls.push(["clearCleanup"]),
    _cc: () => ({ clientId: "frigate", cam: "front_door" }),
    _recordingPreferHls: () => false,
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
    },
    _popupRecordingScrubController: {
      teardown: () => calls.push(["teardownScrub"]),
      initialize: (payload) =>
        calls.push(["initScrub", payload.sourceUrl]),
    },
    shadowRoot: {
      querySelector: () => viewer,
    },
    _signed: async (path) => `signed:${path}`,
    _ensurePopupPlaybackButtons: (kind) => calls.push(["ensurePlayback", kind]),
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

test("snapshot fullscreen supports double click and touch double tap", () => {
  const target = new FakeSnapshotTarget();
  let nowMs = 1000;
  let fullscreenRequests = 0;
  const controller = new PopupSnapshotFullscreenController({
    target,
    now: () => nowMs,
    onFullscreen: () => {
      fullscreenRequests += 1;
    },
  }).bind();

  const doubleClick = target.dispatch("dblclick");
  assert.equal(doubleClick.defaultPrevented, true);
  assert.equal(fullscreenRequests, 1);

  nowMs = 2000;
  dispatchTouchTap(target, 1);
  nowMs = 2200;
  const secondTap = dispatchTouchTap(target, 1);
  assert.equal(secondTap.defaultPrevented, true);
  assert.equal(fullscreenRequests, 2);

  target.dispatch("dblclick");
  assert.equal(fullscreenRequests, 2);

  controller.dispose();
  nowMs = 3000;
  target.dispatch("dblclick");
  assert.equal(fullscreenRequests, 2);
});

test("snapshot fullscreen ignores moved and distant touch pairs", () => {
  const target = new FakeSnapshotTarget();
  let nowMs = 1000;
  let fullscreenRequests = 0;
  new PopupSnapshotFullscreenController({
    target,
    now: () => nowMs,
    onFullscreen: () => {
      fullscreenRequests += 1;
    },
  }).bind();

  dispatchTouchTap(target, 1, 20, 20);
  nowMs = 1100;
  dispatchTouchTap(target, 1, 100, 100);
  assert.equal(fullscreenRequests, 0);

  nowMs = 2000;
  target.dispatch("pointerdown", touchPoint(2, 40, 40));
  target.dispatch("pointermove", touchPoint(2, 60, 40));
  target.dispatch("pointerup", touchPoint(2, 60, 40));
  nowMs = 2100;
  dispatchTouchTap(target, 2, 60, 40);
  assert.equal(fullscreenRequests, 0);
});
