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

test("_clearPopupMediaCleanup clears timers, disposes controllers, and destroys recording HLS", () => {
  const calls = [];
  const originalClearTimeout = globalThis.clearTimeout;
  globalThis.clearTimeout = (value) => {
    calls.push(["clearTimeout", value]);
  };

  try {
    const ctx = {
      _popupControlsHideTimer: 11,
      _popupMediaStopTimer: 22,
      _popupMediaControlsController: {
        dispose() {
          calls.push(["disposeControls"]);
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
      ["clearTimeout", 11],
      ["clearTimeout", 22],
      ["disposeControls"],
      ["popupMediaCleanup"],
      ["destroyRecordingHls"],
    ]);
    assert.equal(ctx._popupControlsHideTimer, null);
    assert.equal(ctx._popupMediaStopTimer, null);
    assert.equal(ctx._popupMediaControlsController, null);
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
      _popupControlsHideTimer: 11,
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
      _clearPopupMediaCleanup() {
        calls.push([
          "clearPopupMediaCleanup",
          this._popupControlsHideTimer,
          this._popupMediaStopTimer,
        ]);
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
      ["clearPopupMediaCleanup", 11, 22],
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
    _hidePopupInfo() {
      calls.push(["hidePopupInfo"]);
    },
    _$(selector) {
      if (selector === "#viewer") return viewer;
      if (selector === "#popup-media-controls") return controls;
      if (selector === "#popup-carousel-wrap") return carouselWrap;
      if (selector === "#popup-carousel") return carousel;
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
