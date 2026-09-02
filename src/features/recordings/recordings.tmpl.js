import { escapeHtml, escapeHtmlAttribute } from "../../shared/html.js";

export function buildRecordingsListMarkup({
  recordings = [],
  emptyText = "No recordings in this day",
  recordingsIcon = "",
  downloadIcon = "",
  formatTime = () => "",
  nowSec = Date.now() / 1000,
}) {
  if (!Array.isArray(recordings) || !recordings.length) {
    return `<div class="empty">${escapeHtml(emptyText)}</div>`;
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
      const cameraEntity = escapeHtmlAttribute(recording._fvc_camera_entity || "");
      const member = String(recording._fvc_group_member || "");
      const memberAttribute = escapeHtmlAttribute(member);
      const cameraData = cameraEntity
        ? ` data-rec-camera-entity="${cameraEntity}"`
        : "";

      return `<div class="list-item shadow-xform shadow-small" data-rs="${recordingStart}" data-re="${recordingEnd}"${cameraData}>
        <div class="ric">${recordingsIcon}${member ? `<span class="recording-group-member">${escapeHtml(member)}</span>` : ""}</div>
        <div class="rinf">
          <div class="rt">${escapeHtml(formatTime(recording.start_time))} – ${escapeHtml(formatTime(recording.end_time || safeNowSec))}</div>
          <div class="rsub">${durationLabel}${recording.events ? ` · ${recording.events} ev` : ""}</div>
        </div>
        <button class="rp" data-rec-dl-start="${recordingStart}" data-rec-dl-end="${recordingEnd}"${cameraData} title="Download recording${member ? ` from camera ${memberAttribute}` : ""}" aria-label="Download recording${member ? ` from camera ${memberAttribute}` : ""}">${downloadIcon}</button>
      </div>`;
    })
    .join("");
}
