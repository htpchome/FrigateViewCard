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

test("window loads use a request sequence guard", () => {
  assert.equal(/_windowLoadSeq\s*=\s*0/.test(source), true);
  assert.equal(/const loadSeq = \+\+this\._windowLoadSeq;/.test(source), true);
});

test("startup kicks list load before live mount without awaiting it", () => {
  assert.match(
    source,
    /void\s+this\._loadWindow\(true\);[\s\S]*this\._mountEngine\(\);/,
  );
  assert.equal(/_loadWindowBeforeLive\(/.test(source), false);
});
