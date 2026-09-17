import { CAM_COLORS, cap, camDisplayName, labelColor } from "../../helpers.js";
import { INITIAL_BROWSE_PAINT_LIMIT } from "../../constants.js";
import {
  applyListMarkupWithOlderHint,
  createOlderHintSyncer,
  resolveActiveDayLabelFromScroll,
  resolveListLabelTimestamp,
  resolveListMarkup,
  syncDayLabelAlignmentFromScroll,
  syncOlderHintFromScroll,
} from "../../shared/list-render.js";
import {
  hasCameraPtz,
  hasPtzFocusCapability,
  hasPtzPanTiltCapability,
} from "../ptz/index.js";
import {
  applyLocalizedText,
  setLocalizedText,
} from "../localization/localized-dom.js";
import {
  buildBrowseEmptyMarkup,
  buildBrowseEventsContentMarkup,
  buildBrowseKeptContentMarkup,
  buildBrowseLegendMarkup,
  buildBrowseReviewsContentMarkup,
  buildBrowseStickyDaySectionsMarkup,
  resolveBrowseControlsHeadingLabel,
  resolveBrowseListHeadingLabel,
  resolveBrowseRecordingsHeadingLabel,
  shouldShowBrowseStickyDayHeaders,
} from "./list.tmpl.js";
import { syncPreservedBrowseThumbnail } from "./thumbnail.tmpl.js";

const cameraName = (camera) => cap(camDisplayName(camera));
const REVIEW_ROW_MARKUP_CACHE_LIMIT = 512;
const BROWSE_PROGRESSIVE_BATCH_SIZE = 12;

const browseItemsSignature = (items) => {
  try {
    return JSON.stringify(items || []);
  } catch (_) {
    return (items || [])
      .map((item) => `${item?.id || ""}:${item?.start_time || 0}`)
      .join("|");
  }
};

const appendProgressiveListMarkup = (list, html, t) => {
  const documentRef = list?.ownerDocument || globalThis.document;
  if (
    !documentRef?.createElement ||
    typeof list?.append !== "function" ||
    !String(html || "")
  ) {
    return false;
  }

  const template = documentRef.createElement("template");
  template.innerHTML = html;
  const fragment = template.content;
  applyLocalizedText(fragment, t);
  const lastSection = list.lastElementChild?.matches?.(".list-day-sec")
    ? list.lastElementChild
    : null;
  const firstSection = fragment.firstElementChild?.matches?.(".list-day-sec")
    ? fragment.firstElementChild
    : null;
  if (
    lastSection?.dataset?.dayKey &&
    lastSection.dataset.dayKey === firstSection?.dataset?.dayKey
  ) {
    const label = firstSection.firstElementChild;
    while (label?.nextSibling) lastSection.append(label.nextSibling);
    firstSection.remove();
  } else {
    firstSection?.firstElementChild?.classList?.remove?.(
      "list-day-label-first",
    );
  }
  list.append(fragment);
  return true;
};

const listItemKey = (element) => {
  if (!element?.dataset) return "";
  if (element.dataset.reviewId) return `review:${element.dataset.reviewId}`;
  if (element.dataset.ev) return `event:${element.dataset.ev}`;
  if (element.dataset.rs) {
    return `recording:${element.dataset.rs}:${element.dataset.re || ""}`;
  }
  return "";
};

const replaceListMarkupPreservingMedia = (list, html) => {
  const documentRef = globalThis.document;
  if (
    !documentRef?.createElement ||
    typeof list?.querySelectorAll !== "function" ||
    typeof list?.replaceChildren !== "function"
  ) {
    list.innerHTML = html;
    return;
  }

  const currentItems = new Map();
  for (const item of list.querySelectorAll(
    ".list-item[data-review-id], .list-item[data-ev], .list-item[data-rs]",
  )) {
    const key = listItemKey(item);
    if (key) currentItems.set(key, item);
  }

  const template = documentRef.createElement("template");
  template.innerHTML = html;
  const nextItems = template.content.querySelectorAll(
    ".list-item[data-review-id], .list-item[data-ev], .list-item[data-rs]",
  );
  for (const nextItem of nextItems) {
    const currentItem = currentItems.get(listItemKey(nextItem));
    if (!currentItem) continue;
    if (currentItem.outerHTML === nextItem.outerHTML) {
      nextItem.replaceWith(currentItem);
      continue;
    }

    const currentImage = currentItem.querySelector?.("img[data-thumb-id]");
    const nextImage = nextItem.querySelector?.("img[data-thumb-id]");
    if (syncPreservedBrowseThumbnail(currentImage, nextImage)) {
      nextImage.replaceWith(currentImage);
    }
  }

  list.replaceChildren(template.content);
};

export class BrowseRenderController {
  constructor(host, deps = {}) {
    this._host = host;
    this._appendProgressiveListMarkup =
      deps.appendProgressiveListMarkup || appendProgressiveListMarkup;
    this._lastListElement = null;
    this._browseFirstPaintList = null;
    this._browseFirstPaintState = new Map();
    this._renderedBrowseKey = "";
    this._reviewRowMarkupCache = new Map();
    this._reviewRowMarkupContext = "";
    this._reviewRowMarkupConfig = null;
  }

  listHeadingLabel(timestamp = null) {
    return resolveBrowseListHeadingLabel({
      tab: this._host._tab,
      timestamp,
      getWeekday: (value) => this._host._weekday(value),
      getMonthDay: (value, options) =>
        this._host._monthDay(value, options),
      capitalize: cap,
      t: this._host._localization?.t,
    });
  }

  recordingsHeadingLabel(timestamp = null) {
    return resolveBrowseRecordingsHeadingLabel({
      timestamp,
      windowEnd: this._host._winEnd,
      nowSec: Date.now() / 1000,
      getWeekday: (value) => this._host._weekday(value),
      getMonthDay: (value, options) =>
        this._host._monthDay(value, options),
      t: this._host._localization?.t,
    });
  }

  controlsHeadingLabel() {
    const camera = this._host._activeCam || {};
    const ptzInfo = this._host._activeCameraPtzInfo?.() || null;
    const ptzConfigured = hasCameraPtz(camera);
    const ptzReady =
      ptzConfigured &&
      (hasPtzPanTiltCapability(ptzInfo) ||
        hasPtzFocusCapability(ptzInfo));
    return resolveBrowseControlsHeadingLabel({
      cameraName: cameraName(camera),
      ptzReady,
      t: this._host._localization?.t,
    });
  }

  relocalizeBrowseLabels() {
    this._reviewRowMarkupCache.clear();
    const list = this._host._pageShellRegionElement("browse", "#list");
    for (const dayLabel of list?.querySelectorAll?.(".list-day-label[data-day-ts]") || []) {
      const timestamp = Number(dayLabel.dataset.dayTs);
      if (!Number.isFinite(timestamp)) continue;
      const nextLabel = this.listHeadingLabel(timestamp);
      if (dayLabel.textContent !== nextLabel) dayLabel.textContent = nextLabel;
      if (dayLabel.dataset.dayLabel !== nextLabel) {
        dayLabel.dataset.dayLabel = nextLabel;
      }
    }

    const label = this._host._pageShellRegionElement(
      "browseHeader",
      "#browse-head-label",
    );
    if (!label) return;
    const tab = this._host._tab;
    const nextLabel = tab === "recordings"
      ? this.recordingsHeadingLabel(this._host._winEnd)
      : tab === "controls"
        ? this.controlsHeadingLabel()
        : this.showStickyDayHeaders()
          ? resolveActiveDayLabelFromScroll({
              list,
              browse: this._host._pageShellRegion("browse"),
            }) || this.listHeadingLabel()
          : this.listHeadingLabel();
    if (label.textContent !== nextLabel) label.textContent = nextLabel;
  }

  renderListLabel(timestamp = null) {
    const browseHeader = this._host._pageShellRegion("browseHeader");
    const label = this._host._pageShellRegionElement(
      "browseHeader",
      "#browse-head-label",
    );
    const previous = this._host._pageShellRegionElement(
      "browseHeader",
      "#rec-day-prev",
    );
    const next = this._host._pageShellRegionElement(
      "browseHeader",
      "#rec-day-next",
    );
    if (!label || !browseHeader) return;

    browseHeader.style.display = "flex";
    if (this._host._tab === "recordings") {
      label.textContent = this.recordingsHeadingLabel(
        timestamp || this._host._winEnd,
      );
      if (previous) previous.style.display = "inline-flex";
      if (next) next.style.display = "inline-flex";
      if (this._host._recordingsBrowseNavController?.prepareBrowseNav) {
        this._host._recordingsBrowseNavController.prepareBrowseNav();
      } else {
        if (previous) previous.disabled = true;
        if (next) next.disabled = true;
      }
      return;
    }

    if (previous) previous.style.display = "none";
    if (next) next.style.display = "none";
    label.textContent =
      this._host._tab === "controls"
        ? this.controlsHeadingLabel()
        : this.listHeadingLabel(timestamp);
  }

  showStickyDayHeaders() {
    return shouldShowBrowseStickyDayHeaders(this._host._tab);
  }

  renderStickyDaySections(items, renderItem) {
    return buildBrowseStickyDaySectionsMarkup({
      items,
      getDayKey: (timestamp) => this._host._dayKey(timestamp),
      getLabel: (timestamp) => this.listHeadingLabel(timestamp),
      renderItem,
    });
  }

  renderEventsContent(items, { exhausted = this._host._exhausted } = {}) {
    return buildBrowseEventsContentMarkup({
      items,
      showStickyDayHeaders: this.showStickyDayHeaders(),
      getDayKey: (timestamp) => this._host._dayKey(timestamp),
      getLabel: (timestamp) => this.listHeadingLabel(timestamp),
      renderItem: (item) => this._host._eventCardHTML(item, false),
      exhausted,
    });
  }

  renderKeptContent(items) {
    return buildBrowseKeptContentMarkup({
      items,
      renderItem: (item) => this._host._eventCardHTML(item, false),
    });
  }

  renderReviewsContent(items) {
    const context = this._reviewRowMarkupContextKey();
    if (
      context !== this._reviewRowMarkupContext ||
      this._host._config !== this._reviewRowMarkupConfig
    ) {
      this._reviewRowMarkupCache.clear();
      this._reviewRowMarkupContext = context;
      this._reviewRowMarkupConfig = this._host._config;
    }
    return buildBrowseReviewsContentMarkup({
      items,
      getDayKey: (timestamp) => this._host._dayKey(timestamp),
      getLabel: (timestamp) => this.listHeadingLabel(timestamp),
      renderItem: (item) => this._cachedReviewRowMarkup(item),
    });
  }

  _reviewRowMarkupContextKey() {
    const context = this._host._cc?.() || {};
    const timeZone = this._host._tz?.() || "";
    return `${this._browseFirstPaintKey()}|${timeZone}|${context.clientId || ""}|${context.cam || ""}`;
  }

  _reviewRowSignature(review) {
    const firstDetection = review?.data?.detections?.[0] || "";
    const sourceEvent =
      this._host._browseFilterController?.reviewSourceEvent?.(review) ||
      (firstDetection
        ? this._host._findEventById?.(firstDetection) || null
        : null);
    if (firstDetection && !Number((sourceEvent || review)?.end_time)) {
      return "";
    }
    try {
      return JSON.stringify([review, sourceEvent]);
    } catch (_) {
      return "";
    }
  }

  _cachedReviewRowMarkup(review) {
    const reviewId = String(review?.id || "");
    if (!reviewId) return this._host._reviewListItemHTML(review);
    const cacheKey = `${String(review?.camera || "")}|${reviewId}`;
    const signature = this._reviewRowSignature(review);
    const cached = this._reviewRowMarkupCache.get(cacheKey);
    if (signature && cached?.signature === signature) {
      this._reviewRowMarkupCache.delete(cacheKey);
      this._reviewRowMarkupCache.set(cacheKey, cached);
      return cached.html;
    }

    const html = this._host._reviewListItemHTML(review);
    if (!signature) return html;
    this._reviewRowMarkupCache.set(cacheKey, { signature, html });
    while (this._reviewRowMarkupCache.size > REVIEW_ROW_MARKUP_CACHE_LIMIT) {
      this._reviewRowMarkupCache.delete(
        this._reviewRowMarkupCache.keys().next().value,
      );
    }
    return html;
  }

  syncBrowseHeadFromScroll() {
    if (!this.showStickyDayHeaders()) return;

    const browse = this._host._pageShellRegion("browse");
    const list = this._host._pageShellRegionElement("browse", "#list");
    const label = this._host._pageShellRegionElement(
      "browseHeader",
      "#browse-head-label",
    );
    if (!list || !browse || !label) return;

    const nextLabel = resolveActiveDayLabelFromScroll({ list, browse });
    syncDayLabelAlignmentFromScroll({ list, browse });
    if (nextLabel && label.textContent !== nextLabel) {
      label.textContent = nextLabel;
    }
  }

  renderLegend() {
    const legend = this._host._pageShellRegionElement(
      "filterPanel",
      "#legend",
    );
    if (!legend) return;
    const labels =
      this._host._browseFilterController?.labels?.() ??
      this._host._labels?.() ??
      [];
    legend.innerHTML = buildBrowseLegendMarkup({
      labels,
      cameras: this._host._config.cameras,
      eventsMode: this._host._eventsMode,
      cameraColors: CAM_COLORS,
      getLabelColor: labelColor,
      capitalize: cap,
      getCameraName: cameraName,
    });
  }

  renderList() {
    const list = this._host._pageShellRegionElement("browse", "#list");
    if (!list) return;

    if (this._host._tab === "controls") {
      this._renderedBrowseKey = "";
      this.syncOlderHint(true);
      return this._host._renderControlsSection(list);
    }

    if (this._host._tab === "recordings") {
      this._renderedBrowseKey = "";
      return this._renderRecordingsTabList(list);
    }

    if (this._host._tab === "alerts") {
      return this._renderReviews(list);
    }

    if (this._host._tab === "kept") {
      this._renderedBrowseKey = "";
      return this._renderKeptList(list);
    }

    return this._renderEventsList(list);
  }

  syncOlderHint(forceHide = null) {
    syncOlderHintFromScroll({
      returnToTopEl: this._host._pageShellRegionElement(
        "browse",
        "#browse-return-top",
      ),
      list: this._host._pageShellRegionElement("browse", "#list"),
      browse: this._host._pageShellRegion("browse"),
      tab: this._host._tab,
      forceHide,
    });
  }

  setListHtmlIfChanged(list, html) {
    if (!list) return false;
    const nextHtml = String(html || "");
    if (
      this._lastListElement === list &&
      this._host._lastRenderedListHtml === nextHtml
    ) {
      return false;
    }
    replaceListMarkupPreservingMedia(list, nextHtml);
    applyLocalizedText(list, this._host._localization?.t);
    this._lastListElement = list;
    this._host._lastRenderedListHtml = nextHtml;
    return true;
  }

  _renderRecordingsTabList(list) {
    // Preserve the list DOM while its recording is open in the viewer.
    const popupPlaying = this._host._popupLifecycleController?.playing?.();
    if (
      this._host._$("#viewer")?.style.display !== "none" &&
      popupPlaying?.rec != null
    ) {
      return;
    }
    this._renderRecordings(list);
  }

  _renderKeptList(list) {
    const kept = this._host._browseFilterController.filteredKept();
    this.renderListLabel();
    this._renderStandardListMarkup(list, {
      items: kept,
      emptyMessage: "No favorites",
      emptyMessageKey: "runtime.browse.noFavorites",
      emptyHint: "star an event to add it to Favorites",
      emptyHintKey: "runtime.browse.favoriteHint",
      buildContentHtml: (items) => this.renderKeptContent(items),
      emptyForceHide: false,
      contentForceHide: false,
      syncOnContent: true,
    });
  }

  _renderEventsList(list) {
    const allEvents = this._host._browseFilterController.filtered();
    const firstPaint = this._resolveBrowseFirstPaint(allEvents, list);
    if (firstPaint.skipRender) {
      this.renderListLabel(resolveListLabelTimestamp(allEvents));
      return;
    }
    const events = firstPaint.items;
    this.renderListLabel(resolveListLabelTimestamp(events));
    this._renderStandardListMarkup(list, {
      items: events,
      emptyMessage: this._host._loading
        ? "Loading events…"
        : "No events in this window",
      emptyMessageKey: this._host._loading
        ? "runtime.browse.loadingEvents"
        : "runtime.browse.noEvents",
      buildContentHtml: (items) =>
        this.renderEventsContent(items, {
          exhausted: firstPaint.limited ? false : this._host._exhausted,
        }),
      emptyForceHide: false,
      contentForceHide: null,
      syncOnContent: false,
    });
    this._renderedBrowseKey = this._browseFirstPaintKey();
    if (firstPaint.scheduleKey) {
      this._scheduleBrowseFirstPaintCompletion(
        firstPaint.scheduleKey,
        list,
        {
          items: allEvents,
          signature: firstPaint.signature,
          getCurrentItems: () =>
            this._host._browseFilterController.filtered(),
          buildBatchMarkup: (items, isFinal) =>
            this.renderEventsContent(items, {
              exhausted: isFinal ? this._host._exhausted : false,
            }),
        },
      );
    }
  }

  _browseFirstPaintKey() {
    const tab = String(this._host._tab || "");
    if (tab !== "alerts" && tab !== "clips" && tab !== "snapshot") return "";
    const camera = String(
      this._host._activeCam?.entity || this._host._cc?.()?.cam || "",
    );
    const day = String(this._host._calSelectedDay || "current");
    const mode = String(this._host._eventsMode || "camera");
    if (tab === "alerts") {
      const content = String(
        this._host._activeCam?.alerts_content || "alerts_only",
      );
      const label = String(this._host._filterLabel || "all");
      const zone = String(this._host._filterZone || "all");
      const favorites = this._host._favOnly === true ? "favorites" : "all";
      const groupMode = this._host._isGridMixedListMode?.()
        ? "grid-mixed"
        : "single";
      const member = String(this._host._activeGroupMemberOverride || "");
      return `${camera}|${mode}|${day}|${tab}|${content}|${label}|${zone}|${favorites}|${groupMode}|${member}`;
    }
    return `${camera}|${mode}|${day}|${tab}`;
  }

  _browseItemsSignature(entries) {
    const items = Array.isArray(entries) ? entries : [];
    const itemSignature = browseItemsSignature(items);
    if (this._host._tab !== "alerts") return itemSignature;

    const favoriteSignature = items.map((review) => {
      const eventId = String(review?.data?.detections?.[0] || "");
      if (!eventId) return ["", false];
      const sourceEvent =
        this._host._browseFilterController?.reviewSourceEvent?.(review) || null;
      return [eventId, sourceEvent?.retain_indefinitely === true];
    });
    return JSON.stringify([itemSignature, favoriteSignature]);
  }

  _resolveBrowseFirstPaint(entries, list = null) {
    const items = Array.isArray(entries) ? entries : [];
    const key = this._browseFirstPaintKey();
    const signature = this._browseItemsSignature(items);
    if (list && list !== this._browseFirstPaintList) {
      this._browseFirstPaintList = list;
      this._renderedBrowseKey = "";
      if (key) this._browseFirstPaintState.delete(key);
    }
    if (!key || items.length <= INITIAL_BROWSE_PAINT_LIMIT) {
      if (key && items.length > 0) {
        this._browseFirstPaintState.set(key, {
          status: "complete",
          signature,
          renderedCount: items.length,
          incremental: false,
        });
      }
      return { items, limited: false, scheduleKey: "", signature };
    }

    const state = this._browseFirstPaintState.get(key);
    if (state?.status === "complete") {
      const sameItems = state.signature === signature;
      if (
        state.incremental === true &&
        sameItems &&
        this._lastListElement === list &&
        this._renderedBrowseKey === key &&
        this._host._lastRenderedListHtml
      ) {
        return {
          items: [],
          limited: false,
          scheduleKey: "",
          signature,
          skipRender: true,
        };
      }
      if (sameItems && this._renderedBrowseKey !== key) {
        this._browseFirstPaintState.set(key, {
          status: "pending",
          signature,
          renderedCount: INITIAL_BROWSE_PAINT_LIMIT,
          incremental: false,
        });
        return {
          items: items.slice(0, INITIAL_BROWSE_PAINT_LIMIT),
          limited: true,
          scheduleKey: key,
          signature,
        };
      }
      state.signature = signature;
      state.renderedCount = items.length;
      state.incremental = false;
      return { items, limited: false, scheduleKey: "", signature };
    }
    if (state?.status === "pending" && state.signature === signature) {
      if (
        this._lastListElement === list &&
        this._renderedBrowseKey === key &&
        this._host._lastRenderedListHtml
      ) {
        return {
          items: [],
          limited: true,
          scheduleKey: "",
          signature,
          skipRender: true,
        };
      }
      return {
        items: items.slice(0, INITIAL_BROWSE_PAINT_LIMIT),
        limited: true,
        scheduleKey: "",
        signature,
      };
    }

    this._browseFirstPaintState.set(key, {
      status: "pending",
      signature,
      renderedCount: INITIAL_BROWSE_PAINT_LIMIT,
      incremental: false,
    });
    while (this._browseFirstPaintState.size > 64) {
      this._browseFirstPaintState.delete(
        this._browseFirstPaintState.keys().next().value,
      );
    }
    return {
      items: items.slice(0, INITIAL_BROWSE_PAINT_LIMIT),
      limited: true,
      scheduleKey: key,
      signature,
    };
  }

  _scheduleBrowseFirstPaintCompletion(
    key,
    list,
    {
      items = [],
      signature = "",
      getCurrentItems = () => items,
      buildBatchMarkup = () => "",
    } = {},
  ) {
    const appendNextBatch = () => {
      const state = this._browseFirstPaintState.get(key);
      if (state?.status !== "pending" || state.signature !== signature) return;
      const currentList = this._host._pageShellRegionElement?.(
        "browse",
        "#list",
      );
      if (this._browseFirstPaintKey() !== key || currentList !== list) {
        this._browseFirstPaintState.delete(key);
        return;
      }
      const start = state.renderedCount;
      const end = Math.min(
        items.length,
        start + BROWSE_PROGRESSIVE_BATCH_SIZE,
      );
      const isFinal = end >= items.length;
      const appended = this._appendProgressiveListMarkup(
        list,
        buildBatchMarkup(items.slice(start, end), isFinal),
        this._host._localization?.t,
      );
      if (!appended) {
        state.status = "complete";
        state.signature = "";
        state.renderedCount = items.length;
        this._host._renderList?.();
        return;
      }
      state.renderedCount = end;
      if (!isFinal) {
        this._scheduleBrowseProgressiveFrame(appendNextBatch);
        return;
      }
      state.status = "complete";
      state.incremental = true;
      if (this._browseItemsSignature(getCurrentItems()) !== signature) {
        this._host._renderList?.();
      }
    };
    if (typeof globalThis.requestAnimationFrame === "function") {
      globalThis.requestAnimationFrame(() =>
        globalThis.requestAnimationFrame(appendNextBatch),
      );
      return;
    }
    setTimeout(appendNextBatch, 0);
  }

  _scheduleBrowseProgressiveFrame(callback) {
    if (typeof globalThis.requestAnimationFrame === "function") {
      globalThis.requestAnimationFrame(callback);
      return;
    }
    setTimeout(callback, 0);
  }

  _renderStandardListMarkup(
    list,
    {
      items,
      emptyMessage,
      emptyMessageKey = "",
      emptyHint = "",
      emptyHintKey = "",
      buildContentHtml,
      emptyForceHide = null,
      contentForceHide = null,
      syncOnContent = false,
    } = {},
  ) {
    const listIsCurrent = () =>
      this._host._pageShellRegionElement?.("browse", "#list") === list;
    const syncOlderHint = createOlderHintSyncer((forceHide) => {
      if (listIsCurrent()) this.syncOlderHint(forceHide);
    });
    const renderState = resolveListMarkup({
      items,
      emptyMessage,
      emptyHint,
      buildContentHtml,
    });
    const html = renderState.isEmpty
      ? buildBrowseEmptyMarkup({
          message: emptyMessage,
          messageKey: emptyMessageKey,
          hint: emptyHint,
          hintKey: emptyHintKey,
        })
      : renderState.html;
    applyListMarkupWithOlderHint({
      setHtml: (nextHtml) => this.setListHtmlIfChanged(list, nextHtml),
      html,
      isEmpty: renderState.isEmpty,
      syncOlderHint,
      emptyForceHide,
      contentForceHide,
      syncOnContent,
    });
  }

  _renderRecordings(list) {
    this.renderListLabel(this._host._winEnd);
    const recordings = this._host._recordingsViewRows(this._host._recordings);
    const syncOlderHint = createOlderHintSyncer((forceHide) => {
      if (
        this._host._pageShellRegionElement?.("browse", "#list") === list
      ) {
        this.syncOlderHint(forceHide);
      }
    });
    const html = this._host._recordingsListMarkup(
      recordings,
      this._host._loading
        ? "Loading recordings…"
        : "No recordings in the last 24 hours",
    );
    applyListMarkupWithOlderHint({
      setHtml: (nextHtml) => this.setListHtmlIfChanged(list, nextHtml),
      html,
      isEmpty: !recordings.length,
      syncOlderHint,
      emptyForceHide: true,
      contentForceHide: false,
      syncOnContent: false,
    });
    if (!recordings.length && typeof this._host._localization?.t === "function") {
      setLocalizedText(
        list.querySelector?.(".empty"),
        this._host._loading
          ? "runtime.browse.loadingRecordings"
          : "runtime.browse.noRecordings",
        this._host._localization.t,
      );
    }
    this._host._recordingsBrowseNavController?.scheduleBrowseNavUpdate?.();
  }

  _renderReviews(list) {
    const showAllReviews =
      this._host._activeCam?.alerts_content === "all_reviews";
    const filteredReviews =
      this._host._browseFilterController.filteredReviews();
    const emptyText = showAllReviews
      ? this._host._loading
        ? "Loading reviews…"
        : "No reviews in this window"
      : this._host._loading
        ? "Loading alerts…"
        : "No alerts in this window";
    const emptyMessageKey = showAllReviews
      ? this._host._loading
        ? "runtime.browse.loadingReviews"
        : "runtime.browse.noReviews"
      : this._host._loading
        ? "runtime.browse.loadingAlerts"
        : "runtime.browse.noAlerts";
    const allReviews = [...filteredReviews].sort(
      (a, b) => b.start_time - a.start_time,
    );
    const firstPaint = this._resolveBrowseFirstPaint(allReviews, list);
    if (firstPaint.skipRender) {
      this.renderListLabel(resolveListLabelTimestamp(allReviews));
      return;
    }
    const reviews = firstPaint.items;

    this.renderListLabel(resolveListLabelTimestamp(reviews));
    this._renderStandardListMarkup(list, {
      items: reviews,
      emptyMessage: emptyText,
      emptyMessageKey,
      buildContentHtml: (items) => this.renderReviewsContent(items),
      emptyForceHide: true,
      contentForceHide: false,
      syncOnContent: false,
    });
    this._renderedBrowseKey = this._browseFirstPaintKey();
    if (firstPaint.scheduleKey) {
      this._scheduleBrowseFirstPaintCompletion(
        firstPaint.scheduleKey,
        list,
        {
          items: allReviews,
          signature: firstPaint.signature,
          getCurrentItems: () => [
            ...this._host._browseFilterController.filteredReviews(),
          ].sort((a, b) => b.start_time - a.start_time),
          buildBatchMarkup: (items) => this.renderReviewsContent(items),
        },
      );
    }
  }
}
