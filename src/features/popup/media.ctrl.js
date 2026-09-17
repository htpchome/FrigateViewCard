import { ICONS } from "../../icons.js";
import {
  buildPopupMediaControlState,
  resolvePopupMediaControlsInitPlan,
  resolvePopupMediaControlsListenerPlan,
  resolvePopupMediaSeekTarget,
  resolvePopupMediaVolumeTarget,
} from "../../shared/media/controls.js";
import { CleanupController } from "../../shared/cleanup.js";
import { MediaOverlayControlsController } from "../../shared/media/overlay-controls.ctrl.js";

const isSpaceKey = (event) =>
  event?.code === "Space" || event?.key === " " || event?.key === "Spacebar";

export class PopupMediaControlsController {
  constructor({
    controls,
    progress,
    volume,
    video,
    listenerPlan,
    onShowNow,
    onShowTemporarily,
    onSync,
  }) {
    this._controls = controls;
    this._progress = progress;
    this._volume = volume;
    this._video = video;
    this._listenerPlan = listenerPlan;
    this._onShowNow = onShowNow;
    this._onShowTemporarily = onShowTemporarily;
    this._onSync = onSync;
    this._cleanup = new CleanupController();
    this._progressDragging = false;
  }

  bind() {
    if (!this._controls || !this._video || !this._listenerPlan) return;

    if (this._progress) {
      this._listenerPlan.progressEvents.forEach(({ type, action, options }) => {
        this._cleanup.addEventListener(
          this._progress,
          type,
          this._progressHandlers[action],
          options,
        );
      });
    }

    if (this._volume) {
      this._listenerPlan.volumeEvents.forEach(({ type, action, options }) => {
        this._cleanup.addEventListener(
          this._volume,
          type,
          this._volumeHandlers[action],
          options,
        );
      });
    }

    this._listenerPlan.controlsEvents.forEach(({ type, action, options }) => {
      this._cleanup.addEventListener(
        this._controls,
        type,
        this._controlsHandlers[action],
        options,
      );
    });

    this._listenerPlan.syncVideoEvents.forEach((type) => {
      this._cleanup.addEventListener(this._video, type, this._sync);
    });

    this._listenerPlan.interactionVideoEvents.forEach(
      ({ type, action, options }) => {
        this._cleanup.addEventListener(
          this._video,
          type,
          this._controlsHandlers[action],
          options,
        );
      },
    );

    this._sync();
  }

  dispose() {
    this._cleanup.dispose();
    this._progressDragging = false;
    this._controls?.classList?.remove("is-hidden");
  }

  _sync = () => {
    this._onSync?.({ progressDragging: this._progressDragging });
  };

  _progressHandlers = {
    scrubPreview: () => {
      this._progressDragging = true;
      const next = resolvePopupMediaSeekTarget({
        progressValue: this._progress?.value,
        duration: this._video?.duration,
      });
      if (next !== null && this._video) {
        this._video.currentTime = next;
      }
      this._onShowTemporarily?.();
      this._sync();
    },
    scrubCommit: () => {
      this._progressDragging = false;
      this._onShowTemporarily?.();
      this._sync();
    },
    dragStart: () => {
      this._progressDragging = true;
      this._onShowNow?.();
    },
    dragEnd: () => {
      this._progressDragging = false;
      this._onShowTemporarily?.();
    },
    touchDragStart: () => {
      this._progressDragging = true;
    },
    touchDragEnd: () => {
      this._progressDragging = false;
      this._onShowTemporarily?.();
    },
  };

  _volumeHandlers = {
    volumeInput: () => {
      const nextVolume = resolvePopupMediaVolumeTarget({
        volumeValue: this._volume?.value,
      });
      if (nextVolume === null || !this._video) return;
      this._video.volume = nextVolume;
      this._video.muted = nextVolume <= 0;
      this._onShowTemporarily?.();
      this._sync();
    },
  };

  _controlsHandlers = {
    showNow: () => {
      this._onShowNow?.();
    },
    showTemporarily: () => {
      this._onShowTemporarily?.();
    },
  };
}

export class PopupMediaControlsSurfaceController {
  constructor({
    query,
    formatTime = () => "0:00",
    shouldUseCustomControls = () => false,
    isAutoHideActive = () => false,
    isMobileTabletViewport = () => false,
    isVideoMediaType = () => false,
    onClearPictureInPicture = () => {},
    onSyncPlaybackTargetButtons = () => {},
    onSyncPictureInPictureButtons = () => {},
    onSyncFullscreenButtons = () => {},
    icons = ICONS,
    documentObj = globalThis.document,
    hideDelayMs = 2200,
    setTimer = globalThis.setTimeout?.bind(globalThis),
    clearTimer = globalThis.clearTimeout?.bind(globalThis),
    createBinding = (options) => new PopupMediaControlsController(options),
    createOverlayControls = (options) =>
      new MediaOverlayControlsController(options),
    t,
  } = {}) {
    this._query = query;
    this._formatTime = formatTime;
    this._shouldUseCustomControls = shouldUseCustomControls;
    this._isAutoHideActive = isAutoHideActive;
    this._isMobileTabletViewport = isMobileTabletViewport;
    this._isVideoMediaType = isVideoMediaType;
    this._onClearPictureInPicture = onClearPictureInPicture;
    this._onSyncPlaybackTargetButtons = onSyncPlaybackTargetButtons;
    this._onSyncPictureInPictureButtons = onSyncPictureInPictureButtons;
    this._onSyncFullscreenButtons = onSyncFullscreenButtons;
    this._icons = icons;
    this._document = documentObj;
    this._hideDelayMs = Math.max(0, Number(hideDelayMs) || 0);
    this._setTimer = setTimer;
    this._clearTimer = clearTimer;
    this._createBinding = createBinding;
    this._createOverlayControls = createOverlayControls;
    this._t = t;
    this._binding = null;
    this._video = null;
    this._hideTimer = null;
    this._playbackOverlayController = null;
    this._playbackOverlayHideTimer = null;
    this._keyboardPlaybackCleanup = null;
  }

  video() {
    return this._query?.("#viewer")?.querySelector?.("video") || null;
  }

  initialize(video, mediaType = "") {
    this._disposeMediaBinding();
    const controls = this._query?.("#popup-media-controls");
    if (!controls || !video) return null;
    const mobileTablet = this._isMobileTabletViewport();
    if (mobileTablet) {
      controls.classList?.add?.("mobile-tablet-layout");
      controls.classList?.remove?.("desktop-overlay-layout");
    } else {
      controls.classList?.remove?.("mobile-tablet-layout");
      controls.classList?.add?.("desktop-overlay-layout");
    }

    this._video = video;
    const controlsPlan = resolvePopupMediaControlsInitPlan({
      shouldUseCustomControls: this._shouldUseCustomControls(mediaType),
    });
    video.controls = controlsPlan.videoControlsEnabled;
    if (controlsPlan.removeVideoControlsAttribute) {
      video.removeAttribute("controls");
    }
    if (controlsPlan.setVideoControlsAttribute) {
      video.setAttribute("controls", "");
    }
    controls.hidden = controlsPlan.controlsHidden;
    if (controlsPlan.resetControlsHiddenClass) {
      controls.classList.remove("is-hidden");
    }
    if (!controlsPlan.shouldBindCustomControls) return controlsPlan;

    const progress = this._query?.("#popup-media-progress");
    const volume = this._query?.("#popup-media-volume");
    this._binding = this._createBinding({
      controls,
      progress,
      volume,
      video,
      listenerPlan: resolvePopupMediaControlsListenerPlan({
        hasProgressControl: Boolean(progress),
        hasVolumeControl: Boolean(volume),
      }),
      onShowNow: () => this.showNow(),
      onShowTemporarily: () => this.showTemporarily(),
      onSync: ({ progressDragging = false } = {}) =>
        this.update(video, { updateProgress: !progressDragging }),
    });
    this._binding.bind();
    this._bindKeyboardPlayback(video);
    return controlsPlan;
  }

  resetWithoutVideo(controlsPlan = null) {
    this._disposeMediaBinding();
    const controls = this._query?.("#popup-media-controls");
    if (!controls) return;
    const plan =
      controlsPlan || resolvePopupMediaControlsInitPlan({ hasVideo: false });
    controls.hidden = plan.controlsHidden;
    if (plan.resetControlsHiddenClass) {
      controls.classList.remove("is-hidden");
    }
    controls.classList.remove("mobile-tablet-layout");
    controls.classList.remove("desktop-overlay-layout");
  }

  ensurePlaybackButtons(mediaType = "") {
    const viewer = this._query?.("#viewer");
    if (!viewer) return;
    const existingControls = viewer.querySelector?.(
      "#popup-playback-controls",
    );
    const existingMobileTopControls = viewer.querySelector?.(
      "#popup-mobile-top-controls",
    );
    const video = viewer.querySelector?.("video");
    const snapshot = viewer.querySelector?.("img.snap");
    if (!video && !snapshot) {
      this._disposePlaybackOverlayVisibility();
      this._onClearPictureInPicture("popup");
      existingControls?.remove?.();
      existingMobileTopControls?.remove?.();
      return;
    }

    let controls = existingControls;
    if (!controls) {
      controls = this._document?.createElement?.("div");
      if (!controls) return;
      controls.className = "popup-playback-controls overlay-controls";
      controls.id = "popup-playback-controls";
      viewer.appendChild(controls);
    }
    controls.innerHTML = "";

    const appendButton = ({
      parent = controls,
      buttonClass = "square-btn popup-playback-btn",
      id,
      className,
      title,
      translationKey,
      icon,
      pressed = null,
    }) => {
      const button = this._document?.createElement?.("button");
      if (!button) return null;
      button.className = `${buttonClass} ${className}`;
      button.id = id;
      button.type = "button";
      const label = typeof this._t === "function"
        ? this._t(translationKey)
        : title;
      button.title = label;
      button.setAttribute("aria-label", label);
      button.setAttribute("data-fvc-i18n-title", translationKey);
      button.setAttribute("data-fvc-i18n-aria-label", translationKey);
      if (pressed !== null) {
        button.setAttribute("aria-pressed", String(pressed));
      }
      button.innerHTML = icon;
      parent.appendChild(button);
      return button;
    };
    const isVideo = Boolean(video && this._isVideoMediaType(mediaType));
    const mobileTablet = this._isMobileTabletViewport();
    const customControls = Boolean(
      isVideo && this._shouldUseCustomControls(mediaType),
    );
    this._bindPlaybackOverlayVisibility(viewer, mobileTablet);

    existingMobileTopControls?.remove?.();
    if (isVideo && mobileTablet) {
      appendButton({
        id: "popup-mobile-fs-btn",
        className: "popup-mobile-fs-btn",
        title: "Fullscreen",
        translationKey: "runtime.popup.fullscreen",
        icon: this._icons.expand,
      });
      const airPlayButton = appendButton({
        id: "popup-mobile-airplay-btn",
        className: "popup-mobile-airplay-btn",
        title: "AirPlay video",
        translationKey: "runtime.popup.airplayVideo",
        icon: this._icons.airplayVideo,
      });
      if (airPlayButton) airPlayButton.hidden = true;
    }

    if (isVideo && !mobileTablet && !customControls) {
      const airPlayButton = appendButton({
        id: "popup-airplay-btn",
        className: "popup-airplay-btn",
        title: "AirPlay video",
        translationKey: "runtime.popup.airplayVideo",
        icon: this._icons.airplayVideo,
      });
      if (airPlayButton) airPlayButton.hidden = true;
    }

    if (isVideo && !mobileTablet) {
      const pictureInPictureButton = appendButton({
        id: "popup-pip-btn",
        className: "popup-pip-btn",
        title: "Picture-in-Picture",
        translationKey: "runtime.popup.pictureInPicture",
        icon: this._icons.pipPopOut,
        pressed: false,
      });
      if (pictureInPictureButton) pictureInPictureButton.hidden = true;
    }

    appendButton({
      id: "popup-take-snapshot-btn",
      className: "popup-take-snapshot-btn",
      title: "Take Snapshot",
      translationKey: "runtime.popup.takeSnapshot",
      icon: this._icons.takeSnapshot,
    });

    if (!isVideo) {
      this._onClearPictureInPicture("popup");
      this._onSyncFullscreenButtons();
      return;
    }

    this._onSyncPlaybackTargetButtons();
    this._onSyncPictureInPictureButtons();
    this._onSyncFullscreenButtons();
  }

  syncPlaybackButtons() {
    this._onSyncPlaybackTargetButtons();
    this._onSyncPictureInPictureButtons();
    this._onSyncFullscreenButtons();
  }

  update(video = this.video(), { updateProgress = true } = {}) {
    if (!video) return null;
    const controlState = buildPopupMediaControlState({
      duration: video.duration,
      currentTime: video.currentTime,
      paused: video.paused,
      muted: video.muted,
      volume: video.volume,
      formatTime: this._formatTime,
    });
    const playButton = this._query?.("#popup-media-play");
    const muteButton = this._query?.("#popup-media-mute");
    const progress = this._query?.("#popup-media-progress");
    const volume = this._query?.("#popup-media-volume");
    const time = this._query?.("#popup-media-time");
    if (updateProgress && progress) {
      progress.value = controlState.progressValue;
      progress.style?.setProperty?.(
        "--popup-media-progress-pct",
        `${Number(controlState.progressValue) / 10}%`,
      );
    }
    if (volume) {
      volume.value = controlState.volumeValue;
      volume.style?.setProperty?.(
        "--popup-media-volume-pct",
        `${controlState.volumeValue}%`,
      );
    }
    if (playButton) {
      playButton.innerHTML = controlState.showPauseIcon
        ? this._icons.pause
        : this._icons.play;
    }
    if (muteButton) {
      muteButton.innerHTML = controlState.showMutedIcon
        ? this._icons.volOff
        : this._icons.volOn;
    }
    if (time) time.textContent = controlState.timeText;
    return controlState;
  }

  togglePlay() {
    const video = this.video();
    if (!video) return false;
    if (video.paused) {
      const playResult = video.play?.();
      playResult?.catch?.(() => {});
    } else {
      video.pause?.();
    }
    this.showTemporarily();
    this.update(video);
    return true;
  }

  toggleMute() {
    const video = this.video();
    if (!video) return false;
    video.muted = !video.muted;
    this.showTemporarily();
    this.update(video);
    return true;
  }

  handleClick(target) {
    if (target?.closest?.("#popup-media-play")) {
      this.togglePlay();
      return true;
    }
    if (target?.closest?.("#popup-media-mute")) {
      this.toggleMute();
      return true;
    }
    return false;
  }

  hideForOutsideVideoClick(target) {
    const controls = this._query?.("#popup-media-controls");
    if (
      !controls ||
      controls.hidden ||
      !controls.classList?.contains?.("desktop-overlay-layout") ||
      target?.closest?.("#viewer") ||
      target?.closest?.("#popup-media-controls")
    ) {
      return false;
    }
    return this.hideNow();
  }

  showNow() {
    const controls = this._query?.("#popup-media-controls");
    this._clearHideTimer();
    this._setCardViewOverlayControlsHidden(false);
    if (!controls || controls.hidden) return;
    controls.classList.remove("is-hidden");
  }

  showTemporarily() {
    const controls = this._query?.("#popup-media-controls");
    const hasCardViewOverlays = this._isCardViewDrawerPresentation();
    if ((!controls || controls.hidden) && !hasCardViewOverlays) return;
    this.showNow();
    if (!this._isAutoHideActive() || !this._setTimer) return;
    this._hideTimer = this._setTimer(() => {
      this._hideTimer = null;
      const nextControls = this._query?.("#popup-media-controls");
      if (nextControls && !nextControls.hidden) {
        nextControls.classList.add("is-hidden");
      }
      this._setCardViewOverlayControlsHidden(true);
    }, this._hideDelayMs);
  }

  hideNow() {
    const controls = this._query?.("#popup-media-controls");
    this._clearHideTimer();
    const hidCardViewOverlays =
      this._setCardViewOverlayControlsHidden(true);
    if (!controls || controls.hidden) return hidCardViewOverlays;
    controls.classList.add("is-hidden");
    return true;
  }

  handleKeyboardPlayback(event) {
    if (!isSpaceKey(event)) return false;
    const popup = this._query?.("#myPopup");
    const video = this.video();
    if (!popup?.classList?.contains?.("is-open") || !video) return false;
    event?.preventDefault?.();
    if (!event?.repeat) this.togglePlay();
    return true;
  }

  dispose() {
    this._disposeMediaBinding();
    this._disposePlaybackOverlayVisibility();
    this._setCardViewOverlayControlsHidden(false);
  }

  _disposeMediaBinding() {
    this._clearHideTimer();
    this._disposeKeyboardPlayback();
    this._binding?.dispose?.();
    this._binding = null;
    this._video = null;
    this._query?.("#popup-media-controls")?.classList?.remove?.("is-hidden");
  }

  _bindKeyboardPlayback(video) {
    this._disposeKeyboardPlayback();
    if (!video || !this._document?.addEventListener) return;
    this._keyboardPlaybackCleanup = new CleanupController();
    this._keyboardPlaybackCleanup.addEventListener(
      this._document,
      "keydown",
      this._onKeyboardPlaybackKeyDown,
      { capture: true },
    );
  }

  _disposeKeyboardPlayback() {
    this._keyboardPlaybackCleanup?.dispose?.();
    this._keyboardPlaybackCleanup = null;
  }

  _onKeyboardPlaybackKeyDown = (event) => {
    this.handleKeyboardPlayback(event);
  };

  _bindPlaybackOverlayVisibility(viewer, mobileTablet) {
    this._disposePlaybackOverlayVisibility();
    if (!viewer || !mobileTablet) return;
    this._playbackOverlayController = this._createOverlayControls({
      surface: viewer,
      show: () => {
        this._setPlaybackOverlayVisible(viewer, true);
        if (this._isCardViewDrawerPresentation()) this.showNow();
      },
      hideNow: () => {
        this._setPlaybackOverlayVisible(viewer, false);
        if (this._isCardViewDrawerPresentation()) this.hideNow();
        this._clearPlaybackOverlayHideTimer();
      },
      hideSoon: (delayMs) => {
        this._clearPlaybackOverlayHideTimer();
        if (!this._setTimer) return;
        this._playbackOverlayHideTimer = this._setTimer(() => {
          this._playbackOverlayHideTimer = null;
          this._setPlaybackOverlayVisible(viewer, false);
          if (this._isCardViewDrawerPresentation()) this.hideNow();
        }, delayMs);
      },
      cancelScheduledHide: () => {
        this._clearPlaybackOverlayHideTimer();
      },
      revealDurationMs: 1800,
    });
    this._playbackOverlayController.bind();
  }

  _setPlaybackOverlayVisible(viewer, visible) {
    viewer?.classList?.toggle?.("popup-controls-visible", visible === true);
    this._query?.("#myPopup")?.classList?.toggle?.(
      "popup-overlay-controls-visible",
      visible === true,
    );
  }

  _disposePlaybackOverlayVisibility() {
    this._playbackOverlayController?.dispose?.();
    this._playbackOverlayController = null;
    this._clearPlaybackOverlayHideTimer();
  }

  _clearPlaybackOverlayHideTimer() {
    if (this._playbackOverlayHideTimer !== null && this._clearTimer) {
      this._clearTimer(this._playbackOverlayHideTimer);
    }
    this._playbackOverlayHideTimer = null;
  }

  _clearHideTimer() {
    if (this._hideTimer !== null && this._clearTimer) {
      this._clearTimer(this._hideTimer);
    }
    this._hideTimer = null;
  }

  _isCardViewDrawerPresentation() {
    return (
      this._query?.("#myPopup")?.classList?.contains?.(
        "popup-content--card-view-drawer",
      ) === true
    );
  }

  _setCardViewOverlayControlsHidden(hidden) {
    const popup = this._query?.("#myPopup");
    if (!popup?.classList) return false;
    if (!this._isCardViewDrawerPresentation()) {
      popup.classList.remove?.("popup-card-view-controls-hidden");
      return false;
    }
    popup.classList.toggle?.(
      "popup-card-view-controls-hidden",
      hidden === true,
    );
    return true;
  }
}
