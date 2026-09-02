const escapeAttribute = (value) =>
  String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll('"', "&quot;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");

const THUMBNAIL_ERROR_HANDLER =
  "const fallback=this.getAttribute('data-thumb-fallback-src');" +
  "if(fallback&&this.getAttribute('data-thumb-fallback-attempted')!=='1'){" +
  "this.setAttribute('data-thumb-fallback-attempted','1');this.src=fallback;" +
  "}else{this.style.display='none';this.nextElementSibling.style.display='flex';}";

export function buildBrowseThumbnailImageMarkup({
  src = "",
  fallbackSrc = "",
  thumbId = "",
} = {}) {
  const primary = String(src || "");
  if (!primary) return "";
  const fallback = String(fallbackSrc || "");
  const fallbackAttribute =
    fallback && fallback !== primary
      ? ` data-thumb-fallback-src="${escapeAttribute(fallback)}"`
      : "";
  return `<img src="${escapeAttribute(primary)}" data-thumb-primary-src="${escapeAttribute(primary)}" data-thumb-id="${escapeAttribute(thumbId)}"${fallbackAttribute} loading="lazy" decoding="async" onerror="${THUMBNAIL_ERROR_HANDLER}">`;
}

const primarySource = (image) =>
  image?.getAttribute?.("data-thumb-primary-src") ||
  image?.getAttribute?.("src") ||
  "";

export function syncPreservedBrowseThumbnail(currentImage, nextImage) {
  if (!currentImage || !nextImage) return false;
  if (currentImage.dataset?.thumbId !== nextImage.dataset?.thumbId) {
    return false;
  }
  if (primarySource(currentImage) !== primarySource(nextImage)) return false;

  const currentFallback =
    currentImage.getAttribute?.("data-thumb-fallback-src") || "";
  const nextFallback =
    nextImage.getAttribute?.("data-thumb-fallback-src") || "";
  if (currentFallback === nextFallback) return true;

  currentImage.removeAttribute?.("data-thumb-fallback-attempted");
  if (nextFallback) {
    currentImage.setAttribute?.("data-thumb-fallback-src", nextFallback);
  } else {
    currentImage.removeAttribute?.("data-thumb-fallback-src");
  }

  const hidden = currentImage.style?.display === "none";
  const showingOldFallback =
    Boolean(currentFallback) &&
    currentImage.getAttribute?.("src") === currentFallback;
  if (nextFallback && (hidden || showingOldFallback)) {
    currentImage.setAttribute?.("data-thumb-fallback-attempted", "1");
    if (currentImage.style) currentImage.style.display = "";
    if (currentImage.nextElementSibling?.style) {
      currentImage.nextElementSibling.style.display = "none";
    }
    currentImage.setAttribute?.("src", nextFallback);
  } else if (!nextFallback && showingOldFallback) {
    if (currentImage.style) currentImage.style.display = "";
    if (currentImage.nextElementSibling?.style) {
      currentImage.nextElementSibling.style.display = "none";
    }
    currentImage.setAttribute?.("src", primarySource(nextImage));
  }

  return true;
}
