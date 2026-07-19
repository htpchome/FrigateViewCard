import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const source = fs.readFileSync(
  new URL("../frigate-view-card.js", import.meta.url),
  "utf8",
);

test("camera switching preserves recent MSE engines for short switch-back reuse", () => {
  assert.equal(source.includes("MSE_SWITCH_GRACE_MS"), true);
  assert.equal(source.includes("MSE_SWITCH_GRACE_MAX"), true);
  assert.equal(source.includes("_mseGracePool = new Map()"), true);
  assert.equal(source.includes("_stashMseEngineForGrace"), true);
  assert.equal(source.includes("_takeGraceMseEngine"), true);
  assert.equal(source.includes("_adoptGraceMseEngine"), true);
  assert.equal(source.includes("preserveMseEntity: prevEnt"), true);
});

test("switch-camera cleanup preserves MSE while regular live startup stays unified", () => {
  assert.match(
    source,
    /_cancelPendingMount\("switch-camera",\s*\{\s*preserveMseEntity:\s*prevEnt\s*\}\)/,
  );
  assert.match(
    source,
    /String\(this\._activeStreamType\s*\|\|\s*""\)\.trim\(\)\.toLowerCase\(\)\s*===\s*"mse"/,
  );
  assert.match(
    source,
    /const\s+order\s*=\s*forcedType\s*\?\s*\[forcedType\]\s*:\s*\["webrtc",\s*"mse",\s*"hls"\]/,
  );
});
