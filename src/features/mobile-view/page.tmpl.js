import { MOBILE_VIEW_ACTIVE_CLASS, isMobileViewRoute } from "./utils.js";
import { buildLivePlaybackControlsMarkup } from "../live/view.tmpl.js";
import { DEFAULT_TITLE, DEFAULT_SUBTITLE } from "../../constants.js";

function buildMobileCameraOptionMarkup({
  camera,
  index,
  activeCamIdx,
  includeStatus,
  getCameraName,
  isCameraAvailable,
}) {
  const name = getCameraName(camera);
  const active = index === activeCamIdx;
  const ok = !includeStatus || isCameraAvailable(camera);
  return `<button
            class="mobile-cam-picker__option${active ? " is-active" : ""}"
            type="button"
            role="option"
            aria-selected="${active ? "true" : "false"}"
            data-mobile-camidx="${index}"
          >
            <span class="mobile-cam-picker__option-content">
              <span class="cam-dot" style="color:${ok ? "#4ade80" : "#ef4444"}">●</span>
              <span class="mobile-cam-picker__option-label">${name}</span>
            </span>
          </button>`;
}

export function buildMobileCamSwitcherMarkup({
  previewPageEnabled,
  includeStatus,
  cameras,
  activeCamIdx,
  icons,
  getCameraName,
  isCameraAvailable,
  streamType = "--",
  online = true,
  pickerOpen = false,
}) {
  const cameraList = Array.isArray(cameras) ? cameras : [];
  const safeActiveIdx =
    Number.isInteger(activeCamIdx) &&
    activeCamIdx >= 0 &&
    activeCamIdx < cameraList.length
      ? activeCamIdx
      : 0;
  const activeCamera = cameraList[safeActiveIdx] || cameraList[0] || null;
  const activeCameraName = activeCamera
    ? getCameraName(activeCamera)
    : "Camera";
  const backButton = previewPageEnabled
    ? `<button class="glass-btn cam-tab preview-back-btn mobile-cam-picker__back" type="button" data-preview-back title="Back to preview page" aria-label="Back to preview page">${icons.left}</button>`
    : "";
  const cameraOptions = cameraList
    .map((camera, index) =>
      buildMobileCameraOptionMarkup({
        camera,
        index,
        activeCamIdx: safeActiveIdx,
        includeStatus,
        getCameraName,
        isCameraAvailable,
      }),
    )
    .join("");
  return `${backButton}
    <div class="mobile-cam-picker${pickerOpen ? " is-open" : ""}" data-mobile-cam-picker>
      <button
        class="glass-btn mobile-cam-picker__trigger"
        type="button"
        aria-haspopup="listbox"
        aria-expanded="${pickerOpen ? "true" : "false"}"
        data-mobile-cam-trigger
      >
        <span class="mobile-cam-picker__trigger-content">
          <span class="mobile-cam-picker__trigger-dot" aria-hidden="true">●</span>
          <span class="mobile-cam-picker__label">${activeCameraName}</span>
        </span>
        <span class="mobile-cam-picker__chev" aria-hidden="true">${icons.chevron || "v"}</span>
      </button>
      <div class="mobile-cam-picker__panel" role="listbox" ${pickerOpen ? "" : "hidden"} data-mobile-cam-panel>
        ${cameraOptions}
      </div>
    </div>
    <div class="mobile-cam-picker__status" aria-label="Live status">
      <div class="mobile-cam-picker__stream">
        <div class="sv stream-type" id="stream-type">${resolveMobileViewStreamTypeText(streamType)}</div>
        <div class="sl">Stream</div>
      </div>
      <div class="sv mobile-cam-picker__dot" id="on-dot" style="color:${resolveMobileViewStatusColor(online)}">●</div>
    </div>`;
}

export function buildMobileViewInfoRowMarkup({
  title,
  subtitle,
  displayTitle = true,
  displaySubtitle = true,
  version,
  alertsCount = "—",
}) {
  return `<div class="info-row mobile-view-info-row" data-fvc-region="information">
              <div>
                <div class="info-title" id="info-title" ${displayTitle ? "" : "hidden"}>${title}</div>
                <span class="section-label" id="tl-range" ${displaySubtitle ? "" : "hidden"}>${subtitle}</span>
              </div>
              <div class="stats">
                <div class="stat">
                  <div class="sv">v${version}</div>
                  <div class="sl">Version</div>
                </div>
                <div class="stat">
                  <div class="sv" id="alert-count">${resolveMobileViewAlertsCountText(alertsCount)}</div>
                  <div class="sl">Alerts</div>
                </div>
              </div>
            </div>`;
}

export function buildMobileViewMainLayoutShellMarkup({
  regions: suppliedRegions = null,
  layoutProfile = {},
} = {}) {
  const normalizedRegions =
    suppliedRegions &&
    typeof suppliedRegions === "object" &&
    !Array.isArray(suppliedRegions)
      ? suppliedRegions
      : {};
  const regions = {
    live: "",
    livePictureInPicture: "",
    liveFullscreen: "",
    liveTakeSnapshot: "",
    liveMute: "",
    information: "",
    cameraSwitcher: "",
    pageNavigation: "",
    tabs: "",
    tools: "",
    twoWayTalk: "",
    mobileInlineMute: "",
    browseHeader: "",
    browse: "",
    footer: "",
    ...normalizedRegions,
  };
  const layoutClassName = ["layout", layoutProfile.layoutClass, "mobile-layout"]
    .filter(Boolean)
    .join(" ");
  const tabsHolderClassName = ["tabs-holder", layoutProfile.tabsHolderClass]
    .filter(Boolean)
    .join(" ");
  return `<div class="${layoutClassName}" id="layout">
            <div class="mobile-container" id="mobile-container">
              <div class="mobile-top" id="mobile-top">
                ${regions.cameraSwitcher}
                <div class="live-stage live-stage--overlay" id="live-stage">
                  ${regions.live}
                  ${buildLivePlaybackControlsMarkup(regions)}
                </div>
              </div>
              <div class="mobile-bottom" id="mobile-bottom">
                <div class="mobile-video-controls-container">
                    <div class="button-holder-row mobile-video-controls-left-row">
                    </div>
                    <div class="button-holder-row mobile-microphone-row">
                      ${regions.twoWayTalk}
                      ${regions.mobileInlineMute}
                    </div>
                    <div class="button-holder-row mobile-video-controls-right-row">
                    </div>
                </div>              
                <div class="mobile-tab-container shadow-small">
                    <div class="button-holder-row mobile-left-row">
                      ${regions.tabs}
                    </div>
                    <div class="button-holder-row mobile-tabs-row">
                      
                    </div>
                    <div class="button-holder-row mobile-tools-row">
                      ${regions.tools}
                    </div>
                </div>

                ${regions.browseHeader}
                ${regions.browse}
                ${regions.footer}
              </div>
            </div>
          </div>`;
}

export function buildMobileViewCamSwitcherMarkup(args) {
  return buildMobileCamSwitcherMarkup(args);
}

export function resolveMobileViewTitleText({
  title,
} = {}) {
  return String(title || "").trim() || DEFAULT_TITLE;
}

export function resolveMobileViewSubtitleText({
  subtitle,
  activeCamera = null,
  getCameraName,
} = {}) {
  const value = String(subtitle || "").trim();
  if (value && value !== DEFAULT_SUBTITLE) return value;
  return activeCamera && typeof getCameraName === "function"
    ? getCameraName(activeCamera)
    : "Camera";
}

export function resolveMobileViewStreamTypeText(streamType) {
  return streamType || "--";
}

export function resolveMobileViewAlertsCountText(alertsCount) {
  return String(alertsCount);
}

export function resolveMobileViewStatusColor(online) {
  return online ? "#4ade80" : "#ef4444";
}

export function resolveMobileViewOnlineLabel(online) {
  return online ? "Online" : "Offline";
}

export function applyMobileViewPageMarkup({ host, pageIds }) {
  const card = host?._$("#card");
  if (!card) return;

  card.classList.toggle(
    MOBILE_VIEW_ACTIVE_CLASS,
    isMobileViewRoute(host._pageId, pageIds),
  );
}
