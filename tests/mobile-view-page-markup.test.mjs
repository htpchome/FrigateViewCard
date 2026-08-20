import { test } from "node:test";
import assert from "node:assert/strict";

import {
  buildMobileViewMainLayoutShellMarkup,
  buildMobileViewCamSwitcherMarkup,
  buildMobileViewInfoRowMarkup,
  resolveMobileViewEventsCountText,
  resolveMobileViewOnlineLabel,
  resolveMobileViewStatusColor,
  resolveMobileViewStreamTypeText,
  resolveMobileViewSubtitleText,
  resolveMobileViewTitleText,
} from "../src/features/mobile-view/page.tmpl.js";

test("mobile view title resolver falls back like single-view", () => {
  assert.equal(
    resolveMobileViewTitleText({
      title: "Front Door",
      cameras: [{ entity: "camera.front_door" }],
      activeCamera: { entity: "camera.front_door" },
      getCameraName: () => "Ignored",
    }),
    "Front Door",
  );

  assert.equal(
    resolveMobileViewTitleText({
      title: "",
      cameras: [{ entity: "camera.front_door" }, { entity: "camera.driveway" }],
      activeCamera: { entity: "camera.driveway" },
      getCameraName: () => "Driveway",
    }),
    "Driveway",
  );

  assert.equal(
    resolveMobileViewTitleText({
      title: "",
      cameras: [{ entity: "camera.front_door" }],
      activeCamera: { entity: "camera.front_door" },
      getCameraName: () => "Front Door",
    }),
    "Camera",
  );
});

test("mobile view text resolvers return stable display values", () => {
  assert.equal(
    resolveMobileViewSubtitleText({ subtitle: "Frigate" }),
    "Frigate",
  );
  assert.equal(resolveMobileViewSubtitleText({}), "Frigate");
  assert.equal(resolveMobileViewStreamTypeText("webrtc"), "webrtc");
  assert.equal(resolveMobileViewStreamTypeText(""), "--");
  assert.equal(resolveMobileViewEventsCountText(12), "12");
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
    eventsCount: 8,
  });

  assert.equal(markup.includes('id="info-title"'), true);
  assert.equal(markup.includes('id="tl-range"'), true);
  assert.equal(markup.includes('id="stream-type"'), false);
  assert.equal(markup.includes('id="ev-count"'), true);
  assert.equal(markup.includes('id="on-dot"'), false);
  assert.equal(markup.includes("8"), true);
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
      liveControlsPlacement: "inline",
    },
  });

  const liveStageMarkup = markup.slice(
    0,
    markup.indexOf('id="mobile-bottom"'),
  );
  assert.match(markup, /class="live-stage live-stage--inline"/);
  assert.doesNotMatch(
    liveStageMarkup,
    /data-fvc-region="live-(?:mute|fullscreen|take-snapshot)"/,
  );
  assert.match(
    markup,
    /mobile-video-controls-left-row">\s*<button data-fvc-region="live-take-snapshot"/,
  );
  assert.match(
    markup,
    /mobile-video-controls-right-row">\s*<button data-fvc-region="live-mute"[\s\S]*?data-fvc-region="live-fullscreen"/,
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

test("mobile view retains overlay controls unless inline placement is selected", () => {
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
