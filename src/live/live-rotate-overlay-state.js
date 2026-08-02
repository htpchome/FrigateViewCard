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
