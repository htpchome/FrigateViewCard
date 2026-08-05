import {
  VERSION,
  CARD_TAG,
  DAY,
  RECORDINGS_WINDOW,
  EVENT_FETCH_BATCH,
  INITIAL_EVENT_FETCH_LIMIT,
  INACTIVE_WARM_EVENT_LIMIT,
  REVIEW_FETCH_BATCH,
  WINDOW_FETCH_PAGE_LIMIT,
  INITIAL_EVENTS_PAGE_LIMIT,
  WINDOW_BACKGROUND_PAGE_LIMIT,
  REALTIME_HEAD_POLL_MS,
  REALTIME_RELOAD_DEBOUNCE_MS,
  REALTIME_POLL_OPTIONS_SECONDS,
  MOBILE_BATTERY_SAVER_POLL_SECONDS,
  SLIDESHOW_ROTATION_OPTIONS_SECONDS,
  GRID_ROTATION_OPTIONS_SECONDS,
  SLIDESHOW_ALERT_HOLD_MS,
  SLIDESHOW_REVIEW_FRESHNESS_GRACE_SEC,
  SLIDESHOW_REVIEW_WATCH_MIN_MS,
  SLIDESHOW_REVIEW_WATCH_MAX_MS,
  PREVIEW_ALERT_HOLD_MS,
  PREVIEW_ALERT_END_GRACE_MS,
  MSE_SWITCH_GRACE_MS,
  MSE_SWITCH_GRACE_MAX,
  MAX_CAMERAS,
  DEFAULT_CAMERA_CONNECTION_TYPE,
  ALLOWED_HIDDEN_TABS,
  THEME_DEFAULTS,
  THEME_CUSTOM_ROWS,
  THEME_CUSTOM_KEYS,
} from "../constants.js";
import { ICONS } from "../icons.js";
import { STYLES } from "../styles.js";
import "../components/circle-pad/circle-pad.js";
import {
  detectDeviceProfile,
  DEVICE_PROFILE,
  isIOS,
  isAndroid,
  cap,
  parseWs,
  normalizePositiveInteger,
  normalizeCameraConnectionType,
  normalizeDisableHlsDesktop,
  normalizeHexColor,
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
  createNavigationFactory,
  getEnabledPageRoutes,
  normalizePageRoute,
  PAGE_IDS,
  resolveDeviceRouteBucket,
} from "../router.js";
import { applyEditorPreviewDraftToCardConfig } from "../config/preview-mapper.js";
import {} from "../integrations/frigate/url.js";
import {
  discoverFrigateCameraState,
  resolveCameraConnectionType,
  resolveCameraDisableHlsDesktop,
  resolveGo2RtcEntity,
  shouldUseGo2RtcForEntity,
} from "../integrations/frigate/camera-context.js";
import { createGo2RtcResolver } from "../integrations/frigate/go2rtc-resolver.js";
import { createGo2RtcMounter } from "../features/live/go2rtc-mounter.js";
import {
  invalidateMountTrackingIfActive,
  isLiveVideoStale,
  resolveLiveKickIfStaleAction,
  resolveLiveKickProbeState,
  resolveLiveResumeAction,
} from "../features/live/mount-lifecycle.js";
import {
  adoptMountedAttemptResult,
  adoptMountedAttemptSlot,
  isMountTokenCurrent,
} from "../features/live/mount-result.js";
import {
  applyActiveStreamTypeForCard,
  applyStreamFallbackVisibilityForCard,
  applyStreamLoadingStateForCard,
} from "../features/live/stream.state.js";
import {
  resolveRotateOverlayExitPlan,
  resolveFullscreenButtonVisibility,
  resolveRotateOverlayNativeControlsPlan,
  resolveRotateOverlayState,
  resolveRotateOverlayUiPlan,
  resolveRotateOverlayViewportVariables,
} from "../features/live/rotate-overlay-state.js";
import {
  buildVideoOptionsForView,
  configureVideoElement,
  createVideoElement,
  mountNodeIntoSlot,
  setScopedVideoViewDefaultOptions,
  supportsNativeHlsPlayback,
} from "../shared/media/video-factory.js";
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
import { GridMediaController } from "../features/grid/media.ctrl.js";
import {
  buildControlsSectionMarkup,
  buildControlsReadoutEmptyMarkup,
  buildControlsReadoutLinesMarkup,
  buildInfoRowMarkup,
  buildLiveEngineWrapMarkup,
  buildMainLayoutShellMarkup,
  buildPageNavMarkup,
  buildPopupShellMarkup,
  buildRightColumnShellMarkup,
  buildTabsMarkup,
} from "./controls/shell-nav.tmpl.js";
import {
  buildCalendarPanelMarkup,
  buildFilterPanelMarkup,
} from "./controls/calendar-filter.tmpl.js";
import {
  buildFavoriteOptimisticMutation,
  buildFavoriteRollbackMutation,
} from "../shared/favorite-mutation.js";
import { ListScrollController } from "../features/list/scroll.ctrl.js";
import { LiveOverlayControlsController } from "./controls/live-overlay.ctrl.js";
import { PopupDragController } from "./popup/drag.ctrl.js";
import { PopupMediaControlsController } from "./popup/media.ctrl.js";
import {
  buildPopupClipRenderPlan,
  buildPopupMediaUrl,
  buildPopupMediaControlState,
  buildPopupRecordingRenderPlan,
  buildPopupRecordingScrubInitPlan,
  buildPopupRecordingSourceAttemptPlan,
  buildPopupSnapshotRenderPlan,
  resolvePopupMediaPostRenderPlan,
  resolvePopupMediaRenderPlan,
  resolvePopupRecordingSeekListenerPlan,
  resolvePopupRecordingLoadOutcomePlan,
  resolvePopupMediaControlsInitPlan,
  resolvePopupMediaControlsListenerPlan,
  resolvePopupMediaSeekTarget,
} from "./popup/media.js";
import {
  buildPopupCarouselItemMarkup,
  buildPopupCarouselContentPlan,
  buildPopupCarouselEvents,
  buildPopupCarouselScrollPlan,
  resolvePopupCarouselActiveScrollLeft,
  resolvePopupCarouselRenderPlan,
  shouldShowPopupCarousel,
} from "./popup/carousel.js";
import { BrowseCollectionController } from "../features/browse/collection.ctrl.js";
import { BrowseFilterController } from "../features/browse/filter-state.js";
import { BrowseWindowLoaderController } from "../features/browse/window-loader.ctrl.js";
import {
  buildRecordingPlaybackPlan,
  RecordingScrubController,
  buildRecordingScrubDecorations,
  buildPreparedRecordingsDayResult,
  buildRecordingsDayCacheKey,
  buildRecordingsListMarkup,
  RecordingsSwipeController,
  createRecordingsSwipeGestureState,
  formatRecordingScrubTime,
  isRecordingSeekTargetInRange,
  isRecordingSeekVerified,
  normalizeFetchedRecordingsAvailability,
  RECORDINGS_SWIPE_EMPTY_HTML,
  RECORDINGS_SWIPE_LOADING_HTML,
  resolveCachedRecordingsAvailability,
  resolveCommittedRecordingsDayState,
  resolveFailedRecordingsAvailabilityState,
  resolveFetchedRecordingsAvailabilityState,
  resolveFailedRecordingsSwipeState,
  resolveClosestRecordingAlertStart,
  resolveRecordingSeekExecutionPlan,
  resolvePreparedRecordingsDayNavigationState,
  resolveOffsetRecordingsDayBounds,
  resolvePreparedRecordingsDayTransition,
  resolvePreparedRecordingsIncomingState,
  resolvePreparedRecordingsSwipeState,
  resolveRecordingScrubTarget,
  resolveRecordingSeekOutcome,
  resolveRecordingSeekTimeout,
  resolveRecordingsBrowseNavContextState,
  resolveRecordingsBrowseNavProbePlan,
  resolveRecordingsBrowseNavState,
  resolveRecordingsDayBounds,
  resolveRecordingsSwipeStageMetrics,
  resolveRecordingsSwipeStageTransforms,
  splitRecordingsHourly,
} from "../features/recordings/index.js";
import {
  appendControlsReadoutLine,
  clearControlsReadoutLines,
  isControlsPadTarget,
  isControlsReadoutClearTarget,
  resolveControlsPadToggleReadoutEntry,
  resolveControlsReadoutMarkup,
} from "./controls/readout.js";
import {
  canCameraUsePtz,
  hasCameraPtz,
  hasPtzFocusCapability,
  hasPtzPanTiltCapability,
  hasPtzZoomCapability,
  resolvePtzServicePlan,
  resolvePtzEmptyStateMessage,
} from "../shared/ptz.js";
import {
  buildReviewListItemHtml,
  buildReviewListItemModel,
} from "../data/review-list.model.js";
import {
  buildEventListItemHtml,
  buildEventListItemModel,
} from "../data/event-list.model.js";
import {
  applyListMarkupWithOlderHint,
  appendEndMarker,
  createOlderHintSyncer,
  resolveActiveListScroller,
  resolveActiveDayLabelFromScroll,
  resolveListLabelTimestamp,
  resolveListMarkup,
  runListPostRenderSync,
  syncOlderHintFromScroll,
} from "../shared/list-render.js";
import { PreviewAlertController } from "../features/preview/alert.ctrl.js";
import { PreviewPageController } from "../features/preview/page.ctrl.js";
import { PageNavigationController } from "../navigation/page-navigation.ctrl.js";
import { DeepLinkController } from "../navigation/deep-link.ctrl.js";
import { GridAlertController } from "../features/grid/alert.ctrl.js";
import { GridPageController } from "../features/grid/page.ctrl.js";
import { CardStyleContextController } from "../features/card-style/context.ctrl.js";
import { EditorPreviewContextController } from "../features/editor-preview/context.ctrl.js";
import { PopupMediaLoaderController } from "../features/popup/media-loader.ctrl.js";
import { ViewportContextController } from "../features/viewport/context.ctrl.js";
import { MobileViewPageController } from "../features/mobile-view/page.ctrl.js";
import { buildMobileViewInfoRowMarkup } from "../features/mobile-view/page.tmpl.js";
import { SingleViewPageController } from "../features/single-view/page.ctrl.js";
import { WideViewPageController } from "../features/wide-view/page.ctrl.js";
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
    this._controlsReadoutLines = [];
    this._onCirclePadPress = (event) => {
      void this._handleCirclePadPtzEvent(event, "press");
    };
    this._onCirclePadRelease = (event) => {
      void this._handleCirclePadPtzEvent(event, "release");
    };
    this._onCirclePadToggle = (event) => {
      const entry = resolveControlsPadToggleReadoutEntry(event);
      if (!entry) return;
      this._appendControlsReadoutEntry(entry);
    };
    this._onPtzControlPointerDown = (event) => {
      void this._handlePtzControlPointerDown(event);
    };
    this._onPtzControlPointerStop = (event) => {
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
      "circle-pad-toggle",
      this._onCirclePadToggle,
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
    this._hass = null;
    this._lastHassCameraStateSignature = "";
    this._lastHassThemeSignature = "";
    this._config = null;
    this._navigationFactory = null;
    this._pageId = PAGE_IDS.singleView;
    this._lastNonPreviewPageId = PAGE_IDS.singleView;
    this._started = false;
    this._activeCamIdx = 0;
    this._camCache = {};
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
      assignCommittedEngine: (engine) => {
        this._engine = engine;
      },
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
      assignCommittedEngine: (engine) => {
        this._engine = engine;
      },
      applyResolvedStreamUiState: (streamState) =>
        this._applyResolvedStreamUiState(streamState),
      setLiveNativeControls: (enabled) => this._setLiveNativeControls(enabled),
    });
    this._go2rtcRaceMounter = createGo2RtcRaceMounter({
      mounter: this._go2rtcMounter,
      isDesktop: DEVICE_PROFILE.isDesktop,
      resolveConnectionType: (entity) => this._cameraConnectionType(entity),
      disableHlsDesktopForEntity: (entity) =>
        this._cameraDisableHlsDesktop(entity),
      getPendingMountDestroyers: () => this._pendingMountDestroyers || [],
      setPendingMountDestroyers: (pendingDestroyers) => {
        this._pendingMountDestroyers = pendingDestroyers;
      },
      isMountTokenCurrent: (mountToken) =>
        isMountTokenCurrent({ mountToken, mountSeq: this._mountSeq }),
      adoptMountedAttempt: (slot, winner) =>
        adoptMountedAttemptResult({
          targetSlot: slot,
          result: winner,
          streamMuted: this._streamMuted,
          rotateOverlayActive: this._rotateOverlayActive,
          assignEngine: (engine) => {
            this._engine = engine;
          },
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
    this._playing = null;
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
    this._singleViewPageController = new SingleViewPageController(this, {
      PAGE_IDS,
    });
    this._wideViewPageController = new WideViewPageController(this, {
      PAGE_IDS,
    });
    this._pageNavigationController = new PageNavigationController(this, {
      buildPageNavMarkup,
      createNavigationFactory,
      getEnabledPageRoutes,
      normalizePageRoute,
      PAGE_IDS,
    });
    this._deepLinkController = new DeepLinkController(this);
    this._slideshowAlertController = new SlideshowAlertController(this, {
      DAY,
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
    this._previewPageController = new PreviewPageController(this, { PAGE_IDS });
    this._browseCollectionController = new BrowseCollectionController(this);
    this._browseFilterController = new BrowseFilterController(this);
    this._browseWindowLoaderController = new BrowseWindowLoaderController(this);
    this._cardStyleController = new CardStyleContextController(this);
    this._editorPreviewController = new EditorPreviewContextController(this);
    this._popupMediaLoaderController = new PopupMediaLoaderController(this);
    this._viewportContextController = new ViewportContextController(this);
    this._domCache = {};
    this._fallbackImgUrlCache = new Map();
    this._fallbackReqId = 0;
    this._eventsLoadToken = 0;
    this._reviewsLoadToken = 0;
    this._warmCamsToken = 0;
    this._warmOtherCamsDelayT = null;
    this._reloadPending = false;
    this._reloadAfterLoad = false;
    this._realtimeHeadPollT = null;
    this._switchLoadT = null;
    this._listScrollController = null;
    this._popupDragController = null;
    this._popupMediaCleanup = null;
    this._popupMediaType = "";
    this._popupMediaStopTimer = null;
    this._popupMediaControlsController = null;
    this._popupControlsHideTimer = null;
    this._liveControlsHideTimer = null;
    this._liveOverlayControlsController = null;
    this._recordingScrubController = null;
    this._recordingScrubState = null;
    this._recordingAlertCache = new Map();
    this._recordingsDayAvailabilityCache = new Map();
    this._recordingsDayDataCache = new Map();
    this._recordingsNavUpdateToken = 0;
    this._recordingsDayNavAnimating = false;
    this._recordingsSwipeGesture = null;
    this._recordingsSwipeBlockTap = false;
    this._recordingsSwipeController = null;
    this._recordingHls = null;
    this._hlsJsCtorPromise = null;
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
      setEngine: (engine) => {
        this._engine = engine;
      },
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
      cancelPendingMount: (reason, options) =>
        this._cancelPendingMount(reason, options),
      mountGridEngine: (slot) =>
        this._gridMediaController.mountGridEngine(slot),
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
      go2rtcRaceMounter: this._go2rtcRaceMounter,
      preferredStreamType: () => this._preferredStreamType(),
      setActiveStreamType: (type) => this._setActiveStreamType(type),
      setStreamLoading: (loading) => this._setStreamLoading(loading),
      setStreamFallbackVisible: (visible, refreshImage = false) =>
        this._setStreamFallbackVisible(visible, refreshImage),
      scheduleResumeLive: (reason) => this._scheduleResumeLive(reason),
      resolveUseGo2Rtc: (entity) => this._shouldUseGo2RtcForEntity(entity),
    });
    this._wasVisible = false;
    this._resumeLiveT = null;
    this._disconnectTeardownT = null;
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
      }
    };

    document.addEventListener("visibilitychange", this._onDocVisibility);
    this._onFullscreenChange = () => this._syncFullscreenButtonsVisibility();
    document.addEventListener("fullscreenchange", this._onFullscreenChange);
    document.addEventListener(
      "webkitfullscreenchange",
      this._onFullscreenChange,
    );

    this._onViewportRotate = () => this._scheduleRotateOverlayUpdate();
    window.addEventListener("resize", this._onViewportRotate, {
      passive: true,
    });
    window.addEventListener("orientationchange", this._onViewportRotate);
    window.visualViewport?.addEventListener("resize", this._onViewportRotate, {
      passive: true,
    });
    window.visualViewport?.addEventListener("scroll", this._onViewportRotate, {
      passive: true,
    });
    this._onEditorPreviewDraft = (ev) => {
      if (ev?.detail?.cardTag !== CARD_TAG) return;
      this._applyEditorPreviewDraft(ev.detail?.config || null);
    };
    window.addEventListener(
      "frigate-view-card-preview-draft",
      this._onEditorPreviewDraft,
    );
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
  _applyEditorPreviewDraft(previewConfig) {
    if (!this._isEditorPreviewContext()) return;
    if (!this._committedConfig) return;

    const base = this._cloneCardConfig(this._committedConfig);
    const next = applyEditorPreviewDraftToCardConfig({
      baseConfig: base,
      previewConfig,
    });

    this._config = next;
    this._syncVisualStyleToggles();
    this._browseOpen = this._config.browse_expanded;
    this._singleViewPageController.applyEditorPreviewDraftRefresh();
  }
  connectedCallback() {
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
      this.parentElement.style.height = this._isPreviewContext()
        ? "auto"
        : "100%";
      this._applyTightMargins();
      this._wideViewPageController.applyLayoutAndWideSyncForCard();
    }
    this._syncVisualStyleToggles();
    this._scheduleRotateOverlayUpdate();
    if (this._started) {
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

  _syncHostOuterStyles() {
    this._cardStyleController.syncHostOuterStyles();
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

  static getConfigElement() {
    return document.createElement(CARD_TAG + "-editor");
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
    if (cameras.length > MAX_CAMERAS) cameras = cameras.slice(0, MAX_CAMERAS);

    const legacyWindowHours = parseInt(config.window_hours, 10);
    const nextConfig = {
      cameras,
      title: config.title || null,
      subtitle: config.subtitle || null,
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
      mobile_poll_battery_saver: config.mobile_poll_battery_saver === true,
      slideshow_rotation_enabled: config.slideshow_rotation_enabled === true,
      slideshow_rotation_seconds: SLIDESHOW_ROTATION_OPTIONS_SECONDS.includes(
        Number(config.slideshow_rotation_seconds),
      )
        ? Number(config.slideshow_rotation_seconds)
        : 30,
      grid_mode_enabled: config.grid_mode_enabled === true,
      grid_start_in_grid_enabled: config.grid_start_in_grid_enabled === true,
      grid_live_view_enabled: config.grid_live_view_enabled !== false,
      mobile_view_page_enabled: config.mobile_view_page_enabled === true,
      preview_page_enabled: config.preview_page_enabled === true,
      preview_page_live_cameras: config.preview_page_live_cameras === true,
      preview_page_show_title_bars:
        config.preview_page_show_title_bars !== false,
      wide_view_page_enabled:
        config.wide_view_page_enabled === true || config.wide_view === true,
      landing_page: normalizePageRoute(config.landing_page),
      mobile_page: normalizePageRoute(config.mobile_page),
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
        : [],
      theme: config.theme === "custom" ? "custom" : "default",
      theme_custom:
        config.theme_custom && typeof config.theme_custom === "object"
          ? Object.fromEntries(
              Object.entries(config.theme_custom)
                .filter(([key]) => THEME_CUSTOM_KEYS.has(key))
                .map(([key, value]) => [key, normalizeHexColor(value)])
                .filter(([, value]) => !!value),
            )
          : {},
      theme_custom_defaults:
        config.theme_custom_defaults &&
        typeof config.theme_custom_defaults === "object"
          ? Object.fromEntries(
              Object.entries(config.theme_custom_defaults)
                .filter(([key]) => THEME_CUSTOM_KEYS.has(key))
                .map(([key, value]) => [key, value === true])
                .filter(([, value]) => value === true),
            )
          : {},
      stream_height: config.stream_height ? Number(config.stream_height) : null,
      stream_height_unit: config.stream_height_unit || "vh",
      compact_preview: config.compact_preview === true,
      tight_margins: config.tight_margins === true,
      shadows: config.shadows !== false,
      borders: config.borders !== false,
      rounded_corners: config.rounded_corners !== false,
      outer_shadows: config.outer_shadows !== false,
      col_left_width_pct: Number(config.col_left_width_pct) || 50,
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
    const previewVisualChanged =
      !!prevConfig &&
      (prevConfig.preview_page_live_cameras !==
        nextConfig.preview_page_live_cameras ||
        prevConfig.preview_page_show_title_bars !==
          nextConfig.preview_page_show_title_bars);
    const previewModeConfigChanged =
      previewEnabledChanged || previewVisualChanged;

    this._committedConfig = this._cloneCardConfig(nextConfig);
    this._config = nextConfig;
    this._applyScopedVideoFactoryDefaultsFromConfig(nextConfig);
    this._navigationFactory = null;
    if (!this._isSlideshowRotationAvailable()) {
      this._stopSlideshowRotation("config-change");
    }
    if (!this._isGridModeAvailable()) {
      this._stopGridModeState();
      if (this._viewMode === "grid") this._viewMode = "single";
    }
    this._syncVisualStyleToggles();
    this._browseOpen = this._config.browse_expanded;
    for (const c of cameras) {
      if (!this._camCache[c.entity]) this._camCache[c.entity] = mkCamState();
    }

    if (!wasStarted || !prevConfig) {
      this._renderShell();
      return;
    }

    const prevCams = prevConfig.cameras || [];
    const nextCams = nextConfig.cameras || [];
    const camerasChanged =
      prevCams.length !== nextCams.length ||
      prevCams.some((c, i) => c?.entity !== nextCams[i]?.entity);
    const hiddenTabsChanged =
      JSON.stringify(prevConfig.hidden_tabs || []) !==
      JSON.stringify(nextConfig.hidden_tabs || []);
    const needsShellRerender =
      hiddenTabsChanged ||
      previewEnabledChanged ||
      mobileViewPageEnabledChanged ||
      wideViewPageEnabledChanged;
    const needsEngineRemount = camerasChanged;
    const realtimePollChanged =
      prevConfig.realtime_poll_seconds !== nextConfig.realtime_poll_seconds ||
      prevConfig.mobile_poll_battery_saver !==
        nextConfig.mobile_poll_battery_saver;
    const activePageInvalid = !this._isPageRouteAvailable(this._pageId);

    const routeFlowOutcome =
      this._singleViewPageController.applyConfigUpdateRouteFlow({
        needsEngineRemount,
        nextCameraCount: nextCams.length,
        needsShellRerender,
        activePageInvalid,
        previewPageActive: this._isPreviewPageActive(),
        realtimePollChanged,
      });

    if (routeFlowOutcome === "preview") {
      this._singleViewPageController.applyPreviewConfigUpdateTail({
        previewModeConfigChanged,
        realtimePollChanged,
      });
      return;
    }

    if (routeFlowOutcome === "handled") return;
  }
  set hass(hass) {
    this._hass = hass;
    if (!this._config) return;
    const cameraStateSignature = hassEntityStateSignature(
      hass,
      configuredCameraEntities(this._config),
    );
    const themeSignature = hassThemeSignature(hass);
    const cameraStateChanged =
      cameraStateSignature !== this._lastHassCameraStateSignature;
    const themeChanged = themeSignature !== this._lastHassThemeSignature;
    this._lastHassCameraStateSignature = cameraStateSignature;
    this._lastHassThemeSignature = themeSignature;
    if (!this._started) {
      this._started = true;
      this._start();
      return;
    }
    this._editorPreviewController.syncHassPreviewContext();
    if (!cameraStateChanged && !themeChanged) return;
    this._singleViewPageController.applyHassUpdateRouteFlow({
      cameraStateChanged,
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
    if (this._disconnectTeardownT) clearTimeout(this._disconnectTeardownT);
    this._disconnectTeardownT = setTimeout(() => {
      this._disconnectTeardownT = null;
      if (this.isConnected) return;
      this._teardownDisconnected();
    }, 2500);
  }

  _teardownDisconnected() {
    this._stopSlideshowRotation("disconnect", false);
    this._stopGridModeState();
    this._stopPreviewMode();
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
    if (this._io) this._io.disconnect();
    this._io = null;
    if (this._realtimeHeadPollT) clearInterval(this._realtimeHeadPollT);
    this._realtimeHeadPollT = null;
    if (this._warmOtherCamsDelayT) clearTimeout(this._warmOtherCamsDelayT);
    this._warmOtherCamsDelayT = null;
    if (this._resumeLiveT) clearTimeout(this._resumeLiveT);
    this._editorPreviewController.dispose();
    if (this._liveControlsHideTimer) clearTimeout(this._liveControlsHideTimer);
    if (this._liveOverlayControlsController) {
      try {
        this._liveOverlayControlsController.dispose();
      } catch (_) {}
      this._liveOverlayControlsController = null;
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
    this._clearPopupMediaCleanup();
    if (this._onDocVisibility) {
      document.removeEventListener("visibilitychange", this._onDocVisibility);
    }
    if (this._onShadowError) {
      this.shadowRoot.removeEventListener("error", this._onShadowError, true);
    }
    if (this._popupDragController) {
      this._popupDragController.dispose();
      this._popupDragController = null;
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
    if (this._onViewportRotate) {
      window.removeEventListener("resize", this._onViewportRotate);
      window.removeEventListener("orientationchange", this._onViewportRotate);
      window.visualViewport?.removeEventListener(
        "resize",
        this._onViewportRotate,
      );
      window.visualViewport?.removeEventListener(
        "scroll",
        this._onViewportRotate,
      );
    }
    if (this._onEditorPreviewDraft) {
      window.removeEventListener(
        "frigate-view-card-preview-draft",
        this._onEditorPreviewDraft,
      );
    }
    if (this._rotateOverlayRaf) cancelAnimationFrame(this._rotateOverlayRaf);
    this._rotateOverlayRaf = 0;
    if (this._rotateOverlayExitT) clearTimeout(this._rotateOverlayExitT);
    this._rotateOverlayExitT = null;
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
  }
  // ── init ─────────────────────────────────────────────────
  async _start() {
    await this._discoverAll();
    if (this._isDeepLinkHandlingEnabled()) {
      this._initDeepLinkFromUrl();
      this._applyDeepLinkCameraHint();
    }
    const now = Math.floor(Date.now() / 1000);
    this._followNowWindow = true;
    this._winEnd = now;
    this._winStart = now - this._config.window_days * DAY;

    const initialLoad = this._loadWindow(true);
    this._scheduleWarmOtherCamerasEvents();
    const startInGrid = this._shouldStartInGridMode();
    this._navigateToConfiguredLandingPage({
      source: "startup",
      startup: true,
      startInGrid,
      hasPendingDeepLinkTarget: this._hasPendingDeepLinkTarget(),
    });
    await initialLoad;
    void this._prefetchCalendarActivityForActiveCamera();
    this._subscribe();
    this._startEditModeWatchdog();
    this._startEditorDialogCloseObserver();
    this._consumeDeepLinkReviewOpen();
    this._consumeDeepLinkEventOpen();
    this._refresh = setInterval(() => {
      if (this._isNowWindow()) this._loadWindow(true);
    }, this._config.refresh_seconds * 1000);
    this._restartRealtimeHeadPollTimer();
    this._setupResizeObserver();
  }

  _mergedUrlSearchParams() {
    return this._deepLinkController.mergedUrlSearchParams();
  }

  _clearDeepLinkParamsFromUrl() {
    this._deepLinkController.clearDeepLinkParamsFromUrl();
  }

  _initDeepLinkFromUrl() {
    this._deepLinkController.initDeepLinkFromUrl();
  }

  _deepLinkCameraHintIndex() {
    return this._deepLinkController.deepLinkCameraHintIndex();
  }

  _applyDeepLinkCameraHint() {
    this._deepLinkController.applyDeepLinkCameraHint();
  }

  _isDeepLinkCandidateForCard() {
    return this._deepLinkController.isDeepLinkCandidateForCard();
  }

  _consumeDeepLinkEventOpen() {
    this._deepLinkController.consumeDeepLinkEventOpen();
  }

  _consumeDeepLinkReviewOpen() {
    this._deepLinkController.consumeDeepLinkReviewOpen();
  }

  _isLikelyMobileClient() {
    return DEVICE_PROFILE.isMobile;
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
      this._config.cameras.map((c) => this._discoverOne(c.entity)),
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
    const entity = this._activeCam?.entity;
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

  _cameraDisableHlsDesktop(entity) {
    return resolveCameraDisableHlsDesktop({
      config: this._config,
      entity,
      normalizeDisableHlsDesktop,
    });
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

  _cleanupEngine() {
    return this._mseGraceController.cleanupEngine();
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
    this._mseGraceController.cleanupEngine(options);
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
    const fit = () => {
      const w = Number(videoEl.videoWidth) || 0;
      const h = Number(videoEl.videoHeight) || 0;
      const ar = h > 0 ? w / h : 0;
      const host = videoEl.parentElement;
      const cw = Number(host?.clientWidth) || 0;
      const ch = Number(host?.clientHeight) || 0;
      const car = ch > 0 ? cw / ch : 0;
      const near169 = ar > 0 && Math.abs(ar - 16 / 9) < 0.08;
      const nearPanel = ar > 0 && car > 0 && Math.abs(ar - car) < 0.06;

      videoEl.style.display = "block";
      videoEl.style.width = "100%";
      videoEl.style.height = "100%";
      videoEl.style.objectPosition = "center center";
      videoEl.style.objectFit = near169 && nearPanel ? "cover" : "contain";
    };

    fit();
    videoEl.addEventListener("loadedmetadata", fit, { once: true });
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
    applyActiveStreamTypeForCard({
      card: this,
      type,
    });
  }

  _setStreamFallbackVisible(visible, refreshImage = false) {
    applyStreamFallbackVisibilityForCard({
      card: this,
      visible,
      refreshImage,
    });
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
    this._rotateOverlayActive = uiPlan.active;
    this._rotateOverlayMode = uiPlan.mode;
    if (uiPlan.disableNativeControls) this._setLiveNativeControls(false);
    if (uiPlan.clearLiveControlsVisible) {
      this._$("#eng-wrap")?.classList.remove("live-controls-visible");
    }
    if (uiPlan.clearLoading) this._setStreamLoading(false);
    if (uiPlan.enableNativeControls) this._setLiveNativeControls(true);
    if (uiPlan.syncFullscreenButtons) this._syncFullscreenButtonsVisibility();
    if (uiPlan.showLiveControls) this._showLiveControlsTemporarily();
    if (uiPlan.showPopupControls) this._showPopupControlsTemporarily();
  }

  async _mountEngine(forcedType = null, options = {}) {
    return this._liveMountController.mount({
      forcedType,
      quiet: options?.quiet === true,
      entity: this._activeCam?.entity || "",
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

  _ensureNavigationFactory() {
    return this._pageNavigationController.ensureNavigationFactory();
  }

  _pageRouteOptions() {
    return this._pageNavigationController.pageRouteOptions();
  }

  _isPageRouteAvailable(pageId) {
    return this._pageNavigationController.isPageRouteAvailable(pageId);
  }

  _pageRouteLabel(pageId) {
    return this._pageNavigationController.pageRouteLabel(pageId);
  }

  _pageNavMarkup() {
    return this._pageNavigationController.pageNavMarkup();
  }

  _syncPageNavShell() {
    this._pageNavigationController.syncPageNavShell();
  }

  _syncPageNavigationButtons() {
    this._pageNavigationController.syncPageNavigationButtons();
  }

  _navigateToPageRoute(pageId, context = {}) {
    return this._pageNavigationController.navigateToPageRoute(pageId, context);
  }

  _navigateToConfiguredLandingPage(context = {}) {
    return this._pageNavigationController.navigateToConfiguredLandingPage(
      context,
    );
  }

  _activateSingleViewPageRoute(context = {}) {
    this._singleViewPageController.activateSingleViewPageRoute(context);
  }

  _activateMobileViewPageRoute(context = {}) {
    this._mobileViewPageController.activateMobileViewPageRoute(context);
  }

  _isMobileViewPageActive() {
    return normalizePageRoute(this._pageId) === PAGE_IDS.mobileView;
  }

  _activeStandardPageController() {
    return this._isMobileViewPageActive()
      ? this._mobileViewPageController
      : this._singleViewPageController;
  }

  _syncMobileViewPageMarkup() {
    this._mobileViewPageController.syncMobileViewPageMarkup();
  }

  _activateWideViewPageRoute(context = {}) {
    this._wideViewPageController.activateWideViewPageRoute(context);
  }

  _activatePreviewPageRoute(context = {}) {
    this._previewPageController.activatePreviewPageRoute(context);
  }

  _hasPendingDeepLinkTarget() {
    return this._deepLinkController.hasPendingDeepLinkTarget();
  }

  _isDeepLinkHandlingEnabled() {
    return this._deepLinkController.isDeepLinkHandlingEnabled();
  }

  _previewLiveCamerasEnabled() {
    return this._previewPageController.previewLiveCamerasEnabled();
  }

  _previewShowTitleBarsEnabled() {
    return this._previewPageController.previewShowTitleBarsEnabled();
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
  }

  _isPreviewCameraAlertLive(entity) {
    return this._previewAlertController.isCameraAlertLive(entity);
  }

  _previewCellSeverity(entity) {
    return this._previewPageController.previewCellSeverity(entity);
  }

  _previewShouldUseLive(entity) {
    return this._previewPageController.previewShouldUseLive(entity);
  }

  _previewEventsCount(entity) {
    return this._previewPageController.previewEventsCount(entity);
  }

  _previewStreamSourceLabel(entity, useLive) {
    return this._previewPageController.previewStreamSourceLabel(
      entity,
      useLive,
    );
  }

  _previewLiveStreamHint() {
    return this._previewPageController.previewLiveStreamHint();
  }

  _teardownPreviewMedia() {
    this._previewPageController.teardownPreviewMedia();
  }

  _renderPreviewPage() {
    this._previewPageController.renderPreviewPage();
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

  _exitPreviewPageToCamera(idx) {
    this._previewPageController.exitPreviewPageToCamera(idx);
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
    const nextMode =
      mode === "grid" && this._isGridModeAvailable() ? "grid" : "single";
    if (this._viewMode === "grid" && nextMode !== "grid") {
      this._stopGridModeState();
      this._gridLastRenderSignature = "";
    }
    let startGridTimers = false;
    if (nextMode === "grid") {
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
    this._viewMode = nextMode;
    const engWrap = this._$("#eng-wrap");

    if (engWrap) engWrap.style.display = "";

    this._eventsMode = "camera";
    this._mountEngine();
    this._syncTabsShell();
    this._renderAll();
    this._applyBrowse();
    this.shadowRoot
      .querySelectorAll("[data-viewmode]")
      .forEach((p) =>
        p.classList.toggle("active", p.dataset.viewmode === nextMode),
      );
    if (startGridTimers) {
      this._scheduleGridRotation();
      this._gridAlertController.scheduleAlertWatch(300);
    }
    this._syncToolbarButtons();
  }

  _isSlideshowRotationAvailable() {
    return (
      this._config?.slideshow_rotation_enabled === true &&
      !DEVICE_PROFILE.isPhone &&
      !this._isMobilePhoneViewport() &&
      Array.isArray(this._config?.cameras) &&
      this._config.cameras.length > 1
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

  _syncToolbarButtons() {
    const gridBtn = this._$("#grid-btn");
    if (gridBtn) {
      const gridAvailable = this._isGridModeAvailable();
      const gridActive = this._viewMode === "grid";
      gridBtn.hidden = !gridAvailable;
      gridBtn.style.display = gridAvailable ? "" : "none";
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

    const slideshowBtn = this._$("#slideshow-btn");
    if (slideshowBtn) {
      const available = this._isSlideshowRotationAvailable();
      slideshowBtn.hidden = !available;
      slideshowBtn.style.display = available ? "" : "none";
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

    const controlsBtn = this._$("#controls-btn");
    if (controlsBtn) {
      const controlsActive = this._tab === "controls";
      controlsBtn.classList.toggle("active", controlsActive);
      controlsBtn.setAttribute(
        "aria-pressed",
        controlsActive ? "true" : "false",
      );
    }

    const filterBtn = this._$("#filter-btn");
    if (filterBtn) {
      const filterOpen = this._$("#filter-panel")?.style.display !== "none";
      filterBtn.classList.toggle("active", filterOpen);
      filterBtn.setAttribute("aria-pressed", filterOpen ? "true" : "false");
    }

    const calBtn = this._$("#cal-btn");
    if (calBtn) {
      const calOpen = this._$("#cal-panel")?.style.display !== "none";
      calBtn.classList.toggle("active", calOpen);
      calBtn.setAttribute("aria-pressed", calOpen ? "true" : "false");
    }
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

  _handleSlideshowRealtimeMessage(msg) {
    this._slideshowAlertController.handleRealtimeMessage(msg);
  }

  // ── camera switching ──────────────────────────────────────
  async _switchCamera(idx, opts = {}) {
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
    if (idx === this._activeCamIdx && this._viewMode === "single" && !popupOpen)
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

    const prevEnt = this._activeCam?.entity;
    if (prevEnt && this._camCache[prevEnt]) {
      this._camCache[prevEnt].events = this._events;
      this._camCache[prevEnt].recordings = this._recordings;
      this._camCache[prevEnt].reviews = this._reviews;
      this._camCache[prevEnt].kept = this._kept;
    }
    this._activeCamIdx = idx;
    const newEnt = this._activeCam?.entity;
    if (!this._camCache[newEnt]) this._camCache[newEnt] = mkCamState();
    if (!this._camCache[newEnt].discovered) this._discoverOne(newEnt);
    const cached = this._camCache[newEnt];
    this._events = cached.events || [];
    this._recordings = cached.recordings || [];
    this._reviews = cached.reviews || [];
    this._kept = cached.kept || [];
    // Camera button should always return to single live view.
    this._viewMode = "single";
    if (popupOpen) this._closePopup();
    if (engWrap) engWrap.style.display = "";
    this.shadowRoot
      .querySelectorAll("[data-viewmode]")
      .forEach((p) =>
        p.classList.toggle("active", p.dataset.viewmode === "single"),
      );
    this._syncTabsShell();
    this._renderCamSwitcher();
    this._syncStatus();
    this._renderStats();
    this._normalizeFilterSelections();
    if (this._$("#filter-panel")?.style.display !== "none") {
      this._renderFilter();
    }
    this._renderList();
    this._streamMuted = true;
    this._renderMuteButton();
    this._cancelPendingMount("switch-camera", { preserveMseEntity: prevEnt });
    this._mountEngine();
    clearTimeout(this._switchLoadT);
    this._loadWindow(true);
    this._applyCalendarActivityCacheForActiveCamera();
    void this._prefetchCalendarActivityForActiveCamera();
    if (this._$("cal-panel")?.style.display !== "none") {
      this._renderCal();
    }
    this._syncToolbarButtons();
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
  async _fetchWindowedEvents(clientId, cam, after, before, opts = {}) {
    return this._browseWindowLoaderController.fetchWindowedEvents(
      clientId,
      cam,
      after,
      before,
      opts,
    );
  }

  async _warmOtherCamerasEvents() {
    return this._browseWindowLoaderController.warmOtherCamerasEvents();
  }

  _scheduleWarmOtherCamerasEvents(delayMs = 1000) {
    this._browseWindowLoaderController.scheduleWarmOtherCamerasEvents(delayMs);
  }

  _pruneNonActiveCamWindowCaches() {
    this._browseWindowLoaderController.pruneNonActiveCamWindowCaches();
  }

  async _fetchWindowedReviews(clientId, cam, after, before, opts = {}) {
    return this._browseWindowLoaderController.fetchWindowedReviews(
      clientId,
      cam,
      after,
      before,
      opts,
    );
  }
  async _loadWindow(replace) {
    await this._browseWindowLoaderController.loadWindow(replace);
  }

  _cacheActiveCamSlice(key, value) {
    this._browseWindowLoaderController.cacheActiveCamSlice(key, value);
  }

  async _loadWindowEvents(clientId, cam, after, before) {
    await this._browseWindowLoaderController.loadWindowEvents(
      clientId,
      cam,
      after,
      before,
    );
  }

  async _loadWindowRecordings(clientId, cam, before) {
    await this._browseWindowLoaderController.loadWindowRecordings(
      clientId,
      cam,
      before,
    );
  }

  async _loadWindowReviewsIfNeeded(clientId, cam, after, before) {
    await this._browseWindowLoaderController.loadWindowReviewsIfNeeded(
      clientId,
      cam,
      after,
      before,
    );
  }

  async _loadKept() {
    const { clientId, cam } = this._cc();
    try {
      const k = await this._ws({
        type: "frigate/events/get",
        instance_id: clientId,
        cameras: [cam],
        favorites: true,
        limit: 50,
      });
      this._kept = Array.isArray(k) ? k : [];
      const ent = this._activeCam?.entity;
      if (ent && this._camCache[ent]) this._camCache[ent].kept = this._kept;
    } catch (_) {
      this._kept = [];
    }
  }
  async _loadReviews() {
    const { clientId, cam } = this._cc();
    try {
      const before = this._winEnd;
      const after = Math.max(
        0,
        Math.floor(before - (this._config?.alerts_reviews_days || 3) * DAY),
      );
      const r = await this._fetchWindowedReviews(clientId, cam, after, before, {
        debugLabel: "alerts-tab",
      });
      this._reviews = Array.isArray(r) ? r : [];
      this._cacheActiveCamSlice("reviews", this._reviews);
      this._slideshowAlertController.handleReviewsUpdated(
        this._activeCam?.entity || "",
        this._reviews,
        "alerts-tab",
      );
    } catch (_) {
      this._reviews = [];
    }
  }
  async _loadCalendar() {
    await this._prefetchCalendarActivityForActiveCamera();
  }
  _calendarActivityCacheKey(clientId, cam, tz = this._tz()) {
    return `${clientId || ""}|${cam || ""}|${tz || "UTC"}`;
  }
  _applyCalendarActivityCacheForActiveCamera() {
    const { clientId, cam } = this._cc();
    const key = this._calendarActivityCacheKey(clientId, cam);
    const cached = this._calendarActivityByCam.get(key);
    this._daysWithActivity = cached ? new Set(cached) : new Set();
  }
  async _prefetchCalendarActivityForActiveCamera() {
    const { clientId, cam } = this._cc();
    if (!clientId || !cam) {
      this._daysWithActivity = new Set();
      return;
    }
    const tz = this._tz();
    const key = this._calendarActivityCacheKey(clientId, cam, tz);
    const cached = this._calendarActivityByCam.get(key);
    if (cached) {
      this._daysWithActivity = new Set(cached);
      return;
    }
    const existing = this._calendarActivityInFlight.get(key);
    if (existing) {
      await existing;
      return;
    }
    const task = (async () => {
      try {
        const sum = await this._ws({
          type: "frigate/events/summary",
          instance_id: clientId,
          timezone: tz,
        });
        const days = Array.isArray(sum)
          ? new Set(
              sum.filter((s) => s.camera === cam && s.day).map((s) => s.day),
            )
          : new Set();
        this._calendarActivityByCam.set(key, days);
        const active = this._cc();
        const activeKey = this._calendarActivityCacheKey(
          active.clientId,
          active.cam,
          tz,
        );
        if (activeKey === key) {
          this._daysWithActivity = new Set(days);
          if (this._$("cal-panel")?.style.display !== "none") {
            this._renderCal();
          }
        }
      } catch (_) {}
    })();
    this._calendarActivityInFlight.set(key, task);
    try {
      await task;
    } finally {
      this._calendarActivityInFlight.delete(key);
    }
  }
  _tz() {
    return (
      this._hass?.config?.time_zone ||
      Intl.DateTimeFormat().resolvedOptions().timeZone ||
      "UTC"
    );
  }
  _tzOffsetMinutesAt(epochMs, tz = this._tz()) {
    const dtf = new Intl.DateTimeFormat("en-US", {
      timeZone: tz,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hourCycle: "h23",
    });
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
    const dtf = new Intl.DateTimeFormat("en-US", {
      timeZone: this._tz(),
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
    const { clientId } = this._cc();
    if (!this._hass?.connection || !clientId) return;
    try {
      this._unsub = this._hass.connection.subscribeMessage(
        (msg) => {
          this._handleGridRealtimeMessage(msg);
          this._previewAlertController.handleRealtimeMessage(msg);
          this._handleSlideshowRealtimeMessage(msg);
          if (!this._isNowWindow()) return;
          if (!this._isRealtimeEventMessage(msg)) return;
          this._scheduleReload(REALTIME_RELOAD_DEBOUNCE_MS);
        },
        { type: "frigate/events/subscribe", instance_id: clientId },
      );
    } catch (_) {}
  }

  async _pollLatestEventHead() {
    if (!this._isNowWindow()) return;
    if (this._loading) return;
    const { clientId, cam } = this._cc();
    if (!clientId || !cam) return;
    const now = Math.floor(Date.now() / 1000);
    const after = now - this._config.window_days * DAY;
    try {
      const latest = await this._ws({
        type: "frigate/events/get",
        instance_id: clientId,
        cameras: [cam],
        after,
        before: now,
        limit: 1,
      });
      if (!Array.isArray(latest) || !latest.length) return;
      const newestId = latest[0]?.id;
      if (!newestId) return;
      const currentId = this._events?.[0]?.id;
      if (newestId !== currentId) {
        this._scheduleReload(REALTIME_RELOAD_DEBOUNCE_MS);
      }
    } catch (_) {}
  }

  _isRealtimeEventMessage(msg) {
    if (!msg || typeof msg !== "object") return false;
    const type = String(msg.type || "").toLowerCase();
    if (!type) return false;
    if (type === "end") return true;
    if (
      !type.includes("event") &&
      !type.includes("review") &&
      !type.includes("detection") &&
      type !== "new" &&
      type !== "update"
    ) {
      return false;
    }
    if (this._eventsMode === "all") return true;
    const activeCam = this._cc().cam;
    const messageCam =
      msg.camera ||
      msg?.event?.camera ||
      msg?.review?.camera ||
      msg?.after?.camera ||
      msg?.before?.camera;
    if (!messageCam) return true;
    return String(messageCam) === String(activeCam);
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
        this._loadWindow(true);
      },
      Math.max(0, Number(delayMs) || 0),
    );
  }

  _buildTabsMarkup() {
    const filterPanel = this._$("#filter-panel");
    const calendarPanel = this._$("#cal-panel");
    const filterPanelOpen =
      !!filterPanel && filterPanel.style.display !== "none";
    const calendarPanelOpen =
      !!calendarPanel && calendarPanel.style.display !== "none";
    const { activeTab, markup } = buildTabsMarkup({
      tab: this._tab,
      hiddenTabs: this._config.hidden_tabs,
      viewMode: this._viewMode,
      icons: ICONS,
      isFilterPanelOpen: filterPanelOpen,
      isCalendarPanelOpen: calendarPanelOpen,
      isGridModeAvailable: this._isGridModeAvailable(),
      isSlideshowRotationAvailable: this._isSlideshowRotationAvailable(),
      isSlideshowActive: this._slideshowActive,
      gridButtonIcon: this._gridButtonIcon(),
      slideshowButtonIcon: this._slideshowButtonIcon(),
    });
    this._tab = activeTab;
    return markup;
  }

  _syncTabsShell() {
    const tabs = this._$(".tabs");
    if (!tabs) return;
    const prevTab = this._tab;
    tabs.innerHTML = this._buildTabsMarkup();
    [
      "#grid-btn",
      "#slideshow-btn",
      "#filter-btn",
      "#cal-btn",
      "#controls-btn",
    ].forEach((sel) => {
      delete this._domCache[sel];
    });
    if (this._tab !== prevTab) {
      void this._loadTabData(this._tab);
    }
  }

  async _loadTabData(tab) {
    if (
      tab !== "alerts" &&
      tab !== "kept" &&
      tab !== "recordings" &&
      tab !== "controls"
    )
      return;
    try {
      if (tab === "alerts") await this._loadReviews();
      if (tab === "kept") await this._loadKept();
      if (this._isGridMixedListMode() && (tab === "alerts" || tab === "kept")) {
        await this._loadGridMixedTabData(tab);
      }
      if (tab === "recordings") {
        const { clientId, cam } = this._cc();
        if (clientId && cam) {
          await this._loadWindowRecordings(clientId, cam, this._winEnd);
        }
      }
    } catch (error) {
      console.error("[Frigate] tab data load failed", error);
    } finally {
      this._renderList();
    }
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

  async _loadGridMixedTabData(tab) {
    await this._browseCollectionController.loadGridMixedTabData(tab);
  }

  // =======================Render Shell===================================
  _renderShell() {
    const title =
      this._config.title ||
      (this._config.cameras.length === 1
        ? cap(camDisplayName(this._config.cameras[0]))
        : "Cameras") ||
      "Camera";
    const subtitle = this._subtitleText();
    const showCamSwitcher =
      this._config.cameras.length > 1 || this._isPreviewPageEnabled();
    const camSwitcher = showCamSwitcher
      ? `<div class="cam-switcher" id="cam-switcher">${this._camSwitcherMarkup({ includeStatus: false })}</div>`
      : "";
    const pageNav = this._pageNavMarkup();
    const infoRow = this._isMobileViewPageActive()
      ? buildMobileViewInfoRowMarkup({
          title,
          subtitle,
          version: VERSION,
          streamType: this._activeStreamType,
          eventsCount: this._allDisplayEvents().length,
          online:
            this._hass?.states?.[this._activeCam?.entity]?.state !==
            "unavailable",
        })
      : buildInfoRowMarkup({
          title,
          subtitle,
          version: VERSION,
        });
    const liveEngineWrap = buildLiveEngineWrapMarkup({
      icons: ICONS,
      streamMuted: this._streamMuted,
    });
    const rightColumnShell = buildRightColumnShellMarkup({
      icons: ICONS,
      tabsMarkup: this._buildTabsMarkup(),
    });
    const mainLayoutShell = buildMainLayoutShellMarkup({
      liveEngineWrap,
      infoRow,
      pageNav,
      camSwitcher,
      rightColumnShell,
    });
    const popupShell = buildPopupShellMarkup({
      icons: ICONS,
      version: VERSION,
    });
    this.shadowRoot.innerHTML = `<style>${STYLES}</style>
    <ha-card class="card ${this._cardStateClassNames()}" id="card" style="border-radius: var(--fvc-border-radius);">

        ${mainLayoutShell}
        <!--<div class="toast" id="toast" style="display:none"></div>-->

          ${popupShell}
      </ha-card>
      `;
    this._domCache = {}; // invalidate DOM element cache after full re-render
    this._lastRenderedListHtml = "";
    this._initPopupInteractions();
    this._applyBrowse();
    this._applyCardStyle();
    this._wideViewPageController.applyLayoutAndWideSyncForCard();
    this._syncBrowseHeadModeClass();
    this._bindListScroll();
    this._bindRecordingsSwipe();
    this._wideViewPageController.initResizeHandle();
    this._initLiveOverlayControls();
    this._syncSlideshowCountdownOverlay();
    this._renderPreviewPage();
    this._applyPreviewShellVisibility();
    this._syncMobileViewPageMarkup();
  }

  _initLiveOverlayControls() {
    const wrap = this._$("#eng-wrap");
    if (!wrap) return;
    if (this._liveOverlayControlsController) {
      try {
        this._liveOverlayControlsController.dispose();
      } catch (_) {}
      this._liveOverlayControlsController = null;
    }
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
  }

  _bindListScroll() {
    const list = this._$("#list");
    const browse = this._$("#browse");
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
      loadOlder: () => this._loadOlder(),
    });
    this._listScrollController.bind();
  }

  _bindRecordingsSwipe() {
    if (this._recordingsSwipeController) {
      this._recordingsSwipeController.dispose();
      this._recordingsSwipeController = null;
    }
    const browse = this._$("#browse");
    if (!browse) return;
    this._recordingsSwipeController = new RecordingsSwipeController({
      browse,
      getTab: () => this._tab,
      isMobileTabletViewport: () => this._isMobileTabletViewport(),
      isDayNavAnimating: () => this._recordingsDayNavAnimating,
      getGesture: () => this._recordingsSwipeGesture,
      setGesture: (gesture) => {
        this._recordingsSwipeGesture = gesture;
      },
      setTapBlocked: (blocked) => {
        this._recordingsSwipeBlockTap = blocked;
      },
      destroyGestureStage: () => this._destroyRecordingsSwipeStage(),
      startGestureStage: (direction) =>
        this._startRecordingsSwipeGesture(direction),
      setStageOffset: (stage, offset) =>
        this._setRecordingsSwipeStageOffset(stage, offset),
      animateStageTo: (stage, offset, duration, easing) =>
        this._animateRecordingsSwipeStageTo(stage, offset, duration, easing),
      completeGesture: (gesture) =>
        this._completeRecordingsSwipeGesture(gesture),
      bounceArea: (direction) => this._bounceRecordingsArea(direction),
    });
    this._recordingsSwipeController.bind();
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
    const list = this._$("#list");
    if (!list) return null;
    const metrics = resolveRecordingsSwipeStageMetrics({
      list,
      lastRenderedListHtml: this._lastRenderedListHtml,
    });
    const stage = document.createElement("div");
    stage.className = "rec-swipe-stage";
    stage.style.minHeight = `${metrics.minHeight}px`;

    const current = document.createElement("div");
    current.className = "rec-swipe-pane current";
    current.innerHTML = metrics.currentHtml;

    const incoming = document.createElement("div");
    incoming.className = "rec-swipe-pane incoming";
    incoming.innerHTML = incomingHtml;

    stage.appendChild(current);
    stage.appendChild(incoming);
    list.classList.add("recordings-swipe-active");
    list.innerHTML = "";
    list.appendChild(stage);

    const state = {
      list,
      stage,
      current,
      incoming,
      direction,
      width: metrics.width,
      offset: 0,
    };
    this._setRecordingsSwipeStageOffset(state, 0);
    return state;
  }

  _setRecordingsSwipeStageOffset(state, offset, transition = "") {
    if (!state) return;
    state.offset = offset;
    state.current.style.transition = transition;
    state.incoming.style.transition = transition;
    const transforms = resolveRecordingsSwipeStageTransforms({
      offset,
      direction: state.direction,
      width: state.width,
    });
    state.current.style.transform = transforms.currentTransform;
    state.incoming.style.transform = transforms.incomingTransform;
  }

  _animateRecordingsSwipeStageTo(
    state,
    offset,
    duration = 260,
    easing = "cubic-bezier(0.18, 0.5, 0.2, 1)",
  ) {
    if (!state) return Promise.resolve();
    return new Promise((resolve) => {
      void state.stage?.getBoundingClientRect?.();
      void state.current?.offsetWidth;
      const transition = `transform ${duration}ms ${easing}`;
      this._setRecordingsSwipeStageOffset(state, offset, transition);
      setTimeout(resolve, duration + 16);
    });
  }

  _destroyRecordingsSwipeStage() {
    const state = this._recordingsSwipeGesture?.stage;
    if (!state?.list) return;
    this._clearRecordingsSwipeListState(state.list);
    this._lastRenderedListHtml = "";
    this._renderList();
  }

  _clearRecordingsSwipeListState(list = null) {
    const targetList = list || this._$("#list");
    targetList?.classList?.remove("recordings-swipe-active");
  }

  _startRecordingsSwipeGesture(direction) {
    const stage = this._createRecordingsSwipeStage(
      direction,
      RECORDINGS_SWIPE_LOADING_HTML,
    );
    const gesture = createRecordingsSwipeGestureState(direction, stage);
    gesture.prepPromise = (async () => {
      try {
        const prep = await this._prepareRecordingsDayTransition(direction);
        Object.assign(
          gesture,
          resolvePreparedRecordingsSwipeState({
            prep,
            renderRecordings: (recordings) =>
              this._recordingsListMarkup(this._recordingsViewRows(recordings)),
          }),
        );
        if (gesture.stage?.incoming) {
          gesture.stage.incoming.classList.remove("loading");
          gesture.stage.incoming.innerHTML = gesture.incomingHtml;
        }
      } catch (_) {
        Object.assign(gesture, resolveFailedRecordingsSwipeState());
        if (gesture.stage?.incoming) {
          gesture.stage.incoming.classList.remove("loading");
          gesture.stage.incoming.innerHTML = RECORDINGS_SWIPE_EMPTY_HTML;
        }
      }
    })();
    if (gesture.stage?.incoming) {
      gesture.stage.incoming.classList.add("loading");
    }
    return gesture;
  }

  async _prepareRecordingsDayTransition(direction) {
    const bounds = this._recordingsOffsetDayBounds(direction);
    const today = this._recordingsDayBounds(Math.floor(Date.now() / 1000));
    const { clientId, cam } = this._cc();
    const prepared = resolvePreparedRecordingsDayTransition({
      direction,
      bounds,
      todayBounds: today,
      clientId,
      camera: cam,
      dataCache: this._recordingsDayDataCache,
    });
    if (prepared.done) {
      return prepared.result;
    }

    const key = prepared.key;
    const hasData = await this._hasRecordingsInBounds(bounds, clientId, cam);
    if (!hasData) {
      return { hasData: false, bounds, recs: [] };
    }
    const recs = await this._ws({
      type: "frigate/recordings/get",
      instance_id: clientId,
      camera: cam,
      after: Math.max(0, bounds.start),
      before: bounds.end,
    });
    const result = buildPreparedRecordingsDayResult(bounds, recs);
    this._recordingsDayDataCache.set(key, result.recs);
    this._recordingsDayAvailabilityCache.set(key, result.hasData);
    return result;
  }

  async _navigateRecordingsDayAnimated(direction) {
    if (this._tab !== "recordings") return false;
    const dir = Number(direction);
    if (dir !== -1 && dir !== 1) return false;
    if (this._recordingsDayNavAnimating) return false;

    this._recordingsDayNavAnimating = true;
    try {
      const prep = await this._prepareRecordingsDayTransition(dir);
      const navigation = resolvePreparedRecordingsDayNavigationState({
        prep,
        renderRecordings: (recordings) =>
          this._recordingsListMarkup(this._recordingsViewRows(recordings)),
      });
      if (navigation.shouldBounce) {
        this._bounceRecordingsArea(dir);
        void this._updateRecordingsBrowseNav();
        return false;
      }

      const stage = this._createRecordingsSwipeStage(
        dir,
        navigation.incomingHtml,
      );
      if (!stage) {
        await this._commitRecordingsDayTransition(
          navigation.bounds,
          navigation.recs,
        );
        return true;
      }

      await new Promise((resolve) => requestAnimationFrame(resolve));
      await new Promise((resolve) => requestAnimationFrame(resolve));

      await this._animateRecordingsSwipeStageTo(
        stage,
        -dir * stage.width,
        320,
        "cubic-bezier(0.28, 0.02, 0.18, 1)",
      );
      await this._commitRecordingsDayTransition(
        navigation.bounds,
        navigation.recs,
      );
      return true;
    } finally {
      this._recordingsDayNavAnimating = false;
    }
  }

  async _completeRecordingsSwipeGesture(gesture) {
    if (!gesture) return false;
    await gesture.prepPromise;
    if (!gesture.ready || !gesture.hasData || !gesture.stage) return false;

    await new Promise((resolve) => requestAnimationFrame(resolve));
    await new Promise((resolve) => requestAnimationFrame(resolve));

    const target = -gesture.direction * gesture.stage.width;
    await this._animateRecordingsSwipeStageTo(
      gesture.stage,
      target,
      300,
      "cubic-bezier(0.28, 0.02, 0.18, 1)",
    );
    await this._commitRecordingsDayTransition(gesture.bounds, gesture.recs);
    return true;
  }

  async _commitRecordingsDayTransition(bounds, recs) {
    if (!bounds) return;
    const { clientId, cam } = this._cc();
    const committed = resolveCommittedRecordingsDayState({
      bounds,
      recordings: recs,
      clientId,
      camera: cam,
    });
    this._followNowWindow = false;
    this._winStart = committed.bounds.start;
    this._winEnd = committed.bounds.end;
    this._exhausted = false;
    this._pruneNonActiveCamWindowCaches();
    this._recordings = committed.recordings;
    if (committed.key) {
      this._recordingsDayDataCache.set(committed.key, this._recordings);
      this._recordingsDayAvailabilityCache.set(
        committed.key,
        committed.hasRecordings,
      );
    }
    this._cacheActiveCamSlice("recordings", this._recordings);
    this._renderListLabel(this._winEnd);
    this._clearRecordingsSwipeListState();
    this._lastRenderedListHtml = "";
    this._renderList();
  }

  _bounceRecordingsArea(direction) {
    const browse = this._$("#browse");
    if (!browse) return;
    const cls = direction > 0 ? "swipe-bounce-next" : "swipe-bounce-prev";
    browse.classList.remove("swipe-bounce-prev", "swipe-bounce-next");
    void browse.offsetWidth;
    browse.classList.add(cls);
    setTimeout(() => {
      browse.classList.remove(cls);
    }, 280);
  }

  _scrollEventsToTop() {
    const list = this._$("#list");
    const browse = this._$("#browse");
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
  }

  _isCardVisible() {
    return this._viewportContextController.isCardVisible();
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
    const delay =
      reason === "card-editor-close" ||
      reason === "watchdog-dialog-close" ||
      reason === "watchdog-dashboard-edit-on" ||
      reason === "watchdog-dashboard-edit-off"
        ? 40
        : 140;
    this._resumeLiveT = setTimeout(() => {
      this._resumeLiveIfNeeded(reason);
    }, delay);
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
    const vv = window.visualViewport;
    const vw = Math.max(1, Math.round(vv?.width || window.innerWidth || 0));
    const vh = Math.max(1, Math.round(vv?.height || window.innerHeight || 0));
    const ox = Math.round(vv?.offsetLeft || 0);
    const oy = Math.round(vv?.offsetTop || 0);
    video.style.setProperty("position", "fixed", "important");
    video.style.setProperty("top", `${oy}px`, "important");
    video.style.setProperty("left", `${ox}px`, "important");
    video.style.setProperty("width", `${vw}px`, "important");
    video.style.setProperty("height", `${vh}px`, "important");
    video.style.setProperty("max-width", "none", "important");
    video.style.setProperty("max-height", "none", "important");
    video.style.setProperty("z-index", "1402", "important");
    video.style.setProperty("object-fit", "contain", "important");
    video.style.setProperty("background", "var(--c-bg-deep)", "important");
    video.style.setProperty("transform", "none", "important");
    video.style.setProperty("margin", "0", "important");
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
  _setLiveNativeControls(enabled) {
    const controlsPlan = resolveRotateOverlayNativeControlsPlan({ enabled });
    const expected = controlsPlan.expectedActive;
    const apply = () => {
      if (!!this._rotateOverlayActive !== expected) return;
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
    });
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
    const rotateState = resolveRotateOverlayState({
      isMobileTabletViewport: this._isMobileTabletViewport(),
      isLandscapeViewport: this._isLandscapeViewport(),
      popupOpen,
      popupMediaVisible,
      currentMode: this._rotateOverlayMode,
      isActive: this._rotateOverlayActive,
    });
    const uiPlan = resolveRotateOverlayUiPlan(rotateState);

    if (this._rotateOverlayExitT) {
      clearTimeout(this._rotateOverlayExitT);
      this._rotateOverlayExitT = null;
    }

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

    this._rotateOverlayExitT = setTimeout(() => {
      const c = this._$("#card");
      if (c && exitPlan.removeClasses.length) {
        c.classList.remove(...exitPlan.removeClasses);
      }
      this._rotateOverlayExitT = null;
      if (this._resumeLiveT) return;
      if (exitPlan.syncFullscreenButtons) {
        this._syncFullscreenButtonsVisibility();
      }
    }, exitPlan.delayMs);
  }
  _kickLiveIfStale(force = false) {
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
      this._mountEngine();
    }
  }

  _resumeLiveIfNeeded(_reason = "") {
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
        this._resumeLiveIfNeeded("wait-ready");
      }, action.retryDelayMs);
      return;
    }

    if (action.shouldRevealEngineWrap) {
      const engWrap = this._$("#eng-wrap");
      if (engWrap) engWrap.style.display = "";
    }
    if (action.shouldKickNow) {
      this._kickLiveIfStale(true);
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
      this._cardWidth = w;
      const visibleNow = w > 2 && h > 2;
      if (visibleNow && !this._wasVisible) {
        this._scheduleResumeLive("resize-visible");
      }
      this._wasVisible = visibleNow;
      if (prevW > 0 && Math.round(w) === Math.round(prevW)) return;
      const card = this.shadowRoot.querySelector(".card");
      if (!card) return;
      const wide = w >= 560,
        mobile = w < 420;
      card.classList.toggle("wide", wide);
      card.classList.toggle("mobile", mobile);
      this._applyBrowse();
      this._scheduleRotateOverlayUpdate();
    });
    this._ro.observe(this);
    if (!this._io && "IntersectionObserver" in window) {
      this._io = new IntersectionObserver(
        (entries) => {
          const e = entries[0];
          if (e?.isIntersecting) {
            this._scheduleResumeLive("intersection");
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
  _openPopup() {
    const popup = this._$("#myPopup");
    if (!popup) return;
    this._pauseSlideshowForPopup();
    popup.classList.add("is-open");
    popup.style.transform = "translateY(0)";
    const body = popup.querySelector(".popup-body");
    if (body) body.scrollTop = 0;
    this._setLivePopupCover(true);
    this._applyLiveMuteChange(true, { source: "popup-open" });
    this._syncFullscreenButtonsVisibility();
    this._scheduleRotateOverlayUpdate();
  }
  _stopPopupMedia() {
    this._clearPopupMediaCleanup();
    const viewer = this._$("#viewer");
    if (!viewer) return;

    const cleanupVideos = (dropSources) => {
      viewer.querySelectorAll("video").forEach((v) => {
        try {
          v.pause();
          if (dropSources) {
            if ("srcObject" in v) v.srcObject = null;
            v.removeAttribute("src");
            v.querySelectorAll("source").forEach((s) => s.remove());
          }
        } catch (_) {}
      });
      if (dropSources) viewer.innerHTML = "";
    };

    const deferSourceDrop =
      this._isFirefox() &&
      this._popupMediaType &&
      this._popupMediaType !== "recording";
    if (deferSourceDrop) {
      cleanupVideos(false);
      this._popupMediaStopTimer = setTimeout(() => {
        this._popupMediaStopTimer = null;
        cleanupVideos(true);
      }, 1200);
    } else {
      cleanupVideos(true);
    }

    this._resetPopupMediaSurfaceState(viewer);
  }

  _resetPopupMediaSurfaceState(viewer) {
    viewer.style.display = "none";
    const controls = this._$("#popup-media-controls");
    if (controls) {
      controls.hidden = true;
      controls.classList.remove("is-hidden");
    }
    const carouselWrap = this._$("#popup-carousel-wrap");
    const carousel = this._$("#popup-carousel");
    if (carouselWrap) carouselWrap.hidden = true;
    if (carousel) carousel.innerHTML = "";
    this._hidePopupInfo();
    this._popupMediaType = "";
    this._playing = null;
  }

  _closePopup() {
    const popup = this._$("#myPopup");
    if (!popup) return;
    popup.classList.remove("is-open");
    popup.style.transform = "translateY(100%)";
    this._setLivePopupCover(false);
    this._applyLiveMuteChange(true, { source: "popup-close" });
    this._syncFullscreenButtonsVisibility();
    this._scheduleRotateOverlayUpdate();

    this._stopPopupMedia();
    this._resumeSlideshowAfterPopup();
  }
  _initPopupInteractions() {
    const popup = this._$("#myPopup");
    if (!popup) return;
    if (this._popupDragController) {
      this._popupDragController.dispose();
      this._popupDragController = null;
    }
    this._popupDragController = new PopupDragController({
      popup,
      eventTarget: document,
      closeThreshold: 100,
      closePopup: () => this._closePopup(),
      isPopupOpen: () => popup.classList.contains("is-open"),
    });
    this._popupDragController.bind();
  }
  _click(e) {
    const target = e.target;
    if (target.closest(".close-btn")) return this._closePopup();
    if (this._handleToolbarClick(target)) return;
    if (this._handleSidebarClick(target)) return;
    if (this._handleListClick(e, target)) return;
    if (this._handleEventClick(target)) return;
  }
  _handleToolbarClick(target) {
    if (this._handleTopToolbarClick(target)) return true;
    if (this._handlePopupMediaToolbarClick(target)) return true;
    if (this._handleBrowseToolbarClick(target)) return true;
    return false;
  }
  _handleTopToolbarClick(target) {
    if (target.closest("#grid-btn")) {
      this._toggleGridMode();
      return true;
    }
    if (target.closest("#slideshow-btn")) {
      this._toggleSlideshowRotation();
      return true;
    }
    if (target.closest("#live-fs-btn")) {
      this._fullscreen(this._$("#eng-wrap"), { preferLive: true });
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
    if (target.closest("#filter-btn")) {
      this._toggleFilter();
      return true;
    }
    if (target.closest("#cal-btn")) {
      this._toggleCal();
      return true;
    }
    if (target.closest("#controls-btn")) {
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
        void this._navigateRecordingsDayAnimated(dir);
      }
      return true;
    }
    return false;
  }
  _handlePopupMediaToolbarClick(target) {
    if (target.closest("#popup-fs-btn")) {
      this._fullscreen(this._$("#viewer"));
      return true;
    }
    if (target.closest("#mute-btn")) {
      this._toggleMute();
      return true;
    }
    if (target.closest("#popup-media-play")) {
      this._togglePopupMediaPlay();
      return true;
    }
    if (target.closest("#popup-media-mute")) {
      this._togglePopupMediaMute();
      return true;
    }
    if (target.closest("#popup-media-fs")) {
      this._fullscreen(this._$("#viewer"));
      this._showPopupControlsTemporarily();
      return true;
    }
    const carouselNav = target.closest("[data-carousel-dir]");
    if (carouselNav) {
      const dir = Number(carouselNav.dataset.carouselDir || 0);
      if (dir) this._scrollPopupCarousel(dir);
      return true;
    }
    return false;
  }
  _handleSidebarClick(target) {
    if (this._handlePreviewSidebarClick(target)) return true;
    if (this._handleSidebarNavigationClick(target)) return true;
    if (this._handleSidebarCameraClick(target)) return true;
    if (this._handleSidebarCalendarClick(target)) return true;
    if (this._handleSidebarFilterClick(target)) return true;
    return false;
  }
  _handleSidebarFilterClick(target) {
    const fopt = target.closest("[data-flabel]");
    if (fopt) {
      this._filterLabel = fopt.dataset.flabel;
      this._renderFilter();
      this._renderList();
      return true;
    }
    const zopt = target.closest("[data-fzone]");
    if (zopt) {
      this._filterZone = zopt.dataset.fzone;
      this._renderFilter();
      this._renderList();
      return true;
    }
    const favo = target.closest("[data-favonly]");
    if (favo) {
      this._favOnly = favo.dataset.favonly === "1";
      this._renderFilter();
      this._renderList();
      return true;
    }
    return false;
  }
  _handleSidebarCalendarClick(target) {
    const calDay = target.closest("[data-cal-day]");
    if (calDay) {
      this._pickDay(calDay.dataset.calDay);
      return true;
    }
    const calNav = target.closest("[data-cal-nav]");
    if (calNav) {
      this._calNav(Number(calNav.dataset.calNav));
      return true;
    }
    const calToday = target.closest("[data-cal-today]");
    if (calToday) {
      this._goTodayInCalendar();
      return true;
    }
    return false;
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
      this._navigateToPageRoute(pageRoute.dataset.pageRoute, {
        source: "page-nav",
      });
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
      );
      return true;
    }
    const previewCell = target.closest("[data-preview-camidx]");
    if (previewCell && this._isPreviewPageActive()) {
      this._exitPreviewPageToCamera(Number(previewCell.dataset.previewCamidx));
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
    if (this._handleControlsListClick(e, target)) return true;
    if (this._handlePrimaryListItemClick(e, target)) return true;
    if (this._handleListNavigationClick(e, target)) return true;
    return this._handleRecordingsListClick(e, target);
  }
  _handleRecordingsListClick(e, target) {
    const recDl = target.closest("[data-rec-dl-start]");
    if (recDl) {
      e.stopPropagation();
      const rs = Number(recDl.dataset.recDlStart);
      const re = Number(recDl.dataset.recDlEnd);
      if (Number.isFinite(rs) && Number.isFinite(re) && re > rs) {
        this._downloadRecRange(rs, re);
      }
      return true;
    }
    const recRow = target.closest("[data-rs]");
    if (recRow) {
      if (this._tab === "recordings" && this._recordingsSwipeBlockTap) {
        e.stopPropagation();
        e.preventDefault();
        return true;
      }
      this._showRecording(+recRow.dataset.rs, +recRow.dataset.re);
      return true;
    }
    return false;
  }
  _handleListNavigationClick(e, target) {
    const donut = target.closest("[data-tab]");
    if (donut) {
      this._setTab(donut.dataset.tab);
      return true;
    }
    const olderHint = target.closest("#older-hint");
    if (olderHint && olderHint.classList.contains("to-top")) {
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
    const dl = target.closest("[data-dl]");
    if (dl) {
      e.stopPropagation();
      this._download(dl.dataset.dl, dl.dataset.dlFile);
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
      this._showClipById(revOpen.dataset.reviewOpen, {
        mediaType: "alert",
        startTime: review?.start_time,
        camera: review?.camera,
      });
      return true;
    }
    return false;
  }
  _handleControlsListClick(e, target) {
    if (!isControlsReadoutClearTarget(target)) return false;
    e.stopPropagation();
    this._clearControlsReadout();
    return true;
  }
  _handleEventClick(target) {
    const card = target.closest("[data-ev]");
    if (!card) return false;
    this._open(card.dataset.ev);
    return true;
  }
  _setTab(tab) {
    const prevTab = this._tab;
    this._tab = tab;
    if (tab !== "controls") {
      this._lastNonControlsTab = tab;
    }
    this.shadowRoot
      .querySelectorAll("[data-tab]")
      .forEach((p) => p.classList.toggle("active", p.dataset.tab === tab));
    const filterBtn = this._$("#filter-btn");
    if (filterBtn)
      filterBtn.disabled = tab === "recordings" || tab === "controls";
    if (tab === "recordings" || tab === "controls") {
      const filterPanel = this._$("#filter-panel");
      if (filterPanel) filterPanel.style.display = "none";
    } else {
      this._normalizeFilterSelections();
      if (this._$("#filter-panel")?.style.display !== "none") {
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
    const list = this._$("#list");
    const browse = this._$("#browse");
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

  _hidePopupInfo() {
    const head = this._$("#popup-info-head");
    const info = this._$("#popup-info");
    this._teardownRecordingScrub();
    const scrub = this._$("#recording-scrub");
    if (scrub) scrub.hidden = true;
    if (head) {
      head.textContent = "";
      head.hidden = true;
    }
    if (info) {
      info.innerHTML = "";
      info.hidden = true;
    }
  }

  _teardownRecordingScrub() {
    if (this._recordingScrubController) {
      try {
        this._recordingScrubController.dispose();
      } catch (_) {}
    }
    this._recordingScrubController = null;
    this._recordingScrubState = null;
  }

  _setRecordingScrubCursor(timeSec) {
    const state = this._recordingScrubState;
    if (!state?.cursor || !Number.isFinite(timeSec)) return;
    const span = Math.max(1, state.end - state.start);
    const pct = ((timeSec - state.start) / span) * 100;
    state.cursor.style.left = `${Math.max(0, Math.min(100, pct))}%`;
    if (state.labelNow) {
      const rel = Math.max(0, Math.min(span, timeSec - state.start));
      state.labelNow.textContent = `${this._fmtScrubTime(rel)} / ${this._fmtScrubTime(span)}`;
    }
  }

  _fmtScrubTime(sec) {
    return formatRecordingScrubTime(sec);
  }

  _closestRecordingAlertStart(targetSec, alerts, thresholdSec) {
    return resolveClosestRecordingAlertStart(targetSec, alerts, thresholdSec);
  }

  _resolveRecordingScrubTarget(ratio) {
    const state = this._recordingScrubState;
    if (!state?.video) return null;
    return resolveRecordingScrubTarget({
      ratio,
      start: state.start,
      end: state.end,
      alerts: state.alerts,
    });
  }

  _seekRecordingScrubToRatio(ratio, { commit = false } = {}) {
    const state = this._recordingScrubState;
    if (!state?.video) return;
    const target = this._resolveRecordingScrubTarget(ratio);
    if (!target) return;

    state.pendingAbsTarget = target.absTarget;
    state.pendingRelTarget = target.relTarget;
    this._setRecordingScrubCursor(target.absTarget);

    if (!commit) return;

    const rel = Number(state.pendingRelTarget);
    if (!Number.isFinite(rel)) return;
    void this._commitRecordingSeek(state, rel, target.absTarget);
  }

  _isRecordingTimeSeekable(video, targetSec, toleranceSec = 0.35) {
    if (!video) return false;
    return isRecordingSeekTargetInRange({
      targetSec,
      seekable: video.seekable,
      toleranceSec,
    });
  }

  async _attemptRecordingSeek(video, targetSec, timeoutMs = 2500) {
    if (!video || !Number.isFinite(targetSec)) return false;
    return await new Promise((resolve) => {
      let done = false;
      const finish = (ok) => {
        if (done) return;
        done = true;
        cleanup();
        resolve(ok);
      };
      const verify = () => {
        finish(
          isRecordingSeekVerified({
            currentTime: video.currentTime,
            targetSec,
          }),
        );
      };
      const onDone = () => verify();
      const onError = () => finish(false);
      const cleanup = () => {
        clearTimeout(timer);
        video.removeEventListener("seeked", onDone);
        video.removeEventListener("timeupdate", onDone);
        video.removeEventListener("error", onError);
      };
      const timer = setTimeout(() => verify(), timeoutMs);

      video.addEventListener("seeked", onDone, { once: true });
      video.addEventListener("timeupdate", onDone, { once: true });
      video.addEventListener("error", onError, { once: true });

      try {
        const plan = resolveRecordingSeekExecutionPlan({
          hasFastSeek: typeof video.fastSeek === "function",
          isEdge: this._isEdge(),
          isIOS,
        });
        if (plan.shouldUseFastSeek) {
          video.fastSeek(targetSec);
        } else {
          video.currentTime = targetSec;
        }
      } catch (_) {
        finish(false);
      }
    });
  }

  async _commitRecordingSeek(state, relTarget, absTarget) {
    if (
      !state?.video ||
      !Number.isFinite(relTarget) ||
      !Number.isFinite(absTarget)
    )
      return;

    state.seekNonce = Number(state.seekNonce || 0) + 1;
    const nonce = state.seekNonce;
    const video = state.video;

    const isFirefox = this._isFirefox();
    const isEdge = this._isEdge();
    const seekTimeout = resolveRecordingSeekTimeout({ isFirefox, isEdge });
    const seekOk = await this._attemptRecordingSeek(
      video,
      relTarget,
      seekTimeout,
    );
    if (nonce !== state.seekNonce) return;

    const outcome = resolveRecordingSeekOutcome({
      isFirefox,
      isEdge,
      seekOk,
      currentTime: video.currentTime,
      relTarget,
      absTarget,
      start: state.start,
      end: state.end,
      resumeAfterScrub: state.resumeAfterScrub,
      isFallbackLoading: state.isFallbackLoading,
    });

    if (outcome.shouldFallback) {
      state.isFallbackLoading = true;
      try {
        await this._showRecording(outcome.fallbackStart, outcome.fallbackEnd);
      } finally {
        state.isFallbackLoading = false;
      }
      return;
    }

    if (outcome.shouldResumePlayback) {
      video.play?.().catch(() => {});
    }
  }

  async _fetchRecordingAlerts(clientId, cam, start, end) {
    const cacheKey = `${clientId}|${cam}|${Math.floor(start)}|${Math.floor(end)}`;
    if (this._recordingAlertCache.has(cacheKey)) {
      return this._recordingAlertCache.get(cacheKey);
    }
    const reviews = await this._fetchWindowedReviews(clientId, cam, start, end);
    const alerts = (Array.isArray(reviews) ? reviews : [])
      .map((r) => {
        const severity = String(
          r?.severity || r?.data?.severity || "detection",
        ).toLowerCase();
        if (!["alert", "detection"].includes(severity)) return null;
        const rs = Math.max(start, Number(r?.start_time || start));
        const re = Math.min(end, Number(r?.end_time || rs + 1));
        return {
          id: r?.id || `${rs}-${re}`,
          start: rs,
          end: re > rs ? re : rs + 1,
          severity,
        };
      })
      .filter(Boolean)
      .sort((a, b) => a.start - b.start);
    this._recordingAlertCache.set(cacheKey, alerts);
    return alerts;
  }

  async _initRecordingScrub({
    clientId,
    cam,
    start,
    end,
    video,
    token,
    sourceUrl,
  }) {
    const scrub = this._$("#recording-scrub");
    const track = this._$("#recording-scrub-track");
    const ticks = this._$("#recording-scrub-ticks");
    const markers = this._$("#recording-scrub-markers");
    const cursor = this._$("#recording-scrub-cursor");
    const labelStart = this._$("#recording-scrub-start");
    const labelNow = this._$("#recording-scrub-now");
    const labelEnd = this._$("#recording-scrub-end");
    if (!scrub || !track || !markers || !cursor || !video) return;

    this._teardownRecordingScrub();
    scrub.hidden = false;
    if (ticks) ticks.innerHTML = "";
    markers.innerHTML = "";

    const alerts = await this._fetchRecordingAlerts(
      clientId,
      cam,
      start,
      end,
    ).catch(() => []);
    if (token !== this._playSeq) return;

    const decorations = buildRecordingScrubDecorations({
      start,
      end,
      alerts,
    });
    const span = decorations.span;
    if (labelStart) labelStart.textContent = decorations.labelStart;
    if (labelEnd) labelEnd.textContent = decorations.labelEnd;
    if (labelNow) labelNow.textContent = decorations.labelNow;

    const tickLayer = ticks || markers;
    tickLayer.innerHTML = decorations.tickMarkup;
    markers.innerHTML = decorations.markerMarkup;

    const state = {
      start,
      end,
      alerts,
      video,
      cursor,
      labelNow,
      isScrubbing: false,
      resumeAfterScrub: false,
      pendingAbsTarget: null,
      pendingRelTarget: null,
      seekNonce: 0,
      isFallbackLoading: false,
      sourceUrl: sourceUrl || "",
      sourceUrlNoHash: String(sourceUrl || "").split("#")[0],
    };

    this._recordingScrubState = state;
    this._setRecordingScrubCursor(start);
    this._recordingScrubController = new RecordingScrubController({
      track,
      video,
      ticks,
      markers,
      state,
      setCursor: (timeSec) => this._setRecordingScrubCursor(timeSec),
      seekToRatio: (ratio, options) =>
        this._seekRecordingScrubToRatio(ratio, options),
    });
    this._recordingScrubController.bind();
  }

  _popupInfoModel(ev = null, opts = {}) {
    const id = ev?.id || opts.id || "";
    const mediaType = opts.mediaType || (ev?.has_clip ? "clip" : "snapshot");
    const showWithoutEvent = mediaType === "recording";
    const hasContent = !!ev || !!id || showWithoutEvent;
    if (!hasContent) return null;

    const titleLabel = ev?.label ? cap(ev.label) : cap(mediaType || "event");
    const score =
      opts.score != null
        ? opts.score
        : ev?.top_score != null
          ? `${Math.round(ev.top_score * 100)}%`
          : "-";
    const zone = opts.zone || (ev?.zones?.length ? ev.zones[0] : "-");
    const objects =
      opts.objects ||
      (ev?.data?.objects?.length
        ? ev.data.objects.map(cap).join(", ")
        : ev?.label
          ? cap(ev.label)
          : "-");
    const startTs = opts.startTime ?? ev?.start_time;
    const time = startTs ? this._time(startTs) : "-";
    const dayDate = startTs
      ? `${this._weekday(startTs)} - ${this._monthDay(startTs, { ordinal: true })}`
      : "-";
    const duration =
      opts.durationSec != null
        ? `${Math.max(1, Math.round(opts.durationSec))}s`
        : ev
          ? `${this._dur(ev)}s`
          : "-";
    const camera =
      (opts.camera || ev?.camera || this._cc().cam || "").replace(/_/g, " ") ||
      "-";
    const hasClip = ev?.has_clip ?? mediaType === "clip";
    const downloadFile =
      mediaType === "recording"
        ? ""
        : mediaType === "snapshot"
          ? "snapshot.jpg"
          : hasClip
            ? "clip.mp4"
            : "snapshot.jpg";
    const downloadLabel =
      mediaType === "recording"
        ? "Download recording"
        : downloadFile === "snapshot.jpg"
          ? "Download snapshot"
          : "Download clip";

    return {
      id,
      mediaType,
      titleLabel,
      score,
      zone,
      objects,
      dayDate,
      time,
      duration,
      camera,
      downloadFile,
      downloadLabel,
      recStart: opts.recStart,
      recEnd: opts.recEnd,
    };
  }

  _renderPopupInfo(ev = null, opts = {}) {
    const head = this._$("#popup-info-head");
    const info = this._$("#popup-info");
    const scrub = this._$("#recording-scrub");
    if (!info || !head) return;

    const model = this._popupInfoModel(ev, opts);
    if (!model) {
      this._hidePopupInfo();
      return;
    }

    if (model.mediaType !== "recording") {
      this._teardownRecordingScrub();
      if (scrub) scrub.hidden = true;
    }

    head.textContent = `${cap(model.mediaType || "media")} - ${model.camera} - ${model.dayDate} - ${model.time}`;
    head.hidden = false;

    const isRecordingDl =
      model.mediaType === "recording" &&
      Number.isFinite(model.recStart) &&
      Number.isFinite(model.recEnd);
    const downloadBtn = isRecordingDl
      ? `<button class="popup-action" data-rec-dl-start="${Math.floor(model.recStart)}" data-rec-dl-end="${Math.floor(model.recEnd)}" title="${model.downloadLabel}" aria-label="${model.downloadLabel}">${ICONS.download}</button>`
      : model.id
        ? `<button class="popup-action" data-dl="${model.id}" data-dl-file="${model.downloadFile}" title="${model.downloadLabel}" aria-label="${model.downloadLabel}">${ICONS.download}</button>`
        : "";

    info.innerHTML = `
          <div class="popup-info-title">
            <span class="tb" style="background:${labelColor(ev?.label || model.mediaType)}33;color:${labelColor(ev?.label || model.mediaType)}">${model.titleLabel}</span>
            ${ev?.sub_label ? `<span class="subl">${ev.sub_label}</span>` : ""}
          </div>

          <div class="popup-info-body">
            <div class="popup-info-grid">
              <div class="popup-info-row"><span class="popup-info-k">Camera</span><span class="popup-info-v">${model.camera}</span></div>
              <div class="popup-info-row"><span class="popup-info-k">Day/Date</span><span class="popup-info-v">${model.dayDate}</span></div>
              <div class="popup-info-row"><span class="popup-info-k">Time</span><span class="popup-info-v">${model.time}</span></div>
              <div class="popup-info-row"><span class="popup-info-k">Duration</span><span class="popup-info-v">${model.duration}</span></div>
              <div class="popup-info-row"><span class="popup-info-k">Objects</span><span class="popup-info-v">${model.objects}</span></div>
              <div class="popup-info-row"><span class="popup-info-k">Zone</span><span class="popup-info-v">${model.zone}</span></div>
              <div class="popup-info-row"><span class="popup-info-k">Score</span><span class="popup-info-v">${model.score}</span></div>
            </div>
            <div class="popup-info-actions">${downloadBtn}</div>
          </div>
        `;
    info.hidden = false;
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
    const btn = this._$("#mute-btn");
    if (!btn) return;
    const hideMute = this._viewMode === "grid";
    btn.hidden = hideMute;
    btn.style.display = hideMute ? "none" : "";
    if (hideMute) return;
    const label = this._streamMuted ? "Unmute live view" : "Mute live view";
    btn.title = label;
    btn.setAttribute("aria-label", label);
    btn.innerHTML = this._streamMuted ? ICONS.volOff : ICONS.volOn;
  }

  _timezoneDisplay() {
    const tz = this._hass?.config?.time_zone || "UTC";
    try {
      const parts = new Intl.DateTimeFormat(undefined, {
        timeZone: tz,
        timeZoneName: "longGeneric",
      }).formatToParts(new Date());
      const tzName = parts.find((p) => p.type === "timeZoneName")?.value || tz;
      return `${tzName} (${tz})`;
    } catch (_) {
      return tz.replace(/_/g, " ");
    }
  }

  _applyLiveMuteChange(nextMuted, { source = "button" } = {}) {
    this._setLiveMuted(nextMuted);
    this._renderMuteButton();

    // HA direct live players can fail to start audio when the stream was
    // originally mounted muted. Apply the same recovery whether unmute came
    // from our button or native rotated-overlay controls.
    const nativeOverlayUnmute =
      source === "native-controls" && this._rotateOverlayActive;
    const needsHaDirectRecovery =
      this._useHaDirectStreamPath() &&
      !nextMuted &&
      (!nativeOverlayUnmute || this._engineMountedMuted);
    if (needsHaDirectRecovery) {
      this._mountEngine(null, { quiet: true });
      return;
    }
    if (!nextMuted) this._engineMountedMuted = false;
  }

  _toggleMute() {
    const nextMuted = !this._streamMuted;
    this._applyLiveMuteChange(nextMuted, { source: "button" });
  }

  _syncFullscreenButtonsVisibility() {
    const liveBtn = this._$("#live-fs-btn");
    const popupBtn = this._$("#popup-fs-btn");
    const popupControlsFsBtn = this._$("#popup-media-fs");
    const popupOpen = this._$("#myPopup")?.classList.contains("is-open");
    const isFullscreen = !!(
      document.fullscreenElement || document.webkitFullscreenElement
    );
    const inGridMode = this._viewMode === "grid";
    const visibility = resolveFullscreenButtonVisibility({
      popupOpen: !!popupOpen,
      isFullscreen,
      inGridMode,
      rotateOverlayMode: this._rotateOverlayMode,
      suppressPopupButton: this._usePopupCustomControls(this._popupMediaType),
    });
    if (liveBtn) liveBtn.hidden = visibility.liveButtonHidden;
    if (popupBtn) popupBtn.hidden = visibility.popupButtonHidden;
    if (popupControlsFsBtn)
      popupControlsFsBtn.hidden = visibility.popupControlsFullscreenHidden;
  }

  _open(id) {
    const ev =
      this._allDisplayEvents().find((e) => e.id === id) ||
      (this._tab === "kept"
        ? (this._kept || []).find((e) => e.id === id)
        : null);
    if (!ev) return;
    if (this._tab === "kept") {
      if (ev.has_clip) this._showClip(ev, { mediaType: "kept" });
      else this._showSnapshot(ev, { mediaType: "kept" });
      return;
    }
    if (this._tab === "snapshot" || (!ev.has_clip && ev.has_snapshot))
      this._showSnapshot(ev);
    else if (ev.has_clip)
      this._showClip(ev, {
        mediaType: this._tab === "kept" ? "kept" : "clip",
      });
    else this._showSnapshot(ev);
  }
  _enter() {
    const v = this._$("#viewer");
    v.style.display = "flex";
    this._openPopup();
  }
  _setLivePopupCover(covered) {
    const engWrap = this._$("#eng-wrap");
    if (!engWrap) return;
    engWrap.classList.toggle("popup-covered", !!covered);
  }
  _isTouchPopupUi() {
    return DEVICE_PROFILE.hasTouch || this._isMobileTabletViewport();
  }
  _isPhonePopupUi() {
    if (DEVICE_PROFILE.isPhone) return true;
    const coarse =
      window.matchMedia?.("(pointer: coarse)")?.matches ||
      window.matchMedia?.("(any-pointer: coarse)")?.matches ||
      false;
    return (
      coarse && Math.min(window.innerWidth || 0, window.innerHeight || 0) <= 560
    );
  }
  _isPopupVideoMediaType(mediaType) {
    return ["alert", "clip", "recording", "kept"].includes(
      String(mediaType || "").toLowerCase(),
    );
  }
  _usePopupCustomControls(mediaType) {
    return this._isPhonePopupUi() && this._isPopupVideoMediaType(mediaType);
  }
  _ensurePopupFullscreenButton(kind = "media") {
    const viewer = this._$("#viewer");
    if (!viewer) return;
    if (this._usePopupCustomControls(kind)) {
      const existingBtn = viewer.querySelector("#popup-fs-btn");
      if (existingBtn) existingBtn.remove();
      return;
    }
    const label =
      kind === "alert"
        ? "Fullscreen alert"
        : kind === "recording"
          ? "Fullscreen recording"
          : "Fullscreen media";
    const existing = viewer.querySelector("#popup-fs-btn");
    if (existing) {
      existing.title = label;
      existing.setAttribute("aria-label", label);
      return;
    }
    const btn = document.createElement("button");
    btn.className = "glass-btn overlay-fs popup-fs-btn";
    btn.id = "popup-fs-btn";
    btn.title = label;
    btn.setAttribute("aria-label", label);
    btn.innerHTML = ICONS.expand;
    viewer.appendChild(btn);
  }
  _clearPopupMediaCleanup() {
    if (this._popupControlsHideTimer) {
      clearTimeout(this._popupControlsHideTimer);
      this._popupControlsHideTimer = null;
    }
    if (this._popupMediaStopTimer) {
      clearTimeout(this._popupMediaStopTimer);
      this._popupMediaStopTimer = null;
    }
    if (this._popupMediaControlsController) {
      try {
        this._popupMediaControlsController.dispose();
      } catch (_) {}
    }
    this._popupMediaControlsController = null;
    if (!this._popupMediaCleanup) return;
    try {
      this._popupMediaCleanup();
    } catch (_) {}
    this._popupMediaCleanup = null;
    this._destroyRecordingHls();
  }

  _destroyRecordingHls() {
    if (!this._recordingHls) return;
    try {
      this._recordingHls.destroy();
    } catch (_) {}
    this._recordingHls = null;
  }

  async _getHlsJsCtor() {
    const existing = window.Hls;
    if (existing) return existing;
    if (!this._hlsJsCtorPromise) {
      this._hlsJsCtorPromise = new Promise((resolve) => {
        const script = document.createElement("script");
        script.src =
          "https://cdn.jsdelivr.net/npm/hls.js@1.5.17/dist/hls.min.js";
        script.async = true;
        script.onload = () => resolve(window.Hls || null);
        script.onerror = () => resolve(null);
        document.head.appendChild(script);
      });
    }
    return await this._hlsJsCtorPromise;
  }

  _recordingPreferHls() {
    return DEVICE_PROFILE.isIOS || this._isFirefox() || this._isEdge();
  }
  _popupMediaVideo() {
    const viewer = this._$("#viewer");
    if (!viewer) return null;
    return viewer.querySelector("video");
  }
  _popupMediaCurrentId() {
    if (this._playing?.id) return this._playing.id;
    return "";
  }
  _showPopupControlsTemporarily() {
    const controls = this._$("#popup-media-controls");
    if (!controls || controls.hidden) return;
    controls.classList.remove("is-hidden");
    if (this._popupControlsHideTimer)
      clearTimeout(this._popupControlsHideTimer);
    if (this._rotateOverlayMode !== "popup") return;
    this._popupControlsHideTimer = setTimeout(() => {
      const el = this._$("#popup-media-controls");
      if (el && !el.hidden) el.classList.add("is-hidden");
    }, 2200);
  }

  _showLiveControlsTemporarily(ms = 2200) {
    const wrap = this._$("#eng-wrap");
    if (!wrap) return;
    wrap.classList.add("live-controls-visible");
    if (this._liveControlsHideTimer) clearTimeout(this._liveControlsHideTimer);
    if (this._rotateOverlayMode !== "live") return;
    this._liveControlsHideTimer = setTimeout(
      () => {
        const nextWrap = this._$("#eng-wrap");
        if (nextWrap && this._rotateOverlayMode === "live") {
          nextWrap.classList.remove("live-controls-visible");
        }
        this._liveControlsHideTimer = null;
      },
      Math.max(500, Number(ms) || 2200),
    );
  }
  _updatePopupMediaButtons(video) {
    const playBtn = this._$("#popup-media-play");
    const muteBtn = this._$("#popup-media-mute");
    const progress = this._$("#popup-media-progress");
    const time = this._$("#popup-media-time");
    if (!playBtn || !muteBtn || !progress || !time) return;
    const controlState = buildPopupMediaControlState({
      duration: video?.duration,
      currentTime: video?.currentTime,
      paused: video?.paused,
      muted: video?.muted,
      formatTime: (value) => this._fmtScrubTime(value),
    });
    progress.value = controlState.progressValue;
    playBtn.innerHTML = controlState.showPauseIcon ? ICONS.pause : ICONS.play;
    muteBtn.innerHTML = controlState.showMutedIcon ? ICONS.volOff : ICONS.volOn;
    time.textContent = controlState.timeText;
  }
  _togglePopupMediaPlay() {
    const v = this._popupMediaVideo();
    if (!v) return;
    if (v.paused) v.play?.().catch(() => {});
    else v.pause?.();
    this._showPopupControlsTemporarily();
    this._updatePopupMediaButtons(v);
  }
  _togglePopupMediaMute() {
    const v = this._popupMediaVideo();
    if (!v) return;
    v.muted = !v.muted;
    this._showPopupControlsTemporarily();
    this._updatePopupMediaButtons(v);
  }
  _initPopupMediaControls(video, mediaType) {
    const controls = this._$("#popup-media-controls");
    if (!controls || !video) return;
    const controlsPlan = resolvePopupMediaControlsInitPlan({
      shouldUseCustomControls: this._usePopupCustomControls(mediaType),
    });
    video.controls = controlsPlan.videoControlsEnabled;
    if (controlsPlan.removeVideoControlsAttribute) {
      video.removeAttribute("controls");
    }
    if (controlsPlan.setVideoControlsAttribute) {
      video.setAttribute("controls", "");
    }
    controls.hidden = controlsPlan.controlsHidden;
    if (controlsPlan.resetControlsHiddenClass) {
      controls.classList.remove("is-hidden");
    }
    if (!controlsPlan.shouldBindCustomControls) return;

    const progress = this._$("#popup-media-progress");
    const listenerPlan = resolvePopupMediaControlsListenerPlan({
      hasProgressControl: !!progress,
    });
    const sync = () => {
      const playBtn = this._$("#popup-media-play");
      const muteBtn = this._$("#popup-media-mute");
      const time = this._$("#popup-media-time");
      const controlState = buildPopupMediaControlState({
        duration: video.duration,
        currentTime: video.currentTime,
        paused: video.paused,
        muted: video.muted,
        formatTime: (value) => this._fmtScrubTime(value),
      });
      if (playBtn)
        playBtn.innerHTML = controlState.showPauseIcon
          ? ICONS.pause
          : ICONS.play;
      if (muteBtn)
        muteBtn.innerHTML = controlState.showMutedIcon
          ? ICONS.volOff
          : ICONS.volOn;
      if (time) time.textContent = controlState.timeText;
    };
    const syncButtons = ({ progressDragging = false } = {}) => {
      sync();
      if (!progressDragging) this._updatePopupMediaButtons(video);
    };
    this._popupMediaControlsController = new PopupMediaControlsController({
      controls,
      progress,
      video,
      listenerPlan,
      onShowNow: () => {
        if (this._popupControlsHideTimer)
          clearTimeout(this._popupControlsHideTimer);
        controls.classList.remove("is-hidden");
      },
      onShowTemporarily: () => this._showPopupControlsTemporarily(),
      onSync: syncButtons,
    });
    this._popupMediaControlsController.bind();
  }
  _carouselEventItem(ev, activeId = "") {
    if (!ev?.id) return "";
    const thumbFile = "thumbnail.jpg";
    const thumb = `<img src="${this._media(ev.id, thumbFile)}" loading="lazy" data-thumb-id="${ev.id}" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'"><div class="tph" style="display:none">${ICONS.person}</div>`;
    return buildPopupCarouselItemMarkup({
      event: ev,
      activeId,
      thumbnailHtml: thumb,
      title: this._dateTimeLabel(ev.start_time || 0),
      label: cap(ev.label || "event"),
      time: this._time(ev.start_time || 0),
    });
  }
  _popupCarouselEvents(mediaType) {
    return buildPopupCarouselEvents({
      mediaType,
      kept: this._kept || [],
      reviews: this._reviews || [],
      displayEvents: this._allDisplayEvents(),
      findEventById: (id) => this._findEventById(id),
    });
  }
  _renderPopupCarousel(mediaType, activeId = "") {
    const wrap = this._$("#popup-carousel-wrap");
    const row = this._$("#popup-carousel");
    if (!wrap || !row) return;
    const contentPlan = buildPopupCarouselContentPlan({
      mediaType,
      events: this._popupCarouselEvents(mediaType),
      activeId,
      isTouchUi: this._isTouchPopupUi(),
      renderEvent: (ev, currentActiveId) =>
        this._carouselEventItem(ev, currentActiveId),
    });
    if (contentPlan.shouldClear) {
      row.innerHTML = "";
    }
    wrap.hidden = contentPlan.hidden;
    if (!contentPlan.shouldRender) {
      return;
    }
    row.innerHTML = contentPlan.html;
    row.scrollLeft = 0;
    wrap.classList.toggle("touch", contentPlan.touch);
    requestAnimationFrame(() => {
      const active = row.querySelector(".popup-carousel-item.active");
      if (active) {
        const left = resolvePopupCarouselActiveScrollLeft({
          activeOffsetLeft: active.offsetLeft,
        });
        row.scrollLeft = left;
      }
    });
  }
  _scrollPopupCarousel(dir = 1) {
    const row = this._$("#popup-carousel");
    if (!row) return;
    const item = row.querySelector(".popup-carousel-item");
    row.scrollBy(
      buildPopupCarouselScrollPlan({
        itemWidth: item?.getBoundingClientRect?.().width,
        dir,
      }),
    );
  }
  _renderPopupMedia({
    playingId,
    html,
    mediaElement,
    fullscreenKind,
    infoEvent,
    infoOpts,
  }) {
    this._popupMediaLoaderController.renderPopupMedia({
      playingId,
      html,
      mediaElement,
      fullscreenKind,
      infoEvent,
      infoOpts,
    });
  }
  _media(id, file, dl) {
    return `/api/frigate/${this._cc().clientId}/notifications/${id}/${file}${dl ? "?download=true" : ""}`;
  }
  _buildPopupVideo(src, { autoplay = true, muted = true } = {}) {
    return this._popupMediaLoaderController.buildPopupVideo(src, {
      autoplay,
      muted,
    });
  }
  _buildPopupClipSrc(id, file) {
    return this._popupMediaLoaderController.buildPopupClipSrc(id, file);
  }
  _showClip(ev, opts = {}) {
    this._popupMediaLoaderController.showClip(ev, opts);
  }
  _showClipById(id, opts = {}) {
    this._popupMediaLoaderController.showClipById(id, opts);
  }
  _showSnapshot(ev, opts = {}) {
    this._popupMediaLoaderController.showSnapshot(ev, opts);
  }

  async _tryRecordingSource(
    video,
    src,
    { autoplay = true, timeoutMs = 9000 } = {},
  ) {
    return await this._popupMediaLoaderController.tryRecordingSource(
      video,
      src,
      { autoplay, timeoutMs },
    );
  }

  //Play Recordings
  async _showRecording(s, e) {
    await this._popupMediaLoaderController.showRecording(s, e);
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
        try {
          enterVideoFs.call(video);
          return;
        } catch (_) {}
      }
    }

    let reqTarget = el;
    let req = el.requestFullscreen || el.webkitRequestFullscreen;
    if (!req && video) {
      reqTarget = video;
      req = video.requestFullscreen || video.webkitRequestFullscreen;
    }
    if (typeof req === "function") {
      try {
        req.call(reqTarget);
      } catch (_) {}
    }
  }
  _goNow() {
    this._followNowWindow = true;
    const now = Math.floor(Date.now() / 1000);
    this._winEnd = now;
    this._winStart = now - this._config.window_days * DAY;
    this._calSelectedDay = this._formatTzDateString(this._tzParts(now));
    this._exhausted = false;
    this._calMonth = null;
    this._pruneNonActiveCamWindowCaches();
    void (async () => {
      await this._loadWindow(true);
      this._scheduleWarmOtherCamerasEvents();
    })();
  }
  _download(id, file) {
    const a = document.createElement("a");
    a.href = this._media(id, file, true);
    a.download = `${this._cc().cam}_${id}_${file}`;
    document.body.appendChild(a);
    a.click();
    a.remove();
  }
  // ── favorites (realtime) ──────────────────────────────────
  _toggleFav(id) {
    const ev = this._findEventById(id);
    if (!ev) return;
    const ent = this._activeCam?.entity || "";
    const optimistic = buildFavoriteOptimisticMutation({
      id,
      event: ev,
      events: this._events,
      camCache: this._camCache,
      kept: this._kept,
      activeEntity: ent,
    });

    this._events = optimistic.events;
    this._camCache = optimistic.camCache;
    this._kept = optimistic.kept;
    this._renderList();
    const { clientId } = this._cc();
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
          kept: this._kept,
          activeEntity: ent,
        });
        this._events = rollback.events;
        this._camCache = rollback.camCache;
        this._kept = rollback.kept;
        this._renderList();
        console.warn("[Frigate] retain failed", err);
        this._toast("Could not save — check Frigate port config.");
      });
  }
  // ── browse / filter ───────────────────────────────────────
  _applyBrowse() {
    const b = this._$("#browse");
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
    if (this._tab === "recordings") return;
    const p = this._$("#filter-panel");
    if (!p) return;
    const open = p.style.display === "none";
    const cal = this._$("#cal-panel");
    if (cal) cal.style.display = "none";
    p.style.display = open ? "block" : "none";
    this._syncToolbarButtons();
    if (open) this._renderFilter();
  }
  _toggleCal() {
    const p = this._$("#cal-panel");
    if (!p) return;
    const open = p.style.display === "none";
    const filter = this._$("#filter-panel");
    if (filter) filter.style.display = "none";
    p.style.display = open ? "block" : "none";
    this._syncToolbarButtons();
    if (open) {
      if (!this._calMonth) {
        const z = this._tzParts(this._winEnd);
        this._calMonth = this._createCalendarMonthDate(z.year, z.month - 1);
      }
      this._applyCalendarActivityCacheForActiveCamera();
      this._renderCal();
      void this._prefetchCalendarActivityForActiveCamera();
    }
  }
  // ── calendar ──────────────────────────────────────────────
  _formatTzDateString(parts) {
    return `${parts.year}-${String(parts.month).padStart(2, "0")}-${String(parts.day).padStart(2, "0")}`;
  }
  _calendarTodayDateString() {
    return this._formatTzDateString(
      this._tzParts(Math.floor(Date.now() / 1000)),
    );
  }
  _activeCalendarDayDateString() {
    return this._calSelectedDay || this._calendarTodayDateString();
  }
  _goTodayInCalendar() {
    const now = Math.floor(Date.now() / 1000);
    const z = this._tzParts(now);
    this._calSelectedDay = this._formatTzDateString(z);
    this._calMonth = this._createCalendarMonthDate(z.year, z.month - 1);
    this._pickDay(this._calSelectedDay);
  }
  _createCalendarMonthDate(year, monthIndex) {
    // Use a UTC mid-month anchor to keep month identity stable across time zones.
    return new Date(Date.UTC(year, monthIndex, 15, 12, 0, 0));
  }
  _resolveCalendarMonthDate() {
    if (this._calMonth instanceof Date) {
      return new Date(this._calMonth);
    }
    const z = this._tzParts(this._winEnd);
    return this._createCalendarMonthDate(z.year, z.month - 1);
  }
  _calNav(d) {
    const m = this._resolveCalendarMonthDate();
    m.setUTCMonth(m.getUTCMonth() + d);
    this._calMonth = new Date(m);
    this._renderCal();
  }
  _pickDay(ds) {
    this._followNowWindow = false;
    this._calSelectedDay = ds;
    const [y, mo, da] = ds.split("-").map(Number);
    this._winStart = this._tzDateTimeToEpochSeconds(y, mo, da, 0, 0, 0);
    this._winEnd = Math.min(
      this._tzDateTimeToEpochSeconds(y, mo, da, 23, 59, 59),
      Math.floor(Date.now() / 1000),
    );
    this.shadowRoot.querySelector("#cal-panel").style.display = "none";
    this._syncToolbarButtons();
    this._pruneNonActiveCamWindowCaches();
    void (async () => {
      await this._loadWindow(true);
      this._scheduleWarmOtherCamerasEvents();
    })();
  }
  _renderCal() {
    const p = this.shadowRoot.querySelector("#cal-panel");
    if (!p) return;
    const m = this._resolveCalendarMonthDate();
    const activeDayDateString = this._activeCalendarDayDateString();
    p.innerHTML = buildCalendarPanelMarkup({
      monthDate: m,
      activeDayDateString,
      daysWithActivity: this._daysWithActivity,
      timeZone: this._tz(),
    });
  }
  _renderFilter() {
    const p = this.shadowRoot.querySelector("#filter-panel");
    if (!p) return;
    this._normalizeFilterSelections();
    p.innerHTML = buildFilterPanelMarkup({
      labels: ["all", ...this._labels()],
      zones: ["all", ...this._zones()],
      filterLabel: this._filterLabel,
      filterZone: this._filterZone,
      favOnly: this._favOnly,
    });
  }
  async _loadOlder() {
    const before = this._events.length
      ? Math.floor(Math.min(...this._events.map((e) => e.start_time)))
      : this._winStart;
    this._loading = true;
    const { clientId, cam } = this._cc();
    try {
      const older = await this._ws({
        type: "frigate/events/get",
        instance_id: clientId,
        cameras: [cam],
        before,
        limit: 50,
      });
      const arr = Array.isArray(older)
        ? older.filter((o) => !this._events.some((e) => e.id === o.id))
        : [];
      if (!arr.length) this._exhausted = true;
      else {
        this._events = this._events.concat(arr);
        this._winStart = Math.min(
          this._winStart,
          ...arr.map((e) => e.start_time),
        );
      }
    } catch (_) {}
    this._loading = false;
    this._renderList();
    this._renderSubtitle();
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
  _renderAll() {
    if (this._isPreviewPageActive()) {
      this._renderPreviewPage();
      return;
    }
    this._renderStats();
    this._renderMuteButton();
    this._syncFullscreenButtonsVisibility();
    this._syncToolbarButtons();
    this._renderLegend();
    this._renderSubtitle();
    this._renderCamSwitcher();
    this._renderList();
    this._syncStatus();
  }
  _renderStats() {
    this._activeStandardPageController().renderStats();
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
    return new Date(ts * 1000)
      .toLocaleTimeString([], {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
        timeZone: this._tz(),
      })
      .toLowerCase();
  }
  _weekday(ts) {
    return new Date(ts * 1000).toLocaleDateString("en-US", {
      weekday: "short",
      timeZone: this._tz(),
    });
  }
  _monthDay(ts, { ordinal = false } = {}) {
    const parts = new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      timeZone: this._tz(),
    }).formatToParts(new Date(ts * 1000));
    const month = parts.find((p) => p.type === "month")?.value || "";
    const day = Number(parts.find((p) => p.type === "day")?.value || 0);
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

  _recordingsHeadingLabel(ts = null) {
    return this._activeStandardPageController().recordingsHeadingLabel(ts);
  }

  _showStickyDayHeaders() {
    return this._activeStandardPageController().showStickyDayHeaders();
  }

  _renderListLabel(ts = null) {
    this._activeStandardPageController().renderListLabel(ts);
  }
  _dayKey(ts) {
    const parts = new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      timeZone: this._tz(),
    }).formatToParts(new Date(ts * 1000));
    const pick = (type) => parts.find((p) => p.type === type)?.value || "00";
    return `${pick("year")}-${pick("month")}-${pick("day")}`;
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

  _recordingsDayBounds(tsSec = null) {
    return resolveRecordingsDayBounds({
      tsSec,
      fallbackSec: this._winEnd,
      getTzParts: (target) => this._tzParts(target),
      toEpochSeconds: (year, month, day, hour, minute, second) =>
        this._tzDateTimeToEpochSeconds(year, month, day, hour, minute, second),
    });
  }

  _recordingsOffsetDayBounds(offsetDays = 0) {
    return resolveOffsetRecordingsDayBounds({
      offsetDays,
      fallbackSec: this._winEnd,
      getTzParts: (target) => this._tzParts(target),
      toEpochSeconds: (year, month, day, hour, minute, second) =>
        this._tzDateTimeToEpochSeconds(year, month, day, hour, minute, second),
    });
  }

  async _hasRecordingsInBounds(bounds, clientId, cam) {
    const key = buildRecordingsDayCacheKey(clientId, cam, bounds);
    const cached = resolveCachedRecordingsAvailability({
      key,
      dataCache: this._recordingsDayDataCache,
      availabilityCache: this._recordingsDayAvailabilityCache,
    });
    if (cached.found) {
      if (cached.shouldSyncAvailability) {
        this._recordingsDayAvailabilityCache.set(key, cached.hasRecordings);
      }
      return cached.hasRecordings;
    }
    try {
      const recs = await this._ws({
        type: "frigate/recordings/get",
        instance_id: clientId,
        camera: cam,
        after: Math.max(0, bounds.start),
        before: bounds.end,
      });
      const fetched = resolveFetchedRecordingsAvailabilityState(recs);
      this._recordingsDayDataCache.set(key, fetched.recordings);
      this._recordingsDayAvailabilityCache.set(key, fetched.availabilityValue);
      return fetched.hasRecordings;
    } catch (_) {
      const failed = resolveFailedRecordingsAvailabilityState();
      this._recordingsDayAvailabilityCache.set(key, failed.availabilityValue);
      return failed.hasRecordings;
    }
  }

  async _updateRecordingsBrowseNav() {
    if (this._tab !== "recordings") return;
    const prev = this._$("#rec-day-prev");
    const next = this._$("#rec-day-next");
    if (!prev || !next) return;

    const { clientId, cam } = this._cc();
    const current = this._recordingsDayBounds();
    const today = this._recordingsDayBounds(Math.floor(Date.now() / 1000));
    const probePlan = resolveRecordingsBrowseNavProbePlan({
      clientId,
      camera: cam,
      currentBounds: current,
      todayBounds: today,
      prevBounds: this._recordingsOffsetDayBounds(-1),
      nextBounds: this._recordingsOffsetDayBounds(1),
    });
    if (!probePlan.hasContext) {
      prev.disabled = probePlan.initialState.prevDisabled;
      next.disabled = probePlan.initialState.nextDisabled;
      return;
    }

    const token = ++this._recordingsNavUpdateToken;
    prev.disabled = true;
    next.disabled = true;
    const hasPrev = await this._hasRecordingsInBounds(
      probePlan.prevProbeBounds,
      clientId,
      cam,
    );
    if (token !== this._recordingsNavUpdateToken) return;

    let hasNext = false;
    if (probePlan.nextProbeBounds) {
      hasNext = await this._hasRecordingsInBounds(
        probePlan.nextProbeBounds,
        clientId,
        cam,
      );
      if (token !== this._recordingsNavUpdateToken) return;
    }

    const resolvedNavState = resolveRecordingsBrowseNavState({
      currentBounds: current,
      todayBounds: today,
      hasPrev,
      hasNext,
    });
    prev.disabled = resolvedNavState.prevDisabled;
    next.disabled = resolvedNavState.nextDisabled;
  }

  async _stepRecordingsDay(dir) {
    return this._navigateRecordingsDayAnimated(dir);
  }

  _syncBrowseHeadFromScroll() {
    this._activeStandardPageController().syncBrowseHeadFromScroll();
  }
  _dur(ev) {
    return Math.max(
      1,
      Math.round((ev.end_time || Date.now() / 1000) - ev.start_time),
    );
  }
  _reviewSourceEvent(review) {
    return this._browseFilterController.reviewSourceEvent(review);
  }
  _filteredReviews() {
    return this._browseFilterController.filteredReviews();
  }
  _filteredKept() {
    return this._browseFilterController.filteredKept();
  }
  _normalizeFilterSelections() {
    this._browseFilterController.normalizeFilterSelections();
  }
  _zones() {
    return this._browseFilterController.zones();
  }

  _labels() {
    return this._browseFilterController.labels();
  }
  _filtered() {
    return this._browseFilterController.filtered();
  }
  _eventCardHTML(ev, expanded, compact = false) {
    const model = buildEventListItemModel(ev, {
      cap,
      labelColor,
      icons: ICONS,
      media: (id, file) => this._media(id, file),
      durationLabel: (value) => this._dur(value),
      dateTimeLabel: (ts) => this._dateTimeLabel(ts),
      isKeptTab: this._tab === "kept",
      showCameraLabel:
        (this._eventsMode === "all" || this._isGridMixedListMode()) &&
        this._config.cameras.length > 1,
    });
    return buildEventListItemHtml(model, {
      icons: ICONS,
      expanded,
      compact,
    });
  }

  _setListHtmlIfChanged(list, html) {
    if (!list) return false;
    const nextHtml = String(html || "");
    if (this._lastRenderedListHtml === nextHtml) return false;
    list.innerHTML = nextHtml;
    this._lastRenderedListHtml = nextHtml;
    return true;
  }

  _renderList() {
    const list = this._$("#list");
    if (!list) return;
    if (this._tab === "controls") {
      return this._renderControlsTabList(list);
    }
    if (this._tab === "recordings") {
      return this._renderRecordingsTabList(list);
    }
    return this._renderStandardTabList(list);
  }

  _renderControlsTabList(list) {
    this._syncOlderHint(true);
    return this._renderControlsSection(list);
  }

  _renderRecordingsTabList(list) {
    // Don't blow away the recording list while the user is watching a recording.
    if (this._isRecordingViewerActive() && this._playing?.rec != null) return;
    this._syncOlderHint(false);
    return this._renderRecordings(list);
  }

  _isRecordingViewerActive() {
    return this._$("#viewer")?.style.display !== "none";
  }

  _renderStandardTabList(list) {
    if (this._tab === "alerts") {
      this._syncOlderHint(false);
      return this._renderReviews(list);
    }
    if (this._tab === "kept") {
      return this._renderKeptList(list);
    }
    return this._renderEventsList(list);
  }

  _renderControlsSection(list) {
    void this._ensureActiveCameraPtzInfo();
    this._renderListLabel();
    const ptzInfo = this._activeCameraPtzInfo();
    const ptzConfigured = hasCameraPtz(this._activeCam);
    const panTiltEnabled = ptzConfigured && hasPtzPanTiltCapability(ptzInfo);
    const zoomEnabled = ptzConfigured && hasPtzZoomCapability(ptzInfo);
    const focusEnabled = ptzConfigured && hasPtzFocusCapability(ptzInfo);
    this._setListHtmlIfChanged(
      list,
      buildControlsSectionMarkup({
        cameraName: cap(camDisplayName(this._activeCam || {})),
        ptzReady: panTiltEnabled || zoomEnabled || focusEnabled,
        panTiltEnabled,
        zoomEnabled,
        focusEnabled,
      }),
    );
    this._renderControlsReadout();
  }

  _activeCameraHasPtz() {
    return canCameraUsePtz(this._activeCam, this._activeCameraPtzInfo());
  }

  _activeCameraPtzInfo() {
    return this._cc().ptzInfo || null;
  }

  _activeCameraPtzInfoLoading() {
    return !!this._cc().ptzInfoPromise;
  }

  async _ensureActiveCameraPtzInfo() {
    const entity = this._activeCam?.entity;
    if (!entity || !hasCameraPtz(this._activeCam)) return null;
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
    if (!isControlsPadTarget(event)) return;
    await this._handlePtzAction(event?.detail?.action, eventType);
  }

  async _handlePtzAction(action, eventType) {
    const ptzInfo =
      this._activeCameraPtzInfo() || (await this._ensureActiveCameraPtzInfo());
    const plan = resolvePtzServicePlan({
      camera: this._activeCam,
      ptzInfo,
      ptzContext: {
        clientId: this._cc().clientId,
        cameraName: this._cc().cam,
      },
      action,
      eventType,
    });
    if (!plan) {
      if (eventType === "press") {
        this._appendControlsReadoutEntry(
          resolvePtzEmptyStateMessage(this._activeCam, ptzInfo, {
            loading: this._activeCameraPtzInfoLoading(),
          }),
        );
      }
      return;
    }

    this._appendControlsReadoutEntry(plan.readout);
    try {
      const executeRequest = async (request) => {
        if (request?.type !== "home_assistant_service") {
          throw new Error(
            `Unsupported PTZ request type: ${request?.type || "unknown"}`,
          );
        }

        return this._hass?.callService(
          request.domain,
          request.service,
          request.serviceData,
          request.target,
        );
      };

      if (plan.executionMode === "parallel") {
        await Promise.all(
          plan.requests.map((request) => executeRequest(request)),
        );
      } else {
        for (let index = 0; index < plan.requests.length; index += 1) {
          await executeRequest(plan.requests[index]);
        }
      }
    } catch (error) {
      console.warn("[Frigate] PTZ call failed", error);
      this._appendControlsReadoutEntry("[ptz:error]");
    }
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

  _appendControlsReadoutEntry(text) {
    this._controlsReadoutLines = appendControlsReadoutLine(
      this._controlsReadoutLines,
      text,
      200,
    );
    this._renderControlsReadout();
  }

  _clearControlsReadout() {
    this._controlsReadoutLines = clearControlsReadoutLines();
    this._renderControlsReadout();
  }

  _escapeControlsReadoutText(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  }

  _renderControlsReadout() {
    const el = this._$("#controls-readout-lines");
    if (!el) return;
    el.innerHTML = resolveControlsReadoutMarkup(
      this._controlsReadoutLines,
      (line) => this._escapeControlsReadoutText(line),
      resolvePtzEmptyStateMessage(
        this._activeCam,
        this._activeCameraPtzInfo(),
        {
          loading: this._activeCameraPtzInfoLoading(),
        },
      ),
    );
    if (!this._controlsReadoutLines.length) return;
    el.scrollTop = el.scrollHeight;
  }

  _renderKeptList(list) {
    const kept = this._filteredKept();
    this._renderListLabel();
    this._renderStandardListMarkup(list, {
      items: kept,
      emptyMessage: "No kept events",
      emptyHint: "star an event to keep it",
      buildContentHtml: (items) => this._renderKeptContent(items),
      emptyForceHide: false,
      contentForceHide: false,
      syncOnContent: true,
    });
  }

  _renderEventsList(list) {
    const events = this._filtered();
    this._renderListLabel(resolveListLabelTimestamp(events));
    this._renderStandardListMarkup(list, {
      items: events,
      emptyMessage: "No events in this window",
      buildContentHtml: (items) => this._renderEventsContent(items),
      emptyForceHide: false,
      contentForceHide: null,
      syncOnContent: false,
      syncBrowseHead: true,
      scheduleDeferredOlderHint: true,
    });
  }

  _renderStandardListMarkup(
    list,
    {
      items,
      emptyMessage,
      emptyHint = "",
      buildContentHtml,
      emptyForceHide = null,
      contentForceHide = null,
      syncOnContent = true,
      syncBrowseHead = false,
      scheduleDeferredOlderHint = false,
    } = {},
  ) {
    const syncOlderHint = createOlderHintSyncer((forceHide) =>
      this._syncOlderHint(forceHide),
    );
    const renderState = resolveListMarkup({
      items,
      emptyMessage,
      emptyHint,
      buildContentHtml,
    });
    const hasContent = applyListMarkupWithOlderHint({
      setHtml: (html) => this._setListHtmlIfChanged(list, html),
      html: renderState.html,
      isEmpty: renderState.isEmpty,
      syncOlderHint,
      emptyForceHide,
      contentForceHide,
      syncOnContent,
    });
    if (!hasContent) {
      return;
    }

    if (!syncBrowseHead) {
      return;
    }

    runListPostRenderSync({
      syncBrowseHead: () => this._syncBrowseHeadFromScroll(),
      syncOlderHint,
      forceHide: contentForceHide,
      scheduleDeferredOlderHint,
    });
  }

  _syncOlderHint(forceHide = null) {
    syncOlderHintFromScroll({
      hintEl: this._$("#older-hint"),
      list: this._$("#list"),
      browse: this._$("#browse"),
      tab: this._tab,
      forceHide,
    });
  }
  _renderRecordings(list) {
    this._renderListLabel(this._winEnd);
    const recs = this._recordingsViewRows(this._recordings);
    const isEmpty = !recs.length;
    const syncOlderHint = createOlderHintSyncer((forceHide) =>
      this._syncOlderHint(forceHide),
    );
    const html = this._recordingsListMarkup(
      recs,
      "No recordings in the last 24 hours",
    );
    applyListMarkupWithOlderHint({
      setHtml: (nextHtml) => this._setListHtmlIfChanged(list, nextHtml),
      html,
      isEmpty,
      syncOlderHint,
      emptyForceHide: true,
      contentForceHide: false,
      syncOnContent: true,
    });
  }

  _reviewListItemHTML(review) {
    const model = buildReviewListItemModel(review, {
      cap,
      icons: ICONS,
      resolveSourceEvent: (value) => this._reviewSourceEvent(value),
      findEventById: (id) => this._findEventById(id),
      media: (id, file) => this._media(id, file),
      dateTimeLabel: (ts) => this._dateTimeLabel(ts),
    });
    return buildReviewListItemHtml(model, { cap, icons: ICONS });
  }

  _renderReviews(list) {
    const showAllReviews = this._activeCam?.alerts_content === "all_reviews";
    const filteredReviews = this._filteredReviews();
    const emptyText = showAllReviews
      ? "No reviews in this window"
      : "No alerts in this window";

    this._renderListLabel(resolveListLabelTimestamp(filteredReviews));
    const allRevs = [...filteredReviews].sort(
      (a, b) => b.start_time - a.start_time,
    );
    this._renderListLabel(resolveListLabelTimestamp(allRevs));
    this._renderStandardListMarkup(list, {
      items: allRevs,
      emptyMessage: emptyText,
      buildContentHtml: (items) => this._renderReviewsContent(items),
      emptyForceHide: true,
      contentForceHide: false,
      syncOnContent: false,
      scheduleDeferredOlderHint: false,
      syncBrowseHead: true,
    });
  }
  // ── clip download range ───────────────────────────────────
  async _downloadRecRange(dlStart, dlEnd) {
    const { clientId, cam } = this._cc();
    const start = Math.floor(Number(dlStart) || 0);
    const endRaw = Math.floor(Number(dlEnd) || 0);
    const end = Math.max(start + 1, Math.min(endRaw, start + 7200));
    const base = `/api/frigate/${encodeURIComponent(clientId)}/recording/${encodeURIComponent(cam)}/start/${start}/end/${end}`;
    const signed = await this._signed(`${base}?download=true`);
    const url = signed;
    const a = document.createElement("a");
    a.href = url;
    a.download = `${cam}_${this._time(dlStart).replace(/:/g, "-")}.mp4`;
    document.body.appendChild(a);
    a.click();
    a.remove();
  }
}
