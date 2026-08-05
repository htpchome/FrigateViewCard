import { test } from "node:test";
import assert from "node:assert/strict";

import { GridAlertController } from "../src/features/grid/alert.ctrl.js";

function createHost({
  gridAvailable = true,
  viewMode = "grid",
  severityByMessage = "alert",
  shouldHandle = true,
} = {}) {
  return {
    _viewMode: viewMode,
    _config: { alerts_reviews_days: 3 },
    _isGridModeAvailable: () => gridAvailable,
    _extractRealtimeMessageCamera: () => "front_door",
    _cameraEntityForIncomingCamera: () => "camera.front_door",
    _extractRealtimeMessageSeverity: () => severityByMessage,
    _shouldHandleSlideshowReview: () => shouldHandle,
    _isRealtimeEventMessage: () => true,
    _cameraIndexByEntity: () => 0,
    _scheduleGridRefresh: () => {},
    _effectiveRealtimePollSeconds: () => 5,
    _gridRotationMs: () => 30000,
  };
}

test("handleRealtimeMessage forwards parsed severity to alert candidate", () => {
  const host = createHost({ severityByMessage: "alert", shouldHandle: true });
  const controller = new GridAlertController(host, {
    DAY: 86400,
    SLIDESHOW_REVIEW_FRESHNESS_GRACE_SEC: 10,
  });
  const calls = [];

  controller.handleAlertCandidate = (entity, severity) => {
    calls.push([entity, severity]);
  };

  controller.handleRealtimeMessage({ type: "new", camera: "front_door" });

  assert.deepEqual(calls, [["camera.front_door", "alert"]]);
});

test("handleRealtimeMessage schedules probe when severity is missing", () => {
  const host = createHost({ severityByMessage: "", shouldHandle: true });
  const controller = new GridAlertController(host, {
    DAY: 86400,
    SLIDESHOW_REVIEW_FRESHNESS_GRACE_SEC: 10,
  });
  const calls = [];

  controller.handleAlertCandidate = () => {
    calls.push(["candidate"]);
  };
  controller.scheduleAlertWatch = (delayMs) => {
    calls.push(["watch", delayMs]);
  };

  controller.handleRealtimeMessage({ type: "update", camera: "front_door" });

  assert.deepEqual(calls, [["watch", 180]]);
});

test("handleRealtimeMessage schedules probe when camera parsing fails", () => {
  const host = createHost({ severityByMessage: "alert", shouldHandle: true });
  host._extractRealtimeMessageCamera = () => "";
  const controller = new GridAlertController(host, {
    DAY: 86400,
    SLIDESHOW_REVIEW_FRESHNESS_GRACE_SEC: 10,
  });
  const calls = [];

  controller.scheduleAlertWatch = (delayMs) => {
    calls.push(["watch", delayMs]);
  };

  controller.handleRealtimeMessage({ type: "update" });

  assert.deepEqual(calls, [["watch", 180]]);
});
