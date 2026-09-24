import {
  DAY,
  SLIDESHOW_REVIEW_FRESHNESS_GRACE_SEC,
} from "../../constants.js";
import { camDisplayName, cap } from "../../helpers.js";
import { ICONS } from "../../icons.js";
import { GridAlertController } from "./alert.ctrl.js";
import { GridMediaController } from "./media.ctrl.js";
import { GridPageController } from "./page.ctrl.js";

const DEFAULT_FACTORIES = Object.freeze({
  createAlertController: (card, constants) =>
    new GridAlertController(card, constants),
  createMediaController: (card, options) =>
    new GridMediaController(card, options),
  createPageController: (card) => new GridPageController(card),
});

export const createGridControllers = (
  card,
  { factories = DEFAULT_FACTORIES } = {},
) => {
  const resolvedFactories = { ...DEFAULT_FACTORIES, ...factories };
  const gridAlertController = resolvedFactories.createAlertController(card, {
    DAY,
    SLIDESHOW_REVIEW_FRESHNESS_GRACE_SEC,
  });
  const gridPageController = resolvedFactories.createPageController(card);
  const gridMediaController = resolvedFactories.createMediaController(card, {
    buildLabelText: (camera) => cap(camDisplayName(camera)),
    liveIconSvg: ICONS.live,
  });

  return {
    _gridAlertController: gridAlertController,
    _gridPageController: gridPageController,
    _gridMediaController: gridMediaController,
  };
};
