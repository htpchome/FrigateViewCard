import { CAM_COLORS, cap, camDisplayName, labelColor } from "../../helpers.js";
import { resolveActiveDayLabelFromScroll } from "../../shared/list-render.js";
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
      void (
        this._host._recordingsBrowseNavController?.updateBrowseNav?.() ??
        this._host._updateRecordingsBrowseNav?.()
      );
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
}
