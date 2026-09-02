import { GRID_ROTATION_OPTIONS_SECONDS } from "../../constants.js";
import { DEVICE_PROFILE } from "../../helpers.js";
import { resolveGridCameras } from "./config.js";

export class GridPageController {
  constructor(host) {
    this._host = host;
    this._returnLiveStreamType = "";
    this._hasReturnLiveTarget = false;
  }

  _displayCameras() {
    return resolveGridCameras(
      this._host._config?.cameras,
      this._host._config?.grid_order,
    );
  }

  prepareLiveForGrid() {
    const activeStreamType = String(this._host._activeStreamType || "--");
    const normalizedStreamType = activeStreamType.toLowerCase();
    if (normalizedStreamType !== "grid") {
      this._returnLiveStreamType = activeStreamType;
    }
    this._hasReturnLiveTarget =
      Boolean(this._host._engine) ||
      ["webrtc", "mse", "hls"].includes(normalizedStreamType);
  }

  captureBackgroundLiveStreamType(type) {
    if (this._host._viewMode !== "grid") return false;
    const activeStreamType = String(type || "--");
    if (activeStreamType.toLowerCase() === "grid") return false;
    this._returnLiveStreamType = activeStreamType;
    this._hasReturnLiveTarget = ["webrtc", "mse", "hls"].includes(
      activeStreamType.toLowerCase(),
    );
    return true;
  }

  takeColdStartLiveHandoff() {
    if (this._hasReturnLiveTarget || this._host._engine) return null;
    const firstEntity = String(this._displayCameras()[0]?.entity || "").trim();
    if (!firstEntity) return null;
    return (
      this._host._gridMediaController?.takeGridLiveHandoff?.(firstEntity) ||
      null
    );
  }

  restoreLiveAfterGrid() {
    const hasReturnLiveTarget =
      this._hasReturnLiveTarget || Boolean(this._host._engine);
    const activeStreamType =
      this._returnLiveStreamType || this._host._lastLiveStreamHint || "--";
    this._returnLiveStreamType = "";
    this._hasReturnLiveTarget = false;
    if (!hasReturnLiveTarget) {
      const firstCamera = this._displayCameras()[0] || null;
      this._host._activeCamIdx = Math.max(
        0,
        Number(firstCamera?.logical_camera_index) || 0,
      );
      this._host._activeGroupMemberOverride =
        firstCamera?.group_member === "B"
          ? String(firstCamera?.entity || "")
          : "";
    }
    this._host._setActiveStreamType(activeStreamType);
    return hasReturnLiveTarget;
  }

  isGridModeAvailable() {
    return (
      this._host._config?.grid_mode_enabled === true &&
      !DEVICE_PROFILE.isPhone &&
      !this._host._isMobilePhoneViewport() &&
      this._displayCameras().length > 1
    );
  }

  gridRotationMs() {
    const seconds = Number(this._host._config?.grid_rotation_seconds);
    return GRID_ROTATION_OPTIONS_SECONDS.includes(seconds)
      ? seconds * 1000
      : 30000;
  }

  _pauseRotationInEditorPreview() {
    if (this._host._isEditorPreviewContext?.() !== true) return false;
    if (this._host._gridRotationT) clearTimeout(this._host._gridRotationT);
    this._host._gridRotationT = null;
    return true;
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
    if (this._pauseRotationInEditorPreview()) return;
    if (this._displayCameras().length <= 4) {
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
    if (this._pauseRotationInEditorPreview()) return;
    const total = this._displayCameras().length;
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
    const idx = this._displayCameras().findIndex(
      (camera) => camera?.entity === entity,
    );
    if (idx < 0) return false;
    const total = this._displayCameras().length;
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
    this._host._gridMediaController?.teardownGridEngine?.();
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
    if (this._host._viewMode === "grid") {
      this._host._gridResumePending = false;
      this._host._setViewMode("single");
      return;
    }
    if (this._host._gridResumePending) {
      this._host._gridResumePending = false;
      this.stopGridModeState();
      this._host._syncToolbarButtons();
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
