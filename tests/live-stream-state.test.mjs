import { test } from "node:test";
import assert from "node:assert/strict";

import {
  applyActiveStreamTypeForCard,
  applyStreamFallbackVisibilityForCard,
  applyStreamFallbackVisibility,
  applyStreamFallbackState,
  applyStreamLoadingStateForCard,
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

test("applyActiveStreamTypeForCard updates active type, hint, and stats render", () => {
  let renderCalls = 0;
  const card = {
    _activeStreamType: "--",
    _lastLiveStreamHint: "webrtc",
    _renderStats: () => {
      renderCalls += 1;
    },
  };

  applyActiveStreamTypeForCard({
    card,
    type: "MSE",
  });

  assert.equal(card._activeStreamType, "MSE");
  assert.equal(card._lastLiveStreamHint, "mse");
  assert.equal(renderCalls, 1);

  applyActiveStreamTypeForCard({
    card,
    type: "snapshot",
  });

  assert.equal(card._activeStreamType, "snapshot");
  assert.equal(card._lastLiveStreamHint, "mse");
  assert.equal(renderCalls, 2);

  applyActiveStreamTypeForCard({
    card: null,
    type: "hls",
  });
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

test("applyStreamLoadingStateForCard maps card runtime to loading state", () => {
  const label = { textContent: "" };
  const loadingEl = {
    hidden: true,
    querySelector: (selector) => (selector === ".label" ? label : null),
  };
  const card = {
    shadowRoot: {
      querySelector: (selector) =>
        selector === "#stream-loading" ? loadingEl : null,
    },
  };

  applyStreamLoadingStateForCard({
    card,
    loading: true,
    text: "Buffering",
  });

  assert.equal(loadingEl.hidden, false);
  assert.equal(label.textContent, "Buffering");

  applyStreamLoadingStateForCard({
    card: null,
    loading: false,
    text: "Ignored",
  });
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

test("applyStreamFallbackVisibility wires refresh callback for fallback image", () => {
  const statusEl = { hidden: false };
  const fallbackEl = { hidden: true };
  let refreshCalls = 0;

  const shadowRoot = {
    querySelector: (selector) => {
      if (selector === "#stream-fallback") return fallbackEl;
      if (selector === "#stream-fallback-status") return statusEl;
      return null;
    },
  };

  applyStreamFallbackVisibility({
    shadowRoot,
    visible: true,
    refreshImage: true,
    refreshFallbackImage: () => {
      refreshCalls += 1;
    },
  });

  assert.equal(fallbackEl.hidden, false);
  assert.equal(refreshCalls, 1);
});

test("applyStreamFallbackVisibilityForCard maps card runtime and triggers refresh", () => {
  const statusEl = { hidden: false };
  const fallbackEl = { hidden: true };
  let refreshCalls = 0;
  const card = {
    shadowRoot: {
      querySelector: (selector) => {
        if (selector === "#stream-fallback") return fallbackEl;
        if (selector === "#stream-fallback-status") return statusEl;
        return null;
      },
    },
    _refreshStreamFallbackImage: () => {
      refreshCalls += 1;
    },
  };

  applyStreamFallbackVisibilityForCard({
    card,
    visible: true,
    refreshImage: true,
  });

  assert.equal(fallbackEl.hidden, false);
  assert.equal(refreshCalls, 1);

  applyStreamFallbackVisibilityForCard({
    card: null,
    visible: true,
    refreshImage: true,
  });
});
