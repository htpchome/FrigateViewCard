import { escapeHtml, escapeHtmlAttribute } from "../../shared/html.js";

export function buildRecordingsListMarkup({
  recordings = [],
  emptyText = "No recordings in this day",
  recordingsIcon = "",
  downloadIcon = "",
  formatTime = () => "",
  nowSec = Date.now() / 1000,
  t,
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
      const downloadKey = member
        ? "runtime.browse.row.downloadRecordingFromCamera"
        : "runtime.browse.row.downloadRecording";
      const downloadFallback = member
        ? `Download recording from camera ${member}`
        : "Download recording";
      const downloadLabel = escapeHtmlAttribute(
        typeof t === "function"
          ? t(downloadKey, { camera: member })
          : downloadFallback,
      );
      const downloadValues = member
        ? ` data-fvc-i18n-values="${escapeHtmlAttribute(JSON.stringify({ camera: member }))}"`
        : "";
      const cameraData = cameraEntity
        ? ` data-rec-camera-entity="${cameraEntity}"`
        : "";

      return `<div class="list-item shadow-xform shadow-small" data-rs="${recordingStart}" data-re="${recordingEnd}"${cameraData}>
        <div class="ric">${recordingsIcon}${member ? `<span class="recording-group-member">${escapeHtml(member)}</span>` : ""}</div>
        <div class="rinf">
          <div class="rt">${escapeHtml(formatTime(recording.start_time))} – ${escapeHtml(formatTime(recording.end_time || safeNowSec))}</div>
          <div class="rsub">${durationLabel}${recording.events ? ` · ${escapeHtml(recording.events)} <span data-fvc-i18n="runtime.browse.row.eventAbbreviation">${escapeHtml(typeof t === "function" ? t("runtime.browse.row.eventAbbreviation") : "ev")}</span>` : ""}</div>
        </div>
        <button class="rp" data-rec-dl-start="${recordingStart}" data-rec-dl-end="${recordingEnd}"${cameraData} title="${downloadLabel}" aria-label="${downloadLabel}" data-fvc-i18n-title="${downloadKey}" data-fvc-i18n-aria-label="${downloadKey}"${downloadValues}>${downloadIcon}</button>
      </div>`;
    })
    .join("");
}
