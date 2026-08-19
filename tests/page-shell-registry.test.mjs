import { test } from "node:test";
import assert from "node:assert/strict";

import {
  PAGE_SHELL_REGIONS,
  createPageShellRegistry,
  registerDefaultPageShellProfiles,
  resolvePageCapabilities,
  resolveRequiredPageShellRegions,
  validatePageShellRegionMarkup,
} from "../src/features/navigation/page-shell-registry.js";

const PAGE_IDS = Object.freeze({
  singleView: "single-view",
  mobileView: "mobile-view",
  wideView: "wide-view",
  preview: "preview",
});

test("page shell registry default page capabilities resolve stable defaults", () => {
  const registry = createPageShellRegistry({
    defaultPageId: PAGE_IDS.singleView,
  });
  registerDefaultPageShellProfiles(registry, PAGE_IDS);

  const singleCaps = resolvePageCapabilities(
    registry.resolve(PAGE_IDS.singleView),
  );
  const mobileCaps = resolvePageCapabilities(
    registry.resolve(PAGE_IDS.mobileView),
  );
  const wideCaps = resolvePageCapabilities(registry.resolve(PAGE_IDS.wideView));
  const previewCaps = resolvePageCapabilities(
    registry.resolve(PAGE_IDS.preview),
  );

  assert.deepEqual(singleCaps, {
    hasLive: true,
    hasBrowse: true,
    tabsVariant: "standard",
  });
  assert.deepEqual(mobileCaps, {
    hasLive: true,
    hasBrowse: true,
    tabsVariant: "standard",
  });
  assert.deepEqual(wideCaps, {
    hasLive: true,
    hasBrowse: true,
    tabsVariant: "standard",
  });
  assert.deepEqual(previewCaps, {
    hasLive: true,
    hasBrowse: true,
    tabsVariant: "standard",
  });
});

test("every registered page profile owns an outer layout builder", () => {
  const registry = createPageShellRegistry({
    defaultPageId: PAGE_IDS.singleView,
  });
  registerDefaultPageShellProfiles(registry, PAGE_IDS);

  const builders = [
    PAGE_IDS.singleView,
    PAGE_IDS.mobileView,
    PAGE_IDS.wideView,
    PAGE_IDS.preview,
  ].map((pageId) => registry.resolve(pageId).buildMainLayoutShellMarkup);

  builders.forEach((builder) => assert.equal(typeof builder, "function"));
  assert.equal(new Set(builders).size, builders.length);
});

test("page shell capabilities honor explicit overrides", () => {
  const profile = {
    capabilities: {
      hasLive: false,
      hasBrowse: false,
      tabsVariant: "new-tabs",
    },
  };

  assert.deepEqual(resolvePageCapabilities(profile), {
    hasLive: false,
    hasBrowse: false,
    tabsVariant: "new-tabs",
  });
});

test("page shell capabilities normalize unsupported values", () => {
  const profile = {
    capabilities: {
      hasLive: true,
      hasBrowse: true,
      tabsVariant: "unsupported",
    },
  };

  assert.deepEqual(resolvePageCapabilities(profile), {
    hasLive: true,
    hasBrowse: true,
    tabsVariant: "standard",
  });

  assert.deepEqual(resolvePageCapabilities({}), {
    hasLive: true,
    hasBrowse: true,
    tabsVariant: "standard",
  });
});

test("mobile profile exposes custom main layout shell builder", () => {
  const registry = createPageShellRegistry({
    defaultPageId: PAGE_IDS.singleView,
  });
  registerDefaultPageShellProfiles(registry, PAGE_IDS);
  const mobileProfile = registry.resolve(PAGE_IDS.mobileView);

  assert.equal(typeof mobileProfile.buildMainLayoutShellMarkup, "function");
  assert.equal(mobileProfile.tabsButtonClass, "icon-btn");
  assert.equal(mobileProfile.toolsButtonClass, "icon-btn");
  assert.equal(mobileProfile.liveFullscreenButtonClass, "icon-btn");
  assert.equal(mobileProfile.liveMuteButtonClass, "icon-btn");
  assert.equal(mobileProfile.liveControlsPlacement, "inline");
  assert.equal(
    registry.resolve(PAGE_IDS.singleView).liveControlsPlacement,
    "overlay",
  );

  const markup = mobileProfile.buildMainLayoutShellMarkup({
    host: {
      _buildTwoWayTalkMobileButtonMarkup: () =>
        `<div data-fvc-region="two-way-talk">Talk</div>`,
    },
    regions: {
      live: `<div id="eng-wrap" data-fvc-region="live"></div>`,
      liveFullscreen: `<button data-fvc-region="live-fullscreen"></button>`,
      liveMute: `<button data-fvc-region="live-mute"></button>`,
      information: `<div data-fvc-region="information"></div>`,
      pageNavigation: `<div data-fvc-region="page-navigation"></div>`,
      cameraSwitcher: `<div data-fvc-region="camera-switcher"></div>`,
      tabs: `<div data-fvc-region="tabs"></div>`,
      tools: `<div data-fvc-region="tools"></div>`,
      browseHeader: `<div data-fvc-region="browse-header"></div>`,
      browse: `<div data-fvc-region="browse"></div>`,
      footer: `<div data-fvc-region="footer"></div>`,
    },
    layoutProfile: mobileProfile,
  });

  assert.equal(markup.includes('id="mobile-container"'), true);
  assert.equal(markup.includes('id="mobile-top"'), true);
  assert.equal(markup.includes('id="mobile-bottom"'), true);
  assert.equal(markup.includes('data-fvc-region="two-way-talk"'), true);
  assert.equal(markup.includes("live-stage--inline"), true);
  const validation = validatePageShellRegionMarkup(markup, {
    requiredRegions: resolveRequiredPageShellRegions(mobileProfile),
  });
  assert.equal(validation.valid, true);
  assert.deepEqual(validation.missing, []);
  assert.deepEqual(validation.duplicates, []);
});

test("single and wide info rows render host action markup", () => {
  const registry = createPageShellRegistry({
    defaultPageId: PAGE_IDS.singleView,
  });
  registerDefaultPageShellProfiles(registry, PAGE_IDS);

  const host = {
    _buildTwoWayTalkInfoButtonMarkup: () =>
      '<button id="two-way-talk-btn"></button>',
  };

  const singleInfoRow = registry
    .resolve(PAGE_IDS.singleView)
    .buildInfoRowMarkup({
      title: "Camera",
      subtitle: "Frigate",
      version: "1.0.0",
      host,
    });
  const wideInfoRow = registry.resolve(PAGE_IDS.wideView).buildInfoRowMarkup({
    title: "Camera",
    subtitle: "Frigate",
    version: "1.0.0",
    host,
  });

  assert.equal(singleInfoRow.includes("two-way-talk-btn"), true);
  assert.equal(wideInfoRow.includes("two-way-talk-btn"), true);
});

test("required page shell regions follow declared capabilities", () => {
  assert.deepEqual(
    resolveRequiredPageShellRegions({
      capabilities: {
        hasLive: true,
        hasBrowse: true,
        tabsVariant: "standard",
      },
    }),
    [
      PAGE_SHELL_REGIONS.live,
      PAGE_SHELL_REGIONS.liveFullscreen,
      PAGE_SHELL_REGIONS.liveMute,
      PAGE_SHELL_REGIONS.browseHeader,
      PAGE_SHELL_REGIONS.browse,
      PAGE_SHELL_REGIONS.tabs,
      PAGE_SHELL_REGIONS.tools,
    ],
  );

  assert.deepEqual(
    resolveRequiredPageShellRegions({
      capabilities: {
        hasLive: false,
        hasBrowse: false,
        tabsVariant: "none",
      },
    }),
    [],
  );
});

test("page shell region validation reports missing and duplicate anchors", () => {
  const result = validatePageShellRegionMarkup(
    `<div data-fvc-region="live"></div>
     <div data-fvc-region="tabs"></div>
     <div data-fvc-region="tabs"></div>`,
    {
      requiredRegions: [PAGE_SHELL_REGIONS.live, PAGE_SHELL_REGIONS.browse],
    },
  );

  assert.equal(result.valid, false);
  assert.deepEqual(result.counts, { live: 1, tabs: 2 });
  assert.deepEqual(result.missing, [PAGE_SHELL_REGIONS.browse]);
  assert.deepEqual(result.duplicates, [PAGE_SHELL_REGIONS.tabs]);
});
