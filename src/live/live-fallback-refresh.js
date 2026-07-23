import { resolveFallbackDisplaySource } from "./live-fallback-image.js";

export const nextFallbackRequestId = (currentRequestId) =>
  Number(currentRequestId || 0) + 1;

export const getFallbackRefreshElements = (shadowRoot) => ({
  imgEl: shadowRoot?.querySelector?.("#stream-fallback-img") || null,
  statusEl: shadowRoot?.querySelector?.("#stream-fallback-status") || null,
});

export const canRefreshFallbackImage = ({ imgEl }) => !!imgEl;

export const resolveFallbackRefreshEntity = (activeCam) =>
  String(activeCam?.entity || "").trim();

export const loadPrimaryFallbackSource = async ({ entity, loadPrimary }) => {
  if (!entity) return "";
  return await loadPrimary(entity);
};

export const resolveAltFallbackSource = ({ entity, loadAlt }) => {
  if (!entity) return "";
  return loadAlt(entity);
};

export const resolveFallbackRefreshSources = ({ primarySrc, altSrc }) => {
  const outcome = buildFallbackRefreshOutcome({
    primarySrc,
    altSrc,
  });
  return {
    primarySrc,
    altSrc,
    src: outcome.src,
    hasSource: outcome.hasSource,
  };
};

export const isFallbackRefreshStale = ({ requestId, activeRequestId }) =>
  requestId !== activeRequestId;

export const buildFallbackRefreshOutcome = ({ primarySrc, altSrc }) => {
  const src = resolveFallbackDisplaySource({
    primarySrc,
    altSrc,
  });
  return {
    src,
    hasSource: !!src,
  };
};
