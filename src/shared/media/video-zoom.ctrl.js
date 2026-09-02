import { CleanupController } from "../cleanup.js";
import {
  resolveDisplayedFrameDimensions,
  resolveDisplayedFrameGeometry,
} from "./frame-capture.js";

export const VIDEO_ZOOM_MIN = 1;
export const VIDEO_ZOOM_DOUBLE_TAP = 2;
export const VIDEO_ZOOM_MAX = 3;
export const VIDEO_ZOOM_WHEEL_STEP = 0.2;

const DOUBLE_TAP_DELAY_MS = 320;
const DOUBLE_TAP_DISTANCE_PX = 28;
const MOVE_TOLERANCE_PX = 8;
const EPSILON = 0.001;
const COVER_OVERFLOW_EPSILON_PX = 0.5;

export function clampVideoZoom(value, min = VIDEO_ZOOM_MIN, max = VIDEO_ZOOM_MAX) {
  return Math.min(max, Math.max(min, Number(value) || min));
}

export function clampVideoPan({
  x,
  y,
  scale,
  width,
  height,
}) {
  const safeScale = clampVideoZoom(scale);
  if (safeScale <= VIDEO_ZOOM_MIN + EPSILON) {
    return { x: 0, y: 0 };
  }
  const safeWidth = Math.max(0, Number(width) || 0);
  const safeHeight = Math.max(0, Number(height) || 0);
  return {
    x: Math.min(0, Math.max(safeWidth - safeWidth * safeScale, Number(x) || 0)),
    y: Math.min(
      0,
      Math.max(safeHeight - safeHeight * safeScale, Number(y) || 0),
    ),
  };
}

export function zoomVideoAroundPoint({
  currentScale,
  nextScale,
  x,
  y,
  focalX,
  focalY,
  width,
  height,
}) {
  const fromScale = clampVideoZoom(currentScale);
  const toScale = clampVideoZoom(nextScale);
  if (toScale <= VIDEO_ZOOM_MIN + EPSILON) {
    return { scale: VIDEO_ZOOM_MIN, x: 0, y: 0 };
  }
  const ratio = toScale / fromScale;
  const nextPan = clampVideoPan({
    x: focalX - (focalX - x) * ratio,
    y: focalY - (focalY - y) * ratio,
    scale: toScale,
    width,
    height,
  });
  return { scale: toScale, ...nextPan };
}

function distanceBetween(first, second) {
  return Math.hypot(
    Number(second?.clientX || 0) - Number(first?.clientX || 0),
    Number(second?.clientY || 0) - Number(first?.clientY || 0),
  );
}

function midpointBetween(first, second) {
  return {
    clientX:
      (Number(first?.clientX || 0) + Number(second?.clientX || 0)) / 2,
    clientY:
      (Number(first?.clientY || 0) + Number(second?.clientY || 0)) / 2,
  };
}

function styleSnapshot(style, property) {
  return {
    value: style?.getPropertyValue?.(property) || "",
    priority: style?.getPropertyPriority?.(property) || "",
  };
}

function restoreStyle(style, property, snapshot) {
  if (!style?.setProperty) return;
  if (!snapshot?.value) {
    style.removeProperty?.(property);
    return;
  }
  style.setProperty(property, snapshot.value, snapshot.priority);
}

export class VideoZoomController {
  constructor(video, options = {}) {
    this._video = video;
    this._host = options.host || video?.parentElement || null;
    this._interactionTarget = options.interactionTarget || video || null;
    this._nativeCoverPanEnabled = options.nativeCoverPan === true;
    this._maxScale = Math.max(
      VIDEO_ZOOM_DOUBLE_TAP,
      Number(options.maxScale) || VIDEO_ZOOM_MAX,
    );
    this._cleanup = new CleanupController();
    this._pointers = new Map();
    this._scale = VIDEO_ZOOM_MIN;
    this._x = 0;
    this._y = 0;
    this._pan = null;
    this._pinch = null;
    this._coverPositionX = 0.5;
    this._coverPositionY = 0.5;
    this._coverOverflowX = 0;
    this._coverOverflowY = 0;
    this._coverPannable = false;
    this._lastTap = null;
    this._lastTouchZoomAt = 0;
    this._hoveringMedia = false;
    this._bound = false;
    this._styleSnapshots = null;
    this._hostOverflowSnapshot = null;
    this._resizeObserver = null;
    this._presentationInterrupted = true;
    this._presentationSuspended = false;
    this._presentationRefreshFrame = 0;
    this._presentationVideoFrameCallback = null;
  }

  get video() {
    return this._video;
  }

  get state() {
    const state = {
      scale: this._scale,
      x: this._x,
      y: this._y,
    };
    if (
      this._nativeCoverPanEnabled &&
      (Math.abs(this._coverPositionX - 0.5) > EPSILON ||
        Math.abs(this._coverPositionY - 0.5) > EPSILON)
    ) {
      state.objectPositionX = this._coverPositionX;
      state.objectPositionY = this._coverPositionY;
    }
    return state;
  }

  get viewport() {
    return this._bounds();
  }

  bind() {
    if (
      this._bound ||
      !this._video ||
      !this._host ||
      !this._interactionTarget
    ) {
      return this;
    }
    this._bound = true;
    this._styleSnapshots = {
      transform: styleSnapshot(this._video.style, "transform"),
      transformOrigin: styleSnapshot(this._video.style, "transform-origin"),
      cursor: styleSnapshot(this._video.style, "cursor"),
      objectPosition: styleSnapshot(this._video.style, "object-position"),
      touchAction: styleSnapshot(this._video.style, "touch-action"),
      willChange: styleSnapshot(this._video.style, "will-change"),
      userSelect: styleSnapshot(this._video.style, "user-select"),
    };
    this._hostOverflowSnapshot = styleSnapshot(this._host.style, "overflow");

    this._video.style?.setProperty?.("transform-origin", "0 0", "important");
    this._video.style?.setProperty?.("touch-action", "none");
    this._video.style?.setProperty?.("will-change", "transform");
    this._video.style?.setProperty?.("user-select", "none");
    this._host.style?.setProperty?.("overflow", "hidden");

    this._cleanup.addEventListener(
      this._interactionTarget,
      "wheel",
      this._onWheel,
      { passive: false },
    );
    this._cleanup.addEventListener(
      this._interactionTarget,
      "dblclick",
      this._onDoubleClick,
    );
    this._cleanup.addEventListener(
      this._interactionTarget,
      "pointerdown",
      this._onPointerDown,
      { passive: false },
    );
    this._cleanup.addEventListener(
      this._interactionTarget,
      "pointermove",
      this._onPointerMove,
      { passive: false },
    );
    this._cleanup.addEventListener(
      this._interactionTarget,
      "pointerup",
      this._onPointerUp,
    );
    this._cleanup.addEventListener(
      this._interactionTarget,
      "pointercancel",
      this._onPointerCancel,
    );
    this._cleanup.addEventListener(
      this._interactionTarget,
      "pointerleave",
      this._onPointerLeave,
    );
    this._cleanup.addEventListener(this._video, "loadstart", this._onLoadStart);
    for (const eventName of ["emptied", "stalled", "waiting"]) {
      this._cleanup.addEventListener(
        this._video,
        eventName,
        this._onPresentationInterrupted,
      );
    }
    for (const eventName of ["canplay", "loadeddata", "playing"]) {
      this._cleanup.addEventListener(
        this._video,
        eventName,
        this._onPresentationResumed,
      );
    }

    const ResizeObserverCtor =
      typeof ResizeObserver !== "undefined" ? ResizeObserver : null;
    if (ResizeObserverCtor) {
      this._resizeObserver = new ResizeObserverCtor(() => this.refresh());
      this._resizeObserver.observe(this._host);
      this._cleanup.addCleanup(() => this._resizeObserver?.disconnect?.());
    }

    this.refresh();
    this._refreshPresentationAfterNextVideoFrame();
    return this;
  }

  dispose() {
    if (!this._bound) return;
    if (this._presentationRefreshFrame) {
      globalThis.cancelAnimationFrame?.(this._presentationRefreshFrame);
      this._presentationRefreshFrame = 0;
    }
    if (this._presentationVideoFrameCallback != null) {
      this._video.cancelVideoFrameCallback?.(
        this._presentationVideoFrameCallback,
      );
      this._presentationVideoFrameCallback = null;
    }
    this._presentationSuspended = false;
    this.reset();
    this._cleanup.dispose();
    this._bound = false;
    restoreStyle(
      this._video.style,
      "transform",
      this._styleSnapshots?.transform,
    );
    restoreStyle(
      this._video.style,
      "transform-origin",
      this._styleSnapshots?.transformOrigin,
    );
    restoreStyle(this._video.style, "cursor", this._styleSnapshots?.cursor);
    restoreStyle(
      this._video.style,
      "object-position",
      this._styleSnapshots?.objectPosition,
    );
    restoreStyle(
      this._video.style,
      "touch-action",
      this._styleSnapshots?.touchAction,
    );
    restoreStyle(
      this._video.style,
      "will-change",
      this._styleSnapshots?.willChange,
    );
    restoreStyle(
      this._video.style,
      "user-select",
      this._styleSnapshots?.userSelect,
    );
    restoreStyle(this._host.style, "overflow", this._hostOverflowSnapshot);
    this._pointers.clear();
  }

  reset() {
    this._scale = VIDEO_ZOOM_MIN;
    this._x = 0;
    this._y = 0;
    this._pan = null;
    this._pinch = null;
    this._pointers.clear();
    this._coverPositionX = 0.5;
    this._coverPositionY = 0.5;
    this._coverOverflowX = 0;
    this._coverOverflowY = 0;
    this._coverPannable = false;
    this._apply();
  }

  setPresentationSuspended(suspended) {
    const next = suspended === true;
    if (next === this._presentationSuspended) {
      this._apply();
      return;
    }
    this._presentationSuspended = next;
    this._pan = null;
    this._pinch = null;
    this._pointers.clear();
    if (next) {
      this._apply();
      return;
    }
    this.refresh();
  }

  refresh() {
    const bounds = this._bounds();
    const pan = clampVideoPan({
      x: this._x,
      y: this._y,
      scale: this._scale,
      width: bounds.width,
      height: bounds.height,
    });
    this._x = pan.x;
    this._y = pan.y;
    if (
      this._nativeCoverPanEnabled &&
      (Math.abs(this._coverPositionX - 0.5) > EPSILON ||
        Math.abs(this._coverPositionY - 0.5) > EPSILON)
    ) {
      this._refreshNativeCoverPan();
    }
    this._apply();
  }

  refreshPresentation() {
    if (!this._bound || !this._video?.style?.setProperty) return;
    if (this._presentationSuspended) {
      this._apply();
      return;
    }
    const currentTransform =
      this._video.style.getPropertyValue?.("transform") || "";
    const nudgeTransform = currentTransform
      ? `${currentTransform} translateZ(0.001px)`
      : "translateZ(0.001px)";
    this._video.style.setProperty(
      "transform",
      nudgeTransform,
      "important",
    );
    void this._video.offsetWidth;

    if (this._presentationRefreshFrame) {
      globalThis.cancelAnimationFrame?.(this._presentationRefreshFrame);
    }
    const restore = () => {
      this._presentationRefreshFrame = 0;
      if (this._bound) this._apply();
    };
    const restoreAfterPaint = () => {
      this._presentationRefreshFrame =
        globalThis.requestAnimationFrame?.(restore) || 0;
      if (!this._presentationRefreshFrame) queueMicrotask(restore);
    };
    this._presentationRefreshFrame =
      globalThis.requestAnimationFrame?.(restoreAfterPaint) || 0;
    if (!this._presentationRefreshFrame) queueMicrotask(restore);
  }

  _refreshPresentationAfterNextVideoFrame() {
    if (!this._bound || this._presentationVideoFrameCallback != null) return;
    if (typeof this._video?.requestVideoFrameCallback !== "function") {
      this._presentationInterrupted = false;
      this.refreshPresentation();
      return;
    }
    try {
      this._presentationVideoFrameCallback =
        this._video.requestVideoFrameCallback(() => {
          this._presentationVideoFrameCallback = null;
          if (!this._bound) return;
          this._presentationInterrupted = false;
          this.refreshPresentation();
        });
    } catch (_) {
      this._presentationVideoFrameCallback = null;
      this._presentationInterrupted = false;
      this.refreshPresentation();
    }
  }

  zoomTo(nextScale, clientX, clientY) {
    const bounds = this._bounds();
    const focalX = Number(clientX) - bounds.left;
    const focalY = Number(clientY) - bounds.top;
    const next = zoomVideoAroundPoint({
      currentScale: this._scale,
      nextScale: clampVideoZoom(
        nextScale,
        VIDEO_ZOOM_MIN,
        this._maxScale,
      ),
      x: this._x,
      y: this._y,
      focalX,
      focalY,
      width: bounds.width,
      height: bounds.height,
    });
    this._scale = next.scale;
    this._x = next.x;
    this._y = next.y;
    if (this._scale <= VIDEO_ZOOM_MIN + EPSILON) {
      this._coverPositionX = 0.5;
      this._coverPositionY = 0.5;
    }
    this._coverPannable = false;
    this._apply();
  }

  zoomToCenter(nextScale) {
    const bounds = this._bounds();
    const scale = clampVideoZoom(
      nextScale,
      VIDEO_ZOOM_MIN,
      this._maxScale,
    );
    const pan = clampVideoPan({
      x: (bounds.width - bounds.width * scale) / 2,
      y: (bounds.height - bounds.height * scale) / 2,
      scale,
      width: bounds.width,
      height: bounds.height,
    });
    this._scale = scale;
    this._x = pan.x;
    this._y = pan.y;
    this._coverPositionX = 0.5;
    this._coverPositionY = 0.5;
    this._coverPannable = false;
    this._apply();
  }

  zoomBy(delta, clientX = null, clientY = null) {
    const step = Number(delta);
    if (!Number.isFinite(step) || step === 0) return;
    const bounds = this._bounds();
    const focalX =
      clientX == null ? bounds.left + bounds.width / 2 : Number(clientX);
    const focalY =
      clientY == null ? bounds.top + bounds.height / 2 : Number(clientY);
    this.zoomTo(this._scale + step, focalX, focalY);
  }

  toggleDoubleZoom(clientX, clientY) {
    if (this._scale > VIDEO_ZOOM_MIN + EPSILON) {
      this.reset();
      return;
    }
    this.zoomTo(VIDEO_ZOOM_DOUBLE_TAP, clientX, clientY);
  }

  _bounds() {
    const rect = this._host?.getBoundingClientRect?.() || {};
    return {
      left: Number(rect.left) || 0,
      top: Number(rect.top) || 0,
      width:
        Number(this._host?.clientWidth) ||
        Number(rect.width) ||
        Number(this._video?.offsetWidth) ||
        0,
      height:
        Number(this._host?.clientHeight) ||
        Number(rect.height) ||
        Number(this._video?.offsetHeight) ||
        0,
    };
  }

  _apply() {
    if (this._presentationSuspended) {
      this._video?.style?.setProperty?.("transform", "none", "important");
      this._video?.style?.setProperty?.("cursor", "default");
      this._video?.classList?.toggle?.("fvc-video-zoomed", false);
      return;
    }
    const transform =
      this._scale <= VIDEO_ZOOM_MIN + EPSILON
        ? "translate3d(0px, 0px, 0) scale(1)"
        : `translate3d(${this._x}px, ${this._y}px, 0) scale(${this._scale})`;
    this._video?.style?.setProperty?.("transform", transform, "important");
    if (this._nativeCoverPanEnabled) {
      this._video?.style?.setProperty?.(
        "object-position",
        `${this._coverPositionX * 100}% ${this._coverPositionY * 100}%`,
        "important",
      );
    }
    this._applyCursor();
    this._video?.classList?.toggle?.(
      "fvc-video-zoomed",
      this._scale > VIDEO_ZOOM_MIN + EPSILON,
    );
  }

  _applyCursor() {
    const cursor = this._pan
      ? "grabbing"
      : !this._hoveringMedia
        ? "default"
        : this._scale > VIDEO_ZOOM_MIN + EPSILON || this._coverPannable
          ? "grab"
          : "zoom-in";
    this._video?.style?.setProperty?.("cursor", cursor);
  }

  _pointForEvent(event) {
    return {
      pointerId: event.pointerId,
      pointerType: String(event.pointerType || "").toLowerCase(),
      clientX: Number(event.clientX) || 0,
      clientY: Number(event.clientY) || 0,
      startX: Number(event.clientX) || 0,
      startY: Number(event.clientY) || 0,
      startedAt: Date.now(),
      moved: false,
    };
  }

  _startPan(point, mode = "transform") {
    this._pan = {
      mode,
      pointerId: point.pointerId,
      startClientX: point.clientX,
      startClientY: point.clientY,
      startX: this._x,
      startY: this._y,
      startCoverOffsetX: -this._coverOverflowX * this._coverPositionX,
      startCoverOffsetY: -this._coverOverflowY * this._coverPositionY,
      coverOverflowX: this._coverOverflowX,
      coverOverflowY: this._coverOverflowY,
    };
    this._interactionTarget?.setPointerCapture?.(point.pointerId);
    this._apply();
  }

  _startPinch() {
    const points = [...this._pointers.values()].filter(
      (point) => point.pointerType === "touch",
    );
    if (points.length < 2) return;
    const first = points[0];
    const second = points[1];
    const midpoint = midpointBetween(first, second);
    const bounds = this._bounds();
    this._pinch = {
      pointerIds: [first.pointerId, second.pointerId],
      distance: Math.max(1, distanceBetween(first, second)),
      scale: this._scale,
      contentX: (midpoint.clientX - bounds.left - this._x) / this._scale,
      contentY: (midpoint.clientY - bounds.top - this._y) / this._scale,
    };
    this._pan = null;
  }

  _onWheel = (event) => {
    if (this._presentationSuspended) return;
    if (!this._isMediaInteractionStart(event)) return;
    const direction = Math.sign(Number(event.deltaY) || 0);
    if (!direction) return;
    const nextScale = clampVideoZoom(
      this._scale - direction * VIDEO_ZOOM_WHEEL_STEP,
      VIDEO_ZOOM_MIN,
      this._maxScale,
    );
    if (
      nextScale === this._scale &&
      this._scale <= VIDEO_ZOOM_MIN + EPSILON &&
      direction > 0
    ) {
      return;
    }
    event.preventDefault?.();
    if (nextScale === this._scale) return;
    this.zoomTo(nextScale, event.clientX, event.clientY);
  };

  _onDoubleClick = (event) => {
    if (this._presentationSuspended) return;
    if (!this._isMediaInteractionStart(event)) return;
    if (Date.now() - this._lastTouchZoomAt < 500) return;
    event.preventDefault?.();
    this.toggleDoubleZoom(event.clientX, event.clientY);
  };

  _onPointerDown = (event) => {
    if (this._presentationSuspended) return;
    if (!this._isMediaInteractionStart(event)) return;
    const point = this._pointForEvent(event);
    if (point.pointerType === "mouse" && Number(event.button) !== 0) return;
    this._pointers.set(point.pointerId, point);

    const touchPoints = [...this._pointers.values()].filter(
      (candidate) => candidate.pointerType === "touch",
    );
    if (touchPoints.length >= 2) {
      event.preventDefault?.();
      this._startPinch();
      return;
    }
    if (this._scale > VIDEO_ZOOM_MIN + EPSILON) {
      event.preventDefault?.();
      this._startPan(point);
      return;
    }
    // Measure native cover crop once per gesture; popup resizing stays write-only.
    if (this._refreshNativeCoverPan()) {
      event.preventDefault?.();
      this._startPan(point, "cover");
    }
  };

  _onPointerMove = (event) => {
    const point = this._pointers.get(event.pointerId);
    if (!point) {
      this._hoveringMedia = this._isPointOverDisplayedMedia(event);
      this._applyCursor();
      return;
    }
    point.clientX = Number(event.clientX) || 0;
    point.clientY = Number(event.clientY) || 0;
    if (
      Math.hypot(point.clientX - point.startX, point.clientY - point.startY) >
      MOVE_TOLERANCE_PX
    ) {
      point.moved = true;
    }

    if (this._pinch) {
      const first = this._pointers.get(this._pinch.pointerIds[0]);
      const second = this._pointers.get(this._pinch.pointerIds[1]);
      if (!first || !second) return;
      event.preventDefault?.();
      const midpoint = midpointBetween(first, second);
      const bounds = this._bounds();
      const scale = clampVideoZoom(
        this._pinch.scale *
          (distanceBetween(first, second) / this._pinch.distance),
        VIDEO_ZOOM_MIN,
        this._maxScale,
      );
      const pan = clampVideoPan({
        x:
          midpoint.clientX -
          bounds.left -
          this._pinch.contentX * scale,
        y:
          midpoint.clientY -
          bounds.top -
          this._pinch.contentY * scale,
        scale,
        width: bounds.width,
        height: bounds.height,
      });
      this._scale = scale;
      this._x = pan.x;
      this._y = pan.y;
      this._apply();
      return;
    }

    if (!this._pan || this._pan.pointerId !== event.pointerId) return;
    event.preventDefault?.();
    if (this._pan.mode === "cover") {
      const deltaX = point.clientX - this._pan.startClientX;
      const deltaY = point.clientY - this._pan.startClientY;
      const overflowX = this._pan.coverOverflowX;
      const overflowY = this._pan.coverOverflowY;
      if (overflowX > COVER_OVERFLOW_EPSILON_PX) {
        const offsetX = Math.min(
          0,
          Math.max(-overflowX, this._pan.startCoverOffsetX + deltaX),
        );
        this._coverPositionX = -offsetX / overflowX;
      }
      if (overflowY > COVER_OVERFLOW_EPSILON_PX) {
        const offsetY = Math.min(
          0,
          Math.max(-overflowY, this._pan.startCoverOffsetY + deltaY),
        );
        this._coverPositionY = -offsetY / overflowY;
      }
      this._apply();
      return;
    }
    const bounds = this._bounds();
    const pan = clampVideoPan({
      x: this._pan.startX + point.clientX - this._pan.startClientX,
      y: this._pan.startY + point.clientY - this._pan.startClientY,
      scale: this._scale,
      width: bounds.width,
      height: bounds.height,
    });
    this._x = pan.x;
    this._y = pan.y;
    this._apply();
  };

  _finishPointer(event, cancelled = false) {
    const point = this._pointers.get(event.pointerId);
    if (!point) return;
    const wasPinching = !!this._pinch;
    this._pointers.delete(event.pointerId);
    this._interactionTarget?.releasePointerCapture?.(event.pointerId);

    if (this._pinch?.pointerIds.includes(event.pointerId)) {
      this._pinch = null;
      this._lastTouchZoomAt = Date.now();
    }
    if (this._pan?.pointerId === event.pointerId) {
      this._pan = null;
    }

    const remainingTouches = [...this._pointers.values()].filter(
      (candidate) => candidate.pointerType === "touch",
    );
    const coverPannable =
      remainingTouches.length === 1 &&
      this._scale <= VIDEO_ZOOM_MIN + EPSILON
        ? this._refreshNativeCoverPan()
        : false;
    if (
      remainingTouches.length === 1 &&
      (this._scale > VIDEO_ZOOM_MIN + EPSILON || coverPannable)
    ) {
      remainingTouches[0].moved = true;
      this._startPan(
        remainingTouches[0],
        this._scale > VIDEO_ZOOM_MIN + EPSILON ? "transform" : "cover",
      );
    }

    if (
      !cancelled &&
      !wasPinching &&
      point.pointerType === "touch" &&
      !point.moved
    ) {
      const now = Date.now();
      const currentTap = {
        clientX: Number(event.clientX) || point.clientX,
        clientY: Number(event.clientY) || point.clientY,
        at: now,
      };
      if (
        this._lastTap &&
        now - this._lastTap.at <= DOUBLE_TAP_DELAY_MS &&
        distanceBetween(this._lastTap, currentTap) <= DOUBLE_TAP_DISTANCE_PX
      ) {
        event.preventDefault?.();
        this._lastTap = null;
        this._lastTouchZoomAt = now;
        this.toggleDoubleZoom(currentTap.clientX, currentTap.clientY);
      } else {
        this._lastTap = currentTap;
      }
    }

    this._apply();
  }

  _onPointerUp = (event) => {
    this._finishPointer(event, false);
  };

  _onPointerCancel = (event) => {
    this._finishPointer(event, true);
  };

  _onPointerLeave = () => {
    if (this._pointers.size) return;
    this._hoveringMedia = false;
    this._applyCursor();
  };

  _onLoadStart = () => {
    this._presentationInterrupted = true;
    this.reset();
  };

  _onPresentationInterrupted = () => {
    this._presentationInterrupted = true;
    if (typeof this._video?.requestVideoFrameCallback === "function") {
      this._refreshPresentationAfterNextVideoFrame();
    }
  };

  _onPresentationResumed = () => {
    if (!this._presentationInterrupted) return;
    this._refreshPresentationAfterNextVideoFrame();
  };

  _isMediaInteractionStart(event) {
    const path = event?.composedPath?.();
    let isMediaTarget = Array.isArray(path) && path.includes(this._video);
    const target = event?.target;
    if (!isMediaTarget) {
      isMediaTarget =
        !target ||
        target === this._video ||
        this._video?.contains?.(target) === true;
    }
    if (!isMediaTarget || !this._isPointOverDisplayedMedia(event)) return false;
    this._hoveringMedia = true;
    return true;
  }

  _isPointOverDisplayedMedia(event) {
    const clientX = Number(event?.clientX);
    const clientY = Number(event?.clientY);
    if (!Number.isFinite(clientX) || !Number.isFinite(clientY)) return true;
    const rect = this._displayedMediaRect();
    if (!rect) return true;
    return (
      clientX >= rect.left &&
      clientX <= rect.right &&
      clientY >= rect.top &&
      clientY <= rect.bottom
    );
  }

  _displayedMediaRect() {
    const bounds = this._bounds();
    const source = resolveDisplayedFrameDimensions(this._video);
    if (!source.width || !source.height) return null;
    const computedStyle = globalThis.getComputedStyle?.(this._video);
    const objectFit =
      computedStyle?.objectFit ||
      computedStyle?.getPropertyValue?.("object-fit") ||
      this._video?.style?.objectFit ||
      this._video?.style?.getPropertyValue?.("object-fit") ||
      "contain";
    const geometry = resolveDisplayedFrameGeometry({
      sourceWidth: source.width,
      sourceHeight: source.height,
      viewportWidth: bounds.width,
      viewportHeight: bounds.height,
      objectFit,
      zoomState: this.state,
    });
    const destination = geometry?.destinationRect;
    if (!destination) return null;
    const left = bounds.left + destination.x;
    const top = bounds.top + destination.y;
    return {
      left,
      top,
      right: left + destination.width,
      bottom: top + destination.height,
    };
  }

  _refreshNativeCoverPan() {
    if (!this._nativeCoverPanEnabled) return false;
    const computedStyle = globalThis.getComputedStyle?.(this._video);
    const objectFit = String(
      computedStyle?.objectFit ||
        computedStyle?.getPropertyValue?.("object-fit") ||
        this._video?.style?.objectFit ||
        this._video?.style?.getPropertyValue?.("object-fit") ||
        "contain",
    ).toLowerCase();
    if (objectFit !== "cover") {
      this._coverPositionX = 0.5;
      this._coverPositionY = 0.5;
      this._coverOverflowX = 0;
      this._coverOverflowY = 0;
      this._coverPannable = false;
      return false;
    }
    const source = resolveDisplayedFrameDimensions(this._video);
    const bounds = this._bounds();
    if (!source.width || !source.height || !bounds.width || !bounds.height) {
      this._coverPannable = false;
      return false;
    }
    const fitScale = Math.max(
      bounds.width / source.width,
      bounds.height / source.height,
    );
    this._coverOverflowX = Math.max(
      0,
      source.width * fitScale - bounds.width,
    );
    this._coverOverflowY = Math.max(
      0,
      source.height * fitScale - bounds.height,
    );
    if (this._coverOverflowX <= COVER_OVERFLOW_EPSILON_PX) {
      this._coverPositionX = 0.5;
    }
    if (this._coverOverflowY <= COVER_OVERFLOW_EPSILON_PX) {
      this._coverPositionY = 0.5;
    }
    this._coverPannable =
      this._scale <= VIDEO_ZOOM_MIN + EPSILON &&
      (this._coverOverflowX > COVER_OVERFLOW_EPSILON_PX ||
        this._coverOverflowY > COVER_OVERFLOW_EPSILON_PX);
    return this._coverPannable;
  }
}

export function attachVideoZoom(video, options = {}) {
  if (!video) return null;
  return new VideoZoomController(video, options).bind();
}
