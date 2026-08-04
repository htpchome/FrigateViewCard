export const makeGo2rtcCacheKey = ({ clientId, cam }) => `${clientId}:${cam}`;

export const buildGo2rtcWsPath = ({ clientId, cam }) =>
  `/api/frigate/${encodeURIComponent(clientId)}/mse/api/ws?src=${encodeURIComponent(cam)}`;

export const buildGo2rtcHlsCandidates = ({ clientId, cam }) => {
  const encClient = encodeURIComponent(clientId);
  const encCam = encodeURIComponent(cam);
  // Home Assistant's Frigate integration proxies go2rtc HTTP endpoints through
  // /api/frigate/<instance>/go2rtc/*. Use the supported go2rtc HLS playlist
  // endpoint instead of probing nonexistent /hls|live|vod camera manifest
  // routes on the integration proxy.
  return [`/api/frigate/${encClient}/go2rtc/api/stream.m3u8?src=${encCam}&mp4`];
};

export const toAbsoluteSignedUrl = ({ signedPath, origin }) =>
  signedPath.startsWith("http") ? signedPath : `${origin}${signedPath}`;

export const toWebSocketUrl = (httpUrl) => httpUrl.replace(/^http/i, "ws");

export const requiresNestedSignedHlsRequests = ({ rawPath, signedPath }) => {
  const raw = String(rawPath || "").trim();
  const signed = String(signedPath || "").trim();
  if (!raw || !signed) return false;
  if (raw === signed) return false;
  return signed.includes("authSig=");
};

export const isM3u8Url = (url = "") =>
  String(url || "")
    .toLowerCase()
    .includes(".m3u8");

export const rewriteM3u8Manifest = async ({ manifestText, rewriteUri }) => {
  const lines = String(manifestText || "").split(/\r?\n/);
  const rewritten = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) {
      rewritten.push(line);
      continue;
    }

    if (!trimmed.startsWith("#")) {
      rewritten.push(await rewriteUri(trimmed));
      continue;
    }

    let nextLine = line;
    const matches = [...line.matchAll(/URI="([^"]+)"/g)];
    for (const match of matches) {
      const originalUri = match[1];
      const replacementUri = await rewriteUri(originalUri);
      nextLine = nextLine.replace(
        `URI="${originalUri}"`,
        `URI="${replacementUri}"`,
      );
    }
    rewritten.push(nextLine);
  }

  return rewritten.join("\n");
};

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
