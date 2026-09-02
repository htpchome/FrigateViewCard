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
const { ICONS } = await import("../src/icons.js");
const { PopupCarouselController } = await import(
  "../src/features/popup/carousel.ctrl.js"
);

test("_teardownDisconnected delegates popup cleanup to its lifecycle owner", () => {
  const clearTimeoutCalls = [];
  const calls = [];
  const originalClearTimeout = globalThis.clearTimeout;
  globalThis.clearTimeout = (value) => {
    clearTimeoutCalls.push(value);
  };

  try {
    const ctx = {
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
      _popupLifecycleController: {
        dispose() {
          calls.push(["disposePopupLifecycle"]);
        },
      },
      _pageNavigationController: {
        disconnectToolbarDivider() {
          calls.push(["disconnectToolbarDivider"]);
        },
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
      _clearLiveEngineSlot() {
        calls.push(["clearLiveEngineSlot"]);
      },
    };

    FrigateViewCard.prototype._teardownDisconnected.call(ctx);

    assert.deepEqual(clearTimeoutCalls, [33]);
    assert.deepEqual(calls, [
      ["stopTwoWayTalkSession"],
      ["stopSlideshowRotation"],
      ["stopGridModeState"],
      ["stopPreviewMode"],
      ["disconnectToolbarDivider"],
      ["clearPictureInPicture", "live"],
      ["disposePopupLifecycle"],
      ["clearRotateOverlayAudioSync"],
      ["clearRotateVideoFullscreenStyle"],
      ["clearGracePool"],
      ["setSectionsRowGap", false],
      ["cleanupEngine"],
      ["clearLiveEngineSlot"],
    ]);
  } finally {
    globalThis.clearTimeout = originalClearTimeout;
  }
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

test("live mute controls only pause and resume incoming two-way-talk audio", () => {
  const calls = [];
  const session = {
    microphoneMuted: false,
    setMicrophoneMuted(muted) {
      this.microphoneMuted = muted;
      calls.push(["microphone-muted", muted]);
    },
  };
  const ctx = {
    _streamMuted: false,
    _twoWayTalkSession: session,
    _twoWayTalkActiveForCurrentCamera: () => true,
    _resolveLiveMuteControlMuted() {
      return this._streamMuted || session.microphoneMuted;
    },
    _applyLiveMuteChange(muted, options) {
      this._streamMuted = muted;
      calls.push(["live-muted", muted, options]);
    },
    _syncTwoWayTalkButton() {
      calls.push(["sync-buttons"]);
    },
  };

  FrigateViewCard.prototype._toggleMute.call(ctx);
  FrigateViewCard.prototype._toggleMute.call(ctx);

  assert.deepEqual(calls, [
    ["live-muted", true, { source: "button" }],
    ["live-muted", false, { source: "button" }],
  ]);
  assert.equal(session.microphoneMuted, false);
});

test("microphone mute controls only pause and resume the outgoing microphone", () => {
  const calls = [];
  const session = {
    microphoneMuted: false,
    setMicrophoneMuted(muted) {
      this.microphoneMuted = muted;
      calls.push(["microphone-muted", muted]);
    },
  };
  const ctx = {
    _twoWayTalkSession: session,
    _twoWayTalkActiveForCurrentCamera: () => true,
    _twoWayTalkMicrophoneMutedForCurrentCamera() {
      return session.microphoneMuted;
    },
    _syncTwoWayTalkButton() {
      calls.push(["sync-buttons"]);
    },
  };

  FrigateViewCard.prototype._toggleTwoWayTalkMicrophoneMute.call(ctx);
  FrigateViewCard.prototype._toggleTwoWayTalkMicrophoneMute.call(ctx);

  assert.deepEqual(calls, [
    ["microphone-muted", true],
    ["sync-buttons"],
    ["microphone-muted", false],
    ["sync-buttons"],
  ]);
});

test("incoming mute state remains independent from a muted talk microphone", () => {
  const ctx = {
    _streamMuted: false,
    _twoWayTalkSession: { microphoneMuted: true },
  };

  assert.equal(
    FrigateViewCard.prototype._resolveLiveMuteControlMuted.call(ctx),
    false,
  );
});

test("touching the microphone mute control toggles it and releases focus", () => {
  const calls = [];
  const microphoneMuteButton = {
    blur: () => calls.push("blur"),
  };
  const target = {
    closest(selector) {
      if (selector === "#two-way-talk-btn") return null;
      if (selector.includes("#two-way-talk-microphone-mute-btn")) {
        return microphoneMuteButton;
      }
      return null;
    },
  };
  const ctx = {
    _toggleTwoWayTalkMicrophoneMute: () => calls.push("toggle-microphone"),
  };

  const handled = FrigateViewCard.prototype._handleTopToolbarClick.call(
    ctx,
    target,
    { pointerType: "touch" },
  );

  assert.equal(handled, true);
  assert.deepEqual(calls, ["toggle-microphone", "blur"]);
});

test("HA-direct talk unmute does not replace the active full-duplex peer", () => {
  let remountCalls = 0;
  const ctx = {
    _engineMountedMuted: true,
    _rotateOverlayActive: false,
    _setLiveMuted() {},
    _renderMuteButton() {},
    _useHaDirectStreamPath: () => true,
    _twoWayTalkActiveForCurrentCamera: () => true,
    _mountEngine() {
      remountCalls += 1;
    },
  };

  FrigateViewCard.prototype._applyLiveMuteChange.call(ctx, false, {
    source: "two-way-talk",
  });

  assert.equal(remountCalls, 0);
  assert.equal(ctx._engineMountedMuted, false);
});

test("desktop talk controls keep the microphone centered and reveal synchronized mute", () => {
  const ctx = {
    _activeCam: { entity: "camera.front", two_way_talk: true },
    _streamMuted: true,
    _twoWayTalkEntity: "",
    _twoWayTalkSession: null,
    _shouldRenderTwoWayTalkButtonForActiveCamera:
      FrigateViewCard.prototype._shouldRenderTwoWayTalkButtonForActiveCamera,
    _twoWayTalkActiveForCurrentCamera:
      FrigateViewCard.prototype._twoWayTalkActiveForCurrentCamera,
    _twoWayTalkMicrophoneMutedForCurrentCamera:
      FrigateViewCard.prototype._twoWayTalkMicrophoneMutedForCurrentCamera,
    _resolveLiveMuteControlMuted:
      FrigateViewCard.prototype._resolveLiveMuteControlMuted,
    _shouldRenderTwoWayTalkSoundwave: () => true,
    _buildTwoWayTalkButtonMarkup:
      FrigateViewCard.prototype._buildTwoWayTalkButtonMarkup,
    _buildTwoWayTalkMicrophoneMuteButtonMarkup:
      FrigateViewCard.prototype._buildTwoWayTalkMicrophoneMuteButtonMarkup,
    _buildTwoWayTalkControlRowMarkup:
      FrigateViewCard.prototype._buildTwoWayTalkControlRowMarkup,
  };

  const inactiveMarkup = ctx._buildTwoWayTalkControlRowMarkup();
  assert.match(inactiveMarkup, /class="two-way-talk-control-row"/);
  assert.match(inactiveMarkup, /data-two-way-talk-soundwave hidden/);
  assert.match(
    inactiveMarkup,
    /id="two-way-talk-microphone-mute-btn"[^>]* hidden/,
  );
  assert.match(inactiveMarkup, /id="two-way-talk-mute-btn"[^>]* hidden/);

  ctx._streamMuted = false;
  ctx._twoWayTalkEntity = "camera.front";
  ctx._twoWayTalkSession = { microphoneMuted: false };
  const activeMarkup = ctx._buildTwoWayTalkControlRowMarkup();
  assert.match(activeMarkup, /two-way-talk-control-row has-inline-mute/);
  assert.match(activeMarkup, /has-inline-mute has-soundwave/);
  assert.doesNotMatch(activeMarkup, /data-two-way-talk-soundwave hidden/);
  assert.match(activeMarkup, /info-row-mic-btn active round-btn/);
  assert.match(
    activeMarkup,
    /two-way-talk-microphone-mute-btn talk-audio-active active/,
  );
  assert.doesNotMatch(
    activeMarkup.match(
      /<button[^>]*id="two-way-talk-microphone-mute-btn"[^>]*>/,
    )?.[0] || "",
    / hidden/,
  );
  assert.ok(
    activeMarkup.indexOf('id="two-way-talk-microphone-mute-btn"') <
      activeMarkup.indexOf('id="two-way-talk-btn"'),
  );
  assert.match(
    activeMarkup,
    /two-way-talk-inline-mute-btn talk-audio-active active/,
  );
  assert.doesNotMatch(
    activeMarkup.match(/<button[^>]*id="two-way-talk-mute-btn"[^>]*>/)?.[0] || "",
    / hidden/,
  );

  ctx._streamMuted = true;
  ctx._twoWayTalkSession.microphoneMuted = true;
  const mutedMarkup = ctx._buildTwoWayTalkControlRowMarkup();
  assert.match(
    mutedMarkup,
    /info-row-mic-btn active microphone-muted round-btn/,
  );
  assert.doesNotMatch(
    mutedMarkup.match(
      /<button[^>]*id="two-way-talk-microphone-mute-btn"[^>]*>/,
    )?.[0] || "",
    /\bactive\b/,
  );
  assert.match(
    mutedMarkup,
    new RegExp(
      `id="two-way-talk-microphone-mute-btn"[^>]*>[\\s\\S]*${ICONS.micOff.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}`,
    ),
  );
  assert.doesNotMatch(mutedMarkup, /talk-audio-active/);
});

test("Grid mode suppresses the active camera two-way-talk control", () => {
  const context = {
    _viewMode: "grid",
    _activeCam: { entity: "camera.front", two_way_talk: true },
  };
  const visibleInGrid =
    FrigateViewCard.prototype._shouldRenderTwoWayTalkButtonForActiveCamera.call(
      context,
    );
  context._viewMode = "single";
  const visibleAfterGrid =
    FrigateViewCard.prototype._shouldRenderTwoWayTalkButtonForActiveCamera.call(
      context,
    );

  assert.equal(visibleInGrid, false);
  assert.equal(visibleAfterGrid, true);
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

test("stopping two-way talk restores the configured live pipeline", async () => {
  const calls = [];
  const ctx = {
    _activeCam: { entity: "camera.front" },
    _viewMode: "single",
    _twoWayTalkSession: {
      async stop() {
        calls.push(["stop"]);
      },
    },
    _twoWayTalkEntity: "camera.front",
    _setTwoWayTalkLiveAudioActive(active) {
      calls.push(["audio-active", active]);
    },
    _isPreviewPageActive() {
      return false;
    },
    async _mountEngine() {
      calls.push(["mount-normal-live"]);
    },
    _syncTwoWayTalkButton() {
      calls.push(["sync-button"]);
    },
  };

  await FrigateViewCard.prototype._stopTwoWayTalkSession.call(ctx);

  assert.deepEqual(calls, [
    ["audio-active", false],
    ["stop"],
    ["mount-normal-live"],
    ["sync-button"],
  ]);
});

test("navigation can stop two-way talk without remounting the old view", async () => {
  let mountCalls = 0;
  const ctx = {
    _activeCam: { entity: "camera.front" },
    _viewMode: "single",
    _twoWayTalkSession: { async stop() {} },
    _twoWayTalkEntity: "camera.front",
    _setTwoWayTalkLiveAudioActive() {},
    _isPreviewPageActive: () => false,
    async _mountEngine() {
      mountCalls += 1;
    },
    _syncTwoWayTalkButton() {},
  };

  await FrigateViewCard.prototype._stopTwoWayTalkSession.call(ctx, {
    restoreLive: false,
  });

  assert.equal(mountCalls, 0);
});
