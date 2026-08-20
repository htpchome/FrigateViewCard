import { cap, camDisplayName, DEVICE_PROFILE } from "../../helpers.js";
import { buildHaCameraStreamState } from "../../integrations/home-assistant/playback.js";
import { WideViewCompanionAlertController } from "./companion-alert.ctrl.js";
import {
  buildWideCompanionCellMarkup,
  buildWideCompanionMetaMarkup,
  buildWideCompanionRegionMarkup,
  buildWideCompanionStatusMarkup,
} from "./companion.tmpl.js";

const LIVE_STREAM_HINTS = new Set(["webrtc", "mse", "hls"]);
const COMPANION_GRID_GAP_PX = 10;
const COMPANION_META_HEIGHT_PX = 48;
const COMPANION_PREFERRED_WIDTH_PX = 160;
const COMPANION_MAX_WIDTH_PX = 260;

export function resolveWideCompanionColumnCount({
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
  if (availableWidth <= 0) return 1;

  const widthBasedColumns = Math.min(
    count,
    Math.max(
      1,
      Math.floor(
        (availableWidth + COMPANION_GRID_GAP_PX) /
          (COMPANION_PREFERRED_WIDTH_PX + COMPANION_GRID_GAP_PX),
      ),
    ),
  );
  if (availableHeight <= 0) return widthBasedColumns;

  for (let columns = widthBasedColumns; columns <= count; columns += 1) {
    const totalGapWidth = COMPANION_GRID_GAP_PX * (columns - 1);
    const cellWidth = Math.min(
      COMPANION_MAX_WIDTH_PX,
      Math.max(0, (availableWidth - totalGapWidth) / columns),
    );
    const rows = Math.ceil(count / columns);
    const rowHeight = cellWidth * (9 / 16) + resolvedMetaHeight;
    const requiredHeight =
      rows * rowHeight + COMPANION_GRID_GAP_PX * (rows - 1);
    if (requiredHeight <= availableHeight) return columns;
  }

  return count;
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
    this._host._syncToolbarButtons?.();
  }

  toggleAlertTakeover() {
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

  eventsCount(entity) {
    const cache = this._host._camCache[entity];
    const eventsCount = Array.isArray(cache?.events) ? cache.events.length : 0;
    const reviewsCount = Array.isArray(cache?.reviews)
      ? cache.reviews.length
      : 0;
    return eventsCount + reviewsCount;
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

  streamSourceLabel(entity, useLive) {
    if (!useLive) return "Snapshot";
    if (this._host._cameraConnectionType(entity) === "ha_direct") {
      return "HA Live";
    }
    return `${this.liveStreamHint().toUpperCase()} Live`;
  }

  updateLayout() {
    if (!this.isActive()) return;
    const grid = this._host._$("#wide-companion-grid");
    if (!grid) return;
    const cameraCount = this._host._config?.cameras?.length || 0;
    const metadataHeight =
      grid.querySelector?.(".wide-companion-meta")?.offsetHeight ||
      COMPANION_META_HEIGHT_PX;
    const columns = resolveWideCompanionColumnCount({
      cameraCount,
      width: grid.clientWidth,
      height: grid.clientHeight,
      metadataHeight,
    });
    grid.style?.setProperty?.(
      "--wide-companion-columns",
      String(columns),
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
    const cameras = Array.isArray(this._host._config?.cameras)
      ? this._host._config.cameras
      : [];
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
          index,
          entity,
          severity: this.cellSeverity(entity),
          useLive,
          metaMarkup: buildWideCompanionMetaMarkup({
            name: cap(camDisplayName(camera)),
            online,
            sourceLabel: this.streamSourceLabel(entity, useLive),
            eventsCount: this.eventsCount(entity),
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
        const index = Number(cell.dataset.wideCompanionCamidx);
        const camera = this._host._config?.cameras?.[index];
        const entity = camera?.entity || "";
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
        const useLive = this.shouldUseLive(entity);
        const status = cell.querySelector?.(".wide-companion-meta-status");
        if (status) status.innerHTML = buildWideCompanionStatusMarkup(online);
        const source = cell.querySelector?.(".wide-companion-meta-source");
        if (source) {
          source.textContent = `Stream Source: ${this.streamSourceLabel(entity, useLive)}`;
        }
        const events = cell.querySelector?.(".wide-companion-meta-events");
        if (events) {
          events.textContent = `Events: ${this.eventsCount(entity)}`;
        }
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
      });
    });
  }

  start() {
    if (!this.isActive()) return;
    this._alertController.start();
    this.render();
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
