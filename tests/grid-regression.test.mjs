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
const gridMediaControllerSource = fs.readFileSync(
  new URL("../src/features/grid/media.ctrl.js", import.meta.url),
  "utf8",
);
const liveMountControllerSource = fs.readFileSync(
  new URL("../src/features/live/mount-controller.js", import.meta.url),
  "utf8",
);

test("grid mode config is wired through card and editor", () => {
  assert.equal(source.includes("grid_mode_enabled"), true);
  assert.equal(source.includes("grid_live_view_enabled"), true);
  assert.equal(source.includes("grid_rotation_seconds"), true);
  assert.equal(source.includes("Live View In Grid"), true);
  assert.equal(source.includes("Grid Rotation Frequency"), true);
  assert.equal(source.includes("grid_rotation_row"), true);
});

test("grid mode toolbar and runtime hooks are present", () => {
  assert.equal(source.includes("grid-btn"), true);
  assert.equal(source.includes("_toggleGridMode"), true);
  assert.equal(source.includes("_isGridModeAvailable"), true);
  assert.equal(source.includes("_scheduleGridRotation"), true);
  assert.equal(source.includes("_handleGridRealtimeMessage"), true);
  assert.equal(source.includes("_probeLatestGridAlert"), true);
  assert.equal(source.includes("_markGridAlertCamera"), true);
  assert.equal(source.includes("data-grid-camidx"), true);
  assert.equal(
    cardSource.includes(
      'import { GridMediaController } from "../features/grid/media.ctrl.js";',
    ),
    true,
  );
  assert.equal(
    /this\._gridMediaController\s*=\s*new GridMediaController\(this,/.test(
      cardSource,
    ),
    true,
  );
  assert.equal(
    /this\._liveMountController\s*=\s*createLiveMountController\(\{/.test(
      cardSource,
    ),
    true,
  );
  assert.equal(cardSource.includes("_mountGridEngine("), false);
  assert.equal(
    /mountEntry\.type === "grid"[\s\S]*?mountGridEngine\?\.\(slot\)/.test(
      liveMountControllerSource,
    ),
    true,
  );
  assert.equal(
    gridMediaControllerSource.includes("mountGridEngine(slot)"),
    true,
  );
  assert.equal(
    gridMediaControllerSource.includes("createHaCameraStreamElement"),
    true,
  );
  assert.equal(
    gridMediaControllerSource.includes('liveStreamHint === "mse"'),
    true,
  );
});

test("mobile live camera tiles avoid iOS MSE startup and cropping", () => {
  assert.equal(
    source.includes('if (DEVICE_PROFILE.isIOS) return "webrtc";'),
    true,
  );
  assert.equal(
    source.includes(
      ".live-grid-cell video,.live-grid-cell img,.live-grid-cell ha-camera-stream{width:100%;height:100%;display:block;object-fit:contain;object-position:center center;",
    ),
    true,
  );
  assert.equal(
    source.includes(
      ".preview-media-host video,.preview-media-host img,.preview-media-host ha-camera-stream{width:100%;height:100%;display:block;object-fit:contain;object-position:center center;",
    ),
    true,
  );
});
