import { test } from "node:test";
import assert from "node:assert/strict";

import {
  DAY,
  SLIDESHOW_ALERT_HOLD_MS,
  SLIDESHOW_REVIEW_FRESHNESS_GRACE_SEC,
  SLIDESHOW_REVIEW_WATCH_MAX_MS,
  SLIDESHOW_REVIEW_WATCH_MIN_MS,
} from "../src/constants.js";
import { createSlideshowControllers } from "../src/features/slideshow/composition.js";

test("Slideshow composition preserves controller order and constants", () => {
  const calls = [];
  const options = {};
  const alertController = { type: "alert" };
  const pageController = { type: "page" };
  const card = {};
  const factories = {
    createAlertController: (host, constants) => {
      calls.push(["alert", host]);
      options.alert = constants;
      return alertController;
    },
    createPageController: (host) => {
      calls.push(["page", host]);
      return pageController;
    },
  };

  const result = createSlideshowControllers(card, { factories });

  assert.deepEqual(result, {
    _slideshowAlertController: alertController,
    _slideshowPageController: pageController,
  });
  assert.deepEqual(calls, [
    ["alert", card],
    ["page", card],
  ]);
  assert.deepEqual(options.alert, {
    DAY,
    SLIDESHOW_ALERT_HOLD_MS,
    SLIDESHOW_REVIEW_FRESHNESS_GRACE_SEC,
    SLIDESHOW_REVIEW_WATCH_MIN_MS,
    SLIDESHOW_REVIEW_WATCH_MAX_MS,
  });
});
