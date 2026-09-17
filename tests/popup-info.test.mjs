import test from "node:test";
import assert from "node:assert/strict";

import { PopupInfoController } from "../src/features/popup/info.ctrl.js";
import {
  buildCardViewPopupOverlayMarkup,
  buildPopupInfoDownloadActions,
  buildPopupInfoMarkup,
  buildPopupInfoModel,
} from "../src/features/popup/info.js";
import { POPUP_PRESENTATION_CARD_VIEW_DRAWER } from "../src/features/popup/media.js";
import { STYLES } from "../src/styles.js";

test("popup body scrolls instead of shrinking its content sections", () => {
  assert.match(
    STYLES,
    /\.popup-body \{[^}]*overflow-y:auto;[^}]*min-height:0;[^}]*flex:1 1 auto;/,
  );
  assert.match(STYLES, /\.popup-body > \* \{flex-shrink:0;\}/);
});

test("normal mobile popup stage uses its padded width without affecting rotation", () => {
  assert.match(
    STYLES,
    /\.card:not\(\.mobile-rotate-popup\):not\(\.mobile-rotate-popup-exit\) \.viewer\.popup-media-mobile-fixed-stage:not\(\.popup-media-resized\)\{width:100%;max-width:124\.444dvh;height:auto;aspect-ratio:16\/9;\}/,
  );
  assert.match(
    STYLES,
    /\.viewer\.popup-media-mobile-fixed-stage video,\.viewer\.popup-media-mobile-fixed-stage img\.snap\{object-fit:contain !important;object-position:center center;\}/,
  );
});

test("rotated live and popup side controls share the safe side inset", () => {
  assert.match(
    STYLES,
    /\.card\.mobile-rotate-live \.live-playback-controls,[\s\S]*?\.card\.mobile-rotate-live-exit \.live-playback-controls\{[\s\S]*?right:max\(20px,env\(safe-area-inset-right,0px\)\);/,
  );
  assert.match(
    STYLES,
    /\.card\.mobile-rotate-popup \.popup-playback-controls,[\s\S]*?\.card\.mobile-rotate-popup-exit \.popup-playback-controls\{[\s\S]*?right:max\(20px,env\(safe-area-inset-right,0px\)\);/,
  );
  assert.match(
    STYLES,
    /\.card\.mobile-rotate-popup \.popup-card-view-actions,[\s\S]*?\.card\.mobile-rotate-popup-exit \.popup-card-view-actions\{[\s\S]*?left:max\(20px,env\(safe-area-inset-left,0px\)\);/,
  );
  assert.match(
    STYLES,
    /\.card\.mobile-rotate-popup \.toast\.toast--popup,[\s\S]*?\.card\.mobile-rotate-popup-exit \.toast\.toast--popup\{[\s\S]*?position:fixed;top:44px;left:50%;max-width:calc\(100vw - 20px\);/,
  );
  assert.match(
    STYLES,
    /\.card\.mobile-rotate-popup #myPopup\.popup-content--card-view-drawer \.popup-close-row,[\s\S]*?\.card\.mobile-rotate-popup-exit #myPopup\.popup-content--card-view-drawer \.popup-close-row \{[\s\S]*?top:8px;right:max\(20px,env\(safe-area-inset-right,0px\)\);/,
  );
  assert.match(
    STYLES,
    /\.card:is\(\.mobile-rotate-live,\.mobile-rotate-live-exit\):has\(#live-stage\.live-controls-visible\):not\(:has\(\.card-view-media-drawer\.is-open\)\) > \.rotate-overlay-dismiss\{display:grid;\}/,
  );
  assert.match(
    STYLES,
    /#myPopup\.popup-overlay-controls-visible \.popup-close-row\{[\s\S]*?display:block !important;/,
  );
  assert.match(
    STYLES,
    /\.card\.mobile-rotate-popup \.popup-media-controls,[\s\S]*?\.card\.mobile-rotate-popup-exit \.popup-media-controls \{[^}]*bottom:0;/,
  );
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

test("Card View drawer popup overlays the live footprint with focused controls", () => {
  assert.match(
    STYLES,
    /\.popup-content\.popup-content--card-view-drawer \{[\s\S]*?top:var\(--popup-shell-top,0px\);[\s\S]*?min-height:var\(--popup-shell-stage-height,0px\);/,
  );
  assert.match(
    STYLES,
    /popup-content--card-view-drawer :is\(#popup-info,#popup-carousel-wrap,#recording-scrub,#recording-segment-manager\) \{display:none !important;\}/,
  );
  assert.match(
    STYLES,
    /popup-content--card-view-drawer \.close-btn \{[\s\S]*?width:30px;height:30px;[\s\S]*?background:var\(--fvc-media-overlay-bg\);/,
  );
  assert.match(
    STYLES,
    /popup-content--card-view-drawer \.viewer \{[\s\S]*?aspect-ratio:var\(--popup-card-view-stage-aspect-ratio,16 \/ 9\);/,
  );
  assert.match(
    STYLES,
    /popup-content--card-view-drawer \.viewer\.popup-media-resized \{[\s\S]*?aspect-ratio:var\(--popup-media-aspect-ratio/,
  );
  assert.match(
    STYLES,
    /\.popup-card-view-actions \{[\s\S]*?top:50%;left:7px;[\s\S]*?flex-direction:column;[\s\S]*?opacity:0;pointer-events:none;/,
  );
  assert.match(
    STYLES,
    /popup-content--card-view-drawer #viewer\.popup-controls-visible ~ \.popup-card-view-actions \{opacity:1;pointer-events:auto;\}/,
  );
  assert.match(
    STYLES,
    /popup-content--card-view-drawer #viewer:hover ~ \.popup-card-view-actions,[\s\S]*?\.popup-card-view-actions:hover,[\s\S]*?\.popup-card-view-actions:focus-within \{opacity:1;pointer-events:auto;\}/,
  );
  assert.match(
    STYLES,
    /popup-content--card-view-drawer \.popup-media-controls\.mobile-tablet-layout\.is-hidden \{opacity:0;pointer-events:none;\}/,
  );
  assert.match(
    STYLES,
    /popup-card-view-actions \.popup-action--favorite\.active \{[^}]*color:var\(--warning-color,#f59e0b\);[^}]*background:color-mix/,
  );
  assert.match(
    STYLES,
    /popup-action--favorite\.active \.popup-favorite-icon--inactive \{display:none;\}[\s\S]*?popup-action--favorite\.active \.popup-favorite-icon--active \{display:block;\}/,
  );
  assert.match(
    STYLES,
    /\.popup-view-resize-grip\.popup-view-resize-grip--card-view \{[\s\S]*?bottom:0;[\s\S]*?height:20px;/,
  );
});

test("desktop popup playback controls overlay the video without a blur filter", () => {
  assert.match(
    STYLES,
    /\.popup-media-controls\.desktop-overlay-layout \{[^}]*width:min\(100%,var\(--popup-media-max-width,124\.444dvh\)\);[^}]*height:42px;[^}]*margin-top:-50px;[^}]*margin-inline:0;[^}]*background:color-mix\(in srgb,var\(--c-bg-deep\) 74%,transparent\);[^}]*border:0;[^}]*border-radius:0;[^}]*box-shadow:0 -2px 8px rgba\(0,0,0,\.35\);/,
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
    /\.popup-media-controls\.desktop-overlay-layout\.is-hidden \{opacity:0;pointer-events:none;\}/,
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

test("only the Card View drawer popup rounds the media viewer bottom corners", () => {
  assert.match(
    STYLES,
    /\.viewer\{[^}]*border-radius:7px 7px 0 0;/,
  );
  assert.match(
    STYLES,
    /popup-content--card-view-drawer \.viewer \{[\s\S]*?border-radius:var\(--fvc-border-radius,15px\);/,
  );
});

test("mobile popup controls sit flush below video and stay touch safe", () => {
  const mobileRule = STYLES.match(
    /\.popup-media-controls\.mobile-tablet-layout \{([^}]*)\}/,
  )?.[1] || "";
  assert.match(mobileRule, /grid-template-columns:44px minmax\(0,1fr\) 44px;/);
  assert.match(mobileRule, /margin-top:-8px;/);
  assert.match(
    mobileRule,
    /background:color-mix\(in srgb,var\(--c-bg-deep\) 74%,transparent\);/,
  );
  assert.match(mobileRule, /border:0;border-radius:0;opacity:\.94;/);
  assert.match(
    STYLES,
    /\.popup-content\.popup-content--compact \.popup-media-controls\.mobile-tablet-layout \{margin-top:-5px;\}/,
  );
  assert.match(
    STYLES,
    /\.popup-media-controls\.mobile-tablet-layout \.popup-media-btn \{[^}]*width:44px;height:44px;[^}]*border:0;border-radius:0;[^}]*background:transparent;box-shadow:none;/,
  );
  assert.match(
    STYLES,
    /\.popup-media-controls\.mobile-tablet-layout \.popup-media-progress \{height:5px;transform:none;background:linear-gradient/,
  );

  const portraitRule = STYLES.match(
    /\.card:not\(\.mobile-rotate-popup\):not\(\.mobile-rotate-popup-exit\) \.popup-media-controls\.mobile-tablet-layout \{([^}]*)\}/,
  )?.[1] || "";
  assert.match(
    portraitRule,
    /height:40px;grid-template-rows:40px;grid-template-areas:"play progress mute";/,
  );
  assert.match(
    portraitRule,
    /background:color-mix\(in srgb,var\(--c-bg-deep\) 88%,transparent\);/,
  );
  assert.match(portraitRule, /border-radius:0 0 7px 7px;opacity:1;/);
  assert.match(
    STYLES,
    /\.card:not\(\.mobile-rotate-popup\):not\(\.mobile-rotate-popup-exit\) \.popup-media-controls\.mobile-tablet-layout \.popup-media-time \{[^}]*grid-area:progress;[^}]*margin:14px 0 0;[^}]*font-size:\.7rem;/,
  );
  assert.match(
    STYLES,
    /\.card:not\(\.mobile-rotate-popup\):not\(\.mobile-rotate-popup-exit\) #viewer:has\(\+ \.popup-media-controls\.mobile-tablet-layout:not\(\[hidden\]\)\) \{border-bottom-left-radius:0;border-bottom-right-radius:0;\}/,
  );

  const rotateRule = STYLES.match(
    /\.card\.mobile-rotate-popup \.popup-media-controls,\s*\.card\.mobile-rotate-popup-exit \.popup-media-controls \{([^}]*)\}/,
  )?.[1] || "";
  assert.match(rotateRule, /position:fixed;left:0;right:0;bottom:0;width:auto;margin:0;/);
  assert.doesNotMatch(rotateRule, /safe-area-inset/);
  assert.doesNotMatch(rotateRule, /background:|opacity:|backdrop-filter:/);
});

test("popup fullscreen keeps the custom media controls with the video", () => {
  assert.match(
    STYLES,
    /\.popup-body:fullscreen #viewer\{[^}]*width:100%;height:100%;[^}]*max-height:none;[^}]*background:#000;/,
  );
  assert.match(
    STYLES,
    /\.popup-body:fullscreen #popup-media-controls\{[^}]*position:absolute;[^}]*bottom:0;[^}]*width:100%;[^}]*margin:0;/,
  );
  assert.match(
    STYLES,
    /\.popup-body:fullscreen > :not\(#viewer\):not\(#popup-media-controls\)\{display:none !important;\}/,
  );
  assert.doesNotMatch(
    STYLES,
    /\.popup-body:fullscreen[^{}]*,\s*\.popup-body:-webkit-full-screen/,
  );
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

test("Card View drawer popup reuses contextual actions in a compact date overlay", () => {
  const event = {
    id: "event-1",
    camera: "front_door",
    start_time: 100,
    has_clip: true,
    has_snapshot: true,
  };
  const model = buildPopupInfoModel({
    event,
    options: { mediaType: "clip" },
    formatTime: () => "8:44 pm",
  });
  const overlay = buildCardViewPopupOverlayMarkup({
    model,
    event: { ...event, retain_indefinitely: true },
    fullDate: "Tue, May 2, 2026",
    icons: {
      download: "<download />",
      snapshot: "<snapshot />",
      star: "<star />",
      starO: "<star-outline />",
    },
  });

  assert.equal(
    overlay.labelText,
    "Front door 8:44pm - Tue, May 2, 2026",
  );
  assert.match(
    overlay.actionsHtml,
    /data-popup-favorite="event-1"[^>]*aria-pressed="true"/,
  );
  assert.ok(
    overlay.actionsHtml.indexOf("data-popup-favorite") <
      overlay.actionsHtml.indexOf("data-dl-file"),
  );
  assert.match(overlay.actionsHtml, /data-dl-file="clip\.mp4"/);
  assert.match(overlay.actionsHtml, /data-popup-media-target="snapshot"/);
  assert.equal((overlay.actionsHtml.match(/<button/g) || []).length, 3);
});

test("Card View recording popup does not offer an event favorite action", () => {
  const model = buildPopupInfoModel({
    options: {
      mediaType: "recording",
      camera: "front_door",
      recStart: 100,
      recEnd: 160,
    },
  });
  const overlay = buildCardViewPopupOverlayMarkup({ model });

  assert.doesNotMatch(overlay.actionsHtml, /data-popup-favorite/);
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
    /<h2 class="popup-info-head" id="popup-info-head"><span class="popup-info-head-text"><span data-fvc-i18n="runtime\.popup\.info\.recording">Recording<\/span> - Back yard - 9:00pm - 8\/21<\/span><\/h2>/,
  );
  assert.match(markup.infoHtml, /data-fvc-i18n="runtime\.popup\.info\.camera">Camera/);
  assert.match(markup.infoHtml, /data-fvc-i18n-title="runtime\.popup\.info\.downloadRecording"/);
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

test("favorite popup fallback text never exposes the internal kept name", () => {
  const model = buildPopupInfoModel({
    options: { id: "event-1", mediaType: "kept", camera: "front door" },
  });
  const markup = buildPopupInfoMarkup({ model });

  assert.equal(model.titleLabel, "Favorite");
  assert.match(markup.headText, /^Favorite - Front door -/);
  assert.doesNotMatch(markup.infoHtml, /\bKept\b/);
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
  assert.match(info.innerHTML, /data-fvc-i18n="runtime\.popup\.info\.clip">Clip<\/span> - Front door - 8:44pm - 8\/21/);
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

test("popup info controller replaces metadata and preserves Card View media navigation", () => {
  const info = { innerHTML: "old metadata", hidden: false };
  const label = { textContent: "", hidden: true };
  const actions = { innerHTML: "", hidden: true };
  const elements = new Map([
    ["#popup-info", info],
    ["#popup-card-view-label", label],
    ["#popup-card-view-actions", actions],
  ]);
  const navigationCalls = [];
  const controller = new PopupInfoController({
    query: (selector) => elements.get(selector) || null,
    getActiveCamera: () => "front_door",
    formatTime: () => "8:44 pm",
    formatWeekday: () => "Tue",
    formatMonthDay: () => "May 2",
    formatFullDate: () => "Tue, May 2, 2026",
    formatEventDuration: () => 6,
    onNavigateEventMedia: (id, mediaType, options) =>
      navigationCalls.push([id, mediaType, options]),
  });

  controller.render(
    {
      id: "event-1",
      camera: "front_door",
      start_time: 100,
      has_clip: true,
      has_snapshot: true,
    },
    {
      mediaType: "clip",
      presentation: POPUP_PRESENTATION_CARD_VIEW_DRAWER,
    },
  );

  assert.equal(info.hidden, true);
  assert.equal(info.innerHTML, "");
  assert.equal(label.hidden, false);
  assert.equal(label.textContent, "Front door 8:44pm - Tue, May 2, 2026");
  assert.equal(actions.hidden, false);
  assert.match(actions.innerHTML, /data-popup-favorite="event-1"/);
  assert.match(actions.innerHTML, /data-dl-file="clip\.mp4"/);
  assert.match(actions.innerHTML, /data-popup-media-target="snapshot"/);

  controller.handleClick(
    { stopPropagation() {} },
    {
      closest: (selector) =>
        selector === ".popup-action[data-popup-media-target]"
          ? {
              dataset: {
                popupEventId: "event-1",
                popupMediaTarget: "snapshot",
              },
            }
          : null,
    },
  );
  assert.deepEqual(navigationCalls, [
    [
      "event-1",
      "snapshot",
      { presentation: POPUP_PRESENTATION_CARD_VIEW_DRAWER },
    ],
  ]);

  controller.hide();
  assert.equal(label.hidden, true);
  assert.equal(actions.hidden, true);
});

test("Card View popup favorite action updates immediately and confirms retained state", async () => {
  const attributes = new Map([["aria-pressed", "false"]]);
  const classes = new Set(["popup-action", "popup-action--favorite"]);
  const favoriteAction = {
    dataset: { popupFavorite: "event-1" },
    disabled: false,
    isConnected: true,
    classList: {
      toggle: (name, enabled) => {
        if (enabled) classes.add(name);
        else classes.delete(name);
      },
    },
    getAttribute: (name) => attributes.get(name),
    setAttribute: (name, value) => attributes.set(name, String(value)),
    removeAttribute: (name) => attributes.delete(name),
  };
  let finishToggle;
  const toggleFinished = new Promise((resolve) => {
    finishToggle = resolve;
  });
  const favoriteCalls = [];
  const controller = new PopupInfoController({
    onToggleFavorite: async (id) => {
      favoriteCalls.push(id);
      return toggleFinished;
    },
  });
  let prevented = 0;
  let stopped = 0;

  assert.equal(
    controller.handleClick(
      {
        preventDefault: () => (prevented += 1),
        stopPropagation: () => (stopped += 1),
      },
      {
        closest: (selector) =>
          selector === ".popup-action[data-popup-favorite]"
            ? favoriteAction
            : null,
      },
    ),
    true,
  );

  assert.deepEqual(favoriteCalls, ["event-1"]);
  assert.equal(attributes.get("aria-pressed"), "true");
  assert.equal(attributes.get("aria-label"), "Remove from Favorites");
  assert.equal(classes.has("active"), true);
  assert.equal(favoriteAction.disabled, true);
  assert.equal(attributes.get("aria-busy"), "true");
  assert.equal(prevented, 1);
  assert.equal(stopped, 1);

  finishToggle(true);
  await new Promise((resolve) => setTimeout(resolve, 0));

  assert.equal(attributes.get("aria-pressed"), "true");
  assert.equal(favoriteAction.disabled, false);
  assert.equal(attributes.has("aria-busy"), false);
});
