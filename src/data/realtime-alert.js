export function parseRealtimeAlertMessage({ host, msg, checkSeverity = true }) {
  const incomingCam = host?._extractRealtimeMessageCamera(msg);
  if (!incomingCam) return null;

  const cam = host?._cameraEntityForIncomingCamera(incomingCam);
  if (!cam) return null;

  const severity = host?._extractRealtimeMessageSeverity(msg);
  const type = String(msg?.type || "")
    .trim()
    .toLowerCase();

  if (checkSeverity && !host?._shouldHandleSlideshowReview(cam, severity)) {
    return null;
  }

  return { cam, severity, type };
}
