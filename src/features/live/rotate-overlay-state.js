export const resolveRotateOverlayPresentation = ({
  isMobileTabletViewport = false,
  isLandscapeViewport = false,
  popupOpen = false,
  popupMediaVisible = false,
  manualOrientation = "auto",
  manualOrientationTarget = "none",
}) => {
  const surfaceMode = popupMediaVisible
    ? "popup"
    : popupOpen
      ? "none"
      : "live";
  const physicalOrientation = isLandscapeViewport
    ? "landscape"
    : "portrait";
  const manualApplies =
    manualOrientationTarget === surfaceMode &&
    ["landscape", "portrait"].includes(manualOrientation);
  const orientation = manualApplies
    ? manualOrientation
    : physicalOrientation;
  const swapped = orientation !== physicalOrientation;
  const active = Boolean(
    isMobileTabletViewport &&
      surfaceMode !== "none" &&
      (isLandscapeViewport || swapped),
  );
  return {
    active,
    mode: active ? surfaceMode : "none",
    orientation,
    physicalOrientation,
    surfaceMode,
    swapped,
  };
};

export const resolveRotateOverlayTargetMode = (options = {}) => {
  return resolveRotateOverlayPresentation(options).mode;
};

export const resolveRotateOverlayState = ({
  isMobileTabletViewport = false,
  isLandscapeViewport = false,
  popupOpen = false,
  popupMediaVisible = false,
  manualOrientation = "auto",
  manualOrientationTarget = "none",
  currentMode = "none",
  isActive = false,
}) => {
  const presentation = resolveRotateOverlayPresentation({
    isMobileTabletViewport,
    isLandscapeViewport,
    popupOpen,
    popupMediaVisible,
    manualOrientation,
    manualOrientationTarget,
  });
  const nextMode = presentation.mode;

  if (nextMode === "live") {
    return {
      action: "activate-live",
      active: true,
      fromPopup: currentMode === "popup",
      mode: "live",
      nextMode,
      orientation: presentation.orientation,
      swapped: presentation.swapped,
    };
  }

  if (nextMode === "popup") {
    return {
      action: "activate-popup",
      active: true,
      fromLive: currentMode === "live",
      mode: "popup",
      nextMode,
      orientation: presentation.orientation,
      swapped: presentation.swapped,
    };
  }

  if (!isActive) {
    return {
      action: "idle",
      active: false,
      mode: "none",
      nextMode,
      orientation: presentation.orientation,
      swapped: presentation.swapped,
    };
  }

  return {
    action: "deactivate",
    active: false,
    exitMode: currentMode,
    mode: "none",
    nextMode,
    orientation: presentation.orientation,
    swapped: presentation.swapped,
  };
};

export const resolveFullscreenButtonVisibility = ({
  popupOpen = false,
  isFullscreen = false,
  inGridMode = false,
  rotateOverlayMode = "none",
}) => {
  const popupRotateActive = rotateOverlayMode === "popup";
  return {
    liveButtonHidden: Boolean(
      popupOpen || isFullscreen || inGridMode || popupRotateActive,
    ),
    popupControlsFullscreenHidden: Boolean(
      isFullscreen || popupRotateActive,
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
  if (action !== "deactivate") {
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
    delayMs: 260,
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
    centerLeftPx: `${offsetLeft + width / 2}px`,
    centerTopPx: `${offsetTop + height / 2}px`,
  };
};
