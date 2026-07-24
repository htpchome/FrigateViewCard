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

  _syncStandardPageRouteShell() {
    this._host._syncTabsShell();
    this._host._renderAll();
  }
}
