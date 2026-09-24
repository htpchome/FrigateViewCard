import { test } from "node:test";
import assert from "node:assert/strict";

import { PAGE_IDS } from "../src/features/navigation/router.js";
import { createMobileViewControllers } from "../src/features/mobile-view/composition.js";

test("Mobile View composition preserves controller order and delegates", async () => {
  const calls = [];
  const options = {};
  const pageController = { type: "page" };
  const camSwitcherController = { type: "camera-switcher" };
  const picker = { type: "picker" };
  const card = {
    _mobileCamSwitcherOpen: false,
    _pageShellRegionElement: (...args) => {
      calls.push(["get-picker", ...args]);
      return picker;
    },
    _pauseSlideshowForInteraction: () => calls.push(["pause-slideshow"]),
    _renderCamSwitcher: () => calls.push(["render-switcher"]),
    _switchCamera: async (index) => {
      calls.push(["switch-camera", index]);
      return index;
    },
  };
  const factories = {
    createPageController: (host, constants) => {
      calls.push(["create-page", host]);
      options.page = constants;
      return pageController;
    },
    createCamSwitcherController: (value) => {
      calls.push(["create-switcher"]);
      options.switcher = value;
      return camSwitcherController;
    },
  };

  const result = createMobileViewControllers(card, { factories });

  assert.deepEqual(result, {
    _mobileViewPageController: pageController,
    _mobileCamSwitcherController: camSwitcherController,
  });
  assert.deepEqual(calls, [
    ["create-page", card],
    ["create-switcher"],
  ]);
  assert.equal(options.page.PAGE_IDS, PAGE_IDS);
  assert.equal(options.switcher.isOpen(), false);
  options.switcher.setOpen(true);
  assert.equal(card._mobileCamSwitcherOpen, true);
  assert.equal(options.switcher.isOpen(), true);
  options.switcher.renderCamSwitcher();
  assert.equal(options.switcher.getPicker(), picker);
  options.switcher.pauseSlideshowForInteraction();
  assert.equal(await options.switcher.switchCamera(3), 3);
  assert.deepEqual(calls.slice(2), [
    ["render-switcher"],
    ["get-picker", "cameraSwitcher", "[data-mobile-cam-picker]"],
    ["pause-slideshow"],
    ["switch-camera", 3],
  ]);
});
