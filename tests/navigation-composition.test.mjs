import { test } from "node:test";
import assert from "node:assert/strict";

import { ICONS } from "../src/icons.js";
import { createPageNavigationController } from "../src/features/navigation/composition.js";
import { PageNavigationController } from "../src/features/navigation/page-navigation.ctrl.js";
import {
  allowsDashboardPageSwipeNavigation,
  createNavigationFactory,
  DEVICE_ROUTE_BUCKETS,
  getEnabledPageRoutes,
  isDashboardSwipeNavigationEnabled,
  normalizePageRoute,
  PAGE_IDS,
  resolveAdjacentPageSwipeRoute,
  resolveMobilePreviewDestination,
  resolvePageSwipeOrder,
} from "../src/features/navigation/router.js";
import {
  buildPageNavButtonsMarkup,
  buildPageNavMarkup,
} from "../src/features/navigation/page-nav.tmpl.js";

test("Navigation composition preserves dependencies and landing-page mapping", () => {
  const card = {};
  const controller = createPageNavigationController(card);

  assert.equal(controller instanceof PageNavigationController, true);
  assert.equal(controller._host, card);
  assert.deepEqual(controller._constants, {
    buildPageNavButtonsMarkup,
    buildPageNavMarkup,
    allowsDashboardPageSwipeNavigation,
    createNavigationFactory,
    DEVICE_ROUTE_BUCKETS,
    getEnabledPageRoutes,
    isDashboardSwipeNavigationEnabled,
    normalizePageRoute,
    PAGE_IDS,
    ICONS,
    resolveAdjacentPageSwipeRoute,
    resolveMobilePreviewDestination,
    resolvePageSwipeOrder,
  });
  assert.equal(controller._mapConfiguredLandingPage(PAGE_IDS.preview), PAGE_IDS.preview);

  card._editorPreviewController = {
    resolveLandingPage: (pageId) =>
      pageId === PAGE_IDS.preview ? PAGE_IDS.mobileView : null,
  };
  assert.equal(
    controller._mapConfiguredLandingPage(PAGE_IDS.preview),
    PAGE_IDS.mobileView,
  );
  assert.equal(
    controller._mapConfiguredLandingPage(PAGE_IDS.singleView),
    PAGE_IDS.singleView,
  );
});
