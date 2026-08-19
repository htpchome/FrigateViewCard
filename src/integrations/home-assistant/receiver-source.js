export function resolveAbsoluteReceiverSourceUrl(
  sourceUrl = "",
  baseUrl = "",
) {
  const normalized = String(sourceUrl || "").trim();
  if (!normalized || normalized.startsWith("blob:")) return "";
  try {
    return new URL(normalized, baseUrl).href;
  } catch (_) {
    return "";
  }
}

export async function resolveHomeAssistantCameraHlsSource({
  hass,
  cameraEntity = "",
  baseUrl = "",
} = {}) {
  if (!cameraEntity || typeof hass?.callWS !== "function") {
    return {
      ok: false,
      message: "The active Home Assistant camera is not available.",
    };
  }
  try {
    const result = await hass.callWS({
      type: "camera/stream",
      entity_id: cameraEntity,
      format: "hls",
    });
    const streamUrl =
      typeof result === "string" ? result : result?.url || result?.path || "";
    const url = resolveAbsoluteReceiverSourceUrl(streamUrl, baseUrl);
    if (!url) {
      return {
        ok: false,
        message: "Home Assistant did not return a receiver-safe HLS URL.",
      };
    }
    return {
      ok: true,
      url,
      contentType: "application/vnd.apple.mpegurl",
      streamType: "LIVE",
      ttlMs: 4 * 60 * 1000,
    };
  } catch (_) {
    return {
      ok: false,
      message: "Home Assistant could not prepare the live HLS stream.",
    };
  }
}
