import { test } from "node:test";
import assert from "node:assert/strict";

import {
  applyStreamFallbackState,
  applyStreamLoadingState,
  isLiveTransportType,
  resolveActiveStreamTypeState,
} from "../src/live/live-stream-state.js";

test("isLiveTransportType matches known live transports", () => {
  assert.equal(isLiveTransportType("webrtc"), true);
  assert.equal(isLiveTransportType(" mse "), true);
  assert.equal(isLiveTransportType("hls"), true);
  assert.equal(isLiveTransportType("snapshot"), false);
});

test("resolveActiveStreamTypeState updates hint only for live transports", () => {
  const nextLive = resolveActiveStreamTypeState({
    type: "MSE",
    lastLiveStreamHint: "webrtc",
  });
  assert.equal(nextLive.activeStreamType, "MSE");
  assert.equal(nextLive.lastLiveStreamHint, "mse");

  const nextFallback = resolveActiveStreamTypeState({
    type: "snapshot",
    lastLiveStreamHint: "mse",
  });
  assert.equal(nextFallback.activeStreamType, "snapshot");
  assert.equal(nextFallback.lastLiveStreamHint, "mse");
});

test("applyStreamLoadingState toggles hidden and updates label", () => {
  const label = { textContent: "" };
  const loadingEl = {
    hidden: true,
    querySelector: (selector) => (selector === ".label" ? label : null),
  };
  const shadowRoot = {
    querySelector: (selector) =>
      selector === "#stream-loading" ? loadingEl : null,
  };

  applyStreamLoadingState({
    shadowRoot,
    loading: true,
    text: "Connecting",
  });

  assert.equal(loadingEl.hidden, false);
  assert.equal(label.textContent, "Connecting");
});

test("applyStreamFallbackState updates placeholder and refreshes when requested", () => {
  const statusEl = { hidden: false };
  const fallbackEl = { hidden: true };
  let refreshed = false;

  const shadowRoot = {
    querySelector: (selector) => {
      if (selector === "#stream-fallback") return fallbackEl;
      if (selector === "#stream-fallback-status") return statusEl;
      return null;
    },
  };

  applyStreamFallbackState({
    shadowRoot,
    visible: true,
    refreshImage: true,
    onRefresh: () => {
      refreshed = true;
    },
  });

  assert.equal(fallbackEl.hidden, false);
  assert.equal(refreshed, true);

  applyStreamFallbackState({
    shadowRoot,
    visible: false,
    refreshImage: false,
    onRefresh: () => {},
  });

  assert.equal(fallbackEl.hidden, true);
  assert.equal(statusEl.hidden, true);
});
