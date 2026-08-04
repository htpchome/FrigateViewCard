import { test } from "node:test";
import assert from "node:assert/strict";

import { MobileViewPageController } from "../src/features/mobile-view/page.ctrl.js";

const PAGE_IDS = {
  preview: "preview",
  mobileView: "mobile-view",
};

const createNode = () => ({
  style: {},
  textContent: "",
  innerHTML: "",
});

const createHost = ({ popupOpen = false, domNodes = {} } = {}) => {
  const calls = [];
  const nodeMap = domNodes;
  const host = {
    _pageId: PAGE_IDS.mobileView,
    _viewMode: "single",
    _config: {
      title: "",
      subtitle: "Mobile Feed",
      cameras: [
        { entity: "camera.front_door", name: "Front Door" },
        { entity: "camera.driveway", name: "Driveway" },
      ],
    },
    _activeCamIdx: 0,
    _activeCam: { entity: "camera.front_door", name: "Front Door" },
    _activeStreamType: "webrtc",
    _eventsMode: "all",
    _tab: "alerts",
    _winEnd: 1722470400,
    _allDisplayEvents: () => [{ id: 1 }, { id: 2 }],
    _labels: () => ["person", "car"],
    _weekday: () => "Wed",
    _monthDay: () => "Jul 31st",
    _dayKey: () => "2026-07-31",
    _eventCardHTML: (item) => `<article class="event">${item.id}</article>`,
    _reviewListItemHTML: (item) =>
      `<article class="review">${item.id}</article>`,
    _exhausted: false,
    _updateRecordingsBrowseNav: () => calls.push(["updateRecordingsBrowseNav"]),
    _isPreviewPageEnabled: () => false,
    _hass: {
      states: {
        "camera.front_door": { state: "streaming" },
        "camera.driveway": { state: "streaming" },
      },
    },
    _stopPreviewMode: () => calls.push(["stopPreview"]),
    _$: (selector) => {
      if (selector === "#myPopup" && popupOpen) {
        return {
          classList: {
            contains: (className) => className === "is-open",
          },
        };
      }
      if (nodeMap[selector]) return nodeMap[selector];
      if (selector === "#card") {
        return {
          classList: {
            toggle: (className, enabled) =>
              calls.push(["toggleClass", className, enabled]),
          },
        };
      }
      return null;
    },
    _closePopup: () => calls.push(["closePopup"]),
    _cancelPendingMount: (reason) => calls.push(["cancelPendingMount", reason]),
    _applyPreviewShellVisibility: () =>
      calls.push(["applyPreviewShellVisibility"]),
    _mountEngine: (...args) => calls.push(["mountEngine", ...args]),
    _syncTabsShell: () => calls.push(["syncTabsShell"]),
    _renderAll: () => calls.push(["renderAll"]),
    _wideViewPageController: {
      applyStyleLayoutAndWideSyncForCard: () =>
        calls.push(["applyStyleLayoutAndWideSyncForCard"]),
    },
  };
  return { host, calls };
};

test("activateMobileViewPageRoute handles startup like single-view", () => {
  const { host, calls } = createHost();
  const controller = new MobileViewPageController(host, { PAGE_IDS });

  controller.activateMobileViewPageRoute({ startup: true });

  assert.deepEqual(calls, [
    ["applyPreviewShellVisibility"],
    ["applyStyleLayoutAndWideSyncForCard"],
    ["toggleClass", "mobile-view-active", true],
    ["mountEngine"],
  ]);
});

test("activateMobileViewPageRoute leaves preview and remounts quietly", () => {
  const { host, calls } = createHost({ popupOpen: true });
  const controller = new MobileViewPageController(host, { PAGE_IDS });

  controller.activateMobileViewPageRoute({ previousPageId: PAGE_IDS.preview });

  assert.deepEqual(calls, [
    ["stopPreview"],
    ["closePopup"],
    ["cancelPendingMount", "page-route-mobile-view"],
    ["applyPreviewShellVisibility"],
    ["applyStyleLayoutAndWideSyncForCard"],
    ["toggleClass", "mobile-view-active", true],
    ["mountEngine", null, { quiet: true }],
    ["syncTabsShell"],
    ["renderAll"],
  ]);
});

test("syncMobileViewPageMarkup toggles class off when route is not mobile", () => {
  const { host, calls } = createHost();
  const controller = new MobileViewPageController(host, { PAGE_IDS });

  host._pageId = "single-view";
  controller.syncMobileViewPageMarkup();

  assert.deepEqual(calls, [["toggleClass", "mobile-view-active", false]]);
});

test("mobile-view render helpers update subtitle and stats", () => {
  const nodes = {
    "#tl-range": createNode(),
    "#ev-count": createNode(),
    "#stream-type": createNode(),
  };
  const { host } = createHost({ domNodes: nodes });
  const controller = new MobileViewPageController(host, { PAGE_IDS });

  controller.renderSubtitle();
  controller.renderStats();

  assert.equal(nodes["#tl-range"].textContent, "Mobile Feed");
  assert.equal(nodes["#ev-count"].textContent, "2");
  assert.equal(nodes["#stream-type"].textContent, "webrtc");
});

test("mobile-view render helpers update status and title", () => {
  const nodes = {
    "#on-dot": createNode(),
    "#on-lbl": createNode(),
    "#info-title": createNode(),
  };
  const { host } = createHost({ domNodes: nodes });
  const controller = new MobileViewPageController(host, { PAGE_IDS });

  controller.syncStatus();

  assert.equal(nodes["#on-dot"].style.color, "#4ade80");
  assert.equal(nodes["#on-lbl"].textContent, "Online");
  assert.equal(nodes["#info-title"].textContent, "Front Door");
});

test("mobile-view camera switcher render hides for a single camera when preview is disabled", () => {
  const nodes = {
    "#cam-switcher": createNode(),
  };
  const { host } = createHost({ domNodes: nodes });
  host._config.cameras = [{ entity: "camera.front_door", name: "Front Door" }];
  const controller = new MobileViewPageController(host, { PAGE_IDS });

  controller.renderCamSwitcher();

  assert.equal(nodes["#cam-switcher"].style.display, "none");
});

test("mobile-view camera switcher markup includes camera buttons", () => {
  const { host } = createHost();
  const controller = new MobileViewPageController(host, { PAGE_IDS });

  const markup = controller.camSwitcherMarkup({ includeStatus: true });

  assert.equal(markup.includes('data-camidx="0"'), true);
  assert.equal(markup.includes("Front Door"), true);
});

test("mobile-view renderLegend populates deterministic legend markup", () => {
  const nodes = {
    "#legend": createNode(),
  };
  const { host } = createHost({ domNodes: nodes });
  const controller = new MobileViewPageController(host, { PAGE_IDS });

  controller.renderLegend();

  assert.equal(nodes["#legend"].innerHTML.includes("Person"), true);
  assert.equal(nodes["#legend"].innerHTML.includes("Car"), true);
  assert.equal(nodes["#legend"].innerHTML.includes("Front Door rec"), true);
});

test("mobile-view list label helpers format alerts and recordings headings", () => {
  const { host, calls } = createHost();
  const controller = new MobileViewPageController(host, { PAGE_IDS });

  assert.equal(
    controller.listHeadingLabel(1722470400),
    "Wed - Jul 31st - Recent Alerts",
  );
  assert.equal(
    controller.recordingsHeadingLabel(1722470400),
    "Wed - Jul 31st - Recordings",
  );

  host._tab = "recordings";
  const nodes = {
    "#browse-head-label": createNode(),
    "#browse-head": createNode(),
    "#rec-day-prev": createNode(),
    "#rec-day-next": createNode(),
    "#card": {
      classList: {
        contains: (className) => className === "mobile",
        toggle: () => {},
      },
    },
  };
  host._$ = (selector) => nodes[selector] || null;

  controller.renderListLabel(1722470400);

  assert.equal(nodes["#browse-head"].style.display, "flex");
  assert.equal(
    nodes["#browse-head-label"].textContent,
    "Wed - Jul 31st - Recordings",
  );
  assert.equal(nodes["#rec-day-prev"].style.display, "none");
  assert.equal(nodes["#rec-day-next"].style.display, "none");
  assert.deepEqual(calls.slice(-1), [["updateRecordingsBrowseNav"]]);
});

test("mobile-view sticky-day helpers expose grouped section rendering", () => {
  const { host } = createHost();
  const controller = new MobileViewPageController(host, { PAGE_IDS });

  assert.equal(controller.showStickyDayHeaders(), true);

  const html = controller.renderStickyDaySections(
    [{ start_time: 1722470400, id: 1 }],
    (item) => `<article>${item.id}</article>`,
  );

  assert.equal(html.includes("Wed - Jul 31st - Recent Alerts"), true);
  assert.equal(html.includes("<article>1</article>"), true);
});

test("mobile-view event content helper builds flat and grouped markup", () => {
  const { host } = createHost();
  const controller = new MobileViewPageController(host, { PAGE_IDS });

  host._tab = "kept";
  let html = controller.renderEventsContent([{ id: 1 }]);
  assert.equal(html.includes('<article class="event">1</article>'), true);
  assert.equal(html.includes("list-day-sec"), false);

  host._tab = "alerts";
  host._exhausted = true;
  html = controller.renderEventsContent([{ id: 2, start_time: 1722470400 }]);
  assert.equal(html.includes("list-day-sec"), true);
  assert.equal(html.includes("Wed - Jul 31st - Recent Alerts"), true);
  assert.equal(html.includes('<div class="end">— end —</div>'), true);
});

test("mobile-view kept content helper builds flat markup without end marker", () => {
  const { host } = createHost();
  const controller = new MobileViewPageController(host, { PAGE_IDS });

  host._exhausted = true;
  const html = controller.renderKeptContent([{ id: 3 }, { id: 4 }]);

  assert.equal(html.includes('<article class="event">3</article>'), true);
  assert.equal(html.includes('<article class="event">4</article>'), true);
  assert.equal(html.includes("list-day-sec"), false);
  assert.equal(html.includes('<div class="end">— end —</div>'), false);
});

test("mobile-view review content helper builds grouped markup", () => {
  const { host } = createHost();
  const controller = new MobileViewPageController(host, { PAGE_IDS });

  const html = controller.renderReviewsContent([
    { id: 7, start_time: 1722470400 },
  ]);

  assert.equal(html.includes("list-day-sec"), true);
  assert.equal(html.includes('<article class="review">7</article>'), true);
});

test("mobile-view browse-head sync follows active sticky day label", () => {
  const labelOne = {
    dataset: { dayLabel: "Wed - Jul 31st - Recent Alerts" },
    textContent: "Wed - Jul 31st - Recent Alerts",
    getBoundingClientRect: () => ({ top: 90 }),
  };
  const labelTwo = {
    dataset: { dayLabel: "Tue - Jul 30th - Recent Alerts" },
    textContent: "Tue - Jul 30th - Recent Alerts",
    getBoundingClientRect: () => ({ top: 110 }),
  };
  const nodes = {
    "#list": {
      scrollHeight: 0,
      clientHeight: 0,
      scrollTop: 0,
      querySelectorAll: () => [labelOne, labelTwo],
    },
    "#browse": {
      scrollTop: 0,
      getBoundingClientRect: () => ({ top: 100 }),
    },
    "#browse-head-label": createNode(),
  };
  const { host } = createHost({ domNodes: nodes });
  const controller = new MobileViewPageController(host, { PAGE_IDS });

  controller.syncBrowseHeadFromScroll();

  assert.equal(
    nodes["#browse-head-label"].textContent,
    "Wed - Jul 31st - Recent Alerts",
  );
});
