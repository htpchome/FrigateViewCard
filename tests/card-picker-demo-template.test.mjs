import { test } from "node:test";
import assert from "node:assert/strict";

import {
  buildCardPickerDemoAlertsMarkup,
  buildCardPickerDemoLiveMarkup,
} from "../src/features/editor-preview/card-picker-demo.tmpl.js";

test("card picker live demo uses self-contained FrigateView branding", () => {
  const markup = buildCardPickerDemoLiveMarkup();

  assert.match(markup, /FrigateView preview branding/);
  assert.match(markup, /card-picker-demo-brand/);
  assert.match(markup, /FRIGATEVIEW/);
  assert.match(markup, /For Home Assistant and Frigate/);
  assert.match(markup, /card-picker-demo-brand-gold/);
  assert.match(markup, /fill="#000000"/);
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
