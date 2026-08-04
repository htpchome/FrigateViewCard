import { CleanupController } from "./cleanup.ctrl.js";

export class ListScrollController {
  constructor({
    list,
    browse,
    syncOlderHint,
    syncBrowseHeadFromScroll,
    getTab,
    isLoading,
    isExhausted,
    loadOlder,
  }) {
    this._list = list;
    this._browse = browse;
    this._syncOlderHint = syncOlderHint;
    this._syncBrowseHeadFromScroll = syncBrowseHeadFromScroll;
    this._getTab = getTab;
    this._isLoading = isLoading;
    this._isExhausted = isExhausted;
    this._loadOlder = loadOlder;
    this._cleanup = new CleanupController();
  }

  bind() {
    if (!this._list && !this._browse) return;
    if (this._list) {
      this._cleanup.addEventListener(this._list, "scroll", this._onScroll, {
        passive: true,
      });
    }
    if (this._browse && this._browse !== this._list) {
      this._cleanup.addEventListener(this._browse, "scroll", this._onScroll, {
        passive: true,
      });
    }
  }

  dispose() {
    this._cleanup.dispose();
  }

  _onScroll = () => {
    this._syncOlderHint?.();
    this._syncBrowseHeadFromScroll?.();
    const tab = this._getTab?.();
    if ((tab !== "clips" && tab !== "snapshot") || this._isLoading?.()) {
      return;
    }
    if (this._isExhausted?.()) return;

    const listScrollable =
      this._list && this._list.scrollHeight > this._list.clientHeight + 2;
    const scroller = listScrollable ? this._list : this._browse;
    if (!scroller) return;
    const nearBottom =
      scroller.scrollTop + scroller.clientHeight >= scroller.scrollHeight - 80;
    if (nearBottom) this._loadOlder?.();
  };
}
