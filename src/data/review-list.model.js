import { buildBrowseThumbnailImageMarkup } from "../features/browse/thumbnail.tmpl.js";
import { escapeHtml, escapeHtmlAttribute } from "../shared/html.js";

export function buildReviewListItemModel(review, deps) {
  const {
    cap,
    icons,
    labelColor,
    resolveSourceEvent,
    findEventById,
    media,
    durationLabel,
    dateTimeLabel,
    formatTime,
    formatDay,
    showDownloadButtons = true,
    showFavoriteButton = true,
    fallbackThumbSrc = "",
  } = deps || {};

  const sev = review?.severity === "alert" ? "alert" : "detection";
  const firstDet =
    (review?.data?.detections && review.data.detections[0]) || "";
  const sourceEvent = resolveSourceEvent(review);
  const favEv =
    sourceEvent ||
    (firstDet && typeof findEventById === "function"
      ? findEventById(firstDet)
      : null);
  const mediaEvent = sourceEvent || favEv;
  const metadataTitle = String(review?.data?.metadata?.title || "").trim();
  const rawObjects = (review?.data?.objects || []).filter(Boolean);
  if (!rawObjects.length) {
    rawObjects.push(metadataTitle || mediaEvent?.label || sev);
  }
  const seenObjects = new Set();
  const objects = rawObjects.filter((label) => {
    const key = String(label || "").trim().toLowerCase();
    if (!key || seenObjects.has(key)) return false;
    seenObjects.add(key);
    return true;
  });
  const objs = objects
    .map((label) => cap(label))
    .join(", ");
  const title = metadataTitle || objs || cap(review?.severity || "");
  const cameraLabel = String(review?.camera || mediaEvent?.camera || "")
    .replace(/_/g, " ")
    .trim();
  const mediaEventId = String(mediaEvent?.id || firstDet || "");
  const favBtn = showFavoriteButton && firstDet
    ? favEv?.retain_indefinitely
      ? `<button class="tool ico fav on" data-fav="${escapeHtmlAttribute(firstDet)}" title="Unfavorite">${icons.star}</button>`
      : `<button class="tool ico fav" data-fav="${escapeHtmlAttribute(firstDet)}" title="Favorite">${icons.starO}</button>`
    : "";
  const clipAction =
    showDownloadButtons && mediaEvent?.has_clip
      ? `<button class="tool ico" data-dl="${escapeHtmlAttribute(mediaEventId)}" data-dl-file="clip.mp4" title="Download clip">${icons.download}</button>`
      : "";
  const snapshotAction =
    showDownloadButtons && mediaEvent?.has_snapshot
      ? `<button class="tool ico" data-popup-event-id="${escapeHtmlAttribute(mediaEventId)}" data-popup-media-target="snapshot" title="View Snapshot">${icons.snapshot}</button>`
      : "";
  const objectTags = objects.map((label) => ({
    text: cap(label),
    color:
      typeof labelColor === "function"
        ? labelColor(String(label).toLowerCase())
        : "var(--c-primary-d)",
  }));
  const zone = String(
    review?.data?.zones?.[0] || mediaEvent?.zones?.[0] || "",
  );
  const reviewSubLabelValue = (
    Array.isArray(review?.data?.sub_labels)
      ? review.data.sub_labels
      : [review?.data?.sub_labels]
  )
    .filter((value) => typeof value === "string")
    .map((value) => value.trim())
    .find(Boolean);
  const subLabelValue =
    reviewSubLabelValue || String(mediaEvent?.sub_label || "").trim();

  return {
    reviewId: review?.id || "",
    firstDet,
    sev,
    severityLabel: cap(sev),
    title,
    cameraLabel,
    objectTags,
    subLabel: subLabelValue ? cap(subLabelValue) : "",
    subLabelColor:
      subLabelValue && typeof labelColor === "function"
        ? labelColor(subLabelValue.toLowerCase())
        : "",
    zone,
    favBtn,
    mediaActions: `${clipAction}${snapshotAction}`,
    thumbSrc: firstDet ? media(firstDet, "thumbnail.jpg") : "",
    fallbackThumbSrc,
    duration:
      typeof durationLabel === "function"
        ? durationLabel(mediaEvent || review)
        : null,
    timeLabel:
      typeof formatTime === "function"
        ? formatTime(review?.start_time)
        : dateTimeLabel?.(review?.start_time) || "",
    dayLabel:
      typeof formatDay === "function"
        ? formatDay(review?.start_time)
        : "",
  };
}

const NARROW_OBJECT_TAG_LIMIT = 2;

const buildReviewObjectTagsHtml = (model, { limit } = {}) => {
  const objectTags = model?.objectTags || [];
  const visibleTags = Number.isFinite(limit)
    ? objectTags.slice(0, Math.max(0, limit))
    : objectTags;
  const hiddenCount = objectTags.length - visibleTags.length;
  const tagsHtml = visibleTags
    .map(({ text, color }) => `<span class="tb review-object-tag list-bubble" style="--list-tag-color:${escapeHtmlAttribute(color)}">${escapeHtml(text)}</span>`)
    .join("");
  const overflowHtml = hiddenCount > 0
    ? `<span class="review-object-overflow list-bubble" title="${hiddenCount} more detected object${hiddenCount === 1 ? "" : "s"}" aria-label="${hiddenCount} more detected object${hiddenCount === 1 ? "" : "s"}">+${hiddenCount}</span>`
    : "";
  return `${tagsHtml}${overflowHtml}`;
};

const buildReviewSubLabelHtml = (model) =>
  model?.subLabel
    ? `<span class="subl list-bubble" style="--list-tag-color:${escapeHtmlAttribute(model.subLabelColor || "var(--c-primary-d)")}">${escapeHtml(model.subLabel)}</span>`
    : "";

const buildReviewCameraLabelHtml = (model) =>
  model?.cameraLabel
    ? `<span class="cam-badge list-bubble">${escapeHtml(model.cameraLabel)}</span>`
    : "";

const buildReviewTagsHtml = (model, options) =>
  `<div class="list-item-tags review-object-tags">${buildReviewCameraLabelHtml(model)}${buildReviewObjectTagsHtml(model, options)}${buildReviewSubLabelHtml(model)}</div>`;

const buildReviewMetaHtml = (
  model,
  { cap, icons, showSeverity = true },
) => `
  <div class="rev-m list-item-meta">
    <span class="list-item-meta-unit time-meta">${icons.clock || ""}<span>${escapeHtml(model.timeLabel)}</span></span>
    ${model.dayLabel ? `<span class="list-item-meta-unit date-meta">${icons.calendar || ""}<span>${escapeHtml(model.dayLabel)}</span></span>` : ""}
    ${model.zone ? `<span class="list-item-meta-unit zone-meta">${icons.pin || ""}<span>${escapeHtml(model.zone)}</span></span>` : ""}
    ${showSeverity ? `<span class="review-severity-chip review-severity-chip--${model.sev} list-bubble">${cap(model.sev)}</span>` : ""}
  </div>`;

export function buildReviewListItemStandardPresentationHtml(model, deps) {
  const { cap, icons } = deps || {};
  return `
        <div class="rev-inf list-item-middle list-item-middle--standard">
          <div class="rev-head">
            ${buildReviewTagsHtml(model)}
          </div>
          ${buildReviewMetaHtml(model, { cap, icons })}
        </div>
        <div class="eact list-item-actions list-item-actions--standard">${model.favBtn}${model.mediaActions}</div>`;
}

export function buildReviewListItemNarrowPresentationHtml(model, deps) {
  const { cap, icons } = deps || {};
  return `
        <div class="rev-inf list-item-middle list-item-middle--narrow">
          <div class="rev-head">
            ${buildReviewTagsHtml(model, { limit: NARROW_OBJECT_TAG_LIMIT })}
          </div>
          <div class="list-item-narrow-lower">
            ${buildReviewMetaHtml(model, {
              cap,
              icons,
              showSeverity: false,
            })}
            <div class="eact list-item-actions list-item-actions--narrow">${model.favBtn}${model.mediaActions}</div>
          </div>
        </div>`;
}

export function buildReviewListItemHtml(model, deps) {
  const { icons } = deps || {};
  const thumb = model?.firstDet
    ? `<div class="et ${model.sev}">
                ${buildBrowseThumbnailImageMarkup({
                  src: model.thumbSrc,
                  fallbackSrc: model.fallbackThumbSrc,
                  thumbId: model.firstDet,
                })}
                  <div class="tph" style="display:none">${icons.person}</div>
                  <span class="review-thumbnail-severity review-severity-chip review-severity-chip--${model.sev} list-bubble">${escapeHtml(model.severityLabel)}</span>
                  ${model.duration != null ? `<div class="ed">${escapeHtml(model.duration)}s</div>` : ""}
                </div>`
    : "";
  return `
      <div class="list-item list-item--review shadow-small xform" data-review-id="${escapeHtmlAttribute(model.reviewId)}" ${model.firstDet ? `data-review-open="${escapeHtmlAttribute(model.firstDet)}"` : ""}>

        ${thumb}
        ${buildReviewListItemStandardPresentationHtml(model, deps)}
        ${buildReviewListItemNarrowPresentationHtml(model, deps)}
      </div>`;
}
