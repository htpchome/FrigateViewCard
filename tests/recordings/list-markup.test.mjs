import { test } from "node:test";
import assert from "node:assert/strict";

import { buildRecordingsListMarkup } from "../../src/card/recordings/list-markup.js";

test("buildRecordingsListMarkup returns empty markup when there are no recordings", () => {
  assert.equal(
    buildRecordingsListMarkup({
      recordings: [],
      emptyText: "Nothing here",
    }),
    '<div class="empty">Nothing here</div>',
  );
});

test("buildRecordingsListMarkup renders duration and event count for finished recordings", () => {
  const html = buildRecordingsListMarkup({
    recordings: [{ start_time: 100, end_time: 225, events: 3 }],
    recordingsIcon: "REC",
    downloadIcon: "DL",
    formatTime: (ts) => `T${Math.floor(ts)}`,
    nowSec: 500,
  });

  assert.match(html, /data-rs="100"/);
  assert.match(html, /data-re="225"/);
  assert.match(html, /<div class="ric">REC<\/div>/);
  assert.match(html, /<div class="rt">T100 – T225<\/div>/);
  assert.match(html, /<div class="rsub">2m 5s · 3 ev<\/div>/);
  assert.match(html, />DL<\/button>/);
});

test("buildRecordingsListMarkup uses nowSec for open-ended recordings and omits zero event count", () => {
  const html = buildRecordingsListMarkup({
    recordings: [{ start_time: 600, events: 0 }],
    recordingsIcon: "REC",
    downloadIcon: "DL",
    formatTime: (ts) => `T${Math.floor(ts)}`,
    nowSec: 645,
  });

  assert.match(html, /data-rec-dl-start="600"/);
  assert.match(html, /data-rec-dl-end="645"/);
  assert.match(html, /<div class="rt">T600 – T645<\/div>/);
  assert.match(html, /<div class="rsub">45s<\/div>/);
  assert.doesNotMatch(html, / · 0 ev/);
});
