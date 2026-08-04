import {
  createGracePendingMountDestroyer,
  shouldClearPendingDestroyersForPromise,
} from "./pending-destroyers.js";
import {
  resolveGraceMsePendingMountOutcome,
  resolveGraceMseReuseAction,
  resolveLiveMountEntryAction,
  resolveLiveMountTransportPlan,
} from "./mount-lifecycle.js";
import { resolveGraceMseMountResult } from "./mount-result.js";

export function createLiveMountController({
  getSlot,
  isPreviewPageActive,
  getViewMode,
  isGridModeAvailable,
  getMountInProgress,
  getMountTargetEntity,
  cancelPendingMount,
  mountGridEngine,
  beginLiveMountSession,
  cleanupEngine,
  applyLiveMountUiState,
  applySnapshotFallbackState,
  getStreamMuted,
  setEngineMountedMuted,
  mseGraceController,
  getMountSeq,
  getPendingMountDestroyers,
  setPendingMountDestroyers,
  haDirectMounter,
  go2rtcRaceMounter,
  preferredStreamType,
  setActiveStreamType,
  resolveUseGo2Rtc,
}) {
  const mount = async ({ forcedType = null, quiet = false, entity = "" }) => {
    const slot = getSlot?.();
    const mountEntry = resolveLiveMountEntryAction({
      hasSlot: !!slot,
      previewPageActive: isPreviewPageActive?.(),
      viewMode: getViewMode?.(),
      gridModeAvailable: isGridModeAvailable?.(),
      entity,
      mountInProgress: getMountInProgress?.(),
      mountTargetEntity: getMountTargetEntity?.(),
    });

    if (mountEntry.type === "missing-slot") return;
    if (mountEntry.type === "preview") {
      applyLiveMountUiState?.(true);
      return;
    }
    if (mountEntry.type === "grid") {
      cancelPendingMount?.("grid-mode");
      mountGridEngine?.(slot);
      return;
    }
    if (
      mountEntry.type === "missing-entity" ||
      mountEntry.type === "duplicate"
    ) {
      return;
    }

    const targetEntity = mountEntry.entity;
    const useGo2Rtc = resolveUseGo2Rtc?.(targetEntity) === true;

    if (useGo2Rtc && (!forcedType || forcedType === "mse")) {
      const graceMseAction = resolveGraceMseReuseAction({
        useGo2Rtc,
        forcedType,
        graceMseEntry: mseGraceController.takeGraceMseEntry(targetEntity),
      });
      if (graceMseAction.type === "adopt-engine") {
        if (
          mseGraceController.adoptGraceMseEngine(
            slot,
            graceMseAction.graceMseEntry.engine,
          )
        ) {
          return;
        }
      } else if (graceMseAction.type === "await-promise") {
        const graceMseEntry = graceMseAction.graceMseEntry;
        if (graceMseEntry?.promise) {
          setEngineMountedMuted?.(getStreamMuted?.());
          const { mountToken, clearMountState } =
            beginLiveMountSession(targetEntity);
          const graceResultPromise = (async () => {
            return resolveGraceMseMountResult({
              engine: await graceMseEntry.promise,
            });
          })();
          setPendingMountDestroyers?.([
            createGracePendingMountDestroyer({
              entity: targetEntity,
              promise: graceResultPromise,
            }),
          ]);
          slot.innerHTML = "";
          applyLiveMountUiState?.(quiet);
          try {
            const graceResult = await graceResultPromise;
            const pendingOutcome = resolveGraceMsePendingMountOutcome({
              graceResult,
              mountSeq: getMountSeq?.(),
              mountToken,
            });
            if (pendingOutcome.type === "missing-engine") return;
            if (pendingOutcome.type === "stale-token") return;
            setPendingMountDestroyers?.([]);
            if (
              mseGraceController.adoptGraceMseEngine(
                slot,
                pendingOutcome.engine,
              )
            ) {
              clearMountState();
              return;
            }
          } finally {
            clearMountState();
            if (
              shouldClearPendingDestroyersForPromise({
                pendingDestroyers: getPendingMountDestroyers?.(),
                promise: graceResultPromise,
              })
            ) {
              setPendingMountDestroyers?.([]);
            }
          }
        }
      }
    }

    setEngineMountedMuted?.(getStreamMuted?.());
    const { mountToken, clearMountState } = beginLiveMountSession(targetEntity);
    try {
      cleanupEngine?.();
      slot.innerHTML = "";
      applyLiveMountUiState?.(quiet);

      const transportPlan = resolveLiveMountTransportPlan({
        useGo2Rtc,
        forcedType,
        preferredStreamType: preferredStreamType?.(),
      });

      if (transportPlan.mode === "ha-direct") {
        setActiveStreamType?.(transportPlan.streamType);
        const haDirectResult = await haDirectMounter.tryMount(
          slot,
          { streamType: transportPlan.streamType },
          { entity: targetEntity, commit: true },
        );
        if (!haDirectResult?.ok) {
          return;
        }
        setEngineMountedMuted?.(getStreamMuted?.());
        return;
      }

      if (
        await go2rtcRaceMounter.mountWithRace({
          slot,
          entity: targetEntity,
          forcedType,
          mountToken,
        })
      ) {
        return;
      }

      applySnapshotFallbackState?.();
    } finally {
      clearMountState();
    }
  };

  return {
    mount,
  };
}
