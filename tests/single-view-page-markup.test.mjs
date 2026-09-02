import { test } from "node:test";
import assert from "node:assert/strict";

import {
  buildSingleViewCamSwitcherMarkup,
  resolveSingleViewAlertsCountText,
  resolveSingleViewOnlineLabel,
  resolveSingleViewStatusColor,
  resolveSingleViewStreamTypeText,
  resolveSingleViewSubtitleText,
  resolveSingleViewTitleText,
} from "../src/features/single-view/page.tmpl.js";
import { STYLES } from "../src/styles.js";

test("standard camera switcher wraps on desktop and scrolls on phone and tablet devices", () => {
  const start = STYLES.indexOf("/* ── camera switcher ── */");
  const end = STYLES.indexOf("/* ── timeline ── */", start);
  const cameraSwitcherStyles = STYLES.slice(start, end);

  assert.match(cameraSwitcherStyles, /flex-wrap:\s*wrap/);
  assert.match(cameraSwitcherStyles, /width:\s*100%/);
  assert.match(cameraSwitcherStyles, /min-width:\s*0/);
  assert.match(cameraSwitcherStyles, /box-sizing:\s*border-box/);
  assert.match(
    cameraSwitcherStyles,
    /\.card\.mobile-client:not\(\.mobile-view-active\) \.cam-switcher\s*\{[^}]*flex-wrap:\s*nowrap;[^}]*overflow-x:\s*auto;/,
  );
  assert.match(
    cameraSwitcherStyles,
    /\.card\.mobile-client:not\(\.mobile-view-active\) \.cam-switcher > \*\s*\{[^}]*flex:\s*0 0 auto;/,
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
    "FrigateView",
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
