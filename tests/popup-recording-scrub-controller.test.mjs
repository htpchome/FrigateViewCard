import { test } from "node:test";
import assert from "node:assert/strict";

import {
  PopupRecordingScrubController,
  resolveRecordingSegmentPercent,
  resolveRecordingSegmentSelection,
} from "../src/features/popup/recording-scrub.ctrl.js";
import { buildFrigateRecordingReviewMarkers } from "../src/integrations/frigate/recording-review-markers.js";

const createElement = () => {
  const attributes = new Map();
  const classes = new Set();
  const listeners = new Map();
  const element = {
    hidden: true,
    disabled: false,
    innerHTML: "",
    textContent: "",
    style: {},
    dataset: {},
    children: [],
    focusCount: 0,
    classList: {
      add(name) {
        classes.add(name);
      },
      toggle(name, force) {
        if (force) classes.add(name);
        else classes.delete(name);
      },
      contains: (name) => classes.has(name),
    },
    setAttribute(name, value) {
      attributes.set(name, String(value));
    },
    getAttribute(name) {
      return attributes.get(name) ?? null;
    },
    removeAttribute(name) {
      attributes.delete(name);
      delete this[name];
    },
    addEventListener(type, listener, options = {}) {
      if (!listeners.has(type)) listeners.set(type, new Set());
      listeners.get(type).add(listener);
      options.signal?.addEventListener(
        "abort",
        () => listeners.get(type)?.delete(listener),
        { once: true },
      );
    },
    removeEventListener(type, listener) {
      listeners.get(type)?.delete(listener);
    },
    dispatch(type, event = {}) {
      for (const listener of [...(listeners.get(type) || [])]) {
        listener({ currentTarget: element, target: element, ...event });
      }
    },
    appendChild(child) {
      this.children.push(child);
      return child;
    },
    querySelectorAll() {
      return [];
    },
    focus() {
      this.focusCount += 1;
    },
    getBoundingClientRect() {
      return { left: 0, width: 100 };
    },
    setPointerCapture() {},
    releasePointerCapture() {},
  };
  return element;
};

const createScrubElements = () => {
  const selectors = [
    "#recording-scrub",
    "#recording-scrub-track",
    "#recording-scrub-ticks",
    "#recording-scrub-markers",
    "#recording-scrub-cursor",
    "#recording-scrub-preview",
    "#recording-scrub-preview-image",
    "#recording-scrub-preview-label",
    "#recording-scrub-start",
    "#recording-scrub-now",
    "#recording-scrub-end",
    "#recording-segment-selection",
    "#recording-segment-shade-start",
    "#recording-segment-keep",
    "#recording-segment-shade-end",
    "#recording-segment-handle-start",
    "#recording-segment-handle-end",
    "#recording-segment-handle-start-time",
    "#recording-segment-handle-end-time",
    "#recording-segment-manager",
    "#recording-segment-start-label",
    "#recording-segment-end-label",
    "#recording-segment-duration",
    "#recording-segment-reset",
    "#recording-segment-cancel",
    "#recording-segment-preview-button",
    "#recording-segment-download",
    "#recording-scrub-play",
    "#recording-segment-preview-modal",
    ".recording-segment-preview-close",
    "#recording-segment-preview-range",
    "#recording-segment-preview-video-host",
    "#recording-segment-preview-status",
    "#recording-segment-preview-download",
    "[data-rec-segment-toggle]",
  ];
  const elements = new Map(
    selectors.map((selector) => [selector, createElement()]),
  );
  elements.get("#recording-segment-handle-start").dataset = {
    recordingSegmentHandle: "start",
  };
  elements.get("#recording-segment-handle-end").dataset = {
    recordingSegmentHandle: "end",
  };
  return elements;
};

test("recording segment selection clamps both handles without crossing", () => {
  assert.deepEqual(
    resolveRecordingSegmentSelection({
      rangeStart: 100,
      rangeEnd: 200,
      selectionStart: 120,
      selectionEnd: 180,
      handle: "start",
      value: 190,
    }),
    { start: 179, end: 180 },
  );
  assert.deepEqual(
    resolveRecordingSegmentSelection({
      rangeStart: 100,
      rangeEnd: 200,
      selectionStart: 120,
      selectionEnd: 180,
      handle: "end",
      value: 110,
    }),
    { start: 120, end: 121 },
  );
  assert.equal(resolveRecordingSegmentPercent(125, 100, 200), 25);
});

test("Frigate recording reviews map to sorted scrub markers and snapshots", () => {
  const markers = buildFrigateRecordingReviewMarkers({
    clientId: "client one",
    start: 100,
    end: 200,
    reviews: [
      {
        id: "review-2",
        start_time: 140,
        end_time: 150,
        severity: "detection",
        detections: ["event/two"],
      },
      {
        id: "ignored",
        start_time: 110,
        end_time: 115,
        severity: "none",
      },
      {
        id: "review-1",
        start_time: 90,
        end_time: 130,
        severity: "alert",
        data: { detections: ["event/one"] },
      },
    ],
  });

  assert.deepEqual(markers, [
    {
      id: "review-1",
      start: 100,
      end: 130,
      severity: "alert",
      eventId: "event/one",
      snapshotUrl:
        "/api/frigate/client%20one/notifications/event%2Fone/snapshot.jpg",
    },
    {
      id: "review-2",
      start: 140,
      end: 150,
      severity: "detection",
      eventId: "event/two",
      snapshotUrl:
        "/api/frigate/client%20one/notifications/event%2Ftwo/snapshot.jpg",
    },
  ]);
});

test("popup recording scrub coordinator owns rendering, caching, and teardown", async () => {
  const elements = createScrubElements();
  const calls = [];
  let fetchCount = 0;
  const controller = new PopupRecordingScrubController({
    query: (selector) => elements.get(selector) || null,
    fetchReviews: async () => {
      fetchCount += 1;
      return [
        {
          id: "review-1",
          start_time: 120,
          end_time: 130,
          severity: "alert",
          data: { detections: ["event-1"] },
        },
      ];
    },
    isPlaybackTokenCurrent: (token) => token === 7,
    createScrubBinding: (options) => ({
      bind() {
        calls.push(["bind", options]);
      },
      dispose() {
        calls.push(["dispose"]);
      },
    }),
  });
  const payload = {
    clientId: "frigate",
    cam: "front",
    start: 100,
    end: 200,
    video: {},
    token: 7,
    sourceUrl: "/recording.mp4#t=0",
  };

  assert.deepEqual(await controller.initialize(payload), {
    start: 100,
    end: 200,
  });
  assert.equal(fetchCount, 1);
  assert.equal(elements.get("#recording-scrub").hidden, false);
  assert.equal(elements.get("#recording-scrub-start").textContent, "0:00");
  assert.equal(elements.get("#recording-scrub-end").textContent, "1:40");
  assert.match(
    elements.get("#recording-scrub-markers").innerHTML,
    /recording-scrub-alert/,
  );
  assert.equal(calls[0][0], "bind");
  assert.equal(
    calls[0][1].state.alerts[0].snapshotUrl.endsWith(
      "event-1/snapshot.jpg",
    ),
    true,
  );
  assert.deepEqual(controller.segmentRange(), { start: 100, end: 200 });
  assert.equal(
    elements.get("[data-rec-segment-toggle]").disabled,
    false,
  );
  assert.equal(
    elements.get("[data-rec-segment-toggle]").getAttribute(
      "aria-expanded",
    ),
    "false",
  );

  await controller.initialize(payload);
  assert.equal(fetchCount, 1);
  assert.equal(calls.some(([kind]) => kind === "dispose"), true);

  controller.teardown();
  assert.equal(elements.get("#recording-scrub").hidden, true);
  assert.equal(elements.get("#recording-scrub-markers").innerHTML, "");
  assert.equal(controller.range(), null);
  assert.equal(controller.segmentRange(), null);
  assert.equal(elements.get("#recording-segment-manager").hidden, true);
  assert.equal(elements.get("#recording-segment-selection").hidden, true);
});

test("popup recording segment manager shades, resets, and downloads its selected range", async () => {
  const elements = createScrubElements();
  const downloads = [];
  const controller = new PopupRecordingScrubController({
    query: (selector) => elements.get(selector) || null,
    isPlaybackTokenCurrent: () => true,
    formatClock: (timestamp) => `clock-${timestamp}`,
    onDownloadSegment: (...args) => downloads.push(args),
    createScrubBinding: () => ({ bind() {}, dispose() {} }),
  });

  await controller.initialize({
    clientId: "frigate-secondary",
    cam: "driveway",
    start: 100,
    end: 200,
    video: {},
    token: 1,
  });

  assert.equal(controller.toggleSegmentManager(), true);
  assert.equal(elements.get("#recording-segment-manager").hidden, false);
  assert.equal(elements.get("#recording-segment-selection").hidden, false);
  assert.equal(
    elements.get("[data-rec-segment-toggle]").classList.contains("active"),
    true,
  );
  assert.equal(elements.get("#recording-segment-keep").style.left, "0%");
  assert.equal(elements.get("#recording-segment-keep").style.width, "100%");
  assert.equal(
    elements
      .get("#recording-segment-handle-start")
      .classList.contains("at-track-start"),
    true,
  );
  assert.equal(
    elements
      .get("#recording-segment-handle-end")
      .classList.contains("at-track-end"),
    true,
  );
  assert.equal(
    elements.get("#recording-segment-duration").textContent,
    "Entire recording · 1:40",
  );

  await controller._downloadSelectedSegment();
  assert.deepEqual(downloads, [
    [100, 200, { clientId: "frigate-secondary", cam: "driveway" }],
  ]);
  downloads.length = 0;

  controller._updateSegmentHandle("start", 120);
  controller._updateSegmentHandle("end", 180);
  assert.deepEqual(controller.segmentRange(), { start: 120, end: 180 });
  assert.equal(
    elements.get("#recording-segment-shade-start").style.width,
    "20%",
  );
  assert.equal(elements.get("#recording-segment-keep").style.left, "20%");
  assert.equal(elements.get("#recording-segment-keep").style.width, "60%");
  assert.equal(
    elements.get("#recording-segment-shade-end").style.width,
    "20%",
  );
  assert.equal(
    elements.get("#recording-segment-start-label").textContent,
    "clock-120",
  );
  assert.equal(
    elements.get("#recording-segment-end-label").textContent,
    "clock-180",
  );
  assert.equal(
    elements.get("#recording-segment-duration").textContent,
    "Selected duration · 1:00",
  );
  assert.equal(
    elements.get("#recording-segment-handle-start-time").textContent,
    "clock-120",
  );
  assert.equal(
    elements.get("#recording-segment-handle-end-time").textContent,
    "clock-180",
  );
  assert.equal(
    elements.get("#recording-segment-preview-range").textContent,
    "clock-120 – clock-180",
  );

  const cancelEventCalls = [];
  assert.equal(
    controller.handleClick(
      {
        preventDefault: () => cancelEventCalls.push("preventDefault"),
        stopPropagation: () => cancelEventCalls.push("stopPropagation"),
      },
      {
        closest: (selector) =>
          selector === "#recording-segment-cancel" ? {} : null,
      },
    ),
    true,
  );
  assert.deepEqual(cancelEventCalls, ["preventDefault", "stopPropagation"]);
  assert.equal(elements.get("#recording-segment-manager").hidden, true);
  assert.equal(elements.get("#recording-segment-selection").hidden, true);
  assert.deepEqual(controller.segmentRange(), { start: 120, end: 180 });
  assert.equal(elements.get("[data-rec-segment-toggle]").focusCount, 1);
  controller.toggleSegmentManager(true);

  await controller._downloadSelectedSegment();
  assert.deepEqual(downloads, [
    [120, 180, { clientId: "frigate-secondary", cam: "driveway" }],
  ]);

  assert.deepEqual(controller.resetSegmentSelection(), {
    start: 100,
    end: 200,
  });
  assert.equal(elements.get("#recording-segment-reset").disabled, true);
});

test("popup recording segment manager extends only its selectable timeline", async () => {
  const elements = createScrubElements();
  const downloads = [];
  const controller = new PopupRecordingScrubController({
    query: (selector) => elements.get(selector) || null,
    isPlaybackTokenCurrent: () => true,
    resolveSegmentTimeline: async () => ({ start: 70, end: 230 }),
    onDownloadSegment: (...args) => downloads.push(args),
    createScrubBinding: () => ({ bind() {}, dispose() {} }),
  });

  await controller.initialize({
    clientId: "frigate",
    cam: "driveway",
    start: 100,
    end: 200,
    video: {},
    token: 1,
  });

  assert.deepEqual(controller.range(), { start: 100, end: 200 });
  assert.deepEqual(controller.segmentRange(), { start: 100, end: 200 });
  assert.equal(elements.get("#recording-scrub-start").textContent, "0:00");
  assert.equal(elements.get("#recording-scrub-end").textContent, "1:40");

  controller.toggleSegmentManager(true);
  assert.equal(elements.get("#recording-scrub-start").textContent, "-0:30");
  assert.equal(elements.get("#recording-scrub-end").textContent, "+0:30");
  assert.equal(elements.get("#recording-segment-keep").style.left, "18.75%");
  assert.equal(elements.get("#recording-segment-keep").style.width, "62.5%");
  assert.equal(
    elements.get("#recording-segment-handle-start").getAttribute("aria-valuemin"),
    "70",
  );
  assert.equal(
    elements.get("#recording-segment-handle-end").getAttribute("aria-valuemax"),
    "230",
  );

  controller._updateSegmentHandle("start", 70);
  controller._updateSegmentHandle("end", 230);
  assert.deepEqual(controller.segmentRange(), { start: 70, end: 230 });
  await controller._downloadSelectedSegment();
  assert.deepEqual(downloads, [
    [70, 230, { clientId: "frigate", cam: "driveway" }],
  ]);

  assert.deepEqual(controller.resetSegmentSelection(), {
    start: 100,
    end: 200,
  });
  assert.equal(elements.get("#recording-segment-reset").disabled, true);
});

test("recording segment preview loads the selected range and cleans up its modal", async () => {
  const elements = createScrubElements();
  const calls = [];
  const previewVideo = createElement();
  previewVideo.paused = true;
  previewVideo.canPlayType = (type) =>
    type === "application/vnd.apple.mpegurl" ? "maybe" : "";
  previewVideo.load = () => {
    calls.push(["load", previewVideo.src || ""]);
    queueMicrotask(() => previewVideo.dispatch("loadedmetadata"));
  };
  previewVideo.play = () => {
    previewVideo.paused = false;
    calls.push(["play"]);
    return Promise.resolve();
  };
  previewVideo.pause = () => {
    previewVideo.paused = true;
    calls.push(["pause"]);
  };
  const downloads = [];
  const controller = new PopupRecordingScrubController({
    query: (selector) => elements.get(selector) || null,
    isPlaybackTokenCurrent: () => true,
    formatClock: (timestamp) => `clock-${timestamp}`,
    resolvePreviewSources: async (...args) => {
      calls.push(["sources", ...args]);
      return ["/selected.m3u8", "/selected.mp4"];
    },
    createPreviewVideo: () => previewVideo,
    onDownloadSegment: (...args) => downloads.push(args),
    createScrubBinding: () => ({ bind() {}, dispose() {} }),
  });

  await controller.initialize({
    clientId: "frigate-secondary",
    cam: "driveway",
    start: 100,
    end: 200,
    video: createElement(),
    token: 1,
  });
  controller.toggleSegmentManager(true);
  controller._updateSegmentHandle("start", 120);
  controller._updateSegmentHandle("end", 180);

  assert.equal(await controller.openSegmentPreview(), true);
  assert.equal(elements.get("#recording-segment-preview-modal").hidden, false);
  assert.deepEqual(
    elements.get("#recording-segment-preview-video-host").children,
    [previewVideo],
  );
  assert.equal(previewVideo.src, "/selected.m3u8");
  assert.equal(elements.get("#recording-segment-preview-status").hidden, true);
  assert.equal(
    elements.get(".recording-segment-preview-close").focusCount,
    1,
  );
  assert.deepEqual(calls[0], [
    "sources",
    120,
    180,
    { clientId: "frigate-secondary", cam: "driveway" },
  ]);

  await controller._downloadSelectedSegment();
  assert.deepEqual(downloads, [
    [120, 180, { clientId: "frigate-secondary", cam: "driveway" }],
  ]);

  controller.closeSegmentPreview();
  assert.equal(elements.get("#recording-segment-preview-modal").hidden, true);
  assert.equal(
    elements.get("#recording-segment-preview-video-host").innerHTML,
    "",
  );
  assert.equal(previewVideo.src, undefined);
  assert.equal(calls.some(([kind]) => kind === "pause"), true);
  assert.equal(
    elements.get("#recording-segment-preview-button").focusCount,
    1,
  );
});

test("recording scrub play button mirrors main recording playback", async () => {
  const elements = createScrubElements();
  const video = createElement();
  video.paused = true;
  video.play = async () => {
    video.paused = false;
    video.dispatch("play");
  };
  video.pause = () => {
    video.paused = true;
    video.dispatch("pause");
  };
  const controller = new PopupRecordingScrubController({
    query: (selector) => elements.get(selector) || null,
    isPlaybackTokenCurrent: () => true,
    playIcon: "PLAY",
    pauseIcon: "PAUSE",
    createScrubBinding: () => ({ bind() {}, dispose() {} }),
  });
  await controller.initialize({
    clientId: "frigate",
    cam: "front",
    start: 100,
    end: 200,
    video,
    token: 1,
  });

  assert.equal(elements.get("#recording-scrub-play").innerHTML, "PLAY");
  controller._toggleRecordingPlayback();
  await Promise.resolve();
  assert.equal(elements.get("#recording-scrub-play").innerHTML, "PAUSE");
  controller._toggleRecordingPlayback();
  assert.equal(elements.get("#recording-scrub-play").innerHTML, "PLAY");
});

test("popup recording scrub paints before markers load and ignores them after teardown", async () => {
  const elements = createScrubElements();
  let resolveReviews;
  const pendingReviews = new Promise((resolve) => {
    resolveReviews = resolve;
  });
  let bindCount = 0;
  const controller = new PopupRecordingScrubController({
    query: (selector) => elements.get(selector) || null,
    fetchReviews: () => pendingReviews,
    isPlaybackTokenCurrent: () => true,
    createScrubBinding: () => ({
      bind() {
        bindCount += 1;
      },
      dispose() {},
    }),
  });

  const initializing = controller.initialize({
    clientId: "frigate",
    cam: "front",
    start: 100,
    end: 200,
    video: {},
    token: 1,
  });
  assert.equal(bindCount, 1);
  assert.equal(elements.get("#recording-scrub").hidden, false);
  assert.equal(elements.get("#recording-scrub-start").textContent, "0:00");
  assert.equal(elements.get("#recording-scrub-end").textContent, "1:40");
  assert.deepEqual(controller.range(), { start: 100, end: 200 });
  controller.teardown();
  resolveReviews([]);
  await initializing;

  assert.equal(bindCount, 1);
  assert.equal(elements.get("#recording-scrub").hidden, true);
  assert.equal(elements.get("#recording-scrub-markers").innerHTML, "");
  assert.equal(controller.range(), null);
});

test("recording seek fallback preserves the physical camera context", async () => {
  const fallbackCalls = [];
  const controller = new PopupRecordingScrubController({
    query: () => null,
    onFallbackRecording: async (...args) => fallbackCalls.push(args),
  });
  const state = {
    clientId: "frigate-secondary",
    cam: "package",
    start: 100,
    end: 200,
    video: { currentTime: 0 },
    seekNonce: 0,
    resumeAfterScrub: false,
    isFallbackLoading: false,
  };
  controller._state = state;
  controller._attemptSeek = async () => false;

  await controller._commitSeek(state, 20, 120);

  assert.deepEqual(fallbackCalls, [
    [
      120,
      220,
      { clientId: "frigate-secondary", camera: "package" },
    ],
  ]);
});
