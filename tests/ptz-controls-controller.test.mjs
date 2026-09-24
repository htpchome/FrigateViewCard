import assert from "node:assert/strict";
import { test } from "node:test";

import {
  renderPtzControls,
  syncPtzControlsLabels,
} from "../src/features/ptz/controls.ctrl.js";

const translations = {
  "runtime.ptz.presets": "Camera presets",
  "runtime.ptz.presetsNote": "Camera preset note",
  "runtime.ptz.moveToPreset": "Move to {name}",
  "runtime.ptz.right": "Right localized",
  "runtime.ptz.down": "Down localized",
  "runtime.ptz.up": "Up localized",
  "runtime.ptz.left": "Left localized",
  "runtime.ptz.zoomOut": "Zoom out localized",
  "runtime.ptz.zoomIn": "Zoom in localized",
};

const translate = (key, values = {}) =>
  translations[key].replace(/\{([A-Za-z]+)\}/g, (_, name) => values[name]);

const createPad = () => {
  const labels = new Map();
  const buttons = new Map(
    ["right", "down", "up", "left", "zoom-out", "zoom-in"].map(
      (action) => [
        action,
        {
          getAttribute: () => labels.get(action),
          setAttribute: (_name, value) => labels.set(action, value),
        },
      ],
    ),
  );
  return {
    labels,
    pad: {
      shadowRoot: {
        querySelector: (selector) =>
          buttons.get(
            selector.match(/data-circle-pad-action="([^"]+)"/)?.[1],
          ),
      },
    },
  };
};

test("PTZ controls controller derives and renders current camera controls", () => {
  const calls = [];
  const { labels, pad } = createPad();
  const list = { id: "list" };
  let markup = "";
  const host = {
    _activeCam: { entity: "camera.driveway", ptz: true },
    _localization: { t: translate },
    _ptzCapabilityController: {
      ensureActiveInfo: () => calls.push("ensure"),
      activeInfo: () => ({ features: ["pt"], presets: ["Entry", "Home"] }),
    },
    _renderListLabel: () => calls.push("label"),
    _setListHtmlIfChanged: (target, html) => {
      calls.push("markup");
      assert.equal(target, list);
      markup = html;
    },
    _$: (selector) => {
      assert.equal(selector, "#controls-pad");
      return pad;
    },
  };

  renderPtzControls(host, list);

  assert.deepEqual(calls, ["ensure", "label", "markup"]);
  assert.doesNotMatch(markup, /disabled-actions=/);
  assert.match(markup, /data-ptz-preset="Entry"/);
  assert.match(markup, /is-home[^>]*data-ptz-preset="Home"/);
  assert.match(markup, /aria-label="Move to Entry"/);
  assert.equal(labels.get("up"), "Up localized");
  assert.equal(labels.get("zoom-in"), "Zoom in localized");
});

test("PTZ controls controller disables actions for an unconfigured camera", () => {
  let markup = "";
  const host = {
    _activeCam: { entity: "camera.driveway", ptz: false },
    _localization: { t: translate },
    _ptzCapabilityController: {
      ensureActiveInfo: () => null,
      activeInfo: () => ({ features: ["pt"], presets: ["Home"] }),
    },
    _renderListLabel() {},
    _setListHtmlIfChanged: (_list, html) => {
      markup = html;
    },
    _$: () => null,
  };

  renderPtzControls(host, {});

  assert.match(
    markup,
    /disabled-actions="up right down left zoom-in zoom-out"/,
  );
  assert.doesNotMatch(markup, /data-ptz-preset=/);
});

test("PTZ controls controller relocalizes the existing nested pad", () => {
  const { labels, pad } = createPad();
  const host = {
    _localization: { t: translate },
    _$: () => pad,
  };

  syncPtzControlsLabels(host);

  assert.deepEqual(Object.fromEntries(labels), {
    right: "Right localized",
    down: "Down localized",
    up: "Up localized",
    left: "Left localized",
    "zoom-out": "Zoom out localized",
    "zoom-in": "Zoom in localized",
  });
});
