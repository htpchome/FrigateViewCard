import { test } from "node:test";
import assert from "node:assert/strict";

import {
  DeepLinkController,
  installDeepLinkHashRouteBridge,
} from "../src/features/navigation/deep-link.ctrl.js";

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
    _activeGroupMemberOverride: "",
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

const navigationWindow = () => {
  const target = new EventTarget();
  const setLocation = (url, { notify = false } = {}) => {
    const previousUrl = target.location?.href || "";
    const nextLocation = new URL(url, previousUrl || undefined);
    nextLocation.replace = (nextUrl) =>
      setLocation(nextUrl, { notify: true });
    target.location = nextLocation;
    if (notify && previousUrl !== nextLocation.href) {
      target.dispatchEvent(new Event("hashchange"));
    }
  };
  setLocation("https://example.local/dashboard/view");
  target.history = {
    state: null,
    replaceState: (_state, _title, url) => {
      setLocation(url);
    },
  };
  target.navigate = (url, event = "location-changed") => {
    setLocation(url);
    target.dispatchEvent(new Event(event));
  };
  target.setLocation = setLocation;
  return target;
};

const navigationHarness = () => {
  const harness = createHarness();
  const { host, calls } = harness;
  host._started = true;
  host.isConnected = true;
  host._switchCamera = async (idx, options) => {
    calls.push(["switchCamera", idx, options]);
    host._activeCamIdx = idx;
  };
  host._browseWindowLoaderController = {
    invalidateActiveWindowCaches: () =>
      calls.push(["invalidateActiveWindowCaches"]),
    loadWindow: async (...args) => calls.push(["loadWindow", ...args]),
  };
  return harness;
};

const settleNavigation = () => new Promise((resolve) => setImmediate(resolve));

test("mounted card consumes cached notification navigation", async () => {
  const { host, calls, controller } = navigationHarness();
  const win = navigationWindow();
  await withWindow(win, async () => {
    controller.connect();
    win.navigate("?camera=camera.driveway&event=event-2&media=snapshot");
    await settleNavigation();

    assert.equal(host._activeCamIdx, 1);
    assert.equal(host._deepLinkApplied, true);
    assert.deepEqual(calls, [
      ["switchCamera", 1, { skipBrowseLoad: true }],
      ["showSnapshot", "event-2"],
      [
        "loadWindow",
        true,
        { supersede: true, reuseRecentCache: true },
      ],
    ]);
    assert.equal(win.location.search, "");
    controller.disconnect();
  });
});

test("Bubble hash deep links activate the outer route before media opens", async () => {
  const { calls, controller } = navigationHarness();
  const win = navigationWindow();
  win.addEventListener("hashchange", () => {
    if (win.location.hash === "#test2") calls.push(["bubbleOpen"]);
  });

  await withWindow(win, async () => {
    installDeepLinkHashRouteBridge(win);
    controller.connect();
    win.navigate(
      "#test2?camera=camera.driveway&event=event-2&review=review-2",
    );

    assert.equal(win.location.hash, "#test2");
    assert.deepEqual(calls, [["bubbleOpen"]]);
    await settleNavigation();
    assert.deepEqual(calls, [
      ["bubbleOpen"],
      ["switchCamera", 1, { skipBrowseLoad: true }],
      ["showSnapshot", "event-2"],
      [
        "loadWindow",
        true,
        { supersede: true, reuseRecentCache: true },
      ],
    ]);
    controller.disconnect();
  });
});

test("Bubble hash route still opens when notification media cannot resolve", async () => {
  const { host, calls, controller } = navigationHarness();
  const win = navigationWindow();
  host._findEventById = () => null;
  win.addEventListener("hashchange", () => {
    if (win.location.hash === "#test2") calls.push(["bubbleOpen"]);
  });

  await withWindow(win, async () => {
    installDeepLinkHashRouteBridge(win);
    controller.connect();
    win.navigate("#test2?camera=front_door&event=missing-event");

    assert.equal(win.location.hash, "#test2");
    assert.equal(calls.some(([name]) => name === "bubbleOpen"), true);
    await settleNavigation();
    assert.equal(
      calls.some(([name]) => name === "showClip" || name === "showSnapshot"),
      false,
    );
    controller.disconnect();
  });
});

test("startup activates a Bubble hash route before camera resolution", async () => {
  const { host, calls, controller } = createHarness();
  const win = navigationWindow();
  win.setLocation(
    "https://example.local/dashboard-testarea/home#test2?camera=driveway&event=event-2&review=review-2",
  );
  win.addEventListener("hashchange", () => {
    if (win.location.hash === "#test2") calls.push(["bubbleOpen"]);
  });

  await withWindow(win, async () => {
    controller.initDeepLinkFromUrl();
    const cameraTarget = controller.prepareStartupCameraTarget();

    assert.equal(win.location.hash, "#test2");
    assert.deepEqual(calls, [["bubbleOpen"]]);
    assert.equal(await cameraTarget, 1);
    assert.equal(host._activeCamIdx, 1);
  });
});

test("global hash bridge opens Bubble before its FrigateViewCard mounts", async () => {
  const { host, calls, controller } = navigationHarness();
  const win = navigationWindow();
  let mounted = false;
  win.addEventListener("hashchange", () => {
    if (win.location.hash !== "#test2" || mounted) return;
    mounted = true;
    calls.push(["bubbleOpen"]);
    controller.connect();
  });
  win.setLocation(
    "https://example.local/dashboard-testarea/home#test2?camera=driveway&event=event-2&review=review-2",
  );

  await withWindow(win, async () => {
    installDeepLinkHashRouteBridge(win);
    await settleNavigation();

    assert.equal(mounted, true);
    assert.equal(win.location.hash, "#test2");
    assert.equal(host._deepLinkApplied, true);
    assert.deepEqual(calls, [
      ["bubbleOpen"],
      ["switchCamera", 1, { skipBrowseLoad: true }],
      ["showSnapshot", "event-2"],
      [
        "loadWindow",
        true,
        { supersede: true, reuseRecentCache: true },
      ],
    ]);
    controller.disconnect();
  });
});

test("cached same-camera navigation opens without refreshing the window", async () => {
  const { calls, controller } = navigationHarness();
  const win = navigationWindow();
  await withWindow(win, async () => {
    controller.connect();
    win.navigate("?event=event-1&media=clip");
    await settleNavigation();

    assert.deepEqual(calls, [
      ["showClip", "event-1", { mediaType: "clip" }],
    ]);
    controller.disconnect();
  });
});

test("missing different-camera event bypasses caches before opening", async () => {
  const { host, calls, controller } = navigationHarness();
  const win = navigationWindow();
  let loaded = false;
  host._findEventById = (id) =>
    loaded && id === "new-event"
      ? { id, camera: "driveway", has_clip: true }
      : null;
  host._browseWindowLoaderController.loadWindow = async (...args) => {
    calls.push(["loadWindow", ...args]);
    loaded = true;
  };

  await withWindow(win, async () => {
    controller.connect();
    win.navigate("?camera=drive-way&event=new-event&media=clip");
    await settleNavigation();

    assert.equal(host._activeCamIdx, 1);
    assert.equal(host._deepLinkApplied, true);
    assert.deepEqual(calls, [
      ["switchCamera", 1, { skipBrowseLoad: true }],
      ["invalidateActiveWindowCaches"],
      ["loadWindow", true, { supersede: true }],
      ["showClip", "new-event", { mediaType: "clip" }],
    ]);
    controller.disconnect();
  });
});

test("missing camera hint locates the event before switching and opening", async () => {
  const { host, calls, controller } = navigationHarness();
  const win = navigationWindow();
  let located = false;
  const event = {
    id: "unhinted-event",
    camera: "driveway",
    has_clip: true,
  };
  host._findEventById = (id) =>
    located && id === event.id ? event : null;
  host._browseWindowLoaderController.findAndCacheDeepLinkEvent = async (
    id,
  ) => {
    calls.push(["findAndCacheDeepLinkEvent", id]);
    located = true;
    return event;
  };

  await withWindow(win, async () => {
    controller.connect();
    win.navigate("?event=unhinted-event");
    await settleNavigation();

    assert.equal(host._activeCamIdx, 1);
    assert.equal(host._deepLinkApplied, true);
    assert.deepEqual(calls, [
      ["findAndCacheDeepLinkEvent", "unhinted-event"],
      ["switchCamera", 1, { skipBrowseLoad: true }],
      ["showClip", "unhinted-event", { mediaType: "clip" }],
      [
        "loadWindow",
        true,
        { supersede: true, reuseRecentCache: true },
      ],
    ]);
    controller.disconnect();
  });
});

for (const navigationEvent of ["location-changed", "popstate", "hashchange"]) {
  test(`${navigationEvent} listeners are idempotent and cleaned up`, async () => {
    const { calls, controller } = navigationHarness();
    const win = navigationWindow();
    await withWindow(win, async () => {
      controller.connect();
      controller.connect();
      win.navigate("?event=event-1&media=clip", navigationEvent);
      await settleNavigation();
      assert.equal(calls.filter(([name]) => name === "showClip").length, 1);

      controller.disconnect();
      win.navigate("?event=event-1&media=clip", navigationEvent);
      await settleNavigation();
      assert.equal(calls.filter(([name]) => name === "showClip").length, 1);
    });
  });
}

test("navigation listeners wait until card startup is complete", async () => {
  const { host, calls, controller } = navigationHarness();
  const win = navigationWindow();
  host._started = false;
  await withWindow(win, async () => {
    controller.connect();
    win.navigate("?event=event-1&media=clip");
    await settleNavigation();
    assert.deepEqual(calls, []);

    host._started = true;
    controller.connect();
    await settleNavigation();
    assert.equal(calls.filter(([name]) => name === "showClip").length, 1);
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

test("unqualified event links open the resolved event without a rendered-list lookup", () => {
  const { host, calls, controller } = createHarness();
  host._deepLinkEventId = "event-1";
  controller.clearDeepLinkParamsFromUrl = () => calls.push(["clear"]);

  controller.consumeDeepLinkEventOpen();

  assert.deepEqual(calls, [
    ["showClip", "event-1", { mediaType: "clip" }],
    ["clear"],
  ]);
  assert.equal(host._deepLinkApplied, true);
});

test("failed popup dispatch leaves the deep link pending for startup retry", () => {
  const { host, calls, controller } = createHarness();
  host._deepLinkEventId = "event-1";
  host._showClip = () => {
    calls.push(["showClip"]);
    throw new Error("popup shell is not mounted");
  };
  controller.clearDeepLinkParamsFromUrl = () => calls.push(["clear"]);

  controller.consumeDeepLinkEventOpen();

  assert.deepEqual(calls, [["showClip"]]);
  assert.equal(host._deepLinkApplied, false);
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

test("camera hints match entity IDs, Frigate names, and display-name punctuation", () => {
  const { host, controller } = createHarness();
  const hints = ["camera.driveway", "driveway", "Drive-Way", "drive way"];
  host._config.cameras[1].name = "Drive Way";

  for (const hint of hints) {
    host._deepLinkCameraHint = hint;
    assert.equal(controller.deepLinkCameraHintIndex(), 1);
  }
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

test("startup resolves an unhinted event camera before the initial view mounts", async () => {
  const { host, controller } = createHarness();
  const event = {
    id: "startup-event",
    camera: "driveway",
    has_clip: true,
  };
  host._deepLinkEventId = event.id;
  host._findEventById = () => null;
  host._browseWindowLoaderController = {
    findAndCacheDeepLinkEvent: async () => event,
  };

  assert.equal(await controller.prepareStartupCameraTarget(), 1);
  assert.equal(host._activeCamIdx, 1);
  assert.equal(host._activeGroupMemberOverride, "");
});

test("startup preserves the matched A/B member for an unhinted event", async () => {
  const { host, controller } = createHarness();
  host._config.cameras[0].group = {
    secondary_entity: "camera.package",
    layout: "stacked",
  };
  host._camCache["camera.package"] = {
    cam: "package_cam",
  };
  host._deepLinkEventId = "package-event";
  host._findEventById = () => ({
    id: "package-event",
    camera: "package_cam",
    has_clip: true,
  });

  assert.equal(await controller.prepareStartupCameraTarget(), 0);
  assert.equal(host._activeCamIdx, 0);
  assert.equal(host._activeGroupMemberOverride, "camera.package");
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
  assert.deepEqual(controller.deepLinkCameraHintTarget(), {
    index: 0,
    memberEntity: "camera.package",
  });
  controller.consumeDeepLinkEventOpen();

  assert.deepEqual(calls, [["switchCamera", 0]]);
  assert.equal(host._deepLinkApplied, false);
});
