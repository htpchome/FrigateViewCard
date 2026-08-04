export const isMountTokenCurrent = ({ mountToken, mountSeq }) =>
  mountToken === mountSeq;

export const resolveGraceMseMountResult = ({ engine }) => {
  if (!engine) return false;
  return {
    ok: true,
    type: "mse",
    engine,
  };
};

export const cleanupStaleWinnerResult = (winner) => {
  if (!winner) return;
  if (winner?.engine?.destroy) winner.engine.destroy();
  try {
    winner?.slot?.remove?.();
  } catch (_) {}
};

export const adoptMountedAttemptSlot = ({ targetSlot, resultSlot }) => {
  if (!targetSlot || !resultSlot) return;
  for (const child of [...targetSlot.children]) {
    if (child !== resultSlot) {
      try {
        child.remove();
      } catch (_) {}
    }
  }
  resultSlot.style.opacity = "1";
  resultSlot.style.pointerEvents = "auto";
  resultSlot.style.overflow = "hidden";
};

export const adoptMountedAttemptResult = ({
  targetSlot,
  result,
  streamMuted,
  rotateOverlayActive,
  assignEngine,
  setEngineMountedMuted,
  setActiveStreamType,
  setStreamLoading,
  setStreamFallbackVisible,
  setLiveNativeControls,
}) => {
  if (!targetSlot || !result?.slot || !result?.engine) return false;
  adoptMountedAttemptSlot({
    targetSlot,
    resultSlot: result.slot,
  });
  assignEngine?.(result.engine);
  setEngineMountedMuted?.(streamMuted);
  setActiveStreamType?.(result.type);
  setStreamLoading?.(false);
  setStreamFallbackVisible?.(false);
  if (rotateOverlayActive) setLiveNativeControls?.(true);
  return true;
};

export const destroyLoserAttemptResults = async ({
  activeAttempts,
  winnerType,
}) => {
  for (const attempt of activeAttempts || []) {
    const result = await attempt.promise.catch(() => null);
    if (!result?.ok || result.type === winnerType) continue;
    try {
      result.engine?.destroy?.();
    } catch (_) {}
    try {
      result.slot?.remove?.();
    } catch (_) {}
  }
};
