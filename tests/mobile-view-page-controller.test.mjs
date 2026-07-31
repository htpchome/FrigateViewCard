import { test } from "node:test";
import assert from "node:assert/strict";

import { MobileViewPageController } from "../src/mobile-view/mobile-view-page-controller.js";

const PAGE_IDS = {
  preview: "preview",
  mobileView: "mobile-view",
};

const createNode = () => ({
  style: {},
  textContent: "",
  innerHTML: "",
});

const createHost = ({ popupOpen = false, domNodes = {} } = {}) => {
  const calls = [];
  const nodeMap = domNodes;
  const host = {
    _pageId: PAGE_IDS.mobileView,
    _viewMode: "single",
    _config: {
      title: "",
      subtitle: "Mobile Feed",
      cameras: [
        { entity: "camera.front_door", name: "Front Door" },
        { entity: "camera.driveway", name: "Driveway" },
      ],
    },
    _activeCamIdx: 0,
    _activeCam: { entity: "camera.front_door", name: "Front Door" },
    _activeStreamType: "webrtc",
    _eventsMode: "all",
    _allDisplayEvents: () => [{ id: 1 }, { id: 2 }],
    _labels: () => ["person", "car"],
    _isPreviewPageEnabled: () => false,
    _hass: {
      states: {
        "camera.front_door": { state: "streaming" },
        "camera.driveway": { state: "streaming" },
      },
    },
    _stopPreviewMode: () => calls.push(["stopPreview"]),
    _$: (selector) => {
      if (selector === "#myPopup" && popupOpen) {
        return {
          classList: {
            contains: (className) => className === "is-open",
          },
        };
      }
      if (nodeMap[selector]) return nodeMap[selector];
      if (selector === "#card") {
        return {
          classList: {
            toggle: (className, enabled) =>
              calls.push(["toggleClass", className, enabled]),
          },
        };
      }
      return null;
    },
    _closePopup: () => calls.push(["closePopup"]),
    _cancelPendingMount: (reason) => calls.push(["cancelPendingMount", reason]),
    _applyPreviewShellVisibility: () =>
      calls.push(["applyPreviewShellVisibility"]),
    _mountEngine: (...args) => calls.push(["mountEngine", ...args]),
    _syncTabsShell: () => calls.push(["syncTabsShell"]),
    _renderAll: () => calls.push(["renderAll"]),
    _wideViewPageController: {
      applyStyleLayoutAndWideSyncForCard: () =>
        calls.push(["applyStyleLayoutAndWideSyncForCard"]),
    },
  };
  return { host, calls };
};

test("activateMobileViewPageRoute handles startup like single-view", () => {
  const { host, calls } = createHost();
  const controller = new MobileViewPageController(host, { PAGE_IDS });

  controller.activateMobileViewPageRoute({ startup: true });

  assert.deepEqual(calls, [
    ["applyPreviewShellVisibility"],
    ["applyStyleLayoutAndWideSyncForCard"],
    ["toggleClass", "mobile-view-active", true],
    ["mountEngine"],
  ]);
});

test("activateMobileViewPageRoute leaves preview and remounts quietly", () => {
  const { host, calls } = createHost({ popupOpen: true });
  const controller = new MobileViewPageController(host, { PAGE_IDS });

  controller.activateMobileViewPageRoute({ previousPageId: PAGE_IDS.preview });

  assert.deepEqual(calls, [
    ["stopPreview"],
    ["closePopup"],
    ["cancelPendingMount", "page-route-mobile-view"],
    ["applyPreviewShellVisibility"],
    ["applyStyleLayoutAndWideSyncForCard"],
    ["toggleClass", "mobile-view-active", true],
    ["mountEngine", null, { quiet: true }],
    ["syncTabsShell"],
    ["renderAll"],
  ]);
});

test("syncMobileViewPageMarkup toggles class off when route is not mobile", () => {
  const { host, calls } = createHost();
  const controller = new MobileViewPageController(host, { PAGE_IDS });

  host._pageId = "single-view";
  controller.syncMobileViewPageMarkup();

  assert.deepEqual(calls, [["toggleClass", "mobile-view-active", false]]);
});

test("mobile-view render helpers update subtitle and stats", () => {
  const nodes = {
    "#tl-range": createNode(),
    "#ev-count": createNode(),
    "#stream-type": createNode(),
  };
  const { host } = createHost({ domNodes: nodes });
  const controller = new MobileViewPageController(host, { PAGE_IDS });

  controller.renderSubtitle();
  controller.renderStats();

  assert.equal(nodes["#tl-range"].textContent, "Mobile Feed");
  assert.equal(nodes["#ev-count"].textContent, "2");
  assert.equal(nodes["#stream-type"].textContent, "webrtc");
});

test("mobile-view render helpers update status and title", () => {
  const nodes = {
    "#on-dot": createNode(),
    "#on-lbl": createNode(),
    "#info-title": createNode(),
  };
  const { host } = createHost({ domNodes: nodes });
  const controller = new MobileViewPageController(host, { PAGE_IDS });

  controller.syncStatus();

  assert.equal(nodes["#on-dot"].style.color, "#4ade80");
  assert.equal(nodes["#on-lbl"].textContent, "Online");
  assert.equal(nodes["#info-title"].textContent, "Front Door");
});

test("mobile-view camera switcher render hides for a single camera when preview is disabled", () => {
  const nodes = {
    "#cam-switcher": createNode(),
  };
  const { host } = createHost({ domNodes: nodes });
  host._config.cameras = [{ entity: "camera.front_door", name: "Front Door" }];
  const controller = new MobileViewPageController(host, { PAGE_IDS });

  controller.renderCamSwitcher();

  assert.equal(nodes["#cam-switcher"].style.display, "none");
});

test("mobile-view camera switcher markup includes camera buttons", () => {
  const { host } = createHost();
  const controller = new MobileViewPageController(host, { PAGE_IDS });

  const markup = controller.camSwitcherMarkup({ includeStatus: true });

  assert.equal(markup.includes('data-camidx="0"'), true);
  assert.equal(markup.includes("Front Door"), true);
});

test("mobile-view renderLegend populates deterministic legend markup", () => {
  const nodes = {
    "#legend": createNode(),
  };
  const { host } = createHost({ domNodes: nodes });
  const controller = new MobileViewPageController(host, { PAGE_IDS });

  controller.renderLegend();

  assert.equal(nodes["#legend"].innerHTML.includes("Person"), true);
  assert.equal(nodes["#legend"].innerHTML.includes("Car"), true);
  assert.equal(nodes["#legend"].innerHTML.includes("Front Door rec"), true);
});
