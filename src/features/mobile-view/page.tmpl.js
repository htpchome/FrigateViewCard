import { MOBILE_VIEW_ACTIVE_CLASS, isMobileViewRoute } from "./utils.js";
import { buildLivePlaybackControlsMarkup } from "../live/view.tmpl.js";
import { DEFAULT_TITLE, DEFAULT_SUBTITLE } from "../../constants.js";
import { buildCameraPickerMarkup } from "../navigation/camera-picker.tmpl.js";
import { escapeHtml } from "../../shared/html.js";
import { resolveCameraAwareText } from "../../shared/page-text.js";

export function buildMobileCamSwitcherMarkup({
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
  return buildCameraPickerMarkup({
    includeStatus,
    cameras,
    activeCamIdx,
    icons,
    getCameraName,
    isCameraAvailable,
    streamType: resolveMobileViewStreamTypeText(streamType),
    online,
    pickerOpen,
  });
}

export function buildMobileViewBackButtonMarkup({
  previewPageEnabled = false,
  icons = {},
} = {}) {
  if (!previewPageEnabled) return "";
  return `<button class="round-btn preview-back-btn mobile-cam-picker__back" type="button" data-preview-back title="Back to preview page" aria-label="Back to preview page">${icons.back || ""}</button>`;
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
                <div class="info-title" id="info-title" ${displayTitle ? "" : "hidden"}>${escapeHtml(title)}</div>
                <span class="section-label" id="tl-range" ${displaySubtitle ? "" : "hidden"}>${escapeHtml(subtitle)}</span>
              </div>
              <div class="stats">
                <div class="stat">
                  <div class="sv" id="alert-count">${escapeHtml(resolveMobileViewAlertsCountText(alertsCount))}</div>
                  <div class="sl">Alerts</div>
                </div>
              </div>
            </div>`;
}

export function buildMobileViewMainLayoutShellMarkup({
  regions: suppliedRegions = null,
  layoutProfile = {},
  backButton = "",
  cameraSwitcherMarkup = "",
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
    mobileMicrophoneMute: "",
    mobileInlineMute: "",
    linkedEntities: "",
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
                <div class="cam-switcher" id="cam-switcher" data-fvc-region="camera-switcher">
                  <div class="mobile-cam-picker__back-slot">${backButton}</div>
                  <div class="mobile-cam-switcher__content" data-mobile-cam-switcher-content>${cameraSwitcherMarkup}</div>
                </div>
                <div class="live-stage live-stage--overlay" id="live-stage">
                  ${regions.live}
                  ${buildLivePlaybackControlsMarkup(regions)}
                </div>
                </div>
                <div class="mobile-bottom" id="mobile-bottom">
                <div class="mobile-video-controls-container">
                    <div class="linked-light-region" data-fvc-region="linked-entities" data-linked-light-variant="icon-btn">
                      <div class="button-holder-row mobile-video-controls-left-row linked-light-position-slot" data-linked-light-position-slot="left" ${regions.linkedEntitiesLeft ? "" : "hidden"}>${regions.linkedEntitiesLeft || ""}</div>
                      <div class="button-holder-row mobile-video-controls-right-row linked-light-position-slot" data-linked-light-position-slot="right" ${regions.linkedEntitiesRight || regions.linkedEntities ? "" : "hidden"}>${regions.linkedEntitiesRight || regions.linkedEntities || ""}</div>
                    </div>
                    <div class="button-holder-row mobile-microphone-row">
                      ${regions.mobileMicrophoneMute}
                      ${regions.twoWayTalk}
                      ${regions.mobileInlineMute}
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
  activeCamera = null,
  getCameraName,
  gridMode = false,
} = {}) {
  return resolveCameraAwareText({
    value: title,
    fallback: DEFAULT_TITLE,
    activeCamera,
    getCameraName,
    gridMode,
  });
}

export function resolveMobileViewSubtitleText({
  subtitle,
  activeCamera = null,
  getCameraName,
  gridMode = false,
} = {}) {
  return resolveCameraAwareText({
    value: subtitle,
    fallback: DEFAULT_SUBTITLE,
    blankUsesCamera: true,
    activeCamera,
    getCameraName,
    gridMode,
  });
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
