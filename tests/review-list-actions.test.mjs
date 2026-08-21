import test from "node:test";
import assert from "node:assert/strict";

import { buildEventListItemModel } from "../src/data/event-list.model.js";
import {
  buildReviewListItemHtml,
  buildReviewListItemModel,
} from "../src/data/review-list.model.js";
import { buildPopupInfoDownloadActions } from "../src/features/popup/info.js";
import { MOBILE_VIEW_PAGE_STYLES } from "../src/features/mobile-view/page.styles.js";
import { STYLES } from "../src/styles.js";

const ICONS = {
  clock: "<clock />",
  download: "<download />",
  person: "<person />",
  snapshot: "<snapshot />",
  star: "<star />",
  starO: "<star-o />",
};

test("alert review rows render clip and snapshot download buttons from the source event", () => {
  const review = {
    id: "review-1",
    camera: "front_door",
    start_time: 1723000000,
    severity: "alert",
    data: {
      detections: ["event-1"],
      objects: ["person"],
    },
  };
  const sourceEvent = {
    id: "event-1",
    camera: "front_door",
    has_clip: true,
    has_snapshot: true,
    retain_indefinitely: false,
  };

  const model = buildReviewListItemModel(review, {
    cap: (value) =>
      String(value || "").replace(/^./, (char) => char.toUpperCase()),
    icons: ICONS,
    resolveSourceEvent: () => sourceEvent,
    findEventById: () => sourceEvent,
    media: (id, file) => `/media/${id}/${file}`,
    dateTimeLabel: () => "Fri · 8:44 pm",
  });

  const html = buildReviewListItemHtml(model, {
    cap: (value) =>
      String(value || "").replace(/^./, (char) => char.toUpperCase()),
    icons: ICONS,
  });

  assert.equal(html.includes('data-dl="event-1"'), true);
  assert.equal(html.includes('data-dl-file="clip.mp4"'), true);
  assert.equal(html.includes('data-dl-file="snapshot.jpg"'), true);
  assert.equal(html.includes('class="eact"'), true);
});

test("event and alert list rows can hide download buttons for mobile clients", () => {
  const eventModel = buildEventListItemModel(
    {
      id: "event-1",
      label: "person",
      start_time: 1723000000,
      end_time: 1723000010,
      has_clip: true,
      has_snapshot: true,
      retain_indefinitely: false,
    },
    {
      cap: (value) =>
        String(value || "").replace(/^./, (char) => char.toUpperCase()),
      labelColor: () => "#fff",
      icons: ICONS,
      media: (id, file) => `/media/${id}/${file}`,
      durationLabel: () => 10,
      dateTimeLabel: () => "Fri · 8:44 pm",
      isKeptTab: false,
      showCameraLabel: false,
      showDownloadButtons: false,
    },
  );

  const reviewModel = buildReviewListItemModel(
    {
      id: "review-1",
      camera: "front_door",
      start_time: 1723000000,
      severity: "alert",
      data: {
        detections: ["event-1"],
      },
    },
    {
      cap: (value) =>
        String(value || "").replace(/^./, (char) => char.toUpperCase()),
      icons: ICONS,
      resolveSourceEvent: () => ({
        id: "event-1",
        camera: "front_door",
        has_clip: true,
        has_snapshot: true,
        retain_indefinitely: false,
      }),
      findEventById: () => ({
        id: "event-1",
        has_clip: true,
        has_snapshot: true,
        retain_indefinitely: false,
      }),
      media: (id, file) => `/media/${id}/${file}`,
      dateTimeLabel: () => "Fri · 8:44 pm",
      showDownloadButtons: false,
    },
  );

  assert.equal(eventModel.dlClip, "");
  assert.equal(eventModel.dlSnap, "");
  assert.equal(reviewModel.dlClip, "");
  assert.equal(reviewModel.dlSnap, "");
});

test("popup clip downloads include a separate snapshot action when available", () => {
  const actions = buildPopupInfoDownloadActions({
    id: "event-1",
    mediaType: "clip",
    hasClip: true,
    hasSnapshot: true,
  });

  assert.deepEqual(actions, [
    {
      kind: "event",
      id: "event-1",
      file: "clip.mp4",
      label: "Download clip",
      icon: "download",
    },
    {
      kind: "event",
      id: "event-1",
      file: "snapshot.jpg",
      label: "Download snapshot",
      icon: "snapshot",
    },
  ]);
});

test("popup snapshot downloads do not duplicate the snapshot action", () => {
  const actions = buildPopupInfoDownloadActions({
    id: "event-1",
    mediaType: "snapshot",
    hasClip: false,
    hasSnapshot: true,
  });

  assert.deepEqual(actions, [
    {
      kind: "event",
      id: "event-1",
      file: "snapshot.jpg",
      label: "Download snapshot",
      icon: "snapshot",
    },
  ]);
});

test("list action buttons remain horizontal in shared and mobile styles", () => {
  assert.equal(
    STYLES.includes(
      ".list-item .eact{flex-direction:column;align-items:stretch;}",
    ),
    false,
  );
  assert.equal(
    MOBILE_VIEW_PAGE_STYLES.includes(".list-item .eact {") &&
      MOBILE_VIEW_PAGE_STYLES.includes("flex-direction: column;"),
    false,
  );
  assert.equal(MOBILE_VIEW_PAGE_STYLES.includes("flex-direction: row;"), true);
});
