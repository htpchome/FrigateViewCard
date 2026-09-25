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
    requirePresentedFrame = false,
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
  const visualReadiness = requirePresentedFrame === true;
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
    let firstPaintFrame = null;
    let secondPaintFrame = null;
    let presentationPending = false;
    let progressVideo = null;
    let progressSamples = 0;
    let progressStartTime = null;
    let progressStartDecoded = null;
    let lastProgressTime = null;
    let lastProgressDecoded = null;

    const clearPaintBoundary = () => {
      if (firstPaintFrame != null) {
        globalThis.cancelAnimationFrame?.(firstPaintFrame);
      }
      if (secondPaintFrame != null) {
        globalThis.cancelAnimationFrame?.(secondPaintFrame);
      }
      firstPaintFrame = null;
      secondPaintFrame = null;
      presentationPending = false;
    };

    const resetProgressEvidence = (video = null) => {
      progressVideo = video;
      progressSamples = 0;
      const currentTime = Number(video?.currentTime);
      const decodedFrames = Number(
        video?.webkitDecodedFrameCount ||
          video?.getVideoPlaybackQuality?.()?.totalVideoFrames,
      );
      progressStartTime = Number.isFinite(currentTime) ? currentTime : null;
      progressStartDecoded = Number.isFinite(decodedFrames)
        ? decodedFrames
        : null;
      lastProgressTime = progressStartTime;
      lastProgressDecoded = progressStartDecoded;
    };

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
      clearPaintBoundary();
      resetProgressEvidence();
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

    const finishAfterPaint = (video) => {
      if (settled || presentationPending) return;
      presentationPending = true;
      const requestFrame = globalThis.requestAnimationFrame;
      if (typeof requestFrame !== "function") {
        done(true, video);
        return;
      }
      firstPaintFrame = requestFrame(() => {
        firstPaintFrame = null;
        if (settled) return;
        secondPaintFrame = requestFrame(() => {
          secondPaintFrame = null;
          done(true, video);
        });
      });
    };

    const noteProgressEvidence = (video) => {
      if (!video || settled || presentationPending) return;
      if (progressVideo !== video) {
        resetProgressEvidence(video);
        return;
      }
      const readyState = Number(video.readyState) || 0;
      const currentTime = Number(video.currentTime);
      const decodedFrames = Number(
        video.webkitDecodedFrameCount ||
          video.getVideoPlaybackQuality?.()?.totalVideoFrames,
      );
      const usable =
        !video.paused &&
        !video.ended &&
        !video.seeking &&
        readyState >= Math.max(2, minimumReadyState) &&
        Number(video.videoWidth) > 0;
      if (!usable) {
        resetProgressEvidence(video);
        return;
      }
      const timeAdvanced =
        Number.isFinite(currentTime) &&
        lastProgressTime != null &&
        currentTime > lastProgressTime;
      const decodedAdvanced =
        Number.isFinite(decodedFrames) &&
        lastProgressDecoded != null &&
        decodedFrames > lastProgressDecoded;
      if (!timeAdvanced && !decodedAdvanced) return;
      progressSamples += 1;
      if (Number.isFinite(currentTime)) lastProgressTime = currentTime;
      if (Number.isFinite(decodedFrames)) lastProgressDecoded = decodedFrames;
      const timeProgress =
        Number.isFinite(currentTime) && progressStartTime != null
          ? currentTime - progressStartTime
          : 0;
      const decodedProgress =
        Number.isFinite(decodedFrames) && progressStartDecoded != null
          ? decodedFrames - progressStartDecoded
          : 0;
      if (
        progressSamples >= 2 &&
        (timeProgress >= Math.max(0.05, minimumCurrentTime) ||
          decodedProgress >= Math.max(2, minimumDecodedFrames))
      ) {
        finishAfterPaint(video);
      }
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
        frameCallbackId = video.requestVideoFrameCallback(() => {
          frameCallbackId = null;
          if (visualReadiness) finishAfterPaint(video);
          else done(true, video);
        });
      }
      if (!eventBound) {
        eventBound = true;
        boundVideo = video;
        finish = () => {
          if (visualReadiness) noteProgressEvidence(video);
          else if (!strictReadiness) done(true, video);
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
      if (visualReadiness) {
        noteProgressEvidence(video);
        return;
      }
      const timeOk = video.currentTime >= minimumCurrentTime;
      const decodeOk = decoded >= minimumDecodedFrames;
      if (ready >= minimumReadyState && (timeOk || decodeOk)) {
        done(true, video);
      }
    }, 180);
    timeout = setTimeout(() => done(false), timeoutMs);
  });
}
