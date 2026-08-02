const sortByStartTimeDesc = (items = []) =>
  [...items].sort((a, b) => (b?.start_time || 0) - (a?.start_time || 0));

export const shouldShowPopupCarousel = (mediaType = "") =>
  ["alert", "clip", "snapshot", "kept"].includes(
    String(mediaType || "").toLowerCase(),
  );

export const buildPopupCarouselEvents = ({
  mediaType = "",
  kept = [],
  reviews = [],
  displayEvents = [],
  findEventById = () => null,
}) => {
  const type = String(mediaType || "").toLowerCase();

  if (type === "kept") {
    return sortByStartTimeDesc(kept);
  }

  if (type === "alert") {
    const out = [];
    const seen = new Set();
    for (const review of sortByStartTimeDesc(reviews)) {
      const firstDetection = review?.data?.detections?.[0] || "";
      if (!firstDetection || seen.has(firstDetection)) continue;
      const event = findEventById(firstDetection);
      if (!event) continue;
      seen.add(firstDetection);
      out.push(event);
    }
    return out;
  }

  const all = sortByStartTimeDesc(displayEvents);
  if (type === "snapshot") return all.filter((event) => event.has_snapshot);
  return all.filter((event) => event.has_clip);
};

export const resolvePopupCarouselRenderPlan = ({
  mediaType = "",
  eventCount = 0,
  isTouchUi = false,
}) => {
  if (!shouldShowPopupCarousel(mediaType)) {
    return {
      shouldRender: false,
      shouldClear: true,
      hidden: true,
      touch: false,
    };
  }

  if (!(Number(eventCount || 0) > 0)) {
    return {
      shouldRender: false,
      shouldClear: true,
      hidden: true,
      touch: false,
    };
  }

  return {
    shouldRender: true,
    shouldClear: false,
    hidden: false,
    touch: Boolean(isTouchUi),
  };
};

export const resolvePopupCarouselActiveScrollLeft = ({
  activeOffsetLeft = 0,
  padding = 8,
}) => Math.max(0, Number(activeOffsetLeft || 0) - Number(padding || 0));
