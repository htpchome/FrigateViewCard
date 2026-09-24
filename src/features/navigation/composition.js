import { ICONS } from "../../icons.js";
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
} from "./router.js";
import {
  buildPageNavButtonsMarkup,
  buildPageNavMarkup,
} from "./page-nav.tmpl.js";
import { PageNavigationController } from "./page-navigation.ctrl.js";

export const createPageNavigationController = (card) =>
  new PageNavigationController(
    card,
    {
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
    },
    {
      mapConfiguredLandingPage: (pageId) =>
        card._editorPreviewController?.resolveLandingPage?.(pageId) || pageId,
    },
  );
