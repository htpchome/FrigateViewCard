import { DEFAULT_SUBTITLE } from "../constants.js";
import { escapeHtml, escapeHtmlAttribute } from "../shared/html.js";

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

export function buildFooterMarkup({
  icons = {},
  includeFrigateView = true,
  displayFrigateView = true,
  version = "",
} = {}) {
  if (!includeFrigateView) return "";
  const frigateView = `<div><div class="frigate-view">${displayFrigateView ? icons.frigateView || "" : ""}</div></div>`;
  const normalizedVersion = String(version || "").trim();
  const footerVersion = normalizedVersion
    ? `<div class="footer-version" aria-label="FrigateView version ${escapeHtmlAttribute(normalizedVersion)}">v${escapeHtml(normalizedVersion)}</div>`
    : "";
  return `<div class="footer" data-fvc-region="footer">
              ${frigateView}
              ${footerVersion}
            </div>`;
}
