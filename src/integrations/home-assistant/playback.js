export function buildHaCameraStreamState(
  hass,
  entity,
  streamType = null,
  fallbackStreamType = "webrtc",
) {
  const raw = hass?.states?.[entity];
  if (!raw) return null;
  const attrs = { ...raw.attributes };
  attrs.frontend_stream_type = streamType || fallbackStreamType;
  return { ...raw, attributes: attrs };
}

export function createHaCameraStreamElement({
  hass,
  stateObj,
  muted = false,
  controls = false,
  defaultMuted,
  styleText = "",
} = {}) {
  if (!hass || !stateObj) return null;
  const stream = document.createElement("ha-camera-stream");
  stream.hass = hass;
  stream.stateObj = stateObj;
  stream.controls = controls;
  stream.muted = muted;
  if (defaultMuted !== undefined) {
    stream.defaultMuted = defaultMuted;
  }
  if (styleText) {
    stream.style.cssText = styleText;
  }
  return stream;
}
