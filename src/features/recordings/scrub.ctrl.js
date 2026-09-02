import { CleanupController } from "../../shared/cleanup.js";

export class RecordingScrubController {
  constructor({
    track,
    video,
    ticks,
    markers,
    preview = null,
    previewImage = null,
    previewLabel = null,
    state,
    setCursor,
    seekToRatio,
    formatTime = null,
  }) {
    this._track = track;
    this._video = video;
    this._ticks = ticks;
    this._markers = markers;
    this._preview = preview;
    this._previewImage = previewImage;
    this._previewLabel = previewLabel;
    this._state = state;
    this._setCursor = setCursor;
    this._seekToRatio = seekToRatio;
    this._formatTime =
      typeof formatTime === "function" ? formatTime : (value) => String(value);
    this._cleanup = new CleanupController();
    this._dragging = false;
    this._lastRatio = 0;
  }

  bind() {
    if (!this._track || !this._video || !this._state) return;
    this._cleanup.addEventListener(
      this._track,
      "pointerdown",
      this._onPointerDown,
    );
    this._cleanup.addEventListener(
      this._track,
      "pointermove",
      this._onPointerMove,
    );
    this._cleanup.addEventListener(this._track, "pointerup", this._onPointerUp);
    this._cleanup.addEventListener(
      this._track,
      "pointercancel",
      this._onPointerUp,
    );
    this._cleanup.addEventListener(
      this._track,
      "touchstart",
      this._onTouchConsume,
      {
        passive: false,
      },
    );
    this._cleanup.addEventListener(
      this._track,
      "touchmove",
      this._onTouchConsume,
      {
        passive: false,
      },
    );
    this._cleanup.addEventListener(
      this._track,
      "touchend",
      this._onTouchConsume,
      {
        passive: false,
      },
    );
    this._cleanup.addEventListener(
      this._video,
      "timeupdate",
      this._onTimeUpdate,
    );
    this._cleanup.addEventListener(
      this._markers,
      "pointerover",
      this._onMarkerPointerOver,
    );
    this._cleanup.addEventListener(
      this._markers,
      "pointerout",
      this._onMarkerPointerOut,
    );
    this._cleanup.addEventListener(
      this._previewImage,
      "error",
      this._onPreviewImageError,
    );
  }

  dispose() {
    this._dragging = false;
    this._state.isScrubbing = false;
    this._hideMarkerPreview({ clearImage: true });
    this._cleanup.dispose();
    if (this._ticks) this._ticks.innerHTML = "";
    if (this._markers) this._markers.innerHTML = "";
  }

  _clientXToRatio(clientX) {
    const rect = this._track.getBoundingClientRect();
    if (!rect.width) return 0;
    return Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
  }

  _consumeGesture(event) {
    event.preventDefault?.();
    event.stopPropagation?.();
  }

  _isSegmentHandleEvent(event) {
    return Boolean(
      event?.target?.closest?.("[data-recording-segment-handle]"),
    );
  }

  _markerFromEvent(event) {
    const marker = event?.target?.closest?.("[data-recording-alert-index]");
    if (!marker) return null;
    if (this._markers?.contains && !this._markers.contains(marker)) return null;
    return marker;
  }

  _showMarkerPreview(index, marker) {
    const alert = this._state?.alerts?.[index];
    const snapshotUrl = String(alert?.snapshotUrl || "").trim();
    if (!snapshotUrl || !this._preview || !this._previewImage || !marker) {
      this._hideMarkerPreview();
      return;
    }

    const severity =
      String(alert?.severity || "detection").toLowerCase() === "alert"
        ? "Alert"
        : "Detection";
    const relativeStart = Math.max(
      0,
      Number(alert?.start || 0) - Number(this._state?.start || 0),
    );
    this._previewImage.alt = `${severity} snapshot`;
    this._previewImage.src = snapshotUrl;
    if (this._previewLabel) {
      this._previewLabel.textContent = `${severity} · ${this._formatTime(relativeStart)}`;
    }
    this._preview.hidden = false;

    const trackRect = this._track.getBoundingClientRect();
    const markerRect = marker.getBoundingClientRect();
    const previewWidth =
      Number(this._preview.getBoundingClientRect?.().width) || 180;
    const halfWidth = previewWidth / 2;
    const markerCenter =
      markerRect.left - trackRect.left + markerRect.width / 2;
    const margin = 6;
    const minLeft = Math.min(halfWidth + margin, trackRect.width / 2);
    const maxLeft = Math.max(
      trackRect.width / 2,
      trackRect.width - halfWidth - margin,
    );
    const left = Math.max(minLeft, Math.min(markerCenter, maxLeft));
    this._preview.style.left = `${left}px`;
  }

  _hideMarkerPreview({ clearImage = false } = {}) {
    if (this._preview) this._preview.hidden = true;
    if (clearImage && this._previewImage) {
      this._previewImage.removeAttribute?.("src");
    }
  }

  _onMarkerPointerOver = (event) => {
    const marker = this._markerFromEvent(event);
    if (!marker) return;
    const index = Number(marker.dataset?.recordingAlertIndex);
    if (!Number.isInteger(index) || index < 0) return;
    this._showMarkerPreview(index, marker);
  };

  _onMarkerPointerOut = (event) => {
    const marker = this._markerFromEvent(event);
    if (!marker || marker.contains?.(event.relatedTarget)) return;
    this._hideMarkerPreview();
  };

  _onPreviewImageError = () => {
    this._hideMarkerPreview({ clearImage: true });
  };

  _onPointerDown = (event) => {
    if (this._isSegmentHandleEvent(event)) return;
    this._consumeGesture(event);
    this._hideMarkerPreview();
    this._dragging = true;
    this._state.isScrubbing = true;
    this._state.resumeAfterScrub = !this._video.paused;
    this._video.pause?.();
    this._track.setPointerCapture?.(event.pointerId);
    this._lastRatio = this._clientXToRatio(event.clientX);
    this._seekToRatio?.(this._lastRatio);
  };

  _onPointerMove = (event) => {
    if (!this._dragging) return;
    this._consumeGesture(event);
    this._lastRatio = this._clientXToRatio(event.clientX);
    this._seekToRatio?.(this._lastRatio);
  };

  _onPointerUp = (event) => {
    if (!this._dragging) return;
    this._consumeGesture(event);
    this._dragging = false;
    this._state.isScrubbing = false;
    this._track.releasePointerCapture?.(event.pointerId);
    this._seekToRatio?.(this._lastRatio, { commit: true });
  };

  _onTouchConsume = (event) => {
    if (this._isSegmentHandleEvent(event)) return;
    this._consumeGesture(event);
  };

  _onTimeUpdate = () => {
    if (this._state?.isScrubbing) return;
    this._setCursor?.(
      Number(this._state.start || 0) + Number(this._video.currentTime || 0),
    );
  };
}
