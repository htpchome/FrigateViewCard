import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const source = fs.readFileSync(
  new URL("../frigate-view-card.js", import.meta.url),
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
    /attempt\.start\(\{\s*abortSignal,\s*entity:\s*targetEntity\s*\}\)/.test(
      source,
    ),
    true,
  );
});

test("go2rtc helpers honor per-camera HA direct policy guard", () => {
  assert.equal(
    /_shouldUseGo2RtcForEntity\(entity\) \{[\s\S]*?_cameraConnectionType\(key\) !== "ha_direct";[\s\S]*?\}/.test(
      source,
    ),
    true,
  );
  assert.equal(
    /_tryMountGo2RTCMSE\([\s\S]*?const entity = this\._resolveGo2RtcEntity\(options\?\.entity\);[\s\S]*?if \(!entity\) return false;/.test(
      source,
    ),
    true,
  );
  assert.equal(
    /_tryMountGo2RTCWebRTC\([\s\S]*?const entity = this\._resolveGo2RtcEntity\(options\?\.entity\);[\s\S]*?if \(!entity\) return false;/.test(
      source,
    ),
    true,
  );
  assert.equal(
    /_tryMountGo2RTCHLS\([\s\S]*?const entity = this\._resolveGo2RtcEntity\(options\?\.entity\);[\s\S]*?if \(!entity\) return false;/.test(
      source,
    ),
    true,
  );
  assert.equal(
    /_go2rtcHlsUrlForEntity\([\s\S]*?if \(!targetEntity\) return null;/.test(
      source,
    ),
    true,
  );
  assert.equal(
    /_resolveGo2RtcEntity\(entity = ""\) \{[\s\S]*?_shouldUseGo2RtcForEntity\(targetEntity\) \? targetEntity : "";[\s\S]*?\}/.test(
      source,
    ),
    true,
  );
  assert.equal(
    /_go2rtcWebSocketUrlForEntity\(entity\) \{[\s\S]*?const targetEntity = this\._resolveGo2RtcEntity\(entity\);/.test(
      source,
    ),
    true,
  );
  assert.equal(
    /_go2rtcContextForEntity\([^)]*\) \{[\s\S]*?_discoverOne\([^)]*\);[\s\S]*?makeGo2rtcCacheKey\(\{[\s\S]*?clientId[\s\S]*?cam[\s\S]*?\}\);[\s\S]*?\}/.test(
      source,
    ),
    true,
  );
  assert.equal(
    /_go2rtcWebSocketUrlForEntity\(entity\) \{[\s\S]*?const ctx = await this\._go2rtcContextForEntity\(targetEntity\);/.test(
      source,
    ),
    true,
  );
  assert.equal(
    /_signedGo2RtcWsPath\([^)]*\) \{[\s\S]*?auth\/sign_path[\s\S]*?_ffDebug\("Signed go2rtc ws path"[\s\S]*?\}/.test(
      source,
    ),
    true,
  );
  assert.equal(
    /_getGo2RtcWsCachedUrl\([^)]*\) \{[\s\S]*?getFreshCachedValue\([\s\S]*?_go2rtcWsUrlCache[\s\S]*?\}/.test(
      source,
    ),
    true,
  );
  assert.equal(
    /_cacheGo2RtcWsUrl\([^)]*\) \{[\s\S]*?setCachedValue\([\s\S]*?_go2rtcWsUrlCache[\s\S]*?GO2RTC_CACHE_TTL_MS\.wsSignedPath[\s\S]*?\}/.test(
      source,
    ),
    true,
  );
  assert.equal(
    /GO2RTC_CACHE_TTL_MS\s*=\s*Object\.freeze\([\s\S]*?wsSignedPath[\s\S]*?hlsPlaylist[\s\S]*?hlsNegative[\s\S]*?\)/.test(
      source,
    ),
    true,
  );
  assert.equal(
    /_go2rtcHlsUrlForEntity\(entity = ""\) \{[\s\S]*?const targetEntity = this\._resolveGo2RtcEntity\(entity\);/.test(
      source,
    ),
    true,
  );
  assert.equal(
    /_go2rtcHlsUrlForEntity\(entity = ""\) \{[\s\S]*?const ctx = await this\._go2rtcContextForEntity\(targetEntity\);/.test(
      source,
    ),
    true,
  );
  assert.equal(
    /_probeGo2RtcHlsCandidates\([^)]*\) \{[\s\S]*?isM3u8Response\([\s\S]*?setCachedValue\([\s\S]*?\}/.test(
      source,
    ),
    true,
  );
  assert.equal(
    /_toAbsoluteSignedPath\([^)]*\) \{[\s\S]*?toAbsoluteSignedUrl\(\{[\s\S]*?origin: window\.location\.origin[\s\S]*?\}\);[\s\S]*?\}/.test(
      source,
    ),
    true,
  );
  assert.equal(
    /_go2rtcWebSocketUrlForEntity\(entity\) \{[\s\S]*?this\._getGo2RtcWsCachedUrl\(cacheKey, nowMs\)[\s\S]*?const signedPath = await this\._signedGo2RtcWsPath\(path\);[\s\S]*?this\._toAbsoluteSignedPath\(signedPath\)[\s\S]*?this\._cacheGo2RtcWsUrl\(cacheKey, wsUrl, nowMs\)/.test(
      source,
    ),
    true,
  );
  assert.equal(
    /_go2rtcHlsUrlForEntity\(entity = ""\) \{[\s\S]*?this\._probeGo2RtcHlsCandidates\([\s\S]*?cacheKey/.test(
      source,
    ),
    true,
  );
  assert.equal(
    /GO2RTC_CACHE_TTL_MS\.hlsPlaylist/.test(source) &&
      /GO2RTC_CACHE_TTL_MS\.hlsNegative/.test(source) &&
      /GO2RTC_CACHE_TTL_MS\.wsSignedPath/.test(source),
    true,
  );
  assert.equal(
    /_go2rtcHlsUrlForEntity\([\s\S]*?return await this\._go2rtcHlsUrl\(\);/.test(
      source,
    ),
    false,
  );
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
    /_buildLiveStreamAttempts\(entity = ""[\s\S]*?const connectionType = this\._cameraConnectionType\(targetEntity\);/.test(
      source,
    ),
    true,
  );
  assert.equal(
    /_mountEngine\([\s\S]*?_buildLiveStreamAttempts\(entity, forcedType, slot\)/.test(
      source,
    ),
    true,
  );
  assert.equal(/async _go2rtcWebSocketUrl\(\)/.test(source), false);
  assert.equal(/async _go2rtcWebSocketUrlForMountEntity\(/.test(source), false);
  assert.equal(/async _go2rtcHlsUrl\(\)/.test(source), false);
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
  const awaitIndex = source.indexOf("await initialLoad;", landingPageIndex);

  assert.ok(initialLoadIndex >= 0);
  assert.ok(landingPageIndex > initialLoadIndex);
  assert.ok(awaitIndex > landingPageIndex);
});

test("deep-link helpers delegate through the controller wrappers", () => {
  assert.equal(
    source.includes(
      "_mergedUrlSearchParams() {\n    return this._deepLinkController.mergedUrlSearchParams();\n  }",
    ),
    true,
  );
  assert.equal(
    source.includes(
      "_clearDeepLinkParamsFromUrl() {\n    this._deepLinkController.clearDeepLinkParamsFromUrl();\n  }",
    ),
    true,
  );
  assert.equal(
    source.includes(
      "_initDeepLinkFromUrl() {\n    this._deepLinkController.initDeepLinkFromUrl();\n  }",
    ),
    true,
  );
  assert.equal(
    source.includes(
      "_deepLinkCameraHintIndex() {\n    return this._deepLinkController.deepLinkCameraHintIndex();\n  }",
    ),
    true,
  );
  assert.equal(
    source.includes(
      "_applyDeepLinkCameraHint() {\n    this._deepLinkController.applyDeepLinkCameraHint();\n  }",
    ),
    true,
  );
  assert.equal(
    source.includes(
      "_isDeepLinkCandidateForCard() {\n    return this._deepLinkController.isDeepLinkCandidateForCard();\n  }",
    ),
    true,
  );
  assert.equal(
    source.includes(
      "_consumeDeepLinkEventOpen() {\n    this._deepLinkController.consumeDeepLinkEventOpen();\n  }",
    ),
    true,
  );
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
