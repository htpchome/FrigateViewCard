import { resolveActiveTab } from "../../helpers.js";
import { DEFAULT_SUBTITLE } from "../../constants.js";
import { escapeHtml, escapeHtmlAttribute } from "../../shared/html.js";
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
      } tool" type="button" data-page-route="${escapeHtmlAttribute(pageId)}" aria-label="${escapeHtmlAttribute(label)}" title="${escapeHtmlAttribute(label)}" aria-pressed="${
        isActive ? "true" : "false"
      }">${icon || escapeHtml(label)}</button>`;
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
  twoWayTalkActive = false,
} = {}) {
  return {
    controlsVisible: controlsVisible === true,
    controlsDisabled:
      gridActive || slideshowActive || wideAlertTakeoverActive,
    gridDisabled:
      controlsActive ||
      slideshowActive ||
      wideAlertTakeoverActive ||
      twoWayTalkActive,
    slideshowDisabled:
      controlsActive ||
      gridActive ||
      wideAlertTakeoverActive ||
      twoWayTalkActive,
    wideAlertTakeoverDisabled:
      controlsActive || gridActive || slideshowActive || twoWayTalkActive,
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
        ${controlsHidden ? "" : `<button class="${toolButtonClass}${tab === "controls" ? " active" : ""}" id="controls-btn" title="PTZ Controls" aria-label="Controls" aria-pressed="${tab === "controls" ? "true" : "false"}" ${controlsDisabled ? "disabled" : ""}>${icons.ptz}</button><div class="divider">${icons.divider}</div>`}
        ${gridButton}
        ${wideAlertTakeoverButton}
        ${slideshowButton}
        <button class="${toolButtonClass}${isFilterPanelOpen ? " active" : ""}" id="filter-btn" title="Filter" aria-pressed="${isFilterPanelOpen ? "true" : "false"}" ${resolvedFilterDisabled ? "disabled" : ""}>${icons.filter}</button>
        <div class="filter-panel shadow-small" id="filter-panel" data-fvc-region="filter-panel" style="display:none"></div>
        <button class="${toolButtonClass}${isCalendarPanelOpen ? " active" : ""}" id="cal-btn" title="Calendar" aria-pressed="${isCalendarPanelOpen ? "true" : "false"}" ${calendarDisabled ? "disabled" : ""}>${icons.calendar}</button>
        <div class="cal-panel shadow-small" id="cal-panel" data-fvc-region="calendar-panel" style="display:none"></div>
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
  linkedEntitiesMarkup = "",
  linkedEntitiesLeftMarkup = "",
  linkedEntitiesRightMarkup = "",
}) {
  const leftLights = linkedEntitiesLeftMarkup;
  const rightLights = linkedEntitiesRightMarkup || linkedEntitiesMarkup;
  return `<div class="info-row" data-fvc-region="information">
              <div class="info-left">
                <div class="info-copy">
                  <div class="info-title" id="info-title" ${displayTitle ? "" : "hidden"}>${escapeHtml(title)}</div>
                  <span class="section-label" id="tl-range" ${displaySubtitle ? "" : "hidden"}>${escapeHtml(subtitle)}</span>
                </div>
                <div class="stat info-alert-stat">
                  <div class="sv" id="alert-count">—</div>
                  <div class="sl">Alerts</div>
                </div>
              </div>
              ${pageNav ? `<div class="info-row-page-nav">${pageNav}</div>` : ""}
              <div class="info-row-center-controls">
                <div class="info-row-action-slot" data-fvc-region="two-way-talk">${centerActionMarkup}</div>
                <div class="linked-light-region" data-fvc-region="linked-entities" data-linked-light-variant="round-btn">
                  <div class="linked-light-position-slot" data-linked-light-position-slot="left" ${leftLights ? "" : "hidden"}>${leftLights}</div>
                  <div class="linked-light-position-slot" data-linked-light-position-slot="right" ${rightLights ? "" : "hidden"}>${rightLights}</div>
                </div>
              </div>
              <div class="stats">
                <div class="stat">
                  <div class="sv stream-type" id="stream-type">--</div>
                  <div class="sl">Stream</div>
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
                <button class="round-btn recordings-day-nav" id="rec-day-prev" data-rec-day-nav="-1" type="button" title="Previous day" aria-label="Previous day" style="display:none">${icons.back || icons.left || ""}</button>
              </div>
              <div class="browse-head-middle" id="browse-head-label"></div>
              <div class="browse-head-right">
                <button class="round-btn recordings-day-nav" id="rec-day-next" data-rec-day-nav="1" type="button" title="Next day" aria-label="Next day" style="display:none">${icons.forward || icons.right || ""}</button>
              </div>
            </div>`;
}

export function buildBrowseRegionMarkup({ layoutProfile = {} } = {}) {
  const browseClassName = mergeClassNames("browse", layoutProfile.browseClass);
  return `<div class="${browseClassName}" id="browse" data-fvc-region="browse" style="display:none">
              <div class="list-head">
                <span class="newtoast" id="newtoast" style="display:none">new ✦</span>
              </div>
              <div class="browse-return-top-slot">
                <button class="browse-return-top-chip" id="browse-return-top" type="button" title="Return to top" aria-label="Return to top" hidden>
                  <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 12l1.41 1.41L11 7.83V20h2V7.83l5.59 5.58L20 12l-8-8-8 8z"/></svg>
                  <span>Top</span>
                </button>
              </div>
              <div class="list" id="list">
                <div class="empty">Loading…</div>
              </div>
            </div>`;
}

export function buildFooterMarkup({
  icons = {},
  includeFrigateView = true,
  displayFrigateView = true,
  version = "",
} = {}) {
  if (!includeFrigateView) return "";
  const frigateView = `<div><div class="frigate-view">${displayFrigateView ? icons.frigateView || "" : ""}</div></div>`;
  const normalizedVersion = String(version || "").trim();
  const footerVersion =
    normalizedVersion
      ? `<div class="footer-version" aria-label="FrigateView version ${escapeHtmlAttribute(normalizedVersion)}">v${escapeHtml(normalizedVersion)}</div>`
      : "";
  return `<div class="footer" data-fvc-region="footer">
              ${frigateView}
              ${footerVersion}
            </div>`;
}

export function buildControlsSectionMarkup({
  panTiltEnabled = false,
  zoomEnabled = false,
  presetItems = [],
} = {}) {
  const padDisabledActions = [
    ...(panTiltEnabled ? [] : ["up", "right", "down", "left"]),
    ...(zoomEnabled ? [] : ["zoom-in", "zoom-out"]),
  ].join(" ");
  const presets = (Array.isArray(presetItems) ? presetItems : [])
    .map((preset) => {
      const name = String(preset?.name || "").trim();
      if (!name) return "";
      const safeName = escapeHtml(name);
      const label = `Move camera to preset ${name}`;
      return `<button class="controls-preset-chip controls-preset-chip--camera${preset?.isHome ? " is-home" : ""}" type="button" data-ptz-preset="${escapeHtmlAttribute(name)}" aria-label="${escapeHtmlAttribute(label)}" title="${escapeHtmlAttribute(label)}">${safeName}</button>`;
    })
    .filter(Boolean)
    .join("");
  const presetMarkup = presets
    ? `<div class="controls-presets" aria-label="Camera presets">
        <div class="controls-preset-list">${presets}</div>
        <div class="controls-presets-note">Camera Presets - presets are set on the camera.</div>
      </div>`
    : "";
  return `<div class="controls-ptz-stage">
            <div class="controls-pad-wrap${panTiltEnabled || zoomEnabled ? "" : " is-disabled"}">
              <circle-pad-control-2 id="controls-pad"${padDisabledActions ? ` disabled-actions="${padDisabledActions}"` : ""}></circle-pad-control-2>
            </div>
            ${presetMarkup}
          </div>`;
}

export function buildPopupShellMarkup({ icons, version }) {
  return `<div id="myPopup" class="popup-content" data-no-swipe>
            <div class="popup-close-row">
              <button id="close-btn" class="close-btn round-btn" type="button" aria-label="Close">${icons.close}</button>
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
                <input class="popup-media-volume" id="popup-media-volume" type="range" min="0" max="100" value="100" step="1" title="Volume" aria-label="Volume">
                <button class="popup-media-btn" id="popup-media-fs" type="button" title="Fullscreen" aria-label="Fullscreen">${icons.expand}</button>
                <button class="popup-media-btn" id="popup-media-airplay" type="button" title="AirPlay video" aria-label="AirPlay video" hidden>${icons.airplayVideo}</button>
                <span class="popup-media-controls-spacer" aria-hidden="true"></span>
              </div>
                <div class="recording-scrub" id="recording-scrub" hidden>
                  <div class="recording-scrub-main-row">
                    <button class="recording-scrub-play" id="recording-scrub-play" type="button" title="Play recording" aria-label="Play recording">${icons.play}</button>
                    <div class="recording-scrub-track" id="recording-scrub-track">
                      <div class="recording-segment-selection" id="recording-segment-selection" hidden>
                        <div class="recording-segment-shade recording-segment-shade--start" id="recording-segment-shade-start"></div>
                        <div class="recording-segment-keep" id="recording-segment-keep"></div>
                        <div class="recording-segment-shade recording-segment-shade--end" id="recording-segment-shade-end"></div>
                        <button class="recording-segment-handle recording-segment-handle--start" id="recording-segment-handle-start" data-recording-segment-handle="start" type="button" role="slider" aria-label="Segment start" aria-orientation="horizontal"><span class="recording-segment-handle-time" id="recording-segment-handle-start-time" aria-hidden="true">0:00</span></button>
                        <button class="recording-segment-handle recording-segment-handle--end" id="recording-segment-handle-end" data-recording-segment-handle="end" type="button" role="slider" aria-label="Segment end" aria-orientation="horizontal"><span class="recording-segment-handle-time" id="recording-segment-handle-end-time" aria-hidden="true">0:00</span></button>
                      </div>
                      <div class="recording-scrub-ticks" id="recording-scrub-ticks"></div>
                      <div class="recording-scrub-markers" id="recording-scrub-markers"></div>
                      <div class="recording-scrub-cursor" id="recording-scrub-cursor"></div>
                      <div class="recording-scrub-preview" id="recording-scrub-preview" hidden>
                        <img id="recording-scrub-preview-image" alt="">
                        <span id="recording-scrub-preview-label"></span>
                      </div>
                    </div>
                  </div>
                  <div class="recording-scrub-labels">
                    <span id="recording-scrub-start">0:00</span>
                    <span class="recording-scrub-now" id="recording-scrub-now">0:00 / 0:00</span>
                    <span id="recording-scrub-end">0:00</span>
                  </div>
                </div>
                <section class="recording-segment-manager" id="recording-segment-manager" aria-label="Recording segment download" hidden>
                  <div class="recording-segment-manager-copy">
                    <strong>Select a recording segment</strong>
                    <span>Drag the handles to choose what to keep. Green is downloaded; red is excluded.</span>
                  </div>
                  <div class="recording-segment-manager-footer">
                    <div class="recording-segment-summary" id="recording-segment-summary" aria-live="polite">
                      <span><b id="recording-segment-start-label">0:00</b> – <b id="recording-segment-end-label">0:00</b></span>
                      <span id="recording-segment-duration">Entire recording</span>
                    </div>
                    <div class="recording-segment-manager-controls">
                      <div class="recording-segment-manager-tools">
                        <button class="recording-segment-tool recording-segment-reset" id="recording-segment-reset" type="button" title="Reset segment" aria-label="Reset segment">${icons.rotate || ""}<span>Reset</span></button>
                        <button class="recording-segment-tool recording-segment-cancel" id="recording-segment-cancel" type="button" title="Cancel segment selection" aria-label="Cancel segment selection">${icons.close}<span>Cancel</span></button>
                      </div>
                      <div class="recording-segment-manager-actions">
                        <button class="recording-segment-preview-button" id="recording-segment-preview-button" type="button">${icons.play}<span>Preview Segment</span></button>
                        <button class="recording-segment-download" id="recording-segment-download" type="button">${icons.download}<span>Download Segment</span></button>
                      </div>
                    </div>
                  </div>
                </section>
                <div class="popup-info" id="popup-info" hidden></div>
                <div class="popup-carousel-wrap" id="popup-carousel-wrap" hidden>
                  <button class="popup-carousel-nav left" id="popup-carousel-left" data-carousel-dir="-1" type="button" title="Previous carousel page" aria-label="Previous carousel page" aria-controls="popup-carousel" hidden>${icons.left}
                  </button>
                  <div class="popup-carousel" id="popup-carousel"></div>
                  <button class="popup-carousel-nav right" id="popup-carousel-right" data-carousel-dir="1" type="button" title="Next carousel page" aria-label="Next carousel page" aria-controls="popup-carousel" hidden>${icons.right}
                  </button>
                </div>
            </div>
            <div class="recording-segment-preview-modal" id="recording-segment-preview-modal" hidden>
              <button class="recording-segment-preview-backdrop" type="button" data-recording-segment-preview-close aria-label="Close segment preview"></button>
              <section class="recording-segment-preview-dialog" role="dialog" aria-modal="true" aria-labelledby="recording-segment-preview-title">
                <header class="recording-segment-preview-head">
                  <div>
                    <strong id="recording-segment-preview-title">Segment Preview</strong>
                    <span id="recording-segment-preview-range">0:00 – 0:00</span>
                  </div>
                  <button class="recording-segment-preview-close" type="button" data-recording-segment-preview-close aria-label="Close segment preview">${icons.close}</button>
                </header>
                <div class="recording-segment-preview-video-host" id="recording-segment-preview-video-host"></div>
                <div class="recording-segment-preview-status" id="recording-segment-preview-status">Preparing segment preview…</div>
                <footer class="recording-segment-preview-actions">
                  <button class="recording-segment-download" id="recording-segment-preview-download" type="button">${icons.download}<span>Download Segment</span></button>
                </footer>
              </section>
            </div>
          </div>`;
}
