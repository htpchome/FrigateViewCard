import { test } from "node:test";
import assert from "node:assert/strict";

import {
  haReviewStatusForCamera,
  haReviewStatusSeverity,
  haReviewStatusSignature,
  reviewStatusEntityCandidates,
} from "../src/integrations/frigate/review-status.js";

test("reviewStatusEntityCandidates normalizes entity and discovered camera", () => {
  assert.deepEqual(
    reviewStatusEntityCandidates("camera.front_door", "Front-Door"),
    ["sensor.front_door_review_status"],
  );
  assert.deepEqual(
    reviewStatusEntityCandidates("camera.side yard", "side_yard"),
    ["sensor.side_yard_review_status"],
  );
});

test("haReviewStatusForCamera resolves first matching candidate", () => {
  const hass = {
    states: {
      "sensor.front_door_review_status": { state: "alert" },
    },
  };
  assert.equal(
    haReviewStatusForCamera({
      entity: "camera.front_door",
      discoveredCameraName: "front-door",
      hass,
    }),
    "alert",
  );
});

test("haReviewStatusForCamera falls back to review_status attribute", () => {
  const hass = {
    states: {
      "sensor.front_door_review_status": {
        state: "on",
        attributes: { review_status: "detection" },
      },
    },
  };
  assert.equal(
    haReviewStatusForCamera({
      entity: "camera.front_door",
      discoveredCameraName: "front_door",
      hass,
    }),
    "detection",
  );
});

test("haReviewStatusForCamera falls back to severity attribute", () => {
  const hass = {
    states: {
      "sensor.front_door_review_status": {
        state: "unknown",
        attributes: { severity: "alert" },
      },
    },
  };
  assert.equal(
    haReviewStatusForCamera({
      entity: "camera.front_door",
      discoveredCameraName: "front_door",
      hass,
    }),
    "alert",
  );
});

test("haReviewStatusSeverity accepts only alert and detection", () => {
  assert.equal(haReviewStatusSeverity("alert"), "alert");
  assert.equal(haReviewStatusSeverity(" detection "), "detection");
  assert.equal(haReviewStatusSeverity("idle"), "");
});

test("haReviewStatusSignature includes all configured entities", () => {
  const hass = {
    states: {
      "sensor.front_door_review_status": { state: "alert" },
      "sensor.driveway_review_status": { state: "detection" },
    },
  };
  const signature = haReviewStatusSignature({
    hass,
    cameras: [{ entity: "camera.front_door" }, { entity: "camera.driveway" }],
    resolveDiscoveredCameraName: () => "",
  });
  assert.equal(signature, "camera.front_door:alert|camera.driveway:detection");
});
