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
    _closePopup: () => calls.push(["closePopup"]),
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
    _closePopup: () => calls.push(["closePopup"]),
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
    _closePopup: () => calls.push(["closePopup"]),
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
    _closePopup: () => calls.push(["closePopup"]),
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
