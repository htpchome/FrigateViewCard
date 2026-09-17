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

export const resolveLinkedLightLabels = ({ ui, friendlyName }) => {
  const state = !ui.available ? "unavailable" : ui.on ? "on" : "off";
  const buttonKey = `runtime.linkedLight.toggle.${state}${ui.supportsBrightness ? "Dimmable" : ""}`;
  const stateLabel = !ui.available
    ? "Unavailable"
    : ui.on
      ? `${ui.brightnessPercent}%`
      : "Off";
  return {
    values: { name: friendlyName, percent: ui.brightnessPercent },
    buttonKey,
    buttonLabel: `${friendlyName}: ${stateLabel}. ${ui.on ? "Turn off" : "Turn on"}${ui.supportsBrightness ? ". Press and hold to adjust brightness" : ""}`,
    powerKey: ui.on
      ? "runtime.linkedLight.powerOff"
      : "runtime.linkedLight.powerOn",
    powerLabel: ui.on
      ? `Turn off ${friendlyName}`
      : `Turn on ${friendlyName} at its previous brightness`,
    brightnessLabel: `Brightness for ${friendlyName}`,
  };
};

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
  const labels = resolveLinkedLightLabels({ ui, friendlyName });
  const labelValues = escapeAttribute(JSON.stringify(labels.values));
  const classes = [
    "linked-light-button",
    buttonClass,
    ui.on ? "is-on" : "is-off",
    ui.dimmed ? "is-dimmed" : "",
  ]
    .filter(Boolean)
    .join(" ");
  const position = config?.position === "left" ? "left" : "right";

  return `<div class="linked-light-control" data-linked-light="${escapeAttribute(entity)}" data-linked-light-position="${position}" data-linked-light-variant="${escapeAttribute(buttonClass)}" style="--linked-light-level:${ui.brightnessPercent}">
    <button class="${classes}" type="button" data-linked-light-toggle aria-pressed="${ui.on ? "true" : "false"}" aria-label="${escapeAttribute(labels.buttonLabel)}" title="${escapeAttribute(labels.buttonLabel)}" data-fvc-i18n-aria-label="${labels.buttonKey}" data-fvc-i18n-title="${labels.buttonKey}" data-fvc-i18n-values="${labelValues}" ${ui.available ? "" : "disabled"}>
      <ha-icon icon="${escapeAttribute(icon)}"></ha-icon>
    </button>
    ${
      ui.supportsBrightness
        ? `<div class="linked-light-dimmer" data-linked-light-dimmer hidden>
          <button class="linked-light-dimmer-scrim" type="button" data-linked-light-dimmer-dismiss aria-label="Close brightness control" data-fvc-i18n-aria-label="runtime.linkedLight.closeBrightness"></button>
          <div class="linked-light-dimmer-panel shadow-small" data-linked-light-dimmer-panel role="dialog" aria-label="${escapeAttribute(labels.brightnessLabel)}" data-fvc-i18n-aria-label="runtime.linkedLight.brightnessFor" data-fvc-i18n-values="${labelValues}">
            <button class="linked-light-dimmer-close icon-btn" type="button" data-linked-light-dimmer-dismiss aria-label="Close brightness control" data-fvc-i18n-aria-label="runtime.linkedLight.closeBrightness"><ha-icon icon="mdi:close"></ha-icon></button>
            <div class="linked-light-dimmer-title" data-linked-light-title>${escapeAttribute(friendlyName)}</div>
            <output data-linked-light-output>${ui.brightnessPercent}%</output>
            <div class="linked-light-brightness-track">
              <input type="range" min="1" max="100" step="1" value="${ui.brightnessPercent || 1}" data-linked-light-brightness aria-label="${escapeAttribute(labels.brightnessLabel)}" data-fvc-i18n-aria-label="runtime.linkedLight.brightnessFor" data-fvc-i18n-values="${labelValues}">
            </div>
            <button class="linked-light-dimmer-power round-btn ${ui.on ? "is-on" : "is-off"}" type="button" data-linked-light-power aria-pressed="${ui.on ? "true" : "false"}" aria-label="${escapeAttribute(labels.powerLabel)}" title="${escapeAttribute(labels.powerLabel)}" data-fvc-i18n-aria-label="${labels.powerKey}" data-fvc-i18n-title="${labels.powerKey}" data-fvc-i18n-values="${labelValues}" ${ui.available ? "" : "disabled"}><ha-icon icon="mdi:power"></ha-icon></button>
          </div>
        </div>`
        : ""
    }
  </div>`;
};
