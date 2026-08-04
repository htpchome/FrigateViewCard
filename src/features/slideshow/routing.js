import { normalizeAlertsAreaContent } from "../helpers.js";

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
  const normalized = String(cameraId || "")
    .trim()
    .toLowerCase();
  if (!normalized) return -1;
  return (
    config?.cameras?.findIndex((camera) => {
      const entity = String(camera?.entity || "").toLowerCase();
      const name = String(camera?.name || "").toLowerCase();
      const discovered = String(
        camCache[camera?.entity]?.cam || "",
      ).toLowerCase();
      return (
        entity === normalized ||
        name === normalized ||
        discovered === normalized
      );
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
  return String(
    msg?.camera ||
      msg?.event?.camera ||
      msg?.review?.camera ||
      msg?.after?.camera ||
      msg?.before?.camera ||
      "",
  ).trim();
}

export function extractRealtimeMessageSeverity(msg) {
  const type = String(msg?.type || "")
    .trim()
    .toLowerCase();
  return String(
    msg?.severity ||
      msg?.event?.severity ||
      msg?.event?.data?.severity ||
      msg?.review?.severity ||
      msg?.review?.data?.severity ||
      msg?.after?.severity ||
      msg?.after?.data?.severity ||
      msg?.before?.severity ||
      msg?.before?.data?.severity ||
      (type.includes("detection") ? "detection" : ""),
  )
    .trim()
    .toLowerCase();
}
