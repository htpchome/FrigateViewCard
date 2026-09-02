import { PopupDragController } from "./drag.ctrl.js";

const POPUP_SHELL_MIN_ANCHOR_WIDTH = 16;

const readRect = (element) => {
  const rect = element?.getBoundingClientRect?.();
  if (!rect) return null;
  const left = Number(rect.left);
  const right = Number(rect.right);
  const width = Number(rect.width);
  if (![left, right, width].every(Number.isFinite) || width <= 0) return null;
  return { left, right, width };
};

export const resolvePopupShellGeometry = ({ card = null, anchor = null } = {}) => {
  const cardRect = readRect(card);
  const anchorRect = readRect(anchor);
  if (!cardRect || !anchorRect || cardRect.width <= 0) return null;

  const clientLeft = Math.max(0, Number(card?.clientLeft) || 0);
  const clientWidth = Number(card?.clientWidth);
  const containingLeft = cardRect.left + clientLeft;
  const containingWidth =
    Number.isFinite(clientWidth) && clientWidth > 0
      ? clientWidth
      : cardRect.width;
  const cardRight = containingLeft + containingWidth;
  const visibleLeft = Math.max(containingLeft, anchorRect.left);
  const visibleRight = Math.min(cardRight, anchorRect.right);
  const width = visibleRight - visibleLeft;
  if (width < POPUP_SHELL_MIN_ANCHOR_WIDTH) return null;

  return {
    left: visibleLeft - containingLeft,
    width,
  };
};

export class PopupLifecycleController {
  constructor({
    query,
    isFirefox = () => false,
    onPauseSlideshow = () => {},
    onResumeSlideshow = () => {},
    onSetLiveCovered = () => {},
    onMuteLive = () => {},
    onSyncFullscreen = () => {},
    onSyncPictureInPicture = () => {},
    onScheduleOverlay = () => {},
    onReleasePlaybackTarget = () => {},
    onClearPictureInPicture = () => {},
    onClearVideoZoom = () => {},
    onDisposeCarousel = () => {},
    onClearCarousel = () => {},
    onDisposeMediaControls = () => {},
    onHideInfo = () => {},
    onClearMediaTransport = () => {},
    eventTarget = globalThis.document,
    createDragController = (options) => new PopupDragController(options),
    setTimer = globalThis.setTimeout?.bind(globalThis),
    clearTimer = globalThis.clearTimeout?.bind(globalThis),
    sourceDropDelayMs = 1200,
  } = {}) {
    this._query = query;
    this._isFirefox = isFirefox;
    this._onPauseSlideshow = onPauseSlideshow;
    this._onResumeSlideshow = onResumeSlideshow;
    this._onSetLiveCovered = onSetLiveCovered;
    this._onMuteLive = onMuteLive;
    this._onSyncFullscreen = onSyncFullscreen;
    this._onSyncPictureInPicture = onSyncPictureInPicture;
    this._onScheduleOverlay = onScheduleOverlay;
    this._onReleasePlaybackTarget = onReleasePlaybackTarget;
    this._onClearPictureInPicture = onClearPictureInPicture;
    this._onClearVideoZoom = onClearVideoZoom;
    this._onDisposeCarousel = onDisposeCarousel;
    this._onClearCarousel = onClearCarousel;
    this._onDisposeMediaControls = onDisposeMediaControls;
    this._onHideInfo = onHideInfo;
    this._onClearMediaTransport = onClearMediaTransport;
    this._eventTarget = eventTarget;
    this._createDragController = createDragController;
    this._setTimer = setTimer;
    this._clearTimer = clearTimer;
    this._sourceDropDelayMs = Math.max(0, Number(sourceDropDelayMs) || 0);
    this._dragController = null;
    this._mediaCleanup = null;
    this._mediaStopTimer = null;
    this._mediaType = "";
    this._playing = null;
    this._mediaCamera = "";
    this._compact = false;
  }

  setMediaState({ mediaType = "", playing = null } = {}) {
    this._mediaType = String(mediaType || "");
    this._playing = playing;
  }

  mediaType() {
    return this._mediaType;
  }

  playing() {
    return this._playing;
  }

  setMediaCamera(camera = "") {
    this._mediaCamera = String(camera || "");
  }

  mediaCamera() {
    return this._mediaCamera;
  }

  setCompact(compact = false) {
    this._compact = compact === true;
    this._query?.("#myPopup")?.classList?.toggle?.(
      "popup-content--compact",
      this._compact,
    );
  }

  isCompact() {
    return this._compact;
  }

  enter() {
    const viewer = this._query?.("#viewer");
    if (viewer) viewer.style.display = "flex";
    return this.open();
  }

  open() {
    const popup = this._query?.("#myPopup");
    if (!popup) return false;
    this._syncShellGeometry(popup);
    this._onPauseSlideshow();
    popup.classList.add("is-open");
    popup.style.transform = this._compact
      ? "translate(-50%, 0)"
      : "translateY(0)";
    const body = popup.querySelector?.(".popup-body");
    if (body) body.scrollTop = 0;
    this._onSetLiveCovered(true);
    this._onMuteLive(true, { source: "popup-open" });
    this._syncGlobalUi();
    return true;
  }

  close() {
    this._onReleasePlaybackTarget("popup");
    const popup = this._query?.("#myPopup");
    if (!popup) return false;
    popup.classList.remove("is-open");
    popup.style.transform = this._compact
      ? "translate(-50%, 100%)"
      : "translateY(100%)";
    this._onSetLiveCovered(false);
    this._onMuteLive(true, { source: "popup-close" });
    this._syncGlobalUi();
    this.stopMedia();
    this._onResumeSlideshow();
    return true;
  }

  bindInteractions() {
    const popup = this._query?.("#myPopup");
    if (!popup) return null;
    this._disposeDrag();
    this._dragController = this._createDragController({
      popup,
      eventTarget: this._eventTarget,
      closeThreshold: 100,
      closePopup: () => this.close(),
      isPopupOpen: () => popup.classList.contains("is-open"),
    });
    this._dragController.bind();
    return this._dragController;
  }

  setMediaCleanup(cleanup) {
    this._mediaCleanup = typeof cleanup === "function" ? cleanup : null;
  }

  clearMediaCleanup() {
    this._onClearPictureInPicture("popup");
    this._onClearVideoZoom();
    this._onDisposeCarousel();
    this._onDisposeMediaControls();
    this._clearStopTimer();

    const cleanup = this._mediaCleanup;
    this._mediaCleanup = null;
    if (cleanup) {
      try {
        cleanup();
      } catch (_) {}
    }
    this._onClearMediaTransport();
  }

  stopMedia({ forceSourceDrop = false } = {}) {
    this.clearMediaCleanup();
    const viewer = this._query?.("#viewer");
    if (!viewer) return;

    const mediaType = this._mediaType;
    const deferSourceDrop =
      !forceSourceDrop &&
      this._isFirefox?.() &&
      mediaType &&
      mediaType !== "recording";
    if (deferSourceDrop) {
      this._cleanupVideos(viewer, false);
      this._mediaStopTimer = this._setTimer?.(() => {
        this._mediaStopTimer = null;
        this._cleanupVideos(viewer, true);
      }, this._sourceDropDelayMs);
    } else {
      this._cleanupVideos(viewer, true);
    }

    this._resetSurface(viewer);
  }

  dispose() {
    this.stopMedia({ forceSourceDrop: true });
    this._disposeDrag();
  }

  _syncGlobalUi() {
    this._onSyncFullscreen();
    this._onSyncPictureInPicture();
    this._onScheduleOverlay();
  }

  _syncShellGeometry(popup) {
    if (!popup?.style || this._compact) return;
    const card = this._query?.("#card");
    const anchors = ["#col-left", "#live-stage", "#layout"];
    const geometry = anchors.reduce((resolved, selector) => {
      if (resolved) return resolved;
      return resolvePopupShellGeometry({
        card,
        anchor: this._query?.(selector),
      });
    }, null);
    if (!geometry) {
      popup.style.removeProperty?.("--popup-shell-left");
      popup.style.removeProperty?.("--popup-shell-width");
      return;
    }
    popup.style.setProperty?.("--popup-shell-left", `${geometry.left}px`);
    popup.style.setProperty?.("--popup-shell-width", `${geometry.width}px`);
  }

  _cleanupVideos(viewer, dropSources) {
    viewer.querySelectorAll?.("video").forEach((video) => {
      try {
        video.pause();
        if (dropSources) {
          if ("srcObject" in video) video.srcObject = null;
          video.removeAttribute("src");
          video
            .querySelectorAll?.("source")
            .forEach((source) => source.remove());
        }
      } catch (_) {}
    });
    if (dropSources) viewer.innerHTML = "";
  }

  _resetSurface(viewer) {
    viewer.style.display = "none";
    const controls = this._query?.("#popup-media-controls");
    if (controls) {
      controls.hidden = true;
      controls.classList.remove("is-hidden");
    }
    this._onClearCarousel();
    this._onHideInfo();
    this._mediaType = "";
    this._playing = null;
    this._mediaCamera = "";
    this.setCompact(false);
  }

  _clearStopTimer() {
    if (!this._mediaStopTimer) return;
    this._clearTimer?.(this._mediaStopTimer);
    this._mediaStopTimer = null;
  }

  _disposeDrag() {
    this._dragController?.dispose?.();
    this._dragController = null;
  }
}
