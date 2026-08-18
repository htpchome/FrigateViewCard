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
    host: {
      _buildTwoWayTalkMobileButtonMarkup: () =>
        '<div id="mobile-view-two-way-talk-slot"><button id="two-way-talk-btn" hidden></button></div>',
    },
    liveEngineWrap: '<div id="eng-wrap"></div>',
    infoRow: '<div class="info-row"></div>',
    pageNav: '<div class="page-nav"></div>',
    camSwitcher: '<div class="cam-switcher"></div>',
    tabsMarkup: "<button>Alerts</button>",
    toolsMarkup: "<button>Tools</button>",
    browseMarkup: '<div class="browse"></div>',
    footerMarkup: '<div class="footer"></div>',
    layoutProfile: { layoutClass: "layout--mobile-view" },
  });

  assert.equal(markup.includes('id="mobile-view-two-way-talk-slot"'), true);
  assert.equal(
    markup.indexOf('id="mobile-view-two-way-talk-slot"') <
      markup.indexOf('class="tabs-holder'),
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
