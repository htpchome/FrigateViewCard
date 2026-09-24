import { test } from "node:test";
import assert from "node:assert/strict";

import {
  createWideViewCompanionController,
  createWideViewTimelineControllers,
} from "../src/features/wide-view/composition.js";
import { PAGE_IDS } from "../src/features/navigation/router.js";

test("Wide View composition creates companion, timeline, and page controllers with stable dependencies", () => {
  const calls = [];
  const created = {};
  const companionController = { type: "companion" };
  const timelineController = { type: "timeline" };
  const pageController = { type: "page" };
  const factories = {
    createCompanionController: (card, constants) => {
      created.companion = { card, constants };
      return companionController;
    },
    createTimelineController: (card, options) => {
      created.timeline = { card, options };
      return timelineController;
    },
    createPageController: (card, constants, options) => {
      created.page = { card, constants, options };
      return pageController;
    },
  };
  const card = {
    _activeCam: {
      entity: "camera.front",
      group: { secondary_entity: "camera.side" },
    },
    _allGridEvents: () => [{ id: "grid-visible" }, { id: "grid-hidden" }],
    _browseFilterController: {
      filteredActiveCameraReviews: () => ["active-review"],
      filteredReviews: () => ["group-review"],
      matchesEventFilters: (event) => event.id.endsWith("visible"),
    },
    _calSelectedDay: "2026-09-23",
    _config: { event_days: 3, event_pre_post_roll_enabled: true },
    _dayKey: (timestamp) => `day:${timestamp}`,
    _events: [{ id: "event-visible" }, { id: "event-hidden" }],
    _isGridMixedListMode: () => false,
    _loading: true,
    _mediaForCamera: (...args) => `media:${args.join(":")}`,
    _pauseSlideshowForInteraction: () => calls.push(["pause"]),
    _popupMediaLoaderController: {
      showCarouselEventById: (...args) =>
        calls.push(["show-carousel", ...args]),
      showClipById: (...args) => calls.push(["show-alert", ...args]),
    },
    _time: (timestamp) => `time:${timestamp}`,
    _tzDateTimeToEpochSeconds: (...parts) => parts.join("-"),
    _tzParts: (timestamp) => [`parts:${timestamp}`],
    _weekdayDate: (...args) => `weekday:${args.join(":")}`,
    _winEnd: 2_000,
    _winStart: 1_000,
  };

  const createdCompanion = createWideViewCompanionController(card, {
    factories,
  });
  assert.equal(createdCompanion, companionController);
  assert.equal(created.companion.card, card);
  assert.equal(created.companion.constants.PAGE_IDS, PAGE_IDS);
  assert.equal(typeof created.companion.constants.ICONS.live, "string");

  const result = createWideViewTimelineControllers(card, {
    companionController,
    factories,
  });
  assert.deepEqual(result, {
    _wideViewTimelineController: timelineController,
    _wideViewPageController: pageController,
  });
  assert.equal(created.page.card, card);
  assert.deepEqual(created.page.constants, { PAGE_IDS });
  assert.deepEqual(created.page.options, {
    companionController,
    timelineController,
  });

  const { options } = created.timeline;
  assert.deepEqual(options.getAllEvents(), card._events);
  assert.deepEqual(options.getVisibleEvents(), [{ id: "event-visible" }]);
  assert.deepEqual(options.getVisibleReviews(), ["group-review"]);
  assert.equal(options.getWindowStart(), 1_000);
  assert.equal(options.getWindowEnd(), 2_000);
  assert.equal(
    options.getCameraKey(),
    "wide-group-mixed:camera.front|camera.side",
  );
  assert.equal(options.getSelectedDay(), "2026-09-23");
  assert.equal(options.isLoading(), true);
  assert.equal(options.mediaUrl("id", "clip", "front"), "media:id:clip:front");
  assert.equal(
    options.durationForEvent({ start_time: 100, end_time: 112 }),
    22,
  );
  assert.equal(options.capitalize("person"), "Person");
  assert.equal(options.formatTime(10), "time:10");
  assert.equal(options.formatDay(10), "weekday:10:weekdayDateDot");
  assert.equal(options.dayKey(10), "day:10");
  assert.deepEqual(options.timezoneParts(10), ["parts:10"]);
  assert.equal(options.timezoneDateTimeToEpoch(1, 2, 3), "1-2-3");

  options.onOpenEntry({
    kind: "alert",
    eventId: "alert-1",
    reviewStartTime: 100,
    camera: "front",
  });
  options.onOpenEntry({ eventId: "event-1", hasClip: false });
  assert.deepEqual(calls, [
    ["pause"],
    [
      "show-alert",
      "alert-1",
      { mediaType: "alert", startTime: 100, camera: "front" },
    ],
    ["pause"],
    ["show-carousel", "event-1", "snapshot"],
  ]);
});

test("Wide View timeline composition switches callbacks to mixed-grid data", () => {
  let timelineOptions;
  const card = {
    _activeCam: { entity: "camera.front" },
    _allGridEvents: () => [{ id: "grid" }],
    _browseFilterController: {
      filteredReviews: () => ["all-review"],
      matchesEventFilters: () => true,
    },
    _events: [{ id: "camera" }],
    _isGridMixedListMode: () => true,
  };
  const factories = {
    createTimelineController: (_card, options) => {
      timelineOptions = options;
      return { type: "timeline" };
    },
    createPageController: () => ({ type: "page" }),
  };

  createWideViewTimelineControllers(card, { factories });

  assert.deepEqual(timelineOptions.getAllEvents(), [{ id: "grid" }]);
  assert.deepEqual(timelineOptions.getVisibleEvents(), [{ id: "grid" }]);
  assert.deepEqual(timelineOptions.getVisibleReviews(), ["all-review"]);
  assert.equal(timelineOptions.getCameraKey(), "wide-grid-mixed");
});
