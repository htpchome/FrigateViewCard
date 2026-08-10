import { resolveActiveTab } from "../../helpers.js";

export function buildPageNavMarkup({ routes, activePageId, getRouteLabel }) {
  return `<div class="page-nav" aria-label="Page navigation">${routes
    .map((pageId) => {
      const isActive = pageId === activePageId;
      return `<button class="page-nav-btn${
        isActive ? " active" : ""
      }" type="button" data-page-route="${pageId}" aria-pressed="${
        isActive ? "true" : "false"
      }">${getRouteLabel(pageId)}</button>`;
    })
    .join("")}</div>`;
}

export function resolveSubtitleText(config) {
  return config?.subtitle || "Frigate";
}

export function buildTabsMarkup({ tab, hiddenTabs, viewMode, icons }) {
  const ht = new Set(hiddenTabs || []);
  const gridModeListOnly = viewMode === "grid";
  const tabOrder = gridModeListOnly
    ? ["alerts", "kept", "controls"]
    : ["alerts", "clips", "snapshot", "recordings", "kept", "controls"];
  const activeTab = resolveActiveTab(tab, ht, tabOrder);
  const tabMarkup = (id, icon, label) =>
    ht.has(id) ||
    (gridModeListOnly && ["clips", "snapshot", "recordings"].includes(id))
      ? ""
      : id === activeTab
        ? `<div class="donut active" data-tab="${id}" title="${label}">${icon}</div>`
        : `<div class="donut" data-tab="${id}" title="${label}">${icon}</div>`;
  const markup = `${tabMarkup("alerts", icons.alerts, "Alerts")}
      ${tabMarkup("clips", icons.clips, "Clips")}
      ${tabMarkup("snapshot", icons.snapshot, "Snapshots")}
      ${tabMarkup("recordings", icons.recordings, "Recordings")}
      ${tabMarkup("kept", icons.star, "Kept events")}`;
  return { activeTab, markup };
}

export function buildToolsMarkup({
  tab,
  viewMode,
  icons,
  isFilterPanelOpen,
  isCalendarPanelOpen,
  isGridModeAvailable,
  isSlideshowRotationAvailable,
  isSlideshowActive,
  isControlsVisible,
  controlsDisabled,
  gridDisabled,
  slideshowDisabled,
  filterDisabled,
  calendarDisabled,
  gridButtonIcon,
  slideshowButtonIcon,
}) {
  const resolvedFilterDisabled = filterDisabled || tab === "recordings";
  const controlsHidden = isControlsVisible === false;
  const gridHidden = !isGridModeAvailable;
  const gridActive = viewMode === "grid";
  const gridButton = gridHidden
    ? ""
    : `<button class="tool${gridActive ? " active" : ""}" id="grid-btn" aria-pressed="${gridActive ? "true" : "false"}" title="${gridActive ? "Stop grid mode" : "Start grid mode"}" aria-label="${gridActive ? "Stop grid mode" : "Start grid mode"}" ${gridDisabled ? "disabled" : ""}>${gridButtonIcon}</button>`;
  const slideshowHidden = !isSlideshowRotationAvailable;
  const slideshowActive = isSlideshowActive;
  const slideshowButton = slideshowHidden
    ? ""
    : `<button class="tool slideshow-btn${slideshowActive ? " active" : ""}" id="slideshow-btn" aria-pressed="${slideshowActive ? "true" : "false"}" title="${slideshowActive ? "Stop slideshow rotation" : "Start slideshow rotation"}" aria-label="${slideshowActive ? "Stop slideshow rotation" : "Start slideshow rotation"}" ${slideshowDisabled ? "disabled" : ""}>${slideshowButtonIcon}</button>`;
  const markup = `<div class="tl-tools" style=" margin-left: auto;">
        ${controlsHidden ? "" : `<button class="tool${tab === "controls" ? " active" : ""}" id="controls-btn" title="Controls" aria-label="Controls" aria-pressed="${tab === "controls" ? "true" : "false"}" ${controlsDisabled ? "disabled" : ""}>${icons.bullseye}</button>`}
        ${gridButton}
        ${slideshowButton}
        <button class="tool${isFilterPanelOpen ? " active" : ""}" id="filter-btn" title="Filter" aria-pressed="${isFilterPanelOpen ? "true" : "false"}" ${resolvedFilterDisabled ? "disabled" : ""}>${icons.filter}</button>
        <button class="tool${isCalendarPanelOpen ? " active" : ""}" id="cal-btn" title="Calendar" aria-pressed="${isCalendarPanelOpen ? "true" : "false"}" ${calendarDisabled ? "disabled" : ""}>${icons.calendar}</button>
      </div>`;
  return markup;
}

export function buildCamSwitcherMarkup({
  previewPageEnabled,
  includeStatus,
  cameras,
  activeCamIdx,
  isSingleView,
  icons,
  getCameraName,
  isCameraAvailable,
}) {
  const backButton = previewPageEnabled
    ? `<button class="glass-btn cam-tab preview-back-btn" type="button" data-preview-back title="Back to preview page" aria-label="Back to preview page">${icons.left} Back</button>`
    : "";
  const cameraButtons = (cameras || [])
    .map((camera, index) => {
      const name = getCameraName(camera);
      const active = isSingleView && index === activeCamIdx;
      const ok = !includeStatus || isCameraAvailable(camera);
      return `<button class="glass-btn cam-tab shadow-small ${active ? "active" : ""}" data-camidx="${index}"><span class="cam-dot" style="color:${ok ? "#4ade80" : "#ef4444"}">●</span> ${name}</button>`;
    })
    .join("");
  return `${backButton}${cameraButtons}`;
}

export function buildInfoRowMarkup({ title, subtitle, version, pageNav = "" }) {
  return `<div class="info-row">
              <div>
                <div class="info-title" id="info-title">${title}</div>
                <span class="section-label" id="tl-range">${subtitle}</span>
              </div>
              ${pageNav ? `<div class="info-row-page-nav">${pageNav}</div>` : ""}
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
                  <div class="sv" id="ev-count">—</div>
                  <div class="sl">Events</div>
                </div>
                <div class="stat">
                  <div class="sv" id="on-dot" style="color:var(--c-on)">●</div>
                  <div class="sl" id="on-lbl">Online</div>
                </div>
              </div>
            </div>`;
}

export function buildLiveEngineWrapMarkup({ icons, streamMuted }) {
  const muteLabel = streamMuted ? "Unmute live view" : "Mute live view";
  const muteIcon = streamMuted ? icons.volOff : icons.volOn;
  return `<div id="eng-wrap">
                <frigate-live-stream id="engine">
                  <div class="ph">${icons.live}<span>Connecting…</span></div>
                </frigate-live-stream>
                  <button class="glass-btn overlay-fs live-fs-btn" id="live-fs-btn" title="Fullscreen live" aria-label="Fullscreen live">${icons.expand}</button>
                  <button class="glass-btn mute-btn" id="mute-btn" title="${muteLabel}" aria-label="${muteLabel}">${muteIcon}</button>
                  <div class="glass-btn slideshow-next-chip" id="slideshow-next-chip" hidden>Next Slide: 0s</div>
                  <div id="stream-fallback" hidden>
                    <img id="stream-fallback-img" alt="Camera snapshot">
                  </div>
                  <div class="stream-fallback-status" id="stream-fallback-status" hidden>Snapshot unavailable</div>
                  <div class="stream-loading" id="stream-loading" hidden>
                    <span class="dot"></span><span class="label">Loading…</span>
                  </div>
              </div>`;
}

function mergeClassNames(...tokens) {
  return [
    ...new Set(tokens.filter(Boolean).join(" ").split(/\s+/).filter(Boolean)),
  ].join(" ");
}

export function buildBrowseMarkup({ icons, layoutProfile = {} }) {
  const browseClassName = mergeClassNames("browse", layoutProfile.browseClass);
  return `<div class="browse-head" id="browse-head" style="display:none">
              <div class="browse-head-left">
                <button class="prev-next" id="rec-day-prev" data-rec-day-nav="-1" title="Previous day" aria-label="Previous day" style="display:none">${icons.left}Previous</button>
              </div>
              <div class="browse-head-middle" id="browse-head-label"></div>
              <div class="browse-head-right">
                <button class="prev-next" id="rec-day-next" data-rec-day-nav="1" title="Next day" aria-label="Next day" style="display:none">Next${icons.right}</button>
              </div>
            </div>
        
            <div class="${browseClassName}" id="browse" style="display:none">
              <div class="list-head">
                <span class="newtoast" id="newtoast" style="display:none">new ✦</span>
              </div>
              <div class="list" id="list">
                <div class="empty">Loading…</div>
              </div>
            </div>`;
}

export function buildFooterMarkup({ icons }) {
  return `<div class="footer">
              <div><div class="frigate-view">${icons.frigateView}</div></div>
              <div class="more" id="older-hint" hidden>scroll for older…</div>
              <div></div>
            </div>`;
}

export function buildControlsSectionMarkup({
  cameraName = "Active Camera",
  ptzReady = false,
  panTiltEnabled = false,
  zoomEnabled = false,
  focusEnabled = false,
} = {}) {
  const buildPtzButton = (action, label, enabled) => `<button
                class="controls-action-btn"
                type="button"
                data-ptz-control="${action}"
                aria-label="${label}"
                ${enabled ? "" : "disabled"}
              >${label}</button>`;
  return `<div class="controls-section">
            <div class="controls-section-head">
              <h3 class="controls-section-title">PTZ Controls</h3>
              <div class="controls-section-subtitle">${cameraName} · ${ptzReady ? "Frigate PTZ ready" : "PTZ unavailable"}</div>
            </div>
            <div class="controls-pad-wrap${panTiltEnabled ? "" : " is-disabled"}">
              <circle-pad-control id="controls-pad"></circle-pad-control>
            </div>
            <div class="controls-actions" aria-label="PTZ auxiliary controls">
              <div class="controls-action-group${zoomEnabled ? "" : " is-disabled"}">
                <div class="controls-action-group-label">Zoom</div>
                <div class="controls-action-row">
                  ${buildPtzButton("zoom-in", "Zoom In", zoomEnabled)}
                  ${buildPtzButton("zoom-out", "Zoom Out", zoomEnabled)}
                </div>
              </div>
              <div class="controls-action-group${focusEnabled ? "" : " is-disabled"}">
                <div class="controls-action-group-label">Focus</div>
                <div class="controls-action-row">
                  ${buildPtzButton("focus-in", "Focus In", focusEnabled)}
                  ${buildPtzButton("focus-out", "Focus Out", focusEnabled)}
                </div>
              </div>
            </div>
            <div class="controls-readout">
              <div class="controls-readout-head">
                <span class="controls-readout-label">Readout</span>
                <button class="controls-readout-clear" id="controls-readout-clear" type="button">Clear</button>
              </div>
              <div class="controls-readout-lines" id="controls-readout-lines"></div>
            </div>
          </div>`;
}

export function buildControlsReadoutEmptyMarkup(
  message = "Use the circle pad to move the active camera.",
) {
  return `<div class="controls-readout-empty">${message}</div>`;
}

export function buildControlsReadoutLinesMarkup(lines) {
  return (lines || [])
    .map((line) => `<div class="controls-readout-line">${line}</div>`)
    .join("");
}

export function buildPopupShellMarkup({ icons, version }) {
  return `<div id="myPopup" class="popup-content">
            <div class="popup-close-row">
              <button class="close-btn" aria-label="Close">&times;</button> 
            </div>
            <div class="popup-header"></div>          
            <div class="popup-body">
              <div class="viewer" id="viewer" style="display:none"></div>
              <div class="popup-media-controls" id="popup-media-controls" hidden><span class="popup-media-controls-spacer" aria-hidden="true"></span><button class="popup-media-btn" id="popup-media-play" type="button" title="Play/Pause" aria-label="Play/Pause">${icons.play}</button><input class="popup-media-progress" id="popup-media-progress" type="range" min="0" max="1000" value="0" step="1" aria-label="Media progress"><span class="popup-media-time" id="popup-media-time">0:00/0:00</span><button class="popup-media-btn" id="popup-media-mute" type="button" title="Mute" aria-label="Mute">${icons.volOn}</button><button class="popup-media-btn" id="popup-media-fs" type="button" title="Fullscreen" aria-label="Fullscreen">${icons.expand}</button><span class="popup-media-controls-spacer" aria-hidden="true"></span>
              </div>
              <h2 class="popup-info-head" id="popup-info-head" hidden></h2>
                <div class="recording-scrub" id="recording-scrub" hidden>
                  <div class="recording-scrub-track" id="recording-scrub-track">
                    <div class="recording-scrub-ticks" id="recording-scrub-ticks"></div>
                    <div class="recording-scrub-markers" id="recording-scrub-markers"></div>
                    <div class="recording-scrub-cursor" id="recording-scrub-cursor"></div>
                  </div>
                  <div class="recording-scrub-labels">
                    <span id="recording-scrub-start">0:00</span>
                    <span class="recording-scrub-now" id="recording-scrub-now">0:00 / 0:00</span>
                    <span id="recording-scrub-end">0:00</span>
                  </div>
                </div>
                <div class="popup-info" id="popup-info" hidden></div>
                <div class="popup-carousel-wrap" id="popup-carousel-wrap" hidden>
                  <button class="popup-carousel-nav left" id="popup-carousel-left" data-carousel-dir="-1" aria-label="Previous items">${icons.left}
                  </button>
                  <div class="popup-carousel" id="popup-carousel"></div>
                  <button class="popup-carousel-nav right" id="popup-carousel-right" data-carousel-dir="1" aria-label="Next items">${icons.right}
                  </button>
                </div>
                <h1 class="popup-shell-ver" id="popup-shell-ver">v${version}</h1>
            </div>
          </div>`;
}

export function buildMainLayoutShellMarkup({
  liveEngineWrap,
  infoRow,
  pageNav,
  camSwitcher,
  tabsMarkup,
  toolsMarkup,
  browseMarkup,
  footerMarkup,
  layoutProfile = {},
}) {
  const layoutClassName = mergeClassNames("layout", layoutProfile.layoutClass);
  const leftColumnClassName = mergeClassNames(
    "col-left",
    layoutProfile.leftColumnClass,
  );
  const rightColumnClassName = mergeClassNames(
    "col-right",
    layoutProfile.rightColumnClass,
  );
  const tabsHolderClassName = mergeClassNames(
    "tabs-holder",
    layoutProfile.tabsHolderClass,
  );
  const resizeHandleClassName = mergeClassNames(
    "resize-handle",
    layoutProfile.resizeHandleClass,
  );
  return `<div class="${layoutClassName}" id="layout">
          <div class="${leftColumnClassName}" id="col-left">
            ${liveEngineWrap}

            ${infoRow}
            ${pageNav}
            ${camSwitcher}
          </div>
          <div class="${resizeHandleClassName}" id="resize-handle"></div>
          <div class="${rightColumnClassName}" id="col-right">
            <div class="tabs shadow-small">            
              ${tabsMarkup}${toolsMarkup}
            </div>
            ${browseMarkup}
            ${footerMarkup}
          </div>
        </div>`;
}
