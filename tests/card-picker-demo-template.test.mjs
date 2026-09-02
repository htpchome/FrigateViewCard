import { test } from "node:test";
import assert from "node:assert/strict";

import {
  buildCardPickerDemoAlertsMarkup,
  buildCardPickerDemoLiveMarkup,
} from "../src/features/editor-preview/card-picker-demo.tmpl.js";

test("card picker live demo is generic and self-contained", () => {
  const markup = buildCardPickerDemoLiveMarkup();

  assert.match(markup, /Generic camera preview illustration/);
  assert.match(markup, /card-picker-demo-scene/);
  assert.doesNotMatch(markup, /https?:\/\//);
  assert.doesNotMatch(markup, /camera\.[a-z0-9_]+/i);
});

test("card picker alert demo renders two inert synthetic alerts", () => {
  const markup = buildCardPickerDemoAlertsMarkup();

  assert.equal(markup.match(/card-picker-demo-alert"/g)?.length, 2);
  assert.equal(markup.match(/card-picker-demo-alert-badge/g)?.length, 2);
  assert.doesNotMatch(markup, /data-review-open|data-ev|data-dl/);
  assert.doesNotMatch(markup, /https?:\/\//);
});
