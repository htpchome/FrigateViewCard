import { test } from "node:test";
import assert from "node:assert/strict";

import { LiveStreamStatusController } from "../src/features/live/stream-status.ctrl.js";

const createHost = () => {
  const calls = [];
  const labelAttributes = new Map([["data-fvc-i18n", "runtime.live.loading"]]);
  const label = {
    textContent: "",
    setAttribute(name, value) {
      labelAttributes.set(name, String(value));
    },
    removeAttribute(name) {
      labelAttributes.delete(name);
    },
    getAttribute(name) {
      return labelAttributes.get(name) ?? null;
    },
  };
  const loading = {
    hidden: true,
    querySelector: (selector) => (selector === ".label" ? label : null),
  };
  const fallback = { hidden: true };
  const fallbackStatus = { hidden: false };
  const host = {
    _activeStreamType: "--",
    _lastLiveStreamHint: "webrtc",
    _localization: {
      t: (key) =>
        key === "runtime.live.loading" ? "Localized loading" : key,
    },
    _gridPageController: {
      captureBackgroundLiveStreamType: () => false,
    },
    _liveViewResizeController: {
      sync: () => calls.push(["resize"]),
    },
    _preferredStreamType: () => "webrtc",
    _refreshStreamFallbackImage: () => calls.push(["refresh-fallback"]),
    _renderStats: () => calls.push(["render-stats"]),
    _setLiveNativeControls: (enabled) =>
      calls.push(["native-controls", enabled]),
    _syncTwoWayTalkButton: () => calls.push(["sync-talk-button"]),
    _syncTwoWayTalkRuntimeState: () => calls.push(["sync-talk-state"]),
    _$: (selector) =>
      selector === "#stream-loading .label" ? label : null,
    shadowRoot: {
      querySelector(selector) {
        if (selector === "#stream-loading") return loading;
        if (selector === "#stream-fallback") return fallback;
        if (selector === "#stream-fallback-status") return fallbackStatus;
        return null;
      },
    },
  };
  return {
    calls,
    fallback,
    fallbackStatus,
    host,
    label,
    loading,
  };
};

test("stream status resolves active, retained, and preferred transport hints", () => {
  const { host } = createHost();
  const controller = new LiveStreamStatusController(host);

  host._activeStreamType = " MSE ";
  assert.equal(controller.currentStreamHint(), "mse");

  host._activeStreamType = "snapshot";
  host._lastLiveStreamHint = " HLS ";
  assert.equal(controller.currentStreamHint(), "hls");

  host._lastLiveStreamHint = "";
  assert.equal(controller.currentStreamHint(), "webrtc");
});

test("stream status localizes default loading text and preserves custom text", () => {
  const { host, label, loading } = createHost();
  const controller = new LiveStreamStatusController(host);

  controller.setLoading(true);

  assert.equal(loading.hidden, false);
  assert.equal(label.textContent, "Localized loading");
  assert.equal(label.getAttribute("data-fvc-i18n"), "runtime.live.loading");

  controller.setLoading(true, "Reconnecting");

  assert.equal(label.textContent, "Reconnecting");
  assert.equal(label.getAttribute("data-fvc-i18n"), null);
});

test("stream status applies active transport state and dependent UI updates", () => {
  const { calls, host } = createHost();
  const controller = new LiveStreamStatusController(host);

  controller.setActiveType("MSE");

  assert.equal(host._activeStreamType, "MSE");
  assert.equal(host._lastLiveStreamHint, "mse");
  assert.deepEqual(calls, [
    ["render-stats"],
    ["sync-talk-state"],
    ["sync-talk-button"],
    ["resize"],
  ]);

  host._gridPageController.captureBackgroundLiveStreamType = () => true;
  controller.setActiveType("webrtc");
  assert.equal(host._activeStreamType, "MSE");
  assert.equal(calls.length, 4);
});

test("stream status applies fallback and resolved transport presentation", () => {
  const { calls, fallback, fallbackStatus, host } = createHost();
  const controller = new LiveStreamStatusController(host);

  controller.setFallbackVisible(true, true);
  assert.equal(fallback.hidden, false);
  assert.deepEqual(calls, [["refresh-fallback"], ["resize"]]);

  controller.applyResolvedState({
    loading: false,
    fallbackVisible: false,
    refreshFallbackImage: false,
    enableNativeControls: true,
  });

  assert.equal(fallback.hidden, true);
  assert.equal(fallbackStatus.hidden, true);
  assert.equal(calls.at(-1)[0], "native-controls");
  assert.deepEqual(calls.at(-1), ["native-controls", true]);
});
