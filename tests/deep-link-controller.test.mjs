import { test } from "node:test";
import assert from "node:assert/strict";

import { DeepLinkController } from "../src/features/navigation/deep-link.ctrl.js";

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

const navigationWindow = () => {
  const target = new EventTarget();
  target.location = new URL("https://example.local/dashboard/view");
  target.history = {
    state: null,
    replaceState: (_state, _title, url) => {
      target.location = new URL(url, target.location);
    },
  };
  target.navigate = (url, event = "location-changed") => {
    target.location = new URL(url, target.location);
    target.dispatchEvent(new Event(event));
  };
  return target;
};

const navigationHarness = () => {
  const harness = createHarness();
  const { host, calls, controller } = harness;
  host._started = true;
  host.isConnected = true;
  host._switchCamera = (idx) => {
    calls.push(["switchCamera", idx]);
    host._activeCamIdx = idx;
  };
  host._browseWindowLoaderController = {
    loadWindow: (...args) => {
      calls.push(["loadWindow", ...args]);
      return Promise.resolve();
    },
  };
  host._deepLinkController = controller;
  return harness;
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

test("mounted card consumes HA notification navigation without reloading", async () => {
  const { host, calls, controller } = navigationHarness();
  const win = navigationWindow();
  await withWindow(win, async () => {
    controller.connect();
    win.navigate("?camera=driveway&event=event-2&media=snapshot");
    assert.equal(host._activeCamIdx, 1);
    assert.equal(host._deepLinkApplied, true);
    assert.deepEqual(calls, [["switchCamera", 1], ["showSnapshot", "event-2"]]);
    assert.equal(win.location.search, "");
    controller.disconnect();
  });
});

for (const navigationEvent of ["location-changed", "popstate", "hashchange"]) {
  test(`${navigationEvent} opens same-camera links and permits reopening`, async () => {
    const { calls, controller } = navigationHarness();
    const win = navigationWindow();
    await withWindow(win, async () => {
      controller.connect();
      controller.connect(); // Idempotent listener registration.
      const url = "?event=event-1&media=clip";
      win.navigate(url, navigationEvent);
      win.navigate(url, navigationEvent);
      assert.equal(calls.filter(([name]) => name === "showClip").length, 2);
      assert.equal(calls.filter(([name]) => name === "loadWindow").length, 2);
      controller.disconnect();
      win.navigate(url, navigationEvent);
      assert.equal(calls.filter(([name]) => name === "showClip").length, 2);
      controller.connect(); // Reattached card consumes the current URL.
      assert.equal(calls.filter(([name]) => name === "showClip").length, 3);
      controller.disconnect();
    });
  });
}

test("navigation ignores other routes, disabled cards, and camera-only links", async () => {
  const { host, calls, controller } = navigationHarness();
  const win = navigationWindow();
  await withWindow(win, async () => {
    controller.connect();
    win.navigate("/other/view?event=event-1");
    win.navigate("/dashboard/view?camera=driveway");
    win.navigate("?camera=unknown&event=event-1");
    host._config.deep_link_enabled = false;
    win.navigate("?event=event-1");
    assert.deepEqual(calls, []);
    controller.disconnect();
  });
});

test("pending same-camera event refreshes once, then opens after data arrives", async () => {
  const { host, calls, controller } = navigationHarness();
  const win = navigationWindow();
  host._findEventById = () => null;
  await withWindow(win, async () => {
    controller.connect();
    win.navigate("?camera=front_door&event=new-event&media=clip");
    win.dispatchEvent(new Event("popstate"));
    assert.deepEqual(calls, [["loadWindow", true, { supersede: true }]]);
    host._findEventById = () => ({ id: "new-event", camera: "front_door", has_clip: true });
    controller.consumeDeepLinkEventOpen();
    assert.equal(host._deepLinkApplied, true);
    assert.equal(win.location.search, "");
    controller.disconnect();
  });
});

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

test("camera-only query params do not become startup deep links", async () => {
  const { host, controller } = createHarness();

  await withWindow(
    {
      location: {
        search: "?camera=driveway",
        hash: "",
      },
    },
    async () => {
      controller.initDeepLinkFromUrl();
      assert.equal(host._deepLinkCameraHint, "");
      assert.equal(controller.hasParsedDeepLinkTarget(), false);
      assert.equal(controller.hasPendingDeepLinkTarget(), false);
      controller.applyDeepLinkCameraHint();
      assert.equal(host._activeCamIdx, 0);
    },
  );
});

test("parsed deep-link targets are available before camera discovery", () => {
  const { host, controller } = createHarness();
  host._deepLinkEventId = "event-1";
  host._deepLinkCameraHint = "frigate-camera-not-discovered-yet";

  assert.equal(controller.hasParsedDeepLinkTarget(), true);
  assert.equal(controller.hasPendingDeepLinkTarget(), false);
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

test("deep links for a secondary member select its logical camera group", () => {
  const { host, calls, controller } = createHarness();
  host._config.cameras[0].group = {
    secondary_entity: "camera.package",
    layout: "stacked",
  };
  host._camCache["camera.package"] = { cam: "package" };
  host._deepLinkCameraHint = "package";
  host._deepLinkEventId = "package-event";
  host._activeCamIdx = 1;
  host._findEventById = () => ({
    id: "package-event",
    camera: "package",
    has_clip: true,
  });

  assert.equal(controller.deepLinkCameraHintIndex(), 0);
  controller.consumeDeepLinkEventOpen();

  assert.deepEqual(calls, [["switchCamera", 0]]);
  assert.equal(host._deepLinkApplied, false);
});
