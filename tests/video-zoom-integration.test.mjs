import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const cardSource = fs.readFileSync(
  new URL("../src/card/FrigateViewCard.js", import.meta.url),
  "utf8",
);
const popupLoaderSource = fs.readFileSync(
  new URL("../src/features/popup/media-loader.ctrl.js", import.meta.url),
  "utf8",
);
const gridMediaSource = fs.readFileSync(
  new URL("../src/features/grid/media.ctrl.js", import.meta.url),
  "utf8",
);
const previewPageSource = fs.readFileSync(
  new URL("../src/features/preview/page.ctrl.js", import.meta.url),
  "utf8",
);

test("video zoom is attached through committed main-live and popup lifecycles", () => {
  assert.equal(
    cardSource.includes(
      'import { attachVideoZoom } from "../shared/media/video-zoom.ctrl.js";',
    ),
    true,
  );
  assert.equal(
    cardSource.includes(
      "assignCommittedEngine: (engine) => this._assignLiveEngine(engine)",
    ),
    true,
  );
  assert.equal(
    popupLoaderSource.includes("this._host._attachPopupVideoZoom?.(video);"),
    true,
  );
});

test("grid and preview media do not attach video zoom", () => {
  assert.equal(gridMediaSource.includes("attachVideoZoom"), false);
  assert.equal(gridMediaSource.includes("_attachPopupVideoZoom"), false);
  assert.equal(previewPageSource.includes("attachVideoZoom"), false);
  assert.equal(previewPageSource.includes("_attachPopupVideoZoom"), false);
});
