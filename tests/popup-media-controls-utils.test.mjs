import { test } from "node:test";
import assert from "node:assert/strict";

import {
  buildPopupMediaControlState,
  resolvePopupMediaControlsInitPlan,
  resolvePopupMediaControlsListenerPlan,
  resolvePopupMediaSeekTarget,
} from "../src/shared/media/controls.js";
import { buildPopupMediaUrl } from "../src/shared/media/url-utils.js";
import {
  buildPopupClipRenderPlan,
  buildPopupRecordingRenderPlan,
  buildPopupRecordingScrubInitPlan,
  buildPopupRecordingSourceAttemptPlan,
  buildPopupSnapshotRenderPlan,
  resolvePopupMediaPostRenderPlan,
  resolvePopupMediaRenderPlan,
  resolvePopupRecordingSeekListenerPlan,
  resolvePopupRecordingLoadOutcomePlan,
} from "../src/features/popup/media.js";

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

test("resolvePopupMediaRenderPlan normalizes popup media rendering state", () => {
  assert.deepEqual(
    resolvePopupMediaRenderPlan({
      infoOpts: { mediaType: "Alert" },
      mediaType: "clip",
      hasMediaElement: true,
      html: "<img>",
      hasVideo: true,
    }),
    {
      popupMediaType: "alert",
      shouldAppendMediaElement: true,
      viewerHtml: "",
      controlsPlan: null,
    },
  );

  assert.deepEqual(
    resolvePopupMediaRenderPlan({
      infoOpts: null,
      mediaType: "Snapshot",
      hasMediaElement: false,
      html: '<img class="snap">',
      hasVideo: false,
    }),
    {
      popupMediaType: "snapshot",
      shouldAppendMediaElement: false,
      viewerHtml: '<img class="snap">',
      controlsPlan: {
        videoControlsEnabled: false,
        removeVideoControlsAttribute: false,
        setVideoControlsAttribute: false,
        controlsHidden: true,
        resetControlsHiddenClass: true,
        shouldBindCustomControls: false,
      },
    },
  );
});

test("resolvePopupMediaPostRenderPlan shapes popup follow-up work after viewer mount", () => {
  assert.deepEqual(
    resolvePopupMediaPostRenderPlan({
      popupMediaType: "clip",
      activeId: "ev-1",
      hasVideo: true,
    }),
    {
      shouldEnsureAirPlayButton: true,
      airPlayMediaType: "clip",
      shouldRenderInfo: true,
      shouldInitPopupMediaControls: true,
      shouldResetControlsWithoutVideo: false,
      shouldRenderCarousel: true,
      carouselMediaType: "clip",
      carouselActiveId: "ev-1",
      shouldScheduleRotateOverlay: true,
      shouldShowPopupControls: true,
    },
  );

  assert.deepEqual(
    resolvePopupMediaPostRenderPlan({
      popupMediaType: "snapshot",
      activeId: "",
      hasVideo: false,
    }),
    {
      shouldEnsureAirPlayButton: true,
      airPlayMediaType: "snapshot",
      shouldRenderInfo: true,
      shouldInitPopupMediaControls: false,
      shouldResetControlsWithoutVideo: true,
      shouldRenderCarousel: true,
      carouselMediaType: "snapshot",
      carouselActiveId: "",
      shouldScheduleRotateOverlay: true,
      shouldShowPopupControls: true,
    },
  );
});

test("buildPopupClipRenderPlan resolves clip defaults and iOS media file selection", () => {
  assert.deepEqual(
    buildPopupClipRenderPlan({
      id: "abc",
      infoEvent: { id: "abc" },
      isIos: true,
    }),
    {
      playingId: "abc",
      mediaFile: "master.m3u8",
      mediaType: "clip",
      infoEvent: { id: "abc" },
      infoOpts: { mediaType: "clip" },
    },
  );

  assert.deepEqual(
    buildPopupClipRenderPlan({
      id: "xyz",
      opts: {
        mediaType: "alert",
        startTime: 42,
        camera: "front",
      },
      infoEvent: null,
      isIos: false,
      includeLookupInfo: true,
    }),
    {
      playingId: "xyz",
      mediaFile: "clip.mp4",
      mediaType: "alert",
      infoEvent: null,
      infoOpts: {
        id: "xyz",
        mediaType: "alert",
        startTime: 42,
        camera: "front",
      },
    },
  );
});

test("buildPopupSnapshotRenderPlan resolves snapshot defaults", () => {
  assert.deepEqual(
    buildPopupSnapshotRenderPlan({
      event: { id: "snap-1" },
      opts: {},
    }),
    {
      playingId: "snap-1",
      mediaType: "snapshot",
      infoEvent: { id: "snap-1" },
      infoOpts: { mediaType: "snapshot" },
    },
  );
});

test("buildPopupRecordingRenderPlan resolves popup recording state and info options", () => {
  assert.deepEqual(
    buildPopupRecordingRenderPlan({
      start: 100,
      end: 160,
      playbackPlan: {
        clipDurationSec: 60,
        displayCamera: "front-yard",
        chunkEnd: 180,
        sourceCandidates: ["/a.m3u8", "/a.mp4"],
      },
    }),
    {
      popupMediaType: "recording",
      playing: { rec: 100 },
      infoEvent: null,
      infoOpts: {
        mediaType: "recording",
        startTime: 100,
        durationSec: 60,
        camera: "front-yard",
        objects: "-",
        zone: "-",
        score: "-",
        recStart: 100,
        recEnd: 160,
      },
      chunkEnd: 180,
      sourceCandidates: ["/a.m3u8", "/a.mp4"],
    },
  );
});

test("buildPopupRecordingSourceAttemptPlan preserves source order and autoplay policy", () => {
  assert.deepEqual(
    buildPopupRecordingSourceAttemptPlan({
      sourceCandidates: ["/a.m3u8", "/a.mp4"],
    }),
    {
      attempts: [
        { path: "/a.m3u8", autoplay: true },
        { path: "/a.mp4", autoplay: true },
      ],
    },
  );

  assert.deepEqual(
    buildPopupRecordingSourceAttemptPlan({
      sourceCandidates: ["/clip.mp4"],
      autoplay: false,
    }),
    {
      attempts: [{ path: "/clip.mp4", autoplay: false }],
    },
  );
});

test("buildPopupRecordingScrubInitPlan shapes recording scrub init payload", () => {
  assert.deepEqual(
    buildPopupRecordingScrubInitPlan({
      clientId: "client-a",
      cam: "front-yard",
      start: 100,
      chunkEnd: 180,
      token: 7,
      sourceUrl: "/api/recording.m3u8",
    }),
    {
      clientId: "client-a",
      cam: "front-yard",
      start: 100,
      end: 180,
      token: 7,
      sourceUrl: "/api/recording.m3u8",
    },
  );
});

test("resolvePopupRecordingSeekListenerPlan keeps recording seek listener order stable", () => {
  assert.deepEqual(resolvePopupRecordingSeekListenerPlan(), {
    listeners: [
      { type: "seeking", action: "pauseForSeek" },
      { type: "seeked", action: "resumeAfterSeek" },
    ],
  });
});

test("resolvePopupRecordingLoadOutcomePlan separates failure and success UI follow-up", () => {
  assert.deepEqual(resolvePopupRecordingLoadOutcomePlan({ playable: false }), {
    shouldShowError: true,
    errorHtml: '<div class="ld">Unable to load recording</div>',
    shouldTeardownScrub: true,
    shouldHideScrub: true,
    shouldEnsureAirPlayButton: false,
    shouldScheduleRotateOverlay: false,
    shouldInitPopupMediaControls: false,
    shouldRenderCarousel: false,
    shouldShowPopupControls: false,
    popupMediaType: "recording",
    airPlayMediaType: "recording",
    carouselMediaType: "recording",
    carouselActiveId: "",
  });

  assert.deepEqual(
    resolvePopupRecordingLoadOutcomePlan({
      playable: true,
      popupMediaType: "recording",
    }),
    {
      shouldShowError: false,
      errorHtml: "",
      shouldTeardownScrub: false,
      shouldHideScrub: false,
      shouldEnsureAirPlayButton: true,
      shouldScheduleRotateOverlay: true,
      shouldInitPopupMediaControls: true,
      shouldRenderCarousel: true,
      shouldShowPopupControls: true,
      popupMediaType: "recording",
      airPlayMediaType: "recording",
      carouselMediaType: "recording",
      carouselActiveId: "",
    },
  );
});

test("resolvePopupMediaControlsListenerPlan returns stable event groups for popup controls", () => {
  assert.deepEqual(
    resolvePopupMediaControlsListenerPlan({ hasProgressControl: true }),
    {
      progressEvents: [
        { type: "input", action: "scrubPreview" },
        { type: "change", action: "scrubCommit" },
        { type: "pointerdown", action: "dragStart" },
        { type: "pointerup", action: "dragEnd" },
        {
          type: "touchstart",
          action: "touchDragStart",
          options: { passive: true },
        },
        {
          type: "touchend",
          action: "touchDragEnd",
          options: { passive: true },
        },
      ],
      controlsEvents: [
        { type: "pointerdown", action: "showNow" },
        { type: "pointerup", action: "showTemporarily" },
        {
          type: "touchstart",
          action: "showNow",
          options: { passive: true },
        },
        {
          type: "touchend",
          action: "showTemporarily",
          options: { passive: true },
        },
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
        {
          type: "touchstart",
          action: "showTemporarily",
          options: { passive: true },
        },
        {
          type: "pointerdown",
          action: "showTemporarily",
          options: { passive: true },
        },
        {
          type: "mousemove",
          action: "showTemporarily",
          options: { passive: true },
        },
        {
          type: "click",
          action: "showTemporarily",
          options: { passive: true },
        },
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
