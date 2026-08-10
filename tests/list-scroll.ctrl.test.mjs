import { test } from "node:test";
import assert from "node:assert/strict";

import { ListScrollController } from "../src/features/browse/scroll.ctrl.js";

function createTarget({
  scrollTop = 0,
  clientHeight = 0,
  scrollHeight = 0,
} = {}) {
  const listeners = new Map();

  return {
    scrollTop,
    clientHeight,
    scrollHeight,
    addEventListener(type, listener, options = {}) {
      if (!listeners.has(type)) listeners.set(type, new Set());
      listeners.get(type).add(listener);
      options.signal?.addEventListener(
        "abort",
        () => {
          this.removeEventListener(type, listener);
        },
        { once: true },
      );
    },
    removeEventListener(type, listener) {
      listeners.get(type)?.delete(listener);
    },
    dispatch(type) {
      for (const listener of [...(listeners.get(type) || [])]) {
        listener();
      }
    },
  };
}

test("ListScrollController loads older items from the list scroll container", () => {
  const list = createTarget({
    scrollTop: 630,
    clientHeight: 300,
    scrollHeight: 1000,
  });
  const browse = createTarget({
    scrollTop: 0,
    clientHeight: 300,
    scrollHeight: 300,
  });
  const calls = [];

  const controller = new ListScrollController({
    list,
    browse,
    syncOlderHint: () => calls.push("hint"),
    syncBrowseHeadFromScroll: () => calls.push("head"),
    getTab: () => "clips",
    isLoading: () => false,
    isExhausted: () => false,
    loadOlder: () => calls.push("loadOlder"),
  });

  controller.bind();
  list.dispatch("scroll");

  assert.deepEqual(calls, ["hint", "head", "loadOlder"]);
});

test("ListScrollController falls back to browse when the list does not overflow", () => {
  const list = createTarget({
    scrollTop: 0,
    clientHeight: 300,
    scrollHeight: 300,
  });
  const browse = createTarget({
    scrollTop: 640,
    clientHeight: 300,
    scrollHeight: 1000,
  });
  let loadOlderCalls = 0;

  const controller = new ListScrollController({
    list,
    browse,
    syncOlderHint: () => {},
    syncBrowseHeadFromScroll: () => {},
    getTab: () => "snapshot",
    isLoading: () => false,
    isExhausted: () => false,
    loadOlder: () => {
      loadOlderCalls += 1;
    },
  });

  controller.bind();
  browse.dispatch("scroll");

  assert.equal(loadOlderCalls, 1);
});

test("ListScrollController disposes scroll listeners", () => {
  const list = createTarget({
    scrollTop: 640,
    clientHeight: 300,
    scrollHeight: 1000,
  });
  let loadOlderCalls = 0;

  const controller = new ListScrollController({
    list,
    browse: null,
    syncOlderHint: () => {},
    syncBrowseHeadFromScroll: () => {},
    getTab: () => "clips",
    isLoading: () => false,
    isExhausted: () => false,
    loadOlder: () => {
      loadOlderCalls += 1;
    },
  });

  controller.bind();
  controller.dispose();
  list.dispatch("scroll");

  assert.equal(loadOlderCalls, 0);
});
