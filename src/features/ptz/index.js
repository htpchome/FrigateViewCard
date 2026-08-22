const PTZ_MOVE_MODE_CONTINUOUS = "ContinuousMove";
const PTZ_MOVE_MODE_RELATIVE = "RelativeMove";
const PTZ_SERVICE_DOMAIN = "frigate";
const PTZ_SERVICE_NAME = "ptz";
const ONVIF_PTZ_SERVICE_DOMAIN = "onvif";
const ONVIF_PTZ_SERVICE_NAME = "ptz";
export const PTZ_DEFAULT_SPEED = 0.5;
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
const PTZ_SINGLE_ACTIONS = Object.freeze({
  "zoom-in": Object.freeze({ action: "zoom", argument: "in" }),
  "zoom-out": Object.freeze({ action: "zoom", argument: "out" }),
  "focus-in": Object.freeze({ action: "focus", argument: "in" }),
  "focus-out": Object.freeze({ action: "focus", argument: "out" }),
});

const normalizePtzNumber = (value) => {
  if (value == null || value === "") return null;
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return null;
  if (parsed < 0 || parsed > 1) return null;
  return parsed;
};

const buildHomeAssistantPtzRequest = ({ camera, action, argument = null }) => ({
  type: "home_assistant_service",
  domain: PTZ_SERVICE_DOMAIN,
  service: PTZ_SERVICE_NAME,
  serviceData: argument ? { action, argument } : { action },
  target: { entity_id: camera.entity },
});

const buildOnvifPtzRequest = ({
  camera,
  moveMode,
  pan,
  tilt,
  zoom,
  speed,
  distance,
  continuousDuration,
}) => {
  const serviceData = { move_mode: moveMode };
  if (pan) serviceData.pan = pan;
  if (tilt) serviceData.tilt = tilt;
  if (zoom) serviceData.zoom = zoom;
  if (speed != null) serviceData.speed = speed;
  if (distance != null) serviceData.distance = distance;
  if (continuousDuration != null) {
    serviceData.continuous_duration = continuousDuration;
  }

  return {
    type: "home_assistant_service",
    domain: ONVIF_PTZ_SERVICE_DOMAIN,
    service: ONVIF_PTZ_SERVICE_NAME,
    serviceData,
    target: { entity_id: camera.entity },
  };
};

const isHaDirectCamera = (camera) =>
  String(camera?.connection_type || "")
    .trim()
    .toLowerCase() === "ha_direct";

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
    // Per-camera config currently supports continuous movement only.
    move_mode: PTZ_MOVE_MODE_CONTINUOUS,
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

export const hasPtzZoomCapability = (ptzInfo) =>
  Array.isArray(ptzInfo?.features) && ptzInfo.features.includes("zoom");

export const hasPtzFocusCapability = (ptzInfo) =>
  Array.isArray(ptzInfo?.features) && ptzInfo.features.includes("focus");

export const canCameraUsePtz = (camera, ptzInfo) =>
  hasCameraPtz(camera) &&
  (isHaDirectCamera(camera) || hasPtzPanTiltCapability(ptzInfo));

const isControlsPadTarget = (target) => target?.id === "controls-pad";

export const isPtzControlsPadEvent = (event) => {
  if (isControlsPadTarget(event?.target)) return true;
  const path = event?.composedPath?.();
  return Array.isArray(path) && path.some(isControlsPadTarget);
};

const canUsePtzAction = (action, ptzInfo, camera = null) => {
  if (isHaDirectCamera(camera)) {
    if (PTZ_DIRECTIONS[action]) return true;
    if (action === "zoom-in" || action === "zoom-out") return true;
    return false;
  }
  if (PTZ_DIRECTIONS[action]) return hasPtzPanTiltCapability(ptzInfo);
  if (action === "zoom-in" || action === "zoom-out") {
    return hasPtzZoomCapability(ptzInfo);
  }
  if (action === "focus-in" || action === "focus-out") {
    return hasPtzFocusCapability(ptzInfo);
  }
  return false;
};

export const resolvePtzServicePlan = ({
  camera,
  ptzInfo,
  action,
  eventType,
}) => {
  const ptz = normalizeCameraPtzConfig(camera?.ptz);
  if (!ptz || !camera?.entity || !canUsePtzAction(action, ptzInfo, camera)) {
    return null;
  }

  const haDirect = isHaDirectCamera(camera);

  if (eventType === "release") {
    if (ptz.move_mode !== PTZ_MOVE_MODE_CONTINUOUS) return null;
    if (haDirect) {
      return {
        executionMode: "sequential",
        requests: [
          buildOnvifPtzRequest({
            camera,
            moveMode: "Stop",
          }),
        ],
      };
    }
    return {
      executionMode: "sequential",
      requests: [buildHomeAssistantPtzRequest({ camera, action: "stop" })],
    };
  }

  const directions = PTZ_DIRECTIONS[action];
  if (directions?.length) {
    if (haDirect) {
      const pan = directions.includes("left")
        ? "LEFT"
        : directions.includes("right")
          ? "RIGHT"
          : null;
      const tilt = directions.includes("up")
        ? "UP"
        : directions.includes("down")
          ? "DOWN"
          : null;
      return {
        executionMode: "sequential",
        requests: [
          buildOnvifPtzRequest({
            camera,
            moveMode: "ContinuousMove",
            pan,
            tilt,
            speed: ptz.speed,
            continuousDuration: ptz.continuous_duration,
          }),
        ],
      };
    }
    return {
      executionMode: directions.length > 1 ? "parallel" : "sequential",
      requests: directions.map((direction) =>
        buildHomeAssistantPtzRequest({
          camera,
          action: "move",
          argument: direction,
        }),
      ),
    };
  }

  const singleAction = PTZ_SINGLE_ACTIONS[action];
  if (!singleAction) return null;

  if (haDirect) {
    const zoom =
      action === "zoom-in"
        ? "ZOOM_IN"
        : action === "zoom-out"
          ? "ZOOM_OUT"
          : null;
    if (!zoom) return null;
    return {
      executionMode: "sequential",
      requests: [
        buildOnvifPtzRequest({
          camera,
          moveMode: "ContinuousMove",
          zoom,
          speed: ptz.speed,
          continuousDuration: ptz.continuous_duration,
        }),
      ],
    };
  }

  return {
    executionMode: "sequential",
    requests: [
      buildHomeAssistantPtzRequest({
        camera,
        action: singleAction.action,
        argument: singleAction.argument,
      }),
    ],
  };
};
