import { test } from "node:test";
import assert from "node:assert/strict";

import {
  buildMobileViewMainLayoutShellMarkup,
  buildMobileViewCamSwitcherMarkup,
  buildMobileViewInfoRowMarkup,
  resolveMobileViewAlertsCountText,
  resolveMobileViewOnlineLabel,
  resolveMobileViewStatusColor,
  resolveMobileViewStreamTypeText,
  resolveMobileViewSubtitleText,
  resolveMobileViewTitleText,
} from "../src/features/mobile-view/page.tmpl.js";

test("mobile view title resolver defaults to FrigateView", () => {
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
    previewPageEnabled: true,
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

  assert.equal(markup.includes("data-preview-back"), true);
  assert.equal(markup.includes("data-mobile-cam-trigger"), true);
  assert.equal(markup.includes('data-mobile-camidx="1"'), true);
  assert.equal(markup.includes('aria-expanded="false"'), true);
  assert.equal(markup.includes('id="stream-type"'), true);
  assert.equal(markup.includes('id="on-dot"'), true);
  assert.equal(markup.includes('id="on-lbl"'), false);
  assert.equal(markup.includes("Driveway"), true);
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
      browseHeader: `<div data-fvc-region="browse-header"></div>`,
      browse: `<div class="browse" data-fvc-region="browse"></div>`,
      footer: `<div class="footer" data-fvc-region="footer"></div>`,
    },
    layoutProfile: {
      layoutClass: "layout--mobile-view",
      liveControlsPlacement: "overlay",
    },
  });

  const liveStageMarkup = markup.slice(
    0,
    markup.indexOf('id="mobile-bottom"'),
  );
  assert.match(markup, /class="live-stage live-stage--overlay"/);
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
    markup.match(/data-fvc-region="tabs"/g)?.length,
    1,
  );
  assert.equal(
    markup.match(/data-fvc-region="tools"/g)?.length,
    1,
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
