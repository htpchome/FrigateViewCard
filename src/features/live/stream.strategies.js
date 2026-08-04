/**
 * Base strategy for a single live transport attempt.
 */
export class StreamStrategy {
  constructor({ type, connect }) {
    this.type = String(type || "")
      .trim()
      .toLowerCase();
    this._connectImpl = typeof connect === "function" ? connect : null;
    this._abortController = null;
    this._connectPromise = null;
    this._disconnectStarted = false;
  }

  get connectPromise() {
    return this._connectPromise;
  }

  async connect() {
    if (!this._connectImpl) {
      throw new Error(`Missing connect implementation for ${this.type}`);
    }
    if (this._connectPromise) return this._connectPromise;

    const abortController = new AbortController();
    this._abortController = abortController;
    this._connectPromise = (async () => {
      const result = await this._connectImpl({
        abortSignal: abortController.signal,
      });
      if (!result?.ok) {
        throw new Error(`${this.type} strategy failed`);
      }
      return result;
    })();

    this._connectPromise.catch(() => null);

    return this._connectPromise;
  }

  async disconnect() {
    if (this._disconnectStarted) return;
    this._disconnectStarted = true;

    try {
      this._abortController?.abort();
    } catch (_) {}

    const result = await this._connectPromise?.catch(() => null);
    try {
      result?.engine?.destroy?.();
    } catch (_) {}
  }
}

export class WebRtcStrategy extends StreamStrategy {
  constructor(connect) {
    super({ type: "webrtc", connect });
  }
}

export class MseStrategy extends StreamStrategy {
  constructor(connect) {
    super({ type: "mse", connect });
  }
}

export class HlsStrategy extends StreamStrategy {
  constructor(connect) {
    super({ type: "hls", connect });
  }
}

export const createStrategyForType = ({ type, connect }) => {
  const key = String(type || "")
    .trim()
    .toLowerCase();
  if (key === "webrtc") return new WebRtcStrategy(connect);
  if (key === "mse") return new MseStrategy(connect);
  if (key === "hls") return new HlsStrategy(connect);
  return new StreamStrategy({ type: key || "unknown", connect });
};
