import { CleanupController } from "../../shared/cleanup.js";

export class LiveOverlayControlsController {
  constructor({ wrap, show, hideNow, hideSoon }) {
    this._wrap = wrap;
    this._show = show;
    this._hideNow = hideNow;
    this._hideSoon = hideSoon;
    this._cleanup = new CleanupController();
  }

  bind() {
    if (!this._wrap) return;
    this._cleanup.addEventListener(
      this._wrap,
      "pointerenter",
      this._onPointerEnter,
      { passive: true },
    );
    this._cleanup.addEventListener(
      this._wrap,
      "pointerleave",
      this._onPointerLeave,
      { passive: true },
    );
    this._cleanup.addEventListener(
      this._wrap,
      "pointerdown",
      this._onPointerDown,
      { passive: true },
    );
    this._cleanup.addEventListener(
      this._wrap,
      "touchstart",
      this._onTouchStart,
      {
        passive: true,
      },
    );
  }

  dispose() {
    this._cleanup.dispose();
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
    this._show?.();
    this._hideSoon?.(1300);
  };

  _onTouchStart = () => {
    this._show?.();
    this._hideSoon?.(1300);
  };
}
