import { test } from "node:test";
import assert from "node:assert/strict";

import {
  activateStandardPageRouteLifecycle,
  syncStandardRouteShell,
} from "../src/features/navigation/route-lifecycle.js";

test("syncStandardRouteShell rebuilds shell and remounts engine quietly", () => {
  const calls = [];
  const host = {
    _cleanupEngine: () => calls.push(["cleanup"]),
    _renderShell: () => calls.push(["renderShell"]),
    _mountEngine: (...args) => calls.push(["mountEngine", ...args]),
    _renderAll: () => calls.push(["renderAll"]),
  };

  syncStandardRouteShell(host);

  assert.deepEqual(calls, [
    ["cleanup"],
    ["renderShell"],
    ["mountEngine", null, { quiet: true }],
    ["renderAll"],
  ]);
});

test("activateStandardPageRouteLifecycle rebuilds shell on non-startup route change", () => {
  const calls = [];
  const host = {
    _pageId: "mobile-view",
    _cleanupEngine: () => calls.push(["cleanup"]),
    _renderShell: () => calls.push(["renderShell"]),
    _mountEngine: (...args) => calls.push(["mountEngine", ...args]),
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
    ["cleanup"],
    ["renderShell"],
    ["mountEngine", null, { quiet: true }],
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
