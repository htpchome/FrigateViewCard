import { activateStandardPageRouteLifecycle } from "../navigation/route-lifecycle.js";

export class WideViewPageController {
  constructor(host, constants, options = {}) {
    this._host = host;
    this._constants = constants;
    this._companionController = options.companionController || null;
  }

  activateWideViewPageRoute(context = {}) {
    activateStandardPageRouteLifecycle({
      host: this._host,
      context,
      previewPageId: this._constants.PAGE_IDS.preview,
      applyRouteFrame: () => this._applyWideViewRouteFrame(),
    });
    this.startCompanionMode();
  }

  buildCompanionRegionMarkup() {
    return this._companionController?.buildRegionMarkup?.() || "";
  }

  renderCompanionCameras() {
    this._companionController?.render?.();
  }

  teardownCompanionMedia() {
    this._companionController?.teardownMedia?.();
  }

  startCompanionMode() {
    this._companionController?.start?.();
  }

  stopCompanionMode() {
    this._companionController?.stop?.();
  }

  handleCompanionRealtimeMessage(msg) {
    this._companionController?.handleRealtimeMessage?.(msg);
  }

  handleCompanionHaReviewStatus(entity, severity) {
    return (
      this._companionController?.handleHaReviewStatus?.(entity, severity) ===
      true
    );
  }

  handleCompanionHassUpdate() {
    this._companionController?.handleHassUpdate?.();
  }

  applyCompanionConfigUpdate(options = {}) {
    this._companionController?.applyConfigUpdate?.(options);
  }

  companionLiveCamerasEnabled() {
    return this._companionController?.liveCamerasEnabled?.() === true;
  }

  companionAlertTakeoverEnabled() {
    return this._companionController?.alertTakeoverEnabled?.() === true;
  }

  toggleCompanionAlertTakeover() {
    return this._companionController?.toggleAlertTakeover?.() === true;
  }

  selectCompanionCamera(index) {
    this._companionController?.selectCamera?.(index);
  }

  _applyWideViewRouteFrame() {
    this._host._applyPreviewShellVisibility();
    this.applyStyleLayoutAndWideSyncForCard();
  }

  applyStyleLayoutForCard() {
    this._host._applyCardStyle();
    this.applyLayoutModeForCard();
  }

  applyLayoutAndWideSyncForCard() {
    this.applyLayoutModeForCard();
    this.syncColHeightIfWideView();
  }

  applyStyleLayoutAndWideSyncForCard() {
    this.applyStyleLayoutForCard();
    this.syncColHeightIfWideView();
  }

  applyLayoutModeForCard() {
    const layout = this._host.shadowRoot?.querySelector("#layout");
    if (!layout) return;
    this.applyWideLayoutMode(layout, this._host._config?.col_left_width_pct);
  }

  syncColHeightIfWideView() {
    if (!this.isWideViewPageActive()) return;
    this.syncColHeight();
  }

  syncColHeight() {
    requestAnimationFrame(() => {
      const l = this._host.shadowRoot?.querySelector(".col-left");
      const r = this._host.shadowRoot?.querySelector(".col-right");
      if (!l || !r) return;
      const h = l.offsetHeight;
      if (h > 0) r.style.maxHeight = h + "px";
    });
  }

  isWideViewPageActive() {
    return this._host._pageId === this._constants.PAGE_IDS.wideView;
  }

  wideViewLayoutState(leftWidthPct) {
    if (!this.isWideViewPageActive()) {
      return { isWide: false, leftWidth: "", rightWidth: "" };
    }

    const pct = Math.min(Math.max(parseInt(leftWidthPct, 10) || 50, 10), 90);
    return {
      isWide: true,
      leftWidth: `${pct}%`,
      rightWidth: `${100 - pct}%`,
    };
  }

  applyWideLayoutMode(layout, leftWidthPct) {
    if (!layout) return;

    const wideLayout = this.wideViewLayoutState(leftWidthPct);
    layout.classList.toggle("wide-view", wideLayout.isWide);

    const colL = layout.querySelector(".col-left");
    const colR = layout.querySelector(".col-right");
    if (colL && colR) {
      if (wideLayout.isWide) {
        colL.style.width = wideLayout.leftWidth;
        colR.style.width = wideLayout.rightWidth;
      } else {
        colL.style.width = "";
        colR.style.width = "";
      }
    }
  }

  initResizeHandle() {
    const handle = this._host._$("#resize-handle");
    if (!handle) return;
    let dragging = false;
    let startX = 0;
    let startLeftWidth = 0;
    let layoutWidth = 0;
    let colL = null;
    let colR = null;

    const onMouseDown = (e) => {
      e.preventDefault();
      dragging = true;
      startX = e.clientX;
      const layout = this._host._$("#layout");
      colL = this._host._$(".col-left");
      colR = this._host._$(".col-right");
      if (!layout || !colL || !colR) {
        dragging = false;
        return;
      }
      layoutWidth = layout.getBoundingClientRect().width;
      startLeftWidth = colL.getBoundingClientRect().width;
      handle.classList.add("active");
      document.addEventListener("mousemove", onMouseMove);
      document.addEventListener("mouseup", onMouseUp);
    };

    const onMouseMove = (e) => {
      if (!dragging) return;
      if (!colL || !colR || !layoutWidth) return;
      const minPct = 10;
      const maxPct = 90;
      const dx = e.clientX - startX;
      let newLeftWidth = startLeftWidth + dx;
      let pct = (newLeftWidth / layoutWidth) * 100;
      pct = Math.max(minPct, Math.min(maxPct, pct));
      if (colL) colL.style.width = pct + "%";
      if (colR) colR.style.width = 100 - pct + "%";
      this.syncColHeight();
    };

    const onMouseUp = () => {
      dragging = false;
      handle.classList.remove("active");
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
    };

    handle.addEventListener("mousedown", onMouseDown);
  }
}
