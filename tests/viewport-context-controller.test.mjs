import { test } from "node:test";
import assert from "node:assert/strict";

import { ViewportContextController } from "../src/features/viewport/context.ctrl.js";

const withGlobals = (overrides, fn) => {
  const originalWindow = global.window;
  const originalDocument = global.document;
  const originalGetComputedStyle = global.getComputedStyle;
  global.window = overrides.window;
  global.document = overrides.document;
  global.getComputedStyle = overrides.getComputedStyle;
  try {
    fn();
  } finally {
    global.window = originalWindow;
    global.document = originalDocument;
    global.getComputedStyle = originalGetComputedStyle;
  }
};

test("isCardVisible respects connection, document visibility, display, and bounds", () => {
  const host = {
    isConnected: true,
    getBoundingClientRect: () => ({ width: 40, height: 20 }),
  };
  const controller = new ViewportContextController(host);

  withGlobals(
    {
      window: {},
      document: { visibilityState: "visible" },
      getComputedStyle: () => ({ display: "block", visibility: "visible" }),
    },
    () => {
      assert.equal(controller.isCardVisible(), true);
    },
  );

  host.isConnected = false;
  withGlobals(
    {
      window: {},
      document: { visibilityState: "visible" },
      getComputedStyle: () => ({ display: "block", visibility: "visible" }),
    },
    () => {
      assert.equal(controller.isCardVisible(), false);
    },
  );
});

test("isMobilePhoneViewport uses card width fallback and threshold", () => {
  const host = { _cardWidth: 390 };
  const controller = new ViewportContextController(host);

  withGlobals(
    {
      window: { innerWidth: 500 },
      document: {},
      getComputedStyle: () => ({ display: "block", visibility: "visible" }),
    },
    () => {
      assert.equal(controller.isMobilePhoneViewport(), true);
    },
  );

  host._cardWidth = 430;
  withGlobals(
    {
      window: { innerWidth: 430 },
      document: {},
      getComputedStyle: () => ({ display: "block", visibility: "visible" }),
    },
    () => {
      assert.equal(controller.isMobilePhoneViewport(), false);
    },
  );
});

test("isMobileTabletViewport matches coarse tablet-sized displays", () => {
  const controller = new ViewportContextController({});

  withGlobals(
    {
      window: {
        innerWidth: 1024,
        innerHeight: 768,
        matchMedia: (query) => ({
          matches:
            query === "(pointer: coarse)" || query === "(any-pointer: coarse)",
        }),
      },
      document: {},
      getComputedStyle: () => ({ display: "block", visibility: "visible" }),
    },
    () => {
      assert.equal(controller.isMobileTabletViewport(), true);
      assert.equal(controller.isLandscapeViewport(), true);
    },
  );
});

test("isLandscapeViewport falls back to dimensions when media query is unavailable", () => {
  const controller = new ViewportContextController({});

  withGlobals(
    {
      window: {
        innerWidth: 600,
        innerHeight: 900,
        matchMedia: () => ({ matches: false }),
      },
      document: {},
      getComputedStyle: () => ({ display: "block", visibility: "visible" }),
    },
    () => {
      assert.equal(controller.isLandscapeViewport(), false);
    },
  );
});
