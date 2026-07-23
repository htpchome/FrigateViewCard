import { test } from "node:test";
import assert from "node:assert/strict";

import {
  hideFallbackStatus,
  setFallbackStatusVisible,
  showFallbackStatus,
} from "../src/live/live-fallback-status.js";

test("setFallbackStatusVisible toggles hidden state", () => {
  const statusEl = { hidden: true };

  setFallbackStatusVisible({
    statusEl,
    visible: true,
  });
  assert.equal(statusEl.hidden, false);

  setFallbackStatusVisible({
    statusEl,
    visible: false,
  });
  assert.equal(statusEl.hidden, true);
});

test("hideFallbackStatus and showFallbackStatus are convenience wrappers", () => {
  const statusEl = { hidden: false };

  hideFallbackStatus(statusEl);
  assert.equal(statusEl.hidden, true);

  showFallbackStatus(statusEl);
  assert.equal(statusEl.hidden, false);
});
