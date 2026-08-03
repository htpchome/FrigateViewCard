export const resolveRotateOverlayTargetMode = ({
  isMobileTabletViewport = false,
  isLandscapeViewport = false,
  popupOpen = false,
  popupMediaVisible = false,
}) => {
  const rotateEligible = Boolean(isMobileTabletViewport && isLandscapeViewport);
  if (!rotateEligible) return "none";
  if (popupMediaVisible) return "popup";
  if (!popupOpen) return "live";
  return "none";
};

export const resolveRotateOverlayState = ({
  isMobileTabletViewport = false,
  isLandscapeViewport = false,
  popupOpen = false,
  popupMediaVisible = false,
  currentMode = "none",
  isActive = false,
}) => {
  const nextMode = resolveRotateOverlayTargetMode({
    isMobileTabletViewport,
    isLandscapeViewport,
    popupOpen,
    popupMediaVisible,
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
  rotateOverlayMode = "none",
  suppressPopupButton = false,
}) => {
  const popupRotateActive = rotateOverlayMode === "popup";
  return {
    liveButtonHidden: Boolean(
      popupOpen || isFullscreen || inGridMode || popupRotateActive,
    ),
    popupButtonHidden: Boolean(
      isFullscreen || popupRotateActive || suppressPopupButton,
    ),
    popupControlsFullscreenHidden: Boolean(popupRotateActive),
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
      disableNativeControls: Boolean(fromPopup),
      enableNativeControls: true,
      clearLiveControlsVisible: false,
      clearLoading: true,
      syncFullscreenButtons: true,
      showLiveControls: true,
      showPopupControls: true,
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
  };
};

export const resolveRotateOverlayExitPlan = ({ action = "idle" } = {}) => {
  if (action !== "deactivate") {
    return {
      shouldSchedule: false,
      delayMs: 0,
      removeClasses: [],
      syncFullscreenButtons: false,
    };
  }

  return {
    shouldSchedule: true,
    delayMs: 260,
    removeClasses: ["mobile-rotate-live-exit", "mobile-rotate-popup-exit"],
    syncFullscreenButtons: true,
  };
};

export const resolveRotateOverlayNativeControlsPlan = ({
  enabled = false,
}) => ({
  expectedActive: Boolean(enabled),
  clearAudioSyncFirst: !enabled,
  clearFullscreenStyleFirst: !enabled,
  applyFullscreenStyle: Boolean(enabled),
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
