import { test } from "node:test";
import assert from "node:assert/strict";

import { WideViewPageController } from "../src/wide-view/wide-view-page-controller.js";

const PAGE_IDS = { preview: "preview", wideView: "wide-view" };

const createHost = ({ isWide = false, popupOpen = false } = {}) => {
  const calls = [];
  const host = {
    _pageId: isWide ? "wide-view" : "single-view",
    _stopPreviewMode: () => calls.push(["stopPreview"]),
    _$: (selector) => {
      if (selector === "#myPopup" && popupOpen) {
        return {
          classList: {
            contains: (className) => className === "is-open",
          },
        };
      }
      return null;
    },
    _closePopup: () => calls.push(["closePopup"]),
    _cancelPendingMount: (reason) => calls.push(["cancelPendingMount", reason]),
    _applyPreviewShellVisibility: () =>
      calls.push(["applyPreviewShellVisibility"]),
    _applyCardStyle: () => calls.push(["applyCardStyle"]),
    _applyLayoutMode: () => calls.push(["applyLayoutMode"]),
    _setViewMode: (mode) => calls.push(["setViewMode", mode]),
    _mountEngine: (...args) => calls.push(["mountEngine", ...args]),
    _syncTabsShell: () => calls.push(["syncTabsShell"]),
    _renderAll: () => calls.push(["renderAll"]),
    _syncColHeight: () => calls.push(["syncColHeight"]),
  };
  return { host, calls };
};

test("activateWideViewPageRoute handles startup and mounts engine", () => {
  const { host, calls } = createHost({ isWide: true });
  const controller = new WideViewPageController(host, { PAGE_IDS });

  controller.activateWideViewPageRoute({ startup: true });

  assert.deepEqual(calls, [
    ["applyPreviewShellVisibility"],
    ["applyCardStyle"],
    ["applyLayoutMode"],
    ["syncColHeight"],
    ["mountEngine"],
  ]);
});

test("activateWideViewPageRoute startup grid chooses grid mode", () => {
  const { host, calls } = createHost({ isWide: true });
  const controller = new WideViewPageController(host, { PAGE_IDS });

  controller.activateWideViewPageRoute({ startup: true, startInGrid: true });

  assert.deepEqual(calls, [
    ["applyPreviewShellVisibility"],
    ["applyCardStyle"],
    ["applyLayoutMode"],
    ["syncColHeight"],
    ["setViewMode", "grid"],
  ]);
});

test("activateWideViewPageRoute leaves preview and remounts quietly", () => {
  const { host, calls } = createHost({ isWide: true, popupOpen: true });
  const controller = new WideViewPageController(host, { PAGE_IDS });

  controller.activateWideViewPageRoute({ previousPageId: "preview" });

  assert.deepEqual(calls, [
    ["stopPreview"],
    ["closePopup"],
    ["cancelPendingMount", "page-route-wide-view"],
    ["applyPreviewShellVisibility"],
    ["applyCardStyle"],
    ["applyLayoutMode"],
    ["syncColHeight"],
    ["mountEngine", null, { quiet: true }],
    ["syncTabsShell"],
    ["renderAll"],
  ]);
});

test("activateWideViewPageRoute honors deferCameraSwitch", () => {
  const { host, calls } = createHost({ isWide: true });
  const controller = new WideViewPageController(host, { PAGE_IDS });

  controller.activateWideViewPageRoute({ deferCameraSwitch: true });

  assert.deepEqual(calls, [
    ["applyPreviewShellVisibility"],
    ["applyCardStyle"],
    ["applyLayoutMode"],
    ["syncColHeight"],
  ]);
});

test("isWideViewPageActive derives state from host page id", () => {
  const { host } = createHost({ isWide: true });
  const controller = new WideViewPageController(host, { PAGE_IDS });

  assert.equal(controller.isWideViewPageActive(), true);

  host._pageId = "single-view";
  assert.equal(controller.isWideViewPageActive(), false);
});

test("syncColHeightIfWideView syncs only for wide route", () => {
  const wide = createHost({ isWide: true });
  const wideController = new WideViewPageController(wide.host, { PAGE_IDS });
  wideController.syncColHeightIfWideView();
  assert.deepEqual(wide.calls, [["syncColHeight"]]);

  const single = createHost({ isWide: false });
  const singleController = new WideViewPageController(single.host, {
    PAGE_IDS,
  });
  singleController.syncColHeightIfWideView();
  assert.deepEqual(single.calls, []);
});

test("wideViewLayoutState resolves wide layout widths with clamping", () => {
  const wide = createHost({ isWide: true });
  const wideController = new WideViewPageController(wide.host, { PAGE_IDS });

  assert.deepEqual(wideController.wideViewLayoutState("120"), {
    isWide: true,
    leftWidth: "90%",
    rightWidth: "10%",
  });
  assert.deepEqual(wideController.wideViewLayoutState("5"), {
    isWide: true,
    leftWidth: "10%",
    rightWidth: "90%",
  });
  assert.deepEqual(wideController.wideViewLayoutState("65"), {
    isWide: true,
    leftWidth: "65%",
    rightWidth: "35%",
  });

  const single = createHost({ isWide: false });
  const singleController = new WideViewPageController(single.host, {
    PAGE_IDS,
  });
  assert.deepEqual(singleController.wideViewLayoutState("65"), {
    isWide: false,
    leftWidth: "",
    rightWidth: "",
  });
});
