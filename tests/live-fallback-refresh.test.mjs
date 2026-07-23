import { test } from "node:test";
import assert from "node:assert/strict";

import {
  beginFallbackRefresh,
  buildFallbackRefreshContext,
  buildFallbackImageApplyPayload,
  buildFallbackImageWriteInput,
  buildFallbackRefreshOutcome,
  buildFallbackRefreshWritePlan,
  canRefreshFallbackImage,
  getFallbackRefreshElements,
  issueFallbackRefreshToken,
  isFallbackRefreshStale,
  loadPrimaryFallbackSource,
  loadPrimaryWithStaleGate,
  nextFallbackRequestId,
  resolveAltFallbackSource,
  resolveFallbackRefreshEntity,
  resolveFallbackRefreshSources,
  runFallbackRefreshCycle,
  runFallbackRefreshCycleForCard,
  shouldAbortFallbackRefreshAfterPrimary,
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

test("shouldAbortFallbackRefreshAfterPrimary checks token request id against active id", () => {
  assert.equal(
    shouldAbortFallbackRefreshAfterPrimary({
      token: { requestId: 5 },
      activeRequestId: 5,
    }),
    false,
  );
  assert.equal(
    shouldAbortFallbackRefreshAfterPrimary({
      token: { requestId: 5 },
      activeRequestId: 6,
    }),
    true,
  );
});

test("loadPrimaryWithStaleGate returns primary source when token is current", async () => {
  const result = await loadPrimaryWithStaleGate({
    entity: "camera.front",
    token: { requestId: 3 },
    activeRequestId: 3,
    loadPrimary: async () => "https://ha.local/primary.jpg",
  });

  assert.equal(result.shouldAbort, false);
  assert.equal(result.primarySrc, "https://ha.local/primary.jpg");
});

test("loadPrimaryWithStaleGate aborts when token becomes stale", async () => {
  const result = await loadPrimaryWithStaleGate({
    entity: "camera.front",
    token: { requestId: 3 },
    activeRequestId: 4,
    loadPrimary: async () => "https://ha.local/primary.jpg",
  });

  assert.equal(result.shouldAbort, true);
  assert.equal(result.primarySrc, "");
});

test("runFallbackRefreshCycle writes once when source resolves", async () => {
  let activeRequestId = 4;
  const imgEl = { id: "img" };
  const statusEl = { id: "status" };
  const writes = [];
  const handlerPayloads = [];

  const result = await runFallbackRefreshCycle({
    shadowRoot: {
      querySelector: (selector) => {
        if (selector === "#stream-fallback-img") return imgEl;
        if (selector === "#stream-fallback-status") return statusEl;
        return null;
      },
    },
    currentRequestId: activeRequestId,
    activeCam: { entity: "camera.front" },
    setActiveRequestId: (nextId) => {
      activeRequestId = nextId;
    },
    readActiveRequestId: () => activeRequestId,
    loadPrimary: async () => "https://ha.local/primary.jpg",
    loadAlt: () => "https://ha.local/alt.jpg",
    applyHandlers: (payload) => handlerPayloads.push(payload),
    applySource: (entry) => writes.push(entry),
  });

  assert.equal(result.shouldAbort, false);
  assert.equal(result.didWrite, true);
  assert.equal(activeRequestId, 5);
  assert.equal(handlerPayloads.length, 1);
  assert.equal(handlerPayloads[0].img, imgEl);
  assert.equal(handlerPayloads[0].statusEl, statusEl);
  assert.equal(handlerPayloads[0].entity, "camera.front");
  assert.equal(handlerPayloads[0].src, "https://ha.local/primary.jpg");
  assert.equal(writes.length, 1);
  assert.equal(writes[0].img, imgEl);
  assert.equal(writes[0].src, "https://ha.local/primary.jpg");
});

test("runFallbackRefreshCycle aborts when request becomes stale after primary load", async () => {
  let activeRequestId = 2;
  const writes = [];
  const handlerPayloads = [];

  const result = await runFallbackRefreshCycle({
    shadowRoot: {
      querySelector: (selector) =>
        selector === "#stream-fallback-img" ? { id: "img" } : null,
    },
    currentRequestId: activeRequestId,
    activeCam: { entity: "camera.front" },
    setActiveRequestId: (nextId) => {
      activeRequestId = nextId;
    },
    readActiveRequestId: () => activeRequestId,
    loadPrimary: async () => {
      activeRequestId = 99;
      return "https://ha.local/primary.jpg";
    },
    loadAlt: () => "https://ha.local/alt.jpg",
    applyHandlers: (payload) => handlerPayloads.push(payload),
    applySource: (entry) => writes.push(entry),
  });

  assert.equal(result.shouldAbort, true);
  assert.equal(result.didWrite, false);
  assert.equal(handlerPayloads.length, 0);
  assert.equal(writes.length, 0);
});

test("runFallbackRefreshCycle short-circuits when image element is missing", async () => {
  let activeRequestId = 7;
  let setCalled = false;
  const writes = [];

  const result = await runFallbackRefreshCycle({
    shadowRoot: {
      querySelector: () => null,
    },
    currentRequestId: activeRequestId,
    activeCam: { entity: "camera.front" },
    setActiveRequestId: () => {
      setCalled = true;
    },
    readActiveRequestId: () => activeRequestId,
    loadPrimary: async () => "https://ha.local/primary.jpg",
    loadAlt: () => "https://ha.local/alt.jpg",
    applyHandlers: () => {},
    applySource: (entry) => writes.push(entry),
  });

  assert.equal(result.shouldAbort, true);
  assert.equal(result.didWrite, false);
  assert.equal(setCalled, false);
  assert.equal(activeRequestId, 7);
  assert.equal(writes.length, 0);
});

test("runFallbackRefreshCycle skips write when both primary and alt sources are empty", async () => {
  let activeRequestId = 1;
  const writes = [];
  const handlerPayloads = [];

  const result = await runFallbackRefreshCycle({
    shadowRoot: {
      querySelector: (selector) =>
        selector === "#stream-fallback-img" ? { id: "img" } : null,
    },
    currentRequestId: activeRequestId,
    activeCam: { entity: "camera.front" },
    setActiveRequestId: (nextId) => {
      activeRequestId = nextId;
    },
    readActiveRequestId: () => activeRequestId,
    loadPrimary: async () => "",
    loadAlt: () => "",
    applyHandlers: (payload) => handlerPayloads.push(payload),
    applySource: (entry) => writes.push(entry),
  });

  assert.equal(result.shouldAbort, false);
  assert.equal(result.didWrite, false);
  assert.equal(activeRequestId, 2);
  assert.equal(handlerPayloads.length, 0);
  assert.equal(writes.length, 0);
});

test("runFallbackRefreshCycleForCard maps card runtime into cycle execution", async () => {
  const imgEl = { id: "img" };
  const statusEl = { id: "status" };
  const handlerPayloads = [];
  const writes = [];
  const card = {
    shadowRoot: {
      querySelector: (selector) => {
        if (selector === "#stream-fallback-img") return imgEl;
        if (selector === "#stream-fallback-status") return statusEl;
        return null;
      },
    },
    _fallbackReqId: 3,
    _activeCam: { entity: "camera.front" },
    _streamFallbackUrl: async () => "https://ha.local/primary.jpg",
    _streamFallbackAltUrl: () => "https://ha.local/alt.jpg",
  };

  const result = await runFallbackRefreshCycleForCard({
    card,
    applyHandlers: (payload) => handlerPayloads.push(payload),
    applySource: (entry) => writes.push(entry),
  });

  assert.equal(result.shouldAbort, false);
  assert.equal(result.didWrite, true);
  assert.equal(card._fallbackReqId, 4);
  assert.equal(handlerPayloads.length, 1);
  assert.equal(handlerPayloads[0].img, imgEl);
  assert.equal(handlerPayloads[0].statusEl, statusEl);
  assert.equal(writes.length, 1);
  assert.equal(writes[0].img, imgEl);
  assert.equal(writes[0].src, "https://ha.local/primary.jpg");
});

test("buildFallbackRefreshWritePlan returns write input when a source is available", () => {
  const imgEl = { id: "img" };
  const statusEl = { id: "status" };
  const plan = buildFallbackRefreshWritePlan({
    entity: "camera.front",
    primarySrc: "",
    loadAlt: () => "https://ha.local/alt.jpg",
    imgEl,
    statusEl,
  });

  assert.equal(plan.shouldWrite, true);
  assert.equal(plan.writeInput?.src, "https://ha.local/alt.jpg");
  assert.equal(plan.writeInput?.applyPayload?.img, imgEl);
  assert.equal(plan.writeInput?.applyPayload?.statusEl, statusEl);
  assert.equal(plan.context?.entity, "camera.front");
});

test("buildFallbackRefreshWritePlan skips write input when no source is available", () => {
  const plan = buildFallbackRefreshWritePlan({
    entity: "camera.front",
    primarySrc: "",
    loadAlt: () => "",
    imgEl: { id: "img" },
    statusEl: { id: "status" },
  });

  assert.equal(plan.shouldWrite, false);
  assert.equal(plan.writeInput, null);
  assert.equal(plan.context?.sources?.hasSource, false);
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

test("buildFallbackRefreshContext composes alt source and packaged sources", () => {
  const context = buildFallbackRefreshContext({
    entity: "camera.front",
    primarySrc: "https://ha.local/primary.jpg",
    loadAlt: (entity) => `https://ha.local/${entity}/alt.jpg`,
  });

  assert.equal(context.entity, "camera.front");
  assert.equal(context.primarySrc, "https://ha.local/primary.jpg");
  assert.equal(context.altSrc, "https://ha.local/camera.front/alt.jpg");
  assert.equal(context.sources.src, "https://ha.local/primary.jpg");
  assert.equal(context.sources.hasSource, true);
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

test("buildFallbackImageWriteInput maps context and elements to write input", () => {
  const imgEl = { id: "img" };
  const statusEl = { id: "status" };
  const writeInput = buildFallbackImageWriteInput({
    context: {
      entity: "camera.front",
      sources: {
        altSrc: "https://ha.local/alt.jpg",
        src: "https://ha.local/primary.jpg",
      },
    },
    imgEl,
    statusEl,
  });

  assert.equal(writeInput.applyPayload.img, imgEl);
  assert.equal(writeInput.applyPayload.statusEl, statusEl);
  assert.equal(writeInput.applyPayload.entity, "camera.front");
  assert.equal(writeInput.applyPayload.altSrc, "https://ha.local/alt.jpg");
  assert.equal(writeInput.applyPayload.src, "https://ha.local/primary.jpg");
  assert.equal(writeInput.src, "https://ha.local/primary.jpg");
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
