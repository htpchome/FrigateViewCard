import { test } from "node:test";
import assert from "node:assert/strict";

import { PreviewPageController } from "../src/preview/preview-page-controller.js";

const createHost = ({
  previewEnabled = true,
  pageId = "single-view",
  liveCameras = false,
  titleBars = true,
  alertLive = false,
  activeStreamType = "mse",
  lastLiveStreamHint = "",
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
    _isPageRouteAvailable: () => true,
    _lastNonPreviewPageId: "single-view",
    _activeCamIdx: 0,
    _$: () => null,
    _isPreviewCameraAlertLive: () => alertLive,
    _cameraConnectionType: (entity) =>
      entity === "camera.front_door" ? "ha_direct" : "webrtc",
    _clearPreviewTimers: () => calls.push(["clearPreviewTimers"]),
    _teardownPreviewMedia: () => calls.push(["teardownPreviewMedia"]),
    _applyPreviewShellVisibility: () =>
      calls.push(["applyPreviewShellVisibility"]),
    _applyCardStyle: () => calls.push(["applyCardStyle"]),
    _applyLayoutMode: () => calls.push(["applyLayoutMode"]),
    _closePopup: () => calls.push(["closePopup"]),
    _cancelPendingMount: (reason) => calls.push(["cancelPendingMount", reason]),
    _navigateToPageRoute: (pageId, context) =>
      calls.push(["navigateToPageRoute", pageId, context]),
    _switchCamera: (idx, context) => calls.push(["switchCamera", idx, context]),
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
    ["cancelPendingMount", "page-route-preview"],
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
