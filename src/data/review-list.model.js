export function buildReviewListItemModel(review, deps) {
  const {
    cap,
    icons,
    resolveSourceEvent,
    findEventById,
    media,
    dateTimeLabel,
  } = deps || {};

  const sev = review?.severity === "alert" ? "alert" : "detection";
  const objs = (review?.data?.objects || [])
    .map((label) => cap(label))
    .join(", ");
  const title =
    review?.data?.metadata?.title || objs || cap(review?.severity || "");
  const firstDet =
    (review?.data?.detections && review.data.detections[0]) || "";
  const sourceEvent = resolveSourceEvent(review);
  const cameraLabel = String(review?.camera || sourceEvent?.camera || "")
    .replace(/_/g, " ")
    .trim();
  const reviewed = !!review?.has_been_reviewed;
  const favEv = firstDet ? findEventById(firstDet) : null;
  const mediaEvent = sourceEvent || favEv;
  const mediaEventId = String(mediaEvent?.id || firstDet || "");
  const favBtn = firstDet
    ? favEv?.retain_indefinitely
      ? `<button class="ico fav on" data-fav="${firstDet}" title="Unfavorite">${icons.star}</button>`
      : `<button class="ico fav" data-fav="${firstDet}" title="Favorite">${icons.starO}</button>`
    : "";
  const dlClip = mediaEvent?.has_clip
    ? `<button class="ico" data-dl="${mediaEventId}" data-dl-file="clip.mp4" title="Download clip">${icons.download}</button>`
    : "";
  const dlSnap = mediaEvent?.has_snapshot
    ? `<button class="ico" data-dl="${mediaEventId}" data-dl-file="snapshot.jpg" title="Download snapshot">${icons.snapshot}</button>`
    : "";

  return {
    reviewId: review?.id || "",
    firstDet,
    sev,
    title,
    cameraLabel,
    reviewed,
    favBtn,
    dlClip,
    dlSnap,
    thumbSrc: firstDet ? media(firstDet, "thumbnail.jpg") : "",
    timeLabel: dateTimeLabel(review?.start_time),
  };
}

export function buildReviewListItemHtml(model, deps) {
  const { cap, icons } = deps || {};
  const thumb = model?.firstDet
    ? `<div class="et ${model.sev}">
                <img src="${model.thumbSrc}" loading="lazy" data-thumb-id="${model.firstDet}" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'">
                  <div class="tph" style="display:none">${icons.person}</div>
                </div>`
    : "";
  return `
      <div class="list-item shadow-small xform" data-review-id="${model.reviewId}" ${model.firstDet ? `data-review-open="${model.firstDet}"` : ""}>

        ${thumb}

        <div class="rev-inf">
          <div class="rev-t">${model.title}${model.cameraLabel ? ` <span class="cam-badge">${model.cameraLabel}</span>` : ""}</div>
          <div class="rev-m">
            <span class="time-meta">${icons.clock}${model.timeLabel}</span>
            <span class="review-meta">
              ${cap(model.sev)}${model.reviewed ? " · ✓" : model.firstDet ? " · tap" : ""}
            </span>
          </div>
        </div>
        <div class="eact">${model.favBtn}${model.dlClip}${model.dlSnap}</div>
      </div>`;
}
