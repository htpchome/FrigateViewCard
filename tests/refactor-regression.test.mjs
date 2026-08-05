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
const go2rtcResolverSource = fs.readFileSync(
  new URL("../src/integrations/frigate/go2rtc-resolver.js", import.meta.url),
  "utf8",
);
const frigateUrlSource = fs.readFileSync(
  new URL("../src/integrations/frigate/url.js", import.meta.url),
  "utf8",
);
const sharedUrlSource = fs.readFileSync(
  new URL("../src/shared/media/url-utils.js", import.meta.url),
  "utf8",
);
const frigateBootstrapSource = fs.readFileSync(
  new URL("../src/integrations/frigate/bootstrap.js", import.meta.url),
  "utf8",
);
const go2rtcMounterSource = fs.readFileSync(
  new URL("../src/features/live/go2rtc-mounter.js", import.meta.url),
  "utf8",
);
const haDirectMounterSource = fs.readFileSync(
  new URL("../src/features/live/ha-direct-mounter.js", import.meta.url),
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
const liveMountControllerSource = fs.readFileSync(
  new URL("../src/features/live/mount-controller.js", import.meta.url),
  "utf8",
);
const gridMediaControllerSource = fs.readFileSync(
  new URL("../src/features/grid/media.ctrl.js", import.meta.url),
  "utf8",
);
const previewPageControllerSource = fs.readFileSync(
  new URL("../src/features/preview/page.ctrl.js", import.meta.url),
  "utf8",
);
const editorPreviewContextControllerSource = fs.readFileSync(
  new URL("../src/features/editor-preview/context.ctrl.js", import.meta.url),
  "utf8",
);
const cardStyleContextControllerSource = fs.readFileSync(
  new URL("../src/features/card-style/context.ctrl.js", import.meta.url),
  "utf8",
);
const editorSource = fs.readFileSync(
  new URL("../src/editor/FrigateViewCardEditor.js", import.meta.url),
  "utf8",
);

test("no legacy var declarations remain", () => {
  assert.equal(/\bvar\s+[A-Za-z_$]/.test(source), false);
});

test("no .then chains remain after async/await refactor", () => {
  assert.equal(/\.then\(/.test(source), false);
});

test("live mount attempts pass the target entity through strategy start", () => {
  assert.equal(
    /attempt\.start\(\{\s*abortSignal,\s*entity\s*\}\)/.test(
      go2rtcRaceMounterSource,
    ),
    true,
  );
});

test("go2rtc ownership is pulled out of the card shell", () => {
  assert.equal(
    /_shouldUseGo2RtcForEntity\(entity\) \{[\s\S]*?_cameraConnectionType\(key\) !== "ha_direct";[\s\S]*?\}/.test(
      cardSource,
    ),
    true,
  );
  assert.equal(
    cardSource.includes(
      'import { createGo2RtcResolver } from "../integrations/frigate/go2rtc-resolver.js";',
    ),
    true,
  );
  assert.equal(
    /this\._go2rtcResolver\s*=\s*createGo2RtcResolver\(/.test(cardSource),
    true,
  );
  assert.equal(
    cardSource.includes(
      'import { createGo2RtcMounter } from "../features/live/go2rtc-mounter.js";',
    ),
    true,
  );
  assert.equal(
    /this\._go2rtcMounter\s*=\s*createGo2RtcMounter\(/.test(cardSource),
    true,
  );
  assert.equal(
    cardSource.includes(
      'import { createHaDirectMounter } from "../features/live/ha-direct-mounter.js";',
    ),
    true,
  );
  assert.equal(
    /this\._haDirectMounter\s*=\s*createHaDirectMounter\(/.test(cardSource),
    true,
  );
  assert.equal(
    cardSource.includes(
      'import { createGo2RtcRaceMounter } from "../features/live/go2rtc-race-mounter.js";',
    ),
    true,
  );
  assert.equal(
    /this\._go2rtcRaceMounter\s*=\s*createGo2RtcRaceMounter\(/.test(cardSource),
    true,
  );
  assert.equal(
    cardSource.includes(
      'import { createMseGraceController } from "../features/live/mse-grace-controller.js";',
    ),
    true,
  );
  assert.equal(
    cardSource.includes(
      'import { createLiveMountController } from "../features/live/mount-controller.js";',
    ),
    true,
  );
  assert.equal(
    /this\._mseGraceController\s*=\s*createMseGraceController\(\{/.test(
      cardSource,
    ),
    true,
  );
  assert.equal(
    /this\._liveMountController\s*=\s*createLiveMountController\(\{/.test(
      cardSource,
    ),
    true,
  );
  assert.equal(cardSource.includes("_go2rtcWsUrlCache"), false);
  assert.equal(cardSource.includes("_go2rtcHlsUrlCache"), false);
  assert.equal(cardSource.includes("_go2rtcWsUrlInFlight"), false);
  assert.equal(cardSource.includes("_go2rtcHlsProbeInFlight"), false);
  assert.equal(cardSource.includes("_go2rtcMountRequest("), false);
  assert.equal(cardSource.includes("_go2rtcTransportStateForEntity("), false);
  assert.equal(cardSource.includes("_probeGo2RtcHlsCandidates("), false);
  assert.equal(cardSource.includes("_signedGo2RtcWsPath("), false);
  assert.equal(cardSource.includes("_go2rtcWebSocketUrlForEntity("), false);
  assert.equal(cardSource.includes("_go2rtcHlsUrlForEntity("), false);
  assert.equal(cardSource.includes("_go2rtcCodecs("), false);
  assert.equal(cardSource.includes("_normalizeGo2RTCCodecs("), false);
  assert.equal(cardSource.includes("_startFirefoxLiveCatchup("), false);
  assert.equal(cardSource.includes("_tryMountGo2RTCMSE("), false);
  assert.equal(cardSource.includes("_tryMountGo2RTCWebRTC("), false);
  assert.equal(cardSource.includes("_tryMountGo2RTCHLS("), false);
  assert.equal(cardSource.includes("_tryMountHaDirect("), false);
  assert.equal(cardSource.includes("_buildLiveStreamAttempts("), false);
  assert.equal(cardSource.includes("_mountLiveWithRace("), false);
  assert.equal(cardSource.includes("_scheduleHaDirectMountFollowUp("), false);
  assert.equal(cardSource.includes("_mseGracePool = new Map()"), false);
  assert.equal(cardSource.includes("_evictGraceMseEntry("), false);
  assert.equal(cardSource.includes("_trimGraceMsePool("), false);
  assert.equal(cardSource.includes("_stashMseEngineForGrace("), false);
  assert.equal(cardSource.includes("_stashPendingMsePromiseForGrace("), false);
  assert.equal(cardSource.includes("_takeGraceMseEntry("), false);
  assert.equal(cardSource.includes("_ensureMseGraceHost("), false);
  assert.equal(cardSource.includes("_adoptGraceMseEngine("), false);
  assert.equal(cardSource.includes("_cleanupEngineWithOptions("), false);
  assert.equal(cardSource.includes("_beginMountTracking("), false);
  assert.equal(cardSource.includes("_clearMountTrackingIfCurrent("), false);
  assert.equal(cardSource.includes("_onMountWatchdogTimeout("), false);
  assert.equal(cardSource.includes("_applyLiveMountUiState("), false);
  assert.equal(cardSource.includes("_applySnapshotFallbackState("), false);
  assert.equal(cardSource.includes("_beginLiveMountSession("), false);
  assert.equal(cardSource.includes("_streamAttemptSlot("), false);
  assert.equal(cardSource.includes("_adoptMountedAttempt("), false);
  assert.equal(go2rtcResolverSource.includes("GO2RTC_CACHE_TTL_MS"), true);
  assert.equal(
    go2rtcResolverSource.includes("buildSignedGo2RtcWebSocketUrl"),
    true,
  );
  assert.equal(
    go2rtcResolverSource.includes("rewriteSignedHlsManifestSource"),
    true,
  );
  assert.equal(
    go2rtcResolverSource.includes("buildGo2RtcHlsProbeResult"),
    true,
  );
  assert.equal(go2rtcResolverSource.includes("buildGo2rtcWsPath"), true);
  assert.equal(go2rtcResolverSource.includes("buildGo2rtcHlsCandidates"), true);
  assert.equal(
    frigateBootstrapSource.includes("../../features/live/url-provider.js"),
    false,
  );
  assert.equal(
    go2rtcMounterSource.includes("export function createGo2RtcMounter"),
    true,
  );
  assert.equal(
    go2rtcMounterSource.includes("resolver.resolveMountRequest(options)"),
    true,
  );
  assert.equal(
    go2rtcMounterSource.includes("resolver.websocketUrlForEntity(entity)"),
    true,
  );
  assert.equal(
    go2rtcMounterSource.includes("resolver.hlsUrlForEntity(entity)"),
    true,
  );
  assert.equal(
    haDirectMounterSource.includes("export function createHaDirectMounter"),
    true,
  );
  assert.equal(haDirectMounterSource.includes("buildHaDirectMountPlan"), true);
  assert.equal(
    haDirectMounterSource.includes("createHaCameraStreamElement"),
    true,
  );
  assert.equal(
    go2rtcRaceMounterSource.includes("export function createGo2RtcRaceMounter"),
    true,
  );
  assert.equal(go2rtcRaceMounterSource.includes("buildLiveAttemptPlan"), true);
  assert.equal(
    go2rtcRaceMounterSource.includes("new StreamOrchestrator"),
    true,
  );
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
    go2rtcRaceMounterSource.includes("function createAttemptSlot"),
    true,
  );
  assert.equal(
    mseGraceControllerSource.includes("splitPendingDestroyersByGraceMse"),
    true,
  );
  assert.equal(
    mseGraceControllerSource.includes("const mseGracePool = new Map()"),
    true,
  );
  assert.equal(
    liveMountControllerSource.includes(
      "export function createLiveMountController",
    ),
    true,
  );
  assert.equal(
    liveMountControllerSource.includes("resolveLiveMountEntryAction"),
    true,
  );
  assert.equal(
    liveMountControllerSource.includes("resolveLiveMountTransportPlan"),
    true,
  );
  assert.equal(
    liveMountControllerSource.includes("createGracePendingMountDestroyer"),
    true,
  );
  assert.equal(liveMountControllerSource.includes("beginMountTracking"), true);
  assert.equal(
    liveMountControllerSource.includes("clearMountTrackingIfCurrent"),
    true,
  );
  assert.equal(
    liveMountControllerSource.includes("applyMountWatchdogTimeout"),
    true,
  );
  assert.equal(
    liveMountControllerSource.includes("shouldRunMountWatchdog"),
    true,
  );
  assert.equal(
    liveMountControllerSource.includes("resolveLiveMountUiState"),
    true,
  );
  assert.equal(
    liveMountControllerSource.includes("resolveSnapshotFallbackState"),
    true,
  );
  assert.equal(
    /adoptMountedAttempt:\s*\(slot, winner\)\s*=>\s*adoptMountedAttemptResult\(/.test(
      cardSource,
    ),
    true,
  );
  assert.equal(cardSource.includes("adoptMountedAttemptResult"), true);
  assert.equal(frigateUrlSource.includes("buildGo2rtcWsPath"), true);
  assert.equal(sharedUrlSource.includes("toAbsoluteSignedUrl"), true);
  assert.equal(
    cardSource.includes(
      'import { GridMediaController } from "../features/grid/media.ctrl.js";',
    ),
    true,
  );
  assert.equal(
    /this\._gridMediaController\s*=\s*new GridMediaController\(this,/.test(
      cardSource,
    ),
    true,
  );
  assert.equal(cardSource.includes("_mountGridCameraCellMedia("), false);
  assert.equal(cardSource.includes("_mountGridDirectMSECell("), false);
  assert.equal(cardSource.includes("_mountGridEngine("), false);
  assert.equal(cardSource.includes("_gridPageCameraIndices("), false);
  assert.equal(cardSource.includes("_scheduleDeferredWebRtcTakeover("), false);
  assert.equal(
    /_mountGridCameraCellMedia\([\s\S]*?liveStreamHint === "mse" &&[\s\S]*?_host\._shouldUseGo2RtcForEntity\(entity\)/.test(
      gridMediaControllerSource,
    ),
    true,
  );
  assert.equal(
    gridMediaControllerSource.includes("createHaCameraStreamElement"),
    true,
  );
  assert.equal(
    /_mountEngine\([\s\S]*?return this\._liveMountController\.mount\(\{[\s\S]*?entity: this\._activeCam\?\.entity \|\| ""/.test(
      cardSource,
    ),
    true,
  );
  assert.equal(
    go2rtcRaceMounterSource.includes(
      "const connectionType = resolveConnectionType(targetEntity);",
    ),
    true,
  );
  assert.equal(
    /mount\s*=\s*async\s*\(\{[\s\S]*?go2rtcRaceMounter\.mountWithRace\(\{[\s\S]*?entity:\s*targetEntity,[\s\S]*?forcedType,[\s\S]*?mountToken,[\s\S]*?\}\)/.test(
      liveMountControllerSource,
    ),
    true,
  );
  assert.equal(
    /mount\s*=\s*async\s*\(\{[\s\S]*?haDirectMounter\.tryMount\([\s\S]*?streamType: transportPlan\.streamType/.test(
      liveMountControllerSource,
    ),
    true,
  );
  assert.equal(
    /mount\s*=\s*async\s*\(\{[\s\S]*?const \{ mountToken, clearMountState \} = beginLiveMountSession\(targetEntity\);[\s\S]*?finally \{[\s\S]*?clearMountState\(\);[\s\S]*?\}/.test(
      liveMountControllerSource,
    ),
    true,
  );
  assert.equal(
    /const beginLiveMountSession = \(entity\) => \{[\s\S]*?beginMountTracking\([\s\S]*?setTimeout\([\s\S]*?onMountWatchdogTimeout\(mountToken\)/.test(
      liveMountControllerSource,
    ),
    true,
  );
});

test("event list thumbnails use browser lazy loading", () => {
  assert.equal((source.match(/loading="lazy"/g) || []).length >= 3, true);
});

test("window loads use loading-state guard", () => {
  assert.equal(/if \(this\._loading\) return;/.test(source), true);
  assert.equal(/this\._loading = true;/.test(source), true);
});

test("startup resolves initial page through the navigation factory", () => {
  const initialLoadIndex = source.indexOf(
    "const initialLoad = this._loadWindow(true);",
  );
  const landingPageIndex = source.indexOf(
    'this._navigateToConfiguredLandingPage({\n      source: "startup",\n      startup: true,\n      startInGrid,\n      hasPendingDeepLinkTarget: this._hasPendingDeepLinkTarget()\n    });',
  );

  assert.ok(initialLoadIndex >= 0);
  assert.ok(landingPageIndex > initialLoadIndex);
  assert.equal(
    source.includes(
      "_consumeDeepLinkReviewOpen() {\n    this._deepLinkController.consumeDeepLinkReviewOpen();\n  }",
    ),
    true,
  );
  assert.equal(
    source.includes(
      "_hasPendingDeepLinkTarget() {\n    return this._deepLinkController.hasPendingDeepLinkTarget();\n  }",
    ),
    true,
  );
  assert.equal(
    source.includes(
      "_isDeepLinkHandlingEnabled() {\n    return this._deepLinkController.isDeepLinkHandlingEnabled();\n  }",
    ),
    true,
  );
});

test("single-view helpers delegate through the controller wrappers", () => {
  assert.equal(
    /_activateSingleViewPageRoute\(context = \{\}\) \{\s*this\._singleViewPageController\.activateSingleViewPageRoute\(context\);\s*\}/s.test(
      source,
    ),
    true,
  );
  assert.equal(
    /_activateWideViewPageRoute\(context = \{\}\) \{\s*this\._wideViewPageController\.activateWideViewPageRoute\(context\);\s*\}/s.test(
      source,
    ),
    true,
  );
});

test("preview helpers delegate through the preview page controller", () => {
  assert.equal(
    source.includes(
      "_isPreviewPageEnabled() {\n    return this._previewPageController.isPreviewPageEnabled();\n  }",
    ),
    true,
  );
  assert.equal(
    source.includes(
      "_isPreviewPageActive() {\n    return this._previewPageController.isPreviewPageActive();\n  }",
    ),
    true,
  );
  assert.equal(
    source.includes(
      "_previewLiveCamerasEnabled() {\n    return this._previewPageController.previewLiveCamerasEnabled();\n  }",
    ),
    true,
  );
  assert.equal(
    source.includes(
      "_previewShowTitleBarsEnabled() {\n    return this._previewPageController.previewShowTitleBarsEnabled();\n  }",
    ),
    true,
  );
  assert.equal(
    source.includes(
      "_previewCellSeverity(entity) {\n    return this._previewPageController.previewCellSeverity(entity);\n  }",
    ),
    true,
  );
  assert.equal(
    /_applyPreviewShellVisibility\(\) \{\s*if \(this\._isPreviewPageEnabled\(\) && this\._isPreviewPageActive\(\)\) \{\s*this\._ensurePreviewLayoutShell\(\);\s*\} else \{\s*this\._removePreviewLayoutShell\(\);\s*\}\s*this\._previewPageController\.applyPreviewShellVisibility\(\);\s*\}/s.test(
      source,
    ),
    true,
  );
  assert.equal(
    source.includes(
      "_previewShouldUseLive(entity) {\n    return this._previewPageController.previewShouldUseLive(entity);\n  }",
    ),
    true,
  );
  assert.equal(
    source.includes(
      "_previewEventsCount(entity) {\n    return this._previewPageController.previewEventsCount(entity);\n  }",
    ),
    true,
  );
  assert.equal(
    source.includes(
      "_previewLiveStreamHint() {\n    return this._previewPageController.previewLiveStreamHint();\n  }",
    ),
    true,
  );
  assert.equal(
    /_previewStreamSourceLabel\(entity, useLive\) \{\s*return this\._previewPageController\.previewStreamSourceLabel\(\s*entity,\s*useLive\s*\);\s*\}/s.test(
      source,
    ),
    true,
  );
  assert.equal(
    /mountPreviewMedia\(\) \{[\s\S]*?_host\._gridMediaController\.mountCameraCellMedia\(/.test(
      previewPageControllerSource,
    ),
    true,
  );
});

test("editor preview helpers delegate through the context controller", () => {
  assert.equal(
    cardSource.includes(
      'import { EditorPreviewContextController } from "../features/editor-preview/context.ctrl.js";',
    ),
    true,
  );
  assert.equal(
    /this\._editorPreviewController\s*=\s*new EditorPreviewContextController\(this\);/.test(
      cardSource,
    ),
    true,
  );
  assert.equal(cardSource.includes("_editModeWatchdogT = setInterval("), false);
  assert.equal(
    cardSource.includes("this._editorDialogObserver = new MutationObserver("),
    false,
  );
  assert.equal(
    cardSource.includes(
      "_lastEditorPreviewContext = this._isEditorPreviewContext()",
    ),
    false,
  );
  assert.equal(
    /_startEditModeWatchdog\(\) \{\s*this\._editorPreviewController\.startEditModeWatchdog\(\);\s*\}/s.test(
      cardSource,
    ),
    true,
  );
  assert.equal(
    /_isPreviewContext\(\) \{\s*return this\._editorPreviewController\.isPreviewContext\(\);\s*\}/s.test(
      cardSource,
    ),
    true,
  );
  assert.equal(
    /this\._editorPreviewController\.syncHassPreviewContext\(\);/.test(
      cardSource,
    ),
    true,
  );
  assert.equal(
    editorPreviewContextControllerSource.includes(
      "export class EditorPreviewContextController",
    ),
    true,
  );
  assert.equal(
    editorPreviewContextControllerSource.includes("startEditModeWatchdog()"),
    true,
  );
  assert.equal(
    editorPreviewContextControllerSource.includes(
      "startEditorDialogCloseObserver()",
    ),
    true,
  );
  assert.equal(
    editorPreviewContextControllerSource.includes("syncHassPreviewContext()"),
    true,
  );
});

test("card style helpers delegate through the style context controller", () => {
  assert.equal(
    cardSource.includes(
      'import { CardStyleContextController } from "../features/card-style/context.ctrl.js";',
    ),
    true,
  );
  assert.equal(
    /this\._cardStyleController\s*=\s*new CardStyleContextController\(this\);/.test(
      cardSource,
    ),
    true,
  );
  assert.equal(
    cardSource.includes("const outerShadow = this._resolveCardTokenForHost("),
    false,
  );
  assert.equal(
    cardSource.includes(
      "const tightMarginsEnabled = this._config?.tight_margins === true;",
    ),
    false,
  );
  assert.equal(
    /_cardStateClassNames\(\) \{\s*return this\._cardStyleController\.cardStateClassNames\(\);\s*\}/s.test(
      cardSource,
    ),
    true,
  );
  assert.equal(
    /_syncVisualStyleToggles\(\) \{\s*this\._cardStyleController\.syncVisualStyleToggles\(\);\s*\}/s.test(
      cardSource,
    ),
    true,
  );
  assert.equal(
    /_applyTightMargins\(\) \{\s*this\._cardStyleController\.applyTightMargins\(\);\s*\}/s.test(
      cardSource,
    ),
    true,
  );
  assert.equal(
    cardStyleContextControllerSource.includes(
      "export class CardStyleContextController",
    ),
    true,
  );
  assert.equal(
    cardStyleContextControllerSource.includes("syncHostOuterStyles()"),
    true,
  );
  assert.equal(
    cardStyleContextControllerSource.includes("applyTightMargins()"),
    true,
  );
  assert.equal(
    cardStyleContextControllerSource.includes("isPanelView()"),
    true,
  );
});

test("editor stylesheet keeps core config surface variables intact", () => {
  assert.equal(
    /:host\s*\{[\s\S]*?--editor-card-bg: var\(--card-background-color\);/.test(
      editorSource,
    ),
    true,
  );
  assert.equal(
    /:host\s*\{[\s\S]*?--editor-border: var\(--divider-color\);/.test(
      editorSource,
    ),
    true,
  );
  assert.equal(
    /:host\s*\{[\s\S]*?--editor-icon: var\(--icon-color, var\(--secondary-text-color\)\);/.test(
      editorSource,
    ),
    true,
  );
  assert.equal(
    /:host\s*\{[\s\S]*?--c-bg-panel: var\(--editor-card-bg\);/.test(
      editorSource,
    ),
    true,
  );
  assert.equal(
    editorSource.includes("background:var(--editor-card-bg);"),
    true,
  );
  assert.equal(
    editorSource.includes("background:var(--editor-secondary-bg);"),
    true,
  );
  assert.equal(
    editorSource.includes("background:var(--editor-primary);"),
    true,
  );
});
