import assert from "node:assert/strict";
import test from "node:test";

import { VERSION } from "../src/constants.js";
import {
  ensureGridRuntimeModule,
  LazyGridAlertController,
  LazyGridFeatureController,
  LazyGridMediaController,
  LazyGridPageController,
} from "../src/features/grid/runtime.loader.js";
import { GridPageController } from "../src/features/grid/page.ctrl.js";

const createHost = ({ mobile = false } = {}) => ({
  _config: {
    cameras: [
      { entity: "camera.front" },
      { entity: "camera.back" },
    ],
    grid_mode_enabled: true,
  },
  _isLikelyMobileClient: () => mobile,
  _isLikelyPhoneClient: () => mobile,
  _pageId: "single-view",
  _viewMode: "single",
});

test("Grid runtime loader resolves the versioned companion asset", async () => {
  let requestedUrl = "";
  const module = await ensureGridRuntimeModule({
    baseUrl: "https://example.test/local/frigate-view-card.js",
    importModule: async (url) => {
      requestedUrl = url;
      return { loaded: true };
    },
  });

  assert.equal(module.loaded, true);
  const assetUrl = new URL(requestedUrl);
  assert.equal(assetUrl.pathname, "/local/frigate-view-card-grid.js");
  assert.equal(assetUrl.searchParams.get("fvc-version"), VERSION);
});

test("phone clients never load the Grid runtime", async () => {
  let loads = 0;
  const feature = new LazyGridFeatureController(
    createHost({ mobile: true }),
    {},
    {
      loadModule: async () => {
        loads += 1;
        return {};
      },
    },
  );

  assert.equal(feature.isSupported(), false);
  assert.equal(await feature.prepare(), null);
  assert.equal(loads, 0);
});

test("Grid runtime is prioritized only for landing views configured to start in Grid", () => {
  const host = createHost();
  host._config.single_view_start_mode = "grid";
  host._config.wide_view_start_mode = "grid";
  host._config.card_view_start_mode = "grid";
  host._config.card_view_view_mode = "video-only";
  const feature = new LazyGridFeatureController(host);
  const pageIds = {
    singleView: "single-view",
    wideView: "wide-view",
    cardView: "card-view",
  };

  assert.equal(
    feature.shouldPrepareForLandingPage("single-view", pageIds),
    true,
  );
  assert.equal(
    feature.shouldPrepareForLandingPage("wide-view", pageIds),
    true,
  );
  assert.equal(
    feature.shouldPrepareForLandingPage("card-view", pageIds),
    true,
  );
  host._config.card_view_view_mode = "bottom-panel-open";
  assert.equal(
    feature.shouldPrepareForLandingPage("card-view", pageIds),
    false,
  );
  assert.equal(feature.shouldPrepareForLandingPage("preview", pageIds), false);
});

test("camera cells stay available without loading the Grid runtime", () => {
  let loads = 0;
  let mounts = 0;
  const host = createHost();
  const feature = new LazyGridFeatureController(host, {}, {
    loadModule: async () => {
      loads += 1;
      return {};
    },
  });
  const cameraCellMediaController = {
    mountCameraCellMedia: () => {
      mounts += 1;
      return true;
    },
    refreshSnapshotMedia: async () => {},
  };
  const media = new LazyGridMediaController(
    host,
    feature,
    cameraCellMediaController,
  );

  assert.equal(media.mountCameraCellMedia({}, {}), true);
  assert.equal(mounts, 1);
  assert.equal(loads, 0);
  assert.equal(feature.isLoaded(), false);
});

test("desktop Grid activation loads once and preserves alert takeover", async () => {
  const calls = [];
  const host = createHost();
  const controllers = {
    alert: {
      handleRealtimeMessage: (message) => calls.push(["realtime", message]),
    },
    page: {
      beginAlertTakeover: async (entity, severity) => {
        calls.push(["takeover", entity, severity]);
        return true;
      },
      toggleGridMode: () => calls.push(["toggle"]),
    },
    media: {},
  };
  let loads = 0;
  const feature = new LazyGridFeatureController(
    host,
    { marker: "options" },
    {
      loadModule: async () => {
        loads += 1;
        return {
          createGridRuntimeControllers: (createdHost, options) => {
            calls.push(["create", createdHost, options]);
            return controllers;
          },
        };
      },
    },
  );
  const page = new LazyGridPageController(host, feature);
  const alert = new LazyGridAlertController(feature);

  page.toggleGridMode();
  page.toggleGridMode();
  await feature.prepare();
  alert.handleRealtimeMessage({ type: "new" });
  assert.equal(
    await page.beginAlertTakeover("camera.back", "detection"),
    true,
  );

  assert.equal(loads, 1);
  assert.deepEqual(calls, [
    ["create", host, { marker: "options" }],
    ["toggle"],
    ["realtime", { type: "new" }],
    ["takeover", "camera.back", "detection"],
  ]);
});

test("lazy Grid exit preserves a camera selected through the loaded runtime", () => {
  const restoredTypes = [];
  const host = createHost();
  host._activeCamIdx = 0;
  host._activeGroupMemberOverride = "";
  host._activeStreamType = "webrtc";
  host._lastLiveStreamHint = "webrtc";
  host._engine = { id: "camera.front" };
  host._mountInProgress = false;
  host._gridMediaController = { shouldUseLive: () => true };
  host._shouldUseGo2RtcForEntity = () => true;
  host._setActiveStreamType = (type) => restoredTypes.push(type);
  Object.defineProperty(host, "_activeCam", {
    get: () => host._config.cameras[host._activeCamIdx],
  });

  const delegate = new GridPageController(host);
  const feature = {
    controller: (name) => (name === "page" ? delegate : null),
    isSupported: () => true,
  };
  const page = new LazyGridPageController(host, feature);

  assert.deepEqual(delegate.prepareLiveForGrid(), {
    releaseMainLive: true,
    returnEntity: "camera.front",
  });
  host._engine = null;
  host._viewMode = "grid";
  host._activeCamIdx = 1;

  assert.equal(
    page.restoreLiveAfterGrid({ preserveActiveCamera: true }),
    false,
  );
  assert.equal(host._activeCamIdx, 1);
  assert.equal(host._activeCam.entity, "camera.back");
  assert.deepEqual(restoredTypes, ["--"]);
});
