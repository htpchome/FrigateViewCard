import { test } from "node:test";
import assert from "node:assert/strict";

import {
  PageNavigationController,
  shouldShowPageToolsDivider,
} from "../src/features/navigation/page-navigation.ctrl.js";

const PAGE_IDS = {
  singleView: "single-view",
  mobileView: "mobile-view",
  preview: "preview",
  wideView: "wide-view",
  cardView: "card-view",
};

const rect = ({ left, top, width, height }) => ({
  left,
  right: left + width,
  top,
  bottom: top + height,
  width,
  height,
});

test("page/tools divider appears only for adjacent groups on the collapsed row", () => {
  const pageNavigationRect = rect({ left: 100, top: 10, width: 160, height: 36 });

  assert.equal(
    shouldShowPageToolsDivider({
      holderDisplay: "flex",
      pageNavigationRect,
      toolsRect: rect({ left: 268, top: 10, width: 120, height: 36 }),
    }),
    true,
  );
  assert.equal(
    shouldShowPageToolsDivider({
      holderDisplay: "flex",
      pageNavigationRect,
      toolsRect: rect({ left: 100, top: 52, width: 120, height: 36 }),
    }),
    false,
  );
  assert.equal(
    shouldShowPageToolsDivider({
      holderDisplay: "grid",
      pageNavigationRect,
      toolsRect: rect({ left: 500, top: 10, width: 120, height: 36 }),
    }),
    false,
  );
});

const createHarness = () => {
  const calls = [];
  let capturedFactoryInput = null;
  let createCount = 0;
  let lastNavigateCall = null;
  let lastStartupCall = null;
  const returnedFactory = {
    id: "factory",
    navigateTo: (pageId, context) => {
      lastNavigateCall = { pageId, context };
      return `navigated:${pageId}`;
    },
    resolveStartupPage: (input) => {
      lastStartupCall = input;
      return PAGE_IDS.wideView;
    },
  };
  const navContainer = { innerHTML: "" };
  const activeButton = {
    dataset: { pageRoute: PAGE_IDS.singleView },
    classList: {
      toggle: (className, value) =>
        calls.push(["toggle", className, value, PAGE_IDS.singleView]),
    },
    setAttribute: (name, value) =>
      calls.push(["setAttribute", name, value, PAGE_IDS.singleView]),
  };
  const inactiveButton = {
    dataset: { pageRoute: PAGE_IDS.wideView },
    classList: {
      toggle: (className, value) =>
        calls.push(["toggle", className, value, PAGE_IDS.wideView]),
    },
    setAttribute: (name, value) =>
      calls.push(["setAttribute", name, value, PAGE_IDS.wideView]),
  };

  const host = {
    _navigationFactory: null,
    _pageId: PAGE_IDS.singleView,
    _previewPageActive: false,
    _lastNonPreviewPageId: PAGE_IDS.singleView,
    _config: { a: 1, mobile_page: "mobile-view" },
    _deviceBucket: "desktop",
    _activateSingleViewPageRoute: (context) => calls.push(["single", context]),
    _activateMobileViewPageRoute: (context) => calls.push(["mobile", context]),
    _activatePreviewPageRoute: (context) => calls.push(["preview", context]),
    _activateWideViewPageRoute: (context) => calls.push(["wide", context]),
    _wideViewPageController: {
      stopCompanionMode: () => calls.push(["stopCompanions"]),
    },
    _syncMobileViewPageMarkup: () => calls.push(["syncMobileViewMarkup"]),
    _renderShell: () => calls.push(["renderShell"]),
    _deviceRouteBucket: () => host._deviceBucket,
    _syncPageNavigationButtons: () => calls.push(["syncButtons"]),
    _pageShellRegion: (regionKey) =>
      regionKey === "pageNavigation" ? navContainer : null,
    _pageShellRegionElements: (regionKey, selector) =>
      regionKey === "pageNavigation" && selector === "[data-page-route]"
        ? [activeButton, inactiveButton]
        : [],
    shadowRoot: {
      querySelectorAll: (selector) => {
        if (selector === ".page-nav") return [navContainer];
        if (selector === "[data-page-route]")
          return [activeButton, inactiveButton];
        return [];
      },
    },
  };

  const constants = {
    allowsDashboardPageSwipeNavigation: (config) =>
      !["inside-card", "none"].includes(
        config.ha_dashboard_swipe_navigation,
      ),
    isDashboardSwipeNavigationEnabled: (config) =>
      config.ha_dashboard_swipe_navigation !== "none",
    buildPageNavButtonsMarkup: () => "buttons-only",
    buildPageNavMarkup: ({ routes, activePageId, getRouteLabel }) =>
      `${routes.join("|")}:${activePageId}:${getRouteLabel(PAGE_IDS.preview)}`,
    getEnabledPageRoutes: () => [PAGE_IDS.singleView, PAGE_IDS.preview],
    DEVICE_ROUTE_BUCKETS: { mobile: "mobile" },
    normalizePageRoute: (value) =>
      String(value || "")
        .trim()
        .toLowerCase(),
    PAGE_IDS,
    resolveAdjacentPageSwipeRoute: ({ currentPageId, direction }) => {
      if (currentPageId === PAGE_IDS.preview && direction === "next") {
        return PAGE_IDS.singleView;
      }
      if (currentPageId === PAGE_IDS.singleView && direction === "previous") {
        return PAGE_IDS.preview;
      }
      return null;
    },
    resolveMobilePreviewDestination: (mode) =>
      mode === "preview-mobile-view"
        ? PAGE_IDS.mobileView
        : mode === "preview-single-view"
          ? PAGE_IDS.singleView
          : "",
    resolvePageSwipeOrder: () => [PAGE_IDS.preview, PAGE_IDS.singleView],
    createNavigationFactory: (input) => {
      createCount += 1;
      capturedFactoryInput = input;
      return returnedFactory;
    },
  };

  return {
    host,
    calls,
    constants,
    navContainer,
    returnedFactory,
    getCreateCount: () => createCount,
    getInput: () => capturedFactoryInput,
    getLastNavigateCall: () => lastNavigateCall,
    getLastStartupCall: () => lastStartupCall,
  };
};

test("page swipe navigation resolves internal routes without wrapping", () => {
  const h = createHarness();
  const controller = new PageNavigationController(h.host, h.constants);
  h.host._pageId = PAGE_IDS.preview;

  assert.deepEqual(controller.pageSwipeRouteOptions(), [
    PAGE_IDS.preview,
    PAGE_IDS.singleView,
  ]);
  assert.equal(controller.resolveSwipePageTarget("next"), PAGE_IDS.singleView);
  assert.equal(controller.resolveSwipePageTarget("previous"), null);
  assert.equal(controller.allowsDashboardPageSwipe(), true);

  h.host._config.ha_dashboard_swipe_navigation = "inside-card";
  assert.equal(controller.allowsDashboardPageSwipe(), false);
  assert.equal(controller.isSwipeNavigationEnabled(), true);

  h.host._config.ha_dashboard_swipe_navigation = "none";
  assert.equal(controller.allowsDashboardPageSwipe(), false);
  assert.equal(controller.isSwipeNavigationEnabled(), false);
});

test("dashboard entry resolves to the eligible FrigateView boundary page", () => {
  const h = createHarness();
  const controller = new PageNavigationController(h.host, h.constants);
  h.host._pageId = PAGE_IDS.wideView;

  assert.equal(
    controller.resolveDashboardSwipeBoundaryPage({
      direction: "next",
      transition: "enter",
    }),
    PAGE_IDS.preview,
  );
  assert.equal(
    controller.resolveDashboardSwipeBoundaryPage({
      direction: "previous",
      transition: "enter",
    }),
    PAGE_IDS.singleView,
  );
  assert.equal(
    controller.resolveDashboardSwipeBoundaryPage({
      direction: "next",
      transition: "exit",
    }),
    PAGE_IDS.singleView,
  );
  assert.equal(
    controller.resolveDashboardSwipeBoundaryPage({
      direction: "previous",
      transition: "exit",
    }),
    PAGE_IDS.preview,
  );

  h.host._pageId = PAGE_IDS.singleView;
  assert.equal(
    controller.resolveDashboardSwipeBoundaryPage({
      direction: "previous",
      transition: "enter",
    }),
    null,
  );
});

test("ensureNavigationFactory memoizes created factory", () => {
  const h = createHarness();
  const controller = new PageNavigationController(h.host, h.constants);

  const first = controller.ensureNavigationFactory();
  const second = controller.ensureNavigationFactory();

  assert.equal(first, h.returnedFactory);
  assert.equal(second, h.returnedFactory);
  assert.equal(h.getCreateCount(), 1);
});

test("factory callbacks update page state and sync nav buttons", () => {
  const h = createHarness();
  const controller = new PageNavigationController(h.host, h.constants);
  controller.ensureNavigationFactory();
  const input = h.getInput();

  const context = {};
  input.onBeforeNavigate(PAGE_IDS.preview, context);
  assert.equal(context.previousPageId, PAGE_IDS.singleView);
  assert.equal(h.host._pageId, PAGE_IDS.preview);
  assert.equal(h.host._previewPageActive, true);
  assert.deepEqual(h.calls, []);

  input.onAfterNavigate(PAGE_IDS.preview);
  assert.equal(h.host._lastNonPreviewPageId, PAGE_IDS.singleView);
  assert.deepEqual(h.calls, [
    ["syncMobileViewMarkup"],
    ["toggle", "active", false, PAGE_IDS.singleView],
    ["setAttribute", "aria-pressed", "false", PAGE_IDS.singleView],
    ["toggle", "active", false, PAGE_IDS.wideView],
    ["setAttribute", "aria-pressed", "false", PAGE_IDS.wideView],
  ]);

  input.onBeforeNavigate(PAGE_IDS.wideView, context);
  input.onAfterNavigate(PAGE_IDS.wideView);
  assert.equal(h.host._lastNonPreviewPageId, PAGE_IDS.wideView);
});

test("factory stops Companion Cameras when navigation leaves Wide View", () => {
  const h = createHarness();
  const controller = new PageNavigationController(h.host, h.constants);
  controller.ensureNavigationFactory();
  const input = h.getInput();
  h.host._pageId = PAGE_IDS.wideView;

  input.onBeforeNavigate(PAGE_IDS.singleView, {});

  assert.deepEqual(h.calls, [["stopCompanions"]]);
});

test("factory stops active PTZ motion before page navigation", () => {
  const h = createHarness();
  h.host._stopPtzMotion = (reason) => h.calls.push(["stopPtz", reason]);
  const controller = new PageNavigationController(h.host, h.constants);
  controller.ensureNavigationFactory();

  h.getInput().onBeforeNavigate(PAGE_IDS.preview, {});

  assert.deepEqual(h.calls, [["stopPtz", "page-navigation"]]);
});

test("page changes synchronize scoped Home Assistant shell styling", () => {
  const h = createHarness();
  h.host._haNavbarController = {
    sync: () => h.calls.push(["syncHaNavbar", h.host._pageId]),
  };
  h.host._haPageBackgroundController = {
    sync: () => h.calls.push(["syncHaPageBackground", h.host._pageId]),
  };
  const controller = new PageNavigationController(h.host, h.constants);
  controller.ensureNavigationFactory();

  h.getInput().onBeforeNavigate(PAGE_IDS.mobileView, {});

  assert.deepEqual(h.calls, [
    ["syncHaNavbar", PAGE_IDS.mobileView],
    ["syncHaPageBackground", PAGE_IDS.mobileView],
  ]);
});

test("factory page activators route to host handlers", () => {
  const h = createHarness();
  const controller = new PageNavigationController(h.host, h.constants);
  controller.ensureNavigationFactory();
  const input = h.getInput();

  const context = { source: "test" };
  input.pages[PAGE_IDS.singleView].activate(context);
  input.pages[PAGE_IDS.mobileView].activate(context);
  input.pages[PAGE_IDS.preview].activate(context);
  input.pages[PAGE_IDS.wideView].activate(context);

  assert.deepEqual(h.calls, [
    ["single", context],
    ["mobile", context],
    ["preview", context],
    ["wide", context],
  ]);
});

test("factory delegates config and device bucket readers to host", () => {
  const h = createHarness();
  const controller = new PageNavigationController(h.host, h.constants);
  controller.ensureNavigationFactory();
  const input = h.getInput();

  assert.equal(input.getDeviceBucket(), "desktop");
  assert.equal(input.getConfig(), h.host._config);
});

test("pageRouteOptions and isPageRouteAvailable use routed constants", () => {
  const h = createHarness();
  const controller = new PageNavigationController(h.host, h.constants);

  assert.deepEqual(controller.pageRouteOptions(), [
    PAGE_IDS.singleView,
    PAGE_IDS.preview,
  ]);
  assert.equal(controller.isPageRouteAvailable(PAGE_IDS.preview), true);
  assert.equal(controller.isPageRouteAvailable(PAGE_IDS.wideView), false);
});

test("pageRouteLabel returns expected labels", () => {
  const h = createHarness();
  const controller = new PageNavigationController(h.host, h.constants);

  assert.equal(controller.pageRouteLabel(PAGE_IDS.mobileView), "Mobile");
  assert.equal(controller.pageRouteLabel(PAGE_IDS.preview), "Preview");
  assert.equal(controller.pageRouteLabel(PAGE_IDS.wideView), "Wide View");
  assert.equal(controller.pageRouteLabel(PAGE_IDS.singleView), "Single View");
});

test("pageNavMarkup builds markup from route helpers", () => {
  const h = createHarness();
  const controller = new PageNavigationController(h.host, h.constants);

  const markup = controller.pageNavMarkup();
  assert.equal(markup, "single-view|preview:single-view:Preview");
});

test("pageNavButtonsMarkup builds region contents without a wrapper", () => {
  const h = createHarness();
  const controller = new PageNavigationController(h.host, h.constants);

  assert.equal(controller.pageNavButtonsMarkup(), "buttons-only");
});

test("standalone Card View omits its redundant footer navigation button", () => {
  const h = createHarness();
  h.host._config = {
    card_view_page_enabled: true,
    card_view_standalone: true,
  };
  h.host._pageId = PAGE_IDS.cardView;
  h.constants.getEnabledPageRoutes = () => [PAGE_IDS.cardView];
  const controller = new PageNavigationController(h.host, h.constants);

  assert.equal(controller.pageNavMarkup(), "");
  assert.equal(controller.pageNavButtonsMarkup(), "");
  controller.syncPageNavShell();
  assert.equal(h.navContainer.innerHTML, "");
});

test("syncPageNavShell writes markup and updates nav buttons", () => {
  const h = createHarness();
  const controller = new PageNavigationController(h.host, h.constants);

  controller.syncPageNavShell();

  assert.equal(
    h.navContainer.innerHTML,
    "buttons-only",
  );
  assert.deepEqual(h.calls, [
    ["toggle", "active", true, PAGE_IDS.singleView],
    ["setAttribute", "aria-pressed", "true", PAGE_IDS.singleView],
    ["toggle", "active", false, PAGE_IDS.wideView],
    ["setAttribute", "aria-pressed", "false", PAGE_IDS.wideView],
  ]);
});

test("navigateToPageRoute delegates to factory navigateTo", () => {
  const h = createHarness();
  const controller = new PageNavigationController(h.host, h.constants);
  const context = { source: "test" };

  const result = controller.navigateToPageRoute(PAGE_IDS.preview, context);

  assert.equal(result, "navigated:preview");
  assert.deepEqual(h.getLastNavigateCall(), {
    pageId: PAGE_IDS.preview,
    context,
  });
});

test("navigateToConfiguredLandingPage resolves startup page and navigates", () => {
  const h = createHarness();
  const controller = new PageNavigationController(h.host, h.constants);
  const context = { hasPendingDeepLinkTarget: true, source: "config-fallback" };

  const result = controller.navigateToConfiguredLandingPage(context);

  assert.equal(result, "navigated:wide-view");
  assert.deepEqual(h.getLastStartupCall(), {
    hasPendingDeepLinkTarget: true,
  });
  assert.deepEqual(h.getLastNavigateCall(), {
    pageId: PAGE_IDS.wideView,
    context,
  });
});

test("configured landing mapper can substitute an editor-safe startup page", () => {
  const h = createHarness();
  const controller = new PageNavigationController(h.host, h.constants, {
    mapConfiguredLandingPage: (pageId) =>
      pageId === PAGE_IDS.wideView ? PAGE_IDS.singleView : pageId,
  });
  const context = { hasPendingDeepLinkTarget: false, source: "startup" };

  const result = controller.navigateToConfiguredLandingPage(context);

  assert.equal(result, "navigated:single-view");
  assert.deepEqual(h.getLastNavigateCall(), {
    pageId: PAGE_IDS.singleView,
    context,
  });
});

test("phone preview camera targets follow the configured landing flow", () => {
  const h = createHarness();
  h.host._deviceBucket = "mobile";
  h.host._config.mobile_page = "preview-mobile-view";
  h.constants.getEnabledPageRoutes = () => [
    PAGE_IDS.singleView,
    PAGE_IDS.mobileView,
    PAGE_IDS.preview,
  ];
  const controller = new PageNavigationController(h.host, h.constants);

  assert.equal(
    controller.resolvePreviewCameraTargetPage(PAGE_IDS.singleView),
    PAGE_IDS.mobileView,
  );

  h.host._config.mobile_page = "preview-single-view";
  assert.equal(
    controller.resolvePreviewCameraTargetPage(PAGE_IDS.mobileView),
    PAGE_IDS.singleView,
  );
});

test("prepareConfiguredLandingPageShell selects and renders the landing shell before activation", () => {
  const h = createHarness();
  const controller = new PageNavigationController(h.host, h.constants);

  const result = controller.prepareConfiguredLandingPageShell({
    hasPendingDeepLinkTarget: false,
  });

  assert.equal(result, PAGE_IDS.wideView);
  assert.equal(h.host._pageId, PAGE_IDS.wideView);
  assert.equal(h.host._previewPageActive, false);
  assert.equal(h.host._lastNonPreviewPageId, PAGE_IDS.wideView);
  assert.deepEqual(h.getLastStartupCall(), {
    hasPendingDeepLinkTarget: false,
  });
  assert.deepEqual(h.calls, [["renderShell"]]);

  controller.prepareConfiguredLandingPageShell({
    hasPendingDeepLinkTarget: false,
  });
  assert.deepEqual(h.calls, [["renderShell"]]);
});

test("landing shell preparation synchronizes scoped Home Assistant styling", () => {
  const h = createHarness();
  h.host._haNavbarController = {
    sync: () => h.calls.push(["syncHaNavbar", h.host._pageId]),
  };
  h.host._haPageBackgroundController = {
    sync: () => h.calls.push(["syncHaPageBackground", h.host._pageId]),
  };
  const controller = new PageNavigationController(h.host, h.constants);

  controller.prepareConfiguredLandingPageShell({
    hasPendingDeepLinkTarget: false,
  });

  assert.deepEqual(h.calls, [
    ["syncHaNavbar", PAGE_IDS.wideView],
    ["syncHaPageBackground", PAGE_IDS.wideView],
    ["renderShell"],
  ]);
});

test("navigation synchronization does not recreate an omitted region", () => {
  const h = createHarness();
  h.host._pageShellRegion = () => null;
  h.host._pageShellRegionElements = () => [];
  const controller = new PageNavigationController(h.host, h.constants);

  assert.doesNotThrow(() => controller.syncPageNavShell());
  assert.equal(h.navContainer.innerHTML, "");
});
