export function buildRecordingPlaybackPlan({
  clientId = "",
  camera = "",
  start = 0,
  end = 0,
  preferHls = false,
  maxChunkSeconds = 3600,
}) {
  const safeStart = Number(start) || 0;
  const safeEnd = Number(end) || 0;
  const chunkEnd = Math.min(safeEnd, safeStart + maxChunkSeconds);
  const recPath = `/api/frigate/${encodeURIComponent(clientId)}/recording/${encodeURIComponent(camera)}/start/${safeStart}/end/${chunkEnd}`;
  const vodBase = `/api/frigate/${encodeURIComponent(clientId)}/vod/${encodeURIComponent(camera)}/start/${safeStart}/end/${chunkEnd}`;
  const hlsCandidates = [`${vodBase}/index.m3u8`, `${vodBase}/master.m3u8`];

  return {
    chunkEnd,
    clipDurationSec: chunkEnd - safeStart,
    displayCamera: String(camera || "").replace(/_/g, " "),
    sourceCandidates: preferHls
      ? [...hlsCandidates, recPath]
      : [recPath, ...hlsCandidates],
  };
}
