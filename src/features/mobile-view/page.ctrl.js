import { activateStandardPageRouteLifecycle } from "../navigation/route-lifecycle.js";
import { BrowseRenderController } from "../browse/render.ctrl.js";
import { cap, camDisplayName } from "../../helpers.js";
import { ICONS } from "../../icons.js";
import {
  applyMobileViewPageMarkup,
  buildMobileViewCamSwitcherMarkup,
  resolveMobileViewAlertsCountText,
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
    this._browseRenderController = new BrowseRenderController(host);
  }

  _usesGridText() {
    return (
      this._host._viewMode === "grid" &&
      this._host._isPreviewPageActive?.() !== true
    );
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
    const content = this._host._pageShellRegionElement(
      "cameraSwitcher",
      "[data-mobile-cam-switcher-content]",
    );
    if (!content) return;
    content.innerHTML = this.camSwitcherMarkup({ includeStatus: true });
  }

  syncStatus() {
    const title = this._host._pageShellRegionElement(
      "information",
      "#info-title",
    );
    if (title) {
      title.hidden = this._host._config.display_title === false;
      title.textContent = this.titleText();
    }

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
    const online = state.state !== "unavailable";
    if (statusDot) {
      statusDot.style.color = resolveMobileViewStatusColor(online);
    }
    if (statusLabel) {
      statusLabel.textContent = resolveMobileViewOnlineLabel(online);
    }
  }

  renderStats() {
    const alertCount = this._host._pageShellRegionElement(
      "information",
      "#alert-count",
    );
    if (alertCount) {
      alertCount.textContent = resolveMobileViewAlertsCountText(
        this._host._browseWindowLoaderController?.cameraAlertsCount?.(
          this._host._activeCam?.entity || "",
          { includeGroup: true },
        ) ?? 0,
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

  titleText() {
    return resolveMobileViewTitleText({
      title: this._host._config.title,
      activeCamera: this._host._activeCam,
      getCameraName: cameraName,
      gridMode: this._usesGridText(),
    });
  }

  subtitleText() {
    return resolveMobileViewSubtitleText({
      subtitle: this._host._config.subtitle,
      activeCamera: this._host._activeCam,
      getCameraName: cameraName,
      gridMode: this._usesGridText(),
    });
  }

  renderSubtitle() {
    const subtitle = this._host._pageShellRegionElement(
      "information",
      "#tl-range",
    );
    if (!subtitle) return;
    subtitle.hidden = this._host._config.display_subtitle === false;
    subtitle.textContent = this.subtitleText();
  }

  renderLegend() {
    this._browseRenderController.renderLegend();
  }

  listHeadingLabel(ts = null) {
    return this._browseRenderController.listHeadingLabel(ts);
  }

  recordingsHeadingLabel(ts = null) {
    return this._browseRenderController.recordingsHeadingLabel(ts);
  }

  renderListLabel(ts = null) {
    this._browseRenderController.renderListLabel(ts);
  }

  showStickyDayHeaders() {
    return this._browseRenderController.showStickyDayHeaders();
  }

  renderStickyDaySections(items, renderItem) {
    return this._browseRenderController.renderStickyDaySections(
      items,
      renderItem,
    );
  }

  renderEventsContent(items) {
    return this._browseRenderController.renderEventsContent(items);
  }

  renderKeptContent(items) {
    return this._browseRenderController.renderKeptContent(items);
  }

  renderReviewsContent(items) {
    return this._browseRenderController.renderReviewsContent(items);
  }

  syncBrowseHeadFromScroll() {
    this._browseRenderController.syncBrowseHeadFromScroll();
  }

  renderList() {
    this._browseRenderController.renderList();
  }

  setListHtmlIfChanged(list, html) {
    return this._browseRenderController.setListHtmlIfChanged(list, html);
  }

  syncOlderHint(forceHide = null) {
    this._browseRenderController.syncOlderHint(forceHide);
  }

  syncMobileViewPageMarkup() {
    applyMobileViewPageMarkup({
      host: this._host,
      pageIds: this._constants.PAGE_IDS,
    });
  }
}
