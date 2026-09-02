import { cameraMemberEntities } from "../../features/camera-groups/model.js";

function findCameraConfig(config, entity) {
  return (
    config?.cameras?.find((camera) =>
      cameraMemberEntities(camera).includes(entity),
    ) || null
  );
}

export function resolveCameraConnectionType({
  config,
  entity,
  defaultConnectionType,
  normalizeCameraConnectionType,
}) {
  if (!entity) return defaultConnectionType;
  const camera = findCameraConfig(config, entity);
  return normalizeCameraConnectionType(camera?.connection_type);
}

export function shouldUseGo2RtcForEntity({
  config,
  entity,
  defaultConnectionType,
  normalizeCameraConnectionType,
}) {
  const key = String(entity || "").trim();
  if (!key) return false;
  return (
    resolveCameraConnectionType({
      config,
      entity: key,
      defaultConnectionType,
      normalizeCameraConnectionType,
    }) !== "ha_direct"
  );
}

export function resolveGo2RtcEntity({
  entity = "",
  activeEntity = "",
  config,
  defaultConnectionType,
  normalizeCameraConnectionType,
}) {
  const targetEntity = String(entity || activeEntity || "").trim();
  if (!targetEntity) return "";
  return shouldUseGo2RtcForEntity({
    config,
    entity: targetEntity,
    defaultConnectionType,
    normalizeCameraConnectionType,
  })
    ? targetEntity
    : "";
}

export function discoverFrigateCameraState({
  entity,
  hass,
  currentState,
  createCameraState,
}) {
  const cache = currentState || createCameraState();
  if (cache.discovered) return cache;
  const ent = hass?.states?.[entity];
  if (!ent) return cache;
  return {
    ...cache,
    clientId:
      ent.attributes?.client_id || ent.attributes?.mqtt_client_id || "frigate",
    cam: ent.attributes?.camera_name || entity.replace(/^camera\./, ""),
    discovered: true,
  };
}

export function buildGo2RtcCameraContext({
  entity,
  camCache,
  createCameraState,
  makeGo2rtcCacheKey,
}) {
  if (!entity) return null;
  const cache = camCache?.[entity] || createCameraState();
  const { clientId, cam } = cache;
  if (!clientId || !cam) return null;
  return {
    clientId,
    cam,
    cacheKey: makeGo2rtcCacheKey({ clientId, cam }),
  };
}

export function buildGo2RtcUrlContext({
  entity,
  activeEntity,
  config,
  defaultConnectionType,
  normalizeCameraConnectionType,
  camCache,
  createCameraState,
  makeGo2rtcCacheKey,
}) {
  const targetEntity = resolveGo2RtcEntity({
    entity,
    activeEntity,
    config,
    defaultConnectionType,
    normalizeCameraConnectionType,
  });
  if (!targetEntity) return null;
  const ctx = buildGo2RtcCameraContext({
    entity: targetEntity,
    camCache,
    createCameraState,
    makeGo2rtcCacheKey,
  });
  if (!ctx) return null;
  return { targetEntity, ...ctx };
}

export function buildGo2RtcTransportState({
  entity,
  activeEntity,
  config,
  defaultConnectionType,
  normalizeCameraConnectionType,
  camCache,
  createCameraState,
  makeGo2rtcCacheKey,
  nowMs = Date.now(),
}) {
  const ctx = buildGo2RtcUrlContext({
    entity,
    activeEntity,
    config,
    defaultConnectionType,
    normalizeCameraConnectionType,
    camCache,
    createCameraState,
    makeGo2rtcCacheKey,
  });
  if (!ctx) return null;
  return { ...ctx, nowMs };
}
