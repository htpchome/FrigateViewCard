import {
  buildGo2RtcTransportState,
  resolveGo2RtcEntity,
} from "./camera-context.js";
import {
  buildGo2rtcHlsCandidates,
  buildGo2rtcWsPath,
  makeGo2rtcCacheKey,
} from "./url.js";
import {
  buildGo2RtcHlsProbeResult,
  buildSignedGo2RtcWebSocketUrl,
  signHomeAssistantPath,
} from "./bootstrap.js";
import {
  getFreshCachedValue,
  isM3u8Response,
  requiresNestedSignedHlsRequests,
  setCachedValue,
} from "../../shared/media/url-utils.js";

export const GO2RTC_CACHE_TTL_MS = Object.freeze({
  wsSignedPath: 55 * 60 * 1000,
  hlsPlaylist: 30 * 60 * 1000,
  hlsNegative: 30 * 60 * 1000,
});

export function createGo2RtcResolver({
  getHass,
  getConfig,
  getActiveEntity,
  getCamCache,
  defaultConnectionType,
  normalizeCameraConnectionType,
  createCameraState,
  discoverEntity,
  supportsNativeHlsPlayback,
  getOrigin = () => window.location.origin,
  getNowMs = () => Date.now(),
  fetchImpl = fetch,
}) {
  const wsUrlCache = new Map();
  const wsUrlInFlight = new Map();
  const hlsUrlCache = new Map();
  const hlsProbeInFlight = new Map();

  const resolveEntity = (entity = "") => {
    return resolveGo2RtcEntity({
      entity,
      activeEntity: getActiveEntity(),
      config: getConfig(),
      defaultConnectionType,
      normalizeCameraConnectionType,
    });
  };

  const resolveMountRequest = (options = {}) => {
    return {
      entity: resolveEntity(options?.entity),
      abortSignal: options?.abortSignal || null,
      commit: options.commit !== false,
    };
  };

  const resolveTransportStateForEntity = async (entity) => {
    const targetEntity = resolveEntity(entity);
    if (!targetEntity) return null;
    await discoverEntity(targetEntity);
    return buildGo2RtcTransportState({
      entity,
      activeEntity: getActiveEntity(),
      config: getConfig(),
      defaultConnectionType,
      normalizeCameraConnectionType,
      camCache: getCamCache(),
      createCameraState,
      makeGo2rtcCacheKey,
      nowMs: getNowMs(),
    });
  };

  const probeHlsCandidates = async (candidates, cacheKey) => {
    for (const path of candidates) {
      const signedPath = await signHomeAssistantPath({
        hass: getHass(),
        path,
      });
      if (requiresNestedSignedHlsRequests({ rawPath: path, signedPath })) {
        continue;
      }
      const manifestUrl = `${getOrigin()}${signedPath}`;
      try {
        const resp = await fetchImpl(manifestUrl, {
          method: "GET",
          cache: "no-store",
          credentials: "same-origin",
        });
        if (!resp.ok) continue;
        if (
          isM3u8Response({
            contentType: resp.headers.get("content-type") || "",
            url: manifestUrl,
          })
        ) {
          const result = await buildGo2RtcHlsProbeResult({
            rawPath: path,
            signedPath,
            manifestUrl,
          });
          if (!result) continue;
          if (result?.cacheable) {
            setCachedValue({
              cacheMap: hlsUrlCache,
              cacheKey,
              url: result.url,
              ttlMs: GO2RTC_CACHE_TTL_MS.hlsPlaylist,
              nowMs: getNowMs(),
            });
          }
          return result;
        }
      } catch (_) {}
    }

    setCachedValue({
      cacheMap: hlsUrlCache,
      cacheKey,
      url: null,
      ttlMs: GO2RTC_CACHE_TTL_MS.hlsNegative,
      nowMs: getNowMs(),
    });
    return null;
  };

  const websocketUrlForEntity = async (entity) => {
    const state = await resolveTransportStateForEntity(entity);
    if (!state) return null;

    const { clientId, cam, cacheKey, nowMs } = state;
    const cachedUrl = getFreshCachedValue({
      cacheMap: wsUrlCache,
      cacheKey,
      nowMs,
    });
    if (cachedUrl) return cachedUrl;

    const inFlight = wsUrlInFlight.get(cacheKey);
    if (inFlight) return inFlight;

    const wsUrlPromise = (async () => {
      const path = buildGo2rtcWsPath({ clientId, cam });
      const wsUrl = await buildSignedGo2RtcWebSocketUrl({
        hass: getHass(),
        path,
        origin: getOrigin(),
      });
      setCachedValue({
        cacheMap: wsUrlCache,
        cacheKey,
        url: wsUrl,
        ttlMs: GO2RTC_CACHE_TTL_MS.wsSignedPath,
        nowMs,
      });
      return wsUrl;
    })().finally(() => {
      wsUrlInFlight.delete(cacheKey);
    });

    wsUrlInFlight.set(cacheKey, wsUrlPromise);
    return wsUrlPromise;
  };

  const hlsUrlForEntity = async (entity = "") => {
    const state = await resolveTransportStateForEntity(entity);
    if (!state) return null;
    if (!supportsNativeHlsPlayback()) return null;

    const { clientId, cam, cacheKey, nowMs } = state;
    const cachedUrl = getFreshCachedValue({
      cacheMap: hlsUrlCache,
      cacheKey,
      nowMs,
    });
    if (cachedUrl !== undefined) {
      return cachedUrl == null ? null : { url: cachedUrl, destroy: null };
    }

    const inFlight = hlsProbeInFlight.get(cacheKey);
    if (inFlight) return inFlight;

    const candidates = buildGo2rtcHlsCandidates({ clientId, cam });
    const probePromise = probeHlsCandidates(candidates, cacheKey).finally(
      () => {
        hlsProbeInFlight.delete(cacheKey);
      },
    );

    hlsProbeInFlight.set(cacheKey, probePromise);
    return probePromise;
  };

  return {
    resolveMountRequest,
    websocketUrlForEntity,
    hlsUrlForEntity,
  };
}
