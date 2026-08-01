export function buildReviewFilterLabels(review, sourceEvent = null) {
  const labels = new Set();
  if (sourceEvent?.label) labels.add(sourceEvent.label);
  (review?.data?.objects || []).forEach((label) => {
    if (label) labels.add(label);
  });
  return [...labels];
}

export function buildReviewFilterZones(review, sourceEvent = null) {
  const zones = new Set();
  (sourceEvent?.zones || []).forEach((zone) => {
    if (zone) zones.add(zone);
  });
  (review?.data?.zones || []).forEach((zone) => {
    if (zone) zones.add(zone);
  });
  return [...zones];
}

export function collectFilterLabelsFromEvents(events) {
  const labels = new Set();
  (events || []).forEach((event) => {
    if (event?.label) labels.add(event.label);
  });
  return [...labels];
}

export function collectFilterZonesFromEvents(events) {
  const zones = new Set();
  (events || []).forEach((event) => {
    (event?.zones || []).forEach((zone) => {
      if (zone) zones.add(zone);
    });
  });
  return [...zones];
}

export function collectFilterLabelsFromReviews(reviews, getLabels) {
  const labels = new Set();
  (reviews || []).forEach((review) => {
    (getLabels(review) || []).forEach((label) => {
      if (label) labels.add(label);
    });
  });
  return [...labels];
}

export function collectFilterZonesFromReviews(reviews, getZones) {
  const zones = new Set();
  (reviews || []).forEach((review) => {
    (getZones(review) || []).forEach((zone) => {
      if (zone) zones.add(zone);
    });
  });
  return [...zones];
}

export function collectUniqueSourceEventsFromReviews(reviews, getSourceEvent) {
  const seen = new Set();
  const out = [];
  (reviews || []).forEach((review) => {
    const sourceEvent = getSourceEvent(review);
    if (!sourceEvent?.id || seen.has(sourceEvent.id)) return;
    seen.add(sourceEvent.id);
    out.push(sourceEvent);
  });
  return out;
}

export function selectFilterOptionSourceEvents({
  tab,
  reviews = [],
  keptEvents = [],
  displayEvents = [],
  getSourceEvent = () => null,
}) {
  if (tab === "alerts") {
    return collectUniqueSourceEventsFromReviews(reviews, getSourceEvent);
  }
  if (tab === "kept") {
    return [...keptEvents];
  }
  return [...displayEvents];
}

export function normalizeFilterSelections({
  filterLabel,
  filterZone,
  labels,
  zones,
}) {
  return {
    filterLabel:
      filterLabel !== "all" && !(labels || []).includes(filterLabel)
        ? "all"
        : filterLabel,
    filterZone:
      filterZone !== "all" && !(zones || []).includes(filterZone)
        ? "all"
        : filterZone,
  };
}

export function matchesEventFilters(
  event,
  { filterLabel = "all", filterZone = "all", favOnly = false } = {},
) {
  if (!event) return false;
  if (filterLabel !== "all" && event.label !== filterLabel) {
    return false;
  }
  if (filterZone !== "all" && !(event.zones || []).includes(filterZone)) {
    return false;
  }
  if (favOnly && !event.retain_indefinitely) {
    return false;
  }
  return true;
}

export function matchesReviewFilters(
  review,
  sourceEvent,
  {
    filterLabel = "all",
    filterZone = "all",
    favOnly = false,
    getLabels = () => [],
    getZones = () => [],
  } = {},
) {
  if (favOnly) return !!sourceEvent?.retain_indefinitely;
  if (filterLabel !== "all") {
    const labels = getLabels(review, sourceEvent);
    if (!labels.includes(filterLabel)) return false;
  }
  if (filterZone !== "all") {
    const zones = getZones(review, sourceEvent);
    if (!zones.includes(filterZone)) return false;
  }
  return true;
}

export function selectFilteredEvents({
  tab,
  events = [],
  matchesEvent = () => true,
}) {
  let filteredEvents = [...(events || [])];
  if (tab === "clips") {
    filteredEvents = filteredEvents.filter((event) => event?.has_clip);
  } else if (tab === "snapshot") {
    filteredEvents = filteredEvents.filter((event) => event?.has_snapshot);
  }
  return filteredEvents.filter((event) => matchesEvent(event));
}

export function selectFilteredKeptEvents({
  keptEvents = [],
  gridKeptEvents = [],
  isGridMixedListMode = false,
  matchesEvent = () => true,
}) {
  const source = isGridMixedListMode ? gridKeptEvents : keptEvents;
  return [...(source || [])].filter((event) => matchesEvent(event));
}

export function selectReviewsForFilterTab({
  reviews = [],
  gridReviews = [],
  isGridMixedListMode = false,
  showAllReviews = false,
}) {
  const reviewSource = isGridMixedListMode ? gridReviews : reviews;
  const safeReviews = [...(reviewSource || [])];
  return showAllReviews
    ? safeReviews
    : safeReviews.filter((review) => review?.severity === "alert");
}
