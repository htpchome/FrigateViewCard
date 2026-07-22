export const PAGE_IDS = Object.freeze({
  singleView: "single-view",
  preview: "preview",
  wideView: "wide-view",
  sideBySide: "side-by-side",
});

export const DEVICE_ROUTE_BUCKETS = Object.freeze({
  mobile: "mobile",
  tablet: "tablet",
  desktop: "desktop",
});

const PAGE_ROUTE_ORDER = Object.freeze([
  PAGE_IDS.singleView,
  PAGE_IDS.preview,
  PAGE_IDS.wideView,
  PAGE_IDS.sideBySide,
]);

const PAGE_ROUTE_SET = new Set(PAGE_ROUTE_ORDER);

export const normalizePageRoute = (value) => {
  const route = String(value || "")
    .trim()
    .toLowerCase();
  if (route === "normal" || route === "single") return PAGE_IDS.singleView;
  if (route === "wide" || route === "wide_view") return PAGE_IDS.wideView;
  if (route === "side" || route === "side_by_side") return PAGE_IDS.sideBySide;
  if (route === "preview") return PAGE_IDS.preview;
  return PAGE_ROUTE_SET.has(route) ? route : PAGE_IDS.singleView;
};

export const resolveDeviceRouteBucket = (deviceProfile = {}) => {
  if (deviceProfile?.isPhone) return DEVICE_ROUTE_BUCKETS.mobile;
  if (deviceProfile?.isTablet) return DEVICE_ROUTE_BUCKETS.tablet;
  return DEVICE_ROUTE_BUCKETS.desktop;
};

export const isPageEnabled = (config, pageId) => {
  if (pageId === PAGE_IDS.singleView) return true;
  if (pageId === PAGE_IDS.preview) return config?.preview_page_enabled === true;
  if (pageId === PAGE_IDS.wideView) {
    return config?.wide_view_page_enabled === true;
  }
  if (pageId === PAGE_IDS.sideBySide) {
    return config?.side_by_side_page_enabled === true;
  }
  return false;
};

export const isPageSupportedOnDevice = (pageId, deviceBucket) => {
  if (pageId === PAGE_IDS.wideView || pageId === PAGE_IDS.sideBySide) {
    return deviceBucket !== DEVICE_ROUTE_BUCKETS.mobile;
  }
  return true;
};

export const getEnabledPageRoutes = (config, deviceBucket) =>
  PAGE_ROUTE_ORDER.filter(
    (pageId) =>
      isPageEnabled(config, pageId) &&
      isPageSupportedOnDevice(pageId, deviceBucket),
  );

export const resolveConfiguredLandingPage = (config, deviceBucket) => {
  const key =
    deviceBucket === DEVICE_ROUTE_BUCKETS.mobile
      ? "mobile_page"
      : "landing_page";
  return normalizePageRoute(config?.[key]);
};

export const resolveStartupPageRoute = ({
  config,
  deviceBucket,
  hasPendingDeepLinkTarget = false,
}) => {
  if (hasPendingDeepLinkTarget) return PAGE_IDS.singleView;
  const available = getEnabledPageRoutes(config, deviceBucket);
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
      : PAGE_IDS.singleView;
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
