import { test } from "node:test";
import assert from "node:assert/strict";

import {
  buildLiveAttemptPlan,
  raceMountAttempts,
} from "../src/features/live/attempt-planner.js";

test("buildLiveAttemptPlan excludes HLS from automatic live startup", () => {
  const attempts = buildLiveAttemptPlan({
    connectionType: "frigate_go2rtc",
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

test("buildLiveAttemptPlan keeps HLS available when explicitly forced", () => {
  const attempts = buildLiveAttemptPlan({
    connectionType: "frigate_go2rtc",
    forcedType: "hls",
    builders: {
      webrtc: () => ({ ok: true }),
      mse: () => ({ ok: true }),
      hls: () => ({ ok: true }),
    },
  });

  assert.deepEqual(
    attempts.map((attempt) => attempt.type),
    ["hls"],
  );
});

test("buildLiveAttemptPlan returns no attempts for ha_direct", () => {
  const attempts = buildLiveAttemptPlan({
    connectionType: "ha_direct",
    builders: {
      webrtc: () => ({ ok: true }),
      mse: () => ({ ok: true }),
      hls: () => ({ ok: true }),
    },
  });

  assert.deepEqual(attempts, []);
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
