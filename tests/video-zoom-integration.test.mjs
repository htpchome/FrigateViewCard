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
const popupResizeSource = fs.readFileSync(
  new URL("../src/features/popup/view-resize.ctrl.js", import.meta.url),
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

test("media zoom is attached through committed main-live and popup lifecycles", () => {
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
    popupLoaderSource.includes("this._host._attachPopupVideoZoom?.(media)"),
    true,
  );
  assert.equal(cardSource.includes("host: viewer || video?.parentElement"), true);
  assert.equal(cardSource.includes("interactionTarget: viewer || video"), true);
  assert.equal(cardSource.includes("nativeCoverPan: true"), true);
  assert.match(
    cardSource,
    /_usePopupCustomControls\(mediaType\) \{\s*return this\._isPopupVideoMediaType\(mediaType\);/,
  );
  assert.equal(
    cardSource.includes("this._syncLiveRotateZoomPresentation();"),
    true,
  );
  assert.equal(
    cardSource.includes(
      "this._liveVideoZoomController?.setPresentationSuspended?.(suspend)",
    ),
    true,
  );
});

test("PTZ zoom actions are routed to the existing main-live zoom controller", () => {
  assert.equal(cardSource.includes("resolvePtzDisplayZoomPlan"), true);
  assert.equal(
    cardSource.includes(
      "this._liveVideoZoomController?.zoomBy?.(displayZoomPlan.delta)",
    ),
    true,
  );
});

test("displayed-frame snapshots consume the matching live and popup zoom state", () => {
  assert.equal(
    cardSource.includes(
      'from "../shared/media/frame-capture.js";',
    ),
    true,
  );
  assert.equal(
    cardSource.includes("activeZoomController?.viewport || null"),
    true,
  );
  assert.equal(
    cardSource.includes("activeZoomController?.state || null"),
    true,
  );
  assert.equal(cardSource.includes('this._takeDisplayedSnapshot("live")'), true);
  assert.equal(cardSource.includes('this._takeDisplayedSnapshot("popup")'), true);
});

test("grid and preview media do not attach video zoom", () => {
  assert.equal(gridMediaSource.includes("attachVideoZoom"), false);
  assert.equal(gridMediaSource.includes("_attachPopupVideoZoom"), false);
  assert.equal(previewPageSource.includes("attachVideoZoom"), false);
  assert.equal(previewPageSource.includes("_attachPopupVideoZoom"), false);
});

test("popup video and snapshot resizing reuse the active popup zoom controller", () => {
  assert.equal(
    popupLoaderSource.includes("new PopupViewResizeController(options)"),
    true,
  );
  assert.equal(
    popupLoaderSource.includes("const displayedMedia = video || snapshot;"),
    true,
  );
  assert.equal(
    popupLoaderSource.match(/this\._bindViewResize\(\{/g)?.length,
    2,
  );
  assert.equal(
    popupLoaderSource.includes("placePopupViewResizeGrip({"),
    true,
  );
  assert.equal(
    popupResizeSource.includes("zoomController.zoomToCenter("),
    true,
  );
  assert.equal(
    cardSource.includes("this._liveVideoZoomController?.zoomToCenter?.(scale)"),
    true,
  );
});
