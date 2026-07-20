import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const source = fs.readFileSync(
  new URL("../frigate-view-card.js", import.meta.url),
  "utf8",
);

test("slideshow config is wired through the card", () => {
  assert.equal(source.includes("slideshow_rotation_enabled"), true);
  assert.equal(source.includes("slideshow_rotation_seconds"), true);
  assert.equal(source.includes("Slideshow Rotation Frequency"), true);
  assert.equal(source.includes("slideshow_rotation_row"), true);
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
  assert.equal(source.includes("_handleSlideshowReviewsUpdated"), true);
  assert.equal(source.includes("_advanceSlideshowRotation"), true);
  assert.equal(source.includes("SLIDESHOW_ALERT_HOLD_MS"), true);
  assert.equal(source.includes("_shouldHandleSlideshowReview"), true);
  assert.equal(source.includes("_scheduleSlideshowReviewProbe"), true);
  assert.equal(source.includes("_scheduleSlideshowReviewWatch"), true);
  assert.equal(source.includes("_probeLatestSlideshowReview"), true);
  assert.equal(source.includes("alerts-window-initial"), true);
  assert.equal(source.includes("slideshow-detection"), true);
  assert.equal(source.includes("error-color"), true);
  assert.equal(source.includes("warning-color"), true);
  assert.equal(source.includes("data?.severity"), true);
});
