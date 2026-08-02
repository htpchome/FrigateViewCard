import { test } from "node:test";
import assert from "node:assert/strict";

import {
  buildPopupCarouselEvents,
  resolvePopupCarouselActiveScrollLeft,
  resolvePopupCarouselRenderPlan,
  shouldShowPopupCarousel,
} from "../src/card/popup-carousel-utils.js";

test("shouldShowPopupCarousel only enables supported popup media types", () => {
  assert.equal(shouldShowPopupCarousel("alert"), true);
  assert.equal(shouldShowPopupCarousel("snapshot"), true);
  assert.equal(shouldShowPopupCarousel("recording"), false);
  assert.equal(shouldShowPopupCarousel(""), false);
});

test("buildPopupCarouselEvents sorts kept events by start time descending", () => {
  const events = buildPopupCarouselEvents({
    mediaType: "kept",
    kept: [
      { id: "older", start_time: 10 },
      { id: "newer", start_time: 20 },
    ],
  });
  assert.deepEqual(
    events.map((event) => event.id),
    ["newer", "older"],
  );
});

test("buildPopupCarouselEvents resolves unique alert detections in review order", () => {
  const byId = new Map([
    ["ev-1", { id: "ev-1", start_time: 11 }],
    ["ev-2", { id: "ev-2", start_time: 12 }],
  ]);
  const events = buildPopupCarouselEvents({
    mediaType: "alert",
    reviews: [
      { start_time: 10, data: { detections: ["ev-1"] } },
      { start_time: 20, data: { detections: ["ev-2"] } },
      { start_time: 30, data: { detections: ["ev-2"] } },
      { start_time: 40, data: { detections: ["missing"] } },
    ],
    findEventById: (id) => byId.get(id) || null,
  });
  assert.deepEqual(
    events.map((event) => event.id),
    ["ev-2", "ev-1"],
  );
});

test("buildPopupCarouselEvents filters snapshot and clip media from display events", () => {
  const displayEvents = [
    {
      id: "snapshot-only",
      start_time: 10,
      has_snapshot: true,
      has_clip: false,
    },
    { id: "both", start_time: 30, has_snapshot: true, has_clip: true },
    { id: "clip-only", start_time: 20, has_snapshot: false, has_clip: true },
  ];

  assert.deepEqual(
    buildPopupCarouselEvents({
      mediaType: "snapshot",
      displayEvents,
    }).map((event) => event.id),
    ["both", "snapshot-only"],
  );

  assert.deepEqual(
    buildPopupCarouselEvents({
      mediaType: "clip",
      displayEvents,
    }).map((event) => event.id),
    ["both", "clip-only"],
  );
});

test("resolvePopupCarouselRenderPlan hides unsupported and empty carousel states", () => {
  assert.deepEqual(
    resolvePopupCarouselRenderPlan({
      mediaType: "recording",
      eventCount: 3,
      isTouchUi: true,
    }),
    {
      shouldRender: false,
      shouldClear: true,
      hidden: true,
      touch: false,
    },
  );

  assert.deepEqual(
    resolvePopupCarouselRenderPlan({
      mediaType: "clip",
      eventCount: 0,
      isTouchUi: true,
    }),
    {
      shouldRender: false,
      shouldClear: true,
      hidden: true,
      touch: false,
    },
  );

  assert.deepEqual(
    resolvePopupCarouselRenderPlan({
      mediaType: "clip",
      eventCount: 2,
      isTouchUi: true,
    }),
    {
      shouldRender: true,
      shouldClear: false,
      hidden: false,
      touch: true,
    },
  );
});

test("resolvePopupCarouselActiveScrollLeft clamps the active item target", () => {
  assert.equal(
    resolvePopupCarouselActiveScrollLeft({ activeOffsetLeft: 40 }),
    32,
  );
  assert.equal(
    resolvePopupCarouselActiveScrollLeft({ activeOffsetLeft: 4 }),
    0,
  );
});
