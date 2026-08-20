import { test } from "node:test";
import assert from "node:assert/strict";

import { GridPageController } from "../src/features/grid/page.ctrl.js";
import { SlideshowPageController } from "../src/features/slideshow/page.ctrl.js";

test("grid mode refuses activation while another toolbar mode is active", () => {
  const calls = [];
  const host = {
    _viewMode: "single",
    _gridResumePending: false,
    _isPreviewPageActive: () => false,
    _toolbarButtonStates: () => ({ gridDisabled: true }),
    _syncToolbarButtons: () => calls.push("syncToolbar"),
    _setViewMode: (mode) => calls.push(["setViewMode", mode]),
  };
  const controller = new GridPageController(host);

  controller.toggleGridMode();

  assert.deepEqual(calls, ["syncToolbar"]);
  assert.equal(host._viewMode, "single");
});

test("slideshow refuses activation while another toolbar mode is active", () => {
  const calls = [];
  const host = {
    _slideshowActive: false,
    _toolbarButtonStates: () => ({ slideshowDisabled: true }),
    _syncToolbarButtons: () => calls.push("syncToolbar"),
    _isSlideshowRotationAvailable: () => true,
  };
  const controller = new SlideshowPageController(host);

  controller.toggleRotation();

  assert.deepEqual(calls, ["syncToolbar"]);
  assert.equal(host._slideshowActive, false);
  assert.equal(controller.startRotation(), false);
});
