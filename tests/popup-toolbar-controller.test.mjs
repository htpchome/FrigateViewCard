import { test } from "node:test";
import assert from "node:assert/strict";

import { PopupToolbarController } from "../src/features/popup/toolbar.ctrl.js";

const createTarget = (match, node = {}) => ({
  closest: (selector) => (selector.includes(match) ? node : null),
});

const createHarness = () => {
  const calls = [];
  const viewerVideo = { id: "viewer-video" };
  const deepVideo = { id: "deep-video" };
  const popupBody = { id: "popup-body" };
  const viewer = {
    id: "viewer",
    closest: (selector) => (selector === ".popup-body" ? popupBody : null),
  };
  const controller = new PopupToolbarController({
    query: (selector) => (selector === "#viewer" ? viewer : null),
    getMediaVideo: () => viewerVideo,
    findVideoDeep: (root) => {
      calls.push(["findVideoDeep", root]);
      return deepVideo;
    },
    handleMediaControlClick: (target) => {
      calls.push(["handleMediaControlClick", target]);
      return target?.mediaControl === true;
    },
    onTakeSnapshot: () => calls.push(["takeSnapshot"]),
    onTogglePictureInPicture: (video) =>
      calls.push(["togglePictureInPicture", video]),
    onPromptAirPlay: (video) => calls.push(["promptAirPlay", video]),
    onToggleMute: () => calls.push(["toggleMute"]),
    onFullscreen: (target) => calls.push(["fullscreen", target]),
    onCarouselNavigate: (direction) =>
      calls.push(["carouselNavigate", direction]),
    onShowControls: () => calls.push(["showControls"]),
  });
  return { calls, controller, deepVideo, popupBody, viewer, viewerVideo };
};

test("popup toolbar controller handles snapshot and PiP actions", () => {
  const { calls, controller, viewerVideo } = createHarness();

  assert.equal(
    controller.handleClick(createTarget("#popup-take-snapshot-btn")),
    true,
  );
  assert.equal(controller.handleClick(createTarget("#popup-pip-btn")), true);

  assert.deepEqual(calls, [
    ["takeSnapshot"],
    ["togglePictureInPicture", viewerVideo],
    ["showControls"],
  ]);
});

test("popup toolbar controller resolves the displayed AirPlay video", () => {
  const { calls, controller, viewerVideo } = createHarness();

  assert.equal(
    controller.handleClick(createTarget("#popup-mobile-airplay-btn")),
    true,
  );

  assert.deepEqual(calls, [
    ["promptAirPlay", viewerVideo],
    ["showControls"],
  ]);
});

test("popup toolbar controller falls back to a deep viewer video for AirPlay", () => {
  const { calls, deepVideo, viewer } = createHarness();
  const controller = new PopupToolbarController({
    query: () => viewer,
    getMediaVideo: () => null,
    findVideoDeep: (root) => {
      calls.push(["findVideoDeep", root]);
      return deepVideo;
    },
    onPromptAirPlay: (video) => calls.push(["promptAirPlay", video]),
    onShowControls: () => calls.push(["showControls"]),
  });

  assert.equal(
    controller.handleClick(createTarget("#popup-airplay-btn")),
    true,
  );
  assert.deepEqual(calls, [
    ["findVideoDeep", viewer],
    ["promptAirPlay", deepVideo],
    ["showControls"],
  ]);
});

test("popup toolbar controller handles mute and custom media controls", () => {
  const { calls, controller } = createHarness();
  const mediaTarget = { mediaControl: true, closest: () => null };

  assert.equal(controller.handleClick(createTarget("#mute-btn")), true);
  assert.equal(controller.handleClick(mediaTarget), true);

  assert.deepEqual(calls, [
    ["toggleMute"],
    ["handleMediaControlClick", mediaTarget],
  ]);
});

test("popup toolbar controller handles fullscreen and carousel navigation", () => {
  const { calls, controller, popupBody } = createHarness();
  const fullscreenTarget = createTarget("#popup-mobile-fs-btn");

  assert.equal(controller.handleClick(fullscreenTarget), true);
  const carouselButton = { dataset: { carouselDir: "-1" } };
  const carouselTarget = createTarget(
    "[data-carousel-dir]",
    carouselButton,
  );
  assert.equal(
    controller.handleClick(carouselTarget),
    true,
  );

  assert.deepEqual(calls, [
    ["handleMediaControlClick", fullscreenTarget],
    ["fullscreen", popupBody],
    ["showControls"],
    ["handleMediaControlClick", carouselTarget],
    ["carouselNavigate", -1],
  ]);
});

test("popup toolbar controller ignores unrelated targets", () => {
  const { calls, controller } = createHarness();
  const target = { closest: () => null };

  assert.equal(controller.handleClick(target), false);
  assert.deepEqual(calls, [["handleMediaControlClick", target]]);
});
