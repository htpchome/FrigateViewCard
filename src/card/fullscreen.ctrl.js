import {
  exitDocumentFullscreen,
  findFullscreenVideo,
  findVideoDeep,
  requestMediaFullscreen,
} from "../shared/media/fullscreen.js";
import {
  normalizePageRoute,
  PAGE_IDS,
} from "../features/navigation/router.js";
import { resolveFullscreenButtonVisibility } from "../features/live/rotate-overlay-state.js";

export class CardFullscreenController {
  constructor(
    host,
    {
      exitFullscreen = exitDocumentFullscreen,
      findFullscreenMedia = findFullscreenVideo,
      findNestedVideo = findVideoDeep,
      requestFullscreen = requestMediaFullscreen,
      resolveButtonVisibility = resolveFullscreenButtonVisibility,
      getDocument = () => globalThis.document,
    } = {},
  ) {
    this._host = host;
    this._exitFullscreen = exitFullscreen;
    this._findFullscreenMedia = findFullscreenMedia;
    this._findNestedVideo = findNestedVideo;
    this._requestFullscreen = requestFullscreen;
    this._resolveButtonVisibility = resolveButtonVisibility;
    this._getDocument = getDocument;
  }

  findFullscreenVideo(element) {
    return this._findFullscreenMedia(element);
  }

  findVideoDeep(root, maxDepth = 7) {
    return this._findNestedVideo(root, maxDepth);
  }

  requestLive() {
    const liveStage = this._host._$("#live-stage");
    const fullscreenTarget =
      this._host._cardViewPageController?.liveFullscreenTarget?.() ||
      liveStage;
    return this.request(fullscreenTarget, {
      preferLive: true,
      preferElementFullscreen: fullscreenTarget !== liveStage,
    });
  }

  request(element, options = {}) {
    if (!element) return false;
    let video = this.findFullscreenVideo(element);
    if (!video) video = this.findVideoDeep(element);
    if (!video && options.preferLive) {
      video =
        this.findVideoDeep(this._host._$("#engine")) ||
        this.findVideoDeep(this._host._engine);
    }
    return this._requestFullscreen({
      element,
      video,
      preferElementFullscreen:
        options.preferElementFullscreen === true,
      onBeginNativeVideoFullscreen: (fullscreenVideo) => {
        if (!options.preferLive) return;
        this._host._liveFullscreenLifecycleController?.beginNativeVideoFullscreen(
          fullscreenVideo,
        );
      },
      onBeginDocumentFullscreen: (fullscreenVideo) => {
        if (!options.preferLive) return;
        this._host._liveFullscreenLifecycleController?.beginDocumentFullscreen(
          fullscreenVideo,
        );
      },
      onRequestFailure: options.preferLive
        ? () => this._host._liveFullscreenLifecycleController?.cancel()
        : null,
    });
  }

  exit() {
    return this._exitFullscreen(
      this._host.ownerDocument || this._getDocument?.(),
    );
  }

  syncButtonVisibility() {
    const host = this._host;
    const liveButton = host._$("#live-fs-btn");
    const popupControlsButton = host._$("#popup-media-fs");
    const popupMobileButton = host._$("#popup-mobile-fs-btn");
    const popupOpen = host._$("#myPopup")?.classList.contains("is-open");
    const documentTarget = this._getDocument?.();
    const isFullscreen = Boolean(
      documentTarget?.fullscreenElement ||
        documentTarget?.webkitFullscreenElement,
    );
    const pageId = normalizePageRoute(host._pageId);
    const visibility = this._resolveButtonVisibility({
      popupOpen: Boolean(popupOpen),
      isFullscreen,
      inGridMode: host._viewMode === "grid",
      isMobileTabletViewport: host._isMobileTabletViewport(),
      showLiveFullscreenOnMobile:
        pageId === PAGE_IDS.singleView ||
        pageId === PAGE_IDS.mobileView ||
        pageId === PAGE_IDS.cardView,
    });
    if (liveButton) liveButton.hidden = visibility.liveButtonHidden;
    if (popupControlsButton) {
      popupControlsButton.hidden =
        visibility.popupControlsFullscreenHidden;
    }
    if (popupMobileButton) {
      popupMobileButton.hidden = visibility.popupMobileFullscreenHidden;
    }
    host._syncTakeSnapshotButtonVisibility();
    return visibility;
  }
}
