import { buildBrowseThumbnailImageMarkup } from "../features/browse/thumbnail.tmpl.js";
import { escapeHtml, escapeHtmlAttribute } from "../shared/html.js";

const rowText = (t, key, fallback) =>
  typeof t === "function" ? t(`runtime.browse.row.${key}`) : fallback;

const rowActionLabel = (t, key, fallback) => {
  const text = escapeHtmlAttribute(rowText(t, key, fallback));
  const translationKey = `runtime.browse.row.${key}`;
  return `title="${text}" aria-label="${text}" data-fvc-i18n-title="${translationKey}" data-fvc-i18n-aria-label="${translationKey}"`;
};

const rowBadge = (className, t, key, fallback) =>
  `<span class="${className} list-bubble" data-fvc-i18n="runtime.browse.row.${key}">${escapeHtml(rowText(t, key, fallback))}</span>`;

export function buildEventListItemModel(eventItem, deps) {
  const {
    cap,
    labelColor,
    icons,
    media,
    durationLabel,
    dateTimeLabel,
    formatTime,
    formatDay,
    isKeptTab,
    browseTab = "",
    showCameraLabel,
    showDownloadButtons = true,
    showDurationBadge = true,
    fallbackThumbSrc = "",
    t,
  } = deps || {};

  const score =
    eventItem?.top_score != null
      ? `${Math.round(eventItem.top_score * 100)}%`
      : "";
  const reviewSev =
    eventItem?.severity === "alert"
      ? "alert"
      : eventItem?.severity === "detection"
        ? "detection"
        : "";
  const reviewBar =
    isKeptTab && reviewSev ? `<div class="rev-sev ${reviewSev}"></div>` : "";
  const zone =
    eventItem?.zones && eventItem.zones.length ? eventItem.zones[0] : "";
  const subLabelValue = String(eventItem?.sub_label || "").trim();
  const subLabelColor = subLabelValue
    ? labelColor(subLabelValue.toLowerCase())
    : "";
  const subl = subLabelValue
    ? `<span class="subl list-bubble" style="--list-tag-color:${escapeHtmlAttribute(subLabelColor)}">${escapeHtml(cap(subLabelValue))}</span>`
    : "";
  const thumbSrc = media(eventItem?.id, "thumbnail.jpg");
  const thumb =
    eventItem?.has_snapshot || eventItem?.has_clip
      ? `${buildBrowseThumbnailImageMarkup({
          src: thumbSrc,
          fallbackSrc: fallbackThumbSrc,
          thumbId: eventItem.id,
        })}<div class="tph" style="display:none">${icons.person}</div>`
      : `<div class="tph">${icons.person}</div>`;
  const isSnapshotTab = browseTab === "snapshot";
  const badge = isSnapshotTab
    ? rowBadge("bs", t, "snapshot", "Snapshot")
    : browseTab === "clips"
      ? rowBadge("bc", t, "clips", "Clips")
      : eventItem?.has_clip
        ? rowBadge("bc", t, "clip", "Clip")
        : eventItem?.has_snapshot
          ? rowBadge("bs", t, "snapshot", "Snapshot")
          : "";
  const clipAction =
    showDownloadButtons && eventItem?.has_clip
      ? isSnapshotTab
        ? `<button class="tool ico" data-popup-event-id="${escapeHtmlAttribute(eventItem.id)}" data-popup-media-target="clip" ${rowActionLabel(t, "viewClip", "View Clip")}>${icons.clips}</button>`
        : `<button class="tool ico" data-dl="${escapeHtmlAttribute(eventItem.id)}" data-dl-file="clip.mp4" ${rowActionLabel(t, "downloadClip", "Download clip")}>${icons.download}</button>`
      : "";
  const snapshotAction =
    showDownloadButtons && eventItem?.has_snapshot
      ? isSnapshotTab
        ? `<button class="tool ico" data-dl="${escapeHtmlAttribute(eventItem.id)}" data-dl-file="snapshot.jpg" ${rowActionLabel(t, "downloadSnapshot", "Download snapshot")}>${icons.download}</button>`
        : `<button class="tool ico" data-popup-event-id="${escapeHtmlAttribute(eventItem.id)}" data-popup-media-target="snapshot" ${rowActionLabel(t, "viewSnapshot", "View Snapshot")}>${icons.snapshot}</button>`
      : "";
  const mediaActions = isSnapshotTab
    ? `${snapshotAction}${clipAction}`
    : `${clipAction}${snapshotAction}`;
  const camLabel = showCameraLabel
    ? `<span class="cam-badge list-bubble">${escapeHtml(String(eventItem?.camera || "").replace(/_/g, " "))}</span>`
    : "";
  const favBtn = eventItem?.retain_indefinitely
    ? `<button class="tool ico fav on" data-fav="${escapeHtmlAttribute(eventItem.id)}" ${rowActionLabel(t, "unfavorite", "Unfavorite")}>${icons.star}</button>`
    : `<button class="tool ico fav" data-fav="${escapeHtmlAttribute(eventItem.id)}" ${rowActionLabel(t, "favorite", "Favorite")}>${icons.starO}</button>`;
  return {
    id: eventItem?.id,
    labelColorValue: labelColor(eventItem?.label),
    labelText: cap(eventItem?.label),
    score,
    reviewBar,
    zone,
    subl,
    thumb,
    badge,
    mediaActions,
    camLabel,
    favBtn,
    duration: showDurationBadge ? durationLabel(eventItem) : null,
    showDurationBadge,
    timeLabel:
      typeof formatTime === "function"
        ? formatTime(eventItem?.start_time)
        : dateTimeLabel?.(eventItem?.start_time) || "",
    dayLabel:
      typeof formatDay === "function"
        ? formatDay(eventItem?.start_time)
        : "",
    description: eventItem?.data?.description || "",
  };
}

const buildEventListItemTagsHtml = (model) =>
  `<div class="etop list-item-tags"><span class="tb list-bubble" style="--list-tag-color:${escapeHtmlAttribute(model.labelColorValue)}">${escapeHtml(model.labelText)}</span>${model.subl}${model.badge}${model.camLabel}${model.score ? `<span class="esc list-bubble">${escapeHtml(model.score)}</span>` : ""}</div>`;

const buildEventListItemMetaHtml = (model, icons) => `
  <div class="em list-item-meta">
    <span class="list-item-meta-unit time-meta">${icons.clock || ""}<span>${escapeHtml(model.timeLabel)}</span></span>
    ${model.dayLabel ? `<span class="list-item-meta-unit date-meta">${icons.calendar || ""}<span>${escapeHtml(model.dayLabel)}</span></span>` : ""}
    ${model.zone ? `<span class="list-item-meta-unit zone-meta">${icons.pin || ""}<span>${escapeHtml(model.zone)}</span></span>` : ""}
  </div>`;

export function buildEventListItemStandardPresentationHtml(
  model,
  { icons, descriptionHtml, compact },
) {
  return `
      <div class="ei list-item-middle list-item-middle--standard">
        ${buildEventListItemTagsHtml(model)}
        ${buildEventListItemMetaHtml(model, icons)}
        ${descriptionHtml}
      </div>
      <div class="eact list-item-actions list-item-actions--standard${compact ? " h" : ""}">${model.favBtn}${model.mediaActions}</div>`;
}

export function buildEventListItemNarrowPresentationHtml(
  model,
  { icons, descriptionHtml, compact },
) {
  return `
      <div class="ei list-item-middle list-item-middle--narrow">
        ${buildEventListItemTagsHtml(model)}
        <div class="list-item-narrow-lower">
          ${buildEventListItemMetaHtml(model, icons)}
          <div class="eact list-item-actions list-item-actions--narrow${compact ? " h" : ""}">${model.favBtn}${model.mediaActions}</div>
        </div>
        ${descriptionHtml}
      </div>`;
}

export function buildEventListItemHtml(model, { icons, expanded, compact }) {
  const desc =
    expanded && model.description
      ? `<div class="desc">${escapeHtml(model.description)}</div>`
      : "";
  return `
    <div class="list-item list-item--event${compact ? " compact" : ""} shadow-small xform" data-ev="${escapeHtmlAttribute(model.id)}">
      ${model.reviewBar}
      <div class="et">${model.thumb}${model.showDurationBadge ? `<div class="ed">${escapeHtml(model.duration)}s</div>` : ""}</div>
      ${buildEventListItemStandardPresentationHtml(model, {
        icons,
        descriptionHtml: desc,
        compact,
      })}
      ${buildEventListItemNarrowPresentationHtml(model, {
        icons,
        descriptionHtml: desc,
        compact,
      })}
    </div>`;
}
