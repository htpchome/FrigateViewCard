import test from "node:test";
import assert from "node:assert/strict";

import { PopupInfoController } from "../src/features/popup/info.ctrl.js";
import {
  buildPopupInfoDownloadActions,
  buildPopupInfoMarkup,
  buildPopupInfoModel,
} from "../src/features/popup/info.js";
import { STYLES } from "../src/styles.js";

test("popup body scrolls instead of shrinking its content sections", () => {
  assert.match(
    STYLES,
    /\.popup-body \{[^}]*overflow-y:auto;[^}]*min-height:0;[^}]*flex:1 1 auto;/,
  );
  assert.match(STYLES, /\.popup-body > \* \{flex-shrink:0;\}/);
});

test("popup shell uses precomputed anchor geometry without metadata resizing", () => {
  assert.match(
    STYLES,
    /\.popup-content \{[^}]*left:var\(--popup-shell-left,0px\);right:auto;width:min\(var\(--popup-shell-width,100%\),calc\(100% - var\(--popup-shell-left,0px\)\)\);[^}]*margin-inline:0;/,
  );
  assert.doesNotMatch(STYLES, /--popup-shell-media-width/);
  assert.match(
    STYLES,
    /\.popup-content \{[^}]*border-top-left-radius:var\(--fvc-border-radius,15px\);border-top-right-radius:var\(--fvc-border-radius,15px\);/,
  );
  assert.match(
    STYLES,
    /\.popup-content\.popup-content--compact \{[^}]*border-radius:var\(--fvc-border-radius,15px\);/,
  );
});

test("desktop popup playback controls overlay the video without a blur filter", () => {
  assert.match(
    STYLES,
    /\.popup-media-controls\.desktop-overlay-layout \{[^}]*width:min\(100%,var\(--popup-media-max-width,124\.444dvh\)\);[^}]*height:42px;[^}]*margin-top:-50px;[^}]*background:color-mix\(in srgb,var\(--c-bg-deep\) 74%,transparent\);/,
  );
  assert.match(
    STYLES,
    /\.popup-media-controls\.desktop-overlay-layout \.popup-media-btn \{[^}]*border:0;[^}]*background:transparent;/,
  );
  const desktopRule = STYLES.match(
    /\.popup-media-controls\.desktop-overlay-layout \{([^}]*)\}/,
  )?.[1];
  assert.doesNotMatch(desktopRule || "", /backdrop-filter/);
  assert.match(
    STYLES,
    /\.popup-media-controls\.desktop-overlay-layout\.is-hidden:not\(:hover\):not\(:focus-within\) \{opacity:0;pointer-events:none;\}/,
  );
  assert.match(
    STYLES,
    /\.popup-media-controls\.desktop-overlay-layout \{[^}]*grid-template-areas:"play progress time mute volume fs airplay";/,
  );
  assert.match(
    STYLES,
    /\.popup-media-controls\.desktop-overlay-layout \.popup-media-btn#popup-media-play \{[^}]*width:46px;[^}]*height:38px;/,
  );
  const desktopButtonHoverRule = STYLES.match(
    /\.popup-media-controls\.desktop-overlay-layout \.popup-media-btn:hover,\s*\.popup-media-controls\.desktop-overlay-layout \.popup-media-btn:focus-visible \{([^}]*)\}/,
  )?.[1] || "";
  assert.match(
    desktopButtonHoverRule,
    /color:var\(--c-text-rev\);background:transparent;/,
  );
  assert.doesNotMatch(desktopButtonHoverRule, /--c-primary-l/);
  assert.match(
    STYLES,
    /\.popup-media-controls\.desktop-overlay-layout \.popup-media-btn svg \{[^}]*width:23px;[^}]*height:23px;[^}]*opacity:\.78;/,
  );
  assert.match(
    STYLES,
    /\.popup-media-controls\.desktop-overlay-layout \.popup-media-progress \{height:5px;/,
  );
  assert.match(
    STYLES,
    /\.popup-media-controls\.desktop-overlay-layout \.popup-media-volume \{height:5px;/,
  );
  assert.match(
    STYLES,
    /\.popup-media-btn svg \{[^}]*pointer-events:none;/,
  );
  assert.match(STYLES, /\.popup-media-volume \{[^}]*grid-area:volume;/);
});

test("desktop popup metadata resize handle is centered and enlarged", () => {
  assert.match(
    STYLES,
    /\.popup-view-resize-grip\.popup-view-resize-grip--metadata\{[^}]*position:absolute;[^}]*left:min\(50%,calc\(100% - 68px\)\);[^}]*top:50%;[^}]*width:128px;height:28px;[^}]*transform:translate\(-50%,-50%\);/,
  );
  assert.match(
    STYLES,
    /\.popup-view-resize-grip\.popup-view-resize-grip--metadata::before\{[^}]*width:88px;height:9\.2px;/,
  );
  assert.match(STYLES, /\.popup-info-head \{[^}]*position:relative;/);
});

test("recording segment manager distinguishes kept and excluded scrub ranges", () => {
  assert.match(
    STYLES,
    /\.recording-scrub-main-row \{[^}]*grid-template-columns:40px minmax\(0,1fr\);/,
  );
  assert.match(
    STYLES,
    /\.recording-scrub-track \{[^}]*height:56px;/,
  );
  assert.match(
    STYLES,
    /\.recording-scrub-play \{[^}]*width:40px;height:44px;/,
  );
  assert.match(
    STYLES,
    /\.recording-segment-shade \{[^}]*background:rgba\(239,68,68,\.42\);/,
  );
  assert.match(
    STYLES,
    /\.recording-segment-keep \{[^}]*background:rgba\(34,197,94,\.34\);/,
  );
  assert.match(
    STYLES,
    /\.recording-segment-handle \{[^}]*cursor:ew-resize;[^}]*touch-action:none;/,
  );
  assert.match(
    STYLES,
    /\.recording-segment-manager \{[^}]*display:flex;[^}]*flex-direction:column;/,
  );
  assert.match(
    STYLES,
    /\.recording-segment-handle--start \.recording-segment-handle-time \{top:10px;\}/,
  );
  assert.match(
    STYLES,
    /\.recording-segment-handle--end \.recording-segment-handle-time \{bottom:10px;\}/,
  );
  assert.match(
    STYLES,
    /\.recording-segment-preview-modal \{[^}]*position:absolute;[^}]*inset:0;/,
  );
});

test("popup info model derives event details and download actions", () => {
  const model = buildPopupInfoModel({
    event: {
      id: "event-1",
      camera: "front_door",
      label: "person",
      sub_label: "visitor",
      top_score: 0.876,
      zones: ["porch"],
      start_time: 100,
      has_clip: true,
      has_snapshot: true,
      data: { objects: ["person", "car"] },
    },
    options: { mediaType: "alert" },
    formatTime: () => "8:44 pm",
    formatWeekday: () => "Fri",
    formatMonthDay: (_timestamp, options) =>
      options.numeric
        ? "8/21"
        : options.ordinal
          ? "Aug 21st"
          : "Aug 21",
    formatEventDuration: () => 12,
  });

  assert.deepEqual(model, {
    id: "event-1",
    mediaType: "alert",
    titleLabel: "Person",
    score: "88%",
    zone: "porch",
    objects: "Person, Car",
    dayDate: "Fri - Aug 21st",
    shortDate: "8/21",
    time: "8:44 pm",
    duration: "12s",
    camera: "front door",
    recStart: undefined,
    recEnd: undefined,
    downloadActions: [
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
    ],
  });
});

test("popup custom tags use the same compact pill treatment as event rows", () => {
  const event = {
    id: "event-bird",
    camera: "birdfeeder",
    label: "bird",
    sub_label: "northern cardinal",
    start_time: 100,
    has_clip: true,
  };
  const model = buildPopupInfoModel({
    event,
    options: { mediaType: "clip" },
  });
  const markup = buildPopupInfoMarkup({
    event,
    model,
    resolveLabelColor: (value) =>
      value === "northern cardinal" ? "#f472b6" : "#eab308",
  });

  assert.match(
    markup.infoHtml,
    /class="subl list-bubble" style="--list-tag-color:#f472b6">Northern cardinal<\/span>/,
  );
  assert.match(
    STYLES,
    /\.popup-info-title \.list-bubble\{[^}]*border-radius:999px;/,
  );
});

test("popup recording model and markup include the range download action", () => {
  const options = {
    mediaType: "recording",
    camera: "back_yard",
    startTime: 200,
    durationSec: 60,
    objects: "-",
    zone: "-",
    score: "-",
    recStart: 200.8,
    recEnd: 260.9,
  };
  const model = buildPopupInfoModel({
    options,
    formatTime: () => "9:00 pm",
    formatWeekday: () => "Fri",
    formatMonthDay: (_timestamp, options) =>
      options.numeric ? "8/21" : "Aug 21st",
  });
  const markup = buildPopupInfoMarkup({
    model,
    icons: {
      download: "<download />",
      filmstrip: "<filmstrip />",
      snapshot: "<snapshot />",
    },
    resolveLabelColor: () => "#abc123",
  });

  assert.deepEqual(
    buildPopupInfoDownloadActions({
      mediaType: "recording",
      recStart: options.recStart,
      recEnd: options.recEnd,
    }),
    [
      {
        kind: "recording-segment",
        label: "Download Segment",
        icon: "filmstrip",
      },
      {
        kind: "recording",
        label: "Download recording",
        recStart: 200,
        recEnd: 260,
        icon: "download",
      },
    ],
  );
  assert.equal(
    markup.headText,
    "Recording - Back yard - 9:00pm - 8/21",
  );
  assert.match(
    markup.infoHtml,
    /<h2 class="popup-info-head" id="popup-info-head"><span class="popup-info-head-text">Recording - Back yard - 9:00pm - 8\/21<\/span><\/h2>/,
  );
  assert.match(markup.infoHtml, /data-rec-dl-start="200"/);
  assert.match(markup.infoHtml, /data-rec-dl-end="260"/);
  assert.match(
    markup.infoHtml,
    /data-rec-segment-toggle[^>]*aria-controls="recording-segment-manager"[^>]*aria-expanded="false"[^>]*disabled><filmstrip \/>/,
  );
  assert.ok(
    markup.infoHtml.indexOf("data-rec-segment-toggle") <
      markup.infoHtml.indexOf("data-rec-dl-start"),
  );
  assert.match(markup.infoHtml, /background:#abc12333;color:#abc123/);
});

test("kept popup actions follow the media currently being displayed", () => {
  const event = {
    id: "event-1",
    camera: "front_door",
    start_time: 100,
    has_clip: true,
    has_snapshot: true,
  };
  const clipModel = buildPopupInfoModel({
    event,
    options: { mediaType: "kept", displayMediaType: "clip" },
  });
  const snapshotModel = buildPopupInfoModel({
    event,
    options: { mediaType: "kept", displayMediaType: "snapshot" },
  });

  assert.deepEqual(
    clipModel.downloadActions.map(({ label }) => label),
    ["Download clip", "View Snapshot"],
  );
  assert.deepEqual(
    snapshotModel.downloadActions.map(({ label }) => label),
    ["Download snapshot", "View Clip"],
  );
  assert.equal(clipModel.mediaType, "clip");
  assert.equal(snapshotModel.mediaType, "snapshot");
});

test("unavailable popup media suppresses actions for missing files", () => {
  const event = {
    id: "event-1",
    camera: "front_door",
    start_time: 100,
    has_clip: true,
    has_snapshot: true,
  };
  const model = buildPopupInfoModel({
    event,
    options: {
      mediaType: "alert",
      displayMediaType: "media",
      hasClip: false,
      hasSnapshot: false,
    },
  });

  assert.deepEqual(model.downloadActions, []);
});

test("popup info controller owns rendering, hiding, and popup actions", () => {
  const info = { innerHTML: "", hidden: true };
  const elements = new Map([["#popup-info", info]]);
  const calls = [];
  const controller = new PopupInfoController({
    query: (selector) => elements.get(selector) || null,
    getActiveCamera: () => "front_door",
    formatTime: () => "8:44 pm",
    formatWeekday: () => "Fri",
    formatMonthDay: (_timestamp, options) =>
      options.numeric ? "8/21" : "Aug 21st",
    formatEventDuration: () => 10,
    onResetRecordingScrub: () => calls.push(["resetScrub"]),
    onMediaCameraChange: (camera) => calls.push(["camera", camera]),
    onNavigateEventMedia: (id, mediaType) =>
      calls.push(["navigate", id, mediaType]),
    onDownloadEvent: (id, file) => calls.push(["event", id, file]),
    onDownloadRecording: (start, end) =>
      calls.push(["recording", start, end]),
  });

  controller.render(
    {
      id: "event-1",
      label: "person",
      start_time: 100,
      has_clip: true,
      has_snapshot: true,
    },
    { mediaType: "clip" },
  );

  assert.equal(info.hidden, false);
  assert.match(info.innerHTML, /Clip - Front door - 8:44pm - 8\/21/);
  assert.match(info.innerHTML, /data-dl="event-1"/);
  assert.match(info.innerHTML, /data-popup-media-target="snapshot"/);
  assert.deepEqual(calls.slice(0, 2), [
    ["camera", "front door"],
    ["resetScrub"],
  ]);

  const popupEventAction = {
    dataset: { dl: "event-1", dlFile: "clip.mp4" },
  };
  const popupMediaAction = {
    dataset: {
      popupEventId: "event-1",
      popupMediaTarget: "snapshot",
    },
  };
  const popupRecordingAction = {
    dataset: { recDlStart: "200", recDlEnd: "260" },
  };
  let stopped = 0;
  const clickEvent = { stopPropagation: () => (stopped += 1) };

  assert.equal(
    controller.handleClick(clickEvent, {
      closest: (selector) =>
        selector === ".popup-action[data-popup-media-target]"
          ? popupMediaAction
          : null,
    }),
    true,
  );
  assert.equal(
    controller.handleClick(clickEvent, {
      closest: (selector) =>
        selector === ".popup-action[data-dl]" ? popupEventAction : null,
    }),
    true,
  );
  assert.equal(
    controller.handleClick(clickEvent, {
      closest: (selector) =>
        selector === ".popup-action[data-rec-dl-start]"
          ? popupRecordingAction
          : null,
    }),
    true,
  );
  assert.deepEqual(calls.slice(2), [
    ["navigate", "event-1", "snapshot"],
    ["event", "event-1", "clip.mp4"],
    ["recording", 200, 260],
  ]);
  assert.equal(stopped, 3);

  controller.hide();
  assert.equal(info.hidden, true);
  assert.equal(info.innerHTML, "");
  assert.deepEqual(calls.slice(-2), [["resetScrub"], ["camera", ""]]);
});
