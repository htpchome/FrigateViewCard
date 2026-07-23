export const isMountTokenCurrent = ({ mountToken, mountSeq }) =>
  mountToken === mountSeq;

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
