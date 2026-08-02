import { test } from "node:test";
import assert from "node:assert/strict";

import {
  resolveClosestRecordingAlertStart,
  resolveRecordingScrubTarget,
  resolveRecordingSeekOutcome,
  resolveRecordingSeekTimeout,
} from "../../src/card/recordings/scrub-utils.js";

test("resolveClosestRecordingAlertStart snaps to the start of short alerts", () => {
  assert.equal(
    resolveClosestRecordingAlertStart(110, [{ start: 100, end: 115 }], 5),
    100,
  );
});

test("resolveClosestRecordingAlertStart avoids snapping inside long alerts", () => {
  assert.equal(
    resolveClosestRecordingAlertStart(110, [{ start: 100, end: 130 }], 5),
    null,
  );
});

test("resolveClosestRecordingAlertStart snaps to the nearest alert within threshold", () => {
  assert.equal(
    resolveClosestRecordingAlertStart(
      150,
      [
        { start: 120, end: 125 },
        { start: 160, end: 165 },
      ],
      12,
    ),
    160,
  );
});

test("resolveRecordingScrubTarget clamps ratio and returns relative target", () => {
  assert.deepEqual(
    resolveRecordingScrubTarget({
      ratio: 1.5,
      start: 100,
      end: 200,
      alerts: [],
    }),
    {
      absTarget: 200,
      relTarget: 100,
    },
  );
});

test("resolveRecordingScrubTarget snaps to alert starts when appropriate", () => {
  assert.deepEqual(
    resolveRecordingScrubTarget({
      ratio: 0.12,
      start: 100,
      end: 300,
      alerts: [{ start: 120, end: 130 }],
    }),
    {
      absTarget: 120,
      relTarget: 20,
    },
  );
});

test("resolveRecordingSeekTimeout extends timeout for Firefox and Edge", () => {
  assert.equal(resolveRecordingSeekTimeout({ isFirefox: true }), 4200);
  assert.equal(resolveRecordingSeekTimeout({ isEdge: true }), 4200);
  assert.equal(resolveRecordingSeekTimeout({}), 2500);
});

test("resolveRecordingSeekOutcome resumes on Firefox-family browsers without fallback", () => {
  assert.deepEqual(
    resolveRecordingSeekOutcome({
      isFirefox: true,
      seekOk: false,
      currentTime: 0,
      relTarget: 50,
      absTarget: 150,
      start: 100,
      end: 200,
      resumeAfterScrub: true,
    }),
    {
      shouldResumePlayback: true,
      shouldFallback: false,
      blockedByFallbackLoading: false,
      fallbackStart: null,
      fallbackEnd: null,
    },
  );
});

test("resolveRecordingSeekOutcome builds fallback window when seek misses target", () => {
  assert.deepEqual(
    resolveRecordingSeekOutcome({
      seekOk: true,
      currentTime: 10,
      relTarget: 20,
      absTarget: 120.9,
      start: 100,
      end: 160,
    }),
    {
      shouldResumePlayback: false,
      shouldFallback: true,
      blockedByFallbackLoading: false,
      fallbackStart: 120,
      fallbackEnd: 180,
    },
  );
});

test("resolveRecordingSeekOutcome suppresses fallback when one is already loading", () => {
  assert.deepEqual(
    resolveRecordingSeekOutcome({
      seekOk: false,
      currentTime: 0,
      relTarget: 20,
      absTarget: 120,
      start: 100,
      end: 160,
      isFallbackLoading: true,
    }),
    {
      shouldResumePlayback: false,
      shouldFallback: false,
      blockedByFallbackLoading: true,
      fallbackStart: null,
      fallbackEnd: null,
    },
  );
});

test("resolveRecordingSeekOutcome resumes playback when seek succeeds within tolerance", () => {
  assert.deepEqual(
    resolveRecordingSeekOutcome({
      seekOk: true,
      currentTime: 19,
      relTarget: 20,
      absTarget: 120,
      start: 100,
      end: 160,
      resumeAfterScrub: true,
    }),
    {
      shouldResumePlayback: true,
      shouldFallback: false,
      blockedByFallbackLoading: false,
      fallbackStart: null,
      fallbackEnd: null,
    },
  );
});
