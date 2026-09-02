import assert from "node:assert/strict";
import test from "node:test";

import { PtzMotionController } from "../src/features/ptz/motion.ctrl.js";

const createTimerHarness = () => {
  let nextTimer = 1;
  const timers = new Map();
  return {
    timers,
    setTimer: (callback, delay) => {
      const timer = nextTimer;
      nextTimer += 1;
      timers.set(timer, { callback, delay });
      return timer;
    },
    clearTimer: (timer) => timers.delete(timer),
    runDelay: async (delay) => {
      const entry = [...timers.entries()].find(
        ([, timer]) => timer.delay === delay,
      );
      assert.ok(entry, `Expected a ${delay}ms timer`);
      timers.delete(entry[0]);
      entry[1].callback();
      await new Promise((resolve) => setImmediate(resolve));
    },
  };
};

const context = {
  camera: { entity: "camera.driveway", ptz: true },
  ptzInfo: { features: ["pt"] },
};

test("release while capability lookup is pending prevents a late move", async () => {
  let finishContext;
  const pendingContext = new Promise((resolve) => {
    finishContext = resolve;
  });
  const calls = [];
  const controller = new PtzMotionController({
    resolveContext: () => pendingContext,
    resolveHoldPlan: () => ({
      strategy: "frigate_continuous",
      repeatIntervalMs: null,
      requiresStop: true,
    }),
    executeAction: (call) => calls.push(call),
  });

  const starting = controller.start("left");
  await Promise.resolve();
  await controller.stop();
  finishContext(context);
  await starting;

  assert.deepEqual(calls, []);
});

test("Frigate movement sends one move and stops on release", async () => {
  const timerHarness = createTimerHarness();
  const calls = [];
  const controller = new PtzMotionController({
    resolveContext: () => context,
    resolveHoldPlan: () => ({
      strategy: "frigate_continuous",
      repeatIntervalMs: null,
      requiresStop: true,
    }),
    executeAction: (call) => calls.push(call),
    ...timerHarness,
  });

  await controller.start("up");
  await controller.stop();

  assert.deepEqual(
    calls.map(({ action, eventType }) => [action, eventType]),
    [
      ["up", "press"],
      ["up", "release"],
    ],
  );
  assert.equal(timerHarness.timers.size, 2);
});

test("a timed movement strategy renews while held and retries stop", async () => {
  const timerHarness = createTimerHarness();
  const calls = [];
  const controller = new PtzMotionController({
    resolveContext: () => context,
    resolveHoldPlan: () => ({
      strategy: "timed_continuous",
      repeatIntervalMs: 600,
      requiresStop: true,
    }),
    executeAction: (call) => calls.push(call),
    ...timerHarness,
  });

  await controller.start("right");
  await timerHarness.runDelay(600);
  await controller.stop();
  await timerHarness.runDelay(180);
  await timerHarness.runDelay(650);

  assert.deepEqual(
    calls.map(({ eventType }) => eventType),
    ["press", "press", "release", "release", "release"],
  );
  assert.equal(timerHarness.timers.size, 0);
});

test("legacy continuous movement sends one move and redundant stops", async () => {
  const timerHarness = createTimerHarness();
  const calls = [];
  const controller = new PtzMotionController({
    resolveContext: () => context,
    resolveHoldPlan: () => ({
      strategy: "frigate_continuous",
      repeatIntervalMs: null,
      requiresStop: true,
    }),
    executeAction: (call) => calls.push(call),
    ...timerHarness,
  });

  await controller.start("down");
  await controller.stop();
  await timerHarness.runDelay(180);
  await timerHarness.runDelay(650);

  assert.deepEqual(
    calls.map(({ eventType }) => eventType),
    ["press", "release", "release", "release"],
  );
});

test("a new hold cancels delayed stops from the prior hold", async () => {
  const timerHarness = createTimerHarness();
  const calls = [];
  const controller = new PtzMotionController({
    resolveContext: () => context,
    resolveHoldPlan: () => ({
      strategy: "frigate_continuous",
      repeatIntervalMs: null,
      requiresStop: true,
    }),
    executeAction: (call) => calls.push(call),
    ...timerHarness,
  });

  await controller.start("left");
  await controller.stop();
  assert.equal(timerHarness.timers.size, 2);

  await controller.start("right");

  assert.equal(timerHarness.timers.size, 0);
  assert.deepEqual(
    calls.map(({ action, eventType }) => [action, eventType]),
    [
      ["left", "press"],
      ["left", "release"],
      ["right", "press"],
    ],
  );
});
