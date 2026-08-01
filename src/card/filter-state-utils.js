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
