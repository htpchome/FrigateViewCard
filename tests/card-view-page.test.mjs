import { test } from "node:test";
import assert from "node:assert/strict";

import {
  CardViewPageController,
  chunkCardViewItems,
  resolveCardViewDrawerSwipe,
  resolveCardViewColumnCount,
  resolveCardViewPageScrollTarget,
} from "../src/features/card-view/page.ctrl.js";
import {
  buildCardViewMainLayoutShellMarkup,
  buildCardViewToolbarMarkup,
} from "../src/features/card-view/page.tmpl.js";
import { CARD_VIEW_PAGE_STYLES } from "../src/features/card-view/page.styles.js";
import { CAMERA_PICKER_STYLES } from "../src/features/navigation/camera-picker.styles.js";

test("Card View uses independent alert and recording page widths", () => {
  assert.equal(resolveCardViewColumnCount({ width: 500, mode: "alerts" }), 1);
  assert.equal(
    resolveCardViewColumnCount({ width: 500, mode: "recordings" }),
    2,
  );
  assert.equal(resolveCardViewColumnCount({ width: 900, mode: "alerts" }), 2);
  assert.equal(
    resolveCardViewColumnCount({ width: 900, mode: "recordings" }),
    3,
  );
});

test("Card View groups tiles into full-width scroll pages", () => {
  assert.deepEqual(chunkCardViewItems([1, 2, 3, 4, 5], 2), [
    [1, 2],
    [3, 4],
    [5],
  ]);
});

test("Card View navigation resolves absolute full-page scroll targets", () => {
  assert.equal(
    resolveCardViewPageScrollTarget({
      scrollLeft: 0,
      clientWidth: 500,
      scrollWidth: 2500,
      direction: 1,
    }),
    500,
  );
  assert.equal(
    resolveCardViewPageScrollTarget({
      scrollLeft: 500,
      clientWidth: 500,
      scrollWidth: 2500,
      direction: 1,
    }),
    1000,
  );
  assert.equal(
    resolveCardViewPageScrollTarget({
      scrollLeft: 1000,
      clientWidth: 500,
      scrollWidth: 1750,
      direction: 1,
    }),
    1250,
  );
  assert.equal(
    resolveCardViewPageScrollTarget({
      scrollLeft: 1000,
      clientWidth: 500,
      scrollWidth: 2500,
      direction: -1,
    }),
    500,
  );
});

test("Card View shell owns live, a collapsible activity drawer, arrows, and footer regions", () => {
  const markup = buildCardViewMainLayoutShellMarkup({
    regions: {
      live: '<div data-fvc-region="live"></div>',
      livePictureInPicture:
        '<button data-fvc-region="live-picture-in-picture"></button>',
      liveFullscreen: '<button data-fvc-region="live-fullscreen"></button>',
      liveTakeSnapshot:
        '<button data-fvc-region="live-take-snapshot"></button>',
      liveMute: '<button data-fvc-region="live-mute"></button>',
      pageNavigation:
        '<div data-fvc-region="page-navigation"></div>',
      drawerHandleIcon: "chevron",
    },
  });

  assert.match(markup, /data-fvc-region="card-view-activity"/);
  assert.match(markup, /data-card-view-drawer/);
  assert.equal(
    (markup.match(/data-card-view-drawer-toggle/g) || []).length,
    2,
  );
  assert.match(markup, /card-view-drawer-handle--left/);
  assert.match(markup, /card-view-drawer-handle--right/);
  assert.match(markup, /data-card-view-scroll="-1"/);
  assert.match(markup, /data-card-view-scroll="1"/);
  assert.match(markup, /card-view-footer-end[\s\S]*card-view-calendar-panel/);
  assert.match(markup, /data-card-view-calendar[^>]*hidden/);
  assert.match(markup, /card-view-footer/);
});

test("Card View toolbar swaps alert and recording controls without a day heading", () => {
  const markup = buildCardViewToolbarMarkup({
    mode: "recordings",
    icons: { alerts: "alerts", calendar: "calendar" },
    showMicrophone: true,
    microphoneMarkup: "microphone",
    linkedLightRightMarkup: "light",
  });
  assert.match(markup, />Recordings</);
  assert.match(markup, /card-view-mode-switch-label">Goto Alerts</);
  assert.match(markup, /card-view-toolbar-center/);
  assert.match(markup, /data-fvc-region="two-way-talk">microphone/);
  assert.match(
    markup,
    /data-linked-light-position-slot="right"[^>]*>light/,
  );
  assert.doesNotMatch(markup, /data-card-view-calendar/);
  assert.doesNotMatch(markup, /Day\/Date/);
  assert.ok(
    markup.indexOf("card-view-toolbar-start") <
      markup.indexOf("card-view-toolbar-center"),
  );
  assert.ok(
    markup.indexOf("card-view-toolbar-center") <
      markup.indexOf("card-view-activity-actions"),
  );

  const alertsMarkup = buildCardViewToolbarMarkup({
    mode: "alerts",
    icons: { recordings: "recordings" },
    activeCameraName: "Doorbell",
  });
  assert.match(alertsMarkup, /card-view-activity-heading">Alerts</);
  assert.doesNotMatch(alertsMarkup, /Recent Alerts/);
  assert.match(
    alertsMarkup,
    /card-view-mode-switch-label">Goto Recordings</,
  );
  assert.match(alertsMarkup, /data-card-view-alert-scope/);
  assert.match(alertsMarkup, />Show Doorbell Alerts</);
  assert.doesNotMatch(markup, /data-card-view-alert-scope/);
});

test("Card View toolbar progressively stacks then hides both compact labels", () => {
  assert.match(
    CARD_VIEW_PAGE_STYLES,
    /@container card-view-activity \(max-width:560px\)[\s\S]*?:is\(\.card-view-mode-switch,\.card-view-alert-scope-switch\)[\s\S]*?flex-direction:column/,
  );
  assert.match(
    CARD_VIEW_PAGE_STYLES,
    /@container card-view-activity \(max-width:400px\)[\s\S]*?\.card-view-mode-switch-label \{display:none;\}/,
  );
  assert.match(
    CARD_VIEW_PAGE_STYLES,
    /\.card-view-toolbar-center \{[^}]*gap:12px/,
  );
});

test("Card View toolbar exposes shared Grid and Slideshow mode states", () => {
  const markup = buildCardViewToolbarMarkup({
    icons: {
      alerts: "alerts",
      grid: "grid",
      presentationPlay: "slideshow",
      ptz: "ptz",
    },
    showPtz: true,
    ptzDisabled: true,
    gridAvailable: true,
    gridActive: true,
    slideshowAvailable: true,
    slideshowDisabled: true,
    alertTakeoverDisabled: true,
  });

  assert.match(markup, /class="icon-btn active" id="grid-btn"/);
  assert.doesNotMatch(markup, /id="grid-btn"[^>]* disabled/);
  assert.match(markup, /id="slideshow-btn"[^>]* disabled/);
  assert.match(markup, /data-card-view-takeover[^>]* disabled/);
  assert.match(markup, /data-card-view-ptz[^>]* disabled/);
});

test("Card View shares the Mobile View camera picker and uses a two-state drawer", () => {
  assert.match(CAMERA_PICKER_STYLES, /\.card\.mobile-view-active/);
  assert.match(CAMERA_PICKER_STYLES, /\.card\.card-view-active/);
  assert.match(CAMERA_PICKER_STYLES, /background:rgba\(255,255,255,\.2\)/);
  assert.match(
    CARD_VIEW_PAGE_STYLES,
    /card-view-calendar-panel[\s\S]*top:auto;[^}]*bottom:calc\(100% \+ 7px\)/,
  );
  assert.match(
    CARD_VIEW_PAGE_STYLES,
    /card-view-drawer\.is-open \+ \.card-view-footer \.card-view-drawer-handle svg \{transform:rotate\(180deg\);\}/,
  );
  assert.match(
    CARD_VIEW_PAGE_STYLES,
    /card-view-drawer\.is-closed \+ \.card-view-footer \.card-view-drawer-handle svg \{transform:rotate\(0deg\);\}/,
  );
  assert.match(
    CARD_VIEW_PAGE_STYLES,
    /card-view-drawer\.is-closed[\s\S]*grid-template-rows:minmax\(0,0fr\)/,
  );
  assert.match(
    CARD_VIEW_PAGE_STYLES,
    /card\.card-view-active[\s\S]*overflow:hidden !important/,
  );
  assert.match(
    CARD_VIEW_PAGE_STYLES,
    /@container card-view-activity \(max-width:440px\)[\s\S]*grid-template-areas:"start start start" "\. center actions"/,
  );
  assert.match(
    CARD_VIEW_PAGE_STYLES,
    /@container card-view-activity \(max-width:400px\)[\s\S]*grid-template-areas:"start start start" "\. center \." "actions actions actions";/,
  );
  assert.match(
    CARD_VIEW_PAGE_STYLES,
    /card-view-footer \{[^}]*align-items:center;[^}]*height:var\(--fvc-footer-height\);[^}]*min-height:var\(--fvc-footer-height\)/,
  );
  assert.match(
    CARD_VIEW_PAGE_STYLES,
    /grid-template-columns:auto minmax\(44px,1fr\) auto minmax\(44px,1fr\) auto/,
  );
  assert.match(
    CARD_VIEW_PAGE_STYLES,
    /card-view-drawer-handle \{[^}]*width:min\(100%,80px\);[^}]*min-width:44px/,
  );
});

test("Card View drawer swipes settle fully open or closed", () => {
  assert.equal(
    resolveCardViewDrawerSwipe({ deltaX: 2, deltaY: -40 }),
    true,
  );
  assert.equal(
    resolveCardViewDrawerSwipe({ deltaX: 2, deltaY: 40 }),
    false,
  );
  assert.equal(
    resolveCardViewDrawerSwipe({ deltaX: 40, deltaY: 10 }),
    null,
  );
  assert.equal(
    resolveCardViewDrawerSwipe({ deltaX: 0, deltaY: 20 }),
    null,
  );
});

test("Card View drawer follows its configured starting state and toggles without rerendering", () => {
  const classes = new Set(["is-open"]);
  const attributes = new Map();
  const drawer = {
    dataset: {},
    classList: {
      toggle: (name, enabled) => {
        if (enabled) classes.add(name);
        else classes.delete(name);
      },
    },
    setAttribute: (name, value) => attributes.set(name, value),
  };
  const handles = [new Map(), new Map()].map((values) => ({
    setAttribute: (name, value) => values.set(name, value),
    values,
  }));
  const shadowRoot = {
    querySelector: (selector) =>
      selector === "[data-card-view-drawer]" ? drawer : null,
    querySelectorAll: (selector) =>
      selector === "[data-card-view-drawer-toggle]" ? handles : [],
  };
  const controller = new CardViewPageController(
    {
      _pageId: "card-view",
      _config: { card_view_drawer_default_open: false },
      shadowRoot,
    },
    { PAGE_IDS: { cardView: "card-view" } },
  );
  controller.syncDrawerState();
  assert.equal(classes.has("is-closed"), true);
  assert.equal(classes.has("is-open"), false);
  assert.equal(drawer.dataset.drawerState, "closed");
  assert.equal(attributes.get("aria-hidden"), "true");
  assert.equal(handles[0].values.get("aria-expanded"), "false");

  assert.equal(controller.toggleDrawer(), true);
  assert.equal(classes.has("is-open"), true);
  assert.equal(attributes.get("aria-hidden"), "false");
  assert.equal(handles[1].values.get("aria-expanded"), "true");
});

test("Card View footer calendar follows the open Alerts and Recordings drawer", () => {
  const classes = new Set();
  const attributes = new Map();
  const calendar = {
    hidden: true,
    disabled: false,
    classList: {
      toggle: (name, enabled) => {
        if (enabled) classes.add(name);
        else classes.delete(name);
      },
    },
    setAttribute: (name, value) => attributes.set(name, value),
  };
  const host = {
    _pageId: "card-view",
    shadowRoot: {
      querySelector: (selector) =>
        selector === "[data-card-view-calendar]" ? calendar : null,
    },
    _toolbarButtonStates: () => ({}),
  };
  const controller = new CardViewPageController(host, {
    PAGE_IDS: { cardView: "card-view" },
  });

  controller._mode = "alerts";
  controller.syncFooterControls();
  assert.equal(calendar.hidden, false);

  controller._mode = "recordings";
  controller._calendarOpen = true;
  controller.syncFooterControls();
  assert.equal(calendar.hidden, false);
  assert.equal(classes.has("active"), true);
  assert.equal(attributes.get("aria-pressed"), "true");

  controller.renderCalendar = () => {};
  controller._drawerOpen = false;
  controller._mode = "alerts";
  controller.syncFooterControls();
  assert.equal(calendar.hidden, true);
  assert.equal(controller._calendarOpen, false);

  controller._drawerOpen = true;
  controller._mode = "ptz";
  controller.syncFooterControls();
  assert.equal(calendar.hidden, true);
  assert.equal(controller._calendarOpen, false);
});

test("Card View calendar passes the timezone-aware current day to shared markup", () => {
  const panel = { hidden: true, innerHTML: "" };
  const host = {
    _pageShellRegion: (regionKey) =>
      regionKey === "calendarPanel" ? panel : null,
    _tzParts: () => ({ year: 2026, month: 9, day: 2 }),
    _tz: () => "America/Chicago",
    _calendarMonthLabel: () => "September 2026",
    _daysWithActivity: new Set(),
  };
  const controller = new CardViewPageController(host, {
    buildCalendarPanelMarkup: (state) => JSON.stringify(state),
  });
  controller._calendarOpen = true;
  controller._calendarMonth = new Date(Date.UTC(2026, 8, 15, 12, 0, 0));

  controller.renderCalendar();

  const state = JSON.parse(panel.innerHTML);
  assert.equal(panel.hidden, false);
  assert.equal(state.todayDateString, "2026-09-02");
  assert.equal(state.activeDayDateString, "");
});

test("Card View alert takeover yields to active shared modes", () => {
  let toolbarSyncs = 0;
  const host = {
    _pageId: "card-view",
    _config: { card_view_alert_takeover: true },
    _toolbarButtonStates: () => ({ wideAlertTakeoverDisabled: true }),
    _syncToolbarButtons: () => {
      toolbarSyncs += 1;
    },
  };
  const controller = new CardViewPageController(host, {
    PAGE_IDS: { cardView: "card-view" },
  });

  assert.equal(controller._yieldAlertTakeoverToActiveMode(), true);
  assert.equal(controller.alertTakeoverEnabled(), false);
  assert.equal(controller.toggleAlertTakeover(), false);
  assert.equal(toolbarSyncs, 1);
});

test("Card View alert tiles retain media actions but omit favorite actions", () => {
  const content = { innerHTML: "" };
  let reviewOptions = null;
  const host = {
    _pageId: "card-view",
    _pageShellRegion: (region) =>
      region === "cardViewActivity" ? content : null,
    _reviewListItemHTML: (_review, options) => {
      reviewOptions = options;
      return '<div class="list-item">alert</div>';
    },
  };
  const controller = new CardViewPageController(host, {
    PAGE_IDS: { cardView: "card-view" },
  });
  controller._alerts = [{ id: "review-1" }];
  controller._bindScroller = () => {};

  controller.renderActivity();

  assert.deepEqual(reviewOptions, {
    cameraAware: true,
    showDownloadButtons: true,
    showFavoriteButton: false,
  });
});

test("Card View preserves alert tile DOM when repeated entry renders are identical", () => {
  let writes = 0;
  let markup = "";
  const content = {};
  Object.defineProperty(content, "innerHTML", {
    get: () => markup,
    set: (value) => {
      writes += 1;
      markup = value;
    },
  });
  const host = {
    _pageId: "card-view",
    _pageShellRegion: (region) =>
      region === "cardViewActivity" ? content : null,
    _reviewListItemHTML: () => '<div class="list-item">alert</div>',
  };
  const controller = new CardViewPageController(host, {
    PAGE_IDS: { cardView: "card-view" },
  });
  controller._alerts = [{ id: "review-1" }];
  controller._bindScroller = () => {};

  controller.renderActivity();
  controller.renderActivity();

  assert.equal(writes, 1);
});

test("Card View preserves toolbar DOM when repeated renders are identical", () => {
  let writes = 0;
  let markup = "";
  const toolbar = {};
  Object.defineProperty(toolbar, "innerHTML", {
    get: () => markup,
    set: (value) => {
      writes += 1;
      markup = value;
    },
  });
  const host = {
    _pageId: "card-view",
    _config: {},
    _activeCam: { name: "Doorbell", entity: "camera.doorbell" },
    _viewMode: "single",
    _toolbarButtonStates: () => ({}),
    _isGridModeAvailable: () => false,
    _isSlideshowRotationAvailable: () => false,
    _shouldRenderTwoWayTalkButtonForActiveCamera: () => false,
    shadowRoot: {
      querySelector: (selector) =>
        selector === "[data-card-view-toolbar]" ? toolbar : null,
    },
  };
  const controller = new CardViewPageController(host, {
    PAGE_IDS: { cardView: "card-view" },
  });

  controller.renderToolbar();
  controller.renderToolbar();

  assert.equal(writes, 1);
});

test("Card View coalesces initial scroller measurement until after paint", () => {
  const originalRequestAnimationFrame = globalThis.requestAnimationFrame;
  const originalCancelAnimationFrame = globalThis.cancelAnimationFrame;
  const callbacks = [];
  const scroller = {
    addEventListener() {},
    removeEventListener() {},
  };
  const host = {
    _pageId: "card-view",
    shadowRoot: {
      querySelector: (selector) =>
        selector === "[data-card-view-scroller]" ? scroller : null,
    },
  };
  const controller = new CardViewPageController(host, {
    PAGE_IDS: { cardView: "card-view" },
  });
  let syncs = 0;
  controller.syncScrollControls = () => {
    syncs += 1;
  };
  globalThis.requestAnimationFrame = (callback) => {
    callbacks.push(callback);
    return callbacks.length;
  };
  globalThis.cancelAnimationFrame = () => {};
  try {
    controller._bindScroller();
    controller._bindScroller();

    assert.equal(callbacks.length, 1);
    callbacks.shift()();
    assert.equal(syncs, 0);
    assert.equal(callbacks.length, 1);
    callbacks.shift()();
    assert.equal(syncs, 1);
  } finally {
    globalThis.requestAnimationFrame = originalRequestAnimationFrame;
    globalThis.cancelAnimationFrame = originalCancelAnimationFrame;
  }
});

test("Card View switches alert scope between all and the active camera", () => {
  const reviews = [
    { id: "front", camera: "front", start_time: 2 },
    { id: "back", camera: "back", start_time: 1 },
  ];
  const host = {
    _pageId: "card-view",
    _activeCam: { entity: "camera.front" },
    _allGridReviews: () => reviews,
    _cameraEntityForIncomingCamera: (camera) => `camera.${camera}`,
  };
  const controller = new CardViewPageController(host, {
    PAGE_IDS: { cardView: "card-view" },
  });
  controller.renderToolbar = () => {};
  controller.renderActivity = () => {};

  controller._syncAlertsFromCache();
  assert.deepEqual(controller._alerts.map(({ id }) => id), ["front", "back"]);

  assert.equal(controller.toggleAlertScope(), false);
  assert.deepEqual(controller._alerts.map(({ id }) => id), ["front"]);

  assert.equal(controller.toggleAlertScope(), true);
  assert.deepEqual(controller._alerts.map(({ id }) => id), ["front", "back"]);
});

test("Card View recordings use a flat responsive carousel", () => {
  const content = { innerHTML: "", dataset: {} };
  const host = {
    _pageId: "card-view",
    _pageShellRegion: (region) =>
      region === "cardViewActivity" ? content : null,
    _dateTimeLabel: () => "Today",
    _time: () => "1:00 pm",
  };
  const controller = new CardViewPageController(host, {
    PAGE_IDS: { cardView: "card-view" },
  });
  controller._mode = "recordings";
  controller._recordings = [
    { start_time: 100, end_time: 160 },
    { start_time: 200, end_time: 260 },
  ];
  controller._bindScroller = () => {};

  controller.renderActivity();

  assert.match(content.innerHTML, /card-view-scroller--recordings/);
  assert.equal(
    content.innerHTML.match(/card-view-recording-slot/g)?.length,
    2,
  );
  assert.doesNotMatch(content.innerHTML, /card-view-page/);
  assert.match(
    CARD_VIEW_PAGE_STYLES,
    /data-card-view-columns="3"[^}]*flex-basis:33\.333333%/,
  );
  assert.match(
    CARD_VIEW_PAGE_STYLES,
    /card-view-recording-tile \{[^}]*width:100%;[^}]*flex:1 1 auto/,
  );
  assert.match(
    CARD_VIEW_PAGE_STYLES,
    /card-view-recording-slot \{[^}]*scroll-snap-stop:normal/,
  );
});

test("Card View recording breakpoints update sizing without repainting tiles", () => {
  const originalResizeObserver = globalThis.ResizeObserver;
  let resizeCallback = null;
  let width = 500;
  const content = {
    dataset: {},
    clientWidth: width,
    getBoundingClientRect: () => ({ width }),
  };
  globalThis.ResizeObserver = class {
    constructor(callback) {
      resizeCallback = callback;
    }
    observe() {}
    disconnect() {}
  };
  try {
    const host = {
      _pageId: "card-view",
      _pageShellRegion: (region) =>
        region === "cardViewActivity" ? content : null,
      ownerDocument: { addEventListener() {}, removeEventListener() {} },
    };
    const controller = new CardViewPageController(host, {
      PAGE_IDS: { cardView: "card-view" },
    });
    controller._mode = "recordings";
    controller._bindScroller = () => {};
    controller.syncScrollControls = () => {};
    let renders = 0;
    controller.renderActivity = () => {
      renders += 1;
    };

    controller.bind();
    assert.equal(content.dataset.cardViewColumns, "2");
    assert.equal(renders, 0);

    width = 900;
    resizeCallback();
    assert.equal(content.dataset.cardViewColumns, "3");
    assert.equal(renders, 0);
  } finally {
    globalThis.ResizeObserver = originalResizeObserver;
  }
});

test("Card View shows a loading state before its first recordings request", () => {
  const host = {
    _pageId: "card-view",
    _pageShellRegion: () => ({ clientWidth: 500 }),
  };
  const controller = new CardViewPageController(host, {
    PAGE_IDS: { cardView: "card-view" },
  });
  controller.renderToolbar = () => {};
  let loadingAtRender = false;
  controller.renderActivity = () => {
    loadingAtRender = controller._recordingsLoading;
  };
  let recordingLoads = 0;
  controller.loadRecordings = async () => {
    recordingLoads += 1;
  };

  controller.toggleMode();

  assert.equal(controller._mode, "recordings");
  assert.equal(loadingAtRender, true);
  assert.equal(recordingLoads, 1);
});

test("Card View re-entry refreshes the mode that remains visible", async () => {
  const host = {
    _pageId: "card-view",
    _allGridReviews: () => [],
  };
  const controller = new CardViewPageController(host, {
    PAGE_IDS: { cardView: "card-view" },
  });
  controller._mode = "recordings";
  controller._returnMode = "recordings";
  controller.renderToolbar = () => {};
  controller.renderActivity = () => {};
  let alertLoads = 0;
  let recordingLoads = 0;
  controller.loadAlerts = async () => {
    alertLoads += 1;
  };
  controller.loadRecordings = async () => {
    recordingLoads += 1;
  };

  await controller.start();

  assert.equal(recordingLoads, 1);
  assert.equal(alertLoads, 0);
});

test("Card View resolves alert columns before bind returns", () => {
  const content = {
    clientWidth: 900,
    getBoundingClientRect: () => ({ width: 900 }),
  };
  const host = {
    _pageId: "card-view",
    _pageShellRegion: (region) =>
      region === "cardViewActivity" ? content : null,
  };
  const controller = new CardViewPageController(host, {
    PAGE_IDS: { cardView: "card-view" },
  });
  let activityRenders = 0;
  controller.renderActivity = () => {
    activityRenders += 1;
  };
  controller._bindScroller = () => {};

  controller.bind();

  assert.equal(controller._columns, 2);
  assert.equal(activityRenders, 1);
});

test("Card View progressively paints only the first non-empty alert batch", async () => {
  let cachedReviews = [];
  let activityRenders = 0;
  const progressRenderCounts = [];
  const host = {
    _pageId: "card-view",
    _config: { window_days: 3 },
    _allGridReviews: () => cachedReviews,
    _loadGridMixedTabData: async (_tab, { onProgress }) => {
      for (let index = 1; index <= 3; index += 1) {
        cachedReviews = [
          ...cachedReviews,
          { id: `review-${index}`, start_time: index },
        ];
        onProgress();
        progressRenderCounts.push(activityRenders);
      }
    },
    _browseWindowLoaderController: {
      warmOtherCamerasEvents: async () => {},
    },
  };
  const controller = new CardViewPageController(host, {
    PAGE_IDS: { cardView: "card-view" },
  });
  controller.renderActivity = () => {
    activityRenders += 1;
  };

  await controller.loadAlerts({ force: true });

  assert.deepEqual(progressRenderCounts, [2, 2, 2]);
  assert.equal(controller._alerts.length, 3);
});

test("Card View maps realtime Frigate camera names before alert takeover", () => {
  let switchedTo = -1;
  let refreshes = 0;
  const host = {
    _pageId: "card-view",
    _activeCamIdx: 0,
    _config: { card_view_alert_takeover: true },
    _extractRealtimeMessageCamera: () => "front_door",
    _cameraEntityForIncomingCamera: (camera) =>
      camera === "front_door" ? "camera.front_door" : "",
    _extractRealtimeMessageSeverity: () => "alert",
    _shouldHandleSlideshowReview: () => true,
    _cameraIndexByEntity: (entity) =>
      entity === "camera.front_door" ? 2 : -1,
    _switchCamera: (index) => {
      switchedTo = index;
    },
  };
  const controller = new CardViewPageController(host, {
    PAGE_IDS: { cardView: "card-view" },
  });
  controller._scheduleAlertRefresh = () => {
    refreshes += 1;
  };

  controller.handleRealtimeMessage({ type: "review", camera: "front_door" });

  assert.equal(refreshes, 1);
  assert.equal(switchedTo, 2);
});

test("Card View opens media in the standard full-width popup", async () => {
  const calls = [];
  const event = { id: "event-1", camera: "front" };
  const host = {
    _pageId: "card-view",
    _popupMediaLoaderController: {
      showClip: (...args) => calls.push(["clip", ...args]),
      showCarouselEventById: (...args) => calls.push(["carousel", ...args]),
      showRecording: (...args) => calls.push(["recording", ...args]),
    },
  };
  const controller = new CardViewPageController(host, {
    PAGE_IDS: { cardView: "card-view" },
  });
  controller._ensureReviewEvent = async () => event;

  await controller._openReview({ camera: "front" }, event.id);
  controller.handleClick(
    { stopPropagation: () => {} },
    {
      closest: (selector) =>
        selector === "[data-popup-media-target]"
          ? {
              dataset: {
                popupEventId: event.id,
                popupMediaTarget: "snapshot",
              },
            }
          : null,
    },
  );
  controller.handleClick(null, {
    closest: (selector) =>
      selector === "[data-rs]"
        ? { dataset: { rs: "100", re: "200" } }
        : null,
  });

  assert.deepEqual(calls, [
    ["clip", event, { mediaType: "alert" }],
    ["carousel", event.id, "snapshot"],
    ["recording", 100, 200],
  ]);
});
