import { GRID_ROTATION_OPTIONS_SECONDS } from "../../constants.js";
import { DEVICE_PROFILE } from "../../helpers.js";

export class GridPageController {
  constructor(host) {
    this._host = host;
  }

  isGridModeAvailable() {
    return (
      this._host._config?.grid_mode_enabled === true &&
      !DEVICE_PROFILE.isPhone &&
      !this._host._isMobilePhoneViewport() &&
      Array.isArray(this._host._config?.cameras) &&
      this._host._config.cameras.length > 1
    );
  }

  gridRotationMs() {
    const seconds = Number(this._host._config?.grid_rotation_seconds);
    return GRID_ROTATION_OPTIONS_SECONDS.includes(seconds)
      ? seconds * 1000
      : 30000;
  }

  clearGridTimers() {
    if (this._host._gridRotationT) clearTimeout(this._host._gridRotationT);
    if (this._host._gridAlertReturnT)
      clearTimeout(this._host._gridAlertReturnT);
    if (this._host._gridRefreshT) clearTimeout(this._host._gridRefreshT);
    this._host._gridRotationT = null;
    this._host._gridAlertReturnT = null;
    this._host._gridRefreshT = null;
    this._host._gridAlertController.clearTimers();
    this._host._clearSnapshotRefreshTimer?.();
  }

  clearGridAlertTracking() {
    this._host._gridAlertController.clearAlertTracking();
    this._host._gridLastRenderSignature = "";
  }

  scheduleGridRefresh(delayMs = 80) {
    if (this._host._gridRefreshT) clearTimeout(this._host._gridRefreshT);
    if (this._host._viewMode !== "grid") return;
    this._host._gridRefreshT = setTimeout(
      () => {
        this._host._gridRefreshT = null;
        if (this._host._viewMode !== "grid") return;
        this._host._mountEngine(null, { quiet: true });
      },
      Math.max(0, Number(delayMs) || 0),
    );
  }

  shouldStartInGridMode() {
    return (
      this._host._config?.grid_start_in_grid_enabled === true &&
      this.isGridModeAvailable()
    );
  }

  applyStartInGridMode(_source = "") {
    if (this._host._isPreviewPageActive()) return;
    if (!this.shouldStartInGridMode()) return;
    if (this._host._viewMode === "grid") return;
    if (this._host._toolbarButtonStates?.().gridDisabled) return;
    this._host._gridRotationStart = 0;
    this._host._setViewMode("grid");
  }

  scheduleGridRotation() {
    if (!this.isGridModeAvailable()) return;
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
    }, this.gridRotationMs());
  }

  advanceGridRotation() {
    if (!this.isGridModeAvailable()) return;
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

  focusGridPageForCamera(entity) {
    if (!this.isGridModeAvailable()) return false;
    const idx = this._host._cameraIndexByEntity(entity);
    if (idx < 0) return false;
    const total = this._host._config?.cameras?.length || 0;
    if (total <= 0) return false;
    const maxStart = Math.max(0, (Math.ceil(total / 4) - 1) * 4);
    const nextStart = Math.min(maxStart, Math.floor(idx / 4) * 4);
    const currentStart = Math.min(
      maxStart,
      Math.max(
        0,
        Math.floor((Number(this._host._gridRotationStart) || 0) / 4) * 4,
      ),
    );
    if (nextStart === currentStart) return false;
    this._host._gridRotationStart = nextStart;
    this._host._gridPinnedRotationStart = nextStart;
    this.scheduleGridRotation();
    return true;
  }

  stopGridModeState() {
    this.clearGridTimers();
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
    if (this._host._toolbarButtonStates?.().gridDisabled) {
      this._host._syncToolbarButtons?.();
      return;
    }
    this._host._gridRotationStart = 0;
    this._host._gridPinnedRotationStart = 0;
    this.clearGridAlertTracking();
    this._host._setViewMode("grid");
  }
}
