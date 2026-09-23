import { DEFAULT_CAMERA_CONNECTION_TYPE } from "../../constants.js";
import {
  DEVICE_PROFILE,
  mkCamState,
  normalizeCameraConnectionType,
} from "../../helpers.js";
import { createGo2RtcResolver } from "../../integrations/frigate/go2rtc-resolver.js";
import { createHaDirectTwoWayTalkBackchannel } from "../../integrations/home-assistant/two-way-talk-backchannel.js";
import { createHaDirectTwoWayTalkMounter } from "../../integrations/home-assistant/two-way-talk-mounter.js";
import { createGo2RtcTwoWayTalkBackchannel } from "../two-way-talk/go2rtc-backchannel.js";
import { createGo2RtcMounter } from "./go2rtc-mounter.js";
import { createGo2RtcRaceMounter } from "./go2rtc-race-mounter.js";
import { createHaDirectMounter } from "./ha-direct-mounter.js";
import {
  adoptMountedAttemptResult,
  isMountTokenCurrent,
} from "./mount-result.js";

const DEFAULT_FACTORIES = Object.freeze({
  createGo2RtcResolver,
  createGo2RtcTwoWayTalkBackchannel,
  createGo2RtcMounter,
  createHaDirectMounter,
  createHaDirectTwoWayTalkMounter,
  createHaDirectTwoWayTalkBackchannel,
  createGo2RtcRaceMounter,
});

export const createLiveTransportControllers = (
  card,
  {
    deviceProfile = DEVICE_PROFILE,
    factories = DEFAULT_FACTORIES,
  } = {},
) => {
  const resolvedFactories = { ...DEFAULT_FACTORIES, ...factories };
  const go2rtcResolver = resolvedFactories.createGo2RtcResolver({
    getHass: () => card._hass,
    getConfig: () => card._config,
    getActiveEntity: () => card._activeCam?.entity || "",
    getCamCache: () => card._camCache,
    defaultConnectionType: DEFAULT_CAMERA_CONNECTION_TYPE,
    normalizeCameraConnectionType,
    createCameraState: mkCamState,
    discoverEntity: async (entity) => {
      await card._discoverOne(entity);
    },
    supportsNativeHlsPlayback: () => card._supportsNativeHlsPlayback(),
  });
  const go2rtcTwoWayTalkBackchannel =
    resolvedFactories.createGo2RtcTwoWayTalkBackchannel({
      resolveWebSocketUrl: (entity) =>
        go2rtcResolver.websocketUrlForEntity(entity),
    });
  const go2rtcMounter = resolvedFactories.createGo2RtcMounter({
    resolver: go2rtcResolver,
    getStreamMuted: () => card._streamMuted,
    waitForStreamStart: (streamEl, timeoutMs, options) =>
      card._waitForStreamStart(streamEl, timeoutMs, options),
    attachVideoFit: (streamEl) => card._attachVideoFit(streamEl),
    assignCommittedEngine: (engine) => card._assignLiveEngine(engine),
    onCommittedStream: (type) => {
      card._setActiveStreamType(type);
      card._setStreamLoading(false);
      card._setStreamFallbackVisible(false);
    },
    scheduleResumeLive: (reason) => card._scheduleResumeLive(reason),
    isFirefox: () => card._isFirefox(),
    scopeKey: card,
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
  const haDirectMounter = resolvedFactories.createHaDirectMounter({
    getHass: () => card._hass,
    getPreferredStreamType: () => card._preferredStreamType(),
    getStreamMuted: () => card._streamMuted,
    getRotateOverlayActive: () => card._rotateOverlayActive,
    isCurrentEngine: (streamEl) => card._engine === streamEl,
    waitForStreamStart: (streamEl, timeoutMs, options) =>
      card._waitForStreamStart(streamEl, timeoutMs, options),
    assignCommittedEngine: (engine, options) =>
      card._assignLiveEngine(engine, options),
    onCommittedMediaReady: (engine, video) => {
      const liveEngineHost = card._$("#engine");
      card._attachMainLiveVideoZoom(engine, video, {
        host: liveEngineHost,
        interactionTarget: liveEngineHost,
      });
    },
    onCommittedStream: (type) => {
      card._setActiveStreamType(type);
      card._setStreamLoading(false);
      card._setStreamFallbackVisible(false);
    },
    applyResolvedStreamUiState: (streamState) =>
      card._applyResolvedStreamUiState(streamState),
    setLiveNativeControls: (enabled) => card._setLiveNativeControls(enabled),
    scheduleResumeLive: (reason) => card._scheduleResumeLive(reason),
    scopeKey: card,
  });
  const haDirectTwoWayTalkMounter =
    resolvedFactories.createHaDirectTwoWayTalkMounter({
      getHass: () => card._hass,
      getStreamMuted: () => card._streamMuted,
      waitForStreamStart: (streamEl, timeoutMs, options) =>
        card._waitForStreamStart(streamEl, timeoutMs, options),
      attachVideoFit: (streamEl) => card._attachVideoFit(streamEl),
      assignCommittedEngine: (engine) => card._assignLiveEngine(engine),
      onCommittedStream: (type) => {
        card._setActiveStreamType(type);
        card._setStreamLoading(false);
        card._setStreamFallbackVisible(false);
      },
      scheduleResumeLive: (reason) => card._scheduleResumeLive(reason),
      scopeKey: card,
  });
  const haDirectTwoWayTalkBackchannel =
    resolvedFactories.createHaDirectTwoWayTalkBackchannel({
      getHass: () => card._hass,
      mountIncomingAudio: (audio) => {
        if (!audio || !card.shadowRoot) return null;
        audio.dataset.fvcTwoWayTalkAudio = "";
        card.shadowRoot.appendChild(audio);
        return () => audio.remove?.();
      },
    });
  const go2rtcRaceMounter = resolvedFactories.createGo2RtcRaceMounter({
    mounter: go2rtcMounter,
    isMobile: deviceProfile.isMobile,
    resolveConnectionType: (entity) => card._cameraConnectionType(entity),
    getPendingMountDestroyers: () => card._pendingMountDestroyers || [],
    setPendingMountDestroyers: (pendingDestroyers) => {
      card._pendingMountDestroyers = pendingDestroyers;
    },
    isMountTokenCurrent: (mountToken) =>
      isMountTokenCurrent({ mountToken, mountSeq: card._mountSeq }),
    adoptMountedAttempt: (slot, winner, options = {}) =>
      adoptMountedAttemptResult({
        targetSlot: slot,
        result: winner,
        preservePendingSlots: options.preservePendingSlots === true,
        streamMuted: card._streamMuted,
        rotateOverlayActive: card._rotateOverlayActive,
        assignEngine: (engine) => card._assignLiveEngine(engine),
        setEngineMountedMuted: (muted) => {
          card._engineMountedMuted = muted;
        },
        setActiveStreamType: (type) => card._setActiveStreamType(type),
        setStreamLoading: (loading) => card._setStreamLoading(loading),
        setStreamFallbackVisible: (visible) =>
          card._setStreamFallbackVisible(visible),
        setLiveNativeControls: (enabled) =>
          card._setLiveNativeControls(enabled),
      }),
    waitForStreamStart: (streamEl, timeoutMs, options) =>
      card._waitForStreamStart(streamEl, timeoutMs, options),
    isCurrentWinnerEngine: (engine) => card._engine === engine,
    getPendingWebRtcTakeoverTimer: () => card._pendingWebRTCTakeoverTimer,
    setPendingWebRtcTakeoverTimer: (timer) => {
      card._pendingWebRTCTakeoverTimer = timer;
    },
  });

  return {
    _go2rtcResolver: go2rtcResolver,
    _go2rtcTwoWayTalkBackchannel: go2rtcTwoWayTalkBackchannel,
    _go2rtcMounter: go2rtcMounter,
    _haDirectMounter: haDirectMounter,
    _haDirectTwoWayTalkMounter: haDirectTwoWayTalkMounter,
    _haDirectTwoWayTalkBackchannel: haDirectTwoWayTalkBackchannel,
    _go2rtcRaceMounter: go2rtcRaceMounter,
  };
};
