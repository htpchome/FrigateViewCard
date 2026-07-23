import { test } from "node:test";
import assert from "node:assert/strict";

import {
  beginFallbackRefresh,
  buildFallbackImageApplyPayload,
  buildFallbackRefreshOutcome,
  canRefreshFallbackImage,
  getFallbackRefreshElements,
  issueFallbackRefreshToken,
  isFallbackRefreshStale,
  loadPrimaryFallbackSource,
  nextFallbackRequestId,
  resolveAltFallbackSource,
  resolveFallbackRefreshEntity,
  resolveFallbackRefreshSources,
  shouldAbortStaleFallbackRefresh,
  shouldApplyFallbackRefreshSources,
} from "../src/live/live-fallback-refresh.js";

test("nextFallbackRequestId increments from current id", () => {
  assert.equal(nextFallbackRequestId(0), 1);
  assert.equal(nextFallbackRequestId(4), 5);
  assert.equal(nextFallbackRequestId(undefined), 1);
});

test("beginFallbackRefresh aborts when image element is missing", () => {
  const begin = beginFallbackRefresh({
    imgEl: null,
    currentRequestId: 2,
  });
  assert.equal(begin.shouldAbort, true);
  assert.equal(begin.token, null);
});

test("beginFallbackRefresh issues token when image element exists", () => {
  const begin = beginFallbackRefresh({
    imgEl: { id: "img" },
    currentRequestId: 2,
  });
  assert.equal(begin.shouldAbort, false);
  assert.equal(begin.token?.requestId, 3);
  assert.equal(begin.token?.nextRequestId, 3);
});

test("issueFallbackRefreshToken returns request and next ids", () => {
  const token = issueFallbackRefreshToken({
    currentRequestId: 7,
  });
  assert.equal(token.requestId, 8);
  assert.equal(token.nextRequestId, 8);
});

test("isFallbackRefreshStale checks request id equality", () => {
  assert.equal(
    isFallbackRefreshStale({
      requestId: 2,
      activeRequestId: 2,
    }),
    false,
  );
  assert.equal(
    isFallbackRefreshStale({
      requestId: 2,
      activeRequestId: 3,
    }),
    true,
  );
});

test("shouldAbortStaleFallbackRefresh mirrors stale check", () => {
  assert.equal(
    shouldAbortStaleFallbackRefresh({
      requestId: 2,
      activeRequestId: 2,
    }),
    false,
  );
  assert.equal(
    shouldAbortStaleFallbackRefresh({
      requestId: 2,
      activeRequestId: 3,
    }),
    true,
  );
});

test("getFallbackRefreshElements resolves fallback image and status elements", () => {
  const imgEl = { id: "img" };
  const statusEl = { id: "status" };
  const shadowRoot = {
    querySelector: (selector) => {
      if (selector === "#stream-fallback-img") return imgEl;
      if (selector === "#stream-fallback-status") return statusEl;
      return null;
    },
  };

  const resolved = getFallbackRefreshElements(shadowRoot);
  assert.equal(resolved.imgEl, imgEl);
  assert.equal(resolved.statusEl, statusEl);
});

test("canRefreshFallbackImage requires an image element", () => {
  assert.equal(canRefreshFallbackImage({ imgEl: { id: "img" } }), true);
  assert.equal(canRefreshFallbackImage({ imgEl: null }), false);
});

test("resolveFallbackRefreshEntity normalizes active camera entity", () => {
  assert.equal(
    resolveFallbackRefreshEntity({ entity: "camera.front" }),
    "camera.front",
  );
  assert.equal(
    resolveFallbackRefreshEntity({ entity: "  camera.front  " }),
    "camera.front",
  );
  assert.equal(resolveFallbackRefreshEntity({}), "");
});

test("loadPrimaryFallbackSource loads source only for valid entity", async () => {
  let calledWith = "";
  const loaded = await loadPrimaryFallbackSource({
    entity: "camera.front",
    loadPrimary: async (entity) => {
      calledWith = entity;
      return "https://ha.local/primary.jpg";
    },
  });
  assert.equal(calledWith, "camera.front");
  assert.equal(loaded, "https://ha.local/primary.jpg");

  const skipped = await loadPrimaryFallbackSource({
    entity: "",
    loadPrimary: async () => "should-not-run",
  });
  assert.equal(skipped, "");
});

test("resolveAltFallbackSource resolves alt only for valid entity", () => {
  let calledWith = "";
  const alt = resolveAltFallbackSource({
    entity: "camera.front",
    loadAlt: (entity) => {
      calledWith = entity;
      return "https://ha.local/alt.jpg";
    },
  });

  assert.equal(calledWith, "camera.front");
  assert.equal(alt, "https://ha.local/alt.jpg");

  const skipped = resolveAltFallbackSource({
    entity: "",
    loadAlt: () => "should-not-run",
  });
  assert.equal(skipped, "");
});

test("resolveFallbackRefreshSources returns combined source outcome", () => {
  const withPrimary = resolveFallbackRefreshSources({
    primarySrc: "https://ha.local/primary.jpg",
    altSrc: "https://ha.local/alt.jpg",
  });
  assert.equal(withPrimary.primarySrc, "https://ha.local/primary.jpg");
  assert.equal(withPrimary.altSrc, "https://ha.local/alt.jpg");
  assert.equal(withPrimary.src, "https://ha.local/primary.jpg");
  assert.equal(withPrimary.hasSource, true);

  const withAltOnly = resolveFallbackRefreshSources({
    primarySrc: "",
    altSrc: "https://ha.local/alt.jpg",
  });
  assert.equal(withAltOnly.src, "https://ha.local/alt.jpg");
  assert.equal(withAltOnly.hasSource, true);

  const empty = resolveFallbackRefreshSources({
    primarySrc: "",
    altSrc: "",
  });
  assert.equal(empty.src, "");
  assert.equal(empty.hasSource, false);
});

test("shouldApplyFallbackRefreshSources follows hasSource", () => {
  assert.equal(
    shouldApplyFallbackRefreshSources({
      sources: { hasSource: true },
    }),
    true,
  );
  assert.equal(
    shouldApplyFallbackRefreshSources({
      sources: { hasSource: false },
    }),
    false,
  );
  assert.equal(
    shouldApplyFallbackRefreshSources({
      sources: null,
    }),
    false,
  );
});

test("buildFallbackImageApplyPayload maps source and element payload", () => {
  const imgEl = { id: "img" };
  const statusEl = { id: "status" };
  const payload = buildFallbackImageApplyPayload({
    imgEl,
    statusEl,
    entity: "camera.front",
    sources: {
      altSrc: "https://ha.local/alt.jpg",
      src: "https://ha.local/primary.jpg",
    },
  });

  assert.equal(payload.img, imgEl);
  assert.equal(payload.statusEl, statusEl);
  assert.equal(payload.entity, "camera.front");
  assert.equal(payload.altSrc, "https://ha.local/alt.jpg");
  assert.equal(payload.src, "https://ha.local/primary.jpg");
});

test("buildFallbackRefreshOutcome resolves source and hasSource", () => {
  const primary = buildFallbackRefreshOutcome({
    primarySrc: "https://ha.local/primary.jpg",
    altSrc: "https://ha.local/alt.jpg",
  });
  assert.equal(primary.src, "https://ha.local/primary.jpg");
  assert.equal(primary.hasSource, true);

  const altOnly = buildFallbackRefreshOutcome({
    primarySrc: "",
    altSrc: "https://ha.local/alt.jpg",
  });
  assert.equal(altOnly.src, "https://ha.local/alt.jpg");
  assert.equal(altOnly.hasSource, true);

  const none = buildFallbackRefreshOutcome({
    primarySrc: "",
    altSrc: "",
  });
  assert.equal(none.src, "");
  assert.equal(none.hasSource, false);
});
