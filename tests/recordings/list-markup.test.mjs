import { test } from "node:test";
import assert from "node:assert/strict";

import { buildRecordingsListMarkup } from "../../src/features/recordings/recordings.tmpl.js";

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
  assert.match(html, /<div class="rt"><span data-fvc-date-format="time" data-fvc-date-ts="100">T100<\/span> – <span data-fvc-date-format="time" data-fvc-date-ts="225">T225<\/span><\/div>/);
  assert.match(html, /<div class="rsub">2m 5s · 3 <span data-fvc-i18n="runtime\.browse\.row\.eventAbbreviation">ev<\/span><\/div>/);
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
  assert.match(html, /<div class="rt"><span data-fvc-date-format="time" data-fvc-date-ts="600">T600<\/span> – <span data-fvc-date-format="time" data-fvc-date-ts="645">T645<\/span><\/div>/);
  assert.match(html, /<div class="rsub">45s<\/div>/);
  assert.doesNotMatch(html, / · 0 ev/);
});

test("recording row localizes its count and camera-specific download label", () => {
  const t = (key, values = {}) => ({
    "runtime.browse.row.eventAbbreviation": "év.",
    "runtime.browse.row.downloadRecordingFromCamera": "Télécharger depuis {camera}",
  }[key] || key).replace("{camera}", values.camera || "");
  const html = buildRecordingsListMarkup({
    recordings: [{
      start_time: 100,
      end_time: 150,
      events: 2,
      _fvc_group_member: 'Front "Door"',
    }],
    formatTime: (timestamp) => String(timestamp),
    t,
  });

  assert.match(html, /2 <span data-fvc-i18n="runtime\.browse\.row\.eventAbbreviation">év\.<\/span>/);
  assert.match(html, /title="Télécharger depuis Front &quot;Door&quot;"/);
  assert.match(html, /data-fvc-i18n-values="\{&quot;camera&quot;:&quot;Front \\&quot;Door\\&quot;&quot;\}"/);
});
