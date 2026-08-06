import { buildMobileViewInfoRowMarkup } from "../mobile-view/page.tmpl.js";

function normalizeProfile(profile = {}) {
  if (!profile || typeof profile !== "object") return {};
  const infoRowBuilder =
    typeof profile.buildInfoRowMarkup === "function"
      ? profile.buildInfoRowMarkup
      : null;
  return {
    layoutClass: String(profile.layoutClass || "").trim(),
    leftColumnClass: String(profile.leftColumnClass || "").trim(),
    rightColumnClass: String(profile.rightColumnClass || "").trim(),
    tabsHolderClass: String(profile.tabsHolderClass || "").trim(),
    browseClass: String(profile.browseClass || "").trim(),
    resizeHandleClass: String(profile.resizeHandleClass || "").trim(),
    buildInfoRowMarkup: infoRowBuilder,
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
  });

  registry.register(PAGE_IDS.mobileView, {
    layoutClass: "layout--mobile-view",
    leftColumnClass: "col-left--mobile-view",
    rightColumnClass: "col-right--mobile-view",
    tabsHolderClass: "tabs-holder--mobile-view",
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
  });

  registry.register(PAGE_IDS.wideView, {
    layoutClass: "layout--wide-view",
    leftColumnClass: "col-left--wide-view",
    rightColumnClass: "col-right--wide-view",
    tabsHolderClass: "tabs-holder--wide-view",
  });

  registry.register(PAGE_IDS.preview, {
    layoutClass: "layout--preview-view",
    leftColumnClass: "col-left--preview-view",
    rightColumnClass: "col-right--preview-view",
    resizeHandleClass: "resize-handle--preview-view",
  });
}
