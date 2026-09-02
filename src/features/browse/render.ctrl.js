import { CAM_COLORS, cap, camDisplayName, labelColor } from "../../helpers.js";
import { INITIAL_BROWSE_PAINT_LIMIT } from "../../constants.js";
import {
  applyListMarkupWithOlderHint,
  createOlderHintSyncer,
  resolveActiveDayLabelFromScroll,
  resolveListLabelTimestamp,
  resolveListMarkup,
  runListPostRenderSync,
  syncDayLabelAlignmentFromScroll,
  syncOlderHintFromScroll,
} from "../../shared/list-render.js";
import {
  hasCameraPtz,
  hasPtzFocusCapability,
  hasPtzPanTiltCapability,
} from "../ptz/index.js";
import {
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
  constructor(host) {
    this._host = host;
    this._lastListElement = null;
    this._browseFirstPaintState = new Map();
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
    });
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

    syncDayLabelAlignmentFromScroll({ list, browse });
    const nextLabel = resolveActiveDayLabelFromScroll({ list, browse });
    if (nextLabel) label.textContent = nextLabel;
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
      this.syncOlderHint(true);
      return this._host._renderControlsSection(list);
    }

    if (this._host._tab === "recordings") {
      return this._renderRecordingsTabList(list);
    }

    if (this._host._tab === "alerts") {
      return this._renderReviews(list);
    }

    if (this._host._tab === "kept") {
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
      emptyMessage: "No kept events",
      emptyHint: "star an event to keep it",
      buildContentHtml: (items) => this.renderKeptContent(items),
      emptyForceHide: false,
      contentForceHide: false,
      syncOnContent: true,
    });
  }

  _renderEventsList(list) {
    const allEvents = this._host._browseFilterController.filtered();
    const firstPaint = this._resolveBrowseFirstPaint(allEvents);
    const events = firstPaint.items;
    this.renderListLabel(resolveListLabelTimestamp(events));
    this._renderStandardListMarkup(list, {
      items: events,
      emptyMessage: this._host._loading
        ? "Loading events…"
        : "No events in this window",
      buildContentHtml: (items) =>
        this.renderEventsContent(items, {
          exhausted: firstPaint.limited ? false : this._host._exhausted,
        }),
      emptyForceHide: false,
      contentForceHide: null,
      syncOnContent: false,
      syncBrowseHead: true,
      scheduleDeferredOlderHint: true,
    });
    if (firstPaint.scheduleKey) {
      this._scheduleBrowseFirstPaintCompletion(firstPaint.scheduleKey, list);
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

  _resolveBrowseFirstPaint(entries) {
    const items = Array.isArray(entries) ? entries : [];
    const key = this._browseFirstPaintKey();
    if (!key || items.length <= INITIAL_BROWSE_PAINT_LIMIT) {
      if (key && items.length > 0) {
        this._browseFirstPaintState.set(key, "complete");
      }
      return { items, limited: false, scheduleKey: "" };
    }

    const state = this._browseFirstPaintState.get(key);
    if (state === "complete") {
      return { items, limited: false, scheduleKey: "" };
    }
    if (state === "pending") {
      return {
        items: items.slice(0, INITIAL_BROWSE_PAINT_LIMIT),
        limited: true,
        scheduleKey: "",
      };
    }

    this._browseFirstPaintState.set(key, "pending");
    while (this._browseFirstPaintState.size > 64) {
      this._browseFirstPaintState.delete(
        this._browseFirstPaintState.keys().next().value,
      );
    }
    return {
      items: items.slice(0, INITIAL_BROWSE_PAINT_LIMIT),
      limited: true,
      scheduleKey: key,
    };
  }

  _scheduleBrowseFirstPaintCompletion(key, list) {
    const complete = () => {
      if (this._browseFirstPaintState.get(key) !== "pending") return;
      const currentList = this._host._pageShellRegionElement?.(
        "browse",
        "#list",
      );
      if (this._browseFirstPaintKey() !== key || currentList !== list) {
        this._browseFirstPaintState.delete(key);
        return;
      }
      this._browseFirstPaintState.set(key, "complete");
      this._host._renderList?.();
    };
    if (typeof globalThis.requestAnimationFrame === "function") {
      globalThis.requestAnimationFrame(() =>
        globalThis.requestAnimationFrame(complete),
      );
      return;
    }
    setTimeout(complete, 0);
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
      scheduleDeferredOlderHint = true,
    } = {},
  ) {
    const syncOlderHint = createOlderHintSyncer((forceHide) =>
      this.syncOlderHint(forceHide),
    );
    const renderState = resolveListMarkup({
      items,
      emptyMessage,
      emptyHint,
      buildContentHtml,
    });
    const hasContent = applyListMarkupWithOlderHint({
      setHtml: (html) => this.setListHtmlIfChanged(list, html),
      html: renderState.html,
      isEmpty: renderState.isEmpty,
      syncOlderHint,
      emptyForceHide,
      contentForceHide,
      syncOnContent,
    });
    if (!hasContent) return;

    runListPostRenderSync({
      syncBrowseHead: syncBrowseHead
        ? () => this.syncBrowseHeadFromScroll()
        : null,
      syncOlderHint,
      forceHide: contentForceHide,
      scheduleDeferredOlderHint,
    });
  }

  _renderRecordings(list) {
    this.renderListLabel(this._host._winEnd);
    const recordings = this._host._recordingsViewRows(this._host._recordings);
    const syncOlderHint = createOlderHintSyncer((forceHide) =>
      this.syncOlderHint(forceHide),
    );
    const html = this._host._recordingsListMarkup(
      recordings,
      this._host._loading
        ? "Loading recordings…"
        : "No recordings in the last 24 hours",
    );
    const hasContent = applyListMarkupWithOlderHint({
      setHtml: (nextHtml) => this.setListHtmlIfChanged(list, nextHtml),
      html,
      isEmpty: !recordings.length,
      syncOlderHint,
      emptyForceHide: true,
      contentForceHide: false,
      syncOnContent: true,
    });
    if (hasContent) {
      runListPostRenderSync({
        syncOlderHint,
        forceHide: false,
        scheduleDeferredOlderHint: true,
      });
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
    const allReviews = [...filteredReviews].sort(
      (a, b) => b.start_time - a.start_time,
    );
    const firstPaint = this._resolveBrowseFirstPaint(allReviews);
    const reviews = firstPaint.items;

    this.renderListLabel(resolveListLabelTimestamp(reviews));
    this._renderStandardListMarkup(list, {
      items: reviews,
      emptyMessage: emptyText,
      buildContentHtml: (items) => this.renderReviewsContent(items),
      emptyForceHide: true,
      contentForceHide: false,
      syncOnContent: false,
      scheduleDeferredOlderHint: true,
      syncBrowseHead: true,
    });
    if (firstPaint.scheduleKey) {
      this._scheduleBrowseFirstPaintCompletion(firstPaint.scheduleKey, list);
    }
  }
}
