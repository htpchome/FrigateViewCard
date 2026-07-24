import { test } from "node:test";
import assert from "node:assert/strict";

import { PageNavigationController } from "../src/navigation/page-navigation-controller.js";

const PAGE_IDS = {
  singleView: "single-view",
  preview: "preview",
  wideView: "wide-view",
};

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
    _config: { a: 1 },
    _activateSingleViewPageRoute: (context) => calls.push(["single", context]),
    _activatePreviewPageRoute: (context) => calls.push(["preview", context]),
    _activateWideViewPageRoute: (context) => calls.push(["wide", context]),
    _deviceRouteBucket: () => "desktop",
    _syncPageNavigationButtons: () => calls.push(["syncButtons"]),
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
    buildPageNavMarkup: ({ routes, activePageId, getRouteLabel }) =>
      `${routes.join("|")}:${activePageId}:${getRouteLabel(PAGE_IDS.preview)}`,
    getEnabledPageRoutes: () => [PAGE_IDS.singleView, PAGE_IDS.preview],
    normalizePageRoute: (value) =>
      String(value || "")
        .trim()
        .toLowerCase(),
    PAGE_IDS,
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

  input.onAfterNavigate(PAGE_IDS.preview);
  assert.equal(h.host._lastNonPreviewPageId, PAGE_IDS.singleView);
  assert.deepEqual(h.calls, [["syncButtons"]]);

  input.onBeforeNavigate(PAGE_IDS.wideView, context);
  input.onAfterNavigate(PAGE_IDS.wideView);
  assert.equal(h.host._lastNonPreviewPageId, PAGE_IDS.wideView);
});

test("factory page activators route to host handlers", () => {
  const h = createHarness();
  const controller = new PageNavigationController(h.host, h.constants);
  controller.ensureNavigationFactory();
  const input = h.getInput();

  const context = { source: "test" };
  input.pages[PAGE_IDS.singleView].activate(context);
  input.pages[PAGE_IDS.preview].activate(context);
  input.pages[PAGE_IDS.wideView].activate(context);

  assert.deepEqual(h.calls, [
    ["single", context],
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

test("syncPageNavShell writes markup and updates nav buttons", () => {
  const h = createHarness();
  const controller = new PageNavigationController(h.host, h.constants);

  controller.syncPageNavShell();

  assert.equal(
    h.navContainer.innerHTML,
    "single-view|preview:single-view:Preview",
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
