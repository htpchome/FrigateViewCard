import { test } from "node:test";
import assert from "node:assert/strict";

import { SlideshowAlertController } from "../src/features/slideshow/alert.ctrl.js";

test("handleReviewsUpdated uses SLIDESHOW_ALERT_HOLD_MS for pause window", () => {
  const now = Date.now();
  const host = {
    _slideshowActive: true,
    _isSlideshowRotationAvailable: () => true,
    _slideshowHandledReviewIds: new Set(),
    _slideshowPopupPaused: false,
    _activeCam: { entity: "camera.front_door" },
    _slideshowLastAlertAt: 0,
    _slideshowLastAlertCam: "",
    _slideshowPausedUntil: 0,
    _normalizeReviewSeverity: (review) => review?.severity || "alert",
    _shouldHandleSlideshowReview: () => true,
    _reviewStartTimeSec: (review) => Number(review?.start_time || 0),
    _slideshowStartedAtSec: 0,
    _cameraIndexByEntity: () => 0,
    _setSlideshowAlertState: () => {},
    _scheduleSlideshowRotation: () => {},
    _switchCamera: async () => {},
  };

  const controller = new SlideshowAlertController(host, {
    DAY: 86400,
    SLIDESHOW_ALERT_HOLD_MS: 10000,
    SLIDESHOW_REVIEW_FRESHNESS_GRACE_SEC: 10,
    SLIDESHOW_REVIEW_WATCH_MIN_MS: 1500,
    SLIDESHOW_REVIEW_WATCH_MAX_MS: 15000,
  });

  controller.handleReviewsUpdated(
    "camera.front_door",
    [{ id: "r1", start_time: Math.floor(now / 1000), severity: "alert" }],
    "test",
  );

  const holdMs = host._slideshowPausedUntil - now;
  assert.equal(holdMs >= 9000 && holdMs <= 11000, true);
});

test("handleHaStatusCandidate switches slideshow camera and applies hold window", () => {
  const now = Date.now();
  const calls = [];
  const host = {
    _slideshowActive: true,
    _isSlideshowRotationAvailable: () => true,
    _slideshowHandledReviewIds: new Set(),
    _slideshowPopupPaused: false,
    _activeCam: { entity: "camera.front_door" },
    _slideshowLastAlertAt: 0,
    _slideshowLastAlertCam: "",
    _slideshowPausedUntil: 0,
    _shouldHandleSlideshowReview: () => true,
    _cameraIndexByEntity: (entity) =>
      entity === "camera.driveway"
        ? 1
        : entity === "camera.front_door"
          ? 0
          : -1,
    _setSlideshowAlertState: (severity) => {
      calls.push(["state", severity]);
    },
    _scheduleSlideshowRotation: (reason) => {
      calls.push(["schedule", reason]);
    },
    _switchCamera: async (idx, options) => {
      calls.push(["switch", idx, options?.source || ""]);
    },
  };

  const controller = new SlideshowAlertController(host, {
    DAY: 86400,
    SLIDESHOW_ALERT_HOLD_MS: 10000,
    SLIDESHOW_REVIEW_FRESHNESS_GRACE_SEC: 10,
    SLIDESHOW_REVIEW_WATCH_MIN_MS: 1500,
    SLIDESHOW_REVIEW_WATCH_MAX_MS: 15000,
  });

  controller.handleHaStatusCandidate("camera.driveway", "alert");

  assert.equal(host._slideshowLastAlertCam, "camera.driveway");
  assert.equal(host._slideshowLastAlertAt >= now, true);
  const holdMs = host._slideshowPausedUntil - now;
  assert.equal(holdMs >= 9000 && holdMs <= 11000, true);
  assert.deepEqual(calls, [
    ["state", "alert"],
    ["switch", 1, "alert"],
    ["schedule", "ha-alert-switch"],
  ]);
});
