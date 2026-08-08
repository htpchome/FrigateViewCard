import test from "node:test";
import assert from "node:assert/strict";

import {
  buildReviewListItemHtml,
  buildReviewListItemModel,
} from "../src/data/review-list.model.js";
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

test("narrow list styles stack action buttons vertically", () => {
  assert.equal(
    STYLES.includes(
      ".list-item .eact{flex-direction:column;align-items:stretch;}",
    ),
    true,
  );
  assert.equal(
    MOBILE_VIEW_PAGE_STYLES.includes(".list-item .eact {") &&
      MOBILE_VIEW_PAGE_STYLES.includes("flex-direction: column;"),
    true,
  );
});
