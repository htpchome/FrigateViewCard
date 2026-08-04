export class SlideshowPageController {
  constructor(host) {
    this._host = host;
  }

  clearTimers() {
    if (this._host._slideshowSwitchT)
      clearTimeout(this._host._slideshowSwitchT);
    if (this._host._slideshowPauseT) clearTimeout(this._host._slideshowPauseT);
    if (this._host._slideshowFadeT) clearTimeout(this._host._slideshowFadeT);
    if (this._host._slideshowReviewProbeT) {
      clearTimeout(this._host._slideshowReviewProbeT);
    }
    if (this._host._slideshowReviewWatchT) {
      clearTimeout(this._host._slideshowReviewWatchT);
    }
    this._host._slideshowSwitchT = null;
    this._host._slideshowPauseT = null;
    this._host._slideshowFadeT = null;
    this._host._slideshowReviewProbeT = null;
    this._host._slideshowReviewWatchT = null;
  }

  stopRotation(reason = "manual-stop", sync = true) {
    this.clearTimers();
    this._host._clearSlideshowCountdownOverlay();
    this._host._slideshowActive = false;
    this._host._slideshowPopupPaused = false;
    this._host._slideshowPausedUntil = 0;
    this._host._slideshowPendingAlertCam = "";
    this._host._slideshowPendingAlertType = "";
    this._host._slideshowLastAlertAt = 0;
    this._host._slideshowLastAlertCam = "";
    this._host._slideshowAttentionType = "";
    this._host._slideshowHandledReviewIds.clear();
    this._host._slideshowStartedAtSec = 0;
    this._host._slideshowReviewProbeInFlight = false;
    const engWrap = this._host._$("#eng-wrap");
    if (engWrap) {
      engWrap.classList.remove(
        "slideshow-switching",
        "slideshow-alert",
        "slideshow-detection",
      );
    }
    void reason;
    if (sync) this._host._syncToolbarButtons();
  }

  startRotation(source = "manual") {
    if (!this._host._isSlideshowRotationAvailable()) return false;
    this._host._slideshowActive = true;
    this._host._slideshowPopupPaused =
      this._host._$("#myPopup")?.classList.contains("is-open") === true;
    this._host._slideshowPausedUntil = 0;
    this._host._slideshowPendingAlertCam = "";
    this._host._slideshowPendingAlertType = "";
    this._host._slideshowAttentionType = "";
    this._host._slideshowHandledReviewIds.clear();
    this._host._slideshowStartedAtSec = Math.floor(Date.now() / 1000);
    this._host._slideshowAlertController.scheduleReviewWatch(300);
    this.scheduleRotation(source);
    this._host._syncToolbarButtons();
    return true;
  }

  pauseForPopup() {
    if (!this._host._slideshowActive) return;
    this._host._slideshowPopupPaused = true;
    this._host._syncSlideshowCountdownOverlay();
    if (this._host._slideshowSwitchT)
      clearTimeout(this._host._slideshowSwitchT);
    if (this._host._slideshowPauseT) clearTimeout(this._host._slideshowPauseT);
    this._host._slideshowSwitchT = null;
    this._host._slideshowPauseT = null;
  }

  resumeAfterPopup() {
    if (!this._host._slideshowActive) return;
    this._host._slideshowPopupPaused = false;
    this._host._slideshowPausedUntil =
      Date.now() + this._host._slideshowRotationMs();
    this.scheduleRotation("popup-close");
  }

  toggleRotation() {
    if (this._host._slideshowActive) {
      this.stopRotation("manual-stop");
      return;
    }
    let startedFromGrid = false;
    if (this._host._viewMode === "grid" || this._host._gridResumePending) {
      this._host._gridResumePending = false;
      this._host._stopGridModeState();
      this._host._setViewMode("single");
      startedFromGrid = true;
    }
    const started = this.startRotation("manual-start");
    if (started && startedFromGrid) {
      if (this._host._slideshowSwitchT) {
        clearTimeout(this._host._slideshowSwitchT);
        this._host._slideshowSwitchT = null;
      }
      void this.advanceRotation();
    }
  }

  pauseForInteraction() {
    if (
      !this._host._slideshowActive ||
      !this._host._isSlideshowRotationAvailable()
    ) {
      return;
    }
    this._host._slideshowPausedUntil =
      Date.now() + this._host._slideshowRotationMs();
    this._host._setSlideshowCountdown(this._host._slideshowRotationMs());
    if (this._host._slideshowPauseT) clearTimeout(this._host._slideshowPauseT);
    if (this._host._slideshowSwitchT)
      clearTimeout(this._host._slideshowSwitchT);
    this._host._slideshowPauseT = setTimeout(() => {
      this._host._slideshowPauseT = null;
      this.scheduleRotation("pause-expired");
    }, this._host._slideshowRotationMs());
  }

  scheduleRotation(_reason = "") {
    if (
      !this._host._slideshowActive ||
      !this._host._isSlideshowRotationAvailable()
    ) {
      this._host._clearSlideshowCountdownOverlay();
      return;
    }
    if (this._host._slideshowPopupPaused) {
      this._host._syncSlideshowCountdownOverlay();
      return;
    }
    if (this._host._slideshowSwitchT)
      clearTimeout(this._host._slideshowSwitchT);
    const delay = Math.max(250, this._host._slideshowPausedUntil - Date.now());
    const wait =
      this._host._slideshowPausedUntil > Date.now()
        ? delay
        : this._host._slideshowRotationMs();
    this._host._setSlideshowCountdown(wait);
    this._host._slideshowSwitchT = setTimeout(() => {
      this._host._slideshowSwitchT = null;
      void this.advanceRotation();
    }, wait);
  }

  async advanceRotation() {
    if (
      !this._host._slideshowActive ||
      !this._host._isSlideshowRotationAvailable()
    ) {
      return;
    }
    if (this._host._slideshowPopupPaused) return;
    const pendingAlertCam = this._host._slideshowPendingAlertCam;
    const pendingAlertType = this._host._slideshowPendingAlertType;
    this._host._slideshowPendingAlertCam = "";
    this._host._slideshowPendingAlertType = "";
    const activeEntity = this._host._activeCam?.entity || "";
    const currentIndex = this._host._cameraIndexByEntity(activeEntity);
    const nextIndex =
      pendingAlertCam && pendingAlertCam !== activeEntity
        ? this._host._cameraIndexByEntity(pendingAlertCam)
        : currentIndex >= 0
          ? (currentIndex + 1) % this._host._config.cameras.length
          : 0;
    const targetIndex = nextIndex >= 0 ? nextIndex : 0;
    const targetEntity =
      this._host._config?.cameras?.[targetIndex]?.entity || "";
    if (!targetEntity) {
      this.scheduleRotation("missing-target");
      return;
    }
    await this._host._switchCamera(targetIndex, {
      source: pendingAlertCam ? "alert" : "slideshow",
    });
    this._host._slideshowPausedUntil =
      Date.now() + this._host._slideshowRotationMs();
    this._host._setSlideshowAlertState(pendingAlertCam ? pendingAlertType : "");
    this.scheduleRotation("advance");
  }
}
