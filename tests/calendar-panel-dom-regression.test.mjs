import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const cardSource = fs.readFileSync(
  new URL("../src/card/FrigateViewCard.js", import.meta.url),
  "utf8",
);

test("calendar panel is mounted next to the calendar tool button", () => {
  assert.match(cardSource, /toolsEl\.after\(calPanel\);/);
  assert.doesNotMatch(cardSource, /toolsEl\.appendChild\(calPanel\);/);
});
