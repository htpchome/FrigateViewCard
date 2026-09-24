import { test } from "node:test";
import assert from "node:assert/strict";

import {
  buildDisplayedFrameFilename,
  captureDisplayedFrame,
  DisplayedFrameCaptureController,
  downloadDisplayedFrame,
  resolveDisplayedFrameGeometry,
  resolveDisplayedFrameSourceRect,
  SAFARI_FRAME_DOWNLOAD_REVOKE_DELAY_MS,
} from "../src/shared/media/frame-capture.js";
import { STYLES } from "../src/styles.js";

test("displayed frame source rect preserves an unzoomed contained frame", () => {
  assert.deepEqual(
    resolveDisplayedFrameSourceRect({
      sourceWidth: 1920,
      sourceHeight: 1080,
      viewportWidth: 960,
      viewportHeight: 540,
    }),
    { x: 0, y: 0, width: 1920, height: 1080 },
  );
});

test("displayed frame source rect follows centered zoom and pan", () => {
  assert.deepEqual(
    resolveDisplayedFrameSourceRect({
      sourceWidth: 1920,
      sourceHeight: 1080,
      viewportWidth: 960,
      viewportHeight: 540,
      zoomState: { scale: 2, x: -480, y: -270 },
    }),
    { x: 480, y: 270, width: 960, height: 540 },
  );

  assert.deepEqual(
    resolveDisplayedFrameSourceRect({
      sourceWidth: 1920,
      sourceHeight: 1080,
      viewportWidth: 960,
      viewportHeight: 540,
      zoomState: { scale: 2, x: 0, y: 0 },
    }),
    { x: 0, y: 0, width: 960, height: 540 },
  );
});

test("displayed frame source rect removes object-fit cover overflow", () => {
  assert.deepEqual(
    resolveDisplayedFrameSourceRect({
      sourceWidth: 1000,
      sourceHeight: 1000,
      viewportWidth: 1600,
      viewportHeight: 900,
      objectFit: "cover",
    }),
    { x: 0, y: 218.75, width: 1000, height: 562.5 },
  );
});

test("displayed frame source rect follows native cover positioning", () => {
  assert.deepEqual(
    resolveDisplayedFrameSourceRect({
      sourceWidth: 1000,
      sourceHeight: 1000,
      viewportWidth: 1600,
      viewportHeight: 900,
      objectFit: "cover",
      zoomState: {
        scale: 1,
        x: 0,
        y: 0,
        objectPositionX: 0.5,
        objectPositionY: 1,
      },
    }),
    { x: 0, y: 437.5, width: 1000, height: 562.5 },
  );
});

test("displayed frame geometry retains contain letterboxing for composites", () => {
  assert.deepEqual(
    resolveDisplayedFrameGeometry({
      sourceWidth: 800,
      sourceHeight: 600,
      viewportWidth: 1600,
      viewportHeight: 900,
      objectFit: "contain",
    }),
    {
      sourceRect: { x: 0, y: 0, width: 800, height: 600 },
      destinationRect: { x: 200, y: 0, width: 1200, height: 900 },
    },
  );
});

test("displayed frame capture draws the visible native-pixel crop", async () => {
  const drawCalls = [];
  const encodedBlob = { type: "image/jpeg" };
  const canvas = {
    width: 0,
    height: 0,
    getContext: () => ({
      drawImage: (...args) => drawCalls.push(args),
    }),
    toBlob: (callback, mimeType, quality) => {
      assert.equal(mimeType, "image/jpeg");
      assert.equal(quality, 0.92);
      callback(encodedBlob);
    },
  };
  const media = {
    videoWidth: 1920,
    videoHeight: 1080,
    parentElement: { clientWidth: 960, clientHeight: 540 },
  };

  const blob = await captureDisplayedFrame(media, {
    documentObj: { createElement: () => canvas },
    zoomState: { scale: 2, x: -480, y: -270 },
  });

  assert.equal(blob, encodedBlob);
  assert.equal(canvas.width, 960);
  assert.equal(canvas.height, 540);
  assert.deepEqual(drawCalls, [
    [media, 480, 270, 960, 540, 0, 0, 960, 540],
  ]);
});

test("displayed frame downloads use camera and UTC timestamp filenames", () => {
  assert.equal(
    buildDisplayedFrameFilename({
      camera: "Front Door",
      capturedAt: new Date("2026-08-20T12:34:56.789Z"),
    }),
    "Front-Door_2026-08-20T12-34-56Z.jpg",
  );

  const actions = [];
  const anchor = {
    click: () => actions.push("click"),
    remove: () => actions.push("remove"),
  };
  let scheduled = null;
  let scheduledDelayMs = null;
  downloadDisplayedFrame({ bytes: 1 }, "snapshot.jpg", {
    documentObj: {
      createElement: () => anchor,
      body: { appendChild: () => actions.push("append") },
    },
    urlApi: {
      createObjectURL: () => "blob:frame",
      revokeObjectURL: (url) => actions.push(`revoke:${url}`),
    },
    schedule: (callback, delayMs) => {
      scheduled = callback;
      scheduledDelayMs = delayMs;
    },
  });

  assert.equal(anchor.href, "blob:frame");
  assert.equal(anchor.download, "snapshot.jpg");
  assert.deepEqual(actions, ["append", "click", "remove"]);
  assert.equal(scheduledDelayMs, 0);
  scheduled();
  assert.deepEqual(actions, ["append", "click", "remove", "revoke:blob:frame"]);
});

test("displayed frame downloads support delayed Safari blob cleanup", () => {
  let scheduledDelayMs = null;
  let scheduled = null;
  downloadDisplayedFrame({ bytes: 1 }, "snapshot.jpg", {
    documentObj: {
      createElement: () => ({ click: () => {}, remove: () => {} }),
      body: { appendChild: () => {} },
    },
    urlApi: {
      createObjectURL: () => "blob:safari-frame",
      revokeObjectURL: () => {},
    },
    schedule: (callback, delayMs) => {
      scheduled = callback;
      scheduledDelayMs = delayMs;
    },
    revokeDelayMs: SAFARI_FRAME_DOWNLOAD_REVOKE_DELAY_MS,
  });

  assert.equal(typeof scheduled, "function");
  assert.equal(scheduledDelayMs, SAFARI_FRAME_DOWNLOAD_REVOKE_DELAY_MS);
});

test("snapshot result feedback is centered over the active media surface", () => {
  assert.match(
    STYLES,
    /\.snapshot-result-bubble\{[^}]*left:50%;top:50%;transform:translate\(-50%,-50%\)/,
  );
  assert.match(STYLES, /\.snapshot-result-bubble\.success\{/);
  assert.match(STYLES, /\.snapshot-result-bubble\.failure\{/);
});

const createResultSurface = () => {
  let bubble = null;
  return {
    appendChild: (element) => {
      bubble = element;
    },
    querySelector: () => bubble,
    get bubble() {
      return bubble;
    },
  };
};

const createResultBubble = () => {
  const attributes = new Map();
  return {
    className: "",
    textContent: "",
    removed: false,
    setAttribute: (name, value) => attributes.set(name, value),
    getAttribute: (name) => attributes.get(name) ?? null,
    remove() {
      this.removed = true;
    },
  };
};

test("displayed frame controller downloads grouped live frames and owns result cleanup", async () => {
  const button = { disabled: false };
  const surface = createResultSurface();
  const groupedBlob = { type: "image/jpeg", grouped: true };
  const downloads = [];
  const controls = [];
  const scheduled = [];
  const cancelled = [];
  const controller = new DisplayedFrameCaptureController({
    resolveButton: () => button,
    resolveSurface: () => surface,
    resolveMedia: () => {
      throw new Error("grouped frames must bypass native media capture");
    },
    captureGroupedFrame: async (scope) => {
      assert.equal(scope, "live");
      return groupedBlob;
    },
    resolveCamera: () => "Front Door",
    isSafari: () => true,
    resolveResultLabel: (success) => ({
      localizationKey: success
        ? "runtime.live.snapshotTaken"
        : "runtime.live.snapshotFailed",
      text: success ? "Snapshot saved" : "Failed",
    }),
    onShowControls: (scope) => controls.push(scope),
    downloadFrame: (...args) => downloads.push(args),
    createElement: () => createResultBubble(),
    schedule: (callback, delayMs) => {
      const timer = { callback, delayMs };
      scheduled.push(timer);
      return timer;
    },
    cancelSchedule: (timer) => cancelled.push(timer),
  });

  assert.equal(await controller.capture("live"), true);
  assert.equal(button.disabled, false);
  assert.deepEqual(controls, ["live"]);
  assert.equal(downloads.length, 1);
  assert.equal(downloads[0][0], groupedBlob);
  assert.match(downloads[0][1], /^Front-Door_.*\.jpg$/);
  assert.equal(
    downloads[0][2].revokeDelayMs,
    SAFARI_FRAME_DOWNLOAD_REVOKE_DELAY_MS,
  );
  assert.equal(surface.bubble.className, "snapshot-result-bubble success");
  assert.equal(surface.bubble.textContent, "Snapshot saved");
  assert.equal(
    surface.bubble.getAttribute("data-fvc-i18n"),
    "runtime.live.snapshotTaken",
  );
  assert.equal(scheduled[0].delayMs, 1800);

  controller.dispose();
  assert.deepEqual(cancelled, [scheduled[0]]);
});

test("displayed frame controller captures popup media with its matching zoom state", async () => {
  const media = { style: { objectFit: "cover" } };
  const zoomController = {
    video: media,
    viewport: { width: 640, height: 360 },
    state: { scale: 2, x: -20, y: -10 },
  };
  const encodedBlob = { type: "image/jpeg" };
  const captureCalls = [];
  const downloadCalls = [];
  const controller = new DisplayedFrameCaptureController({
    resolveMedia: (scope) => {
      assert.equal(scope, "popup");
      return media;
    },
    resolveZoomController: () => zoomController,
    resolveCamera: () => "Driveway",
    captureFrame: async (...args) => {
      captureCalls.push(args);
      return encodedBlob;
    },
    downloadFrame: (...args) => downloadCalls.push(args),
  });

  assert.equal(await controller.capture("popup"), true);
  assert.deepEqual(captureCalls, [
    [
      media,
      {
        viewport: zoomController.viewport,
        zoomState: zoomController.state,
        objectFit: "cover",
      },
    ],
  ]);
  assert.equal(downloadCalls[0][0], encodedBlob);
  assert.match(downloadCalls[0][1], /^Driveway_.*\.jpg$/);
});

test("displayed frame controller reports capture failures and restores controls", async () => {
  const button = { disabled: false };
  const surface = createResultSurface();
  const controls = [];
  const warnings = [];
  const controller = new DisplayedFrameCaptureController({
    resolveButton: () => button,
    resolveSurface: () => surface,
    resolveMedia: () => null,
    resolveResultLabel: (success) => ({
      localizationKey: success
        ? "runtime.live.snapshotTaken"
        : "runtime.live.snapshotFailed",
      text: success ? "Saved" : "Snapshot failed",
    }),
    onShowControls: (scope) => controls.push(scope),
    createElement: () => createResultBubble(),
    schedule: () => 1,
    warn: (...args) => warnings.push(args),
  });

  assert.equal(await controller.capture("popup"), false);
  assert.equal(button.disabled, false);
  assert.deepEqual(controls, ["popup"]);
  assert.equal(warnings.length, 1);
  assert.equal(surface.bubble.className, "snapshot-result-bubble failure");
  assert.equal(surface.bubble.textContent, "Snapshot failed");
});
