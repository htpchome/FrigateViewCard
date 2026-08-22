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
        kind: "event",
        id: "event-1",
        file: "snapshot.jpg",
        label: "Download snapshot",
        icon: "snapshot",
      },
    ],
  });
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
    icons: { download: "<download />", snapshot: "<snapshot />" },
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
    /<h2 class="popup-info-head" id="popup-info-head">Recording - Back yard - 9:00pm - 8\/21<\/h2>/,
  );
  assert.match(markup.infoHtml, /data-rec-dl-start="200"/);
  assert.match(markup.infoHtml, /data-rec-dl-end="260"/);
  assert.match(markup.infoHtml, /background:#abc12333;color:#abc123/);
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
  assert.deepEqual(calls.slice(0, 2), [
    ["camera", "front door"],
    ["resetScrub"],
  ]);

  const popupEventAction = {
    dataset: { dl: "event-1", dlFile: "snapshot.jpg" },
  };
  const popupRecordingAction = {
    dataset: { recDlStart: "200", recDlEnd: "260" },
  };
  let stopped = 0;
  const clickEvent = { stopPropagation: () => (stopped += 1) };

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
    ["event", "event-1", "snapshot.jpg"],
    ["recording", 200, 260],
  ]);
  assert.equal(stopped, 2);

  controller.hide();
  assert.equal(info.hidden, true);
  assert.equal(info.innerHTML, "");
  assert.deepEqual(calls.slice(-2), [["resetScrub"], ["camera", ""]]);
});
