import { test } from "node:test";
import assert from "node:assert/strict";

import { TwoWayTalkControlsController } from "../src/features/two-way-talk/controls.ctrl.js";

const createClassList = () => {
  const values = new Set();
  return {
    values,
    toggle(name, enabled) {
      if (enabled) values.add(name);
      else values.delete(name);
    },
  };
};

const createElement = () => {
  const attributes = new Map();
  return {
    attributes,
    classList: createClassList(),
    disabled: false,
    hidden: false,
    innerHTML: "",
    style: {},
    setAttribute(name, value) {
      attributes.set(name, String(value));
    },
  };
};

test("two-way-talk controls synchronize active DOM state without rebuilding it", () => {
  const calls = [];
  const card = createElement();
  const button = createElement();
  const microphoneButton = createElement();
  const row = createElement();
  const host = {
    _$: (selector) => (selector === "#card" ? card : null),
    _syncTwoWayTalkActionSlot: () => calls.push("action-slot"),
    _syncMobileViewTwoWayTalkSlot: () => calls.push("mobile-slot"),
    _pageShellRegionElement: () => button,
    _shouldRenderTwoWayTalkButtonForActiveCamera: () => true,
    _twoWayTalkActiveForCurrentCamera: () => true,
    _twoWayTalkMicrophoneMutedForCurrentCamera: () => false,
    _dismissLinkedLightDimmers: () => calls.push("dismiss-lights"),
    _syncTwoWayTalkSoundwaveSurface: () => calls.push("soundwave"),
    _renderMuteButton: () => calls.push("mute"),
    _syncToolbarButtons: () => calls.push("toolbar"),
    _localization: { t: (key) => `localized:${key}` },
    shadowRoot: {
      querySelectorAll(selector) {
        if (selector === ".two-way-talk-control-row") return [row];
        if (selector === ".two-way-talk-microphone-mute-btn") {
          return [microphoneButton];
        }
        return [];
      },
    },
  };
  const controller = new TwoWayTalkControlsController(host, {
    icons: { micOn: "mic-on", micOff: "mic-off" },
    deviceProfile: { isDesktop: false },
  });

  controller.syncButton();

  assert.deepEqual(calls, [
    "action-slot",
    "mobile-slot",
    "dismiss-lights",
    "soundwave",
    "mute",
    "toolbar",
  ]);
  assert.equal(card.classList.values.has("two-way-talk-active"), true);
  assert.equal(row.classList.values.has("has-inline-mute"), true);
  assert.equal(button.classList.values.has("active"), true);
  assert.equal(button.attributes.get("aria-pressed"), "true");
  assert.equal(button.attributes.get("title"), "localized:runtime.twoWayTalk.disable");
  assert.equal(button.innerHTML, "mic-on");
  assert.equal(microphoneButton.hidden, false);
  assert.equal(microphoneButton.classList.values.has("talk-audio-active"), true);
  assert.equal(microphoneButton.attributes.get("aria-pressed"), "true");
  assert.equal(microphoneButton.innerHTML, "mic-on");
});

test("two-way-talk controls preserve existing action slots", () => {
  const slot = {
    hidden: true,
    innerHTML: "existing",
    querySelector: () => ({ id: "two-way-talk-btn" }),
  };
  const host = {
    _pageShellRegion: () => ({}),
    _pageShellRegionElement: () => slot,
    _buildTwoWayTalkInfoButtonMarkup: () => "replacement",
  };
  const controller = new TwoWayTalkControlsController(host);

  controller.syncActionSlot();

  assert.equal(slot.hidden, false);
  assert.equal(slot.innerHTML, "existing");
});

test("two-way-talk controls compose mobile route markup", () => {
  const host = {
    _pageId: "mobile-view",
    _shouldRenderTwoWayTalkButtonForActiveCamera: () => true,
    _buildTwoWayTalkButtonMarkup: () => '<button id="talk"></button>',
  };
  const controller = new TwoWayTalkControlsController(host);

  assert.match(
    controller.buildMobileButtonMarkup(),
    /id="mobile-view-two-way-talk-slot"[^>]*><button id="talk">/,
  );
  host._pageId = "single-view";
  assert.equal(controller.buildMobileButtonMarkup(), "");
});
