import { MOBILE_VIEW_ACTIVE_CLASS, isMobileViewRoute } from "./utils.js";

function buildCamSwitcherMarkup({
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

export function buildMobileViewInfoRowMarkup({
  title,
  subtitle,
  version,
  streamType = "--",
  eventsCount = "—",
  online = true,
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
                  <div class="sv stream-type" id="stream-type">${resolveMobileViewStreamTypeText(streamType)}</div>
                  <div class="sl">Stream</div>
                </div>
                <div class="stat">
                  <div class="sv" id="ev-count">${resolveMobileViewEventsCountText(eventsCount)}</div>
                  <div class="sl">Events</div>
                </div>
                <div class="stat">
                  <div class="sv" id="on-dot" style="color:${resolveMobileViewStatusColor(online)}">●</div>
                  <div class="sl" id="on-lbl">${resolveMobileViewOnlineLabel(online)}</div>
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
  return buildCamSwitcherMarkup(args);
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
