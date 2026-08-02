import { test } from "node:test";
import assert from "node:assert/strict";

import {
  buildPopupMediaUrl,
  buildPopupMediaControlState,
  resolvePopupMediaControlsInitPlan,
  resolvePopupMediaControlsListenerPlan,
  resolvePopupMediaSeekTarget,
} from "../src/card/popup-media-controls-utils.js";

test("buildPopupMediaUrl appends cache key without disturbing existing query strings", () => {
  assert.equal(
    buildPopupMediaUrl({
      baseUrl: "/api/frigate/a/notifications/id/clip.mp4",
      cacheKey: "abc",
    }),
    "/api/frigate/a/notifications/id/clip.mp4?fvc=abc",
  );
  assert.equal(
    buildPopupMediaUrl({
      baseUrl: "/api/frigate/a/notifications/id/clip.mp4?download=true",
      cacheKey: "abc:def",
    }),
    "/api/frigate/a/notifications/id/clip.mp4?download=true&fvc=abc%3Adef",
  );
  assert.equal(
    buildPopupMediaUrl({
      baseUrl: "/api/frigate/a/notifications/id/clip.mp4",
      cacheKey: "",
    }),
    "/api/frigate/a/notifications/id/clip.mp4",
  );
});

test("resolvePopupMediaControlsInitPlan separates native and custom popup control setup", () => {
  assert.deepEqual(
    resolvePopupMediaControlsInitPlan({
      shouldUseCustomControls: true,
      hasVideo: true,
    }),
    {
      videoControlsEnabled: false,
      removeVideoControlsAttribute: true,
      setVideoControlsAttribute: false,
      controlsHidden: false,
      resetControlsHiddenClass: true,
      shouldBindCustomControls: true,
    },
  );
  assert.deepEqual(
    resolvePopupMediaControlsInitPlan({
      shouldUseCustomControls: false,
      hasVideo: true,
    }),
    {
      videoControlsEnabled: true,
      removeVideoControlsAttribute: false,
      setVideoControlsAttribute: true,
      controlsHidden: true,
      resetControlsHiddenClass: true,
      shouldBindCustomControls: false,
    },
  );
  assert.deepEqual(
    resolvePopupMediaControlsInitPlan({
      shouldUseCustomControls: false,
      hasVideo: false,
    }),
    {
      videoControlsEnabled: false,
      removeVideoControlsAttribute: false,
      setVideoControlsAttribute: false,
      controlsHidden: true,
      resetControlsHiddenClass: true,
      shouldBindCustomControls: false,
    },
  );
});

test("resolvePopupMediaControlsListenerPlan returns stable event groups for popup controls", () => {
  assert.deepEqual(
    resolvePopupMediaControlsListenerPlan({ hasProgressControl: true }),
    {
      progressEvents: [
        { type: "input" },
        { type: "change" },
        { type: "pointerdown" },
        { type: "pointerup" },
        { type: "touchstart", options: { passive: true } },
        { type: "touchend", options: { passive: true } },
      ],
      controlsEvents: [
        { type: "pointerdown" },
        { type: "pointerup" },
        { type: "touchstart", options: { passive: true } },
        { type: "touchend", options: { passive: true } },
      ],
      syncVideoEvents: [
        "play",
        "pause",
        "timeupdate",
        "durationchange",
        "loadedmetadata",
        "volumechange",
        "seeking",
        "seeked",
      ],
      interactionVideoEvents: [
        { type: "touchstart", options: { passive: true } },
        { type: "pointerdown", options: { passive: true } },
        { type: "mousemove", options: { passive: true } },
        { type: "click", options: { passive: true } },
      ],
    },
  );
  assert.equal(
    resolvePopupMediaControlsListenerPlan({ hasProgressControl: false })
      .progressEvents.length,
    0,
  );
});

test("buildPopupMediaControlState formats progress, icons, and time text", () => {
  assert.deepEqual(
    buildPopupMediaControlState({
      duration: 120,
      currentTime: 30,
      paused: false,
      muted: true,
      formatTime: (value) => `${value}s`,
    }),
    {
      progressValue: "250",
      showPauseIcon: true,
      showMutedIcon: true,
      timeText: "30s/120s",
    },
  );
});

test("buildPopupMediaControlState clamps progress when time exceeds duration", () => {
  assert.deepEqual(
    buildPopupMediaControlState({
      duration: 10,
      currentTime: 15,
      paused: true,
      muted: false,
      formatTime: (value) => `${value}`,
    }),
    {
      progressValue: "1000",
      showPauseIcon: false,
      showMutedIcon: false,
      timeText: "15/10",
    },
  );
});

test("resolvePopupMediaSeekTarget clamps slider input and rejects invalid durations", () => {
  assert.equal(
    resolvePopupMediaSeekTarget({ progressValue: 250, duration: 120 }),
    30,
  );
  assert.equal(
    resolvePopupMediaSeekTarget({ progressValue: 1500, duration: 120 }),
    120,
  );
  assert.equal(
    resolvePopupMediaSeekTarget({ progressValue: -50, duration: 120 }),
    0,
  );
  assert.equal(
    resolvePopupMediaSeekTarget({ progressValue: 500, duration: 0 }),
    null,
  );
});
