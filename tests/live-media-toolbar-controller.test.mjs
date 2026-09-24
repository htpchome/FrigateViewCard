import assert from "node:assert/strict";
import { test } from "node:test";

import { LiveMediaToolbarController } from "../src/features/live/media-toolbar.ctrl.js";

const createTarget = (matchingSelector = "") => ({
  closest: (selector) => (selector === matchingSelector ? {} : null),
});

test("live media toolbar controller handles PiP, snapshot, and fullscreen", () => {
  const calls = [];
  const controller = new LiveMediaToolbarController({
    onTogglePictureInPicture: () => calls.push("pip"),
    onTakeSnapshot: () => calls.push("snapshot"),
    onFullscreen: () => calls.push("fullscreen"),
  });

  assert.equal(controller.handleClick(createTarget("#live-pip-btn")), true);
  assert.equal(
    controller.handleClick(createTarget("#live-take-snapshot-btn")),
    true,
  );
  assert.equal(controller.handleClick(createTarget("#live-fs-btn")), true);
  assert.deepEqual(calls, ["pip", "snapshot", "fullscreen"]);
});

test("live media toolbar controller ignores unrelated targets", () => {
  const calls = [];
  const controller = new LiveMediaToolbarController({
    onTogglePictureInPicture: () => calls.push("pip"),
    onTakeSnapshot: () => calls.push("snapshot"),
    onFullscreen: () => calls.push("fullscreen"),
  });

  assert.equal(controller.handleClick(createTarget()), false);
  assert.equal(controller.handleClick(null), false);
  assert.deepEqual(calls, []);
});
