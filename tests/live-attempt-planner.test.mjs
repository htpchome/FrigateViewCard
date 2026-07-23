import { test } from "node:test";
import assert from "node:assert/strict";

import {
  buildLiveAttemptPlan,
  raceMountAttempts,
} from "../src/live/live-attempt-planner.js";

test("buildLiveAttemptPlan uses default order and filters desktop HLS when disabled", () => {
  const attempts = buildLiveAttemptPlan({
    connectionType: "frigate_go2rtc",
    disableHlsOnDesktop: true,
    builders: {
      webrtc: () => ({ ok: true }),
      mse: () => ({ ok: true }),
      hls: () => ({ ok: true }),
    },
  });

  assert.deepEqual(
    attempts.map((attempt) => attempt.type),
    ["webrtc", "mse"],
  );
});

test("buildLiveAttemptPlan honors forced type", () => {
  const attempts = buildLiveAttemptPlan({
    connectionType: "frigate_go2rtc",
    forcedType: "mse",
    builders: {
      webrtc: () => ({ ok: true }),
      mse: () => ({ ok: true }),
      hls: () => ({ ok: true }),
    },
  });

  assert.deepEqual(
    attempts.map((attempt) => attempt.type),
    ["mse"],
  );
});

test("raceMountAttempts resolves first successful result", async () => {
  const loser = Promise.resolve({ ok: false, type: "webrtc" });
  const winner = Promise.resolve({ ok: true, type: "mse" });
  const result = await raceMountAttempts([loser, winner]);

  assert.equal(result?.ok, true);
  assert.equal(result?.type, "mse");
});

test("raceMountAttempts returns null when all attempts fail", async () => {
  const result = await raceMountAttempts([
    Promise.resolve({ ok: false, type: "webrtc" }),
    Promise.resolve(false),
  ]);

  assert.equal(result, null);
});
