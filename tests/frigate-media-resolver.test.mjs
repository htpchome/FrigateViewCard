import assert from "node:assert/strict";
import { test } from "node:test";

import { FrigateMediaResolverController } from "../src/integrations/frigate/media-resolver.ctrl.js";

const createHarness = () => {
  const activeContext = { clientId: "active-client", cam: "front" };
  const drivewayContext = {
    clientId: "driveway-client",
    cam: "driveway_frigate",
  };
  const host = {
    _camCache: {
      "camera.front": activeContext,
      "camera.driveway": drivewayContext,
    },
    _cc: () => activeContext,
    _config: {
      cameras: [
        { entity: "camera.front" },
        { entity: "camera.driveway" },
      ],
    },
    _hass: {
      config: { internal_url: "https://ha.local" },
    },
    _signed: async (path) => `/signed${path}`,
  };
  return {
    activeContext,
    controller: new FrigateMediaResolverController(host),
    drivewayContext,
  };
};

test("Frigate media resolver finds contexts by Frigate camera or HA entity", () => {
  const { controller, drivewayContext } = createHarness();

  assert.equal(
    controller.contextForCameraName("driveway_frigate"),
    drivewayContext,
  );
  assert.equal(
    controller.contextForCameraName("camera.driveway"),
    drivewayContext,
  );
  assert.equal(controller.contextForCameraName("missing"), null);
  assert.equal(controller.contextForCameraName(""), null);
});

test("Frigate media resolver builds active and camera-specific event paths", () => {
  const { controller } = createHarness();

  assert.equal(
    controller.notificationMediaPath("event 1", "clip.mp4", true),
    "/api/frigate/active-client/notifications/event%201/clip.mp4?download=true",
  );
  assert.equal(
    controller.notificationMediaPathForCamera(
      "event-2",
      "snapshot.jpg",
      "driveway_frigate",
    ),
    "/api/frigate/driveway-client/notifications/event-2/snapshot.jpg",
  );
  assert.equal(
    controller.notificationMediaPathForCamera(
      "event-3",
      "thumbnail.jpg",
      "missing",
    ),
    "/api/frigate/active-client/notifications/event-3/thumbnail.jpg",
  );
});

test("Frigate media resolver builds review thumbnails for the selected camera", () => {
  const { controller } = createHarness();

  assert.equal(
    controller.reviewThumbnailPath(
      { id: "review-1", camera: "driveway_frigate" },
    ),
    "/api/frigate/driveway-client/notifications/review-1/driveway_frigate/review_thumbnail.webp",
  );
  assert.equal(controller.reviewThumbnailPath({ id: "review-2" }), "");
});

test("Frigate media resolver prepares signed receiver playback sources", async () => {
  const { controller } = createHarness();

  assert.deepEqual(
    await controller.receiverPlaybackSource({
      mediaType: "clip",
      clientId: "active-client",
      eventId: "event-1",
      title: "Clip video",
    }),
    {
      ok: true,
      url: "https://ha.local/signed/api/frigate/active-client/notifications/event-1/clip.mp4",
      contentType: "video/mp4",
      title: "Clip video",
      ttlMs: 30 * 60 * 1000,
    },
  );
  assert.deepEqual(
    await controller.receiverPlaybackSource({ mediaType: "snapshot" }),
    {
      ok: false,
      message: "The Frigate client is not available for this video.",
    },
  );
});

test("Frigate media resolver maps popup state to receiver playback context", () => {
  const { controller } = createHarness();

  assert.deepEqual(
    controller.receiverPlaybackContext({
      activeContext: { clientId: "frigate", cam: "front" },
      mediaType: "clip",
      playing: {
        id: "event-1",
        eventRecordingStart: 101,
        eventRecordingEnd: 205,
      },
      event: {
        camera: "front_door",
        start_time: 100.2,
        end_time: 205.8,
      },
      title: "Clip video",
    }),
    {
      scope: "popup",
      sourceKey: "clip:frigate:event-1",
      mediaType: "clip",
      clientId: "frigate",
      camera: "front_door",
      eventId: "event-1",
      recordingStart: null,
      recordingEnd: null,
      eventRecordingStart: 101,
      eventRecordingEnd: 205,
      title: "Clip video",
    },
  );
  assert.deepEqual(
    controller.receiverPlaybackContext({
      activeContext: { clientId: "frigate", cam: "front" },
      mediaType: "recording",
      playing: { rec: 300 },
      recordingRange: { start: 320, end: 380 },
      title: "Recording video",
    }),
    {
      scope: "popup",
      sourceKey: "recording:frigate:front:320:380",
      mediaType: "recording",
      clientId: "frigate",
      camera: "front",
      eventId: "",
      recordingStart: 320,
      recordingEnd: 380,
      eventRecordingStart: null,
      eventRecordingEnd: null,
      title: "Recording video",
    },
  );
});
