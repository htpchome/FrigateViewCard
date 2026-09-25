import {
  MSE_SWITCH_GRACE_MAX,
  MSE_SWITCH_GRACE_MS,
} from "../../constants.js";
import { buildEditorLiveHandoffKey } from "../editor-preview/context.ctrl.js";
import { attachContainedVideoFit } from "../../shared/media/video-fit.js";
import {
  createEditorLiveHandoffController,
  createLiveMountController,
} from "./mount-controller.js";
import { createMseGraceController } from "./mse-grace-controller.js";

const DEFAULT_FACTORIES = Object.freeze({
  createMseGraceController,
  createEditorLiveHandoffController,
  createLiveMountController,
});

export const createLiveLifecycleControllers = (
  card,
  {
    factories = DEFAULT_FACTORIES,
    windowTarget = window,
  } = {},
) => {
  const resolvedFactories = { ...DEFAULT_FACTORIES, ...factories };
  const mseGraceController = resolvedFactories.createMseGraceController({
    graceMs: MSE_SWITCH_GRACE_MS,
    graceMax: MSE_SWITCH_GRACE_MAX,
    getShadowRoot: () => card.shadowRoot,
    getScopeKey: () => card,
    getPendingMountDestroyers: () => card._pendingMountDestroyers || [],
    setPendingMountDestroyers: (pendingDestroyers) => {
      card._pendingMountDestroyers = pendingDestroyers;
    },
    getPendingWebRtcTakeoverTimer: () => card._pendingWebRTCTakeoverTimer,
    setPendingWebRtcTakeoverTimer: (timer) => {
      card._pendingWebRTCTakeoverTimer = timer;
    },
    clearRotateOverlayAudioSync: () => card._clearRotateOverlayAudioSync(),
    clearRotateVideoFullscreenStyle: () =>
      card._clearRotateVideoFullscreenStyle(),
    getEngine: () => card._engine,
    setEngine: (engine, options) => card._assignLiveEngine(engine, options),
    getActiveStreamType: () => card._activeStreamType,
    getStreamMuted: () => card._streamMuted,
    setEngineMountedMuted: (muted) => {
      card._engineMountedMuted = muted;
    },
    getRotateOverlayActive: () => card._rotateOverlayActive,
    attachVideoFit: attachContainedVideoFit,
    setActiveStreamType: (type) => card._setActiveStreamType(type),
    setStreamLoading: (loading) => card._setStreamLoading(loading),
    setStreamFallbackVisible: (visible) =>
      card._setStreamFallbackVisible(visible),
    setLiveNativeControls: (enabled) => card._setLiveNativeControls(enabled),
    releaseHaDirectEngine: (engine) =>
      card._haDirectMounter?.release?.(engine),
    adoptHaDirectWebRtcEngine: (engine) =>
      card._haDirectMounter?.adoptRetainedWebRtcEngine?.(engine),
    scheduleResumeLive: (reason) => card._scheduleResumeLive(reason),
    resetMseDiagnostics: (connectedAt) => {
      card._mseConnectAt = connectedAt;
      card._mseLastChunkAt = 0;
      card._mseChunkCount = 0;
    },
    markMseChunk: (chunkAt) => {
      card._mseLastChunkAt = chunkAt;
      card._mseChunkCount += 1;
    },
  });
  const editorLiveHandoffController =
    resolvedFactories.createEditorLiveHandoffController({
      getState: () => {
        const entity =
          card._activeGroupMemberOverride || card._activeCam?.entity || "";
        return {
          activeStreamType: card._currentLiveStreamHint(),
          engine: card._engine,
          entity,
          hasSlot: Boolean(card._$("#engine")),
          hostConnected: card.isConnected === true,
          mountInProgress: card._mountInProgress,
          previewPageActive: card._isPreviewPageActive(),
          started: card._started,
          twoWayTalkActive: Boolean(
            card._twoWayTalkStarting || card._twoWayTalkSession,
          ),
          useGo2Rtc: card._shouldUseGo2RtcForEntity(entity),
          viewMode: card._viewMode,
        };
      },
      getContext: () => card._editorPreviewController.liveHandoffContext(),
      getIdentityKey: (entity) =>
        buildEditorLiveHandoffKey({
          connectionType: card._cameraConnectionType(entity),
          entity,
          pathname: windowTarget.location?.pathname || "",
        }),
      isEditorLifecycleActive: () =>
        card._editorPreviewController.isEditorLifecycleActive(),
      requestHandoff: (request) =>
        card._editorPreviewController.requestLiveHandoff(request),
      isEngineReusable: (engine, streamType, connectionType) =>
        connectionType === "ha_direct"
          ? mseGraceController.isHaDirectEngineReusable(engine)
          : streamType === "mse"
            ? mseGraceController.isMseEngineReusable(engine)
            : mseGraceController.isWebRtcEngineReusable(engine),
      detachEngine: (engine, _streamType, connectionType) => {
        if (
          connectionType === "ha_direct" &&
          card._haDirectMounter?.detachWebRtcForHandoff?.(engine) !== true
        ) {
          return false;
        }
        card._assignLiveEngine(null, { retainPrevious: true });
        return true;
      },
      setStreamLoading: (loading) => card._setStreamLoading(loading),
      setStreamFallbackVisible: (visible, refreshImage = false) =>
        card._setStreamFallbackVisible(visible, refreshImage),
      scheduleResumeLive: (reason) => card._scheduleResumeLive(reason),
      adoptEngine: (engine, streamType, connectionType) => {
        const slot = card._$("#engine");
        if (!slot) return false;
        const adopted =
          connectionType === "ha_direct"
            ? mseGraceController.adoptGraceHaDirectEngine(slot, engine)
            : streamType === "mse"
              ? mseGraceController.adoptGraceMseEngine(slot, engine)
              : mseGraceController.adoptGraceWebRtcEngine(slot, engine);
        if (adopted) card._dashboardLiveGraceActive = false;
        return adopted;
      },
      syncLivePresentation: () => card._cameraGroupLiveController?.sync?.(),
    });
  const liveMountController = resolvedFactories.createLiveMountController({
    getSlot: () => card.shadowRoot.querySelector("#engine"),
    isPreviewPageActive: () => card._isPreviewPageActive(),
    getViewMode: () => card._viewMode,
    isGridModeAvailable: () => card._isGridModeAvailable(),
    getMountInProgress: () => card._mountInProgress,
    getMountTargetEntity: () => card._mountTargetEntity,
    getMountState: () => ({
      mountSeq: card._mountSeq,
      mountInProgress: card._mountInProgress,
      mountStartedAt: card._mountStartedAt,
      mountTargetEntity: card._mountTargetEntity,
    }),
    applyMountTrackingState: (nextState) =>
      card._applyMountTrackingState(nextState),
    mountGridEngine: () =>
      card._gridMediaController.mountGridEngine(card._$("#grid-engine")),
    cleanupEngine: () => card._cleanupEngine(),
    getStreamMuted: () => card._streamMuted,
    setEngineMountedMuted: (muted) => {
      card._engineMountedMuted = muted;
    },
    mseGraceController,
    getMountSeq: () => card._mountSeq,
    getPendingMountDestroyers: () => card._pendingMountDestroyers,
    setPendingMountDestroyers: (pendingDestroyers) => {
      card._pendingMountDestroyers = pendingDestroyers;
    },
    haDirectMounter: card._haDirectMounter,
    haDirectTwoWayTalkMounter: card._haDirectTwoWayTalkMounter,
    go2rtcRaceMounter: card._go2rtcRaceMounter,
    preferredStreamType: () => card._preferredStreamType(),
    setActiveStreamType: (type) => card._setActiveStreamType(type),
    setStreamLoading: (loading) => card._setStreamLoading(loading),
    setStreamFallbackVisible: (visible, refreshImage = false) =>
      card._setStreamFallbackVisible(visible, refreshImage),
    scheduleResumeLive: (reason) => card._scheduleResumeLive(reason),
    resolveUseGo2Rtc: (entity) => card._shouldUseGo2RtcForEntity(entity),
    takeEditorLiveHandoff: ({ entity, streamType, connectionType }) =>
      editorLiveHandoffController.take(entity, streamType, connectionType),
  });

  return {
    _mseGraceController: mseGraceController,
    _editorLiveHandoffController: editorLiveHandoffController,
    _liveMountController: liveMountController,
  };
};
