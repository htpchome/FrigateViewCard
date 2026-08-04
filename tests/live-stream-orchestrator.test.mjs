import { test } from "node:test";
import assert from "node:assert/strict";

import { StreamOrchestrator } from "../src/features/live/stream.orchestrator.js";

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const makeStrategy = ({ type, connectDelayMs = 0, resultType = null }) => {
  const state = {
    connectCalls: 0,
    disconnectCalls: 0,
  };

  const strategy = {
    type,
    connect: async () => {
      state.connectCalls += 1;
      if (connectDelayMs > 0) await delay(connectDelayMs);
      return {
        ok: true,
        type: resultType || type,
        engine: { destroy: () => {} },
      };
    },
    disconnect: async () => {
      state.disconnectCalls += 1;
    },
  };

  return { strategy, state };
};

test("StreamOrchestrator returns null when no strategies are provided", async () => {
  const orchestrator = new StreamOrchestrator({ strategies: [] });
  const winner = await orchestrator.start();
  assert.equal(winner, null);
});

test("StreamOrchestrator prefers WebRTC inside preference window", async () => {
  const mse = makeStrategy({ type: "mse", connectDelayMs: 10 });
  const webrtc = makeStrategy({ type: "webrtc", connectDelayMs: 20 });
  const hls = makeStrategy({ type: "hls", connectDelayMs: 30 });

  const orchestrator = new StreamOrchestrator({
    strategies: [mse.strategy, webrtc.strategy, hls.strategy],
    preferredType: "webrtc",
    preferredWaitMs: 80,
  });

  const winner = await orchestrator.start();

  assert.equal(winner?.type, "webrtc");
  assert.equal(mse.state.disconnectCalls, 1);
  assert.equal(hls.state.disconnectCalls, 1);
  assert.equal(webrtc.state.disconnectCalls, 0);
});

test("StreamOrchestrator keeps faster fallback when preferred misses window", async () => {
  const mse = makeStrategy({ type: "mse", connectDelayMs: 10 });
  const webrtc = makeStrategy({ type: "webrtc", connectDelayMs: 120 });

  const orchestrator = new StreamOrchestrator({
    strategies: [mse.strategy, webrtc.strategy],
    preferredType: "webrtc",
    preferredWaitMs: 25,
  });

  const winner = await orchestrator.start();

  assert.equal(winner?.type, "mse");
  assert.equal(mse.state.disconnectCalls, 0);
  assert.equal(webrtc.state.disconnectCalls, 1);
});

test("StreamOrchestrator can retain preferred strategy after fallback wins", async () => {
  const mse = makeStrategy({ type: "mse", connectDelayMs: 10 });
  const webrtc = makeStrategy({ type: "webrtc", connectDelayMs: 120 });

  const orchestrator = new StreamOrchestrator({
    strategies: [mse.strategy, webrtc.strategy],
    preferredType: "webrtc",
    preferredWaitMs: 0,
    retainPreferredOnFallback: true,
  });

  const winner = await orchestrator.start();

  assert.equal(winner?.type, "mse");
  assert.equal(mse.state.disconnectCalls, 0);
  assert.equal(webrtc.state.disconnectCalls, 0);
  assert.equal(orchestrator.deferredPreferredAttempt?.type, "webrtc");
  await orchestrator.stop();
  assert.equal(webrtc.state.disconnectCalls, 1);
});

test("StreamOrchestrator stop disconnects all strategies", async () => {
  const webrtc = makeStrategy({ type: "webrtc" });
  const mse = makeStrategy({ type: "mse" });

  const orchestrator = new StreamOrchestrator({
    strategies: [webrtc.strategy, mse.strategy],
  });

  await orchestrator.start();
  await orchestrator.stop();

  assert.ok(webrtc.state.disconnectCalls >= 1);
  assert.ok(mse.state.disconnectCalls >= 1);
});

test("StreamOrchestrator returns null and stops all strategies when all fail", async () => {
  const state = {
    webrtcDisconnects: 0,
    mseDisconnects: 0,
  };

  const orchestrator = new StreamOrchestrator({
    strategies: [
      {
        type: "webrtc",
        connect: async () => {
          throw new Error("webrtc failed");
        },
        disconnect: async () => {
          state.webrtcDisconnects += 1;
        },
      },
      {
        type: "mse",
        connect: async () => {
          throw new Error("mse failed");
        },
        disconnect: async () => {
          state.mseDisconnects += 1;
        },
      },
    ],
    preferredType: "webrtc",
    preferredWaitMs: 40,
  });

  const winner = await orchestrator.start();

  assert.equal(winner, null);
  assert.equal(state.webrtcDisconnects, 1);
  assert.equal(state.mseDisconnects, 1);
});
