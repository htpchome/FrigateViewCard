import { buildLivePlaybackControlsMarkup } from "../live/view.tmpl.js";
import { CARD_NAME } from "../../constants.js";
import { escapeHtml, escapeHtmlAttribute } from "../../shared/html.js";

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
    livePictureInPicture: "",
    liveFullscreen: "",
    liveTakeSnapshot: "",
    liveMute: "",
    information: "",
    cameraSwitcher: "",
    pageNavigation: "",
    pageToolsDivider: "",
    tabs: "",
    tools: "",
    browseHeader: "",
    browse: "",
    footer: "",
    wideFooterFvcBrandLogo: "",
    footerVersion: "",
    companionCameras: "",
    timeline: "",
    ...suppliedRegions,
  };
}

export function buildWideViewMainLayoutShellMarkup({
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
  const normalizedFooterVersion = String(regions.footerVersion || "").trim();
  const footerVersion = `<div class="footer-version" ${normalizedFooterVersion ? `aria-label="${CARD_NAME} version ${escapeHtmlAttribute(normalizedFooterVersion)}"` : "hidden"}>${normalizedFooterVersion ? `v${escapeHtml(normalizedFooterVersion)}` : ""}</div>`;

  return `<div class="${layoutClassName}" id="layout">
          <div class="wide-view-columns">
            <div class="${leftColumnClassName}" id="col-left">
              <div class="live-stage live-stage--overlay" id="live-stage">
                ${regions.live}
                ${buildLivePlaybackControlsMarkup(regions)}
              </div>

              ${regions.information}
              ${regions.cameraSwitcher}
              <div class="${tabsHolderClassName} shadow-small">
                <div class="button-holder button-holder--responsive-toolbar button-holder--no-tabs">
                  <div class="button-holder-row page-nav-row">
                    ${regions.pageNavigation}
                  </div>
                  <div class="button-holder-row tools-row">
                    <div class="divider page-tools-divider" aria-hidden="true">${regions.pageToolsDivider}</div>
                    ${regions.tools}
                  </div>
                </div>
              </div>

              ${regions.companionCameras}

            </div>
            <div class="${resizeHandleClassName}" id="resize-handle" title="Resize Video" aria-label="Resize Video" data-fvc-i18n-title="runtime.wideView.resizeVideo" data-fvc-i18n-aria-label="runtime.wideView.resizeVideo"></div>
            <div class="${rightColumnClassName}" id="col-right">
              ${regions.timeline}
              <div class="${tabsHolderClassName} shadow-small">
                <div class="small-padding">
                  ${regions.tabs}
                </div>
              </div>
              ${regions.browseHeader}
              ${regions.browse}
            </div>
          </div>
          <div class="wide-footer" data-fvc-region="footer">
            <div class="fvc-brand-logo">${regions.wideFooterFvcBrandLogo}</div>
            ${footerVersion}
          </div>
        </div>`;
}
