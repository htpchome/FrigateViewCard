import { test } from "node:test";
import assert from "node:assert/strict";

import { MobileCamSwitcherController } from "../src/features/mobile-view/cam-switcher.ctrl.js";

function createTarget(matchers = {}) {
  return {
    closest(selector) {
      return matchers[selector] || null;
    },
  };
}

test("mobile cam switcher controller toggles open on trigger click", () => {
  let open = false;
  let renderCalls = 0;
  const controller = new MobileCamSwitcherController({
    isOpen: () => open,
    setOpen: (next) => {
      open = next;
    },
    renderCamSwitcher: () => {
      renderCalls += 1;
    },
  });

  const handled = controller.handleClickTarget(
    createTarget({
      "[data-mobile-cam-trigger]": {},
    }),
  );

  assert.equal(handled, true);
  assert.equal(open, true);
  assert.equal(renderCalls, 1);
});

test("mobile cam switcher controller switches camera on option click", async () => {
  let open = true;
  let paused = 0;
  let switchedIdx = null;
  const controller = new MobileCamSwitcherController({
    isOpen: () => open,
    setOpen: (next) => {
      open = next;
    },
    pauseSlideshowForInteraction: () => {
      paused += 1;
    },
    switchCamera: async (idx) => {
      switchedIdx = idx;
    },
  });

  const handled = controller.handleClickTarget(
    createTarget({
      "[data-mobile-camidx]": {
        dataset: { mobileCamidx: "2" },
      },
    }),
  );

  assert.equal(handled, true);
  await Promise.resolve();
  assert.equal(open, false);
  assert.equal(paused, 1);
  assert.equal(switchedIdx, 2);
});

test("mobile cam switcher controller closes when clicking outside", () => {
  let open = true;
  let renderCalls = 0;
  const controller = new MobileCamSwitcherController({
    isOpen: () => open,
    setOpen: (next) => {
      open = next;
    },
    renderCamSwitcher: () => {
      renderCalls += 1;
    },
  });

  controller.closeIfOutside(createTarget({}));

  assert.equal(open, false);
  assert.equal(renderCalls, 1);
});
