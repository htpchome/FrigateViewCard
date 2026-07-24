import { test } from "node:test";
import assert from "node:assert/strict";

import { DeepLinkController } from "../src/navigation/deep-link-controller.js";

const createHarness = () => {
  const calls = [];
  const host = {
    _config: {
      cameras: [
        { entity: "camera.front_door" },
        { entity: "camera.driveway", name: "Driveway" },
      ],
      deep_link_enabled: true,
    },
    _camCache: {
      "camera.front_door": { cam: "front_door" },
      "camera.driveway": { cam: "driveway" },
    },
    _deepLinkEventId: "",
    _deepLinkReviewId: "",
    _deepLinkMediaHint: "",
    _deepLinkCameraHint: "",
    _deepLinkApplied: false,
    _deepLinkEventLookupTried: false,
    _deepLinkReviewLookupTried: false,
    _activeCamIdx: 0,
    _reviews: [],
    _findEventById: (eventId) =>
      eventId === "event-1"
        ? { id: "event-1", camera: "front_door", has_clip: true }
        : eventId === "event-2"
          ? { id: "event-2", camera: "driveway", has_clip: false }
          : null,
    _switchCamera: (idx) => calls.push(["switchCamera", idx]),
    _showSnapshot: (event) => calls.push(["showSnapshot", event.id]),
    _showClip: (event, opts) => calls.push(["showClip", event.id, opts]),
    _open: (eventId) => calls.push(["open", eventId]),
    _loadReviews: () => Promise.resolve(),
  };

  return { host, calls, controller: new DeepLinkController(host) };
};

const withWindow = async (windowShape, run) => {
  const previousWindow = globalThis.window;
  globalThis.window = windowShape;
  try {
    return await run();
  } finally {
    globalThis.window = previousWindow;
  }
};

test("mergedUrlSearchParams merges search and hash query params", async () => {
  const { controller } = createHarness();

  await withWindow(
    {
      location: {
        search: "?camera=front_door&event=event-1",
        hash: "#/view?review=review-9&media=snapshot",
      },
    },
    async () => {
      const params = controller.mergedUrlSearchParams();
      assert.equal(params.get("camera"), "front_door");
      assert.equal(params.get("event"), "event-1");
      assert.equal(params.get("review"), "review-9");
      assert.equal(params.get("media"), "snapshot");
    },
  );
});

test("clearDeepLinkParamsFromUrl removes deep link params", async () => {
  const { controller } = createHarness();
  let nextUrl = "";

  await withWindow(
    {
      location: {
        href: "https://example.local/dashboard/view?camera=front_door&event=event-1&keep=1#/view?review=review-9&media=snapshot&stay=2",
        pathname: "/dashboard/view",
        search: "?camera=front_door&event=event-1&keep=1",
        hash: "#/view?review=review-9&media=snapshot&stay=2",
      },
      history: {
        state: null,
        replaceState: (_state, _title, value) => {
          nextUrl = value;
        },
      },
    },
    async () => {
      controller.clearDeepLinkParamsFromUrl();
      assert.equal(nextUrl, "/dashboard/view?keep=1#/view?stay=2");
    },
  );
});

test("initDeepLinkFromUrl and camera hint helpers populate host state", async () => {
  const { host, controller } = createHarness();

  await withWindow(
    {
      location: {
        search: "?camera=driveway&event=event-2&review=review-3&media=clip",
        hash: "",
      },
    },
    async () => {
      controller.initDeepLinkFromUrl();
      assert.equal(host._deepLinkCameraHint, "driveway");
      assert.equal(host._deepLinkEventId, "event-2");
      assert.equal(host._deepLinkReviewId, "review-3");
      assert.equal(host._deepLinkMediaHint, "clip");
      assert.equal(controller.deepLinkCameraHintIndex(), 1);
      controller.applyDeepLinkCameraHint();
      assert.equal(host._activeCamIdx, 1);
      assert.equal(controller.hasPendingDeepLinkTarget(), true);
    },
  );
});

test("consumeDeepLinkEventOpen opens event popup and clears params", async () => {
  const { host, calls, controller } = createHarness();
  let cleared = 0;
  host._deepLinkEventId = "event-1";
  host._deepLinkMediaHint = "snapshot";
  controller.clearDeepLinkParamsFromUrl = () => {
    cleared += 1;
  };

  await withWindow(
    {
      location: {
        href: "https://example.local/dashboard/view?camera=front_door&event=event-1",
        pathname: "/dashboard/view",
        search: "?camera=front_door&event=event-1",
        hash: "",
      },
      history: {
        state: null,
        replaceState: () => {},
      },
    },
    async () => {
      controller.consumeDeepLinkEventOpen();
      assert.deepEqual(calls, [["showSnapshot", "event-1"]]);
      assert.equal(cleared, 1);
      assert.equal(host._deepLinkApplied, true);
    },
  );
});

test("consumeDeepLinkReviewOpen resolves review to event", async () => {
  const { host, calls, controller } = createHarness();
  host._deepLinkReviewId = "review-1";
  host._reviews = [{ id: "review-1", data: { detections: ["event-2"] } }];
  controller.clearDeepLinkParamsFromUrl = () => {};

  await withWindow(
    {
      location: {
        href: "https://example.local/dashboard/view?camera=driveway&review=review-1",
        pathname: "/dashboard/view",
        search: "?camera=driveway&review=review-1",
        hash: "",
      },
      history: {
        state: null,
        replaceState: () => {},
      },
    },
    async () => {
      controller.consumeDeepLinkReviewOpen();
      assert.deepEqual(calls, [["switchCamera", 1]]);
      assert.equal(host._deepLinkEventId, "event-2");
      assert.equal(host._deepLinkEventLookupTried, true);
    },
  );
});
