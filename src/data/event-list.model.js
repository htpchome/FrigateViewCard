export function buildEventListItemModel(eventItem, deps) {
  const {
    cap,
    labelColor,
    icons,
    media,
    durationLabel,
    dateTimeLabel,
    isKeptTab,
    showCameraLabel,
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
  const subl = eventItem?.sub_label
    ? `<span class="subl">${eventItem.sub_label}</span>`
    : "";
  const thumbSrc = media(eventItem?.id, "thumbnail.jpg");
  const thumb =
    eventItem?.has_snapshot || eventItem?.has_clip
      ? `<img src="${thumbSrc}" loading="lazy" data-thumb-id="${eventItem.id}" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'"><div class="tph" style="display:none">${icons.person}</div>`
      : `<div class="tph">${icons.person}</div>`;
  const badge = eventItem?.has_clip
    ? '<span class="bc">clip</span>'
    : eventItem?.has_snapshot
      ? '<span class="bs">snap</span>'
      : "";
  const dlClip = eventItem?.has_clip
    ? `<button class="ico" data-dl="${eventItem.id}" data-dl-file="clip.mp4" title="Download clip">${icons.download}</button>`
    : "";
  const dlSnap = eventItem?.has_snapshot
    ? `<button class="ico" data-dl="${eventItem.id}" data-dl-file="snapshot.jpg" title="Download snapshot">${icons.snapshot}</button>`
    : "";
  const camLabel = showCameraLabel
    ? `<span class="cam-badge">${String(eventItem?.camera || "").replace(/_/g, " ")}</span>`
    : "";
  const favBtn = eventItem?.retain_indefinitely
    ? `<button class="ico fav on" data-fav="${eventItem.id}">${icons.star}</button>`
    : `<button class="ico fav" data-fav="${eventItem.id}">${icons.starO}</button>`;

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
    dlClip,
    dlSnap,
    camLabel,
    favBtn,
    duration: durationLabel(eventItem),
    timeLabel: dateTimeLabel(eventItem?.start_time),
    description: eventItem?.data?.description || "",
  };
}

export function buildEventListItemHtml(model, { icons, expanded, compact }) {
  const desc =
    expanded && model.description
      ? `<div class="desc">${model.description}</div>`
      : "";
  return `
    <div class="list-item${compact ? " compact" : ""} shadow-small xform" data-ev="${model.id}">
      ${model.reviewBar}
      <div class="et">${model.thumb}<div class="ed">${model.duration}s</div></div>
      <div class="ei">
        <div class="etop"><span class="tb" style="background:${model.labelColorValue}33;color:${model.labelColorValue}">${model.labelText}</span>${model.subl}${model.badge}${model.camLabel}${model.score ? `<span class="esc">${model.score}</span>` : ""}</div>
        <div class="em"><span>${icons.clock}${model.timeLabel}</span>${model.zone ? `<span>${icons.pin}${model.zone}</span>` : ""}</div>
        ${desc}
      </div>
      <div class="eact${compact ? " h" : ""}">${model.favBtn}${model.dlClip}${model.dlSnap}</div>
    </div>`;
}
