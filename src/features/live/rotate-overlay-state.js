export const resolveRotateOverlayTargetMode = ({
  rotateEnabled = true,
  isMobileTabletViewport = false,
  isLandscapeViewport = false,
  popupOpen = false,
  popupMediaVisible = false,
  fullscreenActive = false,
}) => {
  if (!rotateEnabled) return "none";
  if (fullscreenActive) return "none";
  const rotateEligible = Boolean(
    isMobileTabletViewport && isLandscapeViewport,
  );
  if (!rotateEligible) return "none";
  if (popupMediaVisible) return "popup";
  if (!popupOpen) return "live";
  return "none";
};

export const resolveRotateOverlayState = ({
  rotateEnabled = true,
  isMobileTabletViewport = false,
  isLandscapeViewport = false,
  popupOpen = false,
  popupMediaVisible = false,
  fullscreenActive = false,
  currentMode = "none",
  isActive = false,
  isExitPending = false,
}) => {
  const nextMode = resolveRotateOverlayTargetMode({
    rotateEnabled,
    isMobileTabletViewport,
    isLandscapeViewport,
    popupOpen,
    popupMediaVisible,
    fullscreenActive,
  });

  if (nextMode === "live") {
    return {
      action: "activate-live",
      active: true,
      fromPopup: currentMode === "popup",
      mode: "live",
      nextMode,
    };
  }

  if (nextMode === "popup") {
    return {
      action: "activate-popup",
      active: true,
      fromLive: currentMode === "live",
      mode: "popup",
      nextMode,
    };
  }

  if (!isActive) {
    if (isExitPending) {
      return {
        action: "continue-exit",
        active: false,
        mode: "none",
        nextMode,
      };
    }
    return {
      action: "idle",
      active: false,
      mode: "none",
      nextMode,
    };
  }

  return {
    action: "deactivate",
    active: false,
    exitMode: currentMode,
    mode: "none",
    nextMode,
  };
};

export const resolveFullscreenButtonVisibility = ({
  popupOpen = false,
  isFullscreen = false,
  inGridMode = false,
  isMobileTabletViewport = false,
  showLiveFullscreenOnMobile = false,
}) => {
  return {
    liveButtonHidden: Boolean(
      (isMobileTabletViewport && !showLiveFullscreenOnMobile) ||
        popupOpen ||
        isFullscreen ||
        inGridMode,
    ),
    popupControlsFullscreenHidden: Boolean(
      isMobileTabletViewport || isFullscreen,
    ),
    popupMobileFullscreenHidden: Boolean(
      !isMobileTabletViewport || isFullscreen,
    ),
  };
};

export const resolveRotateOverlayUiPlan = ({
  action = "idle",
  mode = "none",
  active = false,
  fromPopup = false,
  fromLive = false,
  exitMode = "none",
}) => {
  if (action === "activate-live") {
    return {
      active,
      mode,
      removeClasses: [
        "mobile-rotate-live-exit",
        "mobile-rotate-popup",
        "mobile-rotate-popup-exit",
      ],
      addClasses: ["mobile-rotate-live"],
      disableNativeControls: true,
      enableNativeControls: false,
      clearLiveControlsVisible: false,
      clearLoading: true,
      syncFullscreenButtons: true,
      showLiveControls: false,
      showPopupControls: true,
      retainViewportCover: true,
    };
  }

  if (action === "activate-popup") {
    return {
      active,
      mode,
      removeClasses: [
        "mobile-rotate-popup-exit",
        "mobile-rotate-live",
        "mobile-rotate-live-exit",
      ],
      addClasses: ["mobile-rotate-popup"],
      disableNativeControls: Boolean(fromLive),
      enableNativeControls: false,
      clearLiveControlsVisible: true,
      clearLoading: false,
      syncFullscreenButtons: true,
      showLiveControls: false,
      showPopupControls: true,
      retainViewportCover: true,
    };
  }

  if (action === "idle") {
    return {
      active,
      mode,
      removeClasses: [
        "mobile-rotate-live",
        "mobile-rotate-live-exit",
        "mobile-rotate-popup",
        "mobile-rotate-popup-exit",
      ],
      addClasses: [],
      disableNativeControls: false,
      enableNativeControls: false,
      clearLiveControlsVisible: true,
      clearLoading: false,
      syncFullscreenButtons: false,
      showLiveControls: false,
      showPopupControls: false,
      retainViewportCover: false,
    };
  }

  return {
    active,
    mode,
    removeClasses: ["mobile-rotate-live", "mobile-rotate-popup"],
    addClasses: [
      exitMode === "popup"
        ? "mobile-rotate-popup-exit"
        : "mobile-rotate-live-exit",
    ],
    disableNativeControls: exitMode === "live",
    enableNativeControls: false,
    clearLiveControlsVisible: false,
    clearLoading: false,
    syncFullscreenButtons: true,
    showLiveControls: false,
    showPopupControls: true,
    retainViewportCover: true,
  };
};

export const resolveRotateOverlayExitPlan = ({ action = "idle" } = {}) => {
  if (action !== "deactivate" && action !== "continue-exit") {
    return {
      shouldSchedule: false,
      delayMs: 0,
      removeClasses: [],
      syncFullscreenButtons: false,
      releaseViewportCover: false,
    };
  }

  return {
    shouldSchedule: true,
    delayMs: 320,
    removeClasses: ["mobile-rotate-live-exit", "mobile-rotate-popup-exit"],
    syncFullscreenButtons: true,
    releaseViewportCover: true,
  };
};

export const resolveRotateOverlayNativeControlsPlan = ({
  enabled = false,
  applyFullscreenStyle = enabled,
}) => ({
  expectedActive: Boolean(enabled),
  clearAudioSyncFirst: !enabled,
  clearFullscreenStyleFirst: !applyFullscreenStyle,
  applyFullscreenStyle: Boolean(applyFullscreenStyle),
  bindAudioSync: Boolean(enabled),
  retryDelaysMs: [120, 420, 900],
});

export const resolveRotateOverlayViewportVariables = ({
  visualViewport = null,
  innerWidth = 0,
  innerHeight = 0,
}) => {
  const width = Math.max(
    1,
    Math.round(visualViewport?.width || innerWidth || 0),
  );
  const height = Math.max(
    1,
    Math.round(visualViewport?.height || innerHeight || 0),
  );
  const offsetLeft = Math.round(visualViewport?.offsetLeft || 0);
  const offsetTop = Math.round(visualViewport?.offsetTop || 0);
  return {
    widthPx: `${width}px`,
    heightPx: `${height}px`,
    offsetLeftPx: `${offsetLeft}px`,
    offsetTopPx: `${offsetTop}px`,
  };
};

export const resolveRotateOverlayVideoStyles = ({
  useStageViewport = false,
  visualViewport = null,
  innerWidth = 0,
  innerHeight = 0,
} = {}) => {
  if (useStageViewport) {
    return {
      "object-fit": "contain",
      "object-position": "center center",
      background: "var(--c-bg-deep)",
      margin: "0",
    };
  }

  const viewport = resolveRotateOverlayViewportVariables({
    visualViewport,
    innerWidth,
    innerHeight,
  });
  return {
    position: "fixed",
    top: viewport.offsetTopPx,
    left: viewport.offsetLeftPx,
    width: viewport.widthPx,
    height: viewport.heightPx,
    "max-width": "none",
    "max-height": "none",
    "z-index": "1402",
    "object-fit": "contain",
    background: "var(--c-bg-deep)",
    transform: "none",
    margin: "0",
  };
};
