import { cap, camDisplayName } from "../../helpers.js";
import { ICONS } from "../../icons.js";
import {
  DEFAULT_SUBTITLE,
  DEFAULT_TITLE,
  DEFAULT_EVENT_DAYS,
  GRID_ALERT_HOLD_MS,
} from "../../constants.js";
import { CleanupController } from "../../shared/cleanup.js";
import { resolveCameraAwareText } from "../../shared/page-text.js";
import {
  collectFilterLabelsFromEvents,
  collectFilterZonesFromEvents,
  normalizeFilterSelections,
  toggleFilterSelection,
} from "../browse/filter-state.js";
import { canCameraUsePtz } from "../ptz/index.js";
import { POPUP_PRESENTATION_CARD_VIEW_DRAWER } from "../popup/media.js";
import { resolveRecordingsDayBounds } from "../recordings/utils/day.js";
import { splitRecordingsHourly } from "../recordings/utils/segment.js";
import { activateStandardPageRouteLifecycle } from "../navigation/route-lifecycle.js";
import { buildCameraPickerMarkup } from "../navigation/camera-picker.tmpl.js";
import { cameraMemberEntities } from "../camera-groups/model.js";
import {
  applyCardViewPageMarkup,
  buildCardViewPtzMarkup,
  buildCardViewStandaloneModeControlsMarkup,
  buildCardViewToolbarMarkup,
  CARD_VIEW_BOTTOM_PANEL_OPEN_HOST_CLASS,
} from "./page.tmpl.js";
import {
  CARD_VIEW_MEDIA_DRAWER_TYPES,
  CARD_VIEW_VIEW_MODES,
  CARD_VIEW_START_MODES,
  normalizeCardViewStartMode,
  normalizeCardViewViewMode,
  resolveCardViewMediaDrawerTypes,
} from "./config.js";
import { CardViewMediaDrawerController } from "./media-drawer.ctrl.js";
import { resolveLiveSourceIndicatorState } from "../../shared/media/source-indicator.js";
import { applyLocalizedText } from "../localization/localized-dom.js";

const cameraName = (camera) => cap(camDisplayName(camera));
const STANDALONE_GRID_INDICATOR_DURATION_MS = GRID_ALERT_HOLD_MS;
const STANDALONE_GRID_INDICATOR_VISIBLE_CLASS =
  "card-view-grid-indicator-visible";

export const resolveCardViewSourceIndicatorState =
  resolveLiveSourceIndicatorState;

export const resolveCardViewColumnCount = ({
  width = 0,
  mode = "alerts",
} = {}) => {
  const available = Math.max(0, Number(width) || 0);
  if (mode === "recordings") {
    if (available >= 840) return 3;
    if (available >= 440) return 2;
    return 1;
  }
  if (available >= 1080) return 3;
  if (available >= 680) return 2;
  return 1;
};

export const chunkCardViewItems = (items = [], pageSize = 1) => {
  const source = Array.isArray(items) ? items : [];
  const size = Math.max(1, Math.floor(Number(pageSize) || 1));
  const pages = [];
  for (let index = 0; index < source.length; index += size) {
    pages.push(source.slice(index, index + size));
  }
  return pages;
};

export const resolveCardViewRecordingRows = ({
  recordings = [],
  nowSec = Date.now() / 1000,
} = {}) =>
  splitRecordingsHourly(recordings, nowSec).sort(
    (a, b) => Number(b?.start_time || 0) - Number(a?.start_time || 0),
  );

export const resolveCardViewPageScrollTarget = ({
  scrollLeft = 0,
  clientWidth = 0,
  scrollWidth = 0,
  direction = 0,
} = {}) => {
  const pageWidth = Math.max(1, Number(clientWidth) || 0);
  const maxScroll = Math.max(0, (Number(scrollWidth) || 0) - pageWidth);
  const current = Math.max(0, Math.min(maxScroll, Number(scrollLeft) || 0));
  const step = Math.sign(Number(direction) || 0);
  if (!step || maxScroll <= 0) return current;
  const currentPage = Math.round(current / pageWidth);
  return Math.max(
    0,
    Math.min(maxScroll, (currentPage + step) * pageWidth),
  );
};

export const resolveCardViewDrawerSwipe = ({
  deltaX = 0,
  deltaY = 0,
  threshold = 28,
} = {}) => {
  const x = Number(deltaX) || 0;
  const y = Number(deltaY) || 0;
  const minimum = Math.max(1, Number(threshold) || 28);
  if (Math.abs(y) < minimum || Math.abs(y) <= Math.abs(x)) return null;
  return y < 0;
};

export class CardViewPageController {
  constructor(host, constants = {}) {
    this._host = host;
    this._constants = constants;
    this._mode = "alerts";
    this._returnMode = "alerts";
    this._showAllAlerts = true;
    this._alertTakeoverEnabled = null;
    this._alerts = [];
    this._recordings = [];
    this._alertsLoading = false;
    this._recordingsLoading = false;
    this._favoritesLoading = false;
    this._selectedDayTs = null;
    this._calendarMonth = null;
    this._calendarOpen = false;
    this._mediaDrawerCalendarOpen = false;
    this._mediaDrawerFilterOpen = false;
    this._columns = 1;
    this._alertLoadToken = 0;
    this._recordingLoadToken = 0;
    this._favoritesLoadToken = 0;
    this._alertRefreshTimer = null;
    this._cleanup = new CleanupController();
    this._activityContent = null;
    this._activityMarkup = "";
    this._toolbarContent = null;
    this._toolbarMarkup = "";
    this._boundScroller = null;
    this._scrollControlsFrame = 0;
    this._recordingContextKey = "";
    this._drawerOpen = true;
    this._drawerInitialized = false;
    this._drawerPointerGesture = null;
    this._suppressDrawerClick = false;
    this._drawerClickResetTimer = null;
    this._startModeApplied = false;
    this._standaloneStageHeight = 0;
    this._standaloneModeControlsMarkup = "";
    this._standaloneGridModeActive = false;
    this._standaloneGridIndicatorTimer = null;
    this._standaloneTalkMarkup = "";
    this._mediaDrawerController = new CardViewMediaDrawerController({
      query: (selector) => this._host.shadowRoot?.querySelector?.(selector),
      isEnabled: () =>
        this.usesOverlayPresentation() &&
        this._host._config?.card_view_media_drawer_enabled === true &&
        this._availableMediaDrawerTypes().length > 0,
      getAvailableTypes: () => this._availableMediaDrawerTypes(),
      getEvents: (mediaType) =>
        this._mediaDrawerEvents(mediaType),
      getRecordings: () => this._recordingRows(),
      isEventsLoading: (drawerType) =>
        drawerType === CARD_VIEW_MEDIA_DRAWER_TYPES.favorites &&
        this._favoritesLoading,
      isRecordingsLoading: () => this._recordingsLoading,
      mediaUrl: (id, file, camera = "") =>
        this._host._mediaForCamera?.(id, file, camera) || "",
      formatDateTime: (timestamp) =>
        this._host._dateTimeLabel?.(timestamp) || "",
      formatTime: (timestamp) => this._host._time?.(timestamp) || "",
      onSelectEvent: (id, mediaType) => {
        this._host._pauseSlideshowForInteraction?.();
        this._host._popupMediaLoaderController?.showCarouselEventById?.(
          id,
          mediaType,
          { presentation: POPUP_PRESENTATION_CARD_VIEW_DRAWER },
        );
      },
      onSelectRecording: (recording) =>
        this._openMediaDrawerRecording(recording),
      onSelectType: (drawerType) =>
        this._handleMediaDrawerTypeSelected(drawerType),
      onOpenChange: (open) => {
        if (!open) {
          this._closeMediaDrawerPopovers();
          return;
        }
        this._loadMediaDrawerTypeData(
          this._mediaDrawerController.selectedType(),
        );
      },
      onToggleCalendar: () => this._toggleMediaDrawerCalendar(),
      onToggleFilter: () => this._toggleMediaDrawerFilter(),
      isCalendarOpen: () => this._mediaDrawerCalendarOpen,
      isFilterOpen: () => this._mediaDrawerFilterOpen,
      icons: ICONS,
    });
  }

  isActive() {
    return this._host._pageId === this._constants.PAGE_IDS.cardView;
  }

  isStandalone() {
    return (
      this.isActive() &&
      this._host._config?.card_view_standalone === true
    );
  }

  usesOverlayPresentation() {
    if (!this.isActive()) return false;
    return (
      normalizeCardViewViewMode(
        this._host._config?.card_view_view_mode,
      ) === CARD_VIEW_VIEW_MODES.videoOnly
    );
  }

  openDeepLinkEvent(event, { mediaHint = "" } = {}) {
    if (!this.usesOverlayPresentation() || !event?.id) return false;
    const loader = this._host._popupMediaLoaderController;
    const options = {
      presentation: POPUP_PRESENTATION_CARD_VIEW_DRAWER,
    };
    if (mediaHint === "snapshot" || !event.has_clip) {
      if (typeof loader?.showSnapshot !== "function") return false;
      loader.showSnapshot(event, options);
      return true;
    }
    if (typeof loader?.showClip !== "function") return false;
    loader.showClip(event, {
      ...options,
      mediaType: "clip",
    });
    return true;
  }

  liveFullscreenTarget() {
    const liveStage = this._host._$?.("#live-stage") || null;
    if (!this.usesOverlayPresentation()) return liveStage;
    return this._host._$?.("#card") || liveStage;
  }

  handleRotateOverlayState({ active = false } = {}) {
    if (
      active !== true ||
      !this.usesOverlayPresentation() ||
      !this._mediaDrawerController.isOpen()
    ) {
      return false;
    }
    this._mediaDrawerController.setOpen(false);
    return true;
  }

  applyConfiguredStartMode({ force = false } = {}) {
    if (!this.usesOverlayPresentation()) return false;
    if (this._startModeApplied && !force) return false;
    this._startModeApplied = true;

    const configuredMode = normalizeCardViewStartMode(
      this._host._config?.card_view_start_mode,
    );
    const startGrid =
      configuredMode === CARD_VIEW_START_MODES.grid &&
      this._host._isGridModeAvailable?.() === true;
    const startSlideshow =
      configuredMode === CARD_VIEW_START_MODES.slideshow &&
      this._host._isSlideshowRotationAvailable?.() === true;

    if (startGrid) {
      if (this._host._slideshowActive === true) {
        this._host._stopSlideshowRotation?.(
          "card-view-start-grid",
          false,
        );
      }
      if (this._host._viewMode !== "grid") {
        this._host._setViewMode?.("grid");
      }
      return true;
    }

    if (this._host._viewMode === "grid") {
      this._host._setViewMode?.("single");
    }
    if (startSlideshow) {
      if (this._host._slideshowActive !== true) {
        this._host._startSlideshowRotation?.("card-view-start");
      }
      return true;
    }
    if (this._host._slideshowActive === true) {
      this._host._stopSlideshowRotation?.("card-view-start-live");
    }
    return true;
  }

  activateCardViewPageRoute(context = {}) {
    this._startModeApplied = false;
    const routeContext = this.usesOverlayPresentation()
      ? {
          ...context,
          startInGrid:
            normalizeCardViewStartMode(
              this._host._config?.card_view_start_mode,
            ) === CARD_VIEW_START_MODES.grid &&
            this._host._isGridModeAvailable?.() === true,
        }
      : context;
    activateStandardPageRouteLifecycle({
      host: this._host,
      context: routeContext,
      previewPageId: this._constants.PAGE_IDS.preview,
      applyRouteFrame: () => {
        this._host._applyPreviewShellVisibility();
        this.syncCardViewPageMarkup();
        this._host._applyCardStyle();
      },
    });
    this.bind();
    void this.start();
  }

  async start() {
    if (!this.isActive()) return;
    this.applyConfiguredStartMode();
    this._ensureDrawerState();
    this.syncDrawerState();
    this._syncAlertsFromCache();
    this.renderToolbar();
    this.syncStandalonePresentation();
    this.renderActivity();
    void this._discoverPtzSupport();
    await this.refreshActiveContent({ force: true });
  }

  deactivate() {
    this._alertLoadToken += 1;
    this._recordingLoadToken += 1;
    this._favoritesLoadToken += 1;
    this._favoritesLoading = false;
    this._cleanup.dispose();
    this._cleanup = new CleanupController();
    if (this._alertRefreshTimer) clearTimeout(this._alertRefreshTimer);
    this._alertRefreshTimer = null;
    this._drawerInitialized = false;
    this._drawerPointerGesture = null;
    this._suppressDrawerClick = false;
    if (this._drawerClickResetTimer) {
      clearTimeout(this._drawerClickResetTimer);
    }
    this._drawerClickResetTimer = null;
    this._startModeApplied = false;
    this._standaloneStageHeight = 0;
    this._standaloneModeControlsMarkup = "";
    this._resetStandaloneGridIndicator();
    this._standaloneTalkMarkup = "";
    this._mediaDrawerCalendarOpen = false;
    this._mediaDrawerFilterOpen = false;
    this._mediaDrawerController.dispose();
    this._activityContent = null;
    this._activityMarkup = "";
    this._toolbarContent = null;
    this._toolbarMarkup = "";
    this._boundScroller = null;
    this._cancelScrollControlsSync();
    this._host.classList?.toggle?.(
      CARD_VIEW_BOTTOM_PANEL_OPEN_HOST_CLASS,
      false,
    );
  }

  bind() {
    this._cleanup.dispose();
    this._cleanup = new CleanupController();
    this._boundScroller = null;
    this._cancelScrollControlsSync();
    const liveStage = this._host._$?.("#live-stage");
    if (liveStage && typeof ResizeObserver === "function") {
      const stageObserver = new ResizeObserver((entries) => {
        const stageEntry = entries?.[0];
        const observedHeight = Number(
          stageEntry?.borderBoxSize?.[0]?.blockSize ??
            stageEntry?.contentRect?.height,
        );
        if (!Number.isFinite(observedHeight) || observedHeight <= 0) return;
        this._standaloneStageHeight = observedHeight;
        this.syncStandalonePickerPanelSize();
      });
      stageObserver.observe(liveStage);
      this._cleanup.addCleanup(() => stageObserver.disconnect());
    }
    this._mediaDrawerController.bind();
    const content = this._host._pageShellRegion?.("cardViewActivity");
    if (!content) return;

    const syncLayout = (entries = []) => {
      const entry = entries.find?.(({ target }) => target === content) ||
        entries[0];
      const borderBox = Array.isArray(entry?.borderBoxSize)
        ? entry.borderBoxSize[0]
        : entry?.borderBoxSize;
      const observedWidth = Number(
        borderBox?.inlineSize ?? entry?.contentRect?.width,
      );
      const width = observedWidth > 0
        ? observedWidth
        : content.getBoundingClientRect?.().width || content.clientWidth;
      const nextColumns = resolveCardViewColumnCount({
        width,
        mode: this._mode,
      });
      const columnValue = String(nextColumns);
      if (
        content.dataset &&
        content.dataset.cardViewColumns !== columnValue
      ) {
        content.dataset.cardViewColumns = columnValue;
      }
      if (nextColumns !== this._columns) {
        this._columns = nextColumns;
        if (this._mode === "recordings") {
          this._scheduleScrollControlsSync();
          return;
        }
        this.renderActivity();
        return;
      }
      this._scheduleScrollControlsSync();
    };
    if (typeof ResizeObserver === "function") {
      const observer = new ResizeObserver(syncLayout);
      observer.observe(content);
      this._cleanup.addCleanup(() => observer.disconnect());
    }
    const ownerDocument = this._host.ownerDocument || globalThis.document;
    this._cleanup.addEventListener(
      ownerDocument,
      "pointerdown",
      (event) => this.closeCalendarIfOutside(event),
      true,
    );
    syncLayout();
    this._bindScroller();
    this._bindDrawerHandles();
    this._ensureDrawerState();
    this.syncDrawerState();
  }

  _ensureDrawerState() {
    if (this._drawerInitialized) return;
    this._drawerOpen =
      normalizeCardViewViewMode(
        this._host._config?.card_view_view_mode,
      ) === CARD_VIEW_VIEW_MODES.bottomPanelOpen;
    this._drawerInitialized = true;
  }

  _bindDrawerHandles() {
    const handles = this._host.shadowRoot?.querySelectorAll?.(
      "[data-card-view-drawer-toggle]",
    );
    for (const handle of handles || []) {
      this._cleanup.addEventListener(handle, "pointerdown", (event) => {
        if (event.isPrimary === false) return;
        this._drawerPointerGesture = {
          pointerId: event.pointerId,
          x: Number(event.clientX) || 0,
          y: Number(event.clientY) || 0,
        };
        try {
          handle.setPointerCapture?.(event.pointerId);
        } catch (_) {}
      });
      this._cleanup.addEventListener(handle, "pointerup", (event) => {
        const gesture = this._drawerPointerGesture;
        this._drawerPointerGesture = null;
        if (!gesture || gesture.pointerId !== event.pointerId) return;
        const deltaX = (Number(event.clientX) || 0) - gesture.x;
        const deltaY = (Number(event.clientY) || 0) - gesture.y;
        const open = resolveCardViewDrawerSwipe({ deltaX, deltaY });
        if (open == null) return;
        event.preventDefault?.();
        this.setDrawerOpen(open);
        this._suppressDrawerClick = true;
        if (this._drawerClickResetTimer) {
          clearTimeout(this._drawerClickResetTimer);
        }
        this._drawerClickResetTimer = setTimeout(() => {
          this._suppressDrawerClick = false;
          this._drawerClickResetTimer = null;
        }, 400);
      });
      this._cleanup.addEventListener(handle, "pointercancel", () => {
        this._drawerPointerGesture = null;
      });
    }
  }

  setDrawerOpen(open) {
    this._ensureDrawerState();
    const nextOpen = open === true;
    const changed = nextOpen !== this._drawerOpen;
    this._drawerOpen = nextOpen;
    this.syncDrawerState();
    if (changed) this.renderActivity();
    return this._drawerOpen;
  }

  toggleDrawer() {
    this._ensureDrawerState();
    return this.setDrawerOpen(!this._drawerOpen);
  }

  syncDrawerState() {
    if (!this.isActive()) return;
    this._ensureDrawerState();
    this._host.classList?.toggle?.(
      CARD_VIEW_BOTTOM_PANEL_OPEN_HOST_CLASS,
      this._drawerOpen && !this.usesOverlayPresentation(),
    );
    const drawer = this._host.shadowRoot?.querySelector?.(
      "[data-card-view-drawer]",
    );
    if (!drawer) return;
    drawer.classList?.toggle?.("is-open", this._drawerOpen);
    drawer.classList?.toggle?.("is-closed", !this._drawerOpen);
    if (drawer.dataset) {
      drawer.dataset.drawerState = this._drawerOpen ? "open" : "closed";
    }
    drawer.setAttribute?.("aria-hidden", String(!this._drawerOpen));
    for (const handle of this._host.shadowRoot?.querySelectorAll?.(
      "[data-card-view-drawer-toggle]",
    ) || []) {
      const label = this._drawerOpen
        ? "Close activity drawer"
        : "Open activity drawer";
      handle.setAttribute?.("aria-expanded", String(this._drawerOpen));
      handle.setAttribute?.("aria-label", label);
      handle.setAttribute?.("title", label);
    }
    this.syncFooterControls();
  }

  _bindScroller() {
    const scroller = this._host.shadowRoot?.querySelector(
      "[data-card-view-scroller]",
    );
    if (!scroller) {
      this._boundScroller = null;
      this._cancelScrollControlsSync();
      this.syncScrollControls();
      return;
    }
    if (scroller === this._boundScroller) return;
    this._cancelScrollControlsSync();
    this._boundScroller = scroller;
    this._cleanup.addEventListener(scroller, "scroll", () => {
      this._scheduleScrollControlsSync();
    });
    this._scheduleScrollControlsSync({ afterPaint: true });
  }

  _scheduleScrollControlsSync({ afterPaint = false } = {}) {
    if (this._scrollControlsFrame) return;
    const requestFrame = globalThis.requestAnimationFrame;
    if (typeof requestFrame !== "function") {
      this.syncScrollControls();
      return;
    }
    const sync = () => {
      this._scrollControlsFrame = 0;
      if (this.isActive()) this.syncScrollControls();
    };
    this._scrollControlsFrame = requestFrame(() => {
      this._scrollControlsFrame = 0;
      if (!afterPaint) {
        sync();
        return;
      }
      this._scrollControlsFrame = requestFrame(sync);
    });
  }

  _cancelScrollControlsSync() {
    if (!this._scrollControlsFrame) return;
    globalThis.cancelAnimationFrame?.(this._scrollControlsFrame);
    this._scrollControlsFrame = 0;
  }

  camSwitcherMarkup({ includeStatus = true } = {}) {
    const activeEntity = this._host._activeCam?.entity;
    const activeState = activeEntity
      ? this._host._hass?.states?.[activeEntity]
      : null;
    return buildCameraPickerMarkup({
      includeStatus,
      cameras: this._host._config?.cameras || [],
      activeCamIdx: this._host._activeCamIdx,
      icons: ICONS,
      getCameraName: cameraName,
      isCameraAvailable: (camera) =>
        this._host._hass?.states?.[camera.entity]?.state !== "unavailable",
      streamType: this._host._activeStreamType || "--",
      online: activeState ? activeState.state !== "unavailable" : true,
      pickerOpen: this._host._mobileCamSwitcherOpen === true,
      activeCameraName:
        this.usesOverlayPresentation() && this._host._viewMode === "grid"
          ? "Grid"
          : "",
      activeCameraLabelKey:
        this.usesOverlayPresentation() && this._host._viewMode === "grid"
          ? "runtime.live.grid"
          : "",
      showStatus: !this.usesOverlayPresentation(),
    });
  }

  renderCamSwitcher() {
    const content = this._host._pageShellRegionElement?.(
      "cameraSwitcher",
      "[data-mobile-cam-switcher-content]",
    );
    if (content) {
      content.innerHTML = this.camSwitcherMarkup();
      applyLocalizedText(content, this._host._localization?.t);
    }
    this.syncStandalonePickerPanelSize();
  }

  syncStandalonePickerPanelSize() {
    if (!this.usesOverlayPresentation()) return;
    const panel = this._host.shadowRoot?.querySelector?.(
      ".card-view-camera-row .mobile-cam-picker__panel",
    );
    if (!panel) return;
    const stageHeight = Number(this._standaloneStageHeight) || 0;
    if (stageHeight <= 0) return;
    panel.style.maxHeight = `${Math.max(
      64,
      stageHeight - 56,
    )}px`;
  }

  syncStatus() {
    const state = this._host._hass?.states?.[this._host._activeCam?.entity];
    const statusDot = this._host._pageShellRegionElement?.(
      "cameraSwitcher",
      "#on-dot",
    );
    if (statusDot) {
      statusDot.style.color = state?.state === "unavailable"
        ? "var(--c-off)"
        : "var(--c-on)";
    }
    const liveBadge = this._host.shadowRoot?.querySelector?.(
      "[data-card-view-live-badge]",
    );
    if (liveBadge) {
      liveBadge.classList?.toggle?.(
        "is-offline",
        state?.state === "unavailable",
      );
    }
  }

  renderStats() {
    const stream = this._host._pageShellRegionElement?.(
      "cameraSwitcher",
      "#stream-type",
    );
    if (stream) stream.textContent = this._host._activeStreamType || "--";

    const sourceIndicator = this._host.shadowRoot?.querySelector?.(
      "[data-card-view-source-indicator]",
    );
    if (!sourceIndicator) return;
    const sourceState = resolveCardViewSourceIndicatorState(
      this._host._activeStreamType,
    );
    const sourceIcon = sourceIndicator.querySelector?.(
      "[data-card-view-source-icon]",
    );
    const sourceText = sourceIndicator.querySelector?.(
      "[data-card-view-source-text]",
    );
    sourceIndicator.hidden = !sourceState.visible;
    sourceIndicator.title = sourceState.label;
    sourceIndicator.setAttribute?.(
      "aria-label",
      sourceState.visible ? `${sourceState.label} live source` : "Live source",
    );
    if (sourceIcon) sourceIcon.hidden = !sourceState.showIcon;
    if (sourceText) {
      sourceText.hidden = !sourceState.text;
      sourceText.textContent = sourceState.text;
    }
  }

  titleText() {
    return resolveCameraAwareText({
      value: this._host._config?.title,
      fallback: DEFAULT_TITLE,
      activeCamera: this._host._activeCam,
      getCameraName: cameraName,
      gridMode: this._host._viewMode === "grid",
    });
  }

  subtitleText() {
    return resolveCameraAwareText({
      value: this._host._config?.subtitle,
      fallback: DEFAULT_SUBTITLE,
      blankUsesCamera: true,
      activeCamera: this._host._activeCam,
      getCameraName: cameraName,
      gridMode: this._host._viewMode === "grid",
    });
  }

  renderSubtitle() {}
  renderLegend() {}
  listHeadingLabel() { return ""; }
  recordingsHeadingLabel() { return ""; }
  renderListLabel() {}
  showStickyDayHeaders() { return false; }
  renderStickyDaySections() { return ""; }
  renderEventsContent() { return ""; }
  renderKeptContent() { return ""; }
  renderReviewsContent() { return ""; }
  syncBrowseHeadFromScroll() {}
  setListHtmlIfChanged() { return false; }
  syncOlderHint() {}

  renderList() {
    this.renderToolbar();
    this.renderActivity();
  }

  renderMediaDrawer(options = {}) {
    return this._mediaDrawerController.render(options);
  }

  _availableMediaDrawerTypes() {
    return resolveCardViewMediaDrawerTypes(
      this._host._config?.hidden_tabs,
    );
  }

  _mediaDrawerEvents(mediaType) {
    const events =
      this._host._popupCarouselController?.eventsForMediaType?.(mediaType) ||
      [];
    const bounds = this._selectedDayTs ? this._selectedDayBounds() : null;
    return events.filter((event) => {
      const start = Number(event?.start_time) || 0;
      if (bounds && (start < bounds.start || start > bounds.end)) return false;
      return this._host._browseFilterController?.matchesEventFilters?.(event) !==
        false;
    });
  }

  _openMediaDrawerRecording(recording) {
    const start = Math.floor(Number(recording?.start_time) || 0);
    const end = Math.floor(Number(recording?.end_time) || 0);
    if (!start || end <= start) return false;
    const cameraEntity = String(recording?._fvc_camera_entity || "");
    const context = cameraEntity
      ? this._host._camCache?.[cameraEntity]
      : null;
    this._host._pauseSlideshowForInteraction?.();
    void this._host._popupMediaLoaderController?.showRecording?.(
      start,
      end,
      {
        presentation: POPUP_PRESENTATION_CARD_VIEW_DRAWER,
        ...(context?.clientId && context?.cam
          ? { clientId: context.clientId, camera: context.cam }
          : {}),
      },
    );
    return true;
  }

  _handleMediaDrawerTypeSelected(drawerType) {
    this._mediaDrawerCalendarOpen = false;
    this._mediaDrawerFilterOpen = false;
    this.renderMediaDrawerCalendar();
    this.renderMediaDrawerFilter();
    this._loadMediaDrawerTypeData(drawerType);
  }

  _loadMediaDrawerTypeData(drawerType) {
    if (drawerType === CARD_VIEW_MEDIA_DRAWER_TYPES.recordings) {
      this._recordingsLoading = true;
      void this.loadRecordings();
      return;
    }
    if (drawerType === CARD_VIEW_MEDIA_DRAWER_TYPES.favorites) {
      void this._loadMediaDrawerFavorites();
    }
  }

  async _loadMediaDrawerFavorites() {
    if (!this.isActive()) return;
    const token = ++this._favoritesLoadToken;
    this._favoritesLoading = true;
    this.renderMediaDrawer({ force: true });
    try {
      await this._host._loadKept?.();
    } catch (_) {
      // The existing Favorites loader owns its transport failure handling.
    }
    if (token !== this._favoritesLoadToken || !this.isActive()) return;
    this._favoritesLoading = false;
    if (
      this._mediaDrawerController.isOpen() &&
      this._mediaDrawerController.selectedType() ===
        CARD_VIEW_MEDIA_DRAWER_TYPES.favorites
    ) {
      this.renderMediaDrawer({ force: true });
    }
  }

  _toggleMediaDrawerCalendar() {
    this._mediaDrawerCalendarOpen = !this._mediaDrawerCalendarOpen;
    this._mediaDrawerFilterOpen = false;
    this.renderMediaDrawerCalendar();
    this.renderMediaDrawerFilter();
    if (this._mediaDrawerCalendarOpen) {
      void this._host._prefetchCalendarActivityForActiveCamera?.().then(() => {
        if (this.isActive() && this._mediaDrawerCalendarOpen) {
          this.renderMediaDrawerCalendar();
        }
      });
    }
  }

  _toggleMediaDrawerFilter() {
    if (
      this._mediaDrawerController.selectedType() ===
      CARD_VIEW_MEDIA_DRAWER_TYPES.recordings
    ) {
      return;
    }
    this._mediaDrawerFilterOpen = !this._mediaDrawerFilterOpen;
    this._mediaDrawerCalendarOpen = false;
    this.renderMediaDrawerCalendar();
    this.renderMediaDrawerFilter();
  }

  _closeMediaDrawerPopovers() {
    if (!this._mediaDrawerCalendarOpen && !this._mediaDrawerFilterOpen) return;
    this._mediaDrawerCalendarOpen = false;
    this._mediaDrawerFilterOpen = false;
    this.renderMediaDrawerCalendar();
    this.renderMediaDrawerFilter();
  }

  _calendarPanelMarkup() {
    const now = Math.floor(Date.now() / 1000);
    const parts = this._host._tzParts(this._selectedDayTs || now);
    if (!(this._calendarMonth instanceof Date)) {
      this._calendarMonth = new Date(
        Date.UTC(parts.year, parts.month - 1, 15, 12, 0, 0),
      );
    }
    const timeZone = this._host._tz();
    return this._constants.buildCalendarPanelMarkup?.({
      monthDate: this._calendarMonth,
      activeDayDateString: this._selectedDayTs
        ? this._formatDateString(parts)
        : "",
      todayDateString: this._formatDateString(this._host._tzParts(now)),
      daysWithActivity: this._host._daysWithActivity || new Set(),
      timeZone,
      monthLabel:
        this._host._calendarMonthLabel?.(this._calendarMonth, timeZone) || "",
      showReset: !!this._selectedDayTs,
    }) || "";
  }

  renderMediaDrawerCalendar() {
    const panel = this._host.shadowRoot?.querySelector?.(
      "[data-card-view-media-drawer-calendar-panel]",
    );
    if (!panel) return;
    panel.hidden = !this._mediaDrawerCalendarOpen;
    if (this._mediaDrawerCalendarOpen) {
      panel.innerHTML = this._calendarPanelMarkup();
    }
  }

  renderMediaDrawerFilter() {
    const panel = this._host.shadowRoot?.querySelector?.(
      "[data-card-view-media-drawer-filter-panel]",
    );
    if (!panel) return;
    panel.hidden = !this._mediaDrawerFilterOpen;
    if (!this._mediaDrawerFilterOpen) return;
    const eventsById = new Map();
    for (const mediaType of ["alert", "clip", "snapshot"]) {
      for (const event of
        this._host._popupCarouselController?.eventsForMediaType?.(
          mediaType,
        ) || []) {
        if (event?.id) eventsById.set(String(event.id), event);
      }
    }
    const events = [...eventsById.values()];
    const labels = collectFilterLabelsFromEvents(events);
    const zones = collectFilterZonesFromEvents(events);
    const normalized = normalizeFilterSelections({
      filterLabel: this._host._filterLabel,
      filterZone: this._host._filterZone,
      labels,
      zones,
    });
    this._host._filterLabel = normalized.filterLabel;
    this._host._filterZone = normalized.filterZone;
    panel.innerHTML = this._constants.buildFilterPanelMarkup?.({
      labels: ["all", ...labels],
      zones: ["all", ...zones],
      filterLabel: this._host._filterLabel,
      filterZone: this._host._filterZone,
      favOnly: this._host._favOnly,
    }) || "";
  }

  _handleMediaDrawerFilterOption(target) {
    const label = target?.closest?.("[data-flabel]");
    const zone = target?.closest?.("[data-fzone]");
    const favorite = target?.closest?.("[data-favonly]");
    if (!label && !zone && !favorite) return false;
    if (label) {
      this._host._filterLabel = toggleFilterSelection(
        this._host._filterLabel,
        label.dataset.flabel,
      );
    } else if (zone) {
      this._host._filterZone = toggleFilterSelection(
        this._host._filterZone,
        zone.dataset.fzone,
      );
    } else {
      this._host._favOnly = favorite.dataset.favonly === "1";
    }
    this.renderMediaDrawerFilter();
    this.renderMediaDrawer({ force: true });
    return true;
  }

  renderStandaloneModeControls(buttonStates = null) {
    const container = this._host.shadowRoot?.querySelector?.(
      "[data-card-view-standalone-mode-controls]",
    );
    if (!container) return;
    if (!this.usesOverlayPresentation()) {
      container.innerHTML = "";
      this._standaloneModeControlsMarkup = "";
      this._resetStandaloneGridIndicator(container);
      return;
    }
    const modeSwitchLocked =
      this._mode === "ptz" ||
      this._host._twoWayTalkStarting === true ||
      this._host._twoWayTalkActiveForCurrentCamera?.() === true;
    const resolvedButtonStates =
      buttonStates || this._host._toolbarButtonStates?.() || {};
    const markup = buildCardViewStandaloneModeControlsMarkup({
      icons: ICONS,
      showAlertTakeover:
        this._host._isAlertCameraTakeoverAvailable?.() !== false,
      alertTakeoverEnabled: this.alertTakeoverEnabled(),
      alertTakeoverDisabled:
        resolvedButtonStates.wideAlertTakeoverDisabled === true,
      gridAvailable: this._host._isGridModeAvailable?.() === true,
      gridActive:
        this._host._isGridSessionActive?.() ??
        this._host._viewMode === "grid",
      gridDisabled: modeSwitchLocked,
      slideshowAvailable:
        this._host._isSlideshowRotationAvailable?.() === true,
      slideshowActive: this._host._slideshowActive === true,
      slideshowDisabled: modeSwitchLocked,
      slideshowRemainingSeconds: 0,
    });
    if (markup !== this._standaloneModeControlsMarkup) {
      container.innerHTML = markup;
      this._standaloneModeControlsMarkup = markup;
    }
    this._syncStandaloneGridIndicator(container);
    this.syncStandaloneSlideshowCountdown();
  }

  _syncStandaloneGridIndicator(container) {
    const gridActive =
      this._host._isGridSessionActive?.() ??
      this._host._viewMode === "grid";
    if (!gridActive) {
      this._resetStandaloneGridIndicator(container);
      return;
    }
    if (this._standaloneGridModeActive) {
      if (this._standaloneGridIndicatorTimer) {
        container?.classList?.add(STANDALONE_GRID_INDICATOR_VISIBLE_CLASS);
      }
      return;
    }
    this._standaloneGridModeActive = true;
    container?.classList?.add(STANDALONE_GRID_INDICATOR_VISIBLE_CLASS);
    this._standaloneGridIndicatorTimer = setTimeout(() => {
      this._standaloneGridIndicatorTimer = null;
      const currentContainer = this._host.shadowRoot?.querySelector?.(
        "[data-card-view-standalone-mode-controls]",
      );
      currentContainer?.classList?.remove(
        STANDALONE_GRID_INDICATOR_VISIBLE_CLASS,
      );
    }, STANDALONE_GRID_INDICATOR_DURATION_MS);
    this._standaloneGridIndicatorTimer?.unref?.();
  }

  _resetStandaloneGridIndicator(container = null) {
    if (this._standaloneGridIndicatorTimer) {
      clearTimeout(this._standaloneGridIndicatorTimer);
    }
    this._standaloneGridIndicatorTimer = null;
    this._standaloneGridModeActive = false;
    container?.classList?.remove(STANDALONE_GRID_INDICATOR_VISIBLE_CLASS);
  }

  syncStandaloneSlideshowCountdown() {
    if (!this.usesOverlayPresentation()) return;
    const countdown = this._host.shadowRoot?.querySelector?.(
      "[data-card-view-slideshow-countdown]",
    );
    if (!countdown) return;
    const remainingMs = Math.max(
      0,
      Number(this._host._slideshowNextSwitchAtMs || 0) - Date.now(),
    );
    countdown.textContent = `${Math.max(0, Math.ceil(remainingMs / 1000))}s`;
  }

  renderStandaloneLinkedControls() {
    const container = this._host.shadowRoot?.querySelector?.(
      "[data-card-view-standalone-talk-overlay]",
    );
    if (!container) return;
    if (!this.usesOverlayPresentation()) {
      container.innerHTML = "";
      this._standaloneTalkMarkup = "";
      return;
    }
    const showMicrophone =
      this._host._shouldRenderTwoWayTalkButtonForActiveCamera?.() === true;
    const markup = showMicrophone
      ? this._host._buildTwoWayTalkControlRowMarkup?.({
          includeIncomingAudioMute: true,
        }) || ""
      : "";
    if (markup !== this._standaloneTalkMarkup) {
      container.innerHTML = markup;
      this._standaloneTalkMarkup = markup;
    }
    this._host._syncTwoWayTalkSoundwaveSurface?.();
    this._host._linkedLightController?.sync?.();
  }

  syncStandalonePresentation(buttonStates = null) {
    this.syncCardViewPageMarkup();
    if (!this.isActive()) return;
    this.renderStandaloneModeControls(buttonStates);
    this.renderStandaloneLinkedControls();
    this.syncStatus();
    this.syncStandalonePickerPanelSize();
  }

  renderToolbar(buttonStates = null) {
    if (!this.isActive()) return;
    const toolbar = this._host.shadowRoot?.querySelector(
      "[data-card-view-toolbar]",
    );
    if (!toolbar) return;
    const showMicrophone =
      this._host._shouldRenderTwoWayTalkButtonForActiveCamera?.() === true;
    const overlayPresentation = this.usesOverlayPresentation();
    const resolvedButtonStates =
      buttonStates || this._host._toolbarButtonStates?.() || {};
    const toolbarMarkup = buildCardViewToolbarMarkup({
      icons: ICONS,
      mode: this._mode,
      showAllAlerts: this._showAllAlerts,
      activeCameraName: cameraName(this._host._activeCam),
      showAlertTakeover:
        this._host._isAlertCameraTakeoverAvailable?.() !== false,
      alertTakeoverEnabled: this.alertTakeoverEnabled(),
      alertTakeoverDisabled:
        resolvedButtonStates.wideAlertTakeoverDisabled === true,
      showPtz: this._canUseActiveCameraPtz(),
      ptzDisabled: resolvedButtonStates.controlsDisabled === true,
      gridAvailable:
        !overlayPresentation &&
        this._host._isGridModeAvailable?.() === true,
      gridActive:
        this._host._isGridSessionActive?.() ??
        this._host._viewMode === "grid",
      gridDisabled: resolvedButtonStates.gridDisabled === true,
      slideshowAvailable:
        !overlayPresentation &&
        this._host._isSlideshowRotationAvailable?.() === true,
      slideshowActive: this._host._slideshowActive === true,
      slideshowDisabled: resolvedButtonStates.slideshowDisabled === true,
      showMicrophone: !overlayPresentation && showMicrophone,
      microphoneMarkup: !overlayPresentation && showMicrophone
        ? this._host._buildTwoWayTalkControlRowMarkup?.() || ""
        : "",
      linkedLightLeftMarkup: !overlayPresentation
        ? this._host._buildLinkedLightControlMarkup?.({
            buttonClass: "icon-btn",
            position: "left",
          }) || ""
        : "",
      linkedLightRightMarkup: !overlayPresentation
        ? this._host._buildLinkedLightControlMarkup?.({
            buttonClass: "icon-btn",
            position: "right",
          }) || ""
        : "",
      showCenterControls: !overlayPresentation,
    });
    if (
      toolbar !== this._toolbarContent ||
      toolbarMarkup !== this._toolbarMarkup
    ) {
      toolbar.innerHTML = toolbarMarkup;
      this._toolbarContent = toolbar;
      this._toolbarMarkup = toolbarMarkup;
    }
    this._host._syncTwoWayTalkSoundwaveSurface?.();
    this._host._linkedLightController?.sync?.();
    this.syncStandalonePresentation(resolvedButtonStates);
    this.syncFooterControls(resolvedButtonStates);
  }

  syncFooterControls(buttonStates = null) {
    const calendar = this._host.shadowRoot?.querySelector?.(
      "[data-card-view-calendar]",
    );
    if (!calendar) return;
    const calendarAvailable =
      this._drawerOpen &&
      (this._mode === "alerts" || this._mode === "recordings");
    const resolvedButtonStates =
      buttonStates || this._host._toolbarButtonStates?.() || {};
    calendar.hidden = !calendarAvailable;
    calendar.disabled =
      calendarAvailable && resolvedButtonStates.calendarDisabled === true;
    calendar.classList?.toggle?.(
      "active",
      calendarAvailable && this._calendarOpen,
    );
    calendar.setAttribute?.(
      "aria-pressed",
      String(calendarAvailable && this._calendarOpen),
    );
    if (!calendarAvailable && this._calendarOpen) {
      this._calendarOpen = false;
      this.renderCalendar();
    }
  }

  renderActivity() {
    if (!this.isActive()) return;
    this.renderMediaDrawer();
    const content = this._host._pageShellRegion?.("cardViewActivity");
    if (!content) return;
    this._ensureDrawerState();
    if (this.usesOverlayPresentation() || !this._drawerOpen) {
      this._setActivityMarkup(content, "");
      this._bindScroller();
      return;
    }
    const columnValue = String(this._columns);
    if (
      content.dataset &&
      content.dataset.cardViewColumns !== columnValue
    ) {
      content.dataset.cardViewColumns = columnValue;
    }
    if (this._mode === "ptz") {
      this._setActivityMarkup(
        content,
        buildCardViewPtzMarkup({ icons: ICONS }),
      );
      this.syncScrollControls();
      return;
    }

    const items = this._mode === "recordings"
      ? this._recordingRows()
      : this._alerts;
    if (!items.length) {
      const loading = this._mode === "recordings"
        ? this._recordingsLoading
        : this._alertsLoading;
      this._setActivityMarkup(
        content,
        `<div class="card-view-empty">${loading ? "Loading…" : this._mode === "recordings" ? "No recordings for this day" : "No recent alerts"}</div>`,
      );
      this.syncScrollControls();
      return;
    }

    if (this._mode === "recordings") {
      const recordingMarkup = items
        .map((item) => `<div class="card-view-recording-slot">${this._recordingTileMarkup(item)}</div>`)
        .join("");
      this._setActivityMarkup(
        content,
        `<div class="card-view-scroller card-view-scroller--recordings" data-card-view-scroller>${recordingMarkup}</div>`,
      );
      this._bindScroller();
      return;
    }

    const pages = chunkCardViewItems(items, this._columns);
    const pageMarkup = pages
      .map((page) => `<div class="card-view-page" style="--card-view-columns:${this._columns}">${page
        .map((item) => this._host._reviewListItemHTML(item, {
          cameraAware: true,
          showDownloadButtons: true,
          showFavoriteButton: false,
        }))
        .join("")}</div>`)
      .join("");
    this._setActivityMarkup(
      content,
      `<div class="card-view-scroller" data-card-view-scroller>${pageMarkup}</div>`,
    );
    this._bindScroller();
  }

  _setActivityMarkup(content, markup) {
    const normalized = String(markup || "");
    if (
      content === this._activityContent &&
      normalized === this._activityMarkup
    ) {
      return false;
    }
    content.innerHTML = normalized;
    this._activityContent = content;
    this._activityMarkup = normalized;
    this._boundScroller = null;
    this._host._applyCardStyle?.();
    return true;
  }

  _recordingTileMarkup(recording) {
    const start = Math.floor(Number(recording?.start_time) || 0);
    const end = Math.floor(
      Number(recording?.end_time) || Date.now() / 1000,
    );
    const duration = Math.max(1, end - start);
    const minutes = Math.floor(duration / 60);
    const seconds = duration % 60;
    const durationLabel = `${minutes ? `${minutes}m ` : ""}${seconds}s`;
    const cameraEntity = String(recording?._fvc_camera_entity || "");
    const member = String(recording?._fvc_group_member || "");
    const cameraData = cameraEntity
      ? ` data-rec-camera-entity="${cameraEntity}"`
      : "";
    return `<div class="list-item card-view-recording-tile shadow-xform shadow-small" data-rs="${start}" data-re="${end}"${cameraData}>
      <div class="ric">${ICONS.recordings}${member ? `<span class="recording-group-member">${member}</span>` : ""}</div>
      <div class="rinf">
        <div class="rt">${this._host._dateTimeLabel(start)}</div>
        <div class="rsub">${this._host._time(start)} – ${this._host._time(end)} · ${durationLabel}${recording?.events ? ` · ${recording.events} events` : ""}</div>
      </div>
      <button class="rp" data-rec-dl-start="${start}" data-rec-dl-end="${end}"${cameraData} title="Download recording" aria-label="Download recording">${ICONS.download}</button>
    </div>`;
  }

  _recordingRows(recordings = this._recordings) {
    const now = Math.floor(Date.now() / 1000);
    const rowEnd = this._selectedDayTs
      ? Math.min(now, this._selectedDayBounds().end)
      : now;
    return resolveCardViewRecordingRows({ recordings, nowSec: rowEnd });
  }

  async loadAlerts({ force = false } = {}) {
    if (!this.isActive()) return;
    const token = ++this._alertLoadToken;
    this._alertsLoading = true;
    if (this._mode === "alerts" && !this._alerts.length) this.renderActivity();
    if (force && !this._selectedDayTs) {
      const now = Math.floor(Date.now() / 1000);
      this._host._winEnd = now;
      this._host._winStart = now -
        (this._host._config?.event_days || DEFAULT_EVENT_DAYS) * 86400;
      this._host._followNowWindow = true;
    }
    const useProgressivePaint = this._alerts.length === 0;
    let progressivePainted = false;
    await this._host._loadGridMixedTabData?.("alerts", {
      onProgress: () => {
        if (token !== this._alertLoadToken || !this.isActive()) return;
        this._syncAlertsFromCache();
        if (
          useProgressivePaint &&
          !progressivePainted &&
          this._alerts.length > 0 &&
          this._mode === "alerts"
        ) {
          progressivePainted = true;
          this.renderActivity();
        }
      },
    });
    if (token !== this._alertLoadToken || !this.isActive()) return;
    this._syncAlertsFromCache();
    this._alertsLoading = false;
    if (this._mode === "alerts") this.renderActivity();
    await this._host._browseWindowLoaderController?.warmOtherCamerasEvents?.();
    if (token !== this._alertLoadToken || !this.isActive()) return;
    this._syncAlertsFromCache();
    if (this._mode === "alerts") this.renderActivity();
  }

  _syncAlertsFromCache() {
    const reviews = (this._host._allGridReviews?.() || []).slice();
    const selectedBounds = this._selectedDayTs
      ? this._selectedDayBounds()
      : null;
    this._alerts = (this._showAllAlerts
      ? reviews
      : reviews.filter((review) => this._reviewMatchesActiveCamera(review)))
      .filter((review) => {
        if (!selectedBounds) return true;
        const start = Number(review?.start_time || 0);
        return start >= selectedBounds.start && start <= selectedBounds.end;
      })
      .slice()
      .sort((a, b) => Number(b?.start_time || 0) - Number(a?.start_time || 0));
  }

  _reviewMatchesActiveCamera(review) {
    const activeEntities = new Set(
      cameraMemberEntities(this._host._activeCam),
    );
    const reviewCamera = String(review?.camera || "");
    if (!activeEntities.size || !reviewCamera) return false;
    const mappedEntity = this._host._cameraEntityForIncomingCamera?.(
      reviewCamera,
    );
    if (mappedEntity) return activeEntities.has(mappedEntity);
    return [...activeEntities].some(
      (entity) =>
        reviewCamera === String(this._host._camCache?.[entity]?.cam || ""),
    );
  }

  async loadRecordings() {
    if (!this.isActive()) return;
    const token = ++this._recordingLoadToken;
    this._recordingsLoading = true;
    const now = Math.floor(Date.now() / 1000);
    const targetTs = this._selectedDayTs || now;
    const bounds = resolveRecordingsDayBounds({
      tsSec: targetTs,
      fallbackSec: now,
      getTzParts: (value) => this._host._tzParts(value),
      toEpochSeconds: (...parts) =>
        this._host._tzDateTimeToEpochSeconds(...parts),
    });
    const entities = cameraMemberEntities(this._host._activeCam);
    if (!entities.length) {
      this._recordingsLoading = false;
      this._renderRecordingConsumers();
      return;
    }
    await Promise.all(
      entities.map((entity) => this._host._discoverOne?.(entity)),
    );
    const contexts = entities
      .map((entity, index) => {
        const cache = this._host._camCache?.[entity];
        if (!cache?.clientId || !cache?.cam) return null;
        return {
          entity,
          member: index === 0 ? "A" : "B",
          clientId: cache.clientId,
          cam: cache.cam,
        };
      })
      .filter(Boolean);
    if (!contexts.length) {
      this._recordings = [];
      this._recordingsLoading = false;
      this._renderRecordingConsumers();
      return;
    }
    const contextKey = [
      ...contexts.flatMap(({ entity, clientId, cam }) => [
        entity,
        clientId,
        cam,
      ]),
      bounds.start,
      bounds.end,
    ].join(":");
    const preserveCurrentItems = contextKey === this._recordingContextKey;
    this._recordingContextKey = contextKey;
    if (!preserveCurrentItems) {
      this._recordings = [];
      this._renderRecordingConsumers();
    }
    const useProgressivePaint = this._recordings.length === 0;
    let progressivePainted = false;
    const recordingsByEntity = new Map();
    const syncProgress = () => {
      this._recordings = this._sortRecordings(
        [...recordingsByEntity.values()].flat(),
      );
      if (
        useProgressivePaint &&
        !progressivePainted &&
        this._recordings.length > 0 &&
        (this._mode === "recordings" || this._mediaDrawerRecordingsActive())
      ) {
        progressivePainted = true;
        this._renderRecordingConsumers();
      }
    };
    try {
      const results = await Promise.allSettled(
        contexts.map(async (context) => {
          const recordings = await this._host._recordingsBrowseNavController
            ?.fetchRecordingsInBoundsProgressively?.(
              bounds,
              context.clientId,
              context.cam,
              {
                before: Math.min(now, bounds.end),
                onProgress: (items) => {
                  if (
                    token !== this._recordingLoadToken ||
                    !this.isActive()
                  ) {
                    return;
                  }
                  recordingsByEntity.set(
                    context.entity,
                    this._tagGroupRecordings(items, context),
                  );
                  syncProgress();
                },
              },
            );
          return this._tagGroupRecordings(recordings, context);
        }),
      );
      if (token !== this._recordingLoadToken || !this.isActive()) return;
      this._recordings = this._sortRecordings(
        results.flatMap((result) =>
          result.status === "fulfilled" ? result.value : [],
        ),
      );
      this._recordingsLoading = false;
    } catch (_) {
      if (token !== this._recordingLoadToken) return;
      this._recordings = [];
      this._recordingsLoading = false;
    }
    this._renderRecordingConsumers();
  }

  _mediaDrawerRecordingsActive() {
    return (
      this._mediaDrawerController.isOpen() &&
      this._mediaDrawerController.selectedType() ===
        CARD_VIEW_MEDIA_DRAWER_TYPES.recordings
    );
  }

  _renderRecordingConsumers() {
    if (this._mode === "recordings") {
      this.renderActivity();
      return;
    }
    if (this._mediaDrawerRecordingsActive()) {
      this.renderMediaDrawer({ force: true });
    }
  }

  _sortRecordings(recordings) {
    return (Array.isArray(recordings) ? recordings : [])
      .slice()
      .sort((a, b) => Number(b?.start_time || 0) - Number(a?.start_time || 0));
  }

  _tagGroupRecordings(recordings, context) {
    const isGrouped =
      cameraMemberEntities(this._host._activeCam).length > 1;
    return (Array.isArray(recordings) ? recordings : []).map((recording) => ({
      ...recording,
      ...(context?.member === "B" || isGrouped
        ? {
            _fvc_camera_entity: context?.entity || "",
            _fvc_group_member: context?.member || "",
          }
        : {}),
    }));
  }

  alertTakeoverEnabled() {
    if (this._host._isAlertCameraTakeoverAvailable?.() === false) return false;
    return this._alertTakeoverEnabled == null
      ? this._host._config?.card_view_alert_takeover === true
      : this._alertTakeoverEnabled === true;
  }

  isPtzActive() {
    return this._mode === "ptz";
  }

  toggleAlertTakeover() {
    if (this._host._isAlertCameraTakeoverAvailable?.() === false) {
      this._host._syncToolbarButtons?.();
      return false;
    }
    if (
      !this.alertTakeoverEnabled() &&
      this._host._toolbarButtonStates?.().wideAlertTakeoverDisabled
    ) {
      this._host._syncToolbarButtons?.();
      return false;
    }
    this._alertTakeoverEnabled = !this.alertTakeoverEnabled();
    this._host._handleAlertTakeoverStateChange?.(
      this._alertTakeoverEnabled,
    );
    this._host._syncToolbarButtons?.();
    return this._alertTakeoverEnabled;
  }

  applyConfigUpdate({
    takeoverDefaultChanged = false,
    standaloneChanged = false,
    mediaDrawerEnabledChanged = false,
    startModeChanged = false,
    viewModeChanged = false,
    hideCameraNameChanged = false,
  } = {}) {
    if (takeoverDefaultChanged) {
      this._alertTakeoverEnabled = null;
      this._host._handleAlertTakeoverStateChange?.(
        this.alertTakeoverEnabled(),
      );
    }
    if (viewModeChanged) {
      this._drawerInitialized = true;
      this._drawerOpen =
        normalizeCardViewViewMode(
          this._host._config?.card_view_view_mode,
        ) === CARD_VIEW_VIEW_MODES.bottomPanelOpen;
      this.syncDrawerState();
    }
    if (!this.isActive()) return;

    const videoOnlyEnabled =
      viewModeChanged &&
      normalizeCardViewViewMode(
        this._host._config?.card_view_view_mode,
      ) === CARD_VIEW_VIEW_MODES.videoOnly;
    if (standaloneChanged || startModeChanged || videoOnlyEnabled) {
      this._startModeApplied = false;
      this.applyConfiguredStartMode({ force: true });
    }
    if (
      standaloneChanged ||
      mediaDrawerEnabledChanged ||
      startModeChanged ||
      viewModeChanged ||
      hideCameraNameChanged
    ) {
      this.syncCardViewPageMarkup();
      this.renderCamSwitcher();
    }
    if (standaloneChanged || viewModeChanged) {
      this._host._initLiveOverlayControls?.();
    }
    if (
      standaloneChanged ||
      mediaDrawerEnabledChanged ||
      viewModeChanged
    ) {
      this._mediaDrawerController.syncState();
      this.renderMediaDrawer();
    }
    this.renderToolbar();
    if (viewModeChanged) this.renderActivity();
    if (takeoverDefaultChanged) {
      void this.refreshActiveContent({ force: true });
    }
  }

  async refreshActiveContent({ force = false } = {}) {
    const activeMode = this._mode === "ptz" ? this._returnMode : this._mode;
    if (activeMode === "recordings" || this._mediaDrawerRecordingsActive()) {
      await this.loadRecordings();
      return;
    }
    await this.loadAlerts({ force });
  }

  async handleCameraChanged() {
    if (!this.isActive()) return;
    this.renderCamSwitcher();
    this.syncStatus();
    this.renderStats();
    if (this._mode === "ptz" && !this._canUseActiveCameraPtz()) {
      this._mode = this._returnMode;
    }
    this._syncAlertsFromCache();
    this.renderToolbar();
    this.renderMediaDrawer({ force: true });
    void this._discoverPtzSupport();
    const mediaDrawerType = this._mediaDrawerController.isOpen()
      ? this._mediaDrawerController.selectedType()
      : "";
    if (this._mode === "recordings" || this._mediaDrawerRecordingsActive()) {
      await this.loadRecordings();
    } else if (mediaDrawerType === CARD_VIEW_MEDIA_DRAWER_TYPES.favorites) {
      await this._loadMediaDrawerFavorites();
    } else if (this._mode === "alerts") {
      this.renderActivity();
    }
  }

  handleRealtimeMessage(message) {
    if (!this.isActive()) return;
    if (this._host._isRealtimeEventMessage?.(message)) {
      this._scheduleAlertRefresh();
    }
  }

  handleHaAlertStateChanged(changed) {
    if (changed === true && this.isActive()) this._scheduleAlertRefresh();
  }

  _scheduleAlertRefresh() {
    if (this._mode !== "alerts") return;
    if (this._alertRefreshTimer) clearTimeout(this._alertRefreshTimer);
    this._alertRefreshTimer = setTimeout(() => {
      this._alertRefreshTimer = null;
      void this.loadAlerts({ force: true });
    }, 500);
  }

  async _ensureReviewEvent(review, eventId) {
    const cached = this._host._findEventById?.(eventId);
    if (cached) return cached;
    await this._host._browseWindowLoaderController?.hydrateReviewEventMetadata?.(
      [review],
      { force: true },
    );
    return this._host._findEventById?.(eventId) || null;
  }

  async _openReview(review, eventId) {
    const event = await this._ensureReviewEvent(review, eventId);
    if (event) {
      this._host._popupMediaLoaderController?.showClip(event, {
        mediaType: "alert",
      });
      return;
    }
    this._host._popupMediaLoaderController?.showClipById(eventId, {
      mediaType: "alert",
      startTime: review?.start_time,
      camera: review?.camera,
    });
  }

  _canUseActiveCameraPtz() {
    if (
      this._host._activeGroupMemberOverride &&
      this._host._activeGroupMemberOverride !==
        this._host._activeCam?.entity
    ) {
      return false;
    }
    return canCameraUsePtz(
      this._host._activeCam,
      this._host._activeCameraPtzInfo?.(),
    );
  }

  async _discoverPtzSupport() {
    if (!this._host._activeCam?.ptz?.enabled) return;
    await this._host._ensureActiveCameraPtzInfo?.();
    if (this.isActive()) this.renderToolbar();
  }

  toggleMode() {
    this._calendarOpen = false;
    this._mode = this._mode === "recordings" ? "alerts" : "recordings";
    this._returnMode = this._mode;
    if (this._mode === "recordings") this._recordingsLoading = true;
    this._columns = resolveCardViewColumnCount({
      width: this._host._pageShellRegion?.("cardViewActivity")?.clientWidth,
      mode: this._mode,
    });
    this.renderToolbar();
    this.renderActivity();
    if (this._mode === "recordings") void this.loadRecordings();
    else void this.loadAlerts({ force: true });
  }

  toggleAlertScope() {
    if (this._mode !== "alerts") return this._showAllAlerts;
    this._showAllAlerts = !this._showAllAlerts;
    this._syncAlertsFromCache();
    this.renderToolbar();
    this.renderActivity();
    return this._showAllAlerts;
  }

  togglePtz() {
    if (!this._canUseActiveCameraPtz()) return;
    if (
      this._mode !== "ptz" &&
      this._host._toolbarButtonStates?.().controlsDisabled
    ) {
      this._host._syncToolbarButtons?.();
      return;
    }
    if (this._mode === "ptz") {
      this._mode = this._returnMode;
    } else {
      this._returnMode = this._mode === "recordings" ? "recordings" : "alerts";
      this._mode = "ptz";
      this._calendarOpen = false;
    }
    this._host._syncToolbarButtons?.();
    this.renderActivity();
  }

  toggleCalendar() {
    if (this._mode !== "alerts" && this._mode !== "recordings") return;
    this._calendarOpen = !this._calendarOpen;
    this.renderToolbar();
    this.renderCalendar();
    if (this._calendarOpen) {
      void this._host._prefetchCalendarActivityForActiveCamera?.().then(() => {
        if (this.isActive() && this._calendarOpen) this.renderCalendar();
      });
    }
  }

  closeCalendarIfOutside(event) {
    if (
      !this._calendarOpen &&
      !this._mediaDrawerCalendarOpen &&
      !this._mediaDrawerFilterOpen
    ) {
      return false;
    }
    const calendarSelector =
      ".card-view-calendar-panel, [data-card-view-calendar], .card-view-media-drawer-popover, [data-card-view-media-drawer-calendar], [data-card-view-media-drawer-filter]";
    const path = event?.composedPath?.() || [];
    const candidates = path.length ? path : [event?.target];
    const withinCalendar = candidates.some((candidate) =>
      candidate?.matches?.(calendarSelector) ||
      candidate?.closest?.(calendarSelector),
    );
    if (withinCalendar) return false;
    this._calendarOpen = false;
    this._mediaDrawerCalendarOpen = false;
    this._mediaDrawerFilterOpen = false;
    this.renderToolbar();
    this.renderCalendar();
    this.renderMediaDrawerCalendar();
    this.renderMediaDrawerFilter();
    this.renderMediaDrawer();
    return true;
  }

  renderCalendar() {
    const panel = this._host._pageShellRegion?.("calendarPanel");
    if (!panel) return;
    panel.hidden = !this._calendarOpen;
    if (!this._calendarOpen) return;
    panel.innerHTML = this._calendarPanelMarkup();
  }

  _formatDateString(parts) {
    return `${parts.year}-${String(parts.month).padStart(2, "0")}-${String(parts.day).padStart(2, "0")}`;
  }

  _selectedDayBounds() {
    const now = Math.floor(Date.now() / 1000);
    return resolveRecordingsDayBounds({
      tsSec: this._selectedDayTs || now,
      fallbackSec: now,
      getTzParts: (value) => this._host._tzParts(value),
      toEpochSeconds: (...parts) =>
        this._host._tzDateTimeToEpochSeconds(...parts),
    });
  }

  pickCalendarDay(dateString) {
    const [year, month, day] = String(dateString || "").split("-").map(Number);
    if (!year || !month || !day) return;
    this._selectedDayTs = this._host._tzDateTimeToEpochSeconds(
      year,
      month,
      day,
      12,
      0,
      0,
    );
    const mediaDrawerType = this._mediaDrawerController.isOpen()
      ? this._mediaDrawerController.selectedType()
      : "";
    this._calendarOpen = false;
    this._mediaDrawerCalendarOpen = false;
    this.renderToolbar();
    this.renderCalendar();
    this.renderMediaDrawerCalendar();
    this.renderMediaDrawer();
    if (
      mediaDrawerType === CARD_VIEW_MEDIA_DRAWER_TYPES.recordings ||
      (!mediaDrawerType && this._mode === "recordings")
    ) {
      void this.loadRecordings();
      return;
    }
    const bounds = this._selectedDayBounds();
    this._host._followNowWindow = false;
    this._host._winStart = bounds.start;
    this._host._winEnd = Math.min(
      bounds.end,
      Math.floor(Date.now() / 1000),
    );
    this._syncAlertsFromCache();
    this.renderActivity();
    void this.loadAlerts();
  }

  resetCalendarDay() {
    const mediaDrawerType = this._mediaDrawerController.isOpen()
      ? this._mediaDrawerController.selectedType()
      : "";
    this._selectedDayTs = null;
    this._calendarMonth = null;
    this._calendarOpen = false;
    this._mediaDrawerCalendarOpen = false;
    this.renderToolbar();
    this.renderCalendar();
    this.renderMediaDrawerCalendar();
    this.renderMediaDrawer();
    if (
      mediaDrawerType === CARD_VIEW_MEDIA_DRAWER_TYPES.recordings ||
      (!mediaDrawerType && this._mode === "recordings")
    ) {
      void this.loadRecordings();
      return;
    }
    this._host._followNowWindow = true;
    void this.loadAlerts({ force: true });
  }

  scroll(direction) {
    const scroller = this._host.shadowRoot?.querySelector(
      "[data-card-view-scroller]",
    );
    if (!scroller) return;
    const target = resolveCardViewPageScrollTarget({
      scrollLeft: scroller.scrollLeft,
      clientWidth: scroller.clientWidth,
      scrollWidth: scroller.scrollWidth,
      direction,
    });
    if (typeof scroller.scrollTo !== "function") {
      scroller.scrollLeft = target;
      this.syncScrollControls();
      return target;
    }
    scroller.scrollTo({
      left: target,
      behavior: "smooth",
    });
    return target;
  }

  syncScrollControls() {
    const scroller = this._host.shadowRoot?.querySelector(
      "[data-card-view-scroller]",
    );
    const left = this._host.shadowRoot?.querySelector(
      '[data-card-view-scroll="-1"]',
    );
    const right = this._host.shadowRoot?.querySelector(
      '[data-card-view-scroll="1"]',
    );
    if (!left || !right) return;
    if (!scroller) {
      left.hidden = true;
      right.hidden = true;
      return;
    }
    const max = Math.max(0, scroller.scrollWidth - scroller.clientWidth);
    left.hidden = max <= 1 || scroller.scrollLeft <= 1;
    right.hidden = max <= 1 || scroller.scrollLeft >= max - 1;
  }

  handleClick(event, target) {
    if (!this.isActive()) return false;
    if (target.closest?.("[data-card-view-native-fullscreen-exit]")) {
      event?.preventDefault?.();
      this._host._exitFullscreen?.();
      return true;
    }
    if (this._mediaDrawerController.handleClick(event, target)) return true;
    if (this._mediaDrawerController.closeForVideoAreaClick(target)) return true;
    if (this._handleMediaDrawerFilterOption(target)) return true;
    if (target.closest?.("[data-card-view-video-back]")) {
      event?.preventDefault?.();
      const viewMode = normalizeCardViewViewMode(
        this._host._config?.card_view_view_mode,
      );
      if (!this.isStandalone() && viewMode === CARD_VIEW_VIEW_MODES.videoOnly) {
        const navigation = this._host._pageNavigationController;
        const previewPageId = this._constants.PAGE_IDS.preview;
        const previewAvailable =
          this._host._config?.preview_page_enabled === true &&
          navigation?.isPageRouteAvailable?.(previewPageId) !== false;
        const targetPageId =
          navigation?.resolveBackPageTarget?.() ||
          (previewAvailable
            ? previewPageId
            : this._constants.PAGE_IDS.singleView);
        navigation?.navigateToPageRoute?.(
          targetPageId,
          { source: "card-view-video-back" },
        );
      }
      return true;
    }
    const standaloneGrid = target.closest?.(
      "[data-card-view-standalone-grid]",
    );
    if (standaloneGrid) {
      event?.preventDefault?.();
      if (!standaloneGrid.disabled) {
        this._host._toggleGridMode?.();
      }
      return true;
    }
    const standaloneSlideshow = target.closest?.(
      "[data-card-view-standalone-slideshow]",
    );
    if (standaloneSlideshow) {
      event?.preventDefault?.();
      if (!standaloneSlideshow.disabled) {
        this._host._toggleSlideshowRotation?.();
      }
      return true;
    }
    if (target.closest?.("[data-card-view-drawer-toggle]")) {
      if (this._suppressDrawerClick) {
        this._suppressDrawerClick = false;
        if (this._drawerClickResetTimer) {
          clearTimeout(this._drawerClickResetTimer);
          this._drawerClickResetTimer = null;
        }
        return true;
      }
      this.toggleDrawer();
      return true;
    }
    const scroll = target.closest?.("[data-card-view-scroll]");
    if (scroll) {
      this.scroll(Number(scroll.dataset.cardViewScroll));
      return true;
    }
    if (target.closest?.("[data-card-view-swap]")) {
      this.toggleMode();
      return true;
    }
    if (target.closest?.("[data-card-view-alert-scope]")) {
      this.toggleAlertScope();
      return true;
    }
    if (target.closest?.("[data-card-view-takeover]")) {
      this.toggleAlertTakeover();
      return true;
    }
    if (target.closest?.("[data-card-view-ptz]")) {
      this.togglePtz();
      return true;
    }
    if (target.closest?.("[data-card-view-calendar]")) {
      this.toggleCalendar();
      return true;
    }
    const day = target.closest?.("[data-cal-day]");
    if (day) {
      this.pickCalendarDay(day.dataset.calDay);
      return true;
    }
    const monthNav = target.closest?.("[data-cal-nav]");
    if (monthNav) {
      if (!(this._calendarMonth instanceof Date)) this.renderCalendar();
      this._calendarMonth?.setUTCMonth(
        this._calendarMonth.getUTCMonth() + Number(monthNav.dataset.calNav),
      );
      this.renderCalendar();
      this.renderMediaDrawerCalendar();
      return true;
    }
    if (target.closest?.("[data-cal-reset]")) {
      this.resetCalendarDay();
      return true;
    }
    const mediaNavigation = target.closest?.("[data-popup-media-target]");
    if (mediaNavigation) {
      event?.stopPropagation?.();
      this._host._popupMediaLoaderController?.showCarouselEventById(
        mediaNavigation.dataset.popupEventId,
        mediaNavigation.dataset.popupMediaTarget,
      );
      return true;
    }
    const reviewOpen = target.closest?.("[data-review-open]");
    if (reviewOpen) {
      const reviewId = reviewOpen.closest?.("[data-review-id]")?.dataset.reviewId;
      const review = this._alerts.find(
        (item) => String(item?.id || "") === String(reviewId || ""),
      );
      void this._openReview(review, reviewOpen.dataset.reviewOpen);
      return true;
    }
    const recording = target.closest?.("[data-rs]");
    if (recording && !target.closest?.("[data-rec-dl-start]")) {
      void this._host._popupMediaLoaderController?.showRecording(
        Number(recording.dataset.rs),
        Number(recording.dataset.re),
      );
      return true;
    }
    return false;
  }

  syncCardViewPageMarkup() {
    applyCardViewPageMarkup({
      host: this._host,
      pageIds: this._constants.PAGE_IDS,
    });
    this._mediaDrawerController.syncState();
  }
}
