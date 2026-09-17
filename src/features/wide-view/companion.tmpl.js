import { escapeHtml, escapeHtmlAttribute } from "../../shared/html.js";

const companionSeverityClass = (severity) => {
  if (severity === "alert") return "grid-alert";
  if (severity === "detection") return "grid-detection";
  return "";
};

export function buildWideCompanionStatusMarkup(online) {
  const status = online ? "Online" : "Offline";
  const key = online ? "runtime.live.online" : "runtime.live.offline";
  return `<span class="dot" style="color:var(${online ? "--c-on" : "--c-off"})" title="${status}" aria-label="${status}" data-fvc-i18n-title="${key}" data-fvc-i18n-aria-label="${key}">●</span>`;
}

export function buildWideCompanionMetaMarkup({
  name,
  online,
}) {
  return `<div class="preview-meta wide-companion-meta">
            <div class="preview-meta-status wide-companion-meta-status">${buildWideCompanionStatusMarkup(online)}</div>
            <div class="preview-meta-name wide-companion-meta-name">${escapeHtml(name)}</div>
          </div>`;
}

export function buildWideCompanionCellMarkup({
  index,
  entity,
  severity,
  useLive,
  metaMarkup,
}) {
  return `<div class="preview-cell wide-companion-cell shadow-medium" data-wide-companion-camidx="${index}">
            <div class="preview-media-host wide-companion-media-host ${companionSeverityClass(severity)}" data-wide-companion-media-entity="${escapeHtmlAttribute(entity)}" data-wide-companion-use-live="${useLive ? "1" : "0"}"></div>
            ${metaMarkup}
          </div>`;
}

export function buildWideCompanionRegionMarkup({ chevronIcon = "" } = {}) {
  return `<section class="wide-companion-panel" id="wide-companion-panel" aria-label="Companion Cameras" data-fvc-i18n-aria-label="runtime.wideView.companionCameras">
            <div class="wide-companion-surface">
              <div class="wide-companion-header">
                <div class="wide-companion-resize-handle" data-wide-companion-resize-handle role="separator" tabindex="0" aria-label="Resize Companion Cameras area" data-fvc-i18n-aria-label="runtime.wideView.resizeCompanionArea" aria-orientation="horizontal" aria-valuemin="0" aria-valuemax="0" aria-valuenow="0" aria-controls="wide-companion-grid" title="Drag up or down to resize the Companion Cameras area" data-fvc-i18n-title="runtime.wideView.resizeCompanionHint">
                  <div class="wide-companion-title" data-fvc-i18n="runtime.wideView.companionCameras">Companion Cameras</div>
                  <span class="wide-companion-resize-affordance" aria-hidden="true">
                    <span class="wide-companion-resize-arrow wide-companion-resize-arrow--up">${chevronIcon}</span>
                    <span class="wide-companion-resize-label" data-fvc-i18n="runtime.wideView.resizeArea">Resize Area</span>
                    <span class="wide-companion-resize-arrow">${chevronIcon}</span>
                  </span>
                </div>
                <button class="wide-companion-expand-button" type="button" data-wide-companion-expand-button aria-controls="wide-companion-grid" aria-expanded="false" title="Expand Companion Cameras" aria-label="Expand Companion Cameras" data-fvc-i18n-title="runtime.wideView.expandCompanionCameras" data-fvc-i18n-aria-label="runtime.wideView.expandCompanionCameras">${chevronIcon}</button>
              </div>
              <div class="preview-grid wide-companion-grid" id="wide-companion-grid"></div>
            </div>
          </section>`;
}
