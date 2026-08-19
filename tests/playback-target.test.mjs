import { test } from "node:test";
import assert from "node:assert/strict";

import {
  BrowserPlaybackTargetController,
  PLAYBACK_TARGET_AIRPLAY,
  PLAYBACK_TARGET_CAST,
  buildGoogleCastLoadRequest,
  configureGoogleCastFramework,
  configureReceiverVideo,
  promptAirPlayVideo,
  promptGoogleCastSource,
  resolveBrowserPlaybackTargetSupport,
} from "../src/shared/media/playback-target.js";
import { buildFrigateReceiverMediaPath } from "../src/integrations/frigate/receiver-media.js";
import {
  resolveAbsoluteReceiverSourceUrl,
  resolveHomeAssistantCameraHlsSource,
} from "../src/integrations/home-assistant/receiver-source.js";

function createFakeVideo({ airplay = false } = {}) {
  const attributes = new Map();
  const listeners = new Map();
  const video = {
    src: "",
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

function createCastWindow() {
  const calls = {
    options: [],
    loads: [],
    sessions: 0,
  };
  class MediaInfo {
    constructor(contentId, contentType) {
      this.contentId = contentId;
      this.contentType = contentType;
    }
  }
  class LoadRequest {
    constructor(mediaInfo) {
      this.mediaInfo = mediaInfo;
      this.autoplay = false;
    }
  }
  class GenericMediaMetadata {}
  const session = {
    loadMedia: async (request) => {
      calls.loads.push(request);
    },
  };
  const castContext = {
    setOptions: (options) => calls.options.push(options),
    getCurrentSession: () => session,
    requestSession: async () => {
      calls.sessions += 1;
    },
  };
  const windowObj = {
    cast: {
      framework: {
        CastContext: {
          getInstance: () => castContext,
        },
      },
    },
    chrome: {
      cast: {
        AutoJoinPolicy: { ORIGIN_SCOPED: "origin" },
        media: {
          DEFAULT_MEDIA_RECEIVER_APP_ID: "default-app",
          GenericMediaMetadata,
          LoadRequest,
          MediaInfo,
          StreamType: { LIVE: "LIVE" },
        },
      },
    },
  };
  return { windowObj, calls, session };
}

test("browser target support separates Cast and AirPlay capabilities", () => {
  const airplayVideo = createFakeVideo({ airplay: true });
  assert.deepEqual(
    resolveBrowserPlaybackTargetSupport({
      video: airplayVideo,
      windowObj: {},
      navigatorObj: { userAgent: "iPhone" },
      castFrameworkReady: false,
    }),
    {
      airplay: true,
      cast: false,
      frameworkAvailable: false,
      likelyCastBrowser: false,
    },
  );

  assert.equal(
    resolveBrowserPlaybackTargetSupport({
      video: createFakeVideo(),
      windowObj: { chrome: {} },
      navigatorObj: { userAgent: "Chrome" },
      castFrameworkReady: false,
    }).cast,
    false,
  );
  assert.equal(
    resolveBrowserPlaybackTargetSupport({
      windowObj: { chrome: {} },
      navigatorObj: { userAgent: "Mozilla/5.0 Edg/140.0" },
    }).cast,
    false,
  );
  const { windowObj: edgeCastWindow } = createCastWindow();
  assert.equal(
    resolveBrowserPlaybackTargetSupport({
      windowObj: edgeCastWindow,
      navigatorObj: { userAgent: "Mozilla/5.0 Edg/140.0" },
    }).cast,
    false,
  );
  assert.equal(
    resolveBrowserPlaybackTargetSupport({
      windowObj: {
        HTMLVideoElement: {
          prototype: { webkitShowPlaybackTargetPicker() {} },
        },
      },
      navigatorObj: { userAgent: "iPhone" },
      castFrameworkReady: false,
    }).airplay,
    true,
  );
});

test("Google Cast request uses the default receiver and receiver media URL", async () => {
  const { windowObj, calls } = createCastWindow();
  assert.equal(configureGoogleCastFramework(windowObj), true);
  assert.deepEqual(calls.options, [
    {
      receiverApplicationId: "default-app",
      autoJoinPolicy: "origin",
    },
  ]);

  const source = {
    url: "https://ha.local/api/hls/token/playlist.m3u8",
    contentType: "application/vnd.apple.mpegurl",
    streamType: "LIVE",
    title: "Front Door",
  };
  const request = buildGoogleCastLoadRequest({ source, windowObj });
  assert.equal(request.mediaInfo.contentId, source.url);
  assert.equal(request.mediaInfo.contentType, source.contentType);
  assert.equal(request.mediaInfo.streamType, "LIVE");
  assert.equal(request.mediaInfo.metadata.title, "Front Door");
  assert.equal(request.autoplay, true);

  assert.equal(
    await promptGoogleCastSource({ source, windowObj }),
    true,
  );
  assert.equal(calls.loads.length, 1);
  assert.equal(calls.loads[0].mediaInfo.contentId, source.url);
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

test("Home Assistant camera stream returns receiver-addressable HLS", async () => {
  const calls = [];
  const source = await resolveHomeAssistantCameraHlsSource({
    hass: {
      callWS: async (message) => {
        calls.push(message);
        return { url: "/api/hls/token/playlist.m3u8" };
      },
    },
    cameraEntity: "camera.front",
    baseUrl: "https://ha.local/lovelace/cameras",
  });

  assert.deepEqual(calls, [
    {
      type: "camera/stream",
      entity_id: "camera.front",
      format: "hls",
    },
  ]);
  assert.deepEqual(source, {
    ok: true,
    url: "https://ha.local/api/hls/token/playlist.m3u8",
    contentType: "application/vnd.apple.mpegurl",
    streamType: "LIVE",
    ttlMs: 240000,
  });
  assert.equal(
    resolveAbsoluteReceiverSourceUrl("blob:browser-only", "https://ha.local"),
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

test("controller prewarms sources and prompts without HA media-player services", async () => {
  const videos = [];
  const mounted = [];
  const castCalls = [];
  const airplayCalls = [];
  const sourceCalls = [];
  const contexts = {
    live: {
      sourceKey: "live:camera.front",
      cameraEntity: "camera.front",
    },
    popup: {
      sourceKey: "clip:frigate:event-1",
      eventId: "event-1",
    },
  };
  const controller = new BrowserPlaybackTargetController({
    getContext: (scope) => contexts[scope],
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
    prepareCast: async () => true,
    promptCast: async (source) => {
      castCalls.push({ source });
      return true;
    },
    promptAirPlay: (video) => {
      airplayCalls.push(video);
      return true;
    },
    getWindow: () => ({ chrome: {} }),
    getNavigator: () => ({ userAgent: "Chrome" }),
  });

  await controller.prepare("live");
  await controller.prepare("live");
  assert.deepEqual(sourceCalls, ["live:camera.front"]);
  assert.equal(mounted.length, 0);
  assert.equal(videos.length, 0);
  assert.equal(await controller.prompt(PLAYBACK_TARGET_CAST), true);
  assert.equal(castCalls[0].source.url, "https://ha.local/live:camera.front.mp4");
  assert.equal(mounted.length, 0);

  await controller.prepare("popup");
  assert.equal(
    await controller.prompt(PLAYBACK_TARGET_AIRPLAY, { scope: "popup" }),
    true,
  );
  assert.equal(airplayCalls[0].src, "https://ha.local/clip:frigate:event-1.mp4");
  assert.equal(mounted.length, 1);

  airplayCalls[0].webkitCurrentPlaybackTargetIsWireless = true;
  airplayCalls[0].dispatch(
    "webkitcurrentplaybacktargetiswirelesschanged",
  );
  assert.equal(airplayCalls[0].playCalls, 1);
  airplayCalls[0].dispatch("canplay");
  assert.equal(airplayCalls[0].playCalls, 2);

  airplayCalls[0].webkitCurrentPlaybackTargetIsWireless = false;
  airplayCalls[0].dispatch(
    "webkitcurrentplaybacktargetiswirelesschanged",
  );
  assert.equal(airplayCalls[0].removed, true);

  controller.dispose();
  assert.equal(videos.every((video) => video.removed), true);
});

test("controller reports preparation and unsupported playback states", async () => {
  const statuses = [];
  const controller = new BrowserPlaybackTargetController({
    getContext: () => ({ sourceKey: "live:camera.front" }),
    resolveSource: async () => ({
      message: "Live HLS is unavailable.",
    }),
    createVideo: () => createFakeVideo(),
    prepareCast: async () => false,
    promptCast: async () => false,
    onStatus: (message) => statuses.push(message),
  });

  assert.equal(
    await controller.prompt(PLAYBACK_TARGET_CAST),
    false,
  );
  assert.match(statuses[0], /Preparing video for Cast/);
  await controller.prepare("live", { notifyErrors: true });
  assert.match(statuses.at(-1), /Live HLS is unavailable/);
  controller.dispose();
});
