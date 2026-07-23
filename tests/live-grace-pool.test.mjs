import { test } from "node:test";
import assert from "node:assert/strict";

import {
  createGraceEngineEntry,
  createGracePendingEntry,
  normalizeGraceEntityKey,
  prepareEngineVideoForGraceHost,
} from "../src/live/live-grace-pool.js";

test("normalizeGraceEntityKey trims and stringifies", () => {
  assert.equal(normalizeGraceEntityKey(" camera.front "), "camera.front");
  assert.equal(normalizeGraceEntityKey(null), "");
});

test("createGraceEngineEntry initializes defaults", () => {
  const entry = createGraceEngineEntry({
    engine: { id: "e1" },
    onExpire: () => {},
    graceMs: 10,
  });

  assert.equal(entry.engine.id, "e1");
  assert.equal(entry.cancelled, false);
  assert.equal(typeof entry.timer, "object");
  clearTimeout(entry.timer);
});

test("createGracePendingEntry initializes pending shape", () => {
  const entry = createGracePendingEntry({
    onExpire: () => {},
    graceMs: 10,
  });

  assert.equal(entry.engine, null);
  assert.equal(entry.promise, null);
  assert.equal(entry.cancelled, false);
  assert.equal(typeof entry.timer, "object");
  clearTimeout(entry.timer);
});

test("prepareEngineVideoForGraceHost applies offscreen muted state", () => {
  const video = {
    muted: false,
    controls: true,
    style: { cssText: "" },
    play: () => Promise.resolve(),
  };

  prepareEngineVideoForGraceHost(video);

  assert.equal(video.muted, true);
  assert.equal(video.controls, false);
  assert.equal(video.style.cssText.includes("left:-9999px"), true);
});
