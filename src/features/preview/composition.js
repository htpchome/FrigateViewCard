import {
  DAY,
  PREVIEW_ALERT_END_GRACE_MS,
  PREVIEW_ALERT_HOLD_MS,
  SLIDESHOW_REVIEW_FRESHNESS_GRACE_SEC,
} from "../../constants.js";
import { DEVICE_PROFILE } from "../../helpers.js";
import { PAGE_IDS } from "../navigation/router.js";
import { PreviewAlertController } from "./alert.ctrl.js";
import { PreviewPageController } from "./page.ctrl.js";

export const initializePreviewControllers = (card) => {
  card._previewAlertController = new PreviewAlertController(card, {
    DAY,
    PREVIEW_ALERT_HOLD_MS,
    PREVIEW_ALERT_END_GRACE_MS,
    SLIDESHOW_REVIEW_FRESHNESS_GRACE_SEC,
  });
  card._previewPageController = new PreviewPageController(card, {
    PAGE_IDS,
    DEVICE_PROFILE,
  });
};
