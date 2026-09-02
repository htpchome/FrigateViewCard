const linkedLightIsAvailable = (stateObject) =>
  stateObject?.state === "on" || stateObject?.state === "off";

export const toggleHomeAssistantLight = async ({ hass, entity }) => {
  const entityId = String(entity || "").trim();
  const stateObject = hass?.states?.[entityId];
  if (!entityId.startsWith("light.") || !linkedLightIsAvailable(stateObject)) {
    return false;
  }
  const service = stateObject.state === "on" ? "turn_off" : "turn_on";
  await hass.callService("light", service, { entity_id: entityId });
  return true;
};

export const setHomeAssistantLightBrightness = async ({
  hass,
  entity,
  brightnessPercent,
}) => {
  const entityId = String(entity || "").trim();
  const stateObject = hass?.states?.[entityId];
  if (!entityId.startsWith("light.") || !linkedLightIsAvailable(stateObject)) {
    return false;
  }
  const brightnessPct = Math.max(
    1,
    Math.min(100, Math.round(Number(brightnessPercent) || 1)),
  );
  await hass.callService("light", "turn_on", {
    entity_id: entityId,
    brightness_pct: brightnessPct,
  });
  return true;
};
