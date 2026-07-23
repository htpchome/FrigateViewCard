import { resolveActiveTab } from "../helpers.js";

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

export function buildTabsMarkup({
  tab,
  hiddenTabs,
  viewMode,
  icons,
  isGridModeAvailable,
  isSlideshowRotationAvailable,
  isSlideshowActive,
  gridButtonIcon,
  slideshowButtonIcon,
}) {
  const ht = new Set(hiddenTabs || []);
  const gridModeListOnly = viewMode === "grid";
  const tabOrder = gridModeListOnly
    ? ["alerts", "kept"]
    : ["alerts", "clips", "snapshot", "recordings", "kept"];
  const activeTab = resolveActiveTab(tab, ht, tabOrder);
  const tabMarkup = (id, icon, label) =>
    ht.has(id) ||
    (gridModeListOnly && ["clips", "snapshot", "recordings"].includes(id))
      ? ""
      : id === activeTab
        ? `<div class="donut active" data-tab="${id}" title="${label}">${icon}</div>`
        : `<div class="donut" data-tab="${id}" title="${label}">${icon}</div>`;
  const filterDisabled = activeTab === "recordings";
  const gridHidden = !isGridModeAvailable;
  const gridActive = viewMode === "grid";
  const gridButton = gridHidden
    ? ""
    : `<button class="tool${gridActive ? " active" : ""}" id="grid-btn" aria-pressed="${gridActive ? "true" : "false"}" title="${gridActive ? "Stop grid mode" : "Start grid mode"}" aria-label="${gridActive ? "Stop grid mode" : "Start grid mode"}">${gridButtonIcon}</button>`;
  const slideshowHidden = !isSlideshowRotationAvailable;
  const slideshowActive = isSlideshowActive;
  const slideshowButton = slideshowHidden
    ? ""
    : `<button class="tool slideshow-btn${slideshowActive ? " active" : ""}" id="slideshow-btn" aria-pressed="${slideshowActive ? "true" : "false"}" title="${slideshowActive ? "Stop slideshow rotation" : "Start slideshow rotation"}" aria-label="${slideshowActive ? "Stop slideshow rotation" : "Start slideshow rotation"}">${slideshowButtonIcon}</button>`;
  const markup = `${tabMarkup("alerts", icons.alerts, "Alerts")}
      ${tabMarkup("clips", icons.clips, "Clips")}
      ${tabMarkup("snapshot", icons.snapshot, "Snapshots")}
      ${tabMarkup("recordings", icons.recordings, "Recordings")}
      ${tabMarkup("kept", icons.star, "Kept events")}
      <div class="tl-tools" style=" margin-left: auto;">
        <button class="tool" id="now-btn" title="Today">${icons.bullseye}</button>
        ${gridButton}
        ${slideshowButton}
        <button class="tool" id="filter-btn" title="Filter" ${filterDisabled ? "disabled" : ""}>${icons.filter}</button>
        <button class="tool" id="cal-btn" title="Calendar">${icons.calendar}</button>
      </div>`;
  return { activeTab, markup };
}
