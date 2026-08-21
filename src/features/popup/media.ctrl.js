import { ICONS } from "../../icons.js";
import {
  buildPopupMediaControlState,
  resolvePopupMediaControlsInitPlan,
  resolvePopupMediaControlsListenerPlan,
  resolvePopupMediaSeekTarget,
} from "../../shared/media/controls.js";
import { CleanupController } from "../../shared/cleanup.js";

export class PopupMediaControlsController {
  constructor({
    controls,
    progress,
    video,
    listenerPlan,
    onShowNow,
    onShowTemporarily,
    onSync,
  }) {
    this._controls = controls;
    this._progress = progress;
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
    isMobileDevice = () => false,
    isVideoMediaType = () => false,
    onClearPictureInPicture = () => {},
    onSyncPlaybackTargetButtons = () => {},
    onSyncPictureInPictureButtons = () => {},
    icons = ICONS,
    documentObj = globalThis.document,
    hideDelayMs = 2200,
    setTimer = globalThis.setTimeout?.bind(globalThis),
    clearTimer = globalThis.clearTimeout?.bind(globalThis),
    createBinding = (options) => new PopupMediaControlsController(options),
  } = {}) {
    this._query = query;
    this._formatTime = formatTime;
    this._shouldUseCustomControls = shouldUseCustomControls;
    this._isAutoHideActive = isAutoHideActive;
    this._isMobileDevice = isMobileDevice;
    this._isVideoMediaType = isVideoMediaType;
    this._onClearPictureInPicture = onClearPictureInPicture;
    this._onSyncPlaybackTargetButtons = onSyncPlaybackTargetButtons;
    this._onSyncPictureInPictureButtons = onSyncPictureInPictureButtons;
    this._icons = icons;
    this._document = documentObj;
    this._hideDelayMs = Math.max(0, Number(hideDelayMs) || 0);
    this._setTimer = setTimer;
    this._clearTimer = clearTimer;
    this._createBinding = createBinding;
    this._binding = null;
    this._video = null;
    this._hideTimer = null;
  }

  video() {
    return this._query?.("#viewer")?.querySelector?.("video") || null;
  }

  initialize(video, mediaType = "") {
    this.dispose();
    const controls = this._query?.("#popup-media-controls");
    if (!controls || !video) return null;

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
    this._binding = this._createBinding({
      controls,
      progress,
      video,
      listenerPlan: resolvePopupMediaControlsListenerPlan({
        hasProgressControl: Boolean(progress),
      }),
      onShowNow: () => this.showNow(),
      onShowTemporarily: () => this.showTemporarily(),
      onSync: ({ progressDragging = false } = {}) =>
        this.update(video, { updateProgress: !progressDragging }),
    });
    this._binding.bind();
    return controlsPlan;
  }

  resetWithoutVideo(controlsPlan = null) {
    this.dispose();
    const controls = this._query?.("#popup-media-controls");
    if (!controls) return;
    const plan =
      controlsPlan || resolvePopupMediaControlsInitPlan({ hasVideo: false });
    controls.hidden = plan.controlsHidden;
    if (plan.resetControlsHiddenClass) {
      controls.classList.remove("is-hidden");
    }
  }

  ensurePlaybackButtons(mediaType = "") {
    const viewer = this._query?.("#viewer");
    if (!viewer) return;
    const existingControls = viewer.querySelector?.(
      "#popup-playback-controls",
    );
    const video = viewer.querySelector?.("video");
    const snapshot = viewer.querySelector?.("img.snap");
    if (!video && !snapshot) {
      this._onClearPictureInPicture("popup");
      existingControls?.remove?.();
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

    const takeSnapshotButton = this._document?.createElement?.("button");
    if (!takeSnapshotButton) return;
    takeSnapshotButton.className =
      "square-btn popup-playback-btn popup-take-snapshot-btn";
    takeSnapshotButton.id = "popup-take-snapshot-btn";
    takeSnapshotButton.type = "button";
    takeSnapshotButton.title = "Take Snapshot";
    takeSnapshotButton.setAttribute("aria-label", "Take Snapshot");
    takeSnapshotButton.innerHTML = this._icons.takeSnapshot;
    controls.appendChild(takeSnapshotButton);

    if (this._shouldUseCustomControls(mediaType) || !video) {
      this._onClearPictureInPicture("popup");
      return;
    }

    if (
      !this._isMobileDevice() &&
      this._isVideoMediaType(mediaType)
    ) {
      const pictureInPictureButton = this._document.createElement("button");
      pictureInPictureButton.className =
        "square-btn popup-playback-btn popup-pip-btn";
      pictureInPictureButton.id = "popup-pip-btn";
      pictureInPictureButton.type = "button";
      pictureInPictureButton.title = "Picture-in-Picture";
      pictureInPictureButton.setAttribute("aria-label", "Picture-in-Picture");
      pictureInPictureButton.setAttribute("aria-pressed", "false");
      pictureInPictureButton.hidden = true;
      pictureInPictureButton.innerHTML = this._icons.pipPopOut;
      controls.appendChild(pictureInPictureButton);
    }

    const airPlayButton = this._document.createElement("button");
    airPlayButton.className = "glass-btn popup-playback-btn";
    airPlayButton.id = "popup-airplay-btn";
    airPlayButton.type = "button";
    airPlayButton.title = "AirPlay video";
    airPlayButton.setAttribute("aria-label", "AirPlay video");
    airPlayButton.hidden = true;
    airPlayButton.innerHTML = this._icons.airplayVideo;
    controls.appendChild(airPlayButton);
    this._onSyncPlaybackTargetButtons();
    this._onSyncPictureInPictureButtons();
  }

  update(video = this.video(), { updateProgress = true } = {}) {
    if (!video) return null;
    const controlState = buildPopupMediaControlState({
      duration: video.duration,
      currentTime: video.currentTime,
      paused: video.paused,
      muted: video.muted,
      formatTime: this._formatTime,
    });
    const playButton = this._query?.("#popup-media-play");
    const muteButton = this._query?.("#popup-media-mute");
    const progress = this._query?.("#popup-media-progress");
    const time = this._query?.("#popup-media-time");
    if (updateProgress && progress) progress.value = controlState.progressValue;
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

  showNow() {
    const controls = this._query?.("#popup-media-controls");
    if (!controls || controls.hidden) return;
    this._clearHideTimer();
    controls.classList.remove("is-hidden");
  }

  showTemporarily() {
    const controls = this._query?.("#popup-media-controls");
    if (!controls || controls.hidden) return;
    this.showNow();
    if (!this._isAutoHideActive() || !this._setTimer) return;
    this._hideTimer = this._setTimer(() => {
      this._hideTimer = null;
      const nextControls = this._query?.("#popup-media-controls");
      if (nextControls && !nextControls.hidden) {
        nextControls.classList.add("is-hidden");
      }
    }, this._hideDelayMs);
  }

  dispose() {
    this._clearHideTimer();
    this._binding?.dispose?.();
    this._binding = null;
    this._video = null;
    this._query?.("#popup-media-controls")?.classList?.remove?.("is-hidden");
  }

  _clearHideTimer() {
    if (this._hideTimer !== null && this._clearTimer) {
      this._clearTimer(this._hideTimer);
    }
    this._hideTimer = null;
  }
}
