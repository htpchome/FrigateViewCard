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

test("progressive list rendering constants and methods exist", () => {
  assert.match(source, /const INITIAL_LIST_RENDER_COUNT\s*=\s*16;/);
  assert.match(source, /_resetListRenderBudget\(\)\s*\{/);
  assert.match(source, /_scheduleListRenderGrowth\(totalCount\)\s*\{/);
  assert.match(source, /_visibleListSlice\(items\)\s*\{/);
});

test("startup waits for initial list load before live mount", () => {
  assert.match(
    source,
    /await\s+this\._loadWindow\(true\);[\s\S]*this\._mountEngine\(\);/,
  );
});
