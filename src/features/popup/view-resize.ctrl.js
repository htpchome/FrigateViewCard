import { CleanupController } from "../../shared/cleanup.js";
import { resolveDisplayedFrameDimensions } from "../../shared/media/frame-capture.js";

export const POPUP_VIEW_MAX_HEIGHT_DVH = 70;
export const POPUP_VIEW_INITIAL_MAX_HEIGHT_RATIO = 3 / 4;

const POPUP_VIEW_NEAR_WIDE_HEIGHT_RATIO = 2 / 3;
const RATIO_EPSILON = 0.005;
const KEYBOARD_RESIZE_STEP = 0.025;
const DOUBLE_ACTIVATION_MS = 360;
const DRAG_THRESHOLD_PX = 3;

const positiveNumber = (value) => {
  const number = Number(value);
  return Number.isFinite(number) && number > 0 ? number : 0;
};

const clamp = (value, min, max) =>
  Math.min(max, Math.max(min, Number(value) || min));

export const resolvePopupViewRenderedMaxHeightRatio = ({
  containerWidth,
  maxHeight,
  minHeightRatio,
  maxHeightRatio,
} = {}) => {
  const minRatio = positiveNumber(minHeightRatio);
  const maxRatio = Math.max(minRatio, positiveNumber(maxHeightRatio));
  const width = positiveNumber(containerWidth);
  const height = positiveNumber(maxHeight);
  if (!width || !height) return maxRatio;
  return clamp(height / width, minRatio, maxRatio);
};

export const resolvePopupViewAvailableMaxHeight = ({
  viewerHeight,
  containerBottom,
  keepVisibleBottom,
} = {}) => {
  const height = positiveNumber(viewerHeight);
  const bottom = Number(containerBottom);
  const visibleBottom = Number(keepVisibleBottom);
  if (
    !height ||
    !Number.isFinite(bottom) ||
    !Number.isFinite(visibleBottom)
  ) {
    return 0;
  }
  return Math.max(height, height + bottom - visibleBottom);
};

const resolveCssPixelLength = (value) => {
  const raw = String(value || "").trim().toLowerCase();
  const number = positiveNumber(Number.parseFloat(raw));
  if (!number) return 0;
  if (raw.endsWith("dvh")) {
    const viewportHeight = positiveNumber(
      globalThis.visualViewport?.height || globalThis.innerHeight,
    );
    return viewportHeight ? (number / 100) * viewportHeight : 0;
  }
  if (raw.endsWith("vh")) {
    const viewportHeight = positiveNumber(globalThis.innerHeight);
    return viewportHeight ? (number / 100) * viewportHeight : 0;
  }
  return number;
};

const heightRatioToAspectRatio = (heightRatio) =>
  `${(1 / heightRatio).toFixed(6)} / 1`;

const heightRatioToMaxWidth = (heightRatio) =>
  `${
    Math.round((POPUP_VIEW_MAX_HEIGHT_DVH / heightRatio) * 1000) / 1000
  }dvh`;

export function resolvePopupViewResizeBounds({ mediaWidth, mediaHeight }) {
  const width = positiveNumber(mediaWidth);
  const height = positiveNumber(mediaHeight);
  const naturalHeightRatio = width > 0 && height > 0 ? height / width : 0;
  const minHeightRatio = Math.min(
    naturalHeightRatio,
    POPUP_VIEW_INITIAL_MAX_HEIGHT_RATIO,
  );
  const maxHeightRatio =
    naturalHeightRatio <= POPUP_VIEW_NEAR_WIDE_HEIGHT_RATIO + RATIO_EPSILON
      ? naturalHeightRatio * 1.5
      : naturalHeightRatio;

  return {
    eligible:
      naturalHeightRatio > 0 &&
      maxHeightRatio - minHeightRatio > RATIO_EPSILON,
    initialHeightCapped:
      naturalHeightRatio > POPUP_VIEW_INITIAL_MAX_HEIGHT_RATIO,
    naturalHeightRatio,
    minHeightRatio,
    maxHeightRatio,
  };
}

// Native cover owns the resize crop; transforms remain available for user zoom.
export const resolvePopupViewResizeZoomScale = () => 1;

export const createPopupViewResizeGrip = (
  documentRef = globalThis.document,
) => {
  const grip = documentRef?.createElement?.("button");
  if (!grip) return null;
  grip.className = "popup-view-resize-grip";
  grip.type = "button";
  grip.hidden = true;
  grip.setAttribute("role", "slider");
  grip.setAttribute("aria-orientation", "vertical");
  grip.setAttribute("aria-label", "Resize popup media view");
  grip.title =
    "Drag to resize popup media; double-click or double-tap to reset";
  return grip;
};

export const placePopupViewResizeGrip = ({
  viewer,
  media,
  grip,
  metadataHost = null,
  mobileTablet = false,
} = {}) => {
  if (!viewer || !grip) return "none";
  const isVideo = String(media?.tagName || "").toLowerCase() === "video";
  const placeInMetadata = Boolean(
    isVideo && !mobileTablet && metadataHost,
  );
  grip.classList?.toggle?.(
    "popup-view-resize-grip--metadata",
    placeInMetadata,
  );
  (placeInMetadata ? metadataHost : viewer).appendChild?.(grip);
  return placeInMetadata ? "metadata" : "media";
};

export class PopupViewResizeController {
  constructor({
    viewer,
    media,
    grip,
    controls = null,
    zoomController = null,
    getAvailableMaxHeight = null,
    getComputedStyle = (element) =>
      globalThis.getComputedStyle?.(element) || null,
  }) {
    this._viewer = viewer;
    this._media = media;
    this._grip = grip;
    this._controls = controls;
    this._zoomController = zoomController;
    this._getAvailableMaxHeight = getAvailableMaxHeight;
    this._getComputedStyle = getComputedStyle;
    this._bounds = null;
    this._heightRatio = 0;
    this._drag = null;
    this._lastActivationAt = 0;
    this._cleanup = new CleanupController();
  }

  bind() {
    if (!this._viewer || !this._media || !this._grip) return this;
    const gripListeners = {
      pointerdown: this._onPointerDown,
      pointermove: this._onPointerMove,
      pointerup: this._onPointerUp,
      pointercancel: this._onPointerCancel,
      keydown: this._onKeyDown,
    };
    for (const [eventName, listener] of Object.entries(gripListeners)) {
      this._cleanup.addEventListener(this._grip, eventName, listener);
    }
    for (const eventName of ["loadedmetadata", "resize", "load"]) {
      this._cleanup.addEventListener(
        this._media,
        eventName,
        this._syncFromMedia,
      );
    }
    this._viewer.classList?.toggle?.(
      "popup-view-resize-video",
      String(this._media.tagName || "").toLowerCase() === "video",
    );
    this.sync();
    return this;
  }

  sync() {
    const { width, height } = resolveDisplayedFrameDimensions(this._media);
    const nextBounds = resolvePopupViewResizeBounds({
      mediaWidth: width,
      mediaHeight: height,
    });
    this._viewer.classList?.toggle?.(
      "popup-media-height-capped",
      nextBounds.initialHeightCapped,
    );
    if (!nextBounds.eligible) {
      this._bounds = null;
      this._clearPresentation();
      return;
    }

    const naturalChanged =
      !this._bounds ||
      Math.abs(
        this._bounds.naturalHeightRatio - nextBounds.naturalHeightRatio,
      ) > RATIO_EPSILON;
    this._bounds = nextBounds;
    this._heightRatio = naturalChanged
      ? nextBounds.minHeightRatio
      : clamp(
          this._heightRatio,
          nextBounds.minHeightRatio,
          nextBounds.maxHeightRatio,
        );
    this._grip.hidden = false;
    this._applyHeightRatio(this._heightRatio);
  }

  reset() {
    if (!this._bounds) return;
    this._lastActivationAt = 0;
    this._applyHeightRatio(this._bounds.minHeightRatio, {
      syncZoom: true,
    });
  }

  dispose() {
    this.reset();
    this._cleanup.dispose();
    this._viewer?.classList?.remove?.(
      "popup-media-resized",
      "popup-media-height-capped",
      "popup-view-resizing",
      "popup-view-resize-video",
    );
    this._grip?.remove?.();
    this._bounds = null;
    this._drag = null;
  }

  _resolveRenderedMaxHeightRatio(availableMaxHeight = 0) {
    const rect = this._viewer.getBoundingClientRect?.() || {};
    const containerWidth = positiveNumber(
      rect.width || this._viewer.clientWidth,
    );
    const computedStyle = this._getComputedStyle?.(this._viewer);
    const cssMaxHeight = resolveCssPixelLength(
      computedStyle?.maxHeight ||
        computedStyle?.getPropertyValue?.("max-height"),
    );
    const interactionMaxHeight = positiveNumber(availableMaxHeight);
    const maxHeight =
      cssMaxHeight && interactionMaxHeight
        ? Math.min(cssMaxHeight, interactionMaxHeight)
        : cssMaxHeight || interactionMaxHeight;
    return resolvePopupViewRenderedMaxHeightRatio({
      containerWidth,
      maxHeight,
      minHeightRatio: this._bounds?.minHeightRatio,
      maxHeightRatio: this._bounds?.maxHeightRatio,
    });
  }

  _applyHeightRatio(
    heightRatio,
    { syncZoom = false, maxHeightRatio = 0 } = {},
  ) {
    if (!this._bounds) return;
    const resolvedMaxHeightRatio =
      positiveNumber(maxHeightRatio) ||
      this._resolveRenderedMaxHeightRatio();
    const nextRatio = clamp(
      heightRatio,
      this._bounds.minHeightRatio,
      resolvedMaxHeightRatio,
    );
    this._heightRatio = nextRatio;
    const maxWidth = heightRatioToMaxWidth(nextRatio);
    this._viewer.style?.setProperty(
      "--popup-media-aspect-ratio",
      heightRatioToAspectRatio(nextRatio),
    );
    this._viewer.style?.setProperty("--popup-media-max-width", maxWidth);
    this._controls?.style?.setProperty?.("--popup-media-max-width", maxWidth);
    this._viewer.classList?.toggle?.(
      "popup-media-resized",
      Math.abs(nextRatio - this._bounds.minHeightRatio) > RATIO_EPSILON,
    );

    const value = Math.round(nextRatio * 100);
    this._grip.setAttribute?.(
      "aria-valuemin",
      String(Math.round(this._bounds.minHeightRatio * 100)),
    );
    this._grip.setAttribute?.(
      "aria-valuemax",
      String(Math.round(resolvedMaxHeightRatio * 100)),
    );
    this._grip.setAttribute?.("aria-valuenow", String(value));
    this._grip.setAttribute?.(
      "aria-valuetext",
      `Popup media height ${value}% of its width`,
    );
    if (syncZoom) this._syncZoom(nextRatio);
  }

  _syncZoom(heightRatio) {
    const zoomController = this._zoomController;
    if (!zoomController) return;
    zoomController.zoomToCenter(
      resolvePopupViewResizeZoomScale({
        heightRatio,
        naturalHeightRatio: this._bounds?.naturalHeightRatio,
      }),
    );
  }

  _clearPresentation() {
    this._viewer?.classList?.remove?.(
      "popup-media-resized",
      "popup-view-resizing",
    );
    if (this._grip) this._grip.hidden = true;
  }

  _syncFromMedia = () => this.sync();

  _onPointerDown = (event) => {
    if (event?.button != null && event.button !== 0) return;
    this.sync();
    if (!this._bounds || this._grip?.hidden) return;
    const rect = this._viewer.getBoundingClientRect?.() || {};
    const width = positiveNumber(rect.width || this._viewer.clientWidth);
    if (!width) return;

    this._drag = {
      pointerId: event.pointerId,
      startY: Number(event.clientY) || 0,
      startHeightRatio: this._heightRatio,
      containerWidth: width,
      maxHeightRatio: this._resolveRenderedMaxHeightRatio(
        this._getAvailableMaxHeight?.() || 0,
      ),
      moved: false,
    };
    this._viewer.classList?.add?.("popup-view-resizing");
    this._grip.setPointerCapture?.(event.pointerId);
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
    this._grip.releasePointerCapture?.(event.pointerId);
    this._viewer.classList?.remove?.("popup-view-resizing");
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
    let nextRatio = null;
    if (event.key === "ArrowDown") {
      nextRatio = this._heightRatio + KEYBOARD_RESIZE_STEP;
    } else if (event.key === "ArrowUp") {
      nextRatio = this._heightRatio - KEYBOARD_RESIZE_STEP;
    } else if (event.key === "Home") {
      nextRatio = this._bounds.minHeightRatio;
    } else if (event.key === "End") {
      nextRatio = this._bounds.maxHeightRatio;
    }
    if (nextRatio == null) return;
    this._applyHeightRatio(nextRatio, {
      syncZoom: true,
      maxHeightRatio: this._resolveRenderedMaxHeightRatio(
        this._getAvailableMaxHeight?.() || 0,
      ),
    });
    event.preventDefault?.();
    event.stopPropagation?.();
  };
}
