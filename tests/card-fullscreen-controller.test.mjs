import assert from "node:assert/strict";
import { test } from "node:test";

import { CardFullscreenController } from "../src/card/fullscreen.ctrl.js";

test("card fullscreen controller resolves the live target and preserves lifecycle callbacks", () => {
  const calls = [];
  const liveStage = { name: "live-stage" };
  const fullscreenTarget = { name: "card-root" };
  const engineHost = { name: "engine-host" };
  const liveVideo = { name: "live-video" };
  let requestOptions;
  const host = {
    _cardViewPageController: {
      liveFullscreenTarget: () => fullscreenTarget,
    },
    _engine: null,
    _liveFullscreenLifecycleController: {
      beginDocumentFullscreen: (video) =>
        calls.push(["begin-document", video]),
      beginNativeVideoFullscreen: (video) =>
        calls.push(["begin-native", video]),
      cancel: () => calls.push(["cancel"]),
    },
    _$: (selector) =>
      selector === "#live-stage" ? liveStage : engineHost,
  };
  const controller = new CardFullscreenController(host, {
    findFullscreenMedia: () => null,
    findNestedVideo: (root) =>
      root === engineHost ? liveVideo : null,
    requestFullscreen: (options) => {
      requestOptions = options;
      return true;
    },
  });

  assert.equal(controller.requestLive(), true);
  assert.equal(requestOptions.element, fullscreenTarget);
  assert.equal(requestOptions.video, liveVideo);
  assert.equal(requestOptions.preferElementFullscreen, true);
  requestOptions.onBeginNativeVideoFullscreen(liveVideo);
  requestOptions.onBeginDocumentFullscreen(liveVideo);
  requestOptions.onRequestFailure();
  assert.deepEqual(calls, [
    ["begin-native", liveVideo],
    ["begin-document", liveVideo],
    ["cancel"],
  ]);

  const popupVideo = { name: "popup-video" };
  assert.equal(
    controller.request(popupVideo, { preferLive: false }),
    true,
  );
  requestOptions.onBeginNativeVideoFullscreen(popupVideo);
  requestOptions.onBeginDocumentFullscreen(popupVideo);
  assert.equal(requestOptions.onRequestFailure, null);
  assert.equal(calls.length, 3);
});

test("card fullscreen controller synchronizes live and popup controls", () => {
  const liveButton = {};
  const popupControlsButton = {};
  const popupMobileButton = {};
  const popup = { classList: { contains: () => true } };
  const visibility = {
    liveButtonHidden: true,
    popupControlsFullscreenHidden: false,
    popupMobileFullscreenHidden: true,
  };
  let visibilityContext;
  let snapshotSyncs = 0;
  const host = {
    _pageId: "mobile",
    _viewMode: "single",
    _isMobileTabletViewport: () => true,
    _syncTakeSnapshotButtonVisibility: () => {
      snapshotSyncs += 1;
    },
    _$: (selector) =>
      new Map([
        ["#live-fs-btn", liveButton],
        ["#popup-media-fs", popupControlsButton],
        ["#popup-mobile-fs-btn", popupMobileButton],
        ["#myPopup", popup],
      ]).get(selector) || null,
  };
  const controller = new CardFullscreenController(host, {
    getDocument: () => ({ fullscreenElement: {} }),
    resolveButtonVisibility: (context) => {
      visibilityContext = context;
      return visibility;
    },
  });

  assert.equal(controller.syncButtonVisibility(), visibility);
  assert.deepEqual(visibilityContext, {
    popupOpen: true,
    isFullscreen: true,
    inGridMode: false,
    isMobileTabletViewport: true,
    showLiveFullscreenOnMobile: true,
  });
  assert.equal(liveButton.hidden, true);
  assert.equal(popupControlsButton.hidden, false);
  assert.equal(popupMobileButton.hidden, true);
  assert.equal(snapshotSyncs, 1);
});

test("card fullscreen controller delegates discovery and document exit", () => {
  const calls = [];
  const ownerDocument = { name: "owner-document" };
  const host = { ownerDocument };
  const controller = new CardFullscreenController(host, {
    exitFullscreen: (documentTarget) => {
      calls.push(["exit", documentTarget]);
      return true;
    },
    findFullscreenMedia: (element) => ({ element }),
    findNestedVideo: (root, maxDepth) => ({ root, maxDepth }),
  });

  assert.deepEqual(controller.findFullscreenVideo("surface"), {
    element: "surface",
  });
  assert.deepEqual(controller.findVideoDeep("root", 4), {
    root: "root",
    maxDepth: 4,
  });
  assert.equal(controller.exit(), true);
  assert.deepEqual(calls, [["exit", ownerDocument]]);
});
