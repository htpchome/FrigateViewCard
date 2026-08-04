const PTZ_MOVE_MODE_CONTINUOUS = "ContinuousMove";
const PTZ_MOVE_MODE_RELATIVE = "RelativeMove";
const PTZ_SERVICE_DOMAIN = "frigate";
const PTZ_SERVICE_NAME = "ptz";
const PTZ_DEFAULT_SPEED = 0.5;
const PTZ_CONNECTION_HA_DIRECT = "ha_direct";
const PTZ_CONNECTION_FRIGATE = "frigate_go2rtc";
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

const normalizePtzConnectionType = (value) => {
  const type = String(value || "")
    .trim()
    .toLowerCase();
  if (
    type === PTZ_CONNECTION_HA_DIRECT ||
    type === "ha" ||
    type === "home_assistant"
  ) {
    return PTZ_CONNECTION_HA_DIRECT;
  }
  return PTZ_CONNECTION_FRIGATE;
};

const shouldUseHomeAssistantPtz = (camera) =>
  normalizePtzConnectionType(camera?.connection_type) ===
  PTZ_CONNECTION_HA_DIRECT;

const buildFrigatePtzApiPath = ({ clientId, cameraName, command }) =>
  `/api/frigate/${encodeURIComponent(clientId)}/api/${encodeURIComponent(cameraName)}/ptz/${command}`;

const buildHomeAssistantPtzRequest = ({ camera, action, argument = null }) => ({
  type: "home_assistant_service",
  domain: PTZ_SERVICE_DOMAIN,
  service: PTZ_SERVICE_NAME,
  serviceData: argument ? { action, argument } : { action },
  target: { entity_id: camera.entity },
});

const buildFrigateApiPtzRequest = ({ clientId, cameraName, command }) => ({
  type: "frigate_api",
  method: "GET",
  path: buildFrigatePtzApiPath({ clientId, cameraName, command }),
});

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
  Array.isArray(ptzInfo?.features) &&
  (ptzInfo.features.includes("pt") || ptzInfo.features.includes("pt-r"));

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
  ptzContext,
  action,
  eventType,
}) => {
  const ptz = normalizeCameraPtzConfig(camera?.ptz);
  if (!ptz || !camera?.entity || !hasPtzPanTiltCapability(ptzInfo)) {
    return null;
  }

  const useHomeAssistant = shouldUseHomeAssistantPtz(camera);
  const clientId = ptzContext?.clientId || "";
  const cameraName = ptzContext?.cameraName || ptzContext?.cam || "";

  if (!useHomeAssistant && (!clientId || !cameraName)) {
    return null;
  }

  if (eventType === "release") {
    if (ptz.move_mode !== PTZ_MOVE_MODE_CONTINUOUS) return null;
    return {
      executionMode: "sequential",
      requests: [
        useHomeAssistant
          ? buildHomeAssistantPtzRequest({ camera, action: "stop" })
          : buildFrigateApiPtzRequest({
              clientId,
              cameraName,
              command: "move_stop",
            }),
      ],
      readout: "[ptz:stop]",
    };
  }

  const directions = PTZ_DIRECTIONS[action];
  if (!directions?.length) return null;

  return {
    executionMode: directions.length > 1 ? "parallel" : "sequential",
    requests: directions.map((direction) =>
      useHomeAssistant
        ? buildHomeAssistantPtzRequest({
            camera,
            action: "move",
            argument: direction,
          })
        : buildFrigateApiPtzRequest({
            clientId,
            cameraName,
            command: `move_${direction}`,
          }),
    ),
    readout: `[ptz:${action}]`,
  };
};
