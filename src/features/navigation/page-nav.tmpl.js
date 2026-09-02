import { escapeHtml, escapeHtmlAttribute } from "../../shared/html.js";

export function buildPageNavButtonsMarkup({
  routes,
  activePageId,
  getRouteLabel,
  getRouteIcon,
}) {
  return routes
    .map((pageId) => {
      const isActive = pageId === activePageId;
      const label = getRouteLabel(pageId);
      const icon =
        typeof getRouteIcon === "function" ? getRouteIcon(pageId) : "";
      return `<button class="page-nav-btn${
        isActive ? " active" : ""
      } tool" type="button" data-page-route="${escapeHtmlAttribute(pageId)}" aria-label="${escapeHtmlAttribute(label)}" title="${escapeHtmlAttribute(label)}" aria-pressed="${
        isActive ? "true" : "false"
      }">${icon || escapeHtml(label)}</button>`;
    })
    .join("");
}

export function buildPageNavMarkup(options) {
  return `<div class="page-nav" data-fvc-region="page-navigation" aria-label="Page navigation">${buildPageNavButtonsMarkup(options)}</div>`;
}
