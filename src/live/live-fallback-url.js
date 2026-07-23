export const isAbsoluteOrDataUrl = (url) =>
  /^https?:\/\//i.test(url) || String(url || "").startsWith("data:");

export const toAbsoluteLocalUrl = ({ url, origin }) => {
  if (!url) return "";
  return isAbsoluteOrDataUrl(url) ? url : `${origin}${url}`;
};

export const getCachedEntityUrl = ({ cacheMap, entity, nowMs }) => {
  const cached = cacheMap?.get?.(entity);
  if (cached && cached.url && cached.exp > nowMs) return cached.url;
  return "";
};

export const setCachedEntityUrl = ({ cacheMap, entity, url, ttlMs, nowMs }) => {
  if (!cacheMap || !entity || !url) return;
  cacheMap.set(entity, {
    url,
    exp: nowMs + ttlMs,
  });
};

export const resolveSignedFallbackUrl = async ({
  entity,
  canCallWs,
  signedPathResolver,
  cacheMap,
  nowMs,
  origin,
  ttlMs = 55 * 60 * 1000,
}) => {
  if (!entity) return "";
  if (!canCallWs) return "";

  const cached = getCachedEntityUrl({
    cacheMap,
    entity,
    nowMs,
  });
  if (cached) return cached;

  const basePath = `/api/camera_proxy/${entity}`;
  const signedPath = await signedPathResolver(basePath);
  const abs = toAbsoluteLocalUrl({
    url: signedPath,
    origin,
  });

  setCachedEntityUrl({
    cacheMap,
    entity,
    url: abs,
    ttlMs,
    nowMs,
  });

  return abs;
};

export const resolveEntityPictureFallbackUrl = ({
  entity,
  stateMap,
  origin,
}) => {
  if (!entity) return "";
  const state = stateMap?.[entity];
  const pic = state?.attributes?.entity_picture || "";
  if (!pic) return "";
  return toAbsoluteLocalUrl({
    url: pic,
    origin,
  });
};
