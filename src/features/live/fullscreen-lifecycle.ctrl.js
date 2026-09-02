import { CleanupController } from "../../shared/cleanup.js";

export class LiveFullscreenLifecycleController {
  constructor({
    getCurrentVideo = () => null,
    scheduleResumeLive = () => {},
    onFullscreenExit = () => {},
  } = {}) {
    this._getCurrentVideo = getCurrentVideo;
    this._scheduleResumeLive = scheduleResumeLive;
    this._onFullscreenExit = onFullscreenExit;
    this._sessionVideo = null;
    this._usesDocumentFullscreen = false;
    this._enteredDocumentFullscreen = false;
    this._nativeCleanup = new CleanupController();
  }

  get active() {
    return Boolean(
      this._sessionVideo ||
        this._usesDocumentFullscreen ||
        this._enteredDocumentFullscreen,
    );
  }

  beginDocumentFullscreen(video = null) {
    this.cancel();
    this._sessionVideo = video;
    this._usesDocumentFullscreen = true;
  }

  beginNativeVideoFullscreen(video = null) {
    this.cancel();
    this._sessionVideo = video;
    this._nativeCleanup.addEventListener(
      video,
      "webkitendfullscreen",
      this._onNativeVideoFullscreenEnd,
      { once: true },
    );
  }

  handleDocumentFullscreenChange(fullscreenElement = null) {
    if (!this._usesDocumentFullscreen) return;
    if (fullscreenElement) {
      this._enteredDocumentFullscreen = true;
      return;
    }
    if (!this._enteredDocumentFullscreen) return;
    this._recoverAfterExit();
  }

  cancel() {
    this._nativeCleanup.dispose();
    this._nativeCleanup = new CleanupController();
    this._sessionVideo = null;
    this._usesDocumentFullscreen = false;
    this._enteredDocumentFullscreen = false;
  }

  dispose() {
    this.cancel();
  }

  _onNativeVideoFullscreenEnd = () => {
    this._recoverAfterExit();
  };

  _recoverAfterExit() {
    const sessionVideo = this._sessionVideo;
    this.cancel();

    const currentVideo = this._getCurrentVideo?.() || sessionVideo;
    try {
      const playResult = currentVideo?.play?.();
      if (playResult?.catch) playResult.catch(() => {});
    } catch (_) {}

    this._scheduleResumeLive?.("live-fullscreen-exit");
    this._onFullscreenExit?.();
  }
}
