import { test } from "node:test";
import assert from "node:assert/strict";

import { BrowseRenderController } from "../src/features/browse/render.ctrl.js";

const createClassList = () => {
  const values = new Set();
  return {
    contains: (name) => values.has(name),
    toggle: (name, enabled) => {
      if (enabled) values.add(name);
      else values.delete(name);
    },
  };
};

const createHost = () => {
  let listHtml = "";
  let listWrites = 0;
  const list = {
    scrollHeight: 0,
    clientHeight: 0,
    scrollTop: 0,
    querySelector: () => null,
    querySelectorAll: () => [],
    get innerHTML() {
      return listHtml;
    },
    set innerHTML(value) {
      listWrites += 1;
      listHtml = value;
    },
  };
  const browse = {
    scrollTop: 0,
    getBoundingClientRect: () => ({ top: 0 }),
  };
  const browseHeader = { style: {} };
  const browseLabel = { textContent: "" };
  const previous = { style: {} };
  const next = { style: {} };
  const hint = {
    hidden: false,
    textContent: "",
    classList: createClassList(),
    setAttribute: () => {},
    removeAttribute: () => {},
  };
  const viewer = { style: { display: "none" } };
  const calls = [];
  const host = {
    _tab: "alerts",
    _winEnd: 1722470400,
    _eventsMode: "all",
    _exhausted: false,
    _lastRenderedListHtml: "",
    _events: [],
    _kept: [],
    _reviews: [],
    _recordings: [],
    _playing: null,
    _activeCam: {
      entity: "camera.front",
      name: "Front",
      alerts_content: "all_reviews",
    },
    _config: {
      cameras: [{ entity: "camera.front", name: "Front" }],
    },
    _browseFilterController: {
      filtered: () => host._events,
      filteredKept: () => host._kept,
      filteredReviews: () => host._reviews,
      labels: () => [],
    },
    _pageShellRegion: (regionKey) => {
      if (regionKey === "browse") return browse;
      if (regionKey === "browseHeader") return browseHeader;
      return null;
    },
    _pageShellRegionElement: (_regionKey, selector) => {
      if (selector === "#list") return list;
      if (selector === "#browse-head-label") return browseLabel;
      if (selector === "#rec-day-prev") return previous;
      if (selector === "#rec-day-next") return next;
      if (selector === "#older-hint") return hint;
      return null;
    },
    _$: (selector) => (selector === "#viewer" ? viewer : null),
    _weekday: () => "Wed",
    _monthDay: () => "Jul 31st",
    _dayKey: () => "2026-07-31",
    _eventCardHTML: (item) => `<article class="event">${item.id}</article>`,
    _reviewListItemHTML: (item) =>
      `<article class="review">${item.id}</article>`,
    _recordingsViewRows: (items) => [...items],
    _recordingsListMarkup: (items, emptyText) =>
      items.length
        ? items.map((item) => `<article class="recording">${item.id}</article>`).join("")
        : `<div class="empty">${emptyText}</div>`,
    _renderControlsSection: (target) => calls.push(["controls", target]),
    _isMobilePhoneViewport: () => false,
  };
  return {
    host,
    calls,
    nodes: { list, browse, browseHeader, browseLabel, hint, viewer },
    listWrites: () => listWrites,
  };
};

test("browse render controller owns alert ordering and avoids duplicate DOM writes", () => {
  const { host, nodes, listWrites } = createHost();
  const controller = new BrowseRenderController(host);
  host._reviews = [
    { id: 1, start_time: 100 },
    { id: 2, start_time: 200 },
  ];

  controller.renderList();
  controller.renderList();

  assert.equal(nodes.list.innerHTML.indexOf(">2<") < nodes.list.innerHTML.indexOf(">1<"), true);
  assert.equal(nodes.browseLabel.textContent, "Wed - Jul 31st - Recent Alerts");
  assert.equal(listWrites(), 1);
});

test("browse render controller dispatches events and kept empty state", () => {
  const { host, nodes } = createHost();
  const controller = new BrowseRenderController(host);
  const previousAnimationFrame = globalThis.requestAnimationFrame;
  globalThis.requestAnimationFrame = (callback) => {
    callback();
    return 1;
  };

  try {
    host._tab = "clips";
    host._events = [{ id: 3, start_time: 300 }];
    controller.renderList();
    assert.equal(nodes.list.innerHTML.includes('class="event">3</article>'), true);

    host._tab = "kept";
    host._kept = [];
    controller.renderList();
    assert.equal(nodes.list.innerHTML.includes("No kept events"), true);
    assert.equal(nodes.list.innerHTML.includes("star an event to keep it"), true);
  } finally {
    globalThis.requestAnimationFrame = previousAnimationFrame;
  }
});

test("browse render controller preserves an active recording viewer", () => {
  const { host, nodes, listWrites } = createHost();
  const controller = new BrowseRenderController(host);
  host._tab = "recordings";
  host._recordings = [{ id: 4 }];
  host._playing = { rec: { id: 4 } };
  nodes.viewer.style.display = "";
  nodes.list.innerHTML = "preserved recording list";
  const writesBeforeRender = listWrites();

  controller.renderList();

  assert.equal(nodes.list.innerHTML, "preserved recording list");
  assert.equal(listWrites(), writesBeforeRender);

  nodes.viewer.style.display = "none";
  controller.renderList();

  assert.equal(nodes.list.innerHTML.includes('class="recording">4</article>'), true);
});

test("browse render controller delegates controls without touching live regions", () => {
  const { host, calls, nodes } = createHost();
  let liveRegionAccesses = 0;
  const originalRegion = host._pageShellRegion;
  host._pageShellRegion = (regionKey) => {
    if (regionKey === "live") liveRegionAccesses += 1;
    return originalRegion(regionKey);
  };
  host._tab = "controls";
  const controller = new BrowseRenderController(host);

  controller.renderList();

  assert.deepEqual(calls, [["controls", nodes.list]]);
  assert.equal(nodes.hint.hidden, true);
  assert.equal(liveRegionAccesses, 0);
});
