import { test } from "node:test";
import assert from "node:assert/strict";

import { BrowseRenderController } from "../src/features/browse/render.ctrl.js";

const createHost = () => {
  let listHtml = "";
  let listWrites = 0;
  let reviewRowRenders = 0;
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
  const returnToTop = {
    hidden: true,
    attributes: new Map(),
    setAttribute(name, value) {
      this.attributes.set(name, value);
    },
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
    _popupLifecycleController: {
      playing: () => null,
    },
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
      if (selector === "#browse-return-top") return returnToTop;
      return null;
    },
    _$: (selector) => (selector === "#viewer" ? viewer : null),
    _weekday: () => "Wed",
    _monthDay: () => "Jul 31st",
    _dayKey: () => "2026-07-31",
    _eventCardHTML: (item) => `<article class="event">${item.id}</article>`,
    _reviewListItemHTML: (item) => {
      reviewRowRenders += 1;
      return `<article class="review">${item.id}</article>`;
    },
    _recordingsViewRows: (items) => [...items],
    _recordingsListMarkup: (items, emptyText) =>
      items.length
        ? items.map((item) => `<article class="recording">${item.id}</article>`).join("")
        : `<div class="empty">${emptyText}</div>`,
    _renderControlsSection: (target) => calls.push(["controls", target]),
  };
  return {
    host,
    calls,
    nodes: {
      list,
      browse,
      browseHeader,
      browseLabel,
      previous,
      next,
      returnToTop,
      viewer,
    },
    listWrites: () => listWrites,
    reviewRowRenders: () => reviewRowRenders,
  };
};

test("browse render controller exposes the return-to-top chip after scrolling", () => {
  const { host, nodes } = createHost();
  const controller = new BrowseRenderController(host);
  const previousGetComputedStyle = globalThis.getComputedStyle;
  globalThis.getComputedStyle = () => ({ overflowY: "visible" });
  nodes.browse.scrollTop = 300;
  nodes.browse.scrollHeight = 1000;
  nodes.browse.clientHeight = 400;

  try {
    controller.syncOlderHint();
    assert.equal(nodes.returnToTop.hidden, false);
    assert.equal(nodes.returnToTop.attributes.get("aria-hidden"), "false");

    nodes.browse.scrollTop = 0;
    controller.syncOlderHint();
    assert.equal(nodes.returnToTop.hidden, true);
  } finally {
    globalThis.getComputedStyle = previousGetComputedStyle;
  }
});

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

test("browse day headings relocalize without replacing list rows", () => {
  const { host, nodes, listWrites } = createHost();
  const controller = new BrowseRenderController(host);
  const row = { id: "preserved" };
  const dayLabel = {
    dataset: { dayTs: "1722470400", dayLabel: "Wed - Jul 31st - Recent Alerts" },
    textContent: "Wed - Jul 31st - Recent Alerts",
    getBoundingClientRect: () => ({ top: 0 }),
  };
  nodes.list.querySelectorAll = (selector) => selector.startsWith(".list-day-label")
    ? [dayLabel]
    : [row];
  host._localization = {
    t: (key, values = {}) => {
      if (key === "runtime.browse.recentAlerts") return "Alertes récentes";
      if (key === "runtime.browse.datedHeading") {
        return `${values.title} · ${values.date}`;
      }
      return key;
    },
  };

  controller.relocalizeBrowseLabels();

  assert.equal(dayLabel.textContent, "Alertes récentes · Jul 31st");
  assert.equal(dayLabel.dataset.dayLabel, dayLabel.textContent);
  assert.equal(nodes.browseLabel.textContent, dayLabel.textContent);
  assert.equal(nodes.list.querySelectorAll(".list-item")[0], row);
  assert.equal(listWrites(), 0);
});

test("browse render controller writes unchanged markup into a replaced list node", () => {
  const { host, nodes } = createHost();
  const controller = new BrowseRenderController(host);
  const replacement = {
    innerHTML: "",
    querySelectorAll: () => [],
  };

  controller.setListHtmlIfChanged(nodes.list, "<div>same</div>");
  controller.setListHtmlIfChanged(replacement, "<div>same</div>");

  assert.equal(replacement.innerHTML, "<div>same</div>");
});

test("browse render controller distinguishes loading from an empty alert window", () => {
  const { host, nodes } = createHost();
  const controller = new BrowseRenderController(host);
  host._loading = true;
  host._activeCam.alerts_content = "alerts_only";

  controller.renderList();

  assert.equal(nodes.list.innerHTML.includes("Loading alerts…"), true);
  assert.equal(nodes.list.innerHTML.includes("No alerts in this window"), false);
});

test("recordings day navigation renders in the recordings header", () => {
  const { host, nodes } = createHost();
  const controller = new BrowseRenderController(host);
  host._tab = "recordings";
  controller.renderListLabel();

  assert.equal(nodes.previous.style.display, "inline-flex");
  assert.equal(nodes.next.style.display, "inline-flex");
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
    assert.equal(nodes.list.innerHTML.includes("No favorites"), true);
    assert.equal(
      nodes.list.innerHTML.includes("star an event to add it to Favorites"),
      true,
    );
  } finally {
    globalThis.requestAnimationFrame = previousAnimationFrame;
  }
});

test("first cached Clips paint renders six rows before expanding without replacing them", () => {
  const { host, nodes, listWrites } = createHost();
  const controller = new BrowseRenderController(host);
  const frameCallbacks = [];
  const previousAnimationFrame = globalThis.requestAnimationFrame;
  globalThis.requestAnimationFrame = (callback) => {
    frameCallbacks.push(callback);
    return frameCallbacks.length;
  };
  host._tab = "clips";
  host._events = Array.from({ length: 12 }, (_, index) => ({
    id: `event-${index}`,
    start_time: 300 - index,
  }));
  host._renderList = () => controller.renderList();

  const flushFrame = () => {
    const callbacks = frameCallbacks.splice(0);
    callbacks.forEach((callback) => callback());
  };

  try {
    controller.renderList();

    assert.equal(nodes.list.innerHTML.includes(">event-5</article>"), true);
    assert.equal(nodes.list.innerHTML.includes(">event-6</article>"), false);
    assert.equal(listWrites(), 1);

    flushFrame();
    assert.equal(nodes.list.innerHTML.includes(">event-6</article>"), false);

    flushFrame();
    assert.equal(nodes.list.innerHTML.includes(">event-11</article>"), true);
    assert.equal(listWrites(), 2);

    controller.renderList();
    assert.equal(listWrites(), 2);
  } finally {
    globalThis.requestAnimationFrame = previousAnimationFrame;
  }
});

test("first cached Alerts paint renders six rows before expanding", () => {
  const { host, nodes, listWrites, reviewRowRenders } = createHost();
  const controller = new BrowseRenderController(host);
  const frameCallbacks = [];
  const previousAnimationFrame = globalThis.requestAnimationFrame;
  globalThis.requestAnimationFrame = (callback) => {
    frameCallbacks.push(callback);
    return frameCallbacks.length;
  };
  host._reviews = Array.from({ length: 12 }, (_, index) => ({
    id: `review-${index}`,
    start_time: 300 - index,
  }));
  host._renderList = () => controller.renderList();

  const flushFrame = () => {
    const callbacks = frameCallbacks.splice(0);
    callbacks.forEach((callback) => callback());
  };

  try {
    controller.renderList();

    assert.equal(nodes.list.innerHTML.includes(">review-5</article>"), true);
    assert.equal(nodes.list.innerHTML.includes(">review-6</article>"), false);
    assert.equal(listWrites(), 1);

    flushFrame();
    assert.equal(nodes.list.innerHTML.includes(">review-6</article>"), false);

    flushFrame();
    assert.equal(nodes.list.innerHTML.includes(">review-11</article>"), true);
    assert.equal(listWrites(), 2);

    controller.renderList();
    assert.equal(listWrites(), 2);
    assert.equal(reviewRowRenders(), 12);
  } finally {
    globalThis.requestAnimationFrame = previousAnimationFrame;
  }
});

test("completed progressive Alerts paint reacts to source-event favorite changes", () => {
  const { host, nodes } = createHost();
  const frameCallbacks = [];
  const sourceEvents = new Map();
  const previousAnimationFrame = globalThis.requestAnimationFrame;
  globalThis.requestAnimationFrame = (callback) => {
    frameCallbacks.push(callback);
    return frameCallbacks.length;
  };
  host._reviews = Array.from({ length: 12 }, (_, index) => {
    const eventId = `event-${index}`;
    sourceEvents.set(eventId, {
      id: eventId,
      end_time: 200,
      retain_indefinitely: false,
    });
    return {
      id: `review-${index}`,
      start_time: 300 - index,
      data: { detections: [eventId] },
    };
  });
  host._browseFilterController.reviewSourceEvent = (review) =>
    sourceEvents.get(review?.data?.detections?.[0]) || null;
  host._reviewListItemHTML = (review) => {
    const event = host._browseFilterController.reviewSourceEvent(review);
    return `<article class="review" data-favorite="${event?.retain_indefinitely === true}">${review.id}</article>`;
  };
  const controller = new BrowseRenderController(host, {
    appendProgressiveListMarkup: (list, html) => {
      list.innerHTML += html;
      return true;
    },
  });
  host._renderList = () => controller.renderList();

  const flushFrame = () => {
    const callbacks = frameCallbacks.splice(0);
    callbacks.forEach((callback) => callback());
  };

  try {
    controller.renderList();
    flushFrame();
    flushFrame();
    assert.equal(
      nodes.list.innerHTML.includes(
        'data-favorite="false">review-0</article>',
      ),
      true,
    );

    sourceEvents.set("event-0", {
      ...sourceEvents.get("event-0"),
      retain_indefinitely: true,
    });
    controller.renderList();

    assert.equal(
      nodes.list.innerHTML.includes(
        'data-favorite="true">review-0</article>',
      ),
      true,
    );

    sourceEvents.set("event-0", {
      ...sourceEvents.get("event-0"),
      retain_indefinitely: false,
    });
    controller.renderList();

    assert.equal(
      nodes.list.innerHTML.includes(
        'data-favorite="false">review-0</article>',
      ),
      true,
    );
  } finally {
    globalThis.requestAnimationFrame = previousAnimationFrame;
  }
});

test("cached Clips expansion appends small batches without rebuilding the list", () => {
  const { host, nodes, listWrites } = createHost();
  const frameCallbacks = [];
  const appendedBatches = [];
  const previousAnimationFrame = globalThis.requestAnimationFrame;
  globalThis.requestAnimationFrame = (callback) => {
    frameCallbacks.push(callback);
    return frameCallbacks.length;
  };
  const controller = new BrowseRenderController(host, {
    appendProgressiveListMarkup: (_list, html) => {
      appendedBatches.push(html);
      return true;
    },
  });
  host._tab = "clips";
  host._events = Array.from({ length: 31 }, (_, index) => ({
    id: `event-${index}`,
    start_time: 300 - index,
  }));
  host._renderList = () => controller.renderList();

  const flushFrame = () => {
    const callbacks = frameCallbacks.splice(0);
    callbacks.forEach((callback) => callback());
  };

  try {
    controller.renderList();
    assert.equal(listWrites(), 1);

    controller.renderList();
    assert.equal(listWrites(), 1);

    flushFrame();
    assert.equal(appendedBatches.length, 0);
    flushFrame();
    flushFrame();
    flushFrame();

    assert.equal(appendedBatches.length, 3);
    assert.equal(
      appendedBatches[0].match(/class="event"/g)?.length,
      12,
    );
    assert.equal(
      appendedBatches[1].match(/class="event"/g)?.length,
      12,
    );
    assert.equal(
      appendedBatches[2].match(/class="event"/g)?.length,
      1,
    );
    assert.match(appendedBatches[0], />event-6<\/article>/);
    assert.match(appendedBatches[2], />event-30<\/article>/);
    assert.equal(listWrites(), 1);

    controller.renderList();
    assert.equal(listWrites(), 1);
    assert.equal(appendedBatches.length, 3);
    assert.equal(nodes.list.innerHTML.includes(">event-5</article>"), true);
  } finally {
    globalThis.requestAnimationFrame = previousAnimationFrame;
  }
});

test("a replaced browse list receives a limited first paint again", () => {
  const { host, nodes } = createHost();
  const controller = new BrowseRenderController(host);
  const frameCallbacks = [];
  const previousAnimationFrame = globalThis.requestAnimationFrame;
  globalThis.requestAnimationFrame = (callback) => {
    frameCallbacks.push(callback);
    return frameCallbacks.length;
  };
  host._reviews = Array.from({ length: 12 }, (_, index) => ({
    id: `review-${index}`,
    start_time: 300 - index,
  }));
  host._renderList = () => controller.renderList();

  const flushFrame = () => {
    const callbacks = frameCallbacks.splice(0);
    callbacks.forEach((callback) => callback());
  };

  try {
    controller.renderList();
    flushFrame();
    flushFrame();
    assert.equal(nodes.list.innerHTML.includes(">review-11</article>"), true);

    let replacementHtml = "";
    const replacement = {
      ...nodes.list,
      get innerHTML() {
        return replacementHtml;
      },
      set innerHTML(value) {
        replacementHtml = value;
      },
    };
    host._pageShellRegionElement = (regionKey, selector) => {
      if (regionKey === "browse" && selector === "#list") return replacement;
      if (selector === "#browse-head-label") return nodes.browseLabel;
      if (selector === "#rec-day-prev") return nodes.previous;
      if (selector === "#rec-day-next") return nodes.next;
      if (selector === "#browse-return-top") return nodes.returnToTop;
      return null;
    };

    controller.renderList();
    assert.equal(replacementHtml.includes(">review-5</article>"), true);
    assert.equal(replacementHtml.includes(">review-6</article>"), false);
  } finally {
    globalThis.requestAnimationFrame = previousAnimationFrame;
  }
});

test("returning to a completed browse tab starts with its limited paint", () => {
  const { host, nodes } = createHost();
  const controller = new BrowseRenderController(host);
  const frameCallbacks = [];
  const previousAnimationFrame = globalThis.requestAnimationFrame;
  globalThis.requestAnimationFrame = (callback) => {
    frameCallbacks.push(callback);
    return frameCallbacks.length;
  };
  host._tab = "clips";
  host._events = Array.from({ length: 12 }, (_, index) => ({
    id: `event-${index}`,
    start_time: 300 - index,
  }));
  host._reviews = [{ id: "review-1", start_time: 400 }];
  host._renderList = () => controller.renderList();

  const flushFrame = () => {
    const callbacks = frameCallbacks.splice(0);
    callbacks.forEach((callback) => callback());
  };

  try {
    controller.renderList();
    flushFrame();
    flushFrame();
    assert.equal(nodes.list.innerHTML.includes(">event-11</article>"), true);

    host._tab = "alerts";
    controller.renderList();
    assert.equal(nodes.list.innerHTML.includes(">review-1</article>"), true);

    host._tab = "clips";
    controller.renderList();
    assert.equal(nodes.list.innerHTML.includes(">event-5</article>"), true);
    assert.equal(nodes.list.innerHTML.includes(">event-6</article>"), false);
  } finally {
    globalThis.requestAnimationFrame = previousAnimationFrame;
  }
});

test("completed Alerts rendering reuses unchanged row markup", () => {
  const { host, reviewRowRenders } = createHost();
  const controller = new BrowseRenderController(host);
  host._reviews = Array.from({ length: 3 }, (_, index) => ({
    id: `review-${index}`,
    start_time: 300 - index,
    severity: "alert",
  }));

  controller.renderList();
  assert.equal(reviewRowRenders(), 3);

  host._reviews = host._reviews.map((review) => ({ ...review }));
  controller.renderList();
  assert.equal(reviewRowRenders(), 3);

  host._reviews[1] = {
    ...host._reviews[1],
    severity: "detection",
  };
  controller.renderList();
  assert.equal(reviewRowRenders(), 4);
});

test("ongoing Alerts rows remain dynamic instead of using cached markup", () => {
  const { host, reviewRowRenders } = createHost();
  const controller = new BrowseRenderController(host);
  host._findEventById = () => ({
    id: "event-live",
    start_time: 100,
    end_time: null,
  });
  host._reviews = [
    {
      id: "review-live",
      start_time: 100,
      end_time: null,
      severity: "alert",
      data: { detections: ["event-live"] },
    },
  ];

  controller.renderList();
  host._reviews = host._reviews.map((review) => ({ ...review }));
  controller.renderList();

  assert.equal(reviewRowRenders(), 2);
});

test("pending Alerts expansion cannot repaint a different camera context", () => {
  const { host, nodes, listWrites } = createHost();
  const controller = new BrowseRenderController(host);
  const frameCallbacks = [];
  const previousAnimationFrame = globalThis.requestAnimationFrame;
  globalThis.requestAnimationFrame = (callback) => {
    frameCallbacks.push(callback);
    return frameCallbacks.length;
  };
  host._reviews = Array.from({ length: 12 }, (_, index) => ({
    id: `front-${index}`,
    start_time: 300 - index,
  }));
  host._renderList = () => controller.renderList();

  const flushFrame = () => {
    const callbacks = frameCallbacks.splice(0);
    callbacks.forEach((callback) => callback());
  };

  try {
    controller.renderList();
    assert.equal(nodes.list.innerHTML.includes(">front-6</article>"), false);

    host._activeCam = {
      entity: "camera.rear",
      name: "Rear",
      alerts_content: "all_reviews",
    };
    host._reviews = Array.from({ length: 12 }, (_, index) => ({
      id: `rear-${index}`,
      start_time: 200 - index,
    }));
    controller.renderList();
    assert.equal(nodes.list.innerHTML.includes(">rear-5</article>"), true);
    assert.equal(nodes.list.innerHTML.includes(">rear-6</article>"), false);
    assert.equal(listWrites(), 2);

    flushFrame();
    flushFrame();
    assert.equal(nodes.list.innerHTML.includes(">front-6</article>"), false);
    assert.equal(nodes.list.innerHTML.includes(">rear-11</article>"), true);
    assert.equal(listWrites(), 3);
  } finally {
    globalThis.requestAnimationFrame = previousAnimationFrame;
  }
});

test("browse render controller preserves an active recording viewer", () => {
  const { host, nodes, listWrites } = createHost();
  const controller = new BrowseRenderController(host);
  host._tab = "recordings";
  host._recordings = [{ id: 4 }];
  host._popupLifecycleController.playing = () => ({ rec: { id: 4 } });
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
  assert.equal(nodes.returnToTop.hidden, true);
  assert.equal(liveRegionAccesses, 0);
});
