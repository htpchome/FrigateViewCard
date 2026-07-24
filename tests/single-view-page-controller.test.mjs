import { test } from "node:test";
import assert from "node:assert/strict";

import { SingleViewPageController } from "../src/single-view/single-view-page-controller.js";

const createHost = ({ isWide = false, popupOpen = false } = {}) => {
  const calls = [];
  const host = {
    _pageId: "single-view",
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
    _isWideViewPageActive: () => isWide,
    _syncColHeight: () => calls.push(["syncColHeight"]),
    _setViewMode: (mode) => calls.push(["setViewMode", mode]),
    _mountEngine: (...args) => calls.push(["mountEngine", ...args]),
    _syncTabsShell: () => calls.push(["syncTabsShell"]),
    _renderAll: () => calls.push(["renderAll"]),
  };
  return { host, calls };
};

test("activateStandardPageRoute handles startup and mounts engine", () => {
  const { host, calls } = createHost();
  const controller = new SingleViewPageController(host, {
    PAGE_IDS: { preview: "preview" },
  });

  controller.activateStandardPageRoute({ startup: true });

  assert.deepEqual(calls, [
    ["applyPreviewShellVisibility"],
    ["applyCardStyle"],
    ["applyLayoutMode"],
    ["mountEngine"],
  ]);
});

test("activateStandardPageRoute startup grid chooses grid mode", () => {
  const { host, calls } = createHost();
  const controller = new SingleViewPageController(host, {
    PAGE_IDS: { preview: "preview" },
  });

  controller.activateStandardPageRoute({ startup: true, startInGrid: true });

  assert.deepEqual(calls, [
    ["applyPreviewShellVisibility"],
    ["applyCardStyle"],
    ["applyLayoutMode"],
    ["setViewMode", "grid"],
  ]);
});

test("activateStandardPageRoute leaves preview and remounts quietly", () => {
  const { host, calls } = createHost({ popupOpen: true });
  host._pageId = "wide-view";
  const controller = new SingleViewPageController(host, {
    PAGE_IDS: { preview: "preview" },
  });

  controller.activateStandardPageRoute({ previousPageId: "preview" });

  assert.deepEqual(calls, [
    ["stopPreview"],
    ["closePopup"],
    ["cancelPendingMount", "page-route-wide-view"],
    ["applyPreviewShellVisibility"],
    ["applyCardStyle"],
    ["applyLayoutMode"],
    ["mountEngine", null, { quiet: true }],
    ["syncTabsShell"],
    ["renderAll"],
  ]);
});

test("activateStandardPageRoute in wide view syncs column height", () => {
  const { host, calls } = createHost({ isWide: true });
  const controller = new SingleViewPageController(host, {
    PAGE_IDS: { preview: "preview" },
  });

  controller.activateStandardPageRoute({});

  assert.deepEqual(calls[3], ["syncColHeight"]);
});

test("activateStandardPageRoute honors deferCameraSwitch", () => {
  const { host, calls } = createHost();
  const controller = new SingleViewPageController(host, {
    PAGE_IDS: { preview: "preview" },
  });

  controller.activateStandardPageRoute({ deferCameraSwitch: true });

  assert.deepEqual(calls, [
    ["applyPreviewShellVisibility"],
    ["applyCardStyle"],
    ["applyLayoutMode"],
  ]);
});
