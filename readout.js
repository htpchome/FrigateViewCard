/**
 * readout.js
 * ---------------------------------------------------------------
 * Reusable scrolling event-log custom element: <dpad-readout>
 *
 * Drop this element into any HTML (or shadow root) and it will
 * render a vertically-scrolling list of action lines with a
 * "clear" button in the corner:
 *
 *   \u250c\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2510
 *   \u2502  [left]                    [Clear]  \u2502
 *   \u2502  [up]                              \u2502
 *   \u2502  [right]                           \u2502
 *   \u2502  [left]                             \u2502
 *   \u2502                                     \u2502
 *   \u2514\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2518
 *
 * Behavior (when subscribed to a <dpad-control>):
 *
 *   - Direction buttons (up/down/left/right):
 *       \u2022 On dpad-press:   append a new line "[<action>]"
 *       \u2022 While held:      keep appending "[<action>]"
 *                              lines on a short interval until
 *                              the user releases
 *       \u2022 On dpad-release: stop appending
 *   - Microphone button: logged on toggle as [mic:on]/[mic:off].
 *   - Clear button:        empties the log.
 *
 * The element is fully self-contained:
 *   - Shadow DOM for style isolation
 *   - Native HA design tokens (auto-themes light/dark/custom)
 *   - No coupling to card.js, controller.js, dpad.js, or any
 *     other module in this project \u2014 copy this file into
 *     another project and use <dpad-readout> as-is.
 * ---------------------------------------------------------------
 */

// ----------------------------------------------------------------
// Class hooks & custom event names
// ----------------------------------------------------------------

const READOUT_CLASS = "dpad-readout";
const READOUT_LOG_CLASS = "dpad-readout__log";
const READOUT_LINE_CLASS = "dpad-readout__line";
const READOUT_CLEAR_CLASS = "dpad-readout__clear";
const READOUT_EMPTY_CLASS = "dpad-readout__empty";

const EVT_LOG = "readout-log";

// Direction actions the readout cares about. The microphone is
// intentionally excluded per the user spec.
const TRACKED_ACTIONS = Object.freeze(
  new Set([
    "up",
    "up-right",
    "right",
    "down-right",
    "down",
    "down-left",
    "left",
    "up-left",
  ]),
);

const PRESS_EVENTS = Object.freeze([
  "dpad-press",
  "dpad-8way-press",
  "circle-pad-press",
]);
const RELEASE_EVENTS = Object.freeze([
  "dpad-release",
  "dpad-8way-release",
  "circle-pad-release",
]);
const TOGGLE_EVENTS = Object.freeze([
  "dpad-toggle",
  "dpad-8way-toggle",
  "circle-pad-toggle",
]);

// Repeater interval (ms) for "keep printing while held".
const REPEAT_INTERVAL_MS = 150;

// Maximum number of log lines kept in memory. Older lines are
// dropped to keep the DOM small and scrolling smooth.
const MAX_LOG_LINES = 500;

// Default labels per action. The default appends "[<action>]"
// which the user explicitly asked for. Override via subscribe().
const DEFAULT_FORMAT = (action) => "[" + action + "]";

// ----------------------------------------------------------------
// Styles \u2014 self-contained, uses only HA design tokens for theming
// ----------------------------------------------------------------

const READOUT_STYLES = `
  :host {
    display: block;
  }

  .${READOUT_CLASS} {
    display: flex;
    flex-direction: column;
    border-radius: var(--ha-card-border-radius, 12px);
    background: var(--secondary-background-color, rgba(127, 127, 127, 0.08));
    color: var(--primary-text-color);
    border: 1px solid var(--divider-color, rgba(127, 127, 127, 0.2));
    font-family: var(--ha-font-family, Roboto, 'Helvetica Neue', sans-serif);
    font-size: 0.9rem;
    line-height: 1.4;
    overflow: hidden;
  }

  .${READOUT_CLASS}__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    padding: 6px 10px;
    border-bottom: 1px solid var(--divider-color, rgba(127, 127, 127, 0.18));
    background: var(--secondary-background-color, rgba(127, 127, 127, 0.04));
  }

  .${READOUT_CLASS}__title {
    font-size: 0.75rem;
    font-weight: 500;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: var(--secondary-text-color);
    margin: 0;
  }

  .${READOUT_CLEAR_CLASS} {
    flex: 0 0 auto;
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 4px 8px;
    margin: 0;
    background: transparent;
    color: var(--secondary-text-color);
    border: 1px solid var(--divider-color, rgba(127, 127, 127, 0.2));
    border-radius: var(--ha-card-border-radius, 8px);
    font: inherit;
    font-size: 0.75rem;
    cursor: pointer;
    transition: color 120ms ease, background-color 120ms ease, border-color 120ms ease;
  }

  /* Hover effect is scoped to devices with a real pointing
     device (mouse, trackpad, stylus). On touch screens the
     hover state would otherwise stick after a tap because the
     finger remains over the button at the last tap location
     until the user touches elsewhere. The focus-visible state
     is left unscoped so keyboard users still get a visible
     focus ring. */
  @media (hover: hover) {
    .${READOUT_CLEAR_CLASS}:hover {
      color: var(--primary-text-color);
      background: var(--divider-color, rgba(127, 127, 127, 0.12));
      border-color: var(--divider-color, rgba(127, 127, 127, 0.35));
    }
  }
  .${READOUT_CLEAR_CLASS}:focus-visible {
    color: var(--primary-text-color);
    background: var(--divider-color, rgba(127, 127, 127, 0.12));
    border-color: var(--divider-color, rgba(127, 127, 127, 0.35));
    outline: none;
  }

  .${READOUT_CLEAR_CLASS} ha-icon {
    --mdc-icon-size: 14px;
  }

  .${READOUT_LOG_CLASS} {
    flex: 1 1 auto;
    overflow-y: auto;
    overflow-x: hidden;
    padding: 8px 10px;
    margin: 0;
    /* Give the scrollable region a sensible default height even
       if the host has no explicit height. */
    min-height: 96px;
    max-height: 200px;
    font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
    font-size: 0.85rem;
    line-height: 1.5;
  }

  .${READOUT_LINE_CLASS} {
    display: block;
    padding: 1px 0;
    color: var(--primary-text-color);
    word-break: break-all;
  }

  .${READOUT_LINE_CLASS}--pressed {
    color: var(--primary-color, #03a9f4);
    font-weight: 600;
  }

  .${READOUT_EMPTY_CLASS} {
    color: var(--secondary-text-color);
    font-style: italic;
    font-family: var(--ha-font-family, Roboto, 'Helvetica Neue', sans-serif);
  }
`;

// ----------------------------------------------------------------
// The custom element
// ----------------------------------------------------------------

/**
 * <dpad-readout> \u2014 a self-contained scrolling event-log pill.
 *
 * Public API:
 *   - append(text)            add a line to the log
 *   - clear()                 empty the log
 *   - getLog()                return a copy of the current log
 *   - subscribe(dpadEl, [opts])  auto-update from a <dpad-control>
 *   - addEventListener('readout-log', fn)  fires on every append
 *
 * The microphone button is logged on toggle with explicit state.
 */
class DpadReadout extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    /** @type {string[]} newest line last */
    this._log = [];
    /** @type {Map<string, number>} action -> interval id */
    this._repeaters = new Map();
    this._unsubscribers = [];
    this._format = DEFAULT_FORMAT;
    // Guard against re-mounting the shadow content if the element
    // is moved or recycled in the DOM (e.g. when Home Assistant's
    // card editor re-parents the live card during dialog open/
    // close). Without this, each connectedCallback appends another
    // <style> + readout frame to the shadow root, which stacks
    // the activity log on top of itself.
    this._mounted = false;
  }

  // ---- lifecycle ----

  connectedCallback() {
    this._mount();
    this._render();
  }

  disconnectedCallback() {
    // Clean up any active event subscriptions and repeat timers.
    this._unsubscribers.forEach((off) => {
      try {
        off();
      } catch (_e) {
        /* ignore */
      }
    });
    this._unsubscribers = [];
    this._stopAllRepeaters();
    // Do NOT reset _mounted here. The element is still the same
    // instance; on re-connection we want _mount to be a no-op.
    // If the element is genuinely destroyed (GC), the flag goes
    // with it. If HA ever does a true element replace, the new
    // element gets a fresh _mounted=false in its constructor.
  }

  // ---- public API ----

  /**
   * Append a line to the log. Trims old lines past MAX_LOG_LINES.
   * Fires `readout-log` with `{ lines }` (full log copy) so
   * consumers can mirror the state elsewhere.
   *
   * @param {string} text
   */
  append(text) {
    const line = text == null ? "" : String(text);
    if (!line) return;
    this._log.push(line);
    if (this._log.length > MAX_LOG_LINES) {
      // Drop from the front so newest is always at the bottom.
      this._log.splice(0, this._log.length - MAX_LOG_LINES);
    }
    this._render();
    this._dispatch(EVT_LOG, { lines: this.getLog() });
  }

  /**
   * Empty the log.
   */
  clear() {
    if (this._log.length === 0) return;
    this._log = [];
    this._stopAllRepeaters();
    this._render();
    this._dispatch(EVT_LOG, { lines: this.getLog() });
  }

  /**
   * Return a copy of the current log lines (newest last).
   *
   * @returns {string[]}
   */
  getLog() {
    return this._log.slice();
  }

  /**
   * Convenience: subscribe to a <dpad-control>'s events and
   * append direction-button events to the log automatically.
   *
   *   - On dpad-press {action}:  append "[action]" + start a
   *     short-interval repeater so the log keeps growing while
   *     the user holds the button.
   *   - On dpad-release:          stop the repeater for that action.
   *   - On *-toggle { action:'mic', active }: append
   *     "[mic:on]" or "[mic:off]".
   *
   * @param {HTMLElement} dpadEl   a <dpad-control>, <dpad-8way-control>, or <circle-pad-control> element
   * @param {object} [opts]
   * @param {(action: string) => string} [opts.format]
   *        override the default line formatter. Receives the
   *        action ("up"/"down"/"left"/"right") and returns the
   *        line to append. Default: `(a) => "[" + a + "]"`.
   * @returns {() => void}         unsubscribe function
   */
  subscribe(dpadEl, opts = {}) {
    if (!dpadEl || typeof dpadEl.addEventListener !== "function") {
      // eslint-disable-next-line no-console
      console.warn("[dpad-readout] subscribe() needs a valid element");
      return () => {};
    }

    if (typeof opts.format === "function") this._format = opts.format;

    const onPress = (ev) => {
      const action = ev.detail && ev.detail.action;
      if (!action || !TRACKED_ACTIONS.has(action)) return;
      // Add the first line and start a repeater for as long as
      // the user holds the button.
      this.append(this._format(action));
      this._startRepeater(action);
    };
    const onRelease = (ev) => {
      const action = ev.detail && ev.detail.action;
      if (!action) return;
      this._stopRepeater(action);
    };
    const onToggle = (ev) => {
      const detail = ev.detail || {};
      if (detail.action !== "mic") return;
      this.append(detail.active ? "[mic:on]" : "[mic:off]");
    };

    PRESS_EVENTS.forEach((evt) => dpadEl.addEventListener(evt, onPress));
    RELEASE_EVENTS.forEach((evt) => dpadEl.addEventListener(evt, onRelease));
    TOGGLE_EVENTS.forEach((evt) => dpadEl.addEventListener(evt, onToggle));

    const off = () => {
      PRESS_EVENTS.forEach((evt) => dpadEl.removeEventListener(evt, onPress));
      RELEASE_EVENTS.forEach((evt) =>
        dpadEl.removeEventListener(evt, onRelease),
      );
      TOGGLE_EVENTS.forEach((evt) => dpadEl.removeEventListener(evt, onToggle));
      this._stopAllRepeaters();
    };
    this._unsubscribers.push(off);
    return off;
  }

  // ---- internals ----

  _startRepeater(action) {
    // Don't double-start.
    if (this._repeaters.has(action)) return;
    const id = setInterval(() => {
      // If the action was somehow released between intervals,
      // stop cleanly.
      if (!this._repeaters.has(action)) return;
      this.append(this._format(action));
    }, REPEAT_INTERVAL_MS);
    this._repeaters.set(action, id);
  }

  _stopRepeater(action) {
    const id = this._repeaters.get(action);
    if (id !== undefined) {
      clearInterval(id);
      this._repeaters.delete(action);
    }
  }

  _stopAllRepeaters() {
    this._repeaters.forEach((id) => clearInterval(id));
    this._repeaters.clear();
  }

  _mount() {
    // Idempotent: only build the shadow content once per element
    // instance. connectedCallback can fire multiple times if the
    // element is moved in the DOM (e.g. by Home Assistant's card
    // editor re-parenting the live card during dialog open/close);
    // without this guard, each re-connection would append another
    // <style> + readout frame to the same shadow root, which
    // visually stacks the activity log on top of itself.
    if (this._mounted) return;
    this._mounted = true;

    const style = document.createElement("style");
    style.textContent = READOUT_STYLES;

    const host = document.createElement("div");
    host.className = READOUT_CLASS;
    host.innerHTML =
      '<div class="' +
      READOUT_CLASS +
      '__header">' +
      '<span class="' +
      READOUT_CLASS +
      '__title">Activity</span>' +
      '<button type="button" class="' +
      READOUT_CLEAR_CLASS +
      '" aria-label="Clear log">' +
      '<ha-icon icon="mdi:delete-sweep"></ha-icon>' +
      "<span>Clear</span>" +
      "</button>" +
      "</div>" +
      '<div class="' +
      READOUT_LOG_CLASS +
      '" role="log" aria-live="polite"></div>';

    this.shadowRoot.appendChild(style);
    this.shadowRoot.appendChild(host);

    // Wire the clear button. The button is inside the shadow root,
    // so we bind the listener to the host element (composed
    // events bubble across the shadow boundary).
    const clearBtn = this.shadowRoot.querySelector("." + READOUT_CLEAR_CLASS);
    if (clearBtn) {
      clearBtn.addEventListener("click", () => this.clear());
    }
  }

  _render() {
    const logEl =
      this.shadowRoot && this.shadowRoot.querySelector("." + READOUT_LOG_CLASS);
    if (!logEl) return;

    if (this._log.length === 0) {
      logEl.innerHTML =
        '<div class="' +
        READOUT_EMPTY_CLASS +
        '">No activity yet \u2014 push a direction button.</div>';
      return;
    }

    // Re-render as a string. Newest at the bottom. Each line is
    // textContent-safe (no innerHTML) so user-influenced strings
    // (if any) can never inject markup.
    const lines = this._log.map(
      (line) =>
        '<div class="' +
        READOUT_LINE_CLASS +
        '">' +
        escapeHtml(line) +
        "</div>",
    );
    logEl.innerHTML = lines.join("");

    // Auto-scroll to the bottom so the newest line is always
    // visible. (No-op if the user has scrolled up to read older
    // lines, which is fine — they'll see the new line appear at
    // the bottom of the visible area.)
    logEl.scrollTop = logEl.scrollHeight;
  }

  /**
   * Dispatch a CustomEvent on the host with composed:true so it
   * crosses the shadow DOM boundary.
   *
   * @param {string} type
   * @param {object} detail
   */
  _dispatch(type, detail) {
    this.dispatchEvent(
      new CustomEvent(type, {
        detail: { ...detail },
        bubbles: true,
        composed: true,
      }),
    );
  }
}

// Lightweight HTML-escape used when rendering log lines. We
// import lazily to keep this module dependency-free.
function escapeHtml(value) {
  if (value === null || value === undefined) return "";
  return String(value)
    .replace(/&/g, String.fromCharCode(38, 97, 109, 112, 59))
    .replace(/</g, String.fromCharCode(38, 108, 116, 59))
    .replace(/>/g, String.fromCharCode(38, 103, 116, 59))
    .replace(/"/g, String.fromCharCode(38, 113, 117, 111, 116, 59))
    .replace(/'/g, String.fromCharCode(38, 35, 51, 57, 59));
}

// Register the custom element. Guard against double-registration
// (e.g. if this module is imported more than once).
if (
  typeof customElements !== "undefined" &&
  !customElements.get("dpad-readout")
) {
  customElements.define("dpad-readout", DpadReadout);
}

export {
  DpadReadout,
  EVT_LOG,
  TRACKED_ACTIONS,
  REPEAT_INTERVAL_MS,
  MAX_LOG_LINES,
};
