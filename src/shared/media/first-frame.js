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
