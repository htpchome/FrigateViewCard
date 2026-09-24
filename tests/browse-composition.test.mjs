import { test } from "node:test";
import assert from "node:assert/strict";

import {
  createBrowseControllers,
  renderBrowseEventListItem,
  renderBrowseReviewListItem,
} from "../src/features/browse/composition.js";

test("browse composition exposes item presentation coordination", () => {
  assert.equal(typeof renderBrowseEventListItem, "function");
  assert.equal(typeof renderBrowseReviewListItem, "function");
});

test("browse composition preserves controller order and markup dependencies", () => {
  const calls = [];
  const options = {};
  const controllers = {
    calendarActivity: { type: "calendar-activity" },
    calendarPanel: { type: "calendar-panel" },
    collection: { type: "collection" },
    filter: { type: "filter" },
    tabData: { type: "tab-data" },
    windowLoader: { type: "window-loader" },
  };
  const card = {};
  const factories = {
    createCalendarActivityController: (host) => {
      calls.push(["calendar-activity", host]);
      return controllers.calendarActivity;
    },
    createCalendarPanelController: (host, value) => {
      calls.push(["calendar-panel", host]);
      options.calendarPanel = value;
      return controllers.calendarPanel;
    },
    createCollectionController: (host) => {
      calls.push(["collection", host]);
      return controllers.collection;
    },
    createFilterController: (host, value) => {
      calls.push(["filter", host]);
      options.filter = value;
      return controllers.filter;
    },
    createTabDataController: (host) => {
      calls.push(["tab-data", host]);
      return controllers.tabData;
    },
    createWindowLoaderController: (host) => {
      calls.push(["window-loader", host]);
      return controllers.windowLoader;
    },
  };

  const result = createBrowseControllers(card, { factories });

  assert.deepEqual(result, {
    _browseCalendarActivityController: controllers.calendarActivity,
    _browseCalendarPanelController: controllers.calendarPanel,
    _browseCollectionController: controllers.collection,
    _browseFilterController: controllers.filter,
    _browseTabDataController: controllers.tabData,
    _browseWindowLoaderController: controllers.windowLoader,
  });
  assert.deepEqual(calls, [
    ["calendar-activity", card],
    ["calendar-panel", card],
    ["collection", card],
    ["filter", card],
    ["tab-data", card],
    ["window-loader", card],
  ]);
  assert.equal(typeof options.calendarPanel.buildCalendarPanelMarkup, "function");
  assert.equal(typeof options.filter.buildFilterPanelMarkup, "function");
});
