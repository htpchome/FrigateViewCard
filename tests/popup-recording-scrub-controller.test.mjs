import { test } from "node:test";
import assert from "node:assert/strict";

import { PopupRecordingScrubController } from "../src/features/popup/recording-scrub.ctrl.js";
import { buildFrigateRecordingReviewMarkers } from "../src/integrations/frigate/recording-review-markers.js";

const createElement = () => ({
  hidden: true,
  innerHTML: "",
  textContent: "",
  style: {},
  removeAttribute(name) {
    delete this[name];
  },
});

const createScrubElements = () => {
  const selectors = [
    "#recording-scrub",
    "#recording-scrub-track",
    "#recording-scrub-ticks",
    "#recording-scrub-markers",
    "#recording-scrub-cursor",
    "#recording-scrub-preview",
    "#recording-scrub-preview-image",
    "#recording-scrub-preview-label",
    "#recording-scrub-start",
    "#recording-scrub-now",
    "#recording-scrub-end",
  ];
  return new Map(selectors.map((selector) => [selector, createElement()]));
};

test("Frigate recording reviews map to sorted scrub markers and snapshots", () => {
  const markers = buildFrigateRecordingReviewMarkers({
    clientId: "client one",
    start: 100,
    end: 200,
    reviews: [
      {
        id: "review-2",
        start_time: 140,
        end_time: 150,
        severity: "detection",
        detections: ["event/two"],
      },
      {
        id: "ignored",
        start_time: 110,
        end_time: 115,
        severity: "none",
      },
      {
        id: "review-1",
        start_time: 90,
        end_time: 130,
        severity: "alert",
        data: { detections: ["event/one"] },
      },
    ],
  });

  assert.deepEqual(markers, [
    {
      id: "review-1",
      start: 100,
      end: 130,
      severity: "alert",
      eventId: "event/one",
      snapshotUrl:
        "/api/frigate/client%20one/notifications/event%2Fone/snapshot.jpg",
    },
    {
      id: "review-2",
      start: 140,
      end: 150,
      severity: "detection",
      eventId: "event/two",
      snapshotUrl:
        "/api/frigate/client%20one/notifications/event%2Ftwo/snapshot.jpg",
    },
  ]);
});

test("popup recording scrub coordinator owns rendering, caching, and teardown", async () => {
  const elements = createScrubElements();
  const calls = [];
  let fetchCount = 0;
  const controller = new PopupRecordingScrubController({
    query: (selector) => elements.get(selector) || null,
    fetchReviews: async () => {
      fetchCount += 1;
      return [
        {
          id: "review-1",
          start_time: 120,
          end_time: 130,
          severity: "alert",
          data: { detections: ["event-1"] },
        },
      ];
    },
    isPlaybackTokenCurrent: (token) => token === 7,
    createScrubBinding: (options) => ({
      bind() {
        calls.push(["bind", options]);
      },
      dispose() {
        calls.push(["dispose"]);
      },
    }),
  });
  const payload = {
    clientId: "frigate",
    cam: "front",
    start: 100,
    end: 200,
    video: {},
    token: 7,
    sourceUrl: "/recording.mp4#t=0",
  };

  assert.deepEqual(await controller.initialize(payload), {
    start: 100,
    end: 200,
  });
  assert.equal(fetchCount, 1);
  assert.equal(elements.get("#recording-scrub").hidden, false);
  assert.equal(elements.get("#recording-scrub-start").textContent, "0:00");
  assert.equal(elements.get("#recording-scrub-end").textContent, "1:40");
  assert.match(
    elements.get("#recording-scrub-markers").innerHTML,
    /recording-scrub-alert/,
  );
  assert.equal(calls[0][0], "bind");
  assert.equal(
    calls[0][1].state.alerts[0].snapshotUrl.endsWith(
      "event-1/snapshot.jpg",
    ),
    true,
  );

  await controller.initialize(payload);
  assert.equal(fetchCount, 1);
  assert.equal(calls.some(([kind]) => kind === "dispose"), true);

  controller.teardown();
  assert.equal(elements.get("#recording-scrub").hidden, true);
  assert.equal(elements.get("#recording-scrub-markers").innerHTML, "");
  assert.equal(controller.range(), null);
});

test("popup recording scrub ignores marker loads after teardown", async () => {
  const elements = createScrubElements();
  let resolveReviews;
  const pendingReviews = new Promise((resolve) => {
    resolveReviews = resolve;
  });
  let bindCount = 0;
  const controller = new PopupRecordingScrubController({
    query: (selector) => elements.get(selector) || null,
    fetchReviews: () => pendingReviews,
    isPlaybackTokenCurrent: () => true,
    createScrubBinding: () => ({
      bind() {
        bindCount += 1;
      },
      dispose() {},
    }),
  });

  const initializing = controller.initialize({
    clientId: "frigate",
    cam: "front",
    start: 100,
    end: 200,
    video: {},
    token: 1,
  });
  controller.teardown();
  resolveReviews([]);
  await initializing;

  assert.equal(bindCount, 0);
  assert.equal(elements.get("#recording-scrub").hidden, true);
  assert.equal(controller.range(), null);
});
