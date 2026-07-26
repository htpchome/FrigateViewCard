export class StreamOrchestrator {
  constructor(options = {}) {
    const strategies = Array.isArray(options)
      ? options
      : options?.strategies || [];
    this._strategies = Array.isArray(strategies) ? [...strategies] : [];
    this._preferredType = String(options?.preferredType || "")
      .trim()
      .toLowerCase();
    this._preferredWaitMs = Math.max(0, Number(options?.preferredWaitMs) || 0);
    this._attempts = [];
  }

  get attempts() {
    return this._attempts;
  }

  async start() {
    if (!this._strategies.length) return null;

    this._attempts = this._strategies.map((strategy) => ({
      type: strategy.type,
      strategy,
      promise: strategy.connect(),
    }));

    const candidates = this._attempts.map((attempt) =>
      (async () => ({
        type: attempt.type,
        strategy: attempt.strategy,
        result: await attempt.promise,
      }))(),
    );

    const preferredCandidate = this._attempts.find(
      (attempt) => attempt.type === this._preferredType,
    );

    try {
      let winner = null;
      if (!preferredCandidate) {
        winner = await Promise.any(candidates);
      } else {
        const fallbackWinner = await Promise.any(candidates);
        if (fallbackWinner.type === this._preferredType) {
          winner = fallbackWinner;
        } else if (this._preferredWaitMs <= 0) {
          winner = fallbackWinner;
        } else {
          const preferredWinnerPromise = (async () => {
            try {
              const result = await preferredCandidate.promise;
              return {
                type: preferredCandidate.type,
                strategy: preferredCandidate.strategy,
                result,
              };
            } catch (_) {
              return null;
            }
          })();

          const timeoutPromise = new Promise((resolve) => {
            setTimeout(() => resolve(null), this._preferredWaitMs);
          });

          const preferredWithTimeout = await Promise.race([
            preferredWinnerPromise,
            timeoutPromise,
          ]);
          winner = preferredWithTimeout || fallbackWinner;
        }
      }

      await this.stop({ exclude: winner.strategy });
      return winner.result;
    } catch (_) {
      await this.stop();
      return null;
    }
  }

  async stop({ exclude = null } = {}) {
    await Promise.all(
      (this._strategies || []).map(async (strategy) => {
        if (exclude && strategy === exclude) return;
        await strategy.disconnect();
      }),
    );
  }
}
