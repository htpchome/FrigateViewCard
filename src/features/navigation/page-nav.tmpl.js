import { escapeHtml, escapeHtmlAttribute } from "../../shared/html.js";

export function buildPageNavButtonsMarkup({
  routes,
  activePageId,
  getRouteLabel,
  getRouteIcon,
  getRouteLocalizationKey,
}) {
  return routes
    .map((pageId) => {
      const isActive = pageId === activePageId;
      const label = getRouteLabel(pageId);
      const icon =
        typeof getRouteIcon === "function" ? getRouteIcon(pageId) : "";
      const localizationKey = getRouteLocalizationKey?.(pageId);
      const localizedAttributes = localizationKey
        ? ` data-fvc-i18n-aria-label="${escapeHtmlAttribute(localizationKey)}" data-fvc-i18n-title="${escapeHtmlAttribute(localizationKey)}"`
        : "";
      const content = icon || (localizationKey
        ? `<span data-fvc-i18n="${escapeHtmlAttribute(localizationKey)}">${escapeHtml(label)}</span>`
        : escapeHtml(label));
      return `<button class="page-nav-btn${
        isActive ? " active" : ""
      } tool" type="button" data-page-route="${escapeHtmlAttribute(pageId)}" aria-label="${escapeHtmlAttribute(label)}" title="${escapeHtmlAttribute(label)}"${localizedAttributes} aria-pressed="${
        isActive ? "true" : "false"
      }">${content}</button>`;
    })
    .join("");
}

export function buildPageNavMarkup(options) {
  return `<div class="page-nav" data-fvc-region="page-navigation" aria-label="Page navigation" data-fvc-i18n-aria-label="runtime.pageNav.navigation">${buildPageNavButtonsMarkup(options)}</div>`;
}
