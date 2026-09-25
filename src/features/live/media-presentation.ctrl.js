import { attachVideoZoom } from "../../shared/media/video-zoom.ctrl.js";
import { applyContainedVideoFit } from "../../shared/media/video-fit.js";

export class LiveMediaPresentationController {
  constructor(host) {
    this._host = host;
  }

  assignEngine(engine, options = {}) {
    const host = this._host;
    if (host._engine === engine) {
      if (engine) this.attachVideoZoom(engine);
      host._syncPictureInPictureButtons();
      return;
    }
    if (options.retainPrevious !== true) {
      host._haDirectMounter?.release?.(host._engine);
    }
    this.clearVideoZoom();
    host._clearPictureInPictureButtonController("live");
    host._liveViewResizeController?.attachMedia(null);
    host._engine = engine;
    if (engine) {
      this.attachVideoZoom(engine);
    } else {
      host._syncPictureInPictureButtons();
    }
  }

  attachVideoZoom(engine, readyVideo = null, attachmentOptions = {}) {
    const hostCard = this._host;
    if (!engine || hostCard._engine !== engine) return;
    const video =
      readyVideo ||
      engine.video ||
      hostCard._findFullscreenVideo(engine) ||
      hostCard._findVideoDeep(engine);
    if (!video) return;

    applyContainedVideoFit(video);
    hostCard._liveViewResizeController?.attachMedia(video);
    const currentZoomController = hostCard._liveVideoZoomController;
    const sameVideo = currentZoomController?.video === video;
    const zoomHost =
      attachmentOptions.host ||
      (sameVideo ? currentZoomController?.host : null) ||
      video.parentElement ||
      null;
    const interactionTarget =
      attachmentOptions.interactionTarget ||
      (sameVideo ? currentZoomController?.interactionTarget : null) ||
      video;
    if (!zoomHost) {
      this.clearVideoZoom();
      hostCard._syncPictureInPictureButtons();
      return;
    }
    if (
      sameVideo &&
      currentZoomController?.host === zoomHost &&
      currentZoomController?.interactionTarget === interactionTarget
    ) {
      currentZoomController.refresh();
      hostCard._syncPictureInPictureButtons();
      return;
    }

    this.clearVideoZoom();
    const enablePresentationRefresh =
      attachmentOptions.enablePresentationRefresh ??
      !(
        engine?.type === "ha_direct" &&
        engine?.streamType === "hls"
      );
    hostCard._liveVideoZoomController = attachVideoZoom(video, {
      host: zoomHost,
      interactionTarget,
      enablePresentationRefresh,
      onInteractionStart: () => hostCard._dismissLinkedLightDimmers(),
      onZoomStateChange: (zoomed) => {
        hostCard._$("#card")?.classList?.toggle?.(
          "card-view-video-zoomed",
          zoomed,
        );
      },
    });
    this.syncRotateZoomPresentation();
    hostCard._syncPictureInPictureButtons();
  }

  clearVideoZoom() {
    this._host._liveVideoZoomController?.dispose?.();
    this._host._liveVideoZoomController = null;
  }

  syncRotateZoomPresentation(card = this._host._$("#card")) {
    const suspend = Boolean(
      card?.classList?.contains("mobile-rotate-live") ||
        card?.classList?.contains("mobile-rotate-live-exit"),
    );
    this._host._liveVideoZoomController?.setPresentationSuspended?.(suspend);
  }
}

export function getLiveMediaPresentationController(host) {
  if (
    host._liveMediaPresentationController instanceof
    LiveMediaPresentationController
  ) {
    return host._liveMediaPresentationController;
  }
  const controller = new LiveMediaPresentationController(host);
  host._liveMediaPresentationController = controller;
  return controller;
}
