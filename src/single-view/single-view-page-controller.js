import { activateStandardPageRouteLifecycle } from "../navigation/standard-page-route-lifecycle.js";

export class SingleViewPageController {
  constructor(host, constants) {
    this._host = host;
    this._constants = constants;
  }

  activateSingleViewPageRoute(context = {}) {
    this.activateStandardPageRoute(context);
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
    this._host._applyCardStyle();
    this._host._applyLayoutMode();
    this._host._syncColHeightIfWideView();
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
      this._host._navigateToConfiguredLandingPage({
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
    this._host._syncPageNavigationButtons();
  }

  applyNonPreviewConfigUpdateTail({
    needsEngineRemount = false,
    realtimePollChanged = false,
  } = {}) {
    this.applyNonPreviewSchemaSoftUpdate();

    if (needsEngineRemount) {
      this.mountEngineQuietly();
    }
    if (realtimePollChanged) {
      this._host._restartRealtimeHeadPollTimer();
    }
  }

  applyNonPreviewHassUpdate({
    cameraStateChanged = false,
    themeChanged = false,
  } = {}) {
    if (cameraStateChanged) {
      this._host._syncStatus();
      this._host._kickLiveIfStale();
    }
    if (themeChanged) {
      this._host._applyCardStyle();
    }
  }

  applyHassUpdateRouteFlow({
    cameraStateChanged = false,
    themeChanged = false,
    previewPageActive = false,
  } = {}) {
    if (previewPageActive) {
      if (cameraStateChanged) {
        this._host._renderPreviewPage();
      }
      if (themeChanged) {
        this._host._applyCardStyle();
      }
      return "preview";
    }

    this.applyNonPreviewHassUpdate({
      cameraStateChanged,
      themeChanged,
    });
    return "non-preview";
  }

  applyPreviewConfigUpdateTail({
    previewModeConfigChanged = false,
    realtimePollChanged = false,
  } = {}) {
    this._host._applyCardStyle();
    this._host._applyLayoutMode();
    this._host._renderPreviewPage();
    if (previewModeConfigChanged || realtimePollChanged) {
      this._host._clearPreviewTimers();
      this._host._previewAlertController.scheduleAlertWatch(300);
    }
  }

  applyEditorPreviewDraftRefresh() {
    this._host._syncTabsShell();
    this._host._syncPageNavShell();
    this._host._renderCamSwitcher();
    this.applyStyleLayoutForCurrentRoute();
    this._host._syncStatus();
    this._host._renderSubtitle();
    this._host._renderStats();
    this._host._renderListLabel();
    this._host._renderList();
    this._host._syncPageNavigationButtons();
  }

  applyConfigUpdateRouteFlow({
    needsEngineRemount = false,
    nextCameraCount = 0,
    needsShellRerender = false,
    activePageInvalid = false,
    previewPageActive = false,
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
