import { test } from "node:test";
import assert from "node:assert/strict";

import { CARD_TAG } from "../src/constants.js";
import { createHomeAssistantDashboardControllers } from "../src/integrations/home-assistant/dashboard-composition.js";

test("Home Assistant dashboard composition preserves controller order and navigation delegates", () => {
  const calls = [];
  const options = {};
  const controllers = {
    navbar: { type: "navbar" },
    swipe: { type: "swipe" },
    background: { type: "background" },
  };
  const factories = {
    createNavbarController: (card, value) => {
      calls.push(["create-navbar", card]);
      options.navbar = value;
      return controllers.navbar;
    },
    createDashboardSwipeNavigationController: (card, value) => {
      calls.push(["create-swipe", card]);
      options.swipe = value;
      return controllers.swipe;
    },
    createPageBackgroundController: (card) => {
      calls.push(["create-background", card]);
      return controllers.background;
    },
  };
  const card = {
    _config: { ha_dashboard_swipe_navigation_owner: true },
    _handleDashboardScopeExited: () => calls.push(["scope-exited"]),
    _handleDashboardSwipeNavigationSettled: () =>
      calls.push(["navigation-settled"]),
    _pageNavigationController: {
      allowsDashboardPageSwipe: () => false,
      isSwipeNavigationEnabled: () => false,
      navigateToPageRoute: (...args) => {
        calls.push(["navigate", ...args]);
        return args[0];
      },
      resolveDashboardSwipeBoundaryPage: (value) => {
        calls.push(["resolve-boundary", value]);
        return "boundary-page";
      },
      resolveSwipePageTarget: (...args) => {
        calls.push(["resolve-page", ...args]);
        return "internal-page";
      },
    },
  };

  const result = createHomeAssistantDashboardControllers(card, {
    deviceProfile: { hasTouch: true, isIOS: true },
    factories,
  });

  assert.deepEqual(result, {
    _haNavbarController: controllers.navbar,
    _haDashboardSwipeNavigationController: controllers.swipe,
    _haPageBackgroundController: controllers.background,
  });
  assert.deepEqual(calls, [
    ["create-navbar", card],
    ["create-swipe", card],
    ["create-background", card],
  ]);
  assert.deepEqual(options.navbar, { isIOS: true });
  assert.equal(options.swipe.hasTouch, true);
  assert.equal(options.swipe.cardTag, CARD_TAG);
  assert.equal(options.swipe.enforceDashboardOwner, true);
  assert.equal(options.swipe.isSwipeNavigationOwner(), true);

  assert.equal(
    options.swipe.resolveInternalPageTarget("left", { mode: "inside-card" }),
    "internal-page",
  );
  assert.equal(
    options.swipe.resolveDashboardBoundaryPage({
      direction: "right",
      transition: "exit",
      swipePolicy: { mode: "dashboard-wide" },
    }),
    "boundary-page",
  );
  assert.equal(options.swipe.allowDashboardNavigation(), false);
  assert.equal(options.swipe.isNavigationEnabled(), false);
  assert.equal(options.swipe.navigateInternalPage("wide-view"), true);
  options.swipe.onDashboardNavigationSettled();
  options.swipe.onDashboardScopeExited();

  assert.deepEqual(calls.slice(3), [
    ["resolve-page", "left", "inside-card"],
    [
      "resolve-boundary",
      {
        direction: "right",
        transition: "exit",
        swipeMode: "dashboard-wide",
      },
    ],
    ["navigate", "wide-view", { source: "dashboard-swipe" }],
    ["navigation-settled"],
    ["scope-exited"],
  ]);
});

test("Home Assistant dashboard composition keeps permissive navigation fallbacks", () => {
  let swipeOptions;
  const card = { _config: {} };
  const factories = {
    createNavbarController: () => ({}),
    createDashboardSwipeNavigationController: (_card, options) => {
      swipeOptions = options;
      return {};
    },
    createPageBackgroundController: () => ({}),
  };

  createHomeAssistantDashboardControllers(card, { factories });

  assert.equal(swipeOptions.resolveInternalPageTarget("left", {}), null);
  assert.equal(
    swipeOptions.resolveDashboardBoundaryPage({
      direction: "left",
      transition: "enter",
      swipePolicy: {},
    }),
    null,
  );
  assert.equal(swipeOptions.allowDashboardNavigation(), true);
  assert.equal(swipeOptions.isNavigationEnabled(), true);
  assert.equal(swipeOptions.navigateInternalPage("single-view"), false);
  assert.equal(swipeOptions.isSwipeNavigationOwner(), false);
});
