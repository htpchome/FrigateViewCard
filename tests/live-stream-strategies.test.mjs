import { test } from "node:test";
import assert from "node:assert/strict";

import {
  StreamStrategy,
  WebRtcStrategy,
  MseStrategy,
  HlsStrategy,
  createStrategyForType,
} from "../src/features/live/stream.strategies.js";

test("createStrategyForType returns protocol strategy classes", () => {
  assert.ok(
    createStrategyForType({
      type: "webrtc",
      connect: async () => ({ ok: true }),
    }) instanceof WebRtcStrategy,
  );
  assert.ok(
    createStrategyForType({
      type: "mse",
      connect: async () => ({ ok: true }),
    }) instanceof MseStrategy,
  );
  assert.ok(
    createStrategyForType({
      type: "hls",
      connect: async () => ({ ok: true }),
    }) instanceof HlsStrategy,
  );
  assert.ok(
    createStrategyForType({
      type: "other",
      connect: async () => ({ ok: true }),
    }) instanceof StreamStrategy,
  );
});

test("StreamStrategy reuses in-flight connect promise", async () => {
  let calls = 0;
  const strategy = new StreamStrategy({
    type: "mse",
    connect: async () => {
      calls += 1;
      return { ok: true, type: "mse", engine: { destroy: () => {} } };
    },
  });

  const a = strategy.connect();
  const b = strategy.connect();
  const [ra, rb] = await Promise.all([a, b]);

  assert.equal(calls, 1);
  assert.equal(ra.type, "mse");
  assert.equal(rb.type, "mse");
  assert.equal(ra, rb);
});

test("StreamStrategy disconnect aborts and destroys once", async () => {
  let destroyCalls = 0;
  let sawAbort = false;
  const strategy = new StreamStrategy({
    type: "webrtc",
    connect: async ({ abortSignal }) => {
      abortSignal.addEventListener("abort", () => {
        sawAbort = true;
      });
      return {
        ok: true,
        type: "webrtc",
        engine: {
          destroy: () => {
            destroyCalls += 1;
          },
        },
      };
    },
  });

  await strategy.connect();
  await strategy.disconnect();
  await strategy.disconnect();

  assert.equal(sawAbort, true);
  assert.equal(destroyCalls, 1);
});

test("StreamStrategy disconnect before connect is a no-op", async () => {
  let connectCalls = 0;
  const strategy = new StreamStrategy({
    type: "hls",
    connect: async () => {
      connectCalls += 1;
      return { ok: true, type: "hls", engine: { destroy: () => {} } };
    },
  });

  await strategy.disconnect();

  assert.equal(connectCalls, 0);
});
