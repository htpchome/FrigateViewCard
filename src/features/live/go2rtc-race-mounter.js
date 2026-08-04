import { buildLiveAttemptPlan } from "./attempt-planner.js";
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
  createAttemptSlot,
  getPendingMountDestroyers,
  setPendingMountDestroyers,
  isMountTokenCurrent,
  adoptMountedAttempt,
  scheduleDeferredWebRtcTakeover,
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
      strategies.map((strategy) => ({
        type: strategy.type,
        entity,
        promise: strategy.connectPromise?.catch(() => null),
        destroy: () => {
          void strategy.disconnect();
        },
      })),
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
        (getPendingMountDestroyers() || []).filter(
          (attempt) => attempt?.type !== winner.type,
        ),
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
}
