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
