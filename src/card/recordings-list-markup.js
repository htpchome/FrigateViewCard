export function buildRecordingsListMarkup({
  recordings = [],
  emptyText = "No recordings in this day",
  recordingsIcon = "",
  downloadIcon = "",
  formatTime = () => "",
  nowSec = Date.now() / 1000,
}) {
  if (!Array.isArray(recordings) || !recordings.length) {
    return `<div class="empty">${emptyText}</div>`;
  }

  const safeNowSec = Math.floor(nowSec || Date.now() / 1000);

  return recordings
    .map((recording) => {
      const recordingStart = Math.floor(recording.start_time);
      const recordingEnd = Math.floor(recording.end_time || safeNowSec);
      const durationSec = Math.max(1, recordingEnd - recordingStart);
      const minutes = Math.floor(durationSec / 60);
      const seconds = durationSec % 60;
      const durationLabel = `${minutes ? `${minutes}m ` : ""}${seconds}s`;

      return `<div class="list-item shadow-xform shadow-small" data-rs="${recordingStart}" data-re="${recordingEnd}">
        <div class="ric">${recordingsIcon}</div>
        <div class="rinf">
          <div class="rt">${formatTime(recording.start_time)} – ${formatTime(recording.end_time || safeNowSec)}</div>
          <div class="rsub">${durationLabel}${recording.events ? ` · ${recording.events} ev` : ""}</div>
        </div>
        <button class="rp" data-rec-dl-start="${recordingStart}" data-rec-dl-end="${recordingEnd}" title="Download recording" aria-label="Download recording">${downloadIcon}</button>
      </div>`;
    })
    .join("");
}
