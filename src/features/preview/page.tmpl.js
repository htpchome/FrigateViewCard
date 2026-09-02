import { buildLivePlaybackControlsMarkup } from "../live/view.tmpl.js";
import { escapeHtml, escapeHtmlAttribute } from "../../shared/html.js";

/**
 * Returns the class suffix used for preview alert/detection highlighting.
 * @param {string} severity Preview severity value.
 * @returns {string}
 */
export function previewMediaSeverityClass(severity) {
  if (severity === "alert") return "grid-alert";
  if (severity === "detection") return "grid-detection";
  return "";
}

/**
 * Builds status marker HTML used by preview metadata.
 * @param {boolean} online Whether camera is currently online.
 * @returns {string}
 */
export function buildPreviewStatusMarkup(online) {
  return `<span class="dot" style="color:${online ? "#4ade80" : "#ef4444"}">●</span>${online ? "Online" : "Offline"}`;
}

export function buildPreviewLightRegionMarkup({
  cameraEntity = "",
  linkedLightMarkup = "",
  linkedLightPosition = "right",
  linkedLightLeftMarkup = "",
  linkedLightRightMarkup = "",
  overlay = false,
} = {}) {
  const legacyPosition = linkedLightPosition === "left" ? "left" : "right";
  const leftMarkup =
    linkedLightLeftMarkup ||
    (legacyPosition === "left" ? linkedLightMarkup : "");
  const rightMarkup =
    linkedLightRightMarkup ||
    (legacyPosition === "right" ? linkedLightMarkup : "");
  if (!leftMarkup && !rightMarkup) return "";
  return `<div class="linked-light-region ${overlay ? "preview-light-overlay" : "preview-meta-light"}" data-fvc-region="linked-entities" data-linked-light-variant="icon-btn" data-linked-light-camera="${escapeHtmlAttribute(cameraEntity)}">
    <div class="linked-light-position-slot" data-linked-light-position-slot="left" ${leftMarkup ? "" : "hidden"}>${leftMarkup}</div>
    <div class="linked-light-position-slot" data-linked-light-position-slot="right" ${rightMarkup ? "" : "hidden"}>${rightMarkup}</div>
  </div>`;
}

/**
 * Builds preview metadata HTML.
 * @param {object} args Metadata arguments.
 * @param {boolean} args.showTitleBars Whether metadata bars are enabled.
 * @param {string} args.name Camera display name.
 * @param {boolean} args.online Camera online state.
 * @param {string} args.sourceLabel Rendered stream source label.
 * @param {number} args.alertsCount Filtered review count.
 * @param {string} args.cameraEntity Camera entity id.
 * @param {string} args.linkedLightMarkup Camera-specific light control markup.
 * @param {string} args.linkedLightPosition Configured light position.
 * @returns {string}
 */
export function buildPreviewMetaMarkup({
  showTitleBars,
  name,
  online,
  sourceLabel,
  alertsCount,
  cameraEntity = "",
  linkedLightMarkup = "",
  linkedLightPosition = "right",
  linkedLightLeftMarkup = "",
  linkedLightRightMarkup = "",
}) {
  if (!showTitleBars) return "";
  const light = buildPreviewLightRegionMarkup({
    cameraEntity,
    linkedLightMarkup,
    linkedLightPosition,
    linkedLightLeftMarkup,
    linkedLightRightMarkup,
  });
  return `<div class="preview-meta${light ? " preview-meta--with-light" : ""}">
              <div class="preview-meta-name">${escapeHtml(name)}</div>
              <div class="preview-meta-status">${buildPreviewStatusMarkup(online)}</div>
              <div class="preview-meta-source">Stream Source: ${escapeHtml(sourceLabel)}</div>
              <div class="preview-meta-alerts">Alerts: ${escapeHtml(alertsCount)}</div>
              ${light}
            </div>`;
}

/**
 * Builds a preview camera cell block.
 * @param {object} args Cell arguments.
 * @param {number} args.index Camera index.
 * @param {string} args.entity Camera entity id.
 * @param {string} args.severity Preview severity.
 * @param {boolean} args.useLive Whether cell uses live media.
 * @param {string} args.metaMarkup Pre-rendered metadata markup.
 * @param {string} args.overlayLightMarkup Pre-rendered media overlay control.
 * @returns {string}
 */
export function buildPreviewCellMarkup({
  index,
  entity,
  severity,
  useLive,
  metaMarkup,
  overlayLightMarkup = "",
}) {
  return `<div class="preview-cell shadow-medium" data-preview-camidx="${index}" data-preview-entity="${escapeHtmlAttribute(entity)}">
          <div class="preview-media-frame">
            <div class="preview-media-host ${previewMediaSeverityClass(severity)}" data-preview-media-entity="${escapeHtmlAttribute(entity)}" data-preview-use-live="${useLive ? "1" : "0"}"></div>
            ${overlayLightMarkup}
          </div>
          ${metaMarkup}
        </div>`;
}

/**
 * Builds preview camera selector button markup.
 * @param {object} args Button arguments.
 * @param {number} args.index Camera index.
 * @param {string} args.entity Camera entity id.
 * @param {string} args.name Camera display name.
 * @returns {string}
 */
export function buildPreviewCameraButtonMarkup({ index, entity, name }) {
  return `<button class="cam-tab preview-cam-btn shadow-small" type="button" data-preview-select-camidx="${index}" data-preview-select-entity="${escapeHtmlAttribute(entity)}">${escapeHtml(name)}</button>`;
}

/**
 * Builds preview shell markup from grid cells and selector buttons.
 * @param {object} args Shell arguments.
 * @param {string} args.cellsMarkup Joined grid cell markup.
 * @param {string} args.buttonsMarkup Joined camera button markup.
 * @returns {string}
 */
export function buildPreviewShellMarkup({ cellsMarkup, buttonsMarkup }) {
  return `<div class="preview-grid" id="preview-grid">${cellsMarkup}</div>
      <div class="preview-cam-buttons">${buttonsMarkup}</div>`;
}

export function buildPreviewShellHeaderMarkup({
  title,
  subtitle,
  displayTitle = true,
  displaySubtitle = true,
  headerLogo = "",
  displayHeaderLogo = false,
  pageNav,
}) {
  const showHeaderLogo =
    displayHeaderLogo === true && String(headerLogo || "").trim() !== "";
  return `<div class="preview-shell-header" id="preview-shell-header">
            <div class="preview-shell-brand">
              <div class="preview-shell-header-logo frigate-view" id="preview-shell-header-logo" ${showHeaderLogo ? "" : "hidden"}>${headerLogo}</div>
              <div class="preview-shell-title" id="preview-shell-title-block" ${showHeaderLogo ? "hidden" : ""}>
                <div class="preview-shell-title-main" id="preview-shell-title" ${displayTitle ? "" : "hidden"}>${escapeHtml(title)}</div>
                <div class="preview-shell-title-sub" id="preview-shell-subtitle" ${displaySubtitle ? "" : "hidden"}>${escapeHtml(subtitle)}</div>
              </div>
            </div>
            ${pageNav}
          </div>`;
}

export function buildPreviewLayoutShellMarkup({
  previewShellHeader,
  previewFooterIcon,
  version = "",
  hideFooter = false,
}) {
  const normalizedVersion = String(version || "").trim();
  const footerVersion = normalizedVersion
    ? `<div class="footer-version" aria-label="FrigateView version ${escapeHtmlAttribute(normalizedVersion)}">v${escapeHtml(normalizedVersion)}</div>`
    : "";
  return `${previewShellHeader}
          <div class="preview-shell" id="preview-shell"></div>
          <div class="preview-shell-footer" id="preview-shell-footer" ${hideFooter ? "hidden" : ""}>
            <div class="frigate-view">${previewFooterIcon}</div>
            ${footerVersion}
          </div>`;
}

function mergePreviewLayoutClassNames(...tokens) {
  return [
    ...new Set(tokens.filter(Boolean).join(" ").split(/\s+/).filter(Boolean)),
  ].join(" ");
}

function normalizePreviewPageRegions(regions) {
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
    tabs: "",
    tools: "",
    browseHeader: "",
    browse: "",
    footer: "",
    ...suppliedRegions,
  };
}

export function buildPreviewPageMainLayoutShellMarkup({
  regions: suppliedRegions = null,
  layoutProfile = {},
} = {}) {
  const regions = normalizePreviewPageRegions(suppliedRegions);
  const layoutClassName = mergePreviewLayoutClassNames(
    "layout",
    layoutProfile.layoutClass,
  );
  const leftColumnClassName = mergePreviewLayoutClassNames(
    "col-left",
    layoutProfile.leftColumnClass,
  );
  const rightColumnClassName = mergePreviewLayoutClassNames(
    "col-right",
    layoutProfile.rightColumnClass,
  );
  const tabsHolderClassName = mergePreviewLayoutClassNames(
    "tabs-holder",
    layoutProfile.tabsHolderClass,
  );
  const resizeHandleClassName = mergePreviewLayoutClassNames(
    "resize-handle",
    layoutProfile.resizeHandleClass,
  );

  return `<div class="${layoutClassName}" id="layout">
          <div class="${leftColumnClassName}" id="col-left">
            <div class="live-stage live-stage--overlay" id="live-stage">
              ${regions.live}
              ${buildLivePlaybackControlsMarkup({
                ...regions,
                livePictureInPicture: "",
              })}
            </div>

            ${regions.information}
            ${regions.cameraSwitcher}
          </div>
          <div class="${resizeHandleClassName}" id="resize-handle"></div>
          <div class="${rightColumnClassName}" id="col-right">
            <div class="${tabsHolderClassName} shadow-small">
              <div class="button-holder">
                <div class="button-holder-row tabs-row">
                  ${regions.tabs}
                </div>
                <div class="button-holder-row page-nav-row">
                  ${regions.pageNavigation}
                </div>
                <div class="button-holder-row tools-row">
                  ${regions.tools}
                </div>
              </div>
            </div>
            ${regions.browseHeader}
            ${regions.browse}
            ${regions.footer}
          </div>
        </div>`;
}
