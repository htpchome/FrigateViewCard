export const isAbsoluteOrDataUrl = (url) =>
  /^https?:\/\//i.test(url) || String(url || "").startsWith("data:");

export const FALLBACK_SIGNED_URL_TTL_MS = 55 * 60 * 1000;

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
  ttlMs = FALLBACK_SIGNED_URL_TTL_MS,
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

export const createFallbackSourceResolvers = ({
  canCallWs,
  signedPathResolver,
  cacheMap,
  stateMap,
  origin,
  ttlMs = FALLBACK_SIGNED_URL_TTL_MS,
  nowMsProvider = () => Date.now(),
}) => ({
  loadPrimary: async (entity) =>
    await resolveSignedFallbackUrl({
      entity,
      canCallWs,
      signedPathResolver,
      cacheMap,
      nowMs: nowMsProvider(),
      origin,
      ttlMs,
    }),
  loadAlt: (entity) =>
    resolveEntityPictureFallbackUrl({
      entity,
      stateMap,
      origin,
    }),
});

export const resolveFallbackOrigin = ({ origin, defaultOrigin }) =>
  origin || defaultOrigin || "";

export const resolveFallbackOriginForCard = ({ card, origin }) =>
  resolveFallbackOrigin({
    origin,
    defaultOrigin: card?._fallbackOrigin,
  });

export const createFallbackSourceResolversForCard = ({ card, origin }) => {
  const resolvedOrigin = resolveFallbackOriginForCard({ card, origin });
  if (!card) {
    return {
      loadPrimary: async () => "",
      loadAlt: () => "",
    };
  }

  return createFallbackSourceResolvers({
    canCallWs: !!card._hass?.callWS,
    signedPathResolver: async (path) => await card._signed(path),
    cacheMap: card._fallbackImgUrlCache,
    stateMap: card._hass?.states,
    origin: resolvedOrigin,
  });
};

export const resolveFallbackSourceResolversForCard = ({ card, origin }) =>
  createFallbackSourceResolversForCard({
    card,
    origin,
  });

export const loadFallbackPrimaryForCard = async ({ card, entity, origin }) => {
  const resolvers = resolveFallbackSourceResolversForCard({
    card,
    origin,
  });
  return await resolvers.loadPrimary(entity);
};

export const loadFallbackAltForCard = ({ card, entity, origin }) => {
  const resolvers = resolveFallbackSourceResolversForCard({
    card,
    origin,
  });
  return resolvers.loadAlt(entity);
};
