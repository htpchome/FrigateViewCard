export class LiveMediaToolbarController {
  constructor({
    onTogglePictureInPicture = () => {},
    onTakeSnapshot = () => {},
    onFullscreen = () => {},
  } = {}) {
    this._onTogglePictureInPicture = onTogglePictureInPicture;
    this._onTakeSnapshot = onTakeSnapshot;
    this._onFullscreen = onFullscreen;
  }

  handleClick(target) {
    if (target?.closest?.("#live-pip-btn")) {
      void this._onTogglePictureInPicture();
      return true;
    }
    if (target?.closest?.("#live-take-snapshot-btn")) {
      void this._onTakeSnapshot();
      return true;
    }
    if (target?.closest?.("#live-fs-btn")) {
      this._onFullscreen();
      return true;
    }
    return false;
  }
}
