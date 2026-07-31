import { test } from "node:test";
import assert from "node:assert/strict";

import { MobileViewPageController } from "../src/mobile-view/mobile-view-page-controller.js";

const PAGE_IDS = {
  preview: "preview",
  mobileView: "mobile-view",
};

const createHost = ({ popupOpen = false } = {}) => {
  const calls = [];
  const host = {
    _pageId: PAGE_IDS.mobileView,
    _stopPreviewMode: () => calls.push(["stopPreview"]),
    _$: (selector) => {
      if (selector === "#myPopup" && popupOpen) {
        return {
          classList: {
            contains: (className) => className === "is-open",
          },
        };
      }
      if (selector === "#card") {
        return {
          classList: {
            toggle: (className, enabled) =>
              calls.push(["toggleClass", className, enabled]),
          },
        };
      }
      return null;
    },
    _closePopup: () => calls.push(["closePopup"]),
    _cancelPendingMount: (reason) => calls.push(["cancelPendingMount", reason]),
    _applyPreviewShellVisibility: () =>
      calls.push(["applyPreviewShellVisibility"]),
    _mountEngine: (...args) => calls.push(["mountEngine", ...args]),
    _syncTabsShell: () => calls.push(["syncTabsShell"]),
    _renderAll: () => calls.push(["renderAll"]),
    _wideViewPageController: {
      applyStyleLayoutAndWideSyncForCard: () =>
        calls.push(["applyStyleLayoutAndWideSyncForCard"]),
    },
  };
  return { host, calls };
};

test("activateMobileViewPageRoute handles startup like single-view", () => {
  const { host, calls } = createHost();
  const controller = new MobileViewPageController(host, { PAGE_IDS });

  controller.activateMobileViewPageRoute({ startup: true });

  assert.deepEqual(calls, [
    ["applyPreviewShellVisibility"],
    ["applyStyleLayoutAndWideSyncForCard"],
    ["toggleClass", "mobile-view-active", true],
    ["mountEngine"],
  ]);
});

test("activateMobileViewPageRoute leaves preview and remounts quietly", () => {
  const { host, calls } = createHost({ popupOpen: true });
  const controller = new MobileViewPageController(host, { PAGE_IDS });

  controller.activateMobileViewPageRoute({ previousPageId: PAGE_IDS.preview });

  assert.deepEqual(calls, [
    ["stopPreview"],
    ["closePopup"],
    ["cancelPendingMount", "page-route-mobile-view"],
    ["applyPreviewShellVisibility"],
    ["applyStyleLayoutAndWideSyncForCard"],
    ["toggleClass", "mobile-view-active", true],
    ["mountEngine", null, { quiet: true }],
    ["syncTabsShell"],
    ["renderAll"],
  ]);
});

test("syncMobileViewPageMarkup toggles class off when route is not mobile", () => {
  const { host, calls } = createHost();
  const controller = new MobileViewPageController(host, { PAGE_IDS });

  host._pageId = "single-view";
  controller.syncMobileViewPageMarkup();

  assert.deepEqual(calls, [["toggleClass", "mobile-view-active", false]]);
});
