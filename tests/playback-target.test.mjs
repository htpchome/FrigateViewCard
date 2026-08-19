import { test } from "node:test";
import assert from "node:assert/strict";

import {
  PLAYBACK_TARGET_AIRPLAY,
  PLAYBACK_TARGET_CAST,
  promptVideoPlaybackTarget,
  resolveVideoPlaybackTargetSupport,
} from "../src/shared/media/playback-target.js";

test("resolveVideoPlaybackTargetSupport detects native playback pickers", () => {
  const video = {
    remote: { prompt() {} },
    webkitShowPlaybackTargetPicker() {},
  };

  assert.deepEqual(resolveVideoPlaybackTargetSupport(video), {
    cast: true,
    airplay: true,
  });
  assert.deepEqual(resolveVideoPlaybackTargetSupport({}), {
    cast: false,
    airplay: false,
  });
});

test("promptVideoPlaybackTarget opens the Cast remote playback picker", async () => {
  const calls = [];
  const remote = {
    prompt() {
      calls.push(this);
      return Promise.resolve();
    },
  };

  assert.equal(
    await promptVideoPlaybackTarget({ remote }, PLAYBACK_TARGET_CAST),
    true,
  );
  assert.deepEqual(calls, [remote]);
});

test("promptVideoPlaybackTarget enables and opens the AirPlay picker", async () => {
  const attributes = [];
  const video = {
    setAttribute(name, value) {
      attributes.push([name, value]);
    },
    webkitShowPlaybackTargetPicker() {
      assert.equal(this, video);
    },
  };

  assert.equal(
    await promptVideoPlaybackTarget(video, PLAYBACK_TARGET_AIRPLAY),
    true,
  );
  assert.deepEqual(attributes, [["x-webkit-airplay", "allow"]]);
});

test("promptVideoPlaybackTarget safely rejects unavailable targets", async () => {
  assert.equal(
    await promptVideoPlaybackTarget({}, PLAYBACK_TARGET_CAST),
    false,
  );
  assert.equal(
    await promptVideoPlaybackTarget({}, PLAYBACK_TARGET_AIRPLAY),
    false,
  );
  assert.equal(await promptVideoPlaybackTarget(null, PLAYBACK_TARGET_CAST), false);
});
