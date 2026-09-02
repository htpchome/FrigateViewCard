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
  `%c FRIGATE-VIEW-CARD %c v${VERSION} `,
  "color: white; background: #03a9f4; font-weight: 700;",
  "color: #03a9f4; background: white; font-weight: 700;",
);
