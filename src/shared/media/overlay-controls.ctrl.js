import { CleanupController } from "../cleanup.js";

const TAP_MOVE_TOLERANCE_PX = 8;

export class MediaOverlayControlsController {
  constructor({
    surface,
    wrap,
    show,
    hideNow,
    hideSoon,
    revealDurationMs = 1300,
  }) {
    this._surface = surface || wrap;
    this._show = show;
    this._hideNow = hideNow;
    this._hideSoon = hideSoon;
    this._revealDurationMs = Math.max(0, Number(revealDurationMs) || 0);
    this._cleanup = new CleanupController();
    this._pointers = new Map();
  }

  bind() {
    if (!this._surface) return;
    this._cleanup.addEventListener(
      this._surface,
      "pointerenter",
      this._onPointerEnter,
      { passive: true },
    );
    this._cleanup.addEventListener(
      this._surface,
      "pointerleave",
      this._onPointerLeave,
      { passive: true },
    );
    this._cleanup.addEventListener(
      this._surface,
      "pointerdown",
      this._onPointerDown,
      { passive: true, capture: true },
    );
    this._cleanup.addEventListener(
      this._surface,
      "pointermove",
      this._onPointerMove,
      { passive: true, capture: true },
    );
    this._cleanup.addEventListener(
      this._surface,
      "pointerup",
      this._onPointerUp,
      { passive: true, capture: true },
    );
    this._cleanup.addEventListener(
      this._surface,
      "pointercancel",
      this._onPointerCancel,
      { passive: true, capture: true },
    );
  }

  dispose() {
    this._cleanup.dispose();
    this._pointers.clear();
    this._hideNow?.();
  }

  _onPointerEnter = (event) => {
    if (event?.pointerType === "mouse") this._show?.();
  };

  _onPointerLeave = (event) => {
    if (event?.pointerType === "mouse") this._hideNow?.();
  };

  _onPointerDown = (event) => {
    const pointerType = String(event?.pointerType || "").toLowerCase();
    if (pointerType === "mouse") return;
    if (event?.target?.closest?.("[data-media-overlay-ignore]")) return;
    this._pointers.set(event.pointerId, {
      startX: Number(event.clientX) || 0,
      startY: Number(event.clientY) || 0,
      moved: false,
    });
    if (this._pointers.size > 1) {
      this._pointers.forEach((pointer) => {
        pointer.moved = true;
      });
    }
  };

  _onPointerMove = (event) => {
    const pointer = this._pointers.get(event.pointerId);
    if (!pointer || pointer.moved) return;
    const distance = Math.hypot(
      (Number(event.clientX) || 0) - pointer.startX,
      (Number(event.clientY) || 0) - pointer.startY,
    );
    if (distance > TAP_MOVE_TOLERANCE_PX) pointer.moved = true;
  };

  _onPointerUp = (event) => {
    const pointer = this._pointers.get(event.pointerId);
    this._pointers.delete(event.pointerId);
    if (!pointer || pointer.moved) return;
    this._show?.();
    this._hideSoon?.(this._revealDurationMs);
  };

  _onPointerCancel = (event) => {
    this._pointers.delete(event.pointerId);
  };
}
