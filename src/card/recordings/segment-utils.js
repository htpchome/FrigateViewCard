export function mergeRecordingSegments(recordings = []) {
  if (!recordings.length) return [];

  const segments = [...recordings].sort((a, b) => a.start_time - b.start_time);
  const merged = [];
  let current = { ...segments[0] };

  for (let i = 1; i < segments.length; i++) {
    const segment = segments[i];
    const currentEnd = current.end_time || current.start_time;

    if (segment.start_time - currentEnd <= 60) {
      current.end_time = Math.max(
        currentEnd,
        segment.end_time || segment.start_time,
      );
      current.events = (current.events || 0) + (segment.events || 0);
      continue;
    }

    merged.push(current);
    current = { ...segment };
  }

  merged.push(current);
  return merged;
}

export function splitRecordingsHourly(
  recordings = [],
  nowSec = Date.now() / 1000,
) {
  const merged = mergeRecordingSegments(recordings).sort(
    (a, b) => a.start_time - b.start_time,
  );
  if (!merged.length) return [];

  const now = Math.floor(nowSec || Date.now() / 1000);
  const currentHourStart = Math.floor(now / 3600) * 3600;
  const firstHourStart = currentHourStart - 23 * 3600;
  const buckets = [];

  for (let i = 0; i < 24; i++) {
    const bucketStart = firstHourStart + i * 3600;
    const bucketEnd = bucketStart + 3600;
    const rowEnd = Math.min(bucketEnd, now);

    let overlapsRecording = false;
    let events = 0;
    for (const recording of merged) {
      const recordingStart = Math.floor(recording.start_time);
      const recordingEnd = Math.floor(recording.end_time || now);
      if (recordingStart < bucketEnd && recordingEnd > bucketStart) {
        overlapsRecording = true;
        events += recording.events || 0;
      }
    }

    if (overlapsRecording && rowEnd > bucketStart) {
      buckets.push({
        start_time: bucketStart,
        end_time: rowEnd,
        events,
      });
    }
  }

  return buckets;
}
