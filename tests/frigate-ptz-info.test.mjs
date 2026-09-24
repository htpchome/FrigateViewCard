import { test } from "node:test";
import assert from "node:assert/strict";

import {
  fetchFrigatePtzInfo,
  normalizeFrigatePtzInfoResponse,
} from "../src/integrations/frigate/ptz-info.js";

test("Frigate PTZ information uses the integration request contract", async () => {
  const requests = [];
  const response = { features: ["pt"], presets: ["home"] };

  const result = await fetchFrigatePtzInfo({
    request: async (message) => {
      requests.push(message);
      return response;
    },
    instanceId: "frigate-main",
    camera: "driveway",
  });

  assert.deepEqual(requests, [
    {
      type: "frigate/ptz/info",
      instance_id: "frigate-main",
      camera: "driveway",
    },
  ]);
  assert.equal(result, response);
});

test("Frigate PTZ information normalizes string, array, and empty responses", () => {
  const info = { features: ["pt-r"] };

  assert.deepEqual(
    normalizeFrigatePtzInfoResponse(JSON.stringify([info])),
    info,
  );
  assert.equal(normalizeFrigatePtzInfoResponse([]), null);
  assert.equal(normalizeFrigatePtzInfoResponse("not-json"), null);
  assert.equal(normalizeFrigatePtzInfoResponse(null), null);
});

test("Frigate PTZ information propagates request failures", async () => {
  const error = new Error("request failed");

  await assert.rejects(
    fetchFrigatePtzInfo({
      request: async () => {
        throw error;
      },
      instanceId: "frigate-main",
      camera: "driveway",
    }),
    error,
  );
});
