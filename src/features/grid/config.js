import { flattenCameraMembers } from "../camera-groups/model.js";

export const GRID_ORDER_MODES = Object.freeze({
  default: "default",
  custom: "custom",
});

const uniqueConfiguredEntities = (values, allowedEntities) => {
  const seen = new Set();
  return (Array.isArray(values) ? values : [])
    .map((value) => String(value || "").trim())
    .filter((entity) => {
      if (!entity || !allowedEntities.has(entity) || seen.has(entity)) {
        return false;
      }
      seen.add(entity);
      return true;
    });
};

export const normalizeGridOrderConfig = (value, cameras = []) => {
  const physicalCameras = flattenCameraMembers(cameras);
  const configuredEntities = physicalCameras
    .map((camera) => String(camera?.entity || "").trim())
    .filter(Boolean);
  const allowedEntities = new Set(configuredEntities);
  const source =
    value && typeof value === "object" && !Array.isArray(value) ? value : {};
  const mode =
    source.mode === GRID_ORDER_MODES.custom
      ? GRID_ORDER_MODES.custom
      : GRID_ORDER_MODES.default;
  const included = uniqueConfiguredEntities(source.included, allowedEntities);
  const includedSet = new Set(included);
  const excluded = uniqueConfiguredEntities(
    source.excluded,
    allowedEntities,
  ).filter((entity) => !includedSet.has(entity));
  const accountedFor = new Set([...included, ...excluded]);

  for (const entity of configuredEntities) {
    if (accountedFor.has(entity)) continue;
    included.push(entity);
    accountedFor.add(entity);
  }

  return { mode, included, excluded };
};

export const resolveGridCameras = (cameras = [], value = null) => {
  const physicalCameras = flattenCameraMembers(cameras);
  const normalized = normalizeGridOrderConfig(value, cameras);
  if (normalized.mode !== GRID_ORDER_MODES.custom) return physicalCameras;

  const camerasByEntity = new Map(
    physicalCameras.map((camera) => [camera?.entity, camera]),
  );
  return normalized.included
    .map((entity) => camerasByEntity.get(entity))
    .filter(Boolean);
};
