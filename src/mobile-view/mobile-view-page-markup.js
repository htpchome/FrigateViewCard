import {
  MOBILE_VIEW_ACTIVE_CLASS,
  isMobileViewRoute,
} from "./mobile-view-utils.js";

export function applyMobileViewPageMarkup({ host, pageIds }) {
  const card = host?._$("#card");
  if (!card) return;

  card.classList.toggle(
    MOBILE_VIEW_ACTIVE_CLASS,
    isMobileViewRoute(host._pageId, pageIds),
  );
}
