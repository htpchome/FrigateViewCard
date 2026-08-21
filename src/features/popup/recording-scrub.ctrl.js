import { buildFrigateRecordingReviewMarkers } from "../../integrations/frigate/recording-review-markers.js";
import {
  buildRecordingScrubDecorations,
  formatRecordingScrubTime,
  isRecordingSeekVerified,
  RecordingScrubController,
  resolveRecordingScrubTarget,
  resolveRecordingSeekExecutionPlan,
  resolveRecordingSeekOutcome,
  resolveRecordingSeekTimeout,
} from "../recordings/index.js";

export class PopupRecordingScrubController {
  constructor({
    query,
    fetchReviews = async () => [],
    isPlaybackTokenCurrent = () => true,
    isFirefox = () => false,
    isEdge = () => false,
    isIOS = () => false,
    onFallbackRecording = async () => {},
    buildMarkers = buildFrigateRecordingReviewMarkers,
    createScrubBinding = (options) => new RecordingScrubController(options),
    setTimer = globalThis.setTimeout?.bind(globalThis),
    clearTimer = globalThis.clearTimeout?.bind(globalThis),
  } = {}) {
    this._query = query;
    this._fetchReviews = fetchReviews;
    this._isPlaybackTokenCurrent = isPlaybackTokenCurrent;
    this._isFirefox = isFirefox;
    this._isEdge = isEdge;
    this._isIOS = isIOS;
    this._onFallbackRecording = onFallbackRecording;
    this._buildMarkers = buildMarkers;
    this._createScrubBinding = createScrubBinding;
    this._setTimer = setTimer;
    this._clearTimer = clearTimer;
    this._binding = null;
    this._state = null;
    this._markerCache = new Map();
    this._initGeneration = 0;
  }

  range() {
    if (!this._state) return null;
    return {
      start: this._state.start,
      end: this._state.end,
    };
  }

  async initialize({
    clientId,
    cam,
    start,
    end,
    video,
    token,
    sourceUrl,
  } = {}) {
    const elements = this._elements();
    if (
      !elements.scrub ||
      !elements.track ||
      !elements.markers ||
      !elements.cursor ||
      !video
    ) {
      return null;
    }

    this.teardown();
    const generation = this._initGeneration;
    elements.scrub.hidden = false;
    if (elements.ticks) elements.ticks.innerHTML = "";
    elements.markers.innerHTML = "";

    const alerts = await this._loadMarkers({
      clientId,
      cam,
      start,
      end,
    }).catch(() => []);
    if (
      generation !== this._initGeneration ||
      !this._isPlaybackTokenCurrent?.(token)
    ) {
      return null;
    }

    const decorations = buildRecordingScrubDecorations({
      start,
      end,
      alerts,
    });
    if (elements.labelStart) {
      elements.labelStart.textContent = decorations.labelStart;
    }
    if (elements.labelEnd) {
      elements.labelEnd.textContent = decorations.labelEnd;
    }
    if (elements.labelNow) {
      elements.labelNow.textContent = decorations.labelNow;
    }

    const tickLayer = elements.ticks || elements.markers;
    tickLayer.innerHTML = decorations.tickMarkup;
    elements.markers.innerHTML = decorations.markerMarkup;

    const state = {
      start,
      end,
      alerts,
      video,
      cursor: elements.cursor,
      labelNow: elements.labelNow,
      isScrubbing: false,
      resumeAfterScrub: false,
      pendingAbsTarget: null,
      pendingRelTarget: null,
      seekNonce: 0,
      isFallbackLoading: false,
      sourceUrl: sourceUrl || "",
      sourceUrlNoHash: String(sourceUrl || "").split("#")[0],
    };

    this._state = state;
    this._setCursor(start);
    this._binding = this._createScrubBinding({
      track: elements.track,
      video,
      ticks: elements.ticks,
      markers: elements.markers,
      preview: elements.preview,
      previewImage: elements.previewImage,
      previewLabel: elements.previewLabel,
      state,
      setCursor: (timeSec) => this._setCursor(timeSec),
      seekToRatio: (ratio, options) => this._seekToRatio(ratio, options),
      formatTime: formatRecordingScrubTime,
    });
    this._binding.bind();
    return this.range();
  }

  teardown() {
    this._initGeneration += 1;
    if (this._state) {
      this._state.seekNonce = Number(this._state.seekNonce || 0) + 1;
    }
    if (this._binding) {
      try {
        this._binding.dispose();
      } catch (_) {}
    }
    this._binding = null;
    this._state = null;

    const { scrub, ticks, markers, preview, previewImage } = this._elements();
    if (scrub) scrub.hidden = true;
    if (ticks) ticks.innerHTML = "";
    if (markers) markers.innerHTML = "";
    if (preview) preview.hidden = true;
    previewImage?.removeAttribute?.("src");
  }

  async _loadMarkers({ clientId, cam, start, end }) {
    const cacheKey = `${clientId}|${cam}|${Math.floor(start)}|${Math.floor(end)}`;
    if (this._markerCache.has(cacheKey)) {
      return this._markerCache.get(cacheKey);
    }
    const reviews = await this._fetchReviews(clientId, cam, start, end);
    const markers = this._buildMarkers({
      clientId,
      start,
      end,
      reviews,
    });
    this._markerCache.set(cacheKey, markers);
    return markers;
  }

  _elements() {
    return {
      scrub: this._query?.("#recording-scrub"),
      track: this._query?.("#recording-scrub-track"),
      ticks: this._query?.("#recording-scrub-ticks"),
      markers: this._query?.("#recording-scrub-markers"),
      cursor: this._query?.("#recording-scrub-cursor"),
      preview: this._query?.("#recording-scrub-preview"),
      previewImage: this._query?.("#recording-scrub-preview-image"),
      previewLabel: this._query?.("#recording-scrub-preview-label"),
      labelStart: this._query?.("#recording-scrub-start"),
      labelNow: this._query?.("#recording-scrub-now"),
      labelEnd: this._query?.("#recording-scrub-end"),
    };
  }

  _setCursor(timeSec) {
    const state = this._state;
    if (!state?.cursor || !Number.isFinite(timeSec)) return;
    const span = Math.max(1, state.end - state.start);
    const pct = ((timeSec - state.start) / span) * 100;
    state.cursor.style.left = `${Math.max(0, Math.min(100, pct))}%`;
    if (state.labelNow) {
      const rel = Math.max(0, Math.min(span, timeSec - state.start));
      state.labelNow.textContent = `${formatRecordingScrubTime(rel)} / ${formatRecordingScrubTime(span)}`;
    }
  }

  _seekToRatio(ratio, { commit = false } = {}) {
    const state = this._state;
    if (!state?.video) return;
    const target = resolveRecordingScrubTarget({
      ratio,
      start: state.start,
      end: state.end,
      alerts: state.alerts,
    });

    state.pendingAbsTarget = target.absTarget;
    state.pendingRelTarget = target.relTarget;
    this._setCursor(target.absTarget);
    if (!commit) return;

    const relTarget = Number(state.pendingRelTarget);
    if (!Number.isFinite(relTarget)) return;
    void this._commitSeek(state, relTarget, target.absTarget);
  }

  async _attemptSeek(video, targetSec, timeoutMs = 2500) {
    if (!video || !Number.isFinite(targetSec)) return false;
    return await new Promise((resolve) => {
      let done = false;
      const finish = (ok) => {
        if (done) return;
        done = true;
        cleanup();
        resolve(ok);
      };
      const verify = () => {
        finish(
          isRecordingSeekVerified({
            currentTime: video.currentTime,
            targetSec,
          }),
        );
      };
      const onDone = () => verify();
      const onError = () => finish(false);
      const cleanup = () => {
        this._clearTimer?.(timer);
        video.removeEventListener("seeked", onDone);
        video.removeEventListener("timeupdate", onDone);
        video.removeEventListener("error", onError);
      };
      const timer = this._setTimer?.(() => verify(), timeoutMs);

      video.addEventListener("seeked", onDone, { once: true });
      video.addEventListener("timeupdate", onDone, { once: true });
      video.addEventListener("error", onError, { once: true });

      try {
        const plan = resolveRecordingSeekExecutionPlan({
          hasFastSeek: typeof video.fastSeek === "function",
          isEdge: this._isEdge?.(),
          isIOS: this._isIOS?.(),
        });
        if (plan.shouldUseFastSeek) {
          video.fastSeek(targetSec);
        } else {
          video.currentTime = targetSec;
        }
      } catch (_) {
        finish(false);
      }
    });
  }

  async _commitSeek(state, relTarget, absTarget) {
    if (
      !state?.video ||
      !Number.isFinite(relTarget) ||
      !Number.isFinite(absTarget)
    ) {
      return;
    }

    state.seekNonce = Number(state.seekNonce || 0) + 1;
    const nonce = state.seekNonce;
    const video = state.video;
    const isFirefox = this._isFirefox?.();
    const isEdge = this._isEdge?.();
    const seekTimeout = resolveRecordingSeekTimeout({ isFirefox, isEdge });
    const seekOk = await this._attemptSeek(video, relTarget, seekTimeout);
    if (nonce !== state.seekNonce || state !== this._state) return;

    const outcome = resolveRecordingSeekOutcome({
      isFirefox,
      isEdge,
      seekOk,
      currentTime: video.currentTime,
      relTarget,
      absTarget,
      start: state.start,
      end: state.end,
      resumeAfterScrub: state.resumeAfterScrub,
      isFallbackLoading: state.isFallbackLoading,
    });

    if (outcome.shouldFallback) {
      state.isFallbackLoading = true;
      try {
        await this._onFallbackRecording?.(
          outcome.fallbackStart,
          outcome.fallbackEnd,
        );
      } finally {
        state.isFallbackLoading = false;
      }
      return;
    }

    if (outcome.shouldResumePlayback) {
      video.play?.().catch(() => {});
    }
  }
}
