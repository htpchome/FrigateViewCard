export const PAGE_IDS = Object.freeze({
  singleView: "single-view",
  mobileView: "mobile-view",
  preview: "preview",
  wideView: "wide-view",
  cardView: "card-view",
});

export const MOBILE_PAGE_MODES = Object.freeze({
  mobile: PAGE_IDS.mobileView,
  previewMobile: "preview-mobile-view",
  previewSingle: "preview-single-view",
  single: PAGE_IDS.singleView,
});

export const DASHBOARD_SWIPE_NAVIGATION_MODES = Object.freeze({
  dashboardWide: "dashboard-wide",
  insideCard: "inside-card",
  landingDashboard: "landing-dashboard",
  none: "none",
});

export const DEVICE_ROUTE_BUCKETS = Object.freeze({
  mobile: "mobile",
  tablet: "tablet",
  desktop: "desktop",
});

const PAGE_ROUTE_ORDER = Object.freeze([
  PAGE_IDS.singleView,
  PAGE_IDS.mobileView,
  PAGE_IDS.preview,
  PAGE_IDS.wideView,
  PAGE_IDS.cardView,
]);

export const DASHBOARD_SWIPE_PAGE_OPTIONS = Object.freeze([
  PAGE_IDS.preview,
  PAGE_IDS.singleView,
  PAGE_IDS.mobileView,
  PAGE_IDS.wideView,
  PAGE_IDS.cardView,
]);

const PAGE_ROUTE_SET = new Set(PAGE_ROUTE_ORDER);
const MOBILE_PAGE_MODE_SET = new Set(Object.values(MOBILE_PAGE_MODES));
const DASHBOARD_SWIPE_NAVIGATION_MODE_SET = new Set(
  Object.values(DASHBOARD_SWIPE_NAVIGATION_MODES),
);

export const normalizePageRoute = (value) => {
  const route = String(value || "")
    .trim()
    .toLowerCase();
  if (route === "normal" || route === "single") return PAGE_IDS.singleView;
  if (route === "mobile" || route === "mobile_view") {
    return PAGE_IDS.mobileView;
  }
  if (route === "wide" || route === "wide_view") return PAGE_IDS.wideView;
  if (route === "card" || route === "card_view") return PAGE_IDS.cardView;
  if (route === "preview") return PAGE_IDS.preview;
  return PAGE_ROUTE_SET.has(route) ? route : PAGE_IDS.singleView;
};

export const normalizeMobilePageMode = (value) => {
  const mode = String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[_+\s]+/g, "-");
  if (mode === "preview") return MOBILE_PAGE_MODES.previewSingle;
  if (mode === "preview-mobile") return MOBILE_PAGE_MODES.previewMobile;
  if (mode === "preview-single") return MOBILE_PAGE_MODES.previewSingle;
  if (mode === "mobile" || mode === "mobile-view") {
    return MOBILE_PAGE_MODES.mobile;
  }
  if (mode === "single" || mode === "single-view") {
    return MOBILE_PAGE_MODES.single;
  }
  return MOBILE_PAGE_MODE_SET.has(mode) ? mode : MOBILE_PAGE_MODES.single;
};

export const normalizeDashboardSwipeNavigationMode = (value) => {
  const mode = String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[_+\s]+/g, "-");
  if (mode === "preview-dashboard") {
    return DASHBOARD_SWIPE_NAVIGATION_MODES.landingDashboard;
  }
  return DASHBOARD_SWIPE_NAVIGATION_MODE_SET.has(mode)
    ? mode
    : DASHBOARD_SWIPE_NAVIGATION_MODES.dashboardWide;
};

export const allowsDashboardPageSwipeNavigation = (config) =>
  [
    DASHBOARD_SWIPE_NAVIGATION_MODES.dashboardWide,
    DASHBOARD_SWIPE_NAVIGATION_MODES.landingDashboard,
  ].includes(
    normalizeDashboardSwipeNavigationMode(
      config?.ha_dashboard_swipe_navigation,
    ),
  );

export const isDashboardSwipeNavigationEnabled = (config) =>
  normalizeDashboardSwipeNavigationMode(
    config?.ha_dashboard_swipe_navigation,
  ) !== DASHBOARD_SWIPE_NAVIGATION_MODES.none;

export const resolveDeviceRouteBucket = (deviceProfile = {}) => {
  if (deviceProfile?.isPhone) return DEVICE_ROUTE_BUCKETS.mobile;
  if (deviceProfile?.isTablet) return DEVICE_ROUTE_BUCKETS.tablet;
  return DEVICE_ROUTE_BUCKETS.desktop;
};

export const isPageEnabled = (config, pageId) => {
  if (pageId === PAGE_IDS.singleView) return true;
  if (pageId === PAGE_IDS.mobileView) {
    return config?.mobile_view_page_enabled === true;
  }
  if (pageId === PAGE_IDS.preview) return config?.preview_page_enabled === true;
  if (pageId === PAGE_IDS.wideView) {
    return config?.wide_view_page_enabled === true;
  }
  if (pageId === PAGE_IDS.cardView) {
    return config?.card_view_page_enabled === true;
  }
  return false;
};

export const isPageSupportedOnDevice = (pageId, deviceBucket) => {
  if (pageId === PAGE_IDS.wideView || pageId === PAGE_IDS.cardView) {
    return deviceBucket !== DEVICE_ROUTE_BUCKETS.mobile;
  }
  return true;
};

export const getEnabledPageRoutes = (config, deviceBucket) => {
  if (
    deviceBucket !== DEVICE_ROUTE_BUCKETS.mobile &&
    config?.card_view_page_enabled === true &&
    config?.card_view_standalone === true
  ) {
    return [PAGE_IDS.cardView];
  }

  return PAGE_ROUTE_ORDER.filter(
    (pageId) =>
      isPageEnabled(config, pageId) &&
      isPageSupportedOnDevice(pageId, deviceBucket),
  );
};

export const getMobilePageModes = () => [
  MOBILE_PAGE_MODES.mobile,
  MOBILE_PAGE_MODES.previewMobile,
  MOBILE_PAGE_MODES.previewSingle,
  MOBILE_PAGE_MODES.single,
];

export const getEnabledMobilePageModes = (config) =>
  getMobilePageModes().filter((mode) => {
    if (mode === MOBILE_PAGE_MODES.mobile) {
      return isPageEnabled(config, PAGE_IDS.mobileView);
    }
    if (mode === MOBILE_PAGE_MODES.previewMobile) {
      return (
        isPageEnabled(config, PAGE_IDS.preview) &&
        isPageEnabled(config, PAGE_IDS.mobileView)
      );
    }
    if (mode === MOBILE_PAGE_MODES.previewSingle) {
      return isPageEnabled(config, PAGE_IDS.preview);
    }
    return mode === MOBILE_PAGE_MODES.single;
  });

export const resolveEnabledMobilePageMode = (config, value) => {
  const mode = normalizeMobilePageMode(value);
  return getEnabledMobilePageModes(config).includes(mode)
    ? mode
    : MOBILE_PAGE_MODES.single;
};

export const resolveMobilePageEntryRoute = (value) => {
  const mode = normalizeMobilePageMode(value);
  if (
    mode === MOBILE_PAGE_MODES.previewMobile ||
    mode === MOBILE_PAGE_MODES.previewSingle
  ) {
    return PAGE_IDS.preview;
  }
  return mode;
};

export const resolveMobilePreviewDestination = (value) => {
  const mode = normalizeMobilePageMode(value);
  if (mode === MOBILE_PAGE_MODES.previewMobile) return PAGE_IDS.mobileView;
  if (mode === MOBILE_PAGE_MODES.previewSingle) return PAGE_IDS.singleView;
  return "";
};

export const resolveDeepLinkPageRoute = (config, deviceBucket) => {
  if (deviceBucket !== DEVICE_ROUTE_BUCKETS.mobile) return PAGE_IDS.singleView;
  const mode = normalizeMobilePageMode(config?.mobile_page);
  if (
    mode === MOBILE_PAGE_MODES.mobile ||
    mode === MOBILE_PAGE_MODES.previewMobile
  ) {
    return PAGE_IDS.mobileView;
  }
  return PAGE_IDS.singleView;
};

export const resolveConfiguredLandingPage = (config, deviceBucket) => {
  if (deviceBucket === DEVICE_ROUTE_BUCKETS.mobile) {
    return resolveMobilePageEntryRoute(config?.mobile_page);
  }
  return normalizePageRoute(config?.landing_page);
};

const resolveAvailableLandingPage = (config, deviceBucket, available) => {
  const configured = resolveConfiguredLandingPage(config, deviceBucket);
  return available.includes(configured)
    ? configured
    : available[0] || PAGE_IDS.singleView;
};

export const resolveDefaultDashboardSwipePages = (
  config,
  deviceBucket = DEVICE_ROUTE_BUCKETS.desktop,
) => {
  const available = getEnabledPageRoutes(config, deviceBucket);
  const landingPage = resolveAvailableLandingPage(
    config,
    deviceBucket,
    available,
  );
  const defaults = new Set([landingPage]);
  if (available.includes(PAGE_IDS.preview)) defaults.add(PAGE_IDS.preview);
  return DASHBOARD_SWIPE_PAGE_OPTIONS.filter((pageId) =>
    defaults.has(pageId),
  );
};

export const resolveDashboardSwipePageSelection = (
  config,
  deviceBucket = DEVICE_ROUTE_BUCKETS.desktop,
) => {
  const available = getEnabledPageRoutes(config, deviceBucket);
  const landingPage = resolveAvailableLandingPage(
    config,
    deviceBucket,
    available,
  );
  const configured = Array.isArray(config?.ha_dashboard_swipe_pages)
    ? config.ha_dashboard_swipe_pages
    : resolveDefaultDashboardSwipePages(config, deviceBucket);
  const selected = new Set(
    configured
      .map((pageId) => String(pageId || "").trim().toLowerCase())
      .filter((pageId) => available.includes(pageId)),
  );
  selected.add(landingPage);
  return DASHBOARD_SWIPE_PAGE_OPTIONS.filter((pageId) =>
    selected.has(pageId),
  );
};

export const resolvePageSwipeOrder = (config, deviceBucket) => {
  const swipeMode = normalizeDashboardSwipeNavigationMode(
    config?.ha_dashboard_swipe_navigation,
  );
  if (swipeMode === DASHBOARD_SWIPE_NAVIGATION_MODES.none) return [];
  const available = getEnabledPageRoutes(config, deviceBucket);
  if (available.length <= 1) return available;

  const ordered = [];
  const append = (pageId) => {
    const normalized = normalizePageRoute(pageId);
    if (available.includes(normalized) && !ordered.includes(normalized)) {
      ordered.push(normalized);
    }
  };
  if (swipeMode === DASHBOARD_SWIPE_NAVIGATION_MODES.landingDashboard) {
    append(resolveAvailableLandingPage(config, deviceBucket, available));
    return ordered;
  }
  if (deviceBucket === DEVICE_ROUTE_BUCKETS.mobile) {
    const mobileMode = normalizeMobilePageMode(config?.mobile_page);
    const pairedPage =
      mobileMode === MOBILE_PAGE_MODES.mobile ||
      mobileMode === MOBILE_PAGE_MODES.previewMobile
        ? PAGE_IDS.mobileView
        : PAGE_IDS.singleView;
    append(PAGE_IDS.preview);
    append(pairedPage);
    return ordered;
  }
  const selectedPages = resolveDashboardSwipePageSelection(
    config,
    deviceBucket,
  );
  const landingPage = resolveAvailableLandingPage(
    config,
    deviceBucket,
    available,
  );
  if (selectedPages.includes(PAGE_IDS.preview)) append(PAGE_IDS.preview);
  append(landingPage);
  PAGE_ROUTE_ORDER.forEach((pageId) => {
    if (selectedPages.includes(pageId)) append(pageId);
  });
  return ordered;
};

export const resolveAdjacentPageSwipeRoute = ({
  config,
  deviceBucket,
  currentPageId,
  direction,
} = {}) => {
  const normalizedCurrentPageId = normalizePageRoute(currentPageId);
  const swipeMode = normalizeDashboardSwipeNavigationMode(
    config?.ha_dashboard_swipe_navigation,
  );
  if (swipeMode === DASHBOARD_SWIPE_NAVIGATION_MODES.none) return null;
  if (
    swipeMode === DASHBOARD_SWIPE_NAVIGATION_MODES.landingDashboard
  ) {
    const available = getEnabledPageRoutes(config, deviceBucket);
    const landingPage = resolveAvailableLandingPage(
      config,
      deviceBucket,
      available,
    );
    if (
      direction === "previous" &&
      normalizedCurrentPageId !== landingPage &&
      available.includes(landingPage)
    ) {
      return landingPage;
    }
    return null;
  }
  const ordered = resolvePageSwipeOrder(config, deviceBucket);
  const currentIndex = ordered.indexOf(normalizedCurrentPageId);
  const step = direction === "previous" ? -1 : direction === "next" ? 1 : 0;
  if (currentIndex < 0 || !step) return null;
  return ordered[currentIndex + step] || null;
};

export const resolveStartupPageRoute = ({
  config,
  deviceBucket,
  hasPendingDeepLinkTarget = false,
}) => {
  const available = getEnabledPageRoutes(config, deviceBucket);
  if (hasPendingDeepLinkTarget) {
    const deepLinkPage = resolveDeepLinkPageRoute(config, deviceBucket);
    return available.includes(deepLinkPage)
      ? deepLinkPage
      : available[0] || PAGE_IDS.singleView;
  }
  const preferred = resolveConfiguredLandingPage(config, deviceBucket);
  if (available.includes(preferred)) return preferred;
  return available[0] || PAGE_IDS.singleView;
};

export const createNavigationFactory = ({
  pages,
  getDeviceBucket,
  getConfig,
  onBeforeNavigate = null,
  onAfterNavigate = null,
}) => {
  const resolveAvailablePages = () =>
    getEnabledPageRoutes(getConfig(), getDeviceBucket());

  const navigateTo = (pageId, context = {}) => {
    const nextPageId = normalizePageRoute(pageId);
    const available = resolveAvailablePages();
    const resolvedPageId = available.includes(nextPageId)
      ? nextPageId
      : available[0] || PAGE_IDS.singleView;
    const page = pages[resolvedPageId] || pages[PAGE_IDS.singleView];
    if (!page) return PAGE_IDS.singleView;
    if (typeof onBeforeNavigate === "function") {
      onBeforeNavigate(resolvedPageId, context);
    }
    page.activate(context);
    if (typeof onAfterNavigate === "function") {
      onAfterNavigate(resolvedPageId, context);
    }
    return resolvedPageId;
  };

  return {
    getAvailablePages: resolveAvailablePages,
    getDeviceBucket: () => getDeviceBucket(),
    resolveStartupPage: ({ hasPendingDeepLinkTarget = false } = {}) =>
      resolveStartupPageRoute({
        config: getConfig(),
        deviceBucket: getDeviceBucket(),
        hasPendingDeepLinkTarget,
      }),
    navigateTo,
  };
};
