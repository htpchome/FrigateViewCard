import {
  buildVideoOptionsForView,
  createVideoElement,
  mountNodeIntoSlot,
} from "../../shared/media/video-factory.js";
import { isIOS } from "../../helpers.js";
import {
  buildPopupClipRenderPlan,
  buildPopupMediaUrl,
  buildPopupRecordingRenderPlan,
  buildPopupRecordingScrubInitPlan,
  buildPopupRecordingSourceAttemptPlan,
  buildPopupSnapshotRenderPlan,
  resolvePopupMediaPostRenderPlan,
  resolvePopupMediaRenderPlan,
  resolvePopupRecordingLoadOutcomePlan,
  resolvePopupRecordingSeekListenerPlan,
} from "../../card/popup/media.js";
import { buildRecordingPlaybackPlan } from "../recordings/index.js";

export class PopupMediaLoaderController {
  constructor(host, deps = {}) {
    this._host = host;
    this._deps = {
      buildVideoOptionsForView,
      createVideoElement,
      mountNodeIntoSlot,
      isIOS,
      ...deps,
    };
  }

  renderPopupMedia({
    playingId,
    html,
    mediaElement,
    fullscreenKind,
    infoEvent,
    infoOpts,
  }) {
    this._host._enter();
    this._host._clearPopupMediaCleanup();
    const isElement =
      typeof Element !== "undefined" && mediaElement instanceof Element;
    const renderPlan = resolvePopupMediaRenderPlan({
      infoOpts,
      fullscreenKind,
      hasMediaElement: isElement,
      html,
    });
    this._host._playing = playingId ? { id: playingId } : null;
    this._host._popupMediaType = renderPlan.popupMediaType;
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
    const postRenderPlan = resolvePopupMediaPostRenderPlan({
      popupMediaType: this._host._popupMediaType,
      fullscreenKind,
      activeId: this._host._popupMediaCurrentId(),
      hasVideo: !!video,
    });
    if (postRenderPlan.shouldEnsureFullscreenButton) {
      this._host._ensurePopupFullscreenButton(postRenderPlan.fullscreenKind);
    }
    if (postRenderPlan.shouldRenderInfo) {
      this._host._renderPopupInfo(infoEvent, infoOpts);
    }
    if (postRenderPlan.shouldInitPopupMediaControls) {
      this._host._initPopupMediaControls(video, this._host._popupMediaType);
    } else if (postRenderPlan.shouldResetControlsWithoutVideo) {
      const controls = this._host._$("#popup-media-controls");
      const controlsPlan = renderPlan.controlsPlan;
      if (controls) {
        controls.hidden = controlsPlan.controlsHidden;
        if (controlsPlan.resetControlsHiddenClass) {
          controls.classList.remove("is-hidden");
        }
      }
    }
    if (postRenderPlan.shouldRenderCarousel) {
      this._host._renderPopupCarousel(
        postRenderPlan.carouselMediaType,
        postRenderPlan.carouselActiveId,
      );
    }
    if (postRenderPlan.shouldScheduleRotateOverlay) {
      this._host._scheduleRotateOverlayUpdate();
    }
    if (postRenderPlan.shouldShowPopupControls) {
      this._host._showPopupControlsTemporarily();
    }
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
      fullscreenKind: renderPlan.fullscreenKind,
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
      fullscreenKind: renderPlan.fullscreenKind,
      infoEvent: renderPlan.infoEvent,
      infoOpts: renderPlan.infoOpts,
    });
  }

  showSnapshot(event, opts = {}) {
    const renderPlan = buildPopupSnapshotRenderPlan({ event, opts });
    this.renderPopupMedia({
      playingId: renderPlan.playingId,
      html: `<img class="snap" src="${this._host._media(event.id, "snapshot.jpg")}">`,
      fullscreenKind: renderPlan.fullscreenKind,
      infoEvent: renderPlan.infoEvent,
      infoOpts: renderPlan.infoOpts,
    });
  }

  async tryRecordingSource(
    video,
    src,
    { autoplay = true, timeoutMs = 9000 } = {},
  ) {
    if (!video || !src) return false;
    const isHlsSource = /\.m3u8(?:$|\?)/i.test(src);
    this._host._destroyRecordingHls();

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

          const HlsCtor = await this._host._getHlsJsCtor();
          if (!HlsCtor || !HlsCtor.isSupported?.()) {
            finish(false);
            return;
          }

          const hls = new HlsCtor({
            enableWorker: true,
            maxBufferLength: 60,
            backBufferLength: 90,
          });
          this._host._recordingHls = hls;
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
    this._host._enter();
    this._host._clearPopupMediaCleanup();
    const { clientId, cam } = this._host._cc();
    const playbackPlan = buildRecordingPlaybackPlan({
      clientId,
      camera: cam,
      start,
      end,
      preferHls: this._host._recordingPreferHls(),
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
    this._host._popupMediaType = renderPlan.popupMediaType;
    this._host._playing = renderPlan.playing;
    this._host._renderPopupInfo(renderPlan.infoEvent, renderPlan.infoOpts);
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
          fullscreenKind: renderPlan.fullscreenKind,
        });
        for (const fn of mediaCleanup) {
          try {
            fn();
          } catch (_) {}
        }
        if (outcomePlan.shouldShowError) {
          viewer.innerHTML = outcomePlan.errorHtml;
        }
        if (outcomePlan.shouldTeardownScrub)
          this._host._teardownRecordingScrub();
        const scrub = this._host._$("#recording-scrub");
        if (scrub && outcomePlan.shouldHideScrub) scrub.hidden = true;
        return;
      }
    }
    const outcomePlan = resolvePopupRecordingLoadOutcomePlan({
      playable,
      popupMediaType: renderPlan.popupMediaType,
      fullscreenKind: renderPlan.fullscreenKind,
    });
    if (outcomePlan.shouldEnsureFullscreenButton) {
      this._host._ensurePopupFullscreenButton(outcomePlan.fullscreenKind);
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
      this._host._initPopupMediaControls(video, renderPlan.popupMediaType);
      this._host._initRecordingScrub({
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
      this._host._renderPopupCarousel(
        outcomePlan.carouselMediaType,
        outcomePlan.carouselActiveId,
      );
    }
    if (outcomePlan.shouldShowPopupControls) {
      this._host._showPopupControlsTemporarily();
    }
    this._host._popupMediaCleanup = () => {
      for (const fn of mediaCleanup) {
        try {
          fn();
        } catch (_) {}
      }
    };
  }
}
