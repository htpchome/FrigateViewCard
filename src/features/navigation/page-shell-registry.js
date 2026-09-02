import {
  buildMobileViewInfoRowMarkup,
  buildMobileViewMainLayoutShellMarkup,
} from "../mobile-view/page.tmpl.js";
import { buildSingleViewMainLayoutShellMarkup } from "../single-view/page.tmpl.js";
import { buildWideViewMainLayoutShellMarkup } from "../wide-view/page.tmpl.js";
import { buildPreviewPageMainLayoutShellMarkup } from "../preview/page.tmpl.js";
import { buildCardViewMainLayoutShellMarkup } from "../card-view/page.tmpl.js";
import { buildInfoRowMarkup } from "../../card/controls/shell-nav.tmpl.js";

export const PAGE_SHELL_REGIONS = Object.freeze({
  live: "live",
  livePictureInPicture: "live-picture-in-picture",
  liveFullscreen: "live-fullscreen",
  liveTakeSnapshot: "live-take-snapshot",
  liveMute: "live-mute",
  information: "information",
  cameraSwitcher: "camera-switcher",
  tabs: "tabs",
  tools: "tools",
  pageNavigation: "page-navigation",
  browseHeader: "browse-header",
  browse: "browse",
  footer: "footer",
  twoWayTalk: "two-way-talk",
  linkedEntities: "linked-entities",
  filterPanel: "filter-panel",
  calendarPanel: "calendar-panel",
  cardViewActivity: "card-view-activity",
  timeline: "timeline",
});

function normalizeProfile(profile = {}) {
  if (!profile || typeof profile !== "object") return {};
  const infoRowBuilder =
    typeof profile.buildInfoRowMarkup === "function"
      ? profile.buildInfoRowMarkup
      : null;
  const mainLayoutShellBuilder =
    typeof profile.buildMainLayoutShellMarkup === "function"
      ? profile.buildMainLayoutShellMarkup
      : null;
  const capabilities =
    profile.capabilities && typeof profile.capabilities === "object"
      ? profile.capabilities
      : {};
  return {
    layoutClass: String(profile.layoutClass || "").trim(),
    leftColumnClass: String(profile.leftColumnClass || "").trim(),
    rightColumnClass: String(profile.rightColumnClass || "").trim(),
    tabsHolderClass: String(profile.tabsHolderClass || "").trim(),
    tabsButtonClass: String(profile.tabsButtonClass || "").trim(),
    toolsButtonClass: String(profile.toolsButtonClass || "").trim(),
    liveFullscreenButtonClass: String(
      profile.liveFullscreenButtonClass || "",
    ).trim(),
    livePictureInPictureButtonClass: String(
      profile.livePictureInPictureButtonClass || "",
    ).trim(),
    liveTakeSnapshotButtonClass: String(
      profile.liveTakeSnapshotButtonClass || "",
    ).trim(),
    liveMuteButtonClass: String(profile.liveMuteButtonClass || "").trim(),
    liveControlsPlacement:
      profile.liveControlsPlacement === "inline" ? "inline" : "overlay",
    browseClass: String(profile.browseClass || "").trim(),
    resizeHandleClass: String(profile.resizeHandleClass || "").trim(),
    capabilities: {
      hasLive: capabilities.hasLive !== false,
      hasLivePictureInPicture:
        capabilities.hasLivePictureInPicture === true,
      hasBrowse: capabilities.hasBrowse !== false,
      tabsVariant:
        capabilities.tabsVariant === "none" ||
        capabilities.tabsVariant === "new-tabs"
          ? capabilities.tabsVariant
          : "standard",
    },
    buildInfoRowMarkup: infoRowBuilder,
    buildMainLayoutShellMarkup: mainLayoutShellBuilder,
  };
}

export function resolvePageCapabilities(profile = {}) {
  const caps =
    profile && profile.capabilities && typeof profile.capabilities === "object"
      ? profile.capabilities
      : {};
  return {
    hasLive: caps.hasLive !== false,
    hasLivePictureInPicture:
      caps.hasLivePictureInPicture === true,
    hasBrowse: caps.hasBrowse !== false,
    tabsVariant:
      caps.tabsVariant === "none" || caps.tabsVariant === "new-tabs"
        ? caps.tabsVariant
        : "standard",
  };
}

export function resolveRequiredPageShellRegions(profile = {}) {
  const capabilities = resolvePageCapabilities(profile);
  const requiredRegions = [];
  if (capabilities.hasLive) {
    requiredRegions.push(
      PAGE_SHELL_REGIONS.live,
      PAGE_SHELL_REGIONS.liveFullscreen,
      PAGE_SHELL_REGIONS.liveTakeSnapshot,
      PAGE_SHELL_REGIONS.liveMute,
    );
    if (capabilities.hasLivePictureInPicture) {
      requiredRegions.push(PAGE_SHELL_REGIONS.livePictureInPicture);
    }
  }
  if (capabilities.hasBrowse) {
    requiredRegions.push(
      PAGE_SHELL_REGIONS.browseHeader,
      PAGE_SHELL_REGIONS.browse,
    );
  }
  if (capabilities.tabsVariant !== "none") {
    requiredRegions.push(PAGE_SHELL_REGIONS.tabs, PAGE_SHELL_REGIONS.tools);
  }
  return requiredRegions;
}

export function validatePageShellRegionMarkup(
  markup,
  { requiredRegions = [] } = {},
) {
  const counts = {};
  const regionPattern = /\bdata-fvc-region\s*=\s*(?:"([^"]+)"|'([^']+)')/g;
  for (const match of String(markup || "").matchAll(regionPattern)) {
    const regionName = String(match[1] || match[2] || "").trim();
    if (!regionName) continue;
    counts[regionName] = (counts[regionName] || 0) + 1;
  }

  const required = [
    ...new Set(
      (Array.isArray(requiredRegions) ? requiredRegions : [])
        .map((regionName) => String(regionName || "").trim())
        .filter(Boolean),
    ),
  ];
  const missing = required.filter((regionName) => !counts[regionName]);
  const duplicates = Object.entries(counts)
    .filter(([, count]) => count > 1)
    .map(([regionName]) => regionName);

  return {
    valid: missing.length === 0 && duplicates.length === 0,
    counts,
    missing,
    duplicates,
  };
}

export function resolvePageInfoRowMarkup(
  profile,
  {
    title,
    subtitle,
    displayTitle = true,
    displaySubtitle = true,
    version,
    host,
    buildDefaultInfoRowMarkup,
  } = {},
) {
  const fallback = () => {
    if (typeof buildDefaultInfoRowMarkup !== "function") return "";
    return buildDefaultInfoRowMarkup({
      title,
      subtitle,
      displayTitle,
      displaySubtitle,
      version,
    });
  };

  const builder =
    profile && typeof profile.buildInfoRowMarkup === "function"
      ? profile.buildInfoRowMarkup
      : null;
  if (!builder) return fallback();

  return (
    builder({
      title,
      subtitle,
      displayTitle,
      displaySubtitle,
      version,
      host,
    }) || fallback()
  );
}

export function resolvePageMainLayoutShellMarkup(
  profile,
  {
    host,
    regions,
    layoutProfile,
    buildDefaultMainLayoutShellMarkup,
  } = {},
) {
  const fallback = () => {
    if (typeof buildDefaultMainLayoutShellMarkup !== "function") return "";
    return buildDefaultMainLayoutShellMarkup({
      regions,
      layoutProfile,
    });
  };

  const builder =
    profile && typeof profile.buildMainLayoutShellMarkup === "function"
      ? profile.buildMainLayoutShellMarkup
      : null;
  if (!builder) return fallback();

  return (
    builder({
      host,
      regions,
      layoutProfile,
    }) || fallback()
  );
}

export function createPageShellRegistry({ defaultPageId = "" } = {}) {
  const profiles = new Map();

  const register = (pageId, profile = {}) => {
    const key = String(pageId || "").trim();
    if (!key) return;
    profiles.set(key, normalizeProfile(profile));
  };

  const resolve = (pageId) => {
    const key = String(pageId || "").trim();
    if (key && profiles.has(key)) return profiles.get(key);
    if (defaultPageId && profiles.has(defaultPageId)) {
      return profiles.get(defaultPageId);
    }
    return {};
  };

  return {
    register,
    resolve,
  };
}

export function registerDefaultPageShellProfiles(registry, PAGE_IDS) {
  if (!registry || !PAGE_IDS) return;

  registry.register(PAGE_IDS.singleView, {
    layoutClass: "layout--single-view",
    leftColumnClass: "col-left--single-view",
    rightColumnClass: "col-right--single-view",
    buildInfoRowMarkup: ({
      title,
      subtitle,
      displayTitle,
      displaySubtitle,
      version,
      host,
    }) =>
      buildInfoRowMarkup({
        title,
        subtitle,
        displayTitle,
        displaySubtitle,
        version,
        centerActionMarkup: host?._buildTwoWayTalkInfoButtonMarkup?.() || "",
        linkedEntitiesLeftMarkup:
          host?._buildLinkedLightControlMarkup?.({
            buttonClass: "round-btn",
            position: "left",
          }) || "",
        linkedEntitiesRightMarkup:
          host?._buildLinkedLightControlMarkup?.({
            buttonClass: "round-btn",
            position: "right",
          }) || "",
      }),
    buildMainLayoutShellMarkup: ({ regions, layoutProfile }) =>
      buildSingleViewMainLayoutShellMarkup({
        regions,
        layoutProfile,
      }),
    capabilities: {
      hasLive: true,
      hasLivePictureInPicture: true,
      hasBrowse: true,
      tabsVariant: "standard",
    },
  });

  registry.register(PAGE_IDS.mobileView, {
    layoutClass: "layout--mobile-view",
    leftColumnClass: "col-left--mobile-view",
    rightColumnClass: "col-right--mobile-view",
    tabsHolderClass: "tabs-holder--mobile-view",
    tabsButtonClass: "icon-btn",
    toolsButtonClass: "icon-btn",
    liveControlsPlacement: "overlay",
    browseClass: "browse--mobile-view",
    buildInfoRowMarkup: ({
      title,
      subtitle,
      displayTitle,
      displaySubtitle,
      version,
      host,
    }) =>
      buildMobileViewInfoRowMarkup({
        title,
        subtitle,
        displayTitle,
        displaySubtitle,
        version,
        streamType: host?._activeStreamType,
        alertsCount:
          host?._browseWindowLoaderController?.cameraAlertsCount?.(
            host?._activeCam?.entity || "",
          ) || 0,
        online:
          host?._hass?.states?.[host?._activeCam?.entity]?.state !==
          "unavailable",
      }),
    buildMainLayoutShellMarkup: ({ host, regions, layoutProfile }) =>
      buildMobileViewMainLayoutShellMarkup({
        regions: {
          ...(regions || {}),
          twoWayTalk: host?._buildTwoWayTalkMobileButtonMarkup?.() || "",
          mobileMicrophoneMute:
            host?._buildMobileViewMicrophoneMuteButtonMarkup?.() || "",
          mobileInlineMute:
            host?._buildMobileViewInlineMuteButtonMarkup?.() || "",
          linkedEntitiesLeft:
            host?._buildLinkedLightControlMarkup?.({
              buttonClass: "icon-btn",
              position: "left",
            }) || "",
          linkedEntitiesRight:
            host?._buildLinkedLightControlMarkup?.({
              buttonClass: "icon-btn",
              position: "right",
            }) || "",
        },
        layoutProfile,
        backButton: regions?.mobileBackButton || "",
        cameraSwitcherMarkup: regions?.cameraSwitcherMarkup || "",
      }),
    capabilities: {
      hasLive: true,
      hasLivePictureInPicture: true,
      hasBrowse: true,
      tabsVariant: "standard",
    },
  });

  registry.register(PAGE_IDS.wideView, {
    layoutClass: "layout--wide-view",
    leftColumnClass: "col-left--wide-view",
    rightColumnClass: "col-right--wide-view",
    tabsHolderClass: "tabs-holder--wide-view",
    buildInfoRowMarkup: ({
      title,
      subtitle,
      displayTitle,
      displaySubtitle,
      version,
      host,
    }) =>
      buildInfoRowMarkup({
        title,
        subtitle,
        displayTitle,
        displaySubtitle,
        version,
        centerActionMarkup: host?._buildTwoWayTalkInfoButtonMarkup?.() || "",
        linkedEntitiesLeftMarkup:
          host?._buildLinkedLightControlMarkup?.({
            buttonClass: "round-btn",
            position: "left",
          }) || "",
        linkedEntitiesRightMarkup:
          host?._buildLinkedLightControlMarkup?.({
            buttonClass: "round-btn",
            position: "right",
          }) || "",
      }),
    buildMainLayoutShellMarkup: ({ regions, layoutProfile }) =>
      buildWideViewMainLayoutShellMarkup({
        regions,
        layoutProfile,
      }),
    capabilities: {
      hasLive: true,
      hasLivePictureInPicture: true,
      hasBrowse: true,
      tabsVariant: "standard",
    },
  });

  registry.register(PAGE_IDS.preview, {
    layoutClass: "layout--preview-view",
    leftColumnClass: "col-left--preview-view",
    rightColumnClass: "col-right--preview-view",
    resizeHandleClass: "resize-handle--preview-view",
    buildMainLayoutShellMarkup: ({ regions, layoutProfile }) =>
      buildPreviewPageMainLayoutShellMarkup({
        regions,
        layoutProfile,
      }),
    capabilities: {
      hasLive: true,
      hasBrowse: true,
      tabsVariant: "standard",
    },
  });

  registry.register(PAGE_IDS.cardView, {
    layoutClass: "layout--card-view",
    liveControlsPlacement: "overlay",
    buildMainLayoutShellMarkup: ({ regions, layoutProfile }) =>
      buildCardViewMainLayoutShellMarkup({ regions, layoutProfile }),
    capabilities: {
      hasLive: true,
      hasLivePictureInPicture: true,
      hasBrowse: false,
      tabsVariant: "none",
    },
  });
}
