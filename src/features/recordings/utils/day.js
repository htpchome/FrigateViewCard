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
