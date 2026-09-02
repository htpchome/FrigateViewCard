import { test } from "node:test";
import assert from "node:assert/strict";

import { WideViewCompanionAlertController } from "../src/features/wide-view/companion-alert.ctrl.js";

const createHost = ({ severity = "alert", shouldHandle = true } = {}) => ({
  _config: { cameras: [], alerts_reviews_days: 3 },
  _camCache: {},
  _extractRealtimeMessageCamera: () => "front_door",
  _cameraEntityForIncomingCamera: () => "camera.front_door",
  _extractRealtimeMessageSeverity: () => severity,
  _shouldHandleSlideshowReview: () => shouldHandle,
  _previewAlertHoldMs: () => 6000,
  _effectiveRealtimePollSeconds: () => 5,
  _reviewStartTimeSec: () => Math.floor(Date.now() / 1000),
});

const constants = {
  DAY: 86400,
  PREVIEW_ALERT_HOLD_MS: 10000,
  PREVIEW_ALERT_END_GRACE_MS: 3500,
  SLIDESHOW_REVIEW_FRESHNESS_GRACE_SEC: 10,
};

test("companion alert state reports only the first activation as changed", () => {
  const changes = [];
  const controller = new WideViewCompanionAlertController(
    createHost(),
    constants,
    {
      isActive: () => true,
      onStateChange: (detail) => changes.push(detail),
    },
  );

  assert.equal(controller.markAlertCamera("camera.front_door", "alert"), true);
  assert.equal(controller.isCameraAlertLive("camera.front_door"), true);
  assert.equal(controller.cellSeverity("camera.front_door"), "alert");
  assert.equal(controller.markAlertCamera("camera.front_door", "alert"), false);
  assert.equal(changes[0].changed, true);
  assert.equal(changes[1].changed, false);
  controller.stop();
});

test("companion realtime alerts preserve detection severity", () => {
  const host = createHost({ severity: "detection" });
  const controller = new WideViewCompanionAlertController(host, constants, {
    isActive: () => true,
  });
  const calls = [];
  controller.markAlertCamera = (entity, severity, holdMs) => {
    calls.push([entity, severity, holdMs]);
  };

  controller.handleRealtimeMessage({ type: "new" });

  assert.deepEqual(calls, [["camera.front_door", "detection", 6000]]);
});

test("companion realtime ignores detections excluded by camera config", () => {
  const host = createHost({ severity: "detection", shouldHandle: false });
  const controller = new WideViewCompanionAlertController(host, constants, {
    isActive: () => true,
  });
  const calls = [];
  controller.markAlertCamera = (...args) => calls.push(args);

  controller.handleRealtimeMessage({ type: "new" });

  assert.deepEqual(calls, []);
});

test("companion realtime only probes Reviews when severity is missing", () => {
  const host = createHost({ severity: "" });
  const controller = new WideViewCompanionAlertController(host, constants, {
    isActive: () => true,
  });
  const calls = [];
  controller.markAlertCamera = (...args) => calls.push(["mark", ...args]);
  controller.scheduleAlertWatch = (delayMs) =>
    calls.push(["watch", delayMs]);

  controller.handleRealtimeMessage({ type: "update" });

  assert.deepEqual(calls, [["watch", 180]]);
});

test("companion alerts do not track state while Wide View is inactive", () => {
  const controller = new WideViewCompanionAlertController(
    createHost(),
    constants,
    { isActive: () => false },
  );

  assert.equal(controller.markAlertCamera("camera.front_door", "alert"), false);
  assert.equal(controller.isCameraAlertLive("camera.front_door"), false);
});
