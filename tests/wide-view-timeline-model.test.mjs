import { test } from "node:test";
import assert from "node:assert/strict";

import {
  buildWideTimelineEntries,
  buildWideTimelineLayout,
  buildWideTimelineTicks,
  normalizeWideTimelineScale,
  resolveWideTimelineResponsiveLayout,
  stepWideTimelineScale,
  timelineRefreshMsForScale,
} from "../src/features/wide-view/timeline.model.js";
import {
  buildWideTimelineContentMarkup,
  buildWideTimelinePanelMarkup,
} from "../src/features/wide-view/timeline.tmpl.js";
import { WIDE_VIEW_TIMELINE_STYLES } from "../src/features/wide-view/timeline.styles.js";

test("timeline deduplicates alert detections over regular events", () => {
  const alertEvent = {
    id: "event-alert",
    camera: "doorbell",
    label: "person",
    start_time: 1_000,
    end_time: 1_012,
    has_clip: true,
    has_snapshot: true,
  };
  const regularEvent = {
    id: "event-regular",
    camera: "doorbell",
    label: "car",
    start_time: 900,
    end_time: 907,
    has_clip: true,
    has_snapshot: true,
  };
  const ignoredEvent = {
    id: "event-no-media",
    start_time: 800,
    has_clip: false,
    has_snapshot: false,
  };
  const entries = buildWideTimelineEntries({
    allEvents: [alertEvent, regularEvent, ignoredEvent],
    visibleEvents: [alertEvent, regularEvent, ignoredEvent],
    visibleReviews: [
      {
        id: "review-alert",
        camera: "doorbell",
        severity: "alert",
        start_time: 995,
        data: { detections: ["event-alert"], objects: ["person"] },
      },
    ],
    mediaUrl: (id, file) => `/media/${id}/${file}`,
    durationForEvent: (event) => event.end_time - event.start_time,
    capitalize: (value) =>
      String(value).replace(/^./, (character) => character.toUpperCase()),
  });

  assert.deepEqual(
    entries.map(({ id, kind }) => [id, kind]),
    [
      ["event-alert", "alert"],
      ["event-regular", "event"],
    ],
  );
  assert.equal(entries[0].label, "Person");
  assert.equal(entries[0].thumbnailUrl, "/media/event-alert/thumbnail.jpg");
  assert.equal(entries[0].reviewStartTime, 995);
});

test("timeline scale steps between 1, 6, 12, and 24 hours", () => {
  assert.equal(normalizeWideTimelineScale("bad"), 12);
  assert.equal(stepWideTimelineScale(12, "in"), 6);
  assert.equal(stepWideTimelineScale(6, "in"), 1);
  assert.equal(stepWideTimelineScale(1, "in"), 1);
  assert.equal(stepWideTimelineScale(6, "out"), 12);
  assert.equal(stepWideTimelineScale(24, "out"), 24);
});

test("dense timeline activity stacks newest first and preserves every marker", () => {
  const entries = [
    {
      id: "newest",
      kind: "alert",
      startTime: 10_000,
      thumbnailUrl: "/newest.jpg",
    },
    {
      id: "middle",
      kind: "event",
      startTime: 9_990,
      thumbnailUrl: "/middle.jpg",
    },
    {
      id: "oldest",
      kind: "event",
      startTime: 9_980,
      thumbnailUrl: "/oldest.jpg",
    },
  ];
  const layout = buildWideTimelineLayout({
    entries,
    anchorEnd: 10_000,
    rangeStart: 6_400,
    viewportHeight: 500,
    scaleHours: 1,
  });

  assert.equal(layout.groups.length, 1);
  assert.equal(layout.cardWidth, 160);
  assert.equal(layout.cardHeight, 90);
  assert.deepEqual(
    layout.groups[0].entries.map(({ id }) => id),
    ["newest", "middle", "oldest"],
  );

  const markup = buildWideTimelineContentMarkup({
    layout,
    ticks: [],
    formatTime: () => "3:00 pm",
    icons: { right: "→" },
  });
  assert.equal(markup.match(/class="wide-timeline-marker/g)?.length, 3);
  assert.equal(markup.match(/<line class="wide-timeline-link/g)?.length, 3);
  assert.match(markup, /data-wide-timeline-entry="newest"/);
  assert.match(markup, /class="wide-timeline-card-main et alert/);
  assert.match(markup, />1\/3</);
  assert.match(markup, /3 events stacked/);
  assert.match(markup, /wide-timeline-card-underlay et depth-1[^>]*>[\s\S]*middle\.jpg/);
  assert.match(markup, /wide-timeline-card-underlay et depth-2[^>]*>[\s\S]*oldest\.jpg/);
  assert.match(markup, /--timeline-card-width:160px/);
  assert.match(markup, /--timeline-card-height:90px/);
});

test("mixed-camera timeline stacks place reviews above ordinary events", () => {
  const layout = buildWideTimelineLayout({
    entries: [
      {
        id: "newest-event",
        kind: "event",
        camera: "camera-a",
        startTime: 10_000,
      },
      {
        id: "newest-alert",
        kind: "alert",
        camera: "camera-b",
        startTime: 9_990,
      },
      {
        id: "older-review",
        kind: "review",
        camera: "camera-c",
        startTime: 9_980,
      },
      {
        id: "older-event",
        kind: "event",
        camera: "camera-b",
        startTime: 9_970,
      },
    ],
    anchorEnd: 10_000,
    rangeStart: 6_400,
    viewportHeight: 500,
    scaleHours: 1,
  });

  assert.equal(layout.groups.length, 1);
  assert.deepEqual(
    layout.groups[0].entries.map(({ id }) => id),
    ["newest-alert", "older-review", "newest-event", "older-event"],
  );
});

test("timeline keeps every source inside the standard fixed 16:9 frame", () => {
  const layout = buildWideTimelineLayout({
    entries: [
      { id: "wide", kind: "event", startTime: 10_000 },
      { id: "four-three", kind: "event", startTime: 9_400 },
    ],
    anchorEnd: 10_000,
    rangeStart: 6_400,
    viewportWidth: 320,
    viewportHeight: 500,
    scaleHours: 1,
  });
  const [wideGroup, fourThreeGroup] = layout.groups;

  assert.equal(wideGroup.cardHeight, 90);
  assert.equal(fourThreeGroup.cardHeight, 90);
  assert.ok(
    fourThreeGroup.cardTop >= wideGroup.cardTop + wideGroup.cardHeight + 26,
  );
  assert.match(
    WIDE_VIEW_TIMELINE_STYLES,
    /width:var\(--timeline-card-width,160px\)/,
  );
  assert.match(
    WIDE_VIEW_TIMELINE_STYLES,
    /height:var\(--timeline-card-height,90px\)/,
  );
  assert.match(
    WIDE_VIEW_TIMELINE_STYLES,
    /wide-timeline-card-main img \{[^}]*height:100%;[^}]*object-fit:cover/,
  );
});

test("timeline tick and responsive models scale with available space", () => {
  const layout = buildWideTimelineLayout({
    entries: [],
    anchorEnd: 86_400,
    rangeStart: 43_200,
    viewportHeight: 500,
    scaleHours: 12,
  });
  const ticks = buildWideTimelineTicks({
    anchorEnd: layout.anchorEnd,
    rangeStart: layout.rangeStart,
    pixelsPerSecond: layout.pixelsPerSecond,
    scaleHours: 12,
    formatTime: (timestamp) => String(timestamp),
    formatDay: () => "Day",
  });

  assert.ok(ticks.length >= 6);
  assert.deepEqual(resolveWideTimelineResponsiveLayout(1_000), {
    panelWidth: 408,
    remainingBrowseWidth: 592,
    mode: "push",
  });
  assert.deepEqual(resolveWideTimelineResponsiveLayout(620), {
    panelWidth: 320,
    remainingBrowseWidth: 300,
    mode: "push",
  });
  assert.equal(resolveWideTimelineResponsiveLayout(579).mode, "overlay");
  assert.deepEqual(resolveWideTimelineResponsiveLayout(1_000, 900), {
    panelWidth: 700,
    remainingBrowseWidth: 300,
    mode: "push",
  });
});

test("six-hour timeline adds unlabeled half-hour marks", () => {
  const ticks = buildWideTimelineTicks({
    anchorEnd: 7_200,
    rangeStart: 3_600,
    pixelsPerSecond: 0.1,
    scaleHours: 6,
    formatTime: (timestamp) => String(timestamp),
    isMajorTick: (timestamp) => timestamp % 3_600 === 0,
  });

  assert.equal(ticks[0].timestamp - ticks[1].timestamp, 1_800);
  assert.equal(ticks[0].minor, false);
  assert.equal(ticks[0].timeLabel, "7200");
  assert.equal(ticks[1].minor, true);
  assert.equal(ticks[1].timeLabel, "");
});

test("timeline clock cadence slows as the displayed range grows", () => {
  assert.equal(timelineRefreshMsForScale(1), 15_000);
  assert.equal(timelineRefreshMsForScale(6), 60_000);
  assert.equal(timelineRefreshMsForScale(12), 120_000);
  assert.equal(timelineRefreshMsForScale(24), 240_000);
});

test("timeline panel starts collapsed unless explicitly opened", () => {
  const collapsed = buildWideTimelinePanelMarkup({
    icons: { left: "L", right: "R" },
  });
  const open = buildWideTimelinePanelMarkup({
    icons: { left: "L", right: "R" },
    open: true,
    scaleHours: 6,
  });

  assert.match(collapsed, /aria-hidden="true"/);
  assert.match(collapsed, /aria-expanded="false"/);
  assert.match(open, /aria-hidden="false"/);
  assert.match(open, />6h<\/output>/);
  assert.doesNotMatch(open, /wide-timeline-resize/);
  assert.match(open, /Drag to resize or click to collapse Timeline/);
  assert.doesNotMatch(
    WIDE_VIEW_TIMELINE_STYLES,
    /wide-timeline-resize-handle/,
  );
  assert.match(
    WIDE_VIEW_TIMELINE_STYLES,
    /\.wide-timeline-open \.wide-timeline-toggle \{[^}]*cursor:col-resize/,
  );
  assert.match(
    WIDE_VIEW_TIMELINE_STYLES,
    /\.wide-timeline-toggle \{[^}]*height: 112px/,
  );
  assert.match(
    WIDE_VIEW_TIMELINE_STYLES,
    /\.wide-timeline-viewport \{[^}]*scrollbar-width:auto;[^}]*scrollbar-color:/,
  );
  assert.match(
    WIDE_VIEW_TIMELINE_STYLES,
    /\.wide-timeline-viewport::\-webkit-scrollbar \{width:10px;\}/,
  );
  assert.match(
    open,
    /data-wide-timeline-scale="in"[^>]*aria-label="Show less time">−<\/button>/,
  );
  assert.match(
    open,
    /data-wide-timeline-scale="out"[^>]*aria-label="Show more time">\+<\/button>/,
  );
});
