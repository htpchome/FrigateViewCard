export const CAMERA_TEXT_TOKEN = "{camera}";
export const DISPLAY_TEXT_MAX_LENGTH = 24;

export const sanitizeDisplayText = (
  value,
  maxLength = DISPLAY_TEXT_MAX_LENGTH,
) =>
  String(value ?? "")
    .replace(/[\u0000-\u001F\u007F]/g, "")
    .slice(0, Math.max(0, Number(maxLength) || 0));

export const isCameraTextToken = (value) =>
  String(value || "").trim().toLowerCase() === CAMERA_TEXT_TOKEN;

export function resolveCameraAwareText({
  value,
  fallback = "",
  blankUsesCamera = false,
  gridMode = false,
  activeCamera = null,
  getCameraName,
} = {}) {
  const text = String(value || "").trim();
  const useCamera =
    isCameraTextToken(text) || (blankUsesCamera && text === "");
  if (!useCamera) return text || String(fallback || "").trim();
  if (gridMode) return "Grid";

  const cameraName =
    activeCamera && typeof getCameraName === "function"
      ? String(getCameraName(activeCamera) || "").trim()
      : "";
  return cameraName || "Camera";
}
