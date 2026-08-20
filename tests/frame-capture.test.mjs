import { test } from "node:test";
import assert from "node:assert/strict";

import {
  buildDisplayedFrameFilename,
  captureDisplayedFrame,
  downloadDisplayedFrame,
  resolveDisplayedFrameSourceRect,
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
  downloadDisplayedFrame({ bytes: 1 }, "snapshot.jpg", {
    documentObj: {
      createElement: () => anchor,
      body: { appendChild: () => actions.push("append") },
    },
    urlApi: {
      createObjectURL: () => "blob:frame",
      revokeObjectURL: (url) => actions.push(`revoke:${url}`),
    },
    schedule: (callback) => {
      scheduled = callback;
    },
  });

  assert.equal(anchor.href, "blob:frame");
  assert.equal(anchor.download, "snapshot.jpg");
  assert.deepEqual(actions, ["append", "click", "remove"]);
  scheduled();
  assert.deepEqual(actions, ["append", "click", "remove", "revoke:blob:frame"]);
});

test("snapshot result feedback is centered over the active media surface", () => {
  assert.match(
    STYLES,
    /\.snapshot-result-bubble\{[^}]*left:50%;top:50%;transform:translate\(-50%,-50%\)/,
  );
  assert.match(STYLES, /\.snapshot-result-bubble\.success\{/);
  assert.match(STYLES, /\.snapshot-result-bubble\.failure\{/);
});
