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
  const tabMarkup = (id, icon, label, key) =>
    ht.has(id) ||
    (gridModeListOnly && ["clips", "snapshot", "recordings"].includes(id))
      ? ""
      : id === activeTab
        ? `<div class="${tabButtonClass} active" data-tab="${id}" title="${label}" data-fvc-i18n-title="runtime.toolbar.${key}">${icon}</div>`
        : `<div class="${tabButtonClass}" data-tab="${id}" title="${label}" data-fvc-i18n-title="runtime.toolbar.${key}">${icon}</div>`;
  const markup = `${tabMarkup("alerts", icons.alerts, "Alerts", "alerts")}
      ${tabMarkup("clips", icons.clips, "Clips", "clips")}
      ${tabMarkup("snapshot", icons.snapshot, "Snapshots", "snapshots")}
      ${tabMarkup("recordings", icons.recordings, "Recordings", "recordings")}
      ${tabMarkup("kept", icons.star, "Favorites", "favorites")}`;
  return { activeTab, markup };
}

export function resolveToolbarModeButtonStates({
  controlsVisible = false,
  controlsActive = false,
  recordingsActive = false,
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
      twoWayTalkActive,
    slideshowDisabled:
      controlsActive ||
      gridActive ||
      twoWayTalkActive,
    wideAlertTakeoverDisabled:
      controlsActive || twoWayTalkActive,
    filterDisabled: controlsActive || recordingsActive,
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
  showSingleAlertTakeover = false,
  singleAlertTakeoverEnabled = false,
  showMobileAlertTakeover = false,
  mobileAlertTakeoverEnabled = false,
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
  const gridKey = gridActive ? "stopGrid" : "startGrid";
  const gridLabel = gridActive ? "Stop grid mode" : "Start grid mode";
  const gridButton = gridHidden
    ? ""
    : `<button class="${toolButtonClass}${gridActive ? " active" : ""}" id="grid-btn" aria-pressed="${gridActive ? "true" : "false"}" title="${gridLabel}" aria-label="${gridLabel}" data-fvc-i18n-title="runtime.toolbar.${gridKey}" data-fvc-i18n-aria-label="runtime.toolbar.${gridKey}" ${gridDisabled ? "disabled" : ""}>${gridButtonIcon}</button>`;
  const showAlertTakeover =
    showSingleAlertTakeover ||
    showMobileAlertTakeover ||
    showWideAlertTakeover;
  const alertTakeoverEnabled = showSingleAlertTakeover
    ? singleAlertTakeoverEnabled
    : showMobileAlertTakeover
      ? mobileAlertTakeoverEnabled
      : wideAlertTakeoverEnabled;
  const alertTakeoverButtonId = showSingleAlertTakeover
    ? "single-alert-takeover-btn"
    : showMobileAlertTakeover
      ? "mobile-alert-takeover-btn"
      : "wide-alert-takeover-btn";
  const wideAlertTakeoverLabel = alertTakeoverEnabled
    ? "Disable Alert Camera Takeover"
    : "Enable Alert Camera Takeover";
  const alertTakeoverKey = alertTakeoverEnabled
    ? "disableAlertTakeover"
    : "enableAlertTakeover";
  const wideAlertTakeoverButton = showAlertTakeover
    ? `<button class="${toolButtonClass}${alertTakeoverEnabled ? " active" : ""}" id="${alertTakeoverButtonId}" type="button" aria-pressed="${alertTakeoverEnabled ? "true" : "false"}" title="${wideAlertTakeoverLabel}" aria-label="${wideAlertTakeoverLabel}" data-fvc-i18n-title="runtime.toolbar.${alertTakeoverKey}" data-fvc-i18n-aria-label="runtime.toolbar.${alertTakeoverKey}" ${wideAlertTakeoverDisabled ? "disabled" : ""}>${wideAlertTakeoverButtonIcon}</button><div class="divider">${icons.divider}</div>`
    : "";
  const slideshowHidden = !isSlideshowRotationAvailable;
  const slideshowActive = isSlideshowActive;
  const slideshowKey = slideshowActive ? "stopSlideshow" : "startSlideshow";
  const slideshowLabel = slideshowActive
    ? "Stop slideshow rotation"
    : "Start slideshow rotation";
  const slideshowButton = slideshowHidden
    ? ""
    : `<button class="${toolButtonClass} slideshow-btn${slideshowActive ? " active" : ""}" id="slideshow-btn" aria-pressed="${slideshowActive ? "true" : "false"}" title="${slideshowLabel}" aria-label="${slideshowLabel}" data-fvc-i18n-title="runtime.toolbar.${slideshowKey}" data-fvc-i18n-aria-label="runtime.toolbar.${slideshowKey}" ${slideshowDisabled ? "disabled" : ""}>${slideshowButtonIcon}</button><div class="divider">${icons.divider}</div>`;
  const markup = `<div class="tl-tools">
        ${controlsHidden ? "" : `<button class="${toolButtonClass}${tab === "controls" ? " active" : ""}" id="controls-btn" title="PTZ Controls" aria-label="Controls" data-fvc-i18n-title="runtime.toolbar.ptzControls" data-fvc-i18n-aria-label="runtime.toolbar.controls" aria-pressed="${tab === "controls" ? "true" : "false"}" ${controlsDisabled ? "disabled" : ""}>${icons.ptz}</button><div class="divider">${icons.divider}</div>`}
        ${gridButton}
        ${wideAlertTakeoverButton}
        ${slideshowButton}
        <button class="${toolButtonClass}${isFilterPanelOpen ? " active" : ""}" id="filter-btn" title="Filter" aria-label="Filter" data-fvc-i18n-title="runtime.toolbar.filter" data-fvc-i18n-aria-label="runtime.toolbar.filter" aria-pressed="${isFilterPanelOpen ? "true" : "false"}" ${resolvedFilterDisabled ? "disabled" : ""}>${icons.filter}</button>
        <div class="filter-panel shadow-small" id="filter-panel" data-fvc-region="filter-panel" style="display:none"></div>
        <button class="${toolButtonClass}${isCalendarPanelOpen ? " active" : ""}" id="cal-btn" title="Calendar" aria-label="Calendar" data-fvc-i18n-title="runtime.toolbar.calendar" data-fvc-i18n-aria-label="runtime.toolbar.calendar" aria-pressed="${isCalendarPanelOpen ? "true" : "false"}" ${calendarDisabled ? "disabled" : ""}>${icons.calendar}</button>
        <div class="cal-panel shadow-small" id="cal-panel" data-fvc-region="calendar-panel" style="display:none"></div>
      </div>`;
  return markup;
}
