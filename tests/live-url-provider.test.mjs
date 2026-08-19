import { test } from "node:test";
import assert from "node:assert/strict";

import {
  buildGo2rtcHlsCandidates,
  buildGo2rtcReceiverMp4Path,
  buildGo2rtcWsPath,
  makeGo2rtcCacheKey,
} from "../src/integrations/frigate/url.js";
import {
  getFreshCachedValue,
  isM3u8Response,
  isM3u8Url,
  requiresNestedSignedHlsRequests,
  rewriteM3u8Manifest,
  setCachedValue,
  toAbsoluteSignedUrl,
  toWebSocketUrl,
} from "../src/shared/media/url-utils.js";

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

test("buildGo2rtcHlsCandidates returns the supported HA go2rtc HLS candidate", () => {
  const candidates = buildGo2rtcHlsCandidates({ clientId: "c", cam: "x" });
  assert.deepEqual(candidates, [
    "/api/frigate/c/go2rtc/api/stream.m3u8?src=x&mp4",
  ]);
});

test("buildGo2rtcReceiverMp4Path selects receiver-safe H264 and AAC", () => {
  assert.equal(
    buildGo2rtcReceiverMp4Path({
      clientId: "frig ate",
      cam: "front/door",
    }),
    "/api/frigate/frig%20ate/go2rtc/api/stream.mp4?src=front%2Fdoor&video=h264&audio=aac",
  );
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

test("requiresNestedSignedHlsRequests detects signed HA manifest paths", () => {
  assert.equal(
    requiresNestedSignedHlsRequests({
      rawPath: "/api/frigate/frigate/go2rtc/api/stream.m3u8?src=front&mp4",
      signedPath:
        "/api/frigate/frigate/go2rtc/api/stream.m3u8?src=front&mp4&authSig=abc",
    }),
    true,
  );
  assert.equal(
    requiresNestedSignedHlsRequests({
      rawPath: "/api/frigate/frigate/go2rtc/api/stream.m3u8?src=front&mp4",
      signedPath: "/api/frigate/frigate/go2rtc/api/stream.m3u8?src=front&mp4",
    }),
    false,
  );
});

test("isM3u8Url recognizes playlist URLs", () => {
  assert.equal(isM3u8Url("https://ha.local/a/master.m3u8"), true);
  assert.equal(isM3u8Url("https://ha.local/a/video.mp4"), false);
});

test("rewriteM3u8Manifest rewrites line and attribute URIs", async () => {
  const manifest = [
    "#EXTM3U",
    '#EXT-X-KEY:METHOD=AES-128,URI="key.bin"',
    "media/playlist.m3u8?id=abc",
    "#EXTINF:2.0,",
    "segment.ts?part=1",
  ].join("\n");

  const rewritten = await rewriteM3u8Manifest({
    manifestText: manifest,
    rewriteUri: async (uri) => `signed:${uri}`,
  });

  assert.equal(
    rewritten,
    [
      "#EXTM3U",
      '#EXT-X-KEY:METHOD=AES-128,URI="signed:key.bin"',
      "signed:media/playlist.m3u8?id=abc",
      "#EXTINF:2.0,",
      "signed:segment.ts?part=1",
    ].join("\n"),
  );
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
