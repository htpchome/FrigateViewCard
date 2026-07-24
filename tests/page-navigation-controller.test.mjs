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
  const returnedFactory = { id: "factory" };

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
  };

  const constants = {
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
    returnedFactory,
    getCreateCount: () => createCount,
    getInput: () => capturedFactoryInput,
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
