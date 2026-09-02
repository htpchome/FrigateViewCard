import { test } from "node:test";
import assert from "node:assert/strict";

import {
  buildMobileViewMainLayoutShellMarkup,
  buildMobileViewCamSwitcherMarkup,
  buildMobileViewBackButtonMarkup,
  buildMobileViewInfoRowMarkup,
  resolveMobileViewAlertsCountText,
  resolveMobileViewOnlineLabel,
  resolveMobileViewStatusColor,
  resolveMobileViewStreamTypeText,
  resolveMobileViewSubtitleText,
  resolveMobileViewTitleText,
} from "../src/features/mobile-view/page.tmpl.js";
import { MOBILE_VIEW_PAGE_STYLES } from "../src/features/mobile-view/page.styles.js";
import { CAMERA_PICKER_STYLES } from "../src/features/navigation/camera-picker.styles.js";
import { STYLES } from "../src/styles.js";

test("mobile view title resolver defaults to FrigateView", () => {
  const activeCamera = { name: "Driveway" };
  const getCameraName = (camera) => camera.name;

  assert.equal(
    resolveMobileViewTitleText({
      title: "Front Door",
    }),
    "Front Door",
  );

  assert.equal(
    resolveMobileViewTitleText({
      title: "",
    }),
    "FrigateView",
  );
  assert.equal(
    resolveMobileViewTitleText({
      title: "{camera}",
      activeCamera,
      getCameraName,
    }),
    "Driveway",
  );
  assert.equal(
    resolveMobileViewTitleText({
      title: "{camera}",
      activeCamera,
      getCameraName,
      gridMode: true,
    }),
    "Grid",
  );
});

test("mobile view subtitle resolves the active camera token", () => {
  const activeCamera = { name: "Driveway" };
  const getCameraName = (camera) => camera.name;

  assert.equal(
    resolveMobileViewSubtitleText({ subtitle: "Frigate" }),
    "Frigate",
  );
  assert.equal(
    resolveMobileViewSubtitleText({
      subtitle: "{Camera}",
      activeCamera,
      getCameraName,
    }),
    "Driveway",
  );
  assert.equal(
    resolveMobileViewSubtitleText({
      subtitle: "",
      activeCamera,
      getCameraName,
    }),
    "Driveway",
  );
  assert.equal(
    resolveMobileViewSubtitleText({
      subtitle: "{camera}",
      activeCamera,
      getCameraName,
      gridMode: true,
    }),
    "Grid",
  );
});

test("mobile view text resolvers return stable status values", () => {
  assert.equal(resolveMobileViewStreamTypeText("webrtc"), "webrtc");
  assert.equal(resolveMobileViewStreamTypeText(""), "--");
  assert.equal(resolveMobileViewAlertsCountText(12), "12");
  assert.equal(resolveMobileViewOnlineLabel(true), "Online");
  assert.equal(resolveMobileViewOnlineLabel(false), "Offline");
  assert.equal(resolveMobileViewStatusColor(true), "#4ade80");
  assert.equal(resolveMobileViewStatusColor(false), "#ef4444");
});

test("mobile view info row markup uses expected ids", () => {
  const markup = buildMobileViewInfoRowMarkup({
    title: "Driveway",
    subtitle: "Frigate",
    version: "1.0.1023",
    alertsCount: 8,
  });

  assert.equal(markup.includes('id="info-title"'), true);
  assert.equal(markup.includes('id="tl-range"'), true);
  assert.equal(markup.includes('id="stream-type"'), false);
  assert.equal(markup.includes('id="alert-count"'), true);
  assert.equal(markup.includes("Alerts"), true);
  assert.equal(markup.includes('id="on-dot"'), false);
  assert.equal(markup.includes("8"), true);
  assert.equal(markup.includes("Version"), false);
  assert.equal(markup.includes("v1.0.1023"), false);
});

test("mobile view info row can hide title and subtitle independently", () => {
  const markup = buildMobileViewInfoRowMarkup({
    title: "FrigateView",
    subtitle: "Driveway",
    displayTitle: false,
    displaySubtitle: false,
    version: "1.0.1023",
  });

  assert.match(markup, /id="info-title" hidden/);
  assert.match(markup, /id="tl-range" hidden/);
});

test("mobile view cam switcher markup renders trigger and picker options", () => {
  const markup = buildMobileViewCamSwitcherMarkup({
    includeStatus: true,
    cameras: [{ entity: "camera.front_door" }, { entity: "camera.driveway" }],
    activeCamIdx: 1,
    streamType: "webrtc",
    online: false,
    isSingleView: true,
    icons: { left: "<", chevron: "v", volOn: "", volOff: "" },
    getCameraName: (camera) =>
      camera.entity === "camera.driveway" ? "Driveway" : "Front Door",
    isCameraAvailable: (camera) => camera.entity !== "camera.front_door",
  });

  assert.equal(markup.includes("data-preview-back"), false);
  assert.equal(markup.includes("data-mobile-cam-trigger"), true);
  assert.equal(markup.includes('data-mobile-camidx="1"'), true);
  assert.equal(markup.includes('aria-expanded="false"'), true);
  assert.equal(markup.includes('id="stream-type"'), true);
  assert.equal(markup.includes('id="on-dot"'), true);
  assert.equal(markup.includes('id="on-lbl"'), false);
  assert.equal(markup.includes("Driveway"), true);
});

test("mobile view back button only renders when Preview is enabled", () => {
  assert.equal(
    buildMobileViewBackButtonMarkup({
      previewPageEnabled: false,
      icons: { back: "Back" },
    }),
    "",
  );
  assert.match(
    buildMobileViewBackButtonMarkup({
      previewPageEnabled: true,
      icons: { back: "Back" },
    }),
    /data-preview-back[\s\S]*Back/,
  );
});

test("mobile view main layout renders centered two-way-talk slot above tabs", () => {
  const markup = buildMobileViewMainLayoutShellMarkup({
    regions: {
      live: `<div id="eng-wrap" data-fvc-region="live"></div>`,
      livePictureInPicture: `<button data-fvc-region="live-picture-in-picture"></button>`,
      liveFullscreen: `<button data-fvc-region="live-fullscreen"></button>`,
      liveTakeSnapshot: `<button data-fvc-region="live-take-snapshot"></button>`,
      liveMute: `<button data-fvc-region="live-mute"></button>`,
      information: `<div data-fvc-region="information"></div>`,
      pageNavigation: `<div class="page-nav" data-fvc-region="page-navigation"></div>`,
      cameraSwitcher: `<div class="cam-switcher" data-fvc-region="camera-switcher"></div>`,
      tabs: `<div class="tabs" data-fvc-region="tabs"><button>Alerts</button></div>`,
      tools: `<div class="tl-tools-slot" data-fvc-region="tools"><button>Tools</button></div>`,
      twoWayTalk:
        `<div id="mobile-view-two-way-talk-slot" data-fvc-region="two-way-talk"><button id="two-way-talk-btn" hidden></button></div>`,
      mobileMicrophoneMute:
        `<button class="icon-btn mute-btn mobile-view-microphone-mute-btn" id="mobile-view-microphone-mute-btn" hidden></button>`,
      mobileInlineMute:
        `<button class="icon-btn mute-btn mobile-view-inline-mute-btn" id="mobile-view-mute-btn"></button>`,
      browseHeader: `<div data-fvc-region="browse-header"></div>`,
      browse: `<div class="browse" data-fvc-region="browse"></div>`,
      footer: `<div class="footer" data-fvc-region="footer"></div>`,
    },
    layoutProfile: {
      layoutClass: "layout--mobile-view",
      liveControlsPlacement: "overlay",
    },
    backButton: `<button data-preview-back>Back</button>`,
    cameraSwitcherMarkup: `<div data-mobile-cam-picker>Picker</div>`,
  });

  const liveStageMarkup = markup.slice(
    0,
    markup.indexOf('id="mobile-bottom"'),
  );
  assert.match(markup, /class="live-stage live-stage--overlay"/);
  assert.match(
    markup,
    /class="cam-switcher"[\s\S]*?mobile-cam-picker__back-slot[\s\S]*?data-preview-back[\s\S]*?data-mobile-cam-switcher-content[\s\S]*?data-mobile-cam-picker/,
  );
  assert.equal(markup.match(/data-fvc-region="camera-switcher"/g)?.length, 1);
  assert.match(liveStageMarkup, /id="live-playback-controls"/);
  assert.match(
    liveStageMarkup,
    /live-picture-in-picture[\s\S]*?live-take-snapshot[\s\S]*?live-fullscreen[\s\S]*?live-mute/,
  );
  assert.equal(markup.includes('id="mobile-view-two-way-talk-slot"'), true);
  assert.equal(
    markup.indexOf('id="mobile-view-two-way-talk-slot"') <
      markup.indexOf('class="mobile-tab-container'),
    true,
  );
  assert.equal(markup.includes('id="two-way-talk-btn"'), true);
  assert.equal(
    markup.includes('id="mobile-view-microphone-mute-btn"'),
    true,
  );
  assert.equal(markup.includes('id="mobile-view-mute-btn"'), true);
  assert.equal(
    markup.indexOf('id="mobile-view-microphone-mute-btn"') <
      markup.indexOf('id="two-way-talk-btn"') &&
      markup.indexOf('id="two-way-talk-btn"') <
      markup.indexOf('id="mobile-view-mute-btn"'),
    true,
  );
  assert.match(
    markup,
    /class="button-holder-row mobile-microphone-row">[\s\S]*?mobile-view-microphone-mute-btn[\s\S]*?two-way-talk-btn[\s\S]*?mobile-view-mute-btn[\s\S]*?<\/div>/,
  );
  assert.equal(
    markup.match(/data-fvc-region="tabs"/g)?.length,
    1,
  );
  assert.equal(
    markup.match(/data-fvc-region="tools"/g)?.length,
    1,
  );
});

test("mobile view centers the microphone independently of the mute button", () => {
  assert.match(
    MOBILE_VIEW_PAGE_STYLES,
    /\.mobile-microphone-row\{[^}]*display:grid;[^}]*grid-template-columns:40px 40px 40px;/,
  );
  assert.match(
    MOBILE_VIEW_PAGE_STYLES,
    /\.mobile-microphone-row \.mobile-view-microphone-mute-btn\{grid-column:1;\}/,
  );
  assert.match(
    MOBILE_VIEW_PAGE_STYLES,
    /\.mobile-microphone-row \.mobile-view-two-way-talk-slot\{grid-column:2;\}/,
  );
  assert.match(
    MOBILE_VIEW_PAGE_STYLES,
    /\.mobile-microphone-row \.mobile-view-inline-mute-btn\{grid-column:3;\}/,
  );
  assert.match(
    MOBILE_VIEW_PAGE_STYLES,
    /\.mobile-view-two-way-talk-slot\[hidden\] \+ \.mobile-view-inline-mute-btn,[\s\S]*?\.mobile-view-inline-mute-btn:only-child\{grid-column:2;\}/,
  );
  assert.match(
    MOBILE_VIEW_PAGE_STYLES,
    /:is\(\.mobile-video-controls-left-row,\.mobile-video-controls-right-row\):not\(\[hidden\]\)\{justify-self:stretch;justify-content:center;min-width:40px;\}/,
  );
});

test("mobile view centers the camera picker between equal side tracks", () => {
  assert.match(
    CAMERA_PICKER_STYLES,
    /\.card\.mobile-view-active \.mobile-top \.cam-switcher \{\s*grid-template-columns:minmax\(0,1fr\) minmax\(162px,2\.4fr\) minmax\(0,1fr\);/,
  );
});

test("mobile view keeps the shared fixed-height footer inside mobile-bottom", () => {
  const markup = buildMobileViewMainLayoutShellMarkup({
    regions: {
      footer: `<div class="footer" data-fvc-region="footer"></div>`,
    },
  });

  assert.match(
    markup,
    /id="mobile-bottom"[\s\S]*?class="footer" data-fvc-region="footer"/,
  );
  assert.match(STYLES, /--fvc-footer-height:\s*calc\(2\.4rem \+ 8px\)/);
  assert.match(
    STYLES,
    /\.footer \{[^}]*flex:0 0 var\(--fvc-footer-height\);[^}]*height:var\(--fvc-footer-height\);[^}]*min-height:var\(--fvc-footer-height\)/,
  );
});

test("mobile view uses a version-only compact footer on detected mobile clients", () => {
  assert.match(
    MOBILE_VIEW_PAGE_STYLES,
    /\.card\.mobile-view-active\.mobile-client \.mobile-bottom > \.footer \{[^}]*grid-template-columns: minmax\(0, 1fr\);[^}]*flex: 0 0 auto;[^}]*height: auto;[^}]*min-height: 0;[^}]*padding: 0 4px;/,
  );
  assert.match(
    MOBILE_VIEW_PAGE_STYLES,
    /\.card\.mobile-view-active\.mobile-client \.mobile-bottom > \.footer > :first-child \{\s*display: none;/,
  );
  assert.match(
    MOBILE_VIEW_PAGE_STYLES,
    /\.card\.mobile-view-active\.mobile-client \.mobile-bottom > \.footer \.footer-version \{\s*padding: 2px 0;/,
  );
  assert.doesNotMatch(
    MOBILE_VIEW_PAGE_STYLES,
    /@media[^}]*\.card\.mobile-view-active[^}]*\.footer/,
  );
});

test("mobile browse clips horizontal overflow without shrinking list items", () => {
  assert.match(
    MOBILE_VIEW_PAGE_STYLES,
    /\.card\.mobile-view-active \.browse--mobile-view \{[^}]*overflow-x:hidden;[^}]*box-sizing:border-box;/,
  );
  assert.match(
    MOBILE_VIEW_PAGE_STYLES,
    /\.card\.mobile-view-active \.browse--mobile-view \.list \{[^}]*width: 100%;[^}]*max-width: 100%;[^}]*min-width: 0;/,
  );
  assert.match(
    MOBILE_VIEW_PAGE_STYLES,
    /\.card\.mobile-view-active \.browse--mobile-view \.list-item \{[^}]*width: 100%;[^}]*max-width: 100%;[^}]*min-width: 0;/,
  );
});

test("mobile view always keeps playback controls grouped over the media", () => {
  const markup = buildMobileViewMainLayoutShellMarkup({
    regions: {
      live: `<div data-fvc-region="live"></div>`,
      liveFullscreen: `<button data-fvc-region="live-fullscreen"></button>`,
      liveTakeSnapshot: `<button data-fvc-region="live-take-snapshot"></button>`,
      liveMute: `<button data-fvc-region="live-mute"></button>`,
    },
  });
  const liveStageMarkup = markup.slice(
    0,
    markup.indexOf('id="mobile-bottom"'),
  );

  assert.match(markup, /class="live-stage live-stage--overlay"/);
  assert.match(liveStageMarkup, /data-fvc-region="live-fullscreen"/);
  assert.match(liveStageMarkup, /data-fvc-region="live-take-snapshot"/);
  assert.match(liveStageMarkup, /data-fvc-region="live-mute"/);
});


test("mobile region composition leaves omitted tabs absent", () => {
  const markup = buildMobileViewMainLayoutShellMarkup({
    regions: {
      live: `<div data-fvc-region="live">Live</div>`,
      tools: `<div data-fvc-region="tools">Atomic Tools</div>`,
    },
  });

  assert.match(markup, /Atomic Tools/);
  assert.doesNotMatch(markup, /data-fvc-region="tabs"/);
});
