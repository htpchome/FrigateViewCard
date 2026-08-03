import { test } from "node:test";
import assert from "node:assert/strict";

import {
  resolveActiveDayLabelFromScroll,
  resolveActiveListScroller,
  resolveOlderHintMetrics,
  resolveOlderHintState,
} from "../src/card/list-render-utils.js";

test("resolveActiveListScroller prefers browse when list is not a scroll container", () => {
  const list = {
    scrollTop: 0,
    scrollHeight: 1000,
    clientHeight: 400,
  };
  const browse = { scrollTop: 120 };

  const originalGetComputedStyle = globalThis.getComputedStyle;
  globalThis.getComputedStyle = () => ({ overflowY: "visible" });
  try {
    assert.equal(resolveActiveListScroller({ list, browse }), browse);
  } finally {
    globalThis.getComputedStyle = originalGetComputedStyle;
  }
});

test("resolveActiveListScroller uses list when it is a scroll container", () => {
  const list = {
    scrollTop: 0,
    scrollHeight: 1000,
    clientHeight: 400,
  };
  const browse = { scrollTop: 0 };

  const originalGetComputedStyle = globalThis.getComputedStyle;
  globalThis.getComputedStyle = () => ({ overflowY: "auto" });
  try {
    assert.equal(resolveActiveListScroller({ list, browse }), list);
  } finally {
    globalThis.getComputedStyle = originalGetComputedStyle;
  }
});

test("resolveActiveListScroller falls back to browse when list overflow is hidden", () => {
  const list = {
    scrollTop: 0,
    scrollHeight: 1000,
    clientHeight: 400,
  };
  const browse = { scrollTop: 40 };

  const originalGetComputedStyle = globalThis.getComputedStyle;
  globalThis.getComputedStyle = () => ({ overflowY: "hidden" });
  try {
    assert.equal(resolveActiveListScroller({ list, browse }), browse);
  } finally {
    globalThis.getComputedStyle = originalGetComputedStyle;
  }
});

test("resolveActiveListScroller returns to list after overflow auto is restored", () => {
  const list = {
    scrollTop: 0,
    scrollHeight: 1000,
    clientHeight: 400,
  };
  const browse = { scrollTop: 40 };

  const originalGetComputedStyle = globalThis.getComputedStyle;
  globalThis.getComputedStyle = () => ({ overflowY: "auto" });
  try {
    assert.equal(resolveActiveListScroller({ list, browse }), list);
  } finally {
    globalThis.getComputedStyle = originalGetComputedStyle;
  }
});

test("resolveOlderHintMetrics tracks browse scroll when browse is active scroller", () => {
  const list = {
    scrollTop: 0,
    scrollHeight: 1000,
    clientHeight: 400,
    querySelector: () => ({ getBoundingClientRect: () => ({ height: 80 }) }),
  };
  const browse = { scrollTop: 320 };

  const originalGetComputedStyle = globalThis.getComputedStyle;
  globalThis.getComputedStyle = () => ({ overflowY: "visible" });
  try {
    const metrics = resolveOlderHintMetrics({ list, browse });
    assert.equal(metrics.scrollTop, 320);
    assert.equal(metrics.itemHeight, 80);
    const state = resolveOlderHintState({
      tab: "clips",
      scrollTop: metrics.scrollTop,
      itemHeight: metrics.itemHeight,
    });
    assert.equal(state.isToTop, true);
    assert.equal(state.text, "Click to return to top");
  } finally {
    globalThis.getComputedStyle = originalGetComputedStyle;
  }
});

test("resolveActiveDayLabelFromScroll follows labels against browse anchor", () => {
  const labels = [
    {
      dataset: { dayLabel: "Sat - July 26th - Recent Clips" },
      getBoundingClientRect: () => ({ top: 95 }),
      textContent: "Sat - July 26th - Recent Clips",
    },
    {
      dataset: { dayLabel: "Sun - July 27th - Recent Clips" },
      getBoundingClientRect: () => ({ top: 140 }),
      textContent: "Sun - July 27th - Recent Clips",
    },
  ];

  const list = {
    scrollTop: 0,
    scrollHeight: 1000,
    clientHeight: 400,
    querySelectorAll: () => labels,
  };
  const browse = {
    scrollTop: 190,
    getBoundingClientRect: () => ({ top: 96 }),
  };

  const originalGetComputedStyle = globalThis.getComputedStyle;
  globalThis.getComputedStyle = () => ({ overflowY: "visible" });
  try {
    const label = resolveActiveDayLabelFromScroll({ list, browse });
    assert.equal(label, "Sat - July 26th - Recent Clips");
  } finally {
    globalThis.getComputedStyle = originalGetComputedStyle;
  }
});
