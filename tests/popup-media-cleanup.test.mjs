import { test } from "node:test";
import assert from "node:assert/strict";

globalThis.window = globalThis.window || { customCards: [] };
globalThis.window.customCards = globalThis.window.customCards || [];
globalThis.document = globalThis.document || {
  createElement: () => ({
    style: {},
    setAttribute() {},
    removeAttribute() {},
    appendChild() {},
    addEventListener() {},
    removeEventListener() {},
    querySelector() {
      return null;
    },
    querySelectorAll() {
      return [];
    },
  }),
  head: { appendChild() {} },
};
globalThis.customElements = globalThis.customElements || {
  define() {},
  get() {
    return undefined;
  },
};
globalThis.HTMLElement =
  globalThis.HTMLElement ||
  class {
    attachShadow() {
      return {
        addEventListener() {},
        removeEventListener() {},
        querySelector() {
          return null;
        },
        querySelectorAll() {
          return [];
        },
      };
    }
  };
globalThis.HTMLImageElement = globalThis.HTMLImageElement || class {};

const { FrigateViewCard } = await import("../src/card/FrigateViewCard.js");
const { PopupCarouselController } = await import(
  "../src/features/popup/carousel.ctrl.js"
);

test("_clearPopupMediaCleanup delegates controls disposal and clears media state", () => {
  const calls = [];
  const originalClearTimeout = globalThis.clearTimeout;
  globalThis.clearTimeout = (value) => {
    calls.push(["clearTimeout", value]);
  };

  try {
    const ctx = {
      _popupMediaStopTimer: 22,
      _popupMediaControlsController: {
        dispose() {
          calls.push(["disposeControls"]);
        },
      },
      _clearPictureInPictureButtonController(scope) {
        calls.push(["clearPictureInPicture", scope]);
      },
      _popupCarouselController: {
        dispose() {
          calls.push(["disposeCarousel"]);
        },
      },
      _popupMediaCleanup: () => {
        calls.push(["popupMediaCleanup"]);
      },
      _destroyRecordingHls() {
        calls.push(["destroyRecordingHls"]);
      },
    };

    FrigateViewCard.prototype._clearPopupMediaCleanup.call(ctx);

    assert.deepEqual(calls, [
      ["clearPictureInPicture", "popup"],
      ["disposeCarousel"],
      ["disposeControls"],
      ["clearTimeout", 22],
      ["popupMediaCleanup"],
      ["destroyRecordingHls"],
    ]);
    assert.equal(ctx._popupMediaStopTimer, null);
    assert.notEqual(ctx._popupMediaControlsController, null);
    assert.equal(ctx._popupMediaCleanup, null);
  } finally {
    globalThis.clearTimeout = originalClearTimeout;
  }
});

test("_teardownDisconnected delegates popup timer cleanup to _clearPopupMediaCleanup", () => {
  const clearTimeoutCalls = [];
  const calls = [];
  const originalClearTimeout = globalThis.clearTimeout;
  globalThis.clearTimeout = (value) => {
    clearTimeoutCalls.push(value);
  };

  try {
    const ctx = {
      _popupMediaStopTimer: 22,
      _liveControlsHideTimer: 33,
      _rotateOverlayRaf: 0,
      _rotateOverlayExitT: null,
      _mseGraceController: {
        clearGracePool() {
          calls.push(["clearGracePool"]);
        },
      },
      _parentOrigStyle: null,
      parentElement: null,
      _stopTwoWayTalkSession() {
        calls.push(["stopTwoWayTalkSession"]);
      },
      _stopSlideshowRotation() {
        calls.push(["stopSlideshowRotation"]);
      },
      _stopGridModeState() {
        calls.push(["stopGridModeState"]);
      },
      _stopPreviewMode() {
        calls.push(["stopPreviewMode"]);
      },
      _clearPictureInPictureButtonController(scope) {
        calls.push(["clearPictureInPicture", scope]);
      },
      _clearPopupMediaCleanup() {
        calls.push(["clearPopupMediaCleanup", this._popupMediaStopTimer]);
      },
      _clearRotateOverlayAudioSync() {
        calls.push(["clearRotateOverlayAudioSync"]);
      },
      _clearRotateVideoFullscreenStyle() {
        calls.push(["clearRotateVideoFullscreenStyle"]);
      },
      _setSectionsRowGap(value) {
        calls.push(["setSectionsRowGap", value]);
      },
      _cleanupEngine() {
        calls.push(["cleanupEngine"]);
      },
    };

    FrigateViewCard.prototype._teardownDisconnected.call(ctx);

    assert.deepEqual(clearTimeoutCalls, [33]);
    assert.deepEqual(calls, [
      ["stopTwoWayTalkSession"],
      ["stopSlideshowRotation"],
      ["stopGridModeState"],
      ["stopPreviewMode"],
      ["clearPictureInPicture", "live"],
      ["clearPictureInPicture", "popup"],
      ["clearPopupMediaCleanup", 22],
      ["clearRotateOverlayAudioSync"],
      ["clearRotateVideoFullscreenStyle"],
      ["clearGracePool"],
      ["setSectionsRowGap", false],
      ["cleanupEngine"],
    ]);
  } finally {
    globalThis.clearTimeout = originalClearTimeout;
  }
});

test("_stopPopupMedia resets popup media surfaces after shared cleanup", () => {
  const calls = [];
  const video = {
    pause() {
      calls.push(["pauseVideo"]);
    },
    removeAttribute(name) {
      calls.push(["removeAttribute", name]);
    },
    querySelectorAll(selector) {
      assert.equal(selector, "source");
      return [
        {
          remove() {
            calls.push(["removeSource"]);
          },
        },
      ];
    },
  };
  const viewer = {
    style: { display: "block" },
    innerHTML: "video markup",
    querySelectorAll(selector) {
      assert.equal(selector, "video");
      return [video];
    },
  };
  const controls = {
    hidden: false,
    classList: {
      remove(token) {
        calls.push(["removeClass", token]);
      },
    },
  };
  const carouselWrap = { hidden: false };
  const carousel = { innerHTML: "items" };
  const ctx = {
    _popupMediaType: "clip",
    _playing: { id: "abc" },
    _clearPopupMediaCleanup() {
      calls.push(["clearPopupMediaCleanup"]);
    },
    _isFirefox() {
      return false;
    },
    _popupInfoController: {
      hide() {
        calls.push(["hidePopupInfo"]);
      },
    },
    _popupCarouselController: {
      clear() {
        calls.push(["clearCarousel"]);
        carouselWrap.hidden = true;
        carousel.innerHTML = "";
      },
    },
    _$(selector) {
      if (selector === "#viewer") return viewer;
      if (selector === "#popup-media-controls") return controls;
      return null;
    },
    _resetPopupMediaSurfaceState:
      FrigateViewCard.prototype._resetPopupMediaSurfaceState,
  };

  FrigateViewCard.prototype._stopPopupMedia.call(ctx);

  assert.deepEqual(calls, [
    ["clearPopupMediaCleanup"],
    ["pauseVideo"],
    ["removeAttribute", "src"],
    ["removeSource"],
    ["removeClass", "is-hidden"],
    ["clearCarousel"],
    ["hidePopupInfo"],
  ]);
  assert.equal(viewer.innerHTML, "");
  assert.equal(viewer.style.display, "none");
  assert.equal(controls.hidden, true);
  assert.equal(carouselWrap.hidden, true);
  assert.equal(carousel.innerHTML, "");
  assert.equal(ctx._popupMediaType, "");
  assert.equal(ctx._playing, null);
});

test("popup carousel controls reflect scroll edges and measured item height", () => {
  const cssValues = new Map();
  const wrap = {
    style: {
      setProperty(name, value) {
        cssValues.set(name, value);
      },
    },
  };
  const leftButton = { hidden: false };
  const rightButton = { hidden: true };
  const row = {
    scrollLeft: 0,
    scrollWidth: 1800,
    clientWidth: 900,
    querySelector(selector) {
      assert.equal(selector, ".popup-carousel-item");
      return { getBoundingClientRect: () => ({ height: 98 }) };
    },
  };
  const controller = new PopupCarouselController({
    query(selector) {
      if (selector === "#popup-carousel-wrap") return wrap;
      if (selector === "#popup-carousel-left") return leftButton;
      if (selector === "#popup-carousel-right") return rightButton;
      return null;
    },
  });

  controller.syncNavigation(row);

  assert.equal(leftButton.hidden, true);
  assert.equal(rightButton.hidden, false);
  assert.equal(cssValues.get("--popup-carousel-item-height"), "98px");

  row.scrollLeft = 900;
  controller.syncNavigation(row);
  assert.equal(leftButton.hidden, false);
  assert.equal(rightButton.hidden, true);
});

test("two-way talk active state unmutes live audio and inactive state remutes it", () => {
  const calls = [];
  const ctx = {
    _applyLiveMuteChange(muted, options) {
      calls.push([muted, options]);
    },
  };

  FrigateViewCard.prototype._setTwoWayTalkLiveAudioActive.call(ctx, true);
  FrigateViewCard.prototype._setTwoWayTalkLiveAudioActive.call(ctx, false);

  assert.deepEqual(calls, [
    [false, { source: "two-way-talk" }],
    [true, { source: "two-way-talk" }],
  ]);
});

test("stopping two-way talk remutes live audio before closing the session", async () => {
  const calls = [];
  const ctx = {
    _twoWayTalkSession: {
      async stop() {
        calls.push(["stop"]);
      },
    },
    _twoWayTalkEntity: "camera.front",
    _setTwoWayTalkLiveAudioActive(active) {
      calls.push(["audio-active", active]);
    },
    _syncTwoWayTalkButton() {
      calls.push(["sync-button"]);
    },
  };

  await FrigateViewCard.prototype._stopTwoWayTalkSession.call(ctx);

  assert.equal(ctx._twoWayTalkSession, null);
  assert.equal(ctx._twoWayTalkEntity, "");
  assert.deepEqual(calls, [
    ["audio-active", false],
    ["stop"],
    ["sync-button"],
  ]);
});
