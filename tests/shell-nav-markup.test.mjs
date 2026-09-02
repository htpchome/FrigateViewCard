import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

import {
  buildCamSwitcherRegionMarkup,
  buildFooterMarkup,
  buildInfoRowMarkup,
  buildTabsRegionMarkup,
  buildToolsRegionMarkup,
} from "../src/card/shell.tmpl.js";
import {
  buildTabsMarkup,
  buildToolsMarkup,
  resolveToolbarModeButtonStates,
} from "../src/card/toolbar.tmpl.js";
import {
  buildPageNavButtonsMarkup,
  buildPageNavMarkup,
} from "../src/features/navigation/page-nav.tmpl.js";
import {
  buildBrowseHeaderRegionMarkup,
  buildBrowseRegionMarkup,
} from "../src/features/browse/shell.tmpl.js";
import { buildControlsSectionMarkup } from "../src/features/ptz/controls.tmpl.js";
import { buildPopupShellMarkup } from "../src/features/popup/shell.tmpl.js";
import { STYLES } from "../src/styles.js";
import { buildSingleViewMainLayoutShellMarkup } from "../src/features/single-view/page.tmpl.js";
import {
  buildLiveEngineWrapMarkup,
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

const circlePadSource = fs.readFileSync(
  new URL("../src/components/circle-pad/circle-pad.js", import.meta.url),
  "utf8",
);

test("atomic shell fragments own their controller region anchors", () => {
  const fragments = {
    cameraSwitcher: buildCamSwitcherRegionMarkup({ markup: "Cameras" }),
    tabs: buildTabsRegionMarkup({ markup: "Tabs" }),
    tools: buildToolsRegionMarkup({ markup: "Tools" }),
    browseHeader: buildBrowseHeaderRegionMarkup({
      icons: { back: "BACK", forward: "FORWARD" },
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
  assert.match(
    fragments.browseHeader,
    /class="round-btn recordings-day-nav" id="rec-day-prev"[^>]*type="button"[^>]*>BACK<\/button>/,
  );
  assert.match(
    fragments.browseHeader,
    /class="round-btn recordings-day-nav" id="rec-day-next"[^>]*type="button"[^>]*>FORWARD<\/button>/,
  );
  assert.doesNotMatch(STYLES, /\.prev-next/);
  assert.match(
    STYLES,
    /\.card\.recordings-browse-head-tall \.browse-head\{min-height:3\.5rem;max-height:none;\}/,
  );
  assert.match(STYLES, /@media \(hover:none\)/);
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
    {
      active: { twoWayTalkActive: true },
      expected: {
        controlsDisabled: false,
        gridDisabled: true,
        slideshowDisabled: true,
        wideAlertTakeoverDisabled: true,
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

test("buildControlsSectionMarkup renders imported PTZ preset chips safely", () => {
  const markup = buildControlsSectionMarkup({
    panTiltEnabled: true,
    zoomEnabled: true,
    presetItems: [
      { name: "preset1", isHome: false },
      { name: "Home", isHome: true },
      { name: 'Entry & "Side"', isHome: false },
    ],
  });

  assert.match(markup, /class="controls-presets"/);
  assert.match(markup, /data-ptz-preset="preset1"/);
  assert.match(
    markup,
    /controls-preset-chip--camera is-home[^>]*data-ptz-preset="Home"/,
  );
  assert.match(markup, />Entry &amp; &quot;Side&quot;<\/button>/);
  assert.match(
    markup,
    /Camera Presets - presets are set on the camera\./,
  );
  assert.doesNotMatch(markup, /controls-presets-label/);
});

test("buildControlsSectionMarkup omits the preset disclaimer without camera presets", () => {
  const markup = buildControlsSectionMarkup({
    panTiltEnabled: true,
    zoomEnabled: true,
  });

  assert.doesNotMatch(markup, /controls-presets-note/);
  assert.doesNotMatch(markup, /presets are set on the camera/);
});

test("PTZ preset actions remain compact wrapping chips", () => {
  assert.match(
    STYLES,
    /\.controls-preset-list\{display:flex;justify-content:center;[^}]*flex-wrap:wrap;/,
  );
  assert.match(
    STYLES,
    /\.controls-preset-chip\{[^}]*display:inline-flex;[^}]*width:auto;/,
  );
  assert.doesNotMatch(
    STYLES,
    /\.controls-preset-list\{[^}]*grid-template-columns:/,
  );
  assert.match(
    STYLES,
    /\.controls-presets\{[^}]*background:transparent;[^}]*border:0;/,
  );
  assert.match(
    STYLES,
    /\.controls-presets-note\{[^}]*text-align:center;/,
  );
  assert.match(
    STYLES,
    /@media \(hover:hover\) and \(pointer:fine\)\{\.controls-preset-chip:hover:not\(:disabled\)/,
  );
  assert.doesNotMatch(
    STYLES,
    /\.controls-preset-chip:hover:not\(:disabled\),\.controls-preset-chip:focus-visible/,
  );
});

test("circle pad keeps keyboard navigation with shape-aware focus styling", () => {
  for (const action of ["up", "right", "down", "left", "zoom-in", "zoom-out"]) {
    assert.equal(
      circlePadSource.includes(
        `tabindex="0" \${CIRCLE_PAD_DATA_ACTION}="${action}"`,
      ),
      true,
    );
  }
  assert.match(
    circlePadSource,
    /\.slice-button:focus-visible \.circle-pad-key \{[\s\S]*?stroke: var\(--circle-pad-accent\);/,
  );
  assert.match(
    circlePadSource,
    /\.slice-button,[\s\S]*?\.slice-button:focus \{[\s\S]*?outline: none;/,
  );
  assert.match(circlePadSource, /\["keydown", "_onKeyDown"\]/);
  assert.match(circlePadSource, /\["keyup", "_onKeyUp"\]/);
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
    pressed: true,
  });
  assert.match(
    mobileInlineMute,
    /class="icon-btn mute-btn mobile-view-inline-mute-btn active"/,
  );
  assert.match(mobileInlineMute, /id="mobile-view-mute-btn"/);
  assert.match(mobileInlineMute, /aria-pressed="true"/);
  assert.doesNotMatch(mobileInlineMute, /data-fvc-region/);
  const hiddenTalkMute = buildLiveMuteControlMarkup({
    icons: { volOff: "M", volOn: "V" },
    streamMuted: false,
    buttonClass: "icon-btn",
    buttonId: "two-way-talk-mute-btn",
    region: "",
    extraClass: "two-way-talk-inline-mute-btn",
    pressed: true,
    hidden: true,
  });
  assert.match(hiddenTalkMute, /id="two-way-talk-mute-btn"[^>]* hidden/);
  assert.match(
    mobileLiveTakeSnapshot,
    /class="icon-btn live-take-snapshot-btn"/,
  );
  assert.doesNotMatch(mobileLiveTakeSnapshot, /square-btn/);
  const browseHeader = buildBrowseHeaderRegionMarkup({
    icons: { left: "<", right: ">" },
  });
  const browse = buildBrowseRegionMarkup();
  assert.match(browse, /class="browse-return-top-slot"/);
  assert.match(
    browse,
    /id="browse-return-top"[^>]*aria-label="Return to top"[^>]* hidden/,
  );
  assert.ok(
    browse.indexOf('class="browse-return-top-slot"') <
      browse.indexOf('class="list" id="list"'),
  );
  const tabs = buildTabsRegionMarkup({ markup: "Tabs" });
  const tools = buildToolsRegionMarkup({ markup: "Tools" });
  const footerMarkup = buildFooterMarkup({
    icons: { frigateView: "F" },
    version: "1.0.0",
  });
  const omittedFooterMarkup = buildFooterMarkup({
    icons: { frigateView: "F" },
    includeFrigateView: false,
  });
  assert.equal(omittedFooterMarkup, "");
  assert.doesNotMatch(footerMarkup, /older-hint|scroll for older/i);
  assert.match(footerMarkup, /class="footer-version"[^>]*>v1\.0\.0<\/div>/);
  assert.doesNotMatch(infoRow, />Version</);
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

test("popup custom media controls include volume and place AirPlay beside fullscreen", () => {
  const markup = buildPopupShellMarkup({
    version: "1.0.0",
    icons: {
      play: "P",
      volOn: "M",
      expand: "F",
      airplayVideo: "A",
      close: "X",
      rotate: "R",
      download: "D",
    },
  });

  assert.match(markup, /id="myPopup" class="popup-content" data-no-swipe/);
  assert.match(markup, /id="popup-media-fs"/);
  assert.match(
    markup,
    /id="close-btn" class="close-btn round-btn"[^>]*>X<\/button>/,
  );
  assert.match(
    markup,
    /id="popup-media-volume"[^>]*type="range"[^>]*min="0"[^>]*max="100"/,
  );
  assert.match(markup, /id="popup-media-airplay"[^>]* hidden/);
  assert.doesNotMatch(markup, /id="popup-info-head"/);
  assert.match(markup, /id="recording-scrub-preview"[^>]* hidden/);
  assert.match(markup, /id="recording-scrub-preview-image"/);
  assert.match(markup, /id="recording-scrub-preview-label"/);
  assert.match(markup, /id="recording-scrub-play"/);
  assert.match(markup, /id="recording-segment-selection"[^>]* hidden/);
  assert.match(
    markup,
    /data-recording-segment-handle="start"[^>]*role="slider"/,
  );
  assert.match(
    markup,
    /data-recording-segment-handle="end"[^>]*role="slider"/,
  );
  assert.match(
    markup,
    /id="recording-segment-manager"[^>]*aria-label="Recording segment download"[^>]* hidden/,
  );
  assert.match(
    markup,
    /id="recording-segment-reset"[^>]*>R<span>Reset<\/span>/,
  );
  assert.match(
    markup,
    /id="recording-segment-cancel"[^>]*>X<span>Cancel<\/span>/,
  );
  assert.doesNotMatch(
    markup,
    /id="recording-segment-reset"[^>]*>Entire recording<\/button>/,
  );
  assert.match(markup, /id="recording-segment-handle-start-time"/);
  assert.match(markup, /id="recording-segment-handle-end-time"/);
  assert.match(markup, /id="recording-segment-preview-button"/);
  assert.match(markup, /id="recording-segment-download"/);
  assert.match(markup, /id="recording-segment-preview-modal"[^>]* hidden/);
  assert.match(markup, /id="recording-segment-preview-video-host"/);
  assert.match(markup, /id="recording-segment-preview-download"/);
  assert.match(markup, /Preview Segment/);
  assert.match(markup, /Download Segment/);
  assert.match(
    STYLES,
    /\.recording-scrub-play \{[^}]*width:40px;[^}]*height:44px;/,
  );
  assert.match(
    STYLES,
    /\.recording-segment-tool \{[^}]*flex-direction:column;[^}]*flex:0 0 42px;/,
  );
  assert.match(
    STYLES,
    /\.recording-segment-reset \{[^}]*--warning-color/,
  );
  assert.match(
    STYLES,
    /\.recording-segment-cancel \{[^}]*--error-color/,
  );
  assert.match(
    markup,
    /id="popup-carousel-left"[^>]*type="button"[^>]*aria-label="Previous carousel page"[^>]*aria-controls="popup-carousel"[^>]* hidden/,
  );
  assert.match(
    markup,
    /id="popup-carousel-right"[^>]*type="button"[^>]*aria-label="Next carousel page"[^>]*aria-controls="popup-carousel"[^>]* hidden/,
  );
});
