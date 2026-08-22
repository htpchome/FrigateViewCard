import test from "node:test";
import assert from "node:assert/strict";

import { FrigateMediaDownloadController } from "../src/integrations/frigate/media-download.ctrl.js";
import {
  buildFrigateEventDownloadPlan,
  buildFrigateNotificationMediaPath,
  buildFrigateRecordingDownloadPlan,
} from "../src/integrations/frigate/url.js";
import { triggerBrowserDownload } from "../src/shared/media/download.js";

test("Frigate notification media paths encode route parts and downloads", () => {
  assert.equal(
    buildFrigateNotificationMediaPath({
      clientId: "frig ate",
      eventId: "event/1",
      file: "snapshot.jpg",
    }),
    "/api/frigate/frig%20ate/notifications/event%2F1/snapshot.jpg",
  );
  assert.equal(
    buildFrigateNotificationMediaPath({
      clientId: "frigate",
      eventId: "event-1",
      file: "clip.mp4",
      download: true,
    }),
    "/api/frigate/frigate/notifications/event-1/clip.mp4?download=true",
  );
});

test("Frigate event download plans preserve the existing filename", () => {
  assert.deepEqual(
    buildFrigateEventDownloadPlan({
      clientId: "frigate",
      camera: "front_door",
      eventId: "event-1",
      file: "snapshot.jpg",
    }),
    {
      url: "/api/frigate/frigate/notifications/event-1/snapshot.jpg?download=true",
      filename: "front_door_event-1_snapshot.jpg",
    },
  );
});

test("Frigate recording download plans normalize and cap the range", () => {
  assert.deepEqual(
    buildFrigateRecordingDownloadPlan({
      clientId: "frig ate",
      camera: "front/door",
      start: 100.9,
      end: 9000,
      timeLabel: "8:44 pm",
    }),
    {
      path:
        "/api/frigate/frig%20ate/recording/front%2Fdoor/start/100/end/7300?download=true",
      filename: "front/door_8-44 pm.mp4",
      start: 100,
      end: 7300,
    },
  );
});

test("Frigate download controller signs recordings and dispatches plans", async () => {
  const downloads = [];
  const signedPaths = [];
  const controller = new FrigateMediaDownloadController({
    getContext: () => ({ clientId: "frigate", cam: "front_door" }),
    signPath: async (path) => {
      signedPaths.push(path);
      return `${path}&authSig=abc`;
    },
    formatTime: () => "8:44 pm",
    download: (plan) => downloads.push(plan),
  });

  const eventPlan = await controller.downloadEvent("event-1", "clip.mp4");
  const recordingPlan = await controller.downloadRecording(100, 160);

  assert.deepEqual(eventPlan, {
    url: "/api/frigate/frigate/notifications/event-1/clip.mp4?download=true",
    filename: "front_door_event-1_clip.mp4",
  });
  assert.deepEqual(signedPaths, [
    "/api/frigate/frigate/recording/front_door/start/100/end/160?download=true",
  ]);
  assert.equal(recordingPlan.url.endsWith("&authSig=abc"), true);
  assert.deepEqual(downloads, [
    eventPlan,
    {
      url: `${signedPaths[0]}&authSig=abc`,
      filename: "front_door_8-44 pm.mp4",
    },
  ]);
});

test("Frigate event clip downloads use the padded recording range when enabled", async () => {
  const downloads = [];
  const signedPaths = [];
  const controller = new FrigateMediaDownloadController({
    getContext: () => ({ clientId: "frigate", cam: "front_door" }),
    findEventById: () => ({
      id: "event-1",
      camera: "front_door",
      start_time: 100.8,
      end_time: 110.2,
    }),
    isEventPrePostRollEnabled: () => true,
    signPath: async (path) => {
      signedPaths.push(path);
      return `${path}&authSig=abc`;
    },
    download: (plan) => downloads.push(plan),
  });

  const plan = await controller.downloadEvent("event-1", "clip.mp4");

  assert.deepEqual(signedPaths, [
    "/api/frigate/frigate/recording/front_door/start/95/end/116?download=true",
  ]);
  assert.equal(plan.start, 95);
  assert.equal(plan.end, 116);
  assert.equal(plan.filename, "front_door_event-1_clip.mp4");
  assert.deepEqual(downloads, [
    {
      url: `${signedPaths[0]}&authSig=abc`,
      filename: "front_door_event-1_clip.mp4",
    },
  ]);
});

test("Frigate snapshot downloads remain event files when pre-roll is enabled", async () => {
  const downloads = [];
  const controller = new FrigateMediaDownloadController({
    getContext: () => ({ clientId: "frigate", cam: "front_door" }),
    findEventById: () => ({
      id: "event-1",
      start_time: 100,
      end_time: 110,
    }),
    isEventPrePostRollEnabled: () => true,
    download: (plan) => downloads.push(plan),
  });

  const plan = await controller.downloadEvent("event-1", "snapshot.jpg");

  assert.equal(
    plan.url,
    "/api/frigate/frigate/notifications/event-1/snapshot.jpg?download=true",
  );
  assert.deepEqual(downloads, [plan]);
});

test("browser download helper mounts, clicks, and removes its anchor", () => {
  const calls = [];
  const anchor = {
    href: "",
    download: "",
    click: () => calls.push("click"),
    remove: () => calls.push("remove"),
  };
  const documentObj = {
    createElement: (tag) => {
      calls.push(["create", tag]);
      return anchor;
    },
    body: {
      appendChild: (node) => calls.push(["append", node]),
    },
  };

  triggerBrowserDownload({
    url: "/download/file",
    filename: "file.mp4",
    documentObj,
  });

  assert.equal(anchor.href, "/download/file");
  assert.equal(anchor.download, "file.mp4");
  assert.deepEqual(calls, [
    ["create", "a"],
    ["append", anchor],
    "click",
    "remove",
  ]);
});
