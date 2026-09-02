import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const source = fs.readFileSync(
  new URL("../dist/frigate-view-card.js", import.meta.url),
  "utf8",
);
const cardSource = fs.readFileSync(
  new URL("../src/card/FrigateViewCard.js", import.meta.url),
  "utf8",
);
const constantsSource = fs.readFileSync(
  new URL("../src/constants.js", import.meta.url),
  "utf8",
);
const go2rtcRaceMounterSource = fs.readFileSync(
  new URL("../src/features/live/go2rtc-race-mounter.js", import.meta.url),
  "utf8",
);
const mseGraceControllerSource = fs.readFileSync(
  new URL("../src/features/live/mse-grace-controller.js", import.meta.url),
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
const mountLifecycleSource = fs.readFileSync(
  new URL("../src/features/live/mount-lifecycle.js", import.meta.url),
  "utf8",
);

test("camera switching preserves recent live engines for short switch-back reuse", () => {
  assert.equal(
    cardSource.includes(
      'import { createMseGraceController } from "../features/live/mse-grace-controller.js";',
    ),
    true,
  );
  assert.equal(
    /this\._mseGraceController\s*=\s*createMseGraceController\(\{/.test(
      cardSource,
    ),
    true,
  );
  assert.equal(cardSource.includes("_mseGracePool = new Map()"), false);
  assert.equal(cardSource.includes("_stashMseEngineForGrace"), false);
  assert.equal(cardSource.includes("_stashPendingMsePromiseForGrace"), false);
  assert.equal(cardSource.includes("_takeGraceMseEntry"), false);
  assert.equal(cardSource.includes("_adoptGraceMseEngine"), false);
  assert.equal(cardSource.includes("_ensureMseGraceHost"), false);
  assert.equal(
    mseGraceControllerSource.includes("const mseGracePool = new Map()"),
    true,
  );
  assert.equal(mseGraceControllerSource.includes("takeGraceMseEntry"), true);
  assert.equal(mseGraceControllerSource.includes("adoptGraceMseEngine"), true);
  assert.equal(
    mseGraceControllerSource.includes("const webRtcGracePool = new Map()"),
    true,
  );
  assert.equal(
    mseGraceControllerSource.includes("takeGraceWebRtcEntry"),
    true,
  );
  assert.equal(
    mseGraceControllerSource.includes("adoptGraceWebRtcEngine"),
    true,
  );
  assert.equal(mseGraceControllerSource.includes("clearGracePool"), true);
  assert.equal(
    pendingDestroyersSource.includes("splitPendingDestroyersByGraceMse"),
    true,
  );
});

test("switch-camera cleanup keeps shell grace coordination and live race takeover separated", () => {
  assert.equal(cardSource.includes("resolveCameraSwitchCleanupOptions"), true);
  assert.match(
    cardSource,
    /resolveCameraSwitchCleanupOptions\(\{[\s\S]*?previousEntity:\s*previousTransportEntity,[\s\S]*?mountInProgress:\s*this\._mountInProgress/,
  );
  assert.match(
    cardSource,
    /resolveCameraSwitchTransportEntity\(\{[\s\S]*?cameraEntity:\s*previousCamera\?\.entity,[\s\S]*?memberOverride:\s*previousMemberOverride/,
  );
  assert.match(
    mountLifecycleSource,
    /if \(!entity \|\| mountInProgress === true\) return \{\};[\s\S]*?return \{ preserveLiveEntity: entity \};/,
  );
  assert.equal(cardSource.includes("cleanupEngine(options)"), true);
  assert.match(
    cardSource,
    /_cleanupEngine\(options = \{\}\)[\s\S]*?cancelPendingWebRtcAttempts\?\.\(\)[\s\S]*?cleanupEngine\(options\)/,
  );
  assert.match(
    mseGraceControllerSource,
    /const activeStreamType[\s\S]*?activeStreamType === "webrtc"[\s\S]*?activeStreamType === "mse"/,
  );
  assert.equal(
    mseGraceControllerSource.includes('pendingAttempt?.type === "mse"'),
    false,
  );
  assert.equal(
    mseGraceControllerSource.includes("splitPendingDestroyersByGraceMse"),
    true,
  );
  assert.equal(
    mseGraceControllerSource.includes("appendChild(engine.video)"),
    true,
  );
  assert.equal(
    mseGraceControllerSource.includes("appendChild(result.engine.video)"),
    true,
  );
  assert.equal(mseGraceControllerSource.includes("preserveLiveEntity"), true);
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
    /const\s+DEFAULT_LIVE_ORDER\s*=\s*Object\.freeze\(\["webrtc",\s*"mse"\]\)[\s\S]*?const\s+order\s*=\s*forcedType\s*\?\s*\[forcedType\]\s*:\s*DEFAULT_LIVE_ORDER/,
  );
});

test("dashboard swipe return remounts retained go2rtc WebRTC through the grace path", () => {
  assert.match(
    cardSource,
    /onDashboardNavigationSettled:\s*\(\)\s*=>\s*this\._handleDashboardSwipeNavigationSettled\(\)/,
  );
  assert.match(
    cardSource,
    /_handleDashboardSwipeNavigationSettled\(\)[\s\S]*?_shouldUseGo2RtcForEntity\(entity\)[\s\S]*?_currentLiveStreamHint\(\)\s*!==\s*"webrtc"/,
  );
  assert.match(
    cardSource,
    /dashboard-swipe-webrtc-rebind[\s\S]*?preserveLiveEntity:\s*entity[\s\S]*?_clearLiveEngineSlot\(\)[\s\S]*?_mountEngine\(\)/,
  );
});

test("same-dashboard departure uses the complete camera-switch grace policy", () => {
  assert.match(
    constantsSource,
    /MSE_SWITCH_GRACE_MS\s*=\s*20000/,
  );
  assert.match(
    cardSource,
    /_preserveLiveForDashboardNavigation\(\)[\s\S]*?streamType !== "webrtc" && streamType !== "mse"[\s\S]*?resolveCameraSwitchCleanupOptions\(\{[\s\S]*?_cancelPendingMount\("same-dashboard-navigation", cleanupOptions\)/,
  );
  assert.match(
    cardSource,
    /disconnectedCallback\(\)[\s\S]*?isCurrentDashboardScope\?\.\(\)[\s\S]*?_preserveLiveForDashboardNavigation\(\)[\s\S]*?preserveDashboardLive \? MSE_SWITCH_GRACE_MS : 2500/,
  );
  assert.match(
    cardSource,
    /onDashboardScopeExited:\s*\(\)\s*=>\s*this\._handleDashboardScopeExited\(\)/,
  );
});
