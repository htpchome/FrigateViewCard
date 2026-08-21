import test from "node:test";
import assert from "node:assert/strict";

import { PopupCarouselController } from "../src/features/popup/carousel.ctrl.js";

test("popup carousel controller owns rendering, navigation, swipe, and cleanup", () => {
  const classes = new Map();
  const cssValues = new Map();
  const calls = [];
  const frames = [];
  const item = {
    getBoundingClientRect: () => ({ width: 140, height: 96 }),
  };
  const activeItem = { offsetLeft: 300 };
  const row = {
    innerHTML: "",
    scrollLeft: 0,
    scrollWidth: 600,
    clientWidth: 300,
    onscroll: null,
    querySelector: (selector) =>
      selector === ".popup-carousel-item.active" ? activeItem : item,
    scrollBy: (plan) => calls.push(["scrollBy", plan]),
  };
  const wrap = {
    hidden: true,
    classList: {
      toggle: (token, enabled) => classes.set(token, enabled),
    },
    style: {
      setProperty: (name, value) => cssValues.set(name, value),
    },
  };
  const leftButton = { hidden: false };
  const rightButton = { hidden: true };
  class FakeResizeObserver {
    constructor(callback) {
      this.callback = callback;
      calls.push(["resizeCreated"]);
    }

    observe(target) {
      calls.push(["resizeObserve", target]);
    }

    disconnect() {
      calls.push(["resizeDisconnect"]);
    }
  }
  const swipe = {
    bind() {
      calls.push(["swipeBind"]);
      return this;
    },
    dispose() {
      calls.push(["swipeDispose"]);
    },
  };
  const elements = new Map([
    ["#popup-carousel-wrap", wrap],
    ["#popup-carousel", row],
    ["#popup-carousel-left", leftButton],
    ["#popup-carousel-right", rightButton],
  ]);
  const controller = new PopupCarouselController({
    query: (selector) => elements.get(selector) || null,
    getDisplayEvents: () => [
      {
        id: "older",
        label: "person",
        start_time: 10,
        has_clip: true,
      },
      {
        id: "active",
        label: "car",
        start_time: 20,
        has_clip: true,
      },
    ],
    mediaUrl: (id, file) => `/media/${id}/${file}`,
    formatDateTime: (timestamp) => `date:${timestamp}`,
    formatTime: (timestamp) => `time:${timestamp}`,
    isTouchUi: () => true,
    isMobileDevice: () => true,
    resizeObserverCtor: FakeResizeObserver,
    requestFrame: (callback) => frames.push(callback),
    createSwipeController: () => swipe,
  });

  const plan = controller.render("clip", "active");

  assert.equal(plan.shouldRender, true);
  assert.equal(wrap.hidden, false);
  assert.equal(classes.get("touch"), true);
  assert.equal(classes.get("mobile-device"), true);
  assert.match(row.innerHTML, /data-ev="active"/);
  assert.match(row.innerHTML, /class="popup-carousel-item active"/);
  assert.match(row.innerHTML, /\/media\/active\/thumbnail.jpg/);
  assert.equal(typeof row.onscroll, "function");
  assert.equal(leftButton.hidden, true);
  assert.equal(rightButton.hidden, false);
  assert.equal(cssValues.get("--popup-carousel-item-height"), "96px");
  assert.equal(frames.length, 1);

  frames.shift()();
  assert.equal(row.scrollLeft, 292);
  assert.equal(leftButton.hidden, false);
  assert.equal(rightButton.hidden, false);

  controller.scroll(1);
  assert.deepEqual(calls.at(-1), [
    "scrollBy",
    { left: 296, behavior: "smooth" },
  ]);

  controller.clear();
  assert.equal(wrap.hidden, true);
  assert.equal(row.innerHTML, "");
  assert.equal(row.onscroll, null);
  assert.equal(
    calls.some(([type]) => type === "resizeDisconnect"),
    true,
  );
  assert.equal(
    calls.some(([type]) => type === "swipeDispose"),
    true,
  );
});

test("popup carousel controller hides unsupported media without binding", () => {
  const row = { innerHTML: "existing", onscroll: () => {} };
  const wrap = { hidden: false };
  const elements = new Map([
    ["#popup-carousel-wrap", wrap],
    ["#popup-carousel", row],
  ]);
  const controller = new PopupCarouselController({
    query: (selector) => elements.get(selector) || null,
  });

  const plan = controller.render("recording");

  assert.equal(plan.shouldRender, false);
  assert.equal(wrap.hidden, true);
  assert.equal(row.innerHTML, "");
  assert.equal(row.onscroll, null);
});
