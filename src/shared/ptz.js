const PTZ_MOVE_MODE_CONTINUOUS = "ContinuousMove";
const PTZ_MOVE_MODE_RELATIVE = "RelativeMove";
const PTZ_SERVICE_DOMAIN = "onvif";
const PTZ_SERVICE_NAME = "ptz";
const PTZ_DIRECTIONS = Object.freeze({
  up: Object.freeze({ tilt: "UP" }),
  "up-right": Object.freeze({ pan: "RIGHT", tilt: "UP" }),
  right: Object.freeze({ pan: "RIGHT" }),
  "down-right": Object.freeze({ pan: "RIGHT", tilt: "DOWN" }),
  down: Object.freeze({ tilt: "DOWN" }),
  "down-left": Object.freeze({ pan: "LEFT", tilt: "DOWN" }),
  left: Object.freeze({ pan: "LEFT" }),
  "up-left": Object.freeze({ pan: "LEFT", tilt: "UP" }),
});

const normalizePtzNumber = (value) => {
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

  const speed = normalizePtzNumber(source.speed);
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

export const resolvePtzEmptyStateMessage = (camera) => {
  return hasCameraPtz(camera)
    ? "Use the circle pad to move the active camera."
    : "PTZ is not configured for the active camera.";
};

export const resolvePtzServiceRequest = ({ camera, action, eventType }) => {
  const ptz = normalizeCameraPtzConfig(camera?.ptz);
  if (!ptz || !camera?.entity) return null;

  if (eventType === "release") {
    if (ptz.move_mode !== PTZ_MOVE_MODE_CONTINUOUS) return null;
    return {
      domain: PTZ_SERVICE_DOMAIN,
      service: PTZ_SERVICE_NAME,
      serviceData: { move_mode: "Stop" },
      target: { entity_id: camera.entity },
      readout: "[ptz:stop]",
    };
  }

  const direction = PTZ_DIRECTIONS[action];
  if (!direction) return null;

  const serviceData = {
    move_mode: ptz.move_mode,
    ...direction,
  };
  if (ptz.speed != null) {
    serviceData.speed = ptz.speed;
  }
  if (ptz.move_mode === PTZ_MOVE_MODE_RELATIVE && ptz.distance != null) {
    serviceData.distance = ptz.distance;
  }
  if (
    ptz.move_mode === PTZ_MOVE_MODE_CONTINUOUS &&
    ptz.continuous_duration != null
  ) {
    serviceData.continuous_duration = ptz.continuous_duration;
  }

  return {
    domain: PTZ_SERVICE_DOMAIN,
    service: PTZ_SERVICE_NAME,
    serviceData,
    target: { entity_id: camera.entity },
    readout: `[ptz:${action}]`,
  };
};
