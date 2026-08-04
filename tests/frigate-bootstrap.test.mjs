import { test } from "node:test";
import assert from "node:assert/strict";

import {
  buildGo2RtcHlsProbeResult,
  rewriteSignedHlsManifestSource,
  signSameOriginAbsoluteUrl,
} from "../src/integrations/frigate/bootstrap.js";

test("signSameOriginAbsoluteUrl signs only same-origin URLs", async () => {
  const calls = [];
  const hass = {
    callWS: async (msg) => {
      calls.push(msg);
      return { path: `${msg.path}&authSig=abc` };
    },
  };

  const signed = await signSameOriginAbsoluteUrl({
    hass,
    url: "https://ha.local/api/frigate/x?src=front",
    origin: "https://ha.local",
  });
  const external = await signSameOriginAbsoluteUrl({
    hass,
    url: "https://edge.local/api/frigate/x?src=front",
    origin: "https://ha.local",
  });

  assert.equal(signed, "https://ha.local/api/frigate/x?src=front&authSig=abc");
  assert.equal(external, "https://edge.local/api/frigate/x?src=front");
  assert.deepEqual(calls, [
    {
      type: "auth/sign_path",
      path: "/api/frigate/x?src=front",
      expires: 3600,
    },
  ]);
});

test("rewriteSignedHlsManifestSource signs nested playlist and segment URLs", async () => {
  const manifests = new Map([
    [
      "https://ha.local/master.m3u8?authSig=top",
      ["#EXTM3U", "nested.m3u8", "#EXTINF:2.0,", "segment.ts"].join("\n"),
    ],
    [
      "https://ha.local/nested.m3u8?authSig=signed",
      ["#EXTM3U", "#EXTINF:2.0,", "nested-segment.ts"].join("\n"),
    ],
  ]);
  const signedUrls = [];
  const createdBlobs = [];
  const originalCreateObjectURL = URL.createObjectURL;
  URL.createObjectURL = (blob) => {
    createdBlobs.push(blob);
    return `blob:${createdBlobs.length}`;
  };

  try {
    const blobUrls = [];
    const rewrittenUrl = await rewriteSignedHlsManifestSource({
      manifestUrl: "https://ha.local/master.m3u8?authSig=top",
      blobUrls,
      signAbsoluteUrl: async (url) => {
        signedUrls.push(url);
        return `${url}${url.includes("?") ? "&" : "?"}authSig=signed`;
      },
      fetchImpl: async (url) => ({
        ok: true,
        text: async () => manifests.get(url) || "",
      }),
    });

    assert.equal(rewrittenUrl, "blob:2");
    assert.deepEqual(blobUrls, ["blob:1", "blob:2"]);
    assert.deepEqual(signedUrls, [
      "https://ha.local/nested.m3u8",
      "https://ha.local/nested-segment.ts",
      "https://ha.local/segment.ts",
    ]);

    const nestedText = await createdBlobs[0].text();
    const topText = await createdBlobs[1].text();
    assert.equal(
      nestedText,
      [
        "#EXTM3U",
        "#EXTINF:2.0,",
        "https://ha.local/nested-segment.ts?authSig=signed",
      ].join("\n"),
    );
    assert.equal(
      topText,
      [
        "#EXTM3U",
        "blob:1",
        "#EXTINF:2.0,",
        "https://ha.local/segment.ts?authSig=signed",
      ].join("\n"),
    );
  } finally {
    URL.createObjectURL = originalCreateObjectURL;
  }
});

test("buildGo2RtcHlsProbeResult returns cacheable URL when nested signing is not needed", async () => {
  const result = await buildGo2RtcHlsProbeResult({
    rawPath: "/api/frigate/a/go2rtc/api/stream.m3u8?src=front&mp4",
    signedPath: "/api/frigate/a/go2rtc/api/stream.m3u8?src=front&mp4",
    manifestUrl: "https://ha.local/stream.m3u8",
    rewriteManifestSource: async () => {
      throw new Error("should not rewrite");
    },
  });

  assert.deepEqual(result, {
    url: "https://ha.local/stream.m3u8",
    cacheable: true,
    destroy: null,
  });
});

test("buildGo2RtcHlsProbeResult rewrites nested signed manifests and cleans up blobs", async () => {
  const revoked = [];
  const result = await buildGo2RtcHlsProbeResult({
    rawPath: "/api/frigate/a/go2rtc/api/stream.m3u8?src=front&mp4",
    signedPath:
      "/api/frigate/a/go2rtc/api/stream.m3u8?src=front&mp4&authSig=abc",
    manifestUrl: "https://ha.local/stream.m3u8?authSig=abc",
    rewriteManifestSource: async (_, blobUrls) => {
      blobUrls.push("blob:1", "blob:2");
      return "blob:final";
    },
    revokeObjectUrl: (url) => revoked.push(url),
  });

  assert.equal(result.url, "blob:final");
  assert.equal(result.cacheable, false);
  result.destroy();
  assert.deepEqual(revoked, ["blob:1", "blob:2"]);
});
