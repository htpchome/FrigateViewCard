import { test } from "node:test";
import assert from "node:assert/strict";

import {
  bindCardGlobalEvents,
  bindCardShadowEvents,
} from "../src/card/event-bindings.js";
import { CARD_TAG } from "../src/constants.js";

class FakeEventTarget {
  constructor() {
    this.listeners = new Map();
  }

  addEventListener(type, listener, options) {
    this.listeners.set(type, { listener, options });
  }

  listener(type) {
    return this.listeners.get(type)?.listener;
  }
}

test("card Shadow DOM bindings preserve click, PTZ, and pointer ownership", () => {
  const calls = [];
  const shadowRoot = new FakeEventTarget();
  const card = {
    shadowRoot,
    _click: (event) => calls.push(["click", event]),
    _handleCirclePadPtzEvent: (event, phase) =>
      calls.push(["circle", phase, event]),
    _handlePtzControlPointerDown: (event) =>
      calls.push(["ptz-down", event]),
    _handlePtzControlPointerStop: (event) =>
      calls.push(["ptz-stop", event]),
    _mobileCamSwitcherController: {
      handlePointerDown: (event, target) =>
        calls.push(["switcher-down", event, target]),
      handlePointerUp: () => false,
      cancelPointer: () => calls.push(["switcher-cancel"]),
    },
    _linkedLightController: {
      handlePointerDown: () => false,
      handlePointerStop: (event) => calls.push(["light-stop", event]),
    },
  };

  bindCardShadowEvents(card);

  assert.deepEqual([...shadowRoot.listeners.keys()], [
    "click",
    "error",
    "circle-pad-press",
    "circle-pad-release",
    "pointerdown",
    "pointerup",
    "pointercancel",
    "lostpointercapture",
  ]);
  assert.equal(shadowRoot.listeners.get("error").options, true);

  const clickEvent = { type: "click" };
  shadowRoot.listener("click")(clickEvent);
  shadowRoot.listener("circle-pad-press")({ detail: "up" });
  shadowRoot.listener("circle-pad-release")({ detail: "up" });
  const pointerDownEvent = {
    type: "pointerdown",
    pointerType: "mouse",
    target: "control",
  };
  shadowRoot.listener("pointerdown")(pointerDownEvent);
  assert.equal(card._lastLiveOverlayPointerType, "mouse");
  assert.ok(calls.some(([name]) => name === "ptz-down"));

  const pointerCancelEvent = { type: "pointercancel" };
  shadowRoot.listener("pointercancel")(pointerCancelEvent);
  assert.ok(calls.some(([name]) => name === "switcher-cancel"));
  assert.ok(calls.some(([name]) => name === "light-stop"));
  assert.ok(calls.some(([name]) => name === "ptz-stop"));
});

test("global card bindings retain viewport, lifecycle, and preview behavior", () => {
  const calls = [];
  const documentTarget = new FakeEventTarget();
  documentTarget.visibilityState = "visible";
  documentTarget.fullscreenElement = "fullscreen-node";
  const visualViewport = new FakeEventTarget();
  visualViewport.width = 412.4;
  visualViewport.height = 731.6;
  const windowTarget = new FakeEventTarget();
  windowTarget.innerWidth = 400;
  windowTarget.innerHeight = 700;
  windowTarget.visualViewport = visualViewport;
  const card = {
    _lastViewportWidth: 0,
    _lastViewportHeight: 0,
    _mobileCamSwitcherOpen: true,
    _scheduleResumeLive: (reason) => calls.push(["resume", reason]),
    _stopPtzMotion: (reason) => calls.push(["stop-ptz", reason]),
    _handlePtzControlPointerStop: (event) =>
      calls.push(["pointer-stop", event]),
    _syncFullscreenButtonsVisibility: () => calls.push(["fullscreen-buttons"]),
    _syncBrowseHeadModeClass: () => calls.push(["browse-head"]),
    _applyCardStyle: () => calls.push(["card-style"]),
    _scheduleRotateOverlayUpdate: () => calls.push(["rotate-overlay"]),
    _applyEditorPreviewDraft: (config, routeIntent) =>
      calls.push(["preview-draft", config, routeIntent]),
    _wideViewPageController: {
      resumeCompanionMedia: () => calls.push(["resume-companions"]),
    },
    _popupPlaybackTargetController: {
      release: (target) => calls.push(["release", target]),
    },
    _liveFullscreenLifecycleController: {
      handleDocumentFullscreenChange: (element) =>
        calls.push(["fullscreen-change", element]),
    },
    _liveViewResizeController: {
      sync: () => calls.push(["resize-sync"]),
    },
    _linkedLightController: {
      handleDocumentPointerDown: (event) =>
        calls.push(["light-document", event]),
    },
    _browsePanelDismissController: {
      handleDocumentPointerDown: (event) =>
        calls.push(["dismiss-browse-panels", event]),
    },
    _mobileCamSwitcherController: {
      close: () => calls.push(["switcher-close"]),
    },
  };

  bindCardGlobalEvents(card, { documentTarget, windowTarget });

  assert.deepEqual([...documentTarget.listeners.keys()], [
    "visibilitychange",
    "fullscreenchange",
    "webkitfullscreenchange",
    "pointerdown",
  ]);
  assert.deepEqual([...windowTarget.listeners.keys()], [
    "blur",
    "pagehide",
    "pointerup",
    "pointercancel",
    "resize",
    "orientationchange",
    "frigate-view-card-preview-draft",
  ]);
  assert.deepEqual([...visualViewport.listeners.keys()], ["resize", "scroll"]);

  documentTarget.listener("visibilitychange")();
  assert.ok(calls.some(([name, reason]) => name === "resume" && reason === "doc-visible"));
  assert.ok(calls.some(([name]) => name === "resume-companions"));

  documentTarget.visibilityState = "hidden";
  documentTarget.listener("visibilitychange")();
  assert.ok(calls.some(([name, target]) => name === "release" && target === "popup"));
  assert.ok(calls.some(([name, reason]) => name === "stop-ptz" && reason === "document-hidden"));

  documentTarget.listener("fullscreenchange")();
  assert.ok(calls.some(([name, element]) => name === "fullscreen-change" && element === "fullscreen-node"));

  windowTarget.listener("resize")();
  assert.equal(card._lastViewportWidth, 412);
  assert.equal(card._lastViewportHeight, 732);
  assert.equal(calls.filter(([name]) => name === "card-style").length, 1);
  windowTarget.listener("resize")();
  assert.equal(calls.filter(([name]) => name === "card-style").length, 1);

  windowTarget.listener("frigate-view-card-preview-draft")({
    detail: { cardTag: "not-this-card", config: { title: "ignored" } },
  });
  windowTarget.listener("frigate-view-card-preview-draft")({
    detail: {
      cardTag: CARD_TAG,
      config: { title: "Draft" },
      routeIntent: "mobile",
    },
  });
  assert.deepEqual(
    calls.find(([name]) => name === "preview-draft"),
    ["preview-draft", { title: "Draft" }, "mobile"],
  );

  const pointerDown = { composedPath: () => [] };
  documentTarget.listener("pointerdown")(pointerDown);
  assert.ok(
    calls.some(
      ([name, event]) =>
        name === "dismiss-browse-panels" && event === pointerDown,
    ),
  );
  assert.ok(calls.some(([name]) => name === "switcher-close"));
});
