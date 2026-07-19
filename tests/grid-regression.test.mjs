import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const source = fs.readFileSync(
  new URL("../frigate-view-card.js", import.meta.url),
  "utf8",
);

test("grid mode config is wired through card and editor", () => {
  assert.equal(source.includes("grid_mode_enabled"), true);
  assert.equal(source.includes("grid_rotation_seconds"), true);
  assert.equal(source.includes("Grid Rotation Frequency"), true);
  assert.equal(source.includes("grid_rotation_row"), true);
});

test("grid mode toolbar and runtime hooks are present", () => {
  assert.equal(source.includes("grid-btn"), true);
  assert.equal(source.includes("_toggleGridMode"), true);
  assert.equal(source.includes("_isGridModeAvailable"), true);
  assert.equal(source.includes("_mountGridEngine"), true);
  assert.equal(source.includes("_scheduleGridRotation"), true);
  assert.equal(source.includes("_handleGridRealtimeMessage"), true);
  assert.equal(source.includes("_probeLatestGridAlert"), true);
});
