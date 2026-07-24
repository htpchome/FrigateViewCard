import { test } from "node:test";
import assert from "node:assert/strict";

import { SingleViewPageController } from "../src/single-view/single-view-page-controller.js";

const PAGE_IDS = { preview: "preview", wideView: "wide-view" };

const createHost = ({ isWide = false, popupOpen = false } = {}) => {
  const calls = [];
  const host = {
    _pageId: isWide ? "wide-view" : "single-view",
    _activeCamIdx: 0,
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
    _syncColHeight: () => calls.push(["syncColHeight"]),
    _syncStatus: () => calls.push(["syncStatus"]),
    _kickLiveIfStale: () => calls.push(["kickLiveIfStale"]),
    _renderSubtitle: () => calls.push(["renderSubtitle"]),
    _renderStats: () => calls.push(["renderStats"]),
    _renderCamSwitcher: () => calls.push(["renderCamSwitcher"]),
    _syncToolbarButtons: () => calls.push(["syncToolbarButtons"]),
    _syncPageNavigationButtons: () => calls.push(["syncPageNavigationButtons"]),
    _syncPageNavShell: () => calls.push(["syncPageNavShell"]),
    _restartRealtimeHeadPollTimer: () =>
      calls.push(["restartRealtimeHeadPollTimer"]),
    _navigateToConfiguredLandingPage: (context) =>
      calls.push(["navigateToConfiguredLandingPage", context]),
    _startPreviewMode: () => calls.push(["startPreviewMode"]),
    _cleanupEngine: () => calls.push(["cleanupEngine"]),
    _renderShell: () => calls.push(["renderShell"]),
    _setViewMode: (mode) => calls.push(["setViewMode", mode]),
    _mountEngine: (...args) => calls.push(["mountEngine", ...args]),
    _syncTabsShell: () => calls.push(["syncTabsShell"]),
    _renderListLabel: () => calls.push(["renderListLabel"]),
    _renderList: () => calls.push(["renderList"]),
    _renderAll: () => calls.push(["renderAll"]),
  };
  return { host, calls };
};

test("activateStandardPageRoute handles startup and mounts engine", () => {
  const { host, calls } = createHost();
  const controller = new SingleViewPageController(host, { PAGE_IDS });

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
  const controller = new SingleViewPageController(host, { PAGE_IDS });

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
  const controller = new SingleViewPageController(host, { PAGE_IDS });

  controller.activateStandardPageRoute({ previousPageId: "preview" });

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

test("activateStandardPageRoute in wide view syncs column height", () => {
  const { host, calls } = createHost({ isWide: true });
  const controller = new SingleViewPageController(host, { PAGE_IDS });

  controller.activateStandardPageRoute({});

  assert.deepEqual(calls[3], ["syncColHeight"]);
});

test("activateStandardPageRoute honors deferCameraSwitch", () => {
  const { host, calls } = createHost();
  const controller = new SingleViewPageController(host, { PAGE_IDS });

  controller.activateStandardPageRoute({ deferCameraSwitch: true });

  assert.deepEqual(calls, [
    ["applyPreviewShellVisibility"],
    ["applyCardStyle"],
    ["applyLayoutMode"],
  ]);
});

test("activateSingleViewPageRoute delegates to standard activation", () => {
  const { host, calls } = createHost();
  const controller = new SingleViewPageController(host, { PAGE_IDS });

  controller.activateSingleViewPageRoute({ startup: true });

  assert.deepEqual(calls, [
    ["applyPreviewShellVisibility"],
    ["applyCardStyle"],
    ["applyLayoutMode"],
    ["mountEngine"],
  ]);
});

test("activateWideViewPageRoute delegates to standard activation", () => {
  const { host, calls } = createHost({ isWide: true });
  const controller = new SingleViewPageController(host, { PAGE_IDS });

  controller.activateWideViewPageRoute({});

  assert.deepEqual(calls, [
    ["applyPreviewShellVisibility"],
    ["applyCardStyle"],
    ["applyLayoutMode"],
    ["syncColHeight"],
    ["syncTabsShell"],
    ["renderAll"],
  ]);
});

test("isWideViewPageActive derives state from host page id", () => {
  const { host } = createHost({ isWide: true });
  const controller = new SingleViewPageController(host, { PAGE_IDS });

  assert.equal(controller.isWideViewPageActive(), true);

  host._pageId = "single-view";
  assert.equal(controller.isWideViewPageActive(), false);
});

test("syncColHeightIfWideView syncs only for wide view route", () => {
  const wide = createHost({ isWide: true });
  const wideController = new SingleViewPageController(wide.host, { PAGE_IDS });
  wideController.syncColHeightIfWideView();
  assert.deepEqual(wide.calls, [["syncColHeight"]]);

  const single = createHost({ isWide: false });
  const singleController = new SingleViewPageController(single.host, {
    PAGE_IDS,
  });
  singleController.syncColHeightIfWideView();
  assert.deepEqual(single.calls, []);
});

test("wideViewLayoutState resolves wide layout widths with clamping", () => {
  const wide = createHost({ isWide: true });
  wide.host._config = { col_left_width_pct: "120" };
  const wideController = new SingleViewPageController(wide.host, { PAGE_IDS });

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
  const singleController = new SingleViewPageController(single.host, {
    PAGE_IDS,
  });
  assert.deepEqual(singleController.wideViewLayoutState("65"), {
    isWide: false,
    leftWidth: "",
    rightWidth: "",
  });
});

test("applyStyleLayoutForCurrentRoute applies style, layout, and wide sync", () => {
  const wide = createHost({ isWide: true });
  const wideController = new SingleViewPageController(wide.host, { PAGE_IDS });
  wideController.applyStyleLayoutForCurrentRoute();
  assert.deepEqual(wide.calls, [
    ["applyCardStyle"],
    ["applyLayoutMode"],
    ["syncColHeight"],
  ]);

  const single = createHost({ isWide: false });
  const singleController = new SingleViewPageController(single.host, {
    PAGE_IDS,
  });
  singleController.applyStyleLayoutForCurrentRoute();
  assert.deepEqual(single.calls, [["applyCardStyle"], ["applyLayoutMode"]]);
});

test("applyNonPreviewSchemaSoftUpdate orchestrates non-preview refresh", () => {
  const wide = createHost({ isWide: true });
  const wideController = new SingleViewPageController(wide.host, { PAGE_IDS });

  wideController.applyNonPreviewSchemaSoftUpdate();

  assert.deepEqual(wide.calls, [
    ["applyCardStyle"],
    ["applyLayoutMode"],
    ["syncColHeight"],
    ["syncStatus"],
    ["renderSubtitle"],
    ["renderStats"],
    ["renderCamSwitcher"],
    ["syncToolbarButtons"],
    ["syncPageNavigationButtons"],
  ]);
});

test("mountEngineQuietly remounts live engine without render", () => {
  const { host, calls } = createHost();
  const controller = new SingleViewPageController(host, { PAGE_IDS });

  controller.mountEngineQuietly();

  assert.deepEqual(calls, [["mountEngine", null, { quiet: true }]]);
});

test("mountEngineQuietlyAndRenderAll remounts then renders", () => {
  const { host, calls } = createHost();
  const controller = new SingleViewPageController(host, { PAGE_IDS });

  controller.mountEngineQuietlyAndRenderAll();

  assert.deepEqual(calls, [
    ["mountEngine", null, { quiet: true }],
    ["renderAll"],
  ]);
});

test("applyPostShellRerenderRouteBehavior navigates when active page is invalid", () => {
  const { host, calls } = createHost();
  const controller = new SingleViewPageController(host, { PAGE_IDS });

  controller.applyPostShellRerenderRouteBehavior({
    activePageInvalid: true,
    previewPageActive: false,
  });

  assert.deepEqual(calls, [
    ["navigateToConfiguredLandingPage", { source: "config-page-fallback" }],
  ]);
});

test("applyPostShellRerenderRouteBehavior restarts preview when preview page is active", () => {
  const { host, calls } = createHost();
  const controller = new SingleViewPageController(host, { PAGE_IDS });

  controller.applyPostShellRerenderRouteBehavior({
    activePageInvalid: false,
    previewPageActive: true,
  });

  assert.deepEqual(calls, [["startPreviewMode"]]);
});

test("applyPostShellRerenderRouteBehavior remounts and renders for non-preview pages", () => {
  const { host, calls } = createHost();
  const controller = new SingleViewPageController(host, { PAGE_IDS });

  controller.applyPostShellRerenderRouteBehavior({
    activePageInvalid: false,
    previewPageActive: false,
  });

  assert.deepEqual(calls, [
    ["mountEngine", null, { quiet: true }],
    ["renderAll"],
  ]);
});

test("applyConfigShellRerender navigates on invalid route", () => {
  const { host, calls } = createHost();
  const controller = new SingleViewPageController(host, { PAGE_IDS });

  controller.applyConfigShellRerender({
    activePageInvalid: true,
    previewPageActive: false,
  });

  assert.deepEqual(calls, [
    ["cleanupEngine"],
    ["renderShell"],
    ["navigateToConfiguredLandingPage", { source: "config-page-fallback" }],
  ]);
});

test("applyConfigShellRerender restarts preview when preview page is active", () => {
  const { host, calls } = createHost();
  const controller = new SingleViewPageController(host, { PAGE_IDS });

  controller.applyConfigShellRerender({
    activePageInvalid: false,
    previewPageActive: true,
  });

  assert.deepEqual(calls, [
    ["cleanupEngine"],
    ["renderShell"],
    ["startPreviewMode"],
  ]);
});

test("applyConfigShellRerender remounts and renders for non-preview routes", () => {
  const { host, calls } = createHost();
  const controller = new SingleViewPageController(host, { PAGE_IDS });

  controller.applyConfigShellRerender({
    activePageInvalid: false,
    previewPageActive: false,
  });

  assert.deepEqual(calls, [
    ["cleanupEngine"],
    ["renderShell"],
    ["mountEngine", null, { quiet: true }],
    ["renderAll"],
  ]);
});

test("applyNonPreviewConfigUpdateTail performs optional remount and poll restart", () => {
  const { host, calls } = createHost({ isWide: true });
  const controller = new SingleViewPageController(host, { PAGE_IDS });

  controller.applyNonPreviewConfigUpdateTail({
    needsEngineRemount: true,
    realtimePollChanged: true,
  });

  assert.deepEqual(calls, [
    ["applyCardStyle"],
    ["applyLayoutMode"],
    ["syncColHeight"],
    ["syncStatus"],
    ["renderSubtitle"],
    ["renderStats"],
    ["renderCamSwitcher"],
    ["syncToolbarButtons"],
    ["syncPageNavigationButtons"],
    ["mountEngine", null, { quiet: true }],
    ["restartRealtimeHeadPollTimer"],
  ]);
});

test("applyNonPreviewConfigUpdateTail skips optional steps when disabled", () => {
  const { host, calls } = createHost({ isWide: false });
  const controller = new SingleViewPageController(host, { PAGE_IDS });

  controller.applyNonPreviewConfigUpdateTail({
    needsEngineRemount: false,
    realtimePollChanged: false,
  });

  assert.deepEqual(calls, [
    ["applyCardStyle"],
    ["applyLayoutMode"],
    ["syncStatus"],
    ["renderSubtitle"],
    ["renderStats"],
    ["renderCamSwitcher"],
    ["syncToolbarButtons"],
    ["syncPageNavigationButtons"],
  ]);
});

test("applyNonPreviewHassUpdate applies status, live kick, and style by flags", () => {
  const { host, calls } = createHost();
  const controller = new SingleViewPageController(host, { PAGE_IDS });

  controller.applyNonPreviewHassUpdate({
    cameraStateChanged: true,
    themeChanged: true,
  });

  assert.deepEqual(calls, [
    ["syncStatus"],
    ["kickLiveIfStale"],
    ["applyCardStyle"],
  ]);
});

test("applyNonPreviewHassUpdate is a no-op when flags are false", () => {
  const { host, calls } = createHost();
  const controller = new SingleViewPageController(host, { PAGE_IDS });

  controller.applyNonPreviewHassUpdate({
    cameraStateChanged: false,
    themeChanged: false,
  });

  assert.deepEqual(calls, []);
});

test("applyEditorPreviewDraftRefresh orchestrates editor preview refresh order", () => {
  const { host, calls } = createHost({ isWide: true });
  const controller = new SingleViewPageController(host, { PAGE_IDS });

  controller.applyEditorPreviewDraftRefresh();

  assert.deepEqual(calls, [
    ["syncTabsShell"],
    ["syncPageNavShell"],
    ["renderCamSwitcher"],
    ["applyCardStyle"],
    ["applyLayoutMode"],
    ["syncColHeight"],
    ["syncStatus"],
    ["renderSubtitle"],
    ["renderStats"],
    ["renderListLabel"],
    ["renderList"],
    ["syncPageNavigationButtons"],
  ]);
});

test("applyCameraSetChange cleans up engine and clamps active camera index", () => {
  const { host, calls } = createHost();
  host._activeCamIdx = 5;
  const controller = new SingleViewPageController(host, { PAGE_IDS });

  controller.applyCameraSetChange({
    needsEngineRemount: true,
    nextCameraCount: 2,
  });

  assert.deepEqual(calls, [["cleanupEngine"]]);
  assert.equal(host._activeCamIdx, 1);
});

test("applyCameraSetChange is a no-op when remount is not needed", () => {
  const { host, calls } = createHost();
  host._activeCamIdx = 2;
  const controller = new SingleViewPageController(host, { PAGE_IDS });

  controller.applyCameraSetChange({
    needsEngineRemount: false,
    nextCameraCount: 1,
  });

  assert.deepEqual(calls, []);
  assert.equal(host._activeCamIdx, 2);
});
