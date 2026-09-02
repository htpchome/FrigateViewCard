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
  calendar: "<calendar />",
  clips: "<clips />",
  clock: "<clock />",
  download: "<download />",
  person: "<person />",
  pin: "<pin />",
  snapshot: "<snapshot />",
  star: "<star />",
  starO: "<star-o />",
};

test("event and alert rows share ordered time, day, and single-zone metadata", () => {
  const eventModel = buildEventListItemModel(
    {
      id: "event-1",
      label: "person",
      sub_label: "resident",
      zones: ["on_deck", "yard"],
      start_time: 1723000000,
      has_clip: true,
      has_snapshot: true,
    },
    {
      cap: (value) =>
        String(value || "").replace(/^./, (char) => char.toUpperCase()),
      labelColor: () => "#3b82f6",
      icons: ICONS,
      media: (id, file) => `/media/${id}/${file}`,
      durationLabel: () => 17,
      formatTime: () => "1:51 pm",
      formatDay: () => "Thu Aug 27",
      isKeptTab: false,
      browseTab: "clips",
      fallbackThumbSrc: "/media/review-1/front_door/review_thumbnail.webp",
    },
  );
  const eventHtml = buildEventListItemHtml(eventModel, {
    icons: ICONS,
    expanded: false,
    compact: false,
  });
  assert.match(eventHtml, /class="list-item list-item--event /);
  const eventOrder = [
    "<clock />",
    "1:51 pm",
    "<calendar />",
    "Thu Aug 27",
    "<pin />",
    "on_deck",
  ];
  eventOrder.slice(1).forEach((token, index) => {
    assert.ok(eventHtml.indexOf(eventOrder[index]) < eventHtml.indexOf(token));
  });
  assert.doesNotMatch(eventHtml, />yard</);
  assert.match(
    eventHtml,
    /class="subl list-bubble" style="--list-tag-color:#3b82f6">Resident/,
  );
  assert.match(eventHtml, /class="bc list-bubble">Clips/);
  assert.match(
    eventHtml,
    /data-thumb-fallback-src="\/media\/review-1\/front_door\/review_thumbnail\.webp"/,
  );

  const sourceEvent = {
    id: "event-1",
    label: "person",
    sub_label: "resident",
    zones: ["fallback_zone"],
    has_clip: true,
    has_snapshot: true,
  };
  const reviewModel = buildReviewListItemModel(
    {
      id: "review-1",
      camera: "deck",
      start_time: 1723000000,
      severity: "alert",
      data: {
        detections: ["event-1"],
        objects: ["person", "car"],
        zones: ["on_deck", "yard"],
        metadata: { title: "Person-verified" },
      },
    },
    {
      cap: (value) =>
        String(value || "").replace(/^./, (char) => char.toUpperCase()),
      icons: ICONS,
      labelColor: (label) => label === "car" ? "#f59e0b" : "#3b82f6",
      resolveSourceEvent: () => sourceEvent,
      findEventById: () => sourceEvent,
      media: (id, file) => `/media/${id}/${file}`,
      durationLabel: () => 17,
      formatTime: () => "1:48 pm",
      formatDay: () => "Thu Aug 27",
      fallbackThumbSrc: "/media/review-1/deck/review_thumbnail.webp",
    },
  );
  const reviewHtml = buildReviewListItemHtml(reviewModel, {
    cap: (value) =>
      String(value || "").replace(/^./, (char) => char.toUpperCase()),
    icons: ICONS,
  });
  const reviewOrder = [
    "<clock />",
    "1:48 pm",
    "<calendar />",
    "Thu Aug 27",
    "<pin />",
    "on_deck",
    "review-severity-chip--alert",
  ];
  const standardReviewHtml = reviewHtml.slice(
    reviewHtml.indexOf("list-item-middle--standard"),
    reviewHtml.indexOf("list-item-actions--standard"),
  );
  reviewOrder.slice(1).forEach((token, index) => {
    assert.ok(
      standardReviewHtml.indexOf(reviewOrder[index]) <
        standardReviewHtml.indexOf(token),
    );
  });
  assert.equal(
    reviewHtml.match(/class="tb review-object-tag list-bubble"/g)?.length,
    4,
  );
  assert.doesNotMatch(reviewHtml, /class="rev-t"/);
  assert.match(
    reviewHtml,
    /class="review-severity-chip review-severity-chip--alert list-bubble">Alert/,
  );
  assert.match(reviewHtml, /list-item-middle--standard/);
  assert.match(reviewHtml, /list-item-middle--narrow/);
  assert.match(reviewHtml, /list-item-actions--standard/);
  assert.match(reviewHtml, /list-item-actions--narrow/);
  assert.match(reviewHtml, /class="list-item list-item--review /);
  assert.match(
    reviewHtml,
    /data-thumb-fallback-src="\/media\/review-1\/deck\/review_thumbnail\.webp"/,
  );
  assert.match(
    reviewHtml,
    /class="subl list-bubble" style="--list-tag-color:#3b82f6">Resident/,
  );
  for (const presentationClass of [
    "list-item-middle--standard",
    "list-item-middle--narrow",
  ]) {
    const presentationStart = reviewHtml.indexOf(presentationClass);
    const presentationEnd = reviewHtml.indexOf("</div>", presentationStart);
    const tagsHtml = reviewHtml.slice(presentationStart, presentationEnd);
    assert.ok(
      tagsHtml.indexOf(">deck</span>") <
        tagsHtml.indexOf("review-object-tag list-bubble"),
      `${presentationClass} should render the camera bubble first`,
    );
  }
  assert.doesNotMatch(reviewHtml, / · tap|>tap</i);
  assert.doesNotMatch(reviewHtml, />yard</);
});

test("modern row formatting skips legacy labels and duplicate event lookup", () => {
  let legacyFormatCalls = 0;
  let duplicateLookupCalls = 0;
  const sourceEvent = {
    id: "event-1",
    label: "person",
    has_snapshot: true,
  };
  const commonFormatting = {
    cap: String,
    icons: ICONS,
    media: () => "",
    durationLabel: () => 1,
    dateTimeLabel: () => {
      legacyFormatCalls += 1;
      return "legacy";
    },
    formatTime: () => "2:00 pm",
    formatDay: () => "Thu Aug 27",
  };

  const eventModel = buildEventListItemModel(
    { id: "event-1", label: "person", start_time: 100 },
    {
      ...commonFormatting,
      labelColor: () => "#fff",
    },
  );
  const reviewModel = buildReviewListItemModel(
    {
      id: "review-1",
      start_time: 100,
      severity: "alert",
      data: { detections: [sourceEvent.id] },
    },
    {
      ...commonFormatting,
      labelColor: () => "#fff",
      resolveSourceEvent: () => sourceEvent,
      findEventById: () => {
        duplicateLookupCalls += 1;
        return sourceEvent;
      },
    },
  );

  assert.equal(eventModel.timeLabel, "2:00 pm");
  assert.equal(reviewModel.timeLabel, "2:00 pm");
  assert.equal(legacyFormatCalls, 0);
  assert.equal(duplicateLookupCalls, 0);
});

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
  assert.equal(html.includes("list-item-actions--standard"), true);
  assert.equal(html.includes("list-item-actions--narrow"), true);
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
  assert.match(snapshotHtml, /class="bs list-bubble">Snapshot</);
  assert.doesNotMatch(snapshotHtml, /class="bc list-bubble">Clips</);
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

test("alert review rows can omit only the favorite action", () => {
  const sourceEvent = {
    id: "event-1",
    has_clip: true,
    has_snapshot: true,
    retain_indefinitely: false,
  };
  const model = buildReviewListItemModel(
    {
      id: "review-1",
      start_time: 1723000000,
      severity: "alert",
      data: { detections: ["event-1"] },
    },
    {
      cap: String,
      icons: ICONS,
      resolveSourceEvent: () => sourceEvent,
      findEventById: () => sourceEvent,
      media: (id, file) => `/media/${id}/${file}`,
      dateTimeLabel: () => "Fri · 8:44 pm",
      showFavoriteButton: false,
    },
  );

  assert.equal(model.favBtn, "");
  assert.equal(model.mediaActions.includes('data-dl="event-1"'), true);
  assert.equal(
    model.mediaActions.includes('data-popup-media-target="snapshot"'),
    true,
  );
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

test("list actions remain horizontal and list bubbles share one geometry", () => {
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
  assert.match(STYLES, /container-name:list-item/);
  assert.match(STYLES, /@container list-item \(max-width:520px\)/);
  assert.match(STYLES, /@container browse-list \(max-width:720px\)/);
  assert.match(
    STYLES,
    /\.card\.phone-client \.list-item \.list-item-middle--standard/,
  );
  assert.match(
    STYLES,
    /\.card\.phone-client \.list-item \.list-item-middle--narrow\{display:grid;/,
  );
  assert.match(STYLES, /\.list-item \.list-bubble\{[^}]*height:1rem;[^}]*padding:2px 6px;[^}]*border-radius:999px;/);
  assert.match(
    STYLES,
    /color:color-mix\(in srgb,var\(--list-bubble-accent\) 45%,var\(--c-text\)\);/,
  );
  assert.match(
    STYLES,
    /background:color-mix\(in srgb,var\(--list-bubble-accent\) 18%,transparent\);/,
  );
  assert.match(
    STYLES,
    /review-severity-chip--alert\{--list-bubble-accent:var\(--c-bg-alert\)/,
  );
  assert.match(
    STYLES,
    /\.browse \.list-item:is\(\.list-item--event,\.list-item--review\)\{\s*display:grid;\s*grid-template-columns:auto minmax\(0,1fr\) auto;/,
  );
  assert.match(
    STYLES,
    /> \.list-item-actions\{\s*grid-area:actions;[^}]*justify-self:end;[^}]*padding-right:0;/,
  );
  assert.doesNotMatch(STYLES, /width:clamp\(120px,40cqi,160px\);/);
  assert.match(
    STYLES,
    /\.list-item\{[^}]*padding:2px 10px 2px 2px;/,
  );
  assert.match(STYLES, /\.et img\{width:160px;height:90px;/);
  assert.match(
    MOBILE_VIEW_PAGE_STYLES,
    /--mv-list-item-padding: 2px 10px 2px 2px;/,
  );
  assert.match(MOBILE_VIEW_PAGE_STYLES, /--mv-list-thumb-width: 176px;/);
  assert.match(MOBILE_VIEW_PAGE_STYLES, /--mv-list-thumb-height: 99px;/);
  assert.match(
    MOBILE_VIEW_PAGE_STYLES,
    /\.browse--mobile-view \.et \{[\s\S]*?width: var\(--mv-list-thumb-width\);[\s\S]*?height: var\(--mv-list-thumb-height\);/,
  );
  assert.match(
    MOBILE_VIEW_PAGE_STYLES,
    /\.browse--mobile-view \.et > :is\(img, \.tph\) \{\s*width: 100%;\s*height: 100%;/,
  );
  assert.match(STYLES, /container-name:browse-list;/);
  assert.match(
    STYLES,
    /@container browse-list \(max-width:720px\)[\s\S]*\.card:not\(\.phone-client\) \.list-item:is\(\.list-item--event,\.list-item--review\)\{\s*grid-template-columns:auto minmax\(0,1fr\);\s*grid-template-areas:"thumb middle";/,
  );
  assert.match(
    STYLES,
    /\.list-item-narrow-lower\{\s*display:contents;/,
  );
  assert.match(
    STYLES,
    /\.review-thumbnail-severity\{position:absolute;left:3px;bottom:3px;/,
  );
  assert.match(
    STYLES,
    /\.list-item \.review-thumbnail-severity\{[\s\S]*?color:var\(--c-text-rev\);[\s\S]*?background:color-mix\(in srgb,var\(--list-bubble-accent\) 82%,var\(--c-bg-deep\)\);[\s\S]*?border:1px solid color-mix\(in srgb,var\(--c-text-rev\) 55%,transparent\);/,
  );
  assert.match(
    STYLES,
    /\.list-item-middle--narrow \.list-item-meta\{\s*grid-area:meta;\s*flex-direction:column;\s*align-items:flex-start;\s*flex-wrap:nowrap;/,
  );
  assert.match(
    STYLES,
    /@container browse-list \(max-width:520px\)[\s\S]*grid-template-areas:"tags tags" "meta actions";/,
  );
  assert.match(STYLES, /\.tabs\{display:flex;flex-wrap:nowrap;/);
  assert.match(
    STYLES,
    /@container \(max-width: 720px\)\{\s*\.button-holder--responsive-toolbar/,
  );
});

test("Mobile View outer border is removed only by its config state class", () => {
  assert.match(
    MOBILE_VIEW_PAGE_STYLES,
    /\.card\.mobile-view-active\.mobile-view-outer-border-off\s*\{\s*border:\s*0;/,
  );
  assert.doesNotMatch(
    MOBILE_VIEW_PAGE_STYLES,
    /\.card\.mobile-view-active\s*\{\s*border:\s*0;/,
  );
  assert.doesNotMatch(MOBILE_VIEW_PAGE_STYLES, /ha-card\s*\{[^}]*border:\s*0/);
});

test("narrow alert rows cap object bubbles and disclose the hidden count", () => {
  const sourceEvent = {
    id: "event-many-objects",
    camera: "front_door",
    has_clip: true,
    has_snapshot: true,
  };
  const model = buildReviewListItemModel(
    {
      id: "review-many-objects",
      camera: "front_door",
      severity: "alert",
      data: {
        detections: [sourceEvent.id],
        objects: ["person", "car", "dog", "package"],
      },
    },
    {
      cap: (value) =>
        String(value || "").replace(/^./, (char) => char.toUpperCase()),
      icons: ICONS,
      labelColor: () => "#3b82f6",
      resolveSourceEvent: () => sourceEvent,
      findEventById: () => sourceEvent,
      media: (id, file) => `/media/${id}/${file}`,
      formatTime: () => "2:00 pm",
      formatDay: () => "Thu Aug 27",
    },
  );
  const html = buildReviewListItemHtml(model, {
    cap: (value) =>
      String(value || "").replace(/^./, (char) => char.toUpperCase()),
    icons: ICONS,
  });
  const narrowHtml = html.match(
    /<div class="rev-inf list-item-middle list-item-middle--narrow">([\s\S]*?)<div class="eact list-item-actions list-item-actions--narrow/,
  )?.[1] || "";

  assert.equal(
    narrowHtml.match(/review-object-tag list-bubble/g)?.length,
    2,
  );
  assert.match(narrowHtml, /review-object-overflow list-bubble/);
  assert.match(narrowHtml, />\+2<\/span>/);
  assert.doesNotMatch(narrowHtml, /review-severity-chip--alert/);
  assert.match(
    html,
    /review-thumbnail-severity review-severity-chip review-severity-chip--alert/,
  );
  assert.match(html, /class="list-item list-item--review /);
});

test("alert rows fall back to one metadata-title bubble without plain title text", () => {
  const model = buildReviewListItemModel(
    {
      id: "review-fallback",
      severity: "alert",
      data: { metadata: { title: "Delivery driver" } },
    },
    {
      cap: (value) =>
        String(value || "").replace(/^./, (char) => char.toUpperCase()),
      icons: ICONS,
      labelColor: () => "#f97316",
      resolveSourceEvent: () => null,
      findEventById: () => null,
      media: () => "",
      formatTime: () => "2:00 pm",
      formatDay: () => "Thu Aug 27",
    },
  );
  const html = buildReviewListItemHtml(model, {
    cap: (value) =>
      String(value || "").replace(/^./, (char) => char.toUpperCase()),
    icons: ICONS,
  });

  assert.deepEqual(model.objectTags, [
    { text: "Delivery driver", color: "#f97316" },
  ]);
  assert.doesNotMatch(html, /class="rev-t"/);
  assert.equal(
    html.match(/class="tb review-object-tag list-bubble"/g)?.length,
    2,
  );
});

test("alert rows render review sub-labels on the first paint without a source event", () => {
  const model = buildReviewListItemModel(
    {
      id: "review-initial-sub-label",
      camera: "doorbell",
      severity: "alert",
      data: {
        detections: ["event-not-loaded-yet"],
        objects: ["person-verified"],
        sub_labels: ["deliveryDriver"],
      },
    },
    {
      cap: (value) =>
        String(value || "").replace(/^./, (char) => char.toUpperCase()),
      icons: ICONS,
      labelColor: () => "#3b82f6",
      resolveSourceEvent: () => null,
      findEventById: () => null,
      media: () => "",
      formatTime: () => "6:20 pm",
      formatDay: () => "Sat Aug 29",
    },
  );
  const html = buildReviewListItemHtml(model, {
    cap: (value) =>
      String(value || "").replace(/^./, (char) => char.toUpperCase()),
    icons: ICONS,
  });

  assert.equal(model.subLabel, "DeliveryDriver");
  assert.match(
    html,
    /class="subl list-bubble" style="--list-tag-color:#3b82f6">DeliveryDriver/,
  );
});
