const MIN_WAIT_MS = 500;

const normalizeWaitMs = (value, fallback) =>
  Math.max(MIN_WAIT_MS, Number(value ?? fallback));

const normalizeNumber = (value, fallback) => Number(value ?? fallback);

export const resolveHaDirectStartup = (startup = {}) => ({
  waitMs: normalizeWaitMs(startup.waitMs, 8000),
  minCurrentTime: normalizeNumber(startup.minCurrentTime, 0.05),
  minDecodedFrames: normalizeNumber(startup.minDecodedFrames, 1),
  requireReadyState: normalizeNumber(startup.requireReadyState, 0),
  strict: startup.strict ?? false,
  streamType: startup.streamType,
});

export const resolveMseStartup = (startup = {}) => ({
  waitMs: normalizeWaitMs(startup.waitMs, 8000),
  minCurrentTime: normalizeNumber(startup.minCurrentTime, 0.2),
  minDecodedFrames: normalizeNumber(startup.minDecodedFrames, 2),
  requireReadyState: normalizeNumber(startup.requireReadyState, 3),
  strict: startup.strict !== false,
});

export const resolveWebRtcStartup = ({ startup = {}, isFirefox = false }) => ({
  waitMs: normalizeWaitMs(startup.waitMs, 7000),
  minCurrentTime: normalizeNumber(
    startup.minCurrentTime,
    isFirefox ? 0.15 : 0.05,
  ),
  minDecodedFrames: normalizeNumber(
    startup.minDecodedFrames,
    isFirefox ? 2 : 1,
  ),
  requireReadyState: normalizeNumber(
    startup.requireReadyState,
    isFirefox ? 3 : 0,
  ),
  strict: startup.strict ?? (isFirefox ? true : false),
});

export const resolveHlsStartup = (startup = {}) => ({
  waitMs: normalizeWaitMs(startup.waitMs, 5000),
});
