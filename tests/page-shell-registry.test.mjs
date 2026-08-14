import { test } from "node:test";
import assert from "node:assert/strict";

import {
  createPageShellRegistry,
  registerDefaultPageShellProfiles,
  resolvePageCapabilities,
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

  const markup = mobileProfile.buildMainLayoutShellMarkup({
    liveEngineWrap: '<div id="eng-wrap"></div>',
    infoRow: '<div class="info-row"></div>',
    pageNav: '<div class="page-nav"></div>',
    camSwitcher: '<div class="cam-switcher"></div>',
    rightColumnShell: '<div id="col-right"></div>',
    layoutProfile: { layoutClass: "layout--mobile-view" },
  });

  assert.equal(markup.includes('id="mobile-container"'), true);
  assert.equal(markup.includes('id="mobile-top"'), true);
  assert.equal(markup.includes('id="mobile-bottom"'), true);
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
