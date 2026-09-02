import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

import { normalizeCardConfig } from "../src/config/card-config.js";
import { compactEditorConfigForYaml } from "../src/config/yaml-mapper.js";

const source = fs.readFileSync(
  new URL("../dist/frigate-view-card.js", import.meta.url),
  "utf8",
);
const editorSource = fs.readFileSync(
  new URL("../src/editor/FrigateViewCardEditor.js", import.meta.url),
  "utf8",
);
const go2rtcRaceMounterSource = fs.readFileSync(
  new URL("../src/features/live/go2rtc-race-mounter.js", import.meta.url),
  "utf8",
);

test("desktop HLS is automatic and has no per-camera editor option", () => {
  assert.equal(source.includes("disable_hls_desktop"), false);
  assert.equal(editorSource.includes("disable_hls_desktop"), false);
  assert.equal(editorSource.includes("Disable HLS On Desktop"), false);
  assert.equal(go2rtcRaceMounterSource.includes("disableHlsDesktop"), false);
});

test("legacy desktop HLS camera config is ignored and removed from YAML", () => {
  const legacyConfig = {
    cameras: [
      {
        entity: "camera.front",
        disable_hls_desktop: true,
      },
    ],
  };

  const normalized = normalizeCardConfig(legacyConfig);
  const compact = compactEditorConfigForYaml(legacyConfig);

  assert.equal("disable_hls_desktop" in normalized.cameras[0], false);
  assert.equal("disable_hls_desktop" in compact.cameras[0], false);
});
