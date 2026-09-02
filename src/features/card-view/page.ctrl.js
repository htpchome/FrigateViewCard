import { cap, camDisplayName } from "../../helpers.js";
import { ICONS } from "../../icons.js";
import { DEFAULT_SUBTITLE, DEFAULT_TITLE } from "../../constants.js";
import { parseRealtimeAlertMessage } from "../../data/realtime-alert.js";
import { CleanupController } from "../../shared/cleanup.js";
import { resolveCameraAwareText } from "../../shared/page-text.js";
import { canCameraUsePtz } from "../ptz/index.js";
import { resolveRecordingsDayBounds } from "../recordings/utils/day.js";
import { activateStandardPageRouteLifecycle } from "../navigation/route-lifecycle.js";
import { buildCameraPickerMarkup } from "../navigation/camera-picker.tmpl.js";
import {
  cameraMemberEntities,
  flattenCameraMembers,
} from "../camera-groups/model.js";
import {
  applyCardViewPageMarkup,
  buildCardViewPtzMarkup,
  buildCardViewToolbarMarkup,
} from "./page.tmpl.js";

const cameraName = (camera) => cap(camDisplayName(camera));

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
    this._selectedDayTs = null;
    this._calendarMonth = null;
    this._calendarOpen = false;
    this._columns = 1;
    this._alertLoadToken = 0;
    this._recordingLoadToken = 0;
    this._alertRefreshTimer = null;
    this._calendarOpen = false;
    this._lastTakeoverAt = 0;
    this._haSeverityByEntity = new Map();
    this._cleanup = new CleanupController();
    this._activityContent = null;
    this._activityMarkup = "";
    this._boundScroller = null;
    this._recordingContextKey = "";
    this._drawerOpen = true;
    this._drawerInitialized = false;
    this._drawerPointerGesture = null;
    this._suppressDrawerClick = false;
    this._drawerClickResetTimer = null;
  }

  isActive() {
    return this._host._pageId === this._constants.PAGE_IDS.cardView;
  }

  activateCardViewPageRoute(context = {}) {
    activateStandardPageRouteLifecycle({
      host: this._host,
      context,
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
    this._ensureDrawerState();
    this.syncDrawerState();
    this._yieldAlertTakeoverToActiveMode();
    this._syncAlertsFromCache();
    this.renderToolbar();
    this.renderActivity();
    void this._discoverPtzSupport();
    await this.refreshActiveContent({ force: true });
  }

  deactivate() {
    this._alertLoadToken += 1;
    this._recordingLoadToken += 1;
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
    this._haSeverityByEntity.clear();
    this._activityContent = null;
    this._activityMarkup = "";
    this._boundScroller = null;
  }

  bind() {
    this._cleanup.dispose();
    this._cleanup = new CleanupController();
    this._boundScroller = null;
    const content = this._host._pageShellRegion?.("cardViewActivity");
    if (!content) return;

    const syncLayout = () => {
      const width = content.getBoundingClientRect?.().width || content.clientWidth;
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
          this.syncScrollControls();
          return;
        }
        this.renderActivity();
        return;
      }
      this.syncScrollControls();
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
    this._drawerOpen = this._host._config?.card_view_drawer_default_open !== false;
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
    this._drawerOpen = open === true;
    this.syncDrawerState();
    return this._drawerOpen;
  }

  toggleDrawer() {
    this._ensureDrawerState();
    return this.setDrawerOpen(!this._drawerOpen);
  }

  syncDrawerState() {
    if (!this.isActive()) return;
    this._ensureDrawerState();
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
      this.syncScrollControls();
      return;
    }
    if (scroller === this._boundScroller) {
      requestAnimationFrame(() => this.syncScrollControls());
      return;
    }
    this._boundScroller = scroller;
    this._cleanup.addEventListener(scroller, "scroll", () => {
      requestAnimationFrame(() => this.syncScrollControls());
    });
    requestAnimationFrame(() => this.syncScrollControls());
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
    });
  }

  renderCamSwitcher() {
    const content = this._host._pageShellRegionElement?.(
      "cameraSwitcher",
      "[data-mobile-cam-switcher-content]",
    );
    if (content) content.innerHTML = this.camSwitcherMarkup();
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
  }

  renderStats() {
    const stream = this._host._pageShellRegionElement?.(
      "cameraSwitcher",
      "#stream-type",
    );
    if (stream) stream.textContent = this._host._activeStreamType || "--";
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

  renderToolbar(buttonStates = null) {
    if (!this.isActive()) return;
    const toolbar = this._host.shadowRoot?.querySelector(
      "[data-card-view-toolbar]",
    );
    if (!toolbar) return;
    const showMicrophone =
      this._host._shouldRenderTwoWayTalkButtonForActiveCamera?.() === true;
    const resolvedButtonStates =
      buttonStates || this._host._toolbarButtonStates?.() || {};
    toolbar.innerHTML = buildCardViewToolbarMarkup({
      icons: ICONS,
      mode: this._mode,
      showAllAlerts: this._showAllAlerts,
      activeCameraName: cameraName(this._host._activeCam),
      alertTakeoverEnabled: this.alertTakeoverEnabled(),
      alertTakeoverDisabled:
        resolvedButtonStates.wideAlertTakeoverDisabled === true,
      showPtz: this._canUseActiveCameraPtz(),
      ptzDisabled: resolvedButtonStates.controlsDisabled === true,
      gridAvailable: this._host._isGridModeAvailable?.() === true,
      gridActive: this._host._viewMode === "grid",
      gridDisabled: resolvedButtonStates.gridDisabled === true,
      slideshowAvailable:
        this._host._isSlideshowRotationAvailable?.() === true,
      slideshowActive: this._host._slideshowActive === true,
      slideshowDisabled: resolvedButtonStates.slideshowDisabled === true,
      showMicrophone,
      microphoneMarkup: showMicrophone
        ? this._host._buildTwoWayTalkControlRowMarkup?.() || ""
        : "",
      linkedLightLeftMarkup:
        this._host._buildLinkedLightControlMarkup?.({
          buttonClass: "icon-btn",
          position: "left",
        }) || "",
      linkedLightRightMarkup:
        this._host._buildLinkedLightControlMarkup?.({
          buttonClass: "icon-btn",
          position: "right",
        }) || "",
    });
    this._host._syncTwoWayTalkSoundwaveSurface?.();
    this._host._linkedLightController?.sync?.();
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
    const content = this._host._pageShellRegion?.("cardViewActivity");
    if (!content) return;
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

    const items = this._mode === "recordings" ? this._recordings : this._alerts;
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

  async loadAlerts({ force = false } = {}) {
    if (!this.isActive()) return;
    const token = ++this._alertLoadToken;
    this._alertsLoading = true;
    if (this._mode === "alerts" && !this._alerts.length) this.renderActivity();
    if (force && !this._selectedDayTs) {
      const now = Math.floor(Date.now() / 1000);
      this._host._winEnd = now;
      this._host._winStart = now -
        (this._host._config?.window_days || 3) * 86400;
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
      this.renderActivity();
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
      this.renderActivity();
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
      this.renderActivity();
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
        this._mode === "recordings"
      ) {
        progressivePainted = true;
        this.renderActivity();
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
    if (this._mode === "recordings") this.renderActivity();
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
    return this._alertTakeoverEnabled == null
      ? this._host._config?.card_view_alert_takeover === true
      : this._alertTakeoverEnabled === true;
  }

  isPtzActive() {
    return this._mode === "ptz";
  }

  _yieldAlertTakeoverToActiveMode() {
    if (!this.alertTakeoverEnabled()) return false;
    if (!this._host._toolbarButtonStates?.().wideAlertTakeoverDisabled) {
      return false;
    }
    this._alertTakeoverEnabled = false;
    return true;
  }

  toggleAlertTakeover() {
    if (
      !this.alertTakeoverEnabled() &&
      this._host._toolbarButtonStates?.().wideAlertTakeoverDisabled
    ) {
      this._host._syncToolbarButtons?.();
      return false;
    }
    this._alertTakeoverEnabled = !this.alertTakeoverEnabled();
    this._host._syncToolbarButtons?.();
    return this._alertTakeoverEnabled;
  }

  applyConfigUpdate({
    takeoverDefaultChanged = false,
    drawerDefaultChanged = false,
  } = {}) {
    if (takeoverDefaultChanged) {
      this._alertTakeoverEnabled = null;
      this._yieldAlertTakeoverToActiveMode();
    }
    if (drawerDefaultChanged) {
      this._drawerInitialized = true;
      this._drawerOpen =
        this._host._config?.card_view_drawer_default_open !== false;
      this.syncDrawerState();
    }
    if (this.isActive()) {
      if (drawerDefaultChanged && !takeoverDefaultChanged) return;
      this.renderToolbar();
      void this.refreshActiveContent({ force: true });
    }
  }

  async refreshActiveContent({ force = false } = {}) {
    const activeMode = this._mode === "ptz" ? this._returnMode : this._mode;
    if (activeMode === "recordings") {
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
    void this._discoverPtzSupport();
    if (this._mode === "recordings") await this.loadRecordings();
    else if (this._mode === "alerts") this.renderActivity();
  }

  handleRealtimeMessage(message) {
    if (!this.isActive()) return;
    const parsed = parseRealtimeAlertMessage({
      host: this._host,
      msg: message,
      checkSeverity: false,
    });
    if (!parsed) {
      if (this._host._isRealtimeEventMessage?.(message)) {
        this._scheduleAlertRefresh();
      }
      return;
    }
    const { cam: entity, type } = parsed;
    const severity = String(parsed.severity || "").trim().toLowerCase();
    this._scheduleAlertRefresh();
    if (type === "end" || !severity) return;
    if (!this._host._shouldHandleSlideshowReview?.(entity, severity)) return;
    this._takeOverCamera(entity);
  }

  handleHaReviewStatus(entity, severity) {
    if (!this.isActive()) return false;
    if (!this._host._shouldHandleSlideshowReview?.(entity, severity)) {
      return false;
    }
    const previous = this._haSeverityByEntity.get(entity);
    const now = Date.now();
    this._haSeverityByEntity.set(entity, { severity, at: now });
    if (!previous || previous.severity !== severity || now - previous.at > 60000) {
      this._scheduleAlertRefresh();
      this._takeOverCamera(entity);
    }
    return true;
  }

  _takeOverCamera(entity) {
    if (!this.alertTakeoverEnabled()) return;
    const index = this._host._cameraIndexByEntity?.(entity) ?? -1;
    if (index < 0 || index === this._host._activeCamIdx) return;
    const now = Date.now();
    if (now - this._lastTakeoverAt < 1200) return;
    this._lastTakeoverAt = now;
    void this._host._switchCamera(index, { source: "alert" });
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
    const cameraName = String(review?.camera || "").trim();
    const camera = flattenCameraMembers(
      this._host._config?.cameras || [],
    ).find((candidate) => {
      const context = this._host._camCache?.[candidate.entity];
      return context?.cam === cameraName;
    });
    const context = camera ? this._host._camCache?.[camera.entity] : null;
    if (!context?.clientId || !context?.cam) return null;
    const start = Math.max(0, Math.floor(Number(review?.start_time || 0)) - 30);
    const end = Math.ceil(Number(review?.end_time || review?.start_time || 0)) + 30;
    if (!start || end <= start) return null;
    try {
      const events = await this._host._ws({
        type: "frigate/events/get",
        instance_id: context.clientId,
        cameras: [context.cam],
        after: start,
        before: end,
        limit: 100,
      });
      const fetched = Array.isArray(events) ? events : [];
      const known = new Map(
        (context.events || []).map((event) => [String(event?.id || ""), event]),
      );
      fetched.forEach((event) => known.set(String(event?.id || ""), event));
      context.events = [...known.values()].sort(
        (a, b) => Number(b?.start_time || 0) - Number(a?.start_time || 0),
      );
      return context.events.find(
        (event) => String(event?.id || "") === String(eventId || ""),
      ) || null;
    } catch (_) {
      return null;
    }
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
    if (!this._calendarOpen) return false;
    const calendarSelector =
      ".card-view-calendar-panel, [data-card-view-calendar]";
    const path = event?.composedPath?.() || [];
    const candidates = path.length ? path : [event?.target];
    const withinCalendar = candidates.some((candidate) =>
      candidate?.matches?.(calendarSelector) ||
      candidate?.closest?.(calendarSelector),
    );
    if (withinCalendar) return false;
    this._calendarOpen = false;
    this.renderToolbar();
    this.renderCalendar();
    return true;
  }

  renderCalendar() {
    const panel = this._host._pageShellRegion?.("calendarPanel");
    if (!panel) return;
    panel.hidden = !this._calendarOpen;
    if (!this._calendarOpen) return;
    const now = Math.floor(Date.now() / 1000);
    const parts = this._host._tzParts(this._selectedDayTs || now);
    if (!(this._calendarMonth instanceof Date)) {
      this._calendarMonth = new Date(
        Date.UTC(parts.year, parts.month - 1, 15, 12, 0, 0),
      );
    }
    const timeZone = this._host._tz();
    const todayDateString = this._formatDateString(this._host._tzParts(now));
    panel.innerHTML = this._constants.buildCalendarPanelMarkup?.({
      monthDate: this._calendarMonth,
      activeDayDateString: this._selectedDayTs
        ? this._formatDateString(parts)
        : "",
      todayDateString,
      daysWithActivity: this._host._daysWithActivity || new Set(),
      timeZone,
      monthLabel:
        this._host._calendarMonthLabel?.(this._calendarMonth, timeZone) || "",
      showReset: !!this._selectedDayTs,
    }) || "";
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
    this._calendarOpen = false;
    this.renderToolbar();
    this.renderCalendar();
    if (this._mode === "recordings") {
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
    this._selectedDayTs = null;
    this._calendarMonth = null;
    this._calendarOpen = false;
    this.renderToolbar();
    this.renderCalendar();
    if (this._mode === "recordings") {
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
  }
}
