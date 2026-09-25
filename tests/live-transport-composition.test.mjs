import { test } from "node:test";
import assert from "node:assert/strict";

import { createLiveTransportControllers } from "../src/features/live/transport-composition.js";
import { attachContainedVideoFit } from "../src/shared/media/video-fit.js";

test("live transport composition keeps go2rtc and HA Direct stacks explicit", async () => {
  const optionsByFactory = {};
  const createFactory = (name, result = { name }) => (options) => {
    optionsByFactory[name] = options;
    return result;
  };
  const resolver = {
    name: "go2rtc-resolver",
    websocketUrlForEntity: (entity) => `wss://example/${entity}`,
  };
  const factories = {
    createGo2RtcResolver: createFactory("go2rtcResolver", resolver),
    createGo2RtcTwoWayTalkBackchannel: createFactory(
      "go2rtcTwoWayTalkBackchannel",
    ),
    createGo2RtcMounter: createFactory("go2rtcMounter"),
    createHaDirectMounter: createFactory("haDirectMounter"),
    createHaDirectTwoWayTalkMounter: createFactory(
      "haDirectTwoWayTalkMounter",
    ),
    createHaDirectTwoWayTalkBackchannel: createFactory(
      "haDirectTwoWayTalkBackchannel",
    ),
    createGo2RtcRaceMounter: createFactory("go2rtcRaceMounter"),
  };
  const calls = [];
  const engineHost = { id: "engine" };
  const shadowRoot = {
    appendChild: (node) => calls.push(["append-audio", node]),
  };
  const card = {
    shadowRoot,
    _hass: { language: "en" },
    _config: { cameras: [] },
    _activeCam: { entity: "camera.front" },
    _camCache: {},
    _streamMuted: true,
    _rotateOverlayActive: false,
    _mountSeq: 7,
    _pendingMountDestroyers: [],
    _pendingWebRTCTakeoverTimer: null,
    _mseChunkCount: 0,
    _$: (selector) => (selector === "#engine" ? engineHost : null),
    _discoverOne: async (entity) => calls.push(["discover", entity]),
    _supportsNativeHlsPlayback: () => true,
    _preferredStreamType: () => "webrtc",
    _findVideoDeep: () => null,
    _assignLiveEngine: (...args) => calls.push(["assign-engine", ...args]),
    _setActiveStreamType: (type) => calls.push(["stream-type", type]),
    _setStreamLoading: (loading) => calls.push(["loading", loading]),
    _setStreamFallbackVisible: (visible) =>
      calls.push(["fallback", visible]),
    _scheduleResumeLive: (reason) => calls.push(["resume", reason]),
    _isFirefox: () => false,
    _attachMainLiveVideoZoom: (...args) => calls.push(["zoom", ...args]),
    _applyResolvedStreamUiState: (state) => calls.push(["ui-state", state]),
    _setLiveNativeControls: (enabled) =>
      calls.push(["native-controls", enabled]),
    _cameraConnectionType: (entity) =>
      entity === "camera.ha" ? "ha_direct" : "frigate_go2rtc",
  };

  const controllers = createLiveTransportControllers(card, {
    deviceProfile: { isMobile: true },
    factories,
  });

  assert.deepEqual(Object.keys(controllers), [
    "_go2rtcResolver",
    "_go2rtcTwoWayTalkBackchannel",
    "_go2rtcMounter",
    "_haDirectMounter",
    "_haDirectTwoWayTalkMounter",
    "_haDirectTwoWayTalkBackchannel",
    "_go2rtcRaceMounter",
  ]);
  assert.strictEqual(controllers._go2rtcResolver, resolver);
  assert.strictEqual(optionsByFactory.go2rtcMounter.resolver, resolver);
  assert.strictEqual(
    optionsByFactory.go2rtcRaceMounter.mounter,
    controllers._go2rtcMounter,
  );
  assert.strictEqual(optionsByFactory.go2rtcMounter.scopeKey, card);
  assert.strictEqual(
    optionsByFactory.go2rtcMounter.attachVideoFit,
    attachContainedVideoFit,
  );
  assert.strictEqual(
    optionsByFactory.haDirectTwoWayTalkMounter.attachVideoFit,
    attachContainedVideoFit,
  );
  assert.strictEqual(optionsByFactory.haDirectMounter.scopeKey, card);
  assert.equal(optionsByFactory.go2rtcRaceMounter.isMobile, true);
  assert.equal(optionsByFactory.go2rtcRaceMounter.isMountTokenCurrent(7), true);
  assert.equal(optionsByFactory.go2rtcRaceMounter.isMountTokenCurrent(6), false);
  assert.equal(
    optionsByFactory.go2rtcRaceMounter.resolveConnectionType("camera.ha"),
    "ha_direct",
  );
  assert.equal(
    optionsByFactory.go2rtcTwoWayTalkBackchannel.resolveWebSocketUrl(
      "camera.front",
    ),
    "wss://example/camera.front",
  );

  optionsByFactory.go2rtcMounter.onCommittedStream("mse");
  assert.deepEqual(calls.slice(-3), [
    ["stream-type", "mse"],
    ["loading", false],
    ["fallback", false],
  ]);
  optionsByFactory.haDirectMounter.onCommittedStream("hls");
  assert.deepEqual(calls.slice(-3), [
    ["stream-type", "hls"],
    ["loading", false],
    ["fallback", false],
  ]);
  optionsByFactory.haDirectMounter.onCommittedMediaReady(
    "ha-engine",
    "ha-video",
  );
  assert.deepEqual(calls.at(-1), [
    "zoom",
    "ha-engine",
    "ha-video",
    { host: engineHost, interactionTarget: engineHost },
  ]);

  optionsByFactory.go2rtcMounter.resetMseDiagnostics(100);
  optionsByFactory.go2rtcMounter.markMseChunk(125);
  assert.equal(card._mseConnectAt, 100);
  assert.equal(card._mseLastChunkAt, 125);
  assert.equal(card._mseChunkCount, 1);

  await optionsByFactory.go2rtcResolver.discoverEntity("camera.front");
  assert.deepEqual(calls.at(-1), ["discover", "camera.front"]);

  let removed = false;
  const audio = {
    dataset: {},
    remove: () => {
      removed = true;
    },
  };
  const releaseAudio =
    optionsByFactory.haDirectTwoWayTalkBackchannel.mountIncomingAudio(audio);
  assert.equal(audio.dataset.fvcTwoWayTalkAudio, "");
  assert.deepEqual(calls.at(-1), ["append-audio", audio]);
  releaseAudio();
  assert.equal(removed, true);
});
