export class CleanupController {
  constructor() {
    this._abortController = new AbortController();
    this._cleanups = [];
    this._disposed = false;
  }

  get signal() {
    return this._abortController.signal;
  }

  addEventListener(target, type, listener, options = {}) {
    if (this._disposed || !target?.addEventListener || !listener) return;
    const normalizedOptions =
      typeof options === "boolean" ? { capture: options } : { ...options };
    target.addEventListener(type, listener, {
      ...normalizedOptions,
      signal: this.signal,
    });
  }

  addCleanup(cleanup) {
    if (typeof cleanup !== "function") return;
    if (this._disposed) {
      try {
        cleanup();
      } catch (_) {}
      return;
    }
    this._cleanups.push(cleanup);
  }

  dispose() {
    if (this._disposed) return;
    this._disposed = true;
    this._abortController.abort();
    for (const cleanup of this._cleanups.splice(0).reverse()) {
      try {
        cleanup();
      } catch (_) {}
    }
  }
}
