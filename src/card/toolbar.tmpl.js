import { resolveActiveTab } from "../helpers.js";

export function buildTabsMarkup({
  tab,
  hiddenTabs,
  viewMode,
  icons,
  buttonClass = "circle-btn",
}) {
  const ht = new Set(hiddenTabs || []);
  const gridModeListOnly = viewMode === "grid";
  const tabOrder = gridModeListOnly
    ? ["alerts", "kept", "controls"]
    : ["alerts", "clips", "snapshot", "recordings", "kept", "controls"];
  const activeTab = resolveActiveTab(tab, ht, tabOrder);
  const tabButtonClass =
    String(buttonClass || "circle-btn").trim() || "circle-btn";
  const tabMarkup = (id, icon, label) =>
    ht.has(id) ||
    (gridModeListOnly && ["clips", "snapshot", "recordings"].includes(id))
      ? ""
      : id === activeTab
        ? `<div class="${tabButtonClass} active" data-tab="${id}" title="${label}">${icon}</div>`
        : `<div class="${tabButtonClass}" data-tab="${id}" title="${label}">${icon}</div>`;
  const markup = `${tabMarkup("alerts", icons.alerts, "Alerts")}
      ${tabMarkup("clips", icons.clips, "Clips")}
      ${tabMarkup("snapshot", icons.snapshot, "Snapshots")}
      ${tabMarkup("recordings", icons.recordings, "Recordings")}
      ${tabMarkup("kept", icons.star, "Kept events")}`;
  return { activeTab, markup };
}

export function resolveToolbarModeButtonStates({
  controlsVisible = false,
  controlsActive = false,
  gridActive = false,
  slideshowActive = false,
  wideAlertTakeoverActive = false,
  twoWayTalkActive = false,
} = {}) {
  return {
    controlsVisible: controlsVisible === true,
    controlsDisabled:
      gridActive || slideshowActive || wideAlertTakeoverActive,
    gridDisabled:
      controlsActive ||
      slideshowActive ||
      wideAlertTakeoverActive ||
      twoWayTalkActive,
    slideshowDisabled:
      controlsActive ||
      gridActive ||
      wideAlertTakeoverActive ||
      twoWayTalkActive,
    wideAlertTakeoverDisabled:
      controlsActive || gridActive || slideshowActive || twoWayTalkActive,
    filterDisabled: controlsActive,
    calendarDisabled: controlsActive,
  };
}

export function buildToolsMarkup({
  tab,
  viewMode,
  icons,
  buttonClass = "tool",
  isFilterPanelOpen,
  isCalendarPanelOpen,
  isGridModeAvailable,
  isSlideshowRotationAvailable,
  isSlideshowActive,
  isControlsVisible,
  controlsDisabled,
  gridDisabled,
  slideshowDisabled,
  wideAlertTakeoverDisabled,
  filterDisabled,
  calendarDisabled,
  gridButtonIcon,
  slideshowButtonIcon,
  showWideAlertTakeover = false,
  wideAlertTakeoverEnabled = false,
  wideAlertTakeoverButtonIcon = "",
}) {
  const toolButtonClass =
    String(buttonClass || "tool").trim() || "tool";
  const resolvedFilterDisabled = filterDisabled || tab === "recordings";
  const controlsHidden = isControlsVisible === false;
  const gridHidden = !isGridModeAvailable;
  const gridActive = viewMode === "grid";
  const gridButton = gridHidden
    ? ""
    : `<button class="${toolButtonClass}${gridActive ? " active" : ""}" id="grid-btn" aria-pressed="${gridActive ? "true" : "false"}" title="${gridActive ? "Stop grid mode" : "Start grid mode"}" aria-label="${gridActive ? "Stop grid mode" : "Start grid mode"}" ${gridDisabled ? "disabled" : ""}>${gridButtonIcon}</button>`;
  const wideAlertTakeoverLabel = wideAlertTakeoverEnabled
    ? "Disable Alert Camera Takeover"
    : "Enable Alert Camera Takeover";
  const wideAlertTakeoverButton = showWideAlertTakeover
    ? `<button class="${toolButtonClass}${wideAlertTakeoverEnabled ? " active" : ""}" id="wide-alert-takeover-btn" type="button" aria-pressed="${wideAlertTakeoverEnabled ? "true" : "false"}" title="${wideAlertTakeoverLabel}" aria-label="${wideAlertTakeoverLabel}" ${wideAlertTakeoverDisabled ? "disabled" : ""}>${wideAlertTakeoverButtonIcon}</button><div class="divider">${icons.divider}</div>`
    : "";
  const slideshowHidden = !isSlideshowRotationAvailable;
  const slideshowActive = isSlideshowActive;
  const slideshowButton = slideshowHidden
    ? ""
    : `<button class="${toolButtonClass} slideshow-btn${slideshowActive ? " active" : ""}" id="slideshow-btn" aria-pressed="${slideshowActive ? "true" : "false"}" title="${slideshowActive ? "Stop slideshow rotation" : "Start slideshow rotation"}" aria-label="${slideshowActive ? "Stop slideshow rotation" : "Start slideshow rotation"}" ${slideshowDisabled ? "disabled" : ""}>${slideshowButtonIcon}</button><div class="divider">${icons.divider}</div>`;
  const markup = `<div class="tl-tools">
        ${controlsHidden ? "" : `<button class="${toolButtonClass}${tab === "controls" ? " active" : ""}" id="controls-btn" title="PTZ Controls" aria-label="Controls" aria-pressed="${tab === "controls" ? "true" : "false"}" ${controlsDisabled ? "disabled" : ""}>${icons.ptz}</button><div class="divider">${icons.divider}</div>`}
        ${gridButton}
        ${wideAlertTakeoverButton}
        ${slideshowButton}
        <button class="${toolButtonClass}${isFilterPanelOpen ? " active" : ""}" id="filter-btn" title="Filter" aria-pressed="${isFilterPanelOpen ? "true" : "false"}" ${resolvedFilterDisabled ? "disabled" : ""}>${icons.filter}</button>
        <div class="filter-panel shadow-small" id="filter-panel" data-fvc-region="filter-panel" style="display:none"></div>
        <button class="${toolButtonClass}${isCalendarPanelOpen ? " active" : ""}" id="cal-btn" title="Calendar" aria-pressed="${isCalendarPanelOpen ? "true" : "false"}" ${calendarDisabled ? "disabled" : ""}>${icons.calendar}</button>
        <div class="cal-panel shadow-small" id="cal-panel" data-fvc-region="calendar-panel" style="display:none"></div>
      </div>`;
  return markup;
}
