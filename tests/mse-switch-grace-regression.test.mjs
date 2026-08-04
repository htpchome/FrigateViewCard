import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const source = fs.readFileSync(
  new URL("../frigate-view-card.js", import.meta.url),
  "utf8",
);
const cardSource = fs.readFileSync(
  new URL("../src/card/FrigateViewCard.js", import.meta.url),
  "utf8",
);
const go2rtcRaceMounterSource = fs.readFileSync(
  new URL("../src/features/live/go2rtc-race-mounter.js", import.meta.url),
  "utf8",
);
const pendingDestroyersSource = fs.readFileSync(
  new URL("../src/features/live/pending-destroyers.js", import.meta.url),
  "utf8",
);
const attemptPlannerSource = fs.readFileSync(
  new URL("../src/features/live/attempt-planner.js", import.meta.url),
  "utf8",
);

test("camera switching preserves recent MSE engines for short switch-back reuse", () => {
  assert.equal(cardSource.includes("MSE_SWITCH_GRACE_MS"), true);
  assert.equal(cardSource.includes("MSE_SWITCH_GRACE_MAX"), true);
  assert.equal(cardSource.includes("_mseGracePool = new Map()"), true);
  assert.equal(cardSource.includes("_stashMseEngineForGrace"), true);
  assert.equal(cardSource.includes("_stashPendingMsePromiseForGrace"), true);
  assert.equal(cardSource.includes("_takeGraceMseEntry"), true);
  assert.equal(cardSource.includes("_adoptGraceMseEngine"), true);
  assert.equal(cardSource.includes("_ensureMseGraceHost"), true);
  assert.equal(
    pendingDestroyersSource.includes("splitPendingDestroyersByGraceMse"),
    true,
  );
});

test("switch-camera cleanup keeps shell grace coordination and live race takeover separated", () => {
  assert.equal(cardSource.includes("preserveMseEntity"), true);
  assert.equal(
    cardSource.includes("pendingAttempt?.entity === preserveMseEntity"),
    true,
  );
  assert.match(
    cardSource,
    /String\(this\._activeStreamType\s*\|\|\s*""\)[\s\S]*?toLowerCase\(\)[\s\S]*?===\s*"mse"/,
  );
  assert.equal(cardSource.includes('pendingAttempt?.type === "mse"'), true);
  assert.equal(cardSource.includes("_stashPendingMsePromiseForGrace"), true);
  assert.equal(cardSource.includes("appendChild(engine.video)"), true);
  assert.equal(cardSource.includes("appendChild(result.engine.video)"), true);
  assert.equal(cardSource.includes("_scheduleDeferredWebRtcTakeover"), false);
  assert.equal(
    go2rtcRaceMounterSource.includes("function scheduleDeferredWebRtcTakeover"),
    true,
  );
  assert.equal(
    go2rtcRaceMounterSource.includes("createPendingMountDestroyers"),
    true,
  );
  assert.equal(
    go2rtcRaceMounterSource.includes("filterPendingDestroyersForWinner"),
    true,
  );
  assert.equal(
    go2rtcRaceMounterSource.includes("setPendingWebRtcTakeoverTimer"),
    true,
  );
  assert.match(
    attemptPlannerSource,
    /const\s+DEFAULT_LIVE_ORDER\s*=\s*Object\.freeze\(\["webrtc",\s*"mse",\s*"hls"\]\)[\s\S]*?const\s+order\s*=\s*forcedType\s*\?\s*\[forcedType\]\s*:\s*DEFAULT_LIVE_ORDER/,
  );
});
