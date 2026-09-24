import { findActiveHaCameraStreamVideo } from "../../integrations/home-assistant/playback.js";
import {
  isMseReturnRemountReason,
  resolveLiveKickIfStaleAction,
  resolveLiveKickProbeState,
  resolveLiveResumeAction,
  shouldForceLiveRemountForReason,
  shouldPreserveLiveRemountReasonWhileWaiting,
} from "./mount-lifecycle.js";

const EDITOR_EXIT_REASONS = new Set([
  "card-editor-close",
  "watchdog-dialog-close",
  "watchdog-edit-exit",
  "watchdog-dashboard-edit-on",
  "watchdog-dashboard-edit-off",
  "hass-edit-exit",
]);

const FAST_RESUME_REASONS = new Set([
  "card-editor-close",
  "watchdog-dialog-close",
  "watchdog-dashboard-edit-on",
  "watchdog-dashboard-edit-off",
]);

export class LiveRecoveryController {
  constructor(
    host,
    {
      now = () => Date.now(),
      setTimer = (callback, delay) => globalThis.setTimeout(callback, delay),
      clearTimer = (timer) => globalThis.clearTimeout(timer),
    } = {},
  ) {
    this._host = host;
    this._now = now;
    this._setTimer = setTimer;
    this._clearTimer = clearTimer;
  }

  cancelScheduledResume() {
    const host = this._host;
    if (host._resumeLiveT) this._clearTimer(host._resumeLiveT);
    host._resumeLiveT = null;
  }

  scheduleResume(reason = "") {
    const host = this._host;
    if (host._isPreviewPageActive()) {
      host._renderPreviewPage();
      return;
    }
    if (host._viewMode === "grid") {
      host._scheduleGridRefresh(120);
      return;
    }

    this.cancelScheduledResume();
    const delay = FAST_RESUME_REASONS.has(reason) ? 40 : 140;
    host._resumeLiveT = this._setTimer(() => {
      host._resumeLiveT = null;
      host._resumeLiveIfNeeded(reason);
    }, delay);

    if (EDITOR_EXIT_REASONS.has(reason) && host._viewMode !== "grid") {
      // Editor exit can race layout/visibility; a late kick recovers missed first mounts.
      this._setTimer(() => host._kickLiveIfStale(true), 900);
    }
    if (host._isFirefox() && host._viewMode !== "grid") {
      // Firefox may need a second kick after layout settles on tab return.
      this._setTimer(() => host._kickLiveIfStale(true), 900);
    }
  }

  kickIfStale(
    force = false,
    forceRemount = false,
    forcedType = null,
  ) {
    const host = this._host;
    if (host._editorLiveHandoffController?.isSuspended?.()) return;
    const nowMs = this._now();
    const engineHost = host._$("#engine");
    const currentEngineTag = host._engine?.tagName?.toLowerCase?.() || "";
    const isHaDirectEngine =
      host._engine?.type === "ha_direct" ||
      currentEngineTag === "ha-camera-stream" ||
      currentEngineTag === "ha-hls-player" ||
      currentEngineTag === "ha-web-rtc-player";
    const video = isHaDirectEngine
      ? host._engine?.video || findActiveHaCameraStreamVideo(host._engine)
      : host._findVideoDeep(engineHost) ||
        host._findVideoDeep(host._engine) ||
        host._engine?.video ||
        null;
    const probeState = resolveLiveKickProbeState({ video });

    const action = resolveLiveKickIfStaleAction({
      started: host._started,
      hass: host._hass,
      config: host._config,
      previewPageActive: host._isPreviewPageActive(),
      viewMode: host._viewMode,
      visible: host._isCardVisible(),
      popupOpen: host._$("#myPopup")?.classList.contains("is-open"),
      mountInProgress: host._mountInProgress,
      force,
      forceRemount,
      streamLoadingVisible: Boolean(
        host._$("#stream-loading") && !host._$("#stream-loading").hidden,
      ),
      lastLiveKick: host._lastLiveKick,
      nowMs,
      isFirefox: host._isFirefox(),
      mseConnectAt: host._mseConnectAt,
      mseLastChunkAt: host._mseLastChunkAt,
      hasVideo: probeState.hasVideo,
      videoState: probeState.videoState,
    });

    if (action.shouldKick) {
      host._lastLiveKick = action.nextLastLiveKick;
      host._mountEngine(forcedType);
    }
  }

  resumeIfNeeded(reason = "") {
    const host = this._host;
    if (host._editorLiveHandoffController?.isSuspended?.()) return;
    const liveStreamHint = host._currentLiveStreamHint();
    const forceRemount = shouldForceLiveRemountForReason(reason, {
      activeStreamType: liveStreamHint,
      useGo2Rtc: host._shouldUseGo2RtcForEntity(
        host._activeGroupMemberOverride || host._activeCam?.entity || "",
      ),
    });
    const action = resolveLiveResumeAction({
      started: host._started,
      hass: host._hass,
      config: host._config,
      previewPageActive: host._isPreviewPageActive(),
      visible: host._isCardVisible(),
      popupOpen: host._$("#myPopup")?.classList.contains("is-open"),
      mountSeq: host._mountSeq,
      mountInProgress: host._mountInProgress,
      mountStartedAt: host._mountStartedAt,
      mountTargetEntity: host._mountTargetEntity,
      nowMs: this._now(),
    });

    if (action.nextMountState) {
      host._applyMountTrackingState(action.nextMountState);
      host._cleanupEngine();
    }

    if (action.shouldRetry) {
      // Layout transitions are async. Keep retrying until mount is possible.
      this.cancelScheduledResume();
      host._resumeLiveT = this._setTimer(() => {
        host._resumeLiveIfNeeded(
          forceRemount && shouldPreserveLiveRemountReasonWhileWaiting(reason)
            ? reason
            : "wait-ready",
        );
      }, action.retryDelayMs);
      return;
    }

    if (action.shouldRevealEngineWrap) {
      const engineWrap = host._$("#eng-wrap");
      if (engineWrap) engineWrap.style.display = "";
    }
    if (action.shouldKickNow) {
      host._kickLiveIfStale(
        true,
        forceRemount,
        forceRemount &&
          liveStreamHint === "mse" &&
          isMseReturnRemountReason(reason)
          ? "mse"
          : null,
      );
    }
    // Safety follow-up: some browsers finalize media attachment one frame later.
    if (action.safetyKickDelayMs > 0) {
      this._setTimer(
        () => host._kickLiveIfStale(true),
        action.safetyKickDelayMs,
      );
    }
  }
}

export function getLiveRecoveryController(host) {
  if (host._liveRecoveryController instanceof LiveRecoveryController) {
    return host._liveRecoveryController;
  }
  const controller = new LiveRecoveryController(host);
  host._liveRecoveryController = controller;
  return controller;
}
