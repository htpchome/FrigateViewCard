import { test } from "node:test";
import assert from "node:assert/strict";

import { GridMediaController } from "../src/features/grid/media.ctrl.js";
import {
  resolveWideCompanionGridLayout,
  WideViewCompanionController,
} from "../src/features/wide-view/companion.ctrl.js";
import { STYLES } from "../src/styles.js";

const constants = {
  DAY: 86400,
  ICONS: { live: "LIVE" },
  PAGE_IDS: { wideView: "wide-view" },
  PREVIEW_ALERT_HOLD_MS: 10000,
  PREVIEW_ALERT_END_GRACE_MS: 3500,
  SLIDESHOW_REVIEW_FRESHNESS_GRACE_SEC: 10,
};

const createHost = ({ live = false, takeover = false } = {}) => {
  const calls = [];
  const grid = {
    firstElementChild: null,
    innerHTML: "",
    clientWidth: 745,
    clientHeight: 550,
    querySelector: () => ({ offsetHeight: 48 }),
    style: {
      values: {},
      setProperty(name, value) {
        this.values[name] = value;
      },
    },
  };
  const host = {
    _pageId: "wide-view",
    _viewMode: "single",
    _activeCamIdx: 0,
    _activeStreamType: "mse",
    _lastLiveStreamHint: "",
    _config: {
      wide_view_live_cameras: live,
      wide_view_alert_takeover: takeover,
      cameras: [
        { entity: "camera.driveway", name: "Driveway" },
        { entity: "camera.front_door", name: "Front Door" },
      ],
    },
    _camCache: {
      "camera.driveway": { events: [1], reviews: [] },
      "camera.front_door": { events: [], reviews: [2, 3] },
    },
    _hass: {
      states: {
        "camera.driveway": { state: "recording", attributes: {} },
        "camera.front_door": { state: "recording", attributes: {} },
      },
    },
    _$: (selector) => (selector === "#wide-companion-grid" ? grid : null),
    shadowRoot: { querySelectorAll: () => [] },
    _cameraConnectionType: (entity) =>
      entity === "camera.front_door" ? "ha_direct" : "frigate_go2rtc",
    _preferredStreamType: () => "webrtc",
    _gridMediaController: { mountCameraCellMedia: () => true },
    _syncSnapshotRefreshTimer: () => calls.push(["syncSnapshots"]),
    _syncToolbarButtons: () => calls.push(["syncToolbar"]),
    _pauseSlideshowForInteraction: () => calls.push(["pauseSlideshow"]),
    _stopSlideshowRotation: (reason, sync) =>
      calls.push(["stopSlideshow", reason, sync]),
    _cameraIndexByEntity: (entity) =>
      host._config.cameras.findIndex((camera) => camera.entity === entity),
    _switchCamera: (index, options) =>
      calls.push(["switchCamera", index, options]),
    _wideViewPageController: {
      syncColHeightIfWideView: () => calls.push(["syncHeight"]),
    },
  };
  return { host, calls, grid };
};

test("Companion Cameras render every configured camera in user order", () => {
  const { host, grid } = createHost();
  const controller = new WideViewCompanionController(host, constants);

  controller.render();

  const driveway = grid.innerHTML.indexOf("camera.driveway");
  const frontDoor = grid.innerHTML.indexOf("camera.front_door");
  assert.ok(driveway >= 0);
  assert.ok(frontDoor > driveway);
  assert.match(grid.innerHTML, /data-wide-companion-camidx="0"/);
  assert.match(grid.innerHTML, /data-wide-companion-camidx="1"/);
  assert.match(grid.innerHTML, /Stream Source: Snapshot/);
  assert.match(grid.innerHTML, /Events: 2/);
});

test("Companion Camera columns resize responsively within useful bounds", () => {
  assert.deepEqual(
    resolveWideCompanionGridLayout({
      cameraCount: 7,
      width: 745,
      height: 550,
    }),
    { columns: 3, cellWidth: 228.7 },
  );
  assert.deepEqual(
    resolveWideCompanionGridLayout({
      cameraCount: 7,
      width: 510,
      height: 750,
    }),
    { columns: 2, cellWidth: 234.6 },
  );
  assert.deepEqual(
    resolveWideCompanionGridLayout({
      cameraCount: 7,
      width: 1260,
      height: 300,
    }),
    { columns: 4, cellWidth: 172.4 },
  );
  assert.deepEqual(
    resolveWideCompanionGridLayout({
      cameraCount: 7,
      width: 300,
      height: 740,
    }),
    { columns: 2, cellWidth: 145 },
  );
  assert.deepEqual(
    resolveWideCompanionGridLayout({
      cameraCount: 5,
      width: 960,
      height: 500,
    }),
    { columns: 3, cellWidth: 313.3 },
  );
  assert.deepEqual(
    resolveWideCompanionGridLayout({
      cameraCount: 5,
      width: 490,
      height: 700,
    }),
    { columns: 2, cellWidth: 240 },
  );
  assert.match(
    STYLES,
    /\.wide-companion-grid\{[^}]*grid-template-columns:repeat\(var\(--wide-companion-columns,1\),minmax\(0,var\(--wide-companion-cell-width,320px\)\)\)/,
  );
  assert.match(
    STYLES,
    /\.wide-companion-media-host\{[^}]*aspect-ratio:16\/9/,
  );
});

test("Companion Camera controller applies the resolved column count", () => {
  const { host, grid } = createHost();
  host._config.cameras = Array.from({ length: 7 }, (_, index) => ({
    entity: `camera.camera_${index + 1}`,
    name: `Camera ${index + 1}`,
  }));
  const controller = new WideViewCompanionController(host, constants);

  controller.updateLayout();

  assert.equal(grid.style.values["--wide-companion-columns"], "3");
  assert.equal(grid.style.values["--wide-companion-cell-width"], "228.7px");
});

test("visible snapshot companions rerender and retry snapshot loading", () => {
  const { host, calls } = createHost({ live: false });
  host._refreshSnapshotMedia = () => calls.push(["refreshSnapshots"]);
  const controller = new WideViewCompanionController(host, constants);
  controller.render = () => calls.push(["render"]);

  controller.resumeVisible();

  assert.deepEqual(calls, [["render"], ["refreshSnapshots"]]);
});

test("visible always-live companions do not request snapshot refresh", () => {
  const { host, calls } = createHost({ live: true });
  host._refreshSnapshotMedia = () => calls.push(["refreshSnapshots"]);
  const controller = new WideViewCompanionController(host, constants);
  controller.render = () => calls.push(["render"]);

  controller.resumeVisible();

  assert.deepEqual(calls, [["render"]]);
});

test("Companion Camera live state is config live or active alert", () => {
  const snapshotHarness = createHost({ live: false });
  const snapshotController = new WideViewCompanionController(
    snapshotHarness.host,
    constants,
  );
  snapshotController._alertController.isCameraAlertLive = () => false;
  assert.equal(snapshotController.shouldUseLive("camera.driveway"), false);

  snapshotController._alertController.isCameraAlertLive = () => true;
  assert.equal(snapshotController.shouldUseLive("camera.driveway"), true);

  const liveHarness = createHost({ live: true });
  const liveController = new WideViewCompanionController(
    liveHarness.host,
    constants,
  );
  liveController._alertController.isCameraAlertLive = () => false;
  assert.equal(liveController.shouldUseLive("camera.driveway"), true);
});

test("runtime takeover defaults from config and does not revert main camera", () => {
  const { host, calls } = createHost({ takeover: false });
  host._$ = () => null;
  const controller = new WideViewCompanionController(host, constants);

  controller._handleAlertStateChange({
    entity: "camera.front_door",
    changed: true,
    allowTakeover: true,
  });
  assert.equal(calls.some(([name]) => name === "switchCamera"), false);

  assert.equal(controller.toggleAlertTakeover(), true);
  controller._handleAlertStateChange({
    entity: "camera.front_door",
    changed: true,
    allowTakeover: true,
  });
  assert.deepEqual(calls.at(-1), [
    "switchCamera",
    1,
    { source: "alert", origin: "wide-companion-alert" },
  ]);
  assert.deepEqual(calls.at(-2), [
    "stopSlideshow",
    "wide-companion-alert",
    false,
  ]);

  controller._handleAlertStateChange({ expired: true, changed: false });
  assert.equal(
    calls.filter(([name]) => name === "switchCamera").length,
    1,
  );
});

test("Alert Camera Takeover cannot start while another toolbar mode is active", () => {
  const { host, calls } = createHost({ takeover: false });
  host._toolbarButtonStates = () => ({
    wideAlertTakeoverDisabled: true,
  });
  const controller = new WideViewCompanionController(host, constants);

  assert.equal(controller.toggleAlertTakeover(), false);
  assert.equal(controller.alertTakeoverEnabled(), false);
  assert.deepEqual(calls, [["syncToolbar"]]);
});

test("configured Alert Camera Takeover yields to an already active mode", () => {
  const { host, calls } = createHost({ takeover: true });
  host._toolbarButtonStates = () => ({
    wideAlertTakeoverDisabled: true,
  });
  const controller = new WideViewCompanionController(host, constants);

  controller.resetAlertTakeoverDefault();

  assert.equal(controller.alertTakeoverEnabled(), false);
  assert.deepEqual(calls, [["syncToolbar"]]);
});

test("clicking a Companion Camera uses the normal manual camera switch", () => {
  const { host, calls } = createHost();
  const controller = new WideViewCompanionController(host, constants);

  controller.selectCamera(1);

  assert.deepEqual(calls.slice(-2), [
    ["pauseSlideshow"],
    [
      "switchCamera",
      1,
      { source: "manual", origin: "wide-companion-camera-select" },
    ],
  ]);
});

const createElement = (tagName) => ({
  tagName,
  style: {},
  dataset: {},
  children: [],
  isConnected: true,
  appendChild(child) {
    child.isConnected = true;
    this.children.push(child);
  },
  remove() {
    this.isConnected = false;
  },
});

test("camera tile live mounts keep HA Direct and Frigate/go2rtc distinct", async () => {
  const previousDocument = globalThis.document;
  globalThis.document = { createElement };
  try {
    const go2rtcCalls = [];
    const go2rtcHost = {
      _shouldUseGo2RtcForEntity: () => true,
      _go2rtcMounter: {
        tryMountWebRtc: async (_slot, _startup, options) => {
          go2rtcCalls.push(options);
          return { ok: true, engine: { destroy() {} } };
        },
      },
      _attachVideoFit() {},
    };
    const go2rtcController = new GridMediaController(go2rtcHost);
    const go2rtcCell = createElement("cell");
    go2rtcController.mountCameraCellMedia(go2rtcCell, {
      entity: "camera.driveway",
      stateObj: { state: "recording", attributes: {} },
      useLive: true,
      liveStreamHint: "webrtc",
      gridState: { destroyed: false, cleanup: [] },
    });
    await new Promise((resolve) => setImmediate(resolve));
    assert.deepEqual(go2rtcCalls, [
      { commit: false, entity: "camera.driveway", muted: true },
    ]);

    const hass = { states: {} };
    const haHost = {
      _hass: hass,
      _shouldUseGo2RtcForEntity: () => false,
      _go2rtcMounter: {
        tryMountWebRtc: async () => {
          throw new Error("go2rtc must not run for HA Direct");
        },
      },
      _attachVideoFit() {},
      _findVideoDeep: () => null,
    };
    const haController = new GridMediaController(haHost);
    const haCell = createElement("cell");
    haController.mountCameraCellMedia(haCell, {
      entity: "camera.front_door",
      stateObj: { state: "recording", attributes: {} },
      useLive: true,
      liveStreamHint: "webrtc",
      gridState: { destroyed: false, cleanup: [] },
    });
    assert.equal(haCell.children[0].tagName, "ha-camera-stream");
    assert.equal(haCell.children[0].hass, hass);
  } finally {
    globalThis.document = previousDocument;
  }
});

test("shared snapshot refresh includes snapshot-mode Companion Cameras", async () => {
  const previousWindow = globalThis.window;
  globalThis.window = { location: { origin: "https://example.test" } };
  try {
    let selector = "";
    const img = { isConnected: true, dataset: {}, src: "" };
    const mediaHost = {
      dataset: { wideCompanionMediaEntity: "camera.driveway" },
      querySelector: () => img,
    };
    const host = {
      _hass: { states: { "camera.driveway": { attributes: {} } } },
      _streamFallbackUrl: async () => "/api/camera_proxy/camera.driveway",
      shadowRoot: {
        querySelectorAll: (value) => {
          selector = value;
          return [mediaHost];
        },
      },
    };
    const controller = new GridMediaController(host);

    await controller.refreshSnapshotMedia({ cacheBustValue: 123 });

    assert.match(selector, /wide-companion-media-host/);
    assert.equal(
      img.src,
      "/api/camera_proxy/camera.driveway?fvc_snapshot=123",
    );
  } finally {
    globalThis.window = previousWindow;
  }
});
