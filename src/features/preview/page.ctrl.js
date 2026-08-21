import {
  resolvePreviewLiveStreamHint,
  resolvePreviewStreamSourceLabel,
} from "./utils.js";
import {
  buildPreviewCameraButtonMarkup,
  buildPreviewCellMarkup,
  buildPreviewLayoutShellMarkup,
  buildPreviewMetaMarkup,
  buildPreviewShellHeaderMarkup,
  buildPreviewShellMarkup,
  buildPreviewStatusMarkup,
} from "./page.tmpl.js";
import { ICONS } from "../../icons.js";
import { cap, camDisplayName, DEVICE_PROFILE } from "../../helpers.js";
import { buildHaCameraStreamState } from "../../integrations/home-assistant/playback.js";

export class PreviewPageController {
  constructor(host, constants) {
    this._host = host;
    this._constants = constants;
  }

  _pageNavigation() {
    return this._host._pageNavigationController || null;
  }

  previewLiveCamerasEnabled() {
    return this._host._config?.preview_page_live_cameras === true;
  }

  isPreviewPageEnabled() {
    return this._host._config?.preview_page_enabled === true;
  }

  isPreviewPageActive() {
    return (
      this.isPreviewPageEnabled() &&
      this._host._pageId === this._constants.PAGE_IDS.preview
    );
  }

  previewShowTitleBarsEnabled() {
    return this._host._config?.preview_page_show_title_bars !== false;
  }

  previewShouldUseLive(entity) {
    return (
      this.previewLiveCamerasEnabled() ||
      this._host._isPreviewCameraAlertLive(entity)
    );
  }

  previewEventsCount(entity) {
    const cache = this._host._camCache[entity];
    const eventsCount = Array.isArray(cache?.events) ? cache.events.length : 0;
    const reviewsCount = Array.isArray(cache?.reviews)
      ? cache.reviews.length
      : 0;
    return eventsCount + reviewsCount;
  }

  previewCellSeverity(entity) {
    return this._host._previewAlertController.previewCellSeverity(entity);
  }

  _previewPageTitle() {
    return (
      this._host._config.title ||
      (this._host._config.cameras.length === 1
        ? cap(camDisplayName(this._host._config.cameras[0]))
        : "Cameras") ||
      "Camera"
    );
  }

  buildPreviewLayoutShellMarkup() {
    const previewShellHeader = buildPreviewShellHeaderMarkup({
      title: this._previewPageTitle(),
      subtitle: this._host._subtitleText(),
      pageNav:
        this._pageNavigation()?.pageNavMarkup?.() ||
        this._host._pageNavMarkup?.() ||
        "",
    });

    return buildPreviewLayoutShellMarkup({
      previewShellHeader,
      previewFooterIcon: ICONS.frigateView,
    });
  }

  ensurePreviewLayoutShell() {
    const existingShell = this._host._$("#preview-shell");
    if (existingShell) return existingShell;

    const layout = this._host._$("#layout");
    const leftColumn = this._host._$("#col-left");
    if (!layout || !leftColumn) return null;

    leftColumn.insertAdjacentHTML(
      "beforebegin",
      this.buildPreviewLayoutShellMarkup(),
    );
    this._host._domCache = {};
    return this._host._$("#preview-shell");
  }

  removePreviewLayoutShell() {
    let removed = false;
    ["#preview-shell-header", "#preview-shell", "#preview-shell-footer"]
      .map((selector) => this._host._$(selector))
      .forEach((el) => {
        if (!el) return;
        el.remove();
        removed = true;
      });

    if (removed) this._host._domCache = {};
  }

  applyPreviewShellVisibility() {
    const card = this._host._$("#card");
    if (!card) return;
    if (this.isPreviewPageEnabled() && this.isPreviewPageActive()) {
      this.ensurePreviewLayoutShell();
    } else {
      this.removePreviewLayoutShell();
    }
    card.classList.toggle("preview-active", this.isPreviewPageActive());
  }

  previewLiveStreamHint() {
    return resolvePreviewLiveStreamHint({
      activeStreamType: this._host._activeStreamType,
      lastLiveStreamHint: this._host._lastLiveStreamHint,
      isIOS: DEVICE_PROFILE.isIOS,
    });
  }

  previewStreamSourceLabel(entity, useLive) {
    return resolvePreviewStreamSourceLabel({
      useLive,
      connectionType: this._host._cameraConnectionType(entity),
      liveStreamHint: this.previewLiveStreamHint(),
    });
  }

  teardownPreviewMedia() {
    if (this._host._previewMediaState) {
      this._host._previewMediaState.destroyed = true;
      for (const cleanup of this._host._previewMediaState.cleanup || []) {
        try {
          cleanup();
        } catch (_) {}
      }
    }
    this._host._previewMediaState = null;
    this._host._previewLastRenderSignature = "";
    const hosts = this._host.shadowRoot.querySelectorAll(".preview-media-host");
    hosts.forEach((host) => {
      host.querySelectorAll("video").forEach((video) => {
        try {
          video.pause();
          video.removeAttribute("src");
          video.load();
        } catch (_) {}
      });
      host.querySelectorAll("img[data-fvc-blob-url]").forEach((img) => {
        const blobUrl = img.dataset.fvcBlobUrl || "";
        if (!blobUrl) return;
        try {
          URL.revokeObjectURL(blobUrl);
        } catch (_) {}
      });
      host.innerHTML = "";
    });
  }

  renderPreviewPage() {
    if (!this.isPreviewPageEnabled()) {
      this.teardownPreviewMedia();
      this.applyPreviewShellVisibility();
      this._host._syncSnapshotRefreshTimer?.();
      return;
    }
    if (!this.isPreviewPageActive()) {
      this.teardownPreviewMedia();
      this.applyPreviewShellVisibility();
      this._host._syncSnapshotRefreshTimer?.();
      return;
    }

    const shell = this.ensurePreviewLayoutShell();
    if (!shell) return;
    const titleEl = this._host._$("#preview-shell-title");
    const subtitleEl = this._host._$("#preview-shell-subtitle");
    if (titleEl) titleEl.textContent = this._previewPageTitle();
    if (subtitleEl) subtitleEl.textContent = this._host._subtitleText();

    const cameras = Array.isArray(this._host._config?.cameras)
      ? this._host._config.cameras.slice(0, 9)
      : [];
    const showTitleBars = this.previewShowTitleBarsEnabled();
    const liveStreamHint = this.previewLiveStreamHint();
    const hassReady = !!this._host._hass?.states;
    const nextSignature = cameras
      .map((camera, index) => {
        const entity = camera?.entity || "";
        const useLive = this.previewShouldUseLive(entity);
        return `${index}:${entity}:${useLive ? `live:${liveStreamHint}` : "snap"}`;
      })
      .concat([
        `titles:${showTitleBars ? "1" : "0"}`,
        `hass:${hassReady ? "1" : "0"}`,
      ])
      .join("|");
    if (
      shell.firstElementChild?.classList?.contains("preview-grid") &&
      this._host._previewLastRenderSignature === nextSignature
    ) {
      this.updatePreviewMeta();
      this.applyPreviewShellVisibility();
      this._host._syncSnapshotRefreshTimer?.();
      return;
    }
    this.teardownPreviewMedia();
    this._host._previewLastRenderSignature = nextSignature;

    const cellsMarkup = cameras
      .map((camera, index) => {
        const entity = camera?.entity || "";
        const entState = this._host._hass?.states?.[entity];
        const online = entState?.state !== "unavailable";
        const severity = this.previewCellSeverity(entity);
        const useLive = this.previewShouldUseLive(entity);
        const sourceLabel = this.previewStreamSourceLabel(entity, useLive);
        const eventsCount = this.previewEventsCount(entity);
        const name = cap(camDisplayName(camera));
        return buildPreviewCellMarkup({
          index,
          entity,
          severity,
          useLive,
          metaMarkup: buildPreviewMetaMarkup({
            showTitleBars,
            name,
            online,
            sourceLabel,
            eventsCount,
          }),
        });
      })
      .join("");

    const buttonsMarkup = cameras
      .map((camera, index) =>
        buildPreviewCameraButtonMarkup({
          index,
          name: cap(camDisplayName(camera)),
        }),
      )
      .join("");

    shell.innerHTML = buildPreviewShellMarkup({
      cellsMarkup,
      buttonsMarkup,
    });
    this.mountPreviewMedia();
    this.applyPreviewShellVisibility();
    this._host._syncSnapshotRefreshTimer?.();
  }

  updatePreviewMeta() {
    const showTitleBars = this.previewShowTitleBarsEnabled();
    this._host.shadowRoot
      .querySelectorAll("[data-preview-camidx]")
      .forEach((cell) => {
        const idx = Number(cell.dataset.previewCamidx);
        const camera = this._host._config?.cameras?.[idx];
        const entity = camera?.entity || "";
        if (!entity) return;
        const severity = this.previewCellSeverity(entity);
        const mediaHost = cell.querySelector(".preview-media-host");
        if (mediaHost) {
          mediaHost.classList.remove("grid-alert", "grid-detection");
          if (severity === "alert") mediaHost.classList.add("grid-alert");
          else if (severity === "detection") {
            mediaHost.classList.add("grid-detection");
          }
        }

        if (!showTitleBars) return;
        const online =
          this._host._hass?.states?.[entity]?.state !== "unavailable";
        const useLive = this.previewShouldUseLive(entity);
        const status = cell.querySelector(".preview-meta-status");
        if (status) {
          status.innerHTML = buildPreviewStatusMarkup(online);
        }
        const source = cell.querySelector(".preview-meta-source");
        if (source) {
          source.textContent = `Stream Source: ${this.previewStreamSourceLabel(entity, useLive)}`;
        }
        const events = cell.querySelector(".preview-meta-events");
        if (events) {
          events.textContent = `Events: ${this.previewEventsCount(entity)}`;
        }
      });
  }

  mountPreviewMedia() {
    if (!this.isPreviewPageActive()) return;
    const hosts = this._host.shadowRoot.querySelectorAll(".preview-media-host");
    if (!this._host._hass?.states) {
      hosts.forEach((host) => {
        host.innerHTML = `<div class="ph">${ICONS.live}<span>Loading…</span></div>`;
      });
      return;
    }
    const liveStreamHint = this.previewLiveStreamHint();
    const previewState = { destroyed: false, cleanup: [] };
    this._host._previewMediaState = previewState;
    hosts.forEach((host) => {
      const entity = host.dataset.previewMediaEntity || "";
      const useLive = host.dataset.previewUseLive === "1";
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
      host.innerHTML = "";
      if (!entity) {
        host.innerHTML = `<div class="ph">${ICONS.live}<span>Unavailable</span></div>`;
        return;
      }
      this._host._gridMediaController.mountCameraCellMedia(host, {
        entity,
        stateObj,
        useLive,
        liveStreamHint,
        gridState: previewState,
        fallbackOnLiveError: true,
      });
    });
    this._host._syncSnapshotRefreshTimer?.();
  }

  activatePreviewPageRoute(context = {}) {
    const PAGE_IDS = this._constants.PAGE_IDS;
    if (context.previousPageId !== PAGE_IDS.preview) {
      if (this._host._$("#myPopup")?.classList.contains("is-open")) {
        this._host._popupLifecycleController?.close();
      }
      if (this._host._mountInProgress === true) {
        this._host._cancelPendingMount("page-route-preview");
      }
      if (typeof this._host._renderShellPreserveLive === "function") {
        this._host._renderShellPreserveLive();
      } else if (typeof this._host._renderShell === "function") {
        this._host._renderShell();
      }
    }
    this._host._applyPreviewShellVisibility();
    this._host._wideViewPageController.applyStyleLayoutAndWideSyncForCard();
    this.startPreviewMode();
    this._host._syncSnapshotRefreshTimer?.();
  }

  startPreviewMode() {
    this._host._previewAlertController.start();
  }

  stopPreviewMode() {
    this._host._clearPreviewTimers();
    this.teardownPreviewMedia();
  }

  exitPreviewPageToCamera(idx) {
    if (!this.isPreviewPageActive()) return;
    if (
      !Number.isInteger(idx) ||
      idx < 0 ||
      idx >= (this._host._config?.cameras?.length || 0)
    ) {
      return;
    }

    const PAGE_IDS = this._constants.PAGE_IDS;
    const pageNavigation = this._pageNavigation();
    const targetPageId =
      (pageNavigation?.isPageRouteAvailable?.(
        this._host._lastNonPreviewPageId,
      ) ?? this._host._isPageRouteAvailable?.(this._host._lastNonPreviewPageId))
        ? this._host._lastNonPreviewPageId
        : PAGE_IDS.singleView;

    pageNavigation?.navigateToPageRoute?.(targetPageId, {
      source: "preview-camera-select",
      deferCameraSwitch: true,
    }) ??
      this._host._navigateToPageRoute?.(targetPageId, {
        source: "preview-camera-select",
        deferCameraSwitch: true,
      });

    // Keep the existing live mount when selecting the already-active camera.
    if (this._host._activeCamIdx === idx) {
      this._host._viewMode = "single";
      this._host._syncTabsShell?.();
      this._host._renderAll?.();
      const engineHost = this._host._$("#engine");
      const hasLiveVideo = !!(
        this._host._findVideoDeep?.(engineHost) ||
        this._host._findVideoDeep?.(this._host._engine) ||
        this._host._engine?.video
      );
      if (hasLiveVideo) {
        this._host._scheduleResumeLive?.("preview-camera-select-same-camera");
      } else {
        this._host._mountEngine?.(null, { quiet: true });
      }
      return;
    }

    void this._host._switchCamera(idx, { source: "preview-camera-select" });
  }

  returnToPreviewPage() {
    const PAGE_IDS = this._constants.PAGE_IDS;
    if (!this.isPreviewPageEnabled() || this.isPreviewPageActive()) {
      return;
    }
    this._pageNavigation()?.navigateToPageRoute?.(PAGE_IDS.preview, {
      source: "preview-page-return",
    }) ??
      this._host._navigateToPageRoute?.(PAGE_IDS.preview, {
        source: "preview-page-return",
      });
  }
}
