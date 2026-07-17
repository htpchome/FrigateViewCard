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

test("event list rendering uses chunked background growth", () => {
  assert.equal(/LIST_RENDER_INITIAL_ITEMS\s*=\s*24/.test(source), true);
  assert.equal(/LIST_RENDER_CHUNK_ITEMS\s*=\s*48/.test(source), true);
  assert.equal(/_renderProgressiveList\(/.test(source), true);
  assert.equal(/_scheduleListRenderGrowth\(/.test(source), true);
  assert.equal(/_visibleListSlice\(/.test(source), false);
});

test("startup waits for initial list load before live mount", () => {
  assert.match(
    source,
    /await\s+this\._loadWindow\(true\);[\s\S]*this\._mountEngine\(\);/,
  );
});
