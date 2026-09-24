import { test } from "node:test";
import assert from "node:assert/strict";

import { createGridControllers } from "../src/features/grid/composition.js";

test("Grid composition preserves controller order and dependencies", () => {
  const calls = [];
  const options = {};
  const controllers = {
    alert: { type: "alert" },
    page: { type: "page" },
    media: { type: "media" },
  };
  const card = {};
  const factories = {
    createAlertController: (host, value) => {
      calls.push(["alert", host]);
      options.alert = value;
      return controllers.alert;
    },
    createPageController: (host) => {
      calls.push(["page", host]);
      return controllers.page;
    },
    createMediaController: (host, value) => {
      calls.push(["media", host]);
      options.media = value;
      return controllers.media;
    },
  };

  const result = createGridControllers(card, { factories });

  assert.deepEqual(result, {
    _gridAlertController: controllers.alert,
    _gridPageController: controllers.page,
    _gridMediaController: controllers.media,
  });
  assert.deepEqual(calls, [
    ["alert", card],
    ["page", card],
    ["media", card],
  ]);
  assert.equal(options.alert.DAY, 86400);
  assert.equal(
    Number.isFinite(options.alert.SLIDESHOW_REVIEW_FRESHNESS_GRACE_SEC),
    true,
  );
  assert.equal(options.media.buildLabelText({ name: "front door" }), "Front door");
  assert.match(options.media.liveIconSvg, /<svg/);
});
