export const createPendingMountDestroyers = ({
  activeAttempts,
  targetEntity,
}) =>
  activeAttempts.map((attempt) => {
    let destroyStarted = false;
    return {
      type: attempt.type,
      entity: targetEntity,
      promise: attempt.promise,
      destroy: () => {
        if (destroyStarted) return;
        destroyStarted = true;
        void (async () => {
          if (typeof attempt.strategy?.disconnect === "function") {
            try {
              await attempt.strategy.disconnect();
            } catch (_) {}
            return;
          }
          let result = null;
          try {
            result = await attempt.promise;
          } catch (_) {}
          try {
            result?.engine?.destroy?.();
          } catch (_) {}
        })();
      },
    };
  });

export const createGracePendingMountDestroyer = ({ entity, promise }) => ({
  type: "mse",
  entity,
  promise,
  destroy: () => {
    void (async () => {
      const result = await promise;
      try {
        result?.engine?.destroy?.();
      } catch (_) {}
    })();
  },
});

export const filterPendingDestroyersForWinner = ({
  pendingDestroyers,
  winnerType,
}) =>
  (pendingDestroyers || []).filter((attempt) => attempt?.type !== winnerType);

export const splitPendingDestroyersByGraceMse = ({
  pendingDestroyers,
  preserveMseEntity,
}) => {
  const preserveKey = String(preserveMseEntity || "").trim();
  if (!preserveKey) {
    return {
      toPreserve: [],
      toDestroy: [...(pendingDestroyers || [])],
    };
  }

  const toPreserve = [];
  const toDestroy = [];
  for (const pendingAttempt of pendingDestroyers || []) {
    if (
      pendingAttempt?.type === "mse" &&
      pendingAttempt?.entity === preserveKey
    ) {
      toPreserve.push(pendingAttempt);
      continue;
    }
    toDestroy.push(pendingAttempt);
  }

  return { toPreserve, toDestroy };
};

export const shouldClearPendingDestroyersForPromise = ({
  pendingDestroyers,
  promise,
}) => (pendingDestroyers || []).some((attempt) => attempt?.promise === promise);
