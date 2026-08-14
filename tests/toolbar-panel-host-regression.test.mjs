import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const cardSource = fs.readFileSync(
  new URL("../src/card/FrigateViewCard.js", import.meta.url),
  "utf8",
);
const stylesSource = fs.readFileSync(
  new URL("../src/styles.js", import.meta.url),
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

test("two-way talk action slot is rebuilt from active camera availability", () => {
  assert.equal(cardSource.includes("_syncTwoWayTalkActionSlot()"), true);
  assert.equal(cardSource.includes("this._syncTwoWayTalkActionSlot();"), true);
  assert.equal(cardSource.includes("button.hidden = !visible;"), true);
  assert.equal(cardSource.includes('${visible ? "" : "hidden"}'), true);
});

test("two-way talk hidden button keeps the info row layout stable", () => {
  assert.equal(
    stylesSource.includes(
      ".info-row-mic-btn[hidden] {display: none !important;}",
    ),
    true,
  );
});
