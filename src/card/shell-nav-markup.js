export function buildPageNavMarkup({ routes, activePageId, getRouteLabel }) {
  return `<div class="page-nav" aria-label="Page navigation">${routes
    .map((pageId) => {
      const isActive = pageId === activePageId;
      return `<button class="page-nav-btn${
        isActive ? " active" : ""
      }" type="button" data-page-route="${pageId}" aria-pressed="${
        isActive ? "true" : "false"
      }">${getRouteLabel(pageId)}</button>`;
    })
    .join("")}</div>`;
}

export function resolveSubtitleText(config) {
  return config?.subtitle || "Frigate";
}
