import {
  createGraceEngineEntry,
  createGracePendingEntry,
  normalizeGraceEntityKey,
  prepareEngineVideoForGraceHost,
} from "./grace-pool.js";
import { splitPendingDestroyersByGraceMse } from "./pending-destroyers.js";
import {
  buildVideoOptionsForView,
  configureVideoElement,
  mountNodeIntoSlot,
} from "../../shared/media/video-factory.js";

export function createMseGraceController({
  graceMs,
  graceMax,
  getShadowRoot,
  getScopeKey,
  getPendingMountDestroyers,
  setPendingMountDestroyers,
  getPendingWebRtcTakeoverTimer,
  setPendingWebRtcTakeoverTimer,
  clearRotateOverlayAudioSync,
  clearRotateVideoFullscreenStyle,
  getEngine,
  setEngine,
  getActiveStreamType,
  getStreamMuted,
  setEngineMountedMuted,
  getRotateOverlayActive,
  attachVideoFit,
  setActiveStreamType,
  setStreamLoading,
  setStreamFallbackVisible,
  setLiveNativeControls,
}) {
  const mseGracePool = new Map();
  const webRtcGracePool = new Map();
  const terminalWebRtcStates = new Set(["closed", "failed", "disconnected"]);
  let graceEntrySequence = 0;

  const isWebRtcEngineReusable = (engine) => {
    if (!engine?.video || !engine?.pc || !engine?.ws) return false;
    const connectionState = String(engine.pc.connectionState || "")
      .trim()
      .toLowerCase();
    const iceState = String(engine.pc.iceConnectionState || "")
      .trim()
      .toLowerCase();
    const wsState = Number(engine.ws.readyState);
    return (
      !terminalWebRtcStates.has(connectionState) &&
      !terminalWebRtcStates.has(iceState) &&
      (!Number.isFinite(wsState) || wsState <= 1)
    );
  };
  let mseGraceHost = null;

  const evictGraceMseEntry = (entity) => {
    const key = normalizeGraceEntityKey(entity);
    if (!key) return;
    const entry = mseGracePool.get(key);
    if (!entry) return;
    entry.cancelled = true;
    if (entry.timer) clearTimeout(entry.timer);
    mseGracePool.delete(key);
    try {
      entry.engine?.destroy?.();
    } catch (_) {}
  };

  const evictGraceWebRtcEntry = (entity) => {
    const key = normalizeGraceEntityKey(entity);
    if (!key) return;
    const entry = webRtcGracePool.get(key);
    if (!entry) return;
    entry.cancelled = true;
    if (entry.timer) clearTimeout(entry.timer);
    webRtcGracePool.delete(key);
    try {
      entry.engine?.destroy?.();
    } catch (_) {}
  };

  const trimGracePool = () => {
    const maxEntries = Math.max(0, Number(graceMax) || 0);
    while (mseGracePool.size + webRtcGracePool.size > maxEntries) {
      const mseKey = mseGracePool.keys().next().value || "";
      const webRtcKey = webRtcGracePool.keys().next().value || "";
      const mseOrder = Number(mseGracePool.get(mseKey)?.graceOrder) || Infinity;
      const webRtcOrder =
        Number(webRtcGracePool.get(webRtcKey)?.graceOrder) || Infinity;
      if (mseOrder <= webRtcOrder) {
        if (!mseKey) break;
        evictGraceMseEntry(mseKey);
      } else {
        if (!webRtcKey) break;
        evictGraceWebRtcEntry(webRtcKey);
      }
    }
  };

  const ensureMseGraceHost = () => {
    if (mseGraceHost?.isConnected) return mseGraceHost;
    const host = document.createElement("div");
    host.setAttribute("aria-hidden", "true");
    host.style.cssText =
      "position:absolute;width:1px;height:1px;overflow:hidden;opacity:0;pointer-events:none;left:-9999px;top:-9999px";
    getShadowRoot?.()?.appendChild?.(host);
    mseGraceHost = host;
    return host;
  };

  const stashMseEngineForGrace = (entity, engine) => {
    const key = normalizeGraceEntityKey(entity);
    if (!key || !engine?.video || !engine?.ws) return false;
    evictGraceMseEntry(key);
    engine.deactivateRecovery?.();
    ensureMseGraceHost().appendChild(engine.video);
    prepareEngineVideoForGraceHost(engine.video);
    const entry = createGraceEngineEntry({
      engine,
      graceMs,
      onExpire: () => {
        if (mseGracePool.get(key) !== entry) return;
        evictGraceMseEntry(key);
      },
    });
    entry.graceOrder = ++graceEntrySequence;
    mseGracePool.set(key, entry);
    trimGracePool();
    return true;
  };
  const stashWebRtcEngineForGrace = (entity, engine) => {
    const key = normalizeGraceEntityKey(entity);
    if (!key || !isWebRtcEngineReusable(engine)) return false;
    evictGraceWebRtcEntry(key);
    engine.deactivateRecovery?.();
    ensureMseGraceHost().appendChild(engine.video);
    prepareEngineVideoForGraceHost(engine.video);
    const entry = createGraceEngineEntry({
      engine,
      graceMs,
      onExpire: () => {
        if (webRtcGracePool.get(key) !== entry) return;
        evictGraceWebRtcEntry(key);
      },
    });
    entry.graceOrder = ++graceEntrySequence;
    webRtcGracePool.set(key, entry);
    trimGracePool();
    return true;
  };

  const stashPendingMsePromiseForGrace = (entity, promise) => {
    const key = normalizeGraceEntityKey(entity);
    if (!key || !promise) return false;
    evictGraceMseEntry(key);
    const entry = createGracePendingEntry({
      graceMs,
      onExpire: () => {
        if (mseGracePool.get(key) !== entry) return;
        evictGraceMseEntry(key);
      },
    });
    entry.graceOrder = ++graceEntrySequence;
    entry.promise = (async () => {
      try {
        const result = await promise;
        if (entry.cancelled) {
          try {
            result?.engine?.destroy?.();
          } catch (_) {}
          return null;
        }
        if (!result?.ok || result.type !== "mse" || !result.engine) {
          evictGraceMseEntry(key);
          return null;
        }
        ensureMseGraceHost().appendChild(result.engine.video);
        prepareEngineVideoForGraceHost(result.engine.video);
        entry.engine = result.engine;
        entry.promise = null;
        return result.engine;
      } catch (_) {
        if (mseGracePool.get(key) === entry) {
          evictGraceMseEntry(key);
        }
        return null;
      }
    })();
    entry.graceOrder = ++graceEntrySequence;
    mseGracePool.set(key, entry);
    trimGracePool();
    return true;
  };

  const takeGraceMseEntry = (entity) => {
    const key = normalizeGraceEntityKey(entity);
    if (!key) return null;
    const entry = mseGracePool.get(key);
    if (!entry) return null;
    if (entry.timer) clearTimeout(entry.timer);
    mseGracePool.delete(key);
    return entry;
  };
  const takeGraceWebRtcEntry = (entity) => {
    const key = normalizeGraceEntityKey(entity);
    if (!key) return null;
    const entry = webRtcGracePool.get(key);
    if (!entry) return null;
    if (entry.timer) clearTimeout(entry.timer);
    webRtcGracePool.delete(key);
    return entry;
  };

  const adoptGraceMseEngine = (slot, engine) => {
    if (!slot || !engine?.video || !engine?.ws) return false;
    if (engine.ws.readyState > WebSocket.OPEN) {
      try {
        engine.destroy?.();
      } catch (_) {}
      return false;
    }
    configureVideoElement(
      engine.video,
      buildVideoOptionsForView(
        "live",
        {
          muted: getStreamMuted?.(),
          controls: false,
        },
        { scopeKey: getScopeKey?.() },
      ),
    );
    mountNodeIntoSlot(slot, engine.video);
    attachVideoFit?.(engine.video);
    engine.activateRecovery?.();
    setEngine?.(engine);
    setEngineMountedMuted?.(getStreamMuted?.());
    setActiveStreamType?.("mse");
    setStreamLoading?.(false);
    setStreamFallbackVisible?.(false);
    if (getRotateOverlayActive?.()) setLiveNativeControls?.(true);
    void engine.video.play?.().catch?.(() => {});
    return true;
  };
  const adoptGraceWebRtcEngine = (slot, engine) => {
    if (!slot || !isWebRtcEngineReusable(engine)) {
      try {
        engine?.destroy?.();
      } catch (_) {}
      return false;
    }
    configureVideoElement(
      engine.video,
      buildVideoOptionsForView(
        "live",
        {
          muted: getStreamMuted?.(),
          controls: false,
        },
        { scopeKey: getScopeKey?.() },
      ),
    );
    mountNodeIntoSlot(slot, engine.video);
    attachVideoFit?.(engine.video);
    engine.activateRecovery?.();
    setEngine?.(engine);
    setEngineMountedMuted?.(getStreamMuted?.());
    setActiveStreamType?.("webrtc");
    setStreamLoading?.(false);
    setStreamFallbackVisible?.(false);
    if (getRotateOverlayActive?.()) setLiveNativeControls?.(true);
    void engine.video.play?.().catch?.(() => {});
    return true;
  };

  const cleanupEngine = (options = {}) => {
    const pendingTakeoverTimer = getPendingWebRtcTakeoverTimer?.();
    if (pendingTakeoverTimer) {
      clearTimeout(pendingTakeoverTimer);
      setPendingWebRtcTakeoverTimer?.(null);
    }
    clearRotateOverlayAudioSync?.();
    clearRotateVideoFullscreenStyle?.();

    const preserveLiveEntity = String(
      options?.preserveLiveEntity || options?.preserveMseEntity || "",
    ).trim();
    const pending = getPendingMountDestroyers?.() || [];
    setPendingMountDestroyers?.([]);

    const { toPreserve, toDestroy } = splitPendingDestroyersByGraceMse({
      pendingDestroyers: pending,
      preserveMseEntity: preserveLiveEntity,
    });

    for (const pendingAttempt of toPreserve) {
      stashPendingMsePromiseForGrace(preserveLiveEntity, pendingAttempt.promise);
    }
    for (const pendingAttempt of toDestroy) {
      try {
        pendingAttempt?.destroy?.();
      } catch (_) {}
    }

    const engine = getEngine?.();
    if (!engine) return;
    const activeStreamType = String(getActiveStreamType?.() || "")
      .trim()
      .toLowerCase();
    if (
      preserveLiveEntity &&
      activeStreamType === "webrtc" &&
      stashWebRtcEngineForGrace(preserveLiveEntity, engine)
    ) {
      setEngine?.(null);
      return;
    }
    if (
      preserveLiveEntity &&
      activeStreamType === "mse" &&
      stashMseEngineForGrace(preserveLiveEntity, engine)
    ) {
      setEngine?.(null);
      return;
    }
    try {
      if (typeof engine.destroy === "function") engine.destroy();
      if (engine.ws && typeof engine.ws.close === "function") engine.ws.close();
      if (engine.pc && typeof engine.pc.close === "function") engine.pc.close();
    } catch (_) {}
    setEngine?.(null);
  };

  const clearGracePool = () => {
    for (const entity of [...mseGracePool.keys()]) {
      evictGraceMseEntry(entity);
    }
    for (const entity of [...webRtcGracePool.keys()]) {
      evictGraceWebRtcEntry(entity);
    }
    try {
      mseGraceHost?.remove?.();
    } catch (_) {}
    mseGraceHost = null;
  };

  return {
    cleanupEngine,
    clearGracePool,
    takeGraceMseEntry,
    adoptGraceMseEngine,
    takeGraceWebRtcEntry,
    adoptGraceWebRtcEngine,
  };
}
