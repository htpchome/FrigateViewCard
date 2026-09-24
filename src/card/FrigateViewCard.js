import {
  VERSION,
  CARD_NAME,
  CARD_TAG,
  DEFAULT_TITLE,
  DEFAULT_SUBTITLE,
  DAY,
  REALTIME_HEAD_POLL_MS,
  REALTIME_RELOAD_DEBOUNCE_MS,
  REALTIME_POLL_OPTIONS_SECONDS,
  MOBILE_BATTERY_SAVER_POLL_SECONDS,
  SNAPSHOT_UPDATE_SECONDS,
  SNAPSHOT_UPDATE_OPTIONS_SECONDS,
  SLIDESHOW_ROTATION_OPTIONS_SECONDS,
  SLIDESHOW_ALERT_HOLD_MS,
  GRID_ALERT_HOLD_MS,
  CARD_VIEW_OVERLAY_TIMING,
  PREVIEW_ALERT_HOLD_MS,
  MSE_SWITCH_GRACE_MS,
  DEFAULT_CAMERA_CONNECTION_TYPE,
  DEFAULT_EVENT_DAYS,
  DEFAULT_ALERTS_REVIEWS_DAYS,
} from "../constants.js";
import { ICONS } from "../icons.js";
import { STYLES } from "../styles.js";
import { createLocalizationController } from "../features/localization/localization.ctrl.js";
import { LocalizedDateController } from "../features/localization/date.ctrl.js";
import { applyLocalizedText, setLocalizedText } from "../features/localization/localized-dom.js";
import { escapeHtmlAttribute } from "../shared/html.js";
// Registers <circle-pad-control-2>; keep this import for its module side effect.
import "../components/circle-pad/circle-pad.js";
import {
  DEVICE_PROFILE,
  cap,
  parseWs,
  normalizeCameraConnectionType,
  mkCamState,
  configuredCameraEntities,
  hassThemeSignature,
  hassEntityStateSignature,
} from "../helpers.js";
import {
  normalizePageRoute,
  PAGE_IDS,
  resolveDeviceRouteBucket,
} from "../features/navigation/router.js";
import { createPageNavigationController } from "../features/navigation/composition.js";
import { createHomeAssistantDashboardControllers } from "../integrations/home-assistant/dashboard-composition.js";
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
} from "../features/camera-groups/model.js";
import { resolveCardViewMasonrySizeHint } from "../features/card-view/config.js";
import { applyEditorPreviewDraftToCardConfig } from "../config/preview-mapper.js";
import {
  mergeVideoFactoryDefaults,
  normalizeRuntimeCardConfig,
  normalizeVideoFactoryDefaults,
  resolvePreferredDefaultCameraEntity,
  resolveRuntimeCardConfigChangePlan,
} from "../config/card-config.js";
import { createInitialCardRuntimeState } from "./initial-state.js";
import {
  bindCardGlobalEvents,
  bindCardShadowEvents,
} from "./event-bindings.js";
import { FrigateMediaDownloadController } from "../integrations/frigate/media-download.ctrl.js";
import { FrigateMediaResolverController } from "../integrations/frigate/media-resolver.ctrl.js";
import {
  resolveCameraConnectionType,
  resolveGo2RtcEntity,
} from "../integrations/frigate/camera-context.js";
import {
  haReviewStatusForCamera,
  haReviewStatusSeverity,
  haReviewStatusSignature,
  reviewStatusEntityCandidates,
} from "../integrations/frigate/review-status.js";
import { findActiveHaCameraStreamVideo } from "../integrations/home-assistant/playback.js";
import {
  invalidateMountTrackingIfActive,
  isMseReturnRemountReason,
  resolveCameraSwitchCleanupOptions,
  resolveCameraSwitchTransportEntity,
  resolveLiveKickIfStaleAction,
  resolveLiveKickProbeState,
  resolveLiveResumeAction,
  shouldForceLiveRemountForReason,
  shouldPreserveLiveRemountReasonWhileWaiting,
  shouldRetainMountedLiveForEditorTransition,
  shouldResetMseOnQuickReconnect,
} from "../features/live/mount-lifecycle.js";
import {
  adoptMountedAttemptResult,
  cleanupStaleWinnerResult,
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
  resolveRotateOverlayLiveDismissal,
  resolveRotateOverlayNativeControlsPlan,
  resolveRotateOverlayState,
  resolveRotateOverlayUiPlan,
  resolveRotateOverlayVideoStyles,
  resolveRotateOverlayViewportVariables,
} from "../features/live/rotate-overlay-state.js";
import {
  buildVideoOptionsForView,
  createVideoElement,
  disableNativePictureInPicture,
  enableNativePictureInPicture,
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
import { createLiveTransportControllers } from "../features/live/transport-composition.js";
import { createLiveLifecycleControllers } from "../features/live/lifecycle-composition.js";
import {
  buildLiveEngineWrapMarkup,
  buildLiveFullscreenControlMarkup,
  buildLivePictureInPictureControlMarkup,
  buildRotateOverlayDismissButtonMarkup,
  buildLiveTakeSnapshotControlMarkup,
  buildLiveMuteControlMarkup,
} from "../features/live/view.tmpl.js";
import { LiveViewResizeController } from "../features/live/live-view-resize.ctrl.js";
import { LiveAlertTakeoverController } from "../features/live/alert-takeover.ctrl.js";
import { LiveFullscreenLifecycleController } from "../features/live/fullscreen-lifecycle.ctrl.js";
import { createGridControllers } from "../features/grid/composition.js";
import {
  buildMobileViewBackButtonMarkup,
} from "../features/mobile-view/page.tmpl.js";
import {
  buildCamSwitcherRegionMarkup,
  buildInfoRowMarkup,
  buildFooterMarkup,
  buildTabsRegionMarkup,
  buildToolsRegionMarkup,
} from "./shell.tmpl.js";
import {
  buildTabsMarkup,
  buildToolsMarkup,
  resolveToolbarModeButtonStates,
} from "./toolbar.tmpl.js";
import {
  buildBrowseHeaderRegionMarkup,
  buildBrowseRegionMarkup,
} from "../features/browse/shell.tmpl.js";
import { buildPopupShellMarkup } from "../features/popup/shell.tmpl.js";
import {
  buildCalendarPanelMarkup,
  buildFilterPanelMarkup,
} from "../features/browse/calendar-filter.tmpl.js";
import {
  createBrowseControllers,
  renderBrowseEventListItem,
  renderBrowseReviewListItem,
} from "../features/browse/composition.js";
import { ListScrollController } from "../features/browse/scroll.ctrl.js";
import {
  MediaOverlayControlsController as LiveOverlayControlsController,
} from "../shared/media/overlay-controls.ctrl.js";
import { createPopupControllers } from "../features/popup/composition.js";
import {
  buildRecordingsListMarkup,
  disposeRecordingsDayCache,
  RecordingsBrowseNavController,
  RecordingsDayCache,
  RecordingsSwipeController,
  resetRecordingsDayCache,
  splitRecordingsHourly,
} from "../features/recordings/index.js";
import {
  hasCameraPtz,
} from "../features/ptz/index.js";
import {
  createPtzActionController,
  createPtzCapabilityController,
  createPtzInteractionController,
  createPtzMotionController,
  renderPtzControls,
  syncPtzControlsLabels,
} from "../features/ptz/composition.js";
import {
  releaseTwoWayTalkTouchFocus,
} from "../features/two-way-talk/index.js";
import {
  getTwoWayTalkSessionController,
  TwoWayTalkSessionController,
} from "../features/two-way-talk/session.ctrl.js";
import {
  buildTwoWayTalkSoundwaveMarkup,
  TwoWayTalkSoundwaveController,
} from "../features/two-way-talk/soundwave.ctrl.js";
import { resolveActiveListScroller } from "../shared/list-render.js";
import {
  buildDisplayedFrameFilename,
  captureDisplayedFrame,
  downloadDisplayedFrame,
  SAFARI_FRAME_DOWNLOAD_REVOKE_DELAY_MS,
} from "../shared/media/frame-capture.js";
import { initializePreviewControllers } from "../features/preview/composition.js";
import { DeepLinkController } from "../features/navigation/deep-link.ctrl.js";
import { CardStyleContextController } from "../features/card-style/context.ctrl.js";
import {
  EDITOR_PREVIEW_ROUTE_INTENTS,
  EditorPreviewContextController,
} from "../features/editor-preview/context.ctrl.js";
import { ViewportContextController } from "../features/viewport/context.ctrl.js";
import { createMobileViewControllers } from "../features/mobile-view/composition.js";
import {
  MOBILE_VIEW_ACTIVE_CLASS,
  MOBILE_VIEW_ROTATE_COVER_CLASS,
} from "../features/mobile-view/utils.js";
import { SingleViewPageController } from "../features/single-view/page.ctrl.js";
import { buildSingleViewMainLayoutShellMarkup } from "../features/single-view/page.tmpl.js";
import {
  createWideViewCompanionController,
  createWideViewTimelineControllers,
} from "../features/wide-view/composition.js";
import { CardViewPageController } from "../features/card-view/page.ctrl.js";
import { createSlideshowControllers } from "../features/slideshow/composition.js";
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

const CARD_VIEW_OVERLAYS_IDLE_CLASS = "card-view-overlays-idle";
const CARD_VIEW_OVERLAYS_TOUCH_IDLE_CLASS =
  "card-view-overlays-touch-idle";

const TWO_WAY_TALK_LABELS = Object.freeze({
  cancel: { key: "runtime.twoWayTalk.cancelConnection", fallback: "Cancel two-way talk connection" },
  endMuted: { key: "runtime.twoWayTalk.endMuted", fallback: "End two-way talk (microphone muted)" },
  disable: { key: "runtime.twoWayTalk.disable", fallback: "Disable two-way talk" },
  enable: { key: "runtime.twoWayTalk.enable", fallback: "Enable two-way talk" },
  muteMicrophone: { key: "runtime.twoWayTalk.muteMicrophone", fallback: "Mute microphone" },
  unmuteMicrophone: { key: "runtime.twoWayTalk.unmuteMicrophone", fallback: "Unmute microphone" },
});

const resolveTwoWayTalkButtonLabel = ({ connecting, active, microphoneMuted }) =>
  connecting
    ? TWO_WAY_TALK_LABELS.cancel
    : active
      ? microphoneMuted
        ? TWO_WAY_TALK_LABELS.endMuted
        : TWO_WAY_TALK_LABELS.disable
      : TWO_WAY_TALK_LABELS.enable;

const resolveMicrophoneButtonLabel = (muted) =>
  muted ? TWO_WAY_TALK_LABELS.unmuteMicrophone : TWO_WAY_TALK_LABELS.muteMicrophone;

export class FrigateViewCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    bindCardShadowEvents(this);
    Object.assign(
      this,
      createInitialCardRuntimeState({
        singleViewPageId: PAGE_IDS.singleView,
      }),
    );
    this._localization = createLocalizationController();
    this._localizedDateController = new LocalizedDateController(this);
    this._twoWayTalkSessionController =
      new TwoWayTalkSessionController(this);
    Object.assign(this, createLiveTransportControllers(this));
    Object.assign(this, createGridControllers(this));
    Object.assign(this, createMobileViewControllers(this));
    this._singleViewPageController = new SingleViewPageController(this, {
      PAGE_IDS,
    });
    this._wideViewCompanionController =
      createWideViewCompanionController(this);
    this._liveAlertTakeoverController = new LiveAlertTakeoverController(this);
    this._cameraGroupLiveController = new CameraGroupLiveController(this, {
      icons: ICONS,
    });
    this._linkedLightController = new LinkedLightController(this);
    this._ptzCapabilityController = createPtzCapabilityController(this);
    this._ptzExec = createPtzActionController(this);
    this._ptzMotionController = createPtzMotionController(this);
    this._ptzInteractionController = createPtzInteractionController(this);
    Object.assign(this, createWideViewTimelineControllers(this));
    this._cardViewPageController = new CardViewPageController(this, {
      PAGE_IDS,
      buildCalendarPanelMarkup,
      buildFilterPanelMarkup,
    });
    this._pageNavigationController = createPageNavigationController(this);
    Object.assign(this, createHomeAssistantDashboardControllers(this));
    this._pageShellRegistry = createPageShellRegistry({
      defaultPageId: PAGE_IDS.singleView,
    });
    registerDefaultPageShellProfiles(this._pageShellRegistry, PAGE_IDS);
    this._deepLinkController = new DeepLinkController(this);
    Object.assign(this, createSlideshowControllers(this));
    initializePreviewControllers(this);
    Object.assign(this, createBrowseControllers(this));
    this._cardStyleController = new CardStyleContextController(this);
    this._editorPreviewController = new EditorPreviewContextController(this);
    this._frigateMediaResolverController =
      new FrigateMediaResolverController(this);
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
    Object.assign(this, createPopupControllers(this));
    this._playbackTargetController = new BrowserPlaybackTargetController({
      getContext: (scope) => this._playbackTargetContext(scope),
      resolveSource: (context) =>
        this._resolvePlaybackTargetSource(context),
      getMount: () => this.shadowRoot,
      onStatus: (message) => this._toast(message),
      onSupportChange: () => this._syncPlaybackTargetButtons(),
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
    this._recordingsDayCache = new RecordingsDayCache();
    this._recordingsBrowseNavController = new RecordingsBrowseNavController(
      this,
    );
    Object.assign(this, createLiveLifecycleControllers(this));
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
      onInteractionStart: () => this._dismissLinkedLightDimmers(),
      onZoomScaleChange: (scale) => {
        this._liveVideoZoomController?.zoomToCenter?.(scale);
        this._cameraGroupLiveController?.setResizeZoomScale?.(scale);
      },
      getMediaDimensions: () => {
        if (!this._cameraGroupLiveController?.isActive?.()) return null;
        return this._activeCam?.group?.layout === "stacked"
          ? { videoWidth: 1, videoHeight: 1 }
          : { videoWidth: 16, videoHeight: 9 };
      },
      getAvailableGrowth: () => {
        if (
          this._isCardViewPageActive() &&
          (this._cardStyleController.isPanelView() ||
            this._cardStyleController.isSidebarView())
        ) {
          return null;
        }
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
    bindCardGlobalEvents(this);
  }

  _cloneCardConfig(config) {
    try {
      return JSON.parse(JSON.stringify(config || {}));
    } catch (_) {
      return { ...(config || {}) };
    }
  }

  _applyScopedVideoFactoryDefaultsFromConfig(config = this._config) {
    const cfg = config || {};
    const commonDefaults = normalizeVideoFactoryDefaults(cfg.video_defaults);
    const scopeContext = { scopeKey: this };

    setScopedVideoViewDefaultOptions(
      "live",
      mergeVideoFactoryDefaults(commonDefaults, cfg.video_live_defaults),
      scopeContext,
    );
    setScopedVideoViewDefaultOptions(
      "popup",
      mergeVideoFactoryDefaults(commonDefaults, cfg.video_popup_defaults),
      scopeContext,
    );
    setScopedVideoViewDefaultOptions(
      "recording",
      mergeVideoFactoryDefaults(
        commonDefaults,
        cfg.video_recording_defaults,
      ),
      scopeContext,
    );
  }
  _applyEditorPreviewDraft(previewConfig, routeIntent = null) {
    if (!this._isEditorPreviewContext()) return;
    if (!this._committedConfig) return;

    const previousConfig = this._config;
    const base = this._cloneCardConfig(this._committedConfig);
    const draftOnly = Boolean(previewConfig && !routeIntent);
    const next = applyEditorPreviewDraftToCardConfig({
      baseConfig: base,
      previewConfig,
    });

    this._config = next;
    if (draftOnly) {
      this._editorPreviewController.applyConfigDraft({
        previousConfig,
        nextConfig: next,
      });
      return;
    }
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
    this._editorPreviewController.startLiveHandoffProvider((request) =>
      this._editorLiveHandoffController.createOffer(request),
    );
    this._editorPreviewController.syncInitialLandingPage();
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
        this._isPreviewContext() ||
        this._isCardViewPageActive?.() ||
        this._cardStyleController.isInMasonryView()
        ? "auto"
        : "100%";
      this._applyTightMargins();
      this._wideViewPageController.applyLayoutAndWideSyncForCard();
    }
    if (hadPendingDisconnectTeardown) {
      this._scheduleEditorLayoutSync();
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
      this._wideViewPageController?.initResizeHandle?.();
      this._wideViewPageController?.syncColHeightIfWideView?.();
      if (!this._ro && typeof ResizeObserver !== "undefined") {
        this._setupResizeObserver();
      }
      this._pageNavigationController.connectToolbarDivider();
      this._startEditModeWatchdog();
      this._scheduleResumeLive("connected");
    }
    this._startEditorDialogCloseObserver();
    this._deepLinkController.connect();
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
      editorUrl.searchParams.set("fvc-version", VERSION);
      await import(editorUrl.href);
    }
    return document.createElement(editorTag);
  }
  static getStubConfig(hass) {
    return {
      cameras: [
        {
          entity: resolvePreferredDefaultCameraEntity(hass),
          alerts_content: "alerts_only",
        },
      ],
      title: DEFAULT_TITLE,
      subtitle: DEFAULT_SUBTITLE,
      compact_preview: true,
      stream_height: 100,
      stream_height_unit: "%",
      event_days: DEFAULT_EVENT_DAYS,
      alerts_reviews_days: DEFAULT_ALERTS_REVIEWS_DAYS,
    };
  }
  setConfig(config) {
    this._sourceConfig = config;
    const wasStarted = this._started === true;
    const prevConfig = this._config;
    const nextConfig = normalizeRuntimeCardConfig(config, {
      previousConfig: prevConfig,
    });
    const cameras = nextConfig.cameras;
    const {
      previewEnabledChanged,
      mobileViewPageEnabledChanged,
      wideViewPageEnabledChanged,
      wideViewTakeoverDefaultChanged,
      wideViewTimelineEnabledChanged,
      wideViewTimelineDefaultOpenChanged,
      wideViewTimelineDefaultScaleChanged,
      cardViewPageEnabledChanged,
      cardViewTakeoverDefaultChanged,
      cardViewStandaloneChanged,
      cardViewMediaDrawerEnabledChanged,
      cardViewStartModeChanged,
      cardViewViewModeChanged,
      cardViewHideCameraNameChanged,
      previewModeConfigChanged,
      singleViewTakeoverDefaultChanged,
      singleViewStartModeChanged,
      wideViewStartModeChanged,
      needsShellRerender,
      needsEngineRemount,
      snapshotUpdateChanged,
      realtimePollChanged,
    } = resolveRuntimeCardConfigChangePlan(prevConfig, nextConfig);
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
    if (
      prevConfig &&
      prevConfig.mobile_view_header_overlay !==
      nextConfig.mobile_view_header_overlay
    ) {
      this._initLiveOverlayControls();
    }
    this._syncFvcBrandLogo();
    this._syncFooterVersion();
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
      this._singleViewPageController.applyPageConfigUpdate({
        takeoverDefaultChanged: singleViewTakeoverDefaultChanged,
        startModeChanged: singleViewStartModeChanged,
      });
      this._wideViewPageController.applyPageConfigUpdate({
        startModeChanged: wideViewStartModeChanged,
      });
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
        standaloneChanged: cardViewStandaloneChanged,
        mediaDrawerEnabledChanged: cardViewMediaDrawerEnabledChanged,
        startModeChanged: cardViewStartModeChanged,
        viewModeChanged: cardViewViewModeChanged,
        hideCameraNameChanged: cardViewHideCameraNameChanged,
      });
    }

    if (!wasStarted || !prevConfig) {
      // The landing route rebuild in _start() hydrates Mobile View after hass exists.
      const landingSync =
        this._editorPreviewController.syncInitialLandingPage();
      if (landingSync !== "prepared") this._renderShell();
      return;
    }

    const activePageInvalid =
      !this._pageNavigationController.isPageRouteAvailable(this._pageId);

    const routeFlowOutcome =
      this._singleViewPageController.applyConfigUpdateRouteFlow({
        needsEngineRemount,
        nextCameraCount: cameras.length,
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
    const previousTimeFormat = this._hass?.locale?.time_format;
    const previousTimeZone = this._hass?.config?.time_zone;
    this._hass = hass;
    const languageChanged = this._localization.updateHass(hass);
    const dateSettingsChanged =
      previousTimeFormat !== hass?.locale?.time_format ||
      previousTimeZone !== hass?.config?.time_zone;
    if (languageChanged || dateSettingsChanged) {
      this._applyLocalizedDates();
      this._browseCalendarPanelController?.syncLocalizedMonthLabel();
      if (this._config) {
        this._activeStandardPageController()?.relocalizeBrowseLabels?.();
      }
    }
    if (languageChanged) {
      applyLocalizedText(this.shadowRoot, this._localization.t);
      this._previewPageController?.updatePreviewMeta();
      syncPtzControlsLabels(this);
    }
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
    if (shouldApplyHaReviewStatus) {
      this._lastHaReviewStatusApplyAt = nowMs;
      this._applyHaReviewStatusAlerts();
    }
    if (
      !cameraStateChanged &&
      !themeChanged &&
      !reviewStatusChanged
    )
      return;
    this._singleViewPageController.applyHassUpdateRouteFlow({
      cameraStateChanged: cameraStateChanged || reviewStatusChanged,
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
    if (this._isPreviewContext()) return 3;
    // HA may request the Masonry hint before startup applies landing_page.
    const configuredCardViewLanding =
      this._config?.card_view_standalone === true ||
      (this._config?.card_view_page_enabled === true &&
        normalizePageRoute(this._config?.landing_page) === PAGE_IDS.cardView);
    const cardViewExpected =
      this._isCardViewPageActive() ||
      (this._started !== true && configuredCardViewLanding);
    if (cardViewExpected) {
      return resolveCardViewMasonrySizeHint(
        this._config?.card_view_view_mode,
      );
    }
    return 12;
  }
  getGridOptions() {
    return {
      columns: 12,
      min_columns: this._isLikelyMobileClient() ? 1 : 6,
    };
  }
  disconnectedCallback() {
    this._cardStyleController.releaseBubbleFullscreenEscape();
    this._cardStyleController.releaseBubblePopupPadding();
    this._deepLinkController.disconnect();
    void this._stopPtzMotion("disconnected");
    this._playbackTargetController?.release("popup");
    this._wideViewPageController?.disconnectResizeHandle?.();
    this._editorLiveHandoffController?.returnIfPossible?.();
    const sameDashboard =
      this._haDashboardSwipeNavigationController?.isCurrentDashboardScope?.() ===
      true;
    const activeLiveEntity =
      this._activeGroupMemberOverride || this._activeCam?.entity || "";
    const retainMountedEditorLive =
      shouldRetainMountedLiveForEditorTransition({
        sameDashboard,
        editorLifecycleActive:
          this._editorPreviewController?.isEditorLifecycleActive?.() === true,
        started: this._started,
        hasEngine: Boolean(this._engine),
        mountInProgress: this._mountInProgress,
        previewPageActive: this._isPreviewPageActive(),
        viewMode: this._viewMode,
        twoWayTalkActive: Boolean(
          this._twoWayTalkStarting || this._twoWayTalkSession,
        ),
        useGo2Rtc: this._shouldUseGo2RtcForEntity(activeLiveEntity),
        activeStreamType: this._currentLiveStreamHint(),
      });
    const preserveDashboardLive =
      sameDashboard &&
      (retainMountedEditorLive || this._preserveLiveForDashboardNavigation());
    if (retainMountedEditorLive) this._dashboardLiveGraceActive = true;
    this._haNavbarController?.disconnect?.();
    this._haDashboardSwipeNavigationController?.disconnect?.();
    this._haPageBackgroundController?.disconnect?.();
    if (this._resumeLiveT) {
      clearTimeout(this._resumeLiveT);
      this._resumeLiveT = null;
    }
    if (this._editorLayoutSyncRaf) {
      cancelAnimationFrame(this._editorLayoutSyncRaf);
      this._editorLayoutSyncRaf = 0;
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
    void this._ptzInteractionController?.dispose?.();
    this._linkedLightController?.cancelInteractions?.();
    this._clearTwoWayTalkResultBubble?.();
    void this._stopTwoWayTalkSession({ restoreLive: false });
    this._stopSlideshowRotation("disconnect", false);
    this._stopGridModeState();
    this._stopPreviewMode();
    this._wideViewPageController?.dispose?.();
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
    this._editorLiveHandoffController?.dispose?.();
    if (this._liveControlsHideTimer) clearTimeout(this._liveControlsHideTimer);
    if (this._toastT) clearTimeout(this._toastT);
    this._toastT = null;
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
    this._popupRecordingScrubController?.dispose?.();
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
      document.removeEventListener(
        "pointerdown",
        this._onDocumentPointerDown,
        true,
      );
    }
    if (this._rotateOverlayRaf) cancelAnimationFrame(this._rotateOverlayRaf);
    this._rotateOverlayRaf = 0;
    if (this._rotateOverlayExitT) clearTimeout(this._rotateOverlayExitT);
    this._rotateOverlayExitT = null;
    this._rotateLiveOverlayDismissed = false;
    this.classList?.remove?.(MOBILE_VIEW_ROTATE_COVER_CLASS);
    this._clearRotateOverlayAudioSync();
    this._clearRotateVideoFullscreenStyle();
    this._mseGraceController.clearGracePool();
    disposeRecordingsDayCache(this);
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
    this._winStart = now - this._config.event_days * DAY;
    if (deepLinkHandlingEnabled) {
      await this._deepLinkController.prepareStartupCameraTarget();
    }

    const initialLoad = this._browseWindowLoaderController.loadWindow(true);
    this._browseWindowLoaderController.scheduleWarmOtherCamerasEvents();
    this._pageNavigationController.navigateToConfiguredLandingPage({
      source: "startup",
      startup: true,
      hasPendingDeepLinkTarget,
    });
    await initialLoad;
    void this._prefetchCalendarActivityForActiveCamera();
    this._subscribe();
    this._startEditModeWatchdog();
    this._startEditorDialogCloseObserver();
    this._deepLinkController.consumeDeepLinkReviewOpen();
    this._deepLinkController.consumeDeepLinkEventOpen();
    this._deepLinkController.connect();
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

  _assignLiveEngine(engine, options = {}) {
    if (this._engine === engine) {
      if (engine) this._attachMainLiveVideoZoom(engine);
      this._syncPictureInPictureButtons();
      return;
    }
    if (options.retainPrevious !== true) {
      this._haDirectMounter?.release?.(this._engine);
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

  _attachMainLiveVideoZoom(
    engine,
    readyVideo = null,
    attachmentOptions = {},
  ) {
    if (!engine || this._engine !== engine) return;
    const video =
      readyVideo ||
      engine.video ||
      this._findFullscreenVideo(engine) ||
      this._findVideoDeep(engine);
    if (video) {
      this._applyVideoFit(video);
      this._liveViewResizeController?.attachMedia(video);
      const currentZoomController = this._liveVideoZoomController;
      const sameVideo = currentZoomController?.video === video;
      const host =
        attachmentOptions.host ||
        (sameVideo ? currentZoomController?.host : null) ||
        video.parentElement ||
        null;
      const interactionTarget =
        attachmentOptions.interactionTarget ||
        (sameVideo ? currentZoomController?.interactionTarget : null) ||
        video;
      if (!host) {
        this._clearLiveVideoZoom();
        this._syncPictureInPictureButtons();
        return;
      }
      if (
        sameVideo &&
        currentZoomController?.host === host &&
        currentZoomController?.interactionTarget === interactionTarget
      ) {
        this._liveVideoZoomController.refresh();
        this._syncPictureInPictureButtons();
        return;
      }
      this._clearLiveVideoZoom();
      this._liveVideoZoomController = attachVideoZoom(video, {
        host,
        interactionTarget,
        onInteractionStart: () => this._dismissLinkedLightDimmers(),
        onZoomStateChange: (zoomed) => {
          this._$("#card")?.classList?.toggle?.(
            "card-view-video-zoomed",
            zoomed,
          );
        },
      });
      this._syncLiveRotateZoomPresentation();
      this._syncPictureInPictureButtons();
      return;
    }
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
      onInteractionStart: () => this._dismissLinkedLightDimmers(),
    });
    return this._popupVideoZoomController;
  }

  _clearPopupVideoZoom() {
    this._popupVideoZoomController?.dispose?.();
    this._popupVideoZoomController = null;
  }

  _dismissLinkedLightDimmers() {
    this._linkedLightController?.closeDimmers?.();
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
      let boundVideo = null;
      let frameCallbackVideo = null;
      let frameCallbackId = null;
      let finish = null;
      let onAbort = null;
      let tick = null;
      let timeout = null;
      const clearVideoBindings = () => {
        if (boundVideo && finish) {
          boundVideo.removeEventListener?.("loadeddata", finish);
          boundVideo.removeEventListener?.("canplay", finish);
          boundVideo.removeEventListener?.("playing", finish);
          boundVideo.removeEventListener?.("timeupdate", finish);
        }
        if (
          frameCallbackVideo &&
          frameCallbackId != null &&
          typeof frameCallbackVideo.cancelVideoFrameCallback === "function"
        ) {
          frameCallbackVideo.cancelVideoFrameCallback(frameCallbackId);
        }
        boundVideo = null;
        frameCallbackVideo = null;
        frameCallbackId = null;
        finish = null;
        frameCallbackBound = false;
        eventBound = false;
      };
      const done = (ok, video = null) => {
        if (settled) return;
        settled = true;
        if (tick != null) clearInterval(tick);
        if (timeout != null) clearTimeout(timeout);
        clearVideoBindings();
        if (abortSignal && onAbort) {
          try {
            abortSignal.removeEventListener("abort", onAbort);
          } catch (_) {}
        }
        if (ok && video && typeof opts.onVideoReady === "function") {
          try {
            opts.onVideoReady(video);
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
      tick = setInterval(() => {
        const v =
          typeof opts.resolveVideo === "function"
            ? opts.resolveVideo(streamEl)
            : this._findVideoDeep(streamEl);
        if (!v) return;
        if (boundVideo && boundVideo !== v) clearVideoBindings();
        if (!frameCallbackBound && v.requestVideoFrameCallback) {
          frameCallbackBound = true;
          frameCallbackVideo = v;
          frameCallbackId = v.requestVideoFrameCallback(() => done(true, v));
        }
        if (!eventBound) {
          eventBound = true;
          boundVideo = v;
          finish = () => {
            if (!strict) done(true, v);
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
        if (ready >= requireReadyState && (timeOk || decodeOk)) {
          done(true, v);
        }
      }, 180);
      timeout = setTimeout(() => done(false), timeoutMs);
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
    const label = this._$("#stream-loading .label");
    const defaultLabel = text === "Loading…";
    if (defaultLabel) {
      setLocalizedText(label, "runtime.live.loading", this._localization.t);
    } else {
      label?.removeAttribute("data-fvc-i18n");
    }
    applyStreamLoadingStateForCard({
      card: this,
      loading,
      text: defaultLabel ? this._localization.t("runtime.live.loading") : text,
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
      applyHandlers: (payload) => applyFallbackImageHandlers({
        ...payload,
        t: this._localization.t,
      }),
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
      uiPlan.retainViewportCover,
    );
    this._cardStyleController?.syncBubbleFullscreenEscape?.(
      uiPlan.retainViewportCover,
    );
    this._rotateOverlayActive = uiPlan.active;
    this._rotateOverlayMode = uiPlan.mode;
    this._haNavbarController?.sync?.();
    this._cardViewPageController?.handleRotateOverlayState?.({
      active: uiPlan.active,
      mode: uiPlan.mode,
    });
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
    if (this._editorLiveHandoffController?.isSuspended?.()) return false;
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
      !this._gridLiveViewEnabled();
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
        !this._gridLiveViewEnabled()
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

  _handlePreviewAlertStateChange(detail = {}) {
    return this._previewPageController.handleAlertStateChange(detail);
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

  _gridLiveViewEnabled() {
    if (this._isEditorPreviewContext()) return false;
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

  _isGridSessionActive() {
    return this._gridPageController.isGridSessionActive();
  }

  _isAlertCameraTakeoverAvailable() {
    return this._isLikelyMobileClient() !== true;
  }

  _alertCameraTakeoverEnabled() {
    if (!this._isAlertCameraTakeoverAvailable()) return false;
    if (this._isCardViewPageActive()) {
      return this._cardViewPageController.alertTakeoverEnabled();
    }
    if (this._wideViewPageController.isWideViewPageActive()) {
      return this._wideViewPageController.companionAlertTakeoverEnabled();
    }
    if (this._isMobileViewPageActive()) {
      return this._mobileViewPageController.alertTakeoverEnabled();
    }
    if (this._singleViewPageController.isActive()) {
      return this._singleViewPageController.alertTakeoverEnabled();
    }
    return false;
  }

  async _beginGridAlertTakeover(entity, severity = "alert") {
    return await this._gridPageController.beginAlertTakeover(
      entity,
      severity,
    );
  }

  _beginGridAlertPageHold(entity) {
    return this._gridPageController.beginAlertPageHold(entity);
  }

  _handleAlertTakeoverStateChange(enabled) {
    this._gridPageController.handleAlertTakeoverStateChange(enabled);
    this._slideshowPageController.handleAlertTakeoverStateChange(enabled);
    if (
      enabled !== true &&
      !this._isGridSessionActive() &&
      this._slideshowActive !== true
    ) {
      this._setLiveAlertState("");
    }
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

  _setViewMode(mode, options = {}) {
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
    const resumeGridSession =
      enteringGrid && options?.resumeGridSession === true;
    const gridLiveHandoff = leavingGrid
      ? this._gridPageController.takeColdStartLiveHandoff()
      : null;
    if (this._viewMode === "grid" && nextMode !== "grid") {
      this._stopGridModeState();
      this._gridLastRenderSignature = "";
    }
    let startGridTimers = false;
    if (nextMode === "grid") {
      const gridPreparation = enteringGrid
        ? this._gridPageController.prepareLiveForGrid()
        : null;
      if (gridPreparation?.releaseMainLive === true) {
        this._cancelPendingMount("grid-mode-entry");
        this._clearLiveEngineSlot();
      }
      this._stopSlideshowRotation("grid-mode", false);
      this._setLiveMuted(true);
      this._gridRotationStart = Math.max(
        0,
        Number(this._gridRotationStart) || 0,
      );
      if (!resumeGridSession) this._gridAlertController.startSession();
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
      Array.isArray(this._config?.cameras) &&
      flattenCameraMembers(this._config.cameras).length > 1
    );
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
    if (chip) {
      chip.hidden = true;
      setLocalizedText(chip, "runtime.live.nextSlide", this._localization.t, {
        seconds: 0,
      });
    }
    this._cardViewPageController?.syncStandaloneSlideshowCountdown?.();
  }

  _syncSlideshowCountdownOverlay() {
    const chip = this._$("#slideshow-next-chip");
    const show =
      this._slideshowActive &&
      this._viewMode === "single" &&
      this._isSlideshowRotationAvailable() &&
      !this._slideshowPopupPaused;
    if (chip && !show) {
      chip.hidden = true;
    }
    if (chip && show) {
      const remainingMs = Math.max(
        0,
        Number(this._slideshowNextSwitchAtMs || 0) - Date.now(),
      );
      const remainingSec = Math.max(0, Math.ceil(remainingMs / 1000));
      setLocalizedText(chip, "runtime.live.nextSlide", this._localization.t, {
        seconds: remainingSec,
      });
      chip.hidden = false;
    }
    this._cardViewPageController?.syncStandaloneSlideshowCountdown?.();
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
    const singleAlertTakeoverActive =
      this._singleViewPageController.isActive() &&
      this._singleViewPageController.alertTakeoverEnabled();
    const wideAlertTakeoverActive =
      this._wideViewPageController.isWideViewPageActive() &&
      this._wideViewPageController.companionAlertTakeoverEnabled();
    const mobileAlertTakeoverActive =
      this._mobileViewPageController.isActive() &&
      this._mobileViewPageController.alertTakeoverEnabled();
    const cardViewActive = this._isCardViewPageActive();
    const cardViewPtzActive =
      cardViewActive && this._cardViewPageController.isPtzActive();
    const cardViewAlertTakeoverActive =
      cardViewActive &&
      this._cardViewPageController.alertTakeoverEnabled();
    return resolveToolbarModeButtonStates({
      controlsVisible: this._isControlsButtonVisible(),
      controlsActive: this._tab === "controls" || cardViewPtzActive,
      recordingsActive: this._tab === "recordings",
      gridActive: this._isGridSessionActive(),
      slideshowActive: this._slideshowActive === true,
      wideAlertTakeoverActive:
        singleAlertTakeoverActive ||
        wideAlertTakeoverActive ||
        mobileAlertTakeoverActive ||
        cardViewAlertTakeoverActive,
      twoWayTalkActive:
        this._twoWayTalkStarting === true || !!this._twoWayTalkSession,
    });
  }

  _syncToolbarButtons() {
    const buttonStates = this._toolbarButtonStates();
    const setToolLabel = (button, key, fallback) => {
      const label = this._localization?.t?.(key) || fallback;
      button.setAttribute("data-fvc-i18n-title", key);
      button.setAttribute("data-fvc-i18n-aria-label", key);
      button.setAttribute("title", label);
      button.setAttribute("aria-label", label);
    };
    const toolsRegion = this._pageShellRegion("tools");
    if (
      toolsRegion &&
      this._activePageShellCapabilities().tabsVariant !== "none"
    ) {
      const shouldShowGrid = this._isGridModeAvailable();
      const shouldShowSlideshow = this._isSlideshowRotationAvailable();
      const shouldShowWideAlertTakeover =
        this._isAlertCameraTakeoverAvailable() &&
        this._wideViewPageController.isWideViewPageActive();
      const shouldShowSingleAlertTakeover =
        this._isAlertCameraTakeoverAvailable() &&
        this._singleViewPageController.isActive();
      const shouldShowMobileAlertTakeover =
        this._mobileViewPageController.shouldShowAlertTakeoverButton();
      const controlsBtnPresent = !!this._pageShellRegionElement("tools", "#controls-btn");
      const gridBtnPresent = !!this._pageShellRegionElement("tools", "#grid-btn");
      const slideshowBtnPresent = !!this._pageShellRegionElement("tools", "#slideshow-btn");
      const wideAlertTakeoverBtnPresent = !!this._pageShellRegionElement(
        "tools",
        "#wide-alert-takeover-btn",
      );
      const singleAlertTakeoverBtnPresent = !!this._pageShellRegionElement(
        "tools",
        "#single-alert-takeover-btn",
      );
      const mobileAlertTakeoverBtnPresent = !!this._pageShellRegionElement(
        "tools",
        "#mobile-alert-takeover-btn",
      );
      const needsToolsRerender =
        (buttonStates.controlsVisible && !controlsBtnPresent) ||
        (shouldShowGrid && !gridBtnPresent) ||
        (shouldShowSlideshow && !slideshowBtnPresent) ||
        shouldShowWideAlertTakeover !== wideAlertTakeoverBtnPresent ||
        shouldShowSingleAlertTakeover !== singleAlertTakeoverBtnPresent ||
        shouldShowMobileAlertTakeover !== mobileAlertTakeoverBtnPresent;
      if (needsToolsRerender) {
        this._syncTabsShell();
      }
    }
    const gridBtn = this._pageShellRegionElement("tools", "#grid-btn");
    if (gridBtn) {
      const gridAvailable = this._isGridModeAvailable();
      const gridActive = this._isGridSessionActive();
      gridBtn.hidden = !gridAvailable;
      gridBtn.style.display = gridAvailable ? "" : "none";
      gridBtn.disabled = buttonStates.gridDisabled;
      gridBtn.classList.toggle("active", gridAvailable && gridActive);
      gridBtn.setAttribute(
        "aria-pressed",
        gridAvailable && gridActive ? "true" : "false",
      );
      setToolLabel(
        gridBtn,
        `runtime.toolbar.${gridActive ? "stopGrid" : "startGrid"}`,
        gridActive ? "Stop grid mode" : "Start grid mode",
      );
      gridBtn.innerHTML = this._gridButtonIcon();
      if (!gridAvailable && gridActive) {
        this._stopGridModeState();
        if (this._viewMode === "grid") {
          this._setViewMode("single");
        }
      }
    }

    const alertTakeoverBtn = this._pageShellRegionElement(
      "tools",
      "#wide-alert-takeover-btn, #single-alert-takeover-btn, #mobile-alert-takeover-btn",
    );
    if (alertTakeoverBtn) {
      const active = alertTakeoverBtn.matches("#single-alert-takeover-btn")
        ? this._singleViewPageController.alertTakeoverEnabled()
        : alertTakeoverBtn.matches("#mobile-alert-takeover-btn")
          ? this._mobileViewPageController.alertTakeoverEnabled()
          : this._wideViewPageController.companionAlertTakeoverEnabled();
      const label = active
        ? "Disable Alert Camera Takeover"
        : "Enable Alert Camera Takeover";
      const labelKey = `runtime.toolbar.${active ? "disableAlertTakeover" : "enableAlertTakeover"}`;
      alertTakeoverBtn.classList.toggle("active", active);
      alertTakeoverBtn.disabled =
        buttonStates.wideAlertTakeoverDisabled;
      alertTakeoverBtn.setAttribute(
        "aria-pressed",
        active ? "true" : "false",
      );
      setToolLabel(alertTakeoverBtn, labelKey, label);
      alertTakeoverBtn.innerHTML = ICONS.alerts;
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
      setToolLabel(
        slideshowBtn,
        `runtime.toolbar.${this._slideshowActive ? "stopSlideshow" : "startSlideshow"}`,
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
    let filterOpen = false;
    if (filterBtn) {
      const filterPanel = this._pageShellRegion("filterPanel");
      const filterVisible = this._config?.display_filter_control !== false;
      filterBtn.hidden = !filterVisible;
      filterBtn.style.display = filterVisible ? "" : "none";
      if (!filterVisible && filterPanel) filterPanel.style.display = "none";
      filterOpen = !!filterPanel && filterPanel.style.display !== "none";
      filterBtn.disabled = buttonStates.filterDisabled;
      filterBtn.classList.toggle("active", filterOpen);
      filterBtn.setAttribute("aria-pressed", filterOpen ? "true" : "false");
    }

    const calBtn = this._pageShellRegionElement("tools", "#cal-btn");
    let calOpen = false;
    if (calBtn) {
      const calPanel = this._pageShellRegion("calendarPanel");
      const calendarVisible =
        this._config?.display_calendar_control !== false;
      calBtn.hidden = !calendarVisible;
      calBtn.style.display = calendarVisible ? "" : "none";
      if (!calendarVisible && calPanel) calPanel.style.display = "none";
      calOpen = !!calPanel && calPanel.style.display !== "none";
      calBtn.disabled = buttonStates.calendarDisabled;
      calBtn.classList.toggle("active", calOpen);
      calBtn.setAttribute("aria-pressed", calOpen ? "true" : "false");
    }

    const toolbarHolder =
      filterBtn?.closest?.(".tabs-holder") ||
      calBtn?.closest?.(".tabs-holder") ||
      null;
    toolbarHolder?.classList?.toggle?.(
      "has-open-toolbar-panel",
      filterOpen || calOpen,
    );

    if (!buttonStates.controlsVisible && this._tab === "controls") {
      this._setTab(this._resolveControlsReturnTab());
    }
    if (this._isCardViewPageActive()) {
      this._cardViewPageController.renderToolbar(buttonStates);
    }
    this._pageNavigationController.syncToolbarDividerAfterMutation();
  }

  _syncPlaybackTargetButtons() {
    const support = this._playbackTargetController?.getSupport?.("popup") || {
      airplay: false,
    };
    const sync = (selector, supported, fallbackTitle) => {
      this.shadowRoot.querySelectorAll(selector).forEach((button) => {
        const translationKey = button.getAttribute("data-fvc-i18n-title");
        const baseTitle = translationKey
          ? this._localization.t(translationKey)
          : button.dataset.playbackBaseTitle || button.title || fallbackTitle;
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

  _setLiveAlertState(type = "") {
    this._setSlideshowAlertState(type);
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
    const reportedHaAlertEntities = new Set();
    const activeHaAlertEntities = new Set();
    const slideshowHaCandidates = [];
    const activeEntity = String(this._activeCam?.entity || "").trim();
    const activeMemberEntities = new Set(cameraMemberEntities(this._activeCam));
    let activeCameraAlerted = false;
    let gridChanged = false;
    let firstAlertEntity = "";
    let firstAlertSeverity = "";
    let firstChangedAlertEntity = "";
    let firstChangedAlertSeverity = "";
    let activeAlertEntity = "";
    let activeAlertSeverity = "";
    for (const camera of flattenCameraMembers(this._config?.cameras)) {
      const entity = String(camera?.entity || "").trim();
      if (!entity) continue;
      const discoveredCameraName = this._camCache?.[entity]?.cam;
      const reviewStatusState = reviewStatusEntityCandidates(
        entity,
        discoveredCameraName,
      )
        .map((candidate) => this._hass?.states?.[candidate])
        .find(Boolean);
      if (reviewStatusState) {
        reportedHaAlertEntities.add(entity);
      }
      const status = haReviewStatusForCamera({
        entity,
        discoveredCameraName,
        hass: this._hass,
      });
      const severity = haReviewStatusSeverity(status);
      if (!severity) continue;
      if (!this._shouldHandleSlideshowReview(entity, severity)) continue;
      activeHaAlertEntities.add(entity);
      if (!firstAlertEntity) {
        firstAlertEntity = entity;
        firstAlertSeverity = severity;
      }
      hasActiveAlert = true;
      slideshowHaCandidates.push({
        entity,
        severity,
        changedAt:
          Date.parse(
            reviewStatusState?.last_updated ||
              reviewStatusState?.last_changed ||
              "",
          ) || 0,
      });
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
        firstChangedAlertSeverity = severity;
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
    }

    this._slideshowAlertController.syncHaAlertState({
      reportedEntities: reportedHaAlertEntities,
      candidates: slideshowHaCandidates,
    });
    const normalLiveAlertChanged =
      this._liveAlertTakeoverController.syncHaAlertState({
        reportedEntities: reportedHaAlertEntities,
        candidates: slideshowHaCandidates,
      });
    this._cardViewPageController?.handleHaAlertStateChanged?.(
      normalLiveAlertChanged,
    );

    const gridAlertEntity =
      firstChangedAlertEntity ||
      (activeCameraAlerted
        ? activeAlertEntity || activeEntity
        : firstAlertEntity);
    const gridAlertSeverity = firstChangedAlertEntity
      ? firstChangedAlertSeverity
      : activeCameraAlerted
        ? activeAlertSeverity
        : firstAlertSeverity;
    if (gridAlertEntity && this._isGridSessionActive()) {
      this._gridAlertController.handleMarkedAlertCandidate(
        gridAlertEntity,
        gridAlertSeverity || "alert",
        { changed: gridChanged },
      );
    }
    this._gridAlertController.syncHaAlertState({
      reportedEntities: reportedHaAlertEntities,
      activeEntities: activeHaAlertEntities,
    });
    this._cameraGroupLiveController?.syncAlertState?.();
    return hasActiveAlert;
  }

  _handleSlideshowRealtimeMessage(msg) {
    this._slideshowAlertController.handleRealtimeMessage(msg);
  }

  // ── camera switching ──────────────────────────────────────
  async _switchCamera(idx, opts = {}) {
    void this._stopPtzMotion("camera-switch");
    if (
      this._gridResumePending === true &&
      opts?.keepGridResume !== true
    ) {
      this._stopGridModeState();
    }
    const wasGridMode = this._viewMode === "grid";
    const gridAlertTakeover =
      opts?.gridAlertTakeover === true &&
      (wasGridMode || this._gridResumePending === true);
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
      this._setLiveAlertState("");
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
    const gridAlertLiveHandoff =
      wasGridMode && gridAlertTakeover
        ? this._gridMediaController?.takeGridLiveHandoff?.(
            nextMemberOverride || newEnt,
          ) || null
        : null;
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
    // A camera selection leaves the Grid presentation; Grid owns whether the
    // single-camera stage is temporary and resumes afterward.
    if (wasGridMode) {
      if (gridAlertTakeover) {
        this._gridMediaController?.teardownGridEngine?.();
        this._gridLastRenderSignature = "";
      } else {
        this._stopGridModeState();
      }
    }
    this._viewMode = "single";
    if (wasGridMode) this._gridPageController.restoreLiveAfterGrid();
    if (popupOpen) this._popupLifecycleController.close();
    if (engWrap) engWrap.style.display = "";
    this.shadowRoot
      .querySelectorAll("[data-viewmode]")
      .forEach((p) =>
        p.classList.toggle("active", p.dataset.viewmode === "single"),
      );
    if (opts?.skipBrowseLoad !== true) {
      void this._browseWindowLoaderController.loadWindow(true, {
        supersede: true,
        reuseRecentCache: true,
      });
    }
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
    const adoptedGridAlertLive = gridAlertLiveHandoff
      ? this._adoptLiveAttemptResult(
          this._$("#engine"),
          gridAlertLiveHandoff,
        )
      : false;
    if (gridAlertLiveHandoff && !adoptedGridAlertLive) {
      cleanupStaleWinnerResult(gridAlertLiveHandoff);
    }
    if (!adoptedGridAlertLive) this._mountEngine();
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
    return this._localizedDateController.timezone();
  }
  _dateFormatter(name, locales, options, timeZone = this._tz()) {
    return this._localizedDateController.formatter(
      name,
      locales,
      options,
      timeZone,
    );
  }
  _tzOffsetMinutesAt(epochMs, tz = this._tz()) {
    return this._localizedDateController.timezoneOffsetMinutesAt(epochMs, tz);
  }
  _tzDateTimeToEpochSeconds(y, mo, d, hh = 0, mm = 0, ss = 0) {
    return this._localizedDateController.timezoneDateTimeToEpochSeconds(
      y,
      mo,
      d,
      hh,
      mm,
      ss,
    );
  }
  _tzParts(tsSec) {
    return this._localizedDateController.timezoneParts(tsSec);
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
      this._liveAlertTakeoverController.handleRealtimeMessage(msg);
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
      viewMode:
        this._isGridSessionActive() && this._viewMode !== "grid"
          ? "grid"
          : this._viewMode,
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
      showSingleAlertTakeover:
        this._isAlertCameraTakeoverAvailable() &&
        this._singleViewPageController.isActive(),
      singleAlertTakeoverEnabled:
        this._singleViewPageController.alertTakeoverEnabled(),
      showMobileAlertTakeover:
        this._mobileViewPageController.shouldShowAlertTakeoverButton(),
      mobileAlertTakeoverEnabled:
        this._mobileViewPageController.alertTakeoverEnabled(),
      showWideAlertTakeover:
        this._isAlertCameraTakeoverAvailable() &&
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
    if (tabs) {
      tabs.innerHTML = tabsMarkup;
      applyLocalizedText(tabs, this._localization?.t);
    }
    if (toolsSlot) {
      toolsSlot.innerHTML = this._getToolsMarkup();
      applyLocalizedText(toolsSlot, this._localization?.t);
    }
    this._pageNavigationController.syncToolbarDividerAfterMutation();
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
  _syncFvcBrandLogo() {
    const displayFvcBrandLogo = this._config?.display_logo !== false;
    const fvcBrandLogoMarkup = displayFvcBrandLogo ? ICONS.fvcBrandLogo : "";
    this.shadowRoot
      ?.querySelectorAll?.("#card .fvc-brand-logo")
      ?.forEach((element) => {
        if (element.innerHTML === fvcBrandLogoMarkup) return;
        element.innerHTML = fvcBrandLogoMarkup;
      });
    this.shadowRoot
      ?.querySelectorAll?.("#card .footer")
      ?.forEach((element) => {
        element.classList.toggle(
          "footer--logo-hidden",
          !displayFvcBrandLogo,
        );
      });
  }

  _allGridEvents() {
    return this._browseCollectionController.allGridEvents();
  }

  _buildActivePageMainLayoutShellMarkup() {
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
    const displayFvcBrandLogo = this._config.display_logo !== false;
    const displayVersion = this._config.display_version !== false;
    const footerVersion = displayVersion ? VERSION : "";
    const infoRow = resolvePageInfoRowMarkup(shellProfile, {
      title,
      subtitle,
      displayTitle,
      displaySubtitle,
      version: footerVersion,
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
      cardViewVideoBackIcon: ICONS.back,
      cardViewFullscreenExitIcon: ICONS.close,
      cardViewWebRtcIcon: ICONS.webrtc,
      liveSourceWebRtcIcon: ICONS.webrtc,
      information: infoRow,
      mobileBackButton: buildMobileViewBackButtonMarkup({
        previewPageEnabled:
          this._isPreviewPageEnabled() &&
          !(
            this._isCardViewPageActive() &&
            this._config?.card_view_standalone === true
          ),
        icons: ICONS,
        visible: this._config.display_back_button !== false,
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
        includeFvcBrandLogo: !isWideViewPage,
        displayFvcBrandLogo,
        version: footerVersion,
      }),
      wideFooterFvcBrandLogo:
        isWideViewPage && displayFvcBrandLogo ? ICONS.fvcBrandLogo : "",
      companionCameras: isWideViewPage
        ? this._wideViewPageController.buildCompanionRegionMarkup()
        : "",
      timeline: isWideViewPage
        ? this._wideViewPageController.buildTimelineRegionMarkup()
        : "",
      cardViewToolbar: "",
      cardViewActivity: "",
      calendarPanel: "",
      footerFvcBrandLogo: displayFvcBrandLogo ? ICONS.fvcBrandLogo : "",
      footerVersion,
      drawerHandleIcon: ICONS.chevron,
      mediaDrawerHandleIcon: ICONS.chevron,
      calendarIcon: ICONS.calendar,
      filterIcon: ICONS.filter,
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

    return mainLayoutShell;
  }

  _preparePageLayoutReplacement({ preserveLive = false } = {}) {
    this._wideViewPageController.teardownCompanionMedia();
    if (!preserveLive) {
      this._cameraGroupLiveController?.teardown?.();
    }
    this._wideViewPageController.teardownTimeline({ preserveScroll: true });
  }

  _bindPageLayout({
    bindPopupInteractions = false,
    syncCameraGroup = true,
  } = {}) {
    if (bindPopupInteractions) {
      this._popupLifecycleController.bindInteractions();
    }
    this._applyBrowse();
    this._applyCardStyle();
    this._wideViewPageController.applyLayoutAndWideSyncForCard();
    this._syncBrowseHeadModeClass();
    this._bindListScroll();
    this._bindRecordingsSwipe();
    this._wideViewPageController.initResizeHandle();
    this._wideViewPageController.bindTimeline();
    this._liveViewResizeController?.bind();
    if (syncCameraGroup) {
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
    this._syncVisualStyleToggles();
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
    if (
      !bindPopupInteractions &&
      this._$("#myPopup")?.classList.contains("is-open")
    ) {
      this._popupLifecycleController.syncShellGeometry();
    }
    applyLocalizedText(this.shadowRoot, this._localization.t);
  }

  _renderShell() {
    const mainLayoutShell = this._buildActivePageMainLayoutShellMarkup();
    const popupShell = buildPopupShellMarkup({
      icons: ICONS,
      version: VERSION,
    });
    this._preparePageLayoutReplacement({
      preserveLive: this._preservingLiveShell === true,
    });
    this.shadowRoot.innerHTML = `<style>${STYLES}</style>
    <ha-card class="card ${this._cardStateClassNames()}" id="card" style="border-radius: var(--fvc-border-radius);">

        ${mainLayoutShell}
        ${buildRotateOverlayDismissButtonMarkup({ icons: ICONS })}
        <div class="toast" id="toast" role="status" aria-live="polite" aria-atomic="true" hidden></div>

          ${popupShell}
      </ha-card>
      `;
    this._domCache = {}; // invalidate DOM element cache after full re-render
    this._lastRenderedListHtml = "";
    this._bindPageLayout({
      bindPopupInteractions: true,
      syncCameraGroup: this._preservingLiveShell !== true,
    });
  }

  _renderShellPreserveLive() {
    const preservedEngWrap = this._$("#eng-wrap");
    if (!preservedEngWrap) {
      this._renderShell();
      return;
    }

    const currentLayout = this._$("#layout");
    const ownerDocument = currentLayout?.ownerDocument || this.ownerDocument;
    if (!currentLayout || typeof ownerDocument?.createElement !== "function") {
      this._renderFullShellPreserveLive(preservedEngWrap);
      return;
    }

    const template = ownerDocument.createElement("template");
    template.innerHTML = this._buildActivePageMainLayoutShellMarkup().trim();
    const nextLayout =
      template.content?.childElementCount === 1
        ? template.content.firstElementChild
        : null;
    const nextEngWrap = nextLayout?.querySelector?.("#eng-wrap") || null;
    if (nextLayout?.id !== "layout" || !nextEngWrap) {
      this._renderFullShellPreserveLive(preservedEngWrap);
      return;
    }

    this._preservingLiveShell = true;
    try {
      this._preparePageLayoutReplacement({ preserveLive: true });
      nextEngWrap.replaceWith(preservedEngWrap);
      currentLayout.replaceWith(nextLayout);
      this._domCache = {};
      this._domCache["#eng-wrap"] = preservedEngWrap;
      const preservedEngine = preservedEngWrap.querySelector("#engine");
      if (preservedEngine) {
        this._domCache["#engine"] = preservedEngine;
      }
      this._lastRenderedListHtml = "";
      this._bindPageLayout({
        bindPopupInteractions: false,
        syncCameraGroup: true,
      });
    } finally {
      this._preservingLiveShell = false;
    }
  }

  _renderFullShellPreserveLive(preservedEngWrap) {
    preservedEngWrap.remove();

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
  }

  _syncFooterVersion() {
    const displayVersion = this._config?.display_version !== false;
    const label = `${CARD_NAME} version ${VERSION}`;
    this.shadowRoot
      ?.querySelectorAll?.("#card .footer-version")
      ?.forEach((element) => {
        element.hidden = !displayVersion;
        element.textContent = displayVersion ? `v${VERSION}` : "";
        if (displayVersion) element.setAttribute("aria-label", label);
        else element.removeAttribute("aria-label");
      });
  }

  _shouldRenderTwoWayTalkButtonForActiveCamera() {
    return getTwoWayTalkSessionController(
      this,
    ).shouldRenderButtonForActiveCamera();
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

  _buildTwoWayTalkControlRowMarkup({
    includeIncomingAudioMute = true,
  } = {}) {
    const active = this._twoWayTalkActiveForCurrentCamera();
    const muted = this._resolveLiveMuteControlMuted();
    const soundwaveEnabled =
      this._shouldRenderTwoWayTalkSoundwave?.() === true;
    const soundwaveActive = active && soundwaveEnabled;
    return `<div class="two-way-talk-control-row${active ? " has-inline-mute" : ""}${soundwaveActive ? " has-soundwave" : ""}">
      ${soundwaveEnabled ? buildTwoWayTalkSoundwaveMarkup({ active: soundwaveActive }) : ""}
      ${this._buildTwoWayTalkMicrophoneMuteButtonMarkup()}
      ${this._buildTwoWayTalkButtonMarkup()}
      ${includeIncomingAudioMute ? buildLiveMuteControlMarkup({
        icons: ICONS,
        streamMuted: muted,
        buttonClass: "icon-btn",
        buttonId: "two-way-talk-mute-btn",
        region: "",
        extraClass: `two-way-talk-inline-mute-btn${active && !muted ? " talk-audio-active" : ""}`,
        pressed: !muted,
        hidden: !active,
      }) : ""}
    </div>`;
  }

  _buildTwoWayTalkMicrophoneMuteButtonMarkup({
    buttonId = "two-way-talk-microphone-mute-btn",
    extraClass = "",
  } = {}) {
    const active = this._twoWayTalkActiveForCurrentCamera();
    const microphoneMuted =
      this._twoWayTalkMicrophoneMutedForCurrentCamera();
    const { key, fallback } = resolveMicrophoneButtonLabel(microphoneMuted);
    const label = escapeHtmlAttribute(this._localization?.t?.(key) || fallback);
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
    return `<button class="${className}" id="${buttonId}" type="button" ${active ? "" : "hidden"} aria-pressed="${microphoneActive ? "true" : "false"}" title="${label}" aria-label="${label}" data-fvc-i18n-title="${key}" data-fvc-i18n-aria-label="${key}">${microphoneMuted ? ICONS.micOff : ICONS.micOn}</button>`;
  }

  _shouldRenderTwoWayTalkSoundwave() {
    return (
      (this._isCardViewPageActive?.() === true &&
        this._cardViewPageController?.usesOverlayPresentation?.() === true) ||
      (DEVICE_PROFILE.isDesktop === true &&
        !this._isMobileTabletViewport())
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
    const connecting = this._twoWayTalkStarting === true && !active;
    const microphoneMuted = this._twoWayTalkMicrophoneMutedForCurrentCamera();
    const { key, fallback } = resolveTwoWayTalkButtonLabel({
      connecting,
      active,
      microphoneMuted,
    });
    const label = escapeHtmlAttribute(this._localization?.t?.(key) || fallback);
    const visible = this._shouldRenderTwoWayTalkButtonForActiveCamera();
    return `<button class="info-row-mic-btn${active ? " active" : ""}${connecting ? " connecting" : ""}${microphoneMuted ? " microphone-muted" : ""} round-btn" id="two-way-talk-btn" type="button" ${visible ? "" : "hidden"} aria-pressed="${active ? "true" : "false"}" aria-busy="${connecting ? "true" : "false"}" title="${label}" aria-label="${label}" data-fvc-i18n-title="${key}" data-fvc-i18n-aria-label="${key}">${active ? ICONS.micOn : ICONS.micOff}</button>`;
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
    return getTwoWayTalkSessionController(this).activeCameraEnabled();
  }

  _twoWayTalkActiveForCurrentCamera() {
    return getTwoWayTalkSessionController(this).activeForCurrentCamera();
  }

  _twoWayTalkMicrophoneMutedForCurrentCamera() {
    return getTwoWayTalkSessionController(
      this,
    ).microphoneMutedForCurrentCamera();
  }

  _resolveLiveMuteControlMuted() {
    return this._streamMuted;
  }

  _syncTwoWayTalkRuntimeState() {
    getTwoWayTalkSessionController(this).syncRuntimeState();
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
    const connecting = this._twoWayTalkStarting === true && !active;
    this._$("#card")?.classList?.toggle?.(
      "two-way-talk-active",
      active || connecting,
    );
    if (active) this._dismissLinkedLightDimmers();
    const microphoneMuted = this._twoWayTalkMicrophoneMutedForCurrentCamera();
    const { key, fallback } = resolveTwoWayTalkButtonLabel({
      connecting,
      active,
      microphoneMuted,
    });
    const label = this._localization?.t?.(key) || fallback;
    this.shadowRoot
      ?.querySelectorAll?.(".two-way-talk-control-row")
      ?.forEach((row) => row.classList.toggle("has-inline-mute", active));
    if (button) {
      button.hidden = !visible;
      button.disabled = !visible;
      button.classList.toggle("active", active);
      button.classList.toggle("connecting", connecting);
      button.classList.toggle("microphone-muted", microphoneMuted);
      button.setAttribute("aria-pressed", active ? "true" : "false");
      button.setAttribute("aria-busy", connecting ? "true" : "false");
      button.setAttribute("data-fvc-i18n-title", key);
      button.setAttribute("data-fvc-i18n-aria-label", key);
      button.setAttribute("title", label);
      button.setAttribute("aria-label", label);
      button.innerHTML = active ? ICONS.micOn : ICONS.micOff;
    }
    this.shadowRoot
      ?.querySelectorAll?.(".two-way-talk-microphone-mute-btn")
      ?.forEach((microphoneMuteButton) => {
        const microphoneState = resolveMicrophoneButtonLabel(microphoneMuted);
        const microphoneLabel =
          this._localization?.t?.(microphoneState.key) ||
          microphoneState.fallback;
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
        microphoneMuteButton.setAttribute("data-fvc-i18n-title", microphoneState.key);
        microphoneMuteButton.setAttribute("data-fvc-i18n-aria-label", microphoneState.key);
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
    await getTwoWayTalkSessionController(this).toggleSession();
  }

  _toggleTwoWayTalkMicrophoneMute() {
    getTwoWayTalkSessionController(this).toggleMicrophoneMute();
  }

  _setTwoWayTalkLiveAudioActive(active) {
    getTwoWayTalkSessionController(this).setLiveAudioActive(active);
  }

  _clearTwoWayTalkResultBubble() {
    getTwoWayTalkSessionController(this).clearResultBubble();
  }

  _showTwoWayTalkResultBubble(success) {
    getTwoWayTalkSessionController(this).showResultBubble(success);
  }

  _cancelTwoWayTalkStart({ syncButton = true } = {}) {
    return getTwoWayTalkSessionController(this).cancelStart({ syncButton });
  }

  async _startTwoWayTalkSession() {
    await getTwoWayTalkSessionController(this).startSession();
  }

  async _stopTwoWayTalkSession({ restoreLive = true } = {}) {
    await getTwoWayTalkSessionController(this).stopSession({ restoreLive });
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
    const card = this._$("#card");
    const overlayCardView =
      this._isCardViewPageActive() &&
      this._cardViewPageController?.usesOverlayPresentation?.() === true;
    const overlayMobileView =
      this._isMobileViewPageActive() &&
      this._config?.mobile_view_header_overlay === true;
    const interactionSurface = overlayCardView
      ? this._$(".card-view-live-panel") || wrap
      : overlayMobileView
        ? this._$("#mobile-top") || wrap
        : wrap;
    const show = (interaction = {}) => {
      if (interaction.pointerType) {
        this._lastLiveOverlayPointerType = interaction.pointerType;
      }
      wrap.classList.add("live-controls-visible");
      card?.classList?.add("card-view-overlays-visible");
      if (overlayCardView) {
        card?.classList?.remove(CARD_VIEW_OVERLAYS_IDLE_CLASS);
        card?.classList?.remove(CARD_VIEW_OVERLAYS_TOUCH_IDLE_CLASS);
      }
    };
    const hideNow = () => {
      wrap.classList.remove("live-controls-visible");
      card?.classList?.remove("card-view-overlays-visible");
      if (this._liveControlsHideTimer) {
        clearTimeout(this._liveControlsHideTimer);
        this._liveControlsHideTimer = null;
      }
    };
    const hideSoon = (ms = 1400, interaction = {}) => {
      if (this._liveControlsHideTimer)
        clearTimeout(this._liveControlsHideTimer);
      const touchInteraction = interaction.pointerType === "touch";
      this._liveControlsHideTimer = setTimeout(() => {
        wrap.classList.remove("live-controls-visible");
        card?.classList?.remove("card-view-overlays-visible");
        if (overlayCardView) {
          card?.classList?.toggle(
            CARD_VIEW_OVERLAYS_IDLE_CLASS,
            !touchInteraction,
          );
          card?.classList?.toggle(
            CARD_VIEW_OVERLAYS_TOUCH_IDLE_CLASS,
            touchInteraction,
          );
        }
        this._liveControlsHideTimer = null;
      }, ms);
    };
    const cancelScheduledHide = () => {
      if (this._liveControlsHideTimer === null) return;
      clearTimeout(this._liveControlsHideTimer);
      this._liveControlsHideTimer = null;
    };
    this._liveOverlayControlsController = new LiveOverlayControlsController({
      surface: interactionSurface,
      wrap,
      show,
      hideNow,
      hideSoon,
      cancelScheduledHide,
      revealDurationMs: overlayCardView
        ? CARD_VIEW_OVERLAY_TIMING.mouse.controlsHideMs
        : 1300,
      touchRevealDurationMs: overlayCardView
        ? CARD_VIEW_OVERLAY_TIMING.touch.controlsHideMs
        : 2300,
      autoHideMouse: overlayCardView,
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
      t: this._localization.t,
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

  _scheduleEditorLayoutSync() {
    if (this._editorLayoutSyncRaf) return;
    const applyLayout = () => {
      this._editorLayoutSyncRaf = 0;
      if (!this.isConnected) return;
      this._haNavbarController?.sync?.();
      this._applyCardStyle();
      this._wideViewPageController?.syncColHeightIfWideView?.();
      this._scheduleRotateOverlayUpdate();
    };
    if (typeof requestAnimationFrame !== "function") {
      applyLayout();
      return;
    }
    this._editorLayoutSyncRaf = requestAnimationFrame(() => {
      this._editorLayoutSyncRaf = requestAnimationFrame(applyLayout);
    });
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
      rotateOverlayActive: this._rotateOverlayActive,
      rotateOverlayMode: this._rotateOverlayMode,
    });
    const suppressNativeControlsForLiveRotate =
      enabled && !controlsPlan.expectedActive;
    const expected = controlsPlan.expectedActive;
    const apply = () => {
      if (expected && !this._rotateOverlayActive) return;
      if (
        suppressNativeControlsForLiveRotate &&
        (!this._rotateOverlayActive || this._rotateOverlayMode !== "live")
      ) {
        return;
      }
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
    if (
      !DEVICE_PROFILE.hasTouch &&
      !this._rotateOverlayActive &&
      !this._rotateOverlayExitT
    ) {
      return;
    }
    if (this._rotateOverlayRaf) cancelAnimationFrame(this._rotateOverlayRaf);
    this._rotateOverlayRaf = requestAnimationFrame(() => {
      this._rotateOverlayRaf = 0;
      this._syncRotateOverlayViewportState();
    });
  }
  _syncRotateOverlayViewportState() {
    if (
      !DEVICE_PROFILE.hasTouch &&
      !this._rotateOverlayActive &&
      !this._rotateOverlayExitT
    ) {
      return;
    }
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
        this._cardStyleController?.releaseBubbleFullscreenEscape?.();
        this._haNavbarController?.sync?.();
      }
      this._rotateOverlayExitT = null;
      if (this._resumeLiveT) return;
      if (exitPlan.syncFullscreenButtons) {
        this._syncFullscreenButtonsVisibility();
      }
    }, exitPlan.delayMs);
  }
  _isRotateToFullscreenEnabled() {
    return (
      this._config?.mobile_view_rotate_to_fullscreen === true &&
      this._isLikelyPhoneClient() &&
      !this._isPreviewContext() &&
      !this._isDashboardEditMode() &&
      !this._isCardEditorDialogOpen()
    );
  }
  _isRotateOverlayViewportCoverActive() {
    return this.classList.contains(MOBILE_VIEW_ROTATE_COVER_CLASS);
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
    const isLandscapeViewport = this._isLandscapeViewport();
    this._rotateLiveOverlayDismissed = resolveRotateOverlayLiveDismissal({
      dismissed: this._rotateLiveOverlayDismissed,
      isLandscapeViewport,
    });
    const rotateState = resolveRotateOverlayState({
      rotateEnabled: this._isRotateToFullscreenEnabled(),
      isMobileTabletViewport: this._isMobileTabletViewport(),
      isLandscapeViewport,
      popupOpen,
      popupMediaVisible,
      fullscreenActive,
      liveDismissed: this._rotateLiveOverlayDismissed,
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
  _dismissRotateOverlay() {
    if (!this._rotateOverlayActive || this._rotateOverlayMode !== "live") {
      return false;
    }
    this._rotateLiveOverlayDismissed = true;
    this._updateRotateOverlayState();
    return true;
  }
  _kickLiveIfStale(
    force = false,
    forceRemount = false,
    forcedType = null,
  ) {
    if (this._editorLiveHandoffController?.isSuspended?.()) return;
    const now = Date.now();
    const engineHost = this._$("#engine");
    const currentEngineTag = this._engine?.tagName?.toLowerCase?.() || "";
    const isHaDirectEngine =
      this._engine?.type === "ha_direct" ||
      currentEngineTag === "ha-camera-stream" ||
      currentEngineTag === "ha-hls-player" ||
      currentEngineTag === "ha-web-rtc-player";
    const v = isHaDirectEngine
      ? this._engine?.video || findActiveHaCameraStreamVideo(this._engine)
      : this._findVideoDeep(engineHost) ||
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
    if (this._editorLiveHandoffController?.isSuspended?.()) return;
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
      this._popupLifecycleController?.syncShellGeometry?.();
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
    this._popupMediaControlsController?.hideForOutsideVideoClick?.(target);
    if (target.closest("[data-rotate-overlay-dismiss]")) {
      this._dismissRotateOverlay();
      return;
    }
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
    const singleAlertTakeoverBtn = target.closest(
      "#single-alert-takeover-btn",
    );
    if (singleAlertTakeoverBtn) {
      if (singleAlertTakeoverBtn.disabled) return true;
      this._singleViewPageController.toggleAlertTakeover();
      return true;
    }
    const mobileAlertTakeoverBtn = target.closest(
      "#mobile-alert-takeover-btn",
    );
    if (mobileAlertTakeoverBtn) {
      if (mobileAlertTakeoverBtn.disabled) return true;
      this._mobileViewPageController.toggleAlertTakeover();
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
      const liveStage = this._$("#live-stage");
      const fullscreenTarget =
        this._cardViewPageController?.liveFullscreenTarget?.() || liveStage;
      this._fullscreen(fullscreenTarget, {
        preferLive: true,
        preferElementFullscreen: fullscreenTarget !== liveStage,
      });
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
    const tabButton = target.closest("[data-tab]");
    if (tabButton?.closest?.('[data-fvc-region="tabs"]')) {
      this._setTab(tabButton.dataset.tab);
      return true;
    }
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
        displayedVideo:
          this._popupMediaControlsController.video() ||
          this._findVideoDeep(this._$("#viewer")),
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
      const viewer = this._$("#viewer");
      this._fullscreen(viewer?.closest?.(".popup-body") || viewer);
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
    const pageBack = target.closest("[data-page-back]");
    if (pageBack) {
      const targetPageId =
        this._pageNavigationController?.resolveBackPageTarget?.();
      if (targetPageId) {
        this._pageNavigationController?.navigateToPageRoute?.(
          targetPageId,
          { source: "mobile-view-back" },
        );
      }
      return true;
    }
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
    if (!target?.closest?.('[data-fvc-region="browse"]')) return false;
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
    this._twoWayTalkSession?.engine?.setIncomingAudioMuted?.(
      this._streamMuted,
    );
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
    const labelKey = talkActive
      ? muted
        ? "runtime.live.unmuteIncoming"
        : "runtime.live.muteIncoming"
      : muted
        ? "runtime.live.unmute"
        : "runtime.live.mute";
    const fallbackLabel = talkActive
      ? muted
        ? "Unmute incoming audio"
        : "Mute incoming audio"
      : muted
        ? "Unmute live view"
        : "Mute live view";
    const label = this._localization?.t?.(labelKey) || fallbackLabel;
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
      button.setAttribute("data-fvc-i18n-title", labelKey);
      button.setAttribute("data-fvc-i18n-aria-label", labelKey);
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
    setLocalizedText(
      bubble,
      success ? "runtime.live.snapshotTaken" : "runtime.live.snapshotFailed",
      this._localization.t,
    );
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
        {
          revokeDelayMs: this._isSafari()
            ? SAFARI_FRAME_DOWNLOAD_REVOKE_DELAY_MS
            : 0,
        },
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
      this._toast("Picture-in-Picture is not supported for this video.", {
        localizationKey: "runtime.notifications.pipUnsupported",
      });
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
        reason
          ? {
              localizationKey: "runtime.notifications.pipStartFailedWithReason",
              localizationValues: { reason },
            }
          : { localizationKey: "runtime.notifications.pipStartFailed" },
      );
    } finally {
      this._syncPictureInPictureButtons();
      if (popup) this._popupMediaControlsController.showTemporarily();
    }
  }

  _showLiveControlsTemporarily(ms = 2200) {
    const wrap = this._$("#live-stage.live-stage--overlay");
    if (!wrap) return;
    const card = this._$("#card");
    const overlayCardView =
      this._isCardViewPageActive() &&
      this._cardViewPageController?.usesOverlayPresentation?.() === true;
    const touchInteraction =
      overlayCardView && this._lastLiveOverlayPointerType === "touch";
    wrap.classList.add("live-controls-visible");
    card?.classList?.add("card-view-overlays-visible");
    if (overlayCardView) {
      card?.classList?.remove(CARD_VIEW_OVERLAYS_IDLE_CLASS);
      card?.classList?.remove(CARD_VIEW_OVERLAYS_TOUCH_IDLE_CLASS);
    }
    if (this._liveControlsHideTimer) clearTimeout(this._liveControlsHideTimer);
    this._liveControlsHideTimer = setTimeout(
      () => {
        const nextWrap = this._$("#live-stage.live-stage--overlay");
        nextWrap?.classList.remove("live-controls-visible");
        const nextCard = this._$("#card");
        nextCard?.classList?.remove("card-view-overlays-visible");
        if (
          this._isCardViewPageActive() &&
          this._cardViewPageController?.usesOverlayPresentation?.() === true
        ) {
          nextCard?.classList?.toggle(
            CARD_VIEW_OVERLAYS_IDLE_CLASS,
            !touchInteraction,
          );
          nextCard?.classList?.toggle(
            CARD_VIEW_OVERLAYS_TOUCH_IDLE_CLASS,
            touchInteraction,
          );
        }
        this._liveControlsHideTimer = null;
      },
      overlayCardView
        ? CARD_VIEW_OVERLAY_TIMING[
            touchInteraction ? "touch" : "mouse"
          ].controlsHideMs
        : Math.max(500, Number(ms) || 2200),
    );
  }
  _media(id, file, dl) {
    return this._frigateMediaResolverController.notificationMediaPath(
      id,
      file,
      dl,
    );
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
      title: `${
        mediaType === "kept" ? "Favorite" : cap(mediaType || "video")
      } video`,
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
    const displayedVideo =
      this._popupMediaControlsController.video() ||
      this._findVideoDeep(this._$("#viewer"));
    this._playbackTargetController.observe("popup", displayedVideo);
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

    if (root.shadowRoot) {
      const shadowVideo = this._findVideoDeep(
        root.shadowRoot,
        maxDepth - 1,
      );
      if (shadowVideo) return shadowVideo;
    }

    const kids = root.children ? Array.from(root.children) : [];
    for (const k of kids) {
      const v = this._findVideoDeep(k, maxDepth - 1);
      if (v) return v;
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
    const elementFullscreenRequest =
      el.requestFullscreen || el.webkitRequestFullscreen;
    const preferElementFullscreen =
      opts.preferElementFullscreen === true &&
      typeof elementFullscreenRequest === "function";

    // iOS Safari often only supports fullscreen via the video element API.
    if (iOS && video && !preferElementFullscreen) {
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
    let req = elementFullscreenRequest;
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

  _exitFullscreen() {
    const documentObj = this.ownerDocument || globalThis.document;
    const exit =
      documentObj?.exitFullscreen ||
      documentObj?.webkitExitFullscreen ||
      documentObj?.webkitCancelFullScreen;
    if (typeof exit !== "function") return false;
    try {
      const exitResult = exit.call(documentObj);
      exitResult?.catch?.(() => {});
      return true;
    } catch (_) {
      return false;
    }
  }
  _frigateContextForCameraName(cameraName = "") {
    return this._frigateMediaResolverController.contextForCameraName(
      cameraName,
    );
  }
  _mediaForCamera(id, file, cameraName = "", dl = false) {
    return this._frigateMediaResolverController.notificationMediaPathForCamera(
      id,
      file,
      cameraName,
      dl,
    );
  }
  _reviewThumbnailForCamera(review, cameraName = "") {
    return this._frigateMediaResolverController.reviewThumbnailPath(
      review,
      cameraName,
    );
  }
  // ── favorites (realtime) ──────────────────────────────────
  _toggleFav(id, options = {}) {
    return this._browseFavoriteMutationController.toggle(id, options);
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
  _toast(msg, options = {}) {
    const t = this._$("#toast");
    if (!t) return;
    const normalizedOptions =
      typeof options === "number" ? { duration: options } : options || {};
    const duration = Number(normalizedOptions.duration) || 3500;
    const tone = ["success", "warning"].includes(normalizedOptions.tone)
      ? normalizedOptions.tone
      : "error";
    let placement = "global";

    t.classList?.remove(
      "toast--success",
      "toast--warning",
      "toast--error",
      "toast--browse",
      "toast--popup",
    );
    t.classList?.add(`toast--${tone}`);
    t.style?.removeProperty?.("--fvc-toast-browse-left");
    t.style?.removeProperty?.("--fvc-toast-browse-top");
    t.style?.removeProperty?.("--fvc-toast-browse-max-width");
    t.style?.removeProperty?.("--fvc-toast-popup-left");
    t.style?.removeProperty?.("--fvc-toast-popup-top");
    t.style?.removeProperty?.("--fvc-toast-popup-max-width");

    if (normalizedOptions.placement === "browse") {
      const browse = this._pageShellRegion("browse");
      const card = this._$("#card");
      const browseRect = browse?.getBoundingClientRect?.();
      const cardRect = card?.getBoundingClientRect?.();
      const browseWidth = Number(browseRect?.width) || 0;
      const cardWidth = Number(cardRect?.width) || 0;
      const availableWidth = Math.min(browseWidth, cardWidth) - 20;
      if (
        browseRect &&
        cardRect &&
        availableWidth >= 80 &&
        Number.isFinite(browseRect.left) &&
        Number.isFinite(browseRect.top) &&
        Number.isFinite(cardRect.left) &&
        Number.isFinite(cardRect.top)
      ) {
        const left = browseRect.left - cardRect.left + browseWidth / 2;
        const top = Math.max(8, browseRect.top - cardRect.top + 10);
        t.style?.setProperty?.("--fvc-toast-browse-left", `${left}px`);
        t.style?.setProperty?.("--fvc-toast-browse-top", `${top}px`);
        t.style?.setProperty?.(
          "--fvc-toast-browse-max-width",
          `${availableWidth}px`,
        );
        t.classList?.add("toast--browse");
        placement = "browse";
      }
    }

    if (normalizedOptions.placement === "popup") {
      const viewer = this._$("#viewer");
      const card = this._$("#card");
      const viewerRect = viewer?.getBoundingClientRect?.();
      const cardRect = card?.getBoundingClientRect?.();
      const viewerWidth = Number(viewerRect?.width) || 0;
      const cardWidth = Number(cardRect?.width) || 0;
      const availableWidth = Math.min(viewerWidth, cardWidth) - 20;
      if (
        viewerRect &&
        cardRect &&
        availableWidth >= 80 &&
        Number.isFinite(viewerRect.left) &&
        Number.isFinite(viewerRect.top) &&
        Number.isFinite(cardRect.left) &&
        Number.isFinite(cardRect.top)
      ) {
        const left = viewerRect.left - cardRect.left + viewerWidth / 2;
        const top = Math.max(8, viewerRect.top - cardRect.top + 44);
        t.style?.setProperty?.("--fvc-toast-popup-left", `${left}px`);
        t.style?.setProperty?.("--fvc-toast-popup-top", `${top}px`);
        t.style?.setProperty?.(
          "--fvc-toast-popup-max-width",
          `${availableWidth}px`,
        );
        t.classList?.add("toast--popup");
        placement = "popup";
      }
    }

    if (normalizedOptions.localizationKey) {
      setLocalizedText(
        t,
        normalizedOptions.localizationKey,
        (key, values) => this._localization?.t?.(key, values) || msg,
        normalizedOptions.localizationValues || {},
      );
    } else {
      t.removeAttribute?.("data-fvc-i18n");
      t.removeAttribute?.("data-fvc-i18n-values");
      t.textContent = msg;
    }
    t.hidden = false;
    t.dataset.placement = placement;
    clearTimeout(this._toastT);
    this._toastT = setTimeout(() => {
      t.hidden = true;
      this._toastT = null;
    }, duration);
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
  _renderAll({ renderWideTimeline = true } = {}) {
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
    this._renderList({ renderWideTimeline });
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
    return this._localizedDateController.time(ts);
  }
  _weekday(ts) {
    return this._localizedDateController.weekday(ts);
  }
  _monthDay(ts, { ordinal = false, numeric = false } = {}) {
    return this._localizedDateController.monthDay(ts, { ordinal, numeric });
  }
  _ordinal(n) {
    return this._localizedDateController.ordinal(n);
  }
  _dateTimeLabel(ts) {
    return this._localizedDateController.dateTimeLabel(ts);
  }
  _weekdayDate(ts, key = "weekdayDate") {
    return this._localizedDateController.weekdayDate(ts, key);
  }
  _fullDate(ts) {
    return this._localizedDateController.fullDate(ts);
  }
  _applyLocalizedDates() {
    this._localizedDateController.applyLocalizedDates();
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
    return this._localizedDateController.dayKey(ts);
  }
  _calendarMonthLabel(monthDate, timeZone = this._tz()) {
    return this._localizedDateController.calendarMonthLabel(
      monthDate,
      timeZone,
    );
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
  _eventCardHTML(ev, expanded, compact = false) {
    return renderBrowseEventListItem(this, ev, expanded, compact);
  }

  _setListHtmlIfChanged(list, html) {
    return this._activeStandardPageController().setListHtmlIfChanged(
      list,
      html,
    );
  }

  _renderList(options = {}) {
    this._activeStandardPageController().renderList(options);
  }

  _renderControlsSection(list) {
    return renderPtzControls(this, list);
  }

  _handleCirclePadPtzEvent(event, eventType) {
    return this._ptzInteractionController.handleCirclePadEvent(event, eventType);
  }

  _handlePtzAction(action, eventType) {
    return this._ptzInteractionController.handleAction(action, eventType);
  }

  _handlePtzPreset(presetName, button = null) {
    return this._ptzInteractionController.handlePreset(presetName, button);
  }

  _stopPtzMotion(reason = "release") {
    return this._ptzInteractionController.stopMotion(reason);
  }

  _handlePtzControlPointerDown(event) {
    return this._ptzInteractionController.handleControlPointerDown(event);
  }

  _handlePtzControlPointerStop(event) {
    return this._ptzInteractionController.handleControlPointerStop(event);
  }

  _reviewListItemHTML(
    review,
    options = {},
  ) {
    return renderBrowseReviewListItem(this, review, options);
  }
}
