const unavailableStates = new Set(["unavailable", "unknown"]);

export function resolveHomeAssistantMediaPlayers(states = {}) {
  return Object.entries(states)
    .filter(([entityId, state]) => {
      if (!entityId.startsWith("media_player.")) return false;
      return !unavailableStates.has(String(state?.state || "").toLowerCase());
    })
    .map(([entityId, state]) => ({
      entityId,
      name: String(state?.attributes?.friendly_name || entityId),
      state: String(state?.state || ""),
    }))
    .sort((left, right) =>
      left.name.localeCompare(right.name, undefined, { sensitivity: "base" }),
    );
}

export function buildHomeAssistantCameraStreamRequest({
  cameraEntity = "",
  mediaPlayerEntity = "",
} = {}) {
  if (!cameraEntity || !mediaPlayerEntity) return null;
  return {
    domain: "camera",
    service: "play_stream",
    serviceData: {
      media_player: mediaPlayerEntity,
    },
    target: {
      entity_id: cameraEntity,
    },
  };
}

export function buildHomeAssistantMediaRequest({
  mediaPlayerEntity = "",
  mediaUrl = "",
  contentType = "video/mp4",
} = {}) {
  if (!mediaPlayerEntity || !mediaUrl) return null;
  return {
    domain: "media_player",
    service: "play_media",
    serviceData: {
      media_content_id: mediaUrl,
      media_content_type: contentType,
    },
    target: {
      entity_id: mediaPlayerEntity,
    },
  };
}

export function resolveHomeAssistantReceiverUrl(path = "", baseUrl = "") {
  const normalizedPath = String(path || "").trim();
  if (!normalizedPath) return "";
  try {
    return new URL(normalizedPath, baseUrl).href;
  } catch (_) {
    return normalizedPath;
  }
}
