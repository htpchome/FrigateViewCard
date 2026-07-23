import { test } from "node:test";
import assert from "node:assert/strict";

import {
  buildGo2rtcHlsCandidates,
  buildGo2rtcWsPath,
  getFreshCachedValue,
  isM3u8Response,
  makeGo2rtcCacheKey,
  setCachedValue,
  toAbsoluteSignedUrl,
  toWebSocketUrl,
} from "../src/live/live-url-provider.js";

test("makeGo2rtcCacheKey composes client and camera", () => {
  assert.equal(
    makeGo2rtcCacheKey({ clientId: "frigate", cam: "front" }),
    "frigate:front",
  );
});

test("buildGo2rtcWsPath URL-encodes client and camera", () => {
  const path = buildGo2rtcWsPath({ clientId: "frig ate", cam: "front/door" });
  assert.equal(path, "/api/frigate/frig%20ate/mse/api/ws?src=front%2Fdoor");
});

test("buildGo2rtcHlsCandidates returns expected ordered candidates", () => {
  const candidates = buildGo2rtcHlsCandidates({ clientId: "c", cam: "x" });
  assert.deepEqual(candidates, [
    "/api/frigate/c/hls/x/index.m3u8",
    "/api/frigate/c/live/x/index.m3u8",
    "/api/frigate/c/vod/x/index.m3u8",
  ]);
});

test("URL helpers convert signed and websocket URLs", () => {
  assert.equal(
    toAbsoluteSignedUrl({ signedPath: "/api/a", origin: "https://ha.local" }),
    "https://ha.local/api/a",
  );
  assert.equal(
    toAbsoluteSignedUrl({
      signedPath: "https://edge/a",
      origin: "https://ha.local",
    }),
    "https://edge/a",
  );
  assert.equal(toWebSocketUrl("https://ha.local/a"), "wss://ha.local/a");
});

test("cache helpers read and write with expiry", () => {
  const map = new Map();
  setCachedValue({
    cacheMap: map,
    cacheKey: "k",
    url: "u",
    ttlMs: 1000,
    nowMs: 5000,
  });
  assert.equal(
    getFreshCachedValue({ cacheMap: map, cacheKey: "k", nowMs: 5500 }),
    "u",
  );
  assert.equal(
    getFreshCachedValue({ cacheMap: map, cacheKey: "k", nowMs: 7001 }),
    undefined,
  );
});

test("isM3u8Response recognizes playlist responses", () => {
  assert.equal(
    isM3u8Response({ contentType: "application/vnd.apple.mpegurl", url: "" }),
    true,
  );
  assert.equal(
    isM3u8Response({ contentType: "text/plain", url: "https://x/index.m3u8" }),
    true,
  );
  assert.equal(
    isM3u8Response({ contentType: "text/plain", url: "https://x/index.mp4" }),
    false,
  );
});
