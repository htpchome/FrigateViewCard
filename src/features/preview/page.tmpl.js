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

/**
 * Builds preview metadata HTML.
 * @param {object} args Metadata arguments.
 * @param {boolean} args.showTitleBars Whether metadata bars are enabled.
 * @param {string} args.name Camera display name.
 * @param {boolean} args.online Camera online state.
 * @param {string} args.sourceLabel Rendered stream source label.
 * @param {number} args.eventsCount Combined event count.
 * @returns {string}
 */
export function buildPreviewMetaMarkup({
  showTitleBars,
  name,
  online,
  sourceLabel,
  eventsCount,
}) {
  if (!showTitleBars) return "";
  return `<div class="preview-meta">
              <div class="preview-meta-name">${name}</div>
              <div class="preview-meta-status">${buildPreviewStatusMarkup(online)}</div>
              <div class="preview-meta-source">Stream Source: ${sourceLabel}</div>
              <div class="preview-meta-events">Events: ${eventsCount}</div>
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
 * @returns {string}
 */
export function buildPreviewCellMarkup({
  index,
  entity,
  severity,
  useLive,
  metaMarkup,
}) {
  return `<div class="preview-cell shadow-medium" data-preview-camidx="${index}">
          <div class="preview-media-host ${previewMediaSeverityClass(severity)}" data-preview-media-entity="${entity}" data-preview-use-live="${useLive ? "1" : "0"}"></div>
          ${metaMarkup}
        </div>`;
}

/**
 * Builds preview camera selector button markup.
 * @param {object} args Button arguments.
 * @param {number} args.index Camera index.
 * @param {string} args.name Camera display name.
 * @returns {string}
 */
export function buildPreviewCameraButtonMarkup({ index, name }) {
  return `<button class="glass-btn preview-cam-btn" type="button" data-preview-select-camidx="${index}">${name}</button>`;
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
