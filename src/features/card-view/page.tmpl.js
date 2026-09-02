import { buildLivePlaybackControlsMarkup } from "../live/view.tmpl.js";
import { escapeHtml } from "../../shared/html.js";

const normalizeRegions = (regions = {}) => ({
  live: "",
  livePictureInPicture: "",
  liveFullscreen: "",
  liveTakeSnapshot: "",
  liveMute: "",
  mobileBackButton: "",
  cameraSwitcherMarkup: "",
  pageNavigation: "",
  cardViewToolbar: "",
  cardViewActivity: "",
  calendarPanel: "",
  footerLogo: "",
  footerVersion: "",
  drawerHandleIcon: "",
  calendarIcon: "",
  ...regions,
});

export const CARD_VIEW_ACTIVE_CLASS = "card-view-active";
export const CARD_VIEW_HOST_CLASS = "card-view-natural-height";

export function buildCardViewMainLayoutShellMarkup({
  regions: suppliedRegions = {},
  layoutProfile = {},
} = {}) {
  const regions = normalizeRegions(suppliedRegions);
  const layoutClass = ["layout", layoutProfile.layoutClass, "card-view-layout"]
    .filter(Boolean)
    .join(" ");
  return `<div class="${layoutClass}" id="layout">
    <div class="card-view-camera-row cam-switcher" id="cam-switcher" data-fvc-region="camera-switcher">
      <div class="card-view-back-slot mobile-cam-picker__back-slot">${regions.mobileBackButton}</div>
      <div class="card-view-camera-picker mobile-cam-switcher__content" data-mobile-cam-switcher-content>${regions.cameraSwitcherMarkup}</div>
    </div>
    <div class="live-stage live-stage--overlay card-view-live-stage" id="live-stage">
      ${regions.live}
      ${buildLivePlaybackControlsMarkup(regions)}
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
      <div class="frigate-view">${regions.footerLogo}</div>
      <div class="card-view-footer-center">
        <button class="icon-btn card-view-drawer-handle card-view-drawer-handle--left" type="button" data-card-view-drawer-toggle aria-expanded="true" title="Close activity drawer" aria-label="Close activity drawer">${regions.drawerHandleIcon}</button>
        <div class="card-view-footer-nav">${regions.pageNavigation}</div>
        <button class="icon-btn card-view-drawer-handle card-view-drawer-handle--right" type="button" data-card-view-drawer-toggle aria-expanded="true" title="Close activity drawer" aria-label="Close activity drawer">${regions.drawerHandleIcon}</button>
      </div>
      <div class="card-view-footer-end">
        <div class="cal-panel card-view-calendar-panel shadow-small" id="card-view-cal-panel" data-fvc-region="calendar-panel" hidden></div>
        <button class="icon-btn card-view-footer-calendar" type="button" data-card-view-calendar aria-pressed="false" title="Calendar" aria-label="Calendar" hidden>${regions.calendarIcon}</button>
        <div class="footer-version">${regions.footerVersion ? `v${escapeHtml(regions.footerVersion)}` : ""}</div>
      </div>
    </footer>
  </div>`;
}

export function buildCardViewToolbarMarkup({
  icons = {},
  mode = "alerts",
  showAllAlerts = true,
  activeCameraName = "Camera",
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
  const centerControls = `${lightControl}${microphoneControl}`;
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
      <button class="icon-btn${alertTakeoverEnabled ? " active" : ""}" type="button" data-card-view-takeover aria-pressed="${alertTakeoverEnabled}" title="${takeoverLabel}" aria-label="${takeoverLabel}"${alertTakeoverDisabled ? " disabled" : ""}>${icons.alerts || ""}</button>
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
  host?.classList?.toggle(CARD_VIEW_HOST_CLASS, active);
  host?._$("#card")?.classList?.toggle(CARD_VIEW_ACTIVE_CLASS, active);
}
