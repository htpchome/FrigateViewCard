import { test } from "node:test";
import assert from "node:assert/strict";

import {
  DEVICE_ROUTE_BUCKETS,
  getEnabledPageRoutes,
  PAGE_IDS,
  resolveStartupPageRoute,
} from "../src/router.js";

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

test("deep links force single-view startup", () => {
  const config = {
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
