export function applyContainedVideoFit(videoElement) {
  if (!videoElement) return;
  videoElement.style.display = "block";
  videoElement.style.width = "100%";
  videoElement.style.height = "100%";
  videoElement.style.objectPosition = "center center";
  videoElement.style.objectFit = "contain";
}

export function attachContainedVideoFit(mediaRoot, retries = 12) {
  if (!mediaRoot) return;
  const video =
    mediaRoot.tagName?.toLowerCase() === "video"
      ? mediaRoot
      : mediaRoot.querySelector("video") ||
        mediaRoot.shadowRoot?.querySelector("video");
  if (video) {
    applyContainedVideoFit(video);
    return;
  }
  if (retries <= 0) return;
  setTimeout(() => attachContainedVideoFit(mediaRoot, retries - 1), 160);
}
