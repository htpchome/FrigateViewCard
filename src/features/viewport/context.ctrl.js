export class ViewportContextController {
  constructor(host) {
    this._host = host;
  }

  isCardVisible() {
    if (!this._host.isConnected) return false;
    if (document.visibilityState === "hidden") return false;
    const style = getComputedStyle(this._host);
    if (style.display === "none" || style.visibility === "hidden") {
      return false;
    }
    const rect = this._host.getBoundingClientRect();
    return rect.width > 2 && rect.height > 2;
  }

  isMobilePhoneViewport() {
    const width = Number(this._host._cardWidth || window.innerWidth || 0);
    return width > 0 && width < 420;
  }

  isMobileTabletViewport() {
    const coarse =
      window.matchMedia?.("(pointer: coarse)")?.matches ||
      window.matchMedia?.("(any-pointer: coarse)")?.matches ||
      false;
    const width = window.innerWidth || 0;
    const height = window.innerHeight || 0;
    const maxEdge = Math.max(width, height);
    const minEdge = Math.min(width, height);
    return coarse && maxEdge <= 1400 && minEdge <= 1100;
  }

  isLandscapeViewport() {
    return (
      window.matchMedia?.("(orientation: landscape)")?.matches ||
      (window.innerWidth || 0) > (window.innerHeight || 0)
    );
  }
}
