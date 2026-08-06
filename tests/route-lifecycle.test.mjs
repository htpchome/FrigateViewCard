import { test } from "node:test";
import assert from "node:assert/strict";

import {
  activateStandardPageRouteLifecycle,
  syncStandardRouteShell,
} from "../src/features/navigation/route-lifecycle.js";

test("syncStandardRouteShell updates tabs and renders without remount", () => {
  const calls = [];
  const host = {
    _syncTabsShell: () => calls.push(["syncTabsShell"]),
    _renderAll: () => calls.push(["renderAll"]),
  };

  syncStandardRouteShell(host);

  assert.deepEqual(calls, [
    ["syncTabsShell"],
    ["renderAll"],
  ]);
});

test("activateStandardPageRouteLifecycle avoids shell remount on non-startup route change", () => {
  const calls = [];
  const host = {
    _pageId: "mobile-view",
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
