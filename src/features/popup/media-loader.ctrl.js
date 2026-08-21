import {
  buildVideoOptionsForView,
  createVideoElement,
  mountNodeIntoSlot,
} from "../../shared/media/video-factory.js";
import { buildPopupMediaUrl } from "../../shared/media/url-utils.js";
import { isIOS } from "../../helpers.js";
import {
  buildPopupClipRenderPlan,
  buildPopupCarouselSelectionPlan,
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
      ...loaderDeps,
    };
  }

  renderPopupMedia({
    playingId,
    html,
    mediaElement,
    mediaType,
    infoEvent,
    infoOpts,
  }) {
    this._lifecycleController?.enter();
    this._lifecycleController?.clearMediaCleanup();
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
    const body = this._host._$("#myPopup")?.querySelector(".popup-body");
    if (body) body.scrollTop = 0;
    const video = viewer.querySelector("video");
    const snapshot = viewer.querySelector("img.snap");
    this._host._attachPopupVideoZoom?.(video || snapshot);
    const postRenderPlan = resolvePopupMediaPostRenderPlan({
      popupMediaType: renderPlan.popupMediaType,
      activeId: playingId || "",
      hasVideo: !!video,
    });
    if (postRenderPlan.shouldEnsureAirPlayButton) {
      this._mediaControlsController?.ensurePlaybackButtons(
        postRenderPlan.airPlayMediaType,
      );
    }
    if (postRenderPlan.shouldRenderInfo) {
      this._infoController?.render(infoEvent, infoOpts);
    }
    if (postRenderPlan.shouldInitPopupMediaControls) {
      this._mediaControlsController?.initialize(
        video,
        renderPlan.popupMediaType,
      );
    } else if (postRenderPlan.shouldResetControlsWithoutVideo) {
      this._mediaControlsController?.resetWithoutVideo(renderPlan.controlsPlan);
    }
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
          src,
        },
        { scopeKey: this._host },
      ),
    );
  }

  buildPopupClipSrc(id, file) {
    return buildPopupMediaUrl({
      baseUrl: this._host._media(id, file),
      cacheKey: `${id}:${Date.now()}`,
    });
  }

  showClip(event, opts = {}) {
    const renderPlan = buildPopupClipRenderPlan({
      id: event.id,
      opts,
      infoEvent: event,
      isIos: this._deps.isIOS,
    });
    const src = this.buildPopupClipSrc(event.id, renderPlan.mediaFile);
    this.renderPopupMedia({
      playingId: renderPlan.playingId,
      mediaElement: this.buildPopupVideo(src),
      mediaType: renderPlan.mediaType,
      infoEvent: renderPlan.infoEvent,
      infoOpts: renderPlan.infoOpts,
    });
  }

  showClipById(id, opts = {}) {
    if (!id) return;
    const renderPlan = buildPopupClipRenderPlan({
      id,
      opts,
      infoEvent: this._host._findEventById(id),
      isIos: this._deps.isIOS,
      includeLookupInfo: true,
    });
    const src = this.buildPopupClipSrc(id, renderPlan.mediaFile);
    this.renderPopupMedia({
      playingId: renderPlan.playingId,
      mediaElement: this.buildPopupVideo(src),
      mediaType: renderPlan.mediaType,
      infoEvent: renderPlan.infoEvent,
      infoOpts: renderPlan.infoOpts,
    });
  }

  showSnapshot(event, opts = {}) {
    const renderPlan = buildPopupSnapshotRenderPlan({ event, opts });
    this.renderPopupMedia({
      playingId: renderPlan.playingId,
      html: `<img class="snap" src="${this._host._media(event.id, "snapshot.jpg")}">`,
      mediaType: renderPlan.mediaType,
      infoEvent: renderPlan.infoEvent,
      infoOpts: renderPlan.infoOpts,
    });
  }

  showCarouselEventById(id, mediaType = "") {
    if (!id) return false;
    const event = this._host._findEventById(id);
    const selectionPlan = buildPopupCarouselSelectionPlan({
      event,
      mediaType,
    });
    if (!selectionPlan) return false;
    if (selectionPlan.kind === "snapshot") {
      this.showSnapshot(event, { mediaType: selectionPlan.mediaType });
    } else {
      this.showClip(event, { mediaType: selectionPlan.mediaType });
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

  async showRecording(start, end) {
    const token = ++this._host._playSeq;
    this._lifecycleController?.enter();
    this._lifecycleController?.clearMediaCleanup();
    const { clientId, cam } = this._host._cc();
    const playbackPlan = buildRecordingPlaybackPlan({
      clientId,
      camera: cam,
      start,
      end,
      preferHls: this._deps.preferRecordingHls(),
    });
    const renderPlan = buildPopupRecordingRenderPlan({
      start,
      end,
      playbackPlan,
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
    const viewer = this._host.shadowRoot.querySelector("#viewer");
    viewer.innerHTML = '<div class="ld">Loading…</div>';
    if (this._host._playSeq !== token) return;
    const video = this._deps.createVideoElement(
      this._deps.buildVideoOptionsForView(
        "recording",
        {
          muted: true,
        },
        { scopeKey: this._host },
      ),
    );
    this._deps.mountNodeIntoSlot(viewer, video);
    this._host._attachPopupVideoZoom?.(video);
    let playable = false;
    let activeSource = "";
    const mediaCleanup = [];
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
        if (playable) {
          activeSource = signed;
          break;
        }
      }

      if (!playable) {
        const outcomePlan = resolvePopupRecordingLoadOutcomePlan({
          playable,
          popupMediaType: renderPlan.popupMediaType,
        });
        for (const fn of mediaCleanup) {
          try {
            fn();
          } catch (_) {}
        }
        if (outcomePlan.shouldShowError) {
          viewer.innerHTML = outcomePlan.errorHtml;
        }
        if (outcomePlan.shouldTeardownScrub) {
          this._recordingScrubController?.teardown();
        }
        this.clearRecordingTransport();
        this._host._clearPopupVideoZoom?.();
        return;
      }
    }
    const outcomePlan = resolvePopupRecordingLoadOutcomePlan({
      playable,
      popupMediaType: renderPlan.popupMediaType,
    });
    if (outcomePlan.shouldEnsureAirPlayButton) {
      this._mediaControlsController?.ensurePlaybackButtons(
        outcomePlan.airPlayMediaType,
      );
    }
    if (outcomePlan.shouldScheduleRotateOverlay) {
      this._host._scheduleRotateOverlayUpdate();
    }
    if (video && outcomePlan.shouldInitPopupMediaControls) {
      const scrubInitPlan = buildPopupRecordingScrubInitPlan({
        clientId,
        cam,
        start,
        chunkEnd: renderPlan.chunkEnd,
        token,
        sourceUrl: activeSource || video.currentSrc || video.src,
      });
      this._mediaControlsController?.initialize(
        video,
        renderPlan.popupMediaType,
      );
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
    this._lifecycleController?.setMediaCleanup(() => {
      for (const fn of mediaCleanup) {
        try {
          fn();
        } catch (_) {}
      }
    });
  }

  clearRecordingTransport() {
    if (!this._recordingHls) return;
    try {
      this._recordingHls.destroy();
    } catch (_) {}
    this._recordingHls = null;
  }

  async _getHlsJsCtor() {
    const existing = globalThis.window?.Hls;
    if (existing) return existing;
    if (!this._hlsJsCtorPromise) {
      this._hlsJsCtorPromise = new Promise((resolve) => {
        const script = globalThis.document?.createElement?.("script");
        if (!script) {
          resolve(null);
          return;
        }
        script.src =
          "https://cdn.jsdelivr.net/npm/hls.js@1.5.17/dist/hls.min.js";
        script.async = true;
        script.onload = () => resolve(globalThis.window?.Hls || null);
        script.onerror = () => resolve(null);
        globalThis.document?.head?.appendChild?.(script);
      });
    }
    return await this._hlsJsCtorPromise;
  }
}
