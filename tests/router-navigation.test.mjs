import { test } from "node:test";
import assert from "node:assert/strict";

import {
  allowsDashboardPageSwipeNavigation,
  DASHBOARD_SWIPE_PAGE_OPTIONS,
  DASHBOARD_SWIPE_NAVIGATION_MODES,
  DEVICE_ROUTE_BUCKETS,
  getEnabledPageRoutes,
  getEnabledMobilePageModes,
  getMobilePageModes,
  isDashboardSwipeNavigationEnabled,
  MOBILE_PAGE_MODES,
  normalizeDashboardSwipeNavigationMode,
  normalizeMobilePageMode,
  PAGE_IDS,
  resolveAdjacentPageSwipeRoute,
  resolveDashboardSwipePageSelection,
  resolveDefaultDashboardSwipePages,
  resolveDeepLinkPageRoute,
  resolveEnabledMobilePageMode,
  resolveMobilePreviewDestination,
  resolvePageSwipeOrder,
  resolveStartupPageRoute,
} from "../src/features/navigation/router.js";

test("page swipe order starts with the configured landing flow", () => {
  const config = {
    mobile_view_page_enabled: true,
    preview_page_enabled: true,
    mobile_page: MOBILE_PAGE_MODES.previewMobile,
  };

  assert.deepEqual(
    resolvePageSwipeOrder(config, DEVICE_ROUTE_BUCKETS.mobile),
    [PAGE_IDS.preview, PAGE_IDS.mobileView],
  );
  assert.equal(
    resolveAdjacentPageSwipeRoute({
      config,
      deviceBucket: DEVICE_ROUTE_BUCKETS.mobile,
      currentPageId: PAGE_IDS.preview,
      direction: "next",
    }),
    PAGE_IDS.mobileView,
  );
  assert.equal(
    resolveAdjacentPageSwipeRoute({
      config,
      deviceBucket: DEVICE_ROUTE_BUCKETS.mobile,
      currentPageId: PAGE_IDS.mobileView,
      direction: "previous",
    }),
    PAGE_IDS.preview,
  );
});

test("phone swipe routes stay inside the configured landing pair", () => {
  const enabled = {
    mobile_view_page_enabled: true,
    preview_page_enabled: true,
  };
  assert.deepEqual(
    getEnabledPageRoutes(enabled, DEVICE_ROUTE_BUCKETS.mobile),
    [PAGE_IDS.singleView, PAGE_IDS.mobileView, PAGE_IDS.preview],
  );
  assert.deepEqual(
    resolvePageSwipeOrder(
      { ...enabled, mobile_page: MOBILE_PAGE_MODES.mobile },
      DEVICE_ROUTE_BUCKETS.mobile,
    ),
    [PAGE_IDS.preview, PAGE_IDS.mobileView],
  );
  assert.equal(
    resolveAdjacentPageSwipeRoute({
      config: { ...enabled, mobile_page: MOBILE_PAGE_MODES.mobile },
      deviceBucket: DEVICE_ROUTE_BUCKETS.mobile,
      currentPageId: PAGE_IDS.mobileView,
      direction: "previous",
    }),
    PAGE_IDS.preview,
  );
  assert.deepEqual(
    resolvePageSwipeOrder(
      { ...enabled, mobile_page: MOBILE_PAGE_MODES.previewMobile },
      DEVICE_ROUTE_BUCKETS.mobile,
    ),
    [PAGE_IDS.preview, PAGE_IDS.mobileView],
  );
  assert.deepEqual(
    resolvePageSwipeOrder(
      { ...enabled, mobile_page: MOBILE_PAGE_MODES.previewSingle },
      DEVICE_ROUTE_BUCKETS.mobile,
    ),
    [PAGE_IDS.preview, PAGE_IDS.singleView],
  );
  assert.deepEqual(
    resolvePageSwipeOrder(
      { ...enabled, mobile_page: MOBILE_PAGE_MODES.single },
      DEVICE_ROUTE_BUCKETS.mobile,
    ),
    [PAGE_IDS.preview, PAGE_IDS.singleView],
  );
});

test("swipe navigation modes control dashboard reach and internal stops", () => {
  const base = {
    mobile_view_page_enabled: true,
    preview_page_enabled: true,
    mobile_page: MOBILE_PAGE_MODES.previewMobile,
  };

  assert.equal(
    normalizeDashboardSwipeNavigationMode(),
    DASHBOARD_SWIPE_NAVIGATION_MODES.dashboardWide,
  );
  assert.equal(
    normalizeDashboardSwipeNavigationMode("invalid"),
    DASHBOARD_SWIPE_NAVIGATION_MODES.dashboardWide,
  );
  assert.equal(allowsDashboardPageSwipeNavigation(base), true);
  assert.equal(isDashboardSwipeNavigationEnabled(base), true);

  const insideCard = {
    ...base,
    ha_dashboard_swipe_navigation:
      DASHBOARD_SWIPE_NAVIGATION_MODES.insideCard,
  };
  assert.equal(allowsDashboardPageSwipeNavigation(insideCard), false);
  assert.equal(
    resolveAdjacentPageSwipeRoute({
      config: insideCard,
      deviceBucket: DEVICE_ROUTE_BUCKETS.mobile,
      currentPageId: PAGE_IDS.preview,
      direction: "next",
    }),
    PAGE_IDS.mobileView,
  );

  const landingDashboard = {
    ...base,
    ha_dashboard_swipe_navigation:
      DASHBOARD_SWIPE_NAVIGATION_MODES.landingDashboard,
  };
  assert.equal(allowsDashboardPageSwipeNavigation(landingDashboard), true);
  assert.deepEqual(
    resolvePageSwipeOrder(
      landingDashboard,
      DEVICE_ROUTE_BUCKETS.mobile,
    ),
    [PAGE_IDS.preview],
  );
  assert.equal(
    resolveAdjacentPageSwipeRoute({
      config: landingDashboard,
      deviceBucket: DEVICE_ROUTE_BUCKETS.mobile,
      currentPageId: PAGE_IDS.preview,
      direction: "next",
    }),
    null,
  );
  assert.equal(
    resolveAdjacentPageSwipeRoute({
      config: landingDashboard,
      deviceBucket: DEVICE_ROUTE_BUCKETS.mobile,
      currentPageId: PAGE_IDS.mobileView,
      direction: "previous",
    }),
    PAGE_IDS.preview,
  );
  assert.equal(
    normalizeDashboardSwipeNavigationMode("preview-dashboard"),
    DASHBOARD_SWIPE_NAVIGATION_MODES.landingDashboard,
  );
  assert.deepEqual(
    resolvePageSwipeOrder(
      {
        ...base,
        mobile_page: MOBILE_PAGE_MODES.single,
        ha_dashboard_swipe_navigation:
          DASHBOARD_SWIPE_NAVIGATION_MODES.landingDashboard,
      },
      DEVICE_ROUTE_BUCKETS.mobile,
    ),
    [PAGE_IDS.singleView],
  );

  const none = {
    ...base,
    ha_dashboard_swipe_navigation:
      DASHBOARD_SWIPE_NAVIGATION_MODES.none,
  };
  assert.equal(allowsDashboardPageSwipeNavigation(none), false);
  assert.equal(isDashboardSwipeNavigationEnabled(none), false);
  assert.deepEqual(
    resolvePageSwipeOrder(none, DEVICE_ROUTE_BUCKETS.mobile),
    [],
  );
  assert.equal(
    resolveAdjacentPageSwipeRoute({
      config: none,
      deviceBucket: DEVICE_ROUTE_BUCKETS.mobile,
      currentPageId: PAGE_IDS.mobileView,
      direction: "previous",
    }),
    null,
  );
});

test("tablet and desktop swipe routes default to Preview and the landing page", () => {
  const config = {
    mobile_view_page_enabled: true,
    preview_page_enabled: true,
    wide_view_page_enabled: true,
    card_view_page_enabled: true,
    landing_page: PAGE_IDS.wideView,
  };
  const expected = [PAGE_IDS.preview, PAGE_IDS.wideView];
  assert.deepEqual(
    resolvePageSwipeOrder(config, DEVICE_ROUTE_BUCKETS.tablet),
    expected,
  );
  assert.deepEqual(
    resolvePageSwipeOrder(config, DEVICE_ROUTE_BUCKETS.desktop),
    expected,
  );
  assert.deepEqual(
    resolveDefaultDashboardSwipePages(
      config,
      DEVICE_ROUTE_BUCKETS.desktop,
    ),
    expected,
  );
});

test("desktop swipe page selection follows chip order and filters disabled pages", () => {
  const config = {
    mobile_view_page_enabled: true,
    preview_page_enabled: true,
    wide_view_page_enabled: true,
    card_view_page_enabled: true,
    landing_page: PAGE_IDS.singleView,
    ha_dashboard_swipe_pages: [
      PAGE_IDS.cardView,
      PAGE_IDS.mobileView,
      PAGE_IDS.wideView,
      PAGE_IDS.preview,
    ],
  };

  assert.deepEqual(DASHBOARD_SWIPE_PAGE_OPTIONS, [
    PAGE_IDS.preview,
    PAGE_IDS.singleView,
    PAGE_IDS.mobileView,
    PAGE_IDS.wideView,
    PAGE_IDS.cardView,
  ]);
  assert.deepEqual(
    resolveDashboardSwipePageSelection(
      config,
      DEVICE_ROUTE_BUCKETS.desktop,
    ),
    [
      PAGE_IDS.preview,
      PAGE_IDS.singleView,
      PAGE_IDS.mobileView,
      PAGE_IDS.wideView,
      PAGE_IDS.cardView,
    ],
  );
  assert.deepEqual(
    resolvePageSwipeOrder(config, DEVICE_ROUTE_BUCKETS.desktop),
    [
      PAGE_IDS.preview,
      PAGE_IDS.singleView,
      PAGE_IDS.mobileView,
      PAGE_IDS.wideView,
      PAGE_IDS.cardView,
    ],
  );
  assert.equal(
    resolveAdjacentPageSwipeRoute({
      config,
      deviceBucket: DEVICE_ROUTE_BUCKETS.desktop,
      currentPageId: PAGE_IDS.preview,
      direction: "next",
    }),
    PAGE_IDS.singleView,
  );
  assert.equal(
    resolveAdjacentPageSwipeRoute({
      config,
      deviceBucket: DEVICE_ROUTE_BUCKETS.desktop,
      currentPageId: PAGE_IDS.singleView,
      direction: "previous",
    }),
    PAGE_IDS.preview,
  );
  assert.equal(
    resolveAdjacentPageSwipeRoute({
      config,
      deviceBucket: DEVICE_ROUTE_BUCKETS.desktop,
      currentPageId: PAGE_IDS.singleView,
      direction: "next",
    }),
    PAGE_IDS.mobileView,
  );
});

test("desktop landing page is forced and Preview can be deliberately excluded", () => {
  const config = {
    preview_page_enabled: true,
    wide_view_page_enabled: true,
    card_view_page_enabled: true,
    landing_page: PAGE_IDS.wideView,
    ha_dashboard_swipe_pages: [PAGE_IDS.cardView],
  };

  assert.deepEqual(
    resolveDashboardSwipePageSelection(
      config,
      DEVICE_ROUTE_BUCKETS.desktop,
    ),
    [PAGE_IDS.wideView, PAGE_IDS.cardView],
  );
  assert.deepEqual(
    resolvePageSwipeOrder(config, DEVICE_ROUTE_BUCKETS.desktop),
    [PAGE_IDS.wideView, PAGE_IDS.cardView],
  );
});

test("desktop Preview is immediately left of the selected landing page", () => {
  const config = {
    mobile_view_page_enabled: true,
    preview_page_enabled: true,
    wide_view_page_enabled: true,
    card_view_page_enabled: true,
    landing_page: PAGE_IDS.wideView,
    ha_dashboard_swipe_pages: [
      PAGE_IDS.preview,
      PAGE_IDS.singleView,
      PAGE_IDS.mobileView,
      PAGE_IDS.wideView,
      PAGE_IDS.cardView,
    ],
  };

  assert.deepEqual(
    resolvePageSwipeOrder(config, DEVICE_ROUTE_BUCKETS.desktop),
    [
      PAGE_IDS.preview,
      PAGE_IDS.wideView,
      PAGE_IDS.singleView,
      PAGE_IDS.mobileView,
      PAGE_IDS.cardView,
    ],
  );
  assert.equal(
    resolveAdjacentPageSwipeRoute({
      config,
      deviceBucket: DEVICE_ROUTE_BUCKETS.desktop,
      currentPageId: PAGE_IDS.preview,
      direction: "next",
    }),
    PAGE_IDS.wideView,
  );
  assert.equal(
    resolveAdjacentPageSwipeRoute({
      config,
      deviceBucket: DEVICE_ROUTE_BUCKETS.desktop,
      currentPageId: PAGE_IDS.wideView,
      direction: "previous",
    }),
    PAGE_IDS.preview,
  );
  assert.equal(
    resolveAdjacentPageSwipeRoute({
      config,
      deviceBucket: DEVICE_ROUTE_BUCKETS.desktop,
      currentPageId: PAGE_IDS.wideView,
      direction: "next",
    }),
    PAGE_IDS.singleView,
  );
});

test("desktop swipe selection never changes the mobile landing-page formula", () => {
  const config = {
    mobile_view_page_enabled: true,
    preview_page_enabled: true,
    wide_view_page_enabled: true,
    landing_page: PAGE_IDS.wideView,
    mobile_page: MOBILE_PAGE_MODES.previewMobile,
    ha_dashboard_swipe_pages: [PAGE_IDS.wideView],
  };

  assert.deepEqual(
    resolvePageSwipeOrder(config, DEVICE_ROUTE_BUCKETS.mobile),
    [PAGE_IDS.preview, PAGE_IDS.mobileView],
  );
});

test("page swipe order has hard ends and never wraps", () => {
  const config = {
    preview_page_enabled: true,
    mobile_page: MOBILE_PAGE_MODES.previewSingle,
  };
  assert.deepEqual(
    resolvePageSwipeOrder(config, DEVICE_ROUTE_BUCKETS.mobile),
    [PAGE_IDS.preview, PAGE_IDS.singleView],
  );
  assert.equal(
    resolveAdjacentPageSwipeRoute({
      config,
      deviceBucket: DEVICE_ROUTE_BUCKETS.mobile,
      currentPageId: PAGE_IDS.preview,
      direction: "previous",
    }),
    null,
  );
  assert.equal(
    resolveAdjacentPageSwipeRoute({
      config,
      deviceBucket: DEVICE_ROUTE_BUCKETS.mobile,
      currentPageId: PAGE_IDS.singleView,
      direction: "next",
    }),
    null,
  );
});

test("phone landing modes use the configured editor order", () => {
  assert.deepEqual(getMobilePageModes(), [
    MOBILE_PAGE_MODES.mobile,
    MOBILE_PAGE_MODES.previewMobile,
    MOBILE_PAGE_MODES.previewSingle,
    MOBILE_PAGE_MODES.single,
  ]);
  assert.equal(normalizeMobilePageMode(), MOBILE_PAGE_MODES.single);
  assert.equal(
    normalizeMobilePageMode("preview"),
    MOBILE_PAGE_MODES.previewSingle,
  );
});

test("phone landing modes only include enabled page combinations", () => {
  assert.deepEqual(getEnabledMobilePageModes({}), [
    MOBILE_PAGE_MODES.mobile,
    MOBILE_PAGE_MODES.single,
  ]);
  assert.deepEqual(
    getEnabledMobilePageModes({
      mobile_view_page_enabled: true,
      preview_page_enabled: false,
    }),
    [MOBILE_PAGE_MODES.mobile, MOBILE_PAGE_MODES.single],
  );
  assert.deepEqual(
    getEnabledMobilePageModes({
      mobile_view_page_enabled: false,
      preview_page_enabled: true,
    }),
    [MOBILE_PAGE_MODES.previewSingle, MOBILE_PAGE_MODES.single],
  );
  assert.deepEqual(
    getEnabledMobilePageModes({
      mobile_view_page_enabled: true,
      preview_page_enabled: true,
    }),
    getMobilePageModes(),
  );
});

test("disabled phone landing selections fall back to Single View", () => {
  assert.equal(
    resolveEnabledMobilePageMode(
      {
        mobile_view_page_enabled: false,
        preview_page_enabled: true,
      },
      MOBILE_PAGE_MODES.previewMobile,
    ),
    MOBILE_PAGE_MODES.single,
  );
  assert.equal(
    resolveEnabledMobilePageMode(
      {
        mobile_view_page_enabled: true,
        preview_page_enabled: true,
      },
      MOBILE_PAGE_MODES.previewMobile,
    ),
    MOBILE_PAGE_MODES.previewMobile,
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
    PAGE_IDS.mobileView,
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
    PAGE_IDS.mobileView,
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

test("Card View is a desktop/tablet landing route and is never a phone route", () => {
  const config = {
    card_view_page_enabled: true,
    landing_page: PAGE_IDS.cardView,
    mobile_page: MOBILE_PAGE_MODES.single,
  };

  assert.deepEqual(getEnabledPageRoutes(config, DEVICE_ROUTE_BUCKETS.desktop), [
    PAGE_IDS.singleView,
    PAGE_IDS.mobileView,
    PAGE_IDS.cardView,
  ]);
  assert.deepEqual(getEnabledPageRoutes(config, DEVICE_ROUTE_BUCKETS.tablet), [
    PAGE_IDS.singleView,
    PAGE_IDS.mobileView,
    PAGE_IDS.cardView,
  ]);
  assert.deepEqual(getEnabledPageRoutes(config, DEVICE_ROUTE_BUCKETS.mobile), [
    PAGE_IDS.singleView,
    PAGE_IDS.mobileView,
  ]);
  assert.equal(
    resolveStartupPageRoute({
      config,
      deviceBucket: DEVICE_ROUTE_BUCKETS.tablet,
    }),
    PAGE_IDS.cardView,
  );
  assert.equal(
    getEnabledMobilePageModes(config).includes(PAGE_IDS.cardView),
    false,
  );
});

test("standalone Card View is the only desktop/tablet route and leaves phone routes unchanged", () => {
  const config = {
    mobile_view_page_enabled: true,
    preview_page_enabled: true,
    wide_view_page_enabled: true,
    card_view_page_enabled: true,
    card_view_standalone: true,
    landing_page: PAGE_IDS.singleView,
    mobile_page: MOBILE_PAGE_MODES.previewMobile,
  };

  assert.deepEqual(getEnabledPageRoutes(config, DEVICE_ROUTE_BUCKETS.desktop), [
    PAGE_IDS.cardView,
  ]);
  assert.deepEqual(getEnabledPageRoutes(config, DEVICE_ROUTE_BUCKETS.tablet), [
    PAGE_IDS.cardView,
  ]);
  assert.deepEqual(getEnabledPageRoutes(config, DEVICE_ROUTE_BUCKETS.mobile), [
    PAGE_IDS.singleView,
    PAGE_IDS.mobileView,
    PAGE_IDS.preview,
  ]);
  assert.equal(
    resolveStartupPageRoute({
      config,
      deviceBucket: DEVICE_ROUTE_BUCKETS.desktop,
      hasPendingDeepLinkTarget: true,
    }),
    PAGE_IDS.cardView,
  );
  assert.equal(
    resolveStartupPageRoute({
      config,
      deviceBucket: DEVICE_ROUTE_BUCKETS.mobile,
    }),
    PAGE_IDS.preview,
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
