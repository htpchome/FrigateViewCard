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
