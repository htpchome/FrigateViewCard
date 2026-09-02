import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const toolbarTemplateSource = fs.readFileSync(
  new URL("../src/card/toolbar.tmpl.js", import.meta.url),
  "utf8",
);

test("calendar panel is declared once after the calendar tool button", () => {
  const buttonIndex = toolbarTemplateSource.indexOf(`id="cal-btn"`);
  const panelAnchor = `data-fvc-region="calendar-panel"`;
  const panelIndex = toolbarTemplateSource.indexOf(panelAnchor);

  assert.notEqual(buttonIndex, -1);
  assert.ok(panelIndex > buttonIndex);
  assert.equal(toolbarTemplateSource.split(panelAnchor).length - 1, 1);
});
