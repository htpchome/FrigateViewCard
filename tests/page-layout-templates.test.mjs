import { test } from "node:test";
import assert from "node:assert/strict";

import {
  buildPreviewLayoutShellMarkup,
  buildPreviewPageMainLayoutShellMarkup,
  buildPreviewShellHeaderMarkup,
} from "../src/features/preview/page.tmpl.js";
import { buildSingleViewMainLayoutShellMarkup } from "../src/features/single-view/page.tmpl.js";
import { buildWideViewMainLayoutShellMarkup } from "../src/features/wide-view/page.tmpl.js";
import { buildFooterMarkup } from "../src/card/controls/shell-nav.tmpl.js";
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
  pageToolsDivider: `<svg data-page-tools-divider></svg>`,
  tabs: `<div data-fvc-region="tabs">Tabs</div>`,
  tools: `<div data-fvc-region="tools">Tools</div>`,
  browseHeader: `<div data-fvc-region="browse-header">Browse Header</div>`,
  browse: `<div data-fvc-region="browse">Browse</div>`,
  footer: `<div data-fvc-region="footer">Footer</div>`,
  wideFooterIcon: `<svg data-wide-footer-icon></svg>`,
  footerVersion: "1.0.0",
  companionCameras: `<section id="wide-companion-panel">Companions</section>`,
  timeline: `<aside data-fvc-region="timeline">Timeline</aside>`,
};

const routeBuilders = [
  ["single-view", buildSingleViewMainLayoutShellMarkup],
  ["wide-view", buildWideViewMainLayoutShellMarkup],
  ["preview-view", buildPreviewPageMainLayoutShellMarkup],
];

test("preview header can hide title and subtitle independently", () => {
  const markup = buildPreviewShellHeaderMarkup({
    title: "FrigateView",
    subtitle: "Driveway",
    displayTitle: false,
    displaySubtitle: false,
    pageNav: "Navigation",
  });

  assert.match(markup, /id="preview-shell-title" hidden/);
  assert.match(markup, /id="preview-shell-subtitle" hidden/);
});

test("preview header can replace its title block with the FrigateView logo", () => {
  const withLogo = buildPreviewShellHeaderMarkup({
    title: "FrigateView",
    subtitle: "Driveway",
    headerLogo: "Logo",
    displayHeaderLogo: true,
    pageNav: "Navigation",
  });
  const withoutLogo = buildPreviewShellHeaderMarkup({
    title: "FrigateView",
    subtitle: "Driveway",
    headerLogo: "",
    displayHeaderLogo: true,
    pageNav: "Navigation",
  });

  assert.match(
    withLogo,
    /id="preview-shell-header-logo" >Logo<\/div>/,
  );
  assert.match(withLogo, /id="preview-shell-title-block" hidden/);
  assert.match(withoutLogo, /id="preview-shell-header-logo" hidden><\/div>/);
  assert.match(withoutLogo, /id="preview-shell-title-block" >/);
});

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
  assert.match(markup, /class="footer-version"[^>]*>v1\.0\.0<\/div>/);
});

test("preview view renders the version at the right of its footer", () => {
  const markup = buildPreviewLayoutShellMarkup({
    previewShellHeader: "Header",
    previewFooterIcon: "Logo",
    version: "1.0.0",
  });

  assert.match(
    markup,
    /class="preview-shell-footer"[\s\S]*?class="frigate-view">Logo<\/div>[\s\S]*?class="footer-version"[^>]*>v1\.0\.0<\/div>/,
  );
});

test("preview view can remove its footer from layout for the bottom HA navbar", () => {
  const markup = buildPreviewLayoutShellMarkup({
    previewShellHeader: "Header",
    previewFooterIcon: "Logo",
    version: "1.0.0",
    hideFooter: true,
  });

  assert.match(markup, /id="preview-shell-footer" hidden/);
  assert.match(
    STYLES,
    /\.preview-shell-footer\[hidden\]\{display:none !important;\}/,
  );
});

test("preview chrome stays inside the card when the Home Assistant page scrolls", () => {
  assert.doesNotMatch(
    STYLES,
    /\.card\.preview-active \.preview-shell-(?:header|footer)\{[^}]*(?:position|z-index):/,
  );
});

test("single, preview, and wide footers share one height and centered version alignment", () => {
  assert.match(STYLES, /--fvc-footer-height:\s*calc\(2\.4rem \+ 8px\)/);
  assert.match(
    STYLES,
    /\.footer \{[^}]*height:var\(--fvc-footer-height\);[^}]*min-height:var\(--fvc-footer-height\)/,
  );
  assert.match(
    STYLES,
    /\.wide-footer\{[^}]*height:var\(--fvc-footer-height\);[^}]*min-height:var\(--fvc-footer-height\)/,
  );
  assert.match(
    STYLES,
    /\.card\.preview-active \.preview-shell-footer\{[^}]*height:var\(--fvc-footer-height\);[^}]*min-height:var\(--fvc-footer-height\)/,
  );
  assert.match(
    STYLES,
    /\.footer-version\{[^}]*align-self:center;/,
  );
});

test("footer logo visibility leaves the fixed footer slot intact", () => {
  const markup = buildFooterMarkup({
    icons: { frigateView: "Logo" },
    displayFrigateView: false,
    version: "1.0.0",
  });

  assert.match(markup, /class="footer"/);
  assert.match(markup, /class="frigate-view"><\/div>/);
  assert.doesNotMatch(markup, />Logo</);
  assert.match(markup, /class="footer-version"[^>]*>v1\.0\.0<\/div>/);
});

test("wide view inserts Companion Cameras below its tool controls", () => {
  const markup = buildWideViewMainLayoutShellMarkup({ regions });

  assert.match(
    markup,
    /data-fvc-region="tools"[\s\S]*?id="wide-companion-panel"[\s\S]*?id="resize-handle"[\s\S]*?id="col-right"/,
  );
  assert.match(
    markup,
    /id="resize-handle" title="Resize Video" aria-label="Resize Video"/,
  );
  assert.match(
    STYLES,
    /\.layout\.wide-view \.resize-handle::before\{content:'↔';/,
  );
  assert.match(
    STYLES,
    /\.layout\.wide-view \.resize-handle::after\{content:'Resize ↕ Video';[^}]*opacity:0;/,
  );
});

test("wide view places the Timeline at the leading edge of the browse column", () => {
  const markup = buildWideViewMainLayoutShellMarkup({ regions });

  assert.match(
    markup,
    /id="resize-handle"[\s\S]*?id="col-right"[\s\S]*?data-fvc-region="timeline"[\s\S]*?data-fvc-region="tabs"/,
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
  for (const markup of [singleMarkup, wideMarkup]) {
    assert.match(
      markup,
      /page-nav-row[\s\S]*?page-tools-divider[\s\S]*?data-fvc-region="tools"/,
    );
  }
  assert.match(
    STYLES,
    /\.button-holder--responsive-toolbar\.page-tools-adjacent \.tools-row \.page-tools-divider\{display:flex;/,
  );
  assert.match(
    STYLES,
    /\.tl-tools > button\[hidden\] \+ \.divider\{display:none;/,
  );
});

test("single view keeps its live column at its requested height", () => {
  const markup = buildSingleViewMainLayoutShellMarkup({
    regions,
    layoutProfile: {
      layoutClass: "layout--single-view",
      leftColumnClass: "col-left--single-view",
      rightColumnClass: "col-right--single-view",
    },
  });

  assert.match(
    markup,
    /class="view-frame single-view-frame">[\s\S]*?class="col-left col-left--single-view view-top"[\s\S]*?class="col-right col-right--single-view view-body"/,
  );
  assert.match(
    STYLES,
    /\.card \.view-frame\{[^}]*display:flex;[^}]*flex:1 1 0;[^}]*height:100%;[^}]*overflow:hidden;/,
  );
  assert.match(
    STYLES,
    /\.card \.view-top\{[^}]*flex:0 0 auto;[^}]*position:relative;[^}]*z-index:2;[^}]*width:100%;[^}]*overflow:visible;/,
  );
  assert.match(
    STYLES,
    /\.card \.single-view-frame > \.col-left--single-view\{[^}]*flex:0 0 auto;[^}]*overflow:visible;/,
  );
  assert.match(
    STYLES,
    /\.card \.single-view-frame > \.col-right--single-view\{[^}]*flex:1 1 0;/,
  );
});

test("wide view only allows its companion region to absorb vertical shrink", () => {
  assert.match(STYLES, /\.card \.col-left > \*\{flex:0 0 auto;/);
  assert.match(
    STYLES,
    /\.card \.col-left > \.wide-companion-panel\{flex:1 1 0;/,
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
