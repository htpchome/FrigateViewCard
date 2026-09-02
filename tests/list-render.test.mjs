import { test } from "node:test";
import assert from "node:assert/strict";

import {
  resolveActiveDayLabelFromScroll,
  resolveActiveListScroller,
  resolveOlderHintMetrics,
  resolveReturnToTopChipState,
  syncDayLabelAlignmentFromScroll,
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

test("browse scroll metrics track the active outer scroller", () => {
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
  } finally {
    globalThis.getComputedStyle = originalGetComputedStyle;
  }
});

test("return-to-top chip appears after meaningful scrolling on every browse tab", () => {
  for (const tab of ["alerts", "clips", "snapshot", "recordings", "kept"]) {
    assert.equal(
      resolveReturnToTopChipState({
        tab,
        scrollTop: 300,
        itemHeight: 60,
        hasScrollableContent: true,
      }).hidden,
      false,
      tab,
    );
  }

  assert.equal(
    resolveReturnToTopChipState({
      tab: "alerts",
      scrollTop: 100,
      itemHeight: 60,
      hasScrollableContent: true,
    }).hidden,
    true,
  );
  assert.equal(
    resolveReturnToTopChipState({
      tab: "controls",
      scrollTop: 300,
      itemHeight: 60,
      hasScrollableContent: true,
    }).hidden,
    true,
  );
});

test("browse scroll metrics ignore outer overflow when the current list fits", () => {
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

test("browse scroll metrics detect overflow before the flex-shrunk list scrolls", () => {
  const list = {
    scrollTop: 0,
    scrollHeight: 900,
    clientHeight: 500,
    querySelector: () => null,
    getBoundingClientRect: () => ({ bottom: 600 }),
  };
  const browse = {
    scrollTop: 0,
    scrollHeight: 500,
    clientHeight: 500,
    getBoundingClientRect: () => ({ bottom: 600 }),
  };
  const originalGetComputedStyle = globalThis.getComputedStyle;
  globalThis.getComputedStyle = () => ({ overflowY: "visible" });

  try {
    const metrics = resolveOlderHintMetrics({ list, browse });
    assert.equal(metrics.scrollTop, 0);
    assert.equal(metrics.hasScrollableContent, true);
  } finally {
    globalThis.getComputedStyle = originalGetComputedStyle;
  }
});

test("return-to-top chip is translucent, touch-safe, and floats in browse", () => {
  assert.match(
    STYLES,
    /\.browse-return-top-slot\{position:sticky;top:calc\(100% - 50px\);/,
  );
  assert.match(
    STYLES,
    /\.browse-return-top-chip\{[^}]*background:color-mix\(in srgb,var\(--c-bg-main\) 78%,transparent\)/,
  );
  assert.match(STYLES, /\.browse-return-top-chip\[hidden\]\{display:none;\}/);
  assert.match(
    STYLES,
    /\.browse-return-top-chip:active\{[^}]*scale\(\.96\)/,
  );
});

test("compact event action sizing targets SVG icons", () => {
  assert.match(
    STYLES,
    /\.list-item\.compact \.eact \.ico svg\{width:24px;height:24px;\}/,
  );
  assert.doesNotMatch(STYLES, /\.ico svcg/);
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

test("day label alignment compensates for the active scroller width", () => {
  const properties = new Map();
  const list = {
    scrollTop: 0,
    scrollHeight: 1000,
    clientHeight: 400,
    offsetWidth: 300,
    style: {
      getPropertyValue: (name) => properties.get(name) || "",
      setProperty: (name, value) => properties.set(name, value),
    },
  };
  const browse = {
    scrollTop: 190,
    clientWidth: 388,
    offsetWidth: 400,
  };
  const originalGetComputedStyle = globalThis.getComputedStyle;
  globalThis.getComputedStyle = () => ({ overflowY: "visible" });

  try {
    assert.equal(syncDayLabelAlignmentFromScroll({ list, browse }), 12);
    assert.equal(properties.get("--fvc-day-label-scrollbar-width"), "12px");
  } finally {
    globalThis.getComputedStyle = originalGetComputedStyle;
  }
});

test("day label alignment remains centered with overlay scrollbars", () => {
  const properties = new Map();
  const list = {
    scrollTop: 20,
    scrollHeight: 1000,
    clientHeight: 400,
    clientWidth: 300,
    offsetWidth: 300,
    style: {
      getPropertyValue: (name) => properties.get(name) || "",
      setProperty: (name, value) => properties.set(name, value),
    },
  };

  assert.equal(syncDayLabelAlignmentFromScroll({ list, browse: null }), 0);
  assert.equal(properties.get("--fvc-day-label-scrollbar-width"), "0px");
  assert.match(
    STYLES,
    /\.list-day-label\{[^}]*inset-inline-start:calc\(var\(--fvc-day-label-scrollbar-width, 0px\) \/ 2\);/,
  );
});
