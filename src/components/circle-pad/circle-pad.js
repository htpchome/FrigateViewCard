/**
 * circle-pad.js
 * ---------------------------------------------------------------
 * Reusable SVG wheel custom element: <circle-pad-control>
 *
 * Mini API / integration notes
 *
 * 1) Register + render
 *    - This module defines <circle-pad-control> once per page via
 *      customElements.define("circle-pad-control", CirclePadControl).
 *    - Render the element anywhere:
 *        <circle-pad-control id="pad"></circle-pad-control>
 *
 * 2) Events to wire
 *    - Direction slices are momentary:
 *        "circle-pad-press"   detail: { action }
 *        "circle-pad-release" detail: { action }
 *      Actions: up, right, down, left, zoom-in, zoom-out
 * 3) Sizing behavior
 *    - The control scales to available space (SVG uses a square viewBox,
 *      host/wrapper use width:100%, height:100%, aspect-ratio:1/1).
 *    - Practical pattern: place it inside a sized container div to control
 *      final rendered size.
 *
 * 4) Standalone app example
 *    <div style="width: 280px; height: 280px;">
 *      <circle-pad-control id="pad"></circle-pad-control>
 *    </div>
 *    <script type="module">
 *      import "./circle-pad.js";
 *      const pad = document.getElementById("pad");
 *      pad.addEventListener("circle-pad-press", (e) => {
 *        console.log("press", e.detail.action);
 *      });
 *      pad.addEventListener("circle-pad-release", (e) => {
 *        console.log("release", e.detail.action);
 *      });
 *    </script>
 *
 * 5) Home Assistant custom card example
 *    // In your card render/template:
 *    // <div style="width: 240px; height: 240px; margin: 0 auto;">
 *    //   <circle-pad-control id="pad"></circle-pad-control>
 *    // </div>
 *    //
 *    // In your card class setup after render:
 *    // const pad = this.shadowRoot.getElementById("pad");
 *    // pad.addEventListener("circle-pad-press", (e) => {
 *    //   this._handleDirectionStart(e.detail.action);
 *    // });
 *    // pad.addEventListener("circle-pad-release", (e) => {
 *    //   this._handleDirectionStop(e.detail.action);
 *    // });
 * 6) Optional: hardware gamepad/joystick adapter
 *    - This component does not read Gamepad API directly.
 *    - To support USB/Bluetooth PTZ controllers, map gamepad axes/buttons
 *      to the same actions and event names used by this control.
 *
 *    const pad = document.getElementById("pad");
 *    let prevDirection = null;
 *
 *    const axisToDirection = (x, y, deadzone = 0.35) => {
 *      if (Math.abs(x) < deadzone && Math.abs(y) < deadzone) return null;
 *      if (Math.abs(x) >= Math.abs(y)) return x < 0 ? "left" : "right";
 *      return y < 0 ? "up" : "down";
 *    };
 *
 *    const emitPad = (type, detail) => {
 *      pad.dispatchEvent(new CustomEvent(type, {
 *        detail,
 *        bubbles: true,
 *        composed: true,
 *      }));
 *    };
 *
 *    const pollGamepad = () => {
 *      const gp = navigator.getGamepads?.()[0];
 *      if (gp) {
 *        const dir = axisToDirection(gp.axes[0] || 0, gp.axes[1] || 0);
 *        if (dir !== prevDirection) {
 *          if (prevDirection) emitPad("circle-pad-release", { action: prevDirection });
 *          if (dir) emitPad("circle-pad-press", { action: dir });
 *          prevDirection = dir;
 *        }
 *      }
 *      requestAnimationFrame(pollGamepad);
 *    };
 *    requestAnimationFrame(pollGamepad);
 *
 * This module adapts the control surface from circle-pad.html
 * (wheel-responsive-wrapper + svg), ignoring that file's external
 * parent panel wrapper.
 * ---------------------------------------------------------------
 */

const CIRCLE_PAD_CLASS = "circle-pad";
const CIRCLE_PAD_DATA_ACTION = "data-circle-pad-action";

const CIRCLE_PAD_ACTIONS = Object.freeze({
  UP: "up",
  RIGHT: "right",
  DOWN: "down",
  LEFT: "left",
  ZOOM_IN: "zoom-in",
  ZOOM_OUT: "zoom-out",
});

const DIRECTION_ACTIONS = Object.freeze(
  new Set([
    CIRCLE_PAD_ACTIONS.UP,
    CIRCLE_PAD_ACTIONS.RIGHT,
    CIRCLE_PAD_ACTIONS.DOWN,
    CIRCLE_PAD_ACTIONS.LEFT,
    CIRCLE_PAD_ACTIONS.ZOOM_IN,
    CIRCLE_PAD_ACTIONS.ZOOM_OUT,
  ]),
);

const EVT_PRESS = "circle-pad-press";
const EVT_RELEASE = "circle-pad-release";
const INPUT_MODE_TOUCH = "touch";
const INPUT_MODE_MOUSE = "mouse";
const INPUT_MODE_KEYBOARD = "keyboard";
const ACTION_SELECTOR = "[" + CIRCLE_PAD_DATA_ACTION + "]";
const DISABLED_ACTIONS_ATTR = "disabled-actions";
const KEYBOARD_ACTIVATION_KEYS = Object.freeze(new Set(["Enter", " "]));

const ROOT_EVENT_BINDINGS = Object.freeze([
  ["pointerdown", "_onPointerDown"],
  ["pointerup", "_onPointerUp"],
  ["pointercancel", "_onPointerCancel"],
  ["pointerleave", "_onPointerLeave"],
  ["keydown", "_onKeyDown"],
  ["keyup", "_onKeyUp"],
  ["focusout", "_onFocusOut"],
]);

const CIRCLE_PAD_STYLES = `
  :host {
    display: block;
    --circle-pad-bg-1: var(--primary-background-color);
    --circle-pad-bg-2: var(--card-background-color);
    --circle-pad-bg-3: var(--secondary-background-color);
    --circle-pad-dark-primary: var(--dark-primary-color);
    --circle-pad-primary: var(--primary-color);
    --circle-pad-accent: var(--accent-color);
    --circle-pad-light-primary: var(--light-primary-color);
    --circle-pad-text-1: var(--primary-text-color);
    --circle-pad-text-2: var(--secondary-text-color);
    --circle-pad-text-3: var(--disabled-text-color);
    --circle-pad-text-4: var(--state-inactive-color);
    --circle-pad-text-5: var(--text-primary-color);
    --circle-pad-success: var(--success-color);
  }

  .${CIRCLE_PAD_CLASS}__wrapper {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    overflow: visible;
    aspect-ratio: 1 / 1;
    min-height: 220px;
  }

  .${CIRCLE_PAD_CLASS}__wrapper svg {
    width: 100%;
    height: 100%;
    max-width: 100%;
    max-height: 100%;
    position: relative;
    z-index: 1;
    overflow: visible;
  }
/*==================USED BELOW============================*/
.circle-pad-outline {fill:var(--circle-pad-text-3);filter:url(#circle-pad-outside-shadow);}
.circle-pad-middle-circle {fill:var(--circle-pad-text-3);shape-rendering: geometricPrecision;filter:url(#circle-pad-outside-shadow);}
circle.circle-pad-middle-circle {
  shape-rendering: geometricPrecision;
}

/*==================USED ABOVE============================*/
.slice-button .circle-pad-key,
.slice-button path.circle-pad-key {
  cursor: pointer;
  outline: none;
  transition: fill 0.2s ease, stroke 0.2s ease, filter 0.2s ease;
  fill: var(--primary-background-color);
}
.slice-button.is-disabled .circle-pad-key,
.slice-button.is-disabled path.circle-pad-key {
  cursor: not-allowed;
  fill: var(--circle-pad-bg-3);
}
.slice-button.is-disabled {
  cursor: not-allowed;
}
.slice-button,
.slice-button:focus {
  outline: none;
}
.slice-button:focus-visible .circle-pad-key {
  stroke: var(--circle-pad-accent);
  stroke-width: 1.5;
  vector-effect: non-scaling-stroke;
}
.slice-button:focus-visible .slice-chevron {
  stroke: var(--circle-pad-text-5) !important;
}
.slice-button:focus-visible .slice-zoom {
  fill: var(--circle-pad-text-5) !important;
}
.slice-button .circle-pad-key.is-pressed,
.slice-button .circle-pad-key:active { fill: var(--circle-pad-dark-primary) }

@media (hover: hover) {
  .${CIRCLE_PAD_CLASS}:not([data-input-mode="touch"]) .slice-button:not(.is-disabled) path.circle-pad-key:hover {
    fill: var(--circle-pad-primary);  }
}

/* The SVG root stays outline-free; each action renders its own shaped focus state. */
.${CIRCLE_PAD_CLASS} svg:focus, .${CIRCLE_PAD_CLASS} svg:active {
  outline: none;
} 

/*==================USED BELOW===================*/
/* --- Chevron State Handling --- */
.${CIRCLE_PAD_CLASS}:not([data-input-mode="touch"]) .slice-button .slice-chevron{
  stroke: var(--circle-pad-text-1) !important;
}
.${CIRCLE_PAD_CLASS}:not([data-input-mode="touch"]) .slice-button .slice-zoom{
  fill: var(--circle-pad-text-1) !important;
}
.${CIRCLE_PAD_CLASS}:not([data-input-mode="touch"]) .slice-button.is-disabled .slice-chevron {
  stroke: var(--circle-pad-text-4) !important;
}
.${CIRCLE_PAD_CLASS}:not([data-input-mode="touch"]) .slice-button.is-disabled .slice-zoom {
  fill: var(--circle-pad-text-4) !important;
}

/* Keep chevrons bright while a slice is actively pressed. */
.${CIRCLE_PAD_CLASS}:not([data-input-mode="touch"]) .slice-button.is-pressed .slice-chevron {
  stroke: var(--circle-pad-text-5) !important;
}
.${CIRCLE_PAD_CLASS}:not([data-input-mode="touch"]) .slice-button.is-pressed .slice-zoom {
  fill: var(--circle-pad-text-5) !important;
}

@media (hover: hover) {
  .${CIRCLE_PAD_CLASS}:not([data-input-mode="touch"]) .slice-button:not(.is-disabled):hover .slice-chevron {
    stroke: var(--circle-pad-text-5) !important;
  }
  .${CIRCLE_PAD_CLASS}:not([data-input-mode="touch"]) .slice-button:not(.is-disabled):hover .slice-zoom {
    fill: var(--circle-pad-text-5) !important;
  }

  .${CIRCLE_PAD_CLASS}:not([data-input-mode="touch"]) .slice-button:not(.is-disabled):not(:hover):not(.is-pressed) .slice-chevron {
    stroke: var(--circle-pad-text-1) !important;
  }
  .${CIRCLE_PAD_CLASS}:not([data-input-mode="touch"]) .slice-button:not(.is-disabled):not(:hover):not(.is-pressed) .slice-zoom {
    fill: var(--circle-pad-text-1) !important;
  }
}

.${CIRCLE_PAD_CLASS}[data-input-mode="touch"] .slice-button .slice-chevron {
  stroke: var(--circle-pad-text-1) !important;
}
.${CIRCLE_PAD_CLASS}[data-input-mode="touch"] .slice-button .slice-zoom {
  fill: var(--circle-pad-text-1) !important;
}
.${CIRCLE_PAD_CLASS}[data-input-mode="touch"] .slice-button.is-disabled .slice-chevron {
  stroke: var(--circle-pad-text-4) !important;
}
.${CIRCLE_PAD_CLASS}[data-input-mode="touch"] .slice-button.is-disabled .slice-zoom {
  fill: var(--circle-pad-text-4) !important;
}

/* Touch-mode override: ignore sticky pseudo-classes and drive visual state via .is-pressed only. */
.${CIRCLE_PAD_CLASS}[data-input-mode="touch"] .slice-button {
  fill: var(--primary-background-color) !important;
}

.${CIRCLE_PAD_CLASS}[data-input-mode="touch"] .slice-button.is-pressed {
  fill: var(--circle-pad-dark-primary) !important;
}

.${CIRCLE_PAD_CLASS}[data-input-mode="touch"] .slice-button.is-pressed .slice-chevron {
  stroke: var(--circle-pad-text-4) !important;
}
.${CIRCLE_PAD_CLASS}[data-input-mode="touch"] .slice-button.is-pressed .slice-zoom {
  fill: var(--circle-pad-text-4) !important;
}
/*==================USED ABOVE===================*/

`;

const CIRCLE_PAD_SVG = `
  <div class="${CIRCLE_PAD_CLASS}__wrapper">
<svg version="1.1" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
 <defs>
  <filter id="circle-pad-outside-shadow" x="-30%" y="-30%" width="160%" height="160%">
    <feDropShadow dx="0.2" dy="0.2" stdDeviation="2" flood-color="#333333" flood-opacity="0.25"></feDropShadow>
  </filter>

  <filter id="circle-pad-clean-edges" x="-.013333" y="-.02717" width="1.0267" height="1.0543" style="color-interpolation-filters:sRGB">
   <feGaussianBlur result="blur" stdDeviation="0.15"/>
   <feComposite in="SourceGraphic" in2="blur" operator="in" result="composite1"/>
   <feComposite in="composite1" in2="composite1" k2="1" operator="in" result="composite2"/>
  </filter>

 </defs>
 
 <circle id="circle-pad-outline" class="circle-pad-outline" cx="50" cy="50" r="48" stroke-linecap="round" />
 
 <g id="button-right" class="slice-button" transform="translate(-46.941,-16.885)" aria-label="Right" role="button" tabindex="0" ${CIRCLE_PAD_DATA_ACTION}="right">
  <path id="circle-pad-button-right" class="circle-pad-key" d="m130.7 33.651a47 47 0 0 1 0 66.468l-33.234-33.234z" fill="#fafafa" style="filter:url(#circle-pad-clean-edges)"/>
  <path id="circle-pad-chevron-right" class="slice-chevron" d="m127.96 64.64 2.0805 2.5402-2.0805 2.5402" fill="none" stroke-linejoin="round" stroke-width="1" style="pointer-events: none;" />
 </g>
 
 <g id="button-down" class="slice-button" transform="translate(-46.941,-16.885)" aria-label="Down"  role="button" tabindex="0" ${CIRCLE_PAD_DATA_ACTION}="down">
  <path id="circle-pad-button-down" class="circle-pad-key" d="m130.17 100.65a47 47 0 0 1-33.234 13.766 47 47 0 0 1-33.234-13.766l33.234-33.234z" fill="#fafafa" style="filter:url(#circle-pad-clean-edges)" />
  <path id="circle-pad-chevron-down" class="slice-chevron" d="m99.48 97.96-2.5402 2.0805-2.5402-2.0805" fill="none" stroke-linejoin="round" stroke-width="1" style="pointer-events: none;" />
 </g>
 
 <g id="button-up" class="slice-button" transform="translate(-46.941,-16.885)" aria-label="Up"  role="button" tabindex="0" ${CIRCLE_PAD_DATA_ACTION}="up">
  <path id="circle-pad-button-up" class="circle-pad-key" d="m63.707 33.122a47 47 0 0 1 66.468-2e-6l-33.234 33.234z" fill="#fafafa" style="filter:url(#circle-pad-clean-edges)" />
  <path id="circle-pad-chevron-up" class="slice-chevron" d="m94.4 35.8 2.5402-2.0805 2.5402 2.0805" fill="none" stroke-linejoin="round" stroke-width="1" style="pointer-events: none;" />
 </g>
 
 <g id="button-left" class="slice-button" transform="translate(-46.941 -16.855)" aria-label="Left"  role="button" tabindex="0" ${CIRCLE_PAD_DATA_ACTION}="left">
  <path id="circle-pad-button-left" class="circle-pad-key" d="m63.177 100.12a47 47 0 0 1-13.766-33.234 47 47 0 0 1 13.766-33.234l33.234 33.234z" fill="#fafafa" style="filter:url(#circle-pad-clean-edges)" />
  <path id="circle-pad-chevron-left" class="slice-chevron" d="m65.92 69.42-2.0805-2.5402 2.0805-2.5402" fill="none" stroke-linejoin="round" stroke-width="1" style="pointer-events: none;" />
 </g>
 
 <circle id="circle-pad-middle-circle" class="circle-pad-middle-circle" cx="50" cy="50" r="14"/>
 
 <g id="button-zoom-out" class="slice-button" aria-label="Zoom Out" role="button" tabindex="0" ${CIRCLE_PAD_DATA_ACTION}="zoom-out">
  <path id="circle-pad-zoom-out" class="circle-pad-key" d="m63.5 50.25a13.5 13.25 0 0 1-6.75 11.475 13.5 13.25 0 0 1-13.5-1e-6 13.5 13.25 0 0 1-6.75-11.475h13.5z" style="filter:url(#circle-pad-clean-edges);"/>
  <path id="circle-pad-zoom-out-icon" class="slice-zoom" d="m53 57.304h-6v-0.85714h6z" style="pointer-events: none;" />
 </g>
 <g id="button-zoom-in" class="slice-button" aria-label="Zoom In" role="button" tabindex="0" ${CIRCLE_PAD_DATA_ACTION}="zoom-in">
  <path id="circle-pad-zoom-in" class="circle-pad-key" d="m36.5 49.75a13.5 13.25 0 0 1 13.5-13.25 13.5 13.25 0 0 1 13.5 13.25h-13.5z" style="filter:url(#circle-pad-clean-edges);"/>
  <path id="circle-pad-zoom-in-icon" class="slice-zoom" d="m53 43.554h-2.5714v2.5714h-0.85714v-2.5714h-2.5714v-0.85714h2.5714v-2.5714h0.85714v2.5714h2.5714z" style="pointer-events: none;" />
 </g>
</svg>

  </div>
`;

class CirclePadControl extends HTMLElement {
  static get observedAttributes() {
    return [DISABLED_ACTIONS_ATTR];
  }

  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this._pressed = new Set();
    this._pressedByPointer = new Map();
    this._mounted = false;
    this._wired = false;
    this._resetRootHandlers();
  }

  connectedCallback() {
    this._mount();
    this._wireControlEvents();
  }

  disconnectedCallback() {
    this._pressed.clear();
    this._unbindRootEvents();
    this._wired = false;
    this._resetRootHandlers();
  }

  attributeChangedCallback(name, _oldValue, _newValue) {
    if (name !== DISABLED_ACTIONS_ATTR) return;
    this._applyDisabledActions();
  }

  _mount() {
    if (this._mounted) return;
    this._mounted = true;

    const style = document.createElement("style");
    style.textContent = CIRCLE_PAD_STYLES;

    const root = document.createElement("div");
    root.className = CIRCLE_PAD_CLASS;
    root.innerHTML = CIRCLE_PAD_SVG;
    this._rootEl = root;

    this.shadowRoot.appendChild(style);
    this.shadowRoot.appendChild(root);
    this._applyDisabledActions();
  }

  _getDisabledActions() {
    return new Set(
      String(this.getAttribute(DISABLED_ACTIONS_ATTR) || "")
        .split(/[\s,]+/)
        .map((action) => action.trim())
        .filter(Boolean),
    );
  }

  _isActionDisabled(action) {
    return this._getDisabledActions().has(action);
  }

  _applyDisabledActions() {
    if (!this.shadowRoot) return;
    const disabledActions = this._getDisabledActions();
    for (const button of this.shadowRoot.querySelectorAll(ACTION_SELECTOR)) {
      const action = this._getButtonAction(button);
      const disabled = !!action && disabledActions.has(action);
      button.classList.toggle("is-disabled", disabled);
      button.setAttribute("aria-disabled", String(disabled));
      button.setAttribute("tabindex", disabled ? "-1" : "0");
      if (disabled) {
        button.classList.remove("is-pressed");
      }
    }
  }

  _setInputMode(mode) {
    if (!this._rootEl) return;
    this._rootEl.setAttribute("data-input-mode", mode);
  }

  _trySetPointerCapture(btn, pointerId) {
    if (!btn || typeof btn.setPointerCapture !== "function") return;
    if (!this._hasPointerId(pointerId)) return;
    try {
      btn.setPointerCapture(pointerId);
    } catch (_e) {
      /* ignore */
    }
  }

  _hasPointerId(pointerId) {
    return pointerId !== null && pointerId !== undefined;
  }

  _resetRootHandlers() {
    this._onPointerDown = null;
    this._onPointerUp = null;
    this._onPointerCancel = null;
    this._onPointerLeave = null;
    this._onKeyDown = null;
    this._onKeyUp = null;
    this._onFocusOut = null;
  }

  _bindRootEvents() {
    if (!this.shadowRoot) return;
    for (const [eventName, handlerKey] of ROOT_EVENT_BINDINGS) {
      const handler = this[handlerKey];
      if (handler) {
        this.shadowRoot.addEventListener(eventName, handler);
      }
    }
  }

  _unbindRootEvents() {
    if (!this.shadowRoot) return;
    for (const [eventName, handlerKey] of ROOT_EVENT_BINDINGS) {
      const handler = this[handlerKey];
      if (handler) {
        this.shadowRoot.removeEventListener(eventName, handler);
      }
    }
  }

  _findActionButton(target) {
    if (!(target instanceof Element)) return null;
    return target.closest(ACTION_SELECTOR);
  }

  _getButtonAction(btn) {
    return btn ? btn.getAttribute(CIRCLE_PAD_DATA_ACTION) : null;
  }

  _clearDirectionPressed(btn) {
    if (!btn) return;
    const action = this._getButtonAction(btn);
    if (!action || !this._pressed.has(action)) return;
    this._pressed.delete(action);
    btn.classList.remove("is-pressed");
  }

  _releaseDirectionByPointer(ev) {
    if (!ev || ev.pointerId === null || ev.pointerId === undefined) {
      return false;
    }
    const state = this._pressedByPointer.get(ev.pointerId);
    if (!state) return false;
    this._pressedByPointer.delete(ev.pointerId);
    this._clearDirectionPressed(state.btn);
    this._dispatch(EVT_RELEASE, { action: state.action });
    return true;
  }

  _setInputModeFromPointer(ev) {
    this._setInputMode(
      ev.pointerType === INPUT_MODE_TOUCH ? INPUT_MODE_TOUCH : INPUT_MODE_MOUSE,
    );
  }

  _handleDirectionPointerDown(btn, action, pointerId) {
    if (!DIRECTION_ACTIONS.has(action)) return;
    if (this._isActionDisabled(action)) return;
    if (this._pressed.has(action)) return;

    this._pressed.add(action);
    if (this._hasPointerId(pointerId)) {
      this._pressedByPointer.set(pointerId, { action, btn });
    }
    btn.classList.add("is-pressed");
    this._dispatch(EVT_PRESS, { action });
    this._trySetPointerCapture(btn, pointerId);
  }

  _handlePointerEnd(ev, ignoreRelatedTarget = false) {
    if (this._releaseDirectionByPointer(ev)) return;

    const btn = this._findActionButton(ev.target);
    if (!btn) return;
    if (
      ignoreRelatedTarget &&
      ev.relatedTarget &&
      btn.contains(ev.relatedTarget)
    ) {
      return;
    }

    const action = this._getButtonAction(btn);
    if (this._isActionDisabled(action)) return;

    if (!DIRECTION_ACTIONS.has(action) || !this._pressed.has(action)) return;
    this._clearDirectionPressed(btn);
    this._dispatch(EVT_RELEASE, { action });
  }

  _handlePointerRelease(ev) {
    this._handlePointerEnd(ev, false);
  }

  _handlePointerLeave(ev) {
    this._handlePointerEnd(ev, true);
  }

  _handleKeyboardRelease(btn) {
    const action = this._getButtonAction(btn);
    if (!action || !this._pressed.has(action)) return;
    this._clearDirectionPressed(btn);
    this._dispatch(EVT_RELEASE, { action });
  }

  _wireControlEvents() {
    if (this._wired || !this.shadowRoot) return;
    this._wired = true;

    this._onPointerDown = (ev) => {
      const btn = this._findActionButton(ev.target);
      if (!btn) return;

      this._setInputModeFromPointer(ev);

      const action = this._getButtonAction(btn);
      if (this._isActionDisabled(action)) return;
      this._handleDirectionPointerDown(btn, action, ev.pointerId);
    };

    this._onPointerUp = (ev) => this._handlePointerRelease(ev);
    this._onPointerCancel = (ev) => this._handlePointerRelease(ev);
    this._onPointerLeave = (ev) => this._handlePointerLeave(ev);
    this._onKeyDown = (ev) => {
      if (!KEYBOARD_ACTIVATION_KEYS.has(ev.key) || ev.repeat) return;
      const btn = this._findActionButton(ev.target);
      if (!btn) return;
      const action = this._getButtonAction(btn);
      if (this._isActionDisabled(action)) return;
      ev.preventDefault();
      this._setInputMode(INPUT_MODE_KEYBOARD);
      this._handleDirectionPointerDown(btn, action, null);
    };
    this._onKeyUp = (ev) => {
      if (!KEYBOARD_ACTIVATION_KEYS.has(ev.key)) return;
      const btn = this._findActionButton(ev.target);
      if (!btn) return;
      ev.preventDefault();
      this._handleKeyboardRelease(btn);
    };
    this._onFocusOut = (ev) => {
      const btn = this._findActionButton(ev.target);
      if (btn) this._handleKeyboardRelease(btn);
    };

    this._bindRootEvents();
  }

  _dispatch(type, detail) {
    this.dispatchEvent(
      new CustomEvent(type, {
        detail: { ...detail, originalEvent: undefined },
        bubbles: true,
        composed: true,
      }),
    );
  }
}

if (
  typeof customElements !== "undefined" &&
  !customElements.get("circle-pad-control-2")
) {
  customElements.define("circle-pad-control-2", CirclePadControl);
}

export {
  CirclePadControl,
  CIRCLE_PAD_ACTIONS,
  EVT_PRESS,
  EVT_RELEASE,
};
