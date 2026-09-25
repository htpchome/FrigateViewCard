import assert from "node:assert/strict";
import { test } from "node:test";

import { PopupPlaybackTargetController } from "../src/features/popup/playback-target.ctrl.js";

const createButton = ({ title = "", translationKey = "" } = {}) => {
  const attributes = new Map();
  if (translationKey) {
    attributes.set("data-fvc-i18n-title", translationKey);
  }
  return {
    dataset: {},
    disabled: false,
    hidden: false,
    title,
    getAttribute: (name) => attributes.get(name) || "",
    setAttribute: (name, value) => attributes.set(name, value),
    attribute: (name) => attributes.get(name),
  };
};

test("popup playback target forwards current media state to its receiver context builder", () => {
  let mediaType = "clip";
  let playing = {
    id: "event-1",
    eventRecordingStart: 101,
    eventRecordingEnd: 205,
  };
  let recordingRange = null;
  const contextInputs = [];
  const controller = new PopupPlaybackTargetController({
    getActiveContext: () => ({ clientId: "frigate", cam: "front" }),
    getMediaType: () => mediaType,
    getPlaying: () => playing,
    getRecordingRange: () => recordingRange,
    findEventById: () => ({
      camera: "front_door",
      start_time: 100.2,
      end_time: 205.8,
    }),
    buildContext: (options) => {
      contextInputs.push(options);
      return { resolved: options.mediaType };
    },
    formatTitle: (type) => `title:${type}`,
    createTargetController: () => ({}),
  });

  assert.deepEqual(controller.context("popup"), { resolved: "clip" });
  assert.deepEqual(contextInputs[0], {
    scope: "popup",
    activeContext: { clientId: "frigate", cam: "front" },
    mediaType: "clip",
    playing: {
      id: "event-1",
      eventRecordingStart: 101,
      eventRecordingEnd: 205,
    },
    event: {
      camera: "front_door",
      start_time: 100.2,
      end_time: 205.8,
    },
    recordingRange: null,
    title: "title:clip",
  });
  assert.equal(controller.context("live"), null);

  mediaType = "recording";
  playing = { rec: 300 };
  recordingRange = { start: 320, end: 380 };
  assert.deepEqual(controller.context("popup"), {
    resolved: "recording",
  });
  assert.deepEqual(contextInputs[1], {
    scope: "popup",
    activeContext: { clientId: "frigate", cam: "front" },
    mediaType: "recording",
    playing: { rec: 300 },
    event: null,
    recordingRange: { start: 320, end: 380 },
    title: "title:recording",
  });
});

test("popup playback target owns preparation, controls, prompting, and teardown", async () => {
  const calls = [];
  const translatedButton = createButton({
    translationKey: "runtime.popup.airplayVideo",
  });
  const fallbackButton = createButton({ title: "Send video" });
  let mediaType = "snapshot";
  let supported = true;
  let targetOptions;
  const targetController = {
    dispose: () => calls.push(["dispose"]),
    getSupport: (scope) => {
      calls.push(["support", scope]);
      return { airplay: supported };
    },
    observe: (...args) => calls.push(["observe", ...args]),
    prepare: (...args) => calls.push(["prepare", ...args]),
    prompt: (...args) => {
      calls.push(["prompt", ...args]);
      return Promise.resolve("prompted");
    },
    release: (...args) => calls.push(["release", ...args]),
  };
  const controller = new PopupPlaybackTargetController({
    getMediaType: () => mediaType,
    getDisplayedVideo: () => "displayed-video",
    queryAll: () => [translatedButton, fallbackButton],
    translate: (key) => `translated:${key}`,
    isVideoMediaType: (type) => type === "clip",
    createTargetController: (options) => {
      targetOptions = options;
      return targetController;
    },
  });

  assert.equal(controller.prepare(), false);
  assert.deepEqual(calls, []);

  mediaType = "clip";
  assert.equal(controller.prepare(), true);
  assert.deepEqual(calls, [
    ["observe", "popup", "displayed-video"],
    ["prepare", "popup"],
    ["support", "popup"],
  ]);
  assert.equal(translatedButton.title, "translated:runtime.popup.airplayVideo");
  assert.equal(translatedButton.hidden, false);
  assert.equal(translatedButton.disabled, false);
  assert.equal(translatedButton.attribute("aria-hidden"), "false");
  assert.equal(fallbackButton.title, "Send video");

  supported = false;
  targetOptions.onSupportChange();
  assert.equal(translatedButton.hidden, true);
  assert.equal(translatedButton.disabled, true);
  assert.equal(translatedButton.attribute("aria-hidden"), "true");

  assert.equal(await controller.promptAirPlay("active-video"), "prompted");
  controller.release("popup");
  controller.dispose();
  assert.deepEqual(calls.slice(-3), [
    [
      "prompt",
      "airplay",
      { scope: "popup", displayedVideo: "active-video" },
    ],
    ["release", "popup"],
    ["dispose"],
  ]);
});
