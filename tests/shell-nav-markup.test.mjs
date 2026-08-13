import { test } from "node:test";
import assert from "node:assert/strict";

import {
  buildControlsSectionMarkup,
  buildTabsMarkup,
  buildToolsMarkup,
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
  const { markup: tabsMarkup } = buildTabsMarkup({
    tab: "alerts",
    hiddenTabs: [],
    viewMode: "single",
    icons,
  });
  const toolsMarkup = buildToolsMarkup({
    tab: "alerts",
    viewMode: "single",
    icons,
    isFilterPanelOpen: false,
    isCalendarPanelOpen: false,
    isGridModeAvailable: false,
    isSlideshowRotationAvailable: false,
    isSlideshowActive: false,
    isControlsVisible: true,
    gridButtonIcon: "G",
    slideshowButtonIcon: "L",
  });

  assert.match(toolsMarkup, /id="filter-btn"[^>]*aria-pressed="false"/);
  assert.match(toolsMarkup, /id="cal-btn"[^>]*aria-pressed="false"/);
  assert.doesNotMatch(toolsMarkup, /id="filter-btn"[^>]*class="tool active"/);
  assert.doesNotMatch(toolsMarkup, /id="cal-btn"[^>]*class="tool active"/);
});

test("buildTabsMarkup marks filter and calendar active only when open", () => {
  const { markup: tabsMarkup } = buildTabsMarkup({
    tab: "alerts",
    hiddenTabs: [],
    viewMode: "single",
    icons,
  });
  const toolsMarkup = buildToolsMarkup({
    tab: "alerts",
    viewMode: "single",
    icons,
    isFilterPanelOpen: true,
    isCalendarPanelOpen: true,
    isGridModeAvailable: false,
    isSlideshowRotationAvailable: false,
    isSlideshowActive: false,
    isControlsVisible: true,
    gridButtonIcon: "G",
    slideshowButtonIcon: "L",
  });

  assert.match(toolsMarkup, /class="tool active" id="filter-btn"/);
  assert.match(toolsMarkup, /class="tool active" id="cal-btn"/);
  assert.match(toolsMarkup, /id="filter-btn"[^>]*aria-pressed="true"/);
  assert.match(toolsMarkup, /id="cal-btn"[^>]*aria-pressed="true"/);
});

test("buildTabsMarkup supports custom tab button class", () => {
  const { markup } = buildTabsMarkup({
    tab: "alerts",
    hiddenTabs: [],
    viewMode: "single",
    icons,
    buttonClass: "icon-btn",
  });

  assert.match(markup, /class="icon-btn active" data-tab="alerts"/);
  assert.match(markup, /class="icon-btn" data-tab="clips"/);
  assert.doesNotMatch(markup, /class="circle-btn/);
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
