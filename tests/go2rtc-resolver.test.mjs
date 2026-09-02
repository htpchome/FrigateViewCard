import { test } from "node:test";
import assert from "node:assert/strict";

import { createGo2RtcResolver } from "../src/integrations/frigate/go2rtc-resolver.js";

function createResolverHarness(options = {}) {
  const camCache = options.camCache || {};
  const calls = {
    signPath: 0,
    fetch: 0,
  };
  const hass = {
    callWS: async (msg) => {
      calls.signPath += 1;
      return options.callWSResult?.(msg) || { path: msg.path };
    },
  };

  const resolver = createGo2RtcResolver({
    getHass: () => hass,
    getConfig: () =>
      options.config || {
        cameras: [
          { entity: "camera.front", connection_type: "frigate_go2rtc" },
        ],
      },
    getActiveEntity: () => options.activeEntity || "camera.front",
    getCamCache: () => camCache,
    defaultConnectionType: "frigate_go2rtc",
    normalizeCameraConnectionType: (value) => value || "frigate_go2rtc",
    createCameraState: () => ({ clientId: "", cam: "", discovered: false }),
    discoverEntity: async (entity) => {
      if (!camCache[entity]) {
        camCache[entity] = {
          clientId: "frigate",
          cam: entity.replace(/^camera\./, ""),
          discovered: true,
        };
      }
    },
    supportsNativeHlsPlayback: () => options.supportsNativeHlsPlayback ?? true,
    getOrigin: () => "https://ha.local",
    getNowMs: () => options.nowMs || 1000,
    fetchImpl: async (url, init) => {
      calls.fetch += 1;
      return (
        options.fetchResult?.(url, init) || {
          ok: true,
          headers: { get: () => "application/vnd.apple.mpegurl" },
          text: async () => "#EXTM3U\n#EXTINF:2.0,\nsegment.ts",
        }
      );
    },
  });

  return { resolver, calls };
}

test("go2rtc resolver mount request honors HA direct camera policy", () => {
  const { resolver } = createResolverHarness({
    config: {
      cameras: [{ entity: "camera.front", connection_type: "ha_direct" }],
    },
    activeEntity: "camera.front",
  });

  assert.deepEqual(resolver.resolveMountRequest({ entity: "camera.front" }), {
    entity: "",
    abortSignal: null,
    commit: true,
  });
});

test("go2rtc resolver caches websocket URLs per camera", async () => {
  const { resolver, calls } = createResolverHarness({
    callWSResult: (msg) => ({ path: `${msg.path}&authSig=abc` }),
  });

  const first = await resolver.websocketUrlForEntity("camera.front");
  const second = await resolver.websocketUrlForEntity("camera.front");

  assert.equal(
    first,
    "wss://ha.local/api/frigate/frigate/mse/api/ws?src=front&authSig=abc",
  );
  assert.equal(second, first);
  assert.equal(calls.signPath, 1);
});

test("go2rtc resolver caches HLS playlist URLs", async () => {
  const { resolver, calls } = createResolverHarness();

  const first = await resolver.hlsUrlForEntity("camera.front");
  const second = await resolver.hlsUrlForEntity("camera.front");

  assert.deepEqual(first, {
    url: "https://ha.local/api/frigate/frigate/go2rtc/api/stream.m3u8?src=front&mp4",
    cacheable: true,
    destroy: null,
  });
  assert.deepEqual(second, {
    url: "https://ha.local/api/frigate/frigate/go2rtc/api/stream.m3u8?src=front&mp4",
    destroy: null,
  });
  assert.equal(calls.fetch, 1);
});

test("go2rtc resolver rejects and negative-caches signed native HLS", async () => {
  const { resolver, calls } = createResolverHarness({
    callWSResult: (msg) => ({ path: `${msg.path}&authSig=abc` }),
  });

  const first = await resolver.hlsUrlForEntity("camera.front");
  const second = await resolver.hlsUrlForEntity("camera.front");

  assert.equal(first, null);
  assert.equal(second, null);
  assert.equal(calls.signPath, 1);
  assert.equal(calls.fetch, 0);
});
