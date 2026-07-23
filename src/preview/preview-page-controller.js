export class PreviewPageController {
  constructor(host, constants) {
    this._host = host;
    this._constants = constants;
  }

  activatePreviewPageRoute(context = {}) {
    const PAGE_IDS = this._constants.PAGE_IDS;
    if (context.previousPageId !== PAGE_IDS.preview) {
      if (this._host._$("#myPopup")?.classList.contains("is-open")) {
        this._host._closePopup();
      }
      this._host._cancelPendingMount("page-route-preview");
    }
    this._host._applyPreviewShellVisibility();
    this._host._applyCardStyle();
    this._host._applyLayoutMode();
    this.startPreviewMode();
  }

  startPreviewMode() {
    this._host._previewAlertController.start();
  }

  stopPreviewMode() {
    this._host._clearPreviewTimers();
    this._host._teardownPreviewMedia();
  }

  exitPreviewPageToCamera(idx) {
    if (!this._host._isPreviewPageActive()) return;
    if (
      !Number.isInteger(idx) ||
      idx < 0 ||
      idx >= (this._host._config?.cameras?.length || 0)
    ) {
      return;
    }

    const PAGE_IDS = this._constants.PAGE_IDS;
    const targetPageId = this._host._isPageRouteAvailable(
      this._host._lastNonPreviewPageId,
    )
      ? this._host._lastNonPreviewPageId
      : PAGE_IDS.singleView;

    this._host._navigateToPageRoute(targetPageId, {
      source: "preview-camera-select",
      deferCameraSwitch: true,
    });

    if (this._host._activeCamIdx === idx) this._host._activeCamIdx = -1;
    void this._host._switchCamera(idx, { source: "manual" });
  }

  returnToPreviewPage() {
    const PAGE_IDS = this._constants.PAGE_IDS;
    if (
      !this._host._isPreviewPageEnabled() ||
      this._host._isPreviewPageActive()
    ) {
      return;
    }
    this._host._navigateToPageRoute(PAGE_IDS.preview, {
      source: "preview-page-return",
    });
  }
}
