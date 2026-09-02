import { cap, labelColor } from "../../helpers.js";
import { ICONS } from "../../icons.js";
import { escapeHtml, escapeHtmlAttribute } from "../../shared/html.js";

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
      kind: "recording-segment",
      label: "Download Segment",
      icon: "filmstrip",
    });
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

  const addEventDownload = (file, label, icon = "download") => {
    actions.push({ kind: "event", id, file, label, icon });
  };
  const addMediaNavigation = (targetMediaType, label, icon) => {
    actions.push({
      kind: "media-navigation",
      id,
      targetMediaType,
      label,
      icon,
    });
  };

  if (normalizedMediaType === "snapshot") {
    if (hasSnapshot) {
      addEventDownload("snapshot.jpg", "Download snapshot");
    }
    if (hasClip) addMediaNavigation("clip", "View Clip", "clips");
    return actions;
  }

  if (["alert", "clip"].includes(normalizedMediaType)) {
    if (hasClip) addEventDownload("clip.mp4", "Download clip");
    if (hasSnapshot) {
      addMediaNavigation("snapshot", "View Snapshot", "snapshot");
    }
    return actions;
  }

  const currentFile =
    hasClip ? "clip.mp4" : hasSnapshot ? "snapshot.jpg" : "";

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
    options.displayMediaType ||
    options.mediaType ||
    (event?.has_clip ? "clip" : "snapshot");
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
  const shortDate = startTs
    ? formatMonthDay(startTs, { numeric: true })
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
  const hasClip =
    options.hasClip ?? event?.has_clip ?? mediaType === "clip";
  const hasSnapshot =
    options.hasSnapshot ?? event?.has_snapshot ?? mediaType === "snapshot";

  return {
    id,
    mediaType,
    titleLabel,
    score,
    zone,
    objects,
    dayDate,
    shortDate,
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
  const label = escapeHtmlAttribute(action.label);
  if (action.kind === "recording-segment") {
    return `<button class="popup-action" data-rec-segment-toggle type="button" title="${label}" aria-label="${label}" aria-controls="recording-segment-manager" aria-expanded="false" disabled>${icon}</button>`;
  }
  if (action.kind === "recording") {
    return `<button class="popup-action" data-rec-dl-start="${escapeHtmlAttribute(action.recStart)}" data-rec-dl-end="${escapeHtmlAttribute(action.recEnd)}" type="button" title="${label}" aria-label="${label}">${icon}</button>`;
  }
  if (action.kind === "media-navigation") {
    return `<button class="popup-action" data-popup-event-id="${escapeHtmlAttribute(action.id)}" data-popup-media-target="${escapeHtmlAttribute(action.targetMediaType)}" type="button" title="${label}" aria-label="${label}">${icon}</button>`;
  }
  return `<button class="popup-action" data-dl="${escapeHtmlAttribute(action.id)}" data-dl-file="${escapeHtmlAttribute(action.file)}" type="button" title="${label}" aria-label="${label}">${icon}</button>`;
};

export const buildPopupInfoMarkup = ({
  event = null,
  model,
  icons = ICONS,
  resolveLabelColor = labelColor,
} = {}) => {
  if (!model) return { headText: "", infoHtml: "" };

  const color = resolveLabelColor(event?.label || model.mediaType);
  const subLabel = String(event?.sub_label || "").trim();
  const subLabelColor = subLabel
    ? resolveLabelColor(subLabel.toLowerCase())
    : "";
  const downloadButtons = (model.downloadActions || [])
    .map((action) => buildPopupInfoDownloadButtonMarkup(action, icons))
    .join("");
  const compactTime = String(model.time || "-")
    .toLowerCase()
    .replace(/\s+(am|pm)$/i, "$1");
  const mediaHeading = cap(String(model.mediaType || "media").toLowerCase());
  const cameraHeading = cap(String(model.camera || "-").toLowerCase());
  const headText = `${mediaHeading} - ${cameraHeading} - ${compactTime} - ${model.shortDate}`;

  return {
    headText,
    infoHtml: `
          <h2 class="popup-info-head" id="popup-info-head"><span class="popup-info-head-text">${escapeHtml(headText)}</span></h2>
          <div class="popup-info-content">
            <div class="popup-info-title">
              <span class="tb" style="background:${escapeHtmlAttribute(color)}33;color:${escapeHtmlAttribute(color)}">${escapeHtml(model.titleLabel)}</span>
              ${subLabel ? `<span class="subl list-bubble" style="--list-tag-color:${escapeHtmlAttribute(subLabelColor)}">${escapeHtml(cap(subLabel))}</span>` : ""}
            </div>
            <div class="popup-info-grid">
              <div class="popup-info-row"><span class="popup-info-k">Camera</span><span class="popup-info-v">${escapeHtml(model.camera)}</span></div>
              <div class="popup-info-row"><span class="popup-info-k">Day/Date</span><span class="popup-info-v">${escapeHtml(model.dayDate)}</span></div>
              <div class="popup-info-row"><span class="popup-info-k">Time</span><span class="popup-info-v">${escapeHtml(model.time)}</span></div>
              <div class="popup-info-row"><span class="popup-info-k">Duration</span><span class="popup-info-v">${escapeHtml(model.duration)}</span></div>
              <div class="popup-info-row"><span class="popup-info-k">Objects</span><span class="popup-info-v">${escapeHtml(model.objects)}</span></div>
              <div class="popup-info-row"><span class="popup-info-k">Zone</span><span class="popup-info-v">${escapeHtml(model.zone)}</span></div>
              <div class="popup-info-row"><span class="popup-info-k">Score</span><span class="popup-info-v">${escapeHtml(model.score)}</span></div>
              <div class="popup-info-actions">${downloadButtons}</div>
            </div>
          </div>
        `,
  };
};
