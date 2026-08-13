import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const cardSource = fs.readFileSync(
  new URL("../src/card/FrigateViewCard.js", import.meta.url),
  "utf8",
);

test("tabs shell rebuild recreates filter and calendar panel hosts", () => {
  assert.equal(cardSource.includes("_syncTabsShell()"), true);
  assert.equal(cardSource.includes("this._createFilterPanel();"), true);
  assert.equal(cardSource.includes("this._createCalendarPanel();"), true);
});

test("camera switch checks calendar panel with id selector", () => {
  assert.equal(
    cardSource.includes('this._$("#cal-panel")?.style.display'),
    true,
  );
  assert.equal(
    cardSource.includes('this._$("cal-panel")?.style.display'),
    false,
  );
});
