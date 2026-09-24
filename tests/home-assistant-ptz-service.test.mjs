import { test } from "node:test";
import assert from "node:assert/strict";

import { executeHomeAssistantPtzPlan } from "../src/integrations/home-assistant/ptz-service.js";

const createDeferred = () => {
  let resolve;
  const promise = new Promise((next) => {
    resolve = next;
  });
  return { promise, resolve };
};

const request = (service) => ({
  type: "home_assistant_service",
  domain: "frigate",
  service,
  serviceData: { action: service },
  target: { entity_id: "camera.driveway" },
});

test("Home Assistant PTZ plans execute sequential requests in order", async () => {
  const calls = [];
  const first = createDeferred();
  const second = createDeferred();
  const hass = {
    callService: (...args) => {
      calls.push(args);
      return calls.length === 1 ? first.promise : second.promise;
    },
  };

  const executing = executeHomeAssistantPtzPlan({
    hass,
    plan: {
      executionMode: "sequential",
      requests: [request("move"), request("stop")],
    },
  });
  await Promise.resolve();
  assert.equal(calls.length, 1);

  first.resolve();
  await new Promise((resolve) => setImmediate(resolve));
  assert.equal(calls.length, 2);
  assert.deepEqual(calls[1], [
    "frigate",
    "stop",
    { action: "stop" },
    { entity_id: "camera.driveway" },
  ]);

  second.resolve();
  await executing;
});

test("Home Assistant PTZ plans start parallel requests together", async () => {
  const calls = [];
  const deferred = [createDeferred(), createDeferred()];
  const hass = {
    callService: (...args) => {
      calls.push(args);
      return deferred[calls.length - 1].promise;
    },
  };

  const executing = executeHomeAssistantPtzPlan({
    hass,
    plan: {
      executionMode: "parallel",
      requests: [request("move"), request("focus")],
    },
  });
  await Promise.resolve();
  assert.equal(calls.length, 2);

  deferred.forEach(({ resolve }) => resolve());
  await executing;
});

test("Home Assistant PTZ execution rejects unsupported requests", async () => {
  await assert.rejects(
    executeHomeAssistantPtzPlan({
      hass: { callService: async () => {} },
      plan: {
        executionMode: "sequential",
        requests: [{ type: "direct_frigate" }],
      },
    }),
    /Unsupported PTZ request type: direct_frigate/,
  );
});

test("Home Assistant PTZ execution reports unavailable services", async () => {
  await assert.rejects(
    executeHomeAssistantPtzPlan({
      hass: {},
      plan: {
        executionMode: "sequential",
        requests: [request("move")],
      },
    }),
    /Home Assistant PTZ service is unavailable/,
  );
});
