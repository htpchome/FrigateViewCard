import {
  BrowserPlaybackTargetController,
  PLAYBACK_TARGET_AIRPLAY,
} from "../../shared/media/playback-target.js";

const POPUP_SCOPE = "popup";
const AIRPLAY_BUTTON_SELECTOR =
  "#popup-airplay-btn, #popup-media-airplay, #popup-mobile-airplay-btn";

const createBrowserPlaybackTargetController = (options) =>
  new BrowserPlaybackTargetController(options);

export class PopupPlaybackTargetController {
  constructor({
    getActiveContext = () => ({}),
    getMediaType = () => "",
    getPlaying = () => null,
    getRecordingRange = () => null,
    findEventById = () => null,
    buildContext = () => null,
    resolveSource = async () => null,
    getDisplayedVideo = () => null,
    getMount = () => null,
    queryAll = () => [],
    translate = () => "",
    isVideoMediaType = () => false,
    formatTitle = (mediaType) => `${mediaType || "video"} video`,
    onStatus = () => {},
    createTargetController = createBrowserPlaybackTargetController,
  } = {}) {
    this._getActiveContext = getActiveContext;
    this._getMediaType = getMediaType;
    this._getPlaying = getPlaying;
    this._getRecordingRange = getRecordingRange;
    this._findEventById = findEventById;
    this._buildContext = buildContext;
    this._getDisplayedVideo = getDisplayedVideo;
    this._queryAll = queryAll;
    this._translate = translate;
    this._isVideoMediaType = isVideoMediaType;
    this._formatTitle = formatTitle;
    this._targetController = createTargetController({
      getContext: (scope) => this.context(scope),
      resolveSource,
      getMount,
      onStatus,
      onSupportChange: () => this.syncButtons(),
    });
  }

  context(scope = POPUP_SCOPE) {
    if (scope !== POPUP_SCOPE) return null;

    const mediaType = this._getMediaType?.() || "";
    const playing = this._getPlaying?.() || null;
    const eventId = playing?.id || "";
    const event = eventId ? this._findEventById?.(eventId) : null;
    const recordingRange = this._getRecordingRange?.() || null;
    return this._buildContext?.({
      scope,
      activeContext: this._getActiveContext?.() || {},
      mediaType,
      playing,
      event,
      recordingRange,
      title: this._formatTitle?.(mediaType),
    });
  }

  syncButtons() {
    const support = this._targetController?.getSupport?.(POPUP_SCOPE) || {
      airplay: false,
    };
    for (const button of this._queryAll?.(AIRPLAY_BUTTON_SELECTOR) || []) {
      const translationKey = button.getAttribute?.("data-fvc-i18n-title");
      const baseTitle = translationKey
        ? this._translate?.(translationKey)
        : button.dataset?.playbackBaseTitle ||
          button.title ||
          "AirPlay video";
      if (button.dataset) button.dataset.playbackBaseTitle = baseTitle;
      button.hidden = !support.airplay;
      button.disabled = !support.airplay;
      button.setAttribute?.(
        "aria-hidden",
        support.airplay ? "false" : "true",
      );
      button.title = baseTitle;
    }
    return support;
  }

  prepare() {
    if (!this._isVideoMediaType?.(this._getMediaType?.())) return false;
    this._targetController?.observe?.(
      POPUP_SCOPE,
      this._getDisplayedVideo?.(),
    );
    void this._targetController?.prepare?.(POPUP_SCOPE);
    this.syncButtons();
    return true;
  }

  promptAirPlay(displayedVideo = null) {
    return this._targetController?.prompt?.(PLAYBACK_TARGET_AIRPLAY, {
      scope: POPUP_SCOPE,
      displayedVideo,
    });
  }

  release(scope = POPUP_SCOPE) {
    this._targetController?.release?.(scope);
  }

  dispose() {
    this._targetController?.dispose?.();
  }
}
