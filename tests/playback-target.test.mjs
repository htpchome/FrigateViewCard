import { test } from "node:test";
import assert from "node:assert/strict";

import {
  buildPlaybackTargetListMarkup,
  PLAYBACK_TARGET_AIRPLAY,
  PLAYBACK_TARGET_CAST,
  PlaybackTargetController,
} from "../src/card/controls/playback-target.ctrl.js";
import { buildFrigateReceiverMediaPath } from "../src/integrations/frigate/receiver-media.js";
import {
  buildHomeAssistantCameraStreamRequest,
  buildHomeAssistantMediaRequest,
  resolveHomeAssistantMediaPlayers,
  resolveHomeAssistantReceiverUrl,
} from "../src/integrations/home-assistant/receiver-playback.js";

function createDialog() {
  const title = { textContent: "" };
  const description = { textContent: "" };
  const list = { innerHTML: "" };
  const status = { hidden: true, textContent: "" };
  const option = {
    dataset: { playbackTargetEntity: "media_player.living_room" },
    disabled: false,
    focus() {},
  };
  const nodes = new Map([
    ["[data-playback-target-title]", title],
    ["[data-playback-target-description]", description],
    ["[data-playback-target-list]", list],
    ["[data-playback-target-status]", status],
    ["[data-playback-target-entity]", option],
  ]);
  return {
    dialog: {
      hidden: true,
      querySelector: (selector) => nodes.get(selector) || null,
      querySelectorAll: (selector) =>
        selector === "[data-playback-target-entity]" ? [option] : [],
    },
    title,
    description,
    list,
    status,
    option,
  };
}

test("Home Assistant media players exclude unavailable entities and sort by name", () => {
  const players = resolveHomeAssistantMediaPlayers({
    "camera.front": { state: "streaming" },
    "media_player.tv": {
      state: "idle",
      attributes: { friendly_name: "Living Room" },
    },
    "media_player.office": {
      state: "off",
      attributes: { friendly_name: "Apple TV" },
    },
    "media_player.old": {
      state: "unavailable",
      attributes: { friendly_name: "Old TV" },
    },
  });

  assert.deepEqual(players, [
    {
      entityId: "media_player.office",
      name: "Apple TV",
      state: "off",
    },
    {
      entityId: "media_player.tv",
      name: "Living Room",
      state: "idle",
    },
  ]);
});

test("Home Assistant live playback uses camera.play_stream", () => {
  assert.deepEqual(
    buildHomeAssistantCameraStreamRequest({
      cameraEntity: "camera.front",
      mediaPlayerEntity: "media_player.tv",
    }),
    {
      domain: "camera",
      service: "play_stream",
      serviceData: {
        media_player: "media_player.tv",
      },
      target: {
        entity_id: "camera.front",
      },
    },
  );
});

test("Home Assistant file playback sends an absolute MP4 URL", () => {
  const mediaUrl = resolveHomeAssistantReceiverUrl(
    "/api/frigate/client/notifications/event/clip.mp4?authSig=abc",
    "https://ha.example/lovelace/cameras",
  );
  assert.equal(
    mediaUrl,
    "https://ha.example/api/frigate/client/notifications/event/clip.mp4?authSig=abc",
  );
  assert.deepEqual(
    buildHomeAssistantMediaRequest({
      mediaPlayerEntity: "media_player.tv",
      mediaUrl,
    }),
    {
      domain: "media_player",
      service: "play_media",
      serviceData: {
        media_content_id: mediaUrl,
        media_content_type: "video/mp4",
      },
      target: {
        entity_id: "media_player.tv",
      },
    },
  );
});

test("Frigate receiver paths always use MP4 for events and recordings", () => {
  assert.deepEqual(
    buildFrigateReceiverMediaPath({
      mediaType: "alert",
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

test("destination markup escapes Home Assistant entity labels", () => {
  const markup = buildPlaybackTargetListMarkup([
    {
      entityId: "media_player.tv&quot; onclick=&quot;bad",
      name: "<Living & Room>",
      state: "idle",
    },
  ]);
  assert.match(markup, /&lt;Living &amp; Room&gt;/);
  assert.doesNotMatch(markup, /<Living/);
});

test("controller sends live video independently through Home Assistant", async () => {
  const ui = createDialog();
  const calls = [];
  const controller = new PlaybackTargetController({
    getDialog: () => ui.dialog,
    getStates: () => ({
      "media_player.living_room": {
        state: "idle",
        attributes: { friendly_name: "Living Room" },
      },
    }),
    getPlaybackContext: () => ({ cameraEntity: "camera.front" }),
    callService: async (...args) => calls.push(args),
  });

  assert.equal(
    controller.open({ target: PLAYBACK_TARGET_CAST, scope: "live" }),
    true,
  );
  assert.match(ui.title.textContent, /Cast through Home Assistant/);
  assert.match(ui.description.textContent, /separate Home Assistant HLS/);
  assert.equal(await controller._send("media_player.living_room"), true);
  assert.deepEqual(calls, [
    [
      "camera",
      "play_stream",
      { media_player: "media_player.living_room" },
      { entity_id: "camera.front" },
    ],
  ]);
  assert.equal(ui.status.textContent, "Sent to Living Room.");
  controller.dispose();
});

test("controller signs and sends MP4 even when local playback uses HLS", async () => {
  const ui = createDialog();
  const calls = [];
  const signedPaths = [];
  const controller = new PlaybackTargetController({
    getDialog: () => ui.dialog,
    getStates: () => ({
      "media_player.living_room": {
        state: "idle",
        attributes: { friendly_name: "Living Room" },
      },
    }),
    getPlaybackContext: () => ({
      mediaType: "clip",
      clientId: "frigate",
      eventId: "event-1",
    }),
    resolveMediaPath: buildFrigateReceiverMediaPath,
    signPath: async (path) => {
      signedPaths.push(path);
      return `${path}?authSig=abc`;
    },
    getBaseUrl: () => "https://ha.example/lovelace/cameras",
    callService: async (...args) => calls.push(args),
  });

  controller.open({ target: PLAYBACK_TARGET_AIRPLAY, scope: "popup" });
  assert.match(ui.title.textContent, /AirPlay through Home Assistant/);
  assert.match(ui.description.textContent, /MP4 video/);
  assert.equal(await controller._send("media_player.living_room"), true);
  assert.deepEqual(signedPaths, [
    "/api/frigate/frigate/notifications/event-1/clip.mp4",
  ]);
  assert.deepEqual(calls, [
    [
      "media_player",
      "play_media",
      {
        media_content_id:
          "https://ha.example/api/frigate/frigate/notifications/event-1/clip.mp4?authSig=abc",
        media_content_type: "video/mp4",
      },
      { entity_id: "media_player.living_room" },
    ],
  ]);
  controller.dispose();
});

test("controller reports unavailable recording range without calling HA", async () => {
  const ui = createDialog();
  const calls = [];
  const controller = new PlaybackTargetController({
    getDialog: () => ui.dialog,
    getStates: () => ({}),
    getPlaybackContext: () => ({
      mediaType: "recording",
      clientId: "frigate",
      camera: "front",
      recordingStart: 100,
      recordingEnd: null,
    }),
    resolveMediaPath: buildFrigateReceiverMediaPath,
    callService: async (...args) => calls.push(args),
  });

  controller.open({ target: PLAYBACK_TARGET_CAST, scope: "popup" });
  assert.equal(await controller._send("media_player.living_room"), false);
  assert.match(ui.status.textContent, /recording range is not ready/i);
  assert.deepEqual(calls, []);
  assert.equal(ui.option.disabled, false);
  controller.dispose();
});
