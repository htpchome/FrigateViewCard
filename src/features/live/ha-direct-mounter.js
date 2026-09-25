import {
  createHaHlsPlayerElement,
  findActiveHaCameraStreamVideo,
} from "../../integrations/home-assistant/playback.js";
import { createHaDirectWebRtcPlayback } from "../../integrations/home-assistant/webrtc-playback.js";
import {
  buildHaDirectMountPlan,
  resolveHaDirectFailedState,
  resolveHaDirectMountUnavailableState,
  resolveHaDirectReadyState,
} from "./startup-policy.js";

const normalizeHaDirectStreamType = (value) => {
  const normalized = String(value || "")
    .trim()
    .toLowerCase()
    .replaceAll("-", "_");
  return normalized === "hls" ? "hls" : "webrtc";
};

const HA_DIRECT_HIDDEN_ATTEMPT_STYLE =
  "position:absolute;width:1px;height:1px;overflow:hidden;opacity:0;pointer-events:none;left:-9999px;top:-9999px;background:var(--c-bg-deep)";
const HA_DIRECT_VISIBLE_HLS_ATTEMPT_STYLE =
  "position:absolute;inset:0;z-index:1;width:100%;height:100%;display:block;pointer-events:none;background:var(--c-bg-deep)";
const HA_DIRECT_VISIBLE_STYLE =
  "width:100%;height:100%;display:block;background:var(--c-bg-deep)";
const HA_DIRECT_TIME_RECOVERY_MIN_ADVANCES = 2;
const HA_DIRECT_TIME_RECOVERY_MIN_PROGRESS_SECONDS = 0.05;

export function createHaDirectMounter({
  getHass,
  getPreferredStreamType,
  getStreamMuted,
  getRotateOverlayActive,
  isCurrentEngine,
  waitForStreamStart,
  assignCommittedEngine,
  onCommittedMediaReady,
  onCommittedStream,
  applyResolvedStreamUiState,
  setLiveNativeControls,
  scheduleResumeLive,
  scopeKey,
}) {
  const mediaBindings = new WeakMap();
  let releaseBarrier = Promise.resolve();

  const rememberRelease = (releaseResult) => {
    if (!releaseResult?.then) return;
    const pendingRelease = Promise.resolve(releaseResult).catch(() => {});
    releaseBarrier = Promise.all([releaseBarrier, pendingRelease]).then(
      () => undefined,
    );
  };

  const release = (engine) => {
    const binding = mediaBindings.get(engine);
    if (!binding) {
      if (engine?.type === "ha_direct" && engine?.streamType === "webrtc") {
        rememberRelease(engine.destroy?.());
      }
      return;
    }
    binding.disposed = true;
    binding.revision += 1;
    binding.cleanupRecovery?.();
    binding.abortController.abort();
    binding.fallbackAbortController?.abort?.();
    binding.fallbackEngine?.remove?.();
    const takeoverEngine = binding.takeoverEngine || null;
    binding.fallbackAbortController = null;
    binding.fallbackEngine = null;
    binding.takeoverEngine = null;
    if (engine) engine.cancelPendingTakeover = null;
    engine.removeEventListener?.("load", binding.reconcile, true);
    engine.removeEventListener?.("streams", binding.onStreams, true);
    mediaBindings.delete(engine);
    if (takeoverEngine && takeoverEngine !== engine) {
      release(takeoverEngine);
    }
    rememberRelease(engine?.destroy?.());
  };

  const awaitUpdate = async (element) => {
    try {
      await element?.updateComplete;
    } catch (_) {}
  };

  const applyReady = (engine, streamType) => {
    if (!isCurrentEngine(engine)) return;
    engine.markStarted?.();
    onCommittedStream?.(streamType);
    const readyState = resolveHaDirectReadyState({
      rotateOverlayActive: getRotateOverlayActive(),
      isCurrentEngine: true,
      waitSucceeded: true,
    });
    applyResolvedStreamUiState(readyState);
  };

  const applyFailed = (engine) => {
    if (!isCurrentEngine(engine)) return;
    onCommittedStream?.("snapshot");
    applyResolvedStreamUiState(resolveHaDirectFailedState());
  };

  const bindHlsMedia = (engine) => {
    const binding = {
      disposed: false,
      revision: 0,
      failed: false,
      failureRevision: 0,
      recoveryVideo: null,
      cleanupRecovery: () => {},
      abortController: new AbortController(),
      reconcile: null,
      onStreams: null,
      takeoverEngine: null,
    };
    const watchRecovery = (video) => {
      if (binding.recoveryVideo === video) return;
      binding.cleanupRecovery();
      if (!video) return;
      binding.recoveryVideo = video;
      let active = true;
      let frameId = null;
      const initialTime = Number(video.currentTime);
      let lastTime = Number.isFinite(initialTime) ? initialTime : null;
      let advancingSamples = 0;
      let progressStartTime = null;
      const isActive = () =>
        active && !binding.disposed && binding.failed &&
        isCurrentEngine(engine) &&
        findActiveHaCameraStreamVideo(engine) === video;
      const hasUsablePlaybackState = () => {
        const playbackRate = Number(video.playbackRate);
        return !video.paused && !video.ended && !video.seeking &&
          Number(video.readyState) >= 2 && Number(video.videoWidth) > 0 &&
          (!Number.isFinite(playbackRate) || playbackRate > 0);
      };
      const resetTimeEvidence = (time) => {
        lastTime = Number.isFinite(time) ? time : null;
        advancingSamples = 0;
        progressStartTime = null;
      };
      const recover = () => {
        if (!isActive()) return;
        if (!hasUsablePlaybackState()) return;
        binding.failed = false;
        binding.cleanupRecovery();
        applyReady(engine, "hls");
      };
      const onTimeUpdate = () => {
        if (!isActive()) return;
        const time = Number(video.currentTime);
        if (!Number.isFinite(time) || !hasUsablePlaybackState()) {
          resetTimeEvidence(time);
          return;
        }
        if (lastTime == null || time < lastTime) {
          resetTimeEvidence(time);
          return;
        }
        if (time === lastTime) return;
        advancingSamples += 1;
        if (progressStartTime == null) progressStartTime = time;
        lastTime = time;
        if (
          advancingSamples >= HA_DIRECT_TIME_RECOVERY_MIN_ADVANCES &&
          time - progressStartTime >=
            HA_DIRECT_TIME_RECOVERY_MIN_PROGRESS_SECONDS
        ) {
          recover();
        }
      };
      const onFrame = () => {
        frameId = null;
        if (!isActive()) return;
        recover();
        if (isActive()) frameId = video.requestVideoFrameCallback(onFrame);
      };
      binding.cleanupRecovery = () => {
        active = false;
        if (frameId != null) video.cancelVideoFrameCallback?.(frameId);
        video.removeEventListener?.("timeupdate", onTimeUpdate);
        binding.recoveryVideo = null;
        binding.cleanupRecovery = () => {};
      };
      // A lone time jump can be a seek or stale buffered state. WKWebView may
      // omit frame callbacks, so require sustained playback as the fallback.
      video.addEventListener?.("timeupdate", onTimeUpdate);
      if (typeof video.requestVideoFrameCallback === "function") {
        frameId = video.requestVideoFrameCallback(onFrame);
      }
    };
    binding.fail = () => {
      if (binding.disposed || !isCurrentEngine(engine)) return;
      if (!binding.failed) {
        binding.failed = true;
        binding.failureRevision += 1;
        applyFailed(engine);
      }
      binding.reconcile();
    };
    binding.reconcile = () => {
      const revision = ++binding.revision;
      void (async () => {
        await awaitUpdate(engine);
        if (
          binding.disposed ||
          revision !== binding.revision ||
          !isCurrentEngine(engine)
        ) {
          return;
        }
        const video = findActiveHaCameraStreamVideo(engine);
        if (video) onCommittedMediaReady?.(engine, video);
        if (binding.failed) watchRecovery(video);
      })();
    };
    binding.onStreams = (event) => {
      if (event?.detail?.hasVideo === false) binding.fail();
      else binding.reconcile();
    };
    mediaBindings.set(engine, binding);
    engine.addEventListener?.("load", binding.reconcile, true);
    engine.addEventListener?.("streams", binding.onStreams, true);
    binding.reconcile();
    return binding;
  };

  const createWebRtcBinding = (engine) => {
    const binding = {
      disposed: false,
      revision: 0,
      abortController: new AbortController(),
      reconcile: null,
      onStreams: null,
      fallbackAbortController: null,
      fallbackEngine: null,
      takeoverEngine: null,
    };
    mediaBindings.set(engine, binding);
    return binding;
  };

  const detachWebRtcForHandoff = (engine) => {
    const binding = mediaBindings.get(engine);
    if (
      engine?.type !== "ha_direct" ||
      engine?.streamType !== "webrtc" ||
      !engine?.video ||
      !engine?.pc ||
      !binding ||
      binding.disposed ||
      binding.fallbackEngine ||
      binding.fallbackAbortController ||
      binding.takeoverEngine
    ) {
      return false;
    }
    binding.disposed = true;
    binding.revision += 1;
    binding.abortController.abort();
    mediaBindings.delete(engine);
    engine.deactivateRecovery?.();
    return true;
  };

  const adoptRetainedWebRtcEngine = (engine) => {
    if (
      engine?.type !== "ha_direct" ||
      engine?.streamType !== "webrtc" ||
      !engine?.video ||
      !engine?.pc
    ) {
      return false;
    }
    const existingBinding = mediaBindings.get(engine);
    if (!existingBinding || existingBinding.disposed) {
      createWebRtcBinding(engine);
    }
    engine.setRecoveryHandler?.((reason) => scheduleResumeLive?.(reason));
    engine.activateRecovery?.();
    return true;
  };

  const tryMount = async (slot, startup = null, options = {}) => {
    const preferredStreamType = getPreferredStreamType();
    const haDirectPlan = buildHaDirectMountPlan({
      startup: startup || {},
      preferredStreamType,
    });
    const initialStreamType = normalizeHaDirectStreamType(
      haDirectPlan.streamType,
    );
    const commit = options.commit !== false;
    const entity = String(options.entity || "").trim();
    const hass = getHass();
    if (!entity) return false;
    if (!hass?.states?.[entity]) {
      if (commit) {
        applyResolvedStreamUiState(resolveHaDirectMountUnavailableState());
      }
      return false;
    }

    const replaceSlotContent = (node) => {
      slot.innerHTML = "";
      slot.appendChild(node);
    };

    const createHlsEngine = (styleText = "") => {
      const engine = createHaHlsPlayerElement({
        hass,
        entity,
        controls: false,
        muted: options?.muted ?? getStreamMuted(),
        defaultMuted: options.defaultMuted,
        fitMode: "contain",
        styleText: styleText || options.styleText || HA_DIRECT_VISIBLE_STYLE,
      });
      if (!engine) return false;
      engine.type = "ha_direct";
      engine.streamType = "hls";
      return engine;
    };

    const mountHls = () => {
      const engine = createHlsEngine();
      if (!engine) return false;
      replaceSlotContent(engine);
      if (!commit) {
        return { ok: true, type: "hls", engine, slot };
      }

      assignCommittedEngine(engine);
      const binding = bindHlsMedia(engine);
      if (getRotateOverlayActive()) setLiveNativeControls(true);
      void (async () => {
        const failureRevision = binding.failureRevision;
        const ready = await waitForStreamStart(engine, haDirectPlan.waitMs, {
          ...haDirectPlan.waitOptions,
          abortSignal: binding.abortController.signal,
          resolveVideo: () => findActiveHaCameraStreamVideo(engine),
        });
        if (binding.disposed || !isCurrentEngine(engine)) return;
        // A stream error transfers readiness ownership to the recovery watcher.
        // The older startup result must not undo its newer failure or recovery.
        if (failureRevision !== binding.failureRevision) return;
        if (!ready) {
          binding.fail();
          return;
        }
        applyReady(engine, "hls");
      })();
      return { ok: true, type: "hls", engine, slot };
    };

    const waitForHlsAttempt = async (engine, abortSignal) => {
      const ready = await waitForStreamStart(engine, haDirectPlan.waitMs, {
        ...haDirectPlan.waitOptions,
        abortSignal,
        resolveVideo: () => findActiveHaCameraStreamVideo(engine),
      });
      return ready === true;
    };

    const removeSlotChildrenExcept = (node) => {
      for (const child of Array.from(slot.children || [])) {
        if (child !== node) child.remove?.();
      }
    };

    const commitReadyHls = (engine, { retainPrevious = false } = {}) => {
      engine.style.cssText = options.styleText || HA_DIRECT_VISIBLE_STYLE;
      if (!retainPrevious) removeSlotChildrenExcept(engine);
      if (engine.parentElement !== slot) slot.appendChild(engine);
      assignCommittedEngine(engine, { retainPrevious });
      bindHlsMedia(engine);
      if (getRotateOverlayActive()) setLiveNativeControls(true);
      applyReady(engine, "hls");
      return { ok: true, type: "hls", engine, slot };
    };

    const showReadyWebRtc = (ownerEngine, hlsEngine) => {
      ownerEngine.video.style.cssText =
        options.styleText || HA_DIRECT_VISIBLE_STYLE;
      removeSlotChildrenExcept(ownerEngine.video);
      if (ownerEngine.video.parentElement !== slot) {
        slot.appendChild(ownerEngine.video);
      }
      hlsEngine?.remove?.();
      onCommittedMediaReady?.(ownerEngine, ownerEngine.video);
      applyReady(ownerEngine, "webrtc");
    };

    if (initialStreamType === "hls") return mountHls();

    const playback = createHaDirectWebRtcPlayback({
      hass,
      entity,
      muted: options?.muted ?? getStreamMuted(),
      controls: false,
      scopeKey,
      onConnectionLost: (reason) => {
        if (isCurrentEngine(playback?.engine)) scheduleResumeLive?.(reason);
      },
    });
    if (!playback) return mountHls();

    const { engine } = playback;
    replaceSlotContent(engine.video);
    if (!commit) {
      void playback.start();
      return { ok: true, type: "webrtc", engine, slot };
    }

    assignCommittedEngine(engine);
    const binding = createWebRtcBinding(engine);
    onCommittedMediaReady?.(engine, engine.video);
    if (getRotateOverlayActive()) setLiveNativeControls(true);
    // HLS is the first-picture path. Keep it visibly layered over the pending
    // WebRTC attempt so WebKit/Catalyst will render it instead of throttling an
    // offscreen 1px player. WebRTC remains owned and may take over when ready.
    const fallbackEngine = createHlsEngine(
      HA_DIRECT_VISIBLE_HLS_ATTEMPT_STYLE,
    );
    const fallbackAbortController = new AbortController();
    if (fallbackEngine) {
      binding.fallbackEngine = fallbackEngine;
      binding.fallbackAbortController = fallbackAbortController;
      slot.appendChild(fallbackEngine);
    }
    const isWebRtcAttemptActive = () => {
      if (binding.disposed) return false;
      if (isCurrentEngine(engine)) return true;
      const hlsBinding = fallbackEngine
        ? mediaBindings.get(fallbackEngine)
        : null;
      return Boolean(
        hlsBinding?.takeoverEngine === engine &&
          !hlsBinding.disposed &&
          isCurrentEngine(fallbackEngine),
      );
    };
    void (async () => {
      const priorRelease = releaseBarrier;
      const webRtcReady = (async () => {
        await priorRelease;
        if (!isWebRtcAttemptActive()) return false;
        const signalingStarted = await playback.start();
        if (!signalingStarted || !isWebRtcAttemptActive()) {
          return false;
        }
        const ready = await Promise.race([
          waitForStreamStart(engine, haDirectPlan.waitMs, {
            ...haDirectPlan.waitOptions,
            strict: true,
            abortSignal: binding.abortController.signal,
            resolveVideo: () => engine.video,
          }),
          engine.failure,
        ]);
        return ready === true;
      })();
      const hlsReady = fallbackEngine
        ? waitForHlsAttempt(fallbackEngine, fallbackAbortController.signal)
        : Promise.resolve(false);
      const readyCandidate = (type, promise) =>
        promise.then((ready) => {
          if (!ready) throw new Error(`${type} did not render`);
          return type;
        });
      let winner = await Promise.any([
        readyCandidate("webrtc", webRtcReady),
        readyCandidate("hls", hlsReady),
      ]).catch(() => "");
      if (!isWebRtcAttemptActive()) return;
      if (winner === "hls") {
        binding.fallbackAbortController = null;
        binding.fallbackEngine = null;
        fallbackAbortController.abort();
        engine.video.style.cssText = HA_DIRECT_HIDDEN_ATTEMPT_STYLE;
        commitReadyHls(fallbackEngine, { retainPrevious: true });
        const hlsBinding = mediaBindings.get(fallbackEngine);
        if (!hlsBinding || !isCurrentEngine(fallbackEngine)) {
          release(engine);
          return;
        }
        hlsBinding.takeoverEngine = engine;
        fallbackEngine.cancelPendingTakeover = () => {
          const activeBinding = mediaBindings.get(fallbackEngine);
          const pendingEngine = activeBinding?.takeoverEngine || null;
          if (activeBinding) activeBinding.takeoverEngine = null;
          fallbackEngine.cancelPendingTakeover = null;
          if (pendingEngine) release(pendingEngine);
        };
        const webRtcStarted = await webRtcReady;
        if (hlsBinding.disposed || !isCurrentEngine(fallbackEngine)) return;
        hlsBinding.takeoverEngine = null;
        fallbackEngine.cancelPendingTakeover = null;
        if (!webRtcStarted) {
          release(engine);
          return;
        }
        assignCommittedEngine(engine);
        showReadyWebRtc(engine, fallbackEngine);
        return;
      }
      if (winner === "webrtc") {
        binding.fallbackAbortController = null;
        binding.fallbackEngine = null;
        fallbackAbortController.abort();
        showReadyWebRtc(engine, fallbackEngine);
        return;
      }
      applyFailed(engine);
      release(engine);
      fallbackAbortController.abort();
      fallbackEngine?.remove?.();
    })();

    return { ok: true, type: "webrtc", engine, slot };
  };

  return {
    adoptRetainedWebRtcEngine,
    detachWebRtcForHandoff,
    release,
    tryMount,
  };
}
