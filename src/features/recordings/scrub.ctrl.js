import { CleanupController } from "../../card/cleanup.ctrl.js";

export class RecordingScrubController {
  constructor({ track, video, ticks, markers, state, setCursor, seekToRatio }) {
    this._track = track;
    this._video = video;
    this._ticks = ticks;
    this._markers = markers;
    this._state = state;
    this._setCursor = setCursor;
    this._seekToRatio = seekToRatio;
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
  }

  dispose() {
    this._dragging = false;
    this._state.isScrubbing = false;
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

  _onPointerDown = (event) => {
    this._consumeGesture(event);
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
    this._consumeGesture(event);
  };

  _onTimeUpdate = () => {
    if (this._state?.isScrubbing) return;
    this._setCursor?.(
      Number(this._state.start || 0) + Number(this._video.currentTime || 0),
    );
  };
}
