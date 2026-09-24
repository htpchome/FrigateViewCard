import { test } from "node:test";
import assert from "node:assert/strict";

import {
  getLiveFallbackController,
  LiveFallbackController,
} from "../src/features/live/fallbacks/fallback.ctrl.js";

const createHost = () => ({
  _activeCam: { entity: "camera.front" },
  _activeGroupMemberOverride: "",
  _fallbackImgUrlCache: new Map(),
  _fallbackOrigin: "",
  _fallbackReqId: 0,
  _hass: {
    callWS: () => {},
    states: {
      "camera.front": {
        attributes: {
          entity_picture: "/api/camera_proxy/camera.front?fallback=1",
        },
      },
    },
  },
  _localization: {
    t: (key, values = {}) =>
      key === "runtime.live.entitySnapshot"
        ? `${values.entity} localized snapshot`
        : key,
  },
  _signed: async (path) => `${path}?token=abc`,
});

test("live fallback controller resolves and retains the browser origin", () => {
  const host = createHost();
  const controller = new LiveFallbackController(host, {
    getOrigin: () => "https://ha.local",
  });

  assert.equal(controller.originForAdapters(), "https://ha.local");
  assert.equal(host._fallbackOrigin, "https://ha.local");
});

test("live fallback controller resolves primary and alternate sources", async () => {
  const host = createHost();
  const controller = new LiveFallbackController(host, {
    getOrigin: () => "https://ha.local",
  });

  assert.equal(
    await controller.loadPrimary("camera.front"),
    "https://ha.local/api/camera_proxy/camera.front?token=abc",
  );
  assert.equal(
    controller.loadAlternate("camera.front"),
    "https://ha.local/api/camera_proxy/camera.front?fallback=1",
  );
  assert.equal(
    host._fallbackImgUrlCache.get("camera.front")?.url,
    "https://ha.local/api/camera_proxy/camera.front?token=abc",
  );
});

test("live fallback controller refreshes the active snapshot surface", async () => {
  const host = createHost();
  const attributes = new Map();
  const image = {
    alt: "",
    dataset: {},
    hidden: true,
    naturalHeight: 1080,
    naturalWidth: 1920,
    parentElement: {
      clientHeight: 360,
      clientWidth: 640,
    },
    src: "",
    style: {},
    setAttribute(name, value) {
      attributes.set(name, String(value));
    },
    removeAttribute(name) {
      attributes.delete(name);
    },
  };
  const status = { hidden: false };
  host.shadowRoot = {
    querySelector(selector) {
      if (selector === "#stream-fallback-img") return image;
      if (selector === "#stream-fallback-status") return status;
      return null;
    },
  };
  const controller = new LiveFallbackController(host, {
    getOrigin: () => "https://ha.local",
  });
  host._streamFallbackUrl = (entity) => controller.loadPrimary(entity);
  host._streamFallbackAltUrl = (entity) => controller.loadAlternate(entity);

  const result = await controller.refreshImage();

  assert.deepEqual(result, { shouldAbort: false, didWrite: true });
  assert.equal(host._fallbackReqId, 1);
  assert.equal(image.hidden, false);
  assert.equal(
    image.src,
    "https://ha.local/api/camera_proxy/camera.front?token=abc",
  );
  assert.equal(image.dataset.fallbackEntity, "camera.front");
  assert.equal(image.alt, "camera.front localized snapshot");
  assert.equal(
    attributes.get("data-fvc-i18n-alt"),
    "runtime.live.entitySnapshot",
  );
  assert.equal(status.hidden, true);
});

test("live fallback controller getter preserves an existing controller", () => {
  const host = createHost();
  const controller = new LiveFallbackController(host, {
    getOrigin: () => "https://ha.local",
  });
  host._liveFallbackController = controller;

  assert.equal(getLiveFallbackController(host), controller);
});
