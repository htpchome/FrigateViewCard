const positiveNumber = (value) => {
  const number = Number(value);
  return Number.isFinite(number) && number > 0 ? number : 0;
};

export function resolveDisplayedFrameDimensions(media) {
  return {
    width: positiveNumber(media?.videoWidth || media?.naturalWidth),
    height: positiveNumber(media?.videoHeight || media?.naturalHeight),
  };
}

export function resolveDisplayedFrameSourceRect({
  sourceWidth,
  sourceHeight,
  viewportWidth,
  viewportHeight,
  objectFit = "contain",
  zoomState = null,
} = {}) {
  const width = positiveNumber(sourceWidth);
  const height = positiveNumber(sourceHeight);
  if (!width || !height) return null;

  const viewportW = positiveNumber(viewportWidth);
  const viewportH = positiveNumber(viewportHeight);
  if (!viewportW || !viewportH) {
    return { x: 0, y: 0, width, height };
  }

  const fit = String(objectFit || "contain").toLowerCase();
  const fitScale =
    fit === "cover"
      ? Math.max(viewportW / width, viewportH / height)
      : Math.min(viewportW / width, viewportH / height);
  const fittedWidth = width * fitScale;
  const fittedHeight = height * fitScale;
  const scale = Math.max(1, Number(zoomState?.scale) || 1);
  const panX = Number(zoomState?.x) || 0;
  const panY = Number(zoomState?.y) || 0;
  const renderedLeft = panX + ((viewportW - fittedWidth) / 2) * scale;
  const renderedTop = panY + ((viewportH - fittedHeight) / 2) * scale;
  const renderedWidth = fittedWidth * scale;
  const renderedHeight = fittedHeight * scale;
  const visibleLeft = Math.max(0, renderedLeft);
  const visibleTop = Math.max(0, renderedTop);
  const visibleRight = Math.min(viewportW, renderedLeft + renderedWidth);
  const visibleBottom = Math.min(viewportH, renderedTop + renderedHeight);
  if (visibleRight <= visibleLeft || visibleBottom <= visibleTop) return null;

  return {
    x: ((visibleLeft - renderedLeft) / renderedWidth) * width,
    y: ((visibleTop - renderedTop) / renderedHeight) * height,
    width: ((visibleRight - visibleLeft) / renderedWidth) * width,
    height: ((visibleBottom - visibleTop) / renderedHeight) * height,
  };
}

export async function captureDisplayedFrame(
  media,
  {
    documentObj = globalThis.document,
    viewport = null,
    objectFit = "contain",
    zoomState = null,
    mimeType = "image/jpeg",
    quality = 0.92,
  } = {},
) {
  const source = resolveDisplayedFrameDimensions(media);
  if (!source.width || !source.height) {
    throw new Error("Displayed media frame is not ready.");
  }

  const parent = media?.parentElement || null;
  const sourceRect = resolveDisplayedFrameSourceRect({
    sourceWidth: source.width,
    sourceHeight: source.height,
    viewportWidth:
      positiveNumber(viewport?.width) ||
      positiveNumber(parent?.clientWidth) ||
      positiveNumber(media?.clientWidth),
    viewportHeight:
      positiveNumber(viewport?.height) ||
      positiveNumber(parent?.clientHeight) ||
      positiveNumber(media?.clientHeight),
    objectFit,
    zoomState,
  });
  if (!sourceRect) throw new Error("Displayed media frame is not visible.");

  const canvas = documentObj?.createElement?.("canvas");
  const context = canvas?.getContext?.("2d");
  if (!canvas || !context) {
    throw new Error("Snapshot capture is not supported in this browser.");
  }
  canvas.width = Math.max(1, Math.round(sourceRect.width));
  canvas.height = Math.max(1, Math.round(sourceRect.height));
  context.drawImage(
    media,
    sourceRect.x,
    sourceRect.y,
    sourceRect.width,
    sourceRect.height,
    0,
    0,
    canvas.width,
    canvas.height,
  );

  return await new Promise((resolve, reject) => {
    if (typeof canvas.toBlob !== "function") {
      reject(new Error("Snapshot encoding is not supported in this browser."));
      return;
    }
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error("The displayed frame could not be encoded."));
      },
      mimeType,
      quality,
    );
  });
}

export function buildDisplayedFrameFilename({
  camera = "camera",
  capturedAt = new Date(),
} = {}) {
  const safeCamera =
    String(camera || "camera")
      .trim()
      .replace(/[^a-z0-9._-]+/gi, "-")
      .replace(/^-+|-+$/g, "") || "camera";
  const date = capturedAt instanceof Date ? capturedAt : new Date(capturedAt);
  const safeDate = Number.isFinite(date.getTime()) ? date : new Date();
  const timestamp = safeDate
    .toISOString()
    .replace(/\.\d{3}Z$/, "Z")
    .replace(/:/g, "-");
  return `${safeCamera}_${timestamp}.jpg`;
}

export function downloadDisplayedFrame(
  blob,
  filename,
  {
    documentObj = globalThis.document,
    urlApi = globalThis.URL,
    schedule = globalThis.setTimeout,
  } = {},
) {
  if (!blob || typeof urlApi?.createObjectURL !== "function") {
    throw new Error("Snapshot download is not supported in this browser.");
  }
  const objectUrl = urlApi.createObjectURL(blob);
  const anchor = documentObj?.createElement?.("a");
  if (!anchor) {
    urlApi.revokeObjectURL?.(objectUrl);
    throw new Error("Snapshot download is not supported in this browser.");
  }
  anchor.href = objectUrl;
  anchor.download = String(filename || "snapshot.jpg");
  documentObj.body?.appendChild?.(anchor);
  try {
    anchor.click();
  } finally {
    anchor.remove?.();
    schedule?.(() => urlApi.revokeObjectURL?.(objectUrl), 0);
  }
}
