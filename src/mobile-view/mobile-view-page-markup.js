import {
  MOBILE_VIEW_ACTIVE_CLASS,
  isMobileViewRoute,
} from "./mobile-view-utils.js";
import { buildCamSwitcherMarkup } from "../card/shell-nav-markup.js";

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
