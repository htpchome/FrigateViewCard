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

export function createLiveGraceController({
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
  releaseHaDirectEngine,
  adoptHaDirectWebRtcEngine,
  resumeHaDirectEngine,
  refreshLivePresentation,
  scheduleResumeLive,
  resetMseDiagnostics,
  markMseChunk,
}) {
  const mseGracePool = new Map();
  const webRtcGracePool = new Map();
  const haDirectGracePool = new Map();
  const terminalWebRtcStates = new Set(["closed", "failed", "disconnected"]);
  let graceEntrySequence = 0;

  const isMseEngineReusable = (engine) => {
    if (!engine?.video || !engine?.ws) return false;
    const wsState = Number(engine.ws.readyState);
    return !Number.isFinite(wsState) || wsState <= 1;
  };
  const isWebRtcEngineReusable = (engine) => {
    if (!engine?.video || !engine?.pc || !engine?.ws) return false;
    const connectionState = String(engine.pc.connectionState || "")
      .trim()
      .toLowerCase();
    const iceState = String(engine.pc.iceConnectionState || "")
      .trim()
      .toLowerCase();
    const wsState = Number(engine.ws.readyState);
    const signalingClosedAfterConnect =
      engine.signalingComplete === true && wsState >= 2;
    return (
      !terminalWebRtcStates.has(connectionState) &&
      !terminalWebRtcStates.has(iceState) &&
      (!Number.isFinite(wsState) || wsState <= 1 || signalingClosedAfterConnect)
    );
  };
  const isHaDirectWebRtcEngineReusable = (engine) => {
    if (
      engine?.type !== "ha_direct" ||
      engine?.streamType !== "webrtc" ||
      !engine?.video ||
      !engine?.pc
    ) {
      return false;
    }
    const connectionState = String(engine.pc.connectionState || "")
      .trim()
      .toLowerCase();
    const iceState = String(engine.pc.iceConnectionState || "")
      .trim()
      .toLowerCase();
    return (
      !terminalWebRtcStates.has(connectionState) &&
      !terminalWebRtcStates.has(iceState)
    );
  };
  const isHaDirectHlsEngineReusable = (engine) =>
    engine?.type === "ha_direct" &&
    engine?.streamType === "hls" &&
    engine?.tagName?.toLowerCase?.() === "ha-hls-player";
  const isHaDirectEngineReusable = (engine) =>
    isHaDirectWebRtcEngineReusable(engine) ||
    isHaDirectHlsEngineReusable(engine);
  const resolveHaDirectMediaNode = (engine) =>
    engine?.streamType === "hls" ? engine : engine?.video || null;
  const resolveHaDirectVideo = (engine) =>
    engine?.streamType === "hls"
      ? engine?.shadowRoot?.querySelector?.("video") ||
        engine?.querySelector?.("video") ||
        null
      : engine?.video || null;
  let mseGraceHost = null;
  let haDirectGraceHost = null;

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

  const evictGraceHaDirectEntry = (entity) => {
    const key = normalizeGraceEntityKey(entity);
    if (!key) return;
    const entry = haDirectGracePool.get(key);
    if (!entry) return;
    entry.cancelled = true;
    if (entry.timer) clearTimeout(entry.timer);
    haDirectGracePool.delete(key);
    try {
      releaseHaDirectEngine?.(entry.engine);
      entry.engine?.remove?.();
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

  const trimHaDirectGracePool = () => {
    const maxEntries = Math.max(0, Number(graceMax) || 0);
    while (haDirectGracePool.size > maxEntries) {
      const oldestKey = haDirectGracePool.keys().next().value || "";
      if (!oldestKey) break;
      evictGraceHaDirectEntry(oldestKey);
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
  const ensureHaDirectGraceHost = () => {
    if (haDirectGraceHost?.isConnected) return haDirectGraceHost;
    const host = document.createElement("div");
    host.setAttribute("aria-hidden", "true");
    host.style.cssText =
      "position:absolute;inset:0;width:100%;height:100%;overflow:hidden;pointer-events:none;z-index:0";
    const shadowRoot = getShadowRoot?.();
    const liveStage = shadowRoot?.querySelector?.("#eng-wrap") || shadowRoot;
    liveStage?.appendChild?.(host);
    haDirectGraceHost = host;
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
  const stashHaDirectEngineForGrace = (entity, engine) => {
    const key = normalizeGraceEntityKey(entity);
    if (!key) return false;
    engine?.cancelPendingTakeover?.();
    if (!isHaDirectEngineReusable(engine)) return false;
    const mediaNode = resolveHaDirectMediaNode(engine);
    if (!mediaNode) return false;
    evictGraceHaDirectEntry(key);
    engine.deactivateRecovery?.();
    const video = resolveHaDirectVideo(engine);
    if (engine.streamType === "hls") {
      ensureHaDirectGraceHost().appendChild(mediaNode);
      mediaNode.style.cssText =
        "position:absolute;inset:0;width:100%;height:100%;display:block;pointer-events:none;background:var(--c-bg-deep)";
      if (video) {
        video.muted = true;
        video.controls = false;
        void video.play?.().catch?.(() => {});
      }
    } else {
      ensureMseGraceHost().appendChild(mediaNode);
      prepareEngineVideoForGraceHost(video);
    }
    const entry = createGraceEngineEntry({
      engine,
      graceMs,
      onExpire: () => {
        if (haDirectGracePool.get(key) !== entry) return;
        evictGraceHaDirectEntry(key);
      },
    });
    entry.graceOrder = ++graceEntrySequence;
    haDirectGracePool.set(key, entry);
    trimHaDirectGracePool();
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
  const takeGraceHaDirectEntry = (entity, streamType = "") => {
    const key = normalizeGraceEntityKey(entity);
    if (!key) return null;
    const entry = haDirectGracePool.get(key);
    if (!entry) return null;
    const expectedType = String(streamType || "")
      .trim()
      .toLowerCase();
    if (expectedType && entry.engine?.streamType !== expectedType) return null;
    if (entry.timer) clearTimeout(entry.timer);
    haDirectGracePool.delete(key);
    return entry;
  };

  const adoptGraceMseEngine = (slot, engine) => {
    if (!slot || !isMseEngineReusable(engine)) {
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
    resetMseDiagnostics?.(Date.now());
    engine.setRecoveryHandler?.((reason) => scheduleResumeLive?.(reason));
    engine.setActivityHandler?.((chunkAt) => markMseChunk?.(chunkAt));
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
    engine.setRecoveryHandler?.((reason) => scheduleResumeLive?.(reason));
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
  const adoptGraceHaDirectEngine = (slot, engine) => {
    if (!slot || !isHaDirectEngineReusable(engine)) {
      try {
        releaseHaDirectEngine?.(engine);
        engine?.remove?.();
      } catch (_) {}
      return false;
    }
    const mediaNode = resolveHaDirectMediaNode(engine);
    const video = resolveHaDirectVideo(engine);
    if (!mediaNode) return false;
    if (engine.streamType === "hls") {
      mediaNode.style.cssText =
        "width:100%;height:100%;display:block;background:var(--c-bg-deep)";
    }
    if (video) {
      configureVideoElement(
        video,
        buildVideoOptionsForView(
          "live",
          {
            muted: getStreamMuted?.(),
            controls: false,
          },
          { scopeKey: getScopeKey?.() },
        ),
      );
    }
    mountNodeIntoSlot(slot, mediaNode);
    attachVideoFit?.(engine.streamType === "hls" ? engine : video);
    setEngine?.(engine);
    if (engine.streamType === "webrtc") {
      const ownershipAdopted = adoptHaDirectWebRtcEngine?.(engine);
      if (ownershipAdopted === false) {
        setEngine?.(null, { retainPrevious: true });
        try {
          releaseHaDirectEngine?.(engine);
          mediaNode.remove?.();
        } catch (_) {}
        return false;
      }
      if (ownershipAdopted !== true) engine.activateRecovery?.();
    } else {
      engine.activateRecovery?.();
    }
    setEngineMountedMuted?.(getStreamMuted?.());
    const validateRetainedHls =
      engine.streamType === "hls" &&
      typeof resumeHaDirectEngine === "function";
    if (validateRetainedHls) {
      setActiveStreamType?.("hls");
      setStreamLoading?.(true);
      setStreamFallbackVisible?.(true, true);
    } else {
      setActiveStreamType?.(engine.streamType);
      setStreamLoading?.(false);
      setStreamFallbackVisible?.(false);
    }
    if (getRotateOverlayActive?.()) setLiveNativeControls?.(true);
    void video?.play?.().catch?.(() => {});
    if (validateRetainedHls) {
      refreshLivePresentation?.(video);
      globalThis.requestAnimationFrame?.(() =>
        refreshLivePresentation?.(video),
      );
    }
    if (validateRetainedHls) {
      let resumeResult = false;
      try {
        resumeResult = resumeHaDirectEngine(engine);
      } catch (_) {}
      void Promise.resolve(resumeResult)
        .catch(() => false)
        .then((ready) => {
          if (getEngine?.() !== engine) return;
          setStreamLoading?.(false);
          if (ready === true) {
            setStreamFallbackVisible?.(false);
          } else {
            setStreamFallbackVisible?.(true);
          }
        });
    }
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
      engine?.type === "ha_direct" &&
      engine?.streamType === activeStreamType &&
      stashHaDirectEngineForGrace(preserveLiveEntity, engine)
    ) {
      setEngine?.(null, { retainPrevious: true });
      return;
    }
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
    for (const entity of [...haDirectGracePool.keys()]) {
      evictGraceHaDirectEntry(entity);
    }
    try {
      mseGraceHost?.remove?.();
    } catch (_) {}
    mseGraceHost = null;
    try {
      haDirectGraceHost?.remove?.();
    } catch (_) {}
    haDirectGraceHost = null;
  };

  return {
    cleanupEngine,
    clearGracePool,
    takeGraceMseEntry,
    adoptGraceMseEngine,
    isMseEngineReusable,
    takeGraceWebRtcEntry,
    adoptGraceWebRtcEngine,
    isWebRtcEngineReusable,
    takeGraceHaDirectEntry,
    adoptGraceHaDirectEngine,
    isHaDirectEngineReusable,
  };
}
