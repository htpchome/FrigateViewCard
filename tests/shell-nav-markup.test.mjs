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
  buildPopupShellMarkup,
  buildTabsMarkup,
  buildTabsRegionMarkup,
  buildToolsMarkup,
  buildToolsRegionMarkup,
  resolveToolbarModeButtonStates,
} from "../src/card/controls/shell-nav.tmpl.js";
import { buildSingleViewMainLayoutShellMarkup } from "../src/features/single-view/page.tmpl.js";
import {
  buildLiveFullscreenControlMarkup,
  buildLivePictureInPictureControlMarkup,
  buildLivePlaybackControlsMarkup,
  buildLiveTakeSnapshotControlMarkup,
  buildLiveMuteControlMarkup,
} from "../src/features/live/view.tmpl.js";

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

test("buildToolsMarkup places Wide View alert takeover beside grid", () => {
  const markup = buildToolsMarkup({
    tab: "alerts",
    viewMode: "single",
    icons,
    isFilterPanelOpen: false,
    isCalendarPanelOpen: false,
    isGridModeAvailable: true,
    isSlideshowRotationAvailable: false,
    isSlideshowActive: false,
    isControlsVisible: true,
    gridButtonIcon: "G",
    slideshowButtonIcon: "L",
    showWideAlertTakeover: true,
    wideAlertTakeoverEnabled: true,
    wideAlertTakeoverButtonIcon: "T",
  });

  assert.match(
    markup,
    /id="grid-btn"[\s\S]*?id="wide-alert-takeover-btn"/,
  );
  assert.match(
    markup,
    /class="tool active" id="wide-alert-takeover-btn"[^>]*aria-pressed="true"/,
  );
  assert.match(markup, /title="Disable Alert Camera Takeover"/);
  assert.doesNotMatch(markup, /<\/button><\/button>/);
});

test("Wide View toolbar modes disable every other mode", () => {
  const cases = [
    {
      active: { controlsActive: true },
      expected: {
        controlsDisabled: false,
        gridDisabled: true,
        slideshowDisabled: true,
        wideAlertTakeoverDisabled: true,
        filterDisabled: true,
        calendarDisabled: true,
      },
    },
    {
      active: { gridActive: true },
      expected: {
        controlsDisabled: true,
        gridDisabled: false,
        slideshowDisabled: true,
        wideAlertTakeoverDisabled: true,
        filterDisabled: false,
        calendarDisabled: false,
      },
    },
    {
      active: { slideshowActive: true },
      expected: {
        controlsDisabled: true,
        gridDisabled: true,
        slideshowDisabled: false,
        wideAlertTakeoverDisabled: true,
        filterDisabled: false,
        calendarDisabled: false,
      },
    },
    {
      active: { wideAlertTakeoverActive: true },
      expected: {
        controlsDisabled: true,
        gridDisabled: true,
        slideshowDisabled: true,
        wideAlertTakeoverDisabled: false,
        filterDisabled: false,
        calendarDisabled: false,
      },
    },
  ];

  for (const { active, expected } of cases) {
    assert.deepEqual(
      resolveToolbarModeButtonStates({
        controlsVisible: true,
        ...active,
      }),
      { controlsVisible: true, ...expected },
    );
  }
});

test("buildToolsMarkup renders Alert Camera Takeover as disabled", () => {
  const markup = buildToolsMarkup({
    tab: "alerts",
    viewMode: "single",
    icons,
    isFilterPanelOpen: false,
    isCalendarPanelOpen: false,
    isGridModeAvailable: true,
    isSlideshowRotationAvailable: true,
    isSlideshowActive: true,
    isControlsVisible: true,
    controlsDisabled: true,
    gridDisabled: true,
    slideshowDisabled: false,
    wideAlertTakeoverDisabled: true,
    gridButtonIcon: "G",
    slideshowButtonIcon: "L",
    showWideAlertTakeover: true,
    wideAlertTakeoverEnabled: false,
    wideAlertTakeoverButtonIcon: "T",
  });

  assert.match(markup, /id="wide-alert-takeover-btn"[^>]* disabled/);
  assert.doesNotMatch(markup, /id="slideshow-btn"[^>]* disabled/);
  assert.doesNotMatch(markup, /id="filter-btn"[^>]* disabled/);
  assert.doesNotMatch(markup, /id="cal-btn"[^>]* disabled/);
});

test("buildControlsSectionMarkup enables pan, tilt, and zoom on the circle pad", () => {
  const markup = buildControlsSectionMarkup({
    panTiltEnabled: true,
    zoomEnabled: true,
  });

  assert.match(markup, /<circle-pad-control-2 id="controls-pad"><\/circle-pad-control-2>/);
  assert.doesNotMatch(markup, /disabled-actions=/);
  assert.doesNotMatch(markup, /controls-readout|Readout/);
});

test("buildControlsSectionMarkup disables unavailable zoom actions on the circle pad", () => {
  const markup = buildControlsSectionMarkup({
    panTiltEnabled: true,
    zoomEnabled: false,
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
  const liveFullscreen = buildLiveFullscreenControlMarkup({
    icons: { expand: "E" },
  });
  const livePictureInPicture = buildLivePictureInPictureControlMarkup({
    icons: { pipPopOut: "P" },
  });
  const liveTakeSnapshot = buildLiveTakeSnapshotControlMarkup({
    icons: { takeSnapshot: "S" },
  });
  const liveMute = buildLiveMuteControlMarkup({
    icons: { volOff: "M", volOn: "V" },
    streamMuted: true,
  });
  assert.doesNotMatch(liveEngineWrap, /id="(?:live-fs-btn|mute-btn)"/);
  assert.match(
    liveFullscreen,
    /^<button[^>]*id="live-fs-btn"[^>]*data-fvc-region="live-fullscreen"/,
  );
  assert.doesNotMatch(liveFullscreen, /<div/);
  assert.doesNotMatch(liveFullscreen, /live-playback-btn/);
  assert.doesNotMatch(liveFullscreen, /id="live-airplay-btn"/);
  assert.match(liveFullscreen, /class="square-btn live-fs-btn"/);
  assert.match(
    livePictureInPicture,
    /^<button[^>]*class="square-btn live-pip-btn"[^>]*id="live-pip-btn"[^>]*data-fvc-region="live-picture-in-picture"/,
  );
  assert.match(livePictureInPicture, /aria-pressed="false"[^>]* hidden>P/);
  assert.match(
    liveTakeSnapshot,
    /^<button[^>]*class="square-btn live-take-snapshot-btn"[^>]*id="live-take-snapshot-btn"[^>]*data-fvc-region="live-take-snapshot"/,
  );
  assert.match(liveTakeSnapshot, /title="Take Snapshot"[^>]*>S<\/button>$/);
  assert.match(liveMute, /class="square-btn mute-btn"/);
  const livePlaybackControls = buildLivePlaybackControlsMarkup({
    livePictureInPicture,
    liveTakeSnapshot,
    liveFullscreen,
    liveMute,
  });
  assert.match(
    livePlaybackControls,
    /live-pip-btn[\s\S]*?live-take-snapshot-btn[\s\S]*?live-fs-btn[\s\S]*?mute-btn/,
  );

  const mobileLiveFullscreen = buildLiveFullscreenControlMarkup({
    icons: { expand: "E" },
    buttonClass: "icon-btn",
  });
  const mobileLiveMute = buildLiveMuteControlMarkup({
    icons: { volOff: "M", volOn: "V" },
    streamMuted: true,
    buttonClass: "icon-btn",
  });
  const mobileLiveTakeSnapshot = buildLiveTakeSnapshotControlMarkup({
    icons: { takeSnapshot: "S" },
    buttonClass: "icon-btn",
  });
  assert.match(mobileLiveFullscreen, /class="icon-btn live-fs-btn"/);
  assert.doesNotMatch(mobileLiveFullscreen, /square-btn/);
  assert.match(mobileLiveMute, /class="icon-btn mute-btn"/);
  assert.doesNotMatch(mobileLiveMute, /square-btn/);
  const mobileInlineMute = buildLiveMuteControlMarkup({
    icons: { volOff: "M", volOn: "V" },
    streamMuted: false,
    buttonClass: "icon-btn",
    buttonId: "mobile-view-mute-btn",
    region: "",
    extraClass: "mobile-view-inline-mute-btn",
  });
  assert.match(
    mobileInlineMute,
    /class="icon-btn mute-btn mobile-view-inline-mute-btn"/,
  );
  assert.match(mobileInlineMute, /id="mobile-view-mute-btn"/);
  assert.doesNotMatch(mobileInlineMute, /data-fvc-region/);
  assert.match(
    mobileLiveTakeSnapshot,
    /class="icon-btn live-take-snapshot-btn"/,
  );
  assert.doesNotMatch(mobileLiveTakeSnapshot, /square-btn/);
  const browseHeader = buildBrowseHeaderRegionMarkup({
    icons: { left: "<", right: ">" },
  });
  const browse = buildBrowseRegionMarkup();
  const tabs = buildTabsRegionMarkup({ markup: "Tabs" });
  const tools = buildToolsRegionMarkup({ markup: "Tools" });
  const footerMarkup = buildFooterMarkup({
    icons: { frigateView: "F" },
  });
  const hintOnlyFooterMarkup = buildFooterMarkup({
    icons: { frigateView: "F" },
    includeFrigateView: false,
  });
  assert.match(
    hintOnlyFooterMarkup,
    /class="footer footer--older-hint-only"[^>]*data-fvc-region="footer"/,
  );
  assert.match(hintOnlyFooterMarkup, /id="older-hint"/);
  assert.doesNotMatch(hintOnlyFooterMarkup, /class="frigate-view"/);
  assert.doesNotMatch(hintOnlyFooterMarkup, />F</);
  const shellMarkup = buildSingleViewMainLayoutShellMarkup({
    regions: {
      live: liveEngineWrap,
      livePictureInPicture,
      information: infoRow,
      liveFullscreen,
      liveTakeSnapshot,
      liveMute,
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
    "live-picture-in-picture",
    "information",
    "page-navigation",
    "live-fullscreen",
    "live-take-snapshot",
    "live-mute",
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

test("shared info row can hide title and subtitle independently", () => {
  const markup = buildInfoRowMarkup({
    title: "FrigateView",
    subtitle: "Driveway",
    displayTitle: false,
    displaySubtitle: false,
    version: "1.0.0",
  });

  assert.match(markup, /id="info-title" hidden/);
  assert.match(markup, /id="tl-range" hidden/);
});

test("popup custom media controls place AirPlay beside fullscreen", () => {
  const markup = buildPopupShellMarkup({
    version: "1.0.0",
    icons: {
      play: "P",
      volOn: "M",
      expand: "F",
      airplayVideo: "A",
    },
  });

  assert.match(markup, /id="popup-media-fs"/);
  assert.match(markup, /id="popup-media-airplay"[^>]* hidden/);
  assert.doesNotMatch(markup, /id="popup-info-head"/);
  assert.match(markup, /id="recording-scrub-preview"[^>]* hidden/);
  assert.match(markup, /id="recording-scrub-preview-image"/);
  assert.match(markup, /id="recording-scrub-preview-label"/);
  assert.match(
    markup,
    /id="popup-carousel-left"[^>]*type="button"[^>]*aria-label="Previous carousel page"[^>]*aria-controls="popup-carousel"[^>]* hidden/,
  );
  assert.match(
    markup,
    /id="popup-carousel-right"[^>]*type="button"[^>]*aria-label="Next carousel page"[^>]*aria-controls="popup-carousel"[^>]* hidden/,
  );
});
