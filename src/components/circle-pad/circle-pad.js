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

  .wheel-button {
    cursor: pointer;
    outline: none;
  }

  .wheel-button path,
  .wheel-button circle {
    transition: fill 0.2s ease, stroke 0.2s ease, filter 0.2s ease;
  }

.slice-button path { fill: var(--circle-pad-bg-1) }

.slice-button.is-pressed path,
.slice-button:active path { fill: var(--circle-pad-dark-primary) }

@media (hover: hover) {
  .${CIRCLE_PAD_CLASS}:not([data-input-mode="touch"]) .slice-button:hover path {
    fill: var(--circle-pad-primary);
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
  stroke: #000000;
  stroke-width: 2;          /* Thickness of the shadow */
  opacity: 0.15;            /* Softness/transparency of the shadow */
  filter: url(#simple-blur); /* Applies the blur effect */
}

/* Keyboard Accessibility Focus Rings - Set to none to prevent extra lines when active */
.wheel-button:focus path,
.wheel-button:focus circle {
  stroke: none; 
}

/* --- Fixed Microphone State Handling --- */
.mic-icon path,
.mic-off-icon path {
  fill: var(--circle-pad-text-2); /* Gray base state */
  transition: fill 0.2s ease;
}

.mic-icon {
  display: none;
}

.mic-off-icon {
  display: inline;
}

.center-button.is-active .mic-icon {
  display: inline;
}

.center-button.is-active .mic-off-icon {
  display: none;
}

/* Forces the icon to turn pure black when hovered, focused, or active */
.center-button:focus-visible .mic-icon path,
.center-button:focus-visible .mic-off-icon path,
.center-button:active .mic-icon path,
.center-button:active .mic-off-icon path {
  fill: var(--circle-pad-text-1) !important; 
}

@media (hover: hover) {
  .${CIRCLE_PAD_CLASS}:not([data-input-mode="touch"]) .center-button:hover .mic-icon path,
  .${CIRCLE_PAD_CLASS}:not([data-input-mode="touch"]) .center-button:hover .mic-off-icon path {
    fill: var(--circle-pad-text-1) !important;
  }
}

/* --- Fixed Chevron State Handling --- */
.slice-chevron {
  stroke: #555555;
  transition: stroke 0.15s ease;
}

/* Keep chevrons bright while a slice is actively pressed. */
.slice-button.is-pressed .slice-chevron {
  stroke: #ffffff !important;
}

@media (hover: hover) {
  .${CIRCLE_PAD_CLASS}:not([data-input-mode="touch"]) .slice-button:hover .slice-chevron {
    stroke: #ffffff !important;
  }

  .${CIRCLE_PAD_CLASS}:not([data-input-mode="touch"]) .slice-button:not(:hover):not(.is-pressed) .slice-chevron {
    stroke: #555555 !important;
  }
}

/* Touch-mode override: ignore sticky pseudo-classes and drive visual state via .is-pressed only. */
.${CIRCLE_PAD_CLASS}[data-input-mode="touch"] .slice-button path {
  fill: var(--circle-pad-bg-1) !important;
}

.${CIRCLE_PAD_CLASS}[data-input-mode="touch"] .slice-button .slice-chevron {
  stroke: #555555 !important;
}

.${CIRCLE_PAD_CLASS}[data-input-mode="touch"] .slice-button.is-pressed path {
  fill: var(--circle-pad-dark-primary) !important;
}

.${CIRCLE_PAD_CLASS}[data-input-mode="touch"] .slice-button.is-pressed .slice-chevron {
  stroke: #ffffff !important;
}

/* Touch-mode override: prevent center hover/focus visuals from sticking between taps. */
.${CIRCLE_PAD_CLASS}[data-input-mode="touch"] .center-button:not(.is-active) #circle9 {
  fill: url(#dome-gradient) !important;
  filter: url(#button-shadow) !important;
}

.${CIRCLE_PAD_CLASS}[data-input-mode="touch"] .center-button:not(.is-active):not(.is-pressed) #path9 {
  fill: #bababa !important;
}

.${CIRCLE_PAD_CLASS}[data-input-mode="touch"] .center-button.is-active #path9,
.${CIRCLE_PAD_CLASS}[data-input-mode="touch"] .center-button.is-pressed #path9 {
  fill: var(--circle-pad-success) !important;
}

.${CIRCLE_PAD_CLASS}[data-input-mode="touch"] .center-button.is-active #circle9 {
  fill: url(#dome-gradient-green) !important;
  filter: url(#button-shadow-hover) !important;
}

.${CIRCLE_PAD_CLASS}[data-input-mode="touch"] .center-button:not(.is-active) .mic-icon path {
  fill: var(--circle-pad-text-2) !important;
}

.${CIRCLE_PAD_CLASS}[data-input-mode="touch"] .center-button:not(.is-active) .mic-off-icon path {
  fill: var(--circle-pad-text-2) !important;
}
`;

const CIRCLE_PAD_SVG = `
  <div class="${CIRCLE_PAD_CLASS}__wrapper">
    <svg viewBox="0 0 96 96" version="1.1" aria-label="Circle pad" role="group">
      <defs>
        <filter id="green-glow-matrix" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="1.5" result="blur"></feGaussianBlur>
          <feColorMatrix type="matrix" values="0 0 0 0 0.18
                                             0 0 0 0 0.80
                                             0 0 0 0 0.44
                                             0 0 0 1 0" in="blur" result="green-color"></feColorMatrix>
          <feMorphology radius="0.5" operator="dilate" in="green-color" result="thick-glow"></feMorphology>
          <feGaussianBlur stdDeviation="2.5" in="thick-glow" result="soft-outer-glow"></feGaussianBlur>
          <feMerge>
            <feMergeNode in="soft-outer-glow"></feMergeNode>
            <feMergeNode in="green-color"></feMergeNode>
            <feMergeNode in="SourceGraphic"></feMergeNode>
          </feMerge>
        </filter>

        <radialGradient id="dome-gradient" cx="50%" cy="50%" r="50%" fx="48%" fy="44%">
          <stop offset="0%" stop-color="#ffffff"></stop>
          <stop offset="85%" stop-color="#ffffff"></stop>
          <stop offset="95%" stop-color="#f8f8f8"></stop>
          <stop offset="100%" stop-color="#eeeeee"></stop>
        </radialGradient>

        <radialGradient id="dome-gradient-green" cx="50%" cy="50%" r="50%" fx="48%" fy="44%">
          <stop offset="0%" stop-color="#4ade80"></stop>
          <stop offset="85%" stop-color="#4ade80"></stop>
          <stop offset="95%" stop-color="#42cf76"></stop>
          <stop offset="100%" stop-color="#3bc26d"></stop>
        </radialGradient>

        <filter id="simple-blur">
          <feGaussianBlur stdDeviation="1.8"></feGaussianBlur>
        </filter>

        <clipPath id="circle-clip">
          <circle cx="96.940613" cy="66.8853" r="19.75"></circle>
        </clipPath>

        <filter id="button-shadow" x="-30%" y="-30%" width="160%" height="160%">
          <feDropShadow dx="0.2" dy="0.2" stdDeviation="2" flood-color="#333333" flood-opacity="0.25"></feDropShadow>
        </filter>
        <!--  Outer shadow on the center button -->
         <filter id="button-shadow-hover" x="-30%" y="-30%" width="160%" height="160%">
          <feDropShadow dx="0.2" dy="0.2" stdDeviation="2" flood-color="var(--circle-pad-success)" flood-opacity="0.25"/>
        </filter>  
        <filter id="outside-shadow" x="-30%" y="-30%" width="160%" height="160%">
          <feDropShadow dx="0.2" dy="0.2" stdDeviation="2" flood-color="#333333" flood-opacity="0.25"></feDropShadow>
        </filter>
      </defs>

      <g id="main-circle" class="main-circle" transform="translate(-48.940613,-18.8853)">
        <circle style="fill:#646464;" id="circle2" cx="96.940613" cy="66.8853" r="47.85"></circle>

        <g class="wheel-button slice-button" role="button" tabindex="0" aria-label="Right" ${CIRCLE_PAD_DATA_ACTION}="right">
          <path d="m 139.38408,44.790631 a 47.849998,47.849998 0 0 1 0,44.189339 L 96.940613,66.8853 Z"></path>
          <path class="slice-chevron" d="M 131.0 64.88 L 133.0 66.88 L 131.0 68.88" fill="none" stroke-width="0.8" stroke-linecap="round" stroke-linejoin="round"></path>
        </g>

        <g class="wheel-button slice-button" role="button" tabindex="0" aria-label="Down-right" ${CIRCLE_PAD_DATA_ACTION}="down-right">
          <path d="m 139.38408,88.97997 a 47.849998,47.849998 0 0 1 -20.3488,20.3488 L 96.940613,66.8853 Z"></path>
          <path class="slice-chevron" d="M 116.5 88.5 L 118.5 88.5 L 118.5 86.5" fill="none" stroke-width="0.8" stroke-linecap="round" stroke-linejoin="round"></path>
        </g>

        <g class="wheel-button slice-button" role="button" tabindex="0" aria-label="Down" ${CIRCLE_PAD_DATA_ACTION}="down">
          <path d="m 119.03528,109.32877 a 47.849998,47.849998 0 0 1 -44.189339,0 L 96.940613,66.8853 Z"></path>
          <path class="slice-chevron" d="M 98.94 103.5 L 96.94 105.5 L 94.94 103.5" fill="none" stroke-width="0.8" stroke-linecap="round" stroke-linejoin="round"></path>
        </g>

        <g class="wheel-button slice-button" role="button" tabindex="0" aria-label="Up-right" ${CIRCLE_PAD_DATA_ACTION}="up-right">
          <path d="m 119.03528,24.441832 a 47.849998,47.849998 0 0 1 20.3488,20.348799 L 96.940613,66.8853 Z"></path>
          <path class="slice-chevron" d="M 116.5 45.26 L 118.5 45.26 L 118.5 47.26" fill="none" stroke-width="0.8" stroke-linecap="round" stroke-linejoin="round"></path>
        </g>

        <g class="wheel-button slice-button" role="button" tabindex="0" aria-label="Up" ${CIRCLE_PAD_DATA_ACTION}="up">
          <path d="m 74.845941,24.441833 a 47.849998,47.849998 0 0 1 44.189339,-10e-7 L 96.940613,66.8853 Z"></path>
          <path class="slice-chevron" d="M 94.94 30.26 L 96.94 28.26 L 98.94 30.26" fill="none" stroke-width="0.8" stroke-linecap="round" stroke-linejoin="round"></path>
        </g>

        <g class="wheel-button slice-button" role="button" tabindex="0" aria-label="Up-left" ${CIRCLE_PAD_DATA_ACTION}="up-left">
          <path d="M 54.497146,44.790629 A 47.849998,47.849998 0 0 1 74.845941,24.441833 L 96.940613,66.8853 Z"></path>
          <path class="slice-chevron" d="M 77.38 45.26 L 75.38 45.26 L 75.38 47.26" fill="none" stroke-width="0.8" stroke-linecap="round" stroke-linejoin="round"></path>
        </g>

        <g class="wheel-button slice-button" role="button" tabindex="0" aria-label="Down-left" ${CIRCLE_PAD_DATA_ACTION}="down-left">
          <path d="M 74.845941,109.32877 A 47.849998,47.849998 0 0 1 54.497146,88.979971 L 96.940613,66.8853 Z"></path>
          <path class="slice-chevron" d="M 77.38 88.5 L 75.38 88.5 L 75.38 86.5" fill="none" stroke-width="0.8" stroke-linecap="round" stroke-linejoin="round"></path>
        </g>

        <g class="wheel-button slice-button" role="button" tabindex="0" aria-label="Left" ${CIRCLE_PAD_DATA_ACTION}="left">
          <path d="m 54.497146,88.979971 a 47.849998,47.849998 0 0 1 0,-44.189342 L 96.940613,66.8853 Z"></path>
          <path class="slice-chevron" d="M 62.88 68.88 L 60.88 66.88 L 62.88 64.88" fill="none" stroke-width="0.8" stroke-linecap="round" stroke-linejoin="round"></path>
        </g>
      </g>

      <g id="mic-button" transform="translate(-48.940613,-18.8853)">
        <g class="wheel-button center-button" role="button" tabindex="0" aria-label="Toggle microphone" ${CIRCLE_PAD_DATA_ACTION}="mic">
          <circle id="path9" cx="96.940613" cy="66.8853" r="20"></circle>
          <circle id="circle9" cx="96.940613" cy="66.8853" r="19.75" fill="url(#dome-gradient)" filter="url(#button-shadow)"></circle>
          <g clip-path="url(#circle-clip)">
            <circle class="inner-shadow-overlay" cx="96.940613" cy="68.8853" r="19.75"></circle>
          </g>
          <g class="mic-off-icon" transform="translate(90.440613, 60.3853) scale(0.55)">
            <path d="M19 11h-1.7c0 .74-.16 1.43-.43 2.05l1.23 1.23c.56-.98.9-2.09.9-3.28zm-4.02.17c0-.06.02-.11.02-.17V5c0-1.66-1.34-3-3-3S9 3.34 9 5v.17l5.98 6zM4.27 3L3 4.27l6.01 6.01V11c0 1.66 1.34 3 3 3 .22 0 .44-.03.65-.08l1.41 1.41c-.64.42-1.39.67-2.06.67-2.76 0-5.3-2.1-5.3-5.1H5c0 3.41 2.72 6.23 6 6.72V21h2v-3.28c.91-.13 1.77-.45 2.54-.93L19.73 21 21 19.73 4.27 3z"></path>
          </g>
          <g class="mic-icon" transform="translate(90.440613, 60.3853) scale(0.55)">
            <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.34 1.34 3 3 3zm5.3-3c0 3-2.54 5.1-5.3 5.1S6.7 14 6.7 11H5c0 3.41 2.72 6.23 6 6.72V21h2v-3.28c3.28-.48 6-3.3 6-6.72h-1.7z"></path>
          </g>
        </g>
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
  !customElements.get("circle-pad-control")
) {
  customElements.define("circle-pad-control", CirclePadControl);
}

export {
  CirclePadControl,
  CIRCLE_PAD_ACTIONS,
  EVT_PRESS,
  EVT_RELEASE,
  EVT_TOGGLE,
};
