const DEFAULT_STOP_RETRY_DELAYS_MS = Object.freeze([180, 650]);

export class PtzMotionController {
  constructor({
    resolveContext,
    resolveHoldPlan,
    executeAction,
    onError = () => {},
    setTimer = (callback, delay) => setTimeout(callback, delay),
    clearTimer = (timer) => clearTimeout(timer),
    stopRetryDelaysMs = DEFAULT_STOP_RETRY_DELAYS_MS,
  } = {}) {
    this._resolveContext = resolveContext;
    this._resolveHoldPlan = resolveHoldPlan;
    this._executeAction = executeAction;
    this._onError = onError;
    this._setTimer = setTimer;
    this._clearTimer = clearTimer;
    this._stopRetryDelaysMs = [...stopRetryDelaysMs];
    this._active = null;
    this._nextSessionId = 1;
    this._stopRetryToken = 0;
    this._stopRetryTimers = new Set();
    this._disposed = false;
  }

  async start(action) {
    if (this._disposed || !action) return;

    const previousStop = this._deactivateCurrent({ retryStop: false });
    this._clearStopRetries();

    const session = {
      id: this._nextSessionId,
      action,
      active: true,
      context: null,
      holdPlan: null,
      moveAttempted: false,
      repeatTimer: null,
    };
    this._nextSessionId += 1;
    this._active = session;

    await previousStop;
    if (!this._isCurrent(session)) return;

    try {
      session.context = await this._resolveContext?.(action);
    } catch (error) {
      this._reportError(error, "context", session);
      this._clearSessionIfCurrent(session);
      return;
    }
    if (!this._isCurrent(session) || !session.context) return;

    session.holdPlan = this._resolveHoldPlan?.({
      ...session.context,
      action,
    });
    if (!session.holdPlan) {
      this._clearSessionIfCurrent(session);
      return;
    }

    await this._runMove(session);
  }

  stop(reason = "release") {
    return this._deactivateCurrent({ retryStop: true, reason });
  }

  dispose() {
    if (this._disposed) return Promise.resolve();
    this._disposed = true;
    return this.stop("dispose");
  }

  async _runMove(session) {
    if (!this._isCurrent(session)) return;
    session.moveAttempted = true;
    const succeeded = await this._invokeAction(session, "press");
    if (!this._isCurrent(session)) return;
    if (!succeeded) {
      await this._deactivateCurrent({
        retryStop: session.holdPlan?.requiresStop === true,
        reason: "move-failed",
      });
      return;
    }

    const delay = Number(session.holdPlan?.repeatIntervalMs);
    if (!Number.isFinite(delay) || delay <= 0) return;
    session.repeatTimer = this._setTimer(() => {
      session.repeatTimer = null;
      void this._runMove(session);
    }, delay);
  }

  _deactivateCurrent({ retryStop = false, reason = "release" } = {}) {
    const session = this._active;
    if (!session) return Promise.resolve();

    this._active = null;
    session.active = false;
    if (session.repeatTimer != null) {
      this._clearTimer(session.repeatTimer);
      session.repeatTimer = null;
    }

    if (
      !session.moveAttempted ||
      session.holdPlan?.requiresStop !== true ||
      !session.context
    ) {
      return Promise.resolve();
    }

    return retryStop
      ? this._sendStopWithRetries(session, reason)
      : this._invokeAction(session, "release").then(() => undefined);
  }

  _sendStopWithRetries(session, reason) {
    this._clearStopRetries();
    const retryToken = this._stopRetryToken;
    const firstStop = this._invokeAction(session, "release");

    for (const delay of this._stopRetryDelaysMs) {
      const timer = this._setTimer(() => {
        this._stopRetryTimers.delete(timer);
        if (retryToken !== this._stopRetryToken || this._active) return;
        void this._invokeAction(session, "release", reason);
      }, delay);
      this._stopRetryTimers.add(timer);
    }

    return firstStop.then(() => undefined);
  }

  async _invokeAction(session, eventType, reason = "") {
    try {
      await this._executeAction?.({
        ...session.context,
        action: session.action,
        eventType,
        reason,
      });
      return true;
    } catch (error) {
      this._reportError(error, eventType, session);
      return false;
    }
  }

  _clearStopRetries() {
    this._stopRetryToken += 1;
    for (const timer of this._stopRetryTimers) {
      this._clearTimer(timer);
    }
    this._stopRetryTimers.clear();
  }

  _isCurrent(session) {
    return session?.active === true && this._active === session;
  }

  _clearSessionIfCurrent(session) {
    if (!this._isCurrent(session)) return;
    session.active = false;
    this._active = null;
  }

  _reportError(error, phase, session) {
    this._onError?.(error, {
      action: session?.action || "",
      phase,
      strategy: session?.holdPlan?.strategy || "",
    });
  }
}
