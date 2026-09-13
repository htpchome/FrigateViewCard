import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import {
  CARD_VIEW_OVERLAY_TIMING,
  MEDIA_OVERLAY_TIMING,
} from "../src/constants.js";

const cardSource = fs.readFileSync(
  new URL("../src/card/FrigateViewCard.js", import.meta.url),
  "utf8",
);
const toolbarTemplateSource = fs.readFileSync(
  new URL("../src/card/toolbar.tmpl.js", import.meta.url),
  "utf8",
);
const stylesSource = fs.readFileSync(
  new URL("../src/styles.js", import.meta.url),
  "utf8",
);
const mobileViewStylesSource = fs.readFileSync(
  new URL("../src/features/mobile-view/page.styles.js", import.meta.url),
  "utf8",
);
const popupMediaControlsSource = fs.readFileSync(
  new URL("../src/features/popup/media.ctrl.js", import.meta.url),
  "utf8",
);

test("tools markup owns filter and calendar panel hosts", () => {
  assert.equal(
    toolbarTemplateSource.includes('data-fvc-region="filter-panel"'),
    true,
  );
  assert.equal(
    toolbarTemplateSource.includes('data-fvc-region="calendar-panel"'),
    true,
  );
  assert.equal(cardSource.includes("this._createFilterPanel();"), false);
  assert.equal(cardSource.includes("this._createCalendarPanel();"), false);
});

test("camera switch checks the named calendar panel region", () => {
  assert.equal(
    cardSource.includes(
      'this._pageShellRegion("calendarPanel")?.style.display',
    ),
    true,
  );
  assert.equal(cardSource.includes('querySelector("#cal-panel")'), false);
});

test("two-way talk updates its existing region without repairing layout", () => {
  const start = cardSource.indexOf("_syncTwoWayTalkActionSlot() {");
  const end = cardSource.indexOf(
    "_syncMobileViewTwoWayTalkSlot()",
    start,
  );
  const methodSource = cardSource.slice(start, end);

  assert.equal(methodSource.includes("if (!existingSlot) return;"), true);
  assert.equal(methodSource.includes("document.createElement"), false);
  assert.equal(methodSource.includes("existingSlot?.remove()"), false);
  assert.equal(cardSource.includes("button.hidden = !visible;"), true);
});

test("two-way talk hidden button keeps the info row layout stable", () => {
  assert.equal(
    stylesSource.includes(
      ".info-row-mic-btn[hidden] {display: none !important;}",
    ),
    true,
  );
});

test("two-way talk exposes pending and active visual states", () => {
  assert.match(
    stylesSource,
    /\.info-row-mic-btn\.connecting::after\{[^}]*border-top-color:var\(--c-primary\);[^}]*animation:twoWayTalkConnectingSpin/,
  );
  assert.match(
    stylesSource,
    /@keyframes twoWayTalkConnectingSpin\{to\{transform:rotate\(360deg\);\}\}/,
  );

  const activeRuleStart = stylesSource.indexOf(".info-row-mic-btn.active{");
  const activeRuleEnd = stylesSource.indexOf("}", activeRuleStart);
  const activeRule = stylesSource.slice(activeRuleStart, activeRuleEnd);
  assert.equal(activeRule.includes("var(--c-on)"), true);
  assert.equal(activeRule.includes("box-shadow:inset"), true);
  assert.equal(activeRule.includes("color-mix"), false);
});

test("icon buttons reset native button chrome", () => {
  const start = stylesSource.indexOf(".icon-btn{");
  const end = stylesSource.indexOf(".icon-btn svg", start);
  const rule = stylesSource.slice(start, end);

  for (const declaration of [
    "appearance:none",
    "-webkit-appearance:none",
    "border:0",
    "background:transparent",
    "box-shadow:none",
  ]) {
    assert.equal(rule.includes(declaration), true);
  }
});

test("touch PTZ buttons reset retained hover styling when inactive", () => {
  assert.equal(
    stylesSource.includes("@media (hover:none), (pointer:coarse)"),
    true,
  );
  assert.equal(
    stylesSource.includes('.tool#controls-btn:not(.active):hover'),
    true,
  );
  assert.equal(
    stylesSource.includes('.icon-btn#controls-btn:not(.active):hover'),
    true,
  );
});

test("filter and calendar toolbar hover styles require a hover-capable pointer", () => {
  assert.match(
    stylesSource,
    /@media \(hover:hover\) and \(pointer:fine\)\{[\s\S]*?\.icon-btn:hover:not\(:disabled\)/,
  );
  assert.match(
    stylesSource,
    /@media \(hover:hover\) and \(pointer:fine\)\{[\s\S]*?\.tool:not\(\.active\):hover:not\(:disabled\)/,
  );
  assert.match(stylesSource, /\.icon-btn\{[^}]*touch-action:manipulation/);
  assert.match(stylesSource, /\.tool\{[^}]*touch-action:manipulation/);
});

test("active toolbar buttons retain their contrasting icon while hovered", () => {
  assert.match(
    stylesSource,
    /\.tool\.active\{[^}]*background:var\(--c-primary-d\);[^}]*color:var\(--c-text-rev\)/,
  );
  assert.match(
    stylesSource,
    /\.tool\.active svg\{[^}]*color:var\(--c-text-rev\)/,
  );
  assert.doesNotMatch(stylesSource, /\.tool:hover svg/);
});

test("two-way talk start and end paths synchronize the live audio state", () => {
  assert.match(
    cardSource,
    /this\._twoWayTalkSession = session;[\s\S]*?this\._setTwoWayTalkLiveAudioActive\(true\);/,
  );
  assert.match(
    cardSource,
    /const handleEnded = \(\) => \{[\s\S]*?this\._setTwoWayTalkLiveAudioActive\(false\);/,
  );
  assert.match(
    cardSource,
    /async _stopTwoWayTalkSession\([^)]*\) \{[\s\S]*?this\._setTwoWayTalkLiveAudioActive\(false\);/,
  );
});

test("two-way talk reports transient live-stage success and failure states", () => {
  assert.match(
    cardSource,
    /this\._twoWayTalkSoundwaveController\?\.startAfterPaint\(session\);[\s\S]*?this\._showTwoWayTalkResultBubble\(true\);/,
  );
  assert.match(
    cardSource,
    /catch \(error\) \{[\s\S]*?this\._showTwoWayTalkResultBubble\(false\);/,
  );
  assert.match(
    stylesSource,
    /\.two-way-talk-result-bubble\{[^}]*left:50%;bottom:14px;[^}]*pointer-events:none/,
  );
  assert.match(stylesSource, /\.two-way-talk-result-bubble\.success\{/);
  assert.match(stylesSource, /\.two-way-talk-result-bubble\.failure\{/);
});

test("tabs and tools synchronize independently without layout repair", () => {
  const start = cardSource.indexOf("_syncTabsShell() {");
  const end = cardSource.indexOf("async _loadTabData", start);
  const methodSource = cardSource.slice(start, end);

  assert.equal(methodSource.includes("if (!tabs && !toolsSlot) return;"), true);
  assert.equal(methodSource.includes("if (tabs) tabs.innerHTML"), true);
  assert.equal(methodSource.includes("if (toolsSlot) toolsSlot.innerHTML"), true);
  assert.equal(methodSource.includes("_createFilterPanel"), false);
  assert.equal(methodSource.includes("_createCalendarPanel"), false);
});

test("live controls keep a shared overlay with a mobile inline mute exception", () => {
  assert.equal(
    cardSource.includes(
      'if (!wrap.classList.contains("live-stage--overlay")) return;',
    ),
    true,
  );
  assert.equal(
    cardSource.includes('#live-stage.live-stage--overlay'),
    true,
  );
  assert.equal(stylesSource.includes(".live-playback-controls,.popup-playback-controls{"), true);
  assert.equal(stylesSource.includes("top:50%;right:clamp(.75rem,2vw,1.125rem)"), true);
  assert.equal(stylesSource.includes("flex-direction:column"), true);
  assert.equal(
    stylesSource.includes(
      "#live-stage.live-controls-visible .live-playback-controls{opacity:1;pointer-events:auto;}",
    ),
    true,
  );
  assert.equal(
    mobileViewStylesSource.includes(
      ".card.mobile-view-active:not(.mobile-rotate-live):not(.mobile-rotate-live-exit) .live-playback-controls > #mute-btn",
    ),
    true,
  );
  assert.equal(
    mobileViewStylesSource.includes(
      ".card.mobile-view-active.mobile-rotate-live #mobile-view-mute-btn",
    ),
    true,
  );
  assert.equal(
    cardSource.includes('#mute-btn, #mobile-view-mute-btn'),
    true,
  );
  assert.equal(cardSource.includes("#two-way-talk-mute-btn"), true);
  assert.equal(
    cardSource.includes("#two-way-talk-microphone-mute-btn"),
    true,
  );
  assert.equal(stylesSource.includes(".two-way-talk-control-row.has-inline-mute"), true);
  assert.equal(
    stylesSource.includes(
      ".info-row-mic-btn.active.microphone-muted",
    ),
    true,
  );
  assert.equal(
    stylesSource.includes(
      ".info-row-mic-btn:not(.active):not(.connecting):hover",
    ),
    true,
  );
  assert.equal(
    cardSource.includes('button.classList.toggle("active", audioEnabled);'),
    true,
  );
  assert.equal(
    mobileViewStylesSource.includes(
      ":is(.mobile-view-inline-mute-btn,.mobile-view-microphone-mute-btn):not(.active):hover",
    ),
    true,
  );
});

test("Card View overlay timing matrix keeps mouse and touch behavior separate", () => {
  assert.deepEqual(MEDIA_OVERLAY_TIMING, {
    mouse: {
      leaveHideDelayMs: 500,
    },
  });
  assert.deepEqual(CARD_VIEW_OVERLAY_TIMING, {
    mouse: {
      controlsHideMs: 10000,
      activeSlideshowAndTakeoverFadeStartMs: 10000,
      activeSlideshowAndTakeoverHideMs: 10000,
    },
    touch: {
      controlsHideMs: 3000,
      activeSlideshowAndTakeoverFadeStartMs: 3000,
      activeSlideshowAndTakeoverHideMs: 5000,
    },
  });
  assert.match(
    cardSource,
    /revealDurationMs: overlayCardView\s*\? CARD_VIEW_OVERLAY_TIMING\.mouse\.controlsHideMs\s*: 1300,/,
  );
  assert.match(
    cardSource,
    /touchRevealDurationMs: overlayCardView\s*\? CARD_VIEW_OVERLAY_TIMING\.touch\.controlsHideMs\s*: 2300,/,
  );
  assert.match(
    cardSource,
    /card\?\.classList\?\.remove\(CARD_VIEW_OVERLAYS_IDLE_CLASS\);/,
  );
  assert.match(
    cardSource,
    /card\?\.classList\?\.toggle\(\s*CARD_VIEW_OVERLAYS_IDLE_CLASS,\s*!touchInteraction,\s*\);/,
  );
  assert.match(
    cardSource,
    /CARD_VIEW_OVERLAYS_TOUCH_IDLE_CLASS/,
  );
  assert.match(
    cardSource,
    /touchInteraction \? "touch" : "mouse"/,
  );
});

test("mobile rotate overlay promotes the card host above Home Assistant chrome", () => {
  assert.match(
    mobileViewStylesSource,
    /:host\(\.mobile-view-rotate-cover\)[\s\S]*?position: fixed !important;[\s\S]*?width: var\(--rotate-vw, 100vw\) !important;[\s\S]*?height: var\(--rotate-vh, 100dvh\) !important;[\s\S]*?z-index: 3000 !important;/,
  );
  assert.equal(
    cardSource.includes("MOBILE_VIEW_ROTATE_COVER_CLASS"),
    true,
  );
  assert.equal(
    cardSource.includes("uiPlan.retainViewportCover"),
    true,
  );
  assert.equal(
    cardSource.includes("exitPlan.releaseViewportCover"),
    true,
  );
  assert.match(
    cardSource,
    /const forceMobileViewViewportCover =\s*card\?\.classList\?\.contains\("mobile-view-active"\)[\s\S]*?useStageViewport: forceMobileViewViewportCover/,
  );
  assert.doesNotMatch(
    cardSource,
    /const useStageViewport =\s*this\.classList\?\.contains\?\.\(MOBILE_VIEW_ROTATE_COVER_CLASS\)/,
  );
  assert.doesNotMatch(mobileViewStylesSource, /214748\d+/);
});

test("mobile rotation does not expose the cached fallback snapshot", () => {
  assert.match(
    stylesSource,
    /#stream-fallback\[hidden\]\{display:block;z-index:0;\}/,
  );
  assert.match(
    stylesSource,
    /\.card\.mobile-rotate-live #stream-fallback\[hidden\],[\s\S]*?\.card\.mobile-rotate-live-exit #stream-fallback\[hidden\]\{display:none !important;\}/,
  );
  assert.doesNotMatch(stylesSource, /rotatePosterBridge/);
  assert.doesNotMatch(cardSource, /_rotatePosterEntity/);
});

test("live rotate transition flies between the card and viewport bounds", () => {
  assert.equal(
    cardSource.includes("_captureRotateLiveEntryRect()"),
    true,
  );
  assert.equal(
    cardSource.includes("_captureRotateLiveExitRect(card)"),
    true,
  );
  assert.match(
    stylesSource,
    /@keyframes liveOverlayIn\{[\s\S]*?--rotate-live-from-y[\s\S]*?--rotate-vh[\s\S]*?\}/,
  );
  assert.match(
    stylesSource,
    /@keyframes liveOverlayOut\{[\s\S]*?--rotate-vh[\s\S]*?--rotate-live-to-y[\s\S]*?\}/,
  );
  assert.equal(
    mobileViewStylesSource.includes(
      ".card.mobile-view-active.mobile-rotate-live-exit #live-stage {\n    top: 0 !important;",
    ),
    false,
  );
});

test("popup playback controls delegate to native PiP and AirPlay", () => {
  assert.equal(cardSource.includes("#popup-fs-btn"), false);
  assert.equal(cardSource.includes("_ensurePopupFullscreenButton"), false);
  assert.equal(cardSource.includes("_ensurePopupAirPlayButton"), false);
  assert.equal(cardSource.includes("_ensurePopupPlaybackButtons"), false);
  assert.equal(
    popupMediaControlsSource.includes("ensurePlaybackButtons(mediaType"),
    true,
  );
  assert.equal(
    popupMediaControlsSource.includes(
      'id: "popup-pip-btn"',
    ),
    true,
  );
  assert.equal(cardSource.includes("toggleVideoPictureInPicture"), true);
  assert.equal(stylesSource.includes(".overlay-fs"), false);
  assert.equal(
    cardSource.includes(
      "#popup-airplay-btn, #popup-media-airplay, #popup-mobile-airplay-btn",
    ),
    true,
  );
  assert.equal(
    cardSource.includes("this._playbackTargetController.prompt("),
    true,
  );
  assert.equal(
    cardSource.includes(
      'this._playbackTargetController.observe("popup", displayedVideo)',
    ),
    true,
  );
  assert.equal(cardSource.includes("displayedVideo:"), true);
  assert.equal(cardSource.includes("button.hidden = !supported"), true);
  assert.equal(cardSource.includes("#live-airplay-btn"), false);
  assert.equal(
    stylesSource.includes(
      ".live-pip-btn[hidden],.live-fs-btn[hidden],.live-take-snapshot-btn[hidden],.mute-btn[hidden],.popup-playback-btn[hidden],.popup-media-btn[hidden]{display:none !important;}",
    ),
    true,
  );
  assert.equal(
    cardSource.includes("this._playbackTargetController?.release(scope)"),
    true,
  );
  assert.equal(
    cardSource.match(
      /this\._playbackTargetController\?\.release\("popup"\)/g,
    )?.length >= 3,
    true,
  );
  assert.equal(cardSource.includes("_playbackTargetContext(scope"), true);
  assert.equal(cardSource.includes("camera/stream"), false);
  assert.equal(cardSource.includes("context.connectionType"), false);
  assert.equal(
    stylesSource.includes(
      "grid-template-areas:\"sp1 play progress mute volume fs airplay sp2\"",
    ),
    true,
  );
  assert.equal(
    stylesSource.includes(
      'grid-template-areas:"play progress mute" ". time ."',
    ),
    true,
  );
  assert.equal(stylesSource.includes(".popup-playback-controls{"), true);
  assert.equal(stylesSource.includes(".popup-mobile-top-controls{"), false);
  assert.equal(stylesSource.includes(".playback-target-dialog{"), false);
});

test("Firefox uses desktop custom PiP buttons with temporary native suppression relief", () => {
  assert.match(
    popupMediaControlsSource,
    /if \(isVideo && !mobileTablet\) \{/,
  );
  assert.match(cardSource, /const liveAllowed =\s*!mobileTablet &&/);
  assert.match(cardSource, /const popupAllowed =\s*!mobileTablet &&/);
  assert.equal(popupMediaControlsSource.includes("_isMobileDevice"), false);
  assert.equal(
    popupMediaControlsSource.includes("!this._isFirefox()"),
    false,
  );
  assert.match(
    cardSource,
    /if \(isFirefox\) \{\s*disableNativePictureInPicture\(liveVideo\)/,
  );
  assert.match(
    cardSource,
    /if \(isFirefox\) \{\s*disableNativePictureInPicture\(popupVideo\)/,
  );
  assert.equal(
    cardSource.includes("temporarilyAllowDisabled: this._isFirefox()"),
    false,
  );
  assert.equal(
    cardSource.includes("temporarilyAllowDisabled: isFirefox"),
    true,
  );
  assert.equal(
    cardSource.includes("resumePlaybackOnExit: isFirefox && !popup"),
    true,
  );
});
