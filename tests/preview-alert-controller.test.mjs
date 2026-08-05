import { test } from "node:test";
import assert from "node:assert/strict";

import { PreviewAlertController } from "../src/features/preview/alert.ctrl.js";

function createHost({
  previewActive = true,
  severityByMessage = "alert",
  shouldHandle = true,
} = {}) {
  return {
    _isPreviewPageActive: () => previewActive,
    _extractRealtimeMessageCamera: () => "front_door",
    _cameraEntityForIncomingCamera: () => "camera.front_door",
    _extractRealtimeMessageSeverity: () => severityByMessage,
    _shouldHandleSlideshowReview: () => shouldHandle,
  };
}

test("handleRealtimeMessage marks camera live when alert severity is present", () => {
  const host = createHost({ severityByMessage: "alert", shouldHandle: true });
  const controller = new PreviewAlertController(host, {
    PREVIEW_ALERT_HOLD_MS: 6000,
    PREVIEW_ALERT_END_GRACE_MS: 3500,
  });
  const calls = [];

  controller.markAlertCamera = (entity, severity, holdMs) => {
    calls.push([entity, severity, holdMs]);
  };

  controller.handleRealtimeMessage({ type: "new", camera: "front_door" });

  assert.deepEqual(calls, [["camera.front_door", "alert", 6000]]);
});

test("handleRealtimeMessage schedules probe when realtime severity is missing", () => {
  const host = createHost({ severityByMessage: "", shouldHandle: true });
  const controller = new PreviewAlertController(host, {
    PREVIEW_ALERT_HOLD_MS: 6000,
    PREVIEW_ALERT_END_GRACE_MS: 3500,
  });
  const calls = [];

  controller.markAlertCamera = () => {
    calls.push(["mark"]);
  };
  controller.scheduleAlertWatch = (delayMs) => {
    calls.push(["watch", delayMs]);
  };

  controller.handleRealtimeMessage({ type: "update", camera: "front_door" });

  assert.deepEqual(calls, [["watch", 180]]);
});
