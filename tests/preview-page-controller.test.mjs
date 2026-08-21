import { test } from "node:test";
import assert from "node:assert/strict";

import { PreviewPageController } from "../src/features/preview/page.ctrl.js";

const createHost = ({
  previewEnabled = true,
  pageId = "single-view",
  liveCameras = false,
  titleBars = true,
  alertLive = false,
  activeStreamType = "mse",
  lastLiveStreamHint = "",
  mobileDevice = false,
} = {}) => {
  const calls = [];
  const host = {
    _config: {
      preview_page_enabled: previewEnabled,
      preview_page_live_cameras: liveCameras,
      preview_page_show_title_bars: titleBars,
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
    _lastNonPreviewPageId: "single-view",
    _activeCamIdx: 0,
    _activeCam: { entity: "camera.front_door" },
    _$: () => null,
    _isPreviewCameraAlertLive: () => alertLive,
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
    },
    _scheduleResumeLive: (reason) => calls.push(["scheduleResumeLive", reason]),
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
    }),
  };
};

test("preview helpers derive values from host state", () => {
  const { controller } = createHost({ liveCameras: true, titleBars: false });

  assert.equal(controller.previewLiveCamerasEnabled(), true);
  assert.equal(controller.previewShowTitleBarsEnabled(), false);
  assert.equal(controller.previewCellSeverity("camera.front_door"), "alert");
  assert.equal(controller.previewShouldUseLive("camera.front_door"), true);
  assert.equal(controller.previewEventsCount("camera.front_door"), 3);
  assert.equal(controller.previewEventsCount("camera.driveway"), 2);
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
  assert.equal(calls[0][1].stateObj?.attributes?.frontend_stream_type, "mse");
  assert.equal(host._previewMediaState?.destroyed, false);
});

test("exitPreviewPageToCamera avoids remount when selecting active camera", () => {
  const { controller, calls, host } = createHost({
    previewEnabled: true,
    pageId: "preview",
  });

  controller.exitPreviewPageToCamera(0);

  assert.equal(host._viewMode, "single");
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
    ["scheduleResumeLive", "preview-camera-select-same-camera"],
    ["loadWindow", true],
  ]);
});

test("exitPreviewPageToCamera switches camera for non-active selection", () => {
  const { controller, calls } = createHost({
    previewEnabled: true,
    pageId: "preview",
  });

  controller.exitPreviewPageToCamera(1);

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
