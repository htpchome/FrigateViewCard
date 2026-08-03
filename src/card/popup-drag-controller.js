import { CleanupController } from "./cleanup-controller.js";

const POPUP_DRAG_IGNORE_SELECTOR =
  "#popup-media-controls, #popup-carousel-wrap, #recording-scrub, .popup-info, .viewer, input, button, a, [data-ev]";

export class PopupDragController {
  constructor({
    popup,
    eventTarget,
    closeThreshold = 100,
    closePopup,
    isPopupOpen,
  }) {
    this._popup = popup;
    this._eventTarget = eventTarget;
    this._closeThreshold = closeThreshold;
    this._closePopup = closePopup;
    this._isPopupOpen = isPopupOpen;
    this._cleanup = new CleanupController();
    this._drag = {
      isDragging: false,
      startY: 0,
      currentY: 0,
    };
  }

  bind() {
    if (!this._popup || !this._eventTarget) return;
    this._cleanup.addEventListener(this._popup, "mousedown", this._onMouseDown);
    this._cleanup.addEventListener(
      this._popup,
      "touchstart",
      this._onTouchStart,
    );
    this._cleanup.addEventListener(
      this._eventTarget,
      "mousemove",
      this._onMouseMove,
    );
    this._cleanup.addEventListener(
      this._eventTarget,
      "touchmove",
      this._onTouchMove,
      { passive: false },
    );
    this._cleanup.addEventListener(
      this._eventTarget,
      "mouseup",
      this._onPointerEnd,
    );
    this._cleanup.addEventListener(
      this._eventTarget,
      "touchend",
      this._onPointerEnd,
    );
  }

  dispose() {
    this._resetDrag();
    this._cleanup.dispose();
  }

  _start(clientY) {
    this._drag.isDragging = true;
    this._drag.startY = clientY;
    this._drag.currentY = 0;
    this._popup.style.transition = "none";
  }

  _resetDrag() {
    this._drag.isDragging = false;
    this._drag.startY = 0;
    this._drag.currentY = 0;
    if (!this._popup) return;
    this._popup.style.transition = "";
    this._popup.style.transform = "";
  }

  _shouldIgnoreDragStart(target) {
    return !!target?.closest?.(POPUP_DRAG_IGNORE_SELECTOR);
  }

  _move(clientY, event = null) {
    if (!this._popup) return;
    if (!this._drag.isDragging || !this._isPopupOpen?.()) return;
    if (event?.cancelable) event.preventDefault();
    this._drag.currentY = clientY - this._drag.startY;
    if (this._drag.currentY > 0) {
      this._popup.style.transform = `translateY(${this._drag.currentY}px)`;
    }
  }

  _end() {
    if (!this._popup || !this._drag.isDragging) return;
    const currentY = this._drag.currentY;
    this._drag.isDragging = false;
    this._popup.style.transition = "";
    if (currentY > this._closeThreshold) {
      this._closePopup?.();
    } else {
      this._popup.style.transform = "translateY(0)";
    }
    this._drag.currentY = 0;
  }

  _onMouseDown = (event) => {
    if (this._shouldIgnoreDragStart(event.target)) return;
    this._start(event.clientY);
  };

  _onTouchStart = (event) => {
    if (this._shouldIgnoreDragStart(event.target)) return;
    this._start(event.touches[0].clientY);
  };

  _onMouseMove = (event) => {
    this._move(event.clientY);
  };

  _onTouchMove = (event) => {
    this._move(event.touches[0].clientY, event);
  };

  _onPointerEnd = () => {
    this._end();
  };
}
