import { buildLivePlaybackControlsMarkup } from "../live/view.tmpl.js";
import { CARD_NAME } from "../../constants.js";
import { escapeHtml } from "../../shared/html.js";
import {
  CARD_VIEW_VIEW_MODES,
  normalizeCardViewViewMode,
} from "./config.js";

const normalizeRegions = (regions = {}) => ({
  live: "",
  livePictureInPicture: "",
  liveFullscreen: "",
  liveTakeSnapshot: "",
  liveMute: "",
  mobileBackButton: "",
  cardViewVideoBackIcon: "",
  cardViewFullscreenExitIcon: "",
  cardViewWebRtcIcon: "",
  cameraSwitcherMarkup: "",
  pageNavigation: "",
  cardViewToolbar: "",
  cardViewActivity: "",
  calendarPanel: "",
  linkedEntitiesLeft: "",
  linkedEntitiesRight: "",
  footerFvcBrandLogo: "",
  footerVersion: "",
  drawerHandleIcon: "",
  mediaDrawerHandleIcon: "",
  calendarIcon: "",
  filterIcon: "",
  ...regions,
});

export const CARD_VIEW_ACTIVE_CLASS = "card-view-active";
export const CARD_VIEW_HOST_CLASS = "card-view-natural-height";
export const CARD_VIEW_BOTTOM_PANEL_OPEN_HOST_CLASS =
  "card-view-bottom-panel-open";

export function buildCardViewMainLayoutShellMarkup({
  regions: suppliedRegions = {},
  layoutProfile = {},
} = {}) {
  const regions = normalizeRegions(suppliedRegions);
  const layoutClass = ["layout", layoutProfile.layoutClass, "card-view-layout"]
    .filter(Boolean)
    .join(" ");
  return `<div class="${layoutClass}" id="layout">
    <button class="round-btn card-view-native-fullscreen-exit" type="button" data-card-view-native-fullscreen-exit title="Exit Fullscreen" aria-label="Exit Fullscreen">${regions.cardViewFullscreenExitIcon}</button>
    <div class="card-view-live-panel">
      <div class="card-view-camera-row cam-switcher" id="cam-switcher" data-fvc-region="camera-switcher">
        <div class="card-view-back-slot mobile-cam-picker__back-slot">${regions.mobileBackButton}</div>
        <div class="card-view-camera-picker mobile-cam-switcher__content" data-mobile-cam-switcher-content>${regions.cameraSwitcherMarkup}</div>
        <div class="card-view-standalone-mode-controls" data-card-view-standalone-mode-controls></div>
      </div>
      <div class="live-stage live-stage--overlay card-view-live-stage" id="live-stage">
        ${regions.live}
        <button class="round-btn card-view-video-only-back" type="button" data-card-view-video-back title="Leave Card View" aria-label="Leave Card View">${regions.cardViewVideoBackIcon}</button>
        ${buildLivePlaybackControlsMarkup(regions)}
        <aside class="card-view-media-drawer is-closed" data-card-view-media-drawer data-media-overlay-ignore hidden>
          <div class="card-view-media-drawer-panel" id="card-view-media-drawer-panel" data-card-view-media-drawer-panel aria-hidden="true">
            <button class="card-view-media-drawer-nav card-view-media-drawer-nav--up" type="button" data-card-view-media-drawer-scroll="-1" title="Previous media" aria-label="Previous media" hidden>${regions.mediaDrawerHandleIcon}</button>
            <div class="card-view-media-drawer-scroller" data-card-view-media-drawer-scroller></div>
            <button class="card-view-media-drawer-nav card-view-media-drawer-nav--down" type="button" data-card-view-media-drawer-scroll="1" title="More media" aria-label="More media" hidden>${regions.mediaDrawerHandleIcon}</button>
            <div class="card-view-media-drawer-tabs" data-card-view-media-drawer-tabs role="tablist" aria-label="Drawer media" aria-hidden="true" hidden>
              <button class="card-view-media-drawer-tab active" type="button" data-card-view-media-drawer-type="alerts" role="tab" aria-selected="true">Alerts</button>
              <button class="card-view-media-drawer-tab" type="button" data-card-view-media-drawer-type="clips" role="tab" aria-selected="false">Clips</button>
              <button class="card-view-media-drawer-tab" type="button" data-card-view-media-drawer-type="snapshots" role="tab" aria-selected="false">Snapshots</button>
              <button class="card-view-media-drawer-tab" type="button" data-card-view-media-drawer-type="recordings" role="tab" aria-selected="false">Recordings</button>
              <button class="card-view-media-drawer-tab" type="button" data-card-view-media-drawer-type="kept" role="tab" aria-selected="false">Favorites</button>
            </div>
            <div class="card-view-media-drawer-actions" data-card-view-media-drawer-actions aria-hidden="true" hidden>
              <button class="card-view-media-drawer-action" type="button" data-card-view-media-drawer-calendar aria-pressed="false" title="Choose day" aria-label="Choose day">${regions.calendarIcon}</button>
              <button class="card-view-media-drawer-action" type="button" data-card-view-media-drawer-filter aria-pressed="false" title="Filter media" aria-label="Filter media">${regions.filterIcon}</button>
            </div>
          </div>
          <button class="card-view-media-drawer-handle" type="button" data-card-view-media-drawer-toggle aria-controls="card-view-media-drawer-panel" aria-expanded="false" title="Open media drawer" aria-label="Open media drawer">${regions.mediaDrawerHandleIcon}</button>
          <div class="cal-panel card-view-media-drawer-popover card-view-media-drawer-calendar-panel" data-card-view-media-drawer-calendar-panel hidden></div>
          <div class="filter-panel card-view-media-drawer-popover card-view-media-drawer-filter-panel" data-card-view-media-drawer-filter-panel hidden></div>
        </aside>
        <div class="card-view-live-status-overlay" data-card-view-live-status-overlay>
          <div class="card-view-source-indicator" data-card-view-source-indicator aria-label="Live source" hidden>
            <span class="card-view-source-indicator-icon" data-card-view-source-icon aria-hidden="true" hidden>${regions.cardViewWebRtcIcon}</span>
            <span class="card-view-source-indicator-text" data-card-view-source-text hidden></span>
          </div>
          <div class="card-view-live-badge" data-card-view-live-badge aria-label="Live camera">
            <span class="card-view-live-badge-dot" aria-hidden="true"></span>
            <span>Live</span>
          </div>
        </div>
        <div class="card-view-standalone-linked-overlay media-linked-controls-overlay" data-card-view-standalone-linked-overlay data-media-overlay-ignore>
          <div class="linked-light-region card-view-standalone-light-controls" data-card-view-standalone-light-overlay data-fvc-region="linked-entities" data-linked-light-variant="icon-btn">
            <div class="linked-light-position-slot" data-linked-light-position-slot="left" ${regions.linkedEntitiesLeft ? "" : "hidden"}>${regions.linkedEntitiesLeft}</div>
            <div class="linked-light-position-slot" data-linked-light-position-slot="right" ${regions.linkedEntitiesRight ? "" : "hidden"}>${regions.linkedEntitiesRight}</div>
          </div>
          <div class="card-view-standalone-talk-overlay" data-card-view-standalone-talk-overlay></div>
        </div>
      </div>
    </div>
    <div class="card-view-drawer is-open" data-card-view-drawer data-drawer-state="open">
      <div class="card-view-drawer-inner">
        <section class="card-view-activity" aria-label="Card View activity">
          <div class="card-view-activity-toolbar" data-card-view-toolbar>
            ${regions.cardViewToolbar}
          </div>
          <div class="card-view-activity-frame" data-card-view-activity-frame>
            <button class="card-view-scroll-control card-view-scroll-control--left" type="button" data-card-view-scroll="-1" title="Previous items" aria-label="Previous items" hidden></button>
            <div class="card-view-activity-content" data-fvc-region="card-view-activity">${regions.cardViewActivity}</div>
            <button class="card-view-scroll-control card-view-scroll-control--right" type="button" data-card-view-scroll="1" title="Next items" aria-label="Next items" hidden></button>
          </div>
        </section>
      </div>
    </div>
    <footer class="card-view-footer" data-fvc-region="footer">
      <div class="fvc-brand-logo">${regions.footerFvcBrandLogo}</div>
      <div class="card-view-footer-center">
        <button class="icon-btn card-view-drawer-handle card-view-drawer-handle--left" type="button" data-card-view-drawer-toggle aria-expanded="true" title="Close activity drawer" aria-label="Close activity drawer">${regions.drawerHandleIcon}</button>
        <div class="card-view-footer-nav">${regions.pageNavigation}</div>
        <button class="icon-btn card-view-drawer-handle card-view-drawer-handle--right" type="button" data-card-view-drawer-toggle aria-expanded="true" title="Close activity drawer" aria-label="Close activity drawer">${regions.drawerHandleIcon}</button>
      </div>
      <div class="card-view-footer-end">
        <div class="cal-panel card-view-calendar-panel shadow-small" id="card-view-cal-panel" data-card-view-calendar-panel data-fvc-region="calendar-panel" hidden></div>
        <button class="icon-btn card-view-footer-calendar" type="button" data-card-view-calendar aria-pressed="false" title="Calendar" aria-label="Calendar" hidden>${regions.calendarIcon}</button>
        <div class="footer-version" ${regions.footerVersion ? `aria-label="${CARD_NAME} version ${escapeHtml(regions.footerVersion)}"` : "hidden"}>${regions.footerVersion ? `v${escapeHtml(regions.footerVersion)}` : ""}</div>
      </div>
    </footer>
  </div>`;
}

export function buildCardViewStandaloneModeControlsMarkup({
  icons = {},
  showAlertTakeover = true,
  alertTakeoverEnabled = false,
  alertTakeoverDisabled = false,
  gridAvailable = false,
  gridActive = false,
  gridDisabled = false,
  slideshowAvailable = false,
  slideshowActive = false,
  slideshowDisabled = false,
  slideshowRemainingSeconds = 0,
} = {}) {
  const gridLabel = gridActive ? "Stop grid mode" : "Start grid mode";
  const slideshowLabel = slideshowActive
    ? "Stop slideshow rotation"
    : "Start slideshow rotation";
  const takeoverLabel = alertTakeoverEnabled
    ? "Disable alert camera takeover"
    : "Enable alert camera takeover";
  const remaining = Math.max(
    0,
    Math.ceil(Number(slideshowRemainingSeconds) || 0),
  );
  return `${slideshowAvailable ? `<button class="card-view-standalone-mode-button card-view-standalone-slideshow-button${slideshowActive ? " active" : ""}" type="button" data-card-view-standalone-slideshow data-media-overlay-ignore aria-pressed="${slideshowActive}" title="${slideshowLabel}" aria-label="${slideshowLabel}"${slideshowDisabled ? " disabled" : ""}>${slideshowActive ? icons.presentationPlayActive || icons.presentationPlay || "" : icons.presentationPlay || ""}${slideshowActive ? `<span class="card-view-standalone-countdown" data-card-view-slideshow-countdown>${remaining}s</span>` : ""}</button>` : ""}
    <div class="card-view-standalone-mode-end">
      ${gridAvailable ? `<button class="card-view-standalone-mode-button${gridActive ? " active" : ""}" type="button" data-card-view-standalone-grid data-media-overlay-ignore aria-pressed="${gridActive}" title="${gridLabel}" aria-label="${gridLabel}"${gridDisabled ? " disabled" : ""}>${icons.grid || ""}</button>` : ""}
      ${showAlertTakeover ? `<button class="card-view-standalone-mode-button card-view-standalone-takeover-button${alertTakeoverEnabled ? " active" : ""}" type="button" data-card-view-takeover data-media-overlay-ignore aria-pressed="${alertTakeoverEnabled}" title="${takeoverLabel}" aria-label="${takeoverLabel}"${alertTakeoverDisabled ? " disabled" : ""}>${icons.alerts || ""}</button>` : ""}
    </div>`;
}

export function buildCardViewToolbarMarkup({
  icons = {},
  mode = "alerts",
  showAllAlerts = true,
  activeCameraName = "Camera",
  showAlertTakeover = true,
  alertTakeoverEnabled = false,
  alertTakeoverDisabled = false,
  showPtz = false,
  ptzDisabled = false,
  gridAvailable = false,
  gridActive = false,
  gridDisabled = false,
  slideshowAvailable = false,
  slideshowActive = false,
  slideshowDisabled = false,
  showMicrophone = false,
  microphoneMarkup = "",
  linkedLightMarkup = "",
  linkedLightLeftMarkup = "",
  linkedLightRightMarkup = "",
  showCenterControls = true,
} = {}) {
  const recordingsActive = mode === "recordings";
  const ptzActive = mode === "ptz";
  const swapLabel = recordingsActive ? "Show recent alerts" : "Show recordings";
  const swapText = recordingsActive ? "Goto Alerts" : "Goto Recordings";
  const heading = ptzActive
    ? "PTZ Controls"
    : recordingsActive
      ? "Recordings"
      : "Alerts";
  const takeoverLabel = alertTakeoverEnabled
    ? "Disable alert camera takeover"
    : "Enable alert camera takeover";
  const gridLabel = gridActive ? "Stop grid mode" : "Start grid mode";
  const slideshowLabel = slideshowActive
    ? "Stop slideshow rotation"
    : "Start slideshow rotation";
  const cameraLabel =
    String(activeCameraName || "").trim() || "Camera";
  const alertScopeLabel = showAllAlerts
    ? `Show ${cameraLabel} Alerts`
    : "Show All Alerts";
  const escapedAlertScopeLabel = escapeHtml(alertScopeLabel);
  const alertScopeIcon = showAllAlerts
    ? icons.singleView || icons.alerts || ""
    : icons.grid || icons.alerts || "";
  const lightControl = `<div class="linked-light-region card-view-linked-light" data-fvc-region="linked-entities" data-linked-light-variant="icon-btn">
    <div class="linked-light-position-slot card-view-linked-light-position" data-linked-light-position-slot="left" ${linkedLightLeftMarkup ? "" : "hidden"}>${linkedLightLeftMarkup}</div>
    <div class="linked-light-position-slot card-view-linked-light-position" data-linked-light-position-slot="right" ${linkedLightRightMarkup || linkedLightMarkup ? "" : "hidden"}>${linkedLightRightMarkup || linkedLightMarkup}</div>
  </div>`;
  const microphoneControl = showMicrophone
    ? `<div class="card-view-microphone-slot" data-fvc-region="two-way-talk">${microphoneMarkup}</div>`
    : "";
  const centerControls = showCenterControls
    ? `${lightControl}${microphoneControl}`
    : "";
  return `<div class="card-view-toolbar-start">
      <div class="card-view-activity-heading">${heading}</div>
      <button class="card-view-mode-switch icon-btn" type="button" data-card-view-swap title="${swapLabel}" aria-label="${swapLabel}">
        <span class="card-view-mode-switch-icon">${recordingsActive ? icons.alerts || "" : icons.recordings || ""}</span>
        <span class="card-view-mode-switch-label">${swapText}</span>
      </button>
      ${!recordingsActive && !ptzActive ? `<button class="card-view-alert-scope-switch icon-btn" type="button" data-card-view-alert-scope aria-pressed="${showAllAlerts}" title="${escapedAlertScopeLabel}" aria-label="${escapedAlertScopeLabel}">
        <span class="card-view-mode-switch-icon">${alertScopeIcon}</span>
        <span class="card-view-mode-switch-label">${escapedAlertScopeLabel}</span>
      </button>` : ""}
    </div>
    <div class="card-view-toolbar-center">
      ${centerControls}
    </div>
    <div class="card-view-activity-actions">
      ${showPtz ? `<button class="icon-btn${ptzActive ? " active" : ""}" type="button" data-card-view-ptz aria-pressed="${ptzActive}" title="${ptzActive ? "Close PTZ controls" : "Open PTZ controls"}" aria-label="${ptzActive ? "Close PTZ controls" : "Open PTZ controls"}"${ptzDisabled ? " disabled" : ""}>${icons.ptz || ""}</button>` : ""}
      ${gridAvailable ? `<button class="icon-btn${gridActive ? " active" : ""}" id="grid-btn" type="button" aria-pressed="${gridActive}" title="${gridLabel}" aria-label="${gridLabel}"${gridDisabled ? " disabled" : ""}>${icons.grid || ""}</button>` : ""}
      ${showAlertTakeover ? `<button class="icon-btn${alertTakeoverEnabled ? " active" : ""}" type="button" data-card-view-takeover aria-pressed="${alertTakeoverEnabled}" title="${takeoverLabel}" aria-label="${takeoverLabel}"${alertTakeoverDisabled ? " disabled" : ""}>${icons.alerts || ""}</button>` : ""}
      ${slideshowAvailable ? `<button class="icon-btn slideshow-btn${slideshowActive ? " active" : ""}" id="slideshow-btn" type="button" aria-pressed="${slideshowActive}" title="${slideshowLabel}" aria-label="${slideshowLabel}"${slideshowDisabled ? " disabled" : ""}>${slideshowActive ? icons.presentationPlayActive || icons.presentationPlay || "" : icons.presentationPlay || ""}</button>` : ""}
    </div>`;
}

export function buildCardViewPtzMarkup({ icons = {} } = {}) {
  const button = (action, icon, className = "") =>
    `<button class="card-view-ptz-button ${className}" type="button" data-ptz-control="${action}" aria-label="Move camera ${action}" title="Move camera ${action}">${icon}</button>`;
  return `<div class="card-view-ptz-panel">
    ${button("left", icons.left || "‹", "card-view-ptz-button--side")}
    <div class="card-view-ptz-vertical">
      ${button("up", icons.chevron || "▲", "card-view-ptz-button--up")}
      ${button("down", icons.chevron || "▼", "card-view-ptz-button--down")}
    </div>
    ${button("right", icons.right || "›", "card-view-ptz-button--side")}
  </div>`;
}

export function applyCardViewPageMarkup({ host, pageIds } = {}) {
  const active = host?._pageId === pageIds?.cardView;
  const standalone = active && host?._config?.card_view_standalone === true;
  const viewMode = normalizeCardViewViewMode(
    host?._config?.card_view_view_mode,
  );
  const videoPanelOnly =
    active && viewMode === CARD_VIEW_VIEW_MODES.videoOnly;
  const overlayPresentation = videoPanelOnly;
  const hideCameraName =
    overlayPresentation &&
    host?._config?.card_view_hide_camera_name === true;
  const mediaDrawerEnabled =
    overlayPresentation &&
    host?._config?.card_view_media_drawer_enabled === true;
  host?.classList?.toggle(CARD_VIEW_HOST_CLASS, active);
  if (!active || videoPanelOnly) {
    host?.classList?.toggle(
      CARD_VIEW_BOTTOM_PANEL_OPEN_HOST_CLASS,
      false,
    );
  }
  const card = host?._$?.("#card");
  card?.classList?.toggle(CARD_VIEW_ACTIVE_CLASS, active);
  card?.classList?.toggle("card-view-standalone", standalone);
  card?.classList?.toggle(
    "card-view-overlay-presentation",
    overlayPresentation,
  );
  card?.classList?.toggle("card-view-video-panel-only", videoPanelOnly);
  card?.classList?.toggle("card-view-hide-camera-name", hideCameraName);
  card?.classList?.toggle(
    "card-view-media-drawer-enabled",
    mediaDrawerEnabled,
  );
  card?.classList?.toggle(
    "card-view-grid-mode",
    overlayPresentation && host?._viewMode === "grid",
  );
  card?.classList?.toggle(
    "card-view-slideshow-mode",
    overlayPresentation && host?._slideshowActive === true,
  );
}
