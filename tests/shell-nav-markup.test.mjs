import { test } from "node:test";
import assert from "node:assert/strict";

import {
  buildBrowseHeaderRegionMarkup,
  buildBrowseRegionMarkup,
  buildCamSwitcherRegionMarkup,
  buildControlsSectionMarkup,
  buildFooterMarkup,
  buildInfoRowMarkup,
  buildLiveEngineWrapMarkup,
  buildPageNavButtonsMarkup,
  buildPageNavMarkup,
  buildTabsMarkup,
  buildTabsRegionMarkup,
  buildToolsMarkup,
  buildToolsRegionMarkup,
} from "../src/card/controls/shell-nav.tmpl.js";
import { buildSingleViewMainLayoutShellMarkup } from "../src/features/single-view/page.tmpl.js";

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

test("atomic shell fragments own their controller region anchors", () => {
  const fragments = {
    cameraSwitcher: buildCamSwitcherRegionMarkup({ markup: "Cameras" }),
    tabs: buildTabsRegionMarkup({ markup: "Tabs" }),
    tools: buildToolsRegionMarkup({ markup: "Tools" }),
    browseHeader: buildBrowseHeaderRegionMarkup({
      icons: { left: "<", right: ">" },
    }),
    browse: buildBrowseRegionMarkup(),
  };

  for (const [regionName, markup] of Object.entries({
    "camera-switcher": fragments.cameraSwitcher,
    tabs: fragments.tabs,
    tools: fragments.tools,
    "browse-header": fragments.browseHeader,
    browse: fragments.browse,
  })) {
    assert.equal(
      markup.match(new RegExp(`data-fvc-region="${regionName}"`, "g"))
        ?.length,
      1,
    );
  }
  assert.match(fragments.tabs, />Tabs<\/div>/);
  assert.match(fragments.tools, />Tools<\/div>/);
});

test("region composition does not synthesize omitted page regions", () => {
  const shellMarkup = buildSingleViewMainLayoutShellMarkup({
    regions: {
      live: `<div data-fvc-region="live">Live</div>`,
      tabs: buildTabsRegionMarkup({ markup: "Atomic Tabs" }),
    },
  });

  assert.match(shellMarkup, /Atomic Tabs/);
  assert.doesNotMatch(shellMarkup, /data-fvc-region="tools"/);
});

test("page navigation updates provide buttons without nesting the region", () => {
  const options = {
    routes: ["single-view"],
    activePageId: "single-view",
    getRouteLabel: () => "Single View",
    getRouteIcon: () => "S",
  };

  const pageNav = buildPageNavMarkup(options);
  const buttons = buildPageNavButtonsMarkup(options);

  assert.equal(
    pageNav.match(/data-fvc-region="page-navigation"/g)?.length,
    1,
  );
  assert.doesNotMatch(buttons, /data-fvc-region="page-navigation"/);
  assert.match(buttons, /data-page-route="single-view"/);
});

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
  assert.match(toolsMarkup, /data-fvc-region="filter-panel"/);
  assert.match(toolsMarkup, /data-fvc-region="calendar-panel"/);
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

test("buildToolsMarkup supports custom tool button class", () => {
  const markup = buildToolsMarkup({
    tab: "alerts",
    viewMode: "single",
    icons,
    buttonClass: "icon-btn",
    isFilterPanelOpen: true,
    isCalendarPanelOpen: false,
    isGridModeAvailable: true,
    isSlideshowRotationAvailable: true,
    isSlideshowActive: false,
    isControlsVisible: true,
    gridButtonIcon: "G",
    slideshowButtonIcon: "L",
  });

  assert.match(markup, /class="icon-btn" id="controls-btn"/);
  assert.match(markup, /class="icon-btn" id="grid-btn"/);
  assert.match(markup, /class="icon-btn slideshow-btn" id="slideshow-btn"/);
  assert.match(markup, /class="icon-btn active" id="filter-btn"/);
  assert.match(markup, /class="icon-btn" id="cal-btn"/);
  assert.doesNotMatch(markup, /class="tool/);
});

test("buildControlsSectionMarkup enables pan, tilt, and zoom on the circle pad", () => {
  const markup = buildControlsSectionMarkup({
    cameraName: "Driveway",
    ptzReady: true,
    panTiltEnabled: true,
    zoomEnabled: true,
    focusEnabled: true,
  });

  assert.match(markup, /<circle-pad-control-2 id="controls-pad"><\/circle-pad-control-2>/);
  assert.doesNotMatch(markup, /disabled-actions=/);
});

test("buildControlsSectionMarkup disables unavailable zoom actions on the circle pad", () => {
  const markup = buildControlsSectionMarkup({
    cameraName: "Driveway",
    ptzReady: true,
    panTiltEnabled: true,
    zoomEnabled: false,
    focusEnabled: false,
  });

  assert.match(markup, /disabled-actions="zoom-in zoom-out"/);
});

test("shared shell builders expose stable page region anchors", () => {
  const pageNav = buildPageNavMarkup({
    routes: ["single-view"],
    activePageId: "single-view",
    getRouteLabel: () => "Single View",
    getRouteIcon: () => "S",
  });
  const infoRow = buildInfoRowMarkup({
    title: "Camera",
    subtitle: "Frigate",
    version: "1.0.0",
  });
  const liveEngineWrap = buildLiveEngineWrapMarkup({
    icons: { live: "L", volOff: "M", volOn: "V", expand: "E" },
    streamMuted: true,
  });
  const browseHeader = buildBrowseHeaderRegionMarkup({
    icons: { left: "<", right: ">" },
  });
  const browse = buildBrowseRegionMarkup();
  const tabs = buildTabsRegionMarkup({ markup: "Tabs" });
  const tools = buildToolsRegionMarkup({ markup: "Tools" });
  const footerMarkup = buildFooterMarkup({
    icons: { frigateView: "F" },
  });
  const shellMarkup = buildSingleViewMainLayoutShellMarkup({
    regions: {
      live: liveEngineWrap,
      information: infoRow,
      pageNavigation: pageNav,
      tabs,
      tools,
      browseHeader,
      browse,
      footer: footerMarkup,
    },
  });

  for (const regionName of [
    "live",
    "information",
    "page-navigation",
    "tabs",
    "tools",
    "browse-header",
    "browse",
    "footer",
  ]) {
    assert.equal(
      shellMarkup.match(
        new RegExp(`data-fvc-region="${regionName}"`, "g"),
      )?.length,
      1,
    );
  }
});
