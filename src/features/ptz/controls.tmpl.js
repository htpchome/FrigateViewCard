import { escapeHtml, escapeHtmlAttribute } from "../../shared/html.js";

const PAD_LABELS = Object.freeze({
  right: ["runtime.ptz.right", "Right"],
  down: ["runtime.ptz.down", "Down"],
  up: ["runtime.ptz.up", "Up"],
  left: ["runtime.ptz.left", "Left"],
  "zoom-out": ["runtime.ptz.zoomOut", "Zoom Out"],
  "zoom-in": ["runtime.ptz.zoomIn", "Zoom In"],
});

export function syncControlsPadLabels(pad, t) {
  if (!pad?.shadowRoot || typeof t !== "function") return;
  for (const [action, [key]] of Object.entries(PAD_LABELS)) {
    const button = pad.shadowRoot.querySelector(
      `[data-circle-pad-action="${action}"]`,
    );
    if (!button) continue;
    const label = t(key);
    if (button.getAttribute("aria-label") !== label) {
      button.setAttribute("aria-label", label);
    }
  }
}

export function buildControlsSectionMarkup({
  panTiltEnabled = false,
  zoomEnabled = false,
  presetItems = [],
  t = null,
} = {}) {
  const translate = (key, fallback, values = {}) =>
    typeof t === "function" ? t(key, values) : fallback;
  const padDisabledActions = [
    ...(panTiltEnabled ? [] : ["up", "right", "down", "left"]),
    ...(zoomEnabled ? [] : ["zoom-in", "zoom-out"]),
  ].join(" ");
  const presets = (Array.isArray(presetItems) ? presetItems : [])
    .map((preset) => {
      const name = String(preset?.name || "").trim();
      if (!name) return "";
      const safeName = escapeHtml(name);
      const label = translate(
        "runtime.ptz.moveToPreset",
        `Move camera to preset ${name}`,
        { name },
      );
      const values = escapeHtmlAttribute(JSON.stringify({ name }));
      return `<button class="controls-preset-chip controls-preset-chip--camera${preset?.isHome ? " is-home" : ""}" type="button" data-ptz-preset="${escapeHtmlAttribute(name)}" aria-label="${escapeHtmlAttribute(label)}" title="${escapeHtmlAttribute(label)}" data-fvc-i18n-aria-label="runtime.ptz.moveToPreset" data-fvc-i18n-title="runtime.ptz.moveToPreset" data-fvc-i18n-values="${values}">${safeName}</button>`;
    })
    .filter(Boolean)
    .join("");
  const presetMarkup = presets
    ? `<div class="controls-presets" aria-label="${escapeHtmlAttribute(translate("runtime.ptz.presets", "Camera presets"))}" data-fvc-i18n-aria-label="runtime.ptz.presets">
        <div class="controls-preset-list">${presets}</div>
        <div class="controls-presets-note" data-fvc-i18n="runtime.ptz.presetsNote">${escapeHtml(translate("runtime.ptz.presetsNote", "Camera Presets - presets are set on the camera."))}</div>
      </div>`
    : "";
  return `<div class="controls-ptz-stage">
            <div class="controls-pad-wrap${panTiltEnabled || zoomEnabled ? "" : " is-disabled"}">
              <circle-pad-control-2 id="controls-pad"${padDisabledActions ? ` disabled-actions="${padDisabledActions}"` : ""}></circle-pad-control-2>
            </div>
            ${presetMarkup}
          </div>`;
}
