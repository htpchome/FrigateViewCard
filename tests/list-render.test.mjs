import { test } from "node:test";
import assert from "node:assert/strict";

import {
  resolveActiveDayLabelFromScroll,
  resolveActiveListScroller,
  resolveOlderHintMetrics,
  resolveOlderHintState,
} from "../src/shared/list-render.js";
import { STYLES } from "../src/styles.js";

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
  const browse = { scrollTop: 320, scrollHeight: 1200, clientHeight: 500 };

  const originalGetComputedStyle = globalThis.getComputedStyle;
  globalThis.getComputedStyle = () => ({ overflowY: "visible" });
  try {
    const metrics = resolveOlderHintMetrics({ list, browse });
    assert.equal(metrics.scrollTop, 320);
    assert.equal(metrics.itemHeight, 80);
    assert.equal(metrics.hasScrollableContent, true);
    const state = resolveOlderHintState({
      tab: "clips",
      scrollTop: metrics.scrollTop,
      itemHeight: metrics.itemHeight,
      hasScrollableContent: metrics.hasScrollableContent,
    });
    assert.equal(state.isToTop, true);
    assert.equal(state.text, "Click to return to top");
  } finally {
    globalThis.getComputedStyle = originalGetComputedStyle;
  }
});

test("older hint stays hidden until the active browse area can scroll", () => {
  const fixedState = resolveOlderHintState({
    tab: "clips",
    scrollTop: 0,
    hasScrollableContent: false,
  });
  const scrollableState = resolveOlderHintState({
    tab: "clips",
    scrollTop: 0,
    hasScrollableContent: true,
  });

  assert.equal(fixedState.hidden, true);
  assert.equal(scrollableState.hidden, false);
  assert.equal(scrollableState.text, "scroll for older…");
});

test("older hint ignores outer overflow when the current tab list fits", () => {
  const list = {
    scrollTop: 0,
    scrollHeight: 240,
    clientHeight: 240,
    querySelector: () => null,
    getBoundingClientRect: () => ({ bottom: 340 }),
  };
  const browse = {
    scrollTop: 0,
    scrollHeight: 900,
    clientHeight: 500,
    getBoundingClientRect: () => ({ bottom: 600 }),
  };
  const originalGetComputedStyle = globalThis.getComputedStyle;
  globalThis.getComputedStyle = () => ({ overflowY: "visible" });

  try {
    const metrics = resolveOlderHintMetrics({ list, browse });
    assert.equal(metrics.hasScrollableContent, false);
  } finally {
    globalThis.getComputedStyle = originalGetComputedStyle;
  }
});

test("older hint hidden state overrides its flex presentation", () => {
  assert.match(STYLES, /\.more\[hidden\]\{display:none !important;\}/);
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
