import { test } from "node:test";
import assert from "node:assert/strict";

import {
  activateStandardPageRouteLifecycle,
  syncStandardRouteShell,
} from "../src/features/navigation/route-lifecycle.js";

test("syncStandardRouteShell updates tabs and renders without remount", () => {
  const calls = [];
  const host = {
    _renderShellPreserveLive: () => calls.push(["renderShellPreserveLive"]),
    _syncTabsShell: () => calls.push(["syncTabsShell"]),
    _renderAll: () => calls.push(["renderAll"]),
  };

  syncStandardRouteShell(host);

  assert.deepEqual(calls, [
    ["renderShellPreserveLive"],
    ["syncTabsShell"],
    ["renderAll"],
  ]);
});

test("activateStandardPageRouteLifecycle avoids shell remount on non-startup route change", () => {
  const calls = [];
  const host = {
    _pageId: "mobile-view",
    _renderShellPreserveLive: () => calls.push(["renderShellPreserveLive"]),
    _syncTabsShell: () => calls.push(["syncTabsShell"]),
    _renderAll: () => calls.push(["renderAll"]),
    _stopPreviewMode: () => calls.push(["stopPreview"]),
    _cancelPendingMount: (reason) => calls.push(["cancelPendingMount", reason]),
    _$: () => null,
    _popupLifecycleController: {
      close: () => calls.push(["closePopup"]),
    },
  };

  activateStandardPageRouteLifecycle({
    host,
    context: { previousPageId: "single-view", startup: false },
    previewPageId: "preview",
    applyRouteFrame: () => calls.push(["applyRouteFrame"]),
  });

  assert.deepEqual(calls, [
    ["applyRouteFrame"],
    ["renderShellPreserveLive"],
    ["syncTabsShell"],
    ["renderAll"],
  ]);
});

test("activateStandardPageRouteLifecycle starts live and renders on startup routes", () => {
  const calls = [];
  const host = {
    _pageId: "mobile-view",
    _mountEngine: () => calls.push(["mountEngine"]),
    _renderAll: () => calls.push(["renderAll"]),
  };

  activateStandardPageRouteLifecycle({
    host,
    context: { startup: true },
    previewPageId: "preview",
    applyRouteFrame: () => calls.push(["applyRouteFrame"]),
  });

  assert.deepEqual(calls, [
    ["applyRouteFrame"],
    ["mountEngine"],
    ["renderAll"],
  ]);
});

test("activateStandardPageRouteLifecycle leaving preview does not cancel when mount idle", () => {
  const calls = [];
  const host = {
    _pageId: "single-view",
    _mountInProgress: false,
    _renderShellPreserveLive: () => calls.push(["renderShellPreserveLive"]),
    _syncTabsShell: () => calls.push(["syncTabsShell"]),
    _renderAll: () => calls.push(["renderAll"]),
    _stopPreviewMode: () => calls.push(["stopPreviewMode"]),
    _cancelPendingMount: (reason) => calls.push(["cancelPendingMount", reason]),
    _$: () => null,
    _popupLifecycleController: {
      close: () => calls.push(["closePopup"]),
    },
  };

  activateStandardPageRouteLifecycle({
    host,
    context: { previousPageId: "preview", startup: false },
    previewPageId: "preview",
    applyRouteFrame: () => calls.push(["applyRouteFrame"]),
  });

  assert.deepEqual(calls, [
    ["stopPreviewMode"],
    ["applyRouteFrame"],
    ["renderShellPreserveLive"],
    ["syncTabsShell"],
    ["renderAll"],
  ]);
});

test("activateStandardPageRouteLifecycle leaving preview cancels when mount active", () => {
  const calls = [];
  const host = {
    _pageId: "single-view",
    _mountInProgress: true,
    _renderShellPreserveLive: () => calls.push(["renderShellPreserveLive"]),
    _syncTabsShell: () => calls.push(["syncTabsShell"]),
    _renderAll: () => calls.push(["renderAll"]),
    _stopPreviewMode: () => calls.push(["stopPreviewMode"]),
    _cancelPendingMount: (reason) => calls.push(["cancelPendingMount", reason]),
    _$: () => null,
    _popupLifecycleController: {
      close: () => calls.push(["closePopup"]),
    },
  };

  activateStandardPageRouteLifecycle({
    host,
    context: { previousPageId: "preview", startup: false },
    previewPageId: "preview",
    applyRouteFrame: () => calls.push(["applyRouteFrame"]),
  });

  assert.deepEqual(calls, [
    ["stopPreviewMode"],
    ["cancelPendingMount", "page-route-single-view"],
    ["applyRouteFrame"],
    ["renderShellPreserveLive"],
    ["syncTabsShell"],
    ["renderAll"],
  ]);
});

test("page navigation leaving Preview immediately resumes the retained camera", () => {
  const calls = [];
  const host = {
    _pageId: "mobile-view",
    _mountInProgress: false,
    _renderShellPreserveLive: () => calls.push(["renderShellPreserveLive"]),
    _syncTabsShell: () => calls.push(["syncTabsShell"]),
    _renderAll: () => calls.push(["renderAll"]),
    _stopPreviewMode: () => calls.push(["stopPreviewMode"]),
    _$: () => null,
    _previewPageController: {
      prepareRetainedCameraExit: () => calls.push(["prepareRetainedCamera"]),
      resumeRetainedCameraAfterExit: () =>
        calls.push(["resumeRetainedCamera"]),
    },
  };

  activateStandardPageRouteLifecycle({
    host,
    context: { previousPageId: "preview", source: "page-nav" },
    previewPageId: "preview",
    applyRouteFrame: () => calls.push(["applyRouteFrame"]),
  });

  assert.deepEqual(calls, [
    ["stopPreviewMode"],
    ["prepareRetainedCamera"],
    ["applyRouteFrame"],
    ["renderShellPreserveLive"],
    ["syncTabsShell"],
    ["renderAll"],
    ["resumeRetainedCamera"],
  ]);
});

test("activateStandardPageRouteLifecycle applies shell swap during deferred camera switch", () => {
  const calls = [];
  const host = {
    _pageId: "single-view",
    _mountInProgress: false,
    _renderShellPreserveLive: () => calls.push(["renderShellPreserveLive"]),
    _syncTabsShell: () => calls.push(["syncTabsShell"]),
    _renderAll: () => calls.push(["renderAll"]),
    _stopPreviewMode: () => calls.push(["stopPreviewMode"]),
    _cancelPendingMount: (reason) => calls.push(["cancelPendingMount", reason]),
    _$: () => null,
    _popupLifecycleController: {
      close: () => calls.push(["closePopup"]),
    },
  };

  activateStandardPageRouteLifecycle({
    host,
    context: {
      previousPageId: "preview",
      startup: false,
      deferCameraSwitch: true,
    },
    previewPageId: "preview",
    applyRouteFrame: () => calls.push(["applyRouteFrame"]),
  });

  assert.deepEqual(calls, [
    ["stopPreviewMode"],
    ["applyRouteFrame"],
    ["renderShellPreserveLive"],
    ["syncTabsShell"],
    ["renderAll"],
  ]);
});

test("activateStandardPageRouteLifecycle keeps startup behavior unchanged", () => {
  const calls = [];
  const host = {
    _setViewMode: (mode) => calls.push(["setViewMode", mode]),
    _mountEngine: (...args) => calls.push(["mountEngine", ...args]),
  };

  activateStandardPageRouteLifecycle({
    host,
    context: { startup: true, startInGrid: true },
    previewPageId: "preview",
    applyRouteFrame: () => calls.push(["applyRouteFrame"]),
  });

  assert.deepEqual(calls, [["applyRouteFrame"], ["setViewMode", "grid"]]);
});
