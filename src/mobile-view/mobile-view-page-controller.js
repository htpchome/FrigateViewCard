import { activateStandardPageRouteLifecycle } from "../navigation/standard-page-route-lifecycle.js";
import {
  buildStandardPageCamSwitcherMarkup,
  renderStandardPageCamSwitcher,
  renderStandardPageLegend,
  renderStandardPageListLabel,
  renderStandardPageStats,
  renderStandardPageSubtitle,
  standardPageListHeadingLabel,
  standardPageRecordingsHeadingLabel,
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

  syncMobileViewPageMarkup() {
    applyMobileViewPageMarkup({
      host: this._host,
      pageIds: this._constants.PAGE_IDS,
    });
  }
}
