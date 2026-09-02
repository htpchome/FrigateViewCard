import {
  VERSION,
  CARD_TAG,
  DEFAULT_TITLE,
  DEFAULT_SUBTITLE,
  DAY,
  RECORDINGS_WINDOW,
  REALTIME_HEAD_POLL_MS,
  REALTIME_RELOAD_DEBOUNCE_MS,
  REALTIME_POLL_OPTIONS_SECONDS,
  MOBILE_BATTERY_SAVER_POLL_SECONDS,
  SNAPSHOT_UPDATE_SECONDS,
  SNAPSHOT_UPDATE_OPTIONS_SECONDS,
  SLIDESHOW_ROTATION_OPTIONS_SECONDS,
  GRID_ROTATION_OPTIONS_SECONDS,
  SLIDESHOW_ALERT_HOLD_MS,
  SLIDESHOW_ALERT_HOLD_OPTIONS_SECONDS,
  SLIDESHOW_REVIEW_FRESHNESS_GRACE_SEC,
  SLIDESHOW_REVIEW_WATCH_MIN_MS,
  SLIDESHOW_REVIEW_WATCH_MAX_MS,
  GRID_ALERT_HOLD_MS,
  GRID_ALERT_HOLD_OPTIONS_SECONDS,
  PREVIEW_ALERT_HOLD_MS,
  PREVIEW_ALERT_LIVE_DURATION_OPTIONS_SECONDS,
  PREVIEW_ALERT_END_GRACE_MS,
  MSE_SWITCH_GRACE_MS,
  MSE_SWITCH_GRACE_MAX,
  MAX_CAMERAS,
  DEFAULT_CAMERA_CONNECTION_TYPE,
  DEFAULT_HIDDEN_TABS,
  ALLOWED_HIDDEN_TABS,
} from "../constants.js";
import { ICONS } from "../icons.js";
import { STYLES } from "../styles.js";
import "../components/circle-pad/circle-pad.js";
import {
  detectDeviceProfile,
  DEVICE_PROFILE,
  isAndroid,
  cap,
  parseWs,
  normalizePositiveInteger,
  normalizeNumberChoice,
  normalizeCameraConnectionType,
  normalizeThemeCustomConfig,
  normalizeThemeCustomDefaultsConfig,
  DIALOG_ACTION_SELECTOR,
  setSettingsPanelActiveState,
  dialogActionKindFromElement,
  dialogActionKindFromEvent,
  wireCameraRowDragAndDrop,
  setFieldErrorState,
  bindNumericInputField,
  bindSelectorSyncEvents,
  setupSelectSelector,
  setupEntitySelector,
  bindThemeControlEvents,
  bindClickHandler,
  bindClickHandlers,
  bindEachClickHandler,
  bindEventsForIds,
  bindEventsForSelectorAll,
  buildEditorConfigFromDom,
  createEditorPreviewDraft,
  LABEL_COLORS,
  PALETTE,
  labelColor,
  CAM_COLORS,
  mkCamState,
  camDisplayName,
  normalizeCameraConfig,
  configuredCameraEntities,
  hassThemeSignature,
  hassEntityStateSignature,
} from "../helpers.js";
import {
  allowsDashboardPageSwipeNavigation,
  createNavigationFactory,
  DEVICE_ROUTE_BUCKETS,
  getEnabledPageRoutes,
  isDashboardSwipeNavigationEnabled,
  normalizeDashboardSwipeNavigationMode,
  normalizeMobilePageMode,
  normalizePageRoute,
  PAGE_IDS,
  resolveAdjacentPageSwipeRoute,
  resolveDashboardSwipePageSelection,
  resolveDeviceRouteBucket,
  resolveEnabledMobilePageMode,
  resolveMobilePreviewDestination,
  resolvePageSwipeOrder,
} from "../features/navigation/router.js";
import { HomeAssistantNavbarController } from "../integrations/home-assistant/navbar.ctrl.js";
import { HomeAssistantPageBackgroundController } from "../integrations/home-assistant/page-background.ctrl.js";
import { HomeAssistantDashboardSwipeNavigationController } from "../integrations/home-assistant/dashboard-swipe-navigation.ctrl.js";
import {
  PAGE_SHELL_REGIONS,
  createPageShellRegistry,
  registerDefaultPageShellProfiles,
  resolvePageCapabilities,
  resolvePageInfoRowMarkup,
  resolvePageMainLayoutShellMarkup,
  resolveRequiredPageShellRegions,
  validatePageShellRegionMarkup,
} from "../features/navigation/page-shell-registry.js";
import {
  cameraMemberEntities,
  flattenCameraMembers,
  isCameraGroup,
  limitCameraConfigsByPhysicalCount,
} from "../features/camera-groups/model.js";
import { normalizeGridOrderConfig } from "../features/grid/config.js";
import { applyEditorPreviewDraftToCardConfig } from "../config/preview-mapper.js";
import {
  buildFrigateNotificationMediaPath,
  buildFrigateReviewThumbnailPath,
} from "../integrations/frigate/url.js";
import { resolveFrigateEventPrePostRollRange } from "../integrations/frigate/event-media.js";
import { FrigateMediaDownloadController } from "../integrations/frigate/media-download.ctrl.js";
import {
  discoverFrigateCameraState,
  resolveCameraConnectionType,
  resolveGo2RtcEntity,
  shouldUseGo2RtcForEntity,
} from "../integrations/frigate/camera-context.js";
import {
  haReviewStatusForCamera,
  haReviewStatusSeverity,
  haReviewStatusSignature,
} from "../integrations/frigate/review-status.js";
import { createGo2RtcResolver } from "../integrations/frigate/go2rtc-resolver.js";
import { createHaDirectTwoWayTalkMounter } from "../integrations/home-assistant/two-way-talk-mounter.js";
import { createGo2RtcMounter } from "../features/live/go2rtc-mounter.js";
import {
  invalidateMountTrackingIfActive,
  isMseReturnRemountReason,
  isLiveVideoStale,
  resolveCameraSwitchCleanupOptions,
  resolveCameraSwitchTransportEntity,
  resolveLiveKickIfStaleAction,
  resolveLiveKickProbeState,
  resolveLiveResumeAction,
  shouldForceLiveRemountForReason,
  shouldPreserveLiveRemountReasonWhileWaiting,
  shouldResetMseOnQuickReconnect,
} from "../features/live/mount-lifecycle.js";
import {
  adoptMountedAttemptResult,
  adoptMountedAttemptSlot,
  cleanupStaleWinnerResult,
  isMountTokenCurrent,
} from "../features/live/mount-result.js";
import {
  applyActiveStreamTypeForCard,
  applyStreamFallbackVisibilityForCard,
  applyStreamLoadingStateForCard,
  resolveCameraAvailabilitySnapshot,
} from "../features/live/stream.state.js";
import {
  resolveRotateOverlayExitPlan,
  resolveFullscreenButtonVisibility,
  resolveRotateOverlayNativeControlsPlan,
  resolveRotateOverlayState,
  resolveRotateOverlayUiPlan,
  resolveRotateOverlayVideoStyles,
  resolveRotateOverlayViewportVariables,
} from "../features/live/rotate-overlay-state.js";
import {
  buildVideoOptionsForView,
  configureVideoElement,
  createVideoElement,
  disableNativePictureInPicture,
  enableNativePictureInPicture,
  mountNodeIntoSlot,
  setScopedVideoViewDefaultOptions,
  supportsNativeHlsPlayback,
} from "../shared/media/video-factory.js";
import { attachVideoZoom } from "../shared/media/video-zoom.ctrl.js";
import { CameraGroupLiveController } from "../features/camera-groups/live.ctrl.js";
import { LinkedLightController } from "../features/linked-entities/light.ctrl.js";
import {
  PictureInPictureButtonController,
  resolveVideoPictureInPictureSupport,
  toggleVideoPictureInPicture,
} from "../shared/media/picture-in-picture.js";
import {
  BrowserPlaybackTargetController,
  PLAYBACK_TARGET_AIRPLAY,
} from "../shared/media/playback-target.js";
import { buildFrigateReceiverMediaPath } from "../integrations/frigate/receiver-media.js";
import { resolveAbsoluteReceiverSourceUrl } from "../integrations/home-assistant/receiver-source.js";
import {
  loadFallbackAltForCard,
  loadFallbackPrimaryForCard,
} from "../features/live/fallbacks/fallback-url.js";
import {
  applyFallbackImageHandlers,
  setFallbackImageSourceIfChanged,
} from "../features/live/fallbacks/fallback-image.js";
import { runFallbackRefreshCycleForCard } from "../features/live/fallbacks/fallback-refresh.js";
import { createHaDirectMounter } from "../features/live/ha-direct-mounter.js";
import { createLiveMountController } from "../features/live/mount-controller.js";
import { createGo2RtcRaceMounter } from "../features/live/go2rtc-race-mounter.js";
import { createMseGraceController } from "../features/live/mse-grace-controller.js";
import {
  buildLiveEngineWrapMarkup,
  buildLiveFullscreenControlMarkup,
  buildLivePictureInPictureControlMarkup,
  buildLiveTakeSnapshotControlMarkup,
  buildLiveMuteControlMarkup,
} from "../features/live/view.tmpl.js";
import { LiveViewResizeController } from "../features/live/live-view-resize.ctrl.js";
import { LiveFullscreenLifecycleController } from "../features/live/fullscreen-lifecycle.ctrl.js";
import { GridMediaController } from "../features/grid/media.ctrl.js";
import {
  buildMobileViewBackButtonMarkup,
} from "../features/mobile-view/page.tmpl.js";
import {
  buildControlsSectionMarkup,
  buildCamSwitcherRegionMarkup,
  buildInfoRowMarkup,
  buildPageNavButtonsMarkup,
  buildPageNavMarkup,
  buildPopupShellMarkup,
  buildBrowseHeaderRegionMarkup,
  buildBrowseRegionMarkup,
  buildFooterMarkup,
  buildTabsMarkup,
  buildTabsRegionMarkup,
  buildToolsMarkup,
  buildToolsRegionMarkup,
  resolveToolbarModeButtonStates,
} from "./controls/shell-nav.tmpl.js";
import {
  buildCalendarPanelMarkup,
  buildFilterPanelMarkup,
} from "../features/browse/calendar-filter.tmpl.js";
import { BrowseCalendarPanelController } from "../features/browse/calendar-panel.ctrl.js";
import {
  buildFavoriteOptimisticMutation,
  buildFavoriteRollbackMutation,
} from "../shared/favorite-mutation.js";
import { createDateFormatterCache } from "../shared/date-formatter-cache.js";
import { ListScrollController } from "../features/browse/scroll.ctrl.js";
import {
  MediaOverlayControlsController as LiveOverlayControlsController,
} from "../shared/media/overlay-controls.ctrl.js";
import { PopupInfoController } from "../features/popup/info.ctrl.js";
import { PopupMediaControlsSurfaceController } from "../features/popup/media.ctrl.js";
import { PopupCarouselController } from "../features/popup/carousel.ctrl.js";
import { PopupRecordingScrubController } from "../features/popup/recording-scrub.ctrl.js";
import { PopupLifecycleController } from "../features/popup/lifecycle.ctrl.js";
import { BrowseCollectionController } from "../features/browse/collection.ctrl.js";
import { BrowseCalendarActivityController } from "../features/browse/calendar-activity.ctrl.js";
import { BrowseFilterController } from "../features/browse/filter-state.js";
import { BrowseTabDataController } from "../features/browse/tab-data.ctrl.js";
import { BrowseWindowLoaderController } from "../features/browse/window-loader.ctrl.js";
import {
  buildRecordingPlaybackPlan,
  buildRecordingsListMarkup,
  RecordingsBrowseNavController,
  RecordingsSwipeController,
  formatRecordingScrubTime,
  normalizeFetchedRecordingsAvailability,
  RECORDING_SEGMENT_EXTENSION_SECONDS,
  resolveRecordingSegmentTimelineRange,
  resolveRecordingsBrowseNavContextState,
  resolveRecordingsBrowseNavProbePlan,
  resolveRecordingsBrowseNavState,
  splitRecordingsHourly,
} from "../features/recordings/index.js";
import {
  hasCameraPtz,
  hasPtzPanTiltCapability,
  isPtzHomePreset,
  isPtzDirectionAction,
  isPtzControlsPadEvent,
  normalizePtzPresetNames,
  resolvePtzDisplayZoomPlan,
  resolvePtzHoldPlan,
  resolvePtzServicePlan,
} from "../features/ptz/index.js";
import { PtzMotionController } from "../features/ptz/motion.ctrl.js";
import {
  releaseTwoWayTalkTouchFocus,
  shouldRenderTwoWayTalkButton,
} from "../features/two-way-talk/index.js";
import {
  startGo2RtcTwoWayTalkSession,
  startHaDirectTwoWayTalkSession,
} from "../features/two-way-talk/session.js";
import {
  buildTwoWayTalkSoundwaveMarkup,
  TwoWayTalkSoundwaveController,
} from "../features/two-way-talk/soundwave.ctrl.js";
import {
  buildReviewListItemHtml,
  buildReviewListItemModel,
} from "../data/review-list.model.js";
import {
  buildEventListItemHtml,
  buildEventListItemModel,
} from "../data/event-list.model.js";
import { resolveActiveListScroller } from "../shared/list-render.js";
import {
  buildDisplayedFrameFilename,
  captureDisplayedFrame,
  downloadDisplayedFrame,
} from "../shared/media/frame-capture.js";
import { PreviewAlertController } from "../features/preview/alert.ctrl.js";
import { PreviewPageController } from "../features/preview/page.ctrl.js";
import { PageNavigationController } from "../features/navigation/page-navigation.ctrl.js";
import { DeepLinkController } from "../features/navigation/deep-link.ctrl.js";
import { GridAlertController } from "../features/grid/alert.ctrl.js";
import { GridPageController } from "../features/grid/page.ctrl.js";
import { CardStyleContextController } from "../features/card-style/context.ctrl.js";
import {
  normalizeCardHeight,
  normalizeCardHeightUnit,
} from "../features/card-style/config.js";
import {
  normalizeWideLeftWidth,
  normalizeWideTimelineScale,
} from "../features/wide-view/config.js";
import {
  EDITOR_PREVIEW_ROUTE_INTENTS,
  EditorPreviewContextController,
} from "../features/editor-preview/context.ctrl.js";
import { PopupMediaLoaderController } from "../features/popup/media-loader.ctrl.js";
import { ViewportContextController } from "../features/viewport/context.ctrl.js";
import { MobileViewPageController } from "../features/mobile-view/page.ctrl.js";
import { MobileCamSwitcherController } from "../features/mobile-view/cam-switcher.ctrl.js";
import {
  MOBILE_VIEW_ACTIVE_CLASS,
  MOBILE_VIEW_ROTATE_COVER_CLASS,
} from "../features/mobile-view/utils.js";
import { SingleViewPageController } from "../features/single-view/page.ctrl.js";
import { buildSingleViewMainLayoutShellMarkup } from "../features/single-view/page.tmpl.js";
import { WideViewPageController } from "../features/wide-view/page.ctrl.js";
import { WideViewCompanionController } from "../features/wide-view/companion.ctrl.js";
import {
  resolveWideTimelineCameraContextKey,
  WideViewTimelineController,
} from "../features/wide-view/timeline.ctrl.js";
import { CardViewPageController } from "../features/card-view/page.ctrl.js";
import { SlideshowAlertController } from "../features/slideshow/alert.ctrl.js";
import { SlideshowPageController } from "../features/slideshow/page.ctrl.js";
import {
  slideshowReviewModeForCamera,
  shouldHandleSlideshowReview,
  cameraIndexForIncomingCamera,
  cameraEntityForIncomingCamera,
  normalizeReviewSeverity,
  reviewStartTimeSec,
  cameraIndexByEntity,
  extractRealtimeMessageCamera,
  extractRealtimeMessageSeverity,
} from "../features/slideshow/routing.js";

export class FrigateViewCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this._onShadowClick = (e) => this._click(e);
    this.shadowRoot.addEventListener("click", this._onShadowClick);
    this._onShadowError = (e) => {
      const img = e.target;
      if (!(img instanceof HTMLImageElement)) return;
      const id = img.dataset.thumbId;
      if (!id) return;
      img.style.display = "none";
      const placeholder = img.nextElementSibling;
      if (placeholder) placeholder.style.display = "flex";
    };

    this.shadowRoot.addEventListener("error", this._onShadowError, true);
    this._onCirclePadPress = (event) => {
      void this._handleCirclePadPtzEvent(event, "press");
    };
    this._onCirclePadRelease = (event) => {
      void this._handleCirclePadPtzEvent(event, "release");
    };
    this._onPtzControlPointerDown = (event) => {
      if (this._linkedLightController?.handlePointerDown?.(event)) return;
      void this._handlePtzControlPointerDown(event);
    };
    this._onPtzControlPointerStop = (event) => {
      this._linkedLightController?.handlePointerStop?.(event);
      void this._handlePtzControlPointerStop(event);
    };
    this.shadowRoot.addEventListener(
      "circle-pad-press",
      this._onCirclePadPress,
    );
    this.shadowRoot.addEventListener(
      "circle-pad-release",
      this._onCirclePadRelease,
    );
    this.shadowRoot.addEventListener(
      "pointerdown",
      this._onPtzControlPointerDown,
    );
    this.shadowRoot.addEventListener(
      "pointerup",
      this._onPtzControlPointerStop,
    );
    this.shadowRoot.addEventListener(
      "pointercancel",
      this._onPtzControlPointerStop,
    );
    this.shadowRoot.addEventListener(
      "lostpointercapture",
      this._onPtzControlPointerStop,
    );
    this._hass = null;
    this._lastHassCameraStateSignature = "";
    this._lastHassLinkedLightStateSignature = "";
    this._lastHassThemeSignature = "";
    this._lastHassReviewStatusSignature = "";
    this._lastHaReviewStatusApplyAt = 0;
    this._activeCameraAvailability = null;
    this._config = null;
    this._navigationFactory = null;
    this._pageId = PAGE_IDS.singleView;
    this._lastNonPreviewPageId = PAGE_IDS.singleView;
    this._started = false;
    this._activeCamIdx = 0;
    this._activeGroupMemberOverride = "";
    this._preservingLiveShell = false;
    this._camCache = {};
    this._dateFormatterCache = createDateFormatterCache();
    this._resolvedBrowserTimeZone = null;
    this._go2rtcResolver = createGo2RtcResolver({
      getHass: () => this._hass,
      getConfig: () => this._config,
      getActiveEntity: () => this._activeCam?.entity || "",
      getCamCache: () => this._camCache,
      defaultConnectionType: DEFAULT_CAMERA_CONNECTION_TYPE,
      normalizeCameraConnectionType,
      createCameraState: mkCamState,
      discoverEntity: async (entity) => {
        await this._discoverOne(entity);
      },
      supportsNativeHlsPlayback: () => this._supportsNativeHlsPlayback(),
    });
    this._go2rtcMounter = createGo2RtcMounter({
      resolver: this._go2rtcResolver,
      getStreamMuted: () => this._streamMuted,
      waitForStreamStart: (streamEl, timeoutMs, opts) =>
        this._waitForStreamStart(streamEl, timeoutMs, opts),
      attachVideoFit: (streamEl) => this._attachVideoFit(streamEl),
      assignCommittedEngine: (engine) => this._assignLiveEngine(engine),
      onCommittedStream: (type) => {
        this._setActiveStreamType(type);
        this._setStreamLoading(false);
        this._setStreamFallbackVisible(false);
      },
      scheduleResumeLive: (reason) => this._scheduleResumeLive(reason),
      isFirefox: () => this._isFirefox(),
      scopeKey: this,
      resetMseDiagnostics: (connectedAt) => {
        this._mseConnectAt = connectedAt;
        this._mseLastChunkAt = 0;
        this._mseChunkCount = 0;
      },
      markMseChunk: (chunkAt) => {
        this._mseLastChunkAt = chunkAt;
        this._mseChunkCount += 1;
      },
    });
    this._haDirectMounter = createHaDirectMounter({
      getHass: () => this._hass,
      getPreferredStreamType: () => this._preferredStreamType(),
      getStreamMuted: () => this._streamMuted,
      getRotateOverlayActive: () => this._rotateOverlayActive,
      isCurrentEngine: (streamEl) => this._engine === streamEl,
      waitForStreamStart: (streamEl, timeoutMs, opts) =>
        this._waitForStreamStart(streamEl, timeoutMs, opts),
      attachVideoFit: (streamEl) => this._attachVideoFit(streamEl),
      assignCommittedEngine: (engine) => this._assignLiveEngine(engine),
      applyResolvedStreamUiState: (streamState) =>
        this._applyResolvedStreamUiState(streamState),
      setLiveNativeControls: (enabled) => this._setLiveNativeControls(enabled),
    });
    this._haDirectTwoWayTalkMounter = createHaDirectTwoWayTalkMounter({
      getHass: () => this._hass,
      getStreamMuted: () => this._streamMuted,
      waitForStreamStart: (streamEl, timeoutMs, opts) =>
        this._waitForStreamStart(streamEl, timeoutMs, opts),
      attachVideoFit: (streamEl) => this._attachVideoFit(streamEl),
      assignCommittedEngine: (engine) => this._assignLiveEngine(engine),
      onCommittedStream: (type) => {
        this._setActiveStreamType(type);
        this._setStreamLoading(false);
        this._setStreamFallbackVisible(false);
      },
      scheduleResumeLive: (reason) => this._scheduleResumeLive(reason),
      scopeKey: this,
    });
    this._go2rtcRaceMounter = createGo2RtcRaceMounter({
      mounter: this._go2rtcMounter,
      isMobile: DEVICE_PROFILE.isMobile,
      resolveConnectionType: (entity) => this._cameraConnectionType(entity),
      getPendingMountDestroyers: () => this._pendingMountDestroyers || [],
      setPendingMountDestroyers: (pendingDestroyers) => {
        this._pendingMountDestroyers = pendingDestroyers;
      },
      isMountTokenCurrent: (mountToken) =>
        isMountTokenCurrent({ mountToken, mountSeq: this._mountSeq }),
      adoptMountedAttempt: (slot, winner, options = {}) =>
        adoptMountedAttemptResult({
          targetSlot: slot,
          result: winner,
          preservePendingSlots: options.preservePendingSlots === true,
          streamMuted: this._streamMuted,
          rotateOverlayActive: this._rotateOverlayActive,
          assignEngine: (engine) => this._assignLiveEngine(engine),
          setEngineMountedMuted: (muted) => {
            this._engineMountedMuted = muted;
          },
          setActiveStreamType: (type) => this._setActiveStreamType(type),
          setStreamLoading: (loading) => this._setStreamLoading(loading),
          setStreamFallbackVisible: (visible) =>
            this._setStreamFallbackVisible(visible),
          setLiveNativeControls: (enabled) =>
            this._setLiveNativeControls(enabled),
        }),
      waitForStreamStart: (streamEl, timeoutMs, opts) =>
        this._waitForStreamStart(streamEl, timeoutMs, opts),
      isCurrentWinnerEngine: (engine) => this._engine === engine,
      getPendingWebRtcTakeoverTimer: () => this._pendingWebRTCTakeoverTimer,
      setPendingWebRtcTakeoverTimer: (timer) => {
        this._pendingWebRTCTakeoverTimer = timer;
      },
    });
    this._viewMode = "single";
    this._eventsMode = "camera";
    this._events = [];
    this._recordings = [];
    this._reviews = [];
    this._kept = [];
    this._tab = "alerts";
    this._lastNonControlsTab = "alerts";
    this._mobileCamSwitcherOpen = false;
    this._browseOpen = false;
    this._winEnd = 0;
    this._winStart = 0;
    this._followNowWindow = true;
    this._loading = false;
    this._exhausted = false;
    this._daysWithActivity = new Set();
    this._calendarActivityByCam = new Map();
    this._calendarActivityInFlight = new Map();
    this._filterLabel = "all";
    this._filterZone = "all";
    this._favOnly = false;
    this._calMonth = null;
    this._calSelectedDay = null;
    this._engine = null;
    this._gridEngine = null;
    this._unsub = null;
    this._rotateTimer = null;
    this._cardWidth = 0;
    this._playSeq = 0;
    this._streamMuted = true;
    this._activeStreamType = "--";
    this._lastLiveStreamHint = "";
    this._activePtzButtonAction = "";
    this._activePtzButtonPointerId = null;
    this._slideshowActive = false;
    this._slideshowPausedUntil = 0;
    this._slideshowPendingAlertCam = "";
    this._slideshowPendingAlertType = "";
    this._slideshowLastAlertAt = 0;
    this._slideshowLastAlertCam = "";
    this._slideshowAttentionType = "";
    this._slideshowHandledReviewIds = new Set();
    this._slideshowStartedAtSec = 0;
    this._slideshowReviewProbeT = null;
    this._slideshowReviewWatchT = null;
    this._slideshowReviewProbeInFlight = false;
    this._slideshowSwitchT = null;
    this._slideshowPauseT = null;
    this._slideshowFadeT = null;
    this._slideshowPopupPaused = false;
    this._slideshowNextSwitchAtMs = 0;
    this._slideshowCountdownT = null;
    this._gridRotationStart = 0;
    this._gridRotationT = null;
    this._gridAlertReturnT = null;
    this._gridRefreshT = null;
    this._snapshotRefreshT = null;
    this._gridResumePending = false;
    this._gridPinnedRotationStart = 0;
    this._gridLastRenderSignature = "";
    this._gridAlertController = new GridAlertController(this, {
      DAY,
      SLIDESHOW_REVIEW_FRESHNESS_GRACE_SEC,
    });
    this._gridPageController = new GridPageController(this);
    this._gridMediaController = new GridMediaController(this, {
      buildLabelText: (cam) => cap(camDisplayName(cam)),
      liveIconSvg: ICONS.live,
    });
    this._mobileViewPageController = new MobileViewPageController(this, {
      PAGE_IDS,
    });
    this._mobileCamSwitcherController = new MobileCamSwitcherController({
      isOpen: () => this._mobileCamSwitcherOpen === true,
      setOpen: (open) => {
        this._mobileCamSwitcherOpen = open === true;
      },
      renderCamSwitcher: () => this._renderCamSwitcher(),
      pauseSlideshowForInteraction: () => this._pauseSlideshowForInteraction(),
      switchCamera: (idx) => this._switchCamera(idx),
    });
    this._singleViewPageController = new SingleViewPageController(this, {
      PAGE_IDS,
    });
    this._wideViewCompanionController = new WideViewCompanionController(this, {
      DAY,
      ICONS,
      PAGE_IDS,
      PREVIEW_ALERT_HOLD_MS,
      PREVIEW_ALERT_END_GRACE_MS,
      SLIDESHOW_REVIEW_FRESHNESS_GRACE_SEC,
    });
    this._cameraGroupLiveController = new CameraGroupLiveController(this, {
      icons: ICONS,
    });
    this._linkedLightController = new LinkedLightController(this);
    this._ptzMotionController = new PtzMotionController({
      resolveContext: () => this._resolvePtzMotionContext(),
      resolveHoldPlan: (context) => resolvePtzHoldPlan(context),
      executeAction: (context) => this._executePtzCameraAction(context),
      onError: (error, context) => {
        console.warn("[Frigate] PTZ motion failed", context, error);
      },
    });
    this._wideViewTimelineController = new WideViewTimelineController(this, {
      icons: ICONS,
      getAllEvents: () =>
        this._isGridMixedListMode()
          ? this._allGridEvents()
          : this._events || [],
      getVisibleEvents: () =>
        (this._isGridMixedListMode()
          ? this._allGridEvents()
          : this._events || []).filter((event) =>
          this._browseFilterController?.matchesEventFilters?.(event),
        ),
      getVisibleReviews: () =>
        (this._isGridMixedListMode() || isCameraGroup(this._activeCam)
          ? this._browseFilterController?.filteredReviews?.()
          : this._browseFilterController?.filteredActiveCameraReviews?.()) ||
        [],
      getWindowStart: () =>
        this._winStart ||
        (this._winEnd || Date.now() / 1000) -
          (this._config?.window_days || 1) * DAY,
      getWindowEnd: () => this._winEnd || Date.now() / 1000,
      getCameraKey: () =>
        resolveWideTimelineCameraContextKey({
          gridMixed: this._isGridMixedListMode(),
          cameraEntity: this._activeCam?.entity || "",
          cameraMembers: cameraMemberEntities(this._activeCam),
        }),
      getSelectedDay: () => this._calSelectedDay || "",
      isLoading: () => this._loading === true,
      mediaUrl: (id, file, camera = "") =>
        this._mediaForCamera(id, file, camera),
      durationForEvent: (event) => this._eventMediaDuration(event),
      capitalize: (value) => cap(value),
      formatTime: (timestamp) => this._time(timestamp),
      formatDay: (timestamp) =>
        `${this._weekday(timestamp)} · ${this._monthDay(timestamp, {
          ordinal: true,
        })}`,
      dayKey: (timestamp) => this._dayKey(timestamp),
      timezoneParts: (timestamp) => this._tzParts(timestamp),
      timezoneDateTimeToEpoch: (...parts) =>
        this._tzDateTimeToEpochSeconds(...parts),
      onOpenEntry: (entry) => {
        this._pauseSlideshowForInteraction();
        if (entry?.kind === "alert") {
          this._popupMediaLoaderController?.showClipById(entry.eventId, {
            mediaType: "alert",
            startTime: entry.reviewStartTime,
            camera: entry.camera,
          });
          return;
        }
        this._popupMediaLoaderController?.showCarouselEventById(
          entry?.eventId,
          entry?.hasClip ? "clip" : "snapshot",
        );
      },
    });
    this._wideViewPageController = new WideViewPageController(this, {
      PAGE_IDS,
    }, {
      companionController: this._wideViewCompanionController,
      timelineController: this._wideViewTimelineController,
    });
    this._cardViewPageController = new CardViewPageController(this, {
      PAGE_IDS,
      buildCalendarPanelMarkup,
    });
    this._pageNavigationController = new PageNavigationController(this, {
      buildPageNavButtonsMarkup,
      buildPageNavMarkup,
      allowsDashboardPageSwipeNavigation,
      createNavigationFactory,
      DEVICE_ROUTE_BUCKETS,
      getEnabledPageRoutes,
      isDashboardSwipeNavigationEnabled,
      normalizePageRoute,
      PAGE_IDS,
      ICONS,
      resolveAdjacentPageSwipeRoute,
      resolveMobilePreviewDestination,
      resolvePageSwipeOrder,
    });
    this._haNavbarController =
      new HomeAssistantNavbarController(this, {
        isIOS: DEVICE_PROFILE.isIOS,
      });
    this._haDashboardSwipeNavigationController =
      new HomeAssistantDashboardSwipeNavigationController(this, {
        hasTouch: DEVICE_PROFILE.hasTouch,
        resolveInternalPageTarget: (direction, swipePolicy) =>
          this._pageNavigationController?.resolveSwipePageTarget?.(
            direction,
            swipePolicy?.mode,
          ) ||
          null,
        resolveDashboardBoundaryPage: ({
          direction,
          transition,
          swipePolicy,
        }) =>
          this._pageNavigationController?.resolveDashboardSwipeBoundaryPage?.({
            direction,
            transition,
            swipeMode: swipePolicy?.mode,
          }) || null,
        allowDashboardNavigation: () =>
          this._pageNavigationController?.allowsDashboardPageSwipe?.() !==
          false,
        isNavigationEnabled: () =>
          this._pageNavigationController?.isSwipeNavigationEnabled?.() !==
          false,
        navigateInternalPage: (pageId) =>
          this._pageNavigationController?.navigateToPageRoute?.(pageId, {
            source: "dashboard-swipe",
          }) === pageId,
        onDashboardNavigationSettled: () =>
          this._handleDashboardSwipeNavigationSettled(),
        onDashboardScopeExited: () =>
          this._handleDashboardScopeExited(),
        cardTag: CARD_TAG,
        enforceDashboardOwner: true,
      });
    this._haPageBackgroundController =
      new HomeAssistantPageBackgroundController(this);
    this._pageShellRegistry = createPageShellRegistry({
      defaultPageId: PAGE_IDS.singleView,
    });
    registerDefaultPageShellProfiles(this._pageShellRegistry, PAGE_IDS);
    this._deepLinkController = new DeepLinkController(this);
    this._slideshowAlertController = new SlideshowAlertController(this, {
      DAY,
      SLIDESHOW_ALERT_HOLD_MS,
      SLIDESHOW_REVIEW_FRESHNESS_GRACE_SEC,
      SLIDESHOW_REVIEW_WATCH_MIN_MS,
      SLIDESHOW_REVIEW_WATCH_MAX_MS,
    });
    this._slideshowPageController = new SlideshowPageController(this);
    this._previewPageActive = false;
    this._previewLastRenderSignature = "";
    this._previewMediaState = null;
    this._previewAlertController = new PreviewAlertController(this, {
      DAY,
      PREVIEW_ALERT_HOLD_MS,
      PREVIEW_ALERT_END_GRACE_MS,
      SLIDESHOW_REVIEW_FRESHNESS_GRACE_SEC,
    });
    this._previewPageController = new PreviewPageController(this, {
      PAGE_IDS,
      DEVICE_PROFILE,
    });
    this._twoWayTalkSession = null;
    this._twoWayTalkStarting = false;
    this._twoWayTalkEntity = "";
    this._twoWayTalkResultBubble = null;
    this._twoWayTalkResultTimer = null;
    this._browseCalendarActivityController =
      new BrowseCalendarActivityController(this);
    this._browseCalendarPanelController = new BrowseCalendarPanelController(
      this,
      {
        buildCalendarPanelMarkup,
      },
    );
    this._browseCollectionController = new BrowseCollectionController(this);
    this._browseFilterController = new BrowseFilterController(this, {
      buildFilterPanelMarkup,
    });
    this._browseTabDataController = new BrowseTabDataController(this);
    this._browseWindowLoaderController = new BrowseWindowLoaderController(this);
    this._cardStyleController = new CardStyleContextController(this);
    this._editorPreviewController = new EditorPreviewContextController(this);
    this._frigateMediaDownloadController = new FrigateMediaDownloadController({
      getContext: () => this._cc(),
      signPath: (path) => this._signed(path),
      formatTime: (timestamp) => this._time(timestamp),
      findEventById: (id) => this._findEventById(id),
      getContextForEvent: (event) =>
        this._frigateContextForCameraName(event?.camera),
      isEventPrePostRollEnabled: () =>
        this._config?.event_pre_post_roll_enabled === true,
    });
    this._popupRecordingScrubController =
      new PopupRecordingScrubController({
        query: (selector) => this._$(selector),
        fetchReviews: (clientId, cam, start, end) =>
          this._browseWindowLoaderController.fetchWindowedReviews(
            clientId,
            cam,
            start,
            end,
          ),
        isPlaybackTokenCurrent: (token) => token === this._playSeq,
        isFirefox: () => this._isFirefox(),
        isEdge: () => this._isEdge(),
        isIOS: () => DEVICE_PROFILE.isIOS,
        onFallbackRecording: (start, end, context = {}) =>
          this._popupMediaLoaderController?.showRecording(start, end, {
            compact: this._popupLifecycleController?.isCompact?.() === true,
            ...context,
          }),
        onDownloadSegment: (start, end, context) =>
          this._frigateMediaDownloadController.downloadRecording(
            start,
            end,
            context,
          ),
        resolveSegmentTimeline: async ({ clientId, cam, start, end }) => {
          const nowSec = Math.floor(Date.now() / 1000);
          const recordings = await this._recordingsBrowseNavController?.fetchRecordingsInBounds(
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
            preferHls: DEVICE_PROFILE.isIOS,
            maxChunkSeconds: Math.max(1, Number(end) - Number(start)),
          });
          return await Promise.all(
            plan.sourceCandidates.map((path) => this._signed(path)),
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
              { scopeKey: this },
            ),
          ),
        playIcon: ICONS.play,
        pauseIcon: ICONS.pause,
        formatClock: (timestamp) => this._time(timestamp),
      });
    this._popupInfoController = new PopupInfoController({
      query: (selector) => this._$(selector),
      getActiveCamera: () => this._cc().cam,
      formatTime: (timestamp) => this._time(timestamp),
      formatWeekday: (timestamp) => this._weekday(timestamp),
      formatMonthDay: (timestamp, options) =>
        this._monthDay(timestamp, options),
      formatEventDuration: (event) => this._dur(event),
      onResetRecordingScrub: () =>
        this._popupRecordingScrubController.teardown(),
      onMediaCameraChange: (camera) => {
        this._popupLifecycleController.setMediaCamera(camera);
      },
      onNavigateEventMedia: (id, mediaType) =>
        this._popupMediaLoaderController?.showCarouselEventById(
          id,
          mediaType,
          { compact: this._popupLifecycleController?.isCompact?.() === true },
        ),
      onDownloadEvent: (id, file) =>
        void this._frigateMediaDownloadController.downloadEvent(id, file),
      onDownloadRecording: (start, end) => {
        const camera = this._popupLifecycleController?.mediaCamera?.() || "";
        const context =
          this._frigateContextForCameraName(camera) || this._cc();
        void this._frigateMediaDownloadController.downloadRecording(
          start,
          end,
          context,
        );
      },
    });
    this._popupCarouselController = new PopupCarouselController({
      query: (selector) => this._$(selector),
      getKept: () => this._kept,
      getReviews: () => this._reviews,
      getDisplayEvents: () => this._allDisplayEvents(),
      findEventById: (id) => this._findEventById(id),
      mediaUrl: (id, file, camera = "") =>
        this._mediaForCamera(id, file, camera),
      formatDateTime: (timestamp) => this._dateTimeLabel(timestamp),
      formatTime: (timestamp) => this._time(timestamp),
      isTouchUi: () => this._isTouchPopupUi(),
      isMobileDevice: () => this._isLikelyMobileClient(),
      onSelectEvent: (id, mediaType) =>
        this._popupMediaLoaderController?.showCarouselEventById(
          id,
          mediaType,
        ),
    });
    this._popupMediaControlsController =
      new PopupMediaControlsSurfaceController({
        query: (selector) => this._$(selector),
        formatTime: formatRecordingScrubTime,
        shouldUseCustomControls: (mediaType) =>
          this._usePopupCustomControls(mediaType),
        isAutoHideActive: () =>
          this._rotateOverlayMode === "popup" ||
          !this._isMobileTabletViewport(),
        isMobileTabletViewport: () => this._isMobileTabletViewport(),
        isVideoMediaType: (mediaType) =>
          this._isPopupVideoMediaType(mediaType),
        onClearPictureInPicture: (scope) =>
          this._clearPictureInPictureButtonController(scope),
        onSyncPlaybackTargetButtons: () =>
          this._syncPlaybackTargetButtons(),
        onSyncPictureInPictureButtons: () =>
          this._syncPictureInPictureButtons(),
        onSyncFullscreenButtons: () =>
          this._syncFullscreenButtonsVisibility(),
      });
    this._popupLifecycleController = new PopupLifecycleController({
      query: (selector) => this._$(selector),
      isFirefox: () => this._isFirefox(),
      onPauseSlideshow: () => this._pauseSlideshowForPopup(),
      onResumeSlideshow: () => this._resumeSlideshowAfterPopup(),
      onSetLiveCovered: (covered) => this._setLivePopupCover(covered),
      onMuteLive: (muted, options) =>
        this._applyLiveMuteChange(muted, options),
      onSyncFullscreen: () => this._syncFullscreenButtonsVisibility(),
      onSyncPictureInPicture: () => this._syncPictureInPictureButtons(),
      onScheduleOverlay: () => this._scheduleRotateOverlayUpdate(),
      onReleasePlaybackTarget: (scope) =>
        this._playbackTargetController?.release(scope),
      onClearPictureInPicture: (scope) =>
        this._clearPictureInPictureButtonController(scope),
      onClearVideoZoom: () => this._clearPopupVideoZoom?.(),
      onDisposeCarousel: () => this._popupCarouselController.dispose(),
      onClearCarousel: () => this._popupCarouselController.clear(),
      onDisposeMediaControls: () =>
        this._popupMediaControlsController.dispose(),
      onHideInfo: () => this._popupInfoController.hide(),
      onClearMediaTransport: () =>
        this._popupMediaLoaderController?.cancelPendingLoad(),
    });
    this._popupMediaLoaderController = new PopupMediaLoaderController(this);
    this._playbackTargetController = new BrowserPlaybackTargetController({
      getContext: (scope) => this._playbackTargetContext(scope),
      resolveSource: (context) =>
        this._resolvePlaybackTargetSource(context),
      getMount: () => this.shadowRoot,
      onStatus: (message) => this._toast(message),
    });
    this._viewportContextController = new ViewportContextController(this);
    this._twoWayTalkSoundwaveController =
      new TwoWayTalkSoundwaveController({
        resolveCanvas: () =>
          this.shadowRoot?.querySelector?.(
            "[data-two-way-talk-soundwave-canvas]",
          ) || null,
        isEnabled: () => this._shouldRenderTwoWayTalkSoundwave(),
      });
    this._domCache = {};
    this._fallbackImgUrlCache = new Map();
    this._fallbackReqId = 0;
    this._eventsLoadToken = 0;
    this._reviewsLoadToken = 0;
    this._windowLoadToken = 0;
    this._warmCamsToken = 0;
    this._warmReviewsToken = 0;
    this._warmOtherCamsDelayT = null;
    this._reloadPending = false;
    this._reloadAfterLoad = false;
    this._realtimeHeadPollT = null;
    this._switchLoadT = null;
    this._listScrollController = null;
    this._livePictureInPictureButtonController = null;
    this._popupPictureInPictureButtonController = null;
    this._liveControlsHideTimer = null;
    this._liveOverlayControlsController = null;
    this._snapshotResultTimers = { live: null, popup: null };
    this._recordingsDayAvailabilityCache = new Map();
    this._recordingsDayDataCache = new Map();
    this._recordingsDayFetchedAtCache = new Map();
    this._recordingsDayRequestCache = new Map();
    this._recordingsNavUpdateToken = 0;
    this._recordingsDayNavAnimating = false;
    this._recordingsBrowseNavController = new RecordingsBrowseNavController(
      this,
    );
    this._recordingsSwipeController = null;
    this._mountSeq = 0;
    this._lastRenderedListHtml = "";
    this._pendingMountDestroyers = [];
    this._pendingWebRTCTakeoverTimer = null;
    this._mseGraceController = createMseGraceController({
      graceMs: MSE_SWITCH_GRACE_MS,
      graceMax: MSE_SWITCH_GRACE_MAX,
      getShadowRoot: () => this.shadowRoot,
      getScopeKey: () => this,
      getPendingMountDestroyers: () => this._pendingMountDestroyers || [],
      setPendingMountDestroyers: (pendingDestroyers) => {
        this._pendingMountDestroyers = pendingDestroyers;
      },
      getPendingWebRtcTakeoverTimer: () => this._pendingWebRTCTakeoverTimer,
      setPendingWebRtcTakeoverTimer: (timer) => {
        this._pendingWebRTCTakeoverTimer = timer;
      },
      clearRotateOverlayAudioSync: () => this._clearRotateOverlayAudioSync(),
      clearRotateVideoFullscreenStyle: () =>
        this._clearRotateVideoFullscreenStyle(),
      getEngine: () => this._engine,
      setEngine: (engine) => this._assignLiveEngine(engine),
      getActiveStreamType: () => this._activeStreamType,
      getStreamMuted: () => this._streamMuted,
      setEngineMountedMuted: (muted) => {
        this._engineMountedMuted = muted;
      },
      getRotateOverlayActive: () => this._rotateOverlayActive,
      attachVideoFit: (streamEl) => this._attachVideoFit(streamEl),
      setActiveStreamType: (type) => this._setActiveStreamType(type),
      setStreamLoading: (loading) => this._setStreamLoading(loading),
      setStreamFallbackVisible: (visible) =>
        this._setStreamFallbackVisible(visible),
      setLiveNativeControls: (enabled) => this._setLiveNativeControls(enabled),
    });
    this._liveMountController = createLiveMountController({
      getSlot: () => this.shadowRoot.querySelector("#engine"),
      isPreviewPageActive: () => this._isPreviewPageActive(),
      getViewMode: () => this._viewMode,
      isGridModeAvailable: () => this._isGridModeAvailable(),
      getMountInProgress: () => this._mountInProgress,
      getMountTargetEntity: () => this._mountTargetEntity,
      getMountState: () => ({
        mountSeq: this._mountSeq,
        mountInProgress: this._mountInProgress,
        mountStartedAt: this._mountStartedAt,
        mountTargetEntity: this._mountTargetEntity,
      }),
      applyMountTrackingState: (nextState) =>
        this._applyMountTrackingState(nextState),
      mountGridEngine: () =>
        this._gridMediaController.mountGridEngine(this._$("#grid-engine")),
      cleanupEngine: () => this._cleanupEngine(),
      getStreamMuted: () => this._streamMuted,
      setEngineMountedMuted: (muted) => {
        this._engineMountedMuted = muted;
      },
      mseGraceController: this._mseGraceController,
      getMountSeq: () => this._mountSeq,
      getPendingMountDestroyers: () => this._pendingMountDestroyers,
      setPendingMountDestroyers: (pendingDestroyers) => {
        this._pendingMountDestroyers = pendingDestroyers;
      },
      haDirectMounter: this._haDirectMounter,
      haDirectTwoWayTalkMounter: this._haDirectTwoWayTalkMounter,
      go2rtcRaceMounter: this._go2rtcRaceMounter,
      preferredStreamType: () => this._preferredStreamType(),
      setActiveStreamType: (type) => this._setActiveStreamType(type),
      setStreamLoading: (loading) => this._setStreamLoading(loading),
      setStreamFallbackVisible: (visible, refreshImage = false) =>
        this._setStreamFallbackVisible(visible, refreshImage),
      scheduleResumeLive: (reason) => this._scheduleResumeLive(reason),
      resolveUseGo2Rtc: (entity) => this._shouldUseGo2RtcForEntity(entity),
    });
    this._liveViewResizeController = new LiveViewResizeController({
      getLiveWrap: () => this._$("#eng-wrap"),
      isContextEligible: () => {
        const pageId = normalizePageRoute(this._pageId);
        const livePage =
          pageId === PAGE_IDS.singleView ||
          pageId === PAGE_IDS.mobileView ||
          pageId === PAGE_IDS.wideView ||
          pageId === PAGE_IDS.cardView;
        const fullscreenElement =
          document.fullscreenElement || document.webkitFullscreenElement;
        const fallbackVisible = this._$("#stream-fallback")?.hidden === false;
        return (
          livePage &&
          this._viewMode === "single" &&
          !this._isPreviewPageActive() &&
          !this._rotateOverlayActive &&
          !fullscreenElement &&
          !fallbackVisible &&
          String(this._activeStreamType || "").toLowerCase() !== "snapshot"
        );
      },
      onInteractionStart: () => this._pauseSlideshowForInteraction(),
      onZoomScaleChange: (scale) => {
        this._liveVideoZoomController?.zoomToCenter?.(scale);
      },
      getMediaDimensions: (video) => {
        if (!this._cameraGroupLiveController?.isActive?.()) return null;
        return this._activeCam?.group?.layout === "stacked"
          ? { videoWidth: 1, videoHeight: 1 }
          : { videoWidth: 16, videoHeight: 9 };
      },
      getAvailableGrowth: () => {
        const browse = this._$("#browse");
        const footer = this._$('[data-fvc-region="footer"]');
        if (!browse || !footer || footer.hidden) return null;
        const browseHeight = Number(
          browse.getBoundingClientRect?.().height || browse.clientHeight,
        );
        if (!Number.isFinite(browseHeight)) return null;
        return Math.max(0, Math.floor(browseHeight) - 1);
      },
    });
    this._liveFullscreenLifecycleController =
      new LiveFullscreenLifecycleController({
        getCurrentVideo: () =>
          this._findVideoDeep(this._$("#engine")) ||
          this._findVideoDeep(this._engine),
        scheduleResumeLive: (reason) => this._scheduleResumeLive(reason),
        onFullscreenExit: () => this._scheduleRotateOverlayUpdate(),
      });
    this._wasVisible = false;
    this._resumeLiveT = null;
    this._disconnectTeardownT = null;
    this._dashboardLiveGraceActive = false;
    this._lastLiveKick = 0;
    this._rotateOverlayActive = false;
    this._rotateOverlayMode = "none";
    this._rotateOverlayRaf = 0;
    this._rotateOverlayExitT = null;
    this._rotateOverlaySyncVideo = null;
    this._onRotateOverlayVolumeChange = null;
    this._rotateStyledVideo = null;
    this._rotateStyledVideoCssText = "";
    this._engineMountedMuted = true;
    this._mountInProgress = false;
    this._mountStartedAt = 0;
    this._mountTargetEntity = "";
    this._mseConnectAt = 0;
    this._mseLastChunkAt = 0;
    this._mseChunkCount = 0;
    this._deepLinkEventId = "";
    this._deepLinkReviewId = "";
    this._deepLinkMediaHint = "";
    this._deepLinkCameraHint = "";
    this._deepLinkApplied = false;
    this._deepLinkEventLookupTried = false;
    this._deepLinkReviewLookupTried = false;
    this._committedConfig = null;
    this._onDocVisibility = () => {
      if (document.visibilityState === "visible") {
        this._scheduleResumeLive("doc-visible");
        this._wideViewPageController?.resumeCompanionMedia?.();
        return;
      }
      void this._stopPtzMotion("document-hidden");
    };

    document.addEventListener("visibilitychange", this._onDocVisibility);
    this._onWindowBlur = () => {
      void this._stopPtzMotion("window-blur");
    };
    this._onPageHide = () => {
      void this._stopPtzMotion("page-hide");
    };
    this._onWindowPtzPointerStop = (event) => {
      void this._handlePtzControlPointerStop(event);
    };
    window.addEventListener("blur", this._onWindowBlur);
    window.addEventListener("pagehide", this._onPageHide);
    window.addEventListener("pointerup", this._onWindowPtzPointerStop, true);
    window.addEventListener(
      "pointercancel",
      this._onWindowPtzPointerStop,
      true,
    );
    this._onFullscreenChange = () => {
      this._liveFullscreenLifecycleController?.handleDocumentFullscreenChange(
        document.fullscreenElement || document.webkitFullscreenElement || null,
      );
      this._syncFullscreenButtonsVisibility();
      this._liveViewResizeController?.sync();
    }
    document.addEventListener("fullscreenchange", this._onFullscreenChange);
    document.addEventListener(
      "webkitfullscreenchange",
      this._onFullscreenChange,
    );

    this._onViewportChange = () => {
      const vv = window.visualViewport;
      const viewportWidth = Math.round(vv?.width || window.innerWidth || 0);
      const viewportHeight = Math.round(vv?.height || window.innerHeight || 0);
      const viewportSizeChanged =
        viewportWidth !== this._lastViewportWidth ||
        viewportHeight !== this._lastViewportHeight;

      this._syncRotateOverlayViewportState();

      if (viewportSizeChanged) {
        this._lastViewportWidth = viewportWidth;
        this._lastViewportHeight = viewportHeight;
        this._syncBrowseHeadModeClass();
        this._applyCardStyle();
      }

      this._scheduleRotateOverlayUpdate();
      this._liveViewResizeController?.sync();
    };
    window.addEventListener("resize", this._onViewportChange, {
      passive: true,
    });
    this._onOrientationChange = () => {
      this._onViewportChange();
    };
    window.addEventListener("orientationchange", this._onOrientationChange);
    window.visualViewport?.addEventListener("resize", this._onViewportChange, {
      passive: true,
    });
    window.visualViewport?.addEventListener("scroll", this._onViewportChange, {
      passive: true,
    });
    this._onEditorPreviewDraft = (ev) => {
      if (ev?.detail?.cardTag !== CARD_TAG) return;
      this._applyEditorPreviewDraft(
        ev.detail?.config || null,
        ev.detail?.routeIntent || null,
      );
    };
    window.addEventListener(
      "frigate-view-card-preview-draft",
      this._onEditorPreviewDraft,
    );
    this._onDocumentPointerDown = (event) => {
      if (!this._mobileCamSwitcherOpen) return;
      const path =
        typeof event?.composedPath === "function" ? event.composedPath() : [];
      if (Array.isArray(path) && path.includes(this)) return;
      this._mobileCamSwitcherController?.close();
    };
    document.addEventListener("pointerdown", this._onDocumentPointerDown, {
      passive: true,
    });
  }

  _cloneCardConfig(config) {
    try {
      return JSON.parse(JSON.stringify(config || {}));
    } catch (_) {
      return { ...(config || {}) };
    }
  }

  _normalizeVideoFactoryDefaults(value) {
    return value && typeof value === "object" ? value : {};
  }

  _mergeVideoFactoryDefaults(commonDefaults, viewDefaults) {
    const common = this._normalizeVideoFactoryDefaults(commonDefaults);
    const view = this._normalizeVideoFactoryDefaults(viewDefaults);
    const merged = {
      ...common,
      ...view,
    };

    if (common.style || view.style) {
      merged.style = {
        ...this._normalizeVideoFactoryDefaults(common.style),
        ...this._normalizeVideoFactoryDefaults(view.style),
      };
    }
    if (common.dataset || view.dataset) {
      merged.dataset = {
        ...this._normalizeVideoFactoryDefaults(common.dataset),
        ...this._normalizeVideoFactoryDefaults(view.dataset),
      };
    }
    if (common.attributes || view.attributes) {
      merged.attributes = {
        ...this._normalizeVideoFactoryDefaults(common.attributes),
        ...this._normalizeVideoFactoryDefaults(view.attributes),
      };
    }
    if (common.classNames || view.classNames) {
      const tokens = [
        ...(Array.isArray(common.classNames) ? common.classNames : []),
        ...(Array.isArray(view.classNames) ? view.classNames : []),
      ]
        .map((token) => String(token || "").trim())
        .filter(Boolean);
      merged.classNames = [...new Set(tokens)];
    }

    return merged;
  }

  _applyScopedVideoFactoryDefaultsFromConfig(config = this._config) {
    const cfg = config || {};
    const commonDefaults = this._normalizeVideoFactoryDefaults(
      cfg.video_defaults,
    );
    const scopeContext = { scopeKey: this };

    setScopedVideoViewDefaultOptions(
      "live",
      this._mergeVideoFactoryDefaults(commonDefaults, cfg.video_live_defaults),
      scopeContext,
    );
    setScopedVideoViewDefaultOptions(
      "popup",
      this._mergeVideoFactoryDefaults(commonDefaults, cfg.video_popup_defaults),
      scopeContext,
    );
    setScopedVideoViewDefaultOptions(
      "recording",
      this._mergeVideoFactoryDefaults(
        commonDefaults,
        cfg.video_recording_defaults,
      ),
      scopeContext,
    );
  }
  _applyEditorPreviewDraft(previewConfig, routeIntent = null) {
    if (!this._isEditorPreviewContext()) return;
    if (!this._committedConfig) return;

    const base = this._cloneCardConfig(this._committedConfig);
    const next = applyEditorPreviewDraftToCardConfig({
      baseConfig: base,
      previewConfig,
    });

    this._config = next;
    this._haNavbarController?.sync?.();
    this._haDashboardSwipeNavigationController?.sync?.();
    this._syncVisualStyleToggles();
    this._haPageBackgroundController?.sync?.();
    this._previewPageController?.syncBottomNavbarPreviewChrome?.();
    this._browseOpen = this._config.browse_expanded;
    this._editorPreviewController.applyRouteIntent(
      previewConfig
        ? routeIntent
        : routeIntent || { type: EDITOR_PREVIEW_ROUTE_INTENTS.reset },
    );
    this._singleViewPageController.applyEditorPreviewDraftRefresh();
  }

  _ensureEditorPreviewController() {
    if (this._editorPreviewController) return;
    this._editorPreviewController = new EditorPreviewContextController(this);
  }

  connectedCallback() {
    this._ensureEditorPreviewController();
    const hadPendingDisconnectTeardown = Boolean(this._disconnectTeardownT);
    const hadDashboardLiveGrace = this._dashboardLiveGraceActive;
    this._dashboardLiveGraceActive = false;
    if (this._disconnectTeardownT) {
      clearTimeout(this._disconnectTeardownT);
      this._disconnectTeardownT = null;
    }
    if (this.parentElement) {
      this._parentOrigStyle = {
        height: this.parentElement.style.height,
        margin: this.parentElement.style.margin,
        padding: this.parentElement.style.padding,
      };
      this.parentElement.style.height =
        this._isPreviewContext() || this._isCardViewPageActive?.()
        ? "auto"
        : "100%";
      this._applyTightMargins();
      this._wideViewPageController.applyLayoutAndWideSyncForCard();
    }
    this._syncVisualStyleToggles();
    this._haNavbarController?.sync?.();
    this._haDashboardSwipeNavigationController?.sync?.();
    this._haPageBackgroundController?.sync?.();
    const cardPickerDemoActive =
      this._editorPreviewController.renderCardPickerDemo();
    this._scheduleRotateOverlayUpdate();
    if (this._started && !cardPickerDemoActive) {
      const activeLiveEntity =
        this._activeGroupMemberOverride || this._activeCam?.entity || "";
      if (
        !hadDashboardLiveGrace &&
        shouldResetMseOnQuickReconnect({
          hadPendingDisconnectTeardown,
          activeStreamType: this._currentLiveStreamHint(),
          useGo2Rtc: this._shouldUseGo2RtcForEntity(activeLiveEntity),
        })
      ) {
        this._cancelPendingMount("mse-quick-reconnect");
        this._clearLiveEngineSlot();
      }
      this._wideViewPageController?.startCompanionMode?.();
      this._wideViewPageController?.bindTimeline?.();
      if (!this._ro && typeof ResizeObserver !== "undefined") {
        this._setupResizeObserver();
      }
      this._pageNavigationController.connectToolbarDivider();
      this._startEditModeWatchdog();
      if (this._shouldStartInGridMode()) {
        this._applyStartInGridMode("connected");
        this._scheduleGridRefresh(140);
      } else {
        this._scheduleResumeLive("connected");
      }
    }
    this._startEditorDialogCloseObserver();
  }

  _visualStyleToggleRules() {
    return this._cardStyleController.visualStyleToggleRules();
  }

  _cardStateClassNames() {
    return this._cardStyleController.cardStateClassNames();
  }

  _syncVisualStyleToggles() {
    this._cardStyleController.syncVisualStyleToggles();
  }

  _syncHostOuterStyles(options = {}) {
    this._cardStyleController.syncHostOuterStyles(options);
  }

  _resolveCardTokenForHost(card, cssProperty, token) {
    return this._cardStyleController.resolveCardTokenForHost(
      card,
      cssProperty,
      token,
    );
  }

  _applyTightMargins() {
    this._cardStyleController.applyTightMargins();
  }

  _setSectionsRowGap(tightMarginsEnabled) {
    this._cardStyleController.setSectionsRowGap(tightMarginsEnabled);
  }

  _isPanelView() {
    return this._cardStyleController.isPanelView();
  }

  _hasAncestorInShadow(root, target) {
    return this._cardStyleController.hasAncestorInShadow(root, target);
  }

  static async getConfigElement() {
    const editorTag = `${CARD_TAG}-editor`;
    if (!customElements.get(editorTag)) {
      const editorUrl = new URL(
        "./frigate-view-card-editor.js",
        import.meta.url,
      );
      await import(editorUrl.href);
    }
    return document.createElement(editorTag);
  }
  static getStubConfig() {
    return {
      cameras: [
        {
          entity: "camera.front_door",
          alerts_content: "alerts_only",
        },
      ],
      title: "Frigate Preview",
      subtitle: "Compact preview",
      compact_preview: true,
      stream_height: 100,
      stream_height_unit: "%",
      window_days: 1,
      alerts_reviews_days: 1,
    };
  }
  setConfig(config) {
    const wasStarted = this._started === true;
    const prevConfig = this._config;
    let cameras;

    if (Array.isArray(config.cameras) && config.cameras.length) {
      cameras = config.cameras
        .map((camera) => normalizeCameraConfig(camera))
        .filter((c) => c.entity);
    } else if (typeof config.cameras === "string" && config.cameras) {
      cameras = [normalizeCameraConfig(config.cameras)].filter((c) => c.entity);
    } else if (config.cameras && typeof config.cameras === "object") {
      cameras = [normalizeCameraConfig(config.cameras)].filter((c) => c.entity);
    } else if (config.camera_entity) {
      cameras = [
        normalizeCameraConfig(
          { camera_entity: config.camera_entity },
          { fallbackName: config.title || null },
        ),
      ];
    } else if (config.camera) {
      cameras = [normalizeCameraConfig(config.camera)].filter((c) => c.entity);
    } else if (config.entity && /^camera\./.test(String(config.entity))) {
      cameras = [
        normalizeCameraConfig(String(config.entity), {
          fallbackName: config.title || null,
        }),
      ];
    } else if (Array.isArray(config.entities) && config.entities.length) {
      cameras = config.entities
        .map((e) => (typeof e === "string" ? e : e?.entity))
        .filter((e) => typeof e === "string" && /^camera\./.test(e))
        .map((e) => normalizeCameraConfig(e));
    } else if (prevConfig?.cameras?.length) {
      cameras = prevConfig.cameras
        .map((camera) => normalizeCameraConfig(camera))
        .filter((c) => c.entity);
    } else {
      cameras = [];
    }

    if (!cameras.length) {
      // Final safety placeholder: keep card mountable instead of red error state.
      cameras = [
        {
          entity: "camera.front_door",
          name: "Front Door",
          alerts_content: "alerts_only",
        },
      ];
    }
    cameras = limitCameraConfigsByPhysicalCount(cameras, MAX_CAMERAS);

    const legacyWindowHours = parseInt(config.window_hours, 10);
    const nextConfig = {
      cameras,
      title: String(config.title || "").trim() || DEFAULT_TITLE,
      subtitle: String(config.subtitle || "").trim() || DEFAULT_SUBTITLE,
      display_title: config.display_title !== false,
      display_subtitle: config.display_subtitle !== false,
      display_logo: config.display_logo !== false,
      window_days:
        normalizePositiveInteger(config.window_days, null) ||
        (Number.isFinite(legacyWindowHours) && legacyWindowHours > 0
          ? Math.max(1, Math.ceil(legacyWindowHours / 24))
          : 3),
      alerts_reviews_days: normalizePositiveInteger(
        config.alerts_reviews_days,
        normalizePositiveInteger(config.window_days, 3),
      ),
      refresh_seconds: Math.max(15, config.refresh_seconds || 45),
      realtime_poll_seconds: REALTIME_POLL_OPTIONS_SECONDS.includes(
        Number(config.realtime_poll_seconds),
      )
        ? Number(config.realtime_poll_seconds)
        : 5,
      snapshot_update_seconds: normalizeNumberChoice(
        config.snapshot_update_seconds,
        SNAPSHOT_UPDATE_OPTIONS_SECONDS,
        SNAPSHOT_UPDATE_SECONDS,
      ),
      mobile_poll_battery_saver: config.mobile_poll_battery_saver === true,
      event_pre_post_roll_enabled:
        config.event_pre_post_roll_enabled === true,
      favorites_mixed_cameras: config.favorites_mixed_cameras !== false,
      slideshow_rotation_enabled: config.slideshow_rotation_enabled === true,
      slideshow_rotation_seconds: SLIDESHOW_ROTATION_OPTIONS_SECONDS.includes(
        Number(config.slideshow_rotation_seconds),
      )
        ? Number(config.slideshow_rotation_seconds)
        : 30,
      slideshow_alert_hold_seconds: normalizeNumberChoice(
        config.slideshow_alert_hold_seconds,
        SLIDESHOW_ALERT_HOLD_OPTIONS_SECONDS,
        Math.round(SLIDESHOW_ALERT_HOLD_MS / 1000),
      ),
      grid_mode_enabled: config.grid_mode_enabled === true,
      grid_order: normalizeGridOrderConfig(config.grid_order, cameras),
      grid_start_in_grid_enabled: config.grid_start_in_grid_enabled === true,
      grid_live_view_enabled: config.grid_live_view_enabled !== false,
      grid_alert_hold_seconds: normalizeNumberChoice(
        config.grid_alert_hold_seconds,
        GRID_ALERT_HOLD_OPTIONS_SECONDS,
        Math.round(GRID_ALERT_HOLD_MS / 1000),
      ),
      mobile_view_page_enabled: config.mobile_view_page_enabled === true,
      mobile_view_rotate_to_fullscreen:
        config.mobile_view_rotate_to_fullscreen !== false,
      mobile_view_outer_border: config.mobile_view_outer_border === true,
      mobile_view_ha_navbar_bottom:
        config.mobile_view_ha_navbar_bottom === true,
      mobile_view_ha_navbar_stack_tabs:
        config.mobile_view_ha_navbar_stack_tabs === true,
      mobile_view_ha_navbar_dashboard:
        config.mobile_view_ha_navbar_dashboard === true,
      ha_dashboard_swipe_navigation_owner:
        config.ha_dashboard_swipe_navigation_owner === true,
      ha_dashboard_swipe_navigation:
        normalizeDashboardSwipeNavigationMode(
          config.ha_dashboard_swipe_navigation,
        ),
      ha_dashboard_swipe_include_other_cards:
        config.ha_dashboard_swipe_include_other_cards === true,
      ha_dashboard_swipe_include_subviews:
        config.ha_dashboard_swipe_include_subviews === true,
      ha_dashboard_swipe_mouse_enabled:
        config.ha_dashboard_swipe_mouse_enabled === true,
      ha_dashboard_swipe_pages: Array.isArray(
        config.ha_dashboard_swipe_pages,
      )
        ? [...config.ha_dashboard_swipe_pages]
        : undefined,
      preview_page_enabled: config.preview_page_enabled === true,
      preview_page_live_cameras: config.preview_page_live_cameras === true,
      preview_page_live_cameras_mobile:
        config.preview_page_live_cameras_mobile === true,
      preview_page_show_title_bars:
        config.preview_page_show_title_bars !== false,
      preview_page_alert_live_duration_seconds:
        normalizeNumberChoice(
          config.preview_page_alert_live_duration_seconds,
          PREVIEW_ALERT_LIVE_DURATION_OPTIONS_SECONDS,
          Math.round(PREVIEW_ALERT_HOLD_MS / 1000),
        ),
      wide_view_page_enabled:
        config.wide_view_page_enabled === true || config.wide_view === true,
      wide_view_live_cameras: config.wide_view_live_cameras === true,
      wide_view_alert_takeover: config.wide_view_alert_takeover === true,
      wide_view_timeline_enabled:
        config.wide_view_timeline_enabled === true,
      wide_view_timeline_default_open:
        config.wide_view_timeline_default_open === true,
      wide_view_timeline_default_scale: normalizeWideTimelineScale(
        config.wide_view_timeline_default_scale,
      ),
      card_view_page_enabled: config.card_view_page_enabled === true,
      card_view_alert_takeover: config.card_view_alert_takeover === true,
      card_view_standalone:
        config.card_view_page_enabled === true &&
        config.card_view_standalone === true,
      landing_page: normalizePageRoute(config.landing_page),
      mobile_page: normalizeMobilePageMode(config.mobile_page),
      deep_link_enabled: config.deep_link_enabled !== false,
      grid_rotation_seconds: GRID_ROTATION_OPTIONS_SECONDS.includes(
        Number(config.grid_rotation_seconds),
      )
        ? Number(config.grid_rotation_seconds)
        : 30,
      browse_expanded: config.browse_expanded === true,
      hidden_tabs: Array.isArray(config.hidden_tabs)
        ? config.hidden_tabs
            .map((id) => (id === "reviews" ? "alerts" : id))
            .filter((id) => ALLOWED_HIDDEN_TABS.includes(id))
        : [...DEFAULT_HIDDEN_TABS],
      theme: config.theme === "custom" ? "custom" : "default",
      theme_custom: normalizeThemeCustomConfig(config.theme_custom),
      theme_custom_defaults: normalizeThemeCustomDefaultsConfig(
        config.theme_custom_defaults,
      ),
      stream_height: normalizeCardHeight(config.stream_height),
      stream_height_unit: normalizeCardHeightUnit(config.stream_height_unit),
      compact_preview: config.compact_preview === true,
      tight_margins: config.tight_margins === true,
      shadows: config.shadows !== false,
      borders: config.borders !== false,
      rounded_corners: config.rounded_corners !== false,
      outer_shadows: config.outer_shadows !== false,
      col_left_width_pct: normalizeWideLeftWidth(config.col_left_width_pct),
      video_defaults: this._normalizeVideoFactoryDefaults(
        config.video_defaults,
      ),
      video_live_defaults: this._normalizeVideoFactoryDefaults(
        config.video_live_defaults,
      ),
      video_popup_defaults: this._normalizeVideoFactoryDefaults(
        config.video_popup_defaults,
      ),
      video_recording_defaults: this._normalizeVideoFactoryDefaults(
        config.video_recording_defaults,
      ),
    };
    const enabledDesktopPages = getEnabledPageRoutes(
      nextConfig,
      DEVICE_ROUTE_BUCKETS.desktop,
    );
    if (nextConfig.card_view_standalone) {
      nextConfig.landing_page = PAGE_IDS.cardView;
    }
    if (!enabledDesktopPages.includes(nextConfig.landing_page)) {
      nextConfig.landing_page = enabledDesktopPages[0] || PAGE_IDS.singleView;
    }
    nextConfig.mobile_page = resolveEnabledMobilePageMode(
      nextConfig,
      nextConfig.mobile_page,
    );
    nextConfig.ha_dashboard_swipe_pages =
      resolveDashboardSwipePageSelection(
        nextConfig,
        DEVICE_ROUTE_BUCKETS.desktop,
      );
    const previewEnabledChanged =
      !!prevConfig &&
      prevConfig.preview_page_enabled !== nextConfig.preview_page_enabled;
    const mobileViewPageEnabledChanged =
      !!prevConfig &&
      prevConfig.mobile_view_page_enabled !==
        nextConfig.mobile_view_page_enabled;
    const wideViewPageEnabledChanged =
      !!prevConfig &&
      prevConfig.wide_view_page_enabled !== nextConfig.wide_view_page_enabled;
    const wideViewTakeoverDefaultChanged =
      !!prevConfig &&
      prevConfig.wide_view_alert_takeover !==
        nextConfig.wide_view_alert_takeover;
    const wideViewTimelineEnabledChanged =
      !!prevConfig &&
      prevConfig.wide_view_timeline_enabled !==
        nextConfig.wide_view_timeline_enabled;
    const wideViewTimelineDefaultOpenChanged =
      !!prevConfig &&
      prevConfig.wide_view_timeline_default_open !==
        nextConfig.wide_view_timeline_default_open;
    const wideViewTimelineDefaultScaleChanged =
      !!prevConfig &&
      prevConfig.wide_view_timeline_default_scale !==
        nextConfig.wide_view_timeline_default_scale;
    const cardViewPageEnabledChanged =
      !!prevConfig &&
      prevConfig.card_view_page_enabled !== nextConfig.card_view_page_enabled;
    const cardViewTakeoverDefaultChanged =
      !!prevConfig &&
      prevConfig.card_view_alert_takeover !==
        nextConfig.card_view_alert_takeover;
    const cardViewDrawerDefaultChanged =
      !!prevConfig &&
      prevConfig.card_view_drawer_default_open !==
        nextConfig.card_view_drawer_default_open;
    const cardViewStandaloneChanged =
      !!prevConfig &&
      prevConfig.card_view_standalone !== nextConfig.card_view_standalone;
    const displayLogoChanged =
      !!prevConfig && prevConfig.display_logo !== nextConfig.display_logo;
    const previewVisualChanged =
      !!prevConfig &&
      (prevConfig.preview_page_live_cameras !==
        nextConfig.preview_page_live_cameras ||
        prevConfig.preview_page_live_cameras_mobile !==
          nextConfig.preview_page_live_cameras_mobile ||
        prevConfig.preview_page_show_title_bars !==
          nextConfig.preview_page_show_title_bars ||
        prevConfig.preview_page_alert_live_duration_seconds !==
          nextConfig.preview_page_alert_live_duration_seconds);
    const previewModeConfigChanged =
      previewEnabledChanged || previewVisualChanged;

    this._committedConfig = this._cloneCardConfig(nextConfig);
    this._config = nextConfig;
    this._haNavbarController?.sync?.();
    this._haDashboardSwipeNavigationController?.sync?.();
    this._linkedLightController?.sync?.();
    this._applyScopedVideoFactoryDefaultsFromConfig(nextConfig);
    this._navigationFactory = null;
    if (!this._isSlideshowRotationAvailable()) {
      this._stopSlideshowRotation("config-change");
    }
    if (!this._isGridModeAvailable()) {
      const wasGridMode = this._viewMode === "grid";
      this._stopGridModeState();
      if (wasGridMode) {
        this._viewMode = "single";
        const restoredLiveAfterGrid =
          this._gridPageController.restoreLiveAfterGrid();
        if (restoredLiveAfterGrid) {
          this._scheduleResumeLive("grid-mode-config-disabled");
        } else {
          this._mountEngine();
        }
      }
    }
    this._syncVisualStyleToggles();
    this._haPageBackgroundController?.sync?.();
    this._previewPageController?.syncBottomNavbarPreviewChrome?.();
    this._browseOpen = this._config.browse_expanded;
    for (const c of flattenCameraMembers(cameras)) {
      if (!this._camCache[c.entity]) this._camCache[c.entity] = mkCamState();
    }
    if (this._isCardPickerPreviewContext()) {
      this._renderShell();
      return;
    }
    if (prevConfig) {
      this._wideViewPageController.applyCompanionConfigUpdate({
        takeoverDefaultChanged: wideViewTakeoverDefaultChanged,
      });
      this._wideViewPageController.applyTimelineConfigUpdate({
        enabledChanged: wideViewTimelineEnabledChanged,
        defaultOpenChanged: wideViewTimelineDefaultOpenChanged,
        defaultScaleChanged: wideViewTimelineDefaultScaleChanged,
      });
      this._cardViewPageController.applyConfigUpdate({
        takeoverDefaultChanged: cardViewTakeoverDefaultChanged,
        drawerDefaultChanged: cardViewDrawerDefaultChanged,
      });
    }

    if (!wasStarted || !prevConfig) {
      // The landing route rebuild in _start() hydrates Mobile View after hass exists.
      this._renderShell();
      return;
    }

    const prevCams = prevConfig.cameras || [];
    const nextCams = nextConfig.cameras || [];
    const camerasChanged =
      prevCams.length !== nextCams.length ||
      prevCams.some(
        (c, i) =>
          c?.entity !== nextCams[i]?.entity ||
          c?.group?.secondary_entity !==
            nextCams[i]?.group?.secondary_entity ||
          c?.group?.layout !== nextCams[i]?.group?.layout,
      );
    if (camerasChanged) {
      this._activeCameraAvailability = resolveCameraAvailabilitySnapshot({
        entity: this._activeCam?.entity || "",
        state: this._hass?.states?.[this._activeCam?.entity],
      }).current;
    }
    const hiddenTabsChanged =
      JSON.stringify(prevConfig.hidden_tabs || []) !==
      JSON.stringify(nextConfig.hidden_tabs || []);
    const needsShellRerender =
      hiddenTabsChanged ||
      previewEnabledChanged ||
      mobileViewPageEnabledChanged ||
      wideViewPageEnabledChanged ||
      wideViewTimelineEnabledChanged ||
      cardViewPageEnabledChanged ||
      cardViewStandaloneChanged ||
      displayLogoChanged;
    const needsEngineRemount = camerasChanged;
    const snapshotUpdateChanged =
      prevConfig.snapshot_update_seconds !== nextConfig.snapshot_update_seconds;
    const realtimePollChanged =
      prevConfig.realtime_poll_seconds !== nextConfig.realtime_poll_seconds ||
      prevConfig.mobile_poll_battery_saver !==
        nextConfig.mobile_poll_battery_saver;
    const activePageInvalid =
      !this._pageNavigationController.isPageRouteAvailable(this._pageId);

    const routeFlowOutcome =
      this._singleViewPageController.applyConfigUpdateRouteFlow({
        needsEngineRemount,
        nextCameraCount: nextCams.length,
        needsShellRerender,
        activePageInvalid,
        previewPageActive: this._isPreviewPageActive(),
        snapshotUpdateChanged: snapshotUpdateChanged,
        realtimePollChanged,
      });

    if (routeFlowOutcome === "preview") {
      this._singleViewPageController.applyPreviewConfigUpdateTail({
        previewModeConfigChanged,
        realtimePollChanged,
      });
      this._syncToolbarButtons();
      return;
    }

    if (routeFlowOutcome === "handled") {
      this._syncToolbarButtons();
      return;
    }
  }
  set hass(hass) {
    this._ensureEditorPreviewController();
    this._hass = hass;
    if (!this._config) return;
    if (this._editorPreviewController.renderCardPickerDemo()) {
      this._started = true;
      this._applyCardStyle();
      return;
    }
    const nowMs = Date.now();
    const activeCameraAvailability = resolveCameraAvailabilitySnapshot({
      previous: this._activeCameraAvailability,
      entity: this._activeCam?.entity || "",
      state: hass?.states?.[this._activeCam?.entity],
    });
    this._activeCameraAvailability = activeCameraAvailability.current;
    const cameraStateSignature = hassEntityStateSignature(
      hass,
      configuredCameraEntities(this._config),
    );
    const linkedLightStateSignature =
      this._linkedLightController?.stateSignature?.() || "";
    const themeSignature = hassThemeSignature(hass);
    const reviewStatusSignature = haReviewStatusSignature({
      hass,
      cameras: flattenCameraMembers(this._config?.cameras),
      resolveDiscoveredCameraName: (entity) => this._camCache?.[entity]?.cam,
    });
    const cameraStateChanged =
      cameraStateSignature !== this._lastHassCameraStateSignature;
    const linkedLightStateChanged =
      linkedLightStateSignature !== this._lastHassLinkedLightStateSignature;
    const themeChanged = themeSignature !== this._lastHassThemeSignature;
    const reviewStatusChanged =
      reviewStatusSignature !== this._lastHassReviewStatusSignature;
    const reviewStatusPollIntervalMs = Math.max(
      250,
      Math.floor(this._effectiveRealtimePollSeconds() * 1000),
    );
    const reviewStatusPollDue =
      nowMs - Number(this._lastHaReviewStatusApplyAt || 0) >=
      reviewStatusPollIntervalMs;
    const shouldApplyHaReviewStatus =
      reviewStatusChanged || reviewStatusPollDue;
    this._lastHassCameraStateSignature = cameraStateSignature;
    this._lastHassLinkedLightStateSignature = linkedLightStateSignature;
    this._lastHassThemeSignature = themeSignature;
    this._lastHassReviewStatusSignature = reviewStatusSignature;
    if (linkedLightStateChanged) this._linkedLightController?.sync?.();
    if (!this._started) {
      this._started = true;
      this._start();
      return;
    }
    this._editorPreviewController.syncHassPreviewContext();
    let haReviewAlertActive = false;
    if (shouldApplyHaReviewStatus) {
      this._lastHaReviewStatusApplyAt = nowMs;
      haReviewAlertActive = this._applyHaReviewStatusAlerts();
    }
    if (
      !cameraStateChanged &&
      !themeChanged &&
      !reviewStatusChanged &&
      !haReviewAlertActive
    )
      return;
    this._singleViewPageController.applyHassUpdateRouteFlow({
      cameraStateChanged:
        cameraStateChanged || reviewStatusChanged || haReviewAlertActive,
      activeCameraRecovered: activeCameraAvailability.recovered,
      themeChanged,
      previewPageActive: this._isPreviewPageActive(),
    });
  }
  get _activeCam() {
    return (
      this._config?.cameras[this._activeCamIdx] || this._config?.cameras[0]
    );
  }
  getCardSize() {
    if (this._isCardPickerPreviewContext()) return 2;
    if (this._isPreviewContext() || this._config?.compact_preview === true) {
      return 3;
    }
    return 12;
  }
  getGridOptions() {
    return {
      columns: 12,
      rows: 12,
      min_rows: 6,
      min_columns: 6,
    };
  }
  disconnectedCallback() {
    void this._stopPtzMotion("disconnected");
    const preserveDashboardLive =
      this._haDashboardSwipeNavigationController?.isCurrentDashboardScope?.() ===
        true && this._preserveLiveForDashboardNavigation();
    this._haNavbarController?.disconnect?.();
    this._haDashboardSwipeNavigationController?.disconnect?.();
    this._haPageBackgroundController?.disconnect?.();
    if (this._resumeLiveT) {
      clearTimeout(this._resumeLiveT);
      this._resumeLiveT = null;
    }
    if (this._disconnectTeardownT) clearTimeout(this._disconnectTeardownT);
    this._disconnectTeardownT = setTimeout(() => {
      this._disconnectTeardownT = null;
      if (this.isConnected) return;
      this._teardownDisconnected();
    }, preserveDashboardLive ? MSE_SWITCH_GRACE_MS : 2500);
  }

  _teardownDisconnected() {
    this._dashboardLiveGraceActive = false;
    this._haNavbarController?.disconnect?.();
    this._haDashboardSwipeNavigationController?.disconnect?.();
    this._haPageBackgroundController?.disconnect?.();
    void this._ptzMotionController?.dispose?.();
    this._activePtzButtonAction = "";
    this._activePtzButtonPointerId = null;
    this._linkedLightController?.cancelInteractions?.();
    this._clearTwoWayTalkResultBubble?.();
    void this._stopTwoWayTalkSession({ restoreLive: false });
    this._stopSlideshowRotation("disconnect", false);
    this._stopGridModeState();
    this._stopPreviewMode();
    this._wideViewPageController?.stopWideViewMode?.();
    this._cardViewPageController?.deactivate?.();
    if (this._rt) clearTimeout(this._rt);
    this._rt = null;
    if (this._refresh) clearInterval(this._refresh);
    if (this._unsub) {
      const unsubscribePromise = this._unsub;
      void (async () => {
        try {
          const unsubscribe = await unsubscribePromise;
          if (typeof unsubscribe === "function") unsubscribe();
        } catch (_) {}
      })();
      this._unsub = null;
    }
    if (this._ro) this._ro.disconnect();
    this._ro = null;
    this._pageNavigationController.disconnectToolbarDivider();
    if (this._io) this._io.disconnect();
    this._io = null;
    if (this._realtimeHeadPollT) clearInterval(this._realtimeHeadPollT);
    this._realtimeHeadPollT = null;
    if (this._warmOtherCamsDelayT) clearTimeout(this._warmOtherCamsDelayT);
    this._warmOtherCamsDelayT = null;
    if (this._resumeLiveT) clearTimeout(this._resumeLiveT);
    if (this._editorPreviewController) {
      try {
        this._editorPreviewController.dispose();
      } catch (_) {}
    }
    if (this._liveControlsHideTimer) clearTimeout(this._liveControlsHideTimer);
    Object.values(this._snapshotResultTimers || {}).forEach((timer) => {
      if (timer) clearTimeout(timer);
    });
    this._snapshotResultTimers = { live: null, popup: null };
    if (this._liveOverlayControlsController) {
      try {
        this._liveOverlayControlsController.dispose();
      } catch (_) {}
      this._liveOverlayControlsController = null;
    }
    this._liveViewResizeController?.dispose();
    this._cameraGroupLiveController?.teardown?.();
    this._liveFullscreenLifecycleController?.dispose();
    this._clearPictureInPictureButtonController("live");
    if (this._playbackTargetController) {
      try {
        this._playbackTargetController.dispose();
      } catch (_) {}
    }
    if (this._listScrollController) {
      try {
        this._listScrollController.dispose();
      } catch (_) {}
      this._listScrollController = null;
    }
    if (this._recordingsSwipeController) {
      this._recordingsSwipeController.dispose();
      this._recordingsSwipeController = null;
    }
    this._popupLifecycleController.dispose();
    if (this._onDocVisibility) {
      document.removeEventListener("visibilitychange", this._onDocVisibility);
    }
    if (this._onWindowBlur) {
      window.removeEventListener("blur", this._onWindowBlur);
    }
    if (this._onPageHide) {
      window.removeEventListener("pagehide", this._onPageHide);
    }
    if (this._onWindowPtzPointerStop) {
      window.removeEventListener(
        "pointerup",
        this._onWindowPtzPointerStop,
        true,
      );
      window.removeEventListener(
        "pointercancel",
        this._onWindowPtzPointerStop,
        true,
      );
    }
    if (this._onShadowError) {
      this.shadowRoot.removeEventListener("error", this._onShadowError, true);
    }
    if (this._onFullscreenChange) {
      document.removeEventListener(
        "fullscreenchange",
        this._onFullscreenChange,
      );
      document.removeEventListener(
        "webkitfullscreenchange",
        this._onFullscreenChange,
      );
    }
    if (this._onViewportChange) {
      window.removeEventListener("resize", this._onViewportChange);
      window.visualViewport?.removeEventListener(
        "resize",
        this._onViewportChange,
      );
      window.visualViewport?.removeEventListener(
        "scroll",
        this._onViewportChange,
      );
    }
    if (this._onOrientationChange) {
      window.removeEventListener(
        "orientationchange",
        this._onOrientationChange,
      );
    }
    if (this._onEditorPreviewDraft) {
      window.removeEventListener(
        "frigate-view-card-preview-draft",
        this._onEditorPreviewDraft,
      );
    }
    if (this._onDocumentPointerDown) {
      document.removeEventListener("pointerdown", this._onDocumentPointerDown);
    }
    if (this._rotateOverlayRaf) cancelAnimationFrame(this._rotateOverlayRaf);
    this._rotateOverlayRaf = 0;
    if (this._rotateOverlayExitT) clearTimeout(this._rotateOverlayExitT);
    this._rotateOverlayExitT = null;
    this.classList?.remove?.(MOBILE_VIEW_ROTATE_COVER_CLASS);
    this._clearRotateOverlayAudioSync();
    this._clearRotateVideoFullscreenStyle();
    this._mseGraceController.clearGracePool();
    if (this._parentOrigStyle && this.parentElement) {
      this.parentElement.style.height = this._parentOrigStyle.height;
      this.parentElement.style.margin = this._parentOrigStyle.margin;
      this.parentElement.style.padding = this._parentOrigStyle.padding;
    }
    this._setSectionsRowGap(false);
    this._cleanupEngine();
    this._clearLiveEngineSlot();
  }
  // ── init ─────────────────────────────────────────────────
  async _start() {
    if (this._editorPreviewController.renderCardPickerDemo()) {
      this._applyCardStyle();
      return;
    }
    const deepLinkHandlingEnabled =
      this._deepLinkController.isDeepLinkHandlingEnabled();
    if (deepLinkHandlingEnabled) {
      this._deepLinkController.initDeepLinkFromUrl();
    }
    if (!this._deepLinkController.hasParsedDeepLinkTarget()) {
      this._activeCamIdx = 0;
      this._activeGroupMemberOverride = "";
    }
    this._pageNavigationController.prepareConfiguredLandingPageShell({
      hasPendingDeepLinkTarget:
        this._deepLinkController.hasParsedDeepLinkTarget(),
    });

    await this._discoverAll();
    if (this._editorPreviewController.renderCardPickerDemo()) {
      this._applyCardStyle();
      return;
    }
    if (deepLinkHandlingEnabled) {
      this._deepLinkController.applyDeepLinkCameraHint();
    }
    const hasPendingDeepLinkTarget =
      this._deepLinkController.hasPendingDeepLinkTarget();
    // Discovery resolves Frigate camera-name hints. Reconfirm the shell so a
    // non-matching card cannot activate a final route on the provisional one.
    this._pageNavigationController.prepareConfiguredLandingPageShell({
      hasPendingDeepLinkTarget,
    });
    const now = Math.floor(Date.now() / 1000);
    this._followNowWindow = true;
    this._winEnd = now;
    this._winStart = now - this._config.window_days * DAY;

    const initialLoad = this._browseWindowLoaderController.loadWindow(true);
    this._browseWindowLoaderController.scheduleWarmOtherCamerasEvents();
    const startInGrid = this._shouldStartInGridMode();
    this._pageNavigationController.navigateToConfiguredLandingPage({
      source: "startup",
      startup: true,
      startInGrid,
      hasPendingDeepLinkTarget,
    });
    await initialLoad;
    void this._prefetchCalendarActivityForActiveCamera();
    this._subscribe();
    this._startEditModeWatchdog();
    this._startEditorDialogCloseObserver();
    this._deepLinkController.consumeDeepLinkReviewOpen();
    this._deepLinkController.consumeDeepLinkEventOpen();
    this._refresh = setInterval(() => {
      if (this._isNowWindow()) {
        if (this._isCardViewPageActive()) {
          void this._cardViewPageController.refreshActiveContent({
            force: true,
          });
        } else {
          this._browseWindowLoaderController.loadWindow(true);
        }
      }
    }, this._config.refresh_seconds * 1000);
    this._restartRealtimeHeadPollTimer();
    this._setupResizeObserver();
  }

  _isLikelyMobileClient() {
    return DEVICE_PROFILE.isMobile;
  }

  _isLikelyPhoneClient() {
    return DEVICE_PROFILE.isPhone;
  }

  _effectiveRealtimePollSeconds() {
    if (
      this._config?.mobile_poll_battery_saver === true &&
      this._isLikelyMobileClient()
    ) {
      return MOBILE_BATTERY_SAVER_POLL_SECONDS;
    }
    const configured = Number(this._config?.realtime_poll_seconds);
    return REALTIME_POLL_OPTIONS_SECONDS.includes(configured)
      ? configured
      : REALTIME_HEAD_POLL_MS / 1000;
  }

  _restartRealtimeHeadPollTimer() {
    if (this._realtimeHeadPollT) clearInterval(this._realtimeHeadPollT);
    this._realtimeHeadPollT = setInterval(
      () => this._pollLatestEventHead(),
      this._effectiveRealtimePollSeconds() * 1000,
    );
  }

  _startEditModeWatchdog() {
    this._editorPreviewController.startEditModeWatchdog();
  }

  _isDashboardEditMode() {
    return this._editorPreviewController.isDashboardEditMode();
  }

  _isCardEditorDialogOpen() {
    return this._editorPreviewController.isCardEditorDialogOpen();
  }

  _startEditorDialogCloseObserver() {
    this._editorPreviewController.startEditorDialogCloseObserver();
  }

  // Discover all cameras in parallel for faster startup
  async _discoverAll() {
    await Promise.all(
      flattenCameraMembers(this._config.cameras).map((c) =>
        this._discoverOne(c.entity),
      ),
    );
  }
  async _discoverOne(entity) {
    const cache = this._camCache[entity] || mkCamState();
    if (cache.discovered) return;
    const ent = this._hass?.states?.[entity];
    if (!ent) return;
    cache.clientId =
      ent.attributes?.client_id || ent.attributes?.mqtt_client_id || "frigate";
    cache.cam = ent.attributes?.camera_name || entity.replace(/^camera\./, "");
    cache.discovered = true;
    this._camCache[entity] = cache;
  }

  // ── stream (browser-aware protocol) ────────────────────────
  _isFirefox() {
    const ua = navigator.userAgent || "";
    return /firefox/i.test(ua) && !/seamonkey/i.test(ua);
  }

  _isEdge() {
    const ua = navigator.userAgent || "";
    return /edg\//i.test(ua);
  }

  _isSafari() {
    const ua = navigator.userAgent || "";
    return /safari/i.test(ua) && !/chrome|chromium|crios|fxios|edg\//i.test(ua);
  }

  _supportsNativeHlsPlayback() {
    return supportsNativeHlsPlayback();
  }

  _useHaDirectStreamPath() {
    const entity =
      this._activeGroupMemberOverride || this._activeCam?.entity;
    return !!entity && !this._shouldUseGo2RtcForEntity(entity);
  }

  _cameraConnectionType(entity) {
    return resolveCameraConnectionType({
      config: this._config,
      entity,
      defaultConnectionType: DEFAULT_CAMERA_CONNECTION_TYPE,
      normalizeCameraConnectionType,
    });
  }

  _shouldUseGo2RtcForEntity(entity) {
    const key = entity || this._activeCam?.entity || "";
    if (!key) return true;
    return this._cameraConnectionType(key) !== "ha_direct";
  }

  _resolveGo2RtcEntity(entity = "") {
    const targetEntity = resolveGo2RtcEntity({
      entity,
      activeEntity: this._activeCam?.entity || "",
      config: this._config,
      defaultConnectionType: DEFAULT_CAMERA_CONNECTION_TYPE,
      normalizeCameraConnectionType,
    });
    return this._shouldUseGo2RtcForEntity(targetEntity) ? targetEntity : "";
  }

  _isEditorPreviewContext() {
    return this._editorPreviewController.isEditorPreviewContext();
  }

  _isCardPickerPreviewContext() {
    return this._editorPreviewController.isCardPickerPreviewContext();
  }

  _isPreviewContext() {
    return this._editorPreviewController.isPreviewContext();
  }

  _preferredStreamType() {
    if (DEVICE_PROFILE.isIOS) return "webrtc";
    return "webrtc";
  }

  _currentLiveStreamHint() {
    const active = String(this._activeStreamType || "")
      .trim()
      .toLowerCase();
    if (active === "webrtc" || active === "mse" || active === "hls") {
      return active;
    }
    const lastHint = String(this._lastLiveStreamHint || "")
      .trim()
      .toLowerCase();
    if (lastHint === "webrtc" || lastHint === "mse" || lastHint === "hls") {
      return lastHint;
    }
    return this._preferredStreamType();
  }

  _assignLiveEngine(engine) {
    if (this._engine === engine) {
      if (engine) this._attachMainLiveVideoZoom(engine);
      this._syncPictureInPictureButtons();
      return;
    }
    this._clearLiveVideoZoom();
    this._clearPictureInPictureButtonController("live");
    this._liveViewResizeController?.attachMedia(null);
    this._engine = engine;
    if (engine) {
      this._attachMainLiveVideoZoom(engine);
    } else {
      this._syncPictureInPictureButtons();
    }
  }

  _attachMainLiveVideoZoom(engine, retries = 12) {
    if (!engine || this._engine !== engine) return;
    const video =
      engine.video ||
      this._findFullscreenVideo(engine) ||
      this._findVideoDeep(engine);
    if (video) {
      this._liveViewResizeController?.attachMedia(video);
      if (this._liveVideoZoomController?.video === video) {
        this._liveVideoZoomController.refresh();
        this._syncPictureInPictureButtons();
        return;
      }
      this._clearLiveVideoZoom();
      this._liveVideoZoomController = attachVideoZoom(video);
      this._syncLiveRotateZoomPresentation();
      this._syncPictureInPictureButtons();
      return;
    }
    if (retries <= 0) return;
    setTimeout(() => {
      if (this._engine !== engine) return;
      this._attachMainLiveVideoZoom(engine, retries - 1);
    }, 160);
  }

  _clearLiveVideoZoom() {
    this._liveVideoZoomController?.dispose?.();
    this._liveVideoZoomController = null;
  }

  _syncLiveRotateZoomPresentation(card = this._$("#card")) {
    const suspend = Boolean(
      card?.classList?.contains("mobile-rotate-live") ||
        card?.classList?.contains("mobile-rotate-live-exit"),
    );
    this._liveVideoZoomController?.setPresentationSuspended?.(suspend);
  }

  _attachPopupVideoZoom(video) {
    if (this._popupVideoZoomController?.video === video) {
      this._popupVideoZoomController.refresh();
      return this._popupVideoZoomController;
    }
    this._clearPopupVideoZoom?.();
    const viewer = this._$("#viewer");
    this._popupVideoZoomController = attachVideoZoom(video, {
      host: viewer || video?.parentElement,
      interactionTarget: viewer || video,
      nativeCoverPan: true,
    });
    return this._popupVideoZoomController;
  }

  _clearPopupVideoZoom() {
    this._popupVideoZoomController?.dispose?.();
    this._popupVideoZoomController = null;
  }

  _cleanupEngine(options = {}) {
    this._go2rtcRaceMounter?.cancelPendingWebRtcAttempts?.();
    return this._mseGraceController.cleanupEngine(options);
  }

  _clearLiveEngineSlot() {
    const engineSlot = this._$("#engine");
    if (engineSlot) engineSlot.innerHTML = "";
  }

  _cancelPendingMount(reason = "", options = {}) {
    this._applyMountTrackingState(
      invalidateMountTrackingIfActive({
        mountSeq: this._mountSeq,
        mountInProgress: this._mountInProgress,
        mountStartedAt: this._mountStartedAt,
        mountTargetEntity: this._mountTargetEntity,
      }),
    );
    this._cleanupEngine(options);
  }

  _applyMountTrackingState(nextState) {
    this._mountSeq = nextState.mountSeq;
    this._mountInProgress = nextState.mountInProgress;
    this._mountStartedAt = nextState.mountStartedAt;
    this._mountTargetEntity = nextState.mountTargetEntity;
  }

  _waitForStreamStart(streamEl, timeoutMs = 3500, opts = {}) {
    const minCurrentTime = Number(opts.minCurrentTime ?? 0.05);
    const minDecodedFrames = Number(opts.minDecodedFrames ?? 1);
    const requireReadyState = Number(opts.requireReadyState ?? 0);
    const strict = opts.strict === true;
    const abortSignal = opts.abortSignal || null;
    return new Promise((resolve) => {
      let settled = false;
      let frameCallbackBound = false;
      let eventBound = false;
      let onAbort = null;
      const done = (ok) => {
        if (settled) return;
        settled = true;
        clearInterval(tick);
        clearTimeout(to);
        if (abortSignal && onAbort) {
          try {
            abortSignal.removeEventListener("abort", onAbort);
          } catch (_) {}
        }
        resolve(ok);
      };
      if (abortSignal) {
        onAbort = () => done(false);
        if (abortSignal.aborted) {
          done(false);
          return;
        }
        abortSignal.addEventListener("abort", onAbort, { once: true });
      }
      const tick = setInterval(() => {
        const v =
          streamEl.querySelector("video") ||
          streamEl.shadowRoot?.querySelector("video");
        if (!v) return;
        if (!frameCallbackBound && v.requestVideoFrameCallback) {
          frameCallbackBound = true;
          v.requestVideoFrameCallback(() => done(true));
        }
        if (!eventBound) {
          eventBound = true;
          const finish = () => {
            if (!strict) done(true);
          };
          v.addEventListener("loadeddata", finish, { once: true });
          v.addEventListener("canplay", finish, { once: true });
          v.addEventListener("playing", finish, { once: true });
          v.addEventListener("timeupdate", finish, { once: true });
        }
        const decoded =
          Number(v.webkitDecodedFrameCount) ||
          Number(v.getVideoPlaybackQuality?.().totalVideoFrames) ||
          0;
        const ready = Number(v.readyState) || 0;
        const timeOk = v.currentTime >= minCurrentTime;
        const decodeOk = decoded >= minDecodedFrames;
        if (ready >= requireReadyState && (timeOk || decodeOk)) done(true);
      }, 180);
      const to = setTimeout(() => done(false), timeoutMs);
    });
  }

  _applyVideoFit(videoEl) {
    if (!videoEl) return;
    videoEl.style.display = "block";
    videoEl.style.width = "100%";
    videoEl.style.height = "100%";
    videoEl.style.objectPosition = "center center";
    videoEl.style.objectFit = "contain";
  }

  _attachVideoFit(streamEl, retries = 12) {
    if (!streamEl) return;
    const v =
      streamEl.tagName?.toLowerCase() === "video"
        ? streamEl
        : streamEl.querySelector("video") ||
          streamEl.shadowRoot?.querySelector("video");
    if (v) {
      this._applyVideoFit(v);
      return;
    }
    if (retries <= 0) return;
    setTimeout(() => this._attachVideoFit(streamEl, retries - 1), 160);
  }

  _setStreamLoading(loading, text = "Loading…") {
    applyStreamLoadingStateForCard({
      card: this,
      loading,
      text,
    });
  }

  _setActiveStreamType(type) {
    if (this._gridPageController?.captureBackgroundLiveStreamType?.(type)) {
      return;
    }
    applyActiveStreamTypeForCard({
      card: this,
      type,
    });
    this._syncTwoWayTalkRuntimeState();
    this._syncTwoWayTalkButton();
    this._liveViewResizeController?.sync();
  }

  _setStreamFallbackVisible(visible, refreshImage = false) {
    applyStreamFallbackVisibilityForCard({
      card: this,
      visible,
      refreshImage,
    });
    this._liveViewResizeController?.sync();
  }

  _fallbackOriginForAdapters() {
    this._fallbackOrigin = window.location.origin;
    return this._fallbackOrigin;
  }

  async _streamFallbackUrl(entity) {
    return await loadFallbackPrimaryForCard({
      card: this,
      entity,
      origin: this._fallbackOriginForAdapters(),
    });
  }

  _streamFallbackAltUrl(entity) {
    return loadFallbackAltForCard({
      card: this,
      entity,
      origin: this._fallbackOriginForAdapters(),
    });
  }

  async _refreshStreamFallbackImage() {
    await runFallbackRefreshCycleForCard({
      card: this,
      applyHandlers: applyFallbackImageHandlers,
      applySource: setFallbackImageSourceIfChanged,
    });
  }

  _cameraContext(entity) {
    return this._camCache[entity] || mkCamState();
  }

  _applyResolvedStreamUiState(streamState) {
    if (!streamState) return;
    this._setStreamLoading(streamState.loading);
    this._setStreamFallbackVisible(
      streamState.fallbackVisible,
      streamState.refreshFallbackImage,
    );
    if (streamState.enableNativeControls) {
      this._setLiveNativeControls(true);
    }
  }

  _applyRotateOverlayUiPlan(card, uiPlan) {
    if (!card || !uiPlan) return;
    if (uiPlan.removeClasses.length) {
      card.classList.remove(...uiPlan.removeClasses);
    }
    if (uiPlan.addClasses.length) {
      card.classList.add(...uiPlan.addClasses);
    }
    this.classList.toggle(
      MOBILE_VIEW_ROTATE_COVER_CLASS,
      card.classList.contains(MOBILE_VIEW_ACTIVE_CLASS) &&
        uiPlan.retainViewportCover,
    );
    this._rotateOverlayActive = uiPlan.active;
    this._rotateOverlayMode = uiPlan.mode;
    if (uiPlan.disableNativeControls) {
      this._setLiveNativeControls(false, {
        applyFullscreenStyle: uiPlan.active && uiPlan.mode === "live",
      });
    }
    this._syncLiveRotateZoomPresentation(card);
    if (uiPlan.clearLiveControlsVisible) {
      this._$("#live-stage")?.classList.remove("live-controls-visible");
    }
    if (uiPlan.clearLoading) this._setStreamLoading(false);
    if (uiPlan.enableNativeControls) this._setLiveNativeControls(true);
    if (uiPlan.syncFullscreenButtons) this._syncFullscreenButtonsVisibility();
    if (uiPlan.showLiveControls) this._showLiveControlsTemporarily();
    if (uiPlan.showPopupControls) {
      this._popupMediaControlsController.showTemporarily();
    }
  }

  async _mountEngine(forcedType = null, options = {}) {
    const mountPromise = this._liveMountController.mount({
      forcedType,
      quiet: options?.quiet === true,
      entity:
        this._activeGroupMemberOverride || this._activeCam?.entity || "",
      twoWayTalkOptions: options?.twoWayTalkOptions || null,
    });
    this._cameraGroupLiveController?.sync?.();
    const mounted = await mountPromise;
    this._cameraGroupLiveController?.sync?.();
    return mounted;
  }

  _adoptLiveAttemptResult(slot, result, options = {}) {
    return adoptMountedAttemptResult({
      targetSlot: slot,
      result,
      preservePendingSlots: options.preservePendingSlots === true,
      streamMuted: this._streamMuted,
      rotateOverlayActive: this._rotateOverlayActive,
      assignEngine: (engine) => this._assignLiveEngine(engine),
      setEngineMountedMuted: (muted) => {
        this._engineMountedMuted = muted;
      },
      setActiveStreamType: (type) => this._setActiveStreamType(type),
      setStreamLoading: (loading) => this._setStreamLoading(loading),
      setStreamFallbackVisible: (visible) =>
        this._setStreamFallbackVisible(visible),
      setLiveNativeControls: (enabled) =>
        this._setLiveNativeControls(enabled),
    });
  }

  _isPreviewPageEnabled() {
    return this._previewPageController.isPreviewPageEnabled();
  }

  _isPreviewPageActive() {
    return this._previewPageController.isPreviewPageActive();
  }

  _deviceRouteBucket() {
    return resolveDeviceRouteBucket(DEVICE_PROFILE);
  }

  _activateSingleViewPageRoute(context = {}) {
    this._singleViewPageController.activateSingleViewPageRoute(context);
  }

  _activateMobileViewPageRoute(context = {}) {
    void this._stopTwoWayTalkSession({ restoreLive: false });
    this._mobileViewPageController.activateMobileViewPageRoute(context);
  }

  _isMobileViewPageActive() {
    return normalizePageRoute(this._pageId) === PAGE_IDS.mobileView;
  }

  _isCardViewPageActive() {
    return normalizePageRoute(this._pageId) === PAGE_IDS.cardView;
  }

  _activeStandardPageController() {
    if (this._isCardViewPageActive()) return this._cardViewPageController;
    return this._isMobileViewPageActive()
      ? this._mobileViewPageController
      : this._singleViewPageController;
  }

  _syncMobileViewPageMarkup() {
    this._mobileViewPageController.syncMobileViewPageMarkup();
  }

  _activateCardViewPageRoute(context = {}) {
    void this._stopTwoWayTalkSession({ restoreLive: false });
    this._cardViewPageController.activateCardViewPageRoute(context);
  }

  _syncCardViewPageMarkup() {
    this._cardViewPageController.syncCardViewPageMarkup();
  }

  registerPageShellLayout(pageId, layoutProfile = {}) {
    this._pageShellRegistry?.register(pageId, layoutProfile);
  }

  _activePageShellLayoutProfile() {
    return this._pageShellRegistry?.resolve(this._pageId) || {};
  }

  _activePageShellCapabilities() {
    return resolvePageCapabilities(this._activePageShellLayoutProfile());
  }

  _activateWideViewPageRoute(context = {}) {
    this._wideViewPageController.activateWideViewPageRoute(context);
  }

  _activatePreviewPageRoute(context = {}) {
    void this._stopTwoWayTalkSession({ restoreLive: false });
    this._previewPageController.activatePreviewPageRoute(context);
  }

  _applyPreviewShellVisibility() {
    if (this._isPreviewPageEnabled() && this._isPreviewPageActive()) {
      this._ensurePreviewLayoutShell();
    } else {
      this._removePreviewLayoutShell();
    }
    this._previewPageController.applyPreviewShellVisibility();
  }

  _buildPreviewLayoutShellMarkup() {
    return this._previewPageController.buildPreviewLayoutShellMarkup();
  }

  _ensurePreviewLayoutShell() {
    return this._previewPageController.ensurePreviewLayoutShell();
  }

  _removePreviewLayoutShell() {
    this._previewPageController.removePreviewLayoutShell();
  }

  _clearPreviewTimers() {
    this._previewAlertController.clearTimers();
    this._clearSnapshotRefreshTimer();
  }

  _clearSnapshotRefreshTimer() {
    if (this._snapshotRefreshT) clearTimeout(this._snapshotRefreshT);
    this._snapshotRefreshT = null;
  }

  _snapshotUpdateMs() {
    const seconds = Number(this._config?.snapshot_update_seconds);
    const resolved =
      Number.isFinite(seconds) && seconds > 0
        ? seconds
        : SNAPSHOT_UPDATE_SECONDS;
    return Math.max(
      10000,
      Math.min(
        SNAPSHOT_UPDATE_OPTIONS_SECONDS[
          SNAPSHOT_UPDATE_OPTIONS_SECONDS.length - 1
        ] * 1000,
        Math.round(resolved * 1000),
      ),
    );
  }

  _syncSnapshotRefreshTimer() {
    this._clearSnapshotRefreshTimer();
    const shouldRefreshPreview =
      this._isPreviewPageActive() &&
      !this._previewPageController.previewLiveCamerasEnabled();
    const shouldRefreshGrid =
      this._viewMode === "grid" &&
      this._config?.grid_live_view_enabled === false;
    const shouldRefreshWideCompanions =
      this._wideViewPageController.isWideViewPageActive() &&
      !this._wideViewPageController.companionLiveCamerasEnabled();
    if (
      !shouldRefreshPreview &&
      !shouldRefreshGrid &&
      !shouldRefreshWideCompanions
    ) {
      return;
    }
    this._snapshotRefreshT = setTimeout(() => {
      this._snapshotRefreshT = null;
      if (
        this._isPreviewPageActive() &&
        !this._previewPageController.previewLiveCamerasEnabled()
      ) {
        void this._refreshSnapshotMedia().finally(() => {
          this._syncSnapshotRefreshTimer();
        });
        return;
      }
      if (
        this._viewMode === "grid" &&
        this._config?.grid_live_view_enabled === false
      ) {
        void this._refreshSnapshotMedia().finally(() => {
          this._syncSnapshotRefreshTimer();
        });
        return;
      }
      if (
        this._wideViewPageController.isWideViewPageActive() &&
        !this._wideViewPageController.companionLiveCamerasEnabled()
      ) {
        void this._refreshSnapshotMedia().finally(() => {
          this._syncSnapshotRefreshTimer();
        });
      }
    }, this._snapshotUpdateMs());
  }

  _isPreviewCameraAlertLive(entity) {
    return this._previewAlertController.isCameraAlertLive(entity);
  }

  _teardownPreviewMedia() {
    this._previewPageController.teardownPreviewMedia();
  }

  _renderPreviewPage() {
    this._previewPageController.renderPreviewPage();
    this._syncSnapshotRefreshTimer();
  }

  _refreshSnapshotMedia() {
    return this._gridMediaController.refreshSnapshotMedia();
  }

  _updatePreviewMeta() {
    this._previewPageController.updatePreviewMeta();
  }

  _mountPreviewMedia() {
    this._previewPageController.mountPreviewMedia();
  }

  _startPreviewMode() {
    this._previewPageController.startPreviewMode();
  }

  _stopPreviewMode() {
    this._previewPageController.stopPreviewMode();
  }

  _exitPreviewPageToCamera(idx, selectedEntity = "") {
    this._previewPageController.exitPreviewPageToCamera(idx, selectedEntity);
  }

  _returnToPreviewPage() {
    this._previewPageController.returnToPreviewPage();
  }

  // ── view mode ─────────────────────────────────────────────
  _isGridModeAvailable() {
    return this._gridPageController.isGridModeAvailable();
  }

  _gridRotationMs() {
    return this._gridPageController.gridRotationMs();
  }

  _clearGridTimers() {
    this._gridPageController.clearGridTimers();
    this._clearSnapshotRefreshTimer();
  }

  _clearGridAlertTracking() {
    this._gridPageController.clearGridAlertTracking();
  }

  _scheduleGridRefresh(delayMs = 80) {
    this._gridPageController.scheduleGridRefresh(delayMs);
  }

  _shouldStartInGridMode() {
    return this._gridPageController.shouldStartInGridMode();
  }

  _applyStartInGridMode(_source = "") {
    this._gridPageController.applyStartInGridMode(_source);
  }

  _gridLiveViewEnabled() {
    return this._config?.grid_live_view_enabled !== false;
  }

  _previewAlertHoldMs() {
    const seconds = Number(
      this._config?.preview_page_alert_live_duration_seconds,
    );
    return Number.isFinite(seconds) && seconds > 0
      ? Math.max(1000, Math.round(seconds * 1000))
      : PREVIEW_ALERT_HOLD_MS;
  }

  _slideshowAlertHoldMs() {
    const seconds = Number(this._config?.slideshow_alert_hold_seconds);
    return Number.isFinite(seconds) && seconds > 0
      ? Math.max(1000, Math.round(seconds * 1000))
      : SLIDESHOW_ALERT_HOLD_MS;
  }

  _gridAlertHoldMs() {
    const seconds = Number(this._config?.grid_alert_hold_seconds);
    return Number.isFinite(seconds) && seconds > 0
      ? Math.max(1000, Math.round(seconds * 1000))
      : GRID_ALERT_HOLD_MS;
  }

  _isGridCameraAlertLive(entity) {
    return this._gridAlertController.isCameraAlertLive(entity);
  }

  _gridCellSeverity(entity) {
    return this._gridAlertController.cellSeverity(entity);
  }

  _scheduleGridRotation() {
    this._gridPageController.scheduleGridRotation();
  }

  _advanceGridRotation() {
    this._gridPageController.advanceGridRotation();
  }

  _focusGridPageForCamera(entity) {
    return this._gridPageController.focusGridPageForCamera(entity);
  }

  _markGridAlertCamera(entity, severity = "alert") {
    return this._gridAlertController.markAlertCamera(entity, severity);
  }

  async _probeLatestGridAlert() {
    await this._gridAlertController.probeLatestAlert();
  }

  _handleGridRealtimeMessage(msg) {
    this._gridAlertController.handleRealtimeMessage(msg);
  }

  _stopGridModeState() {
    this._gridPageController.stopGridModeState();
  }

  _toggleGridMode() {
    this._gridPageController.toggleGridMode();
  }

  _setViewMode(mode) {
    if (this._isPreviewPageActive()) return;
    if (
      mode === "grid" &&
      this._viewMode !== "grid" &&
      this._toolbarButtonStates().gridDisabled
    ) {
      this._syncToolbarButtons();
      return;
    }
    const nextMode =
      mode === "grid" && this._isGridModeAvailable() ? "grid" : "single";
    const previousMode = this._viewMode;
    const enteringGrid = previousMode !== "grid" && nextMode === "grid";
    const leavingGrid = previousMode === "grid" && nextMode !== "grid";
    const gridLiveHandoff = leavingGrid
      ? this._gridPageController.takeColdStartLiveHandoff()
      : null;
    if (this._viewMode === "grid" && nextMode !== "grid") {
      this._stopGridModeState();
      this._gridLastRenderSignature = "";
    }
    let startGridTimers = false;
    if (nextMode === "grid") {
      if (enteringGrid) this._gridPageController.prepareLiveForGrid();
      this._stopSlideshowRotation("grid-mode", false);
      this._setLiveMuted(true);
      this._gridRotationStart = Math.max(
        0,
        Number(this._gridRotationStart) || 0,
      );
      this._gridAlertController.startSession();
      this._gridLastRenderSignature = "";
      this._gridResumePending = false;
      startGridTimers = true;
    }
    const viewModeChanged = this._viewMode !== nextMode;
    this._viewMode = nextMode;
    const restoredLiveAfterGrid = leavingGrid
      ? this._gridPageController.restoreLiveAfterGrid()
      : false;
    const adoptedGridLive = gridLiveHandoff
      ? this._adoptLiveAttemptResult(this._$("#engine"), gridLiveHandoff)
      : false;
    if (gridLiveHandoff && !adoptedGridLive) {
      cleanupStaleWinnerResult(gridLiveHandoff);
    }
    if (leavingGrid && isCameraGroup(this._activeCam)) {
      for (const key of ["events", "reviews", "recordings"]) {
        this._browseWindowLoaderController?.publishActiveGroupCombined?.(key, {
          render: false,
        });
      }
    }
    if (viewModeChanged) this._liveViewResizeController?.reset();
    const engWrap = this._$("#eng-wrap");

    if (engWrap) engWrap.style.display = "";

    this._eventsMode = "camera";
    if (leavingGrid && restoredLiveAfterGrid && !adoptedGridLive) {
      this._scheduleResumeLive("grid-mode-exit");
    } else if (!adoptedGridLive) {
      this._mountEngine();
    }
    this._syncTabsShell();
    this._renderAll();
    if (leavingGrid && isCameraGroup(this._activeCam)) {
      this._cameraGroupLiveController?.sync?.({ force: true });
    }
    this._applyBrowse();
    this.shadowRoot
      .querySelectorAll("[data-viewmode]")
      .forEach((p) =>
        p.classList.toggle("active", p.dataset.viewmode === nextMode),
      );
    if (startGridTimers) {
      // Startup can select Grid before every page shell has settled. Re-run the
      // idempotent grid mount against the final shell on the next task.
      this._scheduleGridRefresh(0);
      this._scheduleGridRotation();
      this._gridAlertController.scheduleAlertWatch(300);
      if (this._tab === "alerts" || this._tab === "kept") {
        void (async () => {
          await this._loadGridMixedTabData(this._tab);
          if (this._viewMode !== "grid") return;
          if (this._tab !== "alerts" && this._tab !== "kept") return;
          this._renderList();
        })();
      }
    }
    this._syncSnapshotRefreshTimer();
    this._syncToolbarButtons();
  }

  _isSlideshowRotationAvailable() {
    return (
      this._config?.slideshow_rotation_enabled === true &&
      !DEVICE_PROFILE.isPhone &&
      !this._isMobilePhoneViewport() &&
      Array.isArray(this._config?.cameras) &&
      flattenCameraMembers(this._config.cameras).length > 1
    );
  }

  _isMobilePhoneViewport() {
    return this._viewportContextController.isMobilePhoneViewport();
  }

  _slideshowRotationMs() {
    const seconds = Number(this._config?.slideshow_rotation_seconds);
    return SLIDESHOW_ROTATION_OPTIONS_SECONDS.includes(seconds)
      ? seconds * 1000
      : 30000;
  }

  _slideshowButtonIcon() {
    return this._slideshowActive
      ? ICONS.presentationPlayActive
      : ICONS.presentationPlay;
  }

  _gridButtonIcon() {
    return ICONS.grid;
  }

  _clearSlideshowCountdownOverlay() {
    this._slideshowNextSwitchAtMs = 0;
    if (this._slideshowCountdownT) clearInterval(this._slideshowCountdownT);
    this._slideshowCountdownT = null;
    const chip = this._$("#slideshow-next-chip");
    if (!chip) return;
    chip.hidden = true;
    chip.textContent = "Next Slide: 0s";
  }

  _syncSlideshowCountdownOverlay() {
    const chip = this._$("#slideshow-next-chip");
    if (!chip) return;
    const show =
      this._slideshowActive &&
      this._viewMode === "single" &&
      this._isSlideshowRotationAvailable() &&
      !this._slideshowPopupPaused;
    if (!show) {
      chip.hidden = true;
      return;
    }
    const remainingMs = Math.max(
      0,
      Number(this._slideshowNextSwitchAtMs || 0) - Date.now(),
    );
    const remainingSec = Math.max(0, Math.ceil(remainingMs / 1000));
    chip.textContent = `Next Slide: ${remainingSec}s`;
    chip.hidden = false;
  }

  _setSlideshowCountdown(waitMs) {
    this._slideshowNextSwitchAtMs =
      Date.now() + Math.max(0, Number(waitMs) || 0);
    if (this._slideshowCountdownT) clearInterval(this._slideshowCountdownT);
    this._syncSlideshowCountdownOverlay();
    this._slideshowCountdownT = setInterval(() => {
      this._syncSlideshowCountdownOverlay();
    }, 250);
  }

  _isControlsButtonVisible() {
    return (
      (!this._activeGroupMemberOverride ||
        this._activeGroupMemberOverride === this._activeCam?.entity) &&
      hasCameraPtz(this._activeCam)
    );
  }

  _toolbarButtonStates() {
    const wideAlertTakeoverActive =
      this._wideViewPageController.isWideViewPageActive() &&
      this._wideViewPageController.companionAlertTakeoverEnabled();
    const cardViewActive = this._isCardViewPageActive();
    const cardViewPtzActive =
      cardViewActive && this._cardViewPageController.isPtzActive();
    const cardViewAlertTakeoverActive =
      cardViewActive &&
      this._cardViewPageController.alertTakeoverEnabled();
    return resolveToolbarModeButtonStates({
      controlsVisible: this._isControlsButtonVisible(),
      controlsActive: this._tab === "controls" || cardViewPtzActive,
      gridActive: this._viewMode === "grid",
      slideshowActive: this._slideshowActive === true,
      wideAlertTakeoverActive:
        wideAlertTakeoverActive || cardViewAlertTakeoverActive,
      twoWayTalkActive:
        this._twoWayTalkStarting === true || !!this._twoWayTalkSession,
    });
  }

  _syncToolbarButtons() {
    const buttonStates = this._toolbarButtonStates();
    const toolsRegion = this._pageShellRegion("tools");
    if (
      toolsRegion &&
      this._activePageShellCapabilities().tabsVariant !== "none"
    ) {
      const shouldShowGrid = this._isGridModeAvailable();
      const shouldShowSlideshow = this._isSlideshowRotationAvailable();
      const shouldShowWideAlertTakeover =
        this._wideViewPageController.isWideViewPageActive();
      const controlsBtnPresent = !!this._pageShellRegionElement("tools", "#controls-btn");
      const gridBtnPresent = !!this._pageShellRegionElement("tools", "#grid-btn");
      const slideshowBtnPresent = !!this._pageShellRegionElement("tools", "#slideshow-btn");
      const wideAlertTakeoverBtnPresent = !!this._pageShellRegionElement(
        "tools",
        "#wide-alert-takeover-btn",
      );
      const needsToolsRerender =
        (buttonStates.controlsVisible && !controlsBtnPresent) ||
        (shouldShowGrid && !gridBtnPresent) ||
        (shouldShowSlideshow && !slideshowBtnPresent) ||
        (shouldShowWideAlertTakeover && !wideAlertTakeoverBtnPresent);
      if (needsToolsRerender) {
        this._syncTabsShell();
      }
    }
    const gridBtn = this._pageShellRegionElement("tools", "#grid-btn");
    if (gridBtn) {
      const gridAvailable = this._isGridModeAvailable();
      const gridActive = this._viewMode === "grid";
      gridBtn.hidden = !gridAvailable;
      gridBtn.style.display = gridAvailable ? "" : "none";
      gridBtn.disabled = buttonStates.gridDisabled;
      gridBtn.classList.toggle("active", gridAvailable && gridActive);
      gridBtn.setAttribute(
        "aria-pressed",
        gridAvailable && gridActive ? "true" : "false",
      );
      gridBtn.setAttribute(
        "title",
        gridActive ? "Stop grid mode" : "Start grid mode",
      );
      gridBtn.setAttribute(
        "aria-label",
        gridActive ? "Stop grid mode" : "Start grid mode",
      );
      gridBtn.innerHTML = this._gridButtonIcon();
      if (!gridAvailable && this._viewMode === "grid") {
        this._stopGridModeState();
        if (this._viewMode === "grid") {
          this._setViewMode("single");
        }
      }
    }

    const wideAlertTakeoverBtn = this._pageShellRegionElement(
      "tools",
      "#wide-alert-takeover-btn",
    );
    if (wideAlertTakeoverBtn) {
      const active =
        this._wideViewPageController.companionAlertTakeoverEnabled();
      const label = active
        ? "Disable Alert Camera Takeover"
        : "Enable Alert Camera Takeover";
      wideAlertTakeoverBtn.classList.toggle("active", active);
      wideAlertTakeoverBtn.disabled =
        buttonStates.wideAlertTakeoverDisabled;
      wideAlertTakeoverBtn.setAttribute(
        "aria-pressed",
        active ? "true" : "false",
      );
      wideAlertTakeoverBtn.setAttribute("title", label);
      wideAlertTakeoverBtn.setAttribute("aria-label", label);
      wideAlertTakeoverBtn.innerHTML = ICONS.alerts;
    }

    const slideshowBtn = this._pageShellRegionElement("tools", "#slideshow-btn");
    if (slideshowBtn) {
      const available = this._isSlideshowRotationAvailable();
      slideshowBtn.hidden = !available;
      slideshowBtn.style.display = available ? "" : "none";
      slideshowBtn.disabled = buttonStates.slideshowDisabled;
      slideshowBtn.classList.toggle(
        "active",
        this._slideshowActive && available,
      );
      slideshowBtn.setAttribute(
        "aria-pressed",
        this._slideshowActive && available ? "true" : "false",
      );
      slideshowBtn.setAttribute(
        "title",
        this._slideshowActive
          ? "Stop slideshow rotation"
          : "Start slideshow rotation",
      );
      slideshowBtn.setAttribute(
        "aria-label",
        this._slideshowActive
          ? "Stop slideshow rotation"
          : "Start slideshow rotation",
      );
      slideshowBtn.innerHTML = this._slideshowButtonIcon();
      if (!available) this._stopSlideshowRotation("unavailable", false);
    }

    const controlsBtn = this._pageShellRegionElement("tools", "#controls-btn");
    if (controlsBtn) {
      controlsBtn.hidden = !buttonStates.controlsVisible;
      controlsBtn.style.display = buttonStates.controlsVisible ? "" : "none";
      controlsBtn.disabled = buttonStates.controlsDisabled;
      const controlsActive = this._tab === "controls";
      controlsBtn.classList.toggle("active", controlsActive);
      controlsBtn.setAttribute(
        "aria-pressed",
        controlsActive ? "true" : "false",
      );
    }

    const filterBtn = this._pageShellRegionElement("tools", "#filter-btn");
    if (filterBtn) {
      const filterPanel = this._pageShellRegion("filterPanel");
      const filterOpen = !!filterPanel && filterPanel.style.display !== "none";
      filterBtn.disabled = buttonStates.filterDisabled;
      filterBtn.classList.toggle("active", filterOpen);
      filterBtn.setAttribute("aria-pressed", filterOpen ? "true" : "false");
    }

    const calBtn = this._pageShellRegionElement("tools", "#cal-btn");
    if (calBtn) {
      const calPanel = this._pageShellRegion("calendarPanel");
      const calOpen = !!calPanel && calPanel.style.display !== "none";
      calBtn.disabled = buttonStates.calendarDisabled;
      calBtn.classList.toggle("active", calOpen);
      calBtn.setAttribute("aria-pressed", calOpen ? "true" : "false");
    }

    if (!buttonStates.controlsVisible && this._tab === "controls") {
      this._setTab(this._resolveControlsReturnTab());
    }
    if (this._isCardViewPageActive()) {
      this._cardViewPageController.renderToolbar(buttonStates);
    }
    this._pageNavigationController.syncToolbarDivider();
  }

  _syncPlaybackTargetButtons() {
    const support = this._playbackTargetController?.getSupport?.() || {
      airplay: false,
    };
    const sync = (selector, supported, fallbackTitle) => {
      this.shadowRoot.querySelectorAll(selector).forEach((button) => {
        const baseTitle =
          button.dataset.playbackBaseTitle || button.title || fallbackTitle;
        button.dataset.playbackBaseTitle = baseTitle;
        button.hidden = !supported;
        button.disabled = !supported;
        button.setAttribute("aria-hidden", supported ? "false" : "true");
        button.title = baseTitle;
      });
    };
    sync(
      "#popup-airplay-btn, #popup-media-airplay, #popup-mobile-airplay-btn",
      support.airplay,
      "AirPlay video",
    );
  }

  _stopSlideshowRotation(reason = "manual-stop", sync = true) {
    this._slideshowPageController.stopRotation(reason, sync);
  }

  _startSlideshowRotation(source = "manual") {
    return this._slideshowPageController.startRotation(source);
  }

  _pauseSlideshowForPopup() {
    this._slideshowPageController.pauseForPopup();
  }

  _resumeSlideshowAfterPopup() {
    this._slideshowPageController.resumeAfterPopup();
  }

  _toggleSlideshowRotation() {
    this._slideshowPageController.toggleRotation();
  }

  _pauseSlideshowForInteraction() {
    this._slideshowPageController.pauseForInteraction();
  }

  _scheduleSlideshowRotation(_reason = "") {
    this._slideshowPageController.scheduleRotation(_reason);
  }

  _setSlideshowAlertState(type = "") {
    this._slideshowAttentionType =
      type === "alert" || type === "detection" ? type : "";
    const engWrap = this._$("#eng-wrap");
    if (!engWrap) return;
    engWrap.classList.toggle(
      "slideshow-alert",
      this._slideshowAttentionType === "alert",
    );
    engWrap.classList.toggle(
      "slideshow-detection",
      this._slideshowAttentionType === "detection",
    );
  }

  _slideshowReviewModeForCamera(entity) {
    return slideshowReviewModeForCamera(this._config, entity);
  }

  _shouldHandleSlideshowReview(entity, severity) {
    return shouldHandleSlideshowReview(this._config, entity, severity);
  }

  _cameraIndexForIncomingCamera(cameraId) {
    return cameraIndexForIncomingCamera(this._config, this._camCache, cameraId);
  }

  _cameraEntityForIncomingCamera(cameraId) {
    return cameraEntityForIncomingCamera(
      this._config,
      this._camCache,
      cameraId,
    );
  }

  _normalizeReviewSeverity(review) {
    return normalizeReviewSeverity(review);
  }

  _reviewStartTimeSec(review) {
    return reviewStartTimeSec(review);
  }

  _handleSlideshowReviewsUpdated(entity, reviews, source = "reviews-update") {
    this._slideshowAlertController.handleReviewsUpdated(
      entity,
      reviews,
      source,
    );
  }

  async _probeLatestSlideshowReview() {
    await this._slideshowAlertController.probeLatestReview();
  }

  _scheduleSlideshowReviewProbe(delayMs = 180) {
    this._slideshowAlertController.scheduleReviewProbe(delayMs);
  }

  _scheduleSlideshowReviewWatch(delayMs = null) {
    this._slideshowAlertController.scheduleReviewWatch(delayMs);
  }

  async _advanceSlideshowRotation() {
    await this._slideshowPageController.advanceRotation();
  }

  _cameraIndexByEntity(entity) {
    return cameraIndexByEntity(this._config, entity);
  }

  _extractRealtimeMessageCamera(msg) {
    return extractRealtimeMessageCamera(msg);
  }

  _extractRealtimeMessageSeverity(msg) {
    return extractRealtimeMessageSeverity(msg);
  }

  _applyHaReviewStatusAlerts() {
    let hasActiveAlert = false;
    const activeEntity = String(this._activeCam?.entity || "").trim();
    const activeMemberEntities = new Set(cameraMemberEntities(this._activeCam));
    let activeCameraAlerted = false;
    let gridChanged = false;
    let firstAlertEntity = "";
    let firstAlertSeverity = "";
    let firstChangedAlertEntity = "";
    let activeAlertEntity = "";
    let activeAlertSeverity = "";
    for (const camera of flattenCameraMembers(this._config?.cameras)) {
      const entity = String(camera?.entity || "").trim();
      if (!entity) continue;
      const status = haReviewStatusForCamera({
        entity,
        discoveredCameraName: this._camCache?.[entity]?.cam,
        hass: this._hass,
      });
      const severity = haReviewStatusSeverity(status);
      if (!severity) continue;
      if (!this._shouldHandleSlideshowReview(entity, severity)) continue;
      if (!firstAlertEntity) {
        firstAlertEntity = entity;
        firstAlertSeverity = severity;
      }
      hasActiveAlert = true;
      if (activeMemberEntities.has(entity)) {
        activeCameraAlerted = true;
        if (!activeAlertEntity) {
          activeAlertEntity = entity;
          activeAlertSeverity = severity;
        }
      }
      const changed = this._gridAlertController.markAlertCamera(
        entity,
        severity,
      );
      if (changed && !firstChangedAlertEntity) {
        firstChangedAlertEntity = entity;
      }
      gridChanged = changed || gridChanged;
      this._previewAlertController.markAlertCamera(
        entity,
        severity,
        this._previewAlertHoldMs(),
      );
      this._wideViewPageController?.handleCompanionHaReviewStatus?.(
        entity,
        severity,
      );
      this._cardViewPageController?.handleHaReviewStatus?.(entity, severity);
    }

    const slideshowAlertEntity = activeCameraAlerted
      ? activeAlertEntity || activeEntity
      : firstAlertEntity;
    const slideshowAlertSeverity = activeCameraAlerted
      ? activeAlertSeverity
      : firstAlertSeverity;
    if (slideshowAlertEntity) {
      this._slideshowAlertController.handleHaStatusCandidate(
        slideshowAlertEntity,
        slideshowAlertSeverity || "alert",
      );
    }

    const gridAlertEntity =
      firstChangedAlertEntity ||
      (activeCameraAlerted
        ? activeAlertEntity || activeEntity
        : firstAlertEntity);
    let gridFocused = false;
    if (this._viewMode === "grid" && gridAlertEntity) {
      gridFocused = this._focusGridPageForCamera(gridAlertEntity) === true;
    }
    if ((gridChanged || gridFocused) && this._viewMode === "grid") {
      this._scheduleGridRefresh(90);
    }
    if (
      activeCameraAlerted &&
      this._viewMode !== "grid" &&
      !this._isPreviewPageActive()
    ) {
      this._scheduleResumeLive("ha-review-status-alert");
    }
    this._cameraGroupLiveController?.syncAlertState?.();
    return hasActiveAlert;
  }

  _handleSlideshowRealtimeMessage(msg) {
    this._slideshowAlertController.handleRealtimeMessage(msg);
  }

  // ── camera switching ──────────────────────────────────────
  async _switchCamera(idx, opts = {}) {
    void this._stopPtzMotion("camera-switch");
    const wasGridMode = this._viewMode === "grid";
    const previousMemberOverride = this._activeGroupMemberOverride;
    const nextMemberOverride = String(opts?.groupMemberEntity || "").trim();
    const previousCamera = this._activeCam;
    const previousTransportEntity = resolveCameraSwitchTransportEntity({
      cameraEntity: previousCamera?.entity,
      memberOverride: previousMemberOverride,
    });
    if (
      idx !== this._activeCamIdx ||
      previousMemberOverride !== nextMemberOverride
    ) {
      this._cameraGroupLiveController?.setActiveAudioMember?.("A");
      void this._stopTwoWayTalkSession({ restoreLive: false });
      this._liveViewResizeController?.reset();
      this._liveViewResizeController?.attachMedia(null);
      this._cameraGroupLiveController?.teardown?.();
    }
    this._activeGroupMemberOverride = nextMemberOverride;
    this._mobileCamSwitcherOpen = false;
    const source = String(opts?.source || "manual");
    if (source === "manual") {
      if (this._slideshowActive) {
        this._stopSlideshowRotation("manual-camera-select");
      } else {
        this._pauseSlideshowForInteraction();
      }
    }
    if (this._viewMode === "grid") {
      if (this._gridRotationT) clearTimeout(this._gridRotationT);
      this._gridRotationT = null;
      this._gridAlertController.clearWatchTimer();
      if (opts?.keepGridResume !== true) {
        this._gridResumePending = false;
        if (this._gridAlertReturnT) clearTimeout(this._gridAlertReturnT);
        this._gridAlertReturnT = null;
        this._setSlideshowAlertState("");
      }
    }
    const popupOpen = this._$("#myPopup")?.classList.contains("is-open");
    if (
      idx === this._activeCamIdx &&
      previousMemberOverride === nextMemberOverride &&
      this._viewMode === "single" &&
      !popupOpen
    )
      return;

    const useTransition = source === "slideshow" || source === "alert";
    const engWrap = this._$("#eng-wrap");
    if (useTransition && engWrap) {
      engWrap.classList.add("slideshow-switching");
      clearTimeout(this._slideshowFadeT);
      this._slideshowFadeT = setTimeout(() => {
        engWrap.classList.remove("slideshow-switching");
        this._slideshowFadeT = null;
      }, 260);
    }

    const prevEnt = previousCamera?.entity;
    if (
      prevEnt &&
      this._camCache[prevEnt] &&
      !isCameraGroup(previousCamera)
    ) {
      this._camCache[prevEnt].events = this._events;
      this._camCache[prevEnt].recordings = this._recordings;
      this._camCache[prevEnt].reviews = this._reviews;
      this._camCache[prevEnt].kept = this._kept;
    }
    this._activeCamIdx = idx;
    const newEnt = this._activeCam?.entity;
    this._activeCameraAvailability = resolveCameraAvailabilitySnapshot({
      entity: newEnt,
      state: this._hass?.states?.[newEnt],
    }).current;
    if (!this._camCache[newEnt]) this._camCache[newEnt] = mkCamState();
    if (!this._camCache[newEnt].discovered) this._discoverOne(newEnt);
    const cached = this._camCache[newEnt];
    this._events = cached.events || [];
    this._recordings = cached.recordings || [];
    this._reviews = cached.reviews || [];
    this._kept = cached.kept || [];
    if (isCameraGroup(this._activeCam)) {
      this._browseWindowLoaderController?.publishActiveGroupCombined?.(
        "events",
        { render: false },
      );
      this._browseWindowLoaderController?.publishActiveGroupCombined?.(
        "reviews",
        { render: false },
      );
      this._browseWindowLoaderController?.publishActiveGroupCombined?.(
        "recordings",
        { render: false },
      );
    }
    // Camera button should always return to single live view.
    if (wasGridMode) this._stopGridModeState();
    this._viewMode = "single";
    if (wasGridMode) this._gridPageController.restoreLiveAfterGrid();
    if (popupOpen) this._popupLifecycleController.close();
    if (engWrap) engWrap.style.display = "";
    this.shadowRoot
      .querySelectorAll("[data-viewmode]")
      .forEach((p) =>
        p.classList.toggle("active", p.dataset.viewmode === "single"),
      );
    void this._browseWindowLoaderController.loadWindow(true, {
      supersede: true,
      reuseRecentCache: true,
    });
    this._syncTabsShell();
    this._renderCamSwitcher();
    this._syncStatus();
    this._renderSubtitle();
    this._renderStats();
    this._browseFilterController.normalizeFilterSelections();
    if (this._pageShellRegion("filterPanel")?.style.display !== "none") {
      this._renderFilter();
    }
    this._renderList();
    this._streamMuted = true;
    this._renderMuteButton();
    this._cancelPendingMount(
      "switch-camera",
      resolveCameraSwitchCleanupOptions({
        previousEntity: previousTransportEntity,
        mountInProgress: this._mountInProgress,
      }),
    );
    this._mountEngine();
    clearTimeout(this._switchLoadT);
    this._applyCalendarActivityCacheForActiveCamera();
    void this._prefetchCalendarActivityForActiveCamera();
    if (this._pageShellRegion("calendarPanel")?.style.display !== "none") {
      this._renderCal();
    }
    this._syncTwoWayTalkButton();
    this._linkedLightController?.sync?.();
    this._syncToolbarButtons();
    void this._cardViewPageController?.handleCameraChanged?.();
  }
  // ── data ─────────────────────────────────────────────────
  _cc() {
    return this._camCache[this._activeCam?.entity] || mkCamState();
  }
  async _ws(p) {
    return parseWs(await this._hass.callWS(p));
  }
  _isNowWindow() {
    return this._followNowWindow;
  }

  async _loadKept() {
    await this._browseTabDataController.loadKept();
  }
  async _loadReviews() {
    await this._browseTabDataController.loadReviews();
  }
  async _loadCalendar() {
    await this._browseCalendarActivityController.loadCalendar();
  }
  _calendarActivityCacheKey(clientId, cam, tz = this._tz()) {
    return this._browseCalendarActivityController.calendarActivityCacheKey(
      clientId,
      cam,
      tz,
    );
  }
  _applyCalendarActivityCacheForActiveCamera() {
    this._browseCalendarActivityController.applyCalendarActivityCacheForActiveCamera();
  }
  async _prefetchCalendarActivityForActiveCamera() {
    await this._browseCalendarActivityController.prefetchCalendarActivityForActiveCamera();
  }
  _tz() {
    const configuredTimeZone = this._hass?.config?.time_zone;
    if (configuredTimeZone) return configuredTimeZone;
    if (!this._resolvedBrowserTimeZone) {
      this._resolvedBrowserTimeZone =
        Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
    }
    return this._resolvedBrowserTimeZone;
  }
  _dateFormatter(name, locales, options, timeZone = this._tz()) {
    const resolvedTimeZone = String(timeZone || "UTC");
    return this._dateFormatterCache.get(
      `${name}|${resolvedTimeZone}`,
      locales,
      { ...options, timeZone: resolvedTimeZone },
    );
  }
  _tzOffsetMinutesAt(epochMs, tz = this._tz()) {
    const dtf = this._dateFormatter(
      "wall-clock",
      "en-US",
      {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hourCycle: "h23",
      },
      tz,
    );
    const parts = dtf.formatToParts(new Date(epochMs));
    const pick = (type) =>
      Number(parts.find((p) => p.type === type)?.value || 0);
    const y = pick("year");
    const m = pick("month");
    const d = pick("day");
    const hh = pick("hour");
    const mm = pick("minute");
    const ss = pick("second");
    const asUtcMs = Date.UTC(y, m - 1, d, hh, mm, ss);
    return (asUtcMs - epochMs) / 60000;
  }
  _tzDateTimeToEpochSeconds(y, mo, d, hh = 0, mm = 0, ss = 0) {
    // Convert a wall-clock datetime in HA timezone to Unix seconds.
    let epochMs = Date.UTC(y, mo - 1, d, hh, mm, ss);
    for (let i = 0; i < 3; i++) {
      const offMin = this._tzOffsetMinutesAt(epochMs);
      epochMs = Date.UTC(y, mo - 1, d, hh, mm, ss) - offMin * 60000;
    }
    return Math.floor(epochMs / 1000);
  }
  _tzParts(tsSec) {
    const dtf = this._dateFormatter("wall-clock", "en-US", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hourCycle: "h23",
    });
    const parts = dtf.formatToParts(new Date(tsSec * 1000));
    const pick = (type) =>
      Number(parts.find((p) => p.type === type)?.value || 0);
    return {
      year: pick("year"),
      month: pick("month"),
      day: pick("day"),
      hour: pick("hour"),
      minute: pick("minute"),
      second: pick("second"),
    };
  }
  async _subscribe() {
    if (!this._hass?.connection) return;
    const clientIds = new Set();
    for (const camera of flattenCameraMembers(this._config?.cameras)) {
      const entity = camera?.entity;
      if (!entity) continue;
      const discoveredId = String(
        this._camCache[entity]?.clientId || "",
      ).trim();
      if (discoveredId) clientIds.add(discoveredId);
    }
    const activeClientId = String(this._cc()?.clientId || "").trim();
    if (activeClientId) clientIds.add(activeClientId);
    if (!clientIds.size) return;

    const onRealtimeMessage = (msg) => {
      this._handleGridRealtimeMessage(msg);
      this._previewAlertController.handleRealtimeMessage(msg);
      this._wideViewPageController?.handleCompanionRealtimeMessage?.(msg);
      this._cardViewPageController?.handleRealtimeMessage?.(msg);
      this._handleSlideshowRealtimeMessage(msg);
      this._cameraGroupLiveController?.syncAlertState?.();
      if (!this._isNowWindow()) return;
      if (!this._isRealtimeEventMessage(msg)) return;
      this._scheduleReload(REALTIME_RELOAD_DEBOUNCE_MS);
    };

    try {
      const subscriptions = [...clientIds].map((clientId) =>
        this._hass.connection.subscribeMessage(onRealtimeMessage, {
          type: "frigate/events/subscribe",
          instance_id: clientId,
        }),
      );
      this._unsub = Promise.allSettled(subscriptions).then((results) => {
        const unsubscribers = results
          .filter((result) => result.status === "fulfilled")
          .map((result) => result.value)
          .filter((value) => typeof value === "function");
        return () => {
          for (const unsubscribe of unsubscribers) {
            try {
              unsubscribe();
            } catch (_) {}
          }
        };
      });
    } catch (_) {}
  }

  async _pollLatestEventHead() {
    if (!this._isNowWindow()) return;
    if (this._loading) return;
    const now = Math.floor(Date.now() / 1000);
    try {
      const changed =
        await this._browseWindowLoaderController?.activeCameraEventHeadsChanged?.(
          now,
        );
      if (changed === true) {
        this._scheduleReload(REALTIME_RELOAD_DEBOUNCE_MS);
      }
    } catch (_) {}
  }

  _isRealtimeEventMessage(msg) {
    if (!msg || typeof msg !== "object") return false;
    const type = String(msg.type || "").toLowerCase();
    if (!type) return false;
    if (
      type !== "end" &&
      !type.includes("event") &&
      !type.includes("review") &&
      !type.includes("detection") &&
      type !== "new" &&
      type !== "update"
    ) {
      return false;
    }
    if (this._eventsMode === "all") return true;
    const activeCameras = new Set(
      cameraMemberEntities(this._activeCam)
        .map((entity) => String(this._camCache?.[entity]?.cam || ""))
        .filter(Boolean),
    );
    const activeCamera = String(this._cc?.()?.cam || "");
    if (activeCamera) activeCameras.add(activeCamera);
    const messageCam =
      msg.camera ||
      msg?.event?.camera ||
      msg?.review?.camera ||
      msg?.after?.camera ||
      msg?.before?.camera;
    if (!messageCam) return true;
    return activeCameras.has(String(messageCam));
  }

  _scheduleReload(delayMs = 1500) {
    if (this._isPreviewPageActive()) return;
    this._reloadPending = true;
    clearTimeout(this._rt);
    this._rt = setTimeout(
      () => {
        if (!this._reloadPending) return;
        if (this._loading) {
          this._reloadAfterLoad = true;
          return;
        }
        this._reloadPending = false;
        this._browseWindowLoaderController.loadWindow(true);
      },
      Math.max(0, Number(delayMs) || 0),
    );
  }

  _buildTabsMarkup() {
    const filterPanel = this._pageShellRegion("filterPanel");
    const calendarPanel = this._pageShellRegion("calendarPanel");
    const filterPanelOpen =
      !!filterPanel && filterPanel.style.display !== "none";
    const calendarPanelOpen =
      !!calendarPanel && calendarPanel.style.display !== "none";
    const buttonStates = this._toolbarButtonStates();
    const shellProfile = this._activePageShellLayoutProfile();
    const tabsButtonClass =
      String(shellProfile?.tabsButtonClass || "").trim() || "circle-btn";
    const toolsButtonClass =
      String(shellProfile?.toolsButtonClass || "").trim() || "tool";

    // Build tabs only
    const { activeTab, markup: tabsMarkup } = buildTabsMarkup({
      tab: this._tab,
      hiddenTabs: this._config.hidden_tabs,
      viewMode: this._viewMode,
      icons: ICONS,
      buttonClass: tabsButtonClass,
    });

    // Build tools only
    const toolsMarkup = buildToolsMarkup({
      tab: activeTab,
      viewMode: this._viewMode,
      icons: ICONS,
      buttonClass: toolsButtonClass,
      isFilterPanelOpen: filterPanelOpen,
      isCalendarPanelOpen: calendarPanelOpen,
      isGridModeAvailable: this._isGridModeAvailable(),
      isSlideshowRotationAvailable: this._isSlideshowRotationAvailable(),
      isSlideshowActive: this._slideshowActive,
      isControlsVisible: buttonStates.controlsVisible,
      controlsDisabled: buttonStates.controlsDisabled,
      gridDisabled: buttonStates.gridDisabled,
      slideshowDisabled: buttonStates.slideshowDisabled,
      wideAlertTakeoverDisabled:
        buttonStates.wideAlertTakeoverDisabled,
      filterDisabled: buttonStates.filterDisabled,
      calendarDisabled: buttonStates.calendarDisabled,
      gridButtonIcon: this._gridButtonIcon(),
      slideshowButtonIcon: this._slideshowButtonIcon(),
      showWideAlertTakeover:
        this._wideViewPageController.isWideViewPageActive(),
      wideAlertTakeoverEnabled:
        this._wideViewPageController.companionAlertTakeoverEnabled(),
      wideAlertTakeoverButtonIcon: ICONS.alerts,
    });

    this._tab = activeTab;
    this._tabsMarkupCache = tabsMarkup;
    this._toolsMarkupCache = toolsMarkup;
    return tabsMarkup; // Return only tabs for backward compatibility
  }

  _getToolsMarkup() {
    return this._toolsMarkupCache || "";
  }

  _syncTabsShell() {
    const tabs = this._pageShellRegion("tabs");
    const toolsSlot = this._pageShellRegion("tools");
    if (!tabs && !toolsSlot) return;

    if (this._activePageShellCapabilities().tabsVariant === "none") {
      if (tabs) tabs.innerHTML = "";
      if (toolsSlot) toolsSlot.innerHTML = "";
      return;
    }

    const prevTab = this._tab;
    const tabsMarkup = this._buildTabsMarkup();
    if (tabs) tabs.innerHTML = tabsMarkup;
    if (toolsSlot) toolsSlot.innerHTML = this._getToolsMarkup();
    this._pageNavigationController.syncToolbarDivider();
    if (this._tab !== prevTab) {
      void this._loadTabData(this._tab);
    }
  }

  async _loadTabData(tab) {
    await this._browseTabDataController.loadTabData(tab);
  }

  _isGridMixedListMode() {
    return this._viewMode === "grid";
  }

  _allGridReviews() {
    return this._browseCollectionController.allGridReviews();
  }

  _allGridKeptEvents() {
    return this._browseCollectionController.allGridKeptEvents();
  }

  _findReviewById(id) {
    return this._browseCollectionController.findReviewById(id);
  }

  async _loadGridMixedTabData(tab, options = {}) {
    await this._browseCollectionController.loadGridMixedTabData(tab, options);
  }

  // =======================Render Shell===================================
  _syncFooterLogo() {
    const logoMarkup =
      this._config?.display_logo !== false ? ICONS.frigateView : "";
    this.shadowRoot
      ?.querySelectorAll?.("#card .frigate-view")
      ?.forEach((element) => {
        if (element.innerHTML === logoMarkup) return;
        element.innerHTML = logoMarkup;
      });
  }

  _allGridEvents() {
    return this._browseCollectionController.allGridEvents();
  }

  _renderShell() {
    const title = this._titleText();
    const subtitle = this._subtitleText();
    const displayTitle = this._config.display_title !== false;
    const displaySubtitle = this._config.display_subtitle !== false;
    const showCamSwitcher =
      this._config.cameras.length > 1 ||
      this._isPreviewPageEnabled() ||
      this._isCardViewPageActive();
    const camSwitcherMarkup = showCamSwitcher
      ? this._camSwitcherMarkup({ includeStatus: false })
      : "";
    const pageNav = this._pageNavigationController.pageNavMarkup();
    const shellProfile = this._activePageShellLayoutProfile();
    const shellCapabilities = resolvePageCapabilities(shellProfile);
    const isWideViewPage = this._pageId === PAGE_IDS.wideView;
    const displayLogo = this._config.display_logo !== false;
    const infoRow = resolvePageInfoRowMarkup(shellProfile, {
      title,
      subtitle,
      displayTitle,
      displaySubtitle,
      version: VERSION,
      host: this,
      buildDefaultInfoRowMarkup: ({
        title,
        subtitle,
        displayTitle,
        displaySubtitle,
        version,
      }) =>
        buildInfoRowMarkup({
          title,
          subtitle,
          displayTitle,
          displaySubtitle,
          version,
        }),
    });
    const layoutProfile = shellProfile || {};
    const tabsMarkup = this._buildTabsMarkup();
    const toolsMarkup = this._getToolsMarkup();
    const regions = {
      live: buildLiveEngineWrapMarkup({ icons: ICONS }),
      livePictureInPicture: shellCapabilities.hasLivePictureInPicture
        ? buildLivePictureInPictureControlMarkup({
            icons: ICONS,
            buttonClass: shellProfile?.livePictureInPictureButtonClass,
          })
        : "",
      liveFullscreen: buildLiveFullscreenControlMarkup({
        icons: ICONS,
        buttonClass: shellProfile?.liveFullscreenButtonClass,
      }),
      liveTakeSnapshot: buildLiveTakeSnapshotControlMarkup({
        icons: ICONS,
        buttonClass: shellProfile?.liveTakeSnapshotButtonClass,
      }),
      liveMute: buildLiveMuteControlMarkup({
        icons: ICONS,
        streamMuted: this._streamMuted,
        buttonClass: shellProfile?.liveMuteButtonClass,
      }),
      information: infoRow,
      mobileBackButton: buildMobileViewBackButtonMarkup({
        previewPageEnabled:
          this._isPreviewPageEnabled() &&
          !(
            this._isCardViewPageActive() &&
            this._config?.card_view_standalone === true
          ),
        icons: ICONS,
      }),
      cameraSwitcherMarkup: camSwitcherMarkup,
      cameraSwitcher: buildCamSwitcherRegionMarkup({
        markup: camSwitcherMarkup,
      }),
      pageNavigation: pageNav,
      pageToolsDivider: ICONS.divider,
      tabs: buildTabsRegionMarkup({ markup: tabsMarkup }),
      tools: buildToolsRegionMarkup({ markup: toolsMarkup }),
      browseHeader: buildBrowseHeaderRegionMarkup({ icons: ICONS }),
      browse: buildBrowseRegionMarkup({ layoutProfile }),
      footer: buildFooterMarkup({
        icons: ICONS,
        includeFrigateView: !isWideViewPage,
        displayFrigateView: displayLogo,
        version: VERSION,
      }),
      wideFooterIcon:
        isWideViewPage && displayLogo ? ICONS.frigateView : "",
      companionCameras: isWideViewPage
        ? this._wideViewPageController.buildCompanionRegionMarkup()
        : "",
      timeline: isWideViewPage
        ? this._wideViewPageController.buildTimelineRegionMarkup()
        : "",
      cardViewToolbar: "",
      cardViewActivity: "",
      calendarPanel: "",
      footerLogo: displayLogo ? ICONS.frigateView : "",
      footerVersion: VERSION,
      drawerHandleIcon: ICONS.chevron,
      calendarIcon: ICONS.calendar,
      linkedEntities: this._buildLinkedLightControlMarkup({
        buttonClass: "icon-btn",
      }),
    };
    const mainLayoutShell = resolvePageMainLayoutShellMarkup(shellProfile, {
      host: this,
      regions,
      layoutProfile,
      buildDefaultMainLayoutShellMarkup: ({ regions, layoutProfile }) =>
        buildSingleViewMainLayoutShellMarkup({
          regions,
          layoutProfile,
        }),
    });
    const regionValidation = validatePageShellRegionMarkup(mainLayoutShell, {
      requiredRegions: resolveRequiredPageShellRegions(shellProfile),
    });
    if (!regionValidation.valid) {
      console.warn("[Frigate] Page shell region contract violation", {
        pageId: this._pageId,
        missing: regionValidation.missing,
        duplicates: regionValidation.duplicates,
      });
    }
    const popupShell = buildPopupShellMarkup({
      icons: ICONS,
      version: VERSION,
    });
    this._wideViewPageController.teardownCompanionMedia();
    if (this._preservingLiveShell !== true) {
      this._cameraGroupLiveController?.teardown?.();
    }
    this._wideViewPageController.teardownTimeline({ preserveScroll: true });
    this.shadowRoot.innerHTML = `<style>${STYLES}</style>
    <ha-card class="card ${this._cardStateClassNames()}" id="card" style="border-radius: var(--fvc-border-radius);">

        ${mainLayoutShell}
        <div class="toast" id="toast" style="display:none"></div>

          ${popupShell}
      </ha-card>
      `;
    this._domCache = {}; // invalidate DOM element cache after full re-render
    this._lastRenderedListHtml = "";
    this._popupLifecycleController.bindInteractions();
    this._applyBrowse();
    this._applyCardStyle();
    this._wideViewPageController.applyLayoutAndWideSyncForCard();
    this._syncBrowseHeadModeClass();
    this._bindListScroll();
    this._bindRecordingsSwipe();
    this._wideViewPageController.initResizeHandle();
    this._wideViewPageController.bindTimeline();
    this._liveViewResizeController?.bind();
    if (this._preservingLiveShell !== true) {
      this._cameraGroupLiveController?.sync?.();
    }
    this._initLiveOverlayControls();
    this._renderMuteButton();
    this._syncFullscreenButtonsVisibility();
    this._syncSlideshowCountdownOverlay();
    this._renderPreviewPage();
    this._wideViewPageController.renderCompanionCameras();
    this._applyPreviewShellVisibility();
    this._syncMobileViewPageMarkup();
    this._syncCardViewPageMarkup();
    if (this._isCardViewPageActive()) {
      this._cardViewPageController.bind();
      this._cardViewPageController.renderToolbar();
      this._cardViewPageController.renderActivity();
    }
    this._syncPictureInPictureButtons();
    this._linkedLightController?.sync?.();
    this._pageNavigationController.connectToolbarDivider();
    this._editorPreviewController.renderCardPickerDemo();
  }

  _renderShellPreserveLive() {
    const preservedEngWrap = this._$("#eng-wrap");
    if (!preservedEngWrap) {
      this._renderShell();
      return;
    }

    const parent = preservedEngWrap.parentNode;
    if (parent) {
      parent.removeChild(preservedEngWrap);
    }

    this._preservingLiveShell = true;
    try {
      this._renderShell();
    } finally {
      this._preservingLiveShell = false;
    }

    const nextEngWrap = this._$("#eng-wrap");
    if (!nextEngWrap) return;

    nextEngWrap.replaceWith(preservedEngWrap);
    this._domCache["#eng-wrap"] = preservedEngWrap;

    const preservedEngine = preservedEngWrap.querySelector("#engine");
    if (preservedEngine) {
      this._domCache["#engine"] = preservedEngine;
    }

    this._liveViewResizeController?.bind();
    this._cameraGroupLiveController?.sync?.();
    this._initLiveOverlayControls();
    this._renderMuteButton();
    this._syncFullscreenButtonsVisibility();
    this._syncPictureInPictureButtons();
    this._linkedLightController?.sync?.();
    this._cardStyleController.repaintHostOuterStylesAfterLayout();
  }

  _shouldRenderTwoWayTalkButtonForActiveCamera() {
    if (this._viewMode === "grid") return false;
    if (
      this._activeGroupMemberOverride &&
      this._activeGroupMemberOverride !== this._activeCam?.entity
    ) {
      return false;
    }
    return shouldRenderTwoWayTalkButton({
      camera: this._activeCam,
      pageId: normalizePageRoute(this._pageId),
      PAGE_IDS,
      activeStreamType: this._activeStreamType,
    });
  }

  _buildTwoWayTalkInfoButtonMarkup() {
    const pageId = normalizePageRoute(this._pageId);
    if (pageId !== PAGE_IDS.singleView && pageId !== PAGE_IDS.wideView) {
      return "";
    }
    return this._buildTwoWayTalkControlRowMarkup();
  }

  _buildTwoWayTalkMobileButtonMarkup() {
    if (normalizePageRoute(this._pageId) !== PAGE_IDS.mobileView) {
      return "";
    }
    const visible = this._shouldRenderTwoWayTalkButtonForActiveCamera();
    return `<div class="mobile-view-two-way-talk-slot" id="mobile-view-two-way-talk-slot" data-fvc-region="two-way-talk" ${visible ? "" : "hidden"}>${this._buildTwoWayTalkButtonMarkup()}</div>`;
  }

  _buildMobileViewMicrophoneMuteButtonMarkup() {
    if (normalizePageRoute(this._pageId) !== PAGE_IDS.mobileView) return "";
    return this._buildTwoWayTalkMicrophoneMuteButtonMarkup({
      buttonId: "mobile-view-microphone-mute-btn",
      extraClass: "mobile-view-microphone-mute-btn",
    });
  }

  _buildMobileViewInlineMuteButtonMarkup() {
    if (normalizePageRoute(this._pageId) !== PAGE_IDS.mobileView) return "";
    const muted = this._resolveLiveMuteControlMuted();
    const talkAudioActive =
      this._twoWayTalkActiveForCurrentCamera() && !muted;
    return buildLiveMuteControlMarkup({
      icons: ICONS,
      streamMuted: muted,
      buttonClass: "icon-btn",
      buttonId: "mobile-view-mute-btn",
      region: "",
      extraClass: `mobile-view-inline-mute-btn${talkAudioActive ? " talk-audio-active" : ""}`,
      pressed: !muted,
    });
  }

  _buildTwoWayTalkControlRowMarkup() {
    const active = this._twoWayTalkActiveForCurrentCamera();
    const muted = this._resolveLiveMuteControlMuted();
    const soundwaveEnabled =
      this._shouldRenderTwoWayTalkSoundwave?.() === true;
    const soundwaveActive = active && soundwaveEnabled;
    return `<div class="two-way-talk-control-row${active ? " has-inline-mute" : ""}${soundwaveActive ? " has-soundwave" : ""}">
      ${soundwaveEnabled ? buildTwoWayTalkSoundwaveMarkup({ active: soundwaveActive }) : ""}
      ${this._buildTwoWayTalkMicrophoneMuteButtonMarkup()}
      ${this._buildTwoWayTalkButtonMarkup()}
      ${buildLiveMuteControlMarkup({
        icons: ICONS,
        streamMuted: muted,
        buttonClass: "icon-btn",
        buttonId: "two-way-talk-mute-btn",
        region: "",
        extraClass: `two-way-talk-inline-mute-btn${active && !muted ? " talk-audio-active" : ""}`,
        pressed: !muted,
        hidden: !active,
      })}
    </div>`;
  }

  _buildTwoWayTalkMicrophoneMuteButtonMarkup({
    buttonId = "two-way-talk-microphone-mute-btn",
    extraClass = "",
  } = {}) {
    const active = this._twoWayTalkActiveForCurrentCamera();
    const microphoneMuted =
      this._twoWayTalkMicrophoneMutedForCurrentCamera();
    const label = microphoneMuted ? "Unmute microphone" : "Mute microphone";
    const microphoneActive = active && !microphoneMuted;
    const className = [
      "icon-btn",
      "mute-btn",
      "two-way-talk-microphone-mute-btn",
      extraClass,
      microphoneActive ? "talk-audio-active" : "",
      microphoneActive ? "active" : "",
    ]
      .filter(Boolean)
      .join(" ");
    return `<button class="${className}" id="${buttonId}" type="button" ${active ? "" : "hidden"} aria-pressed="${microphoneActive ? "true" : "false"}" title="${label}" aria-label="${label}">${microphoneMuted ? ICONS.micOff : ICONS.micOn}</button>`;
  }

  _shouldRenderTwoWayTalkSoundwave() {
    return (
      DEVICE_PROFILE.isDesktop === true &&
      !this._isMobileTabletViewport()
    );
  }

  _syncTwoWayTalkSoundwaveSurface() {
    const active =
      this._twoWayTalkActiveForCurrentCamera() &&
      this._shouldRenderTwoWayTalkSoundwave();
    this.shadowRoot
      ?.querySelectorAll?.(".two-way-talk-control-row")
      ?.forEach((row) => row.classList.toggle("has-soundwave", active));
    this.shadowRoot
      ?.querySelectorAll?.("[data-two-way-talk-soundwave]")
      ?.forEach((surface) => {
        surface.hidden = !active;
      });
    this._twoWayTalkSoundwaveController?.syncCanvas();
  }

  _buildTwoWayTalkButtonMarkup() {
    const active = this._twoWayTalkActiveForCurrentCamera();
    const microphoneMuted = this._twoWayTalkMicrophoneMutedForCurrentCamera();
    const label = active
      ? microphoneMuted
        ? "End two-way talk (microphone muted)"
        : "Disable two-way talk"
      : "Enable two-way talk";
    const visible = this._shouldRenderTwoWayTalkButtonForActiveCamera();
    return `<button class="info-row-mic-btn${active ? " active" : ""}${microphoneMuted ? " microphone-muted" : ""} round-btn" id="two-way-talk-btn" type="button" ${visible ? "" : "hidden"} aria-pressed="${active ? "true" : "false"}" title="${label}" aria-label="${label}">${active ? ICONS.micOn : ICONS.micOff}</button>`;
  }

  _buildLinkedLightControlMarkup({
    buttonClass = "round-btn",
    position = null,
  } = {}) {
    return (
      this._linkedLightController?.buildMarkup?.({
        buttonClass,
        position,
      }) || ""
    );
  }

  _activeCameraTwoWayTalkEnabled() {
    return (
      (!this._activeGroupMemberOverride ||
        this._activeGroupMemberOverride === this._activeCam?.entity) &&
      this._activeCam?.two_way_talk === true
    );
  }

  _twoWayTalkActiveForCurrentCamera() {
    return (
      !!this._twoWayTalkSession &&
      this._twoWayTalkEntity === String(this._activeCam?.entity || "").trim()
    );
  }

  _twoWayTalkMicrophoneMutedForCurrentCamera() {
    return (
      this._twoWayTalkActiveForCurrentCamera() &&
      this._twoWayTalkSession?.microphoneMuted === true
    );
  }

  _resolveLiveMuteControlMuted() {
    return this._streamMuted;
  }

  _syncTwoWayTalkRuntimeState() {
    if (!this._twoWayTalkSession) return;
    if (
      !this._shouldRenderTwoWayTalkButtonForActiveCamera() ||
      !this._activeCameraTwoWayTalkEnabled()
    ) {
      void this._stopTwoWayTalkSession();
    }
  }

  _syncTwoWayTalkActionSlot() {
    const infoRow = this._pageShellRegion("information");
    if (!infoRow) return;

    const existingSlot = this._pageShellRegionElement(
      "information",
      `[data-fvc-region="two-way-talk"]`,
    );
    if (!existingSlot) return;

    const actionMarkup = this._buildTwoWayTalkInfoButtonMarkup();
    if (!actionMarkup) {
      existingSlot.innerHTML = "";
      existingSlot.hidden = true;
      return;
    }

    existingSlot.hidden = false;
    if (!existingSlot.querySelector("#two-way-talk-btn")) {
      existingSlot.innerHTML = actionMarkup;
    }
  }

  _syncMobileViewTwoWayTalkSlot() {
    if (!this._isMobileViewPageActive()) return;
    const slot = this._pageShellRegion("twoWayTalk");
    if (!slot) return;
    slot.hidden = !this._shouldRenderTwoWayTalkButtonForActiveCamera();
  }

  _syncTwoWayTalkButton() {
    this._syncTwoWayTalkActionSlot();
    this._syncMobileViewTwoWayTalkSlot();
    const button = this._pageShellRegionElement("twoWayTalk", "#two-way-talk-btn");
    const visible = this._shouldRenderTwoWayTalkButtonForActiveCamera();
    const active = this._twoWayTalkActiveForCurrentCamera();
    const microphoneMuted = this._twoWayTalkMicrophoneMutedForCurrentCamera();
    const label = active
      ? microphoneMuted
        ? "End two-way talk (microphone muted)"
        : "Disable two-way talk"
      : "Enable two-way talk";
    this.shadowRoot
      ?.querySelectorAll?.(".two-way-talk-control-row")
      ?.forEach((row) => row.classList.toggle("has-inline-mute", active));
    if (button) {
      button.hidden = !visible;
      button.disabled = this._twoWayTalkStarting === true || !visible;
      button.classList.toggle("active", active);
      button.classList.toggle("microphone-muted", microphoneMuted);
      button.setAttribute("aria-pressed", active ? "true" : "false");
      button.setAttribute("title", label);
      button.setAttribute("aria-label", label);
      button.innerHTML = active ? ICONS.micOn : ICONS.micOff;
    }
    this.shadowRoot
      ?.querySelectorAll?.(".two-way-talk-microphone-mute-btn")
      ?.forEach((microphoneMuteButton) => {
        const microphoneLabel = microphoneMuted
          ? "Unmute microphone"
          : "Mute microphone";
        microphoneMuteButton.hidden = !active;
        microphoneMuteButton.style.display = active ? "" : "none";
        microphoneMuteButton.classList.toggle("active", !microphoneMuted);
        microphoneMuteButton.classList.toggle(
          "talk-audio-active",
          !microphoneMuted,
        );
        microphoneMuteButton.setAttribute(
          "aria-pressed",
          microphoneMuted ? "false" : "true",
        );
        microphoneMuteButton.setAttribute("title", microphoneLabel);
        microphoneMuteButton.setAttribute("aria-label", microphoneLabel);
        microphoneMuteButton.innerHTML = microphoneMuted
          ? ICONS.micOff
          : ICONS.micOn;
      });
    this._syncTwoWayTalkSoundwaveSurface?.();
    this._renderMuteButton();
    this._syncToolbarButtons?.();
  }

  async _toggleTwoWayTalkSession() {
    if (this._twoWayTalkStarting) return;
    if (this._twoWayTalkActiveForCurrentCamera()) {
      await this._stopTwoWayTalkSession();
      return;
    }
    await this._startTwoWayTalkSession();
  }

  _toggleTwoWayTalkMicrophoneMute() {
    if (!this._twoWayTalkActiveForCurrentCamera()) return;
    const nextMuted = !this._twoWayTalkMicrophoneMutedForCurrentCamera();
    this._twoWayTalkSession?.setMicrophoneMuted?.(nextMuted);
    this._syncTwoWayTalkButton();
  }

  _setTwoWayTalkLiveAudioActive(active) {
    this._applyLiveMuteChange(!active, { source: "two-way-talk" });
  }

  _clearTwoWayTalkResultBubble() {
    if (this._twoWayTalkResultTimer) {
      clearTimeout(this._twoWayTalkResultTimer);
      this._twoWayTalkResultTimer = null;
    }
    this._twoWayTalkResultBubble?.remove?.();
    this._twoWayTalkResultBubble = null;
  }

  _showTwoWayTalkResultBubble(success) {
    const surface = this._$("#live-stage");
    if (!surface) return;
    this._clearTwoWayTalkResultBubble();
    const bubble = document.createElement("div");
    bubble.className = `two-way-talk-result-bubble ${
      success ? "success" : "failure"
    }`;
    bubble.textContent = success
      ? "Two-way talk connected"
      : "Two-way talk failed to connect";
    surface.appendChild(bubble);
    this._twoWayTalkResultBubble = bubble;
    this._twoWayTalkResultTimer = setTimeout(() => {
      if (this._twoWayTalkResultBubble === bubble) {
        bubble.remove?.();
        this._twoWayTalkResultBubble = null;
      }
      this._twoWayTalkResultTimer = null;
    }, success ? 2200 : 3600);
  }

  async _startTwoWayTalkSession() {
    if (!window.isSecureContext) {
      this._showTwoWayTalkResultBubble(false);
      return;
    }
    const entity = String(this._activeCam?.entity || "").trim();
    if (!entity || !this._activeCameraTwoWayTalkEnabled()) return;
    const useGo2Rtc = this._shouldUseGo2RtcForEntity(entity);
    let talkMountAttempted = false;
    let endedDuringStart = false;
    this._twoWayTalkStarting = true;
    this._syncTwoWayTalkButton();
    try {
      await this._stopTwoWayTalkSession({ restoreLive: false });
      const handleEnded = () => {
        endedDuringStart = true;
        if (this._twoWayTalkEntity !== entity) return;
        this._twoWayTalkSoundwaveController?.stop();
        this._twoWayTalkSession = null;
        this._twoWayTalkEntity = "";
        this._setTwoWayTalkLiveAudioActive(false);
        this._syncTwoWayTalkButton();
      };
      const mountMicrophoneStream = async ({ localStream, onEnded }) => {
        const activeEntity = String(this._activeCam?.entity || "").trim();
        if (
          activeEntity !== entity ||
          this._shouldUseGo2RtcForEntity(entity) !== useGo2Rtc
        ) {
          return null;
        }
        talkMountAttempted = true;
        const mounted = await this._mountEngine("webrtc", {
          twoWayTalkOptions: {
            microphoneStream: localStream,
            onEnded,
          },
        });
        const engine = this._engine;
        return mounted && engine?.microphoneStream === localStream
          ? engine
          : null;
      };
      const session = useGo2Rtc
        ? await startGo2RtcTwoWayTalkSession({
            mountMicrophoneStream,
            onEnded: handleEnded,
          })
        : await startHaDirectTwoWayTalkSession({
            mountMicrophoneStream,
            onEnded: handleEnded,
          });
      if (
        endedDuringStart ||
        String(this._activeCam?.entity || "").trim() !== entity
      ) {
        await session.stop?.();
        throw new Error("Two-way talk context changed during startup");
      }
      this._twoWayTalkSession = session;
      this._twoWayTalkEntity = entity;
      this._setTwoWayTalkLiveAudioActive(true);
      this._twoWayTalkSoundwaveController?.startAfterPaint(session);
      this._showTwoWayTalkResultBubble(true);
    } catch (error) {
      console.warn("[Frigate] Two-way talk start failed", error);
      this._showTwoWayTalkResultBubble(false);
      if (!useGo2Rtc) {
        this._toast(
          "Home Assistant WebRTC could not establish two-way talk. Verify that the camera stream has a working audio backchannel.",
        );
      }
      this._twoWayTalkSoundwaveController?.stop();
      this._twoWayTalkSession = null;
      this._twoWayTalkEntity = "";
      this._setTwoWayTalkLiveAudioActive(false);
      if (
        talkMountAttempted &&
        String(this._activeCam?.entity || "").trim() === entity &&
        this._viewMode !== "grid" &&
        !this._isPreviewPageActive()
      ) {
        try {
          await this._mountEngine();
        } catch (restoreError) {
          console.warn(
            "[Frigate] Unable to restore live view after two-way talk start failure",
            restoreError,
          );
        }
      }
    } finally {
      this._twoWayTalkStarting = false;
      this._syncTwoWayTalkButton();
    }
  }

  async _stopTwoWayTalkSession({ restoreLive = true } = {}) {
    const session = this._twoWayTalkSession;
    const sessionEntity = this._twoWayTalkEntity;
    this._twoWayTalkSoundwaveController?.stop();
    this._twoWayTalkSession = null;
    this._twoWayTalkEntity = "";
    this._setTwoWayTalkLiveAudioActive(false);
    this._syncTwoWayTalkSoundwaveSurface?.();
    if (!session) {
      this._syncTwoWayTalkButton();
      return;
    }
    try {
      await session.stop?.();
    } catch (error) {
      console.warn("[Frigate] Two-way talk stop failed", error);
    }
    if (
      restoreLive &&
      sessionEntity &&
      String(this._activeCam?.entity || "").trim() === sessionEntity &&
      this._viewMode !== "grid" &&
      !this._isPreviewPageActive()
    ) {
      try {
        await this._mountEngine();
      } catch (error) {
        console.warn(
          "[Frigate] Unable to restore live view after two-way talk",
          error,
        );
      }
    }
    this._syncTwoWayTalkButton();
  }

  _initLiveOverlayControls() {
    const wrap = this._$("#live-stage");
    if (!wrap) return;
    if (this._liveOverlayControlsController) {
      try {
        this._liveOverlayControlsController.dispose();
      } catch (_) {}
      this._liveOverlayControlsController = null;
    }
    if (!wrap.classList.contains("live-stage--overlay")) return;
    const show = () => {
      wrap.classList.add("live-controls-visible");
    };
    const hideNow = () => {
      wrap.classList.remove("live-controls-visible");
      if (this._liveControlsHideTimer) {
        clearTimeout(this._liveControlsHideTimer);
        this._liveControlsHideTimer = null;
      }
    };
    const hideSoon = (ms = 1400) => {
      if (this._liveControlsHideTimer)
        clearTimeout(this._liveControlsHideTimer);
      this._liveControlsHideTimer = setTimeout(() => {
        wrap.classList.remove("live-controls-visible");
        this._liveControlsHideTimer = null;
      }, ms);
    };
    this._liveOverlayControlsController = new LiveOverlayControlsController({
      wrap,
      show,
      hideNow,
      hideSoon,
    });
    this._liveOverlayControlsController.bind();
  }

  _syncBrowseHeadModeClass() {
    const card = this._$("#card");
    if (!card) return;
    card.classList.toggle(
      "recordings-browse-head-tall",
      this._tab === "recordings",
    );
    card.classList.remove("recordings-browse-head-compact");
  }

  _bindListScroll() {
    const list = this._pageShellRegionElement("browse", "#list");
    const browse = this._pageShellRegion("browse");
    if (!list && !browse) return;
    if (this._listScrollController) {
      this._listScrollController.dispose();
      this._listScrollController = null;
    }
    this._listScrollController = new ListScrollController({
      list,
      browse,
      syncOlderHint: () => this._syncOlderHint(),
      syncBrowseHeadFromScroll: () => this._syncBrowseHeadFromScroll(),
      getTab: () => this._tab,
      isLoading: () => this._loading,
      isExhausted: () => this._exhausted,
      loadOlder: () => this._browseWindowLoaderController.loadOlder(),
    });
    this._listScrollController.bind();
  }

  _bindRecordingsSwipe() {
    if (this._recordingsSwipeController) {
      this._recordingsSwipeController.dispose();
      this._recordingsSwipeController = null;
    }
    const browse = this._pageShellRegion("browse");
    if (!browse) return;
    this._recordingsSwipeController = new RecordingsSwipeController({
      browse,
      getList: () => this._pageShellRegionElement("browse", "#list"),
      getLastRenderedListHtml: () => this._lastRenderedListHtml,
    });
  }

  _recordingsListMarkup(recs, emptyText = "No recordings in this day") {
    return buildRecordingsListMarkup({
      recordings: recs,
      emptyText,
      recordingsIcon: ICONS.recordings,
      downloadIcon: ICONS.download,
      formatTime: (ts) => this._time(ts),
      nowSec: this._winEnd || Date.now() / 1000,
    });
  }

  _recordingsViewRows(recs) {
    return splitRecordingsHourly(recs, this._winEnd || Date.now() / 1000).sort(
      (a, b) => b.start_time - a.start_time,
    );
  }

  _createRecordingsSwipeStage(direction, incomingHtml) {
    return this._recordingsSwipeController?.createStage(
      direction,
      incomingHtml,
    );
  }

  _setRecordingsSwipeStageOffset(state, offset, transition = "") {
    this._recordingsSwipeController?.setStageOffset(state, offset, transition);
  }

  _animateRecordingsSwipeStageTo(
    state,
    offset,
    duration = 260,
    easing = "cubic-bezier(0.18, 0.5, 0.2, 1)",
  ) {
    return (
      this._recordingsSwipeController?.animateStageTo(
        state,
        offset,
        duration,
        easing,
      ) || Promise.resolve()
    );
  }

  _clearRecordingsSwipeListState(list = null) {
    this._recordingsSwipeController?.clearListState(list);
  }

  _bounceRecordingsArea(direction) {
    this._recordingsSwipeController?.bounceArea(direction);
  }

  _scrollEventsToTop() {
    const list = this._pageShellRegionElement("browse", "#list");
    const browse = this._pageShellRegion("browse");
    const scroller = resolveActiveListScroller({ list, browse });
    if (!scroller) return;
    if (typeof scroller.scrollTo === "function") {
      scroller.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      scroller.scrollTop = 0;
    }
  }

  _applyCardStyle() {
    this._cardStyleController.applyCardStyle();
    this._haPageBackgroundController?.sync?.();
  }

  _isCardVisible() {
    return this._viewportContextController.isCardVisible();
  }

  _preserveLiveForDashboardNavigation() {
    if (
      !this._started ||
      !this._engine ||
      this._mountInProgress ||
      this._isPreviewPageActive() ||
      this._viewMode === "grid" ||
      this._twoWayTalkStarting ||
      this._twoWayTalkSession
    ) {
      return false;
    }

    const entity = resolveCameraSwitchTransportEntity({
      cameraEntity: this._activeCam?.entity,
      memberOverride: this._activeGroupMemberOverride,
    });
    const streamType = this._currentLiveStreamHint();
    if (
      !entity ||
      !this._shouldUseGo2RtcForEntity(entity) ||
      (streamType !== "webrtc" && streamType !== "mse")
    ) {
      return false;
    }

    const cleanupOptions = resolveCameraSwitchCleanupOptions({
      previousEntity: entity,
      mountInProgress: this._mountInProgress,
    });
    if (!cleanupOptions.preserveLiveEntity) return false;

    this._cancelPendingMount("same-dashboard-navigation", cleanupOptions);
    this._clearLiveEngineSlot();
    this._dashboardLiveGraceActive = true;
    return true;
  }

  _handleDashboardScopeExited() {
    this._dashboardLiveGraceActive = false;
    const teardownIfDetached = () => {
      if (this.isConnected) return;
      if (this._disconnectTeardownT) {
        clearTimeout(this._disconnectTeardownT);
        this._disconnectTeardownT = null;
      }
      this._teardownDisconnected();
    };
    if (!this.isConnected) {
      teardownIfDetached();
      return;
    }
    setTimeout(teardownIfDetached, 0);
  }

  _handleDashboardSwipeNavigationSettled() {
    const restoreRetainedWebRtc = () => {
      if (
        !this.isConnected ||
        !this._started ||
        !this._hass ||
        !this._config ||
        !this._isCardVisible() ||
        this._isPreviewPageActive() ||
        this._viewMode === "grid" ||
        this._mountInProgress ||
        this._$("#myPopup")?.classList.contains("is-open")
      ) {
        return;
      }

      const entity = resolveCameraSwitchTransportEntity({
        cameraEntity: this._activeCam?.entity,
        memberOverride: this._activeGroupMemberOverride,
      });
      if (
        !entity ||
        !this._shouldUseGo2RtcForEntity(entity) ||
        this._currentLiveStreamHint() !== "webrtc"
      ) {
        return;
      }

      const engineHost = this._$("#engine");
      const video =
        this._findVideoDeep(engineHost) ||
        this._findVideoDeep(this._engine) ||
        this._engine?.video ||
        null;
      if (!this._engine || !video) {
        this._scheduleResumeLive("dashboard-swipe-settled");
        return;
      }

      // Reuse the established peer connection, but remount its video after
      // Home Assistant's page transform so WebKit creates a fresh surface.
      this._cancelPendingMount("dashboard-swipe-webrtc-rebind", {
        preserveLiveEntity: entity,
      });
      this._clearLiveEngineSlot();
      void this._mountEngine();
    };

    if (typeof requestAnimationFrame === "function") {
      requestAnimationFrame(restoreRetainedWebRtc);
      return;
    }
    setTimeout(restoreRetainedWebRtc, 0);
  }

  _scheduleResumeLive(reason = "") {
    if (this._isPreviewPageActive()) {
      this._renderPreviewPage();
      return;
    }
    if (this._viewMode === "grid") {
      this._scheduleGridRefresh(120);
      return;
    }
    if (this._resumeLiveT) clearTimeout(this._resumeLiveT);
    const isEditorExitReason =
      reason === "card-editor-close" ||
      reason === "watchdog-dialog-close" ||
      reason === "watchdog-edit-exit" ||
      reason === "watchdog-dashboard-edit-on" ||
      reason === "watchdog-dashboard-edit-off" ||
      reason === "hass-edit-exit";
    const delay =
      reason === "card-editor-close" ||
      reason === "watchdog-dialog-close" ||
      reason === "watchdog-dashboard-edit-on" ||
      reason === "watchdog-dashboard-edit-off"
        ? 40
        : 140;
    this._resumeLiveT = setTimeout(() => {
      this._resumeLiveT = null;
      this._resumeLiveIfNeeded(reason);
    }, delay);
    if (isEditorExitReason && this._viewMode !== "grid") {
      // Editor exit can race layout/visibility; a late kick recovers missed first mounts.
      setTimeout(() => this._kickLiveIfStale(true), 900);
    }
    if (this._isFirefox() && this._viewMode !== "grid") {
      // Firefox may need a second kick after layout settles on tab return.
      setTimeout(() => this._kickLiveIfStale(true), 900);
    }
  }
  _isMobileTabletViewport() {
    return this._viewportContextController.isMobileTabletViewport();
  }
  _isLandscapeViewport() {
    return this._viewportContextController.isLandscapeViewport();
  }
  _clearRotateOverlayAudioSync() {
    if (this._rotateOverlaySyncVideo && this._onRotateOverlayVolumeChange) {
      try {
        this._rotateOverlaySyncVideo.removeEventListener(
          "volumechange",
          this._onRotateOverlayVolumeChange,
        );
      } catch (_) {}
    }
    this._rotateOverlaySyncVideo = null;
    this._onRotateOverlayVolumeChange = null;
  }
  _clearRotateVideoFullscreenStyle() {
    const v = this._rotateStyledVideo;
    if (!v) return;
    try {
      if (this._rotateStyledVideoCssText) {
        v.setAttribute("style", this._rotateStyledVideoCssText);
      } else {
        v.removeAttribute("style");
      }
    } catch (_) {}
    this._rotateStyledVideo = null;
    this._rotateStyledVideoCssText = "";
  }
  _applyRotateVideoFullscreenStyle(video) {
    if (!video) return;
    if (this._rotateStyledVideo !== video) {
      this._clearRotateVideoFullscreenStyle();
      this._rotateStyledVideo = video;
      this._rotateStyledVideoCssText = video.getAttribute("style") || "";
    }
    const card = this._$("#card");
    const forceMobileViewViewportCover =
      card?.classList?.contains("mobile-view-active") &&
      (card.classList.contains("mobile-rotate-live") ||
        card.classList.contains("mobile-rotate-live-exit"));
    const videoStyles = resolveRotateOverlayVideoStyles({
      useStageViewport: forceMobileViewViewportCover,
      visualViewport: window.visualViewport,
      innerWidth: window.innerWidth,
      innerHeight: window.innerHeight,
    });
    for (const [property, value] of Object.entries(videoStyles)) {
      video.style.setProperty(property, value, "important");
    }
    if (this._liveVideoZoomController?.video === video) {
      this._liveVideoZoomController.refresh();
    }
    if (this._popupVideoZoomController?.video === video) {
      this._popupVideoZoomController.refresh();
    }
    video.setAttribute("playsinline", "");
    video.setAttribute("webkit-playsinline", "true");
  }
  _bindRotateOverlayAudioSync(video) {
    if (!video) return;
    if (this._rotateOverlaySyncVideo === video) return;
    this._clearRotateOverlayAudioSync();
    this._rotateOverlaySyncVideo = video;
    this._onRotateOverlayVolumeChange = () => {
      const mutedNow = !!video.muted;
      if (mutedNow === this._streamMuted) return;
      this._applyLiveMuteChange(mutedNow, { source: "native-controls" });
    };
    video.addEventListener("volumechange", this._onRotateOverlayVolumeChange);
  }
  _setLiveNativeControls(enabled, { applyFullscreenStyle = enabled } = {}) {
    const controlsPlan = resolveRotateOverlayNativeControlsPlan({
      enabled,
      applyFullscreenStyle,
    });
    const expected = controlsPlan.expectedActive;
    const apply = () => {
      if (expected && !this._rotateOverlayActive) return;
      const host = this._$("#engine");
      const v =
        this._findVideoDeep(host) ||
        this._findVideoDeep(this._engine) ||
        this._engine?.video ||
        null;
      if (!v) return;
      v.controls = expected;
      if (!expected) v.removeAttribute("controls");
      v.setAttribute("playsinline", "");
      v.setAttribute("webkit-playsinline", "true");
      if (controlsPlan.applyFullscreenStyle)
        this._applyRotateVideoFullscreenStyle(v);
      else this._clearRotateVideoFullscreenStyle();
      if (controlsPlan.bindAudioSync) this._bindRotateOverlayAudioSync(v);
    };
    if (controlsPlan.clearAudioSyncFirst) {
      this._clearRotateOverlayAudioSync();
    }
    if (controlsPlan.clearFullscreenStyleFirst) {
      this._clearRotateVideoFullscreenStyle();
    }
    apply();
    controlsPlan.retryDelaysMs.forEach((delay) => setTimeout(apply, delay));
  }
  _scheduleRotateOverlayUpdate() {
    if (this._rotateOverlayRaf) cancelAnimationFrame(this._rotateOverlayRaf);
    this._rotateOverlayRaf = requestAnimationFrame(() => {
      this._rotateOverlayRaf = 0;
      this._syncRotateOverlayViewportState();
    });
  }
  _syncRotateOverlayViewportState() {
    const viewportVars = resolveRotateOverlayViewportVariables({
      visualViewport: window.visualViewport,
      innerWidth: window.innerWidth,
      innerHeight: window.innerHeight,
    });
    this.style.setProperty("--rotate-vw", viewportVars.widthPx);
    this.style.setProperty("--rotate-vh", viewportVars.heightPx);
    this.style.setProperty("--rotate-ox", viewportVars.offsetLeftPx);
    this.style.setProperty("--rotate-oy", viewportVars.offsetTopPx);
    this._updateRotateOverlayState();
  }
  _setRotateLiveTransitionRect(prefix, rect) {
    if (!rect || rect.width <= 0 || rect.height <= 0) return false;
    this.style.setProperty(`--rotate-live-${prefix}-x`, `${rect.left}px`);
    this.style.setProperty(`--rotate-live-${prefix}-y`, `${rect.top}px`);
    this.style.setProperty(`--rotate-live-${prefix}-w`, `${rect.width}px`);
    this.style.setProperty(`--rotate-live-${prefix}-h`, `${rect.height}px`);
    return true;
  }
  _captureRotateLiveEntryRect() {
    return this._setRotateLiveTransitionRect(
      "from",
      this._$("#live-stage")?.getBoundingClientRect?.(),
    );
  }
  _captureRotateLiveExitRect(card) {
    const stage = this._$("#live-stage");
    if (!card || !stage) return false;
    const hadLiveClass = card.classList.contains("mobile-rotate-live");
    const hadExitClass = card.classList.contains("mobile-rotate-live-exit");
    const hadViewportCover = this.classList.contains(
      MOBILE_VIEW_ROTATE_COVER_CLASS,
    );

    card.classList.remove("mobile-rotate-live", "mobile-rotate-live-exit");
    this.classList.remove(MOBILE_VIEW_ROTATE_COVER_CLASS);
    const targetRect = stage.getBoundingClientRect();
    if (hadViewportCover) this.classList.add(MOBILE_VIEW_ROTATE_COVER_CLASS);
    if (hadLiveClass) card.classList.add("mobile-rotate-live");
    if (hadExitClass) card.classList.add("mobile-rotate-live-exit");

    return this._setRotateLiveTransitionRect("to", targetRect);
  }
  _scheduleRotateOverlayExitCleanup(exitPlan) {
    this._rotateOverlayExitT = setTimeout(() => {
      const c = this._$("#card");
      if (c && exitPlan.removeClasses.length) {
        c.classList.remove(...exitPlan.removeClasses);
      }
      this._syncLiveRotateZoomPresentation(c);
      if (exitPlan.releaseViewportCover) {
        this.classList.remove(MOBILE_VIEW_ROTATE_COVER_CLASS);
      }
      this._rotateOverlayExitT = null;
      if (this._resumeLiveT) return;
      if (exitPlan.syncFullscreenButtons) {
        this._syncFullscreenButtonsVisibility();
      }
    }, exitPlan.delayMs);
  }
  _updateRotateOverlayState() {
    const card = this._$("#card");
    if (!card) return;
    const popupOpen = this._$("#myPopup")?.classList.contains("is-open");
    const viewer = this._$("#viewer");
    const popupMediaVisible =
      !!popupOpen &&
      !!viewer &&
      viewer.style.display !== "none" &&
      viewer.childElementCount > 0;
    const fullscreenActive = Boolean(
      document.fullscreenElement ||
        document.webkitFullscreenElement ||
        this._liveFullscreenLifecycleController?.active,
    );
    const rotateState = resolveRotateOverlayState({
      rotateEnabled:
        this._config?.mobile_view_rotate_to_fullscreen !== false,
      isMobileTabletViewport: this._isMobileTabletViewport(),
      isLandscapeViewport: this._isLandscapeViewport(),
      popupOpen,
      popupMediaVisible,
      fullscreenActive,
      currentMode: this._rotateOverlayMode,
      isActive: this._rotateOverlayActive,
      isExitPending: Boolean(this._rotateOverlayExitT),
    });

    if (rotateState.action === "continue-exit") {
      clearTimeout(this._rotateOverlayExitT);
      this._rotateOverlayExitT = null;
      this._scheduleRotateOverlayExitCleanup(
        resolveRotateOverlayExitPlan(rotateState),
      );
      return;
    }

    if (this._rotateOverlayExitT) {
      clearTimeout(this._rotateOverlayExitT);
      this._rotateOverlayExitT = null;
    }

    const mobileViewActivationAlreadyApplied =
      card.classList.contains(MOBILE_VIEW_ACTIVE_CLASS) &&
      ((rotateState.action === "activate-live" &&
        this._rotateOverlayActive &&
        this._rotateOverlayMode === "live" &&
        card.classList.contains("mobile-rotate-live")) ||
        (rotateState.action === "activate-popup" &&
          this._rotateOverlayActive &&
          this._rotateOverlayMode === "popup" &&
          card.classList.contains("mobile-rotate-popup")));
    if (mobileViewActivationAlreadyApplied) return;

    if (rotateState.action === "activate-live") {
      this._captureRotateLiveEntryRect();
    } else if (
      rotateState.action === "deactivate" &&
      rotateState.exitMode === "live"
    ) {
      this._captureRotateLiveExitRect(card);
    }

    const uiPlan = resolveRotateOverlayUiPlan(rotateState);
    this._applyRotateOverlayUiPlan(card, uiPlan);
    const exitPlan = resolveRotateOverlayExitPlan({
      action: rotateState.action,
    });

    if (rotateState.action === "activate-live") {
      return;
    }

    if (rotateState.action === "activate-popup") {
      return;
    }

    if (rotateState.action === "idle") {
      return;
    }

    this._scheduleRotateOverlayExitCleanup(exitPlan);
  }
  _kickLiveIfStale(
    force = false,
    forceRemount = false,
    forcedType = null,
  ) {
    const now = Date.now();
    const engineHost = this._$("#engine");
    const v =
      this._findVideoDeep(engineHost) ||
      this._findVideoDeep(this._engine) ||
      this._engine?.video ||
      null;
    const probeState = resolveLiveKickProbeState({ video: v });

    const action = resolveLiveKickIfStaleAction({
      started: this._started,
      hass: this._hass,
      config: this._config,
      previewPageActive: this._isPreviewPageActive(),
      viewMode: this._viewMode,
      visible: this._isCardVisible(),
      popupOpen: this._$("#myPopup")?.classList.contains("is-open"),
      mountInProgress: this._mountInProgress,
      force,
      forceRemount,
      streamLoadingVisible: !!(
        this._$("#stream-loading") && !this._$("#stream-loading").hidden
      ),
      lastLiveKick: this._lastLiveKick,
      nowMs: now,
      isFirefox: this._isFirefox(),
      mseConnectAt: this._mseConnectAt,
      mseLastChunkAt: this._mseLastChunkAt,
      hasVideo: probeState.hasVideo,
      videoState: probeState.videoState,
    });

    if (action.shouldKick) {
      this._lastLiveKick = action.nextLastLiveKick;
      this._mountEngine(forcedType);
    }
  }

  _resumeLiveIfNeeded(reason = "") {
    const liveStreamHint = this._currentLiveStreamHint();
    const forceRemount = shouldForceLiveRemountForReason(reason, {
      activeStreamType: liveStreamHint,
      useGo2Rtc: this._shouldUseGo2RtcForEntity(
        this._activeGroupMemberOverride || this._activeCam?.entity || "",
      ),
    });
    const action = resolveLiveResumeAction({
      started: this._started,
      hass: this._hass,
      config: this._config,
      previewPageActive: this._isPreviewPageActive(),
      visible: this._isCardVisible(),
      popupOpen: this._$("#myPopup")?.classList.contains("is-open"),
      mountSeq: this._mountSeq,
      mountInProgress: this._mountInProgress,
      mountStartedAt: this._mountStartedAt,
      mountTargetEntity: this._mountTargetEntity,
      nowMs: Date.now(),
    });

    if (action.nextMountState) {
      this._applyMountTrackingState(action.nextMountState);
      this._cleanupEngine();
    }

    if (action.shouldRetry) {
      // Layout transitions are async. Keep retrying until mount is possible.
      if (this._resumeLiveT) clearTimeout(this._resumeLiveT);
      this._resumeLiveT = setTimeout(() => {
        this._resumeLiveIfNeeded(
          forceRemount &&
            shouldPreserveLiveRemountReasonWhileWaiting(reason)
            ? reason
            : "wait-ready",
        );
      }, action.retryDelayMs);
      return;
    }

    if (action.shouldRevealEngineWrap) {
      const engWrap = this._$("#eng-wrap");
      if (engWrap) engWrap.style.display = "";
    }
    if (action.shouldKickNow) {
      this._kickLiveIfStale(
        true,
        forceRemount,
        forceRemount &&
          liveStreamHint === "mse" &&
          isMseReturnRemountReason(reason)
          ? "mse"
          : null,
      );
    }
    // Safety follow-up: some browsers finalize media attachment one frame later.
    if (action.safetyKickDelayMs > 0) {
      setTimeout(() => this._kickLiveIfStale(true), action.safetyKickDelayMs);
    }
  }
  _setupResizeObserver() {
    if (this._ro) this._ro.disconnect();
    this._ro = new ResizeObserver((entries) => {
      const w = entries[0].contentRect.width;
      const h = entries[0].contentRect.height;
      const prevW = this._cardWidth || 0;
      const prevH = this._cardHeight || 0;
      this._cardWidth = w;
      this._cardHeight = h;
      const visibleNow = w > 2 && h > 2;
      if (visibleNow && !this._wasVisible) {
        this._scheduleResumeLive("resize-visible");
        this._wideViewPageController?.resumeCompanionMedia?.();
      }
      this._wasVisible = visibleNow;
      if (
        prevW > 0 &&
        prevH > 0 &&
        Math.round(w) === Math.round(prevW) &&
        Math.round(h) === Math.round(prevH)
      ) {
        return;
      }
      const card = this.shadowRoot.querySelector(".card");
      if (!card) return;

      this._syncBrowseHeadModeClass();
      this._applyCardStyle();
      this._applyBrowse();
      this._scheduleRotateOverlayUpdate();
      this._wideViewPageController.syncColHeightIfWideView();
    });
    this._ro.observe(this);
    if (!this._io && "IntersectionObserver" in window) {
      this._io = new IntersectionObserver(
        (entries) => {
          const e = entries[0];
          if (e?.isIntersecting) {
            this._scheduleResumeLive("intersection");
            this._wideViewPageController?.resumeCompanionMedia?.();
          }
        },
        { threshold: 0.15 },
      );
      this._io.observe(this);
    }
  }
  // ── cam switcher ──────────────────────────────────────────
  _camSwitcherMarkup({ includeStatus = true } = {}) {
    return this._activeStandardPageController().camSwitcherMarkup({
      includeStatus,
    });
  }

  _renderCamSwitcher() {
    this._activeStandardPageController().renderCamSwitcher();
  }
  // ── interactions ──────────────────────────────────────────
  _createFilterPanel() {
    return this._pageShellRegion("filterPanel");
  }

  _createCalendarPanel() {
    return this._pageShellRegion("calendarPanel");
  }

  _click(e) {
    const target = e.target;
    if (this._linkedLightController?.handleClick?.(e, target)) return;
    if (this._mobileCamSwitcherController.handleClickTarget(target)) return;
    this._mobileCamSwitcherController.closeIfOutside(target);
    if (this._cardViewPageController?.handleClick?.(e, target)) return;
    if (target.closest(".close-btn")) {
      return this._popupLifecycleController.close();
    }
    if (this._popupRecordingScrubController.handleClick(e, target)) return;
    if (this._handleToolbarClick(target, e)) return;
    if (this._popupInfoController.handleClick(e, target)) return;
    if (this._handleSidebarClick(e, target)) return;
    if (this._handleListClick(e, target)) return;
    if (this._handleEventClick(target)) return;
  }
  _handleToolbarClick(target, event = null) {
    if (this._handleTopToolbarClick(target, event)) return true;
    if (this._handlePopupMediaToolbarClick(target)) return true;
    if (this._handleBrowseToolbarClick(target)) return true;
    return false;
  }
  _handleTopToolbarClick(target, event = null) {
    const twoWayTalkBtn = target.closest("#two-way-talk-btn");
    if (twoWayTalkBtn) {
      if (twoWayTalkBtn.disabled) return true;
      this._cameraGroupLiveController?.setActiveAudioMember?.("A");
      void this._toggleTwoWayTalkSession();
      releaseTwoWayTalkTouchFocus({ button: twoWayTalkBtn, event });
      return true;
    }
    const microphoneMuteButton = target.closest(
      "#two-way-talk-microphone-mute-btn, #mobile-view-microphone-mute-btn",
    );
    if (microphoneMuteButton) {
      this._toggleTwoWayTalkMicrophoneMute();
      releaseTwoWayTalkTouchFocus({
        button: microphoneMuteButton,
        event,
      });
      return true;
    }
    const groupAudioButton = target.closest("[data-camera-group-audio]");
    if (groupAudioButton) {
      this._cameraGroupLiveController?.setActiveAudioMember?.(
        groupAudioButton.dataset.cameraGroupAudio,
      );
      return true;
    }
    const groupFocusButton = target.closest("[data-camera-group-focus]");
    if (groupFocusButton) {
      this._cameraGroupLiveController?.toggleFocusedMember?.(
        groupFocusButton.dataset.cameraGroupFocus,
      );
      return true;
    }
    if (target.closest("[data-camera-group-mobile-toggle]")) {
      this._cameraGroupLiveController?.toggleMobileMember?.();
      return true;
    }
    const wideAlertTakeoverBtn = target.closest("#wide-alert-takeover-btn");
    if (wideAlertTakeoverBtn) {
      if (wideAlertTakeoverBtn.disabled) return true;
      this._wideViewPageController.toggleCompanionAlertTakeover();
      return true;
    }
    const gridBtn = target.closest("#grid-btn");
    if (gridBtn) {
      if (gridBtn.disabled) return true;
      this._toggleGridMode();
      return true;
    }
    const slideshowBtn = target.closest("#slideshow-btn");
    if (slideshowBtn) {
      if (slideshowBtn.disabled) return true;
      this._toggleSlideshowRotation();
      return true;
    }
    if (target.closest("#live-pip-btn")) {
      void this._togglePictureInPicture(this._livePictureInPictureVideo());
      return true;
    }
    if (target.closest("#live-take-snapshot-btn")) {
      void this._takeDisplayedSnapshot("live");
      return true;
    }
    if (target.closest("#live-fs-btn")) {
      this._fullscreen(this._$("#live-stage"), { preferLive: true });
      return true;
    }
    return false;
  }
  _handleBrowseToolbarClick(target) {
    if (this._handleBrowsePanelToolbarClick(target)) return true;
    if (this._handleRecordingsBrowseToolbarClick(target)) return true;
    return false;
  }
  _handleBrowsePanelToolbarClick(target) {
    const filterBtn = target.closest("#filter-btn");
    if (filterBtn) {
      if (filterBtn.disabled) return true;
      this._toggleFilter();
      return true;
    }
    const calBtn = target.closest("#cal-btn");
    if (calBtn) {
      if (calBtn.disabled) return true;
      this._toggleCal();
      return true;
    }
    const controlsBtn = target.closest("#controls-btn");
    if (controlsBtn) {
      if (controlsBtn.disabled || controlsBtn.hidden) return true;
      if (this._tab === "controls") {
        this._setTab(this._resolveControlsReturnTab());
      } else {
        this._setTab("controls");
      }
      return true;
    }
    return false;
  }
  _handleRecordingsBrowseToolbarClick(target) {
    const recDayNav = target.closest("[data-rec-day-nav]");
    if (recDayNav) {
      const dir = Number(recDayNav.dataset.recDayNav || 0);
      if (dir) {
        void this._recordingsBrowseNavController.navigateDayAnimated(dir);
      }
      return true;
    }
    return false;
  }
  _handlePopupMediaToolbarClick(target) {
    if (target.closest("#popup-take-snapshot-btn")) {
      void this._takeDisplayedSnapshot("popup");
      return true;
    }
    if (target.closest("#popup-pip-btn")) {
      void this._togglePictureInPicture(
        this._popupMediaControlsController.video(),
        { popup: true },
      );
      this._popupMediaControlsController.showTemporarily();
      return true;
    }
    if (
      target.closest(
        "#popup-airplay-btn, #popup-media-airplay, #popup-mobile-airplay-btn",
      )
    ) {
      void this._playbackTargetController.prompt(PLAYBACK_TARGET_AIRPLAY, {
        scope: "popup",
      });
      this._popupMediaControlsController.showTemporarily();
      return true;
    }
    if (
      target.closest(
        "#mute-btn, #mobile-view-mute-btn, #two-way-talk-mute-btn",
      )
    ) {
      this._toggleMute();
      return true;
    }
    if (this._popupMediaControlsController.handleClick(target)) return true;
    if (target.closest("#popup-media-fs, #popup-mobile-fs-btn")) {
      this._fullscreen(this._$("#viewer"));
      this._popupMediaControlsController.showTemporarily();
      return true;
    }
    const carouselNav = target.closest("[data-carousel-dir]");
    if (carouselNav) {
      const dir = Number(carouselNav.dataset.carouselDir || 0);
      if (dir) this._popupCarouselController.scroll(dir);
      return true;
    }
    return false;
  }
  _handleSidebarClick(event, target) {
    if (this._handleWideViewSidebarClick(event, target)) return true;
    if (this._handlePreviewSidebarClick(target)) return true;
    if (this._handleSidebarNavigationClick(target)) return true;
    if (this._handleSidebarCameraClick(target)) return true;
    if (this._handleSidebarCalendarClick(target)) return true;
    if (this._handleSidebarFilterClick(target)) return true;
    return false;
  }
  _handleWideViewSidebarClick(event, target) {
    if (this._wideViewPageController.handleTimelineClick(event, target)) {
      return true;
    }
    const companionCell = target.closest("[data-wide-companion-camidx]");
    if (
      !companionCell ||
      !this._wideViewPageController.isWideViewPageActive()
    ) {
      return false;
    }
    this._wideViewPageController.selectCompanionCamera(
      Number(companionCell.dataset.wideCompanionCamidx),
    );
    return true;
  }
  _handleSidebarFilterClick(target) {
    return this._browseFilterController.handleSidebarFilterClick(target);
  }
  _handleSidebarCalendarClick(target) {
    return this._browseCalendarPanelController.handleSidebarCalendarClick(
      target,
    );
  }
  _handleSidebarCameraClick(target) {
    const camTab = target.closest("[data-camidx]");
    if (camTab) {
      this._pauseSlideshowForInteraction();
      this._switchCamera(Number(camTab.dataset.camidx));
      return true;
    }
    const gridCell = target.closest("[data-grid-camidx]");
    if (gridCell && this._viewMode === "grid") {
      const idx = Number(gridCell.dataset.gridCamidx);
      if (Number.isInteger(idx) && idx >= 0) {
        this._pauseSlideshowForInteraction();
        this._switchCamera(idx);
        return true;
      }
    }
    return false;
  }
  _handleSidebarNavigationClick(target) {
    const pageRoute = target.closest("[data-page-route]");
    if (pageRoute) {
      this._pageNavigationController.navigateToPageRoute(
        pageRoute.dataset.pageRoute,
        {
          source: "page-nav",
        },
      );
      return true;
    }
    const setvm = target.closest("[data-setviewmode]");
    if (setvm) {
      this._setViewMode(setvm.dataset.setviewmode);
      return true;
    }
    const viewm = target.closest("[data-viewmode]");
    if (viewm) {
      this._setViewMode(viewm.dataset.viewmode);
      return true;
    }
    return false;
  }
  _handlePreviewSidebarClick(target) {
    const previewButton = target.closest("[data-preview-select-camidx]");
    if (previewButton && this._isPreviewPageActive()) {
      this._exitPreviewPageToCamera(
        Number(previewButton.dataset.previewSelectCamidx),
        previewButton.dataset.previewSelectEntity || "",
      );
      return true;
    }
    const previewCell = target.closest("[data-preview-camidx]");
    if (previewCell && this._isPreviewPageActive()) {
      this._exitPreviewPageToCamera(
        Number(previewCell.dataset.previewCamidx),
        previewCell.dataset.previewEntity || "",
      );
      return true;
    }
    const previewBack = target.closest("[data-preview-back]");
    if (previewBack) {
      this._returnToPreviewPage();
      return true;
    }
    return false;
  }
  _handleListClick(e, target) {
    this._pauseSlideshowForInteraction();
    if (this._handlePrimaryListItemClick(e, target)) return true;
    if (this._handleListNavigationClick(e, target)) return true;
    return this._handleRecordingsListClick(e, target);
  }
  _handleRecordingsListClick(e, target) {
    const recDl = target.closest(".rp[data-rec-dl-start]");
    if (recDl) {
      e.stopPropagation();
      const rs = Number(recDl.dataset.recDlStart);
      const re = Number(recDl.dataset.recDlEnd);
      const recordingContext =
        this._camCache?.[recDl.dataset.recCameraEntity || ""] || null;
      if (Number.isFinite(rs) && Number.isFinite(re) && re > rs) {
        void this._frigateMediaDownloadController.downloadRecording(
          rs,
          re,
          recordingContext,
        );
      }
      return true;
    }
    const recRow = target.closest("[data-rs]");
    if (recRow) {
      const recordingEntity = recRow.dataset.recCameraEntity || "";
      const recordingContext = this._camCache?.[recordingEntity] || null;
      this._popupMediaLoaderController.showRecording(
        +recRow.dataset.rs,
        +recRow.dataset.re,
        recordingContext
          ? {
              cameraEntity: recordingEntity,
              clientId: recordingContext.clientId,
              camera: recordingContext.cam,
            }
          : {},
      );
      return true;
    }
    return false;
  }
  _handleListNavigationClick(e, target) {
    const presetButton = target.closest("[data-ptz-preset]");
    if (presetButton) {
      e.stopPropagation();
      if (!presetButton.disabled) {
        void this._handlePtzPreset(
          presetButton.dataset.ptzPreset,
          presetButton,
        );
      }
      return true;
    }
    const circleBtn = target.closest("[data-tab]");
    if (circleBtn) {
      this._setTab(circleBtn.dataset.tab);
      return true;
    }
    const returnToTop = target.closest("#browse-return-top");
    if (returnToTop) {
      e.stopPropagation();
      this._scrollEventsToTop();
      return true;
    }
    const tick = target.closest("[data-tick]");
    if (tick) {
      this._open(tick.dataset.tick);
      return true;
    }
    return false;
  }
  _handlePrimaryListItemClick(e, target) {
    const mediaNavigationAction = target.closest(
      ".ico[data-popup-media-target]",
    );
    if (mediaNavigationAction) {
      e.stopPropagation();
      this._popupMediaLoaderController.showCarouselEventById(
        mediaNavigationAction.dataset.popupEventId,
        mediaNavigationAction.dataset.popupMediaTarget,
      );
      return true;
    }
    const dl = target.closest(".ico[data-dl]");
    if (dl) {
      e.stopPropagation();
      void this._frigateMediaDownloadController.downloadEvent(
        dl.dataset.dl,
        dl.dataset.dlFile,
      );
      return true;
    }
    const fav = target.closest("[data-fav]");
    if (fav) {
      e.stopPropagation();
      this._toggleFav(fav.dataset.fav);
      return true;
    }
    const revOpen = target.closest("[data-review-open]");
    if (revOpen) {
      const rid = revOpen.closest("[data-review-id]")?.dataset.reviewId;
      const review = rid ? this._findReviewById(rid) : null;
      this._popupMediaLoaderController.showClipById(
        revOpen.dataset.reviewOpen,
        {
          mediaType: "alert",
          startTime: review?.start_time,
          camera: review?.camera,
        },
      );
      return true;
    }
    return false;
  }
  _handleEventClick(target) {
    const card = target.closest("[data-ev]");
    if (!card) return false;
    this._open(card.dataset.ev);
    return true;
  }
  _setTab(tab) {
    const prevTab = this._tab;
    if (
      tab === "controls" &&
      prevTab !== "controls" &&
      this._toolbarButtonStates().controlsDisabled
    ) {
      this._syncToolbarButtons();
      return;
    }
    this._tab = tab;
    if (tab !== "controls") {
      this._lastNonControlsTab = tab;
    }
    this._pageShellRegionElements("tabs", "[data-tab]")
      .forEach((p) => p.classList.toggle("active", p.dataset.tab === tab));
    const filterBtn = this._pageShellRegionElement("tools", "#filter-btn");
    if (filterBtn)
      filterBtn.disabled = tab === "recordings" || tab === "controls";
    if (tab === "recordings" || tab === "controls") {
      const filterPanel = this._pageShellRegion("filterPanel");
      if (filterPanel) filterPanel.style.display = "none";
    } else {
      this._browseFilterController.normalizeFilterSelections();
      if (this._pageShellRegion("filterPanel")?.style.display !== "none") {
        this._renderFilter();
      }
    }
    this._syncBrowseHeadModeClass();
    this._syncToolbarButtons();
    this._renderListLabel();
    void this._loadTabData(tab);
    this._renderList();
    if (!this._shouldPreserveScrollOnTabSwitch(prevTab, tab)) {
      this._resetBrowseScrollTop();
    }
  }

  _shouldPreserveScrollOnTabSwitch(prevTab, nextTab) {
    if (!prevTab || !nextTab || prevTab === nextTab) return true;
    return (
      (prevTab === "clips" && nextTab === "snapshot") ||
      (prevTab === "snapshot" && nextTab === "clips")
    );
  }

  _availableNonControlsTabs() {
    const hidden = new Set(this._config?.hidden_tabs || []);
    const tabs =
      this._viewMode === "grid"
        ? ["alerts", "kept"]
        : ["alerts", "clips", "snapshot", "recordings", "kept"];
    return tabs.filter((tabId) => !hidden.has(tabId));
  }

  _resolveControlsReturnTab() {
    const available = this._availableNonControlsTabs();
    if (!available.length) return "alerts";
    if (available.includes(this._lastNonControlsTab)) {
      return this._lastNonControlsTab;
    }
    return available[0];
  }

  _resetBrowseScrollTop() {
    const list = this._pageShellRegionElement("browse", "#list");
    const browse = this._pageShellRegion("browse");
    if (list) list.scrollTop = 0;
    if (browse) browse.scrollTop = 0;
  }
  // ── playback ──────────────────────────────────────────────
  _allDisplayEvents() {
    return this._browseCollectionController.allDisplayEvents();
  }

  _findEventById(id) {
    return this._browseCollectionController.findEventById(id);
  }

  _setLiveMuted(muted) {
    this._streamMuted = !!muted;
    const eng = this._engine;
    if (!eng) return;

    const applyToVideo = (video) => {
      if (!video) return false;
      if (typeof video.muted === "boolean") video.muted = this._streamMuted;
      if (typeof video.defaultMuted === "boolean")
        video.defaultMuted = this._streamMuted;
      if (!this._streamMuted) {
        if (typeof video.volume === "number") video.volume = 1;
        video.play?.().catch(() => {});
      }
      return true;
    };

    if (typeof eng.muted === "boolean") eng.muted = this._streamMuted;
    if (typeof eng.defaultMuted === "boolean")
      eng.defaultMuted = this._streamMuted;
    if (eng.video && typeof eng.video.muted === "boolean")
      eng.video.muted = this._streamMuted;
    if (eng.video && typeof eng.video.defaultMuted === "boolean")
      eng.video.defaultMuted = this._streamMuted;
    if (!this._streamMuted && eng.video) {
      if (typeof eng.video.volume === "number") eng.video.volume = 1;
      eng.video.play?.().catch(() => {});
    }

    let v =
      eng.tagName?.toLowerCase() === "video"
        ? eng
        : eng.querySelector?.("video") ||
          eng.shadowRoot?.querySelector?.("video");
    if (!v) v = this._findVideoDeep(eng);
    applyToVideo(v);

    // Legacy live players can attach or replace their nested video slightly
    // after the host element is already running, so re-apply briefly.
    [120, 400, 900].forEach((delay) => {
      setTimeout(() => {
        if (eng !== this._engine) return;
        const liveVideo = this._findVideoDeep(eng);
        applyToVideo(liveVideo);
      }, delay);
    });
  }

  _renderMuteButton() {
    const buttons = [
      this._$("#mute-btn"),
      this._$("#mobile-view-mute-btn"),
      this._$("#two-way-talk-mute-btn"),
    ].filter(Boolean);
    if (!buttons.length) return;
    const talkActive = this._twoWayTalkActiveForCurrentCamera();
    const muted = this._resolveLiveMuteControlMuted();
    const label = talkActive
      ? muted
        ? "Unmute incoming audio"
        : "Mute incoming audio"
      : muted
        ? "Unmute live view"
        : "Mute live view";
    buttons.forEach((button) => {
      const inlineTalkMute = button.id === "two-way-talk-mute-btn";
      const hideMute =
        this._viewMode === "grid" || (inlineTalkMute && !talkActive);
      if (button.id === "mobile-view-mute-btn" || inlineTalkMute) {
        const audioEnabled = !muted;
        button.classList.toggle("active", audioEnabled);
        button.classList.toggle(
          "talk-audio-active",
          talkActive && audioEnabled,
        );
        button.setAttribute("aria-pressed", audioEnabled ? "true" : "false");
      }
      button.hidden = hideMute;
      button.style.display = hideMute ? "none" : "";
      if (hideMute) return;
      button.title = label;
      button.setAttribute("aria-label", label);
      button.innerHTML = muted ? ICONS.volOff : ICONS.volOn;
    });
  }

  _timezoneDisplay() {
    const tz = this._hass?.config?.time_zone || "UTC";
    try {
      const parts = this._dateFormatter(
        "timezone-name",
        undefined,
        { timeZoneName: "longGeneric" },
        tz,
      ).formatToParts(new Date());
      const tzName = parts.find((p) => p.type === "timeZoneName")?.value || tz;
      return `${tzName} (${tz})`;
    } catch (_) {
      return tz.replace(/_/g, " ");
    }
  }

  _applyLiveMuteChange(nextMuted, { source = "button" } = {}) {
    this._setLiveMuted(nextMuted);
    this._cameraGroupLiveController?.syncAudio?.();
    this._renderMuteButton();

    // HA direct live players can fail to start audio when the stream was
    // originally mounted muted. Apply the same recovery whether unmute came
    // from our button or native rotated-overlay controls.
    const nativeOverlayUnmute =
      source === "native-controls" && this._rotateOverlayActive;
    const needsHaDirectRecovery =
      this._useHaDirectStreamPath() &&
      !this._twoWayTalkActiveForCurrentCamera() &&
      !nextMuted &&
      (!nativeOverlayUnmute || this._engineMountedMuted);
    if (needsHaDirectRecovery) {
      this._mountEngine(null, { quiet: true });
      return;
    }
    if (!nextMuted) this._engineMountedMuted = false;
  }

  _toggleMute() {
    const nextMuted = !this._resolveLiveMuteControlMuted();
    this._applyLiveMuteChange(nextMuted, { source: "button" });
  }

  _syncFullscreenButtonsVisibility() {
    const liveBtn = this._$("#live-fs-btn");
    const popupControlsFsBtn = this._$("#popup-media-fs");
    const popupMobileFsBtn = this._$("#popup-mobile-fs-btn");
    const popupOpen = this._$("#myPopup")?.classList.contains("is-open");
    const isFullscreen = !!(
      document.fullscreenElement || document.webkitFullscreenElement
    );
    const inGridMode = this._viewMode === "grid";
    const pageId = normalizePageRoute(this._pageId);
    const visibility = resolveFullscreenButtonVisibility({
      popupOpen: !!popupOpen,
      isFullscreen,
      inGridMode,
      isMobileTabletViewport: this._isMobileTabletViewport(),
      showLiveFullscreenOnMobile:
        pageId === PAGE_IDS.singleView ||
        pageId === PAGE_IDS.mobileView ||
        pageId === PAGE_IDS.cardView,
    });
    if (liveBtn) {
      liveBtn.hidden = visibility.liveButtonHidden;
    }
    if (popupControlsFsBtn) {
      popupControlsFsBtn.hidden = visibility.popupControlsFullscreenHidden;
    }
    if (popupMobileFsBtn) {
      popupMobileFsBtn.hidden = visibility.popupMobileFullscreenHidden;
    }
    this._syncTakeSnapshotButtonVisibility();
  }

  _syncTakeSnapshotButtonVisibility() {
    const liveButton = this._$("#live-take-snapshot-btn");
    if (liveButton) liveButton.hidden = this._viewMode === "grid";
  }

  _open(id) {
    const ev =
      this._allDisplayEvents().find((e) => e.id === id) ||
      (this._tab === "kept"
        ? (this._kept || []).find((e) => e.id === id)
        : null);
    if (!ev) return;
    if (this._tab === "kept") {
      if (ev.has_clip) {
        this._popupMediaLoaderController.showClip(ev, {
          mediaType: "kept",
          displayMediaType: "clip",
        });
      } else {
        this._popupMediaLoaderController.showSnapshot(ev, {
          mediaType: "kept",
          displayMediaType: "snapshot",
        });
      }
      return;
    }
    if (this._tab === "snapshot" || (!ev.has_clip && ev.has_snapshot))
      this._popupMediaLoaderController.showSnapshot(ev);
    else if (ev.has_clip)
      this._popupMediaLoaderController.showClip(ev, {
        mediaType: this._tab === "kept" ? "kept" : "clip",
      });
    else this._popupMediaLoaderController.showSnapshot(ev);
  }
  _setLivePopupCover(covered) {
    const engWrap = this._$("#eng-wrap");
    if (!engWrap) return;
    engWrap.classList.toggle("popup-covered", !!covered);
  }
  _isTouchPopupUi() {
    return DEVICE_PROFILE.hasTouch || this._isMobileTabletViewport();
  }
  _isPopupVideoMediaType(mediaType) {
    return ["alert", "clip", "recording", "kept"].includes(
      String(mediaType || "").toLowerCase(),
    );
  }
  _usePopupCustomControls(mediaType) {
    return this._isPopupVideoMediaType(mediaType);
  }
  _livePictureInPictureVideo() {
    return (
      this._cameraGroupLiveController?.activeVideo?.() ||
      this._findVideoDeep(this._$("#engine")) ||
      this._findVideoDeep(this._engine) ||
      this._engine?.video ||
      null
    );
  }

  _displayedSnapshotMedia(scope = "live") {
    if (scope === "popup") {
      const viewer = this._$("#viewer");
      return (
        viewer?.querySelector?.("video") ||
        viewer?.querySelector?.("img.snap") ||
        null
      );
    }

    const fallback = this._$("#stream-fallback");
    if (fallback && !fallback.hidden) {
      const fallbackImage = fallback.querySelector?.(
        "#stream-fallback-img, img",
      );
      if (fallbackImage) return fallbackImage;
    }
    return this._livePictureInPictureVideo();
  }

  _displayedSnapshotCaptureOptions(scope, media) {
    const zoomController =
      scope === "popup"
        ? this._popupVideoZoomController
        : this._liveVideoZoomController;
    const activeZoomController =
      zoomController?.video === media ? zoomController : null;
    const computedStyle = globalThis.getComputedStyle?.(media) || null;
    return {
      viewport: activeZoomController?.viewport || null,
      zoomState: activeZoomController?.state || null,
      objectFit:
        computedStyle?.objectFit || media?.style?.objectFit || "contain",
    };
  }

  _showSnapshotResultBubble(scope, success) {
    const surface =
      scope === "popup" ? this._$("#viewer") : this._$("#live-stage");
    if (!surface) return;
    const existing = surface.querySelector?.(".snapshot-result-bubble");
    existing?.remove?.();
    const bubble = document.createElement("div");
    bubble.className = `snapshot-result-bubble ${success ? "success" : "failure"}`;
    bubble.textContent = success
      ? "Snapshot taken"
      : "Unable to take snapshot";
    surface.appendChild(bubble);

    const previousTimer = this._snapshotResultTimers?.[scope];
    if (previousTimer) clearTimeout(previousTimer);
    this._snapshotResultTimers[scope] = setTimeout(() => {
      bubble.remove?.();
      this._snapshotResultTimers[scope] = null;
    }, 1800);
  }

  async _takeDisplayedSnapshot(scope = "live") {
    const button = this._$(
      scope === "popup"
        ? "#popup-take-snapshot-btn"
        : "#live-take-snapshot-btn",
    );
    if (button?.disabled) return false;
    if (button) button.disabled = true;
    try {
      const groupedBlob =
        scope === "live"
          ? await this._cameraGroupLiveController?.captureDisplayedFrame?.()
          : null;
      const media = groupedBlob ? null : this._displayedSnapshotMedia(scope);
      if (!groupedBlob && !media) {
        throw new Error("Displayed media frame is not ready.");
      }
      const blob =
        groupedBlob ||
        (await captureDisplayedFrame(
          media,
          this._displayedSnapshotCaptureOptions(scope, media),
        ));
      const camera =
        scope === "popup"
          ? this._popupLifecycleController.mediaCamera() || this._cc().cam
          : this._cc().cam;
      downloadDisplayedFrame(
        blob,
        buildDisplayedFrameFilename({ camera }),
      );
      this._showSnapshotResultBubble(scope, true);
      return true;
    } catch (error) {
      console.warn("[Frigate] Displayed frame snapshot failed", error);
      this._showSnapshotResultBubble(scope, false);
      return false;
    } finally {
      if (button) button.disabled = false;
      if (scope === "popup") {
        this._popupMediaControlsController.showTemporarily();
      }
      else this._showLiveControlsTemporarily();
    }
  }

  _clearPictureInPictureButtonController(scope) {
    const property =
      scope === "popup"
        ? "_popupPictureInPictureButtonController"
        : "_livePictureInPictureButtonController";
    const controller = this[property];
    if (controller) {
      try {
        controller.dispose();
      } catch (_) {}
    }
    this[property] = null;
  }

  _bindPictureInPictureButton(scope, button, video) {
    const property =
      scope === "popup"
        ? "_popupPictureInPictureButtonController"
        : "_livePictureInPictureButtonController";
    const documentObj = video?.ownerDocument || globalThis.document || null;
    const current = this[property];
    if (current?.button === button && current?.video === video) {
      current.refresh();
      return;
    }

    this._clearPictureInPictureButtonController(scope);
    if (!button || !video) {
      if (button) {
        button.hidden = true;
        button.disabled = true;
      }
      return;
    }

    const controller = new PictureInPictureButtonController({
      button,
      video,
      documentObj,
    });
    this[property] = controller;
    controller.bind();
  }

  _syncPictureInPictureButtons() {
    const popupOpen =
      this._$("#myPopup")?.classList.contains("is-open") === true;
    const mobileTablet = this._isMobileTabletViewport();
    const isFirefox = this._isFirefox();
    const liveVideo = this._livePictureInPictureVideo();
    if (isFirefox) {
      disableNativePictureInPicture(liveVideo);
    } else {
      enableNativePictureInPicture(liveVideo);
    }
    const liveAllowed =
      !mobileTablet &&
      this._activePageShellCapabilities().hasLivePictureInPicture &&
      this._viewMode !== "grid" &&
      !popupOpen;
    this._bindPictureInPictureButton(
      "live",
      this._$("#live-pip-btn"),
      liveAllowed ? liveVideo : null,
    );

    const popupMediaType = this._popupLifecycleController.mediaType();
    const popupVideo = popupOpen
      ? this._popupMediaControlsController.video()
      : null;
    if (isFirefox) {
      disableNativePictureInPicture(popupVideo);
    } else {
      enableNativePictureInPicture(popupVideo);
    }
    const popupAllowed =
      !mobileTablet &&
      popupOpen &&
      this._isPopupVideoMediaType(popupMediaType);
    this._bindPictureInPictureButton(
      "popup",
      this._$("#popup-pip-btn"),
      popupAllowed ? popupVideo : null,
    );
  }

  async _togglePictureInPicture(video, { popup = false } = {}) {
    const documentObj = video?.ownerDocument || globalThis.document || null;
    const isFirefox = this._isFirefox();
    const support = resolveVideoPictureInPictureSupport({ video, documentObj });
    if (!support.supported) {
      this._toast("Picture-in-Picture is not supported for this video.");
      this._syncPictureInPictureButtons();
      return;
    }

    try {
      await toggleVideoPictureInPicture({
        video,
        documentObj,
        temporarilyAllowDisabled: isFirefox,
        resumePlaybackOnExit: isFirefox && !popup,
      });
    } catch (error) {
      console.warn("[Frigate] Picture-in-Picture request failed", error);
      const reason = String(error?.message || "").trim();
      this._toast(
        reason
          ? `Picture-in-Picture could not start: ${reason}`
          : "Picture-in-Picture could not start in this browser.",
      );
    } finally {
      this._syncPictureInPictureButtons();
      if (popup) this._popupMediaControlsController.showTemporarily();
    }
  }

  _showLiveControlsTemporarily(ms = 2200) {
    const wrap = this._$("#live-stage.live-stage--overlay");
    if (!wrap) return;
    wrap.classList.add("live-controls-visible");
    if (this._liveControlsHideTimer) clearTimeout(this._liveControlsHideTimer);
    this._liveControlsHideTimer = setTimeout(
      () => {
        const nextWrap = this._$("#live-stage.live-stage--overlay");
        nextWrap?.classList.remove("live-controls-visible");
        this._liveControlsHideTimer = null;
      },
      Math.max(500, Number(ms) || 2200),
    );
  }
  _media(id, file, dl) {
    return buildFrigateNotificationMediaPath({
      clientId: this._cc().clientId,
      eventId: id,
      file,
      download: dl,
    });
  }
  async _signed(path) {
    try {
      const r = await this._hass.callWS({
        type: "auth/sign_path",
        path,
        expires: 3600,
      });
      return r?.path || path;
    } catch (_) {
      return path;
    }
  }
  _receiverPlaybackBaseUrl() {
    return (
      this._hass?.config?.internal_url ||
      this._hass?.config?.external_url ||
      this._hass?.hassUrl?.("/") ||
      (typeof window !== "undefined" ? window.location.href : "")
    );
  }

  _playbackTargetContext(scope = "popup") {
    if (scope !== "popup") return null;

    const { clientId, cam } = this._cc();
    const mediaType = this._popupLifecycleController.mediaType();
    const playing = this._popupLifecycleController.playing();
    const eventId = playing?.id || "";
    const event = eventId ? this._findEventById(eventId) : null;
    const recordingRange = this._popupRecordingScrubController.range();
    const recordingStart =
      recordingRange?.start ?? playing?.rec ?? null;
    const recordingEnd = recordingRange?.end ?? null;
    return {
      scope,
      sourceKey:
        mediaType === "recording"
          ? `recording:${clientId}:${cam}:${recordingStart}:${recordingEnd}`
          : `${mediaType}:${clientId}:${eventId}`,
      mediaType,
      clientId,
      camera: event?.camera || cam,
      eventId,
      recordingStart,
      recordingEnd,
      eventRecordingStart: Number.isFinite(Number(event?.start_time))
        ? (playing?.eventRecordingStart ?? Math.floor(Number(event.start_time)))
        : null,
      eventRecordingEnd: Number.isFinite(Number(event?.end_time))
        ? (playing?.eventRecordingEnd ?? Math.ceil(Number(event.end_time)))
        : null,
      title: `${cap(mediaType || "video")} video`,
    };
  }

  async _resolvePlaybackTargetSource(context = {}) {
    const media = buildFrigateReceiverMediaPath(context);
    if (!media.ok) return media;
    const signedPath = await this._signed(media.path);
    const url = resolveAbsoluteReceiverSourceUrl(
      signedPath || media.path,
      this._receiverPlaybackBaseUrl(),
    );
    if (!url) {
      return {
        ok: false,
        message: "The receiver video URL could not be prepared.",
      };
    }
    return {
      ok: true,
      url,
      contentType: media.contentType,
      title: context.title,
      ttlMs: 30 * 60 * 1000,
    };
  }

  _preparePopupPlaybackTarget() {
    if (
      !this._isPopupVideoMediaType(
        this._popupLifecycleController.mediaType(),
      )
    ) {
      return;
    }
    void this._playbackTargetController.prepare("popup");
    this._syncPlaybackTargetButtons();
  }

  _findFullscreenVideo(el) {
    if (!el) return null;
    if (el.tagName?.toLowerCase() === "video") return el;

    const direct = el.querySelector?.("video");
    if (direct) return direct;

    const hosts = el.querySelectorAll?.(
      "ha-camera-stream,ha-hls-player,webrtc-camera",
    );
    if (hosts && hosts.length) {
      for (const h of hosts) {
        const v =
          h.shadowRoot?.querySelector("video") || h.querySelector?.("video");
        if (v) return v;
      }
    }

    return el.shadowRoot?.querySelector?.("video") || null;
  }

  _findVideoDeep(root, maxDepth = 7) {
    if (!root || maxDepth < 0) return null;
    if (root.tagName?.toLowerCase?.() === "video") return root;

    const direct = root.querySelector?.("video");
    if (direct) return direct;

    const kids = root.children ? Array.from(root.children) : [];
    for (const k of kids) {
      const v = this._findVideoDeep(k, maxDepth - 1);
      if (v) return v;
      if (k.shadowRoot) {
        const sv = this._findVideoDeep(k.shadowRoot, maxDepth - 1);
        if (sv) return sv;
      }
    }

    return null;
  }

  _fullscreen(el, opts = {}) {
    if (!el) return;
    let video = this._findFullscreenVideo(el);
    if (!video) video = this._findVideoDeep(el);
    if (!video && opts.preferLive) {
      video =
        this._findVideoDeep(this._$("#engine")) ||
        this._findVideoDeep(this._engine);
    }
    const iOS =
      /iPad|iPhone|iPod/.test(navigator.userAgent) ||
      (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);

    // iOS Safari often only supports fullscreen via the video element API.
    if (iOS && video) {
      const enterVideoFs =
        video.webkitEnterFullscreen || video.webkitEnterFullScreen;
      if (typeof enterVideoFs === "function") {
        if (opts.preferLive) {
          this._liveFullscreenLifecycleController?.beginNativeVideoFullscreen(
            video,
          );
        }
        try {
          enterVideoFs.call(video);
          return;
        } catch (_) {
          if (opts.preferLive) {
            this._liveFullscreenLifecycleController?.cancel();
          }
        }
      }
    }

    let reqTarget = el;
    let req = el.requestFullscreen || el.webkitRequestFullscreen;
    if (!req && video) {
      reqTarget = video;
      req = video.requestFullscreen || video.webkitRequestFullscreen;
    }
    if (typeof req === "function") {
      if (opts.preferLive) {
        this._liveFullscreenLifecycleController?.beginDocumentFullscreen(video);
      }
      try {
        const requestResult = req.call(reqTarget);
        if (opts.preferLive && requestResult?.catch) {
          requestResult.catch(() => {
            this._liveFullscreenLifecycleController?.cancel();
          });
        }
      } catch (_) {
        if (opts.preferLive) {
          this._liveFullscreenLifecycleController?.cancel();
        }
      }
    }
  }
  _frigateContextForCameraName(cameraName = "") {
    const target = String(cameraName || "").trim();
    if (!target) return null;
    for (const camera of flattenCameraMembers(this._config?.cameras)) {
      const context = this._camCache?.[camera.entity];
      if (
        String(context?.cam || "").trim() === target ||
        String(camera.entity || "").trim() === target
      ) {
        return context || null;
      }
    }
    return null;
  }
  _mediaForCamera(id, file, cameraName = "", dl = false) {
    const context = this._frigateContextForCameraName(cameraName) || this._cc();
    return buildFrigateNotificationMediaPath({
      clientId: context?.clientId || "",
      eventId: id,
      file,
      download: dl,
    });
  }
  _reviewThumbnailForCamera(review, cameraName = "") {
    const targetCamera = String(cameraName || review?.camera || "").trim();
    const context =
      this._frigateContextForCameraName(targetCamera) || this._cc();
    return buildFrigateReviewThumbnailPath({
      clientId: context?.clientId || "",
      reviewId: review?.id || "",
      camera: targetCamera,
    });
  }
  // ── favorites (realtime) ──────────────────────────────────
  _toggleFav(id) {
    const ev = this._findEventById(id);
    if (!ev) return;
    const activeEntity = this._activeCam?.entity || "";
    const eventContext = this._frigateContextForCameraName(ev?.camera);
    const eventEntity =
      flattenCameraMembers(this._config?.cameras).find(
        (camera) => this._camCache?.[camera.entity] === eventContext,
      )?.entity || activeEntity;
    const kept = this._camCache?.[eventEntity]?.kept || this._kept;
    const optimistic = buildFavoriteOptimisticMutation({
      id,
      event: ev,
      events: this._events,
      camCache: this._camCache,
      kept,
      activeEntity: eventEntity,
    });

    this._events = optimistic.events;
    this._camCache = optimistic.camCache;
    if (this._config?.favorites_mixed_cameras !== false) {
      this._kept = this._allGridKeptEvents().sort(
        (left, right) =>
          Number(right?.start_time || 0) - Number(left?.start_time || 0),
      );
    } else if (eventEntity === activeEntity) {
      this._kept = optimistic.kept;
    }
    this._renderList();
    const { clientId } = eventContext || this._cc();
    this._hass
      .callWS({
        type: "frigate/event/retain",
        instance_id: clientId,
        event_id: id,
        retain: optimistic.nextRetained,
      })
      .catch((err) => {
        const rollback = buildFavoriteRollbackMutation({
          id,
          event: ev,
          previousRetained: optimistic.previousRetained,
          events: this._events,
          camCache: this._camCache,
          kept,
          activeEntity: eventEntity,
        });
        this._events = rollback.events;
        this._camCache = rollback.camCache;
        if (this._config?.favorites_mixed_cameras !== false) {
          this._kept = this._allGridKeptEvents().sort(
            (left, right) =>
              Number(right?.start_time || 0) - Number(left?.start_time || 0),
          );
        } else if (eventEntity === activeEntity) {
          this._kept = rollback.kept;
        }
        this._renderList();
        console.warn("[Frigate] retain failed", err);
        this._toast("Could not save — check Frigate port config.");
      });
  }
  // ── browse / filter ───────────────────────────────────────
  _applyBrowse() {
    const b = this._pageShellRegion("browse");
    if (b) b.style.display = "flex";
  }
  _toggleBrowse() {
    this._browseOpen = !this._browseOpen;
    this._applyBrowse();
  }
  _toast(msg, ms = 3500) {
    const t = this._$("#toast");
    if (!t) return;
    t.textContent = msg;
    t.style.display = "block";
    clearTimeout(this._toastT);
    this._toastT = setTimeout(() => {
      t.style.display = "none";
    }, ms);
  }
  _toggleFilter() {
    this._browseFilterController.toggleFilter();
  }
  _toggleCal() {
    this._browseCalendarPanelController.toggleCalendar();
  }
  // ── calendar ──────────────────────────────────────────────
  _formatTzDateString(parts) {
    return this._browseCalendarPanelController.formatTzDateString(parts);
  }
  _calendarTodayDateString() {
    return this._browseCalendarPanelController.calendarTodayDateString();
  }
  _activeCalendarDayDateString() {
    return this._browseCalendarPanelController.activeCalendarDayDateString();
  }
  _goTodayInCalendar() {
    this._browseCalendarPanelController.goTodayInCalendar();
  }
  _resetCalendarSelection() {
    this._browseCalendarPanelController.resetCalendarSelection();
  }
  _createCalendarMonthDate(year, monthIndex) {
    return this._browseCalendarPanelController.createCalendarMonthDate(
      year,
      monthIndex,
    );
  }
  _resolveCalendarMonthDate() {
    return this._browseCalendarPanelController.resolveCalendarMonthDate();
  }
  _calNav(d) {
    this._browseCalendarPanelController.calNav(d);
  }
  _pickDay(ds) {
    this._browseCalendarPanelController.pickDay(ds);
  }
  _renderCal() {
    this._browseCalendarPanelController.renderCal();
  }
  _renderFilter() {
    this._browseFilterController.renderFilter();
  }
  // ── render ────────────────────────────────────────────────
  _syncStatus() {
    this._activeStandardPageController().syncStatus();
  }
  // Cached querySelector — avoids repeated DOM lookups on every render tick
  _$(sel) {
    const cached = this._domCache[sel];
    if (cached?.isConnected) return cached;
    const next = this.shadowRoot.querySelector(sel);
    this._domCache[sel] = next;
    return next;
  }
  _pageShellRegion(regionKey) {
    const regionName = PAGE_SHELL_REGIONS[regionKey];
    if (!regionName) return null;
    return this._$(`[data-fvc-region="${regionName}"]`);
  }
  _pageShellRegionElement(regionKey, selector) {
    return this._pageShellRegion(regionKey)?.querySelector?.(selector) || null;
  }
  _pageShellRegionElements(regionKey, selector) {
    return (
      this._pageShellRegion(regionKey)?.querySelectorAll?.(selector) || []
    );
  }
  _renderAll() {
    if (this._isPreviewPageActive()) {
      this._renderPreviewPage();
      return;
    }
    this._syncTwoWayTalkRuntimeState();
    this._renderStats();
    this._renderMuteButton();
    this._syncTwoWayTalkButton();
    this._linkedLightController?.sync?.();
    this._syncFullscreenButtonsVisibility();
    this._syncPictureInPictureButtons();
    this._syncToolbarButtons();
    this._syncPlaybackTargetButtons();
    this._renderLegend();
    this._renderSubtitle();
    this._renderCamSwitcher();
    this._renderList();
    this._syncStatus();
    this._wideViewPageController.renderCompanionCameras();
  }
  _renderStats() {
    this._activeStandardPageController().renderStats();
  }

  _titleText() {
    return (
      this._activeStandardPageController().titleText?.() ||
      this._config.title ||
      DEFAULT_TITLE
    );
  }

  _subtitleText() {
    return this._activeStandardPageController().subtitleText();
  }

  _renderSubtitle() {
    this._activeStandardPageController().renderSubtitle();
  }

  _renderLegend() {
    this._activeStandardPageController().renderLegend();
  }
  _time(ts) {
    return this._dateFormatter("time", [], {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    })
      .format(new Date(ts * 1000))
      .toLowerCase();
  }
  _weekday(ts) {
    return this._dateFormatter("weekday", "en-US", {
      weekday: "short",
    }).format(new Date(ts * 1000));
  }
  _monthDay(ts, { ordinal = false, numeric = false } = {}) {
    const parts = this._dateFormatter(
      numeric ? "month-day-numeric" : "month-day",
      "en-US",
      {
        month: numeric ? "numeric" : "short",
        day: "numeric",
      },
    ).formatToParts(new Date(ts * 1000));
    const month = parts.find((p) => p.type === "month")?.value || "";
    const day = Number(parts.find((p) => p.type === "day")?.value || 0);
    if (numeric) return `${month}/${day}`;
    return `${month} ${ordinal ? this._ordinal(day) : day}`.trim();
  }
  _ordinal(n) {
    const mod100 = n % 100;
    if (mod100 >= 11 && mod100 <= 13) return `${n}th`;
    const mod10 = n % 10;
    if (mod10 === 1) return `${n}st`;
    if (mod10 === 2) return `${n}nd`;
    if (mod10 === 3) return `${n}rd`;
    return `${n}th`;
  }
  _dateTimeLabel(ts) {
    return `${this._weekday(ts)} - ${this._monthDay(ts)} - ${this._time(ts)}`;
  }
  _listHeadingLabel(ts = null) {
    return this._activeStandardPageController().listHeadingLabel(ts);
  }

  _showStickyDayHeaders() {
    return this._activeStandardPageController().showStickyDayHeaders();
  }

  _renderListLabel(ts = null) {
    this._activeStandardPageController().renderListLabel(ts);
  }
  _dayKey(ts) {
    const parts = this._dateFormatter("day-key", "en-US", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).formatToParts(new Date(ts * 1000));
    const pick = (type) => parts.find((p) => p.type === type)?.value || "00";
    return `${pick("year")}-${pick("month")}-${pick("day")}`;
  }
  _calendarMonthLabel(monthDate, timeZone = this._tz()) {
    return this._dateFormatter(
      "calendar-month",
      [],
      { month: "long", year: "numeric" },
      timeZone,
    ).format(monthDate);
  }
  _renderStickyDaySections(items, renderItem) {
    return this._activeStandardPageController().renderStickyDaySections(
      items,
      renderItem,
    );
  }

  _renderEventsContent(items) {
    return this._activeStandardPageController().renderEventsContent(items);
  }

  _renderKeptContent(items) {
    return this._activeStandardPageController().renderKeptContent(items);
  }

  _renderReviewsContent(items) {
    return this._activeStandardPageController().renderReviewsContent(items);
  }

  _syncBrowseHeadFromScroll() {
    this._activeStandardPageController().syncBrowseHeadFromScroll();
  }

  _syncOlderHint(forceHide = null) {
    this._activeStandardPageController().syncOlderHint(forceHide);
  }
  _dur(ev) {
    return Math.max(
      1,
      Math.round((ev.end_time || Date.now() / 1000) - ev.start_time),
    );
  }
  _eventMediaDuration(ev) {
    const range = resolveFrigateEventPrePostRollRange({
      event: ev,
      enabled: this._config?.event_pre_post_roll_enabled === true,
    });
    return range?.durationSec ?? this._dur(ev);
  }
  _eventCardHTML(ev, expanded, compact = false) {
    const showDownloadButtons = !(
      this._isLikelyMobileClient() &&
      ["alerts", "clips", "snapshot"].includes(this._tab)
    );
    const fallbackReview =
      this._browseCollectionController?.findReviewForEvent?.(ev) || null;
    const model = buildEventListItemModel(ev, {
      cap,
      labelColor,
      icons: ICONS,
      media: (id, file) =>
        this._mediaForCamera(id, file, ev?.camera),
      durationLabel: (value) => this._eventMediaDuration(value),
      formatTime: (ts) => this._time(ts),
      formatDay: (ts) => `${this._weekday(ts)} ${this._monthDay(ts)}`,
      isKeptTab: this._tab === "kept",
      browseTab: this._tab,
      showDownloadButtons,
      showDurationBadge: this._tab !== "snapshot",
      fallbackThumbSrc: fallbackReview
        ? this._reviewThumbnailForCamera(fallbackReview, ev?.camera)
        : "",
      showCameraLabel:
        (this._eventsMode === "all" ||
          this._isGridMixedListMode() ||
          isCameraGroup(this._activeCam)) &&
        flattenCameraMembers(this._config.cameras).length > 1,
    });
    return buildEventListItemHtml(model, {
      icons: ICONS,
      expanded,
      compact,
    });
  }

  _setListHtmlIfChanged(list, html) {
    return this._activeStandardPageController().setListHtmlIfChanged(
      list,
      html,
    );
  }

  _renderList() {
    this._activeStandardPageController().renderList();
  }

  _renderControlsSection(list) {
    void this._ensureActiveCameraPtzInfo();
    this._renderListLabel();
    const ptzInfo = this._activeCameraPtzInfo();
    const ptzConfigured = hasCameraPtz(this._activeCam);
    const panTiltEnabled = ptzConfigured && hasPtzPanTiltCapability(ptzInfo);
    const zoomEnabled = ptzConfigured;
    const presetItems = ptzConfigured
      ? normalizePtzPresetNames(ptzInfo).map((name) => ({
          name,
          isHome: isPtzHomePreset(name),
        }))
      : [];
    this._setListHtmlIfChanged(
      list,
      buildControlsSectionMarkup({
        panTiltEnabled,
        zoomEnabled,
        presetItems,
      }),
    );
  }

  _activeCameraPtzInfo() {
    return this._cc().ptzInfo || null;
  }

  async _ensureActiveCameraPtzInfo() {
    const entity = this._activeCam?.entity;
    if (!entity || !this._isControlsButtonVisible()) return null;
    return this._ensurePtzInfoForEntity(entity);
  }

  async _ensurePtzInfoForEntity(entity) {
    const targetEntity = String(entity || "").trim();
    if (!targetEntity) return null;
    if (!this._camCache[targetEntity]) {
      this._camCache[targetEntity] = mkCamState();
    }
    const cache = this._camCache[targetEntity];
    if (cache.ptzInfoFetched) return cache.ptzInfo;
    if (cache.ptzInfoPromise) return cache.ptzInfoPromise;

    await this._discoverOne(targetEntity);
    if (!cache.discovered || !cache.clientId || !cache.cam) {
      cache.ptzInfoFetched = true;
      return null;
    }

    cache.ptzInfoPromise = (async () => {
      try {
        const result = await this._ws({
          type: "frigate/ptz/info",
          instance_id: cache.clientId,
          camera: cache.cam,
        });
        cache.ptzInfo = Array.isArray(result)
          ? result[0] || null
          : result || null;
      } catch (error) {
        console.warn("[Frigate] PTZ info fetch failed", error);
        cache.ptzInfo = null;
      } finally {
        cache.ptzInfoFetched = true;
        cache.ptzInfoPromise = null;
        this._camCache[targetEntity] = cache;
        if (
          this._tab === "controls" &&
          this._activeCam?.entity === targetEntity
        ) {
          this._renderList();
        }
      }
      return cache.ptzInfo;
    })();

    return cache.ptzInfoPromise;
  }

  async _handleCirclePadPtzEvent(event, eventType) {
    if (!isPtzControlsPadEvent(event)) return;
    await this._handlePtzAction(event?.detail?.action, eventType);
  }

  async _handlePtzAction(action, eventType) {
    const displayZoomPlan = resolvePtzDisplayZoomPlan({
      camera: this._activeCam,
      action,
      eventType,
    });
    if (displayZoomPlan) {
      if (displayZoomPlan.delta) {
        this._attachMainLiveVideoZoom(this._engine);
        this._liveVideoZoomController?.zoomBy?.(displayZoomPlan.delta);
      }
      return;
    }

    if (isPtzDirectionAction(action)) {
      if (eventType === "press") {
        await this._ptzMotionController?.start?.(action);
      } else if (eventType === "release") {
        await this._stopPtzMotion("control-release");
      }
      return;
    }

    const context = await this._resolvePtzMotionContext();
    if (!context) return;
    try {
      await this._executePtzCameraAction({
        ...context,
        action,
        eventType,
      });
    } catch (error) {
      console.warn("[Frigate] PTZ action failed", { action, eventType }, error);
    }
  }

  async _handlePtzPreset(presetName, button = null) {
    const preset = String(presetName || "").trim();
    if (!preset) return;

    if (button) {
      button.disabled = true;
      button.classList?.add?.("is-activating");
      button.setAttribute?.("aria-busy", "true");
    }
    try {
      const context = await this._resolvePtzMotionContext();
      if (!context) return;
      await this._executePtzCameraAction({
        ...context,
        action: "preset",
        eventType: "press",
        argument: preset,
      });
    } catch (error) {
      console.warn("[Frigate] PTZ preset failed", { preset }, error);
    } finally {
      if (button && button.isConnected !== false) {
        button.disabled = false;
        button.classList?.remove?.("is-activating");
        button.removeAttribute?.("aria-busy");
      }
    }
  }

  async _resolvePtzMotionContext() {
    const activeCamera = this._activeCam;
    const entity = String(activeCamera?.entity || "").trim();
    if (!entity) return null;
    const camera = {
      ...activeCamera,
      ...(activeCamera?.ptz && typeof activeCamera.ptz === "object"
        ? { ptz: { ...activeCamera.ptz } }
        : {}),
    };
    const ptzInfo =
      this._activeCameraPtzInfo() ||
      (await this._ensureActiveCameraPtzInfo());
    if (String(this._activeCam?.entity || "").trim() !== entity) return null;
    return { camera, ptzInfo };
  }

  async _executePtzCameraAction({
    camera,
    ptzInfo,
    action,
    eventType,
    argument = null,
  }) {
    const plan = resolvePtzServicePlan({
      camera,
      ptzInfo,
      action,
      eventType,
      argument,
    });
    if (!plan) return;

    const executeRequest = async (request) => {
      if (request?.type !== "home_assistant_service") {
        throw new Error(
          `Unsupported PTZ request type: ${request?.type || "unknown"}`,
        );
      }
      if (typeof this._hass?.callService !== "function") {
        throw new Error("Home Assistant PTZ service is unavailable");
      }

      return this._hass.callService(
        request.domain,
        request.service,
        request.serviceData,
        request.target,
      );
    };

    if (plan.executionMode === "parallel") {
      await Promise.all(plan.requests.map((request) => executeRequest(request)));
    } else {
      for (let index = 0; index < plan.requests.length; index += 1) {
        await executeRequest(plan.requests[index]);
      }
    }
  }

  _stopPtzMotion(reason = "release") {
    this._activePtzButtonAction = "";
    this._activePtzButtonPointerId = null;
    return this._ptzMotionController?.stop?.(reason) || Promise.resolve();
  }

  async _handlePtzControlPointerDown(event) {
    const button = event.target?.closest?.("[data-ptz-control]");
    if (!(button instanceof HTMLButtonElement) || button.disabled) return;

    const action = String(button.dataset.ptzControl || "").trim();
    if (!action) return;

    event.preventDefault();
    this._activePtzButtonAction = action;
    this._activePtzButtonPointerId =
      typeof event.pointerId === "number" ? event.pointerId : null;

    try {
      button.setPointerCapture?.(event.pointerId);
    } catch (_) {}

    await this._handlePtzAction(action, "press");
  }

  async _handlePtzControlPointerStop(event) {
    if (!this._activePtzButtonAction) return;
    if (
      typeof event.pointerId === "number" &&
      this._activePtzButtonPointerId != null &&
      event.pointerId !== this._activePtzButtonPointerId
    ) {
      return;
    }

    const action = this._activePtzButtonAction;
    this._activePtzButtonAction = "";
    this._activePtzButtonPointerId = null;
    await this._handlePtzAction(action, "release");
  }

  _reviewListItemHTML(
    review,
    {
      cameraAware = false,
      showDownloadButtons = !this._isLikelyMobileClient(),
      showFavoriteButton = true,
    } = {},
  ) {
    const resolveCameraMedia =
      cameraAware || isCameraGroup(this._activeCam);
    const model = buildReviewListItemModel(review, {
      cap,
      icons: ICONS,
      resolveSourceEvent: (value) =>
        this._browseFilterController.reviewSourceEvent(value),
      findEventById: (id) => this._findEventById(id),
      media: (id, file) =>
        resolveCameraMedia
          ? this._mediaForCamera(id, file, review?.camera)
          : this._media(id, file),
      durationLabel: (value) => this._eventMediaDuration(value),
      formatTime: (ts) => this._time(ts),
      formatDay: (ts) => `${this._weekday(ts)} ${this._monthDay(ts)}`,
      labelColor,
      fallbackThumbSrc: this._reviewThumbnailForCamera(
        review,
        review?.camera,
      ),
      showDownloadButtons,
      showFavoriteButton,
    });
    return buildReviewListItemHtml(model, { cap, icons: ICONS });
  }
}
