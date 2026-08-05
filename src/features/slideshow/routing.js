import { normalizeAlertsAreaContent } from "../../helpers.js";

function normalizeCameraToken(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/^camera\./, "")
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

function valueAtPath(obj, path) {
  let current = obj;
  for (const key of path) {
    if (current == null) return "";
    current = current[key];
  }
  return current;
}

function firstNonEmptyString(values) {
  for (const value of values) {
    const text = String(value || "").trim();
    if (text) return text;
  }
  return "";
}

export function slideshowReviewModeForCamera(config, entity) {
  const cam = config?.cameras?.find((camera) => camera.entity === entity);
  return normalizeAlertsAreaContent(cam?.alerts_content);
}

export function shouldHandleSlideshowReview(config, entity, severity) {
  if (severity === "alert") return true;
  return (
    severity === "detection" &&
    slideshowReviewModeForCamera(config, entity) === "all_reviews"
  );
}

export function cameraIndexForIncomingCamera(config, camCache, cameraId) {
  const normalized = normalizeCameraToken(cameraId);
  if (!normalized) return -1;
  return (
    config?.cameras?.findIndex((camera) => {
      const entity = String(camera?.entity || "").toLowerCase();
      const discovered = String(camCache[camera?.entity]?.cam || "");
      const tokens = [
        entity,
        entity.replace(/^camera\./, ""),
        camera?.name || "",
        discovered,
      ].map((token) => normalizeCameraToken(token));
      return tokens.includes(normalized);
    }) ?? -1
  );
}

export function cameraEntityForIncomingCamera(config, camCache, cameraId) {
  const idx = cameraIndexForIncomingCamera(config, camCache, cameraId);
  return idx >= 0 ? config?.cameras?.[idx]?.entity || "" : "";
}

export function normalizeReviewSeverity(review) {
  return String(review?.severity || review?.data?.severity || "")
    .trim()
    .toLowerCase();
}

export function reviewStartTimeSec(review) {
  const start = Number(review?.start_time || review?.after?.start_time || 0);
  return Number.isFinite(start) ? start : 0;
}

export function cameraIndexByEntity(config, entity) {
  if (!entity) return -1;
  return config?.cameras?.findIndex((camera) => camera.entity === entity) ?? -1;
}

export function extractRealtimeMessageCamera(msg) {
  return firstNonEmptyString([
    msg?.camera,
    msg?.event?.camera,
    msg?.review?.camera,
    msg?.after?.camera,
    msg?.before?.camera,
    msg?.event?.after?.camera,
    msg?.event?.before?.camera,
    msg?.review?.after?.camera,
    msg?.review?.before?.camera,
    valueAtPath(msg, ["after", "data", "camera"]),
    valueAtPath(msg, ["before", "data", "camera"]),
    valueAtPath(msg, ["event", "data", "camera"]),
    valueAtPath(msg, ["review", "data", "camera"]),
    msg?.payload?.camera,
    msg?.payload?.after?.camera,
    msg?.payload?.before?.camera,
  ]);
}

export function extractRealtimeMessageSeverity(msg) {
  const type = String(msg?.type || "")
    .trim()
    .toLowerCase();
  return firstNonEmptyString([
    msg?.severity,
    msg?.event?.severity,
    msg?.event?.data?.severity,
    msg?.review?.severity,
    msg?.review?.data?.severity,
    msg?.after?.severity,
    msg?.after?.data?.severity,
    msg?.before?.severity,
    msg?.before?.data?.severity,
    msg?.event?.after?.severity,
    msg?.event?.before?.severity,
    msg?.review?.after?.severity,
    msg?.review?.before?.severity,
    msg?.payload?.severity,
    msg?.payload?.event?.severity,
    msg?.payload?.review?.severity,
    msg?.payload?.after?.severity,
    msg?.payload?.before?.severity,
    type.includes("detection") ? "detection" : "",
  ])
    .trim()
    .toLowerCase();
}
