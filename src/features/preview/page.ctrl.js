import {
  resolvePreviewLiveStreamHint,
  resolvePreviewStreamSourceLabel,
} from "./utils.js";
import {
  buildPreviewCameraButtonMarkup,
  buildPreviewCellMarkup,
  buildPreviewLayoutShellMarkup,
  buildPreviewLightRegionMarkup,
  buildPreviewMetaMarkup,
  buildPreviewShellHeaderMarkup,
  buildPreviewShellMarkup,
  buildPreviewStatusMarkup,
} from "./page.tmpl.js";
import { ICONS } from "../../icons.js";
import { DEFAULT_TITLE, VERSION } from "../../constants.js";
import { cap, camDisplayName, DEVICE_PROFILE } from "../../helpers.js";
import { resolveCameraAwareText } from "../../shared/page-text.js";
import { buildHaCameraStreamState } from "../../integrations/home-assistant/playback.js";
import {
  cameraGroupSecondaryEntity,
  cameraMemberEntities,
  flattenCameraMembers,
  isCameraGroup,
} from "../camera-groups/model.js";

export class PreviewPageController {
  constructor(host, constants) {
    this._host = host;
    this._constants = constants;
  }

  _pageNavigation() {
    return this._host._pageNavigationController || null;
  }

  previewLiveCamerasEnabled() {
    if (this._constants.DEVICE_PROFILE?.isMobile === true) {
      return this._host._config?.preview_page_live_cameras_mobile === true;
    }
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

  previewAlertsCount(entity) {
    return (
      this._host._browseWindowLoaderController?.cameraAlertsCount?.(entity) ??
      (Array.isArray(this._host._camCache?.[entity]?.reviews)
        ? this._host._camCache[entity].reviews.length
        : 0)
    );
  }

  previewCellSeverity(entity) {
    return this._host._previewAlertController.previewCellSeverity(entity);
  }

  _previewPageTitle() {
    return resolveCameraAwareText({
      value: this._host._config.title,
      fallback: DEFAULT_TITLE,
      activeCamera: this._host._activeCam,
      getCameraName: (camera) => cap(camDisplayName(camera)),
    });
  }

  usesBottomNavbarPreviewChrome() {
    return (
      this.isPreviewPageActive() &&
      this._host._isLikelyMobileClient?.() === true &&
      this._host._haNavbarController?.isNavbarAtBottom?.() === true
    );
  }

  syncBottomNavbarPreviewChrome() {
    if (!this.isPreviewPageActive()) return;
    const useBottomNavbarChrome = this.usesBottomNavbarPreviewChrome();
    const logoMarkup =
      this._host._config.display_logo !== false ? ICONS.frigateView : "";
    const showHeaderLogo = useBottomNavbarChrome && logoMarkup !== "";
    const headerLogo = this._host._$("#preview-shell-header-logo");
    const titleBlock = this._host._$("#preview-shell-title-block");
    const footer = this._host._$("#preview-shell-footer");

    if (headerLogo) {
      if (headerLogo.innerHTML !== logoMarkup) {
        headerLogo.innerHTML = logoMarkup;
      }
      headerLogo.hidden = !showHeaderLogo;
    }
    if (titleBlock) titleBlock.hidden = showHeaderLogo;
    if (footer) footer.hidden = useBottomNavbarChrome;
  }

  buildPreviewLayoutShellMarkup() {
    const useBottomNavbarChrome = this.usesBottomNavbarPreviewChrome();
    const previewLogo =
      this._host._config.display_logo !== false ? ICONS.frigateView : "";
    const previewShellHeader = buildPreviewShellHeaderMarkup({
      title: this._previewPageTitle(),
      subtitle: this._host._subtitleText(),
      displayTitle: this._host._config.display_title !== false,
      displaySubtitle: this._host._config.display_subtitle !== false,
      headerLogo: previewLogo,
      displayHeaderLogo: useBottomNavbarChrome,
      pageNav:
        this._pageNavigation()?.pageNavMarkup?.() ||
        this._host._pageNavMarkup?.() ||
        "",
    });

    return buildPreviewLayoutShellMarkup({
      previewShellHeader,
      previewFooterIcon: previewLogo,
      version: VERSION,
      hideFooter: useBottomNavbarChrome,
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
    this.syncBottomNavbarPreviewChrome();
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

  _displayCameras() {
    return flattenCameraMembers(this._host._config?.cameras).slice(0, 9);
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
    if (titleEl) {
      titleEl.hidden = this._host._config.display_title === false;
      titleEl.textContent = this._previewPageTitle();
    }
    if (subtitleEl) {
      subtitleEl.hidden = this._host._config.display_subtitle === false;
      subtitleEl.textContent = this._host._subtitleText();
    }
    this.syncBottomNavbarPreviewChrome();

    const cameras = this._displayCameras();
    const showTitleBars = this.previewShowTitleBarsEnabled();
    const liveStreamHint = this.previewLiveStreamHint();
    const hassReady = !!this._host._hass?.states;
    const nextSignature = cameras
      .map((camera, index) => {
        const entity = camera?.entity || "";
        const useLive = this.previewShouldUseLive(entity);
        const light = this._host._linkedLightController?.config?.(camera);
        const lightPosition =
          this._host._linkedLightController?.position?.(light) || "right";
        const lightSignature = light?.entity
          ? `:light:${light.entity}:${light.icon || ""}:${lightPosition}`
          : "";
        return `${index}:${entity}:${useLive ? `live:${liveStreamHint}` : "snap"}${lightSignature}`;
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
        const alertsCount = this.previewAlertsCount(entity);
        const name = cap(camDisplayName(camera));
        const linkedLightLeftMarkup =
          this._host._linkedLightController?.buildMarkup?.({
            buttonClass: "icon-btn",
            camera,
            position: "left",
          }) || "";
        const linkedLightRightMarkup =
          this._host._linkedLightController?.buildMarkup?.({
            buttonClass: "icon-btn",
            camera,
            position: "right",
          }) || "";
        return buildPreviewCellMarkup({
          index: camera.logical_camera_index ?? index,
          entity,
          severity,
          useLive,
          overlayLightMarkup: showTitleBars
            ? ""
            : buildPreviewLightRegionMarkup({
                cameraEntity: entity,
                linkedLightLeftMarkup,
                linkedLightRightMarkup,
                overlay: true,
              }),
          metaMarkup: buildPreviewMetaMarkup({
            showTitleBars,
            name,
            online,
            sourceLabel,
            alertsCount,
            cameraEntity: entity,
            linkedLightLeftMarkup,
            linkedLightRightMarkup,
          }),
        });
      })
      .join("");

    const buttonsMarkup = cameras
      .map((camera, index) =>
        buildPreviewCameraButtonMarkup({
          index: camera.logical_camera_index ?? index,
          entity: camera?.entity || "",
          name: cap(camDisplayName(camera)),
        }),
      )
      .join("");

    shell.innerHTML = buildPreviewShellMarkup({
      cellsMarkup,
      buttonsMarkup,
    });
    this.mountPreviewMedia();
    this._host._linkedLightController?.sync?.();
    this.applyPreviewShellVisibility();
    this._host._syncSnapshotRefreshTimer?.();
  }

  updatePreviewMeta() {
    const showTitleBars = this.previewShowTitleBarsEnabled();
    this._host.shadowRoot
      .querySelectorAll("[data-preview-camidx]")
      .forEach((cell) => {
        const entity =
          cell.querySelector?.(".preview-media-host")?.dataset
            ?.previewMediaEntity || "";
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
        const alerts = cell.querySelector(".preview-meta-alerts");
        if (alerts) {
          alerts.textContent = `Alerts: ${this.previewAlertsCount(entity)}`;
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
    hosts.forEach((host, index) => {
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
        snapshotPlaceholderWhileLive: true,
        prioritizeSnapshot: index === 0,
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
    void this._host._browseWindowLoaderController?.warmVisibleCameraReviews?.();
  }

  stopPreviewMode() {
    this._host._clearPreviewTimers();
    this.teardownPreviewMedia();
  }

  restoreCameraBrowseCache(idx) {
    const entity = this._host._config?.cameras?.[idx]?.entity;
    const cache = entity ? this._host._camCache?.[entity] : null;
    if (!cache) return;
    this._host._events = cache.events || [];
    this._host._recordings = cache.recordings || [];
    this._host._reviews = cache.reviews || [];
    this._host._kept = cache.kept || [];
    this._host._browseWindowLoaderController?.publishActiveGroupCombined?.(
      "events",
      { render: false },
    );
    this._host._browseWindowLoaderController?.publishActiveGroupCombined?.(
      "reviews",
      { render: false },
    );
    this._host._browseWindowLoaderController?.publishActiveGroupCombined?.(
      "recordings",
      { render: false },
    );
  }

  prepareRetainedCameraExit() {
    this._host._viewMode = "single";
    this.restoreCameraBrowseCache(this._host._activeCamIdx);
  }

  resumeRetainedCameraAfterExit() {
    const engineHost = this._host._$("#engine");
    const hasLiveVideo = !!(
      this._host._findVideoDeep?.(engineHost) ||
      this._host._findVideoDeep?.(this._host._engine) ||
      this._host._engine?.video
    );
    if (hasLiveVideo) {
      this._host._scheduleResumeLive?.("preview-retained-camera-exit");
    } else {
      this._host._mountEngine?.();
    }
    void this._host._browseWindowLoaderController?.loadWindow?.(true);
    this._host._applyCalendarActivityCacheForActiveCamera?.();
    void this._host._prefetchCalendarActivityForActiveCamera?.();
  }

  exitPreviewPageToCamera(idx, selectedEntity = "") {
    if (!this.isPreviewPageActive()) return;
    if (
      !Number.isInteger(idx) ||
      idx < 0 ||
      idx >= (this._host._config?.cameras?.length || 0)
    ) {
      return;
    }

    const camera = this._host._config.cameras[idx];
    const groupMembers = cameraMemberEntities(camera);
    const requestedEntity = String(selectedEntity || "").trim();
    const selectedMemberEntity = groupMembers.includes(requestedEntity)
      ? requestedEntity
      : groupMembers[0] || "";
    const isPhoneView =
      this._constants.DEVICE_PROFILE?.isPhone === true ||
      this._host._isLikelyPhoneClient?.() === true ||
      this._host._isMobilePhoneViewport?.() === true;
    const groupMemberEntity =
      isPhoneView &&
      isCameraGroup(camera) &&
      selectedMemberEntity === cameraGroupSecondaryEntity(camera)
        ? selectedMemberEntity
        : "";

    const PAGE_IDS = this._constants.PAGE_IDS;
    const pageNavigation = this._pageNavigation();
    const targetPageId =
      pageNavigation?.resolvePreviewCameraTargetPage?.(
        this._host._lastNonPreviewPageId,
      ) ||
      ((pageNavigation?.isPageRouteAvailable?.(
        this._host._lastNonPreviewPageId,
      ) ??
      this._host._isPageRouteAvailable?.(this._host._lastNonPreviewPageId))
        ? this._host._lastNonPreviewPageId
        : PAGE_IDS.singleView);

    const selectingActiveTarget =
      this._host._activeCamIdx === idx &&
      String(this._host._activeGroupMemberOverride || "").trim() ===
        groupMemberEntity;
    if (selectingActiveTarget) {
      this.prepareRetainedCameraExit();
    } else {
      // Preview renders independent camera media; restore the active camera's
      // browse arrays before the switch persists them back to its cache.
      this.restoreCameraBrowseCache(this._host._activeCamIdx);
    }

    pageNavigation?.navigateToPageRoute?.(targetPageId, {
      source: "preview-camera-select",
      deferCameraSwitch: true,
    }) ??
      this._host._navigateToPageRoute?.(targetPageId, {
        source: "preview-camera-select",
        deferCameraSwitch: true,
      });

    // Keep the existing live mount when selecting the already-active camera.
    if (selectingActiveTarget) {
      this.resumeRetainedCameraAfterExit();
      return;
    }

    void this._host._switchCamera(idx, {
      source: "preview-camera-select",
      ...(isCameraGroup(camera) ? { groupMemberEntity } : {}),
    });
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
