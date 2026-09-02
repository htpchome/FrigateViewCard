import { test } from "node:test";
import assert from "node:assert/strict";

import { GridMediaController } from "../src/features/grid/media.ctrl.js";
import { PreviewPageController } from "../src/features/preview/page.ctrl.js";
import { STYLES } from "../src/styles.js";
import {
  buildPreviewCellMarkup,
  buildPreviewLightRegionMarkup,
  buildPreviewMetaMarkup,
} from "../src/features/preview/page.tmpl.js";

const createHost = ({
  previewEnabled = true,
  pageId = "single-view",
  liveCameras = false,
  mobileLiveCameras = false,
  titleBars = true,
  alertLive = false,
  activeStreamType = "mse",
  lastLiveStreamHint = "",
  mobileDevice = false,
  phoneDevice = false,
  bottomNavbar = false,
  displayLogo = true,
} = {}) => {
  const calls = [];
  const host = {
    _config: {
      preview_page_enabled: previewEnabled,
      preview_page_live_cameras: liveCameras,
      preview_page_live_cameras_mobile: mobileLiveCameras,
      preview_page_show_title_bars: titleBars,
      display_logo: displayLogo,
      cameras: [{ entity: "camera.front_door" }, { entity: "camera.driveway" }],
    },
    _camCache: {
      "camera.front_door": { events: [1, 2], reviews: [3] },
      "camera.driveway": { events: [], reviews: [4, 5] },
    },
    _activeStreamType: activeStreamType,
    _lastLiveStreamHint: lastLiveStreamHint,
    _pageId: pageId,
    _mountInProgress: false,
    _isPageRouteAvailable: () => true,
    _isMobileDevice: () => mobileDevice,
    _isLikelyMobileClient: () => mobileDevice,
    _lastNonPreviewPageId: "single-view",
    _activeCamIdx: 0,
    _activeCam: { entity: "camera.front_door" },
    _activeGroupMemberOverride: "",
    _events: [],
    _recordings: [],
    _reviews: [],
    _kept: [],
    _$: () => null,
    _isPreviewCameraAlertLive: () => alertLive,
    _isLikelyPhoneClient: () => phoneDevice,
    _isMobilePhoneViewport: () => phoneDevice,
    _cameraConnectionType: (entity) =>
      entity === "camera.front_door" ? "ha_direct" : "webrtc",
    _clearPreviewTimers: () => calls.push(["clearPreviewTimers"]),
    _teardownPreviewMedia: () => calls.push(["teardownPreviewMedia"]),
    _applyPreviewShellVisibility: () =>
      calls.push(["applyPreviewShellVisibility"]),
    _renderShellPreserveLive: () => calls.push(["renderShellPreserveLive"]),
    _applyCardStyle: () => calls.push(["applyCardStyle"]),
    _wideViewPageController: {
      applyStyleLayoutForCard: () => {
        calls.push(["applyCardStyle"]);
        calls.push(["applyLayoutMode"]);
      },
      applyStyleLayoutAndWideSyncForCard: () => {
        calls.push(["applyCardStyle"]);
        calls.push(["applyLayoutMode"]);
      },
      applyLayoutModeForCard: () => calls.push(["applyLayoutMode"]),
    },
    _popupLifecycleController: {
      close: () => calls.push(["closePopup"]),
    },
    _cancelPendingMount: (reason) => calls.push(["cancelPendingMount", reason]),
    _navigateToPageRoute: (pageId, context) =>
      calls.push(["navigateToPageRoute", pageId, context]),
    _switchCamera: (idx, context) => calls.push(["switchCamera", idx, context]),
    _mountEngine: (...args) => calls.push(["mountEngine", ...args]),
    _browseWindowLoaderController: {
      loadWindow: (replace) => calls.push(["loadWindow", replace]),
      cameraAlertsCount: (entity) =>
        host._camCache[entity]?.reviews?.length || 0,
    },
    _scheduleResumeLive: (reason) => calls.push(["scheduleResumeLive", reason]),
    _subtitleText: () => "Driveway",
    _haNavbarController: {
      isNavbarAtBottom: () => bottomNavbar,
    },
    _previewAlertController: {
      start: () => calls.push(["previewAlertStart"]),
      previewCellSeverity: (entity) =>
        entity === "camera.front_door" ? "alert" : "detection",
    },
  };
  return {
    host,
    calls,
    controller: new PreviewPageController(host, {
      PAGE_IDS: { preview: "preview", singleView: "single-view" },
      DEVICE_PROFILE: { isMobile: mobileDevice, isPhone: phoneDevice },
    }),
  };
};

test("mobile Preview uses the bottom navbar as its footer and moves enabled branding to the header", () => {
  const { controller, host } = createHost({
    previewEnabled: true,
    pageId: "preview",
    mobileDevice: true,
    bottomNavbar: true,
  });

  assert.equal(controller.usesBottomNavbarPreviewChrome(), true);
  const brandedMarkup = controller.buildPreviewLayoutShellMarkup();
  assert.match(brandedMarkup, /id="preview-shell-header-logo" >/);
  assert.match(brandedMarkup, /id="preview-shell-title-block" hidden/);
  assert.match(brandedMarkup, /id="preview-shell-footer" hidden/);

  host._config.display_logo = false;
  const titleMarkup = controller.buildPreviewLayoutShellMarkup();
  assert.match(
    titleMarkup,
    /id="preview-shell-header-logo" hidden><\/div>/,
  );
  assert.match(titleMarkup, /id="preview-shell-title-block" >/);
  assert.match(titleMarkup, /id="preview-shell-footer" hidden/);

  host._haNavbarController.isNavbarAtBottom = () => false;
  assert.equal(controller.usesBottomNavbarPreviewChrome(), false);
  const standardMarkup = controller.buildPreviewLayoutShellMarkup();
  assert.doesNotMatch(standardMarkup, /id="preview-shell-footer" hidden/);
});

test("preview helpers derive values from host state", () => {
  const { controller } = createHost({ liveCameras: true, titleBars: false });

  assert.equal(controller.previewLiveCamerasEnabled(), true);
  assert.equal(controller.previewShowTitleBarsEnabled(), false);
  assert.equal(controller.previewCellSeverity("camera.front_door"), "alert");
  assert.equal(controller.previewShouldUseLive("camera.front_door"), true);
  assert.equal(controller.previewAlertsCount("camera.front_door"), 1);
  assert.equal(controller.previewAlertsCount("camera.driveway"), 2);
});

test("Preview title supports the active camera token without inheriting grid text", () => {
  const { controller, host } = createHost();
  host._config.title = "{camera}";
  host._viewMode = "grid";
  host._activeCam = { entity: "camera.front_door", name: "Front Door" };

  assert.equal(controller._previewPageTitle(), "Front Door");
});

test("Preview linked lights render in metadata or over media when metadata is hidden", () => {
  const light = "<button data-linked-light-toggle>LIGHT</button>";
  const meta = buildPreviewMetaMarkup({
    showTitleBars: true,
    name: "Doorbell",
    online: true,
    sourceLabel: "Snapshot",
    alertsCount: 2,
    cameraEntity: "camera.front_door",
    linkedLightMarkup: light,
    linkedLightPosition: "left",
  });
  assert.match(meta, /class="preview-meta preview-meta--with-light"/);
  assert.match(meta, /class="linked-light-region preview-meta-light"/);
  assert.match(meta, /data-linked-light-camera="camera\.front_door"/);
  assert.match(meta, /data-linked-light-position-slot="left"/);
  assert.doesNotMatch(meta, /preview-meta-actions/);

  const overlay = buildPreviewLightRegionMarkup({
    cameraEntity: "camera.front_door",
    linkedLightMarkup: light,
    linkedLightPosition: "left",
    overlay: true,
  });
  const cell = buildPreviewCellMarkup({
    index: 0,
    entity: "camera.front_door",
    useLive: false,
    overlayLightMarkup: overlay,
    metaMarkup: "",
  });
  assert.match(cell, /class="preview-media-frame"/);
  assert.match(cell, /class="linked-light-region preview-light-overlay"/);
  assert.match(cell, /data-linked-light-position-slot="left"/);
  assert.match(
    STYLES,
    /\.preview-light-overlay\{[^}]*right:7px;left:7px;[^}]*justify-content:space-between/,
  );
  assert.match(
    STYLES,
    /\.preview-meta-light \.linked-light-position-slot\[data-linked-light-position-slot="left"\]\{justify-self:start;/,
  );
});

test("Preview metadata stays two-column until its own card is very narrow", () => {
  assert.match(
    STYLES,
    /\.preview-cell\{[^}]*container-name:preview-cell/,
  );
  assert.match(STYLES, /@container preview-cell \(max-width: 240px\)/);
  assert.match(STYLES, /\.preview-grid :is\([^}]*line-height:1\.18/);
  assert.doesNotMatch(
    STYLES,
    /@media \(max-width: 720px\)\{\s*\.preview-meta/,
  );
});

test("preview live cameras use independent desktop and mobile settings", () => {
  const desktop = createHost({
    liveCameras: true,
    mobileLiveCameras: false,
  }).controller;
  const mobile = createHost({
    liveCameras: true,
    mobileLiveCameras: false,
    mobileDevice: true,
  }).controller;
  const mobileEnabled = createHost({
    liveCameras: false,
    mobileLiveCameras: true,
    mobileDevice: true,
  }).controller;
  const mobileAlert = createHost({
    liveCameras: false,
    mobileLiveCameras: false,
    mobileDevice: true,
    alertLive: true,
  }).controller;

  assert.equal(desktop.previewLiveCamerasEnabled(), true);
  assert.equal(mobile.previewLiveCamerasEnabled(), false);
  assert.equal(mobile.previewShouldUseLive("camera.front_door"), false);
  assert.equal(mobileEnabled.previewLiveCamerasEnabled(), true);
  assert.equal(mobileEnabled.previewShouldUseLive("camera.front_door"), true);
  assert.equal(mobileAlert.previewShouldUseLive("camera.front_door"), true);
});

test("preview page active state derives from config and current page id", () => {
  const { controller } = createHost({
    previewEnabled: true,
    pageId: "preview",
  });
  assert.equal(controller.isPreviewPageEnabled(), true);
  assert.equal(controller.isPreviewPageActive(), true);

  const disabled = createHost({
    previewEnabled: false,
    pageId: "preview",
  }).controller;
  assert.equal(disabled.isPreviewPageEnabled(), false);
  assert.equal(disabled.isPreviewPageActive(), false);
});

test("preview live stream hint prefers current active stream", () => {
  const { controller } = createHost({ activeStreamType: "webrtc" });

  assert.equal(controller.previewLiveStreamHint(), "webrtc");
});

test("preview stream source label derives from connection type and live hint", () => {
  const { controller } = createHost({ activeStreamType: "mse" });

  assert.equal(
    controller.previewStreamSourceLabel("camera.front_door", true),
    "HA Live",
  );
  assert.equal(
    controller.previewStreamSourceLabel("camera.driveway", true),
    "MSE Live",
  );
  assert.equal(
    controller.previewStreamSourceLabel("camera.driveway", false),
    "Snapshot",
  );
});

test("activatePreviewPageRoute keeps preview path behavior intact", () => {
  const { host, calls, controller } = createHost();

  controller.activatePreviewPageRoute({ previousPageId: "single-view" });

  assert.deepEqual(calls, [
    ["renderShellPreserveLive"],
    ["applyPreviewShellVisibility"],
    ["applyCardStyle"],
    ["applyLayoutMode"],
    ["previewAlertStart"],
  ]);
});

test("activatePreviewPageRoute cancels pending mount only when active", () => {
  const { host, calls, controller } = createHost();
  host._mountInProgress = true;

  controller.activatePreviewPageRoute({ previousPageId: "single-view" });

  assert.deepEqual(calls, [
    ["cancelPendingMount", "page-route-preview"],
    ["renderShellPreserveLive"],
    ["applyPreviewShellVisibility"],
    ["applyCardStyle"],
    ["applyLayoutMode"],
    ["previewAlertStart"],
  ]);
});

test("applyPreviewShellVisibility toggles preview active class when card exists", () => {
  const classListCalls = [];
  const { controller } = createHost();
  controller._host._$ = () => ({
    classList: {
      toggle: (className, isActive) =>
        classListCalls.push([className, isActive]),
    },
  });
  controller._host._config.preview_page_enabled = true;
  controller._host._pageId = "preview";

  controller.applyPreviewShellVisibility();

  assert.deepEqual(classListCalls, [["preview-active", true]]);
});

test("mountPreviewMedia delegates preview cells through grid media ownership", () => {
  const hosts = [
    {
      dataset: {
        previewMediaEntity: "camera.front_door",
        previewUseLive: "0",
      },
      innerHTML: "",
    },
  ];
  const { controller, host } = createHost({
    previewEnabled: true,
    pageId: "preview",
  });
  const calls = [];

  host._hass = {
    states: {
      "camera.front_door": { state: "recording", attributes: {} },
    },
  };
  host._preferredStreamType = () => "webrtc";
  host._gridMediaController = {
    mountCameraCellMedia: (cell, options) => {
      calls.push([cell, options]);
      return true;
    },
  };
  host.shadowRoot = {
    querySelectorAll: (selector) =>
      selector === ".preview-media-host" ? hosts : [],
  };

  controller.mountPreviewMedia();

  assert.equal(calls.length, 1);
  assert.equal(calls[0][0], hosts[0]);
  assert.equal(calls[0][1].entity, "camera.front_door");
  assert.equal(calls[0][1].fallbackOnLiveError, true);
  assert.equal(calls[0][1].snapshotPlaceholderWhileLive, true);
  assert.equal(calls[0][1].stateObj?.attributes?.frontend_stream_type, "mse");
  assert.equal(host._previewMediaState?.destroyed, false);
});

const createPreviewMediaElement = (tagName) => {
  const classTokens = new Set();
  const element = {
    tagName,
    style: {},
    dataset: {},
    children: [],
    parentNode: null,
    isConnected: false,
    innerHTML: "",
    classList: {
      add: (...tokens) => {
        tokens.forEach((token) => classTokens.add(token));
      },
      contains: (token) => classTokens.has(token),
    },
    appendChild(child) {
      child.remove?.();
      child.parentNode = this;
      child.isConnected = this.isConnected;
      this.children.push(child);
      return child;
    },
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
    get: () => [...classTokens].join(" "),
    set: (value) => {
      classTokens.clear();
      String(value || "")
        .split(/\s+/)
        .filter(Boolean)
        .forEach((token) => classTokens.add(token));
    },
  });
  return element;
};

test("Preview go2rtc tiles retain a snapshot until live startup succeeds", async () => {
  const previousDocument = globalThis.document;
  let finishMount;
  const mountPending = new Promise((resolve) => {
    finishMount = resolve;
  });
  globalThis.document = { createElement: createPreviewMediaElement };
  try {
    const cell = createPreviewMediaElement("cell");
    cell.isConnected = true;
    const gridState = { destroyed: false, cleanup: [] };
    const controller = new GridMediaController({
      _streamFallbackUrl: async () => "/snapshot/front.jpg",
      _shouldUseGo2RtcForEntity: () => true,
      _go2rtcMounter: {
        tryMountMse: async () => await mountPending,
      },
    });

    controller.mountCameraCellMedia(cell, {
      entity: "camera.front",
      stateObj: { attributes: {} },
      useLive: true,
      liveStreamHint: "mse",
      gridState,
      fallbackOnLiveError: true,
      snapshotPlaceholderWhileLive: true,
    });
    await new Promise((resolve) => setImmediate(resolve));

    assert.equal(cell.children.length, 2);
    const [placeholder, liveLayer] = cell.children;
    assert.equal(
      placeholder.classList.contains("preview-live-placeholder"),
      true,
    );
    assert.equal(placeholder.src, "/snapshot/front.jpg");
    assert.equal(liveLayer.classList.contains("is-ready"), false);

    finishMount({ ok: true, engine: { destroy() {} } });
    await new Promise((resolve) => setImmediate(resolve));

    assert.equal(liveLayer.classList.contains("is-ready"), true);
    gridState.cleanup.forEach((cleanup) => cleanup());
  } finally {
    globalThis.document = previousDocument;
  }
});

test("Preview go2rtc tiles retain their snapshot when live startup fails", async () => {
  const previousDocument = globalThis.document;
  globalThis.document = { createElement: createPreviewMediaElement };
  try {
    const cell = createPreviewMediaElement("cell");
    cell.isConnected = true;
    const gridState = { destroyed: false, cleanup: [] };
    const controller = new GridMediaController({
      _streamFallbackUrl: async () => "/snapshot/front.jpg",
      _shouldUseGo2RtcForEntity: () => true,
      _go2rtcMounter: {
        tryMountMse: async () => false,
      },
    });

    controller.mountCameraCellMedia(cell, {
      entity: "camera.front",
      stateObj: { attributes: {} },
      useLive: true,
      liveStreamHint: "mse",
      gridState,
      fallbackOnLiveError: true,
      snapshotPlaceholderWhileLive: true,
    });
    await new Promise((resolve) => setImmediate(resolve));

    assert.equal(cell.children.length, 1);
    assert.equal(
      cell.children[0].classList.contains("preview-live-placeholder"),
      true,
    );
    gridState.cleanup.forEach((cleanup) => cleanup());
  } finally {
    globalThis.document = previousDocument;
  }
});

test("Grid go2rtc media uses only the selected transport", async () => {
  const previousDocument = globalThis.document;
  globalThis.document = { createElement: createPreviewMediaElement };
  try {
    const calls = [];
    const cell = createPreviewMediaElement("cell");
    cell.isConnected = true;
    const gridState = { destroyed: false, cleanup: [] };
    const engine = { destroy() {} };
    const controller = new GridMediaController({
      _streamFallbackUrl: async () => "/snapshot/front.jpg",
      _shouldUseGo2RtcForEntity: () => true,
      _go2rtcMounter: {
        tryMountMse: async (_host, _startup, options) => {
          calls.push(["mse", options.entity]);
          return { ok: true, engine };
        },
        tryMountWebRtc: async () => {
          throw new Error("unexpected WebRTC attempt");
        },
        tryMountHls: async () => {
          throw new Error("unexpected HLS attempt");
        },
      },
    });

    controller.mountCameraCellMedia(cell, {
      entity: "camera.front",
      stateObj: { attributes: {} },
      useLive: true,
      liveStreamHint: "mse",
      gridState,
    });
    await new Promise((resolve) => setImmediate(resolve));

    assert.deepEqual(calls, [["mse", "camera.front"]]);
    assert.equal(cell.children.length, 1);
    gridState.cleanup.forEach((cleanup) => cleanup());
  } finally {
    globalThis.document = previousDocument;
  }
});

test("Grid starts mounting while its cell is still in the detached grid", async () => {
  const previousDocument = globalThis.document;
  let finishMount;
  let mountCalls = 0;
  const mountPending = new Promise((resolve) => {
    finishMount = resolve;
  });
  globalThis.document = { createElement: createPreviewMediaElement };
  try {
    const cell = createPreviewMediaElement("cell");
    const gridState = { destroyed: false, cleanup: [] };
    const engine = { destroy() {} };
    const controller = new GridMediaController({
      _streamFallbackUrl: async () => "/snapshot/front.jpg",
      _shouldUseGo2RtcForEntity: () => true,
      _go2rtcMounter: {
        tryMountWebRtc: async () => {
          mountCalls += 1;
          return await mountPending;
        },
      },
    });

    controller.mountCameraCellMedia(cell, {
      entity: "camera.front",
      stateObj: { attributes: {} },
      useLive: true,
      liveStreamHint: "webrtc",
      gridState,
    });

    assert.equal(mountCalls, 1);
    cell.isConnected = true;
    cell.children[0].isConnected = true;
    finishMount({ ok: true, engine });
    await new Promise((resolve) => setImmediate(resolve));
    assert.equal(gridState.cleanup.length, 1);
    gridState.cleanup.forEach((cleanup) => cleanup());
  } finally {
    globalThis.document = previousDocument;
  }
});

test("Grid destroys a transport that finishes after its cell was removed", async () => {
  const previousDocument = globalThis.document;
  let finishMount;
  let destroyCalls = 0;
  let mountSignal = null;
  const mountPending = new Promise((resolve) => {
    finishMount = resolve;
  });
  globalThis.document = { createElement: createPreviewMediaElement };
  try {
    const cell = createPreviewMediaElement("cell");
    cell.isConnected = true;
    const gridState = { destroyed: false, cleanup: [] };
    const controller = new GridMediaController({
      _streamFallbackUrl: async () => "/snapshot/front.jpg",
      _shouldUseGo2RtcForEntity: () => true,
      _go2rtcMounter: {
        tryMountWebRtc: async (_host, _startup, options) => {
          mountSignal = options.abortSignal;
          return await mountPending;
        },
      },
    });

    controller.mountCameraCellMedia(cell, {
      entity: "camera.front",
      stateObj: { attributes: {} },
      useLive: true,
      liveStreamHint: "webrtc",
      gridState,
    });
    const mediaHost = cell.children[0];
    gridState.destroyed = true;
    gridState.cleanup.forEach((cleanup) => cleanup());
    assert.equal(mountSignal?.aborted, true);
    assert.equal(mediaHost.isConnected, false);
    finishMount({
      ok: true,
      engine: { destroy: () => (destroyCalls += 1) },
    });
    await new Promise((resolve) => setImmediate(resolve));

    assert.equal(destroyCalls, 1);
    assert.equal(gridState.cleanup.length, 1);
  } finally {
    globalThis.document = previousDocument;
  }
});

test("Preview HA Direct tiles reveal live media only after its first frame", () => {
  const previousDocument = globalThis.document;
  globalThis.document = { createElement: createPreviewMediaElement };
  try {
    let firstFrameCallback = null;
    const video = {
      readyState: 0,
      videoWidth: 0,
      currentTime: 0,
      addEventListener() {},
      removeEventListener() {},
      requestVideoFrameCallback(callback) {
        firstFrameCallback = callback;
        return 1;
      },
      cancelVideoFrameCallback() {},
    };
    const cell = createPreviewMediaElement("cell");
    cell.isConnected = true;
    const gridState = { destroyed: false, cleanup: [] };
    const controller = new GridMediaController({
      _hass: { states: {} },
      _streamFallbackUrl: async () => "/snapshot/front.jpg",
      _shouldUseGo2RtcForEntity: () => false,
      _attachVideoFit() {},
      _findVideoDeep: () => video,
    });

    controller.mountCameraCellMedia(cell, {
      entity: "camera.front",
      stateObj: { attributes: {} },
      useLive: true,
      liveStreamHint: "webrtc",
      gridState,
      fallbackOnLiveError: true,
      snapshotPlaceholderWhileLive: true,
    });

    const liveLayer = cell.children[1];
    assert.equal(liveLayer.classList.contains("is-ready"), false);
    assert.equal(typeof firstFrameCallback, "function");
    firstFrameCallback();
    assert.equal(liveLayer.classList.contains("is-ready"), true);
    gridState.cleanup.forEach((cleanup) => cleanup());
  } finally {
    globalThis.document = previousDocument;
  }
});

test("exitPreviewPageToCamera avoids remount when selecting active camera", () => {
  const { controller, calls, host } = createHost({
    previewEnabled: true,
    pageId: "preview",
  });

  controller.exitPreviewPageToCamera(0);

  assert.equal(host._viewMode, "single");
  assert.deepEqual(host._events, [1, 2]);
  assert.deepEqual(host._reviews, [3]);
  assert.deepEqual(calls, [
    [
      "navigateToPageRoute",
      "single-view",
      {
        source: "preview-camera-select",
        deferCameraSwitch: true,
      },
    ],
    ["mountEngine"],
    ["loadWindow", true],
  ]);
});

test("exitPreviewPageToCamera preserves an existing active-camera live mount", () => {
  const { controller, calls, host } = createHost({
    previewEnabled: true,
    pageId: "preview",
  });
  host._$ = (selector) => (selector === "#engine" ? {} : null);
  host._findVideoDeep = () => ({ tagName: "VIDEO" });

  controller.exitPreviewPageToCamera(0);

  assert.deepEqual(calls, [
    [
      "navigateToPageRoute",
      "single-view",
      {
        source: "preview-camera-select",
        deferCameraSwitch: true,
      },
    ],
    ["scheduleResumeLive", "preview-retained-camera-exit"],
    ["loadWindow", true],
  ]);
});

test("exitPreviewPageToCamera switches camera for non-active selection", () => {
  const { controller, calls, host } = createHost({
    previewEnabled: true,
    pageId: "preview",
  });

  controller.exitPreviewPageToCamera(1);

  assert.deepEqual(host._events, [1, 2]);
  assert.deepEqual(host._reviews, [3]);
  assert.deepEqual(calls, [
    [
      "navigateToPageRoute",
      "single-view",
      {
        source: "preview-camera-select",
        deferCameraSwitch: true,
      },
    ],
    ["switchCamera", 1, { source: "preview-camera-select" }],
  ]);
});

test("exitPreviewPageToCamera uses the configured phone flow destination", () => {
  const { controller, calls, host } = createHost({
    previewEnabled: true,
    pageId: "preview",
  });
  host._pageNavigationController = {
    resolvePreviewCameraTargetPage: () => "mobile-view",
    navigateToPageRoute: (pageId, context) =>
      calls.push(["navigateToPageRoute", pageId, context]),
  };

  controller.exitPreviewPageToCamera(1);

  assert.deepEqual(calls, [
    [
      "navigateToPageRoute",
      "mobile-view",
      {
        source: "preview-camera-select",
        deferCameraSwitch: true,
      },
    ],
    ["switchCamera", 1, { source: "preview-camera-select" }],
  ]);
});

test("phone Preview selection opens the selected physical group member", () => {
  const { controller, calls, host } = createHost({
    previewEnabled: true,
    pageId: "preview",
    phoneDevice: true,
  });
  host._config.cameras[0] = {
    entity: "camera.front_door",
    group: {
      secondary_entity: "camera.package",
      layout: "stacked",
    },
  };
  host._activeCam = host._config.cameras[0];
  host._activeCamIdx = 1;

  controller.exitPreviewPageToCamera(0, "camera.package");

  assert.deepEqual(calls.at(-1), [
    "switchCamera",
    0,
    {
      source: "preview-camera-select",
      groupMemberEntity: "camera.package",
    },
  ]);

  calls.length = 0;
  host._activeCamIdx = 0;
  host._activeGroupMemberOverride = "camera.package";
  controller.exitPreviewPageToCamera(0, "camera.front_door");
  assert.deepEqual(calls.at(-1), [
    "switchCamera",
    0,
    {
      source: "preview-camera-select",
      groupMemberEntity: "",
    },
  ]);
});

test("desktop Preview selection retains the complete grouped live view", () => {
  const { controller, calls, host } = createHost({
    previewEnabled: true,
    pageId: "preview",
  });
  host._config.cameras[0] = {
    entity: "camera.front_door",
    group: {
      secondary_entity: "camera.package",
      layout: "side_by_side",
    },
  };
  host._activeCam = host._config.cameras[0];
  host._activeCamIdx = 1;

  controller.exitPreviewPageToCamera(0, "camera.package");

  assert.deepEqual(calls.at(-1), [
    "switchCamera",
    0,
    {
      source: "preview-camera-select",
      groupMemberEntity: "",
    },
  ]);
});

test("renderPreviewPage does not remount media on severity-only updates", () => {
  const { controller, host } = createHost({
    previewEnabled: true,
    pageId: "preview",
  });
  host._hass = {
    states: {
      "camera.front_door": { state: "recording", attributes: {} },
      "camera.driveway": { state: "recording", attributes: {} },
    },
  };

  let severity = "alert";
  host._previewAlertController.previewCellSeverity = () => severity;

  const shell = {
    firstElementChild: {
      classList: {
        contains: (value) => value === "preview-grid",
      },
    },
    innerHTML: "",
  };

  host._$ = (selector) => {
    if (selector === "#preview-shell-title") return { textContent: "" };
    if (selector === "#preview-shell-subtitle") return { textContent: "" };
    return null;
  };
  host._subtitleText = () => "Frigate";

  controller.ensurePreviewLayoutShell = () => shell;
  controller.applyPreviewShellVisibility = () => {};
  host._syncSnapshotRefreshTimer = () => {};

  let updateCalls = 0;
  let mountCalls = 0;
  controller.updatePreviewMeta = () => {
    updateCalls += 1;
  };
  controller.mountPreviewMedia = () => {
    mountCalls += 1;
  };

  host._previewLastRenderSignature =
    "0:camera.front_door:snap|1:camera.driveway:snap|titles:1|hass:1";

  severity = "detection";
  controller.renderPreviewPage();

  assert.equal(updateCalls, 1);
  assert.equal(mountCalls, 0);
  assert.equal(
    host._previewLastRenderSignature,
    "0:camera.front_door:snap|1:camera.driveway:snap|titles:1|hass:1",
  );
});
