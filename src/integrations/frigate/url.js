export const makeGo2rtcCacheKey = ({ clientId, cam }) => `${clientId}:${cam}`;

export const buildGo2rtcWsPath = ({ clientId, cam }) =>
  `/api/frigate/${encodeURIComponent(clientId)}/mse/api/ws?src=${encodeURIComponent(cam)}`;

export const buildGo2rtcHlsCandidates = ({ clientId, cam }) => {
  const encClient = encodeURIComponent(clientId);
  const encCam = encodeURIComponent(cam);
  return [`/api/frigate/${encClient}/go2rtc/api/stream.m3u8?src=${encCam}&mp4`];
};