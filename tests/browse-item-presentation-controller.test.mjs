import assert from "node:assert/strict";
import { test } from "node:test";

import {
  renderBrowseEventListItem,
  renderBrowseReviewListItem,
} from "../src/features/browse/item-presentation.ctrl.js";

const translate = (key, values = {}) =>
  `${key}${values.name ? `:${values.name}` : ""}`;

const createHost = () => ({
  _activeCam: { entity: "camera.front" },
  _browseCollectionController: {
    findReviewForEvent: () => ({ id: "review-1" }),
  },
  _browseFilterController: {
    reviewSourceEvent: () => null,
  },
  _config: {
    cameras: [
      { entity: "camera.front" },
      { entity: "camera.driveway" },
    ],
    hidden_tabs: [],
    event_pre_post_roll_enabled: true,
  },
  _eventsMode: "all",
  _findEventById: () => null,
  _isGridMixedListMode: () => false,
  _isLikelyMobileClient: () => false,
  _localization: { t: translate },
  _media: (id, file) => `shared/${id}/${file}`,
  _mediaForCamera: (id, file, camera) =>
    `camera/${camera}/${id}/${file}`,
  _reviewThumbnailForCamera: (_review, camera) =>
    `fallback/${camera}.jpg`,
  _tab: "clips",
  _time: () => "3:00 pm",
  _weekdayDate: () => "Wed Sep 23",
});

test("browse event presentation coordinates camera media and display policy", () => {
  const host = createHost();
  const html = renderBrowseEventListItem(
    host,
    {
      id: "event-1",
      camera: "front",
      label: "person",
      sub_label: "resident",
      zones: ["porch"],
      top_score: 0.91,
      start_time: 100,
      end_time: 112,
      has_clip: true,
      has_snapshot: true,
      data: { description: "At the door" },
    },
    true,
    true,
  );

  assert.match(html, /data-ev="event-1"/);
  assert.match(html, /list-item--event compact/);
  assert.match(html, /src="camera\/front\/event-1\/thumbnail.jpg"/);
  assert.match(html, /data-thumb-fallback-src="fallback\/front.jpg"/);
  assert.match(html, /class="cam-badge list-bubble">front</);
  assert.match(html, /data-dl="event-1" data-dl-file="clip.mp4"/);
  assert.match(html, /data-fav="event-1"/);
  assert.match(html, /<div class="ed">22s<\/div>/);
  assert.match(html, /<div class="desc">At the door<\/div>/);
});

test("browse event presentation hides mobile actions and snapshot duration", () => {
  const host = createHost();
  host._isLikelyMobileClient = () => true;
  host._tab = "snapshot";
  host._config.hidden_tabs = ["kept"];
  const html = renderBrowseEventListItem(host, {
    id: "event-2",
    camera: "front",
    label: "car",
    start_time: 100,
    end_time: 105,
    has_clip: true,
    has_snapshot: true,
  });

  assert.doesNotMatch(html, /data-dl=|data-fav=|data-popup-event-id=/);
  assert.doesNotMatch(html, /<div class="ed">/);
});

test("browse review presentation selects grouped-camera media and options", () => {
  const host = createHost();
  host._activeCam = {
    entity: "camera.front",
    group: { secondary_entity: "camera.driveway" },
  };
  const sourceEvent = {
    id: "event-3",
    camera: "driveway",
    label: "person",
    zones: ["drive"],
    start_time: 100,
    end_time: 112,
    has_clip: true,
    has_snapshot: true,
  };
  host._browseFilterController.reviewSourceEvent = () => sourceEvent;
  host._findEventById = () => sourceEvent;
  const html = renderBrowseReviewListItem(
    host,
    {
      id: "review-3",
      camera: "driveway",
      severity: "alert",
      start_time: 100,
      data: {
        detections: ["event-3"],
        objects: ["person"],
        zones: ["drive"],
      },
    },
    { showDownloadButtons: false, showFavoriteButton: false },
  );

  assert.match(html, /data-review-id="review-3"/);
  assert.match(html, /src="camera\/driveway\/event-3\/thumbnail.jpg"/);
  assert.match(html, /data-thumb-fallback-src="fallback\/driveway.jpg"/);
  assert.doesNotMatch(html, /data-dl=|data-fav=/);
  assert.match(html, /<div class="ed">22s<\/div>/);
});
