import { buildLivePlaybackControlsMarkup } from "../live/view.tmpl.js";
import { DEFAULT_TITLE, DEFAULT_SUBTITLE } from "../../constants.js";
import { escapeHtml } from "../../shared/html.js";
import { resolveCameraAwareText } from "../../shared/page-text.js";

function mergeClassNames(...tokens) {
  return [
    ...new Set(tokens.filter(Boolean).join(" ").split(/\s+/).filter(Boolean)),
  ].join(" ");
}

function normalizeRegions(regions) {
  const suppliedRegions =
    regions && typeof regions === "object" && !Array.isArray(regions)
      ? regions
      : {};
  return {
    live: "",
    livePictureInPicture: "",
    liveFullscreen: "",
    liveTakeSnapshot: "",
    liveMute: "",
    information: "",
    cameraSwitcher: "",
    pageNavigation: "",
    pageToolsDivider: "",
    tabs: "",
    tools: "",
    browseHeader: "",
    browse: "",
    footer: "",
    liveSourceWebRtcIcon: "",
    ...suppliedRegions,
  };
}

export function buildSingleViewCamSwitcherMarkup({
  includeStatus = true,
  cameras = [],
  activeCamIdx = 0,
  isSingleView = false,
  getCameraName,
  isCameraAvailable,
} = {}) {
  return (Array.isArray(cameras) ? cameras : [])
    .map((camera, index) => {
      const name = getCameraName(camera);
      const active = isSingleView && index === activeCamIdx;
      const available = !includeStatus || isCameraAvailable(camera);
      return `<button class="cam-tab shadow-small ${active ? "active" : ""}" data-camidx="${index}"><span class="cam-dot" style="color:${available ? "#4ade80" : "#ef4444"}">●</span> ${escapeHtml(name)}</button>`;
    })
    .join("");
}

export function resolveSingleViewTitleText({
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

export function resolveSingleViewSubtitleText({
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

export function resolveSingleViewStreamTypeText(streamType) {
  return streamType || "--";
}

export function resolveSingleViewAlertsCountText(alertsCount) {
  return String(alertsCount);
}

export function resolveSingleViewStatusColor(online) {
  return online ? "#4ade80" : "#ef4444";
}

export function resolveSingleViewOnlineLabel(online) {
  return online ? "Online" : "Offline";
}

export function buildSingleViewLiveBadgeMarkup() {
  return `<div class="single-view-live-badge" data-single-view-live-badge aria-label="Live camera" data-fvc-i18n-aria-label="runtime.live.liveCamera">
            <span class="single-view-live-badge-dot" aria-hidden="true"></span>
            <span data-fvc-i18n="runtime.live.live">Live</span>
          </div>`;
}

export function buildSingleViewLiveStatusMarkup({ webRtcIcon = "" } = {}) {
  return `<div class="single-view-live-status-overlay" data-single-view-live-status-overlay>
              <div class="single-view-source-indicator" data-single-view-source-indicator aria-label="Live source" data-fvc-i18n-aria-label="runtime.live.liveSource" hidden>
                <span class="single-view-source-indicator-icon" data-single-view-source-icon aria-hidden="true" hidden>${webRtcIcon}</span>
                <span class="single-view-source-indicator-text" data-single-view-source-text hidden></span>
              </div>
              ${buildSingleViewLiveBadgeMarkup()}
            </div>`;
}

export function buildSingleViewMainLayoutShellMarkup({
  regions: suppliedRegions = null,
  layoutProfile = {},
} = {}) {
  const regions = normalizeRegions(suppliedRegions);
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
          <div class="view-frame single-view-frame">
            <div class="${leftColumnClassName} view-top" id="col-left">
              <div class="live-stage live-stage--overlay" id="live-stage">
                ${regions.live}
                ${buildLivePlaybackControlsMarkup(regions)}
                ${buildSingleViewLiveStatusMarkup({
                  webRtcIcon: regions.liveSourceWebRtcIcon,
                })}
              </div>

              ${regions.information}
              ${regions.cameraSwitcher}
            </div>
            <div class="${resizeHandleClassName}" id="resize-handle"></div>
            <div class="${rightColumnClassName} view-body" id="col-right">
              <div class="${tabsHolderClassName} shadow-small">
                <div class="button-holder button-holder--responsive-toolbar">
                  <div class="button-holder-row tabs-row">
                    ${regions.tabs}
                  </div>
                  <div class="button-holder-row page-nav-row">
                    ${regions.pageNavigation}
                  </div>
                  <div class="button-holder-row tools-row">
                    <div class="divider page-tools-divider" aria-hidden="true">${regions.pageToolsDivider}</div>
                    ${regions.tools}
                  </div>
                </div>
              </div>
              ${regions.browseHeader}
              ${regions.browse}
              ${regions.footer}
            </div>
          </div>
        </div>`;
}
