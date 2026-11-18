import { GRID_ROTATION_OPTIONS_SECONDS, VERSION } from "../../constants.js";
import { GRID_RUNTIME_ASSET_NAME } from "../../release-artifacts.mjs";
import { resolveGridCameras } from "./config.js";
const gridRuntimeModuleState = { promise: null };

export const ensureGridRuntimeModule = ({
  importModule = (url) => import(url),
  baseUrl = import.meta.url,
} = {}) => {
  if (gridRuntimeModuleState.promise) return gridRuntimeModuleState.promise;
  const assetUrl = new URL(`./${GRID_RUNTIME_ASSET_NAME}`, baseUrl);
  assetUrl.searchParams.set("fvc-version", VERSION);
  gridRuntimeModuleState.promise = Promise.resolve()
    .then(() => importModule(assetUrl.href))
    .catch((error) => {
      gridRuntimeModuleState.promise = null;
      throw error;
    });
  return gridRuntimeModuleState.promise;
};

export class LazyGridFeatureController {
  constructor(
    host,
    options = {},
    { loadModule = ensureGridRuntimeModule } = {},
  ) {
    this._host = host;
    this._options = options;
    this._loadModule = loadModule;
    this._controllers = null;
    this._controllersPromise = null;
    this._disposed = false;
  }

  isSupported() {
    return (
      this._host?._config?.grid_mode_enabled === true &&
      this._host?._isLikelyPhoneClient?.() !== true &&
      resolveGridCameras(
        this._host?._config?.cameras,
        this._host?._config?.grid_order,
      ).length > 1
    );
  }

  isLoaded() {
    return Boolean(this._controllers);
  }

  shouldPrepareForLandingPage(pageId, pageIds = {}) {
    if (!this.isSupported()) return false;
    let startMode = "";
    if (pageId === pageIds.singleView) {
      startMode = this._host?._config?.single_view_start_mode;
    } else if (pageId === pageIds.wideView) {
      startMode = this._host?._config?.wide_view_start_mode;
    } else if (
      pageId === pageIds.cardView &&
      this._host?._config?.card_view_view_mode === "video-only"
    ) {
      startMode = this._host?._config?.card_view_start_mode;
    }
    return String(startMode || "").trim().toLowerCase() === "grid";
  }

  prepare() {
    if (!this.isSupported() || this._disposed) {
      return Promise.resolve(null);
    }
    return this._ensureControllers();
  }

  controller(name) {
    return this._controllers?.[name] || null;
  }

  dispose() {
    this._disposed = true;
    this._controllers?.page?.stopGridModeState?.();
    this._controllers = null;
  }

  _ensureControllers() {
    if (this._controllers) return Promise.resolve(this._controllers);
    if (this._controllersPromise) return this._controllersPromise;

    const controllersPromise = Promise.resolve()
      .then(() => this._loadModule())
      .then((module) => {
        if (this._disposed || !this.isSupported()) return null;
        const createControllers = module?.createGridRuntimeControllers;
        if (typeof createControllers !== "function") {
          throw new TypeError(
            "Grid runtime module did not export its controller factory",
          );
        }
        const controllers = createControllers(this._host, this._options);
        if (!controllers?.alert || !controllers?.page || !controllers?.media) {
          throw new TypeError(
            "Grid runtime module did not create every required controller",
          );
        }
        this._controllers = controllers;
        return controllers;
      })
      .catch((error) => {
        if (this._controllersPromise === controllersPromise) {
          this._controllersPromise = null;
        }
        console.warn("[Frigate] Grid runtime could not load", error);
        return null;
      })
      .finally(() => {
        if (
          !this._controllers &&
          this._controllersPromise === controllersPromise
        ) {
          this._controllersPromise = null;
        }
      });
    this._controllersPromise = controllersPromise;
    return controllersPromise;
  }
}

export class LazyGridPageController {
  constructor(host, featureController) {
    this._host = host;
    this._featureController = featureController;
    this._togglePending = false;
  }

  _delegate() {
    return this._featureController.controller("page");
  }

  isGridModeAvailable() {
    return this._featureController.isSupported();
  }

  isGridSessionActive() {
    return (
      this._host?._viewMode === "grid" ||
      this._host?._gridResumePending === true
    );
  }

  gridRotationMs() {
    const delegate = this._delegate();
    if (delegate) return delegate.gridRotationMs();
    const seconds = Number(this._host?._config?.grid_rotation_seconds);
    return GRID_ROTATION_OPTIONS_SECONDS.includes(seconds)
      ? seconds * 1000
      : 30000;
  }

  toggleGridMode() {
    const delegate = this._delegate();
    if (delegate) {
      delegate.toggleGridMode();
      return;
    }
    if (this._togglePending) return;
    this._togglePending = true;
    const requestedPageId = this._host?._pageId;
    void this._featureController.prepare().then((controllers) => {
      if (
        !this.isGridModeAvailable() ||
        this._host?._pageId !== requestedPageId
      ) {
        return;
      }
      controllers?.page?.toggleGridMode?.();
    }).finally(() => {
      this._togglePending = false;
    });
  }

  async beginAlertTakeover(entity, severity = "alert") {
    return (
      (await this._delegate()?.beginAlertTakeover?.(entity, severity)) ?? false
    );
  }

  beginAlertPageHold(entity) {
    return this._delegate()?.beginAlertPageHold?.(entity) ?? false;
  }

  captureBackgroundLiveStreamType(type) {
    return this._delegate()?.captureBackgroundLiveStreamType?.(type) === true;
  }

  handleAlertTakeoverStateChange(enabled) {
    this._delegate()?.handleAlertTakeoverStateChange?.(enabled);
  }

  handlePageChange(nextPageId, previousPageId) {
    this._delegate()?.handlePageChange?.(nextPageId, previousPageId);
  }

  prepareLiveForGrid() {
    return this._delegate()?.prepareLiveForGrid?.() || null;
  }

  retainedMainLiveEntity() {
    return this._delegate()?.retainedMainLiveEntity?.() || "";
  }

  restoreLiveAfterGrid(options = {}) {
    return this._delegate()?.restoreLiveAfterGrid?.(options) === true;
  }

  scheduleGridRefresh(delayMs = 80) {
    this._delegate()?.scheduleGridRefresh?.(delayMs);
  }

  scheduleGridRotation() {
    this._delegate()?.scheduleGridRotation?.();
  }

  stopGridModeState() {
    this._delegate()?.stopGridModeState?.();
  }

  takeColdStartLiveHandoff() {
    return this._delegate()?.takeColdStartLiveHandoff?.() || null;
  }
}

export class LazyGridAlertController {
  constructor(featureController) {
    this._featureController = featureController;
  }

  _delegate() {
    return this._featureController.controller("alert");
  }

  cellSeverity(entity) {
    return this._delegate()?.cellSeverity?.(entity) || "";
  }

  clearAlertTracking() {
    this._delegate()?.clearAlertTracking?.();
  }

  clearTimers() {
    this._delegate()?.clearTimers?.();
  }

  clearWatchTimer() {
    this._delegate()?.clearWatchTimer?.();
  }

  handleMarkedAlertCandidate(...args) {
    return this._delegate()?.handleMarkedAlertCandidate?.(...args);
  }

  handleRealtimeMessage(message) {
    this._delegate()?.handleRealtimeMessage?.(message);
  }

  isCameraAlertLive(entity) {
    return this._delegate()?.isCameraAlertLive?.(entity) === true;
  }

  markAlertCamera(...args) {
    return this._delegate()?.markAlertCamera?.(...args) === true;
  }

  async probeLatestAlert() {
    return await this._delegate()?.probeLatestAlert?.();
  }

  scheduleAlertWatch(delayMs = null) {
    this._delegate()?.scheduleAlertWatch?.(delayMs);
  }

  startSession() {
    this._delegate()?.startSession?.();
  }

  stopSession() {
    this._delegate()?.stopSession?.();
  }

  syncHaAlertState(options = {}) {
    this._delegate()?.syncHaAlertState?.(options);
  }
}

export class LazyGridMediaController {
  constructor(host, featureController, cameraCellMediaController) {
    this._host = host;
    this._featureController = featureController;
    this._cameraCellMediaController = cameraCellMediaController;
  }

  _delegate() {
    return this._featureController.controller("media");
  }

  mountCameraCellMedia(cell, options = {}) {
    return this._cameraCellMediaController.mountCameraCellMedia(cell, options);
  }

  refreshSnapshotMedia(options = {}) {
    return this._cameraCellMediaController.refreshSnapshotMedia(options);
  }

  shouldUseLive(entity) {
    const delegate = this._delegate();
    if (delegate) return delegate.shouldUseLive(entity);
    if (this._host?._isEditorPreviewContext?.() === true) return false;
    return (
      this._host?._gridLiveViewEnabled?.() === true ||
      this._host?._isGridCameraAlertLive?.(entity) === true
    );
  }

  mountGridEngine(slot) {
    const delegate = this._delegate();
    if (delegate) {
      delegate.mountGridEngine(slot);
      return;
    }
    void this._featureController.prepare().then((controllers) => {
      if (this._host?._viewMode !== "grid" || !slot?.isConnected) return;
      controllers?.media?.mountGridEngine?.(slot);
    });
  }

  activateCurrentGridPage() {
    return this._delegate()?.activateCurrentGridPage?.() === true;
  }

  takeGridLiveHandoff(entity) {
    return this._delegate()?.takeGridLiveHandoff?.(entity) || null;
  }

  teardownGridEngine(options = {}) {
    const delegate = this._delegate();
    if (delegate) {
      delegate.teardownGridEngine(options);
      return;
    }
    const slot =
      options.slot ||
      this._host?.shadowRoot?.querySelector?.("#grid-engine") ||
      null;
    this._host._gridEngine = null;
    if (!slot) return;
    if (options.keepSlotVisible !== true) {
      slot.hidden = true;
      slot.setAttribute?.("aria-hidden", "true");
      this._host?.shadowRoot
        ?.querySelector?.("#engine")
        ?.setAttribute?.("aria-hidden", "false");
    }
    slot.innerHTML = "";
  }
}
