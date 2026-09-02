export const PLAYBACK_TARGET_AIRPLAY = "airplay";

const DEFAULT_SOURCE_TTL_MS = 5 * 60 * 1000;
const MAX_CACHED_SOURCES = 12;

export function resolveBrowserPlaybackTargetSupport({
  video = null,
  windowObj = globalThis.window,
} = {}) {
  return {
    airplay:
      typeof video?.webkitShowPlaybackTargetPicker === "function" ||
      typeof windowObj?.HTMLVideoElement?.prototype
        ?.webkitShowPlaybackTargetPicker === "function",
  };
}

export function configureReceiverVideo(video, source) {
  if (!video || !source?.url) return false;
  video.preload = "none";
  video.playsInline = true;
  video.controls = false;
  video.disableRemotePlayback = false;
  video.setAttribute?.("playsinline", "");
  video.setAttribute?.("webkit-playsinline", "");
  video.setAttribute?.("x-webkit-airplay", "allow");
  if (video.src !== source.url) {
    video.src = source.url;
  }
  return true;
}

export function promptAirPlayVideo(video) {
  const prompt = video?.webkitShowPlaybackTargetPicker;
  if (typeof prompt !== "function") return false;
  try {
    video.load?.();
    prompt.call(video);
    return true;
  } catch (_) {
    return false;
  }
}

export function clearBrowserMediaSession(
  navigatorObj = globalThis.navigator,
) {
  const mediaSession = navigatorObj?.mediaSession;
  if (!mediaSession) return false;
  try {
    mediaSession.playbackState = "none";
    mediaSession.metadata = null;
    return true;
  } catch (_) {
    return false;
  }
}

export class BrowserPlaybackTargetController {
  constructor({
    getContext,
    resolveSource,
    getMount,
    createVideo = () => globalThis.document?.createElement?.("video"),
    promptAirPlay = (video) => promptAirPlayVideo(video),
    getWindow = () => globalThis.window,
    getNavigator = () => globalThis.navigator,
    getNowMs = () => Date.now(),
    onStatus = () => {},
  } = {}) {
    this._getContext = getContext;
    this._resolveSource = resolveSource;
    this._getMount = getMount;
    this._createVideo = createVideo;
    this._promptAirPlay = promptAirPlay;
    this._getWindow = getWindow;
    this._getNavigator = getNavigator;
    this._getNowMs = getNowMs;
    this._onStatus = onStatus;
    this._sources = new Map();
    this._sourceInFlight = new Map();
    this._videos = new Map();
  }

  _contextForScope(scope) {
    const context = this._getContext?.(scope) || {};
    const sourceKey = String(context.sourceKey || "").trim();
    return sourceKey ? { ...context, scope, sourceKey } : null;
  }

  _videoForScope(scope) {
    const existing = this._videos.get(scope);
    if (existing) {
      if (existing.video.isConnected === false) {
        this._getMount?.()?.appendChild?.(existing.video);
      }
      return existing.video;
    }
    const video = this._createVideo?.();
    if (!video) return null;
    video.className = "fvc-receiver-video";
    if (video.style) {
      video.style.cssText =
        "position:fixed;left:-10000px;top:-10000px;width:1px;height:1px;opacity:0;pointer-events:none";
    }
    const playOnWirelessTarget = () => {
      if (video.webkitCurrentPlaybackTargetIsWireless !== true) return;
      video.play?.().catch?.(() => {});
    };
    const releaseOnTerminal = () => this._releaseVideo(scope);
    const onWirelessTargetChanged = () => {
      if (video.webkitCurrentPlaybackTargetIsWireless === true) {
        playOnWirelessTarget();
        return;
      }
      this._releaseVideo(scope);
    };
    video.addEventListener?.(
      "webkitcurrentplaybacktargetiswirelesschanged",
      onWirelessTargetChanged,
    );
    video.addEventListener?.("loadedmetadata", playOnWirelessTarget);
    video.addEventListener?.("canplay", playOnWirelessTarget);
    video.addEventListener?.("ended", releaseOnTerminal);
    video.addEventListener?.("error", releaseOnTerminal);
    this._getMount?.()?.appendChild?.(video);
    this._videos.set(scope, {
      video,
      onWirelessTargetChanged,
      playOnWirelessTarget,
      releaseOnTerminal,
    });
    return video;
  }

  _releaseVideo(scope) {
    const entry = this._videos.get(scope);
    if (!entry) return;
    const wasWireless =
      entry.video.webkitCurrentPlaybackTargetIsWireless === true;
    const {
      video,
      onWirelessTargetChanged,
      playOnWirelessTarget,
      releaseOnTerminal,
    } = entry;
    video.removeEventListener?.(
      "webkitcurrentplaybacktargetiswirelesschanged",
      onWirelessTargetChanged,
    );
    video.removeEventListener?.("loadedmetadata", playOnWirelessTarget);
    video.removeEventListener?.("canplay", playOnWirelessTarget);
    video.removeEventListener?.("ended", releaseOnTerminal);
    video.removeEventListener?.("error", releaseOnTerminal);
    try {
      video.pause?.();
      video.disableRemotePlayback = true;
      video.setAttribute?.("x-webkit-airplay", "deny");
      if ("srcObject" in video) video.srcObject = null;
      video.removeAttribute?.("src");
      video.load?.();
    } catch (_) {}
    video.remove?.();
    this._videos.delete(scope);
    if (wasWireless) {
      clearBrowserMediaSession(this._getNavigator?.());
    }
  }

  getSupport() {
    return resolveBrowserPlaybackTargetSupport({
      windowObj: this._getWindow?.(),
    });
  }

  _freshSource(sourceKey) {
    const entry = this._sources.get(sourceKey);
    if (!entry || entry.expiresAt <= this._getNowMs()) {
      this._sources.delete(sourceKey);
      return null;
    }
    return entry.source;
  }

  prepare(scope = "popup", { notifyErrors = false } = {}) {
    const context = this._contextForScope(scope);
    if (!context) return Promise.resolve(null);

    const cached = this._freshSource(context.sourceKey);
    if (cached) return Promise.resolve(cached);
    const current = this._sourceInFlight.get(context.sourceKey);
    if (current) return current;

    const pending = Promise.resolve(this._resolveSource?.(context))
      .then((source) => {
        if (!source?.url) {
          throw new Error(
            source?.message || "A receiver-compatible video URL is unavailable.",
          );
        }
        this._sources.set(context.sourceKey, {
          source,
          expiresAt:
            this._getNowMs() +
            (Number(source.ttlMs) || DEFAULT_SOURCE_TTL_MS),
        });
        while (this._sources.size > MAX_CACHED_SOURCES) {
          this._sources.delete(this._sources.keys().next().value);
        }
        return source;
      })
      .catch((error) => {
        if (notifyErrors) {
          this._onStatus?.(
            error?.message || "The video could not be prepared for playback.",
          );
        }
        return null;
      })
      .finally(() => {
        this._sourceInFlight.delete(context.sourceKey);
      });
    this._sourceInFlight.set(context.sourceKey, pending);
    return pending;
  }

  prompt(target, { scope = "popup" } = {}) {
    if (target !== PLAYBACK_TARGET_AIRPLAY) return Promise.resolve(false);
    const context = this._contextForScope(scope);
    const source = context ? this._freshSource(context.sourceKey) : null;
    if (!source) {
      void this.prepare(scope, { notifyErrors: true });
      this._onStatus?.(
        "Preparing video for AirPlay. Tap again in a moment.",
      );
      return Promise.resolve(false);
    }

    const video = this._videoForScope(scope);
    configureReceiverVideo(video, source);
    const prompted = this._promptAirPlay?.(video) === true;
    if (!prompted) {
      this._onStatus?.("AirPlay is not supported in this browser.");
    }
    return Promise.resolve(prompted);
  }

  release(scope = "") {
    if (scope) {
      this._releaseVideo(scope);
      return;
    }
    for (const activeScope of [...this._videos.keys()]) {
      this._releaseVideo(activeScope);
    }
  }

  dispose() {
    this.release();
    this._sources.clear();
    this._sourceInFlight.clear();
  }
}
