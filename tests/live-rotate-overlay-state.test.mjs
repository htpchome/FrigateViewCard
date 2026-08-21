import { test } from "node:test";
import assert from "node:assert/strict";

import {
  resolveRotateOverlayExitPlan,
  resolveFullscreenButtonVisibility,
  resolveRotateOverlayNativeControlsPlan,
  resolveRotateOverlayState,
  resolveRotateOverlayTargetMode,
  resolveRotateOverlayUiPlan,
  resolveRotateOverlayViewportVariables,
} from "../src/features/live/rotate-overlay-state.js";

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

test("resolveRotateOverlayTargetMode lets a surface-scoped manual choice override physical orientation", () => {
  assert.equal(
    resolveRotateOverlayTargetMode({
      isMobileTabletViewport: true,
      isLandscapeViewport: false,
      popupOpen: false,
      manualOverride: "force-on",
      manualOverrideTarget: "live",
    }),
    "live",
  );
  assert.equal(
    resolveRotateOverlayTargetMode({
      isMobileTabletViewport: true,
      isLandscapeViewport: true,
      popupOpen: true,
      popupMediaVisible: true,
      manualOverride: "force-off",
      manualOverrideTarget: "popup",
    }),
    "none",
  );
  assert.equal(
    resolveRotateOverlayTargetMode({
      isMobileTabletViewport: true,
      isLandscapeViewport: true,
      popupOpen: true,
      popupMediaVisible: true,
      manualOverride: "force-off",
      manualOverrideTarget: "live",
    }),
    "popup",
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
    }),
    {
      liveButtonHidden: false,
      popupControlsFullscreenHidden: false,
    },
  );

  assert.deepEqual(
    resolveFullscreenButtonVisibility({
      popupOpen: true,
      isFullscreen: false,
      inGridMode: false,
      rotateOverlayMode: "popup",
    }),
    {
      liveButtonHidden: true,
      popupControlsFullscreenHidden: true,
    },
  );

  assert.deepEqual(
    resolveFullscreenButtonVisibility({
      popupOpen: false,
      isFullscreen: true,
      inGridMode: true,
      rotateOverlayMode: "live",
    }),
    {
      liveButtonHidden: true,
      popupControlsFullscreenHidden: true,
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
      enableNativeControls: false,
      clearLiveControlsVisible: false,
      clearLoading: true,
      syncFullscreenButtons: true,
      showLiveControls: true,
      showPopupControls: true,
      retainViewportCover: true,
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
      retainViewportCover: true,
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
      retainViewportCover: true,
    },
  );
});

test("resolveRotateOverlayUiPlan releases viewport cover when idle", () => {
  assert.equal(
    resolveRotateOverlayUiPlan({
      action: "idle",
      active: false,
      mode: "none",
    }).retainViewportCover,
    false,
  );
});

test("resolveRotateOverlayExitPlan only schedules cleanup for deactivate", () => {
  assert.deepEqual(resolveRotateOverlayExitPlan({ action: "idle" }), {
    shouldSchedule: false,
    delayMs: 0,
    removeClasses: [],
    syncFullscreenButtons: false,
    releaseViewportCover: false,
  });

  assert.deepEqual(resolveRotateOverlayExitPlan({ action: "deactivate" }), {
    shouldSchedule: true,
    delayMs: 260,
    removeClasses: ["mobile-rotate-live-exit", "mobile-rotate-popup-exit"],
    syncFullscreenButtons: true,
    releaseViewportCover: true,
  });
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

  assert.deepEqual(
    resolveRotateOverlayNativeControlsPlan({
      enabled: false,
      applyFullscreenStyle: true,
    }),
    {
      expectedActive: false,
      clearAudioSyncFirst: true,
      clearFullscreenStyleFirst: false,
      applyFullscreenStyle: true,
      bindAudioSync: false,
      retryDelaysMs: [120, 420, 900],
    },
  );
});

test("resolveRotateOverlayViewportVariables prefers visual viewport and clamps minimum size", () => {
  assert.deepEqual(
    resolveRotateOverlayViewportVariables({
      visualViewport: {
        width: 390.2,
        height: 844.7,
        offsetLeft: 12.4,
        offsetTop: 8.6,
      },
      innerWidth: 100,
      innerHeight: 200,
    }),
    {
      widthPx: "390px",
      heightPx: "845px",
      offsetLeftPx: "12px",
      offsetTopPx: "9px",
    },
  );

  assert.deepEqual(
    resolveRotateOverlayViewportVariables({
      visualViewport: null,
      innerWidth: 0,
      innerHeight: -5,
    }),
    {
      widthPx: "1px",
      heightPx: "1px",
      offsetLeftPx: "0px",
      offsetTopPx: "0px",
    },
  );
});
