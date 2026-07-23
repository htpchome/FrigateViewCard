const DEFAULT_LIVE_ORDER = Object.freeze(["webrtc", "mse", "hls"]);

/**
 * Builds the ordered set of live mount attempts.
 * Keeps policy (ordering/filtering) separate from mount implementation details.
 */
export const buildLiveAttemptPlan = ({
  connectionType,
  forcedType = null,
  disableHlsOnDesktop = false,
  builders = {},
}) => {
  if (connectionType === "ha_direct") return [];

  const order = forcedType ? [forcedType] : DEFAULT_LIVE_ORDER;
  return order
    .filter((type) => !(type === "hls" && disableHlsOnDesktop))
    .filter((type) => typeof builders[type] === "function")
    .map((type) => ({ type, start: builders[type] }));
};

/**
 * Resolves the first successful async attempt result.
 */
export const raceMountAttempts = async (attempts) => {
  return await new Promise((resolve) => {
    if (!attempts.length) {
      resolve(null);
      return;
    }

    let settled = 0;
    let resolved = false;
    const finish = (result) => {
      if (resolved) return;
      resolved = true;
      resolve(result);
    };

    for (const attempt of attempts) {
      void (async () => {
        try {
          const result = await attempt;
          settled += 1;
          if (result?.ok) {
            finish(result);
            return;
          }
          if (settled >= attempts.length) finish(null);
        } catch (_) {
          settled += 1;
          if (settled >= attempts.length) finish(null);
        }
      })();
    }
  });
};
