import {
  linkedLightFriendlyName,
  resolveLinkedLightUiState,
} from "./light.model.js";

const escapeAttribute = (value) =>
  String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll('"', "&quot;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");

export const buildLinkedLightControlMarkup = ({
  config,
  stateObject,
  buttonClass = "round-btn",
} = {}) => {
  const entity = String(config?.entity || "").trim();
  if (!entity) return "";
  const ui = resolveLinkedLightUiState(stateObject);
  const icon =
    String(config?.icon || stateObject?.attributes?.icon || "").trim() ||
    "mdi:lightbulb";
  const friendlyName = linkedLightFriendlyName(entity, stateObject);
  const stateLabel = !ui.available
    ? "Unavailable"
    : ui.on
      ? `${ui.brightnessPercent}%`
      : "Off";
  const buttonLabel = `${friendlyName}: ${stateLabel}. ${
    ui.on ? "Turn off" : "Turn on"
  }${ui.supportsBrightness ? ". Press and hold to adjust brightness" : ""}`;
  const classes = [
    "linked-light-button",
    buttonClass,
    ui.on ? "is-on" : "is-off",
    ui.dimmed ? "is-dimmed" : "",
  ]
    .filter(Boolean)
    .join(" ");
  const powerLabel = ui.on
    ? `Turn off ${friendlyName}`
    : `Turn on ${friendlyName} at its previous brightness`;

  const position = config?.position === "left" ? "left" : "right";

  return `<div class="linked-light-control" data-linked-light="${escapeAttribute(entity)}" data-linked-light-position="${position}" data-linked-light-variant="${escapeAttribute(buttonClass)}" style="--linked-light-level:${ui.brightnessPercent}">
    <button class="${classes}" type="button" data-linked-light-toggle aria-pressed="${ui.on ? "true" : "false"}" aria-label="${escapeAttribute(buttonLabel)}" title="${escapeAttribute(buttonLabel)}" ${ui.available ? "" : "disabled"}>
      <ha-icon icon="${escapeAttribute(icon)}"></ha-icon>
    </button>
    ${
      ui.supportsBrightness
        ? `<div class="linked-light-dimmer" data-linked-light-dimmer hidden>
          <button class="linked-light-dimmer-scrim" type="button" data-linked-light-dimmer-dismiss aria-label="Close brightness control"></button>
          <div class="linked-light-dimmer-panel shadow-small" role="dialog" aria-label="${escapeAttribute(`Brightness for ${friendlyName}`)}">
            <button class="linked-light-dimmer-close icon-btn" type="button" data-linked-light-dimmer-dismiss aria-label="Close brightness control"><ha-icon icon="mdi:close"></ha-icon></button>
            <div class="linked-light-dimmer-title" data-linked-light-title>${escapeAttribute(friendlyName)}</div>
            <output data-linked-light-output>${ui.brightnessPercent}%</output>
            <div class="linked-light-brightness-track">
              <input type="range" min="1" max="100" step="1" value="${ui.brightnessPercent || 1}" data-linked-light-brightness aria-label="${escapeAttribute(`Brightness for ${friendlyName}`)}">
            </div>
            <button class="linked-light-dimmer-power round-btn ${ui.on ? "is-on" : "is-off"}" type="button" data-linked-light-power aria-pressed="${ui.on ? "true" : "false"}" aria-label="${escapeAttribute(powerLabel)}" title="${escapeAttribute(powerLabel)}" ${ui.available ? "" : "disabled"}><ha-icon icon="mdi:power"></ha-icon></button>
          </div>
        </div>`
        : ""
    }
  </div>`;
};
