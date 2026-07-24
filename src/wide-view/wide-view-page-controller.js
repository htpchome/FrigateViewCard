export class WideViewPageController {
  constructor(host, constants) {
    this._host = host;
    this._constants = constants;
  }

  activateWideViewPageRoute(context = {}) {
    this._host._singleViewPageController.activateStandardPageRoute(context);
  }

  syncColHeightIfWideView() {
    if (!this.isWideViewPageActive()) return;
    this._host._syncColHeight();
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
}
