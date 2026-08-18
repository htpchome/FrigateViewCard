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

export function createGo2RtcRaceMounter({
  mounter,
  isDesktop,
  resolveConnectionType,
  disableHlsDesktopForEntity,
  getPendingMountDestroyers,
  setPendingMountDestroyers,
  isMountTokenCurrent,
  adoptMountedAttempt,
  waitForStreamStart,
  isCurrentWinnerEngine,
  getPendingWebRtcTakeoverTimer,
  setPendingWebRtcTakeoverTimer,
  deferredWebRtcMaxHoldMs = DEFERRED_WEBRTC_MAX_HOLD_MS,
  preferredWebRtcWaitMs = PREFERRED_WEBRTC_WAIT_MS,
  getNowMs = () => Date.now(),
}) {
  const strategyHintsByEntity = new Map();

  const normalizeEntityKey = (entity = "") => String(entity || "").trim();

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

  const mountWithOrchestrator = async ({
    slot,
    entity,
    mountToken,
    attempts,
    preferredType = "webrtc",
  }) => {
    const strategies = attempts.map((attempt) =>
      createStrategyForType({
        type: attempt.type,
        connect: async ({ abortSignal }) => {
          try {
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
      preferredWaitMs: Math.max(0, Number(preferredWebRtcWaitMs) || 0),
      retainPreferredOnFallback: true,
    });
    slot?.attachOrchestrator?.(orchestrator);

    const activeAttempts = strategies.map((strategy) => ({
      type: strategy.type,
      promise: strategy.connect().catch(() => null),
    }));

    setPendingMountDestroyers(
      createPendingMountDestroyers({
        activeAttempts: strategies.map((strategy) => ({
          type: strategy.type,
          promise: strategy.connectPromise?.catch(() => null),
        })),
        targetEntity: entity,
      }),
    );

    const winner = await orchestrator.start();
    const deferredPreferredAttempt = orchestrator.deferredPreferredAttempt;
    const deferredPreferredType = deferredPreferredAttempt?.type || "";

    if (!isMountTokenCurrent(mountToken)) {
      cleanupStaleWinnerResult(winner);
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
      setPendingMountDestroyers(
        (getPendingMountDestroyers() || []).filter(
          (attempt) => attempt?.type === deferredPreferredType,
        ),
      );
      slot?.clearOrchestrator?.(orchestrator);
    };

    if (winner?.ok) {
      setPendingMountDestroyers(
        filterPendingDestroyersForWinner({
          pendingDestroyers: getPendingMountDestroyers(),
          winnerType: winner.type,
        }),
      );
      adoptMountedAttempt(slot, winner);
      void destroyLosers();
      scheduleDeferredWebRtcTakeover({
        entity,
        slot,
        deferredAttempt: deferredPreferredAttempt,
        mountToken,
        winnerEngine: winner.engine,
        winnerType: winner.type,
      });
      if (deferredPreferredType !== "webrtc") {
        markHintSuccess(entity, winner.type);
      }
      return true;
    }

    await destroyLosers();
    return false;
  };

  const buildAttempts = (entity = "", forcedType = null, hostSlot = null) => {
    const targetEntity = String(entity || "").trim();
    const connectionType = resolveConnectionType(targetEntity);
    const disableHlsOnDesktop =
      isDesktop && disableHlsDesktopForEntity(targetEntity);
    const hiddenSlot = () => createAttemptSlot(hostSlot);
    const builders = {
      webrtc: (attemptOptions = {}) =>
        mounter.tryMountWebRtc(
          hiddenSlot(),
          { waitMs: 7000 },
          {
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
      disableHlsOnDesktop,
      builders,
    });
  };

  const mountWithRace = async ({
    slot,
    entity,
    forcedType = null,
    mountToken,
  }) => {
    const attempts = buildAttempts(entity, forcedType, slot);
    const hintedType = resolveHintedType(entity, attempts, forcedType);
    if (hintedType) {
      const preferredAttempt = attempts.find(
        (attempt) => attempt.type === hintedType,
      );
      if (preferredAttempt) {
        let preferredResult = null;
        try {
          preferredResult = await preferredAttempt.start({ entity });
        } catch (_) {
          preferredResult = null;
        }

        if (!isMountTokenCurrent(mountToken)) {
          cleanupStaleWinnerResult(preferredResult);
          return false;
        }

        if (preferredResult?.ok) {
          adoptMountedAttempt(slot, preferredResult);
          markHintSuccess(entity, preferredResult.type || hintedType);
          return true;
        }

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
    });
  };

  return {
    buildAttempts,
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
        holdTimer = null;
      }
      setPendingMountDestroyers(
        (getPendingMountDestroyers() || []).filter(
          (attempt) => attempt?.type !== "webrtc",
        ),
      );
      setPendingWebRtcTakeoverTimer(null);
    };

    holdTimer = setTimeout(
      () => {
        settleDeferredState();
        void (async () => {
          await deferredAttempt.strategy?.disconnect?.();
          const result = await deferredAttempt.promise.catch(() => null);
          cleanupStaleWinnerResult(result);
        })();
      },
      Math.max(1, Number(deferredWebRtcMaxHoldMs) || 0),
    );
    setPendingWebRtcTakeoverTimer(holdTimer);

    void (async () => {
      try {
        const result = await deferredAttempt.promise.catch(() => null);
        if (!result?.ok || result.type !== "webrtc") return;
        const takeoverStable = await waitForStreamStart(result.slot, 1500, {
          minCurrentTime: 0.1,
          minDecodedFrames: 2,
          requireReadyState: 2,
          strict: true,
        });
        if (!takeoverStable) {
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
