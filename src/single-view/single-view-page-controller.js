export class SingleViewPageController {
  constructor(host, constants) {
    this._host = host;
    this._constants = constants;
  }

  activateStandardPageRoute(context = {}) {
    const PAGE_IDS = this._constants.PAGE_IDS;
    const leavingPreview = context.previousPageId === PAGE_IDS.preview;

    if (leavingPreview) {
      this._host._stopPreviewMode();
      if (this._host._$("#myPopup")?.classList.contains("is-open")) {
        this._host._closePopup();
      }
      this._host._cancelPendingMount(`page-route-${this._host._pageId}`);
    }

    this._host._applyPreviewShellVisibility();
    this._host._applyCardStyle();
    this._host._applyLayoutMode();
    if (this._host._isWideViewPageActive()) this._host._syncColHeight();

    if (context.startup === true) {
      if (context.startInGrid === true) {
        this._host._setViewMode("grid");
      } else {
        this._host._mountEngine();
      }
      return;
    }

    if (context.deferCameraSwitch === true) return;

    if (leavingPreview) {
      this._host._mountEngine(null, { quiet: true });
    }

    this._host._syncTabsShell();
    this._host._renderAll();
  }
}
