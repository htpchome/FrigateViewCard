import {
  resolveCameraSwitchCleanupOptions,
  resolveCameraSwitchTransportEntity,
} from "./mount-lifecycle.js";

export class LiveDashboardRetentionController {
  constructor(
    host,
    {
      requestFrame =
        typeof globalThis.requestAnimationFrame === "function"
          ? (callback) => globalThis.requestAnimationFrame(callback)
          : null,
      setTimer = (callback, delay) => globalThis.setTimeout(callback, delay),
      clearTimer = (timer) => globalThis.clearTimeout(timer),
    } = {},
  ) {
    this._host = host;
    this._requestFrame = requestFrame;
    this._setTimer = setTimer;
    this._clearTimer = clearTimer;
  }

  preserveForNavigation() {
    const host = this._host;
    if (
      !host._started ||
      !host._engine ||
      host._mountInProgress ||
      host._isPreviewPageActive() ||
      host._viewMode === "grid" ||
      host._twoWayTalkStarting ||
      host._twoWayTalkSession
    ) {
      return false;
    }

    const entity = resolveCameraSwitchTransportEntity({
      cameraEntity: host._activeCam?.entity,
      memberOverride: host._activeGroupMemberOverride,
    });
    const streamType = host._currentLiveStreamHint();
    if (
      !entity ||
      !host._shouldUseGo2RtcForEntity(entity) ||
      (streamType !== "webrtc" && streamType !== "mse")
    ) {
      return false;
    }

    const cleanupOptions = resolveCameraSwitchCleanupOptions({
      previousEntity: entity,
      mountInProgress: host._mountInProgress,
    });
    if (!cleanupOptions.preserveLiveEntity) return false;

    host._cancelPendingMount("same-dashboard-navigation", cleanupOptions);
    host._clearLiveEngineSlot();
    host._dashboardLiveGraceActive = true;
    return true;
  }

  handleScopeExited() {
    const host = this._host;
    host._dashboardLiveGraceActive = false;
    const teardownIfDetached = () => {
      if (host.isConnected) return;
      if (host._disconnectTeardownT) {
        this._clearTimer(host._disconnectTeardownT);
        host._disconnectTeardownT = null;
      }
      host._teardownDisconnected();
    };
    if (!host.isConnected) {
      teardownIfDetached();
      return;
    }
    this._setTimer(teardownIfDetached, 0);
  }

  handleNavigationSettled() {
    const host = this._host;
    const restoreRetainedWebRtc = () => {
      if (
        !host.isConnected ||
        !host._started ||
        !host._hass ||
        !host._config ||
        !host._isCardVisible() ||
        host._isPreviewPageActive() ||
        host._viewMode === "grid" ||
        host._mountInProgress ||
        host._$("#myPopup")?.classList.contains("is-open")
      ) {
        return;
      }

      const entity = resolveCameraSwitchTransportEntity({
        cameraEntity: host._activeCam?.entity,
        memberOverride: host._activeGroupMemberOverride,
      });
      if (
        !entity ||
        !host._shouldUseGo2RtcForEntity(entity) ||
        host._currentLiveStreamHint() !== "webrtc"
      ) {
        return;
      }

      const engineHost = host._$("#engine");
      const video =
        host._findVideoDeep(engineHost) ||
        host._findVideoDeep(host._engine) ||
        host._engine?.video ||
        null;
      if (!host._engine || !video) {
        host._scheduleResumeLive("dashboard-swipe-settled");
        return;
      }

      // Reuse the established peer connection, but remount its video after
      // Home Assistant's page transform so WebKit creates a fresh surface.
      host._cancelPendingMount("dashboard-swipe-webrtc-rebind", {
        preserveLiveEntity: entity,
      });
      host._clearLiveEngineSlot();
      void host._mountEngine();
    };

    if (this._requestFrame) {
      this._requestFrame(restoreRetainedWebRtc);
      return;
    }
    this._setTimer(restoreRetainedWebRtc, 0);
  }
}

export function getLiveDashboardRetentionController(host) {
  if (
    host._liveDashboardRetentionController instanceof
    LiveDashboardRetentionController
  ) {
    return host._liveDashboardRetentionController;
  }
  const controller = new LiveDashboardRetentionController(host);
  host._liveDashboardRetentionController = controller;
  return controller;
}
