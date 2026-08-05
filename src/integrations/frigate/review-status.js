function normalizeCameraToken(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

export function reviewStatusEntityCandidates(
  entity,
  discoveredCameraName = "",
) {
  const cameraEntity = String(entity || "")
    .trim()
    .toLowerCase();
  const bareFromEntity = cameraEntity.replace(/^camera\./, "");
  const cameraTokens = [bareFromEntity, discoveredCameraName]
    .map((token) => normalizeCameraToken(token))
    .filter(Boolean);
  const out = [];
  for (const token of cameraTokens) {
    out.push(`sensor.${token}_review_status`);
  }
  return [...new Set(out)];
}

export function haReviewStatusForCamera({
  entity,
  discoveredCameraName = "",
  hass,
}) {
  const states = hass?.states || null;
  if (!states) return "";
  for (const candidate of reviewStatusEntityCandidates(
    entity,
    discoveredCameraName,
  )) {
    const stateObj = states[candidate];
    if (!stateObj) continue;
    const rawState = String(stateObj.state || "")
      .trim()
      .toLowerCase();
    if (rawState === "alert" || rawState === "detection") {
      return rawState;
    }
    const attrReviewStatus = String(stateObj.attributes?.review_status || "")
      .trim()
      .toLowerCase();
    if (attrReviewStatus === "alert" || attrReviewStatus === "detection") {
      return attrReviewStatus;
    }
    const attrSeverity = String(stateObj.attributes?.severity || "")
      .trim()
      .toLowerCase();
    if (attrSeverity === "alert" || attrSeverity === "detection") {
      return attrSeverity;
    }
    return rawState;
  }
  return "";
}

export function haReviewStatusSeverity(value) {
  const normalized = String(value || "")
    .trim()
    .toLowerCase();
  if (normalized === "alert") return "alert";
  if (normalized === "detection") return "detection";
  return "";
}

export function haReviewStatusSignature({
  hass,
  cameras,
  resolveDiscoveredCameraName,
}) {
  const parts = [];
  for (const camera of cameras || []) {
    const entity = String(camera?.entity || "").trim();
    if (!entity) continue;
    const discoveredCameraName = resolveDiscoveredCameraName
      ? resolveDiscoveredCameraName(entity)
      : "";
    const state = haReviewStatusForCamera({
      entity,
      discoveredCameraName,
      hass,
    });
    parts.push(`${entity}:${state || "none"}`);
  }
  return parts.join("|");
}
