export class MobileCamSwitcherController {
  constructor(options = {}) {
    this._isOpen =
      typeof options.isOpen === "function" ? options.isOpen : () => false;
    this._setOpen =
      typeof options.setOpen === "function" ? options.setOpen : () => {};
    this._renderCamSwitcher =
      typeof options.renderCamSwitcher === "function"
        ? options.renderCamSwitcher
        : () => {};
    this._pauseSlideshowForInteraction =
      typeof options.pauseSlideshowForInteraction === "function"
        ? options.pauseSlideshowForInteraction
        : () => {};
    this._switchCamera =
      typeof options.switchCamera === "function"
        ? options.switchCamera
        : () => Promise.resolve();
  }

  handleClickTarget(target) {
    const trigger = target?.closest?.("[data-mobile-cam-trigger]");
    if (trigger) {
      this._setOpen(!this._isOpen());
      this._renderCamSwitcher();
      return true;
    }

    const option = target?.closest?.("[data-mobile-camidx]");
    if (option) {
      const idx = Number(option.dataset.mobileCamidx);
      this._setOpen(false);
      if (Number.isInteger(idx) && idx >= 0) {
        this._pauseSlideshowForInteraction();
        void this._switchCamera(idx);
      } else {
        this._renderCamSwitcher();
      }
      return true;
    }

    return false;
  }

  closeIfOutside(target) {
    if (!this._isOpen()) return;
    const inPicker = target?.closest?.("[data-mobile-cam-picker]");
    if (inPicker) return;
    this.close();
  }

  close() {
    if (!this._isOpen()) return;
    this._setOpen(false);
    this._renderCamSwitcher();
  }
}
