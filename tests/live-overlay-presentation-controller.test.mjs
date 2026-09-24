import { test } from "node:test";
import assert from "node:assert/strict";

import { LiveOverlayPresentationController } from "../src/features/live/overlay-presentation.ctrl.js";

const createClassList = (initial = []) => {
  const classes = new Set(initial);
  return {
    add: (...names) => names.forEach((name) => classes.add(name)),
    remove: (...names) => names.forEach((name) => classes.delete(name)),
    toggle(name, enabled) {
      if (enabled) classes.add(name);
      else classes.delete(name);
    },
    contains: (name) => classes.has(name),
  };
};

const createCardViewHost = () => {
  const wrap = { classList: createClassList(["live-stage--overlay"]) };
  const card = {
    classList: createClassList([
      "card-view-overlays-idle",
      "card-view-overlays-touch-idle",
    ]),
  };
  const panel = {};
  const nodes = {
    "#live-stage": wrap,
    "#live-stage.live-stage--overlay": wrap,
    "#card": card,
    ".card-view-live-panel": panel,
  };
  return {
    wrap,
    card,
    panel,
    host: {
      _$: (selector) => nodes[selector] || null,
      _isCardViewPageActive: () => true,
      _isMobileViewPageActive: () => false,
      _cardViewPageController: {
        usesOverlayPresentation: () => true,
      },
      _config: {},
      _lastLiveOverlayPointerType: "mouse",
      _liveControlsHideTimer: null,
      _liveOverlayControlsController: null,
    },
  };
};

test("live overlay presentation configures the Card View interaction surface", () => {
  const { host, wrap, card, panel } = createCardViewHost();
  const scheduled = [];
  let controllerOptions = null;
  let bound = false;
  const controller = new LiveOverlayPresentationController(host, {
    createOverlayController: (options) => {
      controllerOptions = options;
      return {
        bind: () => {
          bound = true;
        },
        dispose() {},
      };
    },
    setTimer: (callback, delay) => {
      scheduled.push({ callback, delay });
      return scheduled.length;
    },
  });

  controller.init();

  assert.equal(bound, true);
  assert.equal(controllerOptions.surface, panel);
  assert.equal(controllerOptions.revealDurationMs, 10000);
  assert.equal(controllerOptions.touchRevealDurationMs, 3000);
  assert.equal(controllerOptions.autoHideMouse, true);

  controllerOptions.show({ pointerType: "touch" });
  assert.equal(host._lastLiveOverlayPointerType, "touch");
  assert.equal(wrap.classList.contains("live-controls-visible"), true);
  assert.equal(card.classList.contains("card-view-overlays-idle"), false);

  controllerOptions.hideSoon(900, { pointerType: "touch" });
  assert.equal(scheduled[0].delay, 900);
  scheduled[0].callback();
  assert.equal(wrap.classList.contains("live-controls-visible"), false);
  assert.equal(card.classList.contains("card-view-overlays-idle"), false);
  assert.equal(
    card.classList.contains("card-view-overlays-touch-idle"),
    true,
  );
});

test("temporary Card View controls use the last pointer-specific timeout", () => {
  const { host, wrap, card } = createCardViewHost();
  const scheduled = [];
  host._lastLiveOverlayPointerType = "touch";
  const controller = new LiveOverlayPresentationController(host, {
    setTimer: (callback, delay) => {
      scheduled.push({ callback, delay });
      return scheduled.length;
    },
  });

  controller.showTemporarily();

  assert.equal(scheduled[0].delay, 3000);
  assert.equal(wrap.classList.contains("live-controls-visible"), true);
  scheduled[0].callback();
  assert.equal(wrap.classList.contains("live-controls-visible"), false);
  assert.equal(
    card.classList.contains("card-view-overlays-touch-idle"),
    true,
  );
});

test("live overlay presentation disposal clears timers and bindings", () => {
  const { host } = createCardViewHost();
  const calls = [];
  host._liveControlsHideTimer = 17;
  host._liveOverlayControlsController = {
    dispose: () => calls.push("dispose"),
  };
  const controller = new LiveOverlayPresentationController(host, {
    clearTimer: (timer) => calls.push(["clear", timer]),
  });

  controller.dispose();

  assert.deepEqual(calls, [["clear", 17], "dispose"]);
  assert.equal(host._liveControlsHideTimer, null);
  assert.equal(host._liveOverlayControlsController, null);
});
