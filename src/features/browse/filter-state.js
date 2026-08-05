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

export function selectFilterLabels({
  tab,
  reviews = [],
  events = [],
  getLabels = () => [],
}) {
  if (tab === "alerts") {
    return collectFilterLabelsFromReviews(reviews, getLabels);
  }
  return collectFilterLabelsFromEvents(events);
}

export function selectFilterZones({
  tab,
  reviews = [],
  events = [],
  getZones = () => [],
}) {
  if (tab === "alerts") {
    return collectFilterZonesFromReviews(reviews, getZones);
  }
  return collectFilterZonesFromEvents(events);
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

export class BrowseFilterController {
  constructor(host, { buildFilterPanelMarkup } = {}) {
    this._host = host;
    this._buildFilterPanelMarkup = buildFilterPanelMarkup;
  }

  handleSidebarFilterClick(target) {
    const filterLabelOption = target.closest("[data-flabel]");
    if (filterLabelOption) {
      this._host._filterLabel = filterLabelOption.dataset.flabel;
      this.renderFilter();
      this._host._renderList();
      return true;
    }
    const filterZoneOption = target.closest("[data-fzone]");
    if (filterZoneOption) {
      this._host._filterZone = filterZoneOption.dataset.fzone;
      this.renderFilter();
      this._host._renderList();
      return true;
    }
    const favoriteOnlyOption = target.closest("[data-favonly]");
    if (favoriteOnlyOption) {
      this._host._favOnly = favoriteOnlyOption.dataset.favonly === "1";
      this.renderFilter();
      this._host._renderList();
      return true;
    }
    return false;
  }

  toggleFilter() {
    if (this._host._tab === "recordings") return;
    const filterPanel = this._host._$("#filter-panel");
    if (!filterPanel) return;
    const open = filterPanel.style.display === "none";
    const calendarPanel = this._host._$("#cal-panel");
    if (calendarPanel) calendarPanel.style.display = "none";
    filterPanel.style.display = open ? "block" : "none";
    this._host._syncToolbarButtons();
    if (open) this.renderFilter();
  }

  renderFilter() {
    const filterPanel = this._host.shadowRoot.querySelector("#filter-panel");
    if (!filterPanel || !this._buildFilterPanelMarkup) return;
    this.normalizeFilterSelections();
    filterPanel.innerHTML = this._buildFilterPanelMarkup({
      labels: ["all", ...this.labels()],
      zones: ["all", ...this.zones()],
      filterLabel: this._host._filterLabel,
      filterZone: this._host._filterZone,
      favOnly: this._host._favOnly,
    });
  }

  reviewsForTabBase() {
    return selectReviewsForFilterTab({
      reviews: this._host._reviews,
      gridReviews: this._host._allGridReviews(),
      isGridMixedListMode: this._host._isGridMixedListMode(),
      showAllReviews: this._host._activeCam?.alerts_content === "all_reviews",
    });
  }

  reviewSourceEvent(review) {
    const firstDet =
      (review?.data?.detections && review.data.detections[0]) || "";
    return firstDet ? this._host._findEventById(firstDet) : null;
  }

  filterOptionSourceEvents() {
    return selectFilterOptionSourceEvents({
      tab: this._host._tab,
      reviews: this.reviewsForTabBase(),
      keptEvents: this._host._isGridMixedListMode()
        ? this._host._allGridKeptEvents()
        : this._host._kept || [],
      displayEvents: this._host._allDisplayEvents(),
      getSourceEvent: (review) => this.reviewSourceEvent(review),
    });
  }

  matchesEventFilters(event) {
    return matchesEventFilters(event, {
      filterLabel: this._host._filterLabel,
      filterZone: this._host._filterZone,
      favOnly: this._host._favOnly,
    });
  }

  filteredReviews() {
    return this.reviewsForTabBase().filter((review) => {
      const sourceEvent = this.reviewSourceEvent(review);
      return matchesReviewFilters(review, sourceEvent, {
        filterLabel: this._host._filterLabel,
        filterZone: this._host._filterZone,
        favOnly: this._host._favOnly,
        getLabels: (candidateReview, candidateSourceEvent) =>
          this.reviewFilterLabels(candidateReview, candidateSourceEvent),
        getZones: (candidateReview, candidateSourceEvent) =>
          this.reviewFilterZones(candidateReview, candidateSourceEvent),
      });
    });
  }

  filteredKept() {
    return selectFilteredKeptEvents({
      keptEvents: this._host._kept || [],
      gridKeptEvents: this._host._allGridKeptEvents(),
      isGridMixedListMode: this._host._isGridMixedListMode(),
      matchesEvent: (event) => this.matchesEventFilters(event),
    });
  }

  normalizeFilterSelections() {
    const normalized = normalizeFilterSelections({
      filterLabel: this._host._filterLabel,
      filterZone: this._host._filterZone,
      labels: this.labels(),
      zones: this.zones(),
    });
    this._host._filterLabel = normalized.filterLabel;
    this._host._filterZone = normalized.filterZone;
  }

  zones() {
    return selectFilterZones({
      tab: this._host._tab,
      reviews: this.reviewsForTabBase(),
      events: this.filterOptionSourceEvents(),
      getZones: (review) => {
        const sourceEvent = this.reviewSourceEvent(review);
        return this.reviewFilterZones(review, sourceEvent);
      },
    });
  }

  labels() {
    return selectFilterLabels({
      tab: this._host._tab,
      reviews: this.reviewsForTabBase(),
      events: this.filterOptionSourceEvents(),
      getLabels: (review) => {
        const sourceEvent = this.reviewSourceEvent(review);
        return this.reviewFilterLabels(review, sourceEvent);
      },
    });
  }

  reviewFilterLabels(review, sourceEvent = null) {
    return buildReviewFilterLabels(review, sourceEvent);
  }

  reviewFilterZones(review, sourceEvent = null) {
    return buildReviewFilterZones(review, sourceEvent);
  }

  filtered() {
    return selectFilteredEvents({
      tab: this._host._tab,
      events: this._host._allDisplayEvents(),
      matchesEvent: (event) => this.matchesEventFilters(event),
    });
  }
}
