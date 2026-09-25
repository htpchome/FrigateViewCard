import { test } from "node:test";
import assert from "node:assert/strict";

import { PopupMediaPresentationController } from "../src/features/popup/media-presentation.ctrl.js";

test("popup media presentation attaches zoom to the viewer and reuses matching media", () => {
  const viewer = { id: "viewer" };
  const media = { id: "video", parentElement: { id: "parent" } };
  const calls = [];
  const zoomController = {
    video: media,
    refresh: () => calls.push("refresh"),
    dispose: () => calls.push("dispose"),
  };
  const onInteractionStart = () => {};
  const controller = new PopupMediaPresentationController({
    resolveViewer: () => viewer,
    onInteractionStart,
    attachZoom: (target, options) => {
      calls.push(["attach", target, options]);
      return zoomController;
    },
  });

  assert.equal(controller.attach(media), zoomController);
  assert.equal(controller.zoomController(), zoomController);
  assert.deepEqual(calls, [
    [
      "attach",
      media,
      {
        host: viewer,
        interactionTarget: viewer,
        nativeCoverPan: true,
        onInteractionStart,
      },
    ],
  ]);

  assert.equal(controller.attach(media), zoomController);
  assert.deepEqual(calls.slice(1), ["refresh"]);
});

test("popup media presentation replaces, refreshes, and clears zoom controllers", () => {
  const firstMedia = { id: "first", parentElement: { id: "first-parent" } };
  const secondMedia = { id: "second", parentElement: { id: "second-parent" } };
  const calls = [];
  const zoomControllers = new Map();
  const onInteractionStart = () => {};
  const controller = new PopupMediaPresentationController({
    resolveViewer: () => null,
    onInteractionStart,
    attachZoom: (media, options) => {
      calls.push(["attach", media, options]);
      const zoomController = {
        video: media,
        refresh: () => calls.push(["refresh", media]),
        dispose: () => calls.push(["dispose", media]),
      };
      zoomControllers.set(media, zoomController);
      return zoomController;
    },
  });

  controller.attach(firstMedia);
  assert.equal(controller.refreshVideo(secondMedia), false);
  assert.equal(controller.refreshVideo(firstMedia), true);
  controller.attach(secondMedia);
  assert.equal(controller.zoomController(), zoomControllers.get(secondMedia));
  controller.clear();
  assert.equal(controller.zoomController(), null);
  controller.dispose();

  assert.deepEqual(calls, [
    [
      "attach",
      firstMedia,
      {
        host: firstMedia.parentElement,
        interactionTarget: firstMedia,
        nativeCoverPan: true,
        onInteractionStart,
      },
    ],
    ["refresh", firstMedia],
    ["dispose", firstMedia],
    [
      "attach",
      secondMedia,
      {
        host: secondMedia.parentElement,
        interactionTarget: secondMedia,
        nativeCoverPan: true,
        onInteractionStart,
      },
    ],
    ["dispose", secondMedia],
  ]);
});
