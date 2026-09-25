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
const liveGraceControllerSource = fs.readFileSync(
  new URL("../src/features/live/live-grace-controller.js", import.meta.url),
  "utf8",
);
const liveLifecycleCompositionSource = fs.readFileSync(
  new URL(
    "../src/features/live/lifecycle-composition.js",
    import.meta.url,
  ),
  "utf8",
);
const liveDashboardRetentionSource = fs.readFileSync(
  new URL(
    "../src/features/live/dashboard-retention.ctrl.js",
    import.meta.url,
  ),
  "utf8",
);
const haDashboardCompositionSource = fs.readFileSync(
  new URL(
    "../src/integrations/home-assistant/dashboard-composition.js",
    import.meta.url,
  ),
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
const mountStateControllerSource = fs.readFileSync(
  new URL("../src/features/live/mount-state.ctrl.js", import.meta.url),
  "utf8",
);

test("camera switching preserves recent live engines for short switch-back reuse", () => {
  assert.equal(
    liveLifecycleCompositionSource.includes(
      'import { createLiveGraceController } from "./live-grace-controller.js";',
    ),
    true,
  );
  assert.equal(
    /this\._liveGraceController\s*=\s*createLiveGraceController\(\{/.test(
      liveLifecycleCompositionSource,
    ),
    false,
  );
  assert.equal(
    liveLifecycleCompositionSource.includes(
      "const liveGraceController = resolvedFactories.createLiveGraceController({",
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
    liveGraceControllerSource.includes("const mseGracePool = new Map()"),
    true,
  );
  assert.equal(liveGraceControllerSource.includes("takeGraceMseEntry"), true);
  assert.equal(liveGraceControllerSource.includes("adoptGraceMseEngine"), true);
  assert.equal(
    liveGraceControllerSource.includes("const webRtcGracePool = new Map()"),
    true,
  );
  assert.equal(
    liveGraceControllerSource.includes("const haDirectGracePool = new Map()"),
    true,
  );
  assert.equal(
    liveGraceControllerSource.includes("takeGraceWebRtcEntry"),
    true,
  );
  assert.equal(
    liveGraceControllerSource.includes("adoptGraceWebRtcEngine"),
    true,
  );
  assert.equal(
    liveGraceControllerSource.includes("adoptGraceHaDirectEngine"),
    true,
  );
  assert.equal(liveGraceControllerSource.includes("clearGracePool"), true);
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
    /_cleanupEngine\(options = \{\}\)[\s\S]*?getLiveMountStateController\(this\)\.cleanupEngine\(options\)/,
  );
  assert.match(
    mountStateControllerSource,
    /cleanupEngine\(options = \{\}\)[\s\S]*?cancelPendingWebRtcAttempts\?\.\(\)[\s\S]*?cleanupEngine\(options\)/,
  );
  assert.match(
    liveGraceControllerSource,
    /const activeStreamType[\s\S]*?activeStreamType === "webrtc"[\s\S]*?activeStreamType === "mse"/,
  );
  assert.equal(
    liveGraceControllerSource.includes('pendingAttempt?.type === "mse"'),
    false,
  );
  assert.equal(
    liveGraceControllerSource.includes("splitPendingDestroyersByGraceMse"),
    true,
  );
  assert.equal(
    liveGraceControllerSource.includes("appendChild(engine.video)"),
    true,
  );
  assert.equal(
    liveGraceControllerSource.includes("appendChild(result.engine.video)"),
    true,
  );
  assert.equal(liveGraceControllerSource.includes("preserveLiveEntity"), true);
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
    haDashboardCompositionSource,
    /onDashboardNavigationSettled:\s*\(\)\s*=>\s*card\._handleDashboardSwipeNavigationSettled\(\)/,
  );
  assert.match(
    liveDashboardRetentionSource,
    /handleNavigationSettled\(\)[\s\S]*?host\._shouldUseGo2RtcForEntity\(entity\)[\s\S]*?host\._currentLiveStreamHint\(\)\s*!==\s*"webrtc"/,
  );
  assert.match(
    liveDashboardRetentionSource,
    /dashboard-swipe-webrtc-rebind[\s\S]*?preserveLiveEntity:\s*entity[\s\S]*?_clearLiveEngineSlot\(\)[\s\S]*?_mountEngine\(\)/,
  );
});

test("same-dashboard departure uses the complete camera-switch grace policy", () => {
  assert.match(
    constantsSource,
    /LIVE_SWITCH_GRACE_MS\s*=\s*20000/,
  );
  assert.match(
    liveDashboardRetentionSource,
    /preserveForNavigation\(\)[\s\S]*?streamType !== "webrtc" && streamType !== "mse"[\s\S]*?resolveCameraSwitchCleanupOptions\(\{[\s\S]*?host\._cancelPendingMount\("same-dashboard-navigation", cleanupOptions\)/,
  );
  assert.match(
    cardSource,
    /disconnectedCallback\(\)[\s\S]*?isCurrentDashboardScope\?\.\(\)[\s\S]*?_preserveLiveForDashboardNavigation\(\)[\s\S]*?preserveDashboardLive \? LIVE_SWITCH_GRACE_MS : 2500/,
  );
  assert.match(
    haDashboardCompositionSource,
    /onDashboardScopeExited:\s*\(\)\s*=>\s*card\._handleDashboardScopeExited\(\)/,
  );
});
