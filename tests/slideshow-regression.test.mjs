import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

import { buildLiveEngineWrapMarkup } from "../src/features/live/view.tmpl.js";
import { STYLES } from "../src/styles.js";

const source = fs.readFileSync(
  new URL("../dist/frigate-view-card.js", import.meta.url),
  "utf8",
);
const editorBundleSource = fs.readFileSync(
  new URL("../dist/frigate-view-card-editor.js", import.meta.url),
  "utf8",
);
const cardSource = fs.readFileSync(
  new URL("../src/card/FrigateViewCard.js", import.meta.url),
  "utf8",
);
const videoFitSource = fs.readFileSync(
  new URL("../src/shared/media/video-fit.js", import.meta.url),
  "utf8",
);
const liveMediaPresentationSource = fs.readFileSync(
  new URL(
    "../src/features/live/media-presentation.ctrl.js",
    import.meta.url,
  ),
  "utf8",
);

test("slideshow config is wired through the card", () => {
  assert.equal(source.includes("slideshow_rotation_enabled"), true);
  assert.equal(source.includes("slideshow_rotation_seconds"), true);
  assert.equal(
    editorBundleSource.includes("Camera Rotation Interval"),
    true,
  );
  assert.equal(editorBundleSource.includes("slideshow_rotation_row"), true);
});

test("slideshow toolbar button is rendered", () => {
  assert.equal(source.includes("slideshow-btn"), true);
  assert.equal(source.includes("slideshowButton"), true);
  assert.equal(source.includes("presentationPlayActive"), true);
  assert.equal(source.includes("Start slideshow rotation"), true);
  assert.equal(source.includes("Stop slideshow rotation"), true);
});

test("slideshow runtime hooks are present", () => {
  assert.equal(source.includes("_handleSlideshowRealtimeMessage"), true);
  assert.equal(
    source.includes("_slideshowAlertController.handleReviewsUpdated"),
    true,
  );
  assert.equal(source.includes("advanceRotation()"), true);
  assert.equal(source.includes("scheduleRotation("), true);
  assert.equal(source.includes("scheduleReviewWatch(300)"), true);
  assert.equal(source.includes("SLIDESHOW_ALERT_HOLD_MS"), true);
  assert.equal(source.includes("_shouldHandleSlideshowReview"), true);
  assert.equal(source.includes("slideshow-detection"), true);
  assert.equal(source.includes("error-color"), true);
  assert.equal(source.includes("warning-color"), true);
  assert.equal(source.includes("data?.severity"), true);
});

test("slideshow countdown does not change live video compositing", () => {
  const markup = buildLiveEngineWrapMarkup({ icons: { live: "live" } });
  assert.equal(
    markup.includes('class="slideshow-next-chip"'),
    true,
  );
  assert.equal(markup.includes('class="glass-btn slideshow-next-chip"'), false);

  const ruleStart = STYLES.indexOf(".slideshow-next-chip{");
  const ruleEnd = STYLES.indexOf("}", ruleStart);
  const rule = STYLES.slice(ruleStart, ruleEnd);
  assert.notEqual(ruleStart, -1);
  assert.equal(rule.includes("backdrop-filter"), false);
});

test("live resize and media-only clicks do not restart slideshow rotation", () => {
  const resizeStart = cardSource.indexOf(
    "this._liveViewResizeController = new LiveViewResizeController",
  );
  const resizeEnd = cardSource.indexOf(
    "this._liveFullscreenLifecycleController",
    resizeStart,
  );
  const resizeSetup = cardSource.slice(resizeStart, resizeEnd);
  assert.match(
    resizeSetup,
    /onInteractionStart: \(\) => this\._dismissLinkedLightDimmers\(\)/,
  );
  assert.doesNotMatch(resizeSetup, /_pauseSlideshowForInteraction/);

  const listStart = cardSource.indexOf("  _handleListClick(e, target) {");
  const listEnd = cardSource.indexOf(
    "  _handleRecordingsListClick(e, target) {",
    listStart,
  );
  const listHandler = cardSource.slice(listStart, listEnd);
  assert.match(
    listHandler,
    /if \(!target\?\.closest\?\.\('\[data-fvc-region="browse"\]'\)\) return false;/,
  );
  assert.ok(
    listHandler.indexOf('closest?.(\'[data-fvc-region="browse"]\')') <
      listHandler.indexOf("_pauseSlideshowForInteraction"),
  );
});

test("main live video fit remains stable after metadata loads", () => {
  assert.equal(
    liveMediaPresentationSource.includes("applyContainedVideoFit(video);"),
    true,
  );
  assert.equal(cardSource.includes("_applyVideoFit("), false);
  assert.equal(videoFitSource.includes('objectFit = "contain";'), true);
  assert.equal(videoFitSource.includes("loadedmetadata"), false);
  assert.equal(videoFitSource.includes('"cover"'), false);
});
