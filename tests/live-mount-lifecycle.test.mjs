import { test } from "node:test";
import assert from "node:assert/strict";

import {
  applyMountWatchdogTimeout,
  beginMountTracking,
  clearMountTrackingIfCurrent,
  invalidateMountTrackingIfActive,
  shouldRunMountWatchdog,
} from "../src/live/live-mount-lifecycle.js";

test("beginMountTracking increments token and sets active state", () => {
  const result = beginMountTracking({ mountSeq: 4, entity: "camera.front" });

  assert.equal(result.mountToken, 5);
  assert.deepEqual(result.nextState, {
    mountSeq: 5,
    mountInProgress: true,
    mountStartedAt: result.nextState.mountStartedAt,
    mountTargetEntity: "camera.front",
  });
  assert.equal(typeof result.nextState.mountStartedAt, "number");
});

test("clearMountTrackingIfCurrent clears only for current token", () => {
  const unchanged = clearMountTrackingIfCurrent({
    mountSeq: 7,
    mountToken: 6,
    mountInProgress: true,
    mountStartedAt: 123,
    mountTargetEntity: "camera.a",
  });
  assert.deepEqual(unchanged, {
    mountSeq: 7,
    mountInProgress: true,
    mountStartedAt: 123,
    mountTargetEntity: "camera.a",
  });

  const cleared = clearMountTrackingIfCurrent({
    mountSeq: 7,
    mountToken: 7,
    mountInProgress: true,
    mountStartedAt: 123,
    mountTargetEntity: "camera.a",
  });
  assert.deepEqual(cleared, {
    mountSeq: 7,
    mountInProgress: false,
    mountStartedAt: 0,
    mountTargetEntity: "",
  });
});

test("invalidateMountTrackingIfActive bumps sequence and clears", () => {
  const unchanged = invalidateMountTrackingIfActive({
    mountSeq: 2,
    mountInProgress: false,
    mountStartedAt: 0,
    mountTargetEntity: "",
  });
  assert.deepEqual(unchanged, {
    mountSeq: 2,
    mountInProgress: false,
    mountStartedAt: 0,
    mountTargetEntity: "",
  });

  const invalidated = invalidateMountTrackingIfActive({
    mountSeq: 2,
    mountInProgress: true,
    mountStartedAt: 9,
    mountTargetEntity: "camera.x",
  });
  assert.deepEqual(invalidated, {
    mountSeq: 3,
    mountInProgress: false,
    mountStartedAt: 0,
    mountTargetEntity: "",
  });
});

test("watchdog helpers respect active token and timeout transition", () => {
  assert.equal(
    shouldRunMountWatchdog({
      mountInProgress: true,
      mountSeq: 4,
      mountToken: 4,
    }),
    true,
  );
  assert.equal(
    shouldRunMountWatchdog({
      mountInProgress: false,
      mountSeq: 4,
      mountToken: 4,
    }),
    false,
  );
  assert.equal(
    shouldRunMountWatchdog({
      mountInProgress: true,
      mountSeq: 4,
      mountToken: 3,
    }),
    false,
  );

  const timedOut = applyMountWatchdogTimeout({ mountSeq: 4 });
  assert.deepEqual(timedOut, {
    mountSeq: 5,
    mountInProgress: false,
    mountStartedAt: 0,
    mountTargetEntity: "",
  });
});
