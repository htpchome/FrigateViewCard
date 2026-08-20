export function resolveRecordingsDayBounds({
  tsSec = null,
  fallbackSec = null,
  getTzParts = () => ({}),
  toEpochSeconds = () => 0,
  nowSec = Date.now() / 1000,
}) {
  const target = Math.floor(tsSec || fallbackSec || nowSec);
  const parts = getTzParts(target);
  const start = toEpochSeconds(parts.year, parts.month, parts.day, 0, 0, 0);
  const end = toEpochSeconds(parts.year, parts.month, parts.day, 23, 59, 59);
  return { start, end };
}

export function resolveOffsetRecordingsDayBounds({
  offsetDays = 0,
  fallbackSec = null,
  getTzParts = () => ({}),
  toEpochSeconds = () => 0,
  nowSec = Date.now() / 1000,
}) {
  const base = getTzParts(fallbackSec || nowSec);
  const shifted = new Date(
    Date.UTC(base.year, base.month - 1, base.day + offsetDays, 12, 0, 0),
  );
  const year = shifted.getUTCFullYear();
  const month = shifted.getUTCMonth() + 1;
  const day = shifted.getUTCDate();

  return {
    start: toEpochSeconds(year, month, day, 0, 0, 0),
    end: toEpochSeconds(year, month, day, 23, 59, 59),
  };
}

export function buildRecordingsDayFetchChunks({
  bounds = null,
  before = null,
  chunkSeconds = 6 * 60 * 60,
} = {}) {
  const dayStart = Math.floor(Number(bounds?.start));
  const dayEnd = Math.floor(Number(bounds?.end));
  if (!Number.isFinite(dayStart) || !Number.isFinite(dayEnd)) return [];
  if (dayEnd <= dayStart) return [];

  const requestedBefore = Number(before);
  const effectiveEnd = Math.min(
    dayEnd,
    Number.isFinite(requestedBefore) && requestedBefore > dayStart
      ? Math.floor(requestedBefore)
      : dayEnd,
  );
  if (effectiveEnd <= dayStart) return [];

  const sliceSeconds = Math.max(60, Math.floor(Number(chunkSeconds) || 0));
  const chunks = [];
  for (let start = dayStart; start < effectiveEnd; start += sliceSeconds) {
    chunks.push({
      start,
      end: Math.min(effectiveEnd, start + sliceSeconds),
    });
  }
  return chunks.reverse();
}
