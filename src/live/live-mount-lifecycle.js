export const beginMountTracking = ({
  mountSeq,
  entity,
  nowMs = Date.now(),
}) => {
  const mountToken = Number(mountSeq || 0) + 1;
  return {
    mountToken,
    nextState: {
      mountSeq: mountToken,
      mountInProgress: true,
      mountStartedAt: nowMs,
      mountTargetEntity: entity || "",
    },
  };
};

export const clearMountTrackingIfCurrent = ({
  mountSeq,
  mountToken,
  mountInProgress,
  mountStartedAt,
  mountTargetEntity,
}) => {
  if (mountSeq !== mountToken) {
    return {
      mountSeq,
      mountInProgress,
      mountStartedAt,
      mountTargetEntity,
    };
  }

  return {
    mountSeq,
    mountInProgress: false,
    mountStartedAt: 0,
    mountTargetEntity: "",
  };
};

export const invalidateMountTrackingIfActive = ({
  mountSeq,
  mountInProgress,
  mountStartedAt,
  mountTargetEntity,
}) => {
  if (!mountInProgress) {
    return {
      mountSeq,
      mountInProgress,
      mountStartedAt,
      mountTargetEntity,
    };
  }

  return {
    mountSeq: Number(mountSeq || 0) + 1,
    mountInProgress: false,
    mountStartedAt: 0,
    mountTargetEntity: "",
  };
};

export const shouldRunMountWatchdog = ({
  mountInProgress,
  mountSeq,
  mountToken,
}) => mountInProgress === true && mountSeq === mountToken;

export const applyMountWatchdogTimeout = ({ mountSeq }) => ({
  mountSeq: Number(mountSeq || 0) + 1,
  mountInProgress: false,
  mountStartedAt: 0,
  mountTargetEntity: "",
});

export const resolveLiveResumeAction = ({
  started,
  hass,
  config,
  previewPageActive,
  visible,
  popupOpen,
  mountSeq,
  mountInProgress,
  mountStartedAt,
  mountTargetEntity,
  nowMs = Date.now(),
  stuckThresholdMs = 12000,
  retryDelayMs = 450,
  safetyKickDelayMs = 900,
}) => {
  if (!started || !hass || !config || previewPageActive) {
    return {
      shouldRetry: false,
      shouldKickNow: false,
      shouldRevealEngineWrap: false,
      retryDelayMs: 0,
      safetyKickDelayMs: 0,
      nextMountState: null,
    };
  }

  let nextMountState = null;
  let nextMountInProgress = mountInProgress;
  const mountStuckMs = mountStartedAt ? nowMs - mountStartedAt : 0;

  if (mountInProgress && mountStuckMs > stuckThresholdMs) {
    nextMountState = invalidateMountTrackingIfActive({
      mountSeq,
      mountInProgress,
      mountStartedAt,
      mountTargetEntity,
    });
    nextMountInProgress = nextMountState.mountInProgress;
  }

  if (!visible || popupOpen || nextMountInProgress) {
    return {
      shouldRetry: true,
      shouldKickNow: false,
      shouldRevealEngineWrap: false,
      retryDelayMs,
      safetyKickDelayMs: 0,
      nextMountState,
    };
  }

  return {
    shouldRetry: false,
    shouldKickNow: true,
    shouldRevealEngineWrap: true,
    retryDelayMs: 0,
    safetyKickDelayMs,
    nextMountState,
  };
};

export const isLiveVideoStale = ({
  readyState = 0,
  ended = false,
  paused = false,
  currentTime = 0,
  decodedFrames = 0,
} = {}) => {
  const hasFrames =
    (Number(currentTime) || 0) > 0.05 || (Number(decodedFrames) || 0) > 0;
  return (
    Boolean(ended) || Number(readyState) < 2 || (Boolean(paused) && hasFrames)
  );
};

export const resolveLiveKickIfStaleAction = ({
  started,
  hass,
  config,
  previewPageActive,
  viewMode,
  visible,
  popupOpen,
  mountInProgress,
  force = false,
  streamLoadingVisible = false,
  lastLiveKick = 0,
  nowMs = Date.now(),
  isFirefox = false,
  mseConnectAt = 0,
  mseLastChunkAt = 0,
  hasVideo = false,
  videoState = null,
  kickCooldownMs = 4000,
  mseConnectGraceMs = 12000,
  mseChunkGraceMs = 3500,
}) => {
  if (!started || !hass || !config || previewPageActive) {
    return { shouldKick: false, nextLastLiveKick: lastLiveKick };
  }
  if (viewMode === "grid" || !visible || popupOpen || mountInProgress) {
    return { shouldKick: false, nextLastLiveKick: lastLiveKick };
  }
  if (!force && streamLoadingVisible) {
    return { shouldKick: false, nextLastLiveKick: lastLiveKick };
  }
  if (!force && nowMs - lastLiveKick < kickCooldownMs) {
    return { shouldKick: false, nextLastLiveKick: lastLiveKick };
  }

  const recentMseTraffic =
    isFirefox &&
    (nowMs - Number(mseConnectAt || 0) < mseConnectGraceMs ||
      nowMs - Number(mseLastChunkAt || 0) < mseChunkGraceMs);
  if (recentMseTraffic) {
    return { shouldKick: false, nextLastLiveKick: lastLiveKick };
  }

  const stale = !hasVideo || isLiveVideoStale(videoState || {});
  return {
    shouldKick: stale,
    nextLastLiveKick: stale ? nowMs : lastLiveKick,
  };
};

export const resolveLiveMountEntryAction = ({
  hasSlot,
  previewPageActive,
  viewMode,
  gridModeAvailable,
  entity,
  mountInProgress,
  mountTargetEntity,
}) => {
  if (!hasSlot) {
    return { type: "missing-slot" };
  }
  if (previewPageActive) {
    return { type: "preview" };
  }
  if (viewMode === "grid" && gridModeAvailable) {
    return { type: "grid" };
  }
  if (!entity) {
    return { type: "missing-entity" };
  }
  if (mountInProgress && mountTargetEntity === entity) {
    return { type: "duplicate" };
  }
  return {
    type: "proceed",
    entity,
  };
};

export const resolveLiveMountUiState = ({ quiet = false } = {}) => {
  if (quiet) {
    return {
      activeStreamType: null,
      fallbackVisible: false,
      refreshFallbackImage: false,
      loading: false,
    };
  }

  return {
    activeStreamType: "--",
    fallbackVisible: true,
    refreshFallbackImage: true,
    loading: true,
  };
};

export const resolveLiveMountTransportPlan = ({
  useGo2Rtc,
  forcedType,
  preferredStreamType,
}) => {
  if (useGo2Rtc) {
    return {
      mode: "go2rtc",
      streamType: null,
    };
  }

  return {
    mode: "ha-direct",
    streamType: forcedType || preferredStreamType,
  };
};
