import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const source = fs.readFileSync(
  new URL("../dist/frigate-view-card.js", import.meta.url),
  "utf8",
);
const editorBundleSource = fs.readFileSync(
  new URL("../dist/frigate-view-card-editor.js", import.meta.url),
  "utf8",
);
const indexSource = fs.readFileSync(
  new URL("../src/index.js", import.meta.url),
  "utf8",
);
const cardSource = fs.readFileSync(
  new URL("../src/card/FrigateViewCard.js", import.meta.url),
  "utf8",
);

test("HA review polling does not schedule redundant live remount checks", () => {
  assert.equal(cardSource.includes('"ha-review-status-alert"'), false);
  assert.equal(cardSource.includes("haReviewAlertActive"), false);
});
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
const mobileViewCompositionSource = fs.readFileSync(
  new URL("../src/features/mobile-view/composition.js", import.meta.url),
  "utf8",
);
const slideshowCompositionSource = fs.readFileSync(
  new URL("../src/features/slideshow/composition.js", import.meta.url),
  "utf8",
);
const previewCompositionSource = fs.readFileSync(
  new URL("../src/features/preview/composition.js", import.meta.url),
  "utf8",
);
const navigationCompositionSource = fs.readFileSync(
  new URL("../src/features/navigation/composition.js", import.meta.url),
  "utf8",
);
const wideViewPageTemplateSource = fs.readFileSync(
  new URL("../src/features/wide-view/page.tmpl.js", import.meta.url),
  "utf8",
);
const wideViewCompositionSource = fs.readFileSync(
  new URL("../src/features/wide-view/composition.js", import.meta.url),
  "utf8",
);
const cardViewPageTemplateSource = fs.readFileSync(
  new URL("../src/features/card-view/page.tmpl.js", import.meta.url),
  "utf8",
);
const pageShellRegistrySource = fs.readFileSync(
  new URL("../src/features/navigation/page-shell-registry.js", import.meta.url),
  "utf8",
);
const cardShellTemplateSource = fs.readFileSync(
  new URL("../src/card/shell.tmpl.js", import.meta.url),
  "utf8",
);
const toolbarTemplateSource = fs.readFileSync(
  new URL("../src/card/toolbar.tmpl.js", import.meta.url),
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
const frigateMediaDownloadControllerSource = fs.readFileSync(
  new URL(
    "../src/integrations/frigate/media-download.ctrl.js",
    import.meta.url,
  ),
  "utf8",
);
const frigateMediaResolverControllerSource = fs.readFileSync(
  new URL(
    "../src/integrations/frigate/media-resolver.ctrl.js",
    import.meta.url,
  ),
  "utf8",
);
const frigatePtzInfoSource = fs.readFileSync(
  new URL("../src/integrations/frigate/ptz-info.js", import.meta.url),
  "utf8",
);
const frigateEventMediaSource = fs.readFileSync(
  new URL("../src/integrations/frigate/event-media.js", import.meta.url),
  "utf8",
);
const sharedUrlSource = fs.readFileSync(
  new URL("../src/shared/media/url-utils.js", import.meta.url),
  "utf8",
);
const sharedMediaDownloadSource = fs.readFileSync(
  new URL("../src/shared/media/download.js", import.meta.url),
  "utf8",
);
const sharedMediaControlsSource = fs.readFileSync(
  new URL("../src/shared/media/controls.js", import.meta.url),
  "utf8",
);
const sharedMediaFullscreenSource = fs.readFileSync(
  new URL("../src/shared/media/fullscreen.js", import.meta.url),
  "utf8",
);
const sharedMediaFirstFrameSource = fs.readFileSync(
  new URL("../src/shared/media/first-frame.js", import.meta.url),
  "utf8",
);
const sharedMediaVideoFitSource = fs.readFileSync(
  new URL("../src/shared/media/video-fit.js", import.meta.url),
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
const haDirectTwoWayTalkMounterSource = fs.readFileSync(
  new URL(
    "../src/integrations/home-assistant/two-way-talk-mounter.js",
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
const homeAssistantPtzServiceSource = fs.readFileSync(
  new URL(
    "../src/integrations/home-assistant/ptz-service.js",
    import.meta.url,
  ),
  "utf8",
);
const go2rtcRaceMounterSource = fs.readFileSync(
  new URL("../src/features/live/go2rtc-race-mounter.js", import.meta.url),
  "utf8",
);
const liveTransportCompositionSource = fs.readFileSync(
  new URL(
    "../src/features/live/transport-composition.js",
    import.meta.url,
  ),
  "utf8",
);
const liveLifecycleCompositionSource = fs.readFileSync(
  new URL(
    "../src/features/live/lifecycle-composition.js",
    import.meta.url,
  ),
  "utf8",
);
const twoWayTalkSessionControllerSource = fs.readFileSync(
  new URL(
    "../src/features/two-way-talk/session.ctrl.js",
    import.meta.url,
  ),
  "utf8",
);
const twoWayTalkControlsTemplateSource = fs.readFileSync(
  new URL(
    "../src/features/two-way-talk/controls.tmpl.js",
    import.meta.url,
  ),
  "utf8",
);
const twoWayTalkControlsControllerSource = fs.readFileSync(
  new URL(
    "../src/features/two-way-talk/controls.ctrl.js",
    import.meta.url,
  ),
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
const liveMountStateControllerSource = fs.readFileSync(
  new URL("../src/features/live/mount-state.ctrl.js", import.meta.url),
  "utf8",
);
const liveAudioControllerSource = fs.readFileSync(
  new URL("../src/features/live/audio.ctrl.js", import.meta.url),
  "utf8",
);
const liveMediaPresentationControllerSource = fs.readFileSync(
  new URL(
    "../src/features/live/media-presentation.ctrl.js",
    import.meta.url,
  ),
  "utf8",
);
const liveOverlayPresentationControllerSource = fs.readFileSync(
  new URL(
    "../src/features/live/overlay-presentation.ctrl.js",
    import.meta.url,
  ),
  "utf8",
);
const liveRotateOverlayControllerSource = fs.readFileSync(
  new URL(
    "../src/features/live/rotate-overlay.ctrl.js",
    import.meta.url,
  ),
  "utf8",
);
const liveRecoveryControllerSource = fs.readFileSync(
  new URL("../src/features/live/recovery.ctrl.js", import.meta.url),
  "utf8",
);
const liveDashboardRetentionControllerSource = fs.readFileSync(
  new URL(
    "../src/features/live/dashboard-retention.ctrl.js",
    import.meta.url,
  ),
  "utf8",
);
const liveStreamStatusControllerSource = fs.readFileSync(
  new URL(
    "../src/features/live/stream-status.ctrl.js",
    import.meta.url,
  ),
  "utf8",
);
const liveFallbackControllerSource = fs.readFileSync(
  new URL(
    "../src/features/live/fallbacks/fallback.ctrl.js",
    import.meta.url,
  ),
  "utf8",
);
const gridCompositionSource = fs.readFileSync(
  new URL("../src/features/grid/composition.js", import.meta.url),
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
const localizedDateControllerSource = fs.readFileSync(
  new URL("../src/features/localization/date.ctrl.js", import.meta.url),
  "utf8",
);
const viewportContextControllerSource = fs.readFileSync(
  new URL("../src/features/viewport/context.ctrl.js", import.meta.url),
  "utf8",
);
const browseCompositionSource = fs.readFileSync(
  new URL("../src/features/browse/composition.js", import.meta.url),
  "utf8",
);
const browseItemPresentationControllerSource = fs.readFileSync(
  new URL(
    "../src/features/browse/item-presentation.ctrl.js",
    import.meta.url,
  ),
  "utf8",
);
const browseFavoriteMutationControllerSource = fs.readFileSync(
  new URL(
    "../src/features/browse/favorite-mutation.ctrl.js",
    import.meta.url,
  ),
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
const popupCompositionSource = fs.readFileSync(
  new URL("../src/features/popup/composition.js", import.meta.url),
  "utf8",
);
const popupMediaControlsControllerSource = fs.readFileSync(
  new URL("../src/features/popup/media.ctrl.js", import.meta.url),
  "utf8",
);
const popupToolbarControllerSource = fs.readFileSync(
  new URL("../src/features/popup/toolbar.ctrl.js", import.meta.url),
  "utf8",
);
const liveMediaToolbarControllerSource = fs.readFileSync(
  new URL("../src/features/live/media-toolbar.ctrl.js", import.meta.url),
  "utf8",
);
const popupRecordingScrubControllerSource = fs.readFileSync(
  new URL(
    "../src/features/popup/recording-scrub.ctrl.js",
    import.meta.url,
  ),
  "utf8",
);
const popupLifecycleControllerSource = fs.readFileSync(
  new URL("../src/features/popup/lifecycle.ctrl.js", import.meta.url),
  "utf8",
);
const popupCarouselControllerSource = fs.readFileSync(
  new URL("../src/features/popup/carousel.ctrl.js", import.meta.url),
  "utf8",
);
const popupInfoControllerSource = fs.readFileSync(
  new URL("../src/features/popup/info.ctrl.js", import.meta.url),
  "utf8",
);
const popupInfoSource = fs.readFileSync(
  new URL("../src/features/popup/info.js", import.meta.url),
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
const ptzCompositionSource = fs.readFileSync(
  new URL("../src/features/ptz/composition.js", import.meta.url),
  "utf8",
);
const ptzActionControllerSource = fs.readFileSync(
  new URL("../src/features/ptz/action.ctrl.js", import.meta.url),
  "utf8",
);
const ptzCapabilityControllerSource = fs.readFileSync(
  new URL("../src/features/ptz/capability.ctrl.js", import.meta.url),
  "utf8",
);
const ptzControlsControllerSource = fs.readFileSync(
  new URL("../src/features/ptz/controls.ctrl.js", import.meta.url),
  "utf8",
);
const ptzInteractionControllerSource = fs.readFileSync(
  new URL("../src/features/ptz/interaction.ctrl.js", import.meta.url),
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

test("live transport ownership is pulled out of the card shell", () => {
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
    false,
  );
  assert.equal(
    /this\._go2rtcResolver\s*=\s*createGo2RtcResolver\(/.test(cardSource),
    false,
  );
  assert.equal(
    cardSource.includes(
      'import { createGo2RtcMounter } from "../features/live/go2rtc-mounter.js";',
    ),
    false,
  );
  assert.equal(
    /this\._go2rtcMounter\s*=\s*createGo2RtcMounter\(/.test(cardSource),
    false,
  );
  assert.equal(
    cardSource.includes(
      'import { createHaDirectMounter } from "../features/live/ha-direct-mounter.js";',
    ),
    false,
  );
  assert.equal(
    /this\._haDirectMounter\s*=\s*createHaDirectMounter\(/.test(cardSource),
    false,
  );
  assert.equal(
    cardSource.includes(
      'import { createHaDirectTwoWayTalkMounter } from "../integrations/home-assistant/two-way-talk-mounter.js";',
    ),
    false,
  );
  assert.equal(
    /this\._haDirectTwoWayTalkMounter\s*=\s*createHaDirectTwoWayTalkMounter\(/.test(
      cardSource,
    ),
    false,
  );
  assert.equal(
    cardSource.includes(
      'import { createGo2RtcRaceMounter } from "../features/live/go2rtc-race-mounter.js";',
    ),
    false,
  );
  assert.equal(
    /this\._go2rtcRaceMounter\s*=\s*createGo2RtcRaceMounter\(/.test(cardSource),
    false,
  );
  assert.equal(
    cardSource.includes(
      'import { createLiveTransportControllers } from "../features/live/transport-composition.js";',
    ),
    true,
  );
  assert.equal(
    cardSource.includes(
      "Object.assign(this, createLiveTransportControllers(this));",
    ),
    true,
  );
  assert.equal(
    liveTransportCompositionSource.includes(
      "export const createLiveTransportControllers",
    ),
    true,
  );
  assert.equal(
    liveTransportCompositionSource.includes(
      "const go2rtcResolver = resolvedFactories.createGo2RtcResolver",
    ),
    true,
  );
  assert.equal(
    liveTransportCompositionSource.includes(
      "const haDirectMounter = resolvedFactories.createHaDirectMounter",
    ),
    true,
  );
  assert.equal(
    cardSource.includes(
      'import { createMseGraceController } from "../features/live/mse-grace-controller.js";',
    ),
    false,
  );
  assert.equal(
    cardSource.includes(
      'import { createLiveMountController } from "../features/live/mount-controller.js";',
    ),
    false,
  );
  assert.equal(
    /this\._mseGraceController\s*=\s*createMseGraceController\(\{/.test(
      cardSource,
    ),
    false,
  );
  assert.equal(
    /this\._liveMountController\s*=\s*createLiveMountController\(\{/.test(
      cardSource,
    ),
    false,
  );
  assert.equal(
    cardSource.includes(
      'import { createLiveLifecycleControllers } from "../features/live/lifecycle-composition.js";',
    ),
    true,
  );
  assert.equal(
    cardSource.includes(
      "Object.assign(this, createLiveLifecycleControllers(this));",
    ),
    true,
  );
  assert.equal(
    liveLifecycleCompositionSource.includes(
      "resolvedFactories.createMseGraceController",
    ),
    true,
  );
  assert.equal(
    liveLifecycleCompositionSource.includes(
      "resolvedFactories.createEditorLiveHandoffController",
    ),
    true,
  );
  assert.equal(
    liveLifecycleCompositionSource.includes(
      "resolvedFactories.createLiveMountController",
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
    false,
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
    haDirectMounterSource.includes("createHaDirectWebRtcPlayback"),
    true,
  );
  assert.equal(
    haDirectMounterSource.includes("createHaHlsPlayerElement"),
    true,
  );
  assert.equal(
    haDirectTwoWayTalkMounterSource.includes(
      "export function createHaDirectTwoWayTalkMounter",
    ),
    true,
  );
  assert.equal(
    haDirectTwoWayTalkMounterSource.includes(
      'type: "camera/webrtc/get_client_config"',
    ),
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
    /adoptMountedAttempt:\s*\(slot, winner, options = \{\}\)\s*=>\s*adoptMountedAttemptResult\(/.test(
      liveTransportCompositionSource,
    ),
    true,
  );
  assert.equal(
    cardSource.includes(
      'import {\n  getLiveMountStateController,\n  LiveMountStateController,\n} from "../features/live/mount-state.ctrl.js";',
    ),
    true,
  );
  assert.equal(
    cardSource.includes(
      "this._liveMountStateController = new LiveMountStateController(this);",
    ),
    true,
  );
  for (const delegation of [
    "getLiveMountStateController(this).cleanupEngine(options)",
    "getLiveMountStateController(this).clearEngineSlot()",
    "getLiveMountStateController(this).cancelPendingMount(",
    "getLiveMountStateController(this).applyTrackingState(nextState)",
    "getLiveMountStateController(this).adoptAttemptResult(",
  ]) {
    assert.equal(cardSource.includes(delegation), true);
  }
  assert.equal(cardSource.includes("invalidateMountTrackingIfActive"), false);
  assert.equal(cardSource.includes("adoptMountedAttemptResult"), false);
  assert.equal(
    liveMountStateControllerSource.includes(
      "export class LiveMountStateController",
    ),
    true,
  );
  assert.equal(
    liveMountStateControllerSource.includes(
      "invalidateMountTrackingIfActive",
    ),
    true,
  );
  assert.equal(
    liveMountStateControllerSource.includes("adoptMountedAttemptResult"),
    true,
  );
  assert.equal(frigateUrlSource.includes("buildGo2rtcWsPath"), true);
  assert.equal(sharedUrlSource.includes("toAbsoluteSignedUrl"), true);
  assert.equal(
    cardSource.includes(
      'import { createGridControllers } from "../features/grid/composition.js";',
    ),
    true,
  );
  assert.equal(
    cardSource.includes(
      "Object.assign(this, createGridControllers(this));",
    ),
    true,
  );
  for (const controllerName of [
    "GridAlertController",
    "GridPageController",
    "GridMediaController",
  ]) {
    assert.equal(cardSource.includes(`new ${controllerName}`), false);
    assert.equal(gridCompositionSource.includes(`new ${controllerName}`), true);
  }
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
    /_mountEngine\([\s\S]*?this\._liveMountController\.mount\(\{[\s\S]*?entity:\s*this\._activeGroupMemberOverride \|\| this\._activeCam\?\.entity \|\| ""/.test(
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
    /mount\s*=\s*async\s*\(\{[\s\S]*?const directMounter = hasTwoWayTalkOptions[\s\S]*?haDirectTwoWayTalkMounter[\s\S]*?haDirectMounter;[\s\S]*?directMounter\.tryMount\([\s\S]*?streamType: transportPlan\.streamType/.test(
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

test("live audio behavior is owned by its feature controller", () => {
  assert.equal(
    cardSource.includes(
      'import {\n  getLiveAudioController,\n  LiveAudioController,\n} from "../features/live/audio.ctrl.js";',
    ),
    true,
  );
  assert.equal(
    cardSource.includes("this._liveAudioController = new LiveAudioController(this);"),
    true,
  );
  for (const delegation of [
    "getLiveAudioController(this).buildMobileInlineControlMarkup()",
    "getLiveAudioController(this).resolveMuted()",
    "getLiveAudioController(this).setMuted(muted)",
    "getLiveAudioController(this).syncMuteButtons()",
    "getLiveAudioController(this).applyMuteChange(nextMuted, { source })",
    "getLiveAudioController(this).toggleMute()",
  ]) {
    assert.equal(cardSource.includes(delegation), true);
  }
  assert.equal(cardSource.includes("setIncomingAudioMuted"), false);
  assert.equal(cardSource.includes("needsHaDirectRecovery"), false);
  assert.equal(liveAudioControllerSource.includes("setIncomingAudioMuted"), true);
  assert.equal(
    liveAudioControllerSource.includes("const needsHaDirectRecovery ="),
    true,
  );
  assert.equal(
    liveAudioControllerSource.includes("host._useHaDirectStreamPath()"),
    true,
  );
  assert.equal(
    liveAudioControllerSource.includes(
      "host._mountEngine(null, { quiet: true });",
    ),
    true,
  );
  assert.equal(
    liveAudioControllerSource.includes("[120, 400, 900].forEach"),
    true,
  );
});

test("live media presentation is owned by its feature controller", () => {
  assert.equal(
    cardSource.includes(
      'from "../features/live/media-presentation.ctrl.js";',
    ),
    true,
  );
  assert.equal(
    cardSource.includes(
      "new LiveMediaPresentationController(this)",
    ),
    true,
  );
  for (const delegation of [
    "getLiveMediaPresentationController(this).assignEngine(engine, options)",
    "getLiveMediaPresentationController(this).attachVideoZoom(",
    "getLiveMediaPresentationController(this).clearVideoZoom()",
    "getLiveMediaPresentationController(this).syncRotateZoomPresentation(card)",
  ]) {
    assert.equal(cardSource.includes(delegation), true);
  }
  for (const ownedMechanic of [
    "hostCard._applyVideoFit(video)",
    "hostCard._liveViewResizeController?.attachMedia(video)",
    "host._haDirectMounter?.release?.(host._engine)",
    "attachVideoZoom(video, {",
    "setPresentationSuspended?.(suspend)",
  ]) {
    assert.equal(
      liveMediaPresentationControllerSource.includes(ownedMechanic),
      true,
    );
  }
  assert.equal(cardSource.includes("const currentZoomController ="), false);
  assert.equal(cardSource.includes("const sameVideo ="), false);
});

test("live overlay presentation is owned by its feature controller", () => {
  assert.equal(
    cardSource.includes(
      'from "../features/live/overlay-presentation.ctrl.js";',
    ),
    true,
  );
  assert.equal(
    cardSource.includes("new LiveOverlayPresentationController(this)"),
    true,
  );
  assert.match(
    cardSource,
    /_initLiveOverlayControls\(\) \{\s*getLiveOverlayPresentationController\(this\)\.init\(\);\s*\}/,
  );
  assert.match(
    cardSource,
    /_showLiveControlsTemporarily\(ms = 2200\) \{\s*getLiveOverlayPresentationController\(this\)\.showTemporarily\(ms\);\s*\}/,
  );
  for (const ownedMechanic of [
    "new MediaOverlayControlsController(options)",
    "CARD_VIEW_OVERLAY_TIMING.mouse.controlsHideMs",
    "CARD_VIEW_OVERLAY_TIMING.touch.controlsHideMs",
    'host._lastLiveOverlayPointerType === "touch"',
    "CARD_VIEW_OVERLAYS_TOUCH_IDLE_CLASS",
  ]) {
    assert.equal(
      liveOverlayPresentationControllerSource.includes(ownedMechanic),
      true,
    );
  }
  assert.equal(cardSource.includes("CARD_VIEW_OVERLAYS_IDLE_CLASS"), false);
  assert.equal(cardSource.includes("CARD_VIEW_OVERLAY_TIMING"), false);
  assert.equal(cardSource.includes("LiveOverlayControlsController"), false);
});

test("rotate overlay presentation is owned by its live feature controller", () => {
  assert.equal(
    cardSource.includes('from "../features/live/rotate-overlay.ctrl.js";'),
    true,
  );
  assert.equal(
    cardSource.includes("new LiveRotateOverlayController(this)"),
    true,
  );
  for (const delegation of [
    "getLiveRotateOverlayController(this).applyUiPlan(card, uiPlan)",
    "getLiveRotateOverlayController(this).clearAudioSync()",
    "getLiveRotateOverlayController(this).clearVideoFullscreenStyle()",
    "getLiveRotateOverlayController(this).applyVideoFullscreenStyle(video)",
    "getLiveRotateOverlayController(this).bindAudioSync(video)",
    "getLiveRotateOverlayController(this).scheduleUpdate()",
    "getLiveRotateOverlayController(this).syncViewportState()",
    "getLiveRotateOverlayController(this).captureLiveEntryRect()",
    "getLiveRotateOverlayController(this).captureLiveExitRect(card)",
    "getLiveRotateOverlayController(this).scheduleExitCleanup(exitPlan)",
    "getLiveRotateOverlayController(this).isEnabled()",
    "getLiveRotateOverlayController(this).isViewportCoverActive()",
    "getLiveRotateOverlayController(this).updateState()",
    "getLiveRotateOverlayController(this).dismiss()",
  ]) {
    assert.equal(cardSource.includes(delegation), true);
  }
  for (const ownedMechanic of [
    "resolveRotateOverlayNativeControlsPlan({",
    "resolveRotateOverlayViewportVariables({",
    "resolveRotateOverlayVideoStyles({",
    "resolveRotateOverlayLiveDismissal({",
    "resolveRotateOverlayState({",
    "resolveRotateOverlayUiPlan(rotateState)",
    "resolveRotateOverlayExitPlan({",
    "MOBILE_VIEW_ROTATE_COVER_CLASS",
  ]) {
    assert.equal(
      liveRotateOverlayControllerSource.includes(ownedMechanic),
      true,
    );
  }
  assert.equal(cardSource.includes("resolveRotateOverlayState"), false);
  assert.equal(cardSource.includes("resolveRotateOverlayUiPlan"), false);
  assert.equal(cardSource.includes("resolveRotateOverlayVideoStyles"), false);
  assert.equal(cardSource.includes("MOBILE_VIEW_ROTATE_COVER_CLASS"), false);
});

test("live recovery scheduling and stale-media decisions have a feature owner", () => {
  assert.equal(
    cardSource.includes('from "../features/live/recovery.ctrl.js";'),
    true,
  );
  assert.equal(
    cardSource.includes("new LiveRecoveryController(this)"),
    true,
  );
  for (const delegation of [
    "getLiveRecoveryController(this).cancelScheduledResume()",
    "getLiveRecoveryController(this).scheduleResume(reason)",
    "getLiveRecoveryController(this).kickIfStale(",
    "getLiveRecoveryController(this).resumeIfNeeded(reason)",
  ]) {
    assert.equal(cardSource.includes(delegation), true);
  }
  for (const ownedMechanic of [
    "findActiveHaCameraStreamVideo(host._engine)",
    "resolveLiveKickProbeState({ video })",
    "resolveLiveKickIfStaleAction({",
    "shouldForceLiveRemountForReason(reason, {",
    "resolveLiveResumeAction({",
    "shouldPreserveLiveRemountReasonWhileWaiting(reason)",
    "isMseReturnRemountReason(reason)",
  ]) {
    assert.equal(liveRecoveryControllerSource.includes(ownedMechanic), true);
  }
  assert.equal(cardSource.includes("resolveLiveKickProbeState"), false);
  assert.equal(cardSource.includes("resolveLiveKickIfStaleAction"), false);
  assert.equal(cardSource.includes("resolveLiveResumeAction"), false);
  assert.equal(cardSource.includes("findActiveHaCameraStreamVideo"), false);
});

test("dashboard live retention is owned by its live feature controller", () => {
  assert.equal(
    cardSource.includes(
      'from "../features/live/dashboard-retention.ctrl.js";',
    ),
    true,
  );
  assert.equal(
    cardSource.includes("new LiveDashboardRetentionController(this)"),
    true,
  );
  for (const delegation of [
    "getLiveDashboardRetentionController(this).preserveForNavigation()",
    "getLiveDashboardRetentionController(this).handleScopeExited()",
    ").handleNavigationSettled()",
  ]) {
    assert.equal(cardSource.includes(delegation), true);
  }
  for (const ownedMechanic of [
    'host._cancelPendingMount("same-dashboard-navigation", cleanupOptions)',
    'host._cancelPendingMount("dashboard-swipe-webrtc-rebind", {',
    'host._scheduleResumeLive("dashboard-swipe-settled")',
    "host._dashboardLiveGraceActive = true",
    "void host._mountEngine()",
  ]) {
    assert.equal(
      liveDashboardRetentionControllerSource.includes(ownedMechanic),
      true,
    );
  }
  assert.equal(cardSource.includes("restoreRetainedWebRtc"), false);
  assert.equal(cardSource.includes("teardownIfDetached"), false);
});

test("live stream status presentation is owned by its live feature controller", () => {
  assert.equal(
    cardSource.includes('from "../features/live/stream-status.ctrl.js";'),
    true,
  );
  assert.equal(
    cardSource.includes("new LiveStreamStatusController(this)"),
    true,
  );
  for (const delegation of [
    "getLiveStreamStatusController(this).currentStreamHint()",
    "getLiveStreamStatusController(this).setLoading(loading, text)",
    "getLiveStreamStatusController(this).setActiveType(type)",
    "getLiveStreamStatusController(this).setFallbackVisible(",
    "getLiveStreamStatusController(this).applyResolvedState(streamState)",
  ]) {
    assert.equal(cardSource.includes(delegation), true);
  }
  for (const ownedMechanic of [
    "applyStreamLoadingStateForCard({",
    "applyActiveStreamTypeForCard({",
    "applyStreamFallbackVisibilityForCard({",
    "host._syncTwoWayTalkRuntimeState()",
    "host._liveViewResizeController?.sync()",
  ]) {
    assert.equal(liveStreamStatusControllerSource.includes(ownedMechanic), true);
  }
  assert.equal(cardSource.includes("applyStreamLoadingStateForCard"), false);
  assert.equal(cardSource.includes("applyActiveStreamTypeForCard"), false);
  assert.equal(
    cardSource.includes("applyStreamFallbackVisibilityForCard"),
    false,
  );
});

test("live fallback adapter orchestration is owned by its live feature controller", () => {
  assert.equal(
    cardSource.includes(
      'from "../features/live/fallbacks/fallback.ctrl.js";',
    ),
    true,
  );
  assert.equal(cardSource.includes("new LiveFallbackController(this)"), true);
  for (const delegation of [
    "getLiveFallbackController(this).originForAdapters()",
    "getLiveFallbackController(this).loadPrimary(entity)",
    "getLiveFallbackController(this).loadAlternate(entity)",
    "getLiveFallbackController(this).refreshImage()",
  ]) {
    assert.equal(cardSource.includes(delegation), true);
  }
  for (const ownedMechanic of [
    "loadFallbackPrimaryForCard({",
    "loadFallbackAltForCard({",
    "runFallbackRefreshCycleForCard({",
    "applyFallbackImageHandlers({",
    "applySource: setFallbackImageSourceIfChanged",
  ]) {
    assert.equal(liveFallbackControllerSource.includes(ownedMechanic), true);
  }
  assert.equal(cardSource.includes("loadFallbackPrimaryForCard"), false);
  assert.equal(cardSource.includes("loadFallbackAltForCard"), false);
  assert.equal(cardSource.includes("runFallbackRefreshCycleForCard"), false);
  assert.equal(cardSource.includes("applyFallbackImageHandlers"), false);
  assert.equal(cardSource.includes("setFallbackImageSourceIfChanged"), false);
});

test("generic fullscreen behavior is owned by shared media primitives", () => {
  assert.equal(
    cardSource.includes(
      'from "../shared/media/fullscreen.js";',
    ),
    true,
  );
  assert.match(
    cardSource,
    /_findFullscreenVideo\(el\) \{\s*return findFullscreenVideo\(el\);\s*\}/,
  );
  assert.match(
    cardSource,
    /_findVideoDeep\(root, maxDepth = 7\) \{\s*return findVideoDeep\(root, maxDepth\);\s*\}/,
  );
  assert.equal(cardSource.includes("requestMediaFullscreen({"), true);
  assert.equal(
    cardSource.includes(
      "return exitDocumentFullscreen(this.ownerDocument || globalThis.document);",
    ),
    true,
  );
  assert.equal(cardSource.includes("webkitEnterFullscreen"), false);
  assert.equal(cardSource.includes("webkitEnterFullScreen"), false);
  assert.equal(cardSource.includes("webkitExitFullscreen"), false);
  assert.equal(cardSource.includes("webkitCancelFullScreen"), false);
  for (const ownedExport of [
    "export function findFullscreenVideo",
    "export function findVideoDeep",
    "export function requestMediaFullscreen",
    "export function exitDocumentFullscreen",
  ]) {
    assert.equal(sharedMediaFullscreenSource.includes(ownedExport), true);
  }
});

test("generic media readiness behavior is owned by shared media primitives", () => {
  assert.equal(
    cardSource.includes(
      'import { waitForMediaStart } from "../shared/media/first-frame.js";',
    ),
    true,
  );
  assert.match(
    cardSource,
    /_waitForStreamStart\(streamEl, timeoutMs = 3500, opts = \{\}\) \{\s*return waitForMediaStart\(streamEl, timeoutMs, \{/,
  );
  assert.equal(
    sharedMediaFirstFrameSource.includes(
      "export function waitForMediaStart",
    ),
    true,
  );
  for (const readinessMechanic of [
    'addEventListener("timeupdate"',
    "requestVideoFrameCallback",
    "webkitDecodedFrameCount",
    "getVideoPlaybackQuality",
  ]) {
    assert.equal(cardSource.includes(readinessMechanic), false);
    assert.equal(sharedMediaFirstFrameSource.includes(readinessMechanic), true);
  }
});

test("generic contained-video fitting is owned by shared media primitives", () => {
  assert.equal(
    cardSource.includes('from "../shared/media/video-fit.js";'),
    true,
  );
  assert.match(
    cardSource,
    /_applyVideoFit\(videoEl\) \{\s*applyContainedVideoFit\(videoEl\);\s*\}/,
  );
  assert.match(
    cardSource,
    /_attachVideoFit\(streamEl, retries = 12\) \{\s*attachContainedVideoFit\(streamEl, retries\);\s*\}/,
  );
  for (const styleAssignment of [
    'style.display = "block"',
    'style.width = "100%"',
    'style.height = "100%"',
    'style.objectPosition = "center center"',
    'style.objectFit = "contain"',
  ]) {
    assert.equal(cardSource.includes(styleAssignment), false);
    assert.equal(sharedMediaVideoFitSource.includes(styleAssignment), true);
  }
  assert.equal(
    sharedMediaVideoFitSource.includes(
      "setTimeout(() => attachContainedVideoFit(mediaRoot, retries - 1), 160)",
    ),
    true,
  );
});

test("two-way-talk session lifecycle is owned by its feature controller", () => {
  assert.equal(
    cardSource.includes(
      'from "../features/two-way-talk/session.ctrl.js";',
    ),
    true,
  );
  assert.equal(
    cardSource.includes(
      "new TwoWayTalkSessionController(this)",
    ),
    true,
  );
  assert.equal(cardSource.includes("startGo2RtcTwoWayTalkSession"), false);
  assert.equal(cardSource.includes("startHaDirectTwoWayTalkSession"), false);
  assert.equal(
    /_startTwoWayTalkSession\(\) \{\s*await getTwoWayTalkSessionController\(this\)\.startSession\(\);\s*\}/.test(
      cardSource,
    ),
    true,
  );
  assert.equal(
    /_stopTwoWayTalkSession\(\{ restoreLive = true \} = \{\}\) \{\s*await getTwoWayTalkSessionController\(this\)\.stopSession\(\{ restoreLive \}\);\s*\}/.test(
      cardSource,
    ),
    true,
  );
  assert.equal(
    twoWayTalkSessionControllerSource.includes(
      "export class TwoWayTalkSessionController",
    ),
    true,
  );
  assert.equal(
    twoWayTalkSessionControllerSource.includes(
      "startGo2RtcTwoWayTalkSession",
    ),
    true,
  );
  assert.equal(
    twoWayTalkSessionControllerSource.includes(
      "startHaDirectTwoWayTalkSession",
    ),
    true,
  );
  assert.equal(
    twoWayTalkSessionControllerSource.includes(
      "host._go2rtcTwoWayTalkBackchannel.connect",
    ),
    true,
  );
  assert.equal(
    twoWayTalkSessionControllerSource.includes(
      "host._haDirectTwoWayTalkBackchannel.connect",
    ),
    true,
  );
});

test("two-way-talk labels and markup are owned by its feature template", () => {
  assert.equal(
    twoWayTalkControlsControllerSource.includes(
      'from "./controls.tmpl.js";',
    ),
    true,
  );
  assert.equal(
    cardSource.includes(
      'from "../features/two-way-talk/controls.tmpl.js";',
    ),
    false,
  );
  assert.equal(cardSource.includes("const TWO_WAY_TALK_LABELS"), false);
  assert.equal(
    cardSource.includes('<button class="info-row-mic-btn'),
    false,
  );
  assert.equal(
    twoWayTalkControlsTemplateSource.includes(
      "export function buildTwoWayTalkControlRowMarkup",
    ),
    true,
  );
  assert.equal(
    twoWayTalkControlsTemplateSource.includes(
      "export function buildTwoWayTalkButtonMarkup",
    ),
    true,
  );
  assert.equal(
    twoWayTalkControlsTemplateSource.includes(
      "export function buildTwoWayTalkMicrophoneMuteButtonMarkup",
    ),
    true,
  );
});

test("two-way-talk DOM synchronization is owned by its controls controller", () => {
  assert.equal(
    cardSource.includes(
      'from "../features/two-way-talk/controls.ctrl.js";',
    ),
    true,
  );
  assert.equal(
    cardSource.includes("new TwoWayTalkControlsController(this)"),
    true,
  );
  assert.equal(
    /_syncTwoWayTalkButton\(\) \{\s*getTwoWayTalkControlsController\(this\)\.syncButton\(\);\s*\}/.test(
      cardSource,
    ),
    true,
  );
  assert.equal(cardSource.includes("button.hidden = !visible;"), false);
  assert.equal(
    twoWayTalkControlsControllerSource.includes(
      "export class TwoWayTalkControlsController",
    ),
    true,
  );
  assert.equal(
    twoWayTalkControlsControllerSource.includes(
      "button.hidden = !visible;",
    ),
    true,
  );
  assert.equal(
    twoWayTalkControlsControllerSource.includes(
      "host._syncTwoWayTalkSoundwaveSurface?.();",
    ),
    true,
  );
  assert.equal(
    /_buildTwoWayTalkControlRowMarkup\([^)]*\) \{[\s\S]*?getTwoWayTalkControlsController\(this\)\.buildControlRowMarkup\(/.test(
      cardSource,
    ),
    true,
  );
  assert.equal(
    twoWayTalkControlsControllerSource.includes(
      "buildControlRowMarkup({ includeIncomingAudioMute = true } = {})",
    ),
    true,
  );
});

test("event list thumbnails use browser lazy loading", () => {
  assert.equal((source.match(/loading="lazy"/g) || []).length >= 3, true);
});

test("the configuration editor is excluded from the startup bundle", () => {
  assert.equal(indexSource.includes("FrigateViewCardEditor"), false);
  assert.equal(source.includes("FrigateViewCardEditor"), false);
  assert.equal(editorBundleSource.includes("editor-choice-field"), true);
  assert.match(
    cardSource,
    /editorUrl\.searchParams\.set\("fvc-version", VERSION\);/,
  );
  assert.match(cardSource, /await import\(editorUrl\.href\);/);
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
  const setConfigStart = cardSource.indexOf("  setConfig(config) {");
  const hassSetterIndex = cardSource.indexOf(
    "  set hass(hass) {",
    setConfigStart,
  );
  const setConfigSource = cardSource.slice(setConfigStart, hassSetterIndex);
  const provisionalShellIndex = cardSource.indexOf(
    "this._pageNavigationController.prepareConfiguredLandingPageShell({",
  );
  const discoverIndex = cardSource.indexOf("await this._discoverAll();");
  const finalShellIndex = cardSource.indexOf(
    "this._pageNavigationController.prepareConfiguredLandingPageShell({",
    provisionalShellIndex + 1,
  );
  const initialLoadIndex = cardSource.indexOf(
    "const initialLoad = this._browseWindowLoaderController.loadWindow(true);",
  );
  const landingPageIndex = cardSource.search(
    /this\._pageNavigationController\.navigateToConfiguredLandingPage\([\s\S]*?source:\s*"startup"[\s\S]*?startup:\s*true[\s\S]*?hasPendingDeepLinkTarget,/,
  );

  assert.equal(
    setConfigSource.includes("primeConfiguredLandingPageShell"),
    false,
  );
  assert.ok(provisionalShellIndex > hassSetterIndex);
  assert.ok(discoverIndex > provisionalShellIndex);
  assert.ok(finalShellIndex > discoverIndex);
  assert.equal(
    cardSource.includes(
      "this._deepLinkController.hasParsedDeepLinkTarget()",
    ),
    true,
  );
  assert.match(
    cardSource,
    /if \(!this\._deepLinkController\.hasParsedDeepLinkTarget\(\)\) \{\s*this\._activeCamIdx = 0;\s*this\._activeGroupMemberOverride = "";\s*\}/,
  );
  assert.ok(initialLoadIndex >= 0);
  assert.ok(initialLoadIndex > finalShellIndex);
  assert.ok(landingPageIndex > initialLoadIndex);
  assert.doesNotMatch(cardSource, /_shouldStartInGridMode/);
  assert.doesNotMatch(cardSource, /_applyStartInGridMode/);
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
      cardSource,
    ),
    true,
  );
  assert.equal(
    /_activateWideViewPageRoute\(context = \{\}\) \{\s*this\._wideViewPageController\.activateWideViewPageRoute\(context\);\s*\}/s.test(
      cardSource,
    ),
    true,
  );
});

test("preview helpers delegate through the preview page controller", () => {
  assert.equal(
    /_isPreviewPageEnabled\(\)\s*\{\s*return this\._previewPageController\.isPreviewPageEnabled\(\);\s*\}/s.test(
      cardSource,
    ),
    true,
  );
  assert.equal(
    /_isPreviewPageActive\(\)\s*\{\s*return this\._previewPageController\.isPreviewPageActive\(\);\s*\}/s.test(
      cardSource,
    ),
    true,
  );
  assert.equal(cardSource.includes("_previewLiveCamerasEnabled() {"), false);
  assert.equal(cardSource.includes("_previewShowTitleBarsEnabled() {"), false);
  assert.equal(cardSource.includes("_previewCellSeverity(entity) {"), false);
  assert.equal(
    /_applyPreviewShellVisibility\(\) \{\s*if \(this\._isPreviewPageEnabled\(\) && this\._isPreviewPageActive\(\)\) \{\s*this\._ensurePreviewLayoutShell\(\);\s*\} else \{\s*this\._removePreviewLayoutShell\(\);\s*\}\s*this\._previewPageController\.applyPreviewShellVisibility\(\);\s*\}/s.test(
      cardSource,
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
  for (const forbiddenCardTemplate of [
    "../../card/shell.tmpl.js",
    "../../card/toolbar.tmpl.js",
  ]) {
    assert.equal(
      previewPageControllerSource.includes(forbiddenCardTemplate),
      false,
    );
  }
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
    /import\s*\{[\s\S]*?EditorPreviewContextController[\s\S]*?\}\s*from "\.\.\/features\/editor-preview\/context\.ctrl\.js";/.test(
      cardSource,
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
    /_applyCardStyle\(\) \{\s*this\._cardStyleController\.applyCardStyle\(\);\s*this\._haPageBackgroundController\?\.sync\?\.\(\);\s*\}/s.test(
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
    /_isMobileTabletViewport\(\) \{\s*return this\._viewportContextController\.isMobileTabletViewport\(\);\s*\}/s.test(
      cardSource,
    ),
    true,
  );
  assert.equal(cardSource.includes("_isMobilePhoneViewport"), false);
  assert.equal(
    viewportContextControllerSource.includes("isMobilePhoneViewport"),
    false,
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

test("browse controller composition is browse-owned", () => {
  assert.equal(
    cardSource.includes("createBrowseControllers,") &&
      cardSource.includes('from "../features/browse/composition.js";'),
    true,
  );
  assert.equal(
    cardSource.includes(
      "Object.assign(this, createBrowseControllers(this));",
    ),
    true,
  );
  for (const controllerName of [
    "BrowseCalendarActivityController",
    "BrowseCalendarPanelController",
    "BrowseCollectionController",
    "BrowseFavoriteMutationController",
    "BrowseFilterController",
    "BrowseTabDataController",
    "BrowseWindowLoaderController",
  ]) {
    assert.equal(cardSource.includes(`new ${controllerName}`), false);
    assert.equal(browseCompositionSource.includes(`new ${controllerName}`), true);
  }
});

test("favorite mutation state and persistence are browse-owned", () => {
  assert.equal(cardSource.includes("buildFavoriteOptimisticMutation"), false);
  assert.equal(cardSource.includes("buildFavoriteRollbackMutation"), false);
  assert.equal(
    /_toggleFav\(id, options = \{\}\) \{\s*return this\._browseFavoriteMutationController\.toggle\(id, options\);\s*\}/s.test(
      cardSource,
    ),
    true,
  );
  assert.equal(
    browseFavoriteMutationControllerSource.includes(
      "export class BrowseFavoriteMutationController",
    ),
    true,
  );
  assert.equal(
    browseFavoriteMutationControllerSource.includes(
      "export const buildFavoriteOptimisticMutation",
    ),
    true,
  );
  assert.equal(
    browseCompositionSource.includes(
      "new BrowseFavoriteMutationController(card)",
    ),
    true,
  );
  assert.equal(
    fs.existsSync(
      new URL("../src/shared/favorite-mutation.js", import.meta.url),
    ),
    false,
  );
});

test("browse event and review item presentation is browse-owned", () => {
  assert.equal(cardSource.includes("buildEventListItemModel"), false);
  assert.equal(cardSource.includes("buildEventListItemHtml"), false);
  assert.equal(cardSource.includes("buildReviewListItemModel"), false);
  assert.equal(cardSource.includes("buildReviewListItemHtml"), false);
  assert.equal(cardSource.includes("labelColor"), false);
  assert.equal(
    cardSource.includes(
      "return renderBrowseEventListItem(this, ev, expanded, compact);",
    ),
    true,
  );
  assert.equal(
    cardSource.includes(
      "return renderBrowseReviewListItem(this, review, options);",
    ),
    true,
  );
  assert.equal(
    browseItemPresentationControllerSource.includes(
      "export const renderBrowseEventListItem",
    ),
    true,
  );
  assert.equal(
    browseItemPresentationControllerSource.includes(
      "export const renderBrowseReviewListItem",
    ),
    true,
  );
  assert.equal(
    browseCompositionSource.includes("renderBrowseEventListItem,"),
    true,
  );
});

test("Frigate event duration mapping is integration-owned", () => {
  assert.equal(cardSource.includes("_dur(ev)"), false);
  assert.equal(cardSource.includes("_eventMediaDuration(ev)"), false);
  assert.equal(
    cardSource.includes("resolveFrigateEventPrePostRollRange"),
    false,
  );
  assert.equal(
    frigateEventMediaSource.includes(
      "export const resolveFrigateEventDuration",
    ),
    true,
  );
  assert.equal(
    frigateEventMediaSource.includes(
      "export const resolveFrigateEventMediaDuration",
    ),
    true,
  );
  assert.equal(
    browseItemPresentationControllerSource.includes(
      "resolveFrigateEventMediaDuration",
    ),
    true,
  );
  assert.equal(
    popupCompositionSource.includes("resolveFrigateEventDuration"),
    true,
  );
  assert.equal(
    wideViewCompositionSource.includes(
      "resolveFrigateEventMediaDuration",
    ),
    true,
  );
});

test("browse calendar activity helpers delegate through the browse calendar activity controller", () => {
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
    /_resetCalendarSelection\(\) \{\s*this\._browseCalendarPanelController\.resetCalendarSelection\(\);\s*\}/s.test(
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
    browseCalendarPanelControllerSource.includes("resetCalendarSelection()"),
    true,
  );
  assert.equal(
    browseCalendarPanelControllerSource.includes("renderCal()"),
    true,
  );
});

test("browse collection helpers delegate through the browse collection controller", () => {
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
    /async _loadGridMixedTabData\(tab, options = \{\}\) \{\s*await this\._browseCollectionController\.loadGridMixedTabData\(tab, options\);\s*\}/s.test(
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
      "async loadGridMixedTabData(tab, { onProgress = null } = {})",
    ),
    true,
  );
  assert.equal(
    browseCollectionControllerSource.includes("allDisplayEvents()"),
    true,
  );
});

test("browse filter helpers delegate through the browse filter controller", () => {
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
    /async loadWindow\(\s*replace,\s*\{ supersede = false, reuseRecentCache = false \} = \{\},\s*\)/.test(
      browseWindowLoaderControllerSource,
    ),
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
    "../../card/shell.tmpl.js",
    "../../card/toolbar.tmpl.js",
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
  for (const forbiddenCardTemplate of [
    "../../card/shell.tmpl.js",
    "../../card/toolbar.tmpl.js",
  ]) {
    assert.equal(
      mobileViewPageTemplateSource.includes(forbiddenCardTemplate),
      false,
    );
  }
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

test("Mobile View controller composition is feature-owned", () => {
  assert.equal(
    cardSource.includes(
      'import { createMobileViewControllers } from "../features/mobile-view/composition.js";',
    ),
    true,
  );
  assert.equal(
    cardSource.includes(
      "Object.assign(this, createMobileViewControllers(this));",
    ),
    true,
  );
  assert.equal(cardSource.includes("new MobileViewPageController"), false);
  assert.equal(cardSource.includes("new MobileCamSwitcherController"), false);
  assert.equal(
    mobileViewCompositionSource.includes("new MobileViewPageController"),
    true,
  );
  assert.equal(
    mobileViewCompositionSource.includes("new MobileCamSwitcherController"),
    true,
  );
  assert.equal(
    mobileViewCompositionSource.includes(
      '"[data-mobile-cam-picker]"',
    ),
    true,
  );
});

test("Slideshow controller composition is feature-owned", () => {
  assert.equal(
    cardSource.includes(
      'import { createSlideshowControllers } from "../features/slideshow/composition.js";',
    ),
    true,
  );
  assert.equal(
    cardSource.includes(
      "Object.assign(this, createSlideshowControllers(this));",
    ),
    true,
  );
  assert.equal(cardSource.includes("new SlideshowAlertController"), false);
  assert.equal(cardSource.includes("new SlideshowPageController"), false);
  assert.equal(
    slideshowCompositionSource.includes("new SlideshowAlertController"),
    true,
  );
  assert.equal(
    slideshowCompositionSource.includes("new SlideshowPageController"),
    true,
  );
  assert.equal(
    slideshowCompositionSource.includes("SLIDESHOW_REVIEW_WATCH_MIN_MS"),
    true,
  );
  assert.equal(
    slideshowCompositionSource.includes("SLIDESHOW_REVIEW_WATCH_MAX_MS"),
    true,
  );
});

test("Preview controller composition is feature-owned", () => {
  assert.equal(
    cardSource.includes(
      'import { initializePreviewControllers } from "../features/preview/composition.js";',
    ),
    true,
  );
  assert.equal(
    cardSource.includes(
      "initializePreviewControllers(this);",
    ),
    true,
  );
  assert.equal(cardSource.includes("new PreviewAlertController"), false);
  assert.equal(cardSource.includes("new PreviewPageController"), false);
  assert.equal(
    previewCompositionSource.includes("new PreviewAlertController"),
    true,
  );
  assert.equal(
    previewCompositionSource.includes("new PreviewPageController"),
    true,
  );
  assert.equal(
    previewCompositionSource.includes("PREVIEW_ALERT_END_GRACE_MS"),
    true,
  );
  assert.equal(
    previewCompositionSource.includes("DEVICE_PROFILE,"),
    true,
  );
});

test("Home Assistant dashboard controller composition is integration-owned", () => {
  assert.equal(
    cardSource.includes(
      'import { createHomeAssistantDashboardControllers } from "../integrations/home-assistant/dashboard-composition.js";',
    ),
    true,
  );
  assert.equal(
    cardSource.includes(
      "Object.assign(this, createHomeAssistantDashboardControllers(this));",
    ),
    true,
  );
  assert.equal(cardSource.includes("new HomeAssistantNavbarController"), false);
  assert.equal(
    cardSource.includes("new HomeAssistantDashboardSwipeNavigationController"),
    false,
  );
  assert.equal(
    cardSource.includes("new HomeAssistantPageBackgroundController"),
    false,
  );
  assert.equal(
    haDashboardCompositionSource.includes(
      "new HomeAssistantNavbarController(card, options)",
    ),
    true,
  );
  assert.equal(
    haDashboardCompositionSource.includes(
      "new HomeAssistantDashboardSwipeNavigationController(card, options)",
    ),
    true,
  );
  assert.equal(
    haDashboardCompositionSource.includes(
      "new HomeAssistantPageBackgroundController(card)",
    ),
    true,
  );
  assert.equal(
    haDashboardCompositionSource.includes(
      'source: "dashboard-swipe"',
    ),
    true,
  );
});

test("Wide View controller composition is owned by the Wide View feature", () => {
  assert.equal(
    cardSource.includes(
      'from "../features/wide-view/composition.js"',
    ),
    true,
  );
  assert.equal(
    cardSource.includes("createWideViewCompanionController(this)"),
    true,
  );
  assert.equal(
    cardSource.includes("createWideViewTimelineControllers(this)"),
    true,
  );
  assert.equal(cardSource.includes("new WideViewCompanionController"), false);
  assert.equal(cardSource.includes("new WideViewTimelineController"), false);
  assert.equal(cardSource.includes("new WideViewPageController"), false);
  assert.equal(
    cardSource.includes("resolveWideTimelineCameraContextKey"),
    false,
  );
  assert.equal(
    wideViewCompositionSource.includes("new WideViewCompanionController"),
    true,
  );
  assert.equal(
    wideViewCompositionSource.includes("new WideViewTimelineController"),
    true,
  );
  assert.equal(
    wideViewCompositionSource.includes("new WideViewPageController"),
    true,
  );
  assert.equal(
    wideViewCompositionSource.includes(
      "resolveWideTimelineCameraContextKey({",
    ),
    true,
  );
  assert.equal(
    wideViewCompositionSource.includes(
      "card._popupMediaLoaderController?.showClipById",
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
    false,
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

test("recordings button-transition stages do not bind a browse swipe gesture", () => {
  assert.equal(cardSource.includes("RecordingsSwipeController,"), true);
  assert.equal(
    /this\._recordingsSwipeController\s*=\s*new RecordingsSwipeController\(\{/.test(
      cardSource,
    ),
    true,
  );
  assert.equal(cardSource.includes("_recordingsSwipeGesture"), false);
  assert.equal(cardSource.includes("_recordingsSwipeBlockTap"), false);
  assert.equal(
    /this\._recordingsSwipeController\.bind\(\)/.test(cardSource),
    false,
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
    /_bounceRecordingsArea\(direction\) \{\s*this\._recordingsSwipeController\?\.bounceArea\(direction\);\s*\}/s.test(
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
    false,
  );
  assert.equal(recordingsSwipeControllerSource.includes("bind()"), false);
  assert.equal(recordingsSwipeControllerSource.includes("pointerdown"), false);
  assert.equal(recordingsSwipeControllerSource.includes("pointermove"), false);
});

test("popup media loading delegates through the popup media loader controller", () => {
  assert.equal(
    cardSource.includes(
      'import { createPopupControllers } from "../features/popup/composition.js";',
    ),
    true,
  );
  assert.equal(
    cardSource.includes("Object.assign(this, createPopupControllers(this));"),
    true,
  );
  assert.equal(cardSource.includes("new PopupMediaLoaderController"), false);
  assert.equal(
    popupCompositionSource.includes(
      "new PopupMediaLoaderController(card, options)",
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
    cardSource.includes('from "../features/popup/carousel.ctrl.js"'),
    false,
  );
  assert.equal(
    popupCompositionSource.includes('from "./carousel.ctrl.js"'),
    true,
  );
  assert.equal(
    cardSource.includes('from "../features/popup/drag.ctrl.js"'),
    false,
  );
  assert.equal(
    popupLifecycleControllerSource.includes('from "./drag.ctrl.js"'),
    true,
  );
  assert.equal(
    cardSource.includes('from "../features/popup/media.ctrl.js"'),
    false,
  );
  assert.equal(
    popupCompositionSource.includes('from "./media.ctrl.js"'),
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
    popupMediaLoaderControllerSource.includes(
      "showRecording(start, end, opts = {})",
    ),
    true,
  );
  assert.equal(
    /async tryRecordingSource\(\s*video,\s*src,/.test(
      popupMediaLoaderControllerSource,
    ),
    true,
  );
});

test("popup info rendering and actions are owned by the popup feature", () => {
  assert.equal(
    cardSource.includes(
      'import { PopupInfoController } from "../features/popup/info.ctrl.js";',
    ),
    false,
  );
  assert.equal(
    cardSource.includes("this._popupInfoController = new PopupInfoController"),
    false,
  );
  assert.equal(
    popupCompositionSource.includes('from "./info.ctrl.js"'),
    true,
  );
  assert.equal(
    popupCompositionSource.includes("new PopupInfoController(options)"),
    true,
  );
  assert.equal(cardSource.includes("_popupInfoModel("), false);
  assert.equal(cardSource.includes("_renderPopupInfo("), false);
  assert.equal(cardSource.includes('class="popup-info-actions"'), false);
  assert.equal(
    popupInfoControllerSource.includes("export class PopupInfoController"),
    true,
  );
  assert.equal(
    popupInfoControllerSource.includes("handleClick(event, target"),
    true,
  );
  assert.equal(
    popupInfoSource.includes("export const buildPopupInfoModel"),
    true,
  );
  assert.equal(
    popupInfoSource.includes("export const buildPopupInfoMarkup"),
    true,
  );
  assert.equal(
    popupMediaLoaderControllerSource.includes(
      "this._infoController?.render(infoEvent, infoOpts)",
    ),
    true,
  );
});

test("popup carousel rendering and lifecycle are owned by the popup feature", () => {
  assert.equal(
    cardSource.includes(
      'import { PopupCarouselController } from "../features/popup/carousel.ctrl.js";',
    ),
    false,
  );
  assert.equal(
    cardSource.includes(
      "this._popupCarouselController = new PopupCarouselController",
    ),
    false,
  );
  assert.equal(
    popupCompositionSource.includes("new PopupCarouselController(options)"),
    true,
  );
  assert.equal(cardSource.includes("_renderPopupCarousel("), false);
  assert.equal(cardSource.includes("_syncPopupCarouselNavigation("), false);
  assert.equal(cardSource.includes("_scrollPopupCarousel("), false);
  assert.equal(cardSource.includes("_popupCarouselScrollPlan("), false);
  assert.equal(cardSource.includes("PopupCarouselSwipeController"), false);
  assert.equal(
    popupCarouselControllerSource.includes(
      "export class PopupCarouselController",
    ),
    true,
  );
  assert.equal(
    popupMediaLoaderControllerSource.includes(
      "this._carouselController?.render(",
    ),
    true,
  );
});

test("popup media controls and visibility are owned by the popup feature", () => {
  assert.equal(
    cardSource.includes(
      'import { PopupMediaControlsSurfaceController } from "../features/popup/media.ctrl.js";',
    ),
    false,
  );
  assert.equal(
    cardSource.includes("new PopupMediaControlsSurfaceController"),
    false,
  );
  assert.equal(
    popupCompositionSource.includes(
      "new PopupMediaControlsSurfaceController(options)",
    ),
    true,
  );
  assert.equal(cardSource.includes("_showPopupControlsTemporarily("), false);
  assert.equal(cardSource.includes("_updatePopupMediaButtons("), false);
  assert.equal(cardSource.includes("_togglePopupMediaPlay("), false);
  assert.equal(cardSource.includes("_togglePopupMediaMute("), false);
  assert.equal(cardSource.includes("_initPopupMediaControls("), false);
  assert.equal(cardSource.includes("_popupControlsHideTimer"), false);
  assert.equal(
    popupMediaControlsControllerSource.includes(
      "export class PopupMediaControlsSurfaceController",
    ),
    true,
  );
  assert.equal(
    popupMediaControlsControllerSource.includes("handleClick(target)"),
    true,
  );
  assert.equal(
    popupMediaControlsControllerSource.includes("handleKeyboardPlayback(event)"),
    true,
  );
  assert.equal(
    cardSource.includes("setKeyboardPlaybackActive?.("),
    false,
  );
  assert.equal(
    cardSource.includes(
      'this._fullscreen(viewer?.closest?.(".popup-body") || viewer);',
    ),
    false,
  );
  assert.equal(
    popupMediaLoaderControllerSource.includes(
      "this._mediaControlsController?.initialize(",
    ),
    true,
  );
  assert.equal(
    popupMediaLoaderControllerSource.includes(
      "this._mediaControlsController?.resetWithoutVideo(",
    ),
    true,
  );
});

test("popup toolbar actions are owned by the popup feature", () => {
  assert.equal(
    popupCompositionSource.includes('from "./toolbar.ctrl.js"'),
    true,
  );
  assert.equal(
    popupCompositionSource.includes("new PopupToolbarController(options)"),
    true,
  );
  assert.equal(
    popupCompositionSource.includes(
      "_popupToolbarController: popupToolbarController",
    ),
    true,
  );
  assert.match(
    cardSource,
    /_handlePopupMediaToolbarClick\(target\) \{\s*return this\._popupToolbarController\.handleClick\(target\);\s*\}/,
  );
  assert.equal(
    cardSource.includes('target.closest("#popup-take-snapshot-btn")'),
    false,
  );
  assert.equal(
    cardSource.includes('target.closest("#popup-pip-btn")'),
    false,
  );
  assert.equal(
    popupToolbarControllerSource.includes("export class PopupToolbarController"),
    true,
  );
  assert.equal(
    popupToolbarControllerSource.includes('"#popup-take-snapshot-btn"'),
    true,
  );
  assert.equal(
    popupToolbarControllerSource.includes(
      '"#popup-media-fs, #popup-mobile-fs-btn"',
    ),
    true,
  );
  assert.equal(
    popupToolbarControllerSource.includes('"[data-carousel-dir]"'),
    true,
  );
});

test("live media toolbar actions are owned by the live feature", () => {
  assert.equal(
    cardSource.includes(
      "return this._liveMediaToolbarController.handleClick(target);",
    ),
    true,
  );
  assert.equal(cardSource.includes('target.closest("#live-pip-btn")'), false);
  assert.equal(
    cardSource.includes('target.closest("#live-take-snapshot-btn")'),
    false,
  );
  assert.equal(cardSource.includes('target.closest("#live-fs-btn")'), false);
  assert.equal(
    liveMediaToolbarControllerSource.includes(
      "export class LiveMediaToolbarController",
    ),
    true,
  );
  assert.equal(
    liveMediaToolbarControllerSource.includes('"#live-pip-btn"'),
    true,
  );
  assert.equal(
    liveMediaToolbarControllerSource.includes(
      '"#live-take-snapshot-btn"',
    ),
    true,
  );
  assert.equal(
    liveMediaToolbarControllerSource.includes('"#live-fs-btn"'),
    true,
  );
});

test("popup recording scrub coordination is owned by the popup feature", () => {
  assert.equal(
    cardSource.includes(
      'import { PopupRecordingScrubController } from "../features/popup/recording-scrub.ctrl.js";',
    ),
    false,
  );
  assert.equal(
    cardSource.includes("new PopupRecordingScrubController"),
    false,
  );
  assert.equal(
    popupCompositionSource.includes("new PopupRecordingScrubController(options)"),
    true,
  );
  assert.equal(cardSource.includes("_initRecordingScrub("), false);
  assert.equal(cardSource.includes("_teardownRecordingScrub("), false);
  assert.equal(cardSource.includes("_fetchRecordingAlerts("), false);
  assert.equal(cardSource.includes("_recordingScrubState"), false);
  assert.equal(
    popupRecordingScrubControllerSource.includes(
      "export class PopupRecordingScrubController",
    ),
    true,
  );
  assert.equal(
    popupMediaLoaderControllerSource.includes(
      "this._recordingScrubController?.initialize(",
    ),
    true,
  );
});

test("popup lifecycle and recording transport cleanup are feature-owned", () => {
  assert.equal(
    cardSource.includes(
      'import { PopupLifecycleController } from "../features/popup/lifecycle.ctrl.js";',
    ),
    false,
  );
  assert.equal(
    cardSource.includes("new PopupLifecycleController"),
    false,
  );
  assert.equal(
    popupCompositionSource.includes("new PopupLifecycleController(options)"),
    true,
  );
  assert.equal(cardSource.includes("_openPopup()"), false);
  assert.equal(cardSource.includes("_closePopup()"), false);
  assert.equal(cardSource.includes("_stopPopupMedia()"), false);
  assert.equal(cardSource.includes("_clearPopupMediaCleanup()"), false);
  assert.equal(cardSource.includes("_popupDragController"), false);
  assert.equal(cardSource.includes("_popupMediaStopTimer"), false);
  assert.equal(cardSource.includes("_recordingHls"), false);
  assert.equal(cardSource.includes("_hlsJsCtorPromise"), false);
  assert.equal(cardSource.includes("_recordingPreferHls()"), false);
  assert.equal(cardSource.includes("_ensurePopupPlaybackButtons"), false);
  assert.equal(cardSource.includes("this._playing"), false);
  assert.equal(
    popupLifecycleControllerSource.includes(
      "export class PopupLifecycleController",
    ),
    true,
  );
  assert.equal(
    popupLifecycleControllerSource.includes(
      "clearMediaCleanup({ preserveCarousel = true } = {})",
    ),
    true,
  );
  assert.equal(
    popupMediaLoaderControllerSource.includes("clearRecordingTransport()"),
    true,
  );
  assert.equal(
    popupMediaLoaderControllerSource.includes("this._host._recordingHls"),
    false,
  );
  assert.equal(
    popupMediaControlsControllerSource.includes(
      "ensurePlaybackButtons(mediaType",
    ),
    true,
  );
});

test("Frigate download routing is owned by the Frigate integration", () => {
  assert.equal(
    cardSource.includes(
      'import { FrigateMediaDownloadController } from "../integrations/frigate/media-download.ctrl.js";',
    ),
    true,
  );
  assert.equal(
    cardSource.includes(
      "this._frigateMediaDownloadController = new FrigateMediaDownloadController",
    ),
    true,
  );
  assert.equal(cardSource.includes("_download(id, file)"), false);
  assert.equal(cardSource.includes("_downloadRecRange("), false);
  assert.equal(
    frigateUrlSource.includes(
      "export const buildFrigateNotificationMediaPath",
    ),
    true,
  );
  assert.equal(
    frigateUrlSource.includes("export const buildFrigateEventDownloadPlan"),
    true,
  );
  assert.equal(
    frigateUrlSource.includes(
      "export const buildFrigateRecordingDownloadPlan",
    ),
    true,
  );
  assert.equal(
    frigateMediaDownloadControllerSource.includes(
      "export class FrigateMediaDownloadController",
    ),
    true,
  );
  assert.equal(
    sharedMediaDownloadSource.includes("export const triggerBrowserDownload"),
    true,
  );
});

test("Frigate media context and URL resolution are integration-owned", () => {
  assert.equal(
    cardSource.includes(
      'import { FrigateMediaResolverController } from "../integrations/frigate/media-resolver.ctrl.js";',
    ),
    true,
  );
  assert.equal(
    cardSource.includes(
      "new FrigateMediaResolverController(this)",
    ),
    true,
  );
  assert.equal(cardSource.includes("buildFrigateNotificationMediaPath"), false);
  assert.equal(cardSource.includes("buildFrigateReviewThumbnailPath"), false);
  assert.equal(
    /_frigateContextForCameraName\(cameraName = ""\) \{\s*return this\._frigateMediaResolverController\.contextForCameraName\(\s*cameraName,\s*\);\s*\}/s.test(
      cardSource,
    ),
    true,
  );
  assert.equal(
    frigateMediaResolverControllerSource.includes(
      "export class FrigateMediaResolverController",
    ),
    true,
  );
  assert.equal(
    frigateMediaResolverControllerSource.includes(
      "buildFrigateNotificationMediaPath",
    ),
    true,
  );
  assert.equal(
    frigateMediaResolverControllerSource.includes(
      "buildFrigateReviewThumbnailPath",
    ),
    true,
  );
});

test("localized date and HA timezone coordination are localization-owned", () => {
  assert.equal(
    cardSource.includes(
      'import { LocalizedDateController } from "../features/localization/date.ctrl.js";',
    ),
    true,
  );
  assert.equal(
    cardSource.includes(
      "this._localizedDateController = new LocalizedDateController(this);",
    ),
    true,
  );
  for (const removedImport of [
    "formatLocalizedMonthDay",
    "formatLocalizedTime",
    "applyLocalizedDates } from",
    "createDateFormatterCache",
  ]) {
    assert.equal(cardSource.includes(removedImport), false);
  }
  assert.equal(cardSource.includes("_resolvedBrowserTimeZone"), false);
  assert.equal(cardSource.includes("_dateFormatterCache"), false);
  assert.equal(
    localizedDateControllerSource.includes(
      "export class LocalizedDateController",
    ),
    true,
  );
  assert.equal(
    localizedDateControllerSource.includes("createDateFormatterCache"),
    true,
  );
  assert.equal(
    localizedDateControllerSource.includes("applyLocalizedDates"),
    true,
  );
  for (const delegate of [
    "timezone()",
    "timezoneDateTimeToEpochSeconds(",
    "timezoneParts(",
    "dateTimeLabel(",
    "applyLocalizedDates()",
    "calendarMonthLabel(",
  ]) {
    assert.equal(localizedDateControllerSource.includes(delegate), true);
  }
});

test("Frigate PTZ information requests are integration-owned", () => {
  assert.equal(cardSource.includes('type: "frigate/ptz/info"'), false);
  assert.equal(editorSource.includes('type: "frigate/ptz/info"'), false);
  assert.equal(cardSource.includes("fetchFrigatePtzInfo"), false);
  assert.equal(
    ptzCapabilityControllerSource.includes(
      'import { fetchFrigatePtzInfo } from "../../integrations/frigate/ptz-info.js";',
    ),
    true,
  );
  assert.equal(
    editorSource.includes(
      'import { fetchFrigatePtzInfo } from "../integrations/frigate/ptz-info.js";',
    ),
    true,
  );
  assert.equal(frigatePtzInfoSource.includes('type: "frigate/ptz/info"'), true);
  assert.equal(
    frigatePtzInfoSource.includes("normalizeFrigatePtzInfoResponse"),
    true,
  );
});

test("Home Assistant PTZ service execution is integration-owned", () => {
  assert.equal(
    cardSource.includes(
      'import { executeHomeAssistantPtzPlan } from "../integrations/home-assistant/ptz-service.js";',
    ),
    false,
  );
  assert.equal(
    ptzActionControllerSource.includes(
      'import { executeHomeAssistantPtzPlan } from "../../integrations/home-assistant/ptz-service.js";',
    ),
    true,
  );
  assert.equal(
    ptzActionControllerSource.includes(
      "await executeHomeAssistantPtzPlan({ hass: host._hass, plan });",
    ),
    true,
  );
  assert.equal(cardSource.includes("this._hass.callService"), false);
  assert.equal(
    homeAssistantPtzServiceSource.includes("hass.callService"),
    true,
  );
  assert.equal(
    homeAssistantPtzServiceSource.includes('executionMode === "parallel"'),
    true,
  );
});

test("PTZ action planning and execution coordination is feature-owned", () => {
  assert.equal(
    cardSource.includes(
      "this._ptzExec = createPtzActionController(this);",
    ),
    true,
  );
  assert.equal(cardSource.includes("_executePtzCameraAction"), false);
  assert.equal(cardSource.includes("resolvePtzServicePlan"), false);
  assert.equal(
    ptzActionControllerSource.includes(
      'import { resolvePtzServicePlan } from "./index.js";',
    ),
    true,
  );
  assert.equal(
    ptzActionControllerSource.includes("export const createPtzActionController"),
    true,
  );
  assert.equal(
    ptzCompositionSource.includes("createPtzActionController,"),
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
  assert.equal(
    ptzFeatureSource.includes("export const resolvePtzDisplayZoomPlan"),
    true,
  );
  assert.equal(ptzFeatureSource.includes("hasPtzZoomCapability"), false);
});

test("PTZ motion controller composition is feature-owned", () => {
  assert.equal(
    cardSource.includes("createPtzMotionController,") &&
      cardSource.includes('from "../features/ptz/composition.js";'),
    true,
  );
  assert.equal(
    cardSource.includes(
      "this._ptzMotionController = createPtzMotionController(this);",
    ),
    true,
  );
  assert.equal(cardSource.includes("new PtzMotionController"), false);
  assert.equal(
    ptzCompositionSource.includes("new PtzMotionController"),
    true,
  );
  assert.equal(ptzCompositionSource.includes("resolvePtzHoldPlan"), true);
});

test("PTZ capability loading and motion context are feature-owned", () => {
  assert.equal(
    cardSource.includes(
      "this._ptzCapabilityController = createPtzCapabilityController(this);",
    ),
    true,
  );
  assert.equal(cardSource.includes("_activeCameraPtzInfo()"), false);
  assert.equal(cardSource.includes("_ensureActiveCameraPtzInfo()"), false);
  assert.equal(cardSource.includes("_ensurePtzInfoForEntity("), false);
  assert.equal(cardSource.includes("_resolvePtzMotionContext()"), false);
  assert.equal(
    ptzCapabilityControllerSource.includes(
      "export const createPtzCapabilityController",
    ),
    true,
  );
  assert.equal(
    ptzCapabilityControllerSource.includes(
      "const ensureInfo = async (entity)",
    ),
    true,
  );
  assert.equal(
    ptzCapabilityControllerSource.includes(
      "const resolveContext = async ()",
    ),
    true,
  );
  assert.equal(
    ptzCompositionSource.includes("createPtzCapabilityController"),
    true,
  );
});

test("PTZ controls presentation and nested labels are feature-owned", () => {
  assert.equal(
    cardSource.includes(
      "return renderPtzControls(this, list);",
    ),
    true,
  );
  assert.equal(
    cardSource.includes("syncPtzControlsLabels(this);"),
    true,
  );
  assert.equal(cardSource.includes("buildControlsSectionMarkup"), false);
  assert.equal(cardSource.includes("syncControlsPadLabels"), false);
  assert.equal(cardSource.includes("hasPtzPanTiltCapability"), false);
  assert.equal(cardSource.includes("normalizePtzPresetNames"), false);
  assert.equal(cardSource.includes("isPtzHomePreset"), false);
  assert.equal(
    ptzControlsControllerSource.includes("buildControlsSectionMarkup"),
    true,
  );
  assert.equal(
    ptzControlsControllerSource.includes("syncControlsPadLabels"),
    true,
  );
  assert.equal(
    ptzControlsControllerSource.includes(
      "export const renderPtzControls",
    ),
    true,
  );
  assert.equal(
    ptzControlsControllerSource.includes(
      "export const syncPtzControlsLabels",
    ),
    true,
  );
  assert.equal(
    ptzCompositionSource.includes("renderPtzControls,"),
    true,
  );
});

test("PTZ interaction state and behavior are feature-owned", () => {
  assert.equal(
    cardSource.includes(
      "this._ptzInteractionController = createPtzInteractionController(this);",
    ),
    true,
  );
  assert.equal(cardSource.includes("this._activePtzButtonAction"), false);
  assert.equal(cardSource.includes("resolvePtzDisplayZoomPlan"), false);
  assert.equal(cardSource.includes("button.setPointerCapture"), false);
  assert.equal(
    ptzInteractionControllerSource.includes(
      "export class PtzInteractionController",
    ),
    true,
  );
  assert.equal(
    ptzInteractionControllerSource.includes("this._activePointer"),
    true,
  );
  assert.equal(
    ptzInteractionControllerSource.includes("resolvePtzDisplayZoomPlan"),
    true,
  );
  assert.equal(
    ptzCompositionSource.includes("new PtzInteractionController"),
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

test("Page Navigation controller composition is feature-owned", () => {
  assert.equal(
    cardSource.includes(
      'import { createPageNavigationController } from "../features/navigation/composition.js";',
    ),
    true,
  );
  assert.equal(
    cardSource.includes(
      "this._pageNavigationController = createPageNavigationController(this);",
    ),
    true,
  );
  assert.equal(cardSource.includes("new PageNavigationController"), false);
  assert.equal(
    navigationCompositionSource.includes("new PageNavigationController"),
    true,
  );
  assert.equal(
    navigationCompositionSource.includes("mapConfiguredLandingPage"),
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
  assert.equal(
    cardViewPageTemplateSource.includes(
      "export function buildCardViewMainLayoutShellMarkup",
    ),
    true,
  );
  for (const templatePath of [
    "../single-view/page.tmpl.js",
    "../mobile-view/page.tmpl.js",
    "../wide-view/page.tmpl.js",
    "../preview/page.tmpl.js",
    "../card-view/page.tmpl.js",
  ]) {
    assert.equal(pageShellRegistrySource.includes(templatePath), true);
  }
  assert.equal(
    cardShellTemplateSource.includes(
      "export function buildMainLayoutShellMarkup",
    ),
    false,
  );
});

test("page profiles own toolbar classes and normalize live-control classes", () => {
  for (const profileEntry of [
    'tabsButtonClass: "icon-btn"',
    'toolsButtonClass: "icon-btn"',
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
  assert.equal(pageShellRegistrySource.includes("liveRotateButtonClass"), false);
  assert.equal(cardSource.includes("_syncRotateOverlayButtons"), false);
  assert.equal(
    toolbarTemplateSource.includes('buttonClass = "tool"'),
    true,
  );
  assert.equal(cardSource.includes("./controls/"), false);
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
    /:host\s*\{[\s\S]*?--c-bg-main: var\(--editor-primary-bg\);/.test(
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

test("editor starts with closed settings and expands only its HA preview host", () => {
  assert.equal(
    editorSource.includes('this._activeSettingsPanelId = null;'),
    true,
  );
  assert.equal(
    editorSource.includes(
      'const activeSettingsPanel = this._activeSettingsPanelId ?? null;',
    ),
    true,
  );
  assert.equal(
    /dialogHost\?\.shadowRoot \|\| dialogHost,\s*"\.element-preview",/.test(
      editorSource,
    ),
    true,
  );
  assert.equal(
    editorSource.includes(
      'target.style.setProperty("max-width", "none", "important");',
    ),
    true,
  );
  assert.equal(editorSource.includes("_editorPreviewLayoutTargets(preview)"), true);
  assert.equal(editorSource.includes('"hui-section[preview]"'), true);
  assert.equal(editorSource.includes('".card.full-width"'), true);
  assert.equal(editorSource.includes("_restoreEditorPreviewLayout();"), true);
});

test("editor timezone readout links to the Home Assistant profile", () => {
  assert.equal(editorSource.includes('class="timezone-readout"'), true);
  assert.equal(editorSource.includes('href="/profile/general"'), true);
  assert.equal(editorSource.includes('class="field-helper timezone-helper"'), true);
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

test("page route shell replacement preserves the outer shell and live wrapper", () => {
  const preserveStart = cardSource.indexOf("_renderShellPreserveLive() {");
  const fallbackStart = cardSource.indexOf(
    "_renderFullShellPreserveLive(preservedEngWrap) {",
    preserveStart,
  );
  const preserveSource = cardSource.slice(preserveStart, fallbackStart);
  const buildIndex = preserveSource.indexOf(
    "this._buildActivePageMainLayoutShellMarkup().trim()",
  );
  const restoreIndex = preserveSource.indexOf(
    "nextEngWrap.replaceWith(preservedEngWrap);",
  );
  const layoutCommitIndex = preserveSource.indexOf(
    "currentLayout.replaceWith(nextLayout);",
  );

  assert.ok(buildIndex >= 0);
  assert.ok(restoreIndex > buildIndex);
  assert.ok(layoutCommitIndex > restoreIndex);
  assert.equal(preserveSource.includes("this._renderShell();"), true);
  assert.equal(
    preserveSource.includes("this.shadowRoot.innerHTML"),
    false,
  );
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
    /_renderList\(options = \{\}\) \{\s*this\._activeStandardPageController\(\)\.renderList\(options\);\s*\}/.test(
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
