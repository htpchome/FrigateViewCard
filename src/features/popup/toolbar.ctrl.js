export class PopupToolbarController {
  constructor({
    query,
    getMediaVideo = () => null,
    findVideoDeep = () => null,
    handleMediaControlClick = () => false,
    onTakeSnapshot = () => {},
    onTogglePictureInPicture = () => {},
    onPromptAirPlay = () => {},
    onToggleMute = () => {},
    onFullscreen = () => {},
    onCarouselNavigate = () => {},
    onShowControls = () => {},
  } = {}) {
    this._query = query;
    this._getMediaVideo = getMediaVideo;
    this._findVideoDeep = findVideoDeep;
    this._handleMediaControlClick = handleMediaControlClick;
    this._onTakeSnapshot = onTakeSnapshot;
    this._onTogglePictureInPicture = onTogglePictureInPicture;
    this._onPromptAirPlay = onPromptAirPlay;
    this._onToggleMute = onToggleMute;
    this._onFullscreen = onFullscreen;
    this._onCarouselNavigate = onCarouselNavigate;
    this._onShowControls = onShowControls;
  }

  handleClick(target) {
    if (target?.closest?.("#popup-take-snapshot-btn")) {
      void this._onTakeSnapshot();
      return true;
    }
    if (target?.closest?.("#popup-pip-btn")) {
      void this._onTogglePictureInPicture(this._getMediaVideo());
      this._onShowControls();
      return true;
    }
    if (
      target?.closest?.(
        "#popup-airplay-btn, #popup-media-airplay, #popup-mobile-airplay-btn",
      )
    ) {
      const viewer = this._query?.("#viewer");
      const displayedVideo =
        this._getMediaVideo() || this._findVideoDeep(viewer);
      void this._onPromptAirPlay(displayedVideo);
      this._onShowControls();
      return true;
    }
    if (
      target?.closest?.(
        "#mute-btn, #two-way-talk-mute-btn",
      )
    ) {
      this._onToggleMute();
      return true;
    }
    if (this._handleMediaControlClick(target)) return true;
    if (target?.closest?.("#popup-media-fs, #popup-mobile-fs-btn")) {
      const viewer = this._query?.("#viewer");
      this._onFullscreen(viewer?.closest?.(".popup-body") || viewer);
      this._onShowControls();
      return true;
    }
    const carouselNav = target?.closest?.("[data-carousel-dir]");
    if (carouselNav) {
      const direction = Number(carouselNav.dataset.carouselDir || 0);
      if (direction) this._onCarouselNavigate(direction);
      return true;
    }
    return false;
  }
}
