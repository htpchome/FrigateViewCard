export function watchMediaFirstFrame({
  mediaRoot,
  findVideo,
  isDestroyed = () => false,
  onReady,
  pollMs = 80,
} = {}) {
  if (!mediaRoot || typeof findVideo !== "function") return () => {};
  if (typeof onReady !== "function") return () => {};

  let disposed = false;
  let pollT = null;
  let video = null;
  let frameCallbackId = null;
  const eventNames = ["loadeddata", "canplay", "playing"];

  const cleanupVideoListeners = () => {
    if (!video) return;
    for (const eventName of eventNames) {
      video.removeEventListener?.(eventName, finish);
    }
    if (
      frameCallbackId != null &&
      typeof video.cancelVideoFrameCallback === "function"
    ) {
      try {
        video.cancelVideoFrameCallback(frameCallbackId);
      } catch (_) {}
    }
    frameCallbackId = null;
  };
  const cleanup = () => {
    disposed = true;
    if (pollT) clearTimeout(pollT);
    pollT = null;
    cleanupVideoListeners();
  };
  const finish = () => {
    if (disposed || isDestroyed()) return;
    cleanup();
    onReady();
  };
  const bind = () => {
    if (disposed || isDestroyed() || !mediaRoot.isConnected) return;
    video = findVideo(mediaRoot) || null;
    if (!video) {
      pollT = setTimeout(bind, Math.max(16, Number(pollMs) || 80));
      return;
    }
    const hasDecodedFrame =
      Number(video.readyState || 0) >= 2 &&
      (Number(video.videoWidth || 0) > 0 ||
        Number(video.currentTime || 0) > 0);
    if (hasDecodedFrame) {
      finish();
      return;
    }
    for (const eventName of eventNames) {
      video.addEventListener?.(eventName, finish, { once: true });
    }
    if (typeof video.requestVideoFrameCallback === "function") {
      try {
        frameCallbackId = video.requestVideoFrameCallback(() => finish());
      } catch (_) {}
    }
  };

  bind();
  return cleanup;
}

export function waitForMediaStart(
  mediaRoot,
  timeoutMs = 3500,
  {
    minCurrentTime = 0.05,
    minDecodedFrames = 1,
    requireReadyState = 0,
    strict = false,
    abortSignal = null,
    resolveVideo,
    onVideoReady,
  } = {},
) {
  if (typeof resolveVideo !== "function") {
    return Promise.resolve(false);
  }

  const minimumCurrentTime = Number(minCurrentTime ?? 0.05);
  const minimumDecodedFrames = Number(minDecodedFrames ?? 1);
  const minimumReadyState = Number(requireReadyState ?? 0);
  const strictReadiness = strict === true;
  const signal = abortSignal || null;

  return new Promise((resolve) => {
    let settled = false;
    let frameCallbackBound = false;
    let eventBound = false;
    let boundVideo = null;
    let frameCallbackVideo = null;
    let frameCallbackId = null;
    let finish = null;
    let onAbort = null;
    let tick = null;
    let timeout = null;

    const clearVideoBindings = () => {
      if (boundVideo && finish) {
        boundVideo.removeEventListener?.("loadeddata", finish);
        boundVideo.removeEventListener?.("canplay", finish);
        boundVideo.removeEventListener?.("playing", finish);
        boundVideo.removeEventListener?.("timeupdate", finish);
      }
      if (
        frameCallbackVideo &&
        frameCallbackId != null &&
        typeof frameCallbackVideo.cancelVideoFrameCallback === "function"
      ) {
        frameCallbackVideo.cancelVideoFrameCallback(frameCallbackId);
      }
      boundVideo = null;
      frameCallbackVideo = null;
      frameCallbackId = null;
      finish = null;
      frameCallbackBound = false;
      eventBound = false;
    };

    const done = (ok, video = null) => {
      if (settled) return;
      settled = true;
      if (tick != null) clearInterval(tick);
      if (timeout != null) clearTimeout(timeout);
      clearVideoBindings();
      if (signal && onAbort) {
        try {
          signal.removeEventListener("abort", onAbort);
        } catch (_) {}
      }
      if (ok && video && typeof onVideoReady === "function") {
        try {
          onVideoReady(video);
        } catch (_) {}
      }
      resolve(ok);
    };

    if (signal) {
      onAbort = () => done(false);
      if (signal.aborted) {
        done(false);
        return;
      }
      signal.addEventListener("abort", onAbort, { once: true });
    }

    tick = setInterval(() => {
      const video = resolveVideo(mediaRoot);
      if (!video) return;
      if (boundVideo && boundVideo !== video) clearVideoBindings();
      if (!frameCallbackBound && video.requestVideoFrameCallback) {
        frameCallbackBound = true;
        frameCallbackVideo = video;
        frameCallbackId = video.requestVideoFrameCallback(() =>
          done(true, video),
        );
      }
      if (!eventBound) {
        eventBound = true;
        boundVideo = video;
        finish = () => {
          if (!strictReadiness) done(true, video);
        };
        video.addEventListener("loadeddata", finish, { once: true });
        video.addEventListener("canplay", finish, { once: true });
        video.addEventListener("playing", finish, { once: true });
        video.addEventListener("timeupdate", finish, { once: true });
      }
      const decoded =
        Number(video.webkitDecodedFrameCount) ||
        Number(video.getVideoPlaybackQuality?.().totalVideoFrames) ||
        0;
      const ready = Number(video.readyState) || 0;
      const timeOk = video.currentTime >= minimumCurrentTime;
      const decodeOk = decoded >= minimumDecodedFrames;
      if (ready >= minimumReadyState && (timeOk || decodeOk)) {
        done(true, video);
      }
    }, 180);
    timeout = setTimeout(() => done(false), timeoutMs);
  });
}
