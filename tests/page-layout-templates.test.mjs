import { test } from "node:test";
import assert from "node:assert/strict";

import { buildPreviewPageMainLayoutShellMarkup } from "../src/features/preview/page.tmpl.js";
import { buildSingleViewMainLayoutShellMarkup } from "../src/features/single-view/page.tmpl.js";
import { buildWideViewMainLayoutShellMarkup } from "../src/features/wide-view/page.tmpl.js";
import { STYLES } from "../src/styles.js";

const regions = {
  live: `<div data-fvc-region="live">Live</div>`,
  livePictureInPicture: `<button data-fvc-region="live-picture-in-picture">PiP</button>`,
  liveFullscreen: `<button data-fvc-region="live-fullscreen">Fullscreen</button>`,
  liveTakeSnapshot: `<button data-fvc-region="live-take-snapshot">Snapshot</button>`,
  liveMute: `<button data-fvc-region="live-mute">Mute</button>`,
  information: `<div data-fvc-region="information">Information</div>`,
  cameraSwitcher: `<div data-fvc-region="camera-switcher">Cameras</div>`,
  pageNavigation: `<div data-fvc-region="page-navigation">Navigation</div>`,
  tabs: `<div data-fvc-region="tabs">Tabs</div>`,
  tools: `<div data-fvc-region="tools">Tools</div>`,
  browseHeader: `<div data-fvc-region="browse-header">Browse Header</div>`,
  browse: `<div data-fvc-region="browse">Browse</div>`,
  footer: `<div data-fvc-region="footer">Footer</div>`,
  wideFooterIcon: `<svg data-wide-footer-icon></svg>`,
  companionCameras: `<section id="wide-companion-panel">Companions</section>`,
};

const routeBuilders = [
  ["single-view", buildSingleViewMainLayoutShellMarkup],
  ["wide-view", buildWideViewMainLayoutShellMarkup],
  ["preview-view", buildPreviewPageMainLayoutShellMarkup],
];

test("route-owned outer templates compose every atomic region once", () => {
  for (const [layoutSuffix, builder] of routeBuilders) {
    const markup = builder({
      regions,
      layoutProfile: {
        layoutClass: `layout--${layoutSuffix}`,
        leftColumnClass: `col-left--${layoutSuffix}`,
        rightColumnClass: `col-right--${layoutSuffix}`,
      },
    });

    assert.match(markup, new RegExp(`class="layout layout--${layoutSuffix}"`));
    for (const regionName of [
      "live",
      "live-fullscreen",
      "live-take-snapshot",
      "live-mute",
      "information",
      "camera-switcher",
      "page-navigation",
      "tabs",
      "tools",
      "browse-header",
      "browse",
      "footer",
    ]) {
      assert.equal(
        markup.match(new RegExp(`data-fvc-region="${regionName}"`, "g"))
          ?.length,
        1,
      );
    }

    const pictureInPictureCount =
      markup.match(/data-fvc-region="live-picture-in-picture"/g)?.length || 0;
    assert.equal(
      pictureInPictureCount,
      layoutSuffix === "preview-view" ? 0 : 1,
    );
  }
});

test("wide view renders its branded footer separately from the browse footer", () => {
  const markup = buildWideViewMainLayoutShellMarkup({ regions });

  assert.match(
    markup,
    /<div class="col-right"[^>]*>[\s\S]*?data-fvc-region="footer"[\s\S]*?<\/div>\s*<div class="wide-footer">/,
  );
  assert.match(
    markup,
    /<div class="wide-footer">\s*<div class="frigate-view"><svg data-wide-footer-icon><\/svg><\/div>/,
  );
});

test("wide view inserts Companion Cameras below its tool controls", () => {
  const markup = buildWideViewMainLayoutShellMarkup({ regions });

  assert.match(
    markup,
    /data-fvc-region="tools"[\s\S]*?id="wide-companion-panel"[\s\S]*?id="resize-handle"/,
  );
});

test("single and wide view toolbars opt into content-aware responsive rows", () => {
  const singleMarkup = buildSingleViewMainLayoutShellMarkup({ regions });
  const wideMarkup = buildWideViewMainLayoutShellMarkup({ regions });

  assert.match(
    singleMarkup,
    /class="button-holder button-holder--responsive-toolbar"/,
  );
  assert.match(
    wideMarkup,
    /class="button-holder button-holder--responsive-toolbar button-holder--no-tabs"/,
  );
  assert.match(
    STYLES,
    /\.button-holder--responsive-toolbar\{display:flex;flex-wrap:wrap;/,
  );
  assert.match(
    STYLES,
    /\.button-holder--responsive-toolbar \.tabs-row\{order:3;flex:1 0 100%;/,
  );
});

test("route-owned outer templates do not synthesize omitted regions", () => {
  for (const [, builder] of routeBuilders) {
    const markup = builder({ regions: { live: regions.live } });

    assert.match(markup, /data-fvc-region="live"/);
    assert.doesNotMatch(markup, /data-fvc-region="tabs"/);
    assert.doesNotMatch(markup, /data-fvc-region="tools"/);
  }
});
