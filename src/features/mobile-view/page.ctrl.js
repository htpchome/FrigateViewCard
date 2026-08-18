import { activateStandardPageRouteLifecycle } from "../navigation/route-lifecycle.js";
import {
  renderStandardPageEventsContent,
  renderStandardPageKeptContent,
  renderStandardPageLegend,
  renderStandardPageListLabel,
  renderStandardPageReviewsContent,
  renderStandardPageStickyDaySections,
  syncStandardPageBrowseHeadFromScroll,
  standardPageListHeadingLabel,
  standardPageRecordingsHeadingLabel,
  standardPageShowStickyDayHeaders,
} from "../browse/standard-renderer.js";
import { cap, camDisplayName } from "../../helpers.js";
import { ICONS } from "../../icons.js";
import {
  applyMobileViewPageMarkup,
  buildMobileViewCamSwitcherMarkup,
  resolveMobileViewEventsCountText,
  resolveMobileViewOnlineLabel,
  resolveMobileViewStatusColor,
  resolveMobileViewStreamTypeText,
  resolveMobileViewSubtitleText,
  resolveMobileViewTitleText,
} from "./page.tmpl.js";

const cameraName = (camera) => cap(camDisplayName(camera));

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
    const activeEntity = this._host._activeCam?.entity;
    const activeState = activeEntity
      ? this._host._hass?.states?.[activeEntity]
      : null;
    return buildMobileViewCamSwitcherMarkup({
      previewPageEnabled: this._host._isPreviewPageEnabled?.() === true,
      includeStatus,
      cameras: this._host._config.cameras,
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
    const element = this._host._pageShellRegion("cameraSwitcher");
    if (!element) return;
    element.style.display = "";
    element.innerHTML = this.camSwitcherMarkup({ includeStatus: true });
  }

  syncStatus() {
    const state =
      this._host._hass?.states?.[this._host._activeCam?.entity] || null;
    if (!state) return;

    const statusDot = this._host._pageShellRegionElement(
      "cameraSwitcher",
      "#on-dot",
    );
    const statusLabel = this._host._pageShellRegionElement(
      "cameraSwitcher",
      "#on-lbl",
    );
    const title = this._host._pageShellRegionElement(
      "information",
      "#info-title",
    );
    const online = state.state !== "unavailable";
    if (statusDot) {
      statusDot.style.color = resolveMobileViewStatusColor(online);
    }
    if (statusLabel) {
      statusLabel.textContent = resolveMobileViewOnlineLabel(online);
    }
    if (title) {
      title.textContent = resolveMobileViewTitleText({
        title: this._host._config.title,
        cameras: this._host._config.cameras,
        activeCamera: this._host._activeCam,
        getCameraName: cameraName,
      });
    }
  }

  renderStats() {
    const eventCount = this._host._pageShellRegionElement(
      "information",
      "#ev-count",
    );
    if (eventCount) {
      eventCount.textContent = resolveMobileViewEventsCountText(
        this._host._allDisplayEvents().length,
      );
    }
    const streamType = this._host._pageShellRegionElement(
      "cameraSwitcher",
      "#stream-type",
    );
    if (streamType) {
      streamType.textContent = resolveMobileViewStreamTypeText(
        this._host._activeStreamType,
      );
    }
  }

  subtitleText() {
    return resolveMobileViewSubtitleText(this._host._config);
  }

  renderSubtitle() {
    const subtitle = this._host._pageShellRegionElement(
      "information",
      "#tl-range",
    );
    if (!subtitle) return;
    subtitle.textContent = this.subtitleText();
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
