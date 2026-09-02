import { buildFrigateRecordingReviewMarkers } from "../../integrations/frigate/recording-review-markers.js";
import { CleanupController } from "../../shared/cleanup.js";
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

const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

export const resolveRecordingSegmentSelection = ({
  rangeStart = 0,
  rangeEnd = 0,
  selectionStart = rangeStart,
  selectionEnd = rangeEnd,
  handle = "start",
  value = rangeStart,
  minDurationSec = 1,
} = {}) => {
  const start = Number(rangeStart) || 0;
  const end = Math.max(start, Number(rangeEnd) || start);
  const span = end - start;
  const minimum = Math.min(
    span,
    Math.max(0, Number(minDurationSec) || 0),
  );
  const currentStart = clamp(
    Number(selectionStart) || start,
    start,
    Math.max(start, end - minimum),
  );
  const currentEnd = clamp(
    Number(selectionEnd) || end,
    currentStart + minimum,
    end,
  );
  const target = clamp(Number(value) || start, start, end);

  if (handle === "end") {
    return {
      start: currentStart,
      end: clamp(target, currentStart + minimum, end),
    };
  }

  return {
    start: clamp(target, start, currentEnd - minimum),
    end: currentEnd,
  };
};

export const resolveRecordingSegmentPercent = (value, start, end) => {
  const safeStart = Number(start) || 0;
  const span = Math.max(1, (Number(end) || safeStart) - safeStart);
  return clamp(((Number(value) - safeStart) / span) * 100, 0, 100);
};

export class PopupRecordingScrubController {
  constructor({
    query,
    fetchReviews = async () => [],
    isPlaybackTokenCurrent = () => true,
    isFirefox = () => false,
    isEdge = () => false,
    isIOS = () => false,
    onFallbackRecording = async () => {},
    onDownloadSegment = async () => {},
    resolveSegmentTimeline = async ({ start, end }) => ({ start, end }),
    resolvePreviewSources = async () => [],
    createPreviewVideo = () => globalThis.document?.createElement?.("video"),
    playIcon = "",
    pauseIcon = "",
    formatClock = (timestamp) => String(timestamp),
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
    this._onDownloadSegment = onDownloadSegment;
    this._resolveSegmentTimeline = resolveSegmentTimeline;
    this._resolvePreviewSources = resolvePreviewSources;
    this._createPreviewVideo = createPreviewVideo;
    this._playIcon = playIcon;
    this._pauseIcon = pauseIcon;
    this._formatClock = formatClock;
    this._buildMarkers = buildMarkers;
    this._createScrubBinding = createScrubBinding;
    this._setTimer = setTimer;
    this._clearTimer = clearTimer;
    this._binding = null;
    this._segmentCleanup = new CleanupController();
    this._segmentElements = null;
    this._segmentDrag = null;
    this._previewVideo = null;
    this._previewLoadNonce = 0;
    this._previewReturnFocus = null;
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

  segmentRange() {
    if (!this._state) return null;
    return {
      start: this._state.segmentStart,
      end: this._state.segmentEnd,
    };
  }

  setSourceUrl(sourceUrl = "") {
    if (!this._state) return false;
    this._state.sourceUrl = String(sourceUrl || "");
    this._state.sourceUrlNoHash = this._state.sourceUrl.split("#")[0];
    return true;
  }

  toggleSegmentManager(force = null) {
    if (!this._state) return false;
    this._state.segmentOpen =
      typeof force === "boolean" ? force : !this._state.segmentOpen;
    this._renderCurrentDecorations();
    this._syncSegmentUi();
    this._setCursor(
      this._state.start + Number(this._state.video?.currentTime || 0),
    );
    return this._state.segmentOpen;
  }

  resetSegmentSelection() {
    if (!this._state) return null;
    this._state.segmentStart = this._state.start;
    this._state.segmentEnd = this._state.end;
    this._syncSegmentUi();
    return this.segmentRange();
  }

  cancelSegmentSelection({ restoreFocus = true } = {}) {
    if (!this._state) return false;
    if (this._state.segmentPreviewOpen) {
      this.closeSegmentPreview({ restoreFocus: false });
    }
    this._state.segmentOpen = false;
    this._segmentDrag = null;
    this._renderCurrentDecorations();
    this._syncSegmentUi();
    this._setCursor(
      this._state.start + Number(this._state.video?.currentTime || 0),
    );
    if (restoreFocus) this._segmentElements?.segmentToggle?.focus?.();
    return true;
  }

  handleClick(event, target = event?.target) {
    const previewClose = target?.closest?.(
      "[data-recording-segment-preview-close]",
    );
    if (previewClose) {
      event?.preventDefault?.();
      event?.stopPropagation?.();
      this.closeSegmentPreview();
      return true;
    }

    const previewDownload = target?.closest?.(
      "#recording-segment-preview-download",
    );
    if (previewDownload) {
      event?.preventDefault?.();
      event?.stopPropagation?.();
      void this._downloadSelectedSegment();
      return true;
    }

    const preview = target?.closest?.("#recording-segment-preview-button");
    if (preview) {
      event?.preventDefault?.();
      event?.stopPropagation?.();
      void this.openSegmentPreview();
      return true;
    }

    const scrubPlay = target?.closest?.("#recording-scrub-play");
    if (scrubPlay) {
      event?.preventDefault?.();
      event?.stopPropagation?.();
      this._toggleRecordingPlayback();
      return true;
    }

    const toggle = target?.closest?.("[data-rec-segment-toggle]");
    if (toggle) {
      event?.preventDefault?.();
      event?.stopPropagation?.();
      this.toggleSegmentManager();
      return true;
    }

    const cancel = target?.closest?.("#recording-segment-cancel");
    if (cancel) {
      event?.preventDefault?.();
      event?.stopPropagation?.();
      this.cancelSegmentSelection();
      return true;
    }

    const reset = target?.closest?.("#recording-segment-reset");
    if (reset) {
      event?.preventDefault?.();
      event?.stopPropagation?.();
      this.resetSegmentSelection();
      return true;
    }

    const download = target?.closest?.("#recording-segment-download");
    if (!download) return false;
    event?.preventDefault?.();
    event?.stopPropagation?.();
    void this._downloadSelectedSegment();
    return true;
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

    const state = {
      clientId,
      cam,
      start,
      end,
      timelineStart: start,
      timelineEnd: end,
      alerts: [],
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
      segmentOpen: false,
      segmentStart: start,
      segmentEnd: end,
      segmentDownloadPending: false,
      segmentPreviewOpen: false,
      segmentPreviewPending: false,
    };

    this._state = state;
    this._segmentElements = elements;
    this._renderDecorations(elements, { start, end, alerts: [] });
    this._bindSegmentControls(elements);
    this._syncSegmentUi(elements);
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

    const isCurrentInitialization = () =>
      generation === this._initGeneration &&
      state === this._state &&
      this._isPlaybackTokenCurrent?.(token);
    const markerLoad = this._loadMarkers({
      clientId,
      cam,
      start,
      end,
    })
      .catch(() => [])
      .then((alerts) => {
        if (!isCurrentInitialization()) return alerts;
        state.alerts = alerts;
        this._renderCurrentDecorations(elements);
        return alerts;
      });
    const timelineLoad = Promise.resolve()
      .then(() => this._resolveSegmentTimeline?.({ clientId, cam, start, end }))
      .catch(() => ({ start, end }))
      .then((timeline) => {
        if (!isCurrentInitialization()) return timeline;
        state.timelineStart = Math.min(
          start,
          Number.isFinite(Number(timeline?.start))
            ? Number(timeline.start)
            : start,
        );
        state.timelineEnd = Math.max(
          end,
          Number.isFinite(Number(timeline?.end)) ? Number(timeline.end) : end,
        );
        this._renderCurrentDecorations(elements);
        this._syncSegmentUi(elements);
        this._setCursor(start + Number(video.currentTime || 0));
        return timeline;
      });

    await Promise.all([markerLoad, timelineLoad]);
    if (!isCurrentInitialization()) {
      return null;
    }
    return this.range();
  }

  teardown() {
    const elements = this._segmentElements || this._elements();
    this.closeSegmentPreview({ restoreFocus: false, elements });
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
    this._segmentCleanup.dispose();
    this._segmentCleanup = new CleanupController();
    this._segmentDrag = null;
    this._state = null;

    const { scrub, ticks, markers, preview, previewImage } = elements;
    if (scrub) scrub.hidden = true;
    if (ticks) ticks.innerHTML = "";
    if (markers) markers.innerHTML = "";
    if (preview) preview.hidden = true;
    previewImage?.removeAttribute?.("src");
    this._syncSegmentUi(elements);
    this._segmentElements = null;
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

  _activeTimelineRange() {
    const state = this._state;
    if (!state) return { start: 0, end: 0 };
    if (!state.segmentOpen) return { start: state.start, end: state.end };
    return {
      start: state.timelineStart,
      end: state.timelineEnd,
    };
  }

  _renderCurrentDecorations(
    elements = this._segmentElements || this._elements(),
  ) {
    const state = this._state;
    if (!state) return;
    const timeline = this._activeTimelineRange();
    this._renderDecorations(elements, {
      start: timeline.start,
      end: timeline.end,
      recordingStart: state.start,
      recordingEnd: state.end,
      alerts: state.alerts,
    });
  }

  _renderDecorations(
    elements,
    { start, end, recordingStart = start, recordingEnd = end, alerts = [] } = {},
  ) {
    const decorations = buildRecordingScrubDecorations({
      start,
      end,
      recordingStart,
      recordingEnd,
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
    if (tickLayer) tickLayer.innerHTML = decorations.tickMarkup;
    if (elements.markers) {
      elements.markers.innerHTML = decorations.markerMarkup;
    }
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
      segmentSelection: this._query?.("#recording-segment-selection"),
      segmentShadeStart: this._query?.("#recording-segment-shade-start"),
      segmentKeep: this._query?.("#recording-segment-keep"),
      segmentShadeEnd: this._query?.("#recording-segment-shade-end"),
      segmentHandleStart: this._query?.("#recording-segment-handle-start"),
      segmentHandleEnd: this._query?.("#recording-segment-handle-end"),
      segmentHandleStartTime: this._query?.(
        "#recording-segment-handle-start-time",
      ),
      segmentHandleEndTime: this._query?.(
        "#recording-segment-handle-end-time",
      ),
      segmentManager: this._query?.("#recording-segment-manager"),
      segmentStartLabel: this._query?.("#recording-segment-start-label"),
      segmentEndLabel: this._query?.("#recording-segment-end-label"),
      segmentDuration: this._query?.("#recording-segment-duration"),
      segmentReset: this._query?.("#recording-segment-reset"),
      segmentCancel: this._query?.("#recording-segment-cancel"),
      segmentPreviewButton: this._query?.(
        "#recording-segment-preview-button",
      ),
      segmentDownload: this._query?.("#recording-segment-download"),
      segmentToggle: this._query?.("[data-rec-segment-toggle]"),
      scrubPlay: this._query?.("#recording-scrub-play"),
      segmentPreviewModal: this._query?.(
        "#recording-segment-preview-modal",
      ),
      segmentPreviewClose: this._query?.(
        ".recording-segment-preview-close",
      ),
      segmentPreviewRange: this._query?.(
        "#recording-segment-preview-range",
      ),
      segmentPreviewVideoHost: this._query?.(
        "#recording-segment-preview-video-host",
      ),
      segmentPreviewStatus: this._query?.(
        "#recording-segment-preview-status",
      ),
      segmentPreviewDownload: this._query?.(
        "#recording-segment-preview-download",
      ),
    };
  }

  _bindSegmentControls(elements) {
    this._segmentCleanup.dispose();
    this._segmentCleanup = new CleanupController();
    for (const handle of [
      elements.segmentHandleStart,
      elements.segmentHandleEnd,
    ]) {
      this._segmentCleanup.addEventListener(
        handle,
        "pointerdown",
        this._onSegmentPointerDown,
      );
      this._segmentCleanup.addEventListener(
        handle,
        "pointermove",
        this._onSegmentPointerMove,
      );
      this._segmentCleanup.addEventListener(
        handle,
        "pointerup",
        this._onSegmentPointerUp,
      );
      this._segmentCleanup.addEventListener(
        handle,
        "pointercancel",
        this._onSegmentPointerUp,
      );
      this._segmentCleanup.addEventListener(
        handle,
        "keydown",
        this._onSegmentKeyDown,
      );
    }
    for (const type of ["play", "pause", "ended"]) {
      this._segmentCleanup.addEventListener(
        this._state?.video,
        type,
        this._onRecordingPlaybackChange,
      );
    }
    this._segmentCleanup.addEventListener(
      elements.segmentPreviewModal,
      "keydown",
      this._onPreviewModalKeyDown,
    );
  }

  _segmentValueFromClientX(clientX) {
    const state = this._state;
    const track = this._segmentElements?.track;
    const rect = track?.getBoundingClientRect?.();
    if (!state || !rect?.width || !Number.isFinite(clientX)) return null;
    const ratio = clamp((clientX - rect.left) / rect.width, 0, 1);
    const timeline = this._activeTimelineRange();
    return Math.round(
      timeline.start + ratio * (timeline.end - timeline.start),
    );
  }

  _updateSegmentHandle(handle, value) {
    const state = this._state;
    if (!state || !["start", "end"].includes(handle)) return;
    const timeline = this._activeTimelineRange();
    const selection = resolveRecordingSegmentSelection({
      rangeStart: timeline.start,
      rangeEnd: timeline.end,
      selectionStart: state.segmentStart,
      selectionEnd: state.segmentEnd,
      handle,
      value,
    });
    state.segmentStart = selection.start;
    state.segmentEnd = selection.end;
    this._syncSegmentUi();
  }

  _onSegmentPointerDown = (event) => {
    const state = this._state;
    const handle = event?.currentTarget?.dataset?.recordingSegmentHandle;
    if (!state?.segmentOpen || !["start", "end"].includes(handle)) return;
    event.preventDefault?.();
    event.stopPropagation?.();
    this._segmentDrag = { handle, pointerId: event.pointerId };
    event.currentTarget?.setPointerCapture?.(event.pointerId);
  };

  _onSegmentPointerMove = (event) => {
    if (
      !this._segmentDrag ||
      (this._segmentDrag.pointerId != null &&
        event.pointerId !== this._segmentDrag.pointerId)
    ) {
      return;
    }
    event.preventDefault?.();
    event.stopPropagation?.();
    const value = this._segmentValueFromClientX(event.clientX);
    if (value == null) return;
    this._updateSegmentHandle(this._segmentDrag.handle, value);
  };

  _onSegmentPointerUp = (event) => {
    if (!this._segmentDrag) return;
    event.preventDefault?.();
    event.stopPropagation?.();
    const value = this._segmentValueFromClientX(event.clientX);
    if (value != null) {
      this._updateSegmentHandle(this._segmentDrag.handle, value);
    }
    event.currentTarget?.releasePointerCapture?.(event.pointerId);
    this._segmentDrag = null;
  };

  _onSegmentKeyDown = (event) => {
    const state = this._state;
    const handle = event?.currentTarget?.dataset?.recordingSegmentHandle;
    if (!state?.segmentOpen || !["start", "end"].includes(handle)) return;
    const current = handle === "start" ? state.segmentStart : state.segmentEnd;
    const timeline = this._activeTimelineRange();
    const span = Math.max(1, timeline.end - timeline.start);
    const fineStep = event.shiftKey ? 10 : 1;
    const largeStep = Math.max(10, Math.round(span / 20));
    let value = null;
    if (event.key === "ArrowLeft" || event.key === "ArrowDown") {
      value = current - fineStep;
    } else if (event.key === "ArrowRight" || event.key === "ArrowUp") {
      value = current + fineStep;
    } else if (event.key === "PageDown") {
      value = current - largeStep;
    } else if (event.key === "PageUp") {
      value = current + largeStep;
    } else if (event.key === "Home") {
      value = timeline.start;
    } else if (event.key === "End") {
      value = timeline.end;
    }
    if (value == null) return;
    event.preventDefault?.();
    event.stopPropagation?.();
    this._updateSegmentHandle(handle, value);
  };

  _formatSegmentClock(value) {
    const formatted = this._formatClock?.(value);
    if (formatted != null && String(formatted).trim()) return String(formatted);
    const start = Number(this._state?.start) || 0;
    return formatRecordingScrubTime(Number(value) - start);
  }

  _setSegmentHandleAria(handle, value, min, max) {
    if (!handle) return;
    handle.setAttribute?.("aria-valuemin", String(Math.floor(min)));
    handle.setAttribute?.("aria-valuemax", String(Math.floor(max)));
    handle.setAttribute?.("aria-valuenow", String(Math.floor(value)));
    handle.setAttribute?.("aria-valuetext", this._formatSegmentClock(value));
  }

  _syncSegmentUi(elements = this._segmentElements || this._elements()) {
    const state = this._state;
    const isReady = Boolean(state);
    const isOpen = Boolean(state?.segmentOpen);
    if (elements.segmentManager) elements.segmentManager.hidden = !isOpen;
    if (elements.segmentSelection) {
      elements.segmentSelection.hidden = !isOpen;
      elements.segmentSelection.setAttribute?.(
        "aria-hidden",
        String(!isOpen),
      );
    }
    elements.track?.classList?.toggle?.("segment-selection-active", isOpen);
    if (elements.segmentToggle) {
      elements.segmentToggle.disabled = !isReady;
      elements.segmentToggle.setAttribute?.("aria-expanded", String(isOpen));
      elements.segmentToggle.classList?.toggle?.("active", isOpen);
    }
    if (!state) return;
    const timeline = this._activeTimelineRange();

    const startPct = resolveRecordingSegmentPercent(
      state.segmentStart,
      timeline.start,
      timeline.end,
    );
    const endPct = resolveRecordingSegmentPercent(
      state.segmentEnd,
      timeline.start,
      timeline.end,
    );
    if (elements.segmentShadeStart?.style) {
      elements.segmentShadeStart.style.left = "0%";
      elements.segmentShadeStart.style.width = `${startPct}%`;
    }
    if (elements.segmentKeep?.style) {
      elements.segmentKeep.style.left = `${startPct}%`;
      elements.segmentKeep.style.width = `${Math.max(0, endPct - startPct)}%`;
    }
    if (elements.segmentShadeEnd?.style) {
      elements.segmentShadeEnd.style.left = `${endPct}%`;
      elements.segmentShadeEnd.style.width = `${Math.max(0, 100 - endPct)}%`;
    }
    if (elements.segmentHandleStart?.style) {
      elements.segmentHandleStart.style.left = `${startPct}%`;
    }
    if (elements.segmentHandleEnd?.style) {
      elements.segmentHandleEnd.style.left = `${endPct}%`;
    }
    elements.segmentHandleStart?.classList?.toggle?.(
      "at-track-start",
      startPct === 0,
    );
    elements.segmentHandleStart?.classList?.toggle?.(
      "at-track-end",
      startPct === 100,
    );
    elements.segmentHandleEnd?.classList?.toggle?.(
      "at-track-start",
      endPct === 0,
    );
    elements.segmentHandleEnd?.classList?.toggle?.(
      "at-track-end",
      endPct === 100,
    );

    this._setSegmentHandleAria(
      elements.segmentHandleStart,
      state.segmentStart,
      timeline.start,
      state.segmentEnd - 1,
    );
    this._setSegmentHandleAria(
      elements.segmentHandleEnd,
      state.segmentEnd,
      state.segmentStart + 1,
      timeline.end,
    );

    if (elements.segmentStartLabel) {
      elements.segmentStartLabel.textContent = this._formatSegmentClock(
        state.segmentStart,
      );
    }
    if (elements.segmentEndLabel) {
      elements.segmentEndLabel.textContent = this._formatSegmentClock(
        state.segmentEnd,
      );
    }
    const startClock = this._formatSegmentClock(state.segmentStart);
    const endClock = this._formatSegmentClock(state.segmentEnd);
    if (elements.segmentHandleStartTime) {
      elements.segmentHandleStartTime.textContent = startClock;
    }
    if (elements.segmentHandleEndTime) {
      elements.segmentHandleEndTime.textContent = endClock;
    }
    if (elements.segmentPreviewRange) {
      elements.segmentPreviewRange.textContent = `${startClock} – ${endClock}`;
    }
    const duration = Math.max(0, state.segmentEnd - state.segmentStart);
    const fullRecording =
      state.segmentStart === state.start && state.segmentEnd === state.end;
    if (elements.segmentDuration) {
      elements.segmentDuration.textContent = fullRecording
        ? `Entire recording · ${formatRecordingScrubTime(duration)}`
        : `Selected duration · ${formatRecordingScrubTime(duration)}`;
    }
    if (elements.segmentReset) elements.segmentReset.disabled = fullRecording;
    if (elements.segmentPreviewButton) {
      elements.segmentPreviewButton.disabled =
        duration < 1 || state.segmentPreviewPending;
      elements.segmentPreviewButton.setAttribute?.(
        "aria-busy",
        String(state.segmentPreviewPending),
      );
    }
    if (elements.segmentDownload) {
      elements.segmentDownload.disabled =
        duration < 1 || state.segmentDownloadPending;
      elements.segmentDownload.setAttribute?.(
        "aria-busy",
        String(state.segmentDownloadPending),
      );
    }
    if (elements.segmentPreviewDownload) {
      elements.segmentPreviewDownload.disabled =
        duration < 1 || state.segmentDownloadPending;
      elements.segmentPreviewDownload.setAttribute?.(
        "aria-busy",
        String(state.segmentDownloadPending),
      );
    }
    this._syncRecordingPlayUi(elements);
  }

  _syncRecordingPlayUi(elements = this._segmentElements || this._elements()) {
    const button = elements.scrubPlay;
    const video = this._state?.video;
    if (!button) return;
    const paused = video?.paused !== false;
    const label = paused ? "Play recording" : "Pause recording";
    const icon = paused ? this._playIcon : this._pauseIcon;
    if (icon) button.innerHTML = icon;
    button.disabled = !video;
    button.title = label;
    button.setAttribute?.("aria-label", label);
  }

  _toggleRecordingPlayback() {
    const video = this._state?.video;
    if (!video) return;
    if (video.paused === false) {
      video.pause?.();
      this._syncRecordingPlayUi();
      return;
    }
    try {
      const playing = video.play?.();
      if (playing && typeof playing.finally === "function") {
        playing
          .catch(() => {})
          .finally(() => this._syncRecordingPlayUi());
      }
    } catch (_) {}
    this._syncRecordingPlayUi();
  }

  _onRecordingPlaybackChange = () => {
    this._syncRecordingPlayUi();
  };

  _onPreviewModalKeyDown = (event) => {
    if (event?.key !== "Escape") return;
    event.preventDefault?.();
    event.stopPropagation?.();
    this.closeSegmentPreview();
  };

  async openSegmentPreview() {
    const state = this._state;
    const elements = this._segmentElements || this._elements();
    if (
      !state?.segmentOpen ||
      state.segmentPreviewPending ||
      state.segmentEnd <= state.segmentStart ||
      !elements.segmentPreviewModal ||
      !elements.segmentPreviewVideoHost
    ) {
      return false;
    }

    this.closeSegmentPreview({ restoreFocus: false, elements });
    const nonce = ++this._previewLoadNonce;
    state.segmentPreviewOpen = true;
    state.segmentPreviewPending = true;
    this._previewReturnFocus = elements.segmentPreviewButton || null;
    elements.segmentPreviewModal.hidden = false;
    if (elements.segmentPreviewStatus) {
      elements.segmentPreviewStatus.hidden = false;
      elements.segmentPreviewStatus.textContent = "Preparing segment preview…";
    }
    elements.segmentPreviewVideoHost.innerHTML = "";
    this._syncSegmentUi(elements);
    elements.segmentPreviewClose?.focus?.();

    const video = this._createPreviewVideo?.();
    if (!video) {
      state.segmentPreviewPending = false;
      if (elements.segmentPreviewStatus) {
        elements.segmentPreviewStatus.textContent =
          "Unable to create the segment preview player.";
      }
      this._syncSegmentUi(elements);
      return false;
    }
    video.classList?.add?.("recording-segment-preview-video");
    video.controls = true;
    video.autoplay = true;
    video.playsInline = true;
    video.preload = "metadata";
    video.setAttribute?.("playsinline", "");
    elements.segmentPreviewVideoHost.appendChild?.(video);
    this._previewVideo = video;

    let playable = false;
    try {
      const resolved = await this._resolvePreviewSources?.(
        state.segmentStart,
        state.segmentEnd,
        { clientId: state.clientId, cam: state.cam },
      );
      const sources = Array.isArray(resolved)
        ? resolved
        : resolved
          ? [resolved]
          : [];
      for (const source of sources) {
        if (
          nonce !== this._previewLoadNonce ||
          state !== this._state ||
          !state.segmentPreviewOpen
        ) {
          return false;
        }
        playable = await this._trySegmentPreviewSource(video, source);
        if (playable) break;
      }
    } catch (_) {
      playable = false;
    }

    if (
      nonce !== this._previewLoadNonce ||
      state !== this._state ||
      !state.segmentPreviewOpen
    ) {
      return false;
    }
    state.segmentPreviewPending = false;
    if (elements.segmentPreviewStatus) {
      elements.segmentPreviewStatus.hidden = playable;
      elements.segmentPreviewStatus.textContent = playable
        ? ""
        : "Unable to load the selected recording segment.";
    }
    this._syncSegmentUi(elements);
    return playable;
  }

  closeSegmentPreview({
    restoreFocus = true,
    elements = this._segmentElements || this._elements(),
  } = {}) {
    this._previewLoadNonce += 1;
    const state = this._state;
    if (state) {
      state.segmentPreviewOpen = false;
      state.segmentPreviewPending = false;
    }
    const video = this._previewVideo;
    this._previewVideo = null;
    if (video) {
      try {
        video.pause?.();
        video.removeAttribute?.("src");
        video.querySelectorAll?.("source")?.forEach?.((source) =>
          source.remove?.(),
        );
        video.load?.();
      } catch (_) {}
    }
    if (elements.segmentPreviewVideoHost) {
      elements.segmentPreviewVideoHost.innerHTML = "";
    }
    if (elements.segmentPreviewModal) {
      elements.segmentPreviewModal.hidden = true;
    }
    if (elements.segmentPreviewStatus) {
      elements.segmentPreviewStatus.hidden = false;
      elements.segmentPreviewStatus.textContent = "Preparing segment preview…";
    }
    this._syncSegmentUi(elements);
    if (restoreFocus) this._previewReturnFocus?.focus?.();
    this._previewReturnFocus = null;
    return true;
  }

  async _trySegmentPreviewSource(video, source, timeoutMs = 9000) {
    const src = String(source || "").trim();
    if (!video || !src) return false;
    const isHls = /\.m3u8(?:$|[?#])/i.test(src);
    if (
      isHls &&
      !video.canPlayType?.("application/vnd.apple.mpegurl")
    ) {
      return false;
    }

    return await new Promise((resolve) => {
      let settled = false;
      const finish = (result) => {
        if (settled) return;
        settled = true;
        cleanup();
        resolve(result);
      };
      const onReady = () => {
        try {
          video.play?.()?.catch?.(() => {});
        } catch (_) {}
        finish(true);
      };
      const onError = () => finish(false);
      const cleanup = () => {
        this._clearTimer?.(timer);
        video.removeEventListener?.("loadedmetadata", onReady);
        video.removeEventListener?.("canplay", onReady);
        video.removeEventListener?.("error", onError);
      };
      const timer = this._setTimer?.(() => finish(false), timeoutMs);
      video.addEventListener?.("loadedmetadata", onReady, { once: true });
      video.addEventListener?.("canplay", onReady, { once: true });
      video.addEventListener?.("error", onError, { once: true });
      try {
        video.src = src;
        video.load?.();
      } catch (_) {
        finish(false);
      }
    });
  }

  async _downloadSelectedSegment() {
    const state = this._state;
    if (
      !state?.segmentOpen ||
      state.segmentDownloadPending ||
      state.segmentEnd <= state.segmentStart
    ) {
      return;
    }
    state.segmentDownloadPending = true;
    this._syncSegmentUi();
    try {
      await this._onDownloadSegment?.(
        state.segmentStart,
        state.segmentEnd,
        { clientId: state.clientId, cam: state.cam },
      );
    } finally {
      if (state !== this._state) return;
      state.segmentDownloadPending = false;
      this._syncSegmentUi();
    }
  }

  _setCursor(timeSec) {
    const state = this._state;
    if (!state?.cursor || !Number.isFinite(timeSec)) return;
    const timeline = this._activeTimelineRange();
    const timelineSpan = Math.max(1, timeline.end - timeline.start);
    const pct = ((timeSec - timeline.start) / timelineSpan) * 100;
    state.cursor.style.left = `${Math.max(0, Math.min(100, pct))}%`;
    if (state.labelNow) {
      const span = Math.max(1, state.end - state.start);
      const rel = Math.max(0, Math.min(span, timeSec - state.start));
      state.labelNow.textContent = `${formatRecordingScrubTime(rel)} / ${formatRecordingScrubTime(span)}`;
    }
  }

  _seekToRatio(ratio, { commit = false } = {}) {
    const state = this._state;
    if (!state?.video) return;
    const timeline = this._activeTimelineRange();
    const timelineTarget = resolveRecordingScrubTarget({
      ratio,
      start: timeline.start,
      end: timeline.end,
      alerts: state.alerts,
    });
    const absTarget = clamp(timelineTarget.absTarget, state.start, state.end);
    const target = {
      absTarget,
      relTarget: absTarget - state.start,
    };

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
          {
            clientId: state.clientId,
            camera: state.cam,
          },
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
