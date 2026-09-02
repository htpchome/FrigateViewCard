import { test } from "node:test";
import assert from "node:assert/strict";

import {
  BrowserPlaybackTargetController,
  PLAYBACK_TARGET_AIRPLAY,
  configureReceiverVideo,
  promptAirPlayVideo,
  resolveBrowserPlaybackTargetSupport,
} from "../src/shared/media/playback-target.js";
import { buildFrigateReceiverMediaPath } from "../src/integrations/frigate/receiver-media.js";
import { resolveAbsoluteReceiverSourceUrl } from "../src/integrations/home-assistant/receiver-source.js";

function createFakeVideo({ airplay = false } = {}) {
  const attributes = new Map();
  const listeners = new Map();
  const video = {
    src: "",
    srcObject: { active: true },
    preload: "",
    controls: true,
    playsInline: false,
    disableRemotePlayback: true,
    style: { cssText: "" },
    loadCalls: 0,
    playCalls: 0,
    removed: false,
    setAttribute(name, value) {
      attributes.set(name, String(value));
    },
    removeAttribute(name) {
      attributes.delete(name);
      if (name === "src") this.src = "";
    },
    getAttribute(name) {
      return attributes.get(name);
    },
    hasAttribute(name) {
      return attributes.has(name);
    },
    load() {
      this.loadCalls += 1;
    },
    play() {
      this.playCalls += 1;
      return Promise.resolve();
    },
    pause() {},
    addEventListener(type, handler) {
      listeners.set(type, handler);
    },
    removeEventListener(type) {
      listeners.delete(type);
    },
    dispatch(type) {
      listeners.get(type)?.();
    },
    remove() {
      this.removed = true;
    },
  };
  if (airplay) {
    video.webkitShowPlaybackTargetPicker = () => {
      video.airplayPrompted = true;
    };
  }
  return video;
}

test("browser target support detects AirPlay capability", () => {
  const airplayVideo = createFakeVideo({ airplay: true });
  assert.deepEqual(
    resolveBrowserPlaybackTargetSupport({
      video: airplayVideo,
      windowObj: {},
    }),
    { airplay: true },
  );
  assert.equal(
    resolveBrowserPlaybackTargetSupport({
      windowObj: {
        HTMLVideoElement: {
          prototype: { webkitShowPlaybackTargetPicker() {} },
        },
      },
    }).airplay,
    true,
  );
  assert.equal(
    resolveBrowserPlaybackTargetSupport({ windowObj: {} }).airplay,
    false,
  );
});

test("AirPlay uses a dedicated prepared video instead of the displayed stream", () => {
  const video = createFakeVideo({ airplay: true });
  const source = {
    url: "https://ha.local/api/frigate/client/notifications/event/clip.mp4",
  };

  assert.equal(configureReceiverVideo(video, source), true);
  assert.equal(video.src, source.url);
  assert.equal(video.preload, "none");
  assert.equal(video.controls, false);
  assert.equal(video.disableRemotePlayback, false);
  assert.equal(video.hasAttribute("x-webkit-airplay"), true);
  assert.equal(video.loadCalls, 0);
  assert.equal(promptAirPlayVideo(video), true);
  assert.equal(video.loadCalls, 1);
  assert.equal(video.playCalls, 0);
  assert.equal(video.airplayPrompted, true);
});

test("receiver URL resolution rejects browser-local blobs", () => {
  assert.equal(
    resolveAbsoluteReceiverSourceUrl(
      "blob:browser-only",
      "https://ha.local",
    ),
    "",
  );
});

test("Frigate stored receiver paths always use MP4", () => {
  assert.deepEqual(
    buildFrigateReceiverMediaPath({
      mediaType: "clip",
      clientId: "frigate main",
      eventId: "event/1",
    }),
    {
      ok: true,
      path:
        "/api/frigate/frigate%20main/notifications/event%2F1/clip.mp4",
      contentType: "video/mp4",
    },
  );
  assert.deepEqual(
    buildFrigateReceiverMediaPath({
      mediaType: "clip",
      clientId: "frigate",
      camera: "front door",
      eventId: "event-1",
      eventRecordingStart: 100,
      eventRecordingEnd: 200,
    }),
    {
      ok: true,
      path:
        "/api/frigate/frigate/recording/front%20door/start/100/end/200",
      contentType: "video/mp4",
    },
  );
  assert.deepEqual(
    buildFrigateReceiverMediaPath({
      mediaType: "recording",
      clientId: "frigate",
      camera: "front door",
      recordingStart: 100,
      recordingEnd: 200,
    }),
    {
      ok: true,
      path:
        "/api/frigate/frigate/recording/front%20door/start/100/end/200",
      contentType: "video/mp4",
    },
  );
});

test("controller prewarms popup AirPlay and tears down its wireless media session", async () => {
  const videos = [];
  const mounted = [];
  const airplayCalls = [];
  const sourceCalls = [];
  const mediaSession = {
    playbackState: "playing",
    metadata: { title: "Clip" },
  };
  const controller = new BrowserPlaybackTargetController({
    getContext: () => ({
      sourceKey: "clip:frigate:event-1",
      eventId: "event-1",
    }),
    resolveSource: async (context) => {
      sourceCalls.push(context.sourceKey);
      return {
        url: `https://ha.local/${context.sourceKey}.mp4`,
        contentType: "video/mp4",
      };
    },
    getMount: () => ({
      appendChild: (video) => mounted.push(video),
    }),
    createVideo: () => {
      const video = createFakeVideo({ airplay: true });
      videos.push(video);
      return video;
    },
    promptAirPlay: (video) => {
      airplayCalls.push(video);
      return true;
    },
    getWindow: () => ({}),
    getNavigator: () => ({ mediaSession }),
  });

  await controller.prepare("popup");
  await controller.prepare("popup");
  assert.deepEqual(sourceCalls, ["clip:frigate:event-1"]);
  assert.equal(mounted.length, 0);
  assert.equal(videos.length, 0);
  assert.equal(
    await controller.prompt(PLAYBACK_TARGET_AIRPLAY, { scope: "popup" }),
    true,
  );
  assert.equal(
    airplayCalls[0].src,
    "https://ha.local/clip:frigate:event-1.mp4",
  );
  assert.equal(mounted.length, 1);

  airplayCalls[0].webkitCurrentPlaybackTargetIsWireless = true;
  airplayCalls[0].dispatch(
    "webkitcurrentplaybacktargetiswirelesschanged",
  );
  assert.equal(airplayCalls[0].playCalls, 1);
  airplayCalls[0].dispatch("canplay");
  assert.equal(airplayCalls[0].playCalls, 2);

  controller.release("popup");
  assert.equal(airplayCalls[0].removed, true);
  assert.equal(airplayCalls[0].disableRemotePlayback, true);
  assert.equal(airplayCalls[0].srcObject, null);
  assert.equal(
    airplayCalls[0].getAttribute("x-webkit-airplay"),
    "deny",
  );
  assert.equal(mediaSession.playbackState, "none");
  assert.equal(mediaSession.metadata, null);

  controller.dispose();
  assert.equal(videos.every((video) => video.removed), true);
});

test("controller reports AirPlay source preparation failures", async () => {
  const statuses = [];
  const controller = new BrowserPlaybackTargetController({
    getContext: () => ({ sourceKey: "clip:frigate:event-1" }),
    resolveSource: async () => ({
      message: "AirPlay video is unavailable.",
    }),
    createVideo: () => createFakeVideo(),
    onStatus: (message) => statuses.push(message),
  });

  assert.equal(
    await controller.prompt(PLAYBACK_TARGET_AIRPLAY, { scope: "popup" }),
    false,
  );
  assert.match(statuses[0], /Preparing video for AirPlay/);
  await controller.prepare("popup", { notifyErrors: true });
  assert.match(statuses.at(-1), /AirPlay video is unavailable/);
  controller.dispose();
});
