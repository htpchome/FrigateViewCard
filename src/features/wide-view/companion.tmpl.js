const companionSeverityClass = (severity) => {
  if (severity === "alert") return "grid-alert";
  if (severity === "detection") return "grid-detection";
  return "";
};

export function buildWideCompanionStatusMarkup(online) {
  return `<span class="dot" style="color:${online ? "#4ade80" : "#ef4444"}">●</span>${online ? "Online" : "Offline"}`;
}

export function buildWideCompanionMetaMarkup({
  name,
  online,
  sourceLabel,
  alertsCount,
}) {
  return `<div class="preview-meta wide-companion-meta">
            <div class="preview-meta-name wide-companion-meta-name">${name}</div>
            <div class="preview-meta-status wide-companion-meta-status">${buildWideCompanionStatusMarkup(online)}</div>
            <div class="preview-meta-source wide-companion-meta-source">Stream Source: ${sourceLabel}</div>
            <div class="preview-meta-alerts wide-companion-meta-alerts">Alerts: ${alertsCount}</div>
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
            <div class="preview-media-host wide-companion-media-host ${companionSeverityClass(severity)}" data-wide-companion-media-entity="${entity}" data-wide-companion-use-live="${useLive ? "1" : "0"}"></div>
            ${metaMarkup}
          </div>`;
}

export function buildWideCompanionRegionMarkup() {
  return `<section class="wide-companion-panel" id="wide-companion-panel" aria-label="Companion Cameras">
            <div class="wide-companion-title">Companion Cameras</div>
            <div class="preview-grid wide-companion-grid" id="wide-companion-grid"></div>
          </section>`;
}
