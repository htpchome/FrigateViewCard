import { test } from "node:test";
import assert from "node:assert/strict";

import { GridPageController } from "../src/features/grid/page.ctrl.js";
import { GridMediaController } from "../src/features/grid/media.ctrl.js";
import { SlideshowPageController } from "../src/features/slideshow/page.ctrl.js";

test("grid mode refuses activation while another toolbar mode is active", () => {
  const calls = [];
  const host = {
    _viewMode: "single",
    _gridResumePending: false,
    _isPreviewPageActive: () => false,
    _toolbarButtonStates: () => ({ gridDisabled: true }),
    _syncToolbarButtons: () => calls.push("syncToolbar"),
    _setViewMode: (mode) => calls.push(["setViewMode", mode]),
  };
  const controller = new GridPageController(host);

  controller.toggleGridMode();

  assert.deepEqual(calls, ["syncToolbar"]);
  assert.equal(host._viewMode, "single");
});

test("grid mode retains background live transport state for a reconnect-free exit", () => {
  const restoredTypes = [];
  const host = {
    _viewMode: "single",
    _activeStreamType: "webrtc",
    _lastLiveStreamHint: "webrtc",
    _setActiveStreamType: (type) => restoredTypes.push(type),
  };
  const controller = new GridPageController(host);

  controller.prepareLiveForGrid();
  host._viewMode = "grid";
  assert.equal(controller.captureBackgroundLiveStreamType("mse"), true);
  assert.equal(controller.captureBackgroundLiveStreamType("grid"), false);
  host._viewMode = "single";
  const restored = controller.restoreLiveAfterGrid();

  assert.deepEqual(restoredTypes, ["mse"]);
  assert.equal(restored, true);
});

test("cold startup Grid exits to the first configured camera", () => {
  const restoredTypes = [];
  const handoffResult = {
    ok: true,
    type: "webrtc",
    engine: { id: "grid-camera-one" },
    slot: { id: "grid-camera-one-slot" },
  };
  const host = {
    _viewMode: "single",
    _activeCamIdx: 3,
    _activeGroupMemberOverride: "camera.package",
    _activeStreamType: "--",
    _lastLiveStreamHint: "",
    _engine: null,
    _config: { cameras: [{ entity: "camera.front" }] },
    _gridMediaController: {
      takeGridLiveHandoff: (entity) => {
        assert.equal(entity, "camera.front");
        return handoffResult;
      },
    },
    _setActiveStreamType: (type) => restoredTypes.push(type),
  };
  const controller = new GridPageController(host);

  controller.prepareLiveForGrid();
  host._viewMode = "grid";
  const handoff = controller.takeColdStartLiveHandoff();
  const restored = controller.restoreLiveAfterGrid();

  assert.equal(handoff, handoffResult);
  assert.equal(restored, false);
  assert.equal(host._activeCamIdx, 0);
  assert.equal(host._activeGroupMemberOverride, "");
  assert.deepEqual(restoredTypes, ["--"]);
});

test("custom cold-start Grid exits through its first included physical camera", () => {
  const groupedCamera = {
    entity: "camera.doorbell",
    group: {
      secondary_entity: "camera.package",
      layout: "stacked",
    },
  };
  const takenEntities = [];
  const host = {
    _activeCamIdx: 0,
    _activeGroupMemberOverride: "",
    _activeStreamType: "--",
    _lastLiveStreamHint: "",
    _engine: null,
    _config: {
      cameras: [groupedCamera, { entity: "camera.driveway" }],
      grid_order: {
        mode: "custom",
        included: ["camera.package", "camera.driveway"],
        excluded: ["camera.doorbell"],
      },
    },
    _gridMediaController: {
      takeGridLiveHandoff: (entity) => {
        takenEntities.push(entity);
        return { engine: {}, slot: {}, type: "webrtc" };
      },
    },
    _setActiveStreamType: () => {},
  };
  const controller = new GridPageController(host);

  assert.equal(controller._displayCameras().length, 2);
  assert.equal(controller.takeColdStartLiveHandoff()?.type, "webrtc");
  assert.equal(controller.restoreLiveAfterGrid(), false);
  assert.deepEqual(takenEntities, ["camera.package"]);
  assert.equal(host._activeCamIdx, 0);
  assert.equal(host._activeGroupMemberOverride, "camera.package");
});

test("non-cold Grid keeps its retained main live engine instead of taking a cell", () => {
  let handoffCalls = 0;
  const host = {
    _activeStreamType: "webrtc",
    _engine: { id: "retained-main-engine" },
    _config: { cameras: [{ entity: "camera.front" }] },
    _gridMediaController: {
      takeGridLiveHandoff: () => {
        handoffCalls += 1;
        return {};
      },
    },
  };
  const controller = new GridPageController(host);

  controller.prepareLiveForGrid();

  assert.equal(controller.takeColdStartLiveHandoff(), null);
  assert.equal(handoffCalls, 0);
});

test("Grid media hands off a mounted camera engine only once", () => {
  const result = {
    ok: true,
    type: "webrtc",
    engine: { id: "camera-one-engine" },
    slot: { id: "camera-one-slot" },
  };
  let takeCalls = 0;
  const liveHandoffs = new Map([
    [
      "camera.front",
      {
        take: () => {
          takeCalls += 1;
          return result;
        },
      },
    ],
  ]);
  const host = {
    _gridEngine: {
      pages: new Map([["0", { liveHandoffs }]]),
    },
  };
  const controller = new GridMediaController(host);

  assert.equal(controller.takeGridLiveHandoff("camera.front"), result);
  assert.equal(controller.takeGridLiveHandoff("camera.front"), null);
  assert.equal(takeCalls, 1);
});

test("Grid button exit lets the view transition claim live media before teardown", () => {
  const calls = [];
  const host = {
    _viewMode: "grid",
    _gridResumePending: false,
    _isPreviewPageActive: () => false,
    _setViewMode: (mode) => calls.push(["setViewMode", mode]),
    _gridMediaController: {
      teardownGridEngine: () => calls.push(["teardownGridEngine"]),
    },
  };
  const controller = new GridPageController(host);

  controller.toggleGridMode();

  assert.deepEqual(calls, [["setViewMode", "single"]]);
});

test("Grid rotation pauses in the Home Assistant config preview without changing the Grid", () => {
  const calls = [];
  const originalSetTimeout = global.setTimeout;
  const originalClearTimeout = global.clearTimeout;
  global.setTimeout = () => {
    calls.push("schedule");
    return { id: "new-rotation" };
  };
  global.clearTimeout = (timer) => calls.push(["clear", timer]);
  try {
    const existingTimer = { id: "existing-rotation" };
    const host = {
      _viewMode: "grid",
      _gridRotationT: existingTimer,
      _gridRotationStart: 0,
      _config: {
        grid_mode_enabled: true,
        grid_rotation_seconds: 10,
        cameras: Array.from({ length: 8 }, (_, index) => ({
          entity: `camera.${index + 1}`,
        })),
      },
      _isMobilePhoneViewport: () => false,
      _isEditorPreviewContext: () => true,
      _mountEngine: () => calls.push("mount"),
    };
    const controller = new GridPageController(host);

    controller.scheduleGridRotation();
    controller.advanceGridRotation();

    assert.deepEqual(calls, [["clear", existingTimer]]);
    assert.equal(host._gridRotationT, null);
    assert.equal(host._gridRotationStart, 0);
    assert.equal(host._viewMode, "grid");
  } finally {
    global.setTimeout = originalSetTimeout;
    global.clearTimeout = originalClearTimeout;
  }
});

test("Grid rotation still schedules normally outside the config preview", () => {
  const calls = [];
  const originalSetTimeout = global.setTimeout;
  global.setTimeout = (_callback, delay) => {
    calls.push(delay);
    return { id: "rotation" };
  };
  try {
    const host = {
      _viewMode: "grid",
      _gridRotationT: null,
      _config: {
        grid_mode_enabled: true,
        grid_rotation_seconds: 10,
        cameras: Array.from({ length: 8 }, (_, index) => ({
          entity: `camera.${index + 1}`,
        })),
      },
      _isMobilePhoneViewport: () => false,
      _isEditorPreviewContext: () => false,
    };
    const controller = new GridPageController(host);

    controller.scheduleGridRotation();

    assert.deepEqual(calls, [10000]);
    assert.deepEqual(host._gridRotationT, { id: "rotation" });
  } finally {
    global.setTimeout = originalSetTimeout;
  }
});

test("slideshow refuses activation while another toolbar mode is active", () => {
  const calls = [];
  const host = {
    _slideshowActive: false,
    _toolbarButtonStates: () => ({ slideshowDisabled: true }),
    _syncToolbarButtons: () => calls.push("syncToolbar"),
    _isSlideshowRotationAvailable: () => true,
  };
  const controller = new SlideshowPageController(host);

  controller.toggleRotation();

  assert.deepEqual(calls, ["syncToolbar"]);
  assert.equal(host._slideshowActive, false);
  assert.equal(controller.startRotation(), false);
});

test("slideshow rotates through physical members of a camera group", async () => {
  const calls = [];
  const groupedCamera = {
    entity: "camera.doorbell",
    group: {
      secondary_entity: "camera.package",
      layout: "side_by_side",
    },
  };
  const host = {
    _slideshowActive: true,
    _slideshowPopupPaused: false,
    _slideshowPendingAlertCam: "",
    _slideshowPendingAlertType: "",
    _activeGroupMemberOverride: "camera.doorbell",
    _activeCam: groupedCamera,
    _activeCamIdx: 0,
    _config: { cameras: [groupedCamera] },
    _isSlideshowRotationAvailable: () => true,
    _switchCamera: async (...args) => calls.push(["switchCamera", ...args]),
    _slideshowRotationMs: () => 5000,
    _setSlideshowAlertState: (state) =>
      calls.push(["setSlideshowAlertState", state]),
  };
  const controller = new SlideshowPageController(host);
  controller.scheduleRotation = (reason) =>
    calls.push(["scheduleRotation", reason]);

  await controller.advanceRotation();

  assert.deepEqual(calls, [
    [
      "switchCamera",
      0,
      { source: "slideshow", groupMemberEntity: "camera.package" },
    ],
    ["setSlideshowAlertState", ""],
    ["scheduleRotation", "advance"],
  ]);
});
