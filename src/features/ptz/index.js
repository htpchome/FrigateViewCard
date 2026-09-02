import { VIDEO_ZOOM_WHEEL_STEP } from "../../shared/media/video-zoom.ctrl.js";

const PTZ_SERVICE_DOMAIN = "frigate";
const PTZ_SERVICE_NAME = "ptz";
const PTZ_DIRECTIONS = Object.freeze(new Set(["up", "right", "down", "left"]));
const PTZ_DIRECTION_ORDER = Object.freeze(["up", "right", "down", "left"]);
export const PTZ_CONTROL_ROTATIONS = Object.freeze([0, 90, 180, 270]);
export const PTZ_HOLD_STRATEGIES = Object.freeze({
  frigateContinuous: "frigate_continuous",
});
const PTZ_SINGLE_ACTIONS = Object.freeze({
  "focus-in": Object.freeze({ action: "focus", argument: "in" }),
  "focus-out": Object.freeze({ action: "focus", argument: "out" }),
});
const PTZ_DISPLAY_ZOOM_DELTAS = Object.freeze({
  "zoom-in": VIDEO_ZOOM_WHEEL_STEP,
  "zoom-out": -VIDEO_ZOOM_WHEEL_STEP,
});

const buildHomeAssistantPtzRequest = ({ camera, action, argument = null }) => ({
  type: "home_assistant_service",
  domain: PTZ_SERVICE_DOMAIN,
  service: PTZ_SERVICE_NAME,
  serviceData: argument ? { action, argument } : { action },
  target: { entity_id: camera.entity },
});

export const normalizePtzControlRotation = (value) => {
  const rotation = Number(value);
  return PTZ_CONTROL_ROTATIONS.includes(rotation) ? rotation : 0;
};

export const normalizeCameraPtzConfig = (value) => {
  if (value !== true && (!value || typeof value !== "object")) {
    return null;
  }

  const source = value === true ? { enabled: true } : value;
  if (source.enabled === false) return null;

  const rotation = normalizePtzControlRotation(source.rotation);
  return {
    enabled: true,
    ...(rotation ? { rotation } : {}),
  };
};

export const hasCameraPtz = (camera) =>
  normalizeCameraPtzConfig(camera?.ptz)?.enabled === true;

export const hasPtzPanTiltCapability = (ptzInfo) =>
  Array.isArray(ptzInfo?.features) &&
  (ptzInfo.features.includes("pt") || ptzInfo.features.includes("pt-r"));

export const hasPtzFocusCapability = (ptzInfo) =>
  Array.isArray(ptzInfo?.features) && ptzInfo.features.includes("focus");

export const normalizePtzPresetNames = (ptzInfo) => {
  if (!Array.isArray(ptzInfo?.presets)) return [];

  const seen = new Set();
  return ptzInfo.presets.reduce((names, value) => {
    if (typeof value !== "string") return names;
    const name = value.trim();
    if (!name || seen.has(name)) return names;
    seen.add(name);
    names.push(name);
    return names;
  }, []);
};

export const isPtzHomePreset = (name) =>
  String(name || "").trim().toLowerCase() === "home";

const resolvePtzPresetName = (ptzInfo, requestedName) => {
  const candidate = String(requestedName || "").trim();
  if (!candidate) return null;
  return (
    normalizePtzPresetNames(ptzInfo).find((name) => name === candidate) || null
  );
};

export const resolvePtzControlDirection = (camera, action) => {
  const directionIndex = PTZ_DIRECTION_ORDER.indexOf(action);
  if (directionIndex < 0) return action;
  const rotation = normalizePtzControlRotation(camera?.ptz?.rotation);
  const rotationSteps = rotation / 90;
  return PTZ_DIRECTION_ORDER[
    (directionIndex - rotationSteps + PTZ_DIRECTION_ORDER.length) %
      PTZ_DIRECTION_ORDER.length
  ];
};

export const canCameraUsePtz = (camera, ptzInfo) =>
  hasCameraPtz(camera) && hasPtzPanTiltCapability(ptzInfo);

const isControlsPadTarget = (target) => target?.id === "controls-pad";

export const isPtzControlsPadEvent = (event) => {
  if (isControlsPadTarget(event?.target)) return true;
  const path = event?.composedPath?.();
  return Array.isArray(path) && path.some(isControlsPadTarget);
};

const canUsePtzAction = (action, ptzInfo) => {
  if (PTZ_DIRECTIONS.has(action)) return hasPtzPanTiltCapability(ptzInfo);
  if (action === "focus-in" || action === "focus-out") {
    return hasPtzFocusCapability(ptzInfo);
  }
  return false;
};

export const isPtzDirectionAction = (action) =>
  PTZ_DIRECTIONS.has(action);

export const resolvePtzHoldPlan = ({ camera, ptzInfo, action }) => {
  if (
    !normalizeCameraPtzConfig(camera?.ptz) ||
    !camera?.entity ||
    !PTZ_DIRECTIONS.has(action)
  ) {
    return null;
  }

  const features = Array.isArray(ptzInfo?.features) ? ptzInfo.features : [];
  if (features.includes("pt") || features.includes("pt-r")) {
    return {
      strategy: PTZ_HOLD_STRATEGIES.frigateContinuous,
      repeatIntervalMs: null,
      requiresStop: true,
    };
  }
  return null;
};

export const resolvePtzDisplayZoomPlan = ({
  camera,
  action,
  eventType,
}) => {
  if (!hasCameraPtz(camera)) return null;
  const step = PTZ_DISPLAY_ZOOM_DELTAS[action];
  if (!Number.isFinite(step)) return null;
  return {
    executionMode: "display_zoom",
    delta: eventType === "press" ? step : 0,
  };
};

export const resolvePtzServicePlan = ({
  camera,
  ptzInfo,
  action,
  eventType,
  argument = null,
}) => {
  const ptz = normalizeCameraPtzConfig(camera?.ptz);
  if (!ptz || !camera?.entity) {
    return null;
  }

  if (action === "preset") {
    const presetName = resolvePtzPresetName(ptzInfo, argument);
    if (eventType !== "press" || !presetName) return null;
    return {
      executionMode: "sequential",
      requests: [
        buildHomeAssistantPtzRequest({
          camera,
          action: "preset",
          argument: presetName,
        }),
      ],
    };
  }

  if (!canUsePtzAction(action, ptzInfo)) return null;

  if (eventType === "release") {
    return {
      executionMode: "sequential",
      requests: [buildHomeAssistantPtzRequest({ camera, action: "stop" })],
    };
  }

  const direction = PTZ_DIRECTIONS.has(action)
    ? resolvePtzControlDirection(camera, action)
    : null;
  if (direction) {
    return {
      executionMode: "sequential",
      requests: [
        buildHomeAssistantPtzRequest({
          camera,
          action: "move",
          argument: direction,
        }),
      ],
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
  };
};
