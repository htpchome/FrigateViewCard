import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const cardSource = fs.readFileSync(
  new URL("../src/card/FrigateViewCard.js", import.meta.url),
  "utf8",
);
const shellNavSource = fs.readFileSync(
  new URL("../src/card/controls/shell-nav.tmpl.js", import.meta.url),
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
    shellNavSource.includes('data-fvc-region="filter-panel"'),
    true,
  );
  assert.equal(
    shellNavSource.includes('data-fvc-region="calendar-panel"'),
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
    /async _stopTwoWayTalkSession\(\) \{[\s\S]*?this\._setTwoWayTalkLiveAudioActive\(false\);/,
  );
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

test("mobile inline live controls stay visible without overlay reveal binding", () => {
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
  const controlsRuleStart = mobileViewStylesSource.indexOf(
    ".mobile-video-controls-container .mute-btn,",
  );
  const controlsRuleEnd = mobileViewStylesSource.indexOf(
    "}",
    controlsRuleStart,
  );
  const controlsRule = mobileViewStylesSource.slice(
    controlsRuleStart,
    controlsRuleEnd,
  );
  assert.equal(controlsRule.includes(".live-fs-btn"), true);
  assert.equal(controlsRule.includes(".live-take-snapshot-btn"), true);
  assert.equal(controlsRule.includes("position:relative;"), true);
  assert.equal(controlsRule.includes("opacity:1;"), true);
  assert.equal(controlsRule.includes("pointer-events:auto;"), true);
});

test("mobile rotate overlay promotes the card host above Home Assistant chrome", () => {
  assert.match(
    mobileViewStylesSource,
    /:host\(\.mobile-view-rotate-cover\)[\s\S]*?position: fixed !important;[\s\S]*?width: var\(--rotate-vw, 100vw\) !important;[\s\S]*?height: var\(--rotate-vh, 100dvh\) !important;[\s\S]*?z-index: 2147483647 !important;/,
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
      'pictureInPictureButton.id = "popup-pip-btn"',
    ),
    true,
  );
  assert.equal(cardSource.includes("toggleVideoPictureInPicture"), true);
  assert.equal(stylesSource.includes(".overlay-fs"), false);
  assert.equal(
    cardSource.includes("#popup-airplay-btn, #popup-media-airplay"),
    true,
  );
  assert.equal(
    cardSource.includes("this._playbackTargetController.prompt("),
    true,
  );
  assert.equal(cardSource.includes("button.hidden = !supported"), true);
  assert.equal(cardSource.includes("#live-airplay-btn"), false);
  assert.equal(
    stylesSource.includes(
      ".live-pip-btn[hidden],.live-fs-btn[hidden],.live-take-snapshot-btn[hidden],.popup-playback-btn[hidden],.popup-media-btn[hidden]{display:none !important;}",
    ),
    true,
  );
  assert.equal(
    cardSource.includes("this._playbackTargetController?.release(scope)"),
    true,
  );
  assert.equal(cardSource.includes("_playbackTargetContext(scope"), true);
  assert.equal(cardSource.includes("camera/stream"), false);
  assert.equal(cardSource.includes("context.connectionType"), false);
  assert.equal(
    stylesSource.includes(
      "grid-template-areas:\"sp1 play progress mute fs airplay sp2\"",
    ),
    true,
  );
  assert.equal(stylesSource.includes(".popup-playback-controls{"), true);
  assert.equal(stylesSource.includes(".playback-target-dialog{"), false);
});

test("Firefox uses custom PiP buttons with temporary native suppression relief", () => {
  assert.match(
    popupMediaControlsSource,
    /!this\._isMobileDevice\(\)\s*&&\s*this\._isVideoMediaType\(mediaType\)/,
  );
  assert.equal(
    popupMediaControlsSource.includes("!this._isFirefox()"),
    false,
  );
  assert.match(
    cardSource,
    /if \(isFirefox && !livePictureInPictureActive\)[\s\S]*?disableNativePictureInPicture\(liveVideo\)/,
  );
  assert.match(
    cardSource,
    /if \(isFirefox && !popupPictureInPictureActive\)[\s\S]*?disableNativePictureInPicture\(popupVideo\)/,
  );
  assert.equal(cardSource.includes("isVideoPictureInPictureActive"), true);
  assert.equal(
    cardSource.includes("temporarilyAllowDisabled: this._isFirefox()"),
    true,
  );
});
