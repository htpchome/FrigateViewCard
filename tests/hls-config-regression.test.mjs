import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const source = fs.readFileSync(
  new URL("../frigate-view-card.js", import.meta.url),
  "utf8",
);

test("per-camera desktop HLS disable config is wired through card and editor", () => {
  assert.equal(source.includes("disable_hls_desktop"), true);
  assert.equal(source.includes("normalizeDisableHlsDesktop"), true);
  assert.equal(source.includes("_cameraDisableHlsDesktop"), true);
  assert.equal(source.includes("Disable HLS On Desktop"), true);
  assert.equal(source.includes("camera-modal-disable-hls-desktop"), true);
  assert.equal(source.includes("Desktop HLS off"), true);
});

test("desktop HLS disable only removes the HLS attempt on desktop devices", () => {
  assert.match(
    source,
    /const\s+disableHlsOnDesktop\s*=\s*DEVICE_PROFILE\.isDesktop[\s\S]*_cameraDisableHlsDesktop\(this\._activeCam\?\.entity\)/,
  );
  assert.match(
    source,
    /return\s+order[\s\S]*\.filter\(\(type\)\s*=>\s*!\(type\s*===\s*"hls"\s*&&\s*disableHlsOnDesktop\)\)/,
  );
  assert.match(
    source,
    /const\s+order\s*=\s*forcedType\s*\?\s*\[forcedType\]\s*:\s*\["webrtc",\s*"mse",\s*"hls"\]/,
  );
});
