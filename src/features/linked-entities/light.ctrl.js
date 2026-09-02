import {
  linkedLightForCamera,
  linkedLightsForCamera,
  normalizeLinkedLightPosition,
} from "./config.js";
import {
  linkedLightFriendlyName,
  linkedLightStateSignature,
  resolveLinkedLightUiState,
} from "./light.model.js";
import { buildLinkedLightControlMarkup } from "./light.tmpl.js";
import {
  setHomeAssistantLightBrightness,
  toggleHomeAssistantLight,
} from "../../integrations/home-assistant/light-control.js";
import { flattenCameraMembers } from "../camera-groups/model.js";

const LONG_PRESS_MS = 500;
const LONG_PRESS_MOVE_PX = 12;

const releaseTouchFocus = (button, event) => {
  const touchGenerated =
    event?.pointerType === "touch" ||
    event?.sourceCapabilities?.firesTouchEvents === true;
  let coarsePointer = false;
  try {
    coarsePointer =
      globalThis.matchMedia?.("(hover: none), (pointer: coarse)")?.matches ===
      true;
  } catch (_) {}
  if (!touchGenerated && !coarsePointer) return false;
  button?.blur?.();
  return true;
};

export class LinkedLightController {
  constructor(host) {
    this.host = host;
    this.press = null;
    this.suppressClickButton = null;
    this._onPointerMove = (event) => this.handlePointerMove(event);
    this._onPointerUp = (event) => this.handlePointerStop(event);
    this._onPointerCancel = (event) => this.handlePointerStop(event);
    this._onInput = (event) => this.handleInput(event);
    this._onChange = (event) => void this.handleChange(event);
    this._onKeyDown = (event) => this.handleKeyDown(event);
    host.shadowRoot?.addEventListener("pointermove", this._onPointerMove);
    host.shadowRoot?.addEventListener("input", this._onInput);
    host.shadowRoot?.addEventListener("change", this._onChange);
    host.shadowRoot?.addEventListener("keydown", this._onKeyDown);
  }

  config(camera = this.host?._activeCam) {
    return linkedLightForCamera(camera);
  }

  configs(camera = this.host?._activeCam) {
    return linkedLightsForCamera(camera);
  }

  stateObject(config = this.config()) {
    return this.host?._hass?.states?.[config?.entity];
  }

  position(config = this.config()) {
    return normalizeLinkedLightPosition(config?.position);
  }

  stateSignature() {
    return linkedLightStateSignature(
      this.host?._hass,
      this.host?._config?.cameras,
    );
  }

  buildMarkup({
    buttonClass = "round-btn",
    camera = this.host?._activeCam,
    position = null,
  } = {}) {
    const requestedPosition = position
      ? normalizeLinkedLightPosition(position)
      : null;
    return this.configs(camera)
      .filter(
        (config) =>
          !requestedPosition || this.position(config) === requestedPosition,
      )
      .map((config) => this._buildMarkup(config, buttonClass))
      .join("");
  }

  _buildMarkup(config, buttonClass) {
    return buildLinkedLightControlMarkup({
      config,
      stateObject: this.stateObject(config),
      buttonClass,
    });
  }

  sync() {
    this.host?.shadowRoot
      ?.querySelectorAll?.('[data-fvc-region="linked-entities"]')
      ?.forEach((slot) => {
        const cameraEntity = String(
          slot.dataset?.linkedLightCamera || "",
        ).trim();
        const camera = cameraEntity
          ? flattenCameraMembers(this.host?._config?.cameras).find(
              (candidate) => candidate?.entity === cameraEntity,
            ) || null
          : this.host?._activeCam;
        const positionSlots = Array.from(
          slot.querySelectorAll?.("[data-linked-light-position-slot]") || [],
        );
        const renderSlots = positionSlots.length ? positionSlots : [slot];
        let renderedAny = false;
        renderSlots.forEach((renderSlot) => {
          const requestedPosition = renderSlot.dataset
            ?.linkedLightPositionSlot
            ? normalizeLinkedLightPosition(
                renderSlot.dataset.linkedLightPositionSlot,
              )
            : null;
          const configs = this.configs(camera).filter(
            (config) =>
              !requestedPosition ||
              this.position(config) === requestedPosition,
          );
          const existingControls = Array.from(
            renderSlot.querySelectorAll?.("[data-linked-light]") || [],
          );
          const variant =
            existingControls[0]?.dataset?.linkedLightVariant ||
            renderSlot.dataset?.linkedLightVariant ||
            slot.dataset?.linkedLightVariant ||
            "round-btn";
          const expectedEntities = configs.map(({ entity }) => entity);
          const existingEntities = existingControls.map(
            (control) => control.dataset?.linkedLight || "",
          );
          const needsRebuild =
            expectedEntities.length !== existingEntities.length ||
            expectedEntities.some(
              (entity, index) => entity !== existingEntities[index],
            ) ||
            existingControls.some((control, index) => {
              const config = configs[index];
              return (
                Boolean(
                  control.querySelector("[data-linked-light-dimmer]"),
                ) !==
                resolveLinkedLightUiState(
                  this.stateObject(config),
                ).supportsBrightness
              );
            });
          if (needsRebuild) {
            renderSlot.innerHTML = configs
              .map((config) => this._buildMarkup(config, variant))
              .join("");
          } else {
            existingControls.forEach((control, index) => {
              this._patchControl(
                control,
                configs[index],
                this.stateObject(configs[index]),
              );
            });
          }
          renderSlot.hidden = configs.length === 0;
          renderedAny ||= configs.length > 0;
        });
        slot.hidden = !renderedAny;
      });
  }

  _patchControl(control, config, stateObject) {
    const ui = resolveLinkedLightUiState(stateObject);
    const button = control.querySelector("[data-linked-light-toggle]");
    const input = control.querySelector("[data-linked-light-brightness]");
    const title = control.querySelector("[data-linked-light-title]");
    const output = control.querySelector("[data-linked-light-output]");
    const power = control.querySelector("[data-linked-light-power]");
    const icon =
      String(config?.icon || stateObject?.attributes?.icon || "").trim() ||
      "mdi:lightbulb";
    const friendlyName = linkedLightFriendlyName(config?.entity, stateObject);
    const stateLabel = !ui.available
      ? "Unavailable"
      : ui.on
        ? `${ui.brightnessPercent}%`
        : "Off";
    const buttonLabel = `${friendlyName}: ${stateLabel}. ${
      ui.on ? "Turn off" : "Turn on"
    }${ui.supportsBrightness ? ". Press and hold to adjust brightness" : ""}`;
    control.style.setProperty("--linked-light-level", ui.brightnessPercent);
    control.dataset.linkedLightPosition = this.position(config);
    if (button) {
      button.disabled = !ui.available;
      button.classList.toggle("is-on", ui.on);
      button.classList.toggle("is-off", !ui.on);
      button.classList.toggle("is-dimmed", ui.dimmed);
      button.setAttribute("aria-pressed", ui.on ? "true" : "false");
      button.setAttribute("aria-label", buttonLabel);
      button.setAttribute("title", buttonLabel);
      button.querySelector("ha-icon")?.setAttribute("icon", icon);
    }
    if (input && this.host?.shadowRoot?.activeElement !== input) {
      input.value = String(ui.brightnessPercent || 1);
    }
    if (title) title.textContent = friendlyName;
    if (output && this.host?.shadowRoot?.activeElement !== input) {
      output.value = `${ui.brightnessPercent}%`;
      output.textContent = `${ui.brightnessPercent}%`;
    }
    if (power) {
      const powerLabel = ui.on
        ? `Turn off ${friendlyName}`
        : `Turn on ${friendlyName} at its previous brightness`;
      power.disabled = !ui.available;
      power.classList.toggle("is-on", ui.on);
      power.classList.toggle("is-off", !ui.on);
      power.setAttribute("aria-pressed", ui.on ? "true" : "false");
      power.setAttribute("aria-label", powerLabel);
      power.setAttribute("title", powerLabel);
    }
  }

  handlePointerDown(event) {
    const button = event.target?.closest?.("[data-linked-light-toggle]");
    if (!button || button.disabled) return false;
    const control = button.closest("[data-linked-light]");
    const dimmer = control?.querySelector("[data-linked-light-dimmer]");
    if (!dimmer) return true;
    this._clearPress();
    const press = {
      button,
      control,
      pointerId: event.pointerId,
      x: event.clientX,
      y: event.clientY,
      timer: null,
    };
    press.timer = setTimeout(() => {
      if (this.press !== press) return;
      this.suppressClickButton = button;
      this._openDimmer(control);
      button.setPointerCapture?.(press.pointerId);
      globalThis.navigator?.vibrate?.(15);
    }, LONG_PRESS_MS);
    this.press = press;
    return true;
  }

  handlePointerMove(event) {
    if (!this.press || event.pointerId !== this.press.pointerId) return;
    const distance = Math.hypot(
      event.clientX - this.press.x,
      event.clientY - this.press.y,
    );
    if (distance > LONG_PRESS_MOVE_PX) this._clearPress();
  }

  handlePointerStop(event) {
    if (!this.press || event.pointerId !== this.press.pointerId) return;
    this._clearPress();
  }

  handleClick(event, target = event?.target) {
    const dismiss = target?.closest?.("[data-linked-light-dimmer-dismiss]");
    if (dismiss) {
      event?.preventDefault?.();
      event?.stopPropagation?.();
      this.closeDimmers();
      return true;
    }
    const power = target?.closest?.("[data-linked-light-power]");
    if (power) {
      event?.preventDefault?.();
      event?.stopPropagation?.();
      if (power.disabled) return true;
      const entity = power.closest("[data-linked-light]")?.dataset?.linkedLight;
      power.classList.add("is-pending");
      void toggleHomeAssistantLight({ hass: this.host?._hass, entity })
        .catch(() => this.host?._toast?.("Unable to control light"))
        .finally(() => power.classList.remove("is-pending"));
      return true;
    }
    const button = target?.closest?.("[data-linked-light-toggle]");
    if (button) {
      event?.preventDefault?.();
      event?.stopPropagation?.();
      releaseTouchFocus(button, event);
      if (this.suppressClickButton === button) {
        this.suppressClickButton = null;
        return true;
      }
      if (button.disabled) return true;
      const entity = button.closest("[data-linked-light]")?.dataset?.linkedLight;
      button.classList.add("is-pending");
      void toggleHomeAssistantLight({ hass: this.host?._hass, entity })
        .catch(() => this.host?._toast?.("Unable to control light"))
        .finally(() => button.classList.remove("is-pending"));
      return true;
    }
    if (target?.closest?.("[data-linked-light-dimmer]")) return true;
    this.closeDimmers();
    return false;
  }

  handleInput(event) {
    const input = event.target?.closest?.("[data-linked-light-brightness]");
    if (!input) return;
    const control = input.closest("[data-linked-light]");
    const value = Math.max(1, Math.min(100, Math.round(Number(input.value))));
    control?.style?.setProperty("--linked-light-level", value);
    const output = control?.querySelector("[data-linked-light-output]");
    if (output) {
      output.value = `${value}%`;
      output.textContent = `${value}%`;
    }
  }

  async handleChange(event) {
    const input = event.target?.closest?.("[data-linked-light-brightness]");
    if (!input) return;
    const entity = input.closest("[data-linked-light]")?.dataset?.linkedLight;
    try {
      await setHomeAssistantLightBrightness({
        hass: this.host?._hass,
        entity,
        brightnessPercent: input.value,
      });
    } catch (_) {
      this.host?._toast?.("Unable to adjust light brightness");
    }
  }

  handleKeyDown(event) {
    if (event.key !== "Escape") return;
    this.closeDimmers();
  }

  _openDimmer(control) {
    this.closeDimmers(control);
    const dimmer = control?.querySelector("[data-linked-light-dimmer]");
    if (!dimmer) return;
    dimmer.hidden = false;
    control.querySelector("[data-linked-light-brightness]")?.focus?.();
  }

  closeDimmers(exceptControl = null) {
    this.host?.shadowRoot
      ?.querySelectorAll?.("[data-linked-light-dimmer]")
      ?.forEach((dimmer) => {
        if (
          exceptControl &&
          dimmer.closest("[data-linked-light]") === exceptControl
        ) {
          return;
        }
        dimmer.hidden = true;
      });
  }

  _clearPress() {
    if (this.press?.timer) clearTimeout(this.press.timer);
    this.press = null;
  }

  cancelInteractions() {
    this._clearPress();
    this.suppressClickButton = null;
    this.closeDimmers();
  }
}
