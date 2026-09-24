import { DEVICE_PROFILE } from "../../helpers.js";
import {
  resolveRotateOverlayExitPlan,
  resolveRotateOverlayLiveDismissal,
  resolveRotateOverlayNativeControlsPlan,
  resolveRotateOverlayState,
  resolveRotateOverlayUiPlan,
  resolveRotateOverlayVideoStyles,
  resolveRotateOverlayViewportVariables,
} from "./rotate-overlay-state.js";
import {
  MOBILE_VIEW_ACTIVE_CLASS,
  MOBILE_VIEW_ROTATE_COVER_CLASS,
} from "../mobile-view/utils.js";

export class LiveRotateOverlayController {
  constructor(
    host,
    {
      windowTarget = globalThis.window,
      documentTarget = globalThis.document,
      requestFrame = (callback) => globalThis.requestAnimationFrame(callback),
      cancelFrame = (frame) => globalThis.cancelAnimationFrame(frame),
      setTimer = (callback, delay) => globalThis.setTimeout(callback, delay),
      clearTimer = (timer) => globalThis.clearTimeout(timer),
      hasTouch = DEVICE_PROFILE.hasTouch,
    } = {},
  ) {
    this._host = host;
    this._windowTarget = windowTarget;
    this._documentTarget = documentTarget;
    this._requestFrame = requestFrame;
    this._cancelFrame = cancelFrame;
    this._setTimer = setTimer;
    this._clearTimer = clearTimer;
    this._hasTouch = hasTouch;
  }

  applyUiPlan(card, uiPlan) {
    const host = this._host;
    if (!card || !uiPlan) return;
    if (uiPlan.removeClasses.length) {
      card.classList.remove(...uiPlan.removeClasses);
    }
    if (uiPlan.addClasses.length) {
      card.classList.add(...uiPlan.addClasses);
    }
    host.classList.toggle(
      MOBILE_VIEW_ROTATE_COVER_CLASS,
      uiPlan.retainViewportCover,
    );
    host._cardStyleController?.syncBubbleFullscreenEscape?.(
      uiPlan.retainViewportCover,
    );
    host._rotateOverlayActive = uiPlan.active;
    host._rotateOverlayMode = uiPlan.mode;
    host._haNavbarController?.sync?.();
    host._cardViewPageController?.handleRotateOverlayState?.({
      active: uiPlan.active,
      mode: uiPlan.mode,
    });
    if (uiPlan.disableNativeControls) {
      host._setLiveNativeControls(false, {
        applyFullscreenStyle: uiPlan.active && uiPlan.mode === "live",
      });
    }
    host._syncLiveRotateZoomPresentation(card);
    if (uiPlan.clearLiveControlsVisible) {
      host._$("#live-stage")?.classList.remove("live-controls-visible");
    }
    if (uiPlan.clearLoading) host._setStreamLoading(false);
    if (uiPlan.enableNativeControls) host._setLiveNativeControls(true);
    if (uiPlan.syncFullscreenButtons) {
      host._syncFullscreenButtonsVisibility();
    }
    if (uiPlan.showLiveControls) host._showLiveControlsTemporarily();
    if (uiPlan.showPopupControls) {
      host._popupMediaControlsController.showTemporarily();
    }
  }

  clearAudioSync() {
    const host = this._host;
    if (host._rotateOverlaySyncVideo && host._onRotateOverlayVolumeChange) {
      try {
        host._rotateOverlaySyncVideo.removeEventListener(
          "volumechange",
          host._onRotateOverlayVolumeChange,
        );
      } catch (_) {}
    }
    host._rotateOverlaySyncVideo = null;
    host._onRotateOverlayVolumeChange = null;
  }

  clearVideoFullscreenStyle() {
    const host = this._host;
    const video = host._rotateStyledVideo;
    if (!video) return;
    try {
      if (host._rotateStyledVideoCssText) {
        video.setAttribute("style", host._rotateStyledVideoCssText);
      } else {
        video.removeAttribute("style");
      }
    } catch (_) {}
    host._rotateStyledVideo = null;
    host._rotateStyledVideoCssText = "";
  }

  applyVideoFullscreenStyle(video) {
    const host = this._host;
    if (!video) return;
    if (host._rotateStyledVideo !== video) {
      this.clearVideoFullscreenStyle();
      host._rotateStyledVideo = video;
      host._rotateStyledVideoCssText = video.getAttribute("style") || "";
    }
    const card = host._$("#card");
    const forceMobileViewViewportCover =
      card?.classList?.contains("mobile-view-active") &&
      (card.classList.contains("mobile-rotate-live") ||
        card.classList.contains("mobile-rotate-live-exit"));
    const videoStyles = resolveRotateOverlayVideoStyles({
      useStageViewport: forceMobileViewViewportCover,
      visualViewport: this._windowTarget?.visualViewport,
      innerWidth: this._windowTarget?.innerWidth,
      innerHeight: this._windowTarget?.innerHeight,
    });
    for (const [property, value] of Object.entries(videoStyles)) {
      video.style.setProperty(property, value, "important");
    }
    if (host._liveVideoZoomController?.video === video) {
      host._liveVideoZoomController.refresh();
    }
    if (host._popupVideoZoomController?.video === video) {
      host._popupVideoZoomController.refresh();
    }
    video.setAttribute("playsinline", "");
    video.setAttribute("webkit-playsinline", "true");
  }

  bindAudioSync(video) {
    const host = this._host;
    if (!video || host._rotateOverlaySyncVideo === video) return;
    this.clearAudioSync();
    host._rotateOverlaySyncVideo = video;
    host._onRotateOverlayVolumeChange = () => {
      const mutedNow = Boolean(video.muted);
      if (mutedNow === host._streamMuted) return;
      host._applyLiveMuteChange(mutedNow, { source: "native-controls" });
    };
    video.addEventListener("volumechange", host._onRotateOverlayVolumeChange);
  }

  setNativeControls(enabled, { applyFullscreenStyle = enabled } = {}) {
    const host = this._host;
    const controlsPlan = resolveRotateOverlayNativeControlsPlan({
      enabled,
      applyFullscreenStyle,
      rotateOverlayActive: host._rotateOverlayActive,
      rotateOverlayMode: host._rotateOverlayMode,
    });
    const suppressNativeControlsForLiveRotate =
      enabled && !controlsPlan.expectedActive;
    const expected = controlsPlan.expectedActive;
    const apply = () => {
      if (expected && !host._rotateOverlayActive) return;
      if (
        suppressNativeControlsForLiveRotate &&
        (!host._rotateOverlayActive || host._rotateOverlayMode !== "live")
      ) {
        return;
      }
      const engineHost = host._$("#engine");
      const video =
        host._findVideoDeep(engineHost) ||
        host._findVideoDeep(host._engine) ||
        host._engine?.video ||
        null;
      if (!video) return;
      video.controls = expected;
      if (!expected) video.removeAttribute("controls");
      video.setAttribute("playsinline", "");
      video.setAttribute("webkit-playsinline", "true");
      if (controlsPlan.applyFullscreenStyle) {
        host._applyRotateVideoFullscreenStyle(video);
      } else {
        host._clearRotateVideoFullscreenStyle();
      }
      if (controlsPlan.bindAudioSync) host._bindRotateOverlayAudioSync(video);
    };
    if (controlsPlan.clearAudioSyncFirst) {
      host._clearRotateOverlayAudioSync();
    }
    if (controlsPlan.clearFullscreenStyleFirst) {
      host._clearRotateVideoFullscreenStyle();
    }
    apply();
    controlsPlan.retryDelaysMs.forEach((delay) => this._setTimer(apply, delay));
  }

  scheduleUpdate() {
    const host = this._host;
    if (
      !this._hasTouch &&
      !host._rotateOverlayActive &&
      !host._rotateOverlayExitT
    ) {
      return;
    }
    if (host._rotateOverlayRaf) this._cancelFrame(host._rotateOverlayRaf);
    host._rotateOverlayRaf = this._requestFrame(() => {
      host._rotateOverlayRaf = 0;
      host._syncRotateOverlayViewportState();
    });
  }

  syncViewportState() {
    const host = this._host;
    if (
      !this._hasTouch &&
      !host._rotateOverlayActive &&
      !host._rotateOverlayExitT
    ) {
      return;
    }
    const viewportVars = resolveRotateOverlayViewportVariables({
      visualViewport: this._windowTarget?.visualViewport,
      innerWidth: this._windowTarget?.innerWidth,
      innerHeight: this._windowTarget?.innerHeight,
    });
    host.style.setProperty("--rotate-vw", viewportVars.widthPx);
    host.style.setProperty("--rotate-vh", viewportVars.heightPx);
    host.style.setProperty("--rotate-ox", viewportVars.offsetLeftPx);
    host.style.setProperty("--rotate-oy", viewportVars.offsetTopPx);
    host._updateRotateOverlayState();
  }

  setLiveTransitionRect(prefix, rect) {
    if (!rect || rect.width <= 0 || rect.height <= 0) return false;
    const host = this._host;
    host.style.setProperty(`--rotate-live-${prefix}-x`, `${rect.left}px`);
    host.style.setProperty(`--rotate-live-${prefix}-y`, `${rect.top}px`);
    host.style.setProperty(`--rotate-live-${prefix}-w`, `${rect.width}px`);
    host.style.setProperty(`--rotate-live-${prefix}-h`, `${rect.height}px`);
    return true;
  }

  captureLiveEntryRect() {
    return this.setLiveTransitionRect(
      "from",
      this._host._$("#live-stage")?.getBoundingClientRect?.(),
    );
  }

  captureLiveExitRect(card) {
    const host = this._host;
    const stage = host._$("#live-stage");
    if (!card || !stage) return false;
    const hadLiveClass = card.classList.contains("mobile-rotate-live");
    const hadExitClass = card.classList.contains("mobile-rotate-live-exit");
    const hadViewportCover = host.classList.contains(
      MOBILE_VIEW_ROTATE_COVER_CLASS,
    );

    card.classList.remove("mobile-rotate-live", "mobile-rotate-live-exit");
    host.classList.remove(MOBILE_VIEW_ROTATE_COVER_CLASS);
    const targetRect = stage.getBoundingClientRect();
    if (hadViewportCover) host.classList.add(MOBILE_VIEW_ROTATE_COVER_CLASS);
    if (hadLiveClass) card.classList.add("mobile-rotate-live");
    if (hadExitClass) card.classList.add("mobile-rotate-live-exit");

    return this.setLiveTransitionRect("to", targetRect);
  }

  scheduleExitCleanup(exitPlan) {
    const host = this._host;
    host._rotateOverlayExitT = this._setTimer(() => {
      const card = host._$("#card");
      if (card && exitPlan.removeClasses.length) {
        card.classList.remove(...exitPlan.removeClasses);
      }
      host._syncLiveRotateZoomPresentation(card);
      if (exitPlan.releaseViewportCover) {
        host.classList.remove(MOBILE_VIEW_ROTATE_COVER_CLASS);
        host._cardStyleController?.releaseBubbleFullscreenEscape?.();
        host._haNavbarController?.sync?.();
      }
      host._rotateOverlayExitT = null;
      if (host._resumeLiveT) return;
      if (exitPlan.syncFullscreenButtons) {
        host._syncFullscreenButtonsVisibility();
      }
    }, exitPlan.delayMs);
  }

  isEnabled() {
    const host = this._host;
    return (
      host._config?.mobile_view_rotate_to_fullscreen === true &&
      host._isLikelyPhoneClient() &&
      !host._isPreviewContext() &&
      !host._isDashboardEditMode() &&
      !host._isCardEditorDialogOpen()
    );
  }

  isViewportCoverActive() {
    return this._host.classList.contains(MOBILE_VIEW_ROTATE_COVER_CLASS);
  }

  updateState() {
    const host = this._host;
    const card = host._$("#card");
    if (!card) return;
    const popupOpen = host._$("#myPopup")?.classList.contains("is-open");
    const viewer = host._$("#viewer");
    const popupMediaVisible = Boolean(
      popupOpen &&
        viewer &&
        viewer.style.display !== "none" &&
        viewer.childElementCount > 0,
    );
    const fullscreenActive = Boolean(
      this._documentTarget?.fullscreenElement ||
        this._documentTarget?.webkitFullscreenElement ||
        host._liveFullscreenLifecycleController?.active,
    );
    const isLandscapeViewport = host._isLandscapeViewport();
    host._rotateLiveOverlayDismissed = resolveRotateOverlayLiveDismissal({
      dismissed: host._rotateLiveOverlayDismissed,
      isLandscapeViewport,
    });
    const rotateState = resolveRotateOverlayState({
      rotateEnabled: host._isRotateToFullscreenEnabled(),
      isMobileTabletViewport: host._isMobileTabletViewport(),
      isLandscapeViewport,
      popupOpen,
      popupMediaVisible,
      fullscreenActive,
      liveDismissed: host._rotateLiveOverlayDismissed,
      currentMode: host._rotateOverlayMode,
      isActive: host._rotateOverlayActive,
      isExitPending: Boolean(host._rotateOverlayExitT),
    });

    if (rotateState.action === "continue-exit") {
      this._clearTimer(host._rotateOverlayExitT);
      host._rotateOverlayExitT = null;
      host._scheduleRotateOverlayExitCleanup(
        resolveRotateOverlayExitPlan(rotateState),
      );
      return;
    }

    if (host._rotateOverlayExitT) {
      this._clearTimer(host._rotateOverlayExitT);
      host._rotateOverlayExitT = null;
    }

    const mobileViewActivationAlreadyApplied =
      card.classList.contains(MOBILE_VIEW_ACTIVE_CLASS) &&
      ((rotateState.action === "activate-live" &&
        host._rotateOverlayActive &&
        host._rotateOverlayMode === "live" &&
        card.classList.contains("mobile-rotate-live")) ||
        (rotateState.action === "activate-popup" &&
          host._rotateOverlayActive &&
          host._rotateOverlayMode === "popup" &&
          card.classList.contains("mobile-rotate-popup")));
    if (mobileViewActivationAlreadyApplied) return;

    if (rotateState.action === "activate-live") {
      host._captureRotateLiveEntryRect();
    } else if (
      rotateState.action === "deactivate" &&
      rotateState.exitMode === "live"
    ) {
      host._captureRotateLiveExitRect(card);
    }

    const uiPlan = resolveRotateOverlayUiPlan(rotateState);
    host._applyRotateOverlayUiPlan(card, uiPlan);
    const exitPlan = resolveRotateOverlayExitPlan({
      action: rotateState.action,
    });

    if (
      rotateState.action === "activate-live" ||
      rotateState.action === "activate-popup" ||
      rotateState.action === "idle"
    ) {
      return;
    }

    host._scheduleRotateOverlayExitCleanup(exitPlan);
  }

  dismiss() {
    const host = this._host;
    if (!host._rotateOverlayActive || host._rotateOverlayMode !== "live") {
      return false;
    }
    host._rotateLiveOverlayDismissed = true;
    host._updateRotateOverlayState();
    return true;
  }

  dispose() {
    const host = this._host;
    if (host._rotateOverlayRaf) this._cancelFrame(host._rotateOverlayRaf);
    host._rotateOverlayRaf = 0;
    if (host._rotateOverlayExitT) this._clearTimer(host._rotateOverlayExitT);
    host._rotateOverlayExitT = null;
    host._rotateLiveOverlayDismissed = false;
    host.classList?.remove?.(MOBILE_VIEW_ROTATE_COVER_CLASS);
    this.clearAudioSync();
    this.clearVideoFullscreenStyle();
  }
}

export function getLiveRotateOverlayController(host) {
  if (
    host._liveRotateOverlayController instanceof LiveRotateOverlayController
  ) {
    return host._liveRotateOverlayController;
  }
  const controller = new LiveRotateOverlayController(host);
  host._liveRotateOverlayController = controller;
  return controller;
}
