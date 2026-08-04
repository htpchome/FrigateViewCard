const PTZ_MOVE_MODE_CONTINUOUS = "ContinuousMove";
const PTZ_MOVE_MODE_RELATIVE = "RelativeMove";
const PTZ_SERVICE_DOMAIN = "frigate";
const PTZ_SERVICE_NAME = "ptz";
const PTZ_DEFAULT_SPEED = 0.5;
const PTZ_DIRECTIONS = Object.freeze({
  up: Object.freeze(["up"]),
  "up-right": Object.freeze(["up", "right"]),
  right: Object.freeze(["right"]),
  "down-right": Object.freeze(["down", "right"]),
  down: Object.freeze(["down"]),
  "down-left": Object.freeze(["down", "left"]),
  left: Object.freeze(["left"]),
  "up-left": Object.freeze(["up", "left"]),
});

const normalizePtzNumber = (value) => {
  if (value == null || value === "") return null;
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return null;
  if (parsed < 0 || parsed > 1) return null;
  return parsed;
};

export const normalizePtzMoveMode = (value) => {
  const normalized = String(value || "")
    .trim()
    .toLowerCase();
  return normalized === "relativemove"
    ? PTZ_MOVE_MODE_RELATIVE
    : PTZ_MOVE_MODE_CONTINUOUS;
};

export const normalizeCameraPtzConfig = (value) => {
  if (value !== true && (!value || typeof value !== "object")) {
    return null;
  }

  const source = value === true ? { enabled: true } : value;
  if (source.enabled === false) return null;

  const speed = normalizePtzNumber(source.speed) ?? PTZ_DEFAULT_SPEED;
  const distance = normalizePtzNumber(source.distance);
  const continuousDuration = normalizePtzNumber(source.continuous_duration);

  return {
    enabled: true,
    move_mode: normalizePtzMoveMode(source.move_mode),
    speed,
    distance,
    continuous_duration: continuousDuration,
  };
};

export const hasCameraPtz = (camera) =>
  normalizeCameraPtzConfig(camera?.ptz)?.enabled === true;

export const hasPtzPanTiltCapability = (ptzInfo) =>
  Array.isArray(ptzInfo?.features) && ptzInfo.features.includes("pt");

export const canCameraUsePtz = (camera, ptzInfo) =>
  hasCameraPtz(camera) && hasPtzPanTiltCapability(ptzInfo);

export const resolvePtzEmptyStateMessage = (
  camera,
  ptzInfo,
  { loading = false } = {},
) => {
  if (!hasCameraPtz(camera)) {
    return "PTZ is not configured for the active camera.";
  }
  if (loading) {
    return "Checking Frigate PTZ support for the active camera.";
  }
  if (!hasPtzPanTiltCapability(ptzInfo)) {
    return "Frigate did not report PTZ pan/tilt support for the active camera.";
  }
  return "Use the circle pad to move the active camera.";
};

export const resolvePtzServicePlan = ({
  camera,
  ptzInfo,
  action,
  eventType,
}) => {
  const ptz = normalizeCameraPtzConfig(camera?.ptz);
  if (!ptz || !camera?.entity || !hasPtzPanTiltCapability(ptzInfo)) {
    return null;
  }

  if (eventType === "release") {
    if (ptz.move_mode !== PTZ_MOVE_MODE_CONTINUOUS) return null;
    return {
      requests: [
        {
          domain: PTZ_SERVICE_DOMAIN,
          service: PTZ_SERVICE_NAME,
          serviceData: { action: "stop" },
          target: { entity_id: camera.entity },
        },
      ],
      readout: "[ptz:stop]",
    };
  }

  const directions = PTZ_DIRECTIONS[action];
  if (!directions?.length) return null;

  return {
    requests: directions.map((direction) => ({
      domain: PTZ_SERVICE_DOMAIN,
      service: PTZ_SERVICE_NAME,
      serviceData: {
        action: "move",
        argument: direction,
      },
      target: { entity_id: camera.entity },
    })),
    readout: `[ptz:${action}]`,
  };
};
