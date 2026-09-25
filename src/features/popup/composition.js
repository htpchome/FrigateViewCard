import { ICONS } from "../../icons.js";
import { cap, DEVICE_PROFILE } from "../../helpers.js";
import { resolveFrigateEventDuration } from "../../integrations/frigate/event-media.js";
import {
  buildVideoOptionsForView,
  createVideoElement,
} from "../../shared/media/video-factory.js";
import {
  buildRecordingPlaybackPlan,
  formatRecordingScrubTime,
  RECORDING_SEGMENT_EXTENSION_SECONDS,
  resolveRecordingSegmentTimelineRange,
  shouldPreferRecordingHls,
} from "../recordings/index.js";
import { PopupCarouselController } from "./carousel.ctrl.js";
import { PopupInfoController } from "./info.ctrl.js";
import { PopupLifecycleController } from "./lifecycle.ctrl.js";
import { PopupMediaControlsSurfaceController } from "./media.ctrl.js";
import { PopupMediaLoaderController } from "./media-loader.ctrl.js";
import { PopupPlaybackTargetController } from "./playback-target.ctrl.js";
import { PopupRecordingScrubController } from "./recording-scrub.ctrl.js";
import { PopupToolbarController } from "./toolbar.ctrl.js";

const DEFAULT_FACTORIES = Object.freeze({
  createCarouselController: (options) =>
    new PopupCarouselController(options),
  createInfoController: (options) => new PopupInfoController(options),
  createLifecycleController: (options) =>
    new PopupLifecycleController(options),
  createMediaControlsController: (options) =>
    new PopupMediaControlsSurfaceController(options),
  createMediaLoaderController: (card, options) =>
    new PopupMediaLoaderController(card, options),
  createPlaybackTargetController: (options) =>
    new PopupPlaybackTargetController(options),
  createRecordingScrubController: (options) =>
    new PopupRecordingScrubController(options),
  createToolbarController: (options) => new PopupToolbarController(options),
});

export const createPopupControllers = (
  card,
  {
    deviceProfile = DEVICE_PROFILE,
    factories = DEFAULT_FACTORIES,
    now = () => Date.now(),
  } = {},
) => {
  const resolvedFactories = { ...DEFAULT_FACTORIES, ...factories };
  let popupLifecycleController;
  let popupMediaLoaderController;
  let popupPlaybackTargetController;

  const popupRecordingScrubController =
    resolvedFactories.createRecordingScrubController({
      query: (selector) => card._$(selector),
      t: card._localization.t,
      fetchReviews: (clientId, cam, start, end) =>
        card._browseWindowLoaderController.fetchWindowedReviews(
          clientId,
          cam,
          start,
          end,
        ),
      isPlaybackTokenCurrent: (token) => token === card._playSeq,
      isFirefox: () => card._isFirefox(),
      isEdge: () => card._isEdge(),
      isIOS: () => deviceProfile.isIOS,
      onFallbackRecording: (start, end, context = {}) =>
        popupMediaLoaderController?.showRecording(start, end, {
          compact: popupLifecycleController?.isCompact?.() === true,
          ...context,
        }),
      onDownloadSegment: (start, end, context) =>
        card._frigateMediaDownloadController.downloadRecording(
          start,
          end,
          context,
        ),
      resolveSegmentTimeline: async ({ clientId, cam, start, end }) => {
        const nowSec = Math.floor(now() / 1000);
        const recordings =
          await card._recordingsBrowseNavController?.fetchRecordingsInBounds(
            {
              start: Math.max(
                0,
                Math.floor(start) - RECORDING_SEGMENT_EXTENSION_SECONDS,
              ),
              end: Math.max(
                Math.floor(end),
                Math.min(
                  nowSec,
                  Math.floor(end) + RECORDING_SEGMENT_EXTENSION_SECONDS,
                ),
              ),
            },
            clientId,
            cam,
          );
        return resolveRecordingSegmentTimelineRange({
          recordings: recordings || [],
          start,
          end,
          nowSec,
        });
      },
      resolvePreviewSources: async (start, end, context = {}) => {
        const plan = buildRecordingPlaybackPlan({
          clientId: context.clientId,
          camera: context.cam,
          start,
          end,
          preferHls: shouldPreferRecordingHls({
            isIOS: deviceProfile.isIOS,
            isFirefox: card._isFirefox(),
            isEdge: card._isEdge(),
            isSafari: card._isSafari(),
          }),
          maxChunkSeconds: Math.max(1, Number(end) - Number(start)),
        });
        return await Promise.all(
          plan.sourceCandidates.map((path) => card._signed(path)),
        );
      },
      createPreviewVideo: () =>
        createVideoElement(
          buildVideoOptionsForView(
            "recording",
            {
              autoplay: false,
              controls: true,
              muted: false,
              playsInline: true,
              preload: "metadata",
              classNames: ["recording-segment-preview-video"],
            },
            { scopeKey: card },
          ),
        ),
      playIcon: ICONS.play,
      pauseIcon: ICONS.pause,
      formatClock: (timestamp) => card._time(timestamp),
    });

  const popupInfoController = resolvedFactories.createInfoController({
    query: (selector) => card._$(selector),
    t: card._localization.t,
    getActiveCamera: () => card._cc().cam,
    formatTime: (timestamp) => card._time(timestamp),
    formatWeekday: (timestamp) => card._weekday(timestamp),
    formatMonthDay: (timestamp, options) =>
      card._monthDay(timestamp, options),
    formatFullDate: (timestamp) => card._fullDate(timestamp),
    formatEventDuration: resolveFrigateEventDuration,
    onResetRecordingScrub: () => popupRecordingScrubController.teardown(),
    onMediaCameraChange: (camera) => {
      popupLifecycleController.setMediaCamera(camera);
    },
    onNavigateEventMedia: (id, mediaType, navigationOptions = {}) => {
      const presentation =
        navigationOptions.presentation ||
        popupLifecycleController?.presentation?.() ||
        "";
      return popupMediaLoaderController?.showCarouselEventById(
        id,
        mediaType,
        {
          compact: popupLifecycleController?.isCompact?.() === true,
          ...(presentation ? { presentation } : {}),
        },
      );
    },
    onToggleFavorite: (id) =>
      card._toggleFav(id, { toastPlacement: "popup" }),
    onDownloadEvent: (id, file) =>
      void card._frigateMediaDownloadController.downloadEvent(id, file),
    onDownloadRecording: (start, end) => {
      const camera = popupLifecycleController?.mediaCamera?.() || "";
      const context = card._frigateContextForCameraName(camera) || card._cc();
      void card._frigateMediaDownloadController.downloadRecording(
        start,
        end,
        context,
      );
    },
  });

  const popupCarouselController =
    resolvedFactories.createCarouselController({
      query: (selector) => card._$(selector),
      getKept: () => card._kept,
      getReviews: () => card._reviews,
      getDisplayEvents: () => card._allDisplayEvents(),
      findEventById: (id) => card._findEventById(id),
      mediaUrl: (id, file, camera = "") =>
        card._mediaForCamera(id, file, camera),
      formatDateTime: (timestamp) => card._dateTimeLabel(timestamp),
      formatTime: (timestamp) => card._time(timestamp),
      isTouchUi: () => card._isTouchPopupUi(),
      isMobileDevice: () => card._isLikelyMobileClient(),
      onSelectEvent: (id, mediaType) =>
        popupMediaLoaderController?.showCarouselEventById(id, mediaType),
    });

  const popupMediaControlsController =
    resolvedFactories.createMediaControlsController({
      query: (selector) => card._$(selector),
      formatTime: formatRecordingScrubTime,
      t: card._localization.t,
      shouldUseCustomControls: (mediaType) =>
        card._usePopupCustomControls(mediaType),
      isAutoHideActive: () =>
        Boolean(popupLifecycleController?.presentation?.()) ||
        card._rotateOverlayMode === "popup" ||
        !card._isMobileTabletViewport(),
      isMobileTabletViewport: () => card._isMobileTabletViewport(),
      isVideoMediaType: (mediaType) =>
        card._isPopupVideoMediaType(mediaType),
      onClearPictureInPicture: (scope) =>
        card._clearPictureInPictureButtonController(scope),
      onSyncPlaybackTargetButtons: () =>
        popupPlaybackTargetController?.syncButtons(),
      onSyncPictureInPictureButtons: () =>
        card._syncPictureInPictureButtons(),
      onSyncFullscreenButtons: () =>
        card._syncFullscreenButtonsVisibility(),
    });

  popupPlaybackTargetController =
    resolvedFactories.createPlaybackTargetController({
      getActiveContext: () => card._cc(),
      getMediaType: () => popupLifecycleController?.mediaType?.() || "",
      getPlaying: () => popupLifecycleController?.playing?.() || null,
      getRecordingRange: () => popupRecordingScrubController.range(),
      findEventById: (id) => card._findEventById(id),
      buildContext: (options) =>
        card._frigateMediaResolverController.receiverPlaybackContext(
          options,
        ),
      resolveSource: (context) =>
        card._frigateMediaResolverController.receiverPlaybackSource(
          context,
        ),
      getDisplayedVideo: () =>
        popupMediaControlsController.video() ||
        card._findVideoDeep(card._$("#viewer")),
      getMount: () => card.shadowRoot,
      queryAll: (selector) =>
        card.shadowRoot?.querySelectorAll?.(selector) || [],
      translate: (key) => card._localization.t(key),
      isVideoMediaType: (mediaType) =>
        card._isPopupVideoMediaType(mediaType),
      formatTitle: (mediaType) =>
        `${mediaType === "kept" ? "Favorite" : cap(mediaType || "video")} video`,
      onStatus: (message) => card._toast(message),
    });

  const popupToolbarController = resolvedFactories.createToolbarController({
    query: (selector) => card._$(selector),
    getMediaVideo: () => popupMediaControlsController.video(),
    findVideoDeep: (root) => card._findVideoDeep(root),
    handleMediaControlClick: (target) =>
      popupMediaControlsController.handleClick(target),
    onTakeSnapshot: () => card._takeDisplayedSnapshot("popup"),
    onTogglePictureInPicture: (video) =>
      card._togglePictureInPicture(video, { popup: true }),
    onPromptAirPlay: (displayedVideo) =>
      popupPlaybackTargetController.promptAirPlay(displayedVideo),
    onToggleMute: () => card._toggleMute(),
    onFullscreen: (target) => card._fullscreen(target),
    onCarouselNavigate: (direction) =>
      popupCarouselController.scroll(direction),
    onShowControls: () => popupMediaControlsController.showTemporarily(),
  });

  popupLifecycleController = resolvedFactories.createLifecycleController({
    query: (selector) => card._$(selector),
    isFirefox: () => card._isFirefox(),
    onPauseSlideshow: () => card._pauseSlideshowForPopup(),
    onResumeSlideshow: () => card._resumeSlideshowAfterPopup(),
    onSetLiveCovered: (covered) => card._setLivePopupCover(covered),
    onMuteLive: (muted, options) => card._applyLiveMuteChange(muted, options),
    onSyncFullscreen: () => card._syncFullscreenButtonsVisibility(),
    onSyncPictureInPicture: () => card._syncPictureInPictureButtons(),
    onScheduleOverlay: () => card._scheduleRotateOverlayUpdate(),
    onReleasePlaybackTarget: (scope) =>
      popupPlaybackTargetController.release(scope),
    onClearPictureInPicture: (scope) =>
      card._clearPictureInPictureButtonController(scope),
    onClearVideoZoom: () => card._clearPopupVideoZoom?.(),
    onDisposeCarousel: () => popupCarouselController.dispose(),
    onClearCarousel: () => popupCarouselController.clear(),
    onDisposeMediaControls: () => popupMediaControlsController.dispose(),
    onHideInfo: () => popupInfoController.hide(),
    onClearMediaTransport: () =>
      popupMediaLoaderController?.cancelPendingLoad(),
  });

  popupMediaLoaderController = resolvedFactories.createMediaLoaderController(
    card,
    {
      infoController: popupInfoController,
      carouselController: popupCarouselController,
      mediaControlsController: popupMediaControlsController,
      recordingScrubController: popupRecordingScrubController,
      lifecycleController: popupLifecycleController,
    },
  );

  return {
    _popupRecordingScrubController: popupRecordingScrubController,
    _popupInfoController: popupInfoController,
    _popupCarouselController: popupCarouselController,
    _popupMediaControlsController: popupMediaControlsController,
    _popupPlaybackTargetController: popupPlaybackTargetController,
    _popupToolbarController: popupToolbarController,
    _popupLifecycleController: popupLifecycleController,
    _popupMediaLoaderController: popupMediaLoaderController,
  };
};
