export function isLeavingPreviewPage(context = {}, previewPageId) {
  return context.previousPageId === previewPageId;
}

export function handlePreviewExit(host, leavingPreview) {
  if (!leavingPreview) return;

  host._stopPreviewMode();
  if (host._$("#myPopup")?.classList.contains("is-open")) {
    host._closePopup();
  }
  host._cancelPendingMount(`page-route-${host._pageId}`);
}

export function activateStartupRoute(host, context = {}) {
  if (context.startInGrid === true) {
    host._setViewMode("grid");
    return;
  }

  host._mountEngine();
}

export function mountEngineQuietly(host) {
  host._mountEngine(null, { quiet: true });
}

export function syncStandardRouteShell(host) {
  host._syncTabsShell();
  host._renderAll();
}

export function activateStandardPageRouteLifecycle({
  host,
  context = {},
  previewPageId,
  applyRouteFrame,
} = {}) {
  const leavingPreview = isLeavingPreviewPage(context, previewPageId);

  handlePreviewExit(host, leavingPreview);
  applyRouteFrame?.();

  if (context.startup === true) {
    activateStartupRoute(host, context);
    return;
  }

  if (context.deferCameraSwitch === true) return;

  if (leavingPreview) {
    mountEngineQuietly(host);
  }

  syncStandardRouteShell(host);
}
