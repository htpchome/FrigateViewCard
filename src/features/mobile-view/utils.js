export const MOBILE_VIEW_ACTIVE_CLASS = "mobile-view-active";

export function isMobileViewRoute(pageId, pageIds) {
  return pageId === pageIds.mobileView;
}
