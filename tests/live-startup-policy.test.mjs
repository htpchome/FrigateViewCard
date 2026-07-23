import { test } from "node:test";
import assert from "node:assert/strict";

import {
  resolveHaDirectStartup,
  resolveHlsStartup,
  resolveMseStartup,
  resolveWebRtcStartup,
} from "../src/live/live-startup-policy.js";

test("resolveHaDirectStartup applies defaults and keeps stream type", () => {
  const policy = resolveHaDirectStartup({ streamType: "webrtc" });

  assert.equal(policy.waitMs, 8000);
  assert.equal(policy.minCurrentTime, 0.05);
  assert.equal(policy.minDecodedFrames, 1);
  assert.equal(policy.requireReadyState, 0);
  assert.equal(policy.strict, false);
  assert.equal(policy.streamType, "webrtc");
});

test("resolveMseStartup enforces wait floor and strict default", () => {
  const policy = resolveMseStartup({ waitMs: 10, strict: false });

  assert.equal(policy.waitMs, 500);
  assert.equal(policy.minCurrentTime, 0.2);
  assert.equal(policy.minDecodedFrames, 2);
  assert.equal(policy.requireReadyState, 3);
  assert.equal(policy.strict, false);
});

test("resolveWebRtcStartup is firefox-aware", () => {
  const firefox = resolveWebRtcStartup({ isFirefox: true });
  assert.equal(firefox.minCurrentTime, 0.15);
  assert.equal(firefox.minDecodedFrames, 2);
  assert.equal(firefox.requireReadyState, 3);
  assert.equal(firefox.strict, true);

  const nonFirefox = resolveWebRtcStartup({ isFirefox: false });
  assert.equal(nonFirefox.minCurrentTime, 0.05);
  assert.equal(nonFirefox.minDecodedFrames, 1);
  assert.equal(nonFirefox.requireReadyState, 0);
  assert.equal(nonFirefox.strict, false);
});

test("resolveHlsStartup applies default wait and floor", () => {
  assert.equal(resolveHlsStartup({}).waitMs, 5000);
  assert.equal(resolveHlsStartup({ waitMs: 1 }).waitMs, 500);
});
