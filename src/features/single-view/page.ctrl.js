import { BrowseRenderController } from "../browse/render.ctrl.js";
import { activateStandardPageRouteLifecycle } from "../navigation/route-lifecycle.js";
import {
  PAGE_START_MODES,
  normalizePageStartMode,
} from "../navigation/start-mode.js";
import { cap, camDisplayName } from "../../helpers.js";
import { resolveLiveSourceIndicatorState } from "../../shared/media/source-indicator.js";
import { setLocalizedText } from "../localization/localized-dom.js";
import {
  buildSingleViewCamSwitcherMarkup,
  resolveSingleViewAlertsCountText,
  resolveSingleViewOnlineLabel,
  resolveSingleViewStatusColor,
  resolveSingleViewStreamTypeText,
  resolveSingleViewSubtitleText,
  resolveSingleViewTitleText,
} from "./page.tmpl.js";

const cameraName = (camera) => cap(camDisplayName(camera));

export class SingleViewPageController {
  constructor(host, constants) {
    this._host = host;
    this._constants = constants;
    this._browseRenderController = new BrowseRenderController(host);
    this._alertTakeoverEnabled = null;
    this._startModeApplied = false;
  }

  isActive() {
    return this._host._pageId === this._constants.PAGE_IDS.singleView;
  }

  alertTakeoverEnabled() {
    if (this._host._isAlertCameraTakeoverAvailable?.() === false) return false;
    return this._alertTakeoverEnabled == null
      ? this._host._config?.single_view_alert_takeover === true
      : this._alertTakeoverEnabled === true;
  }

  toggleAlertTakeover() {
    if (this._host._isAlertCameraTakeoverAvailable?.() === false) {
      this._host._syncToolbarButtons?.();
      return false;
    }
    if (
      !this.alertTakeoverEnabled() &&
      this._host._toolbarButtonStates?.().wideAlertTakeoverDisabled
    ) {
      this._host._syncToolbarButtons?.();
      return false;
    }
    this._alertTakeoverEnabled = !this.alertTakeoverEnabled();
    this._host._handleAlertTakeoverStateChange?.(
      this._alertTakeoverEnabled,
    );
    this._host._syncToolbarButtons?.();
    return this._alertTakeoverEnabled;
  }

  applyConfiguredStartMode({
    force = false,
    mode = null,
    gridAvailable = null,
  } = {}) {
    if (!this.isActive()) return false;
    if (this._startModeApplied && !force) return false;
    this._startModeApplied = true;

    const configuredMode = normalizePageStartMode(
      mode ?? this._host._config?.single_view_start_mode,
    );
    const startGrid =
      configuredMode === PAGE_START_MODES.grid &&
      (gridAvailable ?? this._host._isGridModeAvailable?.() === true);
    const startSlideshow =
      configuredMode === PAGE_START_MODES.slideshow &&
      this._host._isSlideshowRotationAvailable?.() === true;

    if (startGrid) {
      if (this._host._slideshowActive === true) {
        this._host._stopSlideshowRotation?.(
          "single-view-start-grid",
          false,
        );
      }
      if (this._host._viewMode !== "grid") {
        this._host._setViewMode?.("grid");
      }
      return true;
    }

    if (this._host._viewMode === "grid") {
      this._host._setViewMode?.("single");
    }
    if (startSlideshow) {
      if (this._host._slideshowActive !== true) {
        this._host._startSlideshowRotation?.("single-view-start");
      }
      return true;
    }
    if (this._host._slideshowActive === true) {
      this._host._stopSlideshowRotation?.("single-view-start-live");
    }
    return true;
  }

  applyPageConfigUpdate({
    takeoverDefaultChanged = false,
    startModeChanged = false,
  } = {}) {
    if (takeoverDefaultChanged) {
      this._alertTakeoverEnabled = null;
      this._host._handleAlertTakeoverStateChange?.(
        this.alertTakeoverEnabled(),
      );
    }
    if (startModeChanged && this.isActive()) {
      this._startModeApplied = false;
      this.applyConfiguredStartMode({ force: true });
    }
    this._host._syncToolbarButtons?.();
  }

  _pageNavigation() {
    return this._host._pageNavigationController || null;
  }

  _usesGridText() {
    return (
      this._host._viewMode === "grid" &&
      this._host._isPreviewPageActive?.() !== true
    );
  }

  camSwitcherMarkup({ includeStatus = true } = {}) {
    return buildSingleViewCamSwitcherMarkup({
      includeStatus,
      cameras: this._host._config.cameras,
      activeCamIdx: this._host._activeCamIdx,
      isSingleView: this._host._viewMode === "single",
      getCameraName: cameraName,
      isCameraAvailable: (camera) =>
        this._host._hass?.states?.[camera.entity]?.state !== "unavailable",
    });
  }

  renderCamSwitcher() {
    const element = this._host._pageShellRegion("cameraSwitcher");
    if (!element) return;
    if (
      this._host._config.cameras.length < 2 &&
      this._host._isPreviewPageEnabled?.() !== true
    ) {
      element.style.display = "none";
      return;
    }
    element.style.display = "";
    element.innerHTML = this.camSwitcherMarkup({ includeStatus: true });
  }

  syncStatus() {
    const title = this._host._pageShellRegionElement(
      "information",
      "#info-title",
    );
    if (title) {
      title.hidden = this._host._config.display_title === false;
      title.textContent = this.titleText();
    }

    const state =
      this._host._hass?.states?.[this._host._activeCam?.entity] || null;
    if (!state) return;

    const statusDot = this._host._pageShellRegionElement(
      "information",
      "#on-dot",
    );
    const statusLabel = this._host._pageShellRegionElement(
      "information",
      "#on-lbl",
    );
    const online = state.state !== "unavailable";
    const liveBadge = this._host.shadowRoot?.querySelector?.(
      "[data-single-view-live-badge]",
    );
    if (statusDot) {
      statusDot.style.color = resolveSingleViewStatusColor(online);
    }
    if (statusLabel) {
      setLocalizedText(
        statusLabel,
        online ? "runtime.live.online" : "runtime.live.offline",
        this._host._localization?.t || (() => resolveSingleViewOnlineLabel(online)),
      );
    }
    if (liveBadge) {
      liveBadge.hidden = this._usesGridText();
      liveBadge.classList?.toggle?.("is-offline", !online);
      const labelKey = online
        ? "runtime.live.liveCamera"
        : "runtime.live.cameraOffline";
      liveBadge.setAttribute?.("data-fvc-i18n-aria-label", labelKey);
      liveBadge.setAttribute?.(
        "aria-label",
        this._host._localization?.t?.(labelKey) ||
          (online ? "Live camera" : "Camera offline"),
      );
    }
  }

  renderStats() {
    const alertCount = this._host._pageShellRegionElement(
      "information",
      "#alert-count",
    );
    if (alertCount) {
      alertCount.textContent = resolveSingleViewAlertsCountText(
        this._host._browseWindowLoaderController?.cameraAlertsCount?.(
          this._host._activeCam?.entity || "",
          { includeGroup: true },
        ) ?? 0,
      );
    }
    const streamType = this._host._pageShellRegionElement(
      "information",
      "#stream-type",
    );
    if (streamType) {
      streamType.textContent = resolveSingleViewStreamTypeText(
        this._host._activeStreamType,
      );
    }
    const sourceIndicator = this._host.shadowRoot?.querySelector?.(
      "[data-single-view-source-indicator]",
    );
    if (!sourceIndicator) return;
    const sourceState = resolveLiveSourceIndicatorState(
      this._host._activeStreamType,
    );
    const sourceIcon = sourceIndicator.querySelector?.(
      "[data-single-view-source-icon]",
    );
    const sourceText = sourceIndicator.querySelector?.(
      "[data-single-view-source-text]",
    );
    sourceIndicator.hidden = this._usesGridText() || !sourceState.visible;
    sourceIndicator.title = sourceState.label;
    sourceIndicator.setAttribute?.(
      "aria-label",
      sourceState.visible ? `${sourceState.label} live source` : "Live source",
    );
    if (sourceIcon) sourceIcon.hidden = !sourceState.showIcon;
    if (sourceText) {
      sourceText.hidden = !sourceState.text;
      sourceText.textContent = sourceState.text;
    }
  }

  titleText() {
    return resolveSingleViewTitleText({
      title: this._host._config.title,
      activeCamera: this._host._activeCam,
      getCameraName: cameraName,
      gridMode: this._usesGridText(),
    });
  }

  subtitleText() {
    return resolveSingleViewSubtitleText({
      subtitle: this._host._config.subtitle,
      activeCamera: this._host._activeCam,
      getCameraName: cameraName,
      gridMode: this._usesGridText(),
    });
  }

  renderSubtitle() {
    const subtitle = this._host._pageShellRegionElement(
      "information",
      "#tl-range",
    );
    if (!subtitle) return;
    subtitle.hidden = this._host._config.display_subtitle === false;
    subtitle.textContent = this.subtitleText();
  }

  renderLegend() {
    this._browseRenderController.renderLegend();
  }

  listHeadingLabel(ts = null) {
    return this._browseRenderController.listHeadingLabel(ts);
  }

  recordingsHeadingLabel(ts = null) {
    return this._browseRenderController.recordingsHeadingLabel(ts);
  }

  renderListLabel(ts = null) {
    this._browseRenderController.renderListLabel(ts);
  }

  showStickyDayHeaders() {
    return this._browseRenderController.showStickyDayHeaders();
  }

  renderStickyDaySections(items, renderItem) {
    return this._browseRenderController.renderStickyDaySections(
      items,
      renderItem,
    );
  }

  renderEventsContent(items) {
    return this._browseRenderController.renderEventsContent(items);
  }

  renderKeptContent(items) {
    return this._browseRenderController.renderKeptContent(items);
  }

  renderReviewsContent(items) {
    return this._browseRenderController.renderReviewsContent(items);
  }

  syncBrowseHeadFromScroll() {
    this._browseRenderController.syncBrowseHeadFromScroll();
  }

  renderList({ renderWideTimeline = true } = {}) {
    this._browseRenderController.renderList();
    if (renderWideTimeline) {
      this._host._wideViewPageController?.renderTimeline?.();
    }
  }

  setListHtmlIfChanged(list, html) {
    return this._browseRenderController.setListHtmlIfChanged(list, html);
  }

  syncOlderHint(forceHide = null) {
    this._browseRenderController.syncOlderHint(forceHide);
  }

  activateSingleViewPageRoute(context = {}) {
    this._startModeApplied = false;
    const routeContext = {
      ...context,
      startInGrid:
        context.startInGrid === true ||
        (normalizePageStartMode(
          this._host._config?.single_view_start_mode,
        ) === PAGE_START_MODES.grid &&
          this._host._isGridModeAvailable?.() === true),
    };
    this.activateStandardPageRoute(routeContext);
    this.applyConfiguredStartMode({
      mode: routeContext.startInGrid ? PAGE_START_MODES.grid : null,
      gridAvailable: routeContext.startInGrid,
    });
  }

  activateStandardPageRoute(context = {}) {
    activateStandardPageRouteLifecycle({
      host: this._host,
      context,
      previewPageId: this._constants.PAGE_IDS.preview,
      applyRouteFrame: () => this._applyStandardPageRouteFrame(),
    });
  }

  _applyStandardPageRouteFrame() {
    this._host._applyPreviewShellVisibility();
    this.applyStyleLayoutForCurrentRoute();
  }

  applyStyleLayoutForCurrentRoute() {
    this._host._wideViewPageController.applyStyleLayoutAndWideSyncForCard();
  }

  _mountEngineQuietly() {
    this._host._mountEngine(null, { quiet: true });
  }

  mountEngineQuietly() {
    this._mountEngineQuietly();
  }

  mountEngineQuietlyAndRenderAll() {
    this._mountEngineQuietly();
    this._host._renderAll();
  }

  applyPostShellRerenderRouteBehavior({
    activePageInvalid = false,
    previewPageActive = false,
  } = {}) {
    if (activePageInvalid) {
      this._pageNavigation()?.navigateToConfiguredLandingPage?.({
        source: "config-page-fallback",
      }) ??
        this._host._navigateToConfiguredLandingPage?.({
          source: "config-page-fallback",
        });
      return;
    }

    if (previewPageActive) {
      this._host._startPreviewMode();
      return;
    }

    this.mountEngineQuietlyAndRenderAll();
  }

  applyConfigShellRerender({
    activePageInvalid = false,
    previewPageActive = false,
  } = {}) {
    // Shell rebuild replaces media host nodes, so always tear down first.
    this._host._gridMediaController?.teardownGridEngine?.();
    this._host._cleanupEngine();
    this._host._renderShell();
    this.applyPostShellRerenderRouteBehavior({
      activePageInvalid,
      previewPageActive,
    });
  }

  applyNonPreviewSchemaSoftUpdate() {
    this.applyStyleLayoutForCurrentRoute();
    this._host._syncStatus();
    this._host._renderSubtitle();
    this._host._renderStats();
    this._host._renderCamSwitcher();
    this._host._syncToolbarButtons();
    this._pageNavigation()?.syncPageNavigationButtons?.() ??
      this._host._syncPageNavigationButtons?.();
  }

  applyNonPreviewConfigUpdateTail({
    needsEngineRemount = false,
    snapshotUpdateChanged = false,
    realtimePollChanged = false,
  } = {}) {
    this.applyNonPreviewSchemaSoftUpdate();

    if (needsEngineRemount) {
      this.mountEngineQuietly();
    }
    if (snapshotUpdateChanged) {
      this._host._syncSnapshotRefreshTimer?.();
    }
    if (realtimePollChanged) {
      this._host._restartRealtimeHeadPollTimer();
    }
  }

  applyNonPreviewHassUpdate({
    cameraStateChanged = false,
    activeCameraRecovered = false,
    themeChanged = false,
  } = {}) {
    if (cameraStateChanged) {
      this._host._renderCamSwitcher();
      this._host._syncStatus();
      this._host._kickLiveIfStale();
      this._host._wideViewPageController?.handleCompanionHassUpdate?.();
      if (this._host._viewMode === "grid") {
        this._host._scheduleGridRefresh?.(120);
        this._host._gridAlertController?.scheduleAlertWatch?.(120);
        void this._host._probeLatestGridAlert?.();
      }
    }
    if (activeCameraRecovered) {
      this._host._scheduleResumeLive("active-camera-recovered");
    }
    if (themeChanged) {
      this._host._applyCardStyle();
    }
  }

  applyHassUpdateRouteFlow({
    cameraStateChanged = false,
    activeCameraRecovered = false,
    themeChanged = false,
    previewPageActive = false,
  } = {}) {
    if (previewPageActive) {
      if (cameraStateChanged) {
        this._host._renderPreviewPage();
        this._host._previewAlertController?.scheduleAlertWatch?.(120);
        void this._host._previewAlertController?.probeLatestAlert?.();
      }
      if (themeChanged) {
        this._host._applyCardStyle();
      }
      return "preview";
    }

    this.applyNonPreviewHassUpdate({
      cameraStateChanged,
      activeCameraRecovered,
      themeChanged,
    });
    return "non-preview";
  }

  applyPreviewConfigUpdateTail({
    previewModeConfigChanged = false,
    realtimePollChanged = false,
  } = {}) {
    this._host._wideViewPageController.applyStyleLayoutAndWideSyncForCard();
    this._host._renderPreviewPage();
    if (previewModeConfigChanged || realtimePollChanged) {
      this._host._clearPreviewTimers();
      this._host._previewAlertController.scheduleAlertWatch(300);
    }
  }

  applyEditorPreviewDraftRefresh({ renderList = true } = {}) {
    this._host._syncTabsShell();
    this._pageNavigation()?.syncPageNavShell?.() ??
      this._host._syncPageNavShell?.();
    this._host._renderCamSwitcher();
    this.applyStyleLayoutForCurrentRoute();
    this._host._syncFvcBrandLogo();
    this._host._syncFooterVersion?.();
    if (this._host._isPreviewPageActive?.()) {
      this._host._renderPreviewPage();
      return;
    }
    this._host._syncStatus();
    this._host._renderSubtitle();
    this._host._renderStats();
    this._host._renderListLabel();
    if (renderList) this._host._renderList();
    this._pageNavigation()?.syncPageNavigationButtons?.() ??
      this._host._syncPageNavigationButtons?.();
  }

  applyConfigUpdateRouteFlow({
    needsEngineRemount = false,
    nextCameraCount = 0,
    needsShellRerender = false,
    activePageInvalid = false,
    previewPageActive = false,
    snapshotUpdateChanged = false,
    realtimePollChanged = false,
  } = {}) {
    this.applyCameraSetChange({
      needsEngineRemount,
      nextCameraCount,
    });

    if (needsShellRerender) {
      this.applyConfigShellRerender({
        activePageInvalid,
        previewPageActive,
      });
      return "handled";
    }

    if (previewPageActive) {
      return "preview";
    }

    this.applyNonPreviewConfigUpdateTail({
      needsEngineRemount,
      snapshotUpdateChanged,
      realtimePollChanged,
    });
    return "handled";
  }

  applyCameraSetChange({
    needsEngineRemount = false,
    nextCameraCount = 0,
  } = {}) {
    if (!needsEngineRemount) return;

    this._host._cleanupEngine();
    this._host._activeCamIdx = Math.min(
      this._host._activeCamIdx,
      Math.max(0, Number(nextCameraCount) - 1),
    );
  }
}
