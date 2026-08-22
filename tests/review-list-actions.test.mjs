import test from "node:test";
import assert from "node:assert/strict";

import {
  buildEventListItemHtml,
  buildEventListItemModel,
} from "../src/data/event-list.model.js";
import {
  buildReviewListItemHtml,
  buildReviewListItemModel,
} from "../src/data/review-list.model.js";
import { buildPopupInfoDownloadActions } from "../src/features/popup/info.js";
import { MOBILE_VIEW_PAGE_STYLES } from "../src/features/mobile-view/page.styles.js";
import { STYLES } from "../src/styles.js";

const ICONS = {
  clips: "<clips />",
  clock: "<clock />",
  download: "<download />",
  person: "<person />",
  snapshot: "<snapshot />",
  star: "<star />",
  starO: "<star-o />",
};

test("alert review rows render clip download and snapshot view buttons", () => {
  const review = {
    id: "review-1",
    camera: "front_door",
    start_time: 1723000000,
    end_time: 1723000012,
    severity: "alert",
    data: {
      detections: ["event-1"],
      objects: ["person"],
    },
  };
  const sourceEvent = {
    id: "event-1",
    camera: "front_door",
    start_time: 1723000000,
    end_time: 1723000012,
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
    durationLabel: (value) => (value === sourceEvent ? 22 : 12),
    dateTimeLabel: () => "Fri · 8:44 pm",
  });

  const html = buildReviewListItemHtml(model, {
    cap: (value) =>
      String(value || "").replace(/^./, (char) => char.toUpperCase()),
    icons: ICONS,
  });

  assert.equal(html.includes('data-dl="event-1"'), true);
  assert.equal(html.includes('data-dl-file="clip.mp4"'), true);
  assert.equal(html.includes('data-dl-file="snapshot.jpg"'), false);
  assert.equal(html.includes('data-popup-event-id="event-1"'), true);
  assert.equal(html.includes('data-popup-media-target="snapshot"'), true);
  assert.equal(html.includes('title="View Snapshot"'), true);
  assert.equal(html.includes('class="eact"'), true);
  assert.equal(html.includes('<div class="ed">22s</div>'), true);
});

test("event duration badges render for clips and stay hidden for snapshots", () => {
  const buildModel = (showDurationBadge) =>
    buildEventListItemModel(
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
        showDurationBadge,
      },
    );
  const render = (model) =>
    buildEventListItemHtml(model, {
      icons: ICONS,
      expanded: false,
      compact: false,
    });

  assert.equal(render(buildModel(true)).includes('<div class="ed">10s</div>'), true);
  assert.equal(render(buildModel(false)).includes('class="ed"'), false);
});

test("clip, snapshot, and kept rows render media actions in tab order", () => {
  const renderForTab = (browseTab) => {
    const model = buildEventListItemModel(
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
        browseTab,
        isKeptTab: browseTab === "kept",
        showCameraLabel: false,
      },
    );
    return buildEventListItemHtml(model, {
      icons: ICONS,
      expanded: false,
      compact: false,
    });
  };

  for (const browseTab of ["clips", "kept"]) {
    const html = renderForTab(browseTab);
    assert.equal(html.includes('data-dl-file="clip.mp4"'), true);
    assert.equal(html.includes('data-dl-file="snapshot.jpg"'), false);
    assert.equal(html.includes('data-popup-media-target="snapshot"'), true);
    assert.ok(
      html.indexOf('data-dl-file="clip.mp4"') <
        html.indexOf('data-popup-media-target="snapshot"'),
    );
  }

  const snapshotHtml = renderForTab("snapshot");
  assert.equal(snapshotHtml.includes('data-dl-file="snapshot.jpg"'), true);
  assert.equal(snapshotHtml.includes('data-dl-file="clip.mp4"'), false);
  assert.equal(snapshotHtml.includes('data-popup-media-target="clip"'), true);
  assert.equal(snapshotHtml.includes('title="View Clip"'), true);
  assert.ok(
    snapshotHtml.indexOf('data-dl-file="snapshot.jpg"') <
      snapshotHtml.indexOf('data-popup-media-target="clip"'),
  );
});

test("event and alert list rows can hide media buttons for mobile clients", () => {
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

  assert.equal(eventModel.mediaActions, "");
  assert.equal(reviewModel.mediaActions, "");
});

test("popup clips include a snapshot navigation action when available", () => {
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
      kind: "media-navigation",
      id: "event-1",
      targetMediaType: "snapshot",
      label: "View Snapshot",
      icon: "snapshot",
    },
  ]);
});

test("popup snapshots use the download icon for snapshot downloads", () => {
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
      icon: "download",
    },
  ]);
});

test("popup snapshots include clip navigation when a clip is available", () => {
  const actions = buildPopupInfoDownloadActions({
    id: "event-1",
    mediaType: "snapshot",
    hasClip: true,
    hasSnapshot: true,
  });

  assert.deepEqual(actions, [
    {
      kind: "event",
      id: "event-1",
      file: "snapshot.jpg",
      label: "Download snapshot",
      icon: "download",
    },
    {
      kind: "media-navigation",
      id: "event-1",
      targetMediaType: "clip",
      label: "View Clip",
      icon: "clips",
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
