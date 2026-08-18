import {
  applyMountWatchdogTimeout,
  beginMountTracking,
  clearMountTrackingIfCurrent,
  resolveGraceMsePendingMountOutcome,
  resolveGraceMseReuseAction,
  resolveLiveMountEntryAction,
  resolveLiveMountTransportPlan,
  resolveLiveMountUiState,
  shouldRunMountWatchdog,
} from "./mount-lifecycle.js";
import { resolveGraceMseMountResult } from "./mount-result.js";
import {
  createGracePendingMountDestroyer,
  shouldClearPendingDestroyersForPromise,
} from "./pending-destroyers.js";
import { resolveSnapshotFallbackState } from "./stream.state.js";

export function createLiveMountController({
  getSlot,
  isPreviewPageActive,
  getViewMode,
  isGridModeAvailable,
  getMountInProgress,
  getMountTargetEntity,
  getMountState,
  applyMountTrackingState,
  cancelPendingMount,
  mountGridEngine,
  cleanupEngine,
  getStreamMuted,
  setEngineMountedMuted,
  mseGraceController,
  getPendingMountDestroyers,
  setPendingMountDestroyers,
  haDirectMounter,
  go2rtcRaceMounter,
  preferredStreamType,
  setActiveStreamType,
  setStreamLoading,
  setStreamFallbackVisible,
  scheduleResumeLive,
  resolveUseGo2Rtc,
}) {
  const applyLiveMountUiState = (quiet = false) => {
    const mountUi = resolveLiveMountUiState({ quiet });
    if (mountUi.activeStreamType != null) {
      setActiveStreamType?.(mountUi.activeStreamType);
    }
    setStreamFallbackVisible?.(
      mountUi.fallbackVisible,
      mountUi.refreshFallbackImage,
    );
    setStreamLoading?.(mountUi.loading);
  };

  const applySnapshotFallbackState = (refreshImage = false) => {
    const fallbackState = resolveSnapshotFallbackState({ refreshImage });
    setActiveStreamType?.(fallbackState.activeStreamType);
    setStreamLoading?.(fallbackState.loading);
    setStreamFallbackVisible?.(
      fallbackState.fallbackVisible,
      fallbackState.refreshFallbackImage,
    );
  };

  const clearMountTracking = (mountToken) => {
    const mountState = getMountState?.();
    applyMountTrackingState?.(
      clearMountTrackingIfCurrent({
        mountSeq: mountState?.mountSeq,
        mountToken,
        mountInProgress: mountState?.mountInProgress,
        mountStartedAt: mountState?.mountStartedAt,
        mountTargetEntity: mountState?.mountTargetEntity,
      }),
    );
  };

  const onMountWatchdogTimeout = (mountToken) => {
    if (
      !shouldRunMountWatchdog({
        mountInProgress: getMountInProgress?.(),
        mountSeq: getMountState?.()?.mountSeq,
        mountToken,
      })
    ) {
      return;
    }
    applyMountTrackingState?.(
      applyMountWatchdogTimeout({ mountSeq: getMountState?.()?.mountSeq }),
    );
    cleanupEngine?.();
    setStreamLoading?.(false);
    setStreamFallbackVisible?.(true);
    setActiveStreamType?.("snapshot");
    scheduleResumeLive?.("mount-watchdog-timeout");
  };

  const beginLiveMountSession = (entity) => {
    const mountState = getMountState?.();
    const { mountToken, nextState } = beginMountTracking({
      mountSeq: mountState?.mountSeq,
      entity,
      nowMs: Date.now(),
    });
    applyMountTrackingState?.(nextState);
    const mountWatchdogT = setTimeout(
      () => onMountWatchdogTimeout(mountToken),
      9000,
    );
    return {
      mountToken,
      clearMountState: () => {
        clearTimeout(mountWatchdogT);
        clearMountTracking(mountToken);
      },
    };
  };

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

    if (useGo2Rtc && (!forcedType || forcedType === "webrtc")) {
      const graceWebRtcEntry =
        mseGraceController.takeGraceWebRtcEntry?.(targetEntity) || null;
      if (
        graceWebRtcEntry?.engine &&
        mseGraceController.adoptGraceWebRtcEngine?.(
          slot,
          graceWebRtcEntry.engine,
        )
      ) {
        return;
      }
    }

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
              mountSeq: getMountState?.()?.mountSeq,
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
    applySnapshotFallbackState,
    applyLiveMountUiState,
    beginLiveMountSession,
    mount,
  };
}
