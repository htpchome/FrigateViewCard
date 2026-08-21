import { test } from "node:test";
import assert from "node:assert/strict";

import {
  DEVICE_ROUTE_BUCKETS,
  getEnabledPageRoutes,
  getMobilePageModes,
  MOBILE_PAGE_MODES,
  normalizeMobilePageMode,
  PAGE_IDS,
  resolveDeepLinkPageRoute,
  resolveMobilePreviewDestination,
  resolveStartupPageRoute,
} from "../src/features/navigation/router.js";

test("phone landing modes use the configured editor order", () => {
  assert.deepEqual(getMobilePageModes(), [
    MOBILE_PAGE_MODES.mobile,
    MOBILE_PAGE_MODES.previewMobile,
    MOBILE_PAGE_MODES.previewSingle,
    MOBILE_PAGE_MODES.single,
  ]);
  assert.equal(normalizeMobilePageMode(), MOBILE_PAGE_MODES.mobile);
  assert.equal(
    normalizeMobilePageMode("preview"),
    MOBILE_PAGE_MODES.previewSingle,
  );
});

test("desktop landing page honors enabled wide-view route", () => {
  const config = {
    preview_page_enabled: true,
    wide_view_page_enabled: true,
    landing_page: PAGE_IDS.wideView,
    mobile_page: PAGE_IDS.preview,
  };

  assert.deepEqual(getEnabledPageRoutes(config, DEVICE_ROUTE_BUCKETS.desktop), [
    PAGE_IDS.singleView,
    PAGE_IDS.preview,
    PAGE_IDS.wideView,
  ]);
  assert.equal(
    resolveStartupPageRoute({
      config,
      deviceBucket: DEVICE_ROUTE_BUCKETS.desktop,
    }),
    PAGE_IDS.wideView,
  );
});

test("mobile landing page excludes wide-view even when enabled", () => {
  const config = {
    preview_page_enabled: true,
    wide_view_page_enabled: true,
    landing_page: PAGE_IDS.wideView,
    mobile_page: PAGE_IDS.wideView,
  };

  assert.deepEqual(getEnabledPageRoutes(config, DEVICE_ROUTE_BUCKETS.mobile), [
    PAGE_IDS.singleView,
    PAGE_IDS.preview,
  ]);
  assert.equal(
    resolveStartupPageRoute({
      config,
      deviceBucket: DEVICE_ROUTE_BUCKETS.mobile,
    }),
    PAGE_IDS.singleView,
  );
});

test("desktop deep links continue to use single-view startup", () => {
  const config = {
    mobile_view_page_enabled: true,
    preview_page_enabled: true,
    wide_view_page_enabled: true,
    landing_page: PAGE_IDS.preview,
    mobile_page: PAGE_IDS.preview,
  };

  assert.equal(
    resolveStartupPageRoute({
      config,
      deviceBucket: DEVICE_ROUTE_BUCKETS.desktop,
      hasPendingDeepLinkTarget: true,
    }),
    PAGE_IDS.singleView,
  );
});

test("phone deep links use the final page from the configured mobile flow", () => {
  const baseConfig = {
    mobile_view_page_enabled: true,
    preview_page_enabled: true,
  };
  const expectations = [
    [MOBILE_PAGE_MODES.mobile, PAGE_IDS.mobileView],
    [MOBILE_PAGE_MODES.previewMobile, PAGE_IDS.mobileView],
    [MOBILE_PAGE_MODES.previewSingle, PAGE_IDS.singleView],
    [MOBILE_PAGE_MODES.single, PAGE_IDS.singleView],
  ];

  for (const [mobilePage, expectedPage] of expectations) {
    const config = { ...baseConfig, mobile_page: mobilePage };
    assert.equal(
      resolveDeepLinkPageRoute(config, DEVICE_ROUTE_BUCKETS.mobile),
      expectedPage,
    );
    assert.equal(
      resolveStartupPageRoute({
        config,
        deviceBucket: DEVICE_ROUTE_BUCKETS.mobile,
        hasPendingDeepLinkTarget: true,
      }),
      expectedPage,
    );
  }
});

test("phone deep links fall back to single-view when mobile-view is disabled", () => {
  const config = {
    mobile_view_page_enabled: false,
    preview_page_enabled: true,
    mobile_page: MOBILE_PAGE_MODES.previewMobile,
  };

  assert.equal(
    resolveStartupPageRoute({
      config,
      deviceBucket: DEVICE_ROUTE_BUCKETS.mobile,
      hasPendingDeepLinkTarget: true,
    }),
    PAGE_IDS.singleView,
  );
});

test("mobile view route is available on desktop and mobile when enabled", () => {
  const config = {
    mobile_view_page_enabled: true,
    preview_page_enabled: false,
    wide_view_page_enabled: false,
    landing_page: PAGE_IDS.mobileView,
    mobile_page: PAGE_IDS.mobileView,
  };

  assert.deepEqual(getEnabledPageRoutes(config, DEVICE_ROUTE_BUCKETS.desktop), [
    PAGE_IDS.singleView,
    PAGE_IDS.mobileView,
  ]);
  assert.deepEqual(getEnabledPageRoutes(config, DEVICE_ROUTE_BUCKETS.mobile), [
    PAGE_IDS.singleView,
    PAGE_IDS.mobileView,
  ]);
  assert.equal(
    resolveStartupPageRoute({
      config,
      deviceBucket: DEVICE_ROUTE_BUCKETS.desktop,
    }),
    PAGE_IDS.mobileView,
  );
  assert.equal(
    resolveStartupPageRoute({
      config,
      deviceBucket: DEVICE_ROUTE_BUCKETS.mobile,
    }),
    PAGE_IDS.mobileView,
  );
});

test("phone preview combinations start on Preview and resolve their camera destination", () => {
  const config = {
    mobile_view_page_enabled: true,
    preview_page_enabled: true,
    mobile_page: MOBILE_PAGE_MODES.previewMobile,
  };

  assert.equal(
    resolveStartupPageRoute({
      config,
      deviceBucket: DEVICE_ROUTE_BUCKETS.mobile,
    }),
    PAGE_IDS.preview,
  );
  assert.equal(
    resolveMobilePreviewDestination(MOBILE_PAGE_MODES.previewMobile),
    PAGE_IDS.mobileView,
  );
  assert.equal(
    resolveMobilePreviewDestination(MOBILE_PAGE_MODES.previewSingle),
    PAGE_IDS.singleView,
  );
  assert.equal(
    resolveMobilePreviewDestination(MOBILE_PAGE_MODES.mobile),
    "",
  );
});
