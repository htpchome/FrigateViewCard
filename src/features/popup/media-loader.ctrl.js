import {
  buildVideoOptionsForView,
  createVideoElement,
  mountNodeIntoSlot,
} from "../../shared/media/video-factory.js";
import { buildPopupMediaUrl } from "../../shared/media/url-utils.js";
import { resolveDisplayedFrameDimensions } from "../../shared/media/frame-capture.js";
import { isIOS } from "../../helpers.js";
import {
  buildPopupClipRenderPlan,
  buildPopupCarouselSelectionPlan,
  buildPopupEventRecordingRenderPlan,
  buildPopupRecordingRenderPlan,
  buildPopupRecordingScrubInitPlan,
  buildPopupRecordingSourceAttemptPlan,
  buildPopupSnapshotRenderPlan,
  resolvePopupMediaPostRenderPlan,
  resolvePopupMediaRenderPlan,
  resolvePopupRecordingLoadOutcomePlan,
  resolvePopupRecordingSeekListenerPlan,
} from "./media.js";
import { buildRecordingPlaybackPlan } from "../recordings/index.js";
import { resolveFrigateEventPrePostRollRange } from "../../integrations/frigate/event-media.js";
import {
  POPUP_VIEW_INITIAL_MAX_HEIGHT_RATIO,
  POPUP_VIEW_MAX_HEIGHT_DVH,
  PopupViewResizeController,
  createPopupViewResizeGrip,
  placePopupViewResizeGrip,
  resolvePopupViewAvailableMaxHeight,
} from "./view-resize.ctrl.js";

const RECORDING_HLS_JS_FILENAME = "frigate-view-card-hls-1.5.17.js";
const RECORDING_HLS_JS_INTEGRITY =
  "sha384-9v3HcdYrO3D+OPDTjZ40RXocgE4GtXVCd3/mCS62JsM93JXgI1afJVuwjFvsu6ni";

export const resolveRecordingHlsJsUrl = (moduleUrl = import.meta.url) =>
  new URL(`./${RECORDING_HLS_JS_FILENAME}`, moduleUrl).href;

export const resolvePopupMediaSizing = (media = null) => {
  const { width, height } = resolveDisplayedFrameDimensions(media);
  if (width <= 0 || height <= 0) return null;
  const naturalHeightRatio = height / width;
  const initialHeightRatio = Math.min(
    naturalHeightRatio,
    POPUP_VIEW_INITIAL_MAX_HEIGHT_RATIO,
  );
  const initialHeightCapped =
    naturalHeightRatio > POPUP_VIEW_INITIAL_MAX_HEIGHT_RATIO;
  const ratio = 1 / initialHeightRatio;
  return {
    aspectRatio: initialHeightCapped ? "4 / 3" : `${width} / ${height}`,
    maxWidth: `${Math.round(ratio * POPUP_VIEW_MAX_HEIGHT_DVH * 1000) / 1000}dvh`,
    initialHeightCapped,
  };
};

export const bindPopupMediaSizing = ({
  viewer = null,
  media = null,
  controls = null,
} = {}) => {
  const style = viewer?.style;
  if (!style || !media) return () => {};
  const controlsStyle = controls?.style;

  viewer.classList?.remove?.("popup-media-ratio-ready");
  viewer.classList?.remove?.("popup-media-height-capped");
  style.removeProperty?.("--popup-media-aspect-ratio");
  style.removeProperty?.("--popup-media-max-width");
  controlsStyle?.removeProperty?.("--popup-media-max-width");
  const sync = () => {
    const sizing = resolvePopupMediaSizing(media);
    if (!sizing) return false;
    style.setProperty?.("--popup-media-aspect-ratio", sizing.aspectRatio);
    style.setProperty?.("--popup-media-max-width", sizing.maxWidth);
    controlsStyle?.setProperty?.("--popup-media-max-width", sizing.maxWidth);
    viewer.classList?.add?.("popup-media-ratio-ready");
    if (sizing.initialHeightCapped) {
      viewer.classList?.add?.("popup-media-height-capped");
    } else {
      viewer.classList?.remove?.("popup-media-height-capped");
    }
    return true;
  };
  const events = ["loadedmetadata", "resize", "load"];
  events.forEach((eventName) => media.addEventListener?.(eventName, sync));
  sync();

  return () => {
    events.forEach((eventName) =>
      media.removeEventListener?.(eventName, sync),
    );
    viewer.classList?.remove?.("popup-media-ratio-ready");
    viewer.classList?.remove?.("popup-media-height-capped");
    style.removeProperty?.("--popup-media-aspect-ratio");
    style.removeProperty?.("--popup-media-max-width");
    controlsStyle?.removeProperty?.("--popup-media-max-width");
  };
};

export const bindPopupVideoReadiness = ({ viewer = null, video = null } = {}) => {
  if (!viewer || !video) return () => {};

  let pending = true;
  const reveal = () => {
    if (!pending) return;
    pending = false;
    viewer.classList?.remove?.("popup-media-loading");
  };
  const events = ["loadeddata", "canplay", "playing"];
  viewer.classList?.add?.("popup-media-loading");
  events.forEach((eventName) => video.addEventListener?.(eventName, reveal));
  if (Number(video.readyState || 0) >= 2) reveal();

  return () => {
    events.forEach((eventName) =>
      video.removeEventListener?.(eventName, reveal),
    );
    reveal();
  };
};

export class PopupMediaLoaderController {
  constructor(host, deps = {}) {
    const {
      infoController = host._popupInfoController,
      carouselController = host._popupCarouselController,
      mediaControlsController = host._popupMediaControlsController,
      recordingScrubController = host._popupRecordingScrubController,
      lifecycleController = host._popupLifecycleController,
      ...loaderDeps
    } = deps;
    this._host = host;
    this._infoController = infoController;
    this._carouselController = carouselController;
    this._mediaControlsController = mediaControlsController;
    this._recordingScrubController = recordingScrubController;
    this._lifecycleController = lifecycleController;
    this._recordingHls = null;
    this._hlsJsCtorPromise = null;
    this._deps = {
      buildVideoOptionsForView,
      createVideoElement,
      mountNodeIntoSlot,
      isIOS,
      preferRecordingHls: () =>
        isIOS || host._isFirefox?.() || host._isEdge?.(),
      isEventPrePostRollEnabled: () =>
        host._config?.event_pre_post_roll_enabled === true,
      isMobileTabletViewport: () =>
        host._isMobileTabletViewport?.() === true,
      createPopupViewResizeGrip,
      createPopupViewResizeController: (options) =>
        new PopupViewResizeController(options),
      resolveRecordingHlsJsUrl,
      ...loaderDeps,
    };
  }

  _bindViewResize({ viewer, media, controls = null }) {
    if (!viewer || !media) return null;
    const zoomController =
      this._host._attachPopupVideoZoom?.(media) || null;
    const grip = this._deps.createPopupViewResizeGrip?.();
    if (!grip) return null;
    viewer.appendChild?.(grip);
    const controller = this._deps.createPopupViewResizeController?.({
      viewer,
      media,
      grip,
      controls,
      zoomController,
      getAvailableMaxHeight: () =>
        this._resolveAvailableViewResizeHeight(viewer),
    });
    controller?.bind?.();
    return { controller, grip };
  }

  _resolveAvailableViewResizeHeight(viewer) {
    if (this._host._isCardViewPageActive?.() !== true) return 0;
    const body = viewer?.closest?.(".popup-body") || null;
    const metadata = this._host._$?.("#popup-info-head") || null;
    const viewerRect = viewer?.getBoundingClientRect?.() || null;
    const bodyRect = body?.getBoundingClientRect?.() || null;
    const metadataRect = metadata?.getBoundingClientRect?.() || null;
    return resolvePopupViewAvailableMaxHeight({
      viewerHeight: viewerRect?.height,
      containerBottom: bodyRect?.bottom,
      keepVisibleBottom: metadataRect?.bottom,
    });
  }

  _placeViewResizeGrip({ viewer, media, grip }) {
    if (!grip) return "none";
    return placePopupViewResizeGrip({
      viewer,
      media,
      grip,
      metadataHost: this._host._$?.("#popup-info-head") || null,
      mobileTablet: this._deps.isMobileTabletViewport?.() === true,
    });
  }

  renderPopupMedia({
    playingId,
    html,
    mediaElement,
    mediaType,
    infoEvent,
    infoOpts,
    onMediaError = null,
  }) {
    const compact = infoOpts?.compact === true;
    this._lifecycleController?.setCompact?.(compact);
    this._lifecycleController?.clearMediaCleanup();
    const token = this._nextPlaybackToken();
    this._carouselController?.clear?.();
    this._lifecycleController?.enter();
    const isElement =
      typeof Element !== "undefined" && mediaElement instanceof Element;
    const renderPlan = resolvePopupMediaRenderPlan({
      infoOpts,
      mediaType,
      hasMediaElement: isElement,
      html,
    });
    this._lifecycleController?.setMediaState({
      mediaType: renderPlan.popupMediaType,
      playing: playingId ? { id: playingId } : null,
    });
    const viewer = this._host._$("#viewer");
    viewer.innerHTML = "";
    if (renderPlan.shouldAppendMediaElement) {
      viewer.appendChild(mediaElement);
    } else {
      viewer.innerHTML = renderPlan.viewerHtml;
    }
    const popup = this._host._$?.("#myPopup") || null;
    const body = popup?.querySelector(".popup-body");
    if (body) body.scrollTop = 0;
    const video = viewer.querySelector("video");
    const snapshot = viewer.querySelector("img.snap");
    const displayedMedia = video || snapshot;
    const controls = this._host._$?.("#popup-media-controls");
    const clearMediaSizing = bindPopupMediaSizing({
      viewer,
      media: displayedMedia,
      controls,
    });
    const clearVideoReadiness = bindPopupVideoReadiness({ viewer, video });
    const viewResize = this._bindViewResize({
      viewer,
      media: displayedMedia,
      controls,
    });
    const guardedMediaError =
      displayedMedia && typeof onMediaError === "function"
        ? () => {
            if (this._isPlaybackTokenCurrent(token)) onMediaError();
          }
        : null;
    if (guardedMediaError) {
      displayedMedia.addEventListener?.("error", guardedMediaError, {
        once: true,
      });
    }
    this._lifecycleController?.setMediaCleanup?.(() => {
      viewResize?.controller?.dispose?.();
      clearMediaSizing();
      clearVideoReadiness();
      if (guardedMediaError) {
        displayedMedia?.removeEventListener?.("error", guardedMediaError);
      }
    });
    const postRenderPlan = resolvePopupMediaPostRenderPlan({
      popupMediaType: renderPlan.popupMediaType,
      activeId: playingId || "",
      hasVideo: !!video,
      compact,
    });
    if (postRenderPlan.shouldEnsureAirPlayButton) {
      this._mediaControlsController?.ensurePlaybackButtons(
        postRenderPlan.airPlayMediaType,
      );
    }
    if (postRenderPlan.shouldInitPopupMediaControls) {
      this._mediaControlsController?.initialize(
        video,
        renderPlan.popupMediaType,
      );
    } else if (postRenderPlan.shouldResetControlsWithoutVideo) {
      this._mediaControlsController?.resetWithoutVideo(renderPlan.controlsPlan);
    }
    if (postRenderPlan.shouldRenderInfo) {
      this._infoController?.render(infoEvent, infoOpts);
    }
    this._placeViewResizeGrip({
      viewer,
      media: displayedMedia,
      grip: viewResize?.grip,
    });
    if (postRenderPlan.shouldRenderCarousel) {
      this._carouselController?.render(
        postRenderPlan.carouselMediaType,
        postRenderPlan.carouselActiveId,
      );
    }
    if (postRenderPlan.shouldScheduleRotateOverlay) {
      this._host._scheduleRotateOverlayUpdate();
    }
    if (postRenderPlan.shouldShowPopupControls) {
      this._mediaControlsController?.showTemporarily();
    }
    this._host._preparePopupPlaybackTarget?.();
  }

  buildPopupVideo(src, { autoplay = true, muted = true } = {}) {
    return this._deps.createVideoElement(
      this._deps.buildVideoOptionsForView(
        "popup",
        {
          autoplay,
          muted,
          controls: false,
          src,
        },
        { scopeKey: this._host },
      ),
    );
  }

  buildPopupClipSrc(id, file, camera = "") {
    return buildPopupMediaUrl({
      baseUrl:
        this._host._mediaForCamera?.(id, file, camera) ||
        this._host._media(id, file),
      cacheKey: `${id}:${Date.now()}`,
    });
  }

  buildPopupSnapshotSrc(event) {
    return (
      this._host._mediaForCamera?.(
        event?.id,
        "snapshot.jpg",
        event?.camera,
      ) || this._host._media(event?.id, "snapshot.jpg")
    );
  }

  showClip(event, opts = {}) {
    const range = resolveFrigateEventPrePostRollRange({
      event,
      enabled:
        opts.skipPrePostRoll !== true &&
        this._deps.isEventPrePostRollEnabled(),
    });
    if (range) {
      return this.showEventRecording(event, opts, range);
    }
    return this._showDirectClip(event, opts);
  }

  _showDirectClip(event, opts = {}) {
    const renderPlan = buildPopupClipRenderPlan({
      id: event.id,
      opts,
      infoEvent: event,
      isIos: this._deps.isIOS,
    });
    const src = this.buildPopupClipSrc(
      event.id,
      renderPlan.mediaFile,
      event?.camera,
    );
    this.renderPopupMedia({
      playingId: renderPlan.playingId,
      mediaElement: this.buildPopupVideo(src),
      mediaType: renderPlan.mediaType,
      infoEvent: renderPlan.infoEvent,
      infoOpts: renderPlan.infoOpts,
      onMediaError: () => this.showUnavailableClipFallback(event, opts),
    });
  }

  showClipById(id, opts = {}) {
    if (!id) return;
    const event = this._host._findEventById(id);
    const range = resolveFrigateEventPrePostRollRange({
      event,
      enabled:
        opts.skipPrePostRoll !== true &&
        this._deps.isEventPrePostRollEnabled(),
    });
    if (range) {
      return this.showEventRecording(event, opts, range);
    }
    const renderPlan = buildPopupClipRenderPlan({
      id,
      opts,
      infoEvent: event,
      isIos: this._deps.isIOS,
      includeLookupInfo: true,
    });
    const src = this.buildPopupClipSrc(
      id,
      renderPlan.mediaFile,
      event?.camera || opts.camera,
    );
    this.renderPopupMedia({
      playingId: renderPlan.playingId,
      mediaElement: this.buildPopupVideo(src),
      mediaType: renderPlan.mediaType,
      infoEvent: renderPlan.infoEvent,
      infoOpts: renderPlan.infoOpts,
      onMediaError: () =>
        this.showUnavailableClipFallback(
          event || {
            id,
            camera: opts.camera || "",
            start_time: opts.startTime,
            has_clip: true,
          },
          opts,
        ),
    });
  }

  showSnapshot(event, opts = {}) {
    const renderPlan = buildPopupSnapshotRenderPlan({ event, opts });
    this.renderPopupMedia({
      playingId: renderPlan.playingId,
      html: `<img class="snap" src="${this.buildPopupSnapshotSrc(event)}">`,
      mediaType: renderPlan.mediaType,
      infoEvent: renderPlan.infoEvent,
      infoOpts: renderPlan.infoOpts,
      onMediaError: () =>
        this.showUnavailableMedia(event, opts, {
          unavailableType: "snapshot",
          hasClip: event?.has_clip === true,
        }),
    });
  }

  showUnavailableClipFallback(event, opts = {}) {
    if (!event?.id) {
      this.showUnavailableMedia(event, opts, {
        unavailableType: "media",
        hasClip: false,
      });
      return;
    }

    const mediaType = opts.mediaType || "clip";
    this.renderPopupMedia({
      playingId: event.id,
      html: `
        <img class="snap" src="${this.buildPopupSnapshotSrc(event)}">
        <div class="popup-media-fallback-notice" role="status" aria-live="polite">
          <strong>Clip unavailable</strong>
          <span>Showing the event snapshot. Frigate reported a clip for this event, but playback could not be loaded.</span>
        </div>`,
      mediaType,
      infoEvent: event,
      infoOpts: {
        ...opts,
        mediaType,
        displayMediaType: "snapshot",
        hasClip: false,
        hasSnapshot: true,
      },
      onMediaError: () =>
        this.showUnavailableMedia(event, opts, {
          unavailableType: "media",
          hasClip: false,
        }),
    });
  }

  showUnavailableMedia(
    event,
    opts = {},
    { unavailableType = "media", hasClip = false } = {},
  ) {
    const mediaType = opts.mediaType || unavailableType;
    const snapshotOnly = unavailableType === "snapshot";
    const title = snapshotOnly
      ? "Snapshot unavailable"
      : "Media unavailable";
    const detail = snapshotOnly
      ? "The requested snapshot could not be loaded from Frigate."
      : "Frigate reported media for this event, but neither the clip nor snapshot could be loaded.";
    this.renderPopupMedia({
      playingId: event?.id || "",
      html: `
        <div class="popup-media-unavailable" role="status" aria-live="polite">
          <strong>${title}</strong>
          <span>${detail}</span>
          <span>Media may be missing, may have changed, or may have been removed according to the retention policy configured for this camera. Review the camera's recording retention settings in Frigate.</span>
        </div>`,
      mediaType,
      infoEvent: event,
      infoOpts: {
        ...opts,
        mediaType,
        displayMediaType: snapshotOnly ? "snapshot" : "media",
        hasClip,
        hasSnapshot: false,
      },
    });
  }

  showCarouselEventById(id, mediaType = "", opts = {}) {
    if (!id) return false;
    const event = this._host._findEventById(id);
    const selectionPlan = buildPopupCarouselSelectionPlan({
      event,
      mediaType,
    });
    if (!selectionPlan) return false;
    if (selectionPlan.kind === "snapshot") {
      this.showSnapshot(event, {
        mediaType: selectionPlan.mediaType,
        compact: opts.compact === true,
      });
    } else {
      this.showClip(event, {
        mediaType: selectionPlan.mediaType,
        compact: opts.compact === true,
      });
    }
    return true;
  }

  async tryRecordingSource(
    video,
    src,
    { autoplay = true, timeoutMs = 9000 } = {},
  ) {
    if (!video || !src) return false;
    const isHlsSource = /\.m3u8(?:$|\?)/i.test(src);
    this.clearRecordingTransport();

    return await new Promise((resolve) => {
      let done = false;
      const finish = (ok) => {
        if (done) return;
        done = true;
        cleanup();
        resolve(ok);
      };
      const onReady = async () => {
        if (!autoplay) {
          finish(true);
          return;
        }
        try {
          await video.play?.();
          finish(true);
        } catch (_) {
          finish(true);
        }
      };
      const onErr = () => finish(false);
      const cleanup = () => {
        clearTimeout(timer);
        video.removeEventListener("loadedmetadata", onReady);
        video.removeEventListener("canplay", onReady);
        video.removeEventListener("error", onErr);
      };
      const timer = setTimeout(() => finish(false), timeoutMs);

      video.addEventListener("loadedmetadata", onReady, { once: true });
      video.addEventListener("canplay", onReady, { once: true });
      video.addEventListener("error", onErr, { once: true });

      const boot = async () => {
        try {
          if (!isHlsSource) {
            video.src = src;
            video.load();
            return;
          }

          const canNativeHls = !!video.canPlayType(
            "application/vnd.apple.mpegurl",
          );
          if (canNativeHls) {
            video.src = src;
            video.load();
            return;
          }

          const HlsCtor = await this._getHlsJsCtor();
          if (!HlsCtor || !HlsCtor.isSupported?.()) {
            finish(false);
            return;
          }

          const hls = new HlsCtor({
            enableWorker: true,
            maxBufferLength: 60,
            backBufferLength: 90,
          });
          this._recordingHls = hls;
          hls.on(HlsCtor.Events.ERROR, (_evt, data) => {
            if (data?.fatal) finish(false);
          });
          hls.attachMedia(video);
          hls.on(HlsCtor.Events.MEDIA_ATTACHED, () => {
            hls.loadSource(src);
          });
        } catch (_) {
          finish(false);
        }
      };
      void boot();
    });
  }

  async showRecording(start, end, opts = {}) {
    return await this._showRecordingRange(start, end, {
      fallbackOpts: opts,
      compact: opts.compact === true,
    });
  }

  async showEventRecording(event, opts, range) {
    return await this._showRecordingRange(range.start, range.end, {
      event,
      mediaType: opts.mediaType || "clip",
      fallbackOpts: opts,
      range,
    });
  }

  async _showRecordingRange(
    start,
    end,
    {
      event = null,
      mediaType = "recording",
      fallbackOpts = {},
      range = null,
      compact = fallbackOpts?.compact === true,
    } = {},
  ) {
    this._lifecycleController?.setCompact?.(compact);
    this._lifecycleController?.clearMediaCleanup();
    const token = this._nextPlaybackToken();
    this._carouselController?.clear?.();
    this._lifecycleController?.enter();
    const activeContext = this._host._cc();
    const eventContext = event?.camera
      ? this._host._frigateContextForCameraName?.(event.camera)
      : null;
    const providedContext =
      fallbackOpts?.clientId && fallbackOpts?.camera
        ? {
            clientId: fallbackOpts.clientId,
            cam: fallbackOpts.camera,
          }
        : null;
    const { clientId, cam: activeCamera } =
      eventContext || providedContext || activeContext;
    const cam = event?.camera || fallbackOpts?.camera || activeCamera;
    const playbackPlan = buildRecordingPlaybackPlan({
      clientId,
      camera: cam,
      start,
      end,
      preferHls: this._deps.preferRecordingHls(),
    });
    const renderPlan = event
      ? buildPopupEventRecordingRenderPlan({
          event,
          opts: { ...fallbackOpts, mediaType },
          range,
          playbackPlan,
        })
      : buildPopupRecordingRenderPlan({
          start,
          end,
          playbackPlan,
          opts: { compact },
        });
    const sourceAttemptPlan = buildPopupRecordingSourceAttemptPlan({
      sourceCandidates: renderPlan.sourceCandidates,
    });
    const seekListenerPlan = resolvePopupRecordingSeekListenerPlan();
    this._lifecycleController?.setMediaState({
      mediaType: renderPlan.popupMediaType,
      playing: renderPlan.playing,
    });
    this._infoController?.render(renderPlan.infoEvent, renderPlan.infoOpts);
    this._lifecycleController?.setMediaCamera?.(cam);
    const viewer = this._host.shadowRoot.querySelector("#viewer");
    viewer.innerHTML = '<div class="ld">Loading…</div>';
    if (this._host._playSeq !== token) return;
    const video = this._deps.createVideoElement(
      this._deps.buildVideoOptionsForView(
        event ? "popup" : "recording",
        {
          muted: true,
          controls: false,
        },
        { scopeKey: this._host },
      ),
    );
    this._deps.mountNodeIntoSlot(viewer, video);
    const clearMediaSizing = bindPopupMediaSizing({
      viewer,
      media: video,
      controls: this._host._$?.("#popup-media-controls"),
    });
    const clearVideoReadiness = bindPopupVideoReadiness({ viewer, video });
    const viewResize = this._bindViewResize({
      viewer,
      media: video,
      controls: this._host._$?.("#popup-media-controls"),
    });
    this._placeViewResizeGrip({
      viewer,
      media: video,
      grip: viewResize?.grip,
    });
    this._mediaControlsController?.ensurePlaybackButtons?.(
      renderPlan.popupMediaType,
    );
    this._mediaControlsController?.initialize?.(
      video,
      renderPlan.popupMediaType,
    );
    this._host._scheduleRotateOverlayUpdate?.();
    this._mediaControlsController?.showTemporarily?.();
    let playable = false;
    let activeSource = "";
    const mediaCleanup = [
      () => viewResize?.controller?.dispose?.(),
      clearMediaSizing,
      clearVideoReadiness,
    ];
    let mediaCleaned = false;
    const runMediaCleanup = () => {
      if (mediaCleaned) return;
      mediaCleaned = true;
      for (const fn of mediaCleanup) {
        try {
          fn();
        } catch (_) {}
      }
    };
    this._lifecycleController?.setMediaCleanup?.(runMediaCleanup);
    const scrubInitPlan =
      video && !event
        ? buildPopupRecordingScrubInitPlan({
            clientId,
            cam,
            start,
            chunkEnd: renderPlan.chunkEnd,
            token,
            sourceUrl: "",
          })
        : null;
    if (scrubInitPlan) {
      void this._recordingScrubController?.initialize({
        clientId: scrubInitPlan.clientId,
        cam: scrubInitPlan.cam,
        start: scrubInitPlan.start,
        end: scrubInitPlan.end,
        video,
        token: scrubInitPlan.token,
        sourceUrl: scrubInitPlan.sourceUrl,
      });
    }
    if (video) {
      let resumeAfterNativeSeek = false;
      const onSeeking = () => {
        if (!video.seeking) return;
        if (!video.paused) {
          resumeAfterNativeSeek = true;
          video.pause?.();
        }
      };
      const onSeeked = () => {
        if (!resumeAfterNativeSeek) return;
        resumeAfterNativeSeek = false;
        video.play?.().catch(() => {});
      };
      const seekHandlers = {
        pauseForSeek: onSeeking,
        resumeAfterSeek: onSeeked,
      };
      seekListenerPlan.listeners.forEach(({ type, action }) => {
        video.addEventListener(type, seekHandlers[action]);
        mediaCleanup.push(() =>
          video.removeEventListener(type, seekHandlers[action]),
        );
      });

      for (const attempt of sourceAttemptPlan.attempts) {
        if (this._host._playSeq !== token) return;
        const signed = await this._host._signed(attempt.path);
        if (this._host._playSeq !== token) return;
        playable = await this.tryRecordingSource(video, signed, {
          autoplay: attempt.autoplay,
        });
        if (this._host._playSeq !== token) return;
        if (playable) {
          activeSource = signed;
          this._recordingScrubController?.setSourceUrl?.(activeSource);
          break;
        }
      }

      if (!playable) {
        const outcomePlan = resolvePopupRecordingLoadOutcomePlan({
          playable,
          popupMediaType: renderPlan.popupMediaType,
          carouselMediaType: renderPlan.carouselMediaType,
          carouselActiveId: renderPlan.carouselActiveId,
          compact,
        });
        runMediaCleanup();
        if (outcomePlan.shouldShowError) {
          viewer.innerHTML = outcomePlan.errorHtml;
        }
        this._mediaControlsController?.resetWithoutVideo?.();
        if (outcomePlan.shouldTeardownScrub) {
          this._recordingScrubController?.teardown();
        }
        this.clearRecordingTransport();
        this._host._clearPopupVideoZoom?.();
        if (event && this._host._playSeq === token) {
          this._showDirectClip(event, {
            ...fallbackOpts,
            mediaType,
            skipPrePostRoll: true,
          });
        }
        return;
      }
    }
    const outcomePlan = resolvePopupRecordingLoadOutcomePlan({
      playable,
      popupMediaType: renderPlan.popupMediaType,
      carouselMediaType: renderPlan.carouselMediaType,
      carouselActiveId: renderPlan.carouselActiveId,
      compact,
    });
    if (outcomePlan.shouldEnsureAirPlayButton) {
      this._mediaControlsController?.syncPlaybackButtons?.();
    }
    if (outcomePlan.shouldScheduleRotateOverlay) {
      this._host._scheduleRotateOverlayUpdate();
    }
    if (video && outcomePlan.shouldInitPopupMediaControls) {
      this._mediaControlsController?.update?.(video);
    }
    if (outcomePlan.shouldRenderCarousel) {
      this._carouselController?.render(
        outcomePlan.carouselMediaType,
        outcomePlan.carouselActiveId,
      );
    }
    if (outcomePlan.shouldShowPopupControls) {
      this._mediaControlsController?.showTemporarily();
    }
    this._host._preparePopupPlaybackTarget?.();
  }

  cancelPendingLoad() {
    this._nextPlaybackToken();
    this._recordingScrubController?.teardown?.();
    this.clearRecordingTransport();
  }

  clearRecordingTransport() {
    if (!this._recordingHls) return;
    try {
      this._recordingHls.destroy();
    } catch (_) {}
    this._recordingHls = null;
  }

  _nextPlaybackToken() {
    const token = (Number(this._host?._playSeq) || 0) + 1;
    if (this._host) this._host._playSeq = token;
    return token;
  }

  _isPlaybackTokenCurrent(token) {
    return Number(this._host?._playSeq) === Number(token);
  }

  async _getHlsJsCtor() {
    const existing = globalThis.window?.Hls;
    if (existing) return existing;
    if (!this._hlsJsCtorPromise) {
      this._hlsJsCtorPromise = new Promise((resolve) => {
        let scriptSrc = "";
        try {
          scriptSrc = this._deps.resolveRecordingHlsJsUrl?.() || "";
        } catch (_) {
          resolve(null);
          return;
        }
        const script = globalThis.document?.createElement?.("script");
        const head = globalThis.document?.head;
        if (!scriptSrc || !script || !head?.appendChild) {
          resolve(null);
          return;
        }
        const finish = (ctor) => {
          script.onload = null;
          script.onerror = null;
          script.remove?.();
          resolve(ctor || null);
        };
        script.src = scriptSrc;
        script.async = true;
        script.integrity = RECORDING_HLS_JS_INTEGRITY;
        script.crossOrigin = "anonymous";
        script.referrerPolicy = "no-referrer";
        script.onload = () => finish(globalThis.window?.Hls);
        script.onerror = () => finish(null);
        head.appendChild(script);
      });
    }
    return await this._hlsJsCtorPromise;
  }
}
