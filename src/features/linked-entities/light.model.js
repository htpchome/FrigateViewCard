const BRIGHTNESS_MODES = new Set([
  "brightness",
  "color_temp",
  "hs",
  "rgb",
  "rgbw",
  "rgbww",
  "white",
  "xy",
]);

const clampPercent = (value) =>
  Math.max(0, Math.min(100, Math.round(Number(value) || 0)));

export const linkedLightFriendlyName = (entity, stateObject) => {
  const friendlyName = String(
    stateObject?.attributes?.friendly_name || "",
  ).trim();
  if (friendlyName) return friendlyName;
  const entityName = String(entity || "")
    .replace(/^light\./, "")
    .trim();
  if (!entityName) return "Light";
  return entityName
    .split(/[_\s-]+/)
    .filter(Boolean)
    .map((word) => `${word.charAt(0).toUpperCase()}${word.slice(1)}`)
    .join(" ");
};

export const linkedLightSupportsBrightness = (stateObject) => {
  const modes = stateObject?.attributes?.supported_color_modes;
  return (
    Array.isArray(modes) &&
    modes.some((mode) => BRIGHTNESS_MODES.has(String(mode || "")))
  );
};

export const linkedLightBrightnessPercent = (stateObject) => {
  if (stateObject?.state !== "on") return 0;
  if (!linkedLightSupportsBrightness(stateObject)) return 100;
  const brightness = Number(stateObject?.attributes?.brightness);
  if (!Number.isFinite(brightness)) return 100;
  return clampPercent((brightness / 255) * 100);
};

export const resolveLinkedLightUiState = (stateObject) => {
  const rawState = String(stateObject?.state || "missing").toLowerCase();
  const available = rawState === "on" || rawState === "off";
  const on = available && rawState === "on";
  const supportsBrightness = linkedLightSupportsBrightness(stateObject);
  const brightnessPercent = linkedLightBrightnessPercent(stateObject);
  return {
    available,
    on,
    dimmed: on && supportsBrightness && brightnessPercent < 100,
    supportsBrightness,
    brightnessPercent,
    rawState,
  };
};

export const linkedLightStateSignature = (hass, cameras) =>
  (Array.isArray(cameras) ? cameras : [])
    .flatMap((camera) => camera?.linked_entities || [])
    .map((config) => String(config?.entity || "").trim())
    .filter(Boolean)
    .filter((entity, index, entities) => entities.indexOf(entity) === index)
    .map((entity) => {
      const state = hass?.states?.[entity];
      const attributes = state?.attributes || {};
      return [
        entity,
        state?.state || "missing",
        attributes.brightness ?? "",
        Array.isArray(attributes.supported_color_modes)
          ? attributes.supported_color_modes.join(",")
          : "",
        attributes.icon || "",
        attributes.friendly_name || "",
      ].join(":");
    })
    .join("|");
