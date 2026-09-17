import { cap } from "../../helpers.js";
import { CleanupController } from "../../shared/cleanup.js";
import { escapeHtml, escapeHtmlAttribute } from "../../shared/html.js";
import { applyLocalizedText } from "../localization/localized-dom.js";
import {
  CARD_VIEW_MEDIA_DRAWER_ORDER,
  CARD_VIEW_MEDIA_DRAWER_TYPES,
  normalizeCardViewMediaDrawerType,
} from "./config.js";

const DRAWER_ITEM_LIMIT = 200;
const DRAWER_ITEM_GAP_PX = 6;

const POPUP_MEDIA_TYPES = Object.freeze({
  [CARD_VIEW_MEDIA_DRAWER_TYPES.alerts]: "alert",
  [CARD_VIEW_MEDIA_DRAWER_TYPES.clips]: "clip",
  [CARD_VIEW_MEDIA_DRAWER_TYPES.snapshots]: "snapshot",
  [CARD_VIEW_MEDIA_DRAWER_TYPES.recordings]: "recording",
  [CARD_VIEW_MEDIA_DRAWER_TYPES.favorites]: "kept",
});

const DRAWER_LABELS = Object.freeze({
  [CARD_VIEW_MEDIA_DRAWER_TYPES.alerts]: "Alerts",
  [CARD_VIEW_MEDIA_DRAWER_TYPES.clips]: "Clips",
  [CARD_VIEW_MEDIA_DRAWER_TYPES.snapshots]: "Snapshots",
  [CARD_VIEW_MEDIA_DRAWER_TYPES.recordings]: "Recordings",
  [CARD_VIEW_MEDIA_DRAWER_TYPES.favorites]: "Favorites",
});

const DRAWER_EMPTY_TRANSLATION_KEYS = Object.freeze({
  [CARD_VIEW_MEDIA_DRAWER_TYPES.alerts]: ["loadingAlerts", "noAlerts"],
  [CARD_VIEW_MEDIA_DRAWER_TYPES.clips]: ["loadingClips", "noClips"],
  [CARD_VIEW_MEDIA_DRAWER_TYPES.snapshots]: ["loadingSnapshots", "noSnapshots"],
  [CARD_VIEW_MEDIA_DRAWER_TYPES.recordings]: ["loadingRecordings", "noRecordings"],
  [CARD_VIEW_MEDIA_DRAWER_TYPES.favorites]: ["loadingFavorites", "noFavorites"],
});

export const resolveCardViewMediaDrawerPopupType = (value) =>
  POPUP_MEDIA_TYPES[normalizeCardViewMediaDrawerType(value)];

export const buildCardViewMediaDrawerContentKey = ({
  mediaType = "",
  events = [],
  recordings = [],
  limit = DRAWER_ITEM_LIMIT,
} = {}) => {
  const popupMediaType = resolveCardViewMediaDrawerPopupType(mediaType);
  const itemLimit = Math.max(0, Number(limit) || 0);
  const items = popupMediaType === "recording"
    ? (recordings || []).slice(0, itemLimit).map((recording) => [
        Number(recording?.start_time) || 0,
        Number(recording?.end_time) || 0,
        String(recording?._fvc_camera_entity || ""),
        String(recording?._fvc_group_member || ""),
      ])
    : (events || []).slice(0, itemLimit).map((event) => [
        String(event?.id || ""),
        String(event?.camera || ""),
        Number(event?.start_time) || 0,
        String(event?.label || ""),
      ]);
  return JSON.stringify([popupMediaType, ...items]);
};

export const buildCardViewMediaDrawerItemMarkup = ({
  event = null,
  mediaType = "",
  thumbnailUrl = "",
  title = "",
  label = "",
  labelKey = "",
  time = "",
  placeholderIcon = "",
} = {}) => {
  const eventId = String(event?.id || "");
  if (!eventId) return "";
  const popupMediaType = resolveCardViewMediaDrawerPopupType(mediaType);
  return `<button class="card-view-media-drawer-item" type="button" data-card-view-media-event="${escapeHtmlAttribute(eventId)}" data-card-view-media-type="${popupMediaType}" title="${escapeHtmlAttribute(title)}">
    <span class="card-view-media-drawer-thumbnail">
      <span class="card-view-media-drawer-placeholder" aria-hidden="true">${placeholderIcon}</span>
      <img src="${escapeHtmlAttribute(thumbnailUrl)}" alt="" loading="lazy" decoding="async" data-card-view-media-thumbnail>
    </span>
    <span class="card-view-media-drawer-meta"><span${labelKey ? ` data-fvc-i18n="${labelKey}"` : ""}>${escapeHtml(label)}</span><span>${escapeHtml(time)}</span></span>
  </button>`;
};

export const buildCardViewMediaDrawerRecordingMarkup = ({
  recording = null,
  title = "",
  label = "Recording",
  labelKey = "",
  labelValues = {},
  time = "",
  placeholderIcon = "",
} = {}) => {
  const start = Math.floor(Number(recording?.start_time) || 0);
  const end = Math.floor(Number(recording?.end_time) || Date.now() / 1000);
  if (!start || end <= start) return "";
  const cameraEntity = String(recording?._fvc_camera_entity || "");
  const valuesAttribute = Object.keys(labelValues).length
    ? ` data-fvc-i18n-values="${escapeHtmlAttribute(JSON.stringify(labelValues))}"`
    : "";
  return `<button class="card-view-media-drawer-item" type="button" data-card-view-media-recording-start="${start}" data-card-view-media-recording-end="${end}"${cameraEntity ? ` data-card-view-media-recording-entity="${escapeHtmlAttribute(cameraEntity)}"` : ""} title="${escapeHtmlAttribute(title)}">
    <span class="card-view-media-drawer-thumbnail card-view-media-drawer-thumbnail--recording">
      <span class="card-view-media-drawer-placeholder" aria-hidden="true">${placeholderIcon}</span>
    </span>
    <span class="card-view-media-drawer-meta"><span${labelKey ? ` data-fvc-i18n="${labelKey}"${valuesAttribute}` : ""}>${escapeHtml(label)}</span><span>${escapeHtml(time)}</span></span>
  </button>`;
};

export const resolveCardViewMediaDrawerNavigationState = ({
  scrollTop = 0,
  scrollHeight = 0,
  clientHeight = 0,
  tolerance = 1,
} = {}) => {
  const viewport = Math.max(0, Number(clientHeight) || 0);
  const maxScrollTop = Math.max(0, (Number(scrollHeight) || 0) - viewport);
  const current = Math.min(maxScrollTop, Math.max(0, Number(scrollTop) || 0));
  const edgeTolerance = Math.max(0, Number(tolerance) || 0);
  const hasOverflow = maxScrollTop > edgeTolerance;
  return {
    canScrollUp: hasOverflow && current > edgeTolerance,
    canScrollDown: hasOverflow && current < maxScrollTop - edgeTolerance,
  };
};

export const buildCardViewMediaDrawerScrollPlan = ({
  itemHeight = 0,
  viewportHeight = 0,
  direction = 1,
  gap = DRAWER_ITEM_GAP_PX,
  fallbackHeight = 96,
} = {}) => {
  const height = Number(itemHeight) || Number(fallbackHeight) || 0;
  const spacing = Math.max(0, Number(gap) || 0);
  const step = Math.max(1, height + spacing);
  const visibleItems = Math.max(
    1,
    Math.floor((Math.max(0, Number(viewportHeight) || 0) + spacing) / step),
  );
  return {
    top: step * visibleItems * (Number(direction) < 0 ? -1 : 1),
    behavior: "smooth",
  };
};

export class CardViewMediaDrawerController {
  constructor({
    query = () => null,
    isEnabled = () => false,
    getConfiguredType = () => CARD_VIEW_MEDIA_DRAWER_TYPES.alerts,
    getAvailableTypes = () => CARD_VIEW_MEDIA_DRAWER_ORDER,
    getEvents = () => [],
    getRecordings = () => [],
    isEventsLoading = () => false,
    isRecordingsLoading = () => false,
    mediaUrl = () => "",
    formatDateTime = () => "",
    formatTime = () => "",
    t,
    onSelectEvent = () => {},
    onSelectRecording = () => {},
    onSelectType = () => {},
    onOpenChange = () => {},
    onToggleCalendar = () => {},
    onToggleFilter = () => {},
    isCalendarOpen = () => false,
    isFilterOpen = () => false,
    icons = {},
    resizeObserverCtor = globalThis.ResizeObserver,
    requestFrame = globalThis.requestAnimationFrame?.bind(globalThis) ||
      ((callback) => globalThis.setTimeout(callback, 0)),
  } = {}) {
    this._query = query;
    this._isEnabled = isEnabled;
    this._getConfiguredType = getConfiguredType;
    this._getAvailableTypes = getAvailableTypes;
    this._getEvents = getEvents;
    this._getRecordings = getRecordings;
    this._isEventsLoading = isEventsLoading;
    this._isRecordingsLoading = isRecordingsLoading;
    this._mediaUrl = mediaUrl;
    this._formatDateTime = formatDateTime;
    this._formatTime = formatTime;
    this._t = t;
    this._onSelectEvent = onSelectEvent;
    this._onSelectRecording = onSelectRecording;
    this._onSelectType = onSelectType;
    this._onOpenChange = onOpenChange;
    this._onToggleCalendar = onToggleCalendar;
    this._onToggleFilter = onToggleFilter;
    this._isCalendarOpen = isCalendarOpen;
    this._isFilterOpen = isFilterOpen;
    this._icons = icons;
    this._ResizeObserver = resizeObserverCtor;
    this._requestFrame = requestFrame;
    this._cleanup = new CleanupController();
    this._resizeObserver = null;
    this._scroller = null;
    this._open = false;
    this._selectedDrawerType = "";
    this._configuredDrawerType = "";
    this._contentKey = "";
    this._popupMediaType = "";
    this._navigationToken = 0;
  }

  bind() {
    this._disposeBindings();
    const scroller = this._query(
      "[data-card-view-media-drawer-scroller]",
    );
    this._scroller = scroller;
    if (scroller) {
      this._cleanup.addEventListener(scroller, "scroll", () => {
        this.syncNavigation();
      });
      if (typeof this._ResizeObserver === "function") {
        this._resizeObserver = new this._ResizeObserver(() => {
          this.syncNavigation();
        });
        this._resizeObserver.observe(scroller);
      }
    }
    this.syncState();
    this.render();
  }

  dispose() {
    this._disposeBindings();
    this._open = false;
    this._selectedDrawerType = "";
    this._configuredDrawerType = "";
    this._contentKey = "";
    this._popupMediaType = "";
  }

  _disposeBindings() {
    this._navigationToken += 1;
    this._cleanup.dispose();
    this._cleanup = new CleanupController();
    this._resizeObserver?.disconnect?.();
    this._resizeObserver = null;
    this._scroller = null;
  }

  isOpen() {
    return this._open && this._isEnabled() === true;
  }

  setOpen(open) {
    const nextOpen = open === true && this._isEnabled() === true;
    const changed = nextOpen !== this._open;
    this._open = nextOpen;
    if (changed) this._onOpenChange(this._open);
    this.syncState();
    if (this._open) this.render();
    return this._open;
  }

  toggle() {
    return this.setOpen(!this.isOpen());
  }

  selectedType() {
    return this._syncSelectedDrawerType();
  }

  syncState() {
    const root = this._query("[data-card-view-media-drawer]");
    if (!root) return;
    const enabled = this._isEnabled() === true;
    if (!enabled) this._open = false;
    const open = enabled && this._open;
    root.hidden = !enabled;
    root.classList?.toggle?.("is-open", open);
    root.classList?.toggle?.("is-closed", !open);
    const panel = this._query("[data-card-view-media-drawer-panel]");
    panel?.setAttribute?.("aria-hidden", String(!open));
    const tabs = this._query("[data-card-view-media-drawer-tabs]");
    if (tabs) {
      tabs.setAttribute?.("aria-hidden", String(!open));
    }
    const actions = this._query("[data-card-view-media-drawer-actions]");
    if (actions) {
      actions.hidden = false;
      actions.setAttribute?.("aria-hidden", String(!open));
    }
    const handle = this._query("[data-card-view-media-drawer-toggle]");
    if (handle) {
      const key = open
        ? "runtime.cardView.closeMediaDrawer"
        : "runtime.cardView.openMediaDrawer";
      const label = open ? "Close media drawer" : "Open media drawer";
      const localizedLabel = this._t?.(key) || label;
      handle.setAttribute?.("aria-expanded", String(open));
      handle.setAttribute?.("data-fvc-i18n-aria-label", key);
      handle.setAttribute?.("data-fvc-i18n-title", key);
      handle.setAttribute?.("aria-label", localizedLabel);
      handle.setAttribute?.("title", localizedLabel);
    }
  }

  render({ force = false } = {}) {
    this.syncState();
    const scroller = this._query(
      "[data-card-view-media-drawer-scroller]",
    );
    if (!scroller) return null;
    if (this._isEnabled() !== true) {
      this._resetContent(scroller);
      return null;
    }

    const drawerType = this._syncSelectedDrawerType();
    if (!drawerType) {
      this._syncTabs("");
      this._resetContent(scroller);
      return null;
    }
    const popupMediaType = resolveCardViewMediaDrawerPopupType(drawerType);
    this._syncTabs(drawerType);
    this._syncActions(drawerType);

    if (!this._open) {
      if (this._popupMediaType && this._popupMediaType !== popupMediaType) {
        this._resetContent(scroller);
      }
      this._popupMediaType = popupMediaType;
      this._hideNavigation();
      return { drawerType, popupMediaType, count: 0, deferred: true };
    }

    const isRecording = popupMediaType === "recording";
    const events = isRecording
      ? []
      : (this._getEvents(popupMediaType) || [])
          .filter((event) => event?.id)
          .slice(0, DRAWER_ITEM_LIMIT);
    const recordings = isRecording
      ? (this._getRecordings() || [])
          .filter((recording) => {
            const start = Number(recording?.start_time) || 0;
            const end = Number(recording?.end_time) || 0;
            return start > 0 && (!end || end > start);
          })
          .slice(0, DRAWER_ITEM_LIMIT)
      : [];
    const contentKey = buildCardViewMediaDrawerContentKey({
      mediaType: drawerType,
      events,
      recordings,
    });
    const typeChanged = this._popupMediaType !== popupMediaType;
    if (force || contentKey !== this._contentKey) {
      const previousScrollTop = typeChanged ? 0 : scroller.scrollTop;
      const items = isRecording ? recordings : events;
      const isLoading = isRecording
        ? this._isRecordingsLoading()
        : this._isEventsLoading(drawerType);
      const emptyKeySuffix = DRAWER_EMPTY_TRANSLATION_KEYS[drawerType]?.[
        isLoading ? 0 : 1
      ];
      const emptyKey = `runtime.cardView.drawer.${emptyKeySuffix}`;
      scroller.innerHTML = items.length
        ? isRecording
          ? recordings.map((recording) => this._recordingMarkup(recording)).join("")
          : events.map((event) => this._eventMarkup(event, drawerType)).join("")
        : `<div class="card-view-media-drawer-empty" data-fvc-i18n="${emptyKey}">${isLoading ? `Loading ${DRAWER_LABELS[drawerType].toLowerCase()}…` : `No ${DRAWER_LABELS[drawerType].toLowerCase()} available`}</div>`;
      applyLocalizedText(scroller, this._t);
      scroller.scrollTop = previousScrollTop;
      for (const image of scroller.querySelectorAll?.(
        "[data-card-view-media-thumbnail]",
      ) || []) {
        image.addEventListener?.("error", () => {
          image.hidden = true;
        }, { once: true });
      }
      this._contentKey = contentKey;
      this._popupMediaType = popupMediaType;
    }
    this._scheduleNavigationSync();
    return {
      drawerType,
      popupMediaType,
      count: isRecording ? recordings.length : events.length,
      deferred: false,
    };
  }

  selectType(value) {
    const drawerType = normalizeCardViewMediaDrawerType(value);
    if (!this._availableDrawerTypes().includes(drawerType)) return false;
    if (drawerType === this._selectedDrawerType) return false;
    this._selectedDrawerType = drawerType;
    this._resetContent();
    this._onSelectType(drawerType);
    this.render({ force: true });
    return true;
  }

  _syncSelectedDrawerType() {
    const availableTypes = this._availableDrawerTypes();
    if (!availableTypes.length) {
      this._selectedDrawerType = "";
      this._configuredDrawerType = "";
      return "";
    }
    const configuredType = normalizeCardViewMediaDrawerType(
      this._getConfiguredType(),
    );
    if (
      !this._selectedDrawerType ||
      configuredType !== this._configuredDrawerType ||
      !availableTypes.includes(this._selectedDrawerType)
    ) {
      this._selectedDrawerType = availableTypes.includes(configuredType)
        ? configuredType
        : availableTypes[0];
      this._configuredDrawerType = configuredType;
    }
    return this._selectedDrawerType;
  }

  _availableDrawerTypes() {
    const configured = this._getAvailableTypes?.();
    const source = Array.isArray(configured)
      ? configured
      : CARD_VIEW_MEDIA_DRAWER_ORDER;
    return [...new Set(source.map(normalizeCardViewMediaDrawerType))].filter(
      (drawerType) => CARD_VIEW_MEDIA_DRAWER_ORDER.includes(drawerType),
    );
  }

  _syncTabs(activeType) {
    const tabs = this._query("[data-card-view-media-drawer-tabs]");
    const availableTypes = this._availableDrawerTypes();
    const available = new Set(availableTypes);
    const root = this._query("[data-card-view-media-drawer]");
    root?.setAttribute?.(
      "data-card-view-media-tab-count",
      String(availableTypes.length),
    );
    if (tabs) {
      tabs.hidden = availableTypes.length === 0;
      tabs.style?.setProperty?.(
        "--card-view-media-drawer-tab-count",
        String(availableTypes.length),
      );
      tabs.setAttribute?.(
        "aria-hidden",
        String(!this._open || availableTypes.length === 0),
      );
    }
    for (const tab of tabs?.querySelectorAll?.(
      "[data-card-view-media-drawer-type]",
    ) || []) {
      const drawerType = normalizeCardViewMediaDrawerType(
        tab.dataset.cardViewMediaDrawerType,
      );
      const visible = available.has(drawerType);
      const active = visible && drawerType === activeType;
      tab.hidden = !visible;
      tab.disabled = !visible;
      tab.classList?.toggle?.("active", active);
      tab.setAttribute?.("aria-hidden", String(!visible));
      tab.setAttribute?.("aria-selected", String(active));
      tab.tabIndex = active ? 0 : -1;
    }
  }

  _syncActions(activeType = this.selectedType()) {
    const calendar = this._query("[data-card-view-media-drawer-calendar]");
    const filter = this._query("[data-card-view-media-drawer-filter]");
    const calendarOpen = this._isCalendarOpen() === true;
    const filterOpen = this._isFilterOpen() === true;
    if (calendar) {
      calendar.classList?.toggle?.("active", calendarOpen);
      calendar.setAttribute?.("aria-pressed", String(calendarOpen));
    }
    if (filter) {
      const disabled = activeType === CARD_VIEW_MEDIA_DRAWER_TYPES.recordings;
      filter.disabled = disabled;
      filter.classList?.toggle?.("active", !disabled && filterOpen);
      filter.setAttribute?.("aria-pressed", String(!disabled && filterOpen));
    }
  }

  _eventMarkup(event, drawerType) {
    return buildCardViewMediaDrawerItemMarkup({
      event,
      mediaType: drawerType,
      thumbnailUrl: this._mediaUrl(
        event.id,
        "thumbnail.jpg",
        event.camera || "",
      ),
      title: this._formatDateTime(event.start_time || 0),
      label: cap(event.label || "event"),
      labelKey: event.label ? "" : "runtime.cardView.event",
      time: this._formatTime(event.start_time || 0),
      placeholderIcon: this._icons.person || "",
    });
  }

  _recordingMarkup(recording) {
    const member = String(recording?._fvc_group_member || "");
    return buildCardViewMediaDrawerRecordingMarkup({
      recording,
      title: this._formatDateTime(recording.start_time || 0),
      label: member ? `Recording ${member}` : "Recording",
      labelKey: member
        ? "runtime.cardView.recordingMember"
        : "runtime.cardView.recording",
      labelValues: member ? { member } : {},
      time: this._formatTime(recording.start_time || 0),
      placeholderIcon: this._icons.recordings || "",
    });
  }

  _resetContent(scroller = this._scroller) {
    if (scroller) {
      if (scroller.firstChild && typeof scroller.replaceChildren === "function") {
        scroller.replaceChildren();
      } else if (scroller.innerHTML) {
        scroller.innerHTML = "";
      }
    }
    this._contentKey = "";
    this._popupMediaType = "";
    this._hideNavigation();
  }

  _hideNavigation() {
    const up = this._query('[data-card-view-media-drawer-scroll="-1"]');
    const down = this._query('[data-card-view-media-drawer-scroll="1"]');
    if (up) up.hidden = true;
    if (down) down.hidden = true;
  }

  _scheduleNavigationSync() {
    const token = ++this._navigationToken;
    this._requestFrame(() => {
      if (token !== this._navigationToken) return;
      this.syncNavigation();
    });
  }

  syncNavigation(
    scroller = this._query("[data-card-view-media-drawer-scroller]"),
  ) {
    const up = this._query('[data-card-view-media-drawer-scroll="-1"]');
    const down = this._query('[data-card-view-media-drawer-scroll="1"]');
    if (!scroller) {
      if (up) up.hidden = true;
      if (down) down.hidden = true;
      return;
    }
    const state = resolveCardViewMediaDrawerNavigationState({
      scrollTop: scroller.scrollTop,
      scrollHeight: scroller.scrollHeight,
      clientHeight: scroller.clientHeight,
    });
    if (up) up.hidden = !state.canScrollUp;
    if (down) down.hidden = !state.canScrollDown;
  }

  scroll(direction = 1) {
    const scroller = this._query(
      "[data-card-view-media-drawer-scroller]",
    );
    if (!scroller) return false;
    const item = scroller.querySelector?.(".card-view-media-drawer-item");
    scroller.scrollBy?.(
      buildCardViewMediaDrawerScrollPlan({
        itemHeight: item?.getBoundingClientRect?.().height,
        viewportHeight: scroller.clientHeight,
        direction,
      }),
    );
    return true;
  }

  closeForVideoAreaClick(target) {
    if (!this.isOpen() || !target?.closest) return false;
    if (!target.closest(".card-view-live-stage")) return false;
    if (
      target.closest(
        "[data-card-view-media-drawer], [data-media-overlay-ignore], .live-playback-controls, button, a[href], input, select, textarea, [role='button'], [role='slider']",
      )
    ) {
      return false;
    }
    this.setOpen(false);
    return true;
  }

  handleClick(event, target) {
    if (!target?.closest) return false;
    if (target.closest("[data-card-view-media-drawer-toggle]")) {
      event?.preventDefault?.();
      event?.stopPropagation?.();
      this.toggle();
      return true;
    }
    if (target.closest("[data-card-view-media-drawer-calendar]")) {
      event?.preventDefault?.();
      event?.stopPropagation?.();
      this._onToggleCalendar();
      this._syncActions();
      return true;
    }
    const filterAction = target.closest("[data-card-view-media-drawer-filter]");
    if (filterAction) {
      event?.preventDefault?.();
      event?.stopPropagation?.();
      if (!filterAction.disabled) this._onToggleFilter();
      this._syncActions();
      return true;
    }
    const typeTab = target.closest("[data-card-view-media-drawer-type]");
    if (typeTab) {
      event?.preventDefault?.();
      event?.stopPropagation?.();
      this.selectType(typeTab.dataset.cardViewMediaDrawerType);
      return true;
    }
    const navigation = target.closest(
      "[data-card-view-media-drawer-scroll]",
    );
    if (navigation) {
      event?.preventDefault?.();
      event?.stopPropagation?.();
      this.scroll(Number(navigation.dataset.cardViewMediaDrawerScroll));
      return true;
    }
    const item = target.closest("[data-card-view-media-event]");
    const eventId = String(item?.dataset?.cardViewMediaEvent || "");
    if (eventId) {
      event?.preventDefault?.();
      event?.stopPropagation?.();
      this._onSelectEvent(
        eventId,
        String(item.dataset.cardViewMediaType || this._popupMediaType),
      );
      return true;
    }
    const recording = target.closest(
      "[data-card-view-media-recording-start]",
    );
    const start = Number(recording?.dataset?.cardViewMediaRecordingStart) || 0;
    const end = Number(recording?.dataset?.cardViewMediaRecordingEnd) || 0;
    if (!start || end <= start) return false;
    event?.preventDefault?.();
    event?.stopPropagation?.();
    this._onSelectRecording({
      start_time: start,
      end_time: end,
      _fvc_camera_entity:
        recording.dataset.cardViewMediaRecordingEntity || "",
    });
    return true;
  }
}
