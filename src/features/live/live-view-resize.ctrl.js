import { CleanupController } from "../../shared/cleanup.js";

export const LIVE_VIEW_MIN_HEIGHT_RATIO = 9 / 16;
export const LIVE_VIEW_MAX_HEIGHT_RATIO = 1;
export const LIVE_VIEW_NEAR_WIDE_HEIGHT_RATIO = 2 / 3;
export const LIVE_VIEW_WIDE_MAX_HEIGHT_RATIO =
  LIVE_VIEW_MIN_HEIGHT_RATIO * 1.5;

const ELIGIBILITY_EPSILON = 0.005;
const KEYBOARD_RESIZE_STEP = 0.025;
const DOUBLE_ACTIVATION_MS = 360;
const DRAG_THRESHOLD_PX = 3;

const positiveNumber = (value) => {
  const number = Number(value);
  return Number.isFinite(number) && number > 0 ? number : 0;
};

export const clampLiveViewHeightRatio = (ratio, minRatio, maxRatio) =>
  Math.min(maxRatio, Math.max(minRatio, Number(ratio) || minRatio));

export const resolveLiveViewResizeZoomScale = ({
  heightRatio,
  naturalHeightRatio,
  maxHeightRatio = LIVE_VIEW_WIDE_MAX_HEIGHT_RATIO,
}) => {
  const ratio = positiveNumber(heightRatio);
  const natural = positiveNumber(naturalHeightRatio);
  if (!ratio || !natural) return 1;
  if (natural >= LIVE_VIEW_MIN_HEIGHT_RATIO) {
    return Math.max(1, ratio / natural);
  }

  const maxRatio = Math.max(
    LIVE_VIEW_MIN_HEIGHT_RATIO,
    positiveNumber(maxHeightRatio),
  );
  const progress =
    (ratio - LIVE_VIEW_MIN_HEIGHT_RATIO) /
    (maxRatio - LIVE_VIEW_MIN_HEIGHT_RATIO || 1);
  const maxZoomScale = maxRatio / natural;
  return 1 + Math.min(1, Math.max(0, progress)) * (maxZoomScale - 1);
};

export function resolveLiveViewResizeBounds({
  containerWidth,
  videoWidth,
  videoHeight,
}) {
  const width = positiveNumber(containerWidth);
  const mediaWidth = positiveNumber(videoWidth);
  const mediaHeight = positiveNumber(videoHeight);
  const naturalHeightRatio =
    mediaWidth > 0 && mediaHeight > 0 ? mediaHeight / mediaWidth : 0;
  const maxHeightRatio =
    naturalHeightRatio <=
    LIVE_VIEW_NEAR_WIDE_HEIGHT_RATIO + ELIGIBILITY_EPSILON
      ? LIVE_VIEW_WIDE_MAX_HEIGHT_RATIO
      : Math.min(LIVE_VIEW_MAX_HEIGHT_RATIO, naturalHeightRatio);
  const eligible = width > 0 && naturalHeightRatio > 0;

  return {
    eligible,
    containerWidth: width,
    naturalHeightRatio,
    minHeightRatio: LIVE_VIEW_MIN_HEIGHT_RATIO,
    maxHeightRatio: eligible ? maxHeightRatio : LIVE_VIEW_MIN_HEIGHT_RATIO,
  };
}

const heightRatioToAspectRatio = (heightRatio) =>
  `${(1 / heightRatio).toFixed(6)} / 1`;

export class LiveViewResizeController {
  constructor({
    getLiveWrap,
    isContextEligible = () => true,
    onInteractionStart = () => {},
    onZoomScaleChange = () => {},
    getMediaDimensions = null,
    getAvailableGrowth = null,
  } = {}) {
    this._getLiveWrap = getLiveWrap;
    this._isContextEligible = isContextEligible;
    this._onInteractionStart = onInteractionStart;
    this._onZoomScaleChange = onZoomScaleChange;
    this._getMediaDimensions = getMediaDimensions;
    this._getAvailableGrowth = getAvailableGrowth;
    this._wrap = null;
    this._grip = null;
    this._video = null;
    this._mediaReady = false;
    this._bounds = null;
    this._heightRatio = LIVE_VIEW_MIN_HEIGHT_RATIO;
    this._drag = null;
    this._lastActivationAt = 0;
    this._gripCleanup = new CleanupController();
    this._mediaCleanup = new CleanupController();
  }

  bind() {
    const nextWrap = this._getLiveWrap?.() || null;
    const nextGrip = nextWrap?.querySelector?.("#live-resize-grip") || null;
    if (nextWrap === this._wrap && nextGrip === this._grip) {
      this._syncEligibility();
      return;
    }

    if (nextWrap !== this._wrap) {
      this._heightRatio = LIVE_VIEW_MIN_HEIGHT_RATIO;
      this._lastActivationAt = 0;
    }
    this._gripCleanup.dispose();
    this._gripCleanup = new CleanupController();
    this._wrap = nextWrap;
    this._grip = nextGrip;
    this._drag = null;

    if (this._grip) {
      this._gripCleanup.addEventListener(
        this._grip,
        "pointerdown",
        this._onPointerDown,
      );
      this._gripCleanup.addEventListener(
        this._grip,
        "pointermove",
        this._onPointerMove,
      );
      this._gripCleanup.addEventListener(
        this._grip,
        "pointerup",
        this._onPointerUp,
      );
      this._gripCleanup.addEventListener(
        this._grip,
        "pointercancel",
        this._onPointerCancel,
      );
      this._gripCleanup.addEventListener(
        this._grip,
        "keydown",
        this._onKeyDown,
      );
    }
    if (this._wrap && typeof ResizeObserver === "function") {
      const resizeObserver = new ResizeObserver(() => this._syncEligibility());
      resizeObserver.observe(this._wrap);
      this._gripCleanup.addCleanup(() => resizeObserver.disconnect());
    }

    this._syncEligibility();
  }

  attachMedia(video) {
    if (video === this._video) {
      this._mediaReady = this._hasMediaDimensions(video);
      this.sync();
      return;
    }

    this._mediaCleanup.dispose();
    this._mediaCleanup = new CleanupController();
    this._video = video || null;
    this._mediaReady = this._hasMediaDimensions(this._video);

    if (this._video) {
      this._mediaCleanup.addEventListener(
        this._video,
        "loadedmetadata",
        this._onMediaReady,
      );
      this._mediaCleanup.addEventListener(
        this._video,
        "resize",
        this._onMediaReady,
      );
      this._mediaCleanup.addEventListener(
        this._video,
        "emptied",
        this._onMediaEmptied,
      );
    }

    this.sync();
  }

  reset() {
    this._heightRatio = LIVE_VIEW_MIN_HEIGHT_RATIO;
    this._lastActivationAt = 0;
    this._syncEligibility();
    this._onZoomScaleChange?.(1);
  }

  sync() {
    const currentWrap = this._getLiveWrap?.() || null;
    if (currentWrap !== this._wrap) {
      this.bind();
      return;
    }
    this._syncEligibility();
  }

  dispose() {
    this._gripCleanup.dispose();
    this._mediaCleanup.dispose();
    this._clearResizePresentation();
    this._wrap = null;
    this._grip = null;
    this._video = null;
    this._bounds = null;
    this._drag = null;
  }

  _hasMediaDimensions(video) {
    return (
      positiveNumber(video?.videoWidth) > 0 &&
      positiveNumber(video?.videoHeight) > 0
    );
  }

  _syncEligibility() {
    if (!this._wrap || !this._grip) return;
    const rect = this._wrap.getBoundingClientRect?.();
    const containerWidth = positiveNumber(rect?.width || this._wrap.clientWidth);
    const dimensions = this._getMediaDimensions?.(this._video) || {};
    const bounds = resolveLiveViewResizeBounds({
      containerWidth,
      videoWidth: dimensions.videoWidth ?? this._video?.videoWidth,
      videoHeight: dimensions.videoHeight ?? this._video?.videoHeight,
    });
    const contextEligible = this._isContextEligible?.() !== false;

    if (!contextEligible || !this._mediaReady || !bounds.eligible) {
      this._bounds = null;
      this._clearResizePresentation();
      return;
    }

    this._bounds = bounds;
    this._heightRatio = clampLiveViewHeightRatio(
      this._heightRatio,
      bounds.minHeightRatio,
      bounds.maxHeightRatio,
    );
    this._wrap.classList?.add("live-resize-eligible");
    this._grip.hidden = false;
    this._applyHeightRatio(this._heightRatio);
  }

  _resolveInteractionMaxHeightRatio() {
    if (!this._bounds || typeof this._getAvailableGrowth !== "function") {
      return this._bounds?.maxHeightRatio ?? LIVE_VIEW_MIN_HEIGHT_RATIO;
    }
    const availableGrowth = this._getAvailableGrowth({
      wrap: this._wrap,
      containerWidth: this._bounds.containerWidth,
      currentHeightRatio: this._heightRatio,
    });
    if (availableGrowth == null) return this._bounds.maxHeightRatio;
    const growth = Number(availableGrowth);
    if (!Number.isFinite(growth)) return this._bounds.maxHeightRatio;
    return Math.min(
      this._bounds.maxHeightRatio,
      this._heightRatio +
        Math.max(0, growth) / this._bounds.containerWidth,
    );
  }

  _applyHeightRatio(
    heightRatio,
    { syncZoom = false, maxHeightRatio = this._bounds?.maxHeightRatio } = {},
  ) {
    if (!this._wrap || !this._grip || !this._bounds) return;
    const interactionMaxHeightRatio = clampLiveViewHeightRatio(
      maxHeightRatio,
      this._heightRatio,
      this._bounds.maxHeightRatio,
    );
    const nextRatio = clampLiveViewHeightRatio(
      heightRatio,
      this._bounds.minHeightRatio,
      interactionMaxHeightRatio,
    );
    this._heightRatio = nextRatio;
    this._wrap.style?.setProperty(
      "--live-view-aspect-ratio",
      heightRatioToAspectRatio(nextRatio),
    );
    const value = Math.round(nextRatio * 100);
    this._grip.setAttribute?.(
      "aria-valuemin",
      String(Math.round(this._bounds.minHeightRatio * 100)),
    );
    this._grip.setAttribute?.(
      "aria-valuemax",
      String(Math.round(interactionMaxHeightRatio * 100)),
    );
    this._grip.setAttribute?.("aria-valuenow", String(value));
    this._grip.setAttribute?.(
      "aria-valuetext",
      `Live view height ${value}% of its width`,
    );
    if (syncZoom) {
      this._onZoomScaleChange?.(
        resolveLiveViewResizeZoomScale({
          heightRatio: nextRatio,
          naturalHeightRatio: this._bounds.naturalHeightRatio,
          maxHeightRatio: interactionMaxHeightRatio,
        }),
      );
    }
  }

  _clearResizePresentation() {
    this._wrap?.classList?.remove("live-resize-eligible", "live-resizing");
    this._wrap?.style?.removeProperty("--live-view-aspect-ratio");
    if (this._grip) this._grip.hidden = true;
  }

  _onMediaReady = () => {
    this._mediaReady = this._hasMediaDimensions(this._video);
    this.sync();
  };

  _onMediaEmptied = () => {
    this._mediaReady = false;
    this.sync();
  };

  _onPointerDown = (event) => {
    if (event?.button != null && event.button !== 0) return;
    this.sync();
    if (!this._bounds || this._grip?.hidden) return;

    this._drag = {
      pointerId: event.pointerId,
      startY: Number(event.clientY) || 0,
      startHeightRatio: this._heightRatio,
      containerWidth: this._bounds.containerWidth,
      maxHeightRatio: this._resolveInteractionMaxHeightRatio(),
      moved: false,
    };
    this._wrap?.classList?.add("live-resizing");
    this._grip?.setPointerCapture?.(event.pointerId);
    this._onInteractionStart?.();
    event.preventDefault?.();
    event.stopPropagation?.();
  };

  _onPointerMove = (event) => {
    if (!this._drag || event.pointerId !== this._drag.pointerId) return;
    const deltaY = (Number(event.clientY) || 0) - this._drag.startY;
    if (Math.abs(deltaY) >= DRAG_THRESHOLD_PX) this._drag.moved = true;
    this._applyHeightRatio(
      this._drag.startHeightRatio + deltaY / this._drag.containerWidth,
      {
        syncZoom: true,
        maxHeightRatio: this._drag.maxHeightRatio,
      },
    );
    event.preventDefault?.();
    event.stopPropagation?.();
  };

  _finishPointer(event, { cancelled = false } = {}) {
    if (!this._drag || event.pointerId !== this._drag.pointerId) return;
    const { moved } = this._drag;
    this._grip?.releasePointerCapture?.(event.pointerId);
    this._wrap?.classList?.remove("live-resizing");
    this._drag = null;

    if (!cancelled && !moved) {
      const now = Date.now();
      if (
        this._lastActivationAt > 0 &&
        now - this._lastActivationAt <= DOUBLE_ACTIVATION_MS
      ) {
        this.reset();
      } else {
        this._lastActivationAt = now;
      }
    } else {
      this._lastActivationAt = 0;
    }

    event.preventDefault?.();
    event.stopPropagation?.();
  }

  _onPointerUp = (event) => this._finishPointer(event);

  _onPointerCancel = (event) =>
    this._finishPointer(event, { cancelled: true });

  _onKeyDown = (event) => {
    if (!this._bounds || this._grip?.hidden) return;
    const maxHeightRatio = this._resolveInteractionMaxHeightRatio();
    let nextRatio = null;
    if (event.key === "ArrowDown") {
      nextRatio = this._heightRatio + KEYBOARD_RESIZE_STEP;
    } else if (event.key === "ArrowUp") {
      nextRatio = this._heightRatio - KEYBOARD_RESIZE_STEP;
    } else if (event.key === "Home") {
      nextRatio = this._bounds.minHeightRatio;
    } else if (event.key === "End") {
      nextRatio = maxHeightRatio;
    }
    if (nextRatio == null) return;

    this._onInteractionStart?.();
    this._applyHeightRatio(nextRatio, {
      syncZoom: true,
      maxHeightRatio,
    });
    event.preventDefault?.();
    event.stopPropagation?.();
  };
}
