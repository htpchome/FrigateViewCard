import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const source = fs.readFileSync(
  new URL("../frigate-view-card.js", import.meta.url),
  "utf8",
);
const cardSource = fs.readFileSync(
  new URL("../src/card/FrigateViewCard.js", import.meta.url),
  "utf8",
);
const go2rtcRaceMounterSource = fs.readFileSync(
  new URL("../src/features/live/go2rtc-race-mounter.js", import.meta.url),
  "utf8",
);
const attemptPlannerSource = fs.readFileSync(
  new URL("../src/features/live/attempt-planner.js", import.meta.url),
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
    cardSource,
    /createGo2RtcRaceMounter\([\s\S]*?isDesktop:\s*DEVICE_PROFILE\.isDesktop,[\s\S]*?disableHlsDesktopForEntity:\s*\(entity\)\s*=>[\s\S]*?_cameraDisableHlsDesktop\(entity\)/,
  );
  assert.match(
    go2rtcRaceMounterSource,
    /const\s+disableHlsOnDesktop\s*=\s*isDesktop\s*&&\s*disableHlsDesktopForEntity\(targetEntity\)/,
  );
  assert.match(
    go2rtcRaceMounterSource,
    /return\s+buildLiveAttemptPlan\([\s\S]*?disableHlsOnDesktop,[\s\S]*?builders/s,
  );
  assert.match(
    attemptPlannerSource,
    /const\s+DEFAULT_LIVE_ORDER\s*=\s*Object\.freeze\(\["webrtc",\s*"mse",\s*"hls"\]\)[\s\S]*?const\s+order\s*=\s*forcedType\s*\?\s*\[forcedType\]\s*:\s*DEFAULT_LIVE_ORDER/s,
  );
});
