import { resolvePopupMediaSeekTarget } from "./media.js";
import { CleanupController } from "../cleanup.ctrl.js";

export class PopupMediaControlsController {
  constructor({
    controls,
    progress,
    video,
    listenerPlan,
    onShowNow,
    onShowTemporarily,
    onSync,
  }) {
    this._controls = controls;
    this._progress = progress;
    this._video = video;
    this._listenerPlan = listenerPlan;
    this._onShowNow = onShowNow;
    this._onShowTemporarily = onShowTemporarily;
    this._onSync = onSync;
    this._cleanup = new CleanupController();
    this._progressDragging = false;
  }

  bind() {
    if (!this._controls || !this._video || !this._listenerPlan) return;

    if (this._progress) {
      this._listenerPlan.progressEvents.forEach(({ type, action, options }) => {
        this._cleanup.addEventListener(
          this._progress,
          type,
          this._progressHandlers[action],
          options,
        );
      });
    }

    this._listenerPlan.controlsEvents.forEach(({ type, action, options }) => {
      this._cleanup.addEventListener(
        this._controls,
        type,
        this._controlsHandlers[action],
        options,
      );
    });

    this._listenerPlan.syncVideoEvents.forEach((type) => {
      this._cleanup.addEventListener(this._video, type, this._sync);
    });

    this._listenerPlan.interactionVideoEvents.forEach(
      ({ type, action, options }) => {
        this._cleanup.addEventListener(
          this._video,
          type,
          this._controlsHandlers[action],
          options,
        );
      },
    );

    this._sync();
  }

  dispose() {
    this._cleanup.dispose();
    this._progressDragging = false;
    this._controls?.classList?.remove("is-hidden");
  }

  _sync = () => {
    this._onSync?.({ progressDragging: this._progressDragging });
  };

  _progressHandlers = {
    scrubPreview: () => {
      this._progressDragging = true;
      const next = resolvePopupMediaSeekTarget({
        progressValue: this._progress?.value,
        duration: this._video?.duration,
      });
      if (next !== null && this._video) {
        this._video.currentTime = next;
      }
      this._onShowTemporarily?.();
      this._sync();
    },
    scrubCommit: () => {
      this._progressDragging = false;
      this._onShowTemporarily?.();
      this._sync();
    },
    dragStart: () => {
      this._progressDragging = true;
      this._onShowNow?.();
    },
    dragEnd: () => {
      this._progressDragging = false;
      this._onShowTemporarily?.();
    },
    touchDragStart: () => {
      this._progressDragging = true;
    },
    touchDragEnd: () => {
      this._progressDragging = false;
      this._onShowTemporarily?.();
    },
  };

  _controlsHandlers = {
    showNow: () => {
      this._onShowNow?.();
    },
    showTemporarily: () => {
      this._onShowTemporarily?.();
    },
  };
}
