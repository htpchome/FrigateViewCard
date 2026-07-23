import { test } from "node:test";
import assert from "node:assert/strict";

import {
  createFallbackSourceResolversForCard,
  createFallbackSourceResolvers,
  getCachedEntityUrl,
  isAbsoluteOrDataUrl,
  loadFallbackAltForCard,
  loadFallbackPrimaryForCard,
  resolveFallbackSourceResolversForCard,
  resolveEntityPictureFallbackUrl,
  resolveSignedFallbackUrl,
  setCachedEntityUrl,
  toAbsoluteLocalUrl,
} from "../src/live/live-fallback-url.js";

test("isAbsoluteOrDataUrl detects absolute and data URLs", () => {
  assert.equal(isAbsoluteOrDataUrl("https://example.com/a.jpg"), true);
  assert.equal(isAbsoluteOrDataUrl("http://example.com/a.jpg"), true);
  assert.equal(isAbsoluteOrDataUrl("data:image/png;base64,abc"), true);
  assert.equal(isAbsoluteOrDataUrl("/api/camera_proxy/cam"), false);
});

test("toAbsoluteLocalUrl resolves relative URL against origin", () => {
  assert.equal(
    toAbsoluteLocalUrl({
      url: "/api/camera_proxy/camera.front",
      origin: "https://ha.local",
    }),
    "https://ha.local/api/camera_proxy/camera.front",
  );
});

test("cache helpers respect expiry", () => {
  const cacheMap = new Map();
  setCachedEntityUrl({
    cacheMap,
    entity: "camera.front",
    url: "https://ha.local/api/camera_proxy/camera.front",
    ttlMs: 1000,
    nowMs: 100,
  });

  assert.equal(
    getCachedEntityUrl({
      cacheMap,
      entity: "camera.front",
      nowMs: 500,
    }),
    "https://ha.local/api/camera_proxy/camera.front",
  );

  assert.equal(
    getCachedEntityUrl({
      cacheMap,
      entity: "camera.front",
      nowMs: 1500,
    }),
    "",
  );
});

test("resolveSignedFallbackUrl returns cached URL when fresh", async () => {
  const cacheMap = new Map([
    [
      "camera.front",
      {
        url: "https://ha.local/cached.jpg",
        exp: 500,
      },
    ],
  ]);

  const result = await resolveSignedFallbackUrl({
    entity: "camera.front",
    canCallWs: true,
    signedPathResolver: async () => "/should-not-be-used",
    cacheMap,
    nowMs: 100,
    origin: "https://ha.local",
  });

  assert.equal(result, "https://ha.local/cached.jpg");
});

test("resolveSignedFallbackUrl signs, absolutizes, and caches", async () => {
  const cacheMap = new Map();

  const result = await resolveSignedFallbackUrl({
    entity: "camera.front",
    canCallWs: true,
    signedPathResolver: async (path) => `${path}?token=abc`,
    cacheMap,
    nowMs: 100,
    origin: "https://ha.local",
    ttlMs: 1000,
  });

  assert.equal(
    result,
    "https://ha.local/api/camera_proxy/camera.front?token=abc",
  );
  assert.equal(
    cacheMap.get("camera.front")?.url,
    "https://ha.local/api/camera_proxy/camera.front?token=abc",
  );
  assert.equal(cacheMap.get("camera.front")?.exp, 1100);
});

test("resolveSignedFallbackUrl returns empty when entity/callWS unavailable", async () => {
  assert.equal(
    await resolveSignedFallbackUrl({
      entity: "",
      canCallWs: true,
      signedPathResolver: async () => "",
      cacheMap: new Map(),
      nowMs: 0,
      origin: "https://ha.local",
    }),
    "",
  );

  assert.equal(
    await resolveSignedFallbackUrl({
      entity: "camera.front",
      canCallWs: false,
      signedPathResolver: async () => "",
      cacheMap: new Map(),
      nowMs: 0,
      origin: "https://ha.local",
    }),
    "",
  );
});

test("resolveEntityPictureFallbackUrl resolves from hass state map", () => {
  const stateMap = {
    "camera.front": {
      attributes: {
        entity_picture: "/api/camera_proxy/camera.front?x=1",
      },
    },
  };

  assert.equal(
    resolveEntityPictureFallbackUrl({
      entity: "camera.front",
      stateMap,
      origin: "https://ha.local",
    }),
    "https://ha.local/api/camera_proxy/camera.front?x=1",
  );

  assert.equal(
    resolveEntityPictureFallbackUrl({
      entity: "camera.unknown",
      stateMap,
      origin: "https://ha.local",
    }),
    "",
  );
});

test("createFallbackSourceResolvers wires primary and alt loaders", async () => {
  const cacheMap = new Map();
  const stateMap = {
    "camera.front": {
      attributes: {
        entity_picture: "/api/camera_proxy/camera.front?x=2",
      },
    },
  };
  const resolvers = createFallbackSourceResolvers({
    canCallWs: true,
    signedPathResolver: async (path) => `${path}?token=abc`,
    cacheMap,
    stateMap,
    origin: "https://ha.local",
    ttlMs: 1000,
    nowMsProvider: () => 10,
  });

  const primary = await resolvers.loadPrimary("camera.front");
  const alt = resolvers.loadAlt("camera.front");

  assert.equal(
    primary,
    "https://ha.local/api/camera_proxy/camera.front?token=abc",
  );
  assert.equal(alt, "https://ha.local/api/camera_proxy/camera.front?x=2");
  assert.equal(
    cacheMap.get("camera.front")?.url,
    "https://ha.local/api/camera_proxy/camera.front?token=abc",
  );
  assert.equal(cacheMap.get("camera.front")?.exp, 1010);
});

test("createFallbackSourceResolvers primary loader returns empty when ws is unavailable", async () => {
  const resolvers = createFallbackSourceResolvers({
    canCallWs: false,
    signedPathResolver: async (path) => `${path}?token=abc`,
    cacheMap: new Map(),
    stateMap: {},
    origin: "https://ha.local",
  });

  const primary = await resolvers.loadPrimary("camera.front");
  assert.equal(primary, "");
});

test("createFallbackSourceResolversForCard maps card runtime to source resolvers", async () => {
  const cacheMap = new Map();
  const card = {
    _hass: {
      callWS: () => {},
      states: {
        "camera.front": {
          attributes: {
            entity_picture: "/api/camera_proxy/camera.front?x=3",
          },
        },
      },
    },
    _signed: async (path) => `${path}?token=abc`,
    _fallbackImgUrlCache: cacheMap,
  };

  const resolvers = createFallbackSourceResolversForCard({
    card,
    origin: "https://ha.local",
  });

  const primary = await resolvers.loadPrimary("camera.front");
  const alt = resolvers.loadAlt("camera.front");

  assert.equal(
    primary,
    "https://ha.local/api/camera_proxy/camera.front?token=abc",
  );
  assert.equal(alt, "https://ha.local/api/camera_proxy/camera.front?x=3");
  assert.equal(
    cacheMap.get("camera.front")?.url,
    "https://ha.local/api/camera_proxy/camera.front?token=abc",
  );
});

test("createFallbackSourceResolversForCard returns empty resolvers without card", async () => {
  const resolvers = createFallbackSourceResolversForCard({
    card: null,
    origin: "https://ha.local",
  });

  assert.equal(await resolvers.loadPrimary("camera.front"), "");
  assert.equal(resolvers.loadAlt("camera.front"), "");
});

test("resolveFallbackSourceResolversForCard returns reusable card resolvers", async () => {
  const card = {
    _hass: {
      callWS: () => {},
      states: {
        "camera.front": {
          attributes: {
            entity_picture: "/api/camera_proxy/camera.front?x=5",
          },
        },
      },
    },
    _signed: async (path) => `${path}?token=def`,
    _fallbackImgUrlCache: new Map(),
  };

  const resolvers = resolveFallbackSourceResolversForCard({
    card,
    origin: "https://ha.local",
  });

  const primary = await resolvers.loadPrimary("camera.front");
  const alt = resolvers.loadAlt("camera.front");

  assert.equal(
    primary,
    "https://ha.local/api/camera_proxy/camera.front?token=def",
  );
  assert.equal(alt, "https://ha.local/api/camera_proxy/camera.front?x=5");
});

test("loadFallbackPrimaryForCard resolves primary via card adapter", async () => {
  const card = {
    _hass: {
      callWS: () => {},
      states: {},
    },
    _signed: async (path) => `${path}?token=abc`,
    _fallbackImgUrlCache: new Map(),
  };

  const primary = await loadFallbackPrimaryForCard({
    card,
    entity: "camera.front",
    origin: "https://ha.local",
  });

  assert.equal(
    primary,
    "https://ha.local/api/camera_proxy/camera.front?token=abc",
  );
});

test("loadFallbackAltForCard resolves alt via card adapter", () => {
  const card = {
    _hass: {
      callWS: () => {},
      states: {
        "camera.front": {
          attributes: {
            entity_picture: "/api/camera_proxy/camera.front?x=4",
          },
        },
      },
    },
    _signed: async (path) => `${path}?token=abc`,
    _fallbackImgUrlCache: new Map(),
  };

  const alt = loadFallbackAltForCard({
    card,
    entity: "camera.front",
    origin: "https://ha.local",
  });

  assert.equal(alt, "https://ha.local/api/camera_proxy/camera.front?x=4");
});
