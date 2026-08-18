function mergeClassNames(...tokens) {
  return [
    ...new Set(tokens.filter(Boolean).join(" ").split(/\s+/).filter(Boolean)),
  ].join(" ");
}

function normalizeRegions(regions) {
  const suppliedRegions =
    regions && typeof regions === "object" && !Array.isArray(regions)
      ? regions
      : {};
  return {
    live: "",
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

export function buildSingleViewCamSwitcherMarkup({
  includeStatus = true,
  cameras = [],
  activeCamIdx = 0,
  isSingleView = false,
  getCameraName,
  isCameraAvailable,
} = {}) {
  return (Array.isArray(cameras) ? cameras : [])
    .map((camera, index) => {
      const name = getCameraName(camera);
      const active = isSingleView && index === activeCamIdx;
      const available = !includeStatus || isCameraAvailable(camera);
      return `<button class="glass-btn cam-tab shadow-small ${active ? "active" : ""}" data-camidx="${index}"><span class="cam-dot" style="color:${available ? "#4ade80" : "#ef4444"}">●</span> ${name}</button>`;
    })
    .join("");
}

export function resolveSingleViewTitleText({
  title,
  cameras = [],
  activeCamera = null,
  getCameraName,
} = {}) {
  if (title) return title;
  if (Array.isArray(cameras) && cameras.length > 1) {
    return getCameraName(activeCamera);
  }
  return "Camera";
}

export function resolveSingleViewSubtitleText(config) {
  return config?.subtitle || "Frigate";
}

export function resolveSingleViewStreamTypeText(streamType) {
  return streamType || "--";
}

export function resolveSingleViewEventsCountText(eventsCount) {
  return String(eventsCount);
}

export function resolveSingleViewStatusColor(online) {
  return online ? "#4ade80" : "#ef4444";
}

export function resolveSingleViewOnlineLabel(online) {
  return online ? "Online" : "Offline";
}

export function buildSingleViewMainLayoutShellMarkup({
  regions: suppliedRegions = null,
  layoutProfile = {},
} = {}) {
  const regions = normalizeRegions(suppliedRegions);
  const layoutClassName = mergeClassNames("layout", layoutProfile.layoutClass);
  const leftColumnClassName = mergeClassNames(
    "col-left",
    layoutProfile.leftColumnClass,
  );
  const rightColumnClassName = mergeClassNames(
    "col-right",
    layoutProfile.rightColumnClass,
  );
  const tabsHolderClassName = mergeClassNames(
    "tabs-holder",
    layoutProfile.tabsHolderClass,
  );
  const resizeHandleClassName = mergeClassNames(
    "resize-handle",
    layoutProfile.resizeHandleClass,
  );

  return `<div class="${layoutClassName}" id="layout">
          <div class="${leftColumnClassName}" id="col-left">
            ${regions.live}

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
