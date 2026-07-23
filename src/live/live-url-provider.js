export const makeGo2rtcCacheKey = ({ clientId, cam }) => `${clientId}:${cam}`;

export const buildGo2rtcWsPath = ({ clientId, cam }) =>
  `/api/frigate/${encodeURIComponent(clientId)}/mse/api/ws?src=${encodeURIComponent(cam)}`;

export const buildGo2rtcHlsCandidates = ({ clientId, cam }) => {
  const encClient = encodeURIComponent(clientId);
  const encCam = encodeURIComponent(cam);
  return [
    `/api/frigate/${encClient}/hls/${encCam}/index.m3u8`,
    `/api/frigate/${encClient}/live/${encCam}/index.m3u8`,
    `/api/frigate/${encClient}/vod/${encCam}/index.m3u8`,
  ];
};

export const toAbsoluteSignedUrl = ({ signedPath, origin }) =>
  signedPath.startsWith("http") ? signedPath : `${origin}${signedPath}`;

export const toWebSocketUrl = (httpUrl) => httpUrl.replace(/^http/i, "ws");

export const getFreshCachedValue = ({ cacheMap, cacheKey, nowMs }) => {
  const entry = cacheMap.get(cacheKey);
  if (entry && entry.exp > nowMs) return entry.url ?? null;
  return undefined;
};

export const setCachedValue = ({ cacheMap, cacheKey, url, ttlMs, nowMs }) => {
  cacheMap.set(cacheKey, {
    url,
    exp: nowMs + ttlMs,
  });
};

export const isM3u8Response = ({ contentType, url }) => {
  const ct = String(contentType || "").toLowerCase();
  return (
    ct.includes("application/vnd.apple.mpegurl") ||
    ct.includes("application/x-mpegurl") ||
    ct.includes("audio/mpegurl") ||
    String(url || "")
      .toLowerCase()
      .includes(".m3u8")
  );
};
