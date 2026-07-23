import { test } from "node:test";
import assert from "node:assert/strict";

import {
  buildFallbackRefreshOutcome,
  isFallbackRefreshStale,
  nextFallbackRequestId,
} from "../src/live/live-fallback-refresh.js";

test("nextFallbackRequestId increments from current id", () => {
  assert.equal(nextFallbackRequestId(0), 1);
  assert.equal(nextFallbackRequestId(4), 5);
  assert.equal(nextFallbackRequestId(undefined), 1);
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
