import { test } from "node:test";
import assert from "node:assert/strict";

import { BrowsePanelDismissController } from "../src/features/browse/panel-dismiss.ctrl.js";

const createPanel = (display = "block") => {
  const descendants = new Set();
  return {
    hidden: false,
    style: { display },
    contains: (candidate) => descendants.has(candidate),
    addDescendant: (candidate) => descendants.add(candidate),
  };
};

const createHost = ({ cardViewActive = false } = {}) => {
  const filterPanel = createPanel();
  const calendarPanel = createPanel("none");
  let toolbarSyncs = 0;
  const host = {
    _cardViewPageController: {
      isActive: () => cardViewActive,
    },
    _pageShellRegion: (region) =>
      region === "filterPanel" ? filterPanel : calendarPanel,
    _syncToolbarButtons: () => {
      toolbarSyncs += 1;
    },
  };
  return {
    host,
    filterPanel,
    calendarPanel,
    toolbarSyncs: () => toolbarSyncs,
  };
};

test("outside pointer interaction closes an open browse filter panel", () => {
  const state = createHost();
  const controller = new BrowsePanelDismissController(state.host);

  const changed = controller.handleDocumentPointerDown({
    composedPath: () => [{ matches: () => false, closest: () => null }],
  });

  assert.equal(changed, true);
  assert.equal(state.filterPanel.style.display, "none");
  assert.equal(state.toolbarSyncs(), 1);
});

test("pointer interaction inside an open panel leaves it open", () => {
  const state = createHost();
  const controller = new BrowsePanelDismissController(state.host);
  const filterOption = {};
  state.filterPanel.addDescendant(filterOption);

  const changed = controller.handleDocumentPointerDown({
    composedPath: () => [filterOption, state.filterPanel],
  });

  assert.equal(changed, false);
  assert.equal(state.filterPanel.style.display, "block");
  assert.equal(state.toolbarSyncs(), 0);
});

test("panel triggers retain their existing click-toggle behavior", () => {
  const state = createHost();
  const controller = new BrowsePanelDismissController(state.host);
  const filterButton = {
    matches: (selector) => selector === "#filter-btn",
  };

  const changed = controller.handleDocumentPointerDown({
    composedPath: () => [filterButton],
  });

  assert.equal(changed, false);
  assert.equal(state.filterPanel.style.display, "block");
  assert.equal(state.toolbarSyncs(), 0);
});

test("outside touch-style pointer interaction closes an open calendar", () => {
  const state = createHost();
  state.filterPanel.style.display = "none";
  state.calendarPanel.style.display = "block";
  const controller = new BrowsePanelDismissController(state.host);

  const changed = controller.handleDocumentPointerDown({
    pointerType: "touch",
    target: { matches: () => false, closest: () => null },
  });

  assert.equal(changed, true);
  assert.equal(state.calendarPanel.style.display, "none");
  assert.equal(state.toolbarSyncs(), 1);
});

test("Card View leaves dismissal to its page-owned popover lifecycle", () => {
  const state = createHost({ cardViewActive: true });
  const controller = new BrowsePanelDismissController(state.host);

  const changed = controller.handleDocumentPointerDown({ target: {} });

  assert.equal(changed, false);
  assert.equal(state.filterPanel.style.display, "block");
  assert.equal(state.toolbarSyncs(), 0);
});
