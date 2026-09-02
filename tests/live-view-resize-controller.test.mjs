import { test } from "node:test";
import assert from "node:assert/strict";

import {
  LIVE_VIEW_MIN_HEIGHT_RATIO,
  LIVE_VIEW_NEAR_WIDE_HEIGHT_RATIO,
  LIVE_VIEW_WIDE_MAX_HEIGHT_RATIO,
  LiveViewResizeController,
  resolveLiveViewResizeBounds,
  resolveLiveViewResizeZoomScale,
} from "../src/features/live/live-view-resize.ctrl.js";
import { buildLiveEngineWrapMarkup } from "../src/features/live/view.tmpl.js";
import { STYLES } from "../src/styles.js";

class FakeStyle {
  constructor() {
    this.values = new Map();
  }

  setProperty(name, value) {
    this.values.set(name, String(value));
  }

  getPropertyValue(name) {
    return this.values.get(name) || "";
  }

  removeProperty(name) {
    this.values.delete(name);
  }
}

class FakeTarget {
  constructor() {
    this.listeners = new Map();
  }

  addEventListener(type, listener, options = {}) {
    if (!this.listeners.has(type)) this.listeners.set(type, new Set());
    this.listeners.get(type).add(listener);
    options.signal?.addEventListener(
      "abort",
      () => this.listeners.get(type)?.delete(listener),
      { once: true },
    );
  }

  dispatch(type, init = {}) {
    const event = {
      type,
      pointerId: 1,
      pointerType: "mouse",
      button: 0,
      clientY: 0,
      key: "",
      defaultPrevented: false,
      propagationStopped: false,
      preventDefault() {
        this.defaultPrevented = true;
      },
      stopPropagation() {
        this.propagationStopped = true;
      },
      ...init,
    };
    for (const listener of this.listeners.get(type) || []) listener(event);
    return event;
  }
}

const createFixture = ({
  videoWidth = 1024,
  videoHeight = 768,
  availableGrowth = null,
} = {}) => {
  const classes = new Set();
  const attributes = new Map();
  const grip = new FakeTarget();
  grip.hidden = true;
  grip.setPointerCapture = () => {};
  grip.releasePointerCapture = () => {};
  grip.setAttribute = (name, value) => attributes.set(name, String(value));

  const wrap = {
    clientWidth: 400,
    style: new FakeStyle(),
    classList: {
      add: (...tokens) => tokens.forEach((token) => classes.add(token)),
      remove: (...tokens) => tokens.forEach((token) => classes.delete(token)),
    },
    getBoundingClientRect: () => ({ width: 400, height: 225 }),
    querySelector: (selector) =>
      selector === "#live-resize-grip" ? grip : null,
  };
  const video = new FakeTarget();
  video.videoWidth = videoWidth;
  video.videoHeight = videoHeight;
  let eligibleContext = true;
  let interactionCount = 0;
  const zoomScales = [];
  const controller = new LiveViewResizeController({
    getLiveWrap: () => wrap,
    isContextEligible: () => eligibleContext,
    onInteractionStart: () => {
      interactionCount += 1;
    },
    onZoomScaleChange: (scale) => zoomScales.push(scale),
    getAvailableGrowth: () => availableGrowth,
  });
  controller.bind();
  controller.attachMedia(video);

  return {
    attributes,
    classes,
    controller,
    getInteractionCount: () => interactionCount,
    grip,
    setEligibleContext: (value) => {
      eligibleContext = value;
    },
    video,
    wrap,
    zoomScales,
  };
};

test("resize bounds preserve natural and portrait stop rules", () => {
  const wide = resolveLiveViewResizeBounds({
    containerWidth: 400,
    videoWidth: 1920,
    videoHeight: 1080,
  });
  const standard = resolveLiveViewResizeBounds({
    containerWidth: 400,
    videoWidth: 640,
    videoHeight: 480,
  });
  const nearWide = resolveLiveViewResizeBounds({
    containerWidth: 400,
    videoWidth: 1500,
    videoHeight: 1000,
  });
  const portrait = resolveLiveViewResizeBounds({
    containerWidth: 400,
    videoWidth: 720,
    videoHeight: 1280,
  });

  assert.equal(wide.eligible, true);
  assert.equal(wide.maxHeightRatio, 27 / 32);
  assert.equal(LIVE_VIEW_WIDE_MAX_HEIGHT_RATIO, 27 / 32);
  assert.equal(LIVE_VIEW_NEAR_WIDE_HEIGHT_RATIO, 2 / 3);
  assert.equal(nearWide.maxHeightRatio, 27 / 32);
  assert.equal(standard.eligible, true);
  assert.equal(standard.maxHeightRatio, 0.75);
  assert.equal(portrait.eligible, true);
  assert.equal(portrait.maxHeightRatio, 1);
});

test("pointer drag stops a 4:3 live view when its edges reach the viewport", () => {
  const fixture = createFixture();

  assert.equal(fixture.grip.hidden, false);
  assert.equal(fixture.classes.has("live-resize-eligible"), true);
  assert.equal(
    fixture.wrap.style.getPropertyValue("--live-view-aspect-ratio"),
    "1.777778 / 1",
  );

  fixture.grip.dispatch("pointerdown", { clientY: 100 });
  const move = fixture.grip.dispatch("pointermove", { clientY: 500 });
  fixture.grip.dispatch("pointerup", { clientY: 500 });

  assert.equal(move.defaultPrevented, true);
  assert.equal(move.propagationStopped, true);
  assert.equal(fixture.getInteractionCount(), 1);
  assert.equal(
    fixture.wrap.style.getPropertyValue("--live-view-aspect-ratio"),
    "1.333333 / 1",
  );
  assert.equal(fixture.attributes.get("aria-valuemax"), "75");
  assert.equal(fixture.attributes.get("aria-valuenow"), "75");
  assert.equal(fixture.zoomScales.at(-1), 1);
});

test("16:9 live view exposes the handle and turns downward drag into zoom", () => {
  const fixture = createFixture({ videoWidth: 1920, videoHeight: 1080 });

  assert.equal(fixture.grip.hidden, false);
  fixture.grip.dispatch("pointerdown", { clientY: 100 });
  fixture.grip.dispatch("pointermove", { clientY: 500 });
  fixture.grip.dispatch("pointerup", { clientY: 500 });

  assert.equal(
    fixture.wrap.style.getPropertyValue("--live-view-aspect-ratio"),
    "1.185185 / 1",
  );
  assert.equal(fixture.zoomScales.at(-1), 1.5);
  assert.equal(
    resolveLiveViewResizeZoomScale({
      heightRatio: 9 / 16,
      naturalHeightRatio: 9 / 16,
    }),
    1,
  );
});

test("wider-than-16:9 live zoom grows smoothly and fills at its range limit", () => {
  assert.equal(
    resolveLiveViewResizeZoomScale({
      heightRatio: 9 / 16,
      naturalHeightRatio: 1 / 2,
      maxHeightRatio: 27 / 32,
    }),
    1,
  );
  assert.equal(
    resolveLiveViewResizeZoomScale({
      heightRatio: 27 / 32,
      naturalHeightRatio: 1 / 2,
      maxHeightRatio: 27 / 32,
    }),
    27 / 16,
  );
});

test("portrait live view remains capped at the width and resets transient height", () => {
  const fixture = createFixture({ videoWidth: 720, videoHeight: 1280 });

  fixture.grip.dispatch("pointerdown", {
    pointerId: 8,
    pointerType: "touch",
    clientY: 100,
  });
  fixture.grip.dispatch("pointermove", {
    pointerId: 8,
    pointerType: "touch",
    clientY: 900,
  });
  fixture.grip.dispatch("pointerup", {
    pointerId: 8,
    pointerType: "touch",
    clientY: 900,
  });

  assert.equal(
    fixture.wrap.style.getPropertyValue("--live-view-aspect-ratio"),
    "1.000000 / 1",
  );
  fixture.controller.reset();
  assert.equal(
    fixture.wrap.style.getPropertyValue("--live-view-aspect-ratio"),
    "1.777778 / 1",
  );
  assert.equal(fixture.attributes.get("aria-valuenow"), "56");
  assert.equal(fixture.zoomScales.at(-1), 1);
  assert.equal(LIVE_VIEW_MIN_HEIGHT_RATIO, 9 / 16);
});

test("live drag stops before flexible content can collapse the footer", () => {
  const fixture = createFixture({
    videoWidth: 720,
    videoHeight: 1280,
    availableGrowth: 80,
  });

  fixture.grip.dispatch("pointerdown", { clientY: 100 });
  fixture.grip.dispatch("pointermove", { clientY: 900 });
  fixture.grip.dispatch("pointerup", { clientY: 900 });

  assert.equal(
    fixture.wrap.style.getPropertyValue("--live-view-aspect-ratio"),
    `${(1 / (9 / 16 + 80 / 400)).toFixed(6)} / 1`,
  );
  assert.equal(fixture.attributes.get("aria-valuemax"), "76");
  assert.equal(fixture.attributes.get("aria-valuenow"), "76");
});

test("resize grip hides outside an eligible live context", () => {
  const fixture = createFixture();
  fixture.setEligibleContext(false);
  fixture.controller.sync();

  assert.equal(fixture.grip.hidden, true);
  assert.equal(fixture.classes.has("live-resize-eligible"), false);
  assert.equal(
    fixture.wrap.style.getPropertyValue("--live-view-aspect-ratio"),
    "",
  );
});

test("live markup and styles provide one unobtrusive unified resize grip", () => {
  const markup = buildLiveEngineWrapMarkup({
    icons: { live: "LIVE", chevron: "CHEVRON" },
  });

  assert.match(markup, /id="live-resize-grip"/);
  assert.match(markup, /role="slider"/);
  assert.match(markup, /CHEVRON/);
  assert.match(STYLES, /touch-action:none/);
  assert.match(STYLES, /#eng-wrap\.live-resize-eligible/);
  assert.match(STYLES, /#live-stage:fullscreen \.live-resize-grip/);
  assert.match(
    STYLES,
    /\.live-resize-grip\{[^}]*width:224px;height:44px;/,
  );
  assert.match(
    STYLES,
    /\.live-resize-grip::before\{[^}]*width:128px;height:12px;/,
  );
  const gripDecoration =
    STYLES.match(/\.live-resize-grip::before\{[^}]*\}/)?.[0] || "";
  assert.doesNotMatch(gripDecoration, /backdrop-filter/);
  assert.match(
    STYLES,
    /\.live-resize-grip svg\{[^}]*width:14px;height:14px;/,
  );
});
