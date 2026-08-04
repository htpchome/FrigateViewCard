import { test } from "node:test";
import assert from "node:assert/strict";

import {
  buildControlsSectionMarkup,
  buildTabsMarkup,
} from "../src/card/controls/shell-nav.tmpl.js";

const icons = {
  alerts: "A",
  clips: "C",
  snapshot: "S",
  recordings: "R",
  star: "K",
  bullseye: "B",
  filter: "F",
  calendar: "D",
};

test("buildTabsMarkup keeps filter and calendar inactive when panels are absent", () => {
  const { markup } = buildTabsMarkup({
    tab: "alerts",
    hiddenTabs: [],
    viewMode: "single",
    icons,
    isFilterPanelOpen: false,
    isCalendarPanelOpen: false,
    isGridModeAvailable: false,
    isSlideshowRotationAvailable: false,
    isSlideshowActive: false,
    gridButtonIcon: "G",
    slideshowButtonIcon: "L",
  });

  assert.match(markup, /id="filter-btn"[^>]*aria-pressed="false"/);
  assert.match(markup, /id="cal-btn"[^>]*aria-pressed="false"/);
  assert.doesNotMatch(markup, /id="filter-btn"[^>]*class="tool active"/);
  assert.doesNotMatch(markup, /id="cal-btn"[^>]*class="tool active"/);
});

test("buildTabsMarkup marks filter and calendar active only when open", () => {
  const { markup } = buildTabsMarkup({
    tab: "alerts",
    hiddenTabs: [],
    viewMode: "single",
    icons,
    isFilterPanelOpen: true,
    isCalendarPanelOpen: true,
    isGridModeAvailable: false,
    isSlideshowRotationAvailable: false,
    isSlideshowActive: false,
    gridButtonIcon: "G",
    slideshowButtonIcon: "L",
  });

  assert.match(markup, /class="tool active" id="filter-btn"/);
  assert.match(markup, /class="tool active" id="cal-btn"/);
  assert.match(markup, /id="filter-btn"[^>]*aria-pressed="true"/);
  assert.match(markup, /id="cal-btn"[^>]*aria-pressed="true"/);
});

test("buildControlsSectionMarkup renders zoom and focus PTZ buttons", () => {
  const markup = buildControlsSectionMarkup({
    cameraName: "Driveway",
    ptzReady: true,
    panTiltEnabled: true,
    zoomEnabled: true,
    focusEnabled: true,
  });

  assert.match(markup, /data-ptz-control="zoom-in"/);
  assert.match(markup, /data-ptz-control="zoom-out"/);
  assert.match(markup, /data-ptz-control="focus-in"/);
  assert.match(markup, /data-ptz-control="focus-out"/);
  assert.match(markup, /Driveway · Frigate PTZ ready/);
});

test("buildControlsSectionMarkup disables unavailable auxiliary PTZ buttons", () => {
  const markup = buildControlsSectionMarkup({
    cameraName: "Driveway",
    ptzReady: true,
    panTiltEnabled: true,
    zoomEnabled: false,
    focusEnabled: false,
  });

  assert.match(markup, /data-ptz-control="zoom-in"[^>]*disabled/);
  assert.match(markup, /data-ptz-control="focus-in"[^>]*disabled/);
  assert.match(markup, /controls-action-group is-disabled/);
});
