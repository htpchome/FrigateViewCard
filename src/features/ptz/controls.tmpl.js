import { escapeHtml, escapeHtmlAttribute } from "../../shared/html.js";

export function buildControlsSectionMarkup({
  panTiltEnabled = false,
  zoomEnabled = false,
  presetItems = [],
} = {}) {
  const padDisabledActions = [
    ...(panTiltEnabled ? [] : ["up", "right", "down", "left"]),
    ...(zoomEnabled ? [] : ["zoom-in", "zoom-out"]),
  ].join(" ");
  const presets = (Array.isArray(presetItems) ? presetItems : [])
    .map((preset) => {
      const name = String(preset?.name || "").trim();
      if (!name) return "";
      const safeName = escapeHtml(name);
      const label = `Move camera to preset ${name}`;
      return `<button class="controls-preset-chip controls-preset-chip--camera${preset?.isHome ? " is-home" : ""}" type="button" data-ptz-preset="${escapeHtmlAttribute(name)}" aria-label="${escapeHtmlAttribute(label)}" title="${escapeHtmlAttribute(label)}">${safeName}</button>`;
    })
    .filter(Boolean)
    .join("");
  const presetMarkup = presets
    ? `<div class="controls-presets" aria-label="Camera presets">
        <div class="controls-preset-list">${presets}</div>
        <div class="controls-presets-note">Camera Presets - presets are set on the camera.</div>
      </div>`
    : "";
  return `<div class="controls-ptz-stage">
            <div class="controls-pad-wrap${panTiltEnabled || zoomEnabled ? "" : " is-disabled"}">
              <circle-pad-control-2 id="controls-pad"${padDisabledActions ? ` disabled-actions="${padDisabledActions}"` : ""}></circle-pad-control-2>
            </div>
            ${presetMarkup}
          </div>`;
}
