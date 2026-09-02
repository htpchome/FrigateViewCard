const normalizeStreamType = (value) =>
  String(value || "")
    .trim()
    .toLowerCase()
    .replaceAll("-", "_");

export const hasHaCameraWebRtcPlaybackCapability = (capabilities) => {
  const streamTypes = capabilities?.frontend_stream_types;
  if (!Array.isArray(streamTypes)) return false;
  return streamTypes.some((value) => {
    const streamType = normalizeStreamType(value);
    return streamType === "web_rtc" || streamType === "webrtc";
  });
};
