import { test } from "node:test";
import assert from "node:assert/strict";

import {
  DAY,
  PREVIEW_ALERT_END_GRACE_MS,
  PREVIEW_ALERT_HOLD_MS,
  SLIDESHOW_REVIEW_FRESHNESS_GRACE_SEC,
} from "../src/constants.js";
import { PAGE_IDS } from "../src/features/navigation/router.js";
import { DEVICE_PROFILE } from "../src/helpers.js";
import { PreviewAlertController } from "../src/features/preview/alert.ctrl.js";
import { initializePreviewControllers } from "../src/features/preview/composition.js";
import { PreviewPageController } from "../src/features/preview/page.ctrl.js";

test("Preview composition initializes controllers and dependencies", () => {
  const card = {};

  initializePreviewControllers(card);

  assert.deepEqual(Object.keys(card), [
    "_previewAlertController",
    "_previewPageController",
  ]);
  assert.equal(card._previewAlertController instanceof PreviewAlertController, true);
  assert.equal(card._previewPageController instanceof PreviewPageController, true);
  assert.equal(card._previewAlertController._host, card);
  assert.equal(card._previewPageController._host, card);
  assert.deepEqual(card._previewAlertController._constants, {
    DAY,
    PREVIEW_ALERT_HOLD_MS,
    PREVIEW_ALERT_END_GRACE_MS,
    SLIDESHOW_REVIEW_FRESHNESS_GRACE_SEC,
  });
  assert.deepEqual(card._previewPageController._constants, {
    PAGE_IDS,
    DEVICE_PROFILE,
  });
});
