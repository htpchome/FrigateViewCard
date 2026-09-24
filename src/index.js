import { CARD_DISPLAY_NAME, CARD_TAG, VERSION } from "./constants.js";
import { FrigateViewCard } from "./card/FrigateViewCard.js";
import { registerLiveStreamHostElement } from "./features/live/stream.element.js";
import { DEVICE_PROFILE } from "./helpers.js";
import { installHomeAssistantDashboardNavbarCustomization } from "./integrations/home-assistant/navbar.ctrl.js";
import { installHomeAssistantDashboardSwipeNavigation } from "./integrations/home-assistant/dashboard-swipe-navigation.ctrl.js";
import { installDeepLinkHashRouteBridge } from "./features/navigation/deep-link.ctrl.js";

// index.js — registers custom elements and announces card to HA
installDeepLinkHashRouteBridge();
if (!customElements.get(CARD_TAG))
  customElements.define(CARD_TAG, FrigateViewCard);
registerLiveStreamHostElement();
installHomeAssistantDashboardNavbarCustomization({
  cardTag: CARD_TAG,
  isMobile: DEVICE_PROFILE.isMobile,
  isPhone: DEVICE_PROFILE.isPhone,
  isIOS: DEVICE_PROFILE.isIOS,
});
installHomeAssistantDashboardSwipeNavigation({ cardTag: CARD_TAG });
window.customCards = window.customCards || [];

if (!window.customCards.find((c) => c.type === CARD_TAG))
  window.customCards.push({
    type: CARD_TAG,
    name: CARD_DISPLAY_NAME,
    description: `Simple Frigate Camera and Events Card — v${VERSION}`,
    preview: true,
  });

console.info(
  `%c ${CARD_DISPLAY_NAME.toUpperCase()} %c v${VERSION} %c`,
  "color: #f7f7f7; background: #171717; font-weight: 700; padding: 3px 7px; border-radius: 3px 0 0 3px;",
  "color: #ffffff; background: #e64a19; font-weight: 700; padding: 3px 7px; border-radius: 0 3px 3px 0;",
  "color: inherit; background: transparent; font-weight: normal; padding: 0;",
);
