import { test } from "node:test";
import assert from "node:assert/strict";

import {
  cameraEntityForIncomingCamera,
  cameraIndexForIncomingCamera,
  extractRealtimeMessageCamera,
  extractRealtimeMessageSeverity,
} from "../src/features/slideshow/routing.js";

const config = {
  cameras: [
    { entity: "camera.front_door", name: "Front Door" },
    { entity: "camera.side_yard", name: "Side Yard" },
  ],
};

const camCache = {
  "camera.front_door": { cam: "front-door" },
  "camera.side_yard": { cam: "side_yard" },
};

test("cameraIndexForIncomingCamera matches entity with and without prefix", () => {
  assert.equal(
    cameraIndexForIncomingCamera(config, camCache, "camera.front_door"),
    0,
  );
  assert.equal(cameraIndexForIncomingCamera(config, camCache, "front_door"), 0);
});

test("cameraIndexForIncomingCamera matches dashed and spaced camera ids", () => {
  assert.equal(cameraIndexForIncomingCamera(config, camCache, "front-door"), 0);
  assert.equal(cameraIndexForIncomingCamera(config, camCache, "Front Door"), 0);
  assert.equal(cameraIndexForIncomingCamera(config, camCache, "side-yard"), 1);
});

test("cameraEntityForIncomingCamera resolves normalized camera ids", () => {
  assert.equal(
    cameraEntityForIncomingCamera(config, camCache, "front-door"),
    "camera.front_door",
  );
  assert.equal(
    cameraEntityForIncomingCamera(config, camCache, "camera.side_yard"),
    "camera.side_yard",
  );
});

test("extractRealtimeMessageCamera supports nested payload shapes", () => {
  assert.equal(
    extractRealtimeMessageCamera({
      payload: { after: { camera: "garage" } },
    }),
    "garage",
  );
  assert.equal(
    extractRealtimeMessageCamera({
      event: { after: { camera: "deck" } },
    }),
    "deck",
  );
  assert.equal(
    extractRealtimeMessageCamera({
      after: { data: { camera: "front_door" } },
    }),
    "front_door",
  );
});

test("extractRealtimeMessageSeverity supports nested payload shapes", () => {
  assert.equal(
    extractRealtimeMessageSeverity({
      payload: { after: { severity: "alert" } },
      type: "update",
    }),
    "alert",
  );
  assert.equal(
    extractRealtimeMessageSeverity({
      review: { before: { severity: "detection" } },
      type: "update",
    }),
    "detection",
  );
});
