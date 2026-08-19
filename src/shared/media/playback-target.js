export const PLAYBACK_TARGET_CAST = "cast";
export const PLAYBACK_TARGET_AIRPLAY = "airplay";

const GOOGLE_CAST_SCRIPT_ID = "fvc-google-cast-sender";
const GOOGLE_CAST_SCRIPT_URL =
  "https://www.gstatic.com/cv/js/sender/v1/cast_sender.js?loadCastFramework=1";
const DEFAULT_SOURCE_TTL_MS = 5 * 60 * 1000;
const MAX_CACHED_SOURCES = 12;

const googleCastFrameworkState = { promise: null };

const isAppleMobileBrowser = (navigatorObj) =>
  /iPad|iPhone|iPod/i.test(String(navigatorObj?.userAgent || ""));

const isMicrosoftEdgeBrowser = (navigatorObj) =>
  /Edg(?:A|iOS)?\//i.test(String(navigatorObj?.userAgent || ""));

const googleCastEnvironment = (windowObj) => {
  const framework = windowObj?.cast?.framework;
  const media = windowObj?.chrome?.cast?.media;
  if (!framework?.CastContext || !media?.MediaInfo || !media?.LoadRequest) {
    return null;
  }
  return {
    framework,
    media,
    chromeCast: windowObj.chrome.cast,
  };
};

export function resolveBrowserPlaybackTargetSupport({
  video = null,
  windowObj = globalThis.window,
  navigatorObj = globalThis.navigator,
  castFrameworkReady = null,
} = {}) {
  const airplay =
    typeof video?.webkitShowPlaybackTargetPicker === "function" ||
    typeof windowObj?.HTMLVideoElement?.prototype
      ?.webkitShowPlaybackTargetPicker === "function";
  const castBrowserSupported =
    !isAppleMobileBrowser(navigatorObj) &&
    !isMicrosoftEdgeBrowser(navigatorObj);
  const frameworkAvailable = !!googleCastEnvironment(windowObj);
  const likelyCastBrowser = castBrowserSupported && !!windowObj?.chrome;
  return {
    airplay,
    cast:
      castBrowserSupported &&
      (frameworkAvailable ||
        (castFrameworkReady !== false && likelyCastBrowser)),
    frameworkAvailable,
    likelyCastBrowser,
  };
}

export function configureGoogleCastFramework(windowObj = globalThis.window) {
  const env = googleCastEnvironment(windowObj);
  if (!env) return false;
  try {
    env.framework.CastContext.getInstance().setOptions({
      receiverApplicationId:
        env.chromeCast.media.DEFAULT_MEDIA_RECEIVER_APP_ID,
      autoJoinPolicy: env.chromeCast.AutoJoinPolicy.ORIGIN_SCOPED,
    });
    return true;
  } catch (_) {
    return false;
  }
}

export function ensureGoogleCastFramework({
  windowObj = globalThis.window,
  documentObj = globalThis.document,
  timeoutMs = 8000,
} = {}) {
  const navigatorObj = windowObj?.navigator;
  if (
    isAppleMobileBrowser(navigatorObj) ||
    isMicrosoftEdgeBrowser(navigatorObj)
  ) {
    return Promise.resolve(false);
  }
  if (configureGoogleCastFramework(windowObj)) {
    return Promise.resolve(true);
  }
  const support = resolveBrowserPlaybackTargetSupport({
    windowObj,
    navigatorObj: windowObj?.navigator,
    castFrameworkReady: null,
  });
  if (!support.likelyCastBrowser || !documentObj?.head) {
    return Promise.resolve(false);
  }
  if (googleCastFrameworkState.promise) {
    return googleCastFrameworkState.promise;
  }

  googleCastFrameworkState.promise = new Promise((resolve) => {
    let settled = false;
    let timeout = null;
    let readinessPoll = null;
    const previousCallback = windowObj.__onGCastApiAvailable;
    const finish = (available) => {
      if (settled) return;
      settled = true;
      if (timeout) clearTimeout(timeout);
      if (readinessPoll) clearInterval(readinessPoll);
      if (windowObj.__onGCastApiAvailable === onAvailable) {
        windowObj.__onGCastApiAvailable = previousCallback;
      }
      resolve(Boolean(available));
    };
    const finishWhenReady = () => {
      if (configureGoogleCastFramework(windowObj)) finish(true);
    };
    const onAvailable = (available, errorInfo) => {
      try {
        previousCallback?.(available, errorInfo);
      } catch (_) {}
      if (!available) {
        finish(false);
        return;
      }
      finishWhenReady();
    };
    windowObj.__onGCastApiAvailable = onAvailable;

    let script = documentObj.getElementById?.(GOOGLE_CAST_SCRIPT_ID);
    if (!script) {
      script = documentObj.createElement("script");
      script.id = GOOGLE_CAST_SCRIPT_ID;
      script.async = true;
      script.src = GOOGLE_CAST_SCRIPT_URL;
      script.addEventListener?.("error", () => finish(false), { once: true });
      documentObj.head.appendChild(script);
    }
    script.addEventListener?.("load", finishWhenReady, { once: true });
    readinessPoll = setInterval(finishWhenReady, 100);
    timeout = setTimeout(() => {
      finish(configureGoogleCastFramework(windowObj));
    }, timeoutMs);
  });
  return googleCastFrameworkState.promise;
}

export function buildGoogleCastLoadRequest({
  source,
  windowObj = globalThis.window,
} = {}) {
  const env = googleCastEnvironment(windowObj);
  if (!env || !source?.url) return null;
  const mediaInfo = new env.media.MediaInfo(
    source.url,
    source.contentType || "video/mp4",
  );
  if (source.streamType && env.media.StreamType?.[source.streamType]) {
    mediaInfo.streamType = env.media.StreamType[source.streamType];
  }
  if (source.title && env.media.GenericMediaMetadata) {
    const metadata = new env.media.GenericMediaMetadata();
    metadata.title = source.title;
    mediaInfo.metadata = metadata;
  }
  const request = new env.media.LoadRequest(mediaInfo);
  request.autoplay = true;
  return request;
}

export function promptGoogleCastSource({
  source,
  windowObj = globalThis.window,
} = {}) {
  const env = googleCastEnvironment(windowObj);
  if (!env) return Promise.resolve(false);

  const castContext = env.framework.CastContext.getInstance();
  const loadIntoSession = (session) => {
    const request = buildGoogleCastLoadRequest({ source, windowObj });
    if (!session || !request) return false;
    return Promise.resolve(session.loadMedia(request)).then(() => true);
  };
  const currentSession = castContext.getCurrentSession();
  if (currentSession) return loadIntoSession(currentSession);

  try {
    const sessionRequest = castContext.requestSession();
    return Promise.resolve(sessionRequest).then(() =>
      loadIntoSession(castContext.getCurrentSession()),
    );
  } catch (error) {
    return Promise.reject(error);
  }
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

export class BrowserPlaybackTargetController {
  constructor({
    getContext,
    resolveSource,
    getMount,
    createVideo = () => globalThis.document?.createElement?.("video"),
    prepareCast = () => ensureGoogleCastFramework(),
    promptCast = (source) => promptGoogleCastSource({ source }),
    promptAirPlay = (video) => promptAirPlayVideo(video),
    getWindow = () => globalThis.window,
    getNavigator = () => globalThis.navigator,
    getNowMs = () => Date.now(),
    onSupportChange = () => {},
    onStatus = () => {},
  } = {}) {
    this._getContext = getContext;
    this._resolveSource = resolveSource;
    this._getMount = getMount;
    this._createVideo = createVideo;
    this._prepareCast = prepareCast;
    this._promptCast = promptCast;
    this._promptAirPlay = promptAirPlay;
    this._getWindow = getWindow;
    this._getNavigator = getNavigator;
    this._getNowMs = getNowMs;
    this._onSupportChange = onSupportChange;
    this._onStatus = onStatus;
    this._sources = new Map();
    this._sourceInFlight = new Map();
    this._videos = new Map();
    this._castReady = null;
    this._castWarmPromise = null;
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
      video.removeAttribute?.("src");
      video.load?.();
    } catch (_) {}
    video.remove?.();
    this._videos.delete(scope);
  }

  getSupport() {
    const support = resolveBrowserPlaybackTargetSupport({
      windowObj: this._getWindow?.(),
      navigatorObj: this._getNavigator?.(),
      castFrameworkReady: this._castReady,
    });
    return {
      airplay: support.airplay,
      cast: support.cast,
    };
  }

  _emitSupport() {
    this._onSupportChange?.(this.getSupport());
  }

  _warmCast() {
    if (this._castWarmPromise) return this._castWarmPromise;
    this._castWarmPromise = Promise.resolve(this._prepareCast?.())
      .then((ready) => {
        this._castReady = Boolean(ready);
        this._emitSupport();
        return this._castReady;
      })
      .catch(() => {
        this._castReady = false;
        this._emitSupport();
        return false;
      });
    return this._castWarmPromise;
  }

  _freshSource(sourceKey) {
    const entry = this._sources.get(sourceKey);
    if (!entry || entry.expiresAt <= this._getNowMs()) {
      this._sources.delete(sourceKey);
      return null;
    }
    return entry.source;
  }

  prepare(scope = "live", { notifyErrors = false } = {}) {
    const context = this._contextForScope(scope);
    if (!context) return Promise.resolve(null);
    void this._warmCast();

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

  prompt(target, { scope = "live" } = {}) {
    const context = this._contextForScope(scope);
    const source = context ? this._freshSource(context.sourceKey) : null;
    if (!source) {
      void this.prepare(scope, { notifyErrors: true });
      this._onStatus?.(
        `Preparing video for ${target === PLAYBACK_TARGET_AIRPLAY ? "AirPlay" : "Cast"}. Tap again in a moment.`,
      );
      return Promise.resolve(false);
    }

    if (target === PLAYBACK_TARGET_AIRPLAY) {
      const video = this._videoForScope(scope);
      configureReceiverVideo(video, source);
      const prompted = this._promptAirPlay?.(video) === true;
      if (!prompted) {
        this._onStatus?.("AirPlay is not supported in this browser.");
      }
      return Promise.resolve(prompted);
    }
    if (target !== PLAYBACK_TARGET_CAST) return Promise.resolve(false);

    let result;
    try {
      result = this._promptCast?.(source);
    } catch (error) {
      result = Promise.reject(error);
    }
    return Promise.resolve(result)
      .then((prompted) => {
        if (!prompted) this._onStatus?.("Cast playback could not be started.");
        return Boolean(prompted);
      })
      .catch((error) => {
        const detail = String(
          error?.description || error?.code || error?.name || error?.message || "",
        ).trim();
        this._onStatus?.(
          detail
            ? `Cast playback failed: ${detail}`
            : "Cast playback failed before the receiver could load the video.",
        );
        return false;
      });
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
