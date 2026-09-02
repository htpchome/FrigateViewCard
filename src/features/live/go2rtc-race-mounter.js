import { buildLiveAttemptPlan } from "./attempt-planner.js";
import {
  createPendingMountDestroyers,
  filterPendingDestroyersForWinner,
} from "./pending-destroyers.js";
import { createStrategyForType } from "./stream.strategies.js";
import { StreamOrchestrator } from "./stream.orchestrator.js";
import {
  cleanupStaleWinnerResult,
  destroyLoserAttemptResults,
} from "./mount-result.js";

const STRATEGY_HINT_COOLDOWN_MS = 120000;
const STRATEGY_HINT_MAX_ENTRIES = 64;
const DEFERRED_WEBRTC_MAX_HOLD_MS = 4000;
const PREFERRED_WEBRTC_WAIT_MS = 500;
const MOBILE_FALLBACK_HEDGE_MS = 1250;
const MOBILE_DEFERRED_WEBRTC_MAX_HOLD_MS = 8500;
const WEBRTC_RETRY_BACKOFF_MS = 2000;

const waitForAttemptDelay = async (delayMs = 0, abortSignal = null) => {
  const waitMs = Math.max(0, Number(delayMs) || 0);
  if (abortSignal?.aborted) return false;
  if (!waitMs) return true;

  return await new Promise((resolve) => {
    let settled = false;
    const finish = (ready) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      abortSignal?.removeEventListener?.("abort", onAbort);
      resolve(ready);
    };
    const onAbort = () => finish(false);
    const timer = setTimeout(() => finish(true), waitMs);
    abortSignal?.addEventListener?.("abort", onAbort, { once: true });
  });
};

export function createGo2RtcRaceMounter({
  mounter,
  isMobile = false,
  resolveConnectionType,
  getPendingMountDestroyers,
  setPendingMountDestroyers,
  isMountTokenCurrent,
  adoptMountedAttempt,
  waitForStreamStart,
  isCurrentWinnerEngine,
  getPendingWebRtcTakeoverTimer,
  setPendingWebRtcTakeoverTimer,
  deferredWebRtcMaxHoldMs = DEFERRED_WEBRTC_MAX_HOLD_MS,
  mobileDeferredWebRtcMaxHoldMs = MOBILE_DEFERRED_WEBRTC_MAX_HOLD_MS,
  preferredWebRtcWaitMs = PREFERRED_WEBRTC_WAIT_MS,
  mobileFallbackHedgeMs = MOBILE_FALLBACK_HEDGE_MS,
  webRtcRetryBackoffMs = WEBRTC_RETRY_BACKOFF_MS,
  getNowMs = () => Date.now(),
}) {
  const strategyHintsByEntity = new Map();
  const pendingWebRtcMounts = new Set();
  let webRtcRetryAfterMs = 0;

  const normalizeEntityKey = (entity = "") => String(entity || "").trim();

  const replaceOwnedPendingMountDestroyers = (
    ownedDestroyers,
    replacementDestroyers = [],
  ) => {
    const owned = new Set(ownedDestroyers || []);
    const current = getPendingMountDestroyers?.() || [];
    if (!current.some((destroyer) => owned.has(destroyer))) return false;
    setPendingMountDestroyers?.([
      ...current.filter((destroyer) => !owned.has(destroyer)),
      ...(replacementDestroyers || []),
    ]);
    return true;
  };

  const trackPendingWebRtcMount = ({ entity, mountToken, strategies }) => {
    const strategy = (strategies || []).find(
      (candidate) => candidate?.type === "webrtc",
    );
    if (!strategy) return null;
    const entry = { entity, mountToken, strategy, cancelled: false };
    pendingWebRtcMounts.add(entry);
    return entry;
  };

  const releasePendingWebRtcMount = (entry) => {
    if (entry) pendingWebRtcMounts.delete(entry);
  };

  const deferWebRtcRetry = () => {
    webRtcRetryAfterMs = Math.max(
      webRtcRetryAfterMs,
      getNowMs() + Math.max(0, Number(webRtcRetryBackoffMs) || 0),
    );
  };

  const clearWebRtcRetryDelay = () => {
    webRtcRetryAfterMs = 0;
  };

  const resolveWebRtcRetryDelayMs = () =>
    Math.max(0, Number(webRtcRetryAfterMs) - getNowMs());

  const cancelPendingWebRtcAttempts = () => {
    if (pendingWebRtcMounts.size) deferWebRtcRetry();
    for (const entry of [...pendingWebRtcMounts]) {
      pendingWebRtcMounts.delete(entry);
      // Avoid replacing an incomplete WebRTC probe on every rapid switch.
      entry.cancelled = true;
      void entry.strategy?.disconnect?.();
    }
  };

  const setHintState = (entity = "", nextState = null) => {
    const key = normalizeEntityKey(entity);
    if (!key || !nextState) return;
    // Refresh insertion order so this map works as an LRU cache.
    if (strategyHintsByEntity.has(key)) {
      strategyHintsByEntity.delete(key);
    }
    strategyHintsByEntity.set(key, nextState);
    while (strategyHintsByEntity.size > STRATEGY_HINT_MAX_ENTRIES) {
      const oldestKey = strategyHintsByEntity.keys().next().value;
      if (!oldestKey) break;
      strategyHintsByEntity.delete(oldestKey);
    }
  };

  const getHintState = (entity = "") => {
    const key = normalizeEntityKey(entity);
    if (!key) return null;
    return strategyHintsByEntity.get(key) || null;
  };

  const markHintSuccess = (entity = "", type = "") => {
    const key = normalizeEntityKey(entity);
    const nextType = String(type || "")
      .trim()
      .toLowerCase();
    if (!key || !nextType) return;
    setHintState(key, {
      type: nextType,
      failureCount: 0,
      cooldownUntilMs: 0,
      updatedAtMs: getNowMs(),
    });
  };

  const markHintFailure = (entity = "", type = "") => {
    const key = normalizeEntityKey(entity);
    const failedType = String(type || "")
      .trim()
      .toLowerCase();
    if (!key || !failedType) return;
    const current = getHintState(key);
    if (!current || current.type !== failedType) return;
    const failureCount = (Number(current.failureCount) || 0) + 1;
    setHintState(key, {
      type: current.type,
      failureCount,
      cooldownUntilMs:
        failureCount >= 2 ? getNowMs() + STRATEGY_HINT_COOLDOWN_MS : 0,
      updatedAtMs: getNowMs(),
    });
  };

  const resolveHintedType = (entity = "", attempts = [], forcedType = null) => {
    if (forcedType) return null;
    const hint = getHintState(entity);
    if (!hint?.type) return null;
    const nowMs = getNowMs();
    if (Number(hint.cooldownUntilMs) > nowMs) return null;
    setHintState(entity, hint);
    return attempts.some((attempt) => attempt.type === hint.type)
      ? hint.type
      : null;
  };

  const resolveMobileAttemptDelays = (attempts = [], hintedType = null) => {
    const availableTypes = new Set(attempts.map((attempt) => attempt.type));
    const delays = {};
    if (availableTypes.has("webrtc")) delays.webrtc = 0;
    if (availableTypes.has("mse")) {
      delays.mse = hintedType === "mse" ? 0 : mobileFallbackHedgeMs;
    }
    return delays;
  };

  const mountWithOrchestrator = async ({
    slot,
    entity,
    mountToken,
    attempts,
    preferredType = "webrtc",
    preferredWaitMs = preferredWebRtcWaitMs,
    attemptDelayByType = {},
    applyWebRtcRetryBackoff = true,
  }) => {
    const webRtcAttemptDelayMs = attempts.some(
      (attempt) => attempt?.type === "webrtc",
    )
      ? Math.max(
          Math.max(0, Number(attemptDelayByType.webrtc) || 0),
          applyWebRtcRetryBackoff ? resolveWebRtcRetryDelayMs() : 0,
        )
      : 0;
    const resolvedAttemptDelayByType = {
      ...attemptDelayByType,
      webrtc: webRtcAttemptDelayMs,
    };
    const strategies = attempts.map((attempt) =>
      createStrategyForType({
        type: attempt.type,
        connect: async ({ abortSignal }) => {
          try {
            const ready = await waitForAttemptDelay(
              resolvedAttemptDelayByType[attempt.type],
              abortSignal,
            );
            if (!ready) return false;
            return await attempt.start({ abortSignal, entity });
          } catch (_) {
            return false;
          }
        },
      }),
    );

    const orchestrator = new StreamOrchestrator({
      strategies,
      preferredType,
      preferredWaitMs: Math.max(0, Number(preferredWaitMs) || 0),
      retainPreferredOnFallback: true,
    });
    slot?.attachOrchestrator?.(orchestrator);

    const activeAttempts = strategies.map((strategy) => ({
      type: strategy.type,
      strategy,
      promise: strategy.connect().catch(() => null),
    }));

    const ownedPendingDestroyers = createPendingMountDestroyers({
      activeAttempts,
      targetEntity: entity,
    });
    const pendingWebRtcMount = trackPendingWebRtcMount({
      entity,
      mountToken,
      strategies,
    });
    setPendingMountDestroyers(ownedPendingDestroyers);

    const winner = await orchestrator.start();
    const deferredPreferredAttempt = orchestrator.deferredPreferredAttempt;
    const deferredPreferredType = deferredPreferredAttempt?.type || "";

    if (!isMountTokenCurrent(mountToken)) {
      await deferredPreferredAttempt?.strategy?.disconnect?.();
      cleanupStaleWinnerResult(winner);
      releasePendingWebRtcMount(pendingWebRtcMount);
      replaceOwnedPendingMountDestroyers(ownedPendingDestroyers);
      slot?.clearOrchestrator?.(orchestrator);
      return false;
    }

    const destroyLosers = async () => {
      await destroyLoserAttemptResults({
        activeAttempts: activeAttempts.filter(
          (attempt) => attempt?.type !== deferredPreferredType,
        ),
        winnerType: winner?.type,
      });
      replaceOwnedPendingMountDestroyers(
        ownedPendingDestroyers,
        ownedPendingDestroyers.filter(
          (destroyer) => destroyer?.type === deferredPreferredType,
        ),
      );
      if (deferredPreferredType !== "webrtc") {
        releasePendingWebRtcMount(pendingWebRtcMount);
      }
      slot?.clearOrchestrator?.(orchestrator);
    };

    if (winner?.ok) {
      if (winner.type === "webrtc") {
        clearWebRtcRetryDelay();
        releasePendingWebRtcMount(pendingWebRtcMount);
      }
      replaceOwnedPendingMountDestroyers(
        ownedPendingDestroyers,
        filterPendingDestroyersForWinner({
          pendingDestroyers: ownedPendingDestroyers,
          winnerType: winner.type,
        }),
      );
      adoptMountedAttempt(slot, winner, {
        preservePendingSlots: deferredPreferredType === "webrtc",
      });
      void destroyLosers();
      scheduleDeferredWebRtcTakeover({
        entity,
        slot,
        deferredAttempt: deferredPreferredAttempt,
        mountToken,
        winnerEngine: winner.engine,
        winnerType: winner.type,
        pendingDestroyers: ownedPendingDestroyers.filter(
          (destroyer) => destroyer?.type === "webrtc",
        ),
        pendingWebRtcMount,
        webRtcAttemptDelayMs,
      });
      if (isMobile || deferredPreferredType !== "webrtc") {
        markHintSuccess(entity, winner.type);
      }
      return true;
    }

    await destroyLosers();
    return false;
  };

  const buildAttempts = (
    entity = "",
    forcedType = null,
    hostSlot = null,
    webRtcOptions = null,
  ) => {
    const targetEntity = String(entity || "").trim();
    const connectionType = resolveConnectionType(targetEntity);
    const hiddenSlot = () => createAttemptSlot(hostSlot);
    const builders = {
      webrtc: (attemptOptions = {}) =>
        mounter.tryMountWebRtc(
          hiddenSlot(),
          { waitMs: 7000 },
          {
            ...(webRtcOptions || {}),
            commit: false,
            ...attemptOptions,
          },
        ),
      mse: (attemptOptions = {}) =>
        mounter.tryMountMse(
          hiddenSlot(),
          {
            waitMs: 4000,
            minCurrentTime: 0.05,
            minDecodedFrames: 1,
            requireReadyState: 2,
            strict: true,
          },
          { commit: false, ...attemptOptions },
        ),
      hls: (attemptOptions = {}) =>
        mounter.tryMountHls(
          hiddenSlot(),
          { waitMs: 5000 },
          {
            commit: false,
            ...attemptOptions,
          },
        ),
    };

    return buildLiveAttemptPlan({
      connectionType,
      forcedType,
      builders,
    });
  };

  const mountWithRace = async ({
    slot,
    entity,
    forcedType = null,
    mountToken,
    webRtcOptions = null,
  }) => {
    const attempts = buildAttempts(
      entity,
      forcedType,
      slot,
      webRtcOptions,
    );
    const hintedType = resolveHintedType(entity, attempts, forcedType);
    if (isMobile && !forcedType) {
      return await mountWithOrchestrator({
        slot,
        entity,
        mountToken,
        attempts,
        preferredType: "webrtc",
        preferredWaitMs: 0,
        attemptDelayByType: resolveMobileAttemptDelays(attempts, hintedType),
      });
    }
    if (hintedType) {
      const preferredAttempt = attempts.find(
        (attempt) => attempt.type === hintedType,
      );
      if (preferredAttempt) {
        const preferredMounted = await mountWithOrchestrator({
          slot,
          entity,
          mountToken,
          attempts: [preferredAttempt],
          preferredType: hintedType,
          preferredWaitMs: 0,
        });
        if (preferredMounted) {
          markHintSuccess(entity, hintedType);
          return true;
        }
        if (!isMountTokenCurrent(mountToken)) return false;

        markHintFailure(entity, hintedType);

        const fallbackAttempts = attempts.filter(
          (attempt) => attempt.type !== hintedType,
        );
        if (!fallbackAttempts.length) return false;
        return await mountWithOrchestrator({
          slot,
          entity,
          mountToken,
          attempts: fallbackAttempts,
          preferredType: "webrtc",
        });
      }
    }

    return await mountWithOrchestrator({
      slot,
      entity,
      mountToken,
      attempts,
      preferredType: "webrtc",
      applyWebRtcRetryBackoff: forcedType !== "webrtc",
    });
  };

  return {
    buildAttempts,
    cancelPendingWebRtcAttempts,
    mountWithRace,
  };

  function createAttemptSlot(host = null) {
    const slot = document.createElement("div");
    slot.style.cssText =
      "position:absolute;inset:0;opacity:0;pointer-events:none;overflow:hidden;";
    if (host) host.appendChild(slot);
    return slot;
  }

  function scheduleDeferredWebRtcTakeover({
    entity,
    slot,
    deferredAttempt,
    mountToken,
    winnerEngine,
    winnerType,
    pendingDestroyers = [],
    pendingWebRtcMount = null,
    webRtcAttemptDelayMs = 0,
  }) {
    if (!slot || !deferredAttempt || deferredAttempt.type !== "webrtc") return;
    if (winnerType !== "mse" && winnerType !== "hls") return;
    const pendingTimer = getPendingWebRtcTakeoverTimer?.();
    if (pendingTimer) {
      clearTimeout(pendingTimer);
      setPendingWebRtcTakeoverTimer(null);
    }
    let settled = false;
    let holdTimer = null;
    const settleDeferredState = () => {
      if (settled) return;
      settled = true;
      if (holdTimer) {
        clearTimeout(holdTimer);
      }
      replaceOwnedPendingMountDestroyers(pendingDestroyers);
      releasePendingWebRtcMount(pendingWebRtcMount);
      if (getPendingWebRtcTakeoverTimer?.() === holdTimer) {
        setPendingWebRtcTakeoverTimer(null);
      }
      holdTimer = null;
    };

    holdTimer = setTimeout(
      () => {
        if (pendingWebRtcMount?.cancelled !== true) deferWebRtcRetry();
        settleDeferredState();
        void (async () => {
          await deferredAttempt.strategy?.disconnect?.();
          const result = await deferredAttempt.promise.catch(() => null);
          cleanupStaleWinnerResult(result);
        })();
      },
      Math.max(
        1,
        (Number(
          isMobile
            ? mobileDeferredWebRtcMaxHoldMs
            : deferredWebRtcMaxHoldMs,
        ) || 0) + Math.max(0, Number(webRtcAttemptDelayMs) || 0),
      ),
    );
    setPendingWebRtcTakeoverTimer(holdTimer);

    void (async () => {
      try {
        const result = await deferredAttempt.promise.catch(() => null);
        if (!result?.ok || result.type !== "webrtc") {
          if (pendingWebRtcMount?.cancelled !== true) deferWebRtcRetry();
          return;
        }
        const takeoverStable = await waitForStreamStart(result.slot, 1500, {
          minCurrentTime: 0.1,
          minDecodedFrames: 2,
          requireReadyState: 2,
          strict: true,
        });
        if (!takeoverStable) {
          if (pendingWebRtcMount?.cancelled !== true) deferWebRtcRetry();
          cleanupStaleWinnerResult(result);
          return;
        }
        if (!isMountTokenCurrent(mountToken)) {
          cleanupStaleWinnerResult(result);
          return;
        }
        if (!isCurrentWinnerEngine(winnerEngine)) {
          cleanupStaleWinnerResult(result);
          return;
        }
        adoptMountedAttempt(slot, result);
        clearWebRtcRetryDelay();
        try {
          winnerEngine?.destroy?.();
        } catch (_) {}
        markHintSuccess(entity, "webrtc");
      } finally {
        settleDeferredState();
      }
    })();
  }
}
