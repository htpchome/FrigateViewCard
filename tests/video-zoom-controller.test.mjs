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

function createZoomFixture({
  videoFrameCallbacks = false,
  separateInteractionTarget = false,
  videoWidth = 0,
  videoHeight = 0,
  hostWidth = 300,
  hostHeight = 200,
  nativeCoverPan = false,
  objectFit = "",
} = {}) {
  const host = {
    style: new FakeStyle(),
    clientWidth: hostWidth,
    clientHeight: hostHeight,
    getBoundingClientRect: () => ({
      left: 0,
      top: 0,
      width: hostWidth,
      height: hostHeight,
    }),
  };
  const video = new FakeTarget();
  video.style = new FakeStyle();
  video.parentElement = host;
  video.offsetWidth = hostWidth;
  video.offsetHeight = hostHeight;
  video.videoWidth = videoWidth;
  video.videoHeight = videoHeight;
  if (objectFit) video.style.setProperty("object-fit", objectFit);
  video.classList = {
    tokens: new Set(),
    toggle(token, enabled) {
      if (enabled) this.tokens.add(token);
      else this.tokens.delete(token);
    },
  };
  video.setPointerCapture = () => {};
  video.releasePointerCapture = () => {};
  const interactionTarget = separateInteractionTarget
    ? new FakeTarget()
    : video;
  interactionTarget.capturedPointers = [];
  interactionTarget.releasedPointers = [];
  interactionTarget.setPointerCapture = (pointerId) => {
    interactionTarget.capturedPointers.push(pointerId);
  };
  interactionTarget.releasePointerCapture = (pointerId) => {
    interactionTarget.releasedPointers.push(pointerId);
  };
  if (videoFrameCallbacks) {
    video._nextVideoFrameCallbackId = 1;
    video._videoFrameCallbacks = new Map();
    video.requestVideoFrameCallback = (callback) => {
      const id = video._nextVideoFrameCallbackId++;
      video._videoFrameCallbacks.set(id, callback);
      return id;
    };
    video.cancelVideoFrameCallback = (id) => {
      video._videoFrameCallbacks.delete(id);
    };
    video.runNextVideoFrameCallback = () => {
      const entry = video._videoFrameCallbacks.entries().next().value;
      if (!entry) return false;
      const [id, callback] = entry;
      video._videoFrameCallbacks.delete(id);
      callback(0, {});
      return true;
    };
  }

  const controller = new VideoZoomController(video, {
    interactionTarget,
    nativeCoverPan,
  }).bind();
  return { controller, host, interactionTarget, video };
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

test("video zoom exposes the current capture viewport", () => {
  const { controller } = createZoomFixture();

  assert.deepEqual(controller.viewport, {
    left: 0,
    top: 0,
    width: 300,
    height: 200,
  });
});

test("resize zoom remains absolutely centered as the viewport grows", () => {
  const { controller, host } = createZoomFixture();

  controller.zoomToCenter(1.2);
  assert.deepEqual(controller.state, { scale: 1.2, x: -30, y: -20 });

  host.clientHeight = 300;
  controller.zoomToCenter(1.5);
  assert.deepEqual(controller.state, { scale: 1.5, x: -75, y: -75 });
});

test("suspended presentation shows uncropped media and restores zoom afterward", () => {
  const { controller, video } = createZoomFixture();

  controller.zoomToCenter(1.5);
  const zoomState = controller.state;
  assert.match(video.style.getPropertyValue("transform"), /scale\(1\.5\)/);

  controller.setPresentationSuspended(true);
  assert.equal(video.style.getPropertyValue("transform"), "none");
  assert.deepEqual(controller.state, zoomState);

  controller.refresh();
  video.dispatch("dblclick");
  assert.equal(video.style.getPropertyValue("transform"), "none");
  assert.deepEqual(controller.state, zoomState);

  controller.setPresentationSuspended(false);
  assert.match(video.style.getPropertyValue("transform"), /scale\(1\.5\)/);
  assert.deepEqual(controller.state, zoomState);
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

test("letterbox space is excluded from the zoom cursor and interaction zone", () => {
  const { controller, video } = createZoomFixture({
    videoWidth: 100,
    videoHeight: 100,
  });

  video.dispatch("pointermove", { clientX: 20, clientY: 100 });
  assert.equal(video.style.getPropertyValue("cursor"), "default");
  const ignored = video.dispatch("wheel", {
    clientX: 20,
    clientY: 100,
    deltaY: -100,
  });
  assert.equal(ignored.defaultPrevented, false);
  assert.equal(controller.state.scale, 1);

  video.dispatch("pointermove", { clientX: 75, clientY: 100 });
  assert.equal(video.style.getPropertyValue("cursor"), "zoom-in");
  const accepted = video.dispatch("wheel", {
    clientX: 75,
    clientY: 100,
    deltaY: -100,
  });
  assert.equal(accepted.defaultPrevented, true);
  assert.equal(controller.state.scale, 1.2);
});

test("button-driven zoom steps around the center and respects zoom bounds", () => {
  const { controller } = createZoomFixture();

  controller.zoomBy(0.2);
  assert.deepEqual(controller.state, { scale: 1.2, x: -30, y: -20 });

  for (let index = 0; index < 20; index += 1) controller.zoomBy(0.2);
  assert.equal(controller.state.scale, VIDEO_ZOOM_MAX);

  for (let index = 0; index < 20; index += 1) controller.zoomBy(-0.2);
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

test("a stable interaction surface captures popup pan without accepting overlay starts", () => {
  const { controller, interactionTarget, video } = createZoomFixture({
    separateInteractionTarget: true,
  });
  controller.zoomTo(2, 150, 100);

  interactionTarget.dispatch("pointerdown", {
    target: video,
    pointerId: 7,
    clientX: 150,
    clientY: 100,
  });
  interactionTarget.dispatch("pointermove", {
    target: interactionTarget,
    pointerId: 7,
    clientX: 100,
    clientY: 70,
  });

  assert.deepEqual(controller.state, { scale: 2, x: -200, y: -130 });
  assert.deepEqual(interactionTarget.capturedPointers, [7]);

  interactionTarget.dispatch("pointerup", {
    target: interactionTarget,
    pointerId: 7,
    clientX: 100,
    clientY: 70,
  });
  assert.deepEqual(interactionTarget.releasedPointers, [7]);

  const ignoredWheel = interactionTarget.dispatch("wheel", {
    target: {},
    deltaY: -100,
  });
  assert.equal(ignoredWheel.defaultPrevented, false);
  assert.deepEqual(controller.state, { scale: 2, x: -200, y: -130 });
});

test("pulled-down popup cover media pans on touch without transform zoom", () => {
  const { controller, interactionTarget, video } = createZoomFixture({
    separateInteractionTarget: true,
    videoWidth: 1600,
    videoHeight: 900,
    hostWidth: 300,
    hostHeight: 300,
    nativeCoverPan: true,
    objectFit: "cover",
  });

  const down = interactionTarget.dispatch(
    "pointerdown",
    touchEvent(11, 150, 150, { target: video }),
  );
  assert.equal(down.defaultPrevented, true);
  interactionTarget.dispatch(
    "pointermove",
    touchEvent(11, 230, 150, { target: interactionTarget }),
  );

  assert.equal(controller.state.scale, 1);
  assert.ok(controller.state.objectPositionX > 0);
  assert.ok(controller.state.objectPositionX < 0.5);
  assert.equal(controller.state.objectPositionY, 0.5);
  assert.match(
    video.style.getPropertyValue("object-position"),
    /% 50%$/,
  );

  interactionTarget.dispatch(
    "pointerup",
    touchEvent(11, 230, 150, { target: interactionTarget }),
  );
  controller.zoomToCenter(2);
  assert.equal(controller.state.scale, 2);
  controller.reset();

  const downAfterReset = interactionTarget.dispatch(
    "pointerdown",
    touchEvent(12, 150, 150, { target: video }),
  );
  assert.equal(downAfterReset.defaultPrevented, true);
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
  assert.equal(video.style.getPropertyValue("object-position"), "");
  assert.equal(video.style.getPropertyValue("touch-action"), "");
  assert.equal(host.style.getPropertyValue("overflow"), "");
});

test("video presentation is refreshed once playback resumes after buffering", () => {
  const previousRequestAnimationFrame = globalThis.requestAnimationFrame;
  const previousCancelAnimationFrame = globalThis.cancelAnimationFrame;
  const frameCallbacks = [];
  globalThis.requestAnimationFrame = (callback) => {
    frameCallbacks.push(callback);
    return frameCallbacks.length;
  };
  globalThis.cancelAnimationFrame = () => {};

  try {
    const { controller, video } = createZoomFixture();
    frameCallbacks.shift()?.();
    frameCallbacks.shift()?.();

    video.dispatch("waiting");
    assert.doesNotMatch(
      video.style.getPropertyValue("transform"),
      /translateZ\(0\.001px\)/,
    );
    video.dispatch("playing");
    assert.match(
      video.style.getPropertyValue("transform"),
      /translateZ\(0\.001px\)/,
    );

    frameCallbacks.shift()?.();
    frameCallbacks.shift()?.();
    assert.doesNotMatch(
      video.style.getPropertyValue("transform"),
      /translateZ\(0\.001px\)/,
    );
    controller.dispose();
  } finally {
    globalThis.requestAnimationFrame = previousRequestAnimationFrame;
    globalThis.cancelAnimationFrame = previousCancelAnimationFrame;
  }
});

test("video presentation refresh waits for a decoded frame and spans a paint", () => {
  const previousRequestAnimationFrame = globalThis.requestAnimationFrame;
  const previousCancelAnimationFrame = globalThis.cancelAnimationFrame;
  const frameCallbacks = [];
  globalThis.requestAnimationFrame = (callback) => {
    frameCallbacks.push(callback);
    return frameCallbacks.length;
  };
  globalThis.cancelAnimationFrame = () => {};

  try {
    const { controller, video } = createZoomFixture({
      videoFrameCallbacks: true,
    });
    assert.doesNotMatch(
      video.style.getPropertyValue("transform"),
      /translateZ\(0\.001px\)/,
    );

    video.runNextVideoFrameCallback();
    assert.match(
      video.style.getPropertyValue("transform"),
      /translateZ\(0\.001px\)/,
    );

    frameCallbacks.shift()?.();
    assert.match(
      video.style.getPropertyValue("transform"),
      /translateZ\(0\.001px\)/,
    );
    frameCallbacks.shift()?.();
    assert.doesNotMatch(
      video.style.getPropertyValue("transform"),
      /translateZ\(0\.001px\)/,
    );

    video.dispatch("waiting");
    video.dispatch("playing");
    assert.equal(video._videoFrameCallbacks.size, 1);
    controller.dispose();
    assert.equal(video._videoFrameCallbacks.size, 0);
  } finally {
    globalThis.requestAnimationFrame = previousRequestAnimationFrame;
    globalThis.cancelAnimationFrame = previousCancelAnimationFrame;
  }
});
