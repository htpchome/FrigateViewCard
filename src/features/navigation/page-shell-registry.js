import {
  buildMobileViewInfoRowMarkup,
  buildMobileViewMainLayoutShellMarkup,
} from "../mobile-view/page.tmpl.js";
import {
  buildInfoRowMarkup,
  buildMainLayoutShellMarkup,
} from "../../card/controls/shell-nav.tmpl.js";

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
    browseClass: String(profile.browseClass || "").trim(),
    resizeHandleClass: String(profile.resizeHandleClass || "").trim(),
    capabilities: {
      hasLive: capabilities.hasLive !== false,
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
    hasBrowse: caps.hasBrowse !== false,
    tabsVariant:
      caps.tabsVariant === "none" || caps.tabsVariant === "new-tabs"
        ? caps.tabsVariant
        : "standard",
  };
}

export function resolvePageInfoRowMarkup(
  profile,
  { title, subtitle, version, host, buildDefaultInfoRowMarkup } = {},
) {
  const fallback = () => {
    if (typeof buildDefaultInfoRowMarkup !== "function") return "";
    return buildDefaultInfoRowMarkup({ title, subtitle, version });
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
      version,
      host,
    }) || fallback()
  );
}

export function resolvePageMainLayoutShellMarkup(
  profile,
  {
    host,
    liveEngineWrap,
    infoRow,
    pageNav,
    camSwitcher,
    tabsMarkup,
    toolsMarkup,
    browseMarkup,
    footerMarkup,
    layoutProfile,
    buildDefaultMainLayoutShellMarkup,
  } = {},
) {
  const fallback = () => {
    if (typeof buildDefaultMainLayoutShellMarkup !== "function") return "";
    return buildDefaultMainLayoutShellMarkup({
      liveEngineWrap,
      infoRow,
      pageNav,
      camSwitcher,
      tabsMarkup,
      toolsMarkup,
      browseMarkup,
      footerMarkup,
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
      liveEngineWrap,
      infoRow,
      pageNav,
      camSwitcher,
      tabsMarkup,
      toolsMarkup,
      browseMarkup,
      footerMarkup,
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
    buildInfoRowMarkup: ({ title, subtitle, version, host }) =>
      buildInfoRowMarkup({
        title,
        subtitle,
        version,
        centerActionMarkup: host?._buildTwoWayTalkInfoButtonMarkup?.() || "",
      }),
    buildMainLayoutShellMarkup: ({
      liveEngineWrap,
      infoRow,
      pageNav,
      camSwitcher,
      tabsMarkup,
      toolsMarkup,
      browseMarkup,
      footerMarkup,
      layoutProfile,
    }) =>
      buildMainLayoutShellMarkup({
        liveEngineWrap,
        infoRow,
        pageNav,
        camSwitcher,
        tabsMarkup,
        toolsMarkup,
        browseMarkup,
        footerMarkup,
        layoutProfile,
      }),
    capabilities: {
      hasLive: true,
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
    browseClass: "browse--mobile-view",
    buildInfoRowMarkup: ({ title, subtitle, version, host }) =>
      buildMobileViewInfoRowMarkup({
        title,
        subtitle,
        version,
        streamType: host?._activeStreamType,
        eventsCount: host?._allDisplayEvents?.().length || 0,
        online:
          host?._hass?.states?.[host?._activeCam?.entity]?.state !==
          "unavailable",
      }),
    buildMainLayoutShellMarkup: ({
      liveEngineWrap,
      infoRow,
      pageNav,
      camSwitcher,
      tabsMarkup,
      toolsMarkup,
      browseMarkup,
      footerMarkup,
      layoutProfile,
    }) =>
      buildMobileViewMainLayoutShellMarkup({
        liveEngineWrap,
        infoRow,
        pageNav,
        camSwitcher,
        tabsMarkup,
        toolsMarkup,
        browseMarkup,
        footerMarkup,
        layoutProfile,
      }),
    capabilities: {
      hasLive: true,
      hasBrowse: true,
      tabsVariant: "standard",
    },
  });

  registry.register(PAGE_IDS.wideView, {
    layoutClass: "layout--wide-view",
    leftColumnClass: "col-left--wide-view",
    rightColumnClass: "col-right--wide-view",
    tabsHolderClass: "tabs-holder--wide-view",
    buildInfoRowMarkup: ({ title, subtitle, version, host }) =>
      buildInfoRowMarkup({
        title,
        subtitle,
        version,
        centerActionMarkup: host?._buildTwoWayTalkInfoButtonMarkup?.() || "",
      }),
    buildMainLayoutShellMarkup: ({
      liveEngineWrap,
      infoRow,
      pageNav,
      camSwitcher,
      tabsMarkup,
      toolsMarkup,
      browseMarkup,
      footerMarkup,
      layoutProfile,
    }) =>
      buildMainLayoutShellMarkup({
        liveEngineWrap,
        infoRow,
        pageNav,
        camSwitcher,
        tabsMarkup,
        toolsMarkup,
        browseMarkup,
        footerMarkup,
        layoutProfile,
      }),
    capabilities: {
      hasLive: true,
      hasBrowse: true,
      tabsVariant: "standard",
    },
  });

  registry.register(PAGE_IDS.preview, {
    layoutClass: "layout--preview-view",
    leftColumnClass: "col-left--preview-view",
    rightColumnClass: "col-right--preview-view",
    resizeHandleClass: "resize-handle--preview-view",
    capabilities: {
      hasLive: true,
      hasBrowse: true,
      tabsVariant: "standard",
    },
  });
}
