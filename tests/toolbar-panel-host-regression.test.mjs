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
  assert.match(
    mobileViewStylesSource,
    /mobile-video-controls-container \.live-playback-controls,[\s\S]*?position:relative;[\s\S]*?opacity:1;[\s\S]*?pointer-events:auto;/,
  );
});

test("live and popup playback controls delegate to the shared target prompt", () => {
  for (const controlId of [
    "#live-cast-btn",
    "#live-airplay-btn",
    "#popup-cast-btn, #popup-media-cast",
    "#popup-airplay-btn, #popup-media-airplay",
  ]) {
    assert.equal(cardSource.includes(controlId), true);
  }
  assert.equal(cardSource.includes("promptVideoPlaybackTarget(video, target)"), true);
  assert.equal(
    stylesSource.includes(
      "grid-template-areas:\"sp1 play progress mute fs cast airplay sp2\"",
    ),
    true,
  );
  assert.equal(stylesSource.includes(".popup-playback-controls{"), true);
});
