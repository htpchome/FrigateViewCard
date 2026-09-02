import { cap, camDisplayName, DEVICE_PROFILE } from "../../helpers.js";
import { buildHaCameraStreamState } from "../../integrations/home-assistant/playback.js";
import { WideViewCompanionAlertController } from "./companion-alert.ctrl.js";
import {
  buildWideCompanionCellMarkup,
  buildWideCompanionMetaMarkup,
  buildWideCompanionRegionMarkup,
  buildWideCompanionStatusMarkup,
} from "./companion.tmpl.js";
import { flattenCameraMembers } from "../camera-groups/model.js";

const LIVE_STREAM_HINTS = new Set(["webrtc", "mse", "hls"]);
const COMPANION_GRID_GAP_PX = 8;
const COMPANION_META_HEIGHT_PX = 24;

export function resolveWideCompanionGridLayout({
  cameraCount,
  width,
  height,
  metadataHeight = COMPANION_META_HEIGHT_PX,
} = {}) {
  const count = Math.max(1, Math.floor(Number(cameraCount) || 0));
  const availableWidth = Math.max(0, Number(width) || 0);
  const availableHeight = Math.max(0, Number(height) || 0);
  const resolvedMetaHeight = Math.max(
    0,
    Number(metadataHeight) || COMPANION_META_HEIGHT_PX,
  );
  if (availableWidth <= 0) return { columns: 1, cellWidth: 0 };

  const candidates = [];
  for (let columns = 1; columns <= count; columns += 1) {
    const totalGapWidth = COMPANION_GRID_GAP_PX * (columns - 1);
    const cellWidth = Math.max(
      0,
      (availableWidth - totalGapWidth) / columns,
    );
    const rows = Math.ceil(count / columns);
    const totalGapHeight = COMPANION_GRID_GAP_PX * (rows - 1);
    const rowHeight = cellWidth * (9 / 16) + resolvedMetaHeight;
    candidates.push({
      columns,
      cellWidth,
      totalHeight: rowHeight * rows + totalGapHeight,
    });
  }

  const bestLayout =
    (availableHeight > 0
      ? candidates.find(
          ({ totalHeight }) => totalHeight <= availableHeight + 0.5,
        )
      : candidates[0]) ||
    candidates.reduce((best, candidate) => {
      if (!best || candidate.totalHeight < best.totalHeight - 0.5) {
        return candidate;
      }
      if (
        Math.abs(candidate.totalHeight - best.totalHeight) <= 0.5 &&
        candidate.cellWidth > best.cellWidth
      ) {
        return candidate;
      }
      return best;
    }, null);

  return {
    columns: bestLayout.columns,
    cellWidth: Math.floor(Math.max(1, bestLayout.cellWidth) * 10) / 10,
  };
}

export class WideViewCompanionController {
  constructor(host, constants) {
    this._host = host;
    this._constants = constants;
    this._mediaState = null;
    this._lastRenderSignature = "";
    this._alertTakeoverEnabled = null;
    this._alertController = new WideViewCompanionAlertController(
      host,
      constants,
      {
        isActive: () => this.isActive(),
        onStateChange: (detail) => this._handleAlertStateChange(detail),
      },
    );
  }

  isActive() {
    return this._host._pageId === this._constants.PAGE_IDS.wideView;
  }

  buildRegionMarkup() {
    return buildWideCompanionRegionMarkup();
  }

  liveCamerasEnabled() {
    return this._host._config?.wide_view_live_cameras === true;
  }

  alertTakeoverEnabled() {
    if (typeof this._alertTakeoverEnabled === "boolean") {
      return this._alertTakeoverEnabled;
    }
    return this._host._config?.wide_view_alert_takeover === true;
  }

  resetAlertTakeoverDefault() {
    this._alertTakeoverEnabled = null;
    if (
      this.alertTakeoverEnabled() &&
      this._host._toolbarButtonStates?.().wideAlertTakeoverDisabled
    ) {
      this._alertTakeoverEnabled = false;
    }
    this._host._syncToolbarButtons?.();
  }

  toggleAlertTakeover() {
    if (
      !this.alertTakeoverEnabled() &&
      this._host._toolbarButtonStates?.().wideAlertTakeoverDisabled
    ) {
      this._host._syncToolbarButtons?.();
      return false;
    }
    this._alertTakeoverEnabled = !this.alertTakeoverEnabled();
    this._host._syncToolbarButtons?.();
    return this._alertTakeoverEnabled;
  }

  shouldUseLive(entity) {
    return (
      this.liveCamerasEnabled() ||
      this._alertController.isCameraAlertLive(entity)
    );
  }

  cellSeverity(entity) {
    return this._alertController.cellSeverity(entity);
  }

  liveStreamHint() {
    const active = String(this._host._activeStreamType || "")
      .trim()
      .toLowerCase();
    if (LIVE_STREAM_HINTS.has(active)) return active;
    const previous = String(this._host._lastLiveStreamHint || "")
      .trim()
      .toLowerCase();
    if (LIVE_STREAM_HINTS.has(previous)) return previous;
    return DEVICE_PROFILE.isIOS ? "webrtc" : "mse";
  }

  updateLayout() {
    if (!this.isActive()) return;
    const grid = this._host._$("#wide-companion-grid");
    if (!grid) return;
    const cameraCount = flattenCameraMembers(
      this._host._config?.cameras,
    ).length;
    const metadataHeight =
      grid.querySelector?.(".wide-companion-meta")?.offsetHeight ||
      COMPANION_META_HEIGHT_PX;
    const layout = resolveWideCompanionGridLayout({
      cameraCount,
      width: grid.clientWidth,
      height: grid.clientHeight,
      metadataHeight,
    });
    grid.style?.setProperty?.(
      "--wide-companion-columns",
      String(layout.columns),
    );
  }

  teardownMedia() {
    if (this._mediaState) {
      this._mediaState.destroyed = true;
      for (const cleanup of this._mediaState.cleanup || []) {
        try {
          cleanup();
        } catch (_) {}
      }
    }
    this._mediaState = null;
    this._lastRenderSignature = "";
    this._host.shadowRoot
      ?.querySelectorAll?.(".wide-companion-media-host")
      ?.forEach((mediaHost) => {
        mediaHost.querySelectorAll?.("video")?.forEach((video) => {
          try {
            video.pause();
            video.removeAttribute("src");
            video.load();
          } catch (_) {}
        });
        mediaHost
          .querySelectorAll?.("img[data-fvc-blob-url]")
          ?.forEach((img) => {
            const blobUrl = img.dataset.fvcBlobUrl || "";
            if (!blobUrl) return;
            try {
              URL.revokeObjectURL(blobUrl);
            } catch (_) {}
          });
        mediaHost.innerHTML = "";
      });
  }

  render() {
    if (!this.isActive()) {
      this.teardownMedia();
      this._host._syncSnapshotRefreshTimer?.();
      return;
    }
    const grid = this._host._$("#wide-companion-grid");
    if (!grid) return;
    const cameras = flattenCameraMembers(this._host._config?.cameras);
    const liveStreamHint = this.liveStreamHint();
    const hassReady = !!this._host._hass?.states;
    const nextSignature = cameras
      .map((camera, index) => {
        const entity = camera?.entity || "";
        const useLive = this.shouldUseLive(entity);
        return `${index}:${entity}:${useLive ? `live:${liveStreamHint}` : "snap"}`;
      })
      .concat(`hass:${hassReady ? "1" : "0"}`)
      .join("|");

    if (
      grid.firstElementChild &&
      this._lastRenderSignature === nextSignature
    ) {
      this.updateMeta();
      this._host._syncSnapshotRefreshTimer?.();
      this._host._wideViewPageController?.syncColHeightIfWideView?.();
      return;
    }

    this.teardownMedia();
    this._lastRenderSignature = nextSignature;
    grid.innerHTML = cameras
      .map((camera, index) => {
        const entity = camera?.entity || "";
        const online =
          this._host._hass?.states?.[entity]?.state !== "unavailable";
        const useLive = this.shouldUseLive(entity);
        return buildWideCompanionCellMarkup({
          index: camera.logical_camera_index ?? index,
          entity,
          severity: this.cellSeverity(entity),
          useLive,
          metaMarkup: buildWideCompanionMetaMarkup({
            name: cap(camDisplayName(camera)),
            online,
          }),
        });
      })
      .join("");
    this.mountMedia();
    this._host._syncSnapshotRefreshTimer?.();
    this._host._wideViewPageController?.syncColHeightIfWideView?.();
  }

  updateMeta() {
    this._host.shadowRoot
      ?.querySelectorAll?.("[data-wide-companion-camidx]")
      ?.forEach((cell) => {
        const entity =
          cell.querySelector?.(".wide-companion-media-host")?.dataset
            ?.wideCompanionMediaEntity || "";
        if (!entity) return;
        const severity = this.cellSeverity(entity);
        const mediaHost = cell.querySelector?.(
          ".wide-companion-media-host",
        );
        if (mediaHost) {
          mediaHost.classList.remove("grid-alert", "grid-detection");
          if (severity === "alert") mediaHost.classList.add("grid-alert");
          if (severity === "detection") {
            mediaHost.classList.add("grid-detection");
          }
        }
        const online =
          this._host._hass?.states?.[entity]?.state !== "unavailable";
        const status = cell.querySelector?.(".wide-companion-meta-status");
        if (status) status.innerHTML = buildWideCompanionStatusMarkup(online);
      });
  }

  mountMedia() {
    if (!this.isActive()) return;
    const mediaHosts =
      this._host.shadowRoot?.querySelectorAll?.(
        ".wide-companion-media-host",
      ) || [];
    if (!this._host._hass?.states) {
      mediaHosts.forEach((mediaHost) => {
        mediaHost.innerHTML = `<div class="ph">${this._constants.ICONS.live}<span>Loading…</span></div>`;
      });
      return;
    }
    const liveStreamHint = this.liveStreamHint();
    const mediaState = { destroyed: false, cleanup: [] };
    this._mediaState = mediaState;
    mediaHosts.forEach((mediaHost) => {
      const entity = mediaHost.dataset.wideCompanionMediaEntity || "";
      const useLive = mediaHost.dataset.wideCompanionUseLive === "1";
      const stateObj = entity
        ? buildHaCameraStreamState(
            this._host._hass,
            entity,
            liveStreamHint,
            this._host._preferredStreamType(),
          ) ||
          this._host._hass?.states?.[entity] ||
          null
        : null;
      mediaHost.innerHTML = "";
      if (!entity) {
        mediaHost.innerHTML = `<div class="ph">${this._constants.ICONS.live}<span>Unavailable</span></div>`;
        return;
      }
      this._host._gridMediaController.mountCameraCellMedia(mediaHost, {
        entity,
        stateObj,
        useLive,
        liveStreamHint,
        gridState: mediaState,
        fallbackOnLiveError: true,
        prioritizeSnapshot: true,
      });
    });
  }

  start() {
    if (!this.isActive()) return;
    if (
      this.alertTakeoverEnabled() &&
      this._host._toolbarButtonStates?.().wideAlertTakeoverDisabled
    ) {
      this._alertTakeoverEnabled = false;
      this._host._syncToolbarButtons?.();
    }
    this._alertController.start();
    this.render();
  }

  resumeVisible() {
    if (!this.isActive()) return;
    this.render();
    if (!this.liveCamerasEnabled()) {
      void this._host._refreshSnapshotMedia?.();
    }
  }

  stop() {
    this._alertController.stop();
    this.teardownMedia();
    this._host._clearSnapshotRefreshTimer?.();
  }

  handleRealtimeMessage(msg) {
    this._alertController.handleRealtimeMessage(msg);
  }

  handleHaReviewStatus(entity, severity) {
    return this._alertController.markAlertCamera(
      entity,
      severity,
      this._host._previewAlertHoldMs?.(),
    );
  }

  handleHassUpdate() {
    if (!this.isActive()) return;
    this.render();
    this._alertController.scheduleAlertWatch(120);
    void this._alertController.probeLatestAlert();
  }

  applyConfigUpdate({ takeoverDefaultChanged = false } = {}) {
    if (takeoverDefaultChanged) this.resetAlertTakeoverDefault();
    if (this.isActive()) this.render();
  }

  selectCamera(index) {
    if (!this.isActive()) return;
    if (
      !Number.isInteger(index) ||
      index < 0 ||
      index >= (this._host._config?.cameras?.length || 0)
    ) {
      return;
    }
    this._host._pauseSlideshowForInteraction?.();
    void this._host._switchCamera(index, {
      source: "manual",
      origin: "wide-companion-camera-select",
    });
  }

  _handleAlertStateChange(detail = {}) {
    if (!this.isActive()) return;
    this.render();
    if (detail.changed !== true || detail.allowTakeover === false) return;
    if (!this.alertTakeoverEnabled()) return;
    this._takeOverMainCamera(detail.entity);
  }

  _takeOverMainCamera(entity) {
    const index = this._host._cameraIndexByEntity(entity);
    if (index < 0) return;
    if (
      index === this._host._activeCamIdx &&
      this._host._viewMode === "single"
    ) {
      return;
    }
    this._host._stopSlideshowRotation?.("wide-companion-alert", false);
    void this._host._switchCamera(index, {
      source: "alert",
      origin: "wide-companion-alert",
    });
  }
}
