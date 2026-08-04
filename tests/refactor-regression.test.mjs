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
  assert.equal(frigateUrlSource.includes("buildGo2rtcWsPath"), true);
  assert.equal(sharedUrlSource.includes("toAbsoluteSignedUrl"), true);
  assert.equal(
    /_mountGridCameraCellMedia\([\s\S]*?liveStreamHint === "mse" && this\._shouldUseGo2RtcForEntity\(entity\)/.test(
      source,
    ),
    true,
  );
  assert.equal(
    /_mountEngine\([\s\S]*?const useGo2Rtc = this\._shouldUseGo2RtcForEntity\(entity\);[\s\S]*?if \(\s*useGo2Rtc\s*&&/.test(
      source,
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
    /_mountEngine\([\s\S]*?_go2rtcRaceMounter\.mountWithRace\(\{[\s\S]*?entity,[\s\S]*?forcedType,[\s\S]*?mountToken,[\s\S]*?\}\)/.test(
      cardSource,
    ),
    true,
  );
  assert.equal(
    /_mountEngine\([\s\S]*?_haDirectMounter\.tryMount\([\s\S]*?streamType: transportPlan\.streamType/.test(
      cardSource,
    ),
    true,
  );
  assert.equal(
    /_mountEngine\([\s\S]*?const \{ mountToken, clearMountState \} = this\._beginLiveMountSession\(entity\);[\s\S]*?finally \{[\s\S]*?clearMountState\(\);[\s\S]*?\}/.test(
      source,
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
});
