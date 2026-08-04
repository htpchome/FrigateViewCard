export class GridPageController {
  constructor(host) {
    this._host = host;
  }

  shouldStartInGridMode() {
    return (
      this._host._config?.grid_start_in_grid_enabled === true &&
      this._host._isGridModeAvailable()
    );
  }

  applyStartInGridMode(_source = "") {
    if (this._host._isPreviewPageActive()) return;
    if (!this.shouldStartInGridMode()) return;
    if (this._host._viewMode === "grid") return;
    this._host._gridRotationStart = 0;
    this._host._setViewMode("grid");
  }

  scheduleGridRotation() {
    if (!this._host._isGridModeAvailable()) return;
    if (this._host._viewMode !== "grid") return;
    if ((this._host._config?.cameras?.length || 0) <= 4) {
      if (this._host._gridRotationT) clearTimeout(this._host._gridRotationT);
      this._host._gridRotationT = null;
      return;
    }
    if (this._host._gridRotationT) clearTimeout(this._host._gridRotationT);
    this._host._gridRotationT = setTimeout(() => {
      this._host._gridRotationT = null;
      this.advanceGridRotation();
    }, this._host._gridRotationMs());
  }

  advanceGridRotation() {
    if (!this._host._isGridModeAvailable()) return;
    if (this._host._viewMode !== "grid") return;
    const total = this._host._config?.cameras?.length || 0;
    if (total <= 4) {
      this._host._gridRotationStart = 0;
      this.scheduleGridRotation();
      return;
    }
    const totalPages = Math.max(1, Math.ceil(total / 4));
    const currentPage = Math.min(
      totalPages - 1,
      Math.max(0, Math.floor((Number(this._host._gridRotationStart) || 0) / 4)),
    );
    const nextPage = (currentPage + 1) % totalPages;
    this._host._gridRotationStart = nextPage * 4;
    this._host._mountEngine(null, { quiet: true });
    this.scheduleGridRotation();
  }

  stopGridModeState() {
    this._host._clearGridTimers();
    this._host._gridResumePending = false;
    this._host._gridPinnedRotationStart = Math.max(
      0,
      Number(this._host._gridRotationStart) || 0,
    );
    this._host._gridAlertController.stopSession();
    this._host._gridLastRenderSignature = "";
    this._host._setSlideshowAlertState("");
  }

  toggleGridMode() {
    if (this._host._isPreviewPageActive()) return;
    if (this._host._viewMode === "grid" || this._host._gridResumePending) {
      this._host._gridResumePending = false;
      this.stopGridModeState();
      if (this._host._viewMode === "grid") {
        this._host._setViewMode("single");
      } else {
        this._host._syncToolbarButtons();
      }
      return;
    }
    this._host._gridRotationStart = 0;
    this._host._gridPinnedRotationStart = 0;
    this._host._clearGridAlertTracking();
    this._host._setViewMode("grid");
  }
}
