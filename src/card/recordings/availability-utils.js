export function buildRecordingsDayCacheKey(clientId, camera, bounds = {}) {
  return `${clientId}|${camera}|${bounds.start}|${bounds.end}`;
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

export function buildPreparedRecordingsDayResult(bounds, recordings) {
  const normalized = normalizeFetchedRecordingsAvailability(recordings);
  return {
    hasData: normalized.hasRecordings,
    bounds,
    recs: normalized.recordings,
  };
}
