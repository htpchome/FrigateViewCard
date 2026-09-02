import { test } from "node:test";
import assert from "node:assert/strict";

import { CameraGroupLiveController } from "../src/features/camera-groups/live.ctrl.js";
import { buildLiveEngineWrapMarkup } from "../src/features/live/view.tmpl.js";

const createClassList = () => {
  const values = new Set();
  return {
    add: (...names) => names.forEach((name) => values.add(name)),
    remove: (...names) => names.forEach((name) => values.delete(name)),
    toggle: (name, force) => {
      if (force) values.add(name);
      else values.delete(name);
    },
    contains: (name) => values.has(name),
  };
};

const createHost = () => {
  const primaryVideo = {
    muted: true,
    defaultMuted: true,
    volume: 0,
    videoWidth: 1920,
    videoHeight: 1080,
  };
  const secondaryVideo = {
    muted: true,
    defaultMuted: true,
    volume: 0,
    videoWidth: 1920,
    videoHeight: 1080,
  };
  const wrap = {
    classList: createClassList(),
    getBoundingClientRect: () => ({
      left: 0,
      top: 0,
      width: 800,
      height: 450,
    }),
  };
  const target = { innerHTML: "" };
  const primaryPane = {
    classList: createClassList(),
    querySelector: () => null,
    getBoundingClientRect: () => ({
      left: 0,
      top: 0,
      width: 400,
      height: 450,
    }),
  };
  const secondaryPane = {
    hidden: true,
    classList: createClassList(),
    querySelector: () => null,
    getBoundingClientRect: () => ({
      left: 400,
      top: 0,
      width: 400,
      height: 450,
    }),
  };
  const mounts = [];
  const host = {
    _activeCam: {
      entity: "camera.main",
      connection_type: "frigate_go2rtc",
      group: {
        secondary_entity: "camera.package",
        layout: "side_by_side",
      },
    },
    _viewMode: "single",
    _activeGroupMemberOverride: "",
    _streamMuted: false,
    _hass: {
      states: {
        "camera.package": { state: "streaming", attributes: {} },
      },
    },
    _isPreviewPageActive: () => false,
    _isLikelyPhoneClient: () => false,
    _isMobilePhoneViewport: () => false,
    _cameraConnectionType: () => "frigate_go2rtc",
    _currentLiveStreamHint: () => "webrtc",
    _preferredStreamType: () => "webrtc",
    _gridCellSeverity: () => "",
    _findVideoDeep: (root) => {
      if (root === target) return secondaryVideo;
      if (root?.id === "engine") return primaryVideo;
      return null;
    },
    _gridMediaController: {
      mountCameraCellMedia: (element, options) => {
        mounts.push([element, options]);
        return true;
      },
    },
    _$(selector) {
      if (selector === "#eng-wrap") return wrap;
      if (selector === "#camera-group-secondary-engine") return target;
      if (selector === "#engine") return { id: "engine" };
      if (selector.includes('data-camera-group-member="A"')) {
        return primaryPane;
      }
      if (selector.includes('data-camera-group-member="B"')) {
        return secondaryPane;
      }
      return null;
    },
  };
  return {
    host,
    mounts,
    primaryVideo,
    secondaryVideo,
    primaryPane,
    secondaryPane,
    wrap,
  };
};

test("grouped live shell exposes audio, focus, and phone member controls", () => {
  const markup = buildLiveEngineWrapMarkup({
    icons: {
      live: "live",
      chevron: "chevron",
      volOn: "vol-on",
      volOff: "vol-off",
      singleView: "single",
    },
  });

  assert.match(markup, /data-camera-group-audio="A"/);
  assert.match(markup, /data-camera-group-focus="A"/);
  assert.match(markup, /data-camera-group-focus="B"/);
  assert.match(markup, /data-camera-group-mobile-toggle/);
  assert.match(
    markup,
    /data-media-overlay-ignore data-camera-group-mobile-toggle/,
  );
});

test("grouped live mounts the second physical camera on tablet and desktop", () => {
  const { host, mounts, secondaryPane, wrap } = createHost();
  const controller = new CameraGroupLiveController(host);

  controller.sync();

  assert.equal(controller.isActive(), true);
  assert.equal(secondaryPane.hidden, false);
  assert.equal(wrap.classList.contains("camera-group-live"), true);
  assert.equal(
    wrap.classList.contains("camera-group-live--side-by-side"),
    true,
  );
  assert.equal(mounts.length, 1);
  assert.equal(mounts[0][1].entity, "camera.package");
  assert.equal(mounts[0][1].useLive, true);
  assert.equal(mounts[0][1].snapshotPlaceholderWhileLive, true);
});

test("active video prefers the committed engine over a hidden race candidate", () => {
  const { host, primaryVideo } = createHost();
  const committedVideo = { id: "committed-video" };
  host._engine = { video: committedVideo };
  const controller = new CameraGroupLiveController(host);

  assert.equal(controller.activeVideo(), committedVideo);
  assert.notEqual(controller.activeVideo(), primaryVideo);
});

test("active B video prefers its committed zoom target over a hidden race candidate", () => {
  const { host, secondaryVideo } = createHost();
  const committedVideo = { id: "committed-secondary-video" };
  const controller = new CameraGroupLiveController(host);
  controller._activeAudioMember = "B";
  controller._secondaryZoom = { video: committedVideo };

  assert.equal(controller.activeVideo(), committedVideo);
  assert.notEqual(controller.activeVideo(), secondaryVideo);
});

test("phones keep only the main camera live", () => {
  const { host, mounts } = createHost();
  host._isLikelyPhoneClient = () => true;
  const controller = new CameraGroupLiveController(host);

  controller.sync();

  assert.equal(controller.isActive(), false);
  assert.equal(mounts.length, 0);
});

test("A/B audio selection keeps exactly one pane audible and follows mute", () => {
  const { host, primaryVideo, secondaryVideo } = createHost();
  const controller = new CameraGroupLiveController(host);

  controller.setActiveAudioMember("B");
  assert.equal(primaryVideo.muted, true);
  assert.equal(secondaryVideo.muted, false);

  host._streamMuted = true;
  controller.syncAudio();
  assert.equal(primaryVideo.muted, true);
  assert.equal(secondaryVideo.muted, true);
});

test("pane focus expands one member, takes audio, and does not remount", () => {
  const { host, mounts, primaryVideo, secondaryVideo, wrap } = createHost();
  const controller = new CameraGroupLiveController(host, {
    icons: { singleView: "single", cameraGroupSplit: "split" },
  });

  controller.sync();
  assert.equal(controller.toggleFocusedMember("B"), true);
  assert.equal(controller.focusedMember, "B");
  assert.equal(controller.activeAudioMember, "B");
  assert.equal(primaryVideo.muted, true);
  assert.equal(secondaryVideo.muted, false);
  assert.equal(wrap.classList.contains("camera-group-live--focus-b"), true);
  assert.equal(mounts.length, 1);

  controller.toggleFocusedMember("B");
  assert.equal(controller.focusedMember, "");
  assert.equal(controller.activeAudioMember, "B");
  assert.equal(wrap.classList.contains("camera-group-live--focus-b"), false);
  assert.equal(mounts.length, 1);
});

test("phones expose a one-stream A/B member switch", () => {
  const { host, mounts, wrap } = createHost();
  const switches = [];
  host._activeCamIdx = 3;
  host._isLikelyPhoneClient = () => true;
  host._switchCamera = (index, options) => switches.push([index, options]);
  const controller = new CameraGroupLiveController(host);

  controller.sync();
  assert.equal(controller.isActive(), false);
  assert.equal(wrap.classList.contains("camera-group-mobile-member"), true);
  assert.equal(mounts.length, 0);

  assert.equal(controller.toggleMobileMember(), true);
  assert.deepEqual(switches[0], [
    3,
    {
      source: "manual",
      groupMemberEntity: "camera.package",
    },
  ]);

  host._activeGroupMemberOverride = "camera.package";
  controller.toggleMobileMember();
  assert.deepEqual(switches[1], [
    3,
    {
      source: "manual",
      groupMemberEntity: "",
    },
  ]);
});

test("leaving grid restores the grouped secondary live connection", () => {
  const { host, mounts, secondaryPane } = createHost();
  const controller = new CameraGroupLiveController(host);

  controller.sync();
  host._viewMode = "grid";
  controller.sync();
  assert.equal(secondaryPane.hidden, true);

  host._viewMode = "single";
  controller.sync({ force: true });
  assert.equal(secondaryPane.hidden, false);
  assert.equal(mounts.length, 2);
});

test("grouped snapshots compose both displayed panes into one frame", async () => {
  const { host, primaryVideo, secondaryVideo } = createHost();
  const drawCalls = [];
  const blob = { type: "image/jpeg" };
  const canvas = {
    width: 0,
    height: 0,
    getContext: () => ({
      fillRect: () => {},
      drawImage: (...args) => drawCalls.push(args),
    }),
    toBlob: (callback) => callback(blob),
  };
  const controller = new CameraGroupLiveController(host);

  const result = await controller.captureDisplayedFrame({
    documentObj: { createElement: () => canvas },
    styleResolver: () => ({
      objectFit: "contain",
      backgroundColor: "rgb(17, 17, 17)",
    }),
  });

  assert.equal(result, blob);
  assert.equal(canvas.width, 3200);
  assert.equal(canvas.height, 1800);
  assert.equal(drawCalls.length, 2);
  assert.equal(drawCalls[0][0], primaryVideo);
  assert.equal(drawCalls[1][0], secondaryVideo);
  assert.equal(drawCalls[1][5], 1600);
});

test("focused grouped snapshots capture only the displayed member", async () => {
  const { host, primaryVideo, primaryPane } = createHost();
  primaryPane.getBoundingClientRect = () => ({
    left: 0,
    top: 0,
    width: 800,
    height: 450,
  });
  const drawCalls = [];
  const canvas = {
    width: 0,
    height: 0,
    getContext: () => ({
      fillRect: () => {},
      drawImage: (...args) => drawCalls.push(args),
    }),
    toBlob: (callback) => callback({ type: "image/jpeg" }),
  };
  const controller = new CameraGroupLiveController(host);
  controller.sync();
  controller.toggleFocusedMember("A");

  await controller.captureDisplayedFrame({
    documentObj: { createElement: () => canvas },
    styleResolver: () => ({
      objectFit: "contain",
      backgroundColor: "rgb(17, 17, 17)",
    }),
  });

  assert.equal(drawCalls.length, 1);
  assert.equal(drawCalls[0][0], primaryVideo);
  assert.equal(canvas.width, 1920);
  assert.equal(canvas.height, 1080);
});
