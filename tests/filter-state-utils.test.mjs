import { test } from "node:test";
import assert from "node:assert/strict";

import {
  buildReviewFilterLabels,
  buildReviewFilterZones,
  collectFilterLabelsFromEvents,
  collectFilterLabelsFromReviews,
  collectFilterZonesFromEvents,
  collectFilterZonesFromReviews,
  collectUniqueSourceEventsFromReviews,
  matchesEventFilters,
  matchesReviewFilters,
  normalizeFilterSelections,
  selectFilteredEvents,
  selectFilteredKeptEvents,
  selectFilterOptionSourceEvents,
} from "../src/card/filter-state-utils.js";

test("buildReviewFilterLabels combines source event and review objects uniquely", () => {
  const labels = buildReviewFilterLabels(
    {
      data: {
        objects: ["person", "car", "person", ""],
      },
    },
    { label: "dog" },
  );

  assert.deepEqual(labels.sort(), ["car", "dog", "person"]);
});

test("buildReviewFilterZones combines source event and review zones uniquely", () => {
  const zones = buildReviewFilterZones(
    {
      data: {
        zones: ["driveway", "yard", "driveway", ""],
      },
    },
    { zones: ["front", "yard"] },
  );

  assert.deepEqual(zones.sort(), ["driveway", "front", "yard"]);
});

test("collectFilterLabelsFromEvents gathers unique event labels", () => {
  const labels = collectFilterLabelsFromEvents([
    { label: "person" },
    { label: "car" },
    { label: "person" },
    {},
  ]);

  assert.deepEqual(labels.sort(), ["car", "person"]);
});

test("collectFilterZonesFromEvents gathers unique event zones", () => {
  const zones = collectFilterZonesFromEvents([
    { zones: ["front", "driveway"] },
    { zones: ["front", "yard"] },
    {},
  ]);

  assert.deepEqual(zones.sort(), ["driveway", "front", "yard"]);
});

test("collectFilterLabelsFromReviews merges callback results uniquely", () => {
  const labels = collectFilterLabelsFromReviews(
    [{ id: 1 }, { id: 2 }, { id: 3 }],
    (review) => {
      if (review.id === 1) return ["person", "car"];
      if (review.id === 2) return ["person", "dog"];
      return [];
    },
  );

  assert.deepEqual(labels.sort(), ["car", "dog", "person"]);
});

test("collectFilterZonesFromReviews merges callback results uniquely", () => {
  const zones = collectFilterZonesFromReviews(
    [{ id: 1 }, { id: 2 }, { id: 3 }],
    (review) => {
      if (review.id === 1) return ["front", "yard"];
      if (review.id === 2) return ["yard", "driveway"];
      return [];
    },
  );

  assert.deepEqual(zones.sort(), ["driveway", "front", "yard"]);
});

test("collectUniqueSourceEventsFromReviews dedupes by source event id", () => {
  const eventA = { id: "event-a", label: "person" };
  const eventB = { id: "event-b", label: "car" };
  const reviews = [{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }];

  const events = collectUniqueSourceEventsFromReviews(reviews, (review) => {
    if (review.id === 1) return eventA;
    if (review.id === 2) return eventA;
    if (review.id === 3) return eventB;
    return null;
  });

  assert.deepEqual(events, [eventA, eventB]);
});

test("selectFilterOptionSourceEvents uses unique source events for alerts", () => {
  const eventA = { id: "event-a" };
  const eventB = { id: "event-b" };
  const reviews = [{ id: 1 }, { id: 2 }, { id: 3 }];

  const events = selectFilterOptionSourceEvents({
    tab: "alerts",
    reviews,
    keptEvents: [{ id: "kept-a" }],
    displayEvents: [{ id: "display-a" }],
    getSourceEvent: (review) => {
      if (review.id === 1) return eventA;
      if (review.id === 2) return eventA;
      return eventB;
    },
  });

  assert.deepEqual(events, [eventA, eventB]);
});

test("selectFilterOptionSourceEvents uses kept events for kept tab", () => {
  const keptEvents = [{ id: "kept-a" }, { id: "kept-b" }];

  const events = selectFilterOptionSourceEvents({
    tab: "kept",
    reviews: [{ id: 1 }],
    keptEvents,
    displayEvents: [{ id: "display-a" }],
    getSourceEvent: () => ({ id: "event-a" }),
  });

  assert.deepEqual(events, keptEvents);
  assert.notEqual(events, keptEvents);
});

test("selectFilterOptionSourceEvents uses display events for other tabs", () => {
  const displayEvents = [{ id: "display-a" }, { id: "display-b" }];

  const events = selectFilterOptionSourceEvents({
    tab: "clips",
    reviews: [{ id: 1 }],
    keptEvents: [{ id: "kept-a" }],
    displayEvents,
    getSourceEvent: () => ({ id: "event-a" }),
  });

  assert.deepEqual(events, displayEvents);
  assert.notEqual(events, displayEvents);
});

test("selectFilteredEvents filters clips before applying event matcher", () => {
  const events = selectFilteredEvents({
    tab: "clips",
    events: [
      { id: "a", has_clip: true, has_snapshot: false },
      { id: "b", has_clip: false, has_snapshot: true },
      { id: "c", has_clip: true, has_snapshot: true },
    ],
    matchesEvent: (event) => event.id !== "c",
  });

  assert.deepEqual(events, [{ id: "a", has_clip: true, has_snapshot: false }]);
});

test("selectFilteredEvents filters snapshots before applying event matcher", () => {
  const events = selectFilteredEvents({
    tab: "snapshot",
    events: [
      { id: "a", has_clip: true, has_snapshot: false },
      { id: "b", has_clip: false, has_snapshot: true },
      { id: "c", has_clip: true, has_snapshot: true },
    ],
    matchesEvent: (event) => event.id !== "b",
  });

  assert.deepEqual(events, [{ id: "c", has_clip: true, has_snapshot: true }]);
});

test("selectFilteredEvents applies matcher directly for non-media tabs", () => {
  const source = [
    { id: "a", has_clip: true, has_snapshot: false },
    { id: "b", has_clip: false, has_snapshot: true },
  ];

  const events = selectFilteredEvents({
    tab: "alerts",
    events: source,
    matchesEvent: (event) => event.id === "b",
  });

  assert.deepEqual(events, [{ id: "b", has_clip: false, has_snapshot: true }]);
  assert.notEqual(events, source);
});

test("selectFilteredKeptEvents uses kept events when not in grid mixed mode", () => {
  const keptEvents = [{ id: "kept-a" }, { id: "kept-b" }];

  const events = selectFilteredKeptEvents({
    keptEvents,
    gridKeptEvents: [{ id: "grid-a" }],
    isGridMixedListMode: false,
    matchesEvent: (event) => event.id === "kept-b",
  });

  assert.deepEqual(events, [{ id: "kept-b" }]);
});

test("selectFilteredKeptEvents uses grid kept events in grid mixed mode", () => {
  const gridKeptEvents = [{ id: "grid-a" }, { id: "grid-b" }];

  const events = selectFilteredKeptEvents({
    keptEvents: [{ id: "kept-a" }],
    gridKeptEvents,
    isGridMixedListMode: true,
    matchesEvent: (event) => event.id !== "grid-a",
  });

  assert.deepEqual(events, [{ id: "grid-b" }]);
  assert.notEqual(events, gridKeptEvents);
});

test("normalizeFilterSelections resets missing label and zone to all", () => {
  assert.deepEqual(
    normalizeFilterSelections({
      filterLabel: "person",
      filterZone: "yard",
      labels: ["car"],
      zones: ["front"],
    }),
    {
      filterLabel: "all",
      filterZone: "all",
    },
  );
});

test("normalizeFilterSelections preserves valid selections", () => {
  assert.deepEqual(
    normalizeFilterSelections({
      filterLabel: "person",
      filterZone: "yard",
      labels: ["person", "car"],
      zones: ["yard", "front"],
    }),
    {
      filterLabel: "person",
      filterZone: "yard",
    },
  );
});

test("matchesEventFilters handles label, zone, and favorite checks", () => {
  const event = {
    label: "person",
    zones: ["front", "yard"],
    retain_indefinitely: true,
  };

  assert.equal(
    matchesEventFilters(event, {
      filterLabel: "person",
      filterZone: "yard",
      favOnly: true,
    }),
    true,
  );

  assert.equal(
    matchesEventFilters(event, {
      filterLabel: "car",
      filterZone: "yard",
      favOnly: true,
    }),
    false,
  );

  assert.equal(
    matchesEventFilters(event, {
      filterLabel: "person",
      filterZone: "driveway",
      favOnly: true,
    }),
    false,
  );

  assert.equal(
    matchesEventFilters(
      {
        label: "person",
        zones: ["yard"],
        retain_indefinitely: false,
      },
      {
        filterLabel: "person",
        filterZone: "yard",
        favOnly: true,
      },
    ),
    false,
  );
});

test("matchesEventFilters rejects missing events", () => {
  assert.equal(matchesEventFilters(null), false);
});

test("matchesReviewFilters prefers favorite-only source event retention", () => {
  assert.equal(
    matchesReviewFilters(
      { id: "review-1" },
      { retain_indefinitely: true },
      {
        favOnly: true,
      },
    ),
    true,
  );

  assert.equal(
    matchesReviewFilters(
      { id: "review-1" },
      { retain_indefinitely: false },
      {
        favOnly: true,
      },
    ),
    false,
  );
});

test("matchesReviewFilters checks labels and zones through callbacks", () => {
  const review = { id: "review-2" };
  const sourceEvent = { id: "event-2", retain_indefinitely: false };

  assert.equal(
    matchesReviewFilters(review, sourceEvent, {
      filterLabel: "person",
      filterZone: "yard",
      getLabels: () => ["person", "car"],
      getZones: () => ["yard", "front"],
    }),
    true,
  );

  assert.equal(
    matchesReviewFilters(review, sourceEvent, {
      filterLabel: "dog",
      filterZone: "yard",
      getLabels: () => ["person", "car"],
      getZones: () => ["yard", "front"],
    }),
    false,
  );

  assert.equal(
    matchesReviewFilters(review, sourceEvent, {
      filterLabel: "person",
      filterZone: "driveway",
      getLabels: () => ["person", "car"],
      getZones: () => ["yard", "front"],
    }),
    false,
  );
});
