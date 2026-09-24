export function findFullscreenVideo(element) {
  if (!element) return null;
  if (element.tagName?.toLowerCase() === "video") return element;

  const direct = element.querySelector?.("video");
  if (direct) return direct;

  const hosts = element.querySelectorAll?.(
    "ha-camera-stream,ha-hls-player,webrtc-camera",
  );
  if (hosts?.length) {
    for (const host of hosts) {
      const video =
        host.shadowRoot?.querySelector?.("video") ||
        host.querySelector?.("video");
      if (video) return video;
    }
  }

  return element.shadowRoot?.querySelector?.("video") || null;
}

export function findVideoDeep(root, maxDepth = 7) {
  if (!root || maxDepth < 0) return null;
  if (root.tagName?.toLowerCase?.() === "video") return root;

  const direct = root.querySelector?.("video");
  if (direct) return direct;

  if (root.shadowRoot) {
    const shadowVideo = findVideoDeep(root.shadowRoot, maxDepth - 1);
    if (shadowVideo) return shadowVideo;
  }

  const children = root.children ? Array.from(root.children) : [];
  for (const child of children) {
    const video = findVideoDeep(child, maxDepth - 1);
    if (video) return video;
  }

  return null;
}

const isIosFullscreenPlatform = (navigatorObj) =>
  /iPad|iPhone|iPod/.test(String(navigatorObj?.userAgent || "")) ||
  (navigatorObj?.platform === "MacIntel" &&
    Number(navigatorObj?.maxTouchPoints) > 1);

export function requestMediaFullscreen({
  element = null,
  video = null,
  preferElementFullscreen = false,
  navigatorObj = globalThis.navigator,
  onBeginNativeVideoFullscreen = () => {},
  onBeginDocumentFullscreen = () => {},
  onRequestFailure = null,
} = {}) {
  if (!element) return false;

  const elementRequest =
    element.requestFullscreen || element.webkitRequestFullscreen;
  const useElementFullscreen =
    preferElementFullscreen === true && typeof elementRequest === "function";

  if (
    isIosFullscreenPlatform(navigatorObj) &&
    video &&
    !useElementFullscreen
  ) {
    const enterVideoFullscreen =
      video.webkitEnterFullscreen || video.webkitEnterFullScreen;
    if (typeof enterVideoFullscreen === "function") {
      onBeginNativeVideoFullscreen(video);
      try {
        enterVideoFullscreen.call(video);
        return true;
      } catch (_) {
        onRequestFailure?.();
      }
    }
  }

  let requestTarget = element;
  let request = elementRequest;
  if (!request && video) {
    requestTarget = video;
    request = video.requestFullscreen || video.webkitRequestFullscreen;
  }
  if (typeof request !== "function") return false;

  onBeginDocumentFullscreen(video);
  try {
    const result = request.call(requestTarget);
    if (typeof onRequestFailure === "function") {
      result?.catch?.(() => onRequestFailure());
    }
    return true;
  } catch (_) {
    onRequestFailure?.();
    return false;
  }
}

export function exitDocumentFullscreen(documentObj = globalThis.document) {
  const exit =
    documentObj?.exitFullscreen ||
    documentObj?.webkitExitFullscreen ||
    documentObj?.webkitCancelFullScreen;
  if (typeof exit !== "function") return false;
  try {
    const result = exit.call(documentObj);
    result?.catch?.(() => {});
    return true;
  } catch (_) {
    return false;
  }
}
