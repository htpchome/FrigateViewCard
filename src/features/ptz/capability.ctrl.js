import { mkCamState } from "../../helpers.js";
import { fetchFrigatePtzInfo } from "../../integrations/frigate/ptz-info.js";

export const createPtzCapabilityController = (host) => {
  const activeInfo = () =>
    host._camCache[host._activeCam?.entity]?.ptzInfo || null;

  const ensureInfo = async (entity) => {
    const targetEntity = String(entity || "").trim();
    if (!targetEntity) return null;
    if (!host._camCache[targetEntity]) {
      host._camCache[targetEntity] = mkCamState();
    }
    const cache = host._camCache[targetEntity];
    if (cache.ptzInfoFetched) return cache.ptzInfo;
    if (cache.ptzInfoPromise) return cache.ptzInfoPromise;

    await host._discoverOne(targetEntity);
    if (!cache.discovered || !cache.clientId || !cache.cam) {
      cache.ptzInfoFetched = true;
      return null;
    }

    cache.ptzInfoPromise = (async () => {
      try {
        cache.ptzInfo = await fetchFrigatePtzInfo({
          request: (message) => host._ws(message),
          instanceId: cache.clientId,
          camera: cache.cam,
        });
      } catch (error) {
        console.warn("[Frigate] PTZ info fetch failed", error);
        cache.ptzInfo = null;
      } finally {
        cache.ptzInfoFetched = true;
        cache.ptzInfoPromise = null;
        host._camCache[targetEntity] = cache;
        if (
          host._tab === "controls" &&
          host._activeCam?.entity === targetEntity
        ) {
          host._renderList();
        }
      }
      return cache.ptzInfo;
    })();

    return cache.ptzInfoPromise;
  };

  const ensureActiveInfo = async () => {
    const entity = host._activeCam?.entity;
    if (!entity || !host._isControlsButtonVisible()) return null;
    return ensureInfo(entity);
  };

  const resolveContext = async () => {
    const activeCamera = host._activeCam;
    const entity = String(activeCamera?.entity || "").trim();
    if (!entity) return null;
    const camera = {
      ...activeCamera,
      ...(activeCamera?.ptz && typeof activeCamera.ptz === "object"
        ? { ptz: { ...activeCamera.ptz } }
        : {}),
    };
    const ptzInfo =
      activeInfo() || (await ensureActiveInfo());
    if (String(host._activeCam?.entity || "").trim() !== entity) {
      return null;
    }
    return { camera, ptzInfo };
  };

  return {
    activeInfo,
    ensureActiveInfo,
    resolveContext,
  };
};
