import {
  buildWideTimelineEntries,
  buildWideTimelineLayout,
  buildWideTimelineTicks,
  normalizeWideTimelineScale,
  resolveWideTimelineResponsiveLayout,
  stepWideTimelineScale,
  timelineRefreshMsForScale,
  wideTimelineStackVisualDepth,
  WIDE_TIMELINE_DEFAULT_SCALE,
  WIDE_TIMELINE_DEFAULT_PANEL_WIDTH,
  WIDE_TIMELINE_MIN_BROWSE_WIDTH,
  WIDE_TIMELINE_MIN_PANEL_WIDTH,
  WIDE_TIMELINE_SCALES,
} from "./timeline.model.js";
import {
  buildWideTimelineCardMarkup,
  buildWideTimelineContentMarkup,
  buildWideTimelineEmptyMarkup,
  buildWideTimelinePanelMarkup,
} from "./timeline.tmpl.js";

const nextFrame = (callback) => {
  if (typeof requestAnimationFrame === "function") {
    return requestAnimationFrame(callback);
  }
  callback();
  return 0;
};

const cancelFrame = (handle) => {
  if (handle && typeof cancelAnimationFrame === "function") {
    cancelAnimationFrame(handle);
  }
};

const WIDE_TIMELINE_SCROLLBAR_POINTER_GUTTER = 18;

export const isWideTimelineScrollbarPointer = (event, viewport) => {
  const clientX = Number(event?.clientX);
  const bounds = viewport?.getBoundingClientRect?.();
  const left = Number(bounds?.left);
  const width = Number(bounds?.width);
  if (!Number.isFinite(clientX) || !Number.isFinite(left) || !(width > 0)) {
    return false;
  }
  const clientWidth = Math.max(0, Number(viewport?.clientWidth) || 0);
  const measuredGutter = Math.max(0, width - clientWidth);
  const gutter = Math.max(
    WIDE_TIMELINE_SCROLLBAR_POINTER_GUTTER,
    measuredGutter,
  );
  const view = viewport?.ownerDocument?.defaultView;
  const direction = view?.getComputedStyle?.(viewport)?.direction;
  return direction === "rtl"
    ? clientX <= left + gutter
    : clientX >= left + width - gutter;
};

export const resolveWideTimelineCameraContextKey = ({
  gridMixed = false,
  cameraEntity = "",
  cameraMembers = [],
} = {}) => {
  if (gridMixed) return "wide-grid-mixed";
  const members = [
    ...new Set(
      (Array.isArray(cameraMembers) ? cameraMembers : [])
        .map((entity) => String(entity || "").trim())
        .filter(Boolean),
    ),
  ];
  if (members.length > 1) return `wide-group-mixed:${members.join("|")}`;
  return String(cameraEntity || members[0] || "").trim();
};

export class WideViewTimelineController {
  constructor(host, deps = {}) {
    this._host = host;
    this._deps = {
      icons: {},
      getAllEvents: () => [],
      getVisibleEvents: () => [],
      getVisibleReviews: () => [],
      getWindowStart: () => 0,
      getWindowEnd: () => Date.now() / 1000,
      getCameraKey: () => "",
      getSelectedDay: () => "",
      isLoading: () => false,
      now: () => Date.now() / 1000,
      setTimer: (callback, delay) => setTimeout(callback, delay),
      clearTimer: (handle) => clearTimeout(handle),
      mediaUrl: () => "",
      durationForEvent: null,
      capitalize: (value) => String(value || ""),
      formatTime: (timestamp) => String(timestamp),
      formatDay: (timestamp) => String(timestamp),
      dayKey: (timestamp) => String(Math.floor(timestamp / 86400)),
      timezoneParts: null,
      timezoneDateTimeToEpoch: null,
      onOpenEntry: () => {},
      ...deps,
    };
    this._open = null;
    this._scaleHours = WIDE_TIMELINE_DEFAULT_SCALE;
    this._stackIndexes = new Map();
    this._entriesById = new Map();
    this._lastRenderSignature = "";
    this._lastContextKey = "";
    this._lastLayout = null;
    this._clockOffsetSeconds = 0;
    this._lastViewportHeight = 0;
    this._lastViewportWidth = 0;
    this._savedScrollTop = 0;
    this._resizeObserver = null;
    this._renderRaf = 0;
    this._scrollRaf = 0;
    this._clockTimer = null;
    this._pendingRenderOptions = null;
    this._boundViewport = null;
    this._boundWidthToggle = null;
    this._panelWidth = WIDE_TIMELINE_DEFAULT_PANEL_WIDTH;
    this._responsiveLayout = null;
    this._widthDrag = null;
    this._suppressToggleClickUntil = 0;
    this._drag = null;
    this._stackWheel = {
      id: "",
      delta: 0,
      lastInputAt: Number.NEGATIVE_INFINITY,
      lastCycleAt: Number.NEGATIVE_INFINITY,
    };
    this._suppressClickUntil = 0;
    this._onScroll = () => this._scheduleDayLabelSync();
    this._onWheel = (event) => this._handleWheel(event);
    this._onPointerDown = (event) => this._handlePointerDown(event);
    this._onPointerMove = (event) => this._handlePointerMove(event);
    this._onPointerUp = (event) => this._handlePointerUp(event);
    this._onWidthPointerDown = (event) =>
      this._handleWidthPointerDown(event);
    this._onWidthPointerMove = (event) =>
      this._handleWidthPointerMove(event);
    this._onWidthPointerUp = (event) => this._handleWidthPointerUp(event);
    this._onWidthKeyDown = (event) => this._handleWidthKeyDown(event);
  }

  enabled() {
    return this._host._config?.wide_view_timeline_enabled === true;
  }

  defaultOpen() {
    return this._host._config?.wide_view_timeline_default_open === true;
  }

  defaultScale() {
    return normalizeWideTimelineScale(
      this._host._config?.wide_view_timeline_default_scale,
    );
  }

  isOpen() {
    this._ensureOpenState();
    return this.enabled() && this._open === true;
  }

  _ensureOpenState() {
    if (this._open == null) {
      this._open = this.defaultOpen();
      this._scaleHours = this.defaultScale();
    }
    if (!this.enabled()) this._open = false;
  }

  buildRegionMarkup() {
    if (!this.enabled()) return "";
    this._ensureOpenState();
    return buildWideTimelinePanelMarkup({
      icons: this._deps.icons,
      open: this._open === true,
      scaleHours: this._scaleHours,
    });
  }

  bind() {
    if (!this.enabled()) return;
    this._ensureOpenState();
    const viewport = this._host._$("#wide-timeline-viewport");
    if (!viewport) return;
    if (this._boundViewport === viewport) {
      this._syncPanelState();
      this._updateResponsiveMode();
      if (this.isOpen()) this._scheduleRender();
      this._syncClockRefresh();
      return;
    }
    this.teardown({ preserveScroll: true });
    this._boundViewport = viewport;
    viewport.addEventListener("scroll", this._onScroll, { passive: true });
    viewport.addEventListener("wheel", this._onWheel, { passive: false });
    viewport.addEventListener("pointerdown", this._onPointerDown);
    viewport.addEventListener("pointermove", this._onPointerMove);
    viewport.addEventListener("pointerup", this._onPointerUp);
    viewport.addEventListener("pointercancel", this._onPointerUp);
    const widthToggle = this._host._$("#wide-timeline-toggle");
    if (widthToggle) {
      this._boundWidthToggle = widthToggle;
      this._bindWidthSurface(widthToggle);
      widthToggle.addEventListener("keydown", this._onWidthKeyDown);
    }

    const colRight = this._host._$("#col-right");
    if (colRight && typeof ResizeObserver !== "undefined") {
      this._resizeObserver = new ResizeObserver(() => {
        this._updateResponsiveMode();
        const nextHeight = viewport.clientHeight || 0;
        const nextWidth = viewport.clientWidth || 0;
        if (
          this.isOpen() &&
          ((nextHeight > 0 &&
            Math.abs(nextHeight - this._lastViewportHeight) > 1) ||
            (nextWidth > 0 &&
              Math.abs(nextWidth - this._lastViewportWidth) > 1))
        ) {
          this._scheduleRender();
        }
      });
      this._resizeObserver.observe(colRight);
    }
    this._syncPanelState();
    this._updateResponsiveMode();
    if (this.isOpen()) {
      this._scheduleRender({ force: true, resetToNow: true });
    }
    this._syncClockRefresh();
  }

  teardown({ preserveScroll = true } = {}) {
    if (preserveScroll && this._boundViewport) {
      this._savedScrollTop = this._boundViewport.scrollTop || 0;
    }
    if (this._boundViewport) {
      this._boundViewport.removeEventListener("scroll", this._onScroll);
      this._boundViewport.removeEventListener("wheel", this._onWheel);
      this._boundViewport.removeEventListener(
        "pointerdown",
        this._onPointerDown,
      );
      this._boundViewport.removeEventListener(
        "pointermove",
        this._onPointerMove,
      );
      this._boundViewport.removeEventListener("pointerup", this._onPointerUp);
      this._boundViewport.removeEventListener(
        "pointercancel",
        this._onPointerUp,
      );
    }
    this._boundViewport = null;
    this._host._$?.("#col-right")?.classList.remove(
      "wide-timeline-width-resizing",
    );
    if (this._boundWidthToggle) {
      this._unbindWidthSurface(this._boundWidthToggle);
      this._boundWidthToggle.removeEventListener(
        "keydown",
        this._onWidthKeyDown,
      );
    }
    this._boundWidthToggle = null;
    this._widthDrag = null;
    this._drag = null;
    this._stackWheel.id = "";
    this._stackWheel.delta = 0;
    this._resizeObserver?.disconnect?.();
    this._resizeObserver = null;
    cancelFrame(this._renderRaf);
    cancelFrame(this._scrollRaf);
    this._clearClockRefresh();
    this._renderRaf = 0;
    this._scrollRaf = 0;
    this._pendingRenderOptions = null;
  }

  applyConfigUpdate({
    enabledChanged = false,
    defaultOpenChanged = false,
    defaultScaleChanged = false,
  } = {}) {
    if (enabledChanged) {
      this.teardown({ preserveScroll: false });
      this._open = this.enabled() ? this.defaultOpen() : false;
      this._scaleHours = this.defaultScale();
      this._savedScrollTop = 0;
      this._lastRenderSignature = "";
      return;
    }
    if (defaultScaleChanged) {
      this._scaleHours = this.defaultScale();
      this._syncScaleControls();
    }
    if (defaultOpenChanged) {
      this._open = this.defaultOpen();
      this._syncPanelState();
    }
    if (!defaultOpenChanged && !defaultScaleChanged) return;
    if (this._open) this._scheduleRender({ force: true, resetToNow: true });
    this._syncClockRefresh();
  }

  handleClick(event, target) {
    if (!this.enabled()) return false;
    const toggle = target?.closest?.("[data-wide-timeline-toggle]");
    if (toggle) {
      event?.preventDefault?.();
      event?.stopPropagation?.();
      if (Date.now() < this._suppressToggleClickUntil) return true;
      this.toggle();
      return true;
    }
    const scaleButton = target?.closest?.("[data-wide-timeline-scale]");
    if (scaleButton) {
      event?.preventDefault?.();
      event?.stopPropagation?.();
      this.changeScale(scaleButton.dataset.wideTimelineScale);
      return true;
    }
    const stackButton = target?.closest?.("[data-wide-timeline-stack-next]");
    if (stackButton) {
      event?.preventDefault?.();
      event?.stopPropagation?.();
      this.cycleStack(stackButton.dataset.wideTimelineStackNext);
      return true;
    }
    const entryButton = target?.closest?.("[data-wide-timeline-entry]");
    if (entryButton) {
      event?.preventDefault?.();
      event?.stopPropagation?.();
      if (Date.now() < this._suppressClickUntil) return true;
      const entry = this._entriesById.get(
        String(entryButton.dataset.wideTimelineEntry || ""),
      );
      if (entry) this._deps.onOpenEntry(entry);
      return true;
    }
    return false;
  }

  toggle() {
    this._ensureOpenState();
    this._open = !this._open;
    this._syncPanelState();
    this._updateResponsiveMode();
    if (this._open) {
      this._scheduleRender({ force: true, resetToNow: true });
    }
    this._syncClockRefresh();
  }

  changeScale(action) {
    const nextScale = stepWideTimelineScale(this._scaleHours, action);
    if (nextScale === this._scaleHours) return;
    const viewport = this._boundViewport;
    this._scaleHours = nextScale;
    this._syncScaleControls();
    this.render({ force: true, resetToNow: true });
    viewport?.focus?.({ preventScroll: true });
  }

  cycleStack(stackId, direction = 1) {
    const id = String(stackId || "");
    if (!id || !this._lastLayout) return;
    const group = this._lastLayout.groups.find(
      (candidate) => candidate.id === id,
    );
    if (!group || group.entries.length < 2) return;
    const current = Number(this._stackIndexes.get(id)) || 0;
    const step = Number(direction) < 0 ? -1 : 1;
    const activeIndex =
      (current + step + group.entries.length) % group.entries.length;
    this._stackIndexes.set(id, activeIndex);
    group.activeIndex = activeIndex;
    if (!this._updateStackMarkup(group, step)) {
      this.render({
        force: true,
        slidingStackId: id,
        slideDirection: step,
      });
    }
  }

  _updateStackMarkup(group, direction) {
    const canvas = this._host._$?.(".wide-timeline-canvas");
    if (!canvas?.querySelectorAll) return false;
    const stack = Array.from(
      canvas.querySelectorAll("[data-wide-timeline-stack]"),
    ).find(
      (candidate) =>
        String(candidate.dataset?.wideTimelineStack || "") === group.id,
    );
    if (!stack || !("outerHTML" in stack)) return false;

    stack.outerHTML = buildWideTimelineCardMarkup({
      group,
      formatTime: this._deps.formatTime,
      icons: this._deps.icons,
      sliding: true,
      slideDirection: direction,
    });
    for (const line of canvas.querySelectorAll(
      "[data-wide-timeline-link-stack]",
    )) {
      if (
        String(line.dataset?.wideTimelineLinkStack || "") !== group.id
      ) {
        continue;
      }
      const entryIndex = Number(line.dataset?.wideTimelineLinkIndex);
      if (!Number.isInteger(entryIndex)) continue;
      const depth = wideTimelineStackVisualDepth(group, entryIndex);
      line.setAttribute(
        "x2",
        String(Math.round((38 + depth * 1.8) * 100) / 100),
      );
      line.setAttribute(
        "y2",
        String(
          Math.round((group.cardCenterY + depth * 8) * 100) / 100,
        ),
      );
    }
    return true;
  }

  render({
    force = false,
    focusTimestamp = null,
    slidingStackId = "",
    slideDirection = 1,
    resetToNow = false,
  } = {}) {
    if (!this.enabled() || !this.isOpen()) return;
    const viewport = this._boundViewport || this._host._$("#wide-timeline-viewport");
    const content = this._host._$("#wide-timeline-content");
    if (!viewport || !content) return;
    this._boundViewport = viewport;
    const viewportWidth = Math.max(
      1,
      viewport.clientWidth || viewport.getBoundingClientRect?.().width || 320,
    );
    const viewportHeight = Math.max(220, viewport.clientHeight || 0);
    const contextKey = this._contextKey();
    const contextChanged = contextKey !== this._lastContextKey;
    const previousScrollTop = contextChanged || resetToNow
      ? 0
      : viewport.scrollTop || this._savedScrollTop || 0;
    const allEvents = this._deps.getAllEvents() || [];
    const visibleEvents = this._deps.getVisibleEvents() || [];
    const visibleReviews = this._deps.getVisibleReviews() || [];
    const signature = this._renderSignature({
      allEvents,
      visibleEvents,
      visibleReviews,
      viewportWidth,
      viewportHeight,
      contextKey,
    });
    if (!force && signature === this._lastRenderSignature) {
      this._refreshClockPosition();
      this._syncDayLabel();
      this._syncClockRefresh();
      return;
    }

    const entries = buildWideTimelineEntries({
      allEvents,
      visibleEvents,
      visibleReviews,
      mediaUrl: this._deps.mediaUrl,
      durationForEvent: this._deps.durationForEvent,
      capitalize: this._deps.capitalize,
    });
    this._entriesById = new Map(entries.map((entry) => [entry.id, entry]));
    const layout = buildWideTimelineLayout({
      entries,
      anchorEnd: this._timelineAnchorEnd(),
      rangeStart: this._deps.getWindowStart(),
      viewportWidth,
      viewportHeight,
      scaleHours: this._scaleHours,
    });
    for (const group of layout.groups) {
      const selected = Number(this._stackIndexes.get(group.id)) || 0;
      group.activeIndex = Math.min(group.entries.length - 1, selected);
      this._stackIndexes.set(group.id, group.activeIndex);
    }
    const activeStackIds = new Set(layout.groups.map((group) => group.id));
    for (const stackId of this._stackIndexes.keys()) {
      if (!activeStackIds.has(stackId)) this._stackIndexes.delete(stackId);
    }
    const ticks = buildWideTimelineTicks({
      anchorEnd: layout.anchorEnd,
      rangeStart: layout.rangeStart,
      pixelsPerSecond: layout.pixelsPerSecond,
      scaleHours: layout.scaleHours,
      alignTimestamp: (timestamp, stepSeconds) =>
        this._alignTimestamp(timestamp, stepSeconds),
      formatTime: this._deps.formatTime,
      formatDay: this._deps.formatDay,
      dayKey: this._deps.dayKey,
      isMajorTick: (timestamp) => this._isMajorHourTick(timestamp),
    });
    content.innerHTML = entries.length
      ? buildWideTimelineContentMarkup({
          layout,
          ticks,
          formatTime: this._deps.formatTime,
          icons: this._deps.icons,
          slidingStackId,
          slideDirection,
        })
      : buildWideTimelineEmptyMarkup({ loading: this._deps.isLoading() });
    this._lastLayout = layout;
    this._clockOffsetSeconds = 0;
    this._lastViewportHeight = viewportHeight;
    this._lastViewportWidth = viewportWidth;
    this._lastRenderSignature = signature;
    this._lastContextKey = contextKey;
    this._syncScaleControls();

    if (resetToNow) {
      viewport.scrollTop = 0;
    } else if (Number.isFinite(focusTimestamp)) {
      viewport.scrollTop = Math.max(
        0,
        16 +
          (layout.anchorEnd - focusTimestamp) * layout.pixelsPerSecond -
          viewport.clientHeight / 2,
      );
    } else {
      viewport.scrollTop = previousScrollTop;
    }
    this._savedScrollTop = viewport.scrollTop || 0;
    this._syncDayLabel();
    this._syncClockRefresh();
  }

  _scheduleRender(options = {}) {
    this._pendingRenderOptions = {
      ...(this._pendingRenderOptions || {}),
      ...options,
      force:
        options.force === true || this._pendingRenderOptions?.force === true,
      resetToNow:
        options.resetToNow === true ||
        this._pendingRenderOptions?.resetToNow === true,
    };
    if (this._renderRaf) return;
    this._renderRaf = nextFrame(() => {
      this._renderRaf = 0;
      const pendingOptions = this._pendingRenderOptions || {};
      this._pendingRenderOptions = null;
      this.render(pendingOptions);
    });
  }

  _syncPanelState() {
    const colRight = this._host._$("#col-right");
    const panel = this._host._$("#wide-timeline-panel");
    const toggle = this._host._$("#wide-timeline-toggle");
    if (!colRight || !panel || !toggle) return;
    const open = this.isOpen();
    colRight.classList.toggle("wide-timeline-enabled", this.enabled());
    colRight.classList.toggle("wide-timeline-open", open);
    panel.setAttribute("aria-hidden", open ? "false" : "true");
    if ("inert" in panel) panel.inert = !open;
    toggle.setAttribute("aria-expanded", open ? "true" : "false");
    toggle.setAttribute("aria-label", open ? "Collapse Timeline" : "Open Timeline");
    toggle.title = open
      ? "Drag to resize or click to collapse Timeline"
      : "Open Timeline";
    toggle.innerHTML = open
      ? this._deps.icons.left || ""
      : this._deps.icons.right || "";
  }

  _updateResponsiveMode() {
    const colRight = this._host._$("#col-right");
    if (!colRight || !this.enabled()) return;
    const width =
      colRight.getBoundingClientRect?.().width || colRight.clientWidth || 0;
    const layout = resolveWideTimelineResponsiveLayout(
      width,
      this._panelWidth,
    );
    this._responsiveLayout = layout;
    colRight.style.setProperty(
      "--wide-timeline-panel-width",
      `${Math.max(0, Math.round(layout.panelWidth))}px`,
    );
    colRight.classList.toggle("wide-timeline-push", layout.mode === "push");
    colRight.classList.toggle(
      "wide-timeline-overlay",
      layout.mode === "overlay",
    );
  }

  _handleWidthPointerDown(event) {
    if (
      (event?.button != null && event.button !== 0) ||
      !this.isOpen() ||
      this._responsiveLayout?.mode !== "push"
    ) {
      return;
    }
    const handle = event?.currentTarget || this._boundWidthToggle;
    const colRight = this._host._$("#col-right");
    if (!handle || !colRight) return;
    this._widthDrag = {
      pointerId: event.pointerId,
      startX: Number(event.clientX) || 0,
      startWidth: this._responsiveLayout.panelWidth,
      captureTarget: handle,
      moved: false,
    };
    colRight.classList.add("wide-timeline-width-resizing");
    handle.setPointerCapture?.(event.pointerId);
    if (handle !== this._boundWidthToggle) event.preventDefault?.();
    event.stopPropagation?.();
  }

  _handleWidthPointerMove(event) {
    if (
      !this._widthDrag ||
      event.pointerId !== this._widthDrag.pointerId
    ) {
      return;
    }
    const delta = (Number(event.clientX) || 0) - this._widthDrag.startX;
    if (!this._widthDrag.moved && Math.abs(delta) <= 3) return;
    this._widthDrag.moved = true;
    this._panelWidth = this._widthDrag.startWidth + delta;
    this._updateResponsiveMode();
    event.preventDefault?.();
    event.stopPropagation?.();
  }

  _handleWidthPointerUp(event) {
    if (
      !this._widthDrag ||
      event.pointerId !== this._widthDrag.pointerId
    ) {
      return;
    }
    const handle = this._widthDrag.captureTarget || this._boundWidthToggle;
    const moved = this._widthDrag.moved;
    this._host._$("#col-right")?.classList.remove(
      "wide-timeline-width-resizing",
    );
    handle?.releasePointerCapture?.(event.pointerId);
    if (moved) {
      this._suppressToggleClickUntil = Date.now() + 240;
    }
    this._panelWidth = this._responsiveLayout?.panelWidth || this._panelWidth;
    this._widthDrag = null;
    this._scheduleRender({ force: true });
    if (moved) event.preventDefault?.();
    event.stopPropagation?.();
  }

  _handleWidthKeyDown(event) {
    if (!this.isOpen() || this._responsiveLayout?.mode !== "push") return;
    const direction =
      event.key === "ArrowRight" ? 1 : event.key === "ArrowLeft" ? -1 : 0;
    if (!direction) return;
    this._panelWidth =
      (this._responsiveLayout?.panelWidth || this._panelWidth) +
      direction * 24;
    this._updateResponsiveMode();
    this._scheduleRender({ force: true });
    event.preventDefault?.();
    event.stopPropagation?.();
  }

  _bindWidthSurface(surface) {
    surface.addEventListener("pointerdown", this._onWidthPointerDown);
    surface.addEventListener("pointermove", this._onWidthPointerMove);
    surface.addEventListener("pointerup", this._onWidthPointerUp);
    surface.addEventListener("pointercancel", this._onWidthPointerUp);
  }

  _unbindWidthSurface(surface) {
    surface.removeEventListener("pointerdown", this._onWidthPointerDown);
    surface.removeEventListener("pointermove", this._onWidthPointerMove);
    surface.removeEventListener("pointerup", this._onWidthPointerUp);
    surface.removeEventListener("pointercancel", this._onWidthPointerUp);
  }

  _syncScaleControls() {
    const output = this._host._$("#wide-timeline-scale-output");
    if (output) output.textContent = `${this._scaleHours}h`;
    const zoomIn = this._host.shadowRoot?.querySelector?.(
      '[data-wide-timeline-scale="in"]',
    );
    const zoomOut = this._host.shadowRoot?.querySelector?.(
      '[data-wide-timeline-scale="out"]',
    );
    if (zoomIn) zoomIn.disabled = this._scaleHours === WIDE_TIMELINE_SCALES[0];
    if (zoomOut) {
      zoomOut.disabled =
        this._scaleHours === WIDE_TIMELINE_SCALES.at(-1);
    }
  }

  _timelineAnchorEnd() {
    const now = Number(this._deps.now()) || Date.now() / 1000;
    const windowEnd = Number(this._deps.getWindowEnd()) || now;
    if (this._deps.getSelectedDay()) return windowEnd;
    return Math.max(windowEnd, now);
  }

  _isMajorHourTick(timestamp) {
    const parts =
      typeof this._deps.timezoneParts === "function"
        ? this._deps.timezoneParts(timestamp)
        : null;
    if (parts && Number.isFinite(Number(parts.minute))) {
      return Number(parts.minute) === 0;
    }
    return new Date(timestamp * 1000).getUTCMinutes() === 0;
  }

  _clearClockRefresh() {
    if (this._clockTimer == null) return;
    this._deps.clearTimer(this._clockTimer);
    this._clockTimer = null;
  }

  _syncClockRefresh() {
    this._clearClockRefresh();
    if (
      !this.enabled() ||
      !this.isOpen() ||
      this._deps.getSelectedDay()
    ) {
      return;
    }
    const delay = timelineRefreshMsForScale(this._scaleHours);
    this._clockTimer = this._deps.setTimer(() => {
      this._clockTimer = null;
      this._refreshClockPosition();
      this._syncDayLabel();
      this._syncClockRefresh();
    }, delay);
    this._clockTimer?.unref?.();
  }

  _refreshClockPosition() {
    if (this._deps.getSelectedDay() || !this._lastLayout) return;
    const anchorEnd = this._timelineAnchorEnd();
    this._clockOffsetSeconds = Math.max(
      0,
      anchorEnd - this._lastLayout.anchorEnd,
    );
    const offsetPixels =
      this._clockOffsetSeconds * this._lastLayout.pixelsPerSecond;
    const canvas = this._host._$(".wide-timeline-canvas");
    if (!canvas?.style) return;
    canvas.style.setProperty(
      "--timeline-clock-offset",
      `${Math.round(offsetPixels * 100) / 100}px`,
    );
    canvas.style.height = `${Math.ceil(
      this._lastLayout.contentHeight + offsetPixels,
    )}px`;
  }

  _contextKey() {
    return [
      this._deps.getCameraKey(),
      Math.floor(Number(this._deps.getWindowEnd()) || 0),
      this._deps.getSelectedDay() || "recent",
    ].join("|");
  }

  _renderSignature({
    allEvents,
    visibleEvents,
    visibleReviews,
    viewportWidth,
    viewportHeight,
    contextKey,
  }) {
    const eventSignature = (items) =>
      (Array.isArray(items) ? items : [])
        .map((event) =>
          [
            event?.id,
            event?.start_time,
            event?.end_time,
            event?.label,
            event?.has_clip ? 1 : 0,
            event?.has_snapshot ? 1 : 0,
          ].join(":"),
        )
        .join(",");
    const reviewSignature = (Array.isArray(visibleReviews)
      ? visibleReviews
      : []
    )
      .map((review) =>
        [
          review?.id,
          review?.start_time,
          review?.end_time,
          review?.severity,
          ...(review?.data?.detections || []),
          ...(review?.data?.objects || []),
        ].join(":"),
      )
      .join(",");
    const hasVisibleContent =
      (Array.isArray(visibleEvents) && visibleEvents.length > 0) ||
      (Array.isArray(visibleReviews) && visibleReviews.length > 0);
    return [
      contextKey,
      this._scaleHours,
      Math.round(viewportWidth),
      Math.round(viewportHeight),
      this._host._filterLabel || "all",
      this._host._filterZone || "all",
      this._host._favOnly ? 1 : 0,
      this._deps.isLoading() && !hasVisibleContent ? 1 : 0,
      eventSignature(allEvents),
      eventSignature(visibleEvents),
      reviewSignature,
    ].join("|");
  }

  _alignTimestamp(timestamp, stepSeconds) {
    if (
      typeof this._deps.timezoneParts !== "function" ||
      typeof this._deps.timezoneDateTimeToEpoch !== "function"
    ) {
      return Math.floor(timestamp / stepSeconds) * stepSeconds;
    }
    const parts = this._deps.timezoneParts(timestamp);
    if (!parts) return Math.floor(timestamp / stepSeconds) * stepSeconds;
    const stepMinutes = Math.max(1, Math.round(stepSeconds / 60));
    const minuteOfDay =
      (Number(parts.hour) || 0) * 60 + (Number(parts.minute) || 0);
    const alignedMinute =
      Math.floor(minuteOfDay / stepMinutes) * stepMinutes;
    return this._deps.timezoneDateTimeToEpoch(
      parts.year,
      parts.month,
      parts.day,
      Math.floor(alignedMinute / 60),
      alignedMinute % 60,
      0,
    );
  }

  _timestampAtViewportCenter() {
    const viewport = this._boundViewport;
    const layout = this._lastLayout;
    if (!viewport || !layout?.pixelsPerSecond) return null;
    return (
      layout.anchorEnd +
      this._clockOffsetSeconds -
      Math.max(0, viewport.scrollTop + viewport.clientHeight / 2 - 16) /
        layout.pixelsPerSecond
    );
  }

  _scheduleDayLabelSync() {
    if (this._scrollRaf) return;
    this._scrollRaf = nextFrame(() => {
      this._scrollRaf = 0;
      this._savedScrollTop = this._boundViewport?.scrollTop || 0;
      this._syncDayLabel();
    });
  }

  _syncDayLabel() {
    const label = this._host._$("#wide-timeline-day");
    const viewport = this._boundViewport;
    const layout = this._lastLayout;
    if (!label) return;
    if (!viewport || !layout?.pixelsPerSecond) {
      label.textContent = this._deps.formatDay(this._deps.getWindowEnd());
      return;
    }
    const timestamp = Math.max(
      layout.rangeStart,
      Math.min(
        layout.anchorEnd + this._clockOffsetSeconds,
        layout.anchorEnd +
          this._clockOffsetSeconds -
          Math.max(0, viewport.scrollTop - 16) / layout.pixelsPerSecond,
      ),
    );
    label.textContent = this._deps.formatDay(timestamp);
  }

  _handleWheel(event) {
    if (event?.ctrlKey || event?.metaKey) return;
    const stack = event?.target?.closest?.("[data-wide-timeline-stack]");
    const stackId = String(stack?.dataset?.wideTimelineStack || "");
    const group = this._lastLayout?.groups?.find(
      (candidate) => candidate.id === stackId,
    );
    if (!group || group.entries.length < 2) return;

    const rawDelta = Number(event.deltaY) || Number(event.deltaX) || 0;
    if (!rawDelta) return;
    event.preventDefault?.();
    event.stopPropagation?.();

    const modeMultiplier =
      event.deltaMode === 1
        ? 16
        : event.deltaMode === 2
          ? this._boundViewport?.clientHeight || 480
          : 1;
    const delta = rawDelta * modeMultiplier;
    const inputAt = Number.isFinite(Number(event.timeStamp))
      ? Number(event.timeStamp)
      : Date.now();
    if (
      this._stackWheel.id !== stackId ||
      inputAt - this._stackWheel.lastInputAt > 500
    ) {
      this._stackWheel.id = stackId;
      this._stackWheel.delta = 0;
    }
    if (
      this._stackWheel.delta &&
      Math.sign(this._stackWheel.delta) !== Math.sign(delta)
    ) {
      this._stackWheel.delta = 0;
    }
    this._stackWheel.delta += delta;
    this._stackWheel.lastInputAt = inputAt;
    if (
      Math.abs(this._stackWheel.delta) < 24 ||
      inputAt - this._stackWheel.lastCycleAt < 140
    ) {
      return;
    }
    const direction = this._stackWheel.delta > 0 ? 1 : -1;
    this._stackWheel.delta = 0;
    this._stackWheel.lastCycleAt = inputAt;
    this.cycleStack(stackId, direction);
  }

  _handlePointerDown(event) {
    if (
      event?.pointerType !== "mouse" ||
      event?.button !== 0 ||
      event.target?.closest?.("button")
    ) {
      return;
    }
    const viewport = this._boundViewport;
    if (!viewport || isWideTimelineScrollbarPointer(event, viewport)) return;
    this._drag = {
      pointerId: event.pointerId,
      startY: event.clientY,
      startScrollTop: viewport.scrollTop,
      moved: false,
    };
    viewport.setPointerCapture?.(event.pointerId);
    viewport.classList.add("is-dragging");
  }

  _handlePointerMove(event) {
    const viewport = this._boundViewport;
    if (
      !viewport ||
      !this._drag ||
      event.pointerId !== this._drag.pointerId
    ) {
      return;
    }
    const delta = event.clientY - this._drag.startY;
    if (Math.abs(delta) > 4) this._drag.moved = true;
    viewport.scrollTop = this._drag.startScrollTop - delta;
    if (this._drag.moved) event.preventDefault?.();
  }

  _handlePointerUp(event) {
    const viewport = this._boundViewport;
    if (
      !viewport ||
      !this._drag ||
      event.pointerId !== this._drag.pointerId
    ) {
      return;
    }
    if (this._drag.moved) this._suppressClickUntil = Date.now() + 180;
    viewport.releasePointerCapture?.(event.pointerId);
    viewport.classList.remove("is-dragging");
    this._drag = null;
  }
}
