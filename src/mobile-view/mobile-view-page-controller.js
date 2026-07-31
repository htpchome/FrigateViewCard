import { activateStandardPageRouteLifecycle } from "../navigation/standard-page-route-lifecycle.js";
import {
  buildStandardPageCamSwitcherMarkup,
  renderStandardPageCamSwitcher,
  renderStandardPageEventsContent,
  renderStandardPageKeptContent,
  renderStandardPageLegend,
  renderStandardPageListLabel,
  renderStandardPageReviewsContent,
  renderStandardPageStickyDaySections,
  renderStandardPageStats,
  renderStandardPageSubtitle,
  syncStandardPageBrowseHeadFromScroll,
  standardPageListHeadingLabel,
  standardPageRecordingsHeadingLabel,
  standardPageShowStickyDayHeaders,
  standardPageSubtitleText,
  syncStandardPageStatus,
} from "../card/standard-page-renderer.js";
import { applyMobileViewPageMarkup } from "./mobile-view-page-markup.js";

export class MobileViewPageController {
  constructor(host, constants) {
    this._host = host;
    this._constants = constants;
  }

  activateMobileViewPageRoute(context = {}) {
    activateStandardPageRouteLifecycle({
      host: this._host,
      context,
      previewPageId: this._constants.PAGE_IDS.preview,
      applyRouteFrame: () => this._applyMobileViewRouteFrame(),
    });
  }

  _applyMobileViewRouteFrame() {
    this._host._applyPreviewShellVisibility();
    this._host._wideViewPageController.applyStyleLayoutAndWideSyncForCard();
    this.syncMobileViewPageMarkup();
  }

  camSwitcherMarkup({ includeStatus = true } = {}) {
    return buildStandardPageCamSwitcherMarkup(this._host, {
      includeStatus,
      mobile: true,
    });
  }

  renderCamSwitcher() {
    renderStandardPageCamSwitcher(this._host, { mobile: true });
  }

  syncStatus() {
    syncStandardPageStatus(this._host, { mobile: true });
  }

  renderStats() {
    renderStandardPageStats(this._host, { mobile: true });
  }

  subtitleText() {
    return standardPageSubtitleText(this._host, { mobile: true });
  }

  renderSubtitle() {
    renderStandardPageSubtitle(this._host, { mobile: true });
  }

  renderLegend() {
    renderStandardPageLegend(this._host);
  }

  listHeadingLabel(ts = null) {
    return standardPageListHeadingLabel(this._host, ts);
  }

  recordingsHeadingLabel(ts = null) {
    return standardPageRecordingsHeadingLabel(this._host, ts);
  }

  renderListLabel(ts = null) {
    renderStandardPageListLabel(this._host, ts);
  }

  showStickyDayHeaders() {
    return standardPageShowStickyDayHeaders(this._host);
  }

  renderStickyDaySections(items, renderItem) {
    return renderStandardPageStickyDaySections(this._host, items, renderItem);
  }

  renderEventsContent(items) {
    return renderStandardPageEventsContent(this._host, items);
  }

  renderKeptContent(items) {
    return renderStandardPageKeptContent(this._host, items);
  }

  renderReviewsContent(items) {
    return renderStandardPageReviewsContent(this._host, items);
  }

  syncBrowseHeadFromScroll() {
    syncStandardPageBrowseHeadFromScroll(this._host);
  }

  syncMobileViewPageMarkup() {
    applyMobileViewPageMarkup({
      host: this._host,
      pageIds: this._constants.PAGE_IDS,
    });
  }
}
