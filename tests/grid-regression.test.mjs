import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { GridMediaController } from "../src/features/grid/media.ctrl.js";
import { GridPageController } from "../src/features/grid/page.ctrl.js";
import { LazyGridFeatureController } from "../src/features/grid/runtime.loader.js";
import { renderGridEmptyPlaceholder } from "../src/features/grid/page.tmpl.js";

const source = fs.readFileSync(
  new URL("../dist/frigate-view-card.js", import.meta.url),
  "utf8",
);
const editorBundleSource = fs.readFileSync(
  new URL("../dist/frigate-view-card-editor.js", import.meta.url),
  "utf8",
);
const cardSource = fs.readFileSync(
  new URL("../src/card/FrigateViewCard.js", import.meta.url),
  "utf8",
);
const gridCompositionSource = fs.readFileSync(
  new URL("../src/features/grid/composition.js", import.meta.url),
  "utf8",
);
const gridPageControllerSource = fs.readFileSync(
  new URL("../src/features/grid/page.ctrl.js", import.meta.url),
  "utf8",
);
const cameraCellMediaControllerSource = fs.readFileSync(
  new URL(
    "../src/features/live/camera-cell-media.ctrl.js",
    import.meta.url,
  ),
  "utf8",
);
const gridRuntimeMediaControllerSource = fs.readFileSync(
  new URL("../src/features/grid/runtime-media.ctrl.js", import.meta.url),
  "utf8",
);
const gridRuntimeLoaderSource = fs.readFileSync(
  new URL("../src/features/grid/runtime.loader.js", import.meta.url),
  "utf8",
);
const gridMediaControllerSource = `${cameraCellMediaControllerSource}\n${gridRuntimeMediaControllerSource}`;
const slideshowPageControllerSource = fs.readFileSync(
  new URL("../src/features/slideshow/page.ctrl.js", import.meta.url),
  "utf8",
);
const routeLifecycleSource = fs.readFileSync(
  new URL("../src/features/navigation/route-lifecycle.js", import.meta.url),
  "utf8",
);
const liveMountControllerSource = fs.readFileSync(
  new URL("../src/features/live/mount-controller.js", import.meta.url),
  "utf8",
);
const liveLifecycleCompositionSource = fs.readFileSync(
  new URL(
    "../src/features/live/lifecycle-composition.js",
    import.meta.url,
  ),
  "utf8",
);
const stylesSource = fs.readFileSync(
  new URL("../src/styles.js", import.meta.url),
  "utf8",
);

test("empty grid placeholders use localized, escaped text", () => {
  const cell = {
    classList: { add: () => {} },
    innerHTML: "",
  };
  renderGridEmptyPlaceholder(cell, "<svg></svg>", () => "Vide & prêt");
  assert.match(cell.innerHTML, /data-fvc-i18n="runtime\.grid\.empty"/);
  assert.match(cell.innerHTML, /Vide &amp; prêt/);
});

test("grid mode config is wired through card and editor", () => {
  assert.equal(source.includes("grid_mode_enabled"), true);
  assert.equal(source.includes("grid_live_view_enabled"), true);
  assert.equal(editorBundleSource.includes("grid_rotation_seconds"), true);
  assert.equal(editorBundleSource.includes("Live View in Grid"), true);
  assert.equal(editorBundleSource.includes("Grid Rotation Interval"), true);
  assert.equal(editorBundleSource.includes("grid_rotation_row"), true);
});

test("visible grid snapshots are eagerly loaded at high priority", () => {
  assert.match(
    gridMediaControllerSource,
    /preferWebRtc: true,[\s\S]*?prioritizeSnapshot: true/,
  );
  assert.match(
    gridMediaControllerSource,
    /img\.loading = prioritizeSnapshot \? "eager" : "lazy";/,
  );
  assert.match(
    gridMediaControllerSource,
    /if \(prioritizeSnapshot\) img\.fetchPriority = "high";/,
  );
});

test("grid mode toolbar and runtime hooks are present", () => {
  assert.equal(source.includes("grid-btn"), true);
  assert.equal(source.includes("_toggleGridMode"), true);
  assert.equal(source.includes("_isGridModeAvailable"), true);
  assert.equal(source.includes("_scheduleGridRotation"), false);
  assert.equal(source.includes("_handleGridRealtimeMessage"), false);
  assert.equal(source.includes("_probeLatestGridAlert"), true);
  assert.equal(source.includes("_markGridAlertCamera"), false);
  assert.equal(source.includes("data-grid-camidx"), true);
  assert.equal(
    cardSource.includes(
      'import { createGridControllers } from "../features/grid/composition.js";',
    ),
    true,
  );
  assert.equal(
    cardSource.includes(
      "Object.assign(this, createGridControllers(this));",
    ),
    true,
  );
  assert.match(
    gridCompositionSource,
    /new LazyGridFeatureController\(card, options\)/,
  );
  assert.match(gridRuntimeLoaderSource, /GRID_RUNTIME_ASSET_NAME/);
  assert.doesNotMatch(gridCompositionSource, /new GridMediaController/);
  assert.match(
    gridPageControllerSource,
    /_setViewMode\?\.\("grid", \{ resumeGridSession: true \}\)/,
  );
  assert.match(
    cardSource,
    /if \(!resumeGridSession\) this\._gridAlertController\.startSession\(\);/,
  );
  assert.equal(cardSource.includes("_clearGridTimers("), false);
  assert.equal(cardSource.includes("_clearGridAlertTracking("), false);
  assert.equal(cardSource.includes("_focusGridPageForCamera("), false);
  assert.equal(
    /_scheduleGridRefresh\(delayMs = 80\) \{\s*this\._gridPageController\.scheduleGridRefresh\(delayMs\);\s*\}/.test(
      cardSource,
    ),
    true,
  );
  assert.equal(gridPageControllerSource.includes("clearGridTimers()"), true);
  assert.equal(
    gridPageControllerSource.includes("clearGridAlertTracking()"),
    true,
  );
  assert.equal(
    gridPageControllerSource.includes("scheduleGridRefresh(delayMs = 80)"),
    true,
  );
  assert.equal(
    cardSource.includes("this._gridPageController.scheduleGridRotation();"),
    true,
  );
  assert.equal(
    cardSource.includes(
      "this._gridAlertController.handleRealtimeMessage(msg);",
    ),
    true,
  );
  assert.equal(
    /this\._liveMountController\s*=\s*createLiveMountController\(\{/.test(
      cardSource,
    ),
    false,
  );
  assert.equal(
    liveLifecycleCompositionSource.includes(
      "const liveMountController = resolvedFactories.createLiveMountController({",
    ),
    true,
  );
  assert.equal(cardSource.includes("_mountGridEngine("), false);
  assert.equal(
    /mountEntry\.type === "grid"[\s\S]*?mountGridEngine\?\.\(\)/.test(
      liveMountControllerSource,
    ),
    true,
  );
  assert.equal(
    gridMediaControllerSource.includes("mountGridEngine(slot)"),
    true,
  );
  assert.equal(gridMediaControllerSource.includes("_host._gridEngine"), true);
  assert.equal(gridMediaControllerSource.includes("_host._engine ="), false);
  assert.equal(
    liveMountControllerSource.includes('cancelPendingMount?.("grid-mode")'),
    false,
  );
  assert.equal(
    gridMediaControllerSource.includes("createHaCameraStreamElement"),
    false,
  );
  assert.equal(
    gridMediaControllerSource.includes("this._host._haDirectMounter.mountTile"),
    true,
  );
  assert.equal(
    gridMediaControllerSource.includes("_mountGridGo2RtcCell"),
    true,
  );
  assert.equal(
    gridMediaControllerSource.includes(
      "this._host._shouldUseGo2RtcForEntity(entity)",
    ),
    true,
  );
  assert.equal(
    ["tryMountWebRtc", "tryMountMse"].every((method) =>
      gridMediaControllerSource.includes(method),
    ),
    true,
  );
  assert.equal(
    cardSource.includes(
      'if (this._tab === "alerts" || this._tab === "kept") {',
    ) &&
      cardSource.includes("void (async () => {") &&
      cardSource.includes("await this._loadGridMixedTabData(this._tab);") &&
      cardSource.includes("this._renderList();"),
    true,
  );
});

test("mobile live camera tiles avoid iOS MSE startup and cropping", () => {
  assert.equal(
    /if \(DEVICE_PROFILE\.isIOS\) return "webrtc";/.test(cardSource),
    true,
  );
  assert.equal(
    source.includes(
      ".live-grid-cell video,.live-grid-cell img,.live-grid-cell ha-camera-stream{width:100%;height:100%;display:block;object-fit:contain;object-position:center center;",
    ),
    true,
  );
});

test("Grid startup and its toolbar button use the same view-mode activation", () => {
  assert.match(
    routeLifecycleSource,
    /if \(context\.startInGrid === true\) \{\s*host\._setViewMode\("grid"\);/,
  );
  assert.match(
    gridPageControllerSource,
    /toggleGridMode\(\)[\s\S]*?this\._host\._setViewMode\("grid"\);/,
  );
  assert.match(
    cardSource,
    /if \(startGridTimers\) \{[\s\S]*?this\._scheduleGridRefresh\(0\);[\s\S]*?this\._gridPageController\.scheduleGridRotation\(\);/,
  );
});

test("Grid eligibility excludes phones while allowing tablets and desktops", () => {
  let isPhone = false;
  const host = {
    _config: {
      cameras: [
        { entity: "camera.front" },
        { entity: "camera.back" },
      ],
      grid_mode_enabled: true,
      card_view_page_enabled: true,
      card_view_standalone: false,
    },
    _cardWidth: 400,
    _isLikelyMobileClient: () => true,
    _isLikelyPhoneClient: () => isPhone,
  };
  const controllers = [
    new GridPageController(host),
    new LazyGridFeatureController(host),
  ];
  const expectAvailability = (expected) => {
    for (const controller of controllers) {
      assert.equal(
        controller.isGridModeAvailable?.() ?? controller.isSupported(),
        expected,
      );
    }
  };

  // Android tablet classification: mobile, but not a phone.
  expectAvailability(true);

  isPhone = true;
  expectAvailability(false);

  // Desktop classification.
  host._isLikelyMobileClient = () => false;
  isPhone = false;
  expectAvailability(true);

  host._config.grid_mode_enabled = false;
  expectAvailability(false);

  host._config.grid_mode_enabled = true;
  host._config.cameras = [{ entity: "camera.front" }];
  expectAvailability(false);

  // The general mobile classifier remains unchanged for other features.
  assert.equal(host._isLikelyMobileClient(), false);
});

test("Slideshow availability is not inferred from card width or device type", () => {
  const start = slideshowPageControllerSource.indexOf(
    "available() {",
  );
  const end = slideshowPageControllerSource.indexOf("rotationMs()", start);
  const availabilitySource = slideshowPageControllerSource.slice(start, end);

  assert.match(
    availabilitySource,
    /slideshow_rotation_enabled === true/,
  );
  assert.match(availabilitySource, /flattenCameraMembers/);
  assert.doesNotMatch(availabilitySource, /DEVICE_PROFILE|Phone|Viewport/);
  assert.match(gridPageControllerSource, /_isLikelyPhoneClient\?\.\(\) !== true/);
  assert.doesNotMatch(gridPageControllerSource, /MobilePhoneViewport/);
});

test("Grid cells own their border and rounded clipping directly", () => {
  const cellRule =
    stylesSource.match(/\.live-grid-cell\{(?<declarations>[^}]*)\}/)?.groups
      ?.declarations || "";
  assert.match(cellRule, /overflow:hidden;/);
  assert.match(cellRule, /box-sizing:border-box;/);
  assert.match(cellRule, /touch-action:manipulation;/);
  assert.match(
    cellRule,
    /border:1px solid var\(--c-text3\)\s*!important;/,
  );
  assert.match(
    cellRule,
    /border-radius:calc\(var\(--fvc-border-radius,\s*0px\)\s*\/\s*2\)\s*!important;/,
  );
  assert.match(
    stylesSource,
    /\.live-grid-cell\.grid-alert\{[^}]*border-color:[^;]*!important;/,
  );
  assert.match(
    stylesSource,
    /#eng-wrap::before\{[^}]*inset:0;[^}]*border:0 solid transparent;/,
  );
  assert.doesNotMatch(stylesSource, /varvar\(/);
  assert.doesNotMatch(stylesSource, /live-grid-cell-surface/);
  assert.doesNotMatch(gridMediaControllerSource, /gridCellSurface/);
  assert.doesNotMatch(stylesSource, /@supports \(-moz-appearance:none\)/);
});

test("Frigate go2rtc Grid races only WebRTC and MSE while retaining takeover", () => {
  assert.match(
    gridMediaControllerSource,
    /GRID_LIVE_ATTEMPT_TYPES = Object\.freeze\(\["webrtc", "mse"\]\)/,
  );
  assert.doesNotMatch(
    gridMediaControllerSource,
    /GRID_LIVE_ATTEMPT_TYPES = Object\.freeze\([^)]*"hls"/,
  );
  assert.match(
    gridMediaControllerSource,
    /new StreamOrchestrator\(\{[\s\S]*?preferredType: "webrtc"[\s\S]*?retainPreferredOnFallback: true/,
  );
  assert.match(
    gridMediaControllerSource,
    /deferredPreferredAttempt[\s\S]*?webRtcResult/,
  );

  const mountMethodStart = gridMediaControllerSource.indexOf(
    "  _mountGridGo2RtcCell(",
  );
  const nextMethodStart = gridMediaControllerSource.indexOf(
    "\n  _mountGridCameraCellMedia(",
    mountMethodStart,
  );
  const mountMethodSource = gridMediaControllerSource.slice(
    mountMethodStart,
    nextMethodStart,
  );
  const mountCallIndex = mountMethodSource.indexOf("await mount.call(");
  const connectedCheckIndex = mountMethodSource.indexOf("host.isConnected");
  assert.ok(mountCallIndex >= 0);
  assert.ok(connectedCheckIndex > mountCallIndex);

  const gridMountStart = gridMediaControllerSource.indexOf(
    "  mountGridEngine(slot)",
  );
  const gridMountEnd = gridMediaControllerSource.indexOf(
    "\n  teardownGridEngine(",
    gridMountStart,
  );
  const gridMountSource = gridMediaControllerSource.slice(
    gridMountStart,
    gridMountEnd,
  );
  assert.match(gridMountSource, /fallbackOnLiveError: true/);
  assert.match(gridMountSource, /snapshotPlaceholderWhileLive: true/);
  assert.match(gridMountSource, /preferWebRtc: true/);
  assert.match(
    stylesSource,
    /\.live-grid-cell > \.preview-live-placeholder,\.live-grid-cell > \.preview-live-layer\{position:absolute;inset:0;width:100%;height:100%;\}/,
  );
  assert.match(
    stylesSource,
    /\.live-grid-cell > \.preview-live-layer\.is-ready\{opacity:1;\}/,
  );
});

test("Grid resolves HA-direct HLS without adding HLS to the go2rtc race", () => {
  const previousDocument = globalThis.document;
  const createElement = () => {
    const classes = new Set();
    const element = {
      style: {},
      dataset: {},
      children: [],
      parentNode: null,
      isConnected: true,
      innerHTML: "",
      classList: {
        add: (...tokens) => tokens.forEach((token) => classes.add(token)),
        contains: (token) => classes.has(token),
      },
      appendChild(child) {
        child.parentNode = this;
        child.isConnected = this.isConnected;
        this.children.push(child);
        return child;
      },
      setAttribute() {},
      querySelectorAll: () => [],
      remove() {
        this.isConnected = false;
      },
    };
    Object.defineProperty(element, "className", {
      set: (value) => {
        classes.clear();
        String(value || "")
          .split(/\s+/)
          .filter(Boolean)
          .forEach((token) => classes.add(token));
      },
    });
    return element;
  };
  globalThis.document = { createElement };

  try {
    const cameras = [
      { entity: "camera.ha_direct" },
      { entity: "camera.frigate_go2rtc" },
    ];
    const host = {
      _config: { cameras },
      _hass: {
        states: {
          "camera.ha_direct": { attributes: {} },
          "camera.frigate_go2rtc": { attributes: {} },
        },
      },
      _gridRotationStart: 0,
      _gridEngine: null,
      _gridLastRenderSignature: "",
      _gridLiveViewEnabled: () => true,
      _isGridCameraAlertLive: () => false,
      _gridCellSeverity: () => "",
      _shouldUseGo2RtcForEntity: (entity) =>
        entity === "camera.frigate_go2rtc",
      _activeCam: { entity: "camera.frigate_go2rtc" },
      _activeStreamType: "mse",
      _preferredStreamType: () => "webrtc",
      _setActiveStreamType() {},
      _syncSnapshotRefreshTimer() {},
      shadowRoot: { querySelector: () => null },
    };
    const controller = new GridMediaController(host);
    const mounts = [];
    controller._mountGridCameraCellMedia = (_cell, options) => {
      mounts.push(options);
      return true;
    };

    controller.mountGridEngine(createElement());

    assert.equal(mounts.length, 2);
    assert.deepEqual(
      mounts.map(({ entity, liveStreamHint, stateObj }) => ({
        entity,
        liveStreamHint,
        frontendStreamType: stateObj.attributes.frontend_stream_type,
      })),
      [
        {
          entity: "camera.ha_direct",
          liveStreamHint: "ha",
          frontendStreamType: undefined,
        },
        {
          entity: "camera.frigate_go2rtc",
          liveStreamHint: "webrtc",
          frontendStreamType: undefined,
        },
      ],
    );
    assert.equal(mounts[1].preferWebRtc, true);
  } finally {
    globalThis.document = previousDocument;
  }
});

test("Grid live preference reaches the go2rtc cell mount", () => {
  const controller = new GridMediaController({
    _shouldUseGo2RtcForEntity: () => true,
  });
  let mountedOptions = null;
  controller._mountGridGo2RtcCell = (_cell, _entity, _gridState, options) => {
    mountedOptions = options;
  };

  controller.mountCameraCellMedia(
    {},
    {
      entity: "camera.grid_test",
      stateObj: {},
      useLive: true,
      liveStreamHint: "webrtc",
      gridState: { destroyed: false, cleanup: [] },
      preferWebRtc: true,
    },
  );

  assert.equal(mountedOptions?.preferWebRtc, true);
});

test("normal HA Direct tiles subscribe to retained providers without a movable handoff", () => {
  const mounts = [];
  const cleanup = [];
  const ready = [];
  const detach = () => {};
  const controller = new GridMediaController({
    _shouldUseGo2RtcForEntity: () => false,
    _isCatalyst: () => false,
    _haDirectMounter: { mountTile: (target, options) => {
      mounts.push({ target, ...options });
      return detach;
    } },
  });
  const cell = {};
  controller.mountCameraCellMedia(cell, {
    entity: "camera.one", stateObj: {}, useLive: true,
    gridState: { destroyed: false, cleanup },
    onLiveReady: (...args) => ready.push(args),
  });
  assert.equal(mounts.length, 1);
  assert.equal(mounts[0].target, cell);
  assert.equal(mounts[0].entity, "camera.one");
  const provider = {};
  mounts[0].onState({ status: "loading", provider });
  assert.equal(ready.length, 0);
  mounts[0].onState({ status: "ready", provider, streamType: "hls" });
  assert.deepEqual(ready, [[provider, { type: "hls" }]]);
  assert.deepEqual(cleanup, [detach]);
});

test("entering live Grid releases only duplicate go2rtc main-camera connections", () => {
  assert.match(
    cardSource,
    /prepareLiveForGrid\(\)[\s\S]*?gridPreparation\?\.releaseMainLive === true[\s\S]*?_cancelPendingMount\("grid-mode-entry"\)[\s\S]*?_clearLiveEngineSlot\(\)/,
  );
  assert.match(
    gridPageControllerSource,
    /retainMainLiveInGrid[\s\S]*?_shouldUseGo2RtcForEntity\?\.\(activeEntity\) !== true/,
  );
  assert.match(
    gridRuntimeMediaControllerSource,
    /_shouldUseRetainedMainLive[\s\S]*?entity && !useRetainedMainLive[\s\S]*?_mountGridCameraCellMedia/,
  );
  assert.match(
    stylesSource,
    /\.camera-group-live-pane--primary\.grid-retained-main-live/,
  );
});

test("a clicked live Grid camera transfers its transport only after selection is preserved", () => {
  assert.match(
    cardSource,
    /gridSelectedLiveHandoff = wasGridMode[\s\S]*?takeGridLiveHandoff\?\.\([\s\S]*?newTransportEntity/,
  );
  assert.match(
    cardSource,
    /restoreLiveAfterGrid\(\{[\s\S]*?preserveActiveCamera: !gridAlertTakeover/,
  );
  assert.match(
    cardSource,
    /adoptedGridSelectedLive[\s\S]*?_adoptLiveAttemptResult\([\s\S]*?gridSelectedLiveHandoff/,
  );
  assert.match(
    cardSource,
    /if \(!adoptedGridSelectedLive\) this\._mountEngine\(\);/,
  );
});

test("Grid leaves HA Direct transport selection to Home Assistant", () => {
  const controller = new GridMediaController({
    _activeCam: { entity: "camera.ha_direct" },
    _activeStreamType: "grid",
    _lastLiveStreamHint: "webrtc",
    _hass: {
      states: {
        "camera.ha_direct": { attributes: {} },
      },
    },
    _shouldUseGo2RtcForEntity: () => false,
  });

  assert.equal(
    controller._resolveGridCellLiveStreamHint("camera.ha_direct"),
    "ha",
  );
});

test("Grid editor previews always use snapshots", () => {
  const liveHost = {
    _isEditorPreviewContext: () => false,
    _gridLiveViewEnabled: () => true,
    _isGridCameraAlertLive: () => false,
  };
  assert.equal(
    new GridMediaController(liveHost)._shouldUseLive("camera.front"),
    true,
  );

  const alertHost = {
    _isEditorPreviewContext: () => false,
    _gridLiveViewEnabled: () => false,
    _isGridCameraAlertLive: () => true,
  };
  assert.equal(
    new GridMediaController(alertHost)._shouldUseLive("camera.front"),
    true,
  );

  const editorHost = {
    _isEditorPreviewContext: () => true,
    _gridLiveViewEnabled: () => true,
    _isGridCameraAlertLive: () => true,
  };
  assert.equal(
    new GridMediaController(editorHost)._shouldUseLive("camera.front"),
    false,
  );
  assert.match(
    cardSource,
    /_gridLiveViewEnabled\(\) \{\s*if \(this\._isEditorPreviewContext\(\)\) return false;/,
  );
});

test("Grid rotation reuses previously mounted page media", () => {
  const previousDocument = globalThis.document;
  const createElement = () => {
    const classes = new Set();
    const element = {
      style: {},
      dataset: {},
      children: [],
      parentNode: null,
      isConnected: true,
      innerHTML: "",
      classList: {
        add: (...tokens) => tokens.forEach((token) => classes.add(token)),
        contains: (token) => classes.has(token),
      },
      appendChild(child) {
        child.parentNode = this;
        child.isConnected = this.isConnected;
        this.children.push(child);
        return child;
      },
      setAttribute() {},
      querySelectorAll: () => [],
      remove() {
        if (this.parentNode?.children) {
          this.parentNode.children = this.parentNode.children.filter(
            (child) => child !== this,
          );
        }
        this.parentNode = null;
        this.isConnected = false;
      },
    };
    Object.defineProperty(element, "className", {
      set: (value) => {
        classes.clear();
        String(value || "")
          .split(/\s+/)
          .filter(Boolean)
          .forEach((token) => classes.add(token));
      },
    });
    return element;
  };
  globalThis.document = { createElement };

  try {
    let severity = "";
    const cameras = Array.from({ length: 5 }, (_, index) => ({
      entity: `camera.grid_${index + 1}`,
    }));
    const host = {
      _config: { cameras },
      _hass: { states: {} },
      _gridRotationStart: 0,
      _gridEngine: null,
      _gridLastRenderSignature: "",
      _gridLiveViewEnabled: () => true,
      _isGridCameraAlertLive: () => false,
      _gridCellSeverity: () => severity,
      _shouldUseGo2RtcForEntity: () => true,
      _preferredStreamType: () => "webrtc",
      _setActiveStreamType() {},
      _syncSnapshotRefreshTimer() {},
      shadowRoot: { querySelector: () => null },
    };
    const controller = new GridMediaController(host);
    let mediaMounts = 0;
    controller._mountGridCameraCellMedia = () => {
      mediaMounts += 1;
      return true;
    };
    const slot = createElement();

    controller.mountGridEngine(slot);
    const firstPage = host._gridEngine.pages.get("0")?.grid;
    assert.equal(mediaMounts, 4);

    host._gridRotationStart = 4;
    controller.mountGridEngine(slot);
    assert.equal(mediaMounts, 5);
    assert.equal(host._gridEngine.pages.size, 2);

    host._gridRotationStart = 0;
    controller.mountGridEngine(slot);
    assert.equal(mediaMounts, 5);
    assert.equal(host._gridEngine.pages.get("0")?.grid, firstPage);
    assert.equal(firstPage.style.opacity, "1");

    severity = "alert";
    controller.mountGridEngine(slot);
    assert.equal(mediaMounts, 5);
  } finally {
    globalThis.document = previousDocument;
  }
});
