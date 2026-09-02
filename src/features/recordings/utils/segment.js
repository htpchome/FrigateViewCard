export function mergeRecordingSegments(recordings = []) {
  if (!recordings.length) return [];

  const grouped = new Map();
  for (const recording of recordings) {
    const key = String(recording?._fvc_camera_entity || "");
    if (!grouped.has(key)) grouped.set(key, []);
    grouped.get(key).push(recording);
  }
  return [...grouped.values()]
    .flatMap((segments) => mergeRecordingGroup(segments))
    .sort((a, b) => a.start_time - b.start_time);
}

export const RECORDING_SEGMENT_EXTENSION_SECONDS = 5 * 60;

const CURRENT_RECORDING_TOLERANCE_SECONDS = 90;

export function resolveRecordingSegmentTimelineRange({
  recordings = [],
  start = 0,
  end = 0,
  extensionSec = RECORDING_SEGMENT_EXTENSION_SECONDS,
  nowSec = Date.now() / 1000,
} = {}) {
  const recordingStart = Math.max(0, Math.floor(Number(start) || 0));
  const recordingEnd = Math.max(
    recordingStart,
    Math.floor(Number(end) || recordingStart),
  );
  const extension = Math.max(0, Math.floor(Number(extensionSec) || 0));
  const now = Math.max(recordingEnd, Math.floor(Number(nowSec) || 0));
  const isCurrentRecording =
    recordingEnd >= now - CURRENT_RECORDING_TOLERANCE_SECONDS;
  const requestedStart = Math.max(0, recordingStart - extension);
  const requestedEnd = isCurrentRecording
    ? recordingEnd
    : Math.min(now, recordingEnd + extension);
  const available = mergeRecordingSegments(recordings).filter((recording) => {
    const availableStart = Number(recording?.start_time);
    const availableEnd = Number(recording?.end_time);
    return (
      Number.isFinite(availableStart) &&
      Number.isFinite(availableEnd) &&
      availableEnd >= availableStart
    );
  });

  const preceding = available.filter(
    (recording) =>
      Number(recording.start_time) <= recordingStart &&
      Number(recording.end_time) >= recordingStart,
  );
  const following = available.filter(
    (recording) =>
      Number(recording.start_time) <= recordingEnd &&
      Number(recording.end_time) >= recordingEnd,
  );

  const availableStart = preceding.length
    ? Math.min(...preceding.map((recording) => Number(recording.start_time)))
    : recordingStart;
  const availableEnd = following.length
    ? Math.max(...following.map((recording) => Number(recording.end_time)))
    : recordingEnd;

  return {
    start: Math.max(requestedStart, Math.min(recordingStart, availableStart)),
    end: isCurrentRecording
      ? recordingEnd
      : Math.min(requestedEnd, Math.max(recordingEnd, availableEnd)),
  };
}

function mergeRecordingGroup(recordings = []) {
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

  const grouped = new Map();
  for (const recording of merged) {
    const key = String(recording?._fvc_camera_entity || "");
    if (!grouped.has(key)) grouped.set(key, []);
    grouped.get(key).push(recording);
  }
  return [...grouped.values()]
    .flatMap((group) => splitRecordingGroupHourly(group, nowSec))
    .sort((a, b) => a.start_time - b.start_time);
}

function splitRecordingGroupHourly(merged, nowSec) {
  const metadata = merged[0] || {};

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
        ...(metadata._fvc_camera_entity
          ? {
              _fvc_camera_entity: metadata._fvc_camera_entity,
              _fvc_group_member: metadata._fvc_group_member || "",
            }
          : {}),
      });
    }
  }

  return buckets;
}
