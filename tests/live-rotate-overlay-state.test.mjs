import { test } from "node:test";
import assert from "node:assert/strict";

import {
  resolveFullscreenButtonVisibility,
  resolveRotateOverlayNativeControlsPlan,
  resolveRotateOverlayState,
  resolveRotateOverlayTargetMode,
  resolveRotateOverlayUiPlan,
} from "../src/live/live-rotate-overlay-state.js";

test("resolveRotateOverlayTargetMode keeps overlay off outside eligible viewport", () => {
  assert.equal(
    resolveRotateOverlayTargetMode({
      isMobileTabletViewport: false,
      isLandscapeViewport: true,
      popupOpen: false,
      popupMediaVisible: false,
    }),
    "none",
  );
  assert.equal(
    resolveRotateOverlayTargetMode({
      isMobileTabletViewport: true,
      isLandscapeViewport: false,
      popupOpen: false,
      popupMediaVisible: true,
    }),
    "none",
  );
});

test("resolveRotateOverlayTargetMode prioritizes popup media, otherwise live when popup closed", () => {
  assert.equal(
    resolveRotateOverlayTargetMode({
      isMobileTabletViewport: true,
      isLandscapeViewport: true,
      popupOpen: true,
      popupMediaVisible: true,
    }),
    "popup",
  );
  assert.equal(
    resolveRotateOverlayTargetMode({
      isMobileTabletViewport: true,
      isLandscapeViewport: true,
      popupOpen: false,
      popupMediaVisible: false,
    }),
    "live",
  );
});

test("resolveRotateOverlayState activates live and popup with prior-mode hints", () => {
  assert.deepEqual(
    resolveRotateOverlayState({
      isMobileTabletViewport: true,
      isLandscapeViewport: true,
      popupOpen: false,
      popupMediaVisible: false,
      currentMode: "popup",
      isActive: true,
    }),
    {
      action: "activate-live",
      active: true,
      fromPopup: true,
      mode: "live",
      nextMode: "live",
    },
  );

  assert.deepEqual(
    resolveRotateOverlayState({
      isMobileTabletViewport: true,
      isLandscapeViewport: true,
      popupOpen: true,
      popupMediaVisible: true,
      currentMode: "live",
      isActive: true,
    }),
    {
      action: "activate-popup",
      active: true,
      fromLive: true,
      mode: "popup",
      nextMode: "popup",
    },
  );
});

test("resolveRotateOverlayState distinguishes idle and deactivate outcomes", () => {
  assert.deepEqual(
    resolveRotateOverlayState({
      isMobileTabletViewport: false,
      isLandscapeViewport: true,
      popupOpen: false,
      popupMediaVisible: false,
      currentMode: "none",
      isActive: false,
    }),
    {
      action: "idle",
      active: false,
      mode: "none",
      nextMode: "none",
    },
  );

  assert.deepEqual(
    resolveRotateOverlayState({
      isMobileTabletViewport: false,
      isLandscapeViewport: true,
      popupOpen: false,
      popupMediaVisible: false,
      currentMode: "popup",
      isActive: true,
    }),
    {
      action: "deactivate",
      active: false,
      exitMode: "popup",
      mode: "none",
      nextMode: "none",
    },
  );
});

test("resolveFullscreenButtonVisibility hides controls for popup rotation and fullscreen constraints", () => {
  assert.deepEqual(
    resolveFullscreenButtonVisibility({
      popupOpen: false,
      isFullscreen: false,
      inGridMode: false,
      rotateOverlayMode: "none",
      suppressPopupButton: false,
    }),
    {
      liveButtonHidden: false,
      popupButtonHidden: false,
      popupControlsFullscreenHidden: false,
    },
  );

  assert.deepEqual(
    resolveFullscreenButtonVisibility({
      popupOpen: true,
      isFullscreen: false,
      inGridMode: false,
      rotateOverlayMode: "popup",
      suppressPopupButton: true,
    }),
    {
      liveButtonHidden: true,
      popupButtonHidden: true,
      popupControlsFullscreenHidden: true,
    },
  );

  assert.deepEqual(
    resolveFullscreenButtonVisibility({
      popupOpen: false,
      isFullscreen: true,
      inGridMode: true,
      rotateOverlayMode: "live",
      suppressPopupButton: false,
    }),
    {
      liveButtonHidden: true,
      popupButtonHidden: true,
      popupControlsFullscreenHidden: false,
    },
  );
});

test("resolveRotateOverlayUiPlan shapes class mutations and side effects per action", () => {
  assert.deepEqual(
    resolveRotateOverlayUiPlan({
      action: "activate-live",
      active: true,
      mode: "live",
      fromPopup: true,
    }),
    {
      active: true,
      mode: "live",
      removeClasses: [
        "mobile-rotate-live-exit",
        "mobile-rotate-popup",
        "mobile-rotate-popup-exit",
      ],
      addClasses: ["mobile-rotate-live"],
      disableNativeControls: true,
      enableNativeControls: true,
      clearLiveControlsVisible: false,
      clearLoading: true,
      syncFullscreenButtons: true,
      showLiveControls: true,
      showPopupControls: true,
    },
  );

  assert.deepEqual(
    resolveRotateOverlayUiPlan({
      action: "activate-popup",
      active: true,
      mode: "popup",
      fromLive: true,
    }),
    {
      active: true,
      mode: "popup",
      removeClasses: [
        "mobile-rotate-popup-exit",
        "mobile-rotate-live",
        "mobile-rotate-live-exit",
      ],
      addClasses: ["mobile-rotate-popup"],
      disableNativeControls: true,
      enableNativeControls: false,
      clearLiveControlsVisible: true,
      clearLoading: false,
      syncFullscreenButtons: true,
      showLiveControls: false,
      showPopupControls: true,
    },
  );

  assert.deepEqual(
    resolveRotateOverlayUiPlan({
      action: "deactivate",
      active: false,
      mode: "none",
      exitMode: "popup",
    }),
    {
      active: false,
      mode: "none",
      removeClasses: ["mobile-rotate-live", "mobile-rotate-popup"],
      addClasses: ["mobile-rotate-popup-exit"],
      disableNativeControls: false,
      enableNativeControls: false,
      clearLiveControlsVisible: false,
      clearLoading: false,
      syncFullscreenButtons: true,
      showLiveControls: false,
      showPopupControls: true,
    },
  );
});

test("resolveRotateOverlayNativeControlsPlan keeps retry timing and cleanup behavior stable", () => {
  assert.deepEqual(resolveRotateOverlayNativeControlsPlan({ enabled: true }), {
    expectedActive: true,
    clearAudioSyncFirst: false,
    clearFullscreenStyleFirst: false,
    applyFullscreenStyle: true,
    bindAudioSync: true,
    retryDelaysMs: [120, 420, 900],
  });

  assert.deepEqual(resolveRotateOverlayNativeControlsPlan({ enabled: false }), {
    expectedActive: false,
    clearAudioSyncFirst: true,
    clearFullscreenStyleFirst: true,
    applyFullscreenStyle: false,
    bindAudioSync: false,
    retryDelaysMs: [120, 420, 900],
  });
});
