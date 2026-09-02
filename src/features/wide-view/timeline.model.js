import {
  normalizeWideTimelineScale,
  WIDE_TIMELINE_DEFAULT_SCALE_HOURS,
  WIDE_TIMELINE_SCALE_OPTIONS_HOURS,
} from "./config.js";

export const WIDE_TIMELINE_SCALES = WIDE_TIMELINE_SCALE_OPTIONS_HOURS;
export const WIDE_TIMELINE_DEFAULT_SCALE =
  WIDE_TIMELINE_DEFAULT_SCALE_HOURS;

const TIMELINE_TOP_PADDING = 16;
const TIMELINE_BOTTOM_PADDING = 16;
// Match the standard browse-event thumbnail frame (160 × 90).
const TIMELINE_CARD_MAX_WIDTH = 160;
const TIMELINE_CARD_LEFT_RATIO = 0.38;
const TIMELINE_CARD_RIGHT_GAP = 28;
const TIMELINE_CARD_ASPECT_WIDTH = 16;
const TIMELINE_CARD_ASPECT_HEIGHT = 9;
const TIMELINE_CARD_GAP = 26;
const TIMELINE_STACK_VISUAL_OVERHANG = 30;
const TIMELINE_STACK_DISTANCE = 56;
const TIMELINE_REVIEW_KINDS = new Set(["alert", "review"]);
export const WIDE_TIMELINE_DEFAULT_PANEL_WIDTH = 408;
export const WIDE_TIMELINE_MIN_PANEL_WIDTH = 280;
export const WIDE_TIMELINE_MIN_BROWSE_WIDTH = 300;

const finiteNumber = (value, fallback = 0) => {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : fallback;
};

const uniqueStrings = (values) => [
  ...new Set(
    (Array.isArray(values) ? values : [])
      .map((value) => String(value || "").trim())
      .filter(Boolean),
  ),
];

const mediaDuration = (source) =>
  Math.max(
    1,
    Math.round(
      finiteNumber(source?.end_time, Date.now() / 1000) -
        finiteNumber(source?.start_time),
    ),
  );

const displayLabel = ({ event, review, capitalize }) => {
  const raw =
    review?.data?.metadata?.title ||
    review?.data?.objects?.[0] ||
    event?.label ||
    review?.severity ||
    "Event";
  return typeof capitalize === "function" ? capitalize(raw) : String(raw);
};

export { normalizeWideTimelineScale };

export const stepWideTimelineScale = (value, action) => {
  const current = normalizeWideTimelineScale(value);
  const index = WIDE_TIMELINE_SCALES.indexOf(current);
  if (action === "in") {
    return WIDE_TIMELINE_SCALES[Math.max(0, index - 1)];
  }
  if (action === "out") {
    return WIDE_TIMELINE_SCALES[
      Math.min(WIDE_TIMELINE_SCALES.length - 1, index + 1)
    ];
  }
  return current;
};

export const buildWideTimelineEntries = ({
  allEvents = [],
  visibleEvents = [],
  visibleReviews = [],
  mediaUrl = () => "",
  durationForEvent = null,
  capitalize = null,
} = {}) => {
  const eventById = new Map();
  for (const event of Array.isArray(allEvents) ? allEvents : []) {
    const id = String(event?.id || "").trim();
    if (id) eventById.set(id, event);
  }

  const entries = [];
  const renderedIds = new Set();
  const reviews = [...(Array.isArray(visibleReviews) ? visibleReviews : [])]
    .filter(Boolean)
    .sort(
      (left, right) =>
        finiteNumber(right?.start_time) - finiteNumber(left?.start_time),
    );

  for (const review of reviews) {
    const detectionIds = uniqueStrings(review?.data?.detections);
    for (const eventId of detectionIds) {
      if (renderedIds.has(eventId)) continue;
      const event = eventById.get(eventId) || null;
      const source = event || review;
      const startTime = finiteNumber(
        event?.start_time,
        finiteNumber(review?.start_time),
      );
      if (!startTime) continue;
      const duration =
        typeof durationForEvent === "function"
          ? durationForEvent(source)
          : mediaDuration(source);
      entries.push({
        id: eventId,
        eventId,
        reviewId: String(review?.id || ""),
        kind: "alert",
        startTime,
        reviewStartTime: finiteNumber(review?.start_time, startTime),
        camera: String(review?.camera || event?.camera || ""),
        label: displayLabel({ event, review, capitalize }),
        duration: Math.max(1, Math.round(finiteNumber(duration, 1))),
        hasClip: event?.has_clip === true,
        hasSnapshot: event?.has_snapshot === true,
        thumbnailUrl: mediaUrl(
          eventId,
          "thumbnail.jpg",
          review?.camera || event?.camera || "",
        ),
      });
      renderedIds.add(eventId);
    }
  }

  const events = [...(Array.isArray(visibleEvents) ? visibleEvents : [])]
    .filter(Boolean)
    .sort(
      (left, right) =>
        finiteNumber(right?.start_time) - finiteNumber(left?.start_time),
    );
  for (const event of events) {
    const eventId = String(event?.id || "").trim();
    if (
      !eventId ||
      renderedIds.has(eventId) ||
      (event?.has_clip !== true && event?.has_snapshot !== true)
    ) {
      continue;
    }
    const startTime = finiteNumber(event?.start_time);
    if (!startTime) continue;
    const duration =
      typeof durationForEvent === "function"
        ? durationForEvent(event)
        : mediaDuration(event);
    entries.push({
      id: eventId,
      eventId,
      reviewId: "",
      kind: "event",
      startTime,
      reviewStartTime: 0,
      camera: String(event?.camera || ""),
      label: displayLabel({ event, review: null, capitalize }),
      duration: Math.max(1, Math.round(finiteNumber(duration, 1))),
      hasClip: event?.has_clip === true,
      hasSnapshot: event?.has_snapshot === true,
      thumbnailUrl: mediaUrl(eventId, "thumbnail.jpg", event?.camera || ""),
    });
    renderedIds.add(eventId);
  }

  return entries.sort(
    (left, right) => right.startTime - left.startTime,
  );
};

const groupTimelineEntries = (positionedEntries) => {
  const groups = [];
  for (const entry of positionedEntries) {
    const current = groups.at(-1);
    if (
      current &&
      entry.markerY - current.anchorMarkerY <= TIMELINE_STACK_DISTANCE
    ) {
      current.entries.push(entry);
      current.lastMarkerY = entry.markerY;
      continue;
    }
    groups.push({
      id: `timeline-stack:${entry.id}`,
      anchorMarkerY: entry.markerY,
      lastMarkerY: entry.markerY,
      entries: [entry],
    });
  }
  for (const group of groups) {
    group.entries.sort((left, right) => {
      const leftPriority = TIMELINE_REVIEW_KINDS.has(left?.kind) ? 0 : 1;
      const rightPriority = TIMELINE_REVIEW_KINDS.has(right?.kind) ? 0 : 1;
      return (
        leftPriority - rightPriority ||
        finiteNumber(right?.startTime) - finiteNumber(left?.startTime)
      );
    });
  }
  return groups;
};

export const wideTimelineStackVisualDepth = (group, entryIndex) => {
  const count = group?.entries?.length || 0;
  if (!count) return 0;
  const activeIndex = Math.min(
    count - 1,
    Math.max(0, Number(group.activeIndex) || 0),
  );
  if (entryIndex === activeIndex) return 0;
  return Math.min(2, (entryIndex - activeIndex + count) % count || 1);
};

const positionTimelineGroups = ({
  groups,
  fallbackHeight,
}) => {
  let previousBottom = 0;
  for (const group of groups) {
    const cardHeight = Math.max(1, finiteNumber(fallbackHeight, 1));
    const desiredTop = Math.max(
      8,
      group.anchorMarkerY - cardHeight / 2,
    );
    group.cardTop = Math.max(desiredTop, previousBottom + TIMELINE_CARD_GAP);
    group.cardHeight = cardHeight;
    group.cardCenterY = group.cardTop + cardHeight / 2;
    previousBottom = group.cardTop + cardHeight;
  }
  return previousBottom;
};

export const buildWideTimelineLayout = ({
  entries = [],
  anchorEnd,
  rangeStart,
  viewportWidth,
  viewportHeight,
  scaleHours,
} = {}) => {
  const safeViewportWidth = Math.max(0, finiteNumber(viewportWidth, 320));
  const safeViewportHeight = Math.max(220, finiteNumber(viewportHeight, 480));
  const safeScaleHours = normalizeWideTimelineScale(scaleHours);
  const cardWidth = Math.max(
    1,
    Math.min(
      TIMELINE_CARD_MAX_WIDTH,
      safeViewportWidth * (1 - TIMELINE_CARD_LEFT_RATIO) -
        TIMELINE_CARD_RIGHT_GAP,
    ),
  );
  const cardHeight =
    (cardWidth * TIMELINE_CARD_ASPECT_HEIGHT) /
    TIMELINE_CARD_ASPECT_WIDTH;
  const newestEntryTime = Math.max(
    0,
    ...(Array.isArray(entries) ? entries : []).map((entry) =>
      finiteNumber(entry?.startTime),
    ),
  );
  const safeAnchorEnd = Math.max(
    finiteNumber(anchorEnd, Date.now() / 1000),
    newestEntryTime,
  );
  const oldestEntryTime = Math.min(
    safeAnchorEnd,
    ...(Array.isArray(entries) && entries.length
      ? entries.map((entry) => finiteNumber(entry?.startTime, safeAnchorEnd))
      : [safeAnchorEnd]),
  );
  const safeRangeStart = Math.min(
    finiteNumber(
      rangeStart,
      safeAnchorEnd - safeScaleHours * 3600,
    ),
    oldestEntryTime,
  );
  const usableViewportHeight = Math.max(
    1,
    safeViewportHeight - TIMELINE_TOP_PADDING - TIMELINE_BOTTOM_PADDING,
  );
  const pixelsPerSecond = usableViewportHeight / (safeScaleHours * 3600);
  const axisHeight = Math.max(
    safeViewportHeight,
    TIMELINE_TOP_PADDING +
      (safeAnchorEnd - safeRangeStart) * pixelsPerSecond +
      TIMELINE_BOTTOM_PADDING,
  );
  const positionedEntries = [...(Array.isArray(entries) ? entries : [])]
    .sort((left, right) => right.startTime - left.startTime)
    .map((entry) => ({
      ...entry,
      markerY: Math.max(
        TIMELINE_TOP_PADDING,
        Math.min(
          axisHeight - TIMELINE_BOTTOM_PADDING,
          TIMELINE_TOP_PADDING +
            (safeAnchorEnd - finiteNumber(entry?.startTime, safeAnchorEnd)) *
              pixelsPerSecond,
        ),
      ),
    }));
  const groups = groupTimelineEntries(positionedEntries);
  for (const group of groups) {
    group.id = `timeline-stack:${group.entries
      .map((entry) => entry.id)
      .join("|")}`;
  }
  const previousBottom = positionTimelineGroups({
    groups,
    fallbackHeight: cardHeight,
  });

  return {
    anchorEnd: safeAnchorEnd,
    rangeStart: safeRangeStart,
    scaleHours: safeScaleHours,
    viewportWidth: safeViewportWidth,
    viewportHeight: safeViewportHeight,
    cardWidth,
    cardHeight,
    pixelsPerSecond,
    axisHeight,
    contentHeight: Math.max(
      axisHeight,
      previousBottom + TIMELINE_STACK_VISUAL_OVERHANG,
    ),
    groups,
  };
};

export const timelineTickSecondsForScale = (scaleHours) => {
  const scale = normalizeWideTimelineScale(scaleHours);
  if (scale === 1) return 15 * 60;
  if (scale === 6) return 30 * 60;
  if (scale === 12) return 2 * 60 * 60;
  return 3 * 60 * 60;
};

export const timelineRefreshMsForScale = (scaleHours) => {
  const scale = normalizeWideTimelineScale(scaleHours);
  if (scale === 1) return 15_000;
  if (scale === 6) return 60_000;
  if (scale === 12) return 120_000;
  return 240_000;
};

export const buildWideTimelineTicks = ({
  anchorEnd,
  rangeStart,
  pixelsPerSecond,
  scaleHours,
  alignTimestamp = (timestamp, stepSeconds) =>
    Math.floor(timestamp / stepSeconds) * stepSeconds,
  formatTime = (timestamp) => String(timestamp),
  formatDay = () => "",
  dayKey = (timestamp) => String(Math.floor(timestamp / 86400)),
  isMajorTick = (timestamp) =>
    new Date(timestamp * 1000).getUTCMinutes() === 0,
} = {}) => {
  const stepSeconds = timelineTickSecondsForScale(scaleHours);
  const safeAnchorEnd = finiteNumber(anchorEnd);
  const safeRangeStart = finiteNumber(rangeStart);
  const safePixelsPerSecond = Math.max(0, finiteNumber(pixelsPerSecond));
  let timestamp = finiteNumber(
    alignTimestamp(safeAnchorEnd, stepSeconds),
    safeAnchorEnd,
  );
  if (timestamp > safeAnchorEnd) timestamp -= stepSeconds;
  const ticks = [];
  let previousDayKey = "";
  let guard = 0;
  while (timestamp >= safeRangeStart && guard < 2000) {
    const nextDayKey = dayKey(timestamp);
    const minor =
      normalizeWideTimelineScale(scaleHours) === 6 &&
      !isMajorTick(timestamp);
    ticks.push({
      timestamp,
      y:
        TIMELINE_TOP_PADDING +
        (safeAnchorEnd - timestamp) * safePixelsPerSecond,
      timeLabel: minor ? "" : formatTime(timestamp),
      dayLabel:
        nextDayKey !== previousDayKey ? formatDay(timestamp) : "",
      minor,
    });
    previousDayKey = nextDayKey;
    timestamp -= stepSeconds;
    guard += 1;
  }
  return ticks;
};

export const resolveWideTimelineResponsiveLayout = (
  availableWidth,
  preferredPanelWidth = WIDE_TIMELINE_DEFAULT_PANEL_WIDTH,
) => {
  const width = Math.max(0, finiteNumber(availableWidth));
  const maximumPanelWidth = Math.max(0, width - 24);
  const preferredWidth = Math.max(
    WIDE_TIMELINE_MIN_PANEL_WIDTH,
    finiteNumber(
      preferredPanelWidth,
      WIDE_TIMELINE_DEFAULT_PANEL_WIDTH,
    ),
  );
  const canPush =
    width >=
    WIDE_TIMELINE_MIN_PANEL_WIDTH + WIDE_TIMELINE_MIN_BROWSE_WIDTH;
  const panelWidth = canPush
    ? Math.min(
        preferredWidth,
        width - WIDE_TIMELINE_MIN_BROWSE_WIDTH,
      )
    : Math.min(preferredWidth, maximumPanelWidth);
  const remainingBrowseWidth = Math.max(0, width - panelWidth);
  return {
    panelWidth,
    remainingBrowseWidth,
    mode: canPush ? "push" : "overlay",
  };
};
