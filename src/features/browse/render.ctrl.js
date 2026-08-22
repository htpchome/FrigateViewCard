import { CAM_COLORS, cap, camDisplayName, labelColor } from "../../helpers.js";
import {
  applyListMarkupWithOlderHint,
  createOlderHintSyncer,
  resolveActiveDayLabelFromScroll,
  resolveListLabelTimestamp,
  resolveListMarkup,
  runListPostRenderSync,
  syncOlderHintFromScroll,
} from "../../shared/list-render.js";
import {
  hasCameraPtz,
  hasPtzFocusCapability,
  hasPtzPanTiltCapability,
  hasPtzZoomCapability,
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

const cameraName = (camera) => cap(camDisplayName(camera));

export class BrowseRenderController {
  constructor(host) {
    this._host = host;
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
        hasPtzZoomCapability(ptzInfo) ||
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
      const showButtons = this._host._isMobilePhoneViewport?.() !== true;
      if (previous) previous.style.display = showButtons ? "inline-flex" : "none";
      if (next) next.style.display = showButtons ? "inline-flex" : "none";
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

  renderEventsContent(items) {
    return buildBrowseEventsContentMarkup({
      items,
      showStickyDayHeaders: this.showStickyDayHeaders(),
      getDayKey: (timestamp) => this._host._dayKey(timestamp),
      getLabel: (timestamp) => this.listHeadingLabel(timestamp),
      renderItem: (item) => this._host._eventCardHTML(item, false),
      exhausted: this._host._exhausted,
    });
  }

  renderKeptContent(items) {
    return buildBrowseKeptContentMarkup({
      items,
      renderItem: (item) => this._host._eventCardHTML(item, false),
    });
  }

  renderReviewsContent(items) {
    return buildBrowseReviewsContentMarkup({
      items,
      getDayKey: (timestamp) => this._host._dayKey(timestamp),
      getLabel: (timestamp) => this.listHeadingLabel(timestamp),
      renderItem: (item) => this._host._reviewListItemHTML(item),
    });
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
      hintEl: this._host._pageShellRegionElement("footer", "#older-hint"),
      list: this._host._pageShellRegionElement("browse", "#list"),
      browse: this._host._pageShellRegion("browse"),
      tab: this._host._tab,
      forceHide,
    });
  }

  setListHtmlIfChanged(list, html) {
    if (!list) return false;
    const nextHtml = String(html || "");
    if (this._host._lastRenderedListHtml === nextHtml) return false;
    list.innerHTML = nextHtml;
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
    const events = this._host._browseFilterController.filtered();
    this.renderListLabel(resolveListLabelTimestamp(events));
    this._renderStandardListMarkup(list, {
      items: events,
      emptyMessage: "No events in this window",
      buildContentHtml: (items) => this.renderEventsContent(items),
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
      "No recordings in the last 24 hours",
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
      ? "No reviews in this window"
      : "No alerts in this window";
    const allReviews = [...filteredReviews].sort(
      (a, b) => b.start_time - a.start_time,
    );

    this.renderListLabel(resolveListLabelTimestamp(allReviews));
    this._renderStandardListMarkup(list, {
      items: allReviews,
      emptyMessage: emptyText,
      buildContentHtml: (items) => this.renderReviewsContent(items),
      emptyForceHide: true,
      contentForceHide: false,
      syncOnContent: false,
      scheduleDeferredOlderHint: true,
      syncBrowseHead: true,
    });
  }
}
