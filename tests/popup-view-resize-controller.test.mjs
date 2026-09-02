import assert from "node:assert/strict";
import { test } from "node:test";

import {
  PopupViewResizeController,
  placePopupViewResizeGrip,
  resolvePopupViewAvailableMaxHeight,
  resolvePopupViewRenderedMaxHeightRatio,
  resolvePopupViewResizeBounds,
  resolvePopupViewResizeZoomScale,
} from "../src/features/popup/view-resize.ctrl.js";
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
      pointerType: "touch",
      button: 0,
      clientY: 0,
      key: "",
      preventDefault() {},
      stopPropagation() {},
      ...init,
    };
    for (const listener of this.listeners.get(type) || []) listener(event);
  }
}

const createClassList = () => {
  const values = new Set();
  return {
    values,
    add: (...names) => names.forEach((name) => values.add(name)),
    remove: (...names) => names.forEach((name) => values.delete(name)),
    toggle: (name, force) => {
      if (force) values.add(name);
      else values.delete(name);
    },
  };
};

const createFixture = ({
  width = 1920,
  height = 1080,
  tagName = "VIDEO",
  viewerMaxHeight = 0,
  availableMaxHeight = 0,
} = {}) => {
  const viewer = {
    clientWidth: 400,
    classList: createClassList(),
    style: new FakeStyle(),
    getBoundingClientRect: () => ({ left: 0, top: 0, width: 400, height: 225 }),
  };
  const controls = { style: new FakeStyle() };
  const media = new FakeTarget();
  media.tagName = tagName;
  if (tagName === "VIDEO") {
    media.videoWidth = width;
    media.videoHeight = height;
  } else {
    media.naturalWidth = width;
    media.naturalHeight = height;
  }
  const grip = new FakeTarget();
  grip.hidden = true;
  grip.attributes = new Map();
  grip.setAttribute = (name, value) =>
    grip.attributes.set(name, String(value));
  grip.setPointerCapture = () => {};
  grip.releasePointerCapture = () => {};
  grip.remove = () => {};
  const zoomCalls = [];
  const zoomController = {
    zoomToCenter: (...args) => zoomCalls.push(args),
  };
  const controller = new PopupViewResizeController({
    viewer,
    media,
    grip,
    controls,
    zoomController,
    getAvailableMaxHeight: () => availableMaxHeight,
    getComputedStyle: () =>
      viewerMaxHeight ? { maxHeight: `${viewerMaxHeight}px` } : null,
  }).bind();

  return { controller, controls, grip, media, viewer, zoomCalls };
};

test("popup resize bounds use the initial render as the minimum", () => {
  const landscape = resolvePopupViewResizeBounds({
    mediaWidth: 1920,
    mediaHeight: 1080,
  });
  const standard = resolvePopupViewResizeBounds({
    mediaWidth: 640,
    mediaHeight: 480,
  });
  const nearWide = resolvePopupViewResizeBounds({
    mediaWidth: 1500,
    mediaHeight: 1000,
  });
  const portrait = resolvePopupViewResizeBounds({
    mediaWidth: 1080,
    mediaHeight: 1920,
  });

  assert.equal(landscape.minHeightRatio, 9 / 16);
  assert.equal(landscape.maxHeightRatio, 27 / 32);
  assert.equal(standard.minHeightRatio, 3 / 4);
  assert.equal(standard.maxHeightRatio, 3 / 4);
  assert.equal(standard.eligible, false);
  assert.equal(nearWide.maxHeightRatio, 1);
  assert.equal(nearWide.eligible, true);
  assert.equal(portrait.minHeightRatio, 3 / 4);
  assert.equal(portrait.maxHeightRatio, 16 / 9);
  assert.equal(portrait.initialHeightCapped, true);
  assert.equal(portrait.eligible, true);
});

test("popup resize stops at the rendered height ceiling without narrowing", () => {
  assert.equal(
    resolvePopupViewRenderedMaxHeightRatio({
      containerWidth: 400,
      maxHeight: 340,
      minHeightRatio: 3 / 4,
      maxHeightRatio: 16 / 9,
    }),
    0.85,
  );

  const fixture = createFixture({
    width: 1080,
    height: 1920,
    viewerMaxHeight: 340,
  });
  fixture.grip.dispatch("pointerdown", { clientY: 100 });
  fixture.grip.dispatch("pointermove", { clientY: 900 });
  fixture.grip.dispatch("pointerup", { clientY: 900 });

  assert.equal(
    fixture.viewer.style.getPropertyValue("--popup-media-aspect-ratio"),
    "1.176471 / 1",
  );
  assert.equal(
    fixture.viewer.style.getPropertyValue("--popup-media-max-width"),
    "82.353dvh",
  );
  assert.equal(fixture.grip.attributes.get("aria-valuemax"), "85");
});

test("popup resize can reserve the visible metadata title bar", () => {
  assert.equal(
    resolvePopupViewAvailableMaxHeight({
      viewerHeight: 225,
      containerBottom: 640,
      keepVisibleBottom: 565,
    }),
    300,
  );

  const fixture = createFixture({
    width: 1080,
    height: 1920,
    viewerMaxHeight: 340,
    availableMaxHeight: 300,
  });
  fixture.grip.dispatch("pointerdown", { clientY: 100 });
  fixture.grip.dispatch("pointermove", { clientY: 900 });
  fixture.grip.dispatch("pointerup", { clientY: 900 });

  assert.equal(
    fixture.viewer.style.getPropertyValue("--popup-media-aspect-ratio"),
    "1.333333 / 1",
  );
  assert.equal(fixture.grip.attributes.get("aria-valuemax"), "75");
});

test("16:9 popup video grows toward square without calculated base zoom", () => {
  const fixture = createFixture();

  assert.equal(fixture.grip.hidden, false);
  assert.equal(
    fixture.viewer.style.getPropertyValue("--popup-media-aspect-ratio"),
    "1.777778 / 1",
  );
  fixture.grip.dispatch("pointerdown", { clientY: 100 });
  fixture.grip.dispatch("pointermove", { clientY: 500 });
  fixture.grip.dispatch("pointerup", { clientY: 500 });

  assert.equal(
    fixture.viewer.style.getPropertyValue("--popup-media-aspect-ratio"),
    "1.185185 / 1",
  );
  assert.equal(
    fixture.controls.style.getPropertyValue("--popup-media-max-width"),
    "82.963dvh",
  );
  assert.equal(
    fixture.viewer.classList.values.has("popup-media-resized"),
    true,
  );
  assert.equal(fixture.zoomCalls.at(-1)[0], 1);
});

test("popup handle cannot drag upward past the initial render", () => {
  const fixture = createFixture();

  fixture.grip.dispatch("pointerdown", { clientY: 100 });
  fixture.grip.dispatch("pointermove", { clientY: 300 });
  fixture.grip.dispatch("pointerup", { clientY: 300 });
  fixture.grip.dispatch("pointerdown", { clientY: 100 });
  fixture.grip.dispatch("pointermove", { clientY: -500 });
  fixture.grip.dispatch("pointerup", { clientY: -500 });

  assert.equal(
    fixture.viewer.style.getPropertyValue("--popup-media-aspect-ratio"),
    "1.777778 / 1",
  );
  assert.equal(fixture.zoomCalls.at(-1)[0], 1);
});

test("popup snapshots resize without calculated base zoom", () => {
  const fixture = createFixture({ tagName: "IMG" });

  fixture.grip.dispatch("pointerdown", { clientY: 100 });
  fixture.grip.dispatch("pointermove", { clientY: 500 });
  fixture.grip.dispatch("pointerup", { clientY: 500 });

  assert.equal(fixture.grip.hidden, false);
  assert.equal(fixture.zoomCalls.at(-1)[0], 1);
  assert.equal(
    resolvePopupViewResizeZoomScale({
      heightRatio: 27 / 32,
      naturalHeightRatio: 9 / 16,
    }),
    1,
  );
});

test("popup media keeps native cover fit before and during resize", () => {
  assert.equal(
    STYLES.includes(
      ".viewer.popup-media-ratio-ready video,.viewer.popup-media-ratio-ready img.snap{object-fit:cover;}",
    ),
    true,
  );
  assert.equal(
    STYLES.includes(
      ".viewer.popup-media-resized video,.viewer.popup-media-resized img.snap{object-fit:cover !important;}",
    ),
    true,
  );
});

test("ultra-tall popup media starts at 4:3 and can still be pulled down", () => {
  const fixture = createFixture({ width: 1080, height: 1920 });

  assert.equal(fixture.grip.hidden, false);
  assert.equal(
    fixture.viewer.style.getPropertyValue("--popup-media-aspect-ratio"),
    "1.333333 / 1",
  );
  assert.equal(
    fixture.viewer.classList.values.has("popup-media-height-capped"),
    true,
  );

  fixture.grip.dispatch("pointerdown", { clientY: 100 });
  fixture.grip.dispatch("pointermove", { clientY: 900 });
  fixture.grip.dispatch("pointerup", { clientY: 900 });

  assert.equal(
    fixture.viewer.style.getPropertyValue("--popup-media-aspect-ratio"),
    "0.562500 / 1",
  );
  assert.equal(
    fixture.viewer.classList.values.has("popup-media-resized"),
    true,
  );
  assert.equal(fixture.zoomCalls.at(-1)[0], 1);
});

test("height-capped popup media uses contain without changing the wide cover path", () => {
  assert.equal(
    STYLES.includes(
      ".viewer.popup-media-height-capped video,.viewer.popup-media-height-capped img.snap{object-fit:contain !important;}",
    ),
    true,
  );
});

test("desktop video uses the metadata handle while mobile video and snapshots stay on-media", () => {
  const viewer = {
    appended: [],
    appendChild(node) {
      this.appended.push(node);
    },
  };
  const metadataHost = {
    appended: [],
    appendChild(node) {
      this.appended.push(node);
    },
  };
  const grip = { classList: createClassList() };
  const video = { tagName: "VIDEO" };

  assert.equal(
    placePopupViewResizeGrip({
      viewer,
      media: video,
      grip,
      metadataHost,
    }),
    "metadata",
  );
  assert.equal(metadataHost.appended.at(-1), grip);
  assert.equal(
    grip.classList.values.has("popup-view-resize-grip--metadata"),
    true,
  );

  assert.equal(
    placePopupViewResizeGrip({
      viewer,
      media: video,
      grip,
      metadataHost,
      mobileTablet: true,
    }),
    "media",
  );
  assert.equal(viewer.appended.at(-1), grip);
  assert.equal(
    grip.classList.values.has("popup-view-resize-grip--metadata"),
    false,
  );

  assert.equal(
    placePopupViewResizeGrip({
      viewer,
      media: { tagName: "IMG" },
      grip,
      metadataHost,
    }),
    "media",
  );
});
