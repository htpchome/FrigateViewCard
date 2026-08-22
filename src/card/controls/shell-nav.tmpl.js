import { resolveActiveTab } from "../../helpers.js";
import { DEFAULT_SUBTITLE } from "../../constants.js";
export { buildLiveEngineWrapMarkup } from "../../features/live/view.tmpl.js";

export function buildPageNavButtonsMarkup({
  routes,
  activePageId,
  getRouteLabel,
  getRouteIcon,
}) {
  return routes
    .map((pageId) => {
      const isActive = pageId === activePageId;
      const label = getRouteLabel(pageId);
      const icon =
        typeof getRouteIcon === "function" ? getRouteIcon(pageId) : "";
      return `<button class="page-nav-btn${
        isActive ? " active" : ""
      } tool icon-btn" type="button" data-page-route="${pageId}" aria-label="${label}" title="${label}" aria-pressed="${
        isActive ? "true" : "false"
      }">${icon || label}</button>`;
    })
    .join("");
}

export function buildPageNavMarkup(options) {
  return `<div class="page-nav" data-fvc-region="page-navigation" aria-label="Page navigation">${buildPageNavButtonsMarkup(options)}</div>`;
}

export function buildCamSwitcherRegionMarkup({ markup = "" } = {}) {
  const content = String(markup || "");
  if (!content) return "";
  return `<div class="cam-switcher" id="cam-switcher" data-fvc-region="camera-switcher">${content}</div>`;
}

export function buildTabsRegionMarkup({ markup = "" } = {}) {
  return `<div class="tabs" data-fvc-region="tabs">${String(markup || "")}</div>`;
}

export function buildToolsRegionMarkup({ markup = "" } = {}) {
  return `<div class="tl-tools-slot" data-fvc-region="tools">${String(markup || "")}</div>`;
}

export function resolveSubtitleText(config) {
  return config?.subtitle || DEFAULT_SUBTITLE;
}

export function buildTabsMarkup({
  tab,
  hiddenTabs,
  viewMode,
  icons,
  buttonClass = "circle-btn",
}) {
  const ht = new Set(hiddenTabs || []);
  const gridModeListOnly = viewMode === "grid";
  const tabOrder = gridModeListOnly
    ? ["alerts", "kept", "controls"]
    : ["alerts", "clips", "snapshot", "recordings", "kept", "controls"];
  const activeTab = resolveActiveTab(tab, ht, tabOrder);
  const tabButtonClass =
    String(buttonClass || "circle-btn").trim() || "circle-btn";
  const tabMarkup = (id, icon, label) =>
    ht.has(id) ||
    (gridModeListOnly && ["clips", "snapshot", "recordings"].includes(id))
      ? ""
      : id === activeTab
        ? `<div class="${tabButtonClass} active" data-tab="${id}" title="${label}">${icon}</div>`
        : `<div class="${tabButtonClass}" data-tab="${id}" title="${label}">${icon}</div>`;
  const markup = `${tabMarkup("alerts", icons.alerts, "Alerts")}
      ${tabMarkup("clips", icons.clips, "Clips")}
      ${tabMarkup("snapshot", icons.snapshot, "Snapshots")}
      ${tabMarkup("recordings", icons.recordings, "Recordings")}
      ${tabMarkup("kept", icons.star, "Kept events")}`;
  return { activeTab, markup };
}

export function resolveToolbarModeButtonStates({
  controlsVisible = false,
  controlsActive = false,
  gridActive = false,
  slideshowActive = false,
  wideAlertTakeoverActive = false,
} = {}) {
  return {
    controlsVisible: controlsVisible === true,
    controlsDisabled:
      gridActive || slideshowActive || wideAlertTakeoverActive,
    gridDisabled:
      controlsActive || slideshowActive || wideAlertTakeoverActive,
    slideshowDisabled:
      controlsActive || gridActive || wideAlertTakeoverActive,
    wideAlertTakeoverDisabled:
      controlsActive || gridActive || slideshowActive,
    filterDisabled: controlsActive,
    calendarDisabled: controlsActive,
  };
}

export function buildToolsMarkup({
  tab,
  viewMode,
  icons,
  buttonClass = "tool",
  isFilterPanelOpen,
  isCalendarPanelOpen,
  isGridModeAvailable,
  isSlideshowRotationAvailable,
  isSlideshowActive,
  isControlsVisible,
  controlsDisabled,
  gridDisabled,
  slideshowDisabled,
  wideAlertTakeoverDisabled,
  filterDisabled,
  calendarDisabled,
  gridButtonIcon,
  slideshowButtonIcon,
  showWideAlertTakeover = false,
  wideAlertTakeoverEnabled = false,
  wideAlertTakeoverButtonIcon = "",
}) {
  const toolButtonClass =
    String(buttonClass || "tool").trim() || "tool";
  const resolvedFilterDisabled = filterDisabled || tab === "recordings";
  const controlsHidden = isControlsVisible === false;
  const gridHidden = !isGridModeAvailable;
  const gridActive = viewMode === "grid";
  const gridButton = gridHidden
    ? ""
    : `<button class="${toolButtonClass}${gridActive ? " active" : ""}" id="grid-btn" aria-pressed="${gridActive ? "true" : "false"}" title="${gridActive ? "Stop grid mode" : "Start grid mode"}" aria-label="${gridActive ? "Stop grid mode" : "Start grid mode"}" ${gridDisabled ? "disabled" : ""}>${gridButtonIcon}</button>`;
  const wideAlertTakeoverLabel = wideAlertTakeoverEnabled
    ? "Disable Alert Camera Takeover"
    : "Enable Alert Camera Takeover";
  const wideAlertTakeoverButton = showWideAlertTakeover
    ? `<button class="${toolButtonClass}${wideAlertTakeoverEnabled ? " active" : ""}" id="wide-alert-takeover-btn" type="button" aria-pressed="${wideAlertTakeoverEnabled ? "true" : "false"}" title="${wideAlertTakeoverLabel}" aria-label="${wideAlertTakeoverLabel}" ${wideAlertTakeoverDisabled ? "disabled" : ""}>${wideAlertTakeoverButtonIcon}</button><div class="divider">${icons.divider}</div>`
    : "";
  const slideshowHidden = !isSlideshowRotationAvailable;
  const slideshowActive = isSlideshowActive;
  const slideshowButton = slideshowHidden
    ? ""
    : `<button class="${toolButtonClass} slideshow-btn${slideshowActive ? " active" : ""}" id="slideshow-btn" aria-pressed="${slideshowActive ? "true" : "false"}" title="${slideshowActive ? "Stop slideshow rotation" : "Start slideshow rotation"}" aria-label="${slideshowActive ? "Stop slideshow rotation" : "Start slideshow rotation"}" ${slideshowDisabled ? "disabled" : ""}>${slideshowButtonIcon}</button><div class="divider">${icons.divider}</div>`;
  const markup = `<div class="tl-tools">
        ${controlsHidden ? "" : `<button class="${toolButtonClass}${tab === "controls" ? " active" : ""}" id="controls-btn" title="Controls" aria-label="Controls" aria-pressed="${tab === "controls" ? "true" : "false"}" ${controlsDisabled ? "disabled" : ""}>${icons.bullseye}</button><div class="divider">${icons.divider}</div>`}
        ${gridButton}
        ${wideAlertTakeoverButton}
        ${slideshowButton}
        <button class="${toolButtonClass}${isFilterPanelOpen ? " active" : ""}" id="filter-btn" title="Filter" aria-pressed="${isFilterPanelOpen ? "true" : "false"}" ${resolvedFilterDisabled ? "disabled" : ""}>${icons.filter}</button>
        <div class="filter-panel" id="filter-panel" data-fvc-region="filter-panel" style="display:none"></div>
        <button class="${toolButtonClass}${isCalendarPanelOpen ? " active" : ""}" id="cal-btn" title="Calendar" aria-pressed="${isCalendarPanelOpen ? "true" : "false"}" ${calendarDisabled ? "disabled" : ""}>${icons.calendar}</button>
        <div class="cal-panel" id="cal-panel" data-fvc-region="calendar-panel" style="display:none"></div>
      </div>`;
  return markup;
}

export function buildInfoRowMarkup({
  title,
  subtitle,
  displayTitle = true,
  displaySubtitle = true,
  version,
  pageNav = "",
  centerActionMarkup = "",
}) {
  return `<div class="info-row" data-fvc-region="information">
              <div class="info-left">
                <div class="info-title" id="info-title" ${displayTitle ? "" : "hidden"}>${title}</div>
                <span class="section-label" id="tl-range" ${displaySubtitle ? "" : "hidden"}>${subtitle}</span>
              </div>
              ${pageNav ? `<div class="info-row-page-nav">${pageNav}</div>` : ""}
              ${centerActionMarkup ? `<div class="info-row-action-slot" data-fvc-region="two-way-talk">${centerActionMarkup}</div>` : ""}
              <div class="stats">
                <div class="stat">
                  <div class="sv">v${version}</div>
                  <div class="sl">Version</div>
                </div>
                <div class="stat">
                  <div class="sv stream-type" id="stream-type">--</div>
                  <div class="sl">Stream</div>
                </div>
                <div class="stat">
                  <div class="sv" id="alert-count">—</div>
                  <div class="sl">Alerts</div>
                </div>
                <div class="stat">
                  <div class="sv" id="on-dot" style="color:var(--c-on)">●</div>
                  <div class="sl" id="on-lbl">Online</div>
                </div>
              </div>
            </div>`;
}


function mergeClassNames(...tokens) {
  return [
    ...new Set(tokens.filter(Boolean).join(" ").split(/\s+/).filter(Boolean)),
  ].join(" ");
}

export function buildBrowseHeaderRegionMarkup({ icons }) {
  return `<div class="browse-head" id="browse-head" data-fvc-region="browse-header" style="display:none">
              <div class="browse-head-left">
                <button class="prev-next" id="rec-day-prev" data-rec-day-nav="-1" title="Previous day" aria-label="Previous day" style="display:none">${icons.left}Previous</button>
              </div>
              <div class="browse-head-middle" id="browse-head-label"></div>
              <div class="browse-head-right">
                <button class="prev-next" id="rec-day-next" data-rec-day-nav="1" title="Next day" aria-label="Next day" style="display:none">Next${icons.right}</button>
              </div>
            </div>`;
}

export function buildBrowseRegionMarkup({ layoutProfile = {} } = {}) {
  const browseClassName = mergeClassNames("browse", layoutProfile.browseClass);
  return `<div class="${browseClassName}" id="browse" data-fvc-region="browse" style="display:none">
              <div class="list-head">
                <span class="newtoast" id="newtoast" style="display:none">new ✦</span>
              </div>
              <div class="list" id="list">
                <div class="empty">Loading…</div>
              </div>
            </div>`;
}

export function buildFooterMarkup({
  icons = {},
  includeFrigateView = true,
} = {}) {
  const footerClass = includeFrigateView
    ? "footer"
    : "footer footer--older-hint-only";
  const frigateView = includeFrigateView
    ? `<div><div class="frigate-view">${icons.frigateView || ""}</div></div>`
    : "";
  const trailingSpacer = includeFrigateView ? "<div></div>" : "";
  return `<div class="${footerClass}" data-fvc-region="footer">
              ${frigateView}
              <div class="more" id="older-hint" hidden>scroll for older…</div>
              ${trailingSpacer}
            </div>`;
}

export function buildControlsSectionMarkup({
  panTiltEnabled = false,
  zoomEnabled = false,
} = {}) {
  const padDisabledActions = [
    ...(panTiltEnabled ? [] : ["up", "right", "down", "left"]),
    ...(zoomEnabled ? [] : ["zoom-in", "zoom-out"]),
  ].join(" ");
  return `<div class="controls-pad-wrap${panTiltEnabled || zoomEnabled ? "" : " is-disabled"}">
            <circle-pad-control-2 id="controls-pad"${padDisabledActions ? ` disabled-actions="${padDisabledActions}"` : ""}></circle-pad-control-2>
          </div>`;
}

export function buildPopupShellMarkup({ icons, version }) {
  return `<div id="myPopup" class="popup-content">
            <div class="popup-close-row">
              <button class="round-btn" aria-label="Close">${icons.close}</button> 
            </div>
            <div class="popup-header"></div>          
            <div class="popup-body">
              <div class="viewer" id="viewer" style="display:none"></div>
              <div class="popup-media-controls" id="popup-media-controls" hidden>
                <span class="popup-media-controls-spacer" aria-hidden="true"></span>
                <button class="popup-media-btn" id="popup-media-play" type="button" title="Play/Pause" aria-label="Play/Pause">${icons.play}</button>
                <input class="popup-media-progress" id="popup-media-progress" type="range" min="0" max="1000" value="0" step="1" aria-label="Media progress">
                <span class="popup-media-time" id="popup-media-time">0:00/0:00</span>
                <button class="popup-media-btn" id="popup-media-mute" type="button" title="Mute" aria-label="Mute">${icons.volOn}</button>
                <button class="popup-media-btn" id="popup-media-fs" type="button" title="Fullscreen" aria-label="Fullscreen">${icons.expand}</button>
                <button class="popup-media-btn" id="popup-media-airplay" type="button" title="AirPlay video" aria-label="AirPlay video" hidden>${icons.airplayVideo}</button>
                <span class="popup-media-controls-spacer" aria-hidden="true"></span>
              </div>
                <div class="recording-scrub" id="recording-scrub" hidden>
                  <div class="recording-scrub-track" id="recording-scrub-track">
                    <div class="recording-scrub-ticks" id="recording-scrub-ticks"></div>
                    <div class="recording-scrub-markers" id="recording-scrub-markers"></div>
                    <div class="recording-scrub-cursor" id="recording-scrub-cursor"></div>
                    <div class="recording-scrub-preview" id="recording-scrub-preview" hidden>
                      <img id="recording-scrub-preview-image" alt="">
                      <span id="recording-scrub-preview-label"></span>
                    </div>
                  </div>
                  <div class="recording-scrub-labels">
                    <span id="recording-scrub-start">0:00</span>
                    <span class="recording-scrub-now" id="recording-scrub-now">0:00 / 0:00</span>
                    <span id="recording-scrub-end">0:00</span>
                  </div>
                </div>
                <div class="popup-info" id="popup-info" hidden></div>
                <div class="popup-carousel-wrap" id="popup-carousel-wrap" hidden>
                  <button class="popup-carousel-nav left" id="popup-carousel-left" data-carousel-dir="-1" type="button" title="Previous carousel page" aria-label="Previous carousel page" aria-controls="popup-carousel" hidden>${icons.left}
                  </button>
                  <div class="popup-carousel" id="popup-carousel"></div>
                  <button class="popup-carousel-nav right" id="popup-carousel-right" data-carousel-dir="1" type="button" title="Next carousel page" aria-label="Next carousel page" aria-controls="popup-carousel" hidden>${icons.right}
                  </button>
                </div>
                <h1 class="popup-shell-ver" id="popup-shell-ver">v${version}</h1>
            </div>
          </div>`;
}
