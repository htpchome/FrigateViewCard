import { test } from "node:test";
import assert from "node:assert/strict";

import {
  VIDEO_ZOOM_MAX,
  VideoZoomController,
  clampVideoPan,
  clampVideoZoom,
  zoomVideoAroundPoint,
} from "../src/shared/media/video-zoom.ctrl.js";

class FakeStyle {
  constructor() {
    this._values = new Map();
    this._priorities = new Map();
  }

  setProperty(name, value, priority = "") {
    this._values.set(name, String(value));
    this._priorities.set(name, String(priority));
  }

  getPropertyValue(name) {
    return this._values.get(name) || "";
  }

  getPropertyPriority(name) {
    return this._priorities.get(name) || "";
  }

  removeProperty(name) {
    this._values.delete(name);
    this._priorities.delete(name);
  }
}

class FakeTarget {
  constructor() {
    this._listeners = new Map();
  }

  addEventListener(type, listener, options = {}) {
    if (!this._listeners.has(type)) this._listeners.set(type, new Set());
    this._listeners.get(type).add(listener);
    options?.signal?.addEventListener?.(
      "abort",
      () => this._listeners.get(type)?.delete(listener),
      { once: true },
    );
  }

  dispatch(type, init = {}) {
    const event = {
      type,
      pointerId: 0,
      pointerType: "mouse",
      button: 0,
      clientX: 150,
      clientY: 100,
      deltaY: 0,
      defaultPrevented: false,
      preventDefault() {
        this.defaultPrevented = true;
      },
      ...init,
    };
    for (const listener of this._listeners.get(type) || []) {
      listener(event);
    }
    return event;
  }
}

function createZoomFixture() {
  const host = {
    style: new FakeStyle(),
    clientWidth: 300,
    clientHeight: 200,
    getBoundingClientRect: () => ({
      left: 0,
      top: 0,
      width: 300,
      height: 200,
    }),
  };
  const video = new FakeTarget();
  video.style = new FakeStyle();
  video.parentElement = host;
  video.offsetWidth = 300;
  video.offsetHeight = 200;
  video.classList = {
    tokens: new Set(),
    toggle(token, enabled) {
      if (enabled) this.tokens.add(token);
      else this.tokens.delete(token);
    },
  };
  video.setPointerCapture = () => {};
  video.releasePointerCapture = () => {};

  const controller = new VideoZoomController(video).bind();
  return { controller, host, video };
}

function touchEvent(pointerId, clientX, clientY, extra = {}) {
  return {
    pointerId,
    pointerType: "touch",
    clientX,
    clientY,
    ...extra,
  };
}

test("video zoom math clamps scale and pan to the default viewport", () => {
  assert.equal(clampVideoZoom(0.25), 1);
  assert.equal(clampVideoZoom(9), 3);
  assert.deepEqual(
    clampVideoPan({
      x: 100,
      y: -999,
      scale: 2,
      width: 300,
      height: 200,
    }),
    { x: 0, y: -200 },
  );
  assert.deepEqual(
    zoomVideoAroundPoint({
      currentScale: 2,
      nextScale: 0.5,
      x: -100,
      y: -50,
      focalX: 150,
      focalY: 100,
      width: 300,
      height: 200,
    }),
    { scale: 1, x: 0, y: 0 },
  );
});

test("wheel zoom is pointer-focused, capped at 3x, and releases outward page scroll at 1x", () => {
  const { controller, video } = createZoomFixture();

  const inward = video.dispatch("wheel", { deltaY: -100 });
  assert.equal(inward.defaultPrevented, true);
  assert.equal(controller.state.scale, 1.2);
  assert.deepEqual(controller.state, { scale: 1.2, x: -30, y: -20 });

  for (let i = 0; i < 20; i++) {
    video.dispatch("wheel", { deltaY: -100 });
  }
  assert.equal(controller.state.scale, VIDEO_ZOOM_MAX);

  for (let i = 0; i < 20; i++) {
    video.dispatch("wheel", { deltaY: 100 });
  }
  assert.deepEqual(controller.state, { scale: 1, x: 0, y: 0 });

  const outward = video.dispatch("wheel", { deltaY: 100 });
  assert.equal(outward.defaultPrevented, false);
  assert.deepEqual(controller.state, { scale: 1, x: 0, y: 0 });
});

test("double click toggles between pointer-focused 2x and the default state", () => {
  const { controller, video } = createZoomFixture();

  video.dispatch("dblclick", { clientX: 75, clientY: 50 });
  assert.equal(controller.state.scale, 2);
  assert.deepEqual(controller.state, { scale: 2, x: -75, y: -50 });
  assert.equal(video.style.getPropertyValue("cursor"), "grab");

  video.dispatch("dblclick", { clientX: 75, clientY: 50 });
  assert.deepEqual(controller.state, { scale: 1, x: 0, y: 0 });
  assert.equal(video.style.getPropertyValue("cursor"), "zoom-in");
});

test("mouse drag pans only while zoomed and remains inside the visible edges", () => {
  const { controller, video } = createZoomFixture();
  video.dispatch("dblclick");

  video.dispatch("pointerdown", {
    pointerId: 1,
    clientX: 150,
    clientY: 100,
  });
  assert.equal(video.style.getPropertyValue("cursor"), "grabbing");

  video.dispatch("pointermove", {
    pointerId: 1,
    clientX: 600,
    clientY: 500,
  });
  assert.deepEqual(controller.state, { scale: 2, x: 0, y: 0 });

  video.dispatch("pointermove", {
    pointerId: 1,
    clientX: -600,
    clientY: -500,
  });
  assert.deepEqual(controller.state, { scale: 2, x: -300, y: -200 });

  video.dispatch("pointerup", {
    pointerId: 1,
    clientX: -600,
    clientY: -500,
  });
  assert.equal(video.style.getPropertyValue("cursor"), "grab");
});

test("touch double tap toggles 2x and pinch zoom is capped at 3x", () => {
  const { controller, video } = createZoomFixture();

  video.dispatch("pointerdown", touchEvent(1, 120, 80));
  video.dispatch("pointerup", touchEvent(1, 120, 80));
  video.dispatch("pointerdown", touchEvent(1, 120, 80));
  video.dispatch("pointerup", touchEvent(1, 120, 80));
  assert.equal(controller.state.scale, 2);

  controller.reset();
  video.dispatch("pointerdown", touchEvent(1, 100, 100));
  video.dispatch("pointerdown", touchEvent(2, 200, 100));
  const pinchMove = video.dispatch(
    "pointermove",
    touchEvent(2, 500, 100),
  );
  assert.equal(pinchMove.defaultPrevented, true);
  assert.equal(controller.state.scale, 3);

  video.dispatch("pointerup", touchEvent(2, 500, 100));
  video.dispatch("pointerup", touchEvent(1, 100, 100));
  assert.equal(controller.state.scale, 3);
});

test("source changes reset zoom while disposal restores prior styles", () => {
  const { controller, host, video } = createZoomFixture();
  video.dispatch("dblclick");
  assert.equal(controller.state.scale, 2);

  video.dispatch("loadstart");
  assert.deepEqual(controller.state, { scale: 1, x: 0, y: 0 });

  controller.dispose();
  assert.equal(video.style.getPropertyValue("transform"), "");
  assert.equal(video.style.getPropertyValue("cursor"), "");
  assert.equal(video.style.getPropertyValue("touch-action"), "");
  assert.equal(host.style.getPropertyValue("overflow"), "");
});
