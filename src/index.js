import { CARD_TAG, VERSION } from "./constants.js";
import { FrigateViewCard } from "./card/FrigateViewCard.js";
import { registerLiveStreamHostElement } from "./features/live/stream.element.js";
import { installHomeAssistantDashboardSwipeNavigation } from "./integrations/home-assistant/dashboard-swipe-navigation.ctrl.js";

// index.js — registers custom elements and announces card to HA
if (!customElements.get(CARD_TAG))
  customElements.define(CARD_TAG, FrigateViewCard);
registerLiveStreamHostElement();
installHomeAssistantDashboardSwipeNavigation({ cardTag: CARD_TAG });
window.customCards = window.customCards || [];

if (!window.customCards.find((c) => c.type === CARD_TAG))
  window.customCards.push({
    type: CARD_TAG,
    name: "FrigateView Card",
    description: `Simple Frigate Camera and Events Card — v${VERSION}`,
    preview: true,
  });

console.info(
  `%c FRIGATE-VIEW-CARD %c v${VERSION} %c`,
  "color: #f7f7f7; background: #171717; font-weight: 700; padding: 3px 7px; border-radius: 3px 0 0 3px;",
  "color: #ffffff; background: #e64a19; font-weight: 700; padding: 3px 7px; border-radius: 0 3px 3px 0;",
  "color: inherit; background: transparent; font-weight: normal; padding: 0;",
);
