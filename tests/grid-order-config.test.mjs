import assert from "node:assert/strict";
import test from "node:test";

import {
  GRID_ORDER_MODES,
  normalizeGridOrderConfig,
  resolveGridCameras,
} from "../src/features/grid/config.js";

const cameras = [
  {
    entity: "camera.doorbell",
    name: "Group A/B",
    group: {
      secondary_entity: "camera.package",
      layout: "stacked",
    },
  },
  { entity: "camera.driveway", name: "Driveway" },
  { entity: "camera.garage", name: "Garage" },
  { entity: "camera.deck", name: "Deck" },
  { entity: "camera.backyard", name: "Backyard" },
];

test("default Grid order preserves physical camera configuration order", () => {
  const normalized = normalizeGridOrderConfig(null, cameras);

  assert.equal(normalized.mode, GRID_ORDER_MODES.default);
  assert.deepEqual(normalized.included, [
    "camera.doorbell",
    "camera.package",
    "camera.driveway",
    "camera.garage",
    "camera.deck",
    "camera.backyard",
  ]);
  assert.deepEqual(normalized.excluded, []);
  assert.deepEqual(
    resolveGridCameras(cameras, normalized).map((camera) => camera.entity),
    normalized.included,
  );
});

test("custom Grid order reorders and excludes physical camera members", () => {
  const gridOrder = {
    mode: GRID_ORDER_MODES.custom,
    included: [
      "camera.garage",
      "camera.package",
      "camera.doorbell",
      "camera.driveway",
    ],
    excluded: ["camera.deck", "camera.backyard"],
  };

  assert.deepEqual(
    resolveGridCameras(cameras, gridOrder).map((camera) => ({
      entity: camera.entity,
      member: camera.group_member,
    })),
    [
      { entity: "camera.garage", member: "" },
      { entity: "camera.package", member: "B" },
      { entity: "camera.doorbell", member: "A" },
      { entity: "camera.driveway", member: "" },
    ],
  );
});

test("Grid order reconciliation drops stale IDs and appends new cameras", () => {
  const normalized = normalizeGridOrderConfig(
    {
      mode: GRID_ORDER_MODES.custom,
      included: ["camera.driveway", "camera.missing", "camera.driveway"],
      excluded: ["camera.deck", "camera.missing", "camera.driveway"],
    },
    cameras,
  );

  assert.deepEqual(normalized, {
    mode: GRID_ORDER_MODES.custom,
    included: [
      "camera.driveway",
      "camera.doorbell",
      "camera.package",
      "camera.garage",
      "camera.backyard",
    ],
    excluded: ["camera.deck"],
  });
});
