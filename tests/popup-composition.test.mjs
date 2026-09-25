import { test } from "node:test";
import assert from "node:assert/strict";

import { createPopupControllers } from "../src/features/popup/composition.js";

const createHarness = () => {
  const calls = [];
  const options = {};
  const controllers = {
    carousel: {
      clear: () => calls.push(["carousel-clear"]),
      dispose: () => calls.push(["carousel-dispose"]),
      scroll: (direction) => calls.push(["carousel-scroll", direction]),
    },
    info: {
      hide: () => calls.push(["info-hide"]),
    },
    lifecycle: {
      isCompact: () => true,
      mediaCamera: () => "deck",
      presentation: () => "drawer",
      setMediaCamera: (camera) => calls.push(["media-camera", camera]),
    },
    loader: {
      cancelPendingLoad: () => calls.push(["loader-cancel"]),
      showCarouselEventById: (...args) => {
        calls.push(["show-carousel", ...args]);
        return "carousel-result";
      },
      showRecording: (...args) => {
        calls.push(["show-recording", ...args]);
        return "recording-result";
      },
    },
    mediaControls: {
      dispose: () => calls.push(["controls-dispose"]),
      handleClick: (target) => {
        calls.push(["controls-click", target]);
        return true;
      },
      showTemporarily: () => calls.push(["controls-show"]),
      video: () => "popup-video",
    },
    mediaPresentation: {
      clear: () => calls.push(["clear-zoom"]),
    },
    playbackTarget: {
      dispose: () => calls.push(["target-dispose"]),
      prepare: () => calls.push(["prepare-target"]),
      promptAirPlay: (displayedVideo) =>
        calls.push([
          "prompt-target",
          "airplay",
          { scope: "popup", displayedVideo },
        ]),
      release: (scope) => calls.push(["release-target", scope]),
      syncButtons: () => calls.push(["sync-targets"]),
    },
    recordingScrub: {
      teardown: () => calls.push(["scrub-teardown"]),
    },
    toolbar: {
      handleClick: (target) => calls.push(["toolbar-click", target]),
    },
  };
  const factories = {
    createCarouselController: (value) => {
      options.carousel = value;
      return controllers.carousel;
    },
    createInfoController: (value) => {
      options.info = value;
      return controllers.info;
    },
    createLifecycleController: (value) => {
      options.lifecycle = value;
      return controllers.lifecycle;
    },
    createMediaControlsController: (value) => {
      options.mediaControls = value;
      return controllers.mediaControls;
    },
    createMediaLoaderController: (value, deps) => {
      calls.push(["loader-host", value, deps]);
      return controllers.loader;
    },
    createMediaPresentationController: (value) => {
      options.mediaPresentation = value;
      return controllers.mediaPresentation;
    },
    createPlaybackTargetController: (value) => {
      options.playbackTarget = value;
      return controllers.playbackTarget;
    },
    createRecordingScrubController: (value) => {
      options.recordingScrub = value;
      return controllers.recordingScrub;
    },
    createToolbarController: (value) => {
      options.toolbar = value;
      return controllers.toolbar;
    },
  };
  const card = {
    _allDisplayEvents: () => ["display-event"],
    _applyLiveMuteChange: (...args) => calls.push(["live-mute", ...args]),
    _browseWindowLoaderController: {
      fetchWindowedReviews: (...args) => {
        calls.push(["fetch-reviews", ...args]);
        return "reviews-result";
      },
    },
    _cc: () => ({ cam: "doorbell", clientId: "default-client" }),
    _clearPictureInPictureButtonController: (scope) =>
      calls.push(["clear-pip", scope]),
    _dateTimeLabel: (value) => `date-time:${value}`,
    _findEventById: (id) => ({ id }),
    _findVideoDeep: (root) => {
      calls.push(["find-video", root]);
      return "deep-video";
    },
    _fullscreen: (target) => calls.push(["fullscreen", target]),
    _frigateContextForCameraName: (camera) => ({ cam: camera }),
    _frigateMediaDownloadController: {
      downloadEvent: (...args) => calls.push(["download-event", ...args]),
      downloadRecording: (...args) =>
        calls.push(["download-recording", ...args]),
    },
    _frigateMediaResolverController: {
      receiverPlaybackContext: (options) => ({ options }),
      receiverPlaybackSource: (context) => ({ context }),
    },
    _fullDate: (value) => `full-date:${value}`,
    _isEdge: () => false,
    _isFirefox: () => false,
    _isLikelyMobileClient: () => true,
    _isMobileTabletViewport: () => true,
    _isPopupVideoMediaType: (type) => type === "clip",
    _isSafari: () => false,
    _isTouchPopupUi: () => true,
    _kept: ["kept"],
    _localization: { t: (key) => `translated:${key}` },
    _mediaForCamera: (...args) => `media:${args.join(":")}`,
    _monthDay: (value) => `month-day:${value}`,
    _dismissLinkedLightDimmers: () => calls.push(["dismiss-dimmers"]),
    _pauseSlideshowForPopup: () => calls.push(["pause-slideshow"]),
    _playSeq: 7,
    _recordingsBrowseNavController: {
      fetchRecordingsInBounds: (...args) => {
        calls.push(["fetch-recordings", ...args]);
        return [];
      },
    },
    _resumeSlideshowAfterPopup: () => calls.push(["resume-slideshow"]),
    _reviews: ["review"],
    _rotateOverlayMode: "",
    _scheduleRotateOverlayUpdate: () => calls.push(["schedule-overlay"]),
    _setLivePopupCover: (covered) => calls.push(["live-cover", covered]),
    _signed: (path) => `signed:${path}`,
    _syncFullscreenButtonsVisibility: () => calls.push(["sync-fullscreen"]),
    _syncPictureInPictureButtons: () => calls.push(["sync-pip"]),
    _takeDisplayedSnapshot: (scope) => calls.push(["take-snapshot", scope]),
    _time: (value) => `time:${value}`,
    _toggleFav: (...args) => calls.push(["favorite", ...args]),
    _toggleMute: () => calls.push(["toggle-mute"]),
    _togglePictureInPicture: (...args) => calls.push(["toggle-pip", ...args]),
    _toast: (message) => calls.push(["toast", message]),
    _usePopupCustomControls: (type) => type === "clip",
    _weekday: (value) => `weekday:${value}`,
    _$: (selector) => `node:${selector}`,
    shadowRoot: {
      querySelectorAll: () => [],
    },
  };

  return { calls, card, controllers, factories, options };
};

test("popup composition creates the complete controller set and preserves cross-controller actions", () => {
  const { calls, card, controllers, factories, options } = createHarness();
  const result = createPopupControllers(card, {
    deviceProfile: { isIOS: false },
    factories,
  });

  assert.deepEqual(result, {
    _popupRecordingScrubController: controllers.recordingScrub,
    _popupInfoController: controllers.info,
    _popupCarouselController: controllers.carousel,
    _popupMediaControlsController: controllers.mediaControls,
    _popupMediaPresentationController: controllers.mediaPresentation,
    _popupPlaybackTargetController: controllers.playbackTarget,
    _popupToolbarController: controllers.toolbar,
    _popupLifecycleController: controllers.lifecycle,
    _popupMediaLoaderController: controllers.loader,
  });
  assert.deepEqual(calls.shift(), [
    "loader-host",
    card,
    {
      infoController: controllers.info,
      carouselController: controllers.carousel,
      mediaControlsController: controllers.mediaControls,
      mediaPresentationController: controllers.mediaPresentation,
      recordingScrubController: controllers.recordingScrub,
      lifecycleController: controllers.lifecycle,
    },
  ]);

  assert.equal(
    options.recordingScrub.fetchReviews("client", "cam", 10, 20),
    "reviews-result",
  );
  assert.equal(
    options.recordingScrub.onFallbackRecording(10, 20, { clientId: "c1" }),
    "recording-result",
  );
  options.recordingScrub.onDownloadSegment(10, 20, { cam: "deck" });
  assert.equal(options.recordingScrub.isPlaybackTokenCurrent(7), true);

  options.info.onResetRecordingScrub();
  options.info.onMediaCameraChange("garage");
  assert.equal(
    options.info.onNavigateEventMedia("event-1", "clip"),
    "carousel-result",
  );
  options.info.onToggleFavorite("event-1");
  options.info.onDownloadEvent("event-1", "clip");
  options.info.onDownloadRecording(30, 40);
  options.carousel.onSelectEvent("event-2", "snapshot");

  options.mediaControls.onClearPictureInPicture("popup");
  options.mediaControls.onSyncPlaybackTargetButtons();
  options.mediaControls.onSyncPictureInPictureButtons();
  options.mediaControls.onSyncFullscreenButtons();
  assert.equal(options.mediaControls.isAutoHideActive(), true);
  assert.equal(
    options.info.formatEventDuration({ start_time: 100, end_time: 112 }),
    12,
  );

  assert.equal(options.toolbar.getMediaVideo(), "popup-video");
  assert.equal(options.toolbar.findVideoDeep("viewer"), "deep-video");
  assert.equal(options.toolbar.handleMediaControlClick("media-target"), true);
  options.toolbar.onTakeSnapshot();
  options.toolbar.onTogglePictureInPicture("video");
  options.toolbar.onPromptAirPlay("airplay-video");
  options.toolbar.onToggleMute();
  options.toolbar.onFullscreen("popup-body");
  options.toolbar.onCarouselNavigate(-1);
  options.toolbar.onShowControls();

  options.lifecycle.onDisposeCarousel();
  options.lifecycle.onClearCarousel();
  options.lifecycle.onDisposeMediaControls();
  options.lifecycle.onClearVideoZoom();
  options.lifecycle.onHideInfo();
  options.lifecycle.onClearMediaTransport();

  assert.deepEqual(calls, [
    ["fetch-reviews", "client", "cam", 10, 20],
    ["show-recording", 10, 20, { compact: true, clientId: "c1" }],
    ["download-recording", 10, 20, { cam: "deck" }],
    ["scrub-teardown"],
    ["media-camera", "garage"],
    [
      "show-carousel",
      "event-1",
      "clip",
      { compact: true, presentation: "drawer" },
    ],
    ["favorite", "event-1", { toastPlacement: "popup" }],
    ["download-event", "event-1", "clip"],
    ["download-recording", 30, 40, { cam: "deck" }],
    ["show-carousel", "event-2", "snapshot"],
    ["clear-pip", "popup"],
    ["sync-targets"],
    ["sync-pip"],
    ["sync-fullscreen"],
    ["find-video", "viewer"],
    ["controls-click", "media-target"],
    ["take-snapshot", "popup"],
    ["toggle-pip", "video", { popup: true }],
    [
      "prompt-target",
      "airplay",
      { scope: "popup", displayedVideo: "airplay-video" },
    ],
    ["toggle-mute"],
    ["fullscreen", "popup-body"],
    ["carousel-scroll", -1],
    ["controls-show"],
    ["carousel-dispose"],
    ["carousel-clear"],
    ["controls-dispose"],
    ["clear-zoom"],
    ["info-hide"],
    ["loader-cancel"],
  ]);
});

test("popup composition keeps recording timeline expansion inside the popup feature", async () => {
  const { calls, card, controllers, factories, options } = createHarness();
  createPopupControllers(card, {
    deviceProfile: { isIOS: false },
    factories,
    now: () => 200_000,
  });

  await options.recordingScrub.resolveSegmentTimeline({
    clientId: "client",
    cam: "doorbell",
    start: 100,
    end: 150,
  });

  assert.deepEqual(calls, [
    [
      "loader-host",
      card,
      {
        infoController: controllers.info,
        carouselController: controllers.carousel,
        mediaControlsController: controllers.mediaControls,
        mediaPresentationController: controllers.mediaPresentation,
        recordingScrubController: controllers.recordingScrub,
        lifecycleController: controllers.lifecycle,
      },
    ],
    [
      "fetch-recordings",
      { start: 0, end: 200 },
      "client",
      "doorbell",
    ],
  ]);
});
