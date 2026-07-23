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
  const favBtn = firstDet
    ? favEv?.retain_indefinitely
      ? `<button class="ico fav on" data-fav="${firstDet}" title="Unfavorite">${icons.star}</button>`
      : `<button class="ico fav" data-fav="${firstDet}" title="Favorite">${icons.starO}</button>`
    : "";

  return {
    reviewId: review?.id || "",
    firstDet,
    sev,
    title,
    cameraLabel,
    reviewed,
    favBtn,
    thumbSrc: firstDet ? media(firstDet, "thumbnail.jpg") : "",
    timeLabel: dateTimeLabel(review?.start_time),
  };
}
