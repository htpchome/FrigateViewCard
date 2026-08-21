import { cap, labelColor } from "../../helpers.js";
import { ICONS } from "../../icons.js";

export const buildPopupInfoDownloadActions = ({
  id = "",
  mediaType = "",
  hasClip = false,
  hasSnapshot = false,
  recStart = null,
  recEnd = null,
}) => {
  const normalizedMediaType = String(mediaType || "").toLowerCase();
  const actions = [];

  if (
    normalizedMediaType === "recording" &&
    Number.isFinite(recStart) &&
    Number.isFinite(recEnd)
  ) {
    actions.push({
      kind: "recording",
      label: "Download recording",
      recStart: Math.floor(recStart),
      recEnd: Math.floor(recEnd),
      icon: "download",
    });
    return actions;
  }

  if (!id) return actions;

  const currentFile =
    normalizedMediaType === "snapshot"
      ? "snapshot.jpg"
      : hasClip
        ? "clip.mp4"
        : hasSnapshot
          ? "snapshot.jpg"
          : "";

  if (currentFile) {
    actions.push({
      kind: "event",
      id,
      file: currentFile,
      label:
        currentFile === "snapshot.jpg" ? "Download snapshot" : "Download clip",
      icon: currentFile === "snapshot.jpg" ? "snapshot" : "download",
    });
  }

  if (hasSnapshot && currentFile !== "snapshot.jpg") {
    actions.push({
      kind: "event",
      id,
      file: "snapshot.jpg",
      label: "Download snapshot",
      icon: "snapshot",
    });
  }

  return actions;
};

export const buildPopupInfoModel = ({
  event = null,
  options = {},
  activeCamera = "",
  formatTime = () => "-",
  formatWeekday = () => "-",
  formatMonthDay = () => "-",
  formatEventDuration = () => 1,
} = {}) => {
  const id = event?.id || options.id || "";
  const mediaType =
    options.mediaType || (event?.has_clip ? "clip" : "snapshot");
  const hasContent = Boolean(event || id || mediaType === "recording");
  if (!hasContent) return null;

  const titleLabel = event?.label
    ? cap(event.label)
    : cap(mediaType || "event");
  const score =
    options.score != null
      ? options.score
      : event?.top_score != null
        ? `${Math.round(event.top_score * 100)}%`
        : "-";
  const zone =
    options.zone || (event?.zones?.length ? event.zones[0] : "-");
  const objects =
    options.objects ||
    (event?.data?.objects?.length
      ? event.data.objects.map(cap).join(", ")
      : event?.label
        ? cap(event.label)
        : "-");
  const startTs = options.startTime ?? event?.start_time;
  const time = startTs ? formatTime(startTs) : "-";
  const dayDate = startTs
    ? `${formatWeekday(startTs)} - ${formatMonthDay(startTs, { ordinal: true })}`
    : "-";
  const duration =
    options.durationSec != null
      ? `${Math.max(1, Math.round(options.durationSec))}s`
      : event
        ? `${formatEventDuration(event)}s`
        : "-";
  const camera = String(
    options.camera || event?.camera || activeCamera || "",
  ).replace(/_/g, " ") || "-";
  const hasClip = event?.has_clip ?? mediaType === "clip";
  const hasSnapshot = event?.has_snapshot ?? mediaType === "snapshot";

  return {
    id,
    mediaType,
    titleLabel,
    score,
    zone,
    objects,
    dayDate,
    time,
    duration,
    camera,
    recStart: options.recStart,
    recEnd: options.recEnd,
    downloadActions: buildPopupInfoDownloadActions({
      id,
      mediaType,
      hasClip,
      hasSnapshot,
      recStart: options.recStart,
      recEnd: options.recEnd,
    }),
  };
};

const buildPopupInfoDownloadButtonMarkup = (action, icons) => {
  const icon = icons[action.icon] || icons.download;
  if (action.kind === "recording") {
    return `<button class="popup-action" data-rec-dl-start="${action.recStart}" data-rec-dl-end="${action.recEnd}" title="${action.label}" aria-label="${action.label}">${icon}</button>`;
  }
  return `<button class="popup-action" data-dl="${action.id}" data-dl-file="${action.file}" title="${action.label}" aria-label="${action.label}">${icon}</button>`;
};

export const buildPopupInfoMarkup = ({
  event = null,
  model,
  icons = ICONS,
  resolveLabelColor = labelColor,
} = {}) => {
  if (!model) return { headText: "", infoHtml: "" };

  const color = resolveLabelColor(event?.label || model.mediaType);
  const downloadButtons = (model.downloadActions || [])
    .map((action) => buildPopupInfoDownloadButtonMarkup(action, icons))
    .join("");

  return {
    headText: `${cap(model.mediaType || "media")} - ${model.camera} - ${model.dayDate} - ${model.time}`,
    infoHtml: `
          <div class="popup-info-title">
            <span class="tb" style="background:${color}33;color:${color}">${model.titleLabel}</span>
            ${event?.sub_label ? `<span class="subl">${event.sub_label}</span>` : ""}
          </div>

          <div class="popup-info-body">
            <div class="popup-info-grid">
              <div class="popup-info-row"><span class="popup-info-k">Camera</span><span class="popup-info-v">${model.camera}</span></div>
              <div class="popup-info-row"><span class="popup-info-k">Day/Date</span><span class="popup-info-v">${model.dayDate}</span></div>
              <div class="popup-info-row"><span class="popup-info-k">Time</span><span class="popup-info-v">${model.time}</span></div>
              <div class="popup-info-row"><span class="popup-info-k">Duration</span><span class="popup-info-v">${model.duration}</span></div>
              <div class="popup-info-row"><span class="popup-info-k">Objects</span><span class="popup-info-v">${model.objects}</span></div>
              <div class="popup-info-row"><span class="popup-info-k">Zone</span><span class="popup-info-v">${model.zone}</span></div>
              <div class="popup-info-row"><span class="popup-info-k">Score</span><span class="popup-info-v">${model.score}</span></div>
            </div>
            <div class="popup-info-actions">${downloadButtons}</div>
          </div>
        `,
  };
};
