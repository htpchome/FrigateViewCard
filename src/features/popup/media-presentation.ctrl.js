import { attachVideoZoom } from "../../shared/media/video-zoom.ctrl.js";

export class PopupMediaPresentationController {
  constructor({
    resolveViewer = () => null,
    onInteractionStart = () => {},
    attachZoom = attachVideoZoom,
  } = {}) {
    this._resolveViewer = resolveViewer;
    this._onInteractionStart = onInteractionStart;
    this._attachZoom = attachZoom;
    this._zoomController = null;
  }

  zoomController() {
    return this._zoomController;
  }

  attach(media) {
    if (this._zoomController?.video === media) {
      this._zoomController.refresh?.();
      return this._zoomController;
    }
    this.clear();
    const viewer = this._resolveViewer?.();
    this._zoomController = this._attachZoom(media, {
      host: viewer || media?.parentElement,
      interactionTarget: viewer || media,
      nativeCoverPan: true,
      onInteractionStart: this._onInteractionStart,
    });
    return this._zoomController;
  }

  refreshVideo(video) {
    if (this._zoomController?.video !== video) return false;
    this._zoomController.refresh?.();
    return true;
  }

  clear() {
    this._zoomController?.dispose?.();
    this._zoomController = null;
  }

  dispose() {
    this.clear();
  }
}
