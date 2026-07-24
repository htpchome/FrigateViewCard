import { test } from "node:test";
import assert from "node:assert/strict";

import { WideViewPageController } from "../src/wide-view/wide-view-page-controller.js";

const PAGE_IDS = { wideView: "wide-view" };

const createHost = ({ isWide = false } = {}) => {
  const calls = [];
  const host = {
    _pageId: isWide ? "wide-view" : "single-view",
    _syncColHeight: () => calls.push(["syncColHeight"]),
    _singleViewPageController: {
      activateStandardPageRoute: (context) =>
        calls.push(["activateStandardPageRoute", context]),
    },
  };
  return { host, calls };
};

test("activateWideViewPageRoute delegates through standard route activation", () => {
  const { host, calls } = createHost({ isWide: true });
  const controller = new WideViewPageController(host, { PAGE_IDS });

  controller.activateWideViewPageRoute({ startup: true });

  assert.deepEqual(calls, [["activateStandardPageRoute", { startup: true }]]);
});

test("isWideViewPageActive derives state from host page id", () => {
  const { host } = createHost({ isWide: true });
  const controller = new WideViewPageController(host, { PAGE_IDS });

  assert.equal(controller.isWideViewPageActive(), true);

  host._pageId = "single-view";
  assert.equal(controller.isWideViewPageActive(), false);
});

test("syncColHeightIfWideView syncs only for wide route", () => {
  const wide = createHost({ isWide: true });
  const wideController = new WideViewPageController(wide.host, { PAGE_IDS });
  wideController.syncColHeightIfWideView();
  assert.deepEqual(wide.calls, [["syncColHeight"]]);

  const single = createHost({ isWide: false });
  const singleController = new WideViewPageController(single.host, {
    PAGE_IDS,
  });
  singleController.syncColHeightIfWideView();
  assert.deepEqual(single.calls, []);
});

test("wideViewLayoutState resolves wide layout widths with clamping", () => {
  const wide = createHost({ isWide: true });
  const wideController = new WideViewPageController(wide.host, { PAGE_IDS });

  assert.deepEqual(wideController.wideViewLayoutState("120"), {
    isWide: true,
    leftWidth: "90%",
    rightWidth: "10%",
  });
  assert.deepEqual(wideController.wideViewLayoutState("5"), {
    isWide: true,
    leftWidth: "10%",
    rightWidth: "90%",
  });
  assert.deepEqual(wideController.wideViewLayoutState("65"), {
    isWide: true,
    leftWidth: "65%",
    rightWidth: "35%",
  });

  const single = createHost({ isWide: false });
  const singleController = new WideViewPageController(single.host, {
    PAGE_IDS,
  });
  assert.deepEqual(singleController.wideViewLayoutState("65"), {
    isWide: false,
    leftWidth: "",
    rightWidth: "",
  });
});
