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
 *      Actions: up, up-right, right, down-right, down,
 *               down-left, left, up-left
 *    - Center mic is a toggle:
 *        "circle-pad-toggle"  detail: { action: "mic", active }
 *
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
 *      pad.addEventListener("circle-pad-toggle", (e) => {
 *        console.log("mic", e.detail.active ? "on" : "off");
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
 *    // pad.addEventListener("circle-pad-toggle", (e) => {
 *    //   this._setMicEnabled(e.detail.active);
 *    // });
 *
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
 *      const angle = Math.atan2(y, x) * (180 / Math.PI);
 *      if (angle >= -22.5 && angle < 22.5) return "right";
 *      if (angle >= 22.5 && angle < 67.5) return "down-right";
 *      if (angle >= 67.5 && angle < 112.5) return "down";
 *      if (angle >= 112.5 && angle < 157.5) return "down-left";
 *      if (angle >= 157.5 || angle < -157.5) return "left";
 *      if (angle >= -157.5 && angle < -112.5) return "up-left";
 *      if (angle >= -112.5 && angle < -67.5) return "up";
 *      return "up-right";
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
 *
 *        // Example: first button toggles mic.
 *        if (gp.buttons[0]?.pressed) {
 *          emitPad("circle-pad-toggle", { action: "mic", active: true });
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
  UP_RIGHT: "up-right",
  RIGHT: "right",
  DOWN_RIGHT: "down-right",
  DOWN: "down",
  DOWN_LEFT: "down-left",
  LEFT: "left",
  UP_LEFT: "up-left",
  MIC: "mic",
});

const DIRECTION_ACTIONS = Object.freeze(
  new Set([
    CIRCLE_PAD_ACTIONS.UP,
    CIRCLE_PAD_ACTIONS.UP_RIGHT,
    CIRCLE_PAD_ACTIONS.RIGHT,
    CIRCLE_PAD_ACTIONS.DOWN_RIGHT,
    CIRCLE_PAD_ACTIONS.DOWN,
    CIRCLE_PAD_ACTIONS.DOWN_LEFT,
    CIRCLE_PAD_ACTIONS.LEFT,
    CIRCLE_PAD_ACTIONS.UP_LEFT,
  ]),
);

const EVT_PRESS = "circle-pad-press";
const EVT_RELEASE = "circle-pad-release";
const EVT_TOGGLE = "circle-pad-toggle";
const INPUT_MODE_TOUCH = "touch";
const INPUT_MODE_MOUSE = "mouse";
const ACTION_SELECTOR = "[" + CIRCLE_PAD_DATA_ACTION + "]";
const CENTER_BUTTON_SELECTOR = ".center-button";

const ROOT_EVENT_BINDINGS = Object.freeze([
  ["pointerdown", "_onPointerDown"],
  ["pointerup", "_onPointerUp"],
  ["pointercancel", "_onPointerCancel"],
  ["pointerleave", "_onPointerLeave"],
  ["click", "_onClick"],
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

  .${CIRCLE_PAD_CLASS}__wrapper::before {
    content: "";
    position: absolute;
    width: 99.6%;
    height: 99.6%;
    border-radius: 50%;
    box-shadow:
      0 14px 28px rgba(0, 0, 0, 0.06),
      0 4px 10px rgba(0, 0, 0, 0.04);
    z-index: 0;
    pointer-events: none;
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
.circle-pad-outline {fill:var(--circle-pad-text-3);}
.circle-pad-middle-circle {fill:var(--circle-pad-text-3);filter:url(#circle-pad-center-shadow);shape-rendering: geometricPrecision;}
.circle-pad-middle-circle circle {
  shape-rendering: geometricPrecision;

/*==================USED ABOVE============================*/
.wheel-button {
  cursor: pointer;
  outline: none;
}
.wheel-button path,
.wheel-button circle {
  transition: fill 0.2s ease, stroke 0.2s ease, filter 0.2s ease;
}
.slice-button path { fill: var(--primary-background-color) }
.slice-button.is-pressed path,
.slice-button:active path { fill: var(--circle-pad-dark-primary) }

@media (hover: hover) {
  .${CIRCLE_PAD_CLASS}:not([data-input-mode="touch"]) .slice-button:hover path {
    fill: var(--primary-background-color);
  }
}

/* Center Hub Base + Hover */
.center-button #path9 { fill: #bababa; }
.center-button #circle9 { fill: url(#dome-gradient);   }
.center-button:hover #path9 { fill: var(--circle-pad-success); }
.center-button:active #path9 { fill: var(--circle-pad-success); }

@media (hover: hover) {
  .${CIRCLE_PAD_CLASS}:not([data-input-mode="touch"]) .center-button:hover #circle9 {
    filter: url(#button-shadow-hover);
  }
}

/* Persistent mic-on visuals driven by component state */
.center-button.is-active #circle9 {
  fill: url(#dome-gradient-green);
}

.center-button.is-active #path9 {
  fill: var(--circle-pad-success);
}

.center-button.is-active .mic-icon path {
  fill: var(--circle-pad-text-1) !important;
}

.center-button.is-active {
  filter: url(#green-glow-matrix);
}

.main-circle {filter: url(#outside-shadow);}
.main-circle circle {
  shape-rendering: geometricPrecision;
}

/* Green Dome Focus State (Keyboard Navigation) */
.center-button:focus-visible #circle9 {
  outline: none; /* Clears default browser ring if you are using your own filters */
}

/* Green Dome Active State (Pressed Click) */
.center-button:active #circle9 { 
  filter: brightness(0.92) url(#button-shadow-hover); /* Pressed visual without forcing active green state */
}

/* Standalone shadow layer applied exclusively over the center button structure in base state */
.center-button {
  box-shadow: 
    0px 4px 8px rgba(0, 0, 0, 0.12),          /* Your original outer drop shadow */
    inset 0px 2px 4px rgba(0, 0, 0, 0.15);    /* New subtle inset shadow */
}

/* The inner shadow overlay styling */
.inner-shadow-overlay {
  fill: none;
  stroke: var(--circle-pad-text-1);
  stroke-width: 2;          /* Thickness of the shadow */
  opacity: 0.15;            /* Softness/transparency of the shadow */
  filter: url(#simple-blur); /* Applies the blur effect */
}

/* Keyboard Accessibility Focus Rings - Set to none to prevent extra lines when active */
.wheel-button:focus path,
.wheel-button:focus circle {
  stroke: none; 
}

/*==================USED BELOW===================*/
/* --- Fixed Chevron State Handling --- */
.slice-chevron {
  stroke: var(--circle-pad-text-1);
  transition: stroke 0.15s ease;
}

/* Keep chevrons bright while a slice is actively pressed. */
.slice-button.is-pressed .slice-chevron {
  stroke: var(--circle-pad-text-5) !important;
}

@media (hover: hover) {
  .${CIRCLE_PAD_CLASS}:not([data-input-mode="touch"]) .slice-button:hover .slice-chevron {
    stroke: var(--circle-pad-text-5) !important;
  }

  .${CIRCLE_PAD_CLASS}:not([data-input-mode="touch"]) .slice-button:not(:hover):not(.is-pressed) .slice-chevron {
    stroke: var(--circle-pad-text-1) !important;
  }
}

.${CIRCLE_PAD_CLASS}[data-input-mode="touch"] .slice-button .slice-chevron {
  stroke: var(--circle-pad-text-1) !important;
}

/* Touch-mode override: ignore sticky pseudo-classes and drive visual state via .is-pressed only. */
.${CIRCLE_PAD_CLASS}[data-input-mode="touch"] .slice-button path {
  fill: var(--primary-background-color) !important;
}

.${CIRCLE_PAD_CLASS}[data-input-mode="touch"] .slice-button.is-pressed path {
  fill: var(--circle-pad-dark-primary) !important;
}

.${CIRCLE_PAD_CLASS}[data-input-mode="touch"] .slice-button.is-pressed .slice-chevron {
  stroke: #ffffff !important;
}
/*==================USED ABOVE===================*/
/* Touch-mode override: prevent center hover/focus visuals from sticking between taps. */

`;

const CIRCLE_PAD_SVG = `
  <div class="${CIRCLE_PAD_CLASS}__wrapper">
<svg version="1.1" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
 <defs>
  <filter id="simple-blur">
    <feGaussianBlur stdDeviation="1.8"></feGaussianBlur>
  </filter>
      
  <filter id="circle-pad-outside-shadow" x="-30%" y="-30%" width="160%" height="160%">
    <feDropShadow dx="0.2" dy="0.2" stdDeviation="2" flood-color="#333333" flood-opacity="0.25"></feDropShadow>
  </filter>
  <filter id="circle-pad-clean-edges" x="-.013333" y="-.02717" width="1.0267" height="1.0543" style="color-interpolation-filters:sRGB">
   <feGaussianBlur result="blur" stdDeviation="0.15"/>
   <feComposite in="SourceGraphic" in2="blur" operator="in" result="composite1"/>
   <feComposite in="composite1" in2="composite1" k2="1" operator="in" result="composite2"/>
  </filter>
 </defs>
 
 <circle id="circle-pad-outline" class="circle-pad-outline" cx="50" cy="50" r="48" stroke-linecap="round" stroke-width=".12484"/>
 
 <g class="wheel-button slice-button" transform="translate(-46.941,-16.885)" stroke-linecap="round" style="filter:url(#circle-pad-clean-edges)" aria-label="Right" role="button" tabindex="0" ${CIRCLE_PAD_DATA_ACTION}="right">
  <path id="circle-pad-button-right" class="circle-pad-key" d="m130.7 33.651a47 47 0 0 1 0 66.468l-33.234-33.234z" fill="#fafafa" stroke-width=".12484" style="font-variation-settings:'opsz' 20, 'wght' 400;paint-order:stroke fill markers"/>
  <path id="circle-pad-chevron-right" class="slice-chevron" d="m127.96 64.64 2.0805 2.5402-2.0805 2.5402" fill="none" stroke-linejoin="round" stroke-width=".91954" style="fill:none;stroke-width:1;stroke:#000"/>
 </g>
 
 <g id="button-down" class="wheel-button slice-button" transform="translate(-46.941,-16.885)" stroke-linecap="round" style="filter:url(#circle-pad-clean-edges)" aria-label="Down" role="button" tabindex="0" ${CIRCLE_PAD_DATA_ACTION}="down">
  <path id="circle-pad-button-down" class="circle-pad-key" d="m130.17 100.65a47 47 0 0 1-33.234 13.766 47 47 0 0 1-33.234-13.766l33.234-33.234z" fill="#fafafa" stroke-width=".12484" style="font-variation-settings:'opsz' 20, 'wght' 400;paint-order:stroke fill markers"/>
  <path id="circle-pad-chevron-down" class="slice-chevron" d="m99.48 97.96-2.5402 2.0805-2.5402-2.0805" fill="none" stroke-linejoin="round" stroke-width=".91954" style="fill-opacity:0;stroke-width:1;stroke:#000"/>
 </g>
 
 <g id="button-up" class="wheel-button slice-button" transform="translate(-46.941,-16.885)" stroke-linecap="round" style="filter:url(#circle-pad-clean-edges)" aria-label="Up" role="button" tabindex="0" ${CIRCLE_PAD_DATA_ACTION}="up">
  <path id="circle-pad-button-up" class="circle-pad-key" d="m63.707 33.122a47 47 0 0 1 66.468-2e-6l-33.234 33.234z" fill="#fafafa" stroke-width=".12484" style="font-variation-settings:'opsz' 20, 'wght' 400;paint-order:stroke fill markers"/>
  <path id="circle-pad-chevron-up" class="slice-chevron" d="m94.4 35.8 2.5402-2.0805 2.5402 2.0805" fill="none" stroke-linejoin="round" stroke-width=".91955" style="fill-opacity:0;stroke-width:1;stroke:#000"/>
 </g>
 
 <g id="button-left" class="wheel-button slice-button" transform="translate(-46.941 -16.855)" stroke-linecap="round" style="filter:url(#circle-pad-clean-edges)" aria-label="Left" role="button" tabindex="0" ${CIRCLE_PAD_DATA_ACTION}="left">
  <path id="circle-pad-button-left" class="circle-pad-key" d="m63.177 100.12a47 47 0 0 1-13.766-33.234 47 47 0 0 1 13.766-33.234l33.234 33.234z" fill="#fafafa" stroke-width=".12484" style="font-variation-settings:'opsz' 20, 'wght' 400;paint-order:stroke fill markers"/>
  <path id="circle-pad-chevron-left" class="slice-chevron" d="m65.92 69.42-2.0805-2.5402 2.0805-2.5402" fill="none" stroke-linejoin="round" stroke-width=".91955" style="fill-opacity:0;stroke-width:1;stroke:#000"/>
 </g>
 
 <circle id="circle-pad-middle-circle" class="circle-pad-middle-circle" cx="50" cy="50" r="14"/>
 
 <g id="button-zoom-out">
  <path id="circle-pad-zoom-out-svg" d="m63.5 50.25a13.5 13.25 0 0 1-6.75 11.475 13.5 13.25 0 0 1-13.5-1e-6 13.5 13.25 0 0 1-6.75-11.475h13.5z" style="fill:#fff;filter:url(#circle-pad-clean-edges);paint-order:stroke fill markers;stroke-width:0"/>
  <path id="circle-pad-zoom-out" d="m53 57.304h-6v-0.85714h6z" style="stroke-width:.42857"/>
 </g>
 <g id="button-zoom-in">
  <path id="circle-pad-zoom-in-svg" d="m36.5 49.75a13.5 13.25 0 0 1 13.5-13.25 13.5 13.25 0 0 1 13.5 13.25h-13.5z" style="fill:#fff;filter:url(#circle-pad-clean-edges);paint-order:stroke fill markers;stroke-width:0"/>
  <path id="circle-pad-zoom-in" d="m53 43.554h-2.5714v2.5714h-0.85714v-2.5714h-2.5714v-0.85714h2.5714v-2.5714h0.85714v2.5714h2.5714z" style="stroke-width:.42857"/>
 </g>
</svg>

  </div>
`;

class CirclePadControl extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this._pressed = new Set();
    this._pressedByPointer = new Map();
    this._activeMic = false;
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

  setActive(action, active) {
    if (action !== CIRCLE_PAD_ACTIONS.MIC) return;
    this._activeMic = Boolean(active);
    this._applyMicState();
  }

  getState() {
    return { mic: this._activeMic };
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
    this._applyMicState();
  }

  _applyMicState() {
    if (!this.shadowRoot) return;
    const mic = this.shadowRoot.querySelector(CENTER_BUTTON_SELECTOR);
    if (!mic) return;
    mic.classList.toggle("is-active", this._activeMic);
    mic.setAttribute("aria-pressed", String(this._activeMic));
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
    this._onClick = null;
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

  _isMicAction(action) {
    return action === CIRCLE_PAD_ACTIONS.MIC;
  }

  _setMicPressed(btn, pressed) {
    if (!btn) return;
    btn.classList.toggle("is-pressed", Boolean(pressed));
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
    if (this._pressed.has(action)) return;

    this._pressed.add(action);
    if (this._hasPointerId(pointerId)) {
      this._pressedByPointer.set(pointerId, { action, btn });
    }
    btn.classList.add("is-pressed");
    this._dispatch(EVT_PRESS, { action });
    this._trySetPointerCapture(btn, pointerId);
  }

  _handleMicToggleClick(btn) {
    this._activeMic = !this._activeMic;
    this._applyMicState();
    this._setMicPressed(btn, false);
    this._dispatch(EVT_TOGGLE, {
      action: CIRCLE_PAD_ACTIONS.MIC,
      active: this._activeMic,
    });

    const activeEl = this.shadowRoot && this.shadowRoot.activeElement;
    if (
      this._rootEl &&
      this._rootEl.getAttribute("data-input-mode") === INPUT_MODE_TOUCH &&
      activeEl &&
      typeof activeEl.blur === "function"
    ) {
      activeEl.blur();
    }
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
    if (this._isMicAction(action)) {
      this._setMicPressed(btn, false);
      return;
    }

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

  _wireControlEvents() {
    if (this._wired || !this.shadowRoot) return;
    this._wired = true;

    this._onPointerDown = (ev) => {
      const btn = this._findActionButton(ev.target);
      if (!btn) return;

      this._setInputModeFromPointer(ev);

      const action = this._getButtonAction(btn);
      if (this._isMicAction(action)) {
        this._setMicPressed(btn, true);
        this._trySetPointerCapture(btn, ev.pointerId);
        return;
      }

      this._handleDirectionPointerDown(btn, action, ev.pointerId);
    };

    this._onPointerUp = (ev) => this._handlePointerRelease(ev);
    this._onPointerCancel = (ev) => this._handlePointerRelease(ev);
    this._onPointerLeave = (ev) => this._handlePointerLeave(ev);

    this._onClick = (ev) => {
      const btn = this._findActionButton(ev.target);
      if (!btn) return;
      if (!this._isMicAction(this._getButtonAction(btn))) return;
      this._handleMicToggleClick(btn);
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
  EVT_TOGGLE,
};
