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
}) {
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
      preferredType: "webrtc",
      preferredWaitMs: 0,
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
      await destroyLosers();
      scheduleDeferredWebRtcTakeover({
        slot,
        deferredAttempt: deferredPreferredAttempt,
        mountToken,
        winnerEngine: winner.engine,
        winnerType: winner.type,
      });
      return true;
    }

    await destroyLosers();
    return false;
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
    slot,
    deferredAttempt,
    mountToken,
    winnerEngine,
    winnerType,
  }) {
    if (!slot || !deferredAttempt || deferredAttempt.type !== "webrtc") return;
    if (winnerType !== "mse") return;
    const pendingTimer = getPendingWebRtcTakeoverTimer?.();
    if (pendingTimer) {
      clearTimeout(pendingTimer);
      setPendingWebRtcTakeoverTimer(null);
    }
    const timer = setTimeout(() => {
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
        } finally {
          setPendingMountDestroyers(
            (getPendingMountDestroyers() || []).filter(
              (attempt) => attempt?.type !== "webrtc",
            ),
          );
          setPendingWebRtcTakeoverTimer(null);
        }
      })();
    }, 0);
    setPendingWebRtcTakeoverTimer(timer);
  }
}
