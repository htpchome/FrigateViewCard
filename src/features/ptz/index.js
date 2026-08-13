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

export const hasTwoWayTalkCapability = (ptzInfo) => {
  if (!ptzInfo || typeof ptzInfo !== "object") return false;
  if (
    ptzInfo.two_way_talk === true ||
    ptzInfo.twoWayTalk === true ||
    ptzInfo.talk === true ||
    ptzInfo.microphone === true
  ) {
    return true;
  }

  const source = [];
  if (Array.isArray(ptzInfo.features)) source.push(...ptzInfo.features);
  if (Array.isArray(ptzInfo.capabilities)) source.push(...ptzInfo.capabilities);
  if (Array.isArray(ptzInfo.actions)) source.push(...ptzInfo.actions);

  const normalized = source.map((item) =>
    String(item || "")
      .trim()
      .toLowerCase(),
  );

  return normalized.some((value) =>
    ["talk", "two_way_talk", "two-way-talk", "mic", "microphone"].includes(
      value,
    ),
  );
};

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
  const hasPanTilt = hasPtzPanTiltCapability(ptzInfo);
  const hasZoom = hasPtzZoomCapability(ptzInfo);
  const hasFocus = hasPtzFocusCapability(ptzInfo);
  if (!hasPanTilt && !hasZoom && !hasFocus) {
    return "Frigate did not report PTZ support for the active camera.";
  }
  if (hasPanTilt && (hasZoom || hasFocus)) {
    return "Use the circle pad or PTZ buttons to control the active camera.";
  }
  if (hasPanTilt) return "Use the circle pad to move the active camera.";
  if (hasZoom || hasFocus)
    return "Use the PTZ buttons to control the active camera.";
  return "Use the circle pad to move the active camera.";
};

const canUsePtzAction = (action, ptzInfo) => {
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
  if (!ptz || !camera?.entity || !canUsePtzAction(action, ptzInfo)) {
    return null;
  }

  if (eventType === "release") {
    if (ptz.move_mode !== PTZ_MOVE_MODE_CONTINUOUS) return null;
    return {
      executionMode: "sequential",
      requests: [buildHomeAssistantPtzRequest({ camera, action: "stop" })],
      readout: "[ptz:stop]",
    };
  }

  const directions = PTZ_DIRECTIONS[action];
  if (directions?.length) {
    return {
      executionMode: directions.length > 1 ? "parallel" : "sequential",
      requests: directions.map((direction) =>
        buildHomeAssistantPtzRequest({
          camera,
          action: "move",
          argument: direction,
        }),
      ),
      readout: `[ptz:${action}]`,
    };
  }

  const singleAction = PTZ_SINGLE_ACTIONS[action];
  if (!singleAction) return null;

  return {
    executionMode: "sequential",
    requests: [
      buildHomeAssistantPtzRequest({
        camera,
        action: singleAction.action,
        argument: singleAction.argument,
      }),
    ],
    readout: `[ptz:${action}]`,
  };
};
