export function buildRecordingsDayCacheKey(clientId, camera, bounds = {}) {
  return `${clientId}|${camera}|${bounds.start}|${bounds.end}`;
}

function recordingDayItemKey(recording = {}) {
  const id = String(recording?.id || "").trim();
  if (id) return `id:${id}`;
  const start = Number(recording?.start_time) || 0;
  const end = Number(recording?.end_time) || 0;
  const path = String(
    recording?.path || recording?.segment_path || recording?.file || "",
  );
  return `range:${start}:${end}:${path}`;
}

export function mergeRecordingDayChunks(current = [], incoming = []) {
  const recordings = new Map();
  for (const recording of [
    ...(Array.isArray(current) ? current : []),
    ...(Array.isArray(incoming) ? incoming : []),
  ]) {
    if (!recording || typeof recording !== "object") continue;
    recordings.set(recordingDayItemKey(recording), recording);
  }
  return [...recordings.values()].sort(
    (a, b) => Number(a?.start_time || 0) - Number(b?.start_time || 0),
  );
}

export function resolvePreparedRecordingsDayTransition({
  direction = 0,
  bounds = null,
  todayBounds = null,
  clientId = "",
  camera = "",
  dataCache = null,
}) {
  const emptyResult = {
    hasData: false,
    bounds,
    recs: [],
  };

  if (
    direction > 0 &&
    Number(bounds?.end || 0) > Number(todayBounds?.end || 0)
  ) {
    return {
      done: true,
      key: "",
      result: emptyResult,
    };
  }

  if (!clientId || !camera) {
    return {
      done: true,
      key: "",
      result: emptyResult,
    };
  }

  const key = buildRecordingsDayCacheKey(clientId, camera, bounds);
  if (dataCache?.has(key)) {
    const recordings = dataCache.get(key) || [];
    return {
      done: true,
      key,
      result: {
        hasData: recordings.length > 0,
        bounds,
        recs: recordings,
      },
    };
  }

  return {
    done: false,
    key,
    result: null,
  };
}

export function resolveCachedRecordingsAvailability({
  key = "",
  dataCache = null,
  availabilityCache = null,
}) {
  if (dataCache?.has(key)) {
    const recordings = dataCache.get(key) || [];
    return {
      found: true,
      hasRecordings: recordings.length > 0,
      shouldSyncAvailability: true,
    };
  }

  if (availabilityCache?.has(key)) {
    return {
      found: true,
      hasRecordings: !!availabilityCache.get(key),
      shouldSyncAvailability: false,
    };
  }

  return {
    found: false,
    hasRecordings: false,
    shouldSyncAvailability: false,
  };
}

export function normalizeFetchedRecordingsAvailability(recordings) {
  const safeRecordings = Array.isArray(recordings) ? recordings : [];
  return {
    recordings: safeRecordings,
    hasRecordings: safeRecordings.length > 0,
  };
}

export function resolveFetchedRecordingsAvailabilityState(recordings) {
  const normalized = normalizeFetchedRecordingsAvailability(recordings);
  return {
    recordings: normalized.recordings,
    hasRecordings: normalized.hasRecordings,
    availabilityValue: normalized.hasRecordings,
  };
}

export function resolveFailedRecordingsAvailabilityState() {
  return {
    recordings: null,
    hasRecordings: false,
    availabilityValue: false,
  };
}

export function resolveCommittedRecordingsDayState({
  bounds = null,
  recordings = null,
  clientId = "",
  camera = "",
}) {
  const safeRecordings = Array.isArray(recordings) ? recordings : [];
  return {
    bounds,
    recordings: safeRecordings,
    hasRecordings: safeRecordings.length > 0,
    key:
      clientId && camera && bounds
        ? buildRecordingsDayCacheKey(clientId, camera, bounds)
        : "",
  };
}

export function buildPreparedRecordingsDayResult(bounds, recordings) {
  const normalized = normalizeFetchedRecordingsAvailability(recordings);
  return {
    hasData: normalized.hasRecordings,
    bounds,
    recs: normalized.recordings,
  };
}
