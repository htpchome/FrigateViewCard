export class SingleViewPageController {
  constructor(host, constants) {
    this._host = host;
    this._constants = constants;
  }

  activateSingleViewPageRoute(context = {}) {
    this.activateStandardPageRoute(context);
  }

  activateWideViewPageRoute(context = {}) {
    this.activateStandardPageRoute(context);
  }

  activateStandardPageRoute(context = {}) {
    const leavingPreview = this._isLeavingPreviewPage(context);

    this._handlePreviewExit(leavingPreview);
    this._applyStandardPageRouteFrame();

    if (context.startup === true) {
      this._activateStartupRoute(context);
      return;
    }

    if (context.deferCameraSwitch === true) return;

    if (leavingPreview) this._mountEngineQuietly();

    this._syncStandardPageRouteShell();
  }

  _isLeavingPreviewPage(context) {
    return context.previousPageId === this._constants.PAGE_IDS.preview;
  }

  _handlePreviewExit(leavingPreview) {
    if (!leavingPreview) return;

    this._host._stopPreviewMode();
    if (this._host._$("#myPopup")?.classList.contains("is-open")) {
      this._host._closePopup();
    }
    this._host._cancelPendingMount(`page-route-${this._host._pageId}`);
  }

  _applyStandardPageRouteFrame() {
    this._host._applyPreviewShellVisibility();
    this.applyStyleLayoutForCurrentRoute();
  }

  applyStyleLayoutForCurrentRoute() {
    this._host._applyCardStyle();
    this._host._applyLayoutMode();
    this.syncColHeightIfWideView();
  }

  syncColHeightIfWideView() {
    if (!this.isWideViewPageActive()) return;
    this._host._syncColHeight();
  }

  isWideViewPageActive() {
    return this._host._pageId === this._constants.PAGE_IDS.wideView;
  }

  wideViewLayoutState(leftWidthPct) {
    if (!this.isWideViewPageActive()) {
      return { isWide: false, leftWidth: "", rightWidth: "" };
    }

    const pct = Math.min(Math.max(parseInt(leftWidthPct, 10) || 50, 10), 90);
    return {
      isWide: true,
      leftWidth: `${pct}%`,
      rightWidth: `${100 - pct}%`,
    };
  }

  _activateStartupRoute(context) {
    if (context.startInGrid === true) {
      this._host._setViewMode("grid");
      return;
    }

    this._host._mountEngine();
  }

  _mountEngineQuietly() {
    this._host._mountEngine(null, { quiet: true });
  }

  mountEngineQuietly() {
    this._mountEngineQuietly();
  }

  mountEngineQuietlyAndRenderAll() {
    this._mountEngineQuietly();
    this._host._renderAll();
  }

  applyPostShellRerenderRouteBehavior({
    activePageInvalid = false,
    previewPageActive = false,
  } = {}) {
    if (activePageInvalid) {
      this._host._navigateToConfiguredLandingPage({
        source: "config-page-fallback",
      });
      return;
    }

    if (previewPageActive) {
      this._host._startPreviewMode();
      return;
    }

    this.mountEngineQuietlyAndRenderAll();
  }

  _syncStandardPageRouteShell() {
    this._host._syncTabsShell();
    this._host._renderAll();
  }

  applyNonPreviewSchemaSoftUpdate() {
    this.applyStyleLayoutForCurrentRoute();
    this._host._syncStatus();
    this._host._renderSubtitle();
    this._host._renderStats();
    this._host._renderCamSwitcher();
    this._host._syncToolbarButtons();
    this._host._syncPageNavigationButtons();
  }

  applyNonPreviewConfigUpdateTail({
    needsEngineRemount = false,
    realtimePollChanged = false,
  } = {}) {
    this.applyNonPreviewSchemaSoftUpdate();

    if (needsEngineRemount) {
      this.mountEngineQuietly();
    }
    if (realtimePollChanged) {
      this._host._restartRealtimeHeadPollTimer();
    }
  }

  applyNonPreviewHassUpdate({
    cameraStateChanged = false,
    themeChanged = false,
  } = {}) {
    if (cameraStateChanged) {
      this._host._syncStatus();
      this._host._kickLiveIfStale();
    }
    if (themeChanged) {
      this._host._applyCardStyle();
    }
  }
}
