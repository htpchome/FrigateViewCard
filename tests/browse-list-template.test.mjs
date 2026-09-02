import { test } from "node:test";
import assert from "node:assert/strict";

import {
  buildBrowseEventsContentMarkup,
  buildBrowseKeptContentMarkup,
  buildBrowseLegendMarkup,
  buildBrowseReviewsContentMarkup,
  resolveBrowseControlsHeadingLabel,
  resolveBrowseListHeadingLabel,
  resolveBrowseRecordingsHeadingLabel,
  shouldShowBrowseStickyDayHeaders,
} from "../src/features/browse/list.tmpl.js";

const headingFormatters = {
  getWeekday: () => "Wed",
  getMonthDay: () => "Jul 31st",
  capitalize: (value) =>
    String(value || "").replace(/^./, (letter) => letter.toUpperCase()),
};

const renderItem = (item) => "<article>" + item.id + "</article>";

test("browse heading templates derive list, recordings, and controls labels", () => {
  assert.equal(
    resolveBrowseListHeadingLabel({
      tab: "alerts",
      timestamp: 1722470400,
      ...headingFormatters,
    }),
    "Wed - Jul 31st - Recent Alerts",
  );
  assert.equal(
    resolveBrowseListHeadingLabel({
      tab: "kept",
      timestamp: 1722470400,
      ...headingFormatters,
    }),
    "Favorites",
  );
  assert.equal(
    resolveBrowseRecordingsHeadingLabel({
      timestamp: 1722470400,
      windowEnd: 0,
      nowSec: 0,
      ...headingFormatters,
    }),
    "Wed - Jul 31st - Recordings",
  );
  assert.equal(
    resolveBrowseControlsHeadingLabel({
      cameraName: "Driveway",
      ptzReady: true,
    }),
    "Driveway · Frigate PTZ ready",
  );
});

test("browse sticky day selection is deterministic by tab", () => {
  assert.equal(shouldShowBrowseStickyDayHeaders("alerts"), true);
  assert.equal(shouldShowBrowseStickyDayHeaders("clips"), true);
  assert.equal(shouldShowBrowseStickyDayHeaders("snapshot"), true);
  assert.equal(shouldShowBrowseStickyDayHeaders("kept"), false);
  assert.equal(shouldShowBrowseStickyDayHeaders("recordings"), false);
});

test("browse event markup supports grouped and flat content with end markers", () => {
  const items = [{ id: 1, start_time: 1722470400 }];
  const grouped = buildBrowseEventsContentMarkup({
    items,
    showStickyDayHeaders: true,
    getDayKey: () => "2026-07-31",
    getLabel: () => "Wed - Jul 31st - Recent Alerts",
    renderItem,
    exhausted: true,
  });
  const flat = buildBrowseEventsContentMarkup({
    items,
    showStickyDayHeaders: false,
    renderItem,
    exhausted: false,
  });

  assert.equal(grouped.includes("list-day-sec"), true);
  assert.equal(grouped.includes("Wed - Jul 31st - Recent Alerts"), true);
  assert.equal(grouped.includes("<article>1</article>"), true);
  assert.equal(grouped.includes("— end —"), true);
  assert.equal(flat, "<article>1</article>");
});

test("browse kept and review markup preserve their distinct grouping rules", () => {
  const items = [{ id: 2, start_time: 1722470400 }];
  const kept = buildBrowseKeptContentMarkup({ items, renderItem });
  const reviews = buildBrowseReviewsContentMarkup({
    items,
    getDayKey: () => "2026-07-31",
    getLabel: () => "Recent Alerts",
    renderItem,
  });

  assert.equal(kept, "<article>2</article>");
  assert.equal(reviews.includes("list-day-sec"), true);
  assert.equal(reviews.includes("<article>2</article>"), true);
});

test("browse legend template produces deterministic label and camera entries", () => {
  const html = buildBrowseLegendMarkup({
    labels: ["person"],
    cameras: [{ name: "Front Door" }, { name: "Driveway" }],
    eventsMode: "all",
    cameraColors: ["rgba(1,2,3,.5)", "rgba(4,5,6,.5)"],
    getLabelColor: () => "red",
    capitalize: (value) => value[0].toUpperCase() + value.slice(1),
    getCameraName: (camera) => camera.name,
  });

  assert.equal(html.includes("Person"), true);
  assert.equal(html.includes("Front Door rec"), true);
  assert.equal(html.includes("Driveway rec"), true);
  assert.equal(html.includes("rgba"), false);
});
