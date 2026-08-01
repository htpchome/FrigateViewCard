export function buildRecordingsDayCacheKey(clientId, camera, bounds = {}) {
  return `${clientId}|${camera}|${bounds.start}|${bounds.end}`;
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
