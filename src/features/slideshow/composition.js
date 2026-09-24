import {
  DAY,
  SLIDESHOW_ALERT_HOLD_MS,
  SLIDESHOW_REVIEW_FRESHNESS_GRACE_SEC,
  SLIDESHOW_REVIEW_WATCH_MAX_MS,
  SLIDESHOW_REVIEW_WATCH_MIN_MS,
} from "../../constants.js";
import { SlideshowAlertController } from "./alert.ctrl.js";
import { SlideshowPageController } from "./page.ctrl.js";

const DEFAULT_FACTORIES = Object.freeze({
  createAlertController: (card, constants) =>
    new SlideshowAlertController(card, constants),
  createPageController: (card) => new SlideshowPageController(card),
});

export const createSlideshowControllers = (
  card,
  { factories = DEFAULT_FACTORIES } = {},
) => {
  const resolvedFactories = { ...DEFAULT_FACTORIES, ...factories };
  const slideshowAlertController =
    resolvedFactories.createAlertController(card, {
      DAY,
      SLIDESHOW_ALERT_HOLD_MS,
      SLIDESHOW_REVIEW_FRESHNESS_GRACE_SEC,
      SLIDESHOW_REVIEW_WATCH_MIN_MS,
      SLIDESHOW_REVIEW_WATCH_MAX_MS,
    });
  const slideshowPageController =
    resolvedFactories.createPageController(card);

  return {
    _slideshowAlertController: slideshowAlertController,
    _slideshowPageController: slideshowPageController,
  };
};
