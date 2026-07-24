import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const source = fs.readFileSync(
  new URL("../frigate-view-card.js", import.meta.url),
  "utf8",
);

test("no legacy var declarations remain", () => {
  assert.equal(/\bvar\s+[A-Za-z_$]/.test(source), false);
});

test("no .then chains remain after async/await refactor", () => {
  assert.equal(/\.then\(/.test(source), false);
});

test("event list thumbnails use browser lazy loading", () => {
  assert.equal((source.match(/loading="lazy"/g) || []).length >= 3, true);
});

test("window loads use loading-state guard", () => {
  assert.equal(/if \(this\._loading\) return;/.test(source), true);
  assert.equal(/this\._loading = true;/.test(source), true);
});

test("startup resolves initial page through the navigation factory", () => {
  assert.match(
    source,
    /const\s+initialLoad\s*=\s*this\._loadWindow\(true\);[\s\S]*this\._navigateToConfiguredLandingPage\([\s\S]*hasPendingDeepLinkTarget:\s*this\._hasPendingDeepLinkTarget\(\),[\s\S]*await\s+initialLoad;/,
  );
});
