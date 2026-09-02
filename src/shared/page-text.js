export const CAMERA_TEXT_TOKEN = "{camera}";

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
