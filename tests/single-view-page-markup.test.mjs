import { test } from "node:test";
import assert from "node:assert/strict";

import {
  buildSingleViewCamSwitcherMarkup,
  buildSingleViewLiveBadgeMarkup,
  buildSingleViewLiveStatusMarkup,
  buildSingleViewMainLayoutShellMarkup,
  resolveSingleViewAlertsCountText,
  resolveSingleViewOnlineLabel,
  resolveSingleViewStatusColor,
  resolveSingleViewStreamTypeText,
  resolveSingleViewSubtitleText,
  resolveSingleViewTitleText,
} from "../src/features/single-view/page.tmpl.js";
import { SINGLE_VIEW_PAGE_STYLES } from "../src/features/single-view/page.styles.js";
import { STYLES } from "../src/styles.js";
import { CARD_NAME } from "../src/constants.js";

test("Single View camera switcher wraps on desktop and scrolls on phone and tablet devices", () => {
  const start = STYLES.indexOf("/* ── camera switcher ── */");
  const end = STYLES.indexOf("/* ── timeline ── */", start);
  const cameraSwitcherStyles = STYLES.slice(start, end);

  assert.match(cameraSwitcherStyles, /flex-wrap:\s*wrap/);
  assert.match(cameraSwitcherStyles, /width:\s*100%/);
  assert.match(cameraSwitcherStyles, /min-width:\s*0/);
  assert.match(cameraSwitcherStyles, /box-sizing:\s*border-box/);
  assert.match(
    cameraSwitcherStyles,
    /\.card\.mobile-client \.layout--single-view \.cam-switcher\s*\{[^}]*flex-wrap:\s*nowrap;[^}]*overflow-x:\s*auto;/,
  );
  assert.match(
    cameraSwitcherStyles,
    /\.card\.mobile-client \.layout--single-view \.cam-switcher > \*\s*\{[^}]*flex:\s*0 0 auto;/,
  );
  assert.doesNotMatch(cameraSwitcherStyles, /@media/);
});

test("single view title resolver defaults to FrigateView", () => {
  const activeCamera = { name: "Driveway" };
  const getCameraName = (camera) => camera.name;

  assert.equal(
    resolveSingleViewTitleText({
      title: "Front Door",
    }),
    "Front Door",
  );
  assert.equal(
    resolveSingleViewTitleText({
      title: "",
    }),
    CARD_NAME,
  );
  assert.equal(
    resolveSingleViewTitleText({
      title: "{camera}",
      activeCamera,
      getCameraName,
    }),
    "Driveway",
  );
  assert.equal(
    resolveSingleViewTitleText({
      title: "{Camera}",
      activeCamera,
      getCameraName,
      gridMode: true,
    }),
    "Grid",
  );
});

test("single view subtitle resolves the active camera token", () => {
  const activeCamera = { name: "Driveway" };
  const getCameraName = (camera) => camera.name;

  assert.equal(resolveSingleViewSubtitleText({ subtitle: "Patio" }), "Patio");
  assert.equal(
    resolveSingleViewSubtitleText({
      subtitle: "{Camera}",
      activeCamera,
      getCameraName,
    }),
    "Driveway",
  );
  assert.equal(
    resolveSingleViewSubtitleText({
      subtitle: "",
      activeCamera,
      getCameraName,
    }),
    "Driveway",
  );
  assert.equal(
    resolveSingleViewSubtitleText({ subtitle: "{Camera}" }),
    "Camera",
  );
  assert.equal(
    resolveSingleViewSubtitleText({
      subtitle: "{camera}",
      activeCamera,
      getCameraName,
      gridMode: true,
    }),
    "Grid",
  );
});

test("single view text resolvers preserve standard status values", () => {
  assert.equal(resolveSingleViewStreamTypeText("webrtc"), "webrtc");
  assert.equal(resolveSingleViewStreamTypeText(""), "--");
  assert.equal(resolveSingleViewAlertsCountText(12), "12");
  assert.equal(resolveSingleViewOnlineLabel(true), "Online");
  assert.equal(resolveSingleViewOnlineLabel(false), "Offline");
  assert.equal(resolveSingleViewStatusColor(true), "#4ade80");
  assert.equal(resolveSingleViewStatusColor(false), "#ef4444");
});

test("Single View adds a responsive live status overlay", () => {
  const badgeMarkup = buildSingleViewLiveBadgeMarkup();
  const statusMarkup = buildSingleViewLiveStatusMarkup({
    webRtcIcon: "webrtc-icon",
  });
  const shellMarkup = buildSingleViewMainLayoutShellMarkup({
    regions: { liveSourceWebRtcIcon: "shell-webrtc-icon" },
  });

  assert.match(badgeMarkup, /data-single-view-live-badge/);
  assert.match(badgeMarkup, /single-view-live-badge-dot/);
  assert.match(badgeMarkup, />Live</);
  assert.match(statusMarkup, /data-single-view-live-status-overlay/);
  assert.match(
    statusMarkup,
    /data-single-view-source-indicator[^>]*hidden[\s\S]*data-single-view-source-icon[^>]*hidden[^>]*>webrtc-icon</,
  );
  assert.match(shellMarkup, /data-single-view-live-badge/);
  assert.match(shellMarkup, />shell-webrtc-icon</);
  assert.match(
    SINGLE_VIEW_PAGE_STYLES,
    /@container single-view \(max-width: 420px\)/,
  );
  assert.match(
    SINGLE_VIEW_PAGE_STYLES,
    /\.info-alert-stat,[\s\S]*?\.stats\s*\{\s*display: none;/,
  );
  assert.match(
    SINGLE_VIEW_PAGE_STYLES,
    /\.single-view-source-indicator\s*\{[^}]*opacity: 0;[^}]*visibility: hidden;/,
  );
  assert.match(
    SINGLE_VIEW_PAGE_STYLES,
    /#live-stage\.live-controls-visible \.single-view-source-indicator\s*\{[^}]*opacity: 1;[^}]*visibility: visible;/,
  );
  assert.match(
    SINGLE_VIEW_PAGE_STYLES,
    /\.info-row\s*\{[^}]*--single-view-center-controls-width: 224px;[^}]*grid-template-columns: minmax\(0, 1fr\) var\(--single-view-center-controls-width\) minmax\(0, 1fr\);/,
  );
  assert.match(
    SINGLE_VIEW_PAGE_STYLES,
    /\.info-row-center-controls\s*\{[^}]*grid-template-columns: repeat\(5, 40px\);[^}]*column-gap: 6px;[^}]*width: var\(--single-view-center-controls-width\);/,
  );
  assert.match(
    SINGLE_VIEW_PAGE_STYLES,
    /two-way-talk-control-row:not\(\.has-soundwave\)\s*\{[^}]*grid-template-columns: repeat\(3, 40px\);[^}]*width: var\(--single-view-talk-controls-width\);/,
  );
  assert.match(
    SINGLE_VIEW_PAGE_STYLES,
    /two-way-talk-control-row:not\(\.has-soundwave\) \.info-row-mic-btn\s*\{\s*grid-column: 2;/,
  );
  assert.match(
    SINGLE_VIEW_PAGE_STYLES,
    /two-way-talk-active[\s\S]*?data-linked-light-position-slot="left"[\s\S]*?grid-column: 1;[\s\S]*?two-way-talk-active[\s\S]*?data-linked-light-position-slot="right"[\s\S]*?grid-column: 5;/,
  );
  assert.match(
    SINGLE_VIEW_PAGE_STYLES,
    /\.live-playback-controls > button\s*\{[^}]*width: 29px;[^}]*height: 29px;/,
  );
  assert.match(
    SINGLE_VIEW_PAGE_STYLES,
    /\.live-playback-controls\.overlay-controls svg,[\s\S]*?width: 24px;[\s\S]*?height: 24px;/,
  );
});

test("single view camera switcher markup preserves active and availability state", () => {
  const markup = buildSingleViewCamSwitcherMarkup({
    includeStatus: true,
    cameras: [
      { entity: "camera.front_door", name: "Front Door" },
      { entity: "camera.driveway", name: "Driveway" },
    ],
    activeCamIdx: 1,
    isSingleView: true,
    getCameraName: (camera) => camera.name,
    isCameraAvailable: (camera) => camera.entity !== "camera.front_door",
  });

  assert.equal(markup.includes("Front Door"), true);
  assert.equal(markup.includes("Driveway"), true);
  assert.equal(
    markup.includes("class=\"cam-tab shadow-small active\" data-camidx=\"1\""),
    true,
  );
  assert.equal(markup.includes("style=\"color:#ef4444\""), true);
  assert.equal(markup.includes("style=\"color:#4ade80\""), true);
});
