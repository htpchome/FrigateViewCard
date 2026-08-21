export const PAGE_IDS = Object.freeze({
  singleView: "single-view",
  mobileView: "mobile-view",
  preview: "preview",
  wideView: "wide-view",
});

export const MOBILE_PAGE_MODES = Object.freeze({
  mobile: PAGE_IDS.mobileView,
  previewMobile: "preview-mobile-view",
  previewSingle: "preview-single-view",
  single: PAGE_IDS.singleView,
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
]);

const PAGE_ROUTE_SET = new Set(PAGE_ROUTE_ORDER);
const MOBILE_PAGE_MODE_SET = new Set(Object.values(MOBILE_PAGE_MODES));

export const normalizePageRoute = (value) => {
  const route = String(value || "")
    .trim()
    .toLowerCase();
  if (route === "normal" || route === "single") return PAGE_IDS.singleView;
  if (route === "mobile" || route === "mobile_view") {
    return PAGE_IDS.mobileView;
  }
  if (route === "wide" || route === "wide_view") return PAGE_IDS.wideView;
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
  return MOBILE_PAGE_MODE_SET.has(mode) ? mode : MOBILE_PAGE_MODES.mobile;
};

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
  return false;
};

export const isPageSupportedOnDevice = (pageId, deviceBucket) => {
  if (pageId === PAGE_IDS.wideView) {
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

export const getMobilePageModes = () => [
  MOBILE_PAGE_MODES.mobile,
  MOBILE_PAGE_MODES.previewMobile,
  MOBILE_PAGE_MODES.previewSingle,
  MOBILE_PAGE_MODES.single,
];

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

export const resolveConfiguredLandingPage = (config, deviceBucket) => {
  if (deviceBucket === DEVICE_ROUTE_BUCKETS.mobile) {
    return resolveMobilePageEntryRoute(config?.mobile_page);
  }
  return normalizePageRoute(config?.landing_page);
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
