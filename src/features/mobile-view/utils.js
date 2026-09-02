export const MOBILE_VIEW_ACTIVE_CLASS = "mobile-view-active";
export const MOBILE_VIEW_ROTATE_COVER_CLASS = "mobile-view-rotate-cover";

export function isMobileViewRoute(pageId, pageIds) {
  return pageId === pageIds.mobileView;
}
