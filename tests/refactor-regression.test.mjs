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
const browseListTemplateSource = fs.readFileSync(
  new URL("../src/features/browse/list.tmpl.js", import.meta.url),
  "utf8",
);
const browseRenderControllerSource = fs.readFileSync(
  new URL("../src/features/browse/render.ctrl.js", import.meta.url),
  "utf8",
);
const mobileViewPageTemplateSource = fs.readFileSync(
  new URL("../src/features/mobile-view/page.tmpl.js", import.meta.url),
  "utf8",
);
const singleViewPageTemplateSource = fs.readFileSync(
  new URL("../src/features/single-view/page.tmpl.js", import.meta.url),
  "utf8",
);
const singleViewPageControllerSource = fs.readFileSync(
  new URL("../src/features/single-view/page.ctrl.js", import.meta.url),
  "utf8",
);
const mobileViewPageControllerSource = fs.readFileSync(
  new URL("../src/features/mobile-view/page.ctrl.js", import.meta.url),
  "utf8",
);
const wideViewPageTemplateSource = fs.readFileSync(
  new URL("../src/features/wide-view/page.tmpl.js", import.meta.url),
  "utf8",
);
const pageShellRegistrySource = fs.readFileSync(
  new URL("../src/features/navigation/page-shell-registry.js", import.meta.url),
  "utf8",
);
const shellNavTemplateSource = fs.readFileSync(
  new URL("../src/card/controls/shell-nav.tmpl.js", import.meta.url),
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
const sharedMediaControlsSource = fs.readFileSync(
  new URL("../src/shared/media/controls.js", import.meta.url),
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
const previewPageTemplateSource = fs.readFileSync(
  new URL("../src/features/preview/page.tmpl.js", import.meta.url),
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
const viewportContextControllerSource = fs.readFileSync(
  new URL("../src/features/viewport/context.ctrl.js", import.meta.url),
  "utf8",
);
const browseCalendarActivityControllerSource = fs.readFileSync(
  new URL("../src/features/browse/calendar-activity.ctrl.js", import.meta.url),
  "utf8",
);
const browseCalendarPanelControllerSource = fs.readFileSync(
  new URL("../src/features/browse/calendar-panel.ctrl.js", import.meta.url),
  "utf8",
);
const browseCollectionControllerSource = fs.readFileSync(
  new URL("../src/features/browse/collection.ctrl.js", import.meta.url),
  "utf8",
);
const browseFilterControllerSource = fs.readFileSync(
  new URL("../src/features/browse/filter-state.js", import.meta.url),
  "utf8",
);
const browseTabDataControllerSource = fs.readFileSync(
  new URL("../src/features/browse/tab-data.ctrl.js", import.meta.url),
  "utf8",
);
const browseWindowLoaderControllerSource = fs.readFileSync(
  new URL("../src/features/browse/window-loader.ctrl.js", import.meta.url),
  "utf8",
);
const recordingsBrowseNavControllerSource = fs.readFileSync(
  new URL("../src/features/recordings/browse-nav.ctrl.js", import.meta.url),
  "utf8",
);
const recordingsSwipeControllerSource = fs.readFileSync(
  new URL("../src/features/recordings/swipe.ctrl.js", import.meta.url),
  "utf8",
);
const popupMediaLoaderControllerSource = fs.readFileSync(
  new URL("../src/features/popup/media-loader.ctrl.js", import.meta.url),
  "utf8",
);
const popupMediaSource = fs.readFileSync(
  new URL("../src/features/popup/media.js", import.meta.url),
  "utf8",
);
const navigationRouterSource = fs.readFileSync(
  new URL("../src/features/navigation/router.js", import.meta.url),
  "utf8",
);
const navigationPageControllerSource = fs.readFileSync(
  new URL(
    "../src/features/navigation/page-navigation.ctrl.js",
    import.meta.url,
  ),
  "utf8",
);
const deepLinkControllerSource = fs.readFileSync(
  new URL("../src/features/navigation/deep-link.ctrl.js", import.meta.url),
  "utf8",
);
const ptzFeatureSource = fs.readFileSync(
  new URL("../src/features/ptz/index.js", import.meta.url),
  "utf8",
);
const editorSource = fs.readFileSync(
  new URL("../src/editor/FrigateViewCardEditor.js", import.meta.url),
  "utf8",
);

test("no legacy var declarations remain", () => {
  assert.equal(/\bvar\s+[A-Za-z_$]/.test(source), false);
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
    /_mountGridCameraCellMedia\([\s\S]*?_host\._shouldUseGo2RtcForEntity\(entity\)[\s\S]*?_mountGridGo2RtcCell/.test(
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
  assert.equal(
    /if \(this\._host\._loading\) return;/.test(
      browseWindowLoaderControllerSource,
    ),
    true,
  );
  assert.equal(
    /this\._host\._loading = true;/.test(browseWindowLoaderControllerSource),
    true,
  );
});

test("startup resolves initial page through the navigation factory", () => {
  const prepareShellIndex = cardSource.indexOf(
    "this._pageNavigationController.prepareConfiguredLandingPageShell({",
  );
  const discoverIndex = cardSource.indexOf("await this._discoverAll();");
  const initialLoadIndex = cardSource.indexOf(
    "const initialLoad = this._browseWindowLoaderController.loadWindow(true);",
  );
  const landingPageIndex = cardSource.search(
    /this\._pageNavigationController\.navigateToConfiguredLandingPage\([\s\S]*?source:\s*"startup"[\s\S]*?startup:\s*true[\s\S]*?startInGrid,[\s\S]*?hasPendingDeepLinkTarget:[\s\S]*?this\._deepLinkController\.hasPendingDeepLinkTarget\(\)/,
  );

  assert.ok(prepareShellIndex >= 0);
  assert.ok(discoverIndex > prepareShellIndex);
  assert.ok(initialLoadIndex >= 0);
  assert.ok(landingPageIndex > initialLoadIndex);
  assert.equal(
    cardSource.includes(
      "this._deepLinkController.consumeDeepLinkReviewOpen();",
    ),
    true,
  );
  assert.equal(
    cardSource.includes("this._deepLinkController.consumeDeepLinkEventOpen();"),
    true,
  );
  assert.equal(
    cardSource.includes("this._deepLinkController.isDeepLinkHandlingEnabled()"),
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
  assert.equal(cardSource.includes("_previewLiveCamerasEnabled() {"), false);
  assert.equal(cardSource.includes("_previewShowTitleBarsEnabled() {"), false);
  assert.equal(cardSource.includes("_previewCellSeverity(entity) {"), false);
  assert.equal(
    /_applyPreviewShellVisibility\(\) \{\s*if \(this\._isPreviewPageEnabled\(\) && this\._isPreviewPageActive\(\)\) \{\s*this\._ensurePreviewLayoutShell\(\);\s*\} else \{\s*this\._removePreviewLayoutShell\(\);\s*\}\s*this\._previewPageController\.applyPreviewShellVisibility\(\);\s*\}/s.test(
      source,
    ),
    true,
  );
  assert.equal(cardSource.includes("_previewShouldUseLive(entity) {"), false);
  assert.equal(cardSource.includes("_previewEventsCount(entity) {"), false);
  assert.equal(cardSource.includes("_previewLiveStreamHint() {"), false);
  assert.equal(
    cardSource.includes("_previewStreamSourceLabel(entity, useLive) {"),
    false,
  );
  assert.equal(cardSource.includes("_pageNavMarkup() {"), false);
  assert.equal(
    cardSource.includes("_navigateToPageRoute(pageId, context = {}) {"),
    false,
  );
  assert.equal(
    /mountPreviewMedia\(\) \{[\s\S]*?_host\._gridMediaController\.mountCameraCellMedia\(/.test(
      previewPageControllerSource,
    ),
    true,
  );
  assert.equal(
    previewPageControllerSource.includes(
      "../../card/controls/shell-nav.tmpl.js",
    ),
    false,
  );
  assert.equal(
    previewPageTemplateSource.includes(
      "export function buildPreviewShellHeaderMarkup",
    ),
    true,
  );
  assert.equal(
    previewPageTemplateSource.includes(
      "export function buildPreviewLayoutShellMarkup",
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
    /_applyCardStyle\(\) \{\s*this\._cardStyleController\.applyCardStyle\(\);\s*\}/s.test(
      cardSource,
    ),
    true,
  );
  assert.equal(cardSource.includes("const customTheme ="), false);
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
    cardStyleContextControllerSource.includes("applyCardStyle()"),
    true,
  );
  assert.equal(
    cardStyleContextControllerSource.includes("isPanelView()"),
    true,
  );
});

test("viewport helpers delegate through the viewport context controller", () => {
  assert.equal(
    cardSource.includes(
      'import { ViewportContextController } from "../features/viewport/context.ctrl.js";',
    ),
    true,
  );
  assert.equal(
    /this\._viewportContextController\s*=\s*new ViewportContextController\(this\);/.test(
      cardSource,
    ),
    true,
  );
  assert.equal(
    /_isMobilePhoneViewport\(\) \{\s*const width = Number\(this\._cardWidth \|\| window\.innerWidth \|\| 0\);/.test(
      cardSource,
    ),
    false,
  );
  assert.equal(
    /_isMobileTabletViewport\(\) \{\s*const coarse =/.test(cardSource),
    false,
  );
  assert.equal(
    /_isCardVisible\(\) \{\s*return this\._viewportContextController\.isCardVisible\(\);\s*\}/s.test(
      cardSource,
    ),
    true,
  );
  assert.equal(
    /_isMobilePhoneViewport\(\) \{\s*return this\._viewportContextController\.isMobilePhoneViewport\(\);\s*\}/s.test(
      cardSource,
    ),
    true,
  );
  assert.equal(
    /_isMobileTabletViewport\(\) \{\s*return this\._viewportContextController\.isMobileTabletViewport\(\);\s*\}/s.test(
      cardSource,
    ),
    true,
  );
  assert.equal(
    /_isLandscapeViewport\(\) \{\s*return this\._viewportContextController\.isLandscapeViewport\(\);\s*\}/s.test(
      cardSource,
    ),
    true,
  );
  assert.equal(
    viewportContextControllerSource.includes(
      "export class ViewportContextController",
    ),
    true,
  );
  assert.equal(
    viewportContextControllerSource.includes("isCardVisible()"),
    true,
  );
  assert.equal(
    viewportContextControllerSource.includes("isMobileTabletViewport()"),
    true,
  );
});

test("browse calendar activity helpers delegate through the browse calendar activity controller", () => {
  assert.equal(
    cardSource.includes(
      'import { BrowseCalendarActivityController } from "../features/browse/calendar-activity.ctrl.js";',
    ),
    true,
  );
  assert.equal(
    /this\._browseCalendarActivityController\s*=\s*new BrowseCalendarActivityController\(this\);/.test(
      cardSource,
    ),
    true,
  );
  assert.equal(
    /async _loadCalendar\(\) \{\s*await this\._browseCalendarActivityController\.loadCalendar\(\);\s*\}/s.test(
      cardSource,
    ),
    true,
  );
  assert.equal(
    /_calendarActivityCacheKey\(clientId, cam, tz = this\._tz\(\)\) \{\s*return this\._browseCalendarActivityController\.calendarActivityCacheKey\(/s.test(
      cardSource,
    ),
    true,
  );
  assert.equal(
    /_applyCalendarActivityCacheForActiveCamera\(\) \{\s*this\._browseCalendarActivityController\.applyCalendarActivityCacheForActiveCamera\(\);\s*\}/s.test(
      cardSource,
    ),
    true,
  );
  assert.equal(
    /async _prefetchCalendarActivityForActiveCamera\(\) \{\s*await this\._browseCalendarActivityController\.prefetchCalendarActivityForActiveCamera\(\);\s*\}/s.test(
      cardSource,
    ),
    true,
  );
  assert.equal(
    browseCalendarActivityControllerSource.includes(
      "export class BrowseCalendarActivityController",
    ),
    true,
  );
  assert.equal(
    browseCalendarActivityControllerSource.includes(
      "async prefetchCalendarActivityForActiveCamera()",
    ),
    true,
  );
});

test("browse calendar panel helpers delegate through the browse calendar panel controller", () => {
  assert.equal(
    cardSource.includes(
      'import { BrowseCalendarPanelController } from "../features/browse/calendar-panel.ctrl.js";',
    ),
    true,
  );
  assert.equal(
    /this\._browseCalendarPanelController\s*=\s*new BrowseCalendarPanelController\(\s*this,\s*\{/.test(
      cardSource,
    ),
    true,
  );
  assert.equal(
    /_handleSidebarCalendarClick\(target\) \{\s*return this\._browseCalendarPanelController\.handleSidebarCalendarClick\(/s.test(
      cardSource,
    ),
    true,
  );
  assert.equal(
    /_toggleCal\(\) \{\s*this\._browseCalendarPanelController\.toggleCalendar\(\);\s*\}/s.test(
      cardSource,
    ),
    true,
  );
  assert.equal(
    /_formatTzDateString\(parts\) \{\s*return this\._browseCalendarPanelController\.formatTzDateString\(parts\);\s*\}/s.test(
      cardSource,
    ),
    true,
  );
  assert.equal(
    /_calendarTodayDateString\(\) \{\s*return this\._browseCalendarPanelController\.calendarTodayDateString\(\);\s*\}/s.test(
      cardSource,
    ),
    true,
  );
  assert.equal(
    /_activeCalendarDayDateString\(\) \{\s*return this\._browseCalendarPanelController\.activeCalendarDayDateString\(\);\s*\}/s.test(
      cardSource,
    ),
    true,
  );
  assert.equal(
    /_goTodayInCalendar\(\) \{\s*this\._browseCalendarPanelController\.goTodayInCalendar\(\);\s*\}/s.test(
      cardSource,
    ),
    true,
  );
  assert.equal(
    /_createCalendarMonthDate\(year, monthIndex\) \{\s*return this\._browseCalendarPanelController\.createCalendarMonthDate\(/s.test(
      cardSource,
    ),
    true,
  );
  assert.equal(
    /_resolveCalendarMonthDate\(\) \{\s*return this\._browseCalendarPanelController\.resolveCalendarMonthDate\(\);\s*\}/s.test(
      cardSource,
    ),
    true,
  );
  assert.equal(
    /_calNav\(d\) \{\s*this\._browseCalendarPanelController\.calNav\(d\);\s*\}/s.test(
      cardSource,
    ),
    true,
  );
  assert.equal(
    /_pickDay\(ds\) \{\s*this\._browseCalendarPanelController\.pickDay\(ds\);\s*\}/s.test(
      cardSource,
    ),
    true,
  );
  assert.equal(
    /_renderCal\(\) \{\s*this\._browseCalendarPanelController\.renderCal\(\);\s*\}/s.test(
      cardSource,
    ),
    true,
  );
  assert.equal(
    browseCalendarPanelControllerSource.includes(
      "export class BrowseCalendarPanelController",
    ),
    true,
  );
  assert.equal(
    browseCalendarPanelControllerSource.includes("toggleCalendar()"),
    true,
  );
  assert.equal(
    browseCalendarPanelControllerSource.includes("pickDay(dateString)"),
    true,
  );
  assert.equal(
    browseCalendarPanelControllerSource.includes("renderCal()"),
    true,
  );
});

test("browse collection helpers delegate through the browse collection controller", () => {
  assert.equal(
    cardSource.includes(
      'import { BrowseCollectionController } from "../features/browse/collection.ctrl.js";',
    ),
    true,
  );
  assert.equal(
    /this\._browseCollectionController\s*=\s*new BrowseCollectionController\(this\);/.test(
      cardSource,
    ),
    true,
  );
  assert.equal(
    /_allGridReviews\(\) \{\s*return this\._browseCollectionController\.allGridReviews\(\);\s*\}/s.test(
      cardSource,
    ),
    true,
  );
  assert.equal(
    /_allGridKeptEvents\(\) \{\s*return this\._browseCollectionController\.allGridKeptEvents\(\);\s*\}/s.test(
      cardSource,
    ),
    true,
  );
  assert.equal(
    /_findReviewById\(id\) \{\s*return this\._browseCollectionController\.findReviewById\(id\);\s*\}/s.test(
      cardSource,
    ),
    true,
  );
  assert.equal(
    /async _loadGridMixedTabData\(tab\) \{\s*await this\._browseCollectionController\.loadGridMixedTabData\(tab\);\s*\}/s.test(
      cardSource,
    ),
    true,
  );
  assert.equal(
    /_allDisplayEvents\(\) \{\s*return this\._browseCollectionController\.allDisplayEvents\(\);\s*\}/s.test(
      cardSource,
    ),
    true,
  );
  assert.equal(
    /_findEventById\(id\) \{\s*return this\._browseCollectionController\.findEventById\(id\);\s*\}/s.test(
      cardSource,
    ),
    true,
  );
  assert.equal(
    browseCollectionControllerSource.includes(
      "export class BrowseCollectionController",
    ),
    true,
  );
  assert.equal(
    browseCollectionControllerSource.includes(
      "async loadGridMixedTabData(tab)",
    ),
    true,
  );
  assert.equal(
    browseCollectionControllerSource.includes("allDisplayEvents()"),
    true,
  );
});

test("browse filter helpers delegate through the browse filter controller", () => {
  assert.equal(
    cardSource.includes(
      'import { BrowseFilterController } from "../features/browse/filter-state.js";',
    ),
    true,
  );
  assert.equal(
    /this\._browseFilterController\s*=\s*new BrowseFilterController\(\s*this,\s*\{/.test(
      cardSource,
    ),
    true,
  );
  assert.equal(cardSource.includes("../shared/filter-state.js"), false);
  assert.equal(
    /_handleSidebarFilterClick\(target\) \{\s*return this\._browseFilterController\.handleSidebarFilterClick\(target\);\s*\}/s.test(
      cardSource,
    ),
    true,
  );
  assert.equal(
    /_toggleFilter\(\) \{\s*this\._browseFilterController\.toggleFilter\(\);\s*\}/s.test(
      cardSource,
    ),
    true,
  );
  assert.equal(
    /_renderFilter\(\) \{\s*this\._browseFilterController\.renderFilter\(\);\s*\}/s.test(
      cardSource,
    ),
    true,
  );
  assert.equal(cardSource.includes("_reviewSourceEvent(review) {"), false);
  assert.equal(cardSource.includes("_filteredReviews() {"), false);
  assert.equal(cardSource.includes("_filteredKept() {"), false);
  assert.equal(cardSource.includes("_normalizeFilterSelections() {"), false);
  assert.equal(cardSource.includes("_zones() {"), false);
  assert.equal(cardSource.includes("_labels() {"), false);
  assert.equal(cardSource.includes("_filtered() {"), false);
  assert.equal(
    browseFilterControllerSource.includes(
      "export class BrowseFilterController",
    ),
    true,
  );
  assert.equal(
    browseFilterControllerSource.includes("handleSidebarFilterClick(target)"),
    true,
  );
  assert.equal(browseFilterControllerSource.includes("toggleFilter()"), true);
  assert.equal(browseFilterControllerSource.includes("renderFilter()"), true);
  assert.equal(
    browseFilterControllerSource.includes(
      "export function selectFilteredEvents",
    ),
    true,
  );
});

test("browse tab data helpers delegate through the browse tab-data controller", () => {
  assert.equal(
    cardSource.includes(
      'import { BrowseTabDataController } from "../features/browse/tab-data.ctrl.js";',
    ),
    true,
  );
  assert.equal(
    /this\._browseTabDataController\s*=\s*new BrowseTabDataController\(this\);/.test(
      cardSource,
    ),
    true,
  );
  assert.equal(
    /async _loadKept\(\) \{\s*await this\._browseTabDataController\.loadKept\(\);\s*\}/s.test(
      cardSource,
    ),
    true,
  );
  assert.equal(
    /async _loadReviews\(\) \{\s*await this\._browseTabDataController\.loadReviews\(\);\s*\}/s.test(
      cardSource,
    ),
    true,
  );
  assert.equal(
    /async _loadTabData\(tab\) \{\s*await this\._browseTabDataController\.loadTabData\(tab\);\s*\}/s.test(
      cardSource,
    ),
    true,
  );
  assert.equal(
    browseTabDataControllerSource.includes(
      "export class BrowseTabDataController",
    ),
    true,
  );
  assert.equal(
    browseTabDataControllerSource.includes("async loadTabData(tab)"),
    true,
  );
  assert.equal(
    browseTabDataControllerSource.includes("async loadReviews()"),
    true,
  );
});

test("browse window loading delegates through the browse window loader controller", () => {
  assert.equal(
    cardSource.includes(
      'import { BrowseWindowLoaderController } from "../features/browse/window-loader.ctrl.js";',
    ),
    true,
  );
  assert.equal(
    /this\._browseWindowLoaderController\s*=\s*new BrowseWindowLoaderController\(this\);/.test(
      cardSource,
    ),
    true,
  );
  assert.equal(cardSource.includes("import { fetchWindowedItems }"), false);
  assert.equal(cardSource.includes("return fetchWindowedItems({"), false);
  assert.equal(cardSource.includes("async _fetchWindowedEvents("), false);
  assert.equal(cardSource.includes("async _warmOtherCamerasEvents() {"), false);
  assert.equal(
    cardSource.includes("_scheduleWarmOtherCamerasEvents(delayMs = 1000) {"),
    false,
  );
  assert.equal(
    cardSource.includes("_pruneNonActiveCamWindowCaches() {"),
    false,
  );
  assert.equal(cardSource.includes("async _loadWindow(replace) {"), false);
  assert.equal(
    cardSource.includes("_cacheActiveCamSlice(key, value) {"),
    false,
  );
  assert.equal(
    cardSource.includes(
      "async _loadWindowEvents(clientId, cam, after, before) {",
    ),
    false,
  );
  assert.equal(
    cardSource.includes("async _loadWindowRecordings(clientId, cam, before) {"),
    false,
  );
  assert.equal(
    cardSource.includes(
      "async _loadWindowReviewsIfNeeded(clientId, cam, after, before) {",
    ),
    false,
  );
  assert.equal(cardSource.includes("async _loadOlder() {"), false);
  assert.equal(
    browseWindowLoaderControllerSource.includes(
      "export class BrowseWindowLoaderController",
    ),
    true,
  );
  assert.equal(
    browseWindowLoaderControllerSource.includes("async loadWindow(replace)"),
    true,
  );
  assert.equal(
    browseWindowLoaderControllerSource.includes("async loadOlder()"),
    true,
  );
  assert.equal(browseWindowLoaderControllerSource.includes("goNow()"), true);
  assert.equal(
    browseWindowLoaderControllerSource.includes("resolveRecordingsDayBounds"),
    true,
  );
});

test("browse markup and DOM synchronization have separate owners", () => {
  assert.equal(cardSource.includes("standardPageListHeadingLabel("), false);
  assert.equal(cardSource.includes("renderStandardPageEventsContent("), false);
  for (const forbiddenMarkupDependency of [
    "_host",
    "_pageShellRegion",
    ".innerHTML =",
    ".style.",
    "../../card/controls/shell-nav.tmpl.js",
  ]) {
    assert.equal(
      browseListTemplateSource.includes(forbiddenMarkupDependency),
      false,
    );
  }
  for (const markupExport of [
    "export function buildBrowseEventsContentMarkup",
    "export function buildBrowseReviewsContentMarkup",
    "export function buildBrowseLegendMarkup",
  ]) {
    assert.equal(browseListTemplateSource.includes(markupExport), true);
  }
  assert.equal(
    browseRenderControllerSource.includes(
      "export class BrowseRenderController",
    ),
    true,
  );
  assert.equal(
    browseRenderControllerSource.includes("renderListLabel(timestamp = null)"),
    true,
  );
  assert.equal(
    browseRenderControllerSource.includes("syncBrowseHeadFromScroll()"),
    true,
  );
  assert.equal(
    browseRenderControllerSource.includes("renderLegend()"),
    true,
  );
  assert.equal(
    browseRenderControllerSource.includes("./list.tmpl.js"),
    true,
  );
  assert.equal(
    mobileViewPageTemplateSource.includes(
      "../../card/controls/shell-nav.tmpl.js",
    ),
    false,
  );
});

test("page chrome is owned by route templates and controllers", () => {
  for (const browseSource of [
    browseListTemplateSource,
    browseRenderControllerSource,
  ]) {
    assert.equal(browseSource.includes("../mobile-view/page.tmpl.js"), false);
    for (const pageChromeName of [
      "buildStandardPageCamSwitcherMarkup",
      "renderStandardPageCamSwitcher",
      "syncStandardPageStatus",
      "renderStandardPageStats",
      "renderStandardPageSubtitle",
    ]) {
      assert.equal(browseSource.includes(pageChromeName), false);
    }
  }
  assert.equal(
    browseRenderControllerSource.includes("_pageShellRegion(\"live\")"),
    false,
  );
  assert.equal(
    singleViewPageTemplateSource.includes(
      "export function buildSingleViewCamSwitcherMarkup",
    ),
    true,
  );
  assert.equal(
    singleViewPageControllerSource.includes(
      "buildSingleViewCamSwitcherMarkup({",
    ),
    true,
  );
  assert.equal(
    mobileViewPageControllerSource.includes(
      "buildMobileViewCamSwitcherMarkup({",
    ),
    true,
  );
  assert.equal(
    singleViewPageControllerSource.includes(
      "new BrowseRenderController(host)",
    ),
    true,
  );
  assert.equal(
    mobileViewPageControllerSource.includes(
      "new BrowseRenderController(host)",
    ),
    true,
  );
});

test("recordings browse nav delegates through the recordings browse nav controller", () => {
  assert.equal(cardSource.includes("RecordingsBrowseNavController,"), true);
  assert.equal(
    /this\._recordingsBrowseNavController\s*=\s*new RecordingsBrowseNavController\(\s*this,?\s*\)/.test(
      cardSource,
    ),
    true,
  );
  assert.equal(cardSource.includes("async _hasRecordingsInBounds("), false);
  assert.equal(
    cardSource.includes("async _prepareRecordingsDayTransition(direction) {"),
    false,
  );
  assert.equal(
    cardSource.includes("async _navigateRecordingsDayAnimated(direction) {"),
    false,
  );
  assert.equal(
    cardSource.includes("async _commitRecordingsDayTransition(bounds, recs) {"),
    false,
  );
  assert.equal(
    cardSource.includes("async _completeRecordingsSwipeGesture(gesture) {"),
    false,
  );
  assert.equal(
    cardSource.includes("async _updateRecordingsBrowseNav() {"),
    false,
  );
  assert.equal(cardSource.includes("async _stepRecordingsDay(dir) {"), false);
  assert.equal(
    cardSource.includes("_recordingsDayBounds(tsSec = null)"),
    false,
  );
  assert.equal(
    cardSource.includes("_recordingsOffsetDayBounds(offsetDays = 0)"),
    false,
  );
  assert.equal(
    recordingsBrowseNavControllerSource.includes(
      "export class RecordingsBrowseNavController",
    ),
    true,
  );
  assert.equal(
    recordingsBrowseNavControllerSource.includes(
      "async hasRecordingsInBounds(bounds, clientId, cam)",
    ),
    true,
  );
  assert.equal(
    recordingsBrowseNavControllerSource.includes(
      "async prepareDayTransition(direction)",
    ),
    true,
  );
  assert.equal(
    recordingsBrowseNavControllerSource.includes(
      "async navigateDayAnimated(direction)",
    ),
    true,
  );
  assert.equal(
    recordingsBrowseNavControllerSource.includes("_swipeController()"),
    true,
  );
  assert.equal(
    recordingsBrowseNavControllerSource.includes(
      "_recordingsDayBounds(tsSec = null)",
    ),
    true,
  );
  assert.equal(
    recordingsBrowseNavControllerSource.includes(
      "_recordingsOffsetDayBounds(offsetDays = 0)",
    ),
    true,
  );
  assert.equal(
    recordingsBrowseNavControllerSource.includes("swipeController.createStage"),
    true,
  );
  assert.equal(
    recordingsBrowseNavControllerSource.includes(
      "swipeController.animateStageTo",
    ),
    true,
  );
  assert.equal(
    recordingsBrowseNavControllerSource.includes(
      "swipeController.clearListState",
    ),
    true,
  );
  assert.equal(
    recordingsBrowseNavControllerSource.includes("swipeController.bounceArea"),
    true,
  );
  assert.equal(
    recordingsBrowseNavControllerSource.includes(
      "async commitDayTransition(bounds, recordings)",
    ),
    true,
  );
  assert.equal(
    recordingsBrowseNavControllerSource.includes(
      "async completeSwipeGesture(gesture)",
    ),
    true,
  );
  assert.equal(
    recordingsBrowseNavControllerSource.includes("async stepDay(direction)"),
    true,
  );
  assert.equal(
    recordingsBrowseNavControllerSource.includes("async updateBrowseNav()"),
    true,
  );
  assert.equal(
    recordingsBrowseNavControllerSource.includes("this.commitDayTransition("),
    true,
  );
});

test("recordings swipe stage helpers delegate through the recordings swipe controller", () => {
  assert.equal(cardSource.includes("RecordingsSwipeController,"), true);
  assert.equal(
    /this\._recordingsSwipeController\s*=\s*new RecordingsSwipeController\(\{/.test(
      cardSource,
    ),
    true,
  );
  assert.equal(
    /prepareDayTransition:\s*\(direction\)\s*=>\s*this\._recordingsBrowseNavController\.prepareDayTransition\(direction\)/s.test(
      cardSource,
    ),
    true,
  );
  assert.equal(
    /completeGesture:\s*\(gesture\)\s*=>\s*this\._recordingsBrowseNavController\.completeSwipeGesture\(gesture\)/s.test(
      cardSource,
    ),
    true,
  );
  assert.equal(
    /_createRecordingsSwipeStage\(direction, incomingHtml\) \{\s*return this\._recordingsSwipeController\?\.createStage\([\s\S]*?direction,[\s\S]*?incomingHtml,[\s\S]*?\);\s*\}/s.test(
      cardSource,
    ),
    true,
  );
  assert.equal(
    /_setRecordingsSwipeStageOffset\(state, offset, transition = ""\) \{\s*this\._recordingsSwipeController\?\.setStageOffset\(state, offset, transition\);\s*\}/s.test(
      cardSource,
    ),
    true,
  );
  assert.equal(
    /_clearRecordingsSwipeListState\(list = null\) \{\s*this\._recordingsSwipeController\?\.clearListState\(list\);\s*\}/s.test(
      cardSource,
    ),
    true,
  );
  assert.equal(
    /_animateRecordingsSwipeStageTo\([\s\S]*?this\._recordingsSwipeController\?\.animateStageTo\(/s.test(
      cardSource,
    ),
    true,
  );
  assert.equal(
    /_destroyRecordingsSwipeStage\(\) \{\s*this\._recordingsSwipeController\?\.destroyGestureStage\(\);\s*\}/s.test(
      cardSource,
    ),
    true,
  );
  assert.equal(
    /_bounceRecordingsArea\(direction\) \{\s*this\._recordingsSwipeController\?\.bounceArea\(direction\);\s*\}/s.test(
      cardSource,
    ),
    true,
  );
  assert.equal(
    /_startRecordingsSwipeGesture\(direction\) \{\s*return \([\s\S]*?this\._recordingsSwipeController\?\.startGestureStage\(direction\) \|\| null[\s\S]*?\);\s*\}/s.test(
      cardSource,
    ),
    true,
  );
  assert.equal(
    recordingsSwipeControllerSource.includes(
      "export class RecordingsSwipeController",
    ),
    true,
  );
  assert.equal(
    recordingsSwipeControllerSource.includes(
      "createStage(direction, incomingHtml)",
    ),
    true,
  );
  assert.equal(
    recordingsSwipeControllerSource.includes("animateStageTo("),
    true,
  );
  assert.equal(
    recordingsSwipeControllerSource.includes("clearListState(list = null)"),
    true,
  );
  assert.equal(
    recordingsSwipeControllerSource.includes("bounceArea(direction)"),
    true,
  );
  assert.equal(
    recordingsSwipeControllerSource.includes("startGestureStage(direction)"),
    true,
  );
});

test("popup media loading delegates through the popup media loader controller", () => {
  assert.equal(
    cardSource.includes(
      'import { PopupMediaLoaderController } from "../features/popup/media-loader.ctrl.js";',
    ),
    true,
  );
  assert.equal(
    /this\._popupMediaLoaderController\s*=\s*new PopupMediaLoaderController\(this\);/.test(
      cardSource,
    ),
    true,
  );
  assert.equal(cardSource.includes("_showClip(ev, opts = {}) {"), false);
  assert.equal(cardSource.includes("_showClipById(id, opts = {}) {"), false);
  assert.equal(cardSource.includes("_showSnapshot(ev, opts = {}) {"), false);
  assert.equal(cardSource.includes("async _showRecording(s, e) {"), false);
  assert.equal(
    cardSource.includes(
      "const sourceAttemptPlan = buildPopupRecordingSourceAttemptPlan",
    ),
    false,
  );
  assert.equal(
    popupMediaLoaderControllerSource.includes(
      "export class PopupMediaLoaderController",
    ),
    true,
  );
  assert.equal(
    popupMediaLoaderControllerSource.includes("../../card/popup/media.js"),
    false,
  );
  assert.equal(cardSource.includes('from "./popup/carousel.js"'), false);
  assert.equal(cardSource.includes('from "./popup/drag.ctrl.js"'), false);
  assert.equal(cardSource.includes('from "./popup/media.ctrl.js"'), false);
  assert.equal(
    cardSource.includes('from "../features/popup/carousel.js"'),
    true,
  );
  assert.equal(
    cardSource.includes('from "../features/popup/drag.ctrl.js"'),
    true,
  );
  assert.equal(
    cardSource.includes('from "../features/popup/media.ctrl.js"'),
    true,
  );
  assert.equal(
    popupMediaLoaderControllerSource.includes(
      'from "../../shared/media/url-utils.js"',
    ),
    true,
  );
  assert.equal(
    popupMediaSource.includes("export const resolvePopupMediaControlsInitPlan"),
    false,
  );
  assert.equal(
    popupMediaSource.includes("export const resolvePopupMediaSeekTarget"),
    false,
  );
  assert.equal(
    sharedMediaControlsSource.includes(
      "export const resolvePopupMediaControlsInitPlan",
    ),
    true,
  );
  assert.equal(
    sharedMediaControlsSource.includes(
      "export const resolvePopupMediaSeekTarget",
    ),
    true,
  );
  assert.equal(
    sharedUrlSource.includes("export const buildPopupMediaUrl"),
    true,
  );
  assert.equal(
    popupMediaLoaderControllerSource.includes("showRecording(start, end)"),
    true,
  );
  assert.equal(
    /async tryRecordingSource\(\s*video,\s*src,/.test(
      popupMediaLoaderControllerSource,
    ),
    true,
  );
});

test("ptz helpers live under the ptz feature owner", () => {
  assert.equal(cardSource.includes("../shared/ptz.js"), false);
  assert.equal(editorSource.includes("../shared/ptz.js"), false);
  assert.equal(
    ptzFeatureSource.includes("export const normalizeCameraPtzConfig"),
    true,
  );
  assert.equal(
    ptzFeatureSource.includes("export const resolvePtzServicePlan"),
    true,
  );
});

test("navigation helpers live under the navigation feature owner", () => {
  assert.equal(
    cardSource.includes("../navigation/page-navigation.ctrl.js"),
    false,
  );
  assert.equal(cardSource.includes("../navigation/deep-link.ctrl.js"), false);
  assert.equal(cardSource.includes("../router.js"), false);
  assert.equal(cardSource.includes("_ensureNavigationFactory() {"), false);
  assert.equal(cardSource.includes("_isDeepLinkHandlingEnabled() {"), false);
  assert.equal(navigationRouterSource.includes("export const PAGE_IDS"), true);
  assert.equal(
    navigationPageControllerSource.includes(
      "export class PageNavigationController",
    ),
    true,
  );
  assert.equal(
    deepLinkControllerSource.includes("export class DeepLinkController"),
    true,
  );
});

test("outer page layouts live with their route owners", () => {
  assert.equal(
    singleViewPageTemplateSource.includes(
      "export function buildSingleViewMainLayoutShellMarkup",
    ),
    true,
  );
  assert.equal(
    mobileViewPageTemplateSource.includes(
      "export function buildMobileViewMainLayoutShellMarkup",
    ),
    true,
  );
  assert.equal(
    wideViewPageTemplateSource.includes(
      "export function buildWideViewMainLayoutShellMarkup",
    ),
    true,
  );
  assert.equal(
    previewPageTemplateSource.includes(
      "export function buildPreviewPageMainLayoutShellMarkup",
    ),
    true,
  );
  for (const templatePath of [
    "../single-view/page.tmpl.js",
    "../mobile-view/page.tmpl.js",
    "../wide-view/page.tmpl.js",
    "../preview/page.tmpl.js",
  ]) {
    assert.equal(pageShellRegistrySource.includes(templatePath), true);
  }
  assert.equal(
    shellNavTemplateSource.includes(
      "export function buildMainLayoutShellMarkup",
    ),
    false,
  );
});

test("page profiles own toolbar and live-control visual button classes", () => {
  for (const profileEntry of [
    'tabsButtonClass: "icon-btn"',
    'toolsButtonClass: "icon-btn"',
    'liveFullscreenButtonClass: "icon-btn"',
    'liveMuteButtonClass: "icon-btn"',
  ]) {
    assert.equal(pageShellRegistrySource.includes(profileEntry), true);
  }
  assert.equal(
    cardSource.includes("buttonClass: tabsButtonClass"),
    true,
  );
  assert.equal(
    cardSource.includes("buttonClass: toolsButtonClass"),
    true,
  );
  assert.equal(
    cardSource.includes(
      "buttonClass: shellProfile?.liveFullscreenButtonClass",
    ),
    true,
  );
  assert.equal(
    cardSource.includes("buttonClass: shellProfile?.liveMuteButtonClass"),
    true,
  );
  assert.equal(
    shellNavTemplateSource.includes('buttonClass = "tool"'),
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

test("page shell regions are validated before the shell is committed", () => {
  const validationIndex = cardSource.indexOf(
    "validatePageShellRegionMarkup(mainLayoutShell, {",
  );
  const shellCommitIndex = cardSource.indexOf(
    "this.shadowRoot.innerHTML = `<style>${STYLES}</style>",
  );

  assert.ok(validationIndex >= 0);
  assert.ok(shellCommitIndex > validationIndex);
});

test("page shell replacement preserves the existing live wrapper", () => {
  const preserveStart = cardSource.indexOf("_renderShellPreserveLive() {");
  const preserveEnd = cardSource.indexOf(
    "_shouldRenderTwoWayTalkButtonForActiveCamera()",
    preserveStart,
  );
  const preserveSource = cardSource.slice(preserveStart, preserveEnd);
  const detachIndex = preserveSource.indexOf(
    "parent.removeChild(preservedEngWrap);",
  );
  const renderIndex = preserveSource.indexOf(
    "this._renderShell();",
    detachIndex,
  );
  const restoreIndex = preserveSource.indexOf(
    "nextEngWrap.replaceWith(preservedEngWrap);",
  );

  assert.ok(detachIndex >= 0);
  assert.ok(renderIndex > detachIndex);
  assert.ok(restoreIndex > renderIndex);
});

test("browse list orchestration is owned by the browse render controller", () => {
  for (const controllerMethod of [
    "renderList() {",
    "setListHtmlIfChanged(list, html)",
    "syncOlderHint(forceHide = null)",
    "_renderStandardListMarkup(",
    "_renderRecordings(list)",
    "_renderReviews(list)",
  ]) {
    assert.equal(
      browseRenderControllerSource.includes(controllerMethod),
      true,
    );
  }
  for (const removedCardMethod of [
    "_renderEventsList(list) {",
    "_renderKeptList(list) {",
    "_renderStandardListMarkup(",
    "_renderRecordings(list) {",
    "_renderReviews(list) {",
  ]) {
    assert.equal(cardSource.includes(removedCardMethod), false);
  }
  assert.equal(
    /_renderList\(\) \{\s*this\._activeStandardPageController\(\)\.renderList\(\);\s*\}/.test(
      cardSource,
    ),
    true,
  );
  assert.equal(
    /_syncOlderHint\(forceHide = null\) \{\s*this\._activeStandardPageController\(\)\.syncOlderHint\(forceHide\);\s*\}/.test(
      cardSource,
    ),
    true,
  );
  for (const pageControllerSource of [
    singleViewPageControllerSource,
    mobileViewPageControllerSource,
  ]) {
    assert.equal(
      pageControllerSource.includes(
        "this._browseRenderController.renderList();",
      ),
      true,
    );
    assert.equal(
      pageControllerSource.includes(
        "this._browseRenderController.syncOlderHint(forceHide);",
      ),
      true,
    );
  }
});
