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
      _mseGracePool: new Map(),
      _parentOrigStyle: null,
      parentElement: null,
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
      ["stopSlideshowRotation"],
      ["stopGridModeState"],
      ["stopPreviewMode"],
      ["clearPopupMediaCleanup", 11, 22],
      ["clearRotateOverlayAudioSync"],
      ["clearRotateVideoFullscreenStyle"],
      ["setSectionsRowGap", false],
      ["cleanupEngine"],
    ]);
  } finally {
    globalThis.clearTimeout = originalClearTimeout;
  }
});
