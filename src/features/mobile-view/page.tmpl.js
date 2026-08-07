import { MOBILE_VIEW_ACTIVE_CLASS, isMobileViewRoute } from "./utils.js";

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
            <span class="cam-dot" style="color:${ok ? "#4ade80" : "#ef4444"}">●</span>
            <span class="mobile-cam-picker__option-label">${name}</span>
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
        <span class="mobile-cam-picker__label">${activeCameraName}</span>
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
  version,
  eventsCount = "—",
}) {
  return `<div class="info-row mobile-view-info-row">
              <div>
                <div class="info-title" id="info-title">${title}</div>
                <span class="section-label" id="tl-range">${subtitle}</span>
              </div>
              <div class="stats">
                <div class="stat">
                  <div class="sv">v${version}</div>
                  <div class="sl">Version</div>
                </div>
                <div class="stat">
                  <div class="sv" id="ev-count">${resolveMobileViewEventsCountText(eventsCount)}</div>
                  <div class="sl">Events</div>
                </div>
              </div>
            </div>`;
}

export function buildMobileViewMainLayoutShellMarkup({
  liveEngineWrap,
  infoRow,
  pageNav,
  camSwitcher,
  rightColumnShell,
  layoutProfile = {},
}) {
  const layoutClassName = ["layout", layoutProfile.layoutClass, "mobile-layout"]
    .filter(Boolean)
    .join(" ");

  return `<div class="${layoutClassName}" id="layout">
            <div class="mobile-container" id="mobile-container">
              <div class="mobile-top" id="mobile-top">
                ${pageNav}
                ${camSwitcher}
                ${liveEngineWrap}
              </div>
              <div class="mobile-bottom" id="mobile-bottom">
                ${infoRow}
                ${rightColumnShell}
              </div>
            </div>
          </div>`;
}

export function buildMobileViewCamSwitcherMarkup(args) {
  return buildMobileCamSwitcherMarkup(args);
}

export function resolveMobileViewTitleText({
  title,
  cameras = [],
  activeCamera = null,
  getCameraName,
}) {
  if (title) return title;
  if (Array.isArray(cameras) && cameras.length > 1 && activeCamera) {
    return getCameraName(activeCamera);
  }
  return "Camera";
}

export function resolveMobileViewSubtitleText(config) {
  return config?.subtitle || "Frigate";
}

export function resolveMobileViewStreamTypeText(streamType) {
  return streamType || "--";
}

export function resolveMobileViewEventsCountText(eventsCount) {
  return String(eventsCount);
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
