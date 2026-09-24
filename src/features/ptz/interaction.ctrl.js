import {
  isPtzControlsPadEvent,
  isPtzDirectionAction,
  resolvePtzDisplayZoomPlan,
} from "./index.js";

const isHtmlButtonElement = (value) =>
  typeof HTMLButtonElement !== "undefined" &&
  value instanceof HTMLButtonElement;

export class PtzInteractionController {
  constructor(
    host,
    {
    isControlButton = isHtmlButtonElement,
    } = {},
  ) {
    this._host = host;
    this._isControlButton = isControlButton;
    this._activePointer = null;
  }

  async handleCirclePadEvent(event, eventType) {
    if (!isPtzControlsPadEvent(event)) return;
    await this.handleAction(event?.detail?.action, eventType);
  }

  async handleAction(action, eventType) {
    const displayZoomPlan = resolvePtzDisplayZoomPlan({
      camera: this._host?._activeCam,
      action,
      eventType,
    });
    if (displayZoomPlan) {
      if (displayZoomPlan.delta) {
        this._host?._attachMainLiveVideoZoom?.(this._host?._engine);
        this._host?._liveVideoZoomController?.zoomBy?.(displayZoomPlan.delta);
      }
      return;
    }

    if (isPtzDirectionAction(action)) {
      if (eventType === "press") {
        await this._host?._ptzMotionController?.start?.(action);
      } else if (eventType === "release") {
        await this.stopMotion("control-release");
      }
      return;
    }

    const context =
      await this._host?._ptzCapabilityController?.resolveContext?.();
    if (!context) return;
    try {
      await this._host?._ptzExec?.execute?.({
        ...context,
        action,
        eventType,
      });
    } catch (error) {
      console.warn("[Frigate] PTZ action failed", { action, eventType }, error);
    }
  }

  async handlePreset(presetName, button = null) {
    const preset = String(presetName || "").trim();
    if (!preset) return;

    this._setPresetButtonPending(button, true);
    try {
      const context =
        await this._host?._ptzCapabilityController?.resolveContext?.();
      if (!context) return;
      await this._host?._ptzExec?.execute?.({
        ...context,
        action: "preset",
        eventType: "press",
        argument: preset,
      });
    } catch (error) {
      console.warn("[Frigate] PTZ preset failed", { preset }, error);
    } finally {
      if (button?.isConnected !== false) {
        this._setPresetButtonPending(button, false);
      }
    }
  }

  stopMotion(reason = "release") {
    this._activePointer = null;
    return this._host?._ptzMotionController?.stop?.(reason) || Promise.resolve();
  }

  async handleControlPointerDown(event) {
    const button = event?.target?.closest?.("[data-ptz-control]");
    if (!this._isControlButton?.(button) || button.disabled) return;

    const action = String(button.dataset?.ptzControl || "").trim();
    if (!action) return;

    event.preventDefault?.();
    this._activePointer = {
      action,
      pointerId: typeof event.pointerId === "number" ? event.pointerId : null,
    };

    try {
      button.setPointerCapture?.(event.pointerId);
    } catch (_) {}

    await this.handleAction(action, "press");
  }

  async handleControlPointerStop(event) {
    const activePointer = this._activePointer;
    if (!activePointer) return;
    if (
      typeof event?.pointerId === "number" &&
      activePointer.pointerId != null &&
      event.pointerId !== activePointer.pointerId
    ) {
      return;
    }

    this._activePointer = null;
    await this.handleAction(activePointer.action, "release");
  }

  dispose() {
    this._activePointer = null;
    return this._host?._ptzMotionController?.dispose?.() || Promise.resolve();
  }

  _setPresetButtonPending(button, pending) {
    if (!button) return;
    button.disabled = pending;
    if (pending) {
      button.classList?.add?.("is-activating");
      button.setAttribute?.("aria-busy", "true");
    } else {
      button.classList?.remove?.("is-activating");
      button.removeAttribute?.("aria-busy");
    }
  }
}
