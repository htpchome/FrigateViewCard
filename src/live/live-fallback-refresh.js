import { resolveFallbackDisplaySource } from "./live-fallback-image.js";

export const nextFallbackRequestId = (currentRequestId) =>
  Number(currentRequestId || 0) + 1;

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
