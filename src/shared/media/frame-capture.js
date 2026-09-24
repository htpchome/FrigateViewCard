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

export function resolveDisplayedFrameGeometry({
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
    return {
      sourceRect: { x: 0, y: 0, width, height },
      destinationRect: { x: 0, y: 0, width, height },
    };
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
  const rawObjectPositionX = Number(zoomState?.objectPositionX ?? 0.5);
  const rawObjectPositionY = Number(zoomState?.objectPositionY ?? 0.5);
  const objectPositionX = Number.isFinite(rawObjectPositionX)
    ? Math.min(1, Math.max(0, rawObjectPositionX))
    : 0.5;
  const objectPositionY = Number.isFinite(rawObjectPositionY)
    ? Math.min(1, Math.max(0, rawObjectPositionY))
    : 0.5;
  const renderedLeft =
    panX + (viewportW - fittedWidth) * objectPositionX * scale;
  const renderedTop =
    panY + (viewportH - fittedHeight) * objectPositionY * scale;
  const renderedWidth = fittedWidth * scale;
  const renderedHeight = fittedHeight * scale;
  const visibleLeft = Math.max(0, renderedLeft);
  const visibleTop = Math.max(0, renderedTop);
  const visibleRight = Math.min(viewportW, renderedLeft + renderedWidth);
  const visibleBottom = Math.min(viewportH, renderedTop + renderedHeight);
  if (visibleRight <= visibleLeft || visibleBottom <= visibleTop) return null;

  return {
    sourceRect: {
      x: ((visibleLeft - renderedLeft) / renderedWidth) * width,
      y: ((visibleTop - renderedTop) / renderedHeight) * height,
      width: ((visibleRight - visibleLeft) / renderedWidth) * width,
      height: ((visibleBottom - visibleTop) / renderedHeight) * height,
    },
    destinationRect: {
      x: visibleLeft,
      y: visibleTop,
      width: visibleRight - visibleLeft,
      height: visibleBottom - visibleTop,
    },
  };
}

export function resolveDisplayedFrameSourceRect(options = {}) {
  return resolveDisplayedFrameGeometry(options)?.sourceRect || null;
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

export const SAFARI_FRAME_DOWNLOAD_REVOKE_DELAY_MS = 1000;

export function downloadDisplayedFrame(
  blob,
  filename,
  {
    documentObj = globalThis.document,
    urlApi = globalThis.URL,
    schedule = globalThis.setTimeout,
    revokeDelayMs = 0,
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
    const safeRevokeDelayMs = Math.max(0, Number(revokeDelayMs) || 0);
    schedule?.(
      () => urlApi.revokeObjectURL?.(objectUrl),
      safeRevokeDelayMs,
    );
  }
}

export class DisplayedFrameCaptureController {
  constructor({
    resolveButton = () => null,
    resolveSurface = () => null,
    resolveMedia = () => null,
    resolveZoomController = () => null,
    captureGroupedFrame = async () => null,
    resolveCamera = () => "camera",
    isSafari = () => false,
    resolveResultLabel = (success) => ({
      localizationKey: "",
      text: success ? "Snapshot saved" : "Snapshot failed",
    }),
    onShowControls = () => {},
    captureFrame = captureDisplayedFrame,
    downloadFrame = downloadDisplayedFrame,
    buildFilename = buildDisplayedFrameFilename,
    getComputedStyle = (media) =>
      globalThis.getComputedStyle?.(media) || null,
    createElement = (tagName) => globalThis.document?.createElement?.(tagName),
    schedule = (callback, delayMs) =>
      globalThis.setTimeout(callback, delayMs),
    cancelSchedule = (timer) => globalThis.clearTimeout(timer),
    resultDurationMs = 1800,
    warn = () => {},
  } = {}) {
    this._resolveButton = resolveButton;
    this._resolveSurface = resolveSurface;
    this._resolveMedia = resolveMedia;
    this._resolveZoomController = resolveZoomController;
    this._captureGroupedFrame = captureGroupedFrame;
    this._resolveCamera = resolveCamera;
    this._isSafari = isSafari;
    this._resolveResultLabel = resolveResultLabel;
    this._onShowControls = onShowControls;
    this._captureFrame = captureFrame;
    this._downloadFrame = downloadFrame;
    this._buildFilename = buildFilename;
    this._getComputedStyle = getComputedStyle;
    this._createElement = createElement;
    this._schedule = schedule;
    this._cancelSchedule = cancelSchedule;
    this._resultDurationMs = resultDurationMs;
    this._warn = warn;
    this._resultTimers = new Map();
  }

  media(scope = "live") {
    return this._resolveMedia(scope);
  }

  captureOptions(scope, media) {
    const zoomController = this._resolveZoomController(scope);
    const activeZoomController =
      zoomController?.video === media ? zoomController : null;
    const computedStyle = this._getComputedStyle(media);
    return {
      viewport: activeZoomController?.viewport || null,
      zoomState: activeZoomController?.state || null,
      objectFit:
        computedStyle?.objectFit || media?.style?.objectFit || "contain",
    };
  }

  showResult(scope, success) {
    const surface = this._resolveSurface(scope);
    if (!surface) return;
    surface.querySelector?.(".snapshot-result-bubble")?.remove?.();
    const bubble = this._createElement("div");
    if (!bubble) return;
    const { localizationKey = "", text = "" } =
      this._resolveResultLabel(success) || {};
    bubble.className = `snapshot-result-bubble ${success ? "success" : "failure"}`;
    if (localizationKey) {
      bubble.setAttribute?.("data-fvc-i18n", localizationKey);
    }
    bubble.textContent = text;
    surface.appendChild?.(bubble);

    const previousTimer = this._resultTimers.get(scope);
    if (previousTimer) this._cancelSchedule(previousTimer);
    const timer = this._schedule(() => {
      bubble.remove?.();
      if (this._resultTimers.get(scope) === timer) {
        this._resultTimers.delete(scope);
      }
    }, this._resultDurationMs);
    this._resultTimers.set(scope, timer);
  }

  async capture(scope = "live") {
    const button = this._resolveButton(scope);
    if (button?.disabled) return false;
    if (button) button.disabled = true;
    try {
      const groupedBlob = await this._captureGroupedFrame(scope);
      const media = groupedBlob ? null : this.media(scope);
      if (!groupedBlob && !media) {
        throw new Error("Displayed media frame is not ready.");
      }
      const blob =
        groupedBlob ||
        (await this._captureFrame(media, this.captureOptions(scope, media)));
      this._downloadFrame(
        blob,
        this._buildFilename({ camera: this._resolveCamera(scope) }),
        {
          revokeDelayMs: this._isSafari()
            ? SAFARI_FRAME_DOWNLOAD_REVOKE_DELAY_MS
            : 0,
        },
      );
      this.showResult(scope, true);
      return true;
    } catch (error) {
      this._warn(error);
      this.showResult(scope, false);
      return false;
    } finally {
      if (button) button.disabled = false;
      this._onShowControls(scope);
    }
  }

  dispose() {
    for (const timer of this._resultTimers.values()) {
      if (timer) this._cancelSchedule(timer);
    }
    this._resultTimers.clear();
  }
}
